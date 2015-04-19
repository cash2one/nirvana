/**
 * @file src/module/fuseSuggestion/dataAdapter.js 融合主模块数据适配器
    用于调整融合中使用的数据
    智能优化融入推广管理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */


nirvana.fuseSuggestion.dataAdapter = (function() {

    // @requires 输入

    var config = nirvana.fuseSuggestion.config;

    // require tangram as baidu

    var util = nirvana.util;

    // 定义输出
    var exports = {};

    /**
     * 将传入的命令数据actionData转换为bizView使用的格式
        并根据命令、层级信息等添加相应的条件数据
     *
     * @param {string} command 命令
     * @param {Object} actionData 命令数据
        {
            levelinfo: {string}, // 当前层级信息
            optsug: { // {Object} 数据信息 it's response.data[itemId].optsug from getSuggestion
                data: {Object},
                reason: {number},
                suggestion: {number}
            },
            callback: {Function=} 回调函数，当前在FuseItem中是更新ui.Table对应的数据
        }
     *
     * return {Object} 符合bizView格式的数据
        {
            // for View界面的数据，View是支持多数据处理的
            // 所以，呃，用数组吧
            data: [ // 元素格式就是上面处理过的detailData
                {
                    // 跟传入的具体数据optusg.data中数据一致

                    // 增加optsug，包含reason和suggestion的信息
                    optsug: {
                        reason: {number},
                        suggestion: {number}
                    }
                },
                ...
            ], 

            // 自定义行为
            custom: {
                // 基础配置,
                tpl: 'bizViewIdeaList',  // 只要模板名就行了
                // 各异

                // has表示是否有，一般指功能
                hasMultiApply: true, // call bizView.idea.multi[Action]
                multiAction: ['active', 'run', 'delete'],
                hasPager: true,
                pagesize: 5,

                // is表示是否是，指状态、行为
                isNoRequest: false // 是否使用灌入数据而不请求
            },

            // DIALOG的默认初始配置，都是Dialog，Confirm、Alert也是Dialog
            dialog: {
                id: 'ideaViewListDlg',
                title: '创意列表',
                // skin: "modeless", // 可以指定skin
                dragable: true,
                needMask: true,
                unresize: true,
                maskLevel: 1, // 打开时计算
                width: 980,
                height: 524,
                ok_button: false, // 确定按钮，默认是有的
                cancel_button: false  // 取消按钮，默认是有的
            },

            // 数据请求条件
            // custom.isNoRequest=false时，作为请求数据的condition
            // 否则，可用于数据的筛选？
            condition: {},

            // 保存成功之后的回调处理，注意使用，主要是处理缓存
            onSave: {Function}
            // 取消保存的回调处理，呃，暂时没用
            onCancel: {Function}
        }
     */
    exports.getBizViewData = function(command, actionData) {
        /**
         * 读取actionData.optsug，并转换为合适的数据
         *
         * {
                // 跟传入的具体数据optusg.data中数据一致

                // 增加optsug，包含reason和suggestion的信息
                optsug: {
                    reason: {number},
                    suggestion: {number}
                }
            }
         */
        var processedData = baidu.object.clone(actionData.optsug.data) || {};
        processedData.optsug = {
            reason: actionData.optsug.reason,
            suggestion: actionData.optsug.suggestion
        };

        // 区分命令继续处理
        switch(command) {
            case 'unit.noEffectIdeaList':
                processedData.ideaid = baidu.json.parse(processedData.ideaid);
                break;
            case 'word.bid':
                // 因为支持多个，因此使用数组
                processedData.winfoid = [processedData.winfoid];
                processedData.showword = [processedData.showword];
                processedData.bid = [processedData.bid];
                processedData.unitbid = [processedData.unitbid];
                processedData.isUseUnitbid = isUseUnitbid(processedData.bid);

                // 并且 根据不同的reason，有不同的提示信息
                if(processedData.optsug) {
                    var plushtml = '';
                    switch(+processedData.optsug.suggestion) {
                        case 4003:
                            if(!!processedData.recmbid) {
                                var thereason = +processedData.optsug.reason;
                                switch(thereason) {
                                    case 403:
                                        // plushtml = '上周您的左侧首屏展现概率为'
                                        //     + '<span class="aopkg_em">'
                                        //     + (processedData.showratio || 0)
                                        //     + '%'
                                        //     + '</span>'
                                        //     + '，提升至'
                                        //     + '<span class="aopkg_em">'
                                        //     + (processedData.targetshowratio)
                                        //     + '%'
                                        //     + '</span>'
                                        //     + '的参考价格为'
                                        //     + '<span class="aopkg_em">'
                                        //     + fixed(processedData.recmbid)
                                        //     + '</span>';
                                        // break;
                                    case 407:
                                        plushtml = '上周您的'
                                            + ((thereason == 403)
                                                ? '左侧首屏展现概率'
                                                : '左侧展现概率')
                                            + '为'
                                            + '<span>'
                                            + (processedData.showratio || 0)
                                            + '%'
                                            + '</span>'
                                            + '，提升至'
                                            + '<span>'
                                            + (processedData.targetshowratio)
                                            + '%'
                                            + '</span>'
                                            + '的参考价格为'
                                            + '<span>'
                                            + fixed(processedData.recmbid)
                                            + '</span>';

                                        // plushtml = '上周您的左侧展现概率为'
                                        //     + '<span class="aopkg_em">'
                                        //     + (processedData.showratio || 0)
                                        //     + '%'
                                        //     + '</span>'
                                        //     + '，提升至'
                                        //     + '<span class="aopkg_em">'
                                        //     + (processedData.targetshowratio)
                                        //     + '%'
                                        //     + '</span>'
                                        //     + '的参考价格为'
                                        //     + '<span class="aopkg_em">'
                                        //     + fixed(processedData.recmbid)
                                        //     + '</span>';
                                        // break;
                                }
                            }
                            break;
                        case 4007:
                            if(!!processedData.recmbid) {
                                plushtml += '出价低于最低展现价格，建议修改出价：'
                                    + fixed(processedData.recmbid);
                            }
                    }
                    processedData.extraPlusInfo = plushtml;
                }
                break;
            case 'idea.modify':
                break;
            case 'idea.modasnew':
                // 因为ideaid在质量度优化4002返回的数据中被搞成了prefideaid
                // 所以要重新赋为ideaid
                processedData.ideaid = processedData.prefideaid;

                // 补充优选关键词数据
                processedData.wordref = {
                    show: true,
                    source: [
                        {
                            winfoid: processedData.winfoid,
                            showword: processedData.showword
                        }
                    ]
                };
                // 现在不需要诊断结果，但是先留着
                // if (processedData.reason && processedData.reason != '0') {
                //     var reasonArr = lib.idea.getDiagnosisText(processedData.reason);

                //     processedData.tip = {
                //         show: true,
                //         title: '诊断结果',
                //         content: (function() {
                //             var html = '';
                //             baidu.each(reasonArr, function(item) {
                //                 html += '<p>' + item + '</p>';
                //             });
                //             // html = '陈超你妹';
                //             return html;
                //         })()
                //     };
                // }
                break;
        }

        return processedData;
    };

    /**
     * 判断是否都采用单元出价
     * @param {Array} bid
     */
    function isUseUnitbid(bid){
        var i, len, isUse = true;
        for (i = 0, len = bid.length; i < len; i++) {
            if (bid[i]) {
                //只要有一个没用就都没用，显示各自价格
                isUse = false;
                break;
            }
        }
        return isUse;
    }

    /**
     * 将传入的命令数据actionData及command，获取相应的条件数据
     *
     * @param {string} command 命令
     * @param {Object} actionData 命令数据
        {
            levelinfo: {string}, // 当前层级信息
            optsug: { // {Object} 数据信息 it's response.data[itemId].optsug from getSuggestion
                data: {Object},
                reason: {number},
                suggestion: {number}
            },
            callback: {Function=} 回调函数，当前在FuseItem中是更新ui.Table对应的数据
        }
     *
     * @return {Object} 区分层级及命令各异的condition
     */

    exports.getBizViewCondition = function(command, actionData) {
        var levelinfo = actionData.levelinfo;
        var idKey = config.itemIdofLevel[levelinfo];

        var condition = {};
        var itemData = actionData.optsug.data;

        // 分析命令
        var cmdLevel, cmdAction;
        var commandArr = command.split('.');

        // 当前只支持2级命令，其他会被认为非法
        switch(commandArr.length) {
            case 2: // as [cmdLevel][cmdAction]
                cmdLevel = commandArr[0];
                cmdAction = commandArr[1];
                break;
        }

        // condition根据层级不同，首先带入层级对应的当前的itemId，保存为数组
        // 但是注意，特定层级的特定命令是不需要这么做的：
        // 某层级下，添加同一层级物料
        if(!(levelinfo === cmdLevel && cmdAction === 'add')) {
            if('undefined' !== typeof itemData[idKey]) {
                condition[idKey] = [itemData[idKey]];
            }
            else {
                // error!!!
                util.logError('no valid ' + idKey
                    + ' for excuting ' + command);
            }
        }

        // 根据命令的不同，condition也可能有所不同
        switch(command) {
            case 'unit.noEffectIdeaList':
                // 此时层级为unit，但是condition中需要带入 创意ids
                condition = {
                    ideaid: baidu.json.parse(itemData.ideaid)
                };
                break;
        }

        return condition;
    };

    return exports;
})();