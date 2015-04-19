
overview.index = new er.Action({
    VIEW: 'overviewIndex',
    
	STATE_MAP : {
		
		// 排行榜层级：默认推广单元
		'rankLevel' : 'unitinfo',
		
		// 排行榜排序指标：默认消费
		'rankOrder' : 'paysum',
		
		// 排行榜时间范围：默认昨天，1为最近7天，注意这里只能传入字符串的0
		'rankTypeid' : '0',
		
		'overviewOptionSelected' : 1,
		'overviewAverageChecked' : false,
		'overviewCalendarDateBegin' : '',
		'overviewCalendarDateEnd' : '',
		'tabIndex': 0
	},
    UI_PROP_MAP : {
        OverviewCalendar: {
            value: '*overviewCalendarDateSelected',
            availableRange: '*overviewCalendarAvailableRange',
            miniOption: '*overviewMiniOption'
        },
        OverviewType: {
            datasource: '*overviewTypeOption',
            value: '*overviewOptionSelected',
            width: '100'
        },
        rankTab: {
            title: '*rankTabTitle',
            fixedIndex: '*fixedIndex',
            allowEdit: '*allowEdit',
            container: '*tabContainer',
            tab: '*tabIndex',
            threshold: '*threshold'
        },
        rankTimeSelect: {
            datasource: '*rankTimeSelectData',
            width: '160'
        },
        rankSelect1: {
            datasource: '*rankSelectData1',
            width: '100'
        },
        rankSelect2: {
            datasource: '*rankSelectData2',
            width: '120'
        },
        rankTable: {
            noDataHtml: '*nodata',
            dragable: 'true'
        },
        foldTable: {
            noDataHtml: '*nodata'
        },
        pagination: {
            total: '*totalPage',
            page: '*pageNo'
        }
    },
		
	CONTEXT_INITER_MAP: {
		overviewInit: function(callback){
			// 下拉选项初始化
            if (this.getContext('overviewTypeOption') == null) {
				var options = [
                    {text: '展现',         value: 1},
                    {text: '点击',         value: 2},
                    {text: '消费',         value: 3},
                    {text: '转化(网页)', value: 4},
                    {text: '点击率',       value: 5},
                    {text: '平均点击价格', value: 6}
                ];
				this.setContext('overviewTypeOption', options);
			}
			
			if (this.getContext('overviewMiniOption') == null) {
				var today = new Date(nirvana.env.SERVER_TIME * 1000);
				if (today.getDate() != 1) {
                	this.setContext('overviewMiniOption', [0, 1, 2, 3, 4]);
				} else {
					this.setContext('overviewMiniOption', [0, 1, 2, 4]);
				}
			}
			
			var dateRange = {
                begin : null,
				end : null,
				beginDate : this.getContext('overviewCalendarDateBegin'),
				endDate : this.getContext('overviewCalendarDateEnd')
			}
			if (dateRange.beginDate == '') {
				//日历初始化 
				dateRange.begin = new Date(nirvana.env.SERVER_TIME * 1000);
	            dateRange.begin.setDate(dateRange.begin.getDate() - 7);
				dateRange.end = new Date(nirvana.env.SERVER_TIME * 1000);
				dateRange.end.setDate(dateRange.end.getDate() - 1);
				dateRange.beginDate = baidu.date.format(dateRange.begin,"yyyy-MM-dd");
				dateRange.endDate = baidu.date.format(dateRange.end,"yyyy-MM-dd");
				this.setContext('overviewCalendarDateBegin', dateRange.beginDate);
				this.setContext('overviewCalendarDateEnd', dateRange.endDate);			
			}else{
				//日历复位，context不能保持对象，日历控件的状态保持需要通过字符串转换
				if (ui.util.get("OverviewCalendar") && baidu.date.format(ui.util.get("OverviewCalendar").getValue().begin,"yyyy-MM-dd") != dateRange.beginDate){
					nirvana.index._flashControl.hasData = false;
				}
				dateRange.begin = baidu.date.parse(dateRange.beginDate);
				dateRange.end = baidu.date.parse(dateRange.endDate);
			}			
			
			if (!this.getContext('overviewCalendarAvailableRange')) {
				var lastAvailDate = new Date(nirvana.env.SERVER_TIME * 1000);
				lastAvailDate.setDate(lastAvailDate.getDate() - 1);
				
				this.setContext('overviewCalendarAvailableRange', {
					begin: baidu.date.parse('2001-01-01'),
					end: lastAvailDate
				});
			}

			nirvana.index._flashControl.overviewQueryDate["begin"] = dateRange.beginDate;
			nirvana.index._flashControl.overviewQueryDate["end"] = dateRange.endDate;

			this.setContext('overviewCalendarDateSelected', dateRange);		
					
			callback();
		},
		
		rankTab: function(callback){
			var me = this;
			if (!me.arg.refresh) {
				var rankTabTitle = ['排行榜'], tabContainer = ["Rank"];
				me.setContext('rankTabTitle', rankTabTitle);
				me.setContext('tabContainer', tabContainer);
			}
					callback();
		},
		
		
		/**
		 * 设置排行榜Table控件，主要传入nodaHTML，其余需要请求以后才回填
		 * @param {Object} callback
		 */
		rankTable: function(callback) {
			if (!this.arg.refresh) {
				this.setContext('nodata', FILL_HTML.NO_DATA);
			}
			
			callback();
		},
		
		/**
		 * 设置排行榜Select控件
		 * @param {Object} callback
		 * rankTimeSelectData 时间范围 对应typeid
		 * rankSelectData1 层级选择 对应level
		 * rankSelectData2 排序参数 对应order
		 */
		rankSelect : function(callback) {
			if (!this.arg.refresh) {
				var tier = [
                    {text: '推广计划', value: 'planinfo'},
                    {text: '推广单元', value: 'unitinfo'},
                    {text: '关键词', value: 'wordinfo'}
                ],
                target = [
                    {text: '展现', value: 'shows'},
                    {text: '点击', value: 'clks'},
                    {text: '消费', value: 'paysum'},
                    {text: '转化(网页)', value: 'trans'},
                    {text: '转化(电话)', value: 'phonetrans'},
                    {text: '点击率', value: 'clkrate'},
                    {text: '平均点击价格', value: 'avgprice'}
                ];
                this.setContext('rankTimeSelectData', [{text: '昨天', value: '0'}, {text: '最近7天', value: '1'}]);
				this.setContext('rankSelectData1', tier);
				this.setContext('rankSelectData2', target);
			}
			callback();
		},
		
        /**
         * 获取账户类型，快速新建小流量功能，通过EXP判断小流量用户
         */
        getUserType : function(callback) {
            var me = this;
            
            // if (nirvana.env.EXP == '7240') { // 新户转全 10.31
				// 设置引导页面的用户名
		//		me.setContext('user_name', nirvana.env.USER_NAME);
				fbs.eos.getUserType({
                    onSuccess : function(response) {
                        me.setContext('userType', response.data);
                        nirvana.env.IS_NEW_USER = (response.data == 0);
						callback();
                    },
                    onFail : function(response) {
                        ajaxFailDialog();
						callback();
                    }
				});
            // } else { // 新户转全 10.31
            //     callback(); // 新户转全 10.31
            // } // 新户转全 10.31
		}
	},
	
	onreload : function(){ 
		this.refresh();
	},
	
	onafterrender : function(){
		var me = this;
		
		nirvana.index._flashControl.init(me);
		
		//隐藏下载搬家历史的浮层
		//baidu.addClass(baidu.g('downLoadDeviceChange'), 'hide');
		       
        var rankTimeSelect = ui.util.get('rankTimeSelect');
        var rankSelect1 = ui.util.get('rankSelect1');
        var rankSelect2 = ui.util.get('rankSelect2');
		
		// 根据context设置排行榜时间范围、排序层级、指标
		rankTimeSelect.setValue(me.getContext('rankTypeid'));
		rankTimeSelect.onselect = selectHandler('rankTypeid');
		rankSelect1.setValue(me.getContext('rankLevel'));
		rankSelect1.onselect = selectHandler('rankLevel');
		rankSelect2.setValue(me.getContext('rankOrder'));
		rankSelect2.onselect = selectHandler('rankOrder');


        function selectHandler(name) {
            return function(value) {
                if (value == me.getContext(name)) {
                    return false;
                }
                if (name === 'rankLevel') {
                    nirvana.index._rank.rankSelectChangeHandle(me, value);
                }
                me.setContext(name, value);
                me.refresh();
            };
        }
		var rankTab = ui.util.get("rankTab");
		rankTab.onselect = selectHandler('tabIndex');
		rankTab.onadd = nirvana.index._folder.addFolder();
		rankTab.onclose = nirvana.index._folder.closeFolder(me);
		
		// 排行榜表格注册事件
		ui.util.get('rankTable').main.onclick = nirvana.index._rank.clickHandler;

		baidu.g("toFoldList").onclick = function(){
			er.locator.redirect('/manage/monitorList~ignoreState=1');
		};
		
		ui.util.get("manageReminder").onclick = me.getReminderHandler('manage');
		ui.util.get("pagination").onselect = nirvana.index._folder.pageChangeHandler(me);
		
		//关键词层级没有转化（电话）当rankselect1为关键词时用户F5刷新会出现rankselect2没有改变的情况
		nirvana.index._rank.rankSelectChangeHandle(me, me.getContext('rankLevel'));

        // 设置离线宝的“查看数据与设置”
        baidu.dom.g('look-data-settings').href = LOOK_DATA_SETTING;
	},
	
    onentercomplete : function () {
		var me = this,
			controlMap = me._controlMap;
        
        nirvana.index._sidebar.init();
        
        me.guideInit();
		
		// if(nirvana.env.EXP == '7450'){ // 对照组下线
		// 	nirvana.decrease.lib.popup.reqid = 0;
  //           ui.Popup.hide();
  //           ui.Popup.isModed = true;
		// }
		// else{
			// nirvana.aoPkgControl.popupCtrl.destroy();  // 已转移至init.js中的er.Action.onenter中执行
		// } // 对照组下线

        // 快速新建引导页面不执行以下逻辑
        if (me.getContext('isGuidePage')) {
            return;
        }
		
		//排行榜
		me.setRankTab();
		//我的消息
		//智能消息中心小流量，则不展示该模块，不请求任务、英才计划和消息列表 modify by zhouyu
		if (!nirvana.env.MES_CENTER) {
			baidu.removeClass("Reminder", "hide");
        	me.getTask();
			me.initReminder();
			myReminder.init(me);
		}
		
			
		/**
		 * 判断是初次加载、重新请求数据的refresh还是不需要重发请求的refresh
		 * 展现概率部分触发refresh的有两类：
		 * 1.下拉选择和显示平均复选：不需要重发请求
		 * 2.改变日期：重新发请求（同初次加载逻辑）
		 */
		var checked = me.getContext('overviewAverageChecked');
		if (checked == 'false') {
			checked = false;
		}
		ui.util.get('OverviewAverage').setChecked(checked);
		if (me.arg.refresh && nirvana.index._flashControl.hasData){
			var value = me.getContext('overviewOptionSelected');
			nirvana.index._flashControl.curIndicator != value ? nirvana.index._flash.setIndicator(value) : {};			
			nirvana.index._flashControl.curIndicator = value;
			
			nirvana.index._flash.showAverage(checked);
		}else{
			ui.util.get("OverviewAverage").disable(true);
			ui.util.get("OverviewType").disable(true);	
			ui.util.get("OverviewCalendar").disable(true);
			//获取概况数据
            nirvana.index._flash.showLoading(nirvana.index._flashControl.getOverviewData);
		}
		nirvana.index._flashControl.resizeHandler();

        // 显示概况页引导页,由于当前主要用于显示ao包的引导页，初始化设query为true
        overview.guide.show(true);

        // 优化包状态初始化
        me.appArea.init();
        		
		// 老户优化对照组不需要引导功能
		/*if (nirvana.env.EXP != '7450') {
			// 第一次登录，显示新手引导
			if (LoginTime.isFirstTime('OverviewSlide')) {
				overview.slide.init();
			}
		}*/
		// 请求优化包权限信息 // 对照组下线
		// if (nirvana.env.EXP != '7450') {
        // 当前这个请求权限的接口用不到，暂时先注释掉 by Wu Huiyao
		//    me.requestAoPkgAuth();
		// } // 对照组下线
    },
    /**
     * 请求优化包权限信息 
     * NOTICE：以下请求权限接口代码暂时不要删掉，以后可能还会用到！！！
     * @author Wu Huiyao(wuhuiyao@baidu.com)
     */
    /*requestAoPkgAuth: function() {
        var me = this,
            utils = nirvana.util,
            param = {};
            
        // 定义请求成功的回调函数
        param.onSuccess = utils.getEventHanlder(me, me.requestAoPkgAuthResponseHandler);

        // 定义请求失败的回调函数
        param.onFail = utils.getEventHanlder(me, me.requestAoPkgAuthResponseHandler);
        
        // 发送数据请求，接口定义{@link baseService/aoPackage.js}
        fbs.nikon.getNikonPkgauth(param);
    },*/
    /**
     * 响应优化包权限请求的处理器
     * @author Wu Huiyao(wuhuiyao@baidu.com)
     */
    /*requestAoPkgAuthResponseHandler: function(result) {
        var me = this,
            status = result.status,
            data = result.data,
            success = (200 == status);
         
         if (success) {
            // 处理响应返回的数据
            me.processResponseAoPkgAuthData(result.data);
         } else {
            // 弹出失败的对话框，函数定义{@link lib/util.js}
            ajaxFailDialog(); 
         }
    },*/
	/**
     * 处理返回的重点词详细信息数据
     * @param {Object} data
     * @author Wu Huiyao(wuhuiyao@baidu.com)
     */
    /*processResponseAoPkgAuthData: function(data) {
        var me = this,
            aostatus = data.aostatus;
        
        switch (aostatus) {
            case 0: // 期待的状态，正常
                break;
            case 1: // 处理中，按目前和后台协商，这里不需要轮询，因此应该不会返回1
            case 3: // 处理失败
            case 100: //参数错误
            default:
                ajaxFailDialog(); // 出错处理
                return; // 直接退出
        }
        
        var auth;
        if (typeof data.auth === 'string') {
            auth = baidu.json.parse(data.auth);
        } else if (data.auth instanceof Array) {
            auth = data.auth;
        } else {
            auth = [];
        }
        
        // 判断是否有使用行业优化包权限
        // 新包但还是小流量的优化包ID
        var newPkgId = 6; 
        if (baidu.array.indexOf(auth, newPkgId) != -1) {
            me.hasViewNewPkgAuth = true;
        }
    },*/
	onleave: function(){
		nirvana.index.disposeCoupon();
		// 销毁账户质量评分实例
		nirvana.AccountScore.dispose();
		// 销毁所有创建的Tip实例
		ui.Tip.destory();
	},
	
	/**
	 * 引导页初始化
	 */
	guideInit : function() {
		var me = this;
		
		// 快速新建小流量，新账户，需要引导页面，不需要缓存状态 7.18不删除
        if (// nirvana.env.EXP == '7240' && // 新户转全 10.31
        	me.getContext('userType') == 0 && nirvana.quickSetupLib.needGuidePage) {
			// 当前为引导页面
			me.setContext('isGuidePage', true);
			
			me.contentArea.hide();
			
			// 绑定按钮事件
			baidu.g('GotoOverview').onclick = function(){
				me.contentArea.show();
				
				// 重新载入action
				me.refresh();
				
				// 重新载入flash，否则flash在Firefox下出现空白
				nirvana.index._flashControl.init(me);
				baidu.event.fire(window, 'resize');
				
				return false;
			};
			// 绑定按钮事件
            ui.util.get('GotoSlide').onclick = function(){
				nirvana.quickSetupLogger('quicksetup_showGuideMotion', {
					eos_type : 'useracct',
					entrance : 5
				});
                nirvana.quickSetupLib.slide.open();
            };
			
			ui.util.get('GotoEos').onclick = function() {
				nirvana.quicksetup.show({
					type : 'useracct',
					redirect : true,
					entrance : 0
				});
			};

			nirvana.quickSetupLogger('quicksetup_showGuidePage', {
				eos_type : 'useracct',
				entrance : 0
			});
			
			// 引导页显示以后，则将标识置为false，不再打开
			nirvana.quickSetupLib.needGuidePage = false;
			
		} else { // 老账户，显示概况页内容
			// 当前非引导页面
			me.setContext('isGuidePage', false);
			
			me.contentArea.show();
            
			
		}
	},
	
	/**
	 * 获取任务状态
	 * @param {Object} callback
	 */
	getTask: function(){
		var me = this;
		
		// 新户搭建 7.18不删除
		// if (nirvana.env.EXP == '7240') { // 新户转全 10.31
			fbs.eos.taskstatus({
				onSuccess: function(response){
					var taskState = response.data.taskstate,
						taskType = response.data.tasktype, 
						taskMsg = taskType == 'useracct' ? '账户' : '计划', 
						taskName = '', taskDesc = '';
					
					me.setContext('taskType', taskType);
					
					// 先设置任务状态的样式
					me.setContext('task_class', 'remind_task');
					
					// 与PM确认各种状态如何处理
					switch (taskState) {
						// 未开始，隐藏任务
						case 0:
						// 开始生成方案，隐藏任务
						case 1:
						// 开始入库，隐藏任务
						case 3:
							me.setContext('task_class', 'hide');
							break;
						// 推广方案成功
						case 2:
                            taskName = '客户你好，你的快速新建%tmp任务已完成';
                            taskDesc = '点击这里进入第三步：查看定制方案';
                            break;
						// 方案入库完成
						case 4:
                            taskName = '客户你好，你的快速新建%tmp任务已完成';
                            taskDesc = '点击这里进入第四步：添加推广创意';
                            break;
						// 部分入库成功，部分入库失败
						case 5:
                            taskName = '客户你好，你的快速新建%tmp任务已部分完成';
                            taskDesc = '点击这里进入第四步：添加推广创意';
                            break;
                        // 生成方案失败
                        case 6:
                            taskName = '客户你好，你的快速新建%tmp任务完成失败';
                            taskDesc = '点击这里了解“方案未能生效”详情';
                            break;
						// 入库失败
						case 7:
							taskName = '客户您好，您的快速新建%tmp任务未完成';
							taskDesc = '推广%tmp新建失败';
							break;
						default:
							break;
					}
					
					// 如果是新建计划，则将方案两个字替换为计划，只替换第一个
					if (taskType == 'planinfo') {
						taskDesc = taskDesc.replace(/方案/, '计划');
					}
					
					me.setContext('task_name', taskName.replace(/%tmp/g, taskMsg));
					me.setContext('task_desc', taskDesc.replace(/%tmp/g, taskMsg));
					me.taskInit();
				},
				onFail: function(){
					baidu.setAttr('RemindTask', 'class', 'hide');
				}
			});
		// }// 新户转全 10.31
		// else {// 新户转全 10.31
		// 	// 隐藏任务区域// 新户转全 10.31
		// 	baidu.setAttr('RemindTask', 'class', 'hide');// 新户转全 10.31
		// }// 新户转全 10.31
	},
	
	/**
	 * 任务状态初始化，监听事件
	 */
	taskInit : function() {
		var me = this,
			RemindTaskName = baidu.g('RemindTaskName'),
			taskClass = me.getContext('task_class');
		
		// 设置任务区域显示或隐藏
		baidu.setAttr('RemindTask', 'class', taskClass);
				
		if (RemindTaskName && taskClass != "hide") {
            baidu.g('RemindTaskDesc').innerHTML = me.getContext('task_desc');
			
			RemindTaskName.innerHTML = me.getContext('task_name');
			RemindTaskName.onclick = function(){
				nirvana.quicksetup.show({
					type: me.getContext('taskType'),
					redirect: false, // 不转到推广管理页面
					entrance: 3
				});
				
				return false;
			};
		}
	},

	
	/**
	 * 概况区域增加show/hide方法
	 */
	contentArea : {
		show : function() {
			baidu.removeClass('OverviewWrap', 'hide');
            baidu.addClass('OverviewGuide', 'hide');
		},
		
		hide : function() {
            baidu.addClass('OverviewWrap', 'hide');
            baidu.removeClass('OverviewGuide', 'hide');
		}
	},
	
	/**
	 * 设置排行榜Tab控件
	* @param {Object} callback
	*/
	setRankTab: function(){
		var me = this;
		fbs.avatar.getMoniFolders({
			fstat: [1],
			fields: ["folderid", "foldername", "moniwordcount"],
			onSuccess: me.setRankTabHandler(),
			onFail: function(){
				ajaxFailDialog();
			}
		});
	},
		
	
	
	/**
	* 设置排行榜tab响应函数
	* @param {Object} callback
	*/
	setRankTabHandler: function(){
		var me = this;
		return function(data){
			var dat = data.data.listData || [], len = dat.length;
			var fixedIndex = [true], allowEdit = true, rankTabTitle = ['排行榜'], tabContainer = ["Rank"], folderids = [];
			if (len > 0) {
				for (var i = 0; i < len; i++) {
					fixedIndex[fixedIndex.length] = false;
					rankTabTitle[rankTabTitle.length] = baidu.encodeHTML(dat[i].foldername);
					tabContainer[tabContainer.length] = "Folders";
					folderids[folderids.length] = dat[i].folderid;
				}
				me.setContext('threshold', 10);
			}
			else {
				fixedIndex[fixedIndex.length] = true;
				rankTabTitle[rankTabTitle.length] = "我的监控文件夹";
				tabContainer[tabContainer.length] = "Folders";
				folderids[folderids.length] = 0;
				me.setContext('threshold', false);
			}
			nirvana.index._folder.indexFolders = dat;
			me.setContext('fixedIndex', fixedIndex);
			me.setContext('allowEdit', allowEdit);
			me.setContext('rankTabTitle', rankTabTitle);
			me.setContext('tabContainer', tabContainer);
			me.setContext("folderids",folderids);
			/**
			 * initMap后render rankTab导致tab属性改变成0，
			 * 由于tabIndex的context值没有重新设置，repaint时不会重新reject数据，
			 * 所以此处要手动设置一下
			 */
			ui.util.get("rankTab").tab = me.getContext("tabIndex");
			me.repaint();
			me.getTabData();
		}
	},
	
	getTabData: function(){
		var me = this, tabIndex = +me.getContext("tabIndex");
		if (tabIndex > 0) {
			var folderid = me.getContext("folderids")[tabIndex - 1];
			nirvana.index._folder.init(me, folderid);
		}
		else {			//请求排行榜数据
			nirvana.index._rank.request({
				level: me.getContext('rankLevel'),
				order: me.getContext('rankOrder'),
				typeid: me.getContext('rankTypeid'),
				
				onSuccess: me.requestRankHandler(),
				onFail: function(response){
					// Added by Wu Huiyao FIXBUG: rankTable undefined，由于没有初始化rankTable
					var rankTable = ui.util.get("rankTable");
					rankTable.fields = nirvana.index._rank.fields;
					rankTable.render();
					nirvana.index._rank.exception(response);
				}
			});
		}
	},
	
	requestRankHandler: function(){
		var me = this;
		return function(response){
			var rankTable = ui.util.get("rankTable");
			nirvana.index._rank.render(response, me.getContext('rankLevel'));
			
			rankTable.fields = nirvana.index._rank.fields;
			rankTable.datasource = nirvana.index._rank.datasource;
			rankTable.orderBy = me.getContext('rankOrder');
			rankTable.noScroll = true;
			//if (!me.arg.refresh) { 这里需要每次更新，所以注释掉判断逻辑
			rankTable.render(rankTable.main);
			//}
			if (rankTable.datasource.length) { // 表格有数据
				// 删除body的class，主要是取消高度限制
				baidu.removeClass(rankTable.getBody(), 'heightLimit');
				ui.Bubble.init(baidu.q('ui_bubble','materialArea'));
			}
			else {
				baidu.addClass(rankTable.getBody(), 'heightLimit');
			}
			baidu.event.fire(window, 'resize');
		}
	},
    
    
    initReminder : function () {
        this._controlMap.remindDialog = new ui.util.create('Dialog', {
            id : 'remindDialog',
            title : '提醒管理',
            width : 660 
        })
        this._controlMap.remindFinishedDialog = new ui.util.create('Dialog', {
            id : 'remindFinishedDialog',
            title: '新建提醒',
            width: 660
        });
    },

    getReminderHandler : function (type) {
        var me = this;
        return function () {
            var controlMap = me._controlMap,
                action, 
                okBtn = controlMap.reminderOK,
                cancelBtn = controlMap.reminderCancel,
                dialog = me.getReminderDialog(),
                dialogFoot,
                dialogAction = 'overview.reminder',
                actionParam = {'type': type};

            dialog.show(); 
            
            //if(!me.isDialogInit) {
            //    me.isDialogInit = true;
                okBtn = ui.util.create('Button', {
                    id : 'reminderOK',
                    content : '确定'
                }); 
                dialogFoot = dialog.getFoot();
                dialogFoot.innerHTML = '';
                okBtn.appendTo(dialogFoot);
                okBtn.onclick = me.getReminderOKHandler(okBtn);

                cancelBtn = ui.util.create('Button', {
                    id : 'reminderCancel',
                    content : '取消'
                });

                cancelBtn.appendTo(dialogFoot);
                cancelBtn.onclick = me.getReminderCancelHandler();
                
                
                action = er.controller.loadSub(dialog.getBodyId(), dialogAction, actionParam);
                me.actionObj = action;
            //}
			// 浮出层二次定位
			dialog.resizeHandler();
        }
    },

    getReminderFinishedHandler : function () {
        var me = this;
        return function () {
            var dialog = me.getReminderFinishedDialog();
            dialog.show();
            //console.log(dialog);
            var okBtn = ui.util.create('Button', {
                id : 'reminderFinishedOK',
                content : '确定'
            }); 
            var dialogFoot = dialog.getFoot();
            dialogFoot.innerHTML = '';
            okBtn.appendTo(dialogFoot);
            okBtn.onclick = me.getReminderFinishedOKHandler(okBtn);

            var body = dialog.getBody();
            body.innerHTML = me.getReminderFinishedHtml();
        };
    },
    remindRuleValueInfo: {
        remindWay : {
            '1': '消息提醒',
            '2': '短信提醒',
            '4': '邮件提醒'
        },
        remindContent: {
            '0': '到达预算下线',
            '1': '当日消费到达',
            '2': '无匹配资格 （因搜索量过低）',
            '3': '无展现资格 （因不宜推广）'
        }

    },
    getReminderFinishedHtml : function () {
        var me = this,
            dialog = me.getReminderFinishedDialog(),
            ruleData = dialog.ruleData,
            selectedListData = dialog.selectedListData,
            htmlTpl = er.template.get('reminderFinished'),
            i = 0, len = 0, remindWayArr = [], remindContentStr = '', 
            targetValueArr = [], sucessInfo, targetValueHTML;

        sucessInfo = dialog.isModify? '成功保存提醒规则！' : '成功添加提醒规则！'; 
        for(len = ruleData.remindWay.length; i < len; i++){

            remindWayArr.push(me.remindRuleValueInfo.remindWay[ruleData.remindWay[i]]);
        }

        remindContentStr = me.remindRuleValueInfo.remindContent[ruleData.remindContent];

        for(i = 0, len = selectedListData.length; i < len; i++){
            targetValueArr.push(selectedListData[i].name);
        }
		
        if(ruleData.targetType == 2){//如果是推广帐户层级
            targetValueArr = [nirvana.env.USER_NAME];
            if (ruleData.remindContent == 1) {
                remindContentStr += ruleData.customValue.paysum + '元'; 
            }
        }
        if (ruleData.targetType == 7) {//如果是创意层级 
           
            targetValueHTML = targetValueArr.join(','); 
            
        } else {
            targetValueHTML  = escapeHTML(targetValueArr.join(','));
        }

        return ui.format(htmlTpl, 
                         sucessInfo,
                         remindWayArr.join(','),
                         targetValueHTML,
                         remindContentStr);

         
    },
    
    getReminderFinishedOKHandler : function (okBtn) {
        var me = this;
        return function () {
            var dialog = me.getReminderFinishedDialog();
            dialog.hide();
            fbs.remind.getRule.clearCache();
			fbs.remind.getRemindList.clearCache();
            me.refresh();
        };
    },
    getReminderOKHandler : function (okBtn) {
        var me = this;
        return function () {
            //如果是在推广管理的列表状态，关掉dialog
            if(baidu.dom.hasClass('reminderRuleForm','hide')){
                var dialog = me.getReminderDialog();
                dialog.hide();
                fbs.remind.getRule.clearCache();
                fbs.remind.getRemindList.clearCache();
                me.refresh();
                return;
            }
            //如果在修改状态
            if(me.actionObj.validateAndSubmit){
                me.actionObj.validateAndSubmit(okBtn, 
                                               me.getReminderDialog(), 
                                               me.getReminderFinishedDialog(), 
                                               me.getReminderFinishedHandler()); 
            }
        }
    },

    getReminderCancelHandler : function () {
        var me = this;
        return function () {
            var dialog = me.getReminderDialog();
            dialog.hide();
            fbs.remind.getRule.clearCache();
            fbs.remind.getRemindList.clearCache();
            me.refresh();
        };
    },
    getReminderDialog : function () {
        var me = this;
        return me._controlMap.remindDialog;
    },
    getReminderFinishedDialog : function () {
        var me = this;
        return me._controlMap.remindFinishedDialog;
    },
	
	/**
	 * 概况页优化包区域
	 * 如果是老户优化对照组（nirvana.env.EXP == '7450'）则不执行相关方法
	 * 转全时，直接去掉判断语句
	 */
    appArea: overview.aoPackage // 将下面代码抽取到overview/aoPackage.js by Huiyao 2013.2.28
//	appArea : {
//		// 轮询计数器
//		queryTimesCount : 0,
//
//		pkgCache : [],   // 缓存轮询中获取到的已经展现的包的pkgid
//		pkgOptCache : [], // 有更新条数的包的id
//        pkgRank: [], // 包的展现顺序
//		pkgShowTime : {}, // 展现时间
//		pkgOptnumTime : {}, // 展现更新条数时间
//		requestStart : null, // 请求的开始时间
//        globalId : null,
//        roundId : 0,
//
//		// 最大请求次数
//		// 根据UE的某次调研，用户进入概况页的停留大约为10-20s，则配置最大次数为30，时间为30s足矣
//		maxQueryTimes : 10,
//
//		// 优化包状态轮询间隔
//		queryInterval : 1000,
//
//        // 模块是否存在
//        exist: null,
//
//		loading : function() {
//			nirvana.util.loadingQuery.show('AoPackageArea');
//		},
//
//		done : function() {
//			var me = this,
//				showtime = [],
//				showopttime = [],
//				singleoptime;
//
//			nirvana.util.loadingQuery.hide('AoPackageArea');
//
//			// 发送展现监控
//			// 处理“本次轮询展现的新包”的监控
//			if(me.pkgCache.length > 0 && me.pkgOptCache.length > 0){
//				for(i = 0; i < me.pkgCache.length; i++){
//					showtime.push(me.pkgShowTime['pkg_' + me.pkgCache[i]]);
//					singleoptime = me.pkgOptnumTime['pkg_' + me.pkgCache[i]] || 0;
//					showopttime.push(singleoptime);
//				}
//				nirvana.aoPkgControl.logCenter.extend({
//					packages : me.pkgCache.join(),
//                    pkgRank: me.pkgRank.join(),
//					actionStep : -2,
//					queryStartTime : this.requestStart,
//					pkgid : null,
//					pkgShowTime : showtime.join(),
//					pkgShowOptTime : showopttime.join(),
//					entrance : 0 // 意味着推广概况页包区域
//				}).sendAs('nikon_package_show');
//				// this.pkgCache = this.pkgCache.concat(newPkgs);
//			}
//
//            //nirvana.index.newTip.old_exist = this.exist;
//            //nirvana.index.newTip.show();
//		},
//
//		init : function() {
//			/* 老户优化转全
//			 * 保留对照组，版本号为7450
//			 *
//			 */
//            // if (nirvana.env.EXP == '7450') { // 对照组下线
//            //     //nirvana.index.newTip.old_exist = false;
//            //     //nirvana.index.newTip.show();
//            //     baidu.addClass('AoPackageArea', 'hide');
//            //     return;
//            // }
//
//			var me = this;
//            this.exist = null;
//
//		    this.pkgCache = [];
//		    this.pkgOptCache = [];
//		    this.pkgShowTime = {};
//		    this.pkgOptnumTime = {};
//		    this.requestStart = (new Date()).valueOf();
//            this.globalId = null;
//            this.roundId = 0;
//			me.loading();
//
//			// 重置相关参数
//			me.reqid = '';
//			// 计数器清零
//			me.queryTimesCount = 0;
//
//			me.request();
//
//			baidu.g('AoPackageList').onclick = me.clickHandler();
//		},
//
//		request : function() {
//			var me = this;
//
//			// 如果超过最大请求次数，直接down掉
//			if (me.queryTimesCount++ >= me.maxQueryTimes) {
//                me.done();
//				return;
//			}
//			var reqid = me.reqid,
//			    command = 'start';
//
//			if (reqid !== '') {
//				command = 'query';
//			}
//
//			var condition = me.getExtraCondition();
//            me.roundId++;
//            condition.roundId = me.roundId;
//            if(command == 'query'){
//                condition.globalId = me.globalId;
//            }
//
//			fbs.nikon.getPackageStatus({
//                command : command,
//                reqid : reqid,
//                condition : condition,
//                onSuccess : me.responseSuccess(),
//                onFail : function(response) {
//                    ajaxFailDialog();
//                }
//            });
//		},
//
//		getExtraCondition : function(){
//			var condition = {},
//				extra = [];
//
//			var sdata = LoginTime.getData('AoPkgWords');
//			if(sdata && sdata.viewed){
//				extra.push("4_3");
//			}
//			if(extra.length > 0){
//				condition.extra = extra.join();
//			}
//			return condition;
//		},
//
//		responseSuccess : function() {
//			var me = this;
//
//			return function(response) {
//				var data = response.data,
//				    aostatus = data.aostatus,
//					reqid = data.reqid,
//					aoPackageItems = data.aoPackageItems;
//
//				// reqid不匹配，则不是同一批次的轮询请求，直接丢弃
//				if (me.reqid != '' && me.reqid != reqid) {
//					return false;
//				}
//
//				// me.reqid有可能为''，直接赋值
//                me.reqid = reqid;
//                me.aoPackageItems = aoPackageItems;
//
//			    // 对于小流量包上线的时候，或者对照组可能对于new出现有特殊需求，这里要重置一下
//			    // 如果不存在这种情况，这行代码可以注掉
//                overview.AoPkgGuide.resetPkgFlag(aostatus, aoPackageItems);
//
//				// 这里处理返回数据
//				me.render();
//
//				// 引导页自动出现时机：在优化包渲染到智能优化区域之后再出，避免引导页出错
//                overview.AoPkgGuide.autoShow(aoPackageItems);
//
//				// 判断请求状态，轮询或者终止
//				switch (aostatus) {
//                    case 0:
//                        me.done();
//						break;
//                    case 1:
//                        setTimeout(function() {
//							me.request();
//						}, me.queryInterval);
//						break;
//                    case 2:
//						break;
//				}
//			};
//		},
//
//        /**
//         * 优化包渲染函数
//         */
//        render : function() {
//            // 克隆优化包配置
//            var me = this,
//                aoPackageItems = me.aoPackageItems,
//				// 后端返回的单个包
//				aoPackageItem,
//				len = aoPackageItems.length,
//				aoPackages = baidu.object.clone(nirvana.aoPkgConfig.SETTING),
//				// 前端优化包配置
//				aoPackage,
//                i,
//				tmpHTML = [],
//				newPkgs = [],
//				showTime = [];
//
//            if (!this.exist) {
//                this.exist = !!len;
//            }
//
//            if(len > 0){
//                me.globalId = aoPackageItems[0].data.globalId;
//            }
//
//            me.pkgRank = [];
//			for (i = 0; i < len; i++) {
//				aoPackageItem = aoPackageItems[i];
//                me.pkgRank.push(aoPackageItem.pkgid);
//
//				aoPackage = aoPackages[nirvana.aoPkgConfig.KEYMAP[aoPackageItem.pkgid]];
//
//				if(aoPackage){
//					// 合并前端配置属性与后端返回数据
//					baidu.extend(aoPackage, aoPackageItem);
//
//					tmpHTML.push(me.buildHTML(aoPackage));
//
//					// 判断并记录包的展现监控
//					// edited by LeoWang (wangkemiao@baidu.com)
//					// 2012-11-22
//					if(baidu.array.indexOf(this.pkgCache, aoPackage.pkgid) == -1){
//						this.pkgCache.push(aoPackage.pkgid);
//						this.pkgShowTime['pkg_' + aoPackage.pkgid] = (new Date()).valueOf();
//					}
//					if(aoPackage.newoptnum > 0){  // 有建议
//						// 判断是否已经有了？
//						if(baidu.array.indexOf(this.pkgOptCache, aoPackage.pkgid) == -1){
//							this.pkgOptCache.push(aoPackage.pkgid);
//							this.pkgOptnumTime['pkg_' + aoPackage.pkgid] = (new Date()).valueOf();
//						}
//					}
//				}
//			}
//
//            baidu.g('AoPackageList') && (baidu.g('AoPackageList').innerHTML = tmpHTML.join(''));
//
//            // holiday
//            // modified by Leo Wang(wangkemiao@baidu.com)
//            // nirvana.aoPkgControl.holidayActivity.init('overview');
//
//            // 渲染优化包查看介绍功能
//            overview.AoPkgGuide.initGuideTip();
//        },
//
//        /**
//         * 构造优化包HTML
//         * @param {Object} appObject
//         */
//        buildHTML : function(appObject) {
//            var tmpHTML = [],
//                appClass = '',
//                upNumClass = '',
//                count = appObject.count,
//                tpl = er.template,
//                pkgid = appObject.pkgid,
//                data = appObject.data,
//                newoptnum = appObject.newoptnum,
//                pkgTxt = '',
//                pkgTip = '',
//                // 新功能'new'样式信息， Added by Wu Huiyao
//                decoratedStyle = '',
//                highlightStyle = '';
//
//            // 限时包标识
//            if (appObject.limitTime) {
//                appClass = 'limit_time';
//            }
//
//            // 更新数量为0或-1时不显示
//            if (newoptnum < 1) {
//                upNumClass = 'hide';
//            } else {
//                pkgTip = '您有' + newoptnum + '条新的优化建议';
//
//				// 更新数量为2位数，则修改更新数量的class
//                // 这里判断更新数量的位数，选择相应的class。。。背景图片各种阴影圆角，直接用替换图片实现吧
//                // 最大为99+
//				if (newoptnum > 9) {
//					upNumClass = 'update2';
//				}
//            }
//
//			/***********Added by Wu Huiyao****************************/
//			// 对于优化包新增样式信息
//            if (appObject.isNew) {
//                appClass += ' new_pkg';
//                decoratedStyle = 'new_pkg_flag';
//                highlightStyle = 'newpkg_highlight';
//            } else if (appObject.isUpgrade) {
//                appClass += ' upgrade_pkg';
//                decoratedStyle = 'upgrade_pkg_flag';
//                highlightStyle = 'upgradepkg_highlight';
//            } else {
//                decoratedStyle = 'hide';
//                highlightStyle = 'hide';
//            }
//            /*************END*************/
//
//			switch (pkgid) {
//                case 1:
//                    var stage = {
//						shows : '展现',
//						clks : '点击'
//					},
//					beginValue = data.beginvalue,
//					endValue = data.endvalue,
//					decrValue = round(((beginValue - endValue) / beginValue) * 100) + '%', // 保存为整数
//					dateType = nirvana.aoPkgControl.popupCtrl.dateTypeTranslation[data.datetype]; // 工作日 节假日
//
//					pkgTxt = '昨日比前一个' + dateType + stage[data.decrtype] + '突降<strong>' + decrValue + '</strong>（' + beginValue + '<span class="specFamily">→</span>' + endValue + '）';
//					break;
//                case 2:
//                    var totalClkLost = data.totalclklost;
//
//					if (totalClkLost > 0) {
//						pkgTxt = '您最近7天损失<strong>' + totalClkLost + '</strong>个客户访问';
//					} else {
//						pkgTxt = '提升您的客户访问量';
//					}
//					break;
//                case 3:
//                    var startype = data.startype,
//					    status = {
//							1 : '较差',
//							2 : '一般'
//						};
//
//					switch (+startype) {
//                        // 无生效关键词
//                        case 0:
//                            pkgTxt = '账户内无关键词';
//							break;
//                        // 生效一星词
//                        case 1:
//                        // 生效二星词
//                        case 2:
//                            var num = data.num,
//							    ratio = round((num / data.totalnum) * 100) + '%'; // 保存为整数
//
//							pkgTxt = '账户内<strong>' + data.num + '</strong>个关键词质量度' + status[startype] + '(占' + ratio + ')';
//							break;
//                        // 生效三星词
//                        case 3:
//                            pkgTxt = '账户内关键词质量优秀，<span class="good"></span>'
//							break;
//					}
//
//					break;
//				case 4:
//					var sdata = LoginTime.getData('AoPkgWords');
//					if(sdata && sdata.viewed){
//						upNumClass = 'hide';
//						pkgTip = '';
//						pkgTxt = '查看重点词实时表现';
//					}
//					else{
//						if(newoptnum == -1){
//							pkgTxt = '计算中...';
//						}
//						else if(newoptnum == 0){
//							upNumClass = 'hide';
//							pkgTip = '';
//							pkgTxt = '查看重点词实时表现';
//						}
//						else{
//							var proctime = data.proctime;
//							var probwordnum = data.probwordnum;
//							if('undefined' != typeof proctime && 'undefined' != typeof probwordnum){
//								pkgTip = '您有' + newoptnum + '个重点词建议优化'
//								//pkgTxt = probwordnum + '个重点词建议优化<br />' +  baidu.date.format(new Date(+proctime), 'HH:mm') + '完成诊断';
//                                pkgTxt = nirvana.corewordUtil.getPkgOverviewInfo(data);
//							}
//							else{
//								pkgTxt = '';
//							}
//						}
//					}
//					break;
//				case 5:
//					if(data.totalwordsnum == '-1'){
//						pkgTxt = '计算中...';
//					}else{
//						pkgTxt = (data.totalwordsnum != '0') ? '（<strong>' + data.totalwordsnum + '</strong>个关键词）' : '';
//						pkgTxt = '为您搜罗业务相关各种好词' + pkgTxt;
//					}
//					break;
//			    case 6: //行业领先包
//			        if (!data || !data.tiptype) {
//			        	break;
//			        }
//			        var tipType = +data.tiptype;
//			        switch (tipType) {
//			        	case 1:
//			        		pkgTxt = '您的点击量在行业中表现优秀';
//			        		break;
//			        	case 2:
//			        		pkgTxt = '您的点击量位于行业前<strong> ' + data.percent + '%</strong>';
//			        		break;
//			        	case 3:
//			        		pkgTxt = '您的点击量位于行业后 <strong> ' + (100 - data.percent) + '%</strong>';
//			        		break;
//			        }
//			    	break;
//                case 7: // 升级的突降急救包
//                    var beginValue = data.beginvalue;
//                    var endValue = data.endvalue;
//                    var beginDate = new Date(+data.begindate);
//                    var endDate = new Date(+data.enddate);
//                    var format = baidu.date.format;
//                    var abstrTPL = '{endDate}比{beginDate}点击突降<strong>{decrValue}%</strong>' +
//                        '（{beginValue}<span class="specFamily">→</span>{endValue}）';
//
//                    pkgTxt = lib.tpl.parseTpl({
//                        beginDate: format(beginDate, 'M月d日'),
//                        endDate: format(endDate, 'M月d日'),
//                        decrValue: round((beginValue - endValue) / beginValue * 100),
//                        beginValue: beginValue,
//                        endValue: endValue
//                    }, abstrTPL);
//                    break;
//			}
//
//			return lib.tpl.parseTpl({
//				pkg_class: appClass,
//				id: appObject.id,
//				pkgid: pkgid,
//                pkg_tip: pkgTip,
//				optnum_class: upNumClass,
//				pkg_newoptnum: appObject.newoptnum,
//				pkg_name : appObject.name,
//				pkg_desc : appObject.iconDesc,
//				pkg_text : pkgTxt,
//				// 填充包装饰功能样式信息 Added by Wu Huiyao
//				decorated_class: decoratedStyle,
//                highlight_class: highlightStyle
//			}, tpl.get('aoPackageItem'));
//        },
//
//		clickHandler : function() {
//			var me = this,
//			    target,
//				tagName,
//				pkgid;
//
//			// 更新target
//			function updateTarget(target) {
//				tagName = target.tagName.toLowerCase();
//				pkgid = target.getAttribute('pkgid');
//			}
//
//			return function(e) {
//				var e = e || window.event;
//
//				target = e.target || e.srcElement;
//				updateTarget(target);
//
//				while (!pkgid && tagName !== 'ul') { // 没有点击优化包标签，则向上追溯父节点
//					target = target.parentNode;
//					updateTarget(target);
//				}
//
//                // nirvana.aoPkgControl.logCenter.setEnterance(0)
//                //                            .clear()
//                //                            .extend({
//                //                                pkgid : pkgid
//                //                            })
//                //                            .sendAs('nikon_package_enter');
//				nirvana.aoPkgControl.openAoPackage(pkgid, 0);
//			};
//		}
//	}
});

