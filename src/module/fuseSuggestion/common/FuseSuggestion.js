/**
 * @file src/module/fuseSuggestion/fuseSuggestion.js 融合主模块
    智能优化融入推广管理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.fuseSuggestion.FuseSuggestion = (function() {
    // a short namespace
    var me = nirvana.fuseSuggestion;

    // @requires 输入

    // sizzle => $$
    // tangram => baidu
    var config = me.config;
    // lib => lib // 使用了公共基础库中的lib
    // er => er

    // 定义输出
    var exports = {};


    // 收起时的Bubble
    ui.Bubble.source.fuseBubbleMax = {
        type : 'tail',
        iconClass : 'ui_bubble_icon_none',
        // positionList : [8,7,3,4,1,2,5,6],
        showTimeConfig : 'deadlinedefault',        //显示控制
        deadlinedefault: '2013/05/10',
        needBlurTrigger : true,
        showByClick : false,
        showByOver : false,             //鼠标悬浮延时显示
        hideByOut: true,
        hideByOutInterval: 1000 * 60,
        autoShow : true,
        autoShowDelay : 50,
        bubbleClass: 'fusesug-bubble-max',
        title: '',
        content: '点击收起优化建议'
    };
    // 展开时的Bubble
    ui.Bubble.source.fuseBubbleMin = {
        type : 'tail',
        iconClass : 'ui_bubble_icon_none',
        // positionList : [8,7,3,4,1,2,5,6],
        showTimeConfig : 'deadlinedefault',        //显示控制
        deadlinedefault: '2013/05/10',
        needBlurTrigger : true,
        showByClick : false,
        showByOver : false,             //鼠标悬浮延时显示
        hideByOut: true,
        hideByOutInterval: 1000 * 60,
        autoShow : true,
        autoShowDelay : 50,
        bubbleClass: 'fusesug-bubble-min',
        title: '&nbsp;',
        content: '<img src="asset/img/fuseBubbleInfo.jpg" />'
            + '<div>'
            + '点击展开获取优化建议'
            + '<div>'
    };

    /**
     * @class FuseSuggestion 同时是一个简易的ObserverPattern的Subject
     * @constructor
     *
     * @param {Object} data 数据，应该直接就是optsug数据
     * @param {Object} options 配置信息
            {string} viewStatus: 视图状态，可选值 min|max
     */
    exports = function(viewStatus) {
        this.viewStatus = viewStatus || config.DEFAULT.viewStatus;
        this.inited = false;
        this.observers = {};
    };

    exports.prototype = {

        /** @lends FuseSuggestion.prototype */

        /**
         * 通知所有监听者发生了改动，发送之命令
         *
         * @public
         * @param {string} command 命令
         * @param {Object+} data 数据
         * @return {Object} 自身
         */
        notify : function(data) {
            // 通知一下，自己有改动
            for(var key in this.observers) {
                this.observers[key].update(data);
            }
        },

        refreshForUITable: function() {
            if(!this.levelinfo) {
                return;
            }

            var table = ui.util.get(this.levelinfo + 'TableList');
            var currentWidth = config.DEFAULT.width[this.viewStatus];
            if(table.fields[1].field !== 'optsug') {
                return;
            }

            this.notify(this.viewStatus);

            // table.fields[1].stable = false;
            table._fields[2].stable = false;

            // table.fields[1].width = currentWidth;
            // table.fields[1].minWidth = currentWidth;
            table._fields[2].width = currentWidth;
            table._fields[2].minWidth = currentWidth;

            table.initMinColsWidth();
            table.initColsWidth();

            table.handleResize();

            // table.fields[1].stable = true;
            table._fields[2].stable = true;

            table.colsWidth[2] = currentWidth;
            table.colsWidthBak[2] = currentWidth;
            table.colsWidthLock[2] = currentWidth;

            // 重新绘制每一列
            // table.resetColumns();
            table.refreshView();
        },

        /**
         * 控制整体展开
         */
        unfoldAll: function() {
            this.viewStatus = 'max';
            this.refreshForUITable();
            me.monitor.unfoldAll(this);
        },
        /**
         * 控制整体收起
         */
        foldAll: function() {
            this.viewStatus = 'min';
            this.refreshForUITable();
            me.monitor.foldAll(this);
        },

        /**
         * 获取当前表格列标题
         */
        getTitle: function() {
            var self = this;

            return function() {
                var bubbleSource = self.viewStatus == 'min'
                        ? 'fuseBubbleMin'
                        : 'fuseBubbleMax';
                var data = {
                    title: config.LANG.TITLE,
                    bubbleSource: bubbleSource,
                    mark: self.viewStatus == 'max' ? '-' : '+',
                    action: self.viewStatus == 'max' ? 'fusesug-foldall' : 'fusesug-unfoldall'
                };
                return lib.tpl.parseTpl(data, 'fuseSuggestionTitle', true);
            };
        }
    };

    return exports;
})();