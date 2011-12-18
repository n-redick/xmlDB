/**
 * @constructor
 */
function ReforgeInterface() {
	this.eventMgr = new GenericSubject();
	this.eventMgr.registerEvent('reforge', ['reduce', 'add']);
	this.eventMgr.registerEvent('reforge_all', ['reforge_array']);
	this.eventMgr.registerEvent('reforge_preview', ['reforge_array']);
	this.eventMgr.registerEvent('reforge_item_preview', ['reduce', 'add']);
	this.eventMgr.registerEvent('restore', []);
	this.eventMgr.registerEvent('restore_all', []);
	this.eventMgr.registerEvent('remove_reforge_preview', []);
	this.eventMgr.registerEvent('remove_reforge_item_preview', []);
	//
	this.node = DOM.create('div');
	//
	// Operations
	this.ops = new BatchOperations();
	DOM.addClass(this.ops.node, 'ra_group');
	DOM.append( this.node, this.ops.node);
	// 
	// WoWReforge Import
	var wowRefNode = DOM.create('form', {'action': 'javascript:;'});
	
	this.wowReforgeURL = DOM.createAt( wowRefNode, 'input', {'class': 'input rf_wowreforgeurl'});
	var submitBtn = DOM.createAt( wowRefNode, 'input', {'type': 'submit', 'text': locale['RF_ImportWoWReforge'], 'class': 'button button_light'});
	this.ops.addComplex('wowreforge_import', locale['RF_WoWReforgeImport'], wowRefNode, locale['RF_WoWReforgeImportHelp']);
	
	Listener.add(wowRefNode, 'submit', this.__wowReforgeImport, this, null);
	Listener.add(submitBtn, 'mouseover', function() {
		var refArr = this.__parseWoWReforgeInput();
		if( refArr != null ) {
			this.eventMgr.fire('reforge_preview', {'reforge_array': refArr});
		}
	}, this, null);
	Listener.add(submitBtn, 'mouseout', function() {
		this.eventMgr.fire('remove_reforge_preview');
	}, this, null);
	//
	// Restore
	var restoreOp = this.ops.addSimple('restore_all', locale['RF_RestoreAll'] , new Handler(function(){
		this.eventMgr.fire('restore_all');
	}, this));
	Listener.add(restoreOp['node'], 'mouseover', function() {
		this.eventMgr.fire('reforge_preview', {'reforge_array': []});
	}, this, null);
	Listener.add(restoreOp['node'], 'mouseout', function() {
		this.eventMgr.fire('remove_reforge_preview');
	}, this, null);
	//
	this.content = DOM.createAt( this.node, 'div');
}

