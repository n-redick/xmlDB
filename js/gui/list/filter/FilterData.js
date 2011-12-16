/**
 * @constructor
 * @param variable
 * returns {FilterData}
 */
function FilterData( name, variable ) {
	this.variable = variable;
	this.name = name;
}
FilterData.prototype = {
	variable: "", name: "",
	show: true,
	/**
	 * @param operator
	 * @param value
	 * @returns {AbstractFilter}
	 */
	getFilter: function( operator, value ) {
		throw new NotImplementedException("FilterData", "getFilter");
	}
};

/**
 * @constructor
 * @param variable
 * returns {InputFilterData}
 */
function InputFilterData( name, variable, expectedValueType ) {
	FilterData.call( this, name, variable );
	this.expectedValueType = expectedValueType;
} 
InputFilterData.TYPE_NUMERIC = 0;
InputFilterData.TYPE_NUMERIC_EUQAL = 1;
InputFilterData.TYPE_STRING_SIMPLE = 2;
InputFilterData.prototype = new FilterData();
InputFilterData.prototype.expectedValueType = InputFilterData.TYPE_NUMERIC;
/**
 * @returns {AbstractFilter}
 */
InputFilterData.prototype.getFilter = function( operator, value ) {
	return new InputFilter( this.name, this.variable, operator, value, this.expectedValueType);
};
/**
 * @constructor
 * @param variable
 * returns {RangeInputFilterData}
 */
function RangeInputFilterData( name, variable ) {
	FilterData.call( this, name, variable );
} 
RangeInputFilterData.prototype = new FilterData();
/**
 * @returns {AbstractFilter}
 */
RangeInputFilterData.prototype.getFilter = function( operator, value ) {
	return new RangeInputFilter( this.name, this.variable, value);
};
/**
 * @constructor
 * @param variable
 * @param options
 * @returns {SingleSelectFilterData}
 */
function SingleSelectFilterData( name, variable, options ) {
	FilterData.call( this, name, variable );
	this.options = options;
}
SingleSelectFilterData.prototype = new FilterData();
SingleSelectFilterData.prototype.options = null;
/**
 * @returns {AbstractFilter}
 */
SingleSelectFilterData.prototype.getFilter = function( operator, value ) {
	return new SingleSelectFilter( this.name, this.variable, value, this.options);
};
/**
 * @constructor
 * @param variable
 * @param options
 * @returns {MultiSelectFilterData}
 */
function MultiSelectFilterData( name, variable, options ) {
	FilterData.call( this, name, variable );
	this.options = options;
}
MultiSelectFilterData.prototype = new FilterData();
MultiSelectFilterData.prototype.options = null;
/**
 * @returns {AbstractFilter}
 */
MultiSelectFilterData.prototype.getFilter = function( operator, value ) {
	return new MultiSelectFilter( this.name, this.variable, value, this.options);
};