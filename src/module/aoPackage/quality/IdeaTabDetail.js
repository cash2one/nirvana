/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/quality/IdeaTabDetail.js
 * desc: AO优化包提供标签页功能的表格详情视图类，当前主要用在质量度优化包，
 * 基于quality/widget_303.js重写
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * @author: zhujialu
 * date: $Date: 2013/05/06 $
 */
/**
 * AO优化包提供标签页功能的表格详情视图类，当前主要用在质量度优化包
 * @class IdeaTabDetail
 * @namespace nirvana.aoPkgControl
 * @extends nirvana.aoPkgControl.PaginationView
 */
nirvana.aoPkgControl.IdeaTabDetail = function ($, T, nirvana) {
    /**
     * 质量度等级的话术定义
     * @type {Object}
     */
    var qualityMap = {
        11: '较易优化',
        12: '优化难度中等',
        13: '较难优化',
        21: '较易优化',
        23: '较难优化'
    };

    /**
     * 获取质量度类型信息，格式为“一星较易优化”
     * @param {number} star 质量度等级
     * @return {String}
     */
    function getQulityType(star) {
        var title = '';
        // 加上几星
        if (star > 10 && star < 20) {
            title = '一星';
        }
        else if (star > 20 && star < 30) {
            title = '二星';
        }

        // 加上优化难度
        return title + qualityMap[star];
    }

    return {
        /**
         * 获取详情视图模板数据
         * @return {Object}
         * @override
         */
        getViewTplData: function() {
            var me = this;

            var star = me.getStarNumber();
            var title = '优化创意（' + getQulityType(star) + '）';
            me.setAttr('title', title);

            return me.superProto.getViewTplData.call(me);
        },
        /**
         * 渲染详情核心内容
         * @override
         */
        renderContent: function (contentView) {
            var me = this;

            var tabHtml = er.template.get('aoPkgDetailTab');
            var tabView = fc.create(tabHtml);
            me.createTabView(tabView, contentView);
            T.dom.insertBefore(tabView, contentView);
            me.renderTabContent(contentView);
        },
        /**
         * 创建Tab视图
         * @param {HTMLElement} tabView tab组件容器
         * @param {HTMLElement} contentView Tab内容的容器视图
         */
        createTabView: function (tabView, contentView) {
            var me = this;
            var uiConf = {
                WidgetTab: {
                    title: ['创意', '关键词'],
                    container: [contentView, contentView],
                    // 默认选择的Tab
                    tab: me.getAttr('tab') || 0
                }
            };
            var uiMap = ui.util.init(tabView, uiConf);
            // 将动态创建的UI组件添加到UIMap属性里
            T.object.extend(me._UIMap, uiMap);

            // 绑定Tab选择的事件处理器
            var tabUI = uiMap.WidgetTab;
            tabUI.onselect = function (tabIdx) {
                me.setAttr('tab', tabIdx);
                me.setAttr('extra', null);
                me.setAttr('pageNo', 1);
                me.getInputUI().setValue('');
                me.renderTabContent(contentView);
                me.loadDetail();
            };

            me.setAttr('tab', tabUI.tab);
        },
        /**
         * 渲染Tab的内容
         * @param {HTMLElement} contentView 渲染Tab内容的容器视图
         */
        renderTabContent: function (contentView) {
            var me = this;
            var tabIdx = me.getAttr('tab');
            var queryEle = me.$('.aopkg_widget_query')[0];

            if (!queryEle) {
                var queryHtml = er.template.get('qualityPkgDetailQuery');
                queryEle = fc.create(queryHtml);

                var uiMap = ui.util.init(queryEle);
                // 将动态创建的UI组件添加到UIMap属性里
                T.object.extend(me._UIMap, uiMap);
                T.dom.insertBefore(queryEle, contentView);

                // 查询事件绑定
                var bind = nirvana.util.bind;
                uiMap.WidgetQueryBtn.onclick = bind('queryWord', me);
                me.$('.cancel-query')[0].onclick = bind('cancelQuery', me);
            }

            if (0 === tabIdx) {
                T.dom.addClass(queryEle, 'hide');
                // 对于创意tab分页大小为5
                me.setAttr('pageSize', 5);
            }
            else {
                T.dom.removeClass(queryEle, 'hide');
                me.setAttr('pageSize', 10);
            }

            // 初始化当前tab表格fields的配置
            me.setAttr('fields', me.getAttr('fields' + tabIdx));

            // 清空旧的内容
            var oldUIs = [me.getTable(), me.getPager()];
            T.each(oldUIs, function (item) {
                item && item.dispose();
            });
            contentView.innerHTML = '';

            me.superProto.renderContent.call(me, contentView);
        },
        /**
         * 获取详情请求的参数
         * @return {Object}
         * @override
         */
        getRequestParam: function () {
            var param = this.superProto.getRequestParam.call(this);
            var extra = this.getAttr('extra');
            if (extra) {
                // 对于搜索opttype变成304
                param.opttypeid = 304;
            }
            else {
                var tabIdx = this.getAttr('tab');
                var star = this.getStarNumber();
                extra = tabIdx === 0 ? star + '_idea' : star + '_word';
            }
            param.condition.extra = extra;
            return param;
        },
        /**
         * 请求详情成功的回调
         * @param {Object} response 响应的数据对象
         * @override
         */
        requestDetailSuccess: function (response) {
            var me = this;
            var tab = me.getAttr('tab');
            var data = response.data;
            var items = data.detailresitems;
            T.each(items, function (item) {
                var data = item.data;
                data.showqstat = me.getStarNumber();
                if (data.isopted == 1) {
                    if (tab === 1) {
                        me.addModifiedInfo('winfoid', data.winfoid);
                    }
                    else {
                        me.addModifiedInfo('ideaid', data.ideaid);
                    }
                }
            });

            if (tab === 1) {
                var beginDate;
                if (data.commData && (beginDate = data.commData.begindate)) {
                    beginDate = +beginDate;
                    if (typeof beginDate === 'number') {
                        // wanghuijun 2012.12.03
                        // 效果突降下线
                        if (nirvana.decrControl) {
                            nirvana.decrControl.beginDate = new Date(beginDate);
                        }
                        else {
                            nirvana.decrControl = {
                                beginDate: new Date(beginDate)
                            }
                        }

                    }
                }
            }

            // 调用父类详情请求成功的处理
            me.superProto.requestDetailSuccess.call(me, response);
        },
        /**
         * 获取查询的输入UI组件
         * @return {ui.TextInput}
         */
        getInputUI: function () {
            return this._UIMap.WidgetQueryInput;
        },
        /**
         * 查询关键词
         */
        queryWord: function () {
            var me = this;
            var input = me.getInputUI();
            var value = input.getValue();
            if (T.trim(value) === '') {
                return;
            }

            var extra = me.getStarNumber() + '_' + value;
            me.setAttr('extra', extra);
            me.setAttr('pageNo', 1);
            // 发送查询监控
            me.logger.searchWord(value, me.getStarNumber(), me.getOpttypeid());
            me.loadDetail();
        },
        /**
         * 取消关键词查询
         */
        cancelQuery: function () {
            var me = this;
            me.setAttr('extra', null);
            me.setAttr('pageNo', 1);
            // 清空输入值
            me.getInputUI().setValue('');
            // 发送取消查询监控
            me.logger.cancelSearchWord(me.getStarNumber(), me.getOpttypeid());
            me.loadDetail();
        },
        /**
         * 返回11，12，13，21，23之类的质量度
         */
        getStarNumber: function () {
            var attrs = this.getAttr();
            var star;
            for (var key in attrs) {
                // if key starts with 'word_cnt'
                if (key.indexOf('word_cnt') === 0) {
                    star = key.substr(9);
                    break;
                }
            }
            return star;
        },
        /**
         * 行内编辑创意
         * @param {HTMLElement} target 触发该动作的目标DOM元素
         * @param {Object} idea 要编辑的创意的数据对象
         */
        editIdea: function (target, idea) {
            var me = this;

            this.requestIdeaInfo(idea.ideaid, function (words, reason) {
                if (words) {
                    idea.wordref = {
                        show: true,
                        source: words
                    };
                }
                if (reason && reason != 0) {
                    var reasonArr = lib.idea.getDiagnosisText(reason);

                    idea.tip = {
                        show: true,
                        title: '诊断结果',
                        content: (function () {
                            var html = '';
                            T.each(reasonArr, function (item) {
                                html += '<p>' + item + '</p>';
                            });
                            return html;
                        })()
                    };
                }

                idea.maskLevel = nirvana.aoPkgWidgetCommon.getMaskLevel();
                idea.type = 'saveas';
                idea.opttypeid = me.getOpttypeid();//303;

                idea.entranceType = 'aoPackage';
                idea.highsaveas = true;
//                idea.fromSubAction = true;
                lib.idea.editIdea(idea, function () {
                    me.fireMod('modIdeaAsNew', idea);
                });
            });
        },
        /**
         * 行内优化创意
         * @param {HTMLElement} target 触发该动作的目标DOM元素
         * @param {Object} idea 要编辑的创意的数据对象
         */
        optimizeIdea: function (target, idea) {
            this.editIdea(target, idea);
        },
        /**
         * 查看修改创意前/后的状态
         * @param {HTMLElement} target 触发该动作的目标DOM元素
         * @param {Object} idea 要编辑的创意的数据对象
         * @param {number} row 触发该动作的表格行索引
         */
        switchShadow: function (target, idea, row) {
            var curRow = this.getTable().getUI().getRow(row);
            // 获得单元格
            var cells = $('.ui_table_tdcell', curRow);
            cells = [cells[0]];

            lib.idea.switchShadow(idea, cells);
        },
        /**
         * 请求创意诊断的数据
         */
        requestIdeaInfo: function (ideaid, callback) {
            var params = {
                level: 'useracct',
                opttypeid: 305,
                condition: {
                    extra: ideaid,
                    recalculate: 1
                },

                onSuccess: function (json) {
                    if (json.data
                        && json.data.detailresitems
                        && json.data.detailresitems[0]) {

                        var data = json.data.detailresitems[0].data,
                            winfoids = data.winfoids.split(','),
                            showword = eval(data.showword),
                            reason = data.reason,
                            wordList = [];

                        for (var i = 0, len = showword.length; i < len; i++) {
                            wordList.push({
                                winfoid: winfoids[i] || 0,
                                showword: showword[i]
                            });
                        }
                        if (wordList.length === 0) {
                            wordList = null;
                        }

                        callback(wordList, reason);
                    }
                    else {
                        callback();
                    }
                },
                onFail: function () {
                    callback();
                }
            };

            fbs.nikon.getDetail(params);
        }
    };
}($$, baidu, nirvana);