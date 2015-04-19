/*
 * 关键词排行榜类
 * @param targetId 目标节点，这个target里面需有wordsTrend模块
 * 
 */
(function($){

marketTrend.word = new marketTrend.moduleBase({
    id: 'marketWord',
    tip: '行业内网民最关注的词汇，需求量大，竞争相对激烈'
});
var wordExtend = {
    //数据
    data: {
        businessIndex: 0,
        currentType: '',
        one: {
            inited: false,
            data: {}
        },
        seven: {
            inited: false,
            data: {}
        }
    },
    revertData: function(){
        this.data = {
            businessIndex: 0,
            currentType: '',
            one: {
                inited: false,
                data: {}
            },
            seven: {
                inited: false,
                data: {}
            }
        };
    },
    failFlag: false,
    selectedWords: [],
	//ui组件
	ui: {
	    topWordsOneday: {},
        topWordsSevenday: {},
        explosiveWordsOneday: {},
        explosiveWordsSevenday: {},
        downloadBtn: {},
        addWordsBtn: {}
	},
	//属性
	targetId: 'marketWord',
	/**
	 * 初始化模块，此方法仅执行一次
	 */
	init: function(businessIndex) {
	    var me = this;
        me.data.businessIndex = businessIndex;
        
	    //类的功能，初始化模块外围结构
        me.initTitle(businessIndex);
        me.initTip();
        
	    me.target = baidu.g(me.targetId);
	    me.initUi();
	    
	    me.resetWordsTrendTab();
	    baidu.dom.addClass($('#wordRangeControl a')[1], 'current_tab');
	    me.changeTo('seven');
	    
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
		var container = me.target;

		baidu.event.on(container, 'click', function(e) {
			var input = me.getInput(e),
			id, checked;

			if (input) {
				id = input.id ? input.id : baidu.getAttr(input, "class");
				checked = input.checked;
			} else {
				return;
			}

			words = me.data[me.data.currentType].data;

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
		baidu.on('wordRangeControl', 'click', function(e){
            var event = e || window.event;
            var target = event.target || event.srcElement;
            
            var type = baidu.dom.getAttr(target, 'tabLabel');
            if (type && (type != me.data.currentType)) {
                me.removeTabClass();
                baidu.dom.addClass(target, 'current_tab');
                
                timeMode = (type == 'one' ? 0 : 1);
                me.changeTo(type);
                
                marketTrend.log.click('wordTabChange');
            }
            
            return false;
        });
		// 点击"下载"按钮
		me.ui.downloadBtn.onclick = function() {
			var selectedWords = me.selectedWords,
			wordsList = [];

			// 关键词去重
			//selectedWords = me.distinctWords(selectedWords);

			// 取出字面量
			for (var key in selectedWords) {
			    var str = selectedWords[key].word + ',' + selectedWords[key].value;
			    if (selectedWords[key].upRate) {
			        str = str + ',' + floatToPercent(selectedWords[key].upRate);
			    }
				wordsList.push(str);
			}

			var params = {wordsList: wordsList, fileName: 'rank', moreWords: false};
            var form = baidu.q('download_words_form', me.target)[0];
            form['userid'].value = nirvana.env.USER_ID;
            form['params'].value = baidu.json.stringify(params);
            
            marketTrend.log.download('wordsRank');
            
            form.submit();
		};
		// 点击"添加关键词"按钮
		me.ui.addWordsBtn.onclick = function() {
			// 勾选的关键词
			var selectedWords = me.selectedWords,
			title = '添加关键词',
			datasource = [];

			selectedWords = me.distinctWords(selectedWords);

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
					upAction: me,
	                onAdd: function(datasource){
	                	var words = [];
	                	var len = datasource.length;
	                	for (var i = 0; i < len; i ++) {
	                		words.push(datasource[i].keyword);
	                	}
	                	
	                	marketTrend.log.add('wordsRank', {
		                	words: words.join(',')
		                });
	                },
	                onAddSuccess: function(datasource){
	                	var words = [];
	                	var len = datasource.length;
	                	for (var i = 0; i < len; i ++) {
	                		words.push(datasource[i].word);
	                	}
	                	
	                	marketTrend.log.addSuccess('wordsRank', {
		                	words: words.join(',')
		                });
	                }
				},
				onclose: function() {
				}
			});

		};
		
		//返回顶部
        baidu.each(baidu.q('marketTrend_goback'),function(item){
            item.onclick = marketTrend.tool.goBack;
        });
	},
	refresh: function(businessIndex){
	    var me = this;
	    me.revertData();
	    me.data.businessIndex = businessIndex;
	    me.initTitle(businessIndex);
	    
	    me.resetWordsTrendTab();
	    me.removeTabClass();
        baidu.dom.addClass($('#wordRangeControl a')[1], 'current_tab');
        me.changeTo('seven');
	},
	initUi: function() {
        var me = this;
        me.initText();
        
        // 关键词行业展现趋势 TopN组件的配置项
        var oringinKeys = [null, 'word', 'value'],
            oringinValues = [null,
            function(item) {
                var randomID = er.random();
                item.randomID = randomID;
                return '<input type="checkbox" id="randomID_' + randomID +
                '"/>&nbsp;<label for="randomID_' + randomID +
                '" title="' + item.word + '">' + getCutString(item.word, 13, '..') + '</label>';
            },
            function(item) {
                return '<div class="valueBar market_trend_skin"/></div><span class="valueLiteral">约' + item.value + '</span>';
            }],
            topWordsKeys = baidu.object.clone(oringinKeys),
            topWordsValues = baidu.object.clone(oringinValues);
            topWordsValues.push(function(item){
                return '';
            });
        // 关键词展现量排行
        me.ui.topWordsOneday = ui.util.create('TopN',{
            'id': me.targetId + 'topWordsOneday',
            'keys': topWordsKeys,
            'values': topWordsValues,
            'isfixed': false,
            'barKey': 'value'
        },baidu.q('topWordsOneday', me.target)[0]);
        
        me.ui.topWordsSevenday = ui.util.create('TopN',{
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
        
        me.ui.explosiveWordsOneday = ui.util.create('TopN',{
            'id': me.targetId + 'explosiveWordsOneday',
            'keys': explosiveWordsKeys,
            'values': explosiveWordsValues,
            'isfixed': false,
            'barKey': 'value'
        },baidu.q('explosiveWordsOneday', me.target)[0]);
        
        me.ui.explosiveWordsSevenday = ui.util.create('TopN', {
            'id': me.targetId + 'explosiveWordsSevenday',
            'keys': explosiveWordsKeys,
            'isfixed': false,
            'values': explosiveWordsValues,
            'barKey': 'value'
        }, baidu.q('explosiveWordsSevenday', me.target)[0]);
        
        //按钮组件
        me.ui.downloadBtn = ui.util.create('Button', {
            'id': me.targetId + 'Download'
        }, baidu.q('wordsTrendDownload', me.target)[0]);
        me.ui.downloadBtn.setLabel("下载");
        me.ui.addWordsBtn = ui.util.create('Button', {
            'id': me.targetId + 'AddWords'
        }, baidu.q('wordsTrendAddWords', me.target)[0]);
        me.ui.addWordsBtn.setLabel("添加关键词");
    },
    fetch: function(callback, type){
        var me = this;
        var sevenDayBefore,
            oneDayBefore,
            starttimeVar,
            endtimeVar,
            sevenDayBefore = new Date(nirvana.env.SERVER_TIME*1000 - 7*24*3600*1000);
            oneDayBefore = new Date(nirvana.env.SERVER_TIME*1000 - 24*3600*1000);
        
        endtimeVar = baidu.date.format(new Date(oneDayBefore), 'yyyy-MM-dd');
        //昨天
        if(type == 'one'){
            starttimeVar = endtimeVar;
        }else{
        //最近7天
            starttimeVar = baidu.date.format(new Date(sevenDayBefore), 'yyyy-MM-dd');
        }
        
        function onSuccess(response) {
            me.data[type].data = response.data || {};
            
            if (me.failFlag) {
                me.onSuccess();
            }
            
            callback();
        }
        
        var params = {
            industryID: marketTrend.control.businessDivide.data.business[me.data.businessIndex].id,
            starttime: starttimeVar,
            endtime: endtimeVar,
            onSuccess: onSuccess,
            onFail: me.onFail
        };
        
        fbs.marketTrend.getWordsTrendIndustry(params);
    },
	changeTo: function(type){
        var me = this;
        me.data.currentType = type;
        baidu.removeClass(baidu.q('wordstrend_' + type + 'day_wrap', me.target)[0], 'hide');
        var otherType = ((type == 'one') ? 'seven' : 'one');
        baidu.addClass(baidu.q('wordstrend_' + otherType + 'day_wrap', me.target)[0], 'hide');
        
        function callback(){
            me.data[type].inited = true;
            me.resetWordsTrendTab();

            var topWords,
                explosiveWords;

            if (type == 'one') {
                topWords = me.ui.topWordsOneday;
                explosiveWords =me.ui.explosiveWordsOneday;
            }
            else if (type == 'seven') {
                topWords = me.ui.topWordsSevenday;
                explosiveWords =me.ui.explosiveWordsSevenday;
            }
            
            // 刷新TopN控件的数据
            if (topWords) {
                topWords.refresh(me.data[type].data.topWords);
            }
            if (explosiveWords) {
                explosiveWords.refresh(me.data[type].data.explosiveWords);
            }
            
            baidu.each(baidu.q('market_trend_skin', me.target), function(item){
                baidu.addClass(item, 'skin_type_' + marketTrend.control.businessDivide.data.currentIndex);
            });
            
            //添加排行榜每行的mouseover监听
            baidu.array.each(baidu.dom.query("tr", me.target), function(item){
                baidu.event.on(item, "mouseover", function(e){
                    baidu.addClass(this, "words_trend_mouseover_tr");
                });
                baidu.event.on(item, "mouseout", function(e){
                    baidu.removeClass(this, "words_trend_mouseover_tr");
                });
            });
        }
        
        if (me.data[type].inited) {
            callback();
            if (me.failFlag) {
                me.onSuccess();
            }
        }
        else {
            me.fetch(callback, type);
        }
    },
    removeTabClass: function(){
        var tabs = $('#wordRangeControl a');
        var len = tabs.length;
        for (var i = 0; i < len; i ++) {
            baidu.dom.removeClass(tabs[i], 'current_tab');
        }
    },
	/**
     * 获得input对象，type是radio或checkbox
     * HTML结构是: <input id="xx" type="radio"/><label for="xx">text</label>
     * 
     * @param {Event} e
     */
    getInput: function(e) {
        e = e || window.event;
        var target = e.target || e.srcElement,
            tagName = target.tagName.toLowerCase();

        if (tagName !== 'input' && tagName !== 'label') {
            return;
        }

        if (tagName === 'input' && (target.type === 'radio' || target.type === 'checkbox')) {
            return target;
        } else {
            var id = target['for'];
            return id ? baidu.g(id) : null;
        }
    },
    /**
     * 关键词去重，根据字面量去重
     * @return {object}
     */
    distinctWords: function(selectedWords) {
        var wordsMap = {}, item;

        for (var key in selectedWords) {
            item = selectedWords[key];
            if (!wordsMap[item.word]) {
                wordsMap[item.word] = item;
            }
        }
        return wordsMap;
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
        this.ui.downloadBtn.disable(disable);
        this.ui.addWordsBtn.disable(disable);
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
		var topText = "商业检索量排行",
			explosiveText = "商业检索激增排行",
			column3Text = "检索量";
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
		this.ui.downloadBtn.dispose();
		this.ui.addWordsBtn.dispose();
	},
	onFail: function(){
        baidu.removeClass(baidu.q('market_fail_wrapper', baidu.g('marketWord'))[0], 'hide');
        marketTrend.word.failFlag = true;
    },
    onSuccess: function(){
        baidu.addClass(baidu.q('market_fail_wrapper', baidu.g('marketWord'))[0], 'hide');
        marketTrend.word.failFlag = false;
    },
    dispose: function(){
    	var me = this;
    	me.resetWordsTrendTab();
	    me.removeTabClass();
	    me.failFlag = true;
    }
};

baidu.object.extend(marketTrend.word, wordExtend);
    
})($$);
