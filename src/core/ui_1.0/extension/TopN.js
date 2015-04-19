/**
 * TopN 排行榜组件
 * 
 * @class TopN
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化配置
 * <pre>
 * 配置项定义如下：
 * {
 *      id:      [String], [REQUIRED] 控件ID
 *      isfixed: [Boolean],[OPTIONAL] 是否仅展现前N项数据，默认为true
 *      data:    [Array],  [REQUIRED] 要排行的数据源
 *      N:       [Number], [OPTIONAL] 要显示的Top条记录，未设置，全部显示给定的数据
 *      caption: [String], [OPTIONAL] 要显示的Top条记录的标题
 *      headers: [Array],  [OPTIONAL] 要显示的Top条记录的每一列的header信息，每一项都是html字符串。 
 *      keys:    [Array],  [REQUIRED] 要显示的Top条记录的每一列的数据访问的key，数组元素若未定义或者不存在，
 *                                    表示用数字序列号作为value显示
 *      values:  [Array],  [REQUIRED] 默认每一列显示的数据项，根据keys的配置来获取，通过该key来访问data[i][key]。
 *                                    数组元素若未定义或者不存在，则用其i+1来作为值显示。如需定制数据显示方式，
 *                                    数组元素为Function，返回一段html，一般传null即可   
 *                                    该Function的payload为data[i]或者i+1(key不存在情况)
 *      mainKey: [String], [OPTIONAL] 用于topN记录排序的key。
 *      barKey:  [String], [OPTIONAL] 如果存在要显示成柱形条的数据渲染方式，必须配置该属性key，通过该key获取对应
 *                                    的数据值
 * }
 *
 * headers(如果有), keys, values的长度保持一致
 *
 * 如有柱状条，约定classname为valuebar，如果柱状条旁边需附有值说明，
 * 约定classname为valueliteral，如下在values对应数据元素项定义:
 * function(item) {
 *     return '&lt;div class="valuebar"&gt;&lt;/div&gt;&lt;span class="valueliteral"&gt;100&lt;/span&gt;';
 * }
 * <b>NOTICE:</b>为了让bar正常显示，要对每一列的宽度样式进行设置，对应列的样式设置.column* {...}，具体展现样式可以根据渲染出来元素再进行定制
 * </pre>
 */
