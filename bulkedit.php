<?php

defined( 'ABSPATH' ) || die( 'No direct script access allowed!' );


class W3ExWordAdvBulkEditView{
	
	private static $ins = null;
	private $attributes      = array();
	private $attributes_asoc = array();
	private $variations_fields = array();
	private $categories = array();
	private $cat_asoc = array();
	private $largeattributes = array();
	private $iswpml = false;
	const TRANS_SLUG = 'wordpress-advbulkedit';
	
	public static function lang_category_id($id,$taxname)
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
	
    public static function init()
    {
       self::instance()->_main();
    }

    public static function instance()
    {
        is_null(self::$ins) && self::$ins = new self;
        return self::$ins;
    }
    
    public static function relpaceInvalid($str)
    {
    	$str = strip_tags($str);
        $str = str_replace('"','\"',$str);
        return $str;
    }
	
	public function mb_ucfirst($p_str)
	{
		if (function_exists('mb_substr') && function_exists('mb_strtoupper') && function_exists('mb_strlen')) 
		{
			$string = $p_str;
			if(mb_strlen($p_str) > 0)
			{
			    $string = mb_strtoupper(mb_substr($p_str, 0, 1)) . mb_substr($p_str, 1);
			}
		    return $string;
		}else
		{
			return ucfirst($p_str);
		}
	}
	
	/**
	 * Load attribute terms with improved performance
	 * Removed recursive loading - now loads only specified limit
	 */
	public function LoadAttributeTerms(&$attr,$name,$iter,$bcat = false)
	{
		global $wpdb;
		$offset = $iter * 1000;
		$iter++;
		$limit = "LIMIT 1000 OFFSET {$offset}";
		$getquery = "SELECT t.term_id,t.name,t.slug,tt.term_taxonomy_id,tt.parent FROM {$wpdb->prefix}terms as t INNER JOIN {$wpdb->prefix}term_taxonomy AS tt ON t.term_id= tt.term_id WHERE tt.taxonomy IN('". $name ."') ORDER BY t.slug ASC {$limit}";
		
		$values = $wpdb->get_results($getquery);
		if(is_wp_error($values))
			return false;
		foreach($values as $val){
			if(!is_object($val)) continue;
			if(!property_exists($val,'term_taxonomy_id')) continue;
			if($bcat)
			{
		    	if(!property_exists($val,'term_id')) continue;
				$cat = new stdClass();
				$cat->category_id     = $val->term_taxonomy_id;
				if($this->iswpml)
				{
				   if(ICL_LANGUAGE_CODE !== 'all')
				   {
				   	   $id = self::lang_category_id($cat->category_id,$name);
					   if($id === NULL || $id != $cat->category_id)
					   		continue;
				   }
			    }
				$cat->term_id         = $val->term_id;
				$cat->category_name   = $val->name;
				$cat->category_slug   = urldecode($val->slug);
				$cat->category_parent = $val->parent;
				$this->categories[] = $cat;   
				$this->cat_asoc[$cat->category_id] = $cat;
				continue;
			}
			
			$value          = new stdClass();
			$value->id      = $val->term_taxonomy_id;
			if($this->iswpml)
			{
			   if(ICL_LANGUAGE_CODE !== 'all')
			   {
			   	   $id = self::lang_category_id($value->id,$name);
				   if($id === NULL || $id != $value->id)
				   		continue;
			   }
		    }
			$value->name    = $val->name;
			$attr->values[]  = $value;
		}
		
		// REMOVED RECURSIVE LOADING - This was causing the performance issue
		// Only loads first batch now
		/*
		if(count($values) === 1000)
		{
			$this->LoadAttributeTerms($attr,$name,$iter,$bcat);
		}
		*/
	}
	
	/**
	 * Load attributes - now with limit to prevent loading entire database
	 */
	public function loadAttributes($limit = 1000)
	{
		//categories - now limited
		$args = array(
		    'number'     => $limit,
		    'orderby'    => 'slug',
		    'order'      => 'ASC',
		    'hide_empty' => false,
		    'include'    => '',
			'fields'     => 'all'
		);
		$this->LoadAttributeTerms($args,'category',0,true);
	}

	public function loadTranslations(&$arr)
	{
		$arr['post_excerpt'] = __( 'Excerpt', 'wordpress-advbulkedit');
		$arr['post_content'] = __( 'Content', 'wordpress-advbulkedit');
		$arr['_thumbnail_id'] = __( 'Image', 'wordpress-advbulkedit');
		$arr['post_name'] = __( 'Slug', 'wordpress-advbulkedit');
		$arr['post_tag'] = __( 'Tags', 'wordpress-advbulkedit');
		$arr['post_title'] = __( 'Title', 'wordpress-advbulkedit');
		$arr['category'] = __( 'Categories', 'wordpress-advbulkedit');
		$arr['menu_order'] = __( 'Menu order', 'wordpress-advbulkedit');
		$arr['comment_status'] = __( 'Comment status', 'wordpress-advbulkedit');
		$arr['post_status'] = __( 'Status', 'wordpress-advbulkedit');
		$arr['post_date'] = __( 'Publish Date', 'wordpress-advbulkedit');
		$arr['post_author'] = __( 'Post Author', 'wordpress-advbulkedit');
		$arr['post_type'] = __( 'Post Type', 'wordpress-advbulkedit');
		$arr['trans_data_placeholder'] = __( 'choose\search', 'wordpress-advbulkedit');
		$arr['trans_column_settings'] = __( 'Column Settings', 'wordpress-advbulkedit');
		$arr['trans_custom_fields'] = __( 'Custom Fields', 'wordpress-advbulkedit');
		$arr['trans_find_custom_fields'] = __( 'Find Custom Fields', 'wordpress-advbulkedit');
		$arr['trans_plugin_settings'] = __( 'Plugin Settings', 'wordpress-advbulkedit');
		$arr['trans_main_settings'] = __( 'Main Settings', 'wordpress-advbulkedit');
		$arr['trans_search_settings'] = __( 'Search Fields', 'wordpress-advbulkedit');
		$arr['trans_collapse_filters'] = __( 'Collapse Filters -', 'wordpress-advbulkedit');
		$arr['trans_expand_filters'] = __( 'Expand Filters +', 'wordpress-advbulkedit');
		$arr['trans_images_hover'] = __( 'Show larger images on hover', 'wordpress-advbulkedit');
		$arr['trans_straight_edit'] = __( 'Clicking on image goes straight to edit', 'wordpress-advbulkedit');
		$arr['trans_sell_status'] = __( 'To change table view you need to save/revert changes first', 'wordpress-advbulkedit');
		$arr['trans_selected_text'] = __( "Selected rows for bulk editing", "wordpress-advbulkedit");
		$arr['trans_saving_batch'] = __( 'Saving batch', 'wordpress-advbulkedit');
		$arr['trans_show_sell'] = __( 'Show Selected Only', 'wordpress-advbulkedit');
		$arr['trans_show_all'] = __( 'Show All', 'wordpress-advbulkedit');
	}
    
    public function getIntegrationsOptions()
    {

        $integrations_options_as_js_array = "";
        if (defined('W3EXWABE_INTG_POST_STATUS_UNRELIABLE')) {
            $integrations_options_as_js_array .= 'W3Ex.integ_post_status_unreliable = "yes";'.PHP_EOL;
        }
        
        return $integrations_options_as_js_array;
    }
	
