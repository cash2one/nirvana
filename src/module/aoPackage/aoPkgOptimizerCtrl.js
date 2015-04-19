/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/aoPkgOptimizer.js 
 * desc: 优化包中优化建议处理类
 * author: LeoWang(wangkemiao@baidu.com)
 * version : 2.0
 * date: $Date: 2012/09/11 $
 */

/**
 *
 * simple simple simple, be fking simple
 *
 * @description 所有优化包的“优化建议”获取类
 * 不再使用对象的方式构建，而是使用new的方式为每个包定制独立的类库对象
 * 数据信息使用自身的data对象去进行管理，可以使用方法：get、set、remove、clear
 *
 * 默认的：
 		可以选择，即options.multiSelect = true;
 		支持展开，即options.extendable = true|false;
 			为true时，options.extendedByDefault 标记是否是默认展开的
 		支持拆分数据，即options.splitData函数可用
		支持序号，options.hasRank = true|false;

 		//木有分级，即options.hasLevel = true|false;
 		//木有分组，即options.hasGroup = true|false;
	
	me.onafterGetAbsItemListSuccess方法，在获取优化建议信息成功之后会执行
	me.onafterShowOverviewItem方法，在展现一条摘要信息之后就会被立刻调用
	me.onafterRenderOptlist方法，这个回调函数，在顺序渲染完缓存中待渲染的所有opt项时会被调用
 	me.postProcessItemHtml方法，用于自定义在获取到itemHtml之后进一步的处理，会将之前的itemHtml、itemData和options传入
	me.onDetailSubActionClose方法，用于在详情子Action销毁之前调用
 *
 * @require AoPackage|MyPackage
 *
 * @param {Object} pkgid 包对象实例pkgid，必须传入
 * @param {Object} opts 配置信息 * 
 */

nirvana.aoPkgControl.AoPkgOptimizerCtrl = (function(){
	/**
	 * 优化建议的公共数据存储区，用于所有对象的统一数据控制
	 */
	var staticData = {
		_data : {},
		set : function(name, value){
			this._data[name] = value;
		},
		get : function(name){
			return this._data[name];
		},
		clear : function(){
			this._data = {};
		},
		remove : function(name){
			if('undefined' != typeof this._data[name]){
				delete this._data[name];
			}
		}
	};
	return nirvana.aoUtil.createClass({
		maxTry : nirvana.aoPkgConfig.QUERY_MAX_TRYTIMES,
		counter : 0,
		/**
		 * 构造函数
		 * 
		 * @param {String} pkgid 传入了对应app的pkgid
		 * @param {Object} opts 实际上是在new AoPackage(opts)这时候传入的，且必须传入
		 */
		init : function(pkgid, options){
			var me = this;
			me.pkgid = pkgid;
			me.appId = nirvana.aoPkgConfig.SETTING[nirvana.aoPkgConfig.KEYMAP[pkgid]].id;
			baidu.extend(me, options);
			me.options = options;

			// 一些默认设置
			me.containerDom = baidu.g(me.appId + 'AoPkgManagerContainer');
			me.titleDom = baidu.g(me.appId + 'AoPkgManagerTitle');
			me.mainDom = baidu.g(me.appId + 'AoPkgManagerMain');
			me.detailDom = baidu.g(me.appId + 'AoPkgDetailContainer');

			// 更默认的配置
			if('undefined' == typeof options.multiSelect){
				options.multiSelect = true;
			} 
			me.applyInterval = [];
			me.preProcess();
			me.initAOP();
		},

		initAOP : function(){
			var me = this,
				oldopts = me.options;
			
			if(me.listenFunctions && me.listenFunctions.length > 0){
				nirvana.aoUtil.aop.inject(me, me.listenFunctions);
			}
		},

		/**
		 * 获取当前的公共数据，只能通过此方法访问，属性访问会报错
		 */
		getStaticData : function(name){
			return ('undefined' == typeof name ? staticData : staticData.get(name));
		},
		
		/**
		 * 设置当前的公共数据的某条，只能通过此方法进行，必须传递name参数
		 */
		setStaticData : function(name, value){
			if('undefined' == typeof name){
				return false;
			}
			staticData.set(name, value)
			return true;
		},

		/**
		 * 清空当前的公共数据，只能通过此方法进行
		 */
		clearStaticData : function(){
			staticData.clear();
		},

		/**
		 * 删除某条公共数据，只能通过此方法进行
		 */
		removeStaticData : function(name){
			staticData.remove(name);
		}
	});
})();

