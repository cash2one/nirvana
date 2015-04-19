/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: core/common/attrHelper.js
 * desc: 提供属性数据读写功能，可以通过继承该属性助手，来为类提供属性的读写功能
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/02/18 $
 */
nirvana.attrHelper = function(T) {

    return {
        /**
         * 初始化存储上下文属性值信息的数据对象, 可以多次调用，原有属性值不会被清空，
         * 用于批量初始化属性值，避免多次调用setAttr。这个方法需要在使用其它方法前调用
         * @param {Object} obj 要初始化的属性值对象，可选
         */
        initAttrs: function(obj) {
            this._data = T.object.extend(this._data || {}, obj || {});
        },
        /**
         * 创建属性的Getter方法，产生的getter方法，将会把传入的属性名第一个字符转成大写
         * @param {...string} attrNames 可变长的属性名列表
         * @example
         *      <code>
         *          this.createAttrGetter('name', 'Age')
         *          // 这将生成如下getter方法：
         *          this.getName();
         *          this.getAge();
         *      </code>
         */
        createAttrGetter: function(attrNames) {
            var attrArr = arguments;
            var name;
            var newName;
            var me = this;

            for (var i = attrArr.length; i --;) {
                name = attrArr[i];
                newName = name.replace(/^(\w)/, function(w) {
                    return w.toUpperCase();
                });
                me['get' + newName] = function() {
                    return me.getAttr(name);
                };
            }
        },
        /**
         * 获取指定属性名的属性值，如果未指定则返回所有的属性值对
         * @param {string} attrName 要获取的属性名
         * @return {*}
         */
        getAttr: function(attrName) {
            return attrName ? (this._data && this._data[attrName]) : this._data;
        },
        /**
         * 设置当前上下文的属性值信息，用于存储一些数据信息
         * @param {string} attrName 要设置的属性名
         * @param {*} value 要设置的属性值
         */
        setAttr: function(attrName, value) {
            this._data && (this._data[attrName] = value);
        },
        /**
         * 清空属性信息
         */
        clearAttr: function() {
            this._data && (this._data.length = 0);
        }
    };
}(baidu);