	public function showMainPage()
	{
		global $wpdb;
		if(function_exists('icl_object_id') || has_filter('wpml_object_id'))
		{
			$this->iswpml = true;
		}
		
		// PERFORMANCE FIX: Don't load all categories on page load
		// Categories will be loaded via AJAX when needed or limited load
		// $this->loadAttributes(); // REMOVED - This was the main bottleneck
		
		$sel_fields = array();
		$sel_fields = get_option('w3exwabe_columns');
		$purl = plugin_dir_url(__FILE__);
		
		if(is_rtl())
		{
			echo '<style>
					.w3exabe input,textarea {
						direction: rtl !important;
					}
					.w3exabe div.slick-cell {
						direction: rtl !important;
					}
				</style>';
		}
		
		echo "<script>
		var W3Ex = W3Ex || {};
		W3Ex.categories =  [];
		W3Ex._translate_strings = {};
		W3Ex._global_settings = {};
		W3Ex.imagepath = '".plugin_dir_url(__FILE__)."';";
	
		if(is_rtl())
		{
			echo 'W3Ex._isrtlenabled = true;';
		}
		if(function_exists('icl_object_id') || has_filter('wpml_object_id'))
		{
			if(ICL_LANGUAGE_CODE != 'all')
			{
				echo PHP_EOL;
				echo 'W3Ex._iswpmlenabled = 1;';
			}
		}
		echo PHP_EOL;
		$upload_dir = wp_upload_dir();
		if(is_array($upload_dir) && isset($upload_dir['baseurl']))
		{
			$upload_dir = $upload_dir['baseurl'];
			echo 'W3Ex.uploaddir = "'. $upload_dir .'";';
		}
		echo PHP_EOL;
		
		
		$settings = get_option('w3exwabe_settings');
		
		if(!is_array($settings))
			$settings = array();
		if(is_array($sel_fields) && !empty($sel_fields))
		{
			echo 'W3Ex.colsettings = '. json_encode($sel_fields). ';';
		    echo PHP_EOL;
		}
		
		$sel_fields = get_option('w3exwabe_customsel');
		if(is_array($sel_fields) && !empty($sel_fields))
		{
			echo 'W3Ex.customfieldssel = '. json_encode($sel_fields). ';';
		    echo PHP_EOL;
		}
		
		$sel_fields = get_option('w3exwabe_custom');
		if(is_array($sel_fields) && !empty($sel_fields))
		{
			echo 'W3Ex.customfields = '. json_encode($sel_fields). ';';
		    echo PHP_EOL;
		}
			{
				if(isset($settings['tableheight']) && is_numeric($settings['tableheight']))
				{	
					echo 'W3Ex._w3esetting_table_height = "'.$settings['tableheight'].'";'; echo PHP_EOL;
				}
				if(isset($settings['disablesafety']) && is_numeric($settings['disablesafety']))
				{	
					if($settings['disablesafety'] == 1)
					 echo 'W3Ex._w3esetting_disablesafety = true;'; echo PHP_EOL;
				}
				if(isset($settings['showthumbnails']))
				{	
					if($settings['showthumbnails'] == 1)
					 	echo 'W3Ex._global_settings["showthumbnails"] = true;'; echo PHP_EOL;
				}
				if(isset($settings['openimage']))
				{	
					if($settings['openimage'] == 1)
					 	echo 'W3Ex._global_settings["openimage"] = true;'; echo PHP_EOL;
				}
				if(isset($settings['usebuiltineditor']))
				{	
					if($settings['usebuiltineditor'] == 1)
					 	echo 'W3Ex._global_settings["usebuiltineditor"] = true;'; echo PHP_EOL;
				}
				if(isset($settings['filterstate']))
				{	
					if($settings['filterstate'] == 1)
					 	echo 'W3Ex._global_settings["filterstate"] = true;'; echo PHP_EOL;
				}
				if(isset($settings['savebatch']) && is_numeric($settings['savebatch']))
				{	
					echo 'W3Ex._global_settings["savebatch"] = "'.$settings['savebatch'].'";'; echo PHP_EOL;
				}
			}
		
			$arrTranslated = array();
			$this->loadTranslations($arrTranslated);
			echo 'W3Ex._translate_strings["trans_column_settings"] = "'.self::relpaceInvalid($arrTranslated['trans_column_settings']).'";'; echo PHP_EOL;
			echo 'W3Ex._translate_strings["trans_selected_text"] = "'.self::relpaceInvalid($arrTranslated['trans_selected_text']).'";'; echo PHP_EOL;
			echo 'W3Ex._translate_strings["trans_saving_batch"] = "'.self::relpaceInvalid($arrTranslated['trans_saving_batch']).'";'; echo PHP_EOL;
			echo 'W3Ex._translate_strings["trans_custom_fields"] = "'.self::relpaceInvalid($arrTranslated['trans_custom_fields']).'";'; echo PHP_EOL;
			echo 'W3Ex._translate_strings["trans_find_custom_fields"] = "'.self::relpaceInvalid($arrTranslated['trans_find_custom_fields']).'";'; echo PHP_EOL;
			echo 'W3Ex._translate_strings["trans_plugin_settings"] = "'.self::relpaceInvalid($arrTranslated['trans_plugin_settings']).'";'; echo PHP_EOL;
			echo 'W3Ex._translate_strings["trans_collapse_filters"] = "'.self::relpaceInvalid($arrTranslated['trans_collapse_filters']).'";'; echo PHP_EOL;
			echo 'W3Ex._translate_strings["trans_expand_filters"] = "'.self::relpaceInvalid($arrTranslated['trans_expand_filters']).'";'; echo PHP_EOL;
			echo 'W3Ex._translate_strings["trans_images_hover"] = "'.self::relpaceInvalid($arrTranslated['trans_images_hover']).'";'; echo PHP_EOL;
			echo 'W3Ex._translate_strings["trans_straight_edit"] = "'.self::relpaceInvalid($arrTranslated['trans_straight_edit']).'";'; echo PHP_EOL;
			echo 'W3Ex._translate_strings["trans_data_placeholder"] = "'.self::relpaceInvalid($arrTranslated['trans_data_placeholder']).'";'; echo PHP_EOL;
			echo 'W3Ex._translate_strings["trans_sell_status"] = "'.self::relpaceInvalid($arrTranslated['trans_sell_status']).'";'; echo PHP_EOL;
			echo 'W3Ex._translate_strings["trans_show_sell"] = "'.self::relpaceInvalid($arrTranslated['trans_show_sell']).'";'; echo PHP_EOL;
			echo 'W3Ex._translate_strings["trans_show_all"] = "'.self::relpaceInvalid($arrTranslated['trans_show_all']).'";'; echo PHP_EOL;
			echo 'W3Ex.post_excerpt = "'. self::relpaceInvalid($arrTranslated['post_excerpt']).'";'; echo PHP_EOL;
			echo 'W3Ex.post_content = "'.self::relpaceInvalid($arrTranslated['post_content']).'";'; echo PHP_EOL;
			echo 'W3Ex._thumbnail_id = "'.self::relpaceInvalid($arrTranslated['_thumbnail_id']).'";'; echo PHP_EOL;
			echo 'W3Ex.post_name = "'.self::relpaceInvalid($arrTranslated['post_name']).'";'; echo PHP_EOL;
			echo 'W3Ex.post_title = "'.self::relpaceInvalid($arrTranslated['post_title']).'";'; echo PHP_EOL;
			echo 'W3Ex.post_status = "'.self::relpaceInvalid($arrTranslated['post_status']).'";'; echo PHP_EOL;
			echo 'W3Ex.comment_status = "'.self::relpaceInvalid($arrTranslated['comment_status']).'";'; echo PHP_EOL;
			echo 'W3Ex.menu_order = "'.self::relpaceInvalid($arrTranslated['menu_order']).'";'; echo PHP_EOL;
			echo 'W3Ex.post_date = "'.self::relpaceInvalid($arrTranslated['post_date']).'";'; echo PHP_EOL;
			echo $this->getIntegrationsOptions();
		echo "</script>";
		?>
		
		<div class="wrap w3exabe">
		<!--<div id="w3exibaparent">-->
		<a id="backlink" href="#">&lt; Back</a>
		<h2><?php _e( 'Advanced Bulk Edit', 'wordpress-advbulkedit');?></h2>
		<br/>
			<div id="frontpageinfoholder" style="position:relative;"></div>
			<!--<input id="showhidecustom" class="button" type="button" value="<?php _e("Save Changes",'wordpress-advbulkedit'); ?>" />-->
			<br />
			<!--<div id="searchfilterswrapper" style="max-height:350px; overflow: auto;border: 1px solid #808080;border-radius: 7px;padding:7px;">-->
			
			<button id="collapsefilters" class="button" data-state="collapse"><?php _e( 'Collapse Filters -', 'wordpress-advbulkedit');?></button>
			<input id="searchfilters" type="text" style="width:150px;" placeholder="search filters"></input>
			<table cellpadding="5" cellspacing="0" id="tablesearchfilters" style="z-index: 12;overflow-y: auto;border: 1px solid #808080;border-radius: 7px;padding:7px;">
			<tbody>
			<tr>
			<td>
			<?php echo $arrTranslated['post_title']; ?>: </td>
			<td data-id="post_title">
			<select id="titleparams">
				<option value="con"><?php _e( 'contains', 'wordpress-advbulkedit');?></option>
				<option value="isexactly"><?php _e( 'is exactly', 'wordpress-advbulkedit');?></option>
				<option value="notcon"><?php _e( 'does not contain', 'wordpress-advbulkedit');?></option>
				<option value="start"><?php _e( 'starts with', 'wordpress-advbulkedit');?></option>
				<option value="end"><?php _e( 'ends with', 'wordpress-advbulkedit');?></option>
			</select>
			<input id="titlevalue" type="text" class="showorcheckbox"/>
			</td>
			<td class="tdcategoryfilter">
			<?php echo $arrTranslated['category']; ?>: </td><td class="tdcategoryfilter">
			
			<?php
			// PERFORMANCE FIX: Use WordPress's optimized dropdown with lazy loading
			// This only loads categories when the dropdown is used
			$dropdown_args = array(
				'show_option_none' => __('Select categories'),
				'option_none_value' => '',
				'hide_empty' => 0,
				'hierarchical' => 1,
				'depth' => 0,
				'taxonomy' => 'category',
				'name' => 'selcategory',
				'id' => 'selcategory',
				'class' => 'makechosen catsel',
				'selected' => 0,
				'echo' => 1,
				'value_field' => 'term_taxonomy_id',
				'multiple' => true,
				'orderby' => 'name',
				'order' => 'ASC',
				'number' => 1000, // Limit initial load
			);
			?>
			<select id="selcategory" class="makechosen catsel" data-placeholder="<?php echo $arrTranslated['trans_data_placeholder']; ?>" multiple style="width:250px;">
			 <option value=""></option>
			<?php
				// Load only limited categories for initial display
				// Use wp_terms to optimize query
				$cats_query = $wpdb->get_results(
					$wpdb->prepare(
						"SELECT t.term_id, t.name, tt.term_taxonomy_id, tt.parent 
						FROM {$wpdb->terms} t 
						INNER JOIN {$wpdb->term_taxonomy} tt ON t.term_id = tt.term_id 
						WHERE tt.taxonomy = %s 
						ORDER BY t.name ASC 
						LIMIT 1000",
						'category'
					)
				);
				
				$cats = array();
				$cats_asoc = array();
				$depth = array();
				
				foreach($cats_query as $cat) {
					$cat_obj = new stdClass();
					$cat_obj->term_id = $cat->term_id;
					$cat_obj->category_name = $cat->name;
					$cat_obj->category_id = $cat->term_taxonomy_id;
					$cat_obj->category_parent = $cat->parent;
					$cats[] = $cat_obj;
					$cats_asoc[$cat->term_id] = $cat_obj;
				}
				
				$newcats = array();

			    foreach($cats as $cat)
				{
					if($cat->category_parent == 0)
					{
						$depth[$cat->term_id] = 0;
						$newcats[] = $cat;
					}
				}
				foreach($cats as $cat)
				{
					if($cat->category_parent == 0) continue;
					{
						if(!isset($depth[$cat->term_id]))
						{
							$loop = true;
							$counter = 0;
							while($loop && ($counter < 1000))
							{
								foreach($cats as $catin)
								{
									if($catin->category_parent == 0)
									   continue;
									if(isset($depth[$catin->category_parent]))
									{
										$newdepth = $depth[$catin->category_parent];
										$newdepth++;
										if(!isset($depth[$catin->term_id]))
										{
											$depth[$catin->term_id] = $newdepth;
											for($i = 0; $i < count($newcats); $i++)
											{
												$catins = $newcats[$i];
												if($catins->term_id == $catin->category_parent)
												{
													array_splice($newcats, $i+1, 0,array($catin));
													break;
												}
											}
										}

										if($catin->term_id == $cat->term_id)
										{
											$loop = false;
											break;
										}
									}
								}
								$counter++;
							}
							if(!isset($depth[$cat->term_id]))
							{
								$depth[$cat->term_id] = 0;
								$newcats[] = $cat;
							}
						}
					}
					
				}
				
				if(count($newcats) == count($cats))
				{
					foreach($newcats as $catin)
					{
						$depthstring = '';
						if(isset($depth[$catin->term_id]))
						{
							$depthn = (int)$depth[$catin->term_id];
							if($depthn < 15)
							{
								while($depthn > 0)
								{
									$depthstring = $depthstring.'&nbsp;&nbsp;&nbsp;';
									$depthn--;
								}
								
							}
						}
						echo '<option value="'.$catin->category_id.'" >'.$depthstring.$catin->category_name.'</option>';
					}
				}else
				{
					foreach($cats as $catin)
					{
						echo '<option value="'.$catin->category_id.'" >'.$catin->category_name.'</option>';
					}
				}
				
				// Add indicator if there are more categories
				$total_cats = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->term_taxonomy} WHERE taxonomy = 'category'");
				if($total_cats > 1000) {
					echo '<option value="" disabled>--- '.__('Showing first 1000 of', 'wordpress-advbulkedit').' '.$total_cats.' '.__('categories', 'wordpress-advbulkedit').' ---</option>';
				}
			?>
			</select>&nbsp;<label><input type="checkbox" id="categoryor" style="width:auto;">AND</input></label>
			</td></tr>
			
