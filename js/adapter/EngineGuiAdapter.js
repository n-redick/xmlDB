/**
 * @constructor
 * @param {EngineImpl} engine
 * @param {Gui} gui
 * @returns {EngineGuiAdapter}
 */
function EngineGuiAdapter( engine, gui ) {

	var leftClickHandler = new Handler( this.__onItemSlotLeftClick, this );
	
	this.engine = engine;
	this.gui = gui;
	this.characterObserver = new CharacterObserver();
	this.sheetObserver = new CharacterSheetObserver();
	
	this.gui.characterSheet.addObserver(this.sheetObserver);
	
	this.sheetObserver.onItemLeftClick = function(slot, index) {
		leftClickHandler.notify( [slot, index ]);
	};
	
//	for( var i=0; i< 19; i++ ) {
//		gui.characterSheet.slots[i].addListener( 'left_click', leftClickHandler );
//	}
	
	gui.addListener('import', new Handler( this.__onImport, this));
	
	this.itemList = new ItemList();
	
	this.itemList.addListener('click', new Handler( this.__onItemListClick, this ));
	
	gui.initLists( this.itemList.gui );
	
	this.itemList.gui.show( false );
	
	engine.addListener( 'character_change', new Handler(this.__onCharacterChange, this));
	
	this.itemList.addListener( 'update', new Handler(	
		function( list ) {
			new ListBackEndProxy("php/interface/get_items.php").update(this.itemList);
		}, this
	));
	
	this.itemList.addListener( 'show_tooltip', new Handler(
		function( itm ) {
			Tooltip.showMovable( ItemTooltip.getHTML(itm, this.engine.getCurrentCharacter()) );
			this.engine.getCurrentCharacter().inventory.setPreview( itm, this.slot, this.socket );
		}, this
	));
		
	this.itemList.addListener( 'move_tooltip', new Handler(
		function() {
			Tooltip.move();
		}, this
	));
		
	this.itemList.addListener( 'hide_tooltip', new Handler(
		function() {
			Tooltip.hide();
			this.engine.getCurrentCharacter().inventory.removePreview();
		}, this
	));
}

EngineGuiAdapter.prototype = {
	gui: null, engine: null,
	itemList: null,
	slot: -1,
	socket: -1,
	adapter: null,
	characterObserver: null,
	/**
	 * @param {Character} character
	 */
	__onCharacterChange: function( character ) {
		
		if( this.adapter ) {
			this.adapter.detach();
		}

		this.adapter = new CharacterCharacterSheetAdapater( character, this.gui.characterSheet );
		
		character.addObserver(this.characterObserver);
	},
	__onItemSlotLeftClick: function( slot, index ) {
		if( index == 0 ) {
			this.gui.characterSheet.selectSlot(slot);

			var cc = this.engine.getCurrentCharacter();
			var args = "";
			
			sl = cc.chardevSlotToBlizzardSlotMask(slot);
			icl = cc.chardevSlotToItemClass(slot);
			
			this.itemList.setSlot( sl, icl[0], icl[1] );
			
			this.itemList.filterMgr.hideFilter('usablebyclass', true);
			this.itemList.filterMgr.hideFilter('issocketablegem', true);
			this.itemList.filterMgr.hideFilter('canbeusedwithlvl', true);
			this.itemList.filterMgr.hideFilter('class', true);
			this.itemList.filterMgr.hideFilter('gemreqitemlvl', true);
			this.itemList.setWeaponSlot( cc.isWeaponSlot( slot ) );
			
			if( slot!=16 && slot!=17 && slot!=18 ) {
				this.itemList.filterMgr.hideFilter('slot', true);
			}
			else {
				this.itemList.filterMgr.hideFilter('slot', false);
			}
			if( slot==1 || slot == 12 || slot == 13 || slot == 14 || slot == 15 || slot == 6 || slot == 5) {
				this.itemList.filterMgr.hideFilter('subclass', true);
			}
			else {
				this.itemList.filterMgr.hideFilter('subclass', false);
			}

			args = args.replace(/\bclass\.\w+\.[^;]*;/,"") + (icl[0] >= 0 ? "class.eq."+icl[0]+";" : "");
			args = args.replace(/\bslot\.\w+\.[^;]*;/,"") + (sl > 0 ? "slot.ba."+sl+";" : "");
			args = args.replace(/\bsubclass\.\w+\.[^;]*;/,"") + (icl[1] > 0 ? "subclass.ba."+icl[1]+";" : "");
			
			//
			//TODO: store filters
			this.itemList.set( args, null, null, 1);
			
			this.itemList.update();
			
			this.itemList.gui.show( true );
			
			this.slot = slot;
		}
	},
	/**
	 * @param {Item} itm
	 */
	__onItemListClick: function( itm ) {
		var cc = this.engine.getCurrentCharacter();
		if( cc && this.slot != -1 ) {
			try {
				cc.inventory.set( this.slot, itm );
			}
			catch( e ) {
				if( e instanceof InvalidItemException ) {
					Tooltip.showError(e);
				}
				else {
					Tools.rethrow(e);
				}
			}
		}
	},
	__onImport: function( name, server, region ) {
		try {
			CharacterIO.readFromArmory(name, server, region, new Handler( this.__onImportCallback, this ));

			Tooltip.showLoading();
		}
		catch( e ) {
			
		}
	},
	__onImportCallback: function( character, exception ) {
		if ( exception != null ) {
			if( exception instanceof GenericAjaxException ) {
				Tooltip.showError(exception);
			}
			else if( exception instanceof BadResponseException ) {
				Tooltip.showError(exception);
			}
			else {
				Tools.rethrow(exception);
			}
		}
		else {
			this.engine.getCurrentCharacter().load(character);

			this.gui.folder.show(Gui.TAB_CHARACTER_SHEET);
			
			Tooltip.enable();
		}
	}
};