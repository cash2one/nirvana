/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/corewords/RecmdCorewordDlg.js
 * desc: 推荐重点词对话框
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/03 $
 */
/**
 * 重点词排名包的推荐重点词对话框
 * @class RecmdCorewordDlg
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.RecmdCorewordDlg = function($, nirvana) {
    /**
     * 推荐重点词对话框的构造函数
     * @constructor
     */
    function RecmdCorewordDlg(recmdCWord, coreword) {
        this._id = 'recmdCorewordDlg';
        this._coreword = coreword;
        this._recmdCWord = recmdCWord;
    }

    var Coreword = nirvana.aopkg.Coreword;

    RecmdCorewordDlg.prototype = {
        /**
         * 点击确定的事件处理器
         * @override
         */
//        onOk: function() {
//            // 添加重点词
//            this._coreword.add(
//                this.getSelCorewords(),
//                nirvana.AoPkgMonitor.CorewordAddType.RECMD_DLG
//            );
//
//            // 暂时先不关闭对话框，等真正提交成功再关闭
//            return false;
//        },
        /**
         * 点击取消按钮或者右上角的x按钮触发的事件
         * @override
         */
        onCancel: function() {
            // 发送关闭推荐重点词对话框监控
            nirvana.AoPkgMonitor.closeRcmdCorewordDlg();
        },
        /**
         * 点击ok按钮成功的事件处理
         * @private
         */
        addSuccess: function(successWordIdList, failWordIdList) {
            // 关闭对话框
            this.close();
        },
        /*addFail: function(toAddWordIdList, failResonType) {
            nirvana.corewordUtil.alertCorewordAddFail(failResonType);
        },*/
        /**
         * 显示推荐重点词的对话框
         * @method show
         */
        show: function() {
            var dlgOption = {
                id: this._id,
                title: '推荐关注重点词',
                width: 720,
                height: 400,
                maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel(),
                ok_button_lang: '添加关注',
                skin: 'recmd_cword'
            };
            this.init(dlgOption, 'recmdCorewordDlg');
            // 重置取消按钮样式
            this.resetCancelBtnStyle();
            // 将添加关注按钮设为disabled
            this.disableOkBtn(!this.getRecmdCWords().length);

            // 绑定事件处理器
            this.bindHandler();
        },
        /**
         * 获取推荐的重点词数据
         * @private
         * @return {Array}
         */
        getRecmdCWords: function() {
            return this._recmdCWord.getData();
        },
        /**
         * 获取选择的重点词ID数组
         * @method getSelCorewords
         * @return {Array}
         */
        getSelCorewords: function() {
            var data = this.getRecmdCWords(),
                selWordIds = [];

            var selWordRowIdxArr = this.getTableWidget().selectedIndex;
            for (var i = 0, len = selWordRowIdxArr.length; i < len; i ++) {
                selWordIds[i] = + data[selWordRowIdxArr[i]]['winfoid'];
            }

            return selWordIds;
        },
        /**
         * 绑定事件处理器
         * @private
         */
        bindHandler: function() {
            var me = this,
                table = me.getTableWidget();

            table.onselect = function(selectedList) {
                me.disableOkBtn(0 == selectedList.length);
            };

            var coreword = me._coreword,
                bindContext = nirvana.util.bind;

            me._successHandler = bindContext(me.addSuccess, me);
            // me._failHandler = bindContext(me.addFail, me);
            // 订阅重点词添加失败/成功事件
            coreword.subscribe(Coreword.ADD_SUCCESS, me._successHandler);
            //coreword.subscribe(Coreword.ADD_FAIL, me._failHandler);

            // 订阅推荐的重点词事件
            me._recmdWordRefreshHandler = bindContext(me.refreshRecmdCWord, me);
            me._recmdCWord.subscribe(
                nirvana.listener.LOAD_SUCCESS, me._recmdWordRefreshHandler);
        },
        /**
         * 刷新推荐的重点词
         * @private
         */
        refreshRecmdCWord: function() {
            var data = this.getRecmdCWords();
            var table = this.getTableWidget();
            table.datasource = data || [];
            // 重新渲染表格控件
            table.render(table.main);
        },
        /**
         * 重置取消按钮的样式为超链接的形式
         * @private
         */
        resetCancelBtnStyle: function() {
            var cancelBtnElem = this._dlg.cancelBtn.main;
            baidu.addClass(cancelBtnElem, 'skin_href_btn');
        },
        /**
         * 禁用添加关注按钮
         * @param {boolean} disabled 是否禁用
         * @private
         */
        disableOkBtn: function(disabled) {
            this._dlg.okBtn.disable(disabled);
        },
        /**
         * 获取表格控件
         * @private
         * @return {ui.Table}
         */
        getTableWidget: function() {
            return ui.util.get(this._tableId);
        },
        /**
         * 获取要初始化的控件的配置选项
         * @override
         */
        getWidgetConfig: function() {
            var config = {};

            this._tableId = 'recmdAddCorewordTable';
            config[this._tableId] = this.getTableConfig();

            return config;
        },
        /**
         * 获取表格的配置
         * @private
         * @return {Object}
         */
        getTableConfig: function() {
//            var tableHelper = nirvana.TableHelper,
//                fields = tableHelper.FIELD_NAME_MAP;
            var tableUtil = nirvana.tableUtil;
            var option = { width: 85, length: 25 };
            var fieldConfig = [
//                tableHelper.getWordFieldConfig({
//                    content: lib.field.getWordRenderer(25),
//                    width: 85
//                }),
                tableUtil.getWordConf(option),
//                tableHelper.getFieldConfig(fields.PLAN_FIELD, {
//                    content: lib.field.getPlanRenderer(25),
//                    width: 85
//                }),
                tableUtil.getPlanConf(option),
//                tableHelper.getFieldConfig(fields.UNIT_FIELD, {
//                    content: lib.field.getUnitRenderer(25),
//                    width: 85
//                }),
                tableUtil.getUnitConf(option),
                this.getReasonFieldConfig()
            ];

            return {
                select: 'multi',
                //bodyHeight: 338,
                isSelectAll: true,
                fields: fieldConfig,
                datasource: this.getRecmdCWords(),
                noDataHtml: FILL_HTML.NO_DATA
            };
        },
        /**
         * 获取建议理由列的配置
         * @private
         */
        getReasonFieldConfig: function() {
            RecmdCoreword = nirvana.aopkg.RecmdCoreword;
            return {
                title: '建议理由',
                content: nirvana.corewordUtil.getRecmReasonRenderer(
                    RecmdCoreword.RECM_ADD_REASON_TYPES,
                    RecmdCoreword.RECM_ADD_RESON_VALUE_MAP
                ),
                width: 120
            };
        },
        /**
         * 销毁推荐对话框实例
         * @override
         */
        dispose: function() {
            var me = this;
            var coreword = me._coreword;

            // 移除订阅的推荐重点词事件
            me._recmdCWord.unsubscribe(
                nirvana.listener.LOAD_SUCCESS,
                me._recmdWordRefreshHandler
            );
            me._recmdCWord = null;

            // 移除订阅的重点词事件
            coreword.unsubscribe(Coreword.ADD_SUCCESS, me._successHandler);
            // coreword.unsubscribe(Coreword.ADD_FAIL, me._failHandler);
            me._coreword = null;

            ui.CustomDialog.prototype.dispose.call(this);
        }
    };

    // 继承自定制对话框
    baidu.inherits(RecmdCorewordDlg, ui.CustomDialog);

    return RecmdCorewordDlg;
}($$, nirvana);