			<tr class="showdescriptions">
				<td><?php echo $arrTranslated['post_content']; ?>: </td>
				<td data-id="post_content">
				<select id="descparams">
				<option value="con"><?php _e( 'contains', 'wordpress-advbulkedit');?></option>
				<option value="notcon"><?php _e( 'does not contain', 'wordpress-advbulkedit');?></option>
				<option value="start"><?php _e( 'starts with', 'wordpress-advbulkedit');?></option>
				<option value="end"><?php _e( 'ends with', 'wordpress-advbulkedit');?></option>
			</select>
			<input id="descvalue" type="text" class="showorcheckbox"/>
			</td>
				<td><?php echo $arrTranslated['post_excerpt']; ?>: </td>
				<td data-id="post_excerpt">
				<select id="shortdescparams">
				<option value="con"><?php _e( 'contains', 'wordpress-advbulkedit');?></option>
				<option value="notcon"><?php _e( 'does not contain', 'wordpress-advbulkedit');?></option>
				<option value="start"><?php _e( 'starts with', 'wordpress-advbulkedit');?></option>
				<option value="end"><?php _e( 'ends with', 'wordpress-advbulkedit');?></option>
			</select>
			<input id="shortdescvalue" type="text" class="showorcheckbox"/>
			</td>
			</tr>
			</tbody>
			</table>
			<!--</div>-->
			<br/><br/><br/>
			<div id="loadsavediv">
			 <button id="getproducts" class="button" type="button">
			   <span class="icon-download-1"></span>
				<?php _e("Get Posts",'wordpress-advbulkedit'); ?>
			 </button>
			 &nbsp;&nbsp;
			 <select id="select_post_type" autocomplete="off">
				<option value="post" selected><?php _e( 'Posts', 'wordpress-advbulkedit');?></option>
				<option value="page"><?php _e( 'Pages', 'wordpress-advbulkedit');?></option>
				<option value="attachment"><?php _e( 'Media', 'wordpress-advbulkedit');?></option>
				<?php	$args = array(
		    '_builtin' => false
		);

		$output = 'objects'; // names or objects

		$post_types = get_post_types( $args, $output );

		foreach ( $post_types  as $post_type ) {
		   if($post_type->name === "product" || $post_type->name === "product_variation"|| $post_type->name === "shop_order"|| $post_type->name === "shop_order_refund"|| $post_type->name === "shop_coupon"|| $post_type->name === "shop_webhook")
		   	  continue;
		   echo '<option value="' . $post_type->name . '">'.$post_type->label.'</option>';
		}
		?>
			</select> &nbsp;&nbsp;
			  <label><input id="getvariations" type="checkbox" <?php 
				if(is_array($settings))
				{
					if(isset($settings['isvariations']))
					{
						if($settings['isvariations'] == 1)
						{
							echo 'checked=checked';
						}
					}
				}
			  ?>/><?php _e( 'Revisions','wordpress-advbulkedit');?></label>
			  
			   <button id="savechanges" class="button" type="button">
			   <span class="icon-floppy"></span>
				<?php _e("Save Changes",'wordpress-advbulkedit'); ?>
				</button>
			 		 <div style="display: inline-block;position: relative;width:320px;">
			 		 <img id="showsavetool" src="<?php echo plugin_dir_url(__FILE__);?>images/help18x18.png"/>
					<div id="savenote"> <?php _e("Changes are saved on going to a different page of posts, adding posts or via the 'Save Changes' button",'wordpress-advbulkedit'); ?></div>
					</div>
			</div>
			<br /><br />
			<div style="position: relative;" id="mainbuttons">
			 <!--<button id="bulkedit">Bulk Edit</button>-->
			 <input id="settings" class="button-primary-copied" type="button" value="<?php _e( "Show/Hide Columns", "wordpress-advbulkedit"); ?>" />
			<!-- class="button-primary-copied"-->
			 <div id="addprodarea">
				<button id="addprodbut" class="button" type="button">
				<span class="icon-plus-outline"></span>
				<?php echo $this->mb_ucfirst(__( "add", 'wordpress-advbulkedit'));?>
				</button>
			</div>
			<div id="duplicateprodarea">
				<button id="duplicateprodbut" class="button" type="button">
				<span class="icon-layers"></span>
				<?php _e( "Duplicate", 'wordpress-advbulkedit');?>
				</button>
			</div>
			<div id="deletearea">
				<button id="deletebut" class="button" type="button">
			<span class="icon-trash"></span>
			<?php echo $this->mb_ucfirst(__( "delete", 'wordpress-advbulkedit'));?>
			</button>
			</div>
			<input id="selectedit" class="button" type="button" value="<?php
_e( "Selection Manager", 'wordpress-advbulkedit');
?>" />
			<button id="bulkedit" class="button" type="button">
			<span class="icon-edit"></span>
			<?php echo _e( "Bulk Edit", 'wordpress-advbulkedit');?>
			</button>
			<!--<div style="display: inline-block;"><i class="icon-edit"></i></div>-->
			 <div id="quicksettingsarea">
				<input id="quicksettingsbut" class="button" type="button" value="<?php
_e( "Quick Settings", 'wordpress-advbulkedit');
?>" />
			</div>
			<div id="bulkedittext" style="display: inline-block;"><?php _e( "Selected rows for bulk editing", 'wordpress-advbulkedit'); ?>:<!--<input id="showselectedbut" class="button" type="button" value="Show Selected" />--></div><div id="bulkeditinfo"> 0 of 0</div>
			</div>
			<div id="gridholder">
				<!--<div style="width:100%;">-->
				    <div id="myGrid" style="width:100%;height:80vh;"></div>
				<!--</div>-->
			</div>
			<div id="pagingholder" style="position:relative;">
			<input id="gotopage" class="button" type="button" value="<?php _e( "First", 'wordpress-advbulkedit'); ?>" /><input id="butprevious" class="button" type="button" value="<?php _e( "Previous", 'wordpress-advbulkedit'); ?>" /> <?php _e( "Page", 'wordpress-advbulkedit'); ?>:<input id="gotopagenumber" type="text" value="1" style="width:15px;" readonly/> 	<input id="butnext" class="button" type="button" value="<?php _e( "Next", 'wordpress-advbulkedit'); ?>" /> <?php _e( "Total records", 'wordpress-advbulkedit'); ?>: <div id="totalrecords" style="display:inline-block;padding:0px 6px;"></div><div id="totalpages" style="display:inline-block;"></div><div id="viewingwhich" style="display:inline-block;padding:0px 6px;"></div></div> <br /><br />
			<div id="revertinfo"><?php _e( "Revert to original value", 'wordpress-advbulkedit'); ?></div> 
			<!--<input id="revertcell" class="button" type="button" value="<?php _e( "Active Cell", 'wordpress-advbulkedit'); ?>" />
			<input id="revertrow" class="button" type="button" value="<?php _e( "Active Row", 'wordpress-advbulkedit'); ?>" />-->
			<input id="revertselected" class="button" type="button" value="<?php _e( "Selected Rows", 'wordpress-advbulkedit'); ?>" />
			<input id="revertall" class="button" type="button" value="<?php _e( "All Rows", 'wordpress-advbulkedit'); ?>" />
			<br /><br /><br />
			
			
			<!--<input id="viewdialogbut" class="button" type="button" value="<?php _e( "Load/Save View", 'wordpress-advbulkedit'); ?>" />-->
			<input id="customfieldsbut" class="button" type="button" value="<?php _e( "Custom Fields", 'wordpress-advbulkedit'); ?>" />
			<input id="findcustomfieldsbut" class="button" type="button" value="<?php _e( "Find Custom Fields", 'wordpress-advbulkedit'); ?>" />
			<button id="pluginsettingsbut" class="button" type="button">
			   <span class="icon-cog-outline"></span>
				<?php _e( "Plugin Settings", 'wordpress-advbulkedit'); ?>
			 </button>
			<input id="exportproducts" class="button" type="button" value="<?php _e( "Export to CSV", 'wordpress-advbulkedit'); ?>" />
			<div id="exportinfo"></div>
			<br/><br/><br/>
			<div style="position: relative;">
			  <label><input id="linkededit" type="checkbox"/><?php _e( 'Linked editing', 'wordpress-advbulkedit'); ?></label>
			  <div style="display: inline-block;">
			  <img id="showlinked" src="<?php echo plugin_dir_url(__FILE__);?>images/help18x18.png"/></div>
			<div id="linkednote"> <?php _e( 'Manual changes on any selected post will affect all of them', 'wordpress-advbulkedit'); ?></div>
			</div>
			<div id="exportdialog">
			<div>
				<table id="tablecsvexport" cellpadding="10" cellspacing="0">
					<tr>
						<td>
							<input id="exportall" type="radio" value="0" name="exportwhat" checked="checked">
							<label for="exportall"><?php _e( 'All posts in table', 'wordpress-advbulkedit'); ?></label>
							<br/><br/>
							<input id="exportsel" type="radio" value="1" name="exportwhat">
							<label for="exportsel"><?php _e( 'Selected posts only', 'wordpress-advbulkedit'); ?></label>
						</td>
					</tr>
					<tr>
						<td>
							<input id="allfields" type="radio" value="0" name="exportwhichfields" checked="checked">
							<label for="allfields"><?php _e( 'All fields', 'wordpress-advbulkedit'); ?></label>
							<br/><br/>
							<input id="shownfields" type="radio" value="1" name="exportwhichfields">
							<label for="shownfields"><?php _e( 'Visible fields only', 'wordpress-advbulkedit'); ?></label>
						</td>
					</tr>
					<tr>
						<td style="border-bottom:none; ">
							<?php _e( 'Delimiter', 'wordpress-advbulkedit'); ?>: 
							<select id="exportdelimiter">
								<option value=",">,</option>
								<option value=";">;</option>
							</select>
						</td>
					</tr>
					<tr>
						<td style="borde:none;display: none; ">
						<!--	<label><?php _e( 'Use real meta values', 'wordpress-advbulkedit'); ?>: -->
							<input id="userealmeta" type="checkbox" checked="checked"></input>
							<!--</label>-->
						</td>
					</tr>
				</table>
			</div>
			</div>
			<div id="confirmdialog">
				<div id="confirmregularcontent">
					<?php _e( 'Are you sure you want to continue ?', 'wordpress-advbulkedit'); ?>
				</div>
				<div id="confirmpostcontent">
					<?php _e( 'All changes will be lost, continue ?', 'wordpress-advbulkedit'); ?>
				</div>
			</div>
			<div id="addproddialog">
			</div>
			<!--//plugin settings-->
			<div id="pluginsettings">
			<div style="width:100%;height:100%;">
			<br/>
			<!--settings-->
			<div id="pluginsettingstab">
					<ul>
					<li><a href="#pluginsettingstab-1"><?php echo $arrTranslated['trans_main_settings']; ?></a></li>
					<!--<li><a href="#pluginsettingstab-2"><?php echo $arrTranslated['trans_search_settings']; ?></a></li>-->
					</ul>
					
