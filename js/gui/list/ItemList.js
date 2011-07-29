function ItemList() {
	
	var filterData = [
		new InputFilterData( 'name', InputFilterData.TYPE_STRING_SIMPLE ),
		new RangeInputFilterData( 'level' )
	];
//	
//	var deserializer = new ItemListDeserializer();
//	var backEnd = new ListBackEndProxy("php/interface/get_items.php"); 
	
	List.call( 
		this,
		filterData,
		new ListGui(this)
	);
	
	this.order = ItemList.ORDER_ILVL;
	
	this.eventMgr.registerEvents(['show_tooltip', 'hide_tooltip', 'move_tooltip', 'click']);
}

ItemList.ORDER_NAME = 'name';
ItemList.ORDER_ILVL = 'level';
ItemList.ORDER_TYPE = 'itemclass';
ItemList.ORDER_DPS =  'dps';
ItemList.ORDER_SPEED = "delay";
ItemList.ORDER_SLOT = "slot";
ItemList.ORDER_SCORE = "weightedscore";


ItemList.prototype = new List();
ItemList.prototype.staticLinks = false;
ItemList.prototype.addListener= function( event, handler ) {
	this.eventMgr.addListener(event, handler);
};
ItemList.prototype.showStaticLinks = function( b ) {
	this.staticLinks = b;
};

function ItemListDeserializer() {
	AbstractDeserializer.call( this );
}

ItemListDeserializer.prototype = new AbstractDeserializer();
/**
 * @param {ItemList} list
 * @param data
 */
