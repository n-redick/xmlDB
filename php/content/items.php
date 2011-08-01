<!-- css -->
<link href="list.css" rel="stylesheet" />
<!-- data -->
<script type="text/javascript">
	var g_serialized = null;
	var g_argString = "";
</script>

<?php

$il_show = false;

if( isset($_GET['items']) && $_GET['items'] ) {
	
	//
	// replace '_' by ';'
	$args = str_replace( '_', ';', $_GET['items']);
	$order = isset($_GET['o']) ? str_replace( '_', ';', $_GET['o']) : "";
	$page = isset($_GET['p']) ? (int) $_GET['p'] : 1;
	
	echo "
<script type=\"text/javascript\">
	g_serialized = ". json_encode(get_items( 
		$args,
		"",
		$order,
		$page,
		null 
	)).";
	g_page = ".$page.";
	g_argString = ".json_encode($args).";
</script>"; 

	$il_show = true;
}

?>

<script type="text/javascript">
	var g_item = null;
	var tt = new TooltipImpl();
	function g_onLoad() {
	
		if( g_serialized ) {
		
			var il = new ItemList();
			
			il.showStaticLinks(true);
			
			il.setData( g_serialized );
			
			if( g_argString ) {
			
				il.set(g_argString, "", "", g_page);
				
				il.gui.showFilter( true );
			}
			
			document.getElementById('list_parent').appendChild(il.gui.node);
			
			il.addListener( 'show_tooltip', new Handler(
				function( itm ) {
					g_showItemTooltip( itm.id );
				}, window
			));
			
			il.addListener( 'move_tooltip', new Handler(
				function() {
					g_moveTooltip();
				}, window
			));
			
			il.addListener( 'hide_tooltip', new Handler(
				function() {
					g_hideTooltip();
				}, window
			));
			
			il.addListener( 'update', new Handler(
				
				function( list ) {
					new ListBackEndProxy("php/interface/get_items.php").update(list);
					/*
					var tmp = ListBackEndProxy.getQueryObject(list);
					var query = TextIO.queryString({ 
						'items' : 	tmp['a'].replace( /\;/g, '_'), 
						'p' : 		tmp['p'], 
						'o': 		tmp['o'].replace( /\;/g, '_') });
					//
					// Pretty print: replace ; by _ as _ is not encoded
					window.location.search = query;
					*/
				}, window
			));
		}
	}
</script>

<?php

$search_form = "
		<form onsubmit='document.getElementById(\"dbi_submit\").value = \"name.wlike.\" + Tools.removeDots(document.getElementById(\"dbi_search\").value) + \"_\";' action='?' method='GET'>
			<input class='input" .( $il_show ? "" : " dbi_search_input_large" ) . "' id='dbi_search' />
			<input type='hidden' name='items' id='dbi_submit' />
		</form>";

if( $il_show ) {
	$g_content = "
<div class='dbi_w'>
<div class='dbi_header'>
	<div class='dbi_search_c'>
		".$search_form."
	</div>
	<div class='dbi_search_c'>
		<span class='dbi_search_label'>Search</span>
	</div>
	<div style='clear: both;'></div>
</div>
<div id='list_parent'>
</div>
</div>";
}
else {

	$g_content = "
<div class='dbi_w'>
<div class='dbi_search_label_large'>Search</div>
<div class='dbi_search_large'>".$search_form."</div>
</div>";

}
?>