ToolsModule.effectAnalyse = new ToolsModule.Action(
        'effectAnalyse',
        {
            /**
             * 视图模板名，或返回视图模板名的函数
             */
            VIEW : 'effectAnalyse',

            /**
             * 要保持的状态集合。“状态名/状态默认值”形式的map。
             */
            STATE_MAP : {
                'effectTargetType' : 2,
                'flashItemOptionSelected' : 1,
                'effectMouseType' : 0,
				'currentParams' : {},
				'funnelData' : {},
				'extraData' : {},
				'listData' : [],
				'statTableData' : {},

				'flashPointAll' :[],
				'currentXfield' : '展现',
				'currentYfield' : '点击',
				/*************add by yanlingling***************************/
				'analysePageNo':1,//当前页
				'analysePageSize':20,//当前页大小
				'allTableData':[],//表格所有数据
				'avgData':[],//全部数据的均值，表尾数据
				'filteredAllTableData':[]//过滤之后表格所有数据
				
			  
			  
				/**************end add**************************/

				

                
            },
            /**
             * 在模板中写一长串的控件属性会难以理解。该属性能以“控件id/属性集合”的形式在外部书写控件属性，使格式更清晰。
             */
            UI_PROP_MAP : {
                EffectanaCalendar : {
	                value : '*effectDateRange',
	                availableRange : '*effectCalendarAvailableRange',
	                miniOption : '*effectMiniOption'
               },
               // 物料列表控件
                EffectMaterialList : {
                  //定义初始化属性
                    level : '*effectMaterialType',
                    form : 'material',
                    width : '450',
                    height : '300',
                    onAddLeft : '*effectAddObjHandler',
                    tableOption : '*effectMaterialTableOptions',
                    onclose : '*effectMaterialCloseHandler',
                    needDel : 'true',
                    addWords : '*addedWords',
                    noDataHtml : FILL_HTML.EXCEED_LIST.replace(/%s/, '效果分析')
                },
                
				flashStatTable:{
					type : 'Table',
		            sortable : 'false',
		            orderBy : '',
		            order : '',
		            noDataHtml : FILL_HTML.NO_DATA,
		            fields: '*flashStatTableFields',      
		            datasource : '*flashStatTableData'
				},

	            /******add by yanlingling*********/
				//用户选择数据表格控件
				analyseTableList : {
					type : 'Table',
					select : 'multi',
					sortable : 'true',
					filterable : 'true',
					orderBy : '',
					order : '',
					noDataHtml :FILL_HTML.NO_DATA,
					dragable : 'true',
					colViewCounter : 'all',
					fields: '*analyseTableFields',
					datasource : '*analyseListData'
				},
				
                 
			   //页码选择控件
				analysePagination : {
					type : 'Page',
					page : '*analysePageNo',
					total : '*totalPage'
				},
				analysePageSizeSelect : {//每页行数选择
					type : 'Select',
					width : '80',
					datasource : '*pageSizeOption'
				}

				/************end of add*******************/

            },

            /**
             * 初始化context的函数集合，name/value型Object。其value为Function的map，value
             * Function被调用时this指针为Action本身。value
             * Function的形参需要有一个callback参数，参数为Function类型，手工回调。
             */
            CONTEXT_INITER_MAP : {
                /**
                 * 初始化
                 */
                init : function(callback) {
                    var me = this;
                    me.initEffectMaterialSelect();
                    callback();
                },
                effectCalendar:function(callback){
                //设置effectMiniOption的值，昨天、最近七天、上周、本月
                //根据参数判断是否是第一次进入页面，第一次进入则初始化日历起始和结束时间（最近31天）。不是第一次进入就显示上次选择的日期范围。
                    var me = this;
					me.setContext("effectMiniOption",[0,1,2,3]);
		            var params = me.getContext('currentParams');
		            
		            if(params && params.starttime && params.endtime && params.starttime != '' && params.endtime != ''){
		              //  console.log('here...');
						me.setContext('effectDateRange', {
		                    begin: baidu.date.parse(params.starttime),
		                    end: baidu.date.parse(params.endtime)
		                });
		            } else {				
		                //没有params的时候是第一次进入
		                //进行初始化，默认最近七天
		                var dateRange = nirvana.util.dateOptionToDateValue(1); //最近七天
		                me.setContext('effectDateRange', dateRange);
		                //ftttttt
					//	var tmpStart = new Date(2012,2,16);
						var rangeEndDate = new Date();
		                rangeEndDate.setFullYear(dateRange.end.getFullYear());
		                rangeEndDate.setMonth(dateRange.end.getMonth());
		                rangeEndDate.setDate(dateRange.end.getDate()); //当天不可选，so不+1...
						
						var serviceTime = new Date(nirvana.env.SERVER_TIME * 1000);
					 						
						if(serviceTime.getDate() == 1){
							me.setContext("effectMiniOption",[0,1,2]);
						}else if(serviceTime.getDate() == 2 && baidu.date.format(serviceTime,'HHmmss') < '080000'){
							me.setContext("effectMiniOption",[0,1,2]);
						}
						serviceTime.setDate(serviceTime.getDate() - 32);//可选从昨天开始起往前的31天
		                me.setContext('effectCalendarAvailableRange', {
		                    begin : serviceTime,
		                    end : rangeEndDate
		                });
						
		            }
					callback();
                },
                effectMaterial : function (callback) {
                    // 初始化物料选择器的值
                  // 物料选择器
                    this.setContext('effectMaterialType',['user','plan']);
                    this.setContext('effectMaterialTableOptions', {width:450, height:200});
                    this.setContext('effectAddObjHandler', this.addObjHandler());
                    this.setContext('effectMaterialCloseHandler', this.effectMaterialCloseHandler);
                    callback();
                },
				/**
                 * 初始化flash指标选择框
                 */
                select: function(callback){
					var me = this;
					if (!me.getContext('flashItemOption')) {
						me.setContext('flashItemOption', nirvana.effectAnalyse.lib.flashItemsOptions);
						callback();
					}
				},
				
               /**************add by yanlingling*******************/

			  //表格根据用户自定义列进行初始化
			 tableFieldInit:function(callback){

			  	var me = this;
				nirvana.effectAnalyse.keywordList.initTableFields(me);
				nirvana.manage.UserDefine.getUserDefineList('analyse', function(){
				var ud = nirvana.manage.UserDefine,
					localList=[],
					lastLocalList = me.getContext('lastLocalListWord'),
				    data = [],
					i, len;
			   for (i = 0,len = ud.attrList['analyse'].length; i < len; i++)	{
					localList[i] = ud.attrList['analyse'][i];
				}
				var tempAll = nirvana.effectAnalyse.keywordList.allTableFields;
				data.push(tempAll[localList[0]]);
				data.push(tempAll["editIdea"]);//手动添加创意列
				for (i = 1, len = localList.length; i < len; i++){
					data.push(tempAll[localList[i]]);
				}
				me.setContext('analyseTableFields', data);
				
				localList = baidu.json.stringify(localList);				
				if (!lastLocalList || lastLocalList != localList){
					ui.util.get('analyseTableList') && ui.util.get('analyseTableList').resetTableAfterFieldsChanged();
					me.setContext('lastLocalListWord', localList);
				}
				me.setContext('lastLocalListWord', localList);
				me.setContext('totalPage', me.getContext("totalPage"));
				me.setContext('analysePageNo', me.getContext("analysePageNo"));
				callback();
			});
		     },
			  
			  //每页显示行数选择控件
			  pageSizeOption : function (callback){
			    	var me = this;
						me.setContext('pageSizeOption',nirvana.manage.sizeOption);
						callback();
			  }
			 
			  
			  /**************end add*******************/
            },
            
            

            /**
             * 完成视图更新后最后会触发事件
             */
            onentercomplete : function() {
                
            },
            onafterrender: function(){
                var me = this,
                    controlMap = me._controlMap,
                    EffectMaterialSelected = controlMap.EffectMaterialSelected,
                    EffectMaterialList = controlMap.EffectMaterialList,
					statTable = controlMap.flashStatTable,
					fc = nirvana.effectAnalyse.flashControl;
                		
                baidu.addClass('EffectMaterialListWrap', 'hide');
                baidu.g('EffectLevelOptionsDiv').onclick = me.typeTabHandler();
				baidu.g('EffectAnalyseOptions').onclick = this.closeEffectMaterial();
                EffectMaterialSelected.onaddclick = me.openMaterialSelect();
				
				controlMap.EffectanaCalendar.onminiselect = function(data){
		       
				//由于不提供当天的日期选择，所以本月实际上不是本月，是本月-1天……= =
					if (data == 3) {
						controlMap.EffectanaCalendar.value.end = me.getContext('effectCalendarAvailableRange').end;//controlMap.EffectanaCalendar.view.end;
					}
				};
				
				/**为flash右侧的统计小表格添加象限选择事件处理
				 * 1改变选中行背景色，2调用flash方法进行整象限切换 
				 */	
				baidu.on('analyserFlashStat', 'click', function(e) {
		            var e = e || window.event,
		                target = e.target || e.srcElement,
		                tagName = target.tagName.toLowerCase();
		            if (tagName == 'a' && target.rel != '') {
		                var index = me.getContext('currentSelectRow');
						    me.setContext('currentSelectRow',target.rel);
						    //通知flash选中某个区域
						    var flashAreaIndex = Number(target.rel) + 1;
						    invokeFlash('analyserFlash','selectByArea2Flash',[flashAreaIndex]);
							//监控
							var logparam = {};
                            logparam.flashEventType = 8;
                            nirvana.effectAnalyse.lib.logCenter("flash",logparam);
										              
		            }
		            baidu.event.preventDefault(e);  
		        });
				ui.util.get('EffectAnaBtn').onclick = function(){
					me.sendEffectRequest();
				};
				
				ui.util.get('flashItemsSelect').onselect = function(itemValue) {
                    if (itemValue == me.getContext('flashItemOptionSelected')) {
                        return false;
                    }
                    me.setContext('flashItemOptionSelected', itemValue);
					fc.displayAnalyseFlashChart(me);
					//监控
                    var logparam = {};
                    logparam.flashItem = itemValue;
                    nirvana.effectAnalyse.lib.logCenter("flash",logparam);
                };
				baidu.g('effectMouseStyle').onclick = function(e){
                    var e = e || window.event, 
                       tar = e.target || e.srcElement, 
                       label = tar.id;
                    
                    if (label == '' || label == 'effectMouseStyle') {
                        return;
                    }
                    var index = Number(tar.value);
                    invokeFlash('analyserFlash','setOperationMode2Flash',[index]);
					me.setContext('effectMouseType',index);
					//监控
					var logparam = {};
					logparam.flashMouseType = index;
                    nirvana.effectAnalyse.lib.logCenter("flash",logparam);
					//baidu.event.preventDefault(e);
                };
				
				
				var flashContainer = baidu.g("analyserFlashContainer");
				if (flashContainer.addEventListener) {
					flashContainer.addEventListener('DOMMouseScroll', fc.scrollFunc, true);
				}
					flashContainer['onmousewheel'] = fc.scrollFunc;
				
				me._setMaterialSelect(me.getContext('effectTargetType'));
				if(me.getContext('effectSelectedAutoState')){
					//不管是否勾选物料进入，都默认先发一次请求。
					me.sendEffectRequest();
				}
				
				baidu.g('EffectUseGuide').onclick = function(){
					me.startGuide();
					baidu.g('EffectUseGuide').blur();
					//监控
                    var logparam = {};  
                    logparam.useGuide = true;
                    logparam.path = "Tools_effectAnalyse";
                    nirvana.effectAnalyse.lib.logCenter("sendRequest",logparam);
				};
				/*********add by yanlingling****************/
				var tableTool = nirvana.effectAnalyse.keywordList,
				    tableList=ui.util.get('analyseTableList');
				tableList.main.onclick = tableTool.getTableInlineHandler(me);
				ui.util.get('analysePagination').onselect = tableTool.getPaginationHandler(me);			//analysePagination
				//ui.util.get("analyseTableList").onsort = tableTool.getSortHandler(me);			//排序
				ui.util.get('UserDefineForAffect').onclick = nirvana.manage.UserDefine.getUserDefineHandler(me, 'analyse', 'analyseTableList',false,"UserDefineForAffect",tableTool.userDefineOk(me),tableTool.userDefineDilogShowHandler(me),tableTool.userDefineDilogCloseHandler);
				ui.util.get('analyseModBid').onclick= tableTool.modBidClickHandler(me);
				ui.util.get('analyseModMatch').onclick= tableTool.modWmatchClickHandler(me);
				ui.util.get('analyseAddMonitor').onclick= tableTool.monitorClickHandler(me);
				ui.util.get('analyseDownLoad').onclick= tableTool.downLoadHandler(me);
				ui.util.get('analysekr').onclick= tableTool.analysekrHandler(me);
				ui.util.get('analysePageSizeSelect').onselect = tableTool.getPageSizeHandler(me);			//historyPageSizeSelect
	            tableList.onsort = tableTool.sortHandler(me);
				//筛选
				//alert(tableList);
				tableList.onfilter = nirvana.manage.FilterControl.getTableOnfilterHandler(me,'analyseTableList',tableTool.filterChangeHandler(me),true);
	   
				//设置按钮禁用
				ui.util.get("analyseModBid").disable(1);
				ui.util.get("analyseModMatch").disable(1);
				ui.util.get("analyseAddMonitor").disable(1);
				ui.util.get("analysekr").disable(1);
				tableList.onselect = tableTool.selectListHandler(me);
				//alert(1);
				var ud=nirvana.manage.UserDefine;
				baidu.on(baidu.G("Tools_effectAnalyse_body"), 'scroll', ud.resizeHandler);
				baidu.on(baidu.G("Tools_effectAnalyse_body"), 'resize', ud.resizeHandler);
                //筛选滚动条事件
				baidu.on(baidu.G("Tools_effectAnalyse_body"), 'resize', nirvana.manage.FilterControl.resetFilter);
				baidu.on(baidu.G("Tools_effectAnalyse_body"), 'scroll', nirvana.manage.FilterControl.resetFilter);
			
				
				//状态列表的设置
			    me.setContext('SearchState', {
					datasource:nirvana.manage.getStatusSet("keyword"), 
			       	value: 100, 
					width:120
			    });
				/*****end of add ********************/
				/*主动引导停掉
				FlashStorager.get('effect_guide', function(data){
				//	console.log(data);
	                if(!data){  //如果本地存储里没有数据
	             //       console.log('no data!!!!!!!!!');
						var guide_data = {};
						guide_data[nirvana.env.OPT_ID] = 1;
						FlashStorager.set('effect_guide',guide_data);
	                    me.startGuide();
					
	                } else {    //本地存储有数据
	               //     console.log('has data~~~~~~~');
						if(data[nirvana.env.OPT_ID] != 1){
							me.startGuide();
							var guide_data = data;
	                        guide_data[nirvana.env.OPT_ID] = 1;
	                        FlashStorager.set('effect_guide',guide_data);
					//		callback();
						}
	                }
	            });
				*/
            },
			startGuide : function(){
				var me = this;
				var dialog = ui.util.get('EffectStartGuide');
                    if (!dialog) {
                        ui.Dialog.factory.create({
                            title: '使用引导',
                            content: '5步教你玩转效果分析工具。',
                            closeButton: true,
                            cancel_button: false,
                            onok : function(){
                               me.openEffectGuide();
                            },
                            maskType: 'black',
                            maskLevel: '3',
                            id: 'EffectStartGuide',
                            width: 300,
                            skin : 'ToolsModuleConfirmReImport'
                        });
                        
					} else {
                        dialog.onok = function(){
							me.openEffectGuide();
						};
						dialog.onclose = function(){
							//监控
			                var logparam = {};  
			                logparam.guide = "close";
			                logparam.path = "Tools_effectAnalyse";
			                nirvana.effectAnalyse.lib.logCenter("sendRequest",logparam);
						};
                        dialog.show();
                    }
					setTimeout(function(){
                        dialog = ui.util.get('EffectStartGuide');
                        if(dialog != null && dialog.isShow){
                            dialog.close();
                            me.openEffectGuide();
                        }
                    }, 2500);
			},
			/**
			 * 
			 */
			openEffectGuide : function(){
				 var me = this;
				 //监控
                 var logparam = {};  
                 logparam.guide = "start";
                 nirvana.effectAnalyse.lib.logCenter("sendRequest",logparam);
				 
				 nirvana.util.openSubActionDialog({
			            id: 'openEffectGuideDialog',
			            title: '效果分析五部曲',
			            width: 820,
			            actionPath: 'manage/effectGuide',
			            maskLevel : 2,
			            params: {
			                action : me
			             },
			            onclose: function(){}
			     });
				
				
			},
            /**
             * 新建选择初始化
             */
            initEffectMaterialSelect : function() {
                var me = this;
                if (me.arg.refresh) {
                    return; 
                }
                me.isMaterialShow = false;
                me.setContext('effectSelectedDeleteHandler',
                        me.selectedDeleteHandler());
                
                
                // 读取导入的物料
                if (me.arg.queryMap.importMaterials && me.arg.queryMap.importMaterials.data.length > 0) {
                    var importMaterials = me.arg.queryMap.importMaterials,
                        importData = importMaterials.data,
                        i,
                        len,
                        datasource = [];
                    
                    switch (importMaterials.level) {
                        case 'plan':
                            me.setContext('effectTargetType', 3);
                            for (i = 0, len = importData.length; i < len; i++){
                                datasource[i] = {
                                    id : importData[i].planid,
                                    name : importData[i].planname
                                };
                            }
                            break;
                        case 'unit':
                            me.setContext('effectTargetType', 5);
                            for (i = 0, len = importData.length; i < len; i++){
                                datasource[i] = {
                                    id : importData[i].unitid,
                                    name : importData[i].unitname
                                };
                            }
                            break;
                        case 'keyword':
                            me.setContext('effectTargetType', 11);
                            for (i = 0, len = importData.length; i < len; i++) {
                                datasource[i] = {
                                    id : importData[i].winfoid,
                                    name : importData[i].showword
                                };
                            }
                            break;
                       
                        case 'folder': //如果物料带入为监控文件夹类型
                            me.setContext('effectTargetType', 10);
                            for (i = 0, len = importData.length; i < len; i++) {
                                datasource[i] = {
                                    id : importData[i].folderid,
                                    name : importData[i].foldername
                                };
                            }
                            break;
                        default:
                            break;
                    }
					me.setContext('hasMaterial',true);
                    me.setContext('effectSelectedAutoState', true);
                    me.setContext('effectSelectedData', datasource);
                    me.setContext('addedWords',datasource); // 设置已添加的词，这样物料才能置灰
                    
				
                } else {
					me.setContext('hasMaterial',false);
                    me.setContext('effectSelectedAutoState', true);
                    me.setContext('effectSelectedData', [{
                        id: nirvana.env.USER_ID,
                        name: nirvana.env.USER_NAME
                    }]);
               
                }
            },
            /**
             * 设置层级提示信息
             *
             */
            _setTipsContent : function () {
                var me = this, 
                    type = me.getContext('effectTargetType'),
                    tipText = '';
                type +='';  
                switch (type) {
                    case '2':
					    tipText = '';
						break;
                    case '3':
                        tipText = '您选择的计划中的关键词将进入下一步分析。若所选关键词数量超过5000个，则只显示展现量最高的5000词。';
                        break;
                    case '5':
                        tipText = '您选择的单元中的所有关键词将进入下一步分析。若所选关键词数量超过5000个，则只显示展现量最高的5000词。';
                        break;
                    case '11':
                        tipText = '您添加的关键词将进入下一步分析。若所选关键词数量超过5000个，则只显示展现量最高的5000词。';
                        break;
                    case '10':
                        tipText = '您选择的监控文件夹中的关键词将进入下一步分析。若所选关键词数量超过5000个，则只显示展现量最高的5000词。';
                        break;
                    default:
					    break;
                }
				if (tipText != '') {
					baidu.g('EffectLevelTipsText').innerHTML = tipText;
					baidu.show('EffectLevelTips');
				}else{
					baidu.hide('EffectLevelTips');
					baidu.hide('ToolsEffectMaterial');
				}
            },
            /**
             * 物料类型切换响应
             * 
             */
            typeTabHandler : function () {
                var me = this; 
                return function(e) {
                    var e = e || window.event,
                        tar = e.target || e.srcElement,
                        label = tar.id;
                                        
                    if (label == '' || label == 'EffectLevelOptionsDiv'){
                        return;
                    }
					//这里由于切换层级时不发送请求，在点击添加对象时才请求，所以物料选择控件需要先关闭再打开，不能保持打开状态
					if(me.isMaterialShow){
						baidu.addClass('EffectMaterialListWrap','hide');
						me.isMaterialShow = false;
					}
                    var value = tar.value+'';
                        me._setMaterialSelect(value);
						            
                    baidu.event.stopPropagation(e);
                }
            },
			
            /**
             * 打开物料选择
             */
            openMaterialSelect : function () {
                var me = this;
                
                return function() {
                    var EffectMaterialList = me._controlMap.EffectMaterialList;
                    
                    me.setMaterialSelectContext();
                    EffectMaterialList.render(EffectMaterialList.main);
                    
                    EffectMaterialList.main.style.left = 0;
                    EffectMaterialList.main.style.top = 0;
                    
                    // 显示物料列表
                    baidu.removeClass('EffectMaterialListWrap', 'hide');
                    me.isMaterialShow = true;
                };
            },  
            /**
		     * 点击空白区域关闭对象选择列表
		     */
		    closeEffectMaterial : function(){
		        var me = this;
		        return function(e) {
		            if (!me.isMaterialShow){
		                return;
		            }
		            
		            var e = e || window.event || {},
		                tar = e.target || e.srcElement,
		                selectedBox = baidu.g('EffectMaterialSelectedWrap'),
		                materialBox = baidu.g('EffectMaterialListWrap');
		            
		            if (tar && 
		                (baidu.dom.contains(selectedBox, tar) || baidu.dom.contains(materialBox, tar) || 
		                tar.className == 'ui_list_del')){
		                return;
		            }
		            
		            var mPos = baidu.page.getMousePosition(),
		                navPos = baidu.dom.getPosition(materialBox);
		            if (mPos.x > navPos.left + materialBox.offsetWidth || mPos.y < navPos.top || mPos.y > navPos.top + materialBox.offsetHight || 
		                (tar && tar.id =='EffectAnalyseOptions')) {
		                baidu.addClass('EffectMaterialListWrap','hide');
						me.isMaterialShow = false;
		            }
		        }
		    },  
            /**
             * 设置物料选择控件
             * @param {Object} key
             */
            _setMaterialSelect : function(key){
                var me = this,
                    controlMap = me._controlMap;
                var effectMaterialSelected = controlMap.EffectMaterialSelected,
                    effectMaterialList = controlMap.EffectMaterialList,
                    datasource = [];
                
                if(me.getContext('effectTargetType') == key){
                    datasource = me.getContext('effectSelectedData');
                }
				
                key +='';
                switch (key) {
                    case '2':       //账户
                        datasource = [{
                            id: nirvana.env.USER_ID,
                            name: nirvana.env.USER_NAME
                        }];
                        effectMaterialList.autoState = false;
                        me.setMaterialSelectContext('account');
                        break;
                    case '3':       //推广计划
                        effectMaterialList.autoState = true;
                        me.setMaterialSelectContext('plan');
                        break;
                    case '5':       //推广单元
                        effectMaterialList.autoState = true;
                        me.setMaterialSelectContext('unit');
                        break;
                    case '11':       //关键词
                        effectMaterialList.autoState = true;
                        me.setMaterialSelectContext('keyword');
                        break;
                    case '10':       //监控文件夹
                        effectMaterialList.autoState = true;
                        me.setMaterialSelectContext('folder');
                        break;
                    
                }
                effectMaterialSelected.datasource = baidu.object.clone(datasource);
                effectMaterialList.addWords = baidu.object.clone(datasource);
                        
                me.setContext('effectTargetType', key);
                me.setContext('effectSelectedData', datasource);
       
                
           //   effectMaterialList.render(effectMaterialList.main);
                effectMaterialSelected.render(effectMaterialSelected.main);
                
                
                if(key == '2'){ //账户层级禁用添加对象按钮
            //        baidu.hide('ToolsEffectMaterial');
                    ui.util.get('EffectMaterialSelected').disableAddLink(true);
                }else{
  
                    baidu.show('ToolsEffectMaterial');
                //    baidu.show('EffectLevelTips');
                    ui.util.get('EffectMaterialSelected').disableAddLink(false);
                }
				
				me._setTipsContent();
                
            },
            /**
             * 设置候选列表
             * 
             * @param {Object}
             *            type
             * @param {Object}
             *            typeValue
             */
            setMaterialSelectContext : function (type) {
                var me = this,
                    controlMap = me._controlMap,       
                    effectMaterialList = controlMap.EffectMaterialList;
                if(!type){
                    var typeValue = controlMap.EffectAccount.getGroup().getValue();
                    switch(typeValue) {
                        case '2':
                            type = 'account';
                            break;
                        case '3':
                            type = 'plan';
                            break;
                        case '5':
                            type = 'unit';
                            break;
                        case '10': 
                            type = 'folder';
                            break
                        case '11':
                            type = 'keyword';
                            break;
                    }
                }       
                switch (type) {
                    case  'account':
                        effectMaterialList.setForm("material");
                        me.setContext('effectMaterialType', ['user']);
                        break;
                    case 'plan': 
                        effectMaterialList.setForm("material");
                        me.setContext('effectMaterialType', ['user','plan']);
                        break;
                    case 'unit':
                        effectMaterialList.setForm("material"); 
                        me.setContext('effectMaterialType', ['user','plan','unit']);
                        break;
                    case 'keyword': 
                        effectMaterialList.setForm("material");
                        me.setContext('effectMaterialType', ['user','plan','unit', 'keyword']);
                        break;
                    case 'folder':
                        effectMaterialList.setForm("avatar");
                        me.setContext('effectMaterialType', ['user']);
                        break;
                }
                effectMaterialList.setLevel(me.getContext('effectMaterialType'));
            },
            /**
             * 物料添加添加到左侧
             * 
             * @param {Object}
             *            item
             */
            addObjHandler : function () {
                var me = this;
                return function(item) {
                    var effectSelectedList = me._controlMap.EffectMaterialSelected;
                    var datasource = effectSelectedList.datasource;
           
                    item.name = baidu.decodeHTML(item.name);                 
                    datasource.push(item);
			
                    /*
                     * if(datasource.length >= 10){
                     * baidu.g('targetValueErrorMsg').innerHTML = '每次不可选择超过10个对象';
                     * baidu.show('targetValueErrorMsg'); if(datasource.length > 10){
                     * datasource.pop(); return false; } }else {
                     * baidu.hide('targetValueErrorMsg'); }
                     */
                    effectSelectedList.render(effectSelectedList.main);
                  
                }
            },
            /**
             * 已选对象删除响应
             * 
             * @param {Object}
             *            objId
             */
            selectedDeleteHandler : function() {
                var me = this;
                return function(objId) {
                    var effectMaterialList = me._controlMap.EffectMaterialList;
                    effectMaterialList.recover(objId);
                 //   baidu.hide('NewReportTargetValueErrorMsg');
                }
            },
            /**
             * 关闭对象列表外层
             * 
             * @param {Object}
             *            objId
             */
            effectMaterialCloseHandler : function(){
                var me = this;
           //     baidu.hide('EffectMaterialWrap');   
                baidu.addClass('EffectMaterialListWrap', 'hide');     
                me.isMaterialShow = false;
            },
            
			sendEffectRequest : function(){
				var me = this,
				    params = {},
				    controlMap = me._controlMap,
                    calendar = controlMap['EffectanaCalendar'];
					
        
		        //日期参数
		        var dateRange = calendar.getValue();
		        params.starttime = baidu.date.format(dateRange.begin, 'yyyy-MM-dd');
		        params.endtime = baidu.date.format(dateRange.end, 'yyyy-MM-dd');
				
				//层级和物料集合参数
				var targetType = me.getContext('effectTargetType')+'',
				    conAttr = '';
				
				switch(targetType){
				        case '2':
                            params.level = 'useracct';
							conAttr = 'userid';
                            break;
                        case '3':
                            params.level = 'planinfo';
							conAttr = 'planid';
                            break;
                        case '5':
                            params.level = 'unitinfo';
							conAttr = 'unitid';
                            break;
                        case '10': 
                            params.level = 'folder';
							conAttr = 'folderid';
                            break
                        case '11':
                            params.level = 'wordinfo';
							conAttr = 'winfoid';
                            break;
				}
				
				//选定的物料ID集合
	            var materialSet = controlMap['EffectMaterialSelected'].getValue(),
	                idSet = [],
					condition = {};
				if (conAttr == 'userid') {
				    idSet.push(Number(nirvana.env.USER_ID));
				}
				else {
					for (var i = 0, l = materialSet.length; i < l; i++) {
						idSet.push(Number(materialSet[i].id));
					}
				}
                condition[conAttr] = idSet;
				params.condition = condition;
				
				//全部列名
				var fields = ["showword","unitname","planname","wordstat","bid",
						"wmatch","showqstat","clks","paysum","shows","trans","avgprice",
						"clkrate","showpay","wurl","winfoid","unitid","planid","unitbid",
						"wordid","shadow_wurl","pausestat","activestat","wctrl"];			
				params.fields = fields;
				//flash指标恢复默认选项
                me.setContext('flashItemOptionSelected', 1);
				controlMap['flashItemsSelect'].value = 1;
				controlMap['flashItemsSelect'].render();
				//发送请求,先保存一下参数
				me.setContext('currentParams',params);

				baidu.hide('analyserFlashStat');
				fbs.effectAnalyse.getEffect({
		            level : params.level,
			        fields : params.fields,
			        condition : params.condition,
			        starttime : params.starttime,
			        endtime : params.endtime,
			        limit : "",
		            callback : function(data){
		                nirvana.effectAnalyse.lib.processEffectData(me, data);
		            }
                });
				
				//监控
				var logparam = {};
				if(me.getContext('hasMaterial')){
					logparam.hasMaterial = 1;
				}
				logparam.reqlevel = params.level;
				logparam.path = "Tools_effectAnalyse";
				nirvana.effectAnalyse.lib.logCenter("sendRequest",logparam);
			}   
			 
       }
);	   