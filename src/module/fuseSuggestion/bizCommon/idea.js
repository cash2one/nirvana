/**
 * @file src/module/fuseSuggestion/bizCommon/idea.js 业务通用模块之创意相关
    不想写在这里…… 但是现在还不能动现有代码…… so……
    智能优化融入推广管理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.bizCommon = nirvana.bizCommon || {};

nirvana.bizCommon.idea = (function() {
    // @requires 输入

    // sizzle => $$
    // tangram => baidu
    // er => er

    // 定义输出
    var exports = {};

    /**
     * 创意修改保存
     * @param {Object} params 参数
            {
                level: 'idea', 
                data: { // {Object} 数据，下面是一些例子，请区分传入
                    winfoid: [1], // 关键词的id，支持多个
                    unitid: [1], // 单元的id，支持多个
                    bid: [100], // 新值，支持多个
                    unitbid: [100], // 新值，支持多个
                },
                onSuccess: {Function=}, // 成功回调处理
                onFail: {Function=}, // 失败回调处理
                timeout: {number=}, // 超时时间，单位ms
                onTimeout: {Function=}, // 超时回调处理
            }
     */
    exports.modify = function() {

    };

    /**
     * 获取创意列表
     * @param {Object} params 参数
            {
                condition: { // {Object} 数据
                    ideaid: []
                },
                onSuccess: {Function=}, // 成功回调处理
                onFail: {Function=}, // 失败回调处理
                timeout: {number=}, // 超时时间，单位ms
                onTimeout: {Function=}, // 超时回调处理
            }
     */
    exports.getList = function(params, fields) {
        // 如果没有指定需要的字段，使用默认值
        if (!fields) {
            fields = [
                'ideaid', 'shadow_ideaid', 'shadow_ideastat',
                'title', 'shadow_title', 'desc1',
                'shadow_desc1', 'desc2', 'shadow_desc2',
                'url', 'shadow_url', 'showurl',
                'shadow_showurl', 'unitid', 'planid',
                'pausestat', 'activestat', 'ideastat'
            ];
        }

        fbs.material.getAttribute('ideainfo', fields, params);
    };

    /**
     * 激活创意
     * @param {Object} params 参数
            {
                ideaid: [],
                onSuccess: {Function=}, // 成功回调处理
                onFail: {Function=}, // 失败回调处理
                timeout: {number=}, // 超时时间，单位ms
                onTimeout: {Function=}, // 超时回调处理
            }
     */
    exports.active = function(params) {
        var reqParam = {
            ideaid: params.condition.ideaid,
            activestat: 0,
            onSuccess: function(response) {
                fbs.material.clearCache('ideainfo');
                if(baidu.lang.isFunction(params.onSuccess)) {
                    params.onSuccess(response);
                }
            },
            onFail: function(response) {
                params.onFail(response);
            }
        };
        fbs.idea.active(reqParam);
    };

    /**
     * 启用创意
     * @param {Object} params 参数
            {
                ideaid: [],
                onSuccess: {Function=}, // 成功回调处理
                onFail: {Function=}, // 失败回调处理
                timeout: {number=}, // 超时时间，单位ms
                onTimeout: {Function=}, // 超时回调处理
            }
     */
    exports.enable = function(params) {
        var reqParam = {
            ideaid: params.condition.ideaid,
            pausestat: 0,
            onSuccess: function(response) {
                fbs.material.clearCache('ideainfo');
                if(baidu.lang.isFunction(params.onSuccess)) {
                    params.onSuccess(response);
                }
            },
            onFail: function(response) {
                params.onFail(response);
            }
        };
        fbs.idea.modPausestat(reqParam);
    };
    /**
     * 暂停创意
     * @param {Object} params 参数
            {
                ideaid: [],
                onSuccess: {Function=}, // 成功回调处理
                onFail: {Function=}, // 失败回调处理
                timeout: {number=}, // 超时时间，单位ms
                onTimeout: {Function=}, // 超时回调处理
            }
     */
    exports.pause = function(params) {
        var reqParam = {
            ideaid: params.condition.ideaid,
            pausestat: 1,
            onSuccess: function(response) {
                fbs.material.clearCache('ideainfo');
                if(baidu.lang.isFunction(params.onSuccess)) {
                    params.onSuccess(response);
                }
            },
            onFail: function(response) {
                params.onFail(response);
            }
        };
        fbs.idea.modPausestat(reqParam);
    };

    return exports;

})();