/**
 * 全局调试语句
 */
function p(s) {
    // console.log(s);
}

/**
 * fc-star 基础库
 * 
 * @author: zhujialu
 * @date: 2012-06-21
 */
var fc = (function() {
    
    var trimExpr = /(?:^\s+|\s+$)/g,
        // JSON RegExp
        rvalidchars = /^[\],:{}\s]*$/,
	    rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;

    if (!trimExpr.test('\xA0')) {
        trimExpr = /(?:^[\s\xA0]+|[\s\xA0]+$)/g;
    }
    
    var trim = String.prototype.trim,
        indexOf = Array.prototype.indexOf,
        push = Array.prototype.push,
        slice = Array.prototype.slice,
        splice = Array.prototype.splice,
        toString = Object.prototype.toString,
        class2type = {};

    // 几个单位的毫秒数
    var SECOND = 1000,
        MINUTE = SECOND * 60,
        HOUR = MINUTE * 60,
        DAY = HOUR * 24;

    // 已存在的随机数
    var randomData = {},
        randomSeed = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
                      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                      0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    // 对外暴露的接口
    var exports = {

        expando: 'fc' + ('' + Math.random()).replace(/\D/g, ''),
        /**
         * 这个方法有两个用处
         * 1. 获取 obj 的 type
         * 2. 传入 values 表示断言，即判断 obj 的 type 是不是 values 中的一个
         *    当 values 只有一个时，不用传数组
         *
         * @param {*} obj
         * @param {String|Array} values 可选，用于判断 obj 是否命中 values 指定的类型
         * @return 如果只传obj，返回类型的小写形式，如果传了values，返回boolean
         */
        type: function(obj, values) {
            // 获得 obj 的类型
            var type = toString.call(obj),
                ret = (obj == null ? '' + obj : class2type[type]) || type.slice(8, -1).toLowerCase();

            if (typeof values === 'string') {
                values = [values];
            }

            if (!values) {
                return ret;
            } 

            for (var i = values.length; i--;) {
                if (ret === values[i].toLowerCase()) {
                    ret = true;
                    break;
                }
            }
            return ret === true;
        },
        isEmptyObject: function(obj) {
            for (var key in obj) {
                return false;
            }
            return true;
        },
        isWindow: function(obj) {
            return obj.window === obj;
        },
        /**
         * 获得随机数
         */
        random: function() {
            var ret = [], seedSize = randomSeed.length;
            for (var i = 0; i < 10; i++) {
                ret.push(randomSeed[Math.floor(Math.random() * seedSize)]);    
            }
            ret = 'fc-' + ret.join('');
            if (!randomData[ret]) {
                randomData[ret] = 1;
                return ret;
            } else {
                return arguments.callee();
            }
        },
        

        // ====================================== 字符串部分 =======================================
        trim: trim ? 
            function(str) {
                return exports.type(str, 'string') ? trim.call(str) : '';
            } : 
            function(str) {
                return exports.type(str, 'string') ? str.replace(trimExpr, '') : '';
            },

        /**
         * 把连字符形式转成驼峰形式，如margin-left => marginLeft
         * @param {String} name
         * @return {String}
         */
        camelize: function(name) {
            return name.replace(/-([a-z])/g, function($0, $1) {
                return $1.toUpperCase();
            });
        },

        /**
         * 如果 isCss 为true， 把驼峰形式转成连字符形式，如marginLeft => margin-left
         * 如果 isCss 未传值或为false，大写 name 的首字母
         * @param {String} name
         * @param {Boolean} isCss 是否是css样式
         * @return {String}
         */
        capitalize: function(name, isCss) {
            if (isCss) {
                return name.replace(/[A-Z]/g, function($0) {
                    return '-' + $0.toLowerCase();
                });
            } else {
                var first = name.slice(0, 1).toUpperCase();
                return first + name.slice(1);
            }
        },

        /**
         * 转义，即如果 text 是一段 html 可以转成正常显示的文本
         * 这个方法调用外部库就行了
         */
        text: function(text) {
            return baidu.string.encodeHTML(text);
        },

        parseJSON: function(data) {
            if (typeof data !== "string" || !data) {
                return null;
            }
            
            data = exports.trim(data);

            if (window.JSON && window.JSON.parse) {
                return window.JSON.parse(data);
            }

            if (rvalidchars.test(data.replace(rvalidescape, "@")
                .replace(rvalidtokens, "]")
                .replace(rvalidbraces, ""))) {
         
                return (new Function("return " + data))();
         
            }
            p('JSON格式错误');
            return ''; 
        },

        /**
         * 创建一个序列化的对象
         */
        param: function(obj) {
            var ret = [],
                add = function(key, value) {
                    ret.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
                },
                build = function(obj, prefix) {
                    if (exports.isArray(obj)) {
                        exports.each(obj, function(value) {
                            build(value, prefix);
                        });
                    } else if (exports.type(obj, 'object')) {
                        exports.each(obj, function(value, key) {
                            var postfix = key.indexOf('[]') !== -1 ? '[]' : ''; 
                            build(value, prefix ? (prefix + '[' + key.replace('[]', '') + ']' + postfix) : key);
                        });
                    } else {
                        add(prefix, obj);
                    }
                };
            
            build(obj);
            return ret.join('&').replace(/%20/g, '+');
        },

        // ========================================= 数组部分 =====================================

        
        isArray: Array.isArray ?
                function(obj) {
                    return Array.isArray(obj);
                } :
                function(obj) {
                    return exports.type(obj, 'array');         
                },

        inArray: indexOf ? 
                function(elem, array) {
                    return array ? indexOf.call(array, elem) : -1;
                } :
                function(elem, array) {
                    if (array) {
                        for (var i = 0, len = array.length; i < len; i++) {
                            if (array[i] === elem) return i;
                        }
                    }
                    return -1;
                },

        slice: function(array, start, end) {
            if (!exports.isArray(array)) {
                array = this.makeArray(array);
            }
            if (end != null) return slice.call(array, start, end);
            else return slice.call(array, start);
        },

        splice: function(array, index, size, newItems) {
            if (!this.isArray(newItems)) return;
            var args = [index, size];
            this.push(args, newItems);
            return splice.apply(array, args);
        },

        push: function(sourceArray, dataArray) {
            if (!fc.isArray(dataArray)) {
                dataArray = [dataArray];
            }
            push.apply(sourceArray, dataArray);
        },

        /**
         * 把 array 加入 result
         * 返回值是一个数组
         * @param {Object|Array} array 数组，类数组，或对象
         * @param {Array} result 可选
         */
        makeArray: function(array, result) {
            var ret = result || [];

            if (array != null) {
                var i = ret.length, j = 0, len = array.length;
                if (typeof len === 'number') {
                    for (; j < len; j++) {
                        ret[i++] = array[j];
                    }
                } else {
                    while(array[j] != null) {
                        ret[i++] = array[j++];
                    }
                }
            }
            return ret;
        },

        /**
         * @param {Array|Object} obj
         * @param {Function} fn 第一个参数是value，第二个参数是索引(或key)。
         *                      如果 fn 返回false，遍历终止
         */
        each: function(obj, fn) {
            if (exports.isArray(obj) || typeof obj.length === 'number') {
                for (var i = 0, len = obj.length; i < len; i++) {
                    if (fn(obj[i], i) === false) {
                        break;
                    }
                }
            } else {
                for (var key in obj) {
                    if (fn(obj[key], key) === false) {
                        break;
                    }
                }  
            }
        },

        // 把 arr 转换成另一个数组
        map: function(arr, fn) {
            var ret = []; 
            exports.each(arr, function(item, i) {
                ret.push(fn(item, i));
            });
            return ret;
        },

        // 从 arr 中找出需要的元素
        grep: function(arr, fn) {
            var ret = [];
            exports.each(arr, function(item, i) {
                if (fn(item, i)) {
                    ret.push(item);
                }
            });
            return ret;
        },

        // =====================  日期处理 ==================================
        // 这 4 个都是毫秒数，便于计算
        SECOND: SECOND,
        MINUTE: MINUTE,
        HOUR: HOUR,
        DAY: DAY,

        now: function() {
            return (new Date()).getTime();
        },
        
        /**
         * 扩展target(先简单实现一个版本)
         * @param {Object} target 扩展对象
         * @param {Object} obj 扩展内容
         */
        extend: function(target, obj) {
            var len = arguments.length;
            if (len === 1) {
                // 扩展fc
                this.extend(this, target);
            } else if (len === 2) {
                for (var key in obj) {
                    target[key] = obj[key];
                }
            }
        },
        keys: function(obj) {
            var ret = [];
            for (var key in obj) {
                ret.push(key);    
            }
            return ret;
        }
    };

    exports.each('Boolean,Number,String,Function,Array,Date,RegExp,Object'.split(','), function(name) {
        class2type['[object ' + name + ']'] = name.toLowerCase();
    });

    return exports;
})();




