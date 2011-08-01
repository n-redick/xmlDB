/**
 * @param {ListGui} gui
 * @returns {List}
 */
function List(  gui, filterData, staticVariables, order ) {
	this.eventMgr = new EventManager(['update','show_tooltip', 'hide_tooltip', 'move_tooltip', 'click']);
	this.filterMgr = new FilterManager(); 
	this.gui = gui;
	
	this.order = order;
	
	//
	// necessary for inheritance prototype constructor 
	// ( e.g. ItemList.prototype = new List )
	if( gui ) {
		gui.addListener( 'search', new Handler( this.update, this ) );
		gui.addListener( 'next_page', new Handler( this.nextPage, this ) );
		gui.addListener( 'prev_page', new Handler( this.prevPage, this ) );
		gui.addListener( 'change_order', new Handler( this.setOrder, this ) );
		

		gui.addPropagator( 'show_tooltip', this.eventMgr );
		gui.addPropagator( 'hide_tooltip', this.eventMgr );
		gui.addPropagator( 'move_tooltip', this.eventMgr );
		gui.addPropagator( 'click', this.eventMgr );
		
		gui.addListener( 'add_custom_filter', new Handler( this.addCustomFilter, this ) );
		gui.addListener( 'remove_custom_filter', new Handler( this.removeCustomFilter, this ) );
		

		this.filterMgr.set( 
				filterData, 
				staticVariables 
		);
		this.set("", "", "", 1);
		
	}
	
}

List.ORDER_DESC = 0;
List.ORDER_ASC = 1;

List.toPlainFilterData = function( categorisedFilterData ) {
	var ds = [];
	for( var k in categorisedFilterData ) {
		//
		// filter data
		for( var i in categorisedFilterData[k] ) {
			ds[categorisedFilterData[k][i].variable] = categorisedFilterData[k][i];
		}
	}
	return ds;
};

List.toCategories = function( categorisedFilterData ) {
	var cs = new Object();
	for( var k in categorisedFilterData ) {
		cs[k] = [];
		for( var i in categorisedFilterData[k] ) {
			cs[k].push( categorisedFilterData[k][i].variable );
		}
	}
	return cs;
};

List.prototype = {
	eventMgr: null,
	page: 1, maxPage: 0, 
	filterMgr: null, 
	gui: null,
	order: "", orderDirection: List.ORDER_DESC,
	addListener: function( event, handler ) {
		this.eventMgr.addListener(event, handler);
	},
	setMaxPage: function( maxPage ) {
		this.maxPage = maxPage;
		this.gui.updatePages( this.page, this.maxPage);
	},
	nextPage: function() {
		this.__setPage( this.page + 1 );
	},
	prevPage: function() {
		this.__setPage( this.page - 1 );
	},
	__setPage: function( page ) {
		if( page < 0 || page > this.maxPage ) {
			return;
		}
		
		this.page = page;
		
		this.gui.updatePages( this.page, this.maxPage);
		
		this.__update();
	},
	update: function() {
		this.__setPage(1);
		this.__update();
	},
	setOrder: function( order ) {
		if( this.order == order ) {
			this.orderDirection = this.orderDirection == List.ORDER_DESC ? List.ORDER_ASC : List.ORDER_DESC;
		}
		else {
			this.order = order;
		}
		this.__update();
	},
	__update: function() {
		this.eventMgr.fire('update', [this]);
		
		this.gui.showLoading();
	},
	getArgumentString: function()  {
		return this.filterMgr.getArgumentString();
	},
	set: function( args, flags, order, page ) {
		
		this.page = page;
		
		this.gui.updatePages(this.page, this.maxPage);
		
		this.gui.setOrder(this.order, this.orderDirection);
		
		this.filterMgr.setArgumentString(args);
		
		this.gui.updateFilter( 
			this.filterMgr.getStaticFilters(), 
			this.filterMgr.getCustomFilters(), 
			this.filterMgr.getCustomFilterOptions() 
		);

//		this.gui.updateFilter( this.filterMgr );
	},
	/**
	 * @param variable
	 * @param {CustomFilter} cf
	 */
	addCustomFilter: function( variable, cf ) {
		cf.setFilter( this.filterMgr.getCustomFilter(variable) );
	},
	removeCustomFilter: function( filter ) {
		this.filterMgr.removeCustomFilter(filter);
	},
	setData: function( data ) {
		
		this.gui.setOrder(this.order, this.orderDirection);
		
		if( data.length < 2 ) {
			this.gui.setContent(null);
			this.setMaxPage(0);
		}
		else {
			this.setMaxPage( Math.ceil( data[0][0]/data[0][1] ) );
			this.gui.deserialize( data );
		}
	}
};