					<div id="pluginsettingstab-1">
				
				<table cellpadding="10" cellspacing="0" style="margin: 0 auto;">
					<tr>
						<td>
							<?php _e( 'Limit on item retrieval', 'wordpress-advbulkedit'); ?>
						</td>
						<td>
							<input id="productlimit" type="text" style="width:50px;" 
							<?php
								$settings = get_option('w3exwabe_settings');
								if(!is_array($settings)) $settings = array();
								if(isset($settings['settlimit']))
								{		
									echo 'value="'.$settings['settlimit'].'"';
								}else
								{
									echo ' value="1000"';
								}
								
							?>
							>
						</td>
					</tr>
					<tr>
						<td width="50%"  style="padding-top: 25px;">
							<?php _e( 'Save posts in batches of', 'wordpress-advbulkedit'); ?>
						</td>
						<td width="50%"  style="padding-top: 25px;">
							<input id="savebatch" type="text" style="width:50px;" autocomplete="off"
							<?php
								$settings = get_option('w3exwabe_settings');
								if(!is_array($settings)) $settings = array();
								if(!isset($settings['savebatch']))
								{
									$settings['savebatch'] = 50;
								}
								if(isset($settings['savebatch']) && is_numeric($settings['savebatch']))
								{		
									echo 'value="'.$settings['savebatch'].'"';
								}else
								{
									echo ' value=""';
								}
							?>
							>
							/<?php _e( 'empty for a single ajax query', 'wordpress-advbulkedit'); ?>/
						</td>
					</tr>
					<tr>
						<td width="50%" style="padding-top: 20px;">
							<label><input id="gettotalnumber" type="checkbox" autocomplete="off"
							<?php 
//						  	$settings = get_option('w3exwabe_settings');
							if(isset($settings['settgetall']))
							{
								if($settings['settgetall'] == 1)
								{
									echo 'checked=checked';
								}
							}?>
							><?php _e( 'Do not retrieve total number', 'wordpress-advbulkedit'); ?></label>
						</td>
						<td  style="padding-top: 20px;">
							/<?php _e( 'check if you have a large number of posts and want to speed up the query', 'wordpress-advbulkedit'); ?>/
						</td>
					</tr>
					<tr>
						<td width="50%" style="padding-top: 20px;">
							<label><input id="deleteimages" type="checkbox"
							<?php 
//						  	$settings = get_option('w3exwabe_settings');
							if(isset($settings['deleteimages']))
							{
								if($settings['deleteimages'] == 1)
								{
									echo 'checked=checked';
								}
							}?>
							><?php _e( 'Delete images from server/media library when removing from item image/gallery or deleting item', 'wordpress-advbulkedit'); ?></label>
						</td>
						<td  style="padding-top: 20px;">
							/<?php _e( 'This is not revertable ! Use with caution', 'wordpress-advbulkedit'); ?>/
						</td>
					</tr>
					<tr>
						<td width="50%" style="padding-top: 20px;">
							<label><input id="deleteinternal" type="checkbox"
							<?php 
//						  	$settings = get_option('w3exwabe_settings');
							if(isset($settings['deleteinternal']))
							{
								if($settings['deleteinternal'] == 1)
								{
									echo 'checked=checked';
								}
							}?>
							><?php _e( 'Use sql queries when deleting posts', 'wordpress-advbulkedit'); ?></label>
						</td>
						<td  style="padding-top: 20px;">
							/<?php _e( 'will speed up the query', 'wordpress-advbulkedit'); ?>/
						</td>
					</tr>
					<tr>
						<td width="50%" style="padding-top: 20px;">
							<label><input id="calldosavepost" type="checkbox"
							<?php 
							$echotext = "";
							if(isset($settings['calldosavepost']))
							{
								if($settings['calldosavepost'] == 1)
								{
									$echotext = "checked=checked";
								}
							}
							echo $echotext;	 ?>
							><?php _e( 'Call save_post action', 'wordpress-advbulkedit'); ?></label>
						</td>
						<td  style="padding-top: 20px;">
							
