/**
 * 配置项如下：
 * {
 *   title: [String|Function],            标题
 *   content: [String|Function],          内容
 *   position: [lt|ct|rt|rm|rb|cb|lb|lm], 显示位置，默认会自动算出最优显示位置，如需强制定位，传入某个值
 *
 *   container: '#id',                    气泡相对的容器(用于浮层的自动定位)，默认是body，这个属性可以是选择器（字符串），也可以是DOM元素
 *   icon: 'className',                   气泡图标
 *
 *   showBy: [auto|hover|click],          触发显示条件，自动显示、鼠标悬浮或点击
 *   hideBy: 'out',                       触发隐藏的条件: 自动消失、鼠标离开或组件失焦
 *                                        注意：所有气泡都会失焦隐藏，所以如果隐藏条件是 out && blur 时，只需传out
 *
 *   showTime: 1000,                      如果显示后需要自动隐藏，可以设置此项，单位是毫秒
 *    
 *   onopen: function() {},               显示气泡层的回调函数，因为使用气泡大部分情况下不需要拿到Bubble对象的引用，所以只能写在配置里了
 *
 *   如果IE下出现 z-index 错乱，传入父级元素（切记是非static 定位）进行修正
 *   如果出现闪烁，确定该父元素是否hasLayout
 *   parent: 'selector',
 *
 *   下面是新功能提示部分的配置
 *   startTime: '2012/12/09',             开始时间，必须使用斜线（禁止 2012-12-09 格式），它没有兼容性问题
 *   sessionTimes: 1                      一次登录内，显示几次，默认是1次
 * }
 *
 * 本组件可以实现一个页面的多个新功能提示。之前的设想是显示完一个再显示另一个，每个气泡显示1分钟，但
 * 是极有可能用户看了几秒就直接跳转了，导致后面的气泡都看不到了。所以改成可同时显示，为了体验好一些
 * ，当然不能同时显示一堆气泡。。。
 *
 * 用法：
 * 1. 定义你需要的source，可以基于模版定制，有三个模版：info(叹号) help(问号) tip(新功能提示)
 *    Bubble.source.xx = Bubble.getSource('info', { title: '', content: '' });
 *
 * 2. 如果是从模版自动生成的气泡，如右: _ui="id:xx;type:Bubble;source:xx;"
 *    
 * 3. 如果是手动创建的气泡，如下:
 *    var bubble = new fc.ui.Bubble(elem, { source: 'xx' })
 *
 * @class Bubble
 * @author: zhujialu
 * @update: 2012/7/9
 *
 */
