/*
 * 关键词推荐的核心行为逻辑抽象
 * @author mayue
 */
nirvana.KRCore = (function() {
    var event = fc.event;
    var T = baidu;
    /*
     * @constructor
     * @param {Object} result 词语显示模块，参照SKR的相应模块
     *  必须触发的事件有
     *   KRCore.EVENT_ADD_KEYWORD
     *   KRCore.EVENT_WORD_CHANGE
     *   KRCore.EVENT_WORD_SIZE_CHANGE
     *  必须具备的属性方法有
     *   getActiveKeywords
     *   getAllKeywords
     *   changeKeywordsStatus
     * @param {Object} addWords 词语收集模块，参照SKR的相应模块
     *  必须触发的事件有
     *   KRCore.EVENT_WORD_CHANGE
     *  必须具备的属性方法有
     *   add
     *   get
     * @param {Object} toolbar 批量添加模块，参照SKR的相应模块
     *  必须触发的事件有
     *   KRCore.EVENT_ADD_WORDS_TOBOX
     *  必须具备的属性方法有 
     *   updateSize
     * @param options 具体如下
     * {
     *     onafteraddall {Function} 全部添加后的回调
     *     onafterwordboxchange {Function} 提词栏词语变化时的回调
     * }
     */
    function KRCore(result, addWords, toolbar, options) {
        T.object.extend(this, options);
        
        this.result = result;
        this.addWords = addWords;
        this.toolbar = toolbar;
        this.addEvents();
    }
    KRCore.prototype = {
        addEvents: function() {
            event.on(this.result, KRCore.EVENT_ADD_KEYWORD, this.addWordToBox, this);
            event.on(this.toolbar, KRCore.EVENT_ADD_WORDS_TOBOX, this.addWordsToBox, this);
            event.on(this.addWords, KRCore.EVENT_WORD_CHANGE, this.onaddwordchange, this);
            event.on(this.result, KRCore.EVENT_WORD_CHANGE, this.checkRecommendResult, this);
            event.on(this.result, KRCore.EVENT_WORD_SIZE_CHANGE, this.changeWordSize, this);
        },
        addWordToBox: function(e) {
            var me = this;
            var word = e.word;
            if (word) {
                //记录本次填的词语
                checkSmart.call(me);
                me.result.smart.data.push(word);
                
                me.addWords.add([word]);
            }
        },
        addWordsToBox: function(e) {
            var me = this;
            var word = e.word;
            // 添加全部
            var words = me.result.getActiveKeywords(), ret = [];
            if (words.length > 0) {
                //记录本次填的词语
                checkSmart.call(me);
                me.result.smart.data = me.result.smart.data.concat(words);
                
                me.addWords.add(words);
            }
            
            me.onafteraddall && me.onafteraddall(words);
        },
        onaddwordchange: function() {
            var me = this;
            me.checkRecommendResult();
            
            me.onafterwordboxchange && me.onafterwordboxchange(me.addWords.keywordBox);
        },
        // 用添词输入框中的词去检测推词结果
        checkRecommendResult: function() {
            var all = this.result.getAllKeywords(), ret = [];
            if (all.length === 0) return ret;
    
            // 更新所有关键词的状态
            var words = this.addWords.get();
            var wordsMap = {};
            fc.each(words, function(word) {
                wordsMap[word] = true;
            });
            
            fc.each(all, function(item) {
                var flag = !!wordsMap[item.word];
                if (flag !== !!item.isAdd) {
                    ret.push(item);
                }
                item.isAdd = flag;
            });
    
            // 判断是否置灰“添加全部”按钮
            all = this.result.getActiveKeywords();
            this.toolbar.addWords.disable(0 === all.length);        
    
            this.result.changeKeywordsStatus(ret);
            
            return ret;
        },
        changeWordSize: function(e) {
            this.toolbar.updateSize(e.size);
        }
    }
    
    KRCore.EVENT_ADD_KEYWORD = 'add_keyword';
    KRCore.EVENT_ADD_WORDS_TOBOX = 'addwords_tobox';
    KRCore.EVENT_WORD_CHANGE = 'word_change';
    KRCore.EVENT_WORD_SIZE_CHANGE = 'word_size_change';
    
    function checkSmart() {
        var me = this;
        if (!me.result.smart.flag) {
            me.result.smart.flag = true;
            me.result.addSmartBtn();
        }
    }
    
    return KRCore;
})();

