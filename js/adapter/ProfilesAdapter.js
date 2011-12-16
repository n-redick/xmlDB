function ProfilesAdapter() {
	this.profileList = new ProfileList();
	this.profileList.gui.showFilter(true);
	//
	var plHandler = new Handler(function( e ){
		if( e.is('update') ) {
			new ListBackEndProxy("php/interface/profiles/get_profiles.php").update(this.profileList);
		}
	}, this);
	//
	var plObserver = new GenericObserver([
		'update',
	], plHandler);
	//
	this.profileList.addObserver(plObserver);
}
ProfilesAdapter.prototype = {
	profileList: null
};