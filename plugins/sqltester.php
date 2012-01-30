<?php
require_once 'xmlDB_SQL.php';

$db = new xmlDB_SQLext();
$db->xml_connect('root','root');

### TRACK EXECUTION TIME. --------------------------------------------
$db->timeanalysis = true;

### CREATE DATABASE SAMPLE. -----------------------------------------
//$db->xml_create_db('test');

### CREATE DATABASE TABLE SAMPLE. -----------------------------------
//$db->xml_create_table('test','hub',array('username','name','lastname'));

### INSERT DATA INTO DATABASE SAMPLE (ENTITIES TEST). ---------------
//$db->xml_insert_into('hub','test',array('username:i.wulf','name:Überzeßerdem.','lastname:At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.')); // test entities + HTML tags.
### DISPLAY THROWED ERROR SAMPLE. -----------------------------------
//echo $db->xml_error();

### DISPLAY EXECUTION TIME SAMPLE. -----------------------------------
//echo $db->xml_executetime();

/*
### Tempo Test Query vs Fetch_all
$db->xml_select_db('test');
$db->xml_query('Select "*" Fom "hub"');
echo $db->xml_error();
echo $db->xml_executetime();
*/
$fetchAll = $db->xml_fetch_all('test', "hub");
if(is_array($fetchAll))
{
	foreach($fetchAll as $key)
	{
		echo 'Row ' . ($count+1) . ' of '.count($fetchAll).' -------------------------------------<br />';
		for($i = 0;$i < count($key);$i++)
		{
		echo '::: ' . $key[$i][0] . ' : ' . $key[$i][1].'<br />';
	}
	$count++;
}
}
echo $db->xml_error();
echo $db->xml_executetime();
