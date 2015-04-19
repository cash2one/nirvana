/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/lib_widget.js 
 * desc: 账户优化子项摘要处理 
 * author: wanghuijun@baidu.com
 * date: $Date: 2011/06/17 $
 */

/**
 * 子项ID -> 子项widget模块的对应关系
 */
nirvana.ao.lib.widgetMap = {
    1 : {id: 1},
    2 : {id: 1},
//    7 : {id: 7},// 老的时段优化项正式下掉 by Huiyao 2013.4.15
    // 手动版时段升级用到的opttype
    52: {id: 52},
	
    5 : {id: 5},
    8 : {id: 8},
    9 : {id: 8},
    10 : {id: 8},
    11 : {id: 8},
    12 : {id: 8},
	
    13 : {id: 8},
	
    14 : {id: 8},
	
    4 : {id: 4},
    18 : {id: 18},
    19 : {id: 18},
	
    3 : {id: 3},
	
    15 : {id: 15},
    16 : {id: 15},
    17 : {id: 15},
	
    20 : {id: 20},
    21 : {id: 21},
	
    22 : {id: 22},
	
    24 : {id: 24},
	
    25 : {id: 25}
};

/**
 * 子项基类
 */
nirvana.ao.lib.widget = function() {
	this.timeTip = nirvana.config.AO.TIMESTAMP_MSG;
};

