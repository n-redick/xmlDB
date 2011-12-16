/**
 * @constructor
 * @returns {ShapeSelector}
 */
function ShapeSelector() {
	this.node = document.createElement("div");
	this.eventMgr = new GenericSubject();
	this.eventMgr.registerEvent('select_shape', ['shape_id']);
}

ShapeSelector.prototype = {
	eventMgr: null,
	node: null, showMoonkin: false,
	__onClick: function( shapeformId ){
		this.eventMgr.fire('select_shape', {'shape_id': shapeformId});
	},
	addPropagator: function(event, propagator) {
		this.eventMgr.addPropagator(event, propagator);
	},
	update: function( availableShapeforms, currentShapeformId ) {
		var parent,div;
		Tools.removeChilds(this.node);
		if( availableShapeforms != null && availableShapeforms.length != 0 )
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

				Listener.add( 
						div, 
						"mouseover", 
						Tooltip.show, 
						Tooltip, 
						[ "<div class='tooltip_spell_description'>"+availableShapeforms[i].description+"</div>"] 
				);
				div.onmouseout = function(){Tooltip.hide();};
				div.onmousemove = function(){Tooltip.move();};
				Listener.add( div, "click", this.__onClick, this, [availableShapeforms[i].id]);
				this._showMoonkin = true;
			}
			this.node.appendChild(parent);
			Tools.clearBoth(this.node);
		}
	}
};