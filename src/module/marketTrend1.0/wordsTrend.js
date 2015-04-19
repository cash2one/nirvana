/*
 * 关键词排行榜类
 * @param targetId 目标节点，这个target里面需有wordsTrend模块
 * 
 */
marketTrend.wordsTrend = function(targetId){
	//ui组件
	this.selectUi = {};
	this.topWordsOneday = {};
	this.topWordsSevenday = {};
	this.explosiveWordsOneday = {};
	this.explosiveWordsSevenday = {};
	this.downloadBtn = {};
	this.addWordsBtn = {};
	//属性
	this.targetId = targetId;
	this.target = baidu.g(targetId);
	//数据
	this.wordsData = [];
	this.selectedWords = [];
	this.marketInitCount = 0;
	//初始化
	this.initWordsTrend();
};
marketTrend.wordsTrend.prototype = {
	initWordsTrend : function() {
		var me = this;
		
		me.initText();
		
		var selectId = me.targetId + 'Select';
		//baidu.dom.setAttr(baidu.q('wordstrend_select',me.target)[0], 'id', selectId);
		//select组件初始化
		me.selectUi = ui.util.create('Select', {
				'id' : selectId,
				'width' : '150',
				'datasource':[
				{
					'text':'最近7天',
					'value':7
				},{
					'text':'最近1天',
					'value':1
				}
				]
			}, baidu.q('wordstrend_select',me.target)[0]);
		
		// 关键词行业展现趋势 TopN组件的配置项

		// 关键词展现量排行
		var oringinKeys = [null, 'word', 'value'],
			oringinValues = [null,
			function(item) {
				var randomID = er.random();
				item.randomID = randomID;
				return '<input type="checkbox" id="randomID_' + randomID +
				'"/>&nbsp;<label for="randomID_' + randomID +
				'" title="' + item.word + '">' + item.word + '</label>';
			},
			function(item) {
				return '<div class="valueBar"/></div><span class="valueLiteral">约' + item.value + '</span>';
			}],
			topWordsKeys = baidu.object.clone(oringinKeys),
			topWordsValues = baidu.object.clone(oringinValues);
			topWordsValues.push(function(item){
				return '';
			});
		me.topWordsOneday = ui.util.create('TopN',{
			'id': me.targetId + 'topWordsOneday',
            'keys': topWordsKeys,
            'values': topWordsValues,
            'isfixed': false,
            'barKey': 'value'
		},baidu.q('topWordsOneday', me.target)[0]);
		
		me.topWordsSevenday = ui.util.create('TopN',{
			'id': me.targetId + 'topWordsSevenday',
            'keys': topWordsKeys,
            'values': topWordsValues,
            'isfixed': false,
            'barKey': 'value'
		},baidu.q('topWordsSevenday', me.target)[0]);
		
		// 激增关键词排行
		var explosiveWordsKeys = baidu.object.clone(oringinKeys),
			explosiveWordsValues = baidu.object.clone(oringinValues);
	
			explosiveWordsKeys.push('upRate');
			explosiveWordsValues.push( function(item) {
				return '<span style="color:red;">+' + floatToPercent(item.upRate) + '</span>';
			});
		
		me.explosiveWordsOneday = ui.util.create('TopN',{
			'id': me.targetId + 'explosiveWordsOneday',
            'keys': explosiveWordsKeys,
            'values': explosiveWordsValues,
            'isfixed': false,
            'barKey': 'value'
		},baidu.q('explosiveWordsOneday', me.target)[0]);
		
		me.explosiveWordsSevenday = ui.util.create('TopN', {
			'id': me.targetId + 'explosiveWordsSevenday',
            'keys': explosiveWordsKeys,
            'isfixed': false,
            'values': explosiveWordsValues,
            'barKey': 'value'
		}, baidu.q('explosiveWordsSevenday', me.target)[0]);
		
		//按钮组件
		me.downloadBtn = ui.util.create('Button', {
			'id': me.targetId + 'Download'
		}, baidu.q('wordsTrendDownload', me.target)[0]);
		me.downloadBtn.setLabel("下载");
		me.addWordsBtn = ui.util.create('Button', {
			'id': me.targetId + 'AddWords'
		}, baidu.q('wordsTrendAddWords', me.target)[0]);
		me.addWordsBtn.setLabel("添加关键词");
	},
	// 下面是关键词展现趋势模块
	/**
	 * 请求 关键词展现排行 接口
	 * @param {Number} day 最近1天还是最近7天，传入1或7
	 */
	getWordsTrend: function(action, day) {
		var me = this,
			initedMap = action.params.initedMap;
		if (!initedMap[me.targetId]) {
			initedMap[me.targetId] = true;
			me.firstWordsTrend(action);
		}

		if (day !== 1 && day !== 7) {
			day = 7;
		}
		switch (day) {
			case 1:
				me.selectUi.setValue(1);
				baidu.dom.hide(baidu.q("wordstrend_sevenday_wrap", me.target)[0]);
				baidu.dom.show(baidu.q("wordstrend_oneday_wrap", me.target)[0]);
				break;
			case 7:
				me.selectUi.setValue(7);
				baidu.dom.hide(baidu.q("wordstrend_oneday_wrap", me.target)[0]);
				baidu.dom.show(baidu.q("wordstrend_sevenday_wrap", me.target)[0]);
				break;
		}
		
		var sevenDayBefore,
        	oneDayBefore,
        	starttimeVar,
        	endtimeVar,
        
        sevenDayBefore = new Date(nirvana.env.SERVER_TIME*1000 - 7*24*3600*1000);
        oneDayBefore = new Date(nirvana.env.SERVER_TIME*1000 - 24*3600*1000);
        
        endtimeVar = baidu.date.format(new Date(oneDayBefore), 'yyyy-MM-dd');
        //最近1天
        if(day === 1){
        	starttimeVar = endtimeVar;
        }else{
        //最近7天
        	starttimeVar = baidu.date.format(new Date(sevenDayBefore), 'yyyy-MM-dd');
        }
        
		var father = action,
		params = {
			industryID: father.params.industryID,
			// 与rd 约定0和1
			//timeMode: day === 1 ? 0 : 1,
			starttime: starttimeVar,
			endtime: endtimeVar
		},
		successFun = function(json) {
			me.resetWordsTrendTab(father);

			var data = json.data,
				topWords, 
				explosiveWords;

			if (day === 1) {
				topWords = me.topWordsOneday;
				explosiveWords =me.explosiveWordsOneday;
			} else if (day === 7) {
				topWords = me.topWordsSevenday;
				explosiveWords =me.explosiveWordsSevenday;
			}
			
			if ((me.targetId == 'wordsTrendMarket') && (!me.marketInitCount)){
				var marketHideFlag = 1;
				me.marketInitCount = 1;
				baidu.removeClass('marketAnalysis_market', 'hide');
			}
			
			// 刷新TopN控件的数据
			if (topWords) {
				topWords.refresh(data.topWords);
			}
			if (explosiveWords) {
				explosiveWords.refresh(data.explosiveWords);
			}
			
			if (marketHideFlag){
				baidu.addClass('marketAnalysis_market', 'hide');
			}
			
			me.wordsData = baidu.object.clone(data);
		
			//添加排行榜每行的mouseover监听
			baidu.array.each(baidu.dom.query("tr", me.target), function(item){
				baidu.event.on(item, "mouseover", function(e){
					baidu.addClass(this, "words_trend_mouseover_tr")
				});
				baidu.event.on(item, "mouseout", function(e){
					baidu.removeClass(this, "words_trend_mouseover_tr")
				});
			});
		};
		switch (me.targetId){
			case 'wordsTrendIndustry':
			father._request(3, params, successFun);
			break;
			case 'wordsTrendMarket':
			father._request(5, params, successFun);
			break;
		}
	},
	/**
	 * 初始化模块，此方法仅执行一次
	 */
	firstWordsTrend: function(action) {
		var me = this,
			words,
		/**
		 * 工具方法：从topWords和explosiveWords中找出指定ID的word
		 * @param {String} randomID 关键词的随机数ID
		 * @return {id: xx, word: xx, value: xx[, upRate: xx]}
		 */
		findWord = function(randomID) {
			if (!words)
				return;
			// 遍历属性
			var i, word;

			var topWords = words.topWords;
			if (topWords) {
				for (i = 0; word = topWords[i]; i++) {
					if (word.randomID == randomID) {
						return word;
					}
				}
			}

			var explosiveWords = words.explosiveWords;
			if (explosiveWords) {
				for (i = 0; word = explosiveWords[i]; i++) {
					if (word.randomID == randomID) {
						return word;
					}
				}
			}
		};
		// 事件代理
		var container = me.target,
		father = action;

		baidu.event.on(container, 'click', function(e) {
			var input = marketTrend.index.tools.getInput(e),
			id, checked;

			if (input) {
				id = input.id ? input.id : baidu.getAttr(input, "class");
				checked = input.checked;
			} else {
				return;
			}

			words = me.wordsData;

			// 勾选单个关键词
			if (/^randomID_([0-9a-zA-Z]+)$/.test(id)) {
				var randomID = RegExp.$1,
				word = findWord(randomID);

				if (checked) {
					me.selectWord(word);
				} else {
					me.unSelectWord(word);
				}

				// 最近x 天关键词展现排行 全选
			} else if (id.indexOf('select_all_topwords') !== -1) {

				if (checked) {
					me.selectWords(words.topWords);
				} else {
					me.unSelectWords(words.topWords);
				}

				// 最近x 天激增关键词排行 全选
			} else if (id.indexOf('select_all_explosivewords') !== -1) {

				if (checked) {
					me.selectWords(words.explosiveWords);
				} else {
					me.unSelectWords(words.explosiveWords);
				}
			}
		});
		
		// select change事件
		var timeMode = 0;
		me.selectUi.onselect = function(value) {

			timeMode = (value === 1 ? 0 : 1);

			me.getWordsTrend(father,value);

			return false;
		}
		// 点击"下载"按钮
		me.downloadBtn.onclick = function() {
			var selectedWords = me.selectedWords,
			wordsList = [];

			// 关键词去重
			selectedWords = marketTrend.index.tools.distinctWords(selectedWords);

			// 取出字面量
			for (var key in selectedWords) {
				wordsList.push(selectedWords[key].word);
			}

			nirvana.util.openSubActionDialog({
				id: 'downloadWords',
				title: '下载关键词',
				actionPath: '/overview/marketTrend/download',
				params: {
					wordsList: wordsList,
					timeMode: timeMode,
					target: me.target
				}
			});
		};
		// 点击"添加关键词"按钮
		me.addWordsBtn.onclick = function() {
			// 勾选的关键词
			var selectedWords = me.selectedWords,
			title = '添加关键词',
			datasource = [];

			selectedWords = marketTrend.index.tools.distinctWords(selectedWords);

			for (var key in selectedWords) {
				datasource.push({
					query: selectedWords[key].word
				});
			}

			nirvana.util.openSubActionDialog({
				className: 'skin_keyword_add',
				id: 'AddKeywordDialog_MarketTrend',
				title: title,
				width: 1010,
				actionPath: '/tools/queryReport/addQuery',
				params: {
					title: title,
					datasource: datasource,
					upAction: me
				},
				onclose: function() {
				}
			});

		};
	},
	/**
	 * 重置当前数据区域
	 */
	resetWordsTrendTab: function() {
		var me = this;
		// 每次切换都回到默认状态
		this.selectedWords = [];

		// 下载按钮、添加关键词 按钮置灰
		this.disableBtn(true);

		// 重置勾选词
		var oneDayTopWords = baidu.q('oneday_select_all_topwords', me.target)[0],
			oneDayExplosiveWords = baidu.q('oneday_select_all_explosivewords', me.target)[0],
			sevenDayTopWords = baidu.q('sevenday_select_all_topwords', me.target)[0],
			sevenDayExplosiveWords = baidu.q('sevenday_select_all_explosivewords', me.target)[0];

		oneDayTopWords.checked = false;
		oneDayExplosiveWords.checked = false;
		sevenDayTopWords.checked = false;
		sevenDayExplosiveWords.checked = false;
	},
	/**
     * 操作“下载”，“添加关键词”按钮状态
     * @param {Boolean} disable 按钮是否可点
     */
    disableBtn: function(disable) {
        // 下载按钮、添加关键词 按钮可点
        this.downloadBtn.disable(disable);
        this.addWordsBtn.disable(disable);
    },
	/**
	 * 私有工具方法
	 * @param {object} word 关键词
	 * @param {boolean} isSelect 选中还是反选
	 */
	_selectWord: function(word, isSelect) {
		var me = this,
			selectedWords = me.selectedWords,
			randomID = word.randomID;

		// 操作DOM
		var domID = 'randomID_' + randomID;
		var targetInput = baidu.g(domID);
		if (isSelect){
			targetInput.checked = true;
			baidu.addClass(baidu.dom.getAncestorByTag(targetInput, "tr"), 
			"words_trend_selected_tr");
		}else{
			targetInput.checked = false;
			baidu.removeClass(baidu.dom.getAncestorByTag(targetInput, "tr"), 
			"words_trend_selected_tr");
		}
		
		// 维护哈希表
		if (isSelect) {
			if (!selectedWords[randomID]) {
				selectedWords[randomID] = word;
			}
		} else {
			delete selectedWords[randomID];
		}

		// 统计当前已选词数量
		var keys = baidu.object.keys(selectedWords);
		this.disableBtn(keys.length ? false : true);
		baidu.q('wordsTrendCheckedNum', me.target)[0].innerHTML = keys.length;
	},
	selectWord: function(word) {
		this._selectWord(word, true);
	},
	unSelectWord: function(word) {
		this._selectWord(word, false);
	},
	/**
	 * @param {Array} words 数组元素为{id: xx, word: xx, value: xx}
	 */
	selectWords: function(words) {
		for (var i = 0, word; word = words[i]; i++) {
			this.selectWord(word);
		}
	},
	unSelectWords: function(words) {
		for (var i = 0, word; word = words[i]; i++) {
			this.unSelectWord(word);
		}
	},
	initText: function(){
		var me = this;
		switch (me.targetId){
			case 'wordsTrendIndustry':
				var titleText = "行业热点披露",
					topText = "商业检索量排行",
					explosiveText = "商业检索激增排行",
					column3Text = "检索量";
				break;
			case 'wordsTrendMarket':
				var titleText = "行业竞争披露",
					topText = "展现量排行",
					explosiveText = "展现量激增排行",
					column3Text = "展现量";
			break;
		}
		baidu.dom.query(".title h2", me.target)[0].innerHTML = titleText;
		baidu.array.each(baidu.dom.query(".top_words_wrap h3", me.target), function(item){
			item.innerHTML = topText;
		});
		baidu.array.each(baidu.dom.query(".explosive_words_wrap h3", me.target), function(item){
			item.innerHTML = explosiveText;
		});
		baidu.array.each(baidu.dom.query(".rank_header .column3", me.target), function(item){
			item.innerHTML = column3Text;
		});
	},
	disposeUi: function(){
		this.selectUi.dispose();
		this.downloadBtn.dispose();
		this.addWordsBtn.dispose();
	}
}
