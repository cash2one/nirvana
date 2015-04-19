/**
 * @file src/module/fuseSuggestion/bizView/schedule.js 业务通用模块之推广时段操作界面
    不想写在这里…… 但是现在还不能动现有代码…… so……
    智能优化融入推广管理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */


nirvana.bizView = nirvana.bizView || {};

nirvana.bizView.schedule = (function() {
    // @requires 输入

    // sizzle => $$
    // tangram => baidu
    // er => er
    // manage => manage

    // var bizView = nirvana.bizView; // a short namespace

    // 定义输出
    var exports = {};

    function getProcessedData(data) {
        if(!data) {
            return {};
        }
        var tempData = baidu.object.clone(data);
        tempData.plancyc = baidu.json.parse(tempData.plancyc || '[]');
        tempData.suggestcyc = baidu.json.parse(tempData.suggestcyc || '[]');
        tempData.hotlevel = baidu.json.parse(tempData.hotlevel || '[]');
        tempData.potionalclk = baidu.json.parse(tempData.potionalclk || '[]');

        // 预处理一下，这部分放到后端去做？？？？

        tempData.suggestcyccnt = tempData.cycnum;
        return tempData;
    }

    /**
     * 展现推广时段界面，支持传入自定义参数
     * @param {Object} actionParam 附加的数据信息
        {
            // for View界面的数据
            data: {
                planid: {(string | number)}, // 对应的计划的id
                plancyc : "[[101,102],[118,121],[114,118]]", // 推广时段数据
                cycnum: 6, // 推荐的推广时段的个数
                suggestcyc : "[[204,208],[109,111],[308,318],[609,618],[715,720]]", // 推荐的推广时段
                potionalclk: "[13, 34, 16, 88, 30, 90]", // 推荐的推广时段对应的潜在点击量
                hotlevel: "[53, 34, 76, 18, 60, 20]" // 推荐的推广时段对应的行业热门程度

                optsug: {
                    reason: {number},
                    suggestion: {number}
                }
            }, 
            // 自定义界面的配置，也各异，不同界面会有不同配置
            custom: {
                // has表示是否有，一般指功能
                hasAnalyze {boolean} 是否有推荐时段
                // is表示是否是，指状态、行为
                isNoRequest: {boolean} // 是否使用灌入数据而不请求
            },
            // 保存成功的回调处理，注意使用，主要是处理缓存
            onSave: {Function}
            // 取消保存的回调处理，呃，暂时没用啊，放个注释而已
            onCancel: {Function},

            // 以下为各异数据
            hasAnalyze {Boolean} 是否有推荐时段
        }
     */
    exports.show = function(actionParam) {
        // 根据是否有左侧的推荐时段分析信息来使用不同的类进行实例化
        var dlg = actionParam.custom.hasAnalyze
            ? new nirvana.ScheduleOptimizer()
            : new nirvana.ScheduleDlg();

        // 只处理一个元素，当前是针着计划的推广时段，so...
        var itemData = baidu.object.clone(actionParam.data);
        var planIds = actionParam.condition.planid;

        var option = {
            planIds: planIds,
            dlgOption: {
                maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel()
            },
            tplData: {
                tip: lib.tpl.parseTpl(itemData, "aoPkgRecmScheduleTip", true)
            },
            scheduleValue: itemData.plancyc
        };

        var detailData = getProcessedData(itemData);

        // 注册时段修改成功事件回调
        dlg.onSuccess = actionParam.onSave;

        // 显示时段修改对话框
        dlg.show(option, actionParam);
        dlg.setValue(
            detailData.plancyc,
            detailData.suggestcyc
        );
        // 更新其它widget信息
        dlg.updateWidgets(detailData);
    };

    return exports;
})();