/**
 * Suggestion组件
 *
 * 考虑到输入框的样式不同, 输入框的高度无法固定
 * 因此提示层的 top 属性需要自定义
 * 
 * Suggestion 组件考虑过提示词超长的情况
 * 并用 css 截断处理，因此使用时无需用 js 截断
 * 而且组件选中某个提示项是通过 innerHTML 方式获取值
 * 如果使用 js 截断，会导致拿到的值不完整
 *
 * 如果需要改变 input 的大小，最好别用height，应该用 pading-top 和 padding-bottom
 * 这样没有兼容性问题
 * 
 * 配置项如下：
 * {
 *   读取数据的方法，返回的数据通过 callback 的参数传入，注意必须是个数组，结构如下：
 *   [ { text: '显示的文本' }, ... ]
 *   只是要确保有 text 字段即可
 *   如果需要更多属性，随便加就行，当鼠标点击其中某项时，onsubmit 第一个参数会返回对应的对象
 *   request: function(callback) {
 *   
 *   },
 *
 *
 *   鼠标点击提示项或回车触发
 *   如果鼠标点击某个提示项，value 是 object
 *   如果回车或别的什么方式触发，value 是 string
 *   onsubmit: function(value) {
 *   
 *   }
 * }
 *
 * @class Suggestion
 * @author zhujialu
 * @update 2012/7/13
 */
