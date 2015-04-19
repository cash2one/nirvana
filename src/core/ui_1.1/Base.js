/**
 * UI 组件基类，所有 UI 组件都扩展自它
 * @class Base
 * @author: zhujialu
 * @update: 2012/9/29
 */
fc.ui.Base = (function($) {
    // 依赖
    var event = fc.event;

    /**
     * @param {HTMLElement} node 组件的最外层元素 
     * @param {String} name 组件名称
     * @param {Object} config 配置项
     * @param {Boolean} dontWrap 如果组件不需要进行包装，如Input，传入true，其他情况无视此参数
     */
    function Base(node, name, config, dontWrap) {
        p(this);

        /**
         * 组件名称，用于标识是什么组件
         * @property {String} name 
         */
        this.name = name;

        /**
         * 组件最外层元素
         * @property {HTMLElement} node
         */
        this.node = null;

        /**
         * 是否可见
         * @property {Boolean} visible
         */
        this.visible = true;
        
        var cfg = {};
        // 拷贝一份
        if (config) {
            fc.extend(cfg, config);
        }
   
        // 私有属性全放在这里面
        this._private = {
            config: cfg,
            // 原始元素，调用 dispose() 后会进行还原
            origin: node
        };

        if (dontWrap) {
            this.node = node;
            addClass.call(this);
        } else {
            wrap.call(this, node); 
        }

        if (cfg.id) {
            this.node.id = cfg.id;
        }

        // 设置皮肤
        cfg.skin = cfg.skin || 'default';
        fc.addClass(this.node, CSS_SKIN + cfg.skin);

        add(this);
    }


    Base.prototype = {

        /**
         * 重新初始化组件
         * 有可能更新过配置信息，需要刷新组件
         * @method reset
         * @param {Object} config 可选，组件的配置对象
         */
        reset: function(config) {
            var pvt = this._private;
            if (config) {
                fc.extend(this.config(), config);
            }
            this._private = {
                config: pvt.config,
                wrapper: pvt.wrapper,
                origin: pvt.origin
            }
            pvt.wrapper.innerHTML = this.getTpl(pvt.origin);
        },

        /**
         * 显示组件
         * @method show
         */
        show: function() {
            this.visible = true;
            fc.show(this.node);
            
            event.fire(this, Base.EVENT_SHOW);
            if (typeof this.onshow === 'function') {
                this.onshow();
            }
        },

        /**
         * 隐藏组件
         * @method hide
         */
        hide: function() {
            this.visible = false;
            fc.hide(this.node);

            event.fire(this, Base.EVENT_HIDE);
            if (typeof this.onhide === 'function') {
                this.onhide();
            }
        },

        /**
         * 获取或设置组件的宽度
         * @method width
         * @param {Number} value 可选，不传表示getter，传值表示setter
         * @return {Number|void}
         */
        width: function(value) {
            return fc.width(this.node, value);
        },

        /**
         * 获取或设置组件的高度
         * @method height
         * @param {Number} value 可选，不传表示getter，传值表示setter
         * @return {Number|void}
         */
        height: function(value) {
            return fc.height(this.node, value);
        },

        /**
         * 获取或设置配置
         * @method config
         */
        config: function(config) {
            var pvt = this._private;
            if (config == null) return pvt.config;
            else pvt.config = config;
        },

        /**
         * 组件显示时触发
         * @event onshow
         */
        onshow: null,

        /**
         * 组件隐藏时触发
         * @event onhide
         */
        onhide: null,

        /**
         * 子类如果有 resize 需要，请实现此方法
         * @method onresize
         */
        onresize: null,

        /**
         * 释放内存
         * @method dispose
         */
        dispose: function() {
            var pvt = this._private,
                parentNode = this.node.parentNode;
            
            this.node && event.un(this.node);
            
            if (!pvt) {
                return;
            }
            
            pvt.wrapper && event.un(pvt.wrapper);
            // 还原到最初的元素
            parentNode && parentNode.replaceChild(pvt.origin, this.node);

            remove(this);
            delete this._private;
        }
    };

    /**
     * 批量初始化组件
     * @method Base.init
     * @param {Array} elems DOM元素数组
     */
    Base.init = function(elems) {
        var ui = fc.ui;

        elems = fc.makeArray(elems);
        fc.each(elems, function(elem) {
            var props = parseUI(fc.attr(elem, '_ui')),
                type = props.type;
            delete props.type;
            new ui[type](elem, props);
        });
    };

    Base = fc.ui.extend(new Function(), Base);

    Base.EVENT_SHOW = 'base-show';
    Base.EVENT_HIDE = 'base-hide';

    // ============================== 私有 =================================
    var CSS_PREFIX = 'fc-ui-',
        CSS_INLINE = 'ui-inline',
        CSS_WRAPPER = 'ui-wrapper',
        CSS_SKIN = 'ui-skin-';

    var instances = {};

    function add(obj) {
        var config = obj._private.config,
            id = config.id || (config.id = fc.random());

        if (instances[id]) {
            p('警告：ID重复[id=' + id + ']');
        }
        instances[id] = obj;
    }

    function remove(obj) {
        var id = obj._private.config.id;
        if (instances[id]) {
            delete instances[id];
        }
    }

    fc.ui.get = function(id) {
        return id != null ? instances[id] : instances;
    };

    // 解析 _ui="" 的文本
    function parseUI(text) {
        var ret = {},
            props = text.split(';');

        fc.each(props, function(prop) {
            var arr = prop.split(':');
            ret[fc.trim(arr[0])] = fc.trim(arr[1]);
        });

        return ret;
    }

    /**
     * 包装组件
     * @param {HTMLElement} origin 子类传入的元素
     */
    function wrap(origin) {
        // 外层统一用 div 进行包裹
        var doc = origin.ownerDocument || document,
            node = doc.createElement('div');

        // 这两个比较重要，所以复制过来
        if (fc.trim(origin.id)) {
            node.id = origin.id;
        }
        if (fc.trim(origin.className)) {
            node.className = origin.className;
        }

        var parentNode = origin.parentNode;
        parentNode && parentNode.replaceChild(node, origin);

        // 应用模版
        var tpl = '';
        if (typeof this.getTpl === 'function') {
            tpl = this.getTpl(origin);
        }
        node.innerHTML = '<div class="' + CSS_WRAPPER + '">' + tpl + '</div>';

        this.node = node;
        this._private.wrapper = $('.' + CSS_WRAPPER, this.node)[0];
        addClass.call(this);
    }

    /**
     * 每个组件都需要添加一些 className，比如 组件名，是否表现为行内元素, 是否IE78等
     */
    function addClass(dontWrap) {
        var node = this.node;
        fc.addClass(node, CSS_PREFIX + this.name);
        fc.addClass(node, fc.logo);
        if (this._inline) {
            fc.addClass(node, CSS_INLINE);
            delete this._inline;
        }
    }

    // UI 唯一的resize事件
    event.resize(window, function(e) {
        fc.each(instances, function(item) {
            if (item && typeof item.onresize === 'function') {
                item.onresize();
            }
        });
    });

    return Base;
})($$);



