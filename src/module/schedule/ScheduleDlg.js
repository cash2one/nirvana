/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: schedule/ScheduleDlg.js
 * desc: 推广时段的编辑器
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/19 $
 */
/**
 * 修改时段的对话框，默认不包括推荐时段信息
 *
 * @class ScheduleDlg
 * @namespace nirvana
 * @extends ui.CustomDialog
 */
nirvana.ScheduleDlg = function($, nirvana, ui) {
    /**
     * 时段对话框的构造函数
     * @constructor
     */
    function ScheduleDlg() {
    }

    var bindContext = nirvana.util.bind;

    /**
     * 初始化时段编辑组件的值
     * @param {Array} value 时段编辑组件的值
     * @param {Array} cyc 未投放的时段或推荐的时段，一个二维数组
     * @param {Boolean} isSuggest 是否是推荐的时段
     */
    function initScheduleValue(value, cyc, isSuggest) {
        if (!cyc) {
            return;
        }

        var interval,
            week,
            flag = isSuggest ? 2 : 0;

        for (var i = 0, len = cyc.length; i < len; i ++) {
            interval = cyc[i];
            for (var j = interval[0]; j < interval[1]; j ++) {
                week = parseInt(j / 100)- 1;
                value[week][j % 100] = flag;
            }
        }
    }

    ScheduleDlg.prototype = {
        /**
         * 默认对话框配置选项
         * @property DLG_OPTION
         * @type {Object}
         * @override
         */
        DLG_OPTION: {
            id : 'planScheduleDlg',
            title : '修改推广时段',
            content : '',
            width : 660,
            height : 320
        },
        /**
         * 初始化时段信息的默认配置
         * @property SCHEDULE_OPTION
         * @type {Object}
         * @override
         */
        SCHEDULE_OPTION: {
            tplName: 'modifySchedule'
        },
        /**
         * 设置时段编辑组件的值
         * @private
         * @param {Array} plancyc 当前未投放的时段，一个二维数组，每个数组元素为一个大小为2的数组，
         *                其值包括建议投放的时段的开始时段和结束时段，具体含义可参见Schedule控件。
         *                e.g., [[100,103],[104,124],[500,524]]
         *                注意：是未投放的时段
         * @param {Array|Undefined} suggestcyc 建议的时段，数据结构同plancyc，可选
         */
        setValue: function(plancyc, suggestcyc) {
            var editor = this.getEditor();

            // 初始化时段值
            var value = [];
            for (var i = 0; i < 7; i ++) {
                value[i] = [];
                for (var j = 0; j < 24; j ++) {
                    value[i][j] = 1;//投放时段
                }
            }

            // 初始化当前投放的时段
            initScheduleValue(value, plancyc, false);
            // 初始化推荐的时段
            initScheduleValue(value, suggestcyc, true);

            // 更新时段
            editor.setValue(value);

            // 缓存当前设置的未投放的时段值，包括推荐时段，如果有的话
            this._offTimeSchedule = editor.getParamObj();
            // 缓存推荐时段
            this._recmdSchedule = suggestcyc;
        },
        /**
         * 获取时段的修改信息
         * @method getScheduleModifyInfo
         * @return {Object} 提交时段修改相应的数据信息，其结构定义如下：
         * {
         *     planIds:    [Array], 要提交的时段所属的计划ID数组
         *     oldValue:   [Array], 修改前的搁置时段的值
         *     newValue:   [Array], 修改后搁置时段的值
         *     recmdValue: [Array], 推荐的搁置时段的值
         * }
         */
        getScheduleModifyInfo: function() {
            return {
                planIds: this._planIdArr,
                oldValue: this._offTimeSchedule,
                newValue: this.getEditor().getParamObj(),
                recmdValue: this._recmdSchedule
            };
        },
        /**
         * 提交选择的推广时段的默认事件处理
         * @event onSubmit
         * @param {Object} modifyInfo 修改时段的信息,具体数据结构定义见
         *                 {@link getScheduleModifyInfo}
         */
        onSubmit: function(modifyInfo) {
            var me = this,
                planIdArr = modifyInfo.planIds,
                newValue = modifyInfo.newValue,
                modifyData = {};

            // 发送行为监控
            nirvana.ScheduleMonitor.saveSchedule(modifyInfo,
                me._attrs.opttypeid, me._attrs.isAo);

            // 初始化这次要变更的数据
            for (var i = 0, l = planIdArr.length; i < l; i++) {
                modifyData[planIdArr[i]] = {
                    "plancyc": newValue || []
                };
            }

            // 发送时段修改的请求
            fbs.plan.modPlancyc({
                planid: planIdArr,
                plancyc: newValue,
                onSuccess: function(data) {
                    me.submitSucessHandler(data, modifyData);
                },
                onFail: bindContext(me.submitFailHandler, me)
            });
        },
        /**
         * 保存时段修改操作成功的回调
         * @method submitSucessHandler
         * @param {Object} data 提交时段成功服务端返回的数据对象
         * @param {Object} modifyData 修改时段的信息,具体数据结构定义见
         *                 {@link getScheduleModifyInfo}
         * @protected
         */
        submitSucessHandler : function (data, modifyData) {
            // 更新本地缓存的物料数据
            fbs.material.ModCache("planinfo", "planid", modifyData);

            var me = this;
            /**
             * 修改时段成功触发的事件
             * @event onSuccess
             * @param {Object} data 提交时段成功服务端返回的数据对象
             * @return {boolean} 如果不返回false,则默认执行回调后自动关闭对话框
             */
            var result = nirvana.util.executeCallback(me.onSuccess, [data], me);
            // 关闭对话框
            (result !== false) && me.close();
        },
        /**
         * 保存时段失败默认处理器
         * @private
         */
        submitFailHandler : function () {
            ajaxFailDialog();
        },
        /**
         * 获取时段编辑组件
         * @private
         * @return {ui.Schedule}
         */
        getEditor: function() {
            return ui.util.get(this._editorId);
        },
        /**
         * 点击确定提交时段修改的默认事件处理器
         * @event onOk
         */
        onOk: function() {
            var me = this;

            var modifyData = me.getScheduleModifyInfo();
            // 提交修改的时段触发的事件
            nirvana.util.executeCallback(me.onSubmit, [modifyData], me);
            // 暂时先不关闭对话框，等真正提交成功再关闭
            return false;
        },
        /**
         * 请求修改时段的相关数据
         * @protected
         */
        requestData: function(scheduleValue) {
            // 如果存在初始值，就不请求了，直接更新时段
            if (scheduleValue) {
                // 更新时段编辑组件的值
                this.setValue(scheduleValue);
            }
            else if (this._planIdArr) {// 请求计划时段必须设置计划ID
                this.doRequest();
            }
        },
        /**
         * 执行计划搁置时段的信息
         * @method doRequest
         * @protected
         */
        doRequest: function() {
            this._requester.request(
                this.getRequestParam(),
                this.responseSuccessHandler,
                this.responseFailHandler,
                this
            );
        },
        /**
         * 获取时段请求参数信息
         * @protected
         * @return {Object}
         */
        getRequestParam: function() {
            return this._attrs;
        },
        /**
         * 请求数据成功的处理器
         * @protected
         */
        responseSuccessHandler: function(result) {
            var data = this._requester.response(result);

            /**
             * 获取时段数据成功触发的事件
             * @event onLoad
             * @param {Object} data 初始化时段信息的数据对象
             */
            nirvana.util.executeCallback(this.onLoad, [data], this);

            // 更新时段编辑组件的值
            this.setValue(data.plancyc, data.suggestcyc);
            // 更新其它widget信息
            this.updateWidgets(data);
        },
        /**
         * 更新其它widget信息
         * @param {Object} data 数据对象
         */
        updateWidgets: new Function(),
        /**
         * 请求数据失败的处理器
         */
        responseFailHandler: function() {
            ajaxFailDialog();
            this._dlg.okBtn.disable(true);
        },
        /**
         * 显示修改时段的对话框
         * @method show
         * @param {Object} options 选项定义如下：
         * {
         *    planIds:       [Array],   [OPTIONAL] 要修改的时段所属的计划ID数组
         *    dlgOption:     [Object],  [OPTIONAL] 对话框的配置属性，
         *                              参见{@link ui.Dialog}的属性配置，可选
         *                              NOTICE: 不要尝试在选项里绑定事件的处理
         *    tplName:       [String],  [OPTIONAL] 默认'modifySchedule'
         *    tplData:       [Object],  [OPTIONAL] 模板的数据
         *    scheduleValue: [Array],   [OPTIONAL] 用于初始化时段编辑器的值，
         *                                         如果不想使用默认提供的时段请求接口，
         *                                         该属性值不能为空。
         *    hasRecmd:      [Boolean], [OPTIONAL] 是否显示推荐时段信息，默认false
         *    requestFunc:   [Function|string], [OPTIONAL] 请求时段信息的数据接口，默认如果
         *    包含推荐时段信息，使用{@link nirvana.ScheduleHelper.requester.nikon}
         *    否则，使用{@link nirvana.ScheduleHelper.requester.manage};
         *    如果为字符串，requester为nirvana.ScheduleHelper.requester[requestFunc]
         * }
         * @param {Object} attrs 其它附加的属性信息
         * @param {boolean} attrs.isAo 是否是推广管理手动版的账户优化的时段修改，默认false
         * @param {string|number} attrs.opttypeid 如果是优化包的时段修改，需要该参数，
         *                                        若不是，则无需传该参数
         */
        show: function(options, attrs) {
            options = this.getOption(options, attrs);

            // 执行对话框初始化：对话框创建和内容初始化
            this.init(options.dlgOption, options.tplName, options.tplData);
            // 请求推荐时段数据
            this.requestData(options.scheduleValue);
        },
        /**
         * 获取用于初始化时段对话框的选项
         * @private
         */
        getOption: function(options, attrs) {
            var ext = nirvana.util.extend;

            options.dlgOption = ext(options.dlgOption, this.DLG_OPTION);
            options = ext(options, this.SCHEDULE_OPTION);

            this._planIdArr = options.planIds;
            this._attrs = {
                planid: this._planIdArr
            };
            this._hasRecmd = this._hasRecmd || options.hasRecmd || false;

            var helper = nirvana.ScheduleHelper.requester;

            this._requester = options.requestFunc
                || (this._hasRecmd ? helper.nikon : helper.manage);
            if (typeof this._requester == 'string') {
                this._requester = helper[this._requester];
            }

            baidu.object.extend(this._attrs, attrs || {});

            return options;
        },
        /**
         * 获取要初始化的控件的配置选项
         * @override
         */
        getWidgetConfig: function() {
            var config = {};

            this.initEditorConfig(config);
            return config;
        },
        /**
         * 初始化时段编辑组件的配置选项
         * @param {Object} config 配置组件的config对象，
         *                 key为组件的id，value为对应的组件的配置信息
         * @protected
         */
        initEditorConfig: function(config) {
            var me = this;

            me._editorId = 'scheduleEditor';
            config[me._editorId] = {
                showRecommed: me._hasRecmd
            };
        },
        /**
         * 销毁实例,时段优化对话框关闭后，会自动调用该方法
         * @method dispose
         */
        dispose: function() {
            this._planIdArr && (this._planIdArr.length = 0);
            this._attrs = null;
            ui.CustomDialog.prototype.dispose.call(this);
        }
    };

    // 继承自定制对话框
    baidu.inherits(ScheduleDlg, ui.CustomDialog);

    return ScheduleDlg;
}($$, nirvana, ui);