ItemListDeserializer.prototype.deserialize = function( list, data ) {
	var i;
	var tmp;
	var a, span;
	var grid;
	var column = 0;
	var cellStyle;
	
	if( ! (list instanceof ItemList ) ) {
		throw new Error("Expecting an instance of ItemList, found "+list+"!");
	}
	
	//var cmpItemScore = this.compareItem ? this.compareItem.getStatWeightBasedScore( this.statWeights ) : 0;
	if( data.length < 2 ) {
		list.gui.setContent(null);
	}
	else {
		grid = new StaticGrid(
				data.length,
				5 /*+ ( this.showDps ? 2 : 0 ) + ( this.isStatWeightBasedScoreShown() ? 1 : 0 ) */
			);
		grid.node.cellSpacing = "0px";
		grid.node.width = "100%";
		grid.node.className = "li_content_t";
		grid.rows[0].className = "il_header";
		//
		//this.updatePages( Math.ceil( data[0][0]/data[0][1] ) );
		
		grid.cols[0].width = "32px";
		
		// skip icon
		column++;
		grid.cells[0][column++].appendChild(this.getSortLink('Name',ItemList.ORDER_NAME));
		
//		if( this.showDps ) {
//			grid.cells[0][column++].appendChild(this.getSortLink('DpS',ItemList.ORDER_DPS));
//			grid.cells[0][column++].appendChild(this.getSortLink('Spd',ItemList.ORDER_SPEED));
//		}
		
		grid.cells[0][column++].appendChild(this.getSortLink('iLvl',ItemList.ORDER_ILVL));
		grid.cells[0][column++].appendChild(this.getSortLink('Slot',ItemList.ORDER_SLOT));
		grid.cells[0][column++].appendChild(this.getSortLink('Type',ItemList.ORDER_TYPE));
//		if( this.isStatWeightBasedScoreShown() ) {
//			grid.cells[0][column++].appendChild(this.getSortLink('Score',ItemList.ORDER_SCORE));
//		}

		for( i=0; i<column; i++ ) {
			grid.cells[0][i].className = "il_header_cell";
		}
		
		for( i = 1; i < data.length; i++ ) {
			column = 0;
			tmp = new Item(data[i][0]);
			ItemCache.set(tmp);
			
			grid.rows[i].className = 'il_row'+(i%2); 
			
			a = document.createElement("a");
			a.className = 'il_link';
			a.style.color = g_color[tmp.quality];
			
//			if( tmp.quality == 1 ) {
//				var wf = document.createElement("span");
//				wf.innerHTML = tmp.name;
//				wf.className = 'il_link_white_fix';
//				a.appendChild(wf);
//			}
//			else {
				a.innerHTML = tmp.name;
//			}
			
			cellStyle = "il_cell "+ ( i%2 == 0 ? "il_cell_bg0" : "il_cell_bg1");
			
//			a.onmouseout = function(){Tooltip.hidePreview();};
//			a.onmousemove = function(){Tooltip.move();};
//			
//			if( this.listType == IL_ITEM_LIST ) {
//				Listener.add( a, 'mouseover', Tooltip.showItem, Tooltip, [tmp.id] );
//			}
//			else {
//				Listener.add( a, 'mouseover', Tooltip.showGem, Tooltip, [tmp.id] );
//			}
//
//			if( this.onclickHandler ) {
//				Listener.add( a, "click", function(itm){ this.onclickHandler.notify([itm]); }, this, [tmp.clone()]);
//			}
//			else {
			
				Listener.add(a, 'mouseover', list.eventMgr.fire, list.eventMgr, ['show_tooltip',[tmp]]);
				Listener.add(a, 'mouseout', list.eventMgr.fire, list.eventMgr, ['hide_tooltip',[]]);
				Listener.add(a, 'mousemove', list.eventMgr.fire, list.eventMgr, ['move_tooltip',[]]);
				Listener.add(a, 'click', list.eventMgr.fire, list.eventMgr, ['click',[tmp]]);
				
				if( list.staticLinks ) {
					a.href = '?item='+tmp.id;
				}
			
//			}
			grid.cells[i][column].className = cellStyle;
			grid.cells[i][column++].innerHTML = "<div style='background-image:url(images/icons/half/" + tmp.icon + ".png)' class='il_icon' ></div>";

			grid.cells[i][column].className = cellStyle;
			
			grid.cells[i][column].appendChild(a);
			
			if( (tmp.typeMask & (1<<3)) != 0 )
			{
				span = document.createElement("sup");
				span.className = 'il_heroic';
				span.innerHTML = "H";
				grid.cells[i][column].appendChild(span);
			}
			column++;
			
//			if( this.showDps ) {
//				grid.cells[i][column].className = "il_"+(tmp.typeMask2&512?"un":"")+"imp_col";
//				grid.cells[i][column++].innerHTML = tmp.dps ? TextIO.getDPSFormatted(tmp) : "";
//				grid.cells[i][column].className = "il_"+(tmp.typeMask2&512?"un":"")+"imp_col";
//				grid.cells[i][column++].innerHTML = tmp.dps ? TextIO.getSpeedFormatted(tmp) : "";
//			}
			grid.cells[i][column].className = cellStyle;
			grid.cells[i][column++].innerHTML = tmp.level;

//			grid.cells[i][column].className = this.showDps ? "il_unimp_col" : "il_imp_col";
			grid.cells[i][column].className = cellStyle;
			grid.cells[i][column++].innerHTML = ( tmp.inventorySlot ? locale["a_slot"][tmp.inventorySlot] : "" );

//			grid.cells[i][column].className = this.showDps ? "il_unimp_col" : "il_imp_col";
			grid.cells[i][column].className = cellStyle;
			grid.cells[i][column++].innerHTML = tmp.itemSubClassName[0];
			
			
//			if( this.isStatWeightBasedScoreShown() ) {
//				
//				grid.cells[i][column].className = "il_imp_col";
//				grid.cells[i][column].innerHTML = data[i][1];
//				
//				if( this.compareItem != null && cmpItemScore > 0 ) {
//					var ratio = data[i][1] / cmpItemScore;
//					if( ratio > 1 ) {
//						grid.cells[i][column].style.color = "#" + ( ratio > 2 ? "FF" : Math.floor(0xFF - 0xC0 * ( ratio - 1 )).toString(16)) + "FF00";
//					}
//					else if( ratio < 1) {
//						grid.cells[i][column].style.color = "#FF" + ( ratio > 2 ? "FF" : Math.floor(0xFF - 0xC0 * ( 1 - ratio )).toString(16)) + "00";
//					}
//				}
//				column++;
//			}
			
//			grid.cells[i][column].className = "il_cell il_unimp_col";
//			grid.cells[i][column++].innerHTML = "<a href='http://wowhead.com/item="+tmp.id+"' target='_blank'></a>";
		}
		list.gui.setContent(grid.node);
	}
};