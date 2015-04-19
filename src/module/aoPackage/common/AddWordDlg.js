/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/common/AddWordDlg.js
 * desc: 新提词添加对话框，基于business/addword.js重写，不使用子Action方式
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/02/20 $
 */
/**
 * 新提词添加对话框，这个功能下掉了，暂时遗弃掉
 * @class AddWordDlg
 * @namespace nirvana.aopkg
 * @extends nirvana.aopkg.PlanUnitEditDlg
 */
nirvana.aopkg.AddWordDlg = function($, ui, T, nirvana, fbs) {
    var bind = nirvana.util.bind;

    /**
     * 添词对话框的构造函数
     * @constructor
     */
    function AddWordDlg() {
    }

    AddWordDlg.prototype = {
        /**
         * 显示添加推荐关键词浮出层
         * @param {Object} initData 浮出层初始化数据
         * @param {string} initData.showword 要修改的关键词的字面值
         * @param {number} initData.currplanid 关键词当前所在的计划id
         * @param {number} initData.currunitid 关键词当前所在的单元id
         * @param {string} initData.currplanname 关键词当前所在的计划名称
         * @param {string} initData.currunitname 关键词当前所在的单元名称
         * @param {number} initData.dailypv 关键词日均搜索量
         * @param {number} initData.kwc 关键词竞争激烈程度
         * @param {number} initData.recmbid 关键词推荐出价
         * @param {number} initData.recmwmatch 关键词推荐匹配
         * @override
         */
        show: function(initData) {
            var me = this;
            var dlgOption = {
                id: 'addWordDlg',
                title: '添加关键词',
                width: 660,
                maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel()
            };

            var tplData = T.object.clone(initData);
            tplData.showword = T.encodeHTML(initData.showword);
            tplData.dailypv = nirvana.util.translatePv(initData.dailypv);
            tplData.kwc = lib.field.getBarRenderer('kwc')(initData);

            // 初始化对话框 'aopkgAddWordForm'为模板名
            me.init(dlgOption, 'aopkgAddWordForm', tplData, initData);

            // 设置初始化要选择的计划和单元
            me.setAttr('selplanid', initData.currplanid);
            me.setAttr('selunitid', initData.currunitid);

            // 创建提示元素
            me.useTip();

            // 初始化默认选择修改的计划/单元的类型：新建还是选择已有
            var selNew = ! initData.currplanid || ! initData.currunitid;
            var editType = selNew ? me.EDIT_TYPE.CREATE_NEW : me.EDIT_TYPE.SEL_EXIST;

            // 初始化计划单元编辑表单
            me.initPlanUnitEditForm(editType);

            // 初始化控件事件处理器
            me.initEventHandler();

            me.switchEditType(editType);
        },

        /**
         * 添词成功的事件处理器
         * @param {Object} response 响应的数据
         * @private
         */
        addWordSuccess: function(response) {
            var me = this;
            var addWordInfo = me.getAddWordInfo();
            T.extend(addWordInfo, me.getAttr());

            /**
             * 添词成功的事件回调
             * @event onSuccess
             * @param {Object} data 所添加词的信息
             */
            nirvana.util.executeCallback(
                'onSuccess', [addWordInfo], me
            );

            me.close();
        },
        /**
         * 添词失败的事件处理
         * @param {number} errorCode 失败返回的错误码
         * @private
         */
        addWordFail: function(errorCode) {
            var msg = nirvana.bizUtil.getMaterialModErrorInfo(errorCode);
            this.showTip(msg);
        },
        /**
         * 获取要添加的关键词的信息
         * @return {Object}
         */
        getAddWordInfo: function() {
            var me = this;

            var isNew = me.getAttr('editType') === me.EDIT_TYPE.CREATE_NEW;
            var planInfo = me.getPlanUnitInfo(isNew, true);
            var unitInfo = me.getPlanUnitInfo(isNew, false);

            // 验证计划、单元输入的合法性
            if (!me.checkPlanUnitInfo(planInfo, true, isNew)
                || !me.checkPlanUnitInfo(unitInfo, false, isNew)) {
                return false;
            }

            var widgetMap = me._widgetMap;
            var bid = widgetMap.AddwordBid.getValue();
            var wmatch = widgetMap.AddwordWmatch.getValue();

            var modifiedItem = {
                idx: 0,
                planid: planInfo.id,
                unitid: unitInfo.id,
                planname: planInfo.name,
                unitname: unitInfo.name,
                showword: me.getAttr('showword'),
                wordid: me.getAttr('wordid'),
                bid: bid,
                wmatch: wmatch
            };

            return modifiedItem;
        },
        /**
         * @override
         */
        onOk: function() {
            var me = this;
            var modifiedItem = me.getAddWordInfo();

            if (!modifiedItem) {
                return false;
            }

            me.clearWarn();

            var failHandler = nirvana.bizUtil.getModMaterialFailHandler(bind('addWordFail', me));
            fbs.nikon.addWords({
                sourceType: 'NIKON_WEB_BASE',
                extra: {
                    opttypeid: me.getAttr('opttypeid') || ''
                },
                items: [modifiedItem],
                onSuccess: bind('addWordSuccess', me),
                onFail: failHandler
            });

            return false;
        },
        /**
         * 清除警告信息
         */
        clearWarn: function() {
            this.showTip('');
        },
        /**
         * @overrride
         */
        getWidgetConfig: function () {
            var conf = nirvana.aopkg.PlanUnitEditDlg.prototype.getWidgetConfig.call(this);

            T.extend(conf, {
                AddwordBid: {
                    value: this.getAttr('recmbid'),
                    width: 142
                },
                AddwordWmatch: {
                    datasource: nirvana.config.WMATCH.DATASOURCE,
                    value: this.getAttr('recmwmatch'),
                    width: 150
                }
            });

            return conf;
        }
    };

    T.inherits(AddWordDlg, nirvana.aopkg.PlanUnitEditDlg);
    return AddWordDlg;
}($$, ui, baidu, nirvana, fbs);