/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/recmword2/RecmwordOptCtrl.js
 * desc: 智能提词包交互升级的优化建议组件，扩展自AoPkgOptimizerCtrl.js
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/02/19 $
 */
nirvana.aoPkgControl.RecmwordOptCtrl = nirvana.aoUtil.extendClass(nirvana.aoPkgControl.AoPkgOptimizerCtrl, {
    /**
     * @override
     */
    showLoading: function() {
        this.toggleLoading(true);
    },
    /**
     * @override
     */
    hideLoading: function() {
        this.toggleLoading(false);
    },
    toggleLoading: function(isShow) {
        var loadingEle = $$('#recmwordpkg-wrapper .recmword-pkg-loading')[0];
        isShow ? baidu.show(loadingEle) : baidu.hide(loadingEle);
    },
    /**
     * @override
     */
    renderContainer: function() {
    },
    /**
     * 事件绑定
     * @override
     */
    bindHandlers: function() {
    },
    /**
     * 显示空摘要信息
     * @override
     */
    showNoOptimizer: function() {
    },
    /**
     * @override
     */
    onafterRenderOptlist: function() {
    },
    /**
     * 展现某条摘要
     * @override
     */
    showOverviewItem: function(opttypeid, options) {
        var me = this;
        var item = me.getCache(opttypeid);
        options = options || {};
        nirvana.util.executeCallback('onAbstractLoad',
            [opttypeid, item, options.timeout], me);
    },
    /**
     * 获取指定优化项的摘要数据
     * @param {string} opttypeid 优化项的类型id
     * @return {Object}
     */
    getRecmwordOptData: function(opttypeid) {
        return this.getCache(opttypeid);
    },
    /**
     * 刷新某条优化项
     * @override
     */
    refreshOptItem: function(optid) {
    },
    /**
     * 刷新摘要优化项的成功返回处理函数
     * @override
     */
    refreshAbsItemSuccess: function(optid, targetid, oldreqid) {
    }
});
