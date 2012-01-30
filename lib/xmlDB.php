<?php
######################################################################
### XmlDb() Class
### ------------------------------------------------------------------
### Author: J. Taniguchi
### Date: 2012.01.25
### Contact: j.taniguchi@taniguchi-blog.com
### License: See attached license file.
### Contributers: 
### 	name:Nico Redick   email: coding@assuran.de
######################################################################

######################################################################
### CHANGE LOG
### ------------------------------------------------------------------
###	FIX:	fixed an error in the Result of xml_fetch_all and 
###	  		xml_fetch_specific_row (Nico Redick)
### UPDATE: add executetime function (Nico Redick)
### UPDATE: add xml_get_specific_row function (Nico Redick)
###
###
###
###
######################################################################
class xmlDB
{
	
	
	##################################################################
	### IMPORTANT: DATABASE CONFIGURATION
	##################################################################
	### You should change the values below for database authentication.
	### This is similar to mysql_connect().
	##################################################################
	private $rootUsername = 'root'; // Username.
	private $rootPassword = 'root'; // Password.
	##################################################################
	### END CONFIGURATION. DO NOT CHANGE ANYTHING BELOW THIS LINE ####
	##################################################################
	
	
		
	// ---------------------------------------------------------------
	// GLOBALS
	// ---------------------------------------------------------------
	private $error_message = '';				// tracks error messages.
	private $connected = false;					// tracks user validation.
	private $starttime = '';					// tracks begin of function execution
	private $endtime = '';						// tracks end of function execution
	private $affected_rows = 0;					// tracks affacted rows
	
	public $timeanalysis = false;				// checks if execution times should be tracked
	// ---------------------------------------------------------------
	// CONSTRUCTOR
	// ---------------------------------------------------------------
	public function xmlDB()
	{
		
	}
	

	
	// ---------------------------------------------------------------
	// NUMBER OF ROWS
	// - Return the number of rows of the specified database.
	// ---------------------------------------------------------------
	public function xml_num_rows($dbname, $table_name)
	{
		// check for timeanalysis
		if($this->timeanalysis)
		{
			$this->starttime = microtime(true);
		}
		
		$result = false;
		
		// validate connection.
		if(!$this->connected)
		{
			$this->error_message = 'Unable to retrieve row count. Not connected.';
		}
		else
		{
			// validate database.
			$patch = dirname(__FILE__) . '/db/@' . $dbname . '/';
			if(!file_exists($patch))
			{
				$this->error_message = 'Unable to retrieve row count. Database "'.$dbname.'" does not exists.';
			}
			else
			{
				// validate table.
				$patch .= $table_name . '.xml';
				if(!file_exists($patch))
				{
					$this->error_message = 'Unable to retrieve row count. Table "'.$table_name.'" does not exists.';
				}
				else
				{
					// load table.
					if(!($xml = simplexml_load_file($patch)))
					{
						$this->error_message = 'Unable to retrieve row count. Table could not be load. Table seems to be corrupted. See server log for more details.';
					}
					else
					{
						$result = count($xml->item);
						$this->error_message = '';
					}
				}
			}
		}
		$this->endtime = microtime(true);
		
		return $result;
	}
	
