/**
 * @file src/module/fuseSuggestion/bizView/idea.js 业务通用模块之idea界面
    不想写在这里…… 但是现在还不能动现有代码…… so……
    使用bizCommon的通用方法，让其自动调用
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.bizView = nirvana.bizView || {};

nirvana.bizView.idea = (function() {
    // @requires 输入

    // sizzle => $$
    // tangram => baidu
    // er => er
    // manage => manage
    // ui1.0 => ui
    // nirvana.bizCommon => bizCommon
    var bizCommon = nirvana.bizCommon;
    // var util = nirvana.util;
    // lib.tpl => lib.tpl

    // var bizView = nirvana.bizView; // a short namespace

    // 定义输出
    var exports = {};

    /**
     * 修改创意界面，支持传入自定义参数
     * @param {Object} actionParam 数据信息
            {
                // for View界面的数据
                data: {
                    winfoid: {(string | number)}, // 对应的关键词id
                    showword: {string}, // 对应的关键词字面
                    ideaid: {(string | number)},
                    prefideaid: {(string | number)}, 
                    planid: {(string | number)},
                    unitid: {(string | number)},
                    reason: {number}, // 创意诊断

                    optsug: {
                        reason: {number},
                        suggestion: {number}
                    }
                }, 
                // 自定义界面的配置，也各异，不同界面会有不同配置
                custom: {
                    isNoRequest: true // 表示不去请求，而是使用传入的数据
                },
                // 保存成功的回调处理，注意使用，主要是处理缓存
                onSave: {Function}
                // 取消保存的回调处理，呃，暂时没用啊，放个注释而已
                onCancel: {Function}
            }
     */
    exports.modify = function(actionParam) {
        var itemData = baidu.object.clone(actionParam.data);
        // itemData.entranceType = 'bizCommon';

        // 这个是为了修bug
        itemData.maskLevel = nirvana.aoPkgWidgetCommon.getMaskLevel();

        baidu.extend(itemData, actionParam.dialog);

        lib.idea.editIdea(itemData, actionParam.onSave);
    };

    /**
     * 添加创意界面，支持传入自定义参数
     * @param {Object} actionParam 数据信息
            {
                // for View界面的数据
                data: { 
                    planid: {(string | number)},
                    unitid: {(string | number)},
                    planname: {string},
                    unitname: {string}

                    optsug: {
                        reason: {number},
                        suggestion: {number}
                    }
                }, 
                // 自定义界面的配置，也各异，不同界面会有不同配置
                custom: {
                    isNoRequest: true // 表示不去请求，而是使用传入的数据
                },
                // 保存成功的回调处理，注意使用，主要是处理缓存
                onSave: {Function}
                // 取消保存的回调处理，呃，暂时没用啊，放个注释而已
                onCancel: {Function},
            }
     */
    exports.add = function(actionParam) {
        var itemData = baidu.object.clone(actionParam.data);

        // 这个是为了修bug
        itemData.maskLevel = nirvana.aoPkgWidgetCommon.getMaskLevel();
        // 特殊处理 for lib.idea.addIdea
        itemData.changeable = actionParam.custom.isChangeable;

        // itemData.entranceType = 'aoPackage';

        lib.idea.addIdea(itemData, actionParam.onSave);
    };

    /**
     * 激活创意界面，支持传入自定义参数
     * @param {Object} actionParam 数据信息
            {
                // for View界面的数据
                data: [
                    { 
                        planid: {(string | number)},
                        unitid: {(string | number)},
                        planname: {string},
                        unitname: {string},
                        ideaid: {(string | number)}

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
                condition: {},
                // 保存成功的回调处理，注意使用，主要是处理缓存
                onSave: {Function}
                // 取消保存的回调处理，呃，暂时没用啊，放个注释而已
                onCancel: {Function},
            }
     */
    exports.active = function(actionParam) {
        var title = actionParam.dialog.title || '激活创意';
        var content = actionParam.dialog.content
            || '您确定要激活所选择的创意吗？';

        ui.Dialog.confirm({
            title: title,
            content: content,
            onok: function() {
                bizCommon.idea.active({
                    condition: actionParam.condition,
                    onSuccess: function(response) {
                        if(baidu.lang.isFunction(actionParam.onSave)) {
                            actionParam.onSave(response);
                        }
                    },
                    onFail: function() {
                        ajaxFailDialog();
                    }
                });
            },
            oncancel: function() {
                if(baidu.lang.isFunction(actionParam.onCancel)) {
                    actionParam.onCancel();
                }
            }
        });
    };

    exports.enable = function(actionParam) {
        var title = actionParam.dialog.title || '启用创意';
        var content = actionParam.dialog.content
            || '您确定要启用所选择的创意吗？';

        ui.Dialog.confirm({
            title: title,
            content: content,
            onok: function() {
                bizCommon.idea.enable({
                    condition: actionParam.condition,
                    onSuccess: function(response) {
                        if(baidu.lang.isFunction(actionParam.onSave)) {
                            actionParam.onSave(response);
                        }
                    },
                    onFail: function() {
                        ajaxFailDialog();
                    }
                });
            },
            oncancel: function() {
                if(baidu.lang.isFunction(actionParam.onCancel)) {
                    actionParam.onCancel();
                }
            }
        });
    };
    exports.pause = function(actionParam) {
        var title = actionParam.dialog.title || '暂停创意';
        var content = actionParam.dialog.content
            || '您确定要暂停所选择的创意吗？';

        ui.Dialog.confirm({
            title: title,
            content: content,
            onok: function() {
                bizCommon.idea.pause({
                    condition: actionParam.condition,
                    onSuccess: function(response) {
                        if(baidu.lang.isFunction(actionParam.onSave)) {
                            actionParam.onSave(response);
                        }
                    },
                    onFail: function() {
                        ajaxFailDialog();
                    }
                });
            },
            oncancel: function() {
                if(baidu.lang.isFunction(actionParam.onCancel)) {
                    actionParam.onCancel();
                }
            }
        });
    };

    return exports;

})();