baidu.extend(nirvana.aoPkgControl.AoPkgOptimizerCtrl.prototype, {
	// 默认优化摘要请求参数
	defaultAbsRequestParam : {
		level : 'useracct',
		condition : {
			client : 'web'		// 请求方，web，app，如果不填，默认为0
			//force : 0,			// 强制获取优化建议，并清除效果检验状态，仅扩大商机包start时可用，不填则为0，表示不强制获取
			//decrtype : ''		// 突降类型，效果恢复包需提供该字段，”clks”/”shows”，start时无需提供
		},
		command : 'start',		// start表示轮询请求开始
		pkgids : [],			// 包id
		opttypeids : [],		// opttype的id数组，但是此项不会发送给后端
		absreqitems : []
	},

	/**
	 * @description 自身数据存储控制
	 */
	data : {
		_data : {},
		set : function(name, value){
			this._data[name] = value;
		},
		get : function(name){
			return this._data[name];
		},
		clear : function(){
			this._data = {};
		},
		remove : function(name){
			if('undefined' != typeof this._data[name]){
				delete this._data[name];
			}
		}
	},

	getCache : function(opttypeid){
		var me = this,
			_data = me.data.get('cache') || {};
		if('undefined' == typeof opttypeid){
			return _data;
		}
		else{
			return _data[opttypeid];
		}
	},
	setCache : function(opttypeid, data){
		var me = this,
			_data = me.data.get('cache') || {};
		_data[opttypeid] = data;
		me.data.set('cache', _data);
	},
	clearCache : function(){
		me.data.set('cache', {});
	},
	removeCache : function(opttypeid){
		var me = this,
			_data = me.data.get('cache') || {};
		if('undefined' != typeof _data[opttypeid]){
			delete _data[opttypeid];
		}
		me.data.set('cache', _data);
	},


	/**
	 * @description 待渲染缓存区
	 */
	getCache2show : function(opttypeid){
		var me = this,
			_data = me.data.get('cache2show') || {};
		if('undefined' == typeof opttypeid){
			return _data;
		}
		else{
			return _data[opttypeid];
		}
	},
	setCache2show : function(opttypeid, data){
		var me = this,
			_data = me.data.get('cache2show') || {};
		_data[opttypeid] = data;
		me.data.set('cache2show', _data);
	},
	clearCache2show : function(){
		var me = this;
		me.data.set('cache2show', {});
	},
	removeCache2show : function(opttypeid){
		var me = this,
			_data = me.data.get('cache2show') || {};
		if('undefined' != typeof _data[opttypeid]){
			delete _data[opttypeid];
		}
		me.data.set('cache2show', _data);
	},

	/**
	 * @description 获取请求时间戳
	 */
	getTimestamp : function(){
		var me = this,
			appId = me.appId;
		return me.getStaticData(appId + 'QueryTimeStamp');
	},
	
	/**
	 * @description 设置请求时间戳，同一时间一个包只允许一个轮询请求存在，使用时间戳标识、匹配
	 */
	setTimestamp : function(timeStamp){
		var me = this,
			appId = me.appId;
		return me.setStaticData(appId + 'QueryTimeStamp', timeStamp);
	},

	/**
	 * @description 前置处理
	 */
	preProcess : function(){
		var me = this,
			pkgid = me.pkgid,
			appId = me.appId;

		// 根据包实例对象的数据，修改默认摘要请求参数数据中的包id和opttype的id数组
		me.defaultAbsRequestParam.pkgids = [pkgid];
		me.defaultAbsRequestParam.opttypeids = me.options.OPTTYPE;
	},

	/**
	 * @description 整理初始化获取请求摘要信息时的请求参数
	 */
	getInitialRequestParam : function(){
		var me = this;
		
		// 克隆一份默认请求参数
		var	absRequestParam = baidu.object.clone(me.defaultAbsRequestParam);
		
		// 对参数进行前置处理，去重、排序等等
		me.processRequestParam(absRequestParam);
		
		// 处理opttypeids数组，转换为待发送的对象数组
		me.processOpttypeInfo(absRequestParam);

		return absRequestParam;
	},

	/**
	 * @description 处理摘要请求的参数数据 
	 * 
	 * @param {Object} absRequestParam 待处理的参数对象
	 */
	processRequestParam : function(absRequestParam){
		var me = this,
			opttypeids = absRequestParam.opttypeids;
	
		baidu.array.each(opttypeids, function(item, index){
			opttypeids[index] = Math.floor(item);
		});

		// 去重
		opttypeids = baidu.array.unique(opttypeids);
		// 按优先级排序
		opttypeids.sort(me.getSortItemsOrder());
		
		absRequestParam.opttypeids = opttypeids;
	},

	/**
	 * @description 按请求项目的优先级排序
	 * 这里是按照config中OPTTYPE数组中的先后顺序进行排序
	 */
	getSortItemsOrder : function(){
		var me = this;
		
		return function(a, b){
			var sortArr = me.options.OPTTYPE,
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
		}
	},

	/**
	 * 为摘要请求参数处理opttype的信息
	 * 将opttypeids数组信息处理，得到一个对象数组，顺序保持原样 
	 */
	processOpttypeInfo : function(absRequestParam){
		var me = this,
			opttypeids = absRequestParam.opttypeids,
			opttype = [],
			i;
		for(i = 0; i < opttypeids.length; i++){
			opttype[i] = {
				opttypeid : opttypeids[i]
			};
		}
		absRequestParam.absreqitems = opttype;
		return absRequestParam;
	},

	/**
	 * @description 获取请求摘要信息时的请求参数
	 *
	 * @param {Boolean} isnew 是否是去获取默认的初始请求使用的请求参数，用于第一次请求或者重新开始请求 
	 */
	getRequestParam : function(isnew){
		var me = this,
			absRequestParam;
		
		if(isnew){
			absRequestParam = me.getInitialRequestParam();
		}
		else{
			// 先试图获取存储于包数据区中的请求参数数据
			absRequestParam = me.data.get('absRequestParam');
			// 如果没有数据的话，则使用默认的数据
			if(!absRequestParam){
				absRequestParam = me.getInitialRequestParam();
			}
		}

		// 将数据保存至数据区中
		me.data.set('absRequestParam', absRequestParam);

		return absRequestParam;
	},

	/**
	 * @description 修改摘要请求参数，并存入包数据区
	 * @param {Object} param
	 */
	changeRequestParam : function(param) {
		var me = this,
			temp;
		
		var absRequestParam = me.getRequestParam();
		
		if('undefined' != typeof param.condition){
			baidu.extend(absRequestParam.condition, param.condition);
			delete param.condition;
		}
		
		baidu.extend(absRequestParam, param);
		
		// 保存至包数据区
		me.data.set('absRequestParam', absRequestParam);
	},


	/**
	 * @description 重置整个优化建议状态
	 */
	clear : function(){
		var me = this;
		if(me.queryThread){
			clearTimeout(me.queryThread);
			me.queryThread = null;
		}
		me.data.clear();
		me.hasadvice = false;
		me.setTimestamp(null);
		me.command = 'start';
		me.counter = 0;
		me.hideLoading();
	},

	resetStatus : function(){
		var me = this;
		if(me.queryThread){
			clearTimeout(me.queryThread);
			me.queryThread = null;
		}
//		me.setTimestamp(null); // Del by Huiyao 2013-5-13: 这可是修改全局信息，
                               // FIXBUG: 快速关闭一个优化包（摘要请求还未返回）再快速打开
                               // 优化包，摘要处理被中断
		me.command = 'start';
		me.counter = 0;
		me.hideLoading();
	},

	/**
	 * @description 开始展现
	 */
	show : function(isForce){
		var me = this;

		// 全新、完整的一次优化建议摘要项请求
		me.clear();

		var timeStamp = (new Date()).valueOf();
		// 保存时间戳
		me.setTimestamp(timeStamp);

		// 特殊逻辑，为了监控需要，在展现详情时，认为一次展现就是一个动作
        nirvana.aoPkgControl.logCenter.actionStepPlus1();

		me.renderContainer();
		me.showLoading();
		me.data.set('roundId', 0);
		me.getAbsItemList(timeStamp, isForce);
		me.bindHandlers();
	},

	/**
	 * @description 显示ajax的loading 
	 */
	showLoading : function(){
		var me = this,
			div = $$('#' + me.titleDom.id + ' .aoPkg_optlist_loading')[0];

		// nirvana.util.loadingQuery.show();
		if(!div){
			div = document.createElement('div');
			div.className = 'aoPkg_optlist_loading '
                + me.appId.toLowerCase() + '_pkg_loading'; //特定包定制loading样式 by Huiyao 2013.1.11
			div.innerHTML = '<img src="./asset/img/loading.gif" />';
			me.titleDom.appendChild(div);
		}
		else{
			baidu.show(div);
		}
	},
	/**
	 * @description 隐藏ajax的loading 
	 */
	hideLoading : function(){
		var me = this,
			div = $$('#' + me.titleDom.id + ' .aoPkg_optlist_loading')[0];
		
		// nirvana.util.loadingQuery.hide();
		if(div){
			baidu.hide(div);
		}
	},

	/**
	 * @description 初始化或者重置摘要展现区域容器
	 * 用途：在一次全新的请求之后，渲染之前，会调用此函数
	 */
	renderContainer : function(){
		var me = this,
			appId = me.appId,
			containerDom = me.containerDom,
			titleDom = me.titleDom,
			mainDom = me.mainDom;

		// titleDom.innerHTML = '';
		mainDom.innerHTML = '<ul id="' + appId + 'AoPkgOptList"></ul>';
		me.optItemRenderTargetId = appId + 'AoPkgOptList';
	},

	/**
	 * @description 统一获取优化建议摘要项列表的接口
	 * 
	 * @param {Object} timeStamp 时间戳
	 * @param {Boolean} isForce 是否强制请求状态 默认为false
	 */
	getAbsItemList : function(timeStamp, isForce){
		var me = this,
			appId = me.appId;

		// 请求次数控制
		if(me.counter >= me.maxTry){
			// 处理那些没有渲染的东西，以及那些被过滤掉的数据
			me.processInterruption();
			me.resetStatus(timeStamp);
            // added by Huiyao 2013.2.20 增加请求超时回调
            me.onRequestTimeout && me.onRequestTimeout();
			return;
		}

		// 获取请求参数
		var	param = baidu.object.clone(me.getRequestParam());
		if (param.opttypeids.length == 0 || param.absreqitems.length == 0) { // opttype为空，则不发请求
			me.resetStatus(timeStamp);
			return;
		}
		// 判断之后，请求参数里不需要opttypeids属性，删除之
		delete param.opttypeids;
		
		if(isForce){
			param.condition.force = '1';
		}

		var roundId = me.data.get('roundId') + 1;

		param.condition.pkgContext = nirvana.aoPkgControl.logCenter.pkgContext;
        param.condition.actionStep = nirvana.aoPkgControl.logCenter.actionStep;
        param.condition.globalId = me.data.get('globalId');
        param.condition.roundId = roundId;

        me.data.set('roundId', roundId);

		param.onSuccess = me.getAbsItemListSuccess(timeStamp);
	
		param.onFail = function(response) {
			me.resetStatus(timeStamp);
			ajaxFailDialog();
            // added by Huiyao 2013.2.20 增加请求失败回调
            me.onRequestFail && me.onRequestFail(response);
		};
		me.counter++;
		// 获取优化摘要
		fbs.nikon.getPackageAbstract(param);
	},

	/**
	 * @description 获取优化摘要response成功处理函数  
	 * 
	 * @param {Object} timeStamp 时间戳标记
	 */
	getAbsItemListSuccess : function(timeStamp){
		var me = this,
			appId = me.appId;
		
		return function(response) {
			var data = response.data,
				aostatus = data.aostatus,
				absresitems = data.absresitems,
				reqid = data.reqid;
			
			if (aostatus != 0) {
				switch (aostatus) {
					case 3:  // 失败
						break;
					case 100:  // 参数错误
					default:
						ajaxFailDialog(); // 相当于status 500
						break;
				}
				me.resetStatus(timeStamp);
				return;
			}
				
			// 如果有拆分数据的需求
			if (typeof me.options.splitData === 'function') {
				me.options.splitData(absresitems);
			}
			
			// 以opttype排序，后台应该是按前台请求的顺序返回的，这里再排序一次保证顺序
			absresitems.sort(function(a, b){
				return me.getSortItemsOrder()(a.opttypeid, b.opttypeid);
			});

			me.onafterGetAbsItemListSuccess
				&& me.onafterGetAbsItemListSuccess(response);

			// 下面开始对“初始请求”在返回之后进行处理
			// 开始进入轮询阶段
			me.processResponse({
				absresitems : absresitems,
				timeStamp : timeStamp,
				reqid : reqid
			});
		};
	},

	/**
	 * 根据返回数据处理轮询及子项加载等逻辑
	 * @param {Object} data 
	 */
	processResponse : function(data){
		var me = this,
			appId = me.appId,
			absresitems = data.absresitems,
			timeStamp = data.timeStamp,
			reqid = data.reqid,
			i, j, l,
			item, opttypeid,
			requestParam = me.getRequestParam(),  //上一次请求保存的请求参数
			queryItems = requestParam.opttypeids;

		// 时间戳对不上，不进行处理
		if(timeStamp != me.getTimestamp()){
			me.resetStatus(timeStamp);
			return;
		}
		var globalId;
		for (i = 0, l = absresitems.length; i < l; i++) {
			globalId = absresitems[i].data.globalId;
			item = absresitems[i];
			opttypeid = +item.opttypeid.toString().replace(/\D\w+/g, '');
			baidu.array.remove(queryItems, opttypeid);
			if (item.status == 1) { //计算中时，推入下次轮询队列
				queryItems.push(+opttypeid);
			}
			else{ 
				// 保存至缓存区，供外部调用
				me.setCache(+item.opttypeid, item);
				// 同时保存一份进入摘要渲染缓存区，供渲染使用，因为需要按顺序渲染，会进行删除，因此多保存一份
				me.setCache2show(+item.opttypeid, item);
			}
		}

		me.data.set('globalId', globalId);

		// 接下来如果进行轮询行为的话，需要为请求参数添加opttime信息
		if(queryItems.length > 0){
			var reqitems = [];
			var found = false;
			for(i = 0; i < queryItems.length; i++){
				found = false;
				for(j = 0; j < absresitems.length; j++){
					item = absresitems[j];
					opttypeid = +item.opttypeid.toString().replace(/\D\w+/g, '');
					if(opttypeid == queryItems[i]){
						found = true;
						break;
					}
				}
				if(found){
					reqitems.push({
						opttypeid : queryItems[i],
						opttime : absresitems[j].opttime
					});
				}
			}

			// 重新设置请求的opttypeids队列，其实就是重新设置了下一轮的请求数据，因此使用changeRequestParam
			me.changeRequestParam({
				'opttypeids' : queryItems,
				'reqid' : data.reqid,
				'absreqitems' : reqitems
			});
		}

		// 处理本批次载入的子项数据，按照配置顺序展现
		me.showCachedItems();

		// 判断queryQueue，进行轮询
		me.queryRequest(timeStamp);
	},

	/**
	 * 显示空摘要信息
	 */
	showNoOptimizer : function(){
		var me = this,
			appId = me.appId,
			mainDom = me.mainDom;
		
		me.clear();
		mainDom && (mainDom.innerHTML = me.options.emptyMessage);
		ui.util.get(appId + 'AoPkgApplyAllBtn')
			&& ui.util.get(appId + 'AoPkgApplyAllBtn').disable(true);
	},

	/**
	 * 处理缓存中的优化项数据，主要是为了按照配置顺序渲染，如果出现跳的情况就终止渲染，下次返回再继续从当前位置开始进行渲染 
	 */
	showCachedItems : function(){
		var me = this,
			appId = me.appId,
			cache = me.getCache2show(),
			item, itemId,
			opttypeids = me.options.OPTTYPE,
			currentIndex = me.data.get('currentRenderIndex') || 0,
			found,
			displayLogParam = me.data.get('displayedAbsItemLogParam') || [];
		
		found = false;
		for(itemId in cache){
			itemId -= 0;
			item = cache[itemId];
			if(itemId == opttypeids[currentIndex]){
				found = true;
				break;
			}
		}
		if(found){
			// 处理展现摘要项的信息，计算完成且有问题的话
			if(item.status == 0){
				if (item.hasproblem) {
					displayLogParam.push(baidu.object.clone(item));
					// 展现该条		
					// me.showOverviewItem(itemId);
					me.hasadvice = true;
				} 
				// 展现该条		
				me.showOverviewItem(itemId);
			}
			// 如果计算超时了
			else if(item.status == 2){
                if (item.hasproblem) {
                    displayLogParam.push(baidu.object.clone(item));
                    me.hasadvice = true;
                }
				// 展现该条，以超时的方式
				me.showOverviewItem(itemId, {
					timeout : true
				});
			}

			//me.refreshOptimizerCount();
			currentIndex++;
			me.data.set('currentRenderIndex', currentIndex);
			me.data.set('displayedAbsItemLogParam', displayLogParam);

			me.removeCache2show(itemId);
			
			setTimeout(function(){
				me.showCachedItems();
			}, 100);
			
		}
		else{
			if(currentIndex >= opttypeids.length){
				// me.hideLoading();
				if(!me.hasadvice){
					me.showNoOptimizer();
				}
				me.data.set('currentRenderIndex', 0);
				me.clearCache2show();
				
				var app = nirvana.aoPkgControl.packageData.get(nirvana.aoPkgConfig.KEYMAP[me.pkgid]);
				// nirvana.aoPkgControl.logCenter.clear()
				// 						   .initWith(app)
				// 						   .processDisplayParam(displayLogParam)
				// 						   .sendAs('nikon_is_stable')
				// 						   .clear()
				// 						   .initWith(app);

				// displayLogParam = me.data.get('displayedAbsItemLogParam') || []
				nirvana.aoPkgControl.logCenter.processDisplayParam(displayLogParam)
											  .sendAs('nikon_is_stable');

				// 注意，这个回调函数，在顺序渲染完缓存中待渲染的opt项时会被调用
				me.onafterRenderOptlist && me.onafterRenderOptlist();
				
			}
		}
	},

	/**
	 * 处理发生了中断时的残余信息
	 */
	processInterruption : function(){
		var me = this,
			appId = me.appId,
			cache = me.getCache2show(),
			item, itemId,
			opttypeids = me.options.OPTTYPE,
			currentIndex = me.data.get('currentRenderIndex') || 0,
			found,
			displayLogParam = me.data.get('displayedAbsItemLogParam') || [],
			i, l;

		for(i = currentIndex, l = opttypeids.length; i < l; i++){
			item = cache[opttypeids[i]];
			if(item){
				itemId = +item.opttypeid;

				if(item.status == 0 && item.hasproblem){
					displayLogParam.push(baidu.object.clone(item));
					// 展现该条		
					me.showOverviewItem(itemId);
					me.hasadvice = true;
				}
				// 如果计算超时了
				else if(item.status == 2 && item.hasproblem){
					displayLogParam.push(baidu.object.clone(item));
					// 展现该条，以超时的方式		
					me.showOverviewItem(itemId, {
						timeout : true
					});
					me.hasadvice = true;
				}
			}
		}

		if(!me.hasadvice){
			me.showNoOptimizer();
		}

		me.data.set('currentRenderIndex', 0);
		me.clearCache2show();
		
		var app = nirvana.aoPkgControl.packageData.get(nirvana.aoPkgConfig.KEYMAP[me.pkgid]);

		nirvana.aoPkgControl.logCenter.processDisplayParam(displayLogParam)
									  .sendAs('nikon_is_stable');

		// 注意，这个回调函数，在顺序渲染完缓存中待渲染的opt项时会被调用
		me.onafterRenderOptlist && me.onafterRenderOptlist();
		
	},

	onafterRenderOptlist : function(){
		var me = this,
			appId = me.appId;
		if(me.hasadvice){
			ui.util.get(appId + 'AoPkgApplyAllBtn')
				&& ui.util.get(appId + 'AoPkgApplyAllBtn').disable(false);
		}
		else{
			ui.util.get(appId + 'AoPkgApplyAllBtn')
				&& ui.util.get(appId + 'AoPkgApplyAllBtn').disable(true);
		}
	},

	/**
	 * 判断queryQueue，进行轮询
	 * @param {Object} timeStamp
	 */
	queryRequest : function(timeStamp) {
		var me = this,
			queryInterval = 0,
			appId = me.appId,
			command = me.command;
		
		switch (command) {
			case 'start':
				// 如果上一次是开始，则认为本次是第一次刷新，直接进行轮询，不判断是否存在轮询队列
				queryInterval = nirvana.aoPkgConfig.QUERY_INTERVAL;
				
				me.changeRequestParam({
					command: 'query'
				});
				me.command = 'query';

				me.queryThread = setTimeout(function(){
					me.getAbsItemList(timeStamp);
				}, queryInterval);
				
				break;
			case 'refresh':
				// 本次是局部刷新 当前有其他轮询进程时，说明轮询在进行中，直接返回
				// 这里逻辑暂时走不到，先注释掉
				//if (me.queryThread) {
				//	return;
				//}
			case 'query':
				queryInterval = nirvana.aoPkgConfig.QUERY_INTERVAL;
				me.queryThread = setTimeout(function(){
					me.getAbsItemList(timeStamp);
				}, queryInterval);
				break;
			default:
				break;
		}
	},

	isExtendable : function(opttypeid){
		var me = this,
			opttypeid = +opttypeid;
		return me.options.extendable && baidu.array.indexOf(me.options.extendable, opttypeid) > -1;
	},

	/**
	 * 展现某条摘要 
	 */
	showOverviewItem : function(opttypeid, options){
		var me = this,
			appId = me.appId,
			options = options || {
				timeout : false
			},
			suboption,
			item = me.getCache(opttypeid),
			subitem,
			html = '', subhtml = '', temphtml,
			targetId = me.optItemRenderTargetId,
			modifiedItem = me.data.get('modifiedItem') || [],
			target,
			i, l, found;
		
		// 如果是有问题
		if(item.hasproblem){
			modifiedItem = baidu.array.unique(modifiedItem);

			// 如果当前是可展开的opttypeid，即同一个opttypeid返回了多条数据，存储在compData中
			// 它需要可展开和收起
			var theid = opttypeid.toString().replace(/\D\w+/g, '');
			if(me.isExtendable(opttypeid) && item.compData){
				options.extendable = true;
				if(!me.options.hasRank){
					// 标记已部分优化
					found = false;
					var splitid;
					for(i = 0, l = item.compData.length; i < l; i++){
						splitid = (theid == '303' ? i : item.compData[i].planid);
						if(baidu.array.indexOf(modifiedItem, opttypeid + '_' + splitid) > -1){
							found = true;
						}
					}
					if(found){
						options.modified = true;
					}
				}

				// 搞出子列表
				subhtml = me.getSubListHtml(opttypeid, options);

				if(me.options.hasRank || me.options.forceNoExtend){
					html = subhtml;
				}
				else{
					temphtml = me.getItemHtml(item, options, {
						subhtml : subhtml
					});
					// 用于自定义在获取到itemHtml之后进一步的处理，会将之前的itemHtml以及options传入
					me.postProcessItemHtml && (temphtml = me.postProcessItemHtml(temphtml, item, options));
					html = temphtml;
				}
			}
			else{
				// 标记已部分优化
				if(baidu.array.indexOf(modifiedItem, opttypeid.toString()) > -1){
					options.modified = true;
				}
				temphtml = me.getItemHtml(item, options);
				// 用于自定义在获取到itemHtml之后进一步的处理，会将之前的itemHtml以及options传入
				me.postProcessItemHtml && (temphtml = me.postProcessItemHtml(temphtml, item, options));
				html = temphtml;
			}

			// 保存修改过的“已部分修改”的数据
			me.data.set('modifiedItem', modifiedItem);
		}

		target = me.getItemContainerTarget(item);
		var itemTarget = baidu.g('AoPkgAbsItem' + opttypeid);

		if(target){
			if(options.refreshing){
				// 如果是刷新状态，返回html，不进行html的插入，因此这里不做动作
				return html;
			}
			else{
				if(itemTarget){
					itemTarget.innerHTML = html;
				}
				else{
					target.innerHTML += html;
				}
			}
		}
		
		// 刷新序号
		if(me.options.hasRank){
			me.refreshRank();
		}

		me.onafterShowOverviewItem && me.onafterShowOverviewItem(opttypeid, options)
		
		return html;
	},

	/**
	 * 获取optitem对应的渲染位置，容器，不是自身
	 */
	getItemContainerTarget : function(item){
		var me = this,
			targetId = me.optItemRenderTargetId;

		return baidu.g(targetId);
	},

	/**
	 * 针对于extendable的摘要项，获取其展开项的列表数据
	 */
	getSubListHtml : function(opttypeid, options){
		var me = this,
			suboption = baidu.object.clone(options),
			item = me.getCache(opttypeid),
			modifiedItem = me.data.get('modifiedItem') || [],
			subhtml = '', temphtml, subitem;

		baidu.extend(suboption, {
			issub : true,
			modified : false
		});

		for(var i = 0, l = item.compData.length; i < l; i++){
			subitem = baidu.object.clone(item);
			baidu.extend(subitem.data, item.compData[i]);
			suboption.index = i;
			suboption.modified = false;

			if(me.options.hasRank || me.options.forceNoExtend){
				// 标记已部分优化
				if(baidu.array.indexOf(modifiedItem, opttypeid + '_' +item.compData[i].planid) > -1){
					suboption.modified = true;
				}
			}

			temphtml = me.getItemHtml(subitem, suboption);
			// 用于自定义在获取到itemHtml之后进一步的处理，会将之前的itemHtml以及options传入
			me.postProcessItemHtml && (temphtml = me.postProcessItemHtml(temphtml, subitem, suboption));
			subhtml += temphtml;
		}
		return subhtml;
	},

	getItemHtml : function(item, options, extraReplacement){
		var me = this,
			appId = me.appId,
			opttypeid,
			data = item.data,
			compData = item.compData,
			timeoutmsg = nirvana.aoPkgConfig.MSG.TIMEOUT[me.options.level.toUpperCase()],
			options = options || {
				timeout : false
			}, newoptions,
			detailhtml, plushtml,
			conhtml, itemhtml, itemtplname, itemData = {},
			extraReplacement = extraReplacement || {};

		opttypeid = +item.opttypeid.toString().replace(/\D\w+/g, '');
		detailhtml = me.getDetailHtml(item, options);
		plushtml = me.getPlusHtml(item, options);

		itemtplname = me.getItemTplName(item, options);

		if(options.extendable){
			if(me.options.multiSelect){
				// itemtplname = 'aoPkgCheckableOptItem';
				if(options.issub){
					itemData.opttypeid = item.opttypeid + '_' + options.index;
					itemData.itemclass = 'aopkg_abssubitem';
					itemData.input_plusattr = 'sub_index="' + options.index + '"';
					itemData.input_action_type = 'optimizer_subitemcheck';
					itemData.input_action_data = opttypeid;
				}
				else{
					itemData.opttypeid = item.opttypeid;
					itemData.itemclass = 'aopkg_absmainitem';
					itemData.input_plusattr = '';
					itemData.input_action_type = 'optimizer_listcheck';
					itemData.input_action_data = opttypeid;
				}
			}
			else{
				// itemtplname = 'aoPkgDefaultOptItem';
				if(options.issub){
					itemData.opttypeid = item.opttypeid + '_' + options.index;
					itemData.itemclass = 'aopkg_abssubitem';
				}
				else{
					itemData.opttypeid = item.opttypeid;
					itemData.itemclass = 'aopkg_absmainitem';
				}
			}
		}
		else{
			if(me.options.multiSelect){
				// itemtplname = 'aoPkgCheckableOptItem';
				itemData.opttypeid = item.opttypeid;
				itemData.itemclass = 'aopkg_absmainitem';
				itemData.input_plusattr = '';
				itemData.input_action_type = 'optimizer_itemcheck';
				itemData.input_action_data = item.opttypeid;
			}
			else{
				// itemtplname = 'aoPkgDefaultOptItem';
				itemData.opttypeid = item.opttypeid;
			}
		}
		
		baidu.extend(itemData, extraReplacement);

		itemhtml = er.template.get(itemtplname);
		itemData.detailhtml = detailhtml;
		itemData.plushtml = plushtml;
		itemhtml = lib.tpl.parseTpl(itemData, itemhtml);

		if(options.extendable && !options.issub){
			conhtml = er.template.get('aoPkgExtendableMainItem');
			newoptions = {
				itemhtml : itemhtml,
				extraclassname : me.extendedByDefault ? '' : ' hide'
			};
			baidu.extend(newoptions, itemData);
			itemhtml = lib.tpl.parseTpl(newoptions, conhtml);
		}

		// 处理%handle，即是否有全部启用按钮
		if (data.count && data.count > nirvana.aoPkgConfig.QUICK_ACCEPT_LIMIT) {
			itemhtml = itemhtml.replace(/%handle/, '');
		} else {
			itemhtml = itemhtml.replace(/%handle/, '<a class="aopkg_enable" href="javascript:void 0;">全部启用</a>');
		}

		return itemhtml;
	},

	getItemTplName : function(item, options){
		var me = this,
			appId = me.appId,
			opttypeid,
			itemtplname;

		if(me.options.multiSelect){
			itemtplname = 'aoPkgCheckableOptItem';
		}
		else{
			itemtplname = 'aoPkgDefaultOptItem';
		}

		return itemtplname;

	},


	/**
	 * 获取某条优化建议的具体信息，单纯的具体信息，没有多余的信息
	 */
	getDetailHtml : function(item, options){
		var me = this,
			appId = me.appId,
			opttypeid,
			data = item.data,
			compData = item.compData,
			options = options || {
				timeout : false
			},
			html,
			idfortpl,
			rankhtml = er.template.get('aoPkgAbsRankNo');

		opttypeid = +item.opttypeid.toString().replace(/\D\w+/g, '');
		// 因为模板名称不支持.这种特殊字符，过滤掉
		idfortpl = item.opttypeid.toString().replace(/\D+/g, '');
		html = options.issub 
					? er.template.get('aoPkgAbsItem' + idfortpl + 'Sub')
					: er.template.get('aoPkgAbsItem' + idfortpl);

		// 找出要替换的部分
		var replaceMap = {}, regex = /%(\w+?)\b/g,  match, key;
		while (match = regex.exec(html)) {
			key = match[1];
			if (!replaceMap[key]) {
				replaceMap[key] = 1;
			}
		}

		// 进行替换，key相当于模版里的'%' + key
		var replaceRegex = me.options.replaceRegex, replacement;
		for (var key in replaceMap) {
			regex = new RegExp('%' + key, 'g');

			// 如果配置了替换规则
			if (typeof replaceRegex !== 'undefined') {
				replacement = replaceRegex[key];
				replacement = typeof replacement === 'function' ? replacement(item) : replacement;

				// 如果配的数据有问题，直接当作没配过
				replacement = replacement || data[key];
			} else {
				// 没有配置，key作为字段名取值
				replacement = data[key];
			}
			if (replacement) {
				html = html.replace(regex, replacement);
			}
		}

		html = html.replace(/%aoPackageOptRank/g, me.options.hasRank ? rankhtml : '');

		return html;
	},

	/**
	 * 获取某条优化建议的展现信息，例如有更新、部分优化等
	 */
	getPlusHtml : function(item, options){
		var me = this,
			appId = me.appId,
			opttypeid,
			data = item.data,
			compData = item.compData,
			options = options || {
				timeout : false
			},
			// Added by Wu Huiyao: Fix timeoutmsg undefined bug
			timeoutmsg = nirvana.aoPkgConfig.MSG.TIMEOUT[me.options.level.toUpperCase()],
			html = '';

		// 有更新标记
		if(data.isnew == 'true'){
            // 修改突降包显示更新标记的特殊逻辑 modified by Huiyao 2013.1.15
            var className = options.issub
                && !(me.options.hasRank || me.options.forceNoExtend)
                ? ' hide' : '';
			html += '<span class="aopkg_updated' +  className + '">有更新</span>';
		}

		// 增加超时标记
		if(options.timeout){
			html += '<span class="aopkg_meta aopkg_timeout" title="' + timeoutmsg + '">超时</span>';
		}

		// 增加已部分更新标记
		if(options.modified){
			html += '<span class="aopkg_modified">已部分优化</span>';
		}

		// 展开收起
		if(options.extendable && !options.issub){
			if(options.extendedByDefault){
				html += '<a class="aopkg_linkbtn" href="#" action_type="optimizer_foldsub" action_data="' + item.opttypeid + '">- 收起</a>';
			}
			else{
				html += '<a class="aopkg_linkbtn" href="#" action_type="optimizer_unfoldsub" action_data="' + item.opttypeid + '">+ 展开</a>';
			}
		}

		return html;
	},

	/**
	 * 判断是否需要序号，并刷新序号
	 */
	refreshRank : function(){
		var me = this,
			appId = me.appId,
			lists = baidu.q('aopkg_rank', appId + 'AoPkgManagerMain', 'span'),
			len = lists.length,
			i = 0,
			list;
		
		for (; i < len; i++) {
			list = lists[i];
			
			list.innerHTML = i + 1;
			baidu.removeClass(list, 'top5');
			
			// 前3名增加背景
			if (i < 3) {
				baidu.addClass(list, 'top5');
			}
		}
	},

	/**
	 * 事件绑定
	 */
	bindHandlers : function(){
		var me = this,
			appId = me.appId,
			target = baidu.g(appId + 'AoPkgManagerMain');
		baidu.on(target, 'click', me.getClickHandler());
	},

	/**
	 * 范围点击事件监听函数
	 */
	getClickHandler : function(){
		var me = this,
			appId = me.appId,
			dialogBody = baidu.g('ctrldialogAoPkg' + appId + 'Dialogbody');

		return function(e){
			var event = e || window.event,
				target = event.target || event.srcElement,
				p,
				opttypeid, tempid,
				issub,
				cachedata, cache, item, tarr,
				temp,
				dialog,
				logParam,
				subindex,
				checkedlist,
				applybutton;

			// 寻找到祖先节点li
			//p = target.parentNode; // DELETED by Wuhuiyao FIX BUG: 触发的节点本身就是事件代理的元素节点，再取parentNode肯定是错的
			p = target; // Added by Wu Huiyao
			while(p && p.id != appId + 'AoPkgManagerMain'){
				if(p.tagName.toUpperCase() == 'LI'){
					break;
				}
				p = p.parentNode;
			}

			switch(target.className){
				// 续费
				case 'aopkg_link':
					tempid = baidu.dom.getAttr(p, 'action_data');
					me.clickOptLink(tempid);
					break;

				// 进入详情按钮
				case 'aopkg_btn':
					tempid = baidu.dom.getAttr(p, 'action_data');
					me.clickOptButton(tempid);
					break;

				// 全部启用 或者 启用按钮
				case 'aopkg_enable':
					tempid = baidu.dom.getAttr(p, 'action_data');
					
					// 监控
					logParam = {
						'opttypeid' : tempid.replace(/\D\w+/g, '')
					};
					if(me.hasRank){
						var qlist = baidu.q('aopkg_rank', p, 'span');
						if(qlist.length > 0){
							logParam.rank = qlist[0].innerHTML;
						}
					}
					
					logParam.isnew = (baidu.q('aopkg_updated', p, 'span').length > 0 ? 1 : 0);
					
					issub = (tempid.indexOf('_') > -1);

					if(issub){
						tarr = tempid.split('_');
						opttypeid = tarr[0];
						subindex = +tarr[1];
						cache = me.getCache(opttypeid);
						cachedata = cache.compData[subindex];
					}
					else{
						opttypeid = tempid;
						cache = me.getCache(tempid);
						cachedata = cache.data;
					}
					logParam.count = cachedata.count;
					
					nirvana.aoPkgControl.logCenter.extend(logParam)
											   .sendAs('nikon_optitem_quickapply');
					
					// 走一键应用的接口
					me.applyAbsItems([tempid]);
					baidu.event.stop(event);
					
					break;
				// 刷新当前项
				case 'aopkg_refresh_btn':
					tempid = baidu.dom.getAttr(p, 'action_data');
					me.refreshOptItem(tempid);
					//baidu.event.stop(event);
					break;
			};

			switch(baidu.dom.getAttr(target, 'action_type')){
				// 有展开收起的时候，点击主项时的全选行为
				case 'optimizer_listcheck':
					var listcontainer = baidu.g('AoPkgSublist' + baidu.dom.getAttr(target, 'action_data'));
					if(listcontainer){
						var list = baidu.q('aopkg_checkbox', listcontainer, 'input');
						baidu.object.each(list, function(item,i){
							item.checked = target.checked;
						});
					}
					break;
				
				// 子项被点击，可能需要取消或者选中主项的checkbox
				case 'optimizer_subitemcheck':
					var iddata = baidu.dom.getAttr(target, 'action_data');
					var listcontainer = baidu.g('AoPkgSublist' + iddata);
					if(listcontainer){
						var list = baidu.q('aopkg_checkbox', listcontainer, 'input');
						var isAllChecked = true;
						baidu.object.each(list, function(item, i){
							if(!item.checked){
								isAllChecked = false;
							}
						});
						var parentCheckbox = baidu.g('AoPackageOptimizerCheckbox' + iddata);
						parentCheckbox.checked = isAllChecked;
					}
					break;
				
				// 收起
				case 'optimizer_foldsub':
					opttypeid = baidu.dom.getAttr(target, 'action_data');
					me.foldSubList(opttypeid);
					baidu.event.stop(event);
					break;
				// 展开
				case 'optimizer_unfoldsub':
					opttypeid = baidu.dom.getAttr(target, 'action_data');
					me.unfoldSubList(opttypeid);
					baidu.event.stop(event); 
					break;
			}

			checkedlist = me.getCheckedItemIds();
			applybutton = ui.util.get(appId + 'AoPkgApplyAllBtn');
			if(checkedlist.length === 0){
				if(applybutton && !applybutton.state.disabled){
					applybutton.disable(true);
				}
			}
			else{
				if(applybutton && applybutton.state.disabled){
					applybutton.disable(false);
				}
			}

			return false;
		};
	},

	getCheckedItemIds : function(){
		var me = this,
			mainDom = me.mainDom,
			list = baidu.q('aopkg_checkbox', me.mainDom, 'input'),
			opttypeids = [];

		baidu.object.each(list, function(item,i){
			var action_type = baidu.dom.getAttr(item, 'action_type');
			var action_data = baidu.dom.getAttr(item, 'action_data');
			var index = baidu.dom.getAttr(item, 'sub_index');
			if(item.checked){
				if(action_type == 'optimizer_itemcheck'){
					opttypeids.push(action_data);
				}
				else if(action_type == 'optimizer_subitemcheck'){
					opttypeids.push(action_data + '_' + index);
				}
			}
		});
		return opttypeids;
	},

	/**
	 * 应用全部
	 */
	getApplyAllCheckedHandler : function(){
		var me = this,
			appId = me.appId;
		
		return function(e){
//			var list = baidu.q('aopkg_checkbox', me.mainDom, 'input'),
//				opttypeids,
//				action_type,
//				action_data,
//				index,
//				logParam, logIdArr, i,
//				cache, cachedata, tarr; // 没用到变量 del by huiyao 2013.1.23
			
			var opttypeids = me.getCheckedItemIds();
			
			if(opttypeids.length > 0){								
				ui.Dialog.confirm({
					title: '确认',
					content: me.getApplyAllConfirmMsg(),
					onok: function(){
						nirvana.util.loading.initWithBlackMask();
						
						// 监控，一键应用监控
						nirvana.AoPkgMonitor.applySelOptimizeItems(me, opttypeids);
						// Deleted by Wu Huiyao
						/*logIdArr = [];
						for(i = 0; i < opttypeids.length; i++){
							tempid = opttypeids[i].replace(/\_\w+/g, '');
							logIdArr.push(tempid);
						}

						logIdArr = baidu.array.unique(logIdArr);
						
						logParam = {
							opttypeid : logIdArr.join(),
							count : logIdArr.length
						};
						nirvana.aoPkgControl.logCenter.extend(logParam)
													  .sendAs('nikon_optitem_applyall');*/
												
						me.applyAbsItems(opttypeids);
					}
				})
			}
		}
	},

	getApplyAllConfirmMsg : function(){
		var me = this;
		return me.options.applyConfirmMessage;
	},

	/**
	 * 点击优化建议中的链接 .aopkg_link 响应处理函数
	 * @param {String} optid 所在项的optid即idstr 有可能是303.1_1这种 
	 */
	clickOptLink : function(optid){
		var me = this,
			li = baidu.g('AoPkgAbsItem' + optid),
			logParam;

		if(!optid){
			return;
		}
		// 监控
		logParam = {
			'opttypeid' : optid.replace(/\D\w+/g, '')
		};
		if(me.hasRank){
			var qlist = baidu.q('aopkg_rank', li, 'span'),
				rank;
			if(qlist.length > 0){
				rank = qlist[0].innerHTML;
			}
			logParam.rank = rank;
		}		
		
		nirvana.aoPkgControl.logCenter.extend(logParam)
									  .sendAs('nikon_optitem_viewdetail');
		
		// 删除有更新标记
		me.removeUpdatedInfo(optid);
	},

	/**
	 * 点击优化建议中的按钮 .aopkg_btn 响应处理函数
	 * @param {String} optid 所在项的optid即idstr 有可能是303.1_1这种 
	 */
	clickOptButton : function(optid){
		// Deleted by Wuhuiyao
		/*var me = this,
			li = baidu.g('AoPkgAbsItem' + optid),
			logParam,
			tarr, issub,
			opttypeid, subindex,
			cache, cachedata;

		if(!optid){
			return;
		}

		issub = (optid.indexOf('_') > -1);

		if(issub){
			tarr = optid.split('_');
			opttypeid = tarr[0];
			subindex = +tarr[1];
			cache = me.getCache(opttypeid);
			cachedata = cache.compData[subindex];
		}
		else{
			opttypeid = optid;
			cache = me.getCache(optid);
			cachedata = cache.data;
		}

		// 监控
		logParam = {
			'opttypeid' : optid.replace(/\D\w+/g, '')
		};
		if(me.hasRank){
			var qlist = baidu.q('aopkg_rank', li, 'span'),
				rank;
			if(qlist.length > 0){
				rank = qlist[0].innerHTML;
			}
			logParam.rank = rank;
		}
		logParam.isnew = (baidu.q('aopkg_updated', li, 'span').length > 0 ? 1 : 0);
		logParam.optmd5 = cache.optmd5;
		nirvana.aoPkgControl.logCenter.extend(logParam)
									  .sendAs('nikon_optitem_viewdetail');

		me.switchToDetail(optid);*/
		
		// Added by Wu Huiyao
		var itemData = this.getOptimizeItemData(optid);
		if (null == itemData) {
			return;
		}
        // 发送查看详情监控
        nirvana.AoPkgMonitor.viewOptimizeDetail(optid, itemData.opttypeid, this.hasRank, itemData.data, itemData.details);
        // 执行查看详情动作
		this.viewDetail(optid, itemData.opttypeid, itemData.details, itemData.data);
	},
	/**
	 * 根据前端使用的optid获取该优化项相关的一些数据
	 * @method  getOptimizeItemData
	 * @param {String} optid optid可能等于opttypeid，也可能为202_0,303.1_0
	 * @return {Object} 优化项的数据，具体数据结构定义如下：
	 * {
	 *      opttypeid: [Number]  优化项的类型ID，不包括_x，.x这种后缀，对于子项的优化
	 *                           项类型ID都是一样的
	 * 		data:      [Object]  当前优化项的数据，只是该优化项的数据不包括任何其它任
	 *                           何附加信息比如是否有问题等
	 *      details:   [Object]  包含更多优化相关的数据，data包含在details里面，
	 *                           比如hasproblem，opttypeid,如果当前的优化项
	 *                           是一个子项，details里包含了所有子项的优化数据，通过
	 *                           compData可以获取到
	 *      isSub:     [boolean] 当前优化项是否是一个大的优化项分组下的一个子优化
	 * }
	 * @author Wu Huiyao
	 */
	getOptimizeItemData: function(optid) {
		if(!optid){
			return null;
		}
		
		var arr = optid.split('_'),
		    // 初始化真正后端返回的opttypeid
		    opttypeid = optid.replace(/\D\w+/g, ''),
			cache,
			data;
			
		if(arr.length > 1){
			// 由于前端把一些opttype拆成多个opttype来用，可能存在303.1_0这种情况，
			// 因此不能直接拿303来获取cache数据，必须为303.1
			cache = this.getCache(arr[0]);
			// 存在子优化建议的优化建议项，其optid类似于202_0,202_1,...
			// 子优化建议摘要数据初始化
			data = cache.compData[+arr[1]];
		} else{
			cache = this.getCache(optid);
			data = cache.data;
		}

        // 将分组优化项的optmd5筛到data里，免得为了获取所在优化项组的optmd5得多传一个cache
        // 造成参数的困惑 add by Huiyao 2013.4.1
        data.groupOptmd5 = cache.optmd5;
		
		return {
			data : data,
			details : cache,
			opttypeid : +opttypeid,
            isSub: arr.length > 1 // 是否是子优化项
		};
	},
    /**
	 * 查看优化建议的查看详情 
	 * @method viewDetail
	 * @param {String} optid 优化建议项ID字符串，前端做过处理，可能被加上后缀，用于标识子优化建议项，比如303.1_1 
	 * @param {Number} opttypeid 后端返回的真实的优化建议ID
	 * @param {Object} cache 优化建议缓存的数据，包含更多的其它数据
	 * @param {Object} data 优化建议的数据，只是当前查看的优化项的数据
	 * @author wuhuiyao
	 */
	viewDetail: function(optid, opttypeid, cache, data) {
//		// 发送监控 发送监控方法上移到调用viewDetail位置，避免重写该方法，都得加上这句监控 2013.1.6 by Huiyao
//		nirvana.AoPkgMonitor.viewOptimizeDetail(optid, opttypeid, this.hasRank, data, cache);
		// 默认通过滑动方式查看详情
		this.switchToDetail(optid);
	},
	/**
	 * 添加优化项修改信息
	 * @param {string} modifyOptid 被修改的优化建议项ID字符串，前端做过处理，可能被加上后缀，
	 *                             用于标识子优化建议项，比如303.1_1
     * @param {number} modifyOpttypeid 被修改的后端返回的真实的优化建议ID
     * @param {string} planId 所修改的优化建议所属的计划ID,可选
	 * @author wuhuiyao
     * @date 2013.3.25
	 */
	addOptItemModInfo: function(modifyOptid, modifyOpttypeid, planId) {
		var modifiedItem = this.data.get('modifiedItem') || [];

		if (planId) {
			modifiedItem.push(modifyOpttypeid + '_' + planId);
		} else {
			modifiedItem.push(modifyOptid.toString());
		}

		this.data.set('modifiedItem', modifiedItem);
	},

	/**
	 * 收起可展开的子项列表
	 * @param {String} optid 所在项的optid即idstr 有可能是303.1_1这种 
	 */
	foldSubList : function(optid){
		var me = this,
			appId = me.appId,
			opttypeid = optid,
			dialogBody = baidu.g('ctrldialogAoPkg' + appId + 'Dialogbody'),
			li, tlist;

		baidu.addClass('AoPkgSublist' + opttypeid, 'hide');
		if(baidu.browser.ie == 7){
			baidu.addClass(dialogBody, 'ui_dialog_noscrollbody');
			baidu.removeClass(dialogBody, 'ui_dialog_noscrollbody');
		}

		li = baidu.g('AoPkgAbsItem' + opttypeid);
		tlist = baidu.q('aopkg_linkbtn', li, 'a');
		baidu.array.each(tlist, function(item, i){
			baidu.setAttr(item, 'action_type', 'optimizer_unfoldsub');
			item.innerHTML = '+ 展开';
		});
	},
	/**
	 * 展开可展开的子项列表
	 *
	 * @param {String} optid 所在项的optid即idstr 有可能是303.1_1这种 
	 */
	unfoldSubList : function(optid){
		var me = this,
			appId = me.appId,
			opttypeid = optid,
			dialogBody = baidu.g('ctrldialogAoPkg' + appId + 'Dialogbody'),
			li, tlist;

		baidu.removeClass('AoPkgSublist' + opttypeid, 'hide');
		if(baidu.browser.ie == 7){
			baidu.addClass(dialogBody, 'ui_dialog_noscrollbody');
			baidu.removeClass(dialogBody, 'ui_dialog_noscrollbody');
		}
		li = baidu.g('AoPkgAbsItem' + opttypeid);
		tlist = baidu.q('aopkg_linkbtn', li, 'a');
		baidu.array.each(tlist, function(item, i){
			baidu.setAttr(item, 'action_type', 'optimizer_foldsub');
			item.innerHTML = '- 收起';
		});
	},

    /**
     * 升级后的详情处理逻辑，等所有优化包都替换成新的升级详情代码，后面的switchToDetail相关
     * 代码就可以删掉
     * @author wuhuiyao
     * @date 2013-3-19
     */
    switchToDetail2: function(optid, opttypeid, cache, data) {
        var me = this;
        if (!me.detailCtrl) {
            me.detailCtrl = new nirvana.aoPkgControl.AoPkgDetailCtrl();
            var detailDom = baidu.g(me.appId + 'AoPkgDetailContainer');
            me.detailCtrl.init(me, detailDom);
        }

        var viewConf = me.detailConf && me.detailConf[opttypeid];
        var detailView = nirvana.aoPkgControl.viewUtil.getDetailView(me,
            opttypeid, data, viewConf);
        me.detailCtrl.show(optid, opttypeid, detailView);
    },

	/**
	 * 切换至详情
	 *
	 * @param {String} optid 所在项的optid即idstr 有可能是303.1_1这种 
	 */
	switchToDetail : function(optid){
		var me = this,
			appId = me.appId,
			opttypeid,
			dialogBody = baidu.g('ctrldialogAoPkg' + appId + 'Dialogbody'),
			dialogFoot = baidu.g('ctrldialogAoPkg' + appId + 'Dialogfoot'),
			mainDom = baidu.g(appId + 'AoPkgContainer'),
			detailDom = me.detailDom,
			// detailhtml = er.template.get('aoPkgDetail'),
			issub,
			cache,
			cachedata,
			subindex,
			tarr;

		if(!optid){
			return;
		}
		issub = (optid.indexOf('_') > -1);

		if(issub){
			tarr = optid.split('_');
			opttypeid = tarr[0];
			subindex = +tarr[1];
			cache = me.getCache(opttypeid);
			cachedata = cache.compData[subindex];
		}
		else{
			opttypeid = optid;
			cache = me.getCache(optid);
			cachedata = cache.data;
		}

		var subAction_idstr = opttypeid.replace(/\D\w+/g, ''),
			subAction_params;

		if(mainDom){
			baidu.addClass(dialogBody, 'ui_dialog_noscrollbody');
			baidu.setStyle(dialogBody, 'bottom', 0);
			baidu.show(detailDom);
						
			baidu.setStyle(detailDom, 'top', dialogBody.scrollTop);
			
			baidu.hide(dialogFoot);
			
			subAction_params = {
				pkgid : me.pkgid,
				appId : me.appId,
				opttypeid : subAction_idstr,
				level : me.options.level,
				optmd5: cache.optmd5,
				params : cachedata
			};

			if(issub){
				subAction_params.suboptmd5 = cachedata.optmd5;
			}

			baidu.fx.moveBy(mainDom, {
				x: -mainDom.offsetWidth / 2,
				//x: -985,
				y: 0
			},
			{
				duration : 400,
				interval : 12,
				onafterfinish : function(){
					
					// detailDom.innerHTML = detailhtml;

					var path = 'aoPkg/widget' + subAction_idstr;
					var domId = me.detailDom.id;
					var openresult = me.openSubActionForDetail(domId, path, subAction_params, optid);
					
					if(openresult){
						me.removeUpdatedInfo(optid);
					}
					else{
						/*
						var showinfo = {
							title : '子项配置出错，请检查配置',
							content : '无法加载子Action, opttypeid = ' + subAction_idstr + '！'
									  + '<br />请求path：aoPkg/widget' + subAction_idstr
									  + '<br />请求action：nirvana.aoPkgControl.widget' + subAction_idstr,
							onok : function(){
								me.switchToOverview();
							}
						};
						for(var o in cacheParam){
							showinfo.content += '<br />请求参数：' + o + ' = ' + cacheParam[o];
						}
						ui.Dialog.alert(showinfo);
						*/
						
					}
					// fire resize
					baidu.event.fire(window, 'resize');
				}
			});
			
			var app = nirvana.aoPkgControl.packageData.get(nirvana.aoPkgConfig.KEYMAP[me.pkgid]);
			app.currView = 'detail';
		}
	},

	/**
	 * 打开子Action 
	 * @param {String} optid 所在项的optid即idstr 有可能是303.1_1这种 
	 */
	openSubActionForDetail : function(domId, path, params, optid){
		var me = this;
		// 加载widget的子Action
		var subAction = er.controller.loadSub(
			domId,
			er.controller.getActionConfigByPath(path),
			params
		);
		var modifiedItem = me.data.get('modifiedItem') || [];
		
		if(subAction){
			subAction.onclose = function(){
				if(subAction.getContext('isModified')){
					modifiedItem.push(optid.toString());
					me.data.set('modifiedItem', modifiedItem);
				}
				if(subAction.getContext('hasInlineRecmModified')){
					ui.Dialog.confirm({
						title: '确认',
						content: '您已经进行了行内修改，需要勾选并点击“' + subAction.getContext('widget_btn') + '”按钮才能生效。<br />确认返回上一级？',
						onok: function(){
							me.onDetailSubActionClose && me.onDetailSubActionClose(subAction);
							me.switchToOverview(optid);
						}
					});
				}
				else{
					me.onDetailSubActionClose && me.onDetailSubActionClose(subAction);
					me.switchToOverview(optid);
				}
			};
			
			/**
			 * 子action刷新
			 */
			subAction.refreshSelf = function(statemap){
				if (statemap) {
					for (var item in statemap) {
						params[item] = statemap[item];
					}
				}
				
				// 这里需要析构子Action，然后打开新的子action
				er.controller.unloadSub(subAction);
				
				// 重新载入subaction
				me.openSubActionForDetail(domId, path, params, optid);
			}
			
			me.data.set('subAction', subAction);
			return true;
		}
		else{
			return false;
		}
	},

	/**
	 * 切换至摘要页 
	 * 
	 * @param {String} optid 所在项的optid即idstr 有可能是303.1_1这种 
	 */
	switchToOverview : function(optid){
		var me = this,
			appId = me.appId,
			mainDom = baidu.g(appId + 'AoPkgContainer'),
			detailDom = me.detailDom,
			containerDom = me.containerDom,
			dialogBody = baidu.g('ctrldialogAoPkg' + appId + 'Dialogbody'),
			dialogFoot = baidu.g('ctrldialogAoPkg' + appId + 'Dialogfoot');
		
		nirvana.aoPkgControl.logCenter.extend({
										  opttypeid : optid.replace(/\D\w+/g, '')
									  })
									  .sendAs('nikon_optitem_switch2overview');

		if(mainDom){
			
			var subAction = me.data.get('subAction'),
				needrefresh = !!subAction.getContext('isModified');
			
			//析构子Action
			if(subAction){
				er.controller.unloadSub(subAction);
			}
			
			me.data.remove('subAction');

			detailDom.innerHTML = '';
			baidu.hide(detailDom);
			
			baidu.fx.moveBy(mainDom, {
					x: -(baidu.dom.getStyle(mainDom, 'left').replace(/px/g, '')),
					//x: 985,
					y: 0
				},
				{
					duration : 400,
					interval : 12,
					onafterfinish : function(){
						baidu.setStyle(dialogBody, 'bottom', 42);
						baidu.removeClass(dialogBody, 'ui_dialog_noscrollbody');
						baidu.show(dialogFoot);
						if (needrefresh){
							// 这里临时先加一个判断，505为搜索时，不刷新摘要项
							// wanghuijun
							// 等克淼深度修复
							if (+optid != 505) {
								me.refreshOptItem(optid);
							}
						}
					}
				}
			);
			var app = nirvana.aoPkgControl.packageData.get(nirvana.aoPkgConfig.KEYMAP[me.pkgid]);
			app.currView = 'overview';
		}
	},

	/**
	 * 删除有更新的信息
	 * @param {String} optid 所在项的optid即idstr 有可能是303.1_1这种 
	 */
	removeUpdatedInfo : function(optid){
		var me = this,
			appId = me.appId,
			opttypeid = optid.toString(),
			pid;
		// 删除掉本条的已更新信息
		var li = baidu.g('AoPkgAbsItem' + opttypeid);
		if(!li){
			return;
		}
		var spans = baidu.q('aopkg_updated', li, 'span');
		baidu.array.each(spans, function(item, i){
			baidu.dom.remove(item);
		});
		
		// 直接干掉父项的有更新
		if(opttypeid.indexOf('_') > -1){
			pid = opttypeid.substring(0, opttypeid.indexOf('_'));
			var tlist = baidu.q('aopkg_updated', baidu.g('AoPkgAbsItem' + pid), 'span');
			baidu.array.each(tlist, function(item, i){
				baidu.dom.remove(item);
			});
		}
	},

	/**
	 * 刷新某条优化项
	 * 具体形式：首先显示loading，然后发送请求检查此项
	 * 如果OK，则隐藏，否则展现最新的状况 
	 * @param {String} optid 要检查的optid 即idstr 有可能是303.1_1这种 
	 */
	refreshOptItem : function(optid){
		var me = this,
			appId = me.appId,
			opttypeid,
			issub,
			tarr, subindex,
			cache, cachedata,
			target,
			param;
		
		if('undefined' == typeof optid){
			return;
		}

		issub = (optid.indexOf('_') > -1);

		if(issub){
			tarr = optid.split('_');
			opttypeid = tarr[0];
			subindex = +tarr[1];
			cache = me.getCache(opttypeid);
			cachedata = cache.compData[subindex];
		}
		else{
			opttypeid = optid;
			cache = me.getCache(optid);
			cachedata = cache.data;
		}

		target = me.getRefreshTarget(optid);
		var tempid = opttypeid.replace(/\D\w+/g, ''); // 为了避免303.1这种东西，需要搞成整数
		target && (target.innerHTML = '<span class="aopkg_optitem_loading">' + me.options.refreshWord[tempid] + '</span><img src="./asset/img/loading_ao.gif" />');
		baidu.setAttr(target, 'id', opttypeid + 'loading');
		
		// 请求此项的最新状态
		param = {
			pkgids : [me.pkgid],
			absreqitems : [
				{
					opttypeid : optid.replace(/\D\w+/g, '')
				}
			],
			command : 'start',
			level : me.options.level
		};
		
		// 特殊逻辑，为了监控需要，在展现详情时，认为一次展现就是一个动作
        nirvana.aoPkgControl.logCenter.actionStepPlus1();
		param.condition = param.condition || {};
		param.condition.pkgContext = nirvana.aoPkgControl.logCenter.pkgContext;
        param.condition.actionStep = nirvana.aoPkgControl.logCenter.actionStep;
        param.condition.roundId = 1;

        me.data.set('refreshRoundId', 1);
		
		param.onSuccess = me.refreshAbsItemSuccess(optid, opttypeid + 'loading');
	
		param.onFail = function(response) {
			ajaxFailDialog();
		};
		
		// 获取优化摘要
		fbs.nikon.getPackageAbstract(param);
	},

	/**
	 * 获取刷新行为要处理的目标Dom元素
	 *
	 * @param {String} optid 要检查的optid 即idstr 有可能是303.1_1这种 
	 */
	getRefreshTarget : function(optid){
		var me = this,
			appId = me.appId,
			opttypeid,
			issub,
			tarr, subindex,
			cache, cachedata,
			target,
			i, l;
		
		if('undefined' == typeof optid){
			return;
		}

		issub = (optid.indexOf('_') > -1);

		if(issub){
			tarr = optid.split('_');
			opttypeid = tarr[0];
			subindex = +tarr[1];
			cache = me.getCache(opttypeid);
			cachedata = cache.compData[subindex];
		}
		else{
			opttypeid = optid;
			cache = me.getCache(optid);
			cachedata = cache.data;
		}

		if(me.isExtendable(opttypeid)){
			if(me.options.hasRank || me.options.forceNoExtend){
				// 如果有序号，那么没有父容器元素，则去获取列表第一个元素，将其置为刷新状态，将其余子元素删除
				target = baidu.g('AoPkgAbsItem' + opttypeid + '_0')
				// 删除第一个子元素之后的子元素
				for(i = 1, l = cache.compData.length; i < l; i++){
					baidu.dom.remove('AoPkgAbsItem' + opttypeid + '_' + i);
				}
			}
			else{
				// 直接使用父容器元素，删除子列表
				target = baidu.g('AoPkgAbsItem' + opttypeid);
				baidu.dom.remove('AoPkgSublist' + opttypeid);
			}
		}
		else{
			target = baidu.g('AoPkgAbsItem' + opttypeid);
		}

		return target;
	},

	/**
	 * 刷新摘要优化项的成功返回处理函数
	 * @param {String|Number} optid 当前请求的optid 即idstr 有可能是303.1_1这种 
	 * @param {String|Number} targetid 当前请求的展现loading的li的opttypeid
	 */
	refreshAbsItemSuccess : function(optid, targetid, oldreqid){
		var me = this,
			appId = me.appId;

		return function(response){
			var data = response.data,
				aostatus = data.aostatus,
				absresitems = data.absresitems,
				reqid = data.reqid,
				status,
				item,
				html = '',
				i, j,
				modifiedItem = me.data.get('modifiedItem') || [],
				displayLogParam = me.data.get('displayedAbsItemLogParam');

			if(oldreqid && oldreqid != reqid){
				return;
			}
			if (aostatus != 0) {
				switch (aostatus) {
					case 3:  // 失败
						break;
					case 100:  // 参数错误
					default:
						ajaxFailDialog(); // 相当于status 500
						break;
				}
				return;
			}
			// 这里只会有一个返回
			if(absresitems && absresitems.length > 0){
				item = absresitems[0];
				status = item.status;
				//判断状态  0 - OK，1 - 计算中，2 - 超时，3 - 错误
				if (status == 1) { //计算中时，将会去走query的轮询
					var param = {
						pkgids : [me.pkgid],
						reqid : reqid,
						absreqitems : [
							{
								opttypeid : optid.replace(/\D\w+/g, ''),
								opttime : item.opttime
							}
						],
						command : 'query',
						level : me.options.level
					};
					
					me.getRequestOptions && (param.condition = me.getRequestOptions('refresh'));

					param.onSuccess = me.refreshAbsItemSuccess(optid, targetid, reqid);
				
					param.onFail = function(response) {
						ajaxFailDialog();
					};

					param.condition = param.condition || {};
					param.condition.pkgContext = nirvana.aoPkgControl.logCenter.pkgContext;
			        param.condition.actionStep = nirvana.aoPkgControl.logCenter.actionStep;

			        var roundId = me.data.get('refreshRoundId');
			        roundId += 1;
			        me.data.set('refreshRoundId', roundId);

			        param.condition.globalId = item.data.globalId;
			        param.condition.roundId = roundId;

					// 获取优化摘要
					setTimeout(function(){
						fbs.nikon.getPackageAbstract(param);
					}, nirvana.aoPkgConfig.QUERY_INTERVAL);
				}
				else if(status == 0){
					// 如果有拆分数据的需求
					if (typeof me.options.splitData === 'function') {
						me.options.splitData(absresitems);
					}

					absresitems.sort(function(a, b){
						return me.getSortItemsOrder()(a.opttypeid, b.opttypeid);
					});

					for(i = 0; i < absresitems.length; i++){
						// 直接执行渲染处理
						
						var logItemPos = -1;
						for(var j = 0; j < displayLogParam.length; j++){
							if(+displayLogParam[j].opttypeid == +item.opttypeid){
								logItemPos = j;
								break;
							}
						}
						
						item = absresitems[i];
						// 修改缓存
						me.setCache(item.opttypeid, item);

						if(item.status == 0 && item.hasproblem){
							html = me.showOverviewItem(item.opttypeid, {
								refreshing : true
							});
							baidu.dom.insertHTML(baidu.g(targetid), 'beforeBegin', html);
							if(logItemPos > -1){
								displayLogParam[logItemPos] = item;
							}
							else{
								displayLogParam.push(item);
							}
						}
						else if(item.status == 2 && item.hasproblem){
							// 展现该条，以超时的方式		
							html = me.showOverviewItem(item.opttypeid, {
								refreshing : true,
								timeout : true
							});
							baidu.dom.insertHTML(baidu.g(targetid), 'beforeBegin', html);
							if(logItemPos > -1){
								displayLogParam[logItemPos] = item;
							}
							else{
								displayLogParam.push(item);
							}
						}
						else if(item.status == 0 && item.hasproblem == 0){
							if(logItemPos > -1){
								displayLogParam.splice(logItemPos, 1);
							}
						}

						// 如果可以勾选，处理勾选的checkbox
						var checkbox, spans, liitem;
						if(baidu.g('AoPkgSublist' + item.opttypeid)){
							checkbox = baidu.q('aopkg_checkbox', 'AoPkgSublist' + item.opttypeid, 'input');
							baidu.object.each(checkbox, function(item, i){
								item.checked = false;
							});
						}
						checkbox = baidu.q('aopkg_checkbox', 'AoPkgAbsItem' + item.opttypeid, 'input');
						baidu.object.each(checkbox, function(item, i){
							item.checked = false;
						});

						// 判断是否要禁用ApplyAllBtn
						var checkedlist = me.getCheckedItemIds();
						var applybutton = ui.util.get(appId + 'AoPkgApplyAllBtn');
						if(checkedlist.length === 0){
							if(applybutton && !applybutton.state.disabled){
								applybutton.disable(true);
							}
						}

						// 刷新序号
						if(me.options.hasRank){
							me.refreshRank();
						}
					}
					baidu.dom.remove(targetid);
					
					//如果处理之后,没有优化项了,则显示当前没有优化项
					var lis = baidu.q('aopkg_absmainitem', me.mainDom, 'li');
					if(lis.length == 0){
						me.showNoOptimizer();
					}
				}
			}
			// 保存修改过的“已部分修改”的数据
			me.data.set('modifiedItem', modifiedItem);
			var cache = me.getCache();
			var showlist = [];
			for(var o in cache){
				// 刷新时，status=0是计算完成！
				// 应用时，state=2是应用超时，需要重新来一次
				if(cache[o].hasproblem == 1 || cache[o].state == 2){
					showlist.push(baidu.object.clone(cache[o]));
				}
			}
			me.data.set('displayedAbsItemLogParam', displayLogParam);
			nirvana.aoPkgControl.logCenter.processDisplayParam(displayLogParam)
										  .sendAs('nikon_refresh_is_stable');
		};
	},

	/**
	 * 应用某项或者某些项, 此函数适用于应用全部以及单项的应用中
	 * @param optids {Array} optids数组
	 */
	applyAbsItems : function(optids, timeStamp){
		var me = this,
			param = {},
			applyreqitems = [],
			timeStamp = timeStamp || (new Date()).valueOf(),
			cache = me.getCache(),
			item, data,
			opttypeid, index,
			i,
			applyitemidmap = {},
			subdata,
			tarr;

		if(!optids || optids.length == 0){
			if(nirvana.util.loading.isShow){
				nirvana.util.loading.done();
			}
			return;
		}

		me.data.set('modifiedItem', []);

		// 处理传入的opttypeids
		for(i = 0; i < optids.length; i++){
			if(optids[i].indexOf('_') > -1){
				// 说明是子项
				tarr = optids[i].split('_');
				opttypeid = tarr[0];
				index = +tarr[1];

				item = cache[opttypeid];
				subdata = item.compData[index];
				
				applyreqitems.push({
					'opttypeid' : tarr[0],
					'optmd5' : subdata.optmd5,
					'planid' : subdata.planid
				});
				applyitemidmap[opttypeid + '_' + subdata.planid] = optids[i];
			}
			else{
				opttypeid = optids[i];
				item = cache[opttypeid];
				data = item.data;

				applyreqitems.push({
					'opttypeid' : optids[i],
					'optmd5' : item.optmd5
				});
				applyitemidmap[opttypeid] = optids[i];
			}
		}

		me.data.set('timeStamp' + timeStamp, timeStamp);
		me.data.set('applyToken' + timeStamp, '');
		me.data.set('applyreqitems' + timeStamp, applyreqitems);
		me.data.set('applyitemidmap' + timeStamp, applyitemidmap);

		param.applyreqitems = applyreqitems;
		me.getRequestOptions && (param.condition = me.getRequestOptions('apply'));
		
		param.onSuccess = me.getApplyItemsSuccessHandler(timeStamp);

		// 特殊逻辑，为了监控需要，在展现详情时，认为一次展现就是一个动作
        nirvana.aoPkgControl.logCenter.actionStepPlus1();
		param.condition = param.condition || {};
		param.condition.pkgContext = nirvana.aoPkgControl.logCenter.pkgContext;
        param.condition.actionStep = nirvana.aoPkgControl.logCenter.actionStep;
		
		param.onFail = function(response) {
			if(nirvana.util.loading.isShow){
				nirvana.util.loading.done();
			}
			ajaxFailDialog();
		};
		
		fbs.nikon.applyAbsItem(param);
	},

	// 清除应用请求使用的内存数据痕迹
	clearApplyState : function(timeStamp){
		var me = this;
		// 清除reqid
		me.data.remove('applyToken' + timeStamp);
		// 清除applyreqitems
		me.data.remove('applyreqitems' + timeStamp);
		// 清除timeStamp
		me.data.remove('timeStamp' + timeStamp);
		me.data.remove('applyitemidmap' + timeStamp);
	},

	/**
	 * 点击应用全部按钮之后的成功处理函数 
	 */
	getApplyItemsSuccessHandler : function(timeStamp){
		var me = this;
		
		return function(response){
			var data = response.data,
				applyToken = data.applyToken,
				aostatus = data.aostatus;
			
			nirvana.util.loading.initWithBlackMask();
			
			if (aostatus != 0 && aostatus != 1) {
				switch (aostatus) {
					case 100:		// 参数错误
						//me.displayStats();
						break;
					case 3:			//处理失败
					default:
						ajaxFailDialog(); // 相当于status 500
						break;
				}
				me.clearApplyState(timeStamp);
				return;
			}
			
			// 保存reqid
			me.data.set('applyToken' + timeStamp, applyToken);
			
			// 进入轮询处理
			me.processAppliedItems(timeStamp);
		}
	},

	processAppliedItems : function(timeStamp){
		var me = this,
			applyToken = me.data.get('applyToken' + timeStamp),
			applyreqitems = me.data.get('applyreqitems' + timeStamp),
			applyitemidmap = me.data.get('applyitemidmap' + timeStamp),
			param = {};
		
		// 时间戳对不上，不进行处理
		if(timeStamp != me.data.get('timeStamp' + timeStamp)){
			if(nirvana.util.loading.isShow){
				nirvana.util.loading.done();
			}
			me.clearApplyState(timeStamp);
			return;
		}
		
		if(applyreqitems.length == 0){
			me.clearApplyState(timeStamp);
			return;
		}
		
		// 准备请求参数
		param.applyToken = applyToken;
		param.applyreqitems = applyreqitems;
		me.getRequestOptions && (param.condition = me.getRequestOptions('apply'));
		
		param.onSuccess = me.getProcessAppliedItemHandler(timeStamp);
		
		param.onFail = function(response) {
			ajaxFailDialog();
			if(nirvana.util.loading.isShow){
				nirvana.util.loading.done();
			}
		};
		param.condition = param.condition || {};
		param.condition.pkgContext = nirvana.aoPkgControl.logCenter.pkgContext;
        param.condition.actionStep = nirvana.aoPkgControl.logCenter.actionStep;
		
		fbs.nikon.getApplyResult(param);
	},

	/**
	 *  处理请求结果数据，整理下一次轮询请求数据，并处理轮询
	 * @param {Object} timeStamp
	 */
	getProcessAppliedItemHandler : function(timeStamp){
		var me = this,
			appId = me.appId,
			oldapplyToken = me.data.get('applyToken' + timeStamp),
			applyitemidmap = me.data.get('applyitemidmap' + timeStamp),
			applyreqitems = me.data.get('applyreqitems' + timeStamp);
		
		return function(response){
			var data = response.data,
				aostatus = data.aostatus,
				applyToken = data.applyToken,
				applyresitems = data.applyresitems,
				i, l,
				item,
				opttypeid, status,
				targetid,
				tlist,
				mainId, mainItem,
				sublist, subindex,
				item2remove = [],
				displayLogParam = me.data.get('displayedAbsItemLogParam');
			
			nirvana.util.loading.initWithBlackMask();
			
			// 请求id不对应 不处理
			if(oldapplyToken != applyToken){
				me.clearApplyState(timeStamp);
				return;
			}
			
			for(i = 0, l = applyresitems.length; i < l; i++){
				item = applyresitems[i];
				opttypeid = +item.opttypeid;
				targetid = applyitemidmap[item.opttypeid + (item.planid ? ('_' + item.planid) : '')];
				status = item.state;
				
				var logItemPos = -1;
				for(var j = 0; j < displayLogParam.length; j++){
					if(+displayLogParam[j].opttypeid == +item.opttypeid){
						logItemPos = j;
						break;
					}
				}

				// 根据status区分控制
				//判断状态  // 0更新完成；1更新中，2超时；3更新失败；4该优化项已变化，需要重新请求；5更新部分成功
				switch(+status){
					case 1:  // 更新中，需要再发
						break;
					case 0:  // 更新完成，执行后置处理，从请求列表中删除，下次轮询不发此条
						me.itemAppliedOK(targetid);						
						item2remove.push(item.optmd5); // 保存的是md5值，不发这条了！
						if(logItemPos > -1){
							displayLogParam.splice(logItemPos, 1);
						}
						break;
					case 2:  // 超时
						me.itemAppliedTimeout(targetid);
						item2remove.push(item.optmd5); // 保存的是md5值，不发这条了！
						break;
						
					case 3:  // 更新失败
						me.itemAppliedFail(targetid);
						item2remove.push(item.optmd5); // 保存的是md5值
						break;
					case 4:  // 已变化，需要重新请求
						me.itemAppliedButNeedRefresh(targetid);
						item2remove.push(item.optmd5); // 保存的是md5值，不发这条了！
						if(logItemPos > -1){
							displayLogParam.splice(logItemPos, 1);
						}
						break;
					case 5:  // 更新部分成功
						me.itemAppliedPartSucceeded(targetid);
						item2remove.push(item.optmd5); // 保存的是md5值
						if(logItemPos > -1){
							displayLogParam.splice(logItemPos, 1);
						}
						break;
				}
			}
			
			if(item2remove.length > 0){
				for(var i = applyreqitems.length - 1; i >= 0; i--){
					item = applyreqitems[i];
					var pos = baidu.array.indexOf(item2remove, item.optmd5 + '');
					var pos2 = baidu.array.indexOf(item2remove, item.optmd5 - 0);
					if(pos > -1 || pos2 > -1){
						applyreqitems.splice(i, 1);
					}
					
				}
				// 保存请求数据
				me.data.set('applyreqitems' + timeStamp, applyreqitems);
			}
			
			// 整理当前残留的applyreqitems，如果在返回的applyresitems中找不到对应项，是异常情况，清理掉
			
			// 判断是否需要继续轮询
			if(applyreqitems.length > 0){
				me.applyInterval[timeStamp] = setTimeout(function(){
					me.processAppliedItems(timeStamp);
				}, nirvana.aoPkgConfig.QUERY_APPLY_INTERVAL);
				
			}
			else{
				if(nirvana.util.loading.isShow){
					nirvana.util.loading.done();
				}
				me.clearApplyState(timeStamp);

				// 判断是否需要使应用全部按钮不可点击
				var needDisable = true;
				tlist = baidu.q('aopkg_checkbox', appId + 'AoPkgManagerMain', 'input');
				if(tlist.length > 0){
					for(i = 0; i < tlist.length; i++){
						if(tlist[i].disabled == false){
							needDisable = false;
							break;
						}
					}
					if(needDisable){
						me.hasadvice = false;
						//me.onafterRenderOptlist();
						ui.util.get(appId + 'AoPkgApplyAllBtn')
							&& ui.util.get(appId + 'AoPkgApplyAllBtn').disable(true);
					}
				}

				me.data.set('displayedAbsItemLogParam', displayLogParam);
				nirvana.aoPkgControl.logCenter.processDisplayParam(displayLogParam)
											  .sendAs('nikon_refresh_is_stable');
				
			}
			
		}
	},

	/**
	 * 应用某项的成功处理
	 */
	itemAppliedOK : function(targetid){
		var me = this,
			target = baidu.g('AoPkgAbsItem' + targetid),
			issub,
			mainId,
			sublist,
			tlist;

		// 删除有更新标记
		me.removeUpdatedInfo(targetid);

		// 成功处理
		target && baidu.addClass(target, 'aopkg_modfinished');

		// disable checkbox
		tlist = baidu.q('aopkg_checkbox', target, 'input');
		baidu.object.each(tlist, function(item, i){
			item.checked = false;
			item.disabled = true;
		});
		
		// 如果是可展开收起的子项，判断是否需要配置父项为完成
		issub = (targetid.indexOf('_') > -1);
		if(issub){
			mainId = targetid.replace(/\_\w+/g, '');
			if(!me.options.hasRank && !me.options.forceNoExtend){
				sublist = baidu.q('aopkg_modfinished', 'AoPkgSublist' + mainId, 'li');
				if(sublist.length == baidu.g('AoPkgSublist' + mainId).childNodes.length){
					me.itemAppliedOK(mainId);
				}
			}
		}
	},
	/**
	 * 应用某项的超时处理
	 */
	itemAppliedTimeout : function(targetid){
		var me = this,
			data = {
				msg : nirvana.aoPkgConfig.MSG.TIMEOUT[me.options.level.toUpperCase()]
			},
			tpl = er.template.get('aoPkgAbsItemTimeoutInfo'),
			html,
			target = baidu.g('AoPkgAbsItem' + targetid),
			label;

		// 删除有更新标记
		me.removeUpdatedInfo(targetid);

		label = baidu.dom.query('label', target)[0];
		html = lib.tpl.parseTpl(data, tpl);
		
		if(label && baidu.q('aopkg_timeout', label, 'span').length == 0){
			baidu.dom.insertHTML(label, 'beforeEnd', html);
		}
	},
	/**
	 * 应用某项的失败处理
	 */
	itemAppliedFail : function(targetid){
		var me = this,
			data = {
				classname : 'aopkg_fail',
				msg : '应用失败',
				opttypeid : targetid
			},
			tpl = er.template.get('aoPkgAbsItemNeedRefreshInfo'),
			html,
			target = baidu.g('AoPkgAbsItem' + targetid),
			label,
			issub,
			opttypeid,
			mainLiId, subLiId, listId,
			tlist;

		// 删除有更新标记
		me.removeUpdatedInfo(targetid);
		
		label = baidu.dom.query('label', target)[0];
		html = lib.tpl.parseTpl(data, tpl);

		if(label && baidu.q('aopkg_fail', label, 'span').length == 0){
			baidu.dom.insertHTML(label, 'beforeEnd', html);
		}

		baidu.addClass(target, 'aopkg_applyfailed');

		// 准备去清除掉checkbox的list
		tlist = baidu.q('aopkg_checkbox', target, 'input');
		
		issub = (targetid.indexOf('_') > -1);
		// 如果是子项，那么给父项也增加失败标记
		if(issub && !me.options.hasRank && !me.options.forceNoExtend){
			opttypeid = targetid.replace(/\_\w+/g, '');
			mainLiId = 'AoPkgAbsItem' + opttypeid;
			subLiId = 'AoPkgAbsItem' + targetid;
			listId = 'AoPkgSublist' + opttypeid;
			label = baidu.dom.query('label', mainLiId)[0];
			// if(label && baidu.q('aopkg_fail', label, 'span').length == 0){
			// 	baidu.dom.insertHTML(label, 'beforeEnd', html);
			// }
			baidu.addClass(mainLiId, 'aopkg_applyfailed');
			// 准备去清除掉checkbox的list，搞成整体
			tlist = baidu.q('aopkg_checkbox', mainLiId, 'input');
		}
		
		baidu.object.each(tlist, function(item, i){
			item.checked = false;
			item.disabled = true;
		});
	},
	/**
	 * 应用某项的“需要刷新之后再应用”处理
	 */
	itemAppliedButNeedRefresh : function(targetid){
		var me = this,
			data = {
				classname : 'aopkg_needRefresh',
				msg : '本条建议有更新',
				opttypeid : targetid
			},
			tpl = er.template.get('aoPkgAbsItemNeedRefreshInfo'),
			html,
			target = baidu.g('AoPkgAbsItem' + targetid),
			label;

		// 删除有更新标记
		me.removeUpdatedInfo(targetid);
		
		label = baidu.dom.query('label', target)[0];
		html = lib.tpl.parseTpl(data, tpl);

		if(label && baidu.q('aopkg_needRefresh', label, 'span').length == 0){
			baidu.dom.insertHTML(label, 'beforeEnd', html);
		}
	},
	/**
	 * 应用某项的部分成功处理
	 */
	itemAppliedPartSucceeded : function(targetid){
		var me = this,
			data = {
				classname : 'aopkg_needRefresh',
				msg : '部分未成功',
				opttypeid : targetid
			},
			tpl = er.template.get('aoPkgAbsItemNeedRefreshInfo'),
			html,
			target = baidu.g('AoPkgAbsItem' + targetid),
			label,
			issub,
			opttypeid,
			mainLiId, subLiId, listId,
			tlist;

		// 删除有更新标记
		me.removeUpdatedInfo(targetid);
		
		label = baidu.dom.query('label', target)[0];
		html = lib.tpl.parseTpl(data, tpl);

		if(label && baidu.q('aopkg_modified', label, 'span').length == 0){
			baidu.dom.insertHTML(label, 'beforeEnd', '<span class="aopkg_modified">已部分优化</span>' + html);
		}
		else{
			baidu.dom.insertHTML(label, 'beforeEnd', html);
		}
		
		baidu.addClass(target, 'aopkg_partfinished');

		// 准备去清除掉checkbox的list
		tlist = baidu.q('aopkg_checkbox', target, 'input');
		
		issub = (targetid.indexOf('_') > -1);
		// 如果是子项，那么给父项也增加失败标记
		if(issub && !me.options.hasRank && !me.options.forceNoExtend){
			opttypeid = targetid.replace(/\_\w+/g, '');
			mainLiId = 'AoPkgAbsItem' + opttypeid;
			subLiId = 'AoPkgAbsItem' + targetid;
			listId = 'AoPkgSublist' + opttypeid;
			label = baidu.dom.query('label', mainLiId)[0];
			// if(label && baidu.q('aopkg_modified', label, 'span').length == 0){
			// 	baidu.dom.insertHTML(label, 'beforeEnd', '<span class="aopkg_modified">已部分优化</span>' + html);
			// }
			// else{
			// 	baidu.dom.insertHTML(label, 'beforeEnd', html);
			// }
			baidu.addClass(mainLiId, 'aopkg_partfinished');
			// 准备去清除掉checkbox的list，搞成整体
			tlist = baidu.q('aopkg_checkbox', mainLiId, 'input');
		}
		
		baidu.object.each(tlist, function(item, i){
			item.checked = false;
			item.disabled = true;
		});	
	},
    /**
     * 销毁优化项控制器实例
     * @author wuhuiyao
     * @date 2013-03-17
     */
    dispose: function() {
        // 销毁详情控制器，升级后的详情才有 // add by Huiyao 2013.3.18
        if (this.detailCtrl) {
            this.detailCtrl.dispose();
        }
    }
});