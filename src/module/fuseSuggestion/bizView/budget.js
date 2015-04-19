/**
 * @file src/module/fuseSuggestion/bizView/budget.js 业务通用模块之预算操作界面
    不想写在这里…… 但是现在还不能动现有代码…… so……
    智能优化融入推广管理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.bizView = nirvana.bizView || {};

nirvana.bizView.budget = (function() {
    // @requires 输入

    // sizzle => $$
    // tangram => baidu
    // er => er
    // manage => manage

    // var bizView = nirvana.bizView; // a short namespace

    // 定义输出
    var exports = {};

    /**
     * 处理一下灌入的数据，转换为旧格式
            数据尽管是数组传入，但是实际只会去处理一个元素
            如果是多计划修改budget，根本不需要数据【当前】
     *
     * @param {Object} data
            [
                {
                    planid: {(string | number)}, // 对应的计划的id
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
            ]
     */
    function getProcessedData(data) {
        var bgttype = +data.bgttype || 0;

        var detailData = {
            data: {
                totalnum: 1,
                returnnum : 1,
                // timestamp : (new Date()).valueOf,
                listData : [{ // 用来存储预算数据信息
                    bgttype : bgttype, // 预算类型
                    daybgtdata : { // 存储日预算基础数据与分析数据
                        daybgtvalue : +data.wbudget || 0, // 值
                        dayanalyze : { // 日预算分析数据
                            tip : 3,
                            // 0 不提示 hasproblem = 0, priority = 0
                            // 1 预算合理 hasproblem = 0, priority = 0
                            // 2 日预算风险 hasproblem = 1, priority = 1
                            // 3 需提供日预算建议 hasproblem = 1 , priority = 2
                            // 4 需提供周预算建议 hasproblem = 1 , priority = 2
                            suggestbudget : +data.suggestbudget, // 建议预算点
                            lostclicks : +data.clklost || 0 // 损失点击数
                            // startpoint : [0, 0], // 存放起点
                            // endpoint : [1000, 1000], // 存放终点
                            // budgetpoint : [50, 50], // 预算点
                            // keypoints : [ // 存放七个关键点
                            //     [767.5, 55.11], [772, 58.32], [775.5, 60.43], [797, 70.97],
                            //     [816, 77.96], [816, 77.96], [873.1, 78.57]
                            // ],
                            // incitermsg : [ // 存放同行激励信息
                            //     ['02:05:00', 7500, '0'], // 起点
                            //     ['06:55:00', 24900, '240'], // 自身点
                            //     ['09:00:02', 42400, '360'], // 优质客户点
                            //     ['23:33:00', 107800, '0'] // 终点
                            // ],
                            // show_encourage : 0, // 是否提示同行激励
                            // model_num : 5,
                            // words : '你好/你坏', // 核心关键词面值字面串，以/分隔
                            // wordids : [1, 2] // 核心关键词id值
                        }
                    },
                    weekbgtdata : null
                }]
            }
        };

        return detailData;
    }

    /**
     * 展现预算界面，支持传入自定义参数
     * @param {Object} actionParam 数据
        {
            // for View界面的数据
            data: {
                planid: {(string | number)}, // 对应的计划的id
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
            condition: {
                planid: [] // 可选，如无为账户层级，多个为多计划
            },

            // 保存成功的回调处理，注意使用，主要是处理缓存
            onSave: {Function}
            // 取消保存的回调处理，呃，暂时没用啊，放个注释而已
            onCancel: {Function}
        }
     */
    exports.show = function(actionParam) {
        if(!actionParam) {
            return;
        }

        var condition = actionParam.condition || {};

        // 判断层级，根据condition中的planid数组去判断
        var levelinfo = 'useracct';
        if(baidu.lang.isArray(condition.planid)
            && condition.planid.length > 0) {
            levelinfo = 'planinfo';
        }

        // 当前是旧版本界面，需要调整参数，so...
        // 以后换成新版本的话，下面的一坨都干掉
        // 直接使用actionParam

        // 默认
        var param = {
            type: levelinfo, // 层级信息 useracct/planinfo
            bgttype: 0,
            planid: actionParam.condition.planid,
            planname: actionParam.data.planname,
            entrancetype: actionParam.entrance || 'bizCommon',
            custom: actionParam.custom,
            onok: actionParam.onSave
        };

        if(actionParam.custom.isNoRequest) {
            // 自定义的处理一下数据，获得旧格式的数据
            param.detailData = getProcessedData(actionParam.data);
        }

        var maskLevel = nirvana.aoPkgWidgetCommon.getMaskLevel();

        // 打开预算对话框
        manage.budget.openSubAction(param, {
            maskLevel: maskLevel
        });
    };


    return exports;
})();