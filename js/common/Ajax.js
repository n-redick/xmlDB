var Ajax = {};

/**
 * @param {string} url
 * @returns {boolean}
 */
Ajax.isValidURL = function( url )
{
	return (url?true:false);
};

/**
 * @param {string} url
 * @param {Handler} handler
 * @param {Array} args
 */
Ajax.request = function( url , handler , args ) 
{
	Ajax.__do( url , handler , args , true);
};

/**
 * @param {string} url
 * @param {Handler} handler
 * @param {Array} args
 */
Ajax.get = function( url , handler , args )
{
	Ajax.__do( url , handler , args , false);
};

/**
 * @param {string} url
 * @param {Handler} handler
 * @param {Array} args
 * @param {boolean} callbackOnError
 */
Ajax.__do = function( url , handler , args , callbackOnError)
{
	var request = Ajax.getRequestObject();
	
	if( ! Ajax.isValidURL( url ))
	{
		throw new InvalidURLException( url );
	}
	
	if( ! args )
	{
		args = [];
	}
	
	if( -1 == url.search(/\?/) ) {
		url += "?_=" + new Date().getTime();
	}
	else {
		url += "&_=" + new Date().getTime();
	}
	
	request.open('GET', url , true);
	
	if ( handler ) {
		request.onreadystatechange = function() {
			Ajax.defaultCallbackHandler( this, handler, args, callbackOnError );
		};
	}
	else 
	{
		request.onreadystatechange = function(){};
	}
	
	request.setRequestHeader("Content-Type","application/x-www-form-urlencoded; Charset=utf-8");		
	request.send(null);
};

/**
 * @private
 * @param {XMLHttpRequest} response
 * @param {Handler} handler
 * @param {Array} args
 * @param {boolean} callbackOnError
 */
Ajax.defaultCallbackHandler = function( response, handler, args , callbackOnError )
{
	if( response.readyState == 4 )
	{	
		if ( !callbackOnError && response.status == 200) 
		{
			var error = response.getResponseHeader("error");
			if( !error )
			{
				args.splice(0, 0, eval( '(' + response.responseText + ')' ));
				handler.notify(args);
			}
			else
			{
				throw new GenericAjaxException( error );
			}
		}
		else if( callbackOnError )
		{

			args.splice(0, 0, response);
			handler.notify(args);
		}
		else
		{
			throw new BadResponseException( response );
		}
	}
};

/**
 * @return {XMLHttpRequest}
 */
Ajax.getRequestObject = function()
{
	var request = null;
	if (window.XMLHttpRequest) {
	  // If IE7, Mozilla, Safari, and so on: Use native object.
	  request = new XMLHttpRequest();
	}
	else {
	  if (window.ActiveXObject) {
		  // ...otherwise, use the ActiveX control for IE5.x and IE6.
		  request = new ActiveXObject('MSXML2.XMLHTTP.3.0');
	  }
	  else {
	  	throw XMLHttpException();
	  }
	}
	return request;
};

/**
 * @constructor
 * @param url
 * @returns {InvalidURLException}
 */
function InvalidURLException ( url ) {
	this.url = url;
}
InvalidURLException.prototype = {
	url : null
};
/**
 * @constructor
 * @param {XMLHttpRequest} response
 * @returns {BadResponseCodeException}
 */
function BadResponseException( response ) {
	this.response = response;
}
BadResponseException.prototype = {
	response : null
};
/**
 * @constructor
 * @returns {XMLHttpException}
 */
function XMLHttpException() {
}
/**
 * @constructor
 * @param {string} message
 * @returns {GenericAjaxException}
 */
function GenericAjaxException( message ) {
	this.message = message;
}
GenericAjaxException.prototype = {
	message : null,
	toString: function() {
		return this.message;
	}
};