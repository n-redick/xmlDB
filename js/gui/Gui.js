function Gui() {
	this.characterSheet = new CharacterSheet();
	
	this.eventMgr = new EventManager(['import', 'save', 'update']);
	
	var div, form, formGrid, pGrid, tsFolder, i, d1,d2,d3;
	var sheetGrid = new StaticGrid(1,2); sheetGrid.setVerticalAlign(StaticGrid.VALIGN_TOP);
	var gemTab = document.createElement('div');
	var talentTab = document.createElement('div');
	var enchantTab = document.createElement('div');
	this.node = document.createElement("div"); this.node.className = 'gui_p';
	this.sheetParent = document.createElement("div"); this.sheetParent.className = "cs_sheet_p";
	this.talentsParent = document.createElement("div");
	this.overviewParent = document.createElement("div");
	this.profilesParent = document.createElement("div");
	
	this.itemsParent = document.createElement("div");
	this.gemsParent = document.createElement("div");
	this.enchantsParent = document.createElement("div");
	this.setsParent = document.createElement("div");
	this.buffsParent = document.createElement("div");
	this.glyphsParent = document.createElement("div");
	
	this.sheetParent.appendChild( this.characterSheet.node );
	
//	this.reforgeInterface = new ReforgeInterface();
//	this.glyphInterface = new GlyphInterface();
//	this.buffInterface = new BuffInterface();
//	this.buffsParent.appendChild(this.buffInterface.node);
	
//	this.reforgeInterface.reforgeOptimisationInterface.addListener( 'show_stat_weights_interface', new Handler(
//		function() { this.statWeightInterface.show(); },
//		this
//	));
	
//	this.statWeightInterface = new StatWeightInterface();
	
//	this.randomPropertyInterface = new RandomPropertyInterface();
//	enchantTab.appendChild(this.randomPropertyInterface.node);
	enchantTab.appendChild(this.enchantsParent);
	
	this.csFolder = new TabFolder(
		[this.itemsParent, gemTab, enchantTab, /*this.reforgeInterface.node*/ document.createElement("div"), this.setsParent, this.buffsParent],
		["Items","Gems","Enchants","Reforging","Sets","Buffs"],
		"eqf"
	);

	d1 = document.createElement("div");
	d1.className = 'gui_lp_menu';
	d1.appendChild(this.csFolder.menu);
	
	d2 = document.createElement("div");
	d2.className = 'gui_lp_content';
	d2.appendChild(this.csFolder.node);
	
	
	sheetGrid.cols[0].style.width = "300px";
	sheetGrid.cols[1].style.width = "660px";
	sheetGrid.cells[0][0].appendChild(this.sheetParent);
	sheetGrid.cells[0][1].appendChild(d1);
	sheetGrid.cells[0][1].appendChild(d2);
//
//	import
//	
	this.saveParent = document.createElement("div");
	this.importParent = document.createElement("div");
	
	
	form = document.createElement("form");
	form.onsubmit = new Function("return false");
	form.action = "#";
	Listener.add(form,"submit",this.__onImportSubmit,this,[]);
	this.importName = document.createElement("input"); this.importName.className = "input im_sa_in";
	this.importServer = document.createElement("input"); this.importServer.className = "input im_sa_in";
	this.importRegion = new SingleSelect(
		[
		 [0,locale['US']+"/"+locale['Oceanic']],
		 [1,locale['Europe']],
		 [2,locale['Korea']],
		 [3,locale['Taiwan']],
		 [4,locale['China']]
		]
	);
	this.importRegion.node.className = "single_select single_select_focussable";
	this.importSubmit = document.createElement("input"); this.importSubmit.type = "submit"; this.importSubmit.value = "Import";
	this.importSubmit.className = '';
	
	Tools.jsCssClassHandler( this.importSubmit, { 'default': "button im_sa_btn", 'focus': "im_sa_btn_hover", 'hover': "im_sa_btn_hover"});
	
	div = document.createElement("div"); div.className = "im_sa_h"; div.appendChild(document.createTextNode("Import a character from the Armory"));
	this.importParent.appendChild(div);
	
	div = document.createElement("div"); div.className = "im_sa_r";
	d1 = document.createElement("div"); d1.className = "im_sa_left"; div.appendChild(d1); d1.appendChild(document.createTextNode("Name"));
	d2 = document.createElement("div"); d2.className = "im_sa_right"; div.appendChild(d2); d2.appendChild(this.importName);
	Tools.clearBoth(div);
	form.appendChild(div);
	
	div = document.createElement("div"); div.className = "im_sa_r";
	d1 = document.createElement("div"); d1.className = "im_sa_left"; div.appendChild(d1); d1.appendChild(document.createTextNode("Server"));
	d2 = document.createElement("div"); d2.className = "im_sa_right"; div.appendChild(d2); d2.appendChild(this.importServer);
	Tools.clearBoth(div);
	form.appendChild(div);
	
	div = document.createElement("div"); div.className = "im_sa_r";
	d1 = document.createElement("div"); d1.className = "im_sa_left"; div.appendChild(d1); d1.appendChild(document.createTextNode("Region"));
	d2 = document.createElement("div"); d2.className = "im_sa_right"; div.appendChild(d2); d2.appendChild(this.importRegion.node);
	Tools.clearBoth(div);
	form.appendChild(div);

	div = document.createElement("div"); div.className = "im_sa_b"; div.appendChild(this.importSubmit);
	form.appendChild(div);
	
	this.importParent.appendChild(form);

	this.importParent.className = 'im_sa_p';
	
	this.importStatus = document.createElement("div");
	this.importParent.appendChild(this.importStatus);
//	
//	save
//	
	pGrid = new StaticGrid(4,1);
	pGrid.node.className = 'align_center';
	formGrid = new StaticGrid(1,2);
	formGrid.node.cellSpacing = "5px";
	form = document.createElement("form");
	form.onsubmit = new Function("return false");
	form.action = "#";
	Listener.add(form,"submit",this.__onSave,this,[]);
	this.save = document.createElement("input"); this.save.value = locale['save_as_new']; this.save.type = "submit";
	
	Tools.jsCssClassHandler( this.save, { 'default': "button im_sa_btn", 'focus': "im_sa_btn_hover", 'hover': "im_sa_btn_hover"});
	
	this.saveCharacterName = document.createElement("input"); this.saveCharacterName.className = "input im_sa_in";
	this.saveCharacterDescription = document.createElement("input"); this.saveCharacterDescription.className = "input im_sa_in";

	this.saveUserName = document.createElement("input"); this.saveUserName.className = "input im_sa_in";

	this.savePassword = document.createElement("input"); this.savePassword.className = "input im_sa_in";
	this.savePassword.type = "password";
	
	div = document.createElement("div"); div.className = "im_sa_h"; div.appendChild(document.createTextNode("Save the current profile"));
	this.saveParent.appendChild(div);
	
	div = document.createElement("div"); div.className = "im_sa_r";
	d1 = document.createElement("div"); d1.className = "im_sa_left"; div.appendChild(d1); d1.appendChild(document.createTextNode(locale['S_ProfileName']));
	d2 = document.createElement("div"); d2.className = "im_sa_right"; div.appendChild(d2); d2.appendChild(this.saveCharacterName);
	Tools.clearBoth(div);
	form.appendChild(div);
	
	div = document.createElement("div"); div.className = "im_sa_r";
	d1 = document.createElement("div"); d1.className = "im_sa_left"; div.appendChild(d1); d1.appendChild(document.createTextNode(locale['S_CharacterDescription']));
	d2 = document.createElement("div"); d2.className = "im_sa_right"; div.appendChild(d2); d2.appendChild(this.saveCharacterDescription);
	Tools.clearBoth(div);
	form.appendChild(div);
// 	auth	
	this.authParent = document.createElement("div");
	div = document.createElement("div"); div.className = "im_sa_r";
	d1 = document.createElement("div"); d1.className = "im_sa_left"; div.appendChild(d1); d1.appendChild(document.createTextNode(locale['L_UserName']));
	d2 = document.createElement("div"); d2.className = "im_sa_right"; div.appendChild(d2); d2.appendChild(this.saveUserName);
	Tools.clearBoth(div);
	this.authParent.appendChild(div);
	
	div = document.createElement("div"); div.className = "im_sa_r";
	d1 = document.createElement("div"); d1.className = "im_sa_left"; div.appendChild(d1); d1.appendChild(document.createTextNode(locale['L_Password']));
	d2 = document.createElement("div"); d2.className = "im_sa_right"; div.appendChild(d2); d2.appendChild(this.savePassword);
	Tools.clearBoth(div);
	this.authParent.appendChild(div);
	form.appendChild(this.authParent);
	
	if( g_settings.profileId > 0 && g_settings.userId > 0 ) {
		div = document.createElement("div"); div.className = "im_sa_r";
		d1 = document.createElement("div"); d1.className = "im_sa_center"; div.appendChild(d1); d1.appendChild(this.save);
	}
	else {
		div = document.createElement("div"); div.className = "im_sa_b"; div.appendChild(this.save);
	}
	form.appendChild(div);
	this.saveParent.appendChild(form);
	
	if( g_settings.profileId > 0 && g_settings.userId > 0 ) {
		div = document.createElement("div"); div.className = "im_sa_border";
		this.saveParent.appendChild(div);
		
		div = document.createElement("div"); div.className = "im_sa_r"; div.innerHTML = '<span class="im_sa_notice">Update the current profile</span>';
		this.saveParent.appendChild(div);
		
		this.update = document.createElement("input"); this.update.value = locale['update_profile']; this.update.type = "submit";this.save.className = 'im_sa_save_btn';
		Tools.jsCssClassHandler( this.update, { 'default': "button im_sa_save_btn", 'focus': "im_sa_save_btn_hover", 'hover': "im_sa_save_btn_hover"});
		
		Listener.add(this.update,"click",this.__onUpdate,this,null);
		div = document.createElement("div"); div.className = "im_sa_b"; div.appendChild(this.update);
		this.saveParent.appendChild(div);
	}
	
	this.saveParent.className = 'im_sa_p';
//	
//	talents
//	
	tsFolder = new TabFolder(
		[this.talentsParent,/*this.glyphInterface.node*/ document.createElement("div")],
		["Talents","Glyphs"],
		"ttf"
	);

	talentTab.appendChild(tsFolder.menu);
	talentTab.appendChild(tsFolder.node);
//	
//	
//
	
	this.profileList = new ItemList();
	this.profileList.update();
//	this.profileList.set("ismine.eq.1;","", "");

	var tmp = document.createElement("input"); tmp.value = "do"; tmp.type='button';
	Listener.add(tmp, 'click', this.profileList.update, this.profileList, []);
	this.profilesParent.appendChild(tmp);
	this.profilesParent.appendChild(this.profileList.gui.node);
	
	this.folder = new TabFolder(
		[sheetGrid.node,talentTab,this.overviewParent,this.importParent,this.saveParent,this.profilesParent],
		["Character Sheet","Talents","Overview","Import","Save","Browse"],
		"cp_mm"
	);
	

	this.node.appendChild(this.folder.node);
	//
//	this.socketInterface = new SocketInterface();
//	gemTab.appendChild(this.socketInterface.node);
	gemTab.appendChild(this.gemsParent);
	
	if( g_settings.sessionId ) {
		this.authParent.style.display = "none";
	}
}

