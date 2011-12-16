/**
 * @constructor
 * @returns {SimpleUserControl}
 */
function SimpleUserControl() {/**/}

SimpleUserControl.prototype = {
	/**
	 * @type {HTMLDivElement}
	 */
	node: null,
	/**
	 * @returns {any}
	 */
	getValue: function(){throw new NotImplementedException('SimpleUserControl','getValue');},
	/**
	 * @param {any} value
	 */
	setValue: function(value){throw new NotImplementedException('SimpleUserControl','setValue');}
};