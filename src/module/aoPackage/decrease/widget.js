/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/decrease/widget.js
 * desc: 子项详情子Action逻辑
 * author: wangkemiao@baidu.com
 * date: $Date: 2012/05/09 $
 */

/**
 * 新增添回词的详情，包括计划、单元、关键词被删除 
 */
/**
 * 修改出价 111、116
 * 修改匹配模式 105
 * 被暂停的详情，包括计划、单元、关键词被暂停 106、108、114
 */
nirvana.aoPkgControl.widget106 = // 操作启用 106、108、114
nirvana.aoPkgControl.widget108 = 
nirvana.aoPkgControl.widget114 = 
nirvana.aoPkgControl.widget111 = // 关键词搜索无效，修改出价
nirvana.aoPkgControl.widget116 = // 出价过低，修改出价
nirvana.aoPkgControl.widget105 = // 关键词匹配模式，修改匹配模式
nirvana.aoPkgControl.widget107 = // 被删除，107、109、115
nirvana.aoPkgControl.widget109 =
nirvana.aoPkgControl.widget115 = 
//nirvana.aoPkgControl.widget605 = // 行业领先包，搜索无效优化建议
//nirvana.aoPkgControl.widget705 = // 突降急救包升级版，计划被暂停优化项
//nirvana.aoPkgControl.widget710 = // 突降急救包升级版，单元被暂停优化项
//nirvana.aoPkgControl.widget717 = // 突降急救包升级版，匹配模式缩小优化项
//nirvana.aoPkgControl.widget718 = // 突降急救包升级版，左侧展现概率下降、平均排名下降、展现机会突降
//nirvana.aoPkgControl.widget712 = // 突降急救包升级版，关键词被暂停
//nirvana.aoPkgControl.widget713 = // 突降急救包升级版，关键词搜索无效

