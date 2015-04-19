/**
 * 补流量窗口
 * 调用这个模块前，先用 AddTrafficDialog.noRemind(fun) 判断一下是否选择了“不再提示”
 * 如果 fun 的参数是 false 则可以 new 这个模块
 *
 * @author zhujialu
 * @update 2012/10/28
 */
fc.module.AddTrafficDialog = function($) {
    
    var Factory = fc.common.Factory,
        Keyword = fc.common.Keyword,
        Unit = fc.common.Unit,
        Button = fc.ui.Button,
        tpl = fc.tpl,
        event = fc.event;

    /**
     * param 格式如下：
     * {
     *    planid: '',
     *    unitid: '',
     *    unitname: '',
     *    pattern: 0|1|2,    保存关键词使用的匹配模式
     *    keywords: [],      保存的关键词，元素结构是
     *                          { 
     *                            index: 0, 
     *                            status: null, 
     *                            winfoid: 1, 
     *                            wordid: 1, 
     *                            showword: '1', 
     *                            bid: null
     *                          }
     *    entry: '',
     *    regions: '',
     *    rgfilter: 1|0
     * }
     */
    function AddTrafficDialog(param) {
        this.param = param;
        this.noRemind = false;
        // 传入的最近保存过的一批词，用来触发改价
        this.savedKeywords = param.keywords;

        // 勾选的关键词
        this.keywords = [];
        init.call(this);
    }
    
    AddTrafficDialog.prototype = {
        
        /**
         * 获得勾选上的关键词
         * @method getSelectedKeywords
         * @return {Array}
         */
        getSelectedKeywords: function() {
            var wordids = Factory.getSelectedKeywords(this.dialog.getDOM()),
                map = this.wordidMap, ret = [];
            fc.each(wordids, function(id) {
                ret.push(map[id]);
            });
            return ret;
        },

        showError: function(error) {
            var elem = this.dialog.getDOM(), errorNode = $('.error', elem)[0];
            errorNode.innerHTML = error;
            fc.show(errorNode);
        },

        hideError: function() {
            var elem = this.dialog.getDOM(), errorNode = $('.error', elem)[0];
            fc.hide(errorNode);
        },

        /**
         * 关闭对话框
         * @method close
         * @param {Boolean} bysubmit 是否是通过点击确定按钮关闭的
         */
        close: function(bysubmit) {
            var me = this;
            Unit.checkMinBid(this.param.planid, this.param.unitid, this.savedKeywords, function() {
                me.submitBtn.dispose();
                me.closeBtn.dispose();
                me.dialog.hide();
                me.dialog.dispose();
                if (typeof me.onclose === 'function') {
                    me.onclose(bysubmit);
                }
            });
        },

        /**
         * 关闭时的事件处理函数
         * @event onclose
         * @param {Boolean} bysubmit 是否是通过点击确定按钮关闭的，此参数可能是 undefined
         *                           因此如果强制要求布尔类型，请自行转换
         *                           设计此参数是为外部加监控考虑的
         */
        onclose: null
    };

    // 一个静态方法，用来判断是否选择了“不再提示”
    AddTrafficDialog.noRemind = function(callback) {
        var name = 'isRemindMemory' + nirvana.env.USER_ID;
		FlashStorager.get(name, function(flag) {
            if (isNaN(+flag)) {
                FlashStorager.set(name, 0);
                callback(false);
            } else if (flag == 0) {
                callback(false);
            } else {
                callback(true);
            }
		});
    };

    var CSS_MODULE = 'addtrafficdialog',
        CSS_HEADER = CSS_MODULE + '_header',
        CSS_CONTENT = CSS_MODULE + '_content',
        CSS_FOOTER = CSS_MODULE + '_footer';

    var TPL = '<div class="' + CSS_MODULE + '">' +
                  '<div class="' + CSS_HEADER + '">' +
                      '<span class="fc_icon_success"></span>' + 
                      '<h1>{size}个关键词已成功保存</h1> 至推广单元：{unitname}，推广方式：{pattern}。' +
                  '</div>' +
                  '<div class="' + CSS_FOOTER + '">' +
                      '<span class="error" style="display:none;">错误信息</span>' +
                      '<span class="submitBtn">确定</span><span class="closeBtn">关闭</span>' + 
                      '<span class="field"><input id="no_remind" class="key" type="checkbox"><label class="value" for="no_remind">不再提醒</label></span>' +
                  '</div>' +
              '</div>',

        TPL_CONTENT = '<div class="' + CSS_CONTENT + '">' +
                        '<h2 class="reason">保存为{pattern}匹配后，可能会损失部分展现量，您可以选择以下关键词进行补充。</h2>' +
                        '<div class="tool"><span class="select_all">全选</span><span class="toggle_all">反选</span></div>' +
                        '{keywords}' +
                    '</div>';

    var keywordFactory;

	function init() {
		var me = this, param = this.param;
		
		this.dialog = createDialog(param.pattern, param.keywords.length, param.unitname);
		this.dialog.onclose = function() {
			me.close();
		};
		
        var elem = this.dialog.getBody();
        this.submitBtn = new Button($('.submitBtn', elem)[0]);
        this.closeBtn = new Button($('.closeBtn', elem)[0]);
        this.dialog.resizeHandler();

        Keyword.recommend({
            logid: param.logid,
            planid: param.planid,
            unitid: param.unitid,
            device: param.device,
            query: fc.map(param.keywords, function(item) { return item.showword; }).join('>'),
            querytype: 8,
            entry: param.entry,
            regions: param.regions,
            rgfilter: param.rgfilter,
            onSuccess: function(json) {
                var keywords = [];
                if (json.data && fc.isArray(json.data.group)) {
                    keywords = Keyword.groups2Keywords(json.data.group);
                }
                if (keywords.length > 0) {
                    // 创建一个工厂
                    keywordFactory = Factory.createCheckboxKeywordIcons(json.data.attr);
                    var html = tpl.parse({
                        keywords: createKeywords(keywords),
                        pattern: param.pattern == 1 ? '短语' : '精确'
                    }, TPL_CONTENT);

                    var footer = $('.' + CSS_FOOTER, elem)[0], 
                        parentNode = footer.parentNode;
                    // 解决 IE7 中 footer 保持原位的无耻行为
                    parentNode.appendChild(fc.create(html));
                    parentNode.appendChild(footer);
                }
                // 用 map 比较好找
                me.wordidMap = {};
                fc.each(keywords, function(item) {
                    me.wordidMap[item.wordid] = item;
                });
            }
        });

        addEvents.call(this);
	}
	
    function createDialog(pattern, size, unitname) {
        var dialog = new ui.util.create('Dialog', {
            id: 'addTrafficDialog',
            title: '保存关键词',
            width: 650,
            mask: 5
        });
        dialog.show();
        dialog.setContent(tpl.parse({
            pattern: pattern == 1 ? '短语' : '精确',
            size: size,
            unitname: unitname
        }, TPL));
        return dialog; 
    }

    function createKeywords(keywords) {
        var html = '<table>';
        for (var i = 0, len = keywords.length; i < len; i += 3) {
            html += '<tr><td>' + keywordFactory(keywords[i]) + '</td>';
            if (keywords[i + 1]) {
                html += '<td>' + keywordFactory(keywords[i + 1]) + '</td>';
            }
            if (keywords[i + 2]) {
                html += '<td>' + keywordFactory(keywords[i + 2]) + '</td>';
            }
            html += '</tr>';
        }
        return html + '</table>';
    }

    function addEvents() {
        var me = this, 
            param = me.param,
            elem = this.dialog.getDOM(),
            checkbox = $('#no_remind')[0],
            hasFailed = false;

        this.submitBtn.onclick = function() {
            me.noRemind = checkbox.checked;
            me.keywords = me.getSelectedKeywords();
            if (me.noRemind) {
                FlashStorager.set('isRemindMemory' + nirvana.env.USER_ID, 1);
            }
            if (!hasFailed && fc.keys(me.wordidMap).length > 0 && me.keywords.length > 0) {
                param.keywords = fc.map(me.keywords, function(item) { return item.word; });
                param.onSuccess = function(json) {
                    fc.push(me.savedKeywords, json.data);
                    me.close(true);
                };
                param.onFail = function(json, errorKeywords) {
                    // 只处理部分成功
                    if (json.status == 300) {
                        var errorInfo = '单元内词数达到上限，以上关键词未保存成功。您可以在关键词工具左侧购词栏中找到这些词，保存至其他单元。';
                        me.showError(errorInfo);
                        fc.push(me.savedKeywords, json.data);
                        Keyword.saveKeywordsToStorage(fc.keys(errorKeywords));
                    }
                    hasFailed = true;
                };
                Keyword.save(param);
            } else {
                me.close(true);
            }
        };
        this.closeBtn.onclick = function() {
            me.noRemind = checkbox.checked;
            me.keywords = me.getSelectedKeywords();
            me.close();
        };
        
        event.on(elem, '.select_all', 'click', selectAll, this);
        event.on(elem, '.toggle_all', 'click', toggleAll, this);
    }
    
    function selectAll() {
        var elem = this.dialog.getDOM();
        fc.each($('.' + Factory.CSS_KEYWORD_CHECKBOX, elem), function(checkbox) {
            checkbox.checked = true;
        });
    }

    function deselectAll() {
        var elem = this.dialog.getDOM();
        fc.each($('.' + Factory.CSS_KEYWORD_CHECKBOX, elem), function(checkbox) {
            checkbox.checked = false;
        });
    }

    function toggleAll() {
        var elem = this.dialog.getDOM();
        fc.each($('.' + Factory.CSS_KEYWORD_CHECKBOX, elem), function(checkbox) {
            checkbox.checked = !checkbox.checked;
        });
    }

    return AddTrafficDialog;

}($$);
