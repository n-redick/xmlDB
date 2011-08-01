/**
 * @author LeMartin
 */

var II_DIMS = [[38,5,5],[16,0,0],[16,0,32],[16,32,32],[16,32,0]];

/**
 * @constructor
 * @param {CharacterSheet} characterSheet
 * @param {number} slot
 * @returns {ItemSlot}
 */
function ItemSlot( characterSheet, slot)
{
	this.characterSheet = characterSheet;
	this.node = document.createElement("div");
	this.iconDivs = [];
	this.borderDivs = [];
	this.highlightDivs = [];
	this.icons = [];
	this.onLeftClickHandler = null;
	this.slot = slot;
	//
	//	LISTENER
	//
	
	var size = 32;
	var top = 0;
	var left = 0;
	
	this.node.className = "character_sheet_item_parent";
	
	for (var i = 0; i < 5; i++) 
	{	
		size = II_DIMS[i][0];
		top  = II_DIMS[i][1];
		left = II_DIMS[i][2];
		
		// image
		this.icons[i] = document.createElement("img");
		this.icons[i].className = "character_sheet_item_image";
		this.icons[i].style.width = size + "px";
		this.icons[i].style.height = size + "px";
		this.iconDivs[i] = document.createElement("div");
		this.iconDivs[i].className = "character_sheet_item_image_div";
		this.iconDivs[i].style.zIndex = 3 * (5 - i) - 2;
		this.iconDivs[i].style.top = top + "px";
		this.iconDivs[i].style.left = left + "px";
		this.iconDivs[i].style.width = size + "px";
		this.iconDivs[i].style.height = size + "px";
		// border
		this.borderDivs[i] = document.createElement("div");
		this.borderDivs[i].className = "character_sheet_item_border";
		this.borderDivs[i].style.zIndex = 3 * (5 - i) - 1;
		this.borderDivs[i].style.top = (top - 1) + "px";
		this.borderDivs[i].style.left = (left - 1) + "px";
		this.borderDivs[i].style.width = size + "px";
		this.borderDivs[i].style.height = size + "px";
		// highlight
		this.highlightDivs[i] = document.createElement("div");
		this.highlightDivs[i].className = "character_sheet_item_highlight";
		this.highlightDivs[i].oncontextmenu = function(){return false;};
		Listener.add(this.highlightDivs[i],"mouseover",this.__onMouseOver,this,[i]);
		Listener.add(this.highlightDivs[i],"mouseout",this.__onMouseOut,this,[i]);
		Listener.add(this.highlightDivs[i],"click",this.__onClick,this,[i]);
		Listener.add(this.highlightDivs[i],"contextmenu",this.__onContextMenu,this,[i]);
		
		this.highlightDivs[i].ondblclick = function(){return false;};
		this.highlightDivs[i].onmousedown = function(){return false;};
		this.highlightDivs[i].onmouseup = function(){return false;};
		this.highlightDivs[i].style.zIndex = 3 * (5 - i);
		this.highlightDivs[i].style.top = top + "px";
		this.highlightDivs[i].style.left = left + "px";
		this.highlightDivs[i].style.width = size + "px";
		this.highlightDivs[i].style.height = size + "px";
		//	
		this.iconDivs[i].appendChild(this.icons[i]);
		this.node.appendChild(this.iconDivs[i]);
		this.node.appendChild(this.borderDivs[i]);
		this.node.appendChild(this.highlightDivs[i]);
		
		if( i > 0 ) {
			this.borderDivs[i].style.display = "none"; 
			this.iconDivs[i].style.display = "none";
			this.highlightDivs[i].style.display = "none";
		}
		else {
			this.icons[i].src = "images/charsheet/"+this.slot+".jpg";
		}
	}
}

ItemSlot.prototype = {
	node: null, iconDivs: [], borderDivs: [], 
	highlightDivs: [], icons: [], slot: -1, 
	quality: -1, selected: false,
	characterSheet: null,
	/**
	 * @param {number} slot
	 * @param {number} index
	 */
	__onMouseOver: function(index) { 
		this.characterSheet.showSlotTooltip( this.slot, index ); 
	},
	/**
	 * @param {number} slot
	 * @param {number} index
	 */
	showTooltip: function( html, index ) {
		if( index > 0 )
		{
			this.iconDivs[index].style.zIndex = 26;
			this.borderDivs[index].style.zIndex = 27;
			this.highlightDivs[index].style.zIndex = 28;
		}
		else {
			//this._highlightDiv[index].style.backgroundImage = "url(images/site/item_slot_over.png)";
		}
		Tooltip.showSlot( html , this.highlightDivs[index]);
	},
	__onMouseOut: function(index) {
		
		this.iconDivs[index].style.zIndex = 3 * (5 - index) - 2;
		this.borderDivs[index].style.zIndex = 3 * (5 - index) - 1;
		this.highlightDivs[index].style.zIndex = 3 * (5 - index);

		this.characterSheet.hideSlotTooltip( this.slot, index ); 
	},
	__onClick: function(index) {
		this.characterSheet.leftClickItem( this.slot, index ); 
	},
	__onContextMenu: function(index) {
		this.characterSheet.rightClickItem( this.slot, index ); 
	},
	setVisibility: function(visible) {
		this.node.style.display = (visible?"block":"none");
	},
	select: function() {
		this.node.style.backgroundImage = "url(images/site/item_border_hover.png)";
		this.selected = true;
	},
	deselect: function() {
		if( this.quality > -1 ) {
			this.node.style.backgroundImage = "url(images/site/item_border_q"+this.quality+".png)";
		}
		else {
			this.node.style.backgroundImage = "url(images/site/item_border.png)";
		}
		this.selected = false;
	},
	update: function( items ) {
		var itm;
		for(var i=0;i<5;i++){
			//
			itm = items[i];
			if (itm == null) {
				if( i > 0){
					this.borderDivs[i].style.display = "none"; 
					this.iconDivs[i].style.display = "none";
					this.highlightDivs[i].style.display = "none";
				}
				else {
					this.node.style.backgroundImage = "url(images/site/item_border.png)";
				}
				this.icons[i].src = "images/charsheet/"+this.slot+".jpg";
			}
			else {
				
				if( i > 0){
					this.borderDivs[i].style.display = "block"; 
					this.iconDivs[i].style.display = "block";
					this.highlightDivs[i].style.display = "block";
				}
				else {
					this.quality = itm.quality;
					if( this.selected ) {
						this.node.style.backgroundImage = "url(images/site/item_border_hover.png)";
					}
					else {
						if( itm.invalid ) {
							this.node.style.backgroundImage = "url(images/site/item_border_invalid.png)";
						}
						else if( this.quality > -1 ) {
							this.node.style.backgroundImage = "url(images/site/item_border_q"+this.quality+".png)";
						}
						else {
							this.node.style.backgroundImage = "url(images/site/item_border.png)";
						}
					}
				}
				if( itm.invalid ) {
					this.icons[i].src = "images/icons/r/large/" + itm.icon + ".png";
				}
				else {
					this.icons[i].src = "images/icons/large/" + itm.icon + ".png";
				}
			}
		}
	}
};

function EquippedItem ( id, icon, quality, invalid ) {
	this.id=id,this.icon=icon; this.quality=quality; this.invalid=invalid;
}
EquippedItem.prototype = {
	icon: "", quality: -1, id: 0, invalid: false
};