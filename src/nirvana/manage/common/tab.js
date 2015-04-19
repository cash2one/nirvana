/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:   manage/tab.js
 * desc:    tab的公用逻辑
 * author:  yanlingling
 * date:    $Date: 2012/07/16 $
 */
nirvana.manage.tab = {
	allTabShowChar: ["推广计划", "推广单元", "创意", "关键词", "本地推广信息","附加创意"],//tab显示字面
    
	allTabShow: ["推广计划", "推广单元", "创意", "关键词", "本地推广信息","附加创意"],//tab显示字面
	
	allTab: ["plan", "unit", "idea", "keyword", "localIdea",'appendIdea'],
	
	/**
	 *设置某个action的tab信息 
	 */
	setTabInfor: function(action){
	     var me = this,
		    cntInfo, 
		    index=0,
		    allTabShow, 
		    tabLen,
		    result={},
		    allTab,
		    instance = action,
		    datalevel =  nirvana.CURRENT_MANAGE_ACTION_NAME,
		    navlevel = instance.getContext('navLevel'),	
		    //local =instance.getContext('ideaTypeForCrumbs');
		    local = 0;//暂时固定写出普通创意，方便后来合本地商户代码。。
	        me.showNewTip(5);//附加创意显示new的提示
		var allTabShow = baidu.object.clone(me.allTabShow);//防止产生脏数据 
		
		allTab= baidu.object.clone(me.allTab);
		tabLen = allTabShow.length;	
		index = baidu.array.indexOf(me.allTab,datalevel);
		if (index > -1 && index < tabLen) {
			//allTabShow[index] += cntInfo;
			if(navlevel!='account'){//若是账户层级，所有的tab都显示
				switch (+local) {
				case 0://普通创意
				    allTabShow.splice(4, 1);
					allTab.splice(4, 1);
					break;
				
				default: //除了0以外都是本地创意
				     /*if(datalevel=='idea'){//本地创意的时候，而此时的datalevel是idea,账户树计划的时候会出现这种情况
				    	var path = '/manage/localIdea';
				    	var query= er.locator.getQuery();
				    	 er.locator.redirect(path+'~'+query);//重定向为正确的，这时候控制台会报出一些错，是因为重定向之前的action还在继续执行，忽视之
				    	 return;
				    }*/
				    allTabShow.splice(2, 1);
					allTab.splice(2, 1); 
					break;
					
			}
			switch (navlevel) {
				case "plan"://计划层级
					allTabShow.shift();
					allTab.shift();
					break;
				case "unit"://单元层级
					allTabShow.shift();
					allTabShow.shift();
					allTab.shift();
					allTab.shift();
					break;
				default:
					break;
			}
			}else{  //账户层级把本地商户先去掉，等合并本地商户代码的时候把这段去掉
			       allTabShow.splice(4, 1);
                   allTab.splice(4, 1); 
			}
			
			var finalIndex = baidu.array.indexOf(allTab,datalevel);//真的tabIndex
		
			result.allTabShow=allTabShow;
			result.tabIndex=finalIndex;
			
		}
		instance.setContext('tab', result.allTabShow);//tab数据初始化
		instance.setContext('tabindex', result.tabIndex);//tab位置
		//instance._controlMap.tab.render(instance._controlMap.tab.main);
		instance.repaint();
	},
	
	
	/**
	 * 渲染当前tab中表格数据的个数
	 */

    renderTabCount:function(action,cnt) {
        var me = action, tab = me._controlMap.tab,
           tabTitle = me.getContext('tab'), 
           index = me.getContext('tabindex'), 
           cntInfo = '<sup>(' + cnt + ')</sup>',
           temp = '';
        if(tabTitle && tabTitle[index]) {
            tabTitle[index] = tabTitle[index].replace(/<sup>([^>]*)<\/sup>/g, '');
            
            if(tabTitle[index].indexOf('<span')!=-1){//有 new的提示
                temp =  tabTitle[index].slice(tabTitle[index].indexOf('<span'),tabTitle[index].length);
                tabTitle[index] = tabTitle[index].replace(temp, '');
            }
            tabTitle[index] += cntInfo;
            tabTitle[index] += temp;
            me._controlMap.tab.render(me._controlMap.tab.main);
        }
    }
,
	
	
	/**
	 * tab切换事件
	 * @param {Object} tab		tab控件对象
	 * @param {Object} action	action对象
	 * @param {Object} currentLevel	当前数据层级  汉字
	 */
     getTabHandler : function (action,tab,currentLevel) {
        var me = this,
            tab = tab,
            currentLevel=currentLevel;
          return function (tabIndex) {
           var title = tab.title[tabIndex];
            if(title=='推广计划' && currentLevel!='推广计划'){
                me.goToLocWithInfo('plan',action);
            }else if(title=='推广单元' && currentLevel!='推广单元'){
                me.goToLocWithInfo('unit',action);
            }else if(title=='创意' && currentLevel!='创意'){
                me.goToLocWithInfo('idea',action);
            }else if(title=='关键词' && currentLevel!='关键词'){
                me.goToLocWithInfo('keyword',action);
            }else if(title=='本地推广信息' && currentLevel!='本地推广信息'){
                me.goToLocWithInfo('localIdea',action);
            }else if(title.indexOf('附加创意')!=-1 && currentLevel!='附加创意'){
                me.goToLocWithInfo('appendIdea',action);
            }
            
        };
    },
    
    
   /**
    *拼接url，并进行跳转 
    */
   goToLocWithInfo : function (type,action) {
        var me = action,
			navLevel = me.getContext('navLevel'),
			query = ['~ignoreState=true&navLevel=' + navLevel];
        
		switch (type){
            case 'plan':
                er.locator.redirect('/manage/plan' + query.join(''));
                break;
            case 'unit':
                var planId = me.getContext('planid');
                var planName =  encodeURIComponent(me.getContext('planname'));
                
                if(planId && planName){
					query[query.length] = ['&planid=' + planId];
                }
                er.locator.redirect('/manage/unit' + query.join(''));
                break;
            
            case 'keyword':
                var planId = me.getContext('planid'),
                    planName = window.encodeURIComponent(me.getContext('planname')),
                    unitId = me.getContext('unitid'),
                    unitName = window.encodeURIComponent(me.getContext('unitname'));
                
                if(planId && planName){
					query[query.length] = ['&planid=' + planId];
                    
                    if(unitId && unitName){
						query[query.length] = ['&unitid=' + unitId];
                    }
                }
                
                er.locator.redirect('/manage/keyword' + query.join(''));
                break;
            case 'idea':
                var planId = me.getContext('planid'),
                    planName = window.encodeURIComponent(me.getContext('planname')),
                    unitId = me.getContext('unitid'),
                    unitName = window.encodeURIComponent(me.getContext('unitname'));
                
                if(planId && planName){
					query[query.length] = ['&planid=' + planId];
                    
                    if(unitId && unitName){
						query[query.length] = ['&unitid=' + unitId];
                    }
                }
                
                er.locator.redirect('/manage/idea' + query.join(''));
                break;
              case 'localIdea':
               var planId = me.getContext('planid'),
                    planName = window.encodeURIComponent(me.getContext('planname')),
                    unitId = me.getContext('unitid'),
                    unitName = window.encodeURIComponent(me.getContext('unitname'));
                
                if(planId && planName){
					query[query.length] = ['&planid=' + planId];
                    
                    if(unitId && unitName){
						query[query.length] = ['&unitid=' + unitId];
                    }
                }
                
                er.locator.redirect('/manage/localIdea' + query.join(''));
                break;
               case 'appendIdea':
               var planId = me.getContext('planid'),
                    planName = window.encodeURIComponent(me.getContext('planname')),
                    unitId = me.getContext('unitid'),
                    unitName = window.encodeURIComponent(me.getContext('unitname'));
                
                if(planId && planName){
                    query[query.length] = ['&planid=' + planId];
                    
                    if(unitId && unitName){
                        query[query.length] = ['&unitid=' + unitId];
                    }
                }
                
                er.locator.redirect('/manage/appendIdea' + query.join(''));
                break;
              
        }
              
    },
    
    showNewTip:function(index){
         var me = this,
             showdata = me.allTabShow;
             if(me.shouldShow(appendIdeaConfig.NEW_TIP_HIDE_DATE)){
                 var temp  = me.allTabShowChar[index],
                     newTip = "<span class='ui_bubble' bubblesource='newProTip'  bubbletitle='"+temp+"'   bubbleContent='"+appendIdeaConfig.NEW_TIP_CHAR+"' >&nbsp;</span>"
                     me.allTabShow[index] = temp + newTip;
             }
   },
    
    /**
     * 当前时间>enddate返回false
     * @param {Object} enddate
     */
    shouldShow:function(enddate){
        var curDate = new Date(),
            endDate = baidu.date.parse(enddate);
           return curDate>endDate?false:true;
           
    }
}

