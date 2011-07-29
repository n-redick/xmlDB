function AbstractFilter( variable ) {
	this.variable = variable;
	this.node = document.createElement("div");
}

AbstractFilter.OPERATOR_OPTIONS_NUMERIC = [['gt','&gt;'],['ge','&ge;'],['lt','&lt;'],['le','&le;'],['eq','=']];
AbstractFilter.OPERATOR_OPTIONS_STRING = [['wlike','is']];
AbstractFilter.OPERATOR_OPTIONS_NUMERIC_EUQAL = [['eq','=']];

AbstractFilter.prototype.node = null;
AbstractFilter.prototype.variable;

AbstractFilter.prototype.getOperatorSelect = function( valueType ) {
	var tmp;
	switch( valueType ) {
	case InputFilterData.TYPE_STRING_SIMPLE:
		tmp = new SingleSelect(AbstractFilter.OPERATOR_OPTIONS_STRING);
		tmp.node.style.display = "none";
		break;
	case InputFilterData.TYPE_NUMERIC_EUQAL:
		tmp = new SingleSelect(AbstractFilter.OPERATOR_OPTIONS_NUMERIC_EUQAL);
		tmp.node.style.display = "none";
		break;
	case InputFilterData.TYPE_NUMERIC:
		tmp = new SingleSelect(AbstractFilter.OPERATOR_OPTIONS_NUMERIC);
	default:
		throw new Error("Unable to create operator select for "+valueType+"!");
	}
	return tmp;
};
/**
 * @returns {string}
 */
AbstractFilter.prototype.getArgumentString = function() {
	throw new CalledAbstractMethodException( "AbstractFilter", "getArgumentString");
};
