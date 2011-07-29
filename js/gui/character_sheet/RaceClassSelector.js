/**
 * @author LeMartin
 */

var CHR_RACE_CLASS_MASK = {
	1: 1|2|4|8|16|32|128|256,
	2: 1|4|8|32|64|128|256,
	3: 1|2|4|8|16|32|64|128|256,
	4: 1|4|8|16|32|128|1024,
	5: 1|4|8|16|32|128|256,
	6: 1|2|4|16|32|64|1024,
	7: 1|8|16|32|128|256,
	8: 1|4|8|16|32|64|128|256|1024,
	9: 1|4|8|16|32|64|128|256,
	10: 1|2|4|8|16|32|128|256,
	11: 1|2|4|16|32|64|128,
	22: 1|4|8|16|32|128|256|1024
};

var CHR_RACE_ORDER = [[1,3,4,7,11,22],[2,5,6,8,10,9]];

/**
 * @constructor
 * @returns {RaceClassSelector}
 */
function RaceClassSelector() {
	
	this.eventMgr = new EventManager(["race_select", "class_select"]);
	
	var layoutGrid = new StaticGrid(1,2);
	var layoutGrid2 = new StaticGrid( 7, 2 );
	var d1,d2;
	this.node = document.createElement("div");
	this.node.className = 'rcs_parent';
	this.selectRace = document.createElement("div");
	this.selectRace.className = 'rcs_icon_race_container';
	this.selectClass = document.createElement("div");
	this.selectClass.className = 'rcs_icon_container';
	this.chrRace = document.createElement("div");
	this.chrRace.className = "character_race_icon";
	this.chrRace.style.backgroundImage = "url(images/site/race_class/medium/empty.png)";
	
	this.raceIcon = document.createElement("img");
	this.raceIcon.className = "rcs_icon_s";
	this.raceIcon.src = "images/site/race_class/medium/empty.png";
	this.chrRace = new LayeredDiv(4);
	this.chrRace.layers[0].appendChild(this.raceIcon);
	this.chrRace.layers[0].className = "rcs_icon_l";
	this.chrRace.layers[1].className = "rcs_shadow";
	this.chrRace.layers[2].className = "rcs_border";
	this.chrRace.layers[3].className = "rcs_event_l";
	layoutGrid.cells[0][0].appendChild(this.chrRace.layers[0]);
	
	this.classIcon = document.createElement("img");
	this.classIcon.className = "rcs_icon_s";
	this.classIcon.src = "images/site/race_class/medium/empty.png";
	this.chrClass = new LayeredDiv(4);
	this.chrClass.layers[0].appendChild(this.classIcon);
	this.chrClass.layers[0].className = "rcs_icon_l";
	this.chrClass.layers[1].className = "rcs_shadow";
	this.chrClass.layers[2].className = "rcs_border";
	this.chrClass.layers[3].className = "rcs_event_l";
	layoutGrid.cells[0][1].appendChild(this.chrClass.layers[0]);
	this.node.appendChild(layoutGrid.node);

	d1 = document.createElement("div"); d1.className = 'rcs_select_header'; d1.innerHTML = "Select a Race:";
	d2 = document.createElement("div"); d2.className = 'rcs_close'; d2.onclick = function(){Tooltip.enable();};
	this.selectRace.appendChild(d1);this.selectRace.appendChild(d2);
	
	layoutGrid2.cells[0][0].innerHTML = "<div class='rcs_faction_alliance'>Alliance</div>";
	layoutGrid2.cells[0][1].innerHTML = "<div class='rcs_faction_horde'>Horde</div>";
	
	for( var j = 0; j<2; j++ ) {
		for( var i = 0; i<CHR_RACE_ORDER[j].length; i++ ) {
			var div = document.createElement("div");
			div.className = "rcs_race_icon";
			div.style.backgroundImage = "url(images/site/race_class/medium/chr_race_"+CHR_RACE_ORDER[j][i]+".png)";
			Listener.add(div,"click",this.__onRaceIconClick,this,[CHR_RACE_ORDER[j][i]]);
			layoutGrid2.cells[1+i][j].appendChild(div);
		}
	}
	
	this.selectRace.appendChild(layoutGrid2.node);
	
	Listener.add(this.chrClass.layers[3],"click",this.showClassSelector,this,[]);
	Listener.add(this.chrRace.layers[3],"click",this.showRaceSelector,this,[]);
	
	Listener.add(this.chrClass.layers[3],"mouseover",this.__onMouse,this,[1,1]);
	Listener.add(this.chrRace.layers[3],"mouseover",this.__onMouse,this,[0,1]);
	Listener.add(this.chrClass.layers[3],"mouseout",this.__onMouse,this,[1,0]);
	Listener.add(this.chrRace.layers[3],"mouseout",this.__onMouse,this,[0,0]);
}

RaceClassSelector.prototype = {
	eventMgr: null,
	node : null,
	selectRace : null,
	selectClass : null,
	chrRace : null,
	raceIcon : null,
	chrClass : null,
	classIcon : null,
	raceChangeHandler : null,
	classChangeHandler : null,
	chrRaceId: -1, 
	chrClassId: -1,
	
	__onMouse : function( type, over ) {
		if( type ) {
			this.chrClass.layers[2].style.backgroundPosition = over != 1 ? "0px 0px" : "48px 0px";
		}
		else {
			this.chrRace.layers[2].style.backgroundPosition = over != 1 ? "0px 0px" : "48px 0px";
		}
	},
	addListener: function( event, handler ) {
		this.eventMgr.addListener(event, handler);
	},
	update : function( chrRaceId, chrClassId ) {
		this.chrRaceId = chrRaceId;
		this.chrClassId = chrClassId;
		var d1,d2;
		if( chrRaceId != -1 ) {
	
			this.raceIcon.src = "images/site/race_class/medium/chr_race_"+chrRaceId+".png";
			
			if( chrClassId != -1 ) {
				this.classIcon.src = "images/site/race_class/medium/"+chrClassId+".png";
			}
			else {
				this.classIcon.src = "images/site/race_class/medium/empty.png";
			}
			
			Tools.removeChilds(this.selectClass);
			d1 = document.createElement("div"); d1.className = "rcs_select_header"; d1.innerHTML = "Select a Class:";
			d2 = document.createElement("div"); d2.className = "rcs_close"; d2.onclick = function(){Tooltip.enable();};
			this.selectClass.appendChild(d1);this.selectClass.appendChild(d2);
			
			for( var i = 0; i<11; i++ ) {
				if( (CHR_RACE_CLASS_MASK[chrRaceId]&(1<<i)) != 0 ) {
					var div = document.createElement("div");
					div.className = "rcs_icon";
					div.style.backgroundImage = "url(images/site/race_class/medium/"+(i+1)+".png)";
					Listener.add(div,"click",this.__onClassIconClick,this,[i+1]);
					this.selectClass.appendChild(div);
				} 
			}
			d1 = document.createElement('div');
			d1.className = 'clear_both';
			this.selectClass.appendChild(d1);
		}
		else {
			this.raceIcon.src = "images/site/race_class/medium/empty.png";
		}
	},
	
	__onClassIconClick : function( chrClassId ) {
		this.eventMgr.fire("class_select", [chrClassId] );
	},
	
	__onRaceIconClick : function( chrRaceId ) {
		this.eventMgr.fire("race_select", [chrRaceId] );
	},
	
	showClassSelector : function( ) {
		Tooltip.showDisabled(this.selectClass);
	},
	
	showRaceSelector : function() {
		Tooltip.showDisabled(this.selectRace);
	}
};