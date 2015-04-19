/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/aoPackage.js
 * desc: 包框架类，用于继承
 * author: LeoWang(wangkemiao@baidu.com)
 * version: 2.0
 * date: $Date: 2012/08/28 $
 */

/**
 * 包框架类
 * 目的：作为不同的优化包基础类，用于继承使用
 * 基础类中包含共性功能：
 * 		基础类支持功能列表：
 * 
 *
 * 可选传入参数列表：
 * 		
 * 		属性：
 			1. appName {String} 包名，如果传此参数，则试图在nirvana.aoPkgConfig.SETTING中寻找相应的配置值，nirvana.aoPkgConfig.SETTING[appName]中支持全部的属性，但是也可再传入重定义属性
				1) id {String} 包唯一标识ID
				2) name {String} 包中文名
 				3) description {String} 包中文描述
				4）hasPopup {Boolean} 是否与弹窗相关，即需要刷新弹窗
				5) className {String} 自定义className，作用于整个包的Dialog，默认为aopkg_dialog
				6) display {Object} 显示配置
					buttons : 展现按钮列表
				7) dataArea {Object} 数据区配置，用于新建数据区控制类实例，例如Flash控制的nirvana.aoPkgControl.Flash，具体配置说明见相应类
				8) managerArea {Object} 管理区配置，用于新建管理区控制类实例，例如优化建议nirvana.aoPkgControl.Optimizer，具体配置说明见相应类

		方法介绍：
			renderAppDialog 重新渲染整个包内容，并会重新进行事件绑定
			renderAppAllInfo 重新渲染包内容，但是不会自动进行事件的重新绑定
 	
 		建议子类添加/修改调用方法：
 			renderHeader			渲染头部信息
  			renderDataArea			渲染数据区
			renderManager			渲染管理区
			bindHandlers			自定义事件绑定函数

			hidePackageDialog		如果需要控制关闭行为 如果需要定义自定义关闭函数，可以传入onclose {Function}

		不建议重写列表：
			data
			createPackageDialog
			showPackageDialog
			
			_bindHandlers			不要继承修改，可以传入bindHandlers函数，会自动执行

		默认inject方法列表：
			renderAppAllInfo

 * 
 * 		
 */
nirvana.AoPackage = (function(){
	/**
	 * 包的公共数据存储区
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
		/**
		 * 用于aop劫持的函数名列表
		 * 要求：必须是可以内部直接可以访问到的函数，即使用this.funcName或者this.namespace.funcName
		 *
		 * 劫持结果：会在函数执行的之前、之后分别增加响应函数beforeFuncName和afterFuncName
		 * 注意：劫持之后的响应函数funcName的首字母会被大写
		 */
		listenFunctions : [
			'renderAppAllInfo'
		],

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
		},

		/**
		 * 构造函数
		 * 
		 * @param {Object} opts 实际上是在new AoPackage(opts)这时候传入的，且必须传入
		 */
		init : function(opts){
			var me = this;
			/**
			 * 某些属性实际可以不设，这是为了让其有一个默认值
			 */
			me.defaultClassName = 'aopkg_dialog';
			me.level = 'useracct';		// 层级信息，默认为账户，可以有useracct、planinfo、unitinfo等
			me.currView = 'overview';	// 当前视图，默认是摘要信息

			if(opts){
				// 先尝试去寻找是否使用配置的设置，如果存在，则使用
				if(opts.appName && 'undefined' !== typeof nirvana.aoPkgConfig.SETTING[opts.appName]){
					var settings = baidu.object.clone(nirvana.aoPkgConfig.SETTING[opts.appName]);
					baidu.extend(me, settings);
				}
				// 继续读取传入的配置，如果options和SETTING中有冲突，传入的options参数会覆盖SETTING中的值
				baidu.extend(me, opts);
			}
			me.options = opts;
		
			// 执行前置处理
			me.preProcess();

			//构建自身的controller属性实例
			me.controller = nirvana.aoPkgControl;
			
			if(me.preCheck() === false){
				return;
			}

			me.initAOP();

			me.showPackageDialog();
		},

		initAOP : function(){
			var me = this;
			if(me.listenFunctions && me.listenFunctions.length > 0){
				nirvana.aoUtil.aop.inject(me, me.listenFunctions);
			}
		}
	});
})();