/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/corewords/RecmdCorewordDlg.js
 * desc: 推荐重点词对话框
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/12/03 $
 * TODO NOTICE: 当前为小流量，因此后续对照组下掉，上面代码可以删掉
 */
/**
 * 重点词排名包的推荐重点词对话框
 * @class RecmdCorewordDlg
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.RecmdCorewordDlg2 = function($, T, nirvana) {
    /**
     * 推荐重点词对话框的构造函数
     * @constructor
     */
    function RecmdCorewordDlg(recmdCWord, coreword, existedNum) {
        this._id = 'recmdCorewordDlg';
        this._coreword = coreword;
        this._recmdCWord = recmdCWord;
        // 已经关注的重点词数量
        this._existedNum = existedNum;
    }

    var Coreword = nirvana.aopkg.Coreword;

    RecmdCorewordDlg.prototype = {
        /**
         * 点击取消按钮或者右上角的x按钮触发的事件
         * @override
         */
        onCancel: function() {
            // 发送关闭推荐重点词对话框监控
            nirvana.AoPkgMonitor.closeRcmdCorewordDlg();
        },
        /**
         * @override
         */
        onOk: function() {
            var me = this;
            var coreword = me._coreword;
            var selCorewords = me.getSelCorewords();

            // 先做一下前端验证
            var addNum = selCorewords.addWinfoids.length;
            var delNum = selCorewords.delWinfoids.length;
            var maxNum = me._recmdCWord.getMaxCorewordNum();
            var existedNum = me._existedNum;
            var exceedNum = existedNum + addNum - delNum - maxNum;
            if (exceedNum > 0) {
                nirvana.corewordUtil.alertCorewordExceedLimit(maxNum);
                return false;
            }

            coreword.update(selCorewords.addWinfoids, selCorewords.delWinfoids);
            return false;
        },
        /**
         * 更新重点词成功的事件处理
         * @private
         */
        updateSuccess: function (addSuccessWinfoids, delSuccessWinfoids,
                                errorCorewords) {
            var me = this;

            // 将关注的重点词从推荐的重点词列表里移除
            var recmCWord = me._recmdCWord;
            var recmAddNum = recmCWord.getRecmAddNum();
            var recmDelNum = recmCWord.getRecmDelNum();
            var removeWinfoids = addSuccessWinfoids.concat(delSuccessWinfoids);
            recmCWord.remove(removeWinfoids);

            if (errorCorewords && errorCorewords.length) {
                // 有部分词添加失败
                nirvana.corewordUtil.alertCorewordUpdateSomeSuccess();
            }
            // 发送成功的监控和事件
            nirvana.AoPkgMonitor.updateCoreWordsFromRecm(
                addSuccessWinfoids, delSuccessWinfoids,
                recmAddNum, recmDelNum
            );
            nirvana.util.executeCallback('onSuccess',
                [addSuccessWinfoids, delSuccessWinfoids, errorCorewords], me);

            // 关闭对话框
            me.close();
        },
        /**
         * 更新重点词失败的事件处理
         * @private
         */
        updateFail: function (addWinfoids, delWinfoids, failType) {
            var limitNum = this._recmdCWord.getMaxCorewordNum();
            nirvana.corewordUtil.alertCorewordAddFail(failType, limitNum);
        },
        /**
         * 显示推荐重点词的对话框
         * @method show
         */
        show: function() {
            var recmDelNum = this._recmdCWord.getRecmDelNum();
            var dlgOption = {
                id: this._id,
                title: '重点词更新',
                width: 720,
                height: 400,
                maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel(),
                ok_button_lang: recmDelNum ? '替换重点词' : '添加关注',
                skin: 'recmd_cword'
            };

            var tplName = recmDelNum ? 'recmdCorewordDlg2' : 'recmdCorewordDlg';
            this.init(dlgOption, tplName);

            // 创建对话框脚部的tip元素
            this.useTip('sel-recmcorword-info');

            // 重置取消按钮样式
            this.resetCancelBtnStyle();
            // 将添加关注/替换重点词按钮设为disabled
            this.disableOkBtn(!this.getRecmdCWords().length);

            // 绑定事件处理器
            this.bindHandler();

            // 初始化显示选择的推荐删除和添加的词数量，表格默认是全选
            this.showSelInfo(this._recmdCWord.getRecmAddNum(), recmDelNum || '');
        },
        /**
         * 显示当前选择要添加的和删除的重点词的数量信息
         * @param {number} selAddNum 当前选择要添加关注的重点词数量
         * @param {number} selDelNum 当前选择要删除的重点词数量，如果不存在删除信息，传入
         *                           空值：''或null或undefined
         */
        showSelInfo: function(selAddNum, selDelNum) {
            var tpl = er.template.get('recmdCorewordDlgSelAddTip');
            if (!nirvana.util.isEmptyValue(selDelNum)) {
                tpl += er.template.get('recmdCorewordDlgSelDelTip');
            }
            var html = lib.tpl.parseTpl({
                addNum: selAddNum,
                delNum: selDelNum
            }, tpl);
            this.showTip(html);
        },
        /**
         * 获取推荐的重点词数据
         * @private
         * @return {Array}
         */
        getRecmdCWords: function() {
            return this._recmdCWord.getData();
        },
        /**
         * 获取选择的重点词ID数组包括推荐添加和推荐取消的重点词
         * @return {Object}
         *         {
         *              addWinfoids: [Array], 添加关注重点词winfoid数组，若没有为空数组
         *              delWinfoids: [Array]  取消关注重点词winfoid数组，若没有为空数组
         *         }
         */
        getSelCorewords: function() {
            var me = this;
            var getSelWinfoids = function(table) {
                var selWinfoids = [];
                var selRowIdxArr = (table && table.selectedIndex) || [];
                var ds = table && table.datasource;
                for (var i = selRowIdxArr.length; i --;) {
                    selWinfoids[i] = +ds[selRowIdxArr[i]]['winfoid'];
                }
                return selWinfoids;
            };

            return {
                addWinfoids: getSelWinfoids(me.getUI('recmdAddCorewordTable')),
                delWinfoids: getSelWinfoids(me.getUI('recmdDelCorewordTable'))
            };
        },
        /**
         * 绑定事件处理器
         * @private
         */
        bindHandler: function() {
            var me = this;
            var bind = nirvana.util.bind;

            var addWordTable = me.getUI('recmdAddCorewordTable');
            var delWordTable = me.getUI('recmdDelCorewordTable');
            // 为推荐添加关注表格绑定行选择事件处理器
            addWordTable.onselect = bind('rowSelHandler', me, true, delWordTable);
            // 为推荐取消关注表格绑定行选择事件处理器
            if (delWordTable) {
                delWordTable.onselect = bind('rowSelHandler', me, false, addWordTable);
            }

            // 订阅重点词更新成功和失败的事件
            var coreword = me._coreword;
            me.updateSuccess = bind('updateSuccess', me);
            coreword.subscribe(Coreword.UPDATE_SUCCESS, me.updateSuccess);
            me.updateFail = bind('updateFail', me);
            coreword.subscribe(Coreword.UPDATE_FAIL, me.updateFail);
        },
        /**
         * 表格行选择事件处理器
         * @param {boolean} isAddWord 是否是添加重点词表格
         * @param {ui.Table} anotherTable 另一个表格控件，可能不存在，如果不存在
         *                                推荐取消关注的重点词
         * @param {Array} selRowIdxs 触发表格行选择事件所在表格选择的行索引数组
         */
        rowSelHandler: function(isAddWord, anotherTable, selRowIdxs) {
            var me = this;
            var addNum;
            var delNum;

            if (isAddWord) {
                addNum = selRowIdxs.length;
                delNum = anotherTable ? anotherTable.selectedIndex.length : '';
            }
            else {
                delNum = selRowIdxs.length;
                addNum = anotherTable.selectedIndex.length;
            }

            // 设置添加关注/替换更新按钮状态
            me.disableOkBtn(!(addNum || delNum));
            // 更新选择的添加和删除的重点词数量信息
            me.showSelInfo(addNum, delNum);
        },
        /**
         * 重置取消按钮的样式为超链接的形式
         * @private
         */
        resetCancelBtnStyle: function() {
            var cancelBtnElem = this._dlg.cancelBtn.main;
            baidu.addClass(cancelBtnElem, 'skin_href_btn');
        },
        /**
         * 禁用添加关注按钮
         * @param {boolean} disabled 是否禁用
         * @private
         */
        disableOkBtn: function(disabled) {
            this._dlg.okBtn.disable(disabled);
        },
        /**
         * 获取要初始化的控件的配置选项
         * @override
         */
        getWidgetConfig: function() {
            var recmWord = this._recmdCWord;
            var RecmdCoreword = nirvana.aopkg.RecmdCoreword;
            var config = {
                recmdAddCorewordTable: this.getTableConfig(
                    recmWord.getRecmAddCorewrds(),
                    RecmdCoreword.RECM_ADD_REASON_TYPES,
                    RecmdCoreword.RECM_ADD_RESON_VALUE_MAP
                )
            };

            // 如果有推荐取消关注重点词就渲染推荐取消重点词表格
            if (recmWord.getRecmDelNum()) {
                config.recmdDelCorewordTable = this.getTableConfig(
                    recmWord.getRecmDelCorewords(),
                    RecmdCoreword.RECM_DEL_REASON_TYPES,
                    RecmdCoreword.RECM_DEL_RESON_VALUE_MAP
                );
            }

            return config;
        },
        /**
         * 获取表格的配置
         * @private
         * @return {Object}
         */
        getTableConfig: function(ds, reasonType, reasonValueMap) {
            var tableUtil = nirvana.tableUtil;
            var option = { width: 85, length: 20 };
            var fieldConfig = [
                tableUtil.getWordConf(option),
                tableUtil.getPlanConf(option),
                tableUtil.getUnitConf(option),
                {
                    title: '建议理由',
                    content: nirvana.corewordUtil.getRecmReasonRenderer(
                        reasonType,
                        reasonValueMap
                    ),
                    width: 120
                }
            ];

            return {
                select: 'multi',
                isSelectAll: true,
                fields: fieldConfig,
                datasource: ds,
                noDataHtml: FILL_HTML.NO_DATA
            };
        },
        /**
         * 销毁推荐对话框实例
         * @override
         */
        dispose: function() {
            var me = this;
            me._recmdCWord = null;

            var coreword = me._coreword;
            // 移除订阅的重点词事件
            coreword.unsubscribe(Coreword.UPDATE_SUCCESS, me.updateSuccess);
            coreword.unsubscribe(Coreword.UPDATE_FAIL, me.updateFail);
            me._coreword = null;

            ui.CustomDialog.prototype.dispose.call(this);
        }
    };

    // 继承自定制对话框
    baidu.inherits(RecmdCorewordDlg, ui.CustomDialog);

    return RecmdCorewordDlg;
}($$, baidu, nirvana);