/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/aoPkgControl.js 
 * desc: 包框架控制类库 
 * author: LeoWang(wangkemiao@baidu.com)
 * version : 2.0
 * date: $Date: 2012/09/04 $
 */

/**
 * 包控制类库的名字空间 
 */
nirvana.aoPkgControl = nirvana.aoPkgControl || {};

/**
 * @namespace aoPackage 模块
 */
var aoPackage = new er.Module({
    config: {
        'action': [
            // del by Huiyao 2013.3.1 被AddwordDlg.js替换
//            {
//                path: 'aoPackage/addword',
//                action: 'aoPackage.addword'
//            },
//            {// del by Huiyao 2013.3.1 被PlanUnitEditDlg.js替换
//                path: 'aoPackage/inlineEditTarget',
//                action: 'aoPackage.inlineEditTarget'
//            },
            // add by Huiyao 2013.1.7
            {
                path: '/tools/proposal/setPropForAoDecr',
                action: 'ToolsModule.setPropForAoDecr'
            }
        ]
    }
});


/**
 * 自动为子项详情widget注册er路径 
 * 注册一次就可以了
 */
(function(){
	var action = [],
		pathprefix = 'aoPkg/widget',
		actionprefix = 'nirvana.aoPkgControl.widget',
		setting,
		pkg, pkgname, i;
	
	// 从config.js中读取opttypes
	setting = nirvana.aoPkgConfig.SETTING;
	for(pkgname in setting){
		pkg = setting[pkgname];
		if(pkg.optimizer && pkg.optimizer.OPTTYPE){
			var opttypes = [];
			var item;
			// 整理,去除303.1 这
			for(i = 0; i < pkg.optimizer.OPTTYPE.length; i++){
				item = (pkg.optimizer.OPTTYPE[i] + '').replace(/\.\w+/g, '');
				if(baidu.array.indexOf(opttypes, item) == -1){
					opttypes.push(item);
					action.push({
						path : pathprefix + item,
						action : actionprefix + item
					});
				}
			}
		}
	}
	// 批量注册
	nirvana.aoPkgControl.modules = new er.Module({
		config: {
			'action': action
		}
	});
})();

/**
 * @description 用于存储包数据，每打开一个包，都会将其示例存储在packageData中，key值是包的id 
 */