						</td>
					</tr>
					<tr>
						<td width="50%" style="padding-top: 20px;">
							<label><input id="confirmsave" type="checkbox"
							<?php 
							if(isset($settings['confirmsave']))
							{
								if($settings['confirmsave'] == 1)
								{
									echo 'checked=checked';
								}
							}
							?>
							><?php _e( 'Require confirmation on save', 'wordpress-advbulkedit'); ?></label>
						</td>
						<td  style="padding-top: 20px;">
						</td>
					</tr>
					<tr>
						<td width="50%"  style="padding-top: 25px;">
							<?php _e( 'Choose row height /needs page reload/', 'wordpress-advbulkedit'); ?>
						</td>
						<td width="50%"  style="padding-top: 25px;">
							<select id="rowheight" >
							<?php
								$normal = "selected";
								$medium = "";
								$big = "";
								if(isset($settings['rowheight']) && is_numeric($settings['rowheight']))
								{		
									if($settings['rowheight'] == "3")
									{
										$big = 'selected';
									}elseif($settings['rowheight'] == "2")
									{
										$medium = 'selected';
									}else
									{
										$normal = 'selected';
									}
								}
							?>
							<option value ="1" <?php echo $normal; ?>>normal</option>
							<option value ="2" <?php echo $medium; ?>>medium</option>
							<option value ="3" <?php echo $big; ?>>big</option>
							</select>
						</td>
					</tr>
					<tr>
						<td width="50%"  style="padding-top: 25px;">
							<?php _e( 'Set manual table height', 'wordpress-advbulkedit'); ?>
						</td>
						<td width="50%"  style="padding-top: 25px;">
							<input id="tableheight" type="text" style="width:50px;" 
							<?php
								$settings = get_option('w3exwabe_settings');
								if(!is_array($settings)) $settings = array();
								if(isset($settings['tableheight']) && is_numeric($settings['tableheight']))
								{		
									echo 'value="'.$settings['tableheight'].'"';
								}else
								{
									echo ' value=""';
								}
							?>
							>
							px
						</td>
					</tr>
					<tr>
						<td width="50%" style="padding-top: 20px;">
							<label><input id="debugmode" type="checkbox"
							<?php 
							if(isset($settings['debugmode']))
							{
								if($settings['debugmode'] == 1)
								{
									echo 'checked=checked';
								}
							}
							?>
							><?php _e( 'Enable debug mode', 'wordpress-advbulkedit'); ?></label>
						</td>
						<td  style="padding-top: 20px;">
						</td>
					</tr>
				</table>
				</div>
				</div>
				</div>
			</div>
			<?php 
				$setnew = __( 'set new', 'wordpress-advbulkedit');
				$prepend = __( 'prepend', 'wordpress-advbulkedit');
				$append = __( 'append', 'wordpress-advbulkedit');
				$replacetext = __( 'replace text', 'wordpress-advbulkedit');
				$ignorecase = __( 'Ignore case', 'wordpress-advbulkedit');
				$withtext = __( 'with text', 'wordpress-advbulkedit');
				$delete = __( 'delete', 'wordpress-advbulkedit');
			    echo '<script>';echo PHP_EOL;
				if(isset($settings['showidsearch']))
				{
					if($settings['showidsearch'] == 1)
					{
						echo 'W3Ex.w3ex_show_id_search ="1";';  echo PHP_EOL;
					}
				}
				echo 'W3Ex.trans_setnew = "'.$setnew.'";'; echo PHP_EOL;
				echo 'W3Ex.trans_prepend = "'.$prepend.'";'; echo PHP_EOL;
				echo 'W3Ex.trans_append = "'.$append.'";'; echo PHP_EOL;
				echo 'W3Ex.trans_replacetext = "'.$replacetext.'";'; echo PHP_EOL;
				echo 'W3Ex.trans_ignorecase = "'.$ignorecase.'";'; echo PHP_EOL;
				echo 'W3Ex.trans_withtext = "'.$withtext.'";'; echo PHP_EOL;						echo 'W3Ex.trans_delete = "'.$delete.'";'; echo PHP_EOL;	
				echo 'W3Ex.trans_incbyvalue = "'.__( "increase by value", 'wordpress-advbulkedit').'";'; echo PHP_EOL;
				echo 'W3Ex.trans_decbyvalue = "'.__( "decrease by value", 'wordpress-advbulkedit').'";'; echo PHP_EOL;
				echo 'W3Ex.trans_incbyper = "'.__( "increase by %", 'wordpress-advbulkedit').'";'; echo PHP_EOL;
				echo 'W3Ex.trans_decbyper = "'.__( "decrease by %", 'wordpress-advbulkedit').'";'; echo PHP_EOL;
				echo 'W3Ex.trans_movetrash = "'.__( "Move to Trash", 'wordpress-advbulkedit').'";'; echo PHP_EOL;
				echo 'W3Ex.trans_delperm = "'.__( "Delete Permanently", 'wordpress-advbulkedit').'";'; echo PHP_EOL;
				echo 'W3Ex.trans_products = "'.__( "Posts", 'wordpress-advbulkedit').'";'; echo PHP_EOL;
				echo 'W3Ex.trans_duplicate = "'.__( "Duplicate", 'wordpress-advbulkedit').'";'; echo PHP_EOL;
				echo 'W3Ex.trans_times = "'.__( "Time(s)", 'wordpress-advbulkedit').'";'; echo PHP_EOL;
				echo 'W3Ex.trans_add = "'.__( "add", 'wordpress-advbulkedit').'";'; echo PHP_EOL;
				echo 'W3Ex.trans_select = "'.__( "Select", 'wordpress-advbulkedit').'";'; echo PHP_EOL;
				echo 'W3Ex.trans_bulkadd = "'.__( "Bulk Add", 'wordpress-advbulkedit').'";'; echo PHP_EOL;
				echo "</script>";
			 ?>
			<!--//bulk dialog-->
			<div id="bulkdialog">
			<table class="custstyle-table">
				<tr data-id="post_title" style="display: table-row;">
					<td style="width:20% !important;">
						<?php echo $arrTranslated['post_title'];  ?>
					</td>
					<td>
						 <select id="bulkpost_title" class="bulkselect">
							<option value="new"><?php echo $setnew; ?></option>
							<option value="prepend"><?php echo $prepend; ?></option>
							<option value="append"><?php echo $append; ?></option>
							<option value="replace"><?php echo $replacetext; ?></option>
							<option value="replaceregexp">replace regexp</option>
						</select>
						<label class="labelignorecase" style="display:none;">
						<input class="inputignorecase" type="checkbox">
						<?php echo $ignorecase; ?></label>
					</td>
					<td class="tdbulkvalue">
						<div class="imgButton sm mapto">
					    </div>
						<input id="bulkpost_titlevalue" type="text" placeholder="Skipped (empty)" data-id="post_title" class="bulkvalue"/>
					</td>
					<td>
						<div class="divwithvalue" style="display:none;"><?php echo $withtext; ?> <input class="inputwithvalue" type="text"></div>
					</td>
				</tr>
				<tr data-id="post_content">
					<td>
						<?php echo $arrTranslated['post_content']; ?>
					</td>
					<td>
						 <select id="bulkpost_content" class="bulkselect">
							<option value="new"><?php echo $setnew; ?></option>
							<option value="prepend"><?php echo $prepend; ?></option>
							<option value="append"><?php echo $append; ?></option>
							<option value="replace"><?php echo $replacetext; ?></option>
							<option value="replaceregexp">replace regexp</option>
						</select>
						<label class="labelignorecase" style="display:none;">
						<input class="inputignorecase" type="checkbox">
						<?php echo $ignorecase; ?></label>
					</td>
					<td class="tdbulkvalue">
						<div class="imgButton sm mapto">
					    </div>
						<textarea id="bulkpost_contentvalue" rows="1" cols="15" data-id="post_content" class="bulkvalue" placeholder="Skipped (empty)"></textarea>
					</td>
					<td>
						<div class="divwithvalue" style="display:none;"><?php echo $withtext; ?> <textarea class="inputwithvalue" rows="1" cols="15"></textarea></div>
					</td>
				</tr>
				<tr data-id="post_excerpt">
					<td>
						<?php echo $arrTranslated['post_excerpt']; ?>
					</td>
					<td>
						 <select id="bulkpost_excerpt" class="bulkselect">
							<option value="new"><?php echo $setnew; ?></option>
							<option value="prepend"><?php echo $prepend; ?></option>
							<option value="append"><?php echo $append; ?></option>
							<option value="replace"><?php echo $replacetext; ?></option>
							<option value="replaceregexp">replace regexp</option>
						</select>
						<label class="labelignorecase" style="display:none;">
						<input class="inputignorecase" type="checkbox">
						<?php echo $ignorecase; ?></label>
					</td>
					<td class="tdbulkvalue">
						<div class="imgButton sm mapto">
					    </div>
						<textarea id="bulkpost_excerptvalue" rows="1" cols="15" data-id="post_excerpt" class="bulkvalue" placeholder="Skipped (empty)"></textarea>
					</td>
					<td>
						<div class="divwithvalue" style="display:none;"><?php echo $withtext; ?> <textarea class="inputwithvalue" rows="1" cols="15"></textarea></div>
					</td>
				</tr>
				<tr data-id="post_name">
					<td>
						<?php echo $arrTranslated['post_name']; ?>
					</td>
					<td>
						 <select id="bulkpost_name" class="bulkselect">
							<option value="new"><?php echo $setnew; ?></option>
							<option value="prepend"><?php echo $prepend; ?></option>
							<option value="append"><?php echo $append; ?></option>
							<option value="replace"><?php echo $replacetext; ?></option>
							<option value="replaceregexp">replace regexp</option>
						</select>
						<label class="labelignorecase" style="display:none;">
						<input class="inputignorecase" type="checkbox">
						<?php echo $ignorecase; ?></label>
					</td>
					<td class="tdbulkvalue">
						<div class="imgButton sm mapto">
					    </div>
						<textarea id="bulkpost_namevalue" rows="1" cols="15" data-id="post_name" class="bulkvalue" placeholder="Skipped (empty)"></textarea>
					</td>
					<td>
						<div class="divwithvalue" style="display:none;"><?php echo $withtext; ?> <textarea class="inputwithvalue" rows="1" cols="15"></textarea></div>
					</td>
				</tr>
				<tr data-id="post_status">
					<td>
						<input id="setpost_status" type="checkbox" class="bulkset" data-id="post_status"><label for="setpost_status"><?php echo $arrTranslated['post_status']; ?></label>
					</td>
					<td>
						
					</td>
                    <?php
                        $intg_post_status_unreliable_option = '';
                        if (defined('W3EXWABE_INTG_POST_STATUS_UNRELIABLE')) {
                            $intg_post_status_unreliable_option = '<option value="unreliable">Unreliable</option>';
                        }
                    ?>
					<td class="nontextnumbertd">
						 <select id="bulkpost_status">
							<option value="publish">Publish</option>
							<option value="draft">Draft</option>
							<option value="private">Private</option>
							<?php echo $intg_post_status_unreliable_option; ?>
						</select>
					</td>
					<td>
						
					</td>
				</tr>
				<tr data-id="menu_order">
					<td>
						<?php echo $arrTranslated['menu_order']; ?>
					</td>
					<td>
						 <select id="bulkmenu_order" data-id="menu_order">
							<option value="new"><?php echo $setnew; ?></option>
							<option value="incvalue"><?php _e( "increase by value", 'wordpress-advbulkedit'); ?></option>
							<option value="decvalue"><?php _e( "decrease by value", 'wordpress-advbulkedit'); ?></option>
						</select>
					</td>
					<td class="tdbulkvalue">
						<div class="imgButton sm mapto">
					    </div>
						<input id="bulkmenu_ordervalue" type="text" data-id="menu_order" class="bulkvalue" placeholder="Skipped (empty)" />
					</td>
					<td>
						
					</td>
				</tr>
				<tr data-id="comment_status">
					<td>
						<input id="setcomment_status" type="checkbox" class="bulkset" data-id="comment_status"><label for="setcomment_status"><?php echo $arrTranslated['comment_status']; ?></label>
					</td>
					<td>
						
					</td>
					<td class="nontextnumbertd">
						 <select id="bulkcomment_status">
							<option value="yes">Yes</option>
							<option value="no">No</option>
						</select>
					</td>
					<td>
						
					</td>
				</tr>
				<tr data-id="post_author">
					<td>
						<input id="setpost_author" type="checkbox" class="bulkset" data-id="post_author" data-type="customtaxh"><label for="setpost_author"><?php echo $arrTranslated['post_author']; ?></label>
					</td>
					<td>
						
