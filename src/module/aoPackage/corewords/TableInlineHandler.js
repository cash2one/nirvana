/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/common/TableInlineHandler.js
 * desc: 表格控件的行内操作的处理器
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/03 $
 */
/**
 * 表格控件的行内操作的处理器
 * @class TableInlineHandler
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.TableInlineHandler = function($, nirvana) {
    function TableInlineHandler(action) {
        this._action = action;
    }

    /* 监控对象的简写*/
    var M = nirvana.AoPkgMonitor;

    TableInlineHandler.prototype = {
        getEditWord: function(target) {
            return this._action.getTriggerInlineEventWord(target).data;
        },
        refresh: function(winfoidArr) {
            this._action.refreshCorewordsDetails(winfoidArr);
        },
        /**
         * 获取触发的状态变更按钮所属的关键词的winfoid
         * @param {HTMLElement}
         * @return {Array} winfoid array
         */
        getStateChangeWinfoids: function(target) {
            var me = this,
                word = me.getEditWord(target),
                winfoid = word.winfoid;
            return [winfoid];
        },
        /**
         * 定义表格行内操作的处理器, 包括单元出价行内编辑、编辑创意、状态启动/暂停/查看、建议操作
         * @param {Object} event
         * @param {HTMLElement} target
         * @return {Boolean} 如果target触发了handler的执行，返回true，否则返回false
         */
        doInlineTask: function(event, target) {
            var me = this,
                hasClass = baidu.dom.hasClass;

            if (hasClass(target, 'coreword_update_btn')) {
                // 发送监控
                M.updateCorewordDetail();

                me.refresh();
            } /*else if (hasClass(target, "status_op_btn")) {
                // 修改关键词的状态，通过状态列启动/暂停按钮触发
                me.doInlineStateChange(target, 'inline');
            } */else if (hasClass(target, 'remove_coreword')) {
                me._action.requestDelCoreword(target);
            } else if (hasClass(target, "edit_btn")) {
                var current = nirvana.inline.currentLayer;

                if (current && current.parentNode) {
                    current.parentNode.removeChild(current);
                }

                var type = target.getAttribute("edittype");
                switch (type) {
                    case "bid": // 编辑当前出价
                        me.doInlineBidEdit(target);
                        break;
                    case "idea": //编辑创意
                        me.doInlineIdeaEdit(target, 'inline');
                        break;
                }
            } else if (hasClass(target, 'status_icon')) {
                // 查看状态离线的详细信息，通过触发子Action方式执行
                manage.offlineReason.openSubAction({
                    type: 'wordinfo',
                    params: target.getAttribute('data'),
                    // 初始化产生的遮罩层的层级
                    maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel()
                });
            } else if (hasClass(target, 'op_suggest')) {
                // 优化建议的事件处理操作
                me.doOptimization(target);
            } else {
                return false;
            }

            return true;
        },
        /**
         * 优化建议操作的事件处理
         */
        doOptimization: function(target) {
            var me = this,
                hasClass = baidu.dom.hasClass,
                word = me.getEditWord(target);

            if (hasClass(target, 'active_word')) {
                ui.Dialog.confirm({
                    title: '激活关键词',
                    content: '您确定激活该关键词吗?',
                    onok: function() {
                        me.doInlineWordActive(target);
                    }
                });
            } else if (hasClass(target, 'run_word')) {
                ui.Dialog.confirm({
                    title: '启用关键词',
                    content: '您确定启用该关键词吗？',
                    onok: function() {
                        me.doInlineStateChange(target);
                    }
                });
            } else if (hasClass(target, 'add_idea')) {
                // 新增有效创意
                me.doInlineIdeaAdd(target);
            } else if (hasClass(target, 'op_accout_budget')) {
                // 账户预算优化
                me.doOptimizeAccoutBudget(target);
            } else if (hasClass(target, 'op_plan_budget')) {
                // 计划预算优化
                me.doOptimizePlanBudget(target);
            } else if (hasClass(target, 'op_quality')) {
                // 优化创意
                me.doInlineIdeaEdit(target);
            } else if (hasClass(target, 'op_bid')) {
                // 优化出价
                me.doOptimizeBid(target);
            }
        },
        /**
         * 优化账户预算
         * @param {HTMLElement} target
         */
        doOptimizeAccoutBudget: function(target) {
            var me = this,
                word = me.getEditWord(target),
                type = 'useracct';

            // 执行账户预算优化操作
            me.doOptimizeBudget(type, word);
        },
        /**
         * 优化计划预算
         * @param {HTMLElement} target
         */
        doOptimizePlanBudget: function(target) {
            var me = this,
                word = me.getEditWord(target),
                type = 'planinfo';

            // 执行计划预算优化操作
            me.doOptimizeBudget(type, word);
        },
        /**
         * 优化计划/账户预算
         * @param {String} type 优化的预算类型，其有效值为'useracct','planinfo'
         * @param {Object} word 所要修改预算的关键词
         */
        doOptimizeBudget: function(type, word) {
            var me = this;

            // 打开优化预算对话框
            manage.budget.openSubAction({
                type: type,
                planid: [word.planid],
                custom: {
                    noDiff: true,
                    noOffline: true,
                    noViewBtn: true,
                    noRadio: true
                },
                onok : function(data) { // 修改预算成功回调函数
                    // 监控
                    nirvana.aoPkgControl.logCenter.extend({
                        planid : type == 'planinfo' ? word.planid : '',
                        oldvalue : data.oldvalue,
                        newvalue : data.newvalue,
                        oldtype : data.oldtype,
                        newtype : data.bgttype,
                        level : type
                    }).sendAs('nikon_modify_budget');
                    // 修改账户/计划预算界面刷新
                    me.refresh([word.winfoid]);

                }
            }, { // 初始化弹出对话框的遮罩层级
                maskLevel : nirvana.aoPkgWidgetCommon.getMaskLevel()
            });
        },
        /**
         * 激活关键词事件处理
         * @param {HTMLElement}
         */
        doInlineWordActive: function(target) {
            var me = this,
                word = me.getEditWord(target),
                winfoidArr = [word.winfoid]; // 参数为数组

            // 定义激活成功的事件回调函数
            var successHandler = function(response) {
                if (response.status != 300) {
                    var modifyData = response.data;

                    // 监控
                    nirvana.aoPkgControl.logCenter.extend({
                        winfoid : [word.winfoid]
                    }).sendAs('nikon_modify_active');

                    // 更新缓存的关键词信息
                    fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
                    fbs.material.ModCache('wordinfo', "winfoid", modifyData);

                    // 激活关键词界面刷新
                    me.refresh(winfoidArr);
                }
            };

            // 定义激活失败回调函数
            var failHandler = function() {
                ajaxFailDialog();
            };

            var param = {
                winfoid : winfoidArr,
                activestat : '0', // 激活关键词
                onSuccess : successHandler,
                onFail : failHandler
            };

            // 请求关键词激活操作
            fbs.keyword.active(param);
        },
        /**
         * 新增有效创意事件处理
         * @param {HTMLElement}
         */
        doInlineIdeaAdd: function(target, inline) {
            var me = this,
                item = me.getEditWord(target),
                type = 'add';

            me.doInlineIdeaAddOrEdit(item, type, inline);
        },
        /**
         * 质量度单元格内的编辑创意的事件处理
         * @param {HTMLElement}
            * @param inline 是否是行内操作
         */
        doInlineIdeaEdit: function(target, inline) {
            var me = this,
                item = me.getEditWord(target),
                type = + item.prefideaid ? 'saveas' : 'add';

            me.doInlineIdeaAddOrEdit(item, type, inline);
        },
        /**
         * 对重点词进行创意的编辑或新增
         * @param {Object} item 重点词对象
         * @param {String} type 创意编辑或删除类型，有效值为:edit, add, saveas
         * @param {String} inline 是否是行内操作
         */
        doInlineIdeaAddOrEdit: function(item, type, inline) {
            var me = this;

            nirvana.manage.createSubAction.idea({
                type: type,
                entranceType : 'aoPackage',
                extendLogParam : {
                    isinline : 'undefined' !== typeof inline ? 1 : 0
                },
                highsaveas: true,    // 在type为：saveas出现新增,确定，取消按钮
                changeable: false,   // 创意所属的计划和单元不可编辑
                planid: item.planid, // 用于新增创意时，默认选择的计划
                unitid: item.unitid, // 用于新增创意时，默认选择的单元
                ideaid: item.prefideaid, // 传入要修改的创意，如果type为edit，则该方法会自动通过ideaid去请求该创意的数据
                winfoid : item.winfoid,
                showword : item.showword,
                maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel(),
                wordref : {
                    show : true,    // 显示参考关键词
                    source : [item] // 表示使用自定义传入的数据
                },
                onsubmit: function() { // 修改/新增创意成功的回调函数
                    // 修改创意界面刷新
                    me.refresh([item.winfoid]);
                }
            });
        },
        /**
         * 表格行内修改当前出价的事件处理
         * @param {HTMLElement}
         */
        doInlineBidEdit: function(target) {
            var me = this,
                parent = target.parentNode,
                winfoid = parent.getAttribute("winfoid"),
                item = me._action.getCoreword(winfoid),
                bid = + item.bid;

            // 判断关键词是否存在出价，否的话，使用单元出价
            if (!bid) {
                bid = item.unitbid;
            }
            bid = baidu.number.fixed(bid);

            // 初始化编辑结束保存的回调函数
            var okHandler = function(wbid) {
                return {
                    // 初始化用于发送修改出价的请求接口，{@link baseService/keyword.js}
                    func: fbs.keyword.modBid,
                    // 定义用于内联编辑层验证输入是否有效的函数
                    validate: function() {
                        if (bid == "null") {
                            baidu.g("errorArea").innerHTML = nirvana.config.ERROR.KEYWORD.PRICE[606];
                            return false;
                        }
                        return true;
                    },
                    // 用于调用前面定义的func发送修改出价请求函数传递的参数
                    param: {
                        // 修改出价的关键词
                        winfoid: [winfoid],
                        // 新的出价
                        bid: wbid,
                        // 修改出价服务器成功返回结果的处理函数
                        onSuccess: function(data) {
                            var modifyData = {}, pausestat = data.data[winfoid];

                            modifyData[winfoid] = {
                                "bid" : wbid
                            };

                            // 监控
                            nirvana.aoPkgControl.logCenter.extend({
                                opttypeid : null,
                                winfoid : winfoid,
                                level : 'wordinfo',
                                isinline : 1,
                                oldvalue : bid,
                                newvalue : wbid
                            }).sendAs('nikon_modify_bid');

                            for (var titem in pausestat) {
                                modifyData[winfoid][titem] = pausestat[titem];
                            }

                            // 更新缓存的关键词信息
                            fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
                            // 更新缓存的监控文件夹关键词信息
                            fbs.material.ModCache('wordinfo', "winfoid", modifyData);

                            // 修改出价界面刷新逻辑
                            me.refresh([winfoid]);
                        }
                    }
                }
            };

            // 创建编辑出价的浮出层
            nirvana.inline.createInlineLayer({
                type: "text",
                value: bid,
                id: "bid" + winfoid,
                target: parent,
                action: "modWordBid",
                okHandler: okHandler
            });
        },
        /**
         * 执行行内关键词状态启用暂停操作
         * @param {HTMLElement}
         */
        doInlineStateChange: function(target, inline) {
            var me = this,
                pauseStat,
            // 初始化修改关键词状态的请求函数
                stateChangeRequestFunc = fbs.keyword.modPausestat,
            // 获取被修改的状态所属的关键词的winfoid
                idArr = me.getStateChangeWinfoids(target);

            // 初始化当前要被修改的新状态
            pauseStat = nirvana.manage.getPauseStat(target, [0, 1]);
            // 添加状态变更的动态图标
            nirvana.manage.inserLoadingIcon(target);

            // 调用请求变更状态的函数
            stateChangeRequestFunc({
                winfoid: idArr,
                pausestat: pauseStat,
                onSuccess: function(response) {
                    var data = response,
                        modifyData = response.data;

                    if(pauseStat == 0){ // 只监控启用
                        // 监控
                        nirvana.aoPkgControl.logCenter.extend({
                            winfoid : idArr,
                            level : 'wordinfo',
                            //action_type : pauseStat,
                            isinline : 'undefined' !== typeof inline ? 1 : 0
                        }).sendAs('nikon_modify_run');
                    }

                    // 更新缓存的关键词信息
                    fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
                    fbs.material.ModCache('wordinfo', "winfoid", modifyData);

                    // 修改关键词状态界面刷新
                    me.refresh(idArr);
                },
                onFail: function() {
                    ajaxFailDialog();
                }
            });
        },
        /**
         * 执行优化出价操作
         * @param {HTMLElement}
         */
        doOptimizeBid: function(target) {
            var me = this,
                word = me.getEditWord(target),
                winfoidArr = [word.winfoid],
            // 对于单元出价特殊处理，之所以这么搞由于调用修改出价逻辑会出错，参考keyword/keyword.js#getSelected
                wordBid = + word.bid || word.unitbid,
                bidArr = [wordBid],
                unitbidArr = [word.unitbid],
                nameArr = [word.showword],
                isUseUnitBid = true;

            if (+word.bid) {
                isUseUnitBid = false;
            }

            var problemType = nirvana.corewordUtil.getCorewordProblemType(word);
            // 执行批量调价逻辑
            me.doBatchModifyBid(winfoidArr, bidArr, unitbidArr, nameArr,
                isUseUnitBid, true, problemType);
        },
        /**
         * 批量修改出价操作
         * @param {Array} winfoidArr 所要修改出价的关键词winfoid数组
         * @param {Array} bidArr 所要修改出价的关键词的关键词出价数组
         * WARNNING: 由于这里实现调用了keyword/modWordPrice.js，这里传进去的bid不是关键词真正的bid，而是用于显示的
         * bid，也就是说没有关键词出价，也不能按真实bid传过去，而是传递unitbid。
         * @param {Array} unitbidArr 所要修改出价的关键词的单元出价数组
         * @param {Array} nameArr 所要修改出价的关键词的字面值数组
         * @param {Boolean} isUseUnitBid 是否默认使用单元出价
         * @param {boolean} isInlineMode 是否是行内修改出价
         * @param {number} problemType 对于行内修改出价需要传递该参数标识当前词的问题
         */
        doBatchModifyBid: function(winfoidArr, bidArr, unitbidArr, nameArr,
                                   isUseUnitBid, isInlineMod, problemType) {
            var me = this;

            nirvana.util.openSubActionDialog({
                id: 'modifyCoreWordBidDialog',
                title: '关键词出价',
                width: 440,
                actionPath: 'manage/modWordPrice',
                maskLevel : nirvana.aoPkgWidgetCommon.getMaskLevel(),
                params: {
                    winfoid: winfoidArr,
                    bid: bidArr,
                    unitbid: unitbidArr,
                    isUseUnitbid: isUseUnitBid,
                    name: nameArr,
                    // 修改出价成功的回调函数
                    onsubmit: function(data) {
                        var modifyData = data.modifyData,
                            newvalue = [],
                            ids = [];
                        for(var o in modifyData){
                            ids.push(+o);
                            if(modifyData[o].bid != null){
                                newvalue.push(modifyData[o].bid)
                            }
                        }
                        if(isInlineMod){
                            // 监控
                            nirvana.aoPkgControl.logCenter.extend({
                                opttypeid : null,
                                winfoid : ids,
                                level : 'wordinfo',
                                isinline : 0,
                                problem: problemType,
                                oldvalue : isUseUnitBid ? unitbidArr.join() : bidArr.join(),
                                newvalue : newvalue.length > 0 ? newvalue.join() : null
                            }).sendAs('nikon_modify_bid');
                        }
//                        else{ // 批量调价功能下掉了，暂时把批量监控去掉 2013.4.10 by huiyao
//                            // 监控
//                            nirvana.aoPkgControl.logCenter.extend({
//                                applycount : ids.length,
//                                selectedids : ids.join(),
//                                selectedoldvalues : isUseUnitBid ? unitbidArr.join() : bidArr.join(),
//                                selectednewvalues : newvalue.length > 0 ? newvalue.join() : null
//                            }).sendAs('nikon_multiapply_bid');
//                        }

                        // 批量调价刷新
                        me.refresh(winfoidArr);
                    }
                }
            });
        }
    };

    return TableInlineHandler;
}($$, nirvana);