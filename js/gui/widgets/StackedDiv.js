/**
 * @constructor
 * @param size
 * @returns {StackedDiv}
 */
function StackedDiv( size ) {
	this.items = new Array(size);
	this.node = document.createElement("div");
	for( var i = 0; i < size; i++ ) {
		this.items[i] = document.createElement("div");
		this.items[i].style.display = ( i == 0 ? "block" : "none" );
		this.items[i].style.width = "100%";
		this.items[i].style.height = "100%";
		this.node.appendChild(this.items[i]);
	}
	this.shown = 0;
}

StackedDiv.prototype.items = null;
StackedDiv.prototype.node = null;
StackedDiv.prototype.shown = 0;
StackedDiv.prototype.onChangeHandler = null;

StackedDiv.prototype.show = function( index ) {
	if( index == this.shown ) {
		return;
	}
	var old = this.shown;
	this.items[index].style.display = "block";
	this.items[old].style.display = "none";
	this.shown = index;
	if( this.onChangeHandler ) {
		this.onChangeHandler[0].apply(this.onChangeHandler[1],[index,old]);
	}
};

StackedDiv.prototype.setOnChangeHandler = function(handler, scope){
	this.onChangeHandler = [handler, scope];
};