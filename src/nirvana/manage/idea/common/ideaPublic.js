/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:   manage/ideaPublic.js
 * desc:    创意的初始化用到的公用的东西
 * author:  yanlingling
 * date:    $Date: 2012/07/16 $
 */
nirvana.manage.ideaPublic=function(){
	 this.STATE_MAP = {
        startDate : '',    //默认一周前
        endDate : '',
        status  : '100', 		//TODO 创意列表没有状态
        query   :   '', 		//TODO 创意列表没有查询
        queryType   : 'fuzzy', 	//TODO  创意列表没有查询
        orderBy :   '',
        orderMethod :   '',
        pageSize    :   50,
        pageNo      : 1,
        customCol   :   'default',
		navLevel : 'unit',
		unitid : '',
		planid : '',
		aoEntrance : 'Ideainfo', // Planinfo,Unitinfo,Wordinfo,Ideainfo,Monitor,Nav
		wrapper : 'ManageAoWidget'
		//ideatype:1  //本地创意类型，只用于本地创意
    };
   
   
    /**
     *ui初始化相关 
     */
     this.UI_PROP_MAP = {
        calendar : {
            type : 'MultiCalendar',
            value : '*dateRange'    
        },
        
        pageSizeSelect : {
            type : 'Select',
            width : '60',
            datasource : '*pageSizeOption'
        },
        pagination : {
            type : 'Page',
            total : '*totalPage'
        },
        ideaTableList : {
            type : 'Table',
            
            select : 'multi',
                
            sortable : 'true',
            
			filterable : 'true',
			
            orderBy : '',
            
            order : '',
            
            noDataHtml : '*noDataHtml',
			
			dragable : 'true',
			
			colViewCounter : 'all',
			
			scrollYFixed : 'true',
            
            fields: '*tableFields',
            
            datasource : '*ideaListData'
        }
    };
    
    
    /**
     *上下文遍历初始化 
     */
     this.CONTEXT_INITER_MAP = {
        pageSizeOption : function(callback){
			if (!this.arg.refresh) {
				this.setContext('pageSizeOption',nirvana.manage.sizeOption);				
			}
			callback();
       },
        
        optButton : function(callback){
			if (!this.arg.refresh) {
				 this.setContext('runPause',[{
	                text:"启用/暂停",
	                value:-9999
	            },{
	                text:"启用",
	                value:'start'
	            },{
	                text:"暂停",
	                value:'pause'
	            }]);
	          
			}
			 callback();
        },
        
        moreOptButton: function(callback){
        	if (!this.arg.refresh) {
        	this.setContext('moreOpt',[{
	                text:"更多操作",
	                value:-9999
	            },{
	                text:"删除",
	                value:'delete'
	            }]);
	        
	         } 
	         callback();
        },
        
        dateRange : nirvana.manage.getStoredDate([0,1,2,3,4,6]),
        
        tableFields : function(callback){
			var me = this,
				userrole = nirvana.env.userRole,
			 	fcaudit = (userrole && userrole == nirvana.config.WORDADMIN) ? true : false;
			    me.setContext('fcaudit', fcaudit);
			if (!me.arg.refresh) {
				me.ideaTableField = nirvana.manage.ideaTableField = nirvana.manage.ideaLib.getIdeaTableField(me);
				var acname = nirvana.CURRENT_MANAGE_ACTION_NAME;
				if (acname == 'localIdea') {//本地创意和创意公用
					acname = 'idea';
				}

                // 请求创意之前，尝试更新fields及自定义列
                nirvana.fuseSuggestion.controller.init('idea',
                    {
                        starttime: me.getContext('startDate'),
                        endtime: me.getContext('endDate')
                    },
                    function() {
        				nirvana.manage.UserDefine.getUserDefineList(acname, function(){
        					var ud = nirvana.manage.UserDefine, localList = [], data = [], i, len, field;
        					localList[0] = 'ideaid';
        					for (i = 1, len = ud.attrList[acname].length; i < len; i++) {
        						localList[i] = ud.attrList[acname][i];
        					}
        					
        					for (i = 0, len = localList.length; i < len; i++) {
        						field = me.ideaTableField[localList[i]];
        						if (field) {
        							data.push(field);
        						}
        					}
        					me.setContext('tableFields', data);
        					
        					callback();
                        });
                    }
                );
			}
			else {
				callback();
			}
		},
		
       
		ideaData : function(callback) {
			var me = this;
			if(!me.arg.refresh) {
				//me.setTab();   //放到面包屑请求成功以后了
				me.setContext('ideaListData', []);
			}
			callback();
		},

			
		noDataHtml: function(callback){
			if (!this.arg.refresh) {
				this.setContext("noDataHtml", "");
			}
			callback();
		},
        
        /**
         * 获取新建账户状态
         * @param {Object} callback
         */
        getUserType : function(callback) {
            var me = this;
            
            nirvana.manage.getUserType(me, callback);
        }

    };
    
    /**
     *当前状态记录 
     */
     this.nowStat={
		id : null,
		level : null,
		stat : null
	};
	
	
};
nirvana.manage.ideaPublic.prototype={
	 instance:this, //类的当前实例
	
	/**
	 *当前实例 
	 */
	onentercomplete:function(action){
		var  me = action,
		     controlMap = me._controlMap;
			/**所有创意类型的共有方法**/
        
		var crumbsCallback = function(){
			//console.log('crumbsCallback');
			// modified by Leo Wang(wangkemiao) 2012-12-06
			// 在idea.js中增加了方法onafterCrumbsComplete，此处判断是否存在，如果存在则执行
			// 该方法只在面包屑的环境信息初始化完成之后执行
			// 当前只在idea.js中有此方法定义
			me.getIdeaData();
			me.onafterCrumbsComplete && me.onafterCrumbsComplete();
		};

		
		
		me.crumbs.getCrumbsInfo(crumbsCallback);

		//nirvana.manage.SearchTipControl.initSearchComboTip(me);

		//恢复账户树状态
		nirvana.manage.restoreAccountTree(me);

		//批量下载  by liuyutong@baidu.com 2011-8-2
		if(me.getContext("navLevel") == "account"){
		baidu.g('batchDownload_acct').appendChild(nirvana.manage.batchDownload.batchEL);
		}
		// 自动展现的周预算新功能提示
		nirvana.manage.switchBudgetBubble(me);
		   
		  
			
	},
	
	
	/**
	 * render以后的各种事件 
 	 * @param {Object} action
	 */
	onafterrender: function(action,actionName){
        var me = action,
		    controlMap = me._controlMap,
		    ideaLib=nirvana.manage.ideaLib;
       
        //表格loading
        controlMap.ideaTableList.getBody().innerHTML = ''
            + '<div class="loading_area">'
            + '    <img src="asset/img/loading.gif" alt="loading" /> 读取中'
            + '</div>';
        
		//给表格注册:排序事件
		controlMap.ideaTableList.onsort = function(sortField,order){
			me.setContext("orderBy",sortField.field);
			me.setContext("orderMethod",order);
			me.refresh();
		}
		//给表格注册:筛选事件
		controlMap.ideaTableList.onfilter = nirvana.manage.FilterControl.getTableOnfilterHandler(me,'ideaTableList');
        //给表格注册:事件选择
        controlMap.ideaTableList.onselect = ideaLib.selectListHandler(me);
        //给表格注册:行内编辑处理器
        controlMap.ideaTableList.main.onclick = ideaLib.getTableInlineHandler(me);
		
		//启用暂停删除
        controlMap.runPause.onselect = ideaLib.operationHandler(me);
        if(controlMap.moreOpt){//附件创意没有更多操作
            controlMap.moreOpt.onselect = ideaLib.operationHandler(me);
 
        }
       if(controlMap.activeIdea){//附加创意无激活操作
           //激活
        controlMap.activeIdea.disable(true);
        controlMap.activeIdea.onclick = ideaLib.activeClickHandler(me);
       }
        
        
		
		
		//初始化搜索提示
		baidu.g('searchComboTipContent').onclick = nirvana.manage.SearchTipControl.getSearchTipHandler(me,'ideaTableList');
		
		//优化 by linzhifeng@baidu.com 2011-08-29
	    nirvana.manage.setModDialog(me);
        controlMap.calendar.onselect = function(data){
            for(var i in data){
                data[i] = data[i] && baidu.date.format(data[i],'yyyy-MM-dd');
            }
            me.setContext('startDate', data.begin);
            me.setContext('endDate', data.end);
            nirvana.manage.setStoredDate(data);
            me.refresh();
        };
        
        //这里只做保存时间的事儿就行了 因为快捷方式被选的时候上面的onselect也会触发
        controlMap.calendar.onminiselect = function(data){
            nirvana.manage.setStoredDate(data);
        };
        //Tab Handler
        controlMap.tab.onselect = nirvana.manage.tab.getTabHandler(me,controlMap.tab,actionName);
        //pageSizeSelect
        controlMap.pageSizeSelect.onselect = ideaLib.getPageSizeHandler(me);
        //pagination
        controlMap.pagination.onselect = ideaLib.getPaginationHandler(me);
		
		var acname = nirvana.CURRENT_MANAGE_ACTION_NAME;
            if(acname == 'localIdea'){//本地创意和创意公用
              acname = 'idea';
              }
		//自定义列
		controlMap.userDefine.onclick = nirvana.manage.UserDefine.getUserDefineHandler(me, acname , 'ideaTableList');
		//新建创意
		controlMap.addidea.onclick = ideaLib.addIdeaHandler(me);
		//附加tab
		EXTERNAL_LINK.tabInit("ExtraTab");
        //推广时段
        nirvana.manage.initSchedule(me);
		//批量下载 初始化 liuyutong@baidu.com
		nirvana.manage.batchDownload.initCheck();
		me.crumbs=new nirvana.manage.crumbs(me);//顶部面包屑信息
		    
   },
   
   
   onreload:function (action){
     	action.refresh();
   },
   
   onbeforeinitcontext:function (action,level){
       var me=action;
         nirvana.CURRENT_MANAGE_ACTION_NAME =level;
   },
  
   
   onleave:function (action){
     	var me=action;
     	//隐藏搬家历史浮层
		baidu.addClass(baidu.g('downLoadDeviceChange'), 'hide');
     	nirvana.CURRENT_MANAGE_ACTION_NAME ='';
   }
   
   
   
		
	
}
var  ideaPublic = new  nirvana.manage.ideaPublic();  //普通创意实例
var  localIdeaPublic = new  nirvana.manage.ideaPublic();//本地推广信息实例
var  appendIdeaPublic = new  nirvana.manage.ideaPublic();//附加创意实例



