/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/emergency/EmergencyPkg.js
 * desc: 突降急救包定义，扩展自aoPackage.js
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/01/05 $
 */
nirvana.EmergencyPackage = new nirvana.myPackage({
    /**
     * 渲染管理区的信息
     * @override
     */
    renderManager: function() {
        var me = this;
        var titleEle = me.getDOM('managerTitle');
        // 隐藏优化建议区的标题元素替换成Tab
        baidu.addClass(titleEle, 'hide');
        // 创建Tab
        var tabEle = document.createElement('div');
        me._tabCtrl = ui.util.create('Tab', me.getTabCtrlConfig(), tabEle);
        baidu.dom.insertBefore(tabEle, titleEle);

        // 渲染详细内容
        var newoptions = baidu.object.clone(me.optimizer);
        baidu.extend(newoptions, {
            modifiedItem: me.data.get('modifiedItem'),
            level: me.level
        });
        me.optimizerCtrl =
            new nirvana.aoPkgControl.EmergencyPkgGroupOptCtrl(me.pkgid, newoptions);
        me.optimizerCtrl.show();
    },
    /**
     * 获取Tab组件的配置
     */
    getTabCtrlConfig: function() {
        return {
            id: 'decrProblemTab',
            skin: 'emergency_pkg_tab',
            title: ['突降问题分析'],
            container: [this.getDOM('managerMain')]
        };
    },
    /**
     * 渲染图表区域
     * @override
     */
    renderDataArea: function() {
        var me = this;
        var FlashCtrl = me.controller.EmergencyPkgFlashCtrl;

        me.dataCtrl = new FlashCtrl(me.pkgid, me.dataArea);
        me.dataCtrl.onRenderDesc = function(descData) {
            // 更新优化项分组标题描述信息，这部分数据是放在flash数据请求里，所以在这里处理
            me.optimizerCtrl.updateGroupTitleDesc(descData);
        };
        me.dataCtrl.show();
    },
    /**
     * @implemented
     */
    disposeAoPkg: function() {
        ui.util.dispose('decrProblemTab');
        this.dataCtrl.dispose();
    }
});