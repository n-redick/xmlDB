/**
 * @constructor
 * @param childNodes
 * @param linkNames
 * @param cssClass
 * @returns {TabFolder}
 */
function TabFolder( childNodes, linkNames, cssClass ) {
	
	this.__folder = new StackedDiv(childNodes.length);
	this.__menu = new Menu(linkNames, cssClass, this.show, this);
	
	this.node = this.__folder.node;
	this.menu = this.__menu.node;
	for( var i=0; i<childNodes.length; i++ ) {
		this.__folder.items[i].appendChild(childNodes[i]);
	}
}
TabFolder.prototype = {
	menu: null, node: null, shown: 0, __menu: null, __folder: null,
	show: function( index ) {
		this.shown = index;
		this.__folder.show(index);
		this.__menu.select(index);
	}
};