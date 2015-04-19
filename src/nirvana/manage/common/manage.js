/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    manage/manage.js
 * desc:    推广管理部分业务公用函数
 * author:  tongyao
 * date:    $Date: 2011/01/06 $
 */
nirvana.manage = nirvana.manage || {};
nirvana.manage = {
    //计划推广设备编码配置
    devicePrefer:{
        '0':'all',
        '1':'pc',
        '2':'mobile'
    },
	//每页显示数量
	pagesize : 50,
	
	//可选每页显示数量
	sizeOption:[{
                    text: '20条',
                    value: '20'
                }, {
                    text: '50条',
                    value: '50'
                },{
                    text: '100条',
                    value: '100'
                }],
                
	//table排序参数			
	orderParam: {
		sortField:'shows',
		sortOrder: 'desc'
	},

	/**
	 *全投历史记录下载
	 */ 
	allDeviceHisDownLoad : function() {
		var href = nirvana.env.canDownLoadMoveHis;
		if(typeof href != 'undefined' 
		   && href != '0'   //0代表没权限
		   && nirvana.manage.allDeviceHisCloseClick == false){//用户没点击过关闭
		    baidu.g('downLoadDeviceChangeLink').href = href;
		    baidu.removeClass(baidu.g('downLoadDeviceChange'),'hide');
		    baidu.on("his-dialog-close", "click", function() {
			    baidu.addClass(baidu.g('downLoadDeviceChange'), 'hide');
		        nirvana.manage.allDeviceHisCloseClick = true;//点击过关闭，在别的action加载的时候不再出现该浮层
		   });
		}
		
		
	},
	
	//是否点击了搬家历史记录浮层的关闭
    allDeviceHisCloseClick :false,
    
    /**
	 * 设置计划面包屑的出价比例的显示与隐藏
	 * @param {Object} action 调用该函数的action
	 * @author yanlingling@baidu.com
	 */
    setMPriceFactor :function(action){
    	var me = action;
    	var device = me.getContext('plan_deviceprefer');
			if(device == 0){//全部设备的时候  显示出价比
			    baidu.removeClass(baidu.g('mprice-factor'),'hide');	
			}
			else{
				baidu.addClass(baidu.g('mprice-factor'),'hide');
			}
    } ,
    
    /**
     *处理修改出价的时候 出价比例是否显示 用于批量修改关键词出价，单元出价，新建关键词
     * @param {object} arg 参数
     * 示例{
     * 	showmPriceFactor:true,是否显示出价比例提示
     *  planids:['123','145'] 当前操作关联的id
     * }
     */
    handleMpriceFactorShow: function(arg){
    	var me = this;
    	if(arg.showmPriceFactor) {
			if(arg.mPriceFactor) {
				me.showMpriceFactor(me.arg.mPriceFactor);
			} 
			else if(arg.planids) {
				var planids = baidu.array.unique(arg.planids);
				if(planids.length != 1) {//多个计划的时候 ，出价比不同
					me.showMpriceFactor('<span class="gray"><各异></span>');
				} 
				else {
					var param = {};
					param.condition = {
						planid : planids
					};
					param.onSuccess = function(data) {
						var result = data.data.listData[0];
						var mPriceFactor = result.mPriceFactor;
						var deviceprefer = result.deviceprefer;
						if(deviceprefer == '0') {//全部设备的时候现实出价比例，否则不显示
							me.showMpriceFactor(mPriceFactor);
						}
						else{
							me.hideMpriceFactor(mPriceFactor);
						}

						//me.modBid(bid,winfoid,parent,devicePrefer,mPriceFactor,nav);
					}
					fbs.plan.getPreferAndFactor(param);

				}

			} 
			else {
				alert('参数传错了，当showmPriceFactor为true的时候，传入出价比例，或者planids')

			}

		}
    },
    
    /**
     *显示出价比例提示
     * @param {integer|string} mPriceFactor 出价比例值 
     */
    showMpriceFactor : function(mPriceFactor){
		baidu.g('mprice-factor-intip').innerHTML = mPriceFactor;
		baidu.removeClass(baidu.g('mprice-tip-block'), 'hide');
		ui.Bubble.init();
			//显示
	},

	/**
     *隐藏出价比例提示
     * @param {integer|string} mPriceFactor 出价比例值 
     */
    hideMpriceFactor : function(){
		
		baidu.addClass(baidu.g('mprice-tip-block'), 'hide');
		//baidu.g('mprice-factor-intip').innerHTML = '';
		//ui.Bubble.init();
			//显示
	},
	
	/**
	 * 存储推广管理的日历时间（日历控件onselect时调用）
	 * @param {Object} dateValueOrOption
	 * @author tongyao@baidu.com
	 */
	setStoredDate : function(dateValueOrOption){
		var data = baidu.json.stringify(dateValueOrOption);
		FlashStorager.set('manage_calendar', data);
	},
	
	/**
	 * 改变全局时间，影响Action，目前仅写了修改成最近7天，后续自己加吧
	 * @param {Object} specify
	 * @author linzhifeng@baidu.com
	 */
	changeActionStoredDate : function(me,specify){
		var lastStartDate,latEndDate;
		if (specify == 7){
			var lastStartDate = me.getContext('startDate'),
			    latEndDate = me.getContext('endDate'),
			    last7Day = {};
			last7Day.begin = new Date((nirvana.env.SERVER_TIME - 7 * 24 * 3600) * 1000);
			last7Day.end = new Date((nirvana.env.SERVER_TIME - 1 * 24 * 3600) * 1000);	
			me.setContext('startDate', baidu.date.format(last7Day.begin, 'yyyy-MM-dd'));
			me.setContext('endDate', baidu.date.format(last7Day.end, 'yyyy-MM-dd'));
			me.setContext('dateRange', last7Day);
			nirvana.manage.setStoredDate(last7Day);
			return (lastStartDate != me.getContext('startDate') || latEndDate != me.getContext('endDate'));
		}
	},
	
	/**
	 * 读取有本地存储的日历时间（各action的context_initer_map中调用）
	 */
	getStoredDate : function(miniOption){
		return function(callback){
		    var me = this,
			startDate = me.getContext('startDate'),
			endDate = me.getContext('endDate');
			me.setContext("miniOption",miniOption);
        if(startDate){  //如果context里有起始日期，则使用
            me.setContext('dateRange', {
                begin: baidu.date.parse(startDate),
                end: baidu.date.parse(endDate)
            });
            callback();
        } else {    //如果context里没有起始日期，读取默认的
            //读取本地存储
            FlashStorager.get('manage_calendar', function(data){
                if(!data){  //如果本地存储里没有数据
                    //默认昨天
                    startDate = endDate = new Date((nirvana.env.SERVER_TIME - 1 * 24 * 3600) * 1000);   
                    
                    me.setContext('startDate', baidu.date.format(startDate, 'yyyy-MM-dd'));
                    me.setContext('endDate', baidu.date.format(endDate, 'yyyy-MM-dd'));
                    
                    me.setContext('dateRange', {
                        begin: startDate,
                        end: endDate
                    });
                    callback();
                } else {    //本地存储有数据
                    data = baidu.json.parse(data);
                    var dateRange;
                    
                    if(typeof data == 'object'){
                        if (data.begin == '' && data.end == '') {
                            dateRange = {
                                begin: '',
                                end: ''
                            };
                        } else {
                            dateRange = {
                                begin: baidu.date.parse(data.begin),
                                end: baidu.date.parse(data.end)
                            };
                        }
                        me.setContext('dateRange', dateRange);
                    } else {    //快捷方式数据
                        dateRange = nirvana.util.dateOptionToDateValue(data);
                        me.setContext('dateRange', dateRange);
                    }
                    
                    if (dateRange.begin == '' && dateRange.end == '') {
                        me.setContext('startDate', '');
                        me.setContext('endDate', '');
                    } else {
                        me.setContext('startDate', baidu.date.format(dateRange.begin, 'yyyy-MM-dd'));
                        me.setContext('endDate',  baidu.date.format(dateRange.end, 'yyyy-MM-dd'));
                    }
                    
                    callback();
                }
            });
        }
			}
		
	},
	
	
	/**
	 * 获取各物料状态集
	 * @param {Object} type 物料类型
	 * @author zhouyu01@baidu.com
	 */
	getStatusSet : function(type){
		var status = {}, 
            set = [{
                text : "全部状态",
                value : 100
            }];
		switch(type){
			case "plan" : 
				status = STATE_LIST.PLAN_A;
				break;
			case "unit" : 
				status = STATE_LIST.UNIT_A;
				break;
			case "keyword" : 
				status = STATE_LIST.WORD_A;
				break;
			case "idea" : 
				status = STATE_LIST.IDEA_A;
				break;
			case "appendIdea" : 
				status = STATE_LIST.APPEND_IDEA_A;
				break;
			case 'appIdea'   :
			    status = STATE_LIST.APP_IDEA_A;
			    break;
		}

		set = set.concat(status);
		return set;
	},
	
	/**
	 * table的onsort接口， 用于各物料排序
	 * @param {Object} datalist 需要排序的数据
	 * @param {Object} field	排序字段
	 * @param {Object} order	升序or降序
	 * @author zhouyu01@baidu.com
	 */
	orderData: function(datalist, field, order){
		if (!field || !order || datalist.length <= 1) {
			return datalist;
		}
		if(field=='appendIdeastat'){//附加创意的时候，接口很重要啊 ！！
		  field = 'stat';
		}
        var func = new Function(),
		    sortField = field || '';
		
        nirvana.manage.orderParam.sortField = sortField;
		 // 修改一下逻辑，默认按数字排序，写这么大段累不累啊。。。by zhujialu
		switch (sortField) {
			case 'date':
			case 'account':
			case 'showword':
			case 'unitname':
			case 'planname':
			case 'foldername':
			case 'word':
			case 'optname':		//历史操作查询
			case 'opttime':		//历史操作查询
			case 'levelkey':	//历史操作查询
			case 'reportname':	//数据报告
			case 'timerange':	//数据报告
				func = (order == 'desc') ? nirvana.manage.sort.wordDESC : nirvana.manage.sort.wordASC;
				break;

            case 'createtime'://数据报告
            case 'apimodtime'://app中的最近更新时间
				func = (order == 'desc') ? nirvana.manage.sort.timeDESC : nirvana.manage.sort.timeASC;
				break;
            
            /*
			case 'levelkey':	//历史操作查询
				func = (order == 'desc') ? nirvana.manage.sort.wordDESCLevelkey : nirvana.manage.sort.wordASCLevelkey;
				break;
			*/

            default:
				func = (order == 'desc') ? nirvana.manage.sort.numDESC : nirvana.manage.sort.numASC;
				break;
		}
		datalist.sort(func);
		return datalist;
	},
	
	/**
	 * 日历选择包含当天日期，用于判断展现（shows）和转化（trans）的显示
	 * @param {Object} action
	 * @return {Boolean}
	 */
	hasToday : function(action) {
		var me = action,
			startDate = me.getContext('startDate'),
			endDate = me.getContext('endDate'),
			serviceTime = new Date(nirvana.env.SERVER_TIME * 1000),
			nowDate = baidu.date.format(serviceTime, 'yyyy-MM-dd');
		
		if (startDate == '' && endDate == '') { // 选择全部时间
			return true;
		}
		
		if (endDate == nowDate) { // 代表选择了当天
			return true;
		}
		
		return false;
	},
	
	/**
	 * 修改推广管理的path和action的配置
	 * author yanlingling@baidu.com
	 */
	setPathConfig : function(path,action){
		var actionConfig = nirvana.managePathConfig.action;
		var item = {};
			item.path = path;
			item.action = action;
		var index = baidu.array.indexOf(actionConfig,function(value){
			if(value.path == path){
				return true;
			}
		});
		if(index == -1){//还没有改路劲的配置，直接加进去
			
			actionConfig.push(item)
		}
		else{
			var item = actionConfig[index];
			item.action = action;
		}
	},
	/**
	 * 排序方法
	 * @author zhouyu01@baidu.com
	 */
	sort: {
		wordASC: function(a, b){
			a = a[nirvana.manage.orderParam.sortField] || '';
			b = b[nirvana.manage.orderParam.sortField] || '';
			if(a == '每周'&& b == '每月初'){
				return -1
			}else if(b == '每周'&& a == '每月初'){
				return 1
			}
			return a.localeCompare(b);
		},
		
		wordDESC: function(a, b){
			return nirvana.manage.sort.wordASC(a, b) * (-1);
		},
		
		wordASCLevelkey: function(a, b){
			var aHead = '',
			    bHead = '';
			switch (a.optlevel + ''){
				case '3': aHead = '账户'; break;
				case '2': aHead = '计划'; break;
				case '1': aHead = '单元'; break;
				case '5': aHead = '关键词';	break;
				case '4': aHead = '创意'; break;
			}
			switch (b.optlevel + ''){
				case '3': bHead = '账户'; break;
				case '2': bHead = '计划'; break;
				case '1': bHead = '单元'; break;
				case '5': bHead = '关键词';	break;
				case '4': bHead = '创意'; break;
			}
			a = aHead + (a[nirvana.manage.orderParam.sortField] || '');
			b = bHead + (b[nirvana.manage.orderParam.sortField] || '');
			return a.localeCompare(b);
		},
		
		wordDESCLevelkey: function(a, b){
			return nirvana.manage.sort.wordASCLevelkey(a, b) * (-1);
		},
		
		numASC: function(a, b){
			var field = nirvana.manage.orderParam.sortField;
			if (field == "bid") {
				a = a[field] ? +a[field] : +a["unitbid"];
				b = b[field] ? +b[field] : +b["unitbid"];
			}
			else {
				a = a[field];
				b = b[field];
				a = a == '-' ? a : +a;
				b = b == '-' ? b : +b;
			}	
			
			if (a != '-' && b != '-') {
				if (a > b) {
					return 1
				}
				else 
					if (a < b) {
						return -1;
					}
					else {
						return 0;
					}
			}
			else {
				if (a == '-' && b == '-') {
					return 0;
				}
				else {
					if (a == '-') {
						return -1;
					}
					else {
						return 1;
					}
				}
			}
		},
		
		numDESC: function(a, b){
			return nirvana.manage.sort.numASC(a, b) * (-1);
		},

        // 比较百分数
        numPercentASC: function(a, b){
            var field = nirvana.manage.orderParam.sortField;
            a = a[field];
            b = b[field];
            a = a == '-' ? a : parseFloat(a);
            b = b == '-' ? b : parseFloat(b);
            
            if (a != '-' && b != '-') {
                if (a > b) {
                    return 1
                }
                else 
                    if (a < b) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
            }
            else {
                if (a == '-' && b == '-') {
                    return 0;
                }
                else {
                    if (a == '-') {
                        return -1;
                    }
                    else {
                        return 1;
                    }
                }
            }
        },
        
        numPercentDESC: function(a, b){
            return nirvana.manage.sort.numPercentASC(a, b) * (-1);
        },
		
		timeASC : function(a,b){
			var field = nirvana.manage.orderParam.sortField;
			var a1 = a[nirvana.manage.orderParam.sortField]||'',		
				b1 = b[nirvana.manage.orderParam.sortField]||'';		
			a1 = baidu.date.parse(a1);
			b1 = baidu.date.parse(b1);
			if(a1 > b1){
				return 1;
			}else{
				if (a1 < b1) {
						return -1;
					}
					else {
						return 0;
					}
			}
		},
		timeDESC : function(a,b){
			return nirvana.manage.sort.timeASC(a, b) * (-1);
		}
	},
	
	//缩略写法
	abbNumber: function(data, isInt){
	    data = data - 0;
		return data >= 1000000 ? (Math.round(data/10000) + "万") : (isInt? Math.round(data) :data.toFixed(2));
	},

	// add by LeoWang(wangkemiao@baidu.com)
	//根据不同层级，切换一次性显示的周预算新功能提示代码
	switchBudgetBubble : function(target){
		var me = target;
		// 自动展现的周预算新功能提示
		if(me.getContext('navLevel') == 'account'){
			if(baidu.g('modifyAcctBudget')){
				baidu.g('modifyAcctBudget').innerHTML = '修改';
				ui.Bubble.init();
			}
		}
		else if(me.getContext('navLevel') == 'plan'){
			if(baidu.g('modifyAcctBudget')){
				baidu.g('modifyAcctBudget').innerHTML = '修改';
			}
		}
		if(baidu.g('modifyPlanBudget')){
			baidu.g('modifyPlanBudget').innerHTML = '修改';
		}
	},
	//add ended
    
    /**
     * 获取新建账户状态
     * @param {Object} callback
     */
    getUserType : function(action, callback) {
        var me = action;
        
        // if (nirvana.env.EXP == '7240') {// 新户转全 10.31
            fbs.eos.getUserType({
                onSuccess: function(response){
                    var data = response.data;
                    
                    me.setContext('userType', data);
                    nirvana.env.IS_NEW_USER = (data == 0);
                    
                    // 新账户
                    if (data == 0) {
                        fbs.eos.taskstatus({
                            onSuccess: function(response){
                                var taskstate = response.data.taskstate;
                                
								me.setContext('taskState', taskstate);
                                callback();
                            },
                            onFail: function(response){
                                ajaxFailDialog();
                                callback();
                            }
                        });
                        
                        // 新建账户
                        me.setContext('tasktype', 'useracct');
                    } else {
                        // 新建计划
                        me.setContext('tasktype', 'planinfo');
                        callback();
                    }
                },
                onFail: function(response){
                    ajaxFailDialog();
                    callback();
                }
            });
        // } else {// 新户转全 10.31
        //     callback();// 新户转全 10.31
        // }// 新户转全 10.31
    },
    
    /**
     * 快速新建进一步处理noDataHtml，四个列表页公用
     * @param {Object} callback
     */
    noDataHtmlPlus : function(action) {
        var me = action,
		    userType,
			taskState;
        
        // if (nirvana.env.EXP == '7240') {// 新户转全 10.31
			userType = me.getContext('userType');
			
			// 新账户
			if (userType == 0) {
				me.setContext('noDataHtml', '<div class="nodata"><a id="GotoEos" href="#">开始快速新建账户</a></div>');
				
				taskState = me.getContext('taskState');
				
				switch (+taskState) {
					case 1:
					case 2:
					case 3:
					case 6:
					case 7:
						// 没有物料时，只有新建账户进度，所以这里不会出现新建计划进度
						me.setContext('noDataHtml', '<div class="nodata"><a id="GotoEos" href="#">查看快速新建账户进度</a></div>');
						break;
				}
			}
		// }// 新户转全 10.31
    },
	
	/**
	 * 快速新建noDataHtml绑定点击事件
	 * @param {Object} action
	 */
	noDataHtmlClick : function(action) {
		// 只要按钮存在，则绑定事件，避免版本依赖
		if (baidu.g('GotoEos')) {
			baidu.g('GotoEos').onclick = function(){
				nirvana.quicksetup.show({
					type : action.getContext('tasktype'),
					entrance : 2
				});
				return false;
			};
		}
	},

	/**
	 * 修改计划地域
	 * @param {Object} planid 计划id
	 * @param {Object} wregion 原始地域数据
	 * @author zhouyu
	 */
	modPlanRegion: function(planid, wregion){
		nirvana.util.openSubActionDialog({
			id: 'planRegionDialog',
			title: '计划推广地域',
			width: 440,
			actionPath: 'manage/region',
			params: {
				type: "plan",
				planid: planid,
				wregion: wregion
			},
			onclose: function(){
			
			}
		});
		clearTimeout(nirvana.subaction.resizeTimer);
		baidu.g('ctrldialogplanRegionDialog').style.top = baidu.page.getScrollTop() + 135 +'px';
	},
	
	/**
	 * 修改计划否定关键词
	 * @param {Object} planid 计划id
	 * @author zhouyu
	 */
	modPlanNeg: function(planid){
		nirvana.util.openSubActionDialog({
			id: 'negatSetDialog',
			title: '否定关键词',
			width: 440,
			actionPath: 'manage/negative',
			params: {
				type: "plan",
				planid: planid
			},
			onclose: function(){
			//	fbs.material.clearCache("planinfo");
			//	fbs.plan.getInfo.clearCache();
				er.controller.fireMain('reload', {});
			}
		});
	},
	
	/**
	 * 修改单元否定关键词
	 * @param {Object} unitid 单元id
	 * @author zhouyu
	 */
	modUnitNeg: function(unitid){
		nirvana.util.openSubActionDialog({
			id: 'negatSetDialog',
			title: '否定关键词',
			width: 440,
			actionPath: 'manage/negative',
			params: {
				type: "unit",
				unitid: unitid
			},
			onclose: function(){
			//	fbs.material.clearCache("unitinfo");
			//	fbs.unit.getInfo.clearCache();
				er.controller.fireMain('reload', {});
			}
		});
	},
	
	/**
	 * 修改推广时段
	 * @param {Array} planid 计划id
	 * @param {Object} schedule 推广时段
	 * @author zhouyu
	 */
	modPlanSchedule: function(planid,schedule){
        // 老的时段修改：Deleted by Wu Huiyao
		/*nirvana.util.openSubActionDialog({
			id: 'planScheduleDialog',
			title: '修改推广时段',
			width: 660,
			actionPath: 'manage/planSchedule',
			params: {
				planid: planid,
				scheduleValue: schedule
			},
			onclose: function(){
			
			}
		});*/

        // 新的时段修改: Added by Wu Huiyao
        var dlg = new nirvana.ScheduleDlg();
        dlg.onSuccess = function() {
            er.controller.fireMain('reload', {});
        };
        dlg.show({
            planIds: planid,
            scheduleValue: schedule
        });
	},
	
	
	
	/**
	 * 物料层级打开dialog弹框
	 * @author zhouyu01@baidu.com
	 */
	setModDialog: function(me){
		var This = this;
		//修改账户地域
		if(baidu.g('modifyAcctRegion')){
			baidu.g('modifyAcctRegion').onclick = function(){
				nirvana.util.openSubActionDialog({
					id : 'accountRegionDialog',
					title : '账户推广地域',
					width : 440,
					actionPath : 'manage/region',
					params : {
						type:"account",
						wregion:me.getContext("wregion")
					},
					onclose : function(){
						
					}
				});
				clearTimeout(nirvana.subaction.resizeTimer);
				baidu.g('ctrldialogaccountRegionDialog').style.top = baidu.page.getScrollTop() + 135 +'px';
				return false;
			};
		}
		//修改计划地域
		if(baidu.g('modifyPlanRegion')){
			baidu.g('modifyPlanRegion').onclick = function(){
				var planid = [me.getContext("planid")],
					wregion = me.getContext("wregion");
				This.modPlanRegion(planid,wregion);
				
				return false;
			};
		}
		//修改激活时长设置
		if(baidu.g("acctSetMore")){
			baidu.g('acctSetMore').onclick = function(){
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
				return false;
			};
		}
		
		//设置计划否定关键词
		if(baidu.g("modifyPlanNegat")){
			baidu.g('modifyPlanNegat').onclick = function(){
				var planid = [me.getContext("planid")];
				This.modPlanNeg(planid);
				
				return false;
			};
		}
		//设置单元否定关键词
		if(baidu.g("modifyUnitNegat")){
			baidu.g('modifyUnitNegat').onclick = function(){
				var unitid = [me.getContext("unitid")];
				This.modUnitNeg(unitid);
				
				return false;
			};
		}
		//新建计划
		if(me._controlMap.addplan){
			me._controlMap.addplan.onclick = function(){
				nirvana.util.openSubActionDialog({
					id: 'createPlanDialog',
					title: '新建推广计划',
					width: 440,
					actionPath: 'manage/createPlan',
					params: {},
					onclose: function(){
						
					}
				});
			};
		}
		//修改计划基本设置
		if(baidu.g("planSetMore")){
			baidu.g('planSetMore').onclick = function(){
				nirvana.util.openSubActionDialog({
					id: 'planSetDialog',
					title: '计划其他设置',
					width: 440,
					actionPath: 'manage/planBaseSet',
					params: {
						planid:[me.getContext("planid")]
					},
					onclose: function(){
					//	fbs.plan.getInfo.clearCache();//清除cache
						er.controller.fireMain('reload', {});
					}
				});
				
				return false;
			};
		}
		
		//修改计划关键词移动出价比 yanlingling
		if(baidu.g("modifyMPriceFactor")){
			baidu.g('modifyMPriceFactor').onclick = function(){
				nirvana.util.openSubActionDialog({
					id: 'mPriceFactorSetDialog',
					title: '移动设备投放价格',
					width: 440,
					actionPath: 'manage/mPriceFactor',
					params: {
						planid:[me.getContext("planid")],
						mPriceFactor:[me.getContext("plan_mPriceFactor")]
					},
					onclose: function(){
					    fbs.plan.getInfo.clearCache();//清除cache
						er.controller.fireMain('reload', {});
					}
				});
				return false;
			};
		}
		
		//新建单元
		if(me._controlMap.addunit){
			var param = {
					id: 'createUnitDialog',
					title: '新建推广单元',
					width: 440,
					actionPath: 'manage/createUnit',
					params: {},
					onclose: function(){
					}
				};
			if(me.getContext("planid")){
				param.params.planid = [me.getContext("planid")];
			}
			me._controlMap.addunit.onclick = function(){
				nirvana.util.openSubActionDialog(param);
			};
		}
		//修改单元基本设置
		if(baidu.g("unitSetMore")){
			baidu.g('unitSetMore').onclick = function(){
				nirvana.util.openSubActionDialog({
					id: 'unitSetDialog',
					title: '推广单元其他设置',
					width: 440,
					actionPath: 'manage/unitRename',
					params: {
						unitid:[me.getContext('unitid')]
					},
					onclose: function(){
					}
				});
				
				return false;
			};
		}
		
		//修改单元出价
		if(baidu.g("modifyUnitBid")){
			baidu.g('modifyUnitBid').onclick = function(){
				nirvana.util.openSubActionDialog({
					id: 'modifyUnitBidDialog',
					title: '单元出价',
					width: 440,
					actionPath: 'manage/modUnitPrice',
					params: {
						unitid:[me.getContext("unitid")],
						unitbid:me.getContext("unit_unitbid")
					},
					onclose: function(){
					}
				});
				
				return false;
			};
		}

		//修改账户预算
		if(baidu.g('modifyAcctBudget')) {
			baidu.g('modifyAcctBudget').onclick = function() {
				//发送监控
				
				manage.budget.logParam = {
					'entrancetype' : 0
				};
				manage.budget.openSubAction({ //此方法可查看budget.js
					type : 'useracct',
					bgttype : me.getContext('bgttype'),
					planid : []
				});
				
				return false;
			};
		}
		
		//修改计划预算
		if(baidu.g('modifyPlanBudget')) {
			baidu.g('modifyPlanBudget').onclick = function() {
				var planid = [me.getContext('planid')];
				var planname = [me.getContext('planname')];
				//发送监控
				
				manage.budget.logParam = {
					'entrancetype' : 0
				};
				manage.budget.openSubAction({
					type : 'planinfo',
					bgttype : me.getContext('bgttype'),
					planid : planid,
					planname : planname
				});
				
				return false;
			};
		}
		
		// 账户层级-列表操作-修改预算
		if(me._controlMap.modifyPlanBudget) {
			me._controlMap.modifyPlanBudget.onclick = function(){
				var planid = me.getSelectedId();
				var planname = me.getSelectedPlanName();
				var bgttype = me.getSelectedBgttype();
				//发送监控
				manage.budget.logParam = {
					'entrancetype' : 1
				};
				manage.budget.openSubAction({ //此方法可查看budget.js
					type: 'planinfo',
					bgttype : 1,
					planid: planid,
					planname: planname
				});
			};
		}
		
		//批量下载 by liuyutong@baidu.com
		if(baidu.g("batchDownload_acct")){
			baidu.g('batchDownload_acct').onclick = nirvana.manage.batchDownload.batchDialog;
		}
		
		if(baidu.g("batchDownload_plan")){
			baidu.g('batchDownload_plan').onclick = nirvana.manage.batchDownload.batchDialog;
		}
		
		if(baidu.g("batchDownload_unit")){
			baidu.g('batchDownload_unit').onclick = nirvana.manage.batchDownload.batchDialog;
		}
	},
	
	/**
	 * 地域相关公用方法
	 * @author zhouyu01@baidu.com
	 */
	region : {
		/**
		 * 判断是否所有中国地区被选中
		 * @param {Object} checkedList 需要检测的地域列表
		 */
		ChinaAllSelectCheck: function(checkedList){
			var allRegion = nirvana.config.region,
				len = checkedList.length;
			if(len < 34){
				return false;
			}
			//7是日本，6木有，少了2个 实际上
			//最多应该是到36，那么应该是+1
			//modified by LeoWang(wangkemiao@baidu.com) 修正原单独取消其他区域（香港、台湾、澳门）确定之后视为全部地域问题
			for (var i = 1, l = len + 1; i <= l; i++) {
				if (i != 6 && i != 7){
					if(baidu.array.indexOf(checkedList, i.toString()) == -1 && baidu.array.indexOf(checkedList, i) == -1){
						return false;
					}
				}
			}
			return true;
		},
		
		/**
		 * 判断是否所有国外地区被选中
		 * @param {Object} checkedList 需要检测的地域列表
		 */
		AbroadAllSelectCheck: function(checkedList){
			if ((baidu.array.indexOf(checkedList, "7") != -1 && baidu.array.indexOf(checkedList, "37") != -1)
			|| (baidu.array.indexOf(checkedList, 7) != -1 && baidu.array.indexOf(checkedList, 37) != -1)) {
				return true;
			}
			return false;
		},
		
		/**
		 * 地域列表的简写形式
		 * @param {Object} checkedList
		 * @param {Object} type 账户or计划
		 */
		abbRegion: function(checkedList, type){
			var region = [], 
				l = checkedList.length, 
				chinaAll = nirvana.manage.region.ChinaAllSelectCheck(checkedList), 
				abroadAll = nirvana.manage.region.AbroadAllSelectCheck(checkedList), 
				abregion = {
					word: "",
					title: ""
				};
			if (type == "plan" && l == 0) { //计划层级使用账户推广地域
				abregion.word = abregion.title = "使用账户推广地域";
				return abregion;
			}
			if (type == "account" && l == 0) { //账户层级选择全部地域
				abregion.word = abregion.title = "全部地域";
				return abregion;
			}
			if (chinaAll && abroadAll) { //计划层级选择全部地域
				abregion.word = abregion.title = "全部地域";
				return abregion;
			}
			if (chinaAll && !abroadAll) {
				region[0] = "中国地区";
				if (baidu.array.indexOf(checkedList, "7") != -1) {
					region[1] = "日本";
				}
				else 
					if (baidu.array.indexOf(checkedList, "37") != -1) {
						region[1] = "其他国家";
					}
				abregion.word = region.join(' ');
				abregion.title = region.join('，');
				return abregion;
			}
			if (!chinaAll && abroadAll) {
				region[0] = "国外";
				for (var j = 0; j < l; j++) {
					if (checkedList[j] != 7 && checkedList[j] != 37) {
						region[region.length] = nirvana.config.region[checkedList[j]][0];
					}
				}
				if (region.length > 2) {
					abregion.word = region[0] + " " + region[1] + "...";
				}
				else {
					abregion.word = region.join(' ');
				}
				abregion.title = region.join('，');
				return abregion;
			}
			
			for (var j = 0; j < l; j++) {
				region[region.length] = nirvana.config.region[checkedList[j]][0];
			}
			
			if (region.length > 2) {
				abregion.word = region[0] + " " + region[1] + "...";
			}
			else {
				abregion.word = region.join(' ');
			}
			abregion.title = region.join('，');
			return abregion;
		}
	},
	
	
	
	
	
	
	
	/**
	 * 筛选提示控制 by 大筛子 
	 * @author linzhifeng@baidu.com
	 * @depend FilterControl & SearchTipControl & SearchTipControl
	 */
	SearchTipControl : {
		isDialogInit : false,
		dialog : null,
		lastSearchControl : '',	//最近一次触发筛选的地方
		searchCondition : '',	//筛选条件序列化数据，用于监控和保持
		searchName : '',
		/**
		 * 显示筛选项
		 * @param {Object} action
		 * @param {Object} hasSaveLink
		 */
		initSearchComboTip : function(action){
			var me = action,
	            query = baidu.encodeHTML(me.getContext('query')),
	            status = me.getContext('status'),
				advanceFilter = me.getContext('searchAdvanceValue'),
				shortcutFilter =  me.getContext('searchShortcutValue'),
				filterCol = me.getContext('filterCol'),
	            tipWrapper = baidu.g('searchComboTip'),
	            contentWrapper = baidu.g('searchComboTipContent'),
				hasSaveLink = false,
	            statusText = '',
				singleCondition,					//单个条件
				conditionList = [];					//条件列表
			if (me.VIEW == 'keywordList'){
				hasSaveLink = true
			}
			
			//组合查询---------------------------------------------------------
	        if (query == "" && status == "100") {
				//无
				if (me.VIEW == 'keywordList'){
					var expeElem = baidu.g('KrExpeInKeyword');
					if (expeElem) {
						baidu.hide(expeElem);
					}
				}
	        }else {
	            conditionList.push({
					name : "查询" + ui.util.get('materialQuerystate').getText() + (status == "100" ? "" : '状态') + (query ? ('，“' + query + '”' ): ''),
					key : 'search',
					value : [status,query,me.getContext('queryType')]
				})
	        }
			
			//高级-----------------------------------------------------------
			for (var key in advanceFilter){
				if (advanceFilter[key] != '-1'){
					singleCondition = {};
					singleCondition.key = key;
					singleCondition.value = advanceFilter[key];
					switch (key){
						case "advSearchPaysum":
						    switch (advanceFilter[key]){
								case 'H':
								   singleCondition.name = '高消费';
								   break;
								case 'L':
								   singleCondition.name = '低消费';
								   break;
								case '0':
								   singleCondition.name = '消费为0';
								   break;
							}
							break;
						case "advSearchPrice":
						    switch (advanceFilter[key]){
								case 'H':
								   singleCondition.name = '高平均点击价格';
								   break;
								case 'L':
								   singleCondition.name = '低平均点击价格';
								   break;
							}
							break;
						case "advSearchClk":
						    switch (advanceFilter[key]){
								case 'H':
								   singleCondition.name = '高点击';
								   break;
								case 'L':
								   singleCondition.name = '低点击';
								   break;
								case '0':
								   singleCondition.name = '点击为0';
								   break;
							}
							break;
						/*case "advSearchShowq":
							var showQ = advanceFilter[key].split(','),
								textArr = qStar.getSearchTip(showQ);

							singleCondition.name = '质量度为' + textArr.join('+');
							break;
                        case "advSearchShowqPc":
                            var showQ = advanceFilter[key].split(','),
                                textArr = qStar.getSearchTip(showQ);

                            singleCondition.name = '计算机端质量度为' + textArr.join('+');
                            break;
                        case "advSearchShowqM":
                            var showQ = advanceFilter[key].split(','),
                                textArr = qStar.getSearchTip(showQ);

                            singleCondition.name = '移动端质量度为' + textArr.join('+');
                            break;*/
					}
					conditionList.push(singleCondition);
				}
			}
			
			//快捷方式---------------------------------------------------------
			for (var key in shortcutFilter){
				
				if (shortcutFilter[key] == '1'){
					singleCondition = {};
					singleCondition.key = key;
					singleCondition.value = 1;
					switch (key){
						case "scutKeypoint":
						    singleCondition.name = '系统推荐重点词';
							break;
						case "scutHPpRate":
						    singleCondition.name = '高左侧展现概率词';
							break;
						case "scutHClkRate":
						    singleCondition.name = '高点击率词';
							break;
					}
					conditionList.push(singleCondition);
				}
			}
			
			//表头-----------------------------------------------------------
			if (filterCol){
				for (var field in filterCol){
					if (filterCol[field].on){
						singleCondition = {};
						singleCondition.key = field;
						singleCondition.name = filterCol[field].title;	//显示用
						singleCondition.title = filterCol[field].title;	//还原用
						singleCondition.type = filterCol[field].type;	//还原用
						singleCondition.value = filterCol[field].value;	//还原用
						switch (filterCol[field].type){
							case 'num':
								if (filterCol[field].value[0] == ''){
									singleCondition.name += '小于等于“' + filterCol[field].value[1] + '”';
								}else if (filterCol[field].value[1] == ''){
									singleCondition.name += '大于等于“' + filterCol[field].value[0] + '”';
								}else{
									singleCondition.name += '在“' + filterCol[field].value[0] + '”和“' + filterCol[field].value[1] + '”之间';
								}
								break;
							case 'percent':
								if (filterCol[field].value[0] == ''){
									singleCondition.name += '小于等于“' + filterCol[field].value[1] + '%”';
								}else if (filterCol[field].value[1] == ''){
									singleCondition.name += '大于等于“' + filterCol[field].value[0] + '%”';
								}else{
									singleCondition.name += '在“' + filterCol[field].value[0] + '%”和“' + filterCol[field].value[1] + '%”之间';
								}
								break;
							case 'select':
								singleCondition.name += '为“' + filterCol[field].value.text + '”';
								break;
							case 'checkbox':
							    var textBase = {},
								    textArr = [],
								    colValueCopy = baidu.object.clone(filterCol[field].value);
							    if (field == 'showqstat' || field == 'pcshowq' || field == 'mshowq'){
									textArr = qStar.getSearchTip(colValueCopy);

								}else if (field == 'wmatch'){
									textBase = {
										'15':'“广泛”',
										'31':'“短语”',
										'63':'“精确”'
									}

                                    for (var key in colValueCopy){
                                        if (colValueCopy[key]){
                                            textArr.push(textBase[key]);
                                        }
                                    }
								}
								singleCondition.name += '为' + textArr.join('+');
								break;
							case 'text':
								singleCondition.name += '包含“' + filterCol[field].value + '”';
								break;
							case 'extbind':
								var val = filterCol[field].value,
									minNum = val[1] + "", 
									maxNum = val[2] + "";
								if (minNum.length < 4) {
									minNum = "0000" + minNum;
									minNum = minNum.substr(minNum.length - 4);
								}
								if (maxNum.length < 4) {
									maxNum = "0000" + maxNum;
									maxNum = maxNum.substr(maxNum.length - 4);
								}
								switch(val[0]){
									case 1:
										singleCondition.name += '在“' + minNum + '”和“' + maxNum + '”之间';
										break;
									case 2:
										singleCondition.name = "无电话追踪号码";
										break;
									default:
										break;
								}
								break;
						}
						conditionList.push(singleCondition);
					}
				}
			}
			
			//查询、筛选状态渲染----------------------------------------------------
			var i,len,
			    singleFilterTemplate = "<span class='searchcombo_tip_singlefilter'>%s<a href='#' key='%k' class='filterCancel'>&nbsp;</a></span>",
			    stc = nirvana.manage.SearchTipControl,
				html = [];
			if (conditionList.length > 0){
				stc.searchName = [];
				tipWrapper.style.display = "block";
				for (i = 0,len = conditionList.length; i < len; i++){
					stc.searchName.push(conditionList[i].name);
					html.push(singleFilterTemplate.replace('%k',conditionList[i].key).replace('%s',conditionList[i].name));
				}
				if (hasSaveLink) {
					html.push('<span class="filterTipLink saveMyShortcut"><a href="#" id="SaveAsShortCut">保存到“我的查询”</a></span>');
				}
				html.push('<span class="filterTipLink cancelAll"><a href="#" id="cancelComboSearch">取消查询</a></span>');
				contentWrapper.innerHTML = '查询条件：' + html.join('');
				stc.searchName = stc.searchName.join(';');
				stc.searchCondition = baidu.json.stringify(conditionList);
				// 查询状态标识
				me.setContext('isSearch', 1);
			}else{
				tipWrapper.style.display = "none";
				stc.lastSearchControl = '';
				stc.searchCondition = '';
				// 查询状态标识
				me.setContext('isSearch', 0);
			}
			
		},
		
		/**
		 * 获取筛选提示区点击响应
		 * @param {Object} action
		 * @param {Object} tableid
		 */
		getSearchTipHandler : function(action,tableid){
			var me = action;
			return function(e){
				var event = e || window.event,
	                target = event.target || event.srcElement;
				//单个取消	
				if (target.className == 'filterCancel'){	
				    var key = target.getAttribute('key');
					switch (key){
						case 'search':						//组合
						    me.setContext('query', '');
							me.setContext('status', '100');
							me.setContext('queryType', 'fuzzy');
							//设置组合筛选的context
							//状态列表的设置
							me.setContext('searchStateValue', '100');
							me.setContext('searchQueryValue', '');
							me.setContext('searchPreciseValue', false);
							break;
						case 'advSearchPaysum':				//消费
						case 'advSearchPrice':				//平均点击价格
						case 'advSearchClk':				//点击
						//case 'advSearchShowq':				//质量度
                        //case 'advSearchShowqPc':
                        //case 'advSearchShowqM':
						    var sAdvValue = me.getContext('searchAdvanceValue');
							sAdvValue[key] = '-1';
							me.setContext('searchAdvanceValue',sAdvValue);
							break;
						case 'scutKeypoint':				//系统推荐重点词
						case 'scutHPpRate':					//高左侧展现概率词
						case 'scutHClkRate':				//高点击率词
						    me.setContext('searchShortcutValue', {
								"scutKeypoint" : '-1',
								"scutHPpRate" : '-1',
								"scutHClkRate" : '-1'
							});
							break;
						default:							//表头
						    var fCol = me.getContext('filterCol');
                            if (fCol[key]) {
                                fCol[key].on = false;
                            }
							
							me.setContext('filterCol',fCol);
							ui.util.get(tableid).filterCol[key] = false;
							break;
					}
					baidu.event.preventDefault(event);
					baidu.event.stopPropagation(event);
					target.blur();
					//me.initSearchComboTip();
					nirvana.manage.SearchTipControl.initSearchComboTip(me);
					nirvana.manage.SearchTipControl.recordSearchcondition(key + '_off');
					me.setContext('pageNo',1);
					me.refresh();
					return false;
				}
				//全部取消
				if (target.id == 'cancelComboSearch'){		
					me.setContext('query', '');
					me.setContext('status', '100');
					me.setContext('queryType', 'fuzzy');
					//设置组合筛选的context
					//状态列表的设置
					me.setContext('searchStateValue', '100');
					me.setContext('searchQueryValue', '');
					me.setContext('searchPreciseValue', false);
					me.setContext('searchAdvanceValue', {
						"advSearchPaysum" : '-1',
						"advSearchPrice" : '-1',
						"advSearchClk" : '-1'
						//"advSearchShowq" : '-1'
                        //"advSearchShowqPc" : '-1',
                        //"advSearchShowqM" : '-1'
					});
					me.setContext('searchShortcutValue', {
						"scutKeypoint" : '-1',
						"scutHPpRate" : '-1',
						"scutHClkRate" : '-1'
					});
					me.setContext('filterCol',{});
					ui.util.get(tableid).filterCol = {};
					baidu.event.preventDefault(event);
					baidu.event.stopPropagation(event);
					target.blur();
					//me.initSearchComboTip();
					nirvana.manage.SearchTipControl.initSearchComboTip(me);
					nirvana.manage.SearchTipControl.recordSearchcondition('clearall');
					me.setContext('pageNo',1);
					me.refresh();
					return false;
				}
				//保存为快捷方式
				if (target.id == 'SaveAsShortCut'){
					nirvana.manage.SearchTipControl.showAddMyShortcutDialog(nirvana.manage.SearchTipControl.searchName);
					baidu.event.preventDefault(event);
					baidu.event.stopPropagation(event);
					target.blur();
					return false;
				}
			}
		},
		
		/**
		 * 初始化Dialog
		 */
		showAddMyShortcutDialog : function(sName){
			var stc = nirvana.manage.SearchTipControl,
				inp,conHtml;
					
			if (!stc.isDialogInit){
				stc.dialog = ui.Dialog.factory.create({
					id : 'AddMyShortcut',
					title : '保存到“我的查询”',
					dragable : false,
					needMask : true,
					maskLevel : 2,
		            width : 430,
					onok : function(){
						var sName = ui.util.get('CustomShortcutName').getValue(),
						    stc = nirvana.manage.SearchTipControl;
						if (getLengthCase(sName) <= 200){
							nirvana.manage.SearchShortcut.addMyShortcut({
								name : sName,
								detail : stc.searchCondition
							});
						}else{
							//不可能进入的分支
							ui.util.get('CustomShortcutName').focusAndSelect();
							baidu.g('CustomShortcutNameCounter').innerHTML = 0;
							baidu.g('customScutNameErrorMsg').innerHTML = '自定义名称超长';
						}
						return false;
					}
				});
				conHtml = [];
				conHtml.push("<p>“我的查询”名称：</p>");
				conHtml.push("<div id='CustomShortcutNameWrap' class='custom_shortcut_name_wrap'></div>");
				conHtml.push("<p class='text_gray' style='line-height:39px'>还可输入<span id='CustomShortcutNameCounter'>0</span>个字符</p>");
				conHtml.push("<p class='text_gray'>提示：您可在关键词搜索框右侧的“我的查询”按钮中使用它。</p>")
				stc.dialog.setContent(conHtml.join(""));
				
				var errSpan = document.createElement('span');
				errSpan.id = 'customScutNameErrorMsg';
				errSpan.className = 'dialog_error_msg';
				errSpan.innerHTML = '';
				baidu.g('ctrldialogAddMyShortcutfoot').appendChild(errSpan);
				
				inp = ui.util.create('TextInput', {
	            	id: 'CustomShortcutName',
					width: 250,
					value: ''
	          	});
				inp.appendTo(baidu.g('CustomShortcutNameWrap'));
				inp.main.onkeyup = stc.onkeyup;
				
				stc.isDialogInit = true;
			}
			sName = getCutString(sName,200,'');
			baidu.g('CustomShortcutNameCounter').innerHTML = 200 - getLengthCase(sName);
			baidu.g('customScutNameErrorMsg').innerHTML = '';
			inp = ui.util.get('CustomShortcutName');
			inp.setValue(sName);
			inp.focusAndSelect();
			stc.dialog.show();
			stc.dialog.okBtn.disable(0);	
		},
		
		/**
		 * 输入名称
		 */
		onkeyup : function(e){
			var e = window.event || e,
				sName = ui.util.get('CustomShortcutName').getValue(),
				len = getLengthCase(sName),
			    stc = nirvana.manage.SearchTipControl;
			if (len <= 200){
				baidu.g('CustomShortcutNameCounter').innerHTML = 200 - len;
				baidu.g('customScutNameErrorMsg').innerHTML = '';
				if (e.keyCode == 13){
					nirvana.manage.SearchShortcut.addMyShortcut({
						name : sName,
						detail : stc.searchCondition
					});
				}
				stc.dialog.okBtn.disable(0);
			}else{
				baidu.g('CustomShortcutNameCounter').innerHTML = 0;
				baidu.g('customScutNameErrorMsg').innerHTML = '自定义名称超长';
				stc.dialog.okBtn.disable(1);
			}
		},
		
		/**
		 * 发送监控
		 * @param {Object} trigger
		 */
		recordSearchcondition : function(trigger){
			var stc = nirvana.manage.SearchTipControl;
			stc.lastSearchControl = trigger || 'none';
			NIRVANA_LOG.send({
				filter_trigger : stc.lastSearchControl,
				filter_condition : stc.searchCondition
			});
		}
	},
	
	/**
	 * 批量添加创意功能调用函数
	 * author mayue@baidu.com
	 */
	batchIdea : {
		tree : [],//保存需要添加创意的计划的数组，每个计划元素中有planid,planname,unitlist属性，其中unitlist是该计划下单元的数组
		pos : {//记录当前计划和单元在数组中的位置
			plan:0,
			unit:0
		},
		content : {//记录用户填写过的内容，再次进入时带入
			title: '',
			desc1: '',
			desc2: '',
			url: '',
			showurl: ''
		},
		isLast : false,	//记录是否是最后一个单元
		keys : [],//当前单元的关键词表
		keyPos : 0,//当前关键词在keys表中位置
		/**
		 * 获取需要添加创意的单元的树形结构，填充到级联菜单中，并添加监听
		 * @param {Object} me
		 */
		init : function(me){
			var t = this,
				controlMap = me._controlMap,
			    LevelPlan = controlMap.LevelPlan,
			    LevelUnit = controlMap.LevelUnit;
				
			//判断树形结构中是否有内容，没有则说明是第一次进入，需要请求数据
			if(t.tree.length == 0){
				switch(me.arg.batch.type){
					case 'default':
						fbs.unit.getListWithNoIdea({
							onSuccess: function(response){
								t.tree = baidu.object.clone(response.data.listData);
								function comparePlanId(a, b){
									if (a.planid > b.planid){
										return -1;
									}else if(a.planid < b.planid){
										return 1;
									}else{
										return 0;
									}
								}
								function compareUnitId(a, b){
									if (a.unitid > b.unitid){
										return -1;
									}else if(a.unitid < b.unitid){
										return 1;
									}else{
										return 0;
									}
								}
								t.tree.sort(comparePlanId);
								for (var item in t.tree){
									t.tree[item].unitlist.sort(compareUnitId);
								}
								//调用初始化函数
								t.fillSelect(me);
								//检查剩余单元数并提示
								t.checkUnitNum(me);
							},
							onFail: function(response){
								ajaxFailDialog();
							}
						});
						break;
					case 'manual':
					
						break;
				}
			}else{
				//调用初始化函数
				t.fillSelect(me);
				//检查剩余单元数并提示
				t.checkUnitNum(me);
			}
			
			// 给计划列表挂载事件获取单元列表
			LevelPlan.onselect = function(selected) {
				if (selected == -1) {
					return false;
				}
				// 选择层级时，清除错误信息
				if (baidu.g('LevelError')) {
					baidu.addClass('LevelError', 'hide');
				}
				
				var tree = t.tree,
					len = t.tree.length;
				
				//查找目前计划所在位置并储存在pos
				for(var i=0;i < len; i++){
					if(tree[i].planid == selected){
						t.pos['plan'] = i;						
					}
				}
				//填充对应的单元菜单并设置初始位置0
				t.fillUnit(LevelUnit);
				LevelUnit.setValue(tree[t.pos['plan']].unitlist[0].unitid);
				//调用获取关键词
				nirvana.manage.keyWordRef.get(LevelUnit.getValue());
			};
			// 给单元列表挂载事件获取单元位置
			LevelUnit.onselect = function(selected) {
				if (selected == -1) {
					return false;
				}
				var tree = t.tree,
					planPos = t.pos['plan'],			
					len = tree[planPos].unitlist.length;
				//查找目前单元所在位置
				for(var i=0;i < tree[planPos].unitlist.length; i++){
					if(tree[planPos].unitlist[i].unitid == selected){
						t.pos['unit'] = i;						
					}		
				}
				//调用获取关键词
				nirvana.manage.keyWordRef.get(LevelUnit.getValue());
			};
		},
		/*
		 * 填入计划和单元下拉菜单的公用操作
		 * @param me是传递过来的当前创意窗口Action对象
		 */
		fillSelect : function(me){
			var t = this,
				controlMap = me._controlMap,
			    LevelPlan = controlMap.LevelPlan,
			    LevelUnit = controlMap.LevelUnit,
				//planid = me.arg.planid,
				changeable = (typeof(me.arg.changeable) == 'undefined') ? true : me.arg.changeable,
				tree = t.tree,
				planPos = t.pos['plan'],
				unitPos = t.pos['unit'];
			
			//填充计划和单元
			t.fillPlan(LevelPlan);
			t.fillUnit(LevelUnit);
			//初始化定位计划和单元（根据记录的位置）
			LevelPlan.setValue(tree[planPos].planid);
			LevelUnit.setValue(tree[planPos].unitlist[unitPos].unitid);
			//调用获取关键词
			nirvana.manage.keyWordRef.get(LevelUnit.getValue());
			//监听“换”按钮点击
			/*baidu.g("IdeaBatchRefChange").onclick = function(e){
				nirvana.manage.keyWordRef.change();
				return false;
			};*/
			
			if (!changeable) { // 设置层级不可编辑,对于批量添加,计划和单元可否编辑保持一致
				LevelPlan.setReadOnly(true);
				LevelUnit.setReadOnly(true);
			}
		},
		/**
		 * 封装填充计划菜单
		 * @param  窗口中的计划菜单LevelPlan
		 */
		fillPlan : function(LevelPlan){
			var t = this,
				len = t.tree.length,
				tree = t.tree,
				plandata = [];
			
			for (var i = 0; i < len; i++) {
				plandata.push({
					value: tree[i].planid,
					text: baidu.encodeHTML(tree[i].planname)
				});
			}
			LevelPlan.fill(plandata);
		},
		/**
		 * 封装填充单元菜单
		 * @param  窗口中的单元菜单LevelUnit
		 */
		fillUnit : function(LevelUnit){
			var t = this,
				tree = t.tree,
				planPos = t.pos['plan'],			
				len = tree[planPos].unitlist.length,
				unitdata = [];
			
			for (var i = 0; i < len; i++) {
				unitdata.push({
					value: tree[planPos].unitlist[i].unitid,
					text: baidu.encodeHTML(tree[planPos].unitlist[i].unitname)
				});
			}
			LevelUnit.fill(unitdata);
		},
		/*
		 * 从tree中删除当前单元，并改变位置记录pos
		 */
		beforeNext : function(){
			var t = this,
				tree = t.tree,
				planPos = t.pos['plan'],
				unitPos = t.pos['unit'];
			
			if(tree[planPos].unitlist.length == 1){		//如果当前计划下只有这一个单元，将这个计划从树形结构中删除
				baidu.array.removeAt(tree,planPos);
				t.pos['plan'] = 0;
				t.pos['unit'] = 0;
			}else{
				baidu.array.removeAt(tree[planPos].unitlist,unitPos);
				t.pos['unit'] = 0;
			}
			t.tree = tree;	//将树形结构的数据更新
		},
		/*
		 * 获取当前填写数据记录到content中
		 */
		getContent : function(){
			var tmp = IDEA_CREATION.getInput();
			this.content = {
				title: tmp[0],
				desc1: tmp[1],
				desc2: tmp[2],
				url: tmp[3],
				showurl: tmp[4]
			}
		},
		fillContent : function(content){
			
			IDEA_CREATION.getForm(IDEA_CREATION.dom.title.input).value = content["title"];
			IDEA_CREATION.getForm(IDEA_CREATION.dom.desc1.input).value = content["desc1"];
			IDEA_CREATION.getForm(IDEA_CREATION.dom.desc2.input).value = content["desc2"];
			IDEA_CREATION.getForm(IDEA_CREATION.dom.href.input).value = content["url"];
			IDEA_CREATION.getForm(IDEA_CREATION.dom.url.input).value = content["showurl"];
		},
		/*
		 * 检查剩余单元数并提示
		 * @param 载入subAction时的环境变量
		 */
		checkUnitNum : function(me){
			var controlMap = me._controlMap,
				tree = this.tree,
				numLeft = 0;
			for(var i = 0; i < tree.length; i++){
				numLeft = numLeft + tree[i].unitlist.length;
			}
			baidu.g("IdeaBatchTip").innerHTML = "还剩下"+numLeft+"条创意未完成";
			if(numLeft == 1){
				this.isLast = true;
				controlMap.IdeaBatchNext.setLabel("确定");
			}
		},
		
		/*
		 * 将batchIdea下数据恢复到初始状态
		 */
		revert : function(){
			var t = this;
			
			t.tree = [];
			t.pos = {
				plan:0,
				unit:0
			};
			t.content = {
				title: '',
				desc1: '',
				desc2: '',
				url: '',
				showurl: ''
			};
			t.isLast = false;
			t.keys = [];
			t.keyPos = 0;
		}
	},
	
	/**
	 * 参考关键词功能模块 mayue@baidu.com
	 */
	keyWordRef: {
		keys:[],
		keyPos: 0,
		flag : 0,
		source : '',
		listdata : null,
		init:function(source, data){
			var t = this;
			t.flag = 1;
			t.source = source;
			t.listdata = data || [];
			baidu.removeClass("IdeaBatchRefBlock", "hide");
			baidu.dom.addClass("IdeaBatchRefGenju","hide");
			baidu.dom.addClass("IdeaBatchRefWord","hide");
			baidu.dom.addClass("IdeaBatchRefChange","hide");
			//监听“换”按钮点击
			baidu.g("IdeaBatchRefChange").onclick = function(e){
				nirvana.manage.keyWordRef.change();
				return false;
			};
		},
		revert: function(){
			this.flag = 0;
		},
		get: function(id){	//这个id在source=normal时是unitid，在source=selected时是创意id 
			var t = this;
			if(t.flag == 1){
				switch(t.source){
					case "normal":
						fbs.keyword.getNameList({
							condition : {
								unitid: [id]
							},
							onSuccess : function(data){
								t.success(data);
							},
							onFail: function(response){
								ajaxFailDialog();
							}
						});
						break;
					case "selected":
						fbs.idea.getSelectedKeyword({
							ideaid: [id],
							onSuccess : function(data){
								t.success(data);
							},
							onFail: function(response){
								ajaxFailDialog();
							}
						});
						break;
				}
			}
		},
		change: function(){
			var t = this;
			
			t.keyPos ++;
			if(t.keyPos == t.keys.length){
				t.keyPos =0;
			}
			baidu.g("IdeaBatchRefWord").innerHTML = (getLengthCase(t.keys[t.keyPos]['name']) > 32) ? getCutString(t.keys[t.keyPos]['name'],32,"..") : baidu.encodeHTML(t.keys[t.keyPos]['name']);
		},
		success: function(data){
			var datalist = data.data.listData;
			this.fillWords(datalist);
		},
        /**
         * 装填优选关键词
         * @param {Array} words
         */
        fillWords: function(words) {
            var len = words.length;
			if (len == 0) {
				baidu.addClass("IdeaBatchRefGenju", "hide");
				baidu.addClass("IdeaBatchRefWord", "hide");
				baidu.addClass("IdeaBatchRefChange", "hide");
			} else {
				var keys = [];
				for (var i = 0; i < len; i++) {
					keys.push({
						id : words[i].winfoid,
						name : words[i].showword
					});
				}
				if(len > 0){
					baidu.removeClass("IdeaBatchRefGenju","hide");
					baidu.removeClass("IdeaBatchRefWord","hide");
					if(len > 1){
						baidu.removeClass("IdeaBatchRefChange","hide");
					}
				}

                var name = keys[0].name;
				baidu.g("IdeaBatchRefWord").innerHTML = (getLengthCase(name) > 32) ? 
                                                            getCutString(name, 32,"..") : 
                                                            baidu.encodeHTML(name);

			    this.keys = keys;
            }      
        }
		
	},
	
	
	/**
	 * 获取计划列表，用于添加创意
	 * @param {Object} callback
	 * @param {Object} me
	 * @param boolean isIdea 是否是创意层级调用（需做些特殊处理）
	 */
	getPlanList: function(me,isIdea){
		var controlMap = me._controlMap,
		    LevelPlan = controlMap.LevelPlan,
		    LevelUnit = controlMap.LevelUnit,
			planid = me.arg.planid,
			changeable = (typeof(me.arg.changeable) == 'undefined') ? true : me.arg.changeable;
		var requestFun = fbs.plan.getPlanAttrWithBridge;
	        
		requestFun({
			onSuccess: function(response){
				var data = response.data.listData,
				    len = data.length,
					plandata = [{
						value: 0,
						text: '请选择推广计划'
					}],
					deviceInfoAll = {};
				
				//console.log(data);

				var len = data.length;
				
				if (len == 0) {
					plandata.push({
						value : -1,
						text : '当前没有推广计划，请您先新建计划'
					});
				} else {
					for (var i = 0; i < len; i++) {
						plandata.push({
							value: data[i].planid,
							text: baidu.encodeHTML(data[i].planname)
						});
						/*
						var deviceInfoSingle = {};
						deviceInfoSingle[data[i].planid] = {"deviceprefer":data[i].deviceprefer,
						"phonenum":data[i].phonenum};*/
						deviceInfoAll[data[i].planid] = 
						  { "deviceprefer":data[i].deviceprefer,
						    "devicecfgstat":data[i].devicecfgstat,
                            "phonenum":data[i].phonenum

                        };
                        if(data[i].bridgeStat){//商桥小流量
                        	deviceInfoAll[data[i].planid].bridgeStat = data[i].bridgeStat;
                        }
					}
				}
				
				LevelPlan.fill(plandata);
				if(isIdea){
					IDEA_CREATION.idea_phone.planListAttr = deviceInfoAll;
				}
				if (planid) { // 定位计划层级
					LevelPlan.setValue(planid);
					// 获取单元列表
					nirvana.manage.getUnitList(planid, me);
				}
				
				if (!changeable) { // 设置层级不可编辑
					LevelPlan.setReadOnly(true);
				}
			},
			
			onFail: function(response){
				ajaxFailDialog();
			}
		});
		
		// 给计划列表挂载事件获取单元列表
		LevelPlan.onselect = function(selected) {
			if (selected == -1) {
				return false;
			}
			
			// 选择层级时，清除错误信息
			if (baidu.g('LevelError')) {
				baidu.addClass('LevelError', 'hide');
			}
			
			if (selected == 0) {
				LevelUnit.fill([{
					value: 0,
					text: '请选择推广单元'
				}]);
				return;
			}
			//切换模板 for wuxian
			if(IDEA_CREATION.idea_phone.planListAttr != null){
				IDEA_CREATION.planChangeHandler(selected);
			}
			nirvana.manage.getUnitList(selected, me);
		};
	},
	
	/**
	 * 获取单元列表
	 * @param {Object} selected 选择的计划id
	 * @param {Object} me
	 */
	getUnitList : function(planid, me) {
		var controlMap = me._controlMap,
		    LevelPlan = controlMap.LevelPlan,
		    LevelUnit = controlMap.LevelUnit,
			unitid = me.arg.unitid,
			unitInfoAll=[],
			changeable = (typeof(me.arg.changeable) == 'undefined') ? true : me.arg.changeable;

		fbs.unit.getNameList({
			condition: {
				planid: [planid]
			},
			
			onSuccess: function(response){
				var data = response.data.listData,
				    len = data.length,
				    unitdata = [{
						value: 0,
						text: '请选择推广单元'
					}];
				
				if (len == 0) {
					unitdata.push({
						value : -1,
						text : '当前计划下没有推广单元，请您选择其他计划层级'
					});
				} else {
					for (var i = 0; i < len; i++) {
						unitdata.push({
							value: data[i].unitid,
							text: baidu.encodeHTML(data[i].unitname)
						});
						
						unitInfoAll[data[i].unitid] = 
                          { "creativecnt":data[i].creativecnt};
					}
				}
				LevelUnit.fill(unitdata);
                
                IDEA_CREATION.idea_phone.unitListAttr = unitInfoAll;
                
                
				if (unitid) {
					// 定位单元层级
					LevelUnit.setValue(unitid);
					if (!changeable) { // 设置层级不可编辑
						LevelUnit.setReadOnly(true);
					}
					nirvana.manage.keyWordRef.get(LevelUnit.getValue());	//参考关键词获取参考词列表功能
				}
				
			},
			
			onFail: function(response){
				ajaxFailDialog();
			}
		});
		
		// 给单元列表挂载事件获取单元列表
		LevelUnit.onselect = function(selected) {
			if (selected == -1) {
				return false;
			}
			//调用获取关键词
			nirvana.manage.keyWordRef.get(LevelUnit.getValue());
			IDEA_CREATION.unitChangeHandler(selected);
		};
	},
	
	/**
	 * 创建子action
	 */
	createSubAction : {
		/**
		 * 新增创意
		 * @param {Object} param {type,planid,unitid,changeable,batch,wordref,tip,highsaveas}
		 * type : add，新增； edit，编辑；saveas，另存
		 * changeable代表层级改变，默认为true 可以改变层级
		 * batch {object} 批量添加功能
		 * 		结构为{
		 * 			isbatch:true/false,
		 * 			type:'default'/'manual'
		 * 			source:{}
		 * 			}
		 * 		isbatch 为true表示开启批量
		 * 		type 必须传入，为default表示使用默认数据源，即过去的isquicksetup。获取账户内所有没有创意的单元，manual表示手动带入数据
		 * 		source是在type=manual时传入的树形数据，形如
		 * 			[
		 *				{
		 *					planid:3,
		 *					planname:"鲜花",
		 * 					unitlist:[
		 *						{
		 *						unitid:45,
		 *						unitname:"玫瑰"
		 *						}
		 *						..
		 *					]
		 *				}
		 *				..
		 *			]
		 * wordref {object}关键词参考功能开关 
		 * 		结构为{
		 * 			show:true/false,
		 * 			source:""
		 * 			}
         *      wordref.show=true表示开启，默认关闭
         *      source目前有两个值:
         *          normal表示查找该创意所在单元下的所有关键词，
         *          selected表示优选过的关键词，source值不同会调用不同接口
         *          如果已经设置为数组，表示已经拿到数据，直接设置，注意数组元素需要两个字段
         *          {winfoid: 1, showword: ''}
		 * tip {object}右侧提示语句功能开关，只有在type=edit/saveas时可用，tip.show=true表示开启，默认关闭
		 * 		结构为
		 * 			{
		 * 			show:true/false,
		 * 			title:"",
		 * 			content:""
		 * 			}
		 * highsaveas:boolean类型,在type为saveas时可用，用于更改界面，为true时强调“新增”按钮，并在用户点击“确定”按钮时提示是否用新增功能
		 */
		idea : function(param) {
			if (typeof(param) == 'undefined') {
				param = {};
			}
			if (!param.type) {
				param.type = 'add';
			}
			var type = param.type,
			    id = 'AddIdeaDialog',
				title = '新增创意';
			
			switch (type) {
				case 'edit' :
				    id = 'EditIdeaDialog';
					title = '编辑创意';
					break;
				case 'saveas' :
				    id = 'SaveasIdeaDialog';
					title = '编辑创意';
					break;
			}

            var obj = {
				id: id,
				className: 'skin_idea_edit',
				title: title,
				width: 1010,
				actionPath: 'manage/ideaEdit',
				params: param,
				onclose: function(){
					clearInterval(IDEA_CREATION.checkCache); // 停止检查断句符
					IDEA_CREATION.resetIdeaDevice();//复原无线设备相关的本地变量
				}
			};

            if (typeof param.maskLevel !== 'undefined') {
                obj.maskLevel = param.maskLevel
            }

			nirvana.util.openSubActionDialog(obj);
		},


		appendIdea: function(param){

			if (!param.appendIdeaType) {
				throw "附加创意Exception: 没有附加创意类型";
			}
			//console.log(manage.appendIdea.config)


			if (!param.type) {
				param.type = 'add';
			}



			var type = param.type,
				append_type = param.appendIdeaType,
				config = nirvana.appendIdea.config,
				append_type_map = config.appendIdeaType,
				append_width_map = config.appendIdeaDialogWidth,
				append_path_map = config.appendIdeaPath;

			var title = ((type == 'add') ? '新增': (append_type=='app'? '查看': '编辑')) + append_type_map[append_type],
				id = 'appendIdeaEditDialog';

			if ((append_type == 'app') && !param.complexity) {
				param.complexity = 'single';
			}

			var obj = {
				id: id,
				title: title,
				width: append_width_map[append_type],
				actionPath: append_path_map[append_type],
				params: param,
				onclose: function() {
				   
				}
			}

			var actionPath = append_path_map[append_type];
			if (actionPath.constructor === String) {
				obj.actionPath = actionPath;
			} else {
				obj.actionPath = actionPath[param.complexity];
			}

			if (typeof param.maskLevel !== 'undefined') {
				obj.maskLevel = param.maskLevel;
			}

			nirvana.util.openSubActionDialog(obj);

		},
		
        
        /**
         *复制创意 
         *
         */
		copyAppendIdea:function(param){
		    var title = '批量复制', 
		        id = 'copyAppendIdeaDialog',
		    
		        obj = {
                id: id,
                className: 'skin_appendIdea_copy',
                title: title,
                width: 680,
                actionPath: 'manage/appendIdea/copyIdea',
                params: param,
                onclose: function(){
                    er.controller.fireMain('reload', {});
                }
            };

            if (typeof param.maskLevel !== 'undefined') {
                obj.maskLevel = param.maskLevel
            }

            nirvana.util.openSubActionDialog(obj);
		},
		
		/**
		 * 新增关键词
		 * @param {Object} param
		 */
		keyword : function(param) {
		    //手动卸载KR
		    ToolsModule.unloadKR();

			nirvana.util.openSubActionDialog({
				className: 'skin_keyword_add',
				id: 'AddKeywordDialog',
				title: '添加关键词',
				width: 1020,
				actionPath: 'manage/keywordAdd',
				params: param || {},
				onclose: function() {
					fbs.keyword.getList.clearCache();
					er.controller.fireMain('reload', {});
					//ui.util.get('SideNav').refreshPlanList();
                    var kr = ToolsModule.kr.obj;
                    if (kr && kr.param.planid) {
                        ui.util.get('SideNav').refreshUnitList([kr.param.planid]);
                    }
				}
			});
			clearTimeout(nirvana.subaction.resizeTimer);
			baidu.g('ctrldialogAddKeywordDialog').style.top = baidu.page.getScrollTop() +'px';
		},
		
		/**
		 * 添加关键词错误返回
		 * @param {Object} param
		 */
		keywordAddError : function(param) {
			if (typeof(param) == 'undefined') {
				param = {};
			}
			nirvana.util.openSubActionDialog({
				id: 'KeywordAddErrorDialog',
				title: '添加关键词',
				width: 975,
				actionPath: 'manage/keywordAddError',
				params: param,
				onclose: function(){}
			});
		}
	},

	
	//获取一行的idnex
	getRowIndex : function (target) {
        var row, checkBoxCell, rowIndex;

        row = baidu.dom.getAncestorByTag(target, 'tr');
		checkBoxCell = baidu.dom.children(row)[0];
        rowIndex = parseInt(baidu.dom.getAttr(checkBoxCell, 'row'), 10);
        return rowIndex;
    },
    
    /**
     * 获取行内启用暂停即将执行的启用暂停状态
     */
    getPauseStat : function (target, codeArr) {
        var wrapper = baidu.dom.getAncestorByTag(target, 'div'),
            className = wrapper.className,
            statCode = className.substring(className.length -1);
            
        return (statCode == codeArr[0] ? codeArr[1] : codeArr[0]);
    },
    
    inserLoadingIcon : function (target) {
        target.innerHTML = '<img src="./asset/img/loading.gif" title="正在发送请求,请稍等..." alt="正在发送请求,请稍等..." />';
    },
    
    restoreAccountTree : function (action) {
        var me = action,
            path = me.arg.path,
            module = path.substr(path.lastIndexOf('/') + 1),
            sideNav = ui.util.get('SideNav');
        
        
        
        if (module == 'monitorList' || module == 'monitorDetail') {
            //如果在监控文件夹
            var folderHeaderId = sideNav.accordion.getId('header_' + 'FolderTree');
            //打开监控文件夹手风琴
            sideNav.accordion.expandItem(baidu.g(folderHeaderId));            
        }
        if(module == 'monitorList'){
			//如果在监控文件夹列表，则取消高亮 add by liuyutong
			sideNav.folderTree.lowlightLine();
		}
        if (module == 'monitorDetail') {
            var folderid = me.arg.queryMap.folderid,
                folderNode = baidu.g('leafNode_a' + folderid);

            //选中指定文件夹节点
            sideNav.folderTree.selectNode(folderNode);
        }
        var accountTree = sideNav.accountTree;
        
        //如果是账户层级
        if (me.arg.queryMap.navLevel && me.arg.queryMap.navLevel == 'account') {
			sideNav.curUnitid = -1;
			sideNav.curPlanid = -1;
            accountTree.lowlightLine();
        }
        //accountTree.repaint();
        //收起第一个展开的plan Node
  		/*var firstPlanNode = accountTree.main.getElementsByTagName('tr')[0];
        if (firstPlanNode) {
			accountTree.collapse(firstPlanNode);
		}
		*/
        
        if ('plan,unit,keyword,idea'.indexOf(module) > -1) {
			//打开账户树手风琴
            var accountHeaderId = sideNav.accordion.getId('header_' + 'AccountTree');
            sideNav.accordion.expandItem(baidu.g(accountHeaderId));
			
            var unitid = me.arg.queryMap.unitid,
                planid = me.arg.queryMap.planid;
            if (unitid) {//如果是单元层级
                /*
                var childrenWrapper = accountTree.getParentTrDom(unitNode);
                if (childrenWrapper) {
                    var planNodeId = childrenWrapper.id.replace('children','branch');
                    planNode = baidu.g(planNodeId);
                }
                */
                if (!planid) {
                    planid = me.getContext('planid');
                }
                //planNode = baidu.g('branchNode_p' + planid);
                
				sideNav.curUnitid = unitid;
				sideNav.curPlanid = planid;
                //展开planNode    
                /*
				if (planNode) {
                    accountTree.expand(planNode);
					function(){
						alert(unitid)
						if (planNode) {
		                    accountTree.expand(planNode);
		                    //accountTree.selectNode(planNode);
		                }
						var unitNode = baidu.g('leafNode_u' + unitid);
						accountTree.selectNode(unitNode);
					});
					
                    //accountTree.selectNode(planNode);
                }
                */
                //刷新计划列表
                //sideNav.refreshUnitList([planid],unitid);
				
            }else if (planid) {//如果是计划层级
            	/*
                var planNode = baidu.g('branchNode_p' + planid);
				if (planNode) {
					accountTree.expand(planNode);
					accountTree.selectNode(planNode);
				}
				*/
				sideNav.curUnitid = -1;
				sideNav.curPlanid = planid;
            } else{
				sideNav.curUnitid = -1;
				sideNav.curPlanid = -1;
            	accountTree.lowlightLine();
			}
			sideNav.restore();
        }
    },
    
    initSchedule : function (action)  {
        var me = action;
        baidu.g('modifyPlanSchedule').onclick = function () {
            // 老的时段修改：Deleted by Wu Huiyao
            /*nirvana.util.openSubActionDialog({
                id : 'scheduleDialog',
                title : '修改推广时段',
                width : 660,
                actionPath : 'manage/planSchedule',
                params : {
                    planid : [me.getContext("planid")],
                    scheduleValue : me.getContext('plan_plancyc') || ''
                },
                onclose : function(){

                }
            });*/

            // 修改时段逻辑同modPlanSchedule: Added by Wu Huiyao
            nirvana.manage.modPlanSchedule([me.getContext("planid")],
                me.getContext('plan_plancyc') || '');

            return false;
            
        };
        
    },
	
	resetTableStatus : function(action,tableId){
		var me = action;
		if (me.arg.queryMap.ignoreState && ui.util.get(tableId)){
			var tb = ui.util.get(tableId);
			me.setContext('filterCol',{});
			tb.filterCol = {};
			tb.orderBy = "";
			document.documentElement.scrollTop = 0;
			document.body.scrollTop = 0;
		}
	},
	
	/**
	 * 检验筛选条件个数是否超限
	 * @param {Object} search			组合筛选
	 * @param {Object} advFilter		高级
	 * @param {Object} tablefilter		表头筛选
	 * @param {Object} max				上限
	 */
	validateCondition : function(search, advFilter, shortcutFilter, tablefilter, max){
		var totalCondition = 0;
		if ((search[0]&&search[0] != '') || (search[1]&&search[1] != '100')){
			totalCondition++;
		}
		
		for (var key in advFilter){
			if (advFilter[key] != '-1'){
				totalCondition++;
			}
		}
		
		for (var key in shortcutFilter) {
			if (shortcutFilter[key] == '1') {
				totalCondition++;
			}
		}
		
		for (var i in tablefilter){
			if (tablefilter[i].on){
				totalCondition++;
			}
		}
		return (totalCondition <= max);
	},
	
	/**
	 * 根据指定单元的地域信息，空参为账户地域
	 * @param {Object} planId
	 */
	getRegionInfo : function(callback, planId){
		var func, 
			param = {};
	      
	    if (planId) {
	        func = fbs.plan.getInfo;
	        param.condition = {
                planid:[planId]
            };
			param.onSuccess = function (data) {
			    var data = data.data.listData[0],
				    wregion = data['wregion'] == "" ? '0' : data['wregion'];
				if (wregion == '0'){
					//使用账户推广地域则需再取账户的
					fbs.account.getInfo({
						onSuccess : function(data){
							var data = data.data.listData[0],
							    wregion = data['wregion'] == "" ? '0' : data['wregion'];
				            callback(wregion);
						}
					})
				}else{
					callback(wregion)
				}
			};
	    }
		
		if (typeof(planId) == 'undefined' || planId == '' || planId == 0) {
		    func = fbs.account.getInfo;
			param.onSuccess = function (data) {
			    var data = data.data.listData[0],
				    wregion = data['wregion'] == "" ? '0' : data['wregion'];
				callback(wregion)
			};
		}		
		func(param);
	},
		
	//即时更新 by liuyutong@baidu.com
	updateCallback: {
		onSuccess : function(item){
			var data = item.data.listData,
				me = nirvana.manage,
				arr = ['wordstat','unitstat','ideastat','planstat'];
			
			for (var key in data[0]) {
				if (baidu.array.indexOf(arr, key) != -1) {
					var type = key.replace(/stat/, '');
					me._updateRender(type, data);
					break;
				}
			}
		},
		onFail : function(){
		    var  me = nirvana.manage
				me._updateRender(me.NOW_TYPE,me.NOW_DATA.data);
		}
	},


	//即时更新后render by liuyutong@baidu.com
	_updateRender : function(type,data){
		var now_id,result,
			param = {},
			levelId = (type == "word") ? "winfoid" : (type + "id"),
			stateId = type + "stat";

		for (var i = 0, len = data.length; i < len; i++) {
			result = data[i];
			now_id = baidu.g(stateId + '_update_' + result[levelId]);
			if(now_id){
				switch(type){
					case 'idea':
						now_id.innerHTML = buildIdeaStat(result);
						break;
					case 'word':
					case 'plan':
					case 'unit':
						param[levelId] = result[levelId];
						now_id.innerHTML = nirvana.util.buildStat(type, result[stateId], result['pausestat'], param);
						break;
					default:
						break;
				}
			}
		}
	}
};

