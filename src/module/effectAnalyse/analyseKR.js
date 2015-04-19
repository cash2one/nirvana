/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    effectAnalyse/analyseKR.js
 * desc:    关键词推荐
 * author:  yanlingling
 * date:    $Date: 2012/02/15 $
 */

/**
 * 效果分析工具 关键词推荐
 */
manage.analyseKR = new er.Action({
	
	VIEW: 'effectAnalyseKR',
	
    // delete by zhujialu

	onafterrender : function() {
		var me = this;
        // 调整缩进。。。
        // KR远征二期内容
        // add by LeoWang(wangkemiao@baidu.com)
        baidu.show('analyseAddSuggestWordsWrap');
        baidu.show('SaveSuggestWordsContainer');
        baidu.show('SaveErrorExpe2');
            var wordlist = [],  //关键词字面列表
                planid=[],      //所选关键词计划
                unitid=[];      //所选关键词单元
            if(!me.arg.queryMap){
                me.arg.queryMap = [];
            }
            
            for(var i = 0; i < me.arg.wordlist.length; i++){
                wordlist.push(baidu.string.encodeHTML(me.arg.wordlist[i]));
            }
            planid = baidu.array.unique(me.arg.planid);
            unitid = baidu.array.unique(me.arg.unitid);
            if(planid.length == 1){// 所选关键词属于同一单元的话，把该单元作为关键词推荐的默认单元
                me.arg.queryMap.planid=planid[0];
            }
            if(unitid.length == 1){// 所选关键词属于同一单元的话，把该单元作为关键词推荐的默认单元
                me.arg.queryMap.unitid=unitid[0];
            }
            me.setContext('wordlist', wordlist);
        /**
         * 根据指定单元的地域信息，planId不传为账户地域
         * @param {Fuction} callback
         * @param {Object} planId
         */
        nirvana.manage.getRegionInfo(function(regions){
            //console.log(2,regions);
            me.setContext('regions', regions);
            var expe = new fc.module.EmbedExpedition(baidu.g('analyseAddSuggestWordsWrap'), {
                entry: 'EAT',
                planid: me.arg.queryMap.planid,
                unitid: me.arg.queryMap.unitid,
                onSuccess: function() {
                    me.onclose();
                    
                    var tableTool = nirvana.effectAnalyse.keywordList, 
                        action = me.arg.action;
                    // 刷新一下表格，去掉复选框
                    var analyseTable = ui.util.get("analyseTableList");
                    analyseTable.render(analyseTable.main);
                    tableTool.showFolders(action);// 刷新表格监控文件夹图
                }
            });
            expe.load(wordlist, regions);
            // add ended
        }, me.arg.queryMap.planid);
	},
	
	onentercomplete: function(){
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	/**
	 * 获取默认的全清刷新的stateMap
	 */
	getClearStateMap: function() {
        // modify by zhujialu
        return {};
	}
	
}); 
