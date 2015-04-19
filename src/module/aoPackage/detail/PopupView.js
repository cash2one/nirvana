/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/detail/PopupView.js
 * desc: AO优化包详情弹窗视图基类
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/05/07 $
 */
/**
 * AO优化包详情弹窗视图基类
 * @class PopupView
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.PopupView = function($, T, nirvana) {
    function PopupView() {
    }

    PopupView.prototype = {
        /**
         * 该详情视图以弹窗方式显示
         * @return {boolean}
         * @override
         */
        isPopup: function() {
            return true;
        },
        /**
         * 显示弹窗详情视图
         * @implemented
         */
        show: function() {
            var me = this;
            var type = me.getAttr('popupType');

            if (type === 'budget') {
                me.showBudgetDetail();
            }
            else if (type === 'schedule') {
                me.showScheduleDetail();
            }
        },
        /**
         * 显示预算优化详情
         */
        showBudgetDetail: function () {
            var me = this;
            var opttypeid = me.getAttr('opttypeid');
            var planid = me.getAttr('planid');
            var isEmergencyPkg = me.getAttr('isEmergencyPkg');
            // 初始化预算类型
            var type = planid ? 'planinfo' : 'useracct';

            // 初始化预算模块的监控日志信息
            manage.budget.logParam = {
                'entrancetype': 'aopkg'
            };

            var config = {
                type: type,
                bgttype: me.getAttr('bgttype'),
                planid: [planid],
                entrancetype: 'aopkg',
                opttypeid: opttypeid,
                optmd5: me.getAttr('optmd5'),
                suboptmd5: me.getAttr('suboptmd5'),
                isEmergencyPkg: isEmergencyPkg, // 用于区分是否是新版突降急救包
                custom: {
                    noDiff: true,
                    noOffline: true,
                    noViewBtn: true,
                    noRadio: true
                },
                onok: function (data) {
                    // 201:开拓客源的账户预算 modidfied by Huiyao:
                    // 这里只有开拓客源包有这个需求，其它都不要
                    if (201 == opttypeid) {
                        // 这个请求告诉后端修改了账户预算，不需要回调响应
                        fbs.nikon.ModUserBudget({
                            bgttype: data.bgttype,
                            suggestbudget: me.getAttr('suggestbudget'),
                            oldvalue: data.oldvalue,
                            newvalue: data.newvalue || 0 // 不限定预算传0
                        });
                    }

                    // 设置修改过标识
                    me.setModified(true);
                    // 执行关闭回调
                    me.closeView(planid);
                }
            };

            T.object.extend(config, me.getAttr('customConfig') || {});

            // 打开预算对话框
            manage.budget.openSubAction(config, {
                maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel()
            });
        },
        /**
         * 获取时段详情配置选项
         * @param {boolean} hasAnalyze 是否有推荐时段分析信息
         * @return {Object}
         */
        getScheduleOptions: function(hasAnalyze) {
            var me = this;

            // 显示时段修改对话框
            var option = {
                planIds: [me.getAttr('planid')],
                dlgOption: {
                    maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel()
                }
            };

            var customOption;
            if (hasAnalyze) {
                customOption = {
                    tplData: {
                        tip: lib.tpl.parseTpl(me.getAttr(), 'aoPkgRecmScheduleTip', true)
                    }
                };
            }
            else {
                customOption = {
                    hasRecmd: true,
                    tplName: 'decreasePkgSchedule'
                };
                // 这个二级属性不能通过extend方法来修改，只能直接修改
                option.dlgOption.height = 373;
            }
            // 扩展定制的选项
            return T.object.extend(option, customOption);
        },
        /**
         * 显示时段优化详情
         */
        showScheduleDetail: function () {
            var me = this;
            // 是否提供左侧推荐时段分析信息
            var hasAnalyze = me.getAttr('hasAnalyze');

            // 根据是否有左侧的推荐时段分析信息来使用不同的类进行实例化
            var dlg = hasAnalyze
                ? new nirvana.ScheduleOptimizer()
                : new nirvana.ScheduleDlg();

            if (!hasAnalyze) {
                // 对于当前突降包时段修改的标题话术信息必须等异步请求回来时候才能初始化
                // 注册时段对话框加载结束事件回调
                dlg.onLoad = function (data) {
                    var tip = lib.tpl.parseTpl(data, "decreasePkgScheduleTip", true);
                    var tipElem = this.getElement('.widget_tip')[0];
                    tipElem && (tipElem.innerHTML = tip);
                };
            }
            // 注册时段修改成功事件回调
            dlg.onSuccess = function () {
                // 设置修改过标识
                me.setModified(true);
                // 执行关闭回调
                me.closeView(me.getAttr('planid'));
            };

            var attrData = nirvana.util.copy(
                me.getAttr(),
                ['opttypeid', 'level', 'optmd5', 'decrtype', 'suboptmd5']
            );
            var options = me.getScheduleOptions(hasAnalyze);
            // 显示时段修改对话框
            dlg.show(options, attrData);
        }
    };

    // 继承详情视图
    T.inherits(PopupView, nirvana.aoPkgControl.DetailView);
    return PopupView;
}($$, baidu, nirvana);