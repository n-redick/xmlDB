function FilterManager( data ) {
	this.filters = [];
	this.data = data;
}

FilterManager.prototype = {
	data: [],
	filters: [],
	getFiltersByVariable: function( variable ) {
		var fs = [];
		
		for( var i=0; i<this.filters.length; i++ ) {
			if( this.filters[i].variable == variable ) {
				fs.push( this.filters[i] );
			}
		}
		
		if( fs.length < 1 ) {
			if( this.data ) {
				for( var j=0; j<this.data.length; j++ ) {
					if( this.data[j].variable == variable ) {
						var f = this.data[j].getFilter();
						this.filters.push(f);
						return [f];
					}
				}
			}
			throw new Error("No filters with name "+name);
		}
		
		return fs;
	},
	showFilter: function( variable, show ) {
		for( var i=0; i<this.filters.length; i++ ) {
			if( this.filters[i].variable == name ) {
				this.filters[i].show = show;
			}
		}
	},
	setArgumentString: function( str ) {
		
		var arg, match;
		
		this.filters = [];
		
		while( (match = (/(^|;)([^;]+;)/).exec( str )) != null ) {
			
			arg = (/^(\w+)\.(\w+)\.([^;]+);/).exec( match[2] );
			
			if( arg ) {
		
				this.__createFilter( arg[1], arg[2], arg[3] );
				
			}
			str = str.replace( match[0], match[1]);
			continue;
		}
	},
	getArgumentString: function() {
		var str = "";
		for( var i=0; i<this.filters.length; i++ ) {
			str += this.filters[i].getArgumentString();
		}
		return str;
	},
	__createFilter: function( variable, operator, value ) {
		var data = null;
		
		for( var i=0; i<this.data.length; i++ ) {
			if( this.data[i].variable == variable ) {
				data = this.data[i];
				break;
			}
		}
		
		if( data == null ) {
			throw new Error("Unable to find filter data for "+variable+" (with "+operator+" "+value+")!");
		}
		
		this.filters.push(
			data.getFilter( operator, value )
		);
	},
	addCustomFilter: function( variable ) {
		this.__createFilter(variable, null, null);
	}
};

