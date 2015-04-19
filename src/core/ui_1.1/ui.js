/**
 * @file core/ui_1.1/ui.js namespace
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

fc.ui = {
    /**
     * 获得当前页面中可用的某个UI
     * @param {String} id
     * @param {String} type 可选，指定 ui 类型
     */
    get: null,

    /**
     * 传入容器元素，或者具体的UI元素进行初始化
     */
    init: function(elems) {
        if (!fc.isArray(elems)) {
            elems = $$('*[_ui*="type"]', elems);
        }
        fc.ui.Base.init(elems);
    },

    /**
     * 传入容器元素
     */
    dispose: function(elem) {
        var all = fc.ui.get();
        for (var id in all) {
            if (fc.contains(elem, all[id].node)) {
                all[id].dispose();
            }
        }
    },

    /**
     * UI 继承方法
     * 这里规定classImp 的格式:
     *  1. 类的属性写在构造函数中
     *  2. 类的方法写在原型中
     *  @param {Function} superClass
     *  @param {Function} classImp
     */
    extend: function(superClass, classImp) {
        if (typeof superClass !== 'function' || typeof classImp !== 'function') {
            alert('[Error]错误的父类或子类');
            return;
        }

        // 父类的原型
        var _super = superClass.prototype,
            prototype = classImp.prototype,
            fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

        for (var name in _super) {
            // 继承方法
            if (typeof _super[name] === 'function') {
                // 继承子类没有重写的方法
                if (prototype[name] == null) {
                    prototype[name] = _super[name];

                // 处理子类重写的方法, 且子类的方法中使用了 this._super(arguments)
                } else if (typeof prototype[name] === 'function' && fnTest.test(prototype[name])) {
                    prototype[name] = (function(name, fn) {
                                            return function() {
                                                var temp = this._super;
                                                
                                                this._super = _super[name];
                                                var ret = fn.apply(this, arguments);
                                            
                                                this._super = temp;
                                                if (!temp) {
                                                    delete this._super;
                                                }
                                                return ret;
                                            };
                                        })(name, prototype[name]);
                }
            }
        }
        
        prototype.constructor = classImp;
        classImp.prototype = null;

        // prototype是子类的原型
        function Class() {
            var temp = this._super;

            if (fnTest.test(classImp)) {
                this._super = function() {
                    superClass.apply(this, arguments);
                };
            }
            classImp.apply(this, arguments);
            this._super = temp;
            if (!temp) {
                delete this._super;
            }
        }
        // 类的静态方法
        for (var key in classImp) {
            Class[key] = classImp[key];
        }
        Class.prototype = prototype;

        return Class;
    }
};