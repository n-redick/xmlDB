<?php
	require_once 'php/db.php';
	require_once 'php/user_data.php';

	$user_id = 0;
	$category = "";
	
	$g_ui_user_data = null;
	$g_show_profiles = false;
	
	if( isset($_GET["user"]) ) {
	
		$user_id = (int) $_GET["user"];
	}
	else {
	
		
	}
	
	if( isset($_GET["category"]) ) {
		$category = $_GET["category"];
	}
	
	$g_content = show_user_info( $user_id, $category  );

	function show_user_info( $user_id, $category ) {
	
		$result = mysql_query("SELECT * FROM chardev.`user` WHERE `userID` = ".(int) $user_id);
		
		if( ! $result ) {
			return "<div class='ui_user_not_found'>User not found!</div>";
		}
		else {
			
			$query = "?user=".$user_id;
			
			$user = mysql_fetch_assoc($result);
			
			$categories["User Information"] = "";
			$categories["Profiles"] = "profiles";
			
			if( is_user_you( $user )) {
				$categories["Account Deletion"] = "deletion";
			}
			
			$content = "
<div class='ui_wrapper'>
	<div class='ui_left'>".show_avatar($user)."
		<div class='ui_categories'>
		".show_category_links( $category, $categories, "", $query, "category")."
		</div>
	</div>
	<div class='ui_right'>
		<div class='ui_name'>".$user['name']."</div>
		<div class='ui_role'>".($user['role'] == 10 ? "Admin" : "User")."</div>
		".show_category( $category, $user )."
	</div>
	<div style='clear: both'></div>
</div>
			";
			
			return $content;
		}
	}
	
	function show_avatar( $user ) {

		$ret_value = "";
		if( $user['avatar'] /*&& file_exists('images/icons/large/'.$user['avatar'].'.png')*/ ) {
			$ret_value = "<div class='ui_avatar_p'><img class='ui_avatar_img' src='images/icons/large/".$user['avatar'].".png'' /></div>";
		}
		return $ret_value;
	}
	
	function show_category_links( $current_category, $categories, $default_category, $query_base, $query_key ) {
		$found = false;
		foreach( $categories as $k => $v ) {
			if( strcmp($v, $current_category) === 0 ) {
				$found = true;
				break;
			}
		}
		if( ! $found ) {
			$current_category = $default_category;
		}
		
		$ret_value = "";
		foreach( $categories as $cat_name => $cat_key ) {
			$query = $query_base . ( strcmp($default_category, $cat_key) === 0 ? "" : "&".$query_key."=".$cat_key );
			$ret_value .= "<a href='".$query."' class='ui_cat_link".(strcmp($current_category, $cat_key) === 0 ? "_active" : "" )."'>".$cat_name."</a>";
		}
		
		return $ret_value;
	}
	
	function show_category( $category, $user ) {
		switch( $category ) {
			case "profiles": 
				return show_profiles( $user );
			case "deletion":
				return show_deletion( $user );
			default: 
				return show_default( $user );
		}
	}
	
	function show_profiles( $user ) {
		$GLOBALS["g_show_profiles"] = true;
		return "<div id='ui_profiles_parent' class='ui_profiles_p'><div class='loading'>Loading...</div></div>";;
	}
	function show_deletion( $user ) {
	
		
		if( isset($_GET['action']) && $_GET['action'] === 'delete_me' && isset($_POST['confirm']) ) {
			return "<div class='ui_da_zb'>You are now deleted, please take your receipt!</div>";
		}
	
		$html = "
	<div class='ui_da_w'>
		<div class='ui_da_header'>Account deletion is irreversible!</div>
		
		";
		if( isset($_GET['action']) && $_GET['action'] === 'delete_me' ) {
			$html .= "
		<div class='ui_da_note ui_da_sure'>
			Are you certain, that you want to delete your account permanently?
		</div>
		<div class='ui_da_zb'>Enough with the questions.</div>
		<div class='ui_da_btn_p'>
			<form method='POST' action='?user=".$user['userID']."&category=deletion&action=delete_me'>
				<input 
					type='submit' 
					class='button button_light ui_da_btn'
					onmouseout='this.className=\"button button_light ui_da_btn\"' 
					onmouseover='this.className=\"button button_light button_light_hover ui_da_btn\"' 
					value='Delete my Account!'
				/>
				<input type='hidden' name='confirm' />
			</form>
		</div>
		";
		}
		else {
			$html .= "	
		<div class='ui_da_note'>
			<div class='ui_da_note_h'>What will be deleted?</div>
			<div class='ui_da_note_c'>
				Deleting your account will remove your personal information permanently from chardevs database. 
				This includes your user name, password, e-mail address and your account settings. Forum posts, comments 
				and profiles won't be deleted, but will be anonymised.
			</div>
		</div>
		<div class='ui_da_btn_p'>
			<form method='POST' action='?user=".$user['userID']."&category=deletion&action=delete_me'>
				<input 
					type='submit' 
					class='button button_light ui_da_btn'
					onmouseout='this.className=\"button button_light ui_da_btn\"' 
					onmouseover='this.className=\"button button_light button_light_hover ui_da_btn\"' 
					value='Delete my Account'
				/>
			</form>
		</div>
	";
		}
		$html .= "
	</div>
		";
		return $html;
	}
	function show_default( $user ) {
	
		$record = mysql_fetch_assoc(mysql_query( "SELECT * FROM chardev_user.`user_data` WHERE `UserID`=".(int)$user['userID'] ));
	
		$is_you = false;
		if( is_user_you( $user )) {
			$is_you = true;
		}
		
		$ud = new user_data((int)$user['userID']);
		
		$GLOBALS['g_ui_user_data'] = array(
			"ForumSignature" => array(
				"label" => "Forum Signature", 
				"data" => $record['ForumSignature'],
				"editable" => "input"
			),
			"Region" => array(
				"label" => "Region", 
				"data" => $record['Region'],
				"editable" => "select",
				"options" => array(
					"us"=>"United States",
					"eu"=>"Europe",
					"kr"=>"Korea",
					"cn"=>"China",
					"tw"=>"Taiwan"
				)
			),
			"Language" => array(
				"label" => "Preferred Language", 
				"data" => $record['Language'],
				"editable" => "select",
				"options" => array(
					0=>"English",
					2=>"French",
					3=>"German",
					6=>"Spanish",
					8=>"Russian"
				)
			)
		);
		
		if( $is_you ) {
		
			$GLOBALS['g_ui_user_data']["BattleNetProfiles"] = array(
				"label" => "Battle.net Profiles",
				"editable" => "battlenetprofilemanager",
				"data" => $ud->get_battlenet_profiles(),
				"realms" => get_realm_lists()
			);
		}
	
		return "<div id='user_information_parent'><div class='loading'>Loading...</div></div>";
	}
	
	function is_user_you ( $user ) {
		return isset($_SESSION['user_id']) && $user['userID'] == $_SESSION['user_id'];
	}
?>
<script type="text/javascript" src="js/gui/static/UserInformation.js"></script>
<script type="text/javascript" src="js/adapter/static/ProfilesAdapter.js"></script>
<script type="text/javascript">
	var g_ui_user_data = null;
	var g_ui_user_id;
	var g_ui_show_profiles;
</script>
<?php
	echo "
<script type=\"text/javascript\">
	g_ui_user_data = ".json_encode($GLOBALS['g_ui_user_data'] ).";
	g_ui_user_id = ".(int)$user_id.";
	g_ui_show_profiles = ".json_encode($g_show_profiles).";
</script>"; 
?>

<script type="text/javascript">
	function g_onLoad() {
		if( g_ui_user_data ) {
			new UserInformationImpl( g_ui_user_id, g_ui_user_data, 'user_information_parent' );
		}
		else if( g_ui_show_profiles ) {
			var pa = new ProfilesAdapter();
			pa.profileList.gui.showFilter(false);
			pa.profileList.filterMgr.hideFilter('ismine', true);
			pa.profileList.set("ismine.eq.1;", null, null, 1);
			pa.profileList.update();
			DOM.set('ui_profiles_parent',  pa.getNode())
		}
	}
</script> 