// ================================ DOM =======================================
fc.extend((function() {
    // 匹配元素，可以匹配 tag id class attribute
    var quickExpr = /^(\w+)?(#[-\w]+)?(.[-\w]+)?(\[([-\w]+)([!|*~^$]?)=['"]?(.*?)['"]?\])?$/,
        htmlExpr = /<[^>]+>/,
        classExpr = function(cls) {
            return new RegExp('(?:^|\\s)' + cls + '(?:\\s|$)', 'g');    
        };

    /**
     * 判断elem 是否匹配 selector
     *
     * 暂时只支持 tag id class attr 四种，不支持伪类
     * 1. tag
     * 2. #id
     * 3. .class
     * 4. [attr="val"] 
     *
     * 属性选择器支持 =, !=, |=, *=, ~=, ^=, $=
     * 还支持 tag[attr="val"], #id[attr="val"], .class[attr="val"]
     *
     * @param {HTMLElement} elem
     * @param {String} selector 选择器
     */
    function matchElement(elem, selector) {
        if (!elem.tagName) return;
        var match = quickExpr.exec(selector);

        if (match) {
            var attrs = elem.attributes || {};

            if (match[5]) {
                // 调整一下selector 把属性去掉
                selector = fc.trim(selector.replace(match[4], ''));

                var value = fc.trim(((attrs[match[5]] || {}).value || '')),
                    targetValue = match[7],
                    ret;

                switch (match[6]) {
                    case '!=':
                        ret = value !== target;
                        break;

                    // attr 属性值是 targetValue 或以 targetValue 为前缀（后跟一个连字符“-” ）
                    // 如class="test1-test2-test3" => [class|="test1"]
                    case '|=':
                        ret = value === targetValue;
                        if (!ret) {
                            ret = value.indexOf(targetValue + '-') === 0;
                        }
                        break;
                    // attr 属性值是包含 targetValue 的字符串
                    // 如 class="abc" => [class*="b"]
                    case '*=':
                        ret = value.indexOf(targetValue) !== -1;
                        break;

                    // attr 属性值是用空格分隔的字词列表，其中一个等于targetValue
                    // 如 class="ab cd" => [class~="cd"]
                    case '~=':
                        var arr = value.split(' ');
                        ret = fc.inArray(targetValue, arr) !== -1;
                        break;

                    // attr 属性值是以 targetValue 开头的字符串
                    // 如 class="abc" => [class^="a"]
                    case '^=':
                        ret = value.indexOf(targetValue) === 0;
                        break;
                    
                    // attr 属性值是以 targetValue 结尾的字符串
                    // 如 class="abc" => [class$="c"]
                    case '$=':
                        ret = value.indexOf(targetValue) === value.length - targetValue.length;
                        break;

                    default:
                        ret = value === targetValue;
                }
                return ret && (!selector || arguments.callee(elem, selector));

            } else {
                // 因为 ID 和 CLASS 都是以一个字符开头，如# 或 
                var targetID = (match[2] || '#').slice(1),
                    targetClass = (match[3] || '.').slice(1);

                var tag = elem.tagName.toLowerCase(),
                    id = (attrs.id || {}).value || '',
                    cls = fc.trim(elem.className);
                
                return (!match[1] || tag === match[1])
                        && (!targetID || id === targetID)
                        && (!targetClass || classExpr(targetClass).test(cls));
            }
        }
    };


    // ======================== className ==========================
    var classUtil = function() {
        var supportHTML5 = 'classList' in document.createElement('div');

        function split(className, callback) {
            fc.each(className.split(' '), function(item) {
                if (item) callback(item);
            });
        }
        return {
            add: supportHTML5 ? 
                function(elem, cls) {
                    var list = elem.classList;
                    split(cls, function(item) {
                        list.add(item);
                    });
                } :
                function(elem, cls) {
                    var className = fc.trim(elem.className);
                    split(cls, function(item) {
                        if (classUtil.has(elem, item)) return;
                        if (className) {
                            className += ' ';
                        }
                        className += item;
                    });
                    elem.className = className;
                },

            remove: supportHTML5 ? 
                function(elem, cls) {
                    var list = elem.classList;
                    split(cls, function(item) {
                        list.remove(item);
                    });
                } :
                function(elem, cls) {
                    var className = fc.trim(elem.className);
                    if (!className) return;

                    split(cls, function(item) {
                        if (!classUtil.has(elem, item)) return;
                        className = className.replace(classExpr(item), ' ');
                    })
                    elem.className = className;
                },

            toggle: supportHTML5 ?
                function(elem, cls) {
                    elem.classList.toggle(cls);
                } :
                function(elem, cls) {
                    if (classUtil.has(elem, cls)) {
                        classUtil.remove(elem, cls);
                    } else {
                        classUtil.add(elem, cls);
                    }
                },

            has: supportHTML5 ?
                function(elem, cls) {
                    return elem.classList.contains(cls);
                } :
                function(elem, cls) {
                    return classExpr(cls).test(elem.className);
                }
        };
    }();

    // =========================== 显示隐藏 ===============================
    var displayUtil = function() {
        // 存储 { div: 'block', a: 'inline' } 之类的值
        var display = { };

        return {
            show: function(elem) {
                if (fc.css(elem, 'display') !== 'none') return;

                var style = elem.style;
                style.display = '';

                if (fc.css(elem, 'display') === 'none') {
                    var tag = elem.tagName.toLowerCase();
                    if (display[tag]) {
                        style.display = display[tag];
                    } else {
                        var node = fc.create(elem.tagName);
                        document.body.appendChild(node);

                        style.display = display[tag] = fc.css(node, 'display');

                        document.body.removeChild(node);
                        node = null;
                    }
                }
            },
            hide: function(elem) {
                elem.style.display = 'none';
            }
        };
    }();

    
    return {

        /**
         * 通过一段HTML创建一个DOM元素
         * 如 create('div') 或 create('<div>123</div>')，不要用它创建一些特殊标签，特别是table相关的
         * @param {String} html
         * @return {HTMLElement}
         */
        create: function(html) {
            if (htmlExpr.test(html)) {
                var div = document.createElement('div');
                div.innerHTML = fc.trim(html);
                return div.children[0];
            } else {
                return document.createElement(html.toLowerCase());
            }
        },
        contains: function(container, elem) {
            // for more: http://ejohn.org/blog/comparing-document-position/
            if (container === elem) return true;
            
            // DOM leve 3 spec 
            // IE supported since IE9, but only works in IE9 mode
            if (container.compareDocumentPosition) {
                return !!(container.compareDocumentPosition(elem) & 16);
            }

            // IE6-8
            if (container.contains && container.nodeType === 1) {
                return container.contains(elem);    
            }
        },
        /**
         * 获取父元素，或者根据 fn 获取某个祖先元素
         * fn 还可以是选择器
         */
        parent: function(elem, fn) {
            if (fn == null) {
                return elem.parentNode;
            } else {
                if (typeof fn === 'string') {
                    var selector = fn;
                    fn = function(elem) { return matchElement(elem, selector) };
                }
                while (elem && elem.tagName !== 'BODY' && !fn(elem)) {
                    elem = elem.parentNode;
                }
                return elem && elem.tagName !== 'BODY' ? elem : null;
            }
        },
        is: matchElement,
        addClass: function(elem, cls) {
            if (cls.split(' ').length > 0) {
                classUtil.add(elem, cls);
            } else if (!classUtil.has(elem, cls)) {
                classUtil.add(elem, cls)
            }
        },
        removeClass: function(elem, cls) {
            if (cls.split(' ').length > 0) {
                classUtil.remove(elem, cls);
            } else if (classUtil.has(elem, cls)) {
                classUtil.remove(elem, cls);
            }
        },
        toggleClass: classUtil.toggle,
        hasClass: classUtil.has,
        show: displayUtil.show,
        hide: displayUtil.hide,

        /**
         * 比如<ul>，如果想让其中唯一一个li具有某个className，就必须让其他li不具有该className
         */
        toggleSingle: function(cls, elem, elems) {
            this.addClass(elem, cls);
            for (var i = 0, len = elems.length; i < len; i++) {
                if (elems[i] !== elem) {
                    this.removeClass(elems[i], cls);
                }
            }
        }
    };
})());

// ============================================ attr ==========================================
// ============================ 不写这个模块还真不行，IE7真是弱爆了 ===========================
fc.extend((function() {
    var div = fc.create('div');
    div.setAttribute('className', 'a');
    
    var advanced = div.className !== 'a',
        getAttribute = advanced ?
    
    function(elem, name) {
        return elem.getAttribute(name);
    } :

    function(elem, name) {
        var value = elem.getAttribute(name);
        if (!value) {
            var node = elem.attributes[name];
            value = node ? node.nodeValue : null;
        }
        return value;
    };

    return {
        attr: function(elem, name, value) {
            if (typeof value === 'undefined') {
                var ret = getAttribute(elem, name);
                return ret != null ? ret : '';
            } else {
                elem.setAttribute(name, value);
            }
        }
    };
})());

// ========================= CSS ==============================
// 对外暴露三个方法：css()  width()  height()
fc.extend((function() {
    
    var 
    // 数值，有单位
    numExpr = /^([-+]?(?:\d*?\.)?\d+?)([^\d\s]+)?$/,
    // 数值，单位是px
    numpxExpr = /^[-+]?(?:\d*?\.)?\d+?px$/i,
    // 数值，单位不是 px
    numnonpxExpr = /^[-+]?(?:\d*?\.)?\d+?(?!px)[^\d\s]+$/i,
    // 非负值属性
    nonNegative = /width|height/i,
    // 位置
    positionExpr = /^(?:top|right|bottom|left)$/,
    // IE 的透明度
    ieOpacityExpr = /alpha\s*?\(\s*?opacity\s*?=\s*?(\d+?)\s*?\)/i,
    // 下面这些样式不以 px 为单位
    cssNumber = {
        fillOpacity: true,
		fontWeight: true,
		opacity: true,
		zIndex: true,
		zoom: true
    },

    getComputedStyle = document.defaultView && document.defaultView.getComputedStyle ?

    function(elem, name) {
        name = fc.capitalize(name, true);
        
        var defaultView = elem.ownerDocument.defaultView,
            computedStyle = defaultView.getComputedStyle(elem, null);

        return computedStyle.getPropertyValue(name);
    } :

    function(elem, name) {
        var ret;

        // 特殊优先，代码从写法上比较好看
        if (name === 'opacity') {
            ret = elem.filters.alpha != null ? elem.filters.alpha.opacity : 100;
            return ret / 100;
        }

        ret = elem.currentStyle[name];

        if (ret === 'medium' && name.indexOf('border') === 0) {
            ret = '0px';

        } else if (numnonpxExpr.test(ret)) {
            var style = elem.style,
                left = style.left,
                rsLeft = elem.runtimeStyle.left;

            elem.runtimeStyle.left = elem.currentStyle.left;
            style.left = ret;
            ret = style.pixelLeft + 'px';

            style.left = left;
            elem.runtimeStyle.left = rsLeft;
        }
        return ret;
    };
    

    /**
     * 封装 getComputedStyle() 
     * 因为 computedStyle 有些结果不能直接用，需要二次处理
     * @param {HTMLElement} elem
     * @param {String} name 样式名
     */
    function getStyle(elem, name) {
        var ret = getComputedStyle(elem, name);
        if (ret === 'auto' && positionExpr.test(name)) {
            if (getStyle(elem, 'position') !== 'absolute') {
                ret = '0px';
            } else {
                ret = boxModel.padding(elem.offsetParent, name) + 'px';
            }
        }
        if ((ret === 'auto' || ret === '0px') && (name === 'width' || name === 'height')) {
            ret = boxModel[name](elem) + 'px';
        }

        if (numpxExpr.test(ret)) {
            // 是数值且单位是px，直接返回数字比较方便
            return parseFloat(ret, 10) || 0;
        } else {
            return ret;
        }
    }

    /**
     * 设置单个样式
     */
    function setStyle(elem, name, value) {
        if (name === 'opacity') {
            batchStyle(elem, 'opacity:' + value);
            return;
        } 
        name = compat.getName(name);

        if (numExpr.test(value)) {
            var temp = RegExp.$1;
            if (nonNegative.test(name)) {
                value = Math.max(0, temp);
            }
            if (!cssNumber[name]) {
                value += 'px';
            }
        }
        
        if (value !== '') {
            elem.style[name] = value;
        } else if (elem.style[name] != null) {
            elem.style[name] = null;
        }
    }

    /**
     * 批量设置样式
     * @param {HTMLElement} elem
     * @param {String|Object} obj 样式文本或样式对象
     */
    function batchStyle(elem, obj) {
        var text = obj;
        if (typeof text !== 'string') {
            text = '';
            fc.each(obj, function(value, key) {
                text += key + ':' + value + ';';
            });
        }
        text = compat.formatStyle(text);

        var style = elem.style,
            css = fc.trim(style.cssText);
        if (css) {
            if (css.slice(-1) !== ';') {
                css += ';';
            }
            text = css + text;
        }
        style.cssText = text;
    }

    /**
     * 样式名和样式值的兼容处理
     * 主要用于样式设置
     */
    var compat = function() {
        var div = fc.create('<div style="float:left;"></div>'),
            style = div.style,

            // 透明度
            opacityExpr = /opacity\s*?:\s*?([.\d]+)\s*?;?/g,

            vendorPrefixes = ['ms', 'Webkit', 'Moz', 'O'],
            cssProps = {
                'float': style.cssFloat ? 'cssFloat' : 'styleFloat'
            },
            supportOpacity = 'opacity' in style;
        
        div = null;
        /**
         * 获得浏览器可用的属性
         */
        function getVendorStyleName(name) {
            if (name in style) return name;

            var capName = fc.capitalize(name),
                origName = name,
                i = vendorPrefixes.length;

            while (i--) {
                name = vendorPrefixes[i] + capName;
                if (name in style) {
                    return name;
                }
            }

            return origName;
        }

        return {
            
            getName: function(name) {
                return cssProps[name] || (cssProps[name] = getVendorStyleName(name));
            },

            /**
             * 解析大段样式，格式化成符合当前浏览器的格式
             */
            formatStyle: function(text) {
                if (!supportOpacity) {
                    text = text.replace(opacityExpr, function($0, $1) {
                        return 'filter:alpha(opacity=' + ($1 * 100) + ');';
                    });
                }
                return text;
            }
        };

    }();

    var boxModel = function() {
        var style = document.documentElement.style,
            supportBoxSizing = compat.getName('boxSizing') in style,
            cssExpand = {
                width: ['left', 'right'],
                height: ['top', 'bottom']
            },
            cssShow = {
                position: 'absolute',
                display: 'block',
                visilibity: 'hidden'
            };

        // 释放内存
        style = null;

        function swap(elem, callback) {
            var style = elem.style,
                temp = {};

            for (var name in cssShow) {
                temp[name] = style[name];
                style[name] = cssShow[name];
            }

            var ret = callback();

            for (name in temp) {
                style[name] = temp[name];
            }

            return ret;
        };

        var exports = {
            /**
             * 获取是哪种盒模型
             * @param {HTMLElement} elem
             */
            getName: function(elem) {
                return supportBoxSizing ? getStyle(elem, 'boxSizing') : 'content-box';
            }
        };

        fc.each(['border', 'padding'], function(prop) {

            /**
             * 获得 border 的像素值
             * @param {HTMLElement} elem
             * @param {String} name 合法值只有6个：top right bottom left width height
             *                            其中 width 等同于 ['left', 'right'] 
             *                            height 等同于 ['top', 'bottom']
             * @return {Number}
             */
            exports[prop] = function(elem, name) {
                if (cssExpand[name]) {
                    name = cssExpand[name];
                }
                if (typeof name === 'string') {
                    name = [name];
                }
                var ret = 0;

                for (var i = 0, len = name.length, key, value; i < len; i++) {
                    key = name[i];
                    key = fc.capitalize(key);

                    key = prop + key;
                    if (prop === 'border') {
                        key += 'Width';
                    }

                    value = parseFloat(getStyle(elem, key), 10);
                    ret += value;
                }
                return ret;
            };

        });

        fc.each(['width', 'height'], function(prop) {

            /**
             * 获得真实设置的 width / height
             */
            exports[prop] = function(elem) {
                var value = elem['offset' + fc.capitalize(prop)];
                
                if (value > 0) {
                    if (this.getName(elem) === 'content-box') {
                        return value - this.border(elem, prop) - this.padding(elem, prop);
                    } else {
                        return value;
                    }
                } else if (getStyle(elem, 'display') === 'none') {
                    return swap(elem, function() {
                        return boxModel[prop](elem);
                    });
                } else {
                    return value;
                }
            };

        });

        return exports;
    }();

    var exports = {
        /**
         * 这个方法有3种用途
         * 1. 获得 elem 的 name 样式
         * 2. 设置 elem 的样式 name 为 value
         * 3. 批量设置 elem 的样式
         *
         * @param {HTMLElement} elem
         * @param {String} name 样式名称 或 批量样式
         * @param {String} value 如果是有单位的样式，如width，传入 100，会自动加上 px，也可指定单位
         */
        css: function(elem, name, value) {
            if (!name) return;

            if (typeof name !== 'string' || name.indexOf(':') !== -1) {
                // 批量设置样式
                batchStyle(elem, name);
                return;
            }

            name = fc.camelize(name);

            if (typeof value !== 'undefined') {
                setStyle(elem, name, value);
            } else {
                return getStyle(elem, name);
            }
        }
    };

    fc.each(['width', 'height'], function(prop) {
        
        // 重点说下setter，以 width 举例
        // 1. 如果 elem 的盒模型是 content-box, value 则特指"width"
        // 2. 如过 elem 的盒模型是 border-box, value 则特指 border + padding + width, 
        //    因此实际的width = value - border - padding
        exports[prop] = function(elem, value) {
            if (typeof value === 'undefined') {
                return getStyle(elem, prop);
            } else {
                if (boxModel.getName(elem) === 'border-box') {
                    value = parseFloat(value, 10) - boxModel.border(elem, prop) - boxModel.padding(elem, prop);
                }
                setStyle(elem, prop, value);   
            }
        };
    });

    return exports;
})());


// ============================= 位置 ====================================
// 对外暴露接口：position() offset()
// 返回格式统一为：{ left: xx, top: xx }  xx 类型为 Number
fc.extend((function() {

    var exports = {
        // elem 相对于文档的位置
        position: function(elem) {
            var fixed = fc.css(elem, 'position'),
                bound = elem.getBoundingClientRect(),
                html = document.documentElement,
                body = document.body,
                scrollLeft = fixed ? 0 : html.scrollLeft || body.scrollLeft,
                scrollTop = fixed ? 0 :  html.scrollTop || body.scrollTop,
                clientLeft = html.clientLeft || body.clientLeft,
                clientTop = html.clientTop || body.clientTop;

            return {
                left: bound.left + scrollLeft - clientLeft,
                top: bound.top + scrollTop - clientTop
            };
        },
        // elem 相对于 base 的位置
        offset: function(elem, base) {
            var left = 0, top = 0;
            if (elem !== document.body && (base = base || elem.parentNode)) {
                var pos = this.position(elem);
                left = pos.left + base.scrollLeft;
                top = pos.top + base.scrollTop;
                pos = this.position(base);
                left -= pos.left;
                top -= pos.top;
            }
            return { left: left, top: top };
        },
        /**
         * elem 基于 base 居中定位
         * 如果没有指定 base，默认基于document.body
         * 严重注意：
         * elem 和 base 是 container 的子元素, 因为要考虑 scrollTop 所以切记
         */
        center: function(elem, base, container) {
            base = base || document.body;
            container = container || document.body;

            var pos = fc.offset(base, container),
                centerX = pos.left + base.offsetWidth / 2,
                centerY = pos.top + base.offsetHeight / 2;

            var x = centerX - elem.offsetWidth / 2,
                y = centerY - elem.offsetHeight / 2;

            fc.css(elem, 'position', 'absolute');
            fc.css(elem, 'left', x);
            fc.css(elem, 'top', y);
        }
    };

    return exports;
})());


// =============================== Ajax =======================================
// 这个模块仅用于测试组件，不要用于项目
fc.ajax = (function() {
    /**
     * 请求一个资源
     * @param {String} url The resource url
     * @param {String} method "get" or "post"
     * @param {Object} data The request data
     * @param {Function} callback Call it once the response data has been received
     */
    function request(url, method, data, callback) {
        // IE7+ 已经支持 XMLHttpRequest
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if ((status >= 200 && status < 300) || status == 304) {
                    callback(xhr.responseText);
                } else {
                    callback();
                }
            }
        };
        xhr.open(method, url, true);
        xhr.send(data || null);
    }

    function jsonCallback(callback) {
        return function(json) {
            callback(fc.parseJSON(json));
        };
    }
    return {

        get: function(url, callback) {
            request(url, 'get', null, jsonCallback(callback));
        },
        /**
         * use for loading a file
         */
        loadFile: function(url, callback) {
            request(url, 'get', null, callback);
        }
    };
})();


