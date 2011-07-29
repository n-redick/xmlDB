function TalentGui() {
	this.eventMgr = new EventManager([
      "reset_tree",
      "reset_all",
      "add_point",
      "remove_point",
      "select_tree"
	]);
}

TalentGui.prototype = {
	eventMgr: null
};