// 可翻页的
fc.ui.Pageable = function() {
    /**
     * @param {Number} totalSize 数据总数
     * @param {Number} pageSize 每页显示数量
     * @param {Number} index 当前页，默认为0，即第一页
     */
    function Pageable(totalSize, pageSize, index) {
        this.totalSize = totalSize;
        this.pageSize = pageSize;
        this.pages = getPages(totalSize, pageSize);
        this.index = index || 0;
    }
    
    
    Pageable.prototype = {
        /**
         * 设置数据总数量
         */
        setTotalSize: function(totalSize) {
            this.totalSize = totalSize;
            this.pages = getPages(totalSize, this.pageSize);
        },

        /**
         * 获得第几页的数据，返回对象结构为：
         * { start: 开始索引， end: 结束索引 }
         * @param {Number} index 第几页
         * @return {Object} 
         */
        getDataRange: function(index) {
            index = index || this.index || 0;
            if (index < 0 || index > this.pages) return;

            var start = this.pageSize * index,
                end = Math.min(start + this.pageSize, this.totalSize);

            this.index = index;
            return { start: start, end: end };
        }
    };

    function getPages(totalSize, pageSize) {
        return totalSize % pageSize === 0 ? ~~(totalSize / pageSize) : ~~(totalSize / pageSize) + 1;
    }

    return Pageable;
}();


