/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/folderList.js 
 * desc: 监控文件夹信息
 * author: zhouyu01@baidu.com
 * date: $Date: 2011/06/24 $
 */

/**
 * 监控文件夹信息 actionParam
 */
ToolsModule.folderList = new er.Action({
	VIEW : 'propFolderList',
	
	UI_PROP_MAP : {
		// 数据表格
		aoFlTable : {
			select : 'multi',
			noDataHtml: "*noDataHtml",
			dragable: "false",
			colViewCounter: "all",
	//		scrollYFixed: "true",
			fields: "*tableFields",
			datasource: "*ListData"
		}
	},
	

	/**
	 * 初始化context的函数集合，name/value型Object。其value为Function的map，value
	 * Function被调用时this指针为Action本身。value
	 * Function的形参需要有一个callback参数，参数为Function类型，手工回调。
	 */
	CONTEXT_INITER_MAP : {
		/**
		 * 表格字段
		 */
		tableFields: function(callback){
			var me = this,
				fields = [
				{
					content: function(item){
						var title = baidu.encodeHTML(item.foldername), 
							content = getCutString(item.foldername, AO_NAMEDATA_MAXLENGTH, ".."), 
							html = '<div title="' + title + '">' + content + '</div>';
						return html;
					},
					field: 'foldername',
					title: '监控文件夹名称',
					width: 200
				},
				{
					content: function(item){
						return '<a class="prop_set_folder" id="' + item.folderid + '" name="' + baidu.encodeHTML(item.foldername) + '">设置</a>';
					},
					field: '',
					title: '',
					align: 'right',
					width: 100
				}
				];
			me.setContext("tableFields",fields);
			callback();
		},
		
        /**
         * 填充数据表格
         */
		dataTable : function(callback) {
			var me = this;
			fbs.avatar.getMoniFolders({
				fields : ["folderid","foldername"],
				onSuccess: function(res){
					var data = res.data.listData || [];
					
					me.setContext("ListData", data);
					callback();
				},
				onFail : function(res){
					me.setContext("noDataHtml","读取数据失败！");
					callback();
				}
			});
		}
	},


	/**
	 * 第一次render后执行后最后会触发事件
	 */
	onafterrender : function() {
		var me = this,
			controlMap = me._controlMap,
			aotable = controlMap.aoFlTable,
			inputs = aotable.getBody().getElementsByTagName('input'),
			k = 0,
			tabledata = me.getContext("ListData"),
			len = tabledata.length;
			if (len > 0) {
				//是否达到上限，不可再新建监控文件夹
				fbs.avatar.getMoniFolderCount({
					folderType: 0,
					onSuccess: function(res){
						var currentCount = res.data.currentCount, maxCount = res.data.maxCount;
						if (currentCount < maxCount) {
							baidu.g("aoCreateFolder").style.display = "block";
						}
					},
					onFail: function(res){
					}
				});
				
				//获取选中状态
				fbs.ao.getUnselectedFolders({
					onSuccess: function(res){
						var data = res.data, map = {}, foldlist = me.getContext("ListData");
						
						for (var i = 0, l = data.length; i < l; i++) {
							map[data[i]] = true;
						}
						
						for (var i = 0, len = foldlist.length; i < len; i++) {
							if (!map[foldlist[i].folderid]) {
								inputs[i].checked = true;
							}
							else {
								k++;
							}
						}
						if (k <= 0) {
							baidu.g(aotable.getId('selectAll')).checked = true;
						}
					},
					onFail: function(res){
					
					}
				});
				//设置链接
				var setButton = $$("#AoFolderList .prop_set_folder"),
					id,name,button;
				for (var i = 0, l = setButton.length; i < l; i++) {
					button = setButton[i];
					id = +baidu.getAttr(button, "id");
					name = baidu.decodeHTML(baidu.getAttr(button, "name"));
					baidu.on(button, 'click', me.setFolderHandler(id, name));
				//	button.onclick = me.setFolderHandler(id, name);
				}
			}
			else {
				baidu.g("AoFolderList").innerHTML = "您还没有建立监控文件夹。<br />点这里立即<span class='prop_set_folder' id='aoCreateFolder'>新建监控文件夹</span>。";
				baidu.addClass(baidu.g("AoFolderList"), "ao_no_folder");
			}
		
		// 绑定选择事件
		ui.util.get("aoFlTable").onselect = me.selectListHandler();
		
		ui.util.get("aoFlTable").getWidth = aoRewriteGetWidth;
	},

	/**
	 * 完成视图更新后最后会触发事件
	 */
	onentercomplete : function() {
		var me = this,
			controlMap = me._controlMap,
			aotable = controlMap.aoFlTable,
			aobutton = controlMap.aoFlButton;
		if(aobutton){
			aobutton.onclick = me.setOkHandler();
		}
		baidu.g("aoCreateFolder").onclick = me.createFolder();
		
	},
	
	/**
	 * 设置监控文件夹
	 */
    selectListHandler : function (selected) {
        var me = this,
            controlMap = me._controlMap;
		
        return function (selected) {
			baidu.addClass('AoFolderWarn', 'hide');
			/**
			 * 
			var data = me.getContext('ListData'),
				len = selected.length,
				i = 0,
				selectedId = [];
			
			for (; i < len; i++) {
				selectedId.push(data[selected[i]].folderid);
			}
			
			// 记录未选中的id
			me.setContext('selectedId', selectedId);
			 */
        };
    },
	
	/**
	 * 设置监控文件夹
	 */
	setFolderHandler: function(id, name){
		var me = this;
		return function(){
			fbs.avatar.getMoniWords({
				folderid: [id],
				fields: ["winfoid", "showword"],
				onSuccess: function(res){
					var data = res.data.listData || [],
						len = data.length,
						addwords = [];
					for (var i = 0; i < len; i++) {
						addwords[addwords.length] = {
							id: data[i].winfoid,
							name: data[i].showword
						};
					}
					nirvana.util.openSubActionDialog({
						id: 'addMoniKwDialog',
						title: '新增监控关键词',
						width: 928,
						maskLevel: 6,
						actionPath: 'manage/addMoniWords',
						params: {
							folderid: id,
							foldername: name,
							addwords: addwords,
							type: "prop"
						},
						onclose: function(){
							me.refreshSelf();
						}
					});
				},
				onFail: function(res){
					ajaxFailDialog();
				}
			});
			
			//add by LeoWang(wangkemiao@baidu.com) 添加监控
			nirvana.aoWidgetAction.logCenter('ao_level_option', {
				type : 'set',
				id : id,
				name : name
			});
			//add ended
		}
	},
	
	/**
	 * 确定修改优化监控文件夹事件
	 */
	setOkHandler: function(){
		var me = this,
			controlMap = me._controlMap;
		
		return function(){
			var aotable = controlMap.aoFlTable, 
				inputs = aotable.getBody().getElementsByTagName('input'), 
				tabledata = me.getContext("ListData"), 
				selectAll = aotable.getId('selectAll').checked, 
				unselected = [];
			
			if (!selectAll) {
				for (var i = 0, l = inputs.length; i < l; i++) {
					if (!inputs[i].checked) {
						unselected[unselected.length] = tabledata[i].folderid;
					}
				}
			}
			
			if (unselected.length === tabledata.length) { // 如果未选中数组与表格数据相等，则认为没有选中任何监控文件夹
				baidu.g('AoFolderWarn').innerHTML = '请至少选择一个监控文件夹';
				baidu.removeClass('AoFolderWarn', 'hide');
				return;
			}
			
			fbs.ao.modUnselectedFolders({
				folderid: unselected,
				onSuccess: function(){
					//清缓存
				//	fbs.ao.getUnselectedFolders.clearCache();
					//刷新账户优化工具箱()
					nirvana.aoControl.action.refresh();
					me.onclose();
				},
				onFail: function(){
					ajaxFailDialog();
				}
			});
			
			
			//add by LeoWang(wangkemiao@baidu.com) 添加监控
			nirvana.aoWidgetAction.logCenter('ao_level_option', {
				type : 'save'
			});
			//add ended
		}
	},
	
	/**
	 * 新建监控文件夹
	 */
	createFolder: function(){
		var me = this;
		return function(){
			nirvana.util.openSubActionDialog({
				id: 'addFolderDialog',
				title: '新建监控文件夹',
				width: 928,
				maskLevel : 6,
				actionPath: 'manage/addFolder',
				params: {
					type: "prop"
				},
				onclose: function(){
					me.refreshSelf();
				}
			});
			
			//add by LeoWang(wangkemiao@baidu.com) 添加监控
			nirvana.aoWidgetAction.logCenter('ao_level_option', {
				type : 'newfolder'
			});
			//add ended
		}
	}
});