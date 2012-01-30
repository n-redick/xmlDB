<?php
######################################################################
### xmlDB_SQLext() Class
### ------------------------------------------------------------------
### Author: N. Redick
### Date: 2012.01.27
### Contact: coding@assuran.de
### License: See attached license file.
###
######################################################################


######################################################################
### CHANGE LOG
### ------------------------------------------------------------------
###
###
###
### 
###
###
###
###
######################################################################


######################################################################
### QUERY EXPLANATION
### ------------------------------------------------------------------
###	- the query is not case-sensitive
### - ALL non SQL Keyword must be marked like this --> "tablename"
###	- dots in tablenames CAN produce errors, avoid them!
###
###
###
###
###
###
######################################################################


// ---------------------------------------------------------------
// REQUIRE xmlDB() CLASS
// ---------------------------------------------------------------
require_once dirname(__DIR__)."/lib/xmlDB.php";


class xmlDB_SQLext extends xmlDB
{
	// ---------------------------------------------------------------
	// SQL SPECIAL WORDS
	// ---------------------------------------------------------------
	private $__SQL_FUNCTION_KEYWORDS 		= array('SELECT','INSERT','UPDATE','DELETE','CREATE','TRUNCATE','DROP','ALTER');
	private $__SQL_DML_KEYWORDS				= array('FROM','WHERE','ORDER BY','VALUES');
	private $__SQL_OPERATORS				= array('=','<','>','<=','>=','LIKE');
	private $__SELECTED_DB					='';
	
	
	// ---------------------------------------------------------------
	// Constructor:
	// ---------------------------------------------------------------
	function xmlDB_SQLext()
	{
		//do some thing
	}
	