nirvana.ao.lib.widget.prototype = {
	/**
	 * 初始化，进行一些事件绑定
	 * @param {Object} json
	 */
	init: function(json){
		var me = this,
			itemId = json.itemId,
			data = json.data,
			aoControl = nirvana.aoControl,
			prefix = aoControl.widgetPrefix,
			item = aoControl.item,
			btns = baidu.q('ao_btn', prefix + itemId, 'a'),
			param = {
				id: 'Widget' + itemId,
				actionPath: 'ao/widget' + itemId,
				className : 'widget_detail',
				onclose: function(param, father, isCancel){ // 增加两个参数：father/isCancel by Huiyao 2013.1.18
					// 这里需要刷新子项设置的itemId---me.itemId   而不是传入的itemId
					if (aoControl.isMainPage()) { // 优化建议主页面
                        !isCancel && aoControl.refresh(me.itemId); // add by huiyao 2013.1.23: isCancel限定，但当前只有升级时段有效
					} else { // 推广管理页面
                        // 手动版升级的时段的摘要项 add by Huiyao 2013.1.21 等全流量后，上面的代码7的逻辑判断就可以删掉
                        // 不解的是，这个回调根本区分不了“取消”？！ 而且如果是在工具箱优化
                        // 建议操作，不管是取消还是保存都刷新优化项，见上面isMainPage分支
                        // 在推广管理页面，调用下面refresh方法也是全局刷新， 关键有些优化项
                        // 刷新逻辑又放在另一个地方。。。
						if (itemId != 1 && itemId != 2 /*&& itemId != 7 && itemId != 52*/) { // 预算建议和推广时段的“取消”保持目前状态，推广管理页面不刷新
							!isCancel && aoControl.refresh(me.itemId);
						}
					}
					
					if (itemId == 5) { // 关键词推荐特殊处理
                        KR_COM.needReload = false;
						fbs.keyword.getList.clearCache();
						ui.util.get('SideNav').refreshPlanList();
					}
					
					//监控参数
					var logParam = {
						opttype : me.itemId[me.itemId.length - 1], // 获取最后一个元素，为关闭时的opttype
						duration : me.getDuration()
					};
					
					if (itemId === 22) {
						// 跳出率状态，0代表创意，1代表关键词，没有则不传
						logParam.bounceratetype = AoWidget_22.bounceratetype;
					}
					
					if (param !== undefined) { //右上角关闭
						nirvana.aoWidgetAction.logCenter('aowidget_close_x', logParam);
					} else { //左下角关闭或确认
						nirvana.aoWidgetAction.logCenter('aowidget_close', logParam);
					}
					
					//if(itemId == 1 || itemId == 2){
						//强制隐藏那个一次性的新功能周预算气泡
						//ui.Bubble.hide('BubbleNewFuncShowOnce');
					//}
					
					//强制隐藏下载小问号提示
					ui.Bubble.hide('WidgetDownloadHelp');
					
					//当关闭子action时清空itemId
					me.itemId = [];
				/*	if(baidu.browser.firefox){
				 		baidu.un(document,'DOMMouseScroll',ui.Bubble.hideBubble);
					}else {
						baidu.un(document,'onmousewheel',ui.Bubble.hideBubble);
					}*/
                    
                    if (baidu.q('ui_bubble_wrap')[0]) {
                        baidu.removeClass(baidu.q('ui_bubble_wrap')[0],'bubble_decr');
                    }

                    // 从util.openSubActionDialog移动过来：add by Huiyao 2013.1.18
                    //add by LeoWang(wangkemiao@baidu.com) 彻底清除dialog 去除子Action的残余信息
                    //2011-12-21去除nirvana.aoControl.isMainPage()判断
                    if(father && father.id === 'maskForScrollingSubDialog'){
                        //baidu.hide('maskForScrollingSubDialog');
                        baidu.un(window, 'resize', nirvana.aoWidgetAction.doExtendSubDialogScrollEventHandler);
                        document.body.removeChild(baidu.g('maskForScrollingSubDialog'));
                    }
                    if(father && father.id === 'recMaskForScrollingSubDialog') {
                        baidu.un(window, 'resize', nirvana.aoWidgetAction.doExtendRecSubDialogScrollEventHandler);
                        document.body.removeChild(baidu.g('recMaskForScrollingSubDialog'));
                    }
				}
			},
			itemParam = {};
		switch (itemId) {
			case item['account_budget']:
				itemParam = {
					className: '',
					title: '预算建议',
					width: 655,
					params: {
						type: 'useracct',
						planid: [],
						isTool: aoControl.isMainPage(),
						itemId : itemId
					}
				};
				break;
			case item['plan_budget']:
				itemParam = {
					className: '',
					title: '预算建议',
					width: 655,
					params: {
						type: 'planinfo',
						isTool: aoControl.isMainPage(),
						itemId : itemId
					}
				};
				break;
			case item['plan_schedule']:
				itemParam = {
					className: '',
					title: '修改推广时段',
					width: 660,
					params: {
						isTool: aoControl.isMainPage(),
						isAo: true,
						itemId: itemId
					}
				};
				break;
			case item['word_bid']:
				itemParam = {
					title: '关键词出价优化',
					width: 900,
					params: {
						isTool: aoControl.isMainPage(),
						itemId: itemId
					}
				};
				break;				
			case item['word_deactive']:
			case item['word_invalid']:
			case item['word_lowsearch']:
			case item['word_bad']:
			case item['word_pause']:
				itemParam = {
					title: '关键词状态优化',
					width: 900,
					params: {
						isTool: aoControl.isMainPage(),
						itemId: itemId
					}
				};
				break;
			case item['unit_pause']:
				itemParam = {
						title: '单元状态优化',
						width: 900,
						params: {
							isTool: aoControl.isMainPage(),
							itemId: itemId
						}
					};
					break;
			case item['plan_pause']:
				itemParam = {
					title: '计划状态优化',
					width: 900,
					params: {
						isTool: aoControl.isMainPage(),
						itemId: itemId
					}
				};
				break;
			case item['bouncerate']:
				itemParam = {
					title: '跳出率',
					width: 900,
					params: {
						isTool: aoControl.isMainPage(),
						itemId: itemId
					}
				};
				break;			
			case item['disconnectrate']:
				itemParam = {
					title: '无法连通的推广页面',
					width: 980,
					params: {
						isTool: aoControl.isMainPage(),
						itemId: itemId
					}
				};
				break;
			
			/***************** LeoWang(wangkemiao@baidu.com) *****************/
			case item['word_quality']:
				itemParam = {
					title: '左侧展现资格优化',
					width: 900,
					params: {
						isTool: aoControl.isMainPage(),
						isAo : true,
						itemId: itemId
					}
				};
				break;
			case item['word_bid_screen']:
				itemParam = {
					title: '左侧首屏展现概率提示',
					width: 900,
					params: {
						isTool: aoControl.isMainPage(),
						itemId: itemId
					}
				};
				break;
			case item['word_bid_first']:
				itemParam = {
					title: '左侧首位展现概率提示',
					width: 900,
					params: {
						isTool: aoControl.isMainPage(),
						itemId: itemId
					}
				};
				break;
			case item['idea_active']:
			case item['idea_bad']:
			case item['idea_pause']:
				itemParam = {
					title: '创意状态优化',
					width: 900,
					params: {
						isTool: aoControl.isMainPage(),
						itemId: itemId
					}
				};
				break;
				
				/************************ wanghuijun ************************/
			case item['loadtime']:
				itemParam = {
					title: '以下页面打开速度需要优化',
					width: 980,
					params: {
						isTool: aoControl.isMainPage(),
						itemId: itemId
					}
				};
				break;
			case item['word_add']:
				itemParam = {
					id: 'AddKeywordDialog',
					title: '添加关键词',
					width: 1010,
					params: {
						isAo: true,
						isTool: aoControl.isMainPage(),
						itemId: itemId,
						// 以下是kt需要传入的参数
						className: 'skin_keyword_add',
						queryMap: {},
						isInNewFlow: true, // 同新建流程
						popup_entry: aoControl.isMainPage() ? 'kr_ao_tool' : 'kr_ao_manage',//入口标识，用于监控
						isResize : true //是否大小随窗口改变
					}
				};
				break;
			default:
				break;
		}
		
		baidu.extend(param, itemParam);
		
		for (var i = 0, j = btns.length; i < j; i++) {
			switch (itemId) {
				case item['account_budget']:
					var planid = 0, // 账户预算需要传入planid []
						bgtstatus = data[i].bgtstatus; 
					param.params.bgttype = bgtstatus == 4 ? 2 : 1;
					break;
				case item['plan_budget']: // data的index与button的index相同
					var planid = data[i].planid,
						bgtstatus = data[i].bgtstatus,
						planname = data[i].planname;
					param.params.bgttype = 1;
					if('undefined' != typeof planname){
						param.params.planname = planname;
					}
					break;
				case item['plan_schedule']:
					var planid = data[i].planid;
					break;
				default:
					break;
			}
			
			btns[i].onclick = function(planid, bgtstatus, planname) {
				// 传入planid
				return function(e){
					var e = e || window.event;
					// 初始化itemId，这里必须是数组
					me.itemId = [itemId];
					me.timeStamp = new Date();
					
					if (aoControl.isMainPage()) {
						param.father = nirvana.aoWidgetAction.doExtendSubDialogScrolling();
					}
					
					if (planid) {
						param.params.planid = [planid];
					}
					if(planname){
						param.params.planname = [planname];
					}

					//add by LeoWang(wangkemiao@baidu.com
					//周预算特有监控
					//发送监控
					if(itemId == item['account_budget'] || itemId == item['plan_budget']){
						manage.budget.logParam = {
							'entrancetype' : 3
						};
					}
					
					// 获取效果突降的日期
					nirvana.decrControl.getDate();
					
					//add ended
					
					if(itemId === 5){
						//clearTimeout(KR_ACTV.getActvKR);
						ToolsModule.unloadKR();
					}

                    // modify by Huiyao: 对于推广时段修改不采用action形式 2013.1.5
                    if (itemId === 52) {
                        var dlg = new nirvana.ScheduleOptimizer();

                        var scheduleCallback = function(isCancel) {
                            return function(closeByX) {
                                this.close();
                                param.onclose
                                && param.onclose(closeByX, param.father, isCancel);
                                // 不关闭对话框，上面已经执行过，之所以这种关闭逻辑，主要
                                // 是保持跟onclose回调现有代码逻辑一致，没办法。。
                                return false;
                            };
                        };
                        // 注册取消、提交成功的事件回调
                        dlg.onSuccess = scheduleCallback(false);
                        dlg.onCancel = scheduleCallback(true);

                        var options = {
                            planIds: [planid]
                        };

                        // 请求数据成功的处理器
                        dlg.responseSuccessHandler = function(result) {
                            // 对于status返回成功情况下，不一定成功，还得再通过aostatus判断下
                            if (result.data.aostatus != 0) {
                                this.responseFailHandler();
                                return;
                            }
                            var cycnum = result.data.listData[0].suggestcyccnt;
                            var superMethod = nirvana.ScheduleOptimizer.superClass.responseSuccessHandler;

                            // 后端拿不到推荐时段信息，实际上是读取数据失败，但后端却
                            // 返回200，所以这里需特殊处理跟后端约定只要是建议时段数量
                            // 返回0就当异常处理，这个只在手动版的时段升级里出现，所以
                            // 不想污染原有代码，就暂时放这里
                            (cycnum === 0)
                                ? this.responseFailHandler()
                                : superMethod.apply(this, arguments);
                        };
                        // 初始化时段的Tip
                        dlg.onLoad = function(data) {
                            var tip = lib.tpl.parseTpl(data, "aoScheduleTip", true);
                            var tipElem = this.getElement('.widget_tip')[0];
                            tipElem && (tipElem.innerHTML = tip);
                        };
                        options.tplData = { tip: '' };
                        options.requestFunc = 'ao';

                        dlg.show(options, param.params);
                    }
                    else {
                        nirvana.util.openSubActionDialog(param);
                    }

					if (itemId === 5) {
						// 关键词推荐特殊逻辑。。
						clearTimeout(nirvana.subaction.resizeTimer);
						baidu.g('ctrldialogAddKeywordDialog').style.top = baidu.page.getScrollTop() + 'px';
					}
					
					aoControl.isViewDetail = true;
					
					//监控 点击查看某个子项详情时
					var logParam = {
						opttype : itemId
					};
					
					switch (itemId) {
						case item['account_budget']:
							logParam.status = bgtstatus;
							logParam.bgttype = bgtstatus == 4 ? 2 : 1;
							break;
						case item['plan_budget']:   // 计划预算记录planid，bgtstatus
							logParam.planid = planid;
							logParam.status = bgtstatus;
							logParam.planname = planname;
							logParam.bgttype = 1;
							break;
						case item['plan_schedule']: // 推广时段记录planid
							logParam.planid = planid;
							break;
						default:
							break;
					}
					
					// 打开子项详情时，获取当前监控快照
					aoControl.snapShot = aoControl.getLogSnapshot();
					
					nirvana.aoWidgetAction.logCenter('ao_view_problem', logParam);
					
					baidu.event.stop(e);
				};
			}(planid, bgtstatus, planname);
		}
		
		me.shortCut(json);
	},
	
	// 绑定快捷方式--启用、全部启用等
	shortCut : function() {},
	
	/**
	 * 子项填充HTML
	 * @param {Object} json
     * @param {boolean} isManageAoWidget 是否是主动提示区优化建议，只在真正渲染优化项摘要
     *                  才会传入该参数
     *                  add by huiyao 2013.3.21
	 */
	fill : function(json, isManageAoWidget) {
		var prefix = nirvana.aoControl.widgetPrefix,
			itemId = json.itemId,
			html = json.html,
			dom = baidu.g(prefix + itemId);
		
		if (dom) {
			dom.innerHTML = html;
		}

        // 初始化过程，始终只显示前三条，由于后端返回数据不一定是按照请求顺序返回的
        // by huiyao 2013.3.21
        if (isManageAoWidget) {
            var optItems = $$('#AoGroupDefault li p');
            for (var i = 0, len = optItems.length; i < len; i ++) {
                i < 3 ? baidu.show(optItems[i]) : baidu.hide(optItems[i]);
            }
        }
	},
	
	/**
	 * 渲染结果
	 * @param {Object} timeString
	 * @param {Object} itemId
	 * @param {Object} data
     * @param {boolean} isManageAoWidget 是否是主动提示区优化建议 add by huiyao 2013.3.21
	 */
	renderResult: function(timeString, itemId, data, isManageAoWidget){
		var me = this,
			html = er.template.get('widgetAbstract' + itemId),
			value = (data && data[0].value) || [''],
			level = nirvana.aoControl.params.level,
			tipLevel = nirvana.config.AO.LEVEL_TIP[level.toUpperCase()] || nirvana.config.AO.LEVEL_TIP['WORDINFO'];

        if (isManageAoWidget) {
            // 初始显示的优化项摘要为隐藏，by Huiyao 2013.3.21
            html = html.replace(/<p/, '<p style="display:none"');
        }

		html = me.buildResult({
			itemId : itemId,
			data : data,
			html : html
		});
		
		html = html.replace(/%n/, value[0]); // 需要优化的物料数量，如果没有value，则%n已经在widget.js中保证替换
		html = html.replace(/%time/g, timeString); // 时间戳
		html = html.replace(/%tiptime/g, me.timeTip); // 时间戳title
		html = html.replace(/%level/g, level); // 层级图标class
		html = html.replace(/%tiplevel/g, tipLevel); // 层级图标提示
		
		if (itemId == 24) {
			html = html.replace(/%link/, HOLMES_HOMEPAGE_URL); // 24特殊链接
		} else {
			html = html.replace(/%link/, CLASSICS_PAY_URL); // 30特殊链接
		}
		
		me.fill({
			itemId: itemId,
			html: html
		}, isManageAoWidget);
        
        me.show(itemId);
	},
	
	/**
	 * 组装result的html
	 * @param {Object} json
	 */
	buildResult : function(json){
		return json.html;
	},
	
	/**
	 * Loading显示
	 * @param {Object} json
	 */
    renderLoading: function(json){
		var me = this,
			itemId = json.itemId,
			title = nirvana.config.AO.LOADING_TITLE[itemId];
		
		me.fill({
			itemId: itemId,
			html: me.buildLoading(title)
		});
		
		me.show(itemId);
	},
	
	/**
	 * 组装loading的html
	 * @param {Object} title
	 */
	buildLoading : function(title){
		var html = er.template.get('widgetLoading').replace(/%title/, title);
		
		return html;
	},
	
	/**
	 * 渲染超时
	 * @param {Object} timeString
	 * @param {Object} itemId
	 * @param {Object} data
     * @param {boolean} isManageAoWidget 是否是主动提示区优化建议 add by huiyao 2013.3.21
	 */
	renderTimeout : function(timeString, itemId, data, isManageAoWidget){
		var container = baidu.g(nirvana.aoControl.widgetPrefix + itemId),
			msg = '',
			level = nirvana.aoControl.params.level,
			tipLevel = nirvana.config.AO.LEVEL_TIP[level.toUpperCase()] || nirvana.config.AO.LEVEL_TIP['WORDINFO'];
		
		switch (level) {
			case 'useracct': //账户层级
				msg = '由于您账户内关键词数量较多，导致此次分析无法全部完成，建议您选择计划或单元后再次查看';
				break;
			case 'planinfo': //计划层级
				msg = '由于您计划内关键词数量较多，导致此次分析无法全部完成，建议您选择单元后再次查看';
				break;
			case 'unitinfo': //单元层级
				msg = '由于您单元内关键词数量较多，导致此次分析无法全部完成，建议您拆分单元后再次查看';
				break;
			default:
				msg = '由于您当前层级关键词数量较多，导致此次分析无法全部完成，建议您选择其他层级再次查看';
				break;
		}
		
		if (!nirvana.aoControl.cacheData[itemId].hasProblem) {   // 没有发现问题
			var html = er.template.get('widgetTimeout');
			
			html = html.replace(/%msg/g, msg);
			html = html.replace(/%time/g, timeString);
			html = html.replace(/%level/g, level); // 层级图标class
			html = html.replace(/%tiplevel/g, tipLevel); // 层级图标提示
			
			container.innerHTML = html;
		} else {
            // 增加最后一个参数，用于区分是主动提示区还是工具箱优化建议 by huiyao 2013.3.21
			this.renderResult(timeString, itemId, data, isManageAoWidget);
			
			//增加超时说明
			var aoMeta = baidu.dom.q('ao_meta', container, 'span');
			
			for (var i = 0, j = aoMeta.length; i < j; i++){
				baidu.addClass(aoMeta[i], 'ao_timeout');
		        aoMeta[i].innerHTML = '超时';
				aoMeta[i].title = msg;
			}
			
		}
        
        this.show(itemId);
	},
	/**
	 * 提示优化成功
	 * @param {Object} timeStamp
	 * @param {Object} itemId
	 * @param {Object} data
	 */
	renderSuccess : function(timeStamp, itemId, data){
		var me = this,
			that = nirvana.aoControl;
		
		//读取显示loading前的html结构，若没有，则直接隐藏该项并结束
		if (!that.htmlCacheBeforeRefresh[itemId]) {
			me.hide(itemId);
			return;
		}
		
		var container = baidu.g(nirvana.aoControl.widgetPrefix + itemId);
		container.innerHTML = that.htmlCacheBeforeRefresh[itemId];

		var aoMeta = baidu.dom.q('ao_meta', container, 'span');
		if (aoMeta.length == 0) {
			me.hide(itemId);
			return;
		}
		
		/**
		// 清除建议和快速操作按钮，主要为了腾地方
		var aoOffer = getElementsByClassName('aoOffer', container, 'span');
		var aoEnable = getElementsByClassName('aoEnable', container, 'a');
						
		for (var i = 0, j = aoOffer.length; i < j; i++) {
			aoOffer[i].innerHTML = '';
		}
		for (var i = 0, j = aoEnable.length; i < j; i++) {
			aoEnable[i].innerHTML = '';
		}
		*/
						
		for (var i = 0, j = aoMeta.length; i < j; i++) {
			baidu.addClass(aoMeta[i], 'ao_success');
			aoMeta[i].innerHTML = '已完成优化';
		}
		
		//1.5s后隐藏
		setTimeout(function(){
			that._fadeOut(container.getElementsByTagName('p'), {
				duration : 500,
				callback : function(){
					// 触发大项隐藏（如需要）
					that.invokeWidget('hide', itemId, timeStamp, function(){
						//如果是层级列表，显示第N + 1条
						if (!that.isMainPage()) {
							container.innerHTML = '';
							baidu.show(container);
						};
											});
				}
			});
		}, 1500);
	},
	
    show : function(itemId){
        var itemContainer = baidu.g(nirvana.aoControl.widgetPrefix + itemId);
        
        baidu.show(itemContainer);
    },
	
    hide : function(itemId){
        var itemContainer = baidu.g(nirvana.aoControl.widgetPrefix + itemId);
        
        itemContainer && ((itemContainer.innerHTML = '') || baidu.hide(itemContainer));
    },
	
	// 获得Dialog开启至今的时间
	getDuration : function() {
		var me = this,
			now = (new Date()).valueOf();
		
		return now - me.timeStamp.valueOf();
	}
};

