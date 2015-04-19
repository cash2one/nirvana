/**
 * KR 核心模块
 * 主要逻辑如下：
 * 1. 获取 planid 和 unitid
 * 2. 通过 planid 和 unitid 获取地域
 * 3. 通过 planid 获取设备属性（无线凤巢）
 * 4. 获取回收站中关键词的数量
 * 5. 默认激活量身推荐Tab，请求数据，如果没有数据，切到被动推荐Tab（搜索啥？空的？），并隐藏量身推荐Tab
 * 6. 如果带入了物料中的关键词，直接搜索 keywords[0]（切到被动推荐Tab）
 * 7. 如果有种子词和种子URL，初始化种子词跑马灯和输入框轮显
 * 8. 如果带入物料关键词，初始化物料跑马灯，隐藏种子词跑马灯（此时如果也存在物料跑马灯，可以和种子词跑马灯切换）
 *
 * 细节逻辑如下：
 * 1. 当输入框正在轮显种子词和种子URL时，点击搜索按钮，会取得对应值触发被动推荐
 * 2. 搜索框focus时
 *    如果 value 为 "", 显示种子URL layer
 *    如果 value 不为 "", 触发suggestion
 * 3. 搜索框focus时，提交请求触发被动推荐
 * 4. 搜索框blur时，如果有种子词，继续轮显
 * 4. 触发被动推荐的几种方式：
 *    1）点击物料跑马灯和种子词跑马灯中的词
 *    2）选择suggestion 浮层的选项
 */
