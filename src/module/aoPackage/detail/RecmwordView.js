/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/detail/RecmwordView.js
 * desc: AO优化包提词详情视图类
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/03/11 $
 */
/**
 * AO优化包提词详情视图类
 * @class RecmwordView
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.RecmwordView = function($, T, nirvana) {
    var executeCallback = nirvana.util.executeCallback;

    function RecmwordView() {
    }

    RecmwordView.prototype = {
        /**
         * 渲染详情核心内容
         * @override
         */
        renderContent: function(contentView) {
            var me = this;

            // 创建工具栏
            var html = er.template.get('aoPkgAddwordDetailToolbar');
            var toolbarView = fc.create(html);
            me.createToolbar(toolbarView);
            contentView.appendChild(toolbarView);

            // 创建表格视图
            var tableClass = me.getAttr('tableStyle') || 'addword_table';
            var tableView = fc.create('<div class="' + tableClass + '"></div>');
            contentView.appendChild(tableView);
            me.createTable(nirvana.aopkg.RecmwordTable, tableView);

//            //////////////////////移动优化包引入特殊逻辑 mayue
//            var opttypeid = me.getOpttypeid();
//            if (opttypeid == 801) {
//                T.dom.insertBefore(
//                    fc.create(
//                        '<span id="checkRecIdea">' +
//                            '<input type="checkbox" id="acceptRecmIdea" checked="checked" />' +
//                            '<label for="acceptRecmIdea">' +
//                                '向新单元推荐创意，提升上线效率。' +
//                            '</label>' +
//                            '<span _ui="id:checkRecIdea;type:Bubble;source:attach_rec_idea;"></span>' +
//                        '</span>'
//                    ),
//                    me.$('.warn-info')[0]
//                );
//                fc.ui.init(baidu.g('checkRecIdea'));
//            }
        },
        /**
         * 创建工具栏
         * @param {HTMLElement} toolbarView 工具栏视图容器
         */
        createToolbar: function(toolbarView) {
            var me = this;
            var uiConf = {
                recmbidBatchMod: 'onBatchModRecmbid',
                recmwmatchBatchMod: 'onBatchModRecmwmatch',
                recmplanunitBatchMod: 'onBatchModRecmPlanUnit'
            };
            // 创建按钮组件
            var uiMap = ui.util.init(toolbarView);
            // 为按钮绑定点击事件处理器
            for (var id in uiMap) {
                uiMap[id].onclick = nirvana.util.bind(uiConf[id], me);
            }
            me.setAttr('toolbarBtnMap', uiMap);

            // 将动态创建的UI组件添加到UIMap属性里
            T.object.extend(me._UIMap, uiMap);
        },
        /**
         * 获取详情视图的Tip信息的模板数据
         * @return {Object}
         * @override
         */
        getViewTipTplData: function() {
            return { searchword: this.getAttr('searchword') };
        },
        /**
         * 禁用批量应用按钮和工具栏上的批量修改按钮
         * @param {boolean} disabled 是否禁用
         * @override
         */
        disableBatchBtn: function(disabled) {
            RecmwordView.superClass.disableBatchBtn.call(this, disabled);
            var btnMap = this.getAttr('toolbarBtnMap');
            for (var id in btnMap) {
                btnMap[id].disable(disabled);
            }
        },
        /**
         * 绑定表格视图事件处理器
         * @implemented
         */
        bindTableViewHandler: function(recmTable) {
            var me = this;

            // 绑定表格行内操作事件处理器
            recmTable.addInlineHandler(nirvana.tableHandler.inlineHandler, me);
            // 添加点击more事件处理器
            recmTable.onClickMore = function(nthLoad, recmdwordArr) {
                // 发送监控
                me.logger.clickRecmwordMoreBtn(
                    me.getOpttypeid(), nthLoad, recmdwordArr
                );
            };
            // 绑定行选择的事件处理器
            recmTable.onRowSel = function(selIdxs) {
                me.disableBatchBtn(selIdxs.length === 0);
            };
        },
        /**
         * 加载推词的详情触发事件
         * @implemented
         */
        onLoadDetail: function() {
            var me = this;
            if (!me.getAttr('totalrecmnum')) {
                // 如果首屏词数量为0或者不存在，直接不请求
                me.requestDetailSuccess({ data: { detailresitems: [] }});
                return false;
            }
        },
        /**
         * 获取详情请求的参数
         * @return {Object}
         * @override
         */
        getRequestParam: function() {
            var logger = nirvana.aoPkgControl.logCenter;
            // 特殊逻辑，为了监控需要，在展现详情时，认为一次展现就是一个动作
            logger.actionStepPlus1();

            var me = this;

            var condition = {
                startindex: 0,
                endindex: me.getAttr('totalrecmnum') - 1,
                // 不存在置为undefined，确保其转成Json时候能被过滤掉
                decrtype: me.getAttr('decrtype') || undefined,
                searchword: me.getAttr('searchword') || undefined,
                pkgContext: logger.pkgContext,
                actionStep: logger.actionStep
            };

            return {
                level: me.getAttr('level'),
                opttypeid: me.getAttr('opttypeid'),
                condition: condition
            };
        },
        /**
         * 请求推词详情成功的回调
         * @param {Object} response 响应的数据对象
         * @implemented
         */
        requestDetailSuccess: function(response) {
            var me = this;
            var detailresitems = response.data.detailresitems;
            var listData = [];

            T.each(detailresitems, function (item) {
                listData.push(item.data);
            });

            var table = me.getTable();
            // 更新表格视图
            table.update(listData, me.getNoDataTip());
            // 更新添加按钮状态
            me.disableBatchBtn(table.getFirScreenWordNum() == 0);
        },
        /**
         * 是否有行内修改
         * @return {boolean}
         */
        hasInlineMod: function() {
            return  this.getTable().getModRecordNum();
        },
        /**
         * 获取行内修改的提示消息
         * @return {string}
         */
        getInlineModTip: function() {
            var btnLabel = this.getBatchApplyBtnLabel();
            return lib.tpl.parseTpl({ btn: btnLabel }, 'inlineModTip', true);
        },
        /**
         * 关闭详情视图的事件处理器
         * @override
         */
        closeView: function() {
            var me = this;
            if (me.hasInlineMod()) {
                var msg = this.getInlineModTip() + '<br />确认返回上一级？';
                ui.Dialog.confirm({
                    title: '确认',
                    content: msg,
                    onok: function(){
                        executeCallback('onClose', [], me);
                    }
                });
            }
            else {
                executeCallback('onClose', [], me);
            }
        },
        /////////////////////////////////////////////////////////////////////
        /**
         * 表格行内操作和批量操作事件处理，触发这些事件主要在{@link tableHandler}里完成，具体
         * 涉及到事件绑定见该详情视图或者其父类{@link TableView}
         */

        /**
         * 更新修改的行信息
         * @param {number|Array} rowIdx 要更新的行的索引
         * @param {number|Array} colIdx 要更新的列的索引
         * @param {Object|Array} data 行内修改的数据信息
         * @private
         */
        _updateModInfo: function(rowIdx, colIdx, data) {
            var me = this;
            var recmTable = me.getTable();

            // 更新表格数据源
            recmTable.updateRowData(rowIdx, data);
            // 重新渲染单元格内容
            recmTable.updateCell(rowIdx, colIdx);

            me.showTip(me.getInlineModTip());
        },
        /**
         * 行内修改推荐出价成功的事件处理器在，这只是本地修改
         * @param {number} rowIdx 修改的行索引
         * @param {number} colIdx 所修改的列的索引
         * @param {number} newBid 新的出价
         */
        onModRecmBid: function(rowIdx, colIdx, newBid) {
            this._updateModInfo(rowIdx, colIdx, { recmbid: newBid });
        },
        /**
         * 行内修改推荐匹配成功的事件处理器，这只是本地修改
         * @param {number} rowIdx 修改的行索引
         * @param {number} colIdx 所修改的列的索引
         * @param {number} newWmatch 新的匹配类型
         */
        onModRecmWmatch: function(rowIdx, colIdx, newWmatch) {
            this._updateModInfo(rowIdx, colIdx, { recmwmatch: newWmatch });
        },
        /**
         * 行内修改关键词的目标计划和单元，这只是本地修改
         * @param {number} rowIdx 修改的行索引
         * @param {number} colIdx 修改的列的索引
         * @param {Object} planInfo 修改后的计划信息
         * @param {string} planInfo.name 修改后的计划名
         * @param {number} planInfo.id 修改后的计划id
         * @param {Object} unitInfo 修改后的单元信息
         * @param {string} unitInfo.name 修改后的单元名
         * @param {number} unitInfo.id 修改后的单元id
         */
        onEditPlanUnitSuccess: function(rowIdx, colIdx, planInfo, unitInfo) {
            this._updateModInfo(
                rowIdx,
                colIdx,
                {
                    recmplanname: planInfo.name,
                    recmunitname: unitInfo.name,
                    recmplanid: planInfo.id,
                    recmunitid: unitInfo.id
                }
            );
        },
        /**
         * 点击批量修改关键词推荐出价按钮的事件处理器
         * @author mayue
         */
        onBatchModRecmbid: function() {
            var me = this;
            var table = me.getTable();
            var selected = table.getSelRowIdxs();
            var source = table.getDatasource();
            var opttypeid = me.getOpttypeid();

            var oribids = [];
            var oriwinfoids = [];
            var orishowwords = [];
            var len = selected.length;
            for (var i = 0; i < len; i ++) {
                oribids.push(source[selected[i]].recmbid);
                oriwinfoids.push(source[selected[i]].showword);
                orishowwords.push(source[selected[i]].showword);
            }
            nirvana.util.openSubActionDialog({
                id: 'modifyWordBidDialog',
                title: '修改关键词出价',
                width: 440,
                actionPath: 'manage/modWordPrice',
                maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel(),
                params: {
                    winfoid: oriwinfoids,
                    bid: oribids,
                    name: orishowwords,
                    hideUnitbid: true,
                    beforeSave: function(bid, winfoids, errorarea) {
                        var that = this;
                        var colIdx = table.findCellColIdx('word_recmbid');
                        var updateData;
                        
                        if (typeof bid != 'object') {
                            fbs.keyword.valmodBid({
                                winfoid: winfoids,
                                bid: bid,
                                onSuccess: function(){
                                    updateData = { recmbid: bid };
                                    me._updateModInfo(selected, colIdx, updateData);
                                    that.onclose();
                                    
                                    var logdata = {
                                        rowIdxs: selected,
                                        showwords: orishowwords,
                                        bids: oribids,
                                        newbids: [bid]
                                    };
                                    nirvana.AoPkgMonitor.localBatchModBid(logdata, opttypeid);
                                },
                                onFail: that.saveSameFailHandler(errorarea)
                            });
                        }
                        else {
                            fbs.keyword.valmodBid({
                                winfoid: winfoids,
                                bid: bid,
                                onSuccess: function(){
                                    updateData = [];
                                    for (var i = len; i --;) {
                                        updateData[i] = { recmbid: bid[i] };
                                    }
                                    me._updateModInfo(selected, colIdx, updateData);
                                    that.onclose();
                                    
                                    var logdata = {
                                        rowIdxs: selected,
                                        showwords: orishowwords,
                                        bids: oribids,
                                        newbids: bid
                                    };
                                    nirvana.AoPkgMonitor.localBatchModBid(logdata, opttypeid);
                                },
                                onFail: that.saveDiffFailHandler(errorarea)
                            });
                        }

                        return false;
                    }
                }
            });
        },
        /**
         * 点击批量修改关键词推荐匹配模式的事件处理
         * @author mayue
         */
        onBatchModRecmwmatch: function() {
            var me = this;
            var table = me.getTable();
            var selected = table.getSelRowIdxs();
            var source = table.getDatasource();
            var opttypeid = me.getOpttypeid();

            var oriwmatchs = [];
            var orishowwords = [];
            var len = selected.length;
            for (var i = 0; i < len; i ++) {
                oriwmatchs.push(source[selected[i]].recmwmatch);
                orishowwords.push(source[selected[i]].showword);
            }
            
            nirvana.util.openSubActionDialog({
                id: 'modifyWordWmatchDialog',
                title: '匹配方式',
                width: 440,
                actionPath: 'manage/modWordWmatch',
                maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel(),
                params: {
                    beforeSave: function(match){
                        var colIdx = table.findCellColIdx('word_recmwmatch');
                        me._updateModInfo(selected, colIdx, { recmwmatch: match });
                        this.onclose();
                        
                        var logdata = {
                            rowIdxs: selected,
                            showwords: orishowwords,
                            wmatchs: oriwmatchs,
                            newwmatch: match
                        };
                        nirvana.AoPkgMonitor.localBatchModWMatch(logdata, opttypeid);
                        
                        return false;
                    }
                }
            });
        },
        /**
         * 点击批量修改关键词推荐的目标计划和单元的事件处理
         * @author mayue
         */
        onBatchModRecmPlanUnit: function() {
            var me = this;
            var table = me.getTable();
            var selected = table.getSelRowIdxs();
            var source = table.getDatasource();
            var opttypeid = me.getOpttypeid();

            var orishowwords = [];
            var oriplannames = [];
            var oriunitnames = [];
            var len = selected.length;
            for (var i = 0; i < len; i ++) {
                orishowwords.push(source[selected[i]].showword);
                oriplannames.push(source[selected[i]].recmplanname);
                oriunitnames.push(source[selected[i]].recmunitname);
            }
            
            var dlg = new nirvana.aopkg.PlanUnitEditDlg();
            dlg.onEditPlanUnitSuccess = function(planinfo, unitinfo) {
                var table = me.getTable();
                var newData = {
                    recmplanid: planinfo.id,
                    recmunitid: unitinfo.id,
                    recmplanname: planinfo.name,
                    recmunitname: unitinfo.name
                };

                var colIdx = table.findCellColIdx('aopkg_detail_shortTarget');
                me._updateModInfo(selected, colIdx, newData);
                
                var logdata = {
                    rowIdxs: selected,
                    showwords: orishowwords,
                    oldplannames: oriplannames,
                    oldunitnames: oriunitnames,
                    newplanname: planinfo.name,
                    newunitname: unitinfo.name
                };
                nirvana.AoPkgMonitor.localBatchModPlanUnit(logdata, opttypeid);
            };
            dlg.show();
        },
        /**
         * 批量添加关键词成功（部分）的事件处理器
         * @param {Object} modifiedInfo 批量添加的关键词信息
         * @param {Array} modifiedInfo.rowIdxs 批量添加的关键词所对应的表格行索引数组
         * @param {Array} modifiedInfo.wordids 批量添加的关键词id数组
         * @param {Array} modifiedInfo.showwords 批量添加的关键词字面值数组
         * @param {Array} modifiedInfo.planids 批量添加的关键词所属的计划id数组
         * @param {Array} modifiedInfo.unitids 批量添加的关键词所属的单元id数组
         * @param {Array} modifiedInfo.bids 批量添加的关键词出价数组
         * @param {Array} modifiedInfo.wmatchs 批量添加的关键词的匹配数据
         * @param {Array} ds 所添加的关键词所属的表格的数据源，传这个参数为了监控需要
         * @param {Object} response 批量添词服务端的响应数据对象
         * @param {string} opttypeid 执行批量添词操作所属的优化项类型id
         * @implemented
         */
        onBatchApplySuccess: function(modifiedInfo, ds, response, opttypeid, acceptIdea) {
            var me = this;
            var status = response.status;
            var addedIndex = modifiedInfo.rowIdxs;

            if (status === 300) { // status 300 也会触发表示部分成功
                // 初始化添加成功的关键词行索引
                addedIndex = [];
                for (var i = 0, len = response.data.length; i < len; i ++) {
                    addedIndex.push(response.data[i].index);
                }
            }
            // 添词成功处理逻辑
            var data = {
                modifiedInfo: modifiedInfo,
                ds: ds
            };
            me.addWordHandler(opttypeid, addedIndex, data, acceptIdea);
        },
        /**
         * 添词行为的公共处理逻辑
         * @private
         */
        addWordHandler: function(opttypeid, addRowIdxs, data, acceptIdea) {
            var me = this;
            var table = me.getTable();

            var firScreenNum = table.getFirScreenWordNum();
            var morewordNum = table.getDatasource().length - firScreenNum;

            // 发送监控
            me.logger.batchAddWords(data.modifiedInfo, data.ds, opttypeid,
                firScreenNum, morewordNum, acceptIdea);

            // 标识有新词添加
            me.setModified(true);
            // 删除添加过的行
            table.delRows(addRowIdxs);

            // 判断是否存在飘红修改过未保存的行记录，若不存在，清空修改提示信息
            if (!table.getModRecordNum()) {
                me.clearTip();
            }
        }
        ////////////////////////////////////////////////////////////////////////
    };

    // 继承表格视图
    T.inherits(RecmwordView, nirvana.aoPkgControl.TableView);
    return RecmwordView;
}($$, baidu, nirvana);