/**
 * @file src/module/fuseSuggestion/bizCommon/bid.js 业务通用模块之修改出价
        自动进行缓存处理
        支持回调 onSucess, onFail, onTimeout

    不想写在这里…… 但是现在还不能动现有代码…… so……
    智能优化融入推广管理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.bizCommon = nirvana.bizCommon || {};

nirvana.bizCommon.bid = (function() {
    // @requires 输入

    // tangram => baidu
    // [core.service]fbs => fbs
    // nirvana.bizUtility => util
    // var util = nirvana.bizUtility;

    // 定义输出
    var exports = {};

    /**
     * Ajax请求成功处理
     */
    function successProcessor(params) {
        var level = params.level;
        var itemData = params.data;

        return function(response) {
            var data = response.data;
            var modifyData = {};
            // 清除缓存
            // nirvana.bizUtil的缓存处理只是删除行为
            // 会有一些问题，因为还需要修改数据……
            // 先写在这里，一会儿转移至nirvana.bizUtility.cache中

            switch(level) {
                case 'word':
                    for (var i = 0, l = itemData.winfoid.length; i < l; i++) {
                        modifyData[itemData.winfoid[i]] = {
                            "bid": itemData.bid[i]
                        };
                    }
                    break;
                    fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
                    fbs.material.ModCache('wordinfo',"winfoid", modifyData);
                case 'unit':
                    for (var i = 0, l = itemData.unitid.length; i < l; i++) {
                        modifyData[itemData.unitid[i]] = {
                            "unitbid": itemData.unitbid[i]
                        };
                    }

                    fbs.material.ModCache("unitinfo", "unitid", modifyData);
                    fbs.material.ModCache("wordinfo", "unitid",modifyData);
                    fbs.avatar.getMoniWords.ModCache("unitid", modifyData);
                    break;
            }

            params.onSuccess && params.onSuccess(response);
        };
    }

    function failProcessor(params) {
        var level = params.level;
        var itemData = params.data;

        return function(response) {
            var data = response.data;
            params.onFail && params.onFail(response);
        };
    }

    function timeoutProcessor(params) {
        var level = params.level;
        var itemData = params.data;

        return function(response) {
            var data = response.data;
            params.onTimeout && params.onTimeout(response);
        };
    }

    /**
     * 修改出价
     * @param {Object} params 参数
            {
                level: 'word/unit', // 关键词出价或单元出价
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
    exports.modify = function(params) {
        if(!params) {
            return;
        }
        var data = params.data;
        var level = params.level;

        switch(params.level) {
            case 'word':
                // 值检查，在fbs函数中进行了，注意处理error
                fbs.keyword.modBid({
                    winfoid: baidu.lang.isArray(data.winfoid)
                        ? data.winfoid
                        : [data.winfoid],
                    bid:  baidu.lang.isArray(data.bid)
                        ? data.bid
                        : [data.bid],
                    onSuccess: successProcessor(params),
                    onFail: failProcessor(params),
                    timeout: params.timeout || 30000,
                    onTimeout: timeoutProcessor(params)
                });
                break;
            case 'unit':
                fbs.unit.modUnitbid({
                    unitid: baidu.lang.isArray(data.unitid)
                        ? data.unitid
                        : [data.unitid],
                    unitbid: baidu.lang.isArray(data.unitbid)
                        ? data.unitbid
                        : [data.unitbid],
                    onSuccess: successProcessor(params),
                    onFail: failProcessor(params),
                    timeout: params.timeout || 30000,
                    onTimeout: timeoutProcessor(params)
                });
                break;
        }
    };

    return exports;
})();