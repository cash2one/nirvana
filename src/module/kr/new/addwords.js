/**
 * kr 左侧的添词模块
 * 包括提词篮 自动分组入口 计划单元选择器等
 */
nirvana.krModules.AddWords = function($) {

    var Button = fc.ui.Button,
        Bubble = fc.ui.Bubble,
        TextLine = fc.ui.TextLine,
        PlanUnitSelector = fc.ui.PlanUnitSelector,
        Keyword = fc.common.Keyword,
        KeywordError = fc.common.Error.KEYWORD.SAVE,
        util = nirvana.krUtil,
        event = fc.event;

    // 如果传入了 planid 和 unitid，需要禁止选择
    function AddWords(node, param) {
        this.num = $('.selected_num', node)[0];
        this.error = $('.error', node)[0];
        this.autoUnit = $('.auto_unit', node)[0];
        
        this.matchBubble = new Bubble($('.bubble_match_pattern', node)[0], { source: 'match_pattern' });
        this.keywordBox = new TextLine($('.word_box', node)[0]);
		
        // 保存按钮的宽度需要大一些，这样左边才不会被挡住
		param.saveWidth = 95;
        this.selector = new PlanUnitSelector($('.plan_unit_selector', node)[0], param);

        if (param.unitid && param.disableUnit) {
            fc.hide(this.autoUnit);
        } else {
            this.autoUnitBtn = new Button($('.button', this.autoUnit)[0], { icon: 'fc_icon_auto_unit' });
            this.autoUnitBubble = new Bubble($('.bubble', this.autoUnit)[0], { source: 'auto_unit' });
        }

        addEvents.call(this);

        // 从本地存储中读取关键词
        var me = this;
        Keyword.getKeywordsFromStorage(function(words) {
            if (words.length > 0) me.set(words);
            if (param.words) me.add(param.words);
        });
    }

    AddWords.prototype = {

        add: function(words) {
            // 去重
            var exist = this.get();
            for (var i = words.length - 1; i >= 0; i--) {
                if (fc.inArray(words[i], exist) !== -1) {
                    words.splice(i, 1);
                }
            }

            var box = this.keywordBox, len = this.get().length,
                rest = WORD_NUMBER_INPUT_MAX - len;
            
            if (words.length <= rest) {
                box.append(words);
            } else {
                util.openAddWordsDialog(rest, function() {
                    box.append(words.slice(0, rest));
                });
            }
            this.keywordBox.onchange();
        },

        set: function(words) {
            this.keywordBox.text(words);
            this.keywordBox.onchange();
        },

        get: function() {
            return getKeywordsFromText(this.keywordBox.value());
        },

        showAutoUnit: function() {
            if (this.autoUnitBtn) {
                fc.show(this.autoUnit);
                event.fire(window, 'resize');
            }
        },

        hideAutoUnit: function() {
            fc.hide(this.autoUnit);
            event.fire(window, 'resize');
        },

        showError: function(error) {
            if (!error) {
                this.hideError();
                return;
            }
            this.error.innerHTML = error;
            fc.show(this.error);
            event.fire(window, 'resize');

            var me = this;
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(function() {
                me.hideError();
                me.timer = null;
            }, 60 * fc.SECOND);
        },
        
        hideError: function() {
            if (this.error) {
                fc.hide(this.error);
                event.fire(window, 'resize');
            }
        },

        updateBoxHeight: function(containerHeight) {
            // 先设置成0，别影响正常取值
            this.keywordBox.height(0);
            var ret = containerHeight - totalHeight;
            if (fc.css(this.error, 'display') !== 'none') {
                ret -= errorHeight;
            }
            if (fc.css(this.autoUnit, 'display') !== 'none') {
                ret -= autoUnitHeight;
            }
            this.keywordBox.height(Math.max(ret, 200)); // 最低200px
        },

        dispose: function() {
            this.keywordBox.dispose();
            this.matchBubble.dispose();
            this.autoUnitBtn && this.autoUnitBtn.dispose();
            this.autoUnitBubble && this.autoUnitBubble.dispose();
            this.selector.dispose();
        }
    };

    // 除去添词框, 错误提示框, 自动分组按钮，其他部分的总高度
    var totalHeight = 216;
    // 错误提示框的高度
    var errorHeight = 60;
    // 自动分组按钮的高度
    var autoUnitHeight = 32;
    
    function addEvents() {
        var me = this, selector = this.selector;
        
        this.keywordBox.onchange = function() {
            event.fire(me, nirvana.KR.EVENT_WORD_CHANGE);
            // 更新顶部的数字
            me.num.innerHTML = me.get().length;
            if (selector.status == 2) {
                if (fc.trim(this.value())) {
                    selector.save.disable(false);
                } else {
                    selector.save.disable(true);
                }
            }
            Keyword.saveKeywordsToCache(me.get());
        };

        if (this.autoUnitBtn) {
            this.autoUnitBtn.onclick = function() {
                event.fire(me, nirvana.KR.EVENT_AUTO_UNIT_CLICK);
            };
        }
        selector.isSaveEnable = function() {
            return !!fc.trim(me.keywordBox.value());
        };
        selector.onplanselect = function() {
            me.showAutoUnit();
        };
        selector.onunitselect = function() {
            me.hideAutoUnit();
        };
        selector.onsave = function(pattern, plan, unit, callback) {
            var words = me.get();
            if (words.length === 0) {
                me.showError(nirvana.config.LANG.WORD.ADD_ERR_0);
                return;
            }
            if (words.length > WORD_NUMBER_INPUT_MAX) {
                me.showError(nirvana.config.LANG.WORD.ADD_ERR_2);
                return;
            }
            for (var i = 0, len = words.length; i < len; i++) {
                if (getLengthCase(words[i]) > KEYWORD_MAXLENGTH) {
                    me.showError(nirvana.config.LANG.WORD.ADD_ERR_4);
                    return;
                }
            }
            saveKeywords.call(me, plan, unit, pattern, words, callback);
        };
    }

    function saveKeywords(plan, unit, pattern, keywords, callback) {
        var me = this;
        Keyword.save({
            planid: plan.id,
            unitid: unit.id,
            pattern: pattern === -1 ? 0 : pattern,
            keywords: keywords,
            onSuccess: function(json) {
                me.set([]);
                Keyword.saveKeywordsToStorage([]);
                me.hideError();

                event.fire(me, {
                    type: nirvana.KR.EVENT_SAVE_WORD_COMPLETED,
                    plan: plan,
                    unit: unit,
                    pattern: pattern === -1 ? 0 : pattern,
                    keywords: json.data,
                    wMatch: pattern   // 监控                                
                });
                event.fire(me, nirvana.KR.EVENT_REFRESH);
                callback();
            },
            onFail: function(json, errorKeywords) {
                var keywords = fc.keys(errorKeywords);
                me.set(keywords);
                Keyword.saveKeywordsToStorage(keywords);
                me.showError(KeywordError.getText(errorKeywords));
                event.fire(me, nirvana.KR.EVENT_REFRESH);
                callback();
            }
        });
    }

    return AddWords;

}($$);
