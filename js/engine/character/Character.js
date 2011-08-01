/**
 * @constructor
 */
function Character() {
//	this.eventMgr = new EventManager([
//		'class_change', 'race_change', 
//		'level_change', 'character_loaded', 
//		'stats_change', 'preview_stats_change', 
//		'profession_level_change', 'profession_change',
//		//
//		// propagated events
//		'item_added', 'item_removed', 'items_swapped'
//	]);
	this.eventMgr = new CharacterEventManager();
	
	this.primaryProfessions = [null, null];
	this.stats = new Stats(this);
	this.previewStats = new Stats(this);
	this.inventory = new Inventory( this );
	this.auras = new Auras( this );
	this.buffs = new Buffs();
	

	var calculateStats = new Handler(this.calculateStats, this);
	var calculatePreviewStats = new Handler(this.calculatePreviewStats, this);
	
	this.inventory.addListener( 'item_added',  calculateStats);
	this.inventory.addListener( 'item_removed', calculateStats);
	this.inventory.addListener( 'items_swapped', calculateStats);
	
	
//	this.inventory.addPropagator( 'item_added',  this.eventMgr);
//	this.inventory.addPropagator( 'item_removed', this.eventMgr);
//	this.inventory.addPropagator( 'items_swapped', this.eventMgr);

	this.inventory.addListener( 'preview_set', calculatePreviewStats);
	this.inventory.addListener( 'preview_removed', calculatePreviewStats);
	
	this.setLevel(Character.MAX_LEVEL);
	//
	// TODO
	this.__lastSaved = null; 
}

Character.MAX_LEVEL = 85;