ui.TopN = function(options) {
    this.initOptions(options);
    this.type = 'topn';
    options.isfixed == false ? this.isfixed = false : this.isfixed = true;
    if (this.mainKey) {
        this.data.sort(this.sort());
    }
}
ui.TopN.prototype = function() {
    // 工具方法 
    /**
     * 获得HTML模版字符串
     */
    function getHTML(me) {
        var html = ['<table>'],
            i, len = me.keys.length;
        
        if (me.caption) {
            html.push('<caption>');
            html.push(me.caption);
            html.push('</caption>');
        }
        // 拼装header部分
        if (me.headers) {
            html.push('<thead><tr>');

            var headers = me.headers;
            for (i = 0, len = headers.length; i < len; i++) {
                html.push('<th class="column');
                html.push(i + 1);
                html.push('">');
                
                html.push(headers[i] || '&nbsp;');

                html.push('</th>');
            }

            html.push('</tr></thead>');
        }
        
        // 拼装排行部分
        html.push('<tbody>');

        // 遍历前N 项数据
        var keys = me.keys, key,
            values = me.values, value,
            items = me.data, item, 
            j, size = values.length;

        for (i = 0, len = me.N; i < len; i++) {
            item = items[i];

            html.push('<tr>');
            
            // 遍历每项数据的keys
            for (j = 0; j < size; j++) {
                key = keys[j];
                value = values[j];
                
                if (key) {
                    key = item[key];
                    if (typeof value === 'function') {
                        value = value(item);
                    } else if (typeof value !== 'function') {
                        value = key;
                    }
                } else {
                    // key为空表示序号项
                    key = i + 1;
                    if (typeof value === 'function') {
                        value = value(key);
                    } else if (typeof value !== 'function') {
                        value = key;
                    }
                }

                html.push('<td class="column');
                html.push(j + 1);
                html.push('">');
                html.push(value);
                html.push('</td>');
            }

            html.push('</tr>');
        }

        html.push('</tbody></table>');
        
        return html.join('');
    }
    
    // 设置valueBar的宽度
    function setBarWidth(bar, width) {
        if (isNaN(width)) {
            width = 4;
        }
        // 最小值不能小于4px
        width = Math.max(width, 4);

        bar.style.width = width + 'px';
        if (!bar.innerHTML) {
            bar.innerHTML = '&nbsp;';
        }
    }
    
    /**
     * 获得key属性的最大值所对应的数组索引
     */
    function getMaxIndex(key, me) {
        var data = me.data, maxIndex, maxValue, item;
        for (var i = 0, len = me.N; i < len; i++) {
            item = data[i];
            if (item && typeof item[key] !== 'undefined') {
                if (i > 0) {
                    if (item[key] > maxValue) {
                        maxValue = item[key];
                        maxIndex = i;
                    }
                } else {
                    // 是数组第一项就直接赋值
                    maxValue = item[key];
                    maxIndex = 0;
                }
            } 
        }
        return maxIndex;
    }
    
    function getWidth(el) {
        var paddingLeft = baidu.getStyle(el, 'paddingLeft'),
            paddingRight = baidu.getStyle(el, 'paddingRight');
        return el.offsetWidth - parseInt(paddingLeft, 10) - parseInt(paddingRight, 10);
    }
    /*
     * 获取某个key对应的所有valueBar或valueLiteral
     * @param key 数据项
     * @param className 要获取的类名
     */
    function getBarItem(me, key, className){
        var pos;
        for (var i = 0; i　< me.keys.length; i ++) {
            if (me.keys[i] == key) {
                pos = i;
            }
        }
        var fathers = baidu.q('column' + (pos + 1), me.main);
        var result = [];
        var num = fathers.length;
        for (var j = 0; j < num; j ++) {
            result.push(baidu.q(className, fathers[j])[0]);
        }
        
        return result;
    }
    /**
     * 自适应宽度，主要是处理valueBar的宽度
     * 需要确保最小宽度为4px
     * @param {object} me topn的实例
     * @param {string} key 数据项标识，与keys中的项对应
     */
    function autoWidth(me, key) {
        var data = me.data, barKey = key;
        
        var maxIndex = getMaxIndex(barKey, me),
            maxItem = data[maxIndex];
        
        // 获得所需元素集
        var valueBars = getBarItem(me, barKey, 'valueBar'),
            valueLiterals = getBarItem(me, barKey, 'valueLiteral');
        
        // 获得最大值所对应的valueBar和valueLiteral
        var maxValueBar = valueBars[maxIndex],
            maxValueLiteral = valueLiterals[maxIndex];
        
        // 相减可得最大宽度
        var maxWidth = getWidth(maxValueBar.parentNode);
        maxWidth -= maxValueLiteral ? maxValueLiteral.offsetWidth : 0;
        // 30px 作为留白，好看些
        maxWidth -= 30;

        // 获得最大值
        var maxValue = maxItem[barKey];
        
        var percent, width, bar;
        for (var i = valueBars.length - 1; i >= 0; i--) {
            // 计算宽度
            if (maxValue) {
                percent = data[i][barKey] / maxValue;
            } else {
                percent = 0;
            }
            
            width = maxWidth * percent;
            
            // 获得DOM元素
            bar = valueBars[i];
            setBarWidth(bar, width);
        }
    }
    
    return {
        /**
         * 渲染控件
         * @method render
         * @param {HTMLElement} main 控件挂载的DOM元素
         */
        render: function(main) {
            if (!this.main) {
                ui.Base.render.call(this, main, true);
            }
            this.refresh(this.data);
        },
        /**
         * 根据给定数据进行渲染
         * 
         * @method refresh
         * @param {Array} data 要渲染的数据
         */
        refresh: function(data) {
            if (!data) return;

            this.data = data;
            
            (this.isfixed == false) ? this.N = this.data.length : (this.N = this.N || this.data.length);

            var html = getHTML(this);
            this.main.innerHTML = html;

            if (baidu.q('valueBar', this.main)[0]) {
                if (typeof this.barKey == 'string') {
                    autoWidth(this, this.barKey);
                } else {
                    for (var i = 0; i < this.barKey.length; i ++) {
                        autoWidth(this, this.barKey[i]);
                    }
                }
            }
        },

        /**
         * 排序方法，作为Array.prototype.sort()的参数
         * @return {Function}
         */
        sort: function(mainKey) {
            var key = mainKey || this.mainKey;
            return  function(item1, item2) {
                if (item1 && typeof item1[key] !== 'undefined' &&
                    item2 && typeof item2[key] !== 'undefined') {
                    var value1 = '' + item1[key];
                    var value2 = '' + item2[key];
                    return value1.localeCompare(value2);
                }
            }
        }
    }
}();

ui.Base.derive(ui.TopN);