	// ---------------------------------------------------------------
	// CONNECT TO DATABASE.
	// - Return TRUE if connected and FALSE if connection fails. Error
	// text caption can be read using xml_error();
	// ---------------------------------------------------------------
	public function xml_connect($username,$password)
	{	
		// check for timeanalysis
		if($this->timeanalysis)
		{
			$this->starttime = microtime(true);
		}
		
		$result = false;
		
		// validate data.
		if($username == $this->rootUsername && $password == $this->rootPassword)
		{
			$this->connected = true;
			$this->error_message = '';
			$result = true;
		}
		else
		{
			$this->error_message = 'Invalid username or password';
		}
		$this->endtime = microtime(true);
		
		return $result;
	}
		
	
	// ---------------------------------------------------------------
	// CLOSE CONNECTION TO DATABASE.
	// - Invalidate xml_connect();
	// ---------------------------------------------------------------
	public function xml_close()
	{
		$this->connected = false;
		$this->error_message = '';
	}
		
	
	// ---------------------------------------------------------------
	// CREATE NEW DATABASE.
	// - Returns TRUE if successful and FALSE if it fails.
	// ---------------------------------------------------------------
	public function xml_create_db($dbname)
	{	
		// check for timeanalysis
		if($this->timeanalysis)
		{
			$this->starttime = microtime(true);
		}
		
		$result = false;
		
		// check if is connected.
		if(!$this->connected)
		{
			$this->error_message = 'Unable to create database. Not connected.';
		}
		else
		{
			// create database (directory)
			$patch = dirname(__DIR__) . '/db/';
			
			if(!file_exists($patch))
			{
				$this->error_message = 'Unable to create database. Installation seems to be corrupted.';
			}
			else
			{
				$patch .= '@' . $dbname;
				
				// check if database already exists.
				if(file_exists($patch))
				{
					$this->error_message = 'Database "' . $dbname . '" already exists.';
				}
				else
				{
					if(!mkdir($patch,0777))
					{
						$this->error_message = 'Unable to create database due an internal error. See server log for more information.';
					}
					else
					{
						// create a dummy index for new directory.
						$fo = @fopen($patch . '/index.html','w');
						@fwrite($fo, '-');
						@fclose($fo);
						
						$this->error_message = '';
						$result = true;
					}
				}
			}
		}		
		$this->endtime = microtime(true);

		return $result;
	}
		
	
	// ---------------------------------------------------------------
	// DROP DATABASE
	// - It destroys the database directory and all data within it.
	// ---------------------------------------------------------------
	public function xml_drop_db($dbname)
	{	
		// check for timeanalysis
		if($this->timeanalysis)
		{
			$this->starttime = microtime(true);
		}
		
		$result = false;
		
		// validate connection.
		if(!$this->connected)
		{
			$this->error_message = 'Unable to drop database. Not connected.';
		}
		else
		{
			$patch = dirname(__DIR__) . '/db/@'.$dbname.'/';
			
			if(!file_exists($patch))
			{
				$this->error_message = 'Unable to drop database. Database '. $patch . ' does not exists.';
			}
			else
			{
				if(!$this->removedir($patch))
				{
					$this->error_message .= 'Unable to drop database '. $patch . ' due an internal error. See server log for more information.';
				}
				else
				{
					$result = true;
				}
			}
		}
		
		$this->endtime = microtime(true);
		
		return $result;
	}
		
	
	// ---------------------------------------------------------------
	// CREATE TABLE
	// - Creates a new database table.
	// $table_name: the name of the table to be created. Only alphanumeric
	//				characters are allowed.
	// $rows: array containing the names of each column. The row "index"
	//				is added automatically to keep track of row ID.
	// ---------------------------------------------------------------
	public function xml_create_table($db_name, $table_name,$rows)
	{	
		// check for timeanalysis
		if($this->timeanalysis)
		{
			$this->starttime = microtime(true);
		}
		
		$result = false;
		
		$patch = dirname(__DIR__) . '/db/@' . $db_name . '/';
		
		// check if is connected.
		if(!$this->connected)
		{
			$this->error_message = 'Unable to create table. Not connected.';
		}
		// check if database exists.
		else if(!file_exists($patch))
		{
			$this->error_message = 'Unable to create table. Selected database does not exists.';
		}
		// check if table exists.
		else if(file_exists($patch . $table_name . '.xml'))
		{
			$this->error_message = 'Table "'.$table_name.'" already exists.';
		}
		else
		{
			// validate entries.
			if(empty($table_name) || !is_array($rows))
			{
				$this->error_message = 'Unable to create table. Invalid call for xml_create_table(). See documentation for correct usage.';
			}
			else
			{
				// validate table name (alphanumeric only).
				if(!ctype_alnum($table_name))
				{
					$this->error_message = 'The table name must contain alphanumeric characters only.';
				}
				else
				{
					$isvalid = true;
					
					// validate row names (alphanumeric only).
					for($i=0; $i < count($rows); $i++)
					{
						if(!ctype_alnum($rows[$i]))
						{
							$isvalid = false;
							break;
						}
					}
					
					if(!$isvalid)
					{
						$this->error_message = 'The table\'s row (column) names must contain alphanumeric characters only.';
					}
					else
					{
						// create table node.
						$node  = '<?xml version="1.0" encoding="utf-8"?>'."\r\n";
						$node .= '<'.$table_name.'>'."\r\n";
						
						$ref   = 'index,';
						for($r=0; $r < count($rows); $r++)
						{
							$ref .= $rows[$r];
							if(($r+1) < count($rows))
							{
								$ref .= ',';
							}
						}
						
						$node .= '    <rows>'.$ref.'</rows>'."\r\n";						
						$node .= '</'.$table_name.'>'."\r\n";
						
						// write table.
						if(!($fo = fopen($patch . $table_name . '.xml','w')))
						{
							$this->error_message = 'Unable to open database at "'.$patch.$table_name.'".';
						}
						else
						{
							if(!fwrite($fo,$node))
							{
								@fclose($fo);
								$this->error_message = 'Unable to create table. Write permission denied(?).';
							}
							else
							{
								@fclose($fo);
								$this->error_message = '';
								$result = true;
							}
						}
					}
				}
			}
		}
		$this->endtime = microtime(true);
		
		return $result;
	}
		
	
	// ---------------------------------------------------------------
	// INSERT INTO
	// - Insert data into table. Unlike mysql, data type declaration
	// is not required.
	// $dbtable: table to insert data.
	// $dbname: the database to be handled.
	// $values: array of data in which each index contains an object
	// for each row. IE.:
	// $data = array('username:xuser','name:xname','lastname:xlastname');
	// where username,name and lastname corresponds to the table's row
	// and xuser,xname and xlastname the data to be insert.
	// ---------------------------------------------------------------
	public function xml_insert_into($dbtable, $dbname, $values)
	{	
		// check for timeanalysis
		if($this->timeanalysis)
		{
			$this->starttime = microtime(true);
		}
		
		$result = false;
		
		// validate connection.
		if(!$this->connected)
		{
			$this->error_message = 'Unable to insert data into table. Not connected.';
		}
		else if(!is_array($values))
		{
			$this->error_message = 'Unable to insert data into table. Invalid xml_insert_into() request. See documentation for valid usage.';
		}
		else
		{
			// validate database.
			$tablePatch = dirname(__DIR__) . '/db/@' . $dbname . '/';
			if(!file_exists($tablePatch))
			{
				$this->error_message = 'Unable to insert data into table. Database '.$dbname.' does not exists.';
			}
			else
			{
				// validate table.
				$tablePatch .= $dbtable . '.xml';
				if(!file_exists($tablePatch))
				{
					$this->error_message = 'Unable to insert data into table. Table '.$dbtable.' does not exists.';
				}
				else
				{
					// load table.
					if(!$xml = simplexml_load_file($tablePatch))
					{
						$this->error_message = 'Unable to insert data into table. Table '.$dbtable.' could not be loaded (file corrupted?). ';
					}
					else
					{
						// get valid column names.
						$column = explode(',',$xml->rows);
						
						// validate data to be insert. if column name doesn't exists, fail process.
						$valid = true;
						for($i=0; $i < count($values); $i++)
						{
							$data = explode(':',$values[$i]);
							
							if(!in_array($data[0],$column))
							{
								$this->error_message = 'The column '. $data[0] . ' does not exists on table ' . $dbtable . '.';
								$valid = false;
								break;
							}
						}
						
						// insert data into table.
						if($valid)
						{
							// create node.
							$node  = '<?xml version="1.0" encoding="utf-8"?>'."\r\n";
							$node .= '<'.$dbtable.'>'."\r\n";
							$node .= '    <rows>'.$xml->rows.'</rows>'."\r\n\r\n";
							$node .= '    <item index="'.md5(mt_rand('000','999')).'"'."\r\n";
							for($i=0; $i < count($values); $i++)
							{
								$data = explode(':',$values[$i]);
								
								if(empty($data[0]))
								{
									$this->error_message = 'The name of each column must be properly declared. See documentation for valid usage.';
								}
								else
								{
									$node .= '       '.$data[0].'="'.$this->filterString($data[1]).'"'."\r\n";
								}
							}
							$node .= '    />'."\r\n";
							
							// get previously entered nodes.
							for($u=0; $u < count($xml->item); $u++)
							{
								$node .= '    <item index="'.$xml->item[$u][index].'"'."\r\n";
								
								for($x=0; $x < count($column); $x++)
								{
									if($column[$x] == 'index')
									{
										// skip for it's already added above.
									}
									else
									{
										$node .= '       '.$column[$x].'="'.$xml->item[$u][$column[$x]].'"'."\r\n";
									}
								}
								
								$node .= '    />'."\r\n";	
							}				
							$node .= '</'.$dbtable.'>'."\r\n";
							
							// update table.
							if(!($fo = fopen($tablePatch,'w')))
							{
								$this->error_message = 'Unable to insert data into table. Table "' . $dbtable . '" does not exists or is corrupted.';
							}
							else
							{
								@flock($fo, LOCK_EX);
								if(!fwrite($fo,$node))
								{
									@flock($fo, LOCK_UN);
									@fclose($fo);
									$this->error_message = 'Unable to insert data into table. Write permission denied(?).';
								}
								else
								{
									@flock($fo, LOCK_UN);
									@fclose($fo);
									$result = true;
								}
							}
						}
					}
				}
			}
		}
		$this->endtime = microtime(true);
		
		return $result;
	}
	
	
	// ---------------------------------------------------------------
	// FETCH DATA
	// - Fetch data of pre-defined id. Returns an array of column name
	// plus values. IE. $array['column_name'] = 'value';
	// ---------------------------------------------------------------
	public function xml_fetch_row($dbname, $table_name, $id)
	{	
		// check for timeanalysis
		if($this->timeanalysis)
		{
			$this->starttime = microtime(true);
		}
		
		$result = false;
		
		// validate connection.
		if(!$this->connected)
		{
			$this->error_message = 'Unable to fetch row. Not connected.';
		}
		else
		{
			// validate database.
			$patch = dirname(__DIR__) . '/db/@' . $dbname . '/';
			if(!file_exists($patch))
			{
				$this->error_message = 'Unable to fetch row. Database "' . $dbname . '" does not exists.';
			}
			else
			{
				// validate table.
				$patch .= $table_name . '.xml';
				if(!file_exists($patch))
				{
					$this->error_message = 'Unable to fetch row. Table "' . $table_name . '" does not exists.';
				}
				else
				{
					// load table.
					if(!($xml = simplexml_load_file($patch)))
					{
						$this->error_message = 'Unable to fetch row. Table "' . $dbname . '" does not exists or is corrupted.';
					}
					else
					{
						// get row data.
						$found = false;
						for($i=0; $i < count($xml->item); $i++)
						{
							if($xml->item[$i][index] == $id)
							{
								$found = true;
								$result = array();
								
								$nodes = explode(',',$xml->rows);
								for($n=0; $n < count($nodes); $n++)
								{
									if($nodes[$n] == 'index')
									{
										$result[$nodes[$n]] = $xml->item[$i][$nodes[$n]];
									}
									else
									{
										$result[$nodes[$n]] = $this->decode($xml->item[$i][$nodes[$n]]);
									}
								}
								
								break;
							}
						}
						
						if(!$found)
						{
							$this->error_message = 'No rows found for ID '.$id.'.';
						}						
					}
				}
			}
		}
		$this->endtime = microtime(true);
		
		return $result;
	}
	
