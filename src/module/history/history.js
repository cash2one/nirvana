ToolsModule.history = new ToolsModule.Action('history', {
	VIEW : 'history',
	
	STATE_MAP : {
		historyPageSize : 50,
		historyPageNo : 1,
		orderBy	:	'opttime',
		orderMethod	: 	'desc',
		historyOptName : "",			//操作人
		historyTargetType : 3,			//默认为推广账户
		historyCalendarDateBegin : '',
		historyCalendarDateEnd : ''
	},
	
	//重置工具时，通过判断.refresh决定是否重置所有STATE_MAP中定义的context
	onbeforeinitcontext : function(){
		var me = this,
			stateMap = this.STATE_MAP || {};
			
		if(!me.arg.refresh){
			me.arg.queryMap.ignoreState = true;
		}
	},
	
	UI_PROP_MAP : {
		historyPageSizeSelect : {
			type : 'Select',
			width : '80',
			datasource : '*pageSizeOption'
		},
		
		historyPagination : {
			type : 'Page',
			total : '*totalPage'
		},
		
		historyTableList : {
			type : 'Table',
			sortable : 'true',
			orderBy : 'shows',
			order :　'desc',
			noDataHtml : '*noDataHtml',
			fields: '*historyTableFields',		
			datasource : '*historyListData'
		},
		
		// 物料列表控件
		historyMaterialList : {
			level : '*historyMaterialType',
			form : 'material',
			width : '450',
			height : '300',
			onAddLeft : '*historyAddObjHandler',
			tableOption : '*historyMaterialTableOptions',
			onclose : '*historyMaterialCloseHandler',
			needDel : 'true',
			addWords : '*addedWords',
			noDataHtml : FILL_HTML.EXCEED_LIST.replace(/%s/, '历史操作记录')
		}
	},
	
	CONTEXT_INITER_MAP : {
		pageSizeOption : function(callback){
			this.setContext('pageSizeOption',nirvana.manage.sizeOption);
			callback();
		},
		init: function(callback){
			var me = this;
			tool.historyCtrl.init(me,callback);	
		}
	},
	
	//refresh后执行
	onafterrepaint : function(){
	//	baidu.show("historyTableDiv");
		baidu.show("historyDownload");
	},
	
	//第一次render后执行
	onafterrender : function(){
		var me = this,
			hc = tool.historyCtrl;
	//	baidu.hide("historyTableDiv");
		baidu.hide("historyDownload");
		baidu.g('historyDivOption').onclick = hc.closeHistoryMaterial;					//空白处关闭
		baidu.g('historyTargetTypeDiv').onclick = hc.typeTabHandler;					//对象类型
		ui.util.get('historySelectedList').onaddclick = hc.openMaterialSelect;			//选定对象
		ui.util.get('optSelect').onclick = hc.openOptSelect;							//打开选择范围
		ui.util.get('queryHistory').onclick = hc.refreshQuery;							//查询
		ui.util.get('historyPageSizeSelect').onselect = hc.getPageSizeHandler;			//historyPageSizeSelect
	    ui.util.get('historyPagination').onselect = hc.getPaginationHandler;			//historyPagination
		ui.util.get("historyTableList").onsort = hc.getSortHandler;						//排序
				
		baidu.hide('historyMaterialWrap');
		if (nirvana.env.ULEVELID != 10104 && nirvana.env.ULEVELID != 10101){
			baidu.show('optUserDiv');
		}else{
			baidu.hide('optUserDiv');
		}
		
		if (baidu.g('HSListDiv')){
			tool.historyCtrl.optTabHandler({target:{id:'HSAll'}});
		}
		
	},
	
	//每次页面装载完成后执行
	onentercomplete : function(){
		var me = this;
		
		ui.Bubble.init();
		setTimeout(function(){
			ui.util.get('historyTableList').handleResize();
		},500);
		
		if (ui.util.get('historySelectedList') && ui.util.get('historySelectedList').datasource.length == 0){
			baidu.dom.addClass('historyTableDiv','table_display_none');
		}else{
			baidu.dom.removeClass('historyTableDiv','table_display_none');
		}
		
		if (tool.historyCtrl.dataCache.length == 0){
			baidu.dom.hide('historyDownload');
			baidu.dom.hide('historyPagerDiv');
		}else{
			baidu.dom.show('historyDownload');
			baidu.dom.show('historyPagerDiv');
			baidu.g('historyDownload').href =  this.getContext('historyDownloadUrl');
		}
		
		if(me.getContext('historyTargetType') == 3){ //账户层级禁用添加对象按钮
			ui.util.get('historySelectedList').disableAddLink(true);
		}else{
			ui.util.get('historySelectedList').disableAddLink(false);
		}
		
	}
});

