/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/common/RegionSelector.js
 * desc: 优化包定制的地域选择组件
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/05 $
 */

// 初始化命名空间
nirvana.aopkg = nirvana.aopkg || {};

/**
 * 优化包定制的地域选择组件，当前主要用于重点词排名包
 * @class RegionSelector
 * @namespace nirvana.aopkg
 */
nirvana.aopkg.RegionSelector = function($) {
    /**
     * 创建地域选择组件实例
     * @param {Object} options 区域选择组件的配置选项，由于该组件基于对话框实现，
     *                         options的定义可参见{@link ui.Dialog}的配置
     * @param {Object} repairPositionOption 修复弹出地域选择窗口的位置，具体
     *                         参见{@link ui.util.smartPosition}第二个参数
     * @constructor
     */
    function RegionSelector(options, repairPositionOption) {
        this._options = options;
        this._repairOption = repairPositionOption;
    }

    var DEFAULT_OPTION = {
        id: 'regionSelectDlg',
        title: '',
        skin: "modeless",
        dragable: false,
        needMask: false,
        unresize: true,
        maskLevel: 5,
        width: 350,
        ok_button: false, // 不要确定按钮
        cancel_button: false  // 不要取消按钮
    };

    var DEFAULT_REPAIR_OPTION = {
        pos: 'b',
        align: 'l'/*,
        repairL: 38,
        repairT: 7*/
    };

    /**
     * 为重点词优化包地域选择的对话框产生渲染内容
     * WARRING: 这个方法依赖于定义在{@link nirvana/config.js#REGION_LIST}，
     * 因此一旦该{@code REGION_LIST} 数据结构和内容发生变化，这段代码可能需要重新做调整
     * @param {Number|String} selectedRegionId 选择展现的地域id
     * @param {Array} availableRegionIdArr 重点词所有投放的地域id
     * @return {String} 要被渲染的HTML字符串
     */
    function generateRegionSelectionHTML(selectedRegionId,
                                         availableRegionIdArr) {
        var chinaRegionList = REGION_LIST['China'].list,
            abroadRegions = REGION_LIST['Abroad'],
            regionList,
            html = '';

        regionList = baidu.object.clone(chinaRegionList);
        regionList.Abroad = baidu.object.clone(abroadRegions);
        // ugly! 为了便于generateRegionHTML方法的一致处理
        regionList.Abroad.name += '地区';

        html += '<div>';
        // 产生区域的渲染的HTML内容
        html += _generateRegionHTML(regionList,
            selectedRegionId, availableRegionIdArr);
        html += '</div>';

        return html;
    };

    /**
     * 产生大区域的渲染内容，e.g. 东北地区，华南地区，..
     * @param {Object} regionList，具体数据结构定义见{@code REGION_LIST}
     * @param {Number|String} selectedRegionId 选择展现的地域id
     * @param {Array} availableRegionIdArr 重点词所有投放的地域id
     * @return {String} 大区域渲染的HTML字符串
     */
    function _generateRegionHTML(regionList, selectedRegionId,
                                 availableRegionIdArr) {
        var html = '',
            region,
            name,
            subRegionList,
            idx;

        for (var k in regionList) {
            region = regionList[k];
            name = region.name;
            subRegionList = region.list;

            // 确定大的区域是否存在可用的区域，没有的话，不显示
            if (!_hasAvailableSubRegion(subRegionList, availableRegionIdArr)) {
                continue;
            }

            html += '<dl class="region_wrapper">';
            // 移除配置项名称的最后两个字“地区”，界面上要求这么显示，见UE设计图
            html += (
                '<dt class="region_category">'
                + name.substr(0, name.length - 2)
                + '</dt>'
                );
            html += '<dd class="sub_region_list">';

            for (idx in subRegionList) {
                html += _generateSubRegionHTML(
                    {
                        id: idx,
                        name: subRegionList[idx]
                    },
                    selectedRegionId,
                    availableRegionIdArr);
            }

            html += '</dd>';
            html += '</dl>';
        }

        return html;
    };

    /**
     * 给定的区域列表是否存在可用的区域
     * @param {Object} subRegionList，具体数据结构定义见{@code REGION_LIST}
     * @param {Array} availableRegionIdArr 重点词所有投放的地域id
     * @return {Boolean} 给定的区域列表存在可用的区域，返回true，否则返回false
     */
    function _hasAvailableSubRegion(subRegionList, availableRegionIdArr) {
        for (var id in subRegionList) {
            if (baidu.array.indexOf(availableRegionIdArr, +id) != -1) {
                return true;
            }
        }

        return false;
    };

    /**
     * 产生子区域的渲染内容，e.g., 河南，湖北，...
     * @param {Object} region，具体数据结构(id: xxx, name: xxx)
     * @param {Number|String} selectedRegionId 选择展现的地域id
     * @param {Array} availableRegionIdArr 重点词所有投放的地域id
     * @return {String} 区域渲染的HTML字符串
     */
    function _generateSubRegionHTML(region, selectedRegionId,
                                    availableRegionIdArr) {
        var html = '',
            styleName = ' class="clickable subregion_name';

        if (region.id == selectedRegionId) {
            styleName += ' selected_region box-border-radius"';
        } else if (
            baidu.array.indexOf(availableRegionIdArr, +region.id) != -1) {
            styleName += '"';
        } else {
            styleName += ' disabled_region"';
        }

        html += '<span' + styleName + ' regionid="' + region.id
            + '">' + region.name + '</span>';

        return html;
    };

    RegionSelector.prototype = {
        init: function() {
            var me = this;

            if (me._inited) {
                return;
            }
            // 标识初始化过
            me._inited = true;

            // 创建对话框
            var options = nirvana.util.extend(me._options, DEFAULT_OPTION);
            me._dlg = ui.Dialog.factory.create(options);

            // 为区域选择对话框绑定事件
            me.bindHandler(me._dlg);
        },
        /**
         * 显示地域选择弹窗
         * @param {string} selRegionId 当前选择的区域Id
         * @param {Array} regionIdList 所有要供选择的地域Id数组
         * @method show
         */
        show: function(selRegionId, regionIdList) {
            var me = this;

            // 不存在区域，不显示区域选择对话框
            if (!regionIdList
                || (regionIdList instanceof Array && !regionIdList.length)) {
                return;
            }

            this.init();

            // 记录当前选择的地域ID
            this._selRegionId = selRegionId;
            // 初始化对话框内容
            me._dlg.setContent(generateRegionSelectionHTML(selRegionId,
                regionIdList));

            if (!me._dlg.isShow) {
                me._dlg.show();
            }
            // 触发对话框位置调整
            me._resizePosHandler();
        },
        /**
         * 重置地域选择弹窗的位置
         * @private
         */
        resetDlgPositionHandler: function() {
            var dlg = this._dlg;

            if (!dlg || !dlg.isShow) {
                return;
            }

            var option = nirvana.util.extend(
                this._repairOption, DEFAULT_REPAIR_OPTION);
            ui.util.smartPosition(dlg.getDOM(), option);
        },
        /**
         * 为区域选择对话框绑定事件处理器
         * @private
         */
        bindHandler: function(dlg) {
            var me = this;

            // 初始化窗体大小变化时，地域调整对话框位置调整的处理器
            me._resizePosHandler = nirvana.util.bind(
                me.resetDlgPositionHandler, me);

            // 绑定窗体大小变化事件处理器
            baidu.on(window, 'resize', me._resizePosHandler);

            // 初始化地域选择事件处理器
            var regionContainerEle = dlg.getBody();
            // 为地域选择容器元素添加事件代理
            me._regionSelHandler = nirvana.event.delegate(
                regionContainerEle, me.regionChangeHandler, me);
//            getEventHandler(me, me.regionChangeHandler, regionContainerEle);

            // 绑定地域选择事件处理器
            baidu.on(regionContainerEle, 'click', me._regionSelHandler);
        },
        /**
         * 地域选择处理器
         * @private
         * @param {Object} event
         * @param {HTMLElement} target
         * @return {Boolean} 如果target触发了handler的执行，返回true，否则返回false
         */
        regionChangeHandler: function(event, target) {
            var me = this;

            if (!baidu.dom.hasClass(target, 'disabled_region') &&
                !baidu.dom.hasClass(target, 'selected_region') &&
                baidu.dom.hasClass(target, 'subregion_name')) {
                var selRegionId = baidu.dom.getAttr(target, 'regionid');

                // 将地域选择框隐藏掉
                me._dlg.hide();

                /**
                 * 选择地域触发的事件
                 * @event onSelect
                 * @param {string} oldSelRegionId 老的选择的地域ID
                 * @param {string} newSelRegionId 新的选择的地域ID
                 */
                nirvana.util.executeCallback(me.onSelect,
                    [me._selRegionId, selRegionId]);
                // 保存当前选择的地域ID
                me._selRegionId = selRegionId;
            }
        },
        /**
         * 销毁实例
         * @method dispose
         */
        dispose: function() {
            var me = this;

            me._options = null;
            me._repairOption = null;

            if (me._dlg) {
                // 移除窗体大小变化事件处理器
                baidu.un(window, 'resize', me._resizePosHandler);

                // 移除地域选择事件处理器
                var regionContainerEle = me._dlg.getBody();
                baidu.un(regionContainerEle, 'click', me._regionSelHandler);

                // ui.Dialog.factory.create的对话框的dispose比较特殊
                ui.util.disposeDlg(me._dlg);
                me._dlg = null;
            }
        }
    };

    return RegionSelector;
}($$);