	// ---------------------------------------------------------------
	// FETCH SPECIFIC DATA
	// - Fetch data of defined Column. Returns an array of column name
	// plus values. IE. $array['column_name'] = 'value';
	// ---------------------------------------------------------------
	public function xml_fetch_specific_row($dbname, $table_name, $column, $value)
	{
		// check for timeanalysis
		if($this->timeanalysis)
		{
			$this->starttime = microtime(true);
		}
		
		$result = false;
		
		// validate connection.
		if(!$this->connected)
		{
			$this->error_message = 'Unable to fetch row. Not connected.';
		}
		else
		{
			// validate database.
			$patch = dirname(__DIR__) . '/db/@' . $dbname . '/';
			if(!file_exists($patch))
			{
				$this->error_message = 'Unable to fetch row. Database "' . $dbname . '" does not exists.';
			}
			else
			{
				// validate table.
				$patch .= $table_name . '.xml';
				if(!file_exists($patch))
				{
					$this->error_message = 'Unable to fetch row. Table "' . $table_name . '" does not exists.';
				}
				else
				{
					// load table.
					if(!($xml = simplexml_load_file($patch)))
					{
						$this->error_message = 'Unable to fetch row. Table "' . $dbname . '" does not exists or is corrupted.';
					}
					else
					{
						//validate column.
						
						// get valid column names.
						$vcolumn = explode(',',$xml->rows);						
						if(!in_array($column,$vcolumn))
						{
							$this->error_message = 'The column '. $column . ' does not exists on table ' . $table_name . '.';
						}
						else
						{
							
							// get row data.
							$found = false;
							$result = array();
							for($i=0; $i < count($xml->item); $i++)
							{
								if($xml->item[$i][$column] == $this->filterString($value))
								{
									$found = true;
									$nodes = explode(',',$xml->rows); // can be replaced by $vcolumns
									for($n=0; $n < count($nodes); $n++)
									{
										
										if($nodes[$n] == 'index')
										{
											$result[$i][$n][0] = $nodes[$n];
											$result[$i][$n][1] = $xml->item[$i][$nodes[$n]];
										}
										else
										{
											$result[$i][$n][0] = $nodes[$n];
											$result[$i][$n][1] = $this->decode($xml->item[$i][$nodes[$n]]);
										}
									}
								}
							}
	
							if(!$found)
							{
								$this->error_message = 'No rows found for Column "'.$column.'" with value "'.$value.'".';
							}
						}
					}
				}
			}
		}
		$this->endtime = microtime(true);
		return $result;
	}
	
