function CharacterSheet() {
	this.eventMgr = new EventManager([
		"level_select", "profession_select", "profession_level_select", "show_stat_tooltip"                              
	]);
	
	var grid, i, j, div, div2, div3, slotGrid, wpnGrid;
	//
	this.raceClassSelector = new RaceClassSelector();
	this.shapeSelector = new ShapeSelector();
	this.presenceSelector = new PresenceSelector();
	this.buffBar = new BuffBar();
	//
	//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	//
	// BASIC LAYOUT
	//
	//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	//
	this.node = document.createElement('div');
	div = document.createElement("div");
	div.className = "cs_level_parent";
	this.level = document.createElement("select"); 
	this.level.className = 'single_select';
	div.appendChild(this.level);
	Listener.add(this.level,"change",this.__onLevelChange,this,null);
	//
	//
	div2 = document.createElement("div");
	div2.className = "cs_t"; 	
	div2.appendChild(this.raceClassSelector.node);
	div2.appendChild( this.buffBar.node );
	div2.appendChild(div);
	Tools.clearBoth(div2);
	div2.appendChild(this.shapeSelector.node);
	div2.appendChild(this.presenceSelector.node);
	//
	this.node.appendChild(div2);
	//
	//
	grid = new StaticGrid(1,2); 
	grid.setVerticalAlign(SG_VALIGN_TOP);
	grid.node.className = "cs_m_grid";
	grid.cols[0].width = "180px";
	grid.cols[1].width = "160px";
	//
	div = document.createElement("div");
	div.className = "cs_m_grid_t";
	div.appendChild(grid.node);
	//
	this.node.appendChild(div);
	//
	//#########################################################################
	//
	//	INVENTORY SLOTS
	//
	//#########################################################################
	//
	div = document.createElement("div");
	div.className= "cs_m_grid_sl";
	slotGrid = new StaticGrid(8,2);
	this.slots = [];
	for( i = 0; i < INV_ITEMS; i++ ) {
		this.slots[i] = new ItemSlot(i);
	}
	for( i = 0; i < 8; i++ ) {
		slotGrid.cells[i][0].style.paddingRight = "8px";
		slotGrid.cells[i][1].style.paddingLeft = "8px";
		slotGrid.cells[i][0].appendChild(this.slots[i].node);
		slotGrid.cells[i][1].appendChild(this.slots[i+8].node);
	}
	slotGrid.node.className = 'align_center';
	div.appendChild(slotGrid.node);
	//
	wpnGrid = new StaticGrid(1,3);
	div.appendChild(wpnGrid.node);
	wpnGrid.cells[0][0].appendChild(this.slots[16].node);
	wpnGrid.cells[0][1].appendChild(this.slots[17].node);
	wpnGrid.cells[0][2].appendChild(this.slots[18].node);
	
	wpnGrid.node.className = "cs_w_grid";
	
	grid.cells[0][0].appendChild(div);
	//
	//#########################################################################
	//
	//	STATS
	//
	//#########################################################################
	//
	var statTooltipHandler = new Handler(this.__onShowStatTooltip, this);
	this.stats = [];
	this.statCollapsables = [];
	
	for( i=0; i<locale['CS_StatGroups'].length; i++ ) {
		this.statCollapsables[i] = new Collapsable();  
		if( i == 6 ) {
			this.statCollapsables[i].toggle();
		}
		this.stats[i] = [];
		div = document.createElement('div');
		div.className = 'stat_title';
		div.appendChild(document.createTextNode(locale['CS_StatGroups'][i]));
		this.statCollapsables[i].header.appendChild(div);
		for( j=0; j<locale['CS_Stats'][i].length; j++ ) {
			this.stats[i][j] = new Stat(i,j);
			this.stats[i][j].addListener('show_tooltip', statTooltipHandler)
			this.statCollapsables[i].content.appendChild(this.stats[i][j].node);
		}
		this.statCollapsables[i].node.className = 'cs_st_p';
		
		grid.cells[0][1].appendChild(this.statCollapsables[i].node);
	}
	
	this.professionsParent = new StaticGrid(0,2);
	this.professionsParent.node.className = 'cs_prof_grid';
	this.professionsParent.addJoinedRow();
	this.professionsParent.addRow();
	this.professionsParent.addRow();
	
	this.professionsParent.cells[0][0].innerHTML = "<div class='cs_prof_title'>"+locale['Professions']+"</div>";
	
	this.professionSelects = [null,null];
	
	this.professionLevelSelects = [null,null];
	
	this.__buildProfessionSelects();
	
	for( i=0; i<2; i++ ) {
		this.professionsParent.cells[1+i][0].appendChild(this.professionSelects[i].node);
		this.professionsParent.cells[1+i][1].appendChild(this.professionLevelSelects[i].node);
	}
//	grid.cells[0][0].appendChild(this.professionsParent.node);
	
	this.slots[18].setVisibility(false);
	
	this.showStatGroups(-1);
}


CharacterSheet.CS_COLLAPSE_MASKS = {
	1:1<<3|1<<4,
	2:1<<3,
	3:1<<2|1<<4|1<<5,
	4:1<<3|1<<4|1<<5,
	5:1<<2|1<<3|1<<5,
	6:1<<3|1<<4,
	7:1<<3|1<<5,
	8:1<<2|1<<3|1<<5,
	9:1<<2|1<<3|1<<5,
	11:1<<3
};