//消息中心首页显示
var myReminder = {
	button:false,
	me:null,
	
	//获取规则列表
	init: function(me){
		myReminder.me = me;
		fbs.remind.getRule({
			onSuccess: myReminder.renderReminderList,
			onFail: myReminder.exception
		});
	},
	
	
	//若规则数量大于0 ， 获取提醒列表
	renderReminderList: function(data){
		var rule = data.data.listData,
			manageReminder = ui.util.get("manageReminder").main;
		myReminder.button = true;
		manageReminder.style.display = "block";
		fbs.remind.getRemindList({
			onSuccess: myReminder.fillReminder,
			onFail: myReminder.exception
		});
	},
	
	//获取提醒列表回调函数
	fillReminder: function(data){
		var me = myReminder.me,
			reminder = data.data.listData,
			len = reminder.length > 50 ? 50 : reminder.length, 
			html = [], 
			threshLen = 30, 
			tmp = '<div><span class={0}>{1}</span>&nbsp;&nbsp;<span class="{2}" title="{3}">{4}</span></div>', 
			noRemindHtml = "+新添一个提醒";
		
		var time, content,title,split = [],date = [];
		
		if (len > 0) {
			for (var i = 0; i < len; i++) {
				time = reminder[i].createtime;
				split = time.split(" ");
				date = split[0].split("-");
				time = date[0] + "年" + date[1] + "月" + date[2] + "日" + split[1];
				content = reminder[i].content;
				title = baidu.string.encodeHTML(content);
				if (baidu.string.getByteLength(content) > threshLen) {
					content = baidu.string.subByte(content, threshLen) + "..";
				}
				content = baidu.string.encodeHTML(content);
				html[html.length] = {
					html: ui.format(tmp, "remindTime", time, "remindContent", title, content)
				};
			}
		}
		else {
			var noRemind = '<div class="noReminder" id="noRemind" data-log="{target:\'addRemind_btn\'}">' + noRemindHtml + '</div>';
			html[0] = {
				html: noRemind
			};
		}
		me.setContext("remindContent", html);
		me.repaint();
		if(baidu.g("noRemind")){
			baidu.g("noRemind").onclick = me.getReminderHandler('new');
		}
	},
	
	exception: function(response){
		var status = response.status;
		
		var html = [];
		html[0] = {
			html: FILL_HTML.EXCEPTION
		};
		myReminder.me.setContext("remindContent", html);
		myReminder.me.repaint();
	}
};