fc.ui.Bubble = function($) {

    var Layer = fc.ui.Layer,
        event = fc.event,
        storage = fc.storage,
        tpl = fc.tpl;
    
    function Bubble(node, config) {
        // 禁止传一堆配置进来，而是要通过 source 配置
        if (typeof config.source !== 'string') {
            p('[Bubble] 创建 Bubble 失败，请先配置 source !');
            return;
        }
        // 组件表现为行内元素
        this._inline = true;
        this._super(node, 'bubble', formatConfig(config, node));

        /**
         * 图标元素
         * @property {HTMLElement} icon
         */
        initIcon.call(this, config.icon);

        /**
         * 气泡层
         * @property {HTMLElement} layer
         */
        initLayer.call(this, config.title);

        // 气泡层是否显示过一次（涉及到设置 innerHTML，或者请求 content）
        this._private.completed = false;

        initUI.call(this);
    }

    Bubble.prototype = {

        /**
         * 获取或设置标题
         * @method title
         * @param {String|Function} text 可选，不传表示getter，传值表示setter
         * @return {String|void}
         */
        title: function(text) {
            var config = this.config();
            if (text != null) {
                text = typeof text === 'function' ? text.call(this, this._private.origin) : text;
                var titleNode = $('.' + Layer.CSS_HEADER, this.node)[0];
                titleNode.innerHTML = text;
                config.title = text;
            } else {
                return config.title;
            }
        },

        /**
         * 获取或设置内容
         * @method content
         * @param {String|Function} content 可选，不传表示getter，传值表示setter
         * @return {String|void}
         */
        content: function(text) {
            // 因为这里存在异步调用的可能，所以要判断组件是否已销毁了
            if (!this._private) return;

            var config = this.config();
            if (text != null) {
                var contentNode = $('.' + Layer.CSS_CONTENT, this.node)[0];
                if (typeof text === 'function') {
                    var me = this, node = this._private.origin;
                    if (text.length === 2) {  // 第二个参数是callback
                        fc.addClass(contentNode, CSS_LOADING);
                        text.call(this, node, function(text) {
                            fc.removeClass(contentNode, CSS_LOADING);
                            text && me.content(text);
                            // 高度发生变化，需要重新定位
                            setPosition.call(me);
                        });
                        return;
                    }
                    text = text.call(this, node);
                }
                contentNode.innerHTML = text;
                config.content = text;
            } else {
                return config.content;
            }
        },

        /**
         * 打开气泡层
         * @method open
         */
        open: function() {
            var config = this.config();
            
            cur && cur.close();
            cur = this;

            if (!this._private.completed) {
                if (config.title != null) this.title(config.title);
                if (config.content == null) {
                    config.content = function(node, callback) {
                        Bubble.getContent(this.title(), callback);
                    };
                }
                this.content(config.content);
                this._private.completed = true;
            }

            // IE 专用，解决 z-index 问题
            if (config.parent) {
                fc.css(config.parent, 'z-index', 1000); 
            }
            setPosition.call(this);
            this.layer.show();

            if (typeof config.onopen === 'function') {
                config.onopen.call(this, this._private.origin);
            }

            // 
            // 自动显示的气泡会在 1 分钟后自动消失
            if (typeof config.showBy === 'auto') {
                var me = this;
                setTimeout(function() {
                    if (cur === me) me.close();
                }, config.showTime);
            } else {
                // 2 秒后消失
                autoHide.call(this);
            }
        },

        /**
         * 关闭气泡层
         * @method close
         */
        close: function() {
            if (!this._private) return; // 如果已经被销毁，就不用往下走了
            var config = this.config();

            if (this === cur) {
                cur = null;
            } else if (config.showBy === 'auto') {
                this.dispose();
            }

            if (config.parent) {
                fc.css(config.parent, 'z-index', config.parentZIndex);
            }
            this.layer.hide();
        },

        dispose: function() {
            removeEvents.call(this);
            this.layer.dispose();
            this._super();
        },

        getTpl: function(origin) {
            return TPL_UI;
        }
    };
    
    Bubble = fc.ui.extend(fc.ui.Base, Bubble);

    Bubble.source = {};

    /**
     * 获得 name 对应的配置模版, 并可以通过 param 进行定制
     * @method Bubble.getSource
     * @param {String} name 模版名称
     * @param {Object} param 和该模版不同的的参数
     * @return {Object}
     */
    Bubble.getSource = function(name, param) {
        if (typeof name !== 'string') {
            param = name;
            name = 'info';
        }
        var config = source[name]() || source['info']();
        if (param) {
            for (var key in param) {
                config[key] = param[key];
            }
        }
        return config;
    };

    /**
     * 请求 title 对应的 content
     * @method getContent
     * @param {String} title 内容对应的标题
     * @param {Function} callback 请求的回调，参数是{String}
     */
    Bubble.getContent = function(title, callback) {
        fbs.noun.getNoun({
            word: baidu.encodeHTML(title),
            onSuccess: function(json) {
                callback(baidu.decodeHTML(json.data));
            },
            onFail: function(json) {
                callback(ERROR);
            }
        });
    };

    // 一些可选的配置，这里不要配置 title 和 content
    // 设计成 function 是为了避免外部污染
    // 这样每次取值都是最原始的状态
    var source = {
        // 叹号图标
        info: function() {
            return {
                icon: 'icon-info',
                showBy: 'hover',
                hideBy: 'out'
            };
        },
        // 问号图标
        help: function() {
            return {
                icon: 'icon-help',
                showBy: 'click',
                hideBy: 'out'
            };
        },
        // 无图标，一般用于新功能提示
        tip: function() {
            return {
                showBy: 'auto',
                // 显示时长为1分钟
                showTime: fc.MINUTE
            };     
        }
    };

    // ====================================== 私有属性和方法 ==========================================
    var CSS_ICON = 'bubble-icon',
        CSS_LAYER = 'bubble-layer',

        CSS_TAIL = 'bubble-tail',
        CSS_LOADING = 'bubble-loading',
        CSS_POSITION = 'bubble-position-';
    
    var TPL_UI = '<span class="' + CSS_ICON + '"></span><div class="' + CSS_LAYER + '"></div>',
        TPL_TAIL = '<div class="'+ CSS_TAIL + ' triangle"><span class="triangle"></span></div>';
    
    var ERROR = '请求数据失败';

    var cur = null;  // 手动触发的气泡
    
    function initIcon(iconClass) {
        this.icon = $('.' + CSS_ICON, this.node)[0];
        if (typeof iconClass === 'string' && fc.trim(iconClass).length > 0) {
            fc.addClass(this.icon, iconClass);
        }
    }

    function initLayer(title) {
        title = title != null ? '' : null;  // 是否占据高度
        this.layer = new Layer($('.' + CSS_LAYER, this.node)[0], {
            width: 260,
            title: title,
            removeFooter: true
        });

        var node = this.layer.node;
        if (title === '') {
            // 为了避免空 title 太难看，去掉 header 的底边距
            var header = $('.' + Layer.CSS_HEADER, node)[0];
            fc.css(header, 'margin-bottom', 0);
        }
        // 加入三角形的尾巴
        var tail = fc.create(TPL_TAIL);
        node.appendChild(tail);
        // 先记住当前 layer 的className，这样在处理尾巴的方位时就简单了
        this._private.layerClass = node.className;
    }

    function initUI() {
        addEvents.call(this);
        // 自动显示
        if (this.config().showBy === 'auto') {
            autoShow.call(this);
        }
    }

    function autoHide() {
        var me = this, config = this.config();
        this._autoHideTimer = setTimeout(function() {
            delete me._autoHideTimer;
            me.close();
        }, config.showTime);
    }

    /**
     * 格式化配置，有些配置需要内部修正
     * 除了配置对象，还需要传入组件元素，主要是给 parent 配置项使用的
     */
    function formatConfig(config, elem) {
        var source = Bubble.source[config.source];
        delete config.source;

        // 为了完整性，必须把所有的属性拷过来
        for (var name in source) {
            if (config[name] == null) {
                config[name] = source[name];
            }
        }
        // 如果是选择器，这里要转成DOM元素
        if (typeof config.container === 'string') {
            config.container = $(config.container)[0];
        }
        if (typeof config.parent === 'string') {
            config.parent = fc.parent(elem, config.parent);
            config.parentZIndex = fc.css(config.parent, 'z-index');
            if (fc.css(config.parent, 'position') === 'static') {
                throw new Error('[Bubble]配置项 parent 必须是非 static 定位！');
            }
        }

        if (config.showBy === 'auto') {
            // 把开始时间转成时间戳
            if (typeof config.startTime === 'string') {
                if (config.startTime.indexOf('-') !== -1) {
                    throw new Error('[Bubble] startTime 配置项的格式必须以 / 作为分隔符, 当前配置为: ' + config.startTime);
                    return;
                }
                config.startTime = Date.parse(config.startTime);
            } else{
                throw new Error('[Bubble]自动显示的气泡必须配置 startTime !');
                return;
            }
            if (config.id == null) {
                throw new Error('[Bubble]自动显示的气泡必须设置 id !');
                return;
            }
            // 一次登录周期内，只显示一次
            if (config.sessionTimes == null) {
                config.sessionTimes = 1;
            }
        } else {
            // 如果用户不把鼠标移到浮层上，2 秒后关闭浮层
            config.showTime = 2000;
        }
        return config;
    }

    /**
     * 初始化事件，这里主要是关闭按钮
     */
    function addEvents() {
        var me = this, config = this.config();
        this.layer.onclose = function() {
            var storage = me.config()._storage;
            if (storage) {
                storage.totalCloseTimes++;
                storage.sessionClosed = true;
                updateData(storage);
            }
            me.close();
        };

        if (config.showBy === 'hover') {
            event.mouseenter(this.icon, this.open, this);
        } else if (config.showBy === 'click') {
            event.click(this.icon, clickIcon, this);
        }

        // 自动隐藏的逻辑
        event.mouseenter(this.layer.node, function() {
            if (me._autoHideTimer) {
                clearTimeout(me._autoHideTimer);
                delete me._autoHideTimer;
            }
        });
        event.mouseleave(this.layer.node, function() {
            if (config.hideBy === 'out') {
                me.close();
            } else {
                autoHide.call(me);
            }    
        });
    }

    function removeEvents() {
        event.un(this.icon);
    }

    function clickIcon() {
        // blur 消失的逻辑，layer 会处理
        if (!this.layer.visible) {
            this.open();
        }
    }

    // =============================== 自动显示 =====================================
    /**
     * 自动显示
     * 这段逻辑比较独立，专用于新功能提示
     * 本地存储的数据模型如下：
     * bubble_id => {
     *    totalCloseTimes: 0,    关闭次数
     *    sessionClosed: false,  登录周期内是否关闭过
     *    sessionTimes: 0,       当前登录周期内显示次数
     *    stopShow: false        是否停止显示
     * }
     */
     
    // 每次刷新后显示过的气泡
    var sessionMap = { }, prefix = 'bubble_';
    
    function autoShow() {
        var me = this, config = this.config(), id = prefix + config.id;
        storage.get(id, function(data) {
            data = data || {
                totalCloseTimes: 0,
                sessionClosed: false,
                sessionTimes: 0,
                stopShow: false
            };
            if (!sessionMap[id]) {
                sessionMap[id] = 1;
                data.sessionTimes = 0;
            }

            var isNewLogin = !LoginTime.isDuringLogin(id);
            if (isNewLogin) {
                data.sessionClosed = false;
            }
            
            // 便于数据更新所以加个id
            data.id = id;
            
            if (data.stopShow = needStop(config, data)) {
                me.dispose();
            } else {
                data.sessionTimes++;
                // 缓存一份数据，便于后续的数据更新
                config._storage = data;
                me.open();
            }
            
            updateData(data);
        });
    }
    // 是否需要停止显示
    function needStop(config, data) {
        return (fc.now() - config.startTime) / fc.DAY >= 31                   // 上线超过31天（从上线开始那晚 + 之后的30天）
                || data.sessionClosed                                         // 当前登录周期内关闭过                  
                || data.totalCloseTimes >= 2                                  // 总共关了2次
                || data.sessionTimes >= config.sessionTimes;                  // 一次登录内次数超限
    }
    
    // 更新本地存储
    function updateData(data) {
        // 过滤掉id
        var id = data.id;
        delete data.id;

        storage.set(id, data);
        // 再弄回去，便于下次更新
        data.id = id;
    }
    
    // ========================================= 下面计算 layer 的位置 ================================================
    /**
     * 设置浮层显示位置
     */
    function setPosition() {
        var config = this.config(), layer = this.layer;

        var iconRect = getRect(this.icon),
            layerRect = { width: layer.width(), height: layer.height() },
            conRect = config.container ? getRect(config.container) : getDocRect();

        iconRect.left -= conRect.left;
        iconRect.top -= conRect.top;

        var pos = calPosition(iconRect, conRect, config.position);
        getLayerRect(iconRect, layerRect, pos);

        fc.css(layer.node, 'left', layerRect.left - iconRect.left);
        fc.css(layer.node, 'top', layerRect.top - iconRect.top);

        layer.node.className = this._private.layerClass + ' ' + CSS_POSITION + pos;
    }

    // 计算方位
    function calPosition(iconRect, conRect, position) {
        // 自动算位置
        if (typeof position !== 'string') {
            // 确定icon相对于容器的位置，算出最优显示位置
            var x = iconRect.left > conRect.width / 2,
                y = iconRect.top > conRect.height / 2;

            if (!x && !y) { // 右下
                position = 'rb';
            } else if (!x && y) { // 右上
                position = 'rt';
            } else if (x && !y) { // 左下
                position = 'lb';
            } else { // 左上
                position = 'lt';
            }
        }
        return position;
    }

    // 获得某个元素的矩形信息
    function getRect(elem) {
        var ret = fc.position(elem);
        ret.width = fc.width(elem);
        ret.height = fc.height(elem);
        return ret;
    }
    
    // 获得文档的矩形信息
    function getDocRect() {
        var html = document.documentElement, body = document.body;
        return {
            left: 0, top: 0,
            width: html.clientWidth || body.clientWidth,
            height: html.clientHeight || body.clientHeight
        };
    }

    // =============================== 浮层的一些常量值 =======================================
    // layer与icon的距离，举个例子，如果layer在icon上方，就是icon的顶边到layer的main的底边的距离
    var OFFSET = 20,
        // tail与main最近一边的距离，如果修改这个值，需要修改css，搜20px即可
        TAIL_OFFSET = 20;

    /**
     * 获得浮层的矩形信息，因为icon可能会被外部任意设置，比如设置字体大小就会导致节点高度变化，所以
     * 要传进来动态计算
     * @param {Object} iconRect
     * @param {Number} layerRect
     * @param {Number} pos 方位
     */
    function getLayerRect(iconRect, layerRect, pos) {
        var layerWidth = layerRect.width, layerHeight = layerRect.height;
        switch (pos) {
            // left-top
            case 'lt':
                layerRect.left = iconRect.left + TAIL_OFFSET - layerWidth;
                layerRect.top = iconRect.top - OFFSET - layerHeight;
                break;
            // center-top
            case 'ct':
                layerRect.left = iconRect.left + iconRect.width / 2 + TAIL_OFFSET - layerWidth;
                layerRect.top = iconRect.top - OFFSET - layerHeight;
                break;
            // right-top
            case 'rt':
                layerRect.left = iconRect.left + iconRect.width - TAIL_OFFSET;
                layerRect.top = iconRect.top - OFFSET - layerHeight;
                break;
            // right-middle
            case 'rm':
                layerRect.left = iconRect.left + iconRect.width + TAIL_OFFSET;
                layerRect.top = iconRect.top + iconRect.height / 2 - TAIL_OFFSET;
                break;
            // right-bottom
            case 'rb':
                layerRect.left = iconRect.left + iconRect.width - TAIL_OFFSET;
                layerRect.top = iconRect.top + iconRect.height + OFFSET;
                break;
            // center-bottom
            case 'cb':
                layerRect.left = iconRect.left + iconRect.width / 2 - TAIL_OFFSET;
                layerRect.top = iconRect.top + iconRect.height + OFFSET;
                break;
            // left-bottom
            case 'lb':
                layerRect.left = iconRect.left + TAIL_OFFSET - layerWidth;
                layerRect.top = iconRect.top + iconRect.height + OFFSET;
                break;
            // left-middle
            case 'lm':
                layerRect.left = iconRect.left - TAIL_OFFSET - layerWidth;
                layerRect.top = iconRect.top + iconRect.height / 2 - TAIL_OFFSET;
                break;
        }
    }

    return Bubble;

}($$);
