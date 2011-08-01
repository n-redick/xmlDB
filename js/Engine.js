function EngineImpl() { /***/ }

EngineImpl.prototype = {
	characterMgr: null,
	eventMgr: null,
	addListener: function ( event, handler ) {
		this.eventMgr.addListener( event, handler );
	},
	initialise : function ( settings ) {
		
		this.eventMgr = new EventManager(['character_change']);
		
		if( settings.isPlanner ) {
			var gui = new Gui();
			new EngineGuiAdapter( this, gui );
			//
			//
			this.characterMgr = new CharacterManager();
			this.characterMgr.addPropagator( 'character_change', this.eventMgr );
			//
			//
			var c = new Character();
			this.characterMgr.addCharacter(c);
			//
			//
			if( settings.character ) {
				c.load( settings.character );
			}
			//
			//
			document.getElementById("mtf_p").className = "ix_center cp_main_menu";
//				document.getElementById("mm_w").className = "mm_w2";
			document.getElementById("mtf_p").appendChild( gui.folder.menu);
			document.getElementById("planner_parent").appendChild( gui.node);
		}
		
	},
	getCurrentCharacter: function() {
		return this.characterMgr.getCurrentCharacter();
	},
	loggedIn: function() {
		//TODO implement - on log in		
	},
	loggedOut: function() {
		//TODO implement - on log out
	},
	showItemTooltip: function( itemId ) {
		ItemCache.asyncGet( itemId, new Handler(
			function( id ) {
				var itm = ItemCache.get( id );
				if( itm != null ) {
					Tooltip.showMovable( ItemTooltip.getHTML( itm , null) );
				}
			}, window
		), [itemId]);
	}
};

var Engine = new EngineImpl();
//
//#############################################################################
//
//	Initialise Engine after page load
//
//#############################################################################
//
window["__engine_init"] = function( settings ){ Engine.initialise.call( Engine, settings ); };
window["g_showItemTooltip"] = function( itemId ){ Engine.showItemTooltip.call( Engine, itemId ); };
//