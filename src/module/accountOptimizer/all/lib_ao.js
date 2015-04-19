/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/lib.js 
 * desc: 账户优化公用函数库
 * author: wanghuijun@baidu.com
 * date: $Date: 2011/06/08 $
 */

/**
 * @namespace 账户优化模块
 */

nirvana.ao = {};

nirvana.ao.lib = {};

/**
 * 账户优化大项
 */
nirvana.ao.lib.group = {
	groupTpl : '',
	
	itemTpl : '',
	
	_structure: {
		// 在线时间
		time: {
			id: 'AoGroupTime',
			title: '优化在线时间',
			items: nirvana.config.AO.OPTTYPE['TIME'],
			stage: 'Shows' // 这里因为需要和页面的id对应，所以首字母大写
		},
		
		// 关键词
		keyword: {
			id: 'AoGroupKeyword',
			title: '优化关键词',
			items: nirvana.config.AO.OPTTYPE['KEYWORD'],
			stage: 'Shows' // 这里因为需要和页面的id对应，所以首字母大写
		},
		
		// 出价
		bid: {
			id: 'AoGroupBid',
			title: '优化出价',
			items: nirvana.config.AO.OPTTYPE['BID'],
			stage: 'Clks' // 这里因为需要和页面的id对应，所以首字母大写
		},
		
		// 质量
		quality: {
			id: 'AoGroupQuality',
			title: '优化质量',
			items: nirvana.config.AO.OPTTYPE['QUALITY'],
			stage: 'Clks' // 这里因为需要和页面的id对应，所以首字母大写
		},
		
		// 连通速度
		speed: {
			id: 'AoGroupSpeed',
			title: '优化连通速度',
			items: nirvana.config.AO.OPTTYPE['SPEED'],
			stage: 'Pv' // 这里因为需要和页面的id对应，所以首字母大写
		},
		
		// 网页质量
		page: {
			id: 'AoGroupPage',
			title: '优化网页质量',
			items: nirvana.config.AO.OPTTYPE['PAGE'],
			stage: 'Pv' // 这里因为需要和页面的id对应，所以首字母大写
		},
		
		// 转化率
		trans: {
			id: 'AoGroupTrans',
			title: '优化转化率',
			items: nirvana.config.AO.OPTTYPE['TRANS'],
			stage: 'Trans' // 这里因为需要和页面的id对应，所以首字母大写
		},
		
		// 浏览阶段提示
		pvtip: {
			id: 'AoGroupPvTip',
			title: '浏览阶段',
			items: ['PvTip']
		},
		
		// holems提示
		transtip: {
			id: 'AoGroupTransTip',
			title: '转化阶段',
			items: ['TransTip']
		}
	},
	
	/**
	 * 初始化模版
	 */
	initTpl : function() {
		var me = this,
			aoControl = nirvana.aoControl,
			aoOpttype = nirvana.config.AO.OPTTYPE,
			_structure = me._structure,
			structure = {},
			holmesStatus = aoControl.holmesStatus,
			transTarget = aoControl.transTarget,
			stage;

//        ///////////////////////////////////////// 老的时段优化项正式下掉 by Huiyao 2013.4.15
//        // 根据是否是时段升级的小流量用户替换掉老的时段的opttypeid，全流量后可以删掉这段代码
//        // add by Huiyao 2013.1.21
//        if (!me._initExp && nirvana.auth.isAoScheduleExp()) {
//            var optTypeArr;
//            var indexOf = baidu.array.indexOf;
//            var idx;
//            for (var k in aoOpttype) {
//                optTypeArr = aoOpttype[k];
//                // 7为老的时段优化项的opttypeid
//                if ((idx = indexOf(optTypeArr, 7)) !== -1) {
//                    optTypeArr[idx] = 52; //替换成新的时段优化项的opttypeid
//                }
//            }
//            //替换成新的时段优化项的opttypeid
//            nirvana.aoControl.item['plan_schedule'] = 52;
//            // 标识初始化过，避免重复初始化
//            me._initExp = true;
//        }
//        /////////////////////////////////////
		
		if (aoControl.isMainPage()) { // 优化建议页面
			me.groupTpl = er.template.get('groupContainer');
			me.itemTpl = er.template.get('itemContainer');
			
			for (var i in aoOpttype) {
				if (aoControl.opttype.toString() == aoOpttype[i].toString()) {
					stage = i.toLowerCase();
					break;
				}
			}
			
			switch (stage) {
				case 'all':
					structure = baidu.object.clone(_structure);
					break;
				default:
					if (_structure.hasOwnProperty(stage)) {
						structure[stage] = _structure[stage];
					}
					break;
			}
			
			aoControl.isPvTip = false;
			aoControl.isTransTip = false;
			
			// 判断浏览阶段是否提示，没有开通Holmes或者代码检查有误，则浏览阶段显示Holmes提示
			if (structure.speed || structure.page) {
				if (holmesStatus == 4 || holmesStatus == 6) { // 4 : 未开通holmes， 6 : 代码检查有误
					// 不请求20,21,22,24
					delete structure.speed;
					delete structure.page;
					
					structure['pvtip'] = _structure['pvtip'];
					
					// 标识是否需要Holmes提示
					aoControl.isPvTip = true;
				} else {
					delete structure.pvtip;
					
					aoControl.isPvTip = false;
				}
			}
			
			// 判断转化阶段是否提示，没有开通Holmes或者代码检查有误或者没有设置转化目标，转化阶段都需要显示Holmes提示
			if (structure.trans) {
				if (holmesStatus == 4 || transTarget == 5) { // 4 : 未开通holmes， 5 : 未设置转化目标
					// 不请求24
					delete structure.trans;
					
					structure['transtip'] = _structure['transtip'];
					
					// 标识是否需要Holmes提示
					aoControl.isTransTip = true;
				} else {
					delete structure.transtip;
					
					aoControl.isTransTip = false;
				}
			}
			
			if (nirvana.aoControl.pvAuth == 3) { // 浏览阶段没有权限
				delete structure.speed;
				delete structure.page;
				delete structure.pvtip;
				
				aoControl.isPvTip = false;
			}
			if (nirvana.aoControl.transAuth == 3) { // 转化阶段没有权限
				delete structure.trans;
				delete structure.transtip;
				
				aoControl.isTransTip = false;
			}
			if (nirvana.aoControl.bouncerateAuth == 3) { // 跳出率没有权限
				delete structure.page;
			}
		} else { // 推广管理列表页
			var items = [],
				level = aoControl.params.level.toUpperCase(),
				entrance = aoControl.aoEntrance.toUpperCase(),
				items = nirvana.config.AO.OPTTYPE[level].concat(nirvana.config.AO.OPTTYPE[entrance]);
			
			// 在查询状态时，level和entrance有可能相同，需要去重
			items = baidu.array.unique(items);
			
			me.groupTpl = er.template.get('manageAoContainer');
			me.itemTpl = er.template.get('itemContainer');
			
			structure = {
				// 默认
				defaultGroup: {
					id: 'AoGroupDefault',
					title: '',
					items: items
				}
			};
		}
		
		me.structure = structure;
	},
	
    showTpl : function(group){
        return function(){
            group.isShow = true;
			// 因为在推广阶段切换时需要addClass hide，所以这里使用baidu.show，优先级低
			baidu.show(group.id);
        };
    },
    
    hideTpl : function(group){
        return function(){
            group.isShow = false;
            baidu.hide(group.id);
        };
    }
};

/**
 * 列表页面使用的分页控件
 */
nirvana.ao.lib.listPager = {
	// 列表状态 hide show loading
	status : 'hide',
	
	// 分页控件
	pager : {},
	
	//是否进入后第一次请求
	isFirstRound : true,

    //初始化
    init: function() {
		var me = this;
		
        me.status = 'hide';
        me.isFirstRound = true;
    },
	
	render : function(timeout) {
		var me = this,
			aoControl = nirvana.aoControl,
			aoGroup = nirvana.aoGroup;
		
		if(aoControl.isMainPage()){ //仅列表页起作用
			return;
		}
		
		var isStableData = aoControl.isStable(aoGroup.structure.defaultGroup),
			itemCount = isStableData.itemCount,
			displayLimit = nirvana.config.AO.SUMMARY_DISPLAY_LIMIT,
			totalPage = Math.ceil(itemCount / displayLimit);
		
		me.itemCount = itemCount;
		totalPage = Math.min(totalPage, nirvana.config.AO.SUMMARY_PAGE_LIMIT); // MRD要求（最多向客户显示4页，总计12条优化建议）
		
		// 未达到稳定状态
		if(!isStableData.isStable){	
			return me.loading();
		}
		
		// 已达到稳定状态
		var defaultTimeout = 2.1; // 默认经过“已完成优化”提示隐藏的2秒渐变后100毫秒启动分页渲染
		if (me.isFirstRound){
			me.isFirstRound = false;
			defaultTimeout = 0;
		}
		
		timeout = timeout || defaultTimeout;
		
		var _renderFunc = function() {
			if(me.status != 'show'){	// 如果timeout之后状态变得不是show了，说明这中间用户有操作触发局部刷新了
				return;
			}

			var itemParagraphs = baidu.g('ManageAoWidget').getElementsByTagName('p');
			
			/*
			 * 测试中遇到html渲染慢导致的不一致问题，在这里使用setTimeout修复
			 */
			if(itemParagraphs.length != itemCount){
				setTimeout(_renderFunc, 500);
				return;
			}
			
			// 尚未达到3条
			if(itemCount <= displayLimit) {
				// 显示所有摘要
				for (var i = 0; i < itemCount; i++) {
					baidu.show(itemParagraphs[i]);
				}
				
				nirvana.aoControl.sendLog({
					target  : 'ao_seq',
					pagenum : me.pager.page,
					data	: nirvana.aoControl.getDynamicSeq().join(',')
				});
				
				return me.hide();
			}
			
			//达到三条，显示分页控件
			if(me.pager.page > totalPage && totalPage > 0) {	//如果当前页超过总页数（条数有所减少，则默认最后一页）
				me.pager.page = totalPage;
			}
			
			baidu.addClass('ManageAoPageLoading', 'hide');
			me.pager.page = 1;
			me.pager.total = totalPage;
			me.pager.render();
			
			me.renderPage();
		};
		
		setTimeout(_renderFunc, timeout * 1000);
		me.status = 'show';	
	},
	
	/**
	 * 渲染分页
	 * 根据分页情况排列所有行，并显示当页对应行
	 */
	renderPage : function() {
		var me = this,
			displayLimit = nirvana.config.AO.SUMMARY_DISPLAY_LIMIT,
			itemCount = me.itemCount,
			start = (me.pager.page - 1) * displayLimit,
			end = Math.min(start + displayLimit, itemCount),
			itemParagraphs = baidu.g('ManageAoWidget').getElementsByTagName('p');
				
		for (var i = 0; i < itemCount; i++) {
			if (i >= start && i < end) {
				baidu.show(itemParagraphs[i]);
                // modified by Huiyao 动态调整显示优化项顺序在li_widget.js#render完成
			} else /*if (i < start)*/ { // 仅对前页的内容进行隐藏，以实现分页。后面的不隐藏，以实现不稳定状态下的自动补全
				baidu.hide(itemParagraphs[i]);
			}
		}
		
		nirvana.aoControl.sendLog({
			target: 'ao_seq',
			pagenum: me.pager.page,
			data: nirvana.aoControl.getDynamicSeq().slice(start, end).join(',')
		});
	},
	
	/**
	 * 显示loading节点，设置分页为0，则控件自动隐藏
	 */
	loading : function(){
		var me = this;
		
		if(me.status == 'loading'){
			return;
		}
		
		baidu.removeClass('ManageAoPageLoading', 'hide');
		me.reset();
		
		me.status = 'loading';
	},
	
	/**
	 * 重置分页为0，渲染分页控件
	 */
	reset : function() {
		var me = this,
			pager = me.pager;
		
		pager.page = 1;
		pager.total = 0;
		pager.render();
	},
	
	/**
	 * 隐藏loading节点，设置分页为0，控件自动隐藏
	 */
	hide : function(){
		var me = this;
		
		if(me.status == 'hide'){
			return;
		}
		
		baidu.addClass('ManageAoPageLoading', 'hide');
		me.reset();
		
		me.status = 'hide';
	},
	
	_pageHandler : function(){
		var me = this;
		
		return function(pageNum) {
			var oldValue = me.pager.page;
			
			me.pager.page = pageNum;
			me.renderPage();
			
			nirvana.aoWidgetAction.logCenter('ao_tip_page', {
				old_value : oldValue,
				new_value : pageNum
			});
		};
	}
};

