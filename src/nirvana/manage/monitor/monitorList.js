/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    monitor/monitorList.js
 * desc:    推广管理
 * author:  zhouyu
 * date:    $Date: 2011/02/10 $
 */


/**
 * @namespace 计划列表模块
 */
manage.monitorList = new er.Action({
	
	VIEW: 'monitorList',
	
	STATE_MAP : {
		startDate : '',
		endDate : '',
		status	: '100',
		query	:	'',
		queryType	: '',
		orderBy	:	'',
		orderMethod	: 	'',
		pageSize	:	50,
		pageNo      : 1,
		customCol	:	'default',
		navLevel : 'monitorlist',
		aoEntrance : 'Monitor', // Planinfo,Unitinfo,Wordinfo,Ideainfo,Monitor,Nav
		wrapper : 'ManageAoWidget'
	},
	
	UI_PROP_MAP : {
		calendar : {
			type : 'MultiCalendar',
			value : '*dateRange'
		},
		
		moniTableList : {
			type : 'Table',
			
			select : 'multi',
				
			sortable : 'true',
			
			orderBy : '',
			
			order : '',
			
			noDataHtml : FILL_HTML.FOLD_NO_DATA,
			
			dragable : 'true',
			
			colViewCounter : '8',
			
			scrollYFixed : 'true',
			
			fields: '*tableFields',		
			
			datasource : '*moniListData'
		}
	},
	
	//初始化ui
	CONTEXT_INITER_MAP : {
		//表格每列属性
		tableFields : function(callback){
			var me = this;
			if (!me.arg.refresh) {
			    var allData = [
					{
						content: function (item) {
						    var title = baidu.encodeHTML(item.foldername),
                                content = getCutString(item.foldername,30,".."),
								html = [];
							html[html.length] = '<div class="edit_td">';
							html[html.length] = '	<a title="' + title + '" class="current_folder" href="#/manage/monitorDetail~ignoreState=1&folderid='+item.folderid+'">' + content;
							if(item.moniwordcount > 0){
								html[html.length] = '<span class="gray">(' + item.moniwordcount + ')</span>';
							}else{
								html[html.length] = '<span class="red bold">(' + item.moniwordcount + ')</span>';
							}
							html[html.length] = '	</a>';
							html[html.length] = '	<a class="edit_btn" edittype="foldername"></a>';
                            html[html.length] = '</div>';
							return html.join("");
						},
						locked: true,
						sortable : true,
						field : 'foldername',
						title: '监控文件夹',
						width: 250						
					}, 
					{
						content: function (item) {
                            var html = [],
								content = item.fstat == 0 ? '不显示' : '显示';
							html[html.length] = '<div class="edit_td">';
							html[html.length] = '<span>' + content + '</span>';
							html[html.length] = '<a class="edit_btn" edittype="fstat"></a>';
                            html[html.length] = '</div>';
							return html.join("");
						},
						title: '概况页显示',
						sortable : true,
						field : 'fstat',
						width: 130,
						minWidth : 130,
						noun:true
					}, 
					{
						content: function(item){
							var data = item.shows;
							if (nirvana.manage.hasToday(me)) { // 包含今天数据
								data = '-';
							}
							if (data == '' || data == '-') {
								return data;
							}
							return parseNumber(data);
						},
						title: '展现',
						align: 'right',
						sortable : true,
						field : 'shows',
						width: 60,
						noun:true,
						nounName: "展现量"
					}, 
					{
						content: function(item){
							var data = item.clks;
							if (data == '' || data == '-') {
								return data;
							}
							return parseNumber(data);
						},
						title: '点击',
						align: 'right',
						sortable : true,
						field : 'clks',
						width: 60
					}, 
					{
						content: function (item) {
						    return fixed(item.paysum);
						},
						title: '消费',
						align: 'right',
						sortable : true,
						field : 'paysum',
						width: 60
					}
				];
				me.setContext('tableFields', allData);
			}
			callback();
		},
		
		//tab，只有一个监控文件夹
		tab: function(callback){
			if (!this.arg.refresh){
				var tabData = ['监控文件夹'];
				this.setContext('tab', tabData);
			}
			callback();
		},
		
		//日历控件的事件范围
		dateRange : nirvana.manage.getStoredDate([0,1,2,3,4,6]),
		
		//取监控文件夹的数据
		folderData : function(callback){
			var me = this;
			fbs.avatar.getMoniFolders({	
				starttime: me.getContext('startDate'),
				endtime: me.getContext('endDate'),
				fields:["folderid","foldername","fstat","moniwordcount","clks","shows","paysum"],
				onSuccess: function(data){
						var result = data.data.listData || [],
							field = me.getContext("orderBy"), 
							order = me.getContext("orderMethod"),
							folderids = [];
						result = nirvana.manage.orderData(result, field, order);
						me.setContext('moniListData', result);
						me.setContext('foldnum',result.length);

						for (var i = 0, l = result.length; i < l; i++) {
							folderids[folderids.length] = result[i].folderid;
						}

						// wanghuijun 2012.11.30
						// 用于账户优化的condition
						me.setContext('aoFolderids', folderids);
						//nirvana.aoControl.changeParams({
						//	level: 'folder',
						//	command: 'start',
						//	signature: '',
						//	condition: {
						//		folderid : folderids
						//	}
						//});
						// wanghuijun 2012.11.30
			
						callback();
				},
	            onFail: function(data){
	                    ajaxFailDialog();
	                    callback();
	            }
			});
		}
	},
	
	/**
	 * 物料层级初始化
	 * @param {Object} len 监控文件夹的个数
	 */
	setLevel : function(len) {
		var levelHtml = [];
		//bubble控件中会判断classname是否为ui_bubble,而不是是否包含ui_bubble，所以只好再套一层span。bubble控件升级？
		levelHtml[levelHtml.length++] = '账户：<span class="bold"><span id="MoniListLxbStatus">' + nirvana.env.USER_NAME + '</span></span>';
		levelHtml[levelHtml.length++] = '&nbsp;>&nbsp;';
		levelHtml[levelHtml.length++] = '<span class="bold">监控文件夹</span>(' + len + '个文件夹)'
		baidu.g("foldListLevel").innerHTML = levelHtml.join("");
	},
	
	onafterrender : function(){
		var me = this,
			controlMap = me._controlMap;
			
		controlMap.createfolder.onclick = me.checkMoniFolderNum();
		//删除监控文件夹
        controlMap.deletefolder.onclick = me.operationHandler();
        //给表格选择注册事件
        controlMap.moniTableList.onselect = me.selectListHandler();
        //给表格注册行内编辑处理器
        controlMap.moniTableList.main.onclick = me.getTableInlineHandler();
		//给表格注册排序
		controlMap.moniTableList.onsort = function(sortField,order){
			me.setContext("orderBy",sortField.field);
			me.setContext("orderMethod",order);
			me.refresh();
		}
		
		//注册工具箱导入方法	
	//	ToolsModule.clearImportDataMethod();
		ToolsModule.setImportDataMethod(function(){
			var selectedList = me.selectedList,
	            data = me.getContext('moniListData'),
	            res = {
					level : 'folder',
					data : []
				},
				i, len;
			if (selectedList && selectedList.length > 0){
				for(i = 0, len = selectedList.length; i < len; i++){
		            res.data.push(data[selectedList[i]]);
		        }
			}
			
			return res;
		});
		
		//优化 by linzhifeng@baidu.com 2011-08-29
		//删除按钮初始为disable状态
		controlMap.deletefolder.disable(true);
		
		//日历选择事件
		controlMap.calendar.onselect = function(data){
			for(var i in data){
				data[i] = data[i] && baidu.date.format(data[i],'yyyy-MM-dd');
			}
			me.setContext('startDate', data.begin);
			me.setContext('endDate', data.end);
			nirvana.manage.setStoredDate(data);
			me.refresh();
		};
		
		//这里只做保存时间的事儿就行了 因为快捷方式被选的时候上面的onselect也会触发
		controlMap.calendar.onminiselect = function(data){
			nirvana.manage.setStoredDate(data);
		};
		
	},
	
	onreload : function(){ 
		this.refresh();
	},
	
	onentercomplete : function(){
		var me = this,
		    controlMap = me._controlMap;
		
		//初始化物料层级中监控文件夹的数量
		var foldnum = me.getContext('foldnum');
		me.setLevel(foldnum);
		
		nirvana.manage.LXB.setStatus("MoniListLxbStatus");
		
		//恢复账户树状态
        nirvana.manage.restoreAccountTree(me);
		
		// wanghuijun 2012.11.30
		// 账户优化初始化
		// me.changeAoParams();
		// nirvana.aoControl.init(me);
		// wanghuijun 2012.11.30
		// 模块化实践，ao按需加载
		$LAB.script(nirvana.loader('proposal'))
			.wait(function() {
				me.changeAoParams();
				nirvana.aoControl.init(me);
			});
		// wanghuijun 2012.11.30
	},
	
	onafterinitcontext : function(){
		nirvana.CURRENT_MANAGE_ACTION_NAME = 'monitorlist';
	},
	
	onleave : function(){
		nirvana.CURRENT_MANAGE_ACTION_NAME = '';
	},
	
	/**
	 * 构造账户优化请求参数
	 */
	changeAoParams : function() {
		var me = this,
			aoControl = nirvana.aoControl;

		aoControl.changeParams({
			level: 'folder',
			command: 'start',
			signature: '',
			condition: {
				folderid : me.getContext('aoFolderids')
			}
		});
	},
	
	/**
	 * 获取监控文件夹数量
	 */
	checkMoniFolderNum:function(){
		var me = this;
		return function(){
			fbs.avatar.getMoniFolderCount({
				folderType: 0,
				onSuccess: me.checkFoldNumHandler(),
				onFail: function(data){
					ajaxFailDialog();
					callback();
				}
			})
		}
	},
	
	/**
	 * 检查监控文件夹数量是否已达上限
	 */
	checkFoldNumHandler: function(){
		var me = this;
		return function(data){
			var currentCount = data.data.currentCount,
				maxCount = data.data.maxCount;
			if(currentCount >= maxCount){
				var msg = '抱歉，您目前监控文件夹已经达到了上限（' + maxCount + '个），无法新建。';
				ui.Dialog.alert({
                    title: '无法新建',
					maskType:'white',
                    content: msg
                });
			}else{
				me.addMoniFolder();
			}
		}
	},
	
	/**
	 * 新建监控文件夹
	 */
	addMoniFolder: function(){
		nirvana.util.openSubActionDialog({
			id: 'addFolderDialog',
			title: '新建监控文件夹',
			width: 928,
			actionPath: 'manage/addFolder',
			params: {},
			onclose: function(){
						
			}
		});
		clearTimeout(nirvana.subaction.resizeTimer);
		baidu.g('ctrldialogaddFolderDialog').style.top = baidu.page.getScrollTop() + 93 +'px';
	},
    
	/**
	 * table复选框选择事件处理
	 * @param {Object} selected 已选取项
	 */
    selectListHandler : function (selected) {
        var me = this,
            controlMap = me._controlMap,
			deletefolder = controlMap.deletefolder;
        return function (selected) {
            var enabled = selected.length > 0;
            me.selectedList = selected;
            deletefolder.disable(!enabled);

            // 读写分离，待升级之后不用这种方式了
            // by Leo Wang
			nirvana.acc.accService.processEntrances('manage/monitorList');
        } 
    },
    
	/**
	 * 删除事件确认
	 */
    operationHandler : function () {
        var me = this,
            controlMap = me._controlMap;

        return function () {
            var len = me.selectedList.length,
            	title = '删除监控文件夹',
           		msg = '执行本操作后，将对该监控文件夹下的关键词停止监控。<br />（对原相应单元下的关键词没有影响）<br />您确定删除吗？';
		 	ui.Dialog.confirm({
		 		title: title,
		 		content: msg,
		 		onok: me.doOperationHandler()
		 	});
        }
    },
    
	/**
	 * 确认删除
	 */
    doOperationHandler : function () {
        var me = this,
            controlMap = me._controlMap;
        return function (dialog) {
            var dialog = dialog,
                folderid = me.getSelectedId(),
                param = {folderids: folderid, 
                         onSuccess: me.operationSuccessHandler(), 
                         onFail: me.operationFailHandler()}; 
    
                fbs.avatar.delMoniFolders(param);
            }
    },

	/**
	 * 删除失败
	 */
    operationFailHandler : function () {
        var me = this;
        return function (data) {
            ajaxFail(0);            
        }
    },

	/**
	 * 获取已选择项的id
	 */
    getSelectedId : function () {
        var me = this,
            selectedList = me.selectedList,
            data = me.getContext('moniListData'),
            i, len, ids = [];

        for(i = 0, len = selectedList.length; i < len; i++){
            ids.push(data[selectedList[i]].folderid);
        }

        return ids;
    },
	
    /**
     * 表格行内操作事件代理器
     */
    getTableInlineHandler : function () {
        var me = this;
        return function (e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
				type,parent;
            while(target  && target != ui.util.get("moniTableList").main){
				if(baidu.dom.hasClass(target,"edit_btn")){
					var current = nirvana.inline.currentLayer;
					if (current && current.parentNode) {
						current.parentNode.removeChild(current);
					}
					type = target.getAttribute("edittype");
					switch(type){
						case "foldername":
							me.inlinefoldername(target);
							break;
						case "fstat":
							me.inlineFstat(target);
							break;
					}
					break;
				}
                target = target.parentNode;
            }
        };
    },

	/**
	 * 根据编辑按钮对象获取当前行数据
	 * @param {Object} target
	 */
	getLineData: function(target){
		var isFind = false;
		while (target && target.tagName != "TR") {
			if(target.tagName == "TD"){
				isFind = true;
				break;
			}
			target = target.parentNode;
		}
		if(isFind){
			var index = target.getAttribute("row");
			return this.getContext('moniListData')[index];
		}
		return false;
	},

		
		
	/**
	 * 行内修改监控文件夹名称
	 * @param {Object} target 事件目标
	 */
	inlinefoldername: function(target){
		var me = this,
			row = me.getLineData(target),
			folderid = row.folderid, 
			foldername = row.foldername;
		nirvana.inline.createInlineLayer({
			type: "text",
			value: foldername,
			id: "foldername" + folderid,
			target: target.parentNode,
			okHandler: function(name){
				name = baidu.trim(name);
				return {
					func: fbs.avatar.modFolderName,
					param: {
						folderids: [folderid],
						foldername: name,
						onSuccess: me.operationSuccessHandler([folderid])
					}
				}
			}
		});
	},
	
		
		
	/**
	 * 行内修改文件夹状态
	 * @param {Object} target 事件目标
	 */
	inlineFstat: function(target){
		var me = this,
			row = me.getLineData(target),
			folderid = row.folderid, 
			fstat = row.fstat;
		nirvana.inline.createInlineLayer({
			type: "select",
			value: fstat,
			id: "fstat" + folderid,
			datasource:[{
				text:'不显示',
				value:'0'
			},{
				text:'显示',
				value:'1'
			}],
			target: target.parentNode,
			okHandler: function(stat){
				return {
					func: fbs.avatar.modFstat,
					param: {
						folderids: [folderid],
						fstat: stat,
						onSuccess: me.operationSuccessHandler(-1)
					}
				}
			}
		});
	},
	
	/**
	 * 行内编辑成功后清缓存，refresh页面
	 * @param refreshTarget: undefined 全局刷新，如删除
	 *                       -1                       不刷新，如修改是否显示在首页的状态
	 *                       [id]      刷新指定文件夹        
	 */
	operationSuccessHandler: function(refreshTarget){
		return function(data){
			fbs.avatar.getMoniFolders.clearCache();
			fbs.avatar.getMoniFolderCount.clearCache();
			fbs.avatar.getWinfoid2Folders.clearCache();
			fbs.avatar.getMoniWordCount.clearCache();
			er.controller.fireMain('reload', {});
			if (refreshTarget){
			    if (refreshTarget != -1){
			        ui.util.get('SideNav').refreshNodeInfo('folder',refreshTarget);
			    }
			}else{
			    ui.util.get('SideNav').refreshFolderList();
			}
		}
	}
}); 
