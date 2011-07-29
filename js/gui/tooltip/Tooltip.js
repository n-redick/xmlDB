function TooltipImpl() {
	this.errorNode = document.createElement("div");
	this.errorNode.className = 'tt_msg_c';
}
var TT_MAX_SIZE = 350;
var TT_PADDING = 10;
TooltipImpl.prototype = {
	//
	//
	//	
	div: null,
	content: null,
	overlay: null,
	disabled: false,
	errorShown: false,
	errorNode: null,
	x: 0, y: 0,
	//
	//
	//
	__createDiv : function() {
		this.content = document.createElement("div");
		this.div = document.createElement("div");
		this.div.className = "tooltip_div";
		
		var sg = new StaticGrid(3,3);
		sg.cells[0][0].innerHTML = "<div class='tt_bg_lt'></div>";
		sg.cells[0][1].className = 'tt_bg_t';
		sg.cells[0][2].innerHTML = "<div class='tt_bg_rt'></div>";
		sg.cells[1][0].className = 'tt_bg_l';
		sg.cells[1][1].appendChild(this.content); this.content.className = 'tt_bg';
		sg.cells[1][2].className = 'tt_bg_r';
		sg.cells[2][0].innerHTML = "<div class='tt_bg_lb'></div>";
		sg.cells[2][1].className = 'tt_bg_b';
		sg.cells[2][2].innerHTML = "<div class='tt_bg_rb'></div>";
		
		this.div.appendChild(sg.node);
		document.body.appendChild(this.div);
	},
	__showTooltip: function( html ) {
		if( this.div == null ){
			this.__createDiv();
		}

		this.div.style.width = "";
		this.div.style.whiteSpace = "nowrap";
		this.content.innerHTML = html;
		this.div.style.display = "block";
		
		if( this.div.offsetWidth > TT_MAX_SIZE ) {
			this.__setTooltipSize(TT_MAX_SIZE);
		}
	},
	__setTooltipSize: function( size ) {
		this.div.style.whiteSpace = "normal";
		this.div.style.width = size+"px";
		if( this.div.firstChild.offsetWidth > size ) {
			this.div.style.width = this.div.firstChild.offsetWidth + "px";
		}
	},
	__improvePosition: function(x,y) {
		var s = Tools.windowSize();
		var st = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
		if (this.div) 
		{
			if ((y + this.div.offsetHeight + 24) > s[1] + st ) 
				y = s[1] + st - this.div.offsetHeight - 24;
			if ((x + this.div.offsetWidth) > (document.body.scrollLeft + document.body.offsetWidth)) 
				x -= this.div.offsetWidth + 20;
		}
		return [Math.max(0,x),Math.max(0,y)];
	},
	__getPosition: function(oElement){
		var x=0;
		var y=0;
		var w=oElement.offsetWidth;
		var h=oElement.offsetHeight;
		while( oElement != null ) {
			y += oElement.offsetTop;
			x += oElement.offsetLeft;
			oElement = oElement.offsetParent;
		}
		return [x,y,w,h];
	},
	__center: function( node ) {
		var hNode = node.scrollHeight;
		var wNode = node.scrollWidth;
		var size = Tools.windowSize();
		var lBody = document.body.scrollLeft;
		var tBody = document.body.scrollTop;
		
		node.style.marginLeft = Math.max(0, lBody + ((size[0] - wNode) >> 1) ) + "px";
		node.style.marginTop = Math.max(0, tBody + ((size[1] - hNode ) >> 1) ) + "px";
	},
	__disable: function() {
		if( this.overlay == null ) {
			this.overlay = document.getElementById("tt_overlay");
		}
		var size = Tools.windowSize();
		this.overlay.style.width = Math.max( size[0], document.body.scrollWidth) + "px";
		this.overlay.style.height = Math.max( size[1], document.body.scrollHeight) + "px";
		this.overlay.style.display = "block";
		this.disabled = true;
		this.overlay.onclick = null;
	},
	move: function() {
		var y = this.y + 10;
		var x = this.x + 10;
		var pos = this.__improvePosition(x,y);
		if ( this.div ) 
		{
			this.div.style.left = pos[0] + "px";
			this.div.style.top = pos[1] + "px";
		}
	},
	handleMove: function(ev){
		if (!ev){
			ev = window.event;
		}
		if((document.all)&&document.getElementById){
			this.x = ev.clientX+document.documentElement.scrollLeft;
			this.y = ev.clientY+document.documentElement.scrollTop;
		}
		else{
			this.x = ev.pageX;
			this.y = ev.pageY;
		}
	},
	handleKeyDown: function( event ) {
		if( event.keyCode == 27 && this.disabled ) {
			this.enable();
		}
	},
	//
	//
	//
	//
	//
	initialise: function() {
		Listener.add(document.body,"mousemove",Tooltip.handleMove, Tooltip, null );
		Listener.add(document.body,"keydown",Tooltip.handleKeyDown, Tooltip, null );
	},
	showSlot: function(html,caller) {	
		var pos = this.__getPosition(caller);
		this.__showTooltip(html);		
		pos = this.__improvePosition(pos[0] + pos[2] + 10,pos[1]);
		this.div.style.left = pos[0] + "px";
		this.div.style.top = pos[1]+"px";
	},
	hide: function(){
		if( this.div != null ){
			this.div.style.display = "none";
		}
	},
	showDisabled: function( node ) {
		this.__disable();
		Tools.setChild( this.overlay, node);
		this.__center(node);
	},
	enable: function() {
		Tools.removeChilds(this.overlay);
		this.overlay.style.display = "none";
		this.disabled = false;
		this.errorShown = false;
	},
	showError: function( str ) {		
		var e = "<span class=\"tt_error_msg\">"+str+"</span>";
		
		if( this.errorShown ) {
			this.errorNode.innerHTML = e + "<br />" + this.errorNode.innerHTML;
		}
		else {
			this.errorShown = true;
			this.errorNode.innerHTML = e + "<br /><span class=\"tt_close_notice\">Left click or hit escape to continue.</span>";
		}
		
		this.showDisabled(this.errorNode);
		this.overlay.onclick = function(){Tooltip.enable();};
	},
	showLoading: function() {
		var n = document.createElement("div");
		n.className = 'tt_loading';
		n.innerHTML = "Loading";
		this.showDisabled(n);
	},
	showStat: function( html, node ) {
		this.__showTooltip(html+"</table>");
		var pos = this.__getPosition(node);
		this.div.style.left = (pos[0] + pos[2]) + "px";
		this.div.style.top = pos[1] + "px";
		
		if( this.div.offsetWidth > 300 ) {
			this.__setTooltipSize(300);
		}
	},
	showMovable: function( html ) {
		this.__showTooltip(html);
		this.move();
	},
	show: function( html ) {
		this.__showTooltip(html);
	}
};
var Tooltip = new TooltipImpl();
//
//#############################################################################
//
//	Initialise Engine after page load
//
//#############################################################################
//
window["__tooltip_init"] = Tooltip.initialise;
window["g_moveTooltip"] = function(){Tooltip.move.call(Tooltip);};
window["g_hideTooltip"] = function(){Tooltip.hide.call(Tooltip);};
//