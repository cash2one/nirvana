/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/business/widget.js
 * desc: 扩大商机包相关详情 优化匹配 优化出价 新提词 质量度优化包的新提词
 * author: wanghuijun@baidu.com
 * date: $Date: 2012/05/08 $
 * @deprecated
 */

nirvana.aoPkgControl.widget203 =
nirvana.aoPkgControl.widget204 = 
// 行业领先包，关键词匹配
nirvana.aoPkgControl.widget606 =
// 行业领先包，关键词出价
nirvana.aoPkgControl.widget607 =
new er.Action({
	VIEW: 'aoPkgDetail',
	
	/**
    * 子action不支持STATE_MAP
    */
    STATE_MAP: {},
	
	UI_PROP_MAP: nirvana.aoPkgWidgetCommon.getUI_PROP_MAP(),
    
    /**
    * 详情title
    */
    title : {
        203 : '优化出价',
        204 : '优化匹配',
        // 行业领先包，关键词匹配
        606 : '优化匹配',
         // 行业领先包，关键词出价
        607 : '出价建议'
    },
	
    /**
    * 详情提示
    */
	tip : {
        203 : '<span class="count">%count</span>个关键词建议调整出价，获得更多点击',
        204 : '<span class="count">%count</span>个优质关键词建议调整匹配模式，获得更多点击',
        // 行业领先包，关键词匹配
        606 : '<span class="count">%count</span>个优质关键词建议调整匹配模式，获得更多点击',
        // 行业领先包，关键词出价
        607 : '提高账户左侧展现概率，建议调整 <span class="count">%count</span>个词的出价'
	},
	
    /**
    * 详情表格fields
    */
	fields : {
        203 : [
                nirvana.aoPkgWidgetFields.wordinfo(),
                nirvana.aoPkgWidgetFields.planinfo(),
                nirvana.aoPkgWidgetFields.unitinfo(),
                nirvana.aoPkgWidgetFields.wmatch({ editable: false }),
                nirvana.aoPkgWidgetFields.recmbid(),
                nirvana.aoPkgWidgetFields.bid(),
                nirvana.aoPkgWidgetFields.reason()
        ],
        204 : [
                nirvana.aoPkgWidgetFields.wordinfo(),
                nirvana.aoPkgWidgetFields.planinfo(),
                nirvana.aoPkgWidgetFields.unitinfo(),
                nirvana.aoPkgWidgetFields.bid({ editable: false }),
                nirvana.aoPkgWidgetFields.recmwmatch(),
                nirvana.aoPkgWidgetFields.wmatch(),
                nirvana.aoPkgWidgetFields.reason()
        ],
        // 行业领先包，关键词匹配
        606 : [
                nirvana.aoPkgWidgetFields.wordinfo(),
                nirvana.aoPkgWidgetFields.planinfo(),
                nirvana.aoPkgWidgetFields.unitinfo(),
                nirvana.aoPkgWidgetFields.bid({ editable: false }),
                nirvana.aoPkgWidgetFields.recmwmatch(),
                nirvana.aoPkgWidgetFields.wmatch(),
                nirvana.aoPkgWidgetFields.reason()
        ],
        // 行业领先包，关键词出价
        607 : [
                nirvana.aoPkgWidgetFields.wordinfo(),
                nirvana.aoPkgWidgetFields.planinfo(),
                nirvana.aoPkgWidgetFields.unitinfo(),
                nirvana.aoPkgWidgetFields.wmatch({ editable: false }),
                nirvana.aoPkgWidgetFields.recmbid(),
                nirvana.aoPkgWidgetFields.bid(),
                nirvana.aoPkgWidgetFields.reason()
        ]
	},
	
    /**
    * 详情按钮文字
    */
	btn : {
        203 : '应用所选',
        204 : '应用所选',
        // 行业领先包，关键词匹配
        606 : '应用所选',
        // 行业领先包，关键词出价
        607 : '应用所选'
	},
	
	applyType : {
        203 : 'modBid',
        204 : 'modWmatch',
        // 行业领先包，关键词匹配
        606 : 'modWmatch',
        // 行业领先包，关键词出价
        607 : 'modBid'
	},
	
	CONTEXT_INITER_MAP: {
		// 初始化基本参数，如分页等信息
		init : nirvana.aoPkgWidgetCommon.getInit(),
		
		WidgetTable : function(callback){
            var me = this,
                opttypeid = me.getContext('opttypeid'),
                tableFields = me.fields[opttypeid];
            
			me.setContext('widgetTableFields', tableFields);
			// 获取表格数据
            nirvana.aoPkgWidgetCommon.getDetail(me, callback);
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
