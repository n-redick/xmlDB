function SingleSelectFilter( variable, value, options ) {
	AbstractFilter.call( this, variable );
	
	this.select = SingleSelect.fromObject(options);
	
	if( value != null ) {
		this.select.select(value);
	}
	
	this.node.appendChild(this.select.node);
}

SingleSelectFilter.prototype = new AbstractFilter();
SingleSelectFilter.prototype.select = null;

SingleSelectFilter.prototype.getArgumentString = function() {
	return this.variable+".eq."+this.select.getValue()+";";
};