/**
 * 账户优化控制中心
 */
nirvana.ao.lib.control = {
	// 保存请求所需要的参数
	params : {
		level : 'useracct',
		condition : {},
		signature : '', //优化项签名
		command : 'start',
		opttype : nirvana.config.AO.OPTTYPE['ALL']
	},
	
	// 缓存params
	cacheParams : {
		level : 'useracct',
		condition : {},
		signature : '', //优化项签名
		command : 'start',
		opttype : nirvana.config.AO.OPTTYPE['ALL']
	},
	
	item : {
		'account_budget' : 1,
		'plan_budget' : 2,
		'word_quality' : 3,
		'word_bid' : 4,
		'word_add' : 5,
		'plan_schedule' : 52,
		'word_deactive' : 8,
		'word_invalid' : 9,
		'word_lowsearch' : 10,
		'word_bad' : 11,
		'word_pause' : 12,
		'unit_pause' : 13,
		'plan_pause' : 14,
		'idea_active' : 15,
		'idea_bad' : 16,
		'idea_pause' : 17,
		'word_bid_screen' : 18,
		'word_bid_first' : 19,
		'disconnectrate' : 20,
		'loadtime' : 21,
		'bouncerate' : 22,
		'trans' : 24
	},
	
	// 进入优化建议的action
	action : {},
	
	// 缓存上次的action
	cacheAction : {},
	
	// 入口标识
	aoEntrance : '',
	
	// start query refresh 不同于params里的command，多refresh一项
	command : 'start',
	
	// 不同于params里的opttype，这里只在推广阶段切换时修改
	opttype : nirvana.config.AO.OPTTYPE['ALL'],
	
	// holmes状态  0 : 正常，4 : 未开通holmes， 6 : 代码检查有误
    holmesStatus : -1,
	
	// 转化目标状态 0 : 正常， 5 : 未设置转化路径
	transTarget : -1,
	
	// 优化建议容器
	wrapper : '',
	
	// 记录备案信息
	queryTimeStamp : 0,
	
	// 当前层级所有子项的状态，用于进度条，涅槃里已经没有了
	allItems : {},
	
	// 缓存数据
	cacheData : {},
	
	// 缓存 缓存数据
	cacheCacheData : {},
	
	// 局部刷新前的html缓存
	htmlCacheBeforeRefresh : {},
	
	// 下一轮需要轮询的项目
	queryQueue : [],
	
	// 轮询计数器
	queryTimesCount : 0,
	
	// 最大请求次数
	maxQueryTimes : 20000,
	
	// 列表页reload延迟时间
	reloadTime : 1000,
	
	// 延迟计时器
	displayTimer : 0,
	
	// 轮询间隔5s
	queryInterval : nirvana.config.AO.QUERY_INTERVAL,
	
	// 第一次轮询的间隔
	firstQueryInterval : 1000,
	
	// 轮询线程
	queryThread : null,
	
	// 收起展开轮询线程
	areaHideThread : null,
	
	// 渲染线程
	renderThread : [],
	
	// reload线程
	reloadThread : [],
	
	// 小项到大项的关联关系
	item2Group : {},
	
	// 缓存小项到大项的关联关系
	cacheItem2Group : {},
	
	// 子项的显示状态
	itemDisplayStatus : {},
	
	//分析进度（仅适用于主页面）
	loadingProgress : 0,
	
	// 分析结果是否为无问题
	isTotallyOk : true,
	
	// 是否第一次达到稳定状态
	isFirstStable : true,
	
	// 动态优先级排列后的子项顺序
	dynamicSeq : [],
	
	// 查看详情标识，代表用户点击过子项详情，用于判断最小化工具时是否刷新推广管理页面
	isViewDetail : false,
	
	// 效果突降下线 2012.12.03
	// 是否为突降用户 0表示不是突降账户，1表示是突降账户
	//isDecrUser : 0,
	
	// 当前工具名称
	toolsName : '',
	
	// 优化项数量
	count : {
		All : 0,
		Shows : 0,
		Clks : 0,
		Pv : 0,
		Trans : 0
	},
	
	/**
	 * 初始化状态
	 * @param {Object} action 来源action
	 */
	initStat : function(action) {
		var me = this;
		
		// 标识当前的action是推广管理或者工具栏
		if (typeof(action) !== 'undefined') {
			me.action = action;
		}
		
		// 空对象时，表示没有action，直接return
		if (baidu.object.keys(me.action).length === 0) {
			return false;
		}
		
		me.aoEntrance = me.action.getContext('aoEntrance');
		
		// 子项id前缀，主要是区别推广管理的主动提示区和工具的优化建议
		me.widgetPrefix = 'AoItem' + me.aoEntrance + '_';
		
		// 优化建议容器
		me.wrapper = action.getContext('wrapper');
		
		// 清空签名
		me.changeParams({
			signature : ''
		});
		
		me.isViewDetail = false;
		
		nirvana.aoGroup.initTpl();
		
		return;
	},
	
	/**
	 * 重置状态，替换action及params
	 * 用于打开和关闭优化建议工具
	 */
	resetStat : function() {
		var me = this,
			tmpAction = nirvana.aoControl.cacheAction,
			tmpParams = nirvana.aoControl.cacheParams;
		//	tmpItem2Group = nirvana.aoControl.cacheItem2Group,
		//	tmpCacheData = nirvana.aoControl.cacheCacheData;
		
		me.cacheAction = me.action;
		me.action = tmpAction;
		me.cacheParams = me.params;
		me.params = tmpParams;
		//me.cacheItem2Group = me.item2Group;
		//me.item2Group = tmpItem2Group;
		//me.cacheCacheData = me.cacheData;
		//me.cacheData = tmpCacheData;
		
		// 清除reload逻辑
		me.needReload = false;
		// 恶心的逻辑。。。。reset初始状态
		//me.initStat(tmpAction);
	},
	
	/**
	 * 初始化
	 * @param {Object} action 来源action
	 */
	init : function(action) {
		var me = this;
		
		// 重置时间戳，防止在主动提示区切换tab太频繁导致上一个请求返回时还没有重置时间戳而引发的问题
		// 2012.04.01 wanghuijun~~~~~~~~~~
		me.queryTimeStamp = 0;
		
		me.initStat(action);
		
		if (!me.isMainPage()) { // 推广管理页面
			if (me.needReload) { // repaint时，执行reload逻辑
				me.reload(action);
				return;
			}
		}
		
		me.prepareInit();
		
		me.needReload = true;
		
		return;
	},
	
	/**
	 * 这里主要是initAoControl的前置工作
	 */
	prepareInit : function() {
		var me = this;
		
        if (!me.isMainPage()) { // 推广管理页面
            if (nirvana.config.AO.HIDESWITCH) { // 有收起展开的权限
                nirvana.aoAreaHide.init();
            }
            
            if (!nirvana.aoAreaHide.isOk) { // 如果收起请求的状态还未返回，则延迟继续
                me.areaHideThread = setTimeout(function() {
                    me.prepareInit();
                }, 1000); // 增加延时，否则会多次请求
                return;
            }
            
            if (nirvana.aoAreaHide.isAreaHide) { // 收起状态
                baidu.removeClass('AoFoldDetail', 'hide');
                return;
            } else { // 显示loading
                baidu.removeClass('ManageAoLoading', 'hide');
                baidu.addClass('ManageAoSummary', 'hide');
                baidu.addClass('AoFoldDetail', 'hide');
                
                nirvana.aoListPager.init();
            }
        }
		
		// wanghuijun 2012.12.03
		// 效果突降下线，不用再判断突降用户
		me.initAoControl();

		/**
        fbs.aodecr.getUser({
            onSuccess : function(response) {
                me.isDecrUser = response.data.isdecr;
                
                // 获取当前设置的突降类型
                fbs.aodecr.getCustom({
                    onSuccess: function(res){
                        me.decrType = res.data.type;
                        
                        me.initAoControl();
                    },
                    onFail: function(res){
                        ajaxFailDialog();
                    }
                });
            }
        });
        */
	},

	/**
	 * 重置因为优化包引流入口存在导致的主动提示区可变的高度
	 */
	resetAoPkgAreaDisplayStat : function(){
		var me = this,
			target = baidu.g('ManagerAoPkgArea');

		// 判断权限，是否是对照组？
		if(nirvana.env.EXP == '7651'){
//			baidu.g('ManageAo') && baidu.addClass('ManageAo', 'manage_ao_old');
//			baidu.g('ManageAo') && baidu.addClass('ManageAo', 'manage_ao_old');
			target && baidu.addClass(target, 'hide');
			return;
		}

		if (nirvana.aoAreaHide.isAreaHide) { // 收起状态
			target && baidu.addClass(target, 'hide');
			return;
		}
		target && baidu.removeClass(target, 'hide');
	},

	/**
	 * 初始化质优包推广入口
	 */
	initAoPkgArea : function(){
		var me = this,
			pkgConfig = nirvana.aoPkgConfig,
			rand = parseInt(Math.random() * 4),
			currPkg = pkgConfig.managerAreaPkgs[rand],
			target = baidu.g('ManagerAoPkgArea'),
			ptar = $$('p', target)[0], 
			atar,
			time;

        me.resetAoPkgAreaDisplayStat();
        
		if(target && !baidu.dom.hasClass(target, 'hide') && ptar){
			// baidu.removeClass(target, 'hide');
			ptar.innerHTML = '';

			atar = document.createElement('a');
			atar.innerHTML = currPkg.description;
			atar.setAttribute('href', '#');;
			atar.onclick = (function(pkgid){
				return function(e){
					nirvana.aoPkgControl.openAoPackage(pkgid, 4);
					return false;
				};
			})(currPkg.pkgid);
			ptar.appendChild(atar);
			ptar.className = 'pkg_' + currPkg.pkgid;

			time = (new Date()).valueOf();
			nirvana.aoPkgControl.logCenter.extend({
				packages : currPkg.pkgid,
				actionStep : -2,
				queryStartTime : time,
				pkgShowTime : time,
				pkgShowOptTime : time,
				pkgid : null,
				entrance : 4 // 意味着推广管理页主动提示区的包推广区域
			}).sendAs('nikon_package_show');

			// 请求更新条数
			fbs.nikon.getPackageStatus({
                command : 'start',
                reqid: '',
                pkgids : [currPkg.pkgid],
                condition : {
                	ignoreinfo : currPkg.pkgid + '_3'
                },
                onSuccess : function(response){
                	var data = response.data || {};
                	var aostatus = data.aostatus;
                	var aoPackageItems = data.aoPackageItems;
                	if(!data || !aoPackageItems || aoPackageItems.length == 0){
                		return;
                	}
                	var pkginfo = aoPackageItems[0];
                	if(pkginfo){
                		var newoptnum = +pkginfo.newoptnum;
                		if(newoptnum > 0){
                			var opttar = document.createElement('span');
                			opttar.innerHTML = '(<em>' + newoptnum + '</em>个更新)';
                			atar.appendChild(opttar);
                		}
                	}
                },
                onFail : function(response) {
                    ajaxFailDialog();
                }
            });
		}
	},
	
    initAoControl: function() {
		var me = this,
			html = [],
            tmp = [],
            group,
            items,
			item,
            requestItems = [],
			aoGroup = nirvana.aoGroup,
            structure,
			timeStamp = (new Date()).valueOf();
		
		// 清除收起返回的线程否则打开工具箱时会报错
		clearTimeout(me.areaHideThread);
		
		//记录备案信息
		me.queryTimeStamp = timeStamp;

        // 轮询计数器清0
        me.queryTimesCount = 0;
		
		// 延时记录清0
		me.displayTimer = 0;

        //设进度条为0
        me.loadingProgress = 0;
		
        me.cacheData = {};
		
		me.htmlCacheBeforeRefresh = {};
		
		me.isFirstStable = true;
		
		me.dynamicSeq = [];
		
		
	//	me.initTpl();
	//	aoGroup.initTpl();
		
		structure = aoGroup.structure;
		
		//重置子项显示逻辑记录，均为没有显示
		for (var i in me.itemDisplayStatus) {
			me.itemDisplayStatus[i] = false;
		}
		
		for (var key in structure) {
			group = structure[key];
			
			group.isShow = false;
			group.msgLevel = {};
			group.visualItem = 0;
            group.show = aoGroup.showTpl(group);
            group.hide = aoGroup.hideTpl(group);
			
            tmp.length = 0;
            items = group.items;
			
			items = me.getItems(items);
			
            //拼装子项容器
            for (var i = 0, j = items.length; i < j; i++) {
				item = items[i];
				
                requestItems.push(item); // 由于structure取决于params.opttype，所以requestItems也取决于params.opttype
                
                //建立反向关联关系
                me.item2Group[item] = group;
				tmp.push(aoGroup.itemTpl.replace(/%prefix/, me.widgetPrefix).replace(/%item_id/, item));
            }
			
			html.push(aoGroup.groupTpl.replace(/%id/, group.id).replace(/%title/, group.title).replace(/%items/, tmp.join('')));
        }
		
        baidu.g(me.wrapper)
      		&& (baidu.g(me.wrapper).innerHTML = html.join(''));
		
		if (me.isMainPage()) { // 优化建议
			me.initHolmesTip();
		}
		
		/**
		 * 列表的监控及分页
		*/
        if (me.isMainPage()) {
			baidu.addClass('AoResult', 'hide');
		} else { //列表入口
			//G('AoSummaryMore').onclick = function(){
			//	FC_GE_LOG.send({
			//		action: 'ao_list_btn'
			//	});
			//}
			nirvana.aoListPager.pager = ui.util.get('ManageAoPage');
			nirvana.aoListPager.pager.onselect = nirvana.aoListPager._pageHandler();
			//AoListPager.pager = new Pagination("AoSummaryPager", 1, 1, 1, 2, AoListPager._pageHandler);
		}
		
		me.changeParams({
			command : 'start',
			opttype : requestItems
		});
		
		me.request(timeStamp);
	},
	
	/**
	 * 初始化holmes提示
	 */
	initHolmesTip : function() {
		var me = this,
			holmesStatus = me.holmesStatus,
			transTarget = me.transTarget,
			transStatus = transTarget || holmesStatus, // 有可能同时没有设置转化路径和代码检查有误，依据凤巢以前的逻辑，先判断没有设置转化目标
			html = er.template.get('widgetHolmesTip'),
			content;
		
		// 浏览阶段提示
		if (me.isPvTip) {
			switch (holmesStatus) {
				case 4:
					content = '您需要<a href="' + HOLMES_HOMEPAGE_URL + '" target="_blank">安装并开通百度统计</a>才可以获得浏览阶段的数据及优化建议';
					break;
				case 6:
					content = '百度统计代码安装检查有误，请进入<a href="' + HOLMES_HOMEPAGE_URL + '" target="_blank">百度统计</a>代码检查结果页查看详情';
					break;
				default:
					break;
			}
			
			baidu.g(me.widgetPrefix +'PvTip').innerHTML = html.replace(/%content/, content);
			baidu.show('AoGroupPvTip');
		}
		
		// 转化阶段提示
		if (me.isTransTip) {
			switch (transStatus) {
				case 4:
					content = '您需要<a href="' + HOLMES_HOMEPAGE_URL + '" target="_blank">安装并开通百度统计</a>才可以获得转化阶段的数据及优化建议';
					break;
				case 5: // 客户已安装百度统计，且有转化阶段权限，但是未设置转化目标
					content = '由于未设置转化目标，转化阶段暂无优化建议，请在百度统计中<a href="' + HOLMES_HOMEPAGE_URL + '" target="_blank">设置转化目标</a>';
					break;
				/**
				 * 转化阶段不提示代码检查错误
				case 6:
					content = '百度统计代码安装检查有误，请进入<a href="' + HOLMES_HOMEPAGE_URL + '" target="_blank">百度统计</a>代码检查结果页查看详情';
					break;
				 */
				default:
					break;
			}
			baidu.g(me.widgetPrefix +'TransTip')
				&& (baidu.g(me.widgetPrefix +'TransTip').innerHTML = html.replace(/%content/, content));
			
			baidu.show('AoGroupTransTip');
		}
	},
	
	/**
     * 处理opttype 移除非请求项
	 * @param {Object} items [1,2]
	 */
	getItems : function(items) {
        var me = this,
            params = me.params,
            item,
            configOpt = nirvana.config.AO.OPTTYPE,
			//decrOpt = nirvana.config.DECREASE.OPTTYPE,
            //optFilter = [],
            level = params.level,
            levelOpttype;
        
        if (me.isMainPage()) { // 账户优化主页面，在携带物料进入时，需要根据level过滤opttype
            switch (level) {
                case 'planinfo':
                    levelOpttype = configOpt['PLANINFO'].concat(configOpt['UNITINFO']).concat(configOpt['WORDINFO']).concat(configOpt['IDEAINFO']);
                    break;
                case 'unitinfo':
                    levelOpttype = configOpt['UNITINFO'].concat(configOpt['WORDINFO']).concat(configOpt['IDEAINFO']);
                    break;
                case 'wordinfo':
                case 'ideainfo':
                    levelOpttype = configOpt[level.toUpperCase()];
                    break;
                default:
                    levelOpttype = items;
                    break;
            }
            
			// 获取opttype与levelOpttype的交集
            items = baidu.array.filter(items, function(item, index){
				// 如果当前item是非数字，则代表pvtip或者transtip，不进行过滤
                if (baidu.array.indexOf(levelOpttype, item) != -1 || isNaN(+item)) {
                    return true;
                }
            });
        }
		
		// 效果突降下线 2012.12.03
		// 如果不是突降用户，则不请求新增的突降opttype
		// 必须在这里移除，否则dom节点中会存在不请求的摘要，影响进度的判断
		/**
		if (!me.isDecrUser) {
			optFilter = decrOpt['ALL'];
		} else {
			switch (me.decrType) {
                case 'shows':
                    // 展现阶段，不请求点击和浏览的突降建议，以此类推
					optFilter = decrOpt['CLKS'].concat(decrOpt['PV']);
					break;
                case 'clks':
                    optFilter = decrOpt['PV'];
					break;
                case 'pv':
                    break;
			}
		}
		
        for (var i = 0, j = optFilter.length; i < j; i++) {
			baidu.array.remove(items, optFilter[i]);
		}
		*/
		
        return items;
	},
	
	/**
	 * 处理opttype 去重 移除非请求项 排序
	 */
	getOpttype : function() {
		var me = this,
			params = me.params,
			opttype = params.opttype,
			optArr = nirvana.config.AO.OPTTYPE['ALL'],
			i,
			j,
			item;
		
		// 去重
		opttype = baidu.array.unique(opttype);
		
		/**
		 * 
		if (me.isMainPage()) { // 账户优化主页面，在携带物料进入时，需要根据level过滤opttype
			switch (level) {
				case 'planinfo':
					levelOpttype = configOpt['PLANINFO'].concat(configOpt['UNITINFO']).concat(configOpt['WORDINFO']).concat(configOpt['IDEAINFO']);
					break;
				case 'unitinfo':
					levelOpttype = configOpt['UNITINFO'].concat(configOpt['WORDINFO']).concat(configOpt['IDEAINFO']);
					break;
				case 'wordinfo':
				case 'ideainfo':
					levelOpttype = configOpt[level.toUpperCase()];
					break;
				default:
					levelOpttype = opttype;
					break;
			}
			
			opttype = baidu.array.filter(opttype, function(item, index){
				if (baidu.array.indexOf(levelOpttype, item) != -1) {
					return true;
				}
			});
		}
         */
		
		me.allItems = {};
		
		// 移除非opttype，主要是pvtip,transtip
		for  (i = 0; i < opttype.length; i++) { // opttype.length会动态改变所以不能赋值
			item = opttype[i];
			
			if (baidu.array.indexOf(optArr, item) == -1) {
				baidu.array.removeAt(opttype, i);
				// 数组前移
				i--;
				continue;
			}
			
			me.allItems[item] = 'ready';
		}
		
		// 按优先级排序
		opttype.sort(me._sortItem);
		
		params.opttype = opttype;
	},
	
	/**
	 * 获取当前请求参数
	 * opttype 去重 排序
	 */
	getParams : function() {
		var me = this,
			params = me.params,
			command = me.command;
		
		me.getOpttype();
		
		if(command == 'start' || command == 'refresh') {
			
			params.command = 'start';    // 对于start和refresh，在请求中均体现为start
			params.signature = '';       // 清空签名，在返回时赋值
			
			//Added by Wu Huiyao 
			params.curabs = [];       // 新增请求参数，用于动态优先级排序，对于start和refresh, curabs初始值为空数组
			 
			/**
			 * 此处逻辑以前应该一直没有生效，先注释掉
			if(itemType.length == 0){
				if(itemType[0] == 0 || itemType[0] == 1 || itemType[0] == 2){
					dwrCommand = 'query';	//对于由业务端直接计算的三个项目，直接传递Query
				}
			}
			 */
		} else {
			params.command = 'query';
			
			//Added by Wu Huiyao
			params.curabs = me.absorder; //将上次返回的absorder数据作为轮询请求的参数
		}
	},
	
	/**
	 * 修改请求参数
	 * @param {Object} param
	 */
	changeParams : function(param) {
		var me = this;
		
		baidu.extend(me.params, param);
		
		me.command = param.command || me.command; // 如果没有修改command，则保持原有command
	},
	
	/**
	 * 请求摘要
	 */
	request : function(timeStamp){
		var me = this;
		
		if (timeStamp != me.queryTimeStamp) {
			return false;
		}
		
		// 如果超过最大请求次数，直接down掉
		if(me.queryTimesCount++ >= me.maxQueryTimes) {
			return;
		}
		
		me.getParams();
		
		// 这里只进行拷贝，不进行修改
		var	param = baidu.object.clone(me.params);
		
		if (param.opttype.length == 0) { // opttype为空，则不发请求
			me.displayStats(); // 更新统计信息
			return;
		}
		
		//列表页分页控件显示loading
		if(!me.isMainPage()){
			nirvana.aoListPager.loading();
		}
		
		param.onSuccess = me.responseSuccess(timeStamp);
		
		param.onFail = function(response) {
			ajaxFailDialog();
		};
		
		me.clearStats();

        //获取优化摘要
		fbs.ao.getRequset(param);
		
		return;
	},
	
	/**
	 * 请求摘要成功
	 * @param {Object} timeStamp
	 */
	responseSuccess : function(timeStamp) {
		var me = this;
		
		return function(response){
			var data = response.data,
				signature = data.signature,
				aostatus = data.aostatus,
				aoabsdata = data.aoabsdata;
			
			// 判断时间戳(放过refresh的第一次返回)
			if (me.command != 'refresh' && timeStamp != me.queryTimeStamp) {
				return;
			}
			
			if (aostatus != 0) {
				switch (aostatus) {
					case 4: // 需要更详细的请求数据，不只是签名
						// 这里需要清空签名，不需要更改command
						me.changeParams({
							signature : ''
						});
						
						me.request(timeStamp);
						break;
					case 100:
						me.displayStats();
						break;
					default:
						ajaxFailDialog(); // 相当于status 500
						break;
				}
				return;
			}
			
			// 签名如果为空，则表示command为start或者refresh，记录签名，签名对应一组condition
			if (me.params.signature == '' || me.params.signature == null) { //这里暂时加一个null的判断，实际情况应该不允许出现null
				me.params.signature = signature;
			}
			
			// 请求的签名和返回的签名不一致，则直接结束
			if (me.params.signature != signature) {
				return;
			}
			
            // 以opttype排序，后台应该是按前台请求的顺序返回的，这里再排序一次保证顺序
            aoabsdata.sort(function(a, b){
				return me._sortItem(a.opttype, b.opttype);
			});
			
			// 经历过重重关卡之后，终于可以渲染了
			me.responseRender({
				// Added by Wu Huiyao
				absorder : data.absorder,//优化建议排序数据
				aoabsdata : aoabsdata,
				timeStamp : timeStamp
			});
		};
	},
	
	/**
	 * 处理轮询及子项加载等逻辑
	 * @param {Object} json
	 */
	responseRender : function(json) {
		var me = this,
			aoabsdata = json.aoabsdata,
			timeStamp = json.timeStamp,
			//Added by Wu Huiyao
			absorder = json.absorder,//获取服务器返回的优化建议如何排序的数据
			item,
			itemId,
			status,
			hasProblem,
			timestamp,
			isLastItem;
			
		if (me.command == 'refresh') { // 局部刷新时仅修改自身在轮询队列中的状态
			for (var i = 0, j = me.queryQueue.length; i < j; i++) {
				if (me.queryQueue[i] == itemId) { // 这里 me.queryQueue[i] == itemId 应该不可能成立，相当于什么都不做
					me.queryQueue.splice(i, 1);
					break;
				}
			}
		} else {
			// 清空轮询队列
			me.queryQueue.length = 0;
		}
		
		// Added by Wu Huiyao 
		me.absorder = absorder; //缓存动态优先级排序数据
		
		for (var i = 0, j = aoabsdata.length; i < j; i++) {
			// status, hasProblem, itemId, timeString, msgLevel,[result1, result2..] 
			item = aoabsdata[i];
			
			status = item.status;
			hasProblem = item.hasproblem;
			timestamp = item.timestamp;
			itemId = item.opttype;
			isLastItem = (i == (j - 1));
				
			// 缓存数据
			me.cacheData[itemId] = {
				status: status,
				hasProblem: hasProblem,
				timeString: baidu.date.format(new Date(timestamp), 'HH:mm'),
				// rank: item.rank, //动态优先级参数1：级别  Deleted by Wu Huiyao
				// score: item.score, //动态优先级参数2：分数 Deleted by Wu Huiyao
				data: item.result
			};
				
			//判断状态  0 - 启动任务成功，1 - 计算中，2 - 计算完成，3 - 计算超时，4 - 内部错误
			if (status <= 1) { //启动任务或计算中时，推入下次轮询队列
				me.queryQueue.push(itemId);
			} else if (me.isRefreshItem(itemId) && me.queryQueue.length == 0) { // 局部刷新后再次达到稳定状态
				me.displayStats();
			}
				
			if (!me.isMainPage() && me.isFirstStable) { //列表页第一次稳定前，适用动态优先级逻辑
				me.dynamicRank(); //动态优先级  
			}
				
			if (me.queryQueue.length == 0) { // 如果没有需要轮询的项，则置空线程标识
				if (isLastItem) {
					me.isFirstStable = false; // 达到稳定状态后，即认为已经不在第一次请求稳定前（动态优先级用）
				}
				me.queryThread = null;
				
				//  稳定状态下发送监控
				if (isLastItem) {
					nirvana.aoControl.sendLog({
						target : 'ao_is_stable'
					});
				}
			}
				
			if (me.isRefreshItem(itemId) || (hasProblem && (status == 1 || status == 2)) //状态为计算中或计算完成，且发现问题
			    || (status == 3) || (hasProblem == 0)) { //状态为超时，无论是否有问题 或者无问题
				//加载子项
				me.loadWidget(itemId, timeStamp, isLastItem);
			} else { // 进行轮询
				if (status > 1) { //包括异常情况时将当前项在进度条中标记为完成
					me.allItems[itemId] = 'done';
					me.getProgress();
					if (me.isMainPage()) {
						me.toggleGroupMeta(me.item2Group[itemId]);
					}
				}
					
				// 根据目前约定，start第一次返回的状态位一定为0，因此start一定会进入这层逻辑
				if (isLastItem && me.queryQueue.length > 0) { //最后一项没有机会在loadWidget中触发时
					var now = (new Date()).valueOf(),
						queryInterval = me.queryInterval;
						
					if (me.command == 'start' || me.command == 'refresh') { //如果上一次是开始或刷新，则认为本次是第一次刷新。
						queryInterval = me.firstQueryInterval;
					}
						
					if (me.displayTimer > now) { //如果显示队列中仍有子项在等待
						queryInterval += me.displayTimer - now; //把这部分等待时间也算到下一次轮询前的等待时间里
					}
					
					me.queryThread = setTimeout(function() {
						me.changeParams({
							command: 'query',
							opttype: me.queryQueue
						});
							
						me.request(timeStamp);
					}, queryInterval);
				}
			}
			
			// Added by Wu Huiyao
		    if (isLastItem && 0 == me.queryQueue.length) {//完成轮询，删除缓存的absorder数据
			    delete me.absorder;
		    }
				
			if (hasProblem) { //有问题
				me.isTotallyOk = false;
			}
		}
		
        /**
         * 在这里执行有潜在风险：当在本地或load widget过快导致loadWidget提前之前时，则无法使用me.isRefreshItem成功分辨出刷新的子项。
         * 从而会导致增大分页显示的延迟，不过由于延迟本身很小，再加上实际网络环境不会这么好，所以影响可以忽略不计。
         **/
		if (!me.isMainPage()) { //列表页特有分页逻辑
			var timeout = 0;
			
			for (var i = 0, j = aoabsdata.length; i < j; i++) { //提前计算所需要的显示延迟
				//status, hasProblem, itemId, timeString, msgLevel,[result1, result2..] 
				item = aoabsdata[i];
				status = item.status;
				hasProblem = item.hasproblem;
				itemId = item.opttype;
				
				/**
				 * 列表页不需要延迟显示，注释掉此段逻辑
				//非局部刷新项目，为【计算完成有问题】或【超时】
				if (!me.isRefreshItem(itemId) && ((hasProblem && status == 2) || status == 3)) {
					timeout += nirvana.config.AO.DELAY_CONFIG[itemId];
				}
				*/
			}
			nirvana.aoListPager.render(timeout); //显示分页
			
			// 层级页面，所有子项均已有结果，且从来没有出现问题时，隐藏容器
			if (me.isTotallyOk == true && me.queryQueue.length == 0) {
				baidu.g(me.wrapper) && baidu.hide(me.wrapper);
				baidu.hide('ManageAo');
			} else {
				baidu.g(me.wrapper) && baidu.show(me.wrapper);
				baidu.g('ManageAo') && baidu.show('ManageAo');
			}
		}
	},
	
	/**
	 * 局部刷新若干单项
	 * @param {Object} itemType
	 */
	refresh : function(itemType){
		if (!baidu.lang.isArray(itemType)) {
			itemType = [itemType];
		}
        // 去重
        itemType = baidu.array.unique(itemType);
		
		var me = this,
			widgetInstance,
			itemId,
			itemData,
			tmpItem;
		
		if (!me.isMainPage()) { // 推广管理，直接全局刷新
			er.controller.fireMain('reload', {});
			return;
		}
		
		// 局部刷新时，直接显示loading
		for (var i = 0 ; i < itemType.length; i++){	//此处itemType.length会变化，不能预定义
			itemId = itemType[i];
			itemData = me.cacheData[itemId];
			
			/**
			 * 已在具体tab中做了处理，未请求的项目不会显示，所以不会有此问题
			// bugfix,在关键词状态浮出层中可能会访问到页面本身未请求的项目（如在物料列表中不会请求计划暂停项目）
			if(typeof itemData == 'undefined' || (itemData.status >= 2 && !itemData.hasProblem)){ //如果该项之前状态根本无问题,则取消该项的刷新
				itemType.splice(i,1);
				i--;
				continue;
			}
			 */
			
			me.cacheData[itemId].status = 1; // 这里的状态似乎不需要设置
			me.htmlCacheBeforeRefresh[itemId] = baidu.g(me.widgetPrefix + itemId).innerHTML;
			
		  	widgetInstance = 'AoWidget_' + nirvana.aoWidgetMap[itemId].id;
			eval('widgetInstance = ' + widgetInstance);
						
			me.invokeWidget('show', itemId, me.queryTimeStamp, function() {
                widgetInstance.renderLoading({
					timeString: '',
					itemId: itemId,
					data: me.cacheData[itemId].data
				});
            });
			
			if(me.isMainPage()){	//主页面时，暂时隐藏该组meta信息
				me.toggleGroupMeta(me.item2Group[itemId]);
			}
		}
		
		setTimeout(function(){
			me.changeParams({
				command: 'refresh',
				opttype: itemType
			});
			
			me.request(me.queryTimeStamp);
		}, nirvana.config.AO.REFRESH_DELAY); // 目前为0
	},
	
	/**
	 * 加载子项
     * @param {Object} itemId 子项ID 
     * @param {Object} timeStamp 该请求发起时的时间戳
	 * @param {Object} isLastItem 是否本次返回结果的最后一个子项
	 */
	loadWidget : function(itemId, timeStamp, isLastItem) {
		var me = this,
			widgetId = nirvana.aoWidgetMap[itemId].id, 
            widgetInstance = 'AoWidget_' + widgetId,
			itemData = me.cacheData[itemId],
			group = me.item2Group[itemId],
			status = itemData.status;
		
		if (timeStamp != me.queryTimeStamp) { // 首先判断时间戳
			return false;
		}
		
		//获得实例
		eval('widgetInstance = ' + widgetInstance);
            /**
             *
             //added by chen_yong@baidu.com
             //在账户分析页面切换推广流程阶段节点过快，会出现回调顺序混乱
             //致使itemData存储有误
             if(!itemData) {
             //                console.log("itemid", itemId);
             return;
             }
             */
		
		//调用子项
		if (itemData.hasProblem) { //发现问题
			if(status == 1 && me.isMainPage()){   //计算中，有问题(仅主页面调用)
				me.invokeWidget('show', itemId, timeStamp, function(){
					widgetInstance.renderLoading({
						timeString: itemData.timeString,
						itemId: itemId,
						data: itemData.data
					});
				});
			} else if (status == 2 || status == 3){ // 计算完成，有问题 计算超时，有问题 
				if (!me.isMainPage()) { //层级列表入口
					if (baidu.g('ManageAoLoading') && !baidu.dom.hasClass('ManageAoLoading', 'hide')) { //如果外部容器还未被显示,则显示
						if (nirvana.aoAreaHide.isAreaHide) {
							baidu.removeClass('ManageAoFoldProp', 'hide');
						} else {
							baidu.removeClass('ManageAoSummary', 'hide');
						}
						
						baidu.addClass('ManageAoLoading', 'hide');
						baidu.removeClass('AoFoldDetail', 'hide');
					}
				}
				
				var delay = me.isMainPage() ? (nirvana.config.AO.DELAY_CONFIG[itemId] || nirvana.config.AO.DELAY_CONFIG['DEFAULT']) : 0,   //子项要求的延迟时间，主动提示区不需要延迟时间
					now = (new Date()).valueOf(),  //当前时间戳
					showTimer = me.displayTimer + delay * 1000,
					func;
				
				if (status == 2) {    //计算完成
					func = function(){
						me.invokeWidget('show', itemId, timeStamp, function(){
                            // 增加最后一个参数，用于区分是主动提示区还是工具箱优化建议 by huiyao 2013.3.21
							widgetInstance.renderResult(itemData.timeString, itemId, itemData.data, me.wrapper === 'ManageAoWidget');
							widgetInstance.init({
								itemId : itemId,
								data : itemData.data
							});
						});
					}
				} else {   //超时
					func = function(){
						me.invokeWidget('show', itemId, timeStamp, function(){
                            // 增加最后一个参数，用于区分是主动提示区还是工具箱优化建议 by huiyao 2013.3.21
							widgetInstance.renderTimeout(itemData.timeString, itemId, itemData.data, me.wrapper === 'ManageAoWidget');
							widgetInstance.init({
								itemId : itemId,
								data : itemData.data
							});
						});
					}
				}
					    
				if(showTimer <= now || me.isRefreshItem(itemId)){ //已经达到子项要求的延迟时间,或请求类型为局部刷新
					showTimer = now;  //同步计时器为当前时间戳
				}
				
				//对于已经达到延迟时间的，相当于立即执行
				me.renderThread.push(setTimeout(function(){
					func();
				}, showTimer - now));
				
				//记录最新时间戳
				group.displayTimer = showTimer;
				me.displayTimer = showTimer;
			}
		} else { //没有发现问题
			if (status == 3 && (me.isMainPage() || me.isRefreshItem(itemId))){ //计算超时，没有发现问题(仅优化主页面入口显示或层级页面但属于局部刷新) 
				me.invokeWidget('show', itemId, timeStamp, function() {
                    // 增加最后一个参数，用于区分是主动提示区还是工具箱优化建议 by huiyao 2013.3.21
					widgetInstance.renderTimeout(itemData.timeString, itemId, itemData.data, me.wrapper === 'ManageAoWidget');
				});
			} else if(status == 2 && me.isRefreshItem(itemId)){  // 局部刷新后完成且无问题，则显示优化成功 
				me.invokeWidget('show', itemId, timeStamp, function(){ //提示优化成功
					widgetInstance.renderSuccess(timeStamp, itemId, itemData.data);
				});
			} else if(status != 0 && !me.isRefreshItem(itemId)){ //隐藏该项
				me.invokeWidget('hide', itemId, timeStamp, function(){
					widgetInstance.hide(itemId);
				});
			}
		}
			
		if(status > 1 && me.isRefreshItem(itemId)){
			//用过一次之后删除cache
			delete me.htmlCacheBeforeRefresh[itemId];
			
			if (me.isMainPage()) {
				me.toggleGroupMeta(group);
			}
		}
		
		// 轮询请求
		if (isLastItem && me.queryQueue.length > 0) {  //仅在处理至本轮最后一个子项时执行 局部刷新不自己触发轮询 
			if(me.command == 'refresh'){	//局部刷新
				if(me.queryThread){	//当前有其他轮询进程时，直接返回
					return;
				}
				//else {	//没有时，使用伪装timeStamp的方式独自发起轮询请求
				//	timeStamp = me.queryTimeStamp;
				//} // 这里已经判断了两个相等，所以不需要赋值
			}
			
			var now = (new Date()).valueOf(),
				queryInterval = me.queryInterval;
			
			if (me.command == 'start' || me.command == 'refresh') { //如果上一次是开始或刷新，则认为本次是第一次刷新。
				queryInterval = me.firstQueryInterval;
			}
			
			if (me.displayTimer > now){   //如果显示队列中仍有子项在等待
				queryInterval += me.displayTimer - now; //把这部分等待时间也算到下一次轮询前的等待时间里
			}

			me.queryThread = setTimeout(function(){
				me.changeParams({
					command: 'query',
					opttype: me.queryQueue
				});
				
				me.request(timeStamp);
			}, queryInterval);
		}
	},
	
	/**
	 * 调用子项，处理大项显示与关闭
	 * @param {Object} type
	 * @param {Object} itemId
	 * @param {Object} timeStamp
	 * @param {Object} callback
	 */
    invokeWidget : function(type, itemId, timeStamp, callback){
		var me = this,
			group = me.item2Group[itemId],
			itemContainer = baidu.g(me.widgetPrefix + itemId);
		
		if((timeStamp != me.queryTimeStamp)){	//检查当前时间戳
			return false;
		}
		
		if (type == 'show') {
			if (me.itemDisplayStatus[itemId] != true) {
				if (group.visualItem == 0) { // 对应大项的首个被显示的项目，大项还未展开
					me.toggleGroup(group, 'show');
				}
				++group.visualItem;
				me.itemDisplayStatus[itemId] = true;
				if(me.isMainPage()){
					baidu.show(itemContainer);
				}
			}
		} else {
			if (me.isMainPage()) {
				baidu.hide(itemContainer);
			}
			if(me.itemDisplayStatus[itemId] == true){
               
			    if(group.visualItem == 1){ // 对应大项的最后一个被隐藏项目
                    me.toggleGroup(group, 'hide');
                }
                --group.visualItem;
            }
			me.itemDisplayStatus[itemId] = false;
		}
		
        callback();
		
		var itemData = me.cacheData[itemId];
		
		//标记子项状态
		if (itemData.status > 1) { //该项已完成
			me.allItems[itemId] = 'done';
		}
		
		me.getProgress();
		
		//只有优化主页面页面才需要如下操作
        if (me.isMainPage()) {
			me.toggleGroupMeta(group);
		}
    },
	
	/**
	 * 清除正在渲染线程
	 */
	clearRenderThread : function() {
		var me = this;
		
		baidu.each(me.renderThread, function(item, index) {
			clearTimeout(item);
		});
		
		me.renderThread = [];
		
        // 重置时间戳
        me.queryTimeStamp = (new Date()).valueOf();
	},
	
	/**
	 * 计算优化项数量
	 */
	getCount : function() {
		var me = this,
			items = me.params.opttype,
			structure = nirvana.aoGroup.structure,
			isStableData,
			item,
			itemCount,
			group,
			count = {
				All : 0,
				Shows : 0,
				Clks : 0,
				Pv : 0,
				Trans : 0
			};
		
		for (var key in structure) {
			group = structure[key];
			
			isStableData = me.isStable(group);
			
			itemCount = isStableData.itemCount || 0;
			
			count[group.stage] += itemCount;
			
			count.All += itemCount;
		}
		
		me.count = count;
	},
	
	/**
	 * 大项信息处理，目前只有增加选择设置button
	 * @param {Object} group
	 */
	toggleGroupMeta : function(group){
		//大项是否稳定（稳定是指所有子项均已加载完成或超时，没有Loading存在）
		var me = this,
			itemData,
			isStableData = me.isStable(group),
			wrapper = baidu.g(group.id).getElementsByTagName('h2')[0].getElementsByTagName('span')[0];
        
		if(isStableData.isStable){ //稳定模式，显示总计和折叠按钮
			//显示与大项中最后一项的显示时间同步，避免提前于项目显示出来
			var now = (new Date()).valueOf(),
				showTimer = group.displayTimer - now;
			if(showTimer < 0) {
				showTimer = 0;
			}
			setTimeout(function(){
				baidu.removeClass(wrapper, 'hide');
				
				if (group.id == 'AoGroupBid' && !baidu.g('AoOption18')){
					var btn = baidu.dom.create('a', {
						'id' : 'AoOption18',
						'class' : 'ao_btn_opt',
						'href' : 'javascript:void 0;'
					});
					
					btn.innerHTML = '选项设置';
					wrapper.appendChild(btn);
					//btn.onclick = AoOption_18.optionWindow.open;
					btn.onclick = AoWidget_18.operation.openOptionWindow;
				}
			}, showTimer);
		} else {
			baidu.addClass(wrapper, 'hide');
		}
		
	},
	
	/**
	 * 获取进度
	 */
	getProgress : function() {
		var me = this;
		
		if(me.loadingProgress != 100){
            var allItems = me.allItems,
                allItemsCount = 0,
                finished = 0;
                
            for (var i in allItems){
                if (allItems[i] == 'done'){
                    finished++;
                }
                allItemsCount++;
            }
			
            me.loadingProgress = Math.floor((finished / allItemsCount) * 100);
			
			if(me.loadingProgress == 100 && me.queryQueue.length == 0){    //当进度达到100%时
				me.displayStats();   //显示统计信息
			}
        }
	},
	
	//切换大项的显示状态
	toggleGroup : function(group, type){
		var me = this;
		
		if(type == 'show'){
			group.show();
		} else {
			group.hide();
			
			if(!me.isMainPage()){
				baidu.hide('ManageAo');  //在层级页面中隐藏外部大容器
			}
		}
	},
	
	/**
	 * 优化主页面进度达100%后，更新统计信息，即优化项的数量
	 */
	displayStats : function(){
		var me = this,
		    count,
			i;

		
		me.getCount();
		
		count = me.count;
		
		for (i in count) {
			if (baidu.g('AoStage' + i + 'Num')) {
				baidu.g('AoStage' + i + 'Num').innerHTML = '(' + count[i] + ')';
			}
		}
		
		if (me.isMainPage()) {
			if (count.All != 0) { // 在不同阶段时，All的值和当前阶段应该相等，所以可以直接判断All是否为0
				baidu.addClass('AoResult', 'hide');
			} else {
				baidu.g('AoResult').innerHTML = '恭喜您！当前层级无待优化内容';
				baidu.removeClass('AoResult', 'hide');
			}
		} else {
			if (count.All != 0) { // 在不同阶段时，All的值和当前阶段应该相等，所以可以直接判断All是否为0
				// 显示主动提示区
				baidu.removeClass('ManageAo', 'hide');
				// 收起时的优化建议数量
				baidu.g('ManageAoNum').innerHTML = '共有' + count.All + '条优化建议，';
				me.initAoPkgArea(); // 初始化包引流入口
			} else {
				// 隐藏主动提示区
				baidu.addClass('ManageAo', 'hide');
			}
			
			// 主动提示区稳定后，重新渲染推广管理表格的宽度，否则表格可能出现空白
			baidu.event.fire(window,'resize');
		}
		
		// 数据区域表格适应
		if (ui.util.get('AoDataTable')) {
			ui.util.get('AoDataTable').refreshView();
		}
	},
	
	/**
	 * 清空统计信息
	 */
	clearStats : function() {
		var me = this,
		    count = me.count,
			i;
		
		for (i in count) {
			if (baidu.g('AoStage' + i + 'Num')) {
				baidu.g('AoStage' + i + 'Num').innerHTML = '';
			}
		}
	},
	
	/**
	 * 当前子项是否处在局部刷新状态
	 * @param {Object} itemId
	 */
	isRefreshItem : function(itemId){
		var me = this;
		
		return (typeof me.htmlCacheBeforeRefresh[itemId] != 'undefined');
	},
	
	/**
	 * 是否在优化建议工具页面
	 */
	isMainPage : function(){
		var me = this;
		
		return (me.aoEntrance == 'Tool');
	},
	
	/**
	 * 在推广管理中，用户的操作会触发账户优化工具刷新，判断当前用户看到的前N条数据中是否包含第8，9子项，如果是则发起刷新
	 */
	reload : function(action){
		var me = this;
			//current,
			//itemId,
			//itemParagraphs = baidu.g('AoGroupDefault').getElementsByTagName('p'),
			//start = (nirvana.aoListPager.pager.page - 1) * nirvana.AO.SUMMARY_DISPLAY_LIMIT,
			//end = Math.min(start + nirvana.AO.SUMMARY_DISPLAY_LIMIT, itemParagraphs.length);
		
		// 清除线程
		clearTimeout(me.reloadThread);
		
		if (me.action.getContext('isSearch')) { // 筛选状态
			if (nirvana.config.AO.FILTERSWITCH) { // 筛选功能打开
				me.reloadThread = setTimeout(function(){
					me.prepareInit();
				}, me.reloadTime);
			}
		} else {
			me.prepareInit();
		}
		
		/** 
		for (i= start; i < end; i++){	// 当前页是否包含8-17子项
			current = itemParagraphs[i].parentNode;
			if(!current){
				break;
			}
			if(current.id.indexOf(me.widgetPrefix) != 0 || current.innerHTML == ''){	//若该div不是子项的容器或者该子项innerHTML为空 则忽略
				continue;
			}
			
			itemId = current.id.substr(7) - 0;
			
			if (itemId >= 2 && itemId <= 17){
				me.initAoControl();
				break;
			}
		}
		*/
	},
	
	/**
	 * 判断某组是否达到稳定状态
	 */
	isStable : function(group){
		var me = this,
			itemId,
			itemData,
			isStable = true,
			itemCount = 0,
			items = me.getItems(group.items); // 这里需要过滤非请求项
			
		for (var i = 0, j = items.length; i < j; i++){
			itemId = items[i];
			itemData = me.cacheData[itemId];
            
			if(typeof itemData == 'undefined'){  //该子项数据不存在，说明第一次请求都还没有返回，大项不是稳定状态
				isStable = false;
				continue;
			}
			
			if(itemData.status < 2){ //子项状态为计算开始或计算中，大项不是稳定状态
				isStable = false;
			}
			
			if(me.isRefreshItem(itemId)){	//存在局部刷新中的子项，大项不是稳定状态
				isStable = false;
			}
			
			if (itemData.hasProblem || (itemData.status == 3 && baidu.g(me.widgetPrefix + itemId).innerHTML != '')) {   //存在问题或刷新后状态为超时时，增加计数
			    if(itemId == '2' || itemId == '52'){    //计划预算不足和推广搁置时段存在多结果
			    // 手动版升级的时段的摘要项
                    var count = itemData.data.length || 1;
					itemCount += count;
                } else {
                    itemCount++;
                }
			}
		}
		return {isStable : isStable, itemCount : itemCount};
	},
	
	/**
	 * 按请求项目的优先级排序
	 * nirvana.config.AO.OPTTYPE['ALL']
	 * 当前只是简单按ID升序。后续扩展时直接修改排序函数即可
	 */
	_sortItem : function(a, b){
		var sortArr = nirvana.config.AO.OPTTYPE['ALL'],
			i,
			nValue1,
			nValue2;
		
		for (i in sortArr) {
			if (sortArr[i] == a) {
				nValue1 = +i;
				continue;
			}
			if (sortArr[i] == b) {
				nValue2 = +i;
			}
		}
		
		if (nValue1 < nValue2){
	        return -1;
	    } else {
	        return 1;
	    }
	},
	
	_fadeOut : function(domList, json){
		var me = this,
			opacity = getStyle(domList[0], 'opacity'), // 用baidu.getStyle不行，暂时用这个代替
			interval = 20,
			duration = json.duration || 500,
			step = opacity / duration * interval,
			callback = json.callback || function(){};
		
		var fadeOutFunc = function(domList, start, end, step, interval, callback){
			var opacityVal = start - step,
				length = domList.length;
			
			for (var i = 0; i < length; i++){
				me._setOpacity(domList[i], opacityVal);
			}
			
			if(opacityVal <= end){
				for (var i = 0; i < length; i++){
					baidu.hide(domList[i]);
					me._setOpacity(domList[i], 1);//隐藏后恢复透明度为1
					domList[i].innerHTML = ''; // 清空HTML
				}
                return callback();
            } else {
				setTimeout(function(){
					fadeOutFunc(domList, opacityVal, end, step, interval, callback);
				}, interval);
			}
		};
		
		fadeOutFunc(domList, opacity, 0, step, interval, callback);
	},
	
	_setOpacity : function(el, opacityVal){
		var el = baidu.g(el);
		
		if(baidu.browser.ie){
            el.style.filter = 'alpha(opacity=' + Math.round(opacityVal * 100) + ')';
        } else {
            el.style.opacity = opacityVal; //for Mozilla,Chrome
            el.style.MozOpacity = opacityVal; //for Firefox 0.9 
            el.style.KHTMLOpacity = opacityVal; //for SafariF
        }
	},
	
	/**
	 * 动态优先级三期的新的排序方法：直接根据服务端返回的排序数据进行排序
	 * Added By Wu Huiyao 
	 **/
	dynamicRank : function() {
		var me = this;
		var absorder = me.absorder,
		    data = me.cacheData,
		    idArray = [],
		    i, len;
		
		for (i = 0, len = absorder.length; i < len; i ++) {
			idArray.push(absorder[i].opttype);
		}
		 
		
		//到这里已经得到了id的动态排序idArray
		me.dynamicSeq = idArray;
		
		//排列容器
		var container = baidu.g(nirvana.aoGroup.structure.defaultGroup.id),
			itemContainer;
			
		for (i = 0, len = idArray.length; i < len; i++){
			itemContainer = baidu.g(me.widgetPrefix + idArray[i]);
			container && container.appendChild(itemContainer);
		}
	},

// Deleted by Wu Huiyao
//	/**
//	 * 动态优先级
//	 */
//	dynamicRank : function(){
//		var me = this,
//			seq = [],
//			data = me.cacheData,
//			idArray = [],
//			rankArray = [],
//			scoreArray = [],
//			tmp;
//		
//		for (var itemId in data){
//			idArray.push(itemId);
//			rankArray.push(data[itemId].rank);
//			scoreArray.push(data[itemId].score);
//		}
//		
//		// 正序冒泡，按Rank排一次，排的时候同步idArray和scoreArray中的内容
//		for (var i = 0, length = idArray.length; i < length; i++){
//			for (var j = 0; j < length; j++){
//				if(rankArray[i] < rankArray[j]){
//					tmp = rankArray[i];
//					rankArray[i] = rankArray[j];
//					rankArray[j] = tmp;
//					
//					tmp = idArray[i];
//					idArray[i] = idArray[j];
//					idArray[j] = tmp;
//					
//					tmp = scoreArray[i];
//					scoreArray[i] = scoreArray[j];
//					scoreArray[j] = tmp;
//				}
//			}
//		}
//		
//		// rank相等的项目，再根据score做一次倒序冒泡，排的时候同步idArray中的内容
//		for (var i = 0; i < length; i++){
//			for (var j = 0; j < length; j++){
//				if(rankArray[i] == rankArray[j]){
//					if(scoreArray[i] > scoreArray[j]){
//						tmp = scoreArray[i];
//						scoreArray[i] = scoreArray[j];
//						scoreArray[j] = tmp;
//						
//						tmp = idArray[i];
//						idArray[i] = idArray[j];
//						idArray[j] = tmp;
//					}
//				}
//			}
//		}
//		
//		//到这里已经得到了id的动态排序idArray
//		me.dynamicSeq = idArray;
//		
//		//排列容器
//		var container = baidu.g(nirvana.aoGroup.structure.defaultGroup.id),
//			itemContainer;
//			
//		for (var i = 0; i < length; i++){
//			itemContainer = baidu.g(me.widgetPrefix + idArray[i]);
//			container && container.appendChild(itemContainer);
//		}
//	},
	
	/**
	 * 根据动态优先级顺序计算子项（行级别）的排列顺序
	 */
	getDynamicSeq : function(){
		var me = this,
			itemData,
			itemId,
			itemSeq = [];
			
		for (var i = 0, l = me.dynamicSeq.length; i < l; i++) {
			itemId = me.dynamicSeq[i];
			itemData = me.cacheData[itemId];
			
			if (itemData.hasProblem || (itemData.status == 3 && baidu.g(me.widgetPrefix + itemId).innerHTML != '')) {   //存在问题或刷新后状态为超时时，增加计数
			    if(itemId == '2' || itemId == '52'){    //计划预算不足和推广搁置时段存在多结果
                    // 手动版升级的时段的摘要项
                    var count = itemData.data.length || 1;
					
					for (var x = 0; x < count; x++){
						itemSeq.push(itemId);
					}
                } else {
					itemSeq.push(itemId);
                }
			}
		}
		
		return itemSeq;
	},
	
	/**
	 * 计算动态优先级下某一个子项的rank
	 * 具有多行结果的以第一行的rank为准
	 * @param {Object} itemId
	 */
	getDynamicItemSeq : function(item){
		var me = this,
			itemData,
			itemId,
			itemSeq = [],
			count = 0;
		
		for (var i = 0, l = me.dynamicSeq.length; i < l; i++){
			itemId = me.dynamicSeq[i];
			itemData = me.cacheData[itemId];
			
			if (itemData.hasProblem || (itemData.status == 3 && baidu.g(me.widgetPrefix + itemId).innerHTML != '')) {   //存在问题或刷新后状态为超时时，增加计数
			    if(itemId == item) {
					return count + 1;
				}
				
				if(itemId == '2' || itemId == '52'){    //计划预算不足和推广搁置时段存在多结果
                    // 手动版升级的时段的摘要项
					var len = itemData.data.length || 1;
					count += len;
                } else {
					count++;
                }
			}
		}
		
		return -1;
	},
	
	/**
	 * 获取摘要监控快照
	 */
	getLogSnapshot : function(){
		var me = this,
			data = {},
			itemData,
			i,
			condition = me.params.condition,
			level = me.params.level,
			tmpData;
		
		for (i in me.cacheData) {
			itemData = me.cacheData[i];
			tmpData = itemData.data;
			
			// 为了减少监控的字段太多，这里只需要判断优化建议的数量
			if (itemData.status === 2 && itemData.hasProblem === 1) { // 存在优化建议
				switch (i) {
					case '1': //账户预算存在问题，则建议数量肯定为1
					case '5': //关键词推荐，则建议数量肯定为1
					case '24': //转化路径分析报告，则建议数量肯定为1
                    case '30': //账户余额存在问题，则建议数量肯定为1
						data['ad_' + i] = 1;
						break;
					case '2': //计划预算不足和推广搁置时段存在多结果
//					case '7':// 老的时段优化项正式下掉 by Huiyao 2013.4.15
                    case '52': // 手动版升级的时段的摘要项
						data['ad_' + i] = tmpData.length;
						break;
					case '22': //跳出率记录关键词和创意的和
						data['ad_' + i] = (tmpData && tmpData[0]) ? (+tmpData[0].value[0] + +tmpData[0].value[1]) : '-';
						break;
					default:
						// start请求时，itemData.data有可能为null
						data['ad_' + i] = (tmpData && typeof tmpData[0] != 'undefined') ? tmpData[0].value[0] : '-';
						break;
				}
			} else { // 不存在优化建议或者超时等其他情况
				data['ad_' + i] = 0;
			}
		}
		
		data['level'] = level;
		
		// 标识粒度信息
		data['class_type'] = me.aoEntrance.toLowerCase();
		
		switch (level) {
			case 'planinfo':
				data['level_id'] = condition.planid;
				break;
			case 'unitinfo':
				data['level_id'] = condition.unitid;
				break;
			case 'wordinfo':
				data['level_id'] = condition.winfoid;
				break;
			case 'ideainfo':
				data['level_id'] = condition.ideaid;
				break;
			case 'folder':
				data['level_id'] = condition.folderid;
				break;
		}
		
		if (data['level_id']) {
			data['level_count'] = data['level_id'].length;
		}
		
		data['progress'] = me.loadingProgress;
		
		return data;
	},
	
	/**
	 * 获得LOG对象的值传递，有参数传入时仅进行传入对象的拷贝
	 * @param {Object} json
	 */
	getLogParamByVal : function(json){
		var me = this;
		
		if(typeof json == 'undefined'){
			json = me.getLogSnapshot();
		}
		
		json = baidu.object.clone(json); //值拷贝，避免污染原数据
		
		return json;
	},
	
	sendLog : function(userParam, snapShot){
		var me = this,
			i;
		
		snapShot = me.getLogParamByVal(snapShot);
		
		for (i in userParam){
			snapShot[i] = userParam[i];
		}
		
		if(!me.isMainPage() && nirvana.aoGroup.structure && nirvana.aoGroup.structure.defaultGroup) {	//列表页动态优先级特有逻辑，最小化工具箱时，defaultGroup有可能不存在，所以需要在这里判断
			var isStableData = me.isStable(nirvana.aoGroup.structure.defaultGroup),
				itemId = userParam['itemId'];
			
			snapShot['pagenum'] = nirvana.aoListPager.pager.page;
			
			if(isStableData.isStable){	//稳定状态
				snapShot['itemCount'] = isStableData.itemCount;
				
				if(typeof itemId != 'undefined'){
					snapShot['itemRank'] = me.getDynamicItemSeq(itemId);
				}
			} else {
				snapShot['itemCount'] = -1;
				
				if(typeof itemId != 'undefined'){
					snapShot['itemRank'] = -1;
				}
			}
		}
		
		NIRVANA_LOG.send(snapShot);
	},
	
	/**
	 * 给主导航绑定特殊点击事件
	 */
	bindNavMain: function(){
		var me = this;
		
		baidu.on('NavMainManage', 'click', me.navMainClickHandler);
		baidu.on('NavMainOverview', 'click', me.navMainClickHandler);
	},
	
    /**
     * 给主导航解除绑定特殊点击事件
     */
	unBindNavMain: function() {
        var me = this;
        
        baidu.un('NavMainManage', 'click', me.navMainClickHandler);
        baidu.un('NavMainOverview', 'click', me.navMainClickHandler);
	},
	
	/**
	 * 主导航点击事件
	 * @param {Object} e
	 */
	navMainClickHandler: function(e){
		var e = e || window.event,
		    target = e.target || e.srcElement;
		
		switch (target.id) {
			case 'NavMainManage':
				ToolsModule.close();
				// 推广管理页面重置弹窗
				ui.Popup.isModed = true;
				break;
			case 'NavMainOverview':
				break;
		}
		
		nirvana.aoControl.close(nirvana.aoControl.toolsName, false); // 不需要reload
	},
	
	/**
	 * 账户优化工具关闭方法
	 * 卸载帐户优化，并停止继续渲染
	 * 更改优化时间戳，避免页面继续渲染
     * @param {Object} toolsName
     * @param {Object} needReload
	 */
	close: function(toolsName, needReload){
		var control = {};
		
		if (typeof needReload == 'undefined') {
			var needReload = true;
		}

		// 效果突降下线 2012.12.03
		control = nirvana.aoControl;
		/**
		if (toolsName === 'proposal') {
			control = nirvana.aoControl;
		} else {
			control = nirvana.decrControl;
		}
		*/
		
		control.clearRenderThread();
		ToolsModule.unloadTrans(toolsName);
		
		if (control.isViewDetail) { // 全部优化建议查看过优化详情，则推广管理刷新
			if (needReload) {
				er.controller.fireMain('reload', {});
				
				//打开了详情，就认为设置已经改过了，实质上是为了让弹窗去进行强制重新请求是否应该展现
				ui.Popup.isModed = true;
			}
		} else { // 刷新主动提示区，这里只涉及全部优化建议的逻辑
			nirvana.aoControl.resetStat();
			nirvana.aoControl.init(nirvana.aoControl.action);
		}
		
		// 初始化弹窗
		if (ui.Popup.isModed) {
			// if (nirvana.env.EXP == '7450') { // 对照组下线
			// 	ui.Popup.rebuild();
			// 	nirvana.decrPopupCtrl.initPopUp(nirvana.aoControl.action);
			// }
			// else{
			nirvana.aoPkgControl.popupCtrl.destroy();
			nirvana.aoPkgControl.popupCtrl.init();
			// } // 对照组下线
		}
		
		// 关闭时清空toolsName
		nirvana.aoControl.toolsName = '';
        // 打开账户优化工具时，给导航绑定了事件，关闭工具时需要卸载
        nirvana.aoControl.unBindNavMain();
	},
	
	/**
	 * 获取当前的control，区别全部优化建议与效果突降
	 * 通过此方法获取的control不能进行修改，只能用于读取参数！！！
	 */
	getNowControl : function() {
		var me = this;
		
		// 效果突降下线，这里改为始终返回 nirvana.aoControl
		// 调用此方法的地方可以不用修改

		/**
		if (me.toolsName == 'decrease') { // 效果突降
			control = nirvana.decrControl;
		} else {
			control = me;
		}
		*/

		return me;
	}
};

