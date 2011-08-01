/**
 * @constructor
 * @returns {CharacterSheetEventManager}
 */
function CharacterSheetEventManager() {
	GenericEventManager.call( this, null );
}
CharacterSheetEventManager.prototype.observers = [new CharacterSheetObserver];
CharacterSheetEventManager.prototype = new GenericEventManager;

CharacterSheetEventManager.prototype.fireRaceSelect = function( raceId ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onRaceSelect( raceId );
};

CharacterSheetEventManager.prototype.fireClassSelect = function( classId ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onClassSelect( classId );
};

CharacterSheetEventManager.prototype.fireLevelSelect = function( level ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onLevelSelect( level );
};

CharacterSheetEventManager.prototype.fireProfessionSelect = function( index, id ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onProfessionSelect( index, id );
};

CharacterSheetEventManager.prototype.fireProfessionLevelSelect = function( index, level ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onProfessionLevelSelect( index, level );
};

CharacterSheetEventManager.prototype.fireStatTooltipShow = function( group, index, node ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onStatTooltipShow( group, index, node );
};

CharacterSheetEventManager.prototype.fireStatTooltipHide = function( group, index, node ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onStatTooltipHide( group, index, node );
};

CharacterSheetEventManager.prototype.fireItemTooltipShow = function( slot, index ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onItemTooltipShow( slot, index );
};

CharacterSheetEventManager.prototype.fireItemTooltipHide = function( slot, index ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onItemTooltipHide( slot, index );
};

CharacterSheetEventManager.prototype.fireItemRightClick = function( slot, index ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onItemRightClick( slot, index );
};

CharacterSheetEventManager.prototype.fireItemLeftClick = function( slot, index ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onItemLeftClick( slot, index );
};