fc.data = (function() {
    // 在最开始，把 【依赖的外部方法】 或 【应该依赖外部而外部没有的方法】 列出来
     
    // 所有数据都通过 cache 进行管理
    // 结构如下：
    // {
    //    id: {
    //        // 基础库用到的数据
    //        internal: {
    //            event: { 事件模块用的数据 }
    //        },
    //        // 应用层数据
    //        external: { 外部使用 }
    //    }
    // }
    var cache = {},
        deletedIds = [],
        uuid = 0;

    // 内部数据和外部数据使用的命名空间
    var INTERNAL = 'internal',
        EXTERNAL = 'external';

    // 有些 DOM 元素不支持 elem[fc.expando] = 1 的写法，这么赋值会直接报错，而且 catch 不住
    var noData = {
        'embed' : true,
		'applet': true,
		'object': 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'      
    };

    /**
     * 判断 elem 是否支持 data
     * elem 可以是 HTMLElement document window 或 object
     */
    function acceptData(elem) {
        var nodeType = elem.nodeType;
        if (fc.type(nodeType, 'number')) {
            if (nodeType !== 1 && nodeType !== 9) return false;

            var match = noData[elem.tagName.toLowerCase()];
            if (match) {
                return !(match === true || match !== elem.getAttribute('classid'));
            }
        }
        return true;
    }

    // 写几个工具方法，不然下面的逻辑会有重复
    /**
     * 创建新ID
     */
    function createID() {
        return deletedIds.length ? deletedIds.pop() : ++uuid;
    }
    /**
     * 通过参数 id 获取真正的 id
     * @return {Object} {isnew: true, value: xx} 如果是新创建的id，isnew为true
     */
    function getID(elem) {
        if (!elem) return;

        if (fc.type(elem, ['number', 'string'])) {
            return elem;
        } else if (fc.isWindow(elem) || !elem.getAttribute) {
            return elem[fc.expando];
        } else if (elem.getAttribute) {
            return elem.getAttribute(fc.expando);
        }
    }

    /**
     * 初始化数据源
     */
    function initSource(id, pvt) {
        var obj = cache[id],
            path = pvt ? INTERNAL : EXTERNAL;

        if (!obj) {
            obj = cache[id] = {};
        }
        return obj[path] = {};
    }

    function formatArgs(args, action) {
        if (action === 'add') {
            if (!args[0].nodeType && (fc.type(args[1], 'boolean') || args[1] == null)) {
                args[2] = args[1];
                args[1] = args[0];
                args[0] = null;
            }
        } else {
            if (fc.type(args[1], 'boolean')) {
                args[2] = args[1];
                args[1] = null;
            }
        }
    } 

    function isEmpty(obj) {
        var internal = obj[INTERNAL];
        for (var key in internal) {
            return false;
        }

        var external = obj[EXTERNAL];
        for (key in external) {
            return false;
        }
        return true;
    }
    /**
     * 访问 internal 或 external 数据
     *
     * @param {Number} id
     * @param {Boolean} pvt
     * @param {String} action 传入方法名就行
     * @return {}
     */
    function accessData(id, pvt, action) {
        var obj = cache[id],
            source = pvt ? INTERNAL : EXTERNAL;

        if (action === 'add') {
            return obj && obj[source] ? obj[source] : initSource(id, pvt);
        } else {
            if (!obj) return;
            return obj[source];
        }
    }

    function bind(elem, id) {
        if (fc.isWindow(elem) || !elem.setAttribute) {
            elem[fc.expando] = id;
        } else if (elem.setAttribute) {
            elem.setAttribute(fc.expando, id);
        }
    }
    function unbind(elem) {
        if (!fc.type(elem, ['number', 'string'])) {
            if (fc.isWindow(elem) || !elem.setAttribute) {
                elem[fc.expando] = null;
            } else if (elem.removeAttribute) {
                elem.removeAttribute(fc.expando);
            }
        }
    }

    var methods = {};
    /**
     * @param {HTMLElement|*} elem 如果 elem 不是 DOM 元素，则elem是data
     * @param {*} data
     * @param {Boolean} pvt 暂时是事件模块会用到，别的地方别传
     * @return 返回获取数据使用的ID
     *
     * elem data pvt
     * data data pvt
     * data pvt
     */
    methods.add = function(elem, data, pvt) {
        if (!acceptData(elem)) return;

        formatArgs(arguments, 'add');

        var id = getID(elem);
        if (!id) {
            id = createID();
            elem && bind(elem, id);
        }
        
        var obj = accessData(id, pvt, 'add');
        fc.extend(obj, data);

        return id;
    };

    /**
     * 删除数据
     * @param {HTMLElement|Object|Number} elem
     * @param {String|Array} name 删除哪个字段
     * @return 返回删除的数据
     */
    methods.remove = function(elem, name, pvt) {
        formatArgs(arguments);
        
        var id = getID(elem),
            obj = accessData(id, pvt);

        if (!obj) return;
        
        var source = pvt ? INTERNAL : EXTERNAL;
        if (name) {
            if (!fc.isArray(name)) {
                delete obj[name];

            } else {
                fc.each(name, function(n) {
                    delete obj[n];
                });
            }
        } else {
            delete cache[id][source];
        }

        if (isEmpty(cache[id])) {
            deletedIds.push(id);
            unbind(elem);
        }
    };

    /**
     * 获取数据
     * @param {HTMLElement|Object|Number} elem
     * @param {String} name 取哪个字段的数据
     */
    methods.get = function(elem, name, pvt) {
        formatArgs(arguments);
        
        if (name && !methods.has(elem, name, pvt)) return;

        var id = getID(elem);
        if (!id) {
            id = createID();
            bind(elem, id);
        }

        var obj = accessData(id, pvt);
        
        if (!obj && pvt) {
            obj = initSource(id, pvt);
        }

        return !obj ? null : name ? obj[name] : obj;
    };

    methods.has = function(elem, name, pvt) {
        formatArgs(arguments);

        var id = getID(elem);
        if (!id) return false;

        var data = accessData(id, pvt);
        return !data ? false : (name ? !!data[name] : true);
    };

    // 对外暴露的接口
    var exports = { };

    fc.each('add remove get has'.split(' '), function(name) {
        exports[name] = function(a, b, c) {
            // 这三个方法都有三个形参，所以必须保证每个参数都传了
            return methods[name](a, b || null, c || false);
        };
        exports['_' + name] = function(a, b, c) {
            return this[name](a, b || null, true);
        };
    });

    return exports;
})();



