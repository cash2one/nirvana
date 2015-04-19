/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/common/scheduleDetail.js
 * desc: 时段的优化操作静态方法，当前用于优化包以
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/01/09 $
 */
/**
 * 时段的优化操作工具方法
 * @namespace nirvana.aopkg
 * @deprecated
 */
nirvana.aopkg.scheduleDetail = function ($, T, nirvana) {
    var detail = {
        show: function(aoOptCtrl, data, hasAnalyze) {
            // 根据是否有左侧的推荐时段分析信息来使用不同的类进行实例化
            var dlg = hasAnalyze
                ? new nirvana.ScheduleOptimizer()
                : new nirvana.ScheduleDlg();

            if (!hasAnalyze) {
                // 对于当前突降包时段修改的标题话术信息必须等异步请求回来时候才能初始化
                // 注册时段对话框加载结束事件回调
                dlg.onLoad = function(data) {
                    var tip = lib.tpl.parseTpl(data, "decreasePkgScheduleTip", true);
                    var tipElem = this.getElement('.widget_tip')[0];
                    tipElem && (tipElem.innerHTML = tip);
                };
            }
            // 显示时段修改对话框
            detail._show(dlg, aoOptCtrl, data, hasAnalyze);
        },
        _show: function(dlg, aoOptCtrl, data, hasAnalyze) {
            var optid = data.optid;
            var opttypeid = data.opttypeid;
            var optdata = data.optdata;
            var optmd5 = data.optmd5;

            var option = {
                planIds: [optdata.planid],
                dlgOption: {
                    maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel()
                }
            };
            var attrData = {
                opttypeid: opttypeid,
                level: aoOptCtrl.level,
                optmd5: optmd5,
                decrtype: aoOptCtrl.decrtype || '',
                conditionOptmd5: optdata.optmd5
            };

            var customOption;
            if (hasAnalyze) {
                customOption = {
                    tplData: {
                        tip: lib.tpl.parseTpl(optdata, "industryPkgScheduleTip", true)
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
            T.object.extend(option, customOption);

            // 注册时段修改成功事件回调
            dlg.onSuccess = function() {
                // 更新优化包的优化建议摘要
                aoOptCtrl.updateOptimizeAbstracts(optid, opttypeid, optdata.planid);
            };
            // 显示时段修改对话框
            dlg.show(option, attrData);
        }
    };

    return detail;
}($$, baidu, nirvana);