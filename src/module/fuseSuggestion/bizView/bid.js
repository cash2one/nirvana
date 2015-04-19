/**
 * @file src/module/fuseSuggestion/bizView/bid.js 业务通用模块之修改出价界面
    不想写在这里…… 但是现在还不能动现有代码…… so……
    使用bizCommon的通用方法，让其自动调用
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.bizView = nirvana.bizView || {};

nirvana.bizView.bid = (function() {
    // @requires 输入

    // sizzle => $$
    // tangram => baidu
    // er => er
    // manage => manage
    // ui1.0 => ui
    // nirvana.bizCommon.bid => bidCommon
    var bidCommon = nirvana.bizCommon.bid;
    // lib.tpl => lib.tpl

    // 定义输出
    var exports = {};

    /**
     * 展现修改出价界面，支持传入自定义参数
     * @param {Object} actionParam 附加的数据信息
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
                level: {string} word/unit,

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
    exports.show = function(actionParam) {
        var level = actionParam.custom.level;
        // 融合用了一个全新的修改出价的界面，比较坑
        // actionParam.custom.isNewView = true的
        // var processedData = getProcessedData(actionParam);

        // var item = processedData.data;

        var winfoids = [];
        var showwords = [];
        var bids = [];
        var unitbids = [];

        var i, l = actionParam.data.length;
        for(i = 0; i < l; i++) {
            winfoids.push(actionParam.data[i].winfoid);
            showwords.push(actionParam.data[i].showword);
            bids.push(actionParam.data[i].bid);
            unitbids.push(actionParam.data[i].unitbid);
        }

        switch(level) {
            case 'word':
                if(actionParam.custom && actionParam.custom.isNewView) {
                    showDialog(actionParam);
                }
                // else { // 用旧的
                //     // 先放着
                //     nirvana.util.openSubActionDialog({
                //         id: 'modifyWordBidDialog',
                //         title: '关键词出价',
                //         width: 440,
                //         actionPath: 'manage/modWordPrice',
                //         params: {
                //             winfoid : winfoids, // 数组
                //             bid : bids, // 数组
                //             isUseUnitbid : actionParam.data.isUseUnitbid,
                //             unitbid : unitbids, // 数组
                //             name: showwords, // 数组
                //             // Oh yes,这里坑爹的又叫onsubmit了
                //             // 深度感觉，需要统一callback命名了……
                //             onsubmit: actionParam.onSave
                //         },
                //         onclose: function(){
                //         }
                //     });
                //     // clearTimeout(nirvana.subaction.resizeTimer);
                //     // baidu.g('ctrldialogmodifyWordBidDialog').style.top = baidu.page.getScrollTop() + 200 +'px';
                // }
                break;
            // case 'unit':
            //     nirvana.util.openSubActionDialog({
            //         id: 'modifyUnitBidDialog',
            //         title: '单元出价',
            //         width: 440,
            //         actionPath: 'manage/modUnitPrice',
            //         params: {
            //             unitid: unitids,
            //             unitbid: unitbids,
            //             onok: actionParam.onSave
            //         },
            //         onclose: function(){
            //         }
            //     });
            //     break;
        }
    };

    var DEFAULT_DIALOG_OPTION = {
        id: 'bizViewBidDlg',
        title: '',
        // skin: "modeless",
        dragable: true,
        needMask: true,
        unresize: true,
        // maskLevel: 5, // 打开时计算
        width: 440,
        ok_button: false, // 确定按钮?
        cancel_button: false  // 取消按钮?
    };

    /**
     * 展现“新的”修改出价界面
     * @param {Object} actionParam 处理过的附加的数据信息
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
                    level: {string} word/unit,
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
    function showDialog(actionParam) {

        var _options = baidu.object.clone(DEFAULT_DIALOG_OPTION);
        _options.maskLevel = nirvana.aoPkgWidgetCommon.getMaskLevel();

        var dialog = ui.Dialog.factory.create(_options);

        init(dialog, actionParam);
    }


    var DEFAULT_SINGLE_INFOCONFIG = {
        title: '修改出价',
        contentTpl: 'bizViewBidSingle'
    };
    var DEFAULT_MULTI_INFOCONFIG = {
        title: '修改出价',
        contentTpl: 'bizViewBidMulti'
    };
    /**
     * 初始化界面信息
     * @param {ui.Dialog} dialog 浮出层
     * @param {Object} actionParam 处理过的数据，见上注释
     */
    function init(dialog, actionParam) {
        var detailData = actionParam.data;

        // 区分处理single or multi
        var isSingle = detailData.winfoid.length == 1;

        var infocfg = isSingle
            ? DEFAULT_SINGLE_INFOCONFIG
            : DEFAULT_MULTI_INFOCONFIG;

        // 标题
        dialog.setTitle(infocfg.title);

        // 内容
        var contentHtml = '';

        if(isSingle) {
            var bidValue = detailData.isUseUnitbid
                ? detailData.unitbid[0]
                : detailData.bid[0];
            contentHtml = lib.tpl.parseTpl(
                {
                    showword: detailData.showword[0],
                    bid: fixed(bidValue || 0)
                },
                infocfg.contentTpl,
                true
            );
        }

        dialog.setContent(contentHtml);

        // ui 初始化
        ui.util.init(dialog.getDOM());

        // 进行浮出层初始化时的一些信息，例如输入的默认值
        initDialogInfo(actionParam);

        // 事件绑定
        bind(dialog, actionParam);
    }

    // 进行浮出层初始化时的一些信息，例如输入的默认值
    function initDialogInfo(actionParam) {
        var detailData = actionParam.data;

        // 区分处理single or multi
        var isSingle = detailData.winfoid.length == 1;

        if(isSingle) {
            // input初始值
            var bidText = ui.util.get('bizCModBidInput');
            if(bidText) {
                var bidValue = detailData.isUseUnitbid
                    ? detailData.unitbid[0]
                    : detailData.bid[0];
                bidText.setValue(fixed(bidValue || 0));
                bidText.focusAndSelect();
            }

            // 是否需要展现额外的信息
            var plusInfoDom = $$('#bizview-bid-plusinfo')[0];
            if(plusInfoDom && detailData.extraPlusInfo) {
                plusInfoDom.innerHTML = detailData.extraPlusInfo;
            }
        }
    }

    /**
     * 绑定
     * @param {ui.Dialog} dialog 对话框
     * @param {Object} actionParam 处理过的数据
            {
                // for View界面的数据
                detailData: {
                    winfoid: {Array}, // 关键词id
                    showword: {Array}, // 关键词字面
                    bid: {Array}, // 当前出价
                    unitbid: {Array}, // 当前单元出价, 
                    recmbid: {number}, // 建议修改出价
                    // 展现占比 整数数字，直接后边加%
                    // 如果非法，默认不提示这句： 近7天左侧前三位的展现占比为20%
                    showratio：展现占比

                    // 注：在这里的融合中，融合的数据置于optsug中
                    optsug: {
                        reason: {number},
                        suggestion: {number}
                    }
                },
                // 自定义界面的配置，也各异，不同界面会有不同配置
                custom: {
                    level: {string} word/unit,
                    isNoRequest: true // 表示不去请求，而是使用传入的数据
                },
                // 保存成功的回调处理，注意使用，主要是处理缓存
                onSave: {Function}
                // 取消保存的回调处理，呃，暂时没用啊，放个注释而已
                onCancel: {Function}
            }
     */
    function bind(dialog, actionParam) {
        if(!dialog) {
            return;
        }
        var detailData = actionParam.data;

        // 区分处理single or multi
        // var isSingle = detailData.winfoid.length == 1;

        var level = actionParam.custom.level;

        var bidText = ui.util.get('bizCModBidInput');
        var okBut = ui.util.get('bizCModBidOk');
        if(okBut) {
            okBut.onclick = function() {
                var value = bidText.getValue();
                var modParams = {
                    level: level, // 关键词出价或单元出价 word/unnit
                    data: baidu.object.clone(detailData),
                    onSuccess: function(response) { // 成功回调处理
                        if(baidu.lang.isFunction(actionParam.onSave)) {
                            actionParam.onSave({
                                oldvalue: detailData.isUseUnitbid
                                    ? detailData.unitbid
                                    : detailData.bid,
                                newvalue: value,
                                suggestvalue: detailData.recmbid
                            });
                        }
                        dialog.close();
                    },
                    onFail: function(response) { // 失败回调处理
                        var errorarea = $$('#bizview-bid-errorinfo')[0];
                        if (response.status != 500) {
                            var error = fbs.util.fetchOneError(response),
                                errorcode;
                            if (error) {
                                for (var item in error) {
                                    errorcode = error[item].code;
                                    displayError(errorcode, errorarea);
                                }
                            }
                            else {
                                displayError(response.errorCode.code, errorarea);
                            }
                        }else{
                            banError(response, errorarea);
                        }
                    },
                    timeout: 5000, // 超时时间，单位ms
                    onTimeout: function() {} // 超时回调处理
                };

                var i = 0;
                var l;
                switch(level) {
                    case 'word':
                        if(baidu.lang.isArray(modParams.data.bid)) {
                            for(i = 0, l = modParams.data.bid.length; i < l; i++) {
                                modParams.data.bid[i] = value;
                            }
                        }
                        else {
                            modParams.data.bid = value;
                        }
                        break;
                    case 'unit':
                        if(baidu.lang.isArray(modParams.data.unitbid)) {
                            for(i = 0, l = modParams.data.unitbid.length; i < l; i++) {
                                modParams.data.unitbid[i] = value;
                            }
                        }
                        else {
                            modParams.data.unitbid = value;
                        }
                        break;
                }


                bidCommon.modify(modParams);
            };
        }

        var cancelBut = ui.util.get('bizCModBidCancel');
        if(cancelBut) {
            cancelBut.onclick = function() {
                dialog.close();
            };
        }
    }

    /**
     * 显示错误信息
     * @param {Object} errorcode
     */
    function displayError(errorcode, errorarea){
        if (errorcode == 605 || errorcode == 607
            || errorcode == 608 || errorcode == 699
            || errorcode == 606 || errorcode == 408) {
            errorarea.innerHTML = nirvana.config.ERROR.KEYWORD.PRICE[errorcode];
            errorarea.style.display = "block";
        }
    }

    /**
     * 封禁提示
     * @param {Object} response
     * @param {Object} errorarea
     */
    function banError(response, errorarea){
        if (response.status == 500 &&
                response.errorCode && response.errorCode.code == 408) {
            displayError(408, errorarea);
        }
        else {
            ajaxFail(0);
        }
    }

    return exports;

})();