/**
 * 离线宝
 */
nirvana.manage.LXB = {
	
	defaultId : "ManageLxbStatus",
	
	/**
	 * 显示小话筒及气泡展示
	 * @param {Object} dom
	 */
	setStatus: function(dom){
		var me = this,
			defaultId = this.defaultId;
			
	//	dom = dom || defaultId;
		if (typeof dom == 'string') {
			dom = baidu.g(dom);
		}
		if (!dom) {
			dom = me.createContainer();
		}
		
		var status = baidu.getAttr(dom,"status");
		if (!status) {
			fbs.trans.getLxbStatus({
				onSuccess: function(res){
					status = +res.data;
					me.initBubble(dom, status);
				},
				onFail: function(data){}//面包屑中若请求出错则不显示
			});
		}
		else {//概况页已经请求过状态，无需再请求
			me.initBubble(dom, status);
		}
	},
	
	/**
	 * 推广管理（计划、单元、关键词和创意）面包屑中动态添加用于显示bubble的位置
	 */
	createContainer: function(){
		var acct = $$.find("span", baidu.g("ctrlmateriallevelmanageLevel")).set[0];
		if (!acct) {
			return;
		}
		var dom;
		dom = baidu.g(this.defaultId);
		if (!dom) {
			dom = document.createElement("span");
			dom.id = this.defaultId;
		}else{
			dom.innerHTML = "";
		}
		baidu.dom.insertAfter(dom, acct);
		return dom;
	},
	
	/**
	 * 根据状态设置bubble的不同样式
	 * @param {Object} dom
	 * @param {Object} status
	 */
	initBubble: function(dom, status){
		var bubb = ui.Bubble.source.moniListLxbStatus;
		baidu.addClass(dom, "ui_bubble");
		baidu.setAttr(dom, "bubblesource", "moniListLxbStatus");
		bubb.iconClass = "sphone-icon" + status;
		bubb.status = status;
		ui.Bubble.init([dom]);
	}
}

