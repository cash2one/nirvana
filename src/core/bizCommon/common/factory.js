/**
 * 工厂
 * 为什么要叫这个名字呢？
 * 额，因为我不知道还能叫什么。。。
 *
 * 这个模块主要是创建一些通用的部件，叫 widget 有点太大了，
 * 因为这里创建的都是一些小玩意，而且不具交互性，比如loading 框
 *
 * @author zhujialu
 * @update 2012/10/20
 */
fc.common.Factory = function($) {
    
    // 依赖
    var tpl = fc.tpl,
        ShowReason = fc.common.ShowReason;

    // 这个模块肯定会越写越多，为了便于管理，在最开始定义一个 exports 对象
    // 以后每加一个就按照 CSS + TPL + method 的方式写在一块，这样比较紧凑
    var exports = { };

    // =========================== keyword + icons ===========================================
    exports.CSS_KEYWORD_ICONS = 'keyword_icons';
    
    var TPL_KEYWORD_ICONS = '<span class="' + exports.CSS_KEYWORD_ICONS + '">{keyword}{icons}</span>';
    /**
     * 创建 一个关键词 后面跟着 几个展现理由图标
     * 这个方法会返回一个工厂方法，参数是{String} keyword
     * @method createKeywordIcons
     * @param {Array} attr
     * @return {Function}
     */
    exports.createKeywordIcons = function(attr) {
        return function(keyword) {
			var html = '';
			fc.each(keyword.attr_index, function(index) {
                var icon = attr[index];
                if (icon && icon.field === ShowReason.TEXT) {
                    html += ShowReason.getIcon(icon.text);
                }
            });
            return tpl.parse({ keyword: fc.text(keyword.word), icons: html }, TPL_KEYWORD_ICONS);
		};       
    };

    // ======================================= Checkbox + keyword + icons  ========================================
    exports.CSS_KEYWORD_CHECKBOX = 'keyword_checkbox';
    var TPL_CHECKBOX_KEYWORD_ICONS = '<div class="field">' +
                                         '<input type="checkbox" id="word_{id}" class="key ' + exports.CSS_KEYWORD_CHECKBOX + '">' +
                                         '<label class="value" for="word_{id}">{keyword}</label>' +
                                     '</div>';
    /**
     * 创建 复选框 + 关键词 + n个展现理由图标
     * 用法和 createKeywordIcons 一样
     * @method createCheckboxKeywordIcons
     * @param {Array} attr
     * @return {Function}
     */
    exports.createCheckboxKeywordIcons = function(attr) {
        return function(keyword) {
            var html = '';
			fc.each(keyword.attr_index, function(index) {
                var icon = attr[index];
                if (icon && icon.field === ShowReason.TEXT) {
                    html += ShowReason.getIcon(icon.text);
                }
            });
            html = tpl.parse({ keyword: fc.text(keyword.word), icons: html }, TPL_KEYWORD_ICONS);
            return tpl.parse({ id: keyword.wordid, keyword: html }, TPL_CHECKBOX_KEYWORD_ICONS);
        }
    };

    /**
     * 配套一个获取选中关键词方法
     * 返回 wordid 数组
     * @method getSelectedKeywords
     * @param {HTMLElement} node 容器元素
     * @return {Array}
     */
    exports.getSelectedKeywords = function(node) {
        var checkboxs = $('.' + exports.CSS_KEYWORD_CHECKBOX, node), ret = [];
        fc.each(checkboxs, function(box) {
            if (box.checked) {
                var id = box.id.slice(5);
                ret.push(id);
            }
        });
        return ret;
    };

    // ========================================= 水平垂直居中对齐 =================================================
    var TPL_CENTER_ALIGN = '<div class="align-outer">' +
                              '<div class="align-middle">' +
                                  '<div class="align-inner">{content}</div>' +
                              '</div>' +
                          '</div>';
    
    /**
     * 实现内容的水平垂直居中对齐
     * @method createCenterAlign
     * @param {String} html 需要对齐的内容
     * @return {String}
     */
    exports.createCenterAlign = function(html) {
        return tpl.parse({ content: html }, TPL_CENTER_ALIGN);  
    };


    // ========================================== 百分比，一般用在表格中 =========================================
    var TPL_PERCENT_BAR = '<span class="percent-bar"><span class="percent-value" style="width:{value}%;"></span></span>';

    /**
     * 创建百分比横条，即蓝边白底的bar，需要传入百分比值
     * @method createPercentBar
     * @param {Number} value 百分比值
     * @return {String}
     */
    exports.createPercentBar = function(value) {
        return tpl.parse({ value: value }, TPL_PERCENT_BAR);
    };

    return exports;

}($$);
