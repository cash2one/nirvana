/**
 * 排行榜推词模块
 * @author mayue@baidu.com
 * @params {object} options 控件初始化配置
 * <pre>
 * 配置项定义如下
 * {
 *     domId [string],[REQUIRED] 要生成排行榜推词的目标节点id，写法强烈依赖于dialog组件的名称规则
 *     givenId [string],[REQUIRED] 根据该模块语义给出的id，比如contenderWords，作为实例的标识
 *     titleArray [array],[REQUIRED] 表头各项id，仿照配置:['关键词', '指标1', '指标2']
 *     oringinKeys [array],[REQUIRED] TopN组件的keys值，参考topn组件keys参数,仿照配置:['word', 'value']
 *     downloadKeys [array],[REQUIRED] 用要下载词对象作参数的函数，与oringinKeys对应，类似oringinValues
 *     downloadName [string],[OPTIONAL] 下载词接口传入的标识名
 *     downloadIndustry [string],[OPTIONAL] 下载词接口传入的行业名
 *     barKey [array],[REQUIRED] 如果存在要显示成柱形条的数据渲染方式，必须配置该属性key，通过该key获取对应数据项，即topn中的barKey
 *     oringinValues [array],[REQUIRED] TopN组件的values值，参考topn组件values参数，仿照配置:[
 *         function(item) {
 *             var randomID = er.random();
 *             item.randomID = randomID;
 *             return '<input type="checkbox" id="randomID_' + randomID +
 *             '"/>&nbsp;<label for="randomID_' + randomID +
 *             '" title="' + item.word + '">' + item.word + '</label>';
 *         },
 *         function(item) {
 *             return '<div class="valueBar"/></div><span class="valueLiteral">约' + item.value + '</span>';
 *         }
 *     ]
 *     refreshTopn [function],[REQUIRED] 为topn组件放入数据的参数，仿照配置:function(){
 *         function onSuccess(response){
 *             me.words = response.data;
 *             me.topn.refresh(me.words);
 *         }
 *         var params = {
 *             onSuccess: onSuccess
 *         };
 *         fbs.mktinsight.getBusinessBoughtWords(params);
 *     }
 *     onAddWord [function],[OPTIONAL] 添加关键词时的回调，用于传入addQuery模块，做监控
 *     onAddWordSuccess [function],[OPTIONAL] 添加关键词成功时的回调，用于传入addQuery模块
 *     onDownload [function],[OPTIONAL] 下载关键词时的回调，做监控
 * }
 * </pre>
 */
