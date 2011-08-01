/**
 * @constructor
 * @returns {CharacterEventManager}
 */
function CharacterEventManager() {
	GenericEventManager.call(this);
}

CharacterEventManager.prototype.observers = [new CharacterObserver];
CharacterEventManager.prototype = new GenericEventManager;

CharacterEventManager.prototype.fireRaceChange = function( newRace ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onRaceChange( newRace );
};

CharacterEventManager.prototype.fireClassChange = function( newClass ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onClassChange( newClass );
};

CharacterEventManager.prototype.fireLevelChange = function( newLevel ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onLevelChange( newLevel );
};

CharacterEventManager.prototype.fireItemAdded = function( slot, itm ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onItemAdded( slot, itm );
};

CharacterEventManager.prototype.fireItemRemoved = function( slot ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onItemRemoved( slot );
};

CharacterEventManager.prototype.fireProfessionChange = function( index, newProfession ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onProfessionChange( index, newProfession );
};

CharacterEventManager.prototype.fireProfessionLevelChange = function( index, level ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onProfessionLevelChange( index, level );
};

CharacterEventManager.prototype.fireStatsChange = function( stats ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onStatsChange( stats );
};

CharacterEventManager.prototype.firePreviewStatsChange = function( stats ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onPreviewStatsChange( stats );
};

CharacterEventManager.prototype.fireCharacterLoaded = function( character ) {
	if( this.silent ) return;
	for( var k in this.observers ) this.observers[k].onCharacterLoaded( character );
};