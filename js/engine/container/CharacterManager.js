/**
 * @constructor
 * @returns {CharacterManager}
 */
function CharacterManager( ) {
	this.characters = [];
	this.eventMgr = new EventManager(['character_change']);
}

CharacterManager.prototype = {
	characters: [],
	eventMgr: null,
	cursor: -1,
	addListener: function( event, handler) { 
		this.eventMgr.addListener( event, handler );
	},
	addPropagator: function( event, handler) { 
		this.eventMgr.addPropagator( event, handler );
	},
	addCharacter: function( character ) {
		this.characters.push( character );
		
		this.cursor = this.characters.length - 1;
		
		this.eventMgr.fire( 'character_change', [character] );
	},

	removeCharacter: function( character ) {
		for( var k in this.characters ) {
			if( this.characters[k] != character ) {
				continue;
			}

			this.characters[k].splice( k , 1 );
			
			if( k == this.cursor ) {
				if( this.characters.length == 0 ) {
					this.cursor == -1;
				}
				else {
					if( this.cursor > 0 ) {
						this.cursor -- ;
					}
//					else {
//						this.cursor;
//					}
				}
			}
			
			return;
		}
	},
	
	getCurrentCharacter: function() {
		if( this.cursor == -1 ) {
			return null;
		}
		return this.characters[ this.cursor ];
	}
};