ReforgeInterface.prototype = {
	eventMgr: null,
	node: null, content: null, wowReforgeURL: null,
	ops: null,
	/**
	 * @param {EquippedItem} itm
	 */
	update: function( itm ) {
		var av = [];
		var re = [];
		var i, j, v, k, cls, a, row, div;

		DOM.truncate( this.content );
		
		if( ! itm ) {
			return;
		}
		else {
			div = DOM.create('div', {'class': 'rf_title_c'});
			DOM.createAt(div, 'span', {'text': 'Reforge ', 'class': 'rf_title'});
			span = DOM.createAt(div, 'a', {'text': itm.name, 'class': 'item_quality_'+itm.quality+' rf_item_name', 'href': 'javascript:'});
			ChardevHTML.addTooltip(span, itm.getTooltip());
		}
		
		for( i = 0; i<REFORGABLE_STATS.length; i++ ) {
			k = REFORGABLE_STATS[i];
			v = itm.getStatValue(k);
			if( v > 0 ) {
				av.push([k,v]);
			}
			else {
				re.push(k);
			}
		}
			
		 if( ! itm.isReforgable()) {
			DOM.set( this.content, div );
			DOM.createAt(this.content, 'div', {'text': 'This items is not reforgable!', 'class': 'rf_error'});
			return;
		}
		 else if( av.length == 0 ) {
			DOM.set( this.content, div );
			DOM.createAt(this.content, 'div', {'text': 'This items has no reforgable stats!', 'class': 'rf_error'});
			return;
		}
		
		var sg = new StaticGrid( 0, re.length + 2 );
		sg.node.className = 'rf_grid';
		
		row = sg.addJoinedRow();	

		DOM.append( sg.cells[row][0], div);
		
		row = sg.addRow();	
			
		for( i = 0; i<re.length; i++ ) {
			sg.cells[row][2+i].innerHTML = locale['ItemStatNamesShort'][re[i]];
			sg.cells[row][2+i].className = 'rf_to_stat';
		}
		
		for( i = 0; i< av.length; i++ ) {
			
			row = sg.addRow();
			
			cls = ( i%2 == 0 ? "row_bg1" : "row_bg2" ); 
			
			sg.cells[row][0].innerHTML = locale['ItemStatNames'][av[i][0]];
			sg.cells[row][0].className = cls + ' rf_from_stat';
			sg.cells[row][1].innerHTML = av[i][1];
			sg.cells[row][1].className = cls + ' rf_from_value';
			
			if( i ==  av.length - 1 ) {
				DOM.addClass(sg.cells[row][0], 'rf_from_stat_bottom');
				DOM.addClass(sg.cells[row][1], 'rf_from_value_bottom');
			}
			
			for( j = 0; j < re.length; j++ ) {
				
				div = DOM.create('div', {'class': cls + ' rf_cell'});
				
				if( i == 0 ) {
					DOM.addClass(div, 'rf_cell_top');
				}
				if( i ==  av.length - 1 ) {
					DOM.addClass(div, 'rf_cell_bottom');
				}
				if( j == 0 ) {
					DOM.addClass(div, 'rf_cell_left');
				}
				if( j ==  re.length - 1 ) {
					DOM.addClass(div, 'rf_cell_right');
				}
				
				if( itm.addedStat == re[j] && itm.reducedStat == av[i][0] ) {
					sg.cells[row][1].className += ' red';
					
					a = DOM.createAt( div, 'a', {'class': 'rf_to_value rf_to_active', 'text': itm.addedStatValue, 'href': 'javascript:'});
					
					Listener.add( a, 'click', this.__restore, this, []);
					Listener.add( a, 'mouseover', this.__mouseover, this, [-1,-1]);
					Listener.add( a, 'mouseout', this.__mouseout, this, []);
					
					ChardevHTML.addTooltip(a, "<div class='rf_tt_c'>Click to restore <span class='green'>"+itm.addedStatValue+"</span> <span class='green'>"+locale['ItemStatNames'][av[i][0]]+"</span> from <span class='red'>"+locale['ItemStatNames'][re[j]]+"</span></div>");
				}
				else {
					
					v = av[i][1];
					if( itm.reducedStat == av[i][0] ) {
						v = itm.reducedStatValue;
					}
					v = Math.floor(v * REFORGE_COEFFICIENT);
					
					a = DOM.createAt( div, 'a', {'class': 'rf_to_value', 'text': v, 'href': 'javascript:'});
					Listener.add( a, 'click', this.__reforge, this, [av[i][0],re[j]]);
					Listener.add( a, 'mouseover', this.__mouseover, this, [av[i][0],re[j]]);
					Listener.add( a, 'mouseout', this.__mouseout, this, []);
					
					ChardevHTML.addTooltip(a, "<div class='rf_tt_c'>Click to reforge <span class='green'>"+v+"</span> <span class='red'>"+locale['ItemStatNames'][av[i][0]]+"</span> into <span class='green'>"+locale['ItemStatNames'][re[j]]+"</span></div>");
				}
				DOM.set(sg.cells[row][2+j], div);
			}
			
		}
		
		i = sg.addJoinedRow();
		sg.cells[i][0].className = 'rf_b';
		a = DOM.createAt(sg.cells[i][0], 'a', {'class': 'button button_light link_button', 'href': 'javascript:', 'text': 'Restore'});
		Listener.add( a, 'click', this.__restore, this, []);
		
		DOM.append(this.content, sg.node);
		
	},
	__reforge: function( reduce, add ) {
		this.eventMgr.fire('reforge', {'reduce': reduce, 'add': add});
	},
	__restore: function() {
		this.eventMgr.fire('restore');
	},
	__mouseout: function() {
		this.eventMgr.fire('remove_reforge_item_preview');
	},
	__mouseover: function( reduce, add ) {
		this.eventMgr.fire('reforge_item_preview', {'reduce': reduce, 'add': add});
	},
	__wowReforgeImport: function() {
		var refArr = this.__parseWoWReforgeInput();
		if( refArr != null ) {
			this.eventMgr.fire('reforge_all', {'reforge_array': refArr});
		}
	},
	__parseWoWReforgeInput: function() {
		var v = DOM.getValue(this.wowReforgeURL);
		if( !v ) {
			return null;
		}
		
		var match = v.match(/reforge=((?:\d|-){34})/i);
		
		if( ! match[1] ) {
			Tooltip.showError(TextIO.sprintf1(locale['RF_WoWReforge_UnableToParse'],v));
			return null;
		}
		
		v = match[1];
		
		var refArr = [];
		for( var i = 0; i < 17; i++ ) {
			if( v[i*2] == '-' || v[i*2+1] == '-' ) {
				continue;
			}
			
			refArr[ WOWREFORGE_SLOTS_TO_CHARDEV_SLOTS[i] ] = [
				WOWREFORGE_TO_REFORGABLE_STATS[ parseInt(v[i*2], 10)  ],
				WOWREFORGE_TO_REFORGABLE_STATS[ parseInt(v[i*2+1], 10)]
			];
		};
		
		return refArr;
	}
};