	// ---------------------------------------------------------------
	// preselect DB
	// 
	// ---------------------------------------------------------------
	function xml_select_db($DB)
	{
		$this->__SELECTED_DB = $DB;
	}
	
	
	// ---------------------------------------------------------------
	// parse the $query and do what query says, if the query is not 
	// readable, there will be an SQL like error.
	// ---------------------------------------------------------------
	function xml_query($query)
	{
		$query 			= trim($query);
		$pos 			= strpos($query, ' ');
		$SQL_KEYWORD 	= substr($query, 0, $pos);
		$SQL_KEYWORD_E 	= $SQL_KEYWORD;
		$SQL_REMAIN 	= substr($query, $pos);
		$SQL_REMAIN 	= trim($SQL_REMAIN);
		$SQL_REMAIN 	= substr($SQL_REMAIN, 1);
		$pos 			= strpos($SQL_REMAIN, '"');
		$SQL_KEYWORD 	= strtoupper($SQL_KEYWORD);
		
		
		if(in_array($SQL_KEYWORD, $this->__SQL_FUNCTION_KEYWORDS))
		{
			switch($SQL_KEYWORD)
			{
				case 'SELECT' :
					$SELECT 				= substr($SQL_REMAIN, 0, $pos);
					$SQL_REMAIN 			= substr($SQL_REMAIN, $pos+1);
					$SQL_REMAIN 			= trim($SQL_REMAIN);
					$pos 					= strpos($SQL_REMAIN, '"');
					$SQL_SECOND_KEYWORD 	= substr($SQL_REMAIN, 0, $pos);
					$SQL_SECOND_KEYWORD 	= trim($SQL_SECOND_KEYWORD);
					$SQL_SECOND_KEYWORD_E 	= $SQL_SECOND_KEYWORD;
					$SQL_SECOND_KEYWORD 	= strtoupper($SQL_SECOND_KEYWORD);
					$SQL_REMAIN	 			= substr($SQL_REMAIN, $pos);
					$SQL_REMAIN 			= trim($SQL_REMAIN);
					$SQL_REMAIN 			= substr($SQL_REMAIN, 1);
					$pos 					= strpos($SQL_REMAIN, '"');
					$FROM 					= substr($SQL_REMAIN, 0, $pos);
					$SQL_REMAIN 			= substr($SQL_REMAIN, $pos+1);
					$SQL_REMAIN 			= trim ($SQL_REMAIN);
					
					
					if(in_array($SQL_SECOND_KEYWORD, $this->__SQL_DML_KEYWORDS))
					{
						switch($SQL_SECOND_KEYWORD)
						{
							case 'FROM' :
								$pos 					= strpos($SQL_REMAIN, '"');
								$SQL_THIRD_KEYWORD 		= substr($SQL_REMAIN, 0, $pos);
								$SQL_THIRD_KEYWORD	 	= trim($SQL_THIRD_KEYWORD);
								$SQL_THIRD_KEYWORD_E 	= $SQL_THIRD_KEYWORD;
								$SQL_THIRD_KEYWORD 		= strtoupper($SQL_THIRD_KEYWORD);
								$SQL_REMAIN 			= substr($SQL_REMAIN,$pos);
								$SQL_REMAIN 			= trim ($SQL_REMAIN);
								
								
								if(in_array($SQL_THIRD_KEYWORD, $this->__SQL_DML_KEYWORDS) || $SQL_THIRD_KEYWORD=='')
								{
									switch($SQL_THIRD_KEYWORD)
									{
										case 'WHERE' :
											$SQL_REMAIN = substr($SQL_REMAIN, 1);
											$SQL_REMAIN = trim ($SQL_REMAIN);
											$pos 		= strpos($SQL_REMAIN, '"');
											$PARA_ONE 	= substr($SQL_REMAIN,0,$pos);
											$SQL_REMAIN = substr($SQL_REMAIN, $pos+1);
											$SQL_REMAIN = trim($SQL_REMAIN);
											$pos 		= strpos($SQL_REMAIN, '"');
											$OPERATOR 	= substr($SQL_REMAIN,0,$pos);
											$SQL_REMAIN = substr($SQL_REMAIN, $pos+1);
											$SQL_REMAIN = trim ($SQL_REMAIN);
											$pos 		= strpos($SQL_REMAIN, '"');
											$PARA_TWO 	= substr($SQL_REMAIN,0,$pos);
											break;
										case '' :
											if($SELECT == '*')
											{
												$pos = strpos($FROM, '.');
												if($pos === false)
												{
													if($this->__SELECTED_DB != '')
													{
														$this->xml_fetch_all($this->__SELECTED_DB, $FROM);
													}
													else
													{
														$this->xml_set_error('You must select a Database!(With xml_select_db($db) or with [...] FROM "DataBase.TableName")');
													}
												}
												else
												{
													$db = substr($FROM,0,$pos);
													$this->xml_fetch_all($db, $FROM);
												}	
											}
											break;
										default :
											$this->xml_set_error('You have an error in your xmlSQL syntax near [...] "'.$SQL_THIRD_KEYWORD_E.'" [...](expected "WHERE")');
									}
								}
								else
								{
									$this->xml_set_error('You have an error in your xmlSQL syntax near [...] "'.$SQL_THIRD_KEYWORD_E.'" [...]');
								}
								break;
							default :
								$this->xml_set_error('You have an error in your xmlSQL syntax near [...] "'.$SQL_SECOND_KEYWORD_E.'" [...](expected "FROM")');
								
						}
					}
					else
					{
						$this->xml_set_error('You have an error in your xmlSQL syntax near 1[...] "'.$SQL_SECOND_KEYWORD_E.'" [...]');
					}
						
					break;
				case 'INSERT' :
					echo 'insert';
					break;
				case 'UPDATE' :
					echo 'update';
					break;
				case 'DELETE' :
					echo 'delete';
					break;
				case 'CREATE' :
					echo 'create';
					break;
				case 'TRUNCATE' :
					echo 'truncate';
					break;
				case 'DROP' :
					echo 'drop';
					break;
				case 'ALTER' :
					echo 'alter';
					break;
			}
		}
		else
		{
			echo 'You have an error in your xmlSQL syntax near " '.$SQL_KEYWORD.' " [...]';
		}
		
	}
}