/**
 * 行内编辑
 * @author zhouyu
 */
nirvana.inline = {
	//当前浮出层
	currentLayer: null,
	arg:null,
	editArea: null,
	minWidth : 185,
		
	tpl: (function(){
		var tplLabelHtml = '<div ui="id:{0}label;type:Label;"></div>', 
			tplButtonHtml = '<div id="editButton" class="inline_button">' + 
							'<div ui="id:{0}ok;type:Button;">保存</div>' +
							'<div ui="id:{0}cancel;type:Button;">取消</div></div>', 
			tplErrorHtml = '<div id="errorArea" class="inline_error"></div>';
		return {
			tplTextHtml: tplLabelHtml + '<input type="text" ui="id:{0}edit;type:TextInput;height:22" />' + tplButtonHtml + tplErrorHtml,
			//行内出价的模板 修改出价多了出价比例的提示
			tplBidTextHtml: tplLabelHtml + '<input type="text" ui="id:{0}edit;type:TextInput;height:22" />' + tplButtonHtml + '<div class="inline-mprice-factor-tip">当前计划的移动出价比例<span class="ui_bubble" bubblesource="defaultHelp" bubbletitle="移动出价比例">&nbsp;</span>:{1}</div>' +tplErrorHtml,
			
			//select如果没有width的话render在IE7下会出错，并阻塞后续代码运行。。。。。。
			tplSelectHtml: tplLabelHtml + '<div ui="id:{0}edit;type:Select;width:0"></div>' + tplButtonHtml + tplErrorHtml,
			tplCheckboxHtml: tplLabelHtml + '<input type="checkbox" title="{1}" value=1 ui="id:{0}edit;type:CheckBox;" />' + tplButtonHtml + tplErrorHtml
		} 
	})(),
		

	/**
	 * 创建行内编辑浮出层
	 * @param {Object} arg
	 * arg：{
	 * 	type:text / select / checkbox
	 *  value:默认值
	 *  id：用于浮出层各对象唯一标识
	 *  target:父元素
	 *  datasource:当type 为select的时候有该参数
	 *  okHandler:保存处理函数
	 *  showmPriceFactor:是否显示出价比例，不传的话默认为不显示
	 *  mPriceFactor{integer}:计划的出价比例，传入showMpriceFactor的时候才看
	 *  planid{string}:没有传mPriceFactor的时候，用planid去获取
	 * }
	 *
	 *or {
	 * html:比较复杂的行内编辑
	 * target：父元素
	 *}
	 */
	
	
	createInlineLayer: function(arg) {
		var me = this;
		var layerHtml = '';
		var tpl = nirvana.inline.tpl;
		me.arg = arg;

		if(arg.showmPriceFactor && !arg.html) {//显示出价比例
			if(arg.mPriceFactor) {
				layerHtml = ui.format(tpl.tplBidTextHtml, arg.id, arg.mPriceFactor);
			    me.createInlineLayerBegin(arg, layerHtml);
			} 
			else if( typeof arg.planid != 'undefined') {//根据planid去取计划层级属性
				var param = {};
				param.condition = {
					planid : [arg.planid]
				};
				param.onSuccess = function(data) {
					var result = data.data.listData[0];
					var mPriceFactor = result.mPriceFactor;
					var deviceprefer = result.deviceprefer;
					if(deviceprefer == '0') {//全部设备的时候现实出价比例，否则不显示
						layerHtml = ui.format(tpl.tplBidTextHtml, arg.id, mPriceFactor);
					}
					else {
						layerHtml = me.getHtml();
					}
					me.createInlineLayerBegin(arg, layerHtml);
					//me.modBid(bid,winfoid,parent,devicePrefer,mPriceFactor,nav);
				}
				fbs.plan.getPreferAndFactor(param);
			}
			else{
				alert('参数传错了，当showmPriceFactor为true的时候，传入出价比例，或者planid')
			}

		} 
		else {
			layerHtml = arg.html ? arg.html : me.getHtml();
			me.createInlineLayerBegin(arg, layerHtml);
		}

	},


	
	/**
	 * 创建行内浮层  因为出价比的时候，需要再回调里面执行，所有拿出来作为一个单独的函数，函数名字。。
	 * @param {Object} arg     参数同createInlineLayer
	 * @param {Object} htmlStr 浮层显示的html片段
	 * @author yanlingling
	 */
	
	
	createInlineLayerBegin: function(arg, htmlStr) {
		var me = this, 
		layer = me.currentLayer;
		me.arg = arg;
		//每个页面只创建一次，以后的编辑过程只是填充不同的html及重新定位
		if(!layer) {
			layer = document.createElement("div");
			baidu.addClass(layer, "inline_edit");
		}
		
		if(arg.target) {
			layer.innerHTML = htmlStr;
			document.body.appendChild(layer);
			ui.Bubble.init();
			baidu.event.fire(window, 'resize');
			me.control = ui.util.init(layer);
			me.prefix = me.control[arg.id + "label"];
			me.editArea = me.control[arg.id + "edit"];
			if(!me.buttonWidth) {//editButton区域的宽度在IE下面会算上input或select的宽度，故第一次就定死button区域的宽度
				me.buttonWidth = baidu.g("editButton").offsetWidth || 0;
			}
			me.repaint();
			layer.style.width = me.getTotalWidth() + "px";
			me.bindHandler();
			me.setPosition(layer, arg.positionCall);
            // console.log(me.arg)
            switch(me.arg.type) {
                case 'text':
                    me.editArea.main.focus();
                    break;
                case 'select':
                    me.editArea.toggleLayer();
                    if (!me.editArea.readOnly) {
                        setTimeout(function() {
                            me.editArea.showLayer();
                        }, 100);
                    }
                    break;
            }
		}
		me.currentLayer = layer;
	},

	
	/**
	 * 获取浮层html
	 */
	getHtml: function(){
		var me = this,arg = me.arg, type = arg.type,  tpl = me.tpl;
		switch (type) {
			case "text":
			    return ui.format(tpl.tplTextHtml, arg.id);
			case "select":
				return ui.format(tpl.tplSelectHtml, arg.id);
			case "checkbox":
				return ui.format(tpl.tplCheckboxHtml, arg.id, arg.title);
			default:
				return "";
		}
	},
	
	/**
	 * 非字符串数据不能直接写在ui属性中，比如select的datasource
	 */
	repaint: function(){
		var me = this, arg = me.arg, editArea = me.editArea, 
			prefix = me.prefix,
			width = me.getEditAreaWidth();
		
		//prefix
		prefix.datasource = arg.prefix || "";
		prefix.render();
		//编辑区
		switch (arg.type) {
			case "text":
				editArea.width = width;
				editArea.value = arg.value || "";
				editArea.virtualValue = arg.virtualValue || "";
				break;
			case "select":
				editArea.width = width;
				editArea.value = arg.value;
				editArea.options = arg.datasource;
				break;
			case "checkbox":
				editArea.datasource = arg.value;
				break;
			default:
				break;
		}
		editArea.render();
	},
	
	
	/**
	 * 绑定事件
	 */
	bindHandler: function(){
		var me = this, arg = me.arg, id = arg.id, control = me.control, editArea = me.editArea;
		//按钮
		control[id + "ok"].onclick = me.onOkHandler();
		control[id + "cancel"].onclick = me.onCancelHandler();
		//编辑区
		switch (arg.type) {
			case "text":
				editArea.onenter = me.onOkHandler();
				break;
			case "checkbox":
				editArea.onclick = function(){
					var value = editArea.getChecked() ? 1 : 0;
					this.setValue(value);
				}
				break;
			case "select":
				editArea.onselect = function(value){
					this.setValue(value);
				};
				break;
			default:
				break;
				
		}
		//填充默认错误信息(通常是提示与错误共用DOM)
		baidu.g("errorArea").innerHTML = arg.defaultError || "";
	},
	
	/**
	 * 编辑区域（textinput或者select）最小宽度125px
	 */
	getEditAreaWidth: function(){
		var me = this,
			prefix = me.prefix,
			labelWidth = typeof(me.arg.prefix) != "undefined" ? prefix.main.offsetWidth : 0;
			
		return Math.max(me.minWidth, me.arg.target.offsetWidth - labelWidth - me.buttonWidth);
	},
			
		
	/**
	 * 设置浮层总宽度
	 * @param {Object} arg
	 */
	getTotalWidth: function(){
		var me = this, arg = me.arg, minWidth, prefix, labelWidth;
		minWidth = me.minWidth;
		prefix = me.prefix;
		labelWidth = prefix.main.offsetWidth || 0;
		
		//计算宽度的时候把checkbox后面的label也算上
		//对于checkbox类型，设置input，label和button行内居中
		if(arg.type == 'checkbox'){
			var checkbox = me.editArea.getDOM(), childrens = checkbox.parentNode.getElementsByTagName('*'), tmp, tagName;
			
			for(var i = 0, l = childrens.length; i < l; i++){
				tmp = childrens[i];
				tagName = tmp.tagName.toLowerCase();
				
				baidu.addClass(tmp, 'vm');
				if(tagName == 'input' && tmp.type == 'checkbox'){
					if(baidu.browser.firefox){
						tmp.style.top = '3px';
					}
				}
				else 
					if (tagName == 'label') {
					tmp.style.paddingTop = '3px';
					}
					else 
						if (tagName == 'div' && baidu.dom.hasClass(tmp, 'inline_button')) {
					if(baidu.browser.ie){ //不知道ie里为什么inline-block的button会掉下来
						tmp.style.display = 'inline';
					}
				}
			}
				
			var nextLabel = baidu.dom.next(checkbox);
			if(nextLabel && nextLabel.tagName.toLowerCase() == 'label'){
				minWidth = 150;
				labelWidth += Math.abs(nextLabel.offsetWidth - minWidth);
			}
		}
		
		//设置编辑层的宽度(各组件宽度总和+20)
		return Math.max(minWidth + 20 + labelWidth + me.buttonWidth, arg.target.offsetWidth + 20);
	},
	
		
	
	/**
	 * 点击保存按钮事件
	 */
	onOkHandler: function(){
		var me = this,
			arg = me.arg,
			okhandler = arg.okHandler, 
			oldValue = arg.value;
		return function(){
			var value = me.editArea.getValue(),
				isEqual = isNaN(value) ? (baidu.trim(value) == oldValue) : (+baidu.trim(value) == +oldValue);
			//arg.force:不用判断是否相等，强制执行回调 zhouyu01 2013-01-08
			if (!isEqual || arg.force ||  arg.action == "modWordBid") {	//谁又在这里写了业务逻辑？？？？
				var modify = okhandler(value), 
					func = modify.func, 
					param = modify.param, 
					validate = modify.validate;
				
				if (typeof(validate) == "function" && !validate()) {
					return;
				}
				param.onFail = me.failHandler();
				func(param);
			}
			else {
				me.dispose();
			}
		}
	},
	
	/**
	 * 点击取消按钮事件
	 */
	onCancelHandler: function(){
		var me = this;
		return function(){
			var arg = me.arg;
			//add by LeoWang(wangkemiao@baidu.com)添加自定义cancelHandler，为监控提供
			arg.cancelHandler && arg.cancelHandler(me.editArea.getValue());
			me.dispose();
		}
	},
	
	
	/**
	 * 释放控件
	 */
	dispose: function(){
		var me = this;
				me.editArea.dispose();
				me.currentLayer.parentNode.removeChild(me.currentLayer);
	},
	
	/**
	 * 保存失败处理
	 */
	failHandler: function(){
        // mod by Huiyao 2013-5-17 下述代码被提取到bizUtil.js#getModMaterialFailHandler
        // 便于重用
        var me = this;
        return nirvana.bizUtil.getModMaterialFailHandler(function (errorcode) {
            me.displayError(errorcode);
        });
//		var me = this;
//		return function(data){
//			if (data.status == 500) {
//				if (data.errorCode && data.errorCode.code == 408) {
//					me.displayError(408);
//					return ;
//				}
//				else {
//					ajaxFail(0);
//					return;
//				}
//			}
//			var error = fbs.util.fetchOneError(data), errorcode;
//			if (error) {
//				for (var item in error) {
//					errorcode = error[item].code;
//					me.displayError(errorcode);
//				}
//			}
//			else if(data.errorCode) {
//				error = data.errorCode; //阿凡达返回error结构与其他接口不一致
//				if (error.code) {
//					me.displayError(error.code);
//				}
//				else {
//					for (var item in error) {
//						errorcode = error[item];
//						me.displayError(errorcode);
//					}
//				}
//			}else{
//				ajaxFail(0);
//			}
//		}
	},
	
	
	/**
	 * 显示错误信息
	 * @param {Object} errorcode 错误编码
	 */
	displayError: function(errorcode){
        // mod by Huiyao 2013-5-17 下述代码被提取到bizUtil.js#getModMaterialFailHandler
        // 便于重用
        var errorMsg = nirvana.bizUtil.getMaterialModErrorInfo(errorcode);
        var errorArea = baidu.g("errorArea");
        if (errorArea) {
            errorArea.innerHTML = errorMsg;
        }

//		var me = this,
//			error = nirvana.config.ERROR,
//			errorArea = baidu.g("errorArea"),
//        // mod by Huiyao 2013-5-14: add account_budget, plan_budget
//			info = [
//                'unit_price', 'unit_name', "plan_name", 'keyword_price',
//                'keyword_url', 'keyword_add', 'report_name', 'avatar',
//                'account_budget', 'plan_budget'
//            ];
//
//		for (var i = 0, l = info.length; i < l; i++) {
//			var infoArr = info[i].split("_"), errorBase = error;
//			for (var j = 0, len = infoArr.length; j < len; j++) {
//				errorBase = errorBase[infoArr[j].toUpperCase()];
//			}
//			for (var item in errorBase) {
//				if (item == errorcode) {
//                    // 移除计划预算类似于401错误消息里的%s变量 mod by Huiyao 2013-5-14
//					errorArea.innerHTML = errorBase[item].replace('%s', '');
//					return;
//				}
//			}
//		}
	},

	
	/**
	 * 设置行内编辑浮出层的位置
	 * @param {Object} parent 需要编辑的某列
	 * @param {Object} div 浮出层对象
	 * @param {Function} positionCall 自定义的定位方法，通过arg.positionCall传入
	 * @author zhouyu
	 */
	setPosition: function(div,positionCall){
		var me = this, table = null, editTd = me.arg.target, parent = editTd, top = 0, left = 0;

		if('undefined' !== typeof positionCall && 'function' == typeof positionCall){
			positionCall.call(this, editTd, div);
			return;
		}
		
		var singleLinePos = me.arg.singleLine || 'bottom';

		//相对ui_table_body定位
		while(parent && !baidu.dom.hasClass(parent,"ui_table")){
			if(baidu.dom.hasClass(parent,"ui_table_body")){
				table = parent;
				break;
			}
			top += parent.offsetTop;
			left += parent.offsetLeft;
			parent = parent.offsetParent;
		}
		if (table) {
		//找到所有行
			var trs = $$(".ui_table_row", table), trsLen = trs.length;
		
		//如果是最后一行，则设置bottom
		
		if (baidu.dom.contains(trs[trsLen-1],editTd) && 
			// 增加判断如果只有一行时，是否设置为bottom或者“没有设置”，如果设置为top[建议值]则不走此逻辑
			// edited by LeoWang(wangkemiao@baidu.com) 2012-11-21
			(trsLen > 1 || (trsLen == 1 && singleLinePos == 'bottom'))) { 
			//兼容滚动条
			/*div.style.bottom = table.offsetHeight - table.scrollHeight + "px";
			div.style.top = "";*/
			// Modified by Wu Huiyao (wuhuiyao@baidu.com)
			// 根据实际表格高度去算偏移量
			var realHeight = 0;
            var children = baidu.dom.children(table);
			for (var i = 0, len = children.length; i < len; i ++) {
			    realHeight += children[i].offsetHeight;
			}
			div.style.bottom = table.offsetHeight - realHeight + "px";
            div.style.top = "";
		}
		else if (baidu.dom.contains(trs[0], editTd)) { //第一行则设置top为0
			div.style.top = 0;
			div.style.bottom = "";
		}
		else {
			div.style.top = (top - 10) + "px";
			div.style.bottom = "";
		}
		
		if(table.offsetWidth - left <= div.offsetWidth){//最后一列
			div.style.right = 0;
			div.style.left = "";
			}
			else 
				if (left < 10) {//第一列或者第二列
			div.style.left = 0;
			div.style.right = "";
				}
				else {
			div.style.left = (left - 10) + "px";
			div.style.right = "";
		}
		
			table.appendChild(div);
		}
	}
}