nirvana.ao.lib.areahide = {
	isAreaHide: false,
	
	// 请求的状态
	isOk : false,
	
	/**
	 * 初始化收起状态
	 */
	init: function(){
		var me = this;
		
		if (me.isAreaHide) { // 收起状态，本次不再打开
			me.changeFoldState(true);
			me.isOk = true;
		} else {
			fbs.ao.getAreaHide({
				onSuccess: function(res){
					if (typeof(res.data) != "undefined" && res.data) { //返回不为0，则收起
						me.changeFoldState(true);
						me.isAreaHide = true;
					} else {
						me.changeFoldState(false, 0);
						me.isAreaHide = false;
					}
					me.isOk = true;
				}
			});
		}
		
		// 更新数据汇总
		baidu.g('ManageAoNum') && (baidu.g('ManageAoNum').innerHTML = '');
		baidu.g("AoFoldDetail").onclick = me.clickHandler();
		baidu.g("ManageAoFoldProp").onclick = me.clickHandler();
	},
	
	/**
	 * 点击事件
	 */
	clickHandler: function(){
		var me = this;
		return function(e){
			var event = e || window.event,
                target = event.target || event.srcElement,
				id = "";
			
			while (target && target.tagName.toLowerCase() != "body") {
				switch (target.id) {
					case "AoFoldTip":
						// 发请求，点击收起
						fbs.ao.modAreaHide({
							value: 100, // 100为收起
							onSuccess: function(response){
								me.changeFoldState(true);
								nirvana.aoWidgetAction.logCenter('ao_tip_toggle', {
									type: 'hide'
								});
							},
							onFail: function(response){
								ajaxFail(0);
							}
						});
						return;
					case "AoExpandTip":
						me.changeFoldState(false, 1);
						nirvana.aoWidgetAction.logCenter('ao_tip_toggle', {
							type : 'show'
						});
						return;
					case "AoExpandTipSpan":
						me.changeFoldState(false, 1);
						nirvana.aoWidgetAction.logCenter('ao_tip_toggle', {
							type : 'view'
						});
						return;
					default:
						target = target.parentNode;
						break;
				}
			}
		}
	},
	
	/**
	 * 收起or展开
	 * @param {Object} state	 true则收起false则展开
	 */
	changeFoldState: function(state, isIni){
		var me = this,
			aoFold = baidu.g("AoFoldTip"),
			aoExpand = baidu.g("AoExpandTip"),
			aoLoading = baidu.g("ManageAoLoading"),
			aoSummary = baidu.g("ManageAoSummary"),
			aoFoldProp = baidu.g("ManageAoFoldProp"),
			aoPkgArea = baidu.g('ManagerAoPkgArea');
		
		if(state) { // 收起
			baidu.addClass(aoFold, "hide");
			baidu.removeClass(aoExpand, "hide");
			baidu.addClass(aoLoading, "hide");
			baidu.addClass(aoSummary, "hide");
			baidu.removeClass(aoFoldProp, "hide");
			baidu.addClass(aoPkgArea, 'hide');
			
			me.isAreaHide = true;
			
			baidu.removeClass('ManageAo', 'height');
		} else {
			// 给容器增加固定高度，避免IE的抖动或错位
			baidu.g('ManageAo') && baidu.addClass('ManageAo', 'height');
			
			if (!isIni) {// 非初始化展开
				baidu.g(aoFold) && baidu.removeClass(aoFold, "hide");
				baidu.g(aoExpand) && baidu.addClass(aoExpand, "hide");
				//这里不需要控制摘要的显示逻辑
				//baidu.removeClass(aoSummary, "hide");
				baidu.g(aoFoldProp) && baidu.addClass(aoFoldProp, "hide");
				baidu.g(aoPkgArea) && baidu.addClass(aoPkgArea, 'hide');
				
				me.isAreaHide = false;
			} else {
				// 发请求，点击展开
				fbs.ao.modAreaHide({
					value: 0,
					onSuccess: function(res){
						baidu.removeClass(aoFold, "hide");
						baidu.addClass(aoExpand, "hide");
						//这里显示loading区域，摘要区域通过aoControl去展开
						//baidu.removeClass(aoLoading, "hide");
						//baidu.removeClass(aoSummary, "hide");
						baidu.addClass(aoFoldProp, "hide");
						
						me.isAreaHide = false;
						
						// 主动提示区全局刷新
						nirvana.aoControl.prepareInit();
					},
					onFail: function(res){
						ajaxFail(0);
					}
				});
			}
		}
	}
};

/**
 * 声明快捷方式
 */
nirvana.aoControl = nirvana.ao.lib.control;
nirvana.aoListPager = nirvana.ao.lib.listPager;
nirvana.aoGroup = nirvana.ao.lib.group;
nirvana.aoAreaHide = nirvana.ao.lib.areahide;