fc.ui.Suggestion = function($) {

    var Input = fc.ui.Input, 
        List = fc.ui.List,
        event = fc.event;
    
    function Suggestion(node, config) {
        if (node.tagName !== 'INPUT' || (node.tagName === 'INPUT' && node.type !== 'text')) {
            p('[Suggestion]组件只支持<input type="text" />');
            return;
        }

        // 是否是行内元素
        this._inline = true;
        this._super(node, 'suggestion', config);

        var children = this._private.wrapper.children;

        /**
         * 输入框组件
         * @property {Input} input
         */
        this.input = new Input(children[0]);

        /**
         * 列表组件
         * @property {List} list
         */
        this.list = new List(children[1], { itemTpl: '<li>{' + NAME + '}</li>' } );

        /**
         * 提示项是否处于展开显示状态
         * @property {Boolean} opened
         */
        this.opened = false;
        
        /**
         * 用户手动输入的文本，非提示词
         * @property {String} text
         */
        this.text = '';

        // 是否按住没放，只是临时用一下，用完就delete
        // this._pressed = false;
        // 是否不需要请求数据（如按上下键遍历时，或者直接点击某一项），也是用完就删的
        // this._dontRequest = false;

        // 按住上下键后启动的定时器，只是临时用一下，用完就delete
        // this._runner = null;

        this._private.cache = {};
        
        addEvents.call(this);
    }

    Suggestion.prototype = {
        /**
         * 获取或设置输入框的值
         * @method value
         * @param {String|void} value 可选。不传表示 getter，传值表示 setter
         * @return {String|void}
         */
        value: function(value) {
            // 外部传入值的方式无需触发补全，也无需触发change
            if (value != null) {
                this._dontRequest = true;
            }
            return this.input.value(value);
        },

        /**
         * 获取或设置 placeholder
         * @method placeholder
         * @param {String} value 可选，设置此参数表示是 setter，不设置则是 getter
         * @return {String|void}
         */
        placeholder: function(value) {
            return this.input.placeholder(value);
        },

        /**
         * 输入框失焦
         * @method focus
         */
        focus: function() {
            this.input.focus();
        },

        /**
         * 输入框聚焦
         * @method blur
         */
        blur: function() {
            this.input.blur();
        },

        /**
         * 打开提示层
         * 有时可能需要打开一个不那么一样的提示层
         * 因此可以通过 config 参数进行设置
         * 具体设置可以参考 fc.ui.List 组件的配置说明
         * 需要注意的是，config.data 数组元素必须包含 text 字段
         * @method open
         * @param {Object} config 可选，List 组件的配置
         */
        open: function(config) {
            if (config) {
                fc.each(config.data, function(item) {
                    item[NAME] = '<em>' + item.text + '</em>';
                });
                this.list.reset(config);
            }
            if (!this.opened) {
                this.list.deselectItem();
                fc.addClass(this._private.wrapper, Suggestion.CSS_OPENED);
                this.opened = true;
            }
        },

        /**
         * 关闭提示层
         * @method close
         */
        close: function() {
            if (this.opened) {
                var index = this.list.selectedIndex;
                this.list.deselectItem(index);
                fc.removeClass(this._private.wrapper, Suggestion.CSS_OPENED);
                this.opened = false;
            }
        },

        /**
         * 输入框聚焦时的事件处理函数
         * 参数是 输入框的值
         * @method onfocus
         */
        onfocus: null,

        /**
         * 输入框失焦时的事件处理函数
         * 参数是 输入框的值
         * @method onblur
         */
        onblur: null,

        /**
         * 输入框内容变化时的事件处理函数
         * 参数是 输入框的值
         * @method onchange
         */
        onchange: null,

        getTpl: function() {
            return TPL_UI;
        }
    };
    
    Suggestion = fc.ui.extend(fc.ui.Base, Suggestion);

    Suggestion.CSS_OPENED = 'suggestion-opened';    

    // ============================================= 私有属性和方法 ===========================================
    // 模版
    var TPL_UI = '<input type="text" /><div></div>';

    // 取个特殊的名字，避免重名
    var NAME = '_html_';
    
    // 键盘事件常量
    var KEYCODE_UP = 38,
        KEYCODE_DOWN = 40,
        KEYCODE_ENTER = 13,
        KEYCODE_SPACE = 32;
        
    // 按住上下键时遍历的速度，单位毫秒
    var SPEED = 30;

    // 是否松开了按键(默认没按，自然算是松开了)
    var hasKeyup = true;

    function addEvents() {
        var input = this.input;
        event.keydown(input.node, keyDown, this);
        event.keyup(input.node, keyUp, this);

        event.on(this.list, List.EVENT_ENTER_ITEM, enterItem, this);
        event.on(this.list, List.EVENT_LEAVE_ITEM, leaveItem, this);
        event.on(this.list, List.EVENT_CLICK, clickList, this);

        var me = this, task;
        input.onfocus = function() {
            var fn = focus(me);
            task ? task.push(fn) : fn();
        };
        input.onblur = function() {
            task = [];
            blur(me)(function() {
                if (task && task.length > 0) {
                    task[0]();
                }
                task = null;
            });
        };
        input.onchange = change(this);
    }

    /**
     * kedown任务艰巨，如下：
     * 1. 用户长按某键，如果是上下键，遍历选项；如果是字符键，直接无视(隐藏提示层)
     * 2. 如果按下了回车，提交表单
     * 3. 不处理字符键
     */
    function keyDown(e) {
        var keyCode = e.keyCode;

        // mousedown主要是处理功能键，因为字符键的处理都放在onchange
        if (hasKeyup) {
            // 按下了
            hasKeyup = false;

            // 按下回车
            switch (keyCode) {
                case KEYCODE_ENTER:
                    submit.call(this);
                    break;

                case KEYCODE_UP:
                case KEYCODE_DOWN:
                    if (this.opened) {
                        var offset = keyCode === KEYCODE_UP ? -1 : 1;
                        selectItem.call(this, this.list.selectedIndex + offset);
                    }
                    break;
            }
            
        // 按了没放
        } else {
            keyPressed.call(this, keyCode);
        }

        // webkit下，按上键，光标会跑到最左侧
        if (keyCode === KEYCODE_UP) {
            e.preventDefault();
        }
    }

    // 长按某键
    function keyPressed(keyCode) {
        this._pressed = true;

        // 长按字符键直接无视
        if (isCharkey(keyCode)) {
            this.close();
        // 开启遍历
        } else if (this._runner == null 
                    && this.opened
                    && (keyCode === KEYCODE_UP || keyCode === KEYCODE_DOWN)) {
            run.call(this, keyCode === KEYCODE_DOWN);
        }
    }

    function keyUp(e) {
        if (this._pressed) {
            delete this._pressed;
        }

        if (this._runner != null) {
            clearInterval(this._runner);
            delete this._runner;
        }

        if (isCharkey(e.keyCode)) {
            this.text = this.value();
        }

        hasKeyup = true;
    }

    function enterItem(e) {
        if (!this.opened) return;
        var target = fc.parent(e.target, 'li');
        if (target) {
            var index = fc.inArray(target, target.parentNode.children);
            this.list.selectItem(index);
        }
    }

    function leaveItem(e) {
        var target = fc.parent(e.target, 'li');
        if (target) {
            this.list.deselectItem();
        }
    }

    function clickList(e) {
        var item = fc.parent(e.target, 'li');
        if (this.clickOnItem = !!item) {
            submit.call(this);
        }
    }

    function focus(sug) {
        return function() {
            if (typeof sug.onfocus === 'function') {
                sug.onfocus(sug.value());
            }
        };
    }

    // 这里纠正了事件顺序，即先click，然后blur, 再然后 focus
    // 这样方便在外部进行一些判断，比如点击某些元素不要触发blur时
    // 可以先在 click 事件中给 Suggestion 添加一个临时属性
    // 然后在 blur 事件中去取这个属性，并做出相应的行为
    function blur(sug) {
        return function(callback) {
            setTimeout(function() {
                var clickOnItem = sug.clickOnItem;
                // 如果用户点击在 list 上，但并没有点击 item
                // 不需要隐藏浮层
                if (clickOnItem === false) {
                    delete sug.clickOnItem;
                    sug.focus();
                } else {
                    sug.close();
                    if (typeof sug.onblur === 'function') {
                        sug.onblur(sug.value());
                    }
                }
                callback();
            }, 200);
        };
    }

    function change(sug) {
        return function(value) {
            // 判断是否需要请求数据
            // 从提示层补全的值不需要再次请求
            // 是否从提示层补全可以通过 sug._dontRequest 和 sug._runner 进行判断
            var dontRequest = sug._dontRequest;
            if (dontRequest) {
                delete sug._dontRequest;
            }
            dontRequest = sug._pressed || dontRequest || sug._runner;

            if (!dontRequest) {
                requestData.call(sug);
            }

            if (typeof sug.onchange === 'function') {
                sug.onchange(value);
            }
        };
    }

    /**
     * 最后一步：提交表单
     */
    function submit() {
        var selectedItem = this.list.selectedItem;
        if (selectedItem) {
            this.value(selectedItem.text);
        }

        this.blur();
        this.close();
        this.text = this.value();

        this.config().onsubmit(selectedItem || this.text);
    }

    /**
     * 遍历吧
     */
    function run(isDown) {
        var sug = this;
        this._runner = setInterval(function() {
            var index = sug.list.selectedIndex;
            isDown ? index++ : index--;
            selectItem.call(sug, index);
        }, SPEED);
    }

    /**
     * 选择某个提示项
     * @param {Number} index 提示项的索引，-1 表示当前input
     */
    function selectItem(index) {
        var list = this.list, total = list.data.length;

        // 在这里做 index 修正比较优雅
        if (index === total) {
            index = -1;
        } else if (index === -2) {
            index = total - 1;
        }

        if (index >= 0) {
            list.selectItem(index);
        } else {
            list.deselectItem();
        }

        var text = list.selectedItem ? list.selectedItem.text : this.text;
        this.value(text);
    }

    /**
     * 请求后端数据，如果缓存里有，直接读取
     */
    function requestData() {
        var value = this.value();
        if (!fc.trim(value)) return;

        var cache = this._private.cache, data = cache[value];
        if (data) {
            createList.call(this, data);
        } else {
            var sug = this;
            this.config().request(function(data) {
                if (!fc.isArray(data)) {
                    p('[Suggestion] 返回数据不是数组类型，组件会自动转成空数组，请知晓！');
                    data = [];
                }
                if (data.length > 0) cache[value] = data;
                bold(value, data);

                if (data.length > 0 && value === sug.value() && sug.input.isFocus()) {
                    createList.call(sug, data);
                } else {
                    sug.close();
                }
            });
        }
    }

    // 创建粗体
    function bold(text, data) {
        fc.each(data, function(item) {
            if (item.text.slice(0, text.length) === text) {
                item[NAME] = '<em>' + text + '</em>' + item.text.slice(text.length);
            } else {
                item[NAME] = item.text;
            }
        });
    }

    // 使用最新拿到的数据，更新提示层
    function createList(data) {
        // 设置一些粗体
        this.list.items(data);
        this.open();
    }

    // 是否是字符键或等同于字符键
    function isCharkey(keyCode) {
        return (keyCode >= 65 && keyCode <= 90)       // A-Z
                || (keyCode >= 48 && keyCode <= 57)   // 主键盘的数字键
                || (keyCode >= 96 && keyCode <= 105)  // 小键盘的数字键
                || keyCode == KEYCODE_SPACE           // 空格键
                || keyCode == 8;                      // 退格键
    }

    return Suggestion;

}($$);