var tool = tool || {};
tool.historyCtrl = {
	me : null,
	dataCache : {},
	
	//统计范围编码
	optContent : {
		3:{
			value:3,
			text:"账户",
			children:{
				'1,41,42,43,44':{value:"1,41,42,43,44",text:"预算"},		//账户有周、日预算
				2:{value:"2",text:"推广地域"},
				28:{value:"28",text:"激活时长设置"},
				3:{value:"3",text:"IP排除"}
			},
			key : 'useracct'
		},

		2:{
			value:2,
			text:"推广计划",
			children:{
				22:{value:"22",text:"新建计划"},
				20:{value:"20",text:"删除推广计划"},
				10:{value:"10",text:"暂停/启用推广"},
				6:{value:"6",text:"推广时段管理"},
				1:{value:"1",text:"每日预算"},					//计划只有日预算
				2:{value:"2",text:"推广地域"},
				16:{value:"16",text:"展现方式"},
				8:{value:"8",text:"否定关键词"},
				34:{value:"34",text:"精确否定关键词"},
				5:{value:"5",text:"参加网盟推广"},
				30:{value:"30",text:"网盟推广出价"},
				48:{value:'48',text:'勾选投放设备'},
				46:{value:'46',text:'切换投放设备'},
				47:{value:'47',text:'推广电话'},
				49:{value:'49',text:'商桥移动咨询'},
				50:{value:'50',text:'修改移动出价'}
			},
			key : 'planinfo'
		},

		1:{
			value:1,
			text:"推广单元",
			children:{
				23:{value:"23",text:"新建单元"},
				19:{value:"19",text:"删除单元"},
				10:{value:"10",text:"暂停/启用推广"},
				12:{value:"12",text:"修改单元出价"},
				21:{value:"21",text:"编辑单元名称"},
				8:{value:"8",text:"否定关键词"},
				34:{value:"34",text:"精确否定关键词"}
			},
			key : 'unitinfo'
		},

		5:{
			value:5,
			text:"关键词",
			children:{
				13:{value:"13",text:"添加关键词"},
				18:{value:"18",text:"删除关键词"},
				10:{value:"10",text:"暂停/启用推广"},
				12:{value:"12",text:"修改关键词出价"},
				27:{value:"27",text:"匹配方式"},
				17:{value:"17",text:"激活关键词"},
				32:{value:"32",text:"转移关键词"},
				25:{value:"25",text:"关键词URL"},
				51:{value:"51",text:"移动URL"}
			},
			key : 'wordinfo'
		},

		4:{
			value:4,
			text:"创意",
			children:{
				24:{value:"24",text:"新建创意"},
				29:{value:"29",text:"删除创意"},
				10:{value:"10",text:"暂停/启用推广"},
				26:{value:"26",text:"编辑创意"},
				17:{value:"17",text:"激活创意"}
			},
			key : 'ideainfo'
		},
		
		7:{
			value:7,
			text:"附加创意",
			children:{
                57: {value: "57", text: "新建app推广"},
                58: {value: "58", text: "删除app推广"},
                56: {value: "56", text: "修改app推广"},
                59: {value: "59", text: "暂停/启用app推广"},
                60: {value: "60", text: "新建子链"},
				61: {value: "61", text: "删除子链"},
				62: {value: "62", text: "编辑子链"},
				63: {value: "63", text: "暂停/启用子链"}
			},
			key : 'creativeinfo'
		}
	},
	
	optShowSeq : [//每两位是一组。。。
	3,["1,41,42,43,44",2,28,3],//账户操作的代码
	2,[22,20,10,6,1,2,16,8,34,5,30,48,46,47,49,50],//计划操作代码
	1,[23,19,10,12,21,8,34],        //单元操作代码
	5,[13,18,10,12,27,17,32,25,51],    //关键词操作
	4,[24,29,10,26,17],              //创意操作
	7,[60,61,62,63],                 //蹊径子链操作
	7,[57,58,56,59]                     //app操作
	],
	
	optIcon : {
		mod : '<b class="history_opticon_mod">△</b>',
		add : '<b class="history_opticon_add">+&nbsp;</b>',
		del : '<b class="history_opticon_del">X</b>'
	},

	
	init : function(ac, callback){
		var hc = tool.historyCtrl,
		    me = ac,
			data,
		    dateRange = {
				begin : null,
				end : null,
				beginDate : me.getContext('historyCalendarDateBegin'),
				endDate : me.getContext('historyCalendarDateEnd')
			};
			
			
		hc.me = ac;
		hc.callback = callback;
		
		if (dateRange.beginDate == ''){
			//日历初始化 
			dateRange.begin = new Date(nirvana.env.SERVER_TIME * 1000);
            dateRange.begin.setDate(dateRange.begin.getDate() - 7);
			dateRange.end = new Date(nirvana.env.SERVER_TIME * 1000);
			dateRange.end.setDate(dateRange.end.getDate() - 1);
			dateRange.beginDate = baidu.date.format(dateRange.begin,"yyyy-MM-dd");
			dateRange.endDate = baidu.date.format(dateRange.end,"yyyy-MM-dd");
			
			me.setContext('historyCalendarDateBegin', dateRange.beginDate);
			me.setContext('historyCalendarDateEnd', dateRange.endDate);
			
			var availableBegin = new Date(nirvana.env.SERVER_TIME * 1000);
				availableBegin.setMonth(availableBegin.getMonth()-3);
			me.setContext('historyCalendarAvailableRange', {
				begin : availableBegin,
				end : new Date(nirvana.env.SERVER_TIME * 1000)					
			});		
		}else{
			//日历复位，context不能保持对象，日历控件的状态保持需要通过字符串转换
			dateRange.begin = baidu.date.parse(dateRange.beginDate);
			dateRange.end = baidu.date.parse(dateRange.endDate);
		}
		
		me.setContext('historyCalendarDateSelected', dateRange);	
		
		if(!me.arg.refresh){
			
			//第一次进入时初始化
			hc.isHistoryMaterialShow = false;
				
			//已选择列表
			me.setContext('historySelectedData',[]);
	        me.setContext('historySelectedDeleteHandler', hc.selectedDeleteHandler);
			
			//读取导入的物料
			if (me.arg.queryMap.importMaterials && me.arg.queryMap.importMaterials.data.length > 0) {
				var inportdata = me.arg.queryMap.importMaterials,
				    i,len,datasource = [];
                switch (inportdata.level){

					case 'plan':
						me.setContext('historyTargetType', 2);
					    for (i = 0, len = inportdata.data.length; i < len; i++){
							datasource[i] = {};
							datasource[i].id = inportdata.data[i].planid;
							datasource[i].name = inportdata.data[i].planname;
						}
						me.setContext('historyMaterialType',['user','plan']);
						break;
					case 'unit':
					    me.setContext('historyTargetType', 1);
					    for (i = 0, len = inportdata.data.length; i < len; i++){
							datasource[i] = {};
							datasource[i].id = inportdata.data[i].unitid;
							datasource[i].name = inportdata.data[i].unitname;
						}
						me.setContext('historyMaterialType', ['user','plan','unit']);
						break;
					case 'keyword':
					    me.setContext('historyTargetType', 5);
					    for (i = 0, len = inportdata.data.length; i < len; i++){
							datasource[i] = {};
							datasource[i].id = inportdata.data[i].winfoid;
							datasource[i].name = inportdata.data[i].showword;
						}
						me.setContext('historyMaterialType', ['user','plan','unit', 'keyword']);
						break;
					case 'idea':
					    me.setContext('historyTargetType', 4);
					    for (i = 0, len = inportdata.data.length; i < len; i++){
							datasource[i] = {};
							datasource[i].id = inportdata.data[i].ideaid;
							datasource[i].name = IDEA_RENDER.lineBreak(IDEA_RENDER.wildcard(inportdata.data[i].title));
							datasource[i].isIdea = true;
						}
						me.setContext('historyMaterialType', ['user','plan','unit', 'idea']);
						break;	
					case 'sublink':
						me.setContext('historyTargetType', 7);
					    for (i = 0, len = inportdata.data.length; i < len; i++) {
							datasource[i] = {};
							datasource[i].id = inportdata.data[i].creativeid;
							datasource[i].name = appendIdeaLib.getSublinkReviewText(inportdata.data[i].content);
							datasource[i].type = "sublink";
						}
						me.setContext('historyMaterialType', ['user','plan','unit', 'sublink']);
						hc.importLevel = "sublink";
						break;
                    case 'app':
                        me.setContext('historyTargetType', 7);
                        for (i = 0, len = inportdata.data.length; i < len; i++) {
                            datasource[i] = {};
                            datasource[i].id = inportdata.data[i].creativeid;
                            datasource[i].name = baidu.encodeHTML(inportdata.data[i].appname);
                            datasource[i].type = "app";
                        }
                        me.setContext('historyMaterialType', ['user','plan','unit', 'app']);
						hc.importLevel = "app";
                        break;

				}
				hc.level = inportdata.level;
				me.setContext('historyAutoState', true);
				me.setContext('historySelectedData',datasource);
				me.setContext('addedWords',baidu.object.clone(datasource));//这里不用clone的话，会导致第二次开始从右侧往左侧加词的时候，同时把上一次添加的词再加一遍
			}else{
				hc.level = 'account';
				me.setContext('historyTargetType', 3);
				me.setContext('historyAutoState', false);
				me.setContext('historyMaterialType', ['user']);
				me.setContext('historySelectedData',[{id:nirvana.env.USER_ID, name:nirvana.env.USER_NAME}]);
			}
			
			//物料选择器
	        me.setContext('historyMaterialTableOptions', {width:450, height:200});
			me.setContext('historyAddObjHandler', hc.addObjHandler);
			me.setContext('historyMaterialCloseHandler', hc.historyMaterialCloseHandler);
			
			//统计范围
			me.setContext('historyOptContent',{});
			
			//表格列初始化
			var data = [{
						content: 'opttime',
						title: '时间',
						field : 'opttime',
						sortable : true,
						width: 100						
					}, 
					{
						content: 'optname',
						title: '操作人',
						field : 'optname',
						sortable : true,
						width: 50
					}, 
					{
						content: hc.renderLevel,
						title: '层级',
						field : 'level',
						sortable : false,
						width: 20
					}, 
					{
						content: hc.renderContent,
						title: '内容',
						field : 'levelkey',
						sortable : true,
						width: 200
					}, 
					{
						content: hc.renderOptDetail,
						title: hc.optIcon.mod + ' = 修改操作 ' + hc.optIcon.add + ' = 添加操作 ' + hc.optIcon.del + ' = 删除操作',
						width: 400,
						minWidth : 400
					}];	
			me.setContext('historyTableFields', data);
		}
		
		hc.queryHistory();
	},
	
	/**
	 * 查看类型选择
	 * @param {Object} e
	 */
	typeTabHandler : function (e) {
        var e = e || window.event,
			tar = e.target || e.srcElement,
			label = tar.id;
		
		if (label == '' || label == 'historyTargetTypeDiv'){
			return;
		}else{
			label = label.slice(12);
		}
		
		var hc = tool.historyCtrl,
			me = hc.me,
            controlMap = me._controlMap,
			historySelectedList = controlMap.historySelectedList,
            historyMaterialList = controlMap.historyMaterialList,
			levelRadio = controlMap.historyTypeAccount.getGroup();
		
		ui.Dialog.confirm({
			title: '提醒',
			content: nirvana.config.LANG.LEVEL_CHANGE_WARN,
			onok: function(){
				switch (label) {
					case 'historyTypeAccount':
						historySelectedList.datasource = [{
							id: nirvana.env.USER_ID,
							name: nirvana.env.USER_NAME
						}];
						historySelectedList.autoState = false;
						me.setContext('historyAutoState', false);
						me.setContext('historyTargetType', 3);
						hc.setMaterialSelectContext('account');
						hc.setOptLevel('account');
						break;
					case 'historyTypePlan':
						historySelectedList.datasource.length = 0;
						historySelectedList.autoState = true;
						me.setContext('historyAutoState', true);
						me.setContext('historyTargetType', 2);
						hc.setMaterialSelectContext('plan');
						hc.setOptLevel('plan');
						break;
					case 'historyTypeUnit':
						historySelectedList.datasource.length = 0;
						historySelectedList.autoState = true;
						me.setContext('historyAutoState', true);
						me.setContext('historyTargetType', 1);
						hc.setMaterialSelectContext('unit');
						hc.setOptLevel('unit');
						break;
					case 'historyTypeKeyword':
						historySelectedList.datasource.length = 0;
						historySelectedList.autoState = true;
						me.setContext('historyAutoState', true);
						me.setContext('historyTargetType', 5);
						hc.setMaterialSelectContext('keyword');
						hc.setOptLevel('keyword');
						break;
					case 'historyTypeIdea':
						historySelectedList.datasource.length = 0;
						historySelectedList.autoState = true;
						me.setContext('historyAutoState', true);
						me.setContext('historyTargetType', 4);
						hc.setMaterialSelectContext('idea');
						hc.setOptLevel('idea');
						break;
					case 'historyTypeCreativeIdea':
					    historySelectedList.datasource.length = 0;
						historySelectedList.autoState = true;
						me.setContext('historyAutoState', true);
						me.setContext('historyTargetType', 7);

						hc.setMaterialSelectContext(hc.importLevel || 'sublink');
                        hc.setOptLevel(hc.importLevel || 'sublink');
                        break;

						
				}
				baidu.hide('targetValueErrorMsg');
				historyMaterialList.render(historyMaterialList.main);
				historyMaterialList.addWords = [];
				historySelectedList.render(historySelectedList.main);
				
				if (label == 'historyTypeAccount') {
					baidu.hide('historyMaterialWrap');
					ui.util.get('historySelectedList').disableAddLink(true);
				} else {
					//baidu.show('historyMaterialWrap');
					ui.util.get('historySelectedList').disableAddLink(false);
				}
			},
			oncancel: function(){
				// 强制改变radio值
				levelRadio.setValue(me.getContext('historyTargetType'));
			}
		});
		
		baidu.event.stopPropagation(e);
    },
	
	/**
	 * 打开物料选择
	 */
	openMaterialSelect : function () {
        var hc = tool.historyCtrl,
		    historyMaterialList = hc.me._controlMap.historyMaterialList;
        	
		hc.setMaterialSelectContext()
        historyMaterialList.render(historyMaterialList.main);		
        historyMaterialList.main.style.left = 0;
        historyMaterialList.main.style.top = 0;
		baidu.show('historyMaterialWrap');
		hc.isHistoryMaterialShow = true;
    },	
	
	/**
	 * 关闭对象选择列表
	 */
	closeHistoryMaterial : function(e){
		var hc = tool.historyCtrl;
		if (!hc.isHistoryMaterialShow){
			return;
		}
		
		var e = e || window.event || {},
		    tar = e.target || e.srcElement,
			selectedBox = baidu.g('historySelectedWrap'),
			materialBox = baidu.g('historyMaterialWrap');
		
		//别问我这恶心的判断怎么来的，问ue&pm
		if (tar && 
		    (baidu.dom.contains(selectedBox, tar) || baidu.dom.contains(materialBox, tar) || 
		    tar.className == 'ui_list_del' || tar.className == 'ui_radiobox_label')){
			return
		}
		
		var mPos = baidu.page.getMousePosition(),
			navPos = baidu.dom.getPosition(materialBox);
		if (mPos.x > navPos.left + materialBox.offsetWidth || mPos.y < navPos.top || mPos.y > navPos.top + materialBox.offsetHight || 
		    (tar && tar.id =='historyDivOption')) {
			baidu.hide('historyMaterialWrap');
		}
	},
	
	/**
	 * 关闭对象列表外层
	 * @param {Object} objId
	 */
	historyMaterialCloseHandler : function(){
		var hc = tool.historyCtrl;
		
		baidu.hide('historyMaterialWrap');
		
		hc.isHistoryMaterialShow = false;
	},
	
	/**
	 * 已选对象删除响应
	 * @param {Object} objId
	 */
	selectedDeleteHandler : function (objId) {
		var hc = tool.historyCtrl,
		    me = hc.me,
			historyMaterialList = me._controlMap.historyMaterialList;
        
		historyMaterialList.recover(objId);
        baidu.hide('targetValueErrorMsg');
    },
	
	/**
	 * 添加到左侧
	 * @param {Object} item
	 */
	addObjHandler : function (item) {
		var hc = tool.historyCtrl,
		    me = hc.me,
			historySelectedList = me._controlMap.historySelectedList,
			datasource = historySelectedList.datasource;

		switch(+me.getContext('historyTargetType')){
			case 4:
				item.isIdea = true;
			// 创意的name是已经处理好的，这里不需要处理，控件里直接显示
				break;
			case 7:
				item.type = hc.importLevel || "sublink";
				break;
			default:
				item.name = baidu.decodeHTML(item.name);
				break;
		}

        datasource.push(item);
		/*
        if(datasource.length >= 10){
            baidu.g('targetValueErrorMsg').innerHTML = '每次不可选择超过10个对象';
            baidu.show('targetValueErrorMsg');
            if(datasource.length > 10){
                datasource.pop();
                return false;
            }
        }else {
            baidu.hide('targetValueErrorMsg');
            
        }
		*/
		baidu.hide('targetValueErrorMsg');
        historySelectedList.render(historySelectedList.main);
    },
    
	/**
	 * 设置候选列表
	 * @param {Object} type
	 * @param {Object} typeValue
	 */
    setMaterialSelectContext : function (type) {
        var hc = tool.historyCtrl,
		    me = hc.me,
            controlMap = me._controlMap,
            historyMaterialList = controlMap.historyMaterialList;
			
        if(!type){
            var typeValue = controlMap.historyTypeAccount.getGroup().getValue();
            switch(typeValue) {
                case 3:
                    type = 'account';
                    break;
                case 2:
                    type = 'plan';
                    break;
				case 1:
                    type = 'unit';
                    break;
                case 5: 
                    type = 'keyword';
                    break
                case 4:
                    type = 'idea';
                    break;
				case 7:
					type = hc.importLevel || "sublink";
            }
        }
		
        switch (type) {
            case  'account':
                me.setContext('historyMaterialType', ['user']);
                break;
            case 'plan': 
                me.setContext('historyMaterialType', ['user','plan']);
                break;
            case 'unit': 
                me.setContext('historyMaterialType', ['user','plan','unit']);
                break;
            case 'keyword': 
                me.setContext('historyMaterialType', ['user','plan','unit', 'keyword']);
                break;
            case 'idea': 
                me.setContext('historyMaterialType', ['user','plan','unit', 'idea']);
                break;
			case 'sublink':
				me.setContext('historyMaterialType', ['user','plan','unit', 'sublink']);
                break;
			case 'app':
				me.setContext('historyMaterialType', ['user','plan','unit', 'app']);
                break;
        }
		historyMaterialList.setLevel(me.getContext('historyMaterialType'));
    },
	
	/**
	 * 获取列表
	 */
	getMertailList : function(){
		var hc = tool.historyCtrl,
		    me = hc.me,
			mList = ui.util.get('historySelectedList'),
			i,len,data,key,result = {};
		if (mList){
			data = mList.datasource;
		}else{
			data = me.getContext('historySelectedData');
		}
		
		switch (hc.level){
			case 'account':
				key = 'useracct';
				break;
			case 'plan':
				key = 'planinfo';
				break;
			case 'unit':
				key = 'unitinfo';
				break;
			case 'keyword':
				key = 'wordinfo';
				break;
			case 'idea':
				key = 'ideainfo';
				break;
			case 'sublink':
			case 'app':
				key = 'creativeinfo';
				break;
		}
		result[key] = []
		for (i = 0, len = data.length; i < len; i++){
			result[key][i] = data[i].id; 
		}
		
		return result;
	},
	
	
	/**
	 * 打开统计范围浮动窗
	 */
	openOptSelect : function(){
		var hc = tool.historyCtrl,
		    dialog = ui.util.get('historySSDialog');
		if (!dialog || !baidu.g('HSListDiv')){
			dialog = ui.Dialog.factory.create({
				id : 'historySSDialog',
				title : '<span id="HSType" class="user_define_attr"><a id="HSAll" href="#">全部</a> | <span id="HSCustom">自定义</span> | </span>',
				skin  : "modeless",
				dragable : false,
				needMask : false,
				unresize : true,
				father : baidu.g('Tools_history_body'),
	            width : 580,
				onok : function(){
					if (tool.historyCtrl.optType == 'all'){
						baidu.g('optRange').innerHTML = '全部';
					}else{
						baidu.g('optRange').innerHTML = '自定义';
					}
					baidu.hide('optErrorMsg');
					//baidu.show('optErrorMsgInDialog');
					//tool.historyCtrl.openOptSelect();
				}
			});
			
			var conHtml = [],i,len,j,sublen,
			    optContent = hc.optContent,
				optShowSeq = hc.optShowSeq,
				errSpan = document.createElement('span');
			conHtml.push("<div id='HSListDiv'><table><tbody>");
			var lastIndex='';
			for (i = 0, len = optShowSeq.length; i < len; i++){
			     
			     if(optShowSeq[i]!=lastIndex){//同一大类的不同小类的话，不用渲染前面的类别，如附加创意分为各种类型
				 conHtml.push('<tr><td class="user_define_hstype"><input type="checkbox" checked="1" id="HSType_' + optShowSeq[i] + '"/>&nbsp;<label for="HSType_' + optShowSeq[i] + '">' + optContent[optShowSeq[i]].text + "</label></td>");
				
				 }else{//只换行
				    conHtml.push('<tr><td>&nbsp;</td>');
				 } 
				 conHtml.push('<td><table class="user_define_hslist"><tbody>');
				lastIndex = optShowSeq[i];
				i++;
				
				for (j = 0, sublen = optShowSeq[i].length; j < sublen; j++){
					if (j % 4 == 0){
						conHtml.push('<tr>');
					}
					conHtml.push('<td><input type="checkbox" checked="1" fatherIndex="' + optShowSeq[i-1] + '" id="HSList_' + optShowSeq[i-1] + '_' + optShowSeq[i][j] + '"/>&nbsp;<label for="HSList_' + optShowSeq[i-1] + '_' + optShowSeq[i][j] + '">' + optContent[optShowSeq[i-1]].children[optShowSeq[i][j]].text + "</label></td>");
					if (j % 4 == 3){
						conHtml.push('</tr>');
					}
				}
				//非刚好满4行
				if (sublen % 4 != 0){
					sublen = 4- (sublen % 4);
					for (j = 0; j < sublen; j++){
						conHtml.push('<td>&nbsp;</td>')
					}
					conHtml.push('</tr>');
				}
				conHtml.push('</tbody></table></td></tr>')
			}
			conHtml.push("</tbody></table></div>");
			
			dialog.setContent(conHtml.join(""));
			errSpan.id = 'optErrorMsgInDialog';
			errSpan.className = 'dialog_error_msg';
			errSpan.innerHTML = '请您至少选择一项操作内容';
			baidu.g('ctrldialoghistorySSDialogfoot').appendChild(errSpan);
			baidu.hide('optErrorMsgInDialog');
			
			baidu.g('HSType').onclick = hc.optTabHandler;
			baidu.g('HSListDiv').onclick = hc.optSelectHandler;
			
			baidu.dom.addClass(baidu.g('HSAll'), 'user_define_active');
			baidu.dom.removeClass(baidu.g('HSCustom'), 'user_define_active');
			hc.optType = 'all';
			
			hc.setOptLevel(hc.level);
		}
		dialog.show();
		ui.util.smartPosition(dialog.getDOM(),{
			pos : 'l',
			align : 't',
			target : 'optRange',
			repairL : 578,
			repairT : -67 + baidu.g('Tools_history_body').scrollTop
		});		
	},
	
	/**
	 * 操作类型Tab切换
	 * @param {Object} e 
	 */
	optTabHandler : function(e){
		var e = e || window.event,
		    tar = e.target || e.srcElement,
			id = tar.id || '';
		switch(id){
			case 'HSAll':
				var hc = tool.historyCtrl,
					optShowSeq = hc.optShowSeq,
					i,len,cb,j,sublen;
			   	baidu.dom.addClass(baidu.g('HSAll'), 'user_define_active');
				baidu.dom.removeClass(baidu.g('HSCustom'), 'user_define_active');
				for (i = 0, len = optShowSeq.length; i < len; i++){
					cb = baidu.g('HSType_' + optShowSeq[i]);
					if (cb.disabled){
						i++;
						continue;
					}
					cb.checked = 1;
					i++;
					for (j = 0, sublen = optShowSeq[i].length; j < sublen; j++){
						cb = baidu.g('HSList_' + optShowSeq[i-1] + '_' + optShowSeq[i][j]);
						cb.checked = 1;
					}
				}
				hc.judgeOptStyle();
				break;
			case 'HSCustom':
				break;
		}
		
		baidu.event.stop(e);
	},
	
	/**
	 * 操作项选择
	 * @param {Object} e
	 */
	optSelectHandler : function(e){
		var e = e || window.event,
		    tar = e.target || e.srcElement;
		if (tar.tagName == 'INPUT'){
			var hc = tool.historyCtrl,
				optContent = hc.optContent,
				father,children,j,cb,id,value;
			switch (tar.id.slice(0,6)){
				case 'HSType':										//点击父节点
					value = tar.checked;
					father = tar.id.substring(7);
					children = optContent[father].children;
					for (j in children){
						cb = baidu.g('HSList_' + father + '_'+ children[j].value);
						if (cb && 0 == cb.disabled){
							cb.checked = value;
						}
					}
				    break;
				case 'HSList':										//点击子节点
				    value = false;//判断是否该把父级点亮
					father = baidu.dom.getAttr(tar,'fatherIndex');
					children = optContent[father].children;
					for (j in children){
						cb = baidu.g('HSList_' + father + '_'+ children[j].value);
						if (cb && cb.checked){
							value = true;
							break;
						}
					}
				    cb = baidu.g('HSType_' + father);
					if (cb){
						cb.checked = value;
					}
				    break;
			}
			//判断总的类型
			hc.judgeOptStyle();
		}
	},
	
	/**
	 * 判断操作项选择类型：全部自定义
	 */
	judgeOptStyle : function(){
		var hc = tool.historyCtrl,
			optShowSeq = hc.optShowSeq,
			i,len,j,sublen,cb,all = true;
		for (i = 0, len = optShowSeq.length; i < len; i++){
			cb = baidu.g('HSType_' + optShowSeq[i]);
			if (cb && !cb.disabled && !cb.checked){
				all = false;
				break;
			}
			i++;
			for (j = 0, sublen = optShowSeq[i].length; j < sublen; j++){
				cb = baidu.g('HSList_' + optShowSeq[i-1] + '_' + optShowSeq[i][j]);
				if (cb && !cb.disabled && !cb.checked){
					all = false;
					break;
				}
			}
			if (!all){
				break;
			}
		}
					
		if (all) {
			//全部
			baidu.dom.addClass(baidu.g('HSAll'), 'user_define_active');
			baidu.dom.removeClass(baidu.g('HSCustom'), 'user_define_active');
			hc.optType = 'all';
		}
		else {
			baidu.dom.removeClass(baidu.g('HSAll'), 'user_define_active');
			baidu.dom.addClass(baidu.g('HSCustom'), 'user_define_active');
			hc.optType = 'custom';
		}
	},
	
	setOptLevel : function(level){
		var hc = tool.historyCtrl,
		    index,
			optShowSeq = hc.optShowSeq;
		
		hc.level = level;
		
		if (!ui.util.get('historySSDialog') || !baidu.g('HSListDiv')){
			return;
		}
				
		switch (level){
			case "account":
			    index = 0;
				break;
			case "plan":
			    index = 2;
				break;
			case "unit":
			    index = 4;
				break;
			case "keyword":
			    index = 6;
				break;
			case "idea":
			    index = 8;
				break;
			case "sublink":
				index = 10;
				break;
			case "app":
			   index = 12;
				break;
			
		}
		
		//index以前的项都置灰
		hc.setOptLevelDisabled(0, index, 1);
		//index所在项可选
		hc.setOptLevelDisabled(index, index + 2, 0);
		//如果是account、plan或unit，index后的项均可选
		//否则均不可选，因为unit以后的所有层级都是同一级的
		if (level == "account" || level == "plan" || level == "unit") {
			hc.setOptLevelDisabled(index + 2, optShowSeq.length, 0);
		}
		else {
			hc.setOptLevelDisabled(index + 2, optShowSeq.length, 1);
		}
		//index所在项可选
		hc.setOptLevelDisabled(index, index + 2, 0);
		hc.judgeOptStyle();
		if (hc.optType == 'all'){
			baidu.g('optRange').innerHTML = '全部';
		}else{
			baidu.g('optRange').innerHTML = '自定义';
		}
	},
	
	setOptLevelDisabled: function(start, end, disable){
		var hc = tool.historyCtrl, i, len, cb, j, sublen, optShowSeq = hc.optShowSeq;
		for (i = start, len = end; i < len; i++) {
			cb = baidu.g('HSType_' + optShowSeq[i]);
			cb.disabled = disable;
			i++;
			for (j = 0, sublen = optShowSeq[i].length; j < sublen; j++) {
				cb = baidu.g('HSList_' + optShowSeq[i - 1] + '_' + optShowSeq[i][j]);
				cb.disabled = disable;
			}
		}
	},
	
	/**
	 * 获取当前操作optCountents
	 */
	getOptList : function(){
		var hc = tool.historyCtrl,
		    optContent = hc.optContent,
			optShowSeq = hc.optShowSeq,
			i,len,j,sublen,cb,key,result = {};
			
		if (ui.util.get('historySSDialog') && baidu.g('HSListDiv')){
			for (i = 0, len = optShowSeq.length; i < len; i++){
				cb = baidu.g('HSType_' + optShowSeq[i]);
				if (cb.disabled || !cb.checked){
					i++;
					continue;
				}
				key = optContent[optShowSeq[i]].key;
				if(typeof result[key] == 'undefined'){
                   result[key] = []; 
                }
				i++;
				for (j = 0, sublen = optShowSeq[i].length; j < sublen; j++){
					cb = baidu.g('HSList_' + optShowSeq[i-1] + '_' + optShowSeq[i][j]);
					if (cb.checked){
						result[key].push(optShowSeq[i][j]);
					}
				}
			}
		}else{
		    var creativeopt = hc.mergeArray(optShowSeq[11],optShowSeq[13]);
		    switch(hc.level){
				case 'account':
				    result.useracct = optShowSeq[1];
					result.planinfo = optShowSeq[3];
					result.unitinfo = optShowSeq[5];
					result.wordinfo = optShowSeq[7];
					result.ideainfo = optShowSeq[9];
					result.creativeinfo = creativeopt;
					break;
				case 'plan':
					result.planinfo = optShowSeq[3];
					result.unitinfo = optShowSeq[5];
					result.wordinfo = optShowSeq[7];
					result.ideainfo = optShowSeq[9];
					result.creativeinfo = creativeopt;
					break;
				case 'unit':
					result.unitinfo = optShowSeq[5];
					result.wordinfo = optShowSeq[7];
					result.ideainfo = optShowSeq[9];
					result.creativeinfo = creativeopt;
					break;
				case 'keyword':
					result.wordinfo = optShowSeq[7];
					break;
				case 'idea':
					result.ideainfo = optShowSeq[9];
					break;		
				case 'sublink':
					result.creativeinfo = optShowSeq[11];
					break;
				case 'app':
                    result.creativeinfo = optShowSeq[13];
					break;
			}
		}
		//周预算引入的多值
		var tempStr,reResult = {};
		for (var lev in result){
			reResult[lev] = []
			for (i = 0, len = result[lev].length; i < len; i++){
				tempStr = result[lev][i] + '';
				tempStr = tempStr.split(',');
				reResult[lev].push(tempStr[0] - 0);
				if (tempStr.length > 1){
					for (j = 1, sublen = tempStr.length; j < sublen; j++){
						reResult[lev].push(tempStr[j] - 0)
					}
				}
			}
			
		}	
		return reResult;
	},
	
	/**
	 * 重新请求
	 */
	refreshQuery : function(){
		var hc = tool.historyCtrl,
			me = hc.me,
			historySelectedList = me._controlMap.historySelectedList,
			datasource = historySelectedList.datasource,
			date = ui.util.get("historyCalendar").getValue(),
			optContent = hc.getOptList(),
			noneContent = true,
			dateRange = {
							begin : baidu.date.format(date.begin,"yyyy-MM-dd"),
		                	end : baidu.date.format(date.end,"yyyy-MM-dd")
						};
		if (datasource.length == 0){
			baidu.g('targetValueErrorMsg').innerHTML = '请选定对象';
            baidu.show('targetValueErrorMsg');
			return;
		}
		baidu.hide('historyMaterialWrap');
		for (var i in optContent){
			if (optContent[i].length > 0){
				//有选择范围
				noneContent = false;
			}
		}
		if (noneContent){
			baidu.g('optErrorMsg').innerHTML = '请您至少选择一项操作内容';
            baidu.show('optErrorMsg');
			return;
		}
		
		//操作人名称
		me.setContext('historyOptName', ui.util.get('optUser').getValue());

		//时间
		me.setContext('historyCalendarDateBegin', dateRange.begin);
		me.setContext('historyCalendarDateEnd', dateRange.end);
		//选定对象
		me.setContext('historySelectedData',datasource);
		//统计范围
		me.setContext('historyOptContent',{});
		
		me.refresh();
	},
	
	/**
	 * 发起获取历史操作数据请求
	 */
	queryHistory : function(){
		var hc = tool.historyCtrl,
			me = hc.me,
			param = {},
			urlParam = [],
			key;
		
		param.optMaterials = hc.getMertailList();
		switch (hc.level){
			case 'account':
				key = 'useracct';
				break;
			case 'plan':
				key = 'planinfo';
				break;
			case 'unit':
				key = 'unitinfo';
				break;
			case 'keyword':
				key = 'wordinfo';
				break;
			case 'idea':
				key = 'ideainfo';
				break;
			case 'sublink':
			case 'app':
				key = 'creativeinfo';
				break;
		}
		
		if (me.arg.refresh && param.optMaterials[key].length > 0){
			param.qtype = 4;
			param.pageNo = 1;
			param.pageSize = 5000; //Todo:>5000的处理逻辑
			param.opName = me.getContext('historyOptName');
			param.starttime = me.getContext('historyCalendarDateBegin');
			param.endtime = me.getContext('historyCalendarDateEnd');
			param.optContents = hc.getOptList();
			param.onSuccess = hc.queryHistorySuccess;
			param.onFail = hc.queryHistoryFail;
			
			urlParam[urlParam.length] = 'userid=' + nirvana.env.USER_ID;
			if (param.opName != ''){
				urlParam[urlParam.length] = 'opName=' + encode(param.opName);
			}
			urlParam[urlParam.length] = 'qtype=' + 4;
			urlParam[urlParam.length] = 'starttime=' + param.starttime;
			urlParam[urlParam.length] = 'endtime=' + param.endtime;
			
			var temp = [];
			for (var i in param.optContents){
				temp[temp.length] = i + ':' + param.optContents[i].join(',');
			}
			urlParam[urlParam.length] = 'optContents=' + temp.join(';');
			
			for (var i in param.optMaterials){
				urlParam[urlParam.length] = 'optMaterialsLevel=' + i;
				urlParam[urlParam.length] = 'optMaterialIds=' + param.optMaterials[i].join(',');
			}
			me.setContext('historyDownloadUrl', 'tool/optlog/download_optlog.do?' + urlParam.join('&'));
			me.setContext('historyPageNo',1);
			fbs.history.getHistory.clearCache();
			fbs.history.getHistory(param);
		}else{
			hc.dataCache =[];
			me.setContext('historyListData', []); 
			me.setContext('noDataHtml', "");
			hc.callback();
		}
	},
	
	/**
	 * 数据获取成功
	 * @param {Object} res
	 */
	queryHistorySuccess : function(res){	
		var hc = tool.historyCtrl,
		    me = hc.me,
			pageSize = me.getContext('historyPageSize'),
		    pageNo = me.getContext('historyPageNo') || 1,
			totalNum = res.data.listData.length,
			resCopy;
			
		hc.dataCache = nirvana.manage.orderData(res.data.listData, me.getContext("orderBy"), me.getContext("orderMethod"));;
		hc.index = 0;
		
		me.setContext('totalNum', totalNum);
		me.setContext('totalPage', Math.ceil(totalNum/pageSize));
		
		me.setContext('historyListData', hc.getDataPerPage(pageSize, pageNo));	
		me.setContext('noDataHtml', FILL_HTML.NO_DATA);	
		
		hc.callback();
	},
	
	/**
	 * 数据获取失败
	 */
	queryHistoryFail : function(){
		var hc = tool.historyCtrl,
		    me = hc.me;
		hc.dataCache =[];
		me.setContext('historyListData', []); 
		hc.callback();
	},
	
	/**
	 * 层级列
	 */
	renderLevel : function (item) {
		var hc = tool.historyCtrl,
			title,
			className,
			html = [];
			
		switch (item.optlevel + ''){
			case '3':
				title = '账户';
				className = 'acct';
				break;
			case '2':
				title = '计划';
				className = 'plan';
				break;
			case '1':
				title = '单元';
				className = 'unit';
				break;
			case '5':
				title = '关键词';
				className = 'keyword';
				break;
			case '4':
				title = '创意';
				className = 'idea';
				break;
			case '7':
				title = '附加创意';
				className = 'creative';
		}
		html[html.length] = '<div class="history_level_icon ' + className + '" title="' + title + '">' + title + '</div>';
		
	    return html.join('');
	},
	
	/**
	 * 内容列
	 */
	renderContent : function (item) {
		var hc = tool.historyCtrl,
			optContent = hc.optContent,
			str = [];
		if (item.optlevel == 3){
			str.push('<span>')
		}else{
			str.push('<span class="ui_bubble" bubblesource="historyLevelDetail" bubbleContentIndex="' + hc.index +'">')
		}
		
		//str.push('[' + getCutString(baidu.encodeHTML(baidu.decodeHTML(item.levelkey)), 32, '...') + ']</span>');
		str.push(getCutString(item.levelkey, 32, '...') + '</span>');
		hc.index++;
	    return str.join('');
	},
	
	/**
	 * 操作详情列
	 */
	renderOptDetail : function(item){
		var hc = tool.historyCtrl,
			optContent = hc.optContent,
			str = [],
			nValue = (item.newvalue || '') + '',
			oValue = (item.oldvalue || '') + '',
			levelkey = (item.levelkey || '') + '';
		
		//nValue = escapeQuote(baidu.encodeHTML(nValue));
		//oValue = escapeQuote(baidu.encodeHTML(oValue));
		//levelkey = escapeQuote(getCutString(levelkey, 26, '...'));
		if(getLengthCase(levelkey) > 30){
			levelkey = '<span title="' + baidu.encodeHTML(levelkey) + '">' +
					  getCutString(levelkey, 30, '...') + '</span>';
		} else {
			levelkey = baidu.encodeHTML(levelkey);
		}
		
		if(getLengthCase(nValue) > 30){
			nValue = '<span title="' + baidu.encodeHTML(nValue) + '">' +
					  getCutString(nValue, 30, '...') + '</span>';
		} else {
			if (nValue == '' || nValue == '--' || nValue == '-'){
				nValue = '无';
			}else{
				nValue = baidu.encodeHTML(nValue);
			}
		}
		
		if(getLengthCase(oValue) > 30){
			oValue = '<span title="' + baidu.encodeHTML(oValue) + '">' +
					  getCutString(oValue, 30, '...') + '</span>';
		} else {
			if (oValue == '' || oValue == '--' || oValue == '-'){
				oValue = '无';
			}else{
				oValue = baidu.encodeHTML(oValue);
			}
		}
		
		if (item.optlevel == 3){	//账户
		    switch('' + item.optcontentid){
				case '1':	//日预算
				    oValue = oValue == '无' ? '不限定预算' : (oValue + '元/日');
					nValue = nValue == '无' ? '不限定预算' : (nValue + '元/日');
				    str.push(hc.optIcon.mod + '修改账户日预算从' + oValue + '至' + nValue);
					break;
				case '41':	//日预算->日预算
				    if (oValue == '无'){
						str.push(hc.optIcon.mod + '修改账户不限定预算为日预算' + nValue + '元/日');
					}else if (nValue == '无'){
						str.push(hc.optIcon.mod + '修改账户日预算' + oValue + '元/日为不限定预算');
					}else{
						str.push(hc.optIcon.mod + '修改账户日预算从' + oValue + '元/日至'+ nValue + '元/日');
					}
					break;
				case '42':	//日预算->周预算
				    if (oValue == '无'){
						str.push(hc.optIcon.mod + '修改账户不限定预算为周预算' + nValue + '元/日');
					}else if (nValue == '无'){
						str.push(hc.optIcon.mod + '修改账户日预算' + oValue + '元/日为不限定预算');
					}else{
						str.push(hc.optIcon.mod + '修改账户日预算为周预算从' + oValue + '元/日至'+ nValue + '元/周');
					}
					break;
				case '43':	//周预算->日预算
				    if (oValue == '无'){
						str.push(hc.optIcon.mod + '修改账户不限定预算为日预算' + nValue + '元/日');
					}else if (nValue == '无'){
						str.push(hc.optIcon.mod + '修改账户周预算' + oValue + '元/周为不限定预算');
					}else{
						str.push(hc.optIcon.mod + '修改账户周预算为日预算从' + oValue + '元/周至'+ nValue + '元/日');
					}
					break;
				case '44':	//周预算->周预算
				    if (oValue == '无'){
						str.push(hc.optIcon.mod + '修改账户不限定预算为周预算' + nValue + '元/周');
					}else if (nValue == '无'){
						str.push(hc.optIcon.mod + '修改账户周预算' + oValue + '元/周为不限定预算');
					}else{
						str.push(hc.optIcon.mod + '修改账户周预算从' + oValue + '元/周至'+ nValue + '元/周');
					}
					break;
				case '2':	//推广地域
					oValue = oValue == '无' ? '全部推广地域' : oValue;
					nValue = nValue == '无' ? '全部推广地域' : nValue;
				    str.push(hc.optIcon.mod + '修改账户推广地域从' + oValue + '至' + nValue);
					break;
				case '28':	//激活时长设置
				    str.push(hc.optIcon.mod + '修改账户关键词/创意激活时长设置从' + (oValue == 0 ? '立即确认至' : (oValue + '小时内确认至')) + (nValue == 0 ? '立即确认' : (nValue + '小时内确认')));
					break;
				case '3':	//IP排除
				    if (item.opttypeid == 2) { 			//增加
						str.push(hc.optIcon.add + '新增账户IP排除' + nValue);
					} else if (item.opttypeid == 3) { 	//删除
						str.push(hc.optIcon.del + '删除账户IP排除' + nValue);
					} else {							//修改
						str.push(hc.optIcon.mod + '修改账户IP排除从' + oValue + '至' + nValue);
					}
					break;
			}
		}
		if (item.optlevel == 2){	//计划
			switch (item.optcontentid + ''){
				case '22':
				    str.push(hc.optIcon.add + '新增推广计划' + levelkey);
					break;
				case '20':
				    str.push(hc.optIcon.del + '删除推广计划' + levelkey);
					break;
				case '10':
				    if (item.opttypeid == 6){									//启用
						str.push(hc.optIcon.mod + '启用推广计划' + levelkey);
					}else if (item.opttypeid == 5){								//暂停
						str.push(hc.optIcon.mod + '暂停推广计划' + levelkey);
					}
					break;
				case '6':
					str.push(hc.optIcon.mod + '修改推广时段从' + oValue + '至' + nValue);
					break;
				case '1':
					oValue = oValue == '无' ? '不限定预算' : (oValue + '元/日');
					nValue = nValue == '无' ? '不限定预算' : (nValue + '元/日');
				    str.push(hc.optIcon.mod + '修改推广计划' + levelkey + '日预算从' + oValue + '至' + nValue);
					break;
				case '2':
					oValue = oValue == '无' ? '账户推广地域' : oValue;
					nValue = nValue == '无' ? '账户推广地域' : nValue;
					str.push(hc.optIcon.mod + '修改推广计划' + levelkey + '推广地域从' + oValue + '至' + nValue);
					break;
				case '16':
				    str.push(hc.optIcon.mod + '修改推广计划' + levelkey + '展现方式从' + oValue + '至' + nValue);
					break;
				case '8':
					if (item.opttypeid == 2) { 									//增加
						str.push(hc.optIcon.add + '新增推广计划' + levelkey + '的否定关键词' + nValue);
					} else if (item.opttypeid == 3) { 							//删除
						str.push(hc.optIcon.del + '删除推广计划' + levelkey + '的否定关键词' + nValue);
					}  else if (item.opttypeid == 4) { 							//修改
						str.push(hc.optIcon.mod + '修改推广计划' + levelkey + '的否定关键词从' + oValue + '至' + nValue);
					}
					break;
				case '34':
				    if (item.opttypeid == 2) { 									//增加
						str.push(hc.optIcon.add + '新增推广计划' + levelkey + '的精确否定关键词' + nValue);
					} else if (item.opttypeid == 3) { 							//删除
						str.push(hc.optIcon.del + '删除推广计划' + levelkey + '的精确否定关键词' + nValue);
					} else if (item.opttypeid == 4) { 							//修改
						str.push(hc.optIcon.mod + '修改推广计划' + levelkey + '的精确否定关键词从' + oValue + '至' + nValue);
					} 
					break;
				case '5':
				    str.push(hc.optIcon.mod + '修改推广计划' + levelkey + '参与网盟推广设置修改为' + nValue);
					break;
				case '30':
					oValue = oValue == '无' ? '无' : (oValue + '元');
					nValue = nValue == '无' ? '无' : (nValue + '元');
				    str.push(hc.optIcon.mod + '修改推广计划' + levelkey + '网盟推广出价从' + oValue + '至' + nValue);
					break;
				case '46':	//切换投放设备
				//	if (oValue == '无') {
				//		str.push(hc.optIcon.mod + '添加投放设备' + nValue);
				//	}
				//	else {
						str.push(hc.optIcon.mod + '投放设备从' + oValue + '修改为' + nValue);
				//	}
					break;
				case '47':	//推广电话
					if(oValue == '无'){
						str.push(hc.optIcon.add+'添加推广电话为' + nValue);
					}else if(nValue == '无'){
						str.push(hc.optIcon.del + '删除推广电话' + oValue);
					}else{
						str.push(hc.optIcon.mod + '将推广电话' + oValue + '修改为' + nValue);
					}
					break;
				case '48'://勾选投放设备
					str.push(hc.optIcon.mod + '勾选多设备推广管理');
					break;
				case '49'://启用暂停商桥
					if (item.opttypeid == 6){									//启用
						str.push(hc.optIcon.mod + '启用商桥移动咨询' );
					}else if (item.opttypeid == 5){								//暂停
						str.push(hc.optIcon.mod + '取消启用商桥移动咨询' );
					}
					break;
				case '50':
				 str.push(hc.optIcon.mod + '修改推广计划' + levelkey + '移动出价比例从' + oValue + '至' + nValue);
					break;
					
			}	
		}
		if (item.optlevel == 1){	//单元
			switch (item.optcontentid + ''){
				case '23':
				    str.push(hc.optIcon.add + '新增推广单元' + levelkey);
					break;
				case '19':
				    str.push(hc.optIcon.del + '删除推广单元' + levelkey);
					break;
				case '10':
				    if (item.opttypeid == 6){									//启用
						str.push(hc.optIcon.mod + '启用推广单元' + levelkey);
					}else if (item.opttypeid == 5){								//暂停
						str.push(hc.optIcon.mod + '暂停推广单元' + levelkey);
					}
					break;
				case '12':
					oValue = oValue == '无' ? '无' : (oValue + '元');
					nValue = nValue == '无' ? '无' : (nValue + '元');
				    str.push(hc.optIcon.mod + '修改推广单元' + levelkey + '出价从' + oValue + '至' + nValue);
					break;
				case '21':
				    str.push(hc.optIcon.mod + '修改推广单元名称从' + oValue + '至' + nValue);
					break;
				case '8':
					if (item.opttypeid == 2) { 									//增加
						str.push(hc.optIcon.add + '新增推广单元' + levelkey + '的否定关键词' + nValue);
					} else if (item.opttypeid == 3) { 							//删除
						str.push(hc.optIcon.del + '删除推广单元' + levelkey + '的否定关键词' + nValue);
					} else if (item.opttypeid == 4) { 							//修改
						str.push(hc.optIcon.mod + '修改推广单元' + levelkey + '的否定关键词从' + oValue + '至' + nValue);
					} 
					break;
				case '34':
				    if (item.opttypeid == 2) { 									//增加
						str.push(hc.optIcon.add + '新增推广单元' + levelkey + '的精确否定关键词' + nValue);
					} else if (item.opttypeid == 3) { 							//删除
						str.push(hc.optIcon.del + '删除推广单元' + levelkey + '的精确否定关键词' + nValue);
					} else if (item.opttypeid == 4) { 							//修改
						str.push(hc.optIcon.mod + '修改推广单元' + levelkey + '的精确否定关键词从' + oValue + '至' + nValue);
					} 
					break;
			}	
		}
		if (item.optlevel == 5){	//关键词
			switch (item.optcontentid + ''){
				case '13':
				    str.push(hc.optIcon.add + '新增关键词' + levelkey);
					break;
				case '18':
				    str.push(hc.optIcon.del + '删除关键词' + levelkey);
					break;
				case '10':
				    if (item.opttypeid == 6){									//启用
						str.push(hc.optIcon.mod + '启用关键词' + levelkey);
					}else if (item.opttypeid == 5){								//暂停
						str.push(hc.optIcon.mod + '暂停关键词' + levelkey);
					}
					break;
				case '12':
					oValue = oValue == '无' ? '单元出价' : (oValue + '元');
					nValue = nValue == '无' ? '单元出价' : (nValue + '元');
				    str.push(hc.optIcon.mod + '修改关键词' + levelkey + '出价从' + oValue + '至' + nValue);
					break;
				case '27':
					if(oValue.indexOf('短语:') > -1){
						oValue = '短语';
					}
				    str.push(hc.optIcon.mod + '修改关键词' + levelkey + '匹配方式从' + oValue + '至' + nValue);
					break;
				case '17':
				    str.push(hc.optIcon.mod + '激活关键词' + levelkey);
					break;
				case '32':
				    str.push(hc.optIcon.mod + '转移关键词' + levelkey + '从计划' + oValue + '至计划' + nValue);
					break
				case '25':
				    str.push(hc.optIcon.mod + '修改关键词' + levelkey + 'url从' + oValue + '至' + nValue);
					break
				case '51':
                    str.push(hc.optIcon.mod + '修改关键词' + levelkey + '移动url从' + oValue + '至' + nValue);
                    break
				
			}	
		}
		if (item.optlevel == 4){	//创意
			switch (item.optcontentid + ''){
				case '24':
				    str.push(hc.optIcon.add + '新增创意' + levelkey);
					break;
				case '29':
				    str.push(hc.optIcon.del + '删除创意' + levelkey);
					break;
				case '10':
				    if (item.opttypeid == 6){									//启用
						str.push(hc.optIcon.mod + '启用创意' + levelkey);
					}else if (item.opttypeid == 5){								//暂停
						str.push(hc.optIcon.mod + '暂停创意' + levelkey);
					}
					break;
				case '26':
				    str.push(hc.optIcon.mod + '修改创意' + oValue + '为' + nValue);
					break;
				case '17':
				    str.push(hc.optIcon.mod + '激活创意' + levelkey);
					break;
			}	
		}
		if (item.optlevel == 7) { //创意
			switch (item.optcontentid + '') {
			    case '56':
                    str.push(hc.optIcon.mod + '修改app' + oValue + '为' + nValue);
                    break;
			    case '57':
					str.push(hc.optIcon.add + '新增app推广' + levelkey);
					break;
			    case '58':
					str.push(hc.optIcon.del + '删除app推广' + levelkey);
					break;
			
				case '59':
					if (item.opttypeid == 6) { //启用
						str.push(hc.optIcon.mod + '启用app推广' + levelkey);
					}
					else 
						if (item.opttypeid == 5) { //暂停
							str.push(hc.optIcon.mod + '暂停app推广' + levelkey);
						}
					break;
				case '60':
					str.push(hc.optIcon.add + '新增子链' + levelkey);
					break;
				case '61':
					str.push(hc.optIcon.del + '删除子链' + levelkey);
					break;
				case '62':
					str.push(hc.optIcon.mod + '修改子链' + oValue + '至' + nValue);
					break;
				case '63':
					if (item.opttypeid == 6) { //启用
						str.push(hc.optIcon.mod + '启用子链' + levelkey);
					}
					else 
						if (item.opttypeid == 5) { //暂停
							str.push(hc.optIcon.mod + '暂停子链' + levelkey);
						}
					break;
			}
		}
	    return str.join('');
	},
	
	/**
	 * 每页显示数量
	 */
	getPageSizeHandler : function (value) {
	    var hc = tool.historyCtrl,
			me = hc.me,
			historyTableList = ui.util.get('historyTableList'),
			historyPagination = ui.util.get('historyPagination'),
			totalNum = me.getContext('totalNum'),
			totalPage,datasource;
		
		hc.index = 0;
			
        me.setContext('historyPageSize', value);
		datasource = hc.getDataPerPage(value, 1);
		me.setContext('historyListData', datasource);		
		historyTableList.datasource = datasource;
		historyTableList.render(historyTableList.main);
		totalPage = Math.ceil(totalNum/value);
		me.setContext('totalPage', totalPage);
		me.setContext('historyPageNo',1);
		historyPagination.total = totalPage;
		historyPagination.page = 1;
		historyPagination.render(historyPagination.main);
		
		ui.Bubble.init();
	},
	
	/**
	 * 翻页
	 */
	getPaginationHandler : function (value) {
	   	var hc = tool.historyCtrl,
			me = hc.me,
			historyTableList = ui.util.get('historyTableList'),
			datasource,
			pageSize = me.getContext('historyPageSize');
		
		hc.index = pageSize * (value - 1);
			
        me.setContext('historyPageNo',value);
        datasource = hc.getDataPerPage(pageSize, value);
		me.setContext('historyListData', datasource);		
		historyTableList.datasource = datasource;
		historyTableList.render(historyTableList.main);
		
		ui.Bubble.init();
	},
	
	/**
	 * 获取每页
	 */
	getDataPerPage : function(pageSize, pageNo){
		var hc = tool.historyCtrl,
		    data = hc.dataCache,
		    result = [];
		
		for (var i = 0, len = data.length; i < len; i++){
			result[i] = data[i];
		}
		return nirvana.util.getPageData(result, pageSize, pageNo);
	},
	
	getSortHandler : function(sortField,order){
		var hc = tool.historyCtrl,
			datasource = hc.dataCache,
			me = hc.me,
			historyTableList = ui.util.get('historyTableList'),
			historyPagination = ui.util.get('historyPagination'),
			totalNum = me.getContext('totalNum'),
			pageSize = me.getContext('historyPageSize'),
			field = sortField.field;
		
		hc.index = 0;
		
		//页码
		me.setContext('historyPageNo',1);
		historyPagination.page = 1;
		historyPagination.render(historyPagination.main);
		
		me.setContext("orderBy",field);
		me.setContext("orderMethod",order);
		//数据
		hc.dataCache = nirvana.manage.orderData(datasource, field, order);
		datasource = hc.getDataPerPage(pageSize, 1);
		me.setContext('historyListData', datasource);		
		historyTableList.datasource = datasource;
		historyTableList.render(historyTableList.main);
		
		ui.Bubble.init();
	},
    
    mergeArray:function(arr1,arr2){
    var res = [];
        for (var i = 0, len = arr1.length; i < len; i++){
            res.push(arr1[i]);
        }
        for (var i = 0, len = arr2.length; i < len; i++){
            res.push(arr2[i]);
        }
        return res;
    }
}

