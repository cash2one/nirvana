/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    manage/idea.js
 * desc:    推广管理
 * author:  chenjincai
 * date:    $Date: 2011/01/06 $
 */

/**
 * @namespace 创意列表模块
 */

manage.ideaList = (function(){
	
    var lib = nirvana.idea.normalIdea.lib;
	
	//普通创意的ideaPublic特殊化处理 
	lib.moreOptSpecial();
	
	return new er.Action({
     
	VIEW: 'ideaList',
    STATE_MAP : ideaPublic.STATE_MAP,
    UI_PROP_MAP :ideaPublic.UI_PROP_MAP,
    CONTEXT_INITER_MAP :ideaPublic.CONTEXT_INITER_MAP ,
    nowStat :ideaPublic.nowStat,
	
	/**
	 *面包屑数据获取之后的回调函数 
	 */
	onafterCrumbsComplete : function(){
		var me = this;
		// wanghuijun 2012.11.30
        // 账户优化初始化
        // ideaLib.changeAoParams(me);
        // nirvana.aoControl.init(me);
        // wanghuijun 2012.11.30
        // 模块化实践，ao按需加载
        $LAB.script(nirvana.loader('proposal'))
            .wait(function() {
                ideaLib.changeAoParams(me);
                nirvana.aoControl.init(me);
            });
        // wanghuijun 2012.11.30

		nirvana.aoPkgControl.popupCtrl.init();
		
		//面包屑数据返回后，根据计划属性设置更多操作的内容
		lib.setMoreOpt(this);
	},
	
	
	
    onentercomplete : function(){
		var me = this;
		ideaPublic.onentercomplete(me);

	},
    
    onafterrender : function(){
        var me = this;
        ideaPublic.onafterrender(me,"创意");
       //全投搬家历史记录下载
	    nirvana.manage.allDeviceHisDownLoad();
           //注册工具箱导入方法
        ToolsModule.setImportDataMethod(function(){
            var selectedList = me.selectedList,
                data = me.getContext('ideaListData'),
                res = {
                    level : 'idea',
                    data : []
                },
                i, len;
            
            if (selectedList && selectedList.length > 0){
                for(i = 0, len = selectedList.length; i < len; i++){
                    res.data.push(data[selectedList[i]]);
                }
            }
            return res;
        });
    },
    
    
    
	//获取创意列表
	getIdeaData: function(){
		var me = this, param = {
			starttime: me.getContext('startDate'),
			endtime: me.getContext('endDate'),
			limit: nirvana.limit_idea,
			onSuccess: ideaLib.getIdeaDataHandler(me),
			onFail: function(){
				ajaxFailDialog();
			}
		};
		
		if (me.getContext("unitid")) {
			param.condition = {
				unitid: [me.getContext("unitid")]
			};
		}
		else 
			if (me.getContext("planid")) {
				param.condition = {
					planid: [me.getContext("planid")]
				};
			}
		ideaLib.getIdeaData(me,param);
		
	},
    newTableModel: new nirvana.newManage.TableModel({
        level: 'idea'
    }),

	
	onreload : function(){ 
		ideaPublic.onreload(this);
	},
	
   onbeforeinitcontext : function(){
        var me = this;
        ideaPublic.onbeforeinitcontext(this,'idea');
      
   },
   
    
    onleave : function(){
         ideaPublic.onleave(this);
    }
	
}); 
})();



