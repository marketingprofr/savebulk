<?php

defined( 'ABSPATH' ) || die( 'No direct script access allowed!' );

class W3ExWordABulkEditAjaxHandler{
	
	private static $bwoosave = true;
	private static $bhandlewoocog = false;
	private static $bsavepost = false;
	private static $debugmode = false;
	private static $mapcustom = array();
	private static $last = null;
	private static $columns = array();
	
							
//	private static $childrencache = null;
    public static function lang_object_id($id,$taxname)
	{
	  if(function_exists('icl_object_id')) 
	  {
	    return icl_object_id($id,$taxname,false);
	  }else 
	  {
	  	if(has_filter('wpml_object_id'))
	  	{
			return apply_filters( 'wpml_object_id', $id, $taxname ,FALSE);
		}else
	    	return $id;
	  }
	 }
	
	public static function WriteDebugInfo($info,$curr_settings,$arr = null)
	{

	    if(!self::$debugmode)
	    	return;
		if($info === "clear")
		{
			update_option('w3exwabe_debuginfo',array());
			return;
		}
		
	    $now = microtime(true);
		$elapsed = $now;
	    if (self::$last != null) 
	    {
	       $elapsed = round(($now - self::$last),5);
	    }

	    self::$last = $now;

		if($arr === null)
		{
//			$curr_settings['debuginfo'] = $info;
//			update_option('w3exwabe_settings',$curr_settings);
			$info.= " (".$elapsed. " sec.)";
			$retarr = get_option('w3exwabe_debuginfo');
			if(!is_array($retarr))
				$retarr = array($info);
			else
				$retarr[0] = $info;
//			$result = array_merge($retarr, $arr);
			update_option('w3exwabe_debuginfo',$retarr);
//			update_option('w3exwabe_debuginfo',array($info));
		}
		if($arr !== null)
		{
			$retarr = get_option('w3exwabe_debuginfo');
			
			if(!is_array($retarr))
				$retarr = array();
			if(!is_array($arr))
			{
				if($arr === "") return;
				$arr.= " (".$elapsed. " sec.)";
				$retarr[] = $arr;
			}
			else
			{
				if(empty($arr)) return;
				if(count($arr) === 1)
				{
					if($arr[0] === "")
						return;
				}
				$retarr = array_merge($retarr, $arr);
			}
			update_option('w3exwabe_debuginfo',$retarr);
		}
	}
	
	public static function CallWooAction($productid,$oldpost = null,$proddata = null)
	{
		
		if(self::$bsavepost)
		{
//			clean_post_cache( $productid );
			$post = get_post($productid);
			do_action( 'edit_post', $productid, $post );
//			$post_after = get_post($post_ID);

		/**
		 * Fires once an existing post has been updated.
		 *
		 * @since 3.0.0
		 *
		 * @param int     $post_ID      Post ID.
		 * @param WP_Post $post_after   Post object following the update.
		 * @param WP_Post $post_before  Post object before the update.
		 */
//			if($oldpost !== null)
//				do_action( 'post_updated', $productid, $post, $oldpost);
			if($proddata !== null)
			{
				foreach($proddata as $arrrow => $rowdata)
				{
					$_REQUEST[$arrrow] = $rowdata;
				}
			}
			do_action( 'save_post',$productid,$post,true);
			do_action( "save_post_{$post->post_type}", $productid, $post, true );
			do_action( 'wp_insert_post', $productid, $post, true );
		}
	}
	
	public static function mres($value)
	{
//		$search = array("\x00", "\n", "\r", "\\", "'", "\"", "\x1a");
//		$replace = array("\\x00", "\\n", "\\r", "\\\\" ,"\';", "\\\"", "\\\x1a");

//		return str_replace($search, $replace, $value);
		return strtr($value, array(
		  "\x00" => '\x00',
		  "\n" => '\n', 
		  "\r" => '\r', 
		  '\\' => '\\\\',
		  "'" => "\'", 
		  '"' => '\"', 
		  "\x1a" => '\x1a'
		));
	}
	
	public static function LoopMetaData(&$metavals,&$ids,&$tax_classes,$converttoutf8)
	{
		foreach($metavals as &$val)
		{
			
			if(array_key_exists($val->ID,$ids))
			{
				$obj = $ids[$val->ID];
				
				$metavalue = "";
				if($converttoutf8)
				{
					$metavalue = mb_convert_encoding($val->meta_value, "UTF-8");
				}else
				{
					$metavalue = $val->meta_value;
				}
				$metakey = $val->meta_key;
				if($val->meta_key == '_downloadable_files')
				{
					//add stuff here later
				}else{
					$obj->{$metakey} = $metavalue;
				}
			}
		}
	}
	
	public static function PrepareQuery($which,$customparam = NULL)
	{
		$ret = "";
		if($which === "wp_posts")
		{
//			p1.ID,p1.post_title,p1.post_parent,p1.post_status,p1.post_content,p1.post_excerpt,p1.post_name,p1.post_date,p1.comment_status,p1.menu_order,p1.post_type
			$fields = array();
			$fields[] = 'post_title';
			$fields[] = 'post_author';
			$fields[] = 'post_status';
			$fields[] = 'post_content';
			$fields[] = 'post_excerpt';
			$fields[] = 'post_name';
			$fields[] = 'post_date';
			$fields[] = 'comment_status';
			$fields[] = 'menu_order';
			foreach($fields as $field)
			{
				if(in_array($field,self::$columns) || empty(self::$columns))
				{
					if($ret === "")
					{
						$ret = 'p1.'.$field;
					}else
					{
						$ret = $ret.',p1.'.$field;
					}
				}
			}
		}elseif($which === "wp_meta1")
		{
//			'_regular_price','_sale_price','_sku','_weight','_length','_width','_height','_stock','_stock_status','_visibility','_virtual','_download_type','_download_limit','_download_expiry'
			$fields = array();
			$fields[] = '_regular_price';
			$fields[] = '_sale_price';
			$fields[] = '_sku';
			$fields[] = '_weight';
			$fields[] = '_length';
			$fields[] = '_width';
			$fields[] = '_height';
			$fields[] = '_stock';
			$fields[] = '_stock_status';
			$fields[] = '_visibility';
			$fields[] = '_virtual';
			$fields[] = '_download_type';
			$fields[] = '_download_limit';
			$fields[] = '_download_expiry';
			foreach($fields as $field)
			{
				if(in_array($field,self::$columns) || empty(self::$columns))
				{
					if($ret === "")
					{
						$ret = "'".$field."'";
					}else
					{
						$ret = $ret.",'".$field."'";
					}
				}
			}
			
		}elseif($which === "wp_meta2")
		{
//			//		'_downloadable_files','_downloadable','_sale_price_dates_from','_sale_price_dates_to','_tax_class','_tax_status','_backorders','_manage_stock','_featured','_purchase_note'
			$fields = array();
			$fields[] = '_downloadable_files';
			$fields[] = '_downloadable';
			$fields[] = '_sale_price_dates_from';
			$fields[] = '_sale_price_dates_to';
			$fields[] = '_tax_class';
			$fields[] = '_tax_status';
			$fields[] = '_backorders';
			$fields[] = '_manage_stock';
			$fields[] = '_featured';
			$fields[] = '_purchase_note';
			foreach($fields as $field)
			{
				if(in_array($field,self::$columns) || empty(self::$columns))
				{
					if($ret === "")
					{
						$ret = "'".$field."'";
					}else
					{
						$ret = $ret.",'".$field."'";
					}
				}
			}
		}elseif($which === "wp_meta3")
		{
//'_variation_description','_sold_individually','_product_url','_button_text','_thumbnail_id','_product_image_gallery','_upsell_ids','_crosssell_ids','_product_attributes','_default_attributes'{$customfields}
			$fields = array();
			$fields[] = '_variation_description';
			$fields[] = '_sold_individually';
			$fields[] = '_product_url';
			$fields[] = '_button_text';
			$fields[] = '_thumbnail_id';
			$fields[] = '_product_image_gallery';
			$fields[] = '_upsell_ids';
			$fields[] = '_crosssell_ids';
			$fields[] = '_default_attributes';
			foreach($fields as $field)
			{
				if(in_array($field,self::$columns) || empty(self::$columns))
				{
					if($ret === "")
					{
						$ret = "'".$field."'";
					}else
					{
						$ret = $ret.",'".$field."'";
					}
				}
			}
			if($customparam !== NULL)
			{
				foreach($customparam as $value)
				{
					if(in_array($value,self::$columns) || empty(self::$columns))
					{
						if($ret === "")
						{
							$ret = "'".esc_attr($value)."'";
						}else
						{
							$ret = $ret.",'".esc_attr($value)."'";
						}
					}
				}
			}
		}elseif($which === "columnchange")
		{
//			//		'_downloadable_files','_downloadable','_sale_price_dates_from','_sale_price_dates_to','_tax_class','_tax_status','_backorders','_manage_stock','_featured','_purchase_note'
			$fields = array();
			$fields[] = '_downloadable_files';
			$fields[] = '_downloadable';
			$fields[] = '_sale_price_dates_from';
			$fields[] = '_sale_price_dates_to';
			$fields[] = '_tax_class';
			$fields[] = '_tax_status';
			$fields[] = '_backorders';
			$fields[] = '_manage_stock';
			$fields[] = '_featured';
			$fields[] = '_purchase_note';
			foreach($fields as $field)
			{
				if(in_array($field,self::$columns) || empty(self::$columns))
				{
					if($ret === "")
					{
						$ret = "'".$field."'";
					}else
					{
						$ret = $ret.",'".$field."'";
					}
				}
			}
		}

		return $ret;
	}
	
