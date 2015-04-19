/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/industry/IndustryPkgBar.js
 * desc: 行业领先包优化建议详情的同行指标Bar
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/10/29 $
 */
nirvana.aoPkgControl.IndustryPkgBar = function($) {
	// 初始化Bar的助手
	var helper = nirvana.PeerBarHelper.getHelper();
	var PeerDataBar = nirvana.PeerDataBar;
	// 发送同行数据请求必须携带的参数，同时也用来缓存后端返回的token，以便后端能利用缓存机制
	var token = '';
	
	/**
	 * 行业包数据指标Bar的构造函数定义
	 * @constructor
	 * @param {HTMLElement} optMainElem 优化建议摘要的容器元素 
	 */
	function IndustryPkgBar(optMainElem) {
		var renderMap = {};
		
		// 初始化Bar所要渲染的DOM元素
		renderMap[PeerDataBar.OFFLINE_TIME] = $('.offline_time ul', optMainElem)[0];
		renderMap[PeerDataBar.WORD_PRESENT] = $('.word_present ul', optMainElem)[0];
		renderMap[PeerDataBar.LEFT_PRESENT] = $('.left_present ul', optMainElem)[0];
		renderMap[PeerDataBar.EFFECT_QSTAR3] = $('.effective_qstar3 ul', optMainElem)[0];
		
		this.renderMap = renderMap;
		this.peerDataBar = new PeerDataBar(fbs.nikon.getPeerData, token, renderMap);
		
		// 创建Loading元素
		this.loadingMap = {};
		for (var k in renderMap) {
			this.loadingMap[k] = new ui.Loading({"container": renderMap[k], 'asSibling': true});
		}
		
		// 执行初始化工作
		this.init();
	}
	
	IndustryPkgBar.prototype = {
		/**
		 * 初始化
		 * @private 
		 */
		init: function() {
			var me = this,
			    bar = this.peerDataBar,
			    bindContext = nirvana.util.bind;
			
			// 定义发送请求前事件处理
			bar.onBeforeRequest = function() {
				// 显示数据请求加载状态
				me.updateLoadingState(me.loadingMap, true);
			};
			
			// 定义发送请求失败事件处理
			bar.onRequestFail = bindContext(me.responseFailHandler, me);
			// 定义发送请求成功的事件处理
			bar.onRequestSuccess = bindContext(me.responseSuccessHandler, me);
			// 定义获取bar配置的实现
			bar.getBarConfig = bindContext(me.getBarConfig, me);
			// 定义Bar渲染结束后事件处理
			bar.onAfterRender = function(dataType, isSuccess, noData) {
				var renderElem = me.renderMap[dataType];
				// 初始化Bubble
				if (dataType == PeerDataBar.OFFLINE_TIME) {
					renderElem && fc.ui.init(renderElem);
				}
				// 如果失败，显示出错信息
				!isSuccess && (me.showErrorInfo(renderElem));
			};
		},
		/**
		 * 请求数据失败的处理器
		 * @private 
		 */
		responseFailHandler: function(result) {
			var me = this,
			    renderMap = me.renderMap;
			
			// 先提示数据读取异常信息
			ajaxFailDialog();
			// 隐藏数据请求状态
			me.updateLoadingState(me.loadingMap, false);
			// 显示出错信息
			for (var k in renderMap) {
				me.showErrorInfo(renderMap[k]);
			}
		},
		/**
		 * 显示Bar出错的信息
		 * @param {HTMLElement} dom 要显示出错信息的DOM元素
		 * @private 
		 */
		showErrorInfo: function(dom) {
			dom && (dom.innerHTML = er.template.get('peerDataErrorInfo'));
		},
		/**
		 * 请求数据成功的处理器
		 * @private 
		 */
		responseSuccessHandler: function(result) {
			var me = this;
			// 隐藏数据请求状态
			me.updateLoadingState(me.loadingMap, false);
		},
		/**
		 * 获取特定类型指标的Bar的配置，用于ColorBar组件的初始化
		 * @override
		 */
		getBarConfig: function(dataType, userValue, valueRange) {
            var title = PeerDataBar.NAME_MAP[dataType],
                suffix = PeerDataBar.SUFFIX_MAP[dataType],
                isTime = (dataType === PeerDataBar.OFFLINE_TIME) ? true : false;

            if (PeerDataBar.OFFLINE_TIME === dataType) {
                title = title + '<div _ui="id:offTimeBarTitleBubble;type:Bubble;source:industryPkg;" title="' + title + '"></div>';
            }

			return helper.getColorBarConfig(dataType, title, userValue, valueRange, suffix, isTime);
		},
		/**
		 * 显示同行指标的Bar 
		 * @method show
		 */
		show: function() {
			this.peerDataBar.show();
		},
		/**
	     * 显示loading的状态
	     * @method updateLoadingState
	     * @param {Object} loadingWidgetMap 要显示loading状态的Loading控件的Map
	     * @param {Boolean} isLoading 是否显示正在loading状态，true显示loading状态，false隐藏
	     * @pivate 
	     */
		updateLoadingState: function(loadingWidgets, isLoading) {
			for (var k in loadingWidgets) {
				if (isLoading) {
					loadingWidgets[k].show();
				} else {
					loadingWidgets[k].hide();
				}
			}
		},
 	    /**
 	     * 销毁实例
 	     * @method dispose 
 	     */
		dispose: function() {
			var bubble = fc.ui.get('offTimeBarTitleBubble');
			// 销毁Bubble
        	bubble && bubble.dispose(); 
        
 	    	// 销毁loading实例
			var loadingMap = this.loadingMap;
			for (var k in loadingMap) {
				loadingMap[k].dispose();
			}
			
			// 销毁前先缓存用到的token
			token = this.peerDataBar.getRequestToken();
			
			// 销毁同行数据Bar实例
 	    	ui.util.disposeWidgets(this, ['peerDataBar']);
		}
	};
	
	return IndustryPkgBar;
}($$);