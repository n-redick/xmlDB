<?php
	function imagetograyscale($im)
	{
		$img_width  = imageSX($im);
		$img_height = imageSY($im);
		
		for ($y = 0; $y <$img_height; $y++) {
			for ($x = 0; $x <$img_width; $x++) {
				$rgb = imagecolorat($im, $x, $y);
				$red   = ($rgb >> 16) & 0xFF;
				$green = ($rgb >> 8)  & 0xFF;
				$blue  = $rgb & 0xFF;
				
				$gray = round(.299*$red + .587*$green + .114*$blue);
				
				$grayColor = $gray << 16 | $gray << 8 | $gray | (($rgb>>24)<<24);
	
				// set the pixel color
				imagesetpixel ($im, $x, $y, $grayColor);
			}
		}
	}
	
	function imagetoredscale($im)
	{
		$img_width  = imageSX($im);
		$img_height = imageSY($im);
		
		for ($y = 0; $y <$img_height; $y++) {
			for ($x = 0; $x <$img_width; $x++) {	
				// set the pixel color
				imagesetpixel ($im, $x, $y, imagecolorat($im, $x, $y) & 0xFF0000);
			}
		}
	}
	function imagetobrighter($im)
	{
		$img_width  = imageSX($im);
		$img_height = imageSY($im);
		
		for ($y = 0; $y <$img_height; $y++) {
			for ($x = 0; $x <$img_width; $x++) {	
				$rgb = imagecolorat($im, $x, $y);
				$red   = ($rgb >> 16) & 0xFF;
				$green = ($rgb >> 8)  & 0xFF;
				$blue  = $rgb & 0xFF;
				$gray = min(round((.299*$red + .587*$green + .114*$blue)*1.5 + 0x20), 0xff);
				
				//echo ">>".$rgb."\n";
				
				$grayColor = $gray << 16 | $gray << 8 | $gray | (($rgb>>24)<<24);
				
				//echo "<<".$grayColor."\n";
				// set the pixel color
				imagesetpixel ($im, $x, $y, $grayColor);
			}
		}
	}

	set_time_limit(0);
	
	$sz_dir = "./../../images/icons/";
	$sz_dir = "C:/_projekte/chardev master/website 8.2/images/site/race_class/";
	if(!is_dir($sz_dir)) die;
	$dir = opendir($sz_dir);
	$n = 0;
	$im;
	$im2;
	while($file = readdir($dir)){
		if( !preg_match('/^\d+\.png$/', $file) ) {
			continue;
		}
		//echo $sz_dir.$file."@".ceil(filesize($sz_dir.$file));
		echo $n++."\n";
		$res	=	imagecreatefrompng($sz_dir.$file);
		//
		//	Remove spaces
		//
		$file = str_replace(' ','',$file);
		
		$im = imagecreatetruecolor(48,48);
		$im2 = imagecreatetruecolor(24,24);
		$im3 = imagecreatetruecolor(54,54);
		$im4 = imagecreatetruecolor(32,32);
		$im5 = imagecreatetruecolor(14,14);
		$im6 = imagecreatetruecolor(38,38);
		
/*
		imagecopyresampled($im,$res , 0,0,5,5,48,48,54,54);
		imagecopyresampled($im2,$res , 0,0,5,5,24,24,54,54);
		imagecopyresampled($im3,$res , 0,0,5,5,54,54,54,54);
		imagecopyresampled($im4,$res , 0,0,5,5,32,32,54,54);
		imagecopyresampled($im5,$res , 0,0,5,5,14,14,54,54);
		
		imagepng($im,$sz_dir."medium/".$file);
		imagepng($im2,$sz_dir."small/".$file);
		imagepng($im3,$sz_dir."large/".$file);
		imagepng($im4,$sz_dir."half/".$file);
		imagepng($im5,$sz_dir."gem/".$file);
		
		imagetograyscale($res);
		imagealphablending($res, false);
		imagesavealpha($res, true);
		imagepng($res,$sz_dir."g/".strtolower($file));
		
		imagetograyscale($im);
		imagealphablending($im, false);
		imagesavealpha($im, true);
		imagepng($im,$sz_dir."g/medium/".strtolower($file));
		
		imagetograyscale($im2);
		imagealphablending($im2, false);
		imagesavealpha($im2, true);
		imagepng($im2,$sz_dir."g/small/".strtolower($file));
		
		imagetograyscale($im3);
		imagealphablending($im3, false);
		imagesavealpha($im3, true);
		imagepng($im3,$sz_dir."g/large/".strtolower($file));
		
		imagetograyscale($im4);
		imagealphablending($im4, false);
		imagesavealpha($im4, true);
		imagepng($im4,$sz_dir."g/half/".strtolower($file));
		
		imagetograyscale($im5);
		imagealphablending($im5, false);
		imagesavealpha($im5, true);
		imagepng($im5,$sz_dir."g/gem/".strtolower($file));

		
		imagecopyresampled($im,$res , 0,0,5,5,48,48,54,54);
		imagecopyresampled($im2,$res , 0,0,5,5,24,24,54,54);
		imagecopyresampled($im3,$res , 0,0,5,5,54,54,54,54);
		imagecopyresampled($im4,$res , 0,0,5,5,32,32,54,54);
		imagecopyresampled($im5,$res , 0,0,5,5,14,14,54,54);
		
		imagetoredscale($res);
		imagealphablending($res, false);
		imagesavealpha($res, true);
		imagepng($res,$sz_dir."r/".strtolower($file));
		
		imagetoredscale($im);
		imagealphablending($im, false);
		imagesavealpha($im, true);
		imagepng($im,$sz_dir."r/medium/".strtolower($file));
		
		imagetoredscale($im2);
		imagealphablending($im2, false);
		imagesavealpha($im2, true);
		imagepng($im2,$sz_dir."r/small/".strtolower($file));
		
		imagetoredscale($im3);
		imagealphablending($im3, false);
		imagesavealpha($im3, true);
		imagepng($im3,$sz_dir."r/large/".strtolower($file));
		
		imagetoredscale($im4);
		imagealphablending($im4, false);
		imagesavealpha($im4, true);
		imagepng($im4,$sz_dir."r/half/".strtolower($file));
		
		imagetoredscale($im5);
		imagealphablending($im5, false);
		imagesavealpha($im5, true);
		imagepng($im5,$sz_dir."r/gem/".strtolower($file));
		*/		
		
		$im6 = imagecreatetruecolor(34,34);
		imagecopyresampled($im6,$res , 0,0,5,5,34,34,54,54);
		//imagetobrighter($res);
		imagealphablending($im6, false);
		imagesavealpha($im6, true);
		imagepng($im6,$sz_dir."/resized_".strtolower($file));
	}
?>