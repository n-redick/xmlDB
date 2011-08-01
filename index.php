<?php 
	$g_content = "";

	include_once './php/filter.php'; // has to be first
	filter_redirect();
	//
	include_once './php/db.php';
	include_once './php/common.php';
	
	include_once './php/session.php';
	include_once './php/language.php';
	
	$build_number = "8.2b"; $build = file_get_contents('.build');
	
	define("PAGE_HOME",0);
	define("PAGE_PLANNER",1);
	define("PAGE_LOGIN",2);
	define("PAGE_LOGOUT",3);
	define("PAGE_SPELL",4);
	define("PAGE_ITEM",5);
	define("PAGE_SPELLS",6);
	define("PAGE_ITEMS",7);
	define("PAGE_TALENTS",8);
	define("PAGE_FORUM",9);
	define("PAGE_REGISTER",10);
	define("PAGE_DONATE",11);
	define("PAGE_RECOVER_PASSWORD",12);
	define("PAGE_BASE_STATS",13);
	define("PAGE_PLANNER_START",14);
	define("PAGE_USER",15);
	define("PAGE_CREDITS",16);
	define("PAGE_PROFILES",17);
?><?xml version="1.0" encoding="utf-8" ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<link rel="icon" href="images/site/favico.png" type="image/png" />
<title>chardev 9</title>
<!-- stylesheets -->
<?php 
echo '<link type="text/css" href="chardev9.css?'.$build.'" rel="stylesheet" />
<link type="text/css" href="tooltip.css?'.$build.'" rel="stylesheet" />';
?>
<!-- optimised js -->
<script type="text/javascript">
	var g_settings = {
		character : null,
		language : 'en',
		profileId : 0,
		sessionId : '',
		userId : 0,
		isPlanner : false
	};
	
	var g_onLoad = null;
	
	function __onLoad() {
		__chardev_init();
		__engine_init(g_settings);
		__tooltip_init();
		//__jobmanager_init();
		
		if( window['CHARDEV_CORE_BUILD'] ) {
			document.getElementById('chardev_core_version').innerHTML = window['CHARDEV_CORE_BUILD'];
		}
		
		if( g_onLoad ) {
			g_onLoad();
		}
	};
</script>
<?php 
	$page = PAGE_HOME;
	$show_ads = isset($_SESSION['donated']) && $_SESSION['donated'] ? false : true;
	//&& $_SERVER['HTTP_HOST']!="127.0.0.1" && $_SERVER['HTTP_HOST']!="192.168.178.100" && $_SERVER['HTTP_HOST']!="192.168.178.22";
	//
	//	PHP generated JS
	//
	echo "
<script type='text/javascript'>
/* <![CDATA[ */
	g_settings.sessionId = '".($loggedIn?session_id():-1)."';
	g_settings.userId = ".($loggedIn?$_SESSION['user_id']:-1).";
	g_settings.language = '".$g_lang_to_str[$g_language]."';
	g_settings.debug = ".(isset($_GET['debug'])?"true":"false").";
	var locale = ".json_encode($locale).";
/* ]]> */
</script>";

//if( isset($_GET['debug'])) {
	include 'php/js_files.php';
	for( $i = 0; $i<count($js_files); $i++ ) {
		echo "<script src='".$js_files[$i][0].$js_files[$i][1]."?".$build."' type='text/javascript'></script>\n"; 
	}
