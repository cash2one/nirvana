/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/season/SeasonPkgFlashCtrl.js
 * desc: 行业旺季包Flash图表区域控件定义
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/05/09 $
 */
/**
 * 行业旺季包Flash图表区域控件定义：包括旺季包优化建议上面全部内容，即导航Tab，具体falsh图表区
 * @class SeasonPkgFlashCtrl
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.SeasonPkgFlashCtrl = function($, T, nirvana) {
    /**
     * Flash图表区展现类型定义
     */
    var DISPLAY_TYPE = {
        SHOW: 'show',
        CLICK: 'click'
    };

    /**
     * 创建Flash图标区实例
     * @param {Object} initData 创建该实例要初始化到上下文的数据
     * @param {number} initData.pkgid 优化包id
     * @param {HTMLElement} initData.view Flash要渲染的目标视图
     * @constructor
     */
    function SeasonPkgFlashCtrl(initData) {
        var me = this;

        me.initAttrs(initData);

        // 创建Flash图表区域内容
        var view = me.getAttr('view');
        view.innerHTML = er.template.get('seasonPkgFlash');
        me._UIMap = ui.util.init(view);

        // 设置Flash图表区默认展现的类型
        me.setAttr('displayType', DISPLAY_TYPE.CLICK);

        me.flash = this.createFlash();
        me.flash.onReady = nirvana.util.bind('updateFlashData', me);
        // 绑定事件处理
        me.bindHandlers();
    }

    SeasonPkgFlashCtrl.prototype = {
        /**
         * 展现旺季行业Flash图表区域
         */
        show: function () {
            T.removeClass(this.getAttr('view'), 'hide');
        },
        /**
         * 隐藏旺季行业Flash图表区域
         */
        hide: function () {
            T.addClass(this.getAttr('view'), 'hide');
        },
        /**
         * 在当前Flash视图查询给定的选择器所对应的DOM元素
         * @param {string} selector DOM元素选择器
         */
        $: function (selector) {
            return $(selector, this.getAttr('view'));
        },
        /**
         * 创建Flash组件
         * @returns {ui.Flash}
         */
        createFlash: function () {
            var config = {
                id: "peakSeaonPkgFlash",
                url: './asset/swf/seasonPkgTrend.swf',
                width: "940",
                height: "180",
                scale: 'showall',
                wmode: 'opaque',
                allowscriptaccess: 'always'
            };

            var flashContainer = this.$('.season-flash-container')[0];
            return new ui.Flash(fbs.nikon.getFlashData, flashContainer, config);
        },
        /**
         * 绑定Flash展现区域的事件处理器：类型切换、Flash展开收起
         */
        bindHandlers: function () {
            var me = this;
            var bind = nirvana.util.bind;

            // 绑定Flash展开/收起事件处理
            var toggleFlashBtn = this.$('.toggle-btn')[0];
            toggleFlashBtn.onclick = bind('toggleFlash', me);

            // 绑定类型切换单选框事件处理
            me._UIMap.tradeShowType.onclick = bind('switchDisplayType', me, DISPLAY_TYPE.SHOW);
            me._UIMap.tradeClkType.onclick = bind('switchDisplayType', me, DISPLAY_TYPE.CLICK);
        },
        /**
         * 展开/收起Flash事件处理
         */
        toggleFlash: function () {
            var me = this;
            var target = me.$('.toggle-btn')[0];

            // 折叠/展开Flash
            var flashView = me.$('.flash-area')[0];
            nirvana.aoPkgControl.seasonPkgUtil.toggleView(
                target, flashView, '收起图表', '展开图表', function (isCollapse) {
                    if (!isCollapse) {
                        // 对于展开情况，由于一开始是隐藏，loading元素计算定位跟展开后位置
                        // 肯定不同，因此这里触发下resize事件
                        me.flash.loading.fireResize();
                    }
                });
        },
        /**
         * 切换Flash图表区展现的数据类型
         * @param {string} type 要展现的数据类型，见{@link DISPLAY_TYPE}定义
         */
        switchDisplayType: function (type) {
            this.setAttr('displayType', type);

            var flashObj = this.flash.getFlashObj();
            if (!flashObj) {
                return;
            }

            switch (type) {
                case DISPLAY_TYPE.SHOW:
                    flashObj.showShow();
                    break;
                case DISPLAY_TYPE.CLICK:
                    flashObj.showClk();
                    break;
            }
        },
        /**
         * 加载Flash图表区的数据
         * @param {number} tradeId 要加载的旺季行业id
         * @param {number} tradeType 要加载的旺季行业的类型
         */
        loadData: function (tradeId, tradeType) {
            var me = this;

            me.setAttr('tradeId', tradeId);
            me.setAttr('tradeType', tradeType);

            var timeStamp = (new Date()).getTime();
            me.setAttr('reqTimeStamp', timeStamp);

            var param = {
                pkgid: me.getAttr('pkgid'),
                condition: {
                    tradeid: tradeId
                },
                onSuccess: function (data) {
                    me.loadSuccess(timeStamp, data);
                },
                onFail: function () {
                    me.loadFail(timeStamp);
                }
            };

            // 请求旺季行业flash图表区数据
            me.flash.loadData(param);
        },
        /**
         * 当前请求是否是最新数据请求，由于导航Tab切换过于频繁，比较早的请求可能未返回
         * @param {number} timeStamp 当前请求的时间戳
         * @returns {boolean}
         */
        isLatestRequest: function (timeStamp) {
            var reqTimeStamp = this.getAttr('reqTimeStamp');
            return reqTimeStamp === timeStamp;
        },
        /**
         * 获取要渲染的Flash数据
         * @param {Object} descrData 原始服务端返回的旺季行业的描述数据
         * @param {Object} tradeData 原始服务端返回的旺季行业数据
         * @return {Object}
         */
        processFlashData: function (descrData, tradeData) {
            var parse = T.date.parse;
            var peakStartDate = parse(descrData.peakstart);
            var peakEndDate = parse(descrData.peakend);

            var tradePvList = [];
            var userShowList = [];
            var userClkList = [];

            var temp;
            var currDate;
            var isEmpty = nirvana.util.isEmptyValue;
            var show;
            var clk;

            function insertUserValue(dataList, insertIdx, item, key) {
                var value = item[key];
                if (isEmpty(value)) {
                    value = '-';
                }
                dataList[insertIdx] = {
                    label: item.date,
                    value: value
                };
            }

            // 用户展现、点击数据及行业数据初始化
            for (var i = 0, len = tradeData.length; i < len; i ++) {
                temp = tradeData[i];
                currDate = parse(temp.date);

                insertUserValue(userShowList, i, temp, 'show');
                insertUserValue(userClkList, i, temp, 'clk');

                tradePvList[i] = {
                    label: temp.date,
                    value: temp.tradepv || 0,
                    hot: currDate >= peakStartDate && currDate <= peakEndDate
                };
            }

            function clearLastEmptyValue(arr) {
                for (var j = arr.length - 1; j >= 0; j --) {
                    if (arr[j].value === '-') {
                        arr.pop();
                    }
                    else {
                        return;
                    }
                }
            }

            clearLastEmptyValue(userShowList);
            clearLastEmptyValue(userClkList);

            return {
                tradepv: tradePvList,
                clk: userClkList,
                show: userShowList
            };
        },
        /**
         * 加载Flash数据成功事件处理
         * @param {number} timeStamp 请求的时间戳
         * @param {Object} data 响应返回的数据对象
         */
        loadSuccess: function (timeStamp, data) {
            var me = this;
            // 只处理最新的请求
            if (me.isLatestRequest(timeStamp)) {
                me.fireLodeDone(data.desc, data.listData);
            }
        },
        /**
         * 加载Flash数据失败的事件处理
         * @param {number} timeStamp 请求的时间戳
         */
        loadFail: function (timeStamp) {
            var me = this;
            // 只处理最新的请求
            if (me.isLatestRequest(timeStamp)) {
                me.fireLodeDone();
            }
        },
        /**
         * 触发加载结束的事件
         * @param {Object} descrData 加载结束返回的旺季行业的描述数据
         * @param {Array} listData 加载结束返回的Flash图表区的数据
         */
        fireLodeDone: function (descrData, listData) {
            var me = this;
            var params = [
                me.getAttr('tradeId'),
                me.getAttr('tradeType'),
                descrData
            ];
            /**
             * Flash数据加载结束触发的回调
             * @param {number} tradeId 旺季行业Id
             * @param {number} tradeType 旺季行业类型
             * @param {Object} descrData 旺季行业描述信息
             * @event onLoad
             */
            nirvana.util.executeCallback('onLoad', params, me);

            if (listData && listData.length) {
                // 更新Flash信息
                var flashData = me.processFlashData(descrData, listData);
                me.setAttr('flashData', flashData);
            }
            else {
                me.setAttr('flashData', 'fail');
            }

            me.flash.show();
        },
        /**
         * 更新Flash数据
         * 注意：对于flash由展开变成折叠再重新展开，会导致flash销毁再重新加载初始化，
         * 通过其加载成功回调onReady完成flash初始化即可自动触发flash数据更新，见上面
         * flash实例注册onReady事件
         */
        updateFlashData: function () {
            var me = this;
            var flash = me.flash;

            var flashData = me.getAttr('flashData');
            if (flashData === 'fail') {
                flash.showFailMsg();
            }
            else if (flashData) {
                flash.update(flashData);
                me.switchDisplayType(me.getAttr('displayType'));
            }
        },
        /**
         * 销毁Flash控制实例
         */
        dispose: function () {
            this.flash.dispose();
            ui.util.disposeWidgetMap(this._UIMap);
        }

    };

    // 支持属性读写功能
    T.extend(SeasonPkgFlashCtrl.prototype, nirvana.attrHelper);

    return SeasonPkgFlashCtrl;
}($$, baidu, nirvana);