	// ---------------------------------------------------------------
	// FETCH ALL DATA
	// - Fetch all data within declared table. Returns an array for
	// the collected data. IE. $array['column_name'][row_index] = 'value';
	// ---------------------------------------------------------------
	public function xml_fetch_all($dbname, $table_name)
	{
		// check for timeanalysis
		if($this->timeanalysis)
		{
			$this->starttime = microtime(true);
		}
		
		$result = false;
		
		// validate connection.
		if(!$this->connected)
		{
			$this->error_message = 'Unable to fetch data. Not connected.';
		}
		else
		{
			// validate database.
			$patch = dirname(__DIR__) . '/db/@' . $dbname . '/';
			if(!file_exists($patch))
			{
				$this->error_message = 'Unable to fetch data. Database "' . $dbname . '" does not exists.';
			}
			else
			{
				// validate table.
				$patch .= $table_name . '.xml';
				if(!file_exists($patch))
				{
					$this->error_message = 'Unable to fetch data. Table "' . $table_name . '" does not exists.';
				}
				else
				{
					// load table.
					if(!($xml = simplexml_load_file($patch)))
					{
						$this->error_message = 'Unable to fetch data. Table "' . $dbname . '" does not exists or is corrupted.';
					}
					else
					{
						// get all data.
						$found = false;
						$result = array();
						$nodes = explode(',',$xml->rows);
						
						for($i=0; $i < count($xml->item); $i++)
						{
							$found = true;
							
							for($n=0; $n < count($nodes); $n++)
							{
								if($nodes[$n] == 'index')
								{
									$result[$i][$n][0] = $nodes[$n];
									$result[$i][$n][1] = $xml->item[$i][$nodes[$n]];
								}
								else
								{
									$result[$i][$n][0] = $nodes[$n];
									$result[$i][$n][1] = $this->decode($xml->item[$i][$nodes[$n]]);
								}
							}
						}
												
						if(!$found)
						{
							$this->error_message = 'No row found on table '.$table_name.'.';
							$result = false;
						}						
					}
				}
			}
		}
		$this->endtime = microtime(true);
		
		return $result;
	}
		
	
	// ---------------------------------------------------------------
	// DELETE
	// - Removes a row of specified id.
	// ---------------------------------------------------------------
	public function xml_delete_row($dbname, $table_name, $id)
	{
		// check for timeanalysis
		if($this->timeanalysis)
		{
			$this->starttime = microtime(true);
		}
		
		$result = false;
		
		// validate connection.
		if(!$this->connected)
		{
			$this->error_message = 'Unable to delete row. Not connected.';
		}
		else
		{
			// validate database.
			$patch = dirname(__DIR__) . '/db/@'.$dbname.'/';
			if(!file_exists($patch))
			{
				$this->error_message = 'Unable to delete row. Database "'. $dbname . '" does not exists.';
			}
			else
			{
				// validate table.
				$patch .= $table_name . '.xml';
				if(!file_exists($patch))
				{
					$this->error_message = 'Unable to delete row. Table "'.$table_name.'" does not exists.';
				}
				else
				{
					// load table.
					if(!($xml= simplexml_load_file($patch)))
					{
						$this->error_message = 'Unable to delete row. Table "'.$table_name.'" seems to be corrupted and could not be load.';
					}
					else
					{
						// build nodes.
						$found = false;
						$node  = '<?xml version="1.0" encoding="utf-8"?>'."\r\n";
						$node .= '<'.$table_name.'>'."\r\n";
						$node .= '    <rows>'.$xml->rows.'</rows>'."\r\n\r\n";
						
						$nodes = explode(',',$xml->rows);
						
						for($i=0; $i < count($xml->item); $i++)
						{
							if($xml->item[$i][index] == $id)
							{
								// skip node.
								$found = true;
							}
							else
							{
								for($r=0; $r < count($nodes); $r++)
								{
									if($nodes[$r] == 'index')
									{
										$node .= '       <item index="'.$xml->item[$i][index].'"'."\r\n";
									}
									else
									{
										$node .= '           '.$nodes[$r].'="'.$xml->item[$i][$nodes[$r]].'"'."\r\n";
									}
								}
								$node .= '       />'."\r\n";
							}
						}
						$node .= '</'.$table_name.'>'."\r\n";
						
						// update to table.
						if(!$found)
						{
							$this->error_message = 'Unable to delete row. ID "'.$id.'" does not exists.';
						}
						else
						{
							if(!($fo = fopen($patch,'w')))
							{
								$this->error_message = 'Unable to delete row. Unable to open table. See server log for more details.';
							}
							else
							{
								@flock($fo,LOCK_EX);
								
								if(!fwrite($fo,$node))
								{
									@flock($fo, LOCK_UN);
									@fclose($fo);
									$this->error_message = 'Unable to delete row. Write permission denied(?).';
								}
								else
								{
									@flock($fo, LOCK_UN);
									@fclose($fo);
									$result = true;
									$this->error_message = '';
								}
							}
						}
					}
				}
			}
		}
		$this->endtime = microtime(true);
		
		return $result;
	}
		
		
	