Character.prototype = {
	eventMgr: null,
	
	chrRace: null,
	chrClass: null,
	level: Character.MAX_LEVEL,
	inventory: null,
	buffs: null,
	primaryProfessions: null,
	stats: null,
	previewStats: null,
	auras: null,
	__lastSaved: null,
	/**
	 * @param {CharacterObserver} observer
	 */
	addObserver: function( observer ) {
		this.eventMgr.addObserver(observer);
	},
	/**
	 * @param {CharacterObserver} observer
	 */
	removeObserver: function( observer ) {
		this.eventMgr.removeObserver(observer);
	},
	setLevel : function( level ) {		
		if (level >= this.getMinLevel() && level <= MAX_LEVEL ) {
			if ( this.chrClass != null ) {
				this.chrClass.setLevel(level);
			}
			this.level = level;
			
			for( var i=0; i<2; i++ ) {
				if( !this.primaryProfessions[i] ) {
					continue;
				}
				if( 0 == GameInfo.getMaximumProfessionLevel(this.primaryProfessions[i].id, this.level) ) {
					this.primaryProfessions[i] = null;
				}
				this.primaryProfessions[i].setLevel(this.level);
			}
		}
		else {
			throw new InvalidCharacterLevelException( level );
		}

		this.calculateStats();
		
		this.eventMgr.fireLevelChange(level);
	},
	/**
	 * @param {CharacterClass} chrClass
	 */
	setClass: function( chrClass ) {
		if( chrClass != null ) {
			if( this.chrRace == null || ! this.chrRace.isValidCharacterClass(chrClass.id) ) {
				throw new IllegalRaceClassException( this.chrRace, chrClass );
			}
			this.chrClass = chrClass;
			try {
				this.chrClass.setLevel(this.level);
			}
			catch (e) {
				if( e instanceof InvalidCharacterLevelException ) {
					if( e.level > Character.MAX_LEVEL ) {
						this.chrClass.setLevel(Character.MAX_LEVEL);
					}
					else {
						this.chrClass.setLevel(this.getMinLevel());
					}
				}
				else {
					Tools.rethrow(e);
				}
			}
		}
		else {
			this.chrClass = null;
		}
		
		this.calculateStats();
		
		this.eventMgr.fireClassChange(chrClass);
	},
	/**
	 * @param {CharacterRace} chrRace
	 */
	setRace: function( chrRace ) {
		if( chrRace == null ) {
			this.setClass(null);
		}
		else {
			if( this.chrClass != null && ! chrRace.isValidCharacterClass( this.chrClass.id) ) {
				this.setClass(null);
			}
			this.chrRace = chrRace;
		}
		
		this.calculateStats();
		
		this.eventMgr.fireRaceChange(chrRace);
	},
	serialise : function() {
		//TODO serialise character
	},
	calculateStats: function() {
		this.stats.calculate( false, false );
		this.eventMgr.fireStatsChange(this.stats);
	},
	calculatePreviewStats: function() {
		this.previewStats.calculate( true, false );
		this.eventMgr.firePreviewStatsChange(this.previewStats);
	},
	//
	//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	//
	//	USABLE ITEMS AND ABILITIES
	//
	//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	//
	/**
	 * @param {Item} itm
	 * @returns {Boolean}
	 */
	canWear: function( itm ) {
		if( itm.itemClass == 4 ) {
			if( ((1<<itm.itemSubClass) & this.getArmorMask()) != 0) {
				return true;
			}
		}
		else if( itm.itemClass == 2 ) {
			return true;
		}
		return false;
	},
	fitsItemClassRequirements: function( itm ) {
		return itm.chrClassMask == 0 || 
			(itm.chrClassMask&(1535)) == 1535
			|| this.chrClass != null && ( itm.chrClassMask&(1<<(this.chrClass.id-1))) != 0; 
	},
	/**
	 * @public
	 * @param {number} slot
	 * @returns {number} blizzard slot mask
	 */
	chardevSlotToBlizzardSlotMask: function( slot ) {
		switch( slot ) {
		case 0: return 1<<1;
		case 1: return 1<<2;
		case 2: return 1<<3;
		case 3: return 1<<16;
		case 4: return 1<<20|1<<5;
		case 5: return 1<<4;
		case 6: return 1<<19;
		case 7: return 1<<9;
		case 8: return 1<<10;
		case 9: return 1<<6;
		case 10: return 1<<7;
		case 11: return 1<<8;
		case 12: return 1<<11;
		case 13: return 1<<11;
		case 14: return 1<<12;
		case 15: return 1<<12;
		case 16: 
			if( this.chrClass != null ) {
				switch( this.chrClass.id ) {
				case ROGUE	: return 1<<21|1<<13;
				default: return 1<<21|1<<17|1<<13;
				}
			}
			return 1<<21|1<<13;
		case 17: 
			if( this.chrClass != null ) {
				switch( this.chrClass.id ) {
				case WARRIOR	: return 1<<23|1<<14| ( this.chrClass.talents.selectedTree == 1 ? 1<<13|1<<22 : 0 ) | ( this.canDualWieldTwoHandedWeapons() ? 1<<17 : 0 );
				case PALADIN	: return 1<<23|1<<14;
				case HUNTER 	: return 1<<23|1<<22|1<<13;
				case ROGUE		: return 1<<23|1<<22|1<<13;
				case DEATHKNIGHT: return 1<<23|1<<22|1<<13;
				case SHAMAN		: return 1<<23|1<<14| ( this.chrClass.talents.selectedTree == 1 ? 1<<13|1<<22 : 0 );
				default			: return 1<<23;
				}
			}
			return 1<<23;
		}
		return 0;
	},
	getDefaultArmorMask: function() {
		var defaultMask = 1<<0|1<<1|1<<2|1<<3|1<<4;
		if( this.chrClass != null ) {
			switch( this.chrClass.id ) {
			case 1: defaultMask = this.level >= 40 ? 1<<4 : 1<<3; break;
			case 2: defaultMask = this.level >= 40 ? 1<<4 : 1<<3; break;
			case 3: defaultMask = this.level >= 40 ? 1<<3 : 1<<2; break;
			case 4: defaultMask = 1<<2; break;
			case 5: defaultMask = 1<<1; break;
			case 6: defaultMask = 1<<4; break;
			case 7: defaultMask = this.level >= 40 ? 1<<3 : 1<<2; break;
			case 8: defaultMask = 1<<1; break;
			case 9: defaultMask = 1<<1; break;
			case 11: defaultMask = 1<<2; break;
			}
		}
		return defaultMask;
	},
	chardevSlotToItemClass: function( slot ) {	
		switch( slot ) {
		case 0:
		case 2:
		case 4:
		case 7:
		case 8:
		case 9:
		case 10:
		case 11:
			return [4,this.getDefaultArmorMask()];
		case 3: 
			return [4,1<<1];
		case 5: 
		case 6: 
			return [4,1<<0|1<<1];
		case 1:
		case 12:
		case 13:
		case 14:
		case 15:
			return [4,1<<0];
		case 18:
			if( this.chrClass != null ) {
				switch( this.chrClass.id ) {
				case WARLOCK:
				case MAGE:
				case PRIEST:
					return [2,1<<19];
				case WARRIOR:
				case HUNTER:
				case ROGUE:
					return [2,1<<2|1<<3|1<<16|1<<18];
				case PALADIN:
				case SHAMAN:
				case DEATHKNIGHT:
				case DRUID:
					return [4,1<<11];
				}
			}
			return [100,1];
		}
		return [-1,0];
	},
	getArmorMask: function() {
		if( this.chrClass != null ) {
			switch( this.chrClass.id ) {
			case 1:
				return ( this.level >= 40 ? 31 : 15 ) + 64;
			case 2:
				return ( this.level >= 40 ? 31 : 15 ) + 64 + 2048;
			case 6:
				return ( this.level >= 40 ? 31 : 15 ) + 2048;
			case 3: 
				return this.level >= 40 ? 15 : 7;
			case 7:
				return ( this.level >= 40 ? 15 : 7 ) + 64 + 2048;
			case 11:
				return 7 + 2048;
			case 4: 
				return 7;
			case 5:
			case 8:
			case 9:
				return 3;
			}
		}
		return 31;
	},
	canDualWieldTwoHandedWeapons : function(){
		return this.chrClass != null && this.chrClass.id == WARRIOR && this.chrClass.talents.talents[1][6][1].spent > 0;
	},
	hasMana: function() {
		if( this.chrClass == null ) { 
			return false;
		}
		return GameInfo.hasMana(this.chrClass.id,0/*TODO shapeform*/);
	},
	/**
	 * @public
	 * @returns {number} energy type
	 */
	getEnergyType: function() {
		if( this.chrClass == null ) { 
			return NO_ENERGY;
		}
		return GameInfo.getEnergyType(this.chrClass.id,0/*TODO shapeform*/);
	},
	isSpellAffine: function() {
		var clId = this.chrClass ? this.chrClass.id : 0;
		var tt = this.chrClass ? this.chrClass.talents.selectedTree : -1;
		
		return clId == WARLOCK || clId == PRIEST || clId == MAGE || clId == DRUID && tt != 1 || clId == SHAMAN && tt != 1 || clId == PALADIN && tt != 2;
	},
	//
	//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	//
	//	PROFESSIONS
	//
	//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	//
	setProfession: function( index, id ) {
		if( id > 0 ) {
			this.primaryProfessions[index] = new Profession(this,SERIALIZED_PROFESSIONS[id]);
		}
		else {
			this.primaryProfessions[index] = null;
		}

		this.calculateStats();
		
		this.eventMgr.fireProfessionChange(index, this.primaryProfessions[index]);
	},
	setProfessionLevel: function( index, level ) {
		
		this.primaryProfessions[index].setLevel(level);
		
		this.calculateStats();
		
		this.eventMgr.fireProfessionChange(index, this.primaryProfessions[index].level);
		
	},
	hasBlacksmithingSocket : function(slot)
	{
		var bs = this.getPrimaryProfessionById(PRIMARY_PROFESSION_BLACKSMITHING);
		if( 
			( slot == 7 || slot == 8 ) 
			&& this.inventory.get(slot) != null 
			&& this.inventory.get(slot).level >= 60 
			&& bs != null
			&& bs.level >= 400 )
		{
			return true;
		}
		if( slot == 9 && this.level >= 70 && this.inventory.get(slot) != null && this.inventory.get(slot).level >= 80)
		{
			return true;
		}
		return false;
	},
	
	/**
	 * @param {number} skillLineId
	 */
	getPrimaryProfessionById : function( skillLineId ) {
		if( this.primaryProfessions[0] && this.primaryProfessions[0].id == skillLineId ) {
			return this.primaryProfessions[0];
		}
		else if( this.primaryProfessions[1] && this.primaryProfessions[1].id == skillLineId ) {
			return this.primaryProfessions[1];
		}
		return null;
	},
	//
	//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	//
	//	ACTIVE SPELLS
	//
	//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	//
	__testAndApplyIndirectAura: function( spellId ) {
		//
		// If the spell applying the aura is available and not already applied, 
		// add the spell as new buff.
		//
		if( 
			  this.auras.isActive(spellId) && 
			! this.buffs.isActive(spellId) 
		) {
			this.buffs.addInternal(spellId, false, true );
		}
		//
		// If the spell is not specc'ed, and an internal buff is active,
		// remove the buff.
		//
		else if( 
			! this.auras.isActive(spellId) && 
			  this.buffs.isActive(spellId)
		) {
			this.buffs.removeInternal(spellId, false );
		}
	},
	getActiveSpells: function() {
		var bs = this.buffs.buffs, i = 0;
		//var professionBuffs = [];
		
		if (this.chrClass) { 
			this.chrClass.getActiveSpells(this.auras);
		}
		
		if (this.chrRace) { 
			this.chrRace.getActiveSpells(this.auras);
		}
		
		for( i=0; i<2; i++ ) {
			if( !this.primaryProfessions[i] ) {
				continue;
			}
			var s = this.primaryProfessions[i].getBuffSpell();
			if( s ) {
				//professionBuffs.push(s.id);
				this.auras.add(s);
			}
		}
		//this.buffs.setProfessionBuffs(professionBuffs);
		
		if( this.chrClass ) {
			switch( this.chrClass.id ) {
			case WARRIOR:
				this.__testAndApplyIndirectAura( RAMPAGE );
				break;
			case HUNTER:
				this.__testAndApplyIndirectAura( HUNTING_PARTY);
				break;
			case ROGUE:
				this.__testAndApplyIndirectAura( HONOR_AMONG_THIEVES );
				this.__testAndApplyIndirectAura( MASTER_OF_SUBTLETY );
				break;
			case DEATHKNIGHT:
				this.__testAndApplyIndirectAura( IMPROVED_ICY_TALONS );
				break;
			case SHAMAN:
				this.__testAndApplyIndirectAura( ELEMENTAL_OATH );
				break;
			case DRUID:
				if( this.auras.isActive(17007) && this.chrClass != null && ((1<<this.chrClass.shapeForm) & (1<<CAT|1<<BEAR|1<<DIRE_BEAR)) != 0 ) {
					this.buffs.addInternal(LEADER_OF_THE_PACK, false, false);
				}
				else {
					this.buffs.removeInternal(LEADER_OF_THE_PACK, false);
				}
				break;
			}
		}
		
		for( i in bs ) {
			this.auras.addBuff(bs[i]);
		}
	},
	isWeaponSlot: function( slot ) {
		return slot == 16 || 
			slot == 17 && this.chrClass != null && GameInfo.canDualWield( this.chrClass.id ) || 
			slot == 18 && this.chrClass != null && ( 1<<this.chrClass.id & (1<<WARRIOR|1<<ROGUE|1<<HUNTER|1<<PRIEST|1<<MAGE|1<<WARLOCK)) != 0;
	},
	//
	//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	//
	//	SERIALISE AND DESERIALISE
	//
	//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	//
	load: function(profile)
	{
		var i, j=0, itm, gem, spell;
		if( profile == null ) {
			return;
		}
		this.name = profile[0][0];
		this.description = profile[0][1];
		this.setRace(new CharacterRace(this,profile[0][2]));
		this.setClass(new CharacterClass(profile[0][3]));
		this.setLevel(profile[0][4]);

		if( this.chrClass ) {
			this.chrClass.setShapeform(profile[0][5]?profile[0][5]:0);
		}
		
		var presence = profile[0][6] ? profile[0][6] : 0 ;
		if( presence == 0 && this.chrClass != null && this.chrClass.id == DEATHKNIGHT ) {
			switch( profile[4] ) {
			case 0: presence = BLOOD_PRESENCE; break;
			case 1: presence = FROST_PRESENCE; break;
			case 2: presence = UNHOLY_PRESENCE; break;
			default: presence = BLOOD_PRESENCE; break;
			}
			this.chrClass.setPresence(presence);
		}
		
		if( this.chrClass ) {
			if( profile[4] === 2 || profile[4] === 1 || profile[4] === 0 ) {
				this.chrClass.talents.selectTree(profile[4]);
			}
			if( profile[2] ) {
				this.chrClass.talents.setDistribution(profile[2],true);
			}
			
			if( profile[5] ) {
				for( i=0; i<profile[5].length; i++ ) {
					if( !profile[5][i] ) {
						continue;
					}
					this.setProfession( i, profile[5][i][0] );
					this.primaryProfessions[i].setLevel(profile[5][i][1]);
				}
			}
			
			for( i=0; i<profile[3].length;i++ ) {
				if( !profile[3][i] ) {
					continue;
				}
				var g = new Glyph(profile[3][i]);
				this.chrClass.addGlyph( g.type,g );
			}
		}
		
		for( i=0; i<INV_ITEMS; i++ ) {
			if( ! profile[1][i] ) {
				continue;
			}
			if( profile[1][i][0] ) {
				itm = new Item(profile[1][i][0]);
				try {
					this.inventory.set(i,itm);
				}
				catch( e ) {
					if( e instanceof InvalidItemException ) {
						// continue with the next item
						continue;
					}
					// else rethow the exception, to be handled somewhere else
					Tools.rethrow(e);
				}
				for( j=0; j<3; j++ ) {
					if ( profile[1][i][1+j] ) {
						gem = new Item(profile[1][i][1+j]);
						itm.addGem( gem ,j);
						ItemCache.set(gem.clone());
					}
				}
				if( profile[1][i][4] ) {
					itm.addEnchant( new SpellItemEnchantment( profile[1][i][4] ) );
				}
				/*random properties, apply before reforging!*/
				if( profile[1][i][6] != null && profile[1][i][6] != 0 ) {
					itm.setRandomEnchantment(profile[1][i][6]);
				}
				if( profile[1][i][5] && profile[1][i][5][0] != -1 && profile[1][i][5][1] != -1 ) {
					try {
						itm.reforge(profile[1][i][5][0], profile[1][i][5][1]);
					}
					catch( e ) {
						if( e instanceof InvalidReforgeException ) {
							// ignore the reforge
						}
						else {
							Tools.rethrow(e);
						}
					}
				}
				if( profile[1][i][7] ) {
					for( j=0; j<profile[1][i][7].length; j++ ) {
						itm.addEnchant( new SpellItemEnchantment( profile[1][i][7][j] ) );
					}
				}
				ItemCache.set(itm.clone());
			}
			else {
				this.inventory.remove(i);
			}
		}
		
		for( i in profile[6] ) {
			spell = new Spell(profile[6][i][0]);
			SpellCache.set(spell);
			this.buffs.set(new Buff(spell,profile[6][i][1]));
		}
		this.calculateStats();
		
		// TODO
		//this.lastSaved = this.toArray();
		
		this.eventMgr.fireCharacterLoaded( this );
	},
	getMinLevel: function(){
		if( this.chrClass != null && this.chrClass.id == DEATHKNIGHT ) {
			return 55;
		}
		return 1;
	},
	toArray: function() {
		//TODO implement toArray
	}
};
/**
 * @constructor
 */
function IllegalRaceClassException( chrRace, chrClass ) {
	this.chrRace = chrRace;
	this.chrClass = chrClass;
}
IllegalRaceClassException.prototype = {
	chrRace: null, chrClass: null,
	toString: function() {
		return "Illegal combination of race ("+this.chrRace+") and class("+this.chrClass+").";
	}
};
/**
 * @constructor
 */
function InvalidCharacterLevelException( level ) {
	this.level = level;
}
InvalidCharacterLevelException.prototype = {
	level: null
};