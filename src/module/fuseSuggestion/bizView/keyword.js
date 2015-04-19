/**
 * @file src/module/fuseSuggestion/bizView/keyword.js 业务通用模块之关键词操作界面
    不想写在这里…… 但是现在还不能动现有代码…… so……
    智能优化融入推广管理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */


nirvana.bizView = nirvana.bizView || {};

nirvana.bizView.word = (function() {
    // @requires 输入

    // sizzle => $$
    // tangram => baidu
    // er => er

    var bizView = nirvana.bizView; // a short namespace

    // 定义输出
    var exports = {};


    /**
     * 关键词激活
     * @param {Object} actionParam 数据
        {
            // for View界面的数据
            data: [
                {
                    winfoid: {string}, // 对应的关键词的id

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
            condition: {
                winfoid: [] // 可选
            },

            // 保存成功的回调处理，注意使用，主要是处理缓存
            onSave: {Function}
            // 取消保存的回调处理，呃，暂时没用啊，放个注释而已
            onCancel: {Function}
        }
     */

    exports.active = function(actionParam) {

        // var itemData = baidu.object.clone(actionParam.data[0]);

        // 计划id和名称是未知的，但是希望是数组传进去
        var winfoIds = actionParam.condition.winfoid;

        ui.Dialog.confirm({
            title : '激活关键词',
            content : '您确定激活所选择的关键词吗?',
            onok : function() {
                var func = fbs.keyword.active,//需要调用的接口函数
                    param = {
                        winfoid: winfoIds,
                        activestat : '0',
                        onSuccess: function(response){
                            if (response.status != 300) {
                                var modifyData = response.data;
                                fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
                                fbs.material.ModCache('wordinfo', "winfoid", modifyData);
                                if(baidu.lang.isFunction(actionParam.onSave)) {
                                    actionParam.onSave(modifyData);
                                }
                            }
                        },
                        onFail: function() {
                            ajaxFailDialog('激活失败');
                        },
                        onTimeout: function() {
                            ajaxFailDialog('激活失败');
                        }
                    };
                func(param);
            }
        });
    };

    /**
     * 关键词修改出价
     * @param {Object} extraParams 附加的数据信息
        {
            // for View界面的数据
            data: {
                winfoid: {Array}, // 关键词id
                showword: {Array}, // 关键词字面
                bid: {Array}, // 当前出价
                unitbid: {Array}, // 当前单元出价, 
                recmbid: {number}, // 建议修改出价
                // 展现占比 整数数字，直接后边加%
                // 如果非法，默认不提示这句： 近7天左侧前三位的展现占比为20%
                showratio：展现占比

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
                winfoid: [] // 可选
            },

            // 保存成功的回调处理，注意使用，主要是处理缓存
            onSave: {Function}
            // 取消保存的回调处理，呃，暂时没用啊，放个注释而已
            onCancel: {Function}
        }
     */
    exports.bid = function(extraParams) {
        // 融合用了一个全新的修改出价的界面，比较坑
        // extraParams.custom.newView = true的
        extraParams.custom.level = 'word';
        return bizView.bid.show(extraParams);
    };

    return exports;

})();