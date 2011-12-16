/**
 * @constructor
 * @param className
 * @param methodName
 * @returns {NotImplementedException}
 */
function NotImplementedException ( className, methodName ) {
	Error.call( this );
	this.message = "Called abstract method " + className + "::" + methodName;
	this.name = "NotImplementedException";
}

NotImplementedException.prototype = new Error;