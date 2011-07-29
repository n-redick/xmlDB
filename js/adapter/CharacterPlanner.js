/**
 * @constructor
 * @returns {CharacterManager}
 */
function CharacterManager( gui ) {
	this.gui = gui;
	this.sp = new CharacterSheetProxy(gui.characterSheet);
}

CharacterManager.prototype = {
	gui: null, sp: null,
	cps: [],
	cursor: 0,
	
	addCharacter: function( character ) {
		CharacterProxy cp = new CharacterProxy( character );
		this.cps.push(cp);
		this.gui.characterSheet.setCharacterProxy( cp );
	}
};
