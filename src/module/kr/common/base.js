/**
 * 凤巢模块基类
 * @class Base
 * @author zhujialu
 * @update 2012/10/21
 */
fc.module.Base = function() {

    var tpl = fc.tpl, event = fc.event;

    function Base(node, name, config) {
        this.origin = node;
        this.config = config;

        var content = this.getTpl();
        this.node = fc.create(tpl.parse({ name: name, content: content }, TPL_MODULE));
        // 替换一下
        node.parentNode.replaceChild(this.node, node);
    }

    Base.prototype = {
        show: function() {
            fc.show(this.node);      
        },
        hide: function() {
            fc.hide(this.node);    
        },
        dispose: function() {
            event.un(this.node);
            var parentNode = this.node.parentNode;
            if (parentNode) {
                parentNode.replaceChild(this.origin, this.node);
            }
        }
    };

    var TPL_MODULE = '<div class="module-{name}">{content}</div>';

    return Base;

}();
