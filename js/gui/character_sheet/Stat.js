var ST_GRP_GENERAL = 0;
var ST_GRP_ATTRIBUTES = 1;
var ST_GRP_MELEE = 2;
var ST_GRP_RANGED = 3;
var ST_GRP_SPELL = 4;
var ST_GRP_DEFENSE = 5;
var ST_GRP_RESISTANCE = 6;

var ST_SPEED = 1<<0;
var ST_DAMAGE_RANGE = 1<<2;
var ST_SHOW_PLUS = 1<<3;
var ST_PER_CENT = 1<<4;
var ST_DPS = 1<<5;
var ST_MH_OH = 1<<6;
var ST_NA_RANGED = 1<<7;
var ST_MASTERY = 1<<8;

var ST_TYPE = [
	[0,0,0],
	[0,0,0,0,0],
	[ST_DAMAGE_RANGE|ST_MH_OH,ST_DPS|ST_MH_OH,0,ST_SPEED|ST_MH_OH,ST_PER_CENT,ST_PER_CENT|ST_SHOW_PLUS,ST_PER_CENT,0|ST_MH_OH,ST_MASTERY],
	[ST_DAMAGE_RANGE|ST_NA_RANGED,ST_DPS|ST_NA_RANGED,0,ST_SPEED|ST_NA_RANGED,ST_PER_CENT,ST_PER_CENT|ST_SHOW_PLUS,ST_PER_CENT,ST_MASTERY],
	[0,ST_PER_CENT,ST_PER_CENT|ST_SHOW_PLUS,0,0,0,ST_PER_CENT,ST_MASTERY],
	[0,ST_PER_CENT,ST_PER_CENT,ST_PER_CENT,0],
	[0,0,0,0,0]
];

/**
 * @constructor
 * @param {number} group
 * @param {number} index
 * @returns {Stat}
 */
function Stat( group, index ) 
{
	this.eventMgr = new EventManager(["show_tooltip"]);
	this.group = group;
	this.index = index;
	var div = document.createElement("div");
	div.className = 'stat_table_value_div';
	this.node = document.createElement("div");
	this.node.className = 'stat_table_name_div';
	this.node.innerHTML = locale['CS_Stats'][group][index];
	this.node.appendChild(div);
	
	this.compareNode = document.createElement('span');
	this.compareNode.className = 'stat_table_stat_compare_span';
	this.valueNode = document.createElement('span');
	this.valueNode.className = 'stat_table_stat_span';
	this.valueNode.innerHTML = 0;
	div.appendChild(this.compareNode);
	div.appendChild(this.valueNode);
	// TODO: 
	Listener.add(this.node,"mouseover",this.eventMgr.fire , this.eventMgr, ["show_tooltip", [group, index, this.node]]);
	this.node.onmouseout = function(){Tooltip.hide();};
	
	this.flags = ST_TYPE[this.group][this.index];
}

Stat.prototype = {
	eventMgr: null,
	group: -1, 
	index: -1, 
	name: "", 
	tooltip: "", 
	node: null, 
	value: 0, 
	compare: 0, 
	valueNode: null, 
	flags: 0,
	//
	//#########################################################################
	//
	//	METHODS
	//
	//#########################################################################
	//
	addListener: function( event, handler ) {
		this.eventMgr.addListener(event, handler);
	},
	setValue: function( value ){
		this.value = value;
	
		this.valueNode.innerHTML = "";
		
		if( value === null && this.flags&ST_NA_RANGED ) {
			this.valueNode.innerHTML += "N/A";
			return;
		}
		
		if( this.flags&ST_MH_OH ) {
			this.addValue(value[0]);
			if( value[1] != null ) {
				this.valueNode.innerHTML += "/";
				this.addValue(value[1]);
			}
		}
		else {
			this.addValue(value);
		}
		
	},
	addValue: function( value ) {
		if( this.flags&ST_PER_CENT )	
		{
			this.valueNode.innerHTML += ( this.flags&ST_SHOW_PLUS ? "+" : "" ) + TextIO.formatFloat(value,2)+"%";
		}
		else if( this.flags&ST_DPS) {
			this.valueNode.innerHTML += TextIO.formatFloat(value,1);
		}
		else if( this.flags&ST_MASTERY) {
			this.valueNode.innerHTML += TextIO.formatFloat(value,2);
		}
		else if( this.flags&ST_SPEED ) {
			this.valueNode.innerHTML += TextIO.formatFloat(value/1000,2);
		}
		else if( this.flags&ST_DAMAGE_RANGE ) {
			this.valueNode.innerHTML += value[0] + "-" + value[1];
		}
		else {
			this.valueNode.innerHTML += Math.floor(value);
		}
	},
	
	resetCompare: function() {
		this.compareNode.innerHTML = "";
	},
	setCompareValue: function( compare ){
		var cmp1, cmp2;
		this.compareNode.innerHTML = "";
		
		if( compare === null && this.flags&ST_NA_RANGED ) {
			return;
		}
	
		if( this.flags&ST_MH_OH ) {
			if( this.flags&ST_DAMAGE_RANGE ) {
				return;
			}
			cmp1 = this.addCompare(compare[0], this.value[0]);
			if( compare[1] != null ) {
				cmp2 = this.addCompare(compare[1], this.value[1]);
				if( cmp1 || cmp2 ) {
					this.compareNode.innerHTML = (cmp1?cmp1:"0")+"/"+(cmp2?cmp2:"0");
				}
			}
			else {
				if( cmp1 != null ) {
					this.compareNode.innerHTML = cmp1;
				}
			}
		}
		else {
			cmp1 = this.addCompare(compare, this.value);
			this.compareNode.innerHTML = (cmp1?cmp1:"");
		}
	},
	addCompare: function( compare, value ) {
		var lt;
		
		if( ((ST_MASTERY|ST_PER_CENT)&this.flags) != 0 ) {
			lt = Math.floor( (compare - value) * 100 ) / 100;
		}
		else {
			lt = Math.floor( compare - value );
		}
		
		if ( lt != 0 ) {
			if( this.flags&ST_SPEED ) {
				return "<span class='"+
					( lt > 0 ? CSS_COMPARE_RED_CLASS : CSS_COMPARE_GREEN_CLASS )+"'>"+
					( lt > 0 ?'+':'-') + 
					TextIO.formatFloat2(Math.abs(lt)/1000)+
					"</span>";
			}
			return "<span class='"+
				( lt > 0 ? CSS_COMPARE_GREEN_CLASS : CSS_COMPARE_RED_CLASS )+"'>"+
				( lt > 0 ?'+':'-') + 
				( (this.flags&ST_PER_CENT) != 0 ? TextIO.formatFloat2(Math.abs(lt)) : Math.abs(lt) )  +
				"</span>";
		}
		return null;
	}
};