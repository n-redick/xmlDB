<?php
	require_once '/php/db.php';

	$user_id = 0;
	$category = "";
	
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
			
			if( isset($_SESSION['user_id']) && $user['userID'] == $_SESSION['user_id'] ) {
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
		if( $user['avatar'] && file_exists('images/icons/large/'.$user['avatar'].'.png') ) {
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
		return "NYI";
	}
	function show_deletion( $user ) {
		return "NYI";
	}
	function show_default( $user ) {
		return "NYI";
	}
?>