/**
 * 气泡：我的查询详情
 */
ui.Bubble.source.customShortcut = {
	type : 'normal',
	iconClass : 'ui_bubble_icon_none',
	position : {
		left : function(tar){
			var pos = baidu.dom.getPosition(tar);
			return pos.left;
		},
		top : function(tar){
			var pos = baidu.dom.getPosition(tar);
			return pos.top + tar.offsetHeight;
		}
	},
	needBlurTrigger : true,
	showByClick : false,
	showByOver : true,			//鼠标悬浮延时显示
	showByOverInterval : 500,	//悬浮延时间隔
	hideByOut : true,			//鼠标离开延时关闭
	hideByOutInterval : 1000,	//离开延时间隔，显示持续时间
	title: function(node){
		var idx = node.getAttribute("idx"),
			myShortcut = nirvana.manage.SearchShortcut.myShortcut,
			wfcondname = myShortcut[idx].wfcondname;
		if (getLengthCase(wfcondname) > 80){
			return '<span id="MyshortcutDetailTitle" title="' + baidu.encodeHTML(wfcondname) + '">' + insertWbr(getCutString(myShortcut[idx].wfcondname, 71, '...')) + '</span><a id="MyshortcutDetailCheckAll" href="javascript:void(0)" onclick="ui.Bubble.source.customShortcut.titleClickHandler()">[全部]</a>';
		}else{
			return insertWbr(myShortcut[idx].wfcondname);
		}
	},
	titleClickHandler : function(){
		var detailTitle = baidu.g('MyshortcutDetailTitle'),
		    checkAll = baidu.g('MyshortcutDetailCheckAll');
		if (checkAll.innerHTML == '[全部]'){
			checkAll.innerHTML = '[收起]';
			detailTitle.innerHTML = insertWbr(baidu.decodeHTML(baidu.dom.getAttr(detailTitle,'title')));
		}else{
			checkAll.innerHTML = '[全部]';
			detailTitle.innerHTML = insertWbr(getCutString(baidu.decodeHTML(baidu.dom.getAttr(detailTitle,'title')), 71, '...'));
		}
		checkAll.blur();
	},
	content: function(node, fillHandle, timeStamp){
		var idx = node.getAttribute("idx"),
			myShortcut = nirvana.manage.SearchShortcut.myShortcut;
		if (myShortcut[idx]){
			return ui.Bubble.source.customShortcut.detailRestore(baidu.json.parse(myShortcut[idx].wfconddetail));
		}else{
			return '';
		}
	},
	detailRestore : function(detail){
		var i,len = detail.length,
			tpl = "<div><div class='detail_singleFilter'>%s</div></div>",
		    html = [];
		
		for (i = 0; i < len; i++){
			html.push(tpl.replace('%s',insertWbr(detail[i].name)));
		}
		
		return html.join('');
	}
};