new er.Action({
	VIEW: 'aoPkgDetail',
	
	/**
    * 子action不支持STATE_MAP
    */
    STATE_MAP: {},
	
	UI_PROP_MAP: nirvana.aoPkgWidgetCommon.getUI_PROP_MAP({
        WidgetTable : {
			fields : '*widgetTableFields',
			datasource : '*widgetTableData',
			noDataHtml : FILL_HTML.NO_DATA,
			select : 'multi',
			isSelectAll : 'true',
			orderBy : 'decr'
		}
    }),
    
    /**
    * 详情title
    */
    title : {
    	// 被暂停
    	106 : '计划暂停',
    	108 : '单元暂停',
        114 : '关键词暂停推广',
        // 修改出价
        111 : '关键词搜索无效',
        116 : '出价过低',
        // 修改匹配模式
    	105 : '匹配模式缩小',
        // 被删除
        107 : '计划被删除',
    	109 : '单元被删除',
        115 : '关键词已删除'//,
        // 行业领先包，搜索无效
//        605 : '关键词搜索无效',
//        // 突降急救包升级版，计划被暂停优化项
//        705: '计划暂停',
//        // 单元被暂停
//        710: '单元暂停',
//        // 匹配模式缩小
//        717: '匹配模式缩小',
//        // 左侧展现概率下降、平均排名下降、展现机会突降
//        718: '排名下降',
//        // 关键词暂停推广
//        712: '关键词暂停推广',
//        // 关键词搜索无效
//        713: '关键词搜索无效'
    },
	
    /**
    * 详情提示
    */
	tip : {
    	// 被暂停
		106 : '以下计划昨日被暂停，导致展现量突降，建议启用计划，提升推广效果。',
		108 : '以下单元昨日被暂停，导致展现量突降，建议启用单元，提升推广效果。',
        114 : '展现量较大的关键词昨日突被暂停，建议您启用部分优质关键词，提高展现。',
        // 修改出价
        111 : '展现量较大的关键词昨日突变为搜索无效状态，建议您提高出价，保证关键词可以展现。',
        116 : '以下关键词昨日平均排名或展现机会突降，导致点击量突降，建议提高出价以保证关键词推左且恢复排名。',
        // 修改匹配模式
        105 : '以下展现量较大的关键昨日修改匹配模式后展现量突降，建议你采用广泛匹配+否定关键词的黄金组合优化账户投放效果。',
        // 被删除
        107 : '以下计划昨日被删除，导致展现量突降，建议恢复已删除计划中优质的关键词，提升推广效果。',
		109 : '以下单元昨日被删除，导致展现量突降，建议恢复已删除单元中优质的关键词，提升推广效果。',
        115 : '展现量较大的关键词昨日被删除，建议您恢复优质关键词，提高展现。'//,
        // 行业领先包搜索无效
//        605 : '<span class="count">%count</span>个搜索无效词，建议调整出价',
//        // 突降急救包升级版，计划被暂停优化项
//        705: '以下推广计划被暂停，导致点击量突降，建议您启用部分优质计划以提高点击',
//        // 单元被暂停
//        710: '以下推广单元被暂停，导致点击量突降，建议您启用部分优质单元以提高点击',
//        // 匹配模式缩小
//        717: '以下关键词修改匹配模式后导致点击量突降，建议你采用广泛匹配+否定关键词的黄金组合优化账户投放效果',
//        // 左侧展现概率下降、平均排名下降、展现机会突降
//        718: '以下关键词平均排名或展现机会突降，导致点击量突降，建议您优化出价以保证关键词推左且恢复排名',
//        // 关键词暂停推广
//        712: '以下关键词被暂停，导致点击量突降，建议您启用部分优质关键词，提高点击',
//        // 关键词搜索无效
//        713: '以下关键词由于出价过低突变为搜索无效，丧失展现资格，建议您优化出价，提升点击'
    },
	
	/**
    * 详情按钮文字
    */
	btn : {
		// 被暂停
        106 : '启用所选',
        108 : '启用所选',
        114 : '启用所选',
        // 修改出价
        111 : '应用所选',
        116 : '应用所选',
        // 修改匹配模式
        105 : '应用所选',
        // 被删除
        107 : '恢复所选',
        109 : '恢复所选',
        115 : '恢复所选'//,
        // 行业领先包，搜索无效
//        605 : '应用所选',
//        // 突降急救包升级版，计划被暂停优化项
//        705: '启用所选',
//        // 单元被暂停
//        710: '启用所选',
//        // 匹配模式缩小
//        717: '应用所选',
//        // 左侧展现概率下降、平均排名下降、展现机会突降
//        718: '应用所选',
//        // 关键词暂停推广
//        712: '启用所选',
//        // 关键词搜索无效
//        713: '应用所选'
    },
	applyType : {
		// 被暂停
        106 : 'multiRun',
        108 : 'multiRun',
        114 : 'multiRun',
        // 修改出价
        111 : 'modBid',
        116 : 'modBid',
        // 修改匹配模式
        105 : 'modWmatch',
        // 被删除
        107 : 'addWords',
        109 : 'addWords',
        115 : 'addWords'//,
        // 行业领先包，搜索无效
//        605 : 'modBid',
//        // 突降急救包升级版，计划被暂停优化项
//        705: 'multiRun',
//        // 单元被暂停
//        710: 'multiRun',
//        // 匹配模式缩小
//        717: 'modWmatch',
//        // 左侧展现概率下降、平均排名下降、展现机会突降
//        718: 'modBid',
//        // 关键词暂停推广
//        712: 'multiRun',
//        // 关键词搜索无效
//        713: 'modBid'
	},
	
    /**
     * 详情表格fields
     */
	fields : {
    	// 计划被暂停
		106 : [
			nirvana.aoPkgWidgetFields.planinfo({length:70}),
            nirvana.aoPkgWidgetFields.beginvalue({width:90}),
            nirvana.aoPkgWidgetFields.endvalue({width:90}),
            nirvana.aoPkgWidgetFields.decr({width:90}),
            nirvana.aoPkgWidgetFields.pausestat({level:'plan'}),
            nirvana.aoPkgWidgetFields.pauseSuggest()
        ],
    	// 单元被暂停
        108 : [
            nirvana.aoPkgWidgetFields.unitinfo({length:35}),
            nirvana.aoPkgWidgetFields.planinfo({length:35}),
            nirvana.aoPkgWidgetFields.beginvalue(),
            nirvana.aoPkgWidgetFields.endvalue(),
            nirvana.aoPkgWidgetFields.decr(),
            nirvana.aoPkgWidgetFields.pausestat({level:'unit'}),
            nirvana.aoPkgWidgetFields.pauseSuggest()
        ],
    	// 关键词被暂停
        114 : [
            nirvana.aoPkgWidgetFields.wordinfo({length:20, width:20}),
            nirvana.aoPkgWidgetFields.unitinfo({length:20, width:20}),
            nirvana.aoPkgWidgetFields.planinfo({length:20, width:20}),
            nirvana.aoPkgWidgetFields.beginvalue(),
            nirvana.aoPkgWidgetFields.endvalue(),
            nirvana.aoPkgWidgetFields.decr(),
            nirvana.aoPkgWidgetFields.pausestat({level:'word'}),
            nirvana.aoPkgWidgetFields.pauseSuggest()
        ],
        // 修改出价，搜索无效
        111 : [
            nirvana.aoPkgWidgetFields.wordinfo({length:20}),
            nirvana.aoPkgWidgetFields.unitinfo({length:20}),
            nirvana.aoPkgWidgetFields.planinfo({length:20}),
            nirvana.aoPkgWidgetFields.beginvalue(),
            nirvana.aoPkgWidgetFields.endvalue(),
            nirvana.aoPkgWidgetFields.decr(),
            nirvana.aoPkgWidgetFields.bid(),
            nirvana.aoPkgWidgetFields.recmbid()            
        ],
        // 修改出价，排名下降
        116 : [
            nirvana.aoPkgWidgetFields.wordinfo({length:13}),
            nirvana.aoPkgWidgetFields.unitinfo({length:13}),
            nirvana.aoPkgWidgetFields.planinfo({length:13}),
            nirvana.aoPkgWidgetFields.beginvalue({decrtype:'点击量'}),
            nirvana.aoPkgWidgetFields.endvalue({decrtype:'点击量'}),
            nirvana.aoPkgWidgetFields.decr({decrtype:'点击量'}),
            nirvana.aoPkgWidgetFields.bid(),
            nirvana.aoPkgWidgetFields.recmbid(),
            nirvana.aoPkgWidgetFields.reason()
        ],
        // 修改匹配模式
		105 : [
			nirvana.aoPkgWidgetFields.wordinfo({length:15, width:20}),
			nirvana.aoPkgWidgetFields.unitinfo({length:15, width:20}),
            nirvana.aoPkgWidgetFields.planinfo({length:15, width:20}),
            nirvana.aoPkgWidgetFields.beginvalue(),
            nirvana.aoPkgWidgetFields.endvalue(),
            nirvana.aoPkgWidgetFields.decr(),
            nirvana.aoPkgWidgetFields.wmatchChange(),
            {
            	content : lib.field.wmatch(), // nirvana.aoPkgWidgetRender.wmatch(),
				title : '当前匹配模式',
				width : 9
            },
            {
            	content : function(item){
            		return MTYPE[item.recmwmatch];
            	},
				title : '建议匹配模式',
				width : 9
            }
		],
        // 计划被删除
		107 : [
			{
                content: nirvana.aoPkgWidgetRender.addword(15),
                title: '恢复关键词',
                width: 120,
                stable: true
            },
            {
                content: function(item){
                	return '<div class="aopkg_detail_shortTarget">' + nirvana.aoPkgWidgetRender.addtarget(9)(item) + '</div>';
                },
                title: '恢复到',
                width: 240,
                stable: true
            },
            {
	            content: function(item){
			        var bid = +item.recmbid,
			            html;
			                            
			        if (bid) {
			            html = '<span>' + baidu.number.fixed(bid) + '</span>';
			        } else {
			            html = '<span title="使用单元出价">' + baidu.number.fixed(item.unitbid) + '</span>';
			        }
			        return html;
			    },
	            title: '出价',
	            width: 90,
	            stable : true
            },
            {
	            content: function(item){
			        var wmatch = item.recmwmatch,
			            html;
					
					html = '<span>' + MTYPE[wmatch] + '</span>';
					return html;
				},
	            title: '匹配模式',
	            width: 90,
	            stable : true
	        },
            nirvana.aoPkgWidgetFields.beginvalue(),
            nirvana.aoPkgWidgetFields.endvalue(),
            nirvana.aoPkgWidgetFields.decr(),
            {
                content: lib.field.getPlanRenderer(10), //nirvana.aoPkgWidgetRender.planinfo(10, {isGray:true}),
                title: '被删除计划',
                width: 100,
                stable: true
            }
        ],
        // 单元被删除
        109 : [
			{
                content: nirvana.aoPkgWidgetRender.addword(15),
                title: '恢复关键词',
                width: 120,
                stable: true
            },
            {
                content: function(item){
                	return '<div class="aopkg_detail_shortTarget">' + nirvana.aoPkgWidgetRender.addtarget(9)(item) + '</div>';
                },
                title: '恢复到',
                width: 240,
                stable: true
            },
            {
	            content: function(item){
			        var bid = +item.recmbid,
			            html;
			                            
			        if (bid) {
			            html = '<span>' + baidu.number.fixed(bid) + '</span>';
			        } else {
			            html = '<span title="使用单元出价">' + baidu.number.fixed(item.unitbid) + '</span>';
			        }
			        return html;
			    },
	            title: '出价',
	            width: 90,
	            stable : true
            },
            {
	            content: function(item){
			        var wmatch = item.recmwmatch,
			            html;
					
					html = '<span>' + MTYPE[wmatch] + '</span>';
					return html;
				},
	            title: '匹配模式',
	            width: 90,
	            stable : true
	        },
            nirvana.aoPkgWidgetFields.beginvalue(),
            nirvana.aoPkgWidgetFields.endvalue(),
            nirvana.aoPkgWidgetFields.decr(),
            {
                content: lib.field.getUnitRenderer(10), //nirvana.aoPkgWidgetRender.unitinfo(10, {isGray:true}),
                title: '被删除单元',
                width: 100,
                stable: true
            }
        ],
        // 关键词被删除
        115 : [
            {
                content: nirvana.aoPkgWidgetRender.addword(15),
                title: '恢复关键词',
                width: 120,
                stable: true
            },
            {
                content: function(item){
                	return '<div class="aopkg_detail_shortTarget">' + nirvana.aoPkgWidgetRender.addtarget(9)(item) + '</div>';
                },
                title: '恢复到'
            },
            {
	            content: function(item){
			        var bid = +item.recmbid,
			            html;
			                            
			        if (bid) {
			            html = '<span>' + baidu.number.fixed(bid) + '</span>';
			        } else {
			            html = '<span title="使用单元出价">' + baidu.number.fixed(item.unitbid) + '</span>';
			        }
			        return html;
			    },
	            title: '出价',
	            width: 90,
	            stable : true
            },
            {
	            content: function(item){
			        var wmatch = item.recmwmatch,
			            html;
					
					html = '<span>' + MTYPE[wmatch] + '</span>';
					return html;
				},
	            title: '匹配模式',
	            width: 90,
	            stable : true
	        },
            nirvana.aoPkgWidgetFields.beginvalue(),
            nirvana.aoPkgWidgetFields.endvalue(),
            nirvana.aoPkgWidgetFields.decr(),
            {
                content: function(item){
                	return '<div class="aopkg_detail_gray">' + nirvana.aoPkgWidgetRender.origwordinfo(10)(item) + '</div>';
                },
                title: '被删除关键词',
                width: 100,
                stable: true
            }
        ]//,
//        // 行业领先包，搜索无效
//        605 : [
//            nirvana.aoPkgWidgetFields.wordinfo({length:20}),
//            nirvana.aoPkgWidgetFields.planinfo({length:20}),
//            nirvana.aoPkgWidgetFields.unitinfo({length:20}),
//            nirvana.aoPkgWidgetFields.bid(),
//            nirvana.aoPkgWidgetFields.recmbid()
//        ],
//        // 突降急救包升级版，计划被暂停优化项
//        705: [
//            nirvana.aoPkgWidgetFields.planinfo({length: 70}),
//            nirvana.aoPkgWidgetFields.beginvalue({width: 90, decrtype: '点击量'}),
//            nirvana.aoPkgWidgetFields.endvalue({width: 90, decrtype: '点击量'}),
//            nirvana.aoPkgWidgetFields.decr({width: 90, decrtype: '点击量'}),
//            nirvana.aoPkgWidgetFields.pausestat({level:'plan'}),
//            nirvana.aoPkgWidgetFields.pauseSuggest()
//        ],
//        // 单元被暂停
//        710: [
//            nirvana.aoPkgWidgetFields.unitinfo({length:35}),
//            nirvana.aoPkgWidgetFields.planinfo({length:35}),
//            nirvana.aoPkgWidgetFields.beginvalue({decrtype: '点击量'}),
//            nirvana.aoPkgWidgetFields.endvalue({decrtype: '点击量'}),
//            nirvana.aoPkgWidgetFields.decr({decrtype: '点击量'}),
//            nirvana.aoPkgWidgetFields.pausestat({level:'unit'}),
//            nirvana.aoPkgWidgetFields.pauseSuggest()
//        ],
//        // 匹配模式缩小
//        717: [
//            nirvana.aoPkgWidgetFields.wordinfo({length:15, width:20}),
//            nirvana.aoPkgWidgetFields.unitinfo({length:15, width:20}),
//            nirvana.aoPkgWidgetFields.planinfo({length:15, width:20}),
//            nirvana.aoPkgWidgetFields.beginvalue({decrtype: '点击量'}),
//            nirvana.aoPkgWidgetFields.endvalue({decrtype: '点击量'}),
//            nirvana.aoPkgWidgetFields.decr({decrtype: '点击量'}),
//            nirvana.aoPkgWidgetFields.bid({width: 70, editable: false}),
//            nirvana.aoPkgWidgetFields.wmatchChange(),
//            {
//                content : function(item){
//                    return MTYPE[item.recmwmatch];
//                },
//                title : '建议匹配',
//                width : 9
//            },
//            nirvana.aoPkgWidgetFields.wmatch()
//        ],
//        // 左侧展现概率下降、平均排名下降、展现机会突降
//        718: [
//            nirvana.aoPkgWidgetFields.wordinfo({length:13}),
//            nirvana.aoPkgWidgetFields.unitinfo({length:13}),
//            nirvana.aoPkgWidgetFields.planinfo({length:13}),
//            nirvana.aoPkgWidgetFields.beginvalue({decrtype:'点击量'}),
//            nirvana.aoPkgWidgetFields.endvalue({decrtype:'点击量'}),
//            nirvana.aoPkgWidgetFields.decr({decrtype:'点击量', width: 80}),
//            nirvana.aoPkgWidgetFields.wmatch({ editable: false, width: 60 }),
//            nirvana.aoPkgWidgetFields.recmbid({width: 70}),
//            nirvana.aoPkgWidgetFields.bid({width: 70}),
//            nirvana.aoPkgWidgetFields.leftChangeReason()
//        ],
//        // 关键词暂停推广
//        712: [
//            nirvana.aoPkgWidgetFields.wordinfo({length:20, width:20}),
//            nirvana.aoPkgWidgetFields.unitinfo({length:20, width:20}),
//            nirvana.aoPkgWidgetFields.planinfo({length:20, width:20}),
//            nirvana.aoPkgWidgetFields.beginvalue({decrtype:'点击量'}),
//            nirvana.aoPkgWidgetFields.endvalue({decrtype:'点击量'}),
//            nirvana.aoPkgWidgetFields.decr({decrtype:'点击量'}),
//            nirvana.aoPkgWidgetFields.pausestat({level:'word'}),
//            nirvana.aoPkgWidgetFields.pauseSuggest()
//        ],
//        // 关键词搜索无效
//        713: [
//            nirvana.aoPkgWidgetFields.wordinfo({length:20}),
//            nirvana.aoPkgWidgetFields.unitinfo({length:20}),
//            nirvana.aoPkgWidgetFields.planinfo({length:20}),
//            nirvana.aoPkgWidgetFields.beginvalue({decrtype:'点击量'}),
//            nirvana.aoPkgWidgetFields.endvalue({decrtype:'点击量'}),
//            nirvana.aoPkgWidgetFields.decr({decrtype:'点击量'}),
//            nirvana.aoPkgWidgetFields.wmatch({ editable: false, width: 60 }),
//            nirvana.aoPkgWidgetFields.recmbid(),
//            nirvana.aoPkgWidgetFields.bid()
//        ]
	},
	
   
	CONTEXT_INITER_MAP: {
		// 初始化基本参数，如分页等信息
		/*
		init : function(callback) {
            var me = this,
			    pageNo =  me.arg.pageNo || 1,
				opttypeid = me.arg.opttypeid,
				applyType = me.applyType[opttypeid];
			
            me.setContext('widget_title', me.title[opttypeid]);
            me.setContext('widget_btn', me.btn[opttypeid]);
            me.setContext('widget_tabclass', 'hide');
            me.setContext('widget_queryclass', 'hide');
			
            me.setContext('opttypeid', opttypeid);
			
            me.setContext('pageNo', pageNo);
            me.setContext('pageSize', nirvana.aoPkgControl.config.DETAIL_PAGESIZE);
            
			me.setContext('applyType', applyType);
			
			callback();
		},
		*/
		init: nirvana.aoPkgWidgetCommon.getInit(),
		
		WidgetTable : function(callback){
            var me = this,
				opttypeid = me.getContext('opttypeid'),
				tableFields = me.fields[opttypeid];
            
			// 获取表格数据
			// 略有不同，需要修改表头
            nirvana.aoPkgWidgetCommon.getDetail(this, function(data){
				if(data && data.commData){
					var begindate = data.commData.begindate || me.arg.begindate;
					var enddate = data.commData.enddate || me.arg.enddate;
					begindate = new Date(+begindate);
					enddate = new Date(+enddate);
					
					me.setContext('begindate', begindate);
					me.setContext('enddate', enddate);
					
					for(field in tableFields){
						tableFields[field].title =
                            tableFields[field].title.replace(/%begindate/g, baidu.date.format(begindate, 'M月d日'))
												 .replace(/%enddate/g, baidu.date.format(enddate, 'M月d日'));
					}
				}
				else{
				    for(field in tableFields){
                        tableFields[field].title = tableFields[field].title.replace(/%begindate/g, '期初')
                                                 .replace(/%enddate/g, '期末');
                    }
				}
				me.setContext('widgetTableFields', tableFields);
				
				callback();
			}, {
				decrtype : me.arg.params.decrtype
			});
		}
	},
	
	// 子action不能refresh，采用refreshSelf方法，每次相当于重新打开，所以无需区分render与repaint
	onafterrender: function(){},
	
	onafterrepaint: function(){},
	
	onentercomplete: function(){
		var me = this,
		    controlMap = me._controlMap;
		
		nirvana.aoPkgWidgetHandle.basicClickHandler(me);
// 不再使用的tip del by Huiyao 2013.3.1
//        nirvana.aoPkgControl.newTip(this);
	}
});

