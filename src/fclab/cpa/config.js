/**
 * @file cpa工具各种配置及其话术
 * @author guanwei01@baidu.com
 */

fclab = fclab || {};
fclab.cpa = fclab.cpa || {};

// cpa的相关配置
fclab.cpa.config = {
    // 转化类型(网页转化、商桥转化、二跳转化和其它转化类型，默认为网页转化)
    // type取值为1/2/4/8/16：二跳/holmes网页转化/商桥/百度游戏/其他
    transType: [
        {text: '转化（网页）', value: 2},
        {text: '转化（商桥）', value: 4},
        {text: '转化（二跳）', value: 1},
        {text: '转化（其它）', value: 16}
    ],

    // 转化类型内容映射map
    transTypeMap: {
        1: '转化（二跳）',
        2: '转化（网页）',
        4: '转化（商桥）',
        8: '转化（游戏）',// 好像没用到？（归属到“其它”当中）
        16: '转化（其它）'
    },

    // tab
    reportsTab: [
        '转化（网页）',
        '转化（商桥）',
        '转化（二跳）',
        '转化（其它）'
    ],

    // 选择时间单位map
    dateUnitMap: {
        8: '默认',
        5: '分日',
        4: '分周',
        3: '分月'
    },

    // 选择时间单位
    dateUnit: [
        {text: '默认', value: 8},
        {text: '分日', value: 5},
        {text: '分周', value: 4}/*,
        {text: '分月', value: 3}*/
    ],

    // 时间单位“分周”之后
    weekUnit: [
        {text: '周一', value: 1},
        {text: '周二', value: 2},
        {text: '周三', value: 3},
        {text: '周四', value: 4},
        {text: '周五', value: 5},
        {text: '周六', value: 6},
        {text: '周七', value: 7}
    ],

    // 各种提示
    hints: {
        // 选择优化对象右方的操作
        100: '添加',
        101: '取消',
        102: '已添加',

        // title
        200: '添加计划',

        // 选择转化类型旁边的提示
        1000: '每个计划只能选择以下其中某一种转化类型数据进行优化',
        // 选择优化对象旁边的提示
        1001: '暂时只支持按计划统一进行设置，下方只列出所选转化类型当前符合要求的计划',
        // 没有可选计划 - 填充区域
        1002: '暂无可选择计划',
        // 内容提示头
        1003: '所选转化类型暂无符合条件的推广计划，您可以：',
        // 接下来是各种不同情况的提示语
        // 每一种提示语的第二条是相同的
        1004: '同时保证账户内非只有只投移动设备的推广计划。',

        // 网页转化
        2: '检查是否已正确安装百度统计，并保证过去一段时间有足够且稳定的网页转化数据；',
        // 商桥转化
        4: '检查是否已正确安装百度商桥，并保证过去一段时间有足够且稳定的商桥转化数据；',
        // 二跳
        1: '与我们联系，并按要求提供二跳转化数据；',
        // 其他转化
        16: '与我们联系，并按要求提供其他转化监控系统所记录的转化数据  <a href="http://yingxiao.baidu.com/support/fc/detail_11501.html" target="_blank">查看具体要求</a>；',

        // 选择自动设置转化出价
        1005: '系统会自动根据该计划最新的转化表现设置一个合理的出价',
        // 自定义出价 && 1个计划，用的时候需要填充{0}，建议cpa
        1006: '系统建议出价为<span class="cpa-red">{0}</span>元，初次使用工具建议使用系统建议值',
        // 自定义出价 && >= 1个计划
        1007: '系统后续会为每个计划定时更新一个建议出价，建议参考并经常调整',

        // 输入数值判断
        // 不大于0
        1008: '<span class="cpa-red">所输入数值必须大于0！</span>',
        10081: '<span class="cpa-red">出价调整后必须大于0元！</span>',
        // 超出范围
        1009: '<span class="cpa-red">所输入数据必须不能超过999.99！</span>',
        10091: '<span class="cpa-red">出价调整后必须不能超过999.99元！</span>',
        // 小数位超过两位时
        1010: '<span class="cpa-red">所输入数值小数点后不超过两位！</span>',
        10101: '<span class="cpa-red">出价调整后的数值小数点后不超过两位！</span>',
        // 只有一个计划 && 还要判断所输入数值是否不低于mincpa
        1011: '<span class="cpa-red">您所设的出价过低，可能会产生流量锐减的现象</span>',
        10111: '<span class="cpa-red">出价调整后的出价过低，可能会产生流量锐减的现象</span>',

        // 小问号
        // 平均转化出价title
        1012: '平均转化出价',
        // content
        1013: '所选计划下关键词带来一次转化您所愿意支付的平均费用',

        // 小流量实验
        // title
        1014: '小流量实验',
        // content
        1015: '即所选计划只有一半流量接受工具的优化，剩下一半的流量仍然按自己设置的点击出价进行投放',

        // 已添加几个计划，用时需要初始化{0}
        1016: '已添加<span class="cpa-red">{0}</span>个计划',

        // 提交表单的各种验证提示
        1017: '<span class="cpa-red">未选择优化对象！</span>',
        // 有实验在实验中，用时需要初始化{0}
        1018: '所选计划内有{0}个关键词正在使用方案实验工具进行实验，确定添加后这些词将退出实验。',

        1019: '<span class="cpa-red">请输入自定义值！</span>',
        10191: '<span class="cpa-red">请输入数字值！</span>',
        10192: '<span class="cpa-red">请输入需要提高或者降低的值！</span>',
        10193: '<span class="cpa-red">请输入大于0的数字值！</span>',
        1020: '<span class="cpa-red">请先选择转化对象！</span>',

        1021: '修改转化成本',
        1022: '<span class="cpa-red">您原先是系统自动设置！</span>',
        1023: '请输入提高或者降低的数值',
        1024: '请输入自定义数值',
        1025: '只针对自定义转化出价',
        1026: '<span class="cpa-red">请选择修改类型！</span>',
        1027: '<span class="cpa-red">有{0}个计划调整后转化出价超过999.99元，请重新设定！</span>',
        1028: '<span class="cpa-red">有{0}个计划调整后转化出价低于0元，请重新设定！</span>',

        1029: '{0} 至 {1} 计划报告',
        1030: '{0} 至 {1} 计划报告（前后对比）',
        1031: '{0} 小流量报告',
        1032: '报告只显示当前正使用工具的推广计划的转化相关数据，且暂时无法提供当天数据。',
        1033: '报告只显示当前正使用工具的推广计划最新一次小流量实验的数据，且暂时无法提供当天数据。'
    },

    // cpa计划列表table配置
    cpaListTable: {
        id: 'cpa-lists-table',
        type : 'Table',
        select : 'multi',
        sortable : false,
        filterable : false,
        orderBy : '',
        order : '',
        noDataHtml : '',
        dragable : 'true',
        colViewCounter : 'all'
        // fields: {},     
        // datasource : {}
    },

    // cpa计划列表fields表头设置
    cpaListTableFields: [
        // 推广计划名称
        {
            content: function (item) {
                var title = baidu.encodeHTML(item.planname), 
                    content = getCutString(item.planname, 30, "..");
                var html  = [];
                html[html.length] = '<span title=' + title + '>' + content + '</span>';
                // 根据状态判断添加不添加小图标
                item.planstatus != 0
                    && (html[html.length]
                        = '<span class="ui_bubble" bubblesource="cpaPlanStatus" status="' + item.planstatus + '">&nbsp;</span>');
                return html.join('');
            },
            locked: true,
            sortable : false,
            filterable : false,
            field : 'planname',
            title: '推广计划',
            width: 250                      
        },
        // 转化类型
        {
            content: function (item) {
                return item.type >= 8 
                    ? fclab.cpa.config.transTypeMap[16] 
                    : fclab.cpa.config.transTypeMap[item.type];
            },
            locked: true,
            sortable : false,
            filterable : false,
            field : 'type',
            title: '转化类型',
            width: 100   
        },
        // 平均转化出价
        {
            content: function (item) {
                var cpa  = item.cpa == null 
                    ? '系统自动设置' 
                    : (
                        item.cpastatus == 1
                        ? ('<span class="cpa-red">' + item.cpa.toFixed(2) + '</span>')
                        : item.cpa.toFixed(2)
                    );
                var html = [];
                // 判断是否需要添加小电池
                html[html.length] = '<div class="edit_td">';
                html[html.length] = '<span>' + cpa + '</span>';
                html[html.length] = '<a class="edit_btn" edittype="cpabid" labid="' + item.labid + '" control="' + item.cpa + '"></a>';
                if(item.cpa != null && item.cpastatus == 1)
                    html[html.length] = '<span class="ui_bubble" bubblesource="cpaTableBidLow">&nbsp;</span>';
                html[html.length] = '</div>';
                return html.join("");
            },
            locked: true,
            sortable : false,
            filterable : false,
            field : 'cpa',
            title: '平均转化出价',
            width: 130,
            noun : true,
            nounName: "平均转化出价"
        },
        // 小流量试验
        {
            content: function (item) {
                var html = [];
                html.push('<span>' + (
                    item.isab == 0
                        ? '已启用'
                        : '未启用'
                ) + '</span>');
                var dataLog = item.isab == 0
                    ? 'data-log="{target:\'labCpaStopXll_btn\'}"'
                    : 'data-log="{target:\'labCpaStartXll_btn\'}"';
                html.push('<span ' + dataLog + ' labid="' + item.labid + '" class="status_op_btn ' + (
                    item.isab == 0
                        ? 'cpa-xiao-stat-hasstart'
                        : 'cpa-xiao-stat-hasstop'
                ) + '"></span>');
                return html.join('');
            },
            locked: true,
            sortable : false,
            filterable : false,
            field : 'isab',
            title: '小流量实验',
            width: 100,
            noun : true,
            nounName: "小流量实验"
        },
        // 添加时间
        {
            content: function (item) {
                return item.addtime;
            },
            locked: true,
            sortable : false,
            filterable : false,
            field : 'addtime',
            title: '添加时间',
            width: 100   
        },
        // 操作
        {
            content: function (item) {
                return '<a data-log="{target:\'labDeleteCpaPlan_btn\'}" href="javascript:void(0);" cpa-action="del" labid="' + item.labid + '">删除</a>';
            },
            locked: true,
            sortable : false,
            filterable : false,
            field : 'labid',
            title: '操作',
            width: 100   
        },
    ],

    // 计划列表
    cpaPlanTable: {
        id: 'cpa-reports-table',
        type : 'Table',
        sortable : true,
        filterable : false,
        orderBy : '',
        order : '',
        noDataHtml : '-',
        dragable : 'true',
        colViewCounter : 'all'
    },

    // 计划列表无对比字段配置
    cpaPlanFields: {
        // 无对比
        1: [
            // 推广计划名称
            {
                content: function (item) {
                    var title = baidu.encodeHTML(item.planname), 
                        content = getCutString(item.planname, 30, "..");
                    var html  = [];
                    html[html.length] = '<span title=' + title + '>' + content + '</span>';
                    return html.join('');
                },
                locked: true,
                sortable : true,
                filterable : false,
                field : 'planname',
                title: '推广计划',
                align: 'left',
                width: 250      
            },
            // 转化类型
            {
                content: function (item) {
                    return item.type >= 8 
                        ? fclab.cpa.config.transTypeMap[16] 
                        : fclab.cpa.config.transTypeMap[item.type];
                },
                locked: false,
                sortable : true,
                filterable : false,
                field : 'type',
                title: '转化类型',
                align: 'left',
                width: 150    
            },
            // 日期
            {
                content: function (item) {
                    return item.time;
                },
                locked: false,
                sortable : true,
                filterable : false,
                field : 'time',
                title: '日期',
                align: 'left',
                width: 250    
            },
            // 转化
            {
                content: function (item) {
                    return item.trans;
                },
                locked: false,
                sortable : true,
                filterable : false,
                field : 'trans',
                title: '转化',
                align: 'right',
                width: 150    
            },
            // 消费
            {
                content: function (item) {
                    return item.pay;
                },
                locked: false,
                sortable : true,
                filterable : false,
                field : 'pay',
                title: '消费',
                align: 'right',
                width: 150    
            },
            // 平均转化成本
            {
                content: function (item) {
                    return item.avgtrans;
                },
                locked: false,
                sortable : true,
                filterable : false,
                field : 'avgtrans',
                title: '平均转化成本',
                align: 'right',
                width: 150    
            },
            // 转化率
            {
                content: function (item) {
                    return item.transrate;
                },
                locked: false,
                sortable : true,
                filterable : false,
                field : 'transrate',
                title: '转化率',
                align: 'right',
                width: 150    
            }
        ],

        // 有对比
        2: [
            // 推广计划名称
            {
                content: function (item) {
                    var title = baidu.encodeHTML(item.planname), 
                        content = getCutString(item.planname, 30, "..");
                    var html  = [];
                    html[html.length] = '<span class="cpa-compare-item-middle" title=' + title + '>' + content + '</span>';
                    return html.join('');
                },
                locked: true,
                sortable : true,
                filterable : false,
                field : 'planname',
                title: '推广计划',
                align: 'left',
                width: 250   
            },
            // 转化类型
            {
                content: function (item) {
                    var type = item.type >= 8 
                        ? fclab.cpa.config.transTypeMap[16] 
                        : fclab.cpa.config.transTypeMap[item.type];
                    var html = '<span class="cpa-compare-item-middle">' + type + '</span>';
                    return html;
                },
                locked: false,
                sortable : true,
                filterable : false,
                field : 'type',
                title: '转化类型',
                align: 'left',
                width: 140    
            },
            // 日期
            {
                content: function (item) {
                    var html = [];
                    html.push('<div class="cpa-item-timerange">');
                    html.push('<p class="cpa-item-timerange-up">' + item.otime + '</p>');
                    html.push('<p class="cpa-item-timerange-down">' + item.time + '</p>');
                    html.push('</div>');
                    return html.join('');
                },
                locked: false,
                sortable : false,
                filterable : false,
                field : 'time',
                title: '日期',
                align: 'left',
                width: 250    
            },
            // 转化
            {
                content: function (item) {
                    item.otrans    = (+ item.otrans);
                    item.trans     = (+ item.trans);
                    return ui.format(
                        er.template.get('fclabCpaListCompareItem'),
                        item.otrans.toFixed(2),
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: (item.otrans > item.trans ? 100 : item.trans),
                            value: (item.otrans > item.trans ? 100 : item.otrans)
                        }),
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: (item.otrans > item.trans ? item.otrans : 100),
                            value: (item.otrans > item.trans ? item.trans : 100)
                        }),
                        item.trans.toFixed(2),
                        '转化'
                    );
                },
                locked: false,
                sortable : false,
                filterable : false,
                field : 'trans',
                title: '转化',
                align: 'left',
                width: 180    
            },
            // 消费
            {
                content: function (item) {
                    item.opay    = (+ item.opay);
                    item.pay     = (+ item.pay);
                    return ui.format(
                        er.template.get('fclabCpaListCompareItem'),
                        item.opay.toFixed(2),
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: (item.opay > item.pay ? 100 : item.pay),
                            value: (item.opay > item.pay ? 100 : item.opay)
                        }),
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: (item.opay > item.pay ? item.opay : 100),
                            value: (item.opay > item.pay ? item.pay : 100) 
                        }),
                        item.pay.toFixed(2),
                        '消费'
                    );
                },
                locked: false,
                sortable : false,
                filterable : false,
                field : 'pay',
                title: '消费',
                align: 'left',
                width: 180    
            },
            // 平均转化成本
            {
                content: function (item) {
                    item.oavgtrans    = (+ item.oavgtrans);
                    item.avgtrans     = (+ item.avgtrans);
                    return ui.format(
                        er.template.get('fclabCpaListCompareItem'),
                        item.oavgtrans.toFixed(2),
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: (item.oavgtrans > item.avgtrans ? 100 : item.avgtrans), 
                            value: (item.oavgtrans > item.avgtrans ? 100 : item.oavgtrans) 
                        }),
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: (item.oavgtrans > item.avgtrans ? item.oavgtrans : 100),
                            value: (item.oavgtrans > item.avgtrans ? item.avgtrans : 100)
                        }),
                        item.avgtrans.toFixed(2),
                        '平均转化成本'
                    );
                },
                locked: false,
                sortable : false,
                filterable : false,
                field : 'avgtrans',
                title: '平均转化成本',
                align: 'left',
                width: 250    
            },
            // 转化率
            {
                content: function (item) {
                    return ui.format(
                        er.template.get('fclabCpaListCompareItem'),
                        item.otransrate,
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: 100,
                            value: parseFloat(item.otransrate)
                        }),
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: 100,
                            value: parseFloat(item.transrate)
                        }),
                        item.transrate,
                        '转化率'
                    );
                },
                locked: false,
                sortable : false,
                filterable : false,
                field : 'transrate',
                title: '转化率',
                align: 'left',
                width: 180    
            }
        ],

        // 小流量
        3: [
            // 推广计划名称
            {
                content: function (item) {
                    var title = baidu.encodeHTML(item.planname), 
                        content = getCutString(item.planname, 30, "..");
                    var html  = [];
                    html[html.length] = '<span class="cpa-xll-item-middle" title=' + title + '>' + content + '</span>';
                    return html.join('');
                },
                locked: true,
                sortable : true,
                filterable : false,
                field : 'planname',
                title: '推广计划',
                align: 'left',
                width: 250   
            },
            // 转化类型
            {
                content: function (item) {
                    var type = item.type >= 8 
                        ? fclab.cpa.config.transTypeMap[16] 
                        : fclab.cpa.config.transTypeMap[item.type];
                    var html = '<span class="cpa-xll-item-middle">' + type + '</span>';
                    return html;
                },
                locked: false,
                sortable : true,
                filterable : false,
                field : 'type',
                title: '转化类型',
                align: 'left',
                width: 140    
            },
            // 实验日期
            {
                content: function (item) {
                    return '<span class="cpa-xll-item-middle">' + item.time + '</span>';
                },
                locked: false,
                sortable : true,
                filterable : false,
                field : 'time',
                title: '实验日期',
                align: 'left',
                width: 250    
            },
            // 组别
            {
                content: function (item) {
                    var html = [];
                    html.push('<div class="cpa-item-timerange">');
                    html.push('<p class="cpa-item-timerange-up">未优化组</p>');
                    html.push('<p class="cpa-item-timerange-down">优化组</p>');
                    html.push('</div>');
                    return html.join('');
                },
                locked: false,
                sortable : false,
                filterable : false,
                field : 'time',
                title: '组别',
                align: 'left',
                width: 150    
            },
            // 转化
            {
                content: function (item) {
                    item.otrans    = (+ item.otrans);
                    item.trans     = (+ item.trans);
                    return ui.format(
                        er.template.get('fclabCpaListCompareItem'),
                        item.otrans.toFixed(2),
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: (item.otrans > item.trans ? 100 : item.trans),
                            value: (item.otrans > item.trans ? 100 : item.otrans)
                        }),
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: (item.otrans > item.trans ? item.otrans : 100),
                            value: (item.otrans > item.trans ? item.trans : 100)
                        }),
                        item.trans.toFixed(2),
                        '转化'
                    );
                },
                locked: false,
                sortable : false,
                filterable : false,
                field : 'trans',
                title: '转化',
                align: 'left',
                width: 180    
            },
            // 消费
            {
                content: function (item) {
                    item.opay    = (+ item.opay);
                    item.pay     = (+ item.pay);
                    return ui.format(
                        er.template.get('fclabCpaListCompareItem'),
                        item.opay.toFixed(2),
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: (item.opay > item.pay ? 100 : item.pay),
                            value: (item.opay > item.pay ? 100 : item.opay)
                        }),
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: (item.opay > item.pay ? item.opay : 100),
                            value: (item.opay > item.pay ? item.pay : 100) 
                        }),
                        item.pay.toFixed(2),
                        '消费'
                    );
                },
                locked: false,
                sortable : false,
                filterable : false,
                field : 'pay',
                title: '消费',
                align: 'left',
                width: 180    
            },
            // 平均转化成本
            {
                content: function (item) {
                    item.oavgtrans    = (+ item.oavgtrans);
                    item.avgtrans     = (+ item.avgtrans);
                    return ui.format(
                        er.template.get('fclabCpaListCompareItem'),
                        item.oavgtrans.toFixed(2),
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: (item.oavgtrans > item.avgtrans ? 100 : item.avgtrans), 
                            value: (item.oavgtrans > item.avgtrans ? 100 : item.oavgtrans) 
                        }),
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: (item.oavgtrans > item.avgtrans ? item.oavgtrans : 100),
                            value: (item.oavgtrans > item.avgtrans ? item.avgtrans : 100)
                        }),
                        item.avgtrans.toFixed(2),
                        '平均转化成本'
                    );
                },
                locked: false,
                sortable : false,
                filterable : false,
                field : 'avgtrans',
                title: '平均转化成本',
                align: 'left',
                width: 250    
            },
            // 转化率
            {
                content: function (item) {
                    return ui.format(
                        er.template.get('fclabCpaListCompareItem'),
                        item.otransrate,
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: 100,
                            value: parseFloat(item.otransrate)
                        }),
                        fclab.abtestUtil.getBar({
                            height: 10,
                            maxvalue: 100,
                            value: parseFloat(item.transrate)
                        }),
                        item.transrate,
                        '转化率'
                    );
                },
                locked: false,
                sortable : false,
                filterable : false,
                field : 'transrate',
                title: '转化率',
                align: 'left',
                width: 190
            }
        ]
    },

    // 历史删除记录表头设置
    cpaDelTableFields: [
        // 删除时间
        {
            content: function (item) {
                return item.deltime;
            },
            locked: false,
            sortable : false,
            filterable : false,
            field : 'deltime',
            title: '删除时间',
            width: 150            
        },
        // 添加时间
        {
            content: function (item) {
                return item.addtime;
            },
            locked: false,
            sortable : false,
            filterable : false,
            field : 'addtime',
            title: '添加时间',
            width: 150              
        },
        // 计划名称
        {
            content: function (item) {
                var title = baidu.encodeHTML(item.planname), 
                    content = getCutString(item.planname, 30, "..");
                var html  = [];
                html[html.length] = '<span title=' + title + '>' + content + '</span>';
                return html.join('');
            },
            locked: false,
            sortable : false,
            filterable : false,
            field : 'planname',
            title: '计划名称',
            width: 250               
        }
    ]
};