/**
 * @constructor
 * @param layers
 * @returns {LayeredDiv}
 */
function LayeredDiv(layers) {
	this.layers = new Array(layers);
	
	for(var i = 0; i < layers; i++ ) {
		this.layers[i] = document.createElement("div");
		if( i == 0 )
		{
			this.layers[i].style.position = "relative";
		}
		else 
		{
			this.layers[i].style.position = "absolute";
			this.layers[i].style.zIndex = i; 
			this.layers[0].appendChild(this.layers[i]);
		}
		
	}
}

LayeredDiv.prototype.layers = null;