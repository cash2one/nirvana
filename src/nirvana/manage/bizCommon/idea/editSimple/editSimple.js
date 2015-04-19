/**
 * 编辑创意的精简版
 *
 * @author zhujialu
 * @date 2012/6/11
 */
nirvana.idea = nirvana.idea || {};

nirvana.idea.simpleEdit = function($) {

    var
    // 每个输入框的信息
    INPUT = {
        title: {
            index: 1,
            max: 50,
            placeholder: '请输入创意标题，可包含'
        },
        desc1: {
            index: 2,
            max: 80,
            placeholder: '请为创意描述一句话，可包含'
        },
        desc2: {
            index: 3,
            max: 80,
            placeholder: '请为创意再描述一句话，可包含'
        },
        url: {
            index: 4,
            max: 36,
            placeholder: '请输入访问网址'
        }
    };

    // 第一个模块，引导词
    // 负责显示 引导词 和 “试试其他同类关键词”
    /**
     * @param {HTMLElement} elem 容器元素
     * @param {Object} param 外部传入的参数
     */
    function GuideWord(elem, param) {
        // 引导词
        this.wordNode = $('.word', elem)[0];

        // 试试其他同类关键词
        this.tryOtherNode = $('.try-other', elem)[0];

        this.param = param;

        var me = this;
        this.tryOtherNode.onclick = function() {
            me.openSimilarWords();
        };
    }

    GuideWord.prototype = {

        /**
         * 设置引导词
         * @param {Array} unitid 引导词所在的单元
         * @param {string} word 引导词
         */
        setWord: function(unitid, word) {
            this.unitid = unitid;
            this.word = word;
            this.wordNode.innerHTML = word;
        },

        openSimilarWords: function() {
            if (this.param.from === 'quicksetup') {
                // 点击 试试其他关键词 监控
                nirvana.quickSetupLogger('quicksetup_step4_showGuideWord');
            }

            var me = this;
            getSimilarWords(this.unitid, function(list) {
                if (list.length > 0) {
                    nirvana.util.openSubActionDialog({
                        id : 'similarWords',
                        title : '同类关键词',
                        width : 570,
                        maskLevel: 2,
                        actionPath : 'overview/similarWords',

                        params : {
                            words: list,
                            onsubmit : function(word) {
                                fc.event.fire(me, {
                                    type: 'change',
                                    word: word
                                })
                            }
                        }
                    });
                }
            });
        }
    };

    /**
     * 获得同类关键词
     * @param {Array} unitid
     */
    function getSimilarWords(unitid, callback) {
        fbs.idea.getSimilarWords({
            condition: {
                unitid: unitid
            },
            onSuccess: function(json) {
                var data = json.data || { };
                callback(data.listData || []);
            },
            onFail: function(json) {
                callback([]);
            }
        });
    }


    // 第二个模块：预览
    function Preview(node, matchbox) {
        var Input = fc.ui.Input;
        this.input = {
            title : new Input($('#titleInput', node)[0]),
            desc1 : new Input($('#desc1Input', node)[0]),
            desc2 : new Input($('#desc2Input', node)[0]),
            url : new Input($('#urlInput', node)[0])
        };

        var preview = $('.new-idea-preview', node)[0];
        preview.innerHTML = createIdeaHtml();        
        this.preview = {
            title : $('.title', preview)[0],
            desc : $('.desc', preview)[0],
            url : $('.url', preview)[0]
        };

        // 注册url
        this.url = null;

        this.tip = $('.tip', node)[0];
        this.matchbox = matchbox;


        this.initInput('title');
        this.initInput('desc1');
        this.initInput('desc2');
        this.initInput('url');
    }

    Preview.prototype = {

        /**
         * 初始化输入框的事件
         * @param {string} id 输入框对应的id
         */
        initInput: function(id) {
            var me = this, input = this.input[id];

            input.onfocus = function() {
                me.tip.style.display = '';
                me.setTip(id);
                me.toggleMatch(null, id);
                // 控制focus时，如果当前为空，则放入word
                if(id != 'url' && this.value() == ''){
                    this.value(me.guideWord);
                }
                // 因为 value 会变，所以要调 onchange
                this.onchange();
            };
            input.onblur = function() {
                // 控制blur时，如果当前为word，则重置为空
                if(id != 'url' && this.value() == me.guideWord){
                    this.value('');
                }
                me.tip.style.display = 'none';
                me.toggleMatch(null, id);

                // 因为 value 会变，所以要调 onchange
                this.onchange();
            };
            input.onchange = function() {
                me.setPreview(id)
                me.setTip(id);
            };
        },

        /**
         * 设置输入框的值
         */
        setInput: function(id, placeholder, value) {
            var input = this.input[id];

            if (placeholder != null) {
                input.placeholder(placeholder);
            }
            if (value != null) {
                input.value(value);
            }

            // 预览要保持一致
            this.setPreview(id);  
        },

        /**
         * 设置预览的文本
         * @param {string} id 具体哪个字段
         */
        setPreview: function(id) {
            var isdesc = id.indexOf('desc') === 0,
                input = this.input,
                elem = isdesc ? this.preview.desc : this.preview[id],
                value;

            if (isdesc) {
                // 截断
                var desc1 = slicePreview(
                    input.desc1.value() || input.desc1.placeholder(),
                    INPUT.desc1.max
                );
                
                var desc2 = slicePreview(
                    input.desc2.value() || input.desc2.placeholder(),
                    INPUT.desc2.max
                );

                value = lib.idea.getPreview(desc1, this.guideWord)
                      + lib.idea.getPreview(desc2, this.guideWord);

            } else {
                input = input[id];
                value = slicePreview(
                    input.value() || input.placeholder(),
                    INPUT[id].max
                );

                value = lib.idea.getPreview(value, this.guideWord);
            }

            elem.innerHTML = value;
        },

        setTip: function(id) {
            var value = this.input[id].value();

            var len = IDEA_CREATION.getLength(value),
                rest = INPUT[id].max - len;
            this.tip.innerHTML = rest >= 0 ? '你还可以输入' + rest + '个字符' : '已经超过字符长度限制';
        },

        toggleMatch: function(ismatch, id) {
            if (ismatch == null) {
                ismatch = this.matchbox.checked;
            } else {
                this.matchbox.checked = ismatch;
            }

            var input = this.input,
                word = this.guideWord,
                fn = ismatch ? match : unmatch;

            if (id) {
                if (input[id].value()) {
                    this.setInput(id, null, fn(input[id], word)) 
                }
            } else {
                this.toggleMatch(ismatch, 'title');
                this.toggleMatch(ismatch, 'desc1');
                this.toggleMatch(ismatch, 'desc2');
            }
        },

        /**
         * 设置引导词
         */
        setWord: function(word) {
            this.guideWord = word;
            this.changeWord();

            this.setInput('title', INPUT.title.placeholder + word);
            this.setInput('desc1', INPUT.desc1.placeholder + word + '。');
            this.setInput('desc2', INPUT.desc2.placeholder + word + '。');
        },

        /**
         * 每次进到新的一组时，会把{xxx}中的xxx代替为 当前引导词
         */
        changeWord: function(id) {
            if (id != null) {
                var input = this.input[id], value = input.value();
                if (value) {
                    value = value.replace(/{[^{}]*?}/g, '{' + this.guideWord + '}');
                    input.value(value);
                }
            } else {
                this.changeWord('title');
                this.changeWord('desc1');
                this.changeWord('desc2');
            }
        },

        /**
         * 获得当前输入框的值组成的创意
         * 即发给后端的数据
         */
        getIdea: function() {
            var input = this.input, trim = baidu.string.trim;

            return {
                title: trim(input['title'].value()),
                desc1: trim(input['desc1'].value()),
                desc2: trim(input['desc2'].value()),
                url: this.url,
                showurl: trim(input['url'].value())
            };
        },
        validate: function(errorNode) {
            var idea = this.getIdea();

            // 按顺序来吧
            var ret = checkError('title', idea.title, errorNode);
            if(!ret) return ret;
                
            ret = checkError('desc1', idea.desc1, errorNode);
            if(!ret) return ret;

            ret = checkError('desc2', idea.desc2, errorNode);
            if(!ret) return ret;

            ret = checkError('url', idea.showurl, errorNode);
            if(!ret) return ret;

            return ret;
        }
    };

    function slicePreview(text, max) {
        var len = IDEA_CREATION.getLength(text);
        if (len <= max) {
            return text;
        } else {
            return text.slice(0, max);
        }
    }


    /**
     * 推荐创意
     */
    function RecommendIdea(node) {
        this.node = node;
    }

    RecommendIdea.prototype = {

        /**
         * 刷新推荐创意，如果不足 3 条创意，隐藏元素
         * @param {Array} ideas
         */
        refresh: function(ideas) {
            if (ideas.length === 3) {
                fc.show(this.node);

                var html = '';
                fc.each(ideas, function(idea) {
                    html += createIdeaHtml(idea, '创意参考示例');
                });
                $('.idea-list', this.node)[0].innerHTML = html;

            } else {
                fc.hide(this.node);
            }
        }
    };

    /**
     * 创建创意的HTML结构
     */
    function createIdeaHtml(idea, title) {
        idea = idea || { };
        // 确保别显示 undefined
        for (var key in idea) {
            idea[key] = idea[key] || '';
        }

        var html = '<div class="idea" title="' + (title || '') + '">'
                 +     '<h1 class="title">' + idea.title + '</h1>'
                 +     '<p class="desc">' + idea.desc1 + idea.desc2 + '</p>'
                 +     '<p><em class="url">' + idea.url + '</em> - <a>百度推广</a></p>'
                 + '</div>';

        return html;
    }


    /**
     * 此方法只负责初始化界面，包括绑定事件
     */ 
    function initUI() {
        var config = this._config, container = this._elem;

        ui.util.create('Button', config.save, $('#saveIdea', container)[0]);
        fc.ui.init($('.ui-bubble', container));

        this._saveBtn = ui.util.get('saveIdea');
        this._writeLater = $('.operate > a', container)[0];
        this._error = $('.error', container)[0];
        this._backTo = $('.footer > a', container)[0];
        
        this._select = $('#selectIdeaItem', container)[0];

        var me = this;
        
        this._backTo.onclick = function() {
            me.batchAddIdea();
        };
        this._saveBtn.onclick = function() {
            // 如果用户最后用输入了引导词，点击保存时却要处理一下
            me.preview.toggleMatch();

            // 验证
            if (me.preview.validate(me._error)) {
                var idea = me.preview.getIdea();
                lib.idea.formatData(idea);

                if (me._param.from === 'quicksetup') {
                    /**
                     * 保存创意监控
                     */
                    nirvana.quickSetupLogger('quicksetup_step4_saveidea', {
                        type : 1
                    });
                }
                // fbs.idea.addGroupIdea({
                // 2013.03.22 批量入库迁移至vega
                // by Leo Wang(wangkemiao@baidu.com)
                fbs.vega.addBatchIdea({ 
                // fbs.idea.addGroupIdea({
                    // condition: {
                    //     unitid: me._groups[me._index].unitid
                    // },
                    items: idea,
                    unitids: me._groups[me._index].unitid,
                    
                    onSuccess: function(json) {
                        lib.idea.cleanCache();
                        
                        /**
                         * 监控精简版保存创意成功，用于quicksetup中
                         */
                        nirvana.quickSetupLogger('quicksetup_step4_ideasaved', {
                            type : 1
                        });

                        if (json.error) {
                            json.status = 500;
                            return;
                        }

                        // 创意写回发送请求，不理会response
                        fbs.eos.recmIdeasWirteBack({
                            items: json.data,
                            condition: {
                                unitid: me._groups[me._index].unitid
                            },
                            callback: new Function
                        });

                        if (!me._groups[me._index].idea) {
                            me._completed++;
                        }
                        if (me._completed === me._total) {
                            /**
                             * 监控精简版保存创意成功，且流程结束，用于quicksetup中
                             */
                            nirvana.quickSetupLogger('quicksetup_step4_ideafinish', {
                                type : 1
                            });
                            me._param.nextStep && me._param.nextStep();
                        } else {
                            // showurl是后端需要才加的，前端不要这个
                            idea = me.preview.getIdea();
                            idea.url = idea.showurl;
                            delete idea.showurl;

                            me._groups[me._index].idea = idea;
                            me._idea = idea;
                            me.selectGroup();
                        }
                    },
                    onFail: function(json) {
                        var error = lib.idea.error(json), msg;
                        for (var key in error) {
                            msg = error[key];
                            // 这个模块不可编辑访问URL
                            if (key !== 'url') {
                                key = key === 'showurl' ? 'url' : key;
                                me._error.innerHTML = (INPUT[key] && INPUT[key].index ? INPUT[key].index + '：' : '') + msg;
                                return;
                            }
                        }
                        me._error.innerHTML = '数据读取异常';
                    }
                })
            }
        };

        this._matchbox = $('.options :checkbox', this._elem)[0];
        this._matchbox.onclick = function() {
            // 通配符
            if (me._param.from === 'quicksetup') {
                /**
                 * 是否作为通配符监控
                 */
                nirvana.quickSetupLogger('quicksetup_step4_useAsMatch',{
                    type : me._matchbox.checked ? 1 : 0
                });
            }
            
            me.preview.toggleMatch();
        };
    }

    /**
     * 开启通配符
     * @param {Input} input
     * @param {string} word 当前引导词
     */
    function match(input, word) {
        var expr = new RegExp(word, 'g'),
            value = input.value();
        return value.replace(expr, function($0) {
            var index = arguments[arguments.length - 2];
            if (index > 0) {
                // 判断两边是否有{ }
                if (value.charAt(index - 1) === '{' && value.charAt(index + word.length) === '}') {
                    return $0;
                }
            }
            return '{' + word + '}';
        });
    }

    /**
     * 删除通配符
     * @param {Input} input 
     * @param {string} word 当前引导词
     */
    function unmatch(input, word) {
        var expr = new RegExp('{' + word + '}', 'g');
        return input.value().replace(expr, word);
    }

    /**
     * @param {string} id 哪个输入框，可选值有 title, desc1, desc2, url
     * @param {string} value 输入框的值
     * @param {HTMLElement} errorNode 显示错误信息的节点
     */
    function checkError(id, value, errorNode) {
        var len = IDEA_CREATION.getLength(value),
            error = '', prefix = INPUT[id].index + '：'; 

        if (len > INPUT[id].max) {
            error = prefix + '你最多可以输入' + INPUT[id].max + '个字符';
        } else if (id !== 'desc2' && len === 0) {
            error = prefix + '不能为空';
        } else if ((id === 'title' || id === 'desc1') && len <= 8) {
            error = prefix + '为保障展现效果，请输入超过8个字符';
        } else if (id !== 'url' && /{.*?}/g.test(value)) {
            var matchs = value.match(/{(?:.*?)}/g), 
                i = matchs.length, expr = /[{}]/, ret;
            while (i--) {
                if (expr.test(matchs[i].slice(1, -1))) {
                    ret = true;
                    break;
                }
            }
            if (ret) {
                error = prefix + '你的创意中可能包含错误的通配符';
            }
        }

        errorNode.innerHTML = error;
        return error === '';
    }

    /**
     * 获得UI组件的初始配置
     */
    function getUIConfig() {
        return {
            select : {
                id : 'selectIdeaItem',
                datasource : [{
                    text : '',
                    value : ''
                }],
                width : 110
            },

            save : {
                id : 'saveIdea'
            }
        };
    }

    // 实例化给外部使用的对象
    function SimpleEdit(param) {
        this._param = param;

        // 初始化一堆属性
        // 罗列这太难看了。。。
        initProperties.call(this);

        // 先隐藏，拿到数据后再显示，避免没数据切换标准版产生的掠影
        this._param.dialog.hide();

        initUI.call(this);
        
        var me = this;

        // 引导词模块
        this.guideWord = new GuideWord(this._elem, param);
        fc.event.on(this.guideWord, 'change', function(e) {
            me.setGuideWord(e.word);
        });

        this.preview = new Preview(this._elem, this._matchbox);
        this.recomIdea = new RecommendIdea($('#recommend-idea', this._elem)[0]);

        // 获得用户的 URL
        fbs.idea.getURL({
            onSuccess : function(json) {
                var url = json.data.url;
                me.preview.url = url;
                me.preview.setInput('url', INPUT.url.placeholder, url);

                me.getGroups();
            }
        });

        return this._elem;
    }


    SimpleEdit.prototype = {
        // 重置所有数据
        reset: function() {
            this._groups = { };
            this._idea = null;
            this._index = 0;
            this._total = 0;
            this._completed = 0;
            this._recommendIdeaCache = { };
            this._config = getUIConfig();

            var preview = this.preview;
            preview.setInput('title', null, '');
            preview.setInput('desc1', null, '');
            preview.setInput('desc2', null, '');
            preview.setInput('url', null, preview.url);

            this._writeLater.title = '至少保存一条创意哦';
            this._writeLater.onclick = null;
            
            var me = this;
            this.getGroups(true);
        },
        getTpl: function() {
            return lib.tpl.getTpl('addIdeaGuide');
        },
        
        getGroups: function(isreset) {
            var me = this;

            fbs.idea.getGroups({
                onSuccess : function(json) {
                    var groups = (json.data && json.data.grouplist) || [];

                    // 没数据的情况
                    if (groups.length === 0) {
                        // 让他跳进onFail
                        json.status = 500;
                        return;
                    }
                    
                    me._total = groups.length;
                    me.initGroups(groups);

                    me.selectGroup(0);
                },
                onFail: function() {
                    // 如果是从标准版切回来的
                    if (isreset) {
                        // 跳到部分成功页
                        me._param.nextStep(true);
                    } else {
                        // 打开标准版
                        me.batchAddIdea();
                    }
                }
            });
        },
        /**
         * 初始化 this._groups
         * 把每组的 unitid 设置好，便于跳到某一步时，可以获得对应的 unitid
         * @param {Array} unitids
         */
        initGroups: function(unitids) {
            for (var i = 0, len = unitids.length; i < len; i++) {
                this._groups[i] = { unitid : unitids[i] };
            }
        },
        
        /**
         * 选择某组后需要更新界面
         * @param {number=} index 组索引
         */
        selectGroup: function(index) {
            var me = this;
            if (index == null) {
                index = this.getNextUndo();
            }
            
            // 获取推荐创意
            // 引导词会随着这个请求一起返回
            this.getRecommendIdea(index, function() {
                me._param.dialog.show();
                me._index = index;
                me.refresh(index);

                // 默认勾选 "以 xxx 作为通配符"
                me.preview.toggleMatch(true);
            });
        },

        refresh: function(index) {
            this.setSelect(index);
            this.refreshInputs(index);
            this.refreshButton(index);

            // 设置剩余数
            $('.idea-rest', this._elem)[0].innerHTML = this._total - this._completed;
            // 错误提示置空
            this._error.innerHTML = '';
        },
        refreshInputs: function(index) {
            var idea = this._groups[index].idea || this._idea,
                preview = this.preview;

            if (idea) {
                preview.setInput('title', null, idea.title);
                preview.setInput('desc1', null, idea.desc1);
                preview.setInput('desc2', null, idea.desc2);
            }
            preview.setInput('url', null, idea ? idea.url : preview.url);
        },
        refreshButton: function(index) {
            this._saveBtn.setLabel('保存创意');
            fc.show(this._writeLater);

            // 如果是最后一组，需要设置 保存按钮 和 隐藏“将来再写”
            if (this._total === this._completed + 1) {
                this._saveBtn.setLabel('保存并下一步');
                fc.hide(this._writeLater);
            } else if (this._completed === 1) {
                var me = this;

                this._writeLater.title = '';
                this._writeLater.onclick = function() {
                    nirvana.quicksetup.control.leaveEditIdea(function() {
                        /**
                         * 监控，第四步中点击以后再写
                         */
                        nirvana.quickSetupLogger('quicksetup_step4_writelater', {
                            type : 1
                        });
                        me._param.nextStep && me._param.nextStep(true);
                    });
                };
            }
        },

        /**
         * 设置 Select 组件的配置
         * 每次进入新的一组都要重置 Select 组件
         * Select 没有刷新方法，只能每次都创建一遍。。。。
         */
        setSelect : function(index) {
            var me = this, 
                groups = this._groups, 
                config = this._config.select.datasource;

            config.length = 0;

            for(var i in groups) {
                i = +i;
                config[i] = {
                    text : '<span class="' + (groups[i].idea ? 'new-idea-done' : 'new-idea-undo') + '"></span>第' + (i + 1) + '条',
                    value : i
                };
            }

            ui.util.create('Select', this._config.select, this._select);

            var uiSelect = ui.util.get('selectIdeaItem');
            uiSelect.onselect = function(value) {
                me.selectGroup(value);
            };
            uiSelect.setValue(this._index);
        },

        /**
         * 获得推荐创意
         * 会连发两个请求（当前和下一个），这个接口比较慢
         * 这样切换起来感觉快些
         * @param {number} index 第几组
         * @param {Function} callback 
         */
        getRecommendIdea: function(index, callback) {
            var me = this,
                group = this._groups[index],
                unitid = group.unitid,
                cache = this._recommendIdeaCache;
            
            if (cache[index]) {
                onSuccess(cache[index]);
            } else {
                // 3 秒超时
                getRecommendIdea(group.unitid, function(data) {
                    data = data || cache[index];
                    if (!data) {
                        me.batchAddIdea(false);
                    } else {
                        cache[index] = data;
                        onSuccess(data);
                    }
                }, 3);
            }

            // 如果还有下一个的话，提前请求
            var next = this.getNextUndo();
            if (next != null && !cache[next]) {
                // 10 秒超时
                getRecommendIdea(this._groups[next].unitid, function(data) {
                    if (!cache[next] && data) {
                        cache[next] = data;
                    }
                }, 10);
            }


            // 成功部分的逻辑
            function onSuccess(data) {
                callback();

                // 返回的创意列表没有 url，这里要补上
                fc.each(data.recmideas, function(idea) {
                    idea.url = me.preview.url;
                });

                me.setGuideWord(data.targetword, data.hasmore);
                me.recomIdea.refresh(data.recmideas);
            }
        },
        /**
         * 获得下一个没完成的组号
         * @return {number} 序号从0开始
         */
        getNextUndo: function() {
            var groups = this._groups, cur = this._index, ret;
            for(var key in groups) {
                if(key != cur && !groups[key].idea) {
                    ret = key;
                    break;
                }
            }
            if (ret != null) {
                return + ret;
            }
        },
        /**
         * 设置引导词
         * @param {string} word 引导词
         * @param {boolean} hasMore 是否有更多引导词，这将决定是否显示"试试其他引导词"
         */
        setGuideWord : function(word, hasMore) {
            // 更新百度搜索框
            var searchInput = $('.search-input', this._elem)[0];
            searchInput.innerHTML = word;

            // 引导词都用 word 作为 className
            fc.each($('.word', this._elem), function(node) {
                node.innerHTML = word;
                node.title = word;
            });

            this.preview.setWord(word);
            this.guideWord.setWord(this._groups[this._index].unitid, word);

            if (typeof hasMore === 'boolean') {
                var tryOther = this.guideWord.tryOtherNode;
                fc[hasMore ? 'removeClass' : 'addClass'](tryOther, 'disable');
            }
        },
        
        batchAddIdea: function(showBack) {
            var me = this,
                group = this._groups[me._index],
                unitid = group && group.unitid,
                dialog = this._param.dialog,
                showBack = typeof showBack === 'undefined' ? true : showBack;

            // 隐藏
            dialog.hide();
            
            nirvana.manage.batchIdea.tree = [];

            lib.idea.addIdea({
                unitid: unitid,
                batch: {
                	isbatch: true,
                	type: 'default'
                },
                showBack: showBack,
                maskLevel: 2,
                backToSimple: function() {
                    dialog.show();
                    me.reset();
                },
                onclose: function() {
                    nirvana.quicksetup.hide();
                }
            }, function() {
                // 跳到成功页
                me._param.nextStep();
            })
        }
    };


    function initProperties() {
        // key - value, key 是索引，value 如下：
        // {
        //
        //  unitid: [],    // 通过unitid获取同类关键词
        //  data: [],	   // 表示该组的同类关键词
        //  idea: null/{}  // 如果该组创意保存成功，记录之; 否则为null
        // }
        this._groups = { };
        
        // 当前带入的创意信息，保存创意成功后会带入到下一组
        this._idea = null;

        // 当前第几组,从0开始计数
        this._index = 0;

        // 总共完成了几组
        this._total = 0;
        this._completed = 0;

        // 推荐创意的 cache
        this._recommendIdeaCache = { };

        // UI配置
        this._config = getUIConfig();

        // ============= 下面是HTMLElement相关 =============

        // 预览部分
        this._preview = null;

        // 右上角的提示
        this._tip = null;
        
        // 开启通配符的checkbox
        this._matchbox = null;

        // 保存按钮
        this._saveBtn = null;
        
        // 将来再写 按钮
        this._writeLater = null;
        
        // 显示错误的元素
        this._error = null;
        
        // “回到标准版”按钮
        this._backTo = null;

        // Select 控件对应的元素，重绘需要
        this._select = null;

        // 四个 Input 控件
        this._input = null;

        // 创建给外部使用的元素，return时直接扔出去
        // 在获取后重新设置，这里重点是要把元素创建出来
        this._elem = fc.create(this.getTpl());
    }

    /**
     * 单纯的封装接口
     * @param {Array} unitid 单元id
     * @param {Function} callback 回调
     * @param {number} delay 超时时间，单位为秒
     */
    function getRecommendIdea(unitid, callback, delay) {
        // 是否已经返回，超时也算返回
        var hasRes;

        setTimeout(function() {
            if (hasRes) {
                return;
            }
            hasRes = true;
            callback(false);
        }, 1000 * delay);

        fbs.idea.recommendIdea({
            condition: {
                unitid: unitid
            },
            onSuccess: function(json) {
                if (hasRes) {
                    return;
                }
                hasRes = true;

                var data = json.data || { };
                data.hasmore = !!data.hasmore;
                data.targetword = data.targetword || '';
                data.recmideas = data.recmideas || [ ];

                callback(data);
            },
            onFail: function() {
                if (hasRes) {
                    return;
                }
                hasRes = true;
                // { status: 400, errorCode: 6031 } 表示没有引导词
                // 打开创意标准版即可
                callback(false);
            }
        });
    }

    /**
     * 设计 init 接口是因为模版加载有延时，就让外部来调吧
     * 此方法返回一个 div，外部可把它append 到目标容器里
     * @param {Boolean} needGuideWord 是否需要引子词界面
     * @param {Object} param 外部的一些参数
     * @return {HTMLElement}
     */
    return function(needGuideWord, param) {
        return new SimpleEdit(needGuideWord, param);
    };

}($$);
