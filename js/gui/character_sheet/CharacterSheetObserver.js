/**
 * @constructor
 * @returns {CharacterSheetObserver}
 */
function CharacterSheetObserver() {/***/}

CharacterSheetObserver.prototype = {
	onRaceSelect: function( raceId ) {/***/},
	onClassSelect: function( chrClassId ) {/***/},
	onLevelSelect: function( level ) {/***/},
	onProfessionSelect: function( index, id ) {/***/},
	onProfessionLevelSelect: function( index, level ) {/***/},
	onStatTooltipShow: function( group, index, node ) {/***/},
	onStatTooltipHide: function( group, index, node ) {/***/},
	onItemRightClick: function( slot, index ) {/***/},
	onItemLeftClick: function( slot, index ) {/***/},
	onItemTooltipShow: function( slot, index ) {/***/},
	onItemTooltipHide: function( slot, index ) {/***/}
};