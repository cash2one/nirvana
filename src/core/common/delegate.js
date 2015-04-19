/**
 * 事件代理
 * @author zhujialu
 */

lib.delegate = (function() {
    var name;

    /**
     * 获得事件处理函数
     */
    function getHandler(attr, map) {
        return function(e) {
            e = e || window.event;
            name = attr;

            var target = e.target || e.srcElement,
                act = target.getAttribute(name);

            if (!act) {
                act = findAct(target);
                if (!act) return;
            }

            var event = {
                target: target
            };
            map[act](event);
        }
    }
    /**
     * 向上寻找拥有自定义属性的节点
     * 这个方法是为Button等组件写的
     */
    function findAct(el) {
        // 控制一下遍历的长度，组件一般不会包裹10层吧，但愿如此
        var len = 10, i = 0;
        var ret = baidu.dom.getAncestorBy(el, function(el) {
            if (i > len) return true;

            if (el.getAttribute(name)) {
                return true;
            }
            i++;
        });
        return ret ? ret.getAttribute(name) : null;
    }

    return {
        /**
         * @param {HTMLElement} el 要代理的元素
         * @param {Object} map 事件处理函数的对象,key等于自定义属性值，如act="open" 对应 {open: function() {}}
         * @param {String} 自定义属性名，如act之类的
         */
        init: function(el, map, attr) {
            attr = attr || 'act';

            // Modified by Wu Huiyao FIX Bug: 事件绑定没有移除导致元素的多次绑定
            //baidu.on(el, 'click', getHandler(attr, map));
            el.onclick = getHandler(attr, map);
        }
    };
})();