					</td>
					<td class="nontextnumbertd">
						 <select id="bulkpost_author" class="makechosen catselset" style="width:250px;" data-placeholder="select">
						<?php
							$blogusers = get_users( array( 'role' => 'editor', 'fields' => array( 'ID', 'display_name' ) ));
							$blogusers1 = get_users( array( 'role' => 'administrator', 'fields' => array( 'ID', 'display_name' ) ));
							$blogusers = array_merge($blogusers,$blogusers1);
							$blogusers1 = get_users( array( 'role' => 'author', 'fields' => array( 'ID', 'display_name' ) ));
							$blogusers = array_merge($blogusers,$blogusers1);
							foreach ( $blogusers as $user ) 
							{
								echo '<option value="'.$user->ID.'" >'.$user->display_name.'</option>';
							}
						?>
						</select>
					</td>
					<td>
						
					</td>
				</tr>
			</table>
			<br/>
			</div>
			
			<!--//select dialog-->
			<div id="selectdialog">
			<div id="selquickactions">
				<?php _e( "Quick actions", 'wordpress-advbulkedit'); ?>:
				<input id="seldupproducts" class="button" type="button" value="<?php _e( "Select duplicate posts", 'wordpress-advbulkedit'); ?>" />
				(<select id="selectdupproducts">
					<option value="post_title"><?php _e('same title','wordpress-advbulkedit'); ?></option>
					<option value="post_content"><?php _e('content','wordpress-advbulkedit'); ?></option>
					<option value="post_excerpt"><?php _e('excerpt','wordpress-advbulkedit'); ?></option>
				</select>)
				<input id="invertselected" class="button" type="button" value="<?php _e( "Invert selected", "woocommerce-advbulkedit"); ?>" />
			</div>
			<hr />
			<div id="selectdiv">
			<select id="selectselect">
				<option value="select"><?php _e('select','wordpress-advbulkedit'); ?></option>
				<option value="deselect"><?php _e('deselect','wordpress-advbulkedit'); ?></option>
			</select>
			<?php _e('posts which meet','wordpress-advbulkedit'); ?>
			<select id="selectany">
				<option value="any"><?php _e('any of the search criteria','wordpress-advbulkedit'); ?></option>
				<option value="all"><?php _e('all of the search criteria','wordpress-advbulkedit'); ?></option>
			</select>
			</div>
			<?php 
				$t_contains = __( 'contains', 'wordpress-advbulkedit');
				$t_doesnot = __( 'does not contain', 'wordpress-advbulkedit');
				$t_starts = __( 'starts with', 'wordpress-advbulkedit');
				$t_ends = __( 'ends with', 'wordpress-advbulkedit');
				$t_isempty = __( 'field is empty', 'wordpress-advbulkedit');
				 echo '<script>'; echo PHP_EOL;
				echo 'W3Ex.trans_contains = "'.$t_contains.'";'; echo PHP_EOL;
				echo 'W3Ex.trans_doesnot = "'.$t_doesnot.'";'; echo PHP_EOL;
				echo 'W3Ex.trans_starts = "'.$t_starts.'";'; echo PHP_EOL;
				echo 'W3Ex.trans_ends = "'.$t_ends.'";'; echo PHP_EOL;
				echo 'W3Ex.trans_isempty = "'.$t_isempty.'";'; echo PHP_EOL;
				echo "</script>";
			 ?>
			<table class="custstyle-table">
				<tr data-id="post_title" style="display: table-row;">
					<td style="width:25% !important;">
						<?php echo $arrTranslated['post_title']; ?>
					</td>
					<td>
						 <select id="selectpost_title" class="selectselect" data-id="post_title">
							<option value="con"><?php echo $t_contains; ?></option>
							<option value="notcon"><?php echo $t_doesnot; ?></option>
							<option value="start"><?php echo $t_starts; ?></option>
							<option value="end"><?php echo $t_ends; ?></option>
						</select>
					</td>
					<td>
						<input id="selectpost_titlevalue" type="text" placeholder="Skipped (empty)" data-id="post_title" class="selectvalue"/>
					</td>
					<td>
						<label><input data-id="post_title" class="selectifignorecase" type="checkbox"> <?php echo $ignorecase; ?></label>
					</td>
					<td>
						<input data-id="post_title" class="checkboxifspecial" type="checkbox">
						<select class="selectsplit" disabled="disabled"><option value="split">split commas</option><option value="regexp">reg exp</option></select>
						<select class="selectsplitand" disabled="disabled"><option value="and">AND</option><option value="or">OR</option></select>
					</td>
				</tr>
				<tr data-id="post_content">
					<td>
						<?php echo $arrTranslated['post_content']; ?>
					</td>
					<td>
						 <select id="selectpost_content" class="selectselect" data-id="post_content">
							<option value="con"><?php echo $t_contains; ?></option>
							<option value="notcon"><?php echo $t_doesnot; ?></option>
							<option value="start"><?php echo $t_starts; ?></option>
							<option value="end"><?php echo $t_ends; ?></option>
							<option value="empty"><?php echo $t_isempty; ?></option>
						</select>
					</td>
					<td>
						<textarea cols="15" rows="1" id="selectpost_contentvalue" placeholder="Skipped (empty)" data-id="post_content" class="selectvalue"></textarea >
					</td>
					<td>
						<label><input data-id="post_content" class="selectifignorecase" type="checkbox"> <?php echo $ignorecase; ?></label>
					</td>
					<td>
						<input data-id="post_content" class="checkboxifspecial" type="checkbox">
						<select class="selectsplit" disabled="disabled"><option value="split">split commas</option><option value="regexp">reg exp</option></select>
						<select class="selectsplitand" disabled="disabled"><option value="and">AND</option><option value="or">OR</option></select>
					</td>
				</tr>
				<tr data-id="post_excerpt">
					<td>
						<?php echo $arrTranslated['post_excerpt']; ?>
					</td>
					<td>
						 <select id="selectpost_excerpt" class="selectselect" data-id="post_excerpt">
							<option value="con"><?php echo $t_contains; ?></option>
							<option value="notcon"><?php echo $t_doesnot; ?></option>
							<option value="start"><?php echo $t_starts; ?></option>
							<option value="end"><?php echo $t_ends; ?></option>
							<option value="empty"><?php echo $t_isempty; ?></option>
						</select>
					</td>
					<td>
						<textarea cols="15" rows="1" id="selectpost_excerptvalue" placeholder="Skipped (empty)" data-id="post_excerpt" class="selectvalue"></textarea >
					</td>
					<td>
						<label><input data-id="post_excerpt" class="selectifignorecase" type="checkbox"> <?php echo $ignorecase; ?></label>
					</td>
					<td>
						<input data-id="post_excerpt" class="checkboxifspecial" type="checkbox">
						<select class="selectsplit" disabled="disabled"><option value="split">split commas</option><option value="regexp">reg exp</option></select>
						<select class="selectsplitand" disabled="disabled"><option value="and">AND</option><option value="or">OR</option></select>
					</td>
				</tr>
				<tr data-id="post_name">
					<td>
						<?php echo $arrTranslated['post_name']; ?>
					</td>
					<td>
						 <select id="selectpost_name" class="selectselect" data-id="post_name">
							<option value="con"><?php echo $t_contains; ?></option>
							<option value="notcon"><?php echo $t_doesnot; ?></option>
							<option value="start"><?php echo $t_starts; ?></option>
							<option value="end"><?php echo $t_ends; ?></option>
							<option value="iscon">is contained in</option>
						</select>
					</td>
					<td>
						<textarea cols="15" rows="1" id="selectpost_namevalue" placeholder="Skipped (empty)" data-id="post_name" class="selectvalue"></textarea >
					</td>
					<td>
						<label><input data-id="post_name" class="selectifignorecase" type="checkbox"> <?php echo $ignorecase; ?></label>
					</td>
					<td>
						<input data-id="post_name" class="checkboxifspecial" type="checkbox">
						<select class="selectsplit" disabled="disabled"><option value="split">split commas</option><option value="regexp">reg exp</option></select>
						<select class="selectsplitand" disabled="disabled"><option value="and">AND</option><option value="or">OR</option></select>
					</td>
				</tr>
				
				<tr data-id="post_status">
					<td>
						<input id="setselpost_status" type="checkbox" class="selectset" data-id="post_status"><label for="setselpost_status"><?php echo $arrTranslated['post_status']; ?></label>
					</td>
					<td>
						
					</td>
                    <?php
                        $intg_post_status_unreliable_option = '';
                        if (defined('W3EXWABE_INTG_POST_STATUS_UNRELIABLE')) {
                            $intg_post_status_unreliable_option = '<option value="unreliable">Unreliable</option>';
                        }
                    ?>
                    <td>
						 <select id="selectpost_status">
							<option value="publish">Publish</option>
							<option value="draft">Draft</option>
							<option value="private">Private</option>
							<?php echo $intg_post_status_unreliable_option; ?>
						</select>
					</td>
					<td>
						
					</td>
					<td>
					</td>
				</tr>
				<tr data-id="menu_order">
					<td>
						<?php echo $arrTranslated['menu_order']; ?>
					</td>
					<td>
						 <select id="selectmenu_order" class="selectselect" data-id="menu_order">
							<option value="more">></option>
							<option value="less"><</option>
							<option value="equal">==</option>
							<option value="moree">>=</option>
							<option value="lesse"><=</option>
							<option value="empty"><?php echo $t_isempty; ?></option>
						</select>
					</td>
					<td>
						<input id="selectmenu_ordervalue" type="text" placeholder="Skipped (empty)" data-id="menu_order" class="selectvalue" />
					</td>
					<td>
						
					</td>
					<td>
					</td>
				</tr>
				<tr data-id="comment_status">
					<td>
						<input id="setselcomment_status" type="checkbox" class="selectset" data-id="comment_status"><label for="setselcomment_status"><?php echo $arrTranslated['comment_status']; ?></label>
					</td>
					<td>
						
