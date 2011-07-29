/**
 * @constructor
 * @param {Array}
 *            serialized
 * @returns {SkillLine}
 */
function SkillLine(serialized) {
	this.id = serialized[0];
	this.name = serialized[1];
	this.category = serialized[2];
}
SkillLine.prototype = {
	id : 0,
	name : "",
	category : 0
};