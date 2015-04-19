/**
 * kr 左侧的添词模块
 * 包括提词篮 自动分组入口 计划单元选择器等
 * @param {HTMLElement} node KR模块节点
 * @param {Object} 其他参数 
 */
nirvana.skrModules.AddWords = function($) {

    var T = baidu,
        Button = fc.ui.Button,
        Bubble = fc.ui.Bubble,
        TextLine = fc.ui.TextLine,
        Keyword = fc.common.Keyword,
        config = nirvana.skrConfig,
        util = nirvana.skrUtil,
        event = fc.event;

    // 如果传入了 planid 和 unitid，需要禁止选择
    function AddWords(node, options) {
        T.object.extend(this, options);
        
        this.num = $('.selected_num', node)[0];
        
        this.keywordBox = new TextLine($('.word_box', node)[0]);
		
        $('#krAddWordLimit')[0].innerHTML = WORD_NUMBER_INPUT_MAX;
        
        addEvents.call(this);
    }

    AddWords.prototype = {
        /*
         * 添加词语
         * @param {Array} words 词语字面组成的数组
         */
        add: function(words) {
            var box = this.keywordBox, len = this.get().length,
                rest = WORD_NUMBER_INPUT_MAX - len;
            
            if (words.length <= rest) {
                box.append(words);
            } else {
                openAddWordsDialog(rest, function() {
                    box.append(words.slice(0, rest));
                });
            }
        },
        set: function(words) {
            this.keywordBox.text(words);
            this.keywordBox.onchange();
        },
        /*
         * 获取已有词语
         * @return {Array} 词语字面组成的数组
         */
        get: function() {
            return getKeywordsFromText(this.keywordBox.value());
        },
        updateBoxHeight: function(containerHeight) {
            // 先设置成0，别影响正常取值
            this.keywordBox.height(0);
            var ret = containerHeight - totalHeight;
            this.keywordBox.height(Math.max(ret, 200)); // 最低200px
        },
        dispose: function() {
            this.keywordBox.dispose();
        }
    };

    // 除去添词框，其他部分的总高度
    var totalHeight = 90;
    var WORD_NUMBER_INPUT_MAX = 1000;
    
    function addEvents() {
        var me = this;
        
        this.keywordBox.onchange = function() {
            event.fire(me, nirvana.KRCore.EVENT_WORD_CHANGE);
            // 更新顶部的数字
            me.num.innerHTML = me.get().length;
        };
    }
    
    function openAddWordsDialog(num, callback) {
        var content;
        if (num > 0) {
            content = '由于数量限制，本次仅可添加<strong>' + num + '</strong>个关键词，请您确认是否继续。';
        } else {
            content = '您添加的关键词数量已经达到上限';
        }
    
        ui.Dialog.confirm({
            title: '请您确认',
            content: content,
            forTool: true,
            onok: function() {
                if (num > 0) {
                    callback();
                }
            }
        });
    }

    return AddWords;

}($$);
