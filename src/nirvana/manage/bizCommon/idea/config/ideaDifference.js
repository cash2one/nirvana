
/*
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:   manage/ideaDifference.js
 * desc:    本地创意和普通 创意不同的地方
 * author:  yanlingling
 * date:    $Date: 2012/07/16 $
 */



//本地创意和普通 创意不同的地方
IDEA_DIFF_CONFIG = {
    
    /**
     * 暂停 ，启用 调用的接口函数
     */
    modPausestatInterface:{
        'idea':fbs.idea.modPausestat,
        'appendIdea':fbs.appendIdea.modPausestat
    }, 
    
   delInterface:{
          'idea':fbs.idea.del,
          'appendIdea':fbs.appendIdea.del
          }
     ,   
     
     /**
      *左侧账户树创意为空时话术 
      */               
     sideNavEmpty:{
          'idea':'创意为空'
          }
     ,       
    /**
     * 激活的接口函数
     */
    activeInterface:{
        'idea':fbs.idea.active
    },   
    
    
     /**
      * 修改缓存的函数
      */ 
    modCatchFun:{ 
        'idea':function(){
          return function(field,data){
            fbs.material.ModCache('ideainfo',field,data)
        }  
        }(),
        
        
        'appendIdea':fbs.appendIdea.getAppendIdeaList.ModCache
    },
    
    
    /**
     * 清空缓存的函数
     */
    clearCacheFun:{
         'idea':function(){
          return function(){
            fbs.material.clearCache('ideainfo');
        }  
        }(),
         'appendIdea':function(){
            fbs.appendIdea.getAppendIdeaList.clearCache();
            fbs.material.clearCache('unitinfo');//删除附加创意影响单元是否有附加创意的状态
            fbs.material.clearCache('planinfo');//删除附件创意影响计划的creatcnt
            /*er.context.set('hasAppendIdea', false);*/
        }
    },
    
    
    
    /**
     * 激活创意时的提示话术
     */
    activeTip:{
         'idea':"您确定激活所选择的创意吗",
      
         'localIdea':"您确定激活所选择的本地推广信息吗"
    },
    
    
    activeTitle:{
         'idea':"激活创意",
      
         'localIdea':"激活本地推广信息",
         'appendIdea':"激活附加创意"
    },
    
    /**
     *启用时话术 
     */
     startTip:{
         'idea':"您确定启用所选择的创意吗",
      
         'localIdea':"您确定启用所选择的本地推广信息吗",
         'appendIdea':"您确定启用所选择的附加创意吗"
    },
    
    
    startTitle:{
         'idea':"启用创意",
      
         'localIdea':"启用本地推广信息",
         'appendIdea':"启用附加创意"
    },
    
    
    /**
     *暂停话术 
     */
     pauseTip:{
         'idea':"您确定暂停所选择的创意吗",
      
         'localIdea':"您确定暂停所选择的本地推广信息吗",
         'appendIdea':"您确定暂停所选择的附加创意吗"
    },
    
    
    pauseTitle:{
         'idea':"暂停创意",
      
         'localIdea':"暂停本地推广信息",
         'appendIdea':"暂停附加创意"
    },
    
    
    /**
     *删除话术 
     */
    deleteTip:{
         'idea':function(len){
            return  '您确定删除所选的' +len+'个创意吗？删除操作不可恢复。';
         },
        'appendIdea':function(len){
            return  '您确定删除所选的' +len+'个附加创意吗？删除操作不可恢复。';
         },
         'localIdea':function(len){
            return  '您确定删除所选的' +len+'个本地推广信息吗？删除操作不可恢复。';
         }
    },
    
    
    deleteTitle:{
         'idea':"删除创意",
      
         'localIdea':"删除本地推广信息",
         'appendIdea':"删除附加创意"
    },
       
     /**
     * 表格第一列名称
     */
    ideaidTitle:{
        'idea':'创意',
        'appendIdea':'蹊径子链'
    },
    
    /**
     *二审链接配置
     */
	auditUrl: {
		"plan": {
		    'sublink': FC_AUDIT_APPEND_IDEA
		},
		"unit": {
			'idea': FC_AUDIT,
			'localIdea': FC_AUDIT_LOCAL_IDEA
			
		}
	},
	
	
    
    /**
     * 表格第一列的渲染规则
     */
    ideaidField:{
        //本地推广信息
        'localIdea':function(action){
                var me = action;
                return function (item) {
                          var  html = [],
                               ideatype=me.getContext('ideatype');
                               html =nirvana.localIdea.localPreview.init(ideatype, item)//new LocalIdeaPreview(ideatype,item).getAllHTML();
                               html ="<div class='edit_td'>" + html + '<a class="edit_btn" id="IdeaEdit_' + item.ideaid + '" edittype="ideaid" ideaid="' + item.ideaid + '"></a></div>';
                           
                            return html;
                   }
        },
         //创意
        'idea':function(action){
                var me = action;
                return function (item) {
                            var tmp = [], className = 'idea noborder', html = [];
                            
                            //创意内容
                            var ideaData = [item.title, item.desc1, item.desc2, item.showurl];
                            tmp = IDEA_RENDER.idea(ideaData, className);
                            
                            var _bc = "";
                            if (item.shadow_title && item.shadow_title != "") {
                                _bc = 'style="background:#ffdfd5"';
                            }
                            
                            
                            var href = item.url;
                            
                            if (tmp.join("").indexOf("<u>") != -1) {
                                tmp[0] = '<div class="' + className + '" ' + _bc + ' title="' + ideaLib.buildIdeaTitleUrl(item) + '您的创意包含了通配符，创意在展现时，将以触发创意展现的关键词替代通配符。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
                            }
                            else {
                                tmp[0] = '<div class="' + className + '" ' + _bc + ' title="' + ideaLib.buildIdeaTitleUrl(item) + '建议您在创意中包含通配符，通配符可以帮助您在创意中插入关键词。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
                            }
                            
                            for (key in item){
                                // 加了个验证，直接转换的话 Object就变成了[object Object]了
                                if(baidu.lang.isString(item[key])) {
                                    item[key] = escapeHTML(unescapeHTML(item[key]));
                                }
                            }
                            
                            
                            if (item.shadow_title && item.shadow_title != "") {
                                // 有修改创意
                                var modIdea = [], 
                                    href = item.shadow_url, 
                                    className = className + ' display_none';
                                var modifiedIdeaData = [item.shadow_title, item.shadow_desc1, item.shadow_desc2, item.shadow_showurl];    
                                modIdea = IDEA_RENDER.idea(modifiedIdeaData, className);
                                
                        
                                if (modIdea.join("").indexOf("<u>") != -1) {
                                    modIdea[0] = '<div class="' + className + '" title="' + ideaLib.buildIdeaTitleUrl(item,true) + '您的创意包含了通配符，创意在展现时，将以触发创意展现的关键词替代通配符。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
                                } else {
                                    modIdea[0] = '<div class="' + className + '" title="' + ideaLib.buildIdeaTitleUrl(item,true) + '建议您在创意中包含通配符，通配符可以帮助您在创意中插入关键词。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
                                }
                                tmp[tmp.length] = modIdea.join("");
                                tmp[tmp.length] = '<p style="text-align:right"><a href="javascript:void(0);" onclick="viewIdeaSwap(this, ' + item.ideaid + ', ' + item.shadow_ideaid + ');return false" data-log="{target:\'viewIdeaSwap' + item.ideaid + '-btn\'}">查看修改后创意及状态</a></p>';
                        
                                
                            }
                            
                            html[html.length] = '<div class="edit_td">';
                            html[html.length] = '<div class="idea_wrapper">' + tmp.join("") + '</div>';
                            html[html.length] = '<a class="edit_btn" id="IdeaEdit_' + item.ideaid + '" edittype="ideaid" ideaid="' + item.ideaid + '"></a>';
                            html[html.length] = '</div>';
                            
                            return html.join('');
                        }
        
                },
             //附加创意
             appendIdea: function(action){
			 	var me = action;
				
			 	return function(item){
			 		var appendIdeaType = me.getContext("appendIdeaType");
			 		return appendIdeaLib.creatIdeaField[appendIdeaType](item);
			 	}
			 }
    }
};
