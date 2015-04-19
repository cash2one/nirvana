/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/common/PlanUnitEditDlg.js
 * desc: 编辑关键词的所在的计划和单元的对话框, 基于business/inlineEditTarget.js重写，
 *       不使用子Action方式
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/02/20 $
 */
/**
 * 编辑关键词的所在的计划和单元的对话框
 * @class PlanUnitEditDlg
 * @namespace nirvana.aopkg
 * @extends ui.CustomDialog
 */
nirvana.aopkg.PlanUnitEditDlg = function($, ui, T, nirvana) {
    var bind = nirvana.util.bind;
    var failHandler = nirvana.util.getReqFailHandler;

    var NO_PLAN_UNIT_MSG = {
        plan: '当前没有推广计划，请使用选择新增方式。',
        unit: '当前计划下没有推广单元，请您选择其他计划层级。'
    };
    // 计划和单元编辑类型常量定义：已有或者新建
    var EDIT_TYPE = {
        CREATE_NEW: 'new',
        SEL_EXIST: 'old'
    };

    /**
     * 计划/单元编辑对话框
     * @constructor
     */
    function PlanUnitEditDlg() {
    }

    PlanUnitEditDlg.prototype = {
        /**
         * 计划和单元编辑类型常量定义：已有或者新建
         * @const
         * @type {Object}
         */
        EDIT_TYPE: EDIT_TYPE,
        /**
         * 显示关键词计划、单元编辑对话框，如果是批量修改以下四个参数可以忽略
         * @param {string} showword 要修改的关键词的字面值
         * @param {number} currplanid 关键词当前所在的计划id
         * @param {number} currunitid 关键词当前所在的单元id
         * @param {string} currplanname 关键词当前所在的计划名称
         * @param {string} currunitname 关键词当前所在的单元名称
         * @param {boolean} selNew 用于批量修改时候，默认选择是新建计划/单元，还是选择已经
         *                         存在的计划和单元，未设置默认选择已经存在的计划/单元
         * @override
         */
        show: function(initData) {
            var me = this;

            var dlgOption = {
                id: 'editPlanUnitDlg',
                title: '修改目标计划和单元',
                width: 600,
                maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel()
            };

            initData = initData || {};
            var showword = initData.showword;
            // 如果没有传入关键词，默认是批量修改计划和单元
            var isBatchMod = !showword;
            me._isBatchMod = isBatchMod;

            // 初始化对话框，'planUnitEditDlg'为模板名
            me.init(dlgOption, 'planUnitEditDlg',
                {
                    wordStyle: isBatchMod ? 'hide' : '',
                    showword: showword && T.encodeHTML(showword)
                },
                initData
            );

            // 设置初始化要选择的计划和单元
            me.setAttr('selplanid', initData.currplanid);
            me.setAttr('selunitid', initData.currunitid);

            // 创建提示元素
            me.useTip();

            // 初始化默认选择修改的计划/单元的类型：新建还是选择已有
            var selNew = isBatchMod
                ? initData.selNew
                : (! initData.currplanid || ! initData.currunitid);
            var editType = selNew ? EDIT_TYPE.CREATE_NEW : EDIT_TYPE.SEL_EXIST;

            // 初始化计划单元编辑表单
            me.initPlanUnitEditForm(editType);

            // 初始化控件事件处理器
            me.initEventHandler();

            me.switchEditType(editType);
        },
        /**
         * 初始化事件处理器
         * @private
         */
        initEventHandler: function() {
            var me = this;

            var oldRadio = me.getRadioUI(EDIT_TYPE.SEL_EXIST);
            var newRadio = me.getRadioUI(EDIT_TYPE.CREATE_NEW);

            oldRadio.onclick = bind('switchEditType', me, EDIT_TYPE.SEL_EXIST);
            newRadio.onclick = bind('switchEditType', me, EDIT_TYPE.CREATE_NEW);

            var planSelWidget = me.getSelectorUI(true);
            var unitSelWidget = me.getSelectorUI(false);

            planSelWidget.onselect = function(planid) {
                if(planid !== me.getAttr('selplanid')) {
                    me.clearTip();
                    me.setAttr('selplanid', planid);
                    me.setAttr('selunitid', null); // 清空选择的单元ID
                    me.requestUnitList(planid);
                }
            };
            unitSelWidget.onselect = function(unitid) {
                if(unitid !== me.getAttr('selunitid')) {
                    me.clearTip();
                    me.setAttr('selunitid', unitid);
                }
            };
            // 注册单元下拉列表的点击事件处理
            unitSelWidget.onmainclick = function() {
                if (this.options.length === 0) {
                    me.showTip('请先选择推广计划，再选择对应的推广单元。');
                }
            };
        },
        /**
         * 切换计划单元编辑类型，是用现有还是新增
         *
         * @param {string} editType 编辑类型，见常量定义{@link EDIT_TYPE}
         */
        switchEditType: function(editType) {
            var me = this;

            var typeRadio = me.getRadioUI(editType);
            typeRadio.setChecked(true);

            var oldType = me.getAttr('editType');

            if (oldType) {
                T.dom.addClass(me.getInlineEditPanel(oldType), 'hide');
            }
            T.dom.removeClass(me.getInlineEditPanel(editType), 'hide');

            me.setAttr('editType', editType);
            // 清除输入错误信息
            me.clearTip();

            if (editType === EDIT_TYPE.SEL_EXIST) {
                // 获取计划层级的数据
                me.requestPlanList();
            }
        },
        /**
         * 获取编辑表单面板
         * @param {string} editType 编辑类型，见常量定义{@link EDIT_TYPE}
         * @return {HTMLElement}
         */
        getInlineEditPanel: function(editType) {
            return this.getElement(
                '.planunit-edit-panel[edittype=' + editType + ']'
            )[0];
        },
        /**
         * 获取单选按钮组件
         * @param {string} editType 编辑类型，见常量定义{@link EDIT_TYPE}
         * @return {ui.Radio}
         */
        getRadioUI: function(editType) {
            return this._widgetMap['planunit-edit-type-' + editType];
        },
        /**
         * 初始化计划、单元表单编辑区域
         *
         * @param {string} editType 编辑类型，见常量定义{@link EDIT_TYPE}
         * @private
         */
        initPlanUnitEditForm: function(editType) {
            var me = this;
            var createNewPanel = me.getInlineEditPanel(EDIT_TYPE.CREATE_NEW);

            createNewPanel.innerHTML = ''
                + '<input type="text" id="wordtarget-plan-new" />'
                + '<input type="text" id="wordtarget-unit-new" />';

            var planNewUi = new fc.ui.Input(me.getElement('#wordtarget-plan-new')[0], { width: 200 });
            var unitNewUi = new fc.ui.Input(me.getElement('#wordtarget-unit-new')[0]);

            planNewUi.placeholder('输入计划名称');
            unitNewUi.placeholder('输入单元名称');

            if (editType === EDIT_TYPE.CREATE_NEW) {
                planNewUi.value(me.getAttr('currplanname'));
                unitNewUi.value(me.getAttr('currunitname'));
            }

            T.extend(me._widgetMap, {
                'wordtarget-plan-new': planNewUi,
                'wordtarget-unit-new': unitNewUi
            });
        },
        getSelectorUI: function(isPlanSelector) {
            var id = isPlanSelector ? 'wordtarget-plan-old' : 'wordtarget-unit-old';
            return this._widgetMap[id];
        },
        getInputUI: function(isPlanInput) {
            var id = isPlanInput ? 'wordtarget-plan-new' : 'wordtarget-unit-new';
            return this._widgetMap[id];
        },
        /**
         * 请求计划成功回调
         * @private
         */
        requestPlanSuccess: function(response) {
            var me = this;

            var result = me._processPlanUnitData(response, true);

            var selPlanId = me.getAttr('selplanid');
            // 只有返回的计划列表不为空，且当前有选择特定的计划，才发送单元列表的请求
            if (result && result.length && + selPlanId > 0) {
                me.requestUnitList(selPlanId);
            }
        },
        /**
         * 预处理响应的计划/单元数据
         * @private
         */
        _processPlanUnitData: function(response, isPlan) {
            var me = this;
            var data = response.data || {};
            var list = data.listData;
            var typeName = isPlan ? '计划' : '单元';

            if (! list) {
                ajaxFailDialog('获取' + typeName + '列表失败');
                return false;
            }

            var dataList = [];
            var idAttr = isPlan ? 'planid' : 'unitid';
            var nameAttr = isPlan ? 'planname' : 'unitname';

            for (var i = list.length; i --;) {
                dataList.push({
                    value: list[i][idAttr],
                    text: T.encodeHTML(list[i][nameAttr])
                });
            }

            me.updatePlanUnitSelUI(isPlan, dataList);
            return dataList;
        },
        /**
         * 请求单元成功的回调
         * @private
         */
        requestUnitSuccess: function(response) {
            this._processPlanUnitData(response, false);
        },
        /**
         * 获取计划列表数据并处理
         * @private
         */
        requestPlanList: function() {
            fbs.plan.getNameList({
                onSuccess: bind('requestPlanSuccess', this),
                onFail: failHandler('获取计划列表失败')
            });
        },

        /**
         * 获取摸个计划下的单元列表数据并处理
         * @private
         */
        requestUnitList: function(planid) {
            fbs.unit.getNameList({
                condition: {
                    planid: [planid]
                },
                onSuccess: bind('requestUnitSuccess', this),
                onFail: failHandler('获取单元列表失败')
            });
        },
        /**
         * 更新计划/单元下拉列表
         * @param {boolean} isPlan 是否是计划下拉列表
         * @param {Array} listData 下拉列表的数据
         */
        updatePlanUnitSelUI: function(isPlan, listData) {
            var me = this;
            var selUI = me.getSelectorUI(isPlan);

            if (listData.length === 0) {
                me.showTip(NO_PLAN_UNIT_MSG[isPlan ? 'plan' : 'unit']);
                selUI.disable(true);
                if (isPlan) {
                    // 如果计划为空，同样单元也肯定为空，将单元下拉列表也禁用掉
                    me.getSelectorUI(false).disable(true);
                }
            }
            else {
                selUI.disable(false);
            }

            selUI.fill(listData);

            var attrName = isPlan ? 'selplanid' : 'selunitid';
            var initValue = this.getAttr(attrName);
            selUI.setValue(initValue);
            // 重新设置一下属性值，由于初始化的值可能并不存在
            me.setAttr(attrName, selUI.value);
        },
        /**
         * 清除错误信息
         */
        clearTip: function() {
            this.showTip('');
        },
        /**
         * 获取新建的计划/单元的信息
         * @param {fc.ui.Input} inputWidget 输入组件
         * @return {Object}
         * @private
         */
        _getNewPlanUnitInfo: function(inputWidget) {
            return {
                id: 0, // 新建的计划/单元的id为0
                name: T.decodeHTML(T.string.trim(inputWidget.value()))
            };
        },
        /**
         * 获取所选择的已经存在的计划/单元层级信息
         * @param {ui.Select} selWidget 下拉列表组件
         * @return {Object}
         * @private
         */
        _getOldPlanUnitInfo: function(selWidget) {
            return {
                id: selWidget.getValue(),
                name: T.decodeHTML(selWidget.getText())
            };
        },
        /**
         * 获取计划/单元编辑信息
         * @param {boolean} isNew 是否是新建
         * @param {boolean} isPlan 是否是计划信息
         * @return {Object} 计划/单元信息，结构如下：
         *         {
         *              id:   [string], // 计划/单元的ID
         *              name: [string]  // 计划/单元的名称
         *         }
         */
        getPlanUnitInfo: function(isNew, isPlan) {
            var me = this;
            return isNew
                ? me._getNewPlanUnitInfo(me.getInputUI(isPlan), isPlan)
                : me._getOldPlanUnitInfo(me.getSelectorUI(isPlan));
        },
        /**
         * 检查输入的计划/单元的合法性，若不合法显示相应的错误消息
         * @param {Object} info 计划/单元信息
         * @param {string} info.id 计划/单元的ID
         * @param {string} info.name 计划/单元的名称
         * @param {boolean} isPlan 是否是计划
         * @param {boolean} isNew 是否是新建的计划/单元
         */
        checkPlanUnitInfo: function(info, isPlan, isNew) {
            var result = isNew
                ? nirvana.validate.planUnitName(info.name, isPlan)
                : nirvana.validate.selPlanUnitValue(info.id, isPlan);

            result && this.showTip(result);
            return !result;
        },
        /**
         * 注意：如果不是批量修改，如果保存的时候，当前值跟初始化值一样，
         * 则不会触发onEditPlanUnitSuccess回调！！！
         * @override
         */
        onOk: function() {
            var me = this;
            var isNew = me.getAttr('editType') === EDIT_TYPE.CREATE_NEW;
            var planInfo = me.getPlanUnitInfo(isNew, true);
            var unitInfo = me.getPlanUnitInfo(isNew, false);

            // 验证计划、单元输入的合法性
            if (!me.checkPlanUnitInfo(planInfo, true, isNew)
                || !me.checkPlanUnitInfo(unitInfo, false, isNew)) {
                return false;
            }

            // 有修改，才执行回调
            if (me._isBatchMod || me.getAttr('currplanname') !== planInfo.name
                || me.getAttr('currunitname') !== unitInfo.name) {
                /**
                 * 修改关键词目标计划和单元成功的事件回调
                 * @event onEditPlanUnitSuccess
                 * @param {Object} planInfo 修改的计划信息
                 * @param {Object} unitInfo 修改的单元信息
                 */
                nirvana.util.executeCallback(
                    'onEditPlanUnitSuccess', [planInfo, unitInfo], me
                );
            }

            return true;
        },
        /**
         * 获取要初始化的控件的配置选项
         * @override
         */
        getWidgetConfig: function() {
            return {
                'wordtarget-plan-old': {
                    datasource: [],
                    width: 150,
                    emptyLang: '请选择推广计划...'
                },
                'wordtarget-unit-old': {
                    datasource: [],
                    width: 150,
                    emptyLang: '请选择推广单元...'
                }
            };
        }
    };

    T.inherits(PlanUnitEditDlg, ui.CustomDialog);
    return PlanUnitEditDlg;
}($$, ui, baidu, nirvana);