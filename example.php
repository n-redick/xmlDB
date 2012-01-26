<?php
#####################################################################
### XML DATABASE: USAGE
#####################################################################
### Author: J. Taniguchi
### Date: 2012.01.25
### License: See attached file.
### Contact: j.taniguchi@taniguchi-blog.com
#####################################################################
/*
	-----------------------------------------------------------------
	--- METHOD LIST. ------------------------------------------------
	-----------------------------------------------------------------
	XmlDb();													// constructor
	timeanalysis												// checks if execution time should be tracked(default: false)
	xml_connect($username,$password);							// connect
	xml_close();												// close connection
	xml_drop_db($dbname);										// remove database
	xml_num_rows($dbname, $tname)								// Return the number of rows of the specified database.
	xml_create_table($dbname,$tname,$rows_array);				// create table
	xml_insert_into($dbtable, $dbname, $values);				// insert data into database
	xml_fetch_row($dbname, $tname, $id);						// fetch table by ID
	xml_fetch_specific_row($dbname, $tname, $column, $value);	// fetch table by specific value un specific column
	xml_fetch_all($dbname, $tname);								// fetch all table's entries
	xml_delete_row($dbname, $table_name, $id);					// delete table entry by ID
	xml_drop_table($dbname, $tname);							// remove a table
	xml_update_row($dbname,$table_name,$id, $data);				// update table row by ID
	xml_error();												// display string error throwed by a method
	xml_executetime();											// display execution time for the last function
	
	
	-----------------------------------------------------------------
	--- TODOS -------------------------------------------------------
	-----------------------------------------------------------------
	1. documentation;
	* all methods return FALSE if it fails. The error string may be 
	* accessed using xml_error().
*/

### INCLUDE XMLDB CLASS BEFORE INITIALIZING IT ----------------------
require_once('lib/xmlDB.php');

### INITIALIZE DATABASE. --------------------------------------------
$db = new XmlDb();

### CONNECT TO DATABASE. --------------------------------------------
$db->xml_connect('root','root');

### TRACK EXECUTION TIME. --------------------------------------------
$db->timeanalysis = true;

### CREATE DATABASE SAMPLE. -----------------------------------------
$db->xml_create_db('t9136');

### DROP DATABASE SAMPLE. -------------------------------------------
//$db->xml_drop_db('öüä@+~');

### CREATE DATABASE TABLE SAMPLE. -----------------------------------
$db->xml_create_table('t9136','test',array('username','name','lastname'));

### INSERT DATA INTO DATABASE SAMPLE (ENTITIES TEST). ---------------
$db->xml_insert_into('test','t9136',array('username:n.redick','name:ÃœberzeÃŸerdem.','lastname:At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.')); // test entities + HTML tags.

### COUNT ROWS IN TABLE ---------------------------------------------
/*
$count = $db->xml_num_rows('t9136', 'test');
if($count != false)
{
	echo $count;
}
*/


### FETCH DATA BY ID SAMPLE. ----------------------------------------
/* 
$fetchByID = $db->xml_fetch_row('t9136','test','e165421110ba03099a1c0393373c5b43');
if(is_array($fetchByID))
{
	foreach($fetchByID as $key => $label)
	{
		echo $key . ': ' . $label . '<br />';
	}
}
*/

### FETCH DATA BY COLUMN SAMPLE. ----------------------------------------
/*
$fetchByCol = $db->xml_fetch_specific_row('t9136', 'test', 'username', 'n.redick');
if(is_array($fetchByCol))
{
	foreach($fetchByCol as $key)
	{
		echo 'Row ' . ($count+1) . ' of '.count($fetchByCol).' -------------------------------------<br />';
		for($i = 0;$i < count($key);$i++)
		{
			echo '::: ' . $key[$i][0] . ' : ' . $key[$i][1].'<br />';
		}
		$count++;
	}
}
*/

### FETCH ALL ITEMS FROM DATABASE SAMPLE. ---------------------------

$fetchAll = $db->xml_fetch_all('t9136','test');
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


### DELETE TABLE ROW BY ID. -----------------------------------------
// $db->xml_delete_row('t9136','test','e165421110ba03099a1c0393373c5b43');

### DROP TABLE. -----------------------------------------------------
// $db->xml_drop_table('t9136','test');

### UPDATE ROW AT ID. -----------------------------------------------
//$db->xml_update_row('t9136','test','4558dbb6f6f8bb2e16d03b85bde76e2c',array('username:random_'.mt_rand('0000','9999'),'name:somename'.mt_rand('0000','9999')));

### DISPLAY THROWED ERROR SAMPLE. -----------------------------------
echo $db->xml_error();

### DISPLAY EXECUTION TIME SAMPLE. -----------------------------------
echo $db->xml_executetime();

### CLOSE CONNECTION ------------------------------------------------
$db->xml_close();
