/**
 * @author LeMartin
 */
var Engine = {
	gui: null,
	initialise : function ( settings ) {
		
		if( settings.isPlanner ) {
			Engine.gui = new Gui();
			
			var sp = new CharacterSheetProxy(Engine.gui.characterSheet);
			var c = new Character();
			
			if( settings.character ) {
				c.load( settings.character );
			}
			
			sp.setCharacterProxy( new CharacterProxy(c) );
			
			document.getElementById("mtf_p").className = "ix_center cp_main_menu";
//			document.getElementById("mm_w").className = "mm_w2";
			document.getElementById("mtf_p").appendChild(Engine.gui.folder.menu);
			document.getElementById("planner_parent").appendChild(Engine.gui.node);
		}
		
	},
	loggedIn: function() {
		
	},
	loggedOut: function() {
		
	},
	showItemTooltip: function( itemId ) {
		ItemCache.asyncGet( itemId, new Handler(
			function(itemId) {
				var itm = ItemCache.get(itemId);
				if( itm != null ) {
					Tooltip.showMovable( ItemTooltip.getHTML( itm , null) );
				}
			}, window
		), [itemId]);
	}
};
//
//#############################################################################
//
//	Initialise Engine after page load
//
//#############################################################################
//
window["__engine_init"] = Engine.initialise;
window["g_showItemTooltip"] = Engine.showItemTooltip;
//