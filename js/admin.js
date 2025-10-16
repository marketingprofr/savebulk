
var W3Ex = W3Ex || {};

jQuery(document).ready(function(){
	
W3Ex.abewmodule = (function($){
//	"use strict";
	var _arrEdited = [];
	var _currentItem = {};
	var _conitems = 0;
	var _conitemsfin = 0;
	var _u;
	var _grid;
	var _data = [];
	var _dataAllTemp = [];
	var _dataSKUTemp = {};
	var _dataAllMapIDS = {};
	var _seldata = [];
	var _scounter = 0;
	var _shouldinvalidate = false;
	var _totalrecords = 0;
	var _currentoffset = 1;
	var _recordslimit = 1000;
	var _changedlayout = true;
	var _gridData = [];
	var _shouldhandle = true;
	var _changedcustom = [];
	var _loadedgrouped = [];
	var _pagecats;
	var _pagetitleparam;
	var _pagedescparam;
	var _pageshortdescparam;
	var _pagecustomparam; 
	var _pagetagsparam;
	var _pagecustsearchparam;
	var _hasnext = false;
	var _handledeletearea = true;
	var _cancontinueconfirm = false;
	var _disablesafety = false;
	var _stopbatches = false;
	var _deletetype = "0";
	var _addprodtype = "0";
	var _confirmationclick = "";
	var _varstocreate = {};
	var _linkvarstocreate = {};
	var _hascreation = false;
	var _productstocreate = 1;
	var _selectedParent;
	var _selectedFieldMap = "";
	var _duplicatenumber = 1;
	var _debugmode = false;
	var _parentmap = {};
	var options = {
		editable: true,
		enableCellNavigation: true,
		asyncEditorLoading: false,
		autoEdit: false
	};
	var _changed = {};
	var columns = [];
	var _timeoutid = -1;
  	var _reserved = {};
  	var _tempstuff = {};
  	var _current_post_type = "post";
  	
  	var SCOPE = {
		ALL:0,
		PRODALL:1,
		PRODS:2,
		VAR:3,
		PRODSVAR:4,
		PRODSWITHVARS:5,
		NONE:6
	}
	
  	W3Ex['post_idmap'] = [
  		{id:'category',field:'category',name:'Categories',width:130,category:true,scope:SCOPE.PRODALL,type:'customtaxh',post_type:'post'},
		//use customtaxh instead of customtax for hierarchical tags and remove isnewvals
		{id:'post_tag',field:'post_tag',name:'Tags',width:110,scope:SCOPE.PRODALL,type:'customtax',isnewvals:true,post_type:'post'},
		{id:'post_format',field:'post_format',name:'Post Format',tooltip:'Post Format',scope:SCOPE.PRODALL,width: 100,type:'customtaxh',post_type:'post'}
  	]
//  	W3Ex['page_idmap'] = {};
  	W3Ex['attachment_idmap'] = [
  		{id:'_wp_attachment_image_alt',field:'_wp_attachment_image_alt',name:'Alternative Text',tooltip:'Alternative Text',scope:SCOPE.PRODALL,type:"text",post_type:'attachment'}
  	]
  	
  	function isBlank(str) 
  	{
	    return (!str || !/\S/.test(str));
	}
	
	function isGood(value) 
  	{
  		if(value !== undefined && value !== null)
  			return true;
	    return false;
	}
	
  	function escapeRegExp(string) {
	    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	}

	function replaceAll(string, find, replace) {
	  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
	}

//	$('body').on('click','.grouped-items',function(e)
//	{
//		alert('asd');
//		var ID = $(this).attr('data-item-grouped');
//		if(ID !== undefined && ID !== null)
//		{
//			 e.preventDefault();
//		}
//	});
	

	_mapfield  = 
	{
		'ID':0,'post_title':1,'_thumbnail_id':2,'post_content':3,'post_excerpt':4,'post_name':5,'_product_adminlink':6,'post_status':7,'comment_status':8,'menu_order':9,'_post_permalink':10,'post_date':11,'post_author':12
		//,'post_type':50
	};
	
	_idmap = [
		{id:'ID',field:'ID',name:'ID',visible:true,type:'int'},
		{id:'post_title',field:'post_title',name:'Title',scope:SCOPE.PRODALL,visible:true,width: 270,type:"text"},
		{id:'_thumbnail_id',field:'_thumbnail_id',name:'Image',type:'image',image:true},
		{id:'post_content',field:'post_content',name:'Content',tooltip:'Content',width: 170,textarea:true,type:"multitext"},
		{id:'post_excerpt',field:'post_excerpt',name:'Excerpt',tooltip:'Excerpt',width: 170,textarea:true,type:"multitext"},
		{id:'post_name',field:'post_name',name:'Slug',tooltip:'Post Slug',scope:SCOPE.PRODALL,type:"text"},
		{id:'_product_adminlink',field:'_product_adminlink',name:'Edit in admin',scope:SCOPE.NONE,width: 170,url:true},
		{id:'post_status',field:'post_status',name:'Status',tooltip:'Post Status',scope:SCOPE.PRODALL,width:70,options: "publish,draft,private,pending",type:'set'},
		{id:'comment_status',field:'comment_status',name:'Comment Status',tooltip:'Comment Status',checkbox:true,scope:SCOPE.PRODALL,type:'set'},
		{id:'menu_order',field:'menu_order',name:'Menu Order',width:80,type:'int'},
		{id:'_post_permalink',field:'_post_permalink',name:'Post URL(permalink)',scope:SCOPE.NONE,width: 170,url:true,type:"text"},
		{id:'post_date',field:'post_date',name:'Publish Date',scope:SCOPE.PRODALL,width:100,date:true,type:"text"},
		{id:'post_author',field:'post_author',name:'Post Author',tooltip:'Post Author',scope:SCOPE.PRODALL,width: 100,type:'customtaxh'}
	];

	for (var i=0; i<_idmap.length; i++) {
		if (_idmap[i].id == 'post_status' &&
			W3Ex.integ_post_status_unreliable !== undefined &&
			_idmap[i].options.indexOf('unreliable') == -1) {

			_idmap[i].options += ',unreliable';
		}
	}

	W3Ex._abe_rowheight = $('#rowheight').val();
//	W3Ex.attributes_mapped = W3Ex.attributes_mapped || {};
//	W3Ex.attributes_slugs_mapped = W3Ex.attributes_slugs_mapped || {};
//	W3Ex.attributes = W3Ex.attributes || {};
	W3Ex.categories = W3Ex.categories || {};
	W3Ex.colsettings = W3Ex.colsettings || {};
	W3Ex.customfields = W3Ex.customfields || {};
	W3Ex.customfieldssel = W3Ex.customfieldssel || {};
	W3Ex.attr_cols = W3Ex.attr_cols || {};
	W3Ex._global_settings = W3Ex._global_settings || {};
	
	$('body').on('change','#select_post_type',function()
	{
    	var $this = $(this);
    	_tempstuff.post_type = _current_post_type;
		_current_post_type = $(this).val();
		var hasedit = false;
		var _arr = {};
		for(var ir=0; ir < _arrEdited.length; ir++)
		{
			var row = _arrEdited[ir];
			if(row === undefined) continue;
			var bcon = false;
			for (var key in row) 
			{
			  if (row.hasOwnProperty(key)) 
			  {
			     bcon  = true;
				 break;
			  }
			}
			if(!bcon) continue;
			if(_data[ir] === undefined) continue;
			var selitem = _data[ir];
			for (var key in row) 
			{
			  if (row.hasOwnProperty(key)) 
			  {
				  hasedit = true;
				  break;
			  }
			}
			if(hasedit)
				break;
		}
		
		if(hasedit)
		{
			_confirmationclick = "changedpost";
			$("#confirmdialog").dialog("open");	
			return;
		}
		ChangePostView();
	});
	
	function ChangePostView()
	{
//		_current_post_type
		$('.customfilterstr').remove(); //search table
		$('.customfield').remove(); //search filters in options
		$('.customfieldtr').remove(); //bulk and select
		$('.customfieldcolumns').remove(); //bulk and select
		_changed = {};
		while(_arrEdited.length > 0) {
		    _arrEdited.pop();
		}
		$('#dimgrid').remove();
		$('.showajax').remove();
		DisableAllControls(false);
		_grid.setSelectedRows([]);
 		_dataAllTemp = [];
		_dataAllMapIDS = {};
		W3Ex._global_settings.inselectionmode = false;
		
		_data = [];
		_grid.setData(_data);
		_totalrecords = 0;
		_currentoffset = 1;
		$('#butprevious').prop("disabled",true);
		$('#gotopage').prop("disabled",true);
		$('#butnext').prop("disabled",true);
		$('#totalpages').text('');
		$('#viewingwhich').text('');
		$('#totalrecords').text(_totalrecords);
		$('#gotopagenumber').val(_currentoffset);
		$('#bulkeditinfo').text(' 0 of 0');
		//set new mapping
		var oldpost = W3Ex[_tempstuff.post_type + '_idmap'];
		if(oldpost !== undefined)
		{
			for (var i = 0; i < oldpost.length; i++) 
			{
			    var item = oldpost[i];
			    if(_mapfield[item.field] !== undefined)
			    {
					delete _mapfield[item.field];
					for (var j = 0; j < _idmap.length; j++) 
					{
						if(_idmap[j].field === item.field)
						{
							_idmap.splice(j,1);
							break;
						}
					}
					for (var k = 0; k < _allcols.length; k++) 
					{
						if(_allcols[k].field === item.field)
						{
							_allcols.splice(k,1);
							break;
						}
					}
				}
			}
		}
		//remove old custom fields
		var cols = {};
		cols = W3Ex.customfields;
		if(cols[_tempstuff.post_type] !== undefined)
		{
			cols = cols[_tempstuff.post_type];
		}
		
		for (var key in cols) 
		{
		    if(cols.hasOwnProperty(key)) 
		    {
		  	   var item = cols[key];
			   if(item === undefined || item.field === undefined) continue;
			    if(_mapfield[item.field] !== undefined)
			    {
					delete _mapfield[item.field];
					for (var j = 0; j < _idmap.length; j++) 
					{
						if(_idmap[j].field === item.field)
						{
							_idmap.splice(j,1);
							break;
						}
					}
					for (var k = 0; k < _allcols.length; k++) 
					{
						if(_allcols[k].field === item.field)
						{
							_allcols.splice(k,1);
							break;
						}
					}
				}
			}
		}	
			
		var currentpost = W3Ex[_current_post_type + '_idmap'];
		if(currentpost !== undefined)
		{
			for (var i = 0; i < currentpost.length; i++) 
			{
			    var item = currentpost[i];
		  		
				var newitem = {};
				newitem.id = item.id;
				newitem.name = item.name;
				newitem.field = item.field;
				if(item.width !== undefined)
					newitem.width = item.width;
					
				if(item.tooltip !== undefined)
				{
					newitem.toolTip = item.tooltip;
				}else
				{
					newitem.toolTip= item.name;
				}
				{
					newitem.editor = Slick.Editors.Text;
					if(item.id === "post_title")
						newitem.formatter = Slick.Formatters.Title;
					if(item.options !== undefined)
					{
						newitem.editor = Slick.Editors.Select;
						newitem.options = item.options;
					}
					if(item.files !== undefined)
					{
						newitem.editor = Slick.Editors.LongText;
					}
					if(item.checkbox !== undefined)
					{
						newitem.cssClass = "cell-effort-driven";
						newitem.formatter = Slick.Formatters.Checkmark;
						newitem.editor = Slick.Editors.Checkbox;
					}
					if(item.date !== undefined)
					{
						newitem.editor = Slick.Editors.CustomDate;
					}
					if(item.textarea !== undefined)
					{
		
						if(W3Ex._global_settings !== undefined && W3Ex._global_settings['usebuiltineditor'] === true)
							newitem.editor = Slick.Editors.TextArea;
						else
							newitem.editor = Slick.Editors.WordPress;
					}
					if(item.image !== undefined)
					{
						newitem.editor = Slick.Editors.Image;
						newitem.formatter = Slick.Formatters.Image;
					}
					if(item.url !== undefined)
					{
	//					newitem.editor = Slick.Editors.Image;
						newitem.formatter = Slick.Formatters.ProductUrl;
					}
					if(item.type !== undefined)
					{
						if(item.type == 'customtaxh')
						{
							newitem.editor = Slick.Editors.Category;
							newitem.scope = SCOPE.PRODALL;
						}else if(item.type == 'customtax')
						{
							newitem.scope = SCOPE.PRODALL;
						}
					}
				}
				newitem.sortable = true;
				_allcols.push(newitem);
				_idmap.push(item);
				_mapfield[item.field] = _idmap.length - 1;
			}
		}
	
		SetCustomFields();
		//end
		var Columns = [];
		var cols = {
				"_post_permalink":170,
				"post_status":70,
				"category":70,
				"post_content":250,
				"_thumbnail_id":80,
				"post_title":250,
				"ID":60
			}
			
			if(W3Ex.colsettings !== undefined && W3Ex.colsettings[_current_post_type] !== undefined) 
				cols = W3Ex.colsettings[_current_post_type];
		
			for (var key in cols) {
			  if (cols.hasOwnProperty(key)) {
//			  		if(key === "ID") continue;
			  	   if(_mapfield[key] === undefined) continue;
			  	   var col = _idmap[_mapfield[key]];
				   if(col === undefined) continue;
				   col.visible = true;
				   var cwidth = parseInt(cols[key]);
				   if(isNaN(cwidth)) cwidth = 50;
				   if(cwidth < 50) cwidth = 50;
			       col.width = cwidth;
				   for(var i=0; i<_allcols.length;i++)
				   {
				   		var column = _allcols[i];
						if(column.field === key)
						{
							var newcol = $.extend(true, {}, column);
							newcol.width = cwidth;
							Columns.unshift(newcol);
							break;
						}
				   }
			  }
			}
			
			Columns.unshift(checkboxSelector.getColumnDefinition());
				
			
			$('.dsettings').each(function()
			{
				var id = $(this).attr('data-id');
				if(cols[id] !== undefined)
				{
					$(this).prop('checked', true);
					$("#bulkdialog tr[data-id='" + id + "']").show();
					$("#selectdialog tr[data-id='" + id + "']").show();
					var id = $(this).attr('id');
					$('#' + id + '_check').css('visibility','visible');
					$('#' + id + ' + label').attr('style', 'font-weight:bold !important;');
				}else
				{
					$(this).prop('checked', false);
					$("#bulkdialog tr[data-id='" + id + "']").hide();
					$("#selectdialog tr[data-id='" + id + "']").hide();
					var id = $(this).attr('id');
					$('#' + id + '_check').css('visibility','hidden');
					$('#' + id + ' + label').attr('style', 'font-weight:normal !important;');
				}
			})
			var oldcols = _grid.getColumns();
			var newlen = oldcols.length;
			var arrData = {};
			while (newlen--) 
			{
				var arritem = {};
			    var newobj = oldcols[newlen];
				arritem.field = newobj.field;
				arritem.width = newobj.width;
				arrData[arritem.field] = arritem.width ;
			}
			W3Ex.colsettings[_tempstuff.post_type] = arrData;
			_grid.setColumns(Columns);
			if(_current_post_type === 'attachment')
			{
				var item = _idmap[_mapfield['post_status']];
				item.scope = SCOPE.NONE;
			}else
			{
				var item = _idmap[_mapfield['post_status']];
				item.scope = SCOPE.PRODALL;
			}
			if(_current_post_type === 'post' || _current_post_type === 'page')
			{
				$('.tdcategoryfilter').css('visibility','visible');
				$('#getvariations').parent().css('visibility','visible');
				if(_current_post_type !== 'post')
					$('.tdcategoryfilter').css('visibility','hidden');
			}else
			{
				$('#getvariations').parent().css('visibility','hidden');
				$('.tdcategoryfilter').css('visibility','hidden');
			}
			
	}
	
	$('body').on('click','.infomessage',function(e)
	{
		if(_timeoutid !== -1)
		{
			clearTimeout(_timeoutid);
		}
		_timeoutid = -1;
		$(this).css('display','none');
	});
	
	
	$(document).keypress(function(e)
	{
	    if(e.which == 13) 
	    {
	    	var $focused = $(document.activeElement);
	    	if ($('#tablesearchfilters').has($focused).length) 
	    	{
			    e.stopPropagation();
			    var offset = $('#getproducts').offset(); // Contains .top and .left
				offset.left -= 20;
				offset.top -= 40;
				$('html, body').animate({
				    scrollTop: offset.top,
				    scrollLeft: offset.left
				});
			    LoadProducts('getproducts');
			}
	       
	    }
	});

	
	$('body').on('click','.butnewattribute',function(e)
	{
		var $but = $(this);
		$but.parent().find('.divnewattribute').show();
		if($but.hasClass('newcat'))
		{
			$('#bulkdialog .selectnewcategory').html($('#bulkcategory').html()).trigger("chosen:updated");
		}
		if($but.hasClass('newcatin'))
		{
			$('.activeeditordiv .selectnewcategory').html($('#bulkcategory').html()).trigger("chosen:updated");
		}
		$but.hide();
	});
	
	$('body').on('click','.butnewattributesave, .butnewattributecancel',function(e)
	{
		var $but = $(this);
		var iscat = false;
		iscat = $but.hasClass('newcat');
		if($but.hasClass('butnewattributesave'))
		{
			var newname = String($but.parent().find('.inputnewattributename').val());
			newname = $.trim(newname);
			if(newname !== "")
			{
				
				$but.parent().parent().find('.divnewattributeerror').html('');
				var attrslug = $but.parent().find('.inputnewattributename').attr('data-slug');
				var newslug = String($but.parent().find('.inputnewattributeslug').val());
				newslug = $.trim(newslug);
//				$but.prop("disabled",true);
				var ajaxarr = {};
				ajaxarr.action = 'wordpress_adv_bulk_edit';
				ajaxarr.type = 'newattribute';
				ajaxarr.name = newname;
				ajaxarr.attrslug = attrslug;
				if(newslug !== '')
				{
					ajaxarr.slug = newslug;
				}
				if(iscat)
				{
					ajaxarr.iscat = true;
					var $select = $but.siblings('.selectnewcategory');
					if($select.val() !== null)
					{
						ajaxarr.parent = $select.val();
						if(ajaxarr.parent instanceof Array && ajaxarr.parent.length > 0)
						{
							ajaxarr.parent = ajaxarr.parent[0];
						}else
						{
							delete ajaxarr.parent;
						}
//						return;
					}
				}
				ajaxarr.nonce = W3ExWABE.nonce;
				$but.append('<div class="showajax"></div>');
				$('.showajax').css({
					left:'4px',
					top:'4px'
				});
				jQuery.ajax({
				     type : "post",
				     dataType : "json",
				     url : W3ExWABE.ajaxurl,
				     data : ajaxarr,
				     complete:function()
				     {
					 	$('.showajax').remove();
				     	$but.prop("disabled",false);
					 },
				     success: function(response) 
				     {
						if(isGood(response) && isGood(response.products))
						{
							if( response.products.errors !== undefined)
							{
								var $diverror = $but.parent().parent().find('.divnewattributeerror');
								var errortext = '';
								for (var key in response.products.errors) 
								{
								  if (response.products.errors.hasOwnProperty(key)) 
								  {
								      if(response.products.errors[key] instanceof Array)
								      {
									  	  for(var i=0; i < response.products.errors[key].length; i++)
									  	  {
										  	 errortext+= response.products.errors[key][i] + '<br/>';
										  }
									  }
								  }
								}
								$diverror.html(errortext);
								return;
							}else
							{
								if(iscat)
								{
									if(isGood(response.products.term_id) && isGood(response.products.term_taxonomy_id))
									{
										var text = '<li><label class="selectit"><input value="'+response.products.term_id+'" type="checkbox" /> '+newname+'</label></li>';
										if(isGood(response.level))
										{
											var $parent = $('.activeeditordiv .categorychecklist input[value="'+ajaxarr.parent+'"]');
											if($parent.length > 0)
											{
												var $child = $parent.parent().siblings('ul');
												if($child.length > 0)
												{
													$child.prepend(text);
												}else
												{
													text = '<ul class="children"><li><label class="selectit"><input value="'+response.products.term_id+'" type="checkbox" /> '+newname+'</label></li></ul>';
													$parent.parent().append(text);
												}
											}else
											{
												$('.activeeditordiv .categorychecklist').prepend(text);
											}
											$parent = $('#categoriesdialog .category input[value="'+ajaxarr.parent+'"]');
											if($parent.length > 0)
											{
												var $child = $parent.parent().siblings('ul');
												if($child.length > 0)
												{
													$child.prepend(text);
												}else
												{
													text = '<ul class="children"><li><label class="selectit"><input value="'+response.products.term_id+'" type="checkbox" /> '+newname+'</label></li></ul>';
													$parent.parent().append(text);
												}
											}else
											{
												$('#categoriesdialog .category .categorychecklist').prepend(text);
											}
//											$('.activeeditordiv .categorychecklist ').prepend(text);
//											$('#categoriesdialog .category ul').prepend(text);
											text = '<option value="'+response.products.term_id+'">'+newname+'</option>';
											var $parent = $('#bulkcategory option[value="'+ajaxarr.parent+'"]');
											if($parent.length > 0)
											{
												if(response.level > 0 && response.level < 100)
												{
													var level = response.level;
													while(level > 0)
													{
														newname = "&nbsp;&nbsp;&nbsp;" + newname;
														level--;
													}
												}
												text = '<option value="'+response.products.term_id+'">'+newname+'</option>';
												$parent.after(text);
											}else
												$("#bulkcategory option:nth-of-type(1)").after(text);
		//									$('#bulk' + attrslug).val([response.products.term_id]);
											$('#bulkcategory').trigger("chosen:updated");
											$parent = $('#selcategory option[value="'+ajaxarr.parent+'"]');
											if($parent.length > 0)
											{
												text = '<option value="'+response.products.term_id+'">'+newname+'</option>';
												$parent.after(text);
											}else
												$("#selcategory option:nth-of-type(1)").after(text);
//											$('#selcategory option:nth-of-type(1)').append(text);
										}else
										{
											$('.activeeditordiv .categorychecklist').prepend(text);
											$('#categoriesdialog .category .categorychecklist').prepend(text);
											text = '<option value="'+response.products.term_id+'">'+newname+'</option>';
											$("#bulkcategory option:nth-of-type(1)").after(text);
		//									$('#bulk' + attrslug).val([response.products.term_id]);
											$('#bulkcategory').trigger("chosen:updated");
											$('#selcategory option:nth-of-type(1)').after(text);
										}
										$('#selcategory').trigger("chosen:updated");
										$but.parent().find('.inputnewattributename').val('');
										$but.parent().find('.inputnewattributeslug').val('');
										$but.parent().parent().find('.butnewattribute').show();
										$but.parent().parent().find('.divnewattribute').hide();
//										$('#bulkdialog .selectnewcategory').chosen("destroy");
									}
								}
							}
						}
				     },
					  error:function (xhr, status, error) 
					  {
						  
					  }
				  }) ;
					
				}else
				{
					return;
				}
		}else
		{
			$but.parent().parent().find('.divnewattributeerror').html('');
			$but.parent().find('.inputnewattributename').val('');
			$but.parent().find('.inputnewattributeslug').val('');
			$but.parent().parent().find('.butnewattribute').show();
			$but.parent().parent().find('.divnewattribute').hide();
//			if(iscat)
//				$('#bulkdialog .selectnewcategory').chosen("destroy");
		}
		
	});
	
	$('body').on('keyup','.showorcheckbox',function(e)
	{
		var text = $(this).val();
		text = $.trim(text);
		var res = text.split(" "); 
		if(res.length > 1)
		{
			if($(this).parent().find('.orcheckbox').length === 0)
				$(this).parent().append('<select class="orcheckbox" style="width:auto;"><option value="AND">AND</option><option value="OR">OR</option></select>');
//				<label><input type="checkbox" class="orcheckbox" style="width:auto;"/>OR</label>
		}
		else
		{
//			if($(this).parent().find('.orcheckbox').length > 0)
				$(this).parent().find('.orcheckbox').remove();
		}
			
	});
	
	$('body').on('keyup','.showmultiplecheckbox',function(e)
	{
		var text = $(this).val();
		text = $.trim(text);
		var res = text.split(","); 
		if(res.length > 1)
		{
			if($(this).parent().find('.multiplecheckbox').length === 0)
				$(this).parent().append('<label class="multiplecheckbox"><input type="checkbox" id="multipleskus" style="width:auto;">Multiple</input></label>');
//				<label><input type="checkbox" class="orcheckbox" style="width:auto;"/>OR</label>
		}
		else
		{
//			if($(this).parent().find('.orcheckbox').length > 0)
				$(this).parent().find('.multiplecheckbox').remove();
		}
			
	});


	$('#buttonviewrename').click(function ()
	{
		var newname = $('#viewinputnewname').val();
		newname = $.trim(newname);
		newname = replaceAll(newname,'"','');
		if(newname === "") return;
		var $sel = $('#viewselectedit :selected');
		var selvalue = $sel.val();
		if(selvalue === "") return;
		if(W3Ex.w3exabe_listviews === undefined) return;
		if(W3Ex.w3exabe_listviews[selvalue] === undefined) return;
		var hasit = false;
		 $('#viewselectedit option').each(function(){
		 	if($(this).val() === newname)
			{
				hasit = true;
				return;
			}
		 });
		 if(hasit) return;
		W3Ex.w3exabe_listviews[newname] = W3Ex.w3exabe_listviews[selvalue];
		delete W3Ex.w3exabe_listviews[selvalue];
		$sel.val(newname);
		$sel.text(newname);
		
	});
	
	$('#buttonviewdelete').click(function ()
	{
		var $sel = $('#viewselectedit :selected');
		var selvalue = $sel.val();
		if(selvalue === "") return;
		if(W3Ex.w3exabe_listviews === undefined) return;
		if(W3Ex.w3exabe_listviews[selvalue] === undefined) return;
		delete W3Ex.w3exabe_listviews[selvalue];
//		$('#viewselectload')
//			    .find('option')
//			    .remove();
		$sel.remove();
	});
	
 	 $('body').on('mouseenter','#bulkdialog .tdbulkvalue',function()
	{
		$(this).find('.mapto').css('visibility','visible');
	});
	
	$('body').on('mouseleave','#bulkdialog .tdbulkvalue',function()
	{
		if($(this).attr('data-mapped') === 'yes')
			return;
		$(this).find('.mapto').css('visibility','hidden');
	});
	
	$('body').on('click','#bulkdialog .imgButton.sm',function(e)
	{
		
    	$('#maptodialog').remove();
		$(this).css('visibility','hidden');
	  var $container = $(this).parent();
	  var field = $container.parent().attr('data-id');
	  _selectedFieldMap = field;
	   var wrapper = $(this);
    var parentOffset = wrapper.position(); 
    var posX = parentOffset.left + $container.scrollLeft();
    var posY = parentOffset.top + $('#bulkdialog').scrollTop();
//	   var offset = $(this).offset();
//    var posX = e.pageX ;
//    var posY = e.pageY;
//	  var posX = $(this).position().left,
//          posY = $(this).position().top;
      $wrapper = $("<DIV style='z-index:300005;position:absolute;background:white;padding:25px;padding-top:12px;padding-bottom:12px;border:3px solid gray; -moz-border-radius:10px; border-radius:10px;min-width:150px;top:"+posY+"px;left:"+posX+"px;' id='maptodialog'/>")
          .appendTo($container);
	   $('<div><label>Copy values from field:</label></div><hr>').appendTo($wrapper);
	   
      $input = $("<div style='max-height:350px;overflow:auto;' class='editormapfields'></div>")
          .appendTo($wrapper);
	  var selecthtml = '<select id="selectmapfield">';
	  selecthtml+= '<option value="copyfromparent">Copy from parent</option>';
	    for(var i=0; i < _idmap.length; i++)
		{
			var col = _idmap[i];
			if(col.type !== 'customtaxh' && col.type !== 'int' && col.type !== 'float2' && col.type !== 'float3'  && col.type !== 'text'  && col.type !== 'multitext' && (col.field !== 'product_tag' && col.field !== 'category'))
				continue;
			if(_mapfield[col.field] === undefined)
				continue;
			if(col.field === field) continue;
			
			selecthtml+= '<option value="'+col.field+'">'+col.name+'</option>';
		}
		selecthtml+= '</select><br/>';
     	$(selecthtml).appendTo($input);
		
	  $("<DIV style='text-align:right'><BUTTON class='mapfieldto'>OK</BUTTON><BUTTON class='cancelmapfieldto'>Cancel</BUTTON></DIV>")
          .appendTo($wrapper);
		  
		
			
		
	});
	
	$('body').on('click','#stopbatches',function(e)
	{
		_stopbatches = true;
	});

	$('body').on('click','#bulkdialog .mapfieldto',function()
	{
		var mappedto = $('#maptodialog select').val();
		$('#maptodialog').remove();
		var $tr = $('#bulkdialog tr[data-id="'+_selectedFieldMap+'"]');//_selectedFieldMap
		if($tr.length === 0) return;
		var remhtml = '<div style="visibility:visible;" class="imgButton med remove"></div>';
		var $td = $tr.find('td:nth-child(3)');
		$td.find('.imgButton.remove').remove();
		$td.find('label').remove();
		$td.prepend(remhtml);
		var $addbutton = $td.find('.imgButton.mapto');
		$addbutton.css('visibility','visible');
		$td.attr('data-mapped','yes');
		$td.attr('data-mappedto',mappedto);
		var fieldname = "";
		
		if(_idmap[_mapfield[mappedto]] !== undefined)
		{
			fieldname = _idmap[_mapfield[mappedto]].name;
		}
		if(mappedto === "copyfromparent")
		{
			fieldname = "Copy from parent";
		}
		var type = "";
		if(_idmap[_mapfield[_selectedFieldMap]] !== undefined)
		{
			type = _idmap[_mapfield[_selectedFieldMap]].type;
		}
		if(mappedto === "copyfromparent")
		{
			type = "int";
		}
		remhtml = "<label>from: "+fieldname+"<label>";
		$(remhtml).insertAfter($addbutton);
		if(type === "int" || type === "float2" || type === "float3")
		{
			if($tr.find('td:nth-child(2) select').val() === 'new')
			{
				$td.find('.bulkvalue').hide();
			}
		}else
		{
			if($tr.find('td:nth-child(2) select').val() !== 'replace')
			{
				$td.find('.bulkvalue').hide();
			}
		}
		
	});
	
	$('body').on('click','#bulkdialog .imgButton.remove',function()
	{
		$(this).parent().attr('data-mapped','');
		$(this).parent().find('label').remove();
		$(this).parent().find('.bulkvalue').show();
		$(this).remove();
	});
	
	
	$('body').on('change','#bulkdialog .bulkselectinteger',function()
	{
    	var item = $(this);
		var column = item.attr('data-id');
		var what = $(this).val();
		var $tr = $(this).parent().parent();
		var $thirdtd = $tr.find('td:nth-child(3)');
//		if(what === 'incpercent' || what === 'decpercent')
//		{
//			$('#bulk'+column+'_round').show();
//		}else
//		{
//			$('#bulk'+column+'_round').hide();
//		}
		if(what === 'new')
		{
			if($thirdtd.attr('data-mapped') === 'yes')
			{
				$thirdtd.find('.imgButton.remove').show();
				$thirdtd.find('label').show();
				$tr.find('.bulkvalue').hide();
			}
		}else
		{
			$tr.find('.bulkvalue').show();
		}
	});
	
	$('body').on('change','#datefilterselect',function()
	{
    	var item = $(this);
		var what = $(this).val();
		if(what === 'between')
		{
			$('#datefilter2').show();
		}else
		{
			$('#datefilter2').hide();
		}
	});
	
	
	$('body').on('change','#bulkdialog .bulksetdecimal',function()
	{
    	var item = $(this);
		var column = item.attr('data-id');
		var what = $(this).val();
		var $tr = $(this).parent().parent();
		var $thirdtd = $tr.find('td:nth-child(3)');
		if(what === 'incpercent' || what === 'decpercent')
		{
			$('#bulk'+column+'_round').show();
		}else
		{
			$('#bulk'+column+'_round').hide();
		}
		if(what === 'new')
		{
			if($thirdtd.attr('data-mapped') === 'yes')
			{
				$thirdtd.find('.imgButton.remove').show();
				$thirdtd.find('label').show();
				$tr.find('.bulkvalue').hide();
			}
		}else
		{
			$tr.find('.bulkvalue').show();
		}
	});

		$('body').on('keyup','#searchcheckboxes',function()
		{
			var value = $(this).val();
			$('.editorcats label').each(function()
			{
				var text = $(this).text();
				text = text.toUpperCase();
				value = value.toUpperCase();
				if(text.indexOf(value) !== -1)
				{
					$(this).css('display','inline-block');
				}else
				{
					$(this).css('display','none');
				}
			})
		})
	
	$('body').on('keyup','#searchsettings',function()
	{
		var value = $(this).val();
		$('#settingsdialog tr').each(function()
		{
			var $tr = $(this);
			value = value.toUpperCase();
			var hasit = false;
//			var $td = null;
			$tr.find('label').each(function()
			{
				var text = $(this).text();
				text = $.trim(text);
				text = text.toUpperCase();
				if(text.indexOf(value) !== -1)
				{
//					$(this).parent().css('display','inline-block');
					if(value === "")
						$(this).parent().removeClass('highlighttd').next().removeClass('highlighttd');
					else
						$(this).parent().addClass('highlighttd').next().addClass('highlighttd');

//					$td = $(this).parent();
//					$td.css('display','inline-block');
					hasit = true;
				}
				else
				{
					$(this).parent().removeClass('highlighttd').next().removeClass('highlighttd');
				}
			})
			if(hasit)
			{
				$tr.css('display','');
			}else
			{
				$tr.css('display','none');
			}
			
		})
	})
	
	$('body').on('keyup','#searchfilters',function()
	{
		var value = $(this).val();
		$('#tablesearchfilters tr').each(function()
		{
			var $tr = $(this);
			value = value.toUpperCase();
			var hasit = false;
//			var $td = null;
			var counter = 0;
			$tr.find('td').each(function()
			{
				if(counter === 0 || counter === 2)
				{
					var text = $(this).text();
					text = $.trim(text);
					text = text.toUpperCase();
					if(text.indexOf(value) !== -1)
					{
	//					$(this).parent().css('display','inline-block');
						if(value === "")
							$(this).removeClass('highlighttd').next().removeClass('highlighttd');
						else
							$(this).addClass('highlighttd').next().addClass('highlighttd');

	//					$td = $(this).parent();
	//					$td.css('display','inline-block');
						hasit = true;
					}
					else
					{
						$(this).removeClass('highlighttd').next().removeClass('highlighttd');
					}
				}
				
				counter++;
			})
			if(hasit)
			{
				$tr.css('display','');
			}else
			{
				$tr.css('display','none');
			}
			
		})
	})

	$('body').on('click','#categoryshow',function()
	{
		var $but = $(this);
		if($but.text() === "checked")
		{
			$('.editorcats input').each(function()
			{
				if(!$(this).is(':checked'))
				{
					$(this).parent().css('display','none');
				}else
				{
					$(this).parent().css('display','inline-block');
				}
			})
			$but.text('show all');
		}else
		{
			$('.editorcats label').each(function()
			{
				{
					$(this).css('display','inline-block');
				}
			})
			$but.text('checked');
		}
	});
	
	$('body').on('change','.bulkselect',function()
    {
    	var what = $(this).val();
		var $tr = $(this).parent().parent();
		if(what === "replace" || what === "delete" || what === "replaceregexp")
		{
			if(what === "replace" || what === "replaceregexp")
			{
				$tr.find('.divwithvalue').show();
				$tr.find('.labelignorecase').show();
			}
			$tr.find('.bulkvalue').show();
			var $thirdtd = $tr.find('td:nth-child(3)');
			$thirdtd.find('.imgButton.mapto').hide();
//			if($thirdtd.attr('data-mapped') === 'yes')
			{
				$thirdtd.find('.imgButton.remove').hide();
				$thirdtd.find('label').hide();
			}
		}else
		{
			$tr.find('.divwithvalue').hide();
			$tr.find('.labelignorecase').hide();
			var $thirdtd = $tr.find('td:nth-child(3)');
			$thirdtd.find('.imgButton.mapto').show();
			if($thirdtd.attr('data-mapped') === 'yes')
			{
				$thirdtd.find('.imgButton.remove').show();
				$thirdtd.find('label').show();
				$tr.find('.bulkvalue').hide();
			}
		}
	})
	
	$('body').on('click','#maptodialog .cancelmapfieldto',function()
	{
		$('#maptodialog').remove();
	});


	$('body').on('click','#savecheckshowthumbnails',function()
	{
		var ajaxarr = {};
		ajaxarr.action = 'wordpress_adv_bulk_edit';
		ajaxarr.type = 'savecheckshowthumbnails';
		ajaxarr.nonce = W3ExWABE.nonce;
		ajaxarr.showthumbnails = 0;
		if($('#checkshowthumbnails').is(':checked'))
		{
			ajaxarr.showthumbnails = 1;
		};
		jQuery.ajax({
		     type : "post",
		     dataType : "json",
		     url : W3ExWABE.ajaxurl,
		     data : ajaxarr,
		     success: function(response) {
			 	
		     }
		  }) ;
	});
	

	$('body').on('click','#saveopenimageforedit',function()
	{
		
		var ajaxarr = {};
		ajaxarr.action = 'wordpress_adv_bulk_edit';
		ajaxarr.type = 'saveopenimageforedit';
		ajaxarr.nonce = W3ExWABE.nonce;
		ajaxarr.openimage = 0;
		if($('#openimageforedit').is(':checked'))
		{
			ajaxarr.openimage = 1;
		};
		jQuery.ajax({
		     type : "post",
		     dataType : "json",
		     url : W3ExWABE.ajaxurl,
		     data : ajaxarr,
		     success: function(response) {
			 	
		     }
		  }) ;
	});
	
	$('body').on('click','#saveusebuiltin',function()
	{
		
		var ajaxarr = {};
		ajaxarr.action = 'wordpress_adv_bulk_edit';
		ajaxarr.type = 'saveusebuiltin';
		ajaxarr.nonce = W3ExWABE.nonce;
		ajaxarr.usebuiltineditor = 0;
		if($('#usebuiltineditor').is(':checked'))
		{
			ajaxarr.usebuiltineditor = 1;
		};
		jQuery.ajax({
		     type : "post",
		     dataType : "json",
		     url : W3ExWABE.ajaxurl,
		     data : ajaxarr,
		     success: function(response) {
			 	
		     }
		  }) ;
	});
	
	$('body').on('click','#showselectedonly',function()
	{
		var selectedRows = _grid.getSelectedRows();
		if(selectedRows.length === 0) return;
		
		var newselection = [];
		
		if(W3Ex._global_settings.inselectionmode !== true)
		{
			_dataAllTemp = $.extend(true, [], _data);
			for (var i = _data.length -1; i >= 0; i--)
			{
				var selitem = _data[i];
				if(selitem === undefined) continue;
				_dataAllMapIDS[selitem.ID] = i;
			}
		}
		
		W3Ex._global_settings.inselectionmode = true;
		
		for (var i = _data.length -1; i >= 0; i--)
		{
			if($.inArray(i,selectedRows) === -1)
				_data.splice(i,1);
		}
   			
   		for (var i = 0; i < _data.length; i++)
   			newselection.push(i);
   			
   		_grid.setData(_data);
		_grid.setSelectedRows(newselection);
		HandleQuickAreaHide();
	});
	
	$('body').on('click','#showallproducts',function()
	{
		
		
		
		var selectedRows = _grid.getSelectedRows();
		var newselection = [];
		
		if(selectedRows.length > 0) 
		{
			for (var i = selectedRows.length -1; i >= 0; i--)
			{
				var index = selectedRows[i];
				var selitem = _data[index];
				if(selitem === undefined) continue;
				if(_dataAllMapIDS[selitem.ID] !== undefined)
				{
					if(_dataAllTemp[_dataAllMapIDS[selitem.ID]] !== undefined)
					{
						newselection.push(_dataAllMapIDS[selitem.ID]);
					}
				}
			}
		}
		if(W3Ex._global_settings.invalidateimages === true)
		{
			if(W3Ex._global_settings.inselectionmode === true)
			{
				for (var i = _data.length -1; i >= 0; i--)
				{
					var selitem = _data[i];
					if(selitem === undefined) continue;
					if(_dataAllMapIDS[selitem.ID] !== undefined)
					{
						if(_dataAllTemp[_dataAllMapIDS[selitem.ID]] !== undefined)
						{
							var inner = _dataAllTemp[_dataAllMapIDS[selitem.ID]];
							if(selitem._thumbnail_id !== undefined)
							{
								inner._thumbnail_id = selitem._thumbnail_id;
								if(selitem._thumbnail_id_val !== undefined)
								{
									inner._thumbnail_id_val = selitem._thumbnail_id_val;
								}
								if(selitem._thumbnail_id_original !== undefined)
								{
									inner._thumbnail_id_original = selitem._thumbnail_id_original;
								}
							}
							if(selitem._product_image_gallery !== undefined)
							{
								inner._product_image_gallery = selitem._product_image_gallery;
								if(selitem._product_image_gallery_val !== undefined)
								{
									inner._product_image_gallery_val = selitem._product_image_gallery_val;
								}
								if(selitem._product_image_gallery_original !== undefined)
								{
									inner._product_image_gallery_original = selitem._product_image_gallery_original;
								}
							}
						}
					}
				}
				
			}
			W3Ex._global_settings.invalidateimages = false;
		}
		
		_data = $.extend(true, [], _dataAllTemp);
		
		_dataAllTemp = [];
		_dataAllMapIDS = {};
		
		W3Ex._global_settings.inselectionmode = false;
   			
   		_grid.setData(_data);
		_grid.setSelectedRows(newselection);
		
		HandleQuickAreaHide();
	});
	
	$('body').on('click','#backlink',function()
	{
		var height = _reserved.tableheight;
		var styles = {
		      position : "relative",
		      width:"100%",
		      height:height,
		      zIndex:"0",
		      top:"0"
		    };
		    $("#myGrid").css(styles);
		$( "div.wrap" ).css("height","");
//		_reserved.tableheight = $("#myGrid").css('height');
		$( "#gridholder" ).prepend( $("#myGrid") );
		$("#backlink").hide();
		if(_reserved.tablesearchfilters === 1)
		{
			$("#tablesearchfilters").show();
		}
		_grid.resizeCanvas();
		setTimeout(function(){$(document ).scrollTop(_reserved.scrolltop)}, 100);
	});
	
	$('body').on('click','#gofullscreen',function()
	{
		
		var styles = {
		      position : "absolute",
		      left: "0",
		      right:"0",
		      top:"20px",
		      bottom:"0",
		      width:"99%",
//		      height:"99%",
		      zIndex:"2"
		    };
		_reserved.scrolltop = $(document ).scrollTop();
		_reserved.tableheight = $("#myGrid").css('height');
		var domRect = $('div.wrap').offset();
		var clientoffset = 20;
		if($("#wpbody").length > 0)
		{
			 domRect = $("#wpbody").offset();
			 clientoffset = 30;
		}
		_reserved.domrect = domRect;
//		console.log(domRect.top);
		if(!$("#tablesearchfilters").is(":hidden"))
		{
			$("#tablesearchfilters").hide();
			_reserved.tablesearchfilters = 1;
		}else
		{
			_reserved.tablesearchfilters = 0;
		}
		
		$( "div.wrap" ).css("height","0px");
		$( "div.wrap" ).prepend( $("#myGrid") );
		$("#myGrid").css(styles);
		
		var bodyheight = $(window).innerHeight();
		var newh = bodyheight - domRect.top - clientoffset;
//		console.log(bodyheight);
		$("#myGrid").css('height',newh+'px');
		_grid.resizeCanvas();
		$("#backlink").show();
		
		
		HandleQuickAreaHide();
	});
	
	  var checkboxSelector = new Slick.CheckboxSelectColumn({
      cssClass: "slick-cell-checkboxsel"
    });


	$( "#pluginsettingstab" ).tabs();
	
	if(!isNaN($('#productlimit').val()))
	{
		_recordslimit = parseInt($('#productlimit').val());
		if(isNaN(_recordslimit))
			_recordslimit = 1000;
		else if(_recordslimit <= 0)
		{
			_recordslimit = 1000;
		}
		
	}
		
	if(W3Ex._w3esetting_filter_height !== undefined)
	{
//		var height = W3Ex._w3esetting_filter_height;
//		height = parseInt(height);
//		if(!isNaN(height) && height > 50)
		{
//			height = height.toString();
//			$('#tablesearchfilters').css('display','block');
//			$('#tablesearchfilters').css('max-height',height + 'px');
		}
	}
	if(W3Ex._w3esetting_disablesafety !== undefined && W3Ex._w3esetting_disablesafety === true)
	{
		_disablesafety = true;
	}
	
	if($('#debugmode').is(':checked'))
	{
		_debugmode = true;
	}			
	else
	{
		_debugmode = false;
	}
	
	$('#butprevious').prop("disabled",true);
	$('#gotopage').prop("disabled",true);
	$('#butnext').prop("disabled",true);
	
	function GetSelectedStatus()
	{
		var selectedRows = _grid.getSelectedRows();
		var hasselected = false;
		var hasedited = false;
		for(var ir=0; ir < selectedRows.length; ir++)
		{
			var rowid = selectedRows[ir];
			if(rowid === undefined) continue;
			if(_data[rowid] === undefined) continue;
			hasselected = true;
			break;
		}
		
		for(var ir=0; ir < _arrEdited.length; ir++)
		{
			var row = _arrEdited[ir];
			if(row === undefined) continue;
			
			for (var key in row) 
			{
			  if (row.hasOwnProperty(key)) 
			  {
			     hasedited  = true;
				 break;
			  }
			}
			if(hasedited) break;
		}
		var seltext= "";
		var alltext = "";
		var status = "To change table view you need to save/revert changes first";
		var showsel = "Show Selected Only";
		var showall = "Show All";
//		var save = "Save";
		if(W3Ex._translate_strings["trans_sell_status"] !== undefined)
			status = W3Ex._translate_strings["trans_sell_status"];
		if(W3Ex._translate_strings["trans_show_sell"] !== undefined)
			showsel = W3Ex._translate_strings["trans_show_sell"];
		if(W3Ex._translate_strings["trans_show_all"] !== undefined)
			showall = W3Ex._translate_strings["trans_show_all"];
//		if(W3Ex._translate_strings["trans_save"] !== undefined)
//			save = W3Ex._translate_strings["trans_save"];
		var statustext = '<tr><td colspan="2">'+status+'</td></tr>';
		if(!hasedited)
		{
			statustext = "";
		} 
//		W3Ex._global_settings
		if(hasselected && !hasedited)
		{
			seltext = '<input type="button" class="button" id="showselectedonly" value="'+showsel+'"></input>';
			alltext = '<input type="button" class="button" id="showallproducts" value="'+showall+'" disabled="disabled"></input>';
		}else
		{
			seltext = '<input type="button" class="button" id="showselectedonly" value="'+showsel+'" disabled="disabled"></input>';
			alltext = '<input type="button" class="button" id="showallproducts" value="'+showall+'" disabled="disabled"></input>';
		}
		if(!hasedited)
		{
			if(W3Ex._global_settings.inselectionmode === true)
			{
				alltext = '<input type="button" class="button" id="showallproducts" value="'+showall+'"></input>';
			}
		}
		var ret = '<table cellpadding="10" cellspacing="0" class="quicksettingstable"><tr> \
					<td width="50%" style="text-align:center;">\
						'+seltext+' \
					</td> \
					<td style="text-align:center;">\
						'+alltext+' \
					</td> \
				</tr>'+statustext+'</table> ';
		return ret;
	}
	
	$('body').on('mouseenter','#quicksettingsarea',function()
	{
		{
			var hover = "Show larger images on hover";
			var sedit = "Clicking on image goes straight to edit";
			var usebuilt = "Use built-in editor when editing descriptions";
			var save = "Save";
			if(W3Ex._translate_strings["trans_images_hover"] !== undefined)
				hover = W3Ex._translate_strings["trans_images_hover"];
			if(W3Ex._translate_strings["trans_straight_edit"] !== undefined)
				sedit = W3Ex._translate_strings["trans_straight_edit"];
			if(W3Ex._translate_strings["trans_use_builtin"] !== undefined)
				usebuilt = W3Ex._translate_strings["trans_use_builtin"];
			if(W3Ex._translate_strings["trans_save"] !== undefined)
				save = W3Ex._translate_strings["trans_save"];
			if($('.quicksettingsextra').length > 0)
			{
				$('.quicksettingsextra').show();
				$('#divselectstatus').html(GetSelectedStatus());
				return;
			}
			var showthumbs = "";
			if(W3Ex._global_settings['showthumbnails'] === true)
			{
				showthumbs = "checked";
			}
			var openimage = "";
			if(W3Ex._global_settings['openimage'] === true)
			{
				openimage = "checked";
			}
			var usebuiltin = "";
			if(W3Ex._global_settings['usebuiltineditor'] === true)
			{
				usebuiltin = "checked";
			}
			var usedeleteimages = "";
			if(W3Ex._global_settings['deleteimages'] === true)
			{
				usedeleteimages = "checked";
			}
			$(this).append('<div class="quicksettingsextra"> \
			<table cellpadding="4" cellspacing="0" class="quicksettingstable"> \
				<tr> \
					<td> \
						<label><input type="checkbox" id="checkshowthumbnails" '+showthumbs+'>'+hover+'</label> \
					</td> \
					<td> \
						<input type="button" class="button" id="savecheckshowthumbnails" value="'+save+'"></input> \
					</td> \
					</tr> \
				<tr> \
					<td>\
						<label><input type="checkbox" id="openimageforedit" '+openimage+'>'+sedit+'</label> \
					</td> \
					<td>\
						<input type="button" class="button" id="saveopenimageforedit" value="'+save+'"></input> \
					</td> \
				</tr>  \
				<tr> \
					<td>\
						<label><input type="checkbox" id="usebuiltineditor" '+usebuiltin+'>'+usebuilt+'</label> \
					</td> \
					<td>\
						<input type="button" class="button" id="saveusebuiltin" value="'+save+'"></input> \
					</td> \
				</tr>  \
			</table>  \
				<div id="divselectstatus">'+GetSelectedStatus()+'</div> \
				<div id="divextrabuttons">\
				<table cellpadding="10" cellspacing="0" class="quicksettingstable"><tr> \
					<td width="50%" style="text-align:center;">\
						<input type="button" class="button" id="gofullscreen" value="Full View"></input> \
					</td> \
					<td style="text-align:center;">\
						 \
					</td> \
				</tr></table>\
				</div> \
			</div>');
		}
//		$('.quicksettingsextra').css('left','-' + String($('.quicksettingsextra').width()/2 - $('#quicksettingsbut').width()/2) + 'px');
		$('.quicksettingsextra').show();
	});
	
	function HandleQuickAreaHide()
	{
		if($('#checkshowthumbnails').is(':checked'))
		{
			W3Ex._global_settings['showthumbnails'] = true;
		}else
		{
			W3Ex._global_settings['showthumbnails'] = false;
		}
		if($('#openimageforedit').is(':checked'))
		{
			W3Ex._global_settings['openimage'] = true;
		}else
		{
			W3Ex._global_settings['openimage'] = false;
		}
		if($('#deleteimage').is(':checked'))
		{
			W3Ex._global_settings['deleteimage'] = true;
		}else
		{
			W3Ex._global_settings['deleteimage'] = false;
		}
		var changed = false;
		if($('#usebuiltineditor').is(':checked'))
		{
			if(W3Ex._global_settings['usebuiltineditor'] !== true)
			{
				changed = true;
			}
			W3Ex._global_settings['usebuiltineditor'] = true;
		}else
		{
			if(W3Ex._global_settings['usebuiltineditor'] === true)
			{
				changed = true;
			}
			W3Ex._global_settings['usebuiltineditor'] = false;
		}
		var cols = _grid.getColumns();
//		var index = _grid.getColumnIndex("post_content");
//		if(index !== undefined)
//		{
//			if(W3Ex._global_settings['usebuiltineditor'] === true)
//			{
//				cols[index].editor =  Slick.Editors.TextArea;
//			}else
//			{
//				cols[index].editor =  Slick.Editors.WordPress;
//			}
//		}
//		var index2 = _grid.getColumnIndex("post_excerpt");
//		
//		if(index2 !== undefined)
//		{
//			if(W3Ex._global_settings['usebuiltineditor'] === true)
//			{
//				cols[index2].editor =  Slick.Editors.TextArea;
//			}else
//			{
//				cols[index2].editor =  Slick.Editors.WordPress;
//			}
//		}
		
		for(var i=0; i<_allcols.length; i++)
		{
			var col = _allcols[i];
//			if(col.field !== "post_content" && col.field !== "post_excerpt")
			var coldef = _idmap[_mapfield[col.field]];
			if(coldef === undefined || coldef.type !== "multitext")
				continue;
			var index = _grid.getColumnIndex(col.field);
			if(W3Ex._global_settings['usebuiltineditor'] === true)
			{
				col.editor =  Slick.Editors.TextArea;
				if(index !== undefined)
				{
					cols[index].editor =  Slick.Editors.TextArea;
				}
			}else
			{
				col.editor =  Slick.Editors.WordPress;
				if(index !== undefined)
				{
					cols[index].editor =  Slick.Editors.WordPress;
				}
			}
		}
		if(changed)
			_grid.setColumns(cols);
		//			if(item.field === 'post_content' || item.field === 'post_excerpt')
//			{
//				if(W3Ex._global_settings !== undefined && W3Ex._global_settings['usebuiltineditor'] === true)
//		    	{
//		    		
//				}
//			}
		$('.quicksettingsextra').hide();
	}
	
	$('body').on('mouseleave','#quicksettingsarea',function()
	{
		HandleQuickAreaHide();
	})
	
	$('body').on('mouseenter','#deletearea',function()
	{
		{
			$('.deleteextra').remove();
			var movet = "Move to Trash";
			var deletep = "Delete Permanently";
			var deletes = "Delete";
			if(W3Ex.trans_movetrash !== undefined && W3Ex.trans_movetrash !== "")
				movet = W3Ex.trans_movetrash;
			if(W3Ex.trans_delperm !== undefined && W3Ex.trans_delperm !== "")
				deletep = W3Ex.trans_delperm;
			if(W3Ex.trans_delete !== undefined && W3Ex.trans_delete !== "")
			{
				deletes = String(W3Ex.trans_delete);
				if(deletes.length > 0)
				{
					deletes = deletes.charAt(0).toUpperCase() + deletes.slice(1);
				}
			}
			$(this).append('<div class="deleteextra"> \
			<table cellpadding="4" cellspacing="0"> \
				<tr> \
					<td> \
						<label><input type="radio" value="0" checked name="deletewhat" id="radiodeletetrash">'+movet+'</label> \
					</td></tr><tr><td>\
						<label><input type="radio" value="1" name="deletewhat" id="radiodeleteperm">'+deletep+'</label> \
					</td> \
				</tr>  \
			</table>  \
			<input id="deletebutr" class="button" type="button" value="'+deletes+'"/> \
			</div>');
		}
		
		$('.deleteextra').show(1,function ()
		{
			;
		});
	});
	
	$('body').on('mouseenter','#addprodarea',function()
	{
		{
			$('.addprodextra').remove();
			var products = "Posts";
			var add = "Add";
			if(W3Ex.trans_products !== undefined && W3Ex.trans_products !== "")
				products = W3Ex.trans_products;
			if(W3Ex.trans_add !== undefined && W3Ex.trans_add !== "")
			{
				add = String(W3Ex.trans_add);
				if(add.length > 0)
				{
					add = add.charAt(0).toUpperCase() + add.slice(1);
				}
			}
			if(W3Ex._global_settings.inselectionmode === true)
			{
				$(this).append('<div class="addprodextra">Disabled when viewing selected posts only !</div>');
			}else
			{
				$(this).append('<div class="addprodextra"> \
				<table cellpadding="14" cellspacing="0"> \
					<tr> \
						<td> \
							<label><input type="radio" value="0" checked name="addprodwhat">'+products+'</label> \
							&nbsp;&nbsp;<input id="addproductsnumber" type="text" value="1" style="width:20px !important;"/> \
						</td></tr> \
				</table>  \
				<input id="addprodbutr" class="button" type="button" value="'+add+'"/> \
				</div>');
			}
		}
		$('.addprodextra').show(1,function ()
		{
			if(W3Ex._global_settings.inselectionmode === true)
				return;
			var selectedRows = _grid.getSelectedRows();
			if(selectedRows.length == 0)
			{
				$('#addprodwhatv').prop("disabled",true);
				return;
			}
			var hasone = false;
			var parentid = 0;
			if($('#linkededit').is(':checked'))
				return;
		});
	});
	
	$('body').on('mouseenter','#duplicateprodarea',function()
	{
		$('.duplicateprodextra').remove();
		var duplicate = "Duplicate";
		var times = "Time(s)";
		if(W3Ex.trans_duplicate !== undefined && W3Ex.trans_duplicate !== "")
		{
			duplicate = String(W3Ex.trans_duplicate);
//			if(duplicate.length > 0)
//			{
//				duplicate = duplicate.charAt(0).toUpperCase() + duplicate.slice(1);
//			}
		}
		if(W3Ex.trans_times !== undefined && W3Ex.trans_times !== "")
		{
			times = String(W3Ex.trans_times);
		}
		if($('.duplicateprodextra').length === 0)
		{
			if(W3Ex._global_settings.inselectionmode === true)
			{
				$(this).append('<div class="duplicateprodextra">Disabled when viewing selected products only !</div>');
			}else
			{
				$(this).append('<div class="duplicateprodextra"><br/> \
				<table cellpadding="8" cellspacing="0"> \
					<tr> \
						<td><input id="addduplicatesnumber" type="text" value="1" style="width:20px !important;"/> '+times+' \
						</td> \
					</tr>  \
				</table>  \
				<input id="duplicateprodbutr" class="button" type="button" value="'+duplicate+'"/> \
				</div>');
			}	
			$('.duplicateprodextra').show();
		}else
		{
			$('.duplicateprodextra').remove();
		}
	});
	
	$('body').on('mouseenter','.addedvariation, .addedvariation1',function()
	{
		$(this).find('img').css('visibility','visible');
	});
	
	
	$('body').on('mouseleave','.addedvariation, .addedvariation1',function()
	{
		$(this).find('img').css('visibility','hidden');
	});
	
	$('body').on('click','.addedvariation img, .addedvariation1 img',function()
	{
		$parent = $(this).parent();
		if($parent.attr('data-type') === "linkall")
		{
			_linkvarstocreate = {};
		}
		$parent.remove();
		if( $('#linkededit').is(':checked'))
		{
			if($('.addedvariation1').length === 0)
			{
				var has = false;
				$('.addbulkvars').each(function(){
					var attrid = $(this).attr('data-id');
					if(_reserved[attrid] !== undefined && _reserved[attrid].length > 0)
					{
						has = true;
						return false;
					}
				})
				if(!has)
				{
					$('#divbuttonnext').hide();
				}
			}
		}
	});
	
	$('body').on('click','#addprodbutr',function()
	{
		_addprodtype = $('input[name=addprodwhat]:checked').val();
		var selectedRows = _grid.getSelectedRows();
		var parentid = 0;
		var found = false;
		if(_addprodtype == "1")
		{
			if(selectedRows.length == 0) 
			{
				$('.addprodextra').remove();
				return;
			}
			for(var irow=0; irow < selectedRows.length; irow++)
			{
				var rowid = selectedRows[irow];
				if(rowid === undefined) continue;
				if(_data[rowid] === undefined) continue;
				var selitem = _data[rowid];
				if(selitem.post_type == 'product')
				{
					_selectedParent = selitem;
					found = true;
					break;
				}else
				{
					parentid = selitem.post_parent;
				}
			}	 
			if(!found)
			{
				for(var ir=0; ir < _data.length; ir++)
				{
					if(_data[ir] === undefined) continue;
					var selitem = _data[ir];
					if(selitem.ID == parentid)
					{
						_selectedParent = selitem;
						break;
					}
				}	
			}
			$('.addprodextra').remove();
			$("#addproddialog").dialog("open");
			return;
		}
		_productstocreate = $('#addproductsnumber').val();
		_hascreation = true;
		$('.addprodextra').remove();
		SaveChanges('savechanges');
	});
	
	$('body').on('click','#duplicateprodbutr',function()
	{
		_duplicatenumber = $('#addduplicatesnumber').val();
		$('.duplicateprodextra').remove();
		DuplicateProducts();
		
	});
	
	$('body').on('mouseleave','#addprodarea',function()
	{
		$(this).find('div.addprodextra').remove();
	});
	
	$('body').on('mouseleave','#duplicateprodarea',function()
	{
		$(this).find('div.duplicateprodextra').remove();
	});
	
	$('body').on('click','#addcustomattrib',function()
	{
	$('#variationholder1').append('<div class="addedvariation1"><table><tr><td>Name:</td><td><input style="width:80px;" class="attrname" placeholder="Name" name="attrname" value="" type="text"></td></tr>\
			<tr><td>Value(s):</td><td><input style="width:180px;" class="attrvalue" placeholder="Value(s)" name="attrvalue" value="" type="text"></td></tr></table>\
					<img class="delete" src="' + W3Ex.imagepath + 'images/gallerydel.png"></div>');
	    $('#divbuttonnext').show();
//	     $(".ui-dialog-buttonpane button:contains('OK')")
//       .button("enable");
		
	});
					
	
	$('body').on('click','.cancelbulkvar',function()
	{
		$('#bulkvarsdialog').remove();
	})
	
	
	$('body').on('click','.applytoall',function()
	{
		var ischecked = $(this).is(':checked');
//		$('#bulkvarsdialog').find(':checkbox:last').attr('disabled','disabled');
		$('#bulkvarsdialog').find(':checkbox:enabled').prop('checked',ischecked);
	})
	
	$('body').on('click','.addbulkvars',function()
	{
		$('#bulkvarsdialog').remove();
	  var $container = $(this).parent();
	  var attr_name = $(this).attr('data-id');
	  var posX = $(this).position().left,
          posY = $(this).position().top;
	var islinkedediting = $('#linkededit').is(':checked');
      $wrapper = $("<DIV style='z-index:300005;position:absolute;background:white;padding:25px;padding-top:12px;padding-bottom:12px;border:3px solid gray; -moz-border-radius:10px; border-radius:10px;min-width:150px;top:"+posY+"px;left:"+posX+"px;' attr-name='"+attr_name+"' id='bulkvarsdialog'/>")
          .appendTo($container);
	   $('<div><label><input type="checkbox" class="applytoall">check/uncheck all</label></div><hr>').appendTo($wrapper);
	   
      $input = $("<div style='max-height:350px;overflow:auto;' class='editorcats'></div>")
          .appendTo($wrapper);
	 
	 if($('#categoriesdialog .' + attr_name).length === 0)
      {
      	   var W3Ex = window.W3Ex || {};
      	   if(W3Ex[attr_name + 'editorhtml'] === undefined)
      	   {
		   	   var w3exabe = window.w3exabe || {};
		  	   var ajaxarr = {};
				ajaxarr.action = 'wordpress_adv_bulk_edit';
				ajaxarr.type = 'savecustom';
				ajaxarr.nonce = W3ExWABE.nonce;
				ajaxarr.foreditor = 1;
				var $elem = $('.editorcats');
		        $elem.css('position','relative').append('<div class="showajax"></div>');
				$('.showajax').css({
					left:'15px'
				});
				ajaxarr.data = attr_name;
				jQuery.ajax({
				     type : "post",
				     dataType : "json",
				     url : W3ExWABE.ajaxurl,
				     data : ajaxarr,
				     success: function(response) {
				     	if(response !== undefined && response !== null && response.editortext !== undefined && response.editortext !== null)
				     	{
							W3Ex[attr_name + 'editorhtml'] = response.editortext;
							$input.html(response.editortext);
						}
						$('.showajax').remove();
	//							$elem.button("enable");
						
				     },
					  error:function (xhr, status, error) 
					  {
					  	  $('.showajax').remove();
					  },
					  async:false
				  }) ;
		   }else
		   {
		   	   $input.html(W3Ex[attr_name + 'editorhtml']);
		   }
	  	   
	  }
      else
      {
		  $input.html($('#categoriesdialog .' + attr_name).html());
	  }
//	  $input.html($('#categoriesdialog .' + attr_name).html());
     if( $('#linkededit').is(':checked'))
	  	$("<DIV style='text-align:right'><BUTTON class='createbulkvar'>Choose</BUTTON><BUTTON class='cancelbulkvar'>Cancel</BUTTON></DIV>").appendTo($wrapper);
	 else
		$("<DIV style='text-align:right'><BUTTON class='createbulkvar'>Create</BUTTON><BUTTON class='cancelbulkvar'>Cancel</BUTTON></DIV>").appendTo($wrapper);
          
		  
		 if(!islinkedediting)
			$('#bulkvarsdialog .editorcats input').prop('disabled',true);
		 else
		 {
		 	if(_reserved[attr_name] === undefined)
		 		_reserved[attr_name] = [];
		 	for(var i = 0; i < _reserved[attr_name].length; i++)
			{
				$('#bulkvarsdialog input[value="'+_reserved[attr_name][i]+'"]').prop("checked",true);
			}
		 	return;
		 }
		 	
			
		if(_selectedParent.post_type == 'product')
		{
			for (var key in _selectedParent) 
			{
	 			 if (_selectedParent.hasOwnProperty(key)) 
				 {
	  	  		 	 if(_mapfield[key] === undefined) continue;
	  	  			 var col = _idmap[_mapfield[key]];
		  			 if(col === undefined) continue;
					 if(true === col.attribute)
					 {
					 	if(_selectedParent[col.field + '_ids'] !== undefined && _selectedParent[col.field + '_ids'] != "")
						{
							var attrarray = _selectedParent[col.field + '_ids'].split(',');
							for(var i = 0; i < attrarray.length; i++)
							{
								$('#bulkvarsdialog input[value="'+attrarray[i]+'"]').prop("disabled",false);
							}
						}
					 }
				 }
			}
		}
	});
	
	function CreateProducts()
	{
		var ajaxarr = {};
		ajaxarr.action = 'wordpress_adv_bulk_edit';
		ajaxarr.type = 'createproducts';
		ajaxarr.nonce = W3ExWABE.nonce;
		ajaxarr.prodcount = 1;
		ajaxarr.post_type = _current_post_type;
		var prodcount = _productstocreate;
		var changeback = true;
		if(!isNaN(prodcount))
		{
			prodcount = parseInt(prodcount);
			if(prodcount >= 1 && prodcount <=100)
			{
				ajaxarr.prodcount = prodcount;
				changeback = false;
			}else
			{
				if(prodcount > 100)
				{
					ajaxarr.prodcount = 100;
				}
			}
		}
		if(changeback)
		{
			$('#addproductsnumber').val(ajaxarr.count);
			_productstocreate = 1;
		}
		
		$('#myGrid').prepend('<div id="dimgrid" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:102;opacity:0.4;filter: alpha(opacity = 40);background-color:grey;"></div>');
		DisableAllControls(true);
		ajaxarr.data = "";
		jQuery.ajax({
		     type : "post",
		     dataType : "json",
		     url : W3ExWABE.ajaxurl,
		     data : ajaxarr,
		     success: function(response) {
			 		$('#dimgrid').remove();
					DisableAllControls(false);
					$('.showajax').remove();
					if(response.products === undefined || response.products === null)
						return;
		 			_grid.setSelectedRows([]);
			 		var newvars = response.products;
					for(var ir=0; ir < newvars.length; ir++)
					{
						var selitem = newvars[ir];
						selitem.post_title = 'New Post';
					}
					
					var selindexes = [];
					if(_data.length === 0)
					{
						for(var i=0; i<newvars.length; i++) 
						{
					        _data[i] = newvars[i];
//							selindexes.push(i);
					    }
					}else
					{
						for(var ir=0; ir < _data.length; ir++)
						{
							if(_data[ir] === undefined) continue;
							var selitem = _data[ir];
						  	if(ir == 0)
							{
								for(var i=_data.length-1; i>=ir; i--) 
								{
							        _data[i + newvars.length] = _data[i];
							    }
								
							    for(var i=0; i<newvars.length; i++) 
								{
							        _data[i+ir] = newvars[i];
									selindexes.push(i+ir);
							    }
								break;
							}
						}
					}
					_grid.setSelectedRows(selindexes);
					var all = _data.length;
					var seltext = ' '+selindexes.length+' of ' + all;
					if(_totalrecords !== -1)
					{
						_totalrecords+= newvars.length;
						$('#totalrecords').text(_totalrecords);
					}
					GenerateGroupedItems();
					_shouldhandle = false;
					_grid.resetActiveCell();
					_grid.invalidate();
					_shouldhandle = true;	
					
		     },
			 complete:function (args)
			 {
			  	//uncomment to debug
				_hascreation = false;
//			    $('#debuginfo').html(args.responseText);
			 }, error:function (xhr, status, error) 
			  {
			  	//uncomment to debug
				  $('#dimgrid').remove();
				  $('.showajax').remove();
				  DisableAllControls(false);
				  $('#debuginfo').html(xhr.responseText);
			  }
		  }) ;
	}
	
	$('body').on('click','#selectattributes',function()
	{
		$('#bulkvarsdialog').remove();
	  var $container = $(this).parent();
//	  var attr_name = $(this).attr('data-id');
	  var posX = $(this).position().left,
          posY = $(this).position().top;
		
      $wrapper = $("<DIV style='z-index:300005;position:absolute;background:white;padding:25px;padding-top:12px;padding-bottom:12px;border:3px solid gray; -moz-border-radius:10px; border-radius:10px;min-width:150px;top:"+posY+"px;left:"+posX+"px;' id='bulkvarsdialog'/>")
          .appendTo($container);
//	   $('<div><label><input type="checkbox" class="applytoall">check/uncheck all</label></div><hr>').appendTo($wrapper);
	   
      $input = $("<div style='max-height:350px;overflow:auto;' class='editorcats'></div>")
          .appendTo($wrapper);
	 
	  $input.html($('#allattributeslist').html());
	  
      //check existing ones
	  $('#bulkvarsdialog .editorcats :checkbox').each(function(){
			if($('#addproddialog .variationholder input[data-id="'+$(this).val()+'"]').length > 0)
			{
				$(this).attr('checked',true);
			}
			
		})
	  
	  $("<DIV style='text-align:right'><BUTTON class='showattributes'>Show</BUTTON><BUTTON class='cancelbulkvar'>Cancel</BUTTON></DIV>")
          .appendTo($wrapper);
//		$('#bulkvarsdialog .editorcats input').attr('disabled','disabled');
		
	})
	
	$('body').on('click','.showattributes',function()
	{
		var added = false;
		var hasold = false;
		$('#bulkvarsdialog .editorcats :checkbox:checked').each(function(){
			var attrslug = $(this).val();
			var attrname = $(this).attr('data-label')
			if($('#addproddialog .variationholder input[data-id="'+attrslug+'"]').length > 0)
			{
//				$('#addproddialog .variationholder input[data-id="'+$(this).val()+'"]').
				hasold = true;
				return true;
			}
			$("#attributeplaceholder").append('<div class="variationholder">' +attrname+' \
								<input data-id="'+attrslug+'" data-name="'+attrname+'" style="vertical-align:middle;" class="button addbulkvars" type="button" value="Select Terms" /></div>' );
			added = true;
			return true;
							
//			var	instext = '<br/><select data-id="'+attrslug+'">';
//			instext+=	'<option value="">Any '+attrname+'</option>';
//			for (var atkey in  W3Ex.attributes) 
//			{
//	 			 if ( W3Ex.attributes.hasOwnProperty(atkey)) 
//				 {
//				 	var atribut =  W3Ex.attributes[atkey];
//					if(atribut === undefined) continue;
//					if(('attribute_pa_' + atribut.attr) !== attrslug) continue;
//					instext+= '<option value="'+atribut.value+'">'+atribut.name+'</option>';
//				 }
//			}
//			instext+= '<select>';
//			$('.addedvariation').append(instext);
//			added = true;
		})
		
		$('#bulkvarsdialog .editorcats :checkbox:not(:checked)').each(function(){
			if($('#addproddialog .variationholder input[data-id="'+$(this).val()+'"]').length > 0)
			{
				$('#addproddialog .variationholder input[data-id="'+$(this).val()+'"]').parent().remove();
				$('.addedvariation select[data-id="'+$(this).val()+'"]').remove();
			}
		})
		
		if(added)
		{
			if(!hasold && $('#variationholder').length ==0)
			{
//				$("#addproddialog").append('<div><input id="addsinglevar" style="vertical-align:middle;" class="button" type="button" value="Add Single Variation" /><label><input id="skipduplicates" style="vertical-align:middle;" type="checkbox" checked=checked/>'+W3Ex._translate_strings["trans_skipduplicates"]+'</label></div><br/>');
					
//				$("#addproddialog").append('<div id="variationholder"></div>');
			}
		}else
		{
			if(!hasold)
			{
				$("#addsinglevar").parent().remove();
				$("#variationholder").remove();
			}
		}
		
		$('#bulkvarsdialog').remove();
	})
	
	
	function DeleteProducts(ptype,pbatch,ibatch)
	{
		pbatch = typeof pbatch !== 'undefined' ? pbatch : false;
		ibatch = typeof ibatch !== 'undefined' ? ibatch : -1;
//		alert('Disabled in demo');
//		return;
		var ajaxarr = {};
		ajaxarr.action = 'wordpress_adv_bulk_edit';
		ajaxarr.type = 'deleteproducts';
		ajaxarr.nonce = W3ExWABE.nonce;
		var selectedRows = _grid.getSelectedRows();
		var _arrData = [];
		var _arr = {};
		_arr['post_status'] = [];
		var _arrParents = [];
		
		var counter = 0;
		var last = true;
		var totalbatches = 0;
		//create batch
		totalbatches = Math.ceil(selectedRows.length/25);
		if(!pbatch)
		{
			for(var ir=0; ir < selectedRows.length; ir++)
			{
				var rowid = selectedRows[ir];
				if(rowid === undefined) continue;
				if(_data[rowid] === undefined) continue;
				counter++;
				var selitem = _data[rowid];
			  	_arr['post_status'].push(selitem.ID + '$###' + selitem.post_parent + '$###' + 'draft');
			  	if(counter >= 25)
				{
					last = false;
					break;
				}
			}
			
		}else
		{
			ibatch = Number(ibatch);
			for(var ir=0; ir < selectedRows.length; ir++)
			{
				var rowid = selectedRows[ir];
				if(rowid === undefined) continue;
				if(_data[rowid] === undefined) continue;
				if(counter < 25 * ibatch)
			  	{
				 	 counter++;
				 	 continue;
				}
				var selitem = _data[rowid];
			  	_arr['post_status'].push(selitem.ID + '$###' + selitem.post_parent + '$###' + 'draft');
			  	counter++;
			  	if(counter >= 25 * (ibatch+1))
				{
					last = false;
					break;
				}
			}
			
		}
		
		
		var bcon = false;
		for (var key in _arr) 
		{
		  if (_arr.hasOwnProperty(key)) 
		  {
		      _arr[key] = _arr[key].join('#^#');
			  bcon = true;
		  }
		}
		if(!bcon) return;
		
		$('#myGrid').prepend('<div id="dimgrid" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:102;opacity:0.4;filter: alpha(opacity = 40);background-color:grey;"></div>');
		DisableAllControls(true);
		if(!pbatch)
		{
			ajaxarr.firstbatch = 1;
		}
		ajaxarr.data = _arr;
		ajaxarr.deletetype = ptype;
		jQuery.ajax({
		     type : "post",
		     dataType : "json",
		     url : W3ExWABE.ajaxurl,
		     data : ajaxarr,
		     success: function(response) {
		     		$('#dimgrid').remove();
					DisableAllControls(false);
					$('.showajax').remove();
		     		if(response.hasmore !== undefined && response.hasmore === 1 && !last)
					{
						if(response.savingbatch !== undefined)
						{
							$('#bulkeditinfo').text("");
//							if($('#stopbatches').length === 0)
//							{
//								$('#bulkeditinfo').append('<input id="stopbatches" class="button" type="button" value="Stop" />');
//							}
//							$('#bulkedittext').text(W3Ex._translate_strings["trans_saving_batch"] + ": " + response.savingbatch);
							$('#bulkedittext').text("Deleting batch: " + response.savingbatch + "/" + totalbatches);
						}
//						var newvars = response.products;
//						W3Ex._global_settings['var_batch_return'] = W3Ex._global_settings['var_batch_return'].concat(newvars);
						DeleteProducts(ptype,true,response.savingbatch);
						return;
					}
					$('#bulkedittext').text(W3Ex._translate_strings["trans_selected_text"] + ":");
			 		selectedRows.sort(function(a, b){return a-b});
					var deleteRows = [];
					var deleteFromAll = [];
					for(var i=0;i < selectedRows.length;i++ )
					{
						var rowid = selectedRows[i];
						if(rowid === undefined) continue;
						if(_data[rowid] === undefined) continue;
						var selitem = _data[rowid];
						if($.inArray(rowid,deleteRows) === -1)
						{
							deleteRows.push(rowid);
							if(W3Ex._global_settings.inselectionmode === true)
							{
								deleteFromAll.push(selitem.ID);
							}
						}
						
						if(selitem.haschildren !== undefined)
						{
							var parentid = selitem.ID;
							for(var j=0;j < _data.length;j++ )
							{
								var selitemin = _data[j];
								if(selitemin === undefined) continue;
								if(selitemin.ID == parentid) continue;
								if(selitemin.post_parent == parentid)
								{
									if($.inArray(j,deleteRows) === -1)
									{
										deleteRows.push(j);
										if(W3Ex._global_settings.inselectionmode === true)
										{
											deleteFromAll.push(selitemin.ID);
										}
									}
								}
							}
						}
					}
					
					deleteRows.sort(function(a, b){return a-b});
					if(_totalrecords !== -1)
					{
						_totalrecords-= deleteRows.length;
						$('#totalrecords').text(_totalrecords);
					}
					var delrowslength = deleteRows.length;
					var objdelmap = {};
					while(deleteRows.length > 0) 
					{
						var rowid = deleteRows[deleteRows.length -1];
						if(rowid === undefined)
						{
							 deleteRows.pop();
							 continue;
						}
						if(_data[rowid] === undefined)
						{
							 deleteRows.pop();
							 continue;
						}
						_data.splice(rowid,1);
						if(_arrEdited[rowid] !== undefined)
							_arrEdited.splice(rowid,1);
						if(_changed[rowid] !== undefined)
							delete _changed[rowid];
						for(var ir=0; ir < _arrEdited.length; ir++)
						{
							var row = _arrEdited[ir];
							if(row === undefined) continue;
							if(ir > rowid)
							{
								if(objdelmap[ir] === undefined)
								{
									objdelmap[ir] = 1;
								}else
								{
									var temp = parseInt(objdelmap[ir]);
									temp++;
									objdelmap[ir] = temp;
								}
							}
						}
					    deleteRows.pop();
					}
					if(delrowslength > 0)
					{
						for(var ir=0; ir < _arrEdited.length; ir++)
						{
							var row = _arrEdited[ir];
							if(row === undefined) continue;
							if(objdelmap[ir] !== undefined)
							{
								if(ir-objdelmap[ir] >= 0)
								{
									_arrEdited[ir-objdelmap[ir]] = row;
									delete _arrEdited[ir];
								}
							}
							
						}
						var arrchangedkeys = [];
						for (var key in _changed) 
						{
						  if (_changed.hasOwnProperty(key)) 
						  {
						     arrchangedkeys.push(key);
						  }
						}
						arrchangedkeys.sort(function(a, b){return a-b});
						for(var ir=0; ir < arrchangedkeys.length; ir++)
						{
							var row = arrchangedkeys[ir];
							if(row === undefined) continue;
							if(_changed[row] === undefined) continue;
							if(objdelmap[row] !== undefined)
							{
								if(row-objdelmap[row] >= 0)
								{
									_changed[row-objdelmap[row]] = _changed[row];
									delete _changed[row];
								}
							}
						}
					}
					
						  	
					try{
						_grid.removeCellCssStyles("changed");
						_grid.setCellCssStyles("changed", _changed);
					} catch (err) {
						;
					}
					_grid.setSelectedRows([]);
					if(W3Ex._global_settings.inselectionmode === true)
					{
						for(var ir = _dataAllTemp.length -1; ir >= 0; ir--)
						{
							var selitem = _dataAllTemp[ir];
							if(selitem === undefined) continue;
							for(var iri=0; iri < deleteFromAll.length; iri++)
							{
								var rowidin = deleteFromAll[iri];
								if(rowidin === undefined) continue;
								if(selitem.ID === rowidin)
								{
									_dataAllTemp.splice(ir,1);
									break;
								}
							}
						}
						_dataAllMapIDS = {};
						for (var i = _dataAllTemp.length -1; i >= 0; i--)
						{
							var selitem = _dataAllTemp[i];
							if(selitem === undefined) continue;
							_dataAllMapIDS[selitem.ID] = i;
						}
					}
				
					var all = _data.length;
					var seltext = ' 0 of ' + all;
					$('#bulkeditinfo').text(seltext);
					RefreshGroupedItems();
					_shouldhandle = false;
					_grid.resetActiveCell();
					_grid.invalidate();
					_shouldhandle = true;	
		     },
			 complete:function (args)
			 {
			  	//uncomment to debug
//			    $('#debuginfo').html(args.responseText);
			 }, error:function (xhr, status, error) 
			  {
			  	//uncomment to debug
				  $('#dimgrid').remove();
				  $('.showajax').remove();
				  DisableAllControls(false);
				  $('#debuginfo').html(xhr.responseText);
			  }
		  }) ;
	}
	
	function CreateVariations(pbatch,ibatch)
	{
	
		pbatch = typeof pbatch !== 'undefined' ? pbatch : false;
		ibatch = typeof ibatch !== 'undefined' ? ibatch : -1;
	}

	function DuplicateProducts()
	{
		var selectedRows = _grid.getSelectedRows();
		if(selectedRows.length <= 0)
			return;
			
		var ajaxarr = {};
		ajaxarr.action = 'wordpress_adv_bulk_edit';
		ajaxarr.type = 'duplicateproducts';
		ajaxarr.nonce = W3ExWABE.nonce;
		
		var _arrData = [];
		var _arr = {};
		_arr['post_status'] = [];
		var _arrParents = [];
		for(var ir=0; ir < selectedRows.length; ir++)
		{
			var rowid = selectedRows[ir];
			if(rowid === undefined) continue;
			if(_data[rowid] === undefined) continue;
			var selitem = _data[rowid];
			if(selitem.post_type === 'revision')
				continue;
		  	_arr['post_status'].push(selitem.ID + '$###' + selitem.post_parent + '$###' + selitem.post_status);
		}
		var bcon = false;
		for (var key in _arr) 
		{
		  if (_arr.hasOwnProperty(key)) 
		  {
		      _arr[key] = _arr[key].join('#^#');
			  bcon = true;
		  }
		}
		if(!bcon) return;
		
		$('#myGrid').prepend('<div id="dimgrid" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:102;opacity:0.4;filter: alpha(opacity = 40);background-color:grey;"></div>');
		DisableAllControls(true);
		ajaxarr.data = _arr;
		ajaxarr.dupcount = _duplicatenumber;
		jQuery.ajax({
		     type : "post",
		     dataType : "json",
		     url : W3ExWABE.ajaxurl,
		     data : ajaxarr,
		     success: function(response) {
			 		$('#dimgrid').remove();
					DisableAllControls(false);
					$('.showajax').remove();
					
			 		if(response.products === undefined || response.products === null)
						return;
		 			_grid.setSelectedRows([]);
			 		var newvars = response.products;
//					for(var ir=0; ir < newvars.length; ir++)
//					{
//						var selitem = newvars[ir];
//						selitem.post_title = 'New Product';
//					}
//					
					var selindexes = [];
					if(_data.length === 0)
					{
						for(var i=0; i<newvars.length; i++) 
						{
					        _data[i] = newvars[i];
//					        GenerateAttributes(_data[i]);
//							selindexes.push(i);
					    }
					}else
					{
						for(var ir=0; ir < _data.length; ir++)
						{
							if(_data[ir] === undefined) continue;
							var selitem = _data[ir];
						  	if(ir == 0)
							{
								for(var i=_data.length-1; i>=ir; i--) 
								{
							        _data[i + newvars.length] = _data[i];
							    }
								
							    for(var i=0; i<newvars.length; i++) 
								{
							        _data[i+ir] = newvars[i];
									selindexes.push(i+ir);
//									GenerateAttributes(_data[i+ir]);
							    }
								break;
							}
						}
					}
					_grid.setSelectedRows(selindexes);
					var all = _data.length;
					var seltext = ' '+selindexes.length+' of ' + all;
					if(_totalrecords !== -1)
					{
						_totalrecords+= newvars.length;
						$('#totalrecords').text(_totalrecords);
					}
					
					newvars.sort(function(a, b){return a-b});
					
					var addedrowslength = newvars.length;
					
					if(addedrowslength > 0)
					{
						for(var ir=_arrEdited.length -1; ir >=0; ir--)
						{
							var row = _arrEdited[ir];
							if(row === undefined) continue;
							if(ir+addedrowslength >= 0)
							{
								_arrEdited[ir+addedrowslength] = row;
								delete _arrEdited[ir];
							}
						}
						var arrchangedkeys = [];
						for (var key in _changed) 
						{
						  if (_changed.hasOwnProperty(key)) 
						  {
						     arrchangedkeys.push(parseInt(key));
						  }
						}
						arrchangedkeys.sort(function(a, b){return a-b});
						for(var ir=arrchangedkeys.length -1; ir >=0; ir--)
						{
							var row = arrchangedkeys[ir];
							if(row === undefined) continue;
							if(_changed[row] === undefined) continue;
							if(row+addedrowslength >= 0)
							{
								_changed[row+addedrowslength] = _changed[row];
								delete _changed[row];
							}
						}
					}
					
//					RefreshGroupedItems();
//					_shouldhandle = false;
//					_grid.resetActiveCell();
//					_grid.invalidate();
//					_shouldhandle = true;	
					
					$('#dimgrid').remove();
					DisableAllControls(false);
					$('.showajax').remove();
					
					try{
						_grid.removeCellCssStyles("changed");
						_grid.setCellCssStyles("changed", _changed);
					} catch (err) {
						;
					}
					_shouldhandle = false;
					_grid.resetActiveCell();
					_grid.invalidate();
					_shouldhandle = true;	
		     },
			 complete:function (args)
			 {
			  	//uncomment to debug
//			    $('#debuginfo').html(args.responseText);
			 }, error:function (xhr, status, error) 
			  {
			  	//uncomment to debug
				  $('#dimgrid').remove();
				  $('.showajax').remove();
				  DisableAllControls(false);
				  $('#debuginfo').html(xhr.responseText);
			  }
		  }) ;
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////////
//	$('#linkededit').attr('checked','checked');
	////////////////////////////////////////////////////////////////////////////////////////////////
	$("#addproddialog").dialog({			
    autoOpen: false,
    height: 620,
    width:850,
    modal: true,
	draggable:true,
	resizable:false,
	title:"Add Variations",
	closeOnEscape: true,
	create: function (event, ui) {
        $(this).dialog('widget')
            .css({ position: 'fixed'})
    },
	open: function( event, ui ) {
		 var d = $('.ui-dialog:visible');
		 $(d).addClass('dialog-zindez');
		 d[0].style.setProperty('z-index', '300002', 'important');
		 $('.ui-dialog:visible').wrap('<div class="w3exabe w3exabedel" />');
		  $('#addproddialog').css('height','480px');
		   var winH = $(window).height() - 180;
			if(winH < 480)
			{
				 $('#addproddialog').css('height',winH.toString() + 'px');
			}
		  $('.ui-widget-overlay').each(function () {
			 $(this).next('.ui-dialog').andSelf().wrapAll('<div class="w3exabe w3exabedel" />');
		});
		$("#addproddialog").html('');
		var hasattributes = false;
		var islinkedediting = $('#linkededit').is(':checked');
		var trans_attributes = "Attributes";
		var trans_select = "Select";
		var trans_bulkadd = "Bulk Add";
		var trans_addsingle = "Add Single Variation";
		var trans_seldoesnot = "Selected product does not have any attributes or 'used for variations' not checked";
//		var trans_linkednote = "Note ! - Linked editing is turned on, all new variations will be added to all of the selected products. A large number of products * variations can cause a php timeout";
		if(W3Ex.trans_attributes !== undefined && W3Ex.trans_attributes !== "")
			trans_attributes = W3Ex.trans_attributes;
		if(W3Ex.trans_select !== undefined && W3Ex.trans_select !== "")
			trans_select = W3Ex.trans_select;
		if(W3Ex.trans_bulkadd !== undefined && W3Ex.trans_bulkadd !== "")
			trans_bulkadd = W3Ex.trans_bulkadd;
		if(W3Ex.trans_addsingle !== undefined && W3Ex.trans_addsingle !== "")
			trans_addsingle = W3Ex.trans_addsingle;
		if(W3Ex.trans_seldoesnot !== undefined && W3Ex.trans_seldoesnot !== "")
			trans_seldoesnot = W3Ex.trans_seldoesnot;
//		if(W3Ex.trans_linkednote !== undefined && W3Ex.trans_linkednote !== "")
//			trans_linkednote = W3Ex.trans_linkednote;
//		trans_linkednote = "";
//		$("#addproddialog").append('<div id="w3exabe-note">Note! - you need the appropriate attribute columns enabled(if not already).</div>');
		if(islinkedediting)
		{
//			$("#addproddialog").append('<div>'+trans_linkednote+'.</div>');
			$("#addproddialog").append('<br/><div id="attributeplaceholder"><div id="divbuttonnext"><input id="buttonnext" class="button-primary-copied" type="button" value="Next >" /></div><div class="variationholder"> \
			<input id="selectattributes" class="button" style="vertical-align:middle;" type="button" value="'+trans_select+' '+trans_attributes+'" /><br/><br/> \
			<input id="addcustomattrib" class="button" style="vertical-align:middle;" type="button" value="Add Custom" /> \
			</div></div><div style="clear:both;"></div><br/>' );
			$("#addproddialog").append('<div id="variationholder1"></div>');
			 $(".ui-dialog-buttonpane button:contains('OK')")
       				.button("disable");
			
		}else
		{
			if(_selectedParent.post_type == 'product')
			{
				/////get all attributes
				var selitem = _selectedParent;
				var attrtoget = [];
				if(selitem._product_attributes !== undefined) 
				{
					for (var key in selitem._product_attributes) 
					{
						if (selitem._product_attributes.hasOwnProperty(key)) 
						{
							var attr = selitem._product_attributes[key];
							if(attr.is_taxonomy === 1 && attr.is_variation === 1)
							{
								if(selitem["attribute_" + key + "_ids"] === undefined && selitem["attribute_" + key] === undefined)
								{
									attrtoget.push("attribute_" + key);
								}								
							}
						}
					}
				}
				if(attrtoget.length !== 0)
				{
					var ajaxarr = {};
					ajaxarr.action = 'wordpress_adv_bulk_edit';
					ajaxarr.type = 'savecolumns';
					ajaxarr.post_type = _current_post_type;
					ajaxarr.nonce = W3ExWABE.nonce;
					ajaxarr.colstoload = attrtoget;
					ajaxarr.colstoloadids = String(selitem.ID);
					$("#addproddialog").append('<div class="showajax"></div>');
					jQuery.ajax({
					     type : "post",
					     dataType : "json",
					     url : W3ExWABE.ajaxurl,
					     data : ajaxarr,
					     success: function(response) 
					     {
					     	$('.showajax').remove();
							if(attrtoget.length > 0)
							{
								if(response !== undefined && response !== null && response.products !== undefined && response.products !== null)
								{
									RefreshLoadedFields(response.products);
								}
							}
							
					     },
						  error:function (xhr, status, error) 
						  {
							  $('.showajax').remove();
						  },
						  async:false
					  }) ;
				}
				////
				for (var key in _selectedParent) 
				{
		 			 if (_selectedParent.hasOwnProperty(key)) 
					 {
		  	  		 	 if(_mapfield[key] === undefined) continue;
		  	  			 var col = _idmap[_mapfield[key]];
			  			 if(col === undefined) continue;
						 if(true === col.attribute)
						 {
						 	if(_selectedParent[col.field + '_ids'] !== undefined && _selectedParent[col.field + '_ids'] != "")
							{
								if(_selectedParent[col.field + '_visiblefp'] !== undefined && _selectedParent[col.field + '_visiblefp'] & 2)
								{
									hasattributes = true;
									var attrname = col.name.replace('(attr) ','');
									$("#addproddialog").append('<div class="variationholder">' +attrname+' \
									<input data-id="'+col.field+'" style="vertical-align:middle;" class="button addbulkvars" type="button" value="'+trans_bulkadd+'" /></div>' );
								}
							}
						 }
					 }
				}
				if(_selectedParent._custom_attributes !== undefined && _selectedParent._custom_attributes instanceof Array)
				{
					hasattributes = true;
				}
				$("#addproddialog").append('<div style="clear:both;"></div><br/>');
				if(!hasattributes)
				{
					$("#addproddialog").append(''+trans_seldoesnot+' !');
				}else
				{
					var instext = '';
					var w3exattrs =  {};
					var attrs = {};
					var arr = [];
					var arrval = [];
					var attcounter = 0;
					var counter = 1;
					var levelcounter = 0;
					var obj = {};
					var attrarr = [];
					var mapnames = {};
					
					for (var key in _selectedParent) 
					{
			 			 if (_selectedParent.hasOwnProperty(key)) 
						 {
			  	  		 	 if(_mapfield[key] === undefined) continue;
			  	  			 var col = _idmap[_mapfield[key]];
				  			 if(col === undefined) continue;
				  			 if(key === '_custom_attributes')
				  			 {
				  			 	
									for (var key in _selectedParent._custom_attributes) 
									{
										if (_selectedParent._custom_attributes.hasOwnProperty(key)) 
										{
											var attr = _selectedParent._custom_attributes[key];
											if(attr.is_variation === undefined || attr.is_variation === 0)
													continue;
											var attrslug = W3Ex._w3ex_map_attributes[attr.name];
											if(attrslug === undefined) attrslug = "";
											attrslug = 'attribute_'+attrslug;
											if(attrs[attrslug] === undefined)
												attrs[attrslug] = {};
											 mapnames[attrslug] = attr.name;
											 var values = attr.value.split(W3Ex._w3ex_wc_delimiter); 
										     for(var i = 0; i < values.length; i++)
										     {
											 	var value = $.trim(values[i]);
											 	var valueslug = W3Ex._w3ex_map_attributes[value];
											 	if(valueslug === undefined) valueslug = "";
												attrs[attrslug][replaceAll(value,'"', '&quot;')] = value;
											 }
										}
									}
									
							 	continue;
							 }
						 }
					}
					
					for(var attrib in attrs)
					{
					    if (!attrs.hasOwnProperty(attrib)) 
					    	continue;
						var attrin = {};
						attrin['name'] = attrib;
					    var propcounter = 0;
				    	for(var item in attrs[attrib])
						{
							if (!attrs[attrib].hasOwnProperty(item)) 
					    		continue;
					    	propcounter++;
					    }
					    if(propcounter > 0)
					    {
						    counter = counter * propcounter;
		//				    attrin['propcount'] = propcounter;
		//				    attrin['counter'] = 0;
		//				    attrarr.push(attrin);
						}
					}
					$("#addproddialog").append('<input id="addsinglevar" style="vertical-align:middle;" class="button" type="button" value="'+trans_addsingle+'" />');
					$("#addproddialog").append('<input id="linkallvars" style="vertical-align:middle;" class="button" type="button" value="'+W3Ex._translate_strings["trans_linkallvars"]+' ('+counter+')'+'" />');
					$("#addproddialog").append('<label><input id="skipduplicates" style="vertical-align:middle;" type="checkbox" checked=checked/>'+W3Ex._translate_strings["trans_skipduplicates"]+'</label><br/>');
					$("#addproddialog").append('<div id="variationholder"></div>');
				}
				
			}
			
			
		}
	},
	close: function( event, ui ) {
		$(".w3exabedel").contents().unwrap();
		_reserved = {};
		$(".ui-dialog-buttonpane button:contains('OK')").button("enable");
	},
 	buttons: {
	"OK": function() 
	{	
	
//		for (var key in _varstocreate) 
//		{
//		  if (_varstocreate.hasOwnProperty(key)) 
//		  {
//		      delete _varstocreate[key];
//		  }
//		}
		_varstocreate = {};
		var counter = 0;
		$('.addedvariation').each(function ()
		{
			if($(this).attr('data-type') !== undefined)
				return true;
			var $div = $(this);
			if($('#linkededit').is(':checked'))
			{
				//find all parents
				var parentids = [];
				var selectedRows = _grid.getSelectedRows();
				for(var irow=0; irow < selectedRows.length; irow++)
				{
					var rowid = selectedRows[irow];
					if(rowid === undefined) continue;
					if(_data[rowid] === undefined) continue;
					var selitem = _data[rowid];
					if(selitem.post_type == 'revision')
					{
						var hasitalready = false;
						for (var i = 0; i < parentids.length; i++) 
						{
					        if (parentids[i] == selitem.post_parent) 
							{
								hasitalready = true;
					            break;
					        }
					    }
						if(!hasitalready)
						{
							parentids.push(selitem.post_parent);
						}
						continue;
					}else
					{//maybe inserted from child ?
						var hasitalready = false;
						for (var i = 0; i < parentids.length; i++) 
						{
					        if (parentids[i] == selitem.ID) 
							{
								hasitalready = true;
					            break;
					        }
					    }
						if(!hasitalready)
						{
							parentids.push(selitem.ID);
						}
					}
				}
				
				
					for (var j = 0; j < parentids.length; j++) 
					{
						$div.find('select').each(function ()
			   			{
							var attname = $(this).attr('data-id');
//							if( _idmap[_mapfield[attname]] === undefined) return true;
							if(_varstocreate[counter.toString()] === undefined)
					    	_varstocreate[counter.toString()] = [];
					    	_varstocreate[counter.toString()].push(parentids[j] + '$###' +attname + '$###' + $(this).val());
						})
						counter++;
				    }
					
					 
			   
			}else
			{
				$div.find('select').each(function ()
			    {
					  var attname = $(this).attr('data-id');
//					  if( _idmap[_mapfield[attname]] === undefined) return true;
					  if(_varstocreate[counter.toString()] === undefined)
					   	  _varstocreate[counter.toString()] = [];
	//					   _arr[key].push(selitem.ID + '$#' + selitem.post_parent + '$#' + valtoinsert);
					  _varstocreate[counter.toString()].push(_selectedParent.ID + '$###' +attname + '$###' + $(this).val());
					 
			    })
			}
			counter++;
		})
		for (var key in _linkvarstocreate) 
		{
		  if (_linkvarstocreate.hasOwnProperty(key)) 
		  {
		      _varstocreate[counter.toString()] = _linkvarstocreate[key].slice();
		  }
		  counter++;
		}
		 _linkvarstocreate = {};
		for (var key in _varstocreate) 
		{
		  if (_varstocreate.hasOwnProperty(key)) 
		  {
		      _varstocreate[key] = _varstocreate[key].join('#^#');
		  }
		}
		if($('#skipduplicates').is(':checked'))
		{
			W3Ex._global_settings['vars_check_duplicates'] = true;
		}else
		{
			W3Ex._global_settings['vars_check_duplicates'] = false;
		}
		
		_hascreation = true;
		SaveChanges('savechanges');
//		CreateVariations();
	  	$( this ).dialog( "close" );
	},
	Cancel: function()
	{
		  $( this ).dialog( "close" );
	}
	}
});

	$('body').on('mouseleave','#deletearea',function()
	{
		$(this).find('div.deleteextra').remove();
	});
	
	$('body').on('click','#deletebutr',function()
	{
		var selectedRows = _grid.getSelectedRows();
		if(selectedRows.length <= 0)
		{
			 $('.deleteextra').remove();
			 return;
		}
		
		if( $('input[name=deletewhat]').length > 0)
			_deletetype = $('input[name=deletewhat]:checked').val();

		$('.deleteextra').remove();
		_confirmationclick = "delete";
		$("#confirmdialog").dialog("open");	
	});
	
	$("#confirmdialog").dialog({			
    autoOpen: false,
    height: 140,
    width: 380,
    modal: true,
	draggable:true,
	resizable:false,
	title:"Confirm Action",
	closeOnEscape: true,
	create: function (event, ui) {
        $(this).dialog('widget')
            .css({ position: 'fixed'})
    },
	open: function( event, ui ) {
		 var d = $('.ui-dialog:visible');
 		 $(d).addClass('dialog-zindez');
		 d[0].style.setProperty('z-index', '300002', 'important');
		 $('.ui-dialog:visible').wrap('<div class="w3exabe w3exabedel" />');
		  $('.ui-widget-overlay').each(function () {
			 $(this).next('.ui-dialog').andSelf().wrapAll('<div class="w3exabe w3exabedel" />');
		});
		 $('#confirmdialog').css('height','auto');
		 _cancontinueconfirm = false;
		 if(_confirmationclick === "changedpost")
		 {
		  	 $('#confirmregularcontent').hide();
		     $('#confirmpostcontent').show();
		 }else
		 {
		 	 $('#confirmregularcontent').show();
		 	 $('#confirmpostcontent').hide();
		 }
	},
	close: function( event, ui ) {
		$(".w3exabedel").contents().unwrap();
	},
 	buttons: {
	  "OK": function() 
	  {
	  	if(_confirmationclick === "delete")
		{
			 _cancontinueconfirm = true;
		
	  	 	$( this ).dialog( "close" );
		 	 DeleteProducts(_deletetype);
		}else if(_confirmationclick === "save")
		{
		 	$( this ).dialog( "close" );
			SaveChanges();
		}else if(_confirmationclick === "changedpost")
		{
		 	$( this ).dialog( "close" );
		 	ChangePostView();
		}else if(_confirmationclick === "load")
		{
		 	$( this ).dialog( "close" );
			LoadProducts('getproducts');
		}else
		{
			$( this ).dialog( "close" );
		}
	  	
	  },
	  Cancel: function()
	  {
	  	  _cancontinueconfirm = false;
	  	  if(_confirmationclick === "changedpost")
		  {
    	     _current_post_type = _tempstuff.post_type;
			 $('#select_post_type').val(_current_post_type);
		  }
		  $( this ).dialog( "close" );
		  
	  }
	 }
});

	
	
	
	
	$('body').on('click','.deletecustomfield',function()
	{
		var $trtohide = $(this).parents('tr.trcustom');	
		var ctext = $trtohide.find('td:first').text();
		_changedcustom.push(ctext);
		if(_mapfield[ctext] !== undefined)
		{
			if(_idmap[_mapfield[ctext]] !== undefined)
			{
				_idmap[_mapfield[ctext]].isdeleted = true;
			}
		}
		$trtohide.hide(500);//,function ()
//		{
//		  $trtohide.remove();
//		})
	})

	$('body').on('click','.editorcats .clearothersattr input',function()
	{
		var bcheck = true;
		if(!$(this).is(':checked'))
		{
			bcheck = false;
			var val = $(this).attr('value');
			$('.editorcats  .clearothersattr input').each(function ()
			 {
			 	 if( $(this).attr('value') !== val)
				 {
				 	if($(this).is(':checked'))
					{
						bcheck = true;
						return;
					}
				 }
			 })
		}
		
		
		$('.clearothersattr input').prop('checked', false);
		if(bcheck)
			$(this).prop('checked',true);
	})
	
	$('body').on('click','.editorcats .clearothers input',function()
	{
		/*var bcheck = true;
		if(!$(this).is(':checked'))
		{
			bcheck = false;
			var val = $(this).attr('value');
			$('.editorcats  .clearothers input').each(function ()
			 {
			 	 if( $(this).attr('value') !== val)
				 {
				 	if($(this).is(':checked'))
					{
						bcheck = true;
						return;
					}
				 }
			 })
		}
		*/
		
		$('.clearothers input').prop('checked', false);
//		if(bcheck)
		$(this).prop('checked','checked');
	})

	
	$("#addcustomfield").click(function ()
	 {
	 	$(this).hide();
		$('#fieldname').val('');
		$('#fieldname1').val('');
		$('#fieldtype').val('text');
		$('#fieldvisible').val('yes');
		$('#extracustominfo').html('');
		$('.addcontrols').fadeIn();
		$('.addokcancel').fadeIn();
//		$("#addok").button("disable");
	 })
	 

	
	 $("#addcancel").click(function ()
	 {
	 	$('#addcustomfield').show();
		$('.addcontrols').hide();
		$('.addokcancel').hide();
	 })
			
			
    columns.push(checkboxSelector.getColumnDefinition());
	
 	function formatter(row, cell, value, columnDef, dataContext) {
        return value;
    }
	
	
		
	function AddBulkAndSelectFieldsAttributes(attr_slug,attr_name)
	{
		var newhtml = "";
		if(W3Ex[attr_slug + 'bulk'] !== undefined)
			newhtml = W3Ex[attr_slug + 'bulk'];
		if(newhtml === "")
			return;
		var contains = "contains";
		var doesnot = "does not contain";
		var starts = "starts with";
		var ends = "ends with";
		var isempty = "field is empty";
		if(W3Ex.trans_contains !== undefined && W3Ex.trans_contains !== "")
			contains = W3Ex.trans_contains;
		if(W3Ex.trans_doesnot !== undefined && W3Ex.trans_doesnot !== "")
			doesnot = W3Ex.trans_doesnot;
		if(W3Ex.trans_starts !== undefined && W3Ex.trans_starts !== "")
			starts = W3Ex.trans_starts;
		if(W3Ex.trans_ends !== undefined && W3Ex.trans_ends !== "")
			ends = W3Ex.trans_ends;
		if(W3Ex.trans_isempty !== undefined && W3Ex.trans_isempty !== "")
			isempty = W3Ex.trans_isempty;
		$('#bulkdialog table').append(newhtml); 
//			if(customobj.isvisible)
//				$("#bulkdialog tr[data-id='" + attr_slug + "']").show();
		newhtml = '<tr data-id="'+attr_slug+'">\
					<td>\
						'+attr_name+'\
					</td>\
					<td>\
						 <select id="select'+attr_slug+'" class="selectselect" data-id="'+attr_slug+'">\
							<option value="con">'+contains+'</option>\
							<option value="notcon">'+doesnot+'</option>\
							<option value="start">'+starts+'</option>\
							<option value="end">'+ends+'</option>\
							<option value="empty">'+isempty+'</option>\
						</select>\
					</td>\
					<td>\
						<input id="select'+attr_slug+'value" type="text" placeholder="Skipped (empty)" data-id="'+attr_slug+'" class="selectvalue"/>\
					</td>\
					<td>\
					<label><input data-id="'+attr_slug+'" class="selectifignorecase" type="checkbox"> Ignore case</label>\
					</td>\
					<td>\
						<input data-id="'+attr_slug+'" class="checkboxifspecial" type="checkbox">\
						<select class="selectsplit" disabled="disabled"><option value="split">split commas</option><option value="regexp">reg exp</option></select>\
						<select class="selectsplitand" disabled="disabled"><option value="and">AND</option><option value="or">OR</option></select>\
					</td>\
				</tr>';
		$('#selectdialog table').append(newhtml); 
//			if(customobj.isvisible)
//				$("#selectdialog tr[data-id='" + attr_slug + "']").show();
		
	}
	
	function AddBulkAndSelectFields(customobj)
	{
		if(customobj.field === undefined)
			customobj.field = customobj.name;
		var newhtml = "";
		var contains = "contains";
		var doesnot = "does not contain";
		var starts = "starts with";
		var ends = "ends with";
		var isempty = "field is empty";
		var setnew = "set new";
		var prepend = "prepend";
		var append = "append";
		var replacet = "replacetext";
		var incbyvalue = "increase by value";
		var decbyvalue = "decrease by value";
		var incbyper = "increase by %";
		var decbyper = "decrease by %";
		if(W3Ex.trans_contains !== undefined && W3Ex.trans_contains !== "")
			contains = W3Ex.trans_contains;
		if(W3Ex.trans_doesnot !== undefined && W3Ex.trans_doesnot !== "")
			doesnot = W3Ex.trans_doesnot;
		if(W3Ex.trans_starts !== undefined && W3Ex.trans_starts !== "")
			starts = W3Ex.trans_starts;
		if(W3Ex.trans_ends !== undefined && W3Ex.trans_ends !== "")
			ends = W3Ex.trans_ends;
		if(W3Ex.trans_isempty !== undefined && W3Ex.trans_isempty !== "")
			isempty = W3Ex.trans_isempty;
		if(W3Ex.trans_incbyvalue !== undefined && W3Ex.trans_incbyvalue !== "")
			incbyvalue = W3Ex.trans_incbyvalue;
		if(W3Ex.trans_decbyvalue !== undefined && W3Ex.trans_decbyvalue !== "")
			decbyvalue = W3Ex.trans_decbyvalue;
		if(W3Ex.trans_incbyper !== undefined && W3Ex.trans_incbyper !== "")
			incbyper = W3Ex.trans_incbyper;
		if(W3Ex.trans_decbyper !== undefined && W3Ex.trans_decbyper !== "")
			decbyper = W3Ex.trans_decbyper;
		if(W3Ex.trans_setnew !== undefined && W3Ex.trans_setnew !== "")
			setnew = W3Ex.trans_setnew;
		if(W3Ex.trans_append !== undefined && W3Ex.trans_append !== "")
			append = W3Ex.trans_append;
		if(W3Ex.trans_prepend !== undefined && W3Ex.trans_prepend !== "")
			prepend = W3Ex.trans_prepend;
		if(W3Ex.trans_replacetext !== undefined && W3Ex.trans_replacetext !== "")
			replacet = W3Ex.trans_replacetext;
//		if(W3Ex.trans_ends !== undefined && W3Ex.trans_ends !== "")
//			ends = W3Ex.trans_ends;
//		if(W3Ex.trans_isempty !== undefined && W3Ex.trans_isempty !== "")
//			isempty = W3Ex.trans_isempty;
		if(customobj.type == "text" || customobj.type == "custom" || customobj.type == "customh")
		{
			newhtml = '<tr data-id="'+customobj.field+'" class="customfieldtr"> \
						<td> \
							'+customobj.name+'\
						</td>\
						<td>\
							 <select id="bulk'+customobj.field+'" class="bulkselect">\
								<option value="new">'+setnew+'</option>\
								<option value="prepend">'+prepend+'</option>\
								<option value="append">'+append+'</option>\
								<option value="replace">'+replacet+'</option>\
								<option value="replaceregexp">replace regexp</option>\
							</select>\
							<label class="labelignorecase" style="display:none;">\
							<input class="inputignorecase" type="checkbox">\
							Ignore case</label>\
						</td>\
						<td class="tdbulkvalue">\
						<div class="imgButton sm mapto"> \
					    </div> \
							<input id="bulk'+customobj.field+'value" type="text" data-id="'+customobj.field+'" class="bulkvalue" placeholder="Skipped (empty)"/>\
						</td>\
						<td>\
							<div class="divwithvalue" style="display:none;">with text <input class="inputwithvalue" type="text"></div>\
						</td>\
					</tr>';
			if(W3Ex[customobj.field + 'bulk'] !== undefined && customobj.field !== 'post_tag')
				newhtml = W3Ex[customobj.field + 'bulk'];
			$('#bulkdialog table').append(newhtml); 
			if(customobj.isvisible)
				$("#bulkdialog tr[data-id='" + customobj.field + "']").show();
			newhtml = '<tr data-id="'+customobj.field+'" class="customfieldtr">\
						<td>\
							'+customobj.name+'\
						</td>\
						<td>\
							 <select id="select'+customobj.field+'" class="selectselect" data-id="'+customobj.field+'">\
								<option value="con">'+contains+'</option>\
								<option value="notcon">'+doesnot+'</option>\
								<option value="start">'+starts+'</option>\
								<option value="end">'+ends+'</option>\
								<option value="empty">'+isempty+'</option>\
							</select>\
						</td>\
						<td>\
							<input id="select'+customobj.field+'value" type="text" placeholder="Skipped (empty)" data-id="'+customobj.field+'" class="selectvalue"/>\
						</td>\
						<td>\
						<label><input data-id="'+customobj.field+'" class="selectifignorecase" type="checkbox"> Ignore case</label>\
						</td>\
						<td>\
							<input data-id="'+customobj.field+'" class="checkboxifspecial" type="checkbox">\
							<select class="selectsplit" disabled="disabled"><option value="split">split commas</option><option value="regexp">reg exp</option></select>\
							<select class="selectsplitand" disabled="disabled"><option value="and">AND</option><option value="or">OR</option></select>\
						</td>\
					</tr>';
//			if(W3Ex[customobj.name + 'select'] !== undefined)
//				newhtml = W3Ex[customobj.name + 'select'];
			$('#selectdialog table').append(newhtml); 
			if(customobj.isvisible)
				$("#selectdialog tr[data-id='" + customobj.field + "']").show();
		}else if(customobj.type == "multitext")
		{
			newhtml = '<tr data-id="'+customobj.field+'" class="customfieldtr"> \
						<td> \
							'+customobj.name+'\
						</td>\
						<td>\
							 <select id="bulk'+customobj.field+'" class="bulkselect">\
								<option value="new">'+setnew+'</option>\
								<option value="prepend">'+prepend+'</option>\
								<option value="append">'+append+'</option>\
								<option value="replace">'+replacet+'</option>\
								<option value="replaceregexp">replace regexp</option>\
							</select>\
							<label class="labelignorecase" style="display:none;">\
							<input class="inputignorecase" type="checkbox">\
							Ignore case</label>\
						</td>\
						<td class="tdbulkvalue">\
						    <div class="imgButton sm mapto"> \
					   		</div> \
							<textarea id="bulk'+customobj.field+'value" rows="1" cols="15" data-id="'+customobj.field+'" class="bulkvalue" placeholder="Skipped (empty)"></textarea>\
						</td>\
						<td>\
							<div class="divwithvalue" style="display:none;">with text <textarea class="inputwithvalue" rows="1" cols="15"></textarea></div>\
						</td>\
					</tr>';
			$('#bulkdialog table').append(newhtml); 
			if(customobj.isvisible)
				$("#bulkdialog tr[data-id='" + customobj.field + "']").show();
			newhtml = '<tr data-id="'+customobj.field+'" class="customfieldtr">\
						<td>\
							'+customobj.name+'\
						</td>\
						<td>\
							 <select id="select'+customobj.field+'" class="selectselect" data-id="'+customobj.field+'">\
								<option value="con">'+contains+'</option>\
								<option value="notcon">'+doesnot+'</option>\
								<option value="start">'+starts+'</option>\
								<option value="end">'+ends+'</option>\
								<option value="empty">'+isempty+'</option>\
							</select>\
						</td>\
						<td>\
							<textarea cols="15" rows="1" id="select'+customobj.field+'value" placeholder="Skipped (empty)" data-id="'+customobj.field+'" class="selectvalue"></textarea >\
						</td>\
						<td>\
						<label><input data-id="'+customobj.field+'" class="selectifignorecase" type="checkbox"> Ignore case</label>\
						</td>\
						<td>\
							<input data-id="'+customobj.field+'" class="checkboxifspecial" type="checkbox">\
							<select class="selectsplit" disabled="disabled"><option value="split">split commas</option><option value="regexp">reg exp</option></select>\
							<select class="selectsplitand" disabled="disabled"><option value="and">AND</option><option value="or">OR</option></select>\
						</td>\
					</tr>';
			$('#selectdialog table').append(newhtml); 
			if(customobj.isvisible)
				$("#selectdialog tr[data-id='" + customobj.field + "']").show();
		}else if(customobj.type == "integer")
		{
			newhtml = '<tr data-id="'+customobj.field+'" class="customfieldtr">\
						<td>\
							'+customobj.name+'\
						</td>\
						<td>\
							 <select id="bulk'+customobj.field+'" data-id="'+customobj.field+'" class="bulkselectinteger">\
								<option value="new">'+setnew+'</option>\
								<option value="incvalue">increase by value</option>\
								<option value="decvalue">decrease by value</option>\
							</select>\
						</td>\
						<td class="tdbulkvalue">\
						<div class="imgButton sm mapto"> \
					    	</div> \
							<input id="bulk'+customobj.field+'value" type="text" data-id="'+customobj.field+'" class="bulkvalue" placeholder="Skipped (empty)"/>\
						</td>\
						<td>\
							\
						</td>';
			$('#bulkdialog table').append(newhtml); 
			if(customobj.isvisible)
				$("#bulkdialog tr[data-id='" + customobj.field + "']").show();
			newhtml = '<tr data-id="'+customobj.field+'" class="customfieldtr">\
						<td>\
							'+customobj.name+'\
						</td>\
						<td>\
							 <select id="select'+customobj.field+'" class="selectselect" data-id="'+customobj.field+'">\
								<option value="more">></option>\
								<option value="less"><</option>\
								<option value="equal">==</option>\
								<option value="moree">>=</option>\
								<option value="lesse"><=</option>\
								<option value="empty">'+isempty+'</option>\
							</select>\
						</td>\
						<td>\
							<input id="select'+customobj.field+'value" type="text" placeholder="Skipped (empty)" data-id="'+customobj.field+'" class="selectvalue" />\
						</td>\
						<td>\
						</td>\
						<td>\
						</td>\
					</tr>';
			$('#selectdialog table').append(newhtml); 
			if(customobj.isvisible)
				$("#selectdialog tr[data-id='" + customobj.field + "']").show();
		}else if(customobj.type == "decimal" || customobj.type == "decimal3")
		{
			newhtml = '<tr data-id="'+customobj.field+'" class="customfieldtr">\
						<td>\
							'+customobj.name+'\
						</td>\
						<td>\
							 <select id="bulk'+customobj.field+'" data-id="'+customobj.field+'" class="bulksetdecimal">\
								<option value="new">'+setnew+'</option>\
								<option value="incvalue">increase by value</option>\
								<option value="decvalue">decrease by value</option>\
								<option value="incpercent">increase by %</option>\
								<option value="decpercent">decrease by %</option>\
							</select>\
						</td>\
						<td class="tdbulkvalue">\
							<div class="imgButton sm mapto"> \
					    	</div> \
							<input id="bulk'+customobj.field+'value" type="text" data-id="'+customobj.field+'" class="bulkvalue" placeholder="Skipped (empty)" />\
						</td>\
						<td>\
							<select id="bulk'+customobj.field+'_round" style="display:none;"> \
							<option value="noround">no rounding</option> \
							<option value="roundup100">round-up (100)</option> \
							<option value="roundup10">round-up (10)</option> \
							<option value="roundup">round-up (1)</option> \
							<option value="roundup1">round-up (0.1)</option> \
							<option value="rounddown1">round-down (0.1)</option> \
							<option value="rounddown">round-down (1)</option> \
							<option value="rounddown10">round-down (10)</option> \
							<option value="rounddown100">round-down (100)</option> \
						 </select> \
						</td>\
					</tr>';
			$('#bulkdialog table').append(newhtml); 
			if(customobj.isvisible)
			{
				$("#bulkdialog tr[data-id='" + customobj.field + "']").show();
			}
			newhtml = '<tr data-id="'+customobj.field+'" class="customfieldtr">\
						<td>\
							'+customobj.name+'\
						</td>\
						<td>\
							 <select id="select'+customobj.field+'" class="selectselect" data-id="'+customobj.field+'">\
								<option value="more">></option>\
								<option value="less"><</option>\
								<option value="equal">==</option>\
								<option value="moree">>=</option>\
								<option value="lesse"><=</option>\
								<option value="empty">'+isempty+'</option>\
							</select>\
						</td>\
						<td>\
							<input id="select'+customobj.field+'value" type="text" placeholder="Skipped (empty)" data-id="'+customobj.field+'" class="selectvalue" />\
						</td>\
						<td>\
						</td>\
						<td>\
						</td>\
					</tr>';
			$('#selectdialog table').append(newhtml); 
			if(customobj.isvisible)
				$("#selectdialog tr[data-id='" + customobj.field + "']").show();
		}
		else if(customobj.type == "checkbox")
		{
			newhtml = '<tr data-id="'+customobj.field+'" class="customfieldtr">\
					<td>\
						<input id="set'+customobj.field+'" type="checkbox" class="bulkset" data-id="'+customobj.field+'"><label for="set'+customobj.field+'">Set '+customobj.name+'</label>\
					</td>\
					<td>\
					</td>\
					<td class="nontextnumbertd">\
						 <select id="bulk'+customobj.field+'">\
						<option value="yes">Yes</option>\
						<option value="no">No</option>\
					</select>\
					</td>\
					<td>\
					</td>\
				</tr>';
			$('#bulkdialog table').append(newhtml); 
			if(customobj.isvisible)
			{
				$("#bulkdialog tr[data-id='" + customobj.field + "']").show();
			}
			newhtml = '<tr data-id="'+customobj.field+'" class="customfieldtr">\
						<td>\
							<input id="setsel'+customobj.field+'" type="checkbox" class="selectset" data-id="'+customobj.field+'"><label for="setsel'+customobj.field+'">Where '+customobj.name+' is</label>\
						</td>\
						<td>\
						</td>\
						<td>\
							 <select id="select'+customobj.field+'">\
								<option value="yes">Yes</option>\
								<option value="no">No</option>\
							</select>\
						</td>\
						<td>\
						</td>\
						<td>\
						</td>\
					</tr>';
			$('#selectdialog table').append(newhtml); 
			if(customobj.isvisible)
				$("#selectdialog tr[data-id='" + customobj.field + "']").show();
		}
		else if(customobj.type == "select")
		{//select
			if(customobj.selvals === undefined) return;
			newhtml = '<tr data-id="'+customobj.field+'" class="customfieldtr">\
					<td>\
						<input id="set'+customobj.field+'" type="checkbox" class="bulkset" data-id="'+customobj.field+'"><label for="set'+customobj.field+'">Set '+customobj.name+'</label>\
					</td>\
					<td>\
					</td>\
					<td class="nontextnumbertd">\
						 <select id="bulk'+customobj.field+'">';
						 var vals = customobj.selvals.split(',');
						 for(var i = 0; i < vals.length; i++)
						 {
						 	newhtml+= '<option value="' + vals[i] + '">' + vals[i] + '</option>'; 
						 }
					newhtml+='</select>\
					</td>\
					<td>\
					</td>\
				</tr>';
			$('#bulkdialog table').append(newhtml); 
			if(customobj.isvisible)
			{
				$("#bulkdialog tr[data-id='" + customobj.field + "']").show();
			}
			newhtml = '<tr data-id="'+customobj.field+'" class="customfieldtr">\
						<td>\
							<input id="setsel'+customobj.field+'" type="checkbox" class="selectset" data-id="'+customobj.field+'"><label for="setsel'+customobj.field+'">Where '+customobj.name+' is</label>\
						</td>\
						<td>\
						</td>\
						<td>\
							 <select id="select'+customobj.field+'">';
							var vals = customobj.selvals.split(',');
							 for(var i = 0; i < vals.length; i++)
							 {
							 	newhtml+= '<option value="' + vals[i] + '">' + vals[i] + '</option>'; 
							 }
						newhtml+='</select>\
						</td>\
						<td>\
						</td>\
						<td>\
						</td>\
					</tr>';
			$('#selectdialog table').append(newhtml); 
			if(customobj.isvisible)
				$("#selectdialog tr[data-id='" + customobj.field + "']").show();
		}
	}
	
	function ShowExtraSearchFields()
	{
		$('.customfield').remove();
		var status = "Status";
		if(W3Ex.post_status !== undefined)
			status = W3Ex.post_status;
		var text = '<div class="customfield"><label><input type="checkbox" data-id="post_status" data-type="customh">'+status+'</input></label></div>';
//		$('#pluginsettingstab-2').append(text);
//		$('#pluginsettingstab-2').append('<div .customfieldclear style="clear:both;width:1px;height:1px;"><div>');
		$('.customfilterstr').remove();
		var appendtext = "";
		var counter = 0;
//		if(W3Ex.w3ex_show_id_search !== undefined)
		{
			appendtext+= '<td>ID:</td><td><div class="customfieldtable" data-id="ID" data-type="int"><input id="idvalue" type="text"></input></td>';
			counter++;
		}
		
//		if(W3Ex.customfieldssel !== undefined && $.isArray(W3Ex.customfieldssel) && ($.inArray('post_status',W3Ex.customfieldssel) !== -1))
		{
//			$('.customfield input[data-id="post_status"]').prop('checked',true);
			if(counter % 2 === 0)
			{
				appendtext+='</tr><tr class="customfilterstr">';
			}
			appendtext+= '<td>'+status+':</td><td><div class="customfieldtable" data-id="post_status" data-type="select">';
			appendtext+= '<select><option value="skip">Skip</option><option value="publish">Publish</option>';
			appendtext+= '<option value="draft">Draft</option>';
			appendtext+= '<option value="private">Private</option>';
			appendtext+= '<option value="pending">Pending</option>';
			if (W3Ex.integ_post_status_unreliable !== undefined) {
				appendtext+= '<option value="unreliable">Unreliable</option>';
			}
			appendtext+= '</select>';

			counter++;
		}
		if(appendtext !== "")
		{
			if(counter % 2 !== 0)
			{
				appendtext+="<td>&nbsp;</td><td>&nbsp;</td>";
			}
		}
			
		if(appendtext !== "")
		{
			appendtext = '<tr class="customfilterstr">' + appendtext + '</tr>';
			
			$('#tablesearchfilters tbody').append(appendtext);
		}
	}
	
	function ShowCustomSearchFilters()
	{
		var cols = {};
		
		ShowExtraSearchFields();
		$('.customfieldclear').remove();
		var loopfields = [];
		
		{//add built-in as custom
			var customfieldsinner = {};
			customfieldsinner.post_date = {};
			customfieldsinner.post_date.isvisible = true;
			customfieldsinner.post_date.name = "post_date";
			customfieldsinner.post_date.displayname = "Publish Date";
			if(W3Ex["post_date"] !== undefined)
				customfieldsinner.post_date.displayname = W3Ex["post_date"];
			customfieldsinner.post_date.type = "date";
			loopfields.push(customfieldsinner.post_date);
			//post author
			customfieldsinner.post_author = {};
			customfieldsinner.post_author.isvisible = true;
			customfieldsinner.post_author.name = "post_author";
			customfieldsinner.post_author.displayname = "Post Author";
			if(W3Ex["post_author"] !== undefined)
				customfieldsinner.post_author.displayname = W3Ex["post_author"];
			customfieldsinner.post_author.type = "customh";
			loopfields.push(customfieldsinner.post_author);
			if(_current_post_type === 'post')
			{
				//post format
				customfieldsinner.post_format = {};
				customfieldsinner.post_format.isvisible = true;
				customfieldsinner.post_format.name = "post_format";
				customfieldsinner.post_format.displayname = "Post Format";
				if(W3Ex["post_format"] !== undefined)
					customfieldsinner.post_format.displayname = W3Ex["post_format"];
				customfieldsinner.post_format.type = "customh";
				loopfields.push(customfieldsinner.post_format);
				//post tag
				customfieldsinner.post_tag = {};
				customfieldsinner.post_tag.isvisible = true;
				customfieldsinner.post_tag.name = "post_tag";
				customfieldsinner.post_tag.displayname = "Tags";
				if(W3Ex["post_tag"] !== undefined)
					customfieldsinner.post_tag.displayname = W3Ex["post_tag"];
				customfieldsinner.post_tag.type = "custom";
				loopfields.push(customfieldsinner.post_tag);
					
			}
			cols = customfieldsinner;
			for (var key in cols) 
			{
			  	if (cols.hasOwnProperty(key))
			  	{
			  	   var customobj = cols[key];
				   if(customobj === undefined) continue;
//				   if(key !== "_product_url")
				   {
				   	   if(customobj.field === undefined)
					   		customobj.field = customobj.name;
					   if(_mapfield[customobj.field] === undefined)
					   		continue;
						var text = '<div class="customfield">';
						var displayname = customobj.name;
						if(customobj.displayname !== undefined)
							displayname = customobj.displayname;
						
						text+='<label><input type="checkbox" data-id="'+customobj.field+'" data-type="'+customobj.type+'">'+displayname+'</label></div>';
						$('#pluginsettingstab-2').append(text);
				   }
			  	}
			}
			
		}
		if(W3Ex.customfields !== undefined && W3Ex.customfields[_current_post_type] !== undefined)
		{
			var customfields = W3Ex.customfields;
			if(customfields[_current_post_type] !== undefined)
				customfields = customfields[_current_post_type];
			
			cols = customfields;
			for (var key in cols) 
			{
			  	if (cols.hasOwnProperty(key))
			  	{
			  	   var customobj = cols[key];
				   if(customobj === undefined) continue;
//				   if(key !== "_product_url")
				   {
				   	   if(customobj.field === undefined)
					   		customobj.field = customobj.name;
					   if(_mapfield[customobj.field] === undefined)
					   		continue;
					   	loopfields.push(customobj);
						var text = '<div class="customfield">';
						var displayname = customobj.name;
						if(customobj.displayname !== undefined)
							displayname = customobj.displayname;
						
						text+='<label><input type="checkbox" data-id="'+customobj.field+'" data-type="'+customobj.type+'">'+displayname+'</label></div>';
//						$('#pluginsettingstab-2').append(text);
				   }
//				   else
//				   {
//				   	    var text = '<div class="customfield">';
//						text+='<label><input type="checkbox" data-id="_product_url" data-type="'+customobj.type+'">'+customobj.name+'</input></label></div>';
//						$('#pluginsettingstab-2').append(text);
//				   }
			  	}
			}
			
		}
			
		//add shipping class
		
		
		$('#pluginsettingstab-2').append('<div style="clear:both;width:1px;height:1px;"></div>');
		
//		if(W3Ex.customfieldssel !== undefined)
		{
			var contains = "contains";
			var doesnot = "does not contain";
			var starts = "starts with";
			var ends = "ends with";
			if(W3Ex.trans_contains !== undefined && W3Ex.trans_contains !== "")
				contains = W3Ex.trans_contains;
			if(W3Ex.trans_doesnot !== undefined && W3Ex.trans_doesnot !== "")
				doesnot = W3Ex.trans_doesnot;
			if(W3Ex.trans_starts !== undefined && W3Ex.trans_starts !== "")
				starts = W3Ex.trans_starts;
			if(W3Ex.trans_ends !== undefined && W3Ex.trans_ends !== "")
				ends = W3Ex.trans_ends;
//			var selcols = W3Ex.customfieldssel;
//			if(selcols[_current_post_type] !== undefined)
//			{
//				selcols = selcols[_current_post_type];
//			}else
//			{
//				selcols = [];
//			}
			var tdcounter = 0;
			var appendtext = "";
//			$('.customfilterstr').remove();
			for(var i = 0; i < loopfields.length; i++)
			{
				var customobj = loopfields[i];
			 	if(customobj.field === undefined)
				   	customobj.field = customobj.name;
				 var displayname = customobj.name;
				 if(customobj.displayname !== undefined)
					displayname = customobj.displayname;
				if(_mapfield[customobj.field] === undefined)
			   		continue;
//				$('.customfield input[data-id="'+selitem+'"]').prop('checked',true);
//				if(cols[selitem] !== undefined || customfieldsinner[selitem] !== undefined)
				{
					
//					 if(cols[selitem] !== undefined)
//					 {
//						customobj = cols[selitem];
//					 }else
//					 {
//					 	customobj = customfieldsinner[selitem];
//					 }
					
			  		 appendtext+= '<td>'+displayname+'</td><td><div class="customfieldtable" data-id="'+customobj['field']+'" data-type="'+customobj['type']+'">';
					if(customobj['type'] === "text" || customobj['type'] === "multitext" ||  customobj['type'] === "select" || customobj['type'] === "checkbox")
					{
						appendtext+= '<select> \
					<option value="con">' + contains + '</option> \
					<option value="notcon">' + doesnot + '</option> \
					<option value="start">' + starts + '</option> \
					<option value="end">'+ ends +'</option> \
				</select> \
				<input type="text"/>';
					}else if(customobj['type'] === "customh" || customobj['type'] === "custom")
					{
						if(W3Ex['taxonomyterms' + customobj['field']] !== undefined)
						{
							appendtext+= '<select ' + W3Ex['taxonomyterms' + customobj['field']];
						}
					}else if(customobj['type'] === "date")
					{
						appendtext+=  '<select id="datefilterselect"> \
							<option value="more">></option> \
							<option value="less"><</option> \
							<option value="between">between</option> \
						</select> \
						<input type="text" id="datefilter1" class="datepickerfilter" /><input type="text" id="datefilter2" class="datepickerfilter" style="display:none;"/>';
					}else{
						appendtext+=  '<select> \
							<option value="more">></option> \
							<option value="less"><</option> \
							<option value="equal">==</option> \
							<option value="moree">>=</option> \
							<option value="lesse"><=</option> \
						</select> \
						<input type="text"/>';
					}
					appendtext+= '</div></td>';
					if(tdcounter % 2 == 0)
					{
						appendtext = '<tr class="customfilterstr">' + appendtext;
					}else
					{
						appendtext = appendtext + '</tr>';
						$('#tablesearchfilters tbody').append(appendtext);
						appendtext = '';
					}
					tdcounter++;
				}
			}
			if(tdcounter % 2 !== 0 && appendtext !== "")
			{
				appendtext = appendtext + '<td></td><td></td></tr>';
				$('#tablesearchfilters tbody').append(appendtext);
			}
		}
		$('.datepickerfilter').datepicker({
				dateFormat: "yy-mm-dd"//,
//				onClose: function () {
//					calendarOpen = false;
//				}
			});
			if($('.w3exabedeleditor1').length === 0 )
			 	$('.ui-datepicker').wrap('<div class="w3exabe w3exabedeleditor1" />');
			$('.makechosen').chosen({disable_search_threshold: 10,search_contains:true});
		
	}
	
	
		
	function SetCustomFields(first)
	{
		first = typeof first !== 'undefined' ? first : false;
		$('#customfieldstable .trcustom').remove();
		
		var cols = {};
		cols = W3Ex.customfields;
		//add post specific fields in show/hide columns
		var tdcounter = 1;
		var appendtext = "";
		if(cols[_current_post_type] === undefined)
			cols[_current_post_type] = {};
		for (var i = 0; i < _idmap.length; i++) 
		{
		    var item = _idmap[i];
	  		if(item.post_type !== undefined)
	  		{
	  			if(item.post_type !== _current_post_type)
	  				continue;
	  		}else
	  		{
				continue;
			}
			
			appendtext+= '<td> \
				<input id="d'+item.id+'" class="dsettings" data-id="'+item.id+'" type="checkbox"><label for="d'+item.id+'"> '+item.name+'</label> \
			</td> \
			<td> \
				<div> \
				 <img id="d'+item.id+'_check" src="'+W3Ex.imagepath+'images/tick.png" style="visibility:hidden;"/> \
				</div> \
			</td>';
			if(tdcounter % 2 == 0)
			{
				appendtext = '<tr class="customfieldcolumns">' + appendtext + '</tr>';
				$('.settings-table tbody').append(appendtext);
				appendtext = '';
			}
			tdcounter++;
			var customobj = {};
	   	    customobj.field = item.field;
			customobj.name = item.name;
			customobj.type = item.type;
			if(customobj.type === 'customtax')
				customobj.type = 'custom'
			if(customobj.type === 'customtaxh')
				customobj.type = 'customh';
			AddBulkAndSelectFields(customobj);
		}
		if(tdcounter % 2 === 0 && appendtext !== "")
		{
			appendtext = '<tr class="customfieldcolumns">' + appendtext + '<td></td><td></td></tr>';
			$('.settings-table tbody').append(appendtext);
		}
		
		//end
		
		if(cols !== undefined && cols[_current_post_type] !== undefined)
		{
			if(cols[_current_post_type] !== undefined)
			{
				cols = cols[_current_post_type];
			}
			for (var key in cols) {
			  if (cols.hasOwnProperty(key)) {
			  	   var customobj = cols[key];
				   if(customobj === undefined) continue;
				   if(customobj.field === undefined)
				   	  customobj.field = customobj.name;
				   if(_mapfield[customobj.field] !== undefined)
				   		continue;
				   	if(isBlank(customobj.name))
				   		customobj.name = customobj.field;
				    var insertobj = {};
					insertobj[customobj.field] = _mapfield.length;
					
					_mapfield[customobj.field] = _idmap.length;
					insertobj.field = customobj.field;
					insertobj.id = customobj.field;
					insertobj.name = customobj.name;
					
					var newhtml = "<tr class='trcustom'><td data-field='name'><strong>";
				 	var ctext = customobj.field;
					ctext = $.trim(ctext);
					if(ctext == "") return;
					newhtml+= ctext + "</strong></td><td";
					newhtml+= " data-field='name1'>name: <input data-field='inputname' type='text' value='"+customobj.name+"'></td><td";
					ctext = customobj.type;
					switch(ctext){
					case "text":
					{
						newhtml+= " data-type='text' data-field='type'>type: <strong>Text (single line)</strong></td>";
					}
					break;
					case "multitext":
					{
						newhtml+= " data-type='multitext' data-field='type'>type: <strong>Text (multi line)</strong></td>";
					}
					break;
					case "integer":
					{
						newhtml+= " data-type='integer' data-field='type'>type: <strong>Number (integer)</strong></td>";
					}
					break;
					case "decimal":
					{
						newhtml+= " data-type='decimal' data-field='type'>type: <strong>Number (decimal .00)</strong></td>";
					}
					break;
					case "decimal3":
					{
						newhtml+= " data-type='decimal3' data-field='type'>type: <strong>Number (decimal .000)</strong></td>";
					}
					break;
					case "select":
					{
	//					if(customobj.selvals !== undefined)
						{
							newhtml+= " data-type='select' data-field='type' data-vals='" + customobj.selvals + "'>type: <strong>select</strong><br/>(" + customobj.selvals + ")</td>";
						}
						
					}
					break;
					case "checkbox":
					{
						newhtml+= " data-type='checkbox' data-field='type'>type: <strong>Checkbox</strong></td>";
					}
					break;
					case "custom":
					{
						newhtml+= " data-type='custom' data-field='type' data-vals='" + customobj.isnewvals + "'>type: <strong>Custom Taxonomy</td>";
					}
					break;
					case "customh":
					{
						newhtml+= " data-type='customh' data-field='type'>type: <strong>Custom Taxonomy(hierar.)</td>";
					}
					break;
					
					default:
						break;
				}
					ctext = customobj.isvisible;
					if(ctext === "true")
						customobj.isvisible = true;
					if(ctext === "false")
						customobj.isvisible = false;
					if(customobj.isvisible)
					{
						newhtml+= '<td data-field="isvisible"><label><input type="checkbox" class="customisvisible" checked=>Visible</label><input class="button deletecustomfield" type="button" value="delete" /></td></tr>';
					}else
					{
						newhtml+= '<td data-field="isvisible"><label><input type="checkbox" class="customisvisible">Visible</label><input class="button deletecustomfield" type="button" value="delete" /></td></tr>';
					}
					$(newhtml).insertBefore('.addcontrols');
					
					
					var newitem = {};
					newitem.id = customobj.field;
					newitem.name = customobj.name;
					newitem.field = customobj.field;
					
					if(customobj.type == "text")
					{
						newitem.editor = Slick.Editors.Text;
						insertobj.type = "text";
					}else if(customobj.type == "multitext")
					{
						if(W3Ex._global_settings !== undefined && W3Ex._global_settings['usebuiltineditor'] === true)
							newitem.editor = Slick.Editors.TextArea;
						else
							newitem.editor = Slick.Editors.WordPress;
						insertobj.textarea = true;
						insertobj.type = "multitext";
					}else if(customobj.type == "integer")
					{
						newitem.editor = Slick.Editors.Text;
						insertobj.type = 'int';
					}else if(customobj.type == "decimal")
					{
						newitem.editor = Slick.Editors.Text;
						insertobj.type = 'float2';
					}else if(customobj.type == "decimal3")
					{
						newitem.editor = Slick.Editors.Text;
						insertobj.type = 'float3';
					}else if(customobj.type == "checkbox")
					{
						newitem.cssClass = "cell-effort-driven";
						newitem.formatter = Slick.Formatters.Checkmark;
						newitem.editor = Slick.Editors.Checkbox;
						insertobj.checkbox = true;
						insertobj.type = 'set';
					}else if(customobj.type == "select")
					{
						newitem.editor = Slick.Editors.Select;
						newitem.options = customobj.selvals;
						insertobj.type = 'set';
						insertobj.options= customobj.selvals;
					}else if(customobj.type == "custom")
					{
						newitem.editor = Slick.Editors.Text;
						newitem.scope = SCOPE.PRODALL;
						insertobj.scope = SCOPE.PRODALL;
						insertobj.type = 'customtax';
						insertobj.isnewvals = customobj.isnewvals;
					}else if(customobj.type == "customh")
					{
						newitem.editor = Slick.Editors.Category;
						newitem.scope = SCOPE.PRODALL;
						insertobj.scope = SCOPE.PRODALL;
						insertobj.type = 'customtaxh';
					}
					if(customobj.name1 !== undefined)
					{
						customobj.field = customobj.name;
						customobj.name = customobj.name1;
					}
					AddBulkAndSelectFields(customobj);
					newitem.sortable = true;
					_idmap.push(insertobj);
//					if(!first)
						_allcols.push(newitem);
			  	}
			}
		}

		ShowCustomSearchFilters();
		
	}
	
	var gridColumns = [];		
		
	_allcols = [checkboxSelector.getColumnDefinition()];//$.extend(true, [], gridColumns);
	
	function CreateFields()
	{
		for (var i = 0; i < _idmap.length; i++) 
			{
			    var item = _idmap[i];
		  		
				var newitem = {};
				newitem.id = item.id;
				newitem.name = item.name;
				newitem.field = item.field;
				if(item.width !== undefined)
					newitem.width = item.width;
					
				if(item.tooltip !== undefined)
				{
					newitem.toolTip = item.tooltip;
				}else
				{
					newitem.toolTip= item.name;
				}
	//			if(item.field != "ID")
				{
					newitem.editor = Slick.Editors.Text;
					if(item.id === "post_title")
						newitem.formatter = Slick.Formatters.Title;
					if(item.options !== undefined)
					{
						newitem.editor = Slick.Editors.Select;
						newitem.options = item.options;
					}
					if(item.files !== undefined)
					{
						newitem.editor = Slick.Editors.LongText;
					}
					if(item.checkbox !== undefined)
					{
						newitem.cssClass = "cell-effort-driven";
						newitem.formatter = Slick.Formatters.Checkmark;
						newitem.editor = Slick.Editors.Checkbox;
					}
					if(item.date !== undefined)
					{
						newitem.editor = Slick.Editors.CustomDate;
					}
	//				if(item.textarea !== undefined)
	//				{
	//					newitem.editor = Slick.Editors.TextArea;
	//				}
					if(item.textarea !== undefined)
					{
		
						if(W3Ex._global_settings !== undefined && W3Ex._global_settings['usebuiltineditor'] === true)
							newitem.editor = Slick.Editors.TextArea;
						else
							newitem.editor = Slick.Editors.WordPress;
					}
					if(item.image !== undefined)
					{
						newitem.editor = Slick.Editors.Image;
						newitem.formatter = Slick.Formatters.Image;
					}
					if(item.url !== undefined)
					{
	//					newitem.editor = Slick.Editors.Image;
						newitem.formatter = Slick.Formatters.ProductUrl;
					}
					if(item.type !== undefined)
					{
						if(item.type == 'customtaxh')
						{
							newitem.editor = Slick.Editors.Category;
							newitem.scope = SCOPE.PRODALL;
						}else if(item.type == 'customtax')
						{
							newitem.scope = SCOPE.PRODALL;
						}
					}
				}
				newitem.sortable = true;
				var putinall = true;
				for(var j=0; j < _allcols.length;j++)
				{
					var curall = _allcols[j];
					if(curall.field === newitem.field)
					{
						putinall = false;
						break;
					}
				}
				if(putinall)
					_allcols.push(newitem);
	//			if(item.visible === undefined)
	//			{
	//				 continue;
	//			}
			
			}
			
			
			var currentpost = W3Ex[_current_post_type + '_idmap'];
			if(currentpost !== undefined)
			{
				for (var i = 0; i < currentpost.length; i++) 
				{
				    var item = currentpost[i];
			  		if(_mapfield[item.field] !== undefined)
			  			continue;
					var newitem = {};
					newitem.id = item.id;
					newitem.name = item.name;
					newitem.field = item.field;
					if(item.width !== undefined)
						newitem.width = item.width;
						
					if(item.tooltip !== undefined)
					{
						newitem.toolTip = item.tooltip;
					}else
					{
						newitem.toolTip= item.name;
					}
					{
						newitem.editor = Slick.Editors.Text;
						if(item.id === "post_title")
							newitem.formatter = Slick.Formatters.Title;
						if(item.options !== undefined)
						{
							newitem.editor = Slick.Editors.Select;
							newitem.options = item.options;
						}
						if(item.files !== undefined)
						{
							newitem.editor = Slick.Editors.LongText;
						}
						if(item.checkbox !== undefined)
						{
							newitem.cssClass = "cell-effort-driven";
							newitem.formatter = Slick.Formatters.Checkmark;
							newitem.editor = Slick.Editors.Checkbox;
						}
						if(item.date !== undefined)
						{
							newitem.editor = Slick.Editors.CustomDate;
						}
						if(item.textarea !== undefined)
						{
			
							if(W3Ex._global_settings !== undefined && W3Ex._global_settings['usebuiltineditor'] === true)
								newitem.editor = Slick.Editors.TextArea;
							else
								newitem.editor = Slick.Editors.WordPress;
						}
						if(item.image !== undefined)
						{
							newitem.editor = Slick.Editors.Image;
							newitem.formatter = Slick.Formatters.Image;
						}
						if(item.url !== undefined)
						{
		//					newitem.editor = Slick.Editors.Image;
							newitem.formatter = Slick.Formatters.ProductUrl;
						}
						if(item.type !== undefined)
						{
							if(item.type == 'customtaxh')
							{
								newitem.editor = Slick.Editors.Category;
								newitem.scope = SCOPE.PRODALL;
							}else if(item.type == 'customtax')
							{
								newitem.scope = SCOPE.PRODALL;
							}
						}
					}
					newitem.sortable = true;
					_allcols.push(newitem);
					_idmap.push(item);
					_mapfield[item.field] = _idmap.length - 1;
				}
			}
			
			//add post specific fields in show/hide columns
//			var tdcounter = 1;
//			var appendtext = "";
//			for (var i = 0; i < _idmap.length; i++) 
//			{
//			    var item = _idmap[i];
//		  		if(item.post_type !== undefined)
//		  		{
//		  			if(item.post_type !== _current_post_type)
//		  				continue;
//		  		}else
//		  		{
//					continue;
//				}
//				var newitem = {};
//				newitem.id = item.id;
//				newitem.name = item.name;
//				newitem.field = item.field;
//				newitem.type = item.type;
//				appendtext+= '<td> \
//					<input id="d'+newitem.id+'" class="dsettings" data-id="'+newitem.id+'" type="checkbox"><label for="d'+newitem.id+'"> '+newitem.name+'</label> \
//				</td> \
//				<td> \
//					<div> \
//					 <img id="d'+newitem.id+'_check" src="'+W3Ex.imagepath+'images/tick.png" style="visibility:hidden;"/> \
//					</div> \
//				</td>';
//				if(tdcounter % 2 == 0)
//				{
//					appendtext = '<tr class="customfieldcolumns">' + appendtext + '</tr>';
//					$('.settings-table tbody').append(appendtext);
//					appendtext = '';
//				}
//				tdcounter++;
//			}
//
//			if(tdcounter % 2 === 0 && appendtext !== "")
//			{
//				appendtext = '<tr class="customfieldcolumns">' + appendtext + '<td></td><td></td></tr>';
//				$('.settings-table tbody').append(appendtext);
//			}
	}
		
	CreateFields();
	
	SetCustomFields(true);
	
	function SetColumns()
	{
		//get translation
		
		for(var i=0; i < _idmap.length; i++)
		{
			var col = _idmap[i];
			if(col.field == 'ID')
				continue;
			if(_mapfield[col.field] === undefined)
				continue;
			if(W3Ex[col.field] !== undefined && W3Ex[col.field] !== "")
			{
				col.name = W3Ex[col.field];
				col.tooltip = W3Ex[col.field];
			}
		}
	}
	
	SetColumns(); //translation
	
	
		
		
		
		function Init()
		{
			
			
			var cols = {
				"_post_permalink":170,
				"post_status":70,
				"category":70,
				"post_content":250,
				"_thumbnail_id":80,
				"post_title":250,
				"ID":60
			}

		
			if(W3Ex.colsettings !== undefined && W3Ex.colsettings[_current_post_type] !== undefined) 
				cols = W3Ex.colsettings[_current_post_type];
				
			var hasid = false;
			var hastitle = false;
			for (var key in cols) {
			  if (cols.hasOwnProperty(key)) {
//			  		if(key === "ID") continue;
			  	   if(_mapfield[key] === undefined) continue;
			  	   var col = _idmap[_mapfield[key]];
				   if(col === undefined) continue;
				   col.visible = true;
				   var cwidth = parseInt(cols[key]);
				   if(isNaN(cwidth)) cwidth = 50;
				   if(cwidth < 50) cwidth = 50;
			       col.width = cwidth;
				   for(var i=0; i<_allcols.length;i++)
				   {
				   		var column = _allcols[i];
						if(column.field === key)
						{
							if(key === "ID")
							{
								hasid = true;
							}
							if(key === "post_title")
							{
								hastitle = true;
							}
							var newcol = $.extend(true, {}, column);
							newcol.width = cwidth;
							gridColumns.unshift(newcol);
							break;
						}
				   }
				   	$('.dsettings[data-id="'+key+'"]').each(function()
					{
						$(this).prop('checked', true);
						var id = $(this).attr('data-id');
						$("#bulkdialog tr[data-id='" + id + "']").show();
						$("#selectdialog tr[data-id='" + id + "']").show();
						var id = $(this).attr('id');
						$('#' + id + '_check').css('visibility','visible');
//						$('#' + id + ' + label').css('font-weight','bold');
						$('#' + id + ' + label').attr('style', 'font-weight:bold !important;');
					})

					
			  }
			  
			}
//			for(var i=0; i<_allcols.length;i++)
//			{
//				var column = _allcols[i];
//				if(column.field === "ID")
//				{
//					var newcol = $.extend(true, {}, column);
//					gridColumns.unshift(newcol);
//					break;
//				}
//			}
//			gridColumns.unshift(checkboxSelector.getColumnDefinition());	
			if(!hastitle)
			{
				for(var i=0; i<_allcols.length;i++)
			   {
			   		var column = _allcols[i];
					if(column.field === "post_title")
					{
						var newcol = $.extend(true, {}, column);
						newcol.width = 250;
						gridColumns.unshift(newcol);
						break;
					}
			   }
			}
			if(!hasid)
			{
				for(var i=0; i<_allcols.length;i++)
			   {
			   		var column = _allcols[i];
					if(column.field === "ID")
					{
						var newcol = $.extend(true, {}, column);
						newcol.width = 60;
						gridColumns.unshift(newcol);
						break;
					}
			   }
			}
			gridColumns.unshift(checkboxSelector.getColumnDefinition());
			
			//load views
			if(W3Ex.w3exabe_listviews === undefined) return;
			if($.isEmptyObject(W3Ex.w3exabe_listviews)) return;
			var cols = W3Ex.w3exabe_listviews;
			var hasid = false;
			var hastitle = false;
			var newcols = [];
			

			$('#viewselectload')
			    .find('option')
			    .remove();
			$('#viewselectreplace')
			    .find('option')
			    .remove();
			$('#viewselectedit')
			    .find('option')
			    .remove();


			for (var key in cols) 
			{
			  if (cols.hasOwnProperty(key)) 
			  {
			  	  $('#viewselectload')
			         .append($("<option></option>")
			         .attr("value",key)
			         .text(key)); 
				   $('#viewselectreplace')
			         .append($("<option></option>")
			         .attr("value",key)
			         .text(key));
				   $('#viewselectedit')
			         .append($("<option></option>")
			         .attr("value",key)
			         .text(key));
			  }
			}
		}
		
		Init();
		
		var gridOptions = {
			enableCellNavigation: true,
			enableColumnReorder: true,
			defaultColumnWidth: 60,
			cellFlashingCssClass: "current-server",
			editable: true
		};		
		if(W3Ex._abe_rowheight !== undefined)
		{
			if(W3Ex._abe_rowheight === "2")
			{
				gridOptions['rowHeight'] = 40;
				$('head').append('<style id="addedCSS" type="text/css">.slick-cell {white-space:normal;}</style>');
			}else if(W3Ex._abe_rowheight === "3")
			{
				gridOptions['rowHeight'] = 60;
				$('head').append('<style id="addedCSS" type="text/css">.slick-cell {white-space:normal;}</style>');
			}
		}
	$("#fieldtype").change(function() 
    {
    	var what = $(this).val();
		if(what == "select")
		{
			$('#extracustominfo').html('<input type="text" placeholder="val1,val2... (csv)" />');
		}else if(what == "custom")
		{
			$('#extracustominfo').html('<label><input type="checkbox">Allow adding of new terms</label>');
		}else{
			$('#extracustominfo').html('');
		}
	})
	
	$('body').on('change','#bulkdialog .selectvisiblefp',function(){
		var $parent = $(this).parent().parent();
		var column = $(this).attr('data-id');
		$parent.find(".selectvisiblefp").prop("disabled",false);
		$parent.find(".selectusedforvars").prop("disabled",false);
		var setvisval = $parent.find(".selectvisiblefp").val();
		if(setvisval == "skip")
		{
			$parent.find(".visiblefp").prop("disabled",true);
			$('#bulk' + column).prop('disabled', false).trigger("chosen:updated");
			$('#bulkadd' + column).prop("disabled",false);
		}else if(setvisval == "andset")
		{
			$parent.find(".visiblefp").prop("disabled",false);
			$('#bulk' + column).prop('disabled', false).trigger("chosen:updated");
			$('#bulkadd' + column).prop("disabled",false);
		}else if(setvisval == "onlyset")
		{
			$parent.find(".visiblefp").prop("disabled",false);
			$parent.find(".selectusedforvars").prop("disabled",true);
			$parent.find(".usedforvars").prop("disabled",true);
			$('#bulkadd' + column).prop("disabled",true);
			$('#bulk' + column).prop('disabled', true).trigger("chosen:updated");
		}
		if( $parent.find(".selectusedforvars").is(':enabled'))
		{
			setvisval = $parent.find(".selectusedforvars").val();
			if(setvisval == "skip")
			{
				$parent.find(".usedforvars").prop("disabled",true);
			}else if(setvisval == "andset")
			{
				$parent.find(".usedforvars").prop("disabled",false);
			}else if(setvisval == "onlyset")
			{
				$parent.find(".usedforvars").prop("disabled",false);
				$parent.find(".selectvisiblefp").prop("disabled",true);
				$parent.find(".visiblefp").prop("disabled",true);
				$('#bulkadd' + column).prop("disabled",true);
				$('#bulk' + column).prop('disabled', true).trigger("chosen:updated");
			}
		}
		
	})
	
	$('body').on('change','#bulkdialog .selectusedforvars',function(){
		var $parent = $(this).parent().parent();
		var column = $(this).attr('data-id');
		$parent.find(".selectvisiblefp").prop("disabled",false);
		$parent.find(".selectusedforvars").prop("disabled",false);
		var setvisval = $(this).val();
		if(setvisval == "skip")
		{
			$parent.find(".usedforvars").prop("disabled",true);
			$('#bulk' + column).prop('disabled', false).trigger("chosen:updated");
			$('#bulkadd' + column).prop("disabled",false);
		}else if(setvisval == "andset")
		{
			$parent.find(".usedforvars").prop("disabled",false);
			$('#bulk' + column).prop('disabled', false).trigger("chosen:updated");
			$('#bulkadd' + column).prop("disabled",false);
		}else if(setvisval == "onlyset")
		{
			$parent.find(".usedforvars").prop("disabled",false);
			$parent.find(".selectvisiblefp").prop("disabled",true);
			$parent.find(".visiblefp").prop("disabled",true);
			$('#bulkadd' + column).prop("disabled",true);
			$('#bulk' + column).prop('disabled', true).trigger("chosen:updated");
		}
		if( $parent.find(".selectvisiblefp").is(':enabled'))
		{
			setvisval = $parent.find(".selectvisiblefp").val();
			if(setvisval == "skip")
			{
				$parent.find(".visiblefp").prop("disabled",true);
			}else if(setvisval == "andset")
			{
				$parent.find(".visiblefp").prop("disabled",false);
			}else if(setvisval == "onlyset")
			{
				$parent.find(".visiblefp").prop("disabled",false);
				$parent.find(".selectusedforvars").prop("disabled",true);
				$parent.find(".usedforvars").prop("disabled",true);
				$('#bulkadd' + column).prop("disabled",true);
				$('#bulk' + column).prop('disabled', true).trigger("chosen:updated");
			}
		}
		
	})
	
	$('body').on('click','#bulkdialog .bulkset',function(){
    	var item = $(this);
		var column = item.attr('data-id');
		var coldef = _idmap[_mapfield[column]];
		if(!item.prop('checked'))
		{
			if(column === '_custom_attributes')
			{
				$('#bulkadd' + column).prop("disabled",true);
				item.parent().parent().find(".selectvisiblefp").prop("disabled",true);
				item.parent().parent().find(".selectusedforvars").prop("disabled",true);
				item.parent().parent().find(".visiblefp").prop("disabled",true);
				item.parent().parent().find(".usedforvars").prop("disabled",true);
				return;
			}
			if(coldef !== undefined && coldef.type === "customtaxh")
			{
				$('#bulk' + column).prop('disabled', true).trigger("chosen:updated");
				$('#bulkadd' + column).prop("disabled",true);
				if(true === coldef.attribute || column === 'category')
				{
					item.parent().parent().find(".butnewattribute").prop("disabled",true);
					item.parent().parent().find(".selectvisiblefp").prop("disabled",true);
					item.parent().parent().find(".selectusedforvars").prop("disabled",true);
					item.parent().parent().find(".visiblefp").prop("disabled",true);
					item.parent().parent().find(".usedforvars").prop("disabled",true);
				}
			}
			else
				$('#bulk' + column).prop("disabled",true);
		}else
		{
			if(column === '_custom_attributes')
			{
//				$('#bulk' + column).prop('disabled', false).trigger("chosen:updated");
				$('#bulkadd' + column).prop("disabled",false);
				{
					var $parent = item.parent().parent();
					$parent.find(".selectvisiblefp").prop("disabled",false);
					$parent.find(".selectusedforvars").prop("disabled",false);
					var setvisval = $parent.find(".selectvisiblefp").val();
					if(setvisval == "skip")
					{
						$parent.find(".visiblefp").prop("disabled",true);
					}else if(setvisval == "andset")
					{
						$parent.find(".visiblefp").prop("disabled",false);
					}else if(setvisval == "onlyset")
					{
						$parent.find(".visiblefp").prop("disabled",false);
						$parent.find(".selectusedforvars").prop("disabled",true);
						$parent.find(".usedforvars").prop("disabled",true);
						$('#bulkadd' + column).prop("disabled",true);
//						$('#bulk' + column).prop('disabled', true).trigger("chosen:updated");
					}
					
					setvisval = $parent.find(".selectusedforvars").val();
					if(setvisval == "skip")
					{
						$parent.find(".usedforvars").prop("disabled",true);
					}else if(setvisval == "andset")
					{
						$parent.find(".usedforvars").prop("disabled",false);
					}else if(setvisval == "onlyset")
					{
						$parent.find(".usedforvars").prop("disabled",false);
						$parent.find(".selectvisiblefp").prop("disabled",true);
						$parent.find(".visiblefp").prop("disabled",true);
						$('#bulkadd' + column).prop("disabled",true);
//						$('#bulk' + column).prop('disabled', true).trigger("chosen:updated");
					}
				}
				return;
			}
			if(coldef !== undefined && coldef.type === "customtaxh")
			{
				$('#bulk' + column).prop('disabled', false).trigger("chosen:updated");
				$('#bulkadd' + column).prop("disabled",false);
				if(column === 'category')
				{
					item.parent().parent().find(".butnewattribute").prop("disabled",false);
				}
				
				if(true === coldef.attribute)
				{
					var $parent = item.parent().parent();
					$parent.find(".selectvisiblefp").prop("disabled",false);
					$parent.find(".selectusedforvars").prop("disabled",false);
					$parent.find(".butnewattribute").prop("disabled",false);
					var setvisval = $parent.find(".selectvisiblefp").val();
					if(setvisval == "skip")
					{
						$parent.find(".visiblefp").prop("disabled",true);
					}else if(setvisval == "andset")
					{
						$parent.find(".visiblefp").prop("disabled",false);
					}else if(setvisval == "onlyset")
					{
						$parent.find(".visiblefp").prop("disabled",false);
						$parent.find(".selectusedforvars").prop("disabled",true);
						$parent.find(".usedforvars").prop("disabled",true);
						$('#bulkadd' + column).prop("disabled",true);
						$('#bulk' + column).prop('disabled', true).trigger("chosen:updated");
					}
					
					setvisval = $parent.find(".selectusedforvars").val();
					if(setvisval == "skip")
					{
						$parent.find(".usedforvars").prop("disabled",true);
					}else if(setvisval == "andset")
					{
						$parent.find(".usedforvars").prop("disabled",false);
					}else if(setvisval == "onlyset")
					{
						$parent.find(".usedforvars").prop("disabled",false);
						$parent.find(".selectvisiblefp").prop("disabled",true);
						$parent.find(".visiblefp").prop("disabled",true);
						$('#bulkadd' + column).prop("disabled",true);
						$('#bulk' + column).prop('disabled', true).trigger("chosen:updated");
					}
				}
			}
			else
				$('#bulk' + column).prop("disabled",false);
		}
	});



	
	$('body').on('mouseenter','#gallerydiv .galleryholder li',function(){
			$(this).parent().find('img.delete').css('visibility','hidden');
			$(this).find('img').css('visibility','visible');
		});

	$('body').on('mouseleave','#gallerydiv .galleryholder li',function(){
			$(this).find('img').css('visibility','hidden');
		});

	$('body').on('click','#gallerydiv .galleryholder img.delete',function(){
			$(this).parent().remove();
		});
	
//selection manager
	$('body').on('click','#selectdialog .selectset',function(){
    	var item = $(this);
		if(!item.prop('checked'))
		{
			$('#selectdialog #select' + item.attr('data-id')).prop("disabled",true);
		}else
		{
			$('#selectdialog #select' + item.attr('data-id')).prop("disabled",false);
		}
	});

	$('#exportproducts').click(function() 
    {
		$('#exportdialog').dialog("open");
		return;
		
	})
	
	
	$("#bulk_sale_price").change(function() 
    {
    	var what = $(this).val();
		if(what == "delete")
		{
			$('#bulksalepricevalue').prop("disabled",true);
		}else
		{
			$('#bulksalepricevalue').prop("disabled",false);
		}
		
		if(what == "decvaluereg" || what == "decpercentreg")
		{
			$('#saleskip').show();
			$('#saleskiplabel').show();
			
		}else
		{
			$('#saleskip').hide();
			$('#saleskiplabel').hide();
		}
		if(what === 'incpercent' || what === 'decpercent' || what === 'decpercentreg')
		{
			$('#bulk_sale_price_round').show();
		}else
		{
			$('#bulk_sale_price_round').hide();
		}
	})
	
//	$("#bulk_regular_price").change(function() 
//    {
//    	var what = $(this).val();
//		if(what === 'incpercent' || what === 'decpercent')
//		{
//			$('#bulk_regular_price_round').show();
//		}else
//		{
//			$('#bulk_regular_price_round').hide();
//		}
//	})
		
	function DisableAllControls(bdis)
    {
  		if(bdis)
	  	{
	  		$('#getproducts').prop("disabled",true);
			$('#savechanges').prop("disabled",true);
			$('#selectedit').prop("disabled",true);
			$('#bulkedit').prop("disabled",true);
			$('#butprevious').prop("disabled",true);
			$('#gotopage').prop("disabled",true);
			$('#butnext').prop("disabled",true);
			$('#revertcell').prop("disabled",true);
			$('#revertrow').prop("disabled",true);
			$('#revertall').prop("disabled",true);
			$('#revertselected').prop("disabled",true);
			$('#deletebut').prop("disabled",true);
			$('#addprodbut').prop("disabled",true);
			$('#duplicateprodbut').prop("disabled",true);
			$('#quicksettingsbut').prop("disabled",true);
			$('#settings').prop("disabled",true);
		}else
		{
			$('#getproducts').prop("disabled",false);
			$('#savechanges').prop("disabled",false);
			$('#selectedit').prop("disabled",false);
			$('#bulkedit').prop("disabled",false);
			$('#deletebut').prop("disabled",false);
			$('#addprodbut').prop("disabled",false);
			$('#duplicateprodbut').prop("disabled",false);
			$('#quicksettingsbut').prop("disabled",false);
			if(_totalrecords > _recordslimit)
			{
				$('#butprevious').prop("disabled",false);
				$('#gotopage').prop("disabled",false);
				$('#butnext').prop("disabled",false);
			}
			$('#revertcell').prop("disabled",false);
			$('#revertrow').prop("disabled",false);
			$('#revertall').prop("disabled",false);
			$('#revertselected').prop("disabled",false);
			$('#settings').prop("disabled",false);
		}
	}

	$('#selectedit').prop("disabled",true);
	$('#bulkedit').prop("disabled",true);
	$('#butprevious').prop("disabled",true);
	$('#gotopage').prop("disabled",true);
	$('#butnext').prop("disabled",true);
	$('#revertcell').prop("disabled",true);
	$('#revertrow').prop("disabled",true);
	$('#revertall').prop("disabled",true);
	$('#revertselected').prop("disabled",true);
	$('#deletebut').prop("disabled",true);
	$('#addprodbut').prop("disabled",true);
	$('#duplicateprodbut').prop("disabled",true);
	$('#quicksettingsbut').prop("disabled",true);
	$('#getproducts').prop("disabled",false);
	$('#savechanges').prop("disabled",false);
	$('#revertcell').prop("disabled",false);
	$('#revertrow').prop("disabled",false);
	$('#revertall').prop("disabled",false);
	$('#revertselected').prop("disabled",false);
	$('#settings').prop("disabled",false);
	$('#customfieldsbut').prop("disabled",false);
	$('#findcustomfieldsbut').prop("disabled",false);
	$('#pluginsettingsbut').prop("disabled",false);
	$('#exportproducts').prop("disabled",false);
	
	
	function replaceAll(str, token, newToken, ignoreCase) {
	    var i = -1, _token;
	    if(typeof token === "string") {
	        if(ignoreCase === true) {
	            _token = token.toLowerCase();
	            while((i = str.toLowerCase().indexOf( _token, i >= 0? i + newToken.length : 0 )) !== -1 ) {
	                str = str.substring(0, i)
	                        .concat(newToken)
	                        .concat(str.substring(i + _token.length));
	            }
	        } else {
	            return str.split(token).join(newToken);
	        }
	    }
		return str;
	}

	function pad(num, size) 
	{
	    var s = num+"";
	    while (s.length < size) s = "0" + s;
	    return s;
	}
	
	function BulkUpdateField(field,selitem,value,rowid,action,params)
	{
		var col = _idmap[_mapfield[field]];
		if(col === undefined) return;
		
			
		if(col.scope !== undefined && !_disablesafety)
		{
			if(col.scope == SCOPE.PRODALL)
			{
				if(selitem.post_type == 'revision')
				{
					return;
				}
			}
			if(col.scope === SCOPE.VAR)
			{
				if(selitem.post_type !== 'revision')
				{
					return;
				}
			}
			if(col.scope == SCOPE.PRODSVAR)
			{
				if(selitem.post_type === "product")
				{
					if(selitem.haschildren !== undefined || selitem.product_type === "variable")
					{
						return;
					}
				}
			}
			if(col.scope == SCOPE.PRODSWITHVARS)
			{
				if(selitem.post_type === "product")
				{
					if(selitem.haschildren === undefined && selitem.product_type !== "variable")
					{
						return;
					}
				}
			}
		}

		if(field === "_sku" && action === "fillseries")
		{
			if(_reserved._skuseries === undefined)
			{
				_reserved._skuseries = value;
				if(!isNaN(value))
				{
					_reserved._skuseries = parseInt(value, 10);
					var arr_str0 = value.match(/^[\1-9]*/g);
					var count = arr_str0[0].length;
					if(count >= 1)
					{
						_reserved._skuseriespadsize = count;
					}
				}
				
				if(selitem[field] === undefined || selitem[field] === null)
				selitem[field] = "";
				if(value !== selitem[field])
				{
					SetEditValue(rowid,field,selitem[field]);
					selitem[field] = value;
					if(_changed[rowid] === undefined)
						_changed[rowid] = {};
					_changed[rowid][field] = "changed";
				}
				return;
			}else
			{
				var newval = value;
				if(_reserved._skuseriespadsize !== undefined)
				{
					_reserved._skuseries++;
					newval = pad(_reserved._skuseries,_reserved._skuseriespadsize);
				}
				
				if(selitem[field] === undefined || selitem[field] === null)
					selitem[field] = "";
				if(newval !== selitem[field])
				{
					SetEditValue(rowid,newval,selitem[field]);
					selitem[field] = newval;
					if(_changed[rowid] === undefined)
						_changed[rowid] = {};
					_changed[rowid][field] = "changed";
				}
				return;
			}
		}
		
		if(field == "grouped_items") 
		{
			if(selitem.product_type != 'simple')
			{
				return;
			}
			
		}
		
		if(field === '_custom_attributes')
		{
			if(selitem[field] === undefined || selitem[field] === null)
				selitem[field] = [];
			var arrcustselitem = selitem[field];
			//check for attribute name existence
			var hasit = false;
			var changed = false;
			var curitem = {};

			for(var j = 0; j < arrcustselitem.length; j++)
			{
				if(arrcustselitem[j].name === params[field + 'name'])
				{
					curitem = arrcustselitem[j];
					hasit = true;
					break;
				}
			}
			
			
			var clonearray = $.extend(true, [], selitem[field]);
			
			if(params[field + '_visiblefp'] !== undefined || params[field + '_usedforvars'] !== undefined )
			{
				
				if(selitem.post_type == 'product' && params[field + '_onlyvisiblefp'] === 1)
				{
					// &&  (params[field + 'action'] === "new" || params[field + 'action'] === "removevalue")
					if(!hasit) //we're setting only visiblefp to a non-existing attribute name!
						return;
						
					if(params[field + '_visiblefp'] === curitem.is_visible)
					{
						return;
					}
					SetEditValue(rowid,field,clonearray);
					curitem.is_visible = params[field + '_visiblefp'];
					if(_changed[rowid] === undefined)
						_changed[rowid] = {};
					_changed[rowid][field] = "changed";
					return;
				}
				if(selitem.product_type === 'variable' && params[field + '_onlyusedforvars'] === 1)
				{
					if(!hasit) //we're setting only visiblefp to a non-existing attribute name!
						return;
						
					if(params[field + '_usedforvars'] === curitem.is_variation)
					{
						return;
					}
					SetEditValue(rowid,field,clonearray);
					curitem.is_variation = params[field + '_usedforvars'];
					if(_changed[rowid] === undefined)
						_changed[rowid] = {};
					_changed[rowid][field] = "changed";
					return;
				}
				
				if(params[field + '_onlyusedforvars'] === 1 || params[field + '_onlyvisiblefp'] === 1)
					return;
					
//				if(params[field + 'action'] === "new")
//				{
//					curitem.name = params[field + 'name'];
//					if(curitem.value != params[field + 'value'] && params[field + 'value'] !== "")
//					{
//						curitem.value = params[field + 'value'];
//						changed = true;
//					}
//				}
				
				if((selitem.product_type == 'simple' || selitem.product_type == 'grouped' || selitem.product_type == 'variable') && params[field + '_visiblefp'] !== undefined)
				{
					if(params[field + '_visiblefp'] !== curitem.is_visible)
					{
						curitem.is_visible = params[field + '_visiblefp'];
						changed = true;
					}
				}
				
				if(params[field + '_usedforvars'] !== undefined && selitem.product_type == 'variable')
				{
					if(params[field + '_usedforvars'] !== curitem.is_variation)
					{
						curitem.is_visible = params[field + '_usedforvars'];
						changed = true;
					}
				}
			}
			
			if(!hasit)
			{
				if(params[field + 'action'] !== "new")
				{
					 if(!(params[field + 'action'] === "addvalue" && selitem.post_type === 'revision'))
						return;
				}
				else
				{
					if(params[field + 'name'] === "")
						return;
				}
				changed = true;
				
				if(selitem.post_type == 'product')
				{
					curitem.is_taxonomy = 0;
					if(params[field + '_visiblefp'] === undefined)
					{
						curitem.is_visible = 0;
					}
					if(params[field + '_usedforvars'] === undefined && selitem.product_type === 'variable')
					{
						curitem.is_variation = 0;
					}
				}			
			}
			
			if(params[field + 'action'] === "new"  && selitem.post_type == 'product')
			{
				curitem.name = params[field + 'name'];
				if(curitem.value != params[field + 'value'])
				{
					curitem.value = params[field + 'value'];
					changed = true;
				}
				if(!hasit)
					arrcustselitem.push(curitem);
			}
			if((params[field + 'action'] === "new" || (params[field + 'action'] === "addvalue" && !hasit)) && selitem.post_type == 'revision')
			{
				curitem.name = params[field + 'name'];
				curitem.attslug = W3Ex._w3ex_map_attributes[curitem.name];
				curitem.slug = "";
				curitem.value = "";
				if(params[field + 'value'] === "")
				{
					curitem.slug = "";
					curitem.value = "";
					changed = true;
				}
				if(params[field + 'value'] !== "" && curitem.value !== params[field + 'value'])
				{
					 var values = params[field + 'value'].split(W3Ex._w3ex_wc_delimiter); 
				     for(var i = 0; i < values.length; i++)
				     {
					 	var value = $.trim(values[i]);
					 	var valueslug = W3Ex._w3ex_map_attributes[value];
					 	if(valueslug === undefined) valueslug = "";
					 	curitem.slug = valueslug;
						curitem.value = value;
						changed = true;
						break;
					 }
					
				}
				if(!hasit)
					arrcustselitem.push(curitem);
			}

			if(params[field + 'action'] === "removename" && hasit)
			{
				for(var j = 0; j < arrcustselitem.length; j++)
				{
					if(arrcustselitem[j].name === params[field + 'name'])
					{
					 	arrcustselitem.splice(j, 1);
						changed = true;
						break;
					}
				}
			}
			
			if(params[field + 'action'] === "removevalue" && hasit)
			{
				if(selitem.post_type == 'product')
				{
					var values = params[field + 'value'].split(W3Ex._w3ex_wc_delimiter); 
					var curvalues = curitem.value.split(W3Ex._w3ex_wc_delimiter); 
					var isremoved = false;
				     for(var i = 0; i < values.length; i++)
				     {
					 	var value = $.trim(values[i]);
					 	for(var j = 0; j < curvalues.length; j++)
				     	{
					 		var curvalue = $.trim(curvalues[j]);
					 		if(value === curvalue)
					 		{
					 			curvalues.splice(j, 1);
					 			changed = true;
					 			isremoved = true;
								break;
							}
					 	}
					 }
					 if(isremoved)
					 {
						 curitem.value = "";
						for(var j = 0; j < curvalues.length; j++)
				     	{
					 		var curvalue = $.trim(curvalues[j]);
					 		if(curitem.value === "")
					 		{
					 			curitem.value+= curvalue;
							}else
							{
								curitem.value+= W3Ex._w3ex_wc_delimiter + curvalue;
							}
					 	}
					 }
					 
				}
				if(selitem.post_type == 'revision')
				{
					var values = params[field + 'value'].split(W3Ex._w3ex_wc_delimiter); 
				     for(var i = 0; i < values.length; i++)
				     {
					 	var value = $.trim(values[i]);
					 	if(value === curitem.value)
					 	{
							curitem.slug = "";
							curitem.value = "";
							changed = true;
						}
						break;
					 }
				}
                 
			}
			
			if(params[field + 'action'] === "addvalue" && hasit)
			{
				if(selitem.post_type == 'product')
				{
					var values = params[field + 'value'].split(W3Ex._w3ex_wc_delimiter); 
					var curvalues = curitem.value.split(W3Ex._w3ex_wc_delimiter); 
					var isadded = true;
				     for(var i = 0; i < values.length; i++)
				     {
					 	var value = $.trim(values[i]);
					 	for(var j = 0; j < curvalues.length; j++)
				     	{
					 		var curvalue = $.trim(curvalues[j]);
					 		if(value === curvalue)
					 		{
					 			values.splice(i, 1);
//					 			isadded = false;
								break;
							}
					 	}
					 }
					 if(values.length > 0)
					 {
					 	changed = true;
//						 curitem.value = "";
						for(var j = 0; j < values.length; j++)
				     	{
					 		var curvalue = $.trim(values[j]);
					 		if(curitem.value === "")
					 		{
					 			curitem.value+= curvalue;
							}else
							{
								curitem.value+= W3Ex._w3ex_wc_delimiter + curvalue;
							}
					 	}
					 }
					 
				}
				if(selitem.post_type == 'revision')
				{
					var values = params[field + 'value'].split(W3Ex._w3ex_wc_delimiter); 
					if(curitem.value !== "")
						return;
				     for(var i = 0; i < values.length; i++)
				     {
					 	var value = $.trim(values[i]);
					 	if(value === curitem.value)
					 	{
							return;
						}else
						{
							var valueslug = W3Ex._w3ex_map_attributes[value];
					 		if(valueslug === undefined) valueslug = "";
					 		curitem.slug = valueslug;
							curitem.value = value;
							changed = true;
						}
						break;
					 }
				}
                 
			}
			if(!changed) return;
			
			SetEditValue(rowid,field,clonearray);
			if(_changed[rowid] === undefined)
				_changed[rowid] = {};
			_changed[rowid][field] = "changed";
			return;
		}
		
		if(col.checkbox !== undefined)
		{
			if(col.field === '_stock_status')
			{
				if(selitem[col.field] === undefined)
					selitem[col.field] = "outofstock";
			}else
			{
				
				if(selitem[col.field] === undefined)
					selitem[col.field] = "no";
			}
		}
		if(col.type !== undefined && col.type == 'customtaxh')
		{
			if(selitem[field] === undefined || selitem[field] === null)
				selitem[field] = "";
			if(true === col.attribute && ( params[field + '_visiblefp'] !== undefined || params[field + '_usedforvars'] !== undefined))
			{
				if(selitem[field + '_ids'] === undefined)
					selitem[field + '_ids'] = "";
				if(selitem.post_type == 'product' && params[field + '_onlyvisiblefp'] === 1)
				{
					var oldvisibleandused = selitem[field + '_visiblefp'];
					if(params[field + '_visiblefp'] === 1 && (oldvisibleandused & 1))
					{
						return;
					}
					if(params[field + '_visiblefp'] === 0 && !(oldvisibleandused & 1))
					{
						return;
					}
					if(selitem[field + '_ids'] != "")
					{
						SetEditValue(rowid,field + '_visiblefp',selitem[field + '_visiblefp']);
						if(params[field + '_visiblefp'] == 1)
						{
							oldvisibleandused|= 1;
						}else
						{
						    oldvisibleandused&= ~1;
						}
						selitem[field + '_visiblefp'] = oldvisibleandused;
						if(_changed[rowid] === undefined)
							_changed[rowid] = {};
						_changed[rowid][field] = "changed";
					}
					return;
				}
				if(selitem.product_type === 'variable' && params[field + '_onlyusedforvars'] === 1)
				{
					var oldvisibleandused = selitem[field + '_visiblefp'];
					if(params[field + '_usedforvars'] === 1 && (oldvisibleandused & 2))
					{
						return;
					}
					if(params[field + '_usedforvars'] === 0 && !(oldvisibleandused & 2))
					{
						return;
					}
					if(selitem[field + '_ids'] != "")
					{
						SetEditValue(rowid,field + '_visiblefp',selitem[field + '_visiblefp']);
						var oldvisibleandused = selitem[field + '_visiblefp'];
						if(params[field + '_usedforvars'] == 1)
						{
							oldvisibleandused|= 2;
						}else
						{
						    oldvisibleandused&= ~2;
						}
						selitem[field + '_visiblefp'] = oldvisibleandused;
						if(_changed[rowid] === undefined)
							_changed[rowid] = {};
						_changed[rowid][field] = "changed";
					}
					return;
				}
				
				if(params[field + '_onlyusedforvars'] === 1 || params[field + '_onlyvisiblefp'] === 1)
					return;
					
				if((selitem.product_type == 'simple' || selitem.product_type == 'grouped') && params[field + '_visiblefp'] !== undefined)
				{
					if(params[field + '_visiblefp'] !== selitem[field + '_visiblefp'])
					{
						
						if((params[field + 'value_ids'] !== undefined) && (params[field + 'value_ids']) && params[field + 'action'] !== "remove")
						{
							if(params[field + 'value_ids'].length > 0 || selitem[field + '_ids'] != "")
							{
								if(!(params[field + 'value_ids'].length === 0 && params[field + 'action'] === "new"))
								{
									SetEditValue(rowid,field + '_visiblefp',selitem[field + '_visiblefp']);
									selitem[field + '_visiblefp'] = params[field + '_visiblefp'];
									if(_changed[rowid] === undefined)
										_changed[rowid] = {};
									_changed[rowid][field] = "changed";
								}
							}
						}
					}
				}
				
				if(params[field + '_visiblefp'] !== undefined && selitem.product_type == 'variable')
				{
					var oldvisibleandused = selitem[field + '_visiblefp'];
					
					if((params[field + '_visiblefp'] === 1 && !(oldvisibleandused & 1)) || (params[field + '_visiblefp'] === 0 && (oldvisibleandused & 1)))
					{
						if(params[field + 'value_ids'] !== undefined && params[field + 'value_ids'] !== "" && params[field + 'action'] !== "remove")
						{
							if(params[field + 'value_ids'].length > 0 || selitem[field + '_ids'] != "")
							{
								if(!(params[field + 'value_ids'].length === 0 && params[field + 'action'] === "new"))
								{
									SetEditValue(rowid,field + '_visiblefp',selitem[field + '_visiblefp']);
									if(params[field + '_visiblefp'] === 1)
									{
										oldvisibleandused|= 1;
									}else
									{
									    oldvisibleandused&= ~1;
									}
									selitem[field + '_visiblefp'] = oldvisibleandused;
									if(_changed[rowid] === undefined)
										_changed[rowid] = {};
									_changed[rowid][field] = "changed";
								}
							}
						}
					}
				}
				if(params[field + '_usedforvars'] !== undefined && selitem.product_type == 'variable')
				{
					var oldvisibleandused = selitem[field + '_visiblefp'];
					if((params[field + '_usedforvars'] === 1 && !(oldvisibleandused & 2)) || (params[field + '_usedforvars'] === 0 && (oldvisibleandused & 2)))
					{
						if(params[field + 'value_ids'] !== undefined && params[field + 'value_ids'] !== "" && params[field + 'action'] !== "remove")
						{
							if(params[field + 'value_ids'].length > 0 || selitem[field + '_ids'] != "")
							{
								if(!(params[field + 'value_ids'].length === 0 && params[field + 'action'] === "new"))
								{
									SetEditValue(rowid,field + '_visiblefp',selitem[field + '_visiblefp']);
									if(params[field + '_usedforvars'] === 1)
									{
										oldvisibleandused|= 2;
									}else
									{
									    oldvisibleandused&= ~2;
									}
									selitem[field + '_visiblefp'] = oldvisibleandused;
									if(_changed[rowid] === undefined)
										_changed[rowid] = {};
									_changed[rowid][field] = "changed";
								}
							}
						}
					}
				}
			}
			
			
			if(params[field + 'action'] !== undefined && params[field + 'action'] !== "new")
			{
				if(params[field + 'action'] === "add")
				{
					var catsids = selitem[field + '_ids'];
					var curcatsids = params[field + 'value_ids'].join();
					
					if(catsids === undefined)
						catsids = "";
					if(curcatsids === undefined)
						curcatsids = "";
					if(true === col.attribute && selitem['post_type'] == 'revision')
					{
						if(catsids !== "" || selitem[field] != "")
						{//variation has one already
							return;
						}
					}
					
					
					if(curcatsids == "")
						return; //empty string, bye, bye
						
					catsids = catsids.split(',');
					curcatsids = curcatsids.split(',');
					
					
					if (catsids instanceof Array && curcatsids instanceof Array) 
					{
						var addcats = [];
						for(var i=0; i < curcatsids.length; i++)
						{
							if(catsids.indexOf(curcatsids[i]) === -1)
							{
							   addcats.push(curcatsids[i]);
							}
						}
						if(addcats.length == 0) return; //nothing to add
						var insertval = params[field + 'value'];
						if(true === col.attribute && selitem['post_type'] == 'revision')
						{
							if(addcats.length > 1)
							{//variation has one already
								addcats.splice(1,addcats.length -1);
							}
							 if(params[field + 'value'].indexOf(',') !== -1)
							 {
							 	insertval = params[field + 'value'].substring(0,params[field + 'value'].indexOf(","));
							 }
						}
						catsids = catsids.concat(addcats); 
						SetEditValue(rowid,field,selitem[field]);
						if(selitem[field + '_ids'] === undefined)
							selitem[field + '_ids'] = "";
						SetEditValue(rowid,field + '_ids',selitem[field + '_ids']);
						selitem[field + '_ids'] = catsids.join();
						if(selitem[field + '_ids'] === "")
							selitem[field] = "";
						else
						{
							if(selitem[field] == "")
								selitem[field] = insertval;
							else
								selitem[field] = selitem[field] + ", " + insertval;
						}
							
						if(_changed[rowid] === undefined)
							_changed[rowid] = {};
						_changed[rowid][field] = "changed";
					}
					
					return;
				}
				if(params[field + 'action'] === "remove")
				{
					var catsids = selitem[field + '_ids'];
					var curcatsids = params[field + 'value_ids'].join();
					
					if(catsids === undefined)
						catsids = "";
					if(curcatsids === undefined)
						curcatsids = "";
					/*if(true === col.attribute && selitem['post_type'] == 'product' && catsids !== "")
					{
						if(params[field + '_visiblefp'] !== undefined)
						{
							if(params[field + '_visiblefp'] !== selitem[field + '_visiblefp'])
							{
								SetEditValue(rowid,field + '_visiblefp',selitem[field + '_visiblefp']);
								selitem[field + '_visiblefp'] = params[field + '_visiblefp'];
								SetEditValue(rowid,field,selitem[field]);
								if(selitem[field + '_ids'] === undefined)
									selitem[field + '_ids'] = "";
								SetEditValue(rowid,field + '_ids',selitem[field + '_ids']);
								if(_changed[rowid] === undefined)
									_changed[rowid] = {};
								_changed[rowid][field] = "changed";
							}
						}
					}*/
					
					if(curcatsids == "")
						return; //empty string, bye, bye
						
					catsids = catsids.split(',');
					curcatsids = curcatsids.split(',');
					/*if(params[field + '_visiblefp'] !== undefined && true === col.attribute && selitem['post_type'] == 'product')
					{
						SetEditValue(rowid,field + '_visiblefp',selitem[field + '_visiblefp']);
						selitem[field + '_visiblefp'] = params[field + '_visiblefp'];
					}*/
					if (catsids instanceof Array && curcatsids instanceof Array) 
					{
						var remcats = [];
						for(var i=0; i < curcatsids.length; i++)
						{
							if(catsids.indexOf(curcatsids[i]) !== -1)
							{
							   remcats.push(curcatsids[i]);
							}
						}
						if(remcats.length == 0) return; //nothing to remove
						for(var i=0; i < remcats.length; i++)
						{
							if(catsids.indexOf(remcats[i]) !== -1)
							{
							    catsids.splice(catsids.indexOf(remcats[i]), 1);
							}
						}
						SetEditValue(rowid,field,selitem[field]);
						if(selitem[field + '_ids'] === undefined)
							selitem[field + '_ids'] = "";
						SetEditValue(rowid,field + '_ids',selitem[field + '_ids']);
						selitem[field + '_ids'] = catsids.join();
						if(selitem[field + '_ids'] === "")
							selitem[field] = "";
						else
						{
							var oldcats = selitem[field];
							var removecats = params[field + 'value'];
							oldcats = oldcats.replace(/\s/g, ""); 
							removecats = removecats.replace(/\s/g, ""); 
							oldcats = oldcats.split(',');
							removecats = removecats.split(',');
					
							if (oldcats instanceof Array && removecats instanceof Array) 
							{
								for(var i=0; i < removecats.length; i++)
								{
									if(oldcats.indexOf(removecats[i]) !== -1)
									{
									    oldcats.splice(oldcats.indexOf(removecats[i]), 1);
									}
								}
								var newcats = "";
								for(var i=0; i < oldcats.length; i++)
								{
									if(i == 0)
										newcats = oldcats[i];
									else
										newcats+= ", " + oldcats[i];
								}
								selitem[field] = newcats;
							}
						}
							
						if(_changed[rowid] === undefined)
							_changed[rowid] = {};
						_changed[rowid][field] = "changed";
					}
					return;
				}
				
				return;
			}
			var changedvisible = false;
			/*if(true === col.attribute && selitem['post_type'] == 'product')
			{
				if(params[field + '_visiblefp'] !== undefined)
				{
					if(params[field + '_visiblefp'] !== selitem[field + '_visiblefp'])
					{
						changedvisible = true;
					}
				}
			}*/
			
			{
				var catsids = selitem[field + '_ids'];
				var curcatsids = params[field + 'value_ids'].join();
				
				if(catsids === undefined)
					catsids = "";
				if(curcatsids === undefined)
					curcatsids = "";
				
				if(catsids === "" && curcatsids === "")
					return; //ignore change visible for empty cells
					
				catsids = catsids.split(',');
				curcatsids = curcatsids.split(',');
				
				
				if (catsids instanceof Array && curcatsids instanceof Array) 
				{
					if(catsids.length == curcatsids.length)
					{
						var breturn = true;
						for(var i=0; i < catsids.length; i++)
						{
							if(curcatsids.indexOf(catsids[i]) === -1)
							{
							   breturn = false;
							   break;
							}
						}
						if(breturn && !changedvisible)
						{
							return;
						}
					}
				}
			}

			var insertval = "";
			var temparr = [];
			if(true === col.attribute && selitem['post_type'] == 'revision')
			{
				
				 if(params[field + 'value_ids'] instanceof Array)
				 {
				 	temparr = $.extend(true, [], params[field + 'value_ids']);
				 	if(temparr.length > 1)
					{
						temparr.splice(1,temparr.length - 1);
					}
				 }
				 insertval = params[field + 'value'];
				 if(params[field + 'value'].indexOf(',') !== -1)
				 {
				 	insertval = params[field + 'value'].substring(0,params[field + 'value'].indexOf(","));
				 }
				SetEditValue(rowid,field,selitem[field]);
				if(selitem[field + '_ids'] === undefined)
					selitem[field + '_ids'] = "";
				SetEditValue(rowid,field + '_ids',selitem[field + '_ids']);
				selitem[field + '_ids'] = temparr.join();
				if(selitem[field + '_ids'] === "")
					selitem[field] = "";
				else
					selitem[field] = insertval;
				if(_changed[rowid] === undefined)
					_changed[rowid] = {};
				_changed[rowid][field] = "changed";
			}else
			{
//				if()
				{
					SetEditValue(rowid,field,selitem[field]);
					if(selitem[field + '_ids'] === undefined)
						selitem[field + '_ids'] = "";
					SetEditValue(rowid,field + '_ids',selitem[field + '_ids']);
					/*if(changedvisible && true === col.attribute && selitem['post_type'] == 'product')
					{
						SetEditValue(rowid,field + '_visiblefp',selitem[field + '_visiblefp']);
						selitem[field + '_visiblefp'] = params[field + '_visiblefp'];
					}*/
					selitem[field + '_ids'] = params[field + 'value_ids'].join();
					if(selitem[field + '_ids'] === "")
						selitem[field] = "";
					else
						selitem[field] = params[field + 'value'];
					if(_changed[rowid] === undefined)
						_changed[rowid] = {};
					_changed[rowid][field] = "changed";
				}
			}
			return;
		}
		if(col.type === undefined || col.type === 'customtax' || col.type === 'text' || col.type === 'multitext' )
		{//text field
			if(selitem[field] === undefined || selitem[field] === null)
				selitem[field] = "";
			if(params[field + 'mappedto'] !== undefined)
			{
				var mappedto = params[field + 'mappedto'];
				if(selitem[mappedto] !== undefined && selitem[mappedto] !== null)
				{
					value = selitem[mappedto];
				}
				if(mappedto === "copyfromparent" )
				{
					if(selitem['post_type'] === "revision")
					{
						if(_parentmap[selitem.post_parent] !== undefined)
						{
							value = _parentmap[selitem.post_parent][field];
						}else
						{
							value = "";
						}
					}else
					{
						return;
					}
				
				}
			}
			var oldvalue = selitem[field];
			var bupdate = false;
			switch(action)
			{
				case "new":
				{
					selitem[field] = value;
				}break;
				case "prepend":
				{
					if(selitem[field] !== undefined)
					{
						selitem[field] = value + selitem[field];
					}else
					{
						selitem[field] = value;
					}
				}break;
				case "append":
				{
					if(selitem[field] !== undefined)
					{
						selitem[field] = selitem[field] + value;
					}else
					{
						selitem[field] = value;
					}
				}break;
				case "replace":
				{
					if(selitem[field] != "")
					{
//						allow replace with empty string === delete search string
//						if(reptext != "")
						{
							var ifignorecase = params[field + 'ifignore'];
							var reptext = params[field + 'replacewith'];
							var posttitle = selitem[field];
							var replaced = replaceAll(posttitle,value,reptext,ifignorecase);
							if(replaced != selitem[field])
							{
								selitem[field] = replaced;
							}
						}
					}
					
				}break;
				case "replaceregexp":
				{
					if(selitem[field] != "")
					{
//						allow replace with empty string === delete search string
//						if(reptext != "")
						{
							var ifignorecase = params[field + 'ifignore'];
							var reptext = params[field + 'replacewith'];
							var posttitle = selitem[field];
							var replaced = posttitle;
							var flags = "g";
							if(ifignorecase)
							{
								flags+= "i";
							}
							if(col.type === "multitext")
							{
								flags+= "m";
							}
							var myRe = new RegExp(value, flags);
							replaced = posttitle.replace(myRe,reptext);
							if(replaced != selitem[field])
							{
								selitem[field] = replaced;
							}
						}
					}
					
				}break;
				default:break;
			}
			if(action == "delete")
			{
				selitem[field] = "";
				if(selitem[field] !== oldvalue)
				{
					SetEditValue(rowid,field,String(oldvalue));
					if(_changed[rowid] === undefined)
						_changed[rowid] = {};
					_changed[rowid][field] = "changed";
				}
			}else{
				if(selitem[field] !== oldvalue)
				{
					SetEditValue(rowid,field,oldvalue);
					if(_changed[rowid] === undefined)
						_changed[rowid] = {};
					_changed[rowid][field] = "changed";
				}
			}
		}
		if(col.type === 'set')
		{
			if(selitem[field] === undefined || selitem[field] === null)
				selitem[field] = "";
			if(value !== selitem[field])
			{
				SetEditValue(rowid,field,selitem[field]);
				selitem[field] = value;
				if(_changed[rowid] === undefined)
					_changed[rowid] = {};
				_changed[rowid][field] = "changed";
			}
			return;
		}
		if(col.type === 'float2' || col.type === 'float3')
		{
			if(selitem[field] === undefined || selitem[field] === null)
				selitem[field] = "";
			var oldvalue = selitem[field];
			var hascommas = false;
			if(W3Ex.sett_usecomma !== undefined && W3Ex.sett_usecomma == 1)
			{
				hascommas = true;
			}
			if(hascommas)
			{
				value = replaceAll(value,',', '.');
			}
			var bulkvalue = parseFloat(value);
			
			if(params[field + 'mappedto'] !== undefined)// && action === "new")
			{
				var mappedto = params[field + 'mappedto'];
				if(selitem[mappedto] !== undefined && selitem[mappedto] !== null)
				{
					bulkvalue = parseFloat(selitem[mappedto]);
				}
				if(mappedto === "copyfromparent" )
				{
					if(selitem['post_type'] === "revision")
					{
						if(_parentmap[selitem.post_parent] !== undefined)
						{
							bulkvalue = parseFloat(_parentmap[selitem.post_parent][field]);
						}else
						{
							return;
						}
					}else
					{
						return;
					}
				
				}
			}
			if(isNaN(bulkvalue))
				return;
			var prec = 3;
			if(col.type === 'float2') prec = 2;
			bulkvalue = Number(bulkvalue.toFixed(prec));
			var pricestr = selitem[field];
//			if(params[field + 'mappedto'] !== undefined && action !== "new")
//			{
//				var mappedto = params[field + 'mappedto'];
//				if(selitem[mappedto] !== undefined && selitem[mappedto] !== null)
//				{
//					pricestr = selitem[mappedto];
//				}else
//				{
//					return;
//				}
//			}
			if(pricestr.indexOf(',') !== -1)
			{
				pricestr = replaceAll(pricestr,',', '.');
				hascommas = true;
			}
			var price = parseFloat(pricestr);
			
			var bsetedit = false;
			if(!isNaN(bulkvalue))
			{
				switch(action)
				{
					case "new":
					{
						{
							selitem[field] = bulkvalue;
						}
					}break;
					case "incvalue":
					{
						if(!isNaN(price))
						{
							selitem[field] =  (Number(price) + bulkvalue).toFixed(prec);
							bsetedit = true;
						}
					}break;
					case "incpercent":
					{
						if(!isNaN(price))
						{
							var percent = (bulkvalue * 0.01) * parseFloat(price);
							selitem[field] =  (Number(price) + parseFloat(percent)).toFixed(prec);
							if(params[field+'roundvalue'] !== undefined)
							{
								if(params[field+'roundvalue'] === 'rounddown')
								{
									selitem[field] = Math.floor(Number(selitem[field]));
									selitem[field] = selitem[field].toString();
								}else if(params[field+'roundvalue'] === 'roundup')
								{
									selitem[field] = Math.ceil(Number(selitem[field]));//Math.ceil(Number(selitem[field]) * 10) / 10;
									selitem[field] = selitem[field].toString();
								}else if(params[field+'roundvalue'] === 'rounddown1')
								{
									selitem[field] =Math.floor(Number(selitem[field]) * 10) / 10;
									selitem[field] = selitem[field].toString();
								}else if(params[field+'roundvalue'] === 'roundup1')
								{
									selitem[field] = Math.ceil(Number(selitem[field]) * 10) / 10;
									selitem[field] = selitem[field].toString();
								}else if(params[field+'roundvalue'] === 'rounddown10')
								{
									selitem[field] =Math.floor(Number((selitem[field]) + 1) /10) * 10;
									selitem[field] = selitem[field].toString();
								}else if(params[field+'roundvalue'] === 'roundup10')
								{
									selitem[field] = Math.ceil(Number((selitem[field]) + 1) /10) * 10;
									selitem[field] = selitem[field].toString();
								}else if(params[field+'roundvalue'] === 'rounddown100')
								{
									selitem[field] =Math.floor(Number((selitem[field]) + 1) /100) * 100;
									selitem[field] = selitem[field].toString();
								}else if(params[field+'roundvalue'] === 'roundup100')
								{
									selitem[field] = Math.ceil(Number((selitem[field]) + 1) /100) * 100;
									selitem[field] = selitem[field].toString();
								}
							}
							bsetedit = true;
						}
						
					}break;
					case "decvalue":
					{
						if(!isNaN(price))
						{
							if((Number(price) - bulkvalue) >= 0)
							{
								selitem[field] =  (Number(price) - bulkvalue).toFixed(prec);
								bsetedit = true;
							}else
							{
								selitem[field] =  (0).toFixed(prec);
								bsetedit = true;
							}
						}
					}break;
					case "decpercent":
					{
						if(!isNaN(price))
						{
							var percent = (bulkvalue * 0.01) * parseFloat(price);
							selitem[field] =  (parseFloat(price) - parseFloat(percent)).toFixed(prec);
							if(params[field+'roundvalue'] !== undefined)
							{
								if(params[field+'roundvalue'] === 'rounddown')
								{
									selitem[field] = Math.floor(Number(selitem[field]));
									selitem[field] = selitem[field].toString();
								}else if(params[field+'roundvalue'] === 'roundup')
								{
									selitem[field] = Math.ceil(Number(selitem[field]));
									selitem[field] = selitem[field].toString();
								}else if(params[field+'roundvalue'] === 'rounddown1')
								{
									selitem[field] =Math.floor(Number(selitem[field]) * 10) / 10;
									selitem[field] = selitem[field].toString();
								}else if(params[field+'roundvalue'] === 'roundup1')
								{
									selitem[field] = Math.ceil(Number(selitem[field]) * 10) / 10;
									selitem[field] = selitem[field].toString();
								}else if(params[field+'roundvalue'] === 'rounddown10')
								{
									selitem[field] =Math.floor(Number((selitem[field]) + 1) /10) * 10;
									selitem[field] = selitem[field].toString();
								}else if(params[field+'roundvalue'] === 'roundup10')
								{
									selitem[field] = Math.ceil(Number((selitem[field]) + 1) /10) * 10;
									selitem[field] = selitem[field].toString();
								}else if(params[field+'roundvalue'] === 'rounddown100')
								{
									selitem[field] =Math.floor(Number((selitem[field]) + 1) /100) * 100;
									selitem[field] = selitem[field].toString();
								}else if(params[field+'roundvalue'] === 'roundup100')
								{
									selitem[field] = Math.ceil(Number((selitem[field]) + 1) /100) * 100;
									selitem[field] = selitem[field].toString();
								}
							}
							bsetedit = true;
						}
					}break;
					case "decvaluereg":
					{//sale price only
						{//only without sale price set
							if(params.isskipsale !== undefined)
							{
								if(params.isskipsale)
								{
									if(!isNaN(price) || price == 0)
									{
										break;
									}
								}
							}
							var regpricestr = selitem._regular_price;
							if(regpricestr === undefined || regpricestr === null)
								regpricestr = "";
							regpricestr = regpricestr.toString();
							if(regpricestr.indexOf(',') !== -1)
							{
								regpricestr = replaceAll(regpricestr,',', '.');
								hascommas = true;
							}
							var regprice = parseFloat(regpricestr);
							
							if(!isNaN(regprice))
							{
								selitem._sale_price =   (Number(regprice) - bulkvalue).toFixed(prec);
								bsetedit = true;
							}
						}
					}break;
					case "decpercentreg":
					{
						{
							if(params.isskipsale !== undefined)
							{
								if(params.isskipsale)
								{
									if(!isNaN(price) || price == 0)
									{
										break;
									}
								}
							}
							var regpricestr = selitem._regular_price;
							if(regpricestr === undefined || regpricestr === null)
								regpricestr = "";
							regpricestr = regpricestr.toString();
							if(regpricestr.indexOf(',') !== -1)
							{
								regpricestr = replaceAll(regpricestr,',', '.');
								hascommas = true;
							}
							var regprice = parseFloat(regpricestr);
							if(!isNaN(regprice))
							{
								var percent = (bulkvalue * 0.01) * parseFloat(regprice);
								selitem._sale_price =  (parseFloat(regprice) - parseFloat(percent)).toFixed(prec);
								if(params[field+'roundvalue'] !== undefined)
								{
									if(params[field+'roundvalue'] === 'rounddown')
									{
										selitem[field] = Math.floor(Number(selitem[field]));
										selitem[field] = selitem[field].toString();
									}else if(params[field+'roundvalue'] === 'roundup')
									{
										selitem[field] = Math.ceil(Number(selitem[field]));
										selitem[field] = selitem[field].toString();
									}else if(params[field+'roundvalue'] === 'rounddown1')
									{
										selitem[field] =Math.floor(Number(selitem[field]) * 10) / 10;
										selitem[field] = selitem[field].toString();
									}else if(params[field+'roundvalue'] === 'roundup1')
									{
										selitem[field] = Math.ceil(Number(selitem[field]) * 10) / 10;
										selitem[field] = selitem[field].toString();
									}else if(params[field+'roundvalue'] === 'rounddown10')
									{
										selitem[field] =Math.floor(Number((selitem[field]) + 1) /10) * 10;
										selitem[field] = selitem[field].toString();
									}else if(params[field+'roundvalue'] === 'roundup10')
									{
										selitem[field] = Math.ceil(Number((selitem[field]) + 1) /10) * 10;
										selitem[field] = selitem[field].toString();
									}else if(params[field+'roundvalue'] === 'rounddown100')
									{
										selitem[field] =Math.floor(Number((selitem[field]) + 1) /100) * 100;
										selitem[field] = selitem[field].toString();
									}else if(params[field+'roundvalue'] === 'roundup100')
									{
										selitem[field] = Math.ceil(Number((selitem[field]) + 1) /100) * 100;
										selitem[field] = selitem[field].toString();
									}
								}
								bsetedit = true;
							}
						}
					}break;
					default:break;
				}
				if(selitem[field]  !== undefined)
				{
					selitem[field]  = String(selitem[field]);
					if(col.type === 'float3')
						selitem[field]  = selitem[field].replace('.000','');
					else
						selitem[field]  = selitem[field].replace('.00','');
					if(hascommas)
					{
						if(col.type === 'float3')
							selitem[field]  = selitem[field].replace(',000','');
						else
							selitem[field]  = selitem[field].replace(',00','');
					}
				}
				if(action == "delete")
				{
					selitem[field] = "";
					if(selitem[field] !== oldvalue)
					{
						if(!isNaN(oldvalue))
						{
							SetEditValue(rowid,field,String(oldvalue));
							if(_changed[rowid] === undefined)
								_changed[rowid] = {};
							_changed[rowid][field] = "changed";
						}
					}
				}else{
					if(selitem[field] !== oldvalue)
					{
						if(isNaN(value))
							SetEditValue(rowid,field,"");
						else
							SetEditValue(rowid,field,String(oldvalue));
						if(_changed[rowid] === undefined)
							_changed[rowid] = {};
						_changed[rowid][field] = "changed";
					}
				}
			}
			
		}
		if(col.type === 'int')
		{
			if(selitem[field] === undefined || selitem[field] === null)
				selitem[field] = "";
			var oldvalue = selitem[field];
			var bulkvalue = parseInt(value);
			if(params[field + 'mappedto'] !== undefined)// && action === "new")
			{
				var mappedto = params[field + 'mappedto'];
				if(selitem[mappedto] !== undefined && selitem[mappedto] !== null)
				{
					var mapped = selitem[mappedto];
//					mapped = mapped.replace(/\D/g,'');
					bulkvalue = parseInt(mapped);
				}
				if(mappedto === "copyfromparent" )
				{
					if(selitem['post_type'] === "revision")
					{
						if(_parentmap[selitem.post_parent] !== undefined)
						{
							bulkvalue = parseInt(_parentmap[selitem.post_parent][field]);
						}else
						{
							return;
						}
					}else
					{
						return;
					}
				
				}
			}
			if(isNaN(bulkvalue))
				return;
			bulkvalue = Number(bulkvalue.toFixed());
			var pricestr = selitem[field];
//			if(params[field + 'mappedto'] !== undefined && action !== "new")
//			{
//				var mappedto = params[field + 'mappedto'];
//				if(selitem[mappedto] !== undefined && selitem[mappedto] !== null)
//				{
//					pricestr = selitem[mappedto];
//				}else
//				{
//					return;
//				}
//			}
			var price = parseInt(pricestr);
			var bsetedit = false;
			if(!isNaN(bulkvalue))
			{
				switch(action)
				{
					case "new":
					{
//						if(bulkvalue == 0)
//						{
//							selitem[field] = "";
//						}else
						{
							selitem[field] = bulkvalue;
						}
					}break;
					case "incvalue":
					{
						if(!isNaN(price))
						{
							selitem[field] =  (Number(price) + bulkvalue).toFixed();
							bsetedit = true;
						}
					}break;
					case "incpercent":
					{
						if(!isNaN(price))
						{
							var percent = (bulkvalue * 0.01) * parseInt(price);
							selitem[field] =  (Number(price) + parseInt(percent)).toFixed();
							bsetedit = true;
						}
						
					}break;
					case "decvalue":
					{
						if(!isNaN(price))
						{
							if((Number(price) - bulkvalue) >= 0)
							{
								selitem[field] =  (Number(price) - bulkvalue).toFixed();
								bsetedit = true;
							}else{
								selitem[field] =  "0";
								bsetedit = true;
							}
						}
					}break;
					case "decpercent":
					{
						if(!isNaN(price))
						{
							var percent = (bulkvalue * 0.01) * parseInt(price);
							selitem[field] =  (parseInt(price) - parseInt(percent)).toFixed();
							bsetedit = true;
						}
					}break;
					case "decvaluereg":
					{//sale price only
						{//only without sale price set
							if(params.isskipsale !== undefined)
							{
								if(params.isskipsale)
								{
									if(!isNaN(price) || price == 0)
									{
										break;
									}
								}
							}
							var regprice = parseInt(selitem._regular_price);
							if(!isNaN(regprice))
							{
								selitem._sale_price =   (Number(regprice) - bulkvalue).toFixed();
								bsetedit = true;
							}
						}
					}break;
					case "decpercentreg":
					{
						{
							if(params.isskipsale !== undefined)
							{
								if(params.isskipsale)
								{
									if(!isNaN(price) || price == 0)
									{
										break;
									}
								}
							}
							var regprice = parseInt(selitem._regular_price);
							if(!isNaN(regprice))
							{
								var percent = (bulkvalue * 0.01) * parseInt(regprice);
								selitem._sale_price =  (parseInt(regprice) - parseInt(percent)).toFixed();
								bsetedit = true;
							}
						}
					}break;
					default:break;
				}
//				if(selitem[field]  !== undefined)
//				{
//					selitem[field]  = String(selitem[field]);
//					if(col.type === 'float3')
//						selitem[field]  = selitem[field].replace('.000','');
//					else
//						selitem[field]  = selitem[field].replace('.00','');
//				}
				if(action == "delete")
				{
					selitem[field] = "";
					if(selitem[field] !== oldvalue)
					{
						if(!isNaN(oldvalue))
						{
							SetEditValue(rowid,field,String(oldvalue));
							if(_changed[rowid] === undefined)
								_changed[rowid] = {};
							_changed[rowid][field] = "changed";
						}
					}
				}else{
					if(selitem[field] !== oldvalue)
					{
						if(isNaN(value))
							SetEditValue(rowid,field,"");
						else
							SetEditValue(rowid,field,String(oldvalue));
						if(_changed[rowid] === undefined)
							_changed[rowid] = {};
						_changed[rowid][field] = "changed";
					}
				}
			}
			
		}
	}
	
	function HandleBulkUpdate(params)
	{
		_parentmap = {};
		for(var ir=0; ir < _data.length; ir++)
		{
			if(_data[ir] === undefined) continue;
			var selitem = _data[ir];
			if(selitem.post_type === "product" && selitem.product_type === "variable")
			{
				_parentmap[selitem.ID] = selitem;
			}
		}
		if(_reserved._skuseries !== undefined)
		{
			delete _reserved._skuseries;
		}
		if(_reserved._skuseriespadsize !== undefined)
		{
			delete _reserved._skuseriespadsize;
		}
		
		
		var selectedRows = _grid.getSelectedRows();
		for(var irow=0; irow < selectedRows.length; irow++)
		{
			var rowid = selectedRows[irow];
			if(rowid === undefined) continue;
			if(_data[rowid] === undefined) continue;
			var selitem = _data[rowid];
			var current = {};
			var bupdate = false;
			for (var key in params) {
			  if (params.hasOwnProperty(key)) {
			     if(_mapfield[key] !== undefined)
				 {//key e actions
//				 	BulkUpdateField(field,selitem,value,rowid,action)
				 	if(params[key + 'value'] !== undefined)
				 	    BulkUpdateField(key,selitem,params[key + 'value'],rowid,params[key],params);
					else
						BulkUpdateField(key,selitem,"",rowid,params[key],params);
				 }
			  }
			}
		}
		
		try{
				_grid.removeCellCssStyles("changed");
				_grid.setCellCssStyles("changed", _changed);
			} catch (err) {
				;
			}
		if(params['product_type'] !== undefined)
			RefreshGroupedItems();
		_shouldhandle = false;
		_grid.resetActiveCell();
		_grid.invalidate();
		_shouldhandle = true;		
	}

	
	function SetEditValue(row,cell,value,ifdelete)
	{
		ifdelete = typeof ifdelete !== 'undefined' ? ifdelete : false;
		var Row = {};
		if(_arrEdited[row] === undefined)
		{
			_arrEdited[row] = Row;
		}else
		{
			Row = _arrEdited[row];
		}
		if(Row[cell] === undefined)
		{
			Row[cell] = value;
		}
		if(ifdelete)
		{
			delete Row[cell];
			if(cell == '_downloadable_files')
			{
				if(Row['_downloadable_files_val'] !== undefined)
					delete Row['_downloadable_files_val'];
			}
			var coldef = _idmap[_mapfield[cell]];
			if(coldef === undefined) return;
			if(coldef.type === "customtaxh")
			{
				if(Row[cell + '_ids'] !== undefined)
					delete Row[cell + '_ids'];
				if(true === coldef.attribute)
				{
					if(Row[cell + '_visiblefp'] !== undefined)
						delete Row[cell + '_visiblefp'];
				}
			}
			row = row.toString();
			if(_changed[row] !== undefined)
			{
				if(_changed[row][cell] !== undefined)
				{
					var cellv = _changed[row];
					if(cellv[cell] !== undefined)
					{
						delete cellv[cell];
					}
					if(cell === '_downloadable_files')
					{
						if(cellv['_downloadable_files_val'] !== undefined)
						{
							delete cellv['_downloadable_files_val'];
						}
					}
					if(cellv[cell + '_ids'] !== undefined)
					{
						delete cellv[cell + '_ids'];
					}
					if(cellv[cell + '_visiblefp'] !== undefined)
					{
						delete cellv[cell + '_visiblefp'];
					}
				}
			}
			try{
				_grid.removeCellCssStyles("changed");
				_grid.setCellCssStyles("changed", _changed);
			} catch (err) {
				;
			}
		}
	}
	
	function GetEditValue(row,cell,current)
	{
		var Row = [];
		if(_arrEdited[row] === undefined)
		{
			return false;
		}else
		{
			Row = _arrEdited[row];
		}
		if(Row[cell] === undefined)
		{
			return false;
		}
		current.value = Row[cell];
		return true;
	}
	
  
	_grid = new Slick.Grid("#myGrid", _data, gridColumns, gridOptions);
//	var columnpicker = new Slick.Controls.ColumnPicker(columns, _grid, options);
    _grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
    _grid.registerPlugin(checkboxSelector);
  
 	_grid.onSort.subscribe(function (e, args) {
		for(var ir=0; ir < _arrEdited.length; ir++)
		{
			var row = _arrEdited[ir];
			if(row === undefined) continue;
			for (var key in row) 
			{
			  if (row.hasOwnProperty(key)) 
			  {
			     if(key !== undefined)
				 	return;
			  }
			}
		}
		_grid.setSelectedRows([]);
		
        var field = args.sortCol.field;
		var col = _idmap[_mapfield[args.sortCol.field]];
		if(col === undefined) return;
		var isnumber = false;
		if(col.type !== undefined)
		{
			if(col.type === 'int' || col.type === 'float2' || col.type === 'float3')
				isnumber = true;
		}
		 _data.sort(function (dataRow1, dataRow2) 
		 {
		 	if(field === 'menu_order')
		 	{
				cols = [];
			 	cols[1] = {field:field};
			 	cols[0] = {field:"sortid"};
		        for (var i = 0, l = cols.length; i < l; i++) {
		          var field1 = cols[i].field;
		          var sign = args.sortAsc ? 1 : -1;
		          var value1 = dataRow1[field1], value2 = dataRow2[field1];
		         
				  	if(isnumber || i === 0)
					{
						if(value1 === undefined)
							value1 = 0;
						if(value2 === undefined)
							value2 = 0;
						value1 = parseFloat(value1);
						value2 = parseFloat(value2);
						if(isNaN(value1))
							value1 = 0;
						if(isNaN(value2))
							value2 = 0;
					}
				  
		          var result1 = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
		          if (result1 != 0) {
		            return result1;
		          }
		        }
		        return 0;
			}else
			{
				var av = dataRow1[field];
				var bv = dataRow2[field];
				if(isnumber)
				{
					if(av === undefined)
						av = 0;
					if(bv === undefined)
						bv = 0;
					av = parseFloat(av);
					bv = parseFloat(bv);
					if(isNaN(av))
						av = 0;
					if(isNaN(bv))
						bv = 0;
				}else
				{
					if(av === undefined)
						av = "";
					if(bv === undefined)
						bv = "";
				}
	            var result = 
	                av > bv ? 1 :
	                av < bv ? -1 :
	                0;
	            return args.sortAsc ? result : -result;
			}
		 	
      	});
//        _data.sort(function(a, b){
//			var av = a[field];
//			var bv = b[field];
//			if(isnumber)
//			{
//				if(av === undefined)
//					av = 0;
//				if(bv === undefined)
//					bv = 0;
//				av = parseFloat(av);
//				bv = parseFloat(bv);
//				if(isNaN(av))
//					av = 0;
//				if(isNaN(bv))
//					bv = 0;
//			}else
//			{
//				if(av === undefined)
//					av = "";
//				if(bv === undefined)
//					bv = "";
//			}
//            var result = 0;
//             result =  av > bv ? 1 :
//                av < bv ? -1 :
//                0;
//            var sorta = a['sortid'];
//			var sortb = b['sortid'];
//			if(sortb !== undefined)
//			{
//				if(sortb !== _reserved.lastsortid)
//				{
//					_reserved.lastsortid = sortb;
//					 return 0;
//				}
//			}else
//			{
//				if(sorta !== undefined)
//					return 0;
//			}
//           

//            return args.sortAsc ? result : -result;
//        });
	    _grid.invalidateAllRows();
	    _grid.render();
	 });
	 
	 function RefreshSelected()
	 {
	 	var selectedRows = _grid.getSelectedRows().length;
		var all = _grid.getData().length;
		var seltext = ' ' + selectedRows + ' of ' + all;
		$('#bulkeditinfo').text(seltext);
	 }
	 
	_grid.onSelectedRowsChanged.subscribe(function(e,args){
    	RefreshSelected();
	});
	
	_grid.onBeforeEditCell.subscribe(function(e,args){
		if(_data[args.row] != undefined)
		{
			var selitem = _data[args.row];
			var item = _idmap[_mapfield[args.column.id]];
			
			if(selitem.post_type == 'revision' && item.field === '_thumbnail_id')
			{
				e.stopPropagation();
				return false;
			}
    	
			if(item.scope !== undefined && !_disablesafety)
			{
				if(item.scope == SCOPE.PRODALL)
				{
					if(selitem.post_type == 'revision')
					{
						e.stopPropagation();
						return false;
					}
				}
				if(item.scope === SCOPE.VAR)
				{
					if(selitem.post_type !== 'revision')
					{
						e.stopPropagation();
						return false;
					}
				}
				if(item.scope == SCOPE.PRODSVAR)
				{
					if(selitem.post_type === "product")
					{
						if(selitem.haschildren !== undefined || selitem.product_type === "variable")
						{
							e.stopPropagation();
							return false;
						}
					}
				}
				if(item.scope == SCOPE.PRODSWITHVARS)
				{
					if(selitem.post_type === "product")
					{
						if(selitem.haschildren === undefined && selitem.product_type !== "variable")
						{
							e.stopPropagation();
							return false;
						}
					}
					if(selitem.post_type == 'revision')
					{
						e.stopPropagation();
						return false;
					}
				}
				if(item.scope == SCOPE.NONE)
				{
					e.stopPropagation();
					return false;
				}
			}
			if(item.checkbox !== undefined)
			{
				if(item.field === '_stock_status')
				{
					if(selitem[item.field] === undefined)
						selitem[item.field] = "outofstock";
				}else
				{
					
					if(selitem[item.field] === undefined)
						selitem[item.field] = "no";
				}
			}
//			if(selitem[item.field] === undefined)
//				selitem[item.field] = "";
			if(selitem.post_type == 'revision')
			{
				W3Ex._w3ex_active_parent = {};
				if(W3Ex._global_settings.inselectionmode === true)
				{
					for(var ir=0; ir < _dataAllTemp.length; ir++)
					{
						if(_dataAllTemp[ir] === undefined) continue;
						var curitem = _dataAllTemp[ir];
						
						if(curitem.ID == selitem.post_parent)
						{
							W3Ex._w3ex_active_parent = curitem;
							break;
						}
					}
				}
				else
				{
					for(var ir=0; ir < _data.length; ir++)
					{
						if(_data[ir] === undefined) continue;
						var curitem = _data[ir];
						
						if(curitem.ID == selitem.post_parent)
						{
							W3Ex._w3ex_active_parent = curitem;
							break;
						}
					}
				}
				
			}
			for (var key in _currentItem) {
			  if (_currentItem.hasOwnProperty(key)) {
			    delete _currentItem[key];
			  }
			}
			
			for (var key in selitem) {
			  if (selitem.hasOwnProperty(key)) {
			     _currentItem[key] = selitem[key];
			  }
			}
		}
	});
	
	 _grid.onMouseEnter.subscribe(function(e, args) {
	 		
	 		$('#showvarslinkpopup').remove();
            var cell = _grid.getCellFromEvent(e);
            var i=0;
            var node = _grid.getCellNode(cell.row,cell.cell);
            var box = _grid.getCellNodeBox(cell.row,cell.cell);
             var $vartitle = $(node).find('div.showvarslink');
            if($vartitle.length > 0)
            {
				   var $container = $("body");
	 
	 
      				var $wrapper = $('<DIV id="showvarslinkpopup" style="z-index:10000;position:absolute;">(<a href="javascript:;" class="grouped-items" onclick="window.W3Ex.abemodule.handleSelVars('+$vartitle.attr('data-id')+');">sel vars</a>)</div>')
          .appendTo($container);
	 
         	 
         	  var position = $vartitle.offset();
         	  var counter = 0;
         	  var dim = "110px";
         	  if($vartitle.length > 1)
         	  	dim = "80px";
         	 
         	  
//         	  $image.css('width','110px');
//         	  $image.css('height','110px');
//         	  $wrapper.css('top',box.top);
//         	  $wrapper.css('left',box.left);
			
				position.left+=$(node).width() - $wrapper.width();
				 if(W3Ex._isrtlenabled === true)
				 	position.left-=$(node).width() - $wrapper.width();
				 	
//				position.top+= $img.height()/2 - $wrapper.height()/2;
				$wrapper.css(position);
			}
			if(W3Ex._global_settings['showthumbnails'] !== true)
	 			return;
            var $img = $(node).find('img.imageover');
            if($img.length > 0)
            {
				   var $container = $("body");
	 
	 
      				var $wrapper = $('<DIV id="imagepopup" style="z-index:10000;position:absolute;"/>')
          .appendTo($container);
	 
         	 
         	  var position = $img.offset();
         	  var counter = 0;
         	  var dim = "110px";
         	  if($img.length > 1)
         	  	dim = "80px";
         	  $img.each(function()
         	  {
         	  	   var $image =  $('<img src="" width="'+dim+'" height="'+dim+'">').appendTo($wrapper);
         	   	   $image.attr('src',$(this).attr('src'));
         	   	   counter++;
         	   	   if(counter%3 == 0)
         	   	   {
				   	$('<br/>').appendTo($wrapper);
				   }
         	  	
         	  })
         	  
//         	  $image.css('width','110px');
//         	  $image.css('height','110px');
//         	  $wrapper.css('top',box.top);
//         	  $wrapper.css('left',box.left);
				position.left+=$(node).width();
				position.top+= $img.height()/2 - $wrapper.height()/2;
				$wrapper.css(position);
			}
			
			
            //do whatever
        });

     _grid.onMouseLeave.subscribe(function(e, args) {
//     	   var cell = _grid.getCellFromEvent(e);
//            var i=0;
//            var node = _grid.getCellNode(cell.row,cell.cell);
//            var box = _grid.getCellNodeBox(cell.row,cell.cell);
//            var $img = $(node).find('.imageover');
//            if($img.length > 0)
            {
            	$('#imagepopup').remove();
            	
            }
        });
        
	if(W3Ex._w3esetting_table_height !== undefined)
	{
		var height = W3Ex._w3esetting_table_height;
		height = parseInt(height);
		if(!isNaN(height) && height > 100 && height < 2500)
		{
			height = height.toString();
			$('#myGrid').css('height',height + 'px');
			_grid.resizeCanvas();
		}
	}

	
	function HandleValueUpdate(what,whatproperty,acell,object,isvisible)
	{//when value has changed
		object = typeof object !== 'undefined' ? object : _currentItem;
		isvisible = typeof isvisible !== 'undefined' ? isvisible : false;
//		console.log("pass");
		var sellitem = _data[acell.row];
		var coldef = _idmap[_mapfield[whatproperty]];
		var current = {};
		current.value = "";
		if(isvisible)
		{
			if(GetEditValue(acell.row,whatproperty,current))
			{
				SetEditValue(acell.row,whatproperty,sellitem[whatproperty],true);
				_shouldinvalidate = true;
				return;
			}
			if(object[whatproperty] !== undefined)
				SetEditValue(acell.row,whatproperty,object[whatproperty]);
			return;
		}
		
		if(coldef.type !== "customtaxh")
		{
			if(whatproperty === "_custom_attributes")
			{
				current.value = [];
				if(GetEditValue(acell.row,whatproperty,current))
				{
					if(current.value instanceof Array !== true)
					{
						current.value = [];
					}
					if(what instanceof Array !== true)
					{
						what = [];
					}
					var changed = false;
					var arrcustselitem = current.value;
					var arrcust = what;
					if(arrcustselitem.length === arrcust.length)
					{
						for(var i = 0; i < arrcust.length; i++)
						{
							var custitem = arrcust[i];
							var hasit = false;
							var curitem = {};
							for(var j = 0; j < arrcustselitem.length; j++)
							{
								if(arrcustselitem[j].name === custitem.name)
								{
									curitem = arrcustselitem[j];
									hasit = true;
									break;
								}
							}
							if(!hasit)
							{
								changed = true;
								break;
							}
							
							if(curitem.value !== custitem.value)
							{
								changed = true;
								break;
							}
							if(curitem.is_visible !== custitem.is_visible)
							{
								changed = true;
								break;
							}
							if(sellitem.product_type === "variable")
							{
								if(curitem.is_variation !== custitem.is_variation)
								{
									changed = true;
									break;
								}
							}
						}
						if(!changed)
						{
							SetEditValue(acell.row,whatproperty,current.value,true);
							_shouldinvalidate = true;
							return;
						}	
					}
					
//					if(current.value === what)
//					{//returned to original
//						SetEditValue(acell.row,whatproperty,current.value,true);
//						_shouldinvalidate = true;
//						return;
//					}
				}
			}else
			{
				if(GetEditValue(acell.row,whatproperty,current))
				{
					if(current.value === what)
					{//returned to original
						SetEditValue(acell.row,whatproperty,current.value,true);
						_shouldinvalidate = true;
						return;
					}
				}
			}
			
		}else
		{
			var catsids = sellitem[whatproperty + '_ids'];
			var curcatsids = "";
			var current = {};
			current.value = "";
			if(GetEditValue(acell.row,whatproperty + '_ids',current))
			{
				curcatsids = current.value;
				if(catsids === undefined)
				catsids = "";
				if(curcatsids === undefined)
					curcatsids = "";
				catsids = catsids.split(',');
				curcatsids = curcatsids.split(',');
				
				if (catsids instanceof Array && curcatsids instanceof Array) 
				{
					if(catsids.length == curcatsids.length)
					{
						var breturn = true;
						for(var i=0; i < catsids.length; i++)
						{
							if(curcatsids.indexOf(catsids[i]) === -1)
							{
							   breturn = false;
							   break;
							}
						}
						if(breturn)
						{//when reverted to original value
							SetEditValue(acell.row,coldef.field,sellitem[coldef.field],true);
							_shouldinvalidate = true;
							return;
						}
					}
				}
			}
//			if(true === coldef.attribute)
//			{
//				current.value = "";
//				if(GetEditValue(acell.row,whatproperty + '_visiblefp',current))
//				{
//					SetEditValue(acell.row,coldef.field,sellitem[coldef.field],true);
//					_shouldinvalidate = true;
//					return;
//				}
//			}
			
		}
		
		if(object[whatproperty] === undefined)
		{
			object[whatproperty] = "";
		}
		SetEditValue(acell.row,whatproperty,object[whatproperty]);
		if(whatproperty == "_downloadable_files")
		{
			if(object[whatproperty+"_val"] === undefined)
			{
				object[whatproperty+"_val"] = "";
			}
			SetEditValue(acell.row,"_downloadable_files_val",object[whatproperty+"_val"]);
		}
		
		if(coldef.type === "customtaxh")
		{
			if(object[whatproperty + "_ids"] === undefined)
			{
				object[whatproperty + "_ids"] = "";
			}
			SetEditValue(acell.row,whatproperty + "_ids",object[whatproperty + "_ids"]);
//			if(true === coldef.attribute)
//			{
//				if(object[whatproperty + "_visiblefp"] !== undefined)
//					SetEditValue(acell.row,whatproperty + "_visiblefp",object[whatproperty + "_visiblefp"]);
//			}
		}
		
		if(_changed[acell.row] === undefined)
			_changed[acell.row] = {};
		_changed[acell.row][whatproperty] = "changed";
		try{
			_grid.removeCellCssStyles("changed");
			_grid.setCellCssStyles("changed", _changed);
		} catch (err) {
			;
		}
		return;
	}
	
	function HandleSingleCellUpdate(acell,column)
	{
		var sellitem = _data[acell.row];
		if(!isGood(sellitem))
			return;
		var item = _idmap[_mapfield[column.id]];
		if(!isGood(item))
			return;
		if(item.image !== undefined || item.image_gallery !== undefined)
					return;
		var changedattr = false;
		if(true === item.attribute && sellitem.post_type !== 'revision')
		{
			if(_currentItem[item.field + '_visiblefp'] === undefined)
			{
				 _currentItem[item.field + '_visiblefp'] = 0;
			}
			if(sellitem[item.field + '_visiblefp'] !== _currentItem[item.field + '_visiblefp'])
				changedattr = true;
		}
		if(sellitem[item.field] !== undefined)
		{
			if(item.field === '_custom_attributes')
			{
				if(_currentItem[item.field] === undefined)
					_currentItem[item.field] = [];
				var changed = false;
				var arrcustselitem = sellitem._custom_attributes;
				var arrcust = _currentItem[item.field];
				if(arrcustselitem.length !== arrcust.length)
				{
					HandleValueUpdate(sellitem[item.field],item.field,acell);
					return;
				}
				for(var i = 0; i < arrcust.length; i++)
				{
					var custitem = arrcust[i];
					var hasit = false;
					var curitem = {};
					for(var j = 0; j < arrcustselitem.length; j++)
					{
						if(arrcustselitem[j].name === custitem.name)
						{
							curitem = arrcustselitem[j];
							hasit = true;
							break;
						}
					}
					if(!hasit)
					{
						changed = true;
						break;
					}
					
					if(curitem.value !== custitem.value)
					{
						changed = true;
						break;
					}
					if(curitem.is_visible !== custitem.is_visible)
					{
						changed = true;
						break;
					}
					if(sellitem.product_type === "variable")
					{
						if(curitem.is_variation !== custitem.is_variation)
						{
							changed = true;
							break;
						}
					}
				}
				if(changed)
				{
					HandleValueUpdate(sellitem[item.field],item.field,acell);
				}			
				return;
			}
			if(_currentItem[item.field] === undefined)
			{
				_currentItem[item.field] = "";
//				if(item.checkbox !== undefined)
//				{
//					if(sellitem[item.field] === "no")
//						return;
//				}
			}
			
			
			if(sellitem[item.field] !== _currentItem[item.field] || changedattr)
			{
				if(item.type !== undefined)
				{
					if(item.type === 'float2' || item.type === 'float3' || item.type === 'int')
					{
						var newval = sellitem[item.field];
						if(isNaN(newval))
						{//allow only numbers
							sellitem[item.field] = _currentItem[item.field];
							return;
						}
						if(item.type === 'int')
						{
							if(sellitem[item.field] !== "")
							{
								sellitem[item.field] = parseInt(sellitem[item.field]);
								if(isNaN(sellitem[item.field]))
								{
									sellitem[item.field] = "";
								}
							}
								
						}
//						if(newval < 0)
//						{
//							sellitem[item.field] = _currentItem[item.field];
//							return;
//						}
					}
				}
				
				HandleValueUpdate(sellitem[item.field],item.field,acell);
				if(changedattr)
				{
//					console.log('pass');
					HandleValueUpdate(sellitem[item.field+ '_visiblefp'],(item.field+ '_visiblefp'),acell,_currentItem,true);
				}
			}
		}
	}
	
	function RevertToOriginalTaxonomy(sellitem,acell,item)
	{
		var current = {};
		current.value = "";
		var catsids = sellitem[item.field + '_ids'];
		if(GetEditValue(acell.row,item.field + '_ids',current))
		{
			var curcatsids = current.value;
			if(catsids === undefined)
			catsids = "";
			if(curcatsids === undefined)
				curcatsids = "";
			catsids = catsids.split(',');
			curcatsids = curcatsids.split(',');
			
			if (catsids instanceof Array && curcatsids instanceof Array) 
			{
				if(catsids.length == curcatsids.length)
				{
					var breturn = true;
					for(var i=0; i < catsids.length; i++)
					{
						if(curcatsids.indexOf(catsids[i]) === -1)
						{
						   breturn = false;
						   break;
						}
					}
					if(breturn)
					{//when reverted to original value
						SetEditValue(acell.row,item.field,sellitem[item.field],true);
						if(_changed[acell.row.toString()] !== undefined)
						{
							if(_changed[acell.row][item.field] !== undefined)
							{
								var cellv = _changed[acell.row.toString()];
								if(cellv[item.field] !== undefined)
								{
									delete cellv[item.field];
								}
								if(cellv[item.field + '_ids'] !== undefined)
								{
									delete cellv[item.field + '_ids'];
								}
								if(cellv[item.field + '_visiblefp'] !== undefined)
								{
									delete cellv[item.field + '_visiblefp'];
								}
							}
						}
						try{
							_grid.removeCellCssStyles("changed");
							_grid.setCellCssStyles("changed", _changed);
						} catch (err) {
							;
						}
						_shouldinvalidate = true;
						return true;
					}
				}
			}
		}
		if(true === item.attribute)
		{
			current.value = "";
			if(GetEditValue(acell.row,item.field + '_visiblefp',current))
			{
				SetEditValue(acell.row,item.field,sellitem[item.field],true);
				if(_changed[acell.row.toString()] !== undefined)
				{
					if(_changed[acell.row][item.field] !== undefined)
					{
						var cellv = _changed[acell.row.toString()];
						if(cellv[item.field] !== undefined)
						{
							delete cellv[item.field];
						}
						if(cellv[item.field + '_ids'] !== undefined)
						{
							delete cellv[item.field + '_ids'];
						}
						if(cellv[item.field + '_visiblefp'] !== undefined)
						{
							delete cellv[item.field + '_visiblefp'];
						}
					}
				}
				try{
					_grid.removeCellCssStyles("changed");
					_grid.setCellCssStyles("changed", _changed);
				} catch (err) {
					;
				}
				_shouldinvalidate = true;
				return true;
			}
		}
		return false;
	}
	
	_grid.onBeforeCellEditorDestroy.subscribe(function(e,args)
	{
		if(!_shouldhandle) return;
		var acell = _grid.getActiveCell();
		if(acell === null) return;
		var column = _grid.getColumns()[acell.cell];
		if(column == undefined) return;
		var origsellitem = _data[acell.row];
		var item = _idmap[_mapfield[column.id]];
		if(item === undefined) return;
		if(item.field === 'ID')
		{
			origsellitem['ID'] = _currentItem['ID'];
			return;	
		}
		if(item.field === 'post_excerpt' || item.field === 'post_content')
		{
			if(isGood(origsellitem.post_type) && origsellitem.post_type === 'revision')
			{
				origsellitem[item.field] = _currentItem[item.field];
				return;
			}
				
		}
		
//		if(sellitem[item.field] !== undefined)
//		{
//			if(_currentItem[item.field] === undefined)
			
		HandleSingleCellUpdate(acell,column);
		
		var clickedonsel = false;
		if($('#linkededit').is(':checked'))
		{
			var iRow = acell.row;
			var selectedRows = _grid.getSelectedRows();
			if(selectedRows.length > 0)
			{
				for(var irow=0; irow < selectedRows.length; irow++)
				{
					var rowid = selectedRows[irow];
					if(rowid === undefined) continue;
					if(_data[rowid] === undefined) continue;
					if(rowid === iRow)
					{//clicked on selected
						clickedonsel = true;
						break;
					}
				}
			}
		}

		if(!clickedonsel)
		{
			return;
		}
			
		var origsellitem = _data[acell.row];
		var item = _idmap[_mapfield[column.id]];
		
		if(origsellitem[item.field] === _currentItem[item.field])
			return;
		

		var iRow = acell.row;
		var selectedRows = _grid.getSelectedRows();
		var iscustomtaxh = false;
		
		if(selectedRows.length > 0)
		{
			var sellitem = _data[acell.row];
			
			var item = _idmap[_mapfield[column.id]];
			if(item.image !== undefined || item.image_gallery !== undefined)
				return;
			if(sellitem[item.field] === undefined)
				sellitem[item.field] = "";
			{
//					if(_currentItem[item.field] === undefined)
//					{
//						if(sellitem[item.field] === "no")
//							return;
//					}
//					
				{
					var changevalue = origsellitem[item.field];
					var changedids = origsellitem[item.field + '_ids'];
					_shouldinvalidate = true;
					var clickedobject = $.extend(true, {}, sellitem);
					for(var irow=0; irow < selectedRows.length; irow++)
					{
						var rowid = selectedRows[irow];
						if(rowid === undefined) continue;
						if(_data[rowid] === undefined) continue;
						var sellitem = _data[rowid];
						var item = _idmap[_mapfield[column.id]];
						acell.row = rowid;
						if(iRow === rowid)
						{
							continue;
						}
						if(sellitem[item.field] === origsellitem[item.field] )
						{
							if(changedids !== undefined)
							{
								if(sellitem[item.field + '_ids'] === changedids && !changedattr)
									continue;
							}else
								continue;
						}
						if(item.field == "grouped_items") 
						{
							if(sellitem['product_type'] != 'simple' || sellitem['post_type'] == 'revision')
							{
								continue;
							}
							
						}
			
						if(item.scope !== undefined && !_disablesafety)
						{
							if(item.scope == SCOPE.PRODALL)
							{
								if(sellitem.post_type == 'revision')
								{
									continue;
								}
							}
						}
						
					if(item.type !== undefined)
					{
						if(item.type === 'float2' || item.type === 'float3' || item.type === 'int')
						{
							var newval = origsellitem[item.field];
							if(isNaN(newval))
							{
								continue;
							}
//								if(newval < 0)
//								{
//									continue;
//								}
						}else if(item.type === 'customtaxh')
						{
							var catsids = "";
							iscustomtaxh = true;
							if(sellitem[item.field] === undefined)
								sellitem[item.field] = "";
							
							{
								//check visible on product page first
								var breturn = true;
								if(true === item.attribute)
								{
									if(origsellitem[item.field + '_visiblefp'] !== sellitem[item.field + '_visiblefp'])
										breturn = false;
								}
								/////
								var catsids = sellitem[item.field + '_ids'];
								var curcatsids = changedids;
								
								if(catsids === undefined)
									catsids = "";
								if(curcatsids === undefined)
									curcatsids = "";
								catsids = catsids.split(',');
								curcatsids = curcatsids.split(',');
								
								if (catsids instanceof Array && curcatsids instanceof Array) 
								{
									if(catsids.length == curcatsids.length)
									{
										
										for(var i=0; i < catsids.length; i++)
										{
											if(curcatsids.indexOf(catsids[i]) === -1)
											{
											   breturn = false;
											   break;
											}
										}
										if(breturn)
										{
											continue;
										}
									}
								}
							}
							var insertval = "";
							var temparr = [];
							if(true === item.attribute && sellitem['post_type'] == 'revision')
							{
								 if(curcatsids instanceof Array)
								 {
								 	temparr = $.extend(true, [], curcatsids);
								 	if(temparr.length > 1)
									{
										temparr.splice(1,temparr.length - 1);
									}
								 }
								 if(changedids.indexOf(',') !== -1)
								 {
								 	insertval = changedids.substring(0,changedids.indexOf(","));
								 }
								if(RevertToOriginalTaxonomy(origsellitem,acell,item))
								{
									sellitem[item.field + '_ids'] = temparr.join();
									if(sellitem[item.field + '_ids'] === "")
										sellitem[item.field] = "";
									else
										sellitem[item.field] = insertval;
									insertval = changevalue;
									 if(changevalue.indexOf(',') !== -1)
									 {
									 	insertval = changevalue.substring(0,changevalue.indexOf(","));
									 }
									sellitem[item.field] = insertval;
									continue;
								}
									
								SetEditValue(rowid,item.field,sellitem[item.field]);
								if(sellitem[item.field + '_ids'] === undefined)
									sellitem[item.field + '_ids'] = "";
								SetEditValue(rowid,item.field + '_ids',sellitem[item.field + '_ids']);
								sellitem[item.field + '_ids'] = temparr.join();
								if(sellitem[item.field + '_ids'] === "")
									sellitem[item.field] = "";
								else
									sellitem[item.field] = insertval;
								if(_changed[rowid] === undefined)
									_changed[rowid] = {};
								_changed[rowid][item.field] = "changed";
								insertval = changevalue;
								 if(changevalue.indexOf(',') !== -1)
								 {
								 	insertval = changevalue.substring(0,changevalue.indexOf(","));
								 }
								sellitem[item.field] = insertval;
								continue;
							}else
							{
								if(RevertToOriginalTaxonomy(origsellitem,acell,item))
								{
									sellitem[item.field + '_ids'] = curcatsids.join();
									if(sellitem[item.field + '_ids'] === "")
										sellitem[item.field] = "";
									else
										sellitem[item.field] = changedids;
									sellitem[item.field] = changevalue;
									if(origsellitem[item.field + '_visiblefp'] !== undefined)
										sellitem[item.field + '_visiblefp'] = origsellitem[item.field + '_visiblefp'];
									continue;
								}
								SetEditValue(rowid,item.field,sellitem[item.field]);
								if(sellitem[item.field + '_ids'] === undefined)
									sellitem[item.field + '_ids'] = "";
								SetEditValue(rowid,item.field + '_ids',sellitem[item.field + '_ids']);
								sellitem[item.field + '_ids'] = curcatsids.join();
								if(sellitem[item.field + '_visiblefp'] !== undefined)
									SetEditValue(rowid,item.field + '_visiblefp',sellitem[item.field + '_visiblefp']);
								if(origsellitem[item.field + '_visiblefp'] !== undefined)
										sellitem[item.field + '_visiblefp'] = origsellitem[item.field + '_visiblefp'];
								if(sellitem[item.field + '_ids'] === "")
									sellitem[item.field] = "";
								else
									sellitem[item.field] = changedids;
								if(_changed[rowid] === undefined)
									_changed[rowid] = {};
								_changed[rowid][item.field] = "changed";
							}
							sellitem[item.field] = changevalue;
							continue;
						}
					}
					//handle value update for normal fields
				
					
					HandleValueUpdate(changevalue,item.field,acell,sellitem);
					sellitem[item.field] = changevalue;
					if(changedids !== undefined)
						sellitem[item.field + '_ids'] = changedids;
					if(item.field == "_downloadable_files" || item.textarea !== undefined)
					{
						var W3Ex = window.W3Ex || {};
  						W3Ex.invalidateselected = true;
						sellitem[item.field+"_val"] = origsellitem[item.field+"_val"];
					}
				}
			}
				
			}
			if(iscustomtaxh)
			{
				if(_shouldinvalidate)
				{
				     var W3Ex = window.W3Ex || {};
  					 W3Ex.invalidateselected = true;
				}
			}
		}
	});

	_grid.onActiveCellChanged.subscribe(function(e,args){
		if(_shouldinvalidate)
		{
			_grid.invalidate();
		   _shouldinvalidate = false;
		}
	});
	
	$('#showsavetool').mouseover(function(){
		$('#savenote').show();
	})
	
	$('#showsavetool').mouseleave(function(){
		$('#savenote').hide();
	})
	
	$('#showlinked').mouseover(function(){
		$('#linkednote').css('visibility','visible');
	})
	
	$('#showlinked').mouseleave(function(){
		$('#linkednote').css('visibility','hidden');
	})


	$('#revertcell').click(function ()
	{
		var acell = _grid.getActiveCell();
		if(acell === null) return;
		if(_data[acell.row] === undefined) return;
		var selitem = _data[acell.row];
		var current = {};
		current.value = "";
		var column = _grid.getColumns()[acell.cell];
		if(column == undefined) return;
		var bupdategrouped = false;
		if(GetEditValue(acell.row,column.id,current))
		{
//			column
			selitem[column.id] = current.value;
			
			if(column.id === "product_type")
				bupdategrouped = true;
				
			if(column.id == "_downloadable_files")
			{
				var current_val = {};
				current_val.value = "";
				if(GetEditValue(acell.row,'_downloadable_files_val',current_val))
				{
					selitem._downloadable_files_val = current_val.value;
				}
			}
			var coldef = _idmap[_mapfield[column.id]];
			if(coldef !== undefined && coldef.type === "customtaxh")
			{
				var current_val = {};
				current_val.value = "";
				if(GetEditValue(acell.row,column.id + '_ids',current_val))
				{
					selitem[column.id + '_ids'] = current_val.value;
				}
				if(true === coldef.attribute)
				{
					current_val.value = "";
					if(GetEditValue(acell.row,column.id + '_visiblefp',current_val))
					{
						selitem[column.id + '_visiblefp'] = current_val.value;
					}
				}
			}
			SetEditValue(acell.row,column.id,current.value,true);
			if(bupdategrouped)
				RefreshGroupedItems();
			_shouldhandle = false;
			_grid.resetActiveCell();
			_grid.invalidate();
			_shouldhandle = true;
		}
		if(GetEditValue(acell.row,column.id + '_visiblefp',current))
		{
			var coldef = _idmap[_mapfield[column.id]];
			if(coldef.type === "customtaxh")
			{
				var current_val = {};
				current_val.value = "";
				if(true === coldef.attribute)
				{
					current_val.value = "";
					if(GetEditValue(acell.row,column.id + '_visiblefp',current_val))
					{
						selitem[column.id + '_visiblefp'] = current_val.value;
					}
				}
			}
			SetEditValue(acell.row,column.id,current.value,true);
			if(bupdategrouped)
				RefreshGroupedItems();
			_shouldhandle = false;
			_grid.resetActiveCell();
			_grid.invalidate();
			_shouldhandle = true;
		}	
	})

	$('#revertrow').click(function ()
	{
		var acell = _grid.getActiveCell();
		if(acell === null) return;
		if(_data[acell.row] === undefined) return;
		var selitem = _data[acell.row];
		var current = {};
		var columns = _grid.getColumns();//[acell.cell];
		var bupdategrouped = false;
		for(var i=0; i <= columns.length; i++)
		{
			var column = columns[i];
			if(column === undefined) continue;
			if(GetEditValue(acell.row,column.id,current))
			{
				selitem[column.id] = current.value;
				
				if(column.id === "product_type")
					bupdategrouped = true;
						
				if(column.id == "_downloadable_files")
				{
					var current_val = {};
					current_val.value = "";
					if(GetEditValue(acell.row,'_downloadable_files_val',current_val))
					{
						selitem._downloadable_files_val = current_val.value;
					}
				}
				var coldef = _idmap[_mapfield[column.id]];
				if(coldef.type === "customtaxh")
				{
					var current_val = {};
					current_val.value = "";
					if(GetEditValue(acell.row,column.id + '_ids',current_val))
					{
						selitem[column.id + '_ids'] = current_val.value;
					}
					if(true === coldef.attribute)
					{
						current_val.value = "";
						if(GetEditValue(acell.row,column.id + '_visiblefp',current_val))
						{
							selitem[column.id + '_visiblefp'] = current_val.value;
						}
					}
				}
				SetEditValue(acell.row,column.id,current.value,true);
			}
			if(GetEditValue(acell.row,column.id + '_visiblefp',current))
			{
				var coldef = _idmap[_mapfield[column.id]];
				if(coldef.type === "customtaxh")
				{
					var current_val = {};
					current_val.value = "";
					if(true === coldef.attribute)
					{
						current_val.value = "";
						if(GetEditValue(acell.row,column.id + '_visiblefp',current_val))
						{
							selitem[column.id + '_visiblefp'] = current_val.value;
						}
					}
				}
				SetEditValue(acell.row,column.id,current.value,true);
			}
		}
		
		try{
			_grid.removeCellCssStyles("changed");
			_grid.setCellCssStyles("changed", _changed);
		} catch (err) {
			;
		}
		if(bupdategrouped)
			RefreshGroupedItems();
		_shouldhandle = false;
		_grid.resetActiveCell();
		_grid.invalidate();
		_shouldhandle = true;
	})

	$('#revertselected').click(function ()
	{
		var selectedRows = _grid.getSelectedRows();
		var bupdategrouped = false;
		var columns = _grid.getColumns();
		for(var irow=0; irow < selectedRows.length; irow++)
		{
			var rowid = selectedRows[irow];
			if(rowid === undefined) continue;
			if(_data[rowid] === undefined) continue;
			var selitem = _data[rowid];
			var current = {};
			for(var i=0; i <= columns.length; i++)
			{
				var column = columns[i];
				if(column === undefined) continue;
				if(GetEditValue(rowid,column.id,current))
				{
					selitem[column.id] = current.value;
					if(column.id === "product_type")
						bupdategrouped = true;
						
					if(column.id == "_downloadable_files")
					{
						var current_val = {};
						current_val.value = "";
						if(GetEditValue(rowid,'_downloadable_files_val',current_val))
						{
							selitem._downloadable_files_val = current_val.value;
						}
					}
					var coldef = _idmap[_mapfield[column.id]];
					if(coldef.type === "customtaxh")
					{
						var current_val = {};
						current_val.value = "";
						if(GetEditValue(rowid,column.id + '_ids',current_val))
						{
							selitem[column.id + '_ids'] = current_val.value;
						}
						if(true === coldef.attribute)
						{
							current_val.value = "";
							if(GetEditValue(rowid,column.id + '_visiblefp',current_val))
							{
								selitem[column.id + '_visiblefp'] = current_val.value;
							}
						}
					}
					SetEditValue(rowid,column.id,current.value,true);
				}
				if(GetEditValue(rowid,column.id + '_visiblefp',current))
				{
					var coldef = _idmap[_mapfield[column.id]];
					if(coldef.type === "customtaxh")
					{
						var current_val = {};
						current_val.value = "";
						if(true === coldef.attribute)
						{
							current_val.value = "";
							if(GetEditValue(rowid,column.id + '_visiblefp',current_val))
							{
								selitem[column.id + '_visiblefp'] = current_val.value;
							}
						}
					}
					SetEditValue(rowid,column.id,current.value,true);
				}
			}
			
			try{
				_grid.removeCellCssStyles("changed");
				_grid.setCellCssStyles("changed", _changed);
			} catch (err) {
				;
			}
		}
		if(bupdategrouped)
			RefreshGroupedItems();
		_shouldhandle = false;
		_grid.resetActiveCell();
		_grid.invalidate();
		_shouldhandle = true;
	})

	$('#revertall').click(function ()
	{
		var bupdategrouped = false;
		var columns = _grid.getColumns();
		for(var rowid=0; rowid < _data.length; rowid++)
		{
			if(_data[rowid] === undefined) continue;
			var selitem = _data[rowid];
			var current = {};
			
			for(var i=0; i <= columns.length; i++)
			{
				var column = columns[i];
				if(column === undefined) continue;
				if(GetEditValue(rowid,column.id,current))
				{
					selitem[column.id] = current.value;
					if(column.id === "product_type")
						bupdategrouped = true;
						
					if(column.id == "_downloadable_files")
					{
						var current_val = {};
						current_val.value = "";
						if(GetEditValue(rowid,'_downloadable_files_val',current_val))
						{
							selitem._downloadable_files_val = current_val.value;
						}
					}
					var coldef = _idmap[_mapfield[column.id]];
					if(coldef.type === "customtaxh")
					{
						var current_val = {};
						current_val.value = "";
						if(GetEditValue(rowid,column.id + '_ids',current_val))
						{
							selitem[column.id + '_ids'] = current_val.value;
						}
						if(true === coldef.attribute)
						{
							current_val.value = "";
							if(GetEditValue(rowid,column.id + '_visiblefp',current_val))
							{
								selitem[column.id + '_visiblefp'] = current_val.value;
							}
						}
					}
					SetEditValue(rowid,column.id,current.value,true);
				}
				if(GetEditValue(rowid,column.id + '_visiblefp',current))
				{
					var coldef = _idmap[_mapfield[column.id]];
					if(coldef.type === "customtaxh")
					{
						var current_val = {};
						current_val.value = "";
						if(true === coldef.attribute)
						{
							current_val.value = "";
							if(GetEditValue(rowid,column.id + '_visiblefp',current_val))
							{
								selitem[column.id + '_visiblefp'] = current_val.value;
							}
						}
					}
					SetEditValue(rowid,column.id,current.value,true);
				}
			}
			
			try{
				_grid.removeCellCssStyles("changed");
				_grid.setCellCssStyles("changed", _changed);
			} catch (err) {
				;
			}
		}
		if(bupdategrouped)
			RefreshGroupedItems();
		_shouldhandle = false;
		_grid.resetActiveCell();
		_grid.invalidate();
		_shouldhandle = true;
	})
	
	$('#collapsefilters').click(function()
	{
		if($(this).attr('data-state') === "collapse")
		{
			$('#tablesearchfilters').css('display','none');
			$('#searchfilters').css('display','none');
			$(this).text(W3Ex._translate_strings["trans_expand_filters"]);
			$(this).attr('data-state','expand');
		}else
		{
//			if($('#tablesearchfilters').css('max-height') === "")
				$('#tablesearchfilters').css('display','');
				$('#searchfilters').css('display','');
//			else
//				$('#tablesearchfilters').css('display','block');
			$(this).text(W3Ex._translate_strings["trans_collapse_filters"]);
			$(this).attr('data-state','collapse');
		}
	});
///////////////////// restore filter state
	if(W3Ex._global_settings["filterstate"] === true)
	{
		$('#tablesearchfilters').css('display','none');
		$('#searchfilters').css('display','none');
		$('#collapsefilters').text(W3Ex._translate_strings["trans_expand_filters"]);
		$('#collapsefilters').attr('data-state','expand');
	}
///////////////////////////////////			
			
//	trans_collapse_filters"] = "'.str_replace('"','\"',$arrTranslated['trans_collapse_filters']).'";'; echo PHP_EOL;
//			echo 'W3Ex._translate_strings["trans_expand_filters
	
	$('#savechanges').click(function ()
	{
		Slick.GlobalEditorLock.commitCurrentEdit()
		var _arr = {};
		for(var ir=0; ir < _arrEdited.length; ir++)
		{
			var row = _arrEdited[ir];
			if(row === undefined) continue;
			var bcon = false;
			for (var key in row) 
			{
			  if (row.hasOwnProperty(key)) 
			  {
			     bcon  = true;
				 break;
			  }
			}
			if(!bcon) continue;
			if(_data[ir] === undefined) continue;
			var selitem = _data[ir];
			for (var key in row) 
			{
			  if (row.hasOwnProperty(key)) 
			  {
				  var valtoinsert;
				  valtoinsert = selitem[key];
				  
				  if(key === "_downloadable_files")
				  {
				  	  valtoinsert = selitem._downloadable_files_val;
				  }
				  var coldef = _idmap[_mapfield[key]];
				  if(coldef !== undefined && coldef.type === "customtaxh")
				  {
				  	  valtoinsert = selitem[key + '_ids'];
					  if(valtoinsert === undefined)
					  	valtoinsert = "";
					 
				  }
				  if(key.indexOf('_ids') !== -1)
				  {
				  	  var test = key.replace('_ids','');
					  if(_mapfield[test] !== undefined)
					  	continue;
				  }
				  if(_arr[key] === undefined)
				   	  _arr[key] = [];
					  
				  _arr[key].push(selitem.ID + '$###' + selitem.post_parent + '$###' + valtoinsert);
				  break;
			  }
			}
		}

		var bcon = false;
		for (var key in _arr) 
		{
		  if (_arr.hasOwnProperty(key)) 
		  {
		      _arr[key] = _arr[key].join('#^#');
			  bcon = true;
		  }
		}
		if(!bcon)
		{
			return;
		}
		if($('#confirmsave').is(':checked'))
		{
			_confirmationclick = "save";
			$("#confirmdialog").dialog("open");	
			return;
		}
		SaveChanges('savechanges');
	});
	
$("#exportdialog").dialog({			
    autoOpen: false,
    height: 340,
    width: 480,
    modal: true,
	draggable:true,
	resizable:false,
	title:"Export to CSV",
	closeOnEscape: true,
	create: function (event, ui) {
        $(this).dialog('widget')
            .css({ position: 'fixed'})
    },
	open: function( event, ui ) {
		 var d = $('.ui-dialog:visible');
 		 $(d).addClass('dialog-zindez');
		 d[0].style.setProperty('z-index', '300002', 'important');
		 $('.ui-dialog:visible').wrap('<div class="w3exabe w3exabedel" />');
		  $('.ui-widget-overlay').each(function () {
			 $(this).next('.ui-dialog').andSelf().wrapAll('<div class="w3exabe w3exabedel" />');
		});
		 $('#exportdialog').css('height','auto');
		 $('input:radio[name=exportwhat]').each(function () { $(this).prop('checked', false); });	
		 $('#exportall').prop('checked',true);
	},
	close: function( event, ui ) {
		$(".w3exabedel").contents().unwrap();
	},
 	buttons: {
	  "OK": function() {
	  	var selid = $('input[name=exportwhat]:checked').attr('id');
	  	var whichfields = $('input[name=exportwhichfields]:checked').attr('id');
		var ajaxarr = {};
		ajaxarr.action = 'wordpress_adv_bulk_edit';
		ajaxarr.type = 'exportproducts';
		ajaxarr.nonce = W3ExWABE.nonce;
		var selectedRows = _grid.getSelectedRows();
		var _arrData = [];
		var strCSV = "";
		var _arrParents = [];
		var delimiter = $('#exportdelimiter').val();
		var buserealmeta = $('#userealmeta').is(':checked');
		if(whichfields == "allfields")
		{
			var ColsToLoad = [];
			var newcols1 = _grid.getColumns();
			var newcolsold = $.extend(true, [], newcols1);
			
			var arrColumnsold = [];
			
			var newlenold = newcolsold.length;
			while (newlenold--) 
			{
			    var newobj1 = newcolsold[newlenold];
			    arrColumnsold.push(newobj1.id);
			}
							    
			for(var i=0; i < _idmap.length; i++)
			{
				var col = _idmap[i];
				if(_mapfield[col.field] === undefined)
					continue;
				if($.inArray(col.field,arrColumnsold) === -1)
			    {
					ColsToLoad.push(col.field);
				}
			}
			
			if(ColsToLoad.length > 0)
			{
				var ajaxarr1 = {};
				ajaxarr1.action = 'wordpress_adv_bulk_edit';
				ajaxarr1.type = 'savecolumns';
				ajaxarr1.post_type = _current_post_type;
				ajaxarr1.nonce = W3ExWABE.nonce;
				var ids = "";
				var dataarray = [];
				if(W3Ex._global_settings.inselectionmode === true)
				{
					dataarray = _dataAllTemp;
					
				}else
				{
					dataarray = _data;
				}
				for(var irow=0; irow < dataarray.length; irow++)
				{
					if(dataarray[irow] === undefined) continue;
					var selitem = dataarray[irow];
					if(ids === "")
					{
						ids = String(selitem.ID);
					}else
					{
						ids = ids + ","+ String(selitem.ID);
					}
				}
				if(ids !== "")
				{
					ajaxarr1.colstoload = ColsToLoad;
					ajaxarr1.colstoloadids = ids;
					var $elem = $('.ui-dialog-buttonset > .ui-button:visible').first();
			        $elem.css('position','relative').append('<div class="showajax"></div>');
					$('.showajax').css({
						left:'15px'
					});
					jQuery.ajax({
				     type : "post",
				     dataType : "json",
				     url : W3ExWABE.ajaxurl,
				     data : ajaxarr1,
				     async: false,
				     success: function(response) 
				     {
						$('.showajax').remove();
						RefreshLoadedFields(response.products);
				     },
					  error:function (xhr, status, error) 
					  {
					  	  $('.showajax').remove();
					  }
				  }) ;
				}
			}				
				
			if(selid == "exportall")
			{
				strCSV = 'id' + delimiter + 'post_parent' + delimiter + 'image';
				for(var i=0; i < _idmap.length; i++)
				{
					var col = _idmap[i];
					if(col.field == '_thumbnail_id' || col.field == 'ID')
						continue;
					if(col.field == '_product_adminlink')
						   continue;
					if(_mapfield[col.field] === undefined)
						continue;
					 strCSV+= delimiter + col.field;
				}
				for(var irow=0; irow < _data.length; irow++)
				{
					if(_data[irow] === undefined) continue;
					var selitem = _data[irow];
					strCSV+= '\n' + selitem.ID + delimiter + selitem.post_parent;
					if(selitem._thumbnail_id_original !== undefined && W3Ex.uploaddir !== undefined)
					{
						if(selitem._thumbnail_id_original.indexOf(W3Ex.uploaddir) === -1)
							strCSV+= delimiter + W3Ex.uploaddir + "/" + selitem._thumbnail_id_original;
						else
							strCSV+= delimiter + selitem._thumbnail_id_original;
					}
					else
						strCSV+= delimiter + "";
					for(var i=0; i < _idmap.length; i++)
					{
						var col = _idmap[i];
						if(col.field == '_thumbnail_id' || col.field == 'ID')
							continue;
						if(col.field == '_product_adminlink')
						   continue;
						 var val = selitem[col.field];
					  	 if(val === undefined || val === null)
						 	val = "";
						var realval = '';
						val = val.toString();
						if(col.field === 'post_title')
						{
							if(selitem.post_type == 'revision' && val.indexOf("... [#") !== -1)
							{
								var attrpart = val.substring(val.indexOf("... [#") + 3,val.length);
								
								if(W3Ex._w3ex_current_parent === undefined || W3Ex._w3ex_current_parent.ID !== selitem.post_parent)
								{
									W3Ex._w3ex_current_parent = {};
									W3Ex._w3ex_current_parent.ID = "-1";
									for(var ir=0; ir < _data.length; ir++)
									{
										if(_data[ir] === undefined) continue;
										var curitem = _data[ir];
										
										if(curitem.ID == selitem.post_parent)
										{
											W3Ex._w3ex_current_parent = curitem;
											break;
										}
									}
								}
								if(W3Ex._w3ex_current_parent.ID !== "-1")
									val = W3Ex._w3ex_current_parent.post_title + attrpart;
								
							}
						}
						 if(val.indexOf('"') !=- 1)
						 {
						 	val = replaceAll(val,'"', '""');
							val = '"' + val + '"';
						 }
						 if(val.indexOf(delimiter) !=- 1 && val.indexOf('"') ==- 1)
						 {
						 	val = '"' + val + '"';
						 }
						 if(val.indexOf(',') !=- 1 && val.indexOf('"') ==- 1)
						 {
						 	val = '"' + val + '"';
						 }
						 if(val.indexOf('\n') !=- 1 && val.indexOf('"') ==- 1)
						 {
						 	val = '"' + val + '"';
						 }
						 strCSV+= delimiter + val;
					}
					
				}
			}else
			{
				if(selectedRows.length > 0)
				{
					strCSV = 'id' + delimiter + 'post_parent' + delimiter + 'image';
					for(var i=0; i < _idmap.length; i++)
					{
						var col = _idmap[i];
						if(col.field == '_thumbnail_id' || col.field == 'ID')
							continue;
						if(col.field == '_product_adminlink')
						   continue;
						 strCSV+= delimiter + col.field;
					}
					for(var irow=0; irow < selectedRows.length; irow++)
					{
						var rowid = selectedRows[irow];
						if(rowid === undefined) continue;
						if(_data[rowid] === undefined) continue;
						var selitem = _data[rowid];
						strCSV+= '\n' + selitem.ID + delimiter + selitem.post_parent;
						if(selitem._thumbnail_id_original !== undefined && W3Ex.uploaddir !== undefined)
						{
							if(selitem._thumbnail_id_original.indexOf(W3Ex.uploaddir) === -1)
								strCSV+= delimiter + W3Ex.uploaddir + "/" + selitem._thumbnail_id_original;
							else
								strCSV+= delimiter + selitem._thumbnail_id_original;
						}
						else
							strCSV+= delimiter + "";
						for(var i=0; i < _idmap.length; i++)
						{
							var col = _idmap[i];
							if(col.field == '_thumbnail_id' || col.field == 'ID')
								continue;
							if(col.field == '_product_adminlink')
							   continue;
							 var val = selitem[col.field];
						  	if(val === undefined || val === null)
						 	   val = "";
							var realval = '';
							val = val.toString();
							if(col.field === 'post_title')
							{
								if(selitem.post_type == 'revision' && val.indexOf("... [#") !== -1)
								{
									var attrpart = val.substring(val.indexOf("... [#") + 3,val.length);
									
									if(W3Ex._w3ex_current_parent === undefined || W3Ex._w3ex_current_parent.ID !== selitem.post_parent)
									{
										W3Ex._w3ex_current_parent = {};
										W3Ex._w3ex_current_parent.ID = "-1";
										for(var ir=0; ir < _data.length; ir++)
										{
											if(_data[ir] === undefined) continue;
											var curitem = _data[ir];
											
											if(curitem.ID == selitem.post_parent)
											{
												W3Ex._w3ex_current_parent = curitem;
												break;
											}
										}
									}
									if(W3Ex._w3ex_current_parent.ID !== "-1")
										val = W3Ex._w3ex_current_parent.post_title + attrpart;
									
								}
							}
							 if(val.indexOf('"') !=- 1)
							 {
							 	val = replaceAll(val,'"', '""');
								val = '"' + val + '"';
							 }
							 if(val.indexOf(delimiter) !=- 1 && val.indexOf('"') ==- 1)
							 {
							 	val = '"' + val + '"';
							 }
							 if(val.indexOf(',') !=- 1 && val.indexOf('"') ==- 1)
							 {
							 	val = '"' + val + '"';
							 }
							 if(val.indexOf('\n') !=- 1 && val.indexOf('"') ==- 1)
							 {
							 	val = '"' + val + '"';
							 }
							 strCSV+= delimiter + val;
						}
					}
				}
			}
		}else
		{
			if(selid == "exportall")
			{
				strCSV = "";
				var cols = _grid.getColumns();
				for(var i=0; i < cols.length; i++)
				{
					var col = cols[i];
//					if(col.field == '_thumbnail_id' || col.field == '_product_image_gallery')
//						continue;
					if(_mapfield[col.field] === undefined)
						continue;
					 if(strCSV === "")
					 	strCSV+= col.field;
					 else
					 	strCSV+= delimiter + col.field;
				}
				var first = true;
				for(var irow=0; irow < _data.length; irow++)
				{
					if(_data[irow] === undefined) continue;
					var selitem = _data[irow];
					strCSV+= '\n';
					first = true;
					for(var i=0; i < cols.length; i++)
					{
						var col = cols[i];
						
						if(_mapfield[col.field] === undefined)
							continue;
						if(col.field == '_product_adminlink')
						   continue;
						if(col.field == '_thumbnail_id')
						{
							if(first)
							{
								first = false;
								if(selitem._thumbnail_id_original !== undefined && W3Ex.uploaddir !== undefined)
								{
									if(selitem._thumbnail_id_original.indexOf(W3Ex.uploaddir) === -1)
										strCSV+= W3Ex.uploaddir + "/" + selitem._thumbnail_id_original;
									else
										strCSV+= selitem._thumbnail_id_original;
								}
								else
									strCSV+= " ";
							}else
							{
								if(selitem._thumbnail_id_original !== undefined && W3Ex.uploaddir !== undefined)
								{
									if(selitem._thumbnail_id_original.indexOf(W3Ex.uploaddir) === -1)
										strCSV+= delimiter + W3Ex.uploaddir + "/" + selitem._thumbnail_id_original;
									else
										strCSV+= delimiter + selitem._thumbnail_id_original;
								}
								else
									strCSV+= delimiter + " ";
							}
							continue;
						}
						 var val = selitem[col.field];
					  	 if(val === undefined || val === null)
						 	val = "";
						var realval = '';
						val = val.toString();
						if(col.field === 'post_title')
						{
							if(selitem.post_type == 'revision' && val.indexOf("... [#") !== -1)
							{
								var attrpart = val.substring(val.indexOf("... [#") + 3,val.length);
								
								if(W3Ex._w3ex_current_parent === undefined || W3Ex._w3ex_current_parent.ID !== selitem.post_parent)
								{
									W3Ex._w3ex_current_parent = {};
									W3Ex._w3ex_current_parent.ID = "-1";
									for(var ir=0; ir < _data.length; ir++)
									{
										if(_data[ir] === undefined) continue;
										var curitem = _data[ir];
										
										if(curitem.ID == selitem.post_parent)
										{
											W3Ex._w3ex_current_parent = curitem;
											break;
										}
									}
								}
								if(W3Ex._w3ex_current_parent.ID !== "-1")
									val = W3Ex._w3ex_current_parent.post_title + attrpart;
								
							}
						}
						 if(val.indexOf('"') !=- 1)
						 {
						 	val = replaceAll(val,'"', '""');
							val = '"' + val + '"';
						 }
						 if(val.indexOf(delimiter) !=- 1 && val.indexOf('"') ==- 1)
						 {
						 	val = '"' + val + '"';
						 }
						 if(val.indexOf(',') !=- 1 && val.indexOf('"') ==- 1)
						 {
						 	val = '"' + val + '"';
						 }
						 if(val.indexOf('\n') !=- 1 && val.indexOf('"') ==- 1)
						 {
						 	val = '"' + val + '"';
						 }
						 if(first)
						 {
						 	first = false;
						 	strCSV+= val;
						 }else
						 {
						 	strCSV+= delimiter + val;
						 }
					}
					
				}
			}else
			{
				if(selectedRows.length > 0)
				{
					strCSV = "";
					var cols = _grid.getColumns();
					for(var i=0; i < cols.length; i++)
					{
						var col = cols[i];
	//					if(col.field == '_thumbnail_id' || col.field == '_product_image_gallery')
	//						continue;
						if(_mapfield[col.field] === undefined)
							continue;
						 if(strCSV === "")
						 	strCSV+= col.field;
						 else
						 	strCSV+= delimiter + col.field;
					}
					var first = true;
					for(var irow=0; irow < selectedRows.length; irow++)
					{
						var rowid = selectedRows[irow];
						if(rowid === undefined) continue;
						if(_data[rowid] === undefined) continue;
						var selitem = _data[rowid];
						strCSV+= '\n';
						first = true;
						for(var i=0; i < cols.length; i++)
						{
							var col = cols[i];
							
							if(_mapfield[col.field] === undefined)
								continue;
							if(col.field == '_product_adminlink')
							   continue;
							if(col.field == '_thumbnail_id')
							{
								if(first)
								{
									first = false;
									if(selitem._thumbnail_id_original !== undefined && W3Ex.uploaddir !== undefined)
									{
										if(selitem._thumbnail_id_original.indexOf(W3Ex.uploaddir) === -1)
											strCSV+= W3Ex.uploaddir + "/" + selitem._thumbnail_id_original;
										else
											strCSV+= selitem._thumbnail_id_original;
									}
									else
										strCSV+= " ";
								}else
								{
									if(selitem._thumbnail_id_original !== undefined && W3Ex.uploaddir !== undefined)
									{
										if(selitem._thumbnail_id_original.indexOf(W3Ex.uploaddir) === -1)
											strCSV+= delimiter + W3Ex.uploaddir + "/" + selitem._thumbnail_id_original;
										else
											strCSV+= delimiter + selitem._thumbnail_id_original;
									}
									else
										strCSV+= delimiter + " ";
								}
								continue;
							}
							var val = selitem[col.field];
						  	if(val === undefined || val === null)
						 	   val = "";
							var realval = '';
							val = val.toString();
							if(col.field === 'post_title')
							{
								if(selitem.post_type == 'revision' && val.indexOf("... [#") !== -1)
								{
									var attrpart = val.substring(val.indexOf("... [#") + 3,val.length);
									
									if(W3Ex._w3ex_current_parent === undefined || W3Ex._w3ex_current_parent.ID !== selitem.post_parent)
									{
										W3Ex._w3ex_current_parent = {};
										W3Ex._w3ex_current_parent.ID = "-1";
										for(var ir=0; ir < _data.length; ir++)
										{
											if(_data[ir] === undefined) continue;
											var curitem = _data[ir];
											
											if(curitem.ID == selitem.post_parent)
											{
												W3Ex._w3ex_current_parent = curitem;
												break;
											}
										}
									}
									if(W3Ex._w3ex_current_parent.ID !== "-1")
										val = W3Ex._w3ex_current_parent.post_title + attrpart;
									
								}
							}
							 if(val.indexOf('"') !=- 1)
							 {
							 	val = replaceAll(val,'"', '""');
								val = '"' + val + '"';
							 }
							 if(val.indexOf(delimiter) !=- 1 && val.indexOf('"') ==- 1)
							 {
							 	val = '"' + val + '"';
							 }
							 if(val.indexOf(',') !=- 1 && val.indexOf('"') ==- 1)
							 {
							 	val = '"' + val + '"';
							 }
							 if(val.indexOf('\n') !=- 1 && val.indexOf('"') ==- 1)
							 {
							 	val = '"' + val + '"';
							 }
							 if(first)
							 {
							 	first = false;
							 	strCSV+= val;
							 }else
							 {
							 	strCSV+= delimiter + val;
							 }
						}
					}
				}
			}
		}
		if(strCSV == "")
		{
			$( this ).dialog( "close" );
			return;
		}			
		var $elem = $('.ui-dialog-buttonset > .ui-button:visible').first();
        $elem.css('position','relative').append('<div class="showajax"></div>');
		$('.showajax').css({
			left:'15px'
		});
//		$elem.button("disable");
		ajaxarr.data = strCSV;
		var dlg = $(this);
		jQuery.ajax({
		     type : "post",
		     dataType : "json",
		     url : W3ExWABE.ajaxurl,
		     data : ajaxarr,
		     success: function(response) {
					$('.showajax').remove();
					$('#exportiframe').attr('src',response.products);
//					$elem.button("enable");
					var link = '<a href ="'+response.products+'" target="_blank">Download CSV File</a>';
					$('#exportinfo').html( link + ' (if download did not start automatically)');
					dlg.dialog( "close" );
					
		     },
			  error:function (xhr, status, error) 
			  {
				  $('.showajax').remove();
//				  $elem.button("enable");
				  dlg.dialog( "close" );
				  $('#debuginfo').html(xhr.responseText);
			  },
			 complete:function (args)
			 {
			  	//uncomment to debug
//			    $('#debuginfo').html(args.responseText);
			 }
		  }) ;
	  	
	  },
	  Cancel: function()
	  {
		  $( this ).dialog( "close" );
	  }
	 }
});


//plugin settings
$("#pluginsettings").dialog({			
    autoOpen: false,
    height: 590,
    width: 780,
    modal: true,
	draggable:true,
	resizable:true,
	title:W3Ex._translate_strings["trans_plugin_settings"],
	closeOnEscape: true,
	create: function (event, ui) {
        $(this).dialog('widget')
            .css({ position: 'fixed'})
    },
	open: function( event, ui ) {
		
		  var d = $('.ui-dialog:visible');
 		  $(d).addClass('dialog-zindez');
		  d[0].style.setProperty('z-index', '300002', 'important');
		  $('.ui-dialog:visible').wrap('<div class="w3exabe w3exabedel" />');
		  $('.ui-widget-overlay').each(function () {
			 $(this).next('.ui-dialog').andSelf().wrapAll('<div class="w3exabe w3exabedel" />');
		});
		 $('#pluginsettings').css('height','520px');
		   var winH = $(window).height() - 180;
			if(winH < 520)
			{
				 $('#pluginsettings').css('height',winH.toString() + 'px');
			}
	},
	close: function( event, ui ) {
		$(".w3exabedel").contents().unwrap();
	},
 	buttons: {
	  "OK": function() {
	  	var settings = {};
		if($('#gettotalnumber').is(':checked'))
			settings['settgetall'] = 1;
		else
			settings['settgetall'] = 0;
		
		if($('#disablesafety').is(':checked'))
		{
			settings['disablesafety'] = 1;
			_disablesafety = true;
		}else
		{
			settings['disablesafety'] = 0;
			_disablesafety = false;
		}
		if($('#calldoaction').is(':checked'))
			settings['calldoaction'] = 1;
		else
			settings['calldoaction'] = 0;
		if($('#calldosavepost').is(':checked'))
			settings['calldosavepost'] = 1;
		else
			settings['calldosavepost'] = 0;
		if($('#confirmsave').is(':checked'))
			settings['confirmsave'] = 1;
		else
			settings['confirmsave'] = 0;
		if($('#deleteimages').is(':checked'))
			settings['deleteimages'] = 1;
		else
			settings['deleteimages'] = 0;
		if($('#deleteinternal').is(':checked'))
			settings['deleteinternal'] = 1;
		else
			settings['deleteinternal'] = 0;
		
		
			
		var prodlimit = $('#productlimit').val();
		prodlimit = $.trim(prodlimit);
		if(!isNaN(prodlimit))
		{
			_recordslimit = parseInt(prodlimit);
			if(isNaN(_recordslimit))
			{
				_recordslimit = 1000;
			}else if(_recordslimit <= 0)
			{
				_recordslimit = 1000;
			}else
			{
				settings['settlimit'] = prodlimit;
			}
			
		}
		prodlimit = $('#tableheight').val();
		prodlimit = $.trim(prodlimit);
		if(prodlimit === "")
		{
			settings['tableheight'] = "asd";
			$('#myGrid').css('height','');
			_grid.resizeCanvas();
		}else
		{
			prodlimit = parseInt(prodlimit);
			if(!isNaN(prodlimit) && prodlimit > 100 && prodlimit < 2500)
			{
				settings['tableheight'] = prodlimit;
				prodlimit = prodlimit.toString();
				$('#myGrid').css('height',prodlimit + 'px');
				_grid.resizeCanvas();
			}
		}
		prodlimit = $('#savebatch').val();
		prodlimit = $.trim(prodlimit);
		if(prodlimit === "")
		{
			settings['savebatch'] = "asd";
			W3Ex._global_settings["savebatch"] = -1;
		}else
		{
			prodlimit = parseInt(prodlimit);
			if(!isNaN(prodlimit) && prodlimit > 0)
			{
				settings['savebatch'] = prodlimit;
				W3Ex._global_settings["savebatch"] = prodlimit;
			}
		}
		prodlimit = $('#searchfiltersheight').val();
		prodlimit = $.trim(prodlimit);
		if(prodlimit === "" || isNaN(prodlimit))
		{
//			settings['searchfiltersheight'] = "asd";
			
//			if($('#collapsefilters').attr('data-state') === "collapse")
			{
//				$('#searchtablewrapper').css('display','');
			}
			
//			$('#searchtablewrapper').css('max-height','');
		}else
		{
//			prodlimit = parseInt(prodlimit);
//			if(!isNaN(prodlimit) && prodlimit > 50)
			{
//				settings['searchfiltersheight'] = prodlimit;
//				prodlimit = prodlimit.toString();
//				if($('#collapsefilters').attr('data-state') === "collapse")
				{
//					$('#searchtablewrapper').css('display','block');
				}
//				$('#searchtablewrapper').css('max-height',prodlimit + 'px');
			}
		}
		
		prodlimit = $('#productlimit').val();
		if(!isNaN(prodlimit))
		{
			_recordslimit = parseInt(prodlimit);
			if(isNaN(_recordslimit))
			{
				_recordslimit = 1000;
			}else if(_recordslimit <= 0)
			{
				_recordslimit = 1000;
			}else
			{
				settings['settlimit'] = prodlimit;
			}
			
		}
		prodlimit = $('#rowheight').val();
		prodlimit = $.trim(prodlimit);
		if(prodlimit === "")
		{
			settings['rowheight'] = "asd";
		}else
		{
			settings['rowheight'] = prodlimit;
//			var refresh = false;
//			var options = _grid.getOptions();
//			if(prodlimit !== W3Ex._abe_rowheight)
//			{
//				refresh = true;
//			}
			if(prodlimit === "2")
			{
//				W3Ex._abe_rowheight = "2";
				options['rowHeight'] = 40;
			}else if(prodlimit === "3")
			{
//				W3Ex._abe_rowheight = "3";
				options['rowHeight'] = 60;
			}else
			{
//				W3Ex._abe_rowheight = "1";
				options['rowHeight'] = 25;
			}
//			if(refresh)
//			{
//				_grid.setOptions(options);
//				_grid.invalidate();
//			}
		}
		
		if($('#debugmode').is(':checked'))
		{
			settings['debugmode'] = 1;
			_debugmode = true;
		}			
		else
		{
			settings['debugmode'] = 0;
			_debugmode = false;
		}
			
		
		var selcustomfields = [];
		$('.customfield input:checked').each(function(){
			selcustomfields.push($(this).attr('data-id'));
		})
		
		W3Ex.customfieldssel[_current_post_type] = selcustomfields;
		settings['selcustomfields'] = W3Ex.customfieldssel;
		var ajaxarr = {};
		ajaxarr.action = 'wordpress_adv_bulk_edit';
		ajaxarr.type = 'savesettings';
		ajaxarr.nonce = W3ExWABE.nonce;
		ajaxarr.post_type = _current_post_type;
//      	var $elem = $('.ui-dialog-buttonset > .ui-button:visible').first();
//        $elem.css('position','relative').append('<div class="showajax"></div>');
//		$('.showajax').css({
//			left:'15px'
//		});
//		$elem.button("disable");
		ajaxarr.data = settings;
		var dlg = $(this);
		jQuery.ajax({
		     type : "post",
		     dataType : "json",
		     url : W3ExWABE.ajaxurl,
		     data : ajaxarr,
		     success: function(response) {
//					$('.showajax').remove();
//					$elem.button("enable");
					ShowCustomSearchFilters();
					$('.makechosen').chosen({disable_search_threshold: 10});
					
					
		     },
			  error:function (xhr, status, error) 
			  {
//				  $('.showajax').remove();
//				  $elem.button("enable");
//				  dlg.dialog( "close" );
				  $('#debuginfo').html(xhr.responseText);
			  },
			 complete:function (args)
			 {
			  	//uncomment to debug
//			    $('#debuginfo').html(args.responseText);
			 }
		  }) ;
		  dlg.dialog( "close" );
	  	
	  },
	  Cancel: function()
	  {
		  $( this ).dialog( "close" );
	  }
	 }
});

//bulk dialog
$("#bulkdialog").dialog({			
    autoOpen: false,
    height: 620,
    width: 1250,
    modal: true,
	draggable:true,
	resizable:true,
	closeOnEscape: true,
	title:"Bulk edit selected posts",
	create: function (event, ui) {
        $(this).dialog('widget')
            .css({ position: 'fixed'})
    },
	open: function( event, ui ) {
		 var d = $('.ui-dialog:visible');
		 $(d).addClass('dialog-zindez');
		 d[0].style.setProperty('z-index', '300002', 'important');
		 $('.ui-dialog:visible').wrap('<div class="w3exabe w3exabedel" />');
		  $('#bulkdialog').css('height','520px');
		  var winH = $(window).height() - 180;
			if(winH < 520)
			{
				 $('#bulkdialog').css('height',winH.toString() + 'px');
			}
		  $('#maptodialog').remove();
		  $('.ui-widget-overlay').each(function () {
			 $(this).next('.ui-dialog').andSelf().wrapAll('<div class="w3exabe w3exabedel" />');
			
		});
//		$('#bulkdialog .bulkvalue').val('');
//		$('#bulkdialog').find('.bulkset').each(function(){

//		var a = performance.now();
		$('#bulkdialog .bulkvalue:visible').val('');
		$('#bulkdialog .bulkset:visible').prop('checked', false);
		$('#bulkdialog .butnewattribute').prop('disabled', true);
		$('#bulkdialog .selectnewcategory').html($('#bulkcategory').html()).chosen({max_selected_options:1});
		$('#bulkdialog').find('.bulkset:visible').each(function(){
//		$('#bulkdialog .bulkset').each(function(){
//			if(!_changedlayout)
//				return false;
			var item = $(this);
			var column = item.attr('data-id');
			var coldef = _idmap[_mapfield[column]];
			if(!item.is(':checked'))
			{
				try{
						if(coldef !== undefined && coldef.type === "customtaxh")
						{
							$('#bulk' + column).prop('disabled', true).trigger("chosen:updated");
							$('#bulkadd' + column).prop("disabled",true);
						}
						else
							$('#bulk' + column).prop("disabled",true);
				} catch (err) {
					;
				}
			}else
			{
				if(coldef !== undefined && coldef.type === "customtaxh")
				{
					if(true === coldef.attribute)
					{
						var $parent = $(this).parent().parent();
						if( $parent.find(".selectvisiblefp").is(':enabled'))
						{
							var setvisval = $parent.find(".selectvisiblefp").val();
							if(setvisval == "onlyset")
							{
								$parent.find(".visiblefp").prop("disabled",false);
								$parent.find(".selectusedforvars").prop("disabled",true);
								$parent.find(".usedforvars").prop("disabled",true);
								$('#bulkadd' + column).prop("disabled",true);
								$('#bulk' + column).prop('disabled', true).trigger("chosen:updated");
								return;
							}
						}
						if( $parent.find(".selectusedforvars").is(':enabled'))
						{
							var setvisval = $parent.find(".selectusedforvars").val();
							if(setvisval == "onlyset")
							{
								$parent.find(".usedforvars").prop("disabled",false);
								$parent.find(".selectvisiblefp").prop("disabled",true);
								$parent.find(".visiblefp").prop("disabled",true);
								try{
									$('#bulkadd' + column).prop("disabled",true);
									$('#bulk' + column).prop('disabled', true).trigger("chosen:updated");
								} catch (err) {
									;
								}
								return;
							}
						}
					}
					try{
						$('#bulk' + column).prop('disabled', false).trigger("chosen:updated");
						$('#bulkadd' + column).prop("disabled",false);
					} catch (err) {
						;
					}
					
				}					
				else
				{
					try{
						$('#bulk' + column).prop("disabled",false);
					
					} catch (err) {
						;
					}
				}
			}
		})

//			var b = performance.now();
//			console.log('It took ' + (b - a) + ' ms.');
			if(_changedlayout)
				_changedlayout = false;
		/*$('#bulkdialog .selectvisiblefp').each(function(){
			var item = $(this);
			if(!item.prop('checked'))
			{
				item.parent().parent().find('.visiblefp').attr("disabled","disabled");
			}else
			{
				item.parent().parent().find('.visiblefp').removeAttr("disabled");
			}
		})*/
		
	},
	close: function( event, ui ) {
		$(".w3exabedel").contents().unwrap();
		$("#bulkdialog .divnewattributeerror").html('');
		$("#bulkdialog .inputnewattributename").val('');
		$("#bulkdialog .inputnewattributeslug").val('');
		$("#bulkdialog .butnewattribute").show();
		$("#bulkdialog .divnewattribute").hide();
	},
 	buttons: {
	  "OK": function() {
	  	var params = {};
	  	
		$('#bulkdialog .bulkvalue:visible').each(function(){
			var item = $(this);
			var $td = item.parent();
//			if(!item.is(':visible')) continue;
			var value = item.val();
			var id = item.attr('data-id');
			
			if($('#bulk'+ id).val() !== "replace" && $td.attr('data-mapped') === 'yes' && $td.attr('data-mappedto') !== undefined)
			{
				params[id] = $('#bulk'+ id).val();
				params[id + 'mappedto'] = $td.attr('data-mappedto');
				params[id + 'value'] = value;
				var coldef = _idmap[_mapfield[id]];
				if(coldef !== undefined)
				{
					if(coldef.type === 'float2' || coldef.type === 'float3')
					{
						if($('#bulk'+id+'_round').length > 0)
						{
							var roundval = $('#bulk'+id+'_round').val();
							if(roundval !== 'noround')
							{
								params[id+'roundvalue'] = roundval;
							}
						}
					}
				}
			}else
			{
				if(value != "")
				{
					params[id] = $('#bulk'+ id).val();
					params[id + 'value'] = value;
					if(id === "_sale_price")
					{
						if(params[id] == 'decvaluereg' || params[id] == 'decpercentreg')
						{
							params.isskipsale = $('#saleskip').prop('checked');
						}
						if(params[id] == 'decpercentreg')
						{
							if($('#bulk'+id+'_round').length > 0)
							{
								var roundval = $('#bulk'+id+'_round').val();
								if(roundval !== 'noround')
								{
									params[id+'roundvalue'] = roundval;
								}
							}
						}
					}
					if(params[id] === "replace" || params[id] === "replaceregexp")
					{ 
						params[id + 'ifignore'] = item.parent().parent().find('.inputignorecase').prop('checked');
						params[id + 'replacewith'] = item.parent().parent().find('.inputwithvalue').val();
					}
					var coldef = _idmap[_mapfield[id]];
					if(coldef !== undefined)
					{
						if(coldef.type === 'float2' || coldef.type === 'float3')
						{
							if($('#bulk'+id+'_round').length > 0)
							{
								var roundval = $('#bulk'+id+'_round').val();
								if(roundval !== 'noround')
								{
									params[id+'roundvalue'] = roundval;
								}
							}
						}
					}
				}
			}
		})
		
		$('#bulkdialog .bulkvalue:hidden').each(function(){
		try{
			var item = $(this);
			var $td = item.parent();
//			if(!item.is(':visible')) continue;
			var value = item.val();
			var id = item.attr('data-id');
			if($('#bulk'+ id).val() !== "replace" && $td.attr('data-mapped') === 'yes' && $td.attr('data-mappedto') !== undefined)
			{
				params[id] = $('#bulk'+ id).val();
				params[id + 'mappedto'] = $td.attr('data-mappedto');
			}
		} catch (err) {
			;
		}
		})
		
		$('#bulkdialog select option[value="delete"]:selected').each(function(){
		try{
			var item = $(this).parent();
			if(item.is(':visible'))
			{
				var id = item.attr('data-id');
				params[id] = 'delete';
				params[id + 'value'] = 0;
			}
		} catch (err) {
			;
		}
		})
		
		$('#bulkdialog .bulkset:checked').each(function(){
		try{
			var item = $(this);
			if(item.is(':visible'))
			{
				var id = item.attr('data-id');
				params[id] = id;
				params[id+ 'value'] = $('#bulkdialog select#bulk' + id).val();
				if(id === '_custom_attributes')
				{
					var name = $('#bulk_custom_attributesname').val();
					var action = $('#bulkadd_custom_attributes').val();
					var attrvalue = $('#bulk_custom_attributesvalue').val();
//					if(action === "new" && name !== "" && attrvalue !== "")
					{
						params[id] = id;
						params[id+ 'action'] = action;
						params[id+ 'name'] = name;
						params[id+ 'value'] = attrvalue;
					}
					var $select = item.parent().parent().find('.selectvisiblefp');
					if($select.length > 0 && $select.is(':enabled'))
					{
						if($select.val() !== "skip")
						{
							params[id+ '_visiblefp'] = item.parent().parent().find('.visiblefp').is(':checked');
							if(params[id+ '_visiblefp'] == true)
								params[id+ '_visiblefp'] = 1;
							else
								params[id+ '_visiblefp'] = 0;
							var selectval = $select.val();
							if(selectval == "onlyset")
							{
								params[id+ '_onlyvisiblefp'] = 1;
							}
						}
					}
					$select = item.parent().parent().find('.selectusedforvars');
					if($select.length > 0 && $select.is(':enabled'))
					{
						if($select.val() !== "skip")
						{
							params[id+ '_usedforvars'] = item.parent().parent().find('.usedforvars').is(':checked');
							if(params[id+ '_usedforvars'] == true)
								params[id+ '_usedforvars'] = 1;
							else
								params[id+ '_usedforvars'] = 0;
							var selectval = $select.val();
							if(selectval == "onlyset")
							{
								params[id+ '_onlyusedforvars'] = 1;
							}
						}
					}
					if((action === "new" || action === "addvalue") && name !== "")
					{
						var arrcust = [];
						var arritem = {};
						arritem.name = name;
						arritem.value = attrvalue;
						arrcust.push(arritem);
						var ajaxarr = {};
						ajaxarr.action = 'wordpress_adv_bulk_edit';
						ajaxarr.type = 'getcustomslugs';
						ajaxarr.nonce = W3ExWABE.nonce;
						ajaxarr.data = arrcust;
						
						jQuery.ajax({
						     type : "post",
						     dataType : "json",
						     url : W3ExWABE.ajaxurl,
						     data : ajaxarr,
						     success: function(response) {
							 	if(response !== null && response !== undefined && response.products !== null && response.products !== undefined)
							 	{
									for (var key in response.products) 
									{
										if (response.products.hasOwnProperty(key)) 
										{
											var attr = response.products[key];
											W3Ex._w3ex_map_attributes[key] = attr;
										}
									}
								}
						     },
							 complete:function (args)
							 {
							 	 $('.showajax').remove();
							 },
							 async : false
						  }) ;
					}	
				}
				if(item.attr('data-type') === "customtaxh")
				{
					var cats = [];
					var textvals = "";
					$("#bulk"+id+".catselset :selected").each(function(){
			    		 cats.push($(this).val());
						 if(textvals == "")
						 	textvals = $.trim($(this).text());
						 else
						 	textvals+= ', ' + $.trim($(this).text());
			   		});
					params[id+ 'value_ids'] = cats;
					params[id+ 'value'] = textvals;
					if($('#bulkdialog select#bulkadd' + id).length > 0)
						params[id+ 'action'] = $('#bulkdialog select#bulkadd' + id).val();
					var coldef = _idmap[_mapfield[id]];
					if(coldef !== undefined && true === coldef.attribute)
					{
						var $select = item.parent().parent().find('.selectvisiblefp');
						if($select.length > 0 && $select.is(':enabled'))
						{
							if($select.val() !== "skip")
							{
								params[id+ '_visiblefp'] = item.parent().parent().find('.visiblefp').is(':checked');
								if(params[id+ '_visiblefp'] == true)
									params[id+ '_visiblefp'] = 1;
								else
									params[id+ '_visiblefp'] = 0;
								var selectval = $select.val();
								if(selectval == "onlyset")
								{
									params[id+ '_onlyvisiblefp'] = 1;
								}
							}
						}
						$select = item.parent().parent().find('.selectusedforvars');
						if($select.length > 0 && $select.is(':enabled'))
						{
							if($select.val() !== "skip")
							{
								params[id+ '_usedforvars'] = item.parent().parent().find('.usedforvars').is(':checked');
								if(params[id+ '_usedforvars'] == true)
									params[id+ '_usedforvars'] = 1;
								else
									params[id+ '_usedforvars'] = 0;
								var selectval = $select.val();
								if(selectval == "onlyset")
								{
									params[id+ '_onlyusedforvars'] = 1;
								}
							}
						}	
					}
				}
			}
		} catch (err) {
			;
		}
		})

		HandleBulkUpdate(params);
	     $( this ).dialog( "close" );
	  },
	  Cancel: function()
	  {
		  $( this ).dialog( "close" );
	  }
	 }
});


		
	$('#bulkedit').click(function ()
	{
		$('#bulkdialog').dialog("open");
	})
	
	$('#selectedit').click(function ()
	{
		$('#selectdialog').dialog("open");
	})
	
	
	$('#getproducts').click(function ()
	{
		var _arr = {};
		var bcon = false;
		for(var ir=0; ir < _arrEdited.length; ir++)
		{
			var row = _arrEdited[ir];
			if(row === undefined) continue;
			
			for (var key in row) 
			{
			  if (row.hasOwnProperty(key)) 
			  {
			     bcon  = true;
				 break;
			  }
			}
			if(!bcon) continue;
			else
			break;
		}
		if(bcon)
		{
			_confirmationclick = "load";
			$("#confirmdialog").dialog("open");	
			return;
		}
		LoadProducts('getproducts');
		
	});
	
	
	function LoadProducts(control,pagination,isnext)
	{
		pagination = typeof pagination !== 'undefined' ? pagination : false;
		isnext = typeof isnext !== 'undefined' ? isnext : true;
		
		_grid.resetActiveCell();
		_grid.invalidate();
		DisableAllControls(true);
		if(control == 'getproducts')
		{
			$('#getproducts').parent().append('<div class="showajax"></div>');
			_currentoffset = 1;
			pagination = false;
			isnext = false;
		}else
		{
			$('#pagingholder').append('<div class="showajax"></div>');
			$('.showajax').css({
				left:'170px',
				top:'30px'
			});
		}
	  	var ajaxarr = {};
		ajaxarr.action = 'wordpress_adv_bulk_edit';
		ajaxarr.type = 'loadproducts';
		ajaxarr.nonce = W3ExWABE.nonce;
		var cats = [];
		var attrs = [];
		var priceparam = {};
		var titleparam = {};
		var descparam = {};
		var shortdescparam = {};
		var customparam = [];
		var tagsparam = [];
		var custsearchparam = [];
		
		$('.trcustom').each(function ()
		{
			var $tds = $(this).children('td');
			$tds.each(function ()
			{
				var field = $(this).attr('data-field');
				if(field == 'name')
				{
					customparam.push($(this).text());
				}
			})
		})
		
		$(".catsel :selected").each(function(){
    		 cats.push($(this).val());
   		});
		
		if($.inArray('none',cats) !== -1)
		{
			cats.length = 0;
				$(".catsel option").each(function(){
	    		 cats.push($(this).val());
	   		});
		}
		
		
		$("#tagsparams :selected").each(function(){
			if($(this).val() != "")
    			tagsparam.push($(this).val());
   		});
		
		var title = $('#titlevalue').val();
		title = $.trim(title);
		if(title != "")
		{
			titleparam.title = title;
			titleparam.value = $('#titleparams').val();
		}
		
		title = $('#descvalue').val();
		title = $.trim(title);
		if(title != "")
		{
			descparam.title = title;
			descparam.value = $('#descparams').val();
		}
		title = $('#shortdescvalue').val();
		title = $.trim(title);
		if(title != "")
		{
			shortdescparam.title = title;
			shortdescparam.value = $('#shortdescparams').val();
		}
		
		$('.customfieldtable').each(function(){
			var custitem = {};
			var $par = $(this);
			custitem.type = $par.attr('data-type');
			custitem.id = $par.attr('data-id');
			if(custitem.id == "ID")
			{
				custitem.type = "int";
				custitem.id = "ID";
				custitem.value = $('#idvalue').val();
				if(custitem.value !== "")
					custsearchparam.push(custitem);
				return true;
			}
			if(custitem.id == "post_date")
			{
				custitem.type = "date";
				custitem.id = "post_date";
				custitem.value = $('#datefilterselect').val();
				var itemtitle = $('#datefilter1').val();
				if(itemtitle === "")
					return true;
				custitem.title = itemtitle;
				if(custitem.value === "between")
				{
					custitem.title1 = $('#datefilter2').val();
					if(custitem.title1 === "")
					{
						return true;
					}
				}
				custsearchparam.push(custitem);
				return true;
			}
				
			if(custitem.type !== "custom" && custitem.type !== "customh")
			{
				var itemtitle = $par.find('input').val();
				itemtitle = $.trim(itemtitle);
//				if(custitem.id == "post_status")
//				{
//					if(itemtitle === "skip")
//					return true;
//				}
				if(custitem.type === "select")
				{
					custitem.value = $par.find('select').val();
					if(custitem.value === "skip")
						return true;
					custsearchparam.push(custitem);
					return true;
				}
				if(itemtitle !== "")
				{
					custitem.title = itemtitle;
					custitem.value = $par.find('select').val();
					custsearchparam.push(custitem);
				}
				
			}else
			{
				var hasnone = false;
				$par.find("select :selected").each(function(){
					if($(this).val() != "")
					{
						if($(this).val() === "none")
							hasnone = true;
						if(custitem.array === undefined) custitem.array = [];
						custitem.array.push($(this).val());
					}
		    			
		   		});
				
				if(custitem.array !== undefined)
				{
					if(hasnone)
					{
						custitem.array.length = 0;
						$par.find("option").each(function(){
							if($(this).val() != "")
							{
								custitem.array.push($(this).val());
							}
			    			
			   			});
					}
					if(custitem.array.length !== 0)
						custsearchparam.push(custitem);
				}
			}
		})
		
		var arrcurrentpostype = [];
		var currentpost = W3Ex[_current_post_type + '_idmap'];
		if(currentpost !== undefined)
		{
			for (var i = 0; i < currentpost.length; i++) 
			{
			    var item = currentpost[i];
		  		arrcurrentpostype.push(item.field);
			}
		}
	
	
//		{//reserved, titles OR
			var reserved = [];
			$('.orcheckbox').each(function()
			{
				var resitem = {};
				var $elem = $(this);
				if($elem.val() !== "OR")
					return true;
				resitem.id = $elem.parent().attr('data-id');
				resitem.action = "OR";
				reserved.push(resitem);
				
			})
			
			if($('#multipleskus').length > 0)
			{
				if($('#multipleskus').is(':checked'))
				{
					var resitem = {};
					resitem.id = '_sku';
					resitem.action = "multiple";
					reserved.push(resitem);
				}
			}
			if(reserved.length > 0)
			{
				ajaxarr.reserved = reserved;
			}
//		}
		
		$('#myGrid').prepend('<div id="dimgrid" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:102;opacity:0.4;filter: alpha(opacity = 40);background-color:grey;"></div>');
		if(control !== 'getproducts')
		{
			cats =  _pagecats;
			attrs =  _pageattrs;
			titleparam = _pagetitleparam;
			descparam = _pagedescparam;
			shortdescparam = _pageshortdescparam;
			customparam = _pagecustomparam;
			tagsparam = _pagetagsparam;
			custsearchparam = _pagecustsearchparam;
		}else
		{
			_pagecats = cats;
			_pageattrs = attrs;
			_pagetitleparam = titleparam;
			_pagedescparam = descparam;
			_pageshortdescparam = shortdescparam;
			_pagecustomparam = customparam;
			_pagetagsparam = tagsparam;
			_pagecustsearchparam = custsearchparam;
		}
	
		ajaxarr.catparams = cats;
		if($('#categoryor').is(':checked'))
		{
			ajaxarr.categoryor = true;
		}
		ajaxarr.arrcurrentpostype = arrcurrentpostype;
		ajaxarr.titleparam = titleparam;
		ajaxarr.descparam = descparam;
		ajaxarr.shortdescparam = shortdescparam;
		ajaxarr.customparam = customparam;
		ajaxarr.custsearchparam = custsearchparam;
		ajaxarr.tagsparams = tagsparam;
		ajaxarr.ispagination = pagination;
		ajaxarr.isnext = isnext;
		ajaxarr.isvariations = $('#getvariations').is(':checked');
		if(W3Ex._iswpmlenabled !== undefined)
			ajaxarr._iswpmlenabled = 1;
		ajaxarr.post_type = _current_post_type;
		var arrColumns = [];
		var newcols = _grid.getColumns();
		var newlen = newcols.length;
		while (newlen--) {
		    var newobj = newcols[newlen];
		    arrColumns.push(newobj.id);
//			arrColumns[newobj.id] = newobj.width;
		}
		ajaxarr.columns = arrColumns;
		jQuery.ajax({
		     type : "post",
		     dataType : "json",
		     url : W3ExWABE.ajaxurl,
		     data : ajaxarr,
		     success: function(response) {
			 		_changed = {};
					while(_arrEdited.length > 0) {
					    _arrEdited.pop();
					}
					$('#dimgrid').remove();
					$('.showajax').remove();
					DisableAllControls(false);
					if(_data !== undefined || _data !== null)
			 			_grid.setSelectedRows([]);
			 		ShowMemoryUsage(response);	
			 		_dataAllTemp = [];
					_dataAllMapIDS = {};
					W3Ex._global_settings.inselectionmode = false;
					
					if(response === null || response === undefined || response.products === undefined || response.products === null)
					{
//						if(_data === undefined || _data === null)
		 				_data = [];
						_grid.setData(_data);
						_totalrecords = 0;
						_currentoffset = 1;
						$('#butprevious').prop("disabled",true);
						$('#gotopage').prop("disabled",true);
						$('#butnext').prop("disabled",true);
						$('#totalpages').text('');
						$('#viewingwhich').text('');
						$('#totalrecords').text(_totalrecords);
						$('#gotopagenumber').val(_currentoffset);
						$('#bulkeditinfo').text(' 0 of 0');
						if(_debugmode)
							$('#debuginfo').html('getting null');
						else
							$('#debuginfo').html('');
						return;
					}
			 		var newdata = response.products;
					_totalrecords = parseInt(response.total);
					var updateparents = false;
					var hasnext = response.hasnext;
					if(hasnext || hasnext === "true")
						_hasnext = true;
					else
						_hasnext = false;
					var isbegin = response.isbegin;
					if(isbegin || isbegin === "true")
					{
						_currentoffset = 1;
					}
					$('#gotopagenumber').val(_currentoffset);
					
					if(_totalrecords <= _recordslimit)
					{
						$('#butprevious').prop("disabled",true);
						$('#gotopage').prop("disabled",true);
						$('#butnext').prop("disabled",true);
						$('#totalpages').text('');
						$('#viewingwhich').text('');
					}else
					{
						$('#butprevious').prop("disabled",false);
						$('#gotopage').prop("disabled",false);
						if(_hasnext)
							$('#butnext').prop("disabled",false);
						else
							$('#butnext').prop("disabled",true);
						var viewtext = "";
						var tpages = 0;
						tpages = Math.ceil(_totalrecords/_recordslimit);
						$('#totalpages').text('(' + String(tpages) + ' pages)' );
						updateparents = true;
//						var viewing = _currentoffset;
//						viewtext = "";
//						if(((_currentoffset*_recordslimit)) > _totalrecords)
//						{
//							viewing--;
//							viewtext = String((viewing*_recordslimit) +1)+ '-' + String(_totalrecords);
//						}else
//						{
//							viewing--;
//							viewtext = String((viewing*_recordslimit) +1)+ '-' + String(_currentoffset*_recordslimit);
//						}
//						$('#viewingwhich').text('; Viewing ' + viewtext );
					}
					if(_totalrecords == -1)
					{
						if(_currentoffset !== 1)
						{
							$('#butprevious').prop("disabled",false);
							$('#gotopage').prop("disabled",false);
						}
						if(_hasnext)
							$('#butnext').prop("disabled",false);
						else
							$('#butnext').prop("disabled",true);
					}
					if(_currentoffset == 1)
					{
						$('#butprevious').prop("disabled",true);
						$('#gotopage').prop("disabled",true);
					}
					$('#totalrecords').text(_totalrecords);

					if(newdata === null || newdata === undefined)
						newdata = [];
					_grid.setData(newdata);
					_data = newdata;
					try{
						_grid.removeCellCssStyles("changed");
						_grid.setCellCssStyles("changed", _changed);
					} catch (err) {
						;
					}
					if(response.mapattrs !== undefined && response.mapattrs !== null)
					{
						W3Ex._w3ex_map_attributes = response.mapattrs;
					}
					if(updateparents)
					{
						LoadParents();
					}
					GenerateGroupedItems(true);
					
					_shouldhandle = false;
					_grid.invalidate();
					_shouldhandle = true;	
					var all = newdata.length;
					var seltext = ' 0 of ' + all;
					$('#bulkeditinfo').text(seltext);
		     }, complete:function (args,status)
				{
					if(_debugmode)
					{
						if(args.statusText === "OK" && args.responseText !== undefined)
						{
							var str = String(args.responseText);
							str = str.substring(0,100);
							
							if(status === "parseerror")
							{
								$('#debuginfo').html(args.responseText);
							}else
							{
								$('#debuginfo').html(str);
							}
						}
					}
					else
						$('#debuginfo').html('');
					if(_debugmode)
					{
						var ajaxarr = {};
							ajaxarr.action = 'wordpress_adv_bulk_edit';
							ajaxarr.type = 'getdebuginfo';
							ajaxarr.nonce = W3ExWABE.nonce;
							ajaxarr.data = "debug";
							jQuery.ajax({
							     type : "post",
							     dataType : "json",
							     url : W3ExWABE.ajaxurl,
							     data : ajaxarr,
							     success: function(response) 
								 {
									var curhtml = $('#debuginfo').html();
									curhtml = response.debuginfo + "<br/>" + curhtml;
									$('#debuginfo').html(curhtml);
							     },
								  error:function (xhr, status, error) 
								  {
								  	var curhtml = $('#debuginfo').html();
								  	curhtml = error + "<br/>" + curhtml;
								  	 $('#debuginfo').html(curhtml);
								  }
							  }) ;
					}
				}
			 , error:function (xhr, status, error) 
			  {
				  $('#dimgrid').remove();
				  $('.showajax').remove();
				  DisableAllControls(false);
				  if(_debugmode)
				  {
				  	var curhtml = $('#debuginfo').html();
					curhtml = xhr.statusText + "<br/>" + xhr.responseText + "<br/>" + curhtml;
					$('#debuginfo').html(curhtml);
				  }
			  }
		  }) ;
	}

	function LoadParents()
	{
		var arrparents = [];
		var arrtoget = [];
		for(var ir=0; ir < _data.length; ir++)
		{
			if(_data[ir] === undefined) continue;
			var selitem = _data[ir];
			if(selitem.post_type === 'product')
			{
				if($.inArray(selitem.ID,arrparents) === -1)
				{
					arrparents.push(selitem.ID);
				}
			}
		}
		for(var i=0; i < _data.length; i++)
		{
			if(_data[i] === undefined) continue;
			var selitem = _data[i];
			if(selitem.post_type === 'revision')
			{
				if($.inArray(selitem.post_parent,arrparents) === -1)
				{
					if($.inArray(selitem.post_parent,arrtoget) === -1)
					{
						arrtoget.push(selitem.post_parent);
					}
				}
			}
		}
		if(arrtoget.length === 0)
			return;
		var ajaxarr = {};
		ajaxarr.action = 'wordpress_adv_bulk_edit';
		ajaxarr.type = 'loadparents';
		ajaxarr.nonce = W3ExWABE.nonce;
		
		
		
		$('#myGrid').prepend('<div id="dimgrid" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:102;opacity:0.4;filter: alpha(opacity = 40);background-color:grey;"></div>');
		DisableAllControls(true);
		ajaxarr.data = arrtoget;
		jQuery.ajax({
		     type : "post",
		     dataType : "json",
		     url : W3ExWABE.ajaxurl,
		     data : ajaxarr,
		     success: function(response) {
			 		$('#dimgrid').remove();
					DisableAllControls(false);
					$('.showajax').remove();
					ShowMemoryUsage(response);
			 		if(response.products === undefined || response.products === null)
						return;
		 			_grid.setSelectedRows([]);
			 		var newvars = response.products;
//					for(var ir=0; ir < newvars.length; ir++)
//					{
//						var selitem = newvars[ir];
//						selitem.post_title = 'New Product';
//					}
//					
					var selindexes = [];
					var prodcount = newvars.length;
					if(prodcount === 0)
						return;
					var currentid = -1;
					var hascurrent = false;
					var curproduct;
					var insertcounter = 0;
					for(var i=_data.length-1; i>=0; i--) 
					{
						//_data[i + newvars.length] = _data[i];
							   
						if(_data[i] === undefined) continue;
						var selitem = _data[i];
						
					  	if(selitem.post_type === 'revision' && !hascurrent)
					  	{
							if(selitem.post_parent != currentid)
							{
								currentid = selitem.post_parent;
								hascurrent = false;
							}
							if(!hascurrent)
							{
								for(var j=0; j<= newvars.length; j++)
								{
									if(newvars[j] === undefined)
										continue;
									if(newvars[j].ID === currentid)
									{
										hascurrent = true;
										curproduct = newvars[j];
										break;
									}
								}
							}
							
						}
						if(hascurrent || i===0)
						{
							if(selitem.post_parent != curproduct.ID || i===0)
							{
								hascurrent = false;
								for(var ii=_data.length-1; ii>=i; ii--) 
								{
									//_data[i + newvars.length] = _data[i];
										   
									if(_data[ii] === undefined) continue;
//									var selitemin = _data[ii];
									_data[ii+1] = _data[ii];
									var movitem = _data[ii+1];
									if(movitem.post_parent === curproduct.ID && movitem.post_type === 'revision')
									{
										movitem.post_title = curproduct.post_title + movitem.post_title;
									}
									if(ii === i)
									{
										if(i === 0 && selitem.post_parent === curproduct.ID)
										{
											_data[0] = curproduct;
										}else
										{
											_data[ii+1] = curproduct;
										}
										
										break;
									}
								}
								insertcounter++;
								if(insertcounter >= prodcount)
								{
									return;
								}
								if(selitem.post_type === 'revision' && !hascurrent)
							  	{
									if(selitem.post_parent != currentid)
									{
										currentid = selitem.post_parent;
										hascurrent = false;
									}
									if(!hascurrent)
									{
										for(var j=0; j<= newvars.length; j++)
										{
											if(newvars[j] === undefined)
												continue;
											if(newvars[j].ID === currentid)
											{
												hascurrent = true;
												curproduct = newvars[j];
												break;
											}
										}
									}
									
								}
								if(hascurrent && i=== 0)
								{
									for(var ii=_data.length-1; ii>=i; ii--) 
									{
										if(_data[ii] === undefined) continue;
										_data[ii+1] = _data[ii];
										var movitem = _data[ii+1];
										if(movitem.post_parent === curproduct.ID && movitem.post_type === 'revision')
										{
											movitem.post_title = curproduct.post_title + movitem.post_title;
										}
										if(ii === i)
										{
											_data[0] = curproduct;
											break;
										}
									}
								}
							}
						}
					}
						
					
					
//					try{
//						_grid.removeCellCssStyles("changed");
//						_grid.setCellCssStyles("changed", _changed);
//					} catch (err) {
//						;
//					}
//					_shouldhandle = false;
//					_grid.resetActiveCell();
//					_grid.invalidate();
//					_shouldhandle = true;	
		     },
			 complete:function (args)
			 {
			  	//uncomment to debug
//			    $('#debuginfo').html(args.responseText);
			 }, error:function (xhr, status, error) 
			  {
			  	//uncomment to debug
				  $('#dimgrid').remove();
				  $('.showajax').remove();
				  DisableAllControls(false);
				  $('#debuginfo').html(xhr.responseText);
			  },
			   async : false
		  }) ;
		
	}
	
	function GenerateAttributes(selitem,isvarcreate)
	{
		isvarcreate = typeof isvarcreate !== 'undefined' ? isvarcreate : false;
	}
	
	function RefreshGroupedItems()
	{
		var arrindexes = [];
		var arrnames = [];
		for(var ir=0; ir < _data.length; ir++)
		{
			if(_data[ir] === undefined) continue;
			var selitem = _data[ir];
			if(selitem.post_type !== 'revision')
			{
				if(selitem._product_adminlink === undefined)
				{
					selitem._product_adminlink = "post.php?post=" + selitem.ID + "&action=edit";
				}
			}
			
		}
	}
	
	function GenerateGroupedItems(bgenattrs,battronly)
	{		
		bgenattrs = typeof bgenattrs !== 'undefined' ? bgenattrs : false;
		var arrindexes = [];
		var arrnames = [];
		
		for(var ir=0; ir < _data.length; ir++)
		{
			if(_data[ir] === undefined) continue;
			var selitem = _data[ir];
			var exists = false;
			if(selitem.post_type === 'revision') continue;
			selitem._product_adminlink = "post.php?post=" + selitem.ID + "&action=edit";
		}
	}
	
	function SaveChanges(control,load,isnext,pdata,pcolumns,pbatch)
	{
		load = typeof load !== 'undefined' ? load : false;
		pbatch = typeof pbatch !== 'undefined' ? pbatch : false;
		isnext = typeof isnext !== 'undefined' ? isnext : true;
		pdata = typeof pdata !== 'undefined' ? pdata : {};
		pcolumns = typeof pcolumns !== 'undefined' ? pcolumns : {};
		var ajaxarr = {};
		ajaxarr.action = 'wordpress_adv_bulk_edit';
		ajaxarr.type = 'saveproducts';
		ajaxarr.nonce = W3ExWABE.nonce;
		ajaxarr.post_type = _current_post_type;
if(!pbatch)
{
		ajaxarr.isfirst = 1;
		var selectedRows = _grid.getSelectedRows();
		var _arrData = [];
		var _arr = {};
		var _arrParents = [];
		var hassale = false;
		for(var ir=0; ir < _arrEdited.length; ir++)
		{
			var row = _arrEdited[ir];
			if(row === undefined) continue;
			var bcon = false;
			for (var key in row) 
			{
			  if (row.hasOwnProperty(key)) 
			  {
			     bcon  = true;
				 break;
			  }
			}
			if(!bcon) continue;
			if(_data[ir] === undefined) continue;
			var selitem = _data[ir];
			if(W3Ex._global_settings.inselectionmode === true)
			{
				if(_dataAllMapIDS[selitem.ID] !== undefined)
				{
					if(_dataAllTemp[_dataAllMapIDS[selitem.ID]] !== undefined)
					{
//						var itemfromall = _dataAllTemp[_dataAllMapIDS[selitem.ID]];
						_dataAllTemp[_dataAllMapIDS[selitem.ID]] = $.extend(true, {}, selitem);
					}
				}
			}
			
			for (var key in row) 
			{
			  if (row.hasOwnProperty(key)) 
			  {
				  var valtoinsert;
				  valtoinsert = selitem[key];
				  
				
				  var coldef = _idmap[_mapfield[key]];
				  if(coldef !== undefined && coldef.type === "customtaxh")
				  {
				  	  valtoinsert = selitem[key + '_ids'];
					  if(valtoinsert === undefined)
					  	valtoinsert = "";
					 
				  }
				  if(key.indexOf('_ids') !== -1)
				  {
				  	  var test = key.replace('_ids','');
					  if(_mapfield[test] !== undefined)
					  	continue;
				  }
				  if(_arr[key] === undefined)
				   	  _arr[key] = [];
					  
				  _arr[key].push(selitem.ID + '$###' + selitem.post_parent + '$###' + valtoinsert);
			  }
			}
		}

		var bcon = false;
		for (var key in _arr) 
		{
		  if (_arr.hasOwnProperty(key)) 
		  {
		      _arr[key] = _arr[key].join('#^#');
			  bcon = true;
		  }
		}
		if(!bcon)
		{
			if(_hascreation)
			{
				if(_addprodtype == "1")
				{
					CreateVariations();
				}else
				{
					CreateProducts();
				}
			}
			return;
		}
		
		var arrColumns = {};
		var newcols = _grid.getColumns();
		var newlen = newcols.length;
		while (newlen--) {
		    var newobj = newcols[newlen];
			arrColumns[newobj.field] = newobj.width;
		}
}

		$('#myGrid').prepend('<div id="dimgrid" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:102;opacity:0.4;filter: alpha(opacity = 40);background-color:grey;"></div>');
		DisableAllControls(true);
		if(control === "savechanges")
		{
			$('#getproducts').parent().append('<div class="showajax"></div>');
			$('.showajax').css('left','290px');
		}else
		{
			$('#pagingholder').append('<div class="showajax"></div>');
			$('.showajax').css({
				left:'190px',
				top:'30px'
			});
		}

		var totalbatches = 0;
		//create batch

		if(pbatch)
		{
			ajaxarr.data = pdata;
//			W3Ex.colsettings[_current_post_type] = pcolumns;
//			ajaxarr.columns = W3Ex.colsettings;
		}else
		{
			ajaxarr.data = _arr;
			W3Ex.colsettings[_current_post_type] = arrColumns;
			ajaxarr.columns = W3Ex.colsettings;
			if($('#collapsefilters').attr('data-state') === "collapse")
			{
				ajaxarr.filters = 0;
			}else
			{
				ajaxarr.filters = 1;
			}
			
		}
		
		
		jQuery.ajax({
		     type : "post",
		     dataType : "json",
		     url : W3ExWABE.ajaxurl,
		     data : ajaxarr,
		     success: function(response) {
			 		$('#dimgrid').remove();
					DisableAllControls(false);
					$('.showajax').remove();
					ShowMemoryUsage(response);
					//update slug
					var newdata = response.products;
					if(newdata !== undefined && newdata !== null && !load  && newdata instanceof Array)
					{
						if(newdata.length > 0)
						{
							var idmaps = [];
							for(var i=0; i < _data.length; i++)
							{
								if(_data[i] === undefined) continue;
								var selitem = _data[i];
								idmaps[selitem.ID] = i;
							}
							for(var j=0; j < newdata.length; j++)
							{
								if(newdata[j] === undefined) continue;
								var selitem = newdata[j];
								if(idmaps[selitem.ID] !== undefined)
								{
									if(_data[idmaps[selitem.ID]] !== undefined)
									{
										var initem = _data[idmaps[selitem.ID]];
										for (var key in selitem) 
										{
										  if (selitem.hasOwnProperty(key)) 
										  {
											  if(key == 'ID' || key == 'post_parent')
											  	continue;
											  {
												  initem[key] = selitem[key];
											  }
										  }
										}
//										initem.post_name = selitem.post_name;
//										initem._product_permalink = selitem._product_permalink;
									}
								}
							}
							while(idmaps.length > 0) 
							{
							    idmaps.pop();
							}
						}
					}
					
					if(response.hasmore !== undefined && !load  && response.hasmore === 1 && !_stopbatches)
					{
						if(response.savingbatch !== undefined)
						{
							$('#bulkeditinfo').text("");
							if($('#stopbatches').length === 0)
							{
								$('#bulkeditinfo').append('<input id="stopbatches" class="button" type="button" value="Stop" />');
							}
							if(response.totalcount !== undefined && response.totalbatches !== undefined)
							{
								totalbatches = Math.ceil(Number(response.totalcount)/Number(response.totalbatches));
								$('#bulkedittext').text(W3Ex._translate_strings["trans_saving_batch"] + ": " + response.savingbatch + "/" + totalbatches);
							}else
							{
								$('#bulkedittext').text(W3Ex._translate_strings["trans_saving_batch"] + ": " + response.savingbatch);
							}
							
						}
						SaveChanges("savechanges",false,true,ajaxarr.data,ajaxarr.columns,true);
						return;
					}
					if(_stopbatches)
					{
						_stopbatches = false;
						$('#stopbatches').remove();
					}
					$('#bulkedittext').text(W3Ex._translate_strings["trans_selected_text"] + ":");
					RefreshSelected();
					if(!$.isEmptyObject(_dataSKUTemp))
					{
						;			  	   
					}else
					{
						while(_arrEdited.length > 0)
						{
						    _arrEdited.pop();
						}
						_changed = {};
					}
					try{
							_grid.removeCellCssStyles("changed");
							_grid.setCellCssStyles("changed", _changed);
						} catch (err)
						{
							;
						}
					_shouldhandle = false;
					_grid.resetActiveCell();
					_grid.invalidate();
					_shouldhandle = true;
					if(_hascreation)
					{
						if(_addprodtype == "1")
						{
							CreateVariations();
						}else
						{
							CreateProducts();
						}
					}
					if(load)
					{
						LoadProducts("pagination",0,isnext);
					}
					
		     },
			 complete:function (args)
			 {
			 	if(args.responseJSON !== undefined && args.responseJSON !== null && args.responseJSON.hasmore !== undefined && !load  && args.responseJSON.hasmore === 1)
				{
					return;
				}
				if(_debugmode)
					$('#debuginfo').html(args.responseText);
				else
					$('#debuginfo').html('');
				
				if(_debugmode)
				{
					var ajaxarr = {};
						ajaxarr.action = 'wordpress_adv_bulk_edit';
						ajaxarr.type = 'getdebuginfo';
						ajaxarr.nonce = W3ExWABE.nonce;
						ajaxarr.data = "debug";
						jQuery.ajax({
						     type : "post",
						     dataType : "json",
						     url : W3ExWABE.ajaxurl,
						     data : ajaxarr,
						     success: function(response) 
							 {
								var curhtml = $('#debuginfo').html();
								curhtml = response.debuginfo + "<br/>" + curhtml;
								$('#debuginfo').html(curhtml);
						     },
							  error:function (xhr, status, error) 
							  {
							  	var curhtml = $('#debuginfo').html();
							  	curhtml = error + "<br/>" + curhtml;
							  	 $('#debuginfo').html(curhtml);
							  }
						  }) ;
				}
			 }, error:function (xhr, status, error) 
			  {
			  	//uncomment to debug
				  $('#dimgrid').remove();
				  $('.showajax').remove();
				  DisableAllControls(false);
				  var serror = "";
				  if(xhr.responseText !== undefined && xhr.responseText !== null)
				 	 serror = xhr.responseText;
				  if(error !== "")
				  	 serror+= error;
				  if(_debugmode)
				  {
				  	  var curhtml = $('#debuginfo').html();
					  curhtml = serror + "<br/>" + curhtml;
					  $('#debuginfo').html(curhtml);
//					  $('#debuginfo').html(xhr.responseText);
				  }
				  else
					  $('#debuginfo').html(serror);
			  }
		  }) ;
	}
	
	$('#butprevious').click(function ()
	{
		var gotopage = parseInt(_currentoffset);
		gotopage--;
		if(isNaN(gotopage) || gotopage <= 0) return;
		var bhasunsaved = false;
		for(var ir=0; ir < _arrEdited.length; ir++)
		{
			var row = _arrEdited[ir];
			if(row === undefined) continue;
			if(_data[ir] === undefined) continue;
			bhasunsaved = true;
			break;
		}
		if(bhasunsaved)
		{
			var ret = confirm("Changes will be lost, continue ? You can save changes first and try again.");
			if (!ret) 
			{
			    return;
			} 
		}
		_currentoffset = gotopage;
		if(_currentoffset == 1)
		{
			$('#gotopagenumber').val('1');
			HandlePaginationData(false,false);
		}
		else
			HandlePaginationData(true,false);		
	});

	$('#gotopage').click(function ()
	{//go to first
//		var gotopage = $('#gotopagenumber').val();
//		gotppage = parseInt(gotopage);
//		if(isNaN(gotopage) || gotopage < 1 || _totalrecords <= _recordslimit) return;
		var bhasunsaved = false;
		for(var ir=0; ir < _arrEdited.length; ir++)
		{
			var row = _arrEdited[ir];
			if(row === undefined) continue;
			if(_data[ir] === undefined) continue;
			bhasunsaved = true;
			break;
		}
		if(bhasunsaved)
		{
			var ret = confirm("Changes will be lost, continue ? You can save changes first and try again.");
			if (!ret) 
			{
			    return;
			} 
		}
		_currentoffset = 1;
		$('#gotopagenumber').val('1');
		HandlePaginationData(false,false);
	});

	$('#butnext').click(function ()
	{
		var gotopage = parseInt(_currentoffset);
		gotopage++;
		if(isNaN(gotopage) || gotopage <= 1 || !_hasnext) return;
		var bhasunsaved = false;
		for(var ir=0; ir < _arrEdited.length; ir++)
		{
			var row = _arrEdited[ir];
			if(row === undefined) continue;
			if(_data[ir] === undefined) continue;
			bhasunsaved = true;
			break;
		}
		if(bhasunsaved)
		{
			var ret = confirm("Changes will be lost, continue ? You can save changes first and try again.");
			if (!ret) 
			{
			    return;
			} 
		}
		_currentoffset = gotopage;
		HandlePaginationData(true,true);
	});
	
//columns
	$("#settingsdialog").dialog({			
	    autoOpen: false,
	    height: 670,
	    width: 820,
	    modal: true,
		draggable:true,
		resizable:true,
		closeOnEscape: true,
		title:W3Ex._translate_strings["trans_column_settings"],
		create: function (event, ui) {
	        $(this).dialog('widget')
	            .css({ position: 'fixed'})
	    },
		open: function( event, ui ) {
			 var d = $('.ui-dialog:visible');
 			 $(d).addClass('dialog-zindez');
		     d[0].style.setProperty('z-index', '300002', 'important');
			 $('.ui-dialog:visible').wrap('<div class="w3exabe w3exabedel" />');
			  $('.ui-widget-overlay').each(function () {
				 $(this).next('.ui-dialog').andSelf().wrapAll('<div class="w3exabe w3exabedel" />');
				});
				var winH = $(window).height() - 180;
				if(winH < 560)
				{
					 $('#settingsdialog').css('height',winH.toString() + 'px');
				}
//			  $('#settingsdialog').css('height','560px');
		},
		close: function( event, ui ) {
			$(".w3exabedel").contents().unwrap();
		},
	 	buttons: {
		  "OK": function() {
  			   try{
  			   		var ColsToLoad = [];
	 				var newcols = _grid.getColumns();
	 				var newcolsold = $.extend(true, [], newcols);
					var changed = false;
					var offset = 0;
					var arrData = {};
					$('.dsettings').each(function()
					{
						
						var id= $(this).attr('data-id');
						$("#bulkdialog tr[data-id='" + id + "']").hide();
						$("#selectdialog tr[data-id='" + id + "']").hide();
						if(!$(this).is(':checked'))
						{
							offset++;
							var len = newcols.length;
							while (len--) {
							    var obj = newcols[len];
								if(obj.field === id)
								{
									newcols.splice(len,1);
									changed = true;
									break;
								}
							}
						}
						else
						{//add
							$("#bulkdialog tr[data-id='" + id + "']").show();
							$("#selectdialog tr[data-id='" + id + "']").show();
							var offset = _allcols.length - newcols.length;
							var hascol = false;
							var len = newcols.length;
							while (len--) {
							    var obj = newcols[len];
								if(obj.field === id)
								{
									hascol = true;
									break;
								}
							}
							if(!hascol)
							{
								len = _allcols.length;
								var shouldsearch = false;
								var found = false;
								var insertobj;
								while (len--) {
								    var obj = _allcols[len];
									if(obj.field === id)
									{
										insertobj = _allcols[len];
		//								var newobj = $.extend(true,{},obj)
										shouldsearch = true;
										continue;
									}
									if(shouldsearch)
									{
										var newlen = newcols.length;
										while (newlen--) {
										    var newobj = newcols[newlen];
											if(newobj.field === obj.field )
											{
												newcols.splice(newlen+1,0,insertobj);
												changed = true;
												found = true;
												break;
											}
										}
									}
									if(found) break;
										
								}
								if(!found)
									newcols.push(insertobj);
							}
							
						}
					});
					
					if(changed)
					{
						var arrColumnsold = [];
						
						var newlenold = newcolsold.length;
						while (newlenold--) {
						    var newobj1 = newcolsold[newlenold];
						    arrColumnsold.push(newobj1.id);
						}
						_grid.setColumns(newcols);
						var newlen = newcols.length;
						while (newlen--) 
						{
							var arritem = {};
						    var newobj = newcols[newlen];
						    if($.inArray(newobj.id,arrColumnsold) === -1)
						    {
								ColsToLoad.push(newobj.id);
							}
						   	   
							arritem.field = newobj.field;
							arritem.width = newobj.width;
							arrData[arritem.field] = arritem.width ;
						}
						if(ColsToLoad.length > 0)
						{
							_grid.setColumns(newcolsold);
						}
						_changedlayout = true;
					}
						
					if(!changed)
					{
						$( this ).dialog( "close" );
						return;
					}	
				}catch(err)
				{
					$( this ).dialog( "close" );
						return;
				}
				var ajaxarr = {};
				ajaxarr.action = 'wordpress_adv_bulk_edit';
				ajaxarr.type = 'savecolumns';
				ajaxarr.post_type = _current_post_type;
				ajaxarr.nonce = W3ExWABE.nonce;
				if(ColsToLoad.length > 0)
				{
//					alert(ColsToLoad[0]);
					var ids = "";
					var dataarray = [];
					if(W3Ex._global_settings.inselectionmode === true)
					{
						dataarray = _dataAllTemp;
						
					}else
					{
						dataarray = _data;
					}
					for(var irow=0; irow < dataarray.length; irow++)
					{
						if(dataarray[irow] === undefined) continue;
						var selitem = dataarray[irow];
						if(ids === "")
						{
							ids = String(selitem.ID);
						}else
						{
							ids = ids + ","+ String(selitem.ID);
						}
					}
					if(ids !== "")
					{
						ajaxarr.colstoload = ColsToLoad;
						ajaxarr.colstoloadids = ids;
						DisableAllControls(true);
						$('#myGrid').prepend('<div id="dimgrid" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:102;opacity:0.4;filter: alpha(opacity = 40);background-color:grey;"></div>');
						$('#getproducts').parent().append('<div class="showajax"></div>');
					}
				}		
//				var $elem = $('.ui-dialog-buttonset > .ui-button:visible').first();
//		        $elem.css('position','relative').append('<div class="showajax"></div>');
//				$('.showajax').css({
//					left:'15px'
//				});
//				$elem.button("disable");
				W3Ex.colsettings[_current_post_type] = arrData;
				ajaxarr.data = W3Ex.colsettings; 
				ajaxarr.post_type = _current_post_type;
				var dlg = $(this);
				jQuery.ajax({
				     type : "post",
				     dataType : "json",
				     url : W3ExWABE.ajaxurl,
				     data : ajaxarr,
				     success: function(response) {
//							$('.showajax').remove();
//							$elem.button("enable");
//							dlg.dialog( "close" );
							ShowMemoryUsage(response);
							if(ColsToLoad.length > 0)
							{
								if(response !== undefined && response !== null && response.products !== undefined && response.products !== null)
								{
									_grid.setColumns(newcols);
									RefreshLoadedFields(response.products);
								}
							}
							_grid.setSelectedRows(_grid.getSelectedRows());
							_grid.invalidate();
							
				     },
					  error:function (xhr, status, error) 
					  {
					  	 $('#dimgrid').remove();
						  $('.showajax').remove();
						  DisableAllControls(false);
						  if(_debugmode)
						  {
						  	var curhtml = $('#debuginfo').html();
							curhtml = xhr.statusText + "<br/>" + xhr.responseText + "<br/>" + curhtml;
							$('#debuginfo').html(curhtml);
						  }
//						  dlg.dialog( "close" );
					  }
				  }) ;
				$( this ).dialog( "close" );
		  },
		  Cancel: function()
		  {
			  $( this ).dialog( "close" );
		  }
		  }
		});

//column views
	$("#dialogtableviews").dialog({			
	    autoOpen: false,
	    height: 570,
	    width: 820,
	    modal: true,
		draggable:true,
		resizable:true,
		closeOnEscape: true,
		title:W3Ex._translate_strings["trans_table_views"],
		create: function (event, ui) {
	        $(this).dialog('widget')
	            .css({ position: 'fixed'})
	    },
		open: function( event, ui ) {
			 var d = $('.ui-dialog:visible');
 			 $(d).addClass('dialog-zindez');
		     d[0].style.setProperty('z-index', '300002', 'important');
			 $('.ui-dialog:visible').wrap('<div class="w3exabe w3exabedel" />');
			  $('.ui-widget-overlay').each(function () {
				 $(this).next('.ui-dialog').andSelf().wrapAll('<div class="w3exabe w3exabedel" />');
				});
				var winH = $(window).height() - 180;
				if(winH < 460)
				{
					 $('#dialogtableviews').css('height',winH.toString() + 'px');
				}
		},
		close: function( event, ui ) {
			$(".w3exabedel").contents().unwrap();
		},
	 	buttons: {
		  "OK": function() {
  			   try{
					var radio = $('input[name=viewdialog]:checked','#tableviews').val();
					var ajaxarr = {};
					ajaxarr.action = 'wordpress_adv_bulk_edit';
					ajaxarr.type = 'newview';
					ajaxarr.nonce = W3ExWABE.nonce;
					if(W3Ex.w3exabe_listviews === undefined)
						W3Ex.w3exabe_listviews = {};
					var doajax = true;
					var refresh = true;
					var ColsToLoad = [];
	 				var newcols1 = _grid.getColumns();
	 				var newcolsold = $.extend(true, [], newcols1);
					switch(radio){
						case "savenew":
						{
							
							var newstyle = $('#viewinputnew').val();
							newstyle = $.trim(newstyle);
							if(newstyle === "")
							{
								doajax = false;
							}else
							{
								var arrColumns = {};
								var newcols = _grid.getColumns();
								var newlen = newcols.length;
								while (newlen--) {
								    var newobj = newcols[newlen];
									arrColumns[newobj.field] = newobj.width;
								}
								ajaxarr.viewname = newstyle;
								ajaxarr.type = 'newview';
								ajaxarr.columns = arrColumns;
								ajaxarr.data = arrColumns;
								W3Ex.w3exabe_listviews[newstyle] = arrColumns;
							}
							
						}break;
						case "save":
						{
							var newstyle = $('#viewselectreplace').val();
							newstyle = $.trim(newstyle);
							if(newstyle === "")
							{
								doajax = false;
							}else
							{
								var arrColumns = {};
								var newcols = _grid.getColumns();
								var newlen = newcols.length;
								while (newlen--) {
								    var newobj = newcols[newlen];
									arrColumns[newobj.field] = newobj.width;
								}
								ajaxarr.viewname = newstyle;
								ajaxarr.type = 'newview';
								ajaxarr.columns = arrColumns;
								ajaxarr.data = arrColumns;
								W3Ex.w3exabe_listviews[newstyle] = arrColumns;
							}
							
						}break;
						case "edit":
						{
//							var newstyle = $('#viewselectreplace').val();
//							newstyle = $.trim(newstyle);
//							if(newstyle === "")
//							{
//								doajax = false;
//							}else
//							{
								ajaxarr.type = 'editviews';
								ajaxarr.data = W3Ex.w3exabe_listviews;
//							}
							
						}break;
						case "load":
						{
							_changedlayout = true;
							refresh = false;
							var newstyle = $('#viewselectload').val();
							newstyle = $.trim(newstyle);
							if(newstyle === "") {$( this ).dialog( "close" ); return;}
							if(W3Ex.w3exabe_listviews === undefined) {$( this ).dialog( "close" ); return;}
							if(W3Ex.w3exabe_listviews[newstyle] === undefined) {$( this ).dialog( "close" ); return;}
							var cols = W3Ex.w3exabe_listviews[newstyle];
							var hasid = false;
							var hastitle = false;
							var newcols = [];
							for (var key in cols) 
							{
							  if (cols.hasOwnProperty(key)) {
				//			  		if(key === "ID") continue;
							  	   if(_mapfield[key] === undefined) continue;
							  	   var col = _idmap[_mapfield[key]];
								   if(col === undefined) continue;
								   col.visible = true;
								   var cwidth = parseInt(cols[key]);
								   if(isNaN(cwidth)) cwidth = 50;
								   if(cwidth < 50) cwidth = 50;
							       col.width = cwidth;
								   for(var i=0; i<_allcols.length;i++)
								   {
								   		var column = _allcols[i];
										if(column.field === key)
										{
											if(key === "ID")
											{
												hasid = true;
											}
											if(key === "post_title")
											{
												hastitle = true;
											}
											column.width = cwidth;
											newcols.unshift(column);
											break;
										}
								   }
			//					   	$('.dsettings[data-id="'+key+'"]').each(function()
			//						{
			//							$(this).prop('checked', true);
			//							var id = $(this).attr('data-id');
			//							$("#bulkdialog tr[data-id='" + id + "']").show();
			//							$("#selectdialog tr[data-id='" + id + "']").show();
			//							var id = $(this).attr('id');
			//							$('#' + id + '_check').css('visibility','visible');
			//							$('#' + id + ' + label').css('font-weight','bold');
			//						})
			//						
							  }
							 }
							 if(!hastitle)
							{
								for(var i=0; i<_allcols.length;i++)
							   {
							   		var column = _allcols[i];
									if(column.field === "post_title")
									{
										var newcol = $.extend(true, {}, column);
										newcol.width = 250;
										newcols.unshift(newcol);
										break;
									}
							   }
							}
							if(!hasid)
							{
								for(var i=0; i<_allcols.length;i++)
							   {
							   		var column = _allcols[i];
									if(column.field === "ID")
									{
										var newcol = $.extend(true, {}, column);
										newcol.width = 60;
										newcols.unshift(newcol);
										break;
									}
							   }
							}
							newcols.unshift(checkboxSelector.getColumnDefinition());
							_grid.setColumns(newcols);
							var has = false;
							var dataid = "";
							var id = "";
//							$('label','#settingsdialog').css('font-weight','normal');
							$('label','#settingsdialog').attr('style', 'font-weight:normal !important;');
							$('img','#settingsdialog').css('visibility','hidden');
			//				if($(this).is(':checked'))
			//				{
			//					$('#' + id + '_check').css('visibility','visible');
			//					$('#' + id + ' + label').css('font-weight','bold');
			//				}
			//				else
			//				{
			//					$('#' + id + '_check').css('visibility','hidden');
			//					$('#' + id + ' + label').css('font-weight','normal');
			//				}
							$('.dsettings').each(function()
							{
								has = false;
								id = $(this).attr('id');
								dataid = $(this).attr('data-id');
								for(var i=0; i<newcols.length;i++)
							   	{
							   		var column = newcols[i];
									if(column.field === dataid)
									{
										has = true;
										break;
									}
							   	}
							   	if(has)
							   	{
							   	   	$("#bulkdialog tr[data-id='" + dataid + "']").show();
									$("#selectdialog tr[data-id='" + dataid + "']").show();
									$('#' + id + '_check').css('visibility','visible');
//									$('#' + id + ' + label').css('font-weight','bold');
									$('#' + id + ' + label').attr('style', 'font-weight:bold !important;');
									$(this).prop('checked',true);
							   	}else
								{
									$("#bulkdialog tr[data-id='" + dataid + "']").hide();
									$("#selectdialog tr[data-id='" + dataid + "']").hide();
									$(this).prop('checked',false);
								}
							});
									var arrColumnsold = [];
						
									var newlenold = newcolsold.length;
									while (newlenold--) {
									    var newobj1 = newcolsold[newlenold];
									    arrColumnsold.push(newobj1.id);
									}
									var arrData = {};
									var newlen = newcols.length;
									while (newlen--) 
									{
										var arritem = {};
									    var newobj = newcols[newlen];
									    if($.inArray(newobj.id,arrColumnsold) === -1)
									    {
											ColsToLoad.push(newobj.id);
										}
										arritem.field = newobj.field;
										arritem.width = newobj.width;
										arrData[arritem.field] = arritem.width ;
									}
									ajaxarr.data = arrData;
									ajaxarr.type = 'savecolumns';
									ajaxarr.post_type = _current_post_type;
									if(ColsToLoad.length > 0)
									{
										_grid.setColumns(newcolsold);
									}
											
									
						}break;
						default:
							break;
					}
					if(doajax)
					{
						if(refresh)
						{
							var cols = W3Ex.w3exabe_listviews;

							$('#viewselectload')
							    .find('option')
							    .remove();
							$('#viewselectreplace')
							    .find('option')
							    .remove();
							$('#viewselectedit')
							    .find('option')
							    .remove();


							for (var key in cols) 
							{
							  if (cols.hasOwnProperty(key)) 
							  {
							  	  $('#viewselectload')
							         .append($("<option></option>")
							         .attr("value",key)
							         .text(key)); 
								   $('#viewselectreplace')
							         .append($("<option></option>")
							         .attr("value",key)
							         .text(key));
								   $('#viewselectedit')
							         .append($("<option></option>")
							         .attr("value",key)
							         .text(key));
							  }
							}
						}
						
			
//						var $elem = $('.ui-dialog-buttonset > .ui-button:visible').first();
//				        $elem.css('position','relative').append('<div class="showajax"></div>');
//						$('.showajax').css({
//							left:'15px'
//						});
//						$elem.button("disable");
						
//						var dlg = $(this);
						if(ColsToLoad.length > 0)
						{
							var ids = "";
							var dataarray = [];
							if(W3Ex._global_settings.inselectionmode === true)
							{
								dataarray = _dataAllTemp;
								
							}else
							{
								dataarray = _data;
							}
							for(var irow=0; irow < dataarray.length; irow++)
							{
								if(dataarray[irow] === undefined) continue;
								var selitem = dataarray[irow];
								if(ids === "")
								{
									ids = String(selitem.ID);
								}else
								{
									ids = ids + ","+ String(selitem.ID);
								}
							}
							if(ids !== "")
							{
								ajaxarr.colstoload = ColsToLoad;
								ajaxarr.colstoloadids = ids;
								DisableAllControls(true);
								$('#myGrid').prepend('<div id="dimgrid" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:102;opacity:0.4;filter: alpha(opacity = 40);background-color:grey;"></div>');
								$('#getproducts').parent().append('<div class="showajax"></div>');
							}
						}		
						jQuery.ajax({
						     type : "post",
						     dataType : "json",
						     url : W3ExWABE.ajaxurl,
						     data : ajaxarr,
						     success: function(response) 
						     {
						     	ShowMemoryUsage(response);
								if(ColsToLoad.length > 0)
								{
									if(response !== undefined && response !== null && response.products !== undefined && response.products !== null)
									{
										_grid.setColumns(newcols);
										RefreshLoadedFields(response.products);
									}
								}
								
						     },
							  error:function (xhr, status, error) 
							  {
								  $('#dimgrid').remove();
								  $('.showajax').remove();
								  DisableAllControls(false);
								  if(_debugmode)
								  {
								  	var curhtml = $('#debuginfo').html();
									curhtml = xhr.statusText + "<br/>" + xhr.responseText + "<br/>" + curhtml;
									$('#debuginfo').html(curhtml);
								  }
//								  dlg.dialog( "close" );
							  }
						  }) ;
//						   dlg.dialog( "close" );
					}
					
						
				}catch(err)
				{
					$( this ).dialog( "close" );
						return;
				}
				$( this ).dialog( "close" );
				
		  },
		  Cancel: function()
		  {
			  $( this ).dialog( "close" );
		  }
		  }
		});
		
	$('#settings').click(function()
	{
		$("#settingsdialog").dialog("open");	
	});

	$('#pluginsettingsbut').click(function()
	{
		$("#pluginsettings").dialog("open");	
	});
	
	$('#viewdialogbut').click(function()
	{
		$("#dialogtableviews").dialog("open");	
	});
	
	
	$('#customfieldsbut').click(function()
	{
		$("#customfieldsdialog").dialog("open");	
	});
	
	$('#findcustomfieldsbut').click(function()
	{
		$("#findcustomfieldsdialog").dialog("open");	
	});
	
	
	$('body').on('click','#settingsdialog .dsettings',function()
	{
		var checkdiv = '<img src ="' + W3Ex.imagepath + 'images/tick.png' + '" />';
		var id= $(this).attr('id');
		if($(this).is(':checked'))
		{
			$('#' + id + '_check').css('visibility','visible');
//			$('#' + id + ' + label').css('font-weight','bold');
			$('#' + id + ' + label').attr('style', 'font-weight:bold !important;');
		}
		else
		{
			$('#' + id + '_check').css('visibility','hidden');
//			$('#' + id + ' + label').css('font-weight','normal');
			$('#' + id + ' + label').attr('style', 'font-weight:normal !important;');
		}
	});

	function SelectUpdateField(field,selitem,value,rowid,action,params,ignorecase,found,special)
	{
		var col = _idmap[_mapfield[field]];
		if(col === undefined) return;
		if(value === undefined) value = "";
		if(selitem[field] === undefined)
			selitem[field] = "";
//		if(col.scope !== undefined)
//		{
//			if(col.scope == SCOPE.PRODALL)
//			{
//				if(selitem.post_type === 'revision')
//				{
//					found.notfoundcon = true;
//					return;
//				}
//			}
//			
//			if(col.scope == SCOPE.PRODSVAR)
//			{
//				if(selitem.post_type === 'product')
//				{
//					if(selitem.haschildren !== undefined)
//					{
//						found.notfoundcon = true;
//						return;
//					}
//				}
//			}
//		}
		if(field == "grouped_items") 
		{
			if(selitem.product_type != 'simple')
			{
				return;
			}
		}
		if(col.type === 'customattrs')
		{
			var which = params['_custom_attributeswhich'];
			var selvalue = "";
			
			if(selitem._custom_attributes !== undefined && selitem._custom_attributes instanceof Array)
			{
				if(action == "empty")
				{
					if(selitem._custom_attributes.length === 0)
					{
						found.foundcon = true;
					}else
					{
						found.notfoundcon = true;
					}
					return;
				}
				var arr = selitem._custom_attributes;
				found.foundcon = false;
				for(var i=0; i < arr.length; i++)
				{
					if(which === 'name')
					{
						if(arr[i] !== undefined)
							selvalue = arr[i].name;
					}else
					{
						if(arr[i] !== undefined)
							selvalue = arr[i].value;
					}
					if(selvalue === undefined || selvalue === null)
						 selvalue = "";
							
					if(ignorecase[field] !== undefined && ignorecase[field] && special[field] !== "regexp")
					{
						selvalue = selvalue.toLowerCase();
						value =  String(value);
						value = value.toLowerCase();
					}
					
					switch(action)
					{
						case "con":
						{
							if(special[field] !== undefined)
							{
								if(special[field] === "split")
								{
									var band = true;
									if(special[field + "splittype"] !== undefined)
									{
										if(special[field + "splittype"] === "or")
											band = false;
									}
									var lines = value.split(",");
									var bfound = false;
									if(band)
										bfound = true;
									for(var i=0; i<lines.length; i++)
									{
										var line = lines[i];
										if(!band)
										{
											if(selvalue.indexOf(line) >= 0)
											{
												bfound = true;
												break;
											}
										}else
										{
											if(selvalue.indexOf(line) === -1)
											{
												bfound = false;
												break;
											}
										}
										
									}
									if(bfound)
									{
										found.foundcon = true;
									}else
									{
										found.notfoundcon = true;
									}
								}else
								{//regexp
									var flags = "g";
									if(ignorecase[field] !== undefined && ignorecase[field])
									{
										flags+= "i";
									}
									if(col.type === "multitext")
									{
										flags+= "m";
									}
									var myRe = new RegExp(value, flags);
									var retarr = myRe.exec(selvalue);
									if($.isArray(retarr))
									{
										if(retarr.length > 0)
										{
											found.foundcon = true;
										}else
										{
											found.notfoundcon = true;
										}
									}else
									{
										found.notfoundcon = true;
									}
									
								}
								
							}else
							{
								if(selvalue.indexOf(value) >= 0)
								{
									found.foundcon = true;
								}else
								{
									found.notfoundcon = true;
								}
							}
							
						}break;
						case "notcon":
						{
							if(special[field] !== undefined)
							{
								if(special[field] === "split")
								{
									var band = true;
									if(special[field + "splittype"] !== undefined)
									{
										if(special[field + "splittype"] === "or")
											band = false;
									}
									var lines = value.split(",");
									var bfound = false;
									if(band)
										bfound = true;
									for(var i=0; i<lines.length; i++)
									{
										var line = lines[i];
										if(!band)
										{
											if(selvalue.indexOf(line) >= 0)
											{
												bfound = true;
												break;
											}
										}else
										{
											if(selvalue.indexOf(line) === -1)
											{
												bfound = false;
												break;
											}
										}
										
									}
									if(bfound)
									{
										found.notfoundcon = true;
									}else
									{
										found.foundcon = true;
									}
								}else
								{//regexp
									var flags = "g";
									if(ignorecase[field] !== undefined && ignorecase[field])
									{
										flags+= "i";
									}
									if(col.type === "multitext")
									{
										flags+= "m";
									}
									var myRe = new RegExp(value, flags);
									var retarr = myRe.exec(selvalue);
									if($.isArray(retarr))
									{
										if(retarr.length > 0)
										{
											found.notfoundcon = true;
										}else
										{
											found.foundcon = true;
										}
									}else
									{
										found.foundcon = true;
									}
									
								}
								
							}else
							{
								if(selvalue.indexOf(value) == -1)
								{
									found.foundcon = true;
								}else
								{
									found.notfoundcon = true;
								}
							}
							
						}break;
						case "start":
						{
							if(special[field] !== undefined)
							{
								if(special[field] === "split")
								{
									var band = true;
									if(special[field + "splittype"] !== undefined)
									{
										if(special[field + "splittype"] === "or")
											band = false;
									}
									var lines = value.split(",");
									var bfound = false;
									if(band)
										bfound = true;
									for(var i=0; i<lines.length; i++)
									{
										var line = lines[i];
										if(!band)
										{
											if(selvalue.indexOf(line) === 0)
											{
												bfound = true;
												break;
											}
										}else
										{
											if(selvalue.indexOf(line) !== 0)
											{
												bfound = false;
												break;
											}
										}
										
									}
									if(bfound)
									{
										found.foundcon = true;
									}else
									{
										found.notfoundcon = true;
									}
								}else
								{//regexp
									var flags = "g";
									if(ignorecase[field] !== undefined && ignorecase[field])
									{
										flags+= "i";
									}
									if(col.type === "multitext")
									{
										flags+= "m";
									}
									var myRe = new RegExp(value, flags);
									var retarr = myRe.exec(selvalue);
									if($.isArray(retarr))
									{
										if(retarr.length > 0)
										{
											found.foundcon = true;
										}else
										{
											found.notfoundcon = true;
										}
									}else
									{
										found.notfoundcon = true;
									}
									
								}
								
							}else
							{
								if(selvalue.indexOf(value) == 0)
								{
									found.foundcon = true;
								}else
								{
									found.notfoundcon = true;
								}
							}
							
						}break;
						case "end":
						{
							if(special[field] !== undefined)
							{
								if(special[field] === "split")
								{
									var band = true;
									if(special[field + "splittype"] !== undefined)
									{
										if(special[field + "splittype"] === "or")
											band = false;
									}
									var lines = value.split(",");
									var bfound = false;
									if(band)
										bfound = true;
									for(var i=0; i<lines.length; i++)
									{
										var line = lines[i];
										if(!band)
										{
											var n = selvalue.lastIndexOf(line);
											if(n > 0)
											{
												if((n + line.length) === selvalue.length)
												{
													bfound = true;
													break;
												}
											}
										}else
										{
											var n = selvalue.lastIndexOf(line);
											if(n > 0)
											{
												if((n + line.length) !== selvalue.length)
												{
													bfound = false;
													break;
												}
											}
										}
										
									}
									if(bfound)
									{
										found.foundcon = true;
									}else
									{
										found.notfoundcon = true;
									}
								}else
								{//regexp
									var flags = "g";
									if(ignorecase[field] !== undefined && ignorecase[field])
									{
										flags+= "i";
									}
									if(col.type === "multitext")
									{
										flags+= "m";
									}
									var myRe = new RegExp(value, flags);
									var retarr = myRe.exec(selvalue);
									if($.isArray(retarr))
									{
										if(retarr.length > 0)
										{
											found.foundcon = true;
										}else
										{
											found.notfoundcon = true;
										}
									}else
									{
										found.notfoundcon = true;
									}
									
								}
								
							}else
							{
								var n = selvalue.lastIndexOf(value);
								if(n > 0)
								{
									if((n + value.length) == selvalue.length)
									{
										found.foundcon = true;
									}else
									{
										found.notfoundcon = true;
									}
								}
							}
							
							
						}break;
						case "iscon":
						{
							if(value.indexOf('\n') != 0 || value.indexOf('\r\n') != 0)
							{
								var lines = value.split(/\r\n|\r|\n/g);
								var bfound = false;
								for(var i=0; i<lines.length; i++)
								{
									var line = lines[i];
									line = $.trim(line);
									if(line === "") continue;
									if(line.indexOf(selvalue) >= 0)
									{
										bfound = true;
										break;
									}
								}
								if(bfound)
								{
									found.foundcon = true;
								}else
								{
									found.notfoundcon = true;
								}
							}else
							{
								if(value.indexOf(selvalue) >= 0)
								{
									found.foundcon = true;
								}else
								{
									found.notfoundcon = true;
								}
							}
						}break;
						default:break;
					}
					if(action === 'notcon')
					{
						if(found.notfoundcon === true)
						{
							found.foundcon = false;
							return;
						}
						if(found.foundcon === true)
							continue;
					}
					if(found.foundcon === true)
						return;
				}
			}else
			{
				if(action == "empty")
				{
					
					found.foundcon = true;
					return;
				}
			}
//			var selvalue = selitem[field];
			
			
			return;
		}
		
		if(col.type === undefined || col.type === "customtax" || col.type === "customtaxh" || col.type === "text" || col.type === "multitext" )
		{//text field
			var selvalue = selitem[field];
			if(action == "empty")
			{
				if(selitem[field] === "" || selitem[field] === undefined)
				{
					found.foundcon = true;
				}else
				{
					found.notfoundcon = true;
				}
			}
			if(selvalue === undefined || selvalue === null)
				selvalue = "";
			if(ignorecase[field] !== undefined && ignorecase[field] && special[field] !== "regexp")
			{
				selvalue = selvalue.toLowerCase();
				value =  String(value);
				value = value.toLowerCase();
			}
			
			switch(action)
			{
				case "con":
				{
					if(special[field] !== undefined)
					{
						if(special[field] === "split")
						{
							var band = true;
							if(special[field + "splittype"] !== undefined)
							{
								if(special[field + "splittype"] === "or")
									band = false;
							}
							var lines = value.split(",");
							var bfound = false;
							if(band)
								bfound = true;
							for(var i=0; i<lines.length; i++)
							{
								var line = lines[i];
								if(!band)
								{
									if(selvalue.indexOf(line) >= 0)
									{
										bfound = true;
										break;
									}
								}else
								{
									if(selvalue.indexOf(line) === -1)
									{
										bfound = false;
										break;
									}
								}
								
							}
							if(bfound)
							{
								found.foundcon = true;
							}else
							{
								found.notfoundcon = true;
							}
						}else
						{//regexp
							var flags = "g";
							if(ignorecase[field] !== undefined && ignorecase[field])
							{
								flags+= "i";
							}
							if(col.type === "multitext")
							{
								flags+= "m";
							}
							var myRe = new RegExp(value, flags);
							var retarr = myRe.exec(selvalue);
							if($.isArray(retarr))
							{
								if(retarr.length > 0)
								{
									found.foundcon = true;
								}else
								{
									found.notfoundcon = true;
								}
							}else
							{
								found.notfoundcon = true;
							}
							
						}
						
					}else
					{
						if(selvalue.indexOf(value) >= 0)
						{
							found.foundcon = true;
						}else
						{
							found.notfoundcon = true;
						}
					}
					
				}break;
				case "notcon":
				{
					if(special[field] !== undefined)
					{
						if(special[field] === "split")
						{
							var band = true;
							if(special[field + "splittype"] !== undefined)
							{
								if(special[field + "splittype"] === "or")
									band = false;
							}
							var lines = value.split(",");
							var bfound = false;
							if(band)
								bfound = true;
							for(var i=0; i<lines.length; i++)
							{
								var line = lines[i];
								if(!band)
								{
									if(selvalue.indexOf(line) >= 0)
									{
										bfound = true;
										break;
									}
								}else
								{
									if(selvalue.indexOf(line) === -1)
									{
										bfound = false;
										break;
									}
								}
								
							}
							if(bfound)
							{
								found.notfoundcon = true;
							}else
							{
								found.foundcon = true;
							}
						}else
						{//regexp
							var flags = "g";
							if(ignorecase[field] !== undefined && ignorecase[field])
							{
								flags+= "i";
							}
							if(col.type === "multitext")
							{
								flags+= "m";
							}
							var myRe = new RegExp(value, flags);
							var retarr = myRe.exec(selvalue);
							if($.isArray(retarr))
							{
								if(retarr.length > 0)
								{
									found.notfoundcon = true;
								}else
								{
									found.foundcon = true;
								}
							}else
							{
								found.foundcon = true;
							}
							
						}
						
					}else
					{
						if(selvalue.indexOf(value) == -1)
						{
							found.foundcon = true;
						}else
						{
							found.notfoundcon = true;
						}
					}
					
				}break;
				case "start":
				{
					if(special[field] !== undefined)
					{
						if(special[field] === "split")
						{
							var band = true;
							if(special[field + "splittype"] !== undefined)
							{
								if(special[field + "splittype"] === "or")
									band = false;
							}
							var lines = value.split(",");
							var bfound = false;
							if(band)
								bfound = true;
							for(var i=0; i<lines.length; i++)
							{
								var line = lines[i];
								if(!band)
								{
									if(selvalue.indexOf(line) === 0)
									{
										bfound = true;
										break;
									}
								}else
								{
									if(selvalue.indexOf(line) !== 0)
									{
										bfound = false;
										break;
									}
								}
								
							}
							if(bfound)
							{
								found.foundcon = true;
							}else
							{
								found.notfoundcon = true;
							}
						}else
						{//regexp
							var flags = "g";
							if(ignorecase[field] !== undefined && ignorecase[field])
							{
								flags+= "i";
							}
							if(col.type === "multitext")
							{
								flags+= "m";
							}
							var myRe = new RegExp(value, flags);
							var retarr = myRe.exec(selvalue);
							if($.isArray(retarr))
							{
								if(retarr.length > 0)
								{
									found.foundcon = true;
								}else
								{
									found.notfoundcon = true;
								}
							}else
							{
								found.notfoundcon = true;
							}
							
						}
						
					}else
					{
						if(selvalue.indexOf(value) == 0)
						{
							found.foundcon = true;
						}else
						{
							found.notfoundcon = true;
						}
					}
					
				}break;
				case "end":
				{
					if(special[field] !== undefined)
					{
						if(special[field] === "split")
						{
							var band = true;
							if(special[field + "splittype"] !== undefined)
							{
								if(special[field + "splittype"] === "or")
									band = false;
							}
							var lines = value.split(",");
							var bfound = false;
							if(band)
								bfound = true;
							for(var i=0; i<lines.length; i++)
							{
								var line = lines[i];
								if(!band)
								{
									var n = selvalue.lastIndexOf(line);
									if(n > 0)
									{
										if((n + line.length) === selvalue.length)
										{
											bfound = true;
											break;
										}
									}
								}else
								{
									var n = selvalue.lastIndexOf(line);
									if(n > 0)
									{
										if((n + line.length) !== selvalue.length)
										{
											bfound = false;
											break;
										}
									}
								}
								
							}
							if(bfound)
							{
								found.foundcon = true;
							}else
							{
								found.notfoundcon = true;
							}
						}else
						{//regexp
							var flags = "g";
							if(ignorecase[field] !== undefined && ignorecase[field])
							{
								flags+= "i";
							}
							if(col.type === "multitext")
							{
								flags+= "m";
							}
							var myRe = new RegExp(value, flags);
							var retarr = myRe.exec(selvalue);
							if($.isArray(retarr))
							{
								if(retarr.length > 0)
								{
									found.foundcon = true;
								}else
								{
									found.notfoundcon = true;
								}
							}else
							{
								found.notfoundcon = true;
							}
							
						}
						
					}else
					{
						var n = selvalue.lastIndexOf(value);
						if(n > 0)
						{
							if((n + value.length) == selvalue.length)
							{
								found.foundcon = true;
							}else
							{
								found.notfoundcon = true;
							}
						}
					}
					
					
				}break;
				case "iscon":
				{
					if(value.indexOf('\n') != 0 || value.indexOf('\r\n') != 0)
					{
						var lines = value.split(/\r\n|\r|\n/g);
						var bfound = false;
						for(var i=0; i<lines.length; i++)
						{
							var line = lines[i];
							line = $.trim(line);
							if(line === "") continue;
							if(line.indexOf(selvalue) >= 0)
							{
								bfound = true;
								break;
							}
						}
						if(bfound)
						{
							found.foundcon = true;
						}else
						{
							found.notfoundcon = true;
						}
					}else
					{
						if(value.indexOf(selvalue) >= 0)
						{
							found.foundcon = true;
						}else
						{
							found.notfoundcon = true;
						}
					}
				}break;
				default:break;
			}
			return;
		}
		if(col.type === 'set')
		{
			if(value == selitem[field])
			{
				found.foundcon = true;
			}else
			{
				found.notfoundcon = true;
			}
			return;
		}
		if(col.type === 'float2' || col.type === 'float3' || col.type === 'int')
		{
			var usecommas = false;
			if(W3Ex.sett_usecomma !== undefined && W3Ex.sett_usecomma == 1)
			{
				usecommas = true;
			}
			if(usecommas)
			{
				value = replaceAll(value,',', '.');	
			}
			var bulkvalue = parseFloat(value);
			if(isNaN(bulkvalue))
			{
				found.notfoundcon = true;
				return;
			}
//			bulkvalue = Number(bulkvalue);
			var pricestr = selitem[field];
			if(pricestr === "")
				pricestr = "0";
			if(usecommas)
			{
				pricestr = replaceAll(pricestr,',', '.');	
			}
			var price = parseFloat(pricestr);
			if(action == "empty")
			{
				if(selitem[field] == "" || selitem[field] === undefined)
				{
					found.foundcon = true;
				}else
				{
					found.notfoundcon = true;
				}
				return;
			}
			if(!isNaN(bulkvalue) && bulkvalue >= 0 && !isNaN(price))
			{
				switch(action)
				{
					case "more":
					{
						if(price > bulkvalue)
						{
							found.foundcon = true;
						}else
						{
							found.notfoundcon = true;
						}
					}break;
					case "less":
					{
						if(price < bulkvalue)
						{
							found.foundcon = true;
						}else
						{
							found.notfoundcon = true;
						}
					}break;
					case "equal":
					{
						if(price == bulkvalue)
						{
							found.foundcon = true;
						}else
						{
							found.notfoundcon = true;
						}
						
					}break;
					case "moree":
					{
						if(price >= bulkvalue)
						{
							found.foundcon = true;
						}else
						{
							found.notfoundcon = true;
						}
					}break;
					case "lesse":
					{
						if(price<= bulkvalue)
						{
							found.foundcon = true;
						}else
						{
							found.notfoundcon = true;
						}
					}break;
					default:break;
				}
				
			}
		}
	}

	function HandleSelectUpdate(params)
	{
		var selectedRows = [];
		var type = $('#selectproduct').val();
		var add = $('#selectany').val();
		var select = $('#selectselect').val();
		var ignorecase = {};
		var special = {};
		$('.selectifignorecase:visible:checked').each(function ()
		{
			var itemid = $(this).attr('data-id');
			ignorecase[itemid] = $(this).is(':checked');
		})
		
		$('.checkboxifspecial:visible:checked').each(function ()
		{
			var itemid = $(this).attr('data-id');
			var type = $(this).siblings('.selectsplit').val();
			special[itemid] = type;
			if(type === "split")
			{
				special[itemid + "splittype"] = $(this).siblings('.selectsplitand').val();
			}
			
		})
		
		var found = {
			foundcon:false,
			notfoundcon:false
		};
		for(var irow=0; irow < _data.length; irow++)
		{
			if(_data[irow] === undefined) continue;
			var selitem = _data[irow];
			if( type === "prod")
			{
//				if(selitem.post_type !== undefined)
					if(selitem.post_type === 'revision')
					    continue;
			}
			if( type === "var")
			{
//				if(selitem.post_type !== undefined)
					if(selitem.post_type === 'product')
					    continue;
			}
			
			
			for (var key in params) {
			  if (params.hasOwnProperty(key)) {
			     if(key.indexOf('value') === -1)
				 {//key e actions
//				 	BulkUpdateField(field,selitem,value,rowid,action)
				 	if(params[key + 'value'] !== undefined)
				 	    SelectUpdateField(key,selitem,params[key + 'value'],irow,params[key],params,ignorecase,found,special);
					else
						SelectUpdateField(key,selitem,"",irow,params[key],params,ignorecase,found,special);
				 }
			  }
			}
			if(add == "any")
			{
				if(found.foundcon)
				{
					selectedRows.push(irow);
				}
			}else
			{
				if(found.foundcon && !found.notfoundcon)
				{
					selectedRows.push(irow);
				}
			}
			found.foundcon = false;
			found.notfoundcon = false;
		}
		if(select == "select")
		{
			var selectedRows1 = _grid.getSelectedRows();
			selectedRows1 = selectedRows1.concat(selectedRows);
			_grid.setSelectedRows(selectedRows1);
		}else
		{
			var sel1= _grid.getSelectedRows();
			var temp = {}, i, result = [];

		    for (i = 0; i < selectedRows.length; i++) {
		        temp[selectedRows[i]] = true;
		    }

		    for (i = 0; i < sel1.length; i++) {
		        if (!(sel1[i] in temp)) {
		            result.push(sel1[i]);
		        }
		    }
			_grid.setSelectedRows(result);
		}
		 
	}
	
	$('body').on('click','#selectdialog .checkboxifspecial',function()
	{
		var id= $(this).attr('id');
		if($(this).is(':checked'))
		{
			$(this).siblings('.selectsplit').prop('disabled',false);
			$(this).siblings('.selectsplitand').prop('disabled',false);
		}
		else
		{
			$(this).siblings('.selectsplit').prop('disabled',true);
			$(this).siblings('.selectsplitand').prop('disabled',true);
		}
	});
	
	$("#selectdialog").dialog({			
    autoOpen: false,
    height: 620,
    width: 1150,
    modal: true,
	draggable:true,
	resizable:true,
	closeOnEscape: true,
	title:"Selection Manager",
	create: function (event, ui) {
        $(this).dialog('widget')
            .css({ position: 'fixed'})
    },
	open: function( event, ui ) {
		 var d = $('.ui-dialog:visible');
 		 $(d).addClass('dialog-zindez');
		 d[0].style.setProperty('z-index', '300002', 'important');
		 $('.ui-dialog:visible').wrap('<div class="w3exabe w3exabedel" />');
		  $('#selectdialog').css('height','500px');
		  var winH = $(window).height() - 180;
			if(winH < 500)
			{
				 $('#selectdialog').css('height',winH.toString() + 'px');
			}
		  $('.ui-widget-overlay').each(function () {
			 $(this).next('.ui-dialog').andSelf().wrapAll('<div class="w3exabe w3exabedel" />');
			
	});
		$('#selectdialog .selectset').each(function(){
			var item = $(this);
			if(!item.prop('checked'))
			{
				$('#selectdialog #select' + item.attr('data-id')).prop("disabled",true);
			}else
			{
				$('#selectdialog #select' + item.attr('data-id')).prop("disabled",false);
			}
		})
	},
	close: function( event, ui ) {
		$(".w3exabedel").contents().unwrap();
	},
 	buttons: {
	  "OK": function() {
	  	var params = {};
		$('#selectdialog .selectvalue:visible').each(function(){
			var item = $(this);
//			if(!item.is(':visible')) continue;
			var value = item.val();
			var id = item.attr('data-id');
			if(value != "")
			{
				params[id] = $('#select'+ id).val();
				params[id + 'value'] = value;
				if(id === '_custom_attributes')
				{
					params[id + 'which'] = $('#select_custom_attributes_what').val();
				}
//				if(params[id] === "empty")
//					params[id + 'value'] = 0;
//				if(id === "_sale_price")
//				{
//					if(params[id] == 'decvaluereg' || params[id] == 'decpercentreg')
//					{
//						params.isskipsale = $('#saleskip').prop('checked');
//					}
//				}
			}
		})
		$('#selectdialog select option[value="empty"]:selected').each(function(){
			var item = $(this).parent();
			if(item.is(':visible'))
			{
				var id = item.attr('data-id');
				params[id] = 'empty';
				params[id + 'value'] = 0;
			}
		})
		
		$('#selectdialog .selectset:checked').each(function(){
			var item = $(this);
			if(item.is(':visible'))
			{
				var id = item.attr('data-id');
				params[id] = id;
				params[id+ 'value'] = $('#selectdialog select#select' + id).val();
			}
		})
		
		HandleSelectUpdate(params);
	     $( this ).dialog( "close" );
	  },
	  Cancel: function()
	  {
		  $( this ).dialog( "close" );
	  }
	 }
});

	$('#selallproducts').click(function()
	{
		var selectedRows = [];
		for(var irow=0; irow < _data.length; irow++)
		{
			if(_data[irow] === undefined) continue;
			var selitem = _data[irow];
			if(selitem.post_type === 'revision')
				continue;
			selectedRows.push(irow);
		}
		_grid.setSelectedRows(selectedRows);
		$("#selectdialog").dialog('close');	
	})
	
	$('#invertselected').click(function()
	{
		var selectedRows = _grid.getSelectedRows();
		var invRows = [];
		for(var irow=0; irow < _data.length; irow++)
		{
			if($.inArray(irow,selectedRows) === -1)
				invRows.push(irow);
		}
		_grid.setSelectedRows(invRows);
		$("#selectdialog").dialog('close');	
	})
	
	$('#selallvars').click(function()
	{
		var selectedRows = [];
		for(var irow=0; irow < _data.length; irow++)
		{
			if(_data[irow] === undefined) continue;
			var selitem = _data[irow];
			if(selitem.post_type === 'revision')
				selectedRows.push(irow);
		}
		_grid.setSelectedRows(selectedRows);
		$("#selectdialog").dialog('close');	
	})
	
	$('#seldupproducts').click(function()
	{
		var obj = {};
		var selectedRows = [];
		var field = "post_title";
		field = $('#selectdupproducts').val();
		for(var irow=0; irow < _data.length; irow++)
		{
			if(_data[irow] === undefined) continue;
			var selitem = _data[irow];
//			if(selitem.post_type === 'revision')
//				continue;
			if(obj[selitem[field]] !== undefined)
			{
				if(obj[selitem[field]] !== "-1")
				{
					selectedRows.push(obj[selitem[field]]);
					obj[selitem[field]] = "-1";
				}
				selectedRows.push(irow);
			}else
				obj[selitem[field]] = irow;
		}
		obj = {};
		_grid.setSelectedRows(selectedRows);
		$("#selectdialog").dialog('close');	
	})
	
	$('#seldupvars').click(function()
	{
		var obj = {};
		var selectedRows = [];
		for(var irow=0; irow < _data.length; irow++)
		{
			if(_data[irow] === undefined) continue;
			var selitem = _data[irow];
			if(selitem.post_type !== 'revision')
				continue;
			if(obj[selitem.post_parent] === undefined)
				obj[selitem.post_parent] = {};
			var atrrtext = "";
			var arrvalues = [];
			for (var key in selitem) 
			{
			  if (selitem.hasOwnProperty(key) && key.indexOf('attribute_') === 0) 
			  {
			      arrvalues.push(key);
			  }
			}
			if(arrvalues.length > 0)
			{
				arrvalues.sort();
				for(var i=0; i < arrvalues.length; i++)
				{
					atrrtext+= selitem[arrvalues[i]];
				}
			}
			
			if(obj[selitem.post_parent][atrrtext] !== undefined)
			{
				if(obj[selitem.post_parent][atrrtext] !== "-1")
				{
					selectedRows.push(obj[selitem.post_parent][atrrtext]);
					obj[selitem.post_parent][atrrtext] = "-1";
				}
				selectedRows.push(irow);
			}else
				obj[selitem.post_parent][atrrtext] = irow;
		}
		obj = {};
		_grid.setSelectedRows(selectedRows);
		$("#selectdialog").dialog('close');	
	})
				
	function HandlePaginationData(pagination,isnext)
	{
		var hastosave = false;
		for(var ir=0; ir < _arrEdited.length; ir++)
		{
			var row = _arrEdited[ir];
			if(row === undefined) continue;
			if(_data[ir] === undefined) continue;
			hastosave = true;
			break;
		}
//		if(hastosave)
//		{
//			SaveChanges("pagination",true,isnext);
//		}else
		{
			LoadProducts("savechanges",pagination,isnext);
		}
	}


	$('#findcustomfield').click(function ()
	{
		var ctext = $('#productid').val();
		ctext = $.trim(ctext);
		if(ctext == "") return;
		var ajaxarr = {};
		ajaxarr.action = 'wordpress_adv_bulk_edit';
		ajaxarr.type = 'findcustomfields';
		ajaxarr.nonce = W3ExWABE.nonce;
		ajaxarr.post_type = _current_post_type;		
		var $elem = $('#findcustomfield');
        $elem.css('position','relative').append('<div class="showajax"></div>');
		$('.showajax').css({
			left:'15px'
		});
//		$elem.button("disable");
		ajaxarr.data = ctext;
		var dlg = $(this);
		jQuery.ajax({
		     type : "post",
		     dataType : "json",
		     url : W3ExWABE.ajaxurl,
		     data : ajaxarr,
		     success: function(response) {
					$('.showajax').remove();
					$('#findcustomfieldsdialog table tr').remove();
					var metas = response.customfields;
					if(metas === undefined || metas === null)
					{
						$('#findcustomfieldsdialog table').append('<tr><td>Nothing found</td></tr>');
						return;
					}
					if(metas === -1)
					{
						$('#findcustomfieldsdialog table').append('<tr><td>Post does not exist</td></tr>');
						return;
					}
					var texttoadd = "<tr><td></td><td>Meta Key</td><td>Meta Value</td><td>Field Name(display as)</td><td></td></tr>";
					for (var i=0; i< metas.length; i++) {
					    var meta = metas[i];
					    if(meta.meta_value === null || meta.meta_value === undefined)
					    	continue;
						meta.meta_value = meta.meta_value.toString();
						if(!_debugmode)
							meta.meta_value = meta.meta_value.substr(0, 200);
						meta.meta_value = replaceAll(meta.meta_value,'<', '&lt;');
						meta.meta_value = replaceAll(meta.meta_value,'<', '&gt;');
						texttoadd+= '<tr><td data-field=""><input class="customisvisible" type="checkbox"></td><td data-field="metakey" meta-field="'+meta.meta_key+'">'+ meta.meta_key+'</td><td data-field="">'+meta.meta_value+'</td><td data-field="name"><input data-field="inputname" type="text"" value=""></td><td data-field="type">Field type:&nbsp;<select class="fieldtypefound"><option value="text">Text (single line)</option><option value="multitext">Text (multi line)</option><option value="integer">Number (integer)</option><option value="decimal">Number (decimal .00)</option><option value="decimal3">Number (decimal .000)</option><option value="checkbox">Checkbox</option></select></td></tr>';
					}
					if(texttoadd !== "<tr><td></td><td>Meta Key</td><td>Meta Value</td><td>Field Name</td><td></td></tr>")
						$('#findcustomfieldsdialog table').append(texttoadd);
					else
						$('#findcustomfieldsdialog table').append('<tr><td>Nothing found</td></tr>');
			},
			  error:function (xhr, status, error) 
			  {
			  	  $('.showajax').remove();
				  $('#findcustomfieldsdialog table tr').remove();
				  $('#findcustomfieldsdialog table').append('<tr><td>Product does not exist</td></tr>');
			  }
		  }) ;
	});
	
	$('#findcustomfieldsauto').click(function ()
	{
		var ajaxarr = {};
		ajaxarr.action = 'wordpress_adv_bulk_edit';
		ajaxarr.type = 'findcustomfieldsauto';
		ajaxarr.nonce = W3ExWABE.nonce;
		ajaxarr.post_type = _current_post_type;		
		var $elem = $('#findcustomfieldsauto');
        $elem.css('position','relative').append('<div class="showajax"></div>');
		$('.showajax').css({
			left:'15px'
		});
//		$elem.button("disable");
		ajaxarr.data = "";
		var dlg = $(this);
		jQuery.ajax({
		     type : "post",
		     dataType : "json",
		     url : W3ExWABE.ajaxurl,
		     data : ajaxarr,
		     success: function(response) {
					$('.showajax').remove();
					$('#findcustomfieldsdialog table tr').remove();
					var metas = response.customfields;
					if(metas === undefined || metas === null)
					{
						$('#findcustomfieldsdialog table').append('<tr><td>Nothing found</td></tr>');
						return;
					}
					if(metas === -1)
					{
						$('#findcustomfieldsdialog table').append('<tr><td>Nothing found</td></tr>');
						return;
					}
					var texttoadd = "<tr><td></td><td>Meta Key</td><td>Meta Value</td><td>Field Name(display as)</td><td></td></tr>";
					var dups = [];
					for (var i=0; i< metas.length; i++) {
					    var meta = metas[i];
					    if(meta.meta_value === null || meta.meta_value === undefined)
					    	continue;
						meta.meta_value = meta.meta_value.toString();
						if(!_debugmode)
							meta.meta_value = meta.meta_value.substr(0, 200);
						meta.meta_value = replaceAll(meta.meta_value,'<', '&lt;');
						meta.meta_value = replaceAll(meta.meta_value,'<', '&gt;');
						if($.inArray(meta.meta_key,dups) == -1)
						{
							dups.push(meta.meta_key);
						}else
						{
							continue;
						}
						texttoadd+= '<tr><td data-field=""><input class="customisvisible" type="checkbox"></td><td data-field="metakey" meta-field="'+meta.meta_key+'">'+ meta.meta_key+'</td><td data-field="">'+meta.meta_value+'</td><td data-field="name"><input data-field="inputname" type="text"" value=""></td><td data-field="type">Field type:&nbsp;<select class="fieldtypefound"><option value="text">Text (single line)</option><option value="multitext">Text (multi line)</option><option value="integer">Number (integer)</option><option value="decimal">Number (decimal .00)</option><option value="decimal3">Number (decimal .000)</option><option value="checkbox">Checkbox</option></select></td></tr>';
					}
					if(texttoadd !== "<tr><td></td><td>Meta Key</td><td>Meta Value</td><td>Field Name</td><td></td></tr>")
						$('#findcustomfieldsdialog table').append(texttoadd);
					else
						$('#findcustomfieldsdialog table').append('<tr><td>Nothing found</td></tr>');
			},
			  error:function (xhr, status, error) 
			  {
			  	  $('.showajax').remove();
				  $('#findcustomfieldsdialog table tr').remove();
				  $('#findcustomfieldsdialog table').append('<tr><td>Product does not exist</td></tr>');
			  }
		  }) ;
	});

	$('#findcustomtaxonomies').click(function ()
	{
	
		var ajaxarr = {};
		ajaxarr.action = 'wordpress_adv_bulk_edit';
		ajaxarr.type = 'findcustomtaxonomies';
		ajaxarr.nonce = W3ExWABE.nonce;
				
		var $elem = $('#findcustomtaxonomies');
        $elem.css('position','relative').append('<div class="showajax"></div>');
		$('.showajax').css({
			left:'15px'
		});
		ajaxarr.data = "";
		ajaxarr.post_type = _current_post_type;
		var dlg = $(this);
		jQuery.ajax({
		     type : "post",
		     dataType : "json",
		     url : W3ExWABE.ajaxurl,
		     data : ajaxarr,
		     success: function(response) {
					$('.showajax').remove();
					$('#findcustomfieldsdialog table tr').remove();
					var metas = response.customfields;
					if(metas === undefined || metas === null)
					{
						$('#findcustomfieldsdialog table').append('<tr><td>Nothing found</td></tr>');
						return;
					}
					if(metas === -1)
					{
						$('#findcustomfieldsdialog table').append('<tr><td>Nothing found</td></tr>');
						return;
					}
					if(metas instanceof Array &&metas.length === 0 )
					{
						$('#findcustomfieldsdialog table').append('<tr><td>Nothing found</td></tr>');
						return;
					}
					var texttoadd = "<tr><td></td><td>Taxonomy Slug</td><td>Taxonomy Terms</td><td>Field Name(display as)</td></tr>";
					for (var i=0; i< metas.length; i++) {
					    var meta = metas[i];
					    if(meta.tax === null || meta.tax === undefined || meta.terms === null || meta.terms === undefined)
					    continue;
						meta.tax = meta.tax.toString();
						if(!_debugmode)
							meta.terms = meta.terms.substr(0, 150);
						texttoadd+= '<tr><td data-field=""><input class="customisvisible" type="checkbox"></td><td data-field="metakey" meta-field="'+meta.tax+'">'+ meta.tax+'</td><td data-field="typecustom">'+meta.terms+'</td><td data-field="name"><input data-field="inputname" type="text"" value=""></tr>';
					}
					if(texttoadd !== "<tr><td></td><td>Taxonomy name</td><td>Taxonomy Terms</td></tr>")
						$('#findcustomfieldsdialog table').append(texttoadd);
					else
						$('#findcustomfieldsdialog table').append('<tr><td>Nothing found</td></tr>');
			},
			  error:function (xhr, status, error) 
			  {
			  	  $('.showajax').remove();
				  $('#findcustomfieldsdialog table tr').remove();
				  $('#findcustomfieldsdialog table').append('<tr><td>Product does not exist</td></tr>');
			  }
		  }) ;
	});
	
	 $("#addok").click(function ()
	 {
	 	var newhtml = "<tr class='trcustom'><td data-field='name'><strong>";
	 	var ctext = $('#fieldname').val();
		ctext = $.trim(ctext);
		if(ctext == "") return;
		if(_mapfield[ctext] !== undefined)
		{
			if(_idmap[_mapfield[ctext]] !== undefined)
			{
				if(_idmap[_mapfield[ctext]].isdeleted === undefined)
				{
					alert('Field with the same id already exists !');
					return;
				}
			}
		}
		var bexit = false;
		$('.trcustom:visible').each(function ()
		{
			var $tds = $(this).children('td');
			var oldid = "";
			$tds.each(function ()
			{
				var field = $(this).attr('data-field');
				var fieldinfo = "";
				if(field == 'name')
				{
					oldid  = $(this).text();
					if(oldid == ctext)
					{
						alert('Field with the same id already exists !');
						bexit = true;
					}
				}
			})
		})
		if(bexit) return;
//		alert($('#fieldtype').val());
		if($('#fieldtype').val() == "custom" || $('#fieldtype').val() == "customh")
		{//check for category existance
			var ajaxarr = {};
			ajaxarr.action = 'wordpress_adv_bulk_edit';
			ajaxarr.type = 'checkcustom';
			ajaxarr.nonce = W3ExWABE.nonce;
					
			var $elem = $('#addok');
	        $elem.css('position','relative').append('<div class="showajax"></div>');
			$('.showajax').css({
				left:'15px'
			});
//			$elem.button("disable");
			ajaxarr.extrafield = ctext;
			jQuery.ajax({
			     type : "post",
			     dataType : "json",
			     url : W3ExWABE.ajaxurl,
			     data : ajaxarr,
			     success: function(response) {
				 		if(response.error !== undefined)
				 		 	$('#extracustominfo').html('<div style="color:red;">Taxonomy does not exist !</div>');
						else
						{
							if(_mapfield[ctext] !== undefined)
							{
								if(_idmap[_mapfield[ctext]] !== undefined)
								{
									if(_idmap[_mapfield[ctext]].isdeleted === undefined)
									{
										alert('Field with the same id already exists !');
										return;
									}
								}
							}
							var bexit = false;
							$('.trcustom:visible').each(function ()
							{
								var $tds = $(this).children('td');
								var oldid = "";
								$tds.each(function ()
								{
									var field = $(this).attr('data-field');
									var fieldinfo = "";
									if(field == 'name')
									{
										oldid  = $(this).text();
										if(oldid == ctext)
										{
											alert('Field with the same id already exists !');
											bexit = true;
										}
									}
								})
							})
							if(bexit) return;
							newhtml+= ctext + "</strong></td><td";
							var name = $('#fieldname1').val();
							newhtml+= " data-field='name1'>name: <input data-field='inputname' type='text' value='"+name+"'></td><td";
							ctext = $('#fieldtype').val();
							switch(ctext){
								case "text":
								{
									newhtml+= " data-type='text' data-field='type'>type: <strong>Text (single line)</strong></td>";
								}
								break;
								case "multitext":
								{
									newhtml+= " data-type='multitext' data-field='type'>type: <strong>Text (multi line)</strong></td>";
								}
								break;
								case "integer":
								{
									newhtml+= " data-type='integer' data-field='type'>type: <strong>Number (integer)</strong></td>";
								}
								break;
								case "decimal":
								{
									newhtml+= " data-type='decimal' data-field='type'>type: <strong>Number (decimal .00)</strong></td>";
								}
								break;
								case "decimal3":
								{
									newhtml+= " data-type='decimal3' data-field='type'>type: <strong>Number (decimal .000)</strong></td>";
								}
								break;
								case "select":
								{
									var selvals = $('#extracustominfo input').val();
									if(selvals == "")
										return;
									newhtml+= " data-type='select' data-field='type' data-vals='" + selvals + "'>type: <strong>select</strong><br/>(" + selvals + ")</td>";
								}
								break;
								case "checkbox":
								{
									newhtml+= " data-type='checkbox' data-field='type'>type: <strong>Checkbox</strong></td>";
								}
								break;
								case "custom":
								{
									newhtml+= " data-type='custom' data-field='type' data-vals='" +  $('#extracustominfo input').is(':checked') + "'>type: <strong>Custom Taxonomy</td>";
								}
								break;
								case "customh":
								{
									newhtml+= " data-type='customh' data-field='type'>type: <strong>Custom Taxonomy(hierar.)</td>";
								}
								break;
								
								default:
									break;
							}
							
							ctext = $('#fieldvisible').val();
							if(ctext == "yes")
							{
								newhtml+= '<td data-field="isvisible"><label><input type="checkbox" class="customisvisible" checked="checked">Visible</label><input class="button deletecustomfield" type="button" value="delete" /></td></tr>';
							}else
							{
								newhtml+= '<td data-field="isvisible"><label><input type="checkbox" class="customisvisible">Visible</label><input class="button deletecustomfield" type="button" value="delete" /></td></tr>';
							}
							$(newhtml).insertBefore('.addcontrols');
						 	$('#addcustomfield').show();
							$('.addcontrols').hide();
							$('.addokcancel').hide();
						}
						$('.showajax').remove();
//						$elem.button("enable");
			     },
				  error:function (xhr, status, error) 
				  {
				  	  $('.showajax').remove();
//					  $elem.button("enable");
					 
				  }
			  }) ;
		    return;
		}
		
		
		
		newhtml+= ctext + "</strong></td><td";
		var name = $('#fieldname1').val();
		newhtml+= " data-field='name1'>name: <input data-field='inputname' type='text' value='"+name+"'></td><td";
		ctext = $('#fieldtype').val();
		switch(ctext){
			case "text":
			{
				newhtml+= " data-type='text' data-field='type'>type: <strong>Text (single line)</strong></td>";
			}
			break;
			case "multitext":
			{
				newhtml+= " data-type='multitext' data-field='type'>type: <strong>Text (multi line)</strong></td>";
			}
			break;
			case "integer":
			{
				newhtml+= " data-type='integer' data-field='type'>type: <strong>Number (integer)</strong></td>";
			}
			break;
			case "decimal":
			{
				newhtml+= " data-type='decimal' data-field='type'>type: <strong>Number (decimal .00)</strong></td>";
			}
			break;
			case "decimal3":
			{
				newhtml+= " data-type='decimal3' data-field='type'>type: <strong>Number (decimal .000)</strong></td>";
			}
			break;
			case "select":
			{
				var selvals = $('#extracustominfo input').val();
				if(selvals == "")
					return;
				newhtml+= " data-type='select' data-field='type' data-vals='" + selvals + "'>type: <strong>select</strong><br/>(" + selvals + ")</td>";
			}
			break;
			case "checkbox":
			{
				newhtml+= " data-type='checkbox' data-field='type'>type: <strong>Checkbox</strong></td>";
			}
			break;
			case "custom":
			{
				newhtml+= " data-type='custom' data-field='type' data-vals='" +  $('#extracustominfo input').is(':checked') + "'>type: <strong>Custom Taxonomy</td>";
			}
			break;
			case "customh":
			{
				newhtml+= " data-type='customh' data-field='type'>type: <strong>Custom Taxonomy(hierar.)</td>";
			}
			break;
			
			default:
				break;
		}
		
		ctext = $('#fieldvisible').val();
		if(ctext == "yes")
		{
			newhtml+= '<td data-field="isvisible"><label><input type="checkbox" class="customisvisible" checked="checked">Visible</label><input class="button deletecustomfield" type="button" value="delete" /></td></tr>';
		}else
		{
			newhtml+= '<td data-field="isvisible"><label><input type="checkbox" class="customisvisible">Visible</label><input class="button deletecustomfield" type="button" value="delete" /></td></tr>';
		}
		$(newhtml).insertBefore('.addcontrols');
	 	$('#addcustomfield').show();
		$('.addcontrols').hide();
		$('.addokcancel').hide();
		
		
	 })
	 
	 function RefreshLoadedFields(products)
	 {
	 	if(products !== undefined && products !== null)
		{
			var idmaps = [];
			var dataarray = [];
			if(W3Ex._global_settings.inselectionmode === true)
			{
				dataarray = _dataAllTemp;
				
			}else
			{
				dataarray = _data;
			}
			for(var i=0; i < dataarray.length; i++)
			{
				if(dataarray[i] === undefined) continue;
				var selitem = dataarray[i];
				idmaps[selitem.ID] = i;
			}
			var retproducts = products;
			for(var irow=0; irow < retproducts.length; irow++)
			{
				if(retproducts[irow] === undefined) continue;
				var selitem = retproducts[irow];
				if(selitem.ID === undefined) continue;
				if(dataarray[idmaps[selitem.ID]] !== undefined)
				{
					var initem = dataarray[idmaps[selitem.ID]];
					for (var key in selitem) 
					{
					   if (selitem.hasOwnProperty(key)) 
					   {
							if(initem[key] === undefined || key === 'attribute_pa_ids')
						  	 initem[key] = selitem[key];
					   }
					}
				}
			}
			//refresh if selected only
			if(W3Ex._global_settings.inselectionmode === true)
			{
				idmaps = [];
				for(var i=0; i < _data.length; i++)
				{
					if(_data[i] === undefined) continue;
					var selitem = _data[i];
					idmaps[selitem.ID] = i;
				}
				for(var irow=0; irow < retproducts.length; irow++)
				{
					if(retproducts[irow] === undefined) continue;
					var selitem = retproducts[irow];
					if(selitem.ID === undefined) continue;
					if(_data[idmaps[selitem.ID]] !== undefined)
					{
						var initem = _data[idmaps[selitem.ID]];
						for (var key in selitem) 
						{
						   if (selitem.hasOwnProperty(key)) 
						   {
							  if(initem[key] === undefined || key === 'attribute_pa_ids')
							 	 initem[key] = selitem[key];
						   }
						}
					}
				}
				
			}
			for(var ir=0; ir < dataarray.length; ir++)
			{
				if(dataarray[ir] === undefined) continue;
				var selitem = dataarray[ir];
				if(selitem.post_type === 'revision') continue;
				GenerateAttributes(selitem);
			}
//			for(var ir=0; ir < dataarray.length; ir++)
//			{
//				if(dataarray[ir] === undefined) continue;
//				var selitem = dataarray[ir];
//				if(selitem.post_type === 'revision')
//					GenerateAttributes(selitem);
//			}
			DisableAllControls(false);
			$('#dimgrid').remove();
			$('.showajax').remove();
		}
		_grid.setSelectedRows(_grid.getSelectedRows());
		_grid.invalidate();
	 }
	 
	 $("#findcustomfieldsdialog").dialog({			
	    autoOpen: false,
	    height: 740,
	    width: 920,
	    modal: true,
		draggable:true,
		resizable:false,
		closeOnEscape: true,
		title:W3Ex._translate_strings["trans_find_custom_fields"],
		create: function (event, ui) {
	        $(this).dialog('widget')
	            .css({ position: 'fixed'})
	    },
		open: function( event, ui ) {
			 var d = $('.ui-dialog:visible');
 			 $(d).addClass('dialog-zindez');
			 d[0].style.setProperty('z-index', '300002', 'important');
			/* if($('.ui-widget-overlay:visible').length > 0)
			 {
			  	  $('.ui-widget-overlay').each(function () {
				 $(this).next('.ui-dialog').andSelf().wrapAll('<div class="w3exabe w3exabedel" />');
				});
			  }else*/
			  {
				$('.ui-dialog:visible').wrap('<div class="w3exabe w3exabedel" />');
			  }
			   $('.ui-widget-overlay').each(function () {
				 $(this).next('.ui-dialog').andSelf().wrapAll('<div class="w3exabe w3exabedel" />');
				});
			  $('#findcustomfieldsdialog').css('height','502px');
			   var winH = $(window).height() - 180;
			if(winH < 502)
			{
				 $('#findcustomfieldsdialog').css('height',winH.toString() + 'px');
			}
			  $('#productid').val('');
 			  $('#findcustomfieldsdialog table tr').remove();
			  _changedcustom = [];
		},
		close: function( event, ui ) {
			$(".w3exabedel").contents().unwrap();
		},
	 	buttons: {
		  "Save Selected and Close": function() {
  			   try{
					
			   		var changed = false;
	 				var newcols = _grid.getColumns();
					
					var offset = 0;
					var _arrData = {};
					
					var customobj = {};
					var ColsToLoad = [];
					var newcols1 = _grid.getColumns();
	 				var newcolsold = $.extend(true, [], newcols1);
	 							
					$('.trcustom').each(function ()
					{
						var $tdsc = $(this).children('td');
						customobj = {};
						$tdsc.each(function ()
						{
							var field = $(this).attr('data-field');
							var fieldinfo = "";
							if(field == 'name')
							{
								customobj.field = $(this).text();
								
							}else if(field == 'name1')
							{
								customobj.name = $(this).find('input').val();
								if(isBlank(customobj.name))
								{
									customobj.name = customobj.field;
								}
							}else if(field == 'type')
							{
								customobj.type = $(this).attr('data-type');
								if(customobj.type == 'custom')
								{
									if($(this).attr('data-vals') == "true")
										customobj.isnewvals = true;
									else
										customobj.isnewvals = false;
								}else if(customobj.type == 'select')
								{
									customobj.selvals = $(this).attr('data-vals');
								}
							}else if(field == 'isvisible')
							{
								customobj.isvisible = $(this).find('input').is(':checked');
							}
						})
						_arrData[customobj.name] = customobj;
					});
						
					$('#findcustomfieldsdialog table tr:visible').each(function ()
					{
						var $tds = $(this).children('td');
						if($(this).find('input:checkbox').length > 0)
						{
							if(!$(this).find('input:checkbox').is(':checked'))
							{
								return true;
							}
						}else
						{
							return true;
						}
						
						customobj = {};
						
						var existsalready = false;
						
						$tds.each(function ()
						{
							var field = $(this).attr('data-field');
							var fieldinfo = "";
							if(field == 'metakey')
							{
								customobj.field = $(this).attr('meta-field');
								if(_mapfield[customobj.field] !== undefined)
								{
//									if(_idmap[_mapfield[customobj.name]] !== undefined)
									{
//										if(_idmap[_mapfield[customobj.name]].isdeleted === undefined)
										{
											existsalready = true;
										}
									}
								}
								
							}else if(field == 'name')
							{
								customobj.name = $(this).find('input').val();
								if(isBlank(customobj.name))
								{
									customobj.name = customobj.field;
								}
							}else if(field == 'type')
							{
								customobj.type = $(this).find('.fieldtypefound').val();
							}else if(field == 'typecustom')
							{
								customobj.type = 'customh';
							}
						})
						
						if(existsalready) return true;
						
						customobj.isvisible = true;
						var newhtml = "<tr class='trcustom'><td data-field='name'><strong>";
						newhtml+= customobj.field + "</strong></td><td";
						newhtml+= " data-field='name1'>name: <input data-field='inputname' type='text' value='"+customobj.name+"'></td><td";
						switch(customobj.type){
							case "text":
							{
								newhtml+= " data-type='text' data-field='type'>type: <strong>Text (single line)</strong></td>";
							}
							break;
							case "multitext":
							{
								newhtml+= " data-type='multitext' data-field='type'>type: <strong>Text (multi line)</strong></td>";
							}
							break;
							case "integer":
							{
								newhtml+= " data-type='integer' data-field='type'>type: <strong>Number (integer)</strong></td>";
							}
							break;
							case "decimal":
							{
								newhtml+= " data-type='decimal' data-field='type'>type: <strong>Number (decimal .00)</strong></td>";
							}
							break;
							case "decimal3":
							{
								newhtml+= " data-type='decimal3' data-field='type'>type: <strong>Number (decimal .000)</strong></td>";
							}
							break;
							case "checkbox":
							{
								newhtml+= " data-type='checkbox' data-field='type'>type: <strong>Checkbox</strong></td>";
							}
							break;
							case "custom":
							{
								newhtml+= " data-type='custom' data-field='type' data-vals='false'>type: <strong>Custom Taxonomy</td>";
							}
							break;
							case "customh":
							{
								newhtml+= " data-type='customh' data-field='type'>type: <strong>Custom Taxonomy(hierar.)</td>";
							}
							break;
							default:
								break;
						}
						
							newhtml+= '<td data-field="isvisible"><label><input type="checkbox" class="customisvisible" checked="checked">Visible</label><input class="button deletecustomfield" type="button" value="delete" /></td></tr>';
							
						$(newhtml).insertBefore('.addcontrols');
		
						_arrData[customobj.field] = customobj;
						if(_mapfield[customobj.field] === undefined)
						{
							var insertobj = {};
							insertobj[customobj.field] = _mapfield.length;
							
							_mapfield[customobj.field] = _idmap.length;
							insertobj.field = customobj.field;
							insertobj.id = customobj.field;
							insertobj.name = customobj.name;
							
							var newitem = {};
							newitem.id = customobj.field;
							newitem.name = customobj.name;
							newitem.field = customobj.field;
							
							if(customobj.type == "text")
							{
								newitem.editor = Slick.Editors.Text;
								insertobj.type = "text";
							}else if(customobj.type == "multitext")
							{
								newitem.editor = Slick.Editors.TextArea;
								insertobj.textarea = true;
								insertobj.type = "multitext";
							}else if(customobj.type == "integer")
							{
								newitem.editor = Slick.Editors.Text;
								insertobj.type = 'int';
							}else if(customobj.type == "decimal")
							{
								newitem.editor = Slick.Editors.Text;
								insertobj.type = 'float2';
							}else if(customobj.type == "decimal3")
							{
								newitem.editor = Slick.Editors.Text;
								insertobj.type = 'float3';
							}else if(customobj.type == "checkbox")
							{
								newitem.cssClass = "cell-effort-driven";
								newitem.formatter = Slick.Formatters.Checkmark;
								newitem.editor = Slick.Editors.Checkbox;
								insertobj.checkbox = true;
								insertobj.type = 'set';
							}else if(customobj.type == "select")
							{
								newitem.editor = Slick.Editors.Select;
								newitem.options = customobj.selvals;
								insertobj.type = 'set';
								insertobj.options= customobj.selvals;
							}else if(customobj.type == "custom")
							{
								newitem.editor = Slick.Editors.Text;
								insertobj.scope = SCOPE.PRODALL;
								insertobj.type = 'customtax';
								insertobj.isnewvals = customobj.isnewvals;
							}else if(customobj.type == "customh")
							{
								newitem.editor = Slick.Editors.Category;
								insertobj.scope = SCOPE.PRODALL;
								insertobj.type = 'customtaxh';
							}
							AddBulkAndSelectFields(customobj);
							newitem.sortable = true;
							_allcols.push(newitem);
							_idmap.push(insertobj);
							changed = true;
							if(customobj.isvisible)
							{
								var offset = _allcols.length - newcols.length;
								var hascol = false;
								var len = newcols.length;
								while (len--) {
								    var obj = newcols[len];
									if(obj.field === customobj.field)
									{
										hascol = true;
										break;
									}
								}
								if(!hascol)
								{
									len = _allcols.length;
									var shouldsearch = false;
									var found = false;
									var insertobj;
									while (len--) {
									    var obj = _allcols[len];
										if(obj.field === customobj.field)
										{
											insertobj = _allcols[len];
											shouldsearch = true;
											continue;
										}
										if(shouldsearch)
										{
											var newlen = newcols.length;
											while (newlen--) {
											    var newobj = newcols[newlen];
												if(newobj.field === obj.field )
												{
													newcols.splice(newlen+1,0,insertobj);
													changed = true;
													found = true;
													break;
												}
											}
										}
										if(found) break;
											
									}
									if(!found)
										newcols.push(insertobj);
								}
							}
							

						}else
						{//field exits
							
							try{
									if(!customobj.isvisible)
									{
										offset++;
										var len = newcols.length;
										while (len--) {
										    var obj = newcols[len];
											if(obj.field === customobj.field)
											{
												newcols.splice(len,1);
												changed = true;
												break;
											}
										}
										$("#bulkdialog tr[data-id='" + customobj.field + "']").hide();
										$("#selectdialog tr[data-id='" + customobj.field + "']").hide();
									}else
									{
										$("#bulkdialog tr[data-id='" + customobj.field + "']").show();
										$("#selectdialog tr[data-id='" + customobj.field + "']").show();
										var offset = _allcols.length - newcols.length;
										var hascol = false;
										var len = newcols.length;
										while (len--) {
										    var obj = newcols[len];
											if(obj.field === customobj.field)
											{
												hascol = true;
												break;
											}
										}
										if(!hascol)
										{
											len = _allcols.length;
											var shouldsearch = false;
											var found = false;
											var insertobj;
											while (len--) {
											    var obj = _allcols[len];
												if(obj.field === customobj.field)
												{
													insertobj = _allcols[len];
													shouldsearch = true;
													continue;
												}
												if(shouldsearch)
												{
													var newlen = newcols.length;
													while (newlen--) {
													    var newobj = newcols[newlen];
														if(newobj.field === obj.field )
														{
															newcols.splice(newlen+1,0,insertobj);
															changed = true;
															found = true;
															break;
														}
													}
												}
												if(found) break;
													
											}
											if(!found)
												newcols.push(insertobj);
										}
									}
								}catch(err)
								{
									;
								}
								
							
						}
					
						
						
					})
						if(changed)
						{
							
	 						
	 						var arrColumnsold = [];
						
							var newlenold = newcolsold.length;
							while (newlenold--) {
							    var newobj1 = newcolsold[newlenold];
							    arrColumnsold.push(newobj1.id);
							}
							_grid.setColumns(newcols);
							var newlen = newcols.length;
							while (newlen--) 
							{
								var arritem = {};
							    var newobj = newcols[newlen];
							    if($.inArray(newobj.id,arrColumnsold) === -1)
							    {
									ColsToLoad.push(newobj.id);
								}
								arritem.field = newobj.field;
								arritem.width = newobj.width;
//								_arrData[arritem.field] = arritem.width ;
							}
						}
						
					if(!changed)
					{
						$( this ).dialog( "close" );
						return;
					}	
				}catch(err)
				{
					_grid.setColumns(newcols);
					$( this ).dialog( "close" );
					return;
				}
				var arrColumns = {};
				var newcols = _grid.getColumns();
				var newlen = newcols.length;
				while (newlen--) {
				    var newobj = newcols[newlen];
					arrColumns[newobj.field] = newobj.width;
				}
				var ajaxarr = {};
				ajaxarr.action = 'wordpress_adv_bulk_edit';
				ajaxarr.type = 'savecustom';
				ajaxarr.nonce = W3ExWABE.nonce;
				if(ColsToLoad.length > 0)
				{
					var ids = "";
					var dataarray = [];
					if(W3Ex._global_settings.inselectionmode === true)
					{
						dataarray = _dataAllTemp;
						
					}else
					{
						dataarray = _data;
					}
					for(var irow=0; irow < dataarray.length; irow++)
					{
						if(dataarray[irow] === undefined) continue;
						var selitem = dataarray[irow];
						if(ids === "")
						{
							ids = String(selitem.ID);
						}else
						{
							ids = ids + ","+ String(selitem.ID);
						}
					}
					if(ids !== "")
					{
						ajaxarr.colstoload = ColsToLoad;
						ajaxarr.colstoloadids = ids;
						DisableAllControls(true);
						$('#myGrid').prepend('<div id="dimgrid" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:102;opacity:0.4;filter: alpha(opacity = 40);background-color:grey;"></div>');
						$('#getproducts').parent().append('<div class="showajax"></div>');
					}
				}				
				var $elem = $('.ui-dialog-buttonset > .ui-button:visible').first();
		        $elem.css('position','relative').append('<div class="showajax"></div>');
				$('.showajax').css({
					left:'15px'
				});
//				$elem.button("disable");
				W3Ex.customfields[_current_post_type] = _arrData;
				W3Ex.colsettings[_current_post_type] = arrColumns;
				ajaxarr.data = W3Ex.customfields;
				ajaxarr.columns = W3Ex.colsettings;
				var dlg = $(this);
				jQuery.ajax({
				     type : "post",
				     dataType : "json",
				     url : W3ExWABE.ajaxurl,
				     data : ajaxarr,
				     success: function(response) {
							$('.showajax').remove();
//							$elem.button("enable");
							for (var key in _arrData) 
							{
							  if (_arrData.hasOwnProperty(key)) 
							  {
								var obj = _arrData[key];
								if(obj.type !== undefined && (obj.type=== 'customh' || obj.type=== 'custom'))
								{
									if(response[obj.field] !== undefined)
									{
										if(obj.type=== 'customh')
										{
											var bulkdata = '<td><input id="set'+obj.field+'" type="checkbox" class="bulkset" data-id="'+obj.field+'" data-type="customtaxh"><label for="set'+obj.field+'">Set '+obj.field+'</label></td><td></td><td><select id="bulk' + obj.field + '"'+response[obj.field]+'</td><td></td>';
											$("#bulkdialog tr[data-id='" + obj.field + "']").html(bulkdata);
											if(response[obj.field + 'edit'] !== undefined)
											{
												$("#categoriesdialog").append(response[obj.field + 'edit']);
											}
										}
										W3Ex['taxonomyterms' + obj.field] = response[obj.field];
									}
									
								}
							   }
							}
							if(response['customfieldsdata'] !== undefined)
							{
								W3Ex.customfields[_current_post_type] = response['customfieldsdata'];
							}
							ShowCustomSearchFilters();
							$('.makechosen').chosen({disable_search_threshold: 10});
							if(ColsToLoad.length > 0)
							{
								RefreshLoadedFields(response.products);
							}
							dlg.dialog( "close" );
							
				     },
					  error:function (xhr, status, error) 
					  {
//					  	 $('#debuginfo').html(error);
					  	  $('.showajax').remove();
//						  $elem.button("enable");
						  dlg.dialog( "close" );
					  }
				  }) ;
//				$( this ).dialog( "close" );
		  },
		  Cancel: function()
		  {
		  	 
			  $( this ).dialog( "close" );
		  }
		  }
		});
		
//custom fields dialog
	$("#customfieldsdialog").dialog({			
	    autoOpen: false,
	    height:640,
	    width: 950,
	    modal: true,
		draggable:true,
		resizable:false,
		closeOnEscape: true,
		title:W3Ex._translate_strings["trans_custom_fields"],
		create: function (event, ui) {
	        $(this).dialog('widget')
	            .css({ position: 'fixed'})
	    },
		open: function( event, ui ) {
			 var d = $('.ui-dialog:visible');
 			 $(d).addClass('dialog-zindez');
			 d[0].style.setProperty('z-index', '300002', 'important');
			/* if($('.ui-widget-overlay:visible').length > 0)
			 {
			  	  $('.ui-widget-overlay').each(function () {
				 $(this).next('.ui-dialog').andSelf().wrapAll('<div class="w3exabe w3exabedel" />');
				});
			  }else*/
			  {
				$('.ui-dialog:visible').wrap('<div class="w3exabe w3exabedel" />');
			  }
			   $('.ui-widget-overlay').each(function () {
				 $(this).next('.ui-dialog').andSelf().wrapAll('<div class="w3exabe w3exabedel" />');
				});
			  $('#customfieldsdialog').css('height','502px');
			   var winH = $(window).height() - 180;
				if(winH < 502)
				{
					 $('#customfieldsdialog').css('height',winH.toString() + 'px');
				}
			  _changedcustom = [];
		},
		close: function( event, ui ) {
			$('.trcustom').each(function ()
			{
				var $td = $(this).children('td:first');
				var field = $td.text();
				if(_mapfield[field] === undefined)
				$(this).remove();
			})
			
			 $('.trcustom:hidden').each(function ()
				{
					$(this).show();
					var $td = $(this).children('td:first');
					var field = $td.text();
					if(_mapfield[field] !== undefined)
					{
						if(_idmap[_mapfield[field]] !== undefined)
						{
							if(_idmap[_mapfield[field]].isdeleted !== undefined)
								delete _idmap[_mapfield[field]].isdeleted;
						}
					}
//					var $tds = $(this).children('td');
//					$tds.each(function ()
//					{
//						var field = $(this).attr('data-field');
//						if(field == 'name')
//						{
//							if($(this).text() === delfield)
//							   $tr.show();
//						}
//					})
				})
			$('#addcustomfield').show();
			$('.addcontrols').hide();
			$('.addokcancel').hide();
			$(".w3exabedel").contents().unwrap();
		},
	 	buttons: {
		  "OK": function() {
  			   try{
			   		var changed = true;
	 				var newcols = _grid.getColumns();
					var ColsToLoad = [];
					var newcols1 = _grid.getColumns();
	 				var newcolsold = $.extend(true, [], newcols1);
	 				//_changedcustom is deleted fields
					for(var i=0 ; i < _changedcustom.length; i++)
					{
						var delfield = _changedcustom[i];
						if(_mapfield[delfield] !== undefined)
						{
							delete _mapfield[delfield];
							var newlen = _allcols.length;
							while (newlen--) {
							    var newobj = _allcols[newlen];
								if(newobj.field === delfield )
								{
									_allcols.splice(newlen,1);
									changed = true;
								}
							}
						}
						var len = newcols.length;
						while (len--) {
						    var obj = newcols[len];
							if(obj.field === delfield)
							{
								newcols.splice(len,1);
								try{
									$("#bulkdialog tr[data-id='" + delfield + "']").remove();
									$("#selectdialog tr[data-id='" + delfield + "']").remove();
									$("#categoriesdialog ." + delfield).remove();
								} catch (err) {
									;
								}
								break;
							}
						}
						for(var ir=0; ir < _arrEdited.length; ir++)
						{
							var row = _arrEdited[ir];
							if(row === undefined) continue;
							if(row[delfield] === undefined) continue;
							delete row[delfield];
						}
						for(var id=0; id < _data.length; id++)
						{
							
							if(_data[id] === undefined) continue;
							var selitem = _data[id];
							if(selitem[delfield] === undefined) continue;
							delete selitem[delfield];
							if(_changed[id.toString()] !== undefined)
								if(_changed[id.toString()][delfield] !== undefined)
									delete _changed[id.toString()][delfield];
						}
					
					}
					_changedcustom = [];
					try{
							_grid.removeCellCssStyles("changed");
							_grid.setCellCssStyles("changed", _changed);
							_grid.setColumns(newcols);
						} catch (err) {
							;
						}
					
					var offset = 0;
					var _arrData = {};
					$('.trcustom:visible').each(function ()
					{
						var $tds = $(this).children('td');
						var customobj = {};
						$tds.each(function ()
						{
							var field = $(this).attr('data-field');
							var fieldinfo = "";
							if(field == 'name')
							{
								customobj.field = $(this).text();
								
							}else if(field == 'name1')
							{
								customobj.name = $(this).find('input').val();
								if(isBlank(customobj.name))
								{
									customobj.name = customobj.field;
								}
							}else if(field == 'type')
							{
								customobj.type = $(this).attr('data-type');
								if(customobj.type == 'custom')
								{
									if($(this).attr('data-vals') == "true")
										customobj.isnewvals = true;
									else
										customobj.isnewvals = false;
								}else if(customobj.type == 'select')
								{
									customobj.selvals = $(this).attr('data-vals');
								}
							}else if(field == 'isvisible')
							{
								customobj.isvisible = $(this).find('input').is(':checked');
							}
						})
						_arrData[customobj.field] = customobj;
						if(_mapfield[customobj.field] === undefined)
						{
							var insertobj = {};
							insertobj[customobj.field] = _mapfield.length;
							
							_mapfield[customobj.field] = _idmap.length;
							insertobj.field = customobj.field;
							insertobj.id = insertobj.field;
							insertobj.name = customobj.name;
							
							var newitem = {};
							newitem.id = customobj.field;
							newitem.name = customobj.name;
							newitem.field = customobj.field;
							
							if(customobj.type == "text")
							{
								newitem.editor = Slick.Editors.Text;
								insertobj.type = "text";
							}else if(customobj.type == "multitext")
							{
								newitem.editor = Slick.Editors.TextArea;
								insertobj.textarea = true;
								insertobj.type = "multitext";
							}else if(customobj.type == "integer")
							{
								newitem.editor = Slick.Editors.Text;
								insertobj.type = 'int';
							}else if(customobj.type == "decimal")
							{
								newitem.editor = Slick.Editors.Text;
								insertobj.type = 'float2';
							}else if(customobj.type == "decimal3")
							{
								newitem.editor = Slick.Editors.Text;
								insertobj.type = 'float3';
							}else if(customobj.type == "checkbox")
							{
								newitem.cssClass = "cell-effort-driven";
								newitem.formatter = Slick.Formatters.Checkmark;
								newitem.editor = Slick.Editors.Checkbox;
								insertobj.checkbox = true;
								insertobj.type = 'set';
							}else if(customobj.type == "select")
							{
								newitem.editor = Slick.Editors.Select;
								newitem.options = customobj.selvals;
								insertobj.type = 'set';
								insertobj.options= customobj.selvals;
							}else if(customobj.type == "custom")
							{
								newitem.editor = Slick.Editors.Text;
								insertobj.scope = SCOPE.PRODALL;
								insertobj.type = 'customtax';
								insertobj.isnewvals = customobj.isnewvals;
							}else if(customobj.type == "customh")
							{
								newitem.editor = Slick.Editors.Category;
								insertobj.scope = SCOPE.PRODALL;
								insertobj.type = 'customtaxh';
							}
							AddBulkAndSelectFields(customobj);
							newitem.sortable = true;
							_allcols.push(newitem);
							_idmap.push(insertobj);
							changed = true;
							if(customobj.isvisible)
							{
								var offset = _allcols.length - newcols.length;
								var hascol = false;
								var len = newcols.length;
								while (len--) {
								    var obj = newcols[len];
									if(obj.field === customobj.field)
									{
										hascol = true;
										break;
									}
								}
								if(!hascol)
								{
									len = _allcols.length;
									var shouldsearch = false;
									var found = false;
									var insertobj;
									while (len--) {
									    var obj = _allcols[len];
										if(obj.field === customobj.field)
										{
											insertobj = _allcols[len];
											insertobj.name = customobj.field;
											obj.name = customobj.name;
											shouldsearch = true;
											continue;
										}
										if(shouldsearch)
										{
											var newlen = newcols.length;
											while (newlen--) {
											    var newobj = newcols[newlen];
												if(newobj.field === obj.field )
												{
													newcols.splice(newlen+1,0,insertobj);
													changed = true;
													found = true;
													break;
												}
											}
										}
										if(found) break;
											
									}
									if(!found)
										newcols.push(insertobj);
								}
							}
							

						}else
						{//field exits
							
							try{
									if(!customobj.isvisible)
									{
										offset++;
										var len = newcols.length;
										while (len--) {
										    var obj = newcols[len];
											if(obj.field === customobj.field)
											{
												newcols.splice(len,1);
												changed = true;
												break;
											}
										}
										try{
											$("#bulkdialog tr[data-id='" + customobj.field + "']").hide();
											$("#selectdialog tr[data-id='" + customobj.field + "']").hide();
										} catch (err) {
													;
												}
									}else
									{
										try{
											$("#bulkdialog tr[data-id='" + customobj.field + "']").show();
											$("#selectdialog tr[data-id='" + customobj.field + "']").show();
										} catch (err) {
													;
												}
										var offset = _allcols.length - newcols.length;
										var hascol = false;
										var len = newcols.length;
										while (len--) {
										    var obj = newcols[len];
											if(obj.field === customobj.field)
											{
												obj.name = customobj.name;
												hascol = true;
												break;
											}
										}
										if(!hascol)
										{
											len = _allcols.length;
											var shouldsearch = false;
											var found = false;
											var insertobj;
											while (len--) {
											    var obj = _allcols[len];
												if(obj.field === customobj.field)
												{
													insertobj = _allcols[len];
													insertobj.name = customobj.name;
													obj.name = customobj.name;
													shouldsearch = true;
													continue;
												}
												if(shouldsearch)
												{
													var newlen = newcols.length;
													while (newlen--) {
													    var newobj = newcols[newlen];
														if(newobj.field === obj.field )
														{
															newcols.splice(newlen+1,0,insertobj);
															changed = true;
															found = true;
															break;
														}
													}
												}
												if(found) break;
													
											}
											if(!found)
												newcols.push(insertobj);
										}
									}
								}catch(err)
								{
									;
								}
								
							
						}
					
						
						
					})
						if(changed)
						{
							var arrColumnsold = [];
						
							var newlenold = newcolsold.length;
							while (newlenold--) {
							    var newobj1 = newcolsold[newlenold];
							    arrColumnsold.push(newobj1.id);
							}
							_grid.setColumns(newcols);
							var newlen = newcols.length;
							while (newlen--) 
							{
								var arritem = {};
							    var newobj = newcols[newlen];
							     if($.inArray(newobj.id,arrColumnsold) === -1)
							    {
									ColsToLoad.push(newobj.id);
								}
								arritem.field = newobj.field;
								arritem.width = newobj.width;
//								_arrData[arritem.field] = arritem.width ;
							}
						}
						
					if(!changed)
					{
						$( this ).dialog( "close" );
						return;
					}	
				}catch(err)
				{
					_grid.setColumns(newcols);
					$( this ).dialog( "close" );
					return;
				}
				var arrColumns = {};
				var newcols = _grid.getColumns();
				var newlen = newcols.length;
				while (newlen--) {
				    var newobj = newcols[newlen];
					arrColumns[newobj.field] = newobj.width;
				}
				var ajaxarr = {};
				ajaxarr.action = 'wordpress_adv_bulk_edit';
				ajaxarr.type = 'savecustom';
				ajaxarr.nonce = W3ExWABE.nonce;
						
				var $elem = $('.ui-dialog-buttonset > .ui-button:visible').first();
		        $elem.css('position','relative').append('<div class="showajax"></div>');
				$('.showajax').css({
					left:'15px'
				});
//				$elem.button("disable");
				W3Ex.customfields[_current_post_type] = _arrData;
				W3Ex.colsettings[_current_post_type] = arrColumns;
				ajaxarr.data = W3Ex.customfields;
				ajaxarr.columns = W3Ex.colsettings;
				ajaxarr.post_type = _current_post_type;
				if(ColsToLoad.length > 0)
				{
					var ids = "";
					var dataarray = [];
					if(W3Ex._global_settings.inselectionmode === true)
					{
						dataarray = _dataAllTemp;
						
					}else
					{
						dataarray = _data;
					}
					for(var irow=0; irow < dataarray.length; irow++)
					{
						if(dataarray[irow] === undefined) continue;
						var selitem = dataarray[irow];
						if(ids === "")
						{
							ids = String(selitem.ID);
						}else
						{
							ids = ids + ","+ String(selitem.ID);
						}
					}
					if(ids !== "")
					{
						ajaxarr.colstoload = ColsToLoad;
						ajaxarr.colstoloadids = ids;
						DisableAllControls(true);
						$('#myGrid').prepend('<div id="dimgrid" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:102;opacity:0.4;filter: alpha(opacity = 40);background-color:grey;"></div>');
						$('#getproducts').parent().append('<div class="showajax"></div>');
					}
				}			
				var dlg = $(this);
				jQuery.ajax({
				     type : "post",
				     dataType : "json",
				     url : W3ExWABE.ajaxurl,
				     data : ajaxarr,
				     success: function(response) {
							$('.showajax').remove();
//							$elem.button("enable");
							for (var key in _arrData) 
							{
							  if (_arrData.hasOwnProperty(key)) 
							  {
								var obj = _arrData[key];
								if(obj.type !== undefined && (obj.type=== 'customh' || obj.type=== 'custom'))
								{
									if(response[obj.field] !== undefined)
									{
										if(obj.type=== 'customh')
										{
											var bulkdata = '<td><input id="set'+obj.field+'" type="checkbox" class="bulkset" data-id="'+obj.field+'" data-type="customtaxh"><label for="set'+obj.field+'">Set '+obj.name+'</label></td><td></td><td><select id="bulk' + obj.field + '"'+response[obj.field]+'</td><td></td>';
											$("#bulkdialog tr[data-id='" + obj.field + "']").html(bulkdata);
											if(response[obj.field + 'edit'] !== undefined)
											{
												$("#categoriesdialog").append(response[obj.field + 'edit']);
											}
										}
										W3Ex['taxonomyterms' + obj.field] = response[obj.field];
									}
									
								}
							   }
							}
//							if(response['customfieldsdata'] !== undefined)
//							{
//								W3Ex.customfields = response['customfieldsdata'];
//							}
							ShowCustomSearchFilters();
							$('.makechosen').chosen({disable_search_threshold: 10});
							if(ColsToLoad.length > 0)
							{
								RefreshLoadedFields(response.products);
							}
							dlg.dialog( "close" );
							
				     },
					  error:function (xhr, status, error) 
					  {
					  	if(_debugmode)
					  	 $('#debuginfo').html(error);
					  	  $('.showajax').remove();
//						  $elem.button("enable");
						  dlg.dialog( "close" );
					  }
				  }) ;
//				$( this ).dialog( "close" );
		  },
		  Cancel: function()
		  {
		  	 
			  $( this ).dialog( "close" );
		  }
		  }
		});

	$('#showselectedbut').click(function(){
//		alert('asd');
		var selectedRows = _grid.getSelectedRows();
		_seldata.length = 0;
		_seldata.length = _data.length;
		for(var i = 0; i < selectedRows.length; i++)
		{
			if(_data[selectedRows[i]] !== undefined)
			{
				_seldata[selectedRows[i]] = _data[selectedRows[i]];
			}
		}
		_grid.setData(_seldata);
		_grid.resetActiveCell();
		_grid.invalidate();
			
	})

	function LoadFrontPageInfo()
	{
		var ajaxarr = {};
		ajaxarr.action = 'wordpress_adv_bulk_edit';
		ajaxarr.type = 'loadfrontpageinfo';
		ajaxarr.nonce = W3ExWABE.nonce;
			$('#frontpageinfoholder').append('<div class="showajax">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Loading additional info</div>');
			$('.showajax').css({
				left:'10px',
				top:'-10px',
				'white-space': 'nowrap'
			});
		DisableAllControls(true);
		ajaxarr.data = "";
		jQuery.ajax({
		     type : "post",
		     dataType : "json",
		     url : W3ExWABE.ajaxurl,
		     data : ajaxarr,
		     success: function(response) 
		     {
		     		if(response !== null && response !== undefined)
		     		{
			     	    ShowMemoryUsage(response);
					}
						
		     },
			 complete:function (args)
			 {
				  $('#dimgrid').remove();
				  $('.showajax').remove();
			  	 DisableAllControls(false);
			  	 $('.makechosen').chosen({disable_search_threshold: 10,search_contains:true});
//			    $('#debuginfo').html(args.responseText);
			 }, error:function (xhr, status, error) 
			  {
				  DisableAllControls(false);
				  if(_debugmode)
				  	$('#debuginfo').html(xhr.responseText);
			  }
		  }) ;
	}
	
//	LoadFrontPageInfo();
	DisableAllControls(false);
	$('.makechosen').chosen({disable_search_threshold: 10,search_contains:true});
	
	function ShowMemoryUsage(response)
	{
		if(_debugmode)
		{
			if(response !== undefined && response !== null && response.memoryusage !== undefined && response.memoryusage !== null)
				$('#memoryusage').html(response.memoryusage);
		}
		
	}
	
	 return {
		GetPostType:function(){
			return _current_post_type;
		}
	};
	
	
})(jQuery);

});