nirvana.KR = (function($) {

    var event = fc.event,
		ShowReason = fc.common.ShowReason,
        Region = fc.common.Region,
        Keyword = fc.common.Keyword,
        Unit = fc.common.Unit,
        RegionSelector = fc.ui.RegionSelector,
        AddTrafficDialog = fc.module.AddTrafficDialog,
        modules = nirvana.krModules,
        config = nirvana.krConfig,
        util = nirvana.krUtil,
        monitor = nirvana.krMonitor;

    /**
     * 外部传入的一些参数,如果需要从外部带一批词到提词栏，按如下例子进行设置
     * {
     *    queryMap: {
     *      importMaterials: {
     *          newKeywords: ['关键词1', '关键词2']
     *      }
     *  }
     *
     * @param {Object} data 外部传入的参数 
     */
    function KR(data) {
        this.data = data;
        this.node = $('#kr')[0];
        // 是否正在请求中
        this.isLoading = false;
        // 当前的推荐结果, 主要用来筛选
        this.recommendResult = null;
        // 存几个需要记录的监控参数
        this.logParam = { };

        var obj = util.getPlanUnit(data);
        // 请求的参数。其他模块有任何更改，都会同步到这个对象，具体可见 refresh()
        initParam.call(this, obj.planid, obj.unitid, data.isInNewFlow, data.popup_entry);

        initUI.call(this, data.popup_entry ? data.popup_entry : 'default');
        addEvents.call(this);
        resize.call(this);
    }

    KR.prototype = {

        // 被动推荐。本来想取名为search 的，可是search已经给属性用掉了。。。
        searchKeyword: function(query) {
            this.search.value(query);
			query = fc.trim(this.search.value());
            if (!query || this.isLoading) return;
            this.tab.switchToPasvTab();
            this.param.query = query;
            this.param.querytype = util.isURL(query) ? 2 : 1;
            requestRecommendResult.call(this);
        },
        // 量身推荐
        recommendKeywords: function() {
            this.tab.switchToActvTab();
            this.param.query = '';
            this.param.querytype = 3;
            this.logParam.seedType = null;
            requestRecommendResult.call(this);
        },

        switchToAutoUnit: function() {
            fc.hide($('.addWords', this.node)[0]);
            fc.hide($('.recommendWords', this.node)[0]);
            fc.show($('#kr_autounit')[0]);
        },

        switchToKR: function() {
            fc.show($('.addWords', this.node)[0]);
            fc.show($('.recommendWords', this.node)[0]);
            fc.hide($('#kr_autounit')[0]);
            resize.call(this);
            this.result.table.onresize();
            this.reloadRecommendResult();
        },

        // 重新加载推荐结果
        reloadRecommendResult: function() {
            requestRecommendResult.call(this);
        },

        dispose: function() {
            event.un(window, 'resize', resize);            
            for (var key in this) {
                this[key] && this[key].dispose && this[key].dispose();
            }
        }
    };

    KR.EVENT_INIT = 'init';
    KR.EVENT_REFRESH = 'refresh';
    KR.EVENT_SWITCH_MARQUEE = 'switch_marquee';
    KR.EVENT_LOAD_COMPLETED = 'load_completed';
    KR.EVENT_ACTV = 'actv';
    KR.EVENT_SEARCH = 'search';
    KR.EVENT_OPEN_SEED_LAYER = 'open_seed_layer';
    KR.EVENT_SEED_STARTPLAY = 'start_seed_play';
    KR.EVENT_SUGGESTION = 'suggestion';
    KR.EVENT_CHANGE_FILTER = 'change_filter';
    KR.EVENT_CHANGE_COLUMN = 'change_column';
    KR.EVENT_RESULT_HEIGHT_CHANGE = 'result_height_change';
    KR.EVENT_WORD_SIZE_CHANGE = 'word_size_change';
    KR.EVENT_DOWNLOAD_KEYWORD = 'download_keyword';
    KR.EVENT_ADD_KEYWORD = 'add_keyword';
    KR.EVENT_DEL_KEYWORD = 'del_keyword';
    KR.EVENT_ADD_WORDS_TOBOX = 'addwords_tobox';
    KR.EVENT_WORD_CHANGE = 'word_change';
    KR.EVENT_SAVE_WORD_COMPLETED = 'save_word_completed';
    KR.EVENT_AUTO_UNIT_CLICK = 'auto_unit_click';
    KR.EVENT_CLOSE = 'kr_close';
    KR.EVENT_CLOSE_RECYCLE_DIALOG = 'close_recycle_dialog';
    KR.EVENT_RESTORE_KEYWORD = 'restore_keyword';
    KR.EVENT_SUGGESTION_MONITOR = 'kr_suggestion_monitor';
    KR.EVENT_MONITOR = 'kr_monitor';

    function initUI(kr_entrance) {
        // 不是直接 new 的都是 需要请求 或 需要一小段逻辑处理的
        initRegion.call(this);
        // 种子词和物料跑马灯
        initMarquee.call(this);
        initAddWords.call(this);

        this.advance = new modules.Advance();
        this.recycle = new modules.Recycle();

        this.device = new modules.Device(this.param.planid, util.getMaterials(this.data));
        // fc.hide($('.krOptions .device')[0]);
        
        this.tab = new modules.Tab();
        this.search = new modules.Search(this.param.entry);
        this.filter = new modules.Filter();
        this.toolbar = new modules.Toolbar();
        this.result = new modules.Result();

        KR_AUTOUNIT.init(this);
        KR_AUTOUNIT.start();
        
        nirvana.krMonitor.enter({kr_entrance: kr_entrance});
    }

    // 需要异步请求的模块，它们会处理自己的事件
    // 这里就不管他们了，也管不了了
    function addEvents() {
        event.on(this, KR.EVENT_INIT, init, this);
        if (this.device) {
            event.on(this.device, KR.EVENT_INIT, init, this);
            event.on(this.device, KR.EVENT_REFRESH, refresh, this);
        }
        event.on(this.advance, KR.EVENT_REFRESH, refresh, this);
        event.on(this.recycle, KR.EVENT_CLOSE_RECYCLE_DIALOG, closeRecycleDialog, this);
        event.on(this.recycle, KR.EVENT_RESTORE_KEYWORD, restoreKeyword, this);

        event.on(this.tab, KR.EVENT_ACTV, this.recommendKeywords, this);
        event.on(this.tab, KR.EVENT_SEARCH, search, this);

        event.on(this.search, KR.EVENT_SEARCH, search, this);
        event.on(this.search, KR.EVENT_SUGGESTION_MONITOR, suggestMonitor, this);

        event.on(this.filter, KR.EVENT_CHANGE_FILTER, changeFilter, this);
        event.on(this.filter, KR.EVENT_RESULT_HEIGHT_CHANGE, resize, this);

        event.on(this.toolbar, KR.EVENT_ADD_WORDS_TOBOX, addWordsToBox, this);
        event.on(this.toolbar, KR.EVENT_CHANGE_COLUMN, changeColumn, this);
        event.on(this.toolbar, KR.EVENT_DOWNLOAD_KEYWORD, downloadKeyword, this);

        event.on(this.result, KR.EVENT_SEARCH, search, this);
        event.on(this.result, KR.EVENT_ADD_KEYWORD, addWordsToBox, this);
        event.on(this.result, KR.EVENT_DEL_KEYWORD, deleteKeyword, this);
        event.on(this.result, KR.EVENT_WORD_SIZE_CHANGE, changeWordSize, this);
        event.on(this.result, KR.EVENT_WORD_CHANGE, checkRecommendResult, this);

        event.on(this.addWords, KR.EVENT_WORD_CHANGE, checkRecommendResult, this);
        event.on(this.addWords, KR.EVENT_SAVE_WORD_COMPLETED, saveWordCompleted, this);
        event.on(this.addWords, KR.EVENT_REFRESH, refresh, this);
        event.on(this.addWords, KR.EVENT_AUTO_UNIT_CLICK, KR_AUTOUNIT.onClickAutoUnitBtn, this);

        event.resize(window, resize, this);
    }

    function init() {
        // 无线
        if (this.region && this.device.value != null) {
            this.param.device = this.device.value;
        // 没有无线
        // if (this.region) {
            var keywords = util.getMaterials(this.data);
            if (keywords.length > 0) this.searchKeyword(keywords[0].showword);
            else this.recommendKeywords();
        }
    }

    function initRegion() {
        if (this.param.planid) {
            Region.getRegionByPlan(this.param.planid, callback);
        } else {
            Region.getRegionByAccount(callback);
        }
        
        var me = this, elem = $('.region', this.node)[0];
        function callback(regions) {
            me.param.regions = regions;
            // 拿到数据后，创建【地域选择器】
            me.region = new RegionSelector(elem, { regions: regions, labelText: '查询地区' });
            me.region.onchange = function(regions) {
                me.param.regions = regions;
                refresh.call(me, { regions: regions });
            };
            // 在这里请求推词可保证地域有值
            event.fire(me, KR.EVENT_INIT);
        }
    }

    function initMarquee() {
        var me = this, param = this.param;
        Keyword.seed({ planid: param.planid, unitid: param.unitid, callback: function(data) {
            var words = data.word.values, urls = fc.map(data.url.values, function(item) { return item.value; });

            me.marquee = new modules.Marquee(words, util.getMaterials(me.data));
            event.on(me.marquee, KR.EVENT_SEARCH, search, me);

            // 初始化输入框部分的种子词 + 种子url 轮显
            var player = me.player = new modules.SeedPlayer(words, urls);
            event.on(me.search, KR.EVENT_OPEN_SEED_LAYER, player.openLayer, player);
            event.on(me.search, KR.EVENT_SEED_STARTPLAY, player.play, player);
            
            resize.call(me);
        }});
    }

    function initAddWords() {
        var data = this.data, param = this.param, 
            planid = param.planid, unitid = param.unitid,
            changeable = data.changeable == null ? true : data.changeable,
            disablePlan, disableUnit;
        
        // planid 谁给设计成这样了，真无语
        if (planid) planid = isNaN(+planid) ? planid.planid : planid;

        disablePlan = !!planid || (changeable === false);
        disableUnit = !!unitid || (changeable === false);

        this.addWords = new modules.AddWords($('.addWords', this.node)[0], {
            planid: planid,
            unitid: unitid,
            disablePlan: disablePlan,
            disableUnit: disableUnit,
            words: util.getNewKeywords(data)
        });
    }
    
    function refresh(e) {
        if (e.regions)  monitor.modifyRegion(this.param, e.regions);
        if (e.rgfilter != null) monitor.modifyAdvance(this.param, e.rgfilter);

        for (var key in e) {
            if (this.param[key] != null) {
                this.param[key] = e[key];
            }
        }
        this.reloadRecommendResult();
    }

    function search(e) {
        this.logParam.seed = e.seed;
        this.logParam.seedType = e.seedType;
        this.logParam.suggestionType = e.suggestionType;
        this.logParam.isResearch = e.isResearch;
        this.searchKeyword(e.query);
    }

    function suggestMonitor(e) {
        monitor.suggest(this.param, e.wordid, e.lineNum);
    }

    function changeFilter(e) {
        var TEXT = modules.FilterField.BUSINESS_POINT,
            selectedFilterItems = this.filter.selectedFilterItems, item = e.item,
            selectBusinessPoint = item.field === TEXT && item.selected;

        // 如果选中项不包括业务点 或 当前选中业务点
        if (fc.grep(selectedFilterItems, function(item) { return item.field === TEXT; }).length === 0
            || selectBusinessPoint) {
            this.result.businessPointData = null; // 先清掉
        }

        var allGroups = getAllGroups.call(this),
            filtedGroups = util.filterKeywordGroups(allGroups, selectedFilterItems),
            items = util.updateFilterItems(this.filter.data, selectedFilterItems, allGroups);

        this.filter.update(items);
        this.result.render(filtedGroups, config.TEXT_FILTER_EMPTY, true);

        if (selectBusinessPoint) {
            var param = this.param;
            this.result.setBusinessPoint({
                query: param.query, 
                unitid: param.unitid,
                businessPoint: item.text,
                device: param.device
            }, function(groups) {
                // 返回的业务点还要筛选。。。。
                return util.filterKeywordGroups(groups, selectedFilterItems);
            });
        }

        monitor.modifyFilter(this.param, item, selectBusinessPoint);
    }

    function deleteKeyword(e) {
        var word = e.word, param = this.param, recycle = this.recycle;
        Keyword.remove({
            planid: param.planid,
            unitid: param.unitid,
            wordid: word.wordid,
            srchcnt: word.pv,
            cmprate: word.kwc,
            onSuccess: function(json) {
                recycle.addKeyword();
                e.callback(json);
            }
        });
        monitor.deleteWord(param, this.logParam, word, e.wordSeq);
    }

    function changeWordSize(e) {
        this.toolbar.updateSize(e.size);
    }

    function resize() {
        // 找个标志位判断一下 KR 是否已经销毁( 关闭 Dialog 可能走进这。。。)，可标识的变量太多，随便找了一个
        if (!this.search.searchBtn) return;
        var total = this.node.offsetHeight;
        this.addWords.updateBoxHeight(total);
        this.result.updateHeight(total);
    }

    function addWordsToBox(e) {
        var word = e.word, logParam = this.result.logParam;
        if (word) {
            this.addWords.add([word.word]);
            if (e.goldFinger) {
                monitor.goldFinger(this.param, this.logParam, word, e.wordSeq);
            }
            monitor.addOneWord(this.param, this.logParam, logParam.sortType, logParam.sortOrder, 
                                word, e.wordSeq, e.type1Reason, e.recReason, e.attrList, this.filter.selectedFilterItems);
        } else {
            // 添加全部
            var words = this.result.getKeywords(), ret = [];
            if (words.length > 0) {
                fc.each(words, function(item) {
                    if (!item.isAdd) ret.push(item.word);
                });
                this.addWords.add(ret);
                monitor.addWords(this.param, this.logParam, logParam.sortType, logParam.sortOrder, words, this.filter.selectedFilterItems);
            }
        }
    }

    // 用添词输入框中的词去检测推词结果
    function checkRecommendResult(newWords) {
        var all = Keyword.groups2Keywords(getAllGroups.call(this)), ret = [];
        if (all.length === 0) return ret;

        // 更新所有关键词的状态
        var words = this.addWords.get();
        
        fc.each(all, function(item) {
            var match = !!(fc.grep(words, function(word) { return item.word === word; })[0]);
            if (!!item.isAdd !== match) {
                ret.push(item);
            }
            item.isAdd = match;
        });

        // 判断是否置灰“添加全部”按钮
        all = this.result.getKeywords() || newWords;
        var sum = 0;
        fc.each(all, function(item) {
            if (item.isAdd) sum++;
        });
        this.toolbar.addWords.disable(sum === all.length);        

        if (!fc.isArray(newWords)) { // 因为此方法用于用作event handler，所以这里判断一下
            this.result.changeKeywordsStatus(ret);
        }
        return ret;
    }

    // 获得所有关键词group，如果有业务点，也要加进来
    function getAllGroups() {
        var ret = (this.recommendResult && this.recommendResult.group) || [],
            businessPointData = this.result.businessPointData;
        if (businessPointData) {
            return ret.concat(businessPointData);
        }
        return ret;
    }
    
    function downloadKeyword(e) {
        this.result.download(e.fileType);
        var type = e.fileType === 'txt' ? 1 : 2, list = this.result.getKeywords();
        monitor.downloadWords(this.param, this.logParam, type, list, this.filter.selectedFilterItems);
    }

    function closeRecycleDialog(e) { // 关闭回收站对话框需要遍历还原的关键词的wordid，取消关键词置灰
        var groups = getAllGroups.call(this),
            list = util.getKeywordsByIds(groups, e.words);
        fc.each(list, function(word) {
            word.isDel = false;
        });
        this.result.changeKeywordsStatus(list);
    }

    function restoreKeyword(e) {
        monitor.restoreWord(this.param.entry, e.keyword);
    }

    function saveWordCompleted(e) {
        this.param.planid = e.plan.id;
        this.param.unitid = e.unit.id;

        var me = this;
        if (e.pattern) {
            var param = baidu.object.clone(this.param);
            param.keywords = e.keywords;
            param.unitname = e.unit.name;
            param.pattern = e.pattern;

            // 补流量。。。
            AddTrafficDialog.noRemind(function(noRemind) {
                if (noRemind) {
                    completed();
                } else {
                    var dialog = new AddTrafficDialog(param);
                    dialog.onclose = function(bySubmit) {
                        monitor.addTraffic(dialog.param, dialog.keywords, !!bySubmit, dialog.noRemind);
                        event.fire(me, KR.EVENT_CLOSE);
                    };
                }
            });
        } else {
            completed();
        }

        // 触发改价
        function completed() {
            Unit.checkMinBid(me.param.planid, me.param.unitid, e.keywords, function() {
                event.fire(me, KR.EVENT_CLOSE);
            });
        }
        monitor.saveWord(this.param, e.keywords.length, e.wMatch);
    }

    function changeColumn(e) {
        this.result.changeColumn(e.columns);
    }

    // 因为 param 需要设置 onSuccess 和 onFail，为了避免请求时重复创建函数，这里先定义好
    function initParam(planid, unitid, isInNewFlow, popup_entry) {
        var me = this,
            logParam = this.logParam,
            param = this.param = {
                logid: -1,
                planid: planid,
                unitid: unitid,
                entry: popup_entry ? popup_entry : 'kr_tools',
                query: '',
                regions: [],
                rgfilter: 1 // 高级设置，是否显示地域拓展词 0 显示 1 不显示
            };
        this.param.onSuccess = function(json) {
            me.isLoading = false;
            me.recommendResult = json.data;
            me.param.logid = json.data.logid != null ? json.data.logid : -1;

            var attr = me.recommendResult.attr, group = me.recommendResult.group, obj = {};
            if (me.param.querytype === 3 && group.length === 0) { hasNoActv.call(me); }
            else {
                var filterItems = util.formatFilterItems(attr, group),
                    wordItems = Keyword.groups2Keywords(group),
                    added = checkRecommendResult.call(me, wordItems);

                obj.totalNum = wordItems.length;
                obj.availableNum = wordItems.length - added.length;
                obj.filterAttr = filterItems;

                var reasons = filterItems[modules.FilterField.SHOW_REASON] || [];
                obj.recReason = fc.map(reasons, function(item) { return item.text; });

                me.filter.render(filterItems);
                me.result.render(group, util.getSearchTip(me.player && me.player.words));
            }
            sendLog(obj);
        };
        this.param.onFail = function(errorText, errorCode) {
            me.isLoading = false;
            me.recommendResult = null;
            var obj = { 
                isForbidden: errorCode == 1302 ? 1 : 0,
                isTooFreq: errorCode == 1301 ? 1 : 0
            };
            if (me.param.querytype === 3) { hasNoActv.call(me); }
            else { me.result.setTip(errorText); }
            sendLog(obj);
        };

        function sendLog(obj) {
            // 先重置为默认值
            logParam.totalNum = 0;
            logParam.availableNum = 0;
            logParam.isForbidden = 0;
            logParam.isTooFreq = 0;
            logParam.filterAttr = {};
            logParam.recReason = '';
            for (var key in obj) {
                logParam[key] = obj[key];
            }
            monitor.afterRequestRecommendResult(param, logParam);
        }
    }

    function hasNoActv() {
        this.result.setTip(config.TEXT_ACTV_EMPTY);                
        this.tab.switchToPasvTab(true);
    }

    // 量身/被动推荐统一用这个方法请求数据
    function requestRecommendResult() {
        this.filter.clean();
        this.toolbar.updateSize(0);
        this.result.loading();
        Keyword.recommend(this.param);
        // 监控
        this.logParam.krCol = this.result.logParam.columns.join(',');
        monitor.requestRecommendResult(this.param, this.logParam, this.player && this.player.words, this.player && this.player.urls);
    }

    return KR;

})($$);
