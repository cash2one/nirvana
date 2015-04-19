/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    effectAnalyse/editIdea.js
 * desc:    查看创意
 * author:  yanlingling
 * date:    $Date: 2012/02/15 $
 */

/**
 * 效果分析工具 查看创意
 */
manage.editIdea = new er.Action({
	
	VIEW: 'effectAnalyseIdea',
	
	UI_PROP_MAP : {
		analyseIdeaTable : {
			        type : 'Table',
					
			        fields : '*iedaFields',
					datasource : '*ideaTableData',
				    noScroll:'true',//去掉横向滚动条
					noDataHtml : FILL_HTML.NO_DATA
					
		},
		analysedeaTablePage : { // 分页控件
			page : '*pageNo',
			total : '*totalPage'
		}
		
	
	},
	
	//初始化ui
	CONTEXT_INITER_MAP : {
		analyseIdeaTable : function(callback){
			var me = this,
			    tableTool=nirvana.effectAnalyse.keywordList,
			    winfoid = me.arg.winfoid,
				planid = me.arg.planid,
				unitid = me.arg.unitid,
				item={},
                tablefields = [
				{
	    			field : 'ideainfo',
	    			title : '创意',
	    			width : 620,
					minWidth : 620,
	    			locked : true,
					content : tableTool.ideainfo
	    		}];
				item.winfoid = winfoid;
				item.planid = planid;
				item.unitid = unitid;
			//	console.log(item);
				me.setContext("pageSize",4);
				me.setContext("pageNo",1);
				me.setContext("iedaFields",tablefields);
			    nirvana.aoWidgetAction.getIdeaList(item, tableTool.getIdeaListSuccessHandler(me,callback));
		       // callback();
			
		}
	},
	
	onafterrender : function(){
		//console.log("render edddd");
		//console.log(ui.util.get("analyseIdeaTable").field);
		var me = this,
		    totalPage = me.getContext('totalPage'),
			tableTool=nirvana.effectAnalyse.keywordList;
		   if (totalPage <= 1) {
			        baidu.dom.hide('analyseIdeaPagerDiv');
			    }
		   else {
			        baidu.dom.show('analyseIdeaPagerDiv');
			    }
		ui.util.get('analysedeaTablePage').onselect = tableTool.getIdeaPaginationHandler(me);			//analysePagination
		ui.util.get('analyseIdeaTable').main.onclick = me.getTableInlineHandler();//行内事件编辑器
		ui.util.get('analyseAddIdea').onclick = tableTool.addIdeaHandler(me);//行内事件编辑器
	
	},
	
	onentercomplete: function(){
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
     * 表格行内操作事件代理器
     * 主要对某些操作按钮或者链接按钮执行响应函数的绑定
     */
    getTableInlineHandler: function() {
        var me = this,
		    tableTool=nirvana.effectAnalyse.keywordList;
        return function (e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
				logParams = {},
				type;

            while(target  && target != ui.util.get("analyseIdeaTable").main){
             if(baidu.dom.hasClass(target, 'edit_btn')){
                	type = target.getAttribute('edittype');
                    switch (type) {
                        case 'ideaid':
                            tableTool.editIdeaHandler(target, me);
                            //监控
                            var logparam = {};
                            logparam.idea = 'edit';
                            nirvana.effectAnalyse.lib.logCenter("", logparam);
                            break;
                    }
                	break;
                }
              
				
                target = target.parentNode;
            }
        };
    }
	,
	/**
	 * 获取默认的全清刷新的stateMap
	 */
	getClearStateMap: function(){
		var me = this,
			stateMap = {
				};
		return stateMap;
	}
	
}); 