	public static function loadProducts($titleparam,$catparams,$attrparams,$priceparam,$saleparam,$customparam,&$total,$ispagination,$isnext,&$hasnext,&$isbegin,$categoryor,$skuparam,$tagsparams,$descparam,$shortdescparam,$custsearchparam,$arrduplicate = null, $reserved = null)
	{
	try {
		global $wpdb;
		$wpdb->suppress_errors( true );
//		$chars = get_bloginfo('charset');
		$posts = $wpdb->posts;
		$meta = $wpdb->postmeta;
		$temptable = $wpdb->prefix."wpmelon_wadvbedit_temp";
		$term = $wpdb->term_relationships;
		$term_taxonomy = $wpdb->term_taxonomy;
		$attributes = array();
		$attrmapslugtoname = array();
		$LIMIT = 1000;
		$temptotal = 0;
		$idlimitquery = "";
		$bgetvariations = false;
		$bgettotalnumber = true;
		$bgetallvars = true;
		$bgetallvarstaxonomies = true;
		$bdebugmode = false;
		$idquery = "";
		$minused = "";
		$maxused = "";
		$p1idquery = "";
		$getnumberquery = "";
		$limitquery = "";
		$sortquery = " DESC";
		$info = array();
		$tax_classes = array();
		$arrcurrentpostype = array();
		$post_type = 'post';
		if(isset($_POST['post_type']))
			$post_type = $_POST['post_type'];
		if(isset($_POST['arrcurrentpostype']))
			$arrcurrentpostype = $_POST['arrcurrentpostype'];
			
		$curr_settings = get_option('w3exwabe_settings');
		if(!is_array($curr_settings))
		{
			$curr_settings = array();
		}
		if($post_type === 'post' || $post_type === 'page')
		{
			if(isset($curr_settings['isvariations']))
			{
				if($curr_settings['isvariations'] == 1)
					$bgetvariations = true;
			}
		}
		
		if(isset($curr_settings['settlimit']))
		{
			$LIMIT = (int)$curr_settings['settlimit'];
		}
		if(isset($curr_settings['settgetall']))
		{
			if($curr_settings['settgetall'] == 1)
				$bgettotalnumber = false;
		}
		if(isset($curr_settings['debugmode']))
		{
			if($curr_settings['debugmode'] == 1)
			{
				$bdebugmode = true;
				self::$debugmode = true;
			}
		}
			self::WriteDebugInfo("0.5 after get t classes ".__LINE__,$curr_settings);
			self::WriteDebugInfo("clear",$curr_settings);
		
			self::WriteDebugInfo("0.6 after get attrs ".__LINE__,$curr_settings);
			
		$attributekeys = array();
		
		$query = "CREATE TABLE IF NOT EXISTS {$temptable} (
			 ID bigint(20) unsigned NOT NULL DEFAULT '0',
   			 type int(1) NOT NULL DEFAULT '0',
    	     post_parent bigint(20) unsigned NOT NULL DEFAULT '0',
			 useit int(1) NOT NULL DEFAULT '0',
			 PRIMARY KEY(ID))";
if($arrduplicate === null)
{
		$ret = $wpdb->query($query);

			self::WriteDebugInfo("0.9 after create t ".__LINE__,$curr_settings);

		if ( false === $ret) {
				return new WP_Error( 'db_query_error', 
					__( 'Could not execute query' ), $wpdb->last_error );
		} 
		$orderby = "ORDER BY {$posts}.ID DESC";
		if ( $ispagination) 
		{
			$query = "SELECT MIN(ID) FROM {$temptable} WHERE useit=1";
			$ret = $wpdb->get_var($query);
			$minused = $ret;
			$query = "SELECT MAX(ID) FROM {$temptable} WHERE useit=1";
			$ret = $wpdb->get_var($query);
			$maxused = $ret;
			if($isnext)
			{
				if($ret)
				{
					$idquery = " AND ID < {$minused}";
					$p1idquery = " AND p1.ID < {$minused}";
					
				}else
				{
					$ispagination = false;
					$isbegin = true;
				}
			}				
			else
			{
				
				if($ret)
				{
					$idquery = " AND ID > {$maxused}";
					$p1idquery = " AND p1.ID > {$maxused}";
					$sortquery = " ASC";
					$orderby = "ORDER BY {$posts}.ID ASC";
					
				}else
				{
					$ispagination = false;
					$isbegin = true;
				}
				
			}
			
			
		}
	
			self::WriteDebugInfo("1 before truncate",$curr_settings);
		
		$query = "TRUNCATE TABLE {$temptable}";
		$ret = $wpdb->query($query);
		if ( false === $ret) {
			if ( is_wp_error( $ret ) ) {
				return new WP_Error( 'db_query_error', 
					__( 'Could not execute query' ), $wpdb->last_error );
			} else {
				$query = "DELETE FROM {$temptable} WHERE 1";
				$ret = $wpdb->query($query);
				if ( false === $ret) {
					return $wpdb->last_error;
				}
			}
		}
		if($bdebugmode)
		{
			self::WriteDebugInfo("2 after truncate",$curr_settings);
		}
		$catsquery = "";
		$pricequery = "";
		$salequery = "";
//		$titlequery = "";
		$titlelike = "";
		if($catparams == NULL) $catparams = array();
		if($attrparams == NULL) $attrparams = array();
		if($titleparam == NULL) $titleparam = "";
		if($descparam == NULL) $descparam = "";
		if($shortdescparam == NULL) $shortdescparam = "";
		if($customparam == NULL) $customparam = array();
		if($skuparam == NULL) $skuparam = "";
		if($tagsparams == NULL) $tagsparams = array();
		if($custsearchparam == NULL) $custsearchparam = array();
		$hascustomtax = false;
		$hasattribute = false;
		$hascatnone = false;
		$wherenotin = "";  //AND	{$posts}.ID NOT IN (SELECT {$term}.object_id FROM {$term} WHERE {$term}.term_taxonomy_id IN (43,44))
		foreach($custsearchparam as $custitem)
		{
			if(isset($custitem['type']) && ($custitem['type'] === 'custom' || $custitem['type'] === 'customh'))
			{
				if(isset($custitem['array']) && is_array($custitem['array']))
				{
					$hascustomtax = true;
				}
				if($custitem['id'] === 'product_type')
					$bgetallvarstaxonomies = true;
			}
			if(isset($custitem['type']) && ($custitem['type'] === 'attribute'))
			{
//				if(isset($custitem['array']) && is_array($custitem['array']))
				{
					$hasattribute = true;
				}
			}
		}
		if(count($catparams) > 0 || count($attrparams) > 0 || count($tagsparams) > 0 || $hascustomtax || $hasattribute)
		{
			if(is_array($curr_settings))
			{
				if(isset($curr_settings['incchildren']))
				{
					if($curr_settings['incchildren'] == 1)
						self::HandleCatParams($catparams);
					self::WriteDebugInfo("incchildren",$curr_settings,array($curr_settings['incchildren']));
				}
			}
			//$catsquery = "INNER JOIN {$term} rel ON {$posts}.ID=rel.object_id AND rel.term_taxonomy_id IN (";
			
			$bfirst = true;
			$catcounter = 0;
		if(!in_array('none',$catparams))
		{
			if($categoryor)
			{
				foreach($catparams as $catparam)
				{
					$catcounter++;
					$catsquery.= " INNER JOIN {$term} rel{$catcounter} ON {$posts}.ID=rel{$catcounter}.object_id AND rel{$catcounter}.term_taxonomy_id IN (".$catparam.")";
				}
				foreach($tagsparams as $tagparam)
				{
					$catcounter++;
					$catsquery.= " INNER JOIN {$term} rel{$catcounter} ON {$posts}.ID=rel{$catcounter}.object_id AND rel{$catcounter}.term_taxonomy_id IN (".$tagparam.")";
				}
				foreach($custsearchparam as $custitem)
				{
					if(isset($custitem['id']) && $custitem['id'] === 'post_author')
						continue;
					if(isset($custitem['type']) && ($custitem['type'] === 'custom' || $custitem['type'] === 'customh'))
					{
						
						if(isset($custitem['array']) && is_array($custitem['array']))
						{
							if(in_array('none',$custitem['array'] ))
							   continue;
							foreach($custitem['array'] as $custarritem)
							{
								$catcounter++;
								$catsquery.= " INNER JOIN {$term} rel{$catcounter} ON {$posts}.ID=rel{$catcounter}.object_id AND rel{$catcounter}.term_taxonomy_id IN (".$custarritem.")";
							}
						}
					}
					if(isset($custitem['type']) && ($custitem['type'] === 'attribute'))
					{
						$catcounter++;
						$catsquery.= " INNER JOIN {$term} rel{$catcounter} ON {$posts}.ID=rel{$catcounter}.object_id AND rel{$catcounter}.term_taxonomy_id IN (".$custitem['title']['id'].")";
					}
				}
			}else
			{
				$taxids = "";
				foreach($catparams as $catparam)
				{
					if($taxids === "")
					{
						$taxids = $catparam;
					}else
					{
						$taxids.= ','.$catparam;
					}
				}
				foreach($tagsparams as $tagparam)
				{
					if($taxids === "")
					{
						$taxids = $tagparam;
					}else
					{
						$taxids.= ','.$tagparam;
					}
				}
				foreach($custsearchparam as $custitem)
				{
					if(isset($custitem['id']) && $custitem['id'] === 'post_author')
						continue;
					if(isset($custitem['type']) && ($custitem['type'] === 'custom' || $custitem['type'] === 'customh'))
					{
						if(isset($custitem['array']) && is_array($custitem['array']))
						{
							if(in_array('none',$custitem['array'] ))
							  	continue;
							foreach($custitem['array'] as $custarritem)
							{
								if($taxids === "")
								{
									$taxids = $custarritem;
								}else
								{
									$taxids.= ','.$custarritem;
								}
							}
						}
					}
					if(isset($custitem['type']) && ($custitem['type'] === 'attribute'))
					{
						if($taxids === "")
						{
							$taxids = $custitem['title']['id'];
						}else
						{
							$taxids.= ','.$custitem['title']['id'];
						}
					}
				}
				if($taxids !== "")
					$catsquery= " INNER JOIN {$term} rel ON {$posts}.ID=rel.object_id AND rel.term_taxonomy_id IN (".$taxids.") ";
			}
			
		}else // end if not uncategorized
		{
			foreach($catparams as $catparam)
			{
				if($catparam === "none") continue;
				if($wherenotin === "")
				{
					$wherenotin = $catparam;
				}else
				{
					$wherenotin.= ','. $catparam;
				}
			}
			$hascatnone = true;
		}
		//shipping none
		foreach($custsearchparam as $custitem)
		{
			if(isset($custitem['id']) && $custitem['id'] === 'post_author')
				continue;
			if(isset($custitem['type']) && ($custitem['type'] === 'custom' || $custitem['type'] === 'customh'))
			{
				if(isset($custitem['array']) && is_array($custitem['array']))
				{
					if(in_array('none',$custitem['array'] ))
					{
						foreach($custitem['array'] as $custarritem)
						{
							if($custarritem === "none") continue;
							if($wherenotin === "")
							{
								$wherenotin = $custarritem;
							}else
							{
								$wherenotin.= ','. $custarritem;
							}
						}
					}
				}
			}
		}
			

		}
		if($wherenotin !== "")
		{
			$wherenotin = " AND {$posts}.ID NOT IN (SELECT {$term}.object_id FROM {$term} WHERE {$term}.term_taxonomy_id IN (".$wherenotin."))";
		}
		

		$arrsearchtitle = array();
		$dateparam = "";
		foreach($custsearchparam as $custitem)
		{
			if(isset($custitem['type']) && $custitem['type'] === 'date' && isset($custitem['value']) && isset($custitem['title']))
			{
				if($custitem['value'] === 'between' && !isset($custitem['title1']))
					break;
				if($custitem['value'] === 'more')
				{
					$dateparam = " AND {$posts}.post_date >= '".$custitem['title']."' ";
				}
				if($custitem['value'] === 'less')
				{
					$dateparam = " AND {$posts}.post_date <= '".$custitem['title']."' ";
				}
				if($custitem['value'] === 'between')
				{
					$dateparam = " AND ({$posts}.post_date >= '".$custitem['title']."' AND {$posts}.post_date <= '".$custitem['title1']."') ";
				}
				break;
			}
		}
		if($titleparam != NULL && $titleparam !== "")
		{
			$multiaction = "AND";
			if($reserved !== NULL)
			{
				foreach($reserved as $reserveitem)
				{
					if(isset($reserveitem['action']) && $reserveitem['action'] === 'OR' &&  $reserveitem['id'] === 'post_title')
					{
						$multiaction = "OR";
						break;
					}
				}
			}
			switch($titleparam['value']){
				case "con":
				{
					$searchstring = $titleparam['title'];
						$searchstring = trim($searchstring);
					if($searchstring == "") break;
					$arrstrings = explode(' ',$searchstring);
					
					if(count($arrstrings) > 1)
					{
						$titlelike = " AND (";
						$counter = 0;
						foreach($arrstrings as $arrstring)
						{
							$arrstring = trim($arrstring);
							if($arrstring == "") continue;
							if($titlelike == " AND (")
							{
								$titlelike.= "{$posts}.post_title LIKE '%%%s%%'";
							}
							else
							{
								$titlelike.= " {$multiaction} {$posts}.post_title LIKE '%%%s%%'";
							}
							$arrsearchtitle[] = $arrstring;
						}
						$titlelike.= ")";
						$counter++;
					}else
					{
						$titlelike = " AND {$posts}.post_title LIKE '%".$searchstring."%' ";
//						$arrsearchtitle[] = $searchstring;
					}
						
				}
				break;
				case "isexactly":
				{
					$titlelike = " AND {$posts}.post_title = '".$titleparam['title']."' ";
				}
				break;
				case "notcon":
				{
					$searchstring = $titleparam['title'];
						$searchstring = trim($searchstring);
					if($searchstring == "") break;
					$arrstrings = explode(' ',$searchstring);
					
					if(count($arrstrings) > 1)
					{
						$titlelike = " AND NOT (";
						$counter = 0;
						foreach($arrstrings as $arrstring)
						{
							$arrstring = trim($arrstring);
							if($arrstring == "") continue;
							if($titlelike == " AND NOT (")
							{
								$titlelike.= "{$posts}.post_title LIKE '%%%s%%'";
							}
							else
							{
								$titlelike.= " {$multiaction} {$posts}.post_title LIKE '%%%s%%'";
							}
							$arrsearchtitle[] = $arrstring;
						}
						$titlelike.= ")";
						$counter++;
					}else
					{
						$titlelike = " AND {$posts}.post_title NOT LIKE '%".$searchstring."%' ";
//						$arrsearchtitle[] = $searchstring;
					}
//					$titlelike = " AND {$posts}.post_title NOT LIKE '%".$titleparam['title']."%' ";
				}
				break;
				case "start":
				{
					$titlelike = " AND {$posts}.post_title LIKE '".$titleparam['title']."%' ";
				}
				break;
				case "end":
				{
					$titlelike = " AND {$posts}.post_title LIKE '%".$titleparam['title']."' ";
				}
				break;
				default:
					break;
			}
		}

		$desclike = "";
		if($descparam != NULL && $descparam !== "")
		{
			$multiaction = "AND";
			if($reserved !== NULL)
			{
				foreach($reserved as $reserveitem)
				{
					if(isset($reserveitem['action']) && $reserveitem['action'] === 'OR' &&  $reserveitem['id'] === 'post_content')
					{
						$multiaction = "OR";
						break;
					}
				}
			}
			switch($descparam['value']){
				case "con":
				{
					$searchstring = $descparam['title'];
					$searchstring = trim($searchstring);
					if($searchstring == "") break;
					$arrstrings = explode(' ',$searchstring);
					
					if(count($arrstrings) > 1)
					{
						$desclike = " AND (";
						$counter = 0;
						foreach($arrstrings as $arrstring)
						{
							$arrstring = trim($arrstring);
							if($arrstring == "") continue;
							if($desclike == " AND (")
							{
								$desclike.= "{$posts}.post_content LIKE '%%%s%%'";
							}
							else
							{
								$desclike.= " {$multiaction} {$posts}.post_content LIKE '%%%s%%'";
							}
							$arrsearchtitle[] = $arrstring;
						}
						$desclike.= ")";
						$counter++;
					}else
					{
						$desclike = " AND {$posts}.post_content LIKE '%".$searchstring."%' ";
//						$arrsearchtitle[] = $searchstring;
					}
						
				}
				break;
				case "notcon":
				{
					$searchstring = $descparam['title'];
					$searchstring = trim($searchstring);
					if($searchstring == "") break;
					$arrstrings = explode(' ',$searchstring);
					
					if(count($arrstrings) > 1)
					{
						$desclike = " AND NOT (";
						$counter = 0;
						foreach($arrstrings as $arrstring)
						{
							$arrstring = trim($arrstring);
							if($arrstring == "") continue;
							if($desclike == " AND NOT (")
							{
								$desclike.= "{$posts}.post_content LIKE '%%%s%%'";
							}
							else
							{
								$desclike.= " {$multiaction} {$posts}.post_content LIKE '%%%s%%'";
							}
							$arrsearchtitle[] = $arrstring;
						}
						$desclike.= ")";
						$counter++;
					}else
					{
						$desclike = " AND {$posts}.post_content NOT LIKE '%".$searchstring."%' ";
//						$arrsearchtitle[] = $searchstring;
					}
//					$desclike = " AND {$posts}.post_content NOT LIKE '%".$descparam['title']."%' ";
				}
				break;
				case "start":
				{
					$desclike = " AND {$posts}.post_content LIKE '".$descparam['title']."%' ";
				}
				break;
				case "end":
				{
					$desclike = " AND {$posts}.post_content LIKE '%".$descparam['title']."' ";
				}
				break;
				default:
					break;
			}
		}

		$shortdesclike = "";
		if($shortdescparam != NULL && $shortdescparam !== "")
		{
			$multiaction = "AND";
			if($reserved !== NULL)
			{
				foreach($reserved as $reserveitem)
				{
					if(isset($reserveitem['action']) && $reserveitem['action'] === 'OR' &&  $reserveitem['id'] === 'post_excerpt')
					{
						$multiaction = "OR";
						break;
					}
				}
			}
			switch($shortdescparam['value']){
				case "con":
				{
					$searchstring = $shortdescparam['title'];
					$searchstring = trim($searchstring);
					if($searchstring == "") break;
					$arrstrings = explode(' ',$searchstring);
					
					if(count($arrstrings) > 1)
					{
						$shortdesclike = " AND (";
						$counter = 0;
						foreach($arrstrings as $arrstring)
						{
							$arrstring = trim($arrstring);
							if($arrstring == "") continue;
							if($shortdesclike == " AND (")
							{
								$shortdesclike.= "{$posts}.post_excerpt LIKE '%%%s%%'";
							}
							else
							{
								$shortdesclike.= " {$multiaction} {$posts}.post_excerpt LIKE '%%%s%%'";
							}
							$arrsearchtitle[] = $arrstring;
						}
						$shortdesclike.= ")";
						$counter++;
					}else
					{
						$shortdesclike = " AND {$posts}.post_excerpt LIKE '%".$searchstring."%' ";
//						$arrsearchtitle[] = $searchstring;
					}
						
				}
				break;
				case "notcon":
				{
					$searchstring = $shortdescparam['title'];
					$searchstring = trim($searchstring);
					if($searchstring == "") break;
					$arrstrings = explode(' ',$searchstring);
					
					if(count($arrstrings) > 1)
					{
						$shortdesclike = " AND NOT (";
						$counter = 0;
						foreach($arrstrings as $arrstring)
						{
							$arrstring = trim($arrstring);
							if($arrstring == "") continue;
							if($shortdesclike == " AND NOT (")
							{
								$shortdesclike.= "{$posts}.post_excerpt LIKE '%%%s%%'";
							}
							else
							{
								$shortdesclike.= " {$multiaction} {$posts}.post_excerpt LIKE '%%%s%%'";
							}
							$arrsearchtitle[] = $arrstring;
						}
						$shortdesclike.= ")";
						$counter++;
					}else
					{
						$shortdesclike = " AND {$posts}.post_excerpt NOT LIKE '%".$searchstring."%' ";
//						$arrsearchtitle[] = $searchstring;
					}
//					$shortdesclike = " AND {$posts}.post_excerpt NOT LIKE '%".$shortdescparam['title']."%' ";
				}
				break;
				case "start":
				{
					$shortdesclike = " AND {$posts}.post_excerpt LIKE '".$shortdescparam['title']."%' ";
				}
				break;
				case "end":
				{
					$shortdesclike = " AND {$posts}.post_excerpt LIKE '%".$shortdescparam['title']."' ";
				}
				break;
				default:
					break;
			}
		}
		
		$skuquery = "";
		$innercounter = 5;
		$ismultiple = false;

		$posttypesearch = "'draft','publish','private','pending','inherit'";
		//if (file_exists( __DIR__.'/integrations/post-status-unreliable.php')) {
		if (defined('W3EXWABE_INTG_POST_STATUS_UNRELIABLE')) {
			//require_once (__DIR__.'/integrations/post-status-unreliable.php');
			$posttypesearch = W3ExABulkEdit_PostStatusUnreliable_Integration::addStatusUnreliableToPostTypeSearch($posttypesearch);
		}
		$custommetasearch = "";
		{
			
			foreach($custsearchparam as $custitem)
			{
				$innercounter++;
				if(isset($custitem['id']) && $custitem['id'] === 'post_author')
				{
					$shortdesclike = " AND {$posts}.post_author IN (".$custitem['array'][0].") ";
					continue;
				}
				if(isset($custitem['type']) && ($custitem['type'] !== 'custom' && $custitem['type'] !== 'customh' && $custitem['type'] !== 'attribute'))
				{
					if($custitem['type'] === "date")
						continue;
						
					if($custitem['id'] == "ID" || $custitem['id'] == "_stock" || $custitem['id'] == "_stock_status" || $custitem['id'] == "post_status"|| $custitem['id'] == "post_author")
					{
						if($custitem['id'] == "_stock")
						{
							if(!is_numeric($custitem['title']))
								continue;
						}
						if($custitem['id'] == "post_status")
						{
							$posttypesearch = "'" . $custitem['value'] . "'";
							continue;
						}
						if($custitem['id'] == "ID")
						{
							$shortdesclike = " AND {$posts}.ID IN (".$custitem['value'].") ";
							continue;
						}
						
				
						$custommetasearch.= " INNER JOIN {$meta} meta{$innercounter} ON {$posts}.ID=meta{$innercounter}.post_id
							AND CASE WHEN meta{$innercounter}.meta_key='{$custitem['id']}' THEN meta{$innercounter}.meta_value";
						if($custitem['id'] == "_stock")
						{
							if($custitem['value'] == 'more')
							{
								$custommetasearch.= ' > ';
							}else if($custitem['value'] == 'less')
							{
								$custommetasearch.= ' < ';
							}else if($custitem['value'] == 'equal')
							{
								$custommetasearch.= ' = ';
							}else if($custitem['value'] == 'moree')
							{
								$custommetasearch.= ' >= ';
							}else
							{//lesse
								$custommetasearch.= ' <= ';
							}
							$custommetasearch.= $custitem['title'].' END ';
						}else if($custitem['id'] == "_stock_status")
						{
//							$custommetasearch.= " LIKE '%".$custitem['title']."%' END ";
							if($custitem['title'] == "outofstock")
								$custommetasearch.= " LIKE 'outofstock' END ";
							else
								$custommetasearch.= " NOT LIKE 'outofstock' END ";
						}
						continue;
					}
					if(isset($custitem['title']) && isset($custitem['value']))
					{
						if( $custitem['type'] === 'integer' ||  $custitem['type'] === 'decimal' ||  $custitem['type'] === 'decimal3')
						{
							if(!is_numeric($custitem['title']))
								continue;
						}
						$custommetasearch.= " INNER JOIN {$meta} meta{$innercounter} ON {$posts}.ID=meta{$innercounter}.post_id
							AND CASE WHEN meta{$innercounter}.meta_key='{$custitem['id']}' THEN meta{$innercounter}.meta_value";
						if($custitem['type'] === 'integer' ||  $custitem['type'] === 'decimal' ||  $custitem['type'] === 'decimal3')
						{
							if($custitem['value'] == 'more')
							{
								$custommetasearch.= ' > ';
							}else if($custitem['value'] == 'less')
							{
								$custommetasearch.= ' < ';
							}else if($custitem['value'] == 'equal')
							{
								$custommetasearch.= ' = ';
							}else if($custitem['value'] == 'moree')
							{
								$custommetasearch.= ' >= ';
							}else
							{//lesse
								$custommetasearch.= ' <= ';
							}
							$custommetasearch.= $custitem['title'].' END ';
							
						}else
						{
							switch($custitem['value'])
							{
								case "con":
								{
									$custommetasearch.= " LIKE '%".$custitem['title']."%' ";
								}
								break;
								case "notcon":
								{
									$custommetasearch.= " NOT LIKE '%".$custitem['title']."%' ";
								}
								break;
								case "start":
								{
									$custommetasearch.= " LIKE '".$custitem['title']."%' ";
								}
								break;
								case "end":
								{
									$custommetasearch.= " LIKE '%".$custitem['title']."' ";
								}
								break;
								default:
									break;
							}
							$custommetasearch.= ' END ';
						}
					}
				}
				
			}
		}
		
		$LIMIT+= 1;
//		if($catsquery !== "")
//		{
//			$catsquery.= "INNER JOIN {$term} rel ON {$posts}.ID=rel.object_id{$catsquery}";
//		}
		if(!$bgettotalnumber)
			$limitquery = " LIMIT {$LIMIT}";
//			INNER JOIN {$term} rel ON {$posts}.ID=rel.object_id{$catsquery}

/////////////////////////
		//get products
///////////////////////////////////////
		if($bgettotalnumber)
		{
			$query = "INSERT INTO {$temptable} (
				SELECT 
				{$posts}.ID, 0 AS type, 0 AS post_parent,0 as useit 
				FROM {$posts}
				{$catsquery}{$pricequery}{$salequery}{$skuquery}{$custommetasearch}
				WHERE {$posts}.post_type='{$post_type}'{$titlelike}{$desclike}{$shortdesclike}{$dateparam} AND {$posts}.post_status IN ({$posttypesearch}) {$wherenotin} GROUP BY {$posts}.ID
				{$orderby})";
		}else
		{
			$query = "INSERT INTO {$temptable} (
				SELECT 
				{$posts}.ID, 0 AS type, 0 AS post_parent,0 as useit 
				FROM {$posts}
				{$catsquery}{$pricequery}{$salequery}{$skuquery}{$custommetasearch}
				WHERE {$posts}.post_type='{$post_type}'{$titlelike}{$desclike}{$shortdesclike}{$dateparam} AND {$posts}.post_status IN ({$posttypesearch}) {$wherenotin} {$idquery} GROUP BY {$posts}.ID {$orderby}{$limitquery})";
		}
		if($catsquery === '')
		{//let's get products without product_type'
			if($bgettotalnumber)
			{
				$query = "INSERT INTO {$temptable} (
					SELECT 
					{$posts}.ID, 0 AS type, 0 AS post_parent,0 as useit 
					FROM {$posts}{$pricequery}{$salequery}{$skuquery}{$custommetasearch}
					WHERE ({$posts}.post_type='{$post_type}'{$titlelike}{$desclike}{$shortdesclike}{$dateparam} {$wherenotin} AND {$posts}.post_status IN ({$posttypesearch})) {$orderby})";
			}else
			{
				$query = "INSERT INTO {$temptable} (
					SELECT 
					{$posts}.ID, 0 AS type, 0 AS post_parent,0 as useit 
					FROM {$posts}{$pricequery}{$salequery}{$skuquery}{$custommetasearch}
					WHERE ({$posts}.post_type='{$post_type}'{$titlelike}{$desclike}{$shortdesclike}{$dateparam} {$wherenotin} AND {$posts}.post_status IN ({$posttypesearch}){$idquery} ) {$orderby} {$limitquery}) ";
			}
		}
		self::WriteDebugInfo("catsquery",$curr_settings,array($catsquery));
