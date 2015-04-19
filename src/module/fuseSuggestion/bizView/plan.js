/**
 * @file src/module/fuseSuggestion/bizView/plan.js 业务通用模块之计划操作界面
    不想写在这里…… 但是现在还不能动现有代码…… so……
    智能优化融入推广管理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */


nirvana.bizView = nirvana.bizView || {};

nirvana.bizView.plan = (function() {
    // @requires 输入

    // sizzle => $$
    // tangram => baidu
    // er => er

    var bizView = nirvana.bizView; // a short namespace

    // 定义输出
    var exports = {};

    /**
     * 修改计划预算
     * @param {Object} actionParam 数据
        {
            // for View界面的数据
            data: [
                {
                    planid: {string}, // 对应的计划的id
                    planname: {string}, // 对应的计划的名称
                    bgttype: {string}, // 预算类型 0 不限定 1 日预算
                    wbudget: {string}, // 当前预算值
                    suggestbudget: {string}, // 建议预算值
                    clklost: {string} // 损失点击数

                    optsug: {
                        reason: {number},
                        suggestion: {number}
                    }
                },
                ...
            ], 

            // 自定义行为
            custom: {
                // 各异

                // has表示是否有，一般指功能

                // is表示是否是，指状态、行为
                isNoRequest: {boolean} // 是否使用灌入数据而不请求
            },

            // DIALOG的相关配置，都是Dialog，即使是对话框，同样也是
            dialog: {
                maskLevel: 1, // 打开时计算
                width: 980,
                height: 524,
                ok_button: false, // 确定按钮?
                cancel_button: false  // 取消按钮?
                // 等等等等
            },

            // 数据请求条件
            condition: {},

            // 保存成功的回调处理，注意使用，主要是处理缓存
            onSave: {Function}
            // 取消保存的回调处理，呃，暂时没用啊，放个注释而已
            onCancel: {Function}
        }
     */
    exports.budget = function(actionParam) {
        return bizView.budget.show(actionParam);
    };


    /**
     * 修改计划推广时段
     * @param {Object} actionParam 数据信息
        {
            // for View界面的数据
            data: [
                {
                    planid: {number}, // 对应的计划的id
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
                ...
            ], 

            // 自定义行为
            custom: {
                // 各异

                // has表示是否有，一般指功能
                hasAnalyze {boolean} 是否有推荐时段

                // is表示是否是，指状态、行为
                isNoRequest: {boolean} // 是否使用灌入数据而不请求
            },

            // DIALOG的相关配置，都是Dialog，即使是对话框，同样也是
            dialog: {
                maskLevel: 1, // 打开时计算
                width: 980,
                height: 524,
                ok_button: false, // 确定按钮?
                cancel_button: false  // 取消按钮?
                // 等等等等
            },

            // 数据请求条件
            condition: {},

            // 保存成功的回调处理，注意使用，主要是处理缓存
            onSave: {Function}
            // 取消保存的回调处理，呃，暂时没用啊，放个注释而已
            onCancel: {Function}
        }
     */
    exports.schedule = function(actionParam) {
        return bizView.schedule.show(actionParam);
    };

    return exports;

})();