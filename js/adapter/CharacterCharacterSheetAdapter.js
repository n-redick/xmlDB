/**
 * @constructor
 * @param {Character} character
 * @returns {CharacterCharacterSheetAdapater}
 */
function CharacterCharacterSheetAdapater( character, sheet ) {
	
	character.addObserver( this );
	sheet.addObserver( this );
	
	this.sheet = sheet;
	this.character = character;
	
	this.init();
}

CharacterCharacterSheetAdapater.prototype = {
	sheet: null, character: null,
	//
	//#########################################################################
	//
	// Event handler - Character
	//
	//#########################################################################
	//
	onClassChange: function( newClass ) {	
		this.updateClass(newClass);
	},
	onRaceChange: function( newRace ) {
		this.updateRace(newRace);
	},
	onLevelChange: function( newLevel) {
		this.updateLevel(newLevel);
	},
	onItemAdded: function( slot, itm ) {
		this.updateSlot(slot);
	},
	onItemRemoved: function( slot ) {
		this.updateSlot(slot);
	},
	onProfessionChange: function( index, newProfession ) {
		this.updateProfessions();
	},
	onProfessionLevelChange: function( index, level ) {
		this.updateProfessions();
	},
	onStatsChange: function( stats ) {
		this.updateStats( stats );
	},
	onPreviewStatsChange: function( previewStats ) {
		this.updatePreviewStats( previewStats );
	},
	onCharacterLoaded: function( character ) {
		this.init();
	},
	//
	//#########################################################################
	//
	// Event handler - CharacterSheet
	//
	//#########################################################################
	//
	onRaceSelect: function( raceId ) {		
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
	onClassSelect: function( chrClassId ) {
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
	onLevelSelect: function( level ) {
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
	onProfessionSelect: function( index, id ) {
		this.character.setProfession(index, id);
	},
	onProfessionLevelSelect: function( index, level ) {
		this.character.setProfessionLevel( index, level );
	},
	onStatTooltipShow: function( group, index, node ) {
		var html = StatTooltip.getHTML(this.character, group, index);
		
		if( ! html ) {
			return;
		}
		
		Tooltip.showStat(
			html, 
			node
		);
	},
	onStatTooltipHide: function( group, index, node ) {
		Tooltip.hide();
	},
	onItemRightClick: function( slot, index ) {
		if( index == 0 ) {
			this.character.inventory.remove(slot);
		}
	},
	onItemLeftClick: function( slot, index ) {
		if( index > 0 && this.character.inventory.items[slot][index] != null ) {
			this.character.inventory.swap(slot, index);
		}
	},

	onItemTooltipShow: function( slot, index ) {
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
	onItemTooltipHide: function( slot, index ) {
		if( index > 0 ) {
			this.character.inventory.removePreview();
		}
		Tooltip.hide();
	},
	//
	//#########################################################################
	//
	// Methods
	//
	//#########################################################################
	//
	detach: function() {
		this.character.removeObserver( this );
		this.sheet.removeObserver( this );
	},
	init: function() {
		this.updateProfessions();
		this.updateStats(this.character.stats);
		this.updateRace();
		this.updateClass();
		this.updateEquipment();
		this.updateLevel();
	},
	updateClass: function( newClass ) {
		this.sheet.showStatGroups(this.character.chrClass == null ? - 1 : this.character.chrClass.id);
		this.sheet.updateLevelSelector( this.character.getMinLevel(), Character.MAX_LEVEL);

		this.updateRaceClassSelector();
		this.updateEquipment();
	},
	updateRace: function( newRace ) {
		this.updateRaceClassSelector();
	},
	updateLevel: function( level ) {
		this.sheet.updateLevel(this.character.level);
	},
	updateRaceClassSelector: function() {
		this.sheet.raceClassSelector.update( 
			this.character.chrRace == null ? -1 : this.character.chrRace.id, 
			this.character.chrClass == null ? - 1 : this.character.chrClass.id 
		);
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
	updateEquipment: function() {
		for( var i=0; i<19; i++ ) {
			this.updateSlot(i);
		}
	},
	updateStats: function( stats ) {
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
	updatePreviewStats: function( previewStats ) {
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
	} 
};