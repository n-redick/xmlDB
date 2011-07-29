/**
 * @constructor
 * @param {Character} character
 * @returns {ShapeSelector}
 */
function ShapeSelector() {
	this.node = document.createElement("div");
	this.eventMgr = new EventManager(["select_shape"]);
}

ShapeSelector.prototype = {
	eventMgr: null,
	node: null, showMoonkin: false,
	__onClick: function(){},
	__onMouseOver: function(){},
	__onMouseOut: function(){},
	//
	//#########################################################################
	//
	//	METHODS
	//
	//#########################################################################
	//
	update: function( availableShapeforms, currentShapeformId ) {
		var parent,div;
		Tools.removeChilds(this._node);
		if( availableShapeforms.lenght != 0 )
		{
			parent = document.createElement("div");
			for (var i = 0; i < availableShapeforms.length; i++) 
			{
				div = document.createElement("div");
				div.className = "cs_shape";
				div.style.backgroundImage = 
					"url(images/icons/" + 
					( availableShapeforms[i].id == currentShapeformId ? "" : "g/" )+
					"small/" + availableShapeforms[i].icon + ".png)";
				
				parent.appendChild(div);

				Listener.add( div, "mouseover", Tooltip.showShape, Tooltip, [availableShapeforms[i].description] );
				div.onmouseout = function(){Tooltip.hide();};
				div.onmousemove = function(){Tooltip.move();};
				Listener.add( div, "click", this.__onClick, this, [availableShapeforms[i].id]);
				this._showMoonkin = true;
			}
			this._node.appendChild(parent);
			Tools.clearBoth(this._node);
		}
	}
};

/**
 * @constructor
 * @param {number} id
 * @param {string} icon
 * @param {string} description
 * @returns {AvailableShapeform}
 */
function AvailableShapeform( id, icon, description ) {
	this.id = id; this.icon = icon; this.description = description;
} 
AvailableShapeform.prototype = {
	id: 0, icon: "", description: ""
};