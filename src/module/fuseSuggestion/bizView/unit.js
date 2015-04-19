/**
 * @file src/module/fuseSuggestion/bizView/unit.js 业务通用模块之单元相关操作界面
    不想写在这里…… 但是现在还不能动现有代码…… so……
    智能优化融入推广管理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */


nirvana.bizView = nirvana.bizView || {};

nirvana.bizView.unit = (function() {
    // @requires 输入

    // sizzle => $$
    // tangram => baidu
    // er => er

    var bizView = nirvana.bizView; // a short namespace

    // 定义输出
    var exports = {};


    /**
     * 查看单元未生效创意列表，新界面，支持传入自定义参数
        支持批量处理：激活、启用、删除
        展现创意及状态
        支持分页
     * @param {Object} actionParam 数据信息
            {
                // for View界面的数据
                data: [
                    { 
                        planid: {(string | number)},
                        unitid: {(string | number)},
                        planname: {string},
                        unitname: {string},

                        optsug: {
                            reason: {number},
                            suggestion: {number}
                        }
                    },
                    ...
                ], 
                // 自定义界面的配置，也各异，不同界面会有不同配置
                custom: {
                    isNoRequest: true // 表示不去请求，而是使用传入的数据
                },
                dialog: {},
                condition: {
                    ideaid: [{(string | number)}]
                },
                // 保存成功的回调处理，注意使用，主要是处理缓存
                onSave: {Function}
                // 取消保存的回调处理，呃，暂时没用啊，放个注释而已
                onCancel: {Function}
            }
     */
    exports.noEffectIdeaList = function(actionParam) {

        var listView = new bizView.ideaList(actionParam);

        listView.show();
    };

    return exports;

})();