nirvana.aoPkgControl.packageData = {
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


/**
 * @description 打开优化包
 * @param {Num} pkgid 包id
 * @param {Num} entrance 入口类型
 * @param {Object} options 相关的包设置
 */
nirvana.aoPkgControl.openAoPackage = function(pkgid, entrance, options){
	nirvana.aoPkgControl.logCenter.initPkgContext();
	var me = this,
		appName = nirvana.aoPkgConfig.KEYMAP[pkgid],
		app,
		defaultOpt = {
			appName : appName,
			pkgid : pkgid
		};
	
	if('undefined' == typeof pkgid || !appName){
		return false;
	}
	

	nirvana.aoPkgControl.logCenter.setEnterance(entrance)
								  .clear()
								  .extendDefault({
								       pkgid : pkgid
								  })
								  .sendAs('nikon_package_enter');

    // 更新用户打开过优化包次数，用于提醒框升级：后端控制提醒框出现的时长
    // 只对有提醒框的优化包才发送打开次数更新请求，由于打开入口有多处：消息中心、主动提示区，概况页
    // 没法确切指定优化包是否有提醒框，因此只能每次打开都发送。。
    fbs.nikon.addOpenAoPkgTimes({ pkgids: [pkgid] });

	// 如果传入了options，则可能有修改了，不管有没有实例，都重新new一个
	if('undefined' != typeof options && options != null){
		if(me.packageData.get(appName)){
			me.packageData.remove(appName);
		}
		
		baidu.extend(options, defaultOpt);
		var thename = nirvana.aoPkgConfig.CLASSMAP[pkgid];
		app = new nirvana[thename](options);
		me.packageData.set(appName, app);
	}
	else{
		// 检查是否已经有实例
		if(me.packageData.get(appName)){
			app = me.packageData.get(appName);
			app.showPackageDialog();
		}
		else{
			var thename = nirvana.aoPkgConfig.CLASSMAP[pkgid];
			app = new nirvana[thename](defaultOpt);
			me.packageData.set(appName, app);
		}
	}
	return app;
};
// del by Huiyao: 转移到AoPkgMonitor.js
///**
// * 公共监控数据
// * @param {Object} actionName
// * @param {Object} param
// *
// * 快捷方式
// * logCenter('quicksetup_init');					// 进入时初始化的信息的log
// *
// */
//nirvana.aoPkgControl.logCenter = {
//	logParam : {
//		client : 'web'
//	},
//	sendParam : null,
//	displayParam : {},
//	entrance : null,
//	pkgContext : null,
//	actionStep : -1,
//	actionStepPlus1 : function(){
//		// 把actionStep+1
//		this.actionStep++;
//		this.logParam.actionStep++;
//	},
//	initPkgContext : function(){
//		this.pkgContext = (new Date()).valueOf();
//		this.actionStep = -1;
//		this.logParam.pkgContext = this.pkgContext;
//		this.logParam.actionStep = this.actionStep;
//		return this;
//	},
//    // del by huiyao 2013.1.6 没用到的方法
////	initWith : function(target){
////		this.logParam.pkgid = target.pkgid;
////		if(target.pkgid == 1){
////			this.logParam.decrtype = target.optimizerCtrl.decrtype;
////		}
////		return this;
////	},
//	setEnterance : function(value){
//		this.entrance = value;
//		this.logParam.entrance = value;
//		return this;
//	},
//	extendDefault : function(extraParam){
//		baidu.extend(this.logParam, extraParam);
//		return this;
//	},
//	extend : function(extraParam){
//		var temp = baidu.object.clone(this.logParam);
//		baidu.extend(temp, extraParam);
//		this.sendParam = temp;
//		return this;
//	},
//	sendAs : function(target){
//		var param = this.sendParam || baidu.object.clone(this.logParam) || {};
//		param.target = target;
//
//		param.actionStep++;
//		this.actionStepPlus1();
//
//		NIRVANA_LOG.send(param);
//		this.sendParam = null;
//
//		return this;
//	},
//	clear : function(){
//		this.logParam = {
//			client : 'web'
//		};
//		if(this.entrance != null){
//			this.logParam.entrance = this.entrance;
//		}
//		if(this.pkgContext != null){
//			this.logParam.pkgContext = this.pkgContext;
//		}
//		this.logParam.actionStep = this.actionStep;
//		return this;
//	},
//	delKeyFromDefault : function(key){
//		if('undefined' != typeof this.logParam[key]){
//			delete this.logParam[key];
//		}
//		return this;
//	},
//	processDisplayParam : function(displayLogParam){
//		var logParam = {
//			isEmpty : displayLogParam.length == 0,
//			optimizerItems : []
//		};
//		for(var i = 0; i < displayLogParam.length; i++){
//			logParam.optimizerItems.push(displayLogParam[i].opttypeid);
//			switch(+displayLogParam[i].opttypeid){
//				case 101:
//					logParam['opt_101'] = 1;
//					break;
//				case 102:
//				case 201:
//					logParam['opt_' + displayLogParam[i].opttypeid] = displayLogParam[i].data.bgttype;
//					break;
//				case 303.1:
//					logParam['opt_' + displayLogParam[i].opttypeid] = displayLogParam[i].data.word_cnt_1;
//					break;
//				case 303.2:
//					logParam['opt_' + displayLogParam[i].opttypeid] = displayLogParam[i].data.word_cnt_2;
//					break;
//				default:
//					logParam['opt_' + displayLogParam[i].opttypeid] = displayLogParam[i].data.count;
//					break;
//			}
//		}
//		return this.extend(logParam);
//	}
//};