//		$query = mysql_escape_string($query);
		if(count($arrsearchtitle) > 0)
		{
			$ret = $wpdb->query($wpdb->prepare($query,$arrsearchtitle));
		}else{
			$ret = $wpdb->query($query);
		}
		if($bdebugmode)
		{
			self::WriteDebugInfo("3 after first query ".__LINE__,$curr_settings);
		}
		
		$LIMIT-= 1;
		if ( is_wp_error($ret) ) {
			return new WP_Error( 'db_query_error', 
				__( 'Could not execute query' ), $wpdb->last_error );
		} 

		$query = "SELECT MIN(ID) as minid, MAX(ID) as maxid FROM {$temptable} LIMIT {$LIMIT}";
		$ret = $wpdb->get_results($query);
		if ( is_wp_error($ret) ) {
			return new WP_Error( 'db_query_error', 
				__( 'Could not execute query' ), $wpdb->last_error );
		} 
		$minid = $ret[0]->minid;
		$maxid = $ret[0]->maxid;
		$query = "SELECT COUNT(ID) FROM {$temptable}";
		$ret = $wpdb->get_var($query);
		if ( is_wp_error($ret) ) {
			return new WP_Error( 'db_query_error', 
				__( 'Could not execute query' ), $wpdb->last_error );
		} 
		$total = (int)$ret;
		$bdontcheckforparent = false;
		if((int)$ret > $LIMIT)
		{
			$hasnext = true;
			if($minid !== NULL && $maxid !== NULL)
			{
//				$idlimitquery = $idlimitquery = " AND p1.ID > {$minid} AND p1.ID < {$maxid}";//$p1idquery;
				if($ispagination)
				{
					if($isnext && $maxused !== "")
					{
						$idlimitquery = " AND p1.ID < {$maxused}"; //AND p1.ID < {$maxid}";//$p1idquery;
					}else
					{
						if($minused == "")
							$idlimitquery = " AND p1.ID > {$minused}";//$p1idquery;
					}
				}
				
			}
				
			if(!$bgettotalnumber)
			{
				$total = -1;
				$bdontcheckforparent = true;
			}
		}
		if(!$bgettotalnumber)
				$total = -1;
		if(!$bgettotalnumber)
		{
			$limitquery = " LIMIT {$LIMIT}";
		}else
		{
			$idlimitquery = "";
		}

		$attrsquery = "";
		
		$query ="INSERT INTO {$temptable}(
			SELECT p1.ID, 1 AS type,p1.post_parent,0 as useit 
			FROM {$posts} p1{$attrsquery}
			WHERE (p1.post_parent IN (SELECT ID FROM {$temptable}))
			AND (p1.post_type='revision'){$idlimitquery} ORDER BY p1.ID DESC {$limitquery})";
		if($bdontcheckforparent)
		{
			$query ="INSERT INTO {$temptable}(
			SELECT p1.ID, 1 AS type,p1.post_parent,0 as useit 
			FROM {$posts} p1{$attrsquery}
			WHERE (p1.post_type='revision'){$idlimitquery} ORDER BY p1.ID {$sortquery} {$limitquery})";
		}
		
	
		
		$wherenotin = "";
		$catsquery = "";
		if($bgetvariations)
		{
			foreach($custsearchparam as $custitem)
			{
				if(isset($custitem['id']) && $custitem['id'] === 'post_author')
				{
					continue;
				}
				if(isset($custitem['type']) && ($custitem['type'] === 'custom' || $custitem['type'] === 'customh'))
				{
					if(isset($custitem['array']) && is_array($custitem['array']))
					{
						if(in_array('none',$custitem['array'] ))
						{
							foreach($custitem['array'] as $custarritem)
							{
								if($custarritem === "none") continue;
								if($wherenotin === "")
								{
									$wherenotin = $custarritem;
								}else
								{
									$wherenotin.= ','. $custarritem;
								}
							}
							continue;
						}
						foreach($custitem['array'] as $custarritem)
						{
							if($catsquery === "")
							{
								$catsquery = $custarritem;
							}else
							{
								$catsquery.= ','. $custarritem;
							}
						}
					}
				}
			}
		}
		
		
		
		if($wherenotin !== "" || $catsquery !== "")
		{
			if($wherenotin !== "")
			{
				$wherenotin = " AND	p1.ID NOT IN (SELECT {$term}.object_id FROM {$term} WHERE {$term}.term_taxonomy_id IN (".$wherenotin."))";
			}
			if($catsquery !== "")
			{
				$catsquery = " AND	p1.ID IN (SELECT {$term}.object_id FROM {$term} WHERE {$term}.term_taxonomy_id IN (".$catsquery."))";//"INNER JOIN {$term} rel ON {$posts}.ID=rel.object_id AND rel.term_taxonomy_id IN (".$catsquery.")";
			}
			$query ="INSERT INTO {$temptable}(
					SELECT p1.ID, 1 AS type,p1.post_parent ,0 AS useit
					FROM {$posts} p1{$attrsquery}{$custommetasearch}
					WHERE p1.post_type='revision'{$idlimitquery}{$wherenotin}{$catsquery}  AND p1.ID NOT IN (SELECT ID FROM {$temptable}) ORDER BY p1.ID ASC {$limitquery})";
				$ret = $wpdb->query($query);
				if ( is_wp_error($ret) ) {
					return new WP_Error( 'db_query_error', 
						__( 'Could not execute query' ), $wpdb->last_error );
				} 
				if($bdebugmode)
				{
					self::WriteDebugInfo("4 after sec query 1260".__LINE__,$curr_settings);
				}
                $intg_post_status_unreliable = '';
                if (defined('W3EXWABE_INTG_POST_STATUS_UNRELIABLE')) {
                    $intg_post_status_unreliable = " ,'unreliable' ";
                }
				$query ="INSERT INTO {$temptable}(
					SELECT p1.ID, 0 AS type,0 AS post_parent, 0 AS useit
					FROM {$posts} p1
					WHERE p1.ID IN (SELECT post_parent FROM {$temptable} WHERE type=1) AND (p1.post_type='{$post_type}') AND (p1.post_status IN ('publish','draft','private','pending'{$intg_post_status_unreliable})){$idlimitquery} ORDER BY p1.ID ASC {$limitquery})";
		}
		
		if(($custommetasearch !== "" || $hasattribute) && $bgetvariations)
		{
			$innercounter = 5;
			$custommetasearch = "";
			foreach($custsearchparam as $custitem)
			{
				if(isset($custitem['type']) && ($custitem['type'] !== 'custom' && $custitem['type'] !== 'customh'))
				{
					if($custitem['type'] === "date")
						continue;
					$innercounter++;
					if($custitem['type'] === 'attribute')
					{
						if($categoryor)
						{
							$custommetasearch.= " INNER JOIN {$meta} meta{$innercounter} ON p1.ID=meta{$innercounter}.post_id
						AND CASE WHEN meta{$innercounter}.meta_key='attribute_pa_{$custitem['title']['attr']}' THEN meta{$innercounter}.meta_value='{$custitem['title']['value']}' END ";		
						}
						continue;
					}
					if(isset($custitem['title']) && isset($custitem['value']))
					{
						if($custitem['id'] == "ID" || $custitem['id'] == "_stock" || $custitem['id'] == "_stock_status")
						{
							if($custitem['id'] == "_stock")
							{
								if(!is_numeric($custitem['title']))
									continue;
							}
							if($custitem['id'] == "ID")
							{
								continue;
							}
							$custommetasearch.= " INNER JOIN {$meta} meta{$innercounter} ON p1.ID=meta{$innercounter}.post_id
							AND CASE WHEN meta{$innercounter}.meta_key='{$custitem['id']}' THEN meta{$innercounter}.meta_value";
							if($custitem['id'] == "_stock")
							{
								if($custitem['value'] == 'more')
								{
									$custommetasearch.= ' > ';
								}else if($custitem['value'] == 'less')
								{
									$custommetasearch.= ' < ';
								}else if($custitem['value'] == 'equal')
								{
									$custommetasearch.= ' = ';
								}else if($custitem['value'] == 'moree')
								{
									$custommetasearch.= ' >= ';
								}else
								{//lesse
									$custommetasearch.= ' <= ';
								}
								$custommetasearch.= $custitem['title'].' END ';
							}else
							{
								if($custitem['title'] == "outofstock")
									$custommetasearch.= " LIKE 'outofstock' END ";
								else
									$custommetasearch.= " NOT LIKE 'outofstock' END ";
							}
//							$innercounter++;
							continue;
						}
						if( $custitem['type'] === 'integer' ||  $custitem['type'] === 'decimal' ||  $custitem['type'] === 'decimal3')
						{
							if(!is_numeric($custitem['title']))
								continue;
						}
						$custommetasearch.= " INNER JOIN {$meta} meta{$innercounter} ON p1.ID=meta{$innercounter}.post_id
							AND CASE WHEN meta{$innercounter}.meta_key='{$custitem['id']}' THEN meta{$innercounter}.meta_value";
						if($custitem['type'] === 'integer' ||  $custitem['type'] === 'decimal' ||  $custitem['type'] === 'decimal3')
						{
							if($custitem['value'] == 'more')
							{
								$custommetasearch.= ' > ';
							}else if($custitem['value'] == 'less')
							{
								$custommetasearch.= ' < ';
							}else if($custitem['value'] == 'equal')
							{
								$custommetasearch.= ' = ';
							}else if($custitem['value'] == 'moree')
							{
								$custommetasearch.= ' >= ';
							}else
							{//lesse
								$custommetasearch.= ' <= ';
							}
							$custommetasearch.= $custitem['title'].' END ';
							
						}else
						{
							switch($custitem['value']){
								case "con":
								{
									$custommetasearch.= " LIKE '%".$custitem['title']."%' ";
								}
								break;
								case "notcon":
								{
									$custommetasearch.= " NOT LIKE '%".$custitem['title']."%' ";
								}
								break;
								case "start":
								{
									$custommetasearch.= " LIKE '".$custitem['title']."%' ";
								}
								break;
								case "end":
								{
									$custommetasearch.= " LIKE '%".$custitem['title']."' ";
								}
								break;
								default:
									break;
							}
							$custommetasearch.= ' END ';
						}
//						$innercounter++;
					}
					
				}
			}
			$skipquery = false;
			if(!$categoryor && $hasattribute && $bgetvariations)	
			{
				$attrsquery = " INNER JOIN {$meta} ON p1.ID={$meta}.post_id AND ";
				$bfirst = true;
				foreach($custsearchparam as $custitem)
				{
					if(isset($custitem['type']) && $custitem['type'] === 'attribute')
					{
						if($bfirst)
						{
//							$bfirst = false;
//							AND CASE WHEN meta{$innercounter}.meta_key='{$custitem['id']}' THEN meta{$innercounter}.meta_value
							$attrsquery = " INNER JOIN {$meta} ON p1.ID={$meta}.post_id AND ";
							$attrsquery.= "({$meta}.meta_key='attribute_pa_".sanitize_title($custitem['title']['attr'])."' AND {$meta}.meta_value='".$custitem['title']['value']."')";
//							$attrsquery.= "( CASE WHEN {$meta}.meta_key='attribute_pa_".$custitem['title']['attr']."' THEN {$meta}.meta_value='".$custitem['title']['value']."' ";
						}else
						{
							$attrsquery.= " OR ({$meta}.meta_key='attribute_pa_".sanitize_title($custitem['title']['attr'])."' AND {$meta}.meta_value='".$custitem['title']['value']."')";
//							$attrsquery.= " WHEN {$meta}.meta_key='attribute_pa_".$custitem['title']['attr']."' THEN {$meta}.meta_value='".$custitem['title']['value']."' ";
						}
						{
							$skipquery = true;
							$notin = "NOT";
							$id = "p1.ID";
							if($skuquery !== "" || $titlelike !== "" || $desclike !== "" || $shortdesclike !== "")
							{
								$notin = "";
								$id = "p1.post_parent";
							}
							$query ="INSERT INTO {$temptable}(
							SELECT p1.ID, 1 AS type,p1.post_parent,0 AS useit
							FROM {$posts} p1{$attrsquery}{$custommetasearch}
							WHERE (p1.post_type='revision'){$idlimitquery}  AND {$id} {$notin} IN (SELECT ID FROM {$temptable}) ORDER BY p1.ID ASC {$limitquery})";
							$ret = $wpdb->query($query);
							if ( is_wp_error($ret) ) {
								return new WP_Error( 'db_query_error', 
									__( 'Could not execute query' ), $wpdb->last_error );
							} 
							if($bdebugmode)
							{
								self::WriteDebugInfo("7 after attr query ".__LINE__,$curr_settings);
							}
                            $intg_post_status_unreliable = '';
                            if (defined('W3EXWABE_INTG_POST_STATUS_UNRELIABLE')) {
                                $intg_post_status_unreliable = " ,'unreliable' ";
                            }
                            $query ="INSERT INTO {$temptable}(
								SELECT p1.ID, 0 AS type,0 AS post_parent, 0 AS useit
								FROM {$posts} p1
								WHERE p1.ID IN (SELECT post_parent FROM {$temptable} WHERE type=1) AND (p1.post_type='{$post_type}') AND (p1.post_status IN ('publish','draft','private','pending'{$intg_post_status_unreliable})){$idlimitquery} ORDER BY p1.ID ASC {$limitquery})";
						}
					}
				}
				$attrsquery.= ")";
//				$attrsquery = "";
			}	
			
			if($attrsquery != "")
			{
				if(!$skipquery)
				{
					$notin = "NOT";
					$id = "p1.ID";
					if($skuquery !== "" || $titlelike !== "" || $desclike !== "" || $shortdesclike !== "")
					{
//						$notin = "";
//						$id = "p1.post_parent";
					}
					$query ="INSERT INTO {$temptable}(
					SELECT p1.ID, 1 AS type,p1.post_parent,0 AS useit
					FROM {$posts} p1{$attrsquery}{$custommetasearch}
					WHERE (p1.post_type='revision'){$idlimitquery}  AND {$id} {$notin} IN (SELECT ID FROM {$temptable}) ORDER BY p1.ID ASC {$limitquery})";
					$ret = $wpdb->query($query);
					if ( is_wp_error($ret) ) {
						return new WP_Error( 'db_query_error', 
							__( 'Could not execute query' ), $wpdb->last_error );
					} 
					if($bdebugmode)
					{
						self::WriteDebugInfo("7 after attr query ".__LINE__,$curr_settings);
					}
                    $intg_post_status_unreliable = '';
                    if (defined('W3EXWABE_INTG_POST_STATUS_UNRELIABLE')) {
                        $intg_post_status_unreliable = " ,'unreliable' ";
                    }
                    $query ="INSERT INTO {$temptable}(
						SELECT p1.ID, 0 AS type,0 AS post_parent, 0 AS useit
						FROM {$posts} p1
						WHERE p1.ID IN (SELECT post_parent FROM {$temptable} WHERE type=1) AND (p1.post_type='{$post_type}') AND (p1.post_status IN ('publish','draft','private','pending'{$intg_post_status_unreliable})){$idlimitquery} ORDER BY p1.ID ASC {$limitquery})";
				}
			}else
			{
				$notin = "NOT";
				$id = "p1.ID";
				if($categoryor && (count($catparams) > 0  || count($tagsparams) > 0 || $hascustomtax))
				{
					$notin = "";
					$id = "p1.post_parent";
				}
				if($skuquery !== "" || $titlelike !== "" || $desclike !== "" || $shortdesclike !== "")
				{
//					$notin = "";
//					$id = "p1.post_parent";
				}
				$query ="INSERT INTO {$temptable}(
					SELECT p1.ID, 1 AS type,p1.post_parent ,0 AS useit
					FROM {$posts} p1{$attrsquery}{$custommetasearch}
					WHERE p1.post_type='revision'{$idlimitquery}  AND {$id} {$notin} IN (SELECT ID FROM {$temptable}) ORDER BY p1.ID ASC {$limitquery})";
				$ret = $wpdb->query($query);
				if($bdebugmode)
				{
					self::WriteDebugInfo("8 after attr query ".__LINE__,$curr_settings);
				}
				if ( is_wp_error($ret) ) {
					return new WP_Error( 'db_query_error', 
						__( 'Could not execute query' ), $wpdb->last_error );
				}
                $intg_post_status_unreliable = '';
                if (defined('W3EXWABE_INTG_POST_STATUS_UNRELIABLE')) {
                    $intg_post_status_unreliable = " ,'unreliable' ";
                }
                $query ="INSERT INTO {$temptable}(
					SELECT p1.ID, 0 AS type,0 AS post_parent, 0 AS useit
					FROM {$posts} p1
					WHERE p1.ID IN (SELECT post_parent FROM {$temptable} WHERE type=1) AND (p1.post_type='{$post_type}') AND (p1.post_status IN ('publish','draft','private','pending'{$intg_post_status_unreliable})){$idlimitquery} ORDER BY p1.ID ASC {$limitquery})";
				
			}
		}
		
		if($bgetvariations)
		{
			$ret = $wpdb->query($query);
			if($bdebugmode)
			{
				self::WriteDebugInfo("9 after attr query ".__LINE__,$curr_settings);
			}
			if ( is_wp_error($ret) ) {
					return new WP_Error( 'db_query_error', 
						__( 'Could not execute query' ), $wpdb->last_error );
				} 
			if(($bgetallvars && $hasattribute) || ($bgetallvarstaxonomies && $hascustomtax))// || $skuquery !== "")
			{
				$query ="INSERT INTO {$temptable}(
				SELECT p1.ID, 1 AS type,p1.post_parent,0 as useit 
				FROM {$posts} p1
				WHERE (p1.post_parent IN (SELECT ID FROM {$temptable})) AND p1.ID NOT IN (SELECT ID FROM {$temptable})
				AND (p1.post_type='revision'){$idlimitquery} ORDER BY p1.ID DESC {$limitquery})";
				$ret = $wpdb->query($query);
				if ( is_wp_error($ret) ) {
						return new WP_Error( 'db_query_error', 
							__( 'Could not execute query' ), $wpdb->last_error );
					} 
				if($bdebugmode)
				{
					self::WriteDebugInfo("10 after query ".__LINE__,$curr_settings);
				}
			}
		}
		
		
		//////////////////////////////////////////////////
		//end search qieries//////////////////////////////
		//////////////////////////////////////////////////
		
		if($bgettotalnumber)
		{
			$query ="SELECT count(DISTINCT ID) 
					FROM {$temptable}";
			$total = $wpdb->get_var($query);
			if($total == NULL) $total = -1;
		}
		
		$useit = "";
		$query ="UPDATE {$temptable} SET useit=1 ORDER BY ID DESC LIMIT {$LIMIT}";
		if($ispagination)
		{
			$query ="UPDATE {$temptable} SET useit=1 WHERE 1{$idquery} ORDER BY ID{$sortquery} LIMIT {$LIMIT}";
		}
		$ret = $wpdb->query($query);
		if ( is_wp_error($ret) ) {
			return new WP_Error( 'db_query_error', 
				__( 'Could not execute query' ), $wpdb->last_error );
		}
		if($bdebugmode)
		{
			self::WriteDebugInfo("11 after query ".__LINE__,$curr_settings);
		}
		$useit =  " WHERE {$temptable}.useit=1"; 
//		if($total < $LIMIT)
		{//check and added variations
		
			$query ="SELECT MIN(ID) as maxid FROM {$temptable}";
			if($ispagination)
			{
				if(!$isnext)
					$query ="SELECT MAX(ID) as maxid FROM {$temptable}";
			}
		
			$ret = $wpdb->get_var($query);
			if ( is_wp_error($ret) ) {
				return new WP_Error( 'db_query_error', 
					__( 'Could not execute query' ), $wpdb->last_error );
			} 
			if($ret === NULL)
			{
				$hasnext = false;
				return;
			}
			$query ="SELECT useit FROM {$temptable} WHERE ID={$ret}";
			$ret = $wpdb->get_var($query);
			if($ret == 0)
			{
				$hasnext = true;
			}
			else
			{
				$hasnext = false;
			}
		}

				
		$ret = $wpdb->query($query);
		if ( is_wp_error($ret) ) {
				return new WP_Error( 'db_query_error', 
					__( 'Could not execute query' ), $wpdb->last_error );
			} 
		if($bdebugmode)
		{
			self::WriteDebugInfo("12 after query ".__LINE__,$curr_settings);
		}
		$sqlfields = self::PrepareQuery('wp_posts');
		if($sqlfields !== "")
			$sqlfields.= ",";
		$query = "SELECT CASE WHEN p1.post_parent = 0 THEN p1.ID ELSE p1.post_parent END AS Sort,
			{$sqlfields}p1.ID,p1.post_parent,post_type
			FROM {$posts} p1
			WHERE p1.ID IN (SELECT ID FROM {$temptable}{$useit})
			ORDER BY Sort DESC LIMIT {$LIMIT}";
		$info = $wpdb->get_results($query);
}
		
			self::WriteDebugInfo("12 after 1 get_results ".__LINE__,$curr_settings);
		
		if($arrduplicate !== null)
		{
			$info = $arrduplicate;
		}
		
		$infodel = array();
		if(isset($_POST['_iswpmlenabled']))
		{
//			 if(ICL_LANGUAGE_CODE !== 'all')
			 {
				for($i = 0; $i < count($info); ++$i) 
				{
					if($info[$i]->post_type !== 'revision')
					{
						$idret = self::lang_object_id((int)$info[$i]->ID,$info[$i]->post_type);
						if($idret === null || $idret != ((int)$info[$i]->ID))
						{
							$infodel[] = $info[$i]->ID;
							array_splice($info,$i,1);
							if(count($info) > 0 || $i !== 0)
								$i--;
						}
					}
				}
				for($i = 0; $i < count($info); ++$i) 
				{
					if($info[$i]->post_type === 'revision')
					{
						if(in_array($info[$i]->post_parent,$infodel))
						{
							array_splice($info,$i,1);
							if(count($info) > 0 || $i !== 0)
								$i--;
						}
					}
				}
			}
		}
		$ids = array();
		
		for($i = 0; $i < count($info); ++$i) 
		{
			$ids[$info[$i]->ID] =&$info[$i];
		}

			self::WriteDebugInfo("12.1 after array map ".__LINE__,$curr_settings);
		$blogusers = array();
		if(in_array('post_author',self::$columns) || empty(self::$columns))
		{
			$blogusers = get_users( array( 'role' => 'editor', 'fields' => array( 'ID', 'display_name' ) ));
			$blogusers1 = get_users( array( 'role' => 'administrator', 'fields' => array( 'ID', 'display_name' ) ));
			$blogusers = array_merge($blogusers,$blogusers1);
			$blogusers1 = get_users( array( 'role' => 'author', 'fields' => array( 'ID', 'display_name' ) ));
			$blogusers = array_merge($blogusers,$blogusers1);
		}
		foreach($ids as &$id)
		{
			if($id->post_parent != 0 && $id->post_type == 'revision')
			{
				if(property_exists($id,'post_title'))
				{
					$id->post_title = ' [#'.$id->post_parent.' revision]';
					if(array_key_exists($id->post_parent,$ids))
					{
						$obj = $ids[$id->post_parent];
						$obj->haschildren = true;
						$partitle = $obj->post_title;
						if(function_exists('mb_strlen') && function_exists('mb_substr'))
						{
							if(mb_strlen($partitle) > 15)
							{
								$partitle = mb_substr($partitle,0,15) . '...';
							}
						}else
						{
							if(strlen($partitle) > 15)
							{
								$partitle = substr($partitle,0,15) . '...';
							}
							
						}
						$partitle = str_replace("<", "&lt;", $partitle);
						$id->post_title = $partitle.' [#'.$id->post_parent.' revision]';
	//					$var = new WC_Product_Variation($id->ID);
	//					$id->post_title = $var->get_formatted_name().' (Var. of #'.$id->post_parent.')';
					}
				}
				$id->comment_status = 'no';
				$id->post_name = '';
				$id->post_date = '';
			}else
			{
				if(property_exists($id,'comment_status'))
				{
					if($id->comment_status === 'open')
						$id->comment_status = 'yes';
					else
						$id->comment_status = 'no';
				}
				if(in_array('_post_permalink',self::$columns))
				{
					$id->_post_permalink = '';
					$permalink = get_permalink($id->ID);
					if(false !== $permalink)
					{
						$id->_post_permalink = $permalink;
					}
				}
				if(property_exists($id,'post_name'))
				{
					$id->post_name = urldecode($id->post_name);
				}
			}
//			if(property_exists($id,'post_title'))
//			{
//				$id->post_title = str_replace("<", "&lt;", $id->post_title);
//				$id->post_excerpt = str_replace(chr(194),"", $id->post_excerpt);
//				$id->post_excerpt = str_replace(chr(160)," ", $id->post_excerpt);
//			}
			if(property_exists($id,'post_author'))
			{
				if($id->post_type === 'revision')
				{
					$id->post_author = '';
				}else
				{
					foreach ( $blogusers as $user ) 
					{
						if($id->post_author === (string)$user->ID)
						{
							$id->post_author_ids = (string)$user->ID;
							$id->post_author = $user->display_name;
							break;
						}
					}
				}
				
			}
			if(property_exists($id,'post_excerpt'))
			{
				$id->post_excerpt = str_replace("\r\n", "\n", $id->post_excerpt);
//				$id->post_excerpt = str_replace(chr(194),"", $id->post_excerpt);
//				$id->post_excerpt = str_replace(chr(160)," ", $id->post_excerpt);
			}
			if(property_exists($id,'post_content'))
			{
				$id->post_content = str_replace("\r\n", "\n", $id->post_content);
//				$id->post_content = str_replace(chr(194),"", $id->post_content);
//				$id->post_content = str_replace(chr(160)," ", $id->post_content);
			}
		}
		
			self::WriteDebugInfo("12.2 after array loop ".__LINE__,$curr_settings);

		$customfields = "";
		if($customparam !== NULL)
		{
			foreach($customparam as $value)
			{
				$customfields.= ",'" . esc_attr($value) . "'";
			}
			
		}
		$metavals = array();
		
		
			self::WriteDebugInfo("12.3 after customfields loop ".__LINE__,$curr_settings);
	$duplicateids = "";
	if($arrduplicate !== null)
	{
		foreach($arrduplicate as $key => $value)
		{
			if($duplicateids == "")
				$duplicateids.= $value->ID;
			else
				$duplicateids.= ",".$value->ID;
		}	
	}
	
	$converttoutf8 = true;
	
	if(!function_exists('mb_convert_encoding'))
	{
		$converttoutf8 = false;
	}
		
		
	$sqlfields = self::PrepareQuery('wp_meta1');
	if($sqlfields !== "")
	{
		if($arrduplicate === null)
		{
			$query ="SELECT p1.ID, p1.post_title,p1.post_parent, {$meta}.meta_key, {$meta}.meta_value
				FROM {$posts} p1
				INNER JOIN {$meta} ON p1.ID={$meta}.post_id 
				AND ({$meta}.meta_key IN ({$sqlfields})) WHERE p1.ID IN (SELECT ID FROM {$temptable}{$useit})";
			$metavals =  $wpdb->get_results($query);
			if ( is_wp_error($metavals) ) {
				return new WP_Error( 'db_query_error', 
					__( 'Could not execute query' ), $wpdb->last_error );
			} 
			
			
				self::WriteDebugInfo("13.1 after meta get_results ".__LINE__,$curr_settings);
			
		}else
		{
			$query ="SELECT p1.ID, p1.post_title,p1.post_parent, {$meta}.meta_key, {$meta}.meta_value
				FROM {$posts} p1
				INNER JOIN {$meta} ON p1.ID={$meta}.post_id 
				AND ({$meta}.meta_key IN ({$sqlfields}))	WHERE p1.ID IN ({$duplicateids})";
			$metavals =  $wpdb->get_results($query);
			
				self::WriteDebugInfo("14.1 after meta2 get_results ".__LINE__,$curr_settings);

			if ( is_wp_error($metavals) ) {
				return new WP_Error( 'db_query_error', 
					__( 'Could not execute query' ), $wpdb->last_error );
					
			} 
		}
		self::LoopMetaData($metavals,$ids,$tax_classes,$converttoutf8);
	}
			
	
	
	$sqlfields = self::PrepareQuery('wp_meta3',$arrcurrentpostype);
	if($sqlfields !== "")
	{
		if($arrduplicate === null)
		{
			$query ="SELECT p1.ID, p1.post_title,p1.post_parent, {$meta}.meta_key, {$meta}.meta_value
				FROM {$posts} p1
				INNER JOIN {$meta} ON p1.ID={$meta}.post_id 
				AND ({$meta}.meta_key IN ({$sqlfields})) WHERE p1.ID IN (SELECT ID FROM {$temptable}{$useit})";
			$metavals =  $wpdb->get_results($query);
			if ( is_wp_error($metavals) ) {
				return new WP_Error( 'db_query_error', 
					__( 'Could not execute query' ), $wpdb->last_error );
			} 
			
				self::WriteDebugInfo("13.2 after meta get_results ".__LINE__,$curr_settings);
			
		}else
																{
			$query ="SELECT p1.ID, p1.post_title,p1.post_parent, {$meta}.meta_key, {$meta}.meta_value
				FROM {$posts} p1
				INNER JOIN {$meta} ON p1.ID={$meta}.post_id 
				AND ({$meta}.meta_key IN ({$sqlfields}))	WHERE p1.ID IN ({$duplicateids})";
			$metavals =  $wpdb->get_results($query);
			
				self::WriteDebugInfo("14.2 after meta2 get_results ".__LINE__,$curr_settings);

			if ( is_wp_error($metavals) ) {
				return new WP_Error( 'db_query_error', 
					__( 'Could not execute query' ), $wpdb->last_error );
				
		} 
	}
		
		self::LoopMetaData($metavals,$ids,$tax_classes,$converttoutf8);
	}