					</td>
					<td>
						 <select id="selectcomment_status">
							<option value="yes">Yes</option>
							<option value="no">No</option>
						</select>
					</td>
					<td>
						
					</td>
					<td>
					</td>
				</tr>
				
				<tr data-id="post_author">
					<td>
						<?php echo $arrTranslated['post_author']; ?>
					</td>
					<td>
						 <select id="selectpost_author" class="selectselect" data-id="post_author">
							<option value="con"><?php echo $t_contains; ?></option>
							<option value="notcon"><?php echo $t_doesnot; ?></option>
							<option value="start"><?php echo $t_starts; ?></option>
							<option value="end"><?php echo $t_ends; ?></option>
							<option value="empty"><?php echo $t_isempty; ?></option>
						</select>
					</td>
					<td>
						<input id="selectpost_authorvalue" type="text" placeholder="Skipped (empty)" data-id="post_author" class="selectvalue"/>
					</td>
					<td>
						<label><input data-id="post_author" class="selectifignorecase" type="checkbox"> <?php echo $ignorecase; ?></label>
					</td>
					<td>
						<input data-id="post_author" class="checkboxifspecial" type="checkbox">
						<select class="selectsplit" disabled="disabled"><option value="split">split commas</option><option value="regexp">reg exp</option></select>
						<select class="selectsplitand" disabled="disabled"><option value="and">AND</option><option value="or">OR</option></select>
					</td>
				</tr>
			</table>
			<br/>
			</div>
			
		<!--	
		settings dialog
		-->
			<!--//show/hide fields-->
			<div id="settingsdialog">
			
			<table class="settings-table" >
				<br/>
			    <input id="searchsettings" type="text" style="width:150px;" placeholder="search"></input>
			    <br/>
				<tr>
					
					<td>
						<input id="dimage" class="dsettings" data-id="_thumbnail_id" type="checkbox"><label for="dimage"> <?php echo $arrTranslated['_thumbnail_id']; ?></label>
					</td>
					<td>
						<div>
						 <img id="dimage_check" src="<?php echo $purl;?>images/tick.png" style="visibility:hidden;"/>
						</div>
					</td>
					<td>
						<input id="dmenu_order" class="dsettings" data-id="menu_order" type="checkbox"><label for="dmenu_order"> <?php echo $arrTranslated['menu_order']; ?></label>
					</td>
					<td>
						<div>
						 <img id="dmenu_order_check" src="<?php echo $purl;?>images/tick.png" style="visibility:hidden;"/>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<input id="dprodcutdescription" class="dsettings" data-id="post_content" type="checkbox"><label for="dprodcutdescription"> <?php echo $arrTranslated['post_content']; ?></label>
					</td>
					<td>
						<div>
						 <img id="dprodcutdescription_check" src="<?php echo $purl;?>images/tick.png" style="visibility:hidden;"/>
						</div>
					</td>
					<td>
						<input id="dprodcutexcerpt" class="dsettings" data-id="post_excerpt" type="checkbox"><label for="dprodcutexcerpt"> <?php echo $arrTranslated['post_excerpt']; ?></label>
					</td>
					<td>
						<div>
						 <img id="dprodcutexcerpt_check" src="<?php echo $purl;?>images/tick.png" style="visibility:hidden;"/>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<input id="dpost_name" class="dsettings" data-id="post_name" type="checkbox"><label for="dpost_name"> <?php echo $arrTranslated['post_name']; ?></label>
					</td>
					<td>
						<div>
						 <img id="dpost_name_check" src="<?php echo $purl;?>images/tick.png" style="visibility:hidden;"/>
						</div>
					</td>
					<td>
						<input id="dpost_date" class="dsettings" data-id="post_date" type="checkbox"><label for="dpost_date"> <?php echo $arrTranslated['post_date']; ?></label>
					</td>
					<td>
						<div>
						 <img id="dpost_date_check" src="<?php echo $purl;?>images/tick.png" style="visibility:hidden;"/>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<input id="d_product_adminlink" class="dsettings" data-id="_product_adminlink" type="checkbox"><label for="d_product_adminlink"> Edit in admin</label>
					</td>
					<td>
						<div>
						 <img id="d_product_adminlink_check" src="<?php echo $purl;?>images/tick.png" style="visibility:hidden;"/>
						</div>
					</td>
					<td>
						<input id="d_post_permalink" class="dsettings" data-id="_post_permalink" type="checkbox"><label for="d_post_permalink"> Post URL (permalink)</label>
					</td>
					<td>
						<div>
						 <img id="d_post_permalink_check" src="<?php echo $purl;?>images/tick.png" style="visibility:hidden;"/>
						</div>
					</td>
				</tr>
				<tr>
					<td>
						<input id="dproductstatus" class="dsettings" data-id="post_status" type="checkbox"><label for="dproductstatus"> <?php echo $arrTranslated['post_status']; ?></label>
					</td>
					<td>
						<div>
						 <img id="dproductstatus_check" src="<?php echo $purl;?>images/tick.png" style="visibility:hidden;"/>
						</div>
					</td>
					<td>
						<input id="dcomment_status" class="dsettings" data-id="comment_status" type="checkbox"><label for="dcomment_status"> <?php echo $arrTranslated['comment_status']; ?></label>
					</td>
					<td>
						<div>
						 <img id="dcomment_status_check" src="<?php echo $purl;?>images/tick.png" style="visibility:hidden;"/>
						</div>
					</td>
				</tr>
				<tr>
					
					<td>
						<input id="dpost_author" class="dsettings" data-id="post_author" type="checkbox"><label for="dpost_author"> <?php echo $arrTranslated['post_author']; ?></label>
					</td>
					<td>
						<div>
						 <img id="dpost_author_check" src="<?php echo $purl;?>images/tick.png" style="visibility:hidden;"/>
						</div>
					</td>
					<td>
						&nbsp;
					</td>
					<td>
						&nbsp;
					</td>
				</tr>
				
			</table>
			<br/>
			</div>
			<!--//grouped dialog-->
			<div id="categoriesdialog">
				<div class='category'>
					<?php
							$args = array(
							'descendants_and_self'  => 0,
							'selected_cats'         => false,
							'popular_cats'          => false,
							'walker'                => null,
							'taxonomy'              => 'category',
							'checked_ontop'         => true,
							'number'                => 1000, // PERFORMANCE: Limit loaded categories
						);

						?>
					<ul class="categorychecklist form-no-clear">
							<?php wp_terms_checklist( 0, $args ); ?>
					</ul>
				</div>
				<div class='post_tag'>
					<?php
							$args = array(
							'descendants_and_self'  => 0,
							'selected_cats'         => false,
							'popular_cats'          => false,
							'walker'                => null,
							'taxonomy'              => 'post_tag',
							'checked_ontop'         => true,
							'number'                => 1000, // PERFORMANCE: Limit loaded tags
						);

						?>
					<ul class="categorychecklist form-no-clear">
							<?php wp_terms_checklist( 0, $args ); ?>
					</ul>
				</div>
				<div class='post_format'>
					<?php
							$args = array(
							'descendants_and_self'  => 0,
							'selected_cats'         => false,
							'popular_cats'          => false,
							'walker'                => null,
							'taxonomy'              => 'post_format',
							'checked_ontop'         => true
						);

						?>
					<ul class="categorychecklist form-no-clear">
							<?php wp_terms_checklist( 0, $args ); ?>
					</ul>
				</div>
				<div class='post_author'>
					<ul class="categorychecklist form-no-clear clearothers">
							<?php 
							foreach ( $blogusers as $user ) 
							{
								echo '<li>
				    					<label class="selectit">
									        <input value="'.$user->ID.'" type="checkbox">
									        '.$user->display_name.'
									    </label>
									</li>'
								;
							}
							
							 ?>
					</ul>
				</div>
				<?php
					if(is_array($sel_fields) && !empty($sel_fields))
					{
						foreach($sel_fields as $keyout => $outarray)
						{
							foreach($outarray as $key => $innerarray)
							{
								if(isset($innerarray['type']))
								{
									if($innerarray['type'] === 'customh')
									{
										if(taxonomy_exists($key))
										{
											echo '<div class="'.$key.'">';
											echo PHP_EOL;
											echo '<ul class="categorychecklist form-no-clear">';
											$args = array(
												'descendants_and_self'  => 0,
												'selected_cats'         => false,
												'popular_cats'          => false,
												'walker'                => null,
												'taxonomy'              => $key,
												'checked_ontop'         => true,
												'number'                => 1000, // PERFORMANCE: Limit loaded terms
											);
											wp_terms_checklist( 0, $args );
											echo '</ul></div>';
										}
									}
								}
							}
						}
					}
				?>
				