/**
 * Flash图表调用js的接口
 * @param {Object} date
 */
function getHistory(date){
	if (nirvana.index._flashControl.isPerDay ){
		var logParams = {
			target: "getHistory",
			date: date
		};
		NIRVANA_LOG.send(logParams);
		nirvana.index._flashControl.getHistory(date);	
	}
}

nirvana.index = (function() {
    // ================ 事件代理 ========================
    var handlerMap = {
        open: function(e) {
            var module = getModule(e.target);
            open(module, true);
        },
        close: function(e) {
            var module = getModule(e.target);
            close(module, true);
        },
        // 财务信息
        payment: function() {
            payment();
        },
        // 账户质量评分
        /**
         * 触发时机：点击 “详情” 按钮
         */
        openAccountScore: function() {
        	// Modified by Wu Huiyao
            //openAccountScore();
        	nirvana.AccountScore.getInstance().openDetail();
        },
        // 账户设置
        modifyBudget: function() {
            modifyBudget();
        },
        modifyArea: function() {
            modifyArea();            
        },
        otherSetting: function() {
            otherSetting();            
        },
        // 市场风向标
        /**
         * 触发时机：点击 “详情” 按钮
         */
        openMarketTrend: function() {
            er.locator.redirect('/overview/marketTrend');
        }
    };
    /**
     * 通过按钮找到所属的模块
     */
    function getModule(btn) {
        var ret = baidu.dom.getAncestorBy(btn, function(el) {
            if (baidu.dom.hasClass(el, 'module')) {
                return true;
            }
        });
        return ret;
    }

    // ====================== 业务逻辑 ============================
    // 模块是否存在
    var exist_coupon, exist_market;

    // 展开收起用到的值
    var ACCTSET = 61, // 账户设置
        COUPON = 62,  // 优惠券
        MARKET = 63,  // 市场风向标
        HIDE = 0,     // 收起
        OPEN = 1,     // 展开
        NOTEXIST = -1,// 尚未进行设置
        hideOpen = {};

    function getHideOpen() {
        // 请求展开收起状态
        fbs.index.getHideOpen({
            typeset: [ACCTSET, COUPON, MARKET],
            onSuccess: function(json) {
                var data = json.data;

                setResult(ACCTSET, data[ACCTSET]);
                setResult(COUPON, data[COUPON]);
                setResult(MARKET, data[MARKET]);

                renderHideOpen();
            },
            onFail: function() {
                //p('失败');      
            }
        });

        //nirvana.index.newTip.show();
    }
    function setHideOpen(type, value) {
        fbs.index.setHideOpen({
            type: type,
            value: value,
            onSuccess: function() {
                setHideOpenDOM(type, value);
            }
        });
    }
    function setResult(key, value) {
        key = parseInt(key, 10);
        // 1.优惠券首次访问默认展开，其他模块默认收起
        // 2.当显示的模块中无优惠券、市场风向标模时，账户设置模块首次默认展开；
        //   其他情况下，各模块首次访问默认收起；
        if (value == NOTEXIST) {
            value = key === COUPON ? OPEN : HIDE;
            if (!exist_coupon && !exist_market) {
                hideOpen[ACCTSET] = OPEN;
            } else {
                hideOpen[key] = value;
            }
        } else {
            hideOpen[key] = value;
        }
    }
    function renderHideOpen() {
        for (var key in hideOpen) {
            setHideOpenDOM(key, hideOpen[key]);
        }
    }
    function setHideOpenDOM(key, value) {
        var el = value2Node(key);
        
        if (value == OPEN) {
            open(el);
        } else {
            close(el);
        }
    }
    /**
     * value映射到节点
     */
    function value2Node(value) {
        var ret;
        switch(parseInt(value, 10)) {
            case 61:
                ret = accountSetting;
                break;
            case 62:
                ret = coupon;
                break;
            case 63:
                ret = marketTrend;
                break;
        }
        return ret;
    }
    /**
     * 从节点映射到value
     */
    function node2Value(node) {
        if (node === accountSetting) {
            return ACCTSET;
        } else if (node === coupon) {
            return COUPON;
        } else if (node === marketTrend) {
            return MARKET;
        }
    }
    /**
     * @param el 模块对应的节点
     * @param isClick 是否是点击按钮触发的，默认不是
     */
    function open(el, isClick) {
        if (isClick) {
            setHideOpen(node2Value(el), OPEN);
        } else {
            baidu.removeClass(el, 'module_close');
            baidu.addClass(el, 'module_open');
        }
    }
    function close(el, isClick) {
        if (isClick) {
            setHideOpen(node2Value(el), HIDE);
        } else {
            baidu.removeClass(el, 'module_open');
            baidu.addClass(el, 'module_close');
        }
    }

    // ====================== 财务信息 ============================
    // 账户状态 1:开户金未到, 2:正常生效, 3:余额为零, 4:未通过审核, 6:审核中, 7:被禁用, 11:预算不足
    var accountStateMap = {
        1: 'other',
        2: 'ok',
        3: 'error',
        4: 'error',
        6: 'other',
        7: 'other',
        11: 'other'
    };
    // 填充数据的节点
    var nodes_financeInfo;
    /**
     * @param {Object} data
     * data: {listData [object]}
     * userstat : // 账户状态
     * balance : 3223.11 // 余额
     * daysconsumable : 8 // 剩余可消费天数
     * todaypaysum : 23.22 //本日消费
     */
    function renderAccountInfo(json) {
        var status = json.status,
            data = json.data.listData[0];
        /**
        if (status == 500 || status == 600) {
            // 系统出现异常
            $$('#AccountInfo .cont_area')[0].innerHTML = FILL_HTML.EXCEPTION;
            return false;
        }
        */
        // 获取用户名
        var userName = nirvana.env.USER_NAME;

        // 获取用户状态
        var state = data.userstat,
            className = accountStateMap[state] || 'other';

        // ========== 处理信息 ============
        var userNameNode = $$('#accountInfo h3')[0],
            userStateNode = $$('#accountInfo .box_icon')[0];
        userNameNode.innerHTML = userName;
        
        var title = baidu.g("BreadNavigation");
        title.setAttribute('rel', STATE_LIST.ACCOUNT[state]);
        ui.Title.init([title]);

        baidu.addClass(userStateNode, className);
        
        // 填充数据
        var nodes = nodes_financeInfo;
        nodes[0].innerHTML = data.balance;
        //nodes[1].innerHTML = (data.daysconsumable < 0) ? '-' : data.daysconsumable;

        renderAccountSetting(data);
    }

    function payment() {
        window.open(CLASSICS_PAY_URL);
    }

    // ==================== 加V ================================
    var addVNode, isVIP, data_v;

    function renderV() {
        if (isVIP) {
            baidu.addClass(addVNode, 'vip');
        }
        addVNode.setAttribute('bubblesource', 'addV');
        baidu.addClass(addVNode, 'ui_bubble');
        ui.Bubble.init([addVNode]);
        baidu.show(addVNode);
    }
    
    // ==================== 账户质量评分 ========================
    // Deleted by Wu Huiyao
    /*var accountScore, nodes_accountScore, reqParams = {};

    function renderAccountScore(json) {
        var scoreRes = json.data.scoreRes, score;
        if (scoreRes) {
            for (var key in scoreRes) {
                score = scoreRes[key];
            }
            nodes_accountScore[0].innerHTML = score;
        }
        
    }*/
    /**
     * 打开详情
     */
    /*function openAccountScore() {
        fbs.index.accountDetail({
            startdate: reqParams.startdate,
            enddate: reqParams.enddate,

            callback: function(json) {

                nirvana.util.openSubActionDialog({
                    id : 'accountRegionDialog',
                    title : '账户质量评分',
                    width : 960,
                    actionPath : 'overview/accountScore',
                    params : {data: json.data}
                });

            }
        });
        
    }*/


    // ==================== 账户设置 ============================
    var accountSetting, nodes_accountSetting, budgetName, budgetUnit;
    
    // 地域映射表
    var regionMap = (function() {
        var regions = nirvana.config.region, ret = {};
        for (var i = 0, len = regions.length; i < len; i++) {
            var text = regions[i][0],
                id = regions[i][1];
            if (text) {
                ret[id] = text;
            }
        }
        return ret;
    })();

    function renderAccountSetting(data) {
        // 今日消费
        nodes_accountSetting[0].innerHTML = data.todaypaysum;
        nodes_accountSetting[1].innerHTML = data.todaypaysum;
        // 预算
        setBudgetText(data);
        // 地域
        var region = data.wregion,
            arr = baidu.trim(region) !== '' ? region.split(',') : [];
        setRegionText(arr);
    }
    /**
     * 修改预算
     */
    function modifyBudget() {
        manage.budget.logParam = {
            'entrancetype' : 0
        };
        manage.budget.openSubAction({ //此方法可查看budget.js
            type : 'useracct',
            planid : [],
            onok: function(data) {
                setBudgetText(data);
                er.controller.fireMain('reload', {});
            }
        });
    }
    /**
     * 修改推广地域
     */
    function modifyArea() {
        nirvana.util.openSubActionDialog({
            id : 'accountRegionDialog',
            title : '账户推广地域',
            width : 440,
            actionPath : 'manage/region',
            params : {
                type: 'account',
                wregion: 0,
                onok: function(selected) {
                    setRegionText(selected);
                    er.controller.fireMain('reload', {});
                }
            }
        });
    }
    function otherSetting() {
        // 这段是从manage.js拷过来的，因为我实在不知道提到哪去，只好copy一份，重构的时候请注意
        nirvana.util.openSubActionDialog({
            id: 'accountsetDialog',
            title: '账户其他设置',
            width: 440,
            actionPath: 'manage/acctBaseSet',
            params: {},
            onclose: function(){
                er.controller.fireMain('reload', {});
            }
        });
        // Dialog二次定位标识
        nirvana.subaction.isDone = true;
        clearTimeout(nirvana.subaction.resizeTimer);
        baidu.g('ctrldialogaccountsetDialog').style.top = baidu.page.getScrollTop() + 200 +'px';
    }
    function setBudgetText(data) {
        var text, value = data.newvalue;
        // 进入概况页的时候触发的
        if (data.bgttype == 1) {
            text = '日预算：';
            value = value || data.wbudget;
        } else if (data.bgttype == 2) {
            text = '周预算：';
            value = value || data.weekbudget;
        } else {
            text = '预算：';
            value = '不限定';
        }

        if (value !== '不限定') { 
            value = fixed(value);
            budgetUnit.innerHTML = '元';
        } else {
            budgetUnit.innerHTML = '';
        }

        budgetName.innerHTML = text;
        nodes_accountSetting[2].innerHTML = value;
    }
    function setRegionText(values) {
        var text = nirvana.manage.region.abbRegion(values, 'account').word;
        nodes_accountSetting[3].innerHTML = text;
    }
    
    // ==================== 优惠券 ==============================
    var coupon, nodes_coupon, task_coupon,
        // 优惠活动 和 优惠券是否需要轮显
        needAct, needCou;
    function renderCoupon(data) {
        // 重新设值，换成ul节点
        nodes_coupon[1] = nodes_coupon[1].children[0];
        nodes_coupon[2] = nodes_coupon[2].children[0];

        var activities = data.activity || [],
            coupons = data.coupon || [],
            actUl = nodes_coupon[1],
            couUl = nodes_coupon[2];

        nodes_coupon[0].innerHTML = activities.length + coupons.length;
        insertCouponData(actUl, activities);
        insertCouponData(couUl, coupons);

        // 是否需要轮显
        needAct = activities.length > 1;
        needCou = coupons.length > 1;

        if (needAct || needCou) {
            startCouponRask();
        }

    }
    // 往节点里插入数据
    function insertCouponData(ul, data) {
        var len = data.length;
        if (len > 0) {
            var html = '';
            for (var i = 0; i < len; i++) {
                html += '<li>' + getLink(data[i]) + '</li>';
            }
            ul.innerHTML = html;
        } else {
            // 隐藏
            ul.parentNode.parentNode.style.display = 'none';
        }
    }
    function startCouponRask() {
        var step = 4000;
        // 轮播
        task_coupon = setInterval(function() {
            if (needAct) {
                scrollCoupon(nodes_coupon[1]);
            }
            if (needCou) {
                scrollCoupon(nodes_coupon[2]);
            }
        }, step);
    }
    // 轮显效果
    function scrollCoupon(ul) {
        // 向上滚动
        var style = ul.style;
        baidu.fx.moveBy(ul, {x: 0, y: -18}, {onafterfinish: function() {
            // 把第一项扔到最后去
            if (!ul.children[0]) {
                disposeCoupon();
                return;
            }
            ul.appendChild(ul.children[0]);

            style.top = '0px';
            style.left = '0px';
        }});
    }
    
    /**
     * 根据后端返回的{href: xx, desc: xx} 构造出一个链接
     * @return {String}
     */
    function getLink(data) {
        if (!data) return '';

        var href = data.href, text = data.desc;
        return '<a href="' + href + '">' + text + '</a>';
    }

    function disposeCoupon() {
        clearInterval(task_coupon);
    }

    // ==================== 离线宝 ==============================
    var offline, nodes_offline;
    // 离线宝状态渲染
    function initPhoneIcon(status) {
        var icon = $$('#offline .icon')[0];
        icon.setAttribute('status', status);
        icon.id = "IndexLxbStatus";
        nirvana.manage.LXB.setStatus("IndexLxbStatus");
    }
    function renderOffline(json){
        nodes_offline[0].innerHTML = json.data.phone;
        nodes_offline[1].innerHTML = json.data.lxbtodaypaysum;
    }

    // ==================== 市场风向标 ==========================
    var marketTrend, nodes_marketTrend;

    /**
     * 是否为空值，与rd约定的判断方式
     */
    function isNull(value) {
        return value === undefined || value === null;
    }
    function renderMarketTrend(data) {
        
        // 昨日行业平均左侧展现份额
        var yAverageShare = data.yAverageShare,
            // 上周行业平均左侧展现份额
            lAverageShare = data.lAverageShare,
            // 昨日我的左侧展现份额
            yLeftShare = data.yLeftShare,
            // 上周我的左侧展现份额
            lLeftShare = data.lLeftShare;
        
        var nodes = nodes_marketTrend;
        
        // 设置箭头方向
        // 箭头节点为nodes[3]和nodes[4]
        if (!isNull(yAverageShare) && !isNull(lAverageShare)) {
            if (yAverageShare > lAverageShare) {
                baidu.addClass(nodes[3], 'up');
            } else if (yAverageShare < lAverageShare) {
                baidu.addClass(nodes[3], 'down');
            }
        }
        if (!isNull(yLeftShare) && !isNull(lLeftShare)) {
            if (yLeftShare > lLeftShare) {
                baidu.addClass(nodes[4], 'up');
                baidu.show($$('#marketTrend .content_close .up')[0]);
            } else if (yLeftShare < lLeftShare) {
                baidu.addClass(nodes[4], 'down');
                baidu.show($$('#marketTrend .content_close .down')[0]);
            }
        }

        // 获取填充数据的节点
        // 判断是否有值，无值加"-"，有值转百分数
        yAverageShare = !isNull(yAverageShare) ? floatToPercent(yAverageShare) : '-';
        lAverageShare = !isNull(lAverageShare) ? floatToPercent(lAverageShare) : '-';
        yLeftShare = !isNull(yLeftShare) ? floatToPercent(yLeftShare) : '-';
        lLeftShare = !isNull(lLeftShare) ? floatToPercent(lLeftShare) : '-';

        nodes[1].innerHTML = yAverageShare;
        nodes[3].innerHTML = lAverageShare;
        nodes[2].innerHTML = yLeftShare;
        nodes[4].innerHTML = lLeftShare;
        nodes[0].innerHTML = yLeftShare;

        baidu.show(marketTrend);
    }
    function formatHotObject(begin, end){
		var obj = {};
		if (nirvana.env.SERVER_TIME*1000 < begin){
			if (begin - nirvana.env.SERVER_TIME*1000 > 30*24*3600*1000) {
				obj.ishot = false;
			} else {
				obj.ishot = true;
				obj.timeleft = Math.ceil((begin - nirvana.env.SERVER_TIME*1000)/(24*3600*1000));
			}
		} else {
			if (nirvana.env.SERVER_TIME*1000 < end){
				obj.ishot = true;
				obj.timeleft = 0;
			} else {
				obj.ishot = false;
			}
		}
		return obj;
	}
	function getShortBusinessName(rawName){
	    var shortName = '';
	    if (rawName) {
		    if (rawName.indexOf('>') > 0){
	            var nameArray = rawName.split('>');
	            shortName = nameArray[nameArray.length - 1];
	        } else {
	            shortName = rawName;
	        }
	    }
        
        return shortName;
	}
	//市场风向标2.0的一些逻辑
	function renderMarketTrendNew(data) {
        data.hot = formatHotObject(data.hotBegin, data.hotEnd);
        
        var tpl = er.template.get('newMarketContent');
        $$('#marketTrend .content_open')[0].innerHTML = tpl;
        
        nodes_marketTrend = $$('#marketTrend .value');
        
        // 昨日行业平均左侧展现份额
        var yAverageShare = data.averageShow,
            // 上周行业平均左侧展现份额
            lAverageShare = data.averageShowLastWeek,
            // 昨日我的左侧展现份额
            yLeftShare = data.myShow,
            // 上周我的左侧展现份额
            lLeftShare = data.myShowLastWeek;
        
        var nodes = nodes_marketTrend;
        
        // 设置箭头方向
        // 箭头节点为nodes[3]和nodes[4]
        if (!isNull(yAverageShare) && !isNull(lAverageShare)) {
            if (yAverageShare > lAverageShare) {
                baidu.addClass(nodes[4], 'up');
            } else if (yAverageShare < lAverageShare) {
                baidu.addClass(nodes[4], 'down');
            }
        }
        if (!isNull(yLeftShare) && !isNull(lLeftShare)) {
            if (yLeftShare > lLeftShare) {
                baidu.addClass(nodes[3], 'up');
                baidu.show($$('#marketTrend .content_close .up')[0]);
            } else if (yLeftShare < lLeftShare) {
                baidu.addClass(nodes[3], 'down');
                baidu.show($$('#marketTrend .content_close .down')[0]);
            }
        }
		
        var businessPVStr = !isNull(data.ratio) 
            ? ( ((data.ratio >= 0) ? '+' : '-') + (Math.round(10000*Math.abs(data.ratio)))/100 + '%' ) 
            : '-';
        baidu.g('marketTrendPVCompare').innerHTML = businessPVStr;
        
        var businessNameStr = '<span title="' + getShortBusinessName(data.name) +'">' + getCutString(getShortBusinessName(data.name), 14, '..') + '</span>';
        var hotTipText = '';
        if (data.hot.ishot) {
            hotTipText = hotTipText + '<div><span class="business_hot_icon">旺</span>';
            if (data.hot.timeleft != undefined){
                if (data.hot.timeleft > 0){
                    hotTipText = hotTipText + data.hot.timeleft + '天';
                }
            }
            hotTipText = hotTipText + '</div>';
        }
		
		baidu.g('marketTrendBusinessName').innerHTML = businessNameStr + hotTipText;
		
        // 获取填充数据的节点
        // 判断是否有值，无值加"-"，有值转百分数
        yAverageShare = !isNull(yAverageShare) ? floatToPercent(yAverageShare) : '-';
        lAverageShare = !isNull(lAverageShare) ? floatToPercent(lAverageShare) : '-';
        yLeftShare = !isNull(yLeftShare) ? floatToPercent(yLeftShare) : '-';
        lLeftShare = !isNull(lLeftShare) ? floatToPercent(lLeftShare) : '-';

        nodes[1].innerHTML = yLeftShare;
        nodes[3].innerHTML = lLeftShare;
        nodes[2].innerHTML = yAverageShare;
        nodes[4].innerHTML = lAverageShare;
        nodes[0].innerHTML = yLeftShare;
        
        if (!$$('#marketTrend h4 img').length) {
            $$('#marketTrend h4')[0].appendChild(fc.create('<img src="asset/img/kr_rsn_1.gif">'));
        }
        
        baidu.show(marketTrend);
    }

    // 概况页的flash ID，可通过baidu.swf.getMovie(flashID)获得flash
    var flashId = 'OverviewFlash', flashReload = {};
    /**
     * 创建flash
     * @return {String}
     */
    function createFlash() {
        return baidu.swf.createHTML({
                    id: "OverviewFlash",
                    url: './asset/swf/overview.swf',
                    width: baidu.g('OverviewArea').offsetWidth - 3,
                    height: 350,
                    scale : 'showall',
                    wmode : 'Opaque',
                    allowscriptaccess : 'always'
                });
    }
    /**
     * 轮询flash，因为调用flash的时候，可能它还没初始化好
     */
    function pollFlash(method, args, callback) {
        var swf = baidu.swf.getMovie(flashId);
        if (!swf) {
            return;
        }

        var fn = swf[method];

        if (typeof fn === 'function') {
            // 表示准备就绪，可以调用了
            var ret = fn.apply(swf, args || []);
            if (typeof callback === 'function') {
                callback(ret);
            }
        } else {
            // 递归吧少年。。。
            setTimeout(function() {
                pollFlash(method, args, callback);
            }, 500);
        }
    }
    // Deleted by Wu Huiyao 该方法在fc.js已提供
    /*function p(s) {
        console.log(s);         
    }*/
    return {
        _sidebar: {
            init: function() {

                //nirvana.index.newTip.init();
                
                addVNode = baidu.g('addVIcon');
                accountSetting = baidu.g('accountSetting');
                //accountScore = baidu.g('accountScore');
                // 预算相关
                var labels = $$('#accountSetting label');
                budgetName = labels[2];
                budgetUnit = labels[3];

                coupon = baidu.g('coupon');
                offline = baidu.g('offline');
                marketTrend = baidu.g('marketTrend');

                nodes_financeInfo = $$('#financeInfo .value');
                //nodes_accountScore = $$('#accountScore .value');
                nodes_accountSetting = $$('#accountSetting .value');
                nodes_coupon = $$('#coupon .value');
                nodes_offline = $$('#offline .value');
                nodes_marketTrend = $$('#marketTrend .value');

                var sidebar = baidu.q('side')[0];
                lib.delegate.init(sidebar, handlerMap);

                var index = nirvana.index;
                index._accountInfo.init();
                index._vState.init();

                baidu.show(accountSetting);
				// 老户优化转全
				// 保留对照组，没有账户质量评分功能
                // if (nirvana.env.EXP != '7450') {
                	// Modified by Wu Huiyao
					// index._accountScore.init();
                	nirvana.AccountScore.getInstance().init();
					index._coupon.init();
				// }
                
                index._offline.init();
                /**
                 * 加v惩罚部分，以后要删掉，最多半年 by wsy
                 */
                index._vpunish.init();
                index._marketTrend.init();
            }
        },
        _vState: {
            init: function() {
                var el = baidu.q('vip')[0];

                fbs.index.vState({
                    onSuccess: function(json) {
                        if (json.status != 200) {
                            return;
                        }
                        
                        var data = json.data;

                        isVIP = data.vstat === 'v';
                        // 解决用户加V变灰的Bug，这个请求是会缓存的数据，因此不应该对返回的数据进行修改, Modified by Wu Huiyao
                        // delete data.vstat;
                        data_v = data;

                        renderV();
                    },
                    onFail: function() {
                        //p(111);       
                    }
                });      
            },
            getLayerContent: function() {
                var html = '<div class="v_layer">',
                    msg = data_v.msgs,
                    link = data_v.links;

                for (var i = 0, len = msg.length; i < len; i++) {
                    html += '<div class="v_item">';

                    html += '<span class="v_title">' + msg[i].title + '：</span>';
                    html += '<span class="v_content">' + msg[i].msg + '</span>';

                    if (msg[i].link != '') {// 为空的时候不显示链接
                        html += '<div class="v_detail"><a href="' + msg[i].link + '">查看详情</a></div>';
                    }
                    
                    html += '</div>';
                }

                i = 0;
                len = link.length;
                for (; i < len; i++) {
                    html += '<div class="v_link"><a href="' + link[i].link + '">' + link[i].title + '</a></div>';
                }
                
                return html; 
            }
        },
        _accountInfo: {
            init: function() {
                // 是否隐藏充值按钮
                if (nirvana.env.REPORT_LEVEL == 201) {
                    var payment = ui.util.get('payment');
                    baidu.hide(payment.main);
                }

                fbs.account.getIndexData({
                    callback : renderAccountInfo
                });

                // 单独拿出daysconsumable，这个物料要去vega中拿  预计可消费天数
                fbs.vega.getMaterial({
                    fields : ['daysconsumable'],
                    callback : function(json) {
                        var data = json.data;
                        if (data) {
                            nodes_financeInfo[1].innerHTML = 
                                (data.daysconsumable < 0) ? '-' : data.daysconsumable;
                        }
                    }
                })
            }
        },
        // Deleted by Wu Huiyao
        /*_accountScore: {
            init: function() {
                var yesterday = new Date(), 
                    day = yesterday.getDate();
                yesterday.setDate(--day);

                // 使用昨天的日期
                var date = baidu.date.format(yesterday, 'yyyy-MM-dd');

                reqParams.startdate = date;
                reqParams.enddate = date;

                fbs.index.accountScore({
                    startdate: date,
                    enddate: date,
                    callback: function(json) {
                        if (!json.data || json.data.resNum == 0) {
                            return;
                        }
                        baidu.show(accountScore);
                        renderAccountScore(json);
                    }
                });

                
                
            }
        },*/
        _coupon: {
            init: function() {
                fbs.index.coupon({
                    onSuccess: function(json) {
                        // 判断模块是否存在
                        var data = json.data;
                        if (data && (data.activity.length || data.coupon.length)) {
                            baidu.show(coupon);
                            exist_coupon = true;
                            renderCoupon(data);
                        }
                    },
                    onFail: function() {
                    }
                });
            }            
        },
        _offline: {
            init: function() {
                fbs.trans.getLxbStatus({
                    onSuccess : function(json) {
                        var data = json.data;
                        if (data == 1 || data == 8) {
                            fbs.trans.getLxbBaseInfo({
                                onSuccess : function(json) {
                                    initPhoneIcon(data);
                                    
                                    baidu.show(offline);
                                    renderOffline(json);
                                }
                            });
                        } 
                    }
                });
            }
        },
        /**
         * 加v惩罚部分，以后要删掉，最多半年 by wsy
         */
        _vpunish: (function(){
            var authInfo = null;
            return {
                getAuthInfo: function() {
                    return this.authInfo;
                } ,
                setAuthInfo: function(authInfo) {
                    this.authInfo = authInfo;
                },
                renderVpunish: function(renderData) {
                    var nodesVpunish = $$('#vpunish .value');
                    if(nodesVpunish){
                        nodesVpunish[0].innerHTML = renderData.percent+"%";
                        nodesVpunish[1].innerHTML = renderData.todayCost+"元";
                        nodesVpunish[2].innerHTML = renderData.totalCost+"元";
                        baidu.show("vpunish");
                    }
                },
                request: function(callback) {
                    fbs.vpunish.getVpunishStatus({
                        onSuccess : function(res){
                            var data = res.data
                            if(data){
                                nirvana.index._vpunish.setAuthInfo(data);
                            }
                            callback && callback(data);
                        },
                        onFail: function() {
                            callback && callback();
                        },
                        onTimeout: function() {
                            callback && callback();
                        }
                    });
                },
                process: function(data){
                   // var data = json.data;
                    if(data && data.hasAuth){
                       // nirvana.index._vpunish.setAuthInfo(data);
                        nirvana.index._vpunish.renderVpunish(data);
                    }
                },
                init: function() {
                    var tempAuthInfo = this.getAuthInfo()
                    if(!tempAuthInfo){
                        this.request(this.process);
                    }
                    else{
                        if(tempAuthInfo.hasAuth){
                            nirvana.index._vpunish.renderVpunish(tempAuthInfo);
                        }
                    }
                    var link = baidu.g('nov-push-link');
                    if(link){
                        var href = baidu.dom.getAttr(link, 'href') || '';
                        if(href && href.indexOf('?') == -1) {
                            href += '?userid=' + nirvana.env.USER_ID;
                        }
                        baidu.dom.setAttr(link, 'href', href);
                    }
                }
            };
        })(),
        _marketTrend: {
            init: function() {
                var me = this;
                if (nirvana.env.MKTINSIGHT) {
            		fbs.mktinsight.getIndexData({
            			onSuccess: function(response){
            				if (response.data) {
            					renderMarketTrendNew(response.data);
            				}
                			getHideOpen();
                		},
            			onFail: function(){
                			getHideOpen();
                		}
            		});
                } else {
	                fbs.marketTrend.getIndexData({
	                    onSuccess: function(json) {
	                        var errorCode = json.errorCode,
	                            data = json.data;
	
	                        //nirvana.index.newTip.market_exist = false;
	                        if (errorCode && (errorCode = errorCode.code)) {
	                            if (errorCode == 10001) {
	                                // 没有行业数据需要隐藏市场风向标模块
	                                getHideOpen();
	                                return;
	                            }
	                        }
	                        if (data) {
	                            //nirvana.index.newTip.market_exist = exist_market = true;
		                        renderMarketTrend(data);
	                        }
	
	                        getHideOpen();
	                    },
	                    onFail: function() {
	                        //nirvana.index.newTip.market_exist = false;
	                        getHideOpen();
	                    }
	                });
                }
                
            }
        },
/**
        newTip: {
            init: function() {
                this.old_exist = null;
                this.market_exist = null;
            },
            show: function() {
                if (typeof this.old_exist === 'boolean' 
                    && typeof this.market_exist === 'boolean') {
                    var oldAccountExist = this.old_exist,
                        marketTrendExist = this.market_exist;

                    if (!oldAccountExist && !marketTrendExist) return;

                    // 新功能提示
                    ui.Bubble.source.overview = {
                        type : 'tail',
                        iconClass : 'ui_bubble_icon_none',
                        positionList : [5,7,3,4,8,2,1,6],
                        showTimeConfig : 'showonce',        //显示控制
                        needBlurTrigger : true, 
                        showByClick : false,
                        showByOver : false,             //鼠标悬浮延时显示
                        hideByOut: true,
                        hideByOutInterval: 1000 * 60,
                        autoShow : true,
                        autoShowDelay : 0,
                        title: '推广概况新功能',
                        content: function() {
                            if (oldAccountExist && !marketTrendExist) {
                                return '账户优化，帮助您简单高效管理账户';
                            } else if (marketTrendExist && !oldAccountExist) {
                                return '您还在困惑无从了解行业信息，用户行为吗？快来点击市场风向标，带您解析现状、挖掘更多潜在机会';
                            } else {
                                return '账户优化，帮助您简单高效管理账户；市场风向标，带您解析行业现状、挖掘更多潜在机会';
                            }
                        }
                    };
                    var elem = $$('#new_fun_tip')[0];
                    elem.setAttribute('bubblesource', 'overview');
                    baidu.addClass(elem, 'ui_bubble');
                    ui.Bubble.init([elem])
                }
            }
        },
*/
        _rank: {
            // 表头字段数组
            fields : [],
            
            // 表格填充数据
            datasource : [],
            
            // 排行榜原始数据
            oridata : [],
            
            // 层级字段
            levelFields: {
                // 计划层级
                planinfo: [{
                    content: 'planname',
                    title: '推广计划',
                    width:235,
                    minWidth: 235
                }, {
                    content: 'planstat',
                    title: '状态',
                    width: 100
                }],
                // 单元层级
                unitinfo: [{
                    content: 'unitname',
                    title: '推广单元',
                    width:235,
                    minWidth: 235
                }, {
                    content: 'unitstat',
                    title: '状态',
                    width: 100
                }],
                // 关键词层级
                wordinfo: [{
                    content: 'showword',
                    title: '关键词',
                    width:235,
                    minWidth: 235
                }, {
                    content: 'wordstat',
                    title: '状态',
                    width: 100
                }]
            },
            // 排行指标字段
            orderFields : [
                {
                    content: 'shows',
                    title: '展现',
                    align: 'right',
                    field: 'shows',
                    width: 70
                }, {
                    content: 'clks',
                    title: '点击',
                    align: 'right',
                    field: 'clks',
                    width: 70
                }, {
                    content: 'paysum',
                    title: '消费',
                    align: 'right',
                    field: 'paysum',
                    width: 80
                }, {
                    content: 'trans',
                    title: '转化(网页)',
                    align: 'right',
                    field: 'trans',
                    width: 70
                }, { 
                    content: 'phonetrans',
                    title: '转化(电话)',
                    align: 'right',
                    field: 'phonetrans',
                    width: 70
                },{
                    content: 'clkrate',
                    title: '点击率',
                    align: 'right',
                    field: 'clkrate',
                    width: 70
                }, {
                    content: 'avgprice',
                    title: '平均点击价格',
                    align: 'right',
                    field: 'avgprice',
                    width: 95
                }
            ],

            /**
             * 控制参数选择是否能选
             * @param {boolean} param 表示 disabled = param
             */
            paramDisable : function(param) {
                if (ui.util.get('rankSelect1')) {
                    ui.util.get('rankSelect1').disable(param);
                }
                if (ui.util.get('rankSelect2')) {
                    ui.util.get('rankSelect2').disable(param);
                }
                if (ui.util.get('rankTimeSelect')) {
                    ui.util.get('rankTimeSelect').disable(param);
                }
            },
            
            /**
             * 请求前的准备工作
             */
            loading : function() {
                //禁用下拉框，避免多次请求
                this.paramDisable(true);
            },
            
            /**
             * 发送请求
             * @param {object} param 请求参数
             */
            request : function(param) {
                this.loading();
                fbs.material.getTopData(param);
            },
            
            /**
             * 渲染函数，主要是拼装表格数据，渲染部分在UI初始化部分执行
             * @param {Object} response
             * @param {Object} level
             */
            render: function(response, level){
                var datas = response.data.listData,
                    data = {},
                    datasource = [],
                    tmp,
                    me = this;
                
                //恢复下拉框状态
                me.paramDisable(false);
                
                for (var i = 0, j = datas.length; i < j; i++) {
                    data = datas[i];
                    tmp = {};
                    
                    for (var k in data) {
                        // 这里需要赋值给临时变量，否则会改变原始数据
                        tmp[k] = data[k];
                        
                        switch (k) {
                            // 计划状态
                            case 'planstat':
                                tmp[k] = nirvana.index._rank.buildStat(STATE_LIST.PLAN[data[k]]);
                                break;
                            // 单元状态
                            case 'unitstat':
                                tmp[k] = nirvana.index._rank.buildStat(STATE_LIST.UNIT[data[k]]);
                                break;
                            // 关键词状态
                            case 'wordstat':
                                tmp[k] = nirvana.index._rank.buildStat(STATE_LIST.WORD[data[k]]);
                                break;
                            
                            // 计划名称
                            case 'planname':
                                if (data.planstat == -1) { // 计划已删除
                                    tmp[k] = '<span href="javascript:void(0)">' + getCutString(baidu.encodeHTML(data[k] + '[已删除]'), 32, '...') + '</span>';
                                } else {
                                    tmp[k] = '<a href="javascript:void(0)" data-log="{target:\'rankPlan_lbl\'}" level="account" name="' + baidu.encodeHTML(data[k]) + '">' + getCutString(baidu.encodeHTML(data[k]), 32, '...') + '</a>';
                                }
                                break;
                            // 单元名称
                            case 'unitname':
                                if (data.planstat == -1 || data.unitstat == -1) { // 计划或单元已删除，则没有跳转功能
                                    tmp[k] = '<span class="ui_bubble" bubblesource="rankTable" href="javascript:void(0)" index="' + i + '">' + getCutString(baidu.encodeHTML(data[k] + (data.unitstat == -1 ? '[已删除]' : '')), 32, '...') + '</span>';
                                }  else {
                                    tmp[k] = '<a class="ui_bubble" data-log="{target:\'rankUnit_lbl\'}" bubblesource="rankTable" href="javascript:void(0)" index="' + i + '" level="plan" planid="' + data.planid + '" name="' + baidu.encodeHTML(data[k]) + '">' + getCutString(baidu.encodeHTML(data[k]), 32, '...') + '</a>';
                                }
                                break;
                            // 关键词名称
                            case 'showword':
                                if(data.planstat == -1 || data.unitstat == -1 || data.wordstat == -1) { // 计划单元或关键词已删除，则没有跳转功能
                                    tmp[k] = '<span class="ui_bubble" bubblesource="rankTable" href="javascript:void(0)" index="' + i + '">' + getCutString(baidu.encodeHTML(data[k] + (data.wordstat == -1 ? '[已删除]' : '')), 32, '...') + '</span>';
                                } else {
                                    tmp[k] = '<a class="ui_bubble" data-log="{target:\'rankKeyword_lbl\'}" bubblesource="rankTable" href="javascript:void(0)" index="' + i + '" level="unit" unitid="' + data.unitid + '" name="' + baidu.encodeHTML(data[k]) + '">' + getCutString(baidu.encodeHTML(data[k]), 32, '...') + '</a>';
                                }
                                break;
                            
                            // 消费、价格转化为￥
                            case 'paysum':
                            case 'avgprice':
                                tmp[k] = money(data[k]);//+ '&nbsp;&nbsp;';
                                break;
                            // 点击率转化为%
                            case 'clkrate':
                                tmp[k] = floatToPercent(data[k]);
                                break;
                            
                            default:
                                break;
                        }
                    }
                    datasource[i] = tmp;
                }
                
                // 根据当前层级，组装表格字段，层级字段+排序字段
                me.fields = me.levelFields[level].concat(me.orderFields);
                
                // 保存原始数据
                me.oridata = datas;
                
                // 保存组装后的数据
                me.datasource = datasource;
            },

            exception: function(response){
                var status = response.status,
                    tableBody = ui.util.get('rankTable').getBody();
                
                //恢复下拉框状态
                nirvana.index._rank.paramDisable(false);
                
                if (status == 500 || status == 600) { // 系统出现异常
                    tableBody.innerHTML = FILL_HTML.EXCEPTION;
                    baidu.addClass(tableBody, 'heightLimit');
                    return false;
                }
            },
            
            /**
             * 构造状态HTML
             * @param {Object} d 状态文字
             */
            buildStat : function(d) {
                var str = '',
                    className = '';
                
                if (!d) { //没有找到状态
                    return false;
                }
                
                if (d == '有效') {
                    className = 'stat_ok';
                } else if (d.indexOf('暂停') != -1) {
                    className = 'stat_pause';
                } else {
                    className = 'stat_other';
                }
                
                str = '<span class="' + className + '">' + d + '</span>';
                
                return str;
            },
            
            /**
             * 排行榜表格事件
             * @param {Object} e
             */
            clickHandler : function(e) {
                var e = e || window.event,
                    target = e.target || e.srcElement,
                    level = target.getAttribute('level');
                
                // 有可能弹出bubble，所以强制隐藏
                ui.Bubble.hide();
                
                switch(level) {
                    // 计划跳转 到账户层级
                    case 'account' :
                        er.locator.redirect('/manage/plan~ignoreState=true&navLevel=account&status=100&query=' + encodeParam(target.getAttribute('name')) + '&queryType=accurate');
                        break;
                    
                    // 单元跳转 到计划层级
                    case 'plan' :
                        er.locator.redirect('/manage/unit~ignoreState=true&navLevel=plan&planid=' + target.getAttribute('planid') + '&status=100&query=' + encodeParam(target.getAttribute('name')) + '&queryType=accurate');
                        break;
                    
                    // 关键词跳转 到单元层级
                    case 'unit' :
                        er.locator.redirect('/manage/keyword~ignoreState=true&navLevel=unit&unitid=' + target.getAttribute('unitid') + '&status=100&query=' + encodeParam(target.getAttribute('name')) + '&queryType=accurate');
                        break;
                }
                
                /**
                 * 对于跳转的参数encode
                 * @param {Object} str
                 */
                function encodeParam(str) {
                    if (baidu.browser.firefox) {
                        return nirvana.util.firefoxSpecialURLChars.encode(str);
                    } else {
                        return encodeURIComponent(str);
                    }
                }
            },
            /**
             * 改变rankselect1时rankselect2的处理 //关键词层级没有转化（电话） 表格也没有转化（电话）列
             */
            rankSelectChangeHandle : function(action,level){
                var tempRankSelectData,
                    rankSelect2 = ui.util.get('rankSelect2'),
                    rankTable = action._controlMap.rankTable;
                
                if('wordinfo' == level){
                    tempRankSelectData = baidu.object.clone(action.getContext('rankSelectData2'));
                    baidu.array.remove(tempRankSelectData,function(item){
                        return item.text == '转化(电话)';
                        });
                    if(rankSelect2.value == 'phonetrans'){
                        rankSelect2.value = 'paysum';
                        action.setContext('rankOrder','paysum');
                    }
                }else{
                    tempRankSelectData = baidu.object.clone(action.getContext('rankSelectData2'));
                }
                rankSelect2.options = tempRankSelectData;
                rankSelect2.render();
                
                //修改表格列
                if('wordinfo' == level){
                    baidu.array.remove(nirvana.index._rank.orderFields,function(item){
                        return item.field == 'phonetrans';
                    });
                }else{
                    nirvana.index._rank.orderFields.length = 4;
                    nirvana.index._rank.orderFields[4] ={
                        content: 'phonetrans',
                        title: '转化(电话)',
                        align: 'right',
                        field: 'phonetrans',
                        width: 70
                    };
                    nirvana.index._rank.orderFields[5] ={
                        content: 'clkrate',
                        title: '点击率',
                        align: 'right',
                        field: 'clkrate',
                        width: 70
                    };
                    nirvana.index._rank.orderFields[6] ={
                        content: 'avgprice',
                        title: '平均点击价格',
                        align: 'right',
                        field: 'avgprice',
                        width: 95
                    };
                }
                
            }   
        },

        _folder : {
            _fields : [
                        {
                            content: function(item){
                                var title = baidu.encodeHTML(item.showword),
                                    content = getCutString(item.showword,30,".."),
                                    wmatch = item.wmatch,
                                    wctrl = item.wctrl,
                                    wctrl_auth = nirvana.env.AUTH['gaoduan'];
                                
                                if (wctrl_auth) {
                                    title = nirvana.util.buildShowword(title, wmatch, wctrl);
                                    content = nirvana.util.buildShowword(content, wmatch, wctrl);   
                                }
                                return '<span title="' + title + '">' + content + '</span>';
                            },
                            field : 'showword',
                            title: '关键词',
                            width: 130
                        },
                        {
                            content: function(item){
                                var title = baidu.encodeHTML(item.unitname),
                                    content = getCutString(item.unitname,30,"..");
                            
                                return '<a title="' + title + '" href="#/manage/keyword~ignoreState=1&navLevel=unit&unitid=' + item.unitid + '" data-log="{target:\'unitOfIndexFold_lbl\'}">' + content + '</a>';
                            },
                            title: '推广单元',
                            field : 'unitname',
                            width: 120
                        },
                        {
                            content: function(item){
                                var title = baidu.encodeHTML(item.planname),
                                    content = getCutString(item.planname,30,"..");
                        
                                return '<a title="' + title + '" href="#/manage/unit~ignoreState=1&navLevel=plan&planid=' + item.planid + '" data-log="{target:\'planOfIndexFold_lbl\'}">' + content + '</a>';
                            },
                            title: '推广计划',
                            field : 'planname',
                            width: 120
                        },
                        {
                            content: function (item) {
                                return nirvana.index._rank.buildStat(STATE_LIST.WORD[item.wordstat]);
                            },
                            title: '状态',
                            field : 'wordstat',
                            stable : true,
                            width: 60
                        }, 
                        {
                            content: function(item){
                                var html = "";
                                if(item.bid){
                                    html = "<span class='word_bid'>" + baidu.number.fixed(item["bid"]) + "</span>";
                                }else{
                                    html = "<span title='使用单元出价'>" + baidu.number.fixed(item["unitbid"]) + "</span>";
                                }
                                return html;
                            },
                            field : 'bid',
                            title: '出价',
                            align:'right',
                            stable : true,
                            width: 50
                        },
                        {
                            content: function(item){
                                var html = "";
                                html = '<span>' + MTYPE[item["wmatch"]] + '</span>';
                                return html;
                            },
                            field : 'wmatch',
                            title: '匹配模式',
                            stable : true,
                            width: 60
                        },
                    (function() {
                        var qStarField = qStar.getTableField({VIEW: 'overviewMonitorDetail'}, {stable: true});
                        
                        return qStarField;
                    })()
					,
                        {
                            content: 'shows',
                            field : 'shows',
                            title: '展现',
                            align:'right',
                            stable : true,
                            width: 50
                        },
                        {
                            content: 'clks',
                            field : 'clks',
                            title: '点击',
                            align:'right',
                            stable : true,
                            width: 50
                        },
                        {
                            content: function(item){
                                return "<div style='padding-right:12px'>" + item.paysum + "</div>";
                            },
                            title: function(){
                                var title = '';
                                for (var i = 0; i < 4; i++) {
                                    title += '&nbsp;';
                                }
                                return '消费' + title;
                            },
                            field : 'paysum',
                            align:'right',
                            stable : true,
                            width: 60
                        }],
            
            requestFields: ["showword", "unitname", "planname", "wordstat", "bid", "wmatch", "showqstat", 
                // "ideaquality", "pageexp", 
                "clks", "paysum", "shows", "winfoid", "unitid", "planid", "unitbid", "wordid", 'wctrl'],
            
            pageSize: 50,
            
            init: function(me,folderid){
                var This = this,
					folderTableOption = {};
                if (folderid == 0) {
                    folderTableOption.addfolder = true;
                    folderTableOption.datasource = [];
                    me.setContext("folderTableOption",folderTableOption);
					This.render(me);
                } else {
                    var timeValue = +me.getContext('rankTypeid'),
                        timeRange = nirvana.util.dateOptionToDateValue(timeValue),
                        starttime = baidu.date.format(timeRange.begin,'yyyy-MM-dd'),
                        endtime = baidu.date.format(timeRange.end,'yyyy-MM-dd');
                    fbs.avatar.getMoniWords({
                        starttime: starttime,
                        endtime: endtime,
                        folderid: [folderid],
                        fields: nirvana.index._folder.requestFields,
                        onSuccess: function(data){
                            var dat = data.data.listData || [],
                                totalPage = Math.ceil(dat.length / nirvana.index._folder.pageSize),
                                rs = [];//baidu.object.clone(dat);  //优化by linzhifeng 
                            
                            me.setContext("FolderData",dat);
                            //rs = rs.splice(0, nirvana.index._folder.pageSize);
                            for (var i = 0, len = dat.length; i < len; i++){
                                rs.push(dat[i]);
                            }
                            
                            folderTableOption.datasource = rs;
                        //  folderTable.scrollYFixed = true;
                            if(totalPage > 1){
                                me.setContext("pageNo",1);
                                me.setContext("totalPage",totalPage);
								baidu.addClass(baidu.g("Folders"), "fold_page");
                            }else{
                                me.setContext("totalPage",0);
								baidu.removeClass(baidu.g("Folders"), "fold_page");
                            }
							me.repaint();
                            me.setContext("folderTableOption",folderTableOption);
							This.render(me);
                        },
                        onFail: function(response){
                            folderTableOption.exception = true;
                            folderTableOption.response = response;
                            folderTableOption.datasource = [];
                            me.setContext("folderTableOption",folderTableOption);
							This.render(me);
                        }
                    });
                }
            },
            
            render:function(me){
                var folderTable = ui.util.get("foldTable"),
					tableOption = me.getContext("folderTableOption"), 
					datasource = tableOption.datasource, 
					foldLen = datasource.length;
				
				if (foldLen > 9 || foldLen <= 0) {
					baidu.addClass(baidu.g("Folders"), "fold_scroll");
				}
				else {
					baidu.removeClass(baidu.g("Folders"), "fold_scroll");
				}
                
                folderTable.fields = nirvana.index._folder._fields;
				folderTable.datasource = datasource;
                folderTable.skin = "folderTable";
                folderTable.render();
                if(tableOption.exception){
                    nirvana.index._folder.exception(tableOption.response);
				}
				else 
					if (tableOption.addfolder) {
                    folderTable.getBody().innerHTML = '<div  class="add_index_folder"><span id="addFolder" data-log="{target:\'addIndexFolder_btn\'}">+新添一个推广概况页监控文件夹</span></div>';
                    baidu.g("addFolder").onclick = nirvana.index._folder.addFolder();
                }
            },
            
            pageChangeHandler: function(me){
                return function(page){
                    var data = me.getContext("FolderData"),
                        pagesize = nirvana.index._folder.pageSize,
                        start = pagesize * (page-1),
                        rs = baidu.object.clone(data),
                        folderTable = ui.util.get("foldTable");
                	//不要删掉了哦，为repaint监听context变化
                    me.setContext("pageNo",page);
                    rs = rs.splice(start, pagesize);
                    
                    folderTable.datasource = rs;
                    folderTable.render();
                }
            },
            
            
            /**
             * 新增首页监控文件夹
             */
            addFolder: function(){
                var me = this;
                return function(){
                    var indexFolders = nirvana.index._folder.indexFolders,len = indexFolders.length;
                    fbs.avatar.getMoniFolderCount({
                        folderType : 0,
                        onSuccess: function(data){
                            if (data.data.currentCount > 0) {
                                nirvana.util.openSubActionDialog({
                                    id: 'addIndexFolderDialog',
                                    title: '新添首页显示',
                                    width: 928,
                                    actionPath: '/overview/addIndexFolder',
                                    params: {
                                        folderList: indexFolders,
                                        folderCount: data.data.currentCount
                                    },
                                    onclose: function(){
                                    
                                    }
                                });
                            }
                            else {
                                nirvana.util.openSubActionDialog({
                                    id: 'addIndexFolderDialog',
                                    title: '新添首页显示',
                                    width: 928,
                                    actionPath: '/overview/addFolder',
                                    params: {
                                        folderList: indexFolders,
                                        folderCount: 0
                                    },
                                    onclose: function(){
                                    
                                    }
                                });
                            }
                        },
                        onFail:function(data){
                            ajaxFailDialog();
                        }
                    });
                }
                
            },
            
            /**
             * 关闭一个首页监控文件夹
             * @param {Object} tabIndex
             */
            closeFolder: function(me){
                return function(tabIndex){
                    fbs.avatar.modFstat({
                        fstat: 0,
                        folderids: [me.getContext("folderids")[tabIndex-1]],
                        onSuccess: function(data){
                            fbs.avatar.getMoniFolderCount.clearCache();
                            fbs.avatar.getMoniFolders.clearCache();
                            me.refresh();
                        },
                        onFail: function(data){
                            ajaxFail(0);
                        }
                    });
                }
            },
            
            exception: function(response){
                var status = response.status;
                
                if (status == 500 || status == 600) { // 系统出现异常
                    ui.util.get('foldTable').getBody().innerHTML = FILL_HTML.EXCEPTION;
                    return false;
                }
            }
        },
        
        /**
         * flash对外暴露的6个接口：
         * 1. setData()
         * 2. setIndicator()
         * 3. showAverage()
         * 4. showLoading()
         * 5. showMessage()
         * 6. showHistory()
         *
         * 如果在火狐出现flash消失问题
         * 调用reload()
         */
        _flash: {
            // 主要是解决FF重绘导致的flash重新加载
            reload: function() {
                if (flashReload.method) {
                    var node = baidu.g('FlashArea');
                    node.innerHTML = createFlash();

                    this.setData(flashReload.xml);
                    this[flashReload.method].apply(this, flashReload.args);
                } 
            },
            /**
             * @param {String} xml
             */
            setData: function(xml) {
                flashReload.xml = xml; 
                pollFlash('setData', arguments);
            },
            setIndicator: function(show) {
                flashReload.method = 'setIndicator';
                flashReload.args = arguments;
                pollFlash('setIndicator', arguments);
            },
            /**
             * @param {Boolean} show 是否显示平均值
             */
            showAverage: function(show) {
                flashReload.method = 'showAverage';
                flashReload.args = arguments;
                pollFlash('showAverage', arguments);
            },
            showLoading: function(callback) {
                flashReload.method = 'showLoading';
                flashReload.args = arguments;
                pollFlash('showLoading', null, callback);
            },
            showMessage: function(msg) {
                flashReload.method = 'showMessage';
                flashReload.args = arguments;
                pollFlash('showMessage', arguments);
            },
            showHistory: function(date, text) {
                flashReload.method = 'showHistory';
                flashReload.args = arguments;
                pollFlash('showHistory', arguments);
            }
        },

        /**
         * 概况Flash控制逻辑
         * @author linzhifeng@baidu.com 2010-12-22
         */
        _flashControl : {
            me : null,
            isFirstSight : true,    //用于判断第一进入时不默认请求历史操作
            //flashObj : null,
            hasData : false,
            overviewData : [],
            curIndicator : 1,
            historyQueryDate : '',
            overviewQueryDate : {
                begin : null,
                end : null
            },  
            
            /**
             * 概况Flash区域初始化
             */ 
            init : function(me){
                this.me = me;
                this.isFirstSight = true;   
                baidu.g('FlashArea').innerHTML = createFlash();
                
                
                ui.util.get("OverviewAverage").onclick = function(){            
                    nirvana.index._flashControl.me.setContext('overviewAverageChecked', ui.util.get("OverviewAverage").getChecked());
                    nirvana.index._flashControl.me.refresh();
               //     nirvana.util.loading.done();    
                }       
                
                ui.util.get("OverviewType").onselect = function(value, selected){
                    nirvana.index._flashControl.me.setContext('overviewOptionSelected', value);
                    nirvana.index._flashControl.me.refresh();
               //     nirvana.util.loading.done();                
                };
                
                ui.util.get("OverviewCalendar").onselect = function(date){
                    nirvana.index._flashControl.hasData = false;            
                    
                    var today = new Date(nirvana.env.SERVER_TIME * 1000),
                        dateRange = {
                            begin : baidu.date.format(date.begin,"yyyy-MM-dd"),
                            end : baidu.date.format(date.end,"yyyy-MM-dd")
                        };
                    today.setHours(0,0,0,0);    
                    if (date.end >= today){
                        today.setDate(today.getDate() - 1); //today变yesterday
                        dateRange.end = baidu.date.format(today,"yyyy-MM-dd");
                    }
                    nirvana.index._flashControl.overviewQueryDate["begin"] = dateRange.begin;
                    nirvana.index._flashControl.overviewQueryDate["end"] = dateRange.end;
                    nirvana.index._flashControl.me.setContext('overviewCalendarDateBegin', dateRange.begin);
                    nirvana.index._flashControl.me.setContext('overviewCalendarDateEnd', dateRange.end);
                    //alert(nirvana.index._flashControl.me.getContext('overviewCalendarDateEnd'));
                    //nirvana.index._flashControl.me.setContext('overviewCalendarDateSelected', dateRange); 
                    nirvana.index._flashControl.me.refresh();
                //    nirvana.util.loading.done();
                }
                
                baidu.on(window, 'resize', nirvana.index._flashControl.resizeHandler);
                //nirvana.index._flashControl.flashObj = baidu.swf.getMovie('OverviewFlash');       
            },
            
            /**
             * 获取概况数据
             */
            getOverviewData : function(){
                //nirvana.index._flashControl.flashObj.showLoading();
                nirvana.index._flash.showLoading();
                fbs.account.getOverViewData({
                    starttime : nirvana.index._flashControl.overviewQueryDate.begin,        // 起始日期
                    endtime : nirvana.index._flashControl.overviewQueryDate.end,            // 结束日期，起始日期等于结束日期则返回分时数据
                    onSuccess : nirvana.index._flashControl.getOverviewDataSuccess,     // 将返回数据中的status和成功数据data两个字段作为onSuccess的参数
                    onFail : nirvana.index._flashControl.getOverviewDataFail                // 将返回数据中的status和成功数据error两个字段作为onFail的参数
                })
            },
            
            /**
             * 概况数据成功返回
             * @param {Object} res
             */
            getOverviewDataSuccess : function(res){
                nirvana.index._flashControl.hasData = true;
                ui.util.get("OverviewType").disable(false);
                ui.util.get('OverviewAverage').disable(false);
                ui.util.get("OverviewCalendar").disable(false);
                
                nirvana.index._flashControl.overviewData = [];
                
                if (res.data.listData && res.data.listData.length > 0){
                     var isPerDay = nirvana.index._flashControl.overviewQueryDate.begin != nirvana.index._flashControl.overviewQueryDate.end;
                        
                    isPerDay ? nirvana.index._flashControl.completedPerDay(res.data.listData) : nirvana.index._flashControl.completedPerHour(res.data.listData);
                    
                    nirvana.index._flashControl.isPerDay = isPerDay;
                    
                    var indicatorValue = nirvana.index._flashControl.me.getContext('overviewOptionSelected');
                    if (nirvana.index._flashControl.curIndicator != indicatorValue){
                        nirvana.index._flashControl.curIndicator = indicatorValue;
                    }
                    
                    var data = nirvana.index._flashControl.overviewData,
                        str = [];
                        
                    str[str.length] = "<?xml version='1.0' encoding='utf-8'?>";
                    str[str.length] = "<data convertType='average' tag1='/展现/' tag2='/点击/' tag3='&#165;/消费/' tag4='/转化(网页)/' tag5='/点击率/%' tag6='&#165;/平均点击价格/' selected='" + nirvana.index._flashControl.curIndicator + (isPerDay ? "' >" : ("' date='" + nirvana.index._flashControl.overviewQueryDate.begin + "' >"));
                    for (var i = 0, len = data.length; i < len; i++){
                        str[str.length] =  "<record overTag='" + data[i].reporttime;
                        str[str.length] =  "' xAxisTag='" + (isPerDay ? data[i].reporttime : data[i].reporttime.substr(6));
                        str[str.length] =  "' data1='" + Math.round(+data[i].shows);
                        str[str.length] =  "' data2='" + Math.round(+data[i].clks);             
                        str[str.length] =  "' data3='" + (+data[i].paysum).toFixed(2);
                        str[str.length] =  "' data4='" + Math.round(+data[i].trans);
                        str[str.length] =  "' data5='" + (data[i].clkrate == '1.00' ? 100 : (+data[i].clkrate * 100).toFixed(2));
                        str[str.length] =  "' data6='" + (+data[i].avgprice).toFixed(2);
                        str[str.length] =  "'/>";
                    }
                    str[str.length] = "</data>";
                    //console.log(str.join(''));
                    //nirvana.index._flashControl.flashObj.setData(str.join(''));
                    nirvana.index._flash.setData(str.join(''));
                    if (ui.util.get("OverviewAverage").getChecked()){
                        setTimeout(function(){              
                            nirvana.index._flash.showAverage(true);
                        },300);             
                    }
                }else{                  
                    nirvana.index._flash.showMessage('抱歉，暂无数据');
                    nirvana.index._flashControl.hasData = false;
                    ui.util.get("OverviewAverage").disable(true);
                    ui.util.get("OverviewType").disable(true);
                }
            },
            
            /**
             * 概况数据失败返回
             * @param {Object} res
             */
            getOverviewDataFail : function(res){            
                nirvana.index._flash.showMessage(res.errorCode || '数据读取异常,请刷新后重试。');
                nirvana.index._flashControl.hasData = false;
                ui.util.get("OverviewAverage").disable(true);
                ui.util.get("OverviewType").disable(true);  
            },
                    
            /**
             * 分日数据补全
             */
            completedPerDay : function(data){
                if (data.length == 0){
                    nirvana.index._flashControl.overviewData = [];
                    return;
                }
                var firstDate = baidu.date.parse(data[0].reporttime),                   //返回的第一个
                    lastDate = baidu.date.parse(data[data.length - 1].reporttime),      //返回的最后一个
                    startDate = baidu.date.parse(nirvana.index._flashControl.overviewQueryDate.begin),  //用户选择的开始时间
                    endDate = baidu.date.parse(nirvana.index._flashControl.overviewQueryDate.end),      //用户选择的结束时间
                    gap,        //不连续间隔
                    gapDate;    //填充的日期         
                
                //开始日期不符，进行补全
                if (firstDate != startDate){
                    gap = (firstDate - startDate) / (24*3600*1000);
                    for(var i = 0 ; i < gap; i++){
                        //生成该日日期
                        gapDate = new Date(startDate - 0 + (i * 24 * 3600 * 1000));
                        nirvana.index._flashControl.overviewData[nirvana.index._flashControl.overviewData.length] = {
                            "reporttime" : baidu.date.format(gapDate,'yyyy-MM-dd'),
                            "shows" : 0,
                            "clks" : 0,                 
                            "paysum" : 0,
                            "trans" : 0,
                            "clkrate" : 0,
                            "avgprice" : 0  
                        };
                    }
                }
                
                //开始及其中日期不连续，进行补全
                var preDate = firstDate,
                    curDate;
                for (var i = 0,l = data.length; i < l; i++){
                    curDate = new Date(data[i]["reporttime"].replace(/-/g,'/'));
                    gap = (curDate - preDate) / (24*3600*1000);                 
                    for(var j = 1 ; j < gap; j++){
                        //生成该日日期
                        gapDate = new Date(preDate - 0 + (j * 24 * 3600 * 1000));
                        nirvana.index._flashControl.overviewData[nirvana.index._flashControl.overviewData.length] = {
                            "reporttime" : baidu.date.format(gapDate,'yyyy-MM-dd'),
                            "shows" : 0,
                            "clks" : 0,                 
                            "paysum" : 0,
                            "trans" : 0,
                            "clkrate" : 0,
                            "avgprice" : 0  
                        };
                    }
                    preDate = curDate;
                    nirvana.index._flashControl.overviewData[nirvana.index._flashControl.overviewData.length] = data[i]
                }
                
                //结束日期不符，进行补全
                if (lastDate != endDate){
                    gap = (endDate - lastDate) / (24*3600*1000);
                    for(var i = 1 ; i <= gap; i++){
                        //生成该日日期
                        gapDate = new Date(lastDate - 0 + (i * 24 * 3600 * 1000));
                        nirvana.index._flashControl.overviewData[nirvana.index._flashControl.overviewData.length] = {
                            "reporttime" : baidu.date.format(gapDate,'yyyy-MM-dd'),
                            "shows" : 0,
                            "clks" : 0,                 
                            "paysum" : 0,
                            "trans" : 0,
                            "clkrate" : 0,
                            "avgprice" : 0  
                        };
                    }
                }
            },
            
            /**
             * 分时数据补全
             */
            completedPerHour : function(data){
                if (data.length == 0){
                    nirvana.index._flashControl.overviewData = [];
                    return;
                }
                
                //构造初始化完整数据
                for (var i = 0; i < 24; i++){
                    nirvana.index._flashControl.overviewData[i] = {
                            "reporttime" : (i > 9 ? i : ('0' + i)) +':00-' + ((i+1) > 9 ? (i+1) : ('0' + (i+1))) + ':00',
                            "shows" : 0,
                            "clks" : 0,                 
                            "paysum" : 0,
                            "trans" : 0,
                            "clkrate" : 0,
                            "avgprice" : 0  
                    };
                }
                        
                //分时数据填充
                var curHour = 0;
                for (var i = 0, l = data.length; i < l; i++){
                    curHour = +data[i].reporttime;
                    nirvana.index._flashControl.overviewData[curHour] = data[i];
                    nirvana.index._flashControl.overviewData[curHour].reporttime = (curHour > 9 ? curHour : ('0' + curHour)) +':00-' + ((curHour+1) > 9 ? (curHour+1) : ('0' + (curHour+1))) + ':00';
                }       
            },
            
            /**
             * 获取历史操作
             * @param {Object} d
             */
            getHistory : function(d){
                var fc = nirvana.index._flashControl;
                
                var lastAvailDate = new Date(nirvana.env.SERVER_TIME * 1000);
                lastAvailDate.setMonth(lastAvailDate.getMonth() - 3);
                if (baidu.date.parse(d) - lastAvailDate < 0){
                    //3个月前不查询
                    nirvana.index._flash.showHistory(d,'<font color="#ffffff">抱歉，无法查询3个月以前的历史操作记录</font>')
                    return;
                }
                if (fc.isFirstSight){
                    //第一次进入不请求，提示用户点击查询
                    fc.isFirstSight = false;
                    nirvana.index._flash.showHistory(d,'<font color="#ffffff">单击可以查询当天的历史操作记录</font>')
                    return;
                }
                fc.historyQueryDate = d;       
                
                fbs.history.getDailyOverView({
                    date : d,
                    onSuccess : nirvana.index._flashControl.getHistorySuccess,
                    onFail :  nirvana.index._flashControl.getHistoryFail
                })
            },
            
            /**
             * 历史操作成功返回
             * @param {Object} res
             */
            getHistorySuccess : function(res){
                /*{
                    date: yyyy-mm-dd, //查询的日期
                    weekBudgetStat: 32, // 周预算设置情况，value为最后一次设置的周预算额度，-1表示取消周预算设置
                    budgetStat: 32, // 预算设置情况，value为最后一次设置的预算额度，-1表示取消预算设置
                    newPlanCnt: 2, // 新增计划数量
                    delPlanCnt: 3, // 删除计划数量
                    startPlanCnt: 3, // 启用计划数量
                    stopPlanCnt: 3, // 暂停计划数量
                    regionStat: 2  // 当天最后一次地域设置后的地域设置个数，-1为设置为全部地域
                }*/
                if (nirvana.index._flashControl.historyQueryDate != res.data.date){
                    return;
                }
                
                var str = '<font color="#999999">主要历史信息:</font><font color="#ffffff">',
                    index = 0,
                    data = res.data;
                if (data.weekBudgetStat){
                    ++index;
                    if(data.weekBudgetStat > 0){
                        str += '\n' + index + '. 账户周预算设定限额为' + data.weekBudgetStat + '元';
                    }else{
                        str += '\n' + index + '. 账户取消周预算'
                    }
                }
                if (data.budgetStat){
                    ++index;
                    if(data.budgetStat > 0){
                        str += '\n' + index + '. 账户日预算设定限额为' + data.budgetStat + '元';
                    }else{
                        str += '\n' + index + '. 账户取消日预算'
                    }
                }
                if (data.newPlanCnt){
                    ++index;
                    str += '\n' + index + '. 新建' + data.newPlanCnt + '个推广计划';
                }
                if (data.delPlanCnt){
                    ++index;
                    str += '\n' + index + '. 删除' + data.delPlanCnt + '个推广计划';
                }
                if (data.startPlanCnt){
                    ++index;
                    str += '\n' + index + '. 启用' + data.startPlanCnt + '个推广计划';
                }
                if (data.stopPlanCnt){
                    ++index;
                    str += '\n' + index + '. 暂停' + data.stopPlanCnt + '个推广计划';
                }
                if (data.regionStat){
                    ++index;
                    if(data.regionStat > 0){
                        str += '\n' + index + '. 账户推广地域设定为' + data.regionStat + '个地域';
                    }else{
                        str += '\n' + index + '. 账户推广地域设定为全部'
                    }
                }
                if (index == 0){
                    str += '\n' + '无';
                }
                str +='</font>';
                nirvana.index._flash.showHistory(data.date, str);
            },
            
            /**
             * 历史操作失败返回
             * @param {Object} res
             */
            getHistoryFail : function(res){
                nirvana.index._flash.showHistory(nirvana.index._flashControl.historyQueryDate, res.errorCode || '抱歉，获取数据失败。');
            },
            
            /**
             * Flash动态宽度
             */ 
            resizeHandler : function(){
                if (baidu.g('OverviewArea') && baidu.swf.getMovie('OverviewFlash')){
                    var flashWidth = baidu.g('OverviewArea').offsetWidth - 10;
                    
                    // IE下，如果flash宽度小于零会报错
                    if (flashWidth > 0) {
                        baidu.swf.getMovie('OverviewFlash').width = flashWidth;
                    }

                }else{
                    baidu.un(window, 'resize', nirvana.index._flashControl.resizeHandler);
                }
            }
        },
			
		disposeCoupon: disposeCoupon
    }
})();


