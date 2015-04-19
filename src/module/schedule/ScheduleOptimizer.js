/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: schedule/ScheduleOptimizer.js
 * desc: 推广时段的优化操作
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/10/22 $
 */
/**
 * 推广时段的优化操作类,用于优化包<br/>
 *
 * @class ScheduleOptimizer
 * @namespace nirvana
 * @extends nirvana.ScheduleDlg
 */
nirvana.ScheduleOptimizer = function ($, nirvana, ui, T) {
    /**
     * 构造函数定义
     *
     * @constructor
     */
    function ScheduleOptimizer() {
        // 強制使用推荐时段
        this._hasRecmd = true;
    }

    var bindContext = nirvana.util.bind;
    var helper = nirvana.ScheduleHelper;

    ScheduleOptimizer.prototype = {
        /**
         * 默认对话框配置选项
         * @property DLG_OPTION
         * @type {Object}
         */
        DLG_OPTION: {
            id:'ScheduleOptimizeDlg',
            title:'修改推广时段',
            content:'',
            width:980,
            height:400
        },
        /**
         * 初始化时段信息的默认配置
         * @property SCHEDULE_OPTION
         * @type {Object}
         */
        SCHEDULE_OPTION: {
            tplName:'scheduleOptimizer'
        },
        /**
         * 初始化对话框内容
         * @override
         */
        init: function(dlgOption, tplName, tplData) {
            var me = this;

            nirvana.ScheduleDlg.prototype.init.call(me, dlgOption, tplName, tplData);

            // 创建推荐时段分析组件
            me._recmdWidget = me.createRecmdWidget();

            var editor = me.getEditor();
            // 重写时段格子mouseover/mouseout事件处理
            editor.selTimeOverOut = bindContext(me.scheduleOverOrOutHandler, me);
            // 绑定时段选中或取消选中的事件监听
            editor.onToggleTime = bindContext(
                me._recmdWidget.toggleScheduleTimeSelect,
                me._recmdWidget
            );
        },
        /**
         * 推广时段格子MouseOver/out事件处理器
         */
        scheduleOverOrOutHandler: function(dom,isOver) {
            // 执行原始的方法
            ui.Schedule.prototype.selTimeOverOut.call(
                this.getEditor(), dom, isOver
            );

            var day = parseInt(dom.getAttribute('day'), 10),
                time = parseInt(dom.getAttribute('time'), 10);

            // 触发分析组件对应的时段的over/out事件
            this._recmdWidget.fireScheduleTimeOver(day, time, isOver);
        },
        /**
         * 获取要初始化的控件的配置选项
         * @override
         */
        getWidgetConfig: function () {
            var config = {};

            this.initEditorConfig(config);
            this.initTableConfig(config);
            return config;
        },
        /**
         * 初始化表格控件的配置
         * @param {Object} config 配置组件的config对象，
         *                 key为组件的id，value为对应的组件的配置信息
         * @protected
         */
        initTableConfig: function(config) {
            var fields = [
                {
                    content: function (item) {
                        return helper.getDisplayScheduleTime(item.suggestcyc);
                    },
                    field: 'suggestcyc',
                    title: '建议时段',
                    sortable: true,
//                    stable: true,
                    width: 100
                },
                {
                    content: lib.field.getBarRenderer('potionalclk', '#9DDE52'),
                    field: 'potionalclk',
                    title: '潜在点击量',
                    sortable: true,
//                    stable: true,
                    width: 90
                },
                {
                    content: lib.field.getBarRenderer('hotlevel', '#86ADED'),
                    field: 'hotlevel',
                    title: '行业热门程度',
                    sortable: true,
//                    stable: true,
                    width: 90
                }
            ];

            this._tableId = 'scheduleRecmTable';
            config[this._tableId] = {
//                bodyHeight: 240,
                sortable: 'true',
                fields: fields,
                datasource: []
            };
        },
        /**
         * 获取表格组件
         * @return {ui.Table}
         */
        getTable: function() {
            return ui.util.get(this._tableId);
        },
        /**
         * 创建推荐时段的分析组件
         * @method createRecmdWidget
         * @protected
         * @return {nirvana.RecmdScheduler}
         */
        createRecmdWidget: function() {
            return new nirvana.RecmdScheduler(this, this.getTable());
        },
        /**
         * 更新其它widget信息
         * @param {Object} data 数据对象
         * @override
         */
        updateWidgets: function(data) {
            // 更新推荐时段分析组件
            this._recmdWidget.update(data.suggestcyc, data.potionalclk, data.hotlevel);
        },
        /**
         * 销毁实例,时段优化对话框关闭后，会自动调用该方法
         * @method dispose
         */
        dispose: function() {
            ui.util.disposeWidgets(this, ['_recmdWidget']);
            nirvana.ScheduleDlg.prototype.dispose.call(this);
        }
    };

    // 继承ScheduleDlg
    baidu.inherits(ScheduleOptimizer, nirvana.ScheduleDlg);

    return ScheduleOptimizer;
}($$, nirvana, ui, baidu);