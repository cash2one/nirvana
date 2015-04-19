/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/detail/DetailView.js
 * desc: AO优化包详情视图基类
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/03/12 $
 */
/**
 * 详情视图基类，目前主要包含两种子类：
 * 1）弹窗详情视图（PopupView）
 * 2）表哥详情视图（TableView）
 *
 * 对于表格视图又分成两种：
 * 1）分页表哥详情视图（PaginationView）
 * 2）推词详情视图（RecmwordView）
 *
 * 对于其它形式的详情视图，可以自己继承DetailView，对于其它形式的详情视图如果是基于表格或弹窗视图
 * 建议直接通过详情视图的配置属性extend进行重新定义，详见{@link viewUtil}的说明。
 *
 * 对于子类必须实现show接口。
 *
 * 关于详情视图展现等相关处理逻辑在{@link AoPkgDetailCtrl}定义，通常不需要修改该文件
 *
 * @class DetailView
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.DetailView = function($, T, nirvana) {
    function DetailView() {
    }

    DetailView.prototype = {
        /**
         * 该详情视图是否以弹窗方式显示，默认false
         * @return {boolean}
         */
        isPopup: function() {
            return false;
        },
        /**
         * 发送监控信息对象
         */
        logger: nirvana.AoPkgMonitor,
        /**
         * 初始化详情视图
         * @param {Object} initData 要初始化详情视图的数据
         * @param {number} initData.opttypeid 显示的详情所属的优化类型id
         */
        init: function(initData) {
            this.initAttrs(initData);
            this.createAttrGetter('opttypeid');
        },
        /**
         * 显示详情视图，子类需要实现该接口
         * @interface show
         */
        // show: new function(),
        /**
         * 关闭详情视图的事件处理器
         * @param {...*} args 关闭详情回调要传入的参数列表
         */
        closeView: function() {
            /**
             * 触发关闭视图的事件处理器
             * @event
             */
            nirvana.util.executeCallback('onClose', arguments, this);
        },
        /**
         * 详情里是否做过修改且已保存到服务端
         * @return {boolean}
         */
        hasModified: function() {
            return this.getAttr('hasModified');
        },
        /**
         * 设置是否详情信息发生过修改
         * @param {boolean} hasModified 是否有修改过
         * @protected
         */
        setModified: function(hasModified) {
            this.setAttr('hasModified', hasModified);
        },
        /**
         * 销毁当前详情视图实例
         */
        dispose: function() {
            this.clearAttr();
        }
    };

    // 支持属性读写功能
    T.extend(DetailView.prototype, nirvana.attrHelper);

    return DetailView;
}($$, baidu, nirvana);