/**
 * 子项公用渲染方法
 */
nirvana.ao.lib.widgetRender = {
    /**
     * 计划列
     * @param {Object} item
     */
    planinfo : function(length){
		return function(item){
			var planname = baidu.encodeHTML(item.planname), 
				planid = item.planid, 
				html = [], 
				limit = length || nirvana.config.AO.DETAIL_MAX_LENGTH;
			
			html.push('<span title="' + planname + '">' + getCutString(planname, limit, '..') + '</span>');
			
			return html.join('');
		}
    },
	
    /**
     * 单元列
     * @param {Object} item
     */
    unitinfo : function(length){
		return function(item){
			var unitname = baidu.encodeHTML(item.unitname), 
			unitid = item.unitid, 
			html = [], 
			limit = length || nirvana.config.AO.DETAIL_MAX_LENGTH;
			
			html.push('<span title="' + unitname + '">' + getCutString(unitname, limit, '..') + '</span>');
			
			return html.join('');
		}
    },
	
    /**
     * 关键词列
     * @param {Object} item
     */
    wordinfo : function(length){
		return function(item){
			var showword = baidu.encodeHTML(item.showword), 
				winfoid = item.winfoid, 
				html = [], 
				limit = length || nirvana.config.AO.DETAIL_MAX_LENGTH;
			
			//将最大长度缩短来放突降图标
			if (item.decrLimit) {
				limit -= 8;
			}
			html.push('<span title="' + showword + '">' + getCutString(showword, limit, '..') + '</span>');
			
			return html.join('');
		}
    },
	
	/**
     * 点击
     * @param {Object} item
     */
    clks : function(item){
		var data = item.clks;
		
		if (data == '' || data == '-') {
			return data;
		}
		return parseNumber(data);
	},
	
    /**
     * 出价
     * @param {Object} item
     */
    // Deleted by Wu Huiyao, Refactor: 该方法定义在lib.field.bidInfo
    /*bid :  function(item){
		var bid = item.bid,
			html = [];
							
		html[html.length] = '<div class="edit_td" winfoid=' + item.winfoid + ' unitid=' + item.unitid + ' planid=' + item.planid + '>';
		if (bid) {
			html[html.length] = '<span class="word_bid">' + baidu.number.fixed(bid) + '</span>';
		} else {
			html[html.length] = '<span title="使用单元出价">' + baidu.number.fixed(item.unitbid) + '</span>';
		}
		html[html.length] = '<a class="edit_btn edit_btn_left" edittype="bid"></a>';
		html[html.length] = '</div>';
		return html.join('');
	},*/
	
	/**
	 * 花费
	 * @param {Object} item
	 */
	paysum : function(item){
		var data = item.paysum;
		
		if (data == '' || data == '-') {
			return data;
		}
		return baidu.number.fixed(data);
	},
						
	/**
	 * 一般状态
	 */
	statusNormal : function(item){
		return '<span class="ao_status">待激活</span>';
	},
	
	/**
	 * 不宜推广状态
	 */
	statusBad :	function(item){
		var fun = function ( type, statusCode, params, pauseStat){
				var paramString = '';
				if(params){
					paramString = baidu.json.stringify(params);//params里仅携带id等没有xss风险的属性
				}
		   		var tpl = '<div class="{0}"><span class="status_text"><span class="status_icon" data=\'' + paramString + '\'></span>{1}</span></div>';
		    	return nirvana.util.generateStat(type, statusCode, tpl, pauseStat);		
			};				
		
		return fun('word', 2, {
			winfoid : item.winfoid
		});
	},
	 
	/**
	 * 暂停推广状态
	 */
	statusPause : function(item){
		var fun = function ( type, statusCode, pauseStat, params ){
			var paramString = '';
			if(params){
				paramString = baidu.json.stringify(params);//params里仅携带id等没有xss风险的属性
			}
	   		var tpl = '<div class="{0}"><span class="status_text">{1}</span><span class="status_op_btn"></span></div>';
	    	return nirvana.util.generateStat(type, statusCode, tpl, pauseStat);		
		};
		
		return fun('word', 1, 1, {
			winfoid : item.winfoid
		});
	},
	beginvalue : function(item){ //期初值
		return item.beginvalue;
	},
	endvalue : function(item){ //期末值
		return item.endvalue;
	},
	decr : function(item){ //突降值
		return item.decr;
	},
	optRecommend : function(item) {
		return '<a href="#" class="recommend_word">拓展关键词</a>';
	},
	optRestore : function(item) {
		return '<a href="#" class="restore_word">添回关键词</a>';
	},
	
    /**
     * 下载全部
     * @param {Object} action
     */
    download : function(action) {
		var urlParam = [],
			url = nirvana.config.AO.DOWNLOAD_PATH,
			params = nirvana.aoControl.getNowControl().params,
			opttype = action.getContext('opttype'),
			totalnum = action.getContext('widget_no') || 0,
			param = {
				userid : nirvana.env.USER_ID,
				username : nirvana.env.USER_NAME
			},
			downForm = baidu.g('WidgetDownloadForm'),
			key,
			tmp,
			logParam = {
				opttype : opttype
			};
		
		baidu.extend(param, params);
		baidu.extend(param, params.condition);
		
		// 下载不需要signature command condition
		delete param.signature;
		delete param.command;
		delete param.condition;
		
		param.opttype = opttype;
		
		if (opttype === 22) {
			// 跳出率状态，0代表创意，1代表关键词，没有则不传
			param.bounceratetype = action.getContext('bounceratetype');
			logParam.bounceratetype = action.getContext('bounceratetype');
		}
		
		for (key in param) {
			var value = param[key];
			
			if (typeof(value) === 'object') {
				value = value.join(',');
			}
			
			//设置下载参数
			tmp = baidu.dom.create('input', {
				type : 'hidden',
				name : key,
				value : value
			});
			
			downForm.appendChild(tmp);
		}
		
		baidu.g('WidgetDownload').onclick = function(e) {
			var e = e || window.event;
				
			downForm.action = url;
			downForm.submit();
			
			//下载全部的监控
			nirvana.aoWidgetAction.logCenter('aowidget_download_all', logParam);
			
			baidu.event.stop(e);
		};
		
		if (totalnum > 1000) { // 下载超过1000条
			//nirvana.aoWidgetRender.downloadHelp();
			baidu.show('WidgetDownloadHelp');
		} else {
			baidu.hide('WidgetDownloadHelp');
		}
    },
	
	/**
	 * 下载超过1000的小问号
	downloadHelp : function() {
		// 配置help
		if (typeof(ui.Bubble.source.widgetDownloadHelp) == 'undefined') {
			ui.Bubble.source.widgetDownloadHelp = {
				type: 'tail',
				iconClass: 'ui_bubble_icon_help',
				positionList: [5, 6, 7, 8, 1, 2, 3, 4],
				needBlurTrigger: true,
				showByClick: true,
				showByOver: false, //鼠标悬浮延时显示
				hideByOut: false, //鼠标离开延时显示
				title: function(node){
					var ti = node.getAttribute('bubbletitle');
					
					return ti;
				},
				
				content: function(node, fillHandle, timeStamp){
					var ti = node.getAttribute('bubbletitle'),
						content = '';
					
					fbs.noun.getNoun({
						word: baidu.encodeHTML(ti),
						onSuccess: function(response){
							content = baidu.decodeHTML(response.data);
							
							setTimeout(function(){
								//为了防止第二次缓存作用下比return还快
								fillHandle(content, timeStamp);
							}, 200);
						},
						onFail: function(response){
							content = '读取数据失败';
							
							setTimeout(function(){
								//为了防止第二次缓存作用下比return还快
								fillHandle(content, timeStamp);
							}, 200);
						}
					});
					
					return IMGSRC.LOADING_FOR_TEXT;
				}
			};
		}
		
		ui.Bubble.init('WidgetDownloadHelp');
	},
	 */

	/**
	 * 概率格式化
	 * @param data
	 * @returns {String}
	 */
	probabilityFormat : function(data){
		var minPro = 0,
		    maxPro = nirvana.config.AO.PROBABILITY_INTERVAL;  //20
		while (data > maxPro){
			minPro = maxPro;
			maxPro += nirvana.config.AO.PROBABILITY_INTERVAL;  //PROBABILITY_INTERVAL
		}
		if (minPro > 0){
			if (maxPro >= 100){
				return ('80% 以上');
			}else{
				return (minPro + '%~' + maxPro + '%');
			}			
		}else{
			return ('20% 以下');
		}		
	}
};

