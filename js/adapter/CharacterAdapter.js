/**
 * @constructor
 * @param {Character} character
 * @param {CharacterSheet} sheet
 * @returns {CharacterAdapter}
 */
function CharacterListener( character, sheet ) {
	
	this.character = character;
	this.sheet = sheet;
	
	for( var i=0; i<19; i++ ) {
		this.sheet.slots[i].addListener( 'show_tooltip', new Handler(this.showItemTooltip, this) );
		this.sheet.slots[i].addListener( 'hide_tooltip', new Handler(this.hideItemTooltip, this) );
		this.sheet.slots[i].addListener( 'right_click', new Handler(this.removeItem, this) );
		this.sheet.slots[i].addListener( 'left_click', new Handler(this.clickAtItem, this) );
	}
	this.character.inventory.addListener( 'item_added', new Handler(this.updateSlot, this));
	this.character.inventory.addListener( 'item_removed', new Handler(this.updateSlot, this));
	this.character.inventory.addListener( 'items_swapped', new Handler(this.updateSlot, this));
	
	this.updateEquipment();
	//
	//
	// RACE AND CLASS
	//
	//
	this.sheet.raceClassSelector.addListener( "race_select", new Handler(this.selectRace, this));
	this.sheet.raceClassSelector.addListener( "class_select", new Handler(this.selectClass, this));
	
	this.character.addListener( "class_change", new Handler(this.updateClass, this));
	this.character.addListener( "race_change", new Handler(this.updateRace, this));
	//
	// init
	this.updateRace();
	this.updateClass();
	//
	// Level
	//
	this.sheet.addListener( "level_select", new Handler(this.selectLevel, this));
	this.character.addListener("level_change", new Handler(function(){
		this.sheet.updateLevel(this.character.level);
	}, this));
	//
	// init
	this.sheet.updateLevelSelector( this.character.getMinLevel(), Character.MAX_LEVEL );
	this.sheet.updateLevel(this.character.level);
	//
	// Stats
	//
	this.character.addListener("stats_change", new Handler(this.setStats, this));
	this.character.addListener("preview_stats_change", new Handler(this.setPreviewStats, this));
	this.sheet.addListener("show_stat_tooltip", new Handler(this.showStatTooltip, this));
	//
	// init
	this.setStats(this.character.stats);
	//
	// Professions
	//
	this.character.addListener("profession_change", new Handler(this.updateProfessions, this));
	this.character.addListener("profession_level_change", new Handler(this.updateProfessions, this));
	this.sheet.addListener("profession_select", new Handler(this.setProfession, this));
	this.sheet.addListener("profession_level_select", new Handler(this.setProfessionLevel, this));
	
	//
	// init
	this.updateProfessions();
}