Gui.TAB_ITEMS = 0;
Gui.TAB_GEMS = 1;
Gui.TAB_ENCHANTS = 2;
Gui.TAB_REFORGE = 3;
Gui.TAB_SETS = 4;
Gui.TAB_BUFFS = 5;

Gui.TAB_CHARACTER_SHEET = 0;
Gui.TAB_OVERVIEW = 2;
Gui.TAB_SAVE = 4;

Gui.prototype = {
	characterSheetProxy: null,
	characterSheet: null,
	eventMgr: null,
	folder: null,
	addListener: function( event, handler ) {
		this.eventMgr.addListener(event, handler);
	},
	__onImportSubmit: function(){
		var name = this.importName.value;
		var server = this.importServer.value;
		
		if( name == "" || name.length < 2 ) {
			Tooltip.showError("The character name is empty or too short!");
			return;
		}
		if( server == "" ) {
			Tooltip.showError("The server name is empty or too short!");
			return;
		}
		
		this.eventMgr.fire('import', [name, server, parseInt(this.importRegion.getSelected(),10)]);
	},
	__onSave: function(){},
	__onUpdate: function(){},
	/**
	 * @param {CharacterProxy} characterProxy
	 */
	setCharacterProxy: function(characterProxy) {
		this.characterSheetProxy.setCharacterProxy(characterProxy);
	},
	/**
	 * @param {ItemListGui} itemListGui
	 */
	initLists: function( itemListGui ) {

//		Tools.setChild(this.sheetParent, character._sheet._node);
		Tools.setChild(this.itemsParent, itemListGui.node);
//		Tools.setChild(this.gemsParent, character._gemList._node);
//		Tools.setChild(this.setsParent, character._setList._node);
//		Tools.setChild(this.enchantsParent, character._enchantList._node);
	}
};