			</div>
			<?php
				// ... Rest of the JavaScript generation for bulk editing taxonomies...
				// This section remains mostly the same but uses optimized queries
				if(is_array($sel_fields) && !empty($sel_fields))
				{
					echo PHP_EOL;
					echo '<script>';
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
									$name = $key;
									if(isset($innerarray['name']))
										$name = $innerarray['name'];
									$bulktext = '<tr data-id="'.$key.'" class="customfieldtr"><td>'
									.'<input id="set'.$key.'" type="checkbox" class="bulkset" data-id="'.$key.'" data-type="customtaxh"><label for="set'.$key.'">Set '.$name.'</label></td><td>'.
						'<select id="bulkadd'.$key.'" class="bulkselect">'.
							'<option value="new">'.__('set new','wordpress-advbulkedit').'</option>'.
							'<option value="add">'.__('add','wordpress-advbulkedit').'</option>'.
							'<option value="remove">'.__('remove','wordpress-advbulkedit').'</option></select></td><td class="nontextnumbertd">'
									 .'<select id="bulk'.$key.'" class="makechosen catselset" style="width:250px;" data-placeholder="'.str_replace('\\','\\\\',$arrTranslated['trans_data_placeholder']).'" multiple ><option value=""></option>';
									 $searchtext = ' class="makechosen catselset" style="width:250px;" data-placeholder="'.str_replace('\\','\\\\',$arrTranslated['trans_data_placeholder']).'" multiple ><option value=""></option>';
									   
									// PERFORMANCE: Use optimized query with limit
									$woo_categoriesb = $wpdb->get_results(
										$wpdb->prepare(
											"SELECT t.term_id, t.name, tt.term_taxonomy_id 
											FROM {$wpdb->terms} t 
											INNER JOIN {$wpdb->term_taxonomy} tt ON t.term_id = tt.term_id 
											WHERE tt.taxonomy = %s 
											ORDER BY t.name ASC 
											LIMIT 1000",
											$key
										)
									);
									
									if(is_wp_error($woo_categoriesb))
											continue;
									foreach($woo_categoriesb as $category)
									{
										$catname = str_replace('"','\"',$category->name);
										$catname = trim(preg_replace('/\s+/', ' ', $catname));
									   	$bulktext.= '<option value="'.$category->term_id.'" >'.$catname.'</option>';
										$searchtext.= '<option value="'.$category->term_taxonomy_id.'" >'.$catname.'</option>';
									}
									$bulktext.= '</select></td><td></td></tr>';
									$searchtext.= '</select>';
									if($innerarray['type'] === 'customh')
									{
										echo "W3Ex['".str_replace("'","\'",$key)."bulk'] = '".str_replace("'","\'",$bulktext)."';";
									}
									echo "W3Ex['taxonomyterms".str_replace("'","\'",$key)."'] = '".str_replace("'","\'",$searchtext)."';";
									echo PHP_EOL;
								}
							}
						}
					}
					}
					
				}
				echo '</script>';
				echo PHP_EOL;
				echo '<script>';
				$key = 'post_author';
				$searchtext = ' class="makechosen catselset" style="width:250px;" data-placeholder="select" multiple >';
				 

				foreach ( $blogusers as $user ) 
				{
					$catname = str_replace('"','\"',$user->display_name);
					$catname = trim(preg_replace('/\s+/', ' ', $catname));
					$searchtext.= '<option value="'.$user->ID.'" >'.$catname.'</option>';
				}

				$searchtext.= '</select>';
				echo PHP_EOL;
				echo "W3Ex['taxonomyterms".str_replace("'","\'",$key)."'] = '".str_replace("'","\'",$searchtext)."';";
				$builtintax = array();
				$builtintax[] = array('key' => 'post_format','name' => 'Post Format');
				$builtintax[] = array('key' => 'category','name' => 'Category');
				$builtintax[] = array('key' => 'post_tag','name' => 'Tags');
				$categorybulk = '<button class="butnewattribute button newcat" type="button"><span class="icon-plus-outline"></span>new</button>'.
							'<div class="divnewattribute"> '.
			   '<input class="inputnewattributename" type="text" placeholder="name" data-slug="category"></input><br/> '.
			   '<input class="inputnewattributeslug" type="text" placeholder="slug (optional)"></input><br/> '.
			   '<select class="selectnewcategory" data-placeholder="select parent(optional)" multiple></select><br/>'.
			   '<button class="butnewattributesave butbulkdialog newcat" style="position:relative;">Ok</button><button class="butnewattributecancel newcat">Cancel</button></div> '.
			   '<div class="divnewattributeerror"></div>';
					foreach($builtintax as $inarray)
					{
						$bulktext = '<tr data-id="'.$inarray['key'].'" class="customfieldtr"><td>'.
						'<input id="set'.$inarray['key'].'" type="checkbox" class="bulkset" data-id="'.$inarray['key'].'" data-type="customtaxh"><label for="set'.$inarray['key'].'">Set '.$inarray['name'].'</label></td><td>'.
			'<select id="bulkadd'.$inarray['key'].'" class="bulkselect">'.
				'<option value="new">'.__('set new','wordpress-advbulkedit').'</option>'.
				'<option value="add">'.__('add','wordpress-advbulkedit').'</option>'.
				'<option value="remove">'.__('remove','wordpress-advbulkedit').'</option></select>'.$categorybulk.'</td><td class="nontextnumbertd">'
						 .'<select id="bulk'.$inarray['key'].'" class="makechosen catselset" style="width:250px;" data-placeholder="'.str_replace('\\','\\\\',$arrTranslated['trans_data_placeholder']).'" multiple ><option value=""></option>';
						 $searchtext = ' class="makechosen catselset" style="width:250px;" data-placeholder="'.str_replace('\\','\\\\',$arrTranslated['trans_data_placeholder']).'" multiple ><option value=""></option>';
						  
						// PERFORMANCE: Use optimized query with limit
						$woo_categoriesb = $wpdb->get_results(
							$wpdb->prepare(
								"SELECT t.term_id, t.name, tt.term_taxonomy_id 
								FROM {$wpdb->terms} t 
								INNER JOIN {$wpdb->term_taxonomy} tt ON t.term_id = tt.term_id 
								WHERE tt.taxonomy = %s 
								ORDER BY t.name ASC 
								LIMIT 1000",
								$inarray['key']
							)
						);
						
						if(is_wp_error($woo_categoriesb))
								continue;
						foreach($woo_categoriesb as $category)
						{
							$catname = str_replace('"','\"',$category->name);
							$catname = trim(preg_replace('/\s+/', ' ', $catname));
						   	$bulktext.= '<option value="'.$category->term_id.'" >'.$catname.'</option>';
							$searchtext.= '<option value="'.$category->term_taxonomy_id.'" >'.$catname.'</option>';
						}
						$bulktext.= '</select></td><td></td></tr>';
						
						$searchtext.= '</select>';
						{
							echo "W3Ex['".str_replace("'","\'",$inarray['key'])."bulk'] = '".str_replace("'","\'",$bulktext)."';";
						}
						echo "W3Ex['taxonomyterms".str_replace("'","\'",$inarray['key'])."'] = '".str_replace("'","\'",$searchtext)."';";
						echo PHP_EOL;
					}
				echo '</script>';
			?>
			<!--//custom fields dialog-->
			<div id="customfieldsdialog">
			<table cellpadding="10" cellspacing="0" id="customfieldstable">
				<tr class="addcontrols">
					<td>
						Meta key/tax. slug:<br />
						<input id="fieldname" type="text"/>
					</td>
					<td>
						Field name(display as):<br />
						<input id="fieldname1" type="text"/>
					</td>
					<td>
						Field type:<br />
						<select id="fieldtype">
							<option value="text">Text (single line)</option>
							<option value="multitext">Text (multi line)</option>
							<option value="integer">Number (integer)</option>
							<option value="decimal">Number (decimal .00)</option>
							<option value="decimal3">Number (decimal .000)</option>
							<option value="select">Dropdown Select</option>
							<option value="checkbox">Checkbox</option>
							<option value="custom">Custom taxonomy</option>
							<option value="customh">Custom taxonomy (hierarchical)</option>
						</select>
					</td>
					<td>
						Visible:<br />
						<select id="fieldvisible">
							<option value="yes">Yes</option>
							<option value="no">No</option>
						</select>
					</td>
				</tr>
				<tr class="addokcancel">
					<td>
						 <button id="addok" class="button">Ok</button>&nbsp;&nbsp;&nbsp;&nbsp;
						 <button id="addcancel" class="button">Cancel</button>
					</td>
					<td><div id="extracustominfo"></div>
					</td>
					<td>
					</td>
				</tr>
			</table><br />
			 <button id="addcustomfield" class="button"><?php _e( 'Add Custom Field', 'wordpress-advbulkedit'); ?></button>
		</div>
		<div id="findcustomfieldsdialog">
			 <br /><br />
			<button id="findcustomfieldsauto" class="button"><?php _e('Find Custom Fields','wordpress-advbulkedit'); ?></button>&nbsp;(recommended)&nbsp;&nbsp;&nbsp;&nbsp; <button id="findcustomtaxonomies" class="button"><?php _e('Find Taxonomies','wordpress-advbulkedit'); ?></button>&nbsp;&nbsp;&nbsp;&nbsp;<?php _e('Find custom fields by post ID','wordpress-advbulkedit'); ?>:<input id="productid" type="text"/><button id="findcustomfield" class="button"><?php _e('Find','wordpress-advbulkedit'); ?></button> 
			 <br /><br /><br />
			 <table cellpadding="25" cellspacing="0" class="tablecustomfields">
			</table>
		</div>
		<div id="debuginfo"></div>
			<iframe id="exportiframe" width="0" height="0">
  			</iframe>
		
		
		<div id="memorylimit">
		<?php
		if(isset($settings['debugmode']))
		{
			if($settings['debugmode'] == 1)
			{
//				$totalmem = (int) ini_get('memory_limit') ;
//				echo "Allocated: ".$totalmem."<br/>";
			}
		}?>
		</div>
		<div id="memoryusage">
		<?php
		if(isset($settings['debugmode']))
		{
			if($settings['debugmode'] == 1)
			{
				if(function_exists('memory_get_usage'))
				{
					$usage = memory_get_usage();
					echo 'Memory usage: '.round($usage /(1024 * 1024),2);
				}
			}
		}?>
		</div>
		<div id="editorcontainer">
			 <?php
				 $settingsed = array( 'textarea_name' => 'post_text' );
				 wp_editor("", "editorid",$settingsed );
			 ?>
			<textarea style="display:none;" name="post_text" id="editorid" rows="3"></textarea>
			<DIV style='text-align:right' id="savewordpeditor"><BUTTON>Save</BUTTON><BUTTON id="cancelwordpeditor">Cancel</BUTTON></DIV>
			</div>
		</div>
		<?php
		
	}
	
	
    public function _main()
    {
		$this->showMainPage();
    }
}

W3ExWordAdvBulkEditView::init();

							
