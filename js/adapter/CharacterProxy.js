/**
 * @constructor
 * @param {Character} character
 * @returns {CharacterProxy}
 */
function CharacterProxy( character ) {
	
	this.character = character;

	this.character.inventory.addListener( 'item_added', new Handler(this.updateSlot, this));
	this.character.inventory.addListener( 'item_removed', new Handler(this.updateSlot, this));
	this.character.inventory.addListener( 'items_swapped', new Handler(this.updateSlot, this));
	//
	//
	// RACE AND CLASS
	//
	//
	this.character.addListener( "class_change", new Handler(this.updateClass, this));
	this.character.addListener( "race_change", new Handler(this.updateRace, this));
	//
	// init
	//
	// Level
	//
	this.character.addListener("level_change", new Handler(this.updateLevel, this));
	//
	// Stats
	//
	this.character.addListener("stats_change", new Handler(this.updateStats, this));
	this.character.addListener("preview_stats_change", new Handler(this.updatePreviewStats, this));
	//
	// init
	//
	// Professions
	//
	this.character.addListener("profession_change", new Handler(this.updateProfessions, this));
	this.character.addListener("profession_level_change", new Handler(this.updateProfessions, this));	
	//
	// init
}

CharacterProxy.prototype = {
	character: null, sps: [],
	addCharacterSheetProxy: function( sp ) {
		this.sps.push(sp);
		
		this.updateProfessions();
		this.updateStats(this.character.stats);
		this.updateRace();
		this.updateClass();
		this.updateEquipment();
		this.updateLevel();
	},
	removeCharacterSheetProxy: function( sheet ) {
		for( var i=0; i<this.sps.length; i++ ) {
			if( this.sps[i] === sheet ) {
				this.sps.splice(i,1);
			}
		}
		throw new Error("Unable to remove sheet! Not found!");
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
		for( var i=0; i<this.sps.length; i++ ) {
			this.sps[i].sheet.slots[slot].update(equippedItems);
		}
	},
	//
	//
	// RACE AND CLASS
	//
	//
	updateClass: function() {
		for( var i=0; i<this.sps.length; i++ ) {
			this.sps[i].sheet.showStatGroups(this.character.chrClass == null ? - 1 : this.character.chrClass.id);
		}
		for( i=0; i<this.sps.length; i++ ) {
			this.sps[i].sheet.updateLevelSelector( this.character.getMinLevel(), Character.MAX_LEVEL);
		}
		this.updateRaceClassSelector();
		this.updateEquipment();
	},
	updateRace: function() {
		this.updateRaceClassSelector();
	},
	updateRaceClassSelector: function() {
		for( var i=0; i<this.sps.length; i++ ) {
			this.sps[i].sheet.raceClassSelector.update( 
					this.character.chrRace == null ? -1 : this.character.chrRace.id, 
					this.character.chrClass == null ? - 1 : this.character.chrClass.id 
				);
		}
	},
	updateLevel: function() {
		for( var i=0; i<this.sps.length; i++ ) {
			this.sps[i].sheet.updateLevel(this.character.level);
		}
	},
	updateStats: function( stats ) {
		var i;
		var cCl = this.character.chrClass;

		for( var j=0; j<this.sps.length; j++ ) {
			this.sps[j].sheet.stats[ST_GRP_GENERAL][1].node.style.display = 
				cCl != null && GameInfo.hasMana( cCl.id, cCl.shapeForm ) ? "block" : "none";
			this.sps[j].sheet.stats[ST_GRP_GENERAL][2].node.style.display = 
				cCl != null && GameInfo.hasRage( cCl.id, cCl.shapeForm ) ? "block" : "none";
			this.sps[j].sheet.stats[ST_GRP_GENERAL][3].node.style.display = 
				cCl != null && GameInfo.hasEnergy( cCl.id, cCl.shapeForm ) ? "block" : "none";
			this.sps[j].sheet.stats[ST_GRP_GENERAL][4].node.style.display = 
				cCl != null && GameInfo.hasFocus( cCl.id, cCl.shapeForm ) ? "block" : "none";
			this.sps[j].sheet.stats[ST_GRP_GENERAL][5].node.style.display = 
				cCl != null && GameInfo.hasRunicPower( cCl.id, cCl.shapeForm ) ? "block" : "none";
			
			for( i=0; i<this.sps[j].sheet.stats[ST_GRP_GENERAL].length; i++ ) {
				this.sps[j].sheet.stats[ST_GRP_GENERAL][i].setValue( stats.general[i] );
			}
			for( i=0; i<this.sps[j].sheet.stats[ST_GRP_ATTRIBUTES].length; i++ ) {
				this.sps[j].sheet.stats[ST_GRP_ATTRIBUTES][i].setValue( stats.attributes[i] );
			}
			for( i=0; i<this.sps[j].sheet.stats[ST_GRP_RESISTANCE].length; i++ ) {
				this.sps[j].sheet.stats[ST_GRP_RESISTANCE][i].setValue( stats.resistance[i] );
			}
			for( i=0; i<this.sps[j].sheet.stats[ST_GRP_SPELL].length; i++ ) {
				this.sps[j].sheet.stats[ST_GRP_SPELL][i].setValue( stats.spell[i] );
			}
			for( i=0; i<this.sps[j].sheet.stats[ST_GRP_DEFENSE].length; i++ ) {
				this.sps[j].sheet.stats[ST_GRP_DEFENSE][i].setValue( stats.defense[i] );
			}
			for( i=0; i<this.sps[j].sheet.stats[ST_GRP_MELEE].length; i++ ) {
				this.sps[j].sheet.stats[ST_GRP_MELEE][i].setValue( stats.melee[i] );
			}
			for( i=0; i<this.sps[j].sheet.stats[ST_GRP_RANGED].length; i++ ) {
				this.sps[j].sheet.stats[ST_GRP_RANGED][i].setValue( stats.ranged[i] );
			}
		}
	},
	updatePreviewStats: function( previewStats ) {
		var i;
		for( var j=0; j<this.sps.length; j++ ) {
			for( i=0; i<this.sps[j].sheet.stats[ST_GRP_GENERAL].length; i++ ) {
				this.sps[j].sheet.stats[ST_GRP_GENERAL][i].setCompareValue( previewStats.general[i] );
			}
			for( i=0; i<this.sps[j].sheet.stats[ST_GRP_ATTRIBUTES].length; i++ ) {
				this.sps[j].sheet.stats[ST_GRP_ATTRIBUTES][i].setCompareValue( previewStats.attributes[i] );
			}
			for( i=0; i<this.sps[j].sheet.stats[ST_GRP_RESISTANCE].length; i++ ) {
				this.sps[j].sheet.stats[ST_GRP_RESISTANCE][i].setCompareValue( previewStats.resistance[i] );
			}
			for( i=0; i<this.sps[j].sheet.stats[ST_GRP_SPELL].length; i++ ) {
				this.sps[j].sheet.stats[ST_GRP_SPELL][i].setCompareValue( previewStats.spell[i] );
			}
			for( i=0; i<this.sps[j].sheet.stats[ST_GRP_DEFENSE].length; i++ ) {
				this.sps[j].sheet.stats[ST_GRP_DEFENSE][i].setCompareValue( previewStats.defense[i] );
			}
			for( i=0; i<this.sps[j].sheet.stats[ST_GRP_MELEE].length; i++ ) {
				this.sps[j].sheet.stats[ST_GRP_MELEE][i].setCompareValue( previewStats.melee[i] );
			}
			for( i=0; i<this.sps[j].sheet.stats[ST_GRP_RANGED].length; i++ ) {
				this.sps[j].sheet.stats[ST_GRP_RANGED][i].setCompareValue( previewStats.ranged[i] );
			}
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
		for( i=0; i<this.sps.length; i++ ) {
			this.sps[i].sheet.updateProfessions(skilledProfs, this.character.level);
		}
	}
};