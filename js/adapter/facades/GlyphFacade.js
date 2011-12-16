/**
 * @param {Glyph} glyph
 * @returns {GlyphFacade}
 */
function GlyphFacade( glyph, characterScope ) {
	this.__glyph = glyph;
	this.__character = characterScope;
	this.id = glyph.id;
}

GlyphFacade.prototype = {
	__glyph: null,
	__character: null,
	id: 0,
	getName: function() {
		return this.__glyph.spell.name;
	},
	getType: function() {
		return this.__glyph.type;
	},
	getTooltip: function() {
		return SpellTooltip.getHTML( this.__glyph.spell, this.__character);
	},
	getIcon: function() {
		return this.__glyph.spell.icon;
	}
};