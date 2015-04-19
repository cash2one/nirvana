/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/AoPkgDetailCtrl.js
 * desc: AO优化包详情处理控制类
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/03/08 $
 */
/**
 * AO优化包详情处理控制类，控制详情视图{@link DetailView}的展现和一些相关关闭处理回调事件
 * 如跟现有优化包详情没有任何特殊处理逻辑，通常不需要改动该文件。
 *
 * 该详情视图控制器目前主要用在{@link aoPkgOptimizerCtrl#switchToDetail2}
 *
 * @class AoPkgDetailCtrl
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.AoPkgDetailCtrl = function($, T, nirvana) {
    function AoPkgDetailCtrl() {
    }

    AoPkgDetailCtrl.prototype = {
        /**
         * 初始化详情的控制器
         * @param {nirvana.RecmwordPackage2} optItemCtrl
         * @param {HTMLElement} container 当前视图容器
         */
        init: function(optItemCtrl, container) {
            // 初始化要渲染的视图，用于滑动显示详情
            this._container = container;
            this._optItemCtrl = optItemCtrl;
        },
        /**
         * 显示详情视图
         * @param {string} optid 优化建议项ID字符串，前端做过处理，可能被加上后缀，
         *                       用于标识子优化建议项，比如303.1_1
         * @param {number} opttypeid 后端返回的真实的优化建议ID
         * @param {nirvana.aoPkgControl.DetailView} detailView 要展现的详情视图
         */
        show: function(optid, opttypeid, detailView) {
            var me = this;
            detailView.onClose = nirvana.util.bind('closeOptimizeDetail', me,
                optid, opttypeid);

            if (me._currView) {
                me._currView.dispose();
            }
            me._currView = detailView;

            if (detailView.isPopup()) {
                detailView.show();
                me._optItemCtrl.removeUpdatedInfo(optid);
            }
            else {
                me.slideToDetail(optid, detailView);
            }
        },
        /**
         * 以滑动方式进入详情视图
         * @param {string} optid 优化建议项ID字符串，前端做过处理，可能被加上后缀，
         *                       用于标识子优化建议项，比如303.1_1
         * @param {nirvana.aoPkgControl.DetailView} detailView 要展现的详情视图
         */
        slideToDetail: function(optid, detailView) {
            var me = this;
            var optItemCtrl = me._optItemCtrl;
            var appId = optItemCtrl.appId;

            var dialogBody = T.g('ctrldialogAoPkg' + appId + 'Dialogbody');
            T.addClass(dialogBody, 'ui_dialog_noscrollbody');
            T.setStyle(dialogBody, 'bottom', 0);

            var detailDom = T.g(appId + 'AoPkgDetailContainer');
            T.show(detailDom);
            T.setStyle(detailDom, 'top', dialogBody.scrollTop);

            var dialogFoot = T.g('ctrldialogAoPkg' + appId + 'Dialogfoot');
            T.hide(dialogFoot);

            // 展现详情视图
            detailView.show(me._container);

            // 初始化动画结束回调
            var finishCallback = function() {
                var pkgId = nirvana.aoPkgConfig.KEYMAP[optItemCtrl.pkgid];
                var app = nirvana.aoPkgControl.packageData.get(pkgId);
                app.currView = 'detail';

                optItemCtrl.removeUpdatedInfo(optid);
                T.event.fire(window, 'resize');
            };

            var mainDom = T.g(appId + 'AoPkgContainer');
            // 执行滑动动画
            T.fx.moveBy(
                mainDom,
                {
                    x: -mainDom.offsetWidth / 2,
                    y: 0
                },
                {
                    duration: 400,
                    interval: 12,
                    onafterfinish: finishCallback
                }
            );
        },
        /**
         * 以滑动方式返回摘要视图
         * @param {string} optid 优化建议项ID字符串，前端做过处理，可能被加上后缀，
         *                       用于标识子优化建议项，比如303.1_1
         * @param {number} opttypeid 后端返回的真实的优化建议ID
         * @param {boolean} needRefresh 是否需要刷新优化项摘要
         */
        slideBackAbstract: function(optid, opttypeid, needRefresh) {
            var me = this;
            var optItemCtrl = me._optItemCtrl;
            var appId = optItemCtrl.appId;

            // 发送滑动到摘要视图监控
            nirvana.AoPkgMonitor.slideBackAbstract(opttypeid);

            var detailDom = T.g(appId + 'AoPkgDetailContainer');

            // 初始化动画结束回调
            var finishCallback = function() {
                T.hide(detailDom);
                detailDom.innerHTML = '';

                var pkgId = nirvana.aoPkgConfig.KEYMAP[optItemCtrl.pkgid];
                var app = nirvana.aoPkgControl.packageData.get(pkgId);
                app.currView = 'overview';

                var dialogBody = T.g('ctrldialogAoPkg' + appId + 'Dialogbody');

                T.setStyle(dialogBody, 'bottom', 42);

                T.removeClass(dialogBody, 'ui_dialog_noscrollbody');

                var dialogFoot = T.g('ctrldialogAoPkg' + appId + 'Dialogfoot');
                T.show(dialogFoot);

                if (needRefresh) {
                    optItemCtrl.refreshOptItem(optid);
                }
            };

            var mainDom = T.g(appId + 'AoPkgContainer');
            // 执行滑动动画
            T.fx.moveBy(
                mainDom,
                {
                    x: -(T.dom.getStyle(mainDom, 'left').replace(/px/g, '')),
                    y: 0
                },
                {
                    duration: 400,
                    interval: 12,
                    onafterfinish: finishCallback
                }
            );
        },
        /**
         * 关闭优化详情视图执行的回调
         * @param {string} optid 优化建议项ID字符串，前端做过处理，可能被加上后缀，
         *                       用于标识子优化建议项，比如303.1_1
         * @param {number} opttypeid 后端返回的真实的优化建议ID
         * @param {?number} planid 如果详情包含计划id信息，则会传入该计划id信息
         */
        closeOptimizeDetail: function(optid, opttypeid, planId) {
            var me = this;
            var optCtrl = me._optItemCtrl;
            var currView = me._currView;

            var isModified = currView.hasModified();
            if (isModified) {
                optCtrl.addOptItemModInfo(optid, opttypeid, planId);
            }

            currView.dispose();
            me._currView = null;

            if (currView.isPopup() && isModified) {
                optCtrl.refreshOptItem(optid);
            }
            else {
                me.slideBackAbstract(optid, opttypeid, isModified);
            }
        },
        /**
         * 获取当前展现的详情视图
         * @return {nirvana.aoPkgControl.DetailView}
         */
        getDetailView: function() {
            return this._currView;
        },
        /**
         * 销毁详情控制器
         */
        dispose: function() {
            var currView = this._currView;
            if (currView) {
                currView.dispose();
                // 清空html避免包关掉后其它优化包再次引用到该包的DOM结构
                this._container.innerHTML = '';
                this._currView = null;
            }
            this._container = null;
            this._optItemCtrl = null;
        }
    };

    return AoPkgDetailCtrl;
}($$, baidu, nirvana);