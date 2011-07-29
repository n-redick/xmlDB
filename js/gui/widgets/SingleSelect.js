/**
 * @constructor
 * @param {Array} show
 * @returns {SingleSelect}
 */
function SingleSelect( show ) {
	this.node = document.createElement("select");
	this.node.className = 'single_select';
	this.set(show);
}

/**
 * @param obj
 * @returns {SingleSelect}
 */
SingleSelect.fromObject = function( obj ) {
	var show = [];
	var n = 0;
	for( var k in obj ) {
		show[n++] = [obj[k],k]; 
	}
	return new SingleSelect(show);
};

SingleSelect.prototype = {
	node: null, options: [],
	setName: function( name ) {
		this.node.name = name;
	},
	set: function( show ) {
		var i;
		this.options  = [];
		while( this.node.firstChild ) {
			this.node.removeChild( this.node.firstChild );
		}
		for( i = 0; i < show.length; i++ ) {
			this.options[i] = document.createElement("option");
			this.options[i].value = show[i][0];
			this.options[i].innerHTML = show[i][1];
			this.node.appendChild(this.options[i]);
		}
	},
	select: function( value ) {
		for( var i = 0; i < this.options.length; i++ ) {
			this.options[i].selected = (this.options[i].value == value)!=0;
		}
	},
	
	getSelected: function() {
		return this.node.selectedIndex;
	},
	
	getValue: function() {
		return this.node.options[this.node.selectedIndex].value;
	}
};