CharacterAdapter.prototype = {
	character: null, sheet: null,
	showItemTooltip: function( slot, index ) {
		var itm = this.character.inventory.items[slot][index];
		if( itm ) {
			this.sheet.slots[slot].showTooltip( 
				ItemTooltip.getHTML(itm, this.character),
				index
			);
			if( index > 0 ) {
				this.character.inventory.setPreview(itm, slot, -1);
			}
		}
	},
	hideItemTooltip: function( slot, index ) {
		if( index > 0 ) {
			this.character.inventory.removePreview();
		}
		Tooltip.hide();
	},
	updateEquipment: function() {
		for( var i=0; i<19; i++ ) {
			this.updateSlot(i);
		}
	},
	updateSlot: function( slot ) {
		var equippedItems = [];
		var itm;
		for( var j=0; j<5; j++ ) {
			itm = this.character.inventory.items[slot][j];
			if( itm == null ) {
				equippedItems.push(null);
			}
			else {
				equippedItems.push(new EquippedItem(
					itm.id, 
					itm.icon, 
					itm.quality, 
					!this.character.canWear(itm) || !this.character.fitsItemClassRequirements(itm)
				));
			}
		}
		this.sheet.slots[slot].update(equippedItems);
	},
	//
	//
	// RACE AND CLASS
	//
	//
	selectRace: function( raceId ) {
		DatabaseIO.getCharacterRace( 
			raceId, 
			new Handler( this.__selectRace, this) 
		);
		Tooltip.showLoading();
	},
	__selectRace: function( serializedChrRace ) {
		var oldChrClassId = this.character.chrClass == null ? -1 : this.character.chrClass.id;
		var newChrClassId;
		
		this.character.setRace( new CharacterRace( this.character, serializedChrRace ) );
		
		newChrClassId = this.character.chrClass == null ? -1 : this.character.chrClass.id;
		
		if( oldChrClassId != newChrClassId || newChrClassId == -1 ) {
			this.sheet.raceClassSelector.showClassSelector();
		}
		else {
			Tooltip.enable();
		}
	},
	selectClass: function( chrClassId ) {
		DatabaseIO.getCharacterClass( 
			chrClassId, 
			new Handler( this.__selectClass, this) 
		);
		Tooltip.showLoading();
	},
	__selectClass: function( serializedChrClass ) {
		this.character.setClass( new CharacterClass( serializedChrClass ));
		Tooltip.enable();
	},
	
	updateClass: function() {
		this.sheet.showStatGroups(this.character.chrClass == null ? - 1 : this.character.chrClass.id);
		this.updateRaceClassSelector();
		this.updateEquipment();
	},
	updateRace: function() {
		this.updateRaceClassSelector();
	},
	updateRaceClassSelector: function() {
		this.sheet.raceClassSelector.update( 
				this.character.chrRace == null ? -1 : this.character.chrRace.id, 
				this.character.chrClass == null ? - 1 : this.character.chrClass.id 
			);
	},
	selectLevel: function( level ) {
		try {
			this.character.setLevel( level );
		}
		catch( e ) {
			if( e instanceof InvalidCharacterLevelException ) {
				Tooltip.showError(e.toString());	
			}
			else {
				Tools.rethrow(e);
			}
		}
	},
	setStats: function( stats ) {
		var i;
		var cCl = this.character.chrClass;
		
		this.sheet.stats[ST_GRP_GENERAL][1].node.style.display = 
			cCl != null && GameInfo.hasMana( cCl.id, cCl.shapeForm ) ? "block" : "none";
		this.sheet.stats[ST_GRP_GENERAL][2].node.style.display = 
			cCl != null && GameInfo.hasRage( cCl.id, cCl.shapeForm ) ? "block" : "none";
		this.sheet.stats[ST_GRP_GENERAL][3].node.style.display = 
			cCl != null && GameInfo.hasEnergy( cCl.id, cCl.shapeForm ) ? "block" : "none";
		this.sheet.stats[ST_GRP_GENERAL][4].node.style.display = 
			cCl != null && GameInfo.hasFocus( cCl.id, cCl.shapeForm ) ? "block" : "none";
		this.sheet.stats[ST_GRP_GENERAL][5].node.style.display = 
			cCl != null && GameInfo.hasRunicPower( cCl.id, cCl.shapeForm ) ? "block" : "none";
		
		for( i=0; i<this.sheet.stats[ST_GRP_GENERAL].length; i++ ) {
			this.sheet.stats[ST_GRP_GENERAL][i].setValue( stats.general[i] );
		}
		for( i=0; i<this.sheet.stats[ST_GRP_ATTRIBUTES].length; i++ ) {
			this.sheet.stats[ST_GRP_ATTRIBUTES][i].setValue( stats.attributes[i] );
		}
		for( i=0; i<this.sheet.stats[ST_GRP_RESISTANCE].length; i++ ) {
			this.sheet.stats[ST_GRP_RESISTANCE][i].setValue( stats.resistance[i] );
		}
		for( i=0; i<this.sheet.stats[ST_GRP_SPELL].length; i++ ) {
			this.sheet.stats[ST_GRP_SPELL][i].setValue( stats.spell[i] );
		}
		for( i=0; i<this.sheet.stats[ST_GRP_DEFENSE].length; i++ ) {
			this.sheet.stats[ST_GRP_DEFENSE][i].setValue( stats.defense[i] );
		}
		for( i=0; i<this.sheet.stats[ST_GRP_MELEE].length; i++ ) {
			this.sheet.stats[ST_GRP_MELEE][i].setValue( stats.melee[i] );
		}
		for( i=0; i<this.sheet.stats[ST_GRP_RANGED].length; i++ ) {
			this.sheet.stats[ST_GRP_RANGED][i].setValue( stats.ranged[i] );
		}
	},
	setPreviewStats: function( previewStats ) {
		var i;
		for( i=0; i<this.sheet.stats[ST_GRP_GENERAL].length; i++ ) {
			this.sheet.stats[ST_GRP_GENERAL][i].setCompareValue( previewStats.general[i] );
		}
		for( i=0; i<this.sheet.stats[ST_GRP_ATTRIBUTES].length; i++ ) {
			this.sheet.stats[ST_GRP_ATTRIBUTES][i].setCompareValue( previewStats.attributes[i] );
		}
		for( i=0; i<this.sheet.stats[ST_GRP_RESISTANCE].length; i++ ) {
			this.sheet.stats[ST_GRP_RESISTANCE][i].setCompareValue( previewStats.resistance[i] );
		}
		for( i=0; i<this.sheet.stats[ST_GRP_SPELL].length; i++ ) {
			this.sheet.stats[ST_GRP_SPELL][i].setCompareValue( previewStats.spell[i] );
		}
		for( i=0; i<this.sheet.stats[ST_GRP_DEFENSE].length; i++ ) {
			this.sheet.stats[ST_GRP_DEFENSE][i].setCompareValue( previewStats.defense[i] );
		}
		for( i=0; i<this.sheet.stats[ST_GRP_MELEE].length; i++ ) {
			this.sheet.stats[ST_GRP_MELEE][i].setCompareValue( previewStats.melee[i] );
		}
		for( i=0; i<this.sheet.stats[ST_GRP_RANGED].length; i++ ) {
			this.sheet.stats[ST_GRP_RANGED][i].setCompareValue( previewStats.ranged[i] );
		}
	},
	updateProfessions: function() {
		var skilledProfs = [];
		for( var i=0; i<2; i++ ) {
			var prof = this.character.primaryProfessions[i];
			if( prof == null ) {
				skilledProfs.push( null );
			}
			else {
				skilledProfs.push(new SkilledPrimaryProfession(prof.id, prof.level));
			}
		}
		
		this.sheet.updateProfessions(skilledProfs, this.character.level);
	},
	setProfession: function( index, id ) {
		this.character.setProfession(index, id);
	},
	setProfessionLevel: function( index, level ) {
		this.character.setProfessionLevel( index, level );
	},
	showStatTooltip: function( group, index, node ) {
		Tooltip.showStat(
			StatTooltip.getHTML(this.character, group, index), 
			node
		);
	},
	removeItem: function( slot, index ) {
		if( index == 0 ) {
			this.character.inventory.remove(slot);
		}
	},
	clickAtItem: function( slot, index ) {
		if( index > 0 && this.character.inventory.items[slot][index] != null ) {
			this.character.inventory.swap(slot, index);
		}
	}
};