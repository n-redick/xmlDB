/**
 * @constructor
 * @returns {CharacterObserver}
 */
function CharacterObserver() {/***/}

CharacterObserver.prototype = {
	onClassChange: function( newClass ) {/***/},
	onRaceChange: function( newRace ) {/***/},
	onLevelChange: function( newLevel) {/***/},
	onItemAdded: function( slot, itm ) {/***/},
	onItemRemoved: function( slot ) {/***/},
	onProfessionChange: function( index, newProfession ) {/***/},
	onProfessionLevelChange: function( index, level ) {/***/},
	onStatsChange: function( stats ) {/***/},
	onPreviewStatsChange: function( previewStats ) {/***/},
	onCharacterLoaded: function( character ) {/***/}
};