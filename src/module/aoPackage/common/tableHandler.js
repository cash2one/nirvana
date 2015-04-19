/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: core/common/tableHandler.js
 * desc: 表格控件克重用的行内操作和批量操作的处理器方法
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/02/18 $
 */
/**
 * 表格控件可重用的行内操作和批量操作的处理器方法
 */
nirvana.tableHandler = function($, T, fbs, nirvana) {
    var failHandler = nirvana.util.getReqFailHandler;
    var hasClass = T.dom.hasClass;
    var fixed = T.number.fixed;
    var tableUtil = nirvana.tableUtil;
    var bizUtil =  nirvana.bizUtil;
    var bind = nirvana.util.bind;
    var getFieldData = tableUtil.getFieldData;
    var executeCallback = nirvana.util.executeCallback;

    /**
     * 行内修改操作事件处理器定义
     * @type {Object}
     */
    var inlineHandlerMap = {
        bid: inlineBid,
        wmatch: inlineWmatch,
        recmbid: inlineRecmBid,
        recmwmatch: inlineRecmWmatch,
        planBudget: inlinePlanBudget,
        addTarget: inlineAddTarget,
        enablePlan: inlineRun,
        enableUnit: inlineRun,
        enableWord: inlineRun,
        enableIdea: inlineRun,
        pauseWord: inlinePause,
        pauseIdea: inlinePause
    };

    /**
     * 表格行内编辑的统一的事件处理器，对于当前触发的DOM节点事件触发，当前支持如下几种方式：
     * 1. 包含edit_btn样式名的节点，会通过其edittype属性值来获取对应的事件处理方法
     * 2. 该节点包含action或act属性，会通过该属性值来获取对应的事件处理方法
     *
     * 对于1,2默认通过绑定该行内事件处理的上下文里查找该事件回调定义，比如详情视图实例的上下文。
     * 如果找不到默认在预定义的事件处理回调里查找见{@link inlineHandlerMap}
     *
     * 4. 如果前面几种不存在任何事件处理回调的定义，默认将触发onInlineClk的事件，可以直接在通过
     *    绑定该行内事件处理的上下文，比如详情视图实例的上下文里定义该事件处理（不建议方式）
     *
     * @param {ui.Table} table 绑定行内操作的表格控件
     * @param {Object} event 触发行内点击操作的事件对象
     * @param {HTMLElement} target 触发行内点击操作的目标DOM元素
     * @return {boolean} 如果该点击操作触发相应的事件处理器的执行，则返回true
     */
    function inlineHandler(table, event, target) {
        var me = this;
        var type;

        if (hasClass(target, 'edit_btn')) {
            var current = nirvana.inline.currentLayer;

            if (current && current.parentNode) {
                current.parentNode.removeChild(current);
            }

            type = target.getAttribute('edittype');
        }
        else {
            type = target.getAttribute('action') || target.getAttribute('act');
        }

        // 优先从当前触发事件的上下文里查找事件处理器，找不到再到InlineHandlerMap查找公共的
        var handler = type && (me[type] || inlineHandlerMap[type]);

        if (handler) {
            var cellPos = tableUtil.getTriggerCellPos(target);
            var row = cellPos.row;
            var item = T.lang.hasValue(row) && table.datasource[row];
            handler.call(me, target, item, row, cellPos.col);
            return true;
        }
        else {
            /**
             * 对于其它定制的行内事件处理，可以在这个事件回调里处理
             * @event onInlineClk
             * @param {HTMLElement} target 触发该编辑动作的目标DOM元素
             */
            return executeCallback('onInlineClk', [target], me);
        }
    }

    function modBidSuccess(wbid, item, data) {
        nirvana.bizUtil.updateWordCacheOfBid(wbid, item.winfoid, data);
        executeCallback('onModBidSuccess', [item, wbid], this);
    }

    /**
     * 行内修改出价
     * @param {HTMLElement} target 触发该编辑动作的目标DOM元素
     * @param {Object} item 要修改的关键词的数据对象
     */
    function inlineBid(target, item) {
        var me = this;
        var winfoid = item.winfoid;

        var okHandler = function(wbid) {
            var param = {
                winfoid: [winfoid],
                bid: wbid,
                onSuccess: bind(modBidSuccess, me, wbid, item)
            };

            return {
                func: fbs.keyword.modBid,
                param: param
            };
        };

        var bid = + item['bid'] ? fixed(item['bid']) : fixed(item['unitbid']);

        nirvana.inline.createInlineLayer({
            type: 'text',
            value: bid,
            id: 'bid' + winfoid,
            target: target.parentNode,
            okHandler: okHandler
        });
    }

    /**
     * 行内修改关键词的推荐出价
     * @param {HTMLElement} target 触发该编辑动作的目标DOM元素
     * @param {Object} item 要修改的关键词的数据对象
     * @param {number} rowIdx 所修改的行的索引
     * @param {number} colIdx 所修改的列的索引
     */
    function inlineRecmBid(target, item, rowIdx, colIdx) {
        var me = this;
        var okHandler = function(wbid) {
            var modBid = function() {
                nirvana.inline.dispose();
                /**
                 * 修改推荐出价完成的事件回调
                 * @event onModRecmBid
                 * @param {number} index 所修改的行的索引
                 * @param {number} newvalue 修改后的推荐出价
                 */
                executeCallback('onModRecmBid', [rowIdx, colIdx, fixed(wbid)], me);
            };

            return {
                validate: bind(nirvana.validate.bid, null, wbid),
                func: modBid,
                param: {}
            };
        };

        nirvana.inline.createInlineLayer({
            type: 'text',
            value: fixed(item['recmbid']),
            id: 'bidrecm' + rowIdx,
            target: target.parentNode,
            singleLine: 'top',
            okHandler: okHandler
        });
    }

    function modWmatchSuccess(wmatch, item, data) {
        var me = this;

        if (data.status != 300) {
            nirvana.bizUtil.updateWordCacheOfMatch(wmatch, item.winfoid);
            executeCallback('onModWmatchSuccess', [item, wmatch], me);
        }
    }

    /**
     * 行内修改匹配方式
     * @param {HTMLElement} target 触发该编辑动作的目标DOM元素
     * @param {Object} item 要修改的关键词的数据对象
     */
    function inlineWmatch(target, item) {
        var me = this;
        var winfoid = item.winfoid;

        var okHandler = function(match) {
            return {
                func: fbs.keyword.modWmatch,
                param: {
                    winfoid: [winfoid],
                    wmatch: match,
                    onSuccess: bind(modWmatchSuccess, me, match, item)
                }
            };
        };

        nirvana.inline.createInlineLayer({
            type: "select",
            value: item.wmatch,
            id: "wmatch" + winfoid,
            target: target.parentNode,
            datasource: nirvana.config.WMATCH.DATASOURCE,
            okHandler: okHandler
        });
    }

    /**
     * 行内修改关键词的推荐匹配
     * @param {HTMLElement} target 触发该编辑动作的目标DOM元素
     * @param {Object} item 要修改的关键词的数据对象
     * @param {number} rowIdx 所修改的行的索引
     * @param {number} colIdx 所修改的列的索引
     */
    function inlineRecmWmatch(target, item, rowIdx, colIdx) {
        var me = this;

        var okHandler = function(wmatch) {
            var modMatch = function() {
                nirvana.inline.dispose();
                /**
                 * 修改推荐匹配完成的事件回调
                 * @event onModRecmWmatch
                 * @param {number} index 所修改的行的索引
                 * @param {number} newvalue 修改后的推荐匹配
                 */
                executeCallback('onModRecmWmatch', [rowIdx, colIdx, wmatch], me);
            };

            return {
                func: modMatch,
                param: {}
            };
        };

        nirvana.inline.createInlineLayer({
            type: 'select',
            value: item.recmwmatch,
            id: 'wmatchrecm' + rowIdx,
            target: target.parentNode,
            datasource: nirvana.config.WMATCH.DATASOURCE,
            singleLine : 'top',
            okHandler: okHandler
        });
    }

    function modPlanBudgetSuccess(wbudget, item) {
        var me = this;

        var modifyData = {};
        modifyData[item.planid] = {
            wbudget: wbudget
        };
        fbs.material.ModCache('planinfo', "planid", modifyData);

        executeCallback('onModPlanBudgetSuccess', [item, wbudget], me);
    }

    /**
     * 行内修改计划预算
     */
    function inlinePlanBudget(target, item) {
        var me = this;
        var planId = item.planid;
        var okHandler = function(wbudget) {
            var param = {
                items: {
                    wbudget: wbudget
                },
                planid: [planId],
                onSuccess: bind(modPlanBudgetSuccess, me, wbudget, item)
            };

            return {
                func: fbs.plan.modBudget,
                param: param
            };
        };

        nirvana.inline.createInlineLayer({
            type: 'text',
            value: item.wbudget,
            id: 'planBudget' + planId,
            target: target.parentNode,
            okHandler: okHandler
        });
    }

    /**
     * 行内触发关键词所属的计划和单元的修改
     * @param {HTMLElement} target 触发该编辑动作的目标DOM元素
     * @param {Object} item 要修改的关键词的数据对象
     * @param {number} rowIdx 所修改的行的索引
     * @param {number} colIdx 所修改的列的索引
     */
    function inlineAddTarget(target, item, rowIdx, colIdx) {
        var me = this;

        var params = {
            showword: item.showword,
            currplanid: + item.recmplanid,
            currunitid: + item.recmunitid,
            currplanname: item.recmplanname,
            currunitname: item.recmunitname
        };

        var dlg = new nirvana.aopkg.PlanUnitEditDlg();
        /**
         * 编辑计划和单元成功的事件回调
         * @event onEditPlanUnitSuccess
         * @param {number} index 所修改的行的索引
         * @param {Object} planInfo 修改的计划信息
         * @param {Object} unitInfo 修改的单元信息
         */
        // 绑定编辑成功事件处理器
        dlg.onEditPlanUnitSuccess = bind('onEditPlanUnitSuccess', me, rowIdx, colIdx);

        dlg.show(params);
    }

    function modMaterialState(item, target, isPause) {
        // 显示loading状态
        tableUtil.showLoadingIcon(target);

        var me = this;
        var levelInfo = nirvana.bizUtil.getLevelInfo(target.getAttribute('actLevel'));
        var levelIdName = levelInfo.id;
        var levelName = levelInfo.name;
        var idValue = item[levelIdName];

        var params = {
            pausestat: isPause ? 1 : 0, // 启用0 暂停1
            onSuccess: function(response) {
                //单独操作时重新设置缓存
                fbs.material.ModCache(levelName, levelIdName, response.data);
                executeCallback('onModStateSuccess',
                    [levelName, levelIdName, idValue, isPause], me);
            },
            onFail: function () {
                target.innerHTML = '';
                ajaxFailDialog(isPause ? '暂停失败' : '启用失败');
            }
        };
        params[levelIdName] = [idValue];

        var requester = bizUtil.MOD_STATE_REQUESTER[levelInfo.level];
        requester && requester(params);
    }

    /**
     * 行内启用计划/单元/关键词/创意
     * @param {HTMLElement} target 触发该编辑动作的目标DOM元素
     * @param {Object} item 要修改的数据对象
     */
    function inlineRun(target, item) {
        modMaterialState.call(this, item, target, false);
    }

    /**
     * 行内暂停计划/单元/关键词/创意
     * @param {HTMLElement} target 触发该编辑动作的目标DOM元素
     * @param {Object} item 要修改的数据对象
     */
    function inlinePause(target, item) {
        modMaterialState.call(this, item, target, true);
    }

    ////////////////////////////////////////////////////////////////////////////

    /**
     * 批量操作事件处理器定义
     * @type {Object}
     */
    var batchHandlerMap = {
        modBid: modBidBatch,
        modWmatch: modWmatchBatch,
        addWords: addWordsBatch,
        multiRun: doMultiRun,
        deleteUnit: delUnitBatch,
        modPlanBudget: modPlanBudgetBatch
    };

    /**
     * 批量修改失败的默认处理器
     * @param {Object} response 服务端响应的数据对象
     */
    function batchModFailHandler(response) {
        if (response.status === 300) {
            nirvana.aoPkgWidgetHandle.ajaxFailSome();
        }
        else {
            ajaxFailDialog();
        }
    }

    /**
     * 批量修改出价
     * @param {Array} selRowIdxArr 选择的行的索引数组
     * @param {Array} ds 表格的数据源
     * @param {Function} callback （部分）修改出价成功的回调
     */
    function modBidBatch(selRowIdxArr, ds, callback) {
        var context = this;
        var initFields = ['winfoid', 'bid', 'unitbid', 'recmbid'];
        var fieldValues = getFieldValues(selRowIdxArr, initFields, ds);

        // 批量修改为不同的出价
        fbs.keyword.modBid({
            winfoid: fieldValues.winfoids,
            bid: fieldValues.recmbids,
            onSuccess: function(response) {
                var modifiedInfo = T.object.extend(fieldValues, {
                    rowIdxs: selRowIdxArr
                });

                executeCallback(callback, [modifiedInfo], context);

                // 清除关键词层级缓存
                bizUtil.updateCacheInfo('word');
            },
            onFail: batchModFailHandler
        });
    }

    /**
     * 获取指定的域名的阈值，返回的新的域名会在原来域名基础上后面加上's'
     * @param {Array} selRowIdxArr 要获取的行索引数组
     * @param {Array|string} fieldNames 要获取的数据源的域名
     * @param {Array} ds 数据源
     * @param {Object} fieldMap 为要获取的域名称指定的新的域名称的map，可选
     * @return {Object}
     * @example
     *      <code>
     *          getFieldValues([0, 3], ['winfoid', 'recmbid'], ds, {recmbid: 'bid'})
     *          result:
     *          {
     *              winfoids: [23, 56],
     *              bids: [3.5, 1.5]
     *          }
     *      </code>
     */
    function getFieldValues(selRowIdxArr, fieldNames, ds, fieldMap) {
        T.lang.isArray(fieldNames) || (fieldNames = [fieldNames]);
        fieldMap = fieldMap || {};

        var info = {};
        var name;
        var newFieldName;
        for (var i = fieldNames.length; i --;) {
            name = fieldNames[i];
            newFieldName = fieldMap[name];
            newFieldName || (newFieldName = name);
            info[newFieldName + 's'] = getFieldData(selRowIdxArr, name, ds);
        }

        return info;
    }

    /**
     * 批量修改匹配模式
     * @param {Array} selRowIdxArr 选择的行的索引数组
     * @param {Array} ds 表格的数据源
     * @param {Function} callback （部分）修改关键词匹配成功的回调
     */
    function modWmatchBatch(selRowIdxArr, ds, callback) {
        var context = this;
        var initFields = ['winfoid', 'wmatch', 'recmwmatch'];
        var fieldValues = getFieldValues(selRowIdxArr, initFields, ds);

        // 批量修改为不同的匹配模式
        fbs.keyword.modDiffWmatch({
            winfoid: fieldValues.winfoids,
            wmatch: fieldValues.recmwmatchs,
            onSuccess: function(response) {
                var modifiedInfo = T.object.extend(fieldValues, {
                    rowIdxs: selRowIdxArr
                });

                executeCallback(callback, [modifiedInfo], context);

                // 清除关键词层级缓存
                bizUtil.updateCacheInfo('word');
            },
            onFail: batchModFailHandler
        });
    }

    /**
     * 批量添加关键词
     * @param {Array} selRowIdxArr 选择的行的索引数组
     * @param {Array} ds 表格的数据源
     * @param {Function} callback （部分）添词成功的回调
     * @param {string} opttypeid 批量添词所属的优化项类型id
     * @param {boolean} acceptIdea 是否接受推荐创意的标识，true为接受
     */
    function addWordsBatch(selRowIdxArr, ds, callback, opttypeid, acceptIdea) {
        var context = this;
        var attrMap = {
            recmplanid: 'planid',
            recmunitid: 'unitid',
            recmplanname: 'planname',
            recmunitname: 'unitname',
            recmwmatch: 'wmatch',
            recmbid: 'bid',
            showword: '',
            wordid: ''
        };
        
        if (opttypeid == 801) {
            attrMap.recmideaid = '';
        }

        var item;
        var toAddItems = [];
        var selItems = getFieldData(selRowIdxArr, null, ds);
        for (var i = 0, len = selItems.length; i < len; i ++) {
            item = nirvana.util.copy(selItems[i], attrMap);
            T.extend(item, { idx: selRowIdxArr[i] });
            toAddItems[i] = item;
        }
        
        var mainParam = {
            opttypeid: opttypeid || '',
            items: toAddItems,
            onSuccess: function(response) {
                var initFields = [
                    'wordid', 'showword', 'recmplanid',
                    'recmunitid', 'recmbid', 'recmwmatch'
                ];
                var fieldValues = getFieldValues(selRowIdxArr, initFields,
                    ds, attrMap);

                var modifiedInfo = T.object.extend(fieldValues, {
                    rowIdxs: selRowIdxArr
                });

                executeCallback(callback,
                    [modifiedInfo, ds, response, opttypeid, acceptIdea], context);

                // 清除关键词层级缓存
                fbs.material.clearCache('planinfo');
                fbs.material.clearCache('unitinfo');
                bizUtil.updateCacheInfo('word');
            },
            onFail: batchModFailHandler
        };

        if (opttypeid != 801) {
            mainParam.extra = {
                opttypeid: mainParam.opttypeid
            };
            mainParam.sourceType = 'NIKON_WEB_BASE';
            delete mainParam.opttypeid;
            fbs.nikon.addWords.call(this, mainParam);
        }
        else {
            mainParam.acceptidea = acceptIdea ? 1 : 0;
            mainParam.resetdevice = 1;
            fbs.nikon.addmaterial.call(this, mainParam);
        }
    }

    /**
     * 批量删除单元
     * @param {Array} selRowIdxArr 选择的行的索引数组
     * @param {Array} ds 表格的数据源
     * @param {Function} callback （部分）删除单元成功的回调
     */
    function delUnitBatch(selRowIdxArr, ds, callback) {
        var context = this;
        var unitids = getFieldData(selRowIdxArr, 'unitid', ds);

        fbs.unit.del({
            unitid: unitids,
            onSuccess: function (response) {
                var modifiedInfo = {
                    rowIdxs: selRowIdxArr,
                    unitids: unitids
                };

                executeCallback(callback, [modifiedInfo], context);
            },
            onFail: batchModFailHandler
        });
    }

    /**
     * 批量启用计划/单元/关键词
     * @param {Array} selRowIdxArr 选择的行的索引数组
     * @param {Array} ds 表格的数据源
     * @param {Function} callback （部分）启用成功的回调
     */
    function doMultiRun(selRowIdxArr, ds, callback) {
        var context = this;
        var levelInfo = nirvana.bizUtil.getLevelInfo(context.getAttr('levelType'));
        var idArr = getFieldData(selRowIdxArr, levelInfo.id, ds);

        var params = {
            pausestat: 0, // 启用0 暂停1
            onSuccess: function(response) {
                var modifiedInfo = {
                    rowIdxs: selRowIdxArr,
                    idArr: idArr,
                    level: levelInfo.name
                };

                executeCallback(callback, [modifiedInfo], context);

                // 缓存处理
                bizUtil.updateCacheInfo(levelInfo.level, idArr);
            },
            onFail: batchModFailHandler
        };
        params[levelInfo.id] = idArr;

        var requester = bizUtil.MOD_STATE_REQUESTER[levelInfo.level];
        requester && requester(params);
    }

    /**
     * 批量修改计划预算
     * @param {Array} selRowIdxArr 选择的行的索引数组
     * @param {Array} ds 表格的数据源
     * @param {Function} callback （部分）修改计划预算成功的回调
     */
    function modPlanBudgetBatch(selRowIdxArr, ds, callback) {
        var context = this;
        var planIds = getFieldData(selRowIdxArr, 'planid', ds);
        var oldBudgets = getFieldData(selRowIdxArr, 'wbudget', ds);
        var newBudgets = getFieldData(selRowIdxArr, 'suggestbudget', ds);

        var modInfo = {};
        for (var i = 0, len = selRowIdxArr.length; i < len; i ++) {
            modInfo[planIds[i]] = {
                wbudget: newBudgets[i]
            };
        }

        var params = {
            modinfo: modInfo,
            onSuccess: function (response) {
                var status = +response.status;

                if (status === 300) { // 修改预算部分成功
                    fbs.material.clearCache('planinfo');
                }
                else {
                    fbs.material.ModCache('planinfo', 'planid', modInfo);
                }

                var modifiedInfo = {
                    rowIdxs: selRowIdxArr,
                    planIds: planIds,
                    wbudgets: oldBudgets,
                    newWbudgets: newBudgets
                };
                T.extend(modifiedInfo, modInfo);
                executeCallback(callback, [modifiedInfo], context);
            },
            onFail: batchModFailHandler
        };

        fbs.plan.batchModBudget(params);
    }

    return {
        /**
         * 定义表格行内操作的处理器, 包括单元出价行内编辑、编辑创意、状态启动/暂停/查看、建议操作
         * @param {Object} event
         * @param {HTMLElement} target
         * @return {Boolean} 如果target触发了handler的执行，返回true，否则返回false
         */
        inlineHandler: inlineHandler,
        /**
         * 预定义的几种表格行内事件处理器
         */
        inlineHandlerMap: inlineHandlerMap,
        /**
         * 预定义的几种表格批量操作处理器
         */
        batchHandlerMap: batchHandlerMap
    };
}($$, baidu, fbs, nirvana);