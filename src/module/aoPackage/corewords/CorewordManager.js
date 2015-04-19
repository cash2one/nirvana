/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/corewords/CorewordManager.js
 * desc: 重点词的管理
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/05 $
 */
/**
 * 重点词的管理
 * @class CorewordManager
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.CorewordManager = function($, nirvana) {
    function CorewordManager(corewordPkg, containerElem, headElem, footElem) {
        this._pkg = corewordPkg;

        this._container = containerElem;
        this._header = headElem;
        this._footer = footElem;
        this._filterType = FILTER_TYPE.ALL;
    }

    /* 监控对象的简写*/
    var M = nirvana.AoPkgMonitor;
    var FILTER_TYPE = nirvana.aopkg.CorewordDetail.COREWORD_FILTER;
    var bindContext = nirvana.util.bind;
    var Store = nirvana.aopkg.CorewordStorage;

    CorewordManager.prototype = {
        isQuit: function() {
            return this._pkg.isQuit();
        },
        initHeaderBtns: function() {
            var me = this;

            me._widgetMap = ui.util.init($('.coreword_op', me._header)[0]);

            // 为修改重点词添加事件处理器
            ui.util.get('modCoreword').onclick = function() {
                nirvana.CoreWordsPackage.modCoreWords.init({
                    onclose: function(removeWinfoids, addWinfoids, needSync) {
                        // 强制刷新推荐重点词
                        me._pkg.refreshRecmdCorewords();
                        if (needSync) {
                            // 刷新重点词优化详情数据
                            me.refreshCorewordsDetails();
//                            // 强制刷新推荐重点词
//                            me._pkg.refreshRecmdCorewords();
                        }
                        else {
                            // 从重点词详情里移除指定的重点词
                            me.removeCoreword(removeWinfoids);

                            if (addWinfoids.length > 0) {
                                me.addCoreword(addWinfoids);
                            }
                        }
                    }
                });
            };

            var regionSelBtn = me.getRegionSelectBtn();
            // 为展现地域选择添加事件处理器
            regionSelBtn.onclick = function(e) {
                me.showRegionSelector(e);
            };
            // 更新地域选择按钮状态
            me.updateRegionSelBtnState();

            // 创建地域选择对话框实例
            me._regionSelector = new nirvana.aopkg.RegionSelector(
                null,
                {
                    target: regionSelBtn.getId(),
                    repairL: 353
                }
            );

            // 添加地域选择事件处理器
            me._regionSelector.onSelect = bindContext(me.regionChangeHandler, me);
        },
        getRegionSelectBtn: function() {
            return ui.util.get('selRegion');
        },
        init: function() {
            var me = this;

            // 创建重点词详情
            me._corewordDetail = new nirvana.aopkg.CorewordDetail();

            // 初始化标题区域的按钮
            me.initHeaderBtns();

            // 创建重点词表格
            var table = new nirvana.aoPkgControl.CorewordTable();
            me._table  = table;
            table.show($('.coreword_table', me._container)[0]);

            // 创建行内事件处理器
            me.inlineHandler = new nirvana.aoPkgControl.TableInlineHandler(me);

            // 重点词详情事件订阅
            me._corewordDetail.subscribe(nirvana.aopkg.CorewordDetail.DATA_CHANGE,
                function(basicInfo, filterInfo, corewordArr, isAppend){
                    if (!me.isQuit()) {
                        if (isAppend) {
                            // 更新重点词分析筛选类别数量信息
                            me.updateFilterInfo(filterInfo);
                            // 更新地域信息
                            me.updateRegionInfo(basicInfo);
                        } else {
                            // 应用返回的重点词优化详情基本信息
                            me.applyCoreWordsBasicInfo(basicInfo, filterInfo);
                        }
                        // 应用返回的重点词优化详情的数据
                        me.updateCorewordTable(corewordArr, isAppend);
                    }
                });
            me._corewordDetail.subscribe(nirvana.listener.LOAD_FAIL,
                function() {
                    if (!me.isQuit()) {
                        nirvana.corewordUtil.alertRequestFail('重点词详情获取失败');
                    }
                });

            // 初始化更新倒计时组件
            me._countdowner = new nirvana.aopkg.Countdowner();
            // 订阅计时器变化的事件
            me._countdowner.subscribe(
                nirvana.aopkg.Countdowner.CHANGE,
                bindContext(me.counterChangeHandler, me)
            );
        },
        /**
         * 显示重点词管理内容：分析筛选、重点词详情表格、诊断信息、地域切换、关注新重点词
         * @method show
         */
        show: function() {
            var me = this;

            // 执行初始化
            me.init();
            // 绑定事件处理函数
            me.bindEventHandler();
            // 刷新重点词优化详情数据
            me.refreshCorewordsDetails();
        },
        /**
         * 重点词诊断更新的倒计时变化的事件处理器
         */
        counterChangeHandler: function(counter) {
            var OPTYPE = {
                HIDE: 1,
                SHOW: 2,
                UPDATE: 3
            };

            function op(selector, context, opId) {
                // 包含要更新的元素包括重点词表格区域和footer区域
                var elemArr = $(selector, context._container);
                Array.prototype.push.apply(
                    elemArr, $(selector, context._footer)
                );

                var len = elemArr.length;
                var elem;

                for (var i = 0; i < len; i ++) {
                    elem = elemArr[i];
                    switch (opId) {
                        case OPTYPE.HIDE:
                            baidu.addClass(elem, 'hide');
                            break;
                        case OPTYPE.SHOW:
                            baidu.removeClass(elem, 'hide');
                            break;
                        case OPTYPE.UPDATE:
                            elem.innerHTML = counter;
                            break;
                    }
                }
            }

            // 更新重点词表格的倒计时时间
            this._table.setUpdateRemainder(counter);

            if (counter > 0) {
                op('.counter_remain', this, OPTYPE.UPDATE);
            } else {
                op('.diagnosis_counter', this, OPTYPE.HIDE);
                op('.coreword_update_btn', this, OPTYPE.SHOW);
            }
        },
        subscribeCorewordDelEvents: function() {
            var me = this,
                coreword = me._pkg._coreword;

            // 订阅重点词取消关注的失败/成功事件
            coreword.subscribe(nirvana.aopkg.Coreword.DEL_SUCCESS,
                bindContext(me.delCorewordSuccess, me));
            coreword.subscribe(nirvana.aopkg.Coreword.DEL_FAIL,
                bindContext(me.delCorewordFail, me));
        },
        delCorewordSuccess: function(wordIdList) {
            // 发送监控
            M.delCorewordInline(wordIdList);

//            // 从重点词详情里移除指定的重点词
//            this._corewordDetail.remove(wordIdList);
//            // 更新过滤信息
//            this.updateFilterInfo(this._corewordDetail.getFilterInfo());
//            // 先移除表格所对应的记录
//            this._table.removeRow(this._delRowIdx);
//            // 重置过滤类型，保证不出现过滤类型为空的类别
//            this.resetFilterType();
//
//            // 如果删除关注的重点词后，全部类别已经为空，则清除诊断信息
//            this.resetDiagnosisTime();
            this.removeCoreword(wordIdList);
        },
        /**
         * 取消重点词关注失败的处理
         * @private
         */
        delCorewordFail: function() {
            nirvana.corewordUtil.alertCorewordDelFail();
        },
        /**
         * 为控件绑定事件处理器
         */
        bindEventHandler: function() {
            var me = this,
                delegate = nirvana.event.delegate;

            // 为分析筛选类别添加过滤事件处理器
            var filterEle = $('.coreword_filter', me._container)[0],
                handler = delegate(filterEle, me.corewordsFilterHandler, me);
            filterEle.onclick = handler;

            // 给表格注册:行内编辑处理器
            me._table.addInlineHandler(me.tableInlineHandler, me);

            // 订阅重点词删除失败的事件处理器
            me.subscribeCorewordDelEvents();

            // 代理对话框footer区域的立即更新事件处理
            // 由于立即更新事件处理同表格单元格的立即更新操作，因此这里用表格行内事件处理
            me._footer.onclick = delegate(me._footer, me.tableInlineHandler, me);
        },
        /**
         * 添加关注的重点词到重点词表格里
         * @method addCoreword
         * @param {Array} addWordIdList 要添加的重点词ID列表，已经在服务端添加
         */
        addCoreword: function(addWordIdList) {
            if (!addWordIdList || !addWordIdList.length) {
                return;
            }

            this._corewordDetail.add(addWordIdList);
        },
        /**
         * 从重点词详情表格里移除给定的重点词
         * @param {Array} removeWinfoids 要移除的重点词winfoid数组，已经在服务端删除
         */
        removeCoreword: function(removeWinfoids) {
            if (!removeWinfoids || !removeWinfoids.length) {
                return;
            }

            var me = this;
            // 从重点词详情里移除指定的重点词
            me._corewordDetail.remove(removeWinfoids);

            // 更新过滤信息
            var filterInfo = me._corewordDetail.getFilterInfo();
            me.updateFilterInfo(filterInfo);

            // 重置过滤类型，保证不出现过滤类型为空的类别
            if (!me.resetFilterType()) {
                me.switchFilterType(me._filterType);
            }

            // 如果删除关注的重点词后，全部类别已经为空，则清除诊断信息
            me.resetDiagnosisTime();
        },
        /**
         * 获取已经关注的重点词数量
         * @return {number}
         */
        getAddedCorewordNum: function() {
            return this._corewordDetail.getCorewordNum();
        },
        /**
         * 初始重点词优化包基本信息，并更新重点词优化包基本信息
         * @param {Object} 重点词优化详情基本信息对象
         * @param {Object} 分析筛选各个类别数量的统计信息的Map：{filterType: Number, ...},
         *  filterType定义见{@link aoPackage/config.js#CORE_WORDS_FILTER_TYPE}
         */
        applyCoreWordsBasicInfo: function(commData, filterTypeNumMap) {
            var me = this;
            // 重点词诊断时间
            var procTime = commData.proctime;
            var oldProcTime = me._procTime;
            var hasChange = (!me._selRegionId
                || me._selRegionId !== commData.currentwregion);
            hasChange = hasChange
                || (procTime && (!oldProcTime || oldProcTime !== procTime));

            // 缓存当前诊断时间和选择地域ID
            procTime && (me._procTime = procTime);
            me._selRegionId = commData.currentwregion;

            // 更新地域信息
            me.updateRegionInfo(commData);

            // 更新重点词优化包基本信息:诊断时间
            me.updateCorewordDiagnosisTime(procTime, + commData.remaintime,
                hasChange);
            // 更新重点词分析筛选类别数量信息
            me.updateFilterInfo(filterTypeNumMap);
        },

        updateRegionInfo: function(commData) {
            // 当前选择展示的投放地域
            var currentwregion = commData.currentwregion,
                // 获取选择的地域的名称
                selectRegionName = nirvana.corewordUtil.findRegionNameById(
                    currentwregion,
                    REGION_LIST
                );

            // 更新地域选择按钮的状态信息
            this.updateRegionSelBtnState(selectRegionName);

            var table = this._table;
            // 更新表格控件选择的地域信息
            table.setSelRegionName(currentwregion, selectRegionName);
        },

        updateRegionSelBtnState: function(selRegionName) {
            var regionSelBtn = this.getRegionSelectBtn();

            regionSelBtn.disable(!selRegionName);
            regionSelBtn.setLabel(selRegionName || '没有地域');
        },
        /**
         * 如果当前过滤类别：全部为空，则重置诊断时间，清除原有诊断信息
         */
        resetDiagnosisTime: function() {
            // 如果删除关注的重点词后，全部类别已经为空，则清除诊断信息和地域选择信息
            if (this._corewordDetail.isEmpty(FILTER_TYPE.ALL)) {
                this._procTime = null;
                this.updateCorewordDiagnosisTime(null);
                this.updateRegionSelBtnState(null);
            }
        },
        /**
         * 更新重点词优化包诊断时间
         * @param {string} time 重点词诊断时间
         * @param {number} remainder 重点词下次诊断还剩的分钟数
         * @param {boolean} hasChange 跟这次会话上一次刚获得的诊断时间是否发生变化
         */
        updateCorewordDiagnosisTime: function(time, remainder, hasChange) {
            if (!time) {
                // 获取诊断时间失败，停止倒计时
                this._countdowner.stop();
                this._footer.innerHTML = '';
                return;
            } else if (!hasChange) {
                return;
            }

            // 格式化诊断时间
            var displayTime = baidu.date.format(new Date(+ time), 'HH:mm');
            var html;

            // 用于对照组判断条件：对于对照组，没有remainder信息或者小于0非法值，对于对照组
            // 显示第一版的重点词包的话术
            if (!remainder || remainder < 0) {
                // 重置为null 保证后面能区分倒计时时间还是没有倒计时时间
                remainder = null;
                html = lib.tpl.parseTpl(
                    { time: displayTime },
                    'oldCorewordDiagnosisInfo',
                    true
                );
            }
            else {
                // 后端不应该返回remainder为0，如果为0已经表明当前已经是最新的诊断，这里0应
                // 变为最大需要等待的更新诊断的时间
                html = lib.tpl.parseTpl(
                    {
                        counter: remainder,
                        time: displayTime,
                        comma: '，',
                        counterClass: '',
                        btnClass: 'hide'
                    },
                    'corewordDiagnosisInfo',
                    true
                );
            }

            // 渲染诊断信息
            this._footer.innerHTML = html;

            // 更新重点词表格的诊断时间和离下次诊断还剩的时间信息
            this._table.setDiagnosisTime(displayTime, remainder);
            // 重置倒计时信息，并重新开始倒计时
            this._countdowner.reset(remainder);
        },
        /**
         * 更新重点词分析筛选类别信息
         * @param {Object} 分析筛选类别数量的Map
         */
        updateFilterInfo: function(filterTypeNumMap) {
            var me = this,
                filterEleArr = $('.corword_filter_label', me._container),
                ele,
                num,
                attrValue;

            for (var i = 0, len = filterEleArr.length; i < len; i ++) {
                ele = filterEleArr[i];
                attrValue = + baidu.getAttr(ele, 'filtertype');
                num = filterTypeNumMap[attrValue];
                //对于数据获取异常，可能没有各个类别数量信息，即其值为undefined，这里重置为0
                num = num || 0;

                // 过滤类别数量为0，将其隐藏，对于‘全部’类别不隐藏
                if (!num && attrValue != FILTER_TYPE.ALL) {
                    baidu.dom.hide(ele);
                } else {
                    baidu.dom.first(ele).innerHTML = '(' + num + ')';
                    baidu.dom.show(ele);
                }
            }
        },

        /**
         * 定义表格行内操作的处理器, 包括单元出价行内编辑、编辑创意、状态启动/暂停/查看、建议操作
         * @param {Object} event
         * @param {HTMLElement} target
         * @return {Boolean} 如果target触发了handler的执行，返回true，否则返回false
         */
        tableInlineHandler: function(event, target) {
            return this.inlineHandler.doInlineTask(event, target);
        },
        /**
         * 请求删除重点词的关注
         * @param target
         */
        requestDelCoreword: function(target) {
            var me = this;
            var word = me.getTriggerInlineEventWord(target);

            var callback = function() {
                // 缓存要删除的行索引信息
//                me._delRowIdx = word.index;
                // 执行取消重点词关注的操作
                me._pkg._coreword.del([+ word.data.winfoid]);
            };

            nirvana.corewordUtil.confirmCorewordDel(callback, word.data);
        },
        updateCorewordTable: function(data, isAppend) {
            var me = this;

            if (isAppend) {
                // 清除表格的排序状态
                me._table.clearSortState();
                // 将过滤类型切到全部，保证能添加到当前表格的前面
                me.swithFilterTypeToAll();
            } else {
                // 每次刷新数据的时候，可能上一次筛选类型在新获取的数据不存在，
                // 因此需要对分析筛选类别重置一下
                if (!me.resetFilterType()) {
                    me.switchFilterType(me._filterType);
                }
            }
        },
        doCorewordTableUpdate: function(data) {
            // 发送监控
            nirvana.AoPkgMonitor.corewordDataStable(data, this._filterType);
            // 更新表格
            this._table.update(data);
        },
        /**
         * 对重点词进行分析筛选操作
         * @param {String|Number} 要分析筛选的类型值
         */
        doCorewordsFilter: function(filterType) {
            var me = this;

            // 发送监控
            var filterTypeNumMap = me._corewordDetail.getFilterInfo();
            M.filterCoreword(me._filterType, filterType, filterTypeNumMap);
            // 切换到指定的筛选类别
            me.switchFilterType(filterType);
        },
        switchFilterType: function(filterType) {
            var me = this;

            // 缓存当前的过滤类型
            me._filterType = filterType;

            // 过滤重点词
            var result = me._corewordDetail.filter(filterType);
            // 更新表格
            me.doCorewordTableUpdate(result);
        },
        /**
         * 检测当前选择的过滤类型是否为空，如果选择的过滤类型不为‘全部’，且为空，
         * 则重置选择的类型为‘全部’
         * @return {boolean} 如果执行了重置过滤类型，返回true，否则返回false
         */
        resetFilterType: function() {
            var empty = this._corewordDetail.isEmpty(this._filterType);
            // 当前要过滤的类型为空，重置为全部类型
            if (empty) {
                this.swithFilterTypeToAll();
                return true;
            }
            return false;
        },
        swithFilterTypeToAll: function() {
            // 重置一下分析筛选类别样式
            var result = $('.corword_filter_label[filtertype='
                + this._filterType + ']', this._container);
            result[0] && baidu.removeClass(result[0], 'coreword_filter_sel');

            result = $('.corword_filter_label[filtertype='
                + FILTER_TYPE.ALL + ']', this._container);
            result[0] && baidu.addClass(result[0], 'coreword_filter_sel');
            // 切换到ALL类别
            this.switchFilterType(FILTER_TYPE.ALL);
        },
        /**
         * 重点词分析筛选的事件处理器
         * @param {Object} event
         * @param {HTMLElement} target
         * @return {Boolean} 如果target触发了handler的执行，返回true，否则返回false
         */
        corewordsFilterHandler: function(event, target) {
            var me = this,
                selStyleName = 'coreword_filter_sel';

            if (!baidu.dom.hasClass(target, selStyleName) &&
                baidu.dom.hasClass(target, "corword_filter_label")) {
                var selEleArr = $('.' + selStyleName, me._container);

                // 添加元素被选择的样式
                baidu.dom.addClass(target, selStyleName);

                // 进行过滤操作
                me.doCorewordsFilter(baidu.getAttr(target, 'filtertype'));

                // 去除已经选择的元素的样式
                for (var i = 0, len = selEleArr.length; i < len; i ++) {
                    baidu.dom.removeClass(selEleArr[i], selStyleName);
                }
            } else {
                return false;
            }

            return true;
        },
        /**
         * 获取触发行内事件的所在行绑定的重点词对象
         * @param {HTMLElement} target 触发事件的目标元素
         * @return {Object} 重点词对象
         */
        getTriggerInlineEventWord: function(target) {
            var me = this,
                tableData = me._table.getTableData(),
                rowIdx = nirvana.tableUtil.getTriggerCellPos(target).row;

            if (rowIdx >= 0 && rowIdx < tableData.length) {
                return {
                    data: tableData[rowIdx],
                    index: rowIdx
                };
            } else {
                return null;
            }
        },
        /**
         * 根据给定的重点词的winfoid查找缓存的重点词数据，返回找到的重点词对象，未找到返回null
         * @param {String|Number} winfoid 要查找的重点词的winfoid
         * @return {Object} 重点词数据对象
         */
        getCoreword: function(winfoid) {
            return this._corewordDetail.getCoreword(winfoid);
        },
        /**
         * 显示地域选择对话框
         * @param {Object} e 事件对象
         */
        showRegionSelector: function(e) {
            var selectedRegion = this._corewordDetail.getSelectRegionId(),
                regionList = this._corewordDetail.getRegionIdList();

            this._regionSelector.show(selectedRegion, regionList);

            // 阻止事件的冒泡
            baidu.event.stopPropagation(e || window.event);
        },
        /**
         * 刷新重点词信息，重新请求数据
         */
        refreshCorewordsDetails: function(winfoidArr) {
            // 重新请求重点词优化详情数据
            // this.requestCorewordsData();

            if (winfoidArr) {
                // 先保存后刷新
                var selRegionId = this._corewordDetail.getSelectRegionId();
                var diagnosisTime = this._corewordDetail.getDiagnosisTime();
                Store.add(selRegionId, diagnosisTime, winfoidArr);
            }

            this._corewordDetail.load();
        },
        /**
         * 地域选择事件处理器
         */
        regionChangeHandler: function(oldSelRegionId, newSelRegionId) {
            // 更新展现地域
            this._corewordDetail.updateRegion(newSelRegionId);
            // 发送监控
            M.switchCorwordRegion(oldSelRegionId, newSelRegionId);
        },
        /**
         * 销毁实例
         * @method dispose
         */
        dispose: function() {
            ui.util.disposeWidgetMap(this._widgetMap);
            this._countdowner.dispose();
            this._table.dispose();
            this._regionSelector.dispose();
            this._pkg = null;
            this._container = null;
            this._header = null;
            this._footer = null;
            this._corewordDetail.dispose();
        }
    };

    return CorewordManager;
}($$, nirvana);