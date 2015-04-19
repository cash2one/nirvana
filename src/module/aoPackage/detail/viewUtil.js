/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/detail/viewUtil.js
 * desc: AO优化包详情视图工具方法
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/03/18 $
 */
/**
 * 优化包详情视图工具方法：
 * 1. 定义了优化包详情的一些公共配置，比如分页详情视图、推词视图等
 * 2. 目前大部分优化包的优化项的特定配置也在该文件里定义
 * 3. 对于优化包的优化项详情的配置也允许在自己所在的优化包模块里定义，默认要求配置项定义必须在
 *    优化项控制实例(aoPkgOptimizerCtrl或其子类实例)里定义,通过detailConf上下文属性来
 *    定义具体参见质量度优化包例子实现 （相比第2种，这也是建议使用的方式）
 * 4. 该工具方法提供了根据详情视图配置信息创建详情视图的实例，具体参见该配置文件对外暴露的方法
 *
 * // 配置属性说明：
 * 对于在该文件定义的配置项定义如下
 * {
 *      base: {Function} 其值为一个function，主要用于定义某一类优化项详情
 *                     配置的公共配置
 *      [opttypeid]: {Object} 具体的优化项配置,详细配置说明见下面
 * }
 *
 * 具体的优化项部分配置如下 （如果是外部定义，使用第3种方式，只需按如下格式配置，上面base放到下面配置里）
 * {
 *      title:          {string} 标题区域具体优化项标题信息，比如上图1.4“关键词检索量
 *                               下降”，对于标题存在动态信息，可以在详情视图
 *                               getViewTplData方法里，重新设置title属性值
 *      materialName:   {string} 物料名称，用在批量操作时候，弹窗告知用户有xx个物料名
 *                               称要被修改，默认是关键词
 *      tipStyle:       {string} 提示区域的样式，如果不需要提示区域，可以传入hide
 *      tableOption:    {Object} 如果有定制的表格选项配置信息可以通过该属性配置
 *      fields:         {Array}  表格域的配置，其跟ui.Table定义的配置唯一差别是对于
 *                               域配置可以传入类似['planinfo', { length: 50 }]
 *                               这种形式参数，其最后会转成方法的调用：
 *                               nirvana.aoPkgWidgetFields.planinfo({length:50})，
 *                               这主要用于复用一些可重用的域的配置。
 *      containerStyle: {string} 定义详情视图容器样式
 *      contentStyle:   {string} 定义详情内容的样式
 *      applyType:      {string} 批量操作的事件处理名，具体参见下面介绍的表格批量操作的
 *                               事件处理，如果不存在批量操作，可以不配该选项
 *      applyBtnLabel:  {string} 批量应用按钮的标签，如果不存在批量操作，可以不配该选项
 *      data:           {string} 指定优化项摘要哪些属性要传入到详情里，如果要全部传入，
 *                               值设为“*”，或者指定特定属性数组[‘attr1’]
 *      extend:         {Object} 如果想重写详情视图某个方法，可以通过该属性来完成，该属
 *                               性值必须是个object，对于该object里定义的方法上下文
 *                               可以通过superProto属性来获取其父类的原型对象。对于只是简单
 *                               重写某个方法可以直接在这里配置，否则建议单独定义一个文件，
 *                               比如质量度优化包的创意详情：IdeaTabDetail，具体可以参
 *                               见代码。这种设计的目的，主要是为了避免原型的继承层次太
 *                               深，每次都需要定义一个全新的类。
 * }
 *
 * 对于不同的详情视图比如分页，有自己默认的一些配置，参见下面源码定义的配置，对于默认的公共配置
 * 可以在上面配置项里重新定义来覆盖默认的配置信息，也可以传入自己需要的一些配置信息，在详情视图
 * 实例里可以通过getAttr方法来获取到。
 * 其中一个配置属性：viewClazz: {Function} 定义了要实例化的详情视图的class，如果不是要重新
 * 定义一个详情视图类，通常不需要重写该属性，目前支持的详情视图类型见{@link DetailView.js}
 * 说明。
 *
 * NOTICE: 对于详情的tip信息的配置，比较特殊，当前是要求在所在优化包模板里配置，要求模板的
 *         target名称为aoPkgDetailTipxxx，其中xxx为优化项类型id。这么设计主要是希望将
 *         话术尽可能放到模板里。
 *
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.viewUtil = function($, T, nirvana) {
    /**************************滑动详情具体配置信息********************************/

    function getBaseParam(optCtrl, opttypeid, data) {
        return {
            pkgid: optCtrl.pkgid,
            appId: optCtrl.appId,
            opttypeid: opttypeid,
            optmd5: data.groupOptmd5,
            suboptmd5: data.optmd5,
            level: optCtrl.options.level,
            // 新增用于旺季包的参数tradeId
            tradeId: optCtrl.options.tradeId,
            contentStyle: 'aopkg_widget_table'
        };
    }

    function getLowSearchAddWordFieldConf(title, lowSearchWordTitle) {
        return {
            title: title,
            fields: [
                ['addword', { length: 22, width: 70, title: '添加关键词' }],
                ['pv', { width: 80 }],
                ['kwc', { width: 90 }],
                'addshorttarget',
                ['recmbid_editable', { width: 80 }],
                ['recmwmatch_editable', { width: 80 }],
                ['lowSearchWord', { title: lowSearchWordTitle }]
            ]
        };
    }

    function getRecmwordFieldConf(title){
        return {
            title: title || '添加关键词',
            fields: [
                ['addword', { width: 80 }],
                'pv',
                'kwc',
                'addshorttarget',
                'recmbid_editable',
                'recmwmatch_editable'
            ]
        };
    }

    function getRecmPkgAddWordFieldConf(title){
        return {
            title: title || '添加关键词',
            fields: [
                ['addword', { width: 80 }],
                'pv',
                'kwc',
                'recmbid_editable',
                'recmwmatch_editable',
                'addshorttarget'
            ]
        };
    }

    function getAddwordViewConf(optCtrl, opttypeid, data) {
        var baseParams = getBaseParam(optCtrl, opttypeid, data);
        return T.object.extend(baseParams, {
            totalrecmnum: data.totalrecmnum,
            searchword: data.searchword,
            applyBtnLabel: '添加所选',
            applyType: 'addWords',
            viewClazz: nirvana.aoPkgControl.RecmwordView
        });
    }

    ///////////////////////////////////////////////////////////////////////////

    function getPageViewBaseParam(optCtrl, opttypeid, data) {
        var baseParams = getBaseParam(optCtrl, opttypeid, data);
        T.object.extend(baseParams, {
            pageNo: 1,
            pageSize: nirvana.aoPkgConfig.DETAIL_PAGESIZE,
            viewClazz: nirvana.aoPkgControl.PaginationView
        });
        return baseParams;
    }

    function getModBidViewConf(optCtrl, opttypeid, data) {
        var baseParams = getPageViewBaseParam(optCtrl, opttypeid, data);
        return T.object.extend(baseParams, {
            applyBtnLabel: '应用所选',
            applyType: 'modBid'
        });
    }

    /**
     * 获取启用关键词/单元/计划详情视图的基本配置
     * @param {nirvana.aoPkgControl.AoPkgOptimizerCtrl} optCtrl 优化包优化建议组件
     * @param {number} opttypeid 后端返回的真实的优化建议ID
     * @param {Object} data 优化建议的数据，只是当前查看的优化项的数据
     * @return {Object}
     */
    function getMultiRunViewConf(optCtrl, opttypeid, data) {
        var baseParams = getPageViewBaseParam(optCtrl, opttypeid, data);
        return T.object.extend(baseParams, {
            applyBtnLabel: '启用所选',
            applyType: 'multiRun'
        });
    }

    function getModWmatchViewConf(optCtrl, opttypeid, data) {
        var baseParams = getPageViewBaseParam(optCtrl, opttypeid, data);
        return T.object.extend(baseParams, {
            applyBtnLabel: '应用所选',
            applyType: 'modWmatch'
        });
    }

    /**************************弹窗详情具体配置信息********************************/

    /**
     * 弹窗详情配置的公共逻辑
     * @param {nirvana.aoPkgControl.AoPkgOptimizerCtrl} optCtrl 优化包优化建议组件
     * @param {number} opttypeid 后端返回的真实的优化建议ID
     * @param {Object} data 优化建议的数据，只是当前查看的优化项的数据
     * @return {Object}
     */
    function getPopupDetailConf(optCtrl, opttypeid, data, config) {
        var initData = {
            opttypeid: opttypeid,
            optmd5: data.groupOptmd5,
            suboptmd5: data.optmd5,
            level: optCtrl.options.level,
            decrtype: optCtrl.decrtype || '',
            planid: data.planid,
            viewClazz: nirvana.aoPkgControl.PopupView
        };

        return T.object.extend(initData, config || {});
    }

    /**
     * 获取预算弹窗详情配置
     */
    function getBudgetDetailConf(optCtrl, opttypeid, data) {
        return getPopupDetailConf(optCtrl, opttypeid, data, {
            popupType: 'budget',
            suggestbudget: data.suggestbudget,
            bgttype: data.bgttype,
            isEmergencyPkg: +optCtrl.pkgid === 7 // 标识新版突降包
        });
    }

    /**
     * 获取时段弹窗详情配置
     */
    function getScheduleDetailConf(optCtrl, opttypeid, data) {
        var pkgId = +optCtrl.pkgid;
        return getPopupDetailConf(optCtrl, opttypeid, data, {
            popupType: 'schedule',
            // 只有开拓客源包和行业领先包有推荐时段分析信息
            hasAnalyze: pkgId === 2 || pkgId === 6,
            cycnum: data.cycnum // 推荐时段的数量
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    // 下面是各个优化类型配置定义

    /***************************提词详情具体配置信息******************************/

    /**
     * 添词（新提词）详情配置
     */
    var addWordViewConf = {
        base: getAddwordViewConf,
        // 突降包，网民搜索显著降低， 建议添加网民爱搜词
        110: {
            title: '新提词',
            fields: [
                ['addword', { length: 22, width: 70 }],
                ['pv', { width: 80 }],
                ['kwc', { width: 90 }],
                'addshorttarget',
                ['recmbid_editable', { width: 80 }],
                ['recmwmatch_editable', { width: 80 }],
                {
                    content: function (item) {
                        return '<div class="aopkg_detail_gray">' + nirvana.aoPkgWidgetRender.origwordinfo(11)(item) + ' (展现量-' + item.decr + ')</div>';
                    },
                    title: '网民搜索量突降关键词',
                    width: 180,
                    stable: true
                }
            ]
        },
        // 突降包，不宜推广，建议拓展优质关键词
        112: {
            title: '新提词',
            fields: [
                ['addword', { length: 22, width: 70 }],
                ['pv', { width: 80 }],
                ['kwc', { width: 90 }],
                'addshorttarget',
                ['recmbid_editable', { width: 80 }],
                ['recmwmatch_editable', { width: 80 }],
                {
                    content: function (item) {
                        return '<div class="aopkg_detail_gray">' + nirvana.aoPkgWidgetRender.origwordinfo(11)(item) + ' (展现量-' + item.decr + ')</div>';
                    },
                    title: '账户内不宜推广关键词',
                    width: 180,
                    stable: true
                }
            ]
        },
        // 突降包，检索量过低，建议拓展优质关键词
        113: {
            title: '新提词',
            fields: [
                ['addword', { length: 22, width: 70 }],
                ['pv', { width: 80 }],
                ['kwc', { width: 90 }],
                'addshorttarget',
                ['recmbid_editable', { width: 80 }],
                ['recmwmatch_editable', { width: 80 }],
                {
                    content: function (item) {
                        return '<div class="aopkg_detail_gray">' + nirvana.aoPkgWidgetRender.origwordinfo(11)(item) + ' (展现量-' + item.decr + ')</div>';
                    },
                    title: '账户内检索量过低关键词',
                    width: 180,
                    stable: true
                }
            ]
        },
        // 开拓客源包新提词
        205: {
            title: '新提词',
            fields: [
                ['addword', { width: 80 }],
                'pv',
                'kwc',
                'addshorttarget',
                ['recmbid_editable', { width: 120 }],
                ['recmwmatch_editable', { width: 120 }]
            ]
        },
        // 质量度优化包新提词
        301: {
            title: '新提词',
            fields: [
                ['addword', { width: 65 }],
                ['pv', { width: 80 }],
                ['kwc', { width: 90 }],
                'addshorttarget',
                ['recmbid_editable', { width: 90 }],
                ['recmwmatch_editable', { width: 90 }],
                'lowPresentWord'
            ]
        },
        // 提词包热搜词
        501: getRecmPkgAddWordFieldConf('热搜词'),
        // 提词包潜力词
        502: getRecmPkgAddWordFieldConf('潜力词'),
        // 提词包质优词
        503: {
            title: '质优词',
            fields: [
                ['addword', { width: 65 }],
                ['pv', { width: 80 }],
                ['kwc', { width: 90 }],
                ['recmbid_editable', { width: 80 }],
                ['recmwmatch_editable', { width: 80 }],
                'addshorttarget',
                'lowPresentWord'
            ]
        },
        // 提词包行业词
        504: getRecmPkgAddWordFieldConf('行业词'),
        // 提词包搜索关键词
        505: {
            title: '搜索关键词',
            fields: [
                ['addword', { width: 80 }],
                'pv',
                'kwc',
                ['recmbid_editable', { width: 100 }],
                ['recmwmatch_editable', { width: 100 }],
                'addshorttarget'
            ]
        },
        // 行业包行业优质词
        604: getRecmwordFieldConf('行业优质词'),
        // 新版突降包计划被删除
        704: getRecmwordFieldConf(),
        // 新版突降包单元被删除
        709: getRecmwordFieldConf(),
        // 新版突降包关键词被删除
        711: getRecmwordFieldConf(),
        // 新版突降包关键词不宜推广
        714: getLowSearchAddWordFieldConf('关键词不宜推广', '账户内不宜推广关键词'),
        // 新版突降包关键词检索量过低
        715: getLowSearchAddWordFieldConf('关键词检索量过低', '账户内检索量过低关键词'),
        // 新版突降包检索量下降
        716: getLowSearchAddWordFieldConf('关键词检索量下降', '网民搜索量突降关键词'),
        // 移动包提词
        801: {
            title: '新提词',
            fields: [
                ['addword', { width: 80 }],
                ['pv', { width: 110, title: '近7日移动搜索量' } ],
                'kwc',
                'recmbid_editable',
                'recmwmatch_editable',
                'addshorttarget'
            ],
            extend: {
                /**
                 * 渲染详情核心内容
                 * @override
                 */
                renderContent: function(contentView) {
                    var me = this;
                    me.superProto.renderContent.call(me, contentView);
                    T.dom.insertBefore(
                        fc.create(
                            '<span id="checkRecIdea">' +
                                '<input type="checkbox" id="acceptRecmIdea" checked="checked" />' +
                                '<label for="acceptRecmIdea">' +
                                '向新单元推荐创意，提升上线效率。' +
                                '</label>' +
                                '<span _ui="id:checkRecIdea;type:Bubble;source:attach_rec_idea;"></span>' +
                                '</span>'
                        ),
                        me.$('.warn-info')[0]
                    );
                    fc.ui.init(baidu.g('checkRecIdea'));
                }
            }
        }
    };

    /***********************关键词/单元/计划启用详情配置具体配置信息******************/

    /**
     * 关键词/单元/计划启用详情配置
     */
    var multiRunViewConf = {
        base: getMultiRunViewConf,
        // 新突降急救包计划被暂停
        705: {
            title: '计划暂停',
            materialName: '计划',
            levelType: 'plan',
            fields: [
                ['planinfo', { length: 70 }],
                ['beginvalue', { decrtype: '点击量', newversion: true }],
                ['endvalue', { decrtype: '点击量', newversion: true }],
                ['decr', { decrtype: '点击量'}],
                ['pausestat', { level: 'plan' }],
                'pauseSuggest'
            ]
        },
        // 新突降急救包单元被暂停
        710: {
            title: '单元暂停',
            materialName: '单元',
            levelType: 'unit',
            fields: [
                ['unitinfo', { length: 35 }],
                ['planinfo', { length: 35 }],
                ['beginvalue', { decrtype: '点击量', newversion: true }],
                ['endvalue', { decrtype: '点击量', newversion: true }],
                ['decr', { decrtype: '点击量' }],
                ['pausestat', { level: 'unit' }],
                'pauseSuggest'
            ]
        },
        // 新突降急救包关键词被暂停
        712: {
            title: '关键词暂停推广',
            levelType: 'word',
            fields: [
                ['wordinfo', { length: 20, width: 20 }],
                ['unitinfo', { length: 20, width: 20 }],
                ['planinfo', { length: 20, width: 20 }],
                ['beginvalue', { decrtype: '点击量', newversion: true }],
                ['endvalue', { decrtype: '点击量', newversion: true }],
                ['decr', { decrtype: '点击量' }],
                ['pausestat', { level: 'word' }],
                'pauseSuggest'
            ]
        }
    };

    /************************没有批量修改出价详情具体配置信息*************************/

    /**
     * 没有批量修改出价功能以及通过弹窗修改行内出价，当前用于移动包
     * @type {Object}
     */
    var noBatchModBidViewConf = {
        base: getPageViewBaseParam,
        // 移动优化包，提高出价
        802: {
            title: '优化出价',
            fields: [
                ['wordinfo', { length: 20, width: 200 }],
                ['planinfo', { length: 20, width: 200 }],
                ['unitinfo', { length: 20, width: 200 }],
                {
                    noun: true,
                    nounName: '移动展现份额',
                    title: '移动展现份额',
                    align: 'left',
                    content: lib.field.getBarRenderer('mobileshowrate', '#009900'),
                    width: 110,
                    stable: true
                },
                ['wmatch', { editable: false }],
                ['bid', { editable: true }],
                {
                    title: '建议操作',
                    align: 'left',
                    content: function () {
                        return '<span class="clickable op_bid_pop">优化出价</span>';
                    },
                    width: 150,
                    stable: true
                }
            ]
        },
        // 移动优化包，搜索无效
        803: {
            title: '优化出价',
            fields: [
                ['wordinfo', { length: 20, width: 200 }],
                ['planinfo', { length: 20, width: 200 }],
                ['unitinfo', { length: 20, width: 200 }],
                ['wmatch', { editable: false }],
                {
                    content: function (item) {
                        return '<span class="wordstatus_3 status_text" act="viewOfflineReason">' +
                            '<span class="status_icon"></span>搜索无效</span>';
                    },
                    title: '状态',
                    width: 90,
                    stable: true
                },
                ['bid', { editable: true }],
                {
                    title: '建议操作',
                    align: 'left',
                    content: function () {
                        return '<span class="clickable op_bid_pop">优化出价</span>';
                    },
                    width: 100,
                    stable: true
                }
            ],
            extend: {
                /**
                 * 点击状态列小灯泡的事件处理
                 * @event
                 */
                viewOfflineReason: function (target, item) {
//                    var me = this;
//                    var cellPos = nirvana.tableUtil.getTriggerCellPos(target);
//                    rowIdx = cellPos.row;
//                    item = me.getTable().getDatasource()[rowIdx];
                    var minbid = item.minbid;
                    ui.Dialog.factory.create({
                        maskLevel : nirvana.aoPkgWidgetCommon.getMaskLevel(),
                        id: 'aoPkgWordStatus',
                        title: '<span class="status_icon offlineReason_icon"></span><span class="offlineReasonTitle">目前关键词处于离线中，可能存在以下原因</span>',
                        width: 655,
                        content: '<div class="offlineReason">'
                            + '<table>'
                            + '<tr><th>搜索无效</th><td>关键词低于最低展现价格，要使其有效，您可优化关键词质量度或者使出价不低于最低展现价格' + minbid + '元</td><tr>'
                            + '</table>'
                            + '<p style="width:98%;padding:5px 0 10px 10px;color:#999999;border-top:1px solid #cccccc;">如有疑问，您可拨打我们的服务热线：400-890-0088</p></div>',
                        ok_button: false,
                        cancel_button: false
                    });
                }
            }
        }
    };

    /*****************************修改出价详情具体配置信息**************************/

    /**
     * 正规的修改出价详情配置：支持批量修改和行内修改出价
     * @type {Object}
     */
    var modBidViewConf = {
        base: getModBidViewConf,
        // 开拓客源包，优化出价
        203: {
            title: '优化出价',
            fields: [
                'wordinfo',
                'planinfo',
                'unitinfo',
                ['wmatch', { editable: false }],
                'recmbid',
                'bid',
                'reason'
            ]
        },
        // 行业领先包，搜索无效
        605: {
            title: '关键词搜索无效',
            fields: [
                ['wordinfo', { length: 35 }],
                ['planinfo', { length: 35 }],
                ['unitinfo', { length: 35 }],
                'bid',
                'recmbid'
            ]
        },
        // 行业领先包，关键词出价
        607: {
            title: '出价建议',
            fields: [
                'wordinfo',
                'planinfo',
                'unitinfo',
                ['wmatch', { editable: false }],
                'recmbid',
                'bid',
                'reason'
            ]
        },
        // 新版突降急救包左侧展现概率下降、平均排名下降、展现机会突降
        718: {
            title: '排名下降',
            fields: [
                ['wordinfo', { length: 13 }],
                ['unitinfo', { length: 13 }],
                ['planinfo', { length: 13 }],
                ['beginvalue', { decrtype: '点击量', newversion: true }],
                ['endvalue', { decrtype: '点击量', newversion: true }],
                ['decr', { decrtype: '点击量', width: 80 }],
                ['wmatch', { editable: false, width: 60 }],
                ['recmbid', { width: 70 }],
                ['bid', { width: 70} ],
                'leftChangeReason'
            ]
        },
        // 新版突降急救包关键词搜索无效
        713: {
            title: '关键词搜索无效',
            fields: [
                'wordinfo',
                'unitinfo',
                'planinfo',
                ['beginvalue', { decrtype: '点击量', newversion: true }],
                ['endvalue', { decrtype: '点击量', newversion: true }],
                ['decr', { decrtype: '点击量' }],
                ['wmatch', { editable: false, width: 60 }],
                'recmbid',
                'bid'
            ]
        }
    };

    /****************************修改关键词匹配具体配置信息*************************/

    /**
     * 修改关键词匹配的详情视图配置
     * @type {Object}
     */
    var modWmatchViewConf = {
        base: getModWmatchViewConf,
        // 开拓客源包，优化匹配
        204: {
            title: '优化匹配',
            fields: [
                'wordinfo',
                'planinfo',
                'unitinfo',
                ['bid', { editable: false }],
                'recmwmatch',
                'wmatch',
                'reason'
            ]
        },
        // 行业领先包，关键词匹配
        606: {
            title: '优化匹配',
            fields: [
                'wordinfo',
                'planinfo',
                'unitinfo',
                ['bid', { editable: false }],
                'recmwmatch',
                'wmatch',
                'reason'
            ]
        },
        // 新突降急救包匹配模式缩小
        717: {
            title: '匹配模式缩小',
            fields: [
                ['wordinfo', { length: 15, width: 20 }],
                ['unitinfo', { length: 15, width: 20 }],
                ['planinfo', { length: 15, width: 20 }],
                ['beginvalue', { decrtype: '点击量', newversion: true }],
                ['endvalue', { decrtype: '点击量', newversion: true }],
                ['decr', { decrtype: '点击量' }],
                ['bid', { width: 70, editable: false } ],
                'wmatchChange',
                'recmwmatch',
                'wmatch'
            ]
        }
    };

    /****************************弹窗详情具体配置信息***************************/

    /**
     * 时段优化详情的opttypes
     * @type {Array}
     */
    var scheduleOpttypes = [
        104, // 老突降包时段建议优化项
        206, // 开拓客源包新增的时段建议优化项
        603, // 行业领先包时段优化项
        708  // 新突降急救包时段设置不合理
    ];

    /**
     * 预算的优化详情的opttypes
     * @type {Array}
     */
    var budgetOpttypes = [
        201, // 扩大商机账户预算
        202, // 扩大商机计划预算
        601, // 行业领先包账户预算
        602, // 行业领先包计划预算
        702, // 新突降急救包账户预算下调
        703, // 新突降急救包账户预算不足
        706, // 新突降急救包计划预算下调
        707  // 新突降急救包计划预算不足
    ];

    ///////////////////////////////////////////////////////////////////////////

    /**
     * 所有优化项详情的配置入口
     * @type {Object}
     */
    var opttypeDetailConf = [
        ////////////////////////////////////弹窗详情配置
        /**
         * 时段详情配置
         */
        [getScheduleDetailConf, scheduleOpttypes],
        /**
         * 预算详情配置
         */
        [getBudgetDetailConf, budgetOpttypes],
        ////////////////////////////////////滑动详情配置
        /**
         * 匹配模式详情配置
         */
        modWmatchViewConf,
        /**
         * 关键词/单元/计划启用详情配置
         */
        multiRunViewConf,
        /**
         * 优化出价详情配置
         */
        // 用于移动优化包简化的优化出价配置，没有批量修改功能
        noBatchModBidViewConf,
        // 提供批量修改出价以及行内修改出价功能
        modBidViewConf,
        /**
         * 添词（新提词）详情配置
         */
        addWordViewConf
    ];

    /**
     * 查找详情视图配置
     */
    function findViewConf(optCtrl, opttypeid, data) {
        var opttypeConf;
        var getViewConf;
        var extConf;

        for (var i = opttypeDetailConf.length; i --;) {
            opttypeConf = opttypeDetailConf[i];
            if (T.lang.isArray(opttypeConf)) {
                if (T.array.indexOf(opttypeConf[1], +opttypeid) != -1) {
                    getViewConf = opttypeConf[0];
                    break;
                }
            }
            else if (extConf = opttypeConf[opttypeid]) {
                getViewConf = opttypeConf.base;
                break;
            }
        }

        var viewConf;
        if (getViewConf) {
            viewConf = getViewConf(optCtrl, opttypeid, data);
            extConf && T.object.extend(viewConf, extConf);
        }
        return viewConf;
    }

    /**
     * 根据给定的视图详情配置选项获取用于详情视图初始化的配置信息
     * @param optCtrl
     * @param opttypeid
     * @param data
     * @param {Object} options 视图详情配置，具体配置选项同上述优化项配置，唯一不同的是
     *                 base属性直接在特定优化项里设置，比如
     *                 303: { base: {string|Function}, ... }
     * @returns {Object}
     */
    function getViewConfig(optCtrl, opttypeid, data, options) {
        var customViewConf = options;
        var getViewConf = options.base;
        if (getViewConf) {
            if (typeof getViewConf === 'string') {
                getViewConf = nirvana.aoPkgControl.viewUtil[getViewConf];
            }
            customViewConf = getViewConf(optCtrl, opttypeid, data);
            T.object.extend(customViewConf, options);
            delete customViewConf.base;
        }
        return customViewConf;
    }

    /**
     * 获取优化项的详情视图实例
     * @return {nirvana.aoPkgControl.DetailView}
     */
    function getDetailView(optCtrl, opttypeid, data, viewConf) {
        viewConf = viewConf ? getViewConfig(optCtrl, opttypeid, data, viewConf)
            : findViewConf(optCtrl, opttypeid, data);

        // 传入需要额外传入的属性值，从data属性里查找
        var extendAttrs = viewConf.data;
        if (extendAttrs === '*') {
            // 把data里所有属性都传入
            T.object.extend(viewConf, data);
        }
        else if (T.lang.isArray(extendAttrs)) {
            // 只传入指定的属性
            var attr;
            for (var j = extendAttrs.length; j --;) {
                attr = extendAttrs[j];
                viewConf[attr] = data[attr];
            }
        }
        delete viewConf.data;

        var view = new viewConf.viewClazz();
        // 扩展视图实例
        var extendObj = viewConf.extend;
        if (extendObj) {
            // 定义super对象
            extendObj.superProto = viewConf.viewClazz.prototype;
            T.extend(view, extendObj);
        }
        delete viewConf.viewClazz;
        view.init(viewConf);
        return view;
    }

    return {
        /**
         * 获取优化项详情视图的配置
         * @param {nirvana.aoPkgControl.AoPkgOptimizerCtrl} optCtrl 优化包优化建议组件
         * @param {number} opttypeid 后端返回的真实的优化建议ID
         * @param {Object} data 优化建议的数据，只是当前查看的优化项的数据
         * @param {?Object} viewConf 详情视图的配置，如果未给定，将默认从viewUtil全局配置里找
         * @return {nirvana.aoPkgControl.DetailView}
         */
        getDetailView: getDetailView,
        /**
         * 获取分页详情视图的基本配置信息
         * @param {nirvana.aoPkgControl.AoPkgOptimizerCtrl} optCtrl 优化包优化建议组件
         * @param {number} opttypeid 后端返回的真实的优化建议ID
         * @param {Object} data 优化建议的数据，只是当前查看的优化项的数据
         * @return {Object}
         */
        getPageViewBaseParam: getPageViewBaseParam,
        /**
         * 获取添词详情视图的基本配置
         * @param {nirvana.aoPkgControl.AoPkgOptimizerCtrl} optCtrl 优化包优化建议组件
         * @param {number} opttypeid 后端返回的真实的优化建议ID
         * @param {Object} data 优化建议的数据，只是当前查看的优化项的数据
         * @return {Object}
         */
        getAddwordViewConf: getAddwordViewConf,
        /**
         * 获取修改匹配详情视图的基本配置
         * @param {nirvana.aoPkgControl.AoPkgOptimizerCtrl} optCtrl 优化包优化建议组件
         * @param {number} opttypeid 后端返回的真实的优化建议ID
         * @param {Object} data 优化建议的数据，只是当前查看的优化项的数据
         * @return {Object}
         */
        getModWmatchViewConf: getModWmatchViewConf,
        /**
         * 获取修改出价详情视图的基本配置
         * @param {nirvana.aoPkgControl.AoPkgOptimizerCtrl} optCtrl 优化包优化建议组件
         * @param {number} opttypeid 后端返回的真实的优化建议ID
         * @param {Object} data 优化建议的数据，只是当前查看的优化项的数据
         * @return {Object}
         */
        getModBidViewConf: getModBidViewConf,
        getBudgetDetailConf: getBudgetDetailConf
    };
}($$, baidu, nirvana);