/**
 * 气泡：日历被修改后的提醒
 */
ui.Bubble.source.managerCalendar = {
	type : 'normal',
	iconClass : 'ui_bubble_icon_none',
	position : {
		left : function(tar){
			var pos = baidu.dom.getPosition(tar);
			return pos.left + 10;
		},
		top : function(tar){
			var pos = baidu.dom.getPosition(tar);
			return pos.top - 22;
		}
	},
	showTimeConfig : 'default',		//显示控制
	needBlurTrigger : true,
	showByClick : false,			//鼠标点击显示
	showByOver : false,				//鼠标悬浮延时显示
	hideByOut : false,				//鼠标离开延时关闭
	title: function(){
		return "<div class='text_gray'>本次查询仅针对最近7天的数据。时间范围已调整为“<span class='text_red'>最近7天</span>”。</div>";
	},
	content: ' '
};

/**
 * 气泡：一键监控
 */
ui.Bubble.source.monitorShortcut = {
	type : 'tail',
	iconClass : 'ui_bubble_icon_none',
	positionList : [8,7,5,6,1,2,3,4],
	showTimeConfig : 'default',		//显示控制
	needBlurTrigger : true,
	showByClick : false,
	showByOver : false,				//鼠标悬浮延时显示
	showByOverInterval : 500,		//悬浮延时间隔
	hideByOut : true,				//鼠标离开延时关闭
	hideByOutInterval : 3000,		//离开延时间隔，显示持续时间
	title: '一键监控所有搜索结果',
	content: '点击该按钮，即可便捷的将所有筛选的结果进行监控。'
};

