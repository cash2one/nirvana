/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: report/lib.js 
 * desc: 数据分析公用函数库 
 * author: tongyao@baidu.com
 * date: $Date: 2011/2/14 $
 */
nirvana.report = {};
//数值类型item
//nirvana.report.numericItem = ['clks', 'shows', 'paysum', 'trans', 'phonetrans', 'phonepay', 'clkrate', 'avgprice'];
nirvana.report.numericItem = ['clks', 'shows', 'paysum', 'trans', 'phonetrans', 'clkrate', 'avgprice'];
nirvana.report.currentReportType = null;
//计费模式
//nirvana.report.chargeModel = null;
nirvana.report.lib = {
    
    hasDeviceConfig:['plan',10,'keyword',9,'idea',12,'account',2,'unit',11],//有的地方用的是英文，有的地方用的是数字。。。plan代码是10 ，keyword 9
     /**
     *有设备属性选项的报告，添加设备属性参数 
     */
    addDeviceParam : function(target, level){
        var deviceRelated = nirvana.report.lib.isDeviceRelated(level);
        if(deviceRelated){//如果有设备属性的选项
             var mtag = baidu.getAttr($$("#DeviceOption a.current")[0], "rel");  
                if(mtag == "all"){
                    target.mtag = "";
                }else{
                    target.mtag = Number(mtag);
                }  
          }
         
    },	
    
    /**
     *处理设备属性相关的汇总，当全部设备的时候，单独获取每种的汇总数据 
     */
   
    handleDeviceSum : function(action, level) {
        var me = action;
        var deviceRelated = nirvana.report.lib.isDeviceRelated(level);
        var mtag = baidu.getAttr($$("#DeviceOption a.current")[0], "rel");
        if(deviceRelated) {
            if(!me.getContext('isCustom') && mtag == 'all') {
                nirvana.displayReport.devicesumData = {};
                nirvana.displayReport.getAllDevicesumData(me, params);
            }
        }

    },
    
    /**
     *判断当前层级的计划是否是计划相关的 
     */
    isDeviceRelated : function(level){
       var index = baidu.array.indexOf(nirvana.report.lib.hasDeviceConfig, level);
       return index == -1 ? false : true;
    },
    
    /**
     *根据报告的层级，看设备属性是否可以 显示 
     */
    showDeviceArea : function(level){
       var deviceRelated = nirvana.report.lib.isDeviceRelated(level);
       if(deviceRelated){
            baidu.removeClass(baidu.g('DeviceOption'),'hide');
       }
       else{
       	   baidu.addClass(baidu.g('DeviceOption'),'hide');
       }
    },

	
	/**
	 * 根据第一行数据，拼装表格的列
	 * @param {Object} keySet
	 * @author tongyao@baidu.com
	 */
	buildTableCol : function(keySet){
		var collections = nirvana.report.lib.tableFields,
			col = [],
			key;
		
		for (var i = 0, l = keySet.length; i < l; i++){
			key = keySet[i];
			//分匹配模式报告，后台不能返回统一的字段名，前端必须处理一下，很恶心啊，对应的还有 nirvana.report.lib.tableRender中的相应方法
			if(key.indexOf("_all") > -1 || 
					key.indexOf("_accu") > -1 || 
					key.indexOf("_word") > -1 || 
					key.indexOf("_wide") > -1){
						key = key.split("_")[0];
					}
			col.push(collections[key]);
		}
		return baidu.object.clone(col);		
	},


	/**
	 * 表格渲染方法
	 * @param {Object} item
	 */
	tableRender : {
		
		/**
		 * 日期
		 * @param {Object} item
		 */
		date : function(item) {
			var date = item.date,
			    html = [];
				
			if(this.isMatrix || !this.isInstantReport){ //是母表或定制报告
				return date;
			}	
			
			if(date.indexOf('至') > -1){
				html.push('<a title="' + date + '" href="#" data-date="' + date + '" onclick="nirvana.displayReport.expandInstantReportByDate(this);return false;">' + date + '</a>');
			} else {
				html.push(date);
			}
	
			return html.join('');
		},
		
		/**
		 * 账户列
		 * @param {Object} item
		 */
		useracct : function(item) {
			if(typeof(item.useracct) == "undefined" || typeof(item.useracct.name) == "undefined"){
				return "";
			}
			var accountName = baidu.encodeHTML(item.useracct.name),
			    html = [],
				bubble_string = ' class="ui_bubble" bubblesource="expandReport" bubbletitle="基本信息"',
				link_string = '<div class="link_icon" title="打开推广管理计划列表" onclick=nirvana.displayReport.linkManage("plan","~ignoreState=1");return false;></div>',
				//rowIndex = node.parentNode.parentNode.getAttribute('row'),
				//判断是否已有下级物料决定是否可以下钻
				allow_expand = (typeof item.planinfo == 'undefined') ? 'true' : 'false';
			
			if (this.isMatrix || !this.isInstantReport || accountName.indexOf('[已删除]') > -1) { //是母表或定制报告或是已删除
				html.push('<div><span title="' + accountName + '">' + accountName + '</span></div>');
				//html.push(link_string);
				return html.join('');
			}
			else {
				if (allow_expand == 'false') 
					html.push('<div><span title="' + accountName + '">' + accountName + '</span></div>');
				else {
					var onclickStr = "onclick='nirvana.displayReport.expandInstantReportToPlan(this);return false;'";
					html.push('<div><a title="' + accountName + '" href="#"  data-log=\"{target:\'checkPlanReport_btn\'}\" onclick="nirvana.displayReport.expandInstantReportToPlan(this);return false;">' + accountName + '</a></div>');
				}
				html.push(link_string);
				return html.join('');
			}
		},
		
		/**
		 * 计划列
		 * @param {Object} item
		 */
		planinfo : function(item) {
			if(typeof(item.planinfo) == "undefined" || typeof(item.planinfo.name) == "undefined"){
				return "";
			}
			var planname = baidu.encodeHTML(item.planinfo.name),
			    html = [],
				bubble_string = ' class="ui_bubble" bubblesource="expandReport" bubbletitle="基本信息"',
				//判断是否已有下级物料决定是否可以下钻
				link_string = '<div class="link_icon" title="打开推广管理单元列表" onclick=nirvana.displayReport.linkManage("unit","'+item.planinfo.id+'&ignoreState=1");return false;></div>',
				allow_expand = (typeof item.unitinfo == 'undefined') ? 'true' : 'false';
		
			if (this.isMatrix || !this.isInstantReport || planname.indexOf('[已删除]') > -1) { //是母表或定制报告
				html.push('<div><span title="' + planname + '">' + planname + '</span></div>');
				//html.push(link_string);
				return html.join('');
			}
			else {
				if (allow_expand == 'false') {
					html.push('<div><span title="' + planname + '">' + planname + '</span></div>');
				}
				else {
					html.push('<div><a title="' + planname + '" href="#"  data-log=\"{target:\'checkPlanReport_btn\'}\" onclick="nirvana.displayReport.expandInstantReportToUnit(this);return false;"' +
					' data-planid="' +
					item.planinfo.id +
					'">' +
					planname +
					'</a></div>');
				}
				html.push(link_string);
				return html.join('');
			}
		},
		
		/**
		 * 单元列
		 * @param {Object} item
		 */
		unitinfo : function(item) {
			if(typeof(item.unitinfo) == "undefined" || typeof(item.unitinfo.name) == "undefined"){
				return "";
			}
			var unitname = baidu.encodeHTML(item.unitinfo.name),
			    html = [],
				bubble_string = ' class="ui_bubble" bubblesource="expandReport" bubbletitle="无法呈现报告" ',
				link_string = '<div class="link_icon" title="打开推广管理关键词列表" onclick=nirvana.displayReport.linkManage("keyword","'+item.unitinfo.id+'&ignoreState=1");return false;></div>',
				//判断是否已有下级物料决定是否可以下钻
				allow_expand = (typeof item.ideainfo == 'undefined' && typeof item.word == 'undefined') ? 'true' : 'false';
				
			if (this.isMatrix || !this.isInstantReport || unitname.indexOf('[已删除]') > -1) { //是母表或定制报告或是已删除
				html.push('<div><span title="' + unitname + '">' + unitname + '</span></div>');
			//	html.push(link_string);
				return html.join('');
			}
			else {		
				if (allow_expand == 'false'){
					html.push('<div><span title="' + unitname + '">' + unitname + '</span></div>');
				}else {
					var onclickStr = "onclick='nirvana.displayReport.expandInstantReportToKeyword(this);return false;'";
					if (this['data-platform'] != 2) { //网盟推广不能下钻到关键词
						html.push('<div><a href="#" title="' + unitname + '" ' +
						bubble_string + onclickStr + ' rel="unitinfo"  data-unitid="' + item.unitinfo.id + '">' + unitname + '</a>');
					}
					else {
						html.push('<div><span title="' + unitname + '">' + unitname + '</span>');
					}
					onclickStr = onclickStr.replace(/ToKeyword/, 'ToIdea');
					html.push('<span title="查看创意报告" class="idea_icon" data-unitid="' + item.unitinfo.id + '" ' + onclickStr + '></span></div>');
				//*修改一下变成创意icon链接
				}
				html.push(link_string);
				return html.join('');
			}
		},
		
		/**
		 * 创意列
		 * @param {Object} item
		 */
		ideainfo : function(item) {
			var idea = [
			               baidu.encodeHTML(item.ideainfo.ideatitle),
						   baidu.encodeHTML(item.ideainfo.ideadesc1),
						   baidu.encodeHTML(item.ideainfo.ideadesc2),
						   baidu.encodeHTML(item.ideainfo.ideaurl)
			           ];
			
			idea = ideaToOldFormat(idea);
			
			var html = IDEA_RENDER.idea(idea);
			
			return html.join('');
		},
		
		//蹊径子链
		creativeinfo : function(item){
			switch(item.creativeinfo.type){
				case 1:
				case 2:
					return item.creativeinfo.name;
				case 3:
					return "<span class='xj_sublink'>" + item.creativeinfo.name + "</span>";
			}
		},
		
		/**
		 * 关键词列
		 * @param {Object} item
		 */
		wordinfo : function(item) {
			if(typeof(item.word) == "undefined" || typeof(item.word.name) == "undefined"){
				return "";
			}
			
			var showword = baidu.encodeHTML(item.word.name),
			    winfoid = item.word.id,
			    planid = item.planinfo.id,
			    unitid = item.unitinfo.id,
				planname = item.planinfo.name,
				unitname = item.unitinfo.name,
				html = [],
				link_string = '<div class="link_icon" title="查看该关键词" onclick=nirvana.displayReport.linkManage("keywordDetail","'+'&unitid='+unitid+'&query='+showword+'&ignoreState=1");return false;></div>';
			
			if(showword == '网盟推广'){
				return '<i>' + showword + '<i>';
			}
			
			if(!this.isInstantReport){ //是定制报告
				return showword;
			}
			//修改调至推广链接
			if (!nirvana.queryReport.isFcMaterial(showword) || !nirvana.queryReport.isFcMaterial(planname) || !nirvana.queryReport.isFcMaterial(unitname)) { // 计划/单元/关键词已删除
				html.push('<div><span title="' + showword + '">' + showword + '</span></div');
			} else {
				html.push('<div><span title="' + showword + '">' + showword + '</span></div>');
				html.push(link_string);
			}
			
			return html.join('');
		},
		
		/**
		 * 监控文件夹列
		 * @param {Object} item
		 */
		folderinfo : function(item){
			var folderName = baidu.encodeHTML(item.folderinfo.name),
				link_string='<div class="link_icon" title="打开推广管理监控文件夹列表" onclick=nirvana.displayReport.linkManage("folder","~ignoreState=1&folderid='+item.folderinfo.id+'");return false;></div>',
			    //判断是否已有下级物料决定是否可以下钻
				allow_expand = (typeof item.word == 'undefined') ? 'true' : 'false',
				html = [];
				
			if (this.isMatrix || !this.isInstantReport || folderName.indexOf('[已删除]') > -1) { //是母表或定制报告或是已删除
				//	return folderName+link_string;
				html.push('<div><span title="' + folderName + '">' + folderName + '</span></div>');
				return html.join('');
			}
			else {
				if (allow_expand == 'false') {
					html.push('<div><span title="' + folderName + '">' + folderName + '</span></div>');
				}
				else {
					//不知为何在a标签外面加一个div，点击时就会跳转到推广概况页。
					html.push('<a style="display:block;" title="' + folderName + '" href="#" data-folderid="' + item.folderinfo.id + '" onclick="nirvana.displayReport.expandInstantReportToAvatarword(this);return false;" >' + folderName + '</a>');
				}
				html.push(link_string);
				return html.join('');
			}
		},
		
		/**
		 * 操作列
		 * @param {Object} item
		 */
		handle : function(item) {
			
			return '<div class="query_handle"></div>';
		},
		
		fixed : function(key){
			return function(item){
				var data = nirvana.report.lib.transWmatchFiled(item, key).data;
				
				if (typeof data == 'undefined' || data == '' || data == '-') {
					return data;
				}
				
				return fixed(data);
			}
		},
		
		percent : function(key){
			return function(item){
				var data = nirvana.report.lib.transWmatchFiled(item, key).data + "";
				
				if (data == '' || data == '-' || data.indexOf("%") > 0) {
					return data;
				}
				
				return floatToPercent(data);
			}
		},
		
		numeric : function(key){
			return function(item){
				var data = nirvana.report.lib.transWmatchFiled(item, key).data;
				
				if (data == '' || data == '-') {
					return data;
				}
				
				return parseNumber(data);
			}
		},
		
		ceilnum : function(key){
			return function(item){
				var data = nirvana.report.lib.transWmatchFiled(item, key).data;
				//console.log(data);
				if(data == null || data == 'null'){
					return '-';
				}else if (data == '' || data == '-') {
					return data;
				}else
					return ceil(data);
			}
		}
	},
	
	//分匹配模式报告，后台不能返回统一的字段名，前端必须处理一下
	transWmatchFiled: function(item, key){
		var indexes = ["all", "accu", "word", "wide"],
			actualKey;
		if (typeof(item[key]) != "undefined") {
			return {
				data: item[key],
				key: key
			}
		}
		for (var i = 0, l = indexes.length; i < l; i++) {
			actualKey = key + "_" + indexes[i];
			if (typeof(item[actualKey]) != "undefined") {
				return {
					data: item[actualKey],
					key: actualKey
				}
			}
		}
		return false;
	},
	
	/**
	 * 相对时间前台控件值 => 后台接口值的转换map
	 */
	relativeTransMap : {
		0	:	14, //昨天
		1	:	15, //最近七天
		2	:	10,	//上周
		3	:	5,	//本月
		4	:	6	//上月
	},
	/**
	 * relativeTransMap的反向
	 * 后台接口值 => 相对时间前台控件值的转换map
	 */
	getReverseRelativeTransMap : function(){
		var obj = {};
		for (var i in nirvana.report.lib.relativeTransMap){
			obj[nirvana.report.lib.relativeTransMap[i]] = i;
		}
		return obj;
	},
	
	/**
	 * 数据指标选择框
	 */
	itemsSelectPanel : {
		/**
		 * 开启选择框
		 */
		open : function(actionInstance){
			var me = this,
				dialog = ui.util.get('ReportItemSelectDialog');
			
			if (!dialog){
				dialog = ui.Dialog.factory.create({
					id : 'ReportItemSelectDialog',
					title : er.template.get('reportItemSelectTitle'),
					skin  : "modeless",
					dragable : false,
					needMask : false,
					unresize : true,
					father : baidu.g('Tools_report_body'),
		            width : 360,
					onok : function(){
						me.displayResults();
						actionInstance._updateOrderByOptions();
					}
				});
				me.setOptions(actionInstance);
				this.selectAllBtn = baidu.g('reportItemSelectAll');
				this.customBtn = baidu.g('reportItemSelectCustom');
				
				dialog.getBody().onclick = function(event){
					return me.clickHandler(event);
				};
				
				this.selectAllBtn.onclick = function(){
				   	me.selectAllItems();
					return false;
				};
				this.customBtn.onclick = function(){
				   	me.selectCustomItems();
					return false;
				}
			}else{
				me.setOptions(actionInstance);
			}
			dialog.show();
			ui.util.smartPosition(dialog.getDOM(),{
				pos : 'l',
				align : 't',
				target : 'itemSelectResult',
				repairL : 359,
				repairT : -64 + baidu.g('Tools_report_body').scrollTop
			});	
		},
		
		/**
		 * 根据不同的层级设置数据指标选项
		 * @param {Object} actionInstance
		 */
		setOptions : function(actionInstance){
				var me = this,
					html,
					rows = [],
					singleRow,
					rowClass,
					rowCount = 0,
					item,
					groupSuffix,
					disableString,
					itemMap = baidu.object.clone(me.itemMap),
					dialog = ui.util.get('ReportItemSelectDialog'),
			//		chargeModel = nirvana.report.chargeModel,
					mtlLevel = +actionInstance._controlMap['NewReportLevelAccount'].getGroup().getValue();
				
				//如果勾选了地域指标 就没有转化(电话)、电话追踪消费
				if(actionInstance._controlMap['NewReportAreaOption'].getChecked()){
					baidu.array.remove(itemMap, function(item){
					//	return item.value == "phonepay" || item.value == 'phonetrans';
						return item.value == 'phonetrans';
					});
				}
				//只有单元层级在 收费模式一  下有“电话追踪消费” 列
			/*	if (mtlLevel != 5 || chargeModel != 1) {									
					baidu.array.remove(itemMap, function(item){
						return item.value == "phonepay";
					});
				}*/
				//关键词和创意层级没有 “转化（电话）”列
				if (mtlLevel == 6 || mtlLevel == 7) {
					baidu.array.remove(itemMap, function(item){
						return item.value == "phonetrans";
					});
				}
				//只有关键词和创意层级下有 “平均排名” 列
				if (mtlLevel != 6 && mtlLevel != 7) {
					baidu.array.remove(itemMap, function(item){
						return item.value == "avgrank";
					});
				}
				//拼HTML
				for (var i = 0, l = itemMap.length; i < l; i = i + 2) {
					singleRow = [];
					rowCount++;
					for (var j = 0; j < 2; j++) { //每行两列
						item = itemMap[i + j];
						if (!item) {
							singleRow[singleRow.length] = '<td>&nbsp;</td>';
							break;
						}
						if (item.disabled) {
							groupSuffix = 'disabled';
							disableString = 'disabled:1;datasource:' + item.value;
						}
						else {
							groupSuffix = '';
							disableString = '';
						}
						singleRow[singleRow.length] = ui.format(er.template.get('reportItemSelectCol'), item.value, item.name, groupSuffix, disableString);
					}
					
					rowClass = ((rowCount + 1) % 2 == 1) ? 'odd' : 'even';
					
					rows[rows.length] = ui.format(er.template.get('reportItemSelectRow'), rowClass, singleRow.join(''));
				}
				
				html = ui.format(er.template.get('reportItemSelectContent'),
														rows.join('')
													);
				
				dialog.setContent(html);		
				me.controlMap = er.UIAdapter.init(baidu.g(dialog.getId()));
				me.itemCheckboxGroup = me.controlMap['reportItemCbclkrate'].getGroup();
				//默认全选
				me.selectAllItems();
		},
		
		/**
		 * 获取选中结果
		 */
		getSelectedItems : function(actionInstance){
			var itemCheckboxGroup = this.itemCheckboxGroup,
				items = [],
				mtlLevel = actionInstance._controlMap['NewReportLevelAccount'].getGroup().getValue(),
				dataItemCheckbox = ui.util.get('reportItemCbclkrate'),
				dataItemCheckboxList = [];
				
			if(dataItemCheckbox){
				dataItemCheckboxList = dataItemCheckbox.getGroup().getDOMList();
			}
			if(typeof itemCheckboxGroup == 'undefined' || dataItemCheckboxList.length == 0){ //表示没有打开过选择，直接返回全部指标
				for (var i = 0, l = this.itemMap.length; i < l; i++){
					if(!this.itemMap[i].disabled){ //仅计入可选的
						items[items.length] = this.itemMap[i].value;
					}
				}
				//只有单元层级在 收费模式一  下有“电话追踪消费” 列
		/*		if (mtlLevel != 5 || nirvana.report.chargeModel != 1) {									
					baidu.array.remove(items, function(item){
						return item == "phonepay";
					});
				}*/
				//关键词和创意层级没有 “转化（电话）”列
				if (mtlLevel == 6 || mtlLevel == 7) {
					baidu.array.remove(items, function(item){
						return item == "phonetrans";
					});
				}
			} else { //打开过选择
				items = itemCheckboxGroup.getValue();
				//items = dataItemCheckbox.getGroup().getValue();
			}
			
			//点击、消费、展现必选，对关键词和创意排名，平均排名也必选
			items = ['clks', 'paysum', 'shows'].concat(items);
			
			if (mtlLevel == 6 || mtlLevel == 7) {
				items = items.concat(['avgrank']);
			}
			
			return items;
		},
		
		/**
		 * 获取显示结果（三个加省略号）
		 */
		displayResults : function(){
			var itemCheckboxGroup = this.itemCheckboxGroup,
				checkboxList = itemCheckboxGroup.getDOMList(),
				items = [],
				str = '';
			for (var i = 0, l = checkboxList.length; i < l; i++){
				if (checkboxList[i].checked) {
					items[items.length] = checkboxList[i].title;
				}
			}
			
			if(items.length == l){
				baidu.g('itemSelectResult').innerHTML = '全部';
				return;
			} else if (items.length == 0){ //如果什么都没选
				baidu.g('itemSelectResult').innerHTML = '默认';
				return;
			}
			str = items.slice(0, 3).join('，');  //显示前三个
			if(items.length > 3){
				str += '...';
			}
			baidu.g('itemSelectResult').innerHTML = str;
		},
		
		clickHandler : function(e){
			var e = e || window.event,
			    target = e.target || e.srcElement,
				tagName = target.tagName.toLowerCase();
			
			
			
			if(tagName == 'input' && target.type == 'checkbox'){
				if (target.checked == false) {
					//有某一个被取消选中了
					this.selectCustomItems();
				} else {
					//检查是否全都被选中
					if(this.itemCheckboxGroup.getValue().length == this.itemCheckboxGroup.getDOMList().length){
						this.selectAllItems();
					}
				}
			}
			
			return true;
		},
			
		/**
		 * 选中全部指标
		 */
		selectAllItems : function(){
			this.selectAllBtn = baidu.g('reportItemSelectAll');
			this.customBtn = baidu.g('reportItemSelectCustom');
			baidu.dom.addClass(this.selectAllBtn, 'report_link_selected');
			baidu.dom.removeClass(this.customBtn, 'report_link_selected');
			this.itemCheckboxGroup.selectAll();
		},
		
		/**
		 * 自定义指标状态
		 */
		selectCustomItems : function(){
			baidu.dom.addClass(this.customBtn, 'report_link_selected');
			baidu.dom.removeClass(this.selectAllBtn, 'report_link_selected');
		},
		
		/**
		 * 指标集合
		 * disabled为true的为默认选中的
		 */
		itemMap : [
			{
				name : '时间',
				value : 'date',
				disabled : true
			},
			{
				name : '点击量',
				value : 'clks',
				disabled : true
			},
			{
				name : '账户',
				value : 'acct',
				disabled : true
			},
			{
				name : '展现量',
				value : 'shows',
				disabled : true
			},
			{
				name : '推广计划',
				value : 'plan',
				disabled : true
			},
			
			{
				name : '点击率',
				value : 'clkrate'
			},
			{
				name : '推广单元',
				value : 'unit',
				disabled : true
			},
			{
				name : '转化(网页)',
				value : 'trans'
			},
			{
				name : '关键词',
				value : 'keyword',
				disabled : true
			},
			{
				name : '转化(电话)',
				value : 'phonetrans'
			},
			{
				name : '消费',
				value : 'paysum',
				disabled : true
			},
		/*	{
				name : '电话追踪消费',
				value : 'phonepay'
			},*/
			{
				name : '平均点击价格',
				value : 'avgprice'
			},
			{
				name : '平均排名',
				value : 'avgrank',
				disabled : true
			}

		],
		
		dispose : function(){
			var panel = ui.util.get('ReportItemSelectDialog');
			panel && ui.util.dispose('ReportItemSelectDialog');
		}
	
	},
	
	/**
	 * Flash指标
	 */
	flashItems : {
		init : function(actionInstance){
			var me = actionInstance,
				params = me.getContext('currentParams'),
				dataitem = params.dataitem,
				oneItem = ui.util.get('chartClks'),
				wrapper = oneItem.main.parentNode,
				flashItemsDOM = oneItem.getGroup().getDOMList(),
				checkbox,
				isFirst = true;
			
			this.nowChecked = [];	
			
			//先把已经选的读进来（适用于alter之后）	
			for (var i = 0, l = flashItemsDOM.length; i < l; i++) {
				checkbox = flashItemsDOM[i];
				if(checkbox.checked){
					this.nowChecked.push(checkbox);
				}
			}
					
			for (var i = 0, l = flashItemsDOM.length; i < l; i++){
				checkbox = flashItemsDOM[i];
				
				if(baidu.array.indexOf(dataitem, checkbox.value) > -1){
					checkbox.disabled = false;
					if(this.nowChecked.length == 0){
						checkbox.checked = true;
						this.nowChecked.push(checkbox);
					}
				} else {
					checkbox.checked = false;
					checkbox.disabled = true;
				}
			}
			
			wrapper.onclick = this.getClickHandler(me);
			
			var that = this;
			ui.util.get('chartAvg').onclick = function(){
				that.setAvgDisplay();
			}
		},
		
		//按选中顺序存储的已选序列
		nowChecked : [],
		
		//每个flash的高度
		perHeight : 270,
		
		getSelected : function(){
			return ui.util.get('chartClks').getGroup().getValue();
		},
		
		getClickHandler : function(actionInstance){
			var me = this;
			return function(e){
				var e = e || window.event, 
					target = e.target || e.srcElement, 
					tagName = target.tagName.toLowerCase();
				if (tagName == 'input' && target.type == 'checkbox') {
					if (target.checked) {
						me.nowChecked.push(target);
						//检查是否超过六个
				/*		if(me.nowChecked.length > 6){
							var shift = me.nowChecked.shift();
							shift.checked = false;
						}*/
					} else {
						if(me.nowChecked.length == 1){ //最后一个不让取消
							return false;
						}
						for(var i in me.nowChecked){
							if(me.nowChecked[i].value == target.value){
								me.nowChecked.splice(i, 1);
							}
						}
					}
				}
				invokeFlash('ReportChartGraphFlash','showLoading',[], null, 31);
				nirvana.displayReport.displayInstantReportChart(actionInstance);
				me.setAvgDisplay();
			}
		},
		
		/**
		 * 控制是否显示平均值
		 */
		setAvgDisplay : function(){
			var chartAvg = ui.util.get('chartAvg'),
				value = chartAvg.getChecked();
			
			if(!chartAvg.state.disabled){
				invokeFlash('ReportChartGraphFlash','showAverage',[value]);
			}
		}
	},
	
	/**
	 * 获取报告快捷模板的参数
	 */
	getParamsTemplate : function(type, actionInstance){
		var params = baidu.object.clone(this._paramsTemplate[type]);

		//时间统一默认最近七天
		var dateRange = nirvana.util.dateOptionToDateValue(1);
		baidu.extend(params, {
			isrelativetime	:	1,
			relativetime	:	15,
			starttime		:	baidu.date.format(dateRange.begin, 'yyyy-MM-dd'),
			endtime			:	baidu.date.format(dateRange.end, 'yyyy-MM-dd')
		});
		
		params = baidu.extend(baidu.object.clone(actionInstance.defaultParams), params);
		return params;
	},
	
	
	//调用table的resize
	_resizeTable : function(){
		var reportTable = ui.util.get('reportTable');
		reportTable &&
		reportTable.handleResize && 
		reportTable.handleResize();
	},
	
	/**
	 * 快捷模块的定义
	 */
	_paramsTemplate : {
		account : {
			mtldim			:	'2',
			mtllevel		:	'2',
			reporttype		:	2
		},
		
		plan : {
			mtldim			:	'2',
			mtllevel		:	'3',
			reporttype		:	10
		},
		
		unit : {
			mtldim			:	'2',
			mtllevel		:	'5',
			reporttype		:	11
		},
		
		keyword : {
			mtldim			:	'2',
			mtllevel		:	'6',
			reporttype		:	9
		},
		
		idea : {
			mtldim			:	'2',
			mtllevel		:	'7',
			reporttype		:	12
		},
		
		sublink : {
			mtldim			:	'2',
			mtllevel		:	'6',
			reporttype		:	21
		},
		
		region : {
			mtldim			:	'2',
			mtllevel		:	'2',
			reporttype		:	3
		},
		
		custom : {
			mtldim			:	'2',
			platform		:	'0',
			mtllevel		:	'2',
			dataitem		:	nirvana.report.numericItem,
			sortlist		:	'time'
		},
		avatarfile : {
			mtldim			:	'8',
			mtllevel		:	'8',
			reporttype		:	17, //监控文件夹类型
			platform		:   '1'
		},
		avatarword : {
			mtldim			:	'8',
			mtllevel		:	'9',
			reporttype		:	17, //选择监控关键词时
			platform		:   '1'
		},
		invalid : {
			mtldim			:	'2',
			mtllevel		:	'2',
			reporttype		:	13
		},
		match : {
			mtldim			:	'2',
			mtllevel		:	'6',
			reporttype		:	4,
			platform		:	'1'
		}
	}
	
};
/**
 * 表格列定义全集
 */