	// ---------------------------------------------------------------
	// DROP TABLE
	// - Remove the entire table.
	// ---------------------------------------------------------------
	public function xml_drop_table($dbname, $table_name)
	{
		// check for timeanalysis
		if($this->timeanalysis)
		{
			$this->starttime = microtime(true);
		}
		
		$result = false;
		
		// validate connection.
		if(!$this->connected)
		{
			$this->error_message = 'Unable to drop table. Not connected.';
		}
		else
		{
			// validate database.
			$patch = dirname(__DIR__).'/db/@'. $dbname.'/';
			if(!file_exists($patch))
			{
				$this->error_message = 'Unable to drop table "'.$table_name.'". Database "'.$dbname.'" does not exists.';
			}
			else
			{
				// validate table.
				$patch .= $table_name . '.xml';
				if(!file_exists($patch))
				{
					$this->error_message = 'Unable to drop table "'.$table_name.'". Table does not exists.';
				}
				else
				{
					// delete table.
					if(!unlink($patch))
					{
						$this->error_message = 'Unable to drop table "'.$table_name.'". See server log for more details.';
					}
					else
					{
						$result = true;
					}
				}
			}
		}
		$this->endtime = microtime(true);
		
		return $result;
	}
		
	
	// ---------------------------------------------------------------
	// UPDATE
	// - Updates a rows of declared table by id. See index for samples.
	// ---------------------------------------------------------------
	public function xml_update_row($dbname,$table_name,$id, $data)
	{
		// check for timeanalysis
		if($this->timeanalysis)
		{
			$this->starttime = microtime(true);
		}
		
		$result = false;
		
		// validate connection.
		if(!$this->connected)
		{
			$this->error_message = 'Unable to update table. Not connected.';
		}
		else
		{
			// validate database.
			$patch = dirname(__DIR__).'/db/@' . $dbname . '/';
			if(!file_exists($patch))
			{
				$this->error_message = 'Unable to update table. Database "'.$dbname.'" does not exists.';
			}
			else if(empty($id) || !is_array($data))
			{
				$this->error_message = 'Unable to update table. Required data not provided. See documantation for valid update request.';
			}
			else
			{
				// validate table.
				$patch .= $table_name . '.xml';
				if(!file_exists($patch))
				{
					$this->error_message = 'Unable to update table. Table "'.$table_name.'" does not exists.';
				}
				else
				{
					// load table.
					if(!($xml = simplexml_load_file($patch)))
					{
						$this->error_message = 'Unable to update table. Unable to load table "'.$table_name.'". See server log for more information.';
					}
					else
					{
						$rows = explode(',',$xml->rows);
						
						// validate update data.
						$valid = true;
						for($d=0; $d < count($data); $d++)
						{
							$item = explode(':',$data[$d]);
							
							if(!in_array($item[0],$rows))
							{
								$valid = false;
								$this->error_message = 'Unable to update row. The key "'.$item[0].'" does not exist on table "'.$table_name.'".';
								break;
							}
						}
						
						if($valid)
						{
							// create node.
							$node  = '<?xml version="1.0" encoding="utf-8"?>'."\r\n";
							$node .= '<'.$table_name.'>'."\r\n";
							$node .= '    <rows>'.$xml->rows.'</rows>'."\r\n\r\n";
							for($i=0; $i < count($xml->item); $i++)
							{
								$node .= '    <item index="'.$xml->item[$i][index].'"'."\r\n";
								if($xml->item[$i][index] == $id)
								{
									for($r=0; $r < count($rows); $r++)
									{
										if($rows[$r] != 'index')
										{
											$value = array();
											for($v=0; $v < count($data); $v++)
											{
												$item = explode(':',$data[$v]);
												$value[$item[0]][$v] = $item[1];
											}
											
											if(!empty($value[$rows[$r]][$r-1]))
											{
												$node .= '         ' . $rows[$r] . '="'.$this->filterString($value[$rows[$r]][$r-1]).'"' ."\r\n";
											}
											else
											{
												$node .= '         ' . $rows[$r] . '="'.$xml->item[$i][$rows[$r]].'"' ."\r\n";
											}
										}
									}
								}
								else
								{
									for($r=0; $r < count($rows); $r++)
									{
										if($rows[$r] != 'index')
										{
											$node .= '         ' . $rows[$r] . '="'.$xml->item[$i][$rows[$r]].'"' ."\r\n";
										}
									}
								}
								$node .= '    />'."\r\n";
							}
							
							$node .= '</'.$table_name.'>'."\r\n";
							
							// update table.
							if(!($fo = fopen($patch,'w')))
							{
								$this->error_message = 'Unable to update row. Unable to open table. See server log for more details.';
							}
							else
							{
								@flock($fo, LOCK_EX);
								if(!fwrite($fo,$node))
								{
									@flock($fo, LOCK_UN);
									@fclose($fo);
									$this->error_message = 'Unable to update row. Write permission denied(?).';
								}
								else
								{
									@flock($fo, LOCK_UN);
									@fclose($fo);
									$result = true;
									$this->error_message = '';
								}
							}
						}
					}
				}
			}
		}
		$this->endtime = microtime(true);
		
		return $result;
	}
		
	
	// ---------------------------------------------------------------
	// PRIVATE METHOD: CONVERT HEX TO UNICODE.
	// ---------------------------------------------------------------
	private function decode($value)
	{
		if(empty($value))
		{
			return;
		}
		else
		{
			// decode it.
			$result = base64_decode($value);
		}
		
		return $result;
	}
		
	
	// ---------------------------------------------------------------
	// PRIVATE METHOD: FILTER HTML SPECIAL CHARS BY CONVERTING TO B64
	// ---------------------------------------------------------------
	private function filterString($value)
	{
		if(empty($value))
		{
			return;
		}
		else
		{
			// handle special chars.
			$result = '';
			for ($i = 0; $i < strlen($value); $i++) {
				$char = $value[$i];
				$ascii = ord($char);
				if ($ascii < 128) {
					// one-byte character
					$result .= (true) ? htmlentities($char) : $char;
				} else if ($ascii < 192) {
					// non-utf8 character or not a start byte
				} else if ($ascii < 224) {
					// two-byte character
					$result .= htmlentities(substr($value, $i, 2), ENT_QUOTES, 'UTF-8');
					$i++;
				} else if ($ascii < 240) {
					// three-byte character
					$ascii1 = ord($value[$i+1]);
					$ascii2 = ord($value[$i+2]);
					$unicode = (15 & $ascii) * 4096 +
							   (63 & $ascii1) * 64 +
							   (63 & $ascii2);
					$result .= "&#$unicode;";
					$i += 2;
				} else if ($ascii < 248) {
					// four-byte character
					$ascii1 = ord($value[$i+1]);
					$ascii2 = ord($value[$i+2]);
					$ascii3 = ord($value[$i+3]);
					$unicode = (15 & $ascii) * 262144 +
							   (63 & $ascii1) * 4096 +
							   (63 & $ascii2) * 64 +
							   (63 & $ascii3);
					$result .= "&#$unicode;";
					$i += 3;
				}
			}
			
			// encrypt it.
			$result = base64_encode($result);
		}
		
		return $result;
	}
		
	
	// ---------------------------------------------------------------
	// PRIVATE METHOD: REMOVE DIRECTORY RECURSEVILY
	// ---------------------------------------------------------------
	private function removedir($dirname)
	{
		if(!file_exists($dirname))
		{
			$this->error_message .= 'Directory ' . $dirname . ' does not exists.';
			return false;
		}
		
		if(is_dir($dirname))
		{
		 	if(!($dir_handle = opendir($dirname)))
			{
				$this->error_message .= 'Unable to open directory ' . $dirname;
		 		 return false;
			}
		}
	    	   
	    while($file = readdir($dir_handle)) 
		{
		  if ($file != "." && $file != "..") 
		  {
			 if (!is_dir($dirname."/".$file))
				@unlink($dirname."/".$file);
			 else
				$this->removedir($dirname.'/'.$file);    
		  }
	   }
	   
	   @closedir($dir_handle);
	   
	   if(!rmdir($dirname))
	   {
			$this->error_message .= 'Unable to remove direcory ' . $dirname . ' due an internal error.';
			return false;  
	   }
	   else
	   {
			return true;  
	   }
	}
		
	public function xml_set_error($error)
	{
		$this->error_message = $error;
	}
	// ---------------------------------------------------------------
	// DISPLAY DATABASE ERROR ALERTS AS STRING.
	// ---------------------------------------------------------------
	public function xml_error()
	{
		$result = '';
		
		if(!empty($this->error_message))
		{
			$result = $this->error_message;
		}
		
		return $result;
	}

	// ---------------------------------------------------------------
	// DISPLAY EXECUTION TIME AS STRING.
	// ---------------------------------------------------------------
	public function xml_executetime()
	{
		$result = '';
	
		if(!empty($this->starttime))
		{
			$result = "<br>Executed in ".substr(($this->endtime - $this->starttime),0,10)." seconds";
		}
	
		return $result;
	}
	
	// ---------------------------------------------------------------
	// 
	// ---------------------------------------------------------------
	
} // end class