/**
 * 气泡
 */
ui.Bubble.source.historyLevelDetail = {
	type : 'normal',
	iconClass : 'ui_bubble_icon_info',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	showByClick : true,
	showByOver : true,			//鼠标悬浮延时显示
	showByOverInterval : 500,	//悬浮延时间隔
	hideByOut : true,			//鼠标离开延时显示
	hideByOutInterval : 2000,	//离开延时间隔，显示持续时间
	title: function(node){
		var ti = node.getAttribute('bubbleContentIndex');
			
		return insertWbr(baidu.encodeHTML(baidu.decodeHTML(tool.historyCtrl.dataCache[ti].levelkey)));
	},
	content: function(node, fillHandle, timeStamp){
		var ti = node.getAttribute('bubbleContentIndex'),
		    param = tool.historyCtrl.dataCache[ti],
		    html = [];
		
		if (!param) {
			return;
		}
		
		html[html.length] = '<ul class="rank_bubble_content">';
		html[html.length] = '<li title="' + baidu.encodeHTML(param.username) + '"><span>所属账户：</span>' + baidu.encodeHTML(param.username) + '</li>';
		if (param.optlevel == 5 || param.optlevel == 4 || param.optlevel == 7) {
			html[html.length] = '<li title="' + baidu.encodeHTML(param.planname) + '"><span>所属推广计划：</span>' + baidu.encodeHTML(param.planname) + '</li>';
			html[html.length] = '<li title="' + baidu.encodeHTML(param.unitname) + '"><span>所属推广单元：</span>' + baidu.encodeHTML(param.unitname) + '</li>';
		} else if (param.optlevel == 1) {
			html[html.length] = '<li title="' + baidu.encodeHTML(param.planname) + '"><span>所属推广计划：</span>' + baidu.encodeHTML(param.planname) + '</li>';
		}
		html[html.length] = '</ul>';
		
		return html.join('');
	}
};