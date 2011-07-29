/**
 * @constructor
 * @returns {PresenceSelector}
 */
function PresenceSelector() {
	this.node = document.createElement('div');
}
PresenceSelector.prototype = {
	node: null,
	__onClick: function( presenceId ) {
		
	},
	update: function( availablePresences, currentPresenceId ) {
		Tools.removeChilds(this.node);
		
		if( availablePresences.length == 0 ) {
			return;
		}
		for( var i=0; i<ps.length; i++ ) {
			var div = document.createElement('div');
			div.className = 'ps_presence';
			div.style.backgroundImage = 
				'url(images/icons/' + 
				( availablePresences[i].id == currentPresenceId ? '' : 'g/' ) + 
				'small/'+currentPresenceId[i].icon+'.png)';
			this.node.appendChild(div);
			
			Listener.add( div, "mouseover", Tooltip.showSpell, Tooltip, [currentPresenceId[i].id] );
			div.onmouseout = function(){Tooltip.hide();};
			div.onmousemove = function(){Tooltip.move();};
			Listener.add( div, "click", this.__onClick, this, [currentPresenceId[i].id]	);
		}
		
		Tools.clearBoth(this.node);
	}
};

/**
 * @constructor
 * @param id
 * @param icon
 * @param description
 * @returns {AvailablePresence}
 */
function AvailablePresence( id, icon, description ) {
	this.id = id, this.icon = icon; this.description = description;
}
AvailablePresence.prototype = {
	id: 0, icon: "", description: ""
};