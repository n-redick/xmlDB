/**
 * @constructor
 * @param {Character} character
 * @returns {BuffBar}
 */
function BuffBar () {
	this.node = document.createElement('div');
	this.node.className = 'bb_p';
}

BuffBar.prototype = {
	/** @type {Element} */
	node : null,
	/** @type {Handler} */
	removeHandler : null,
	/** @type {Handler} */
	clickHandler : null,
	/**
	 * 
	 */
	update : function( activeBuffs ) {
		Tools.removeChilds(this.node);
		
		for( var i in activeBuffs ) {
			this.__showBuff( activeBuffs[i] );
		}
		Tools.clearBoth(this.node);
	},
	/**
	 * @param {ActiveBuff} b
	 */
	__showBuff : function( activeBuff ) {
		// TODO Use some css dude
		var d = document.createElement('img');
		d.className = 'bb_buff';
		d.src = 'images/icons/small/'+activeBuff.icon+'.png';
		d.oncontextmenu = function(){return false;};
		Listener.add( d, 'contextmenu', this.__onRemove, this, [activeBuff.id] );
		Listener.add( d, 'click', this.__onClick, this, [activeBuff.id] );

		d.onmouseout = function(){Tooltip.hide();};
		d.onmousemove = function(){Tooltip.move();};
		if( activeBuff.stackable > 1 ) {
			d.appendChild(Tools.outline(activeBuff.stacks));
		}
		Listener.add(d,"mouseover",Tooltip.showSpell,Tooltip,[activeBuff.id]);
		
		this.node.appendChild(d);
	},
	/**
	 * @param {number} b
	 */
	__onRemove : function( b ) {
		if( this.removeHandler ) {
			this.removeHandler.notify([b]);
		}
		this.update();
	},

	/**
	 * @param {number} b
	 */
	__onClick: function( b ) {
		if( this.clickHandler ) {
			this.clickHandler.notify([b]);
		}
		this.update();
	},
	
	setRemoveHandler : function( handler ) {
		this.removeHandler = handler;
	},
	
	setClickHandler : function( handler ) {
		this.clickHandler = handler;
	}
};

/**
 * @constructor
 * @param id
 * @param icon
 * @param stackable
 * @param stacks
 * @returns {ActiveBuff}
 */
function ActiveBuff ( id, icon, stackable, stacks) {
	
}
ActiveBuff.prototype = {
	id: -1, icon: "", stackable: false, stacks: 0
};