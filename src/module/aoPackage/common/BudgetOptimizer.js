/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/common/BudgetOptimizer.js
 * desc: 预算的优化操作
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/10/19 $
 */
// 初始化命名空间
var aopkg = aopkg || {};
/**
 * 预算的优化操作,用于优化包<br/>
 *
 * @class BudgetOptimizer
 * @namespace aopkg
 * @static
 * @deprecated
 */
aopkg.BudgetOptimizer = function ($) {

    var BudgetOptimizer = {
        /**
         * 显示优化计划/账户预算的对话框
         * @param {AoPkgOptimizerCtrl} aopkgOptCtrl 优化包优化建议组件
         * @param {Object} options 显示预算优化对话框选项信息
         * @param {string} options.optid 优化建议项ID字符串，前端做过处理，可能被加上后缀，用于标识子优化建议项，比如303.1_1
         * @param {number} options.opttypeid 后端返回的真实的优化建议ID
         * @param {string} options.optmd5 优化建议缓存的数据，包含更多的其它数据
         * @param {Object} options.optData 优化建议的数据，只是当前查看的优化项的数据
         * @param {boolean} isEmergencyPkg 是否是突降急救包升级版
         */
        _show: function (aopkgOptCtrl, options, isEmergencyPkg) {
            var optid = options.optid;
            var opttypeid = options.opttypeid;
            var optmd5 = options.optmd5;
            var optData = options.optdata;

            // 初始化预算类型
            var type = (optid.indexOf('_') != -1) ? 'planinfo' : 'useracct';

            // 初始化预算模块的监控日志信息
            manage.budget.logParam = {
                'entrancetype': 'aopkg'
            };

            // 打开预算对话框
            manage.budget.openSubAction({
                type: type,
                bgttype: optData.bgttype,
                planid: [optData.planid],
                entrancetype: 'aopkg',
                opttypeid: opttypeid,
                optmd5: optmd5,
                suboptmd5: optData.optmd5,
                isEmergencyPkg: isEmergencyPkg, // 用于区分是否是新版突降急救包
                //decrtype: aopkgOptCtrl.decrtype || '',
                custom: {
                    noDiff: true,
                    noOffline: true,
                    noViewBtn: true,
                    noRadio: true
                },
                onok: function (data) {
                    // 201:开拓客源的账户预算 modidfied by Huiyao: 这里只有开拓客源包有这个需求，其它都不要
                    if (201 == opttypeid) {
                        // 这个请求告诉后端修改了账户预算，不需要回调响应
                        fbs.nikon.ModUserBudget({
                            bgttype: data.bgttype,
                            suggestbudget: optData.suggestbudget,
                            oldvalue: data.oldvalue,
                            newvalue: data.newvalue || 0 // 不限定预算传0
                        });
                    }
                    // del by huiyao 2013.1.9: 没必要这么判断，计划预算才有planid，账户预算是没有planid
                    //                    var planId = null;
                    //                    // 602:行业包的计划预算，202:开拓客源的计划预算
                    //                    if (602 == opttypeid || 202 == opttypeid) {
                    //                        planId = optData.planid;
                    //                    }
                    var planId = optData.planid;
                    // 更新优化项摘要
                    aopkgOptCtrl.updateOptimizeAbstracts(optid, opttypeid, planId);
                }
            }, {
                maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel()
            });
        },
        /**
         * 显示基于Nikon预算接口的优化计划/账户预算的对话框
         * @param {AoPkgOptimizerCtrl} aopkgOptCtrl 优化包优化建议组件
         * @param {String} optid 优化建议项ID字符串，前端做过处理，可能被加上后缀，用于标识子优化建议项，比如303.1_1
         * @param {Number} opttypeid 后端返回的真实的优化建议ID
         * @param {String} optmd5 优化建议缓存的数据，包含更多的其它数据
         * @param {Object} optData 优化建议的数据，只是当前查看的优化项的数据
         */
        showNikonBudget: function (aopkgOptCtrl, optid, opttypeid, optmd5, optData) {
            BudgetOptimizer._show(
                aopkgOptCtrl,
                {
                    optid: optid,
                    opttypeid: opttypeid,
                    optmd5: optmd5,
                    optdata: optData
                }
            );
        },
        /**
         * 显示基于突降急救升级版的预算接口的优化计划/账户预算的对话框
         * @param {AoPkgOptimizerCtrl} aopkgOptCtrl 优化包优化建议组件
         * @param {Object} data 显示预算上下文数据，具体包含信息见{@link #_show}
         */
        showEmergencyPkgBudget: function (aopkgOptCtrl, data) {
            BudgetOptimizer._show(aopkgOptCtrl, data, true);
        }
    };

    return BudgetOptimizer;
}($$);