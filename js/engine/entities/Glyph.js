/**
 * @constructor
 * @param {Array} serialized
 * @returns {Glyph}
 */
function Glyph( serialized ) {
	this.id = serialized[0];
	this.type = serialized[1];
	this.spell = serialized[2] ? new Spell(serialized[2]) : null;
}

Glyph.MAJOR = 0;
Glyph.MINOR = 1;
Glyph.PRIME = 2;

Glyph.prototype = {
	id: 0, type: 0, spell: null
};