nirvana.report.lib.tableFields = {
	date		:	{
						content: nirvana.report.lib.tableRender.date,
						footContent : 'platform',
						title: '时间',
						field : 'date',
						sortable : true,
						width:120,
						locked: true			
					},
	useracct	:	{
						content: nirvana.report.lib.tableRender.useracct,
						title: '账户',
						field : 'useracct',
						sortable : true,
						width: 50
					},
	planinfo	:	{
						content: nirvana.report.lib.tableRender.planinfo,
						title: '推广计划',
						field : 'planname',
						sortable : true,
						width: 50
					},
	unitinfo	:	{
						content: nirvana.report.lib.tableRender.unitinfo,
						title: '推广单元',
						field : 'unitname',
						sortable : true,
						width: 50
					},
	ideainfo	:	{
						content: nirvana.report.lib.tableRender.ideainfo,
						title: '创意',
						field : 'idea',
						stable : true,
						width: 270,
						minWidth :270
					},
	creativeinfo: 	{
						content: nirvana.report.lib.tableRender.creativeinfo,
						title: '蹊径子链',
						field : 'creativeinfo',
						stable : true,
						width: 120,
						minWidth :120
	},
	word		:	{
						content: nirvana.report.lib.tableRender.wordinfo,
						title: '关键词',
						field : 'showword',
						sortable : true,
						width: 50
					},
	prov		:	{
						content: function(item){
							return item.prov.name;
						},
						title: '地域',
						field : 'prov',
						sortable : true,
						width: 50
					},
	clks		:	{
						content: nirvana.report.lib.tableRender.numeric('clks'),
						footContent : nirvana.report.lib.tableRender.numeric('clks'),
						title: '点击量',
					/*	title: function(){
							var reporttype = nirvana.report.currentReportType;
							if (typeof(reporttype) != "undefined" && reporttype == 13) {
								return "过滤前点击量";
							}
							else {
								return "点击量";
							}
						},*/
						field : 'clks',
						sortable : true,
						width: 50,
						align	:	'right'
					},
	shows		:	{
						content: nirvana.report.lib.tableRender.numeric('shows'),
						footContent : nirvana.report.lib.tableRender.numeric('shows'),
						title: '展现量',
						field : 'shows',
						sortable : true,
						width: 50,
						align	:	'right',
						noun: true,
						minWidth: 95
					},
	paysum		:	{
						content: nirvana.report.lib.tableRender.fixed('paysum'),
						footContent : nirvana.report.lib.tableRender.fixed('paysum'),
						title: '消费',
						field : 'paysum',
						sortable : true,
						width: 50,
						align	:	'right'
					},
	antpaysum		:	{
						content: nirvana.report.lib.tableRender.fixed('antpaysum'),
						footContent : nirvana.report.lib.tableRender.fixed('antpaysum'),
						title: '过滤金额',
						field : 'antpaysum',
						sortable : true,
						width: 50,
						align	:	'right'
					},
	clkrate		:	{
						content: nirvana.report.lib.tableRender.percent('clkrate'),
						footContent : nirvana.report.lib.tableRender.percent('clkrate'),
						title: '点击率',
						field : 'clkrate',
						sortable : true,
						width: 50,
						align	:	'right',
						noun: true,
						minWidth: 95
					},
	avgprice	:	{
						content: nirvana.report.lib.tableRender.fixed('avgprice'),
						footContent: nirvana.report.lib.tableRender.fixed('avgprice'),
						title: '平均点击价格',
						field : 'avgprice',
						sortable : true,
						width: 50,
						align	:	'right',
						noun: true,
						minWidth: 125
					},
	avgrank	:	{
						content: nirvana.report.lib.tableRender.fixed('avgrank'),
						footContent: nirvana.report.lib.tableRender.fixed('avgrank'),
						title: '平均排名',
						field : 'avgrank',
						sortable : true,
						width: 50,
						align	:	'right'
					},
	trans		:	{
						content: nirvana.report.lib.tableRender.numeric('trans'),
						footContent: nirvana.report.lib.tableRender.numeric('trans'),					
						title: '转化(网页)',
						field : 'trans',
						sortable : true,
						width: 50,
						align	:	'right',
						noun: true,
						minWidth: 120,
						nounName:"转化(网页)"
					},
	phonetrans	:	{
						content: nirvana.report.lib.tableRender.numeric('phonetrans'),
						footContent: nirvana.report.lib.tableRender.numeric('phonetrans'),					
						title: '转化(电话)',
						field : 'phonetrans',
						sortable : true,
						width: 50,
						align	:	'right',
						noun: true,
						minWidth: 120,
						nounName:"转化(电话)"
					},
/*	phonepay	:	{
						content: nirvana.report.lib.tableRender.fixed('phonepay'),
						footContent: nirvana.report.lib.tableRender.fixed('phonepay'),					
						title: '电话追踪消费',
						field : 'phonepay',
						sortable : true,
						width: 70,
						align	:	'right',
						noun: true,
						minWidth: 125,
						nounName:"电话追踪消费"
						},*/
	wmatch		:	{
						content: 'wmatch',					
						title: '当前匹配方式',
						field : 'wmatch',
						sortable : true,
						width: 50,
						align	:	'right'
					},
	bid			:	{
						content: nirvana.report.lib.tableRender.fixed('bid'),					
						title: '当前出价',
						field : 'bid',
						sortable : true,
						width: 50,
						align	:	'right'
					},
	platform	:	{
						content: 'platform',					
						title: '推广方式',
						field : 'platform',
						sortable : true,
						width: 50,
						align	:	'right'
					},
	showpay		:	{
						content: nirvana.report.lib.tableRender.fixed('showpay'),
						footContent:nirvana.report.lib.tableRender.fixed('showpay'),					
						title: '千次展现消费',
						field : 'showpay',
						sortable : true,
						width: 50,
						align	:	'right'
					},
	rawclks		:	{
						content: nirvana.report.lib.tableRender.numeric('rawclks'),
						footContent : nirvana.report.lib.tableRender.numeric('rawclks'),
						title: '过滤前点击量',
						field : 'clks',
						sortable : true,
						width: 50,
						align	:	'right'
					},
	antclks		:	{
						content: nirvana.report.lib.tableRender.numeric('antclks'),
						footContent : nirvana.report.lib.tableRender.numeric('antclks'),				
						title: '过滤点击量',
						field : 'antclks',
						sortable : true,
						width: 50,
						align	:	'right'
					},
	antrate		:	{
						content: nirvana.report.lib.tableRender.percent('antrate'),
						footContent : nirvana.report.lib.tableRender.percent('antrate'),					
						title: '过滤比率',
						field : 'antrate',
						sortable : true,
						width: 50,
						align	:	'right'
					},
	folderinfo	:	{
						content: nirvana.report.lib.tableRender.folderinfo,					
						title: '监控文件夹',
						field : 'folderinfo',
						sortable : true,
						width: 50,
						align	:	'left'
					}
	};
	