//second query to reduce ram usage
	$sqlfields = self::PrepareQuery('wp_meta3',$customparam);
	if($sqlfields !== "")
	{
		if($arrduplicate === null)
		{
			$query ="SELECT p1.ID, p1.post_title,p1.post_parent, {$meta}.meta_key, {$meta}.meta_value
				FROM {$posts} p1
				INNER JOIN {$meta} ON p1.ID={$meta}.post_id 
				AND ({$meta}.meta_key IN ({$sqlfields})
				OR {$meta}.meta_key LIKE 'attribute_%')
				WHERE p1.ID IN (SELECT ID FROM {$temptable}{$useit})";
			$metavals =  $wpdb->get_results($query);
			if ( is_wp_error($metavals) ) {
				return new WP_Error( 'db_query_error', 
					__( 'Could not execute query' ), $wpdb->last_error );
			} 
			
				self::WriteDebugInfo("15 after meta2 get_results ".__LINE__,$curr_settings);
			
		}else
		{
			$query ="SELECT p1.ID, p1.post_title,p1.post_parent, {$meta}.meta_key, {$meta}.meta_value
				FROM {$posts} p1
				INNER JOIN {$meta} ON p1.ID={$meta}.post_id 
				AND ({$meta}.meta_key IN ({$sqlfields})
				OR {$meta}.meta_key LIKE 'attribute_%')
				WHERE p1.ID IN ({$duplicateids})";
			$metavals =  $wpdb->get_results($query);
			
				self::WriteDebugInfo("16 after meta2-1 get_results ".__LINE__,$curr_settings);

			if ( is_wp_error($metavals) ) {
				return new WP_Error( 'db_query_error', 
					__( 'Could not execute query' ), $wpdb->last_error );
					
			} 
		}
	}
		self::LoopMetaData($metavals,$ids,$tax_classes,$converttoutf8);
		self::WriteDebugInfo("16.5 after loop meta ".__LINE__,$curr_settings);
		unset($metavals);
		$thumbids = "";
		$thumbcounter = 0;
		$thumbsidmap = array();
		$gal_thumbids = "";
		$gal_thumbcounter = 0;
		$gal_thumbsidmap = array();
		$upload_dir = wp_upload_dir();
		if(is_array($upload_dir) && isset($upload_dir['baseurl']))
			$upload_dir = $upload_dir['baseurl'];
		else
			$upload_dir = "";
		
		
		$sel_fields = get_option('w3exwabe_custom');
		
		foreach($ids as &$id)
		{
			if($converttoutf8)
			{
				if(property_exists($id,'post_title'))
				{
					$id->post_title =  mb_convert_encoding($id->post_title, "UTF-8");
				}
				if(property_exists($id,'post_content'))
				{
					$id->post_content =	mb_convert_encoding($id->post_content, "UTF-8");
				}
				if(property_exists($id,'post_excerpt'))
				{
					$id->post_excerpt =	mb_convert_encoding($id->post_excerpt, "UTF-8");
				}
			}
			
			if(property_exists($id,'post_parent'))
			{
				if($id->post_parent == 0 || $id->post_type == 'product')
				{
					if(!property_exists($id,'_stock_status'))
					{
						$id->stock_status = "instock";
					}
				}
			}
			if($upload_dir === "") continue;
			if($post_type === 'attachment')
			{
				$id->_thumbnail_id = $id->ID;
			}
			if(property_exists($id,'_thumbnail_id'))
			{
				if($id->_thumbnail_id != "")
				{
					if(array_key_exists($id->_thumbnail_id,$thumbsidmap))
					{
						$oldids = $thumbsidmap[$id->_thumbnail_id];
						$oldids.= ';'. (string)$id->ID;
						$thumbsidmap[$id->_thumbnail_id] = $oldids;
					}else
					{
						$thumbsidmap[$id->_thumbnail_id] = (string)$id->ID;
					}
					
					if($thumbids == "")
					{
						$thumbids = $id->_thumbnail_id;
					}else
					{
						$thumbids.= ',' . $id->_thumbnail_id;
					}
					if($thumbcounter > 100)
					{
						$query ="SELECT post_id,meta_value
						FROM  {$meta} WHERE post_id IN ({$thumbids}) AND meta_key='_wp_attachment_metadata'";
						$metathumbs =  $wpdb->get_results($query);
						if ( false === $metathumbs) {
							$thumbcounter = 0;
							$thumbids = "";
							$metathumbs = array();
						}
						foreach($metathumbs as &$thumb)
			{
				if(array_key_exists($thumb->post_id,$thumbsidmap))
				{
					$thumbidsmul = $thumbsidmap[$thumb->post_id];
					$curthumbids = explode(';',$thumbidsmul);
					foreach($curthumbids as $curthumbid)
					{
					if(array_key_exists($curthumbid,$ids))
					{
						$obj = $ids[$curthumbid];
						$allsizes = maybe_unserialize($thumb->meta_value);
						if ( $allsizes ) 
						{
							if(is_array($allsizes))
							{
								$obj->_thumbnail_id_val = "";
								if(isset($allsizes['file']))
								{
									$dirpart = $allsizes['file'];
									$lastSlash = strrpos($dirpart,"/");
									if(FALSE !== $lastSlash)
									{
										$dirpart = substr($dirpart,0,$lastSlash + 1);
									}else
									{
										$dirpart = "";
									}
									
									$obj->_thumbnail_id_val = $upload_dir.'/'.$allsizes['file'];
									$obj->_thumbnail_id_original = $allsizes['file'];
									$obj->_thumbnail_id_info = "<div class='fileinfo'>".$allsizes['file']."</div>";
									if(isset($allsizes['width']) && isset($allsizes['height']))
									{
										$obj->_thumbnail_id_info.= "<div class='dims'>".$allsizes['width']." x ".$allsizes['height']."</div>";
									}
					if(isset($allsizes['sizes'])) // && $dirpart !== ""
					{
						$sizes = $allsizes['sizes'];
						//check for thumbnail or medium size to save bandwith
							$lastheight = 0;
							$lastwidth = 0;
							foreach($sizes as $size)
							{
								if(!isset($size["file"]) || !isset($size["width"]) || !isset($size["height"]))
									continue;
								if($lastheight === 0 && $lastwidth === 0)
								{
									$lastheight = (int)$size["height"];
									$lastwidth  = (int)$size["width"];
									$obj->_thumbnail_id_val = $upload_dir.'/'.$dirpart.$size["file"];
								}else
								{
									if($size["height"] < $lastheight && $size["width"] < $lastwidth && $size["height"] >= 150 &&  $size["width"] >= 150)
									{
										$lastheight = (int)$size["height"];
										$lastwidth  = (int)$size["width"];
										$obj->_thumbnail_id_val = $upload_dir.'/'.$dirpart.$size["file"];
									}
								}
							}
				
//						if(isset($sizes["thumbnail"]) && isset($sizes["thumbnail"]["file"]))
//						{
//							$obj->_thumbnail_id_val = $upload_dir.'/'.$dirpart.$sizes["thumbnail"]["file"];
//						}else if(isset($sizes["shop_thumbnail"]) && isset($sizes["shop_thumbnail"]["file"]))
//						{
//							$obj->_thumbnail_id_val = $upload_dir.'/'.$dirpart.$sizes["shop_thumbnail"]["file"];
//						}else if(isset($sizes["medium"]) && isset($sizes["medium"]["file"]))
//						{
//							$obj->_thumbnail_id_val = $upload_dir.'/'.$dirpart.$sizes["medium"]["file"];
//						}else if(isset($sizes["shop_single"]) && isset($sizes["shop_single"]["file"]))
//						{
//							$obj->_thumbnail_id_val = $upload_dir.'/'.$dirpart.$sizes["shop_single"]["file"];
//						}
					}
								}
								
							}
						}
					}
					}
				}
			}
						$thumbcounter = 0;
						$thumbids = "";
						unset($thumbsidmap);
						$thumbsidmap = array();
					}else
					{
						$thumbcounter++;
					}
				}
			}
		}
//		return new WP_Error( 'db_query_error', 
//					__( 'Could not execute query' ), $wpdb->last_error );
		self::WriteDebugInfo("16.6 after ids loop ".__LINE__,$curr_settings);
		
		if($thumbcounter !== 0 && $thumbids !== "")
		{
			$query = "SELECT post_id,meta_value
			FROM  {$meta} WHERE post_id IN ({$thumbids}) AND meta_key='_wp_attachment_metadata'";
			$metathumbs =  $wpdb->get_results($query);
			if ( false === $metathumbs) {
				$thumbcounter = 0;
				$thumbids = "";
				$metathumbs = array();
			}
			foreach($metathumbs as &$thumb)
			{
				if(array_key_exists($thumb->post_id,$thumbsidmap))
				{
					$thumbidsmul = $thumbsidmap[$thumb->post_id];
					$curthumbids = explode(';',$thumbidsmul);
					foreach($curthumbids as $curthumbid)
					{
					if(array_key_exists($curthumbid,$ids))
					{
						$obj = $ids[$curthumbid];
						$allsizes = maybe_unserialize($thumb->meta_value);
						if ( $allsizes ) 
						{
							if(is_array($allsizes))
							{
								
								$obj->_thumbnail_id_val = "";
								if(isset($allsizes['file']))
								{
									$dirpart = $allsizes['file'];
									$lastSlash = strrpos($dirpart,"/");
									if(FALSE !== $lastSlash)
									{
										$dirpart = substr($dirpart,0,$lastSlash + 1);
									}else
									{
										$dirpart = "";
									}
									
									$obj->_thumbnail_id_val = $upload_dir.'/'.$allsizes['file'];
									$obj->_thumbnail_id_original = $allsizes['file'];
									$obj->_thumbnail_id_info = "<div class='fileinfo'>".$allsizes['file']."</div>";
									if(isset($allsizes['width']) && isset($allsizes['height']))
									{
										$obj->_thumbnail_id_info.= "<div class='dims'>".$allsizes['width']." x ".$allsizes['height']."</div>";
									}
//									if(isset($allsizes['width']) && isset($allsizes['width']))
//									{
//										$obj->_thumbnail_id_info.= "<div class='dims'>".$allsizes['width']." x ".$allsizes['height']."</div>";
//									}
					if(isset($allsizes['sizes'])) // && $dirpart !== ""
					{
						$sizes = $allsizes['sizes'];
						$lastheight = 0;
							$lastwidth = 0;
							foreach($sizes as $size)
							{
								if(!isset($size["file"]) || !isset($size["width"]) || !isset($size["height"]))
									continue;
								if($lastheight === 0 && $lastwidth === 0)
								{
									$lastheight = (int)$size["height"];
									$lastwidth  = (int)$size["width"];
									$obj->_thumbnail_id_val = $upload_dir.'/'.$dirpart.$size["file"];
								}else
								{
									if($size["height"] < $lastheight && $size["width"] < $lastwidth && $size["height"] >= 150 &&  $size["width"] >= 150)
									{
										$lastheight = (int)$size["height"];
										$lastwidth  = (int)$size["width"];
										$obj->_thumbnail_id_val = $upload_dir.'/'.$dirpart.$size["file"];
									}
								}
							}
						//check for thumbnail or medium size to save bandwith
//						if(isset($sizes["thumbnail"]) && isset($sizes["thumbnail"]["file"]))
//						{
//							$obj->_thumbnail_id_val = $upload_dir.'/'.$dirpart.$sizes["thumbnail"]["file"];
//						}else if(isset($sizes["shop_thumbnail"]) && isset($sizes["shop_thumbnail"]["file"]))
//						{
//							$obj->_thumbnail_id_val = $upload_dir.'/'.$dirpart.$sizes["shop_thumbnail"]["file"];
//						}else if(isset($sizes["medium"]) && isset($sizes["medium"]["file"]))
//						{
//							$obj->_thumbnail_id_val = $upload_dir.'/'.$dirpart.$sizes["medium"]["file"];
//						}else if(isset($sizes["shop_single"]) && isset($sizes["shop_single"]["file"]))
//						{
//							$obj->_thumbnail_id_val = $upload_dir.'/'.$dirpart.$sizes["shop_single"]["file"];
//						}
					}
								}
								
							}
						}
					}
					
					}
				}
			}
		}
		self::WriteDebugInfo("16.7 after thumb gen ".__LINE__,$curr_settings);
		$cats = array();
		if($arrduplicate === null)
		{
			if($useit != "")
			{
				$useit = " AND {$temptable}.useit=1";
			}
			$query = "SELECT 
				{$temptable}.ID, rel.term_taxonomy_id, term.term_id
				FROM {$temptable}
				INNER JOIN {$term} rel ON {$temptable}.ID=rel.object_id
				INNER JOIN {$term_taxonomy} term ON rel.term_taxonomy_id=term.term_taxonomy_id
				{$useit}";
			$cats = $wpdb->get_results($query);
			if ( is_wp_error($cats) ) {
				return new WP_Error( 'db_query_error', 
					__( 'Could not execute query' ), $wpdb->last_error );
			} 
		}else
		{
			$duplicateids = "";
			foreach($arrduplicate as $key => $value)
			{
				if($duplicateids == "")
					$duplicateids.= $value->ID;
				else
					$duplicateids.= ",".$value->ID;
			}
				
			$query = "SELECT 
				{$posts}.ID, rel.term_taxonomy_id, term.term_id
				FROM {$posts}
				INNER JOIN {$term} rel ON {$posts}.ID=rel.object_id
				INNER JOIN {$term_taxonomy} term ON rel.term_taxonomy_id=term.term_taxonomy_id
				WHERE {$posts}.ID IN ({$duplicateids})";
			$cats = $wpdb->get_results($query);
			if ( is_wp_error($cats) ) {
				return new WP_Error( 'db_query_error', 
					__( 'Could not execute query' ), $wpdb->last_error );
			} 
		}
		
			self::WriteDebugInfo("17 after get taxonomies ".__LINE__,$curr_settings);
		//categories
