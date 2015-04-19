/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: module/accountScore/AccountScore.js 
 * desc: 新的账户质量评分 
 * author: Wu Huiyao (wuhuiyao@baidu.com) 
 * date: $Date: 2012/11/08 $
 */

/**
 * <p>账户质量评分类，该类实现为单例模式</p>
 * 通过getInstance方法获取账户质量评分实例：<br/>
 * <code>
 * var instance = nirvana.AccountScore.getInstance();
 * </code>
 */
nirvana.AccountScore = function($) {
	// 保存的AccountScore单例的实例
	var instance = null;
	// 缓存是否已经渲染过账户质量评分在侧边栏的容器的内容
	var rendered = false;
    //  发送账户质量评分数据请求必须携带的参数，同时也用来缓存后端返回的token，以便后端能利用缓存机制
	var token = '';
	
	/**
	 * 构造函数定义，其实现为单例
	 */
	function AccountScore() {
		if (instance) {
			return instance;
		}

		// 保存当前的实例
		instance = this;
	}

	/**
	 * 更新账户质量评分在侧边栏的预览信息
	 * 
	 * @param {Object}
	 *            data 账户质量评分数据
	 */
	function updateOverViewInfo(container, data) {
		if (!renderOverViewInfo(container)) {
			// 渲染失败，直接退出
			return;
		}
		
		var score = data.score,
		    // 账户质量评分相比昨日变化的分数
		    changedScore = data.change;

		// 更新当前账户质量评分
		var scoreElem = $('.value', container)[0], 
		    changedScoreElem = $('.changed_score', container)[0], 
		    upElem = $('#accountScore .up')[0], 
		    downElem = $('#accountScore .down')[0];

		scoreElem.innerHTML = score;
		changedScoreElem.innerHTML = Math.abs(changedScore);

		if (changedScore > 0) {
			baidu.show(upElem);
		} else {
			baidu.hide(upElem);
		}

		if (changedScore < 0) {
			baidu.show(downElem);
		} else {
			baidu.hide(downElem);
		}

		if (changedScore) {
			baidu.show(changedScoreElem);
		} else {
			// 账户质量评分未发生变动，不显示评分变化信息
			baidu.hide(changedScoreElem);
		}
	}

	/**
	 * 渲染账户质量评分在侧边栏的预览信息
	 */
	function renderOverViewInfo(container) {
		if (container) {
        	baidu.show(container);
		} else {
			return false;
		}
		
		if (!rendered) {// 从未渲染过
			container.innerHTML = er.template.get('accountScoreOverView');
			rendered = true;
		}
		return true;
	}

	/**
	 * 各种评分类型ID的常量定义，只读
	 */
	// 账户质量评分项
    AccountScore.ACCOUNT_SCORE = 0x0;
    // 展现环节得分项
    AccountScore.PRESENT_SCORE = 0x1;
    // 点击环节得分项
    AccountScore.CLICK_SCORE = 0x2;
    // 浏览与转化环节得分项
    AccountScore.PV_CONVERSION_SCORE = 0x3;
    /**
     * 得分评价类型定义,只读 
     */
    AccountScore.COMMENT = {
    	// 较差
    	BAD: 0x0,
    	// 良好
    	GOOD: 0x1
    };
    
    /**
 	 * 账户质量评分四种类型名称的定义 
 	 */
 	AccountScore.NAME_MAP = {};
	AccountScore.NAME_MAP[AccountScore.ACCOUNT_SCORE] = "账户质量";
	AccountScore.NAME_MAP[AccountScore.PRESENT_SCORE] ="展现";
	AccountScore.NAME_MAP[AccountScore.CLICK_SCORE] = "点击";
	AccountScore.NAME_MAP[AccountScore.PV_CONVERSION_SCORE] = "浏览与转化";
    
	AccountScore.prototype = {
		/**
		 * 初始化账户质量评分 
		 * @method init
		 * @public
		 */
		init : function() {
            var me = this;
			// 请求账户质量评分的数据
			var param = {
				condition : {token: token},
				onSuccess : me.responseSuccessHandler,
				onFail : me.responsefailHandler
			};
			// 要被渲染的容器元素
			me.container = $('#accountScore')[0];
			// 执行数据请求 
			nirvana.util.request(fbs.accountscore.abstractData, param, me);
		},
		/**
		 * 请求账户质量评分成功的处理器 
		 * @private
		 */
		responseSuccessHandler: function(result) {
			var me = this;
			
            // 缓存返回的token用于下次请求
            token = result.data.token;
            // 缓存评分项的信息
            me.scoreAbstract = result.data.account_score_abs.account_score_abs_item;
            // 对返回的摘要数据进行预处理
            me.scoreAbstract = me.processScoreAbstractData(me.scoreAbstract);
            
            var accountScoreData = me.scoreAbstract[AccountScore.ACCOUNT_SCORE];
            if (accountScoreData && !nirvana.util.isEmptyValue(accountScoreData.score)) {
            	// 更新摘要的信息
				updateOverViewInfo(me.container, accountScoreData);
            } else {
            	// 不存在账户质量评分项数据直接不显示
            	me.container && baidu.hide(me.container);
            }
            
		},
		/**
		 * 评分项摘要数据的预处理 
		 * @private
		 */
		processScoreAbstractData: function(data) {
			var me = this,
			    map = [],
			    item,
			    isEmpty = nirvana.util.isEmptyValue;
			    
			for (var i = 0, len = data.length; i < len; i ++) {
				item = data[i].account_score_abs_history[0];
				map[data[i].id] = {
					'score': isEmpty(item.score) ? null : +item.score,
					'change': isEmpty(item.score_change) ? null : +item.score_change,
					'comment': isEmpty(item.desc_type) ? null : +item.desc_type
				};
			}
			
			return map; 
		},
		/**
		 * 请求账户质量评分数据失败的处理器 
		 * @private
		 */
		responseFailHandler: function(json) {
			var container = me.container;
			// 获取账户质量评分信息失败，不显示账户质量评分信息
			container && baidu.hide(container);
		},
		/**
		 * 打开账户质量评分的详情对话框 
		 * @method openDetail
		 */
		openDetail : function() {
            // 创建账户质量评分详情实例
            var accountScoreDetail = new nirvana.AccountScoreDetail(this);
            // 打开账户质量评分详情对话框
            accountScoreDetail.open();
		},
		/**
		 * 销毁账户质量评分实例 
		 */
		dispose: function() {
			this.container = null;
		}
	};
	
	/**
	 * 获取账户质量评分的实例 
	 * @method getInstance
	 * @static
	 * @public
	 */
	AccountScore.getInstance = function() {
		return new AccountScore();
	};
	/**
	 * 销毁账户质量评分的实例 
	 * @method dispose
	 * @static 
	 * @public
	 */
	AccountScore.dispose = function() {
		instance && instance.dispose();
		instance = null;
	    rendered = false;
	};

	return AccountScore;

}($$);