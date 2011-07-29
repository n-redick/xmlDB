/**
 * @param {List} list
 * @returns {ListGui}
 */
function ListGui( list ) {
	this.list = list;
	this.eventMgr = new EventManager(['search']);
	//
	//	Layout
	//
	this.node = document.createElement("div");
	this.node.className = 'li_p';
	
	this.filterCollapsable = new Collapsable();
	
	this.filterParent = document.createElement("div");
	this.filterParent.className = 'li_filter_p';	
	
	this.node.appendChild(this.filterParent);
	
	this.filterCollapsable.header.className = 'li_fc_header';
	this.filterCollapsable.content.className = 'li_fc_content';
	
	this.filterCollapsable.header.innerHTML = "<a href='javascript:'>Filter</a>";
	this.filterParent.appendChild(this.filterCollapsable.node);
	
	this.content = document.createElement("div");
	this.content.className = 'li_content';
	
	this.node.appendChild(this.content);
	
	//
	//	Filter
	//
	
	this.form = document.createElement("form");
	this.form.action = "javascript:";
	this.form.onsubmit = "return false";
	this.filterCollapsable.content.appendChild( this.form );
	
	this.filterBtn = document.createElement("input");
	this.filterBtn.type = "submit";
	this.filterBtn.className = "button";
	this.filterBtn.value = "Search";
	
	Tools.jsCssClassHandler( this.filterBtn, { 'default': "button button_light li_filter_search_btn", 'focus': "button_light_hover", 'hover': "button_light_hover"});
	
	Listener.add( this.form, "submit", this.eventMgr.fire, this.eventMgr, ['search',[]] );
}


/**
 * @param {string} label
 * @param {string} variable
 * @param {StaticGrid} inputGrid
 * @param {FilterManager} filterMgr
 */
ListGui.addToInputGrid = function( label, variable, inputGrid, filterMgr ) {
	try {
		var nameFilters = filterMgr.getFiltersByVariable(variable);
		var r = inputGrid.addRow();
		
		inputGrid.cells[r][0].innerHTML = label;
		inputGrid.cells[r][0].className = "li_filter_ig_label";
		inputGrid.cells[r][1].appendChild(nameFilters[0].node);
		inputGrid.cells[r][1].className = "li_filter_ig_input";
	}
	catch( e ) {
		Tools.rethrow(e);
	}
};

ListGui.prototype = {
	eventMgr: null,
	node: null, content: null, filterParent: null, filterCollapsable: null, filterBtn: null, list: null,
	inputGrid: null, form: null,
	addListener: function( event, handler ) {
		this.eventMgr.addListener( event, handler);
	},
	detachAllListeners: function( ) {
		this.eventMgr.detachAllListeners();
	},
	updateFilter: function( filterMgr ) {

		var inputGrid = new StaticGrid( 0, 2 );
		inputGrid.node.cellSpacing = "2px";
		
		inputGrid.node.className = 'li_filter_input_grid';
		
		this.form.innerHTML = "";
		
		ListGui.addToInputGrid( "Name", 'name', inputGrid, filterMgr );
		ListGui.addToInputGrid( "Item Level", 'level', inputGrid, filterMgr );
		
		this.form.appendChild( inputGrid.node );
		
		this.form.appendChild( this.filterBtn );
	},
	showLoading: function() {
		this.content.innerHTML = "<div class='li_loading'>"+locale['L_Loading']+"</div>";
		this.disableSearchBtn(true);
	},
	disableSearchBtn: function( b ) {
		this.filterBtn.disabled = b ? "disabled" : "";
	},
	setContent: function( node ) {
		if( node == null ) {
			this.content.innerHTML = "<div class='il_nothing'>Nothing Found</div>";
		}
		else {
			Tools.setChild(this.content, node);
		}
		this.disableSearchBtn(false);
	},
	showFilter: function( b ) {
		if( b ) {
			this.filterCollapsable.expand();
		}
		else {
			this.filterCollapsable.collapse();
		}
	}
};