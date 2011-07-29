/**
 * @constructor
 * @param serialized
 * @returns {SpellClassOptions}
 */
function SpellClassOptions(serialized) {
	this.classId = serialized[0];
}
SpellClassOptions.prototype = {
	classId : 0
};
