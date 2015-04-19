/**
 * @file module/fuseSuggestion/monitor/monitor.js
     智能优化融入推广管理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.fuseSuggestion.monitor = (function() {
    // a short namespace
    var me = nirvana.fuseSuggestion;

    // @requires 输入
    var config = me.config;

    // sizzle => $$
    // tangram => baidu

    // 定义输出
    var exports = {};

    function sendLog(target, param) {
        param.target = target;
        NIRVANA_LOG.send(param);
    }

    exports.viewDetail = function(fuseitem) {
        if(!fuseitem || !fuseitem.data) {
            return;
        }
        var viewStatus = fuseitem.viewStatus;
        var data = fuseitem.data;
        sendLog(
            'fuseSuggestion_view_detail',
            {
                viewStatus: viewStatus,
                reason: data.optsug.reason,
                suggestion: data.optsug.suggestion,
                levelinfo: fuseitem.levelinfo,
                index: fuseitem.options.index
            }
        );
    };
    /**
     * @param {Object=} params.actionReturnData
        详情操作成功之后回调函数中传入的数据
     *
        for budget:
            {
                bgttype : {number},
                oldtype : {number},
                newvalue : {number},
                oldvalue : {number}
            }
        for bid:
            {
                oldvalue: {number},
                newvalue: {number}
            }
     */
    exports.modifyDetail = function(fuseitem, params) {
        if(!fuseitem || !fuseitem.data) {
            return;
        }
        var viewStatus = fuseitem.viewStatus;
        var data = fuseitem.data;
        var oldOptsug = params.oldOptsug || {};

        var idKey = config.itemIdofLevel[fuseitem.levelinfo];
        var materialId = data[idKey];
        var logParam = {
            viewStatus: viewStatus,
            reason: oldOptsug.reason,
            suggestion: oldOptsug.suggestion,
            levelinfo: fuseitem.levelinfo,
            index: fuseitem.options.index,
            materialId: materialId
        };

        // 当前环境（页）信息
        var table = ui.util.get(fuseitem.levelinfo + 'TableList');
        logParam.contextMaterialId = [];
        logParam.contextMaterialReason = [];
        logParam.contextMaterialSuggesion = [];
        logParam.contextMaterialBid = [];
        logParam.contextMaterialUnitBid = [];
        logParam.contextMaterialWmatch = [];

        var item;
        for(var i = 0, l = table.datasource.length; i < l; i++) {
            item = table.datasource[i];
            logParam.contextMaterialId.push(item[idKey]);
            logParam.contextMaterialReason.push(item.optsug.reason);
            logParam.contextMaterialSuggesion.push(item.optsug.suggestion);
            if(fuseitem.levelinfo === 'word') {
                logParam.contextMaterialBid.push(item.bid);
                logParam.contextMaterialUnitBid.push(item.unitbid);
                logParam.contextMaterialWmatch.push(item.wmatch);
            }
        }

        // 修正可能被改变了的当前项的值
        // 真心是temp
        logParam.contextMaterialSuggesion[fuseitem.options.index] = oldOptsug.suggestion;
        logParam.reason[fuseitem.options.index] = oldOptsug.reason;

        var actionReturnData = params.actionReturnData || {};
        // 修改预算和修改出价要记建议值和修改值
        var action = config.command[oldOptsug.suggestion];
        switch(action) {
            case 'plan.budget':
                logParam.oldvalue = actionReturnData.oldvalue;
                logParam.newvalue = actionReturnData.newvalue;
                logParam.suggestvalue = actionReturnData.suggestvalue;
                logParam.newbgttype = actionReturnData.bgttype;
                logParam.oldbgttype = actionReturnData.oldtype;
                break;
            case 'word.bid':
                logParam.oldvalue = actionReturnData.oldvalue;
                logParam.newvalue = actionReturnData.newvalue;
                logParam.suggestvalue = actionReturnData.suggestvalue;
                break;
        }

        sendLog(
            'fuseSuggestion_modify_detail',
            logParam
        );
    };

    exports.unfoldAll = function(fusesuggestion) {
        sendLog(
            'fuseSuggestion_modify_unfoldAll',
            {
                newViewStatus: 'max',
                levelinfo: fusesuggestion.levelinfo
            }
        );
    };
    exports.foldAll = function(fusesuggestion) {
        sendLog(
            'fuseSuggestion_modify_foldAll',
            {
                newViewStatus: 'min',
                levelinfo: fusesuggestion.levelinfo
            }
        );
    };

    return exports;

})();