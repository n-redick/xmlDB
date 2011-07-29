/**
 * @param filterData
 * @param {ListGui} gui
 * @returns {List}
 */
function List( filterData, gui ) {

	this.eventMgr = new EventManager(['update']);
	this.filterMgr = new FilterManager(filterData); 
	this.gui = gui;
	
	//
	// necessary for inheritance prototype constructor 
	// ( e.g. ItemList.prototype = new List )
	if( gui ) {
		gui.detachAllListeners();
		gui.addListener( 'search', new Handler( this.update, this ) );
	}
}

List.ORDER_DESC = 0;
List.ORDER_ASC = 1;

List.prototype = {
	eventMgr: null,
	page: 0, maxPage: 0, 
	filterMgr: null, 
	gui: null,
	order: "", orderDirection: List.ORDER_DESC,
	addListener: function( event, handler ) {
		this.eventMgr.addListener(event, handler);
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
		
		this.eventMgr.fire('update', [this]);
	},
	update: function() {
		this.__update(1);
	},
	order: function( order ) {
		if( this.order == order ) {
			this.orderDirection = this.orderDirection == List.ORDER_DESC ? List.ORDER_ASC : List.ORDER_DESC;
		}
		else {
			this.order = order;
		}
		this.__update(this.page);
	},
	__update: function( page ) {
		this.eventMgr.fire('update', [this]);
		
		this.gui.showLoading();
	},
	getArgumentString: function()  {
		return this.filterMgr.getArgumentString();
	},
	setArgumentString: function( str ) {
		this.filterMgr.setArgumentString(str);

		this.gui.updateFilter( this.filterMgr );
	}
};