/**
 * @constructor
 * @param {Array} serialized
 * @returns {SpellAuraOptions}
 */
function SpellAuraOptions( serialized ) {
	this.stacks = serialized[0];
	this.procRate = serialized[1];
	this.procCharges = serialized[2];
}
SpellAuraOptions.prototype = {
		stacks: 0,
		procRate: 0,
		procCharges: 0
};