CharacterSheet.prototype = {
	eventMgr: null,
	node: null,
	character: null,
	buffBar: null,
	healthBar: null,
	energyBar: null,
	slots: [],
	stats: [],
	selectedSlot: -1,
	statCollapsables: [],
	level: null,
	shapeSelector: null,
	presenceSelector: null,

	professionsParent: null,
	professionSelects: [],
	professionLevelSelects: [],
	addListener: function( event, handler ) {
		this.eventMgr.addListener( event, handler );
	},
	__onShowStatTooltip: function( group, index, node ) {
		this.eventMgr.fire('show_stat_tooltip', [group, index, node]);
	},
	__buildProfessionSelects: function() {
		var opts, i;
		for( var professionIndex = 0; professionIndex<2; professionIndex++ ) {
			opts = [[0,""]]; 
			for( i=0; i<PROFESSIONS.length; i++ ) {
				var id = PROFESSIONS[i];
				opts.push([id,locale['PrimaryProfessions'][id]]);
			}
			
			this.professionSelects[professionIndex] = new SingleSelect([]);
			this.professionSelects[professionIndex].node.className = "single_select cs_prof_sel";
			Listener.add(
				this.professionSelects[professionIndex].node,
				"change",
				this.__onProfessionChange,
				this,
				[professionIndex]
			);
			
			this.professionLevelSelects[professionIndex] = new SingleSelect([]);
			this.professionLevelSelects[professionIndex].node.className = "single_select cs_prof_level_sel";
			Listener.add(this.professionLevelSelects[professionIndex].node,"change",this.__onProfessionLevelChange,this,[professionIndex]);
		}
	},
	__onProfessionChange: function( professionIndex ) {
		this.eventMgr.fire("profession_select", [
			professionIndex,
			parseInt(this.professionSelects[professionIndex].getValue(), 10)
		]);
	},
	__onProfessionLevelChange: function( professionIndex ) {
		this.eventMgr.fire("profession_level_select", [
			professionIndex,
			parseInt(this.professionLevelSelects[professionIndex].getValue(), 10)
		]);
	},
	__onLevelChange: function() {
		this.eventMgr.fire("level_select", [parseInt( this.level.options[this.level.selectedIndex].value, 10 )]);
	},
	/**
	 * @param {number} level
	 */
	updateLevel: function( level ) {
		for( var i=0; i < this.level.options.length; i++ ) {
			if( parseInt(this.level.options[i].value, 10) == level ) {
				this.level.options[i].selected = "true";
				return;
			}
		}
	},
	/**
	 * @param {number} minLevel
	 * @param {number} maxLevel
	 */
	updateLevelSelector: function( minLevel, maxLevel ) {
		var o;
		
		Tools.removeChilds(this.level);
		for( var i=minLevel; i<=maxLevel; i++ ) {
			o = document.createElement("option");
			o.value = i;
			o.innerHTML = i;
			this.level.appendChild(o);
		}
	},
	showStatGroups: function ( chrClassId ) {
		var mask = 0;
		if( chrClassId > 0 && CharacterSheet.CS_COLLAPSE_MASKS[chrClassId] ) {
			mask = CharacterSheet.CS_COLLAPSE_MASKS[chrClassId];
		}
		mask|=1<<6;
		for( var i=0; i<this.statCollapsables.length; i++ ) {
			if( (1<<i&mask)!=0 ) {
				this.statCollapsables[i].collapse();
			}
			else {
				this.statCollapsables[i].expand();
			}
		}
	},
	updateProfessions: function( skilledProfessions, level ) {
		var opts, i, ml;
		for( var professionIndex = 0; professionIndex<2; professionIndex++ ) {
			
			var prof = skilledProfessions[professionIndex];
			
			opts = [[0,""]]; 
			for( i=0; i<PROFESSIONS.length; i++ ) {
				var id = PROFESSIONS[i];
				if( GameInfo.getMaximumProfessionTier(PROFESSIONS[i], level) < 0 ) {
					continue;
				}
				//
				// mutual exclusion
				if( 
					professionIndex == 0 && skilledProfessions[1]!=null && skilledProfessions[1].id == id || 
					professionIndex == 1 && skilledProfessions[0]!=null && skilledProfessions[0].id == id ) {
					continue;
				}
				opts.push([id,locale['PrimaryProfessions'][id]]);
			}
			this.professionSelects[professionIndex].set(opts);
			
			if( prof != null ) {
				
				this.professionSelects[professionIndex].select( prof.id );
			
				this.professionLevelSelects[professionIndex].node.style.display = "block";

				ml = GameInfo.getMaximumProfessionLevel( prof.id, level);
				opts = [];
				for( i= 1; i<=ml; i++ ) {
					opts.push([i,i]);
				}
				this.professionLevelSelects[professionIndex].set(opts);
				this.professionLevelSelects[professionIndex].select( prof.level );
			}
			else {
				this.professionLevelSelects[professionIndex].node.style.display = "none";
			}
		}
	}
};

function SkilledPrimaryProfession( id, level ) {
	this.id = id;
	this.level = level;
}
SkilledPrimaryProfession.prototype = {
	id: 0, level: 0
};