/***报表展现部分函数库****/
nirvana.report.lib.display = {
	
	actionInstance : {},
	
	/**
	 * 根据排序参数等处理返回的数据
	 * @param {Object} data
	 * @author tongyao@baidu.com
	 */
	processInstantReportData : function(response, actionInstance, timedim){
		var me = actionInstance,
			response = baidu.object.clone(response); //避免污染cache中的对象
			
		if(response.status == 500){
			ajaxFailDialog();
			return ;
		}
		
		var errorCode = response.errorCode.code,
			isByDay = false;
			
		this.actionInstance = actionInstance;	
		var reportNameLabel = ui.util.get('reportName');
		reportNameLabel.datasource = '';
		reportNameLabel.render();
		
		baidu.removeClass('ReportView', 'hide');
		baidu.addClass('ReportErrorNeedDownload', 'hide');
		baidu.addClass('ReportErrorNeedSubscribe', 'hide');
		
		if(errorCode){
			
			//这里假装设置一个0
			me.setContext('reportTableRows', 0);
			
			//设定下载报告、循环报告、发送报告的状态 
			this.setReportControl(me, errorCode);
			
			baidu.addClass('ReportChart', 'hide');
			baidu.addClass('ReportTableWrap', 'hide');
			
			if (errorCode == 1900 || errorCode == 1901) {
				//为错误信息提示中的链接添加事件...
				baidu.g('ReportErrorNeedDownload').onclick = baidu.g('ReportErrorNeedSubscribe').onclick = function(e) {
					var e = e || window.event,
						target = e.target || e.srcElement,
						tagName = target.tagName.toLowerCase();
					if (tagName == 'a' && target.rel) {
						if(target.rel == 'download')
							nirvana.report.lib.display._showDownloadSubAction(me);
						if(target.rel == 'send')
							nirvana.report.lib.display._showMailSubAction();
						if(target.rel == 'cycle')
							nirvana.report.lib.display._showCycleSubAction('add');
					}
					baidu.event.preventDefault(e);
					
				};
				if (errorCode == 1900) { //超出5000条，提示下载
					baidu.removeClass('ReportErrorNeedDownload', 'hide');
					return true;
				}
				else 
					if (errorCode == 1901) { //预约报告
						baidu.removeClass('ReportErrorNeedSubscribe', 'hide');
						//me._confirmSubscribe();
						return true;
					}
			}
		}
				
		//隐藏参数部分
		//me._toggleParamsContainer(false);
		baidu.removeClass('ReportTableWrap', 'hide');
		
		var data = response['data']['DATA'],
			col = response['data']['COL'],
			rows = data.length,
			expandHistory = me.getContext('expandHistory'),
			currentParams = me.getContext('currentParams'),
			table = me._controlMap.reportTable,
			matrixTable = me._controlMap['reportMaxtrixTable'],
			controlMap = me._controlMap,
			pagination = controlMap['reportPagination'],
			isInstantReport = me.getContext('isInstantReport');
		
		var dateRange = me._controlMap['NewReportCalendar'].getValue();
		var starttime = baidu.date.format(dateRange.begin, 'yyyy-MM-dd'),
		endtime = baidu.date.format(dateRange.end, 'yyyy-MM-dd');
		reportNameLabel.datasource = starttime+"至"+endtime+' ' + response['data']['REPORTNAME'];
		reportNameLabel.render();	
		
		
		//根据返回值构造表列
		var col = nirvana.report.lib.buildTableCol(col);
		table.fields = col;
		table.resetTableAfterFieldsChanged();
		matrixTable.resetTableAfterFieldsChanged();
		table.isInstantReport = isInstantReport;
		//用于判断是否网盟推广
		table['data-platform'] = currentParams.platform;
		
		me.setContext('reportTableFields', baidu.object.clone(col));
		
		me.setContext('reportTableData', data);
		
		me.setContext('reportTableRows', rows);
		
		//设定下载报告、循环报告、发送报告的状态 
		this.setReportControl(me, errorCode);
		
		// 计算总页数
		var totalPage = Math.ceil(rows / me.getContext('pageSize'));
		pagination.total = totalPage;
		
		//对于下钻的报告，显示目标
		if(starttime == endtime){
			isByDay = true;
		}
		nirvana.displayReport.renderInstantReportMatrixTable(timedim, isByDay);
		
		//组装表尾合计数据
		nirvana.displayReport.buildSumData(response['data']['SUM'], actionInstance);
		//显示表格
		nirvana.displayReport.renderInstantReportTable(data, actionInstance);
		
		if(rows == 0){ //没数据
			baidu.dom.addClass('ReportChart', 'hide');
			return;
		}
		
		
		if (currentParams.timedim != 8 && currentParams.reporttype != 13 && currentParams.reporttype != 4 && currentParams.reporttype != 21) { 
			//不分日分周分月报告不提供图表，特殊权限报告不显示图表
			baidu.dom.removeClass('ReportChart', 'hide');
			var chartAvg = ui.util.get('chartAvg');
			nirvana.displayReport.initInstantReportChart(data, me);
		} else {
			baidu.dom.addClass('ReportChart', 'hide');
		}
	},
	
	/**
	 * 设定下载报告、循环报告、发送报告的状态 
	 * @author tongyao@baidu.com
	 */
	setReportControl : function(actionInstance, errorCode){
		var me = actionInstance || this.actionInstance,
			that = this,
			currentParams = me.getContext('currentParams'),
			reportRows = me.getContext('reportTableRows'),
			btnWrap = 'ReportControl',
			downloadBtnSpan = baidu.q('report_download', btnWrap, 'span')[0],
			downloadBtn = downloadBtnSpan.firstChild,
			cycleBtnSpan = baidu.q('report_cycle', btnWrap, 'span')[0],
			cycleBtn = cycleBtnSpan.firstChild,
			mailBtnSpan = baidu.q('report_mail', btnWrap, 'span')[0],
			mailBtn = mailBtnSpan.firstChild,
			nullFunction = function(){
				return false;
			};
		
		// 赋值actionInstance，在下载循环的时候保证有action
		that.actionInstance = me;
		
	//蹊径子链报告屏蔽定制报告、循环报告和发送报告功能
	if(currentParams.reporttype != 21){
		if(currentParams.reporttag == 1){ //循环报告
			baidu.removeClass(cycleBtnSpan, 'disabled');
			cycleBtn.innerHTML = '已循环报告';
			cycleBtn.onclick = function(){
				that._showCycleSubAction('modify');
				return false;
			}
		} else if(currentParams.isrelativetime){ //可以循环
			baidu.removeClass(cycleBtnSpan, 'disabled');
			cycleBtn.innerHTML = '循环报告';
			cycleBtn.onclick = function(){
				that._showCycleSubAction('add');
				return false;
			}
		} else { //不能循环
			baidu.addClass(cycleBtnSpan, 'disabled');
			cycleBtn.innerHTML = '无法循环';
			cycleBtn.onclick = nullFunction;
		}
	}else{
		baidu.addClass(cycleBtnSpan, 'disabled');
		cycleBtn.innerHTML = '无法循环';
		cycleBtn.onclick = nullFunction;
	}
	
	
		if((!errorCode && reportRows == 0) || (errorCode && errorCode == 1901)){ //必须预约，无法下载
			baidu.addClass(downloadBtnSpan, 'disabled');
			downloadBtn.innerHTML = '无法下载';
			downloadBtn.onclick = nullFunction;
		} else { //可以下载
			baidu.removeClass(downloadBtnSpan, 'disabled');
			downloadBtn.innerHTML = '下载报告';	
			downloadBtn.onclick = function(){
				that._showDownloadSubAction();
				return false;
			}
		}
		
		if (reportRows != 0 && currentParams.reporttype != 21) {
			baidu.removeClass(mailBtnSpan, 'disabled');
			mailBtn.innerHTML = '发送报告';	
			mailBtn.onclick = function(){
				that._showMailSubAction();
				return false;
			}
		} else {
			baidu.addClass(mailBtnSpan, 'disabled');
			mailBtn.innerHTML = '无法发送';	
			mailBtn.onclick = nullFunction;
		}
			
	},
	
	/**
	 * 显示下钻后的返回上一级链接 modified by huanghainan
	 * @author tongyao@baidu.com
	 */
	renderInstantReportMatrixTable : function(timedim, isByDay){
		var me = this.actionInstance,
			expandHistory = me.getContext('expandHistory'),
			unit_id = '',
			row_index = null,
			reportNameLabel = ui.util.get('reportName'),
			onclickStr = "";
		
		if(expandHistory && expandHistory.length > 0){
		//	console.log(me.getContext('newReportSelectedData'));
			if (timedim != 5 || isByDay) { //非时间下钻时才判断
				if (me.getContext('newReportSearch') == 7 && me.getContext('newReportSelectedData').length != 0) {
					var errorcode = me.getContext('keywordError');
					if (errorcode == 0) {
						unit_id = me.getContext('newReportSelectedData')[0].id;
						row_index = me.getContext('newReportSelectedData')[0].rowIndex;
						onclickStr = "onclick='nirvana.displayReport.expandInstantReportToKeyword(this," + row_index + "," + 1 + ");return false;'";
						reportNameLabel.datasource = reportNameLabel.datasource + '&nbsp;|&nbsp;' + '<a href="#" data-unitid="' + unit_id + '" ' + onclickStr + '>查看关键词报告</a>';
						reportNameLabel.render();
					}
				}
				if (me.getContext('newReportSearch') == 6 && me.getContext('newReportSelectedData').length != 0) {
					unit_id = me.getContext('newReportSelectedData')[0].id;
					row_index = me.getContext('newReportSelectedData')[0].rowIndex;
					onclickStr = "onclick='nirvana.displayReport.expandInstantReportToIdea(this," + row_index + "," + 1 + ");return false;'";
					reportNameLabel.datasource = reportNameLabel.datasource + '&nbsp;|&nbsp;' + '<a href="#" data-unitid="' + unit_id + '" ' + onclickStr + '>查看创意报告</a>';
					reportNameLabel.render();
				}
			}			
			baidu.dom.removeClass(baidu.g('ReportFoldBtn').parentNode, 'hide');
		}else {
			baidu.dom.addClass(baidu.g('ReportFoldBtn').parentNode, 'hide');
		}
	},
	
	renderInstantReportTable : function(data, actionInstance){
		var me = actionInstance,
			table = me._controlMap.reportTable,
			pagination = me._controlMap.reportPagination,
			pageSize = me.getContext('pageSize'),
			pageNum	 = me.getContext('pageNum'),
			tableData = nirvana.util.getPageData(data, pageSize, pageNum);
			
		//蹊径子链报告特殊处理，一条数据要展示成若干行
		if (me.getContext('currentParams').reporttype == 21) {
			table.datasource = nirvana.displayReport.getSublinkTableData(tableData);
			table.sortable = false;
		}
		else {
			table.datasource = tableData;
			table.sortable = true;
		}
		table.render();	
		
		if(me.getContext('isInstantReport')){
			ui.Bubble.init();
		}
		
		
		if (pagination.total > 1) {
			// 分页更新
			baidu.show(pagination.getId());
			pagination.page = me.getContext('pageNum');
			pagination.render();
		} else {
			baidu.hide(pagination.getId());
		}
	},
	
	/**
	 * 重新组装子链数据，一条数据要展示成若干行
	 * @param {Object} data
	 */
	getSublinkTableData: function(data){
		var sumData = {}, majorData = {}, subData = {}, dataItem, subinfo, majorinfo, newData = [], defaultData, item, i, j, len, sublen, subItem;
		defaultData = {
			"date": "",
			"useracct": "",
			"planinfo": "",
			"unitinfo": "",
			"word":""
		};
		for (i = 0, len = data.length; i < len; i++) {
			dataItem = baidu.object.clone(data[i]);
			subinfo = dataItem.creativeinfo;
			majorinfo = dataItem.majorinfo;
			delete dataItem.creativeinfo;
			delete dataItem.majorinfo;
			//没有总和行
		/*	dataItem.creativeinfo = {
				type: 1,
				text:"总和"
			};
			newData[newData.length] = dataItem;*/
			//主链 行
			dataItem.creativeinfo = {
				type: 2,
				name:"主链"
			};
			delete majorinfo.name;
			for (item in majorinfo) {
				dataItem[item] = majorinfo[item];
			}
		//	majorData = baidu.extend(baidu.object.clone(defaultData), majorData);
			newData[newData.length] = dataItem;
			//子链行
			for (j = 0, sublen = subinfo.length; j < sublen; j++) {
				subItem = subinfo[j];
				subData.creativeinfo = {
					type: 3,
					name: subItem.name
				};
				delete subItem.name;
				for (item in subItem) {
					subData[item] = subItem[item];
				}
				subData = baidu.extend(baidu.object.clone(defaultData), subData);
				newData[newData.length] = subData;
				subData = {};
			}
		}
		return newData;
	},
	
	/**
	 * 组装表尾合计数据
	 * @param {Object} sum
	 * @param {Object} actionInstance
	 * @param {=boolean} isMyReport 可选参数，是否是我的报告
	 	因为它是来自于一个文件，不会发3次请求，因此当前是无法呈现PC、Phone这种分设备的
	 */
	buildSumData : function(sum, actionInstance, isMyReport){
		var me = actionInstance,
			table = me._controlMap.reportTable,
			sumLength = sum.length,
			currentParams = me.getContext('currentParams'),
			mtag = currentParams.mtag,
			sumData = baidu.object.clone(sum);
		//var type1 = baidu.getAttr($$("#ReportParamsShortcut a.current")[0], "rel");
        var type = currentParams.reporttype;
        //console.log(sumData);
		if(me.getContext('reportTableRows') == 0 || currentParams.reporttype == 21){
			table.hasFoot = false;
			return;
		}
		
		if(sumLength == 1){ //只有一行的情况
			sumData[0].platform = '合计';
			sumData[0].avgrank = '-';
		}
		
		else if( nirvana.report.lib.isDeviceRelated(type) && !me.getContext('isCustom') ){

			if(isMyReport) {
				sumData[0] = sumData[2];
				sumData.length = 1;
				sumData[0].platform = '合计';
				sumData[0].avgrank = '-';
			}
			else {
				//如果是计划报告特殊处理
				if(mtag == '0' || mtag == '1'){
					//计算机 or 移动设备
					sumData[0] = sumData[2];
					sumData.length = 1;
					sumData[0].platform = '合计';
					sumData[0].avgrank = '-';
				}else{
					//全部设备
					nirvana.displayReport.devicesumData.All = sumData[2];
					nirvana.displayReport.buildAllDevicesumData(actionInstance);
					return;
				}
			}
			
		} 
		// 这个分支根本走不到了，怪异的判断……
		// Leo
		else if(!me.getContext('isCustom') &&
			(currentParams.reporttype == 2 || currentParams.reporttype == 9 || currentParams.reporttype == 11 || currentParams.reporttype == 12)){
			//账户、单元、关键词、创意报告的汇总数据仅有合计
			sumData[0] = sumData[2];
			sumData.length = 1;
			sumData[0].platform = '合计';
			sumData[0].avgrank = '-';
		} else { //有三行的情况
			var totalType = ['搜索推广','网盟推广','合计'],
				firstRow = {};

			for(var i = 0, l = sumData.length; i < l; i++){
				sumData[i].platform = totalType[i];
				sumData[i].avgrank = '-';
			}
			for(var i in sumData[0]){ //补充三行情况下的第一行
				firstRow[i] = '';
			}
			firstRow['platform'] = '合计';
			
			sumData.unshift(firstRow);
		}
		
		table.hasFoot = true;
		table.footdata = sumData;
			
	},
	
	/**
	 * 用来存汇总信息
	 */
	devicesumData : {},
	
	/**
	 *获取计划报告下全部设备数据
	 */
	getAllDevicesumData : function(actionInstance,params){
		var me = actionInstance;
		
		//获取计算机的数据
		params.mtag = 0;
		fbs.report.getMarsReport({
			reportinfo : params,
			onSuccess : function(data){
				nirvana.displayReport.devicesumData.PC = data.data.SUM[2];
				nirvana.displayReport.buildAllDevicesumData(actionInstance);
			},
			onFail : function(){
				ajaxFailDialog();
			}
		})
		//移动设备的数据
		params.mtag = 1;
		fbs.report.getMarsReport({
			reportinfo : params,
			onSuccess : function(data){
				nirvana.displayReport.devicesumData.Phone = data.data.SUM[2];
				nirvana.displayReport.buildAllDevicesumData(actionInstance);
			},
			onFail : function(){
				ajaxFailDialog();
			}
		})
		delete(params.mtag);
	},
	
	/**
	 *计划报告下全部设备数据汇总 
	 */
	buildAllDevicesumData : function(actionInstance){
		var me = actionInstance,
			table = me._controlMap.reportTable,
			deviceData = nirvana.displayReport.devicesumData,
			sumData = [];
		
		//如果数据不全返回
		if(!deviceData.PC || !deviceData.Phone || !deviceData.All ){
			return;
		}
		sumData[0] = deviceData.PC;
		sumData[1] = deviceData.Phone;
		sumData[2] = deviceData.All;
		
		//对数据进行处理
		var totalType = ['计算机','移动设备','合计'],
			firstRow = {};

		for(var i = 0, l = sumData.length; i < l; i++){
			sumData[i].platform = totalType[i];
			sumData[i].avgrank = '-';
		}
		for(var i in sumData[0]){ //补充三行情况下的第一行
			firstRow[i] = '';
		}
		firstRow['platform'] = '合计';
		
		sumData.unshift(firstRow);
		table.hasFoot = true;
		table.footdata = sumData;
		table.renderFoot();
	},
	/**
	 * 初始化图表
	 */
	initInstantReportChart: function(data, actionInstance){
		var me = actionInstance, currentParams = me.getContext('currentParams');
		
		this.actionInstance = actionInstance;
		
		//确定有图后，先复制一份data来使用
		data = baidu.object.clone(data);
		
		nirvana.report.lib.flashItems.init(me);
		
		var url = './asset/swf/MultiPolyLine.swf';
		baidu.g('ReportChartGraph').innerHTML = baidu.swf.createHTML({
			id: "ReportChartGraphFlash",
			url: url,
			width: '100%',
			height: nirvana.report.lib.flashItems.perHeight * 4,
			scale: 'showall',
			wmode: 'Opaque',
			allowscriptaccess: 'always'
		});
		invokeFlash('ReportChartGraphFlash', 'showLoading', [], null, 31);
		
		
		//给flash的数据 要确保结果是按时间正序的
		data.sort(function(row1, row2){
			return baidu.date.parse(row1.date) - baidu.date.parse(row2.date);
		});
		
		
		
		//根据情况补充空出的时间的数据
		//直接对data本身进行操作
		switch (currentParams.timedim) {
			case 3: //分月
				nirvana.displayReport._padMonthlyChartData(data, me);
				break;
			case 4: //分周
				nirvana.displayReport._padWeeklyChartData(data, me);
				break;
			case 5: //分日
				nirvana.displayReport._padDailyChartData(data, me);
				break;
		}
		
		me.setContext('reportChartData', data);
		
		nirvana.displayReport.displayInstantReportChart(me);
		
		nirvana.report.lib.flashItems.setAvgDisplay();
	},
	
	/**
	 * 显示图表
	 * @param {Object} actionInstance
	 */
	displayInstantReportChart : function(actionInstance){
		var me = actionInstance,
			selectedItems = nirvana.report.lib.flashItems.getSelected(),
			data = baidu.object.clone(me.getContext('reportChartData'));
			
		nirvana.displayReport.resizeFlashContainerHeight();
		var flashXml = nirvana.displayReport._buildPolyLineData(selectedItems, data, me); //组装折线图数据

		nirvana.displayReport.renderInstantReportChart(flashXml, me);
	},
	
	/**
	 * 根据指标数量调整图表高度
	 */
	resizeFlashContainerHeight: function(){
		var	nowChecked = nirvana.report.lib.flashItems.nowChecked,
			perHeight = nirvana.report.lib.flashItems.perHeight;
		
		baidu.g("ReportChartGraph").style.height = Math.ceil(nowChecked.length/2) * perHeight + "px";
	},
	
	/**
	 * 渲染数据图表
	 * @param {Object} flashXml
	 * @author tongyao@baidu.com
	 */
	renderInstantReportChart : function(flashXml, actionInstance){
	//	console.log(flashXml);
		invokeFlash('ReportChartGraphFlash','setData',[flashXml]);
	},
	
	/**
	 * 按日期下钻报告
	 * @param {Object} e
	 */
	expandInstantReportByDate : function(obj){
		var dateObj = obj.getAttribute('data-date').split('至'),
			rowIndex = obj.parentNode.parentNode.getAttribute('row'),
			reportTable = ui.util.get('reportTable'),
			currentParams = this.actionInstance.getContext('currentParams'),
			
			//判断表格一行数据，选出粒度最小的一项的id
			rowData = baidu.object.clone(reportTable.datasource[rowIndex]),
		
			params = {
				starttime	:	dateObj[0],
				endtime		:	dateObj[1],
				isrelativetime	:	0,
				timedim		:	5,
				mtldim		:	currentParams.mtllevel //按时间下钻时，dim就变成了当前的level
			},
			mtldim,
			dimid;
		
		//从下向上
		if(rowData.ideainfo){
			params.idset = [rowData.ideainfo.ideaid];
		} else {
			dimid = rowData.word || rowData.unitinfo || rowData.planinfo ||  rowData.useracct;
			if(dimid) {
				params.idset = [dimid.id];
			}
		}
		//修改监控文件夹报告时间下钻 idset
		var me = this.actionInstance;
		if(rowData.folderinfo){
			params.idset = [rowData.folderinfo.id];
		}
		if (rowData.word) {
			params.idset = [rowData.word.id];
			params.mtldim = '6';
			if (!rowData.creativeinfo) {
				var tempParams = nirvana.report.lib.getParamsTemplate('keyword', me);
				params.mtllevel = tempParams.mtllevel;
				params.reporttype = tempParams.reporttype;
			}
		}
		//console.log(params);
		this.actionInstance.expandInstantReport(params, rowIndex);
	},
	/**
	 * 下钻报告至计划
	 * @param {Object} e
	 */
	expandInstantReportToPlan : function(obj){		
		var	rowIndex = obj.parentNode.parentNode.parentNode.getAttribute('row'),
			reportTable = ui.util.get('reportTable'),
			params = {
				mtllevel    : '3',
				mtldim		: '2',
				reporttype	: 10
			};
		
		//判断表格一行数据，读出日期
		var rowDate = baidu.object.clone(reportTable.datasource[rowIndex].date);
		rowDate = rowDate.split('至');
		params.starttime = rowDate[0];
		params.endtime = rowDate[rowDate.length - 1];
		this.actionInstance.setContext('newReportSearch', 3);
		this.actionInstance.expandInstantReport(params, rowIndex);
	},
	/**
	 * 下钻报告至计划
	 * @param {Object} e
	 
	expandInstantReportToPlan : function(bubbleDom, rowIndex, randomBubbleId){		
		var	reportTable = ui.util.get('reportTable'),
			params = {
				mtllevel : 3,
				reporttype	: 10
			};
		
		//判断表格一行数据，读出日期
		var rowDate = baidu.object.clone(reportTable.datasource[rowIndex].date);
			
		rowDate = rowDate.split('至');
		params.starttime = rowDate[0];
		params.endtime = rowDate[rowDate.length - 1];
		
		this.actionInstance.expandInstantReport(params, rowIndex, randomBubbleId, bubbleDom);
	},*/
	/**
	 * 下钻报告至单元
	 * @param {Object} e
	 */
	expandInstantReportToUnit : function(obj){
		var	rowIndex = obj.parentNode.parentNode.parentNode.getAttribute('row'),
			planid = obj.getAttribute('data-planid'),		
		    reportTable = ui.util.get('reportTable'),
			params = {
				mtllevel	:	'5',
				reporttype	:   11,
				mtldim		:	'3',
				idset		:	[planid]
			};
			
		//判断表格一行数据，读出日期
		var rowDate = baidu.object.clone(reportTable.datasource[rowIndex].date);
		rowDate = rowDate.split('至');
		params.starttime = rowDate[0];
		params.endtime = rowDate[rowDate.length - 1];
		
		//同时更新物料选择
		var materialSelectData = [
			ui.util.get('reportTable').datasource[rowIndex].planinfo
		];
		
		this.actionInstance.setContext('newReportSelectedData', materialSelectData);
		this.actionInstance.setContext('newReportTargetType', 3);
		this.actionInstance.setContext('newReportSearch', 5);
		//this.actionInstance._updateMtlLevelOptions();
		this.actionInstance.expandInstantReport(params, rowIndex);
	},
	/**
	 * 下钻报告至单元
	 * @param {Object} e
	 
	expandInstantReportToUnit : function(bubbleDom, rowIndex, planid, randomBubbleId){		
		var reportTable = ui.util.get('reportTable'),
			params = {
				mtllevel	:	5,
				reporttype	:   11,
				mtldim		:	3,
				idset		:	[planid]
			};
		
		//判断表格一行数据，读出日期
		var rowDate = baidu.object.clone(reportTable.datasource[rowIndex].date);
			
		rowDate = rowDate.split('至');
		params.starttime = rowDate[0];
		params.endtime = rowDate[rowDate.length - 1];
		
		//同时更新物料选择
		var materialSelectData = [
			ui.util.get('reportTable').datasource[rowIndex].planinfo
		];
		
		this.actionInstance.setContext('newReportSelectedData', materialSelectData);
		this.actionInstance.setContext('newReportTargetType', 3);
		
		this.actionInstance.expandInstantReport(params, rowIndex, randomBubbleId, bubbleDom);
	},*/
	/**
	 * 下钻至监控关键词报告
	 * @param {Object} e
	 */
	expandInstantReportToAvatarword : function(obj){		
		var	rowIndex = obj.parentNode.parentNode.getAttribute('row'),
			reportTable = ui.util.get('reportTable'),
			folderid = obj.getAttribute('data-folderid'),
			params = {
				mtllevel : '9',
				reporttype : 17,
				idset : [folderid]
			};
		
		
		//判断表格一行数据，读出日期
		var rowDate = baidu.object.clone(reportTable.datasource[rowIndex].date);
			
		rowDate = rowDate.split('至');
		params.starttime = rowDate[0];
		params.endtime = rowDate[rowDate.length - 1];
		this.actionInstance.setContext('newReportSearch', 9);
		this.actionInstance.expandInstantReport(params, rowIndex);
	},
	/**
	 * 链接图标
	 */
	linkManage : function(type,query){
		var _r=Math.random();
		query+='&'+_r;
		switch(type){
			case "folder":
				er.locator.redirect('/manage/monitorDetail'+query);
				break;
			case "keyword":
				er.locator.redirect('/manage/keyword~unitid='+query);
				break;
			case "plan":
				er.locator.redirect('/manage/plan'+query);
				break;
			case "unit":
				er.locator.redirect('/manage/unit~planid='+query);
				break;
			case "keywordDetail":
				er.locator.redirect('/manage/keyword~ignoreState=true&navLevel=unit'+query);
				break;
		}
	},
	/**
	 * 下钻报告至关键词 
	 * @param {Object} e
	 */
	expandInstantReportToKeyword : function(obj,row,noExpand){		
		var rowIndex = row || obj.parentNode.parentNode.parentNode.getAttribute('row'),
			unitid = obj.getAttribute('data-unitid'),
			reportTable = ui.util.get('reportTable'),
			params = {
				mtllevel	:	'6',
				reporttype	:   9,
				mtldim		:	'5',
				idset		:	[unitid]	
			},
			materialSingleData = {},
			rowDate;
		
		ui.Bubble.triggerIdentity = obj;
		if(row!=null) rowIndex=row;
			
		if (noExpand && noExpand == 1) {
			rowDate = baidu.object.clone(reportTable.datasource[0].date);
			materialSingleData = ui.util.get('reportTable').datasource[0].unitinfo;
			materialSingleData.rowIndex = rowIndex;
		}
		else {
			rowDate = baidu.object.clone(reportTable.datasource[rowIndex].date);	
			materialSingleData = ui.util.get('reportTable').datasource[rowIndex].unitinfo;
			materialSingleData.rowIndex = rowIndex;
		}
		
		//判断表格一行数据，读出日期
		rowDate = rowDate.split('至');
		params.starttime = rowDate[0];
		params.endtime = rowDate[rowDate.length - 1];
		//同时更新物料选择
		var materialSelectData = [
			materialSingleData
		];
		this.actionInstance.setContext('newReportSelectedData', materialSelectData);
		this.actionInstance.setContext('newReportTargetType', 5);
		this.actionInstance.setContext('newReportSearch', 6);
		//this.actionInstance._updateMtlLevelOptions();
		if(noExpand && noExpand == 1) {
			this.actionInstance.expandInstantReport(params, rowIndex, noExpand);
		}else 
			this.actionInstance.expandInstantReport(params, rowIndex);
	},
	/**
	 * 下钻报告至关键词
	 * @param {Object} e
	 
	expandInstantReportToKeyword : function(bubbleDom, rowIndex, unitid, randomBubbleId){		
		var reportTable = ui.util.get('reportTable'),
			params = {
				mtllevel	:	6,
				reporttype	:   9,
				mtldim		:	5,
				idset		:	[unitid]	
			};
		
		//判断表格一行数据，读出日期
		var rowDate = baidu.object.clone(reportTable.datasource[rowIndex].date);
			
		rowDate = rowDate.split('至');
		params.starttime = rowDate[0];
		params.endtime = rowDate[rowDate.length - 1];
		
		//同时更新物料选择
		var materialSelectData = [
			ui.util.get('reportTable').datasource[rowIndex].unitinfo
		];
		
		this.actionInstance.setContext('newReportSelectedData', materialSelectData);
		this.actionInstance.setContext('newReportTargetType', 5);
		
		this.actionInstance.expandInstantReport(params, rowIndex, randomBubbleId, bubbleDom);
	},*/
	/**
	 * 下钻报告至创意
	 * @param {Object} e
	 */
	expandInstantReportToIdea : function(obj,row,noExpand){	
		ui.Bubble.hide();
		var rowIndex = row || obj.parentNode.parentNode.parentNode.getAttribute('row'),
			unitid =  obj.getAttribute('data-unitid'),
			reportTable = ui.util.get('reportTable'),
			params = {
				mtllevel	:	'7',
				reporttype	:   12,
				mtldim		:	'5',
				idset		:	[unitid]
			},
			materialSingleData = {},
			rowDate;
			
		if(row!=null) rowIndex=row;

		if (noExpand && noExpand == 1) {//从关键词报告切换至创意报告
			rowDate = baidu.object.clone(reportTable.datasource[0].date);
			materialSingleData = ui.util.get('reportTable').datasource[0].unitinfo;
			materialSingleData.rowIndex = rowIndex;
		}
		else {
			rowDate = baidu.object.clone(reportTable.datasource[rowIndex].date);	
			materialSingleData = ui.util.get('reportTable').datasource[rowIndex].unitinfo;
			materialSingleData["rowIndex"] = rowIndex;
		}
		
		//判断表格一行数据，读出日期
		rowDate = rowDate.split('至');
		params.starttime = rowDate[0];
		params.endtime = rowDate[rowDate.length - 1];
		//同时更新物料选择
		var materialSelectData = [
			materialSingleData
		];
		this.actionInstance.setContext('newReportSelectedData', materialSelectData);
		this.actionInstance.setContext('newReportTargetType', 5);
		this.actionInstance.setContext('newReportSearch', 7);
		//this.actionInstance._updateMtlLevelOptions();
		if(noExpand && noExpand == 1) {
			this.actionInstance.expandInstantReport(params, rowIndex, noExpand);
		}else 
			this.actionInstance.expandInstantReport(params, rowIndex);
	},
	/**
	 * 下钻报告至创意
	 * @param {Object} e
	 
	expandInstantReportToIdea : function(bubbleDom, rowIndex, unitid, randomBubbleId){		
		var reportTable = ui.util.get('reportTable'),
			params = {
				mtllevel	:	7,
				reporttype	:   12,
				mtldim		:	5,
				idset		:	[unitid]	
			};
		
		//判断表格一行数据，读出日期
		var rowDate = baidu.object.clone(reportTable.datasource[rowIndex].date);
			
		rowDate = rowDate.split('至');
		params.starttime = rowDate[0];
		params.endtime = rowDate[rowDate.length - 1];
		
		//同时更新物料选择
		var materialSelectData = [
			ui.util.get('reportTable').datasource[rowIndex].unitinfo
		];
		
		this.actionInstance.setContext('newReportSelectedData', materialSelectData);
		this.actionInstance.setContext('newReportTargetType', 5);
		
		this.actionInstance.expandInstantReport(params, rowIndex, randomBubbleId, bubbleDom);
	},
	*/
	
	
	/**
	 * 图表分日数据补全
	 * @author tongyao@baidu.com
	 */
	_padDailyChartData : function(data, actionInstance){		
			
		var me = actionInstance,
			params = me.getContext('currentParams'),
			//后台返回的第一个日期
			firstDate = baidu.date.parse(data[0].date),
			//后台返回的最后一个日期
		    lastDate = baidu.date.parse(data[data.length - 1].date),
			//用户指定的第一个日期
			startDate = baidu.date.parse(params.starttime),
			//用户指定的最后一个日期
			endDate = baidu.date.parse(params.endtime),
			gap,		//不连续间隔
			gapDate,	//填充的日期		
			oneDay = 24*3600*1000;		//一天的毫秒数
		
		
		//按日期汇总数据，并补充中间缺失的日期
		var preDate = firstDate,
		    curDate;
		for (var i = 1; i < data.length; i++){ //data的长度在变，此处不能缓存data.length
			curDate = baidu.date.parse(data[i].date);
			gap = (curDate - preDate) / oneDay;
			if(gap < 0){
				continue;
			}
			if (gap == 0) { //日期相同，汇总数据
				
				//将数据加入前一行(引用传递直接对data进行操作)
				nirvana.displayReport._sumChartRows(data, i, me);
				data.splice(i, 1); //删除当前行
				i--;
			} else {	//补充中间缺失的日期
				for (var j = gap - 1; j > 0; j--) {
					//生成该日日期
					gapDate = baidu.date.format(new Date(preDate - 0 + (j * oneDay)), 'yyyy-MM-dd');
					data.splice(i, 0, nirvana.displayReport._padChartRow(gapDate, me));
				}
				i = i + gap - 1;
				preDate = curDate;
			}
		}
		
		
		//开始日期不符，进行补全
		if (firstDate != startDate){
			gap = (firstDate - startDate) / oneDay;
			for(var i = gap-1 ; i >= 0; i--){
				//生成该日日期
				gapDate = baidu.date.format(new Date(startDate - 0 + (i * oneDay)), 'yyyy-MM-dd');
				data.unshift(nirvana.displayReport._padChartRow(gapDate, me));
			}
		}
		
		//结束日期不符，进行补全
		if (lastDate != endDate){
			gap = (endDate - lastDate) / oneDay;
			for(var i = 1 ; i <= gap; i++){
				//生成该日日期
				gapDate = baidu.date.format(new Date(lastDate - 0 + (i * oneDay)), 'yyyy-MM-dd');
				data.push(nirvana.displayReport._padChartRow(gapDate, me));
			}
		}
	},
	
	
	/**
	 * 图表分周数据补全
	 * @author tongyao@baidu.com;zhouyu@baidu.com
	 */
	_padWeeklyChartData : function(data, actionInstance){		
			
		var oneDay = 24 * 3600 * 1000,
			oneWeek = 7 * oneDay,		//一周的毫秒数
			me = actionInstance,
			params = me.getContext('currentParams'),
			firstday = params.firstday,
			weekToFirstDay = function(weekString){
				return weekString.split('至')[0];
			},
			endDate = baidu.date.parse(params.endtime),
			//转化成用户设置的firstday
			getWeekFirstDay = function(date){
				var weekday = date.getDay();
				if(weekday == 0){ //将周日处理为7
					weekday = 7;
				}
				if (weekday > firstday) {
					date.setDate(date.getDate() - (weekday - firstday));
				}
				else 
					if (weekday == firstday) {
						return date;
					}
					else {
						date.setDate(date.getDate() - (weekday + 7 - firstday));
					}
				return date;
			},
			getWeekLastDay = function(date){
				date.setDate(date.getDate() + 7);
				return (date - endDate) > 0 ? endDate : date;
			},
			firstDayToWeek = function(firstDate){
				return baidu.date.format(new Date(firstDate), 'yyyy-MM-dd') + '至' + baidu.date.format(getWeekLastDay(new Date(firstDate)), 'yyyy-MM-dd');
			},
			firstDate = baidu.date.parse(weekToFirstDay(data[0].date)),
			gap,		//不连续间隔
			gapDate;	//填充的日期		
		
		firstDate = getWeekFirstDay(firstDate);
			
		//按日期汇总数据，并补充中间缺失的日期
		var preDate = firstDate,
		    curDate;
		for (var i = 1; i < data.length; i++){ //data的长度在变，此处不能缓存data.length
			curDate = getWeekFirstDay(baidu.date.parse(weekToFirstDay(data[i]['date'])));
			gap = (curDate - preDate) / oneWeek;
			if(gap < 0){
				continue;
			}
			if (gap == 0) { //日期相同，汇总数据
				
				//将数据加入前一行(引用传递直接对data进行操作)
				nirvana.displayReport._sumChartRows(data, i, me);
				data.splice(i, 1); //删除当前行
				i--;
			} else {	//补充中间缺失的日期
				for (var j = gap - 1; j > 0; j--) {
					//生成该日日期
					gapDate = firstDayToWeek(preDate - 0 + (j * oneWeek));
					data.splice(i, 0, nirvana.displayReport._padChartRow(gapDate, me));
				}
				i = i + gap - 1;
				preDate = curDate;
			}
		}
	},
	
	/**
	 * 图表分月数据补全
	 * @author tongyao@baidu.com
	 */
	_padMonthlyChartData : function(data, actionInstance){		
		var oneDay = 24 * 3600 * 1000,
			//返回每月1号
			getFirstDayOfMonth = function(anyDate){
				anyDate.setDate(1);
				return anyDate;
			},
			//返回一个月中的最后一天
			getLastDayOfMonth = function(anyDate){
				var tmpDate = new Date(anyDate);
				
				tmpDate.setMonth(anyDate.getMonth() + 1);
				tmpDate.setDate(0);
				
				return tmpDate;
			},
			monthToFirstDay = function(monthString){
				return monthString.split('至')[0];
			},
			firstDayToMonth = function(firstDate){
				return baidu.date.format(new Date(firstDate), 'yyyy-MM-dd') + '至' + baidu.date.format(getLastDayOfMonth(new Date(firstDate)), 'yyyy-MM-dd');
			},
			me = actionInstance,
			params = me.getContext('currentParams'),
			//后台返回的第一个月(2011-02-0x至2011-02-28)
			firstDate = getFirstDayOfMonth(baidu.date.parse(monthToFirstDay(data[0].date))),
					
			//后台返回的最后一个月(2011-02-01至2011-02-xx)
		    lastDate = getFirstDayOfMonth(baidu.date.parse(monthToFirstDay(data[data.length - 1].date))),
			
			//用户指定的第一个日期的当月1号
			startDate = getFirstDayOfMonth(baidu.date.parse(params.starttime)),
			//用户指定的最后一个日期的当月第一天
			endDate = getFirstDayOfMonth(baidu.date.parse(params.endtime)),
			
			gap,		//不连续间隔
			gapDate;	//填充的日期		


		//按日期汇总数据，并补充中间缺失的日期
		var preDate = new Date(firstDate),
		    curDate;
		for (var i = 1; i < data.length; i++){ //data的长度在变，此处不能缓存data.length
			curDate = getFirstDayOfMonth(baidu.date.parse(monthToFirstDay(data[i].date)));
			gap = (curDate - preDate);
			if(gap < 0){
				continue;
			}
			if (gap == 0) { //月份相同，汇总数据
				//将数据加入前一行(引用传递直接对data进行操作)
				nirvana.displayReport._sumChartRows(data, i, me);
				data.splice(i, 1); //删除当前行
				i--;
			} else {	//补充中间缺失的日期
				var j = i;
				gap = gap  - getLastDayOfMonth(preDate).getDate() * oneDay;
				if (gap == 0) {
					preDate.setDate(preDate.getDate() + getLastDayOfMonth(preDate).getDate());
					continue;
				}
				while(gap > 0){
					gapDate = firstDayToMonth(preDate);
					data.splice(j++, 0, nirvana.displayReport._padChartRow(gapDate, me));
					preDate.setDate(preDate.getDate() + getLastDayOfMonth(preDate).getDate());
					gap = (curDate - preDate);
				}
				data.splice(i, 1); //去掉本次补充的第一个重复元素
			}
		}
		
		//开始日期不符，进行补全
		if (firstDate != startDate){
			
			gap = (firstDate - startDate);
			
			var j = 0;
			while(gap > 0){
				gapDate = firstDayToMonth(startDate);
				data.splice(j++, 0, nirvana.displayReport._padChartRow(gapDate, me));
				startDate.setDate(startDate.getDate() + getLastDayOfMonth(startDate).getDate());
				gap = (firstDate - startDate);
			}
		}
		
		//结束日期不符，进行补全
		if (lastDate != endDate){
			var length = data.length;
			gap = (endDate - lastDate);
			while(gap >= 0){
				gapDate = firstDayToMonth(lastDate);
				data.push(nirvana.displayReport._padChartRow(gapDate, me));
				lastDate.setDate(lastDate.getDate() + getLastDayOfMonth(lastDate).getDate());
				gap = (endDate - lastDate);
			}
			data.splice(length, 1);
		}
		
		//将第一个和最后一个数据恢复为用户实际选择的日期
		data[0].date = firstDayToMonth(baidu.date.parse(params.starttime));
		var lastDateArray = data[data.length - 1].date.split('至');
		
		lastDate = baidu.date.parse(lastDateArray[1]);
		lastDate.setDate(baidu.date.parse(params.endtime).getDate()); 
		lastDateArray[1] = baidu.date.format(lastDate, 'yyyy-MM-dd');
		data[data.length - 1].date = lastDateArray.join('至');
	},
	
	/**
	 * 将于图表有关的数据将当前行与前一行取和，并存入前一行
	 * @param {Object} data
	 * @param {Object} rowIndex
	 */
	_sumChartRows : function(data, rowIndex, actionInstance){
		
		/**
		 * 计算平均点击价格
		 */
		function avgprice(){
			//因为点击、消费都排在avg之前，因为prevRow[col]已经是完成累加的数据
			var operand1 = data[rowIndex - 1]['paysum'],
				operand2 = data[rowIndex - 1]['clks'];
				
			return (operand2 != 0) ? fixed(operand1 / operand2) : 0;	
		}
		
		/**
		 * 计算点击率
		 */
		function ctr(){
			//因为点击、展现都排在clkrate之前，因为prevRow[col]已经是完成累加的数据
			var operand1 = data[rowIndex - 1]['clks'],
				operand2 = data[rowIndex - 1]['shows'];
				
			return (operand2 != 0) ? (operand1 / operand2).toFixed(4) : 0;	
		}
		
		var me = actionInstance,
			selectedItems = nirvana.report.numericItem,
			prevRow = data[rowIndex - 1],
			currentRow = data[rowIndex],
			col;
	//	console.log(prevRow.date, currentRow.date);
		for(var i = 0, l = selectedItems.length; i < l; i++){
			col = selectedItems[i];
			if (col == 'avgprice') {
				prevRow[col] = avgprice();
			} else if (col == 'clkrate') {
				prevRow[col] = ctr();
			} else {
				prevRow[col] += currentRow[col];
			}
		}
	},
	
	/**
	 * 按传入日期填充空行（图表）
	 * @param {Object} date
	 */
	_padChartRow : function(date, actionInstance){
		var me = actionInstance,
			selectedItems = nirvana.report.numericItem,
			row = {
				date : date
			};
		
		for(var i = 0, l = selectedItems.length; i < l; i++){
			row[selectedItems[i]] = 0;
		}
		return row;
	},
	
	
	/**
	 * 组装折线图数据
	 * @param {Object} selectedItems
	 * @param {Object} data
	 * @author tongyao@baidu.com
	 */
	_buildPolyLineData : function(selectedItems, data, actionInstance){
		var me = actionInstance,
			flashXml = ["<?xml version='1.0' encoding='utf-8'?>"],
			xmlSeg = [],
			rows = data.length,
			selectedItemsLength = selectedItems.length,
			itemName = '',
			tmpData;
		
		
			
		//组装指标文字
		for (var i = 0; i < selectedItemsLength; i++){
			itemName = nirvana.displayReport._translateItemName(selectedItems[i], me);
			xmlSeg[xmlSeg.length] = "tag" + (i + 1) + "='" + itemName + "'";
		}
		flashXml[flashXml.length] = "<data " + xmlSeg.join(' ') + ">";
		
		//组装图表数据
		var row = [];
		for (var i = 0; i < rows; i++){
			xmlSeg = [];
			row = data[i];
			row.date = row.date.replace(/至/g, '~');
			xmlSeg[xmlSeg.length] = "overTag='" + row.date + "'";
			xmlSeg[xmlSeg.length] = "xAxisTag='" + row.date + "'";
			for (var j = 0; j < selectedItemsLength; j++){
				tmpData = row[selectedItems[j]] - 0;
				if(!isFinite(tmpData)){
					tmpData = 0;
				}
				if(selectedItems[j] == 'clkrate'){ //点击率乘以100传给Flash
					tmpData = tmpData * 100;
				}
				xmlSeg[xmlSeg.length] = "data" + (j + 1) + "='" + tmpData + "'";
			}
			
			flashXml[flashXml.length] = "<record " + xmlSeg.join(' ') + " />";
		}
		flashXml[flashXml.length] = '</data>';
		
		return flashXml.join('');
	},
	
	
	/**
	 * table的onsort接口， 用于各物料排序
	 * @param {Object} datalist 需要排序的数据
	 * @param {Object} field	排序字段
	 * @param {Object} order	升序or降序
	 * @author zhouyu01@baidu.com tongyao@baidu.com
	 */
	orderData: function(datalist, field, order){
		if (!field || !order || datalist.length <= 1) {
			return datalist;
		}
		
		var wordASC =  function(a, b){
				return a.localeCompare(b);
			},
			
			wordDESC = function(a, b){
				return wordASC(a, b) * (-1);
			},
			
			numASC = function(a, b){
				if(a == b){
					return 0;
				}
				if(a == '-'){
					return 1;
				}
				if(a == 'b'){
					return -1;
				}
				if(a > b){
					return 1;
				} else {
					return -1;
				}
				
			},
			
			numDESC = function(a, b){
				return numASC(a, b) * (-1);
			},
			
			/**
			 * 生产排序方法的工厂
			 * @param {Object} key 格式：date 或 planinfo.name
			 */
			sortMethodFactory = function(key, func){
				return function(a, b){
					var keyArray = key.split('.'),
						length = keyArray.length,
						tmp = [a, b];
					
					for (var i = 0; i < length; i ++){
						tmp = [
							tmp[0][keyArray[i]],
							tmp[1][keyArray[i]]
						];
					}

					return func(tmp[0], tmp[1]);
				}
			};
		
		var sortField = field || "",
		    _func,
		    func;
		
		switch (sortField) {
			case 'date':
			case 'engineid':
			case 'platform':
			case 'wmatch':
			// 以下是转化跟踪的field
			case 'name':
			case 'step_url':
			case 'siteUrl':
			case 'site_url':
				_func = (order == 'desc') ? wordDESC : wordASC;
				func = sortMethodFactory(sortField, _func);
				break;
			
			case 'useracct':
			case 'planname':
			case 'unitname':
			case 'showword':
			// 以下是搜索词报告的field
			case 'plan':
			case 'unit':
			case 'word':
			case 'query':
			case 'prov':
			case 'folderinfo':
				sortField = sortField.replace(/planname/, 'planinfo').replace(/unitname/, 'unitinfo').replace(/showword/, 'word')
				_func = (order == 'desc') ? wordDESC : wordASC;
				func = sortMethodFactory(sortField + '.name', _func);
				break;
			
			case 'clkrate':
			case 'clks':
			case 'shows':
			case 'paysum':
			case 'antpaysum':
			case 'avgprice':
			case 'showpay':
			case 'trans':
			case 'phonetrans':
	//		case 'phonepay':
				sortField = nirvana.report.lib.transWmatchFiled(datalist[0], sortField).key;
				_func = (order == 'desc') ? numDESC : numASC;
				func = sortMethodFactory(sortField, _func);
				break;
				
			case 'bid':
			case 'rawclks':
			case 'antclks':
			case 'antrate':
			case 'avgrank':
			// 以下是转化跟踪的field
			case 'transNum':
			case 'step_type': // 匹配模式 1 部分匹配 0 完全匹配
				_func = (order == 'desc') ? numDESC : numASC;
				func = sortMethodFactory(sortField, _func);
				break;
			
		}
		
		datalist.sort(func);
		return datalist;
	},
	
	/**
	 * 从指标key翻译为文字 clks -> 点击
	 * @param {Object} key
	 */
	_translateItemName : function(key, actionInstance){
		var itemName;
		
		switch(key){
			case "clks":
				itemName = '/点击/';
				break;
			case "paysum":
				itemName = '/消费/';
				break;
			case "shows":
				itemName = '/展现/';
				break;
			case "clkrate":
				itemName = '/点击率/%';
				break;
			case "avgprice":
				itemName = '/平均点击价格/';
				break;
			case "trans":
				itemName = '/转化(网页)/';
				break;
			case "avgrank":
				itemName = '/平均排名/';
				break;
			default:
				itemName = '/' + key + '/';
				break;
		};
		return itemName;
	},
	
	/**
	 * toggle 图表容器
	 * @author tongyao@baidu.com
	 */
	_toggleChartContainer : function(status){
		var btn = baidu.g('ToggleReportChart'),
			wrap = baidu.g('ReportChartContainer');
		
		if(typeof status == 'undefined'){ //未指定status自动判断
			status = btn.rel;
			status = status == 'fold' ? true : false;
		}
			
		if(status){ //show
			baidu.show('ReportChartControl');
			baidu.dom.removeClass(wrap, 'fold');
			nirvana.displayReport.resizeFlashContainerHeight();
		//	baidu.dom.addClass(wrap, 'unfold');
			btn.setAttribute('rel', 'unfold');
			baidu.dom.removeClass(btn, 'folded');
			btn.innerHTML = '点击收起报告图表';
		} else {
			baidu.hide('ReportChartControl');
		//	baidu.dom.removeClass(wrap, 'unfold');
			baidu.dom.addClass(wrap, 'fold');
			btn.setAttribute('rel', 'fold');
			baidu.dom.addClass(btn, 'folded');
			btn.innerHTML = '点击查看报告图表';
		}
	//	nirvana.report.lib._resizeTable();
	//	nirvana.displayReport.resizeFlashContainerHeight();
	},
	
	/**
	 * 显示下钻报告时预约报告的确认框
	 * @author tongyao@baidu.com
	 */
	_showConfirmSubsribe : function(){
		var dialog = ui.util.get('ReportConfirmSubscribe');
		
		dialog && (dialog.show());
	},
	
	/**
	 * 显示预约报告成功提示
	 * @author tongyao@baidu.com
	 */
	_showSubscribeSuccess : function(actionInstance){
		var dialog = ui.util.get('ReportSubscribeSuccess');
		if (!dialog) {
			ui.Dialog.factory.create({
				title: '预约报告生成中',
				content: '预约报告生成中,因为数据量过大,可能无法在这里呈现,您可以从“我的报告”中生成后下载。',
				closeButton: false,
				cancel_button: false,
				maskType: 'black',
				maskLevel: '9', //bubble的z-index是2000，我们这个是9*200 + 400
				id: 'ReportSubscribeSuccess',
				width: 300,
				skin : 'ToolsModuleConfirmReImport',
				onok : function(){
					ui.Bubble.hide();
					// 跳转到我的报告
					actionInstance.redirect('/tools/myReport', {});
				}
			});
		} else {
			dialog.show();
		}	
	},
	
	/**
	 * 显示下载报告子Action
	 */
	_showDownloadSubAction : function(actionInstance){
		var me = actionInstance || this.actionInstance,
		    currentParams = me.getContext('currentParams'),
			title = (currentParams.reporttag == 1) ? '下载循环报告' : '下载报告',
			isInstantReport = me.getContext('isInstantReport'),
			fileid = me.getContext('downloadFileid'),
			reportfail = me.getContext('reportfail');
		
		nirvana.util.openSubActionDialog({
			id: 'DownloadReportDialog',
			title: title,
			actionPath: '/tools/report/download',
			params: {
				currentParams : currentParams,
				isInstantReport : isInstantReport,
				fileid : fileid,
				reportfail : reportfail
			},
			onclose: function(){
				if (currentParams.reporttag == 1) { // 循环报告
					me.reportList();
				}
			}
		});
	},
	
	/**
	 * 显示循环报告子Action
	 * @param {Object} type add | modify
	 */
	_showCycleSubAction : function(type,customize,here){
		var title;
		if(!customize){
			title = '循环报告';
			var me = this.actionInstance ;
		}else{
			title = '定制报告';
			var me = here ;
		//	console.log(this.actionInstance,here);
		}
		ui.Bubble.hide();
		var currentParams = me.getContext('currentParams');
		
		//console.log(title,currentParams);
		nirvana.util.openSubActionDialog({
			id: 'CycleReportDialog',
			title: title,
			actionPath: '/tools/report/cycle',
			params: {
				currentParams : currentParams,
				type : type,
				actionInstance : me
			},
			onclose: function(){
			}
		});
		
	},
	
	/**
	 * 显示发送报告子Action
	 */
	_showMailSubAction : function(){
		var me = this.actionInstance,
		    currentParams = me.getContext('currentParams'),
			isInstantReport = me.getContext('isInstantReport'),
			fileid = me.getContext('myReportFileid');
		nirvana.util.openSubActionDialog({
			id: 'MailReportDialog',
			title: '发送报告',
			actionPath: '/tools/report/mail',
			params: {
				currentParams : currentParams,
				isInstantReport : isInstantReport,
				fileid : fileid
			},
			onclose: function(){
			}
		});
	},
	
	/**
	 * 报告发送或者循环报告邮箱验证失败
	 */
	sendFail : function(response) {
		if (response.errorCode) {
			var error = response.errorCode.code;
			
			switch (error) {
				case 'NOT_MAIL':
				case 'TOO_LONG':
				case 'OVER':
					if (baidu.g('MailInputWarn')) {
						baidu.g('MailInputWarn').innerHTML = nirvana.config.ERROR.REPORT.EAMIL[error];
						baidu.removeClass('MailInputWarn', 'hide');
					}
					break;
				case 1902: // 报告数量超过上限
					ui.Dialog.alert({
						title: '提示',
						content: nirvana.config.ERROR.REPORT[error]
					});
					break;
				default:
					ajaxFailDialog();
					break;
			}
		} else {
			ajaxFailDialog();
		}
	}
};

//快捷方式
nirvana.displayReport = nirvana.report.lib.display;