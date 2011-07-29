function CharacterSheetProxy( sheet ) {
	this.sheet = sheet;
	
	for( var i=0; i<19; i++ ) {
		this.sheet.slots[i].addListener( 'show_tooltip', new Handler(this.showItemTooltip, this) );
		this.sheet.slots[i].addListener( 'hide_tooltip', new Handler(this.hideItemTooltip, this) );
		this.sheet.slots[i].addListener( 'right_click', new Handler(this.removeItem, this) );
		this.sheet.slots[i].addListener( 'left_click', new Handler(this.clickAtItem, this) );
	}
	//
	//
	// RACE AND CLASS
	//
	//
	this.sheet.raceClassSelector.addListener( "race_select", new Handler(this.selectRace, this));
	this.sheet.raceClassSelector.addListener( "class_select", new Handler(this.selectClass, this));
	//
	// Level
	//
	this.sheet.addListener( "level_select", new Handler(this.selectLevel, this));
	//
	// Stats
	//
	this.sheet.addListener("show_stat_tooltip", new Handler(this.showStatTooltip, this));
	//
	// Professions
	//
	this.sheet.addListener("profession_select", new Handler(this.setProfession, this));
	this.sheet.addListener("profession_level_select", new Handler(this.setProfessionLevel, this));
}

CharacterSheetProxy.prototype = {
	cp: null,
	sheet: null,
	/**
	 * @param {CharacterProxy} cp
	 */
	setCharacterProxy: function( cp ) {
		
		if( this.cp != null ) {
			this.cp.removeCharacterSheetProxy( this );
		}
		
		cp.addCharacterSheetProxy( this );
		
		this.cp = cp;
	},
	selectRace: function( raceId ) {		
		if( this.cp == null ) {
			throw new Error("No CharacterProxy set!");
		}
		
		DatabaseIO.getCharacterRace( 
			raceId, 
			new Handler( this.__selectRace, this) 
		);
		Tooltip.showLoading();
	},
	__selectRace: function( serializedChrRace ) {
		var oldChrClassId = this.cp.character.chrClass == null ? -1 : this.cp.character.chrClass.id;
		var newChrClassId;
		
		this.cp.character.setRace( new CharacterRace( this.cp.character, serializedChrRace ) );
		
		newChrClassId = this.cp.character.chrClass == null ? -1 : this.cp.character.chrClass.id;
		
		if( oldChrClassId != newChrClassId || newChrClassId == -1 ) {
			this.sheet.raceClassSelector.showClassSelector();
		}
		else {
			Tooltip.enable();
		}
	},
	selectClass: function( chrClassId ) {		
		if( this.cp == null ) {
			throw new Error("No CharacterProxy set!");
		}
		
		DatabaseIO.getCharacterClass( 
			chrClassId, 
			new Handler( this.__selectClass, this) 
		);
		Tooltip.showLoading();
	},
	__selectClass: function( serializedChrClass ) {
		this.cp.character.setClass( new CharacterClass( serializedChrClass ));
		Tooltip.enable();
	},
	selectLevel: function( level ) {
		if( this.cp == null ) {
			throw new Error("No CharacterProxy set!");
		}
		
		try {
			this.cp.character.setLevel( level );
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
	setProfession: function( index, id ) {
		if( this.cp == null ) {
			throw new Error("No CharacterProxy set!");
		}
		
		this.cp.character.setProfession(index, id);
	},
	setProfessionLevel: function( index, level ) {
		this.cp.character.setProfessionLevel( index, level );
	},
	showStatTooltip: function( group, index, node ) {
		if( this.cp == null ) {
			throw new Error("No CharacterProxy set!");
		}
		
		var html = StatTooltip.getHTML(this.cp.character, group, index);
		
		if( ! html ) {
			return;
		}
		
		Tooltip.showStat(
			html, 
			node
		);
	},
	removeItem: function( slot, index ) {
		if( this.cp == null ) {
			throw new Error("No CharacterProxy set!");
		}
		
		if( index == 0 ) {
			this.cp.character.inventory.remove(slot);
		}
	},
	clickAtItem: function( slot, index ) {
		if( this.cp == null ) {
			throw new Error("No CharacterProxy set!");
		}
		
		if( index > 0 && this.cp.character.inventory.items[slot][index] != null ) {
			this.cp.character.inventory.swap(slot, index);
		}
	},

	showItemTooltip: function( slot, index ) {
		if( this.cp == null ) {
			throw new Error("No CharacterProxy set!");
		}
		
		var itm = this.cp.character.inventory.items[slot][index];
		if( itm ) {
			this.sheet.slots[slot].showTooltip( 
				ItemTooltip.getHTML(itm, this.cp.character),
				index
			);
			if( index > 0 ) {
				this.cp.character.inventory.setPreview(itm, slot, -1);
			}
		}
	},
	hideItemTooltip: function( slot, index ) {
		if( this.cp == null ) {
			throw new Error("No CharacterProxy set!");
		}
		
		if( index > 0 ) {
			this.cp.character.inventory.removePreview();
		}
		Tooltip.hide();
	}
};