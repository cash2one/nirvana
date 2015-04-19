/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/season/SeasonPkgOptimizeCtrl.js
 * desc: 行业旺季包的优化建议组件，扩展自AoPkgOptimizerCtrl.js
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/05/13 $
 */
/**
 * 行业旺季包优化建议组件定义
 * @class SeasonPkgOptimizeCtrl
 * @namespace nirvana.aoPkgControl
 * @extends nirvana.aoPkgControl.AoPkgOptimizerCtrl
 */
nirvana.aoPkgControl.SeasonPkgOptimizeCtrl = function ($, T, nirvana) {
    var logger = nirvana.AoPkgMonitor;
    var superProto = nirvana.aoPkgControl.AoPkgOptimizerCtrl.prototype;

    // 查看全部文本信息常量定义
    var VIEW_ALL_TXT_MAP = {
        902: '查看全部计划预算建议',
        903: '查看全部出价建议',
        904: '查看全部新提词',
        906: '查看全部匹配建议'
    };

    // 修改按钮文本信息常量定义
    var MOD_BTN_TXT_MAP = {
        901: '修改预算',
        902: '修改预算',
        903: '修改出价',
        904: '添加',
        906: '修改匹配'
    };

    // 修改按钮对应的动作名称（点击事件处理名称）定义
    var MOD_BTN_ACTION_MAP = {
        901: 'modAccountBudget',
        902: 'modPlanBudget',
        903: 'modWBid',
        904: 'addRecmword',
        906: 'modWMatch'
    };

    // 显示查看全部链接要求最少优化项数量
    var VIEW_ALL_MIN_NUM = 3;

    // 子的优化项分组
    var SUB_OPTITEM_GROUP = [904, 906];

    // 优化项预览显示的优化建议数量
    var OPTITEM_PREVIEW_NUM = {
        901: 1,
        902: 3,
        903: 3,
        904: 6,
        906: 3
    };

    var SeasonPkgOptimizeCtrl = {
        /**
         * 优化详情配置定义
         */
        detailConf: nirvana.aoPkgControl.seasonDetailConf,
        /**
         * @override
         */
        showLoading: function () {
            this.toggleLoading(true);
        },
        /**
         * @override
         */
        hideLoading: function () {
            this.toggleLoading(false);
        },
        toggleLoading: function (isShow) {
            var loadingEle = this.$('.season-pkg-opt-loading')[0];
            isShow ? T.show(loadingEle) : T.hide(loadingEle);
        },
        $: function (selector) {
            return $(selector, this.view);
        },
        /**
         * 渲染优化建议容器
         * @override
         */
        renderContainer: function () {
            var me = this;
            var groupInfo = me.groupInfo;
            var html = '';

            var groupContent;
            var groupItem;
            for (var i = 0, len = groupInfo.length; i < len; i ++) {
                groupItem = groupInfo[i];
                groupContent = me.generateOptGroupContent(groupItem.OPTTYPE);
                html += lib.tpl.parseTpl({
                    groupId: i,
                    diagnosisResult: groupItem.groupName,
                    groupContent: groupContent
                }, 'seasonPkgOptItemGroup', true);
            }

            me.$('.optitem-container')[0].innerHTML = html;

            // 初始化上下文属性信息
            me.initAttrs({
                recalculateInfo: {},
                previewDetail: {},
                isRefresh: false
            });
        },
        /**
         * 产生优化项分组渲染的HTML内容，不包含具体的优化项预览详情内容
         * @param opttypeList
         */
        generateOptGroupContent: function (opttypeList) {
            var me = this;
            var groupContent = '';
            var content = '';
            var opttypeid;

            for (var i = 0, len = opttypeList.length; i < len; i ++) {
                opttypeid = opttypeList[i];
                if (me.isSubGroupOptItem(opttypeid)) {
                    content = lib.tpl.parseTpl({
                        opttypeId: opttypeid,
                        title: lib.tpl.parseTpl({
                            opttypeId: opttypeid
                        }, 'seasonPkgSubOptItemGroupTitle' + opttypeid, true)
                    }, 'seasonPkgOptItemSubGroup', true);
                }
                else {
                    content = lib.tpl.parseTpl({
                        opttypeId: opttypeid
                    }, 'seasonPkgOptItem', true);
                }
                groupContent += content;
            }

            return groupContent;
        },
        /**
         * 是否是子的优化项分组，用于区分界面上两种显示方式，一种显示成类似于子分组，包含子的标题
         * 比如优化项904,906，另一种直接显示成优化项分组下的优化项，比如901,902,903
         * @param {number} opttypeid 优化项类型id
         * @returns {boolean}
         */
        isSubGroupOptItem: function (opttypeid) {
            return T.array.indexOf(SUB_OPTITEM_GROUP, +opttypeid) !== -1;
        },
        /**
         * @description 获取请求摘要信息时的请求参数
         *
         * @param {boolean} isNew 是否是去获取默认的初始请求使用的请求参数，用于第一次请求
         *                        或者重新开始请求
         * @override
         */
        getRequestParam: function (isNew) {
            var me = this;

            // 调用父类方法
            var absRequestParam = superProto.getRequestParam.call(me, isNew);

            var condition = absRequestParam.condition;
            if (!condition) {
                condition = {};
                absRequestParam.condition = condition;
            }
            condition.tradeid = me.options.tradeId;

            return absRequestParam;
        },
        /**
         * 不管是请求失败，还是以前的请求返回，只对当前请求进行处理
         * @override
         */
        resetStatus: function (timeStamp) {
            var me = this;
            if (me.getTimestamp() === timeStamp) {
                me.hideLoading();
            }
        },
        /**
         * 重新加载指定旺季行业的优化建议项
         * @param {number} tradeId 旺季行业id
         */
        loadOptItems: function (tradeId) {
            var me = this;
            me.options.tradeId = tradeId;
            me.show();
        },
        /**
         * 事件绑定
         * @override
         */
        bindHandlers: function () {
            var me = this;

            if (me.getAttr('binded')) {
                return;
            }

            // 代理优化建议区域的点击事件
            var optItemContainer = me.$('.optitem-container')[0];
            var handler = function (event, target) {
                var act = target.getAttribute('act');
                if (act) {
                    me[act](target, target.getAttribute('opttype'),
                        target.getAttribute('dataIdx'));
                }
            };
            optItemContainer.onclick = nirvana.event.delegate(
                optItemContainer, handler, me);

            me.setAttr('binded', true);
        },
        /**
         * 收起优化项的预览信息
         * @param {HTMLElement} target
         */
        collapseView: function (target) {
            this._togglePreivewItem(target);
        },
        /**
         * 展开优化项的预览信息
         * @param {HTMLElement} target
         */
        expandView: function (target) {
            this._togglePreivewItem(target);
        },
        /**
         * 展开/收起优化项的预览信息
         * @param {HTMLElement} target
         */
        _togglePreivewItem: function (target) {
            var me = this;
            var opttypeid = target.getAttribute('opttype');
            var view = me.$('.preview-content-' + opttypeid)[0];
            nirvana.aoPkgControl.seasonPkgUtil.toggleView(
                target, view, '收起', '展开');
        },
        /**
         * 点击预览账户预算的“修改预算”按钮触发的修改操作
         * @param {HTMLElement} target 点击的目标DOM元素
         * @param {number} opttypeid 优化项的类型id
         * @param {number} dataIdx 优化项预览项在所有预览项详情数据里的索引
         * @Action
         */
        modAccountBudget: function (target, opttypeid, dataIdx) {
            // 执行查看详情动作
            var me = this;

            // 发送监控
            logger.viewPreviewOptItem(opttypeid);

            var conf = me.detailConf[opttypeid];
            conf.customConfig = conf.customConfig || {};
            T.extend(conf.customConfig, {
                tradeId: me.options.tradeId
            });
            me.openBudgetDetail(opttypeid, dataIdx, conf);
        },
        /**
         * 点击预览计划预算的“修改预算”按钮触发的修改操作
         * @param {HTMLElement} target 点击的目标DOM元素
         * @param {number} opttypeid 优化项的类型id
         * @param {number} dataIdx 优化项预览项在所有预览项详情数据里的索引
         * @Action
         */
        modPlanBudget: function (target, opttypeid, dataIdx) {
            // 发送监控
            logger.viewPreviewOptItem(opttypeid);

            // 单个计划预算详情跟所有计划预算详情不一样，因此对于单个，这里单独传入，使其能
            // 走弹窗的详情逻辑
            var detailConf = {
                base: 'getBudgetDetailConf',
                customConfig: {
                    tradeId: this.options.tradeId
                }
            };
            // 执行查看详情动作
            this.openBudgetDetail(opttypeid, dataIdx, detailConf);
        },
        /**
         * 点击预览推荐关键词出价信息的“修改出价”按钮触发的修改操作
         * @param {HTMLElement} target 点击的目标DOM元素
         * @param {number} opttypeid 优化项的类型id
         * @param {number} dataIdx 优化项预览项在所有预览项详情数据里的索引
         * @Action
         */
        modWBid: function (target, opttypeid, dataIdx) {
            var me = this;

            // 发送监控
            logger.viewPreviewOptItem(opttypeid);

            var dlg = new nirvana.aopkg.ModBidDlg();
            dlg.onSuccess = function (word, newWBid) {
                logger.modWBidByPreview(word, newWBid, opttypeid);
                me.setRecaculateInfo(opttypeid, 1);
                me.refreshOptItem(opttypeid);
            };

            var data = this.getOptItemPreviewData(opttypeid, dataIdx);
            var initData = T.object.clone(data);
//            initData.reason = nirvana.aoPkgWidgetRender.reason(data);
            dlg.show(initData);
        },
        /**
         * 点击预览推荐的关键词的匹配信息的“修改匹配”按钮触发的修改操作
         * @param {HTMLElement} target 点击的目标DOM元素
         * @param {number} opttypeid 优化项的类型id
         * @param {number} dataIdx 优化项预览项在所有预览项详情数据里的索引
         * @Action
         */
        modWMatch: function (target, opttypeid, dataIdx) {
            var me = this;

            // 发送监控
            logger.viewPreviewOptItem(opttypeid);

            var dlg = new nirvana.aopkg.ModMatchDlg();
            dlg.onSuccess = function (word, newWMatch) {
                logger.modWMatchByPreview(word, newWMatch, opttypeid);
                me.setRecaculateInfo(opttypeid, 1);
                me.refreshOptItem(opttypeid);
            };

            var data = this.getOptItemPreviewData(opttypeid, dataIdx);
            var initData = T.object.clone(data);
            dlg.show(initData);
        },
        /**
         * 点击预览推荐关键词的“添加”按钮触发的添加操作
         * @param {HTMLElement} target 点击的目标DOM元素
         * @param {number} opttypeid 优化项的类型id
         * @param {number} dataIdx 优化项预览项在所有预览项详情数据里的索引
         * @Action
         */
        addRecmword: function (target, opttypeid, dataIdx) {
            var me = this;

            // 发送监控
            logger.viewPreviewOptItem(opttypeid);
            var dlg = new nirvana.aopkg.AddWordDlg();
            dlg.onSuccess = function (addedWord) {
                logger.addWordByPreview(addedWord, opttypeid);
                me.setRecaculateInfo(opttypeid, 1);
                me.refreshOptItem(opttypeid);
            };

            var data = this.getOptItemPreviewData(opttypeid, dataIdx);
            var initData = T.object.clone(data);

            T.extend(initData, {
                opttypeid: opttypeid,
                currplanid: +data.recmplanid,
                currunitid: +data.recmunitid,
                currplanname: data.recmplanname,
                currunitname: data.recmunitname
            });

            dlg.show(initData);
        },
        /**
         * 打开预算详情浮出层
         * @param {number} opttypeid 优化项的类型id
         * @param {number} dataIdx 优化项预览项在所有预览项详情数据里的索引
         * @param {?Object} 详情视图定制配置
         */
        openBudgetDetail: function (opttypeid, dataIdx, viewConf) {
            var me = this;

            var data = me.getOptItemPreviewData(opttypeid, dataIdx);
            // FIXME 以后老的详情下掉，下面detailCtrl可以移到初始化部分
            if (!me.detailCtrl) {
                me.detailCtrl = new nirvana.aoPkgControl.AoPkgDetailCtrl();
                var detailDom = T.g(me.appId + 'AoPkgDetailContainer');
                me.detailCtrl.init(me, detailDom);
            }

            var detailView = nirvana.aoPkgControl.viewUtil.getDetailView(me,
                opttypeid, data, viewConf);
            me.detailCtrl.show(opttypeid, opttypeid, detailView);
        },
        /**
         * 获取优化项预览数据信息，包括整个优化项的摘要信息及特定预览项的详情信息
         * @param {number} opttypeid 优化项的类型id
         * @param {number} dataIdx 优化项预览项在所有预览项详情数据里的索引
         * @returns {Object}
         */
        getOptItemPreviewData: function (opttypeid, dataIdx) {
            var me = this;

            var abstractData = me.getOptimizeItemData(opttypeid).data;
            var detailData = me.getPreviewItemDetail(opttypeid, dataIdx);
            var data = T.object.clone(abstractData);

            T.extend(data, detailData);

            return data;
        },
        /**
         * 查看全部的预览优化项信息，本质上就是进入优化项的详情页
         * @param {HTMLElement} target
         */
        viewAllOptItems: function (target, opttypeid) {
            // 调用父类的点击详情按钮方法，触发进入详情视图的动作
            this.clickOptButton(opttypeid);
        },
        /**
         * 缓存预览项的详情信息
         * @param {number} opttypeid 预览项所属的优化项类型id
         * @param {Array} data 预览项数据
         */
        cachePreviewDetail: function (opttypeid, data) {
            var detail = this.getAttr('previewDetail');
            detail[opttypeid] = data;
        },
        /**
         * 获取预览项的详情数据
         * @param {number} opttypeid 预览项所属的优化项类型id
         * @param {number} idx 预览项在所属的预览详情数据里的索引
         * @returns {Object}
         */
        getPreviewItemDetail: function (opttypeid, idx) {
            var detail = this.getAttr('previewDetail');
            var item = detail[opttypeid];

            return item && item[idx];
        },
        /**
         * @override
         */
        viewDetail: function(optid, opttypeid, cache, data) {
            this.switchToDetail2(optid, opttypeid, cache, data);
        },
        /**
         * 请求优化项的预览的部分详情信息
         */
        reqOptItemPreviewInfo: function (opttypeid, absItem) {
            var me = this;

            var condition = {
                startindex: 0,
                endindex: OPTITEM_PREVIEW_NUM[opttypeid] - 1,
                optmd5 : absItem.optmd5,
                recalculate: me.isNeedRecaculate(opttypeid),
                tradeid: me.options.tradeId
            };

            var timeStamp = me.getTimestamp();
            var bind = nirvana.util.bind;
            var param = {
                level: me.options.level,
                opttypeid: opttypeid,
                optmd5: absItem.groupOptmd5,
                condition: condition,
                onSuccess: bind('reqPreviewDetailSuccess', me, timeStamp, opttypeid),
                onFail: bind('reqPreviewDetailFail', me, timeStamp, opttypeid)
            };

            fbs.nikon.getDetail(param);
        },
        /**
         * 是否当前的优化项预览的详情信息需要重新计算, 0表示不重新计算详情，1表示重新计算详情
         * @param {number} opttypeid 优化项的opttypeid
         * @returns {number}
         */
        isNeedRecaculate: function (opttypeid) {
            var recaculateInfo = this.getAttr('recalculateInfo');
            return recaculateInfo[opttypeid] || 0;
        },
        /**
         * 设置优化项的预览详情信息是否需要重新计算
         * @param {number} opttypeid 优化项的opttypeid
         * @param {number} recaculate 0表示不重新计算详情，1表示重新计算详情
         */
        setRecaculateInfo: function (opttypeid, recaculate) {
            var recaculateInfo = this.getAttr('recalculateInfo');
            recaculateInfo[opttypeid] = recaculate;
        },
        /**
         * 请求优化项预览详情信息成功处理
         */
        reqPreviewDetailSuccess: function (timeStamp, opttypeid, response) {
            var me = this;
            // 扔掉以前的请求，只处理当前请求
            if (me.getTimestamp() === timeStamp) {
                // 请求成功以后，重置是否需要重新计算为false
                me.setRecaculateInfo(opttypeid, 0);

                var data = response.data;
                var detailresitems = data.detailresitems;

                var listData = [];
                var isRecmword = opttypeid == 904;
                T.each(detailresitems, function (item) {
                    if (!isRecmword || (isRecmword && item.data.isfstscreen == 1)) {
                        // 对于提词需要过滤掉非首屏词，由于预览项只显示首屏词
                        listData.push(item.data);
                    }
                });

                // 缓存预览详情信息
                me.cachePreviewDetail(opttypeid, listData);
                // 更新预览项标题信息
                me.updateOptItemTitleInfo(opttypeid, data.totalnum);
                // 渲染优化项的预览详情信息
                me.renderOptItemPreviewDetail(opttypeid, data.totalnum, listData);
            }
        },
        /**
         * 请求优化项预览详情信息失败处理
         */
        reqPreviewDetailFail: function (timeStamp, opttypeid) {
            var me = this;
            // 扔掉以前的请求，只处理当前请求
            if (me.getTimestamp() === timeStamp) {
                me.setPreviewContent(opttypeid, er.template.get('seasonPkgPreviewFail' + opttypeid));
            }
        },
        /**
         * 渲染优化项的预览详情信息
         * @param {number} opttypeid 优化项的类型id
         * @param {number} totalNum 优化项详情总的数量
         * @param {Array} listData 预览项的详情数据
         */
        renderOptItemPreviewDetail: function (opttypeid, totalNum, listData) {
            var me = this;

            var html = '';
            var num = listData.length;
            var previewClass = +opttypeid === 904
                ? 'inline_block recmword-item'
                : 'preview-item';
            for (var i = 0; i < num; i ++) {
                html += lib.tpl.parseTpl({
                    previewClass: previewClass,
                    content: me.generatePreviewItemContent(opttypeid, listData[i], i)
                }, 'seasonPkgPreviewItem', true);
            }

            if (num >= VIEW_ALL_MIN_NUM
                && totalNum > VIEW_ALL_MIN_NUM) {
                html += lib.tpl.parseTpl({
                    viewAllTxt: VIEW_ALL_TXT_MAP[opttypeid],
                    opttypeId: opttypeid
                }, 'seasonPkgViewAllOptItems', true);
            }

            me.setPreviewContent(opttypeid, html);
        },
        /**
         * 设置优化项的预览内容
         * @param {number} opttypeid 优化项类型id
         * @param {string} html 预览项内容
         */
        setPreviewContent: function (opttypeid, html) {
            var me = this;

            var previewContainer = me.$('.preview-content-' + opttypeid)[0];
            previewContainer.innerHTML = html;

            // 对于子分组：optItemContainer与previewContainer是不一样的
            var optItemContainer = me.$('.optitem[opttype=' + opttypeid + ']')[0];
            if (html) {
                T.removeClass(optItemContainer, 'hide');
            }
            else {
                T.addClass(optItemContainer, 'hide');

                if (me.getAttr('isRefresh')) {
                    var groupEle = T.dom.getAncestorByClass(optItemContainer, 'group-wrapper');
                    var optItemList = $('.optitem', groupEle);
                    var hasOptItem = false;

                    for (var i = 0, len = optItemList.length; i < len; i ++) {
                        if (optItemList[i].offsetHeight) {
                            hasOptItem = true;
                            break;
                        }
                    }

                    if (!hasOptItem) {
                        $('.group-content', groupEle)[0].innerHTML =
                            er.template.get('seasonPkgOptItemNoAdvice');
                    }
                }
            }
        },
        /**
         * 产生优化项预览详情项的渲染的内容的HTML
         * @param {number} opttypeid 优化项类型id
         * @param {Object} data 预览项的数据对象
         * @param {number} index 预览项在返回所有预览项里的数据索引
         */
        generatePreviewItemContent: function (opttypeid, data, index) {
            var tplName = 'aoPkgAbsItem' + opttypeid;

            // 账户预算模板名称特殊处理
            if (opttypeid == 901) {
                if (+data.suggestbudget) {
                    var bgttype = +data.bgttype;
                    if (bgttype === 1 && +data.saveclk) {
                        // 日预算建议,必须有挽回点击信息才显示，否则按周预算话术显示
                        tplName += 'Day';
                    }
                    else /*if (bgttype === 2)*/ {
                        // 周预算建议
                        tplName += 'Week';
                    }
                }
                else { // 这种情况已删掉，若返回了，直接返回空，不处理这种情况
                    return '';
                }
            }
            else if (opttypeid == 902 && !(+data.saveclk)) {
                // 计划预算没有挽回点击信息使用另一个模板
                tplName += 'NoSaveClk';
            }

            // 初始化模板的数据
            var tplData = this.getPreviewItemTplData(opttypeid, data, index);
            return lib.tpl.parseTpl(tplData, tplName, true);
        },
        /**
         * 获取预览项模板数据
         * @private
         */
        getPreviewItemTplData: function (opttypeid, data, index) {
            // 初始化模板的数据
            var tplData = {
                opttypeId: opttypeid,
                dataIdx: index,
                btnTxt: MOD_BTN_TXT_MAP[opttypeid],
                btnClass: 904 == opttypeid ? 'clickable recmword-add-btn' : 'aopkg_btn',
                action: MOD_BTN_ACTION_MAP[opttypeid]
            };

            T.extend(tplData, data);

            tplData.showqstar = qStar.getStar(data.showqstat);
            tplData.wmatch = MTYPE[data.wmatch];
            tplData.recmwmatch = MTYPE[data.recmwmatch];
            tplData.dailypv = nirvana.util.translatePv(data.dailypv);

            var strRenderer = lib.field.strRenderer;
            var fixed = baidu.number.fixed;
            switch (+opttypeid) {
                case 902: // 计划预算
                    tplData.planname = strRenderer(data.planname, 30, 'aopkg_em');
                    break;
                case 903: // 关键词出价
                case 906: // 扩匹配
                    tplData.showword = strRenderer(data.showword, 30, 'aopkg_em');
                    tplData.bid = fixed(+data.bid || data.unitbid);
                    data.recmbid && (tplData.recmbid = fixed(data.recmbid));
                    break;
                case 904: // 提词
                    tplData.showword = baidu.encodeHTML(data.showword);
                    break;
            }

            return tplData;
        },
        /**
         * 显示空摘要信息
         * @override
         */
        showNoOptimizer: function () {
            var html = lib.tpl.parseTpl({
                noAdviceStyle: 'season-pkg-noadvice'
            }, 'seasonPkgNoAdvice', true);
            this.$('.optitem-container')[0].appendChild(fc.create(html));
        },

        /**
         * 获取给定的优化项其所属的优化项分组的id
         * @param {number} opttypeid 优化项类型id
         * @returns {number}
         */
        getOptItemGroupId: function (opttypeid) {
            var me = this;
            var groupInfo = me.groupInfo;

            for (var i = 0, len = groupInfo.length; i < len; i ++) {
                if (T.array.indexOf(groupInfo[i].OPTTYPE, opttypeid) !== -1) {
                    return i;
                }
            }
            return -1;
        },
        /**
         * 展现某条摘要
         * @override
         */
        showOverviewItem: function (opttypeid) {
            var me = this;
            var optInfo = me.getOptimizeItemData('' + opttypeid);

            // 如果优化项没有任何问题，不做任何处理
            if (!optInfo.details.hasproblem) {
                return;
            }

            var groupId = me.getOptItemGroupId(+opttypeid);
            var groupEle = me.$('.group-wrapper[groupId=' + groupId + ']')[0];
            T.removeClass(groupEle, 'hide');

            var data = optInfo.data;
            me.reqOptItemPreviewInfo(opttypeid, data);

            // 更新标题信息
            me.updateOptItemTitleInfo(opttypeid, data.count);
        },
        /**
         * 更新优化项标题信息
         * @param {number} opttypeid 要更新的优化项类型id
         * @param {number} count 优化项克优化数量
         */
        updateOptItemTitleInfo: function (opttypeid, count) {
            var optCountEle = this.$('.opt' + opttypeid + '-count')[0];
            optCountEle && (optCountEle.innerHTML = count);
        },
        /**
         * 刷新某条优化项
         * @override
         */
        refreshOptItem: function (opttypeid) {
            var me = this;
            var html = lib.tpl.parseTpl({
                refreshTxt: me.options.refreshWord[opttypeid]
            }, 'seasonPkgPreviewRefresh', true);
            me.setPreviewContent(opttypeid, html);
            // 强制重新计算详情
            me.setRecaculateInfo(opttypeid, 1);
            // 设置当前为刷新状态
            me.setAttr('isRefresh', true);

            var data = me.getOptimizeItemData('' + opttypeid).data;
            me.reqOptItemPreviewInfo(opttypeid, data);
        },
        /**
         * 销毁优化项控制器实例
         * @override
         */
        dispose: function() {
            superProto.dispose();
            this.clearAttr();
        }
    };

    // 支持属性读写功能
    T.extend(SeasonPkgOptimizeCtrl, nirvana.attrHelper);

    return nirvana.aoUtil.extendClass(nirvana.aoPkgControl.AoPkgOptimizerCtrl,
        SeasonPkgOptimizeCtrl);
}($$, baidu, nirvana);