//}
//else {
//	echo "<script src='js/all_optimised.js?".$build."' type='text/javascript'></script>"; 
//}
	//
	//	Content includes
	//
	if( isset($_GET['spell']) ) {
		include './php/content/spell.php';
		$page = PAGE_SPELL;
	}
	else if( isset($_GET['spells']) ) {
		include './php/content/spells.php';
		$page = PAGE_SPELLS;
	}
	else if( isset($_GET['item']) ) {
		include './php/content/item.php';
		$page = PAGE_ITEM;
	}
	else if( isset($_GET['items']) ) {
		include './php/content/items.php';
		$page = PAGE_ITEMS;
	}
	else if( isset($_GET['planner']) || isset($_GET['profile']) || isset($_GET['c']) ) {
		include './php/content/planner.php';
		$page = PAGE_PLANNER;
	}
	else if( isset($_GET['talents']) || isset($_GET['t']) ) {
		include './php/content/talent_planner.php';
		$page = PAGE_TALENTS;
	}
	else if(isset($_GET['forum']) || isset($_GET['topic'])){
		include './php/content/forum.php';
		$page = PAGE_FORUM;
	}
	else if(isset($_GET['register'])){
		include './php/content/register.php';
		$page = PAGE_REGISTER;
	}
	else if(isset($_GET['resend_mail'])){
		include './php/content/resend_mail.php';
		$page = PAGE_REGISTER;
	}
	else if(isset($_GET['login'])){
		include './php/content/login.php';
		$page = PAGE_LOGIN;
	}
	else if(isset($_GET['donate'])){
		include './php/content/donate.php';
		$page = PAGE_DONATE;
	}
	else if(isset($_GET['recover_password'])){
		include './php/content/recover_password.php';
		$page = PAGE_RECOVER_PASSWORD;
	}
	
	else if(isset($_GET['base_stats'])){
		include './php/content/base_stats.php';
		$page = PAGE_BASE_STATS;
	}
	else if(isset($_GET['start'])) {
		include './php/content/planner_start.php';
		$page = PAGE_PLANNER_START;
	}
	else if(isset($_GET['user'])) {
		include './php/content/user.php';
		$page = PAGE_USER;
	}
	else if(isset($_GET['credits'])) {
		include './php/content/credits.php';
		$page = PAGE_CREDITS;
	}
	else if(isset($_GET['profiles'])) {
		include './php/content/profiles.php';
		$page = PAGE_PROFILES;
	}
	else {
		include './php/content/home.php';
		$page = PAGE_HOME;
	}
?>
</head>
<body onload="__onLoad();">

	<div class="tt_overlay_w" id="tt_overlay_w"><div class="tt_overlay" id="tt_overlay"></div></div>

	<div class="ix_header">

		<div class="ix_center ix_logo">
			
			<div class="ix_center ix_main_menu">
				<div class="ix_mm_entry"><a class="ix_mm_link<?php echo $page==PAGE_HOME? " ix_mm_link_active" : ""; ?>" href="?home">home</a></div>
				<div class="ix_mm_entry"><a class="ix_mm_link<?php echo $page==PAGE_PLANNER ? " ix_mm_link_active" : ""; ?>" href="?planner">planner</a></div>
				<div class="ix_mm_entry"><a class="ix_mm_link<?php echo $page==PAGE_FORUM ? " ix_mm_link_active" : ""; ?>" href="?forum">forum</a></div>
				<div class="ix_mm_entry"><a class="ix_mm_link<?php echo $page==PAGE_DONATE ? " ix_mm_link_active" : ""; ?>" href="?donate">donate</a></div>
				<div class="ix_mm_entry"><a class="ix_mm_link" href="http://github.com/chardev/chardev">source</a></div>
				<div style="clear:both"></div>
			</div>
			
			<?php
				if( $page != PAGE_LOGIN && $page != PAGE_LOGOUT )
				{
					include './php/content/login_small.php';
				}
			?>
			
			
			<div style="clear:both"></div>
		</div>
	</div>

	<div id="mtf_p">
	<!--
		<a class="cp_mm_link_base cp_mm_link_0_a">Character Sheet</a>
		<a class="cp_mm_link_base cp_mm_link_1">Talents</a>
		<a class="cp_mm_link_base cp_mm_link_2">Overview</a>
		<a class="cp_mm_link_base cp_mm_link_3">Import</a>
		<a class="cp_mm_link_base cp_mm_link_4">Save</a>
		<a class="cp_mm_link_base cp_mm_link_5">Browse</a>
	-->
	</div>
	
	<div class="ix_center ix_content_p"> 
	
		<div class="ix_content" id="content">
			<?php if(isset($g_content)) echo $g_content; ?>
		</div>
	</div>
	<div class="ix_center ix_foot">
		<div class="ix_bottom_link_bar">
			<a class="ix_bottom_link" href='?items'>Items</a>
			<a class="ix_bottom_link" href='?spells'>Spells</a>
			<a class="ix_bottom_link" href='?stats'>Base Stats</a>
			<a class="ix_bottom_link" href='?mebers'>Members</a>
			<a class="ix_bottom_link" href='?credits'>Credits</a>
			<a class="ix_bottom_link" href='?notice'>Site Notice</a>
		</div>
		<div class="ix_copy">&copy; 2007-2011 chardev.org - Design and Code by Martin Wa&szlig;mann<?php if( isset($build_number) ) { echo " - Build: ".$build_number; } ?></div>
		<div class="ix_disclaimer">World of Warcraft and Blizzard Entertainment are trademarks or registered trademarks of Blizzard Entertainment in the U.S. and/or other countries.</div>
	</div>
</body>
</html>