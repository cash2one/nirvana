/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: module/accountScore/AccountScoreBar.js 
 * desc: 新的账户质量评分 
 * author: Wu Huiyao (wuhuiyao@baidu.com) 
 * date: $Date: 2012/11/12 $
 */

/**
 * 账户质量评分各个评分Tab下的各个指标的Bar
 */
nirvana.AccountScoreBar = function($, AccountScore, PeerDataBar) {
	// 初始化Bar的助手
	var helper = nirvana.PeerBarHelper.getHelper();
	// 发送同行数据请求必须携带的参数，同时也用来缓存后端返回的token，以便后端能利用缓存机制
	var token = '';
	var isEmpty = nirvana.util.isEmptyValue;
	function AccountScoreBar() {
		this.container = $("#accountScoreTabContainer .score_details")[0];
	}
	
	/**
 	 * 创建账户质量评分具体指标的详情模板
 	 * @private
 	 */
 	function createAccoutQScoreDetailsTPL(barTypeArr, dataMap) {
 		var tpl = "",
 		    tplData,
 		    itemData,
 		    state,
 		    value;
 
 		for (var i = 0, len = barTypeArr.length; i < len; i ++) {
 			itemData = dataMap[barTypeArr[i]] || {};
 			value = itemData.userValue;
 			state = '';
 			// 网站打开时间/网站吸引力的指标值/重点词排名，后端返回值比较特殊需要特殊处理下
 			value = helper.getRealValue(value, barTypeArr[i]);

            if (!isEmpty(value)) {
                if (barTypeArr[i] == PeerDataBar.SITE_OPEN_RATE) {
                    // 网站打开速度指标，当网站打开时间<="良好值"，显示Good
                    state = (value <= itemData.valueRange[2]) ? 'score_up' : 'score_down';
                } else {
                    // 当用户值大于等于同行平均值时，显示Good,一个向上的大拇指
                    state = (value >= itemData.valueRange[1]) ? 'score_up' : 'score_down';
                }
            }

 			tplData = {
 				qscore_item_state: state,
 				qscore_item_name: PeerDataBar.NAME_MAP[barTypeArr[i]],
 				qscore_item_value: getToDisplayUserValue(barTypeArr[i], value)
 			};
 			
 			tpl += lib.tpl.parseTpl(tplData, "accountScoreItemDetail", true);
 		}
 		
 	    // 初始化所有指标项获取失败显示的话术
 		var noPeerDataInfo = fc.common.Factory.createCenterAlign(er.template.get('peerDataErrorInfo'));
 		
 		return !len ? noPeerDataInfo : tpl;
 	};
 	/**
 	 * 根据给定的值的类型以及用户的值，返回用于显示的值 
 	 */
 	function getToDisplayUserValue(dataType, value) {
 		if (isEmpty(value)) {
 			return '-';
 		} 
 		
 		switch (dataType) {
 		    case PeerDataBar.OFFLINE_TIME:
 				return nirvana.date.parseSecondsToTime(value);
			case PeerDataBar.WORD_PRESENT:
				return value + '次';
			case PeerDataBar.LEFT_PRESENT:
			case PeerDataBar.EFFECT_QSTAR3:
				return value + '%';
			case PeerDataBar.COREWORD_RANK:
			case PeerDataBar.SITE_ATTRACTIVE:
				return value + '分';
			case PeerDataBar.SITE_OPEN_RATE:
				return value + '秒';
 		}
 	}
	
	/**
	 * 定个各个评分项下包含的各项指标
	 */
	var SCORE_BAR_MAP = {};
	// 展现环节得分项
	SCORE_BAR_MAP[AccountScore.PRESENT_SCORE] = [PeerDataBar.OFFLINE_TIME,
			PeerDataBar.WORD_PRESENT];
	// 点击环节得分项
	SCORE_BAR_MAP[AccountScore.CLICK_SCORE] = [PeerDataBar.LEFT_PRESENT,
			PeerDataBar.COREWORD_RANK, PeerDataBar.EFFECT_QSTAR3];
	// 浏览与转化环节得分项
	SCORE_BAR_MAP[AccountScore.PV_CONVERSION_SCORE] = [
			PeerDataBar.SITE_OPEN_RATE, PeerDataBar.SITE_ATTRACTIVE];
	// 账户质量得分项
	SCORE_BAR_MAP[AccountScore.ACCOUNT_SCORE] = [].concat(
			SCORE_BAR_MAP[AccountScore.PRESENT_SCORE],
			SCORE_BAR_MAP[AccountScore.CLICK_SCORE],
			SCORE_BAR_MAP[AccountScore.PV_CONVERSION_SCORE]);

    /**
     * 各种Bar类型的描述话术模板定义
     */
    AccountScoreBar.DESCR_TPL_MAP  = {};
    AccountScoreBar.DESCR_TPL_MAP[PeerDataBar.OFFLINE_TIME] = 'offTimeDescr';
    AccountScoreBar.DESCR_TPL_MAP[PeerDataBar.WORD_PRESENT] = 'wordPresentDescr';
    AccountScoreBar.DESCR_TPL_MAP[PeerDataBar.LEFT_PRESENT] = 'leftPresentDescr';
    AccountScoreBar.DESCR_TPL_MAP[PeerDataBar.COREWORD_RANK] = 'corewordRankDescr';
    AccountScoreBar.DESCR_TPL_MAP[PeerDataBar.EFFECT_QSTAR3] = 'effectQStar3Descr';
    AccountScoreBar.DESCR_TPL_MAP[PeerDataBar.SITE_OPEN_RATE] = 'siteOpenRateDescr';
    AccountScoreBar.DESCR_TPL_MAP[PeerDataBar.SITE_ATTRACTIVE] = 'siteAttractiveDescr';

	AccountScoreBar.prototype = {
		/**
		 * 初始化PeerDataBar实例 
		 */
		init: function() {
			var me = this,
			    bar = new PeerDataBar(fbs.accountscore.peerData, token),
			    bindContext = nirvana.util.bind;
			
			this.peerDataBar = bar;
			this.loading = new ui.Loading({"container": this.container});
			
			// 定义发送请求前事件处理
			bar.onBeforeRequest = function() {
				// 显示数据请求加载状态
				me.loading.show();
			};
			
			// 定义发送请求失败事件处理
			bar.onRequestFail = bindContext(me.responseFailHandler, me);
			// 定义发送请求成功的事件处理
			bar.onRequestSuccess = bindContext(me.responseSuccessHandler, me);
			// 定义获取bar配置的实现
			bar.getBarConfig = bindContext(me.getBarConfig, me);
			// 定义Bar渲染结束后事件处理
			/*bar.onAfterRender = function(dataType, isSuccess, noData) {
			};*/
		},
		/**
		 * 获取特定类型指标的Bar的配置，用于ColorBar组件的初始化
		 * @override
		 */
		getBarConfig: function(dataType, userValue, valueRange, topPercent) {
            var title = null,
                suffix = PeerDataBar.SUFFIX_MAP[dataType],
                isTime = (dataType === PeerDataBar.OFFLINE_TIME) ? true : false,
                tplName = AccountScoreBar.DESCR_TPL_MAP[dataType];
			
            var config = helper.getColorBarConfig(dataType, title, userValue, valueRange, suffix, isTime);
            this.initBarDescription(dataType, tplName, config, userValue, topPercent, valueRange);

			return config;
		},
		/**
		 * 初始化各种指标类型Bar的描述信息
		 */
		initBarDescription: function(type, tplName, config, value, topPercent, valueRange) {
			if (!config) {
				return;
			}
            // 判断网站打开时间、网站吸引力是否未安装百度统计
			if (helper.isUnInstallBaiduStatistic(value, type)) {
				tplName += '4';
			} else if (helper.isNoCorewords(value, type)) {
                // 重点词排名指标没有重点词显示的话术
                tplName += '3';
            } else if (isEmpty(value)) {
				// 用户指标值没有,显示指标异常话术
				tplName = 'userPeerValueErrorInfo';	
			} else if (type === PeerDataBar.SITE_OPEN_RATE) {
				if (value <= valueRange[1]) {
					tplName += '1';
				} else if (value > valueRange[1] && value <= valueRange[2]) {
					tplName += '2';
				} else {
					tplName += '3';
				}
			} else if (type === PeerDataBar.OFFLINE_TIME) {
				if (value < valueRange[1]) {
					tplName += '1';
				} else if (value >= valueRange[1] && value < valueRange[2]) {
					tplName += '2';
				} else if (value >= valueRange[2] && value < valueRange[3]) {
					tplName += '3';
				} else {
					tplName += '4';
				}
			} else if (isEmpty(topPercent)) {
                // toppercent指标值没有,显示指标异常话术
                tplName = 'userPeerValueErrorInfo';
            } else if (topPercent > 0) {
                tplName += '1';
            } else {
                tplName += '2';
			}
			
			config.description = lib.tpl.parseTpl({'topPercent': topPercent}, tplName, true);
		},
		/**
		 * 请求数据失败的处理器
		 * @private 
		 */
		responseFailHandler: function(result) {
			var me = this;
			
			if (me.loading) {
				// 先提示数据读取异常信息
				ajaxFailDialog();
				// 隐藏数据请求状态
				me.loading.hide();
			}
			// 这里不用更新loading结束的状态，反正都出错了
			// me.isLoading = false;
		},
		/**
		 * 请求数据成功的处理器
		 * @private 
		 */
		responseSuccessHandler: function(result) {
			if (this.loading) {
				// 隐藏数据请求状态
				this.loading.hide();
				// 执行渲染任务
				this.render();
				this.isLoading = false;
			}
		},
		/**
		 * 渲染各个评分指标项的内容
		 * @private  
		 */
		render: function() {
			if (!this.peerDataBar || !this.container) {
				return;
			}
			
			var barTypeArr = baidu.object.clone(SCORE_BAR_MAP[this.scoreType]),
			    renderMap = {},
			    len = barTypeArr.length;
			    
			// 初始化要渲染的Bar的类型Map    
			for (var i = 0; i < len; i ++) {
				renderMap[barTypeArr[i]] = null;
			}
			
			// 初始化要渲染的Bar的数据
			var dataMap = this.peerDataBar.getRenderBarValues(renderMap);
			
			// 过滤掉不显示的指标项
			this.filterNoShowBarType(barTypeArr, dataMap);
			// 重新初始化len
			len = barTypeArr.length;
			
			// 创建渲染的内容的模板
			var tpl = createAccoutQScoreDetailsTPL(barTypeArr, dataMap);
			this.container.innerHTML = tpl;
			
			// 初始化要渲染的Bar的位置的Map
			var barElems = $(".qscore_item_bar", this.container);
 	    	for (var i = 0; i < len; i ++) {
 	    		renderMap[barTypeArr[i]] = barElems[i];
 	    	}
 	    	
 	    	// 更新Bar的渲染
 	    	this.peerDataBar.update(renderMap);
		},
		/**
		 * 过滤掉不显示的指标项 
		 */
		filterNoShowBarType: function(barTypeArr, dataMap) {
			var len = barTypeArr.length,
			    toShowBarArr = [];
			
			for (var i = 0; i < len; i ++) {
				// 若该项指标值没有返回，则不显示该指标项
				if (!dataMap[barTypeArr[i]]) {
					delete dataMap[barTypeArr[i]];
				} else {
					toShowBarArr.push(barTypeArr[i]);
				}
			}
			
			if (toShowBarArr.length != len) {
				// 将原要显示的数组清空，把过滤后要显示的数据内容拷到原数组里
				barTypeArr.length = 0;
				for (i = 0, len = toShowBarArr.length; i < len; i ++) {
					barTypeArr[i] = toShowBarArr[i];
				}
				toShowBarArr.length = 0;
			}
		},
		/**
		 * 显示评分下的具体同行指标项的内容
		 * @method show
		 * @param {Number} scoreType 要显示的评分项类型，具体值定义见AccountScore的评分项类型的常量定义
		 */
		show: function(scoreType) {
			// 存储当前要显示的评分类型
			this.scoreType = scoreType;
			
			// 数据Bar不存在
			if (!this.peerDataBar) {
				// 先执行初始化
				this.init();
				// 标识一下loading状态
				this.isLoading = true;
				// 如果第一次显示，调用show方法
				this.peerDataBar.show();
			} else  if (!this.isLoading) {
				// 如果数据已经load结束，直接调用render方法
				this.render();
			}
			// 还在loading，啥也不用做，等着自动触发Bar的渲染，前面this.scoreType已经告诉自动触发渲染时
			// 要渲染的类型了
		},
		/**
		 * 销毁账户质量评分Bar实例
		 * @method dispose 
		 */
		dispose: function() {
			if (this.peerDataBar) {
				// 销毁前先缓存用到的token
				token = this.peerDataBar.getRequestToken();
				// 销毁Bar和Loading实例
 	    		ui.util.disposeWidgets(this, ['loading', 'peerDataBar']);
			}
			
			this.container = null;
		}
	};
	
	return AccountScoreBar;
}($$, nirvana.AccountScore, nirvana.PeerDataBar);