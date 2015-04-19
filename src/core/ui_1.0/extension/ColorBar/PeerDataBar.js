/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: nirvana/common/PeerDataBar.js
 * desc: 用于行业领先包优化建议详情的同行指标Bar以及账户质量评分的Bar
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/11/6 $
 */
/**
 * 用于行业领先包优化建议详情的同行指标Bar以及账户质量评分的Bar，封装了数据请求功能
 * @class PeerDataBar
 * @namespace nirvana
 */
nirvana.PeerDataBar = function($) {
	/**
	 * 行业包数据指标Bar的构造函数定义
	 * @constructor
	 * @param {Function} requester 请求同行数据的接口
	 * @param {String|Number} token 发送同行数据请求必须携带的参数，同时也用来缓存后端返回的token，以便后端能利用缓存机制
	 * @param {Object} barRenderMap 定义渲染各个Bar的DOM的Map，key的定义见标识各种Bar静态常量定义
	 * 具体定义如下：
	 * {
	 * 		PeerDataBar.OFFLINE_TIME: [HTMLElement] [OPTIONAL], 渲染下线时间的DOM元素
	 *      ...
	 * }
	 * NOTICE: 如果该参数未传或者未null/undefined,调用show方法将不会自动渲染Bar，可以在请求的回调里调用update方法来
	 * 触发Bar的更新渲染。
	 */
	function PeerDataBar(requester, token, barRenderMap) {
		// 初始化请求接口
		this.requester = requester;
		 
	    this.token = token;
	    
		// 缓存创建的Bar实例 
		this.barInstanceMap = {};
		
		// 缓存用于渲染bar的DOM元素
		this.barRenderMap = barRenderMap;
	}
	
	/**
	 * 标识各种Bar静态常量定义，只读 
	 * 同行包只用到1、2、3和5
	 */
	// 标识下线时间Bar的类型ID
	PeerDataBar.OFFLINE_TIME = 1;
	// 标识关键词展现次数Bar的类型ID
	PeerDataBar.WORD_PRESENT = 2;
	// 标识左侧展现概率Bar的类型ID
	PeerDataBar.LEFT_PRESENT = 3;
	// 重点词排名Bar的类型ID
	PeerDataBar.COREWORD_RANK = 4;
	// 标识生效三星词比例Bar的类型ID
	PeerDataBar.EFFECT_QSTAR3 = 5;
	// 网站打开速度Bar的类型ID
	PeerDataBar.SITE_OPEN_RATE = 6;
	// 网站吸引力Bar的类型ID
	PeerDataBar.SITE_ATTRACTIVE = 7;
	
	/**
	 * 各种Bar类型的名称常量定义 
	 */
	PeerDataBar.NAME_MAP  = {};
	PeerDataBar.NAME_MAP[PeerDataBar.OFFLINE_TIME] = '最晚下线时间';
	PeerDataBar.NAME_MAP[PeerDataBar.WORD_PRESENT] = '关键词展现次数';
	PeerDataBar.NAME_MAP[PeerDataBar.LEFT_PRESENT] = '左侧展现概率';
	PeerDataBar.NAME_MAP[PeerDataBar.COREWORD_RANK] = '重点词平均排名';
	PeerDataBar.NAME_MAP[PeerDataBar.EFFECT_QSTAR3] = '生效三星词占比';
	PeerDataBar.NAME_MAP[PeerDataBar.SITE_OPEN_RATE] = '网站打开速度';
	PeerDataBar.NAME_MAP[PeerDataBar.SITE_ATTRACTIVE] = '网站吸引力';

    /**
     * 指标值的后缀定义
     */
    PeerDataBar.SUFFIX_MAP = {};
    PeerDataBar.SUFFIX_MAP[PeerDataBar.LEFT_PRESENT] = '%';
    PeerDataBar.SUFFIX_MAP[PeerDataBar.EFFECT_QSTAR3] = '%';
    /*PeerDataBar.SUFFIX_MAP[PeerDataBar.SITE_OPEN_RATE] = '秒';
    PeerDataBar.SUFFIX_MAP[PeerDataBar.WORD_PRESENT] = '次';
    PeerDataBar.SUFFIX_MAP[PeerDataBar.COREWORD_RANK] = '分';
    PeerDataBar.SUFFIX_MAP[PeerDataBar.SITE_ATTRACTIVE] = '分';*/

	PeerDataBar.prototype = {
		/**
		 * 请求同行指标的数据
		 * @private 
		 */
		requestData: function() {
			var me = this,
			    param = {},
			    bindContext = nirvana.util.bind;
			
			param.onSuccess = bindContext(me.responseSuccessHandler, me);
			param.onFail = bindContext(me.responseFailHandler, me);
			param.condition = {
				token: me.token
			};
			
 	    	// 请求同行数据
			if (typeof me.requester == 'function') {
				/**
				 * 发送请求前触发的事件
				 * @event onBeforeRequest 
				 */
				if (typeof me.onBeforeRequest == 'function') {
					me.onBeforeRequest.call(me);
				}
				me.requester(param);
			}
		},
		/**
		 * 请求数据失败的处理器
		 * @private 
		 */
		responseFailHandler: function(result) {
			var me = this;
			/**
			 * 请求结束响应失败触发的事件
			 * @event onRequestFail
			 * @param {Object} result 响应的数据
			 */
			if (typeof me.onRequestFail == 'function') {
				me.onRequestFail.call(me, result);
			}
		},
		/**
		 * 请求数据成功的处理器
		 * @private 
		 */
		responseSuccessHandler: function(result) {
			var me = this;
			
			// 缓存后端返回的token，以便下次发送请求的时候能够让后端利用缓存功能
			me.token = result.data.token;
			me.barValueArr = result.data.peer_data.value;
			
			if (me.barRenderMap) {
				// 渲染bar
				me.renderBar();
			}
			
			/**
			 * 请求结束响应成功触发的事件
			 * @event onRequestSuccess
			 * @param {Object} result 响应的数据
			 */
			if (typeof me.onRequestSuccess == 'function') {
				me.onRequestSuccess.call(me, result);
			}
		},
		/**
		 * 渲染Bar
		 */
		renderBar: function() {
			var me = this,
			    dataMap = this.getRenderBarValues(me.barRenderMap),
			    barValue,
			    config,
			    dataType,
			    success;
			
			for (var k in dataMap) {
				barValue = dataMap[k];
				dataType = +k;
				
				/**
				 * 渲染Bar结束后触发的事件
				 * @event onAfterRender 
				 * @param {Number} dataType 指标的类型
				 * @param {Boolean} isSuccess 是否数据指标显示正常
				 * @param {Boolean} noData 是否该项指标数据没有返回
				 */
				// 该项指标没返回
				if (!barValue) {
					if (typeof me.onAfterRender == 'function') {
						me.onAfterRender.call(me, dataType, false, true);
					}
					continue;
				}
				
				/**
				 *  getBarConfig接口必须定义实现
				 *  @interface
				 *  @param {Number} dataType bar的类型，见PeerDataBar的Bar类型定义
				 *  @param {Number|undefined|null} userValue 用户当前指标的值
				 *  @param {Array} valueRange 该指标的同行信息：包括四个元素依次为最小值、平均值、良好值、最大值
				 *  @param {Number} topPercent 用户取值在同行所处的top百分比数（不包括百分号）
				 */
				config = me.getBarConfig(dataType, barValue.userValue, barValue.valueRange, barValue.topPercent);
			    // 渲染bar
    			success = me.doRenderBar(dataType, config, me.barRenderMap[k]);
				if (typeof me.onAfterRender == 'function') {
					me.onAfterRender.call(me, k, success);
				}
			}
		},
		/**
		 * 获取要渲染的Bar的数据Map
		 * @method getRenderBarValues
		 * @param {Object} barRenderMap 要渲染的Bar的类型的Map, key为Bar的类型,见PeerDataBar的Bar类型定义
		 * @return {Object} Bar的数据Map, key为Bar的类型
		 */
		getRenderBarValues: function(barRenderMap) {
			var me = this,
			    found,
		        valueArr = me.barValueArr || [],
			    dataMap = {},
			    barValue;
			    
			for (var k in barRenderMap) {
				found = false;
				for (var i = 0, len = valueArr.length; i < len; i++) {
					barValue = valueArr[i];
					if (barValue.data_type == k) {
						dataMap[k] = {
							'valueRange' : [barValue.min_value,
									barValue.avg_value, barValue.good_value,
									barValue.max_value],
							'userValue' : barValue.curr_value,
							'topPercent' : barValue.top_percentage
						};
						found = true;
						break;
					}
				}
				if (!found) {
					dataMap[k] = null;
				}
			}
			
			return dataMap;
		},
		/**
		 * 执行Bar的渲染 
		 * @private
		 * @param {Number} dataType Bar的数据类型
		 * @param {Object} config ColorBar实例创建的配置选项
		 * @param {HTMLElement} elem 渲染Bar所挂载的DOM元素
		 */
		doRenderBar: function(dataType, config, elem) {
			if (!elem || !config) {
				return false;
			}
			
			var barInstanceMap = this.barInstanceMap,
			    colorBar = new ui.ColorBar(config);
			    
			// 渲染bar
    		colorBar.render(elem);
    		// 缓存bar
    		barInstanceMap[dataType] = colorBar;
    		return true;
		},
		/**
		 * 显示同行指标的Bar 
		 * @method show
		 */
		show: function() {
			this.requestData();
		},
		/**
		 * 更新渲染的Bar，该方法用于第一次请求数据结束后调用
		 * @method update
		 * @param {Object} toRenderBarMap 见构造函数说明
		 */
		update: function(toRenderBarMap) {
			// 先销毁现有的
			this.disposeBars();
			// 缓存用于渲染bar的DOM元素
			this.barRenderMap = toRenderBarMap;
			// 渲染Bar
			this.renderBar();
		},
		/**
		 * 获取请求的token 
		 * @return {String|Number} token
		 */
		getRequestToken: function() {
			return this.token;
		},
		/**
		 * 销毁bar实例 
		 * @private
		 */
		disposeBars: function() {
			var barInstanceMap = this.barInstanceMap,
			    barRenderMap = this.barRenderMap;
			
			// 销毁现有的Bar实例
 	    	for (var k in barInstanceMap) {
 	    		barInstanceMap[k] && (barInstanceMap[k].dispose());
 	    		delete barInstanceMap[k];
 	    	}
 	    	
			// 清空缓存的renderMap
 	    	for (var k in barRenderMap) {
 	    		delete barRenderMap[k];
 	    	}
		},
 	    /**
 	     * 销毁实例
 	     * @method dispose 
 	     */
		dispose: function() {
			this.disposeBars();
 	    	this.barValueArr = null;
		}
	};
	
	return PeerDataBar;
}($$);