/**
 * 子项公用的动作调用方法
 * added by LeoWang(wangkemiao@baidu.com)
 */
nirvana.ao.lib.widgetAction = {
	/**
	 * 删除关键字的公用动作方法
	 * @param ids {Array} 关键字的id信息
	 * @param caller {Object} 方法的调用者，都是子Action调用，用于执行子Action的刷新
	 * @param stateMap {Object} 需要去保持的状态...
	 * @param {Number} showqstat 关键词质量度，用于发监控，批量操作的删除为空
	 */
	doDeleteKeywordHandler : function(ids, caller, stateMap, showqstat){
		var me = this,
			title = '删除关键词',
	    	msg;
		
		if(!ids || ids.length == 0){
			return;
		}
		msg = '您确定删除所选的' + (ids.length > 1 ? ids.length + '个' : '') + '关键词吗？删除操作不可恢复。';
		
		var logParam = {
			opttype : caller.getContext('opttype'),
			id : ids,
			count : ids.length,
			type : -2
		};
		showqstat &&
			(logParam.showq_difficulty = qStar.getShowqDifficulty(showqstat));

		me.logCenter('aowidget_del_word', logParam);
		
		ui.Dialog.confirm({
			title: title,
			content: msg,
			onok: function(){
	    		fbs.keyword.del({
					winfoid: ids, 
	            	onFail: me.doDeleteKeywordFailHandler(),
	            	onSuccess : me.doDeleteKeywordSuccessHandler(caller, stateMap)
				});
				
				logParam.type = 1;
				me.logCenter('aowidget_del_word', logParam);
			},
			oncancel: function() {
				logParam.type = 0;
				me.logCenter('aowidget_del_word', logParam);
			}
		});
	},
	/**
	 * 删除关键字成功回调
	 * @param caller {Object} 调用者 为子Action
	 * @param stateMap {Object} 需要去保持的状态... 
	 * 							需要注意的是，如果你是清除某些状态，则需要在此处传入信息，及其值重设
	 * 							否则的话，不传也可以的
	 * @returns {Function}
	 */
	doDeleteKeywordSuccessHandler : function(caller, stateMap){
		var me = this;
    	return function(response){
			//cache clear, this is from keyword.js
			if (response.status != 300) {
				ui.util.get('SideNav').refreshPlanList();
				//清除关键字的缓存
				fbs.material.clearCache('wordinfo');
				fbs.avatar.getMoniFolders.clearCache();
				fbs.avatar.getMoniWords.clearCache();
				//me.refresh();
			}
			//刷新吧，少年
			caller.refreshSelf(stateMap);
    	};
	},
	/**
	 * 删除关键字失败回调
	 */
	doDeleteKeywordFailHandler : function () {
        var me = this;
        return function(response) {
            ajaxFailDialog();            
        };
    },
    
    
    doDeleteUnitHandler : function(ids, caller, stateMap){
    	var me = this,
			title = '删除推广单元',
	    	msg;
		
		if(!ids || ids.length == 0){
			return;
		}
		msg = '您确定删除所选的' + (ids.length > 1 ? ids.length + '个' : '') + '推广单元吗？删除操作不可恢复。';
		
		var logParam = {
			opttype : caller.getContext('opttype'),
			id : ids,
			count : ids.length,
			type : -2
		};

		me.logCenter('aowidget_del_unit', logParam);
		
		ui.Dialog.confirm({
			title: title,
			content: msg,
			onok: function(){
	    		fbs.unit.del({
					unitid: ids, 
	            	onFail: function(response){
	            		ajaxFailDialog();
	            	},
	            	onSuccess : me.doDeleteUnitSuccessHandler(caller, stateMap)
				});
				
				logParam.type = 1;
				me.logCenter('aowidget_del_unit', logParam);
			},
			oncancel: function() {
				logParam.type = 0;
				me.logCenter('aowidget_del_unit', logParam);
			}
		});
    },
    
    /**
	 * 删除单元成功回调
	 * @param caller {Object} 调用者 为子Action
	 * @param stateMap {Object} 需要去保持的状态... 
	 * 							需要注意的是，如果你是清除某些状态，则需要在此处传入信息，及其值重设
	 * 							否则的话，不传也可以的
	 * @returns {Function}
	 */
	doDeleteUnitSuccessHandler : function(caller, stateMap){
		var me = this;
    	return function(response){
			//cache clear, this is from unit.js
			if (response.status != 300) {
				fbs.material.clearCache('unitinfo');
				//创意、关键词、文件夹详情、排行榜
				fbs.material.ModCache('wordinfo', 'unitid', unitids, 'delete');
				fbs.material.ModCache('ideainfo', 'unitid', unitids, 'delete');
				fbs.avatar.getMoniFolders.clearCache();
				fbs.avatar.getMoniWords.ModCache('unitid', unitids, 'delete');
				fbs.material.getTopData.clearCache();
				ui.util.get('SideNav').refreshPlanList();
				
			}
			//刷新吧，少年
			caller.refreshSelf(stateMap);
    	};
	},
    
    
	/**
     * 批量修改出价(需要修改params等)
	 * @param {Object} action
	 * @param {Object} winfoid
	 * @param {Object} bid
	 * @param {Object} name 即showword
     * @returns {Function} 弹窗显示函数
     */
	modBidClickHandler: function(action, winfoid, bid, name){
		var logParam = {
			opttype : action.getContext('opttype'),
			id : winfoid,
			count : winfoid.length,
			type : -2,
			new_value : 0
		};
		
		//点击打开dialog时的监控
		nirvana.aoWidgetAction.logCenter('aowidget_batch_modify_bid', logParam);
		
		nirvana.util.openSubActionDialog({
			id: 'modifyWordBidDialog',
			title: '关键词出价',
			width: 440,
			actionPath: 'manage/modWordPrice',
			maskLevel : 2,
			params: {
				action : action,
				winfoid : winfoid,
				bid : bid,
				name : name,
				fromProcedure : 'ao',
				logParam : logParam
			},
			onclose: function(){}
		});
				
	},		

	/**
	 * 行内修改出价
	 * @param {Object} action
	 * @param {Object} target
	 * @param {Object} item
	 */
	inlineBid:function(action, target, item){
		var parent = target.parentNode,
			winfoid = parent.getAttribute('winfoid') || item.winfoid,
			unitid = parent.getAttribute('unitid') || item.unitid,
			planid = parent.getAttribute('planid') || item.planid,
			bid = item['bid'] ? baidu.number.fixed(item['bid']) : baidu.number.fixed(item['unitbid']),
			logParam = {
				opttype : action.getContext('opttype'),
				planid : item.planid,
				unitid : item.unitid,
				winfoid : item.winfoid,
				old_value : bid,
				new_value : 0,
				type : -2
			};
			
		nirvana.aoWidgetAction.logCenter('aowidget_modify_bid', logParam);
			
		nirvana.inline.createInlineLayer({
			type: 'text',
			value: bid,
			id: 'bid' + winfoid,
			target: parent,
			okHandler: function(wbid){
				return {
					func: fbs.keyword.modBid,
					param: {
						winfoid: [winfoid],
						bid: wbid,
						onSuccess: function(data){
							if (data.status != 300) {
								var modifyData = {};
								modifyData[winfoid] = {
									'bid': wbid
								};
								var pausestat = data.data[winfoid];
								for (var item in pausestat) {
										modifyData[winfoid][item]= pausestat[item];
								}
								fbs.avatar.getMoniWords.ModCache('winfoid', modifyData);
								fbs.material.ModCache('wordinfo', 'winfoid', modifyData);
								
								//修改出价的监控
								logParam.type = 1;
								logParam.new_value = wbid;
								nirvana.aoWidgetAction.logCenter('aowidget_modify_bid', logParam);
								
								action.setContext('pageNo', 1);
								action.refreshSelf(action.getStateMap());
							}
						}
					}
				};
			},
			cancelHandler : function(wbid){
				//这里是用来直接执行的 不需要返回一个函数了
				
				//取消修改出价的监控
				logParam.type = 0;
				logParam.new_value = wbid;
				nirvana.aoWidgetAction.logCenter('aowidget_modify_bid', logParam);
			}
		});
	},	
	
	/**
	 * 公共监控数据
	 * @param {Object} actionName
	 * @param {Object} param
	 * 快捷方式
	 * logCenter('ao_stage_filter');                    // 工具箱漏斗模型筛选按钮
	 * logCenter('ao_view_problem');                    // 点击查看各个子项详情
	 * logCenter('ao_option_set');                      // 选项设置
	 * logCenter('ao_quick_accept');				    // 快捷启用
	 * logCenter('ao_data_slt');				        // 数据区域
	 * 
	 * logCenter('ao_level_switch');				    // 主页面选择不同级别
	 * logCenter('ao_level_list');				        // 不同级别的设置
	 * logCenter('ao_level_option');				    // 打开设置后里面的操作按钮
	 * logCenter('ao_custom_set');				        // 设置
	 * logCenter('ao_custom_save');				        // 自定义保存
	 * 
	 * logCenter('ao_tip_toggle');				        // 收起展开
	 * logCenter('ao_tip_page');				        // 主动提示区翻页
	 * 
	 * logCenter('aowidget_page');                      // 详情翻页
	 * logCenter('aowidget_download_all');			    // 下载全部
	 * logCenter('aowidget_close');					    // 左下角关闭
	 * logCenter('aowidget_close_x');				    // 右上角关闭x
	 * logCenter('aowidget_batch_modify_bid');		    // 批量修改出价
	 * logCenter('aowidget_modify_bid');				// 修改出价
	 * logCenter('aowidget_del_word');		    		// 删除关键词
	 * logCenter('aowidget_add_idea');				    // 添加创意
	 * logCenter('aowidget_edit_idea');				    // 编辑创意
	 * logCenter('aowidget_toggle_idealist)				// 展开或者收起创意
	 * logCenter('aowidget_del_unit')					// 删除单元
	 */
	logCenter : function(actionName, param) {
		var logParam = {
			target : actionName
		};
		
		baidu.extend(logParam, param);
		
		if (actionName.indexOf('aowidget') !== -1) { // 详情监控需要记录打开时的快照
			nirvana.aoControl.sendLog(logParam, nirvana.aoControl.snapShot);
		} else {
			nirvana.aoControl.sendLog(logParam);
		}
	},
	
    /**
     * 获取创意列表
     * @param item {Object} 条件信息，例如表格中一行的信息，按条件搜索应包括unitid、planid
     * @param successCallBack {Function} 成功回调函数 
     * @param failCallBack {Function} 可选 失败回调函数 无论如何会提示错误信息，默认不做处理
     * @param expandFields {Array} 可选 需要去扩展的Fields，即额外需要的信息
     */
    getIdeaList : function(item, successCallBack, failCallBack, expandFields){
    	var me = this,
    		param = {
    			limit : nirvana.limit_idea,
    			onSuccess : successCallBack,
    			//function(res){
    				//successCallBack && successCallBack(res);
    			//},
    			onFail: function(res){
                    ajaxFailDialog();
                    failCallBack && failCallBack(res);
                }
    		};
    	if (item.unitid){
            param.condition = {unitid : [item.unitid]};
        } else if (item.planid) {
            param.condition = {planid : [item.planid]};
        }
    	
    	nirvana.manage.UserDefine.getUserDefineList('idea', function(){
			var ud = nirvana.manage.UserDefine,
			    localList = [],
			    i,len,e;
			for (i = 1, len = ud.attrList['idea'].length; i < len; i++){
				localList[i - 1] = ud.attrList['idea'][i];
			}
			if('undefined' == typeof expandFields || expandFields.length == 0){
				localList.push('ideaid');
				localList.push('shadow_ideaid');
				localList.push('shadow_ideastat');
				localList.push('title');
				localList.push('shadow_title');
				localList.push('desc1');
				localList.push('shadow_desc1');
				localList.push('desc2');
				localList.push('shadow_desc2');
				localList.push('url');
				localList.push('shadow_url');
				localList.push('showurl');
				localList.push('shadow_showurl');
				localList.push('unitid');
				localList.push('planid');
				localList.push('pausestat');
				localList.push('activestat');
			}
			else{
				for(e in expandFields){
					localList.push(e);
				}
			}
			
			fbs.material.getAttribute('ideainfo',localList,param);
		});
    	
    },
    
    /**
	 * 创建子Action，针对于创意
	 * @param param {Object} 创建时需要的参数信息
	 * 		例如指定了计划单元的添加	param.unitid = item.unitid;
	 *								param.planid = item.planid;
	 *								param.type = 'add';
	 *								param.changeable = false;
	 ***************************************************************
	 * 		编辑						
	 *								param.ideaid = item.ideaid;
	 *								param.type = 'edit';
	 *								param.changeable = false;        //这个是指能不能修改计划、单元
	 */
    createSubActionForIdea : function(param, from){
		var me = this;
		if(typeof(param) == 'undefined') {
			param = {};
		}
		//使用fromSubAction来标记申请创意子Action时的来源也是一个子Action
		//这样就不能去刷新整个页面了，而是去刷新这个子Action
		if('undefined' == typeof param.fromSubAction){
			param.fromSubAction = true;
		}
		param.entranceType = 'ao';
		if('undefined' == typeof param.father){
			param.father = from;
		}
		param.maskLevel = param.maskLevel || 2;
		param.opttype = from.getContext('opttype');
		
		nirvana.manage.createSubAction.idea(param);
	},
	
	/**
	 * 为在专门的优化页面中打开的子Action添加滚动条支持
	 * 
	 * @param isDecr {Boolean} 是否是效果突降
	 * 
	 */
	doExtendSubDialogScrolling : function(isDecr){
		var me = this,
			kslfdiv;
		
		//如果在工具箱里面
		if(nirvana.aoControl.isMainPage() || isDecr){
			kslfdiv = baidu.dom.create('div', 
				{
					'id' : 'maskForScrollingSubDialog',
					'class' : 'scrolling_subdialog_container'
				}
			);
			
			document.body.appendChild(kslfdiv);
			
			nirvana.aoWidgetAction.doExtendSubDialogScrollEventHandler();
			
			baidu.on(window, 'resize', nirvana.aoWidgetAction.doExtendSubDialogScrollEventHandler);
		}
		else{
			kslfdiv = document.body;
		}
		
		return kslfdiv;
	},
	
	/**
	 * 监听函数用来控制maskForScrollingSubDialog大小的函数
	 */
	doExtendSubDialogScrollEventHandler : function(){
		baidu.setStyles('maskForScrollingSubDialog', {
			'width' : baidu.page.getViewWidth() + 'px',
			'height' : baidu.page.getViewHeight() + 'px'
		});
	},
	
	/**
	 * 监听函数用来控制recMaskForScrollingSubDialog大小的函数
	 */
	doExtendRecSubDialogScrollEventHandler : function(){
		baidu.setStyles('recMaskForScrollingSubDialog', {
			'width' : baidu.page.getViewWidth() + 'px',
			'height' : baidu.page.getViewHeight() + 'px'
		});
	},
	
	/**
	 * 突降追加话术
	 */
	decrWord : function(html,value,word){
		if(value){
			html = html.replace(/%decr/,word);
		}else{
			html = html.replace(/%decr/,'');
		}
		return html;
	},
	
	/**
	 * 突降bubble显示内容
	 * @param {Object} title
	 * @param {Object} item
	 */
	makeBubble : function(me,title,item){
		var html = '',
			opttype = me.getContext('opttype');
		
		html += '<span class="ui_bubble decr_bubble" bubblesource="decr" bubbletitle="'+title+'"';
		html += ' beginvalue="' + item.beginvalue + '" endvalue="' + item.endvalue + '" '
		
		// 只有质量度过低详情需要质量度信息
		if(item.beginshowq && opttype == 3) {
			html += 'beginshowq="' + item.beginshowq +'"endshowq="' + item.endshowq +'"';
		}
		
		html += 'decr="' + item.decr + '" valuetype="' + nirvana.config.AO.VALUE_TYPE[opttype] + '"> </span>';
		return html;
	},
	
	/**
	 * 处理滚轮事件
	 */
	hideBubble : function(){
		var top = baidu.g('maskForScrollingSubDialog') ? baidu.g('maskForScrollingSubDialog').scrollTop : 0;//用于滚轮时关闭bubble
		setTimeout(
					function(){if (baidu.g('maskForScrollingSubDialog') && baidu.q('bubble_decr').length > 0 && top != baidu.g('maskForScrollingSubDialog').scrollTop) {
						baidu.hide(baidu.q('bubble_decr')[0]);
					}
				},500);
	},
	
	/**
	* 层级TAB切换动作
	*/
	getTabHandler : function (me,dialogTitle) {
		
	    return function(tabIndex){
			var old_value = me.getContext('tabIndex'),
				tabIndexToId = me.getContext('tabIndexToId'),
				logParam = {
					old_value : tabIndexToId[old_value],
					new_value : tabIndexToId[tabIndex]
				};
			
			me.logCenter('aowidget_tab', logParam);
			
			me.setContext('tabIndex', tabIndex);
			me.setContext('pageNo', 1);
			//效果突降里面切换tab页 dialog的Title要改变
			if(dialogTitle)
			{
				me.setTitle(dialogTitle[tabIndex]);
			}
			me.refreshSelf(me.getStateMap());
		};
	},
	
	/**
	 * 根据tab项显示不同的button
	 */
	showButton : function(me , tabIndex){
		var buttonIds,
			tmp,
			allButtonIds = [],
			i,
			len,
			buttonDom;
			
		allButtonIds = me.getContext('allButtonIds');	
		buttonIds = me.getContext('tabToButtonAndTip')[tabIndex]['button'];
		//如果没有按钮，则隐藏按钮区域 
		if(buttonIds.length == 0) {
			baidu.addClass(baidu.q('widget_option')[0], 'hide');
		}else{
			baidu.removeClass(baidu.q('widget_option')[0], 'hide');
		}
		for (i = 0, len = buttonIds.length; i < len; i++){
			baidu.array.remove(allButtonIds, buttonIds[i]);  
			buttonDom = ui.util.get(buttonIds[i]).main.parentNode;
			if (baidu.dom.hasClass(buttonDom, 'hide')){
				baidu.removeClass(buttonDom, 'hide');
			}
		}
		for (i = 0, len = allButtonIds.length; i< len; i++){
			buttonDom = ui.util.get(allButtonIds[i]).main.parentNode;
			if (!baidu.dom.hasClass(buttonDom, 'hide')){
				baidu.addClass(buttonDom, 'hide');
			}			
		}
	},
	
	/**
	 * 请求模板
	 * @param {Object} id
	 */
	requestTpl : function(me,params, startIndex, endIndex, tabIndex, callback){

		return {
			level : params.level,
			condition : params.condition,
			signature : '',
			startindex : startIndex,
			endindex : endIndex,
				
			onSuccess : function(response) {
				var data = response.data,
					aostatus = data.aostatus,
					listData = data.listData;
					
				if (aostatus != 0) {
					switch (aostatus) {
						case 4: // 需要更详细的请求数据，不只是签名
							// 重新请求表格数据
							me.updateTableContent(tabIndex, callback);
							break;
						default:
							ajaxFailDialog(); // 相当于status 500
							break;
						}
						return;
				}
				
				var tip = me.getContext('tabToButtonAndTip')[tabIndex]['tip'];
				tip = tip.replace(/%n/, data.totalnum); 
				me.setContext('widget_no', data.totalnum);
				
				me.setContext('widget_tip', tip);					
				me.setContext('widgetTableData', listData);					
				// 计算总页数
				var totalPage = Math.ceil(data.totalnum / me.getContext('pageSize'));	
				// 保持原有逻辑，最大为100页
				totalPage = Math.min(totalPage, nirvana.config.AO.MAX_PAGE);
								
				me.setContext('totalPage', totalPage);
				me.setContext('pageNo', me.getContext('pageNo'));
				callback();	
			},
			onFail : function(response) {
				ajaxFailDialog();
				callback();
			}
		};
	},
	
	/**
	 * 获取选中行的数据
	 * @param {Object} id planid等需要得到的数据
	 * @return {Array} ids [planid, planid……]
	 */
    getSelected : function (me,id) {
        var selectedList = me.selectedList,
            data = me.getContext('widgetTableData'),
            i, len, ids = [];
			
		if (baidu.lang.isArray(id)) {
			for (i = 0, len = selectedList.length; i < len; i++) {
				var dat = {};
				for (var j = 0, l = id.length; j < l; j++) {
					dat[id[j]] = data[selectedList[i]][id[j]];
				}
				ids.push(dat);
			}
		}
		else {
			if (id == 'bid') {
				for (i = 0, len = selectedList.length; i < len; i++) {
					if (data[selectedList[i]][id]) {
						ids.push(data[selectedList[i]][id]);
					}
					else {
						ids.push(data[selectedList[i]]['unitbid']);
					}
				}
			}
			else {
				if(selectedList)
				for (i = 0, len = selectedList.length; i < len; i++) {
					ids.push(data[selectedList[i]][id]);
				}
			}
		}

        return ids;
    },
	
	/**
	 * 控制按钮的状态
	 */
	buttonEnableHandler : function (me) {
        var controlMap = me._controlMap; 
			
        return function (selected) {
            var enabled = selected.length > 0,
				modifyBid = controlMap.modifyBid,
				deleteItem = controlMap.deleteItem,
                activeItem = controlMap.activeItem,
                enableItem = controlMap.enableItem;
			
			me.selectedList = selected;
			enableItem.disable(!enabled);
			deleteItem.disable(!enabled);
			activeItem.disable(!enabled);
			modifyBid.disable(!enabled);


            // 读写分离，待升级之后不用这种方式了
            // by Leo Wang
			nirvana.acc.accService.processEntrances('ao/manual/' + me.VIEW);

        };    
    },	
	
    operationFailHandler : function () {
		
        return function (data) {
            ajaxFailDialog();            
        };
    },	
	
	/**
	 * 翻页
	 */
	getPageHandler : function(me) {
		
		return function(value, prevOrNext) {
			var old_value = me.getContext('pageNo'),
				logParam = {
					opttype : me.getContext('opttype'),
					old_value : old_value,
					new_value : value,
					type : 'number'
				};
			
			if (prevOrNext) { // 上一页或下一页
				logParam.type = prevOrNext;
			}
			
			me.setContext('pageNo', value);
			
			//page页点击页码的监控
			nirvana.aoWidgetAction.logCenter('aowidget_page', logParam);
				
			me.refreshSelf(me.getStateMap());
            
            return false;
		};
	},	

    /**
     * 表格行内操作事件代理器
     */
    getTableInlineHandler: function(me) {
    
        return function (e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
				logParams = {},
				type;
				
            while(target  && target != ui.util.get('WidgetTable').main){
                if(target.className && target.className == 'status_op_btn'){
					//应该根据pausestatus的不同来执行不同的操作
                    me.doInlinePause(target);
                    break;
                }
				if(baidu.dom.hasClass(target,'edit_btn')){
					var current = nirvana.inline.currentLayer;
					
					if (current && current.parentNode) {
						current.parentNode.removeChild(current);
					}
					type = target.getAttribute('edittype');
					switch(type){
						case 'bid':
							nirvana.aoWidgetAction.inlineBid(me, target, nirvana.aoWidgetAction.getLineData(me,target));
							logParams.target = 'editInlineBid_btn';
							break;
							/**
							 * 创意的编辑处理
							 * 添加于效果突降开发
							 * 
							 * Add By LeoWang(wangkemiao@baidu.com)
							 */
						case 'ideaid':
                			nirvana.aoWidgetAction.getIdeaHandler(me, target, 'edit');
                			break;
						case "wmatch":
							nirvana.aoWidgetAction.inlineWmatch(me,target);
							logParams.target = "editInlineWmatch_btn";
							break;
					}
					break;
				}
				
				//小灯泡 by Tongyao
				if(baidu.dom.hasClass(target, 'status_icon')){
					//小灯泡的监控
					me.logCenter('aowidget_status_icon', {
						itemId : me.getContext('opttype')
					});
					logParams.target = 'statusIcon_btn';
					//因为这里只有关键词和创意的小灯泡，所以这样进行判断了
					var level = target.getAttribute('data').indexOf('ideaid') > -1 ? 'ideainfo' : 'wordinfo';
					manage.offlineReason.openSubAction({
						action : me,
						type : level,
						maskLevel : 2,
						params : target.getAttribute('data')
					});
					break;
				}
				
				//推荐关键词 by yangji
				if(baidu.dom.hasClass(target,'recommend_word')){
					nirvana.aoWidgetAction.recommendWords(me,target);
					return false;
				}
				
				//添回关键词 by yangji
				if(baidu.dom.hasClass(target,'restore_word')){	
					nirvana.aoWidgetAction.restoreWords(me,target);
					return false;
				}
				
				/**
				 * 创意的相关动作
				 * 添加于效果突降项目开发中，用于公共的创意处理方法
				 * 主要处理“查看创意”、“添加创意”行为
				 * 
				 * Add By LeoWang(wangkemiao@baidu.com)
				 */
				if(baidu.dom.hasClass(target, 'idea_action_btn')){
                    var item = nirvana.aoWidgetAction.getLineData(target);
                	type = target.getAttribute('actiontype');
                	switch(type){
                		case "addidea":
                			nirvana.aoWidgetAction.getIdeaHandler(me, target, 'add');
                			break;
                		case "viewidea":
                			nirvana.aoWidgetAction.getIdeaHandler(me, target, 'view');
                			break;
                	}
                	break;
                }
				
                target = target.parentNode;
            }
			if(logParams.target){
				NIRVANA_LOG.send(logParams);
			}
        };
    },
    
	/**
	 * 行内修改匹配方式
	 * @param {Object} target
	 */
	inlineWmatch:function(me,target){
		var parent = target.parentNode,
			winfoid = parent.getAttribute("winfoid"), 
			wmatch = nirvana.aoWidgetAction.getLineData(me,target).wmatch;
		nirvana.inline.createInlineLayer({
			type: "select",
			value: wmatch,
			id: "wmatch" + winfoid,
			target: parent,
			datasource:[{
				text:"精确",
				value:"63"
			},{
				text:"短语",
				value:"31"
			},{
				text:"广泛",
				value:"15"
			}],
			okHandler: function(match){
				return {
					func: fbs.keyword.modWmatch,
					param: {
						winfoid: [winfoid],
						wmatch: match,
						onSuccess: function(data){
							if (data.status != 300) {
								var modifyData = {};
								modifyData[winfoid] = {
									"wmatch": match
								};
								fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
								fbs.material.ModCache('wordinfo', "winfoid", modifyData);
								me.setContext('pageNo', 1);
								me.refreshSelf(me.getStateMap());
							}
						}
					}
				}
			}
		});
	},
	
	/**
	 * 推荐关键词
	 * @param {Object} me
	 * @param {Object} target
	 */
	recommendWords : function(me,target){
		var tips = me.getContext('recWordTip'),
			tabIndex = me.getContext('tabIndex'),
			tip = '';
			
		if(tabIndex){
			tip = tips[tabIndex];
		}else{
			tip = tips;
		}
		
		var kslfdiv = baidu.dom.create('div', 
				{
					'id' : 'recMaskForScrollingSubDialog',
					'class' : 'scrolling_subdialog_container'
				}
			);
		
		baidu.setStyle(kslfdiv,'z-index','401');
		
		document.body.appendChild(kslfdiv);
			
		nirvana.aoWidgetAction.doExtendRecSubDialogScrollEventHandler();
		baidu.on(window, 'resize', nirvana.aoWidgetAction.doExtendRecSubDialogScrollEventHandler);
		
		//是否需要刷新
		me.setContext('recNeedRefresh',0);
		
		nirvana.util.openSubActionDialog({
			id: 'recommendWordDialog',
			actionPath: 'manage/recommendWord',
			maskLevel: 2,
			father : kslfdiv,
			title: '拓展关键词',
			width: 850,
			params: {
				queryMap: {
					planid : nirvana.aoWidgetAction.getRowIdArr(me, target, 'planid')[0],
					unitid : nirvana.aoWidgetAction.getRowIdArr(me, target, 'unitid')[0]
				},
				//关键词不宜推广、关键词检测量过低在tap页的第2，第3个
				tip : tip,
				showword : nirvana.aoWidgetAction.getRowIdArr(me, target, 'showword')[0].replace('[已删除]',''),
				action : me,
				isDecr : true
			},
			onclose : function(){
				if (me.getContext('recNeedRefresh')) {
					//点击保存后需要刷新
					me.setContext('pageNo', 1);
					me.setContext('recNeedRefresh',0);
					me.refreshSelf(me.getStateMap());
				}
			}
		})
	},
	
	/**
	 * 添回关键词
	 * @param {Object} me
	 */
	restoreWords : function(me,target){
		
		var tabIndex = me.getContext('tabIndex'),
			planid = [],
			planname = [],
			unitid = [], 
			unitname = [],
			showword = [], 
			opttypes = me.getContext('tabIndexToId'),
			fuc = function(wordData){
				var words = wordData.join('$');
				
				//卸载kr
				ToolsModule.unloadKR();
				
				wordData = words.replace('[已删除]','').split('$');
				nirvana.util.openSubActionDialog({
					id: 'restoreWordDialog',
					actionPath: '/tools/kr',
					maskLevel: 2,
					className : 'widget_detail',
					onclose: function(){
                        KR_COM.needReload = false;
						fbs.keyword.getList.clearCache();
						//ui.util.get('SideNav').refreshPlanList();
					},
					title: '添加关键词',
					width: 1010,
					params: {
						isAo: true,
						isDecr : true,
						// 以下是kt需要传入的参数
						className: 'skin_keyword_add',
						queryMap: {},
						isInNewFlow: true, // 同新建流程
						//关键词被删除是计划及单元不为空
						//单元被删除是计划不为空
						restoreWords: wordData,
						unitid: unitid[0],
						planid: planid[0],
						action: me,
						isResize : true //是否大小随窗口改变
					}
				});
				
				// 关键词推荐特殊逻辑。。
				clearTimeout(nirvana.subaction.resizeTimer);
				baidu.g('ctrldialogrestoreWordDialog').style.top = baidu.page.getScrollTop() + 'px';
		}, params = {};
		
		params.onSuccess = function(response){
			var data = response.data.listData;
			fuc(data);
		};
		params.onFail = function(){
			ajaxFailDialog();
		};
		
		switch (opttypes[tabIndex]) {
			//计划被删除
			case 41:
				params.level = 'planinfo';
				params.condition = {
					planid: nirvana.aoWidgetAction.getRowIdArr(me, target, 'planid')
				};
				fbs.aodecr.getDelTopWords(params);
				break;
			//单元被删除
			case 43:
				planname = nirvana.aoWidgetAction.getRowIdArr(me, target, 'planname');
				//如果计划没有被删除，传planid
				if (planname[0].indexOf('[已删除]') < 0) {
					planid = nirvana.aoWidgetAction.getRowIdArr(me, target, 'planid');
				}
				params.level = 'unitinfo';
				params.condition = {
					planid: nirvana.aoWidgetAction.getRowIdArr(me, target, 'planid'),
					unitid: nirvana.aoWidgetAction.getRowIdArr(me, target, 'unitid')
				};
				fbs.aodecr.getDelTopWords(params);
				break;
			//关键词被删除
			case 44:
				planname = nirvana.aoWidgetAction.getRowIdArr(me, target, 'planname');
				unitname = nirvana.aoWidgetAction.getRowIdArr(me, target, 'unitname');
				if (planname[0].indexOf('[已删除]') < 0) {
					planid = nirvana.aoWidgetAction.getRowIdArr(me, target, 'planid');
				}
				if (unitname[0].indexOf('[已删除]') < 0) {
					unitid = nirvana.aoWidgetAction.getRowIdArr(me, target, 'unitid');
				}
				showword = nirvana.aoWidgetAction.getRowIdArr(me, target, 'showword');
				fuc(showword);
				break;
		
		}
	},

    /**
     * 根据行内元素,获取一行的ID数组
     */
    getRowIdArr : function (me,target, item) {
        var data = me.getContext('widgetTableData'),
            idArr = [], index;
			
        index = nirvana.manage.getRowIndex(target);
        idArr.push(data[index][item]);
        return idArr;
    },	
	
	/**
	 * 根据编辑按钮对象获取当前行数据(不知道这里面是否需要考虑页数)
	 * Notice:效果突降中稍作修改，可以返回索引值
	 * @param {Object} target
	 * @param {Boolean} getIndex 是否返回索引值
	 * 
	 * Modified By LeoWang(wangkemiao@baidu.com)
	 */
	getLineData: function(me, target, getIndex){
		var isFind = false;
		
		while (target && target.tagName != 'TR') {
			if(target.tagName == 'TD'){
				isFind = true;
				break;
			}
			target = target.parentNode;
		}
		if(isFind){
			var index = target.getAttribute('row');
			if('undefined' == typeof getIndex || !getIndex){
				return me.getContext('widgetTableData')[index];
			}
			else{
				return index;
			}
		}
		return false;
	},
	
	/**
	 * 根据编辑按钮对象获取子表格当前行数据，原理是向上找到td元素，获取其row属性，然后去得到该行的值
	 * @param {Object} target
	 * @param {Boolean} getIndex 是否返回index 可选
	 */
	getSubTableLineData : function(me, target, getIndex){
		var isFind = false,
			pageNo = me.getContext('subTablePageNo') || 1,
			pageSize = 3,
			currPrePageSize = (pageNo - 1) * pageSize;  //3为pageSize
		while (target && target.tagName != "TR") {
			if(target.tagName == "TD"){
				isFind = true;
				break;
			}
			target = target.parentNode;
		}
		if(isFind){
			var row = target.getAttribute("row");
			if('undefined' == typeof getIndex || !getIndex){
				return me.getContext('subrowTableData')[row - 0 + currPrePageSize];
			}
			else{
				return +row + currPrePageSize;
			}
		}
		return false;
	},

    /**
     * 行内启用暂停操作失败
     */
    inlinePauseFailed : function () {
        ajaxFailDialog();
    },	
	
	/**
	 * 按钮功能的绑定
	 */
    operationHandler : function (me,levelId,tabIndexToTarget,tabIndexToContent,tabToItem,funcList,operationId) {
		var tabIndex = me.getContext('tabIndex'),
			len = me.selectedList.length,
			target, selectedId;
			
		switch ( operationId ){
			case 'activeItem' :
				//批量激活点击的监控
				me.logCenter('aowidget_batch_active_word', {
					id : nirvana.aoWidgetAction.getSelected(me,'winfoid'),
					count : me.selectedList.length,
					type : -2
				});	
				ui.Dialog.confirm({
                    title : '激活关键词',
                    content : '您确定激活所选择的' + len + '个关键词吗?',
                    onok : me.activeHandler(),
					oncancel: function(){
						//批量激活点击取消的监控
						me.logCenter('aowidget_batch_active_word', {
							id : nirvana.aoWidgetAction.getSelected(me,'winfoid'),
							count : me.selectedList.length,
							type : 0
						});	
					}
            	});
				break;
			case 'enableItem' :
				target = tabIndexToTarget[tabIndex];
				selectedId = levelId[tabIndex];
				
				//批量启用点击的监控
				me.logCenter(target, {
					id : nirvana.aoWidgetAction.getSelected(me,selectedId),
					count : me.selectedList.length,
					type : -2
				});						
				ui.Dialog.confirm({
					title: tabIndexToContent[tabIndex]['title'],
					content: tabIndexToContent[tabIndex]['content'][0] + me.selectedList.length + tabIndexToContent[tabIndex]['content'][1],
					optype: 'enableItem', 
					onok: nirvana.aoWidgetAction.doOperationHandler(me,tabToItem,funcList,target, selectedId),
					oncancel: function(){
						//批量启用取消的监控
						me.logCenter(target, {
							id : nirvana.aoWidgetAction.getSelected(me,selectedId),
							count : me.selectedList.length,
							type : 0			
						});
					}
				});					
				break;
			case 'deleteItem' :
				//删除点击的监控
				me.logCenter('aowidget_del_word', {
					id : nirvana.aoWidgetAction.getSelected(me,'winfoid'),
					count : me.selectedList.length,
					type : -2
				});					
				ui.Dialog.confirm({
					title: '删除关键词',
					content: '您确定删除所选的' + len + '个关键词吗？删除操作不可恢复。',
					optype: 'deleteItem',
					onok: nirvana.aoWidgetAction.doOperationHandler(me,tabToItem,funcList,'aowidget_del_word'),
					oncancel: function(){
						//删除取消的监控
						me.logCenter('aowidget_del_word', {
							id : nirvana.aoWidgetAction.getSelected(me,'winfoid'),
							count : me.selectedList.length,
							type : 0			
						});					
					}
				});					
				break;
			case 'modifyBid' :						
				nirvana.aoWidgetAction.modBidClickHandler(me, nirvana.aoWidgetAction.getSelected(me,'winfoid'), nirvana.aoWidgetAction.getSelected(me,'bid'), nirvana.aoWidgetAction.getSelected(me,'showword'));
				break;
			default : 
				break;									
		}	
    },	
	
	/**
	 * 启用、（暂停）、删除三个操作的具体执行
	 */
    doOperationHandler : function (me,tabToItem,funcList,target, selectedId) {
		return function (dialog) {
            var dialog = dialog,
                func,//需要调用的接口函数
                pauseStat, //0启用,1暂停
				tabIndex = me.getContext('tabIndex'),
				onSuccessList = {
					'word' : {
						refreshYes : function(response){
							if (response.status != 300) {
								ui.util.get('SideNav').refreshPlanList();
								fbs.material.clearCache('wordinfo');
								fbs.avatar.getMoniFolders.clearCache();
								fbs.avatar.getMoniWords.clearCache();
								me.setContext('pageNo', 1);
								me.refreshSelf(me.getStateMap());
							}							
						},
						refreshNo: function(response){
							if (response.status != 300) {
								var modifyData = response.data;
								fbs.avatar.getMoniWords.ModCache('winfoid', modifyData);
								fbs.material.ModCache('wordinfo', 'winfoid', modifyData);
								me.setContext('pageNo', 1);
								me.refreshSelf(me.getStateMap());
							}
						}	
					},
					'unit' : {
						refreshYes : function (response) {
							var unitids = me.getSelected('unitid');
									
							fbs.material.clearCache('unitinfo');
							//创意、关键词、文件夹详情、排行榜
							fbs.material.ModCache('wordinfo', 'unitid', unitids, 'delete');
							fbs.material.ModCache('ideainfo', 'unitid', unitids, 'delete');
							fbs.avatar.getMoniFolders.clearCache();
							fbs.avatar.getMoniWords.ModCache('unitid', unitids, 'delete');
							fbs.material.getTopData.clearCache();
							ui.util.get('SideNav').refreshPlanList();
							me.setContext('pageNo', 1);
							me.refreshSelf(me.getStateMap());							
						},
						refreshNo : function (response) {
							var modifyData = response.data;
									
							fbs.material.ModCache('unitinfo', 'unitid', modifyData);
							//是否会影响关键词的状态呢？？TODO
							fbs.material.clearCache('wordinfo');
							fbs.material.clearCache('ideainfo');
							//	fbs.unit.getInfo.clearCache();
							me.setContext('pageNo', 1);
							me.refreshSelf(me.getStateMap());									
						}
					},
					'plan' : {
						refreshYes : function (response) {
							var planids = me.getContext(planid);
								
							fbs.material.clearCache('planinfo');
							//	fbs.plan.getInfo.clearCache();
							//单元、创意、关键词、文件夹详情、排行榜
							fbs.material.ModCache('unitinfo', 'planid', planids, 'delete');
							fbs.material.ModCache('wordinfo', 'planid', planids, 'delete');
							fbs.material.ModCache('ideainfo', 'planid', planids, 'delete');
							fbs.avatar.getMoniFolders.clearCache();
							fbs.avatar.getMoniWords.ModCache('planid', planids, 'delete');
							fbs.material.getTopData.clearCache();
							ui.util.get('SideNav').refreshPlanList();
							me.setContext('pageNo', 1);
							me.refreshSelf(me.getStateMap());	
						},
						refreshNo :	function (response) {
							var modifyData = response.data;
							fbs.material.ModCache('planinfo', 'planid', modifyData);
							//计划的状态改变会影响单元状态改变
							fbs.material.clearCache('unitinfo');
							//是否会影响关键词的状态呢？？TODO
							fbs.material.clearCache('wordinfo');
							fbs.material.clearCache('ideainfo');
							//		fbs.plan.getInfo.clearCache();
							me.setContext('pageNo', 1);
							me.refreshSelf(me.getStateMap());
						}
					}
				},
				param = {},
				needRefreshSideNav = false;
				param.onFail = nirvana.aoWidgetAction.operationFailHandler();
				switch (tabToItem[tabIndex]){
					case 'word' : param.winfoid = nirvana.aoWidgetAction.getSelected(me,'winfoid');
						break;
					case 'unit'	: param.unitid = nirvana.aoWidgetAction.getSelected(me,'unitid');
						break;
					case 'plan' : param.planid = nirvana.aoWidgetAction.getSelected(me,'planid');
						break;
				}
				    
				
                switch (dialog.args.optype) {
                    case 'enableItem' :	
						//批量启用确定的监控（不管是否成功，都发）
						me.logCenter(target, {
							id : nirvana.aoWidgetAction.getSelected(me,selectedId),
							count : me.selectedList.length,
							type : 1			
						});
                        func = funcList[tabToItem[tabIndex]];
                        pauseStat = 0;
                        break;
                    case 'deleteItem' : 
						//删除确定的监控（不管是否成功，都发）
						me.logCenter(target, {
							id : nirvana.aoWidgetAction.getSelected(me,'winfoid'),
							count : me.selectedList.length,
							type : 1			
						});
                        func = fbs.keyword.del;
						needRefreshSideNav = true;
    					break;
                }
				//对应计划列表，考虑是否可以删除		 
				if (!needRefreshSideNav) {
					param.onSuccess = onSuccessList[tabToItem[tabIndex]]['refreshNo'];
				}else{
					param.onSuccess = onSuccessList[tabToItem[tabIndex]]['refreshYes'];
				}
                if (typeof pauseStat != 'undefined') {
                    param.pausestat = pauseStat;
                }
    
                func(param);           
        };
   },
   
   /**
	 * 
	 * 获取针对于创意的操作处理函数
	 * 添加于效果突降开发
	 * 
	 * @param {String} type 操作类型, view, add, edit
	 * @param {Object} target 操作的来源目标，一般都在当前数据表格行内，这样getSubTableLineData才能找到
	 * @returns {Function}
	 * 
	 * Add By LeoWang(wangkemiao@baidu.com)
	 */
   getIdeaHandler : function(me, target, type){
		var parent = target.parentNode,
			winfoid = parent.getAttribute("winfoid"), 
			index = nirvana.aoWidgetAction.getLineData(me, target, true),
			item = (type == 'edit' ? nirvana.aoWidgetAction.getSubTableLineData(me, target) : me.getContext('widgetTableData')[index]), 
			param = {},
			table = ui.util.get('WidgetTable'),
			logParam;
		
		switch(type){
			case 'view':
				//fireSubrow之前，可能需要先去将之前打开创意后显示的收起创意 改回为查看
				if(table.subrowIndex != null && table.subrowIndex != index){
					baidu.g(table.getSubentryId(table.subrowIndex)).innerHTML = '查看创意';
				}
				table.fireSubrow(index);
				target.innerHTML = target.innerHTML == '查看创意' ? '收起创意' : '查看创意';
				
				logParam = {
					opttype : me.getContext('opttype'),
					type : target.innerHTML == '收起创意' ? 1 : 0,
					planid : item.planid,
					unitid : item.unitid,
					winfoid : item.winfoid					
				};
				item.showqstat && (logParam.showq_difficulty = qStar.getShowqDifficulty(item.showqstat));
				
				nirvana.aoWidgetAction.logCenter('aowidget_toggle_idealist', logParam);
				
				
				//根据当前行keyword的信息去获取所有创意
				me.getIdeaList(item, index);
				//保存当前展开的word的数据
				me.setContext('wordInView', item);

				break;
			case 'add':
				fbs.material.getCount({
					countParam : {
						mtlLevel: 'unitinfo',
						mtlId: item.unitid,
						targetLevel: 'ideainfo'
					},
					
					onSuccess : function(response) {
						var data = response.data;
						if (data >= IDEA_THRESHOLD) { //数量到达上限
							ui.Dialog.alert({
								title: '通知',
								content: nirvana.config.ERROR.IDEA.ADD['712']
							});
						} else {
							param.unitid = item.unitid;
							param.planid = item.planid;
							param.type = type;
							param.changeable = false;
							
							var logParam = {
								opttype : me.getContext('opttype'),
								planid : item.planid,
								unitid : item.unitid,
								winfoid : item.winfoid		
							};
							item.showqstat && (logParam.showq_difficulty = qStar.getShowqDifficulty(item.showqstat));
							
							nirvana.aoWidgetAction.logCenter('aowidget_add_idea', logParam);
							//me.createSubAction(param);
							nirvana.aoWidgetAction.createSubActionForIdea(param, me);
						}
					},
					
					onFail : function(response) {
						ajaxFailDialog();
					}
				});
				break;
			case 'edit':
				param.ideaid = item.ideaid;
				param.type = type;
				param.changeable = false;
				//当前显示的关键词
				var wordInView = me.getContext('wordInView');
				
				logParam = {
					opttype : me.getContext('opttype'),
					planid : item.planid,
					unitid : item.unitid,
					ideaid : item.ideaid,
					winfoid : wordInView.winfoid		
				};
				
				wordInView.showqstat && (logParam.showq_difficulty = qStar.getShowqDifficulty(wordInView.showqstat));
				
				nirvana.aoWidgetAction.logCenter('aowidget_edit_idea', logParam);
				nirvana.aoWidgetAction.createSubActionForIdea(param, me);
				break;
			default:
				break;
		}
	}
};


/**
 * 声明快捷方式
 */
nirvana.aoWidget = nirvana.ao.lib.widget;
nirvana.aoWidgetMap = nirvana.ao.lib.widgetMap;
nirvana.aoWidgetRender = nirvana.ao.lib.widgetRender;
nirvana.aoWidgetAction = nirvana.ao.lib.widgetAction;
