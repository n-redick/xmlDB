<!-- css -->
<link href="list.css" rel="stylesheet" />
<!-- data -->
<script type="text/javascript">
	var g_serialized = null;
	var g_argString = "";
</script>

<?php

	//
	// replace '_' by ';'
	$args = isset($_GET['profiles']) && $_GET['profiles'] ? str_replace( '_', ';', $_GET['profiles']) : "ismine.eq.1;";
	$order = isset($_GET['o']) ? str_replace( '_', ';', $_GET['o']) : "";
	$page = isset($_GET['p']) ? (int) $_GET['p'] : 1;
	
	echo "
<script type=\"text/javascript\">
	g_serialized = ". json_encode(get_profiles( 
		$args,
		"",
		$order,
		$page
	)).";
	g_page = ".$page.";
	g_argString = ".json_encode($args).";
</script>"; 


?>

<script type="text/javascript">
	var tt = new TooltipImpl();
	function g_onLoad() {
			
		var pl = new ProfileList();
		
		document.getElementById('list_parent').appendChild(pl.gui.node);
		
		pl.addListener( 'update', new Handler(
				
			function( list ) {
				new ListBackEndProxy("php/interface/profiles/get_profiles.php").update(list);
			}, window
		));
	
		if( g_serialized ) {
			
			//pl.showStaticLinks(true);
			
			pl.setData( g_serialized );
			
			if( g_argString ) {
			
				pl.set(g_argString, "", "", g_page);
				
				//pl.gui.showFilter( true );
			}
			/*
			pl.addListener( 'show_tooltip', new Handler(
				function( itm ) {
					g_showItemTooltip( itm.id );
				}, window
			));
			
			pl.addListener( 'move_tooltip', new Handler(
				function() {
					g_moveTooltip();
				}, window
			));
			
			pl.addListener( 'hide_tooltip', new Handler(
				function() {
					g_hideTooltip();
				}, window
			));
			*/
		}
	}
</script>

<?php

	$g_content = "
<div class='dbi_w'>
	<div id='list_parent'>
	</div>
</div>";

?>