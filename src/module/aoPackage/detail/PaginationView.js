/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/detail/PaginationView.js
 * desc: AO优化包提供分页功能的表格详情视图类
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/03/14 $
 */
/**
 * AO优化包具有分页功能表格详情视图类
 * @class PaginationView
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.PaginationView = function($, T, nirvana) {
    function PaginationView() {
    }

    PaginationView.prototype = {
        /**
         * 渲染详情核心内容
         * @override
         */
        renderContent: function(contentView, tableOption) {
            var me = this;
            // 调用父类方法，创建表格组件
            if (me.getAttr('pkgid') == 7) {
                // 针对突降包特殊逻辑，只有突降包需要默认按decr列排序
                (tableOption || (tableOption = {})).orderBy = 'decr';
            }
            PaginationView.superClass.renderContent.call(me, contentView, tableOption);

            // 创建分页组件
            var pageView = fc.create('<div class="aopkg-page-ui"></div>');
            contentView.appendChild(pageView);
            var pageUI = ui.util.create('Page', { id: 'WidgetPage' }, pageView);

            // 将动态创建的UI组件添加到UIMap属性里
            T.object.extend(me._UIMap, { WidgetPage: pageUI });

            // 绑定分页组件的选择分页事件处理器
            pageUI.onselect = function(value) {
                me.setAttr('pageNo', value);
                me.loadDetail();
            };
        },
        /**
         * 绑定表格视图事件处理器
         * @param {nirvana.aopkg.CustomTable} table 要绑定事件处理器的表格
         * @implemented
         */
        bindTableViewHandler: function(table) {
            var me = this;

            // 绑定表格行内操作事件处理器
            table.addInlineHandler(nirvana.tableHandler.inlineHandler, me);
            // 绑定表格行选择事件处理器
            table.addRowSelHandler('onRowSelHandler', me);
        },
        /**
         * 表格行选择的事件处理器
         * @param {Array} selIdxs 选择的行的索引数组
         */
        onRowSelHandler: function(selIdxs) {
            // this.disableBatchBtn(selIdxs.length === 0);
            this.processBatchBtnStat(selIdxs.length === 0);
        },
        /**
         * 获取分页组件
         * @return {ui.Page}
         */
        getPager: function() {
            return this._UIMap.WidgetPage;
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
            var pageSize = +me.getAttr('pageSize');
            var startIdx = (me.getAttr('pageNo') - 1) * pageSize;

            var condition = {
                startindex: startIdx,
                endindex: startIdx + pageSize - 1,
                optmd5 : me.getAttr('suboptmd5'),
                // 0表示不重新计算详情，1表示重新计算详情。如果不填，默认为0
                recalculate: me.getAttr('recalculate') || 0,
                decrtype: me.getAttr('decrtype') || undefined,
                // 新增用于旺季包的参数tradeid
                tradeid: me.getAttr('tradeId'),
                pkgContext: logger.pkgContext,
                actionStep: logger.actionStep
            };

            return {
                level: me.getAttr('level'),
                opttypeid: me.getAttr('opttypeid'),
                optmd5: me.getAttr('optmd5'),
                condition: condition
            };
        },
        /**
         * 请求详情成功的回调
         * @param {Object} response 响应的数据对象
         * @implemented
         */
        requestDetailSuccess: function(response) {
            var me = this;

            // 请求成功以后，重置是否需要重新计算为false
            me.setAttr('recalculate', 0);

            var data = response.data;
            var detailresitems = data.detailresitems;
            var totalNum = data.totalnum;

            // 如果当前页没有数据，则返回第一页重新请求
            var pageNo = +me.getAttr('pageNo');
            if (totalNum > 0 && detailresitems.length === 0) {
                if (pageNo === 1) {
                    // 如果在第一页，则将totalnum强制置为0
                    totalNum = 0;
                }
                else {
                    me.setAttr('pageNo', 1);
                    me.loadDetail();
                    return;
                }
            }

            // 更新tip话术的count信息，如果有的话
            var countEle = me.$('.aopkg_widget_tip .count')[0];
            countEle && (countEle.innerHTML = totalNum);

            // 初始化期初和期末日期
            var commData = data.commData;
            var beginDate;
            var endDate;
            if (commData) {
                var beginDate = commData.begindate;
                beginDate = beginDate && (new Date(+beginDate));
                var endDate = commData.enddate;
                endDate = endDate && (new Date(+endDate));
            }

            var format = T.date.format;
            var table = me.getTable();
            table.setData({
                beginDate: beginDate ? format(beginDate, 'M月d日') : '期初',
                endDate: endDate ? format(endDate, 'M月d日') : '期末'
            });

            // 更新分页组件
            me.updatePageUI(pageNo, totalNum);

            var listData = [];
            T.each(detailresitems, function (item) {
                listData.push(item.data);
            });
            // 更新表格视图
            table.update(listData, me.getNoDataTip());
            // 高亮表格修改过的行
            me.highlightModifiedRows();
            // 更新添加按钮状态
            // me.disableBatchBtn(totalNum === 0);
            me.processBatchBtnStat(totalNum === 0);
        },

        processBatchBtnStat: function(param) {
            this.disableBatchBtn(param);

            // 读写分离，待升级之后不用这种方式了
            // by Leo Wang
            nirvana.acc.accService.processEntrances('aoPackage/detail/' + this.getOpttypeid());
        },

        /**
         * 高亮修改过的记录
         */
        highlightModifiedRows: function() {
            var modifiedRecords = this.getAttr('modifiedRecords') || {};
            var idName;
            var idValues;
            var table = this.getTable();
            var ds = table.getDatasource();
            var item;
            var i;
            var indexOf = T.array.indexOf;

            for (idName in modifiedRecords) {
                idValues = modifiedRecords[idName];
                for (i = ds.length; i --;) {
                    item = ds[i];
                    if (indexOf(idValues, item[idName]) != -1) {
                        table.highlightRow(i, 'ui_table_trmark');
                    }
                }
            }
        },
        /**
         * 更新分页组件
         * @param {number} pageNo 当前显示的分页号
         * @param {number} totalNum 总的记录数
         */
        updatePageUI: function(pageNo, totalNum) {
            var pageSize = +this.getAttr('pageSize');
            // 计算总页数
            var totalPage = Math.ceil(totalNum / pageSize);
            // 保持原有逻辑，最大为100页
            totalPage = Math.min(totalPage, nirvana.aoPkgConfig.MAX_PAGE);

            var pageUI = this.getPager();
            // 如果分页总数发生变化或当前分页号发生变化，则重新渲染分页组件
            if (totalPage !== pageUI.total || pageNo !== pageUI.page) {
                pageUI.total = totalPage;
                pageUI.page = pageNo;
                pageUI.render();
            }
        },
        /**
         * 添加修改的标识信息
         * @private
         */
        _addModifiedFlag: function() {
            // 标识当前详情内容被做过修改
            this.setModified(true);
            // 详情内容修改过，重新计算状态置为1，这样下次请求详情后端会重新计算详情内容
            this.setAttr('recalculate', 1);
        },
        /**
         * 触发修改操作: 添加修改标识信息，发送监控，重新刷新详情
         * @param {?string} logName 要执行的监控的名称，该监控必须在
         *                           nirvana.AoPkgMonitor下定义
         * @param {...*} logArgs 要执行的监控要传入的参数列表
         *               NOTICE: 默认会往该监控末尾传入opttype参数
         * @protected
         */
        fireMod: function(logName) {
            var me = this;

            // 添加修改标识信息
            me._addModifiedFlag();

            // 发送监控
            if (logName) {
                var logArgArr = Array.prototype.slice.call(arguments, 1);
                logArgArr.push(me.getOpttypeid());
                me.logger[logName].apply(null, logArgArr);
            }

            // 重新加载详情
            me.loadDetail();
        },
        /**
         * 缓存当前所做修改的物料，便于下次刷新的时候，然后高亮显示修改的物料
         * @param {string} idName 标识修改的物料的id名称，比如winfoid,planid
         * @param {string} idValue 所修改的物料的id值，即idName属性值
         */
        addModifiedInfo: function(idName, idValue) {
            var modifiedRecords = this.getAttr('modifiedRecords');
            if (!modifiedRecords) {
                modifiedRecords = {};
                this.setAttr('modifiedRecords', modifiedRecords);
            }

            var idValueArr = modifiedRecords[idName]
                || (modifiedRecords[idName] = []);
            if (T.array.indexOf(idValueArr, idValue) == -1) {
                idValueArr.push(idValue);
            }
        },
        ////////////////////////////////////////////////////////////////////////
        /**
         * 表格行内操作和批量操作事件处理，触发这些事件主要在{@link tableHandler}里完成，具体
         * 涉及到事件绑定见该详情视图或者其父类{@link TableView}
         */

        /**
         * 修改关键词/单元/计划的状态成功的事件回调
         * @param {string} levelName 所处的层级名称:planinfo,unitinfo,wordinfo
         * @param {string} levelIdName 所处的层级所使用的id名称：planid,unitid,winfoid
         * @param {string} idValue 所修改的物料的id值，即物料的planid/unitid/winfoid值
         */
        onModStateSuccess: function(levelName, levelIdName, idValue) {
            this.addModifiedInfo(levelIdName, idValue);
            this.fireMod('inlineRun', levelName, levelIdName, idValue);
        },
        /**
         * 行内修改关键词的匹配成功的事件回调
         * @param {Object} item 修改的关键词对象
         * @param {number} wmatch 修改后关键词的匹配
         */
        onModWmatchSuccess: function(item, wmatch) {
            this.addModifiedInfo('winfoid', item.winfoid);
            this.fireMod('inlineModMatchSuccess', item, wmatch);
        },
        /**
         * 行内修改关键词的出价成功的事件回调
         * @param {Object} item 修改的关键词对象
         * @param {number} wbid 修改后关键词的出价
         */
        onModBidSuccess: function(item, wbid) {
            this.addModifiedInfo('winfoid', item.winfoid);
            this.fireMod('inlineModBidSuccess', item, wbid);
        },

        /**
         * 批量启用计划/单元/关键词成功的事件回调
         * @param {Object} modifiedInfo 批量启用的信息
         * @param {Array} modifiedInfo.rowIdxs 批量启用所对应的表格行索引数组
         * @param {Array} modifiedInfo.idArr 批量启用的物料的id值数组，
         *                即物料的planid/unitid/winfoid值
         * @param {Array} modifiedInfo.level 批量启用的层级名称:
         *                planinfo,unitinfo,wordinfo
         */
        /**
         * 批量修改匹配的事件回调
         * @param {Object} modifiedInfo 批量修改匹配的信息
         * @param {Array} modifiedInfo.rowIdxs 批量修改的关键词所对应的表格行索引数组
         * @param {Array} modifiedInfo.winfoids 批量修改的关键词的winfoid信息
         * @param {Array} modifiedInfo.wmatchs 批量修改的关键词的匹配信息
         * @param {Array} modifiedInfo.recmwmatchs 批量修改的关键词的推荐匹配信息
         */
        /**
         * 批量修改出价的事件回调
         * @param {Object} modifiedInfo 批量修改出价的信息
         * @param {Array} modifiedInfo.rowIdxs 批量修改的关键词所对应的表格行索引数组
         * @param {Array} modifiedInfo.winfoids 批量修改的关键词的winfoid信息
         * @param {Array} modifiedInfo.bids 批量修改的关键词的出价信息
         * @param {Array} modifiedInfo.recmbids 批量修改的关键词的推荐出价信息
         */
        /**
         * 批量删除单元的事件回调
         * @param {Object} modifiedInfo 批量删除单元的信息
         * @param {Array} modifiedInfo.rowIdxs 批量删除的单元所对应的表格行索引数组
         * @param {Array} modifiedInfo.unitids 批量删除的单元的id信息
         */
        onBatchApplySuccess: function(modifiedInfo) {
            var me = this;
            var applyType = me.getAttr('applyType');
            var loggerName = {
                multiRun: 'batchRun',
                modWmatch: 'batchModWMatch',
                modBid: 'batchModBid',
                deleteUnit: 'batchDelUnits',
                modPlanBudget: 'batchModPlanBudget'
            };
            this.fireMod(loggerName[applyType], modifiedInfo);
        },
        /**
         * 其它行内点击操作的事件处理器
         */
        onInlineClk: function(target) {
            var me = this;
            var rowIdx;
            var item;
            //用于移动包的优化出价，暂时 mayue
            if (T.dom.hasClass(target, 'op_bid_pop')) {
                var cellPos = nirvana.tableUtil.getTriggerCellPos(target);
                rowIdx = cellPos.row;
                item = me.getTable().getDatasource()[rowIdx];
                // 弹出式优化出价的操作
                nirvana.util.openSubActionDialog({
                    id: 'modifyWordBidDialog',
                    title: '修改关键词出价',
                    width: 440,
                    actionPath: 'manage/modWordPrice',
                    maskLevel : nirvana.aoPkgWidgetCommon.getMaskLevel(),
                    params: {
                        winfoid: [item.winfoid],
                        bid: [item.bid],
                        name: [item.showword],
                        unitbid: [item.unitbid],
                        onsubmit: function(data){
                            if (data.modifyData) {
                            	me._addModifiedFlag();
                                me.addModifiedInfo('winfoid', item.winfoid);
                                me.loadDetail();
                            }
                        }
                    }
                });

                if (item.deviceprefer == 0) {
                    var tip = fc.create('<span class="red">该关键词投放了全部设备，修改出价将在计算机和移动设备搜索推广同时生效</span>');
                    baidu.q('ui_dialog_foot', 'ctrldialogmodifyWordBidDialog')[0].appendChild(tip);
                }
                return true;
            }
            // mod by Huiyao: 移到viewUtil.js里 2013-5-10
//            else if (T.dom.hasClass(target, 'status_icon')) {  //用于移动包的搜索无效提示，暂时 mayue
//                var cellPos = nirvana.tableUtil.getTriggerCellPos(target);
//                rowIdx = cellPos.row;
//                item = me.getTable().getDatasource()[rowIdx];
//                var minbid = item.minbid;
//                ui.Dialog.factory.create({
//                    maskLevel : nirvana.aoPkgWidgetCommon.getMaskLevel(),
//                    id: 'aoPkgWordStatus',
//                    title: '<span class="status_icon offlineReason_icon"></span><span class="offlineReasonTitle">目前关键词处于离线中，可能存在以下原因</span>',
//                    width: 655,
//                    content: '<div class="offlineReason">'
//                        + '<table>'
//                        + '<tr><th>搜索无效</th><td>关键词低于最低展现价格，要使其有效，您可优化关键词质量度或者使出价不低于最低展现价格' + minbid + '元</td><tr>'
//                        + '</table>'
//                        + '<p style="width:98%;padding:5px 0 10px 10px;color:#999999;border-top:1px solid #cccccc;">如有疑问，您可拨打我们的服务热线：400-890-0088</p></div>',
//                    ok_button: false,
//                    cancel_button: false
//                });
//                return true;
//            }
        }
        ////////////////////////////////////////////////////////////////////////
    };

    // 继承表格视图
    T.inherits(PaginationView, nirvana.aoPkgControl.TableView);
    return PaginationView;
}($$, baidu, nirvana);