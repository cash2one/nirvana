/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    trans/trans.js
 * desc:    转化跟踪-转化列表
 * author:  wangzhishou wanghuijun
 * date:    $Date: 2011/04/14 $
 */

ToolsModule.translist = new ToolsModule.Action('translist', {
    /**
     * 视图模板名，或返回视图模板名的函数
     */
    VIEW: 'translist',

    /**
     * 转化数据表格头部常量
     */
    TRANS_DATA_FIELDS: [{
        content: function(item){
            return baidu.encodeHTML(item.planid_name);
        },
        title: '推广计划',
		footContent : 'totalType',
		breakLine : true,
        width: 180
    }, {
        content: function(item){
            return baidu.encodeHTML(item.unitid_name);
        },
        title: '推广单元',
		breakLine : true,
        width: 180
    }, {
        content: function(item){
            return baidu.encodeHTML(item.wordid_name);
        },
        title: '关键词',
		breakLine : true,
        width: 180
    }, {
        content: function(item){
            return item.trans;
        },
        title: '转化次数',
        width: 180,
		align: 'right',
		sortable : true,
		field : 'trans',
		footContent : 'trans'
    }, {
        content: function(item){
            return item.clks;
        },
        title: '点击',
        width: 180,
		align: 'right',
		sortable : true,
		field : 'clks',
		footContent : 'clks'
    }, {
        content: function(item){
            return item.paysum;
        },
        title: '消费',
        width: 180,
		align: 'right',
		sortable : true,
		field : 'paysum',
		footContent : 'paysum'
    }],
	
	/**
     * 电话转化数据表格头部常量
     */
    PHONE_TRANS_DATA_FIELDS: [{
        content: function(item){
            return baidu.encodeHTML(item.planname);
        },
        title: '推广计划',
		breakLine : true,
		sortable : true,
		field : 'planname',
        width: 180
    }, {
        content: function(item){
            return baidu.encodeHTML(item.unitname);
        },
        title: '推广单元',
		breakLine : true,
		sortable : true,
		field : 'unitname',
        width: 180
    }, {
        content: function(item){
            return item.callcnt;
        },
        title: '呼叫次数',
        width: 80,
		align: 'right',
		sortable : true,
		field : 'callcnt'
    }, {
        content: function(item){
            return item.connectcnt;
        },
        title: '接通次数',
        width: 80,
		align: 'right',
		sortable : true,
		field : 'connectcnt'
    }, {
        content: function(item){
            return item.missedcnt;
        },
        title: '漏接次数',
        width: 80,
		align: 'right',
		sortable : true,
		field : 'missedcnt'
    }, {
        content: function(item){
            return item.avgcalltime;
        },
        title: '平均通话时长',
        width: 120,
		align: 'right'
    }],
    
    /**
     * 转化列表表格头部常量 
     */
    TRANS_LIST_FIELDS: [{
        content: function(item){
            return baidu.encodeHTML(item.name);
        },
        title: '转化名称',
		breakLine : true,
        width: 180,
		sortable : true,
		field : 'name'
    }, {
        content: function(item){
            var str = '<a href="' + baidu.encodeHTML(item.step_url) + '" target="_blank">' + baidu.encodeHTML(item.step_url) + '</a>';
            return str;
        },
        title: '目标网址',
		breakLine : true,
        width: 180,
		sortable : true,
		field : 'step_url'
    }, {
        content: function(item){
            return baidu.encodeHTML(item.siteUrl);
        },
        title: '所属网站',
		breakLine : true,
        width: 180,
		sortable : true,
		field : 'siteUrl'
    }, {
        content: function(item){
            var str = '';
            if (item.step_type == '1') {
                str = '部分匹配';
            } else {
                str = '完全匹配';
            }
            return str;
        },
        title: '匹配模式',
        width: 50,
		align: 'center',
		sortable : true,
		field : 'step_type'
    }, {
        content: function(item){
            var str = '';
			
			if (item.step_type == '0') { // 完全匹配才有检查代码
				str += '<a href="#check" site_id="' + item.siteid + '" url="' + item.step_url + '">检查代码</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
			}
			
            if (item.status == '1') { // 已经暂停，显示启用
                str += '<a href="#start" site_id="' + item.siteid + '" trans_id="' + item.trans_id + '">启用</a>&nbsp;&nbsp;';
            } else {
                str += '<a href="#pause" site_id="' + item.siteid + '" trans_id="' + item.trans_id + '">暂停</a>&nbsp;&nbsp;';
            }
            str += '<a href="#modify" siteid="' + item.siteid + '" transid="' + item.trans_id + '" siteUrl="' + item.siteUrl + '" name="' + item.name + '" step_url="' + item.step_url + '" step_type="' + item.step_type + '">修改</a>&nbsp;&nbsp;';
            str += '<a href="#delete" site_id="' + item.siteid + '" trans_id="' + item.trans_id + '">删除</a>&nbsp;&nbsp;';
            return str;
        },
        title: '操作',
        width: 230,
		align: 'center'
    }],
    
    /**
     * 网站列表表头初始化
     */
    WEB_LIST_FIELDS: [{
        content: function(item){
			// 需要手动加 http
            var str = '<a href="http://' + item.site_url + '" target="_blank">' + baidu.encodeHTML(item.site_url) + '</a>';
            return str;
        },
        title: '网站域名',
		sortable : true,
		breakLine : true,
		field : 'site_url',
        width: 180
    }, {
        content: function(item){
			var str = '';
			str += '<span id="siteStatus' + item.siteid + '" class="site-state-nocode">未检测到代码</span>&nbsp;';
			str += '<a class="inline-check-single" href="#checkSingle" siteid="' + item.siteid + '" url="' + item.site_url + '">&nbsp;</a>&nbsp;';
			str += '<a class="inline-check-all" href="#checkAll" siteid="' + item.siteid + '">全</a>';
            return str;
        },
        title: '首页代码状态',
        width: 100,
		align: 'center'
    },{
        content: function(item){
            return '<a href="#getcode" site_id="' + item.siteid + '" site_url="' + item.site_url + '">获取代码</a>';
        },
        title: '代码安装',
        minWidth: 30,
		align: 'center'
    },{
		content: function(item){
			return "<span class='gray'>设置样式</span>";
		},
		title: '电话追踪样式',
		width: 60,
		align: 'center',
		noun: true,
		minWidth: 60,
		nounName: '电话追踪样式'
	},{
		content: function(item){
		//	return "<a href='" + LXB.LINK.HOME + nirvana.env.USER_ID + "#type=style|siteid=" + item.siteid + "' target='_blank'>设置样式</a>";
			var html = '';
			if (item.phoneTrackStatus == 1) {
				html = "<span class='gray'>设置样式</span>";
			}
			else {
				html = "<a href='" + LXB.LINK.HOME + nirvana.env.USER_ID + "#type=style|siteid=" + item.siteid + "' target='_blank'>设置样式</a>";
			}
			return html;
		},
		title: '电话追踪样式',
		width: 60,
		align: 'center',
		noun: true,
		minWidth: 60,
		nounName: '电话追踪样式'
	},{
        content: function(item){
			var str = '';
			str += '<a href="#toTransList" siteid="' + item.siteid + '">' + item.transNum + '个目标</a>&nbsp;&nbsp;';
			str += '<a href="#toNewTrans" siteid="' + item.siteid + '" site_url="' + item.site_url + '">新目标</a>';
            return str;
        },
        title: '网页转化目标',
        width: 60,
		align: 'center',
		sortable : true,
		noun: true,
		minWidth: 60,
		nounName: '网页转化目标',
		field : 'transNum'
    },  {//离线宝已开通
        content: function(item){
            var str = '';
            if (item.status == '1') { // 已经暂停，显示启用
                str += '<a href="#start" site_id="' + item.siteid + '">启用网页跟踪</a>&nbsp;&nbsp;';
            } else {
                str += '<a href="#pause" site_id="' + item.siteid + '">暂停网页跟踪</a>&nbsp;&nbsp;';
            }
		 	if (item.phoneTrackStatus == '1') { // 已经暂停，显示启用
                str += '<a href="#startPhone" site_id="' + item.siteid + '" site_url="' + item.site_url + '">启用电话追踪</a>&nbsp;&nbsp;';
            } else {
                str += '<a href="#pausePhone" site_id="' + item.siteid + '" site_url="' + item.site_url + '">暂停电话追踪</a>&nbsp;&nbsp;';
            }
            str += '<a href="#delete" site_id="' + item.siteid + '">删除</a>&nbsp;&nbsp;';
            return str;
        },
        title: '操作',
        width: 230,
		align: 'center'
    },  {//离线宝未开通
        content: function(item){
            var str = '';
            if (item.status == '1') { // 已经暂停，显示启用
                str += '<a href="#start" site_id="' + item.siteid + '">启用网页跟踪</a>&nbsp;&nbsp;';
            } else {
                str += '<a href="#pause" site_id="' + item.siteid + '">暂停网页跟踪</a>&nbsp;&nbsp;';
            }
            str += "<span class='gray'>启用电话追踪</span>&nbsp;&nbsp;";
            str += '<a href="#delete" site_id="' + item.siteid + '">删除</a>&nbsp;&nbsp;';
            return str;
        },
        title: '操作',
        width: 230,
		align: 'center'
    }],
    
    /**
     * 要保持的状态集合。“状态名/状态默认值”形式的map。
     */
    STATE_MAP: {
        /**
         * 跟踪方式 //0:url,1:cookie,2:不跟踪，-1:用户未进行设置，-2:不可设置，在首次推广URL检查完成前，用户不可设置
         * 在前端，当cookieAuth权限为false时，将0设置为10，保存时，将10转换为0
         */
        trackType: 1,
		
		
        /**
         * 转化数据类型选择 0表示选择了查看转化次数 1表示查看转化的点击和消费
         */
        transDataTypeChecked: '0',
        /**
         * 日历开始日期
         */
        calendarDateBegin: '',
		phoneCalendarDateBegin: '',
        /**
         * 日历结束日期
         */
        calendarDateEnd: '',
        phoneCalendarDateEnd: '',
		
        
        /**
         * 站点列表选择框
         */
        siteListOption: null,
        siteListOptionSelected: null,
        siteListOptionB: null,
        siteListOptionSelectedB: null,
        
        /**
         * 统计范围
         */
        statsOption: [{
            text: '推广计划',
            value: 3
        }, {
            text: '推广单元',
            value: 5
        }, {
            text: '关键词',
            value: 6
        }],
		// 默认选中关键词
        statsOptionSelected: '6',
		
		//电话转化数据 默认选中计划
		phoneTransStatSelected: '3',
		phoneTransStatsOption:  [{
            text: '推广计划',
            value: 3
        }, {
            text: '推广单元',
            value: 5
        }],
        
        /**
         * 地域相关参数
         */
        TransAreaContext: '全部地域',
        provid: '0',
        
        /**
         * 表格相关数据
         */
        transDataListData: null,
        siteListDataListData: null,
		
		// 每页数量，固定为20
		pageSize : '20'
    },
    /**
     * 在模板中写一长串的控件属性会难以理解。该属性能以“控件id/属性集合”的形式在外部书写控件属性，使格式更清晰。
     */
    UI_PROP_MAP: {
        /**
         * 转化数据日历属性
         */
		TransDataCalendar : {
			value : '*calendarDateSelected',
			availableRange : '*calendarAvailableRange',
			show : 'form'
		},
		//电话转化数据日历属性
		PhoneTransDataCalendar : {
			value : '*phoneCalendarDateSelected',
			availableRange : '*phoneCalendarAvailableRange',
			show : 'form'
		},
        /**
         * 转化名称下拉框
         */
		TransNameSelect : {
			datasource : '*transNameOption',
			options : '*transNameOption',
			value : '*transNameOptionSelected',
			width : '100'
		},
        /**
         * 转化数据控件属性
         */
        TransDataTable: {
            type: 'Table',
            noDataHtml: FILL_HTML.NO_DATA,
            fields: '*transDataFields',
            datasource: '*transDataListData',
			sortable : 'true',
			orderBy : 'trans',
			order : 'desc',
			hasFoot : 'true',
			footdata : '*transDataFootData'
        },
		/**
         * 电话转化数据表格控件属性
         */
        PhoneTransDataTable: {
            type: 'Table',
            noDataHtml: FILL_HTML.NO_DATA,
			sortable : 'true'
        },
        /**
         * 转化列表控件属性
         */
        TransListTable: {
            type: 'Table',
            noDataHtml: FILL_HTML.TRANS_NO_DATA,
			sortable : 'true'
        },
        /**
         * 网站列表控件属性
         */
        SiteListTable: {
            type: 'Table',
            noDataHtml: FILL_HTML.NO_DATA,
			sortable : 'true'
        },
		
        /**
         * 转化数据分页控件
         */
		TransDataPage : {
			type : 'Page',
			page : '*transDataPage',
			total : '*transDataTotal'
		},
		
        /**
         * 电话转化数据分页控件
         */
		PhoneTransDataPage : {
			type : 'Page'
		},
        /**
         * 转化列表分页控件
         */
		TransListPage : {
			type : 'Page',
			page : '*transListPage',
			total : '*transListTotal'
		},
		
        /**
         * 网站列表分页控件
         */
		SiteListPage : {
			type : 'Page',
			page : '*siteListPage',
			total : '*siteListTotal'
		}
    },
    /**
     * 初始化context的函数集合，name/value型Object。其value为Function的map，value
     * Function被调用时this指针为Action本身。value
     * Function的形参需要有一个callback参数，参数为Function类型，手工回调。
     */
    CONTEXT_INITER_MAP: {
        /**
         * 日历数据初始化
         */
        InitCalendar: function(callback){
            var me = this,
				dateRange = {
					begin: null,
					end: null,
					beginDate: me.getContext('calendarDateBegin'), // 第一次进入时，没有Context，值为null
					endDate: me.getContext('calendarDateEnd')
				},
				// 可选的日历范围
				dateAvailableRange = {
					begin: new Date(),
					end: new Date()
				};
			
            if (!dateRange.beginDate) {
				//日历初始化
				dateRange = nirvana.util.dateOptionToDateValue(0); // 昨天
				
				// 转化数据最大时间范围是一年
				dateAvailableRange.begin.setDate(dateRange.end.getDate() -364);
				dateAvailableRange.end.setDate(dateRange.end.getDate() + 1);
				
				me.setContext('calendarAvailableRange', dateAvailableRange);
			} else {
				//日历复位，context不能保持对象，日历控件的状态保持需要通过字符串转换
				dateRange.begin = baidu.date.parse(dateRange.beginDate);
				dateRange.end = baidu.date.parse(dateRange.endDate);
			}
			
            /**
             * 设置日历控件的value
             */
            me.setContext('calendarDateSelected', dateRange);
			
            callback();
        },
		
		/**
         * 电话转化日历数据初始化
         */
        InitPhoneCalendar: function(callback){
            var me = this,
				dateRange = {
					begin: null,
					end: null,
					beginDate: me.getContext('phoneCalendarDateBegin'), // 第一次进入时，没有Context，值为null
					endDate: me.getContext('phoneCalendarDateEnd')
				},
				// 可选的日历范围
				dateAvailableRange = {
					begin: new Date(),
					end: new Date()
				};
			
            if (!dateRange.beginDate) {
				//日历初始化
				dateRange = nirvana.util.dateOptionToDateValue(0); // 昨天
				
				// 转化数据最大时间范围是一年
				dateAvailableRange.begin.setDate(dateRange.end.getDate() -364);
				dateAvailableRange.end.setDate(dateRange.end.getDate() + 1);
				
				me.setContext('phoneCalendarAvailableRange', dateAvailableRange);
			} else {
				//日历复位，context不能保持对象，日历控件的状态保持需要通过字符串转换
				dateRange.begin = baidu.date.parse(dateRange.beginDate);
				dateRange.end = baidu.date.parse(dateRange.endDate);
			}
			
            /**
             * 设置日历控件的value
             */
            me.setContext('phoneCalendarDateSelected', dateRange);
			
            callback();
        },
		
		/**
		 * 获取跟踪方式
		 * @param {Object} callback
		 */
		trackType : function(callback) {
			var me = this;
			
			fbs.trans.getTrackType({
                onSuccess: function(response){
					var data = response.data,
						trackType = data.trackType;
					trackType = (+trackType == 0) ? 1 : trackType;
					me.setContext('trackType', trackType);
					me.setContext('trackTypeBak', trackType);
					
					callback();
                },
                onFail: function(){
                    ajaxFailDialog();
					callback();
                }
            });
		},

        /**
         * 获取站点列表
         */
        loadTransSiteData: function(callback){
			this.loadSiteListForSelect(callback);
		},
        
		/**
		 * 新增网站输入框
		 * @param {Object} callback
		 */
		domainDefaultValue: function(callback){
			this.setContext('domainDefaultValue',nirvana.config.TRANS.DOMAIN_DEFAULT_VALUE);
			callback();
		},
		
		lxbLink : function(callback){
		//	this.setContext('lxbBill',LXB.LINK.BILL + nirvana.env.USER_ID);
			this.setContext('lxbCall',LXB.LINK.HOME + nirvana.env.USER_ID + "#type=call");
			callback();
		}
    },
    
    /**
     * 视图repaint的后会触发事件
     */
    onafterrepaint: function(){
    
    },
    
    /**
     * 第一次render后执行
     */
    onafterrender: function(){
        var me = this;
		
		// 选择统计范围 推广计划--3 推广单元--5 关键词--6
        ui.util.get('StatsSelect').onselect = function(selected){
            if (selected == me.getContext('statsOptionSelected')) {
                return false;
            }
            me.setContext('statsOptionSelected', selected);
        };
		// 电话选择统计范围          推广计划--3 推广单元--5 
        ui.util.get('PhoneTransStatsSelect').onselect = function(selected){
            if (selected == me.getContext('phoneTransStatSelected')) {
                return false;
            }
            me.setContext('phoneTransStatSelected', selected);
        };
		// 电话转化数据 - 日历
        ui.util.get('PhoneTransDataCalendar').onselect = me.setPhoneTransDate();
		me.setPhoneTransDate()();
		// 转化数据 - 日历
        ui.util.get('TransDataCalendar').onselect = me.setTransDate();
		me.setTransDate()();
				
		// 查询转化数据
        ui.util.get('TransDataInputBtn').onclick = function(){
            me.loadTransData();
        };
		// 查询电话转化数据
        ui.util.get('PhoneTransDataInputBtn').onclick = function(){
            me.getPhoneTransData();
        };
		// 查询转化列表
        ui.util.get('TransListInputBtn').onclick = function(){
            me.getTransList();
        };
		//新增网站
		ui.util.get("NewSite").onenter = ui.util.get("NewSiteBtn").onclick = function(){
			me.addNewSite();
		};

		ui.util.get("NewSite").onchange = function(){
			baidu.g("NewTransDomainWarn").innerHTML = '';
			baidu.addClass("NewTransDomainWarn", 'hide');
		}
		
		baidu.g("ToSiteListArea").onclick = function(){
			me.arg.level = "SiteList";
			me.showTabHandle('TransTrackSetTab');
		};
		
		//网页转化数据转化名称选项
		me.getTransListForSelect();
		
		//查询开放域名列表
		me.getOpenDomain();
		// 顶部菜单切换
        me.bindMenuTab();
		// radio框选择业务处理函数
        me.bindRadioController();
		// 站点选择下拉框业务逻辑
        me.bindSiteListSelect();
		// 翻页功能绑定
		me.bindPage();	
		// 表格排序功能
		me.bindTableSort();	
		
		// 定位tab
		me.initTab();
    },

    
    /**
     *
     */
    onentercomplete: function(){
        var me = this;
		nirvana.trans.currentPath = 'translist';

		// 地域选择下拉框业务逻辑
        me.bindAreaSelect();
		// 地域选择下拉框业务逻辑
        me.bindTransController();
				
		if (baidu.g('TransToReport')) { // 跳转到数据报告
			baidu.g('TransToReport').onclick = function(e) {
				var e = e || window.event;
				
				me.redirect('/tools/report', {});
				
				baidu.event.preventDefault(e);
			};
		}

		baidu.event.fire(window,'resize');
    },
/************************************自定义函数*****************************************/


		loadSiteListForSelect: function(callback){
            var me = this;

				fbs.trans.getSiteListForSelect({
                    onSuccess: function(response){
                        var data = response.data;
                        var tmp = [];
                        tmp.push({
                            text: '全部',
                            value: '0'
                        });
                        for (var i = 0, n = data.length; i < n; i++) {
                            tmp.push({
                                text: baidu.encodeHTML(data[i]['site_url']),
                                value: data[i]['site_id']
                            });
                        }
						
						//如果当前有选择网站，则保持，没有则选择全部
                        if(!me.getContext('siteListOptionSelected')){
                            me.setContext('siteListOptionSelected', tmp[0]['value']);
                        }
						//如果当前有选择网站，则保持，没有则选择全部
                        if(!me.getContext('siteListOptionSelectedB')){
                            me.setContext('siteListOptionSelectedB', tmp[0]['value']);
                        }
						if (callback) {
							me.setContext('siteListOption', tmp);
							me.setContext('siteListOptionB', tmp);
							callback();
						}else{
							var sitelistA = ui.util.get("SiteListSelect"),
								sitelistB = ui.util.get("SiteListSelectB");
							sitelistA.options = tmp;
							sitelistA.render();
							sitelistB.options = tmp;
							sitelistB.render();
						}
                    },
                    onFail: function(){
                        ajaxFailDialog();
                        callback && callback();
                    }
                });
        },
	
	 /**
     * 查询开放域名列表
     */
	getOpenDomain: function(){
		var me = this;
		
		fbs.trans.getOpenDomain({
			onSuccess: function(response){
				var data = response.data;
				nirvana.trans.openDomain = data;
			},
			onFail: function(){
				ajaxFailDialog();
			}
		});
	},
	
	/**
	 * 绑定翻页功能
	 */
	bindPage : function() {
		var me = this,
			controlMap = me._controlMap;
		
		// 电话转化数据
		controlMap.PhoneTransDataPage.onselect = me.phoneTransDataPageHandler();
		
		// 转化数据
		controlMap.TransDataPage.onselect = me.transDataPageHandler();
		
		// 转化列表
		controlMap.TransListPage.onselect = me.transListPageHandler();
		
		// 网站列表
		controlMap.SiteListPage.onselect = me.siteListPageHandler();
	},

	
	/**
	 * 绑定表格排序功能
	 */
	bindTableSort : function() {
		var me = this,
			controlMap = me._controlMap;
		
		
		//电话转化数据
		controlMap.PhoneTransDataTable.onsort = me.sortPhoneTransData();
		
		// 转化数据
		controlMap.TransDataTable.onsort = me.sortTransData();
		
		// 转化列表
		controlMap.TransListTable.onsort = me.sortTransList();
		
		// 网站列表
		controlMap.SiteListTable.onsort = me.sortSiteList();
	},
	
	
    
    /**
     * 绑定地域选择下拉框业务逻辑
     */
    bindAreaSelect: function(){
        var me = this;
        baidu.g('TransAreaTip').innerHTML = me.getContext('TransAreaContext');
		
        ui.util.get('TransAreaSelectBtn').onclick = function(){
            baidu.dom.toggle('TransAreaContainer');
        };
        // 关闭地域层
        ui.util.get("TransRegionCancel").onclick = this.toggleRegion();
        // 保存地域修改
        ui.util.get('TransRegionOk').onclick = this.modRegion();
        // 选择全部地域
        ui.util.get('TransAllRegion').onclick = function(){
            ui.util.get('TransRegionBody').main.style.display = 'none';
        };
        // 选择部分地域
        ui.util.get('TransPartRegion').onclick = function(){
            ui.util.get('TransRegionBody').main.style.display = 'block';
        };
        // 点击空白处关闭地域
        baidu.on('Tools_translist', 'click', me.closeRegion());
    },
    
    /**
     * 关闭地域选择
     */
    closeRegion: function(){
        var me = this;
        return function(event){
            var target = baidu.event.getTarget(event);
            var btn = baidu.G('ctrlbuttonTransAreaSelectBtn');
            if (btn) {
                if (baidu.dom.contains('TransAreaContainer', target) ||
                baidu.dom.contains(btn, target) ||
                target == baidu.g('TransAreaContainer') ||
                target == btn) {
                    return;
                }
                baidu.hide('TransAreaContainer');
            }
        };
    },
    
    /**
     * 打开关闭地域选择框
     */
    toggleRegion: function(){
        var me = this;
        return function(){
            baidu.dom.toggle('TransAreaContainer');
        };
    },
    
    /**
     * 修改地域显示文字
     */
    modRegion: function(){
        var me = this;
        return function(){
            var isAll = ui.util.get("TransAllRegion").getGroup().getValue(),
				region = [],
				regionStr = [],
				regionObj = {};
				
            if (isAll == 0) {
                region = me.getAllRegion();
            } else {
                region = ui.util.get("TransRegionBody").getCheckedRegion();
            }
			
			me.setContext('provid', region.join('|'));
			
            for (var i = 0; i < region.length; i++) {
                //region[i] = region[i].toString();
				regionStr[i] = region[i].toString();
            }
			
			regionObj = nirvana.manage.region.abbRegion(regionStr, "account");
			me.setContext("TransAreaContext", regionObj.word);
			
            baidu.g('TransAreaTip').title = regionObj.title;
            baidu.g('TransAreaTip').innerHTML = me.getContext('TransAreaContext');
            baidu.hide('TransAreaContainer');
        };
    },
    
    /**
     * 获取所有地域
     */
    getAllRegion: function(){
        return [0];
    },
    
    /**
     * 绑定站点选择下拉框业务逻辑
     */
    bindSiteListSelect: function(){
        var me = this;
		
		// 转化列表-所属网站
        ui.util.get('SiteListSelectB').onselect = function(selected){
            if (selected == me.getContext('siteListOptionSelectedB')) {
                return false;
            }
            me.setContext('siteListOptionSelectedB', selected);
        }
		// 转化数据-转化名称
        ui.util.get('TransNameSelect').onselect = function(selected){
            if (selected == me.getContext('transNameOptionSelected')) {
                return false;
            }
            me.setContext('transNameOptionSelected', selected);
        }
		// 转化数据-所属网站
        ui.util.get('SiteListSelect').onselect = function(selected){
            if (selected == me.getContext('siteListOptionSelected')) {
                return false;
            }
            me.setContext('siteListOptionSelected', selected);
			// 转化名称是否需要更新
			me.setContext('isTransNameRefresh', '1');
         //   me.refresh();
		 	me.getTransListForSelect();
        };
    },
    
	
	/**
	 * 跳转到新增转化
	 * backarg 用户标志返回页面的参数
	 */
	jumpToNewTrans: function(backarg){
		var me = this;
		
		baidu.un('Tools_translist', 'click', me.closeRegion());
		baidu.un('Tools_translist', 'click', me.closeTransController());
		me.redirect('/tools/newtrans', backarg);
	},
 	
  /**************************************开通/关闭设置 相关函数  BEGIN*************************************/    
    /**
     * 挂载跟踪方式设置业务逻辑
     */
    bindTransController: function(){
        var G = baidu.g,
			me = this;
		
		// 打开跟踪方式设置
        G("SetTransBtn").onclick = function(e){
            e = e || window.event;
            baidu.event.preventDefault(e);
            me.initTransController();
        };
        ui.util.get('SetTransBtn').onclick = function(){
            me.initTransController();
        };
		
		// 新增转化
        ui.util.get('TransListNewListBtn').onclick = function(){
			var arg = {
				tabId: "TransTrackSetTab",
				level: "TransList",
				siteid: me.getContext('siteListOptionSelectedB')
			};
			me.jumpToNewTrans(arg);
        };
		
		// 取消和关闭跟踪方式
        G('SetTransContainerCloseBtn').onclick = ui.util.get('SetTransCancelBtn').onclick = function(){
			me.restoreTrackType();
        };
		
		// 确定
        ui.util.get('SetTransOkBtn').onclick = me.setTransRequestControoler();
		
		// 显示相应选项的提示
        ui.util.get('TrackSetByCookie').onclick = ui.util.get('TrackSetOff').onclick = function(){
            var type = me.getContext('trackTypeBak');
			
			if (G('MessageSet' + type)) {
				 G('MessageSet' + type).style.display = "none";
			}
			
            type = ui.util.get('TrackSetByCookie').getGroup().getValue();
            me.setContext('trackTypeBak', type);
			
			if (G('MessageSet' + type)) {
				 G('MessageSet' + type).style.display = "block";
			}
			
			// 激活确定按钮
			ui.util.get('SetTransOkBtn').disable(false);
        };
		
        // 点击空白处关闭
        baidu.on('Tools_translist', 'click', me.closeTransController());
    },
	
	/**
	 * 若未修改设置或者设置未成功，还原最初选项
	 */
	restoreTrackType: function(){
		var me = this,
			G = baidu.g,
			type = me.getContext('trackType'), 
			typeBak = me.getContext('trackTypeBak');
		
		if (G('MessageSet' + typeBak)) {
			G('MessageSet' + typeBak).style.display = "none";
		}
		
		me.setContext('trackTypeBak', type);
		ui.util.get('TrackSetByCookie').getGroup().setValue(type);
		
		baidu.hide('SetTransContainer');
	},
    
    /**
     * 初始化跟踪方式设置业务逻辑
     */
    initTransController: function(){
        var me = this,
			G = baidu.g,
			// 这里需要后端传入
			trackType = me.getContext('trackType');
		
		switch (trackType) {
			// 在首次推广URL检查完成前，用户不可设置
			case nirvana.config.TRANS.TRACK_TYPE.FORBIDDEN:
				ui.Dialog.alert({
					title: '提醒',
					content: '首次推广URL检查完成前，用户不可设置'
				});
				return;
			
			// 用户未进行设置，确定按钮不可点
			case nirvana.config.TRANS.TRACK_TYPE.NULL:
				ui.util.get('SetTransOkBtn').disable(true);
				break;
		}
		
        baidu.dom.toggle('SetTransContainer');
		
        me.setTransContent();
    },
	
	/**
	 * 关闭跟踪方式设置
	 */
	closeTransController : function() {
		var me = this;
		
		return function(e){
            var e = e || window.event,
				target = baidu.event.getTarget(e),
				btnTxt = baidu.g('TransSetAll');
				
            if (btnTxt) {
                if (baidu.dom.contains('SetTransContainer', target) ||
                baidu.dom.contains(btnTxt, target) ||
                target == baidu.g('SetTransContainer') ||
                target == btnTxt) {
                    return;
                }
                baidu.hide('SetTransContainer');
            }
        };
	},
    
    /**
     * 提交设置转化方式
     */
    setTransRequestControoler: function(){
        var me = this;
		
        return function(e){
            var tracktype = me.getContext('trackTypeBak');
            fbs.trans.setTrackType({
                trackType: tracktype, 
                onSuccess: function(response){
					// 设置成功以后，清除getTrackType缓存
					fbs.trans.getTrackType.clearCache();
					NIRVANA_LOG.send({
							target:"setTracktype",
							tracktype: tracktype
						});
                    if (response.data) {
                        me.refresh();
                        baidu.dom.hide('SetTransContainer');
                    }
                },
                onFail: function(){
					me.restoreTrackType();
                    ajaxFailDialog();
                }
            });
        }
    },
    
    /**
     * 根据权限\类型显示不同的内容
     */
    setTransContent : function(){
        var me= this,
			G = baidu.g,
			trackType = me.getContext('trackType');
			
		if (G('MessageSet' + trackType)) {
			G('MessageSet' + trackType).style.display = "block";
		}
    },

  /**************************************开通/关闭设置 相关函数  END*************************************/ 
	
    
	
  /**************************************电话转化数据 相关函数  BEGIN*************************************/ 
	
	/**
	 * 设置时间
	 */
    setPhoneTransDate : function() {
		var me = this;
		
		return function(dateRange){
			if (typeof(dateRange) == 'undefined') {
				var dateRange = me.getContext('phoneCalendarDateSelected');
			}
			
			var starttime = baidu.date.format(dateRange.begin, 'yyyy-MM-dd'),
				endtime = baidu.date.format(dateRange.end, 'yyyy-MM-dd');
			
			me.setContext('phoneCalendarDateBegin', starttime);
			me.setContext('phoneCalendarDateEnd', endtime);
		};
	},
  
    /**
     * FBS方式获取转化数据
     */
    loadPhoneTransData: function(){
        var me = this;
		baidu.addClass("PhoneTrackSucceedArea", "hide");
		baidu.addClass("PhoneTrackAppFailArea", "hide");
		fbs.trans.getLxbStatus({
			onSuccess: function(res){
				var status = +res.data;
				switch(status){
					case 0:
					case 4:
					case 6:
					case 1000:
						baidu.g("PhoneTrackAppFailTip").className = "lxb-border-" + status;
						baidu.removeClass("PhoneTrackAppFailArea", "hide");
						me.phoneTransAppFail(status);
						break;
					case 1:
					case 8:
					case 9:
						baidu.addClass("PhoneTrackPauseTip", "hide");
						baidu.removeClass("PhoneTrackSucceedArea", "hide");
						me.phoneTransSucceed(status);
						break;
					default:
						break;
				}
			},
			onFail: function(res){
				ajaxFailDialog();
			}
		});
    },
	
	/**
	 * 离线宝未申请或申请尚未成功状态
	 * @param {Object} status
	 */
	phoneTransAppFail: function(status){
		var me = this,
			dom = baidu.g("PhoneTrackAppFailTip"),
			parent = baidu.g("PhoneTrackAppFailArea");
		
		me.showLXBStat(status, baidu.g("PhoneTrackAppFailStat"));
		dom.innerHTML = me.getLXBStatTip(status);
		if(status == 1000){
			ui.util.init(dom);
			if(ui.util.get('appLxb')){
				ui.util.get('appLxb').onclick = function(){
					window.open(LXB.LINK.PRODUCT + nirvana.env.USER_ID, 'appLxbNewPage');
				};
			}
			baidu.addClass(parent, "applxbguide");
		}else{
			baidu.removeClass(parent, "applxbguide");
		}
	},
	
	/**
	 * 离线宝已申请状态，电话转化数据查询功能
	 * @param {Object} status
	 */
	phoneTransSucceed: function(status){
		var me = this;
		
		me.showLXBStat(status, baidu.g("PhoneTrackSucceedStat"));
		if(status != 1){
			baidu.g("PhoneTrackPauseTip").innerHTML = me.getLXBStatTip(status);
			baidu.removeClass("PhoneTrackPauseTip", "hide");
		}
		baidu.removeClass("PhoneTrackAppFailArea", "applxbguide");
   //     me.getPhoneTransData();
	},
	
	/**
	 * 请求数据
	 */
	getPhoneTransData:function(){
		var me = this,
			mtldim = me.getContext('phoneTransStatSelected');
		//若选择统计范围发生改变，则修改table的fields
		if(me.curPhoneDimLevel != mtldim){
			me.curPhoneDimLevel = mtldim;
			var tableFields = me.PHONE_TRANS_DATA_FIELDS;
				
			// 根据统计范围设置fields
			if (mtldim == 3) {
				tableFields = baidu.object.clone(me.PHONE_TRANS_DATA_FIELDS);
				baidu.array.removeAt(tableFields, 1);
			}
			me._controlMap.PhoneTransDataTable.fields = tableFields;
		}
			
		// 已经配置不缓存
        fbs.trans.getPhoneTransData({
            mtldim: mtldim,
            starttime: me.getContext('phoneCalendarDateBegin'),
            endtime: me.getContext('phoneCalendarDateEnd'),
            onSuccess: function(response){
				var data = response.data,
					totalNum = data.length;
				
				// 数据总数
				me.setContext('phoneTransDataTotalNum', totalNum);
				
				// 表格原始数据
				me.setContext('phoneTransDataSource', data);
			
				// 获取数据
				me.sortPhoneTransData()();
            },
            onFail: function(response) {
				ajaxFailDialog();
            }
        });
	},
	
	/**
	 * 右上角状态提示
	 * @param {Object} status
	 * @param {Object} container
	 */
	showLXBStat:function(status, container){
		var me = this;
		if (status == 1) {
			fbs.trans.getLxbBaseInfo({
				onSuccess: function(res){
					container.innerHTML = '<span class="sphone-icon' + status + '"></span>' +
								'<span class="trans-lxb-stat lxb-label-' + status +'">' + res.data.phone + '</span>';
				},
				onFail: function(res){
					container.innerHTML = '<span class="sphone-icon' + status + '"></span>' +
								'<span class="trans-lxb-stat lxb-label-' + status +'">' + LXB.STATUS[status] + '</span>';
				}
			});
		}
		else {
			container.innerHTML = '<span class="sphone-icon' + status + '"></span>' +
								'<span class="trans-lxb-stat lxb-label-' + status +'">' + LXB.STATUS[status] + '</span>';
		}
	},
	
	/**
	 * 非正常使用状态提示
	 * @param {Object} status
	 */
	getLXBStatTip:function(status){
		var me = this,
			tpl = er.template.get("LXBStat" + status),
			link = "",
			html = '';
		switch(status){
			case 0:
			case 4:
			case 9:
				link = LXB.LINK.REG + nirvana.env.USER_ID;
				html = ui.format(tpl, link);
				break;
			case 6: 
			case 8:
		//	case 1000: 
				html = tpl;
				break;
			case 1000: 
				link = LXB.LINK.PRODUCT + nirvana.env.USER_ID;
				html = ui.format(tpl, link);
			 	break;
			default:
				break;
		}
		return html;
	},
		
	/**
	 * 转化数据排序
	 */
	sortPhoneTransData: function(){
		var me = this;
		
		return function(sortField){
			var tableData = me.getContext('phoneTransDataSource'), 
				pageSize = me.getContext('pageSize'), 
				table = me._controlMap.PhoneTransDataTable;
			
			if (typeof(sortField) != 'undefined') {
				table.field = sortField.field;
			}
			tableData = nirvana.manage.orderData(tableData, table.field, table.order);
			me.setContext('phoneTransDataSource', tableData);
			me.getPhoneTransDataPerPage(1);
		};
	},
	
	
	/**
	 * 转化数据翻页
	 */
	phoneTransDataPageHandler : function() {
		var me = this;
		
		return function(value) {
			me.getPhoneTransDataPerPage(value);
		};
	},
	
	/**
	 * 获取每页转化数据
	 */
	getPhoneTransDataPerPage : function(pageNo) {
		var me = this,
		    data = me.getContext('phoneTransDataSource'),
		    result = baidu.object.clone(data),//TODO 改，不要用clone
			datasource,
			totalNum = me.getContext('phoneTransDataTotalNum'),
			totalPage,
			pageSize = me.getContext('pageSize'),
			table = me._controlMap.PhoneTransDataTable,
			phonepage = me._controlMap.PhoneTransDataPage;

		datasource = nirvana.util.getPageData(result, pageSize, pageNo);
		
		// 计算总页数
		totalPage = Math.ceil(totalNum / pageSize);
		phonepage.page = pageNo;
		phonepage.total = totalPage;
		phonepage.render();
		
		table.datasource = datasource;
		table.render();
	/*	if (!table.isBindHandler) {
			baidu.event.on(baidu.g("ctrltablePhoneTransDataTablebody"), 'click', function(e){
				e = e || window.event;
				var elm = baidu.event.getTarget(e);
				//没有数据，提示中”新增转化“
				if (baidu.dom.hasClass(elm, "addTransBtnInline")) {
					me.jumpToNewTrans({
						tabId: "PhoneTransDataTab"
					});
					return;
				}
			});
			table.isBindHandler = true;
		}*/
	},
  /**************************************电话转化数据 相关函数  END*************************************/ 
  
  
  /**************************************网页转化数据 相关函数  BEGIN*************************************/ 
	
	/**
	 * 设置时间
	 */
    setTransDate : function() {
		var me = this;
		
		return function(dateRange){
			if (typeof(dateRange) == 'undefined') {
				var dateRange = me.getContext('calendarDateSelected');
			}
			
			var starttime = baidu.date.format(dateRange.begin, 'yyyy-MM-dd'),
				endtime = baidu.date.format(dateRange.end, 'yyyy-MM-dd');
			
			me.setContext('calendarDateBegin', starttime);
			me.setContext('calendarDateEnd', endtime);
		};
	},
	
	
	/**
	 * 转化数据表格表头初始化
	 */
	setTransDataFields: function(){
		var me = this, 
			fields = baidu.object.clone(me.TRANS_DATA_FIELDS), 
			len;
		
		// 根据统计范围设置fields
		switch (me.getContext('statsOptionSelected')) {
			case 3:
				// 推广计划,移除单元、关键词列
				baidu.array.removeAt(fields, 1);
				baidu.array.removeAt(fields, 1);
				break;
			case 5:
				// 推广单元,移除关键词列
				baidu.array.removeAt(fields, 2);
				break;
			default:
				// 关键词
				break;
		}
		
		len = fields.length;
		
		if (me.getContext('transDataTypeChecked') != '1') {
			// 查看转化次数
			baidu.array.removeAt(fields, len - 1);
			baidu.array.removeAt(fields, len - 2);
		}
		me._controlMap.TransDataTable.fields = fields;
	},
  
	/**
	 * 通过所属网站查找转化名称
	 */
   	getTransListForSelect: function(){
		var me = this;
		
		if (me.getContext('isTransNameRefresh') == '0') {
			// 主要用来判断是否需要更新转化名称列表
			return;
		};
		me.setContext('isTransNameRefresh', '0');
		
		var tmp = [{
			text: '全部',
			value: '0'
		}],
			transName = ui.util.get("TransNameSelect");
		
		if (me.getContext('siteListOptionSelected') == '0') {
			transName.options = tmp;
			transName.value = tmp[0]['value'];
            me.setContext('transNameOptionSelected', tmp[0]['value']);
			transName.render();
		}
		else {
			fbs.trans.getTransListForSelect({
				siteid: me.getContext('siteListOptionSelected'),
				onSuccess: function(response){
					var data = response.data;
					for (var i = 0, n = data.length; i < n; i++) {
						tmp.push({
							text: baidu.encodeHTML(data[i]['name']),
							value: data[i]['trans_id']
						});
					}
					transName.options = tmp;
					transName.value = tmp[0]['value'];
               		me.setContext('transNameOptionSelected', tmp[0]['value']);
					transName.render();
				},
				onFail: function(){
					ajaxFailDialog();
				}
			});
		}
	},
        
  
    /**
     * FBS方式获取转化数据
     */
    loadTransData: function(){
        var me = this,
			siteid = me.getContext('siteListOptionSelected'),
			transid = me.getContext('transNameOptionSelected'),
			hideClks = me.getContext('transDataTypeChecked');
		
		if (hideClks == 1) { // 查看转化的点击和消费
			siteid = transid = 0;
		}
		me.setTransDataFields();
        // 已经配置不缓存
        fbs.trans.getTransData({
            siteid: siteid,
            transid: transid,
            mtldim: me.getContext('statsOptionSelected'),
            startDate: me.getContext('calendarDateBegin').replace(/-/g,''),
            endDate: me.getContext('calendarDateEnd').replace(/-/g,''),
            providsStr: me.getContext('provid'),
            hideClks: hideClks,
            onSuccess: function(response){
				var data = response.data,
					totalNum = data.length;
				
				// 数据总数
				me.setContext('transDataTotalNum', totalNum);
				
				// 表格原始数据
				me.setContext('transDataSource', data);
				
				// 获取数据，默认按转化排序
				me.sortTransData()();
            },
            onFail: function(response) {
				var status = response.status,
					errorCode = response.errorCode;
				
				if (errorCode && errorCode.code) {
					var table = me._controlMap.TransDataTable,
						page = me._controlMap.TransDataPage;
					
					switch (errorCode.code) {
						case 1500 : // NOTALL
							table.datasouce = [];
							table.noDataHtml = FILL_HTML.TRANS_DATA_NOTALL;
							page.total = 0;
							table.render();
							page.render();
							break;
						case 1501 : // error out range
							table.datasouce = [];
							table.noDataHtml = FILL_HTML.TRANS_DATA_OUTRANGE;
							page.total = 0;
							table.render();
							page.render();
							break;
						default :
							ajaxFailDialog();
							break;
					}
				} else {
					ajaxFailDialog();
				}
            }
        });
    },
	
		
	/**
	 * 转化数据排序
	 */
	sortTransData: function(){
		var me = this;
		
		return function(sortField) {
			var tableData = me.getContext('transDataSource'),
			    pageSize = me.getContext('pageSize'),
				table = me._controlMap.TransDataTable,
				order = table.order,
				field;
			
			if (me.getContext('transDataTypeChecked') == 0) { // 只查看转化次数，则强制按转化排序，因为没有其他排序列
				table.orderBy = 'trans';
			}
			
			field = table.orderBy;
			
			if (typeof(sortField) != 'undefined') {
				field = sortField.field;
			}
			
			tableData = nirvana.displayReport.orderData(tableData, field, order);
			me.setContext('transDataSource', tableData);
			me.getTransDataPerPage(1);
		};
	},
	
	
	/**
	 * 转化数据翻页
	 */
	transDataPageHandler : function() {
		var me = this;
		
		return function(value) {
			me.getTransDataPerPage(value);
		};
	},
	
	/**
	 * 获取每页转化数据
	 */
	getTransDataPerPage : function(pageNo) {
		var me = this,
		    data = me.getContext('transDataSource'),
		    result = baidu.object.clone(data),
			sum = [],
			datasource,
			table = me._controlMap.TransDataTable,
			page = me._controlMap.TransDataPage,
			totalNum = me.getContext('transDataTotalNum'),
			totalPage,
			pageSize = me.getContext('pageSize'),
			trans = 0,
			clks = 0,
			paysum = 0,
			tmp;
		/**
		 *  构造合计数据标题
		 */
		for (var i = 0, len = result.length; i < len; i++) {
			tmp = result[i];
			
			trans += tmp.trans;
			clks += +tmp.clks;
			paysum += +tmp.paysum;
		}
		
		sum.push({
			totalType : '合计',
			trans : trans,
			clks : clks,
			paysum : fixed(paysum) // 保留2位小数
		});
		
		datasource = nirvana.util.getPageData(result, pageSize, pageNo);
		
		// 计算总页数
		totalPage = Math.ceil(totalNum / pageSize);
		page.page = pageNo;
		page.total = totalPage;
		page.render();
		
		table.datasource = datasource;
		table.footdata = sum;
		table.render();
	/*	if (!table.isBindHandler) {
			baidu.event.on(baidu.g("ctrltableTransDataTablebody"), 'click', function(e){
				e = e || window.event;
				var elm = baidu.event.getTarget(e);
				//没有数据，提示中”新增转化“
				if (baidu.dom.hasClass(elm, "addTransBtnInline")) {
					me.jumpToNewTrans({
						tabId: "WebTransDataTab"
					});
					return;
				}
			});
			table.isBindHandler = true;
		}*/
	},
	
	
    /**
     * 绑定radio框选择业务处理函数
     */
    bindRadioController: function(){
        var me = this,
			G = baidu.G;
		
		// 查看转化次数 查看转化的点击和消费
        ui.util.get('TransDataTypeNumber').onclick = ui.util.get('TransDataTypeClick').onclick = function(){
            me.setContext('transDataTypeChecked', ui.util.get('TransDataTypeNumber').getGroup().getValue());
            me.radioController();
        };
		
        me.radioController();
    },
	
    /**
     * radio框选择业务处理函数
     */
    radioController: function(){
        var me = this,
			G = baidu.G;
		
        if (me.getContext('transDataTypeChecked') == '0') { // 查看转化次数，显示 所属网站范围 选择转化名称
            G("TransNameTh").style.display = '';
            G("TransNameTd").style.display = '';
            G("SiteListTh").style.display = '';
            G("SiteListTd").style.display = '';
        } else { // 查看转化的点击和消费
            G("TransNameTh").style.display = 'none';
            G("TransNameTd").style.display = 'none';
            G("SiteListTh").style.display = 'none';
            G("SiteListTd").style.display = 'none';
        };
    },
  
  /*************************************网页转化数据 相关函数  END*************************************/ 
	
  /*************************************网站列表 相关函数  BEGIN*************************************/ 
  	
	addNewSite: function(){
		var me = this,
			inputId = ui.util.get("NewSite").main, 
			warnId = "NewTransDomainWarn",
			rootDomain = "";
		
		if(nirvana.trans.checkRootDomain(inputId, warnId) && !me.domainIsExist(inputId, warnId)){
			rootDomain = baidu.trim(inputId.value);
			fbs.trans.addSite({
				siteUrl: rootDomain,
				onSuccess: function(res){
					me.getSitesListData();
					ui.util.get("NewSite").setValue("");
					me.loadSiteListForSelect();
				},
				onFail: function(res){
					switch(res.errorCode.code){
						case 1563:
							baidu.g(warnId).innerHTML = nirvana.config.ERROR.TRANS.DOMAIN_NOT_FIT;
							baidu.removeClass(warnId, 'hide');
							break;
						case 1564:
							baidu.g(warnId).innerHTML = nirvana.config.ERROR.TRANS.DOMAIN_IS_EXIST;
							baidu.removeClass(warnId, 'hide');
							break;
						default:
							var err = nirvana.config.ERROR.TRANS[res.errorCode.code];
							if(typeof(err) != "undefined"){
								baidu.g(warnId).innerHTML = err;
								baidu.removeClass(warnId, 'hide');
							}else{
								ajaxFail();
							}
							break;
					}
				}
			})
		}
	},
	
	/**
	 * 域名是否已存在，存在返回true
	 * @param {Object} inputId
	 * @param {Object} warnId
	 */
	domainIsExist: function(inputId, warnId){
		var me = this,
		 	siteList = me.getContext('siteListSource'),
			rootDomain = baidu.encodeHTML(baidu.trim(inputId.value)),
			tempSite;
		for (var i = 0, l = siteList.length; i < l; i++) {
			tempSite = baidu.encodeHTML(siteList[i].site_url);
			if (tempSite.indexOf(rootDomain) >= 0 && rootDomain.indexOf(tempSite) >= 0) {
				baidu.g(warnId).innerHTML = nirvana.config.ERROR.TRANS.DOMAIN_IS_EXIST;
				baidu.removeClass(warnId, 'hide');
				return true;
			}
		}
		return false;
	},
	
    /**
     * 请求网站列表（转化跟踪工具-->网站列表）
     */
    getSitesList: function(){
        var me = this;
        
		fbs.trans.getLxbStatus({
			onSuccess: function(res){
				var status = +res.data,
					fields = baidu.object.clone(me.WEB_LIST_FIELDS),
					len = fields.length;
				if (status == 0 || status == 4 || status == 6 || status == 1000) {
					baidu.array.removeAt(fields, len - 2);
					baidu.array.removeAt(fields, len - 4);
					//详细设置链接不可点
					baidu.g("PhoneTransDetailSet").innerHTML = '<span class="gray">电话追踪详细设置>></span>';
				}
				else {
					baidu.array.removeAt(fields, len - 1);
					baidu.array.removeAt(fields, len - 5);
					//详细设置链接可点
					baidu.g("PhoneTransDetailSet").innerHTML = '<a href="' + LXB.LINK.HOME + nirvana.env.USER_ID + '" target="_blank" data-log=\'{target:"lxbDetailSet"}\'>电话追踪详细设置>></a>';
				}
			//	me.setContext('siteListFields', fields);
				me._controlMap.SiteListTable.fields = fields;
				me.getSitesListData();
			},
			onFail: function(res){
				ajaxFailDialog();
			}
		});
    },
	
	/**
	 * 发送请求
	 */
	getSitesListData: function(){
		var me = this;
		// 已配置不缓存
		fbs.trans.getSiteList({
			onSuccess: function(response){
				var data = response.data, totalNum = data.length;
				
				// 数据总数
				me.setContext('siteListTotalNum', totalNum);
				
				// 表格原始数据
				me.setContext('siteListSource', data);
				
				// 获取排序数据
				me.sortSiteList()();
			},
			onFail: function(){
				ajaxFailDialog();
			}
		});
		
	},
	
	
	/**
	 * 网站列表排序
	 */
	sortSiteList: function(){
		var me = this;
		
		return function(sortField) {
			var tableData = me.getContext('siteListSource'),
			    pageSize = me.getContext('pageSize'),
				table = me._controlMap.SiteListTable,
				order = table.order,
				field = table.orderBy;
			
			if (typeof(sortField) != 'undefined') {
				field = sortField.field;
			}
			
			if (field) {
				tableData = nirvana.displayReport.orderData(tableData, field, order);
			}
			me.setContext('siteListSource', tableData);
			me.getSiteListPerPage(1);
		};
	},
	
	
	/**
	 * 网站列表翻页
	 */
	siteListPageHandler : function() {
		var me = this;
		
		return function(value) {
			var pageSize = me.getContext('pageSize');
			
			me.getSiteListPerPage(value);
		};
	},
	
	/**
	 * 获取每页网站列表
	 */
	getSiteListPerPage : function(pageNo) {
		var me = this,
		    data = me.getContext('siteListSource'),
		    result = [],
			datasource,
			table = me._controlMap.SiteListTable,
			page = me._controlMap.SiteListPage,
			totalNum = me.getContext('siteListTotalNum'),
			totalPage,
			pageSize = me.getContext('pageSize');
		
		// 更新列表数量
		baidu.g('SiteListNum').innerHTML = totalNum;
		
		for (var i = 0, len = data.length; i < len; i++) {
			result[i] = data[i];
		}
		
		datasource = nirvana.util.getPageData(result, pageSize, pageNo);
		
		// 计算总页数
		totalPage = Math.ceil(totalNum / pageSize);
		page.page = pageNo;
		page.total = totalPage;
		page.render();
		
		table.datasource = datasource;
		table.render();
		if(!table.isBindHandler){
			me.bindSiteListTable();
			table.isBindHandler = true;
		}
	},
    
    /**
     * 绑定网站列表表格事件
     */
    bindSiteListTable: function(){
        var me = this,
			G = baidu.g,
			table = G("ctrltableSiteListTablebody");
        
		baidu.event.on(table, 'click', function(e){
            e = e || window.event;
            baidu.event.stopPropagation(e);
			
            var elm = baidu.event.getTarget(e);
			
            if (elm.tagName.toLowerCase() == 'a') {
                var arr = elm.getAttribute('href').split('#'),
					href = arr[arr.length - 1];
				
                switch (href) {
                    case 'getcode':
                        // 获取代码
						baidu.event.preventDefault(e);
                        me.getCode(elm);
                        break;
                    case 'checkAll':
                        // 全面检查
						baidu.event.preventDefault(e);
						// 首先卸载
						ToolsModule.unloadTrans('transcheck');
                        me.redirect('/tools/transcheck', {
							checkType : 1, // 转化跟踪URL
							siteid : elm.getAttribute('siteid'),
							tabId : 'TransTrackSetTab',
							level: 'SiteList'
						});
                        break;
                    case 'start':
                        // 启用
						baidu.event.preventDefault(e);
                        me.siteStatus(elm);
                        break;
                    case 'pause':
                        // 暂停
						baidu.event.preventDefault(e);
                        me.siteStatus(elm);
                        break;
                    case 'delete':
                        // 删除
						baidu.event.preventDefault(e);
                        me.delSite(elm);
                        break;
					case 'toTransList':
                        // 跳到转化列表
						baidu.event.preventDefault(e);
                        me.toTransList(elm);
                        break;
					case 'toNewTrans':
						//新增转化
						baidu.event.preventDefault(e);
						var arg = {
							tabId: "TransTrackSetTab",
							level: "SiteList",
							siteid: elm.getAttribute('siteid'),
							siteUrl: elm.getAttribute('site_url')
						};
						me.jumpToNewTrans(arg);
						break;
                    case 'startPhone':
                        // 启用电话追踪
						baidu.event.preventDefault(e);
                        me.sitePhoneStatus(elm);
                        break;
					case 'pausePhone':
                        // 暂停电话追踪
						baidu.event.preventDefault(e);
                        me.sitePhoneStatus(elm);
						break;
					case 'checkSingle':
						//检查单一网站
						baidu.event.preventDefault(e);
						me.checkSingle(elm);
						break;
                    default:
						break;
                }
            }
        });
    },
	
	
	/**
	 * 检查单一网站
	 * @param {Object} elm
	 */
	checkSingle:function(elm){
		var me = this,
			G = baidu.g,
			url = elm.getAttribute('url'),
			siteid = elm.getAttribute('siteid'),
			dom = G("siteStatus" + siteid);
		
		if (dom) {
			dom.innerHTML = "状态更新中";
			dom.className = "site-state-checking";
			fbs.trans.checkSingleUrl({
				siteid: siteid,
				url: url,
				onSuccess: function(data){
					if (dom && data.status == 200 && data.data) {
						dom.innerHTML = "代码安装正常";
						dom.className = "site-state-normal";
					}
				},
				onFail: function(data){
					if (dom) {
						dom.innerHTML = "未检测到代码";
						dom.className = "site-state-nocode";
					}
				}
			});
		}
		
	},

	
    /**
     * 删除指定网站（转化跟踪工具-->网站列表-->删除）
     */
    delSite: function(elm){
        var me = this,
			G = baidu.g;
		
		ui.Dialog.confirm({
			title: '删除网站',
			content: nirvana.config.TRANS.MESSAGE_SITE_DEL,
			onok: function(){
				var site_id = elm.getAttribute('site_id');
				
				// 已配置不缓存
				fbs.trans.delSite({
					siteid: site_id,
					onSuccess: function(response){
						me.getSitesListData();
						
						// 删除网站以后，设置转化数据列表所属网站为全部
						me.setContext('siteListOptionSelected', 0);
						me.setContext('siteListOptionSelectedB', 0);
						
						// 转化名称是否需要更新
						me.setContext('isTransNameRefresh', '1');
						
						me.loadSiteListForSelect();
						NIRVANA_LOG.send({
							target:"deleteSite"
						});
					},
					onFail: function(){
						ajaxFailDialog();
					}
				});
			},
			oncancel: function(){
			}
		});
    },
    
    /**
     * 暂停-启用网站（转化跟踪工具-->网站列表-->启用/暂停）
     */
    siteStatus: function(elm){
        var me = this,
			G = baidu.g,
			status = (elm.getAttribute('href').indexOf('#start') != -1) ? 0 : 1; // 包含#start，启用传0
		
		var fn = function() {
			var site_id = elm.getAttribute('site_id');
			
			// 已配置不缓存
			fbs.trans.siteStatus({
				status: status,
				siteid: site_id,
				onSuccess: function(response){
					me.getSitesListData();
				},
				onFail: function(){
					ajaxFailDialog();
				}
			});
		};
		
        if (status) { // 暂停
			ui.Dialog.confirm({
				title: '暂停网站跟踪',
				content: nirvana.config.TRANS.MESSAGE_SITE_PAUSE,
				onok: function(){
					fn();
				},
				oncancel: function(){
				}
			});
        } else { // 启用
			fn();
		}
        
    },
    
    /**
     * 暂停-启用电话追踪（转化跟踪工具-->网站列表-->启用/暂停）
     */
    sitePhoneStatus: function(elm){
        var me = this,
			G = baidu.g,
			status = (elm.getAttribute('href').indexOf('#startPhone') != -1) ? 0 : 1; // 包含#startPhone，启用传0
		
		var fn = function() {
			var site_id = elm.getAttribute('site_id'),
				siteUrl = elm.getAttribute('site_url');
			
			// 已配置不缓存
			fbs.trans.setPhoneTrackStatus({
				status: status,
				siteid: site_id,
				siteUrl: siteUrl,
				onSuccess: function(response){
					me.getSitesListData();
					NIRVANA_LOG.send({
							target:"setPhoneTrack",
							status: status
						});
				},
				onFail: function(){
					ajaxFailDialog();
				}
			});
		};
		
        if (status) { // 暂停
			ui.Dialog.confirm({
				title: '暂停电话追踪',
				content: nirvana.config.TRANS.MESSAGE_PHONE_PAUSE,
				onok: function(){
					fn();
				},
				oncancel: function(){
				}
			});
        } else { // 启用
			fn();
		}
        
    },
	
    /**
     * 获取代码（转化跟踪工具-->网站列表-->获取代码）
     */
    getCode: function(elm){
		var me = this,
			param = {
				siteid : elm.getAttribute('site_id'),
				site_url : elm.getAttribute('site_url'),
				action : me
			};
		
		nirvana.util.openSubActionDialog({
			id: 'GetCodeDialog',
			title: '获取代码',
			width: '540',
			actionPath: '/tools/translist/getcode',
			params: param,
			onclose: function(){
			}
		});
		return;
		
        fbs.trans.jsCode({
            siteid: site_id,
            onSuccess: function(response){
                var codeText = G('GetJsCodeContainerCodeTextarea');
                var codeTip = G('GetJsCodeContainerCopyComplete');
                codeText.value = response.data;
                var clip = new Swf({
                    "id": "ClipBtnHead",
                    "url": "./asset/swf/clipBtn.swf",
                    "width": 78,
                    "height": 22,
                    "instanceName": "instanceName",
                    "params": {
                        wmode: "transparent"
                    },
                    "vars": {
                        txt: "复制代码"
                    }
                });
                clip.appendTo(G('GetJsCodeContainerFlashCopyBtn'));
                clip.onsuccess = function(){
                    codeTip.innerHTML = "复制成功！";
                    setTimeout(function(){
                        codeTip.innerHTML = "";
                    }, 2000);
                };
                clip.onClip = function(){
                    codeText.select();
                    return codeText.value;
                };
                clip.onfail = function(){
                    codeTip.innerHTML = "复制失败！请重试！"
                };
            },
            onFail: function(){
                ajaxFailDialog();
            }
        });
    },
  
  /**************************************网站列表 相关函数  END*************************************/ 
	
  /**************************************转化列表 相关函数  BEGIN*************************************/ 
  
    /**
     * 获取某个网站转化路径列表
     */
    getTransList: function(){
        var me = this;
        
		// 已配置不缓存
        fbs.trans.getTransList({
            onSuccess: function(response){
				var data = response.data,
					totalNum = data.length;
				
				// 清空排序
				//ui.util.get('TransListTable').orderBy = '';
				
				// 数据总数
				me.setContext('transListTotalNum', totalNum);
				
				// 表格原始数据
				me.setContext('transListSource', data);
				
				// 获取排序数据
				me.sortTransList()();			
            },
            onFail: function(){
                ajaxFailDialog();
            }
        });
    },
	
	
	/**
	 * 转化列表排序
	 */
	sortTransList: function(){
		var me = this;
		
		return function(sortField) {
			var tableData = me.getContext('transListSource'),
			    pageSize = me.getContext('pageSize'),
				table = me._controlMap.TransListTable,
				order = table.order,
				field = table.orderBy;
			
			if (typeof(sortField) != 'undefined') {
				field = sortField.field;
			}
			
			if (field) {
				tableData = nirvana.displayReport.orderData(tableData, field, order);
			}
			me.setContext('transListSource', tableData);
			me.getTransListPerPage(1);
		};
	},
	
	
	/**
	 * 转化列表翻页
	 */
	transListPageHandler : function() {
		var me = this;
		
		return function(value) {
			var pageSize = me.getContext('pageSize');
			
			me.getTransListPerPage(value);
		};
	},
	
	/**
	 * 获取每页转化数据
	 */
	getTransListPerPage : function(pageNo) {
		var me = this,
		    data = me.getContext('transListSource'),
		    result = baidu.object.clone(data),
			datasource,
			table = me._controlMap.TransListTable,
			page = me._controlMap.TransListPage,
			totalNum,
			totalPage,
			pageSize = me.getContext('pageSize');
		
		
		result = me.filterTransList(result);
		
		datasource = nirvana.util.getPageData(result, pageSize, pageNo);
		
		totalNum = result.length;
		
		// 更新列表数量
		baidu.g('TransListNum').innerHTML = totalNum;
		
		// 计算总页数
		totalPage = Math.ceil(totalNum / pageSize);
		page.page = pageNo;
		page.total = totalPage;
		page.render();
	
		table.fields = me.TRANS_LIST_FIELDS;
		table.datasource = datasource;
		table.render();
		if (!table.isBindHandler) {
			// 绑定转化列表表格事件
			me.bindTransListTable();
			table.isBindHandler = true;
		}
	},
	
	/**
	 * 本地筛选转化列表
	 */
	filterTransList : function(data) {
		var me = this,
			siteid = me.getContext('siteListOptionSelectedB'),
			tmp = [],
			i,
			len = data.length;
		
		if (siteid == 0) {
			return data;
		}
		
		for (i = 0; i < len; i++){
			if (data[i].siteid == siteid){
				tmp.push(data[i]);
			}
		}
		
		return tmp;
	},
    
    /**
     * 绑定转化列表表格事件
     */
    bindTransListTable: function(){
        var me = this,
			G = baidu.g,
			table = G("ctrltableTransListTablebody");
		
        baidu.event.on(table, 'click', function(e){
            e = e || window.event;
            baidu.event.stopPropagation(e);
			
            var elm = baidu.event.getTarget(e);
			
            if (elm.tagName.toLowerCase() == 'a') {
				//没有数据，提示中”新增转化“
				if(baidu.dom.hasClass(elm, "addTransBtnInline")){
					me.jumpToNewTrans({
								tabId: "TransTrackSetTab",
								level:"TransList",
								siteid:me.getContext('siteListOptionSelectedB')
							});
					return ;
				}
				
				var arr = elm.getAttribute('href').split('#'),
					href = arr[arr.length - 1];
				
                switch (href) {
                    case 'check':
                        // 检查代码
						baidu.event.preventDefault(e);
						ToolsModule.unloadTrans('transCheckSingle');
                        me.redirect('/tools/transCheckSingle', {
							matchType: 0,
							siteid: elm.getAttribute('site_id'),
							url: elm.getAttribute('url'),
							tabId: "TransTrackSetTab",
							level: "TransList"
						});
                        break;
                    case 'start':
                        // 启用
                        baidu.event.preventDefault(e);
                        me.transStaus(elm);
                        break;
                    case 'pause':
                        // 暂停
                        baidu.event.preventDefault(e);
                        me.transStaus(elm);
                        break;
                    case 'modify':
                        // 修改
                        baidu.event.preventDefault(e);
                        me.modifyTrans(elm);
                        break;
                    case 'delete':
                        // 删除
                        baidu.event.preventDefault(e);
                        me.delTrans(elm);
                        break;
                    default:
                }
            }
        });
    },
    
    /**
     * 显示修改转化路径面板并挂载事件
     */
    modifyTrans: function(elm){
		var me = this,
			param = {
				siteid : elm.getAttribute('siteid'),
				transid : elm.getAttribute('transid'),
				siteUrl : elm.getAttribute('siteUrl'),
				name : elm.getAttribute('name'),
				step_url : elm.getAttribute('step_url'),
				step_type : elm.getAttribute('step_type'),
				action : me
			};
		
		nirvana.util.openSubActionDialog({
			id: 'TransModifyDialog',
			title: '修改转化',
			width: '650',
			actionPath: '/tools/translist/transmodify',
			params: param,
			onclose: function(){
			}
		});
    },
    
    /**
     * 开启/暂停：：转化路径
     */
    transStaus: function(elm){
        var me = this,
			status = (elm.getAttribute('href').indexOf('#start') != -1) ? 0 : 1; // 包含#start，启用传0
		
		var fn = function(){
			var trans_id = elm.getAttribute('trans_id');
			// 已配置不缓存
			fbs.trans.setTransStaus({
				status: status,
				transid: trans_id,
				onSuccess: function(response){
					me.getTransList();
				},
				onFail: function(){
					ajaxFailDialog();
				}
			});
		};
		
        if (status) { // 暂停
			ui.Dialog.confirm({
                title: '提醒',
                content: nirvana.config.TRANS.MESSAGE_TRANS_PAUSE,
                onok: function(){
					fn();
				},
                oncancel: function(){
                }
            });
        } else { // 启用
			fn();
		}
    },
    
    /**
     * 删除转化路径
     */
    delTrans: function(elm){
        var me = this;
		
		ui.Dialog.confirm({
                title: '提醒',
                content: nirvana.config.TRANS.MESSAGE_TRANS_DEL,
                onok: function(){
					var trans_id = elm.getAttribute('trans_id');
					
					// 已配置不缓存
					fbs.trans.delTrans({
						transid: trans_id,
						onSuccess: function(response){
							me.getTransList();
						},
						onFail: function(){
							ajaxFailDialog();
						}
					});
				},
                oncancel: function(){
                }
            });
    },
  
  /**************************************网站列表 相关函数  END*************************************/ 
	
  /**************************************tab相关函数  BEGIN*************************************/  
		
	/**
	 * 初始化tab
	 */
	initTab : function() {
		var me = this,
			tabId = me.arg.tabId;
		
		if (typeof(tabId) == 'undefined') {
			// 默认为转化数据tab
			tabId = 'PhoneTransDataTab';
		}
		
		me.showTabHandle(tabId);
	},
	
	
	    
    /**
     * 绑定顶部菜单切换
     */
    bindMenuTab: function(){
        var me = this,
			tabList = baidu.dom.q('tab', baidu.g('TransListContainer'), 'a');
		
        for (var i = 0, n = tabList.length; i < n; i++) {
            tabList[i].onclick = function(e){
                e = e || window.event;
                baidu.event.preventDefault(e);
				
                me.showTabHandle(this);
				
            };
            tabList[i].onfocus = function(){
                this.blur();
            };
        }
    },
	

	/**
	 * 跳转到转化列表
	 * @param {Object} elm	网站列表中表格中显示的“n个转化目标”
	 */
	toTransList : function(elm) {
		var me = this,
			siteid = elm.getAttribute('siteid');
		
		me.setContext('siteListOptionSelectedB', siteid);
		ui.util.get('SiteListSelectB').setValue(siteid);
		me.arg.level = "TransList";
		me.arg.siteid = siteid;
		me.showTabHandle('TransTrackSetTab');
	},
	

	/**
	 * tab菜单切换事件处理器	
	 * @param {Object} curTab 当前需要显示的tab对象
	 */
    showTabHandle: function(curTab){
        var me = this,
			targetId = typeof(curTab) == "string" ? curTab : curTab.id;
			curTab = baidu.g(targetId);
		if(targetId == "TransTrackSetTab"){
			me.showTransTrackSetTab(curTab);
		}else{
			me.showTransDataTab(curTab);
		}
    },
	
	/**
	 * tab菜单切换到转化跟踪设置上
	 * @param {Object} curTab
	 */
	showTransTrackSetTab: function(curTab){
		var me = this, 
			G = baidu.g, 
			tabList = baidu.dom.q('tab', baidu.G('TransListContainer'), 'a'), 
			tabTarget = curTab.getAttribute('href');

		for (var i = 0, n = tabList.length; i < n; i++) {
			var aBtn = tabList[i], 
				arr = aBtn.getAttribute('href').split('#'), 
				target = arr[arr.length - 1], //模块名，用于构建tab、area模块id的prefix
 				area;
			if (aBtn != curTab) {
				baidu.removeClass(aBtn, "selected");
				area = G(target + 'Area');
				area.style.display = "none";
			}
			else {
				me.showTransListOrSiteList(curTab, target);
			}
		}
	},
	
	/**
	 * 转化跟踪设置tab下有转化列表和网页列表两个页面
	 * @param {Object} curTab
	 */
	showTransListOrSiteList: function(curTab, target){
		var me = this, 
			G = baidu.g,
			level = me.arg.level, 
			sltarea = G('SiteListArea'), 
			tltarea = G('TransListArea');
		baidu.addClass(curTab, "selected");
		level = level || target;
		if (level == "SiteList") {
			sltarea.style.display = "block";
			tltarea.style.display = "none";
			me.getSitesList();
		}
		if (level == "TransList") {
			sltarea.style.display = "none";
			tltarea.style.display = "block";
			var siteid = me.arg.siteid;//新增转化后代入该转化所属siteid
			if (siteid) {
				me.setContext('siteListOptionSelectedB', siteid);
				ui.util.get('SiteListSelectB').setValue(siteid);
			}
			me.getTransList();
		}
		me.arg.level = null;
	},
	
	/**
	 * tab菜单切换到转化数据列表（电话和网页）上
	 * @param {Object} curTab
	 */
	showTransDataTab: function(curTab){
		var me = this, 
			G = baidu.g, 
			tabList = baidu.dom.q('tab', baidu.G('TransListContainer'), 'a'), 
			tabTarget = curTab.getAttribute('href');
		for (var i = 0, n = tabList.length; i < n; i++) {
			var aBtn = tabList[i], 
				arr = aBtn.getAttribute('href').split('#'), 
				target = arr[arr.length - 1], //模块名，用于构建tab、area模块id的prefix
 				area;
			if (aBtn == curTab) {
				baidu.addClass(aBtn, "selected");
				area = G(target + 'Area');
				area.style.display = "block";
			}
			else {
				baidu.removeClass(aBtn, "selected");
			}
		}
		G('SiteListArea').style.display = "none";
		G('TransListArea').style.display = "none";
		if (tabTarget.indexOf('#PhoneTransData') != -1) { // 电话转化数据
			G("WebTransDataArea").style.display = "none";
			me.loadPhoneTransData();
		}
		if (tabTarget.indexOf('#WebTransData') != -1) { // 网页转化数据
			G("PhoneTransDataArea").style.display = "none";
		//	me.loadTransData();
		}
	}
	
  /**********************************tab相关函数 END**********************************/  
});