//nirvana.aoPkgControl.widget802 = // 移动优化包，提高出价
//nirvana.aoPkgControl.widget803 = // 移动优化包，搜索无效
//
//new er.Action({
//    VIEW: 'aoPkgDetail',
//
//    /**
//    * 子action不支持STATE_MAP
//    */
//    STATE_MAP: {},
//
//    UI_PROP_MAP: nirvana.aoPkgWidgetCommon.getUI_PROP_MAP({
//        WidgetTable : {
//            fields : '*widgetTableFields',
//            datasource : '*widgetTableData',
//            noDataHtml : FILL_HTML.NO_DATA,
//            orderBy : 'decr'
//        }
//    }),
//
//    /**
//    * 详情title
//    */
//    title : {
//        //移动优化包
//        802: '优化出价',
//        803: '优化出价'
//    },
//
//    /**
//    * 详情提示
//    */
//    tip : {
//        //移动优化包
//        802: '以下关键词建议调整出价，获得更多移动搜索推广展现 ',
//        803: '以下关键词出价低于最低展现价格，建议修改出价获得移动推广展现资格'
//    },
//
//    /**
//    * 详情按钮文字
//    */
//    btn : {
//        802: '启用所选',
//        803: '应用所选'
//    },
//    applyType : {
//        802 : 'multiRun',
//        803 : 'multiRun'
//    },
//
//    /**
//     * 详情表格fields
//     */
//    fields : {
//        // 移动优化包，提高出价
//        802 : [
//            nirvana.aoPkgWidgetFields.wordinfo({length:20, width:200}),
//            nirvana.aoPkgWidgetFields.planinfo({length:20, width:200}),
//            nirvana.aoPkgWidgetFields.unitinfo({length:20, width:200}),
//            {
//                title : '<div class="table_align_center">移动展现份额<span class="ui_bubble" bubblesource="defaultHelp" bubbletitle="移动展现份额"></span></div>',
//                align : 'left',
//                content : lib.field.getBarRenderer('showrate', '#009900'),
//                width : 110,
//                stable : true
//            },
//            {
//                content: function(item){
//                    var wmatch = item.recmwmatch,
//                        html;
//                    html = '<span>' + MTYPE[wmatch] + '</span>';
//                    return html;
//                },
//                title: '当前匹配',
//                width: 90,
//                stable : true
//            },
//            nirvana.aoPkgWidgetFields.bid({editable: false}),
//            {
//                title : '建议操作',
//                align : 'left',
//                content : function(){
//                    return '<span class="clickable op_bid_pop">优化出价</span>';
//                },
//                width : 150,
//                stable : true
//            }
//        ],
//        // 修改出价，搜索无效
//        803 : [
//            nirvana.aoPkgWidgetFields.wordinfo({length:20}),
//            nirvana.aoPkgWidgetFields.planinfo({length:20}),
//            nirvana.aoPkgWidgetFields.unitinfo({length:20}),
//            {
//                content: function(item){
//                    var wmatch = item.recmwmatch,
//                        html;
//                    html = '<span>' + MTYPE[wmatch] + '</span>';
//                    return html;
//                },
//                title: '当前匹配',
//                width: 90,
//                stable : true
//            },
//            {
//                content: function(item){
//                    return '<span class="status_text">'
//                        + '<span class="status_icon" data="{winfoid："' + item.winfoid + '",bid:"' + item.minbid + '"}"></span>搜索无效</span>';
//                },
//                title: '状态',
//                width: 90,
//                stable : true
//            },
//            nirvana.aoPkgWidgetFields.bid({editable: false}),
//            {
//                title : '建议操作',
//                align : 'left',
//                content : function(){
//                    return '<span class="clickable op_bid_pop">优化出价</span>';
//                },
//                width : 100,
//                stable : true
//            }
//        ]
//    },
//
//    CONTEXT_INITER_MAP: {
//        init: nirvana.aoPkgWidgetCommon.getInit(),
//
//        WidgetTable : function(callback){
//            var me = this,
//                opttypeid = me.getContext('opttypeid'),
//                tableFields = me.fields[opttypeid];
//
//            // 获取表格数据
//            // 略有不同，需要修改表头
//            nirvana.aoPkgWidgetCommon.getDetail(this, function(data){
//                if(data && data.commData){
//                    var begindate = data.commData.begindate || me.arg.begindate;
//                    var enddate = data.commData.enddate || me.arg.enddate;
//                    begindate = new Date(+begindate);
//                    enddate = new Date(+enddate);
//
//                    me.setContext('begindate', begindate);
//                    me.setContext('enddate', enddate);
//
//                    for(field in tableFields){
//                        tableFields[field].title =
//                            tableFields[field].title.replace(/%begindate/g, baidu.date.format(begindate, 'M月d日'))
//                                                 .replace(/%enddate/g, baidu.date.format(enddate, 'M月d日'));
//                    }
//                }
//                else{
//                    for(field in tableFields){
//                        tableFields[field].title = tableFields[field].title.replace(/%begindate/g, '期初')
//                                                 .replace(/%enddate/g, '期末');
//                    }
//                }
//                me.setContext('widgetTableFields', tableFields);
//
//                callback();
//            }, {
//                decrtype : me.arg.params.decrtype
//            });
//        }
//    },
//    onentercomplete: function(){
//        var me = this,
//            controlMap = me._controlMap;
//
//        nirvana.aoPkgWidgetHandle.basicClickHandler(me);
//        // 隐藏按钮
//        ui.util.get('WidgetApply').main.style.display = 'none';
//    }
//});