/*
//TODO Use Listener, instead of global Engine object
function ReforgeInterface() {
	var layout = new StaticGrid(2,2); layout.setVerticalAlign(SG_VALIGN_TOP);
	var batchLayout = new StaticGrid( REFORGABLE_STATS.length ,2); 
	var div, restoreAll, i, j, clearBatchReforge, batchReforge, coll, wowreforgeexport;
	var frmContent, frm, sub, inp;

	this._reforgeOptimisationInterface = new ReforgeOptimisationInterface();
	
	this._node = document.createElement("div");
	this._reduceSelectParent = document.createElement("div");
	this._addSelectParent = document.createElement("div");
	this._old = document.createElement("div");
	this._new = document.createElement("div");
	this._header = document.createElement("div");
	this._header.className = "rf_header";
	this._reforge = document.createElement("input");
	this._reforge.type = 'button';
	this._reforge.value = locale['RF_Reforge'];
	Listener.add(this._reforge,"click",this._onReforge,this);
	this._restore = document.createElement("input");
	this._restore.type = 'button';
	this._restore.value = locale['RF_Restore'];
	Listener.add(this._restore,"click",this._onRestore,this);

	layout._node.width = "100%";
	layout._cols[0].width = "50%";
	layout._cols[1].width = "50%";
	layout._cells[0][0].appendChild(this._reduceSelectParent);
	layout._cells[0][1].appendChild(this._addSelectParent);
	layout._cells[1][0].appendChild(this._old);
	layout._cells[1][1].appendChild(this._new);
	
	this._batchCollapsable = new Collapsable(); 
	this._batchCollapsable.toggle();
	this._batchCollapsable._header.appendChild(document.createTextNode(locale['RF_BatchHeader']));
	this._batchCollapsable._header.className = "collapse_h ba_collapse_h";
	this._batchCollapsable._content.className = "collapse_c ba_collapse_c";
	this._batchCollapsable._node.className = "collapse ba_collapse";
	
	//
	//		BATCH OPERATIONS
	//
	//
	// 		OP: restore all
	//
	coll = new Collapsable(); coll.toggle();
	coll._node.className = 'ba_op_container';
	coll._header.innerHTML = locale['RF_RestoreAll'];
	coll._header.className = 'ba_op_title';
	coll._content.className = 'ba_op_content';
	//
	restoreAll = document.createElement("input");
	restoreAll.type = "button";
	restoreAll.value = locale['RF_RestoreAll'];
	coll._content.appendChild(restoreAll);
	Listener.add(restoreAll,"click",this._onRestoreAll,this,null);
	this._batchCollapsable._content.appendChild(coll._node);
	//
	//		OP: reforge all
	//
	coll = new Collapsable(); coll.toggle();
	coll._node.className = 'ba_op_container';
	coll._header.innerHTML = locale['RF_ReforgeAll'];
	coll._header.className = 'ba_op_title';
	coll._content.className = 'ba_op_content';
	coll._content.innerHTML = "<div class='ba_op_help'>" + locale['RF_ReforgeAllHelp'] + "</div>";
	//
	//			create selects
	//
	batchLayout._cells[0][0].innerHTML = locale['RF_ChooseReduce2'];;
	batchLayout._cells[0][1].innerHTML = locale['RF_ChooseAdd2'];
	
	this._addSelects = [];
	this._reduceSelects = [];
	for( i=0; i<REFORGABLE_STATS.length-1;i++ ){
		this._addSelects[i] = document.createElement("select");
		this._reduceSelects[i] = document.createElement("select");
		this._addSelects[i].className = "single_select rf_batch_select";
		this._reduceSelects[i].className = "single_select rf_batch_select";
		batchLayout._cells[i+1][0].appendChild(this._reduceSelects[i]);
		batchLayout._cells[i+1][1].appendChild(this._addSelects[i]);
		
		Listener.add(this._reduceSelects[i],"change",this._onBatchSelectChange,this,[this._reduceSelects]);
		Listener.add(this._addSelects[i],"change",this._onBatchSelectChange,this,[this._addSelects]);
	}
	batchLayout._node.className = 'align_center';
	coll._content.appendChild(batchLayout._node);
	//
	this._updateBatchSelect(RF_SEL_RED);
	this._updateBatchSelect(RF_SEL_ADD);
	//
	//			clear select button
	//
	clearBatchReforge = document.createElement("input");
	clearBatchReforge.type = "button";
	clearBatchReforge.value = locale['RF_Clear'];
	Listener.add(clearBatchReforge,"click",this._clearReforgeAllSelects,this,null);
	coll._content.appendChild(clearBatchReforge);
	//
	// 			reforge button
	//
	batchReforge = document.createElement("input");
	batchReforge.type = "button";
	batchReforge.value = locale['RF_BatchReforge'];
	Listener.add(batchReforge,"click",this._onReforgeAll,this,null);
	coll._content.appendChild(batchReforge);
	//
	this._batchCollapsable._content.appendChild(coll._node);
	//
	//		OP: import WoW Reforge
	//
	coll = new Collapsable(); coll.toggle();
	coll._node.className = 'ba_op_container';
	coll._header.innerHTML = locale['RF_WoWReforgeImport'];
	coll._header.className = 'ba_op_title';
	coll._content.className = 'ba_op_content';
	coll._content.innerHTML = "<div class='ba_op_help'>" + locale['RF_WoWReforgeImportHelp'] + "</div>";
	//
	frmContent = document.createElement("div");
	frm = document.createElement("form");
	frm.onsubmit = function(){return false;};
	frm.action = '#';
	
	Listener.add( frm, 'submit', this._wowReforgeImport, this, [] );
	
	sub = document.createElement("input");
	sub.type = "submit";
	sub.value = locale['RF_ImportWoWReforge'];
	
	this._wowReforgeUrlInput = document.createElement("input");
	this._wowReforgeUrlInput.className = "input rf_wowreforgeurl";
	
	frmContent.appendChild(this._wowReforgeUrlInput);
	frmContent.appendChild(sub);
	frm.appendChild(frmContent);
	coll._content.appendChild(frm);
	//
	this._batchCollapsable._content.appendChild(coll._node);
	//
	//		OP: Optimise
	//
	coll = new Collapsable();
	coll._node.className = 'ba_op_container';
	coll._header.innerHTML = locale['RF_Optimise'];
	coll._header.className = 'ba_op_title';
	coll._content.className = 'rf_op_coll_content';
	coll._content.innerHTML = "<div class='ba_op_help'>" + locale['RF_OptimiseHelp'] + "</div>";
	//
	//
	//
	
	coll._content.appendChild(this._reforgeOptimisationInterface._node);
	//
	this._batchCollapsable._content.appendChild(coll._node);
	this._node.appendChild(this._batchCollapsable._node);
	//
	//	WOWREFORGE EXPORT
	//	
	coll = new Collapsable(); 
	coll._header.appendChild(document.createTextNode(locale['RF_WoWReforgeExport']));
	coll._header.className = "collapse_h ba_collapse_h";
	coll._content.className = "collapse_c ba_collapse_c";
	coll._node.className = "collapse ba_collapse";
	
	
	div = document.createElement("div");
	div.className = "rf_wowreforge_export_note";
	div.innerHTML = "Notice: A new browser window will open, showing your current profile at wowreforge.com. Once you're finished, press 'Apply changes to chardev profile'.";
	
	
	this._wowreforgeExportForm = document.createElement("form");
	this._wowreforgeExportForm.method = "POST";
	this._wowreforgeExportForm.action = "http://wowreforge.com/import";
	this._wowreforgeExportForm.name = "wowreforge_export";
	this._wowreforgeExportForm.target = "_blank";
	
	inp = document.createElement("input");
	inp.type = "hidden";
	inp.value = "chardev";
	inp.name = "src";
	this._wowreforgeExportForm.appendChild(inp);
	
	this._wowreforgeExportProfileInput = document.createElement("input");
	this._wowreforgeExportProfileInput.type = "hidden";
	this._wowreforgeExportProfileInput.name = "profile";
	this._wowreforgeExportForm.appendChild(this._wowreforgeExportProfileInput);
	
	this._wowreforgeExportProfileIdInput = document.createElement("input");
	this._wowreforgeExportProfileIdInput.type = "hidden";
	this._wowreforgeExportProfileIdInput.name = "profile-id";
	this._wowreforgeExportForm.appendChild(this._wowreforgeExportProfileIdInput);
	
	wowreforgeexport = document.createElement("a");
	wowreforgeexport.innerHTML = "Export to wowreforge.com";
	wowreforgeexport.className = "rf_wowreforge_export_l";
	wowreforgeexport.target = "_blank";
	Listener.add(wowreforgeexport, "click", this._onWoWReforgeExport, this, []);
	
	coll._content.appendChild(wowreforgeexport);
	coll._content.appendChild(this._wowreforgeExportForm);
	coll._content.appendChild(div);
	
	if( g_settings.debug ) {
		this._node.appendChild(coll._node);
	}
	//
	//	REFORGE INTERFACE
	//
	this._main = document.createElement("div");
	this._main.className = "rf_main";

	this._main.appendChild(this._header);
	this._main.appendChild(layout._node);
	
	div = document.createElement("div");
	div.className = "rf_button_parent";
	div.appendChild(this._reforge);
	div.appendChild(this._restore);
	this._main.appendChild(div);

	this._node.appendChild(this._main);
	//
	//
//	var a = document.createElement("a");
//	a.innerHTML = "wowreforge mashup";
//	a.onclick = function() {
//		var iframe = document.createElement("iframe");
//		iframe.name = "wowreforge_iframe";
//		iframe.style.width = "1010px";
//		iframe.style.height = "1200px";
//		iframe.src = "http://wowreforge.com/EU/Azshara/Aiijah";
//		Tooltip.showDisabled(iframe);
//		//http://wowreforge.com/EU/Azshara/Aiijah
//	};
//	this._node.appendChild(a);
}
ReforgeInterface.prototype._wowreforgeExportProfileIdInput = null;
ReforgeInterface.prototype._wowreforgeExportProfileInput = null;
ReforgeInterface.prototype._wowreforgeExportForm = null;
ReforgeInterface.prototype._node = null;
ReforgeInterface.prototype._reduceSelectParent = null;
ReforgeInterface.prototype._addSelectParent = null;
ReforgeInterface.prototype._new = null;
ReforgeInterface.prototype._old = null;
ReforgeInterface.prototype._main = null;
ReforgeInterface.prototype._reforge = null;
ReforgeInterface.prototype._restore = null;
ReforgeInterface.prototype._onChangeHandler = null;
ReforgeInterface.prototype._wowReforgeUrlInput = null;
ReforgeInterface.prototype._weightInputs = null;
ReforgeInterface.prototype._capInputs = null;
ReforgeInterface.prototype._opTable = null;
ReforgeInterface.prototype._useOpInput = null;

ReforgeInterface.prototype._batchCollapsable = null;
ReforgeInterface.prototype._reduceSelects = [];
ReforgeInterface.prototype._addSelects = [];

ReforgeInterface.prototype._itmRef = null;
ReforgeInterface.prototype._reducedStat = -1;
ReforgeInterface.prototype._reduceValue = -1;
ReforgeInterface.prototype._addedStat = -1;

ReforgeInterface.prototype._reforgeOptimisationInterface = null;

ReforgeInterface.prototype._wowReforgeImport = function() {
	var v = this._wowReforgeUrlInput.value;
	if( !v ) {
		return;
	}
	
	var match = v.match(/reforge=((?:\d|-){34})/i);
	
	if( ! match[1] ) {
		Tooltip.showError(TextIO.sprintf1(locale['RF_WoWReforge_UnableToParse'],v));
		return;
	}
	
	v = match[1];
	
	var refArr = [];
	for( var i = 0; i < 17; i++ ) {
		if( v[i*2] == '-' || v[i*2+1] == '-' ) {
			continue;
		}
		
		refArr[ WOWREFORGE_SLOTS_TO_CHARDEV_SLOTS[i] ] = [
			WOWREFORGE_TO_REFORGABLE_STATS[ parseInt(v[i*2], 10)  ],
			WOWREFORGE_TO_REFORGABLE_STATS[ parseInt(v[i*2+1], 10)]
		];
	};
	
	Engine._currentCharacter.reforgeFromArray(refArr);
};

ReforgeInterface.prototype._onRestoreAll = function () {
	Engine._currentCharacter.restoreAllItems();
	if( this._onChangeHandler ) {
		this._onChangeHandler[0].apply(this._onChangeHandler[1],[]);
	}
};

ReforgeInterface.prototype._onReforgeAll = function() {
	var redStats = [], addStats = [], i, si;
	for( i=0; i<REFORGABLE_STATS.length-1; i++ ) {
		si = this._reduceSelects[i].selectedIndex;
		if( si > 0 ) {
			redStats[redStats.length] = parseInt(this._reduceSelects[i].options[si].value, 10);
		}
		si = this._addSelects[i].selectedIndex;
		if( si > 0 ) {
			addStats[addStats.length] = parseInt(this._addSelects[i].options[si].value, 10);
		}
	}
	// TODO how about some encapsulation...
	Engine._currentCharacter.reforgeAllItems( redStats, addStats );
	if( this._onChangeHandler ) {
		this._onChangeHandler[0].apply(this._onChangeHandler[1],[]);
	}
};

ReforgeInterface.prototype._onBatchSelectChange = function( selectGroup ) {
	this._updateBatchSelect(RF_SEL_RED);
	this._updateBatchSelect(RF_SEL_ADD);
};

ReforgeInterface.prototype._clearReforgeAllSelects = function() {
	var i;
	for( i=0; i<this._reduceSelects.length; i++ ) {
		this._reduceSelects[i].options[0].selected = true;
		this._addSelects[i].options[0].selected = true;
	}
	this._updateBatchSelect(RF_SEL_RED);
	this._updateBatchSelect(RF_SEL_ADD);
};

ReforgeInterface.prototype._updateBatchSelect = function( selType ) {
	var i, j, selectIndex, si, o, v;
	var usedStats = [];
	var selVal = -1;
	var selectGroup = selType == RF_SEL_ADD ? this._addSelects : this._reduceSelects;
	
	for( selectIndex=0; selectIndex<this._reduceSelects.length; selectIndex++ ) {
		usedStats = [];
		selVal = -1;
		if( selectGroup[selectIndex].selectedIndex > 0 ) {
			selVal = parseInt(selectGroup[selectIndex].options[selectGroup[selectIndex].selectedIndex].value, 10);
		}
		
		Tools.removeChilds(selectGroup[selectIndex]);
		
		for( i=0; i<this._reduceSelects.length; i++ ) {
			if( i != selectIndex || selType != RF_SEL_RED ) {
				si = this._reduceSelects[i].selectedIndex;
				if( si > 0 ) {
					usedStats[usedStats.length] = parseInt(this._reduceSelects[i].options[si].value, 10);
				}
			}
			if( i != selectIndex || selType != RF_SEL_ADD ) {
				si = this._addSelects[i].selectedIndex;
				if( si > 0 ) {
					usedStats[usedStats.length] = parseInt(this._addSelects[i].options[si].value, 10);
				}
			}
		}
		
		o = document.createElement("option");
		selectGroup[selectIndex].appendChild(o);
		
		for( i=0; i<REFORGABLE_STATS.length; i++ ) {
			v = true;
			for( j=0; j<usedStats.length; j++ ) {
				if( usedStats[j] == REFORGABLE_STATS[i] ) {
					v = false;
					break;
				}
			}
			if( v ) {
				o = document.createElement("option");
				o.innerHTML = locale['ItemStatNames'][REFORGABLE_STATS[i]];
				o.value = REFORGABLE_STATS[i];
				if( REFORGABLE_STATS[i] == selVal ) {
					o.selected = true;
				}
				selectGroup[selectIndex].appendChild(o);
			}
		}
	}
};
ReforgeInterface.prototype.update = function( itm ) {
	var tmpHTML = "";
	this._reforge.disabled = true;
	this._restore.disabled = true;
	this._new.innerHTML = "";
	this._old.innerHTML = "";
	this._reduceSelectParent.innerHTML = "";
	this._addSelectParent.innerHTML = "";
	this._header.innerHTML = "";
	this._itmRef = itm;

	this._reducedStat = -1;
	this._reduceValue = -1;
	this._addedStat = -1;
	
	if( itm == null ) {
		this._main.style.display = "none";
		return;
	}
	this._main.style.display = "block";
	
	this._header.innerHTML = itm._name;
	this._header.style.color = g_color[itm._quality];
	this._header.style.backgroundImage = 'url(images/icons/half/'+itm._icon+'.png)';
	
	if( itm._reducedStat == -1 ) {
		var reducable = [], i, select, o, v;
		
		for( i=0; i<REFORGABLE_STATS.length; i++ ) {
			v = this._getStatValue(itm,REFORGABLE_STATS[i]);
			if( v != -1 ) {
				reducable.push([REFORGABLE_STATS[i],v]);
			}
		}

		this._reduceSelectParent.innerHTML = "<div class='rf_help'>"+locale['RF_ChooseReduce']+"</div>";
		select = document.createElement("select");
		o = document.createElement("option");
		o.innerHTML = locale['RF_ReduceStat'];
		select.appendChild(o);
		if( reducable.length > 0 ) {
			for( i=0;i<reducable.length;i++) {
				o = document.createElement("option");
				o.innerHTML = locale['ItemStatNames'][reducable[i][0]]+"("+Math.floor(reducable[i][1]*REFORGE_COEFFICIENT)+")";
				o.value = reducable[i][0]+" "+reducable[i][1];
				select.appendChild(o);
			}
		}
		else {
			select.disabled = true;
		}
		this._reduceSelectParent.appendChild(select);
		Listener.add(select,"change",this._onReduceChange,this,[select]);
		
		tmpHTML = "<div class='rf_title'>"+locale['RF_Current']+"</div><div class='rf_stats'>";
		tmpHTML += this._printStats(itm,false,false);
		tmpHTML += "</div>";
		this._old.innerHTML = tmpHTML;
		
		this._addSelectParent.innerHTML = "<div class='rf_help'>"+locale['RF_ChooseAdd']+"</div><select disabled='true'><option>"+locale['RF_AddStat']+"</option></select>";
			
	}
	else {
		this._reforge.disabled = true;
		this._restore.disabled = false;
		
		tmpHTML = "<div class='rf_title'>"+locale['RF_Current']+"</div><div class='rf_stats'>";
		tmpHTML += this._printStats(itm,false,false);
		tmpHTML += "</div><div class='rf_reduced'>+"+itm._addedStatValue+" "+locale['ItemStatNames'][itm._addedStat]+"</div>";
		this._old.innerHTML = tmpHTML;
		
		tmpHTML = "<div class='rf_title'>"+locale['RF_Restore']+"</div>";
		tmpHTML += this._printStats(itm, false, true);
		tmpHTML += "</div>";
		this._new.innerHTML = tmpHTML;
	}
};

ReforgeInterface.prototype.setOnChangeHandler = function( handler, scope ) {
	this._onChangeHandler = [handler, scope];
};

ReforgeInterface.prototype._updateAddNodes = function() {
	var i, select = document.createElement("select"), o;
	this._addSelectParent.innerHTML = "<div class='rf_help'>"+locale['RF_ChooseAdd']+"</div>";
	o = document.createElement("option");
	o.innerHTML = locale['RF_AddStat'];
	select.appendChild(o);
	for( i=0; i<REFORGABLE_STATS.length; i++ ) {
		if( this._getStatValue(this._itmRef,REFORGABLE_STATS[i]) == -1 ) {
			o = document.createElement("option");
			o.innerHTML = locale['ItemStatNames'][REFORGABLE_STATS[i]]+"("+this._reduceValue+")";
			o.value = REFORGABLE_STATS[i];
			select.appendChild(o);
		}
	}
	this._addSelectParent.appendChild(select);
	Listener.add(select,"change",this._onAddChange,this,[select]);
	this._new.innerHTML = "<div class='rf_title'>"+locale['RF_Reforge']+"</div><div class='rf_notice'></div";
};

ReforgeInterface.prototype._onReduceChange = function( selectNode ) {
	this._reforge.disabled = true;
	if( selectNode.selectedIndex < 1 ) {
		this._reducedStat = -1;
		this._reduceValue = -1;
		this._addedStat = -1;
		this._addSelectParent.innerHTML = "<div class='rf_help'>"+locale['RF_ChooseAdd']+"</div><select disabled='true'></select>";
		this._new.innerHTML = "<div class='rf_title'>"+locale['RF_Reforge']+"</div><div class='rf_notice'></div";
	}
	else {
		var vals = selectNode.options[selectNode.selectedIndex].value.split(" ");
		this._reduceValue = Math.floor(parseInt(vals[1], 10)*REFORGE_COEFFICIENT);
		this._reducedStat = parseInt(vals[0], 10);
		this._updateAddNodes();
	}
};

ReforgeInterface.prototype._onAddChange = function( selectNode ) {
	if( selectNode.selectedIndex < 1 ) {
		this._addedStat = -1;
		this._updateAddNodes();
		this._reforge.disabled = true;
	}
	else {
		this._addedStat = parseInt(selectNode.options[selectNode.selectedIndex].value, 10);
		var tmpHTML = "<div class='rf_title'>"+locale['RF_Reforge']+"</div><div class='rf_stats'>";
		tmpHTML += this._printStats(this._itmRef, true, false);
		tmpHTML += "</div><div class='rf_added'>+"+this._reduceValue+" "+locale['ItemStatNames'][this._addedStat]+"</div>";
		this._new.innerHTML = tmpHTML;
		
		this._reforge.disabled = false;
	}
};

ReforgeInterface.prototype._onReforge = function() {
	this._itmRef.reforge(this._reducedStat, this._addedStat);
	if( this._onChangeHandler ) {
		this._onChangeHandler[0].apply(this._onChangeHandler[1],[]);
	}
};

ReforgeInterface.prototype._onRestore = function() {
	this._itmRef.restore();
	if( this._onChangeHandler ) {
		this._onChangeHandler[0].apply(this._onChangeHandler[1],[]);
	}
};

ReforgeInterface.prototype._printStats = function( itm, previewReforge, previewRestore ) {
	var tmpHTML = "", j;
	for( j=0; j<itm._stats.length; j++ ) {
		if( !itm._stats[j] ) {
			continue;
		}
		if( previewReforge && itm._stats[j][0] == this._reducedStat ) {
			tmpHTML += "<div class='rf_reduced'>+"+(itm._stats[j][1]-this._reduceValue)+" "+locale['ItemStatNames'][itm._stats[j][0]]+"</div>";
		}
		else if( previewRestore && itm._stats[j][0] == itm._reducedStat ) {
			tmpHTML += "<div class='rf_added'>+"+itm._reducedStatValue + " "+locale['ItemStatNames'][itm._reducedStat] + "</div>";
		}
		else {
			tmpHTML += "<div>+"+itm._stats[j][1]+" "+locale['ItemStatNames'][itm._stats[j][0]]+"</div>";
		}
	}
	if( itm._selectedRandomEnchantment ) {
		for( j=0; j<itm._selectedRandomEnchantment._enchants.length; j++ ) {
			var e = itm._selectedRandomEnchantment._enchants[j];
			if( e ) {

				if( previewReforge && e._types[0] == 5 && e._spellIds[0] == this._reducedStat ) {
					tmpHTML += "<div class='rf_reduced'>"+e._unmodifiedDescription.replace(/\$i/,e._values[0]-this._reduceValue)+"</div>";
				}
				else if(previewRestore && e._types[0] == 5 && e._spellIds[0] == itm._reducedStat ) {
					tmpHTML += "<div class='rf_added'>"+e._unmodifiedDescription.replace(/\$i/,itm._reducedStatValue)+"</div>";
				}
				else {
					tmpHTML += "<div>"+e._description+"</div>";
				}
			}
		}
	}
	return tmpHTML;
};
ReforgeInterface.prototype._getStatValue = function(itm,stat) {
	var j;
	for( j=0; j<itm._stats.length; j++ ) {
		if( itm._stats[j] && itm._stats[j][0] == stat ) {
			return itm._stats[j][1];
		}
	}
	if( itm._selectedRandomEnchantment ) {
		for( j=0; j<itm._selectedRandomEnchantment._enchants.length; j++ ) {
			var e = itm._selectedRandomEnchantment._enchants[j];
			if( e && e._types[0] == 5 && e._spellIds[0] == stat ) {
				return e._values[0];
			}
		}
	}
	return -1;
};

ReforgeInterface.prototype._onWoWReforgeExport = function() {
	var note = document.createElement("div");
	var xhReq,token;
	note.innerHTML = 'Preparing temporary profile...';
	note.className = 'tt_msg_c tt_msg';
	Tooltip.showDisabled(note);
	
	xhReq = Ajax.getRequestObject();
	xhReq.open("GET", "php/interface/wowreforge/get.php", false);
	xhReq.send(null);
	
	token = eval( "(" + xhReq.responseText + ")");

	this._wowreforgeExportProfileInput.value = Engine._currentCharacter.toJSONProfile();
	this._wowreforgeExportProfileIdInput.value = token;
	
	this._wowreforgeExportForm.submit();
	
	note = document.createElement("div");
	note.innerHTML = 'Waiting for wowreforge.com to finish...<br /><span class="tt_close_notice">Abort by hitting escape!</span>';
	note.className = 'tt_msg_c tt_msg';
	Tooltip.showDisabled(note);
	
	this._waitForWoWReforge(token);
};

ReforgeInterface.prototype._waitForWoWReforge = function( token ) {
	Ajax.request('php/interface/wowreforge/pull.php'+TextIO.queryString({'id': token}), new Handler(this._onWoWReforgePull,this), [token]);
};

ReforgeInterface.prototype._onWoWReforgePull = function( response, token ) {
	var error = Ajax.getError(response);
	
	if( error ) {
		Tooltip.enable();
		Tooltip.showError(error);
	}
	else {
		if( Tooltip._disabled ) {
			var reforgeSetup = eval( "(" + response.responseText + ")" );
			if( reforgeSetup ) {
				Tooltip.showHTML(reforgeSetup);
			}
			else {
				var self = this;
				window.setTimeout( function() { self._waitForWoWReforge.apply(self, [token]);}, 2000 );
			}
		}
	}
};
*/