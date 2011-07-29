function MultiSelectFilter( variable, value, options ) {
	AbstractFilter.call( this, variable );
	
	this.select = MultiSelect.fromObject(options);
	
	if( value != null ) {
		this.select.select(value);
	}
	
	this.node.appendChild(this.select.node);
}

MultiSelectFilter.prototype = new AbstractFilter();
MultiSelectFilter.prototype.select = null;

MultiSelectFilter.prototype.getArgumentString = function() {
	return this.variable+".ba."+this.select.getValue()+";";
};