function rankRec(options) {
    var me = this;
    me.domId = options.domId;
    me.givenId = options.givenId;
    me.downloadKeys = options.downloadKeys;
    if (options.downloadName) {
        me.downloadName = options.downloadName;
    }
    if (options.downloadIndustry) {
        me.downloadIndustry = options.downloadIndustry;
    }
    me.titleArray = options.titleArray;
    me.oringinKeys = options.oringinKeys;
    me.oringinValues = options.oringinValues;
    me.refreshTopn = options.refreshTopn;
    me.selectedWords = [];
    me.onAddWord = options.onAddWord;
    me.onAddWordSuccess = options.onAddWordSuccess;
    me.barKey = options.barKey;
    me.onDownload = options.onDownload;
    
    me.init();
}
rankRec.prototype = {
    init: function(){
        var me = this;
        baidu.g(me.domId).innerHTML = er.template.get('recRankWord');
        
        var headString = '<span class="column1"><input type="checkbox" id="' 
            + me.getCheckboxId(me.givenId) + '"/>&nbsp;<label for="' 
            + me.getCheckboxId(me.givenId) + '">' + me.titleArray[0] + '</label></span>';
        for (var i = 1; i < me.titleArray.length; i ++) {
            headString = headString + '<span class="column' + (i+1) + '">' + me.titleArray[i] + '</span>';
        }
        baidu.q('rank_rec_head', baidu.g(me.domId))[0].innerHTML = headString;
        
        me.topn = ui.util.create('TopN',{
            id: me.getTopnUiId(me.givenId),
            keys: me.oringinKeys,
            values: me.oringinValues,
            isfixed: false,
            barKey: me.barKey
        },baidu.q('rank_rec_body', baidu.g(me.domId))[0]);
        
        me.refreshTopn();
        //按钮组件
        me.downloadBtn = ui.util.create('Button', {
            'id': me.getDownloadBtnId(me.givenId)
        }, baidu.q('rankrec_download', baidu.g(me.domId))[0]);
        me.downloadBtn.setLabel("下载");
        me.addWordsBtn = ui.util.create('Button', {
            'id': me.getAddwordsBtnId(me.givenId)
        }, baidu.q('rankrec_addword', baidu.g(me.domId))[0]);
        me.addWordsBtn.setLabel("添加关键词");
        
        me.disableBtn(true);
        
        me.initEvents();
    },
    //通过用户给出id生成模块整体的标识
    getMainId: function(id) {
        return id + 'RecRank';
    },
    //通过用户给出id生成模块的checkbox全选按钮id
    getCheckboxId: function(id) {
        return this.getMainId(id) + 'Checkbox';
    },
    //通过用户给出id生成模块的download按钮id
    getDownloadBtnId: function(id) {
        return this.getMainId(id) + 'Download';
    },
    //通过用户给出id生成模块的addwords按钮id
    getAddwordsBtnId: function(id) {
        return this.getMainId(id) + 'Addwords';
    },
    //通过用户给出id生成模块的addwords按钮id
    getTopnUiId: function(id) {
        return this.getMainId(id) + 'Topn';
    },
    initEvents: function() {
        var me = this;
        // 点击"下载"按钮
        me.downloadBtn.onclick = function() {
            me.listenDownload();
        };
        
        // 点击"添加关键词"按钮
        me.addWordsBtn.onclick = function() {
            me.listenAddwords();
        };
        //主体部分监控
        var container = baidu.q('rank_rec', baidu.g(me.domId))[0];
        baidu.event.on(container, 'click', function(e) {
            me.listenContainer(e);
        });
    },
    listenDownload: function() {
        var me = this;
        var selectedWords = me.selectedWords;
        var wordsList = [];
        
        // 关键词去重
        selectedWords = me.distinctWords(selectedWords);
        
        // 取出字面量
        for (var key in selectedWords) {
            var queryArray = [];
            for (var num in me.downloadKeys) {
                queryArray.push(me.downloadKeys[num](selectedWords[key]));
            }
            var queryStr = queryArray.join(',');
            wordsList.push(queryStr);
        }
        
        var params = {wordsList: wordsList, moreWords: false};
        if (me.downloadName) {
            params.fileName = me.downloadName;
        }
        if (me.downloadIndustry) {
            params.industryName = me.downloadIndustry;
        }
        var form = baidu.q('download_words_form', baidu.g(me.domId))[0];
        form['userid'].value = nirvana.env.USER_ID;
        form['params'].value = baidu.json.stringify(params);
        if (me.onDownload) {
            me.onDownload();
        }
        form.submit();
    },
    listenAddwords: function() {
        var me = this;
        // 勾选的关键词
        var selectedWords = me.selectedWords,
        title = '添加关键词',
        datasource = [];
        
        //selectedWords = me.distinctWords(selectedWords);
        
        for (var key in selectedWords) {
            datasource.push({
                query: selectedWords[key].word
            });
        }
        
        var params = {
            title: title,
            datasource: datasource,
            upAction: me
        };
        if (me.onAddWord) {
            params.onAdd = function(datasource){
                me.onAddWord(datasource);
            };
        }
        if (me.onAddWordSuccess) {
            params.onAddSuccess = function(datasource){
                me.onAddWordSuccess(datasource);
            };
        }
        
        nirvana.util.openSubActionDialog({
            className: 'skin_keyword_add',
            id: 'AddKeywordDialog_MarketTrend',
            title: title,
            width: 1010,
            actionPath: '/tools/queryReport/addQuery',
            params: params,
            onclose: function() {
            }
        });
    },
    listenContainer: function(e) {
        var me = this;
        var input = me.getInput(e), id, checked;
        
        if (input) {
            id = input.id;
            checked = input.checked;
        } else {
            return;
        }
        
        words = me.words;
        
        // 勾选单个关键词
        if (/^randomID_([0-9a-zA-Z]+)$/.test(id)) {
            var randomID = RegExp.$1,
            word = me.findWord(randomID);
    
            if (checked) {
                me.selectWord(word);
            } else {
                me.unSelectWord(word);
            }
            
            // 最近x 天关键词展现排行 全选
        } else if (id == me.getCheckboxId(me.givenId)) {
            
            if (checked) {
                me.selectWords();
            } else {
                me.unSelectWords();
            }
        }
    },
    findWord: function(randomID) {
        var me = this;
        var i, word;
        for (i = 0; word = me.words[i]; i++) {
            if (word.randomID == randomID) {
                return word;
            }
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
        
        if (tagName === 'input' &&  target.type === 'checkbox') {
            return target;
        } else {
            var id = target['for'];
            return id ? baidu.g(id) : null;
        }
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
    selectWord: function(word) {
        this._selectWord(word, true);
    },
    unSelectWord: function(word) {
        this._selectWord(word, false);
    },
    /**
     * @param {Array} words 数组元素为{id: xx, word: xx, value: xx}
     */
    selectWords: function() {
        var me = this;
        for (var i = 0, word; word = me.words[i]; i++) {
            this.selectWord(word);
        }
    },
    unSelectWords: function() {
        var me = this;
        for (var i = 0, word; word = me.words[i]; i++) {
            this.unSelectWord(word);
        }
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
        }else{
            targetInput.checked = false;
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
        me.disableBtn(keys.length ? false : true);
    },
    reset: function(){
        var me = this;
        me.selectedWords = [];
        
    }
};