ui.Bubble.source.rankTable = {
	type : 'normal',
	iconClass : 'ui_bubble_icon_info',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	showByClick : true,
	showByOver : true,			//鼠标悬浮延时显示
	showByOverInterval : 500,	//悬浮延时间隔
	hideByOut : true,			//鼠标离开延时显示
	hideByOutInterval : 2000,	//离开延时间隔，显示持续时间
	title: function(node){
		var ti = node.getAttribute('title');
		if (ti) {
			return (baidu.encodeHTML(baidu.decodeHTML(ti)));
		}
		else {
			return (baidu.encodeHTML(baidu.decodeHTML(node.firstChild.nodeValue)));
		}
	},
	content: function(node, fillHandle, timeStamp){
		var param = baidu.object.clone(nirvana.index._rank.oridata[node.getAttribute('index')]),
		    html = [];
		
		if (!param) {
			return;
		}
		
		// 如果没有计划单元名称，则为已删除
		// 这时stat -1代表已删除，其余值表示未删除，但是不代表对应的状态，只限于上一层级
		if (param.planstat == -1) { 
			param.planname += '[已删除]';
		}
		if (param.unitstat == -1) {
			param.unitname += '[已删除]';
		}
		
		html[html.length] = '<ul class="rank_bubble_content">';
		if (param.winfoid) {
			html[html.length] = '<li title="' + baidu.encodeHTML(param.planname) + '"><span>所属推广计划：</span>' + baidu.encodeHTML(param.planname) + '</li>';
			html[html.length] = '<li title="' + baidu.encodeHTML(param.unitname) + '"><span>所属推广单元：</span>' + baidu.encodeHTML(param.unitname) + '</li>';
		} else if (param.unitid) {
			html[html.length] = '<li title="' + baidu.encodeHTML(param.planname) + '"><span>所属推广计划：</span>' + baidu.encodeHTML(param.planname) + '</li>';
		}
		html[html.length] = '</ul>';
		
		return html.join('');
	}
};

ui.Bubble.source.addV = {
    type : 'tail',
    iconClass : '',
    positionList : [1,8,4,5,2,3,6,7],
    needBlurTrigger : true,
    showByClick : false,
    showByOver : true,			//鼠标悬浮延时显示
    showByOverInterval: 50,
    hideByOut : true,		//鼠标离开延时显示
    hideByOutInterval : 10,	//离开延时间隔，显示持续时间
    bubblePosition : '',   //小气泡的显示方式，absolute or fixed
    title : '',
    content : function(node, fillHandle, timeStamp){
        return nirvana.index._vState.getLayerContent();
    }
};