//		return new WP_Error( 'db_query_error', 
//					__( 'Could not execute query' ), $wpdb->last_error );
		$cats_assoc = array();
		
		$arrtaxonomies = array();
		if(in_array('category',self::$columns) || empty(self::$columns))
			$arrtaxonomies[] = 'category';
		if(in_array('post_tag',self::$columns) || empty(self::$columns))
			$arrtaxonomies[] = 'post_tag';
		if(in_array('post_format',self::$columns) || empty(self::$columns))
			$arrtaxonomies[] = 'post_format';
						
		$sel_fields = get_option('w3exwabe_custom');
	
		if(is_array($sel_fields) && !empty($sel_fields))
		{
			foreach($sel_fields as $keyout => $outarray)
			{
				foreach($outarray as $key => $innerarray)
				{
					if(isset($innerarray['type']))
					{
						if($innerarray['type'] === 'customh' || $innerarray['type'] === 'custom')
						{
							if(taxonomy_exists($key))
							{
								if(in_array($key,self::$columns))
									$arrtaxonomies[] = $key;
							}
						}
					}
				}
			}
		}
		
		foreach($arrtaxonomies as $taxonomy)
		{
//			$woo_categories = get_terms( $taxonomy, $args_cats );
			$getquery = "SELECT t.name,tt.term_taxonomy_id FROM {$wpdb->prefix}terms as t INNER JOIN {$wpdb->prefix}term_taxonomy AS tt ON t.term_id= tt.term_id WHERE tt.taxonomy IN('".$taxonomy."')";
			$woo_categories = $wpdb->get_results($getquery);
			if(is_wp_error($woo_categories))
				continue;
			foreach($woo_categories as $category)
			{
			   if(!is_object($category)) continue;
			   if(!property_exists($category,'term_taxonomy_id')) continue;
			   if(!property_exists($category,'name')) continue;
				if($converttoutf8 && function_exists('mb_convert_encoding'))
				{
					$category->name =  mb_convert_encoding($category->name, "UTF-8");
				}
			  	  $idmap = array((string)$category->name,$taxonomy);
			   $cats_assoc[$category->term_taxonomy_id] = $idmap;
			};
		}
		self::WriteDebugInfo("18 after map taxonomies ".__LINE__,$curr_settings);
		
		foreach($cats as &$val)
		{
			if(!property_exists($val,'ID') || !property_exists($val,'term_id') || !property_exists($val,'term_taxonomy_id'))
				continue;
			if(array_key_exists($val->term_taxonomy_id,$cats_assoc))
			{
				if(array_key_exists($val->ID,$ids))
				{
					$idmap = $cats_assoc[$val->term_taxonomy_id];
					$obj = $ids[$val->ID];
					if(!is_object($obj))
						continue;
					if(!isset($idmap[1]) || !isset($idmap[0]))
						continue;
					if(strpos($idmap[1],'_w3ex_attr') === 0)
					{
						if($obj->post_type != '{$post_type}')
							continue;
						$obj->attribute_pa_ids = $val->term_id;
						continue;
					} 
					if(property_exists($obj,$idmap[1]) && property_exists($obj,$idmap[1] . '_ids'))
					{
						$obj->{$idmap[1]} = $obj->{$idmap[1]}. ', '. $idmap[0];
						$obj->{$idmap[1] . '_ids'} = $obj->{$idmap[1] . '_ids'} . ',' .$val->term_id;
					}else
					{
						$obj->{$idmap[1]} = $idmap[0];
						$obj->{$idmap[1] . '_ids'} = $val->term_id;
					}
				}
			}
		}
}
catch(Exception $e) {
  return $e->getMessage();
}
//		return new WP_Error( 'db_query_error', 
//					__( 'Could not execute query' ), $wpdb->last_error );
		return $info;
	}
	
	public static function saveProducts(&$data,&$children,&$currentpos,&$batchnumber)
	{
		global $wpdb;
		$posts = $wpdb->posts;
		$meta = $wpdb->postmeta;
		$temptable = $wpdb->prefix."wpmelon_wadvbedit_temp";
		$term = $wpdb->term_relationships;
		$handledchildren = array();
		$sel_fields = get_option('w3exwabe_custom');
		$handledattrs = array();
		$attributes = array();
		$attrmapslugtoname = array();
		$parentattrs_cache = array();
		$update_parent_attr = array();
		$update_vars_price = array();
		$tax_classes = array();
		$retarray = array();
		$counter = 0;
		$processcounter = 0;
		self::WriteDebugInfo("clear","");
		$rowstoskip = -1;
		if($currentpos !== -1)
		{
			$rowstoskip = $currentpos * $batchnumber;
			if($rowstoskip >= count($data))
			{
				$rowstoskip = -1;
			}
			$currentpos++;
		}
		$post_type = 'post';
				if(isset($_POST['post_type']))
					$post_type = $_POST['post_type'];
		foreach($data as $arrrow)
		{
			if(!is_array($arrrow)) continue;
			$counter++;
			
			$oldpost = null;
			if($rowstoskip !== -1)
			{
				if($counter <= $rowstoskip)
					continue;
				if($processcounter < $batchnumber)
				{
					$processcounter++;
				}else
				{
					continue;
				}
			}
//			self::WriteDebugInfo("loop number ".__LINE__,$curr_settings);
			self::WriteDebugInfo("loop number ".$counter,"");
			$ID = 0;
			if(array_key_exists('ID',$arrrow))
			{
				$ID = (int)$arrrow['ID'];
			
				$parentid = 0;
				if(array_key_exists('post_parent',$arrrow))
					$parentid = (int)$arrrow['post_parent'];
				if($ID < 0) continue;
				if(self::$bsavepost)
				{
					$oldpost = get_post($ID);
				}
				$where = "";
				$fields = "";
				foreach($arrrow as $i => $Row)
				{
					if(is_array($sel_fields) && !empty($sel_fields))
					{
						foreach($sel_fields as $keyout => $outarray)
						{
							if(array_key_exists($i,$outarray))
							{
								if(isset($outarray[$i]['type']))
								{
									if($outarray[$i]['type'] === 'customh')
									{
										if(taxonomy_exists($i))
										{
											if($i === 'product_delivery_times' || $i === 'product_sale_labels')
											{
												if($i === 'product_delivery_times')
												{
													$cat_ids = explode(',',$Row);
													$cat_ids = array_map( 'intval', $cat_ids );
													$cat_ids = array_unique( $cat_ids );
													if(isset($cat_ids[0]))
														update_post_meta ( $ID,'_lieferzeit' , $cat_ids[0]);
													else
														delete_post_meta ( $ID,'_lieferzeit');
												}
												if($i === 'product_sale_labels')
												{
													$cat_ids = explode(',',$Row);
													$cat_ids = array_map( 'intval', $cat_ids );
													$cat_ids = array_unique( $cat_ids );
													if(isset($cat_ids[0]))
														update_post_meta ( $ID,'_sale_label' , $cat_ids[0]);
													else
														delete_post_meta ( $ID,'_sale_label');
												}
												continue;
											}
											$cat_ids = explode(',',$Row);
											$cat_ids = array_map( 'intval', $cat_ids );
											$cat_ids = array_unique( $cat_ids );
											wp_set_object_terms($ID,$cat_ids,$i);
										}
										continue;
									}elseif($sel_fields[$i]['type'] === 'custom')
									{
										if(isset($sel_fields[$i]['isnewvals']) && ($sel_fields[$i]['isnewvals'] === 'true') && taxonomy_exists($i))
										{
											$cat_ids = explode(',',$Row);
											$cat_ids = array_map( 'trim', $cat_ids );
											$cat_ids = array_unique( $cat_ids );
											wp_set_object_terms($ID,$cat_ids,$i);
										}else
										{
											$cat_ids = explode(',',$Row);
											$cat_ids = array_map( 'trim', $cat_ids );
											$cat_ids = array_unique( $cat_ids );
											$new_ids = array();
											foreach($cat_ids as $value)
											{
												if(term_exists($value,$i))
												{
													$new_ids[] = $value;
												}
											}
											wp_set_object_terms($ID,$new_ids,$i);
										}
										continue;
									}
								}
								
							}
						}
					}
					
					switch($i){
						case "post_title"://title
						{
							$query = "UPDATE {$posts} SET post_title='".$Row."' WHERE ID={$ID}";
							$wpdb->query($query);
						}break;
						case "post_type":
						{
							$query = "UPDATE {$posts} SET post_type='".$Row."' WHERE ID={$ID}";
							$wpdb->query($query);
							if($Row === "product")
							{//delete attribute data
								$query ="SELECT meta_key FROM {$meta} WHERE post_id={$ID} AND meta_key LIKE 'attribute_%'";
								$metavals =  $wpdb->get_results($query);
								if ( !is_wp_error($metavals) ) 
								{
								     foreach($metavals as $metain)
								     {
									 	delete_post_meta($ID, $metain->meta_key);
									 }
								} 
							}
						}break;
						case "post_content"://desct
						{
							$Row = str_replace("\r\n", "\n",$Row);
							$Row = str_replace("\n", "\r\n",$Row);
							$query = "UPDATE {$posts} SET post_content='".$Row."' WHERE ID={$ID}";
							$wpdb->query($query);
						}break;
						case "post_excerpt":
						{
							$Row = str_replace("\r\n", "\n",$Row);
							$Row = str_replace("\n", "\r\n",$Row);
							$query = "UPDATE {$posts} SET post_excerpt='".$Row."' WHERE ID={$ID}";
							$wpdb->query($query);
						}break;
						case "post_name":
						{
							$slugvalue = $Row;
							$iso9_table = array(
								'ě' => 'e', 'š' => 's', 'č' => 'c', 'ř' => 'r', 'ž' => 'z',
								'ý' => 'y', 'á' => 'a', 'í' => 'i', 'é' => 'e', 'ď' => 'd',
								'ť' => 't', 'ň' => 'n', 'ú' => 'u', 'ů' => 'u', 'Š' => 'S',
								'Č' => 'C', 'Ř' => 'R', 'Ž' => 'Z', 'Á' => 'A', 'Ú' => 'U',
								'ü' => 'u','ğ' => 'g','Ş' => 'S','ş' => 's','ö' => 'o',
								'Ö' => 'o','ç' => 'c','Ç' => 'c','ı' => 'i',
								'ã' => 'a','Ã' => 'a','õ' => 'o','Õ' => 'o',
								'â' => 'a','Â' => 'a','ê' => 'e','Ê' => 'e',
								'î' => 'i','Î' => 'i','ô' => 'o','Ô' => 'o',
								'û' => 'u','Û' => 'u','ó' => 'o','Ó' => 'o',
								'à' => 'a','À' => 'a','è' => 'e','È' => 'e',
								'ì' => 'i','Ì' => 'i','ò' => 'o','Ò' => 'o',
								'ù' => 'u','Ù' => 'u'
							);
							$iso9_table1 = array(
								'А' => 'A', 'Б' => 'B', 'В' => 'V', 'Г' => 'G', 'Ѓ' => 'G',
								'Ґ' => 'G', 'Д' => 'D', 'Е' => 'E', 'Ё' => 'YO', 'Є' => 'YE',
								'Ж' => 'ZH', 'З' => 'Z', 'Ѕ' => 'Z', 'И' => 'I', 'Й' => 'J',
								'Ј' => 'J', 'І' => 'I', 'Ї' => 'YI', 'К' => 'K', 'Ќ' => 'K',
								'Л' => 'L', 'Љ' => 'L', 'М' => 'M', 'Н' => 'N', 'Њ' => 'N',
								'О' => 'O', 'П' => 'P', 'Р' => 'R', 'С' => 'S', 'Т' => 'T',
								'У' => 'U', 'Ў' => 'U', 'Ф' => 'F', 'Х' => 'H', 'Ц' => 'TS',
								'Ч' => 'CH', 'Џ' => 'DH', 'Ш' => 'SH', 'Щ' => 'SHT', 'Ъ' => '',
								'Ы' => 'Y', 'Ь' => '', 'Э' => 'E', 'Ю' => 'YU', 'Я' => 'YA',
								'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'ѓ' => 'g',
								'ґ' => 'g', 'д' => 'd', 'е' => 'e', 'ё' => 'yo', 'є' => 'ye',
								'ж' => 'zh', 'з' => 'z', 'ѕ' => 'z', 'и' => 'i', 'й' => 'j',
								'ј' => 'j', 'і' => 'i', 'ї' => 'yi', 'к' => 'k', 'ќ' => 'k',
								'л' => 'l', 'љ' => 'l', 'м' => 'm', 'н' => 'n', 'њ' => 'n',
								'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't',
								'у' => 'u', 'ў' => 'u', 'ф' => 'f', 'х' => 'h', 'ц' => 'ts',
								'ч' => 'ch', 'џ' => 'dh', 'ш' => 'sh', 'щ' => 'sht', 'ъ' => '',
								'ы' => 'y', 'ь' => '', 'э' => 'e', 'ю' => 'yu', 'я' => 'ya'
							);
							$iso9_table = array_merge($iso9_table, $iso9_table1);
							$geo2lat = array(
								'ა' => 'a', 'ბ' => 'b', 'გ' => 'g', 'დ' => 'd', 'ე' => 'e', 'ვ' => 'v',
								'ზ' => 'z', 'თ' => 'th', 'ი' => 'i', 'კ' => 'k', 'ლ' => 'l', 'მ' => 'm',
								'ნ' => 'n', 'ო' => 'o', 'პ' => 'p','ჟ' => 'zh','რ' => 'r','ს' => 's',
								'ტ' => 't','უ' => 'u','ფ' => 'ph','ქ' => 'q','ღ' => 'gh','ყ' => 'qh',
								'შ' => 'sh','ჩ' => 'ch','ც' => 'ts','ძ' => 'dz','წ' => 'ts','ჭ' => 'tch',
								'ხ' => 'kh','ჯ' => 'j','ჰ' => 'h'
							);
							$iso9_table = array_merge($iso9_table, $geo2lat);
							$slugvalue = strtr($slugvalue, apply_filters('ctl_table', $iso9_table));
							if (function_exists('iconv')){
								$slugvalue = iconv('UTF-8', 'UTF-8//TRANSLIT//IGNORE', $slugvalue);
							}
							$slug = apply_filters('sanitize_title', $slugvalue);
							$slug = sanitize_title_with_dashes($slug,'','save');
							$slug = wp_unique_post_slug( $slug, $ID, 'publish', $post_type, 0);
							
							$query = "UPDATE {$posts} SET post_name='{$slug}' WHERE ID={$ID}";
							$wpdb->query($query);
//							self::CallWooAction($ID,$oldpost,$arrrow);
//							if($slug != $Row)
							{
								$newvar = new stdClass();
								$newvar->ID = (string)$ID;
								$newvar->post_name = $slug;
								$permalink = get_permalink($ID);
								if(false !== $permalink)
								{
									$newvar->_post_permalink = $permalink;
								}
								$retarray[] = $newvar;
							}
							
								
						}break;
						case "post_date":
						{
							$date = $Row;
							$date1 = new DateTime($date);
							$date = $date1->format('Y-m-d');
//							$datenow = new DateTime();
							$date = $date.' '.date('H:i:s');
							$date_gmt = get_gmt_from_date($date);
							$query = "UPDATE {$posts} SET post_date='{$date}', post_date_gmt='{$date_gmt}' WHERE ID={$ID}";
							$wpdb->query($query);
						}break;
						case "menu_order":
						{
							$query = "UPDATE {$posts} SET menu_order='".intval($Row)."' WHERE ID={$ID}";
							$wpdb->query($query);
						}break;
						case "comment_status":
						{
							if($Row == 'yes')
								$query = "UPDATE {$posts} SET comment_status='open' WHERE ID={$ID}";
							else
								$query = "UPDATE {$posts} SET comment_status='closed' WHERE ID={$ID}";
							$wpdb->query($query);
						}break;
						case "post_author":
						{
							$cat_ids = explode(',',$Row);
							$cat_ids = array_map( 'intval', $cat_ids );
							$cat_ids = array_unique( $cat_ids );
							$val = implode("",$cat_ids);
							$query = "UPDATE {$posts} SET post_author='".$val."' WHERE ID={$ID}";
							$wpdb->query($query);
						}break;
						case "category":
						{
							$cat_ids = explode(',',$Row);
							$cat_ids = array_map( 'intval', $cat_ids );
							$cat_ids = array_unique( $cat_ids );
							wp_set_object_terms($ID,$cat_ids,'category');
//							self::WriteDebugInfo("loop number ".__LINE__,$curr_settings);
						}break;
						case "post_tag":
						{
							$cat_ids = explode(',',$Row);
							//use intval insterad of trim for hierarchical tags
							$cat_ids = array_map( 'trim', $cat_ids );
							$cat_ids = array_unique( $cat_ids );
							wp_set_object_terms($ID,$cat_ids,'post_tag');
						}break;
						case "post_format":
						{
							$cat_ids = explode(',',$Row);
							$cat_ids = array_map( 'intval', $cat_ids );
							$cat_ids = array_unique( $cat_ids );
							wp_set_object_terms($ID,$cat_ids,'post_format');
						}break;
						case "post_status":
						{
							$query = "SELECT post_type FROM {$posts} WHERE ID={$ID}";
							$ret = $wpdb->get_var($query);
							$bcallaction = true;
							$old_status = "";
							$post = new stdClass();
//							if($ret === 'product')
							{
								$post = get_post($ID);
								$old_status = $post->post_status;
								$bcallaction = true;
							}
							if($Row == 'publish')
							{
								$query = "SELECT {$posts}.post_name FROM {$posts} WHERE {$posts}.ID={$ID}";
								$ret = $wpdb->get_var($query);
//								if(!is_wp_error($ret) && $ret == '')
								{
									$query = "SELECT post_title, post_date FROM {$posts} WHERE {$posts}.ID={$ID}";
									$ret = $wpdb->get_results($query);
									if(!is_wp_error($ret) && count($ret) == 1)
									{
										$obj = $ret[0];
										$title = $obj->post_title;
										$iso9_table = array(
											'ě' => 'e', 'š' => 's', 'č' => 'c', 'ř' => 'r', 'ž' => 'z',
											'ý' => 'y', 'á' => 'a', 'í' => 'i', 'é' => 'e', 'ď' => 'd',
											'ť' => 't', 'ň' => 'n', 'ú' => 'u', 'ů' => 'u', 'Š' => 'S',
											'Č' => 'C', 'Ř' => 'R', 'Ž' => 'Z', 'Á' => 'A', 'Ú' => 'U',
											'ü' => 'u','ğ' => 'g','Ş' => 'S','ş' => 's','ö' => 'o',
											'Ö' => 'o','ç' => 'c','Ç' => 'c','ı' => 'i',
											'ã' => 'a','Ã' => 'a','õ' => 'o','Õ' => 'o',
											'â' => 'a','Â' => 'a','ê' => 'e','Ê' => 'e',
											'î' => 'i','Î' => 'i','ô' => 'o','Ô' => 'o',
											'û' => 'u','Û' => 'u','ó' => 'o','Ó' => 'o',
											'à' => 'a','À' => 'a','è' => 'e','È' => 'e',
											'ì' => 'i','Ì' => 'i','ò' => 'o','Ò' => 'o',
											'ù' => 'u','Ù' => 'u'
										);
										$iso9_table1 = array(
											'А' => 'A', 'Б' => 'B', 'В' => 'V', 'Г' => 'G', 'Ѓ' => 'G',
											'Ґ' => 'G', 'Д' => 'D', 'Е' => 'E', 'Ё' => 'YO', 'Є' => 'YE',
											'Ж' => 'ZH', 'З' => 'Z', 'Ѕ' => 'Z', 'И' => 'I', 'Й' => 'J',
											'Ј' => 'J', 'І' => 'I', 'Ї' => 'YI', 'К' => 'K', 'Ќ' => 'K',
											'Л' => 'L', 'Љ' => 'L', 'М' => 'M', 'Н' => 'N', 'Њ' => 'N',
											'О' => 'O', 'П' => 'P', 'Р' => 'R', 'С' => 'S', 'Т' => 'T',
											'У' => 'U', 'Ў' => 'U', 'Ф' => 'F', 'Х' => 'H', 'Ц' => 'TS',
											'Ч' => 'CH', 'Џ' => 'DH', 'Ш' => 'SH', 'Щ' => 'SHT', 'Ъ' => '',
											'Ы' => 'Y', 'Ь' => '', 'Э' => 'E', 'Ю' => 'YU', 'Я' => 'YA',
											'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'ѓ' => 'g',
											'ґ' => 'g', 'д' => 'd', 'е' => 'e', 'ё' => 'yo', 'є' => 'ye',
											'ж' => 'zh', 'з' => 'z', 'ѕ' => 'z', 'и' => 'i', 'й' => 'j',
											'ј' => 'j', 'і' => 'i', 'ї' => 'yi', 'к' => 'k', 'ќ' => 'k',
											'л' => 'l', 'љ' => 'l', 'м' => 'm', 'н' => 'n', 'њ' => 'n',
											'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's', 'т' => 't',
											'у' => 'u', 'ў' => 'u', 'ф' => 'f', 'х' => 'h', 'ц' => 'ts',
											'ч' => 'ch', 'џ' => 'dh', 'ш' => 'sh', 'щ' => 'sht', 'ъ' => '',
											'ы' => 'y', 'ь' => '', 'э' => 'e', 'ю' => 'yu', 'я' => 'ya'
										);
										$iso9_table = array_merge($iso9_table, $iso9_table1);
										$geo2lat = array(
											'ა' => 'a', 'ბ' => 'b', 'გ' => 'g', 'დ' => 'd', 'ე' => 'e', 'ვ' => 'v',
											'ზ' => 'z', 'თ' => 'th', 'ი' => 'i', 'კ' => 'k', 'ლ' => 'l', 'მ' => 'm',
											'ნ' => 'n', 'ო' => 'o', 'პ' => 'p','ჟ' => 'zh','რ' => 'r','ს' => 's',
											'ტ' => 't','უ' => 'u','ფ' => 'ph','ქ' => 'q','ღ' => 'gh','ყ' => 'qh',
											'შ' => 'sh','ჩ' => 'ch','ც' => 'ts','ძ' => 'dz','წ' => 'ts','ჭ' => 'tch',
											'ხ' => 'kh','ჯ' => 'j','ჰ' => 'h'
										);
										$iso9_table = array_merge($iso9_table, $geo2lat);
										$title = strtr($title, apply_filters('ctl_table', $iso9_table));
										if (function_exists('iconv')){
											$title = iconv('UTF-8', 'UTF-8//TRANSLIT//IGNORE', $title);
										}
										$slug = apply_filters('name_save_pre',$title );
										$slug = apply_filters('sanitize_title', $slug,$slug,'save');
										$slug = sanitize_title_with_dashes($slug,'','save');
										$slug = wp_unique_post_slug( $slug, $ID, 'publish', $post_type, 0);
										$date_gmt = get_gmt_from_date($obj->post_date);
										$query = "UPDATE {$posts} SET post_name='{$slug}',post_status='publish',post_date_gmt='{$date_gmt}' WHERE ID={$ID}";
										$wpdb->query($query);
//										if($slug != $Row)
										{
											$newvar = new stdClass();
											$newvar->ID = (string)$ID;
											$newvar->post_name = $slug;
											$permalink = get_permalink($ID);
											$newvar->_post_permalink = "";
											if(false !== $permalink)
											{
												$newvar->_post_permalink = $permalink;
											}
											$retarray[] = $newvar;
										}
									}
								}
//								else
//								{
//									$query = "UPDATE {$posts} SET post_status='".$Row."' WHERE ID={$ID}";
//									$wpdb->query($query);
//								}
							}else
							{
								$query = "UPDATE {$posts} SET post_status='".$Row."' WHERE ID={$ID}";
								$wpdb->query($query);
							}
							
							if($bcallaction)
							{
								wp_transition_post_status($Row,$old_status,$post);
							}
						}break;
						default:
						{
							if($i !== 'ID' && $i !== 'post_parent' && $i !== 'parent')
							{
								
								{
									if( strpos($Row,":",0) !== FALSE && strpos($Row,";",0) !== FALSE &&strpos($Row,"{",0) !== FALSE &&strpos($Row,"}",0) !== FALSE)
									{
										$query = "SELECT meta_id FROM {$meta} WHERE post_id={$ID} AND meta_key='{$i}'";
										$ret = $wpdb->get_var($query);
										if($ret === NULL)
										{
											$query = "INSERT INTO {$meta} (post_id,meta_key,meta_value)
							 					 VALUES ({$ID},'{$i}','{$Row}');";
											$ret = $wpdb->query($query);
										}else
										{
											$query = "UPDATE {$meta} SET meta_value='".$Row."' WHERE meta_id={$ret}";
											$wpdb->query($query);
										}
									}else
									{
										update_post_meta( $ID , $i, $Row); //sanitize_text_field
									}
								}
							}
						}
							break;
					}
				}
				clean_post_cache($ID);
				self::CallWooAction($ID,$oldpost,$arrrow);
				
			}
		}
		
		return $retarray;
	}
	
	public static function RefreshCustMetaKeys($ID,&$attrsaved,&$attributes,$bproduct)
	{
		global $wpdb;
		$posts = $wpdb->posts;
		$meta = $wpdb->postmeta;
		if($bproduct)
		{
			$query = "SELECT ID from {$posts} WHERE post_parent={$ID} AND (post_type='product_variation')";
			$childids =  $wpdb->get_results($query);
			if(!is_wp_error($childids) && is_array($childids))
			{
				foreach($childids as $childobj)
				{
					$post_meta = $wpdb->get_results("SELECT meta_key, meta_value FROM {$meta} WHERE post_id={$childobj->ID} AND meta_key LIKE 'attribute_%';");

					if ( count( $post_meta ) != 0 ) 
					{

						foreach ( $post_meta as $meta_info ) 
						{
							$meta_key = $meta_info->meta_key;
							$has = false;
							foreach($attributes as $attrin => $attrval)
							{
								 $attrslug = "";
								 if(isset($attrval["is_taxonomy"]) && $attrval["is_taxonomy"] === 0)
								 {
								 	$attrslug = 'attribute_'.$attrin;
								 	if($attrslug === $meta_key)
								 	{
										$has = true;
										break;
									}
								 }elseif(isset($attrval["is_taxonomy"]) && $attrval["is_taxonomy"] === 1)
								 {
								 	$attrslug = 'attribute_'.$attrin;
								 	if($attrslug === $meta_key)
								 	{
										$has = true;
										break;
									}
								 }
							}
							if(!$has)
							{
								delete_post_meta($childobj->ID,$meta_key);
							}
						}
						
					}
				}
			}
		}
	}
	
	public static function addProducts($prodcount)
	{
		global $wpdb;
		$posts = $wpdb->posts;
		$meta = $wpdb->postmeta;
		$temptable = $wpdb->prefix."wpmelon_wadvbedit_temp";
		$term = $wpdb->term_relationships;
		$retarray = array();
		
		$insfields = array();
		$post_type = 'post';
		if(isset($_POST['post_type']))
			$post_type = $_POST['post_type'];
			
		$product_data = array();
		$product_data['post_status'] = 'draft';
		$product_data['post_title'] = 'New Post';
		$product_data['post_type'] = $post_type;			
		$product_data['post_parent'] = 0;
		$product_data['post_author']  = get_current_user_id();
		for($i = 0; $i < $prodcount; $i++)
		{
			$post_id = wp_insert_post($product_data,true);
			if(is_wp_error($post_id))
			{
				return $post_id;
			}
			
			$newvar = new stdClass();
			$newvar->ID = (string)$post_id;
			$newvar->post_parent = '0';
		
			$newvar->post_type = $post_type;
			
			foreach($insfields as $column => $value)
			{
				$query = "INSERT INTO {$meta} (post_id,meta_key,meta_value)
					  VALUES ({$post_id},'{$column}','{$value}');";
			
				$ret = $wpdb->query($query);
				if ( is_wp_error($ret) )
				{
					return $ret;
				} 
			}

			foreach($insfields as $column => $value)
			{
				$newvar->{$column} = $value;
			}
			$newvar->post_title = 'New Post';
			$newvar->post_status = 'draft';
			$newvar->menu_order = '0';
			$retarray[] = $newvar;
		}
		
		
		return $retarray;
	}
	
	public static function getVariations($ID,&$arrvars)
	{
		global $wpdb;
		$posts = $wpdb->posts;
		$meta = $wpdb->postmeta;
		$query = "SELECT ID from {$posts} WHERE post_parent={$ID} AND (post_type='product_variation')";
		$childids =  $wpdb->get_results($query);
		if(!is_wp_error($childids) && is_array($childids))
		{
			foreach($childids as $childobj)
			{
				$post_meta = $wpdb->get_results("SELECT meta_key, meta_value FROM {$meta} WHERE post_id={$childobj->ID} AND meta_key LIKE 'attribute_%';");

				if ( count( $post_meta ) != 0 ) 
				{
					$arrvalues = array();
					foreach ( $post_meta as $meta_info ) 
					{
//						$meta_key = $meta_info->meta_key;
						$arrvalues[$meta_info->meta_key] = $meta_info->meta_value;
					}
					ksort($arrvalues);
					$arrvars[$childobj->ID] = implode("", $arrvalues);
				}
			}
		}	
	}
	
	public static function deleteProducts(&$data,$type,&$currentpos,&$batchnumber,$deleteinternal = false)
	{
		global $wpdb;
		$posts = $wpdb->posts;
		$meta = $wpdb->postmeta;
		$term = $wpdb->term_relationships;
		$updatevarsmeta = array();
		$deleteattach = false;
		$curr_settings = get_option('w3exwabe_settings');
		if(!is_array($curr_settings))
			$curr_settings = array();
		if(isset($curr_settings['deleteimages']) && $curr_settings['deleteimages'] == 1)
		{
			$deleteattach = true;
		}
		foreach($data as $arrrow)
		{
			if(!is_array($arrrow)) continue;
			$ID = 0;
			
			if(array_key_exists('ID',$arrrow))
			{
				$ID = (int)$arrrow['ID'];
			
				$parentid = 0;
				$post_status = "draft";
				if(array_key_exists('post_parent',$arrrow))
					$parentid = (int)$arrrow['post_parent'];
				if(array_key_exists('post_status',$arrrow))
					$post_status = (string)$arrrow['post_status'];
				if($ID < 0) continue;
				if($type === "0")
				{
					//skip variations
					$query = "SELECT post_status FROM {$posts} WHERE ID={$ID}";
					$post_status = $wpdb->get_var($query);
					if($deleteinternal)
					{
						$query = "UPDATE {$posts}
								  SET {$posts}.post_status='trash'
								  WHERE  {$posts}.ID={$ID}";
						$ret = $wpdb->query($query);
						if ( is_wp_error($ret) ) {
							return new WP_Error( 'db_query_error', 
								__( 'Could not execute query' ), $wpdb->last_error );
						} 
						update_post_meta($ID,'_wp_trash_meta_status',$post_status);
						update_post_meta($ID,'_wp_trash_meta_time',time());
						do_action( 'wp_trash_post',$ID);
					}else
					{
						wp_trash_post( $ID); 
					}
					if($parentid != 0)
					{
						if(function_exists("wc_delete_product_transients"))
							wc_delete_product_transients($parentid);
					}else
					{
						if(function_exists("wc_delete_product_transients"))
							wc_delete_product_transients($ID);
					}
					
				}elseif($type === "1")
				{
//					if($parentid == 0)
					{//check if variable
						if($deleteinternal)
						{
//							if(is_object_in_term( $ID, 'product_type', 'variable' ))
							{
								$query = "SELECT ID from {$posts} WHERE post_parent={$ID} AND (post_type='revision')";
								$childids =  $wpdb->get_results($query);
								if(!is_wp_error($childids) && is_array($childids))
								{
									foreach($childids as $childobj)
									{
										$childid = $childobj->ID;
										do_action( 'before_delete_post',$childid);
										if($deleteattach)
										{
											$thumbid = get_post_meta($childid, '_thumbnail_id',true);
											wp_delete_attachment($thumbid,true);
										}
										$query = "DELETE FROM {$posts}
												  WHERE  {$posts}.ID={$childid}";
										$ret = $wpdb->query($query);
										if ( is_wp_error($ret) ) {
											return new WP_Error( 'db_query_error', 
												__( 'Could not execute query' ), $wpdb->last_error );
										} 
										$query = "DELETE FROM {$meta}
												  WHERE  {$meta}.post_id={$childid}";
										$ret = $wpdb->query($query);
										if ( is_wp_error($ret) ) {
											return new WP_Error( 'db_query_error', 
												__( 'Could not execute query' ), $wpdb->last_error );
										} 
										$query = "DELETE FROM {$term}
												  WHERE  {$term}.object_id={$childid}";
										$ret = $wpdb->query($query);
										if ( is_wp_error($ret) ) {
											return new WP_Error( 'db_query_error', 
												__( 'Could not execute query' ), $wpdb->last_error );
										} 
										do_action( 'delete_post',$childid);
									}
									if(function_exists("wc_delete_product_transients"))
										wc_delete_product_transients($ID);
								}
							}
						}
					}
					if($deleteattach)
					{
						$thumbid = get_post_meta($ID, '_thumbnail_id',true);
						wp_delete_attachment($thumbid,true);	
					}
					if($deleteinternal)
					{
						do_action( 'before_delete_post',$ID);
						$query = "DELETE FROM {$posts}
								  WHERE  {$posts}.ID={$ID}";
						$ret = $wpdb->query($query);
						if ( is_wp_error($ret) ) {
							return new WP_Error( 'db_query_error', 
								__( 'Could not execute query' ), $wpdb->last_error );
						} 
						$query = "DELETE FROM {$meta}
								  WHERE  {$meta}.post_id={$ID}";
						$ret = $wpdb->query($query);
						if ( is_wp_error($ret) ) {
							return new WP_Error( 'db_query_error', 
								__( 'Could not execute query' ), $wpdb->last_error );
						} 
						$query = "DELETE FROM {$term}
								  WHERE  {$term}.object_id={$ID}";
						$ret = $wpdb->query($query);
						if ( is_wp_error($ret) ) {
							return new WP_Error( 'db_query_error', 
								__( 'Could not execute query' ), $wpdb->last_error );
						} 
						do_action( 'delete_post',$ID);
					}
					if(!$deleteinternal)
					{
						wp_delete_post( $ID,true); 
					}
					
				}				
			}	
		}
	}

	public static function DuplicateProduct(&$arrrow,&$retarray)
	{
		global $wpdb;
		$posts = $wpdb->posts;
		$meta = $wpdb->postmeta;
		$term = $wpdb->term_relationships;
		
		$ID = (int)$arrrow['ID'];
			
		$parentid = 0;

		if($ID < 0) return;
		$post = get_post($ID);
		if($post === null || !is_object($post)) return;
		if($post->post_type === 'revision' ) return;
		
		$new_post_author    = wp_get_current_user();
		$new_post_date      = current_time( 'mysql' );
		$new_post_date_gmt  = get_gmt_from_date( $new_post_date );
		
		$post_parent = 0;
		$post_status = 'draft';
		if($post->post_type === 'attachment' )
			$post_status = 'inherit';
		$suffix = ' ' . '(Copy)';
		if ( $parentid > 0 ) 
		{
			$post_parent        = $parentid;
			$post_status        = 'publish';
			$suffix             = '';
		}
	    
		$arrpostdata = array(
				'post_author'               => $new_post_author->ID,
				'post_date'                 => $new_post_date,
				'post_date_gmt'             => $new_post_date_gmt,
				'post_content'              => $post->post_content,
				'post_content_filtered'     => $post->post_content_filtered,
				'post_title'                => $post->post_title . $suffix,
				'post_excerpt'              => $post->post_excerpt,
				'post_status'               => $post_status,
				'post_type'                 => $post->post_type,
				'comment_status'            => $post->comment_status,
				'ping_status'               => $post->ping_status,
				'post_password'             => $post->post_password,
				'to_ping'                   => $post->to_ping,
				'pinged'                    => $post->pinged,
				'post_modified'             => $new_post_date,
				'post_modified_gmt'         => $new_post_date_gmt,
				'post_parent'               => $post->post_parent,
				'menu_order'                => $post->menu_order,
				'post_mime_type'            => $post->post_mime_type
			);
			
		$new_post_id = wp_insert_post(
			$arrpostdata,
			true
		);
		if(is_wp_error($post_id))
		{
			return $post_id;
		}
//		$new_post_id = $wpdb->insert_id;
		
		
		$newvar = new stdClass();
		$newvar->ID = (string)$new_post_id;
		
		$newvar->post_type = $post->post_type;
		

		foreach($arrpostdata as $column => $value)
		{
			$newvar->{$column} = $value;
		}
		$newvar->post_parent = (string)$post->post_parent;
		
	
		self::duplicate_post_taxonomies( $post->ID, $new_post_id, $post->post_type,$post->post_parent);

		self::duplicate_post_meta( $post->ID, $new_post_id, $newvar);
		
		$retarray[] = $newvar;
	}
	
	public static function duplicateProducts(&$data,$count=1)
	{
		$retarray = array();
		
		$counter = 0;
		foreach($data as $arrrow)
		{
			if(!is_array($arrrow)) continue;
			$ID = 0;
			if(!array_key_exists('ID',$arrrow)) continue;
			{
				$counter = 0;
				while($counter < $count && $counter <= 100)
				{
					self::DuplicateProduct($arrrow,$retarray);
					$counter++;
				}
			}	
		}
		$total = 0;
		$hasnext = false;
		$isbegin = false;
		
		if(count($retarray) === 0) return $retarray;
		
		self::loadProducts(null,null,null,null,null,null,$total,false,false,$hasnext,$isbegin,false,null,null,null,null,null,$retarray);
		return $retarray;
	}
	
	public static function duplicate_post_taxonomies( $id, $new_id, $post_type, $post_parent = 0 ) 
	{

	
		$taxonomies = get_object_taxonomies( $post_type );
		
		foreach ( $taxonomies as $taxonomy ) 
		{

			$post_terms = wp_get_object_terms( $id, $taxonomy );
			$post_terms_count = sizeof( $post_terms );

			for ( $i=0; $i<$post_terms_count; $i++ ) 
			{
				wp_set_object_terms( $new_id, $post_terms[$i]->slug, $taxonomy, true );
			}
		}
	}

	
	public static function duplicate_post_meta( $id, $new_id, &$postobject) 
	{
		global $wpdb;

		$post_meta_infos = $wpdb->get_results( $wpdb->prepare( "SELECT meta_key, meta_value FROM $wpdb->postmeta WHERE post_id=%d AND meta_key NOT IN ( 'total_sales', '_sku' );", absint( $id ) ) );

		if ( count( $post_meta_infos ) != 0 ) 
		{

			$sql_query_sel = array();
			$sql_query = "INSERT INTO $wpdb->postmeta (post_id, meta_key, meta_value) ";

			foreach ( $post_meta_infos as $meta_info ) 
			{
				$meta_key = $meta_info->meta_key;
				$meta_value = addslashes( $meta_info->meta_value );
				$postobject->{$meta_key} = $meta_value;
				$sql_query_sel[]= "SELECT $new_id, '$meta_key', '$meta_value'";
			}

			$sql_query.= implode( " UNION ALL ", $sql_query_sel );
			$wpdb->query($sql_query);
		}
	}
	
	public static function HandleCatParams(&$catparams)
	{
		$newarr = array();
		
		self::WriteDebugInfo("incchildren",null,array('entering handlecatparams'));
		
		$args = array(
		    'number'     => 99999,
		    'orderby'    => 'slug',
		    'order'      => 'ASC',
		    'hide_empty' => false,
		    'include'    => '',
			'fields'     => 'all'
		);

		$woo_categoriesouter = get_terms( 'category', $args );
		if(is_wp_error($woo_categoriesouter))
				return;
		foreach($catparams as $cat)
		{
			
			 $args = array(
		     'number'     => 99999,
		     'orderby'    => 'slug',
		     'order'      => 'ASC',
		     'hide_empty' => false,
		     'include'    => '',
			 'fields'     => 'all',
			 'child_of'    => (int)$cat
			);
			foreach($woo_categoriesouter as $categoryouter)
			{
			   if(!is_object($categoryouter)) continue;
			   if(!property_exists($categoryouter,'term_taxonomy_id')) continue;
			    if(!property_exists($categoryouter,'term_id')) continue;
			   if($categoryouter->term_taxonomy_id == $cat)
			   {
			       $args['child_of'] = $categoryouter->term_id;
				   break;
			   }
			};
			self::WriteDebugInfo("incchildren",null,array('child_of'.$cat));
			$woo_categories = get_terms( 'category', $args );
			if(is_wp_error($woo_categories))
				continue;
			foreach($woo_categories as $category)
			{
			    if(!is_object($category)) continue;
			    if(!property_exists($category,'term_taxonomy_id')) continue;
			    if(!property_exists($category,'term_id')) continue;
				if(!in_array($category->term_taxonomy_id,$catparams))
					$newarr[] = $category->term_taxonomy_id;
			};
		}
		$catparams = array_merge($catparams,$newarr);
	}
	
	public static function LoadAttributeTerms(&$attr,$name,$iter,$ball,&$attrmapslugtoname,$converttoutf8,$frontpage)
	{
		global $wpdb;
		$offset = $iter * 1000;
		$iter++;
		$limit = "LIMIT 1000 OFFSET {$offset}";
		$getquery = "SELECT term_id,term_taxonomy_id FROM {$wpdb->prefix}term_taxonomy WHERE taxonomy IN('pa_". $name ."') {$limit}";
		if($ball)
		{
			$getquery = "SELECT t.term_id,t.name,t.slug,tt.term_taxonomy_id,tt.parent FROM {$wpdb->prefix}terms as t INNER JOIN {$wpdb->prefix}term_taxonomy AS tt ON t.term_id= tt.term_id WHERE tt.taxonomy IN('pa_". $name ."') {$limit}";
		}
		$values = $wpdb->get_results($getquery);
		if(is_wp_error($values))
			return;
		foreach($values as $val)
		{
			if(!is_object($val)) continue;
			if(!property_exists($val,'term_taxonomy_id')) continue;
			$value          = new stdClass();
			$value->id      = $val->term_taxonomy_id;
			$value->term_id      = $val->term_id;
			if($ball)
			{
				$value->slug    = $val->slug;
				$value->name    = $val->name;
				$value->parent  = $val->parent;
				if(!$frontpage)
				{
					$val_name = substr($value->name,0,100);
					$val_name = preg_replace('/\s+/', ' ', trim($val_name));
					$value->name = $val_name;
					if($converttoutf8)
					{
						$value->name = mb_convert_encoding($value->name, "UTF-8");
					}
					$attrmapslugtoname[$value->term_id] = $val->taxonomy;
				}
			}
			$attr->values[]  = $value;
		}
		if(count($values) === 1000)
		{
			$curr_settings = get_option('w3exwabe_settings');
			if(!is_array($curr_settings))
				$curr_settings = array();
		
			$largetemp = array();
			if(isset($curr_settings['largeattributes']) && is_array($curr_settings['largeattributes']))
			{
				$largetemp = $curr_settings['largeattributes'];
				if(isset($largetemp[$name]) && $largetemp[$name] === "0")
				{
					return;
				}
			}
			self::LoadAttributeTerms($attr,$name,$iter,$ball,$attrmapslugtoname,$converttoutf8,$frontpage);
		}
		
//		if($ball)
//			{
//				$values     = get_terms( 'pa_' . $att->name, array('hide_empty' => false));
//				if(is_wp_error($values))
//					continue;
//				foreach($values as $val)
//				{
//					if(!is_object($val)) continue;
//					if(!property_exists($val,'term_taxonomy_id')) continue;
//					$value          = new stdClass();
//					$value->id      = $val->term_taxonomy_id;
//					$value->term_id      = $val->term_id;
//					if($ball)
//					{
//						$value->slug    = $val->slug;
//						$value->name    = $val->name;
//					//	$val_label = substr($value->slug,0,100);
//					//	$val_label = preg_replace('/\s+/', ' ', trim($val_label));
//					//	$value->slug = $val_label;
//						$val_name = substr($value->name,0,100);
//						$val_name = preg_replace('/\s+/', ' ', trim($val_name));
//						$value->name = $val_name;
//						if($converttoutf8)
//						{
//							$value->name = mb_convert_encoding($value->name, "UTF-8");
//						}
//	//					if($attrname !== '')
//	//					{
//	//						$attrmapslugtoname[$attrname.$value->slug] = $value->name;
//	//					}else
//	//					{
//	//						$attrmapslugtoname[$value->slug] = $value->name;
//	//					}
//						$attrmapslugtoname[$value->term_id] = $val->taxonomy;
//					}				
//					$value->parent  = $val->parent;
//					$att->values[]  = $value;
//				}
//			}else
//			{
//				$values   = $wpdb->get_results("select term_id,term_taxonomy_id from " . $wpdb->prefix . "term_taxonomy WHERE taxonomy='pa_" .$att->name. "'");
//				if(is_wp_error($values))
//					continue;
//				foreach($values as $val)
//				{
//					if(!is_object($val)) continue;
//					if(!property_exists($val,'term_taxonomy_id')) continue;
//					$value          = new stdClass();
//					$value->id      = $val->term_taxonomy_id;
//					$value->term_id      = $val->term_id;
//		
//					$att->values[]  = $value;
//				}
//			}
			
		
	}
	
	public static function exportProducts(&$data,&$children)
	{
		$dir = dirname(__FILE__);
		$dh  = opendir($dir);
		while (false !== ($filename = readdir($dh))) {
			$ibegin = strpos($filename,"temp.csv",0);
	 		if( $ibegin !== FALSE)
			{
				@unlink($dir."/".$filename);
			}
		}
		$randomint = rand();
		$purl = $dir. "/" .$randomint. "temp.csv";
		$df = fopen($purl, 'w');
		if($df)
		{
//			fputcsv($df, array_keys(reset($data)));
//			foreach ($data as $row) {
//			  fputcsv($df, $row);
//			}
			$data = stripslashes($data);
			if(function_exists('mb_convert_encoding'))
				$data = mb_convert_encoding($data, "UTF-8");
			fwrite($df, pack("CCC",0xef,0xbb,0xbf)); 
			fwrite($df,$data); 
			fclose($df);
		}
		return ($randomint ."temp.csv");
	}
	
	public static function convertSaveArrays(&$data,&$ids,&$children,&$cids,$vars = false)
	{
//		$newarr = array();
//		$ids = array();
		if($vars)
		{
			$counter = 0;
			foreach($data as $field => $items)
			{
				$itemsr = explode('#^#',$items);
				foreach($itemsr as $item)
				{
					$values = explode('$###',$item);
					if(count($values) !== 3) continue;
					$newarritem = array();
					$newarritem['post_parent'] = $values[0];
					$newarritem['attribute'] = $values[1];
					$newarritem['value'] = $values[2];
					if(array_key_exists($counter,$ids))
					{
						$ids[$counter][] = $newarritem;
					}else
					{
						$ids[$counter] = array();
						$ids[$counter][] = $newarritem;
					}
				}
				$counter++;
			}
			unset($data);
			return;
		}
		foreach($data as $field => $items)
		{
			$itemsr = explode('#^#',$items);
			foreach($itemsr as $item)
			{
				$values = explode('$###',$item);
				if(count($values) !== 3) continue;
				if(array_key_exists($values[0],$ids))
				{
					$arritem = &$ids[$values[0]];
					$arritem[$field] = $values[2];
				}else
				{
					$newarritem = array();
//					$newarr[] = $newarritem;
					$newarritem['ID'] = $values[0];
					$newarritem['post_parent'] = $values[1];
					$newarritem[$field] = $values[2];
					$ids[$values[0]] = $newarritem;
				}
//				$values[0]; //ID
//				$values[1]; //value
			}
		}
		unset($data);
		if(count($children) == 0) return;
		$itemsr = explode('#$',$children['children']);
		foreach($itemsr as $item)
		{
			$values = explode('#',$item);
			if(count($values) !== 4) continue;
			if(array_key_exists($values[0],$cids))
			{
				$arritem = &$cids[$values[0]];
				$newarritem['_regular_price'] = $values[2];
				$newarritem['_sale_price'] = $values[3];
			}else
			{
				$newarritem = array();
				$newarritem['ID'] = $values[0];
				$newarritem['parentid'] = $values[1];
				$newarritem['_regular_price'] = $values[2];
				$newarritem['_sale_price'] = $values[3];
				$cids[$values[0]] = $newarritem;
			}
		}
		unset($children);
	}
	
	public static function UpdateParentMeta($parentid,$taxonomy_slug,$bcreatevars = false)
	{
		$bdontcheckusedfor = true;
		$curr_settings = get_option('w3exwabe_settings');
		if(is_array($curr_settings))
		{
			if(isset($curr_settings['dontcheckusedfor']))
			{
				if($curr_settings['dontcheckusedfor'] == 0)
					$bdontcheckusedfor = false;
			}
		}
		if($bcreatevars)
			$bdontcheckusedfor = false;
		$patt = get_post_meta($parentid,'_product_attributes',true);
		$new_taxonomy_slug = sanitize_title( $taxonomy_slug );
		if(is_array($patt))
		{
			 if(isset($patt[$new_taxonomy_slug]))
			 {
			 	if(!$bdontcheckusedfor)
					$patt[$new_taxonomy_slug]["is_variation"] = 1;
			 }else
			 {
			 	$patt[$new_taxonomy_slug] = array();
				$patt[$new_taxonomy_slug]["name"] = $taxonomy_slug;
				$patt[$new_taxonomy_slug]["is_visible"]   = 0;
				$patt[$new_taxonomy_slug]["is_taxonomy"]  = 1;
				if($bdontcheckusedfor)
					$patt[$new_taxonomy_slug]["is_variation"] = 0;
				else
					$patt[$new_taxonomy_slug]["is_variation"] = 1;
				$patt[$new_taxonomy_slug]["value"]  = "";
				$patt[$new_taxonomy_slug]["position"] = count($patt);
			 }
			 update_post_meta($parentid,'_product_attributes',$patt);
		}else
		{
			$patt = array();
			$patt[$new_taxonomy_slug] = array();
			$patt[$new_taxonomy_slug]["name"] = $taxonomy_slug;
			$patt[$new_taxonomy_slug]["is_visible"]   = 0;
			$patt[$new_taxonomy_slug]["is_taxonomy"]  = 1;
			if($bdontcheckusedfor)
				$patt[$new_taxonomy_slug]["is_variation"] = 0;
			else
				$patt[$new_taxonomy_slug]["is_variation"] = 1;
			$patt[$new_taxonomy_slug]["value"]  = "";
			$patt[$new_taxonomy_slug]["position"] = 0;
			update_post_meta($parentid,'_product_attributes',$patt);
		}
		self::CallWooAction($parentid);
	}
	
	public static function FindCustomFields($data,$post_type,$auto = false)
	{
		global $wpdb;
		$meta = $wpdb->postmeta;
		$posts = $wpdb->posts;
		$query = "SELECT post_parent 
					FROM {$posts}
					WHERE ID={$data} AND (post_type='{$post_type}')";
		 if(self::$debugmode)
		 {
	 		$query = "SELECT post_parent 
				FROM {$posts}
				WHERE ID={$data}";
		 }
//		$metas =  $wpdb->get_var($query);
//		if(is_wp_error($metas) || $metas === NULL)
//		{
//			return -1;
//		}		
		$query = "SELECT meta_key,meta_value from {$meta} WHERE post_id={$data} AND meta_key NOT IN ('_wp_attachment_image_alt','_edit_lock','_edit_last','_thumbnail_id')";
//		$query = "SELECT meta_key,meta_value from {$meta} WHERE post_id={$data} AND meta_key NOT IN ('_regular_price','_sale_price','_sku','_weight','_length','_width','_height','_stock','_stock_status','_visibility','_virtual','_download_type','_download_limit','_download_expiry','_downloadable_files','_downloadable','_sale_price_dates_from','_sale_price_dates_to','_tax_class','_tax_status','_backorders','_manage_stock','_featured','_purchase_note','_sold_individually','_product_url','_button_text','_thumbnail_id','_product_image_gallery','_upsell_ids','_crosssell_ids','_product_attributes','_default_attributes','_price','_edit_lock','_edit_last','_min_variation_price','_max_variation_price','_min_price_variation_id','_max_price_variation_id','_min_variation_regular_price','_max_variation_regular_price','_min_regular_price_variation_id','_max_regular_price_variation_id','_min_variation_sale_price','_max_variation_sale_price','_min_sale_price_variation_id','_max_sale_price_variation_id','_file_paths','_variation_description') AND meta_key NOT LIKE 'attribute_%'";
		if($auto)
		{
			$query = "SELECT 
				ID
				FROM {$posts}
				WHERE {$posts}.post_type='{$post_type}' ORDER BY ID LIMIT 100";
			$metas =  $wpdb->get_results($query);
			$prodids = "";
			foreach($metas as $meta1)
			{
				if($prodids === "")
					$prodids = $meta1->ID;
				else
					$prodids = $prodids.','.$meta1->ID;
			}
			$query = "SELECT DISTINCT meta_key,meta_value from {$meta} WHERE post_id IN ({$prodids}) AND meta_key NOT IN ('_wp_attachment_image_alt','_edit_lock','_edit_last','_thumbnail_id') AND meta_value !=''";
			
		 }
		 if(self::$debugmode && !$auto)
		 {
	 		$query = "SELECT meta_key,meta_value from {$meta} WHERE post_id={$data}";
		 }
		$metas =  $wpdb->get_results($query);
		return $metas;
	}
	
	public static function FindCustomTaxonomies($post_type)
	{
		$taxonomies = get_taxonomies(array('object_type' => array($post_type),'_builtin' => false)); 
		$metas = array();
		$attributes = array();
		$attrmapslugtoname = array();
		
		foreach ( $taxonomies as $taxonomy ) 
		{
			if($taxonomy !== "product_tag" && $taxonomy !== "category" && $taxonomy !== "product_shipping_class" && $taxonomy !== "product_type")
			{
				$hasit = false;
				if(is_array($attributes) && !empty($attributes))
				{
					foreach($attributes as $attr)
					{
						if($taxonomy === 'pa_'.$attr->name)
						{
							$hasit = true;
							break;
						}
				    }
				}
				if(!$hasit)
				{
					$taxobj = new stdClass();
					$taxobj->tax = $taxonomy;
					$taxobj->terms = "";
					$args = array(
					    'number'     => 99999,
					    'orderby'    => 'slug',
					    'order'      => 'ASC',
					    'hide_empty' => false,
					    'include'    => '',
						'fields'     => 'all'
					);

					$woo_categories = get_terms($taxonomy, $args );
					$termname = "";
					$counter  = 0;
					foreach($woo_categories as $category)
					{
					    if(!is_object($category)) continue;
					    if(!property_exists($category,'name')) continue;
					    if(!property_exists($category,'term_id')) continue;
						$catname = str_replace('"','\"',$category->name);
						$catname = trim(preg_replace('/\s+/', ' ', $catname));
					   	if($termname === "")
						{
							$termname = $catname;
						}else
						{
							$termname.= ', '. $catname;
						}
						
						if($counter >= 2) break;
						
						$counter++;
					}
					$taxobj->terms = $termname;
					$metas[] = $taxobj;
				}
			}
		}
		return $metas;
	}
	
	public static function GetFrontPageInfo(&$attributes,&$attributes_mapped,&$attributes_slugs_mapped,&$attr_bulk)
	{
		$attributes1 = array();
		$attrmapslugtoname = array(); 
	}
	
	public static function LoadProductsFields(&$dataids,&$retarray,$customparam = NULL)
	{
		if(isset($_POST['colstoload']))
		{
			self::$columns = $_POST['colstoload'];
		}
			
		if(isset($_POST['colstoloadids']))
		{
			$dataids = explode(",",$_POST['colstoloadids']);
		}
		if(empty($dataids))
			return false;
		
		$post_type = 'post';
		if(isset($_POST['post_type']))
			$post_type = $_POST['post_type'];
						
		$counter = 0;
		foreach($dataids as $arrrow)
		{
			$var = new stdClass();
			$var->ID = $arrrow;
			$retarray[] = $var;
		}
		$total = 0;
		$hasnext = false;
		$isbegin = false;
		global $wpdb;
		$which = "";
		$which = self::PrepareQuery("wp_posts");
		if($which !== "")
			$which = ",".$which;
		$query = "SELECT CASE WHEN p1.post_parent = 0 THEN p1.ID ELSE p1.post_parent END AS Sort,
		p1.ID,p1.post_parent,p1.post_type{$which}
		FROM {$wpdb->posts} p1
		ORDER BY Sort DESC";
		$info = $wpdb->get_results($query);
		if(is_wp_error($info))
			return false;
		foreach($info as $id)
		{
			foreach($retarray as $item)
			{
				if($item->ID === $id->ID)
				{
					foreach ($id as $key => $value) 
					{
					    $item->{$key} = $id->{$key};
					}
					break;
				}
			}
			
		}
		self::loadProducts(null,null,null,null,null,$customparam,$total,false,false,$hasnext,$isbegin,false,null,null,null,null,null,$retarray);
		return true;
	}
	
    public static function ajax()
    {
		$nonce = $_POST['nonce'];
		if(!wp_verify_nonce( $nonce, 'w3ex-word-advbedit-nonce' ) )
		{
			$arr = array(
			  'success'=>'no-nonce',
			  'products' => array()
			);
			echo json_encode($arr);
			die();
		}

		$type = $_POST['type'];
		
		$data = array();
		if(isset($_POST['data']))
			$data = $_POST['data'];
		$children = array();
		if(isset($_POST['children']))
			$children = $_POST['children'];
		$columns = array();
		if(isset($_POST['columns']))
			$columns = $_POST['columns'];
		$extrafield = '';
		if(isset($_POST['extrafield']))
			$extrafield = $_POST['extrafield'];
		$response = '';
		$arr = array(
		  'success'=>'yes',
		  'products' => array()
		);
		$total = 0;
		$ispagination = false;
		$isnext = true;
		if(isset($_POST['ispagination']))
		{
			if($_POST['ispagination'] == "true")
				$ispagination = true;
		}
		if(isset($_POST['isnext']))
		{
			if($_POST['isnext'] == "false")
				$isnext = false;
		}
		self::$bwoosave = false;
		self::$bsavepost = false;
		$curr_settings = get_option('w3exwabe_settings');
		if(is_array($curr_settings))
		{
			if(isset($curr_settings['calldoaction']))
			{
				if($curr_settings['calldoaction'] == 1)
				{
					self::$bwoosave = true;
				}
			}
			if(isset($curr_settings['calldosavepost']))
			{
				if($curr_settings['calldosavepost'] == 1)
				{
					self::$bsavepost = true;
				}
			}
			if(isset($curr_settings['debugmode']))
			{
				if($curr_settings['debugmode'] == 1)
				{
					self::$debugmode = true;
				}
			}
			if(isset($curr_settings['iswoocostog']) && $curr_settings['iswoocostog'] == 1)
			{
				self::$bhandlewoocog = true;
			}
		}

		global $wpdb;
		
		switch($type){
			case 'newattribute':
			{
				if(isset($_POST['name']) && isset($_POST['attrslug']))
				{
					$ret = array();
					$args = array();
					$iscat = false;
					if(isset($_POST['iscat']))
						$iscat = true;
					if(isset($_POST['slug']))
					{
						$args['slug'] = $_POST['slug'];
					}
					if(isset($_POST['parent']))
					{
						$args['parent'] = $_POST['parent'];
						$parent = (int)$_POST['parent'];
						$level = 1;
						if($parent > 0)
						{
							while(true)
							{
								$term = get_term( $parent, 'category' );
								if(is_wp_error($term))
									break;
								if($term->parent === 0)
									break;
								$parent = $term->parent;
								$level++;
							}
						}
						$arr['level'] = $level;
					}
					$attrslug = $_POST['attrslug'];
					$ret = wp_insert_term($_POST['name'],$attrslug,$args);
					if(is_wp_error($ret))
					{
						$arr['success'] = 'no';
						$arr['products'] = $ret;
						echo json_encode($arr);
						return;
					}
					$arr['products'] = $ret;
					$term = get_term( $ret['term_id'], $attrslug );
				}
			}break;
			case 'loadfrontpageinfo':
			{
				$attributes = new stdClass();
				$attributes_mapped = new stdClass();
				$attributes_slugs_mapped = new stdClass();
				$attr_cols = new stdClass();
				$attr_bulk = new stdClass();
				self::GetFrontPageInfo($attributes,$attributes_mapped,$attributes_slugs_mapped,$attr_bulk);
				$arr['attributes'] = $attributes;
				$arr['attributes_mapped'] = $attributes_mapped;
				$arr['attributes_slugs_mapped'] = $attributes_slugs_mapped;
				$arr['attr_bulk'] = $attr_bulk;
			}break;
			case 'loadproducts':
			{
				$titleparam = NULL;
				if(isset($_POST['titleparam']))
				   $titleparam = $_POST['titleparam'];
				$catparams = NULL;
				if(isset($_POST['catparams']))
					$catparams = $_POST['catparams'];
				$categoryor = false;
				if(isset($_POST['categoryor']))
					$categoryor = true;	
				$attrparams = NULL;
				if(isset($_POST['attrparams']))
					$attrparams = $_POST['attrparams'];
				$priceparam = NULL;
				if(isset($_POST['priceparam']))
					$priceparam = $_POST['priceparam'];
				$saleparam = NULL;
				if(isset($_POST['saleparam']))
					$saleparam = $_POST['saleparam'];
				$customparam = NULL;
				if(isset($_POST['customparam']))
					$customparam = $_POST['customparam'];
				$skuparam = NULL;
				if(isset($_POST['skuparam']))
				   $skuparam = $_POST['skuparam'];
				$tagsparams = NULL;
				if(isset($_POST['tagsparams']))
					$tagsparams = $_POST['tagsparams'];
				$descparam = NULL;
				if(isset($_POST['descparam']))
					$descparam = $_POST['descparam'];
				$shortdescparam = NULL;
				if(isset($_POST['shortdescparam']))
					$shortdescparam = $_POST['shortdescparam'];
				$reserved = NULL;
//				if(isset($_POST['post_type']))
//					$reserved  = $_POST['post_type'];
				$hasnext = false;
				$isbegin = false;
//				break;
				if(isset($_POST['isvariations']))
				{
					$curr_settings = get_option('w3exwabe_settings');
					if(!is_array($curr_settings))
						$curr_settings = array();
					if($_POST['isvariations'] === "true")
						$curr_settings['isvariations'] = 1;
					else
						$curr_settings['isvariations'] = 0;
					update_option('w3exwabe_settings',$curr_settings);
				}
				$custsearchparam = array();
				if(isset($_POST['custsearchparam']))
					$custsearchparam = $_POST['custsearchparam'];
//				$extrainfo = 
				self::$columns = $columns;
				$ret = self::loadProducts($titleparam,$catparams,$attrparams,$priceparam,$saleparam,$customparam,$total,$ispagination,$isnext,$hasnext,$isbegin,$categoryor,$skuparam,$tagsparams,$descparam,$shortdescparam,$custsearchparam,NULL);
				if(is_wp_error($ret) || -1 === $ret)
				{
					$arr['success'] = 'no';
					if(is_wp_error($ret))
					{
						$arr['error'] = $ret;
						echo json_encode($arr);
						return;
					}
				}
				$arr['products'] = $ret;
				$arr['mapattrs'] = self::$mapcustom;
				self::$mapcustom = array();
				$arr['total'] = $total;
				$arr['hasnext'] = $hasnext;
				$arr['isbegin'] = $isbegin;
			}break;
			case 'getdebuginfo':
			{
//				$curr_settings = get_option('w3exwabe_settings');
//				if(!is_array($curr_settings))
//					$curr_settings = array();
//				$retstr = $curr_settings['debuginfo'];
				$retstr = "";
				$retarr = get_option('w3exwabe_debuginfo');
				if(!is_array($retarr))
					$retarr = array();
				foreach($retarr as  $value)
				{
					if($value !== "")
						$retstr.= '<br/>'.$value;
				}
				
				$arr['debuginfo'] = $retstr;
			}break;
			case 'saveproducts':
			{
				
				$newarr = array();
				$newcarr = array();
				$currentpos = -1; //-1 for no batches
				$batchnumber = 50;
				$settings = get_option('w3exwabe_settings');
				if(!is_array($settings)) $settings = array();
				
				
				if(!isset($settings['savebatch']))
				{
					$settings['savebatch'] = 50;
				}
				
				if(isset($settings['savebatch']) && is_numeric($settings['savebatch']))
				{	
					$currentpos = 0;
					$batchnumber = (int)$settings['savebatch'];
					if(isset($settings['currentbatch']) && is_numeric($settings['currentbatch']))
					{
						$currentpos = (int)$settings['currentbatch'];
						if($currentpos === -1)
							$currentpos = 0;
					}
					if(isset($_POST['isfirst']))
					{
						$currentpos = 0;
						$settings['currentbatch'] = 0;
					}
				}
				
				self::convertSaveArrays($data,$newarr,$children,$newcarr);
				$ret = self::saveProducts($newarr,$newcarr,$currentpos,$batchnumber);
				if(!is_wp_error($ret) && is_array($ret))
					$arr['products'] = $ret;
				if(!is_array($settings)) $settings = array();
				if($currentpos !== -1)
				{
					$currentprodnumber = $currentpos * $batchnumber;
					if($currentprodnumber < count($newarr))
					{
						$settings['currentbatch'] = $currentpos;
						$arr['savingbatch'] = $currentpos;
						$arr['hasmore'] = 1;
					}else
					{
						$settings['currentbatch'] = -1;
						$arr['hasmore'] = 0;
					}
					$arr['totalcount'] = count($newarr);
					$arr['totalbatches'] = $settings['savebatch'];
				}else
				{
					$settings['currentbatch'] = -1;
					$arr['hasmore'] = 0;
				}
				if(isset($_POST['filters']))
				   $settings['filterstate'] = $_POST['filters'];
				update_option('w3exwabe_settings',$settings);
				$post_type = 'post';
				if(isset($_POST['post_type']))
					$post_type = $_POST['post_type'];
//				$newcolumns = get_option('w3exwabe_columns');
//				if(!is_array($newcolumns))
//					$newcolumns = array();
//				$newcolumns[$post_type] = $columns;
				if(isset($_POST['columns']))
					update_option('w3exwabe_columns',$columns);
//				update_option('w3exwabe_columns',$columns);
			}break;
			case 'getcustomslugs':
			{
				$ret = array();
				foreach($data as $valuearr)
				{
					$ret[$valuearr['name']] = sanitize_title($valuearr['name']);
					$ret[$ret[$valuearr['name']]] = $valuearr['name'];
					$values = array_map( 'trim', explode( WC_DELIMITER, $valuearr['value'] ) );
					foreach ( $values as $value ) 
					{
						if(!isset($ret[$value]))
						{
							$ret[$value] = sanitize_title($value);
						}
//						$ret[$ret[$value]] = $value;
					} 
				}
				$arr['products'] = $ret;
			}break;
			case 'newview':
			{
				if(isset($_POST['viewname']) && isset($_POST['columns']))
				{
					$curr_settings = get_option('w3exwabe_views');
					if(!is_array($curr_settings))
					{
						$curr_settings = array();
					}
					$curr_settings[$_POST['viewname']] = $_POST['columns'];
					update_option('w3exwabe_views',$curr_settings);
					update_option('w3exwabe_columns',$data);
				}
			}break;
			case 'editviews':
			{
				update_option('w3exwabe_views',$data);
			}break;
			case 'createvariations':
			{
				$newarr = array();
				$newcarr = array();
				self::convertSaveArrays($data,$newarr,$children,$newcarr,true);
				$skipdups = true;
				if(!isset($_POST['skipdups']))
				{
					$skipdups = false;
				}else
				{
					$skipdups = true;
				}
				$currentpos = 0;
				$batchnumber = 3;
				$settings = get_option('w3exwabe_settings');
				if(!is_array($settings))
					$settings = array();
				{
//					if(isset($settings['savebatch']) && is_numeric($settings['savebatch']))
					{	
						$currentpos = 0;
						if(isset($_POST['firstbatch']))
							$settings['currentbatchvars'] = 0;
						if(isset($settings['currentbatchvars']) && is_numeric($settings['currentbatchvars']))
						{
							$currentpos = (int)$settings['currentbatchvars'];
							if($currentpos === -1)
								$currentpos = 0;
						}
					}
				}
				$ret = self::addVariations($newarr,$newcarr,$currentpos,$batchnumber,$skipdups);
				if(is_wp_error($ret) || -1 === $ret)
				{
					$arr['success'] = 'no';
					if(is_wp_error($ret))
					{
						$arr['error'] = $ret;
						echo json_encode($arr);
						return;
					}
				}
				$currentpos++;
				if($currentpos !== -1)
				{
					$currentprodnumber = $currentpos * $batchnumber;
//					if($currentprodnumber < count($newarr))
					{
						$settings['currentbatchvars'] = $currentpos;
						$arr['savingbatch'] = $currentpos;
						$arr['hasmore'] = 1;
					}
//					else
//					{
//						$settings['currentbatchvars'] = -1;
//						$arr['hasmore'] = 0;
//					}
				}else
				{
					$settings['currentbatchvars'] = -1;
					$arr['hasmore'] = 0;
				}
				update_option('w3exwabe_settings',$settings);
				$arr['products'] = $ret;
				if(!empty(self::$mapcustom))
				{
					$arr['mapattrs'] = self::$mapcustom;
					self::$mapcustom = array();
				}
			}break;
			case 'createproducts':
			{
				$prodcount = 1;
				if(isset($_POST['prodcount']))
				{
					$prodcount = (int)$_POST['prodcount'];
					if($prodcount < 1)
						$prodcount = 1;
					if($prodcount > 100)
						$prodcount = 100;	
				}
				$ret = self::addProducts($prodcount);
				if(is_wp_error($ret) || -1 === $ret)
				{
					$arr['success'] = 'no';
					if(is_wp_error($ret))
					{
						$arr['error'] = $ret;
						echo json_encode($arr);
						return;
					}
				}
				$arr['products'] = $ret;
			}break;
			case 'duplicateproducts':
			{
				$newarr = array();
				$newcarr = array();
				$count = 1;
				if(isset($_POST['dupcount']))
				{
					$count = $_POST['dupcount'];
					$count = (int)$count;
					if($count <= 0) $count = 1;
					if($count > 100) $count = 100;
				}
				self::convertSaveArrays($data,$newarr,$children,$newcarr);
				$ret = self::duplicateProducts($newarr,$count);
				if(is_wp_error($ret) || -1 === $ret)
				{
					$arr['success'] = 'no';
					if(is_wp_error($ret))
					{
						$arr['error'] = $ret;
						echo json_encode($arr);
						return;
					}
				}
				$arr['products'] = $ret;
			}break;
			case 'loadparents':
			{
				$retarray = array();
		
				$counter = 0;
				foreach($data as $arrrow)
				{
					$var = new stdClass();
					$var->ID = $arrrow;
					$retarray[] = $var;
				}
				$total = 0;
				$hasnext = false;
				$isbegin = false;
				global $wpdb;
				$query = "SELECT CASE WHEN p1.post_parent = 0 THEN p1.ID ELSE p1.post_parent END AS Sort,
				p1.ID,p1.post_title,p1.post_parent,p1.post_status,p1.post_content,p1.post_excerpt,p1.post_name,p1.post_date,p1.comment_status,p1.menu_order,p1.post_type
				FROM {$wpdb->posts} p1
				ORDER BY Sort DESC";
				$info = $wpdb->get_results($query);
				foreach($info as $id)
				{
					foreach($retarray as $item)
					{
						if($item->ID === $id->ID)
						{
							$item->post_title = $id->post_title;
							$item->post_parent = $id->post_parent;
							$item->post_status = $id->post_status;
							$item->post_content = $id->post_content;
							$item->post_excerpt = $id->post_excerpt;
							
							$item->post_name = $id->post_name;
							$item->post_date = $id->post_date;
							$item->comment_status = $id->comment_status;
							$item->menu_order = $id->menu_order;
							$item->post_type = $id->post_type;
							break;
						}
					}
					
				}
				self::loadProducts(null,null,null,null,null,null,$total,false,false,$hasnext,$isbegin,false,null,null,null,null,null,$retarray);
				
				if(is_wp_error($retarray) || -1 === $retarray)
				{
					$arr['success'] = 'no';
					if(is_wp_error($retarray))
					{
						$arr['error'] = $retarray;
						echo json_encode($retarray);
						return;
					}
				}
				$arr['products'] = $retarray;
			}break;
			case 'deleteproducts':
			{
				$newarr = array();
				$newcarr = array();
				$currentpos = 0;
				$batchnumber = 3;
				self::convertSaveArrays($data,$newarr,$children,$newcarr);
				$deltype = "0";
				if(isset($_POST['deletetype']))
				{
					$deltype = $_POST['deletetype'];
				}
				$deleteinternal = false;
				$settings = get_option('w3exwabe_settings');
				if(is_array($settings))
				{
					if(isset($settings['deleteinternal']))
					{
						if($settings['deleteinternal'] === "1")
						{
							$deleteinternal = true;
						}
					}
					{	
						$currentpos = 0;
						if(isset($_POST['firstbatch']))
							$settings['currentbatchvars'] = 0;
						if(isset($settings['currentbatchvars']) && is_numeric($settings['currentbatchvars']))
						{
							$currentpos = (int)$settings['currentbatchvars'];
							if($currentpos === -1)
								$currentpos = 0;
						}
					}
				}
				self::deleteProducts($newarr,$deltype,$currentpos,$batchnumber,$deleteinternal);
				$currentpos++;
				if($currentpos !== -1)
				{
					$currentprodnumber = $currentpos * $batchnumber;
					{
						$settings['currentbatchvars'] = $currentpos;
						$arr['savingbatch'] = $currentpos;
						$arr['hasmore'] = 1;
					}
				}else
				{
					$settings['currentbatchvars'] = -1;
					$arr['hasmore'] = 0;
				}
				update_option('w3exwabe_settings',$settings);
			}break;
			case 'savecolumns':
			{
				
				if(!empty($data))
				{
//					$newcolumns = get_option('w3exwabe_columns');
//					if(!is_array($newcolumns))
//						$newcolumns = array();
//					$newcolumns[$post_type] = $data;
					update_option('w3exwabe_columns',$data);
				}
				$retarray = array();
				$dataids = array();
				
				if(self::LoadProductsFields($dataids,$retarray))
				{
					if(is_wp_error($retarray) || -1 === $retarray)
					{
						$arr['success'] = 'no';
						if(is_wp_error($retarray))
						{
							$arr['error'] = $retarray;
							echo json_encode($retarray);
							return;
						}
					}
					$arr['products'] = $retarray;
				}
				
				
			}break;
			case 'savecustom':
			{
				if(isset($_POST['foreditor']))
				{
//					if(strpos($data,'attribute_') === 0 && strlen($data) > 10)
					{
						$taxname =  $data;
						$bulktext =  '<div class="'.$data.'">';
						$bulktext.= '<ul class="categorychecklist form-no-clear">';
						$args = array(
							'descendants_and_self'  => 0,
							'selected_cats'         => false,
							'popular_cats'          => false,
							'walker'                => null,
							'taxonomy'              => $taxname,
							'checked_ontop'         => true
						);
						ob_start();
						wp_terms_checklist( 0, $args );
						$bulktext.= ob_get_clean();
						$bulktext.= '</ul></div>';
						$arr['editortext'] = $bulktext;
						break;
					}
					
				}
				if(is_array($data) && !empty($data))
				{
					foreach($data as $keyout => $outarray)
					{
						foreach($outarray as $key => $innerarray)
						{
							if(isset($innerarray['type']))
							{
								if($innerarray['type'] === 'customh' || $innerarray['type'] === 'custom')
								{
									if(taxonomy_exists($key))
									{
	//									'<td>'
	//										.'<input id="set'.$key.'" type="checkbox" class="bulkset" data-id="'.$key.'" data-type="customtaxh"><label for="set'.$key.'">Set '.$key.'</label></td><td></td><td>'
										$bulktext = ' class="makechosen catselset" style="width:250px;" data-placeholder="select" multiple ><option value=""></option>';
											   $args = array(
											    'number'     => 99999,
											    'orderby'    => 'slug',
											    'order'      => 'ASC',
											    'hide_empty' => false,
											    'include'    => '',
												'fields'     => 'all'
											);

											$woo_categories = get_terms($key, $args );
											if(is_wp_error($woo_categories))
												continue;
											foreach($woo_categories as $category)
											{
											    if(!is_object($category)) continue;
											    if(!property_exists($category,'name')) continue;
											    if(!property_exists($category,'term_id')) continue;
												$catname = str_replace('"','\"',$category->name);
												$catname = trim(preg_replace('/\s+/', ' ', $catname));
											   	$bulktext.= '<option value="'.$category->term_id.'" >'.$catname.'</option>';
											}
											$bulktext.= '</select>';
											//</td><td></td>
											$arr[$key] = $bulktext;
											if($innerarray['type'] === 'customh')
											{
												$bulktext =  '<div class="'.$key.'">';
												$bulktext.= '<ul class="categorychecklist form-no-clear">';
												$args = array(
													'descendants_and_self'  => 0,
													'selected_cats'         => false,
													'popular_cats'          => false,
													'walker'                => null,
													'taxonomy'              => $key,
													'checked_ontop'         => true
												);
												ob_start();
												wp_terms_checklist( 0, $args );
												$bulktext.= ob_get_clean();
												$bulktext.= '</ul></div>';
												$arr[$key.'edit'] = $bulktext;
											}
									}
									continue;
								}
							}
						}
					}
				}
				$post_type = 'post';
				if(isset($_POST['post_type']))
					$post_type = $_POST['post_type'];
//				$newdata = get_option('w3exwabe_custom');
//				if(!is_array($newdata))
//					$newdata = array();
//				$newdata[$post_type] = $data;
				update_option('w3exwabe_custom',$data);
//				$arr['customfieldsdata'] = $data;
//				$newcolumns = get_option('w3exwabe_columns');
//				if(!is_array($newcolumns))
//					$newcolumns = array();
//				$newcolumns[$post_type] = $columns;
				update_option('w3exwabe_columns',$columns);
				$retarray = array();
				$dataids = array();
				$customparam = array();
				if(isset($_POST['colstoload']))
				{
					$customparam = $_POST['colstoload'];
				}
				if(self::LoadProductsFields($dataids,$retarray,$customparam))
				{
					if(is_wp_error($retarray) || -1 === $retarray)
					{
						$arr['success'] = 'no';
						if(is_wp_error($retarray))
						{
							$arr['error'] = $retarray;
							echo json_encode($retarray);
							return;
						}
					}
					$arr['products'] = $retarray;
				}
			}break;
			case 'exportproducts':
			{
				$filename = self::exportProducts($data,$children);
				$arr['products'] = plugin_dir_url(__FILE__).$filename;
			}break;
			case 'setthumb':
			{
				$itemids = explode(',',$data[0]);
				foreach($itemids as $id)
				{
					update_post_meta( $id , '_thumbnail_id', $data[1]);
					$query = "UPDATE {$wpdb->posts} SET post_parent='".$id."' WHERE ID={$data[1]}";
					$wpdb->query($query);
					self::CallWooAction($id);
				}
			}break;
			case 'setgallery':
			{
				$itemids = explode(',',$data[0]);
				$deleteattach = false;
				if(is_array($curr_settings))
				{
					if(isset($curr_settings['deleteimages']) && $curr_settings['deleteimages'] == 1)
					{
						$deleteattach = true;
					}
				}
				foreach($itemids as $id)
				{
					if($deleteattach)
					{
						$thumbids = get_post_meta($id, '_product_image_gallery',true);
						$oldids = explode(',',$thumbids);
						$newids =  explode(',',$data[1]);
						$idstodelete = array();
						$hasit = false;
						foreach($oldids as $oldid)
						{
							$hasit = false;
							foreach($newids as $newid)
							{
								if($oldid === $newid)
								{
									$hasit = true;
									break;
								}
							}
							if(!$hasit)
								$idstodelete[] = $oldid;
						}
						foreach($idstodelete as $idtodelete)
						{
							wp_delete_attachment($idtodelete,true);
						}
							
					}
//					if ( $wpdb->get_var( $wpdb->prepare( "SELECT post_type FROM {$posts} WHERE ID = %d", $id ) ) === "product_variation" ) 
//					{
//						update_post_meta( $id , 'variation_image_gallery', $data[1]);
//					}
					update_post_meta( $id , '_product_image_gallery', $data[1]);
					$query = "UPDATE {$wpdb->posts} SET post_parent='".$id."' WHERE ID={$data[1]}";
					$wpdb->query($query);
					self::CallWooAction($id);
				}
			}break;
			case 'removethumb':
			{
				$itemids = explode(',',$data[0]);
				$curr_settings = get_option('w3exwabe_settings');
				$deleteattach = false;
				if(is_array($curr_settings))
				{
					if(isset($curr_settings['deleteimages']) && $curr_settings['deleteimages'] == 1)
					{
						$deleteattach = true;
					}
				}
				foreach($itemids as $id)
				{
					
					if($deleteattach)
					{
						$thumbid = get_post_meta($id, '_thumbnail_id',true);
						wp_delete_attachment($thumbid,true);
					}
					delete_post_meta( $id , '_thumbnail_id');
					self::CallWooAction($id);
				}
				
			}break;
			case 'checkcustom':
			{
				if(!taxonomy_exists($extrafield))
				{
					$arr['error'] = 'does not exist';
				}
				
			}break;
			case 'findcustomfields':
			{
				$post_type = 'post';
				if(isset($_POST['post_type']))
					$post_type = $_POST['post_type'];
				$arr['customfields'] = self::FindCustomFields($data,$post_type);
				
			}break;
			case 'findcustomfieldsauto':
			{
				$post_type = 'post';
				if(isset($_POST['post_type']))
					$post_type = $_POST['post_type'];
				$arr['customfields'] = self::FindCustomFields($data,$post_type,true);
				
			}break;
			case 'findcustomtaxonomies':
			{
				$post_type = 'post';
				if(isset($_POST['post_type']))
					$post_type = $_POST['post_type'];
				$arr['customfields'] = self::FindCustomTaxonomies($post_type);
				
			}break;
			case 'savesettings':
			{
				$curr_settings = get_option('w3exwabe_settings');
				if(is_array($curr_settings))
				{
					$curr_settings['settgetall'] = $data['settgetall'];
					$curr_settings['settgetvars'] = $data['settgetvars'];
					if(isset($data['settlimit']))
						$curr_settings['settlimit'] = $data['settlimit'];
					if(isset($data['incchildren']))
						$curr_settings['incchildren'] = $data['incchildren'];
					if(isset($data['disattributes']))
						$curr_settings['disattributes'] = $data['disattributes'];
					if(isset($data['converttoutf8']))
						$curr_settings['converttoutf8'] = $data['converttoutf8'];
					if(isset($data['dontcheckusedfor']))
						$curr_settings['dontcheckusedfor'] = $data['dontcheckusedfor'];
					if(isset($data['showattributes']))
						$curr_settings['showattributes'] = $data['showattributes'];
					if(isset($data['bgetallvarstaxonomies']))
						$curr_settings['bgetallvarstaxonomies'] = $data['bgetallvarstaxonomies'];
					if(isset($data['disablesafety']))
						$curr_settings['disablesafety'] = $data['disablesafety'];
					if(isset($data['showprices']))
						$curr_settings['showprices'] = $data['showprices'];
					if(isset($data['showskutags']))
						$curr_settings['showskutags'] = $data['showskutags'];
					if(isset($data['showdescriptions']))
						$curr_settings['showdescriptions'] = $data['showdescriptions'];
					if(isset($data['showidsearch']))
						$curr_settings['showidsearch'] = $data['showidsearch'];
					if(isset($data['showstocksearch']))
						$curr_settings['showstocksearch'] = $data['showstocksearch'];
					if(isset($data['calldoaction']))
						$curr_settings['calldoaction'] = $data['calldoaction'];
					if(isset($data['calldosavepost']))
						$curr_settings['calldosavepost'] = $data['calldosavepost'];
					if(isset($data['confirmsave']))
						$curr_settings['confirmsave'] = $data['confirmsave'];
					if(isset($data['tableheight']))
						$curr_settings['tableheight'] = $data['tableheight'];
					if(isset($data['searchfiltersheight']))
						$curr_settings['searchfiltersheight'] = $data['searchfiltersheight'];
					if(isset($data['rowheight']))
						$curr_settings['rowheight'] = $data['rowheight'];
					if(isset($data['savebatch']))
						$curr_settings['savebatch'] = $data['savebatch'];
					if(isset($data['debugmode']))
						$curr_settings['debugmode'] = $data['debugmode'];
					if(isset($data['deleteimages']))
						$curr_settings['deleteimages'] = $data['deleteimages'];
					if(isset($data['deleteinternal']))
						$curr_settings['deleteinternal'] = $data['deleteinternal'];
					if(isset($data['largeattributes']))
						$curr_settings['largeattributes'] = $data['largeattributes'];
					else
						$curr_settings['largeattributes'] = array();
					update_option('w3exwabe_settings',$curr_settings);
				}else
				{
					update_option('w3exwabe_settings',$data);
				}
				if(isset($data['selcustomfields']))
				{
					$post_type = 'post';
					if(isset($_POST['post_type']))
						$post_type = $_POST['post_type'];
//					$newcolumns = get_option('w3exwabe_customsel');
//					if(!is_array($newcolumns))
//						$newcolumns = array();
//					$newcolumns[$post_type] = $data['selcustomfields'];
					update_option('w3exwabe_customsel',$data['selcustomfields']);
//					update_option('w3exwabe_customsel',$data['selcustomfields']);
				}
				else
					update_option('w3exwabe_customsel',array());
			}break;
			case 'savecheckshowthumbnails':
			{
				$curr_settings = get_option('w3exwabe_settings');
				if(!is_array($curr_settings))
					$curr_settings = array();
				$curr_settings['showthumbnails'] = $_POST['showthumbnails'];
				update_option('w3exwabe_settings',$curr_settings);
			}break;
			case 'saveopenimageforedit':
			{
				$curr_settings = get_option('w3exwabe_settings');
				if(!is_array($curr_settings))
					$curr_settings = array();
				$curr_settings['openimage'] = $_POST['openimage'];
				update_option('w3exwabe_settings',$curr_settings);
			}break;
			case 'saveusebuiltin':
			{
				$curr_settings = get_option('w3exwabe_settings');
				if(!is_array($curr_settings))
					$curr_settings = array();
				$curr_settings['usebuiltineditor'] = $_POST['usebuiltineditor'];
				update_option('w3exwabe_settings',$curr_settings);
			}break;
			case 'savesettingname':
			{
				$curr_settings = get_option('w3exwabe_settings');
				if(!is_array($curr_settings))
					$curr_settings = array();
				$curr_settings[$_POST['settingname']] = 1;
				update_option('w3exwabe_settings',$curr_settings);
			}break;

case 'load_taxonomy_terms':
{
    $taxonomy = isset($_POST['taxonomy']) ? sanitize_text_field($_POST['taxonomy']) : 'category';
    $search = isset($_POST['search']) ? sanitize_text_field($_POST['search']) : '';
    $limit = isset($_POST['limit']) ? intval($_POST['limit']) : 20;
    
    if (!empty($search)) {
        // Search query
        $terms_query = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT t.term_id, t.name, tt.term_taxonomy_id, tt.parent 
                FROM {$wpdb->terms} t 
                INNER JOIN {$wpdb->term_taxonomy} tt ON t.term_id = tt.term_id 
                WHERE tt.taxonomy = %s AND t.name LIKE %s
                ORDER BY t.name ASC 
                LIMIT %d",
                $taxonomy,
                '%' . $wpdb->esc_like($search) . '%',
                $limit
            )
        );
    } else {
        // No search - return top categories only
        $terms_query = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT t.term_id, t.name, tt.term_taxonomy_id, tt.parent 
                FROM {$wpdb->terms} t 
                INNER JOIN {$wpdb->term_taxonomy} tt ON t.term_id = tt.term_id 
                WHERE tt.taxonomy = %s
                ORDER BY t.name ASC 
                LIMIT %d",
                $taxonomy,
                $limit
            )
        );
    }
    
    $arr['terms'] = $terms_query;
}break;

			case 'load_users':
			{
				$blogusers = get_users( array( 
					'role__in' => array('editor', 'administrator', 'author'), 
					'fields' => array( 'ID', 'display_name' ),
					'number' => 1000
				));
				$arr['users'] = $blogusers;
				break;
			}
			default:
				break;
		}