/**
 * 事件代理只支持鼠标事件
 * 不支持代理 submit 之类的事件
 */
fc.event = (function() {

    /**
     * 经过封装的事件对象
     *
     * @param {Object|String} event 
     */
    function Event(event) {
        if (!(this instanceof Event)) {
            return new Event(event);
        }

        // 表示是DOM事件
        if (event.preventDefault != null ||  event.cancelBubble != null) {
            this._event = event;
            this.type = event.type;
            // 因为事件是从更底层冒泡上来的，如果底层的handler取消了默认行为，这里需要保持一致
            this._isPrevented = event.defaultPrevented 
                                || event.returnValue === false 
                                || event.getPreventDefault && event.getPreventDefault();
            // 默认是false，不可能是true，因为停止冒泡后，上层元素根本接收不到事件
            this._isStoped = false;
            // 这是 DOM LEVEL 3 EVENT
            this._isImmediatedStoped = false;
        } else {
            if (typeof event === 'string') {
                this.type = event;
            } else {
                fc.extend(this, event);
            }
        }

        this.timeStamp = event && event.timeStamp || fc.now();
        this[fc.expando] = true;
    }

    Event.prototype = {
        preventDefault: function() {
            this._isPrevented = true;

            var e = this._event;
            if (!e) return;

            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
        },
        stopPropagation: function() {
            this._isStoped = true;

            var e = this._event;
            if (!e) return;

            e.stopPropagation && e.stopPropagation();
            e.cancelBubble = true;
        },
        /**
         * 可参考
         * https://developer.mozilla.org/zh-cn/DOM/event.stopImmediatePropagation
         */
        stopImmediatePropagation: function() {
            this._isImmediatedStoped = true;
            this.stopPropagation();
        },
        isDefaultPrevented: function() {
            return this._isPrevented;                    
        },
        isPropagationStopped: function() {
            return this._isStoped;                      
        },
        isImmediatePropagationStopped: function() {
            return this._isImmediatedStoped;
        }
    };

    // 处理浏览器原生事件
    var addEvent = document.addEventListener ?
                    function(elem, type, fn) {
                        elem.addEventListener(type, fn, false);
                    } :
                    function(elem, type, fn) {
                        elem.attachEvent('on' + type, fn);
                    },

        removeEvent = document.removeEventListener ?
                    function(elem, type, fn) {
                        elem.removeEventListener(type, fn, false);
                    } :
                    function(elem, type, fn) {
                        elem.detachEvent('on' + type, fn);
                    },

        fireEvent = document.createEvent ?
                    function(elem, type) {
                        var event = document.createEvent('HTMLEvents');
                        event.initEvent(type, true, true);
                        return elem.dispatchEvent(event);
                    } :
                    function(elem, type) {
                        var event = document.createEventObject();
                        return elem.fireEvent('on' + type, event);
                    },

        /**
         * 检测当前浏览器是否支持某事件
         * @param {String} type 事件名
         */
        isEventSupported = function(type) {
            // 某些元素特有的事件
            // 在这别写一些莫名其妙的事件
            // 只关注需要检测的事件，没谁会检测click吧。。。
            var EVENT_NODE = {
                input: 'input'
            };

            var tag = EVENT_NODE[type] || 'div',
                elem = document.createElement(tag);

            type = 'on' + type;
            var ret = type in elem;
            if (!ret) {
                elem.setAttribute(type, 'return;');
                ret = typeof elem[type] === 'function';
            }

            return ret;
        },

        /**
         * 获得最终绑定的事件
         * @param {String} type 事件名
         */
        getType = function(type) {
            var spec = special[type] || {};
            return spec.type || type;
        },

        /**
         * 执行事件处理函数
         * 注意：event 此时已设置handlerObj
         * @param {Event} event 封装后的事件对象
         * @param {Boolean} fromSpecial 可选，调用是否来自special.handler
         */
        handle = function(event, fromSpecial) {
            var obj = event.handlerObj,
                originType = obj.originType,
                handler = fromSpecial ? obj.handler : (special[originType] || {}).handler || obj.handler,
                type = event.type,
                ret;

            event.type = originType;
            ret = handler.call(obj.scope || event.currentTarget, event, obj.data);
            event.type = type;
            
            return ret;
        },

        // 特殊事件对象
        // focusin/focusout虽然在大部分浏览器可以冒泡，但FF不可以，所以等同视为不能冒泡，不想复杂化
        noBubble = ['focus', 'blur', 'focusin', 'focusout'],

        // 特殊事件
        special = { };


    // mouseenter/leave 统一用 mouseover/out 模拟
    // 虽然 mouseenter/leave 不能冒泡，但这里是用 mouseover/out 模拟，所以不需要加入 noBubble
    fc.each({ mouseenter: 'mouseover', mouseleave: 'mouseout' }, function(fix, orig) {
        special[orig] = {
            // 最终绑定的事件名称
            type: fix,

            handler: function(event, data) {
                var target = event.currentTarget,
                    related = event.relatedTarget,
                    handler = event.handlerObj.handler;
            
                // 如果鼠标移入移出浏览器窗口，related为null
                if (!related || (related !== target && !fc.contains(target, related))) {
                    return handle(event, true);
                }
            }
        };
    });
        
    var nativeEvents = [ [ 'input', 'propertychange' ], [ 'mousewheel', 'DOMMouseScroll' ]];
    fc.each(nativeEvents, function(item) {
        if (!isEventSupported(item[0])) {
            special[item[0]] = {
                type: item[1]
            };
        }
    });
    

    // 刚刚触发的是什么事件，用于避免重复触发
    var triggered;


    /**
     * 绑定事件，包括浏览器事件和自定义事件
     * @param {HTMLElement} elem
     * @param {String} selector
     * @param {String} type
     * @param {Function} fn
     * @param {Object} scope
     * @param {Object} data
     */
    function add(elem, selector, type, fn, scope, data) {
        // 不支持文本节点 和 注释节点
        if (elem.nodeType === 3 || elem.nodeType === 8 || !type || !fn) {
            return;
        }

        if (selector && fc.inArray(type, noBubble) !== -1) {
            alert('"' + type + '" 不支持冒泡，请直接绑定到目标元素');
            return;
        }

        var eventData = fc.data._get(elem),
            events = eventData.events;
        if (!events) {
            events = eventData.events = {};
        }

        var handler = eventData.handler;
        if (!handler) {
            var eventHandler;
            if (type === 'resize') {
                var resizeTimer = null;
                eventHandler = function(e) {
                    if (resizeTimer) return;
                    resizeTimer = setTimeout(function() {
                        dispatch.call(handler.elem, { type: 'resize' });
                        resizeTimer = null;
                    }, 100);
                };
            } else {
                eventHandler = function(e) {
                    e = e || window.event;
                    if (e.type === 'propertychange' && e.propertyName !== 'value') {
                        return;
                    }
                    return e.type != triggered ? dispatch.call(handler.elem, e) : undefined;
                };
            }
            handler = eventData.handler = eventHandler;
            handler.elem = elem;
        }
        
        var handlerObj = {
            originType: type,
            handler: fn,
            scope: scope,
            data: data,
            selector: selector
        };

        type = getType(type);
        // 修正后的type
        handlerObj.type = type;

        var handlers = events[type];
        if (!handlers) {
            handlers = events[type] = [];
            handlers.delegateCount = 0;

            if (fc.isWindow(elem) || elem.nodeType) {
                addEvent(elem, type, handler);
            }
        }

        if (selector) {
            handlers.splice(handlers.delegateCount, 0, handlerObj);
            handlers.delegateCount++;
        } else {
            handlers.push(handlerObj);
        }
        // 避免内存泄漏
        elem = null;
    }

    function remove(elem, selector, type, fn) {

        var eventData = fc.data._get(elem) || {},
            events = eventData.events;
        
        if (!events) return;

        if (!type) {
            // 移除所有事件
            for (type in events) {
                remove(elem, selector, type, fn);
            }
            return;
        }

        type = getType(type);

        var list = events[type];
        if (!list) return;

        if (fn) {
            // 移除单个 handler
            for (var i = list.length - 1, item; i >= 0; i--) {
                item = list[i];
                if (item.handler === fn) {
                    if (item.selector) {
                        list.delegateCount--;
                    }
                    list.splice(i, 1);
                }
            }
        } else {
            list.length = 0;
        }

        if (!list.length) {
            
            if (fc.isWindow(elem) || elem.nodeType) {
                removeEvent(elem, type, eventData.handler);
            }

            delete events[type];
        }
        
        if (fc.isEmptyObject(events)) {
            delete eventData.handler.elem;
            fc.data._remove(elem, ['events', 'handler']);
        }
    }

    function has(elem, selector, type, fn) {
        var eventData = fc.data._get(elem) || {},
            events = eventData.events;
        
        if (!events || !events[type] || !events[type].length) {
            return false;
        }

        var list = events[type];

        if (!selector && !fn) {
            return list && !list.length;
        }

        for (var i = 0, len = list.length; i < len; i++) {
            if (selector == list[i].selector && (!fn || fn === list[i].handler)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 此方法用于从接收到事件的元素向下派发事件，以便事件代理
     * @param {Object} event 原生事件对象
     */
    function dispatch(event) {
        event = fix(event);

        var eventData = fc.data._get(this),
            handler = eventData.handler,
            events = eventData.events,
            list = events[event.type],
            delegateCount = list.delegateCount;
        
        var handlerQueue = [];

        if (delegateCount) {
            var cur = event.target, match;

            while (cur && cur !== this) {
                match = getHandlerObjByElement(list, cur);
                if (match.length) {
                    handlerQueue.push({ elem: cur, match: match });
                }
                cur = cur.parentNode;
            }
        }
        
        if (list.length > delegateCount) {
            handlerQueue.push({
                elem: this,
                match: list.slice(delegateCount)
            });
        }

        for (var i = 0, len = handlerQueue.length; 
                i < len && !event.isPropagationStopped(); i++) {
            event.currentTarget = handlerQueue[i].elem;
            execHandlers(handlerQueue[i].match, event);
        }
    }

    /**
     * 触发事件
     * @param {HTMLElement|Object} elem 注册过事件的对象
     * @param {Event|String} event 事件或者事件名，只有内部才会传事件对象进来，外部统一用事件名即可
     */
    function trigger(elem, event) {
        if (elem.nodeType === 3 || elem.nodeType === 8) return;

        // 确保是 Event 对象
        event = event[fc.expando] ? event : Event(event);
        
        // 如果event传入的是事件名，肯定不存在 target 属性了
        if (!event.target) {
            event.target = elem;
        }
        var type = getType(event.type);

        // 先确定冒泡的路径
        var eventPath = [elem];
        
        // 如果 elem 是 HTML元素 才会存在冒泡
        var cur, old;
        if (elem.nodeType && fc.inArray(type, noBubble) === -1) {
            
            old = elem;
            cur = elem.parentNode;

            while (cur) {
                eventPath.push(cur);
                old = cur;
                cur = cur.parentNode;
            }

            if (old && old === elem.ownerDocument) {
                eventPath.push(old.defaultView || old.parentWindow  || window);
            }
        }

        // 遍历路径
        var handler, ontype = 'on' + type;
        for (var i = 0, len = eventPath.length; i < len && !event.isPropagationStopped(); i++) {
            cur = eventPath[i];

            handler = (fc.data._get(cur, 'events') || {})[type] &&  fc.data._get(cur, 'handler');
            handler && handler(event);

            // 处理onclick之类的事件
            handler = cur[ontype];
            if (handler && (handler(event) === false)) {
                event.preventDefault();
            }
        }

        // 默认行为
        if (elem.nodeType && !event.isDefaultPrevented()) {
            // 不处理跳转行为
            if (!(type === 'click' && elem.tagName === 'A') 
                && elem[type]
                // type 是focus/blur 时，目标元素不能是隐藏的
                && ((type !== 'focus' && type !== 'blur') || event.target.offsetWidth !== 0)) {
                
                old = elem[ontype];
                if (old) {
                    elem[ontype] = null;
                }

                triggered = type;
                elem[type]();
                triggered = undefined;

                if (old) {
                    elem[ontype] = old;
                }
            }
        }
    }

    /**
     * 一个工具方法，从 dispatch() 里抽出来的
     * @param {Array} array
     * @param {HTMLElement} elem
     */
    function getHandlerObjByElement(array, elem) {
        var ret = [];
        for (var i = 0, len = array.delegateCount; i < len; i++) {
            if (fc.is(elem, array[i].selector)) {
                ret.push(array[i]);
            }
        }
        return ret;
    }

    /**
     * 批量执行handler
     */
    function execHandlers(handlerObjs, event) {
        var elem = event.currentTarget;

        for (var i = 0, len = handlerObjs.length; 
                i < len && !event.isImmediatePropagationStopped(); i++) {
            
            event.handlerObj = handlerObjs[i];
            
            if (handle(event) === false) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }
    
    
    /**
     * 修正事件对象
     */
    function fix(event) {
        // 已经是封装过的事件对象
        if (event[fc.expando]) return event;

        var origin = event,
            hook = fixHooks[event.type] || {},
            copy = hook.props ? props.concat(hook.props) : props;

        event = new Event(origin);
        
        fc.each(copy, function(prop) {
            event[prop] = origin[prop];
        });

        // 修正target
        var target = event.target;
        if (!target) {
            target = event.target = origin.srcElement;
        }

        // target 不能是文本节点
        if (target && target.nodeType === 3) {
            event.target = target.parentNode;
        }

        // 鼠标事件和键盘事件都可能存在 metakey, 但是这个键在pc的键盘上是没有对应键位的，Mac键盘的
        // command键可以视为 metakey，但是你会用这个键做什么呢？这里直接无视了
        return hook.filter ? hook.filter(event, origin): event;
    }

    // 鼠标事件和键盘事件公有的属性
    // 不通用的事件属性通通不要，如 bubbles cancelable eventPhase, IE 根本没有对应属性
    // http://www.w3school.com.cn/htmldom/dom_obj_event.asp
    var props = 'target,altKey,ctrlKey,shiftKey,which'.split(',');
    
    var mouseHooks = {
        // 鼠标事件独有属性
        props: 'relatedTarget,button,clientX,clientY,offsetX,offsetY,pageX,pageY,screenX,screenY'.split(','),
        
        // 修正 mouseHooks.props 中的某些属性的兼容性问题
        filter: function(event, origin) {
            var eventDoc, doc, body;
            // 修正 pageX/Y
            if (event.pageX == null && origin.clientX != null) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = origin.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
				event.pageY = origin.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
			}

            // FF 不支持offsetX/Y
            var pos;
            if (event.offsetX == null) {
                pos = fc.position(event.target);
                event.offsetX = event.pageX - pos.left;
                event.offsetY = event.pageY - pos.top;
            }

			// 修正 relatedTarget
            var fromElement = origin.fromElement;
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? origin.toElement : fromElement;
			}

            // 鼠标滚轮, FF支持detail[+-3]， 其他浏览器支持wheelDelta[+-120]，FF的正负值还是相反
            var wheelDelta = origin.wheelDelta || origin.detail;
            if (wheelDelta != null) {
                event.wheelDelta = Math.abs(wheelDelta) > 3 ? wheelDelta / 40 : -wheelDelta;
            }

// 标准浏览器 左中右 对应 0 1 2
//        IE  左中右 对应 1 4 2
var button = origin.button;
if (button !== undefined) {
    event.button = button & 1 ? 1 : (button & 2 ? 3 : ( button & 4 ? 2 : 0 ));
}

			return event;
        }
    },
    keyHooks = {
        props: 'char charCode key keyCode'.split(' '),
        filter: function(event, origin) {
            if ( event.which == null ) {
				event.which = origin.charCode != null ? origin.charCode : origin.keyCode;
			}
            return event;
        }
    };

    // 处理 DOM事件 的兼容性，这里主要是鼠标和键盘事件
    var mouseEventExpr = /^(?:mouse|contextmenu)|click/,
        keyEventExpr = /^key/,
        // 存储每个事件对应的hook
        fixHooks = {};
    
    var exports = {
        on: function(elem, selector, type, fn, scope, data) {
            if (typeof type === 'string') {
                add(elem, selector, type, fn, scope, data);
            } else {
                add(elem, undefined, selector, type, fn, scope);
            }
        },
        un: function(elem, selector, type, fn) {
            if (typeof type === 'string') {
                remove(elem, selector, type, fn);
            } else {
                remove(elem, undefined, selector, type);
            }
        },
        has: function(elem, selector, type, fn) {
            if (typeof type === 'string') {
                return has(elem, selector, type, fn);
            } else {
                return has(elem, undefined, selector, type);
            }
        },
        fire: function(elem, event) {
            trigger(elem, event);
        },
        // 禁止选择文本
        disableSelect: function(elem) {
            elem = elem || document.body;
            var name = 'selectstart';
            if (isEventSupported(name)) {
                // selectstart事件只能用level 0 DOM格式
                elem['on' + name] = function() {
                    return false;
                };
            } else {
                // 用css解决
                fc.addClass(elem, 'fc-unselectable');
            }
        },
        // 开启选择文本（默认就是开启的）
        enableSelect: function(elem) {
            elem = elem || document.body;
            var name = 'selectstart';
            if (isEventSupported(name)) {
                elem['on' + name] = function() {
                    return true;
                };
            } else {
                // 用css解决
                fc.removeClass(elem, 'fc-unselectable');
            }         
        }
    };

    var eventList = 'blur focus load resize scroll unload click dblclick ' +
                    'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave mousewheel ' +
                    'select submit keydown keypress keyup error input change';

    fc.each(eventList.split(' '), function(type) {
        exports[type] = function(elem, fn, scope, data) {
            add(elem, undefined, type, fn, scope, data);
        };

        if (mouseEventExpr.test(type)) {
            fixHooks[type] = mouseHooks;
        }
        if (keyEventExpr.test(type)) {
            fixHooks[type] = keyHooks;
        }
    });

    return exports;
})();


// 本地存储
fc.storage = {
    set: function(key, value, cb) {
         FlashStorager.set(key, value, cb);
    },
    get: function(key, cb) {
         return FlashStorager.get(key, cb);
    }
};

/**
 * 获得浏览器Logo，主要是区分IE7/8 和 CSS3
 */
fc.logo = function() {
    // 用 userAgent 不靠谱，IE9 切到 IE78 也会显示 IE9
    if (document.addEventListener) {
        return 'placeholder' in fc.create('input') ? 'CSS3' : 'IE9';
    }
    var radio = fc.create('<input type="radio" />');
    if (fc.attr(radio, 'checked') === false) return 'IE7';
    return 'IE8';
}();

fc.tpl = {
    parse: lib.tpl.parseTpl
};

fc.common = {};
fc.module = {};