/**
 * prototype扩展，所有项可以被继承重写
 *
 * 不建议重写列表：
 * 		data
 * 		createPackageDialog
 * 		showPackageDialog
 * 		hidePackageDialog		如果需要定义自定义关闭函数，可以传入onclose {Function}
 *		_bindHandlers			不要继承修改，可以传入bindHandlers函数，会自动执行
 */
baidu.extend(nirvana.AoPackage.prototype, {
	/**
	 * @description 包数据控制
	 * @property data
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

	/**
	 * @description 前置处理
	 * @method preProcess
	 * 调用位置：在把options赋值为自身属性之后，首先调用preProcess，然后才去进行接下来的前置检查，aop注入，dialog创建等行为
	 * 用途：可以用于前置性质的处理
	 */
	preProcess : function(){
		// 前置处理
	},

	/**
	 * @description 前置检查函数，必须通过才能继续执行
	 * @method preCheck
	 */
	preCheck : function(){
		var me = this;
		// mod by Huiyao 2013-5-23: 去掉包描述信息强制要求，毕竟有些包并没有这个东东，没必要强制
		if(!me.name ||/*!me.description ||*/ !me.id){
			return false;
		}
		return true;
	},

	//////////////////////////////////////////////////////
	//					基础元素获取函数				//
	//////////////////////////////////////////////////////

	/**
	 * @decription 返回浮出层的Dialog对象
	 * @method getDialog
	 */
	getDialog : function() {
		return this.dialog;
	},

	/**
	 * 返回当前包的唯一标识ID，也是Dialog对象的ID
	 * @method getId 获取包的唯一标识ID
	 */
	getId : function(){
		return this.id;
	},
	
	/**
	 * @description 返回包的某些HTML元素DOM对象，只要存在
	 * @method getDOM
	 * @param {String} key DOM对象的关键词，例如overview, detail
	 *
	 * @return {HtmlElement|Undefine}
	 */
	getDOM : function(key){
		var me = this,
			appId = me.getId();
		if('undefined' == typeof key){
			return baidu.g(appId + 'AoPkgContainer');
		}
		else if('string' == typeof key){
			if(key.length > 0){
				var newKey = key.length > 1 ? 
					(key.charAt(0).toUpperCase() + key.substring(1))
					: key.charAt(0).toUpperCase();
				return baidu.g(appId + 'AoPkg' + newKey)
			}
		}
		return; // return undefined
	},

    /**
     * 在当前浮出层上下文查询给定的选择器的DOM元素
     * @param {string} selector
     * @param {HTMLElement} context 要查询的上下文，未指定，默认在当前浮出层body内部查找
     * @returns {Array}
     */
    $: function (selector, context) {
        var body = context || this.dialog.getBody();
        var result = $$(selector, body);

        var i = 0;
        var foundEleArr = [];
        while (result && result[i]) {
            foundEleArr[i] = result[i];
            ++ i;
        }

        return foundEleArr;
    },

	/**
	 * @description 获取特定位置的HTML代码
	 * @method getHtml
	 * @param {String} 特定位置的名称，例如dialogFoot
	 */
	getHtml : function(name){
		var me = this,
			appId = me.getId(),
			tplData = {
				appID : appId
			},
			tpl,
			html = '';

		if(!name){
			return '';
		}
		switch(name){
			case 'multiSelectBtn':
				tpl = er.template.get('aoPkgFooterApplyAllBtn');
				html = lib.tpl.parseTpl(tplData, tpl);
				break;
			case 'closeBtn':
				tpl = er.template.get('aoPkgFooterCloseBtn');
				html = lib.tpl.parseTpl(tplData, tpl);
				break;
			case 'dialogFoot':
				if(me.display.buttons){
					for(var o in me.display.buttons){
						html += me.getHtml(o);
					}
				}
			break;
		}
		return html;
	},


	/**
	 * @description 渲染包框架的浮出层Dialog，可以被使用来进行整体的包刷新
	 * @method renderAppDialog
	 */
	renderAppDialog : function(){
		var me = this,
			dialog = me.getDialog();
		// 渲染包的全部信息
		me.renderAppAllInfo();

		// 事件绑定
		me._bindHandlers();
	},

	/**
	 * @description 渲染包框架的浮出层Dialog，可以被使用来进行整体的包信息刷新，只是信息刷新，不会区分状态
	 * @method renderAppAllInfo
	 */
	renderAppAllInfo : function(){
		var me = this;
		// 渲染基础信息，包括载入模板文件以及渲染，展现包名，包的简介文字等
		me.renderBasicInfo();
		
		// 渲染头部
		me.renderHeader();

		// 渲染数据区
		me.renderDataArea();
		
		// 渲染管理区
		me.renderManager();
	},

	/**
	 * @description 渲染基础信息，包括载入模板文件以及渲染，展现包名，包的简介文字等
     * @param {?string} contentTpl 对话框内容模板，可选，默认'defaultAoPkgTpl'
     * @param {?string} footTpl 对话框脚步的内容模板，可选，默认根据优化包按钮配置生成
	 * @method renderBasicInfo
	 */
	renderBasicInfo : function(contentTpl, footTpl){
		var me = this,
			dialog = me.getDialog(),
			html,
			appId = me.getId(),
			tplData;
		
		
		dialog.setTitle(me.name);
		
		html = er.template.get(contentTpl || 'defaultAoPkgTpl');
		
		tplData = {
			appID : appId
		};

		html = lib.tpl.parseTpl(tplData, html);

		dialog.setContent(html);

		// 渲染脚部
		var foot = dialog.getFoot();
        // modified by Huiyao 支持foot按钮区域定制 2013.2.18
        var footHtml = footTpl
            ? lib.tpl.parseTpl(tplData, footTpl, true)
            : me.getHtml('dialogFoot');
		foot.innerHTML = footHtml;
		
		// 渲染ui控件
		me.uiObjs = ui.util.init(dialog.getDOM(), me.getUIConfig());
	},
    /**
     * 获取优化包内容的UI初始化的配置，如果子类有定制的UI的配置信息，可以重写该方法
     * @return {Object}
     */
    getUIConfig: function() {
        return null;
    },
	/**
	 * @description 渲染头部位置
	 * @method renderHeader
	 */
	renderHeader : function(){
		var me = this,
			appId = me.getId(),
			target = baidu.g(appId + 'AoPkgOverviewHeader'),
			tpl = '<h1>{appName}</h1>'
				+ '<span class="aopkg_overview_headerdesc">{appDescription}</span>',
			tplData,
			html = '';

		tplData = {
			appName : me.name,
			appDescription : me.description
		};
		html = lib.tpl.parseTpl(tplData, tpl);
		target && (target.innerHTML = html);
	},

	/**
	 * @description 渲染数据区
	 * @method renderDataArea
	 */
	renderDataArea : function(){
		var me = this,
			appId = me.getId(),
			ctrl = me.controller;
		
		// 默认将会展现flash数据区信息，如果不需要，请在子类中修改renderDataArea方法
		me.dataCtrl = new ctrl.AoPkgFlashCtrl(me.pkgid, me.dataArea);
		me.extendDataCtrl && me.extendDataCtrl();
		me.dataCtrl.show();
		//var target = baidu.g(appId + 'PkgDataAreaMain');
		//target.innerHTML = me.name;
	},

	/**
	 * 渲染管理区的信息
	 * @description 渲染管理区信息
	 * @method renderManager
	 */
	renderManager : function(){
		var me = this,
			appId = me.getId(),
			ctrl = me.controller;

		// 渲染标题区
		var titleTar = baidu.g(appId + 'AoPkgManagerTitle');
		titleTar.innerHTML = me.managerArea.managerName;

		// 渲染详细内容
		// 默认将会展现优化建议信息，如果不需要，请在子类中修改renderManager方法
		var newoptions = baidu.object.clone(me.optimizer);
		baidu.extend(newoptions, {
			modifiedItem : me.data.get('modifiedItem'),
			level : me.level
		});
		me.optimizerCtrl = new ctrl.AoPkgOptimizerCtrl(me.pkgid, newoptions);
		me.extendOptimizerCtrl && me.extendOptimizerCtrl(me.pkgid, newoptions);
		me.optimizerCtrl.show();
	},

	/**
	 * @description 事件绑定，不要继承及修改，可以传入bindHandlers，会自动执行
	 * @method _bindHandlers
	 */
	_bindHandlers : function(){
		var me = this,
			appId = me.getId();
		if(ui.util.get(appId + 'AoPkgCloseBtn')){
			ui.util.get(appId + 'AoPkgCloseBtn').onclick = function(){
//				nirvana.aoPkgControl.logCenter.extend({
//					type : 0
//				}).sendAs('nikon_package_close');
                // 通过关闭按钮关闭，原来代码发送监控病没有带入当前所在的视图（摘要/详情），因此
                // 这里参数啥都不传
				me.hidePackageDialog();
			};
		}

		if(ui.util.get(appId + 'AoPkgApplyAllBtn') && me.optimizerCtrl){
			ui.util.get(appId + 'AoPkgApplyAllBtn').onclick = me.optimizerCtrl.getApplyAllCheckedHandler();
		}
		me.bindHandlers && me.bindHandlers();
	},

	/**
	 * @description 清理包的ui控件、正在执行的线程等，用于退出包时
	 * @method clear
	 */
	clear : function(){
		var me = this,
			ctrl = me.controller;
		
		nirvana.util.loadingQuery.hide();

		if(me.setTimestamp){
			me.optimizerCtrl.setTimestamp(null);
			for(var i = 0; i < me.optimizerCtrl.applyInterval.length; i++){
				clearTimeout(me.optimizerCtrl.applyInterval[i]);
			}
		}
		
		// 销毁掉所有的ui控件
		for(var o in me.uiObjs){
			ui.util.dispose(me.uiObjs[o]);
		}
		
		me.dialog = null;
	},


	/**
	 * @description 页面环境缓存清理，用于退出包时
	 * @method clearEnvCache
	 */
	clearEnvCache : function(){
		fbs.material.clearCache('useracct');
		fbs.material.clearCache('planinfo');
		fbs.material.clearCache('unitinfo');
		fbs.material.clearCache('ideainfo');
		fbs.material.clearCache('wordinfo');

		if(location.href.indexOf('#/manage') > -1){
			//清空缓存并刷新账户树
			ui.util.get('SideNav') && ui.util.get('SideNav').refreshPlanList();
		}
		else{
			if(baidu.browser.firefox){
				nirvana.index._flash.reload();
			}
		}
	},

	/**
	 * @description 创建包展现区域的浮出层
	 * @method createPackageDialog
	 */
	createPackageDialog : function(){
		var me = this,
			appId = me.getId();
			
		var options = {
			id : 'AoPkg' + appId + 'Dialog',
			width: 980, // Added by Wu Huiyao FIX: 对话框打开发生闪屏，由于先show再改样式导致
			height: 550, // Added by Wu Huiyao
			title: me.name, // Added by Wu Huiyao FIX: 第一次打开优化包时，标题出现undefined
			dragable : false,
			needMask : true,
			//unresize : true,
			maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel(),
			father: null,
			params : {},
			onclose : function(){
                // 标识关闭 by Huiyao 2013.2.20
                me._isClose = true;
// 为了提供能否关闭的控制，将其转移到hidePackage  del by Huiyao: 2013.2.22
//				me.onclose && me.onclose(); // 新建包实例时传入的onclose

				me.clear();		
							
				// 恢复body的滚动条
				baidu.removeClass(document.documentElement, 'no_scroll_body');
				// 触发一次resize，可以解决有时候纵向滚动条在去除后Mask留白的问题
				//baidu.event.fire(window, 'resize');
				
				me.clearEnvCache();

				if(me.hasPopup){
					ui.Popup.rebuild();
					ui.Popup.isModed = true;
				}

				er.controller.fireMain('reload', {});
			}
		};
		
		var dialog = ui.util.get(options.id);
		dialog && dialog.dispose(); // 存在即销毁

		// 创建dialog
		if(!dialog){
			dialog = ui.util.create('Dialog', options);
		}
		
		// 第一次创建时，isShow设为false，是为了下面的showPackageDialog中能够展现出来
		dialog.isShow = false;		

		me.dialog = dialog;
	},

    /**
     * 优化包是否已经关闭
     */
    isQuit: function() {
        return this._isClose;
    },
    /**
     * 关闭优化包
     * @param {string} currview 执行该操作当前所处的视图：摘要视图还是详情视图,
     *                          overview/detailview，如果没有摘要页视图比如重点词
     *                          包可以不传
     * @param {string} closeByX 标识是否通过对话框右上角的'x'关闭
     */
    closeAoPkg: function(currview, closeByX) {
        var me = this;

        //析构子Action
        var dialog = me.getDialog();
        me.optimizerCtrl && me.optimizerCtrl.dispose(); // add by Huiyao 2013.3.17
        if (me.optimizerCtrl && me.optimizerCtrl.data.get('subAction')){
            er.controller.unloadSub(me.optimizerCtrl.data.get('subAction'));
        }
        // 执行优化包附加销毁操作，子类如果有这个需求可以实现该接口
        me.disposeAoPkg && me.disposeAoPkg();
        dialog.close(closeByX);
    },
	/**
     * 不建议子类重写该方法，可以重写closeAoPkg
	 * @description 隐藏销毁包展现区域的浮出层
	 * @method hidePackageDialog
     * @param {string} currview 执行该操作当前所处的视图：摘要视图还是详情视图,
     *                          overview/detailview，如果没有摘要页视图比如重点词
     *                          包可以不传
     * @param {string} closeByX 标识是否通过对话框右上角的'x'关闭，未传人，默认不是通过关闭
     *                          按钮关闭
     * Modified by Huiyao 2013.2.22
	 */
	hidePackageDialog : function(currview, closeByX){
		var me = this;

        // 关闭优化包事件回调，如果不允许该优化包关闭，return false by Huiyao 2013.2.22
        if (me.onclose && me.onclose(currview, closeByX) === false) {
            return;
        }

        // 发送关闭的监控
        var CLOSE_MODE = nirvana.AoPkgMonitor.CLOSE_MODE;
        var closeMode = closeByX ? CLOSE_MODE.BY_X : CLOSE_MODE.BY_CLOSE_BTN;
        nirvana.AoPkgMonitor.closeAoPkg(currview, closeMode);

        // 执行优化包关闭操作
        me.closeAoPkg(currview, closeByX);
	},

	/**
	 * @description 展现包展现区域的浮出层
	 * @method showPackageDialog
	 */
	showPackageDialog : function(){
		var me = this,
			ctrl = me.controller,
			dialog = me.getDialog();

		me.resetStatus();
        // 标识未关闭 by Huiyao 2013.2.20
        me._isClose = false;

		if(!dialog){
			me.createPackageDialog();
			dialog = me.getDialog();
		}

		
		if(!dialog.isShow){
			// 清除body的滚动条
			baidu.addClass(document.documentElement, 'no_scroll_body');

			dialog.show();

			dialog.getClose().onclick = function(e){
				if(me.currView == 'detail'){
					ui.Dialog.confirm({
						title: '确认',
						content: '您可以通过返回上一级回到优化建议概况页<br />现在的操作将离开此账户优化功能',
						onok: function(dialog){
//							nirvana.aoPkgControl.logCenter.extend({
//								type : 1,
//								view : 'detail'
//							}).sendAs('nikon_package_close');
							//dialog.close('x');
							return me.hidePackageDialog('detail', 'x');
						}
					});
				}
				else{
//					nirvana.aoPkgControl.logCenter.extend({
//						type : 1,
//						view : 'overview'
//					}).sendAs('nikon_package_close');
					//dialog.close('x');
					me.hidePackageDialog('overview', 'x');
				}
			};
			
			// 为对话框添加className
			baidu.addClass(dialog.getDOM(), me.defaultClassName);
			baidu.addClass(dialog.getDOM(), me.className ? me.className : me.defaultClassName);
			me.renderAppDialog();

			// 节日处理
			// nirvana.aoPkgControl.holidayActivity.init('package', me.pkgid);
		}
	},

	resetStatus : function(){
		var me = this;
		me.currView = 'overview';
	}
});


/**
 * 新类声明函数
 */
nirvana.myPackage = function(opts){
	var newPkg = nirvana.aoUtil.extendClass(nirvana.AoPackage, opts);
	return newPkg;
};