//		echo self::json_encode1($arr);
//		$arr['products'] = 'ima razni';
//		$jason = json_encode($arr);
		if(function_exists('memory_get_usage'))
		{
			$usage = memory_get_usage();
			$text = 'Memory usage: '.round($usage /(1024 * 1024),2);
			$arr['memoryusage'] = $text;
		}
		echo json_encode($arr );
//		if(function_exists('mb_convert_encoding'))
//			echo 'ima q';
		return;
//		 switch (json_last_error()) {
//        case JSON_ERROR_NONE:
//            echo ' - No errors';
//        break;
//        case JSON_ERROR_DEPTH:
//            echo ' - Maximum stack depth exceeded';
//        break;
//        case JSON_ERROR_STATE_MISMATCH:
//            echo ' - Underflow or the modes mismatch';
//        break;
//        case JSON_ERROR_CTRL_CHAR:
//            echo ' - Unexpected control character found';
//        break;
//        case JSON_ERROR_SYNTAX:
//            echo ' - Syntax error, malformed JSON';
//        break;
//        case JSON_ERROR_UTF8:
//            echo ' - Malformed UTF-8 characters, possibly incorrectly encoded';
//        break;
//        default:
//            echo ' - Unknown error';
//        break;
//    }
//		echo json_last_error();
    }
}

W3ExWordABulkEditAjaxHandler::ajax();
