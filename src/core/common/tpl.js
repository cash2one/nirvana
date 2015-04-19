/**
 * 模版解析工具
 * 对外API为
 * {
 *     getTpl(tpl, obj)
 * }
 * @author zhujialu
 */
var lib = lib || {};

lib.tpl = (function() {
    
    var cache = {},
        // 主要是要替换掉换行符，不然 + 操作的时候会出语法问题
        whitespaceExpr = /(?:\r\n|\n|\t| +)/g,
        // 变量的表示法 {var}
        // update: 新增表达式功能，如{(i + 1) / 2}
        varExpr = /{([-+*/%\w() ]+?)}/g;

    /**
     * 格式化模版，把换行符,tab，多个空格换成一个空格
     */
    function formatTpl(tpl) {
        return tpl.replace(whitespaceExpr, ' ');
    }

    /**
     * 把模版格式化成数组
     */
    function tpl2Array(tpl) {
        tpl = formatTpl(tpl);

        var ret = [], match, lastIndex = 0;

        while (match = varExpr.exec(tpl)) {
            ret.push('\'' + tpl.substring(lastIndex, match.index) + '\'');
            ret.push(match[1]);
            lastIndex = varExpr.lastIndex;
        }

        ret.push('\'' + tpl.substr(lastIndex) + '\'');

        return ret;
    }
    /**
     * @param {Object} obj
     * @param {String} tpl 模版
     */
    function parseTpl(obj, tpl) {

        if (!obj) {
            return tpl;
        }

        if (typeof cache[tpl] !== 'function') {
            try {
                var fnBody = 'var ret = [];'                           +
                             'obj = obj || {};'                        +
                             'with (obj) {'                            +
                                 'ret.push('                           +
                                     tpl2Array(tpl).join(',') +
                                 ');'                                  +
                             '};'                                      +
                             'return ret.join("")';

                cache[tpl] = new Function('obj', fnBody);
            } catch (e) {
                alert('解析模版错误，详情请查看控制台！');
                p('数据来源：');
                p(obj);
                p('模版文本：');
                p(tpl);
            }
        }
        return cache[tpl](obj);
    };

    return {
        /**
         * @param {Object} obj 配合模版解析的对象
         * @param {String} tpl 模版字符串
         * @param {Boolean} byName 是否通过名称找模版，如果byName为true，则tpl为模版的名称
         */
        parseTpl: function(obj, tpl, byName) {
            if (byName) {
                tpl = this.getTpl(tpl);
            }

            return parseTpl(obj, tpl);
        },
        /**
         * 通过名称获得模版文本
         */
        getTpl: function(name) {
            return er.template.get(name);
        }
    }
})();

