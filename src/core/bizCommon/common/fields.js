/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: core/common/fields.js
 * desc: 用于表格控件field的content可重用的方法
 * date: $Date: 2012/12/03 $
 */
/**
 * 表格的field content
 */
lib.field = (function() {

    var isUndef = nirvana.util.isUndef;
    
    /**
     * 限制字数类的处理函数
     */
    function limitString(str, len, styleName) {
        var encodedStr = baidu.encodeHTML(str);
        var shortstr = (len <= 0) ? encodedStr : getCutString(str, len, '..');
        var tpl = '<span title="{title}" class="{clazz}">{content}</span>';

        return lib.tpl.parseTpl({
            title: encodedStr,
            clazz: styleName || '',
            content: shortstr
        }, tpl);
    }

    /**
     * 创建效果突降的气泡
     */
    function createDecreaseBubble(item, title, opttype) {
        var html = '<span class="ui_bubble decr_bubble" bubblesource="decr" bubbletitle="' + 
                        title + '" beginvalue="' + item.beginvalue + '" endvalue="' + item.endvalue + '" ';
		
		// 只有质量度过低详情需要质量度信息
		if(item.beginshowq 
            && (opttype == 3 || opttype == 303)) {
			html += 'beginshowq="' + item.beginshowq +'"endshowq="' + item.endshowq +'" ';
		}
		
		html += 'decr="' + item.decr + '" valuetype="' + nirvana.config.AO.VALUE_TYPE[opttype] + '"> </span>';
        return html;
    }

    return {
        /**
         * 获取渲染的字符串的HTML片段
         * @param {string} str 要展现的字面值
         * @param {number} maxLen 展现的字面值的最大长度
         * @param {string} styleName 要添加的样式名，可选
         * @return {string}
         */
        strRenderer: limitString,
        /**
         * 获取用于展现的字面值的函数
         * @method getLiteralRenderer
         * @param {string} fieldName 要展现的字面值的所在的域的名称
         * @param {number} maxLen 展现的字面值的最大长度
         * @param {string} styleName 要添加的样式名，可选
         * @return {Function} 用于获取展现的字面值的HTML片段的函数
         */
        getLiteralRenderer: function(fieldName, maxLen, styleName) {
            return function(item) {
                return limitString(item[fieldName], maxLen || Number.MAX_VALUE,
                    styleName);
            }
        },
        /**
         * 获取渲染关键词字面值的函数，同时会渲染一个小i的图标，用于提供Bubble功能，该Bubble
         * 会用来显示该关键词所属的计划和单元信息。
         * @method getWordRendererWithBubble
         * @param {string} bubbleSource 配置Bubble的source属性值
         * @param {number} maxLen 展现的字面值的最大长度
         * @param {string} styleName 要添加的样式名，可选
         * @return {Function} 用于获取渲染关键词的HTML片段的函数
         */
        getWordRendererWithBubble: function(bubbleSource, maxLen, styleName) {
            return function(item) {
                // 初始化Bubble的HTML模板
                var bubbleTpl = '<div _ui="id:bubble_{id};' +
                                'type:Bubble;source:{bubbleSource};" ' +
                                '{key}="{value}">' +
                                '</div>';
                // 用于绑定到关键词显示的Bubble的数据
                var attrValues = {
                    title: baidu.encodeHTML(item.showword),
                    planName: item.planname,
                    unitName: item.unitname
                };
                var bubbleHtml = lib.tpl.parseTpl({
                    id: item.winfoid,
                    bubbleSource: bubbleSource,
                    key: fc.expando,
                    value: fc.data.add(attrValues)
                }, bubbleTpl);

                // 初始化渲染关键词字面值的函数
                var getShowHTML = lib.field.getLiteralRenderer('showword', maxLen,
                    styleName);

                return getShowHTML(item) + bubbleHtml;
            };
        },
        /**
         * 获取渲染关键词域的函数
         * @method getWordRenderer
         * @param {number} maxLen 展现的字面值的最大长度
         * @param {string} styleName 要添加的样式名，可选
         * @return {Function}
         */
        getWordRenderer: function(maxLen, styleName) {
            return lib.field.getLiteralRenderer('showword', maxLen,
                    styleName);
        },
        /**
         * 获取渲染计划域的函数
         * @method getPlanRenderer
         * @param {number} maxLen 展现的字面值的最大长度
         * @param {string} styleName 要添加的样式名，可选
         * @return {Function}
         */
        getPlanRenderer: function(maxLen, styleName) {
            return lib.field.getLiteralRenderer('planname', maxLen,
                    styleName);
        },
        /**
         * 获取渲染关键词域的函数
         * @method getUnitRenderer
         * @param {number} maxLen 展现的字面值的最大长度
         * @param {string} styleName 要添加的样式名，可选
         * @return {Function}
         */
        getUnitRenderer: function(maxLen, styleName) {
            return lib.field.getLiteralRenderer('unitname', maxLen,
                    styleName);
        },
        /**
         * 获取渲染当前消费的函数
         * @return {Function}
         */
        getPaySumRenderer: function(item) {
            return function(item) {
                var num;

                if ('' == item.paysum) {// SB doris
                    num = fixed(STATISTICS_NODATA);
                } else {
                    num = fixed(item.paysum);
                }

                return '<div>' + num + '</div>';
            };
        },
        /**
         * 获取渲染点击信息的函数
         * @return {Function}
         */
        getClkRenderer: function() {
            return function(item) {
                var data = item.clks,
                    num;

                if ('' == data) {// SB doris
                    num = STATISTICS_NODATA;
                } else if ('-' == data) {
                    num = data;
                }

                num = parseNumber(data);

                return '<div>' + num + '</div>';
            };
        },
        /**
         * 获取渲染出价信息的函数，默认是可编辑的
         * @method getBidRenderer
         * @param {Object} options 选项
         * @return {Function}
         */
        getBidRenderer: function(options){
            var editable = (options || {}).editable;
            isUndef(editable) && (editable = true);

            /**
             * 实际返回的处理函数
             * @param {Object} item 要渲染的数据对象
             */
            return function(item) {
                var bid = +item.bid,
                    html = [];

                if(editable){
                    html[html.length] = '<div class="edit_td" winfoid=' +
                        item.winfoid + ' unitid=' + item.unitid +
                        ' planid=' + item.planid + '>';

                    if (bid) {
                        html[html.length] = '<span class="word_bid">' +
                            baidu.number.fixed(bid) + '</span>';
                    } else {
                        html[html.length] = '<span title="使用单元出价">' +
                            baidu.number.fixed(item.unitbid) + '</span>';
                    }

                    html[html.length] = '<a class="edit_btn edit_btn_left" ' +
                          'edittype="bid"></a>';
                    html[html.length] = '</div>';
                }
                else{
                    var bidvalue = bid || item.unitbid;
                    html[html.length] = baidu.number.fixed(bidvalue);
                }
                
                return html.join('');
            };
        },
        /**
         * 获取渲染关键词推荐出价的渲染方法
         * @param {？Object} options 选项信息 可选
         * @param {boolean} options.editable 是否推荐出价可编辑，默认不可编辑
         * @return {Function}
         */
        getRecmBidRenderer: function(options) {
            var editable = (options || {}).editable;

            return function(item, row) {
                if (editable) {
                    var bid = +item.recmbid,
                        html = [];

                    html[html.length] = '<div class="edit_td" row=' + row + ' unitid=' + item.unitid + ' planid=' + item.planid + '>';
                    html[html.length] = '<span class="word_recmbid">' + baidu.number.fixed(bid) + '</span>';
                    html[html.length] = '<a class="edit_btn edit_btn_left" edittype="recmbid"></a>';
                    html[html.length] = '</div>';
                    return html.join('');
                }
                else {
                    return baidu.number.fixed(item.recmbid);
                }
            };
        },
        /**
         * 获取渲染关键词推荐匹配的渲染方法
         * @param {？Object} options 选项信息 可选
         * @param {boolean} options.editable 是否推荐出价可编辑，默认不可编辑
         * @return {Function}
         */
        getRecmWmatchRenderer: function(options) {
            var editable = (options || {}).editable;

            return function(item, row) {
                if (editable) {
                    var html =  '<div class="inlineeditable_recmwmatch">' +
                        '<div class="edit_td" row="' + row + '">' +
                        '<span class="word_recmwmatch">' + MTYPE[item.recmwmatch] + '</span>' +
                        '<a class="edit_btn" edittype="recmwmatch"></a>' +
                        '</div></div>';
                    return html;
                }
                else {
                    return MTYPE[item.recmwmatch];
                }
            };
        },
        /**
         * 获取显示在表格单元格内的条状Bar的渲染方法，比如智能提词包的竞争激烈程度，
         * 行业包推广时段的潜在点击量、行业热门程度等
         * @method getBarRenderer
         * @param {string} fieldName 要展现的Bar的值的所在的域的名称
         * @param {string} color 表示Bar上值信息的颜色，不传递该参数将使用默认颜色,
         *                       e.g. "#86ADED"
         */
        getBarRenderer: function(fieldName, color) {
            return function(item) {
                var tpl = ''
                    + '<span class="percent" style="{borderColor}">'
                    +    '<span class="n" style="width:{percent}%;{backgroundColor}"></span>'
                    + '</span>';
                var percent = nirvana.util.translatePercent(item[fieldName]);
                var borderColor = color ? ("border:1px solid " + color) : "";
                var backgroundColor = color ? ("background:" + color) : "";

                return lib.tpl.parseTpl({
                    borderColor: borderColor,
                    percent: percent,
                    backgroundColor: backgroundColor
                }, tpl);
            };
        },
        /**
         * 效果突降中的关键词
         */
        wordinfo_decrease: function(len, opttype) {
            return function(item) {
                var getWord = lib.field.getWordRenderer(len);//lib.field.wordinfo(len, maxLen);
                
                var html = getWord(item);

                if (item.isdecr) {	
                    html += createDecreaseBubble(item, '昨日质量度突降', opttype);
                }

                return html;
            }
        },
        /**
         * 匹配模式，默认是可编辑的
         */
        wmatch: function(options){
            var editable = (options || {}).editable;
            isUndef(editable) && (editable = true);

            /**
             * 实际返回的处理函数
             * @param {Object} item 要渲染的数据对象
             */
            return function(item) {
                var html;
                if(editable) {
                     html = '<div class="edit_td" winfoid="' + item.winfoid + '">' +
                                '<span>' + MTYPE[item.wmatch] + '</span>' +
                                '<a class="edit_btn" edittype="wmatch"></a>' +
                            '</div>';
                }
                else{
                    html = MTYPE[item.wmatch];
                }
               
                return html;
            }
        },
        // 日均搜索量
        // 后端有点坑爹，同样的列，居然字段名不一样
        // 所以如果要用这个，必须指定对应的字段名
        pageView: function(fieldName) {
            return function(item) {
                var pv = +item[fieldName],
                    max = 20000, min = 5;
                if (pv < min) {
                    return '<' + min;
                } else if (pv > max) {
                    return '>' + addCommas(max);
                } else {
                    return addCommas(pv);
                }
            };
        },
        // 条状百分比
        // 如 竞争激烈程度
        // 后端有点坑爹，同样的列，居然字段名不一样
        // 所以如果要用这个，必须指定对应的字段名
        percentGraph: function(fieldName) {
            return function(item) {
                var rate = +item[fieldName];
                if (rate < 0) {
                    rate = 0;
                } else if (rate > 100) {
                    rate = 100;
                }
                return fc.common.Factory.createPercentBar(rate);
            };
        }
    }
})();
