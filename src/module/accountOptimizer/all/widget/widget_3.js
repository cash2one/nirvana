/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/all/widget/widget_3.js 
 * desc: 账户优化子项详情，关键词质量度过低无法获取稳定的左侧展现资格
 * author: LeoWang(wangkemiao@baidu.com)
 * date: $Date: 2011/07/21 $
 */


ao.widget3 = new er.Action({
	VIEW: 'widgetDetail3',
	
    /**
     * 工具箱里的子action不能保持状态，不能设置保持项
     */
    STATE_MAP: {},
	
	UI_PROP_MAP : {
		WidgetTable : {
			fields : "*widgetTableFields",
			datasource : "*widgetTableData",
			noDataHtml : FILL_HTML.NO_DATA,
			select : "multi"
		},
		WidgetPage : { // 分页控件
			page : '*pageNo',
			total : '*totalPage'
		}
	},
	
	CONTEXT_INITER_MAP: {
		init : function(callback) {
			var me = this,
				pageNo = me.getContext('pageNo') || me.arg.pageNo || 1,
				tipMsg;
			
			me.setContext('pageNo', pageNo);
			me.setContext('pageSize', 10);
			me.setContext('opttype', 3);
			
			tipMsg = '以下关键词因质量度过低而无法获得稳定的左侧展现资格。星级颜色表征了关键词通过优化创意获得推左资格的难度，建议立即通过新增或修改创意的方式对较易优化的关键词进行优化。<br/>'+
                        qStar.getStar(11) + '：较易优化； ' + 
                        qStar.getStar(12) + '：难度中等； ' + 
                        qStar.getStar(13) + '：较难优化。';

			me.setContext('WidgetDetailTip', tipMsg);
			
			//document.documentElement.style.overflow = "scroll";  
			
			callback();
		},
		WidgetTable : function(callback){
			var me = this,
				tableFields = [
		       		{
		    			field : 'showword',
		    			title : '关键词',
		    			width : 160,
		    			//align : "center",
		    			content: function(item){
							var html = '',
								func = nirvana.aoWidgetRender.wordinfo(22);
											
							if (item.isdecr) {
								//将最大长度缩短来放突降图标
								item.decrLimit = true;
								html += func(item);
								html += nirvana.aoWidgetAction.makeBubble(me,'昨日质量度突变',item)
							}else{
								html += func(item);
							}
							return html;
						}
		    		},
		    		{
		    			field : 'planname',
		    			title : '推广计划',
		    			width : 170,
						//breakLine: true,
		    			content : nirvana.aoWidgetRender.planinfo()
		    		},
		    		{
		    			field : 'unitname',
		    			title : '推广单元',
		    			width : 170,
						//breakLine: true,
		    			content : nirvana.aoWidgetRender.unitinfo()
		    		},
		    		{
		    			field : 'showqstat',
		    			title : '质量度',
		    			width : 50,
		    			content : me.tableColRender.showqstat
		    		},
		    		{
		    			field : 'clks',
		    			title : '点击',
		    			width : 50,
		    			align : 'right',
						//breakLine: true,
		    			content : function(item){
		    				return item.clks;
		    				var data = item.clks;
							if (data == '' || data == '-') {
								return data;
							}
							return parseNumber(data);
		    			}
		    		},
		    		{
		    			field : 'paysum',
		    			title : '消费',
		    			width : 50,
		    			align : 'right',
						//breakLine: true,
		    			content : function(item){
		    				var data = item.paysum;
							if (data == '' || data == '-') {
								return data;
							}
							return baidu.number.fixed(data);
		    			}
		    		},
		    		{
		    			field : 'operation',
		    			title : '操作',
		    			width : 150,
						//breakLine: true,
		    			content : me.tableColRender.operations
		    		}
		    	];
			if (!me.arg.refresh) { // 表头固定，只在第一次渲染时设置fields
				me.setContext("widgetTableFields", tableFields);
			}
			
			// 获取表格数据
			me.getTableData(callback);
		},
		// page渲染
		widgetPage : function(callback) {
			var me = this,
				totalPage = 15;
			
			//me.setContext('totalPage', totalPage);
			
			callback();
		}
	},
	
	onafterrender: function(){
		var me = this,
			controlMap = me._controlMap;

		// 绑定下载事件
		nirvana.aoWidgetRender.download(me);
		
		controlMap.WidgetPage.onselect = me.getPageHandler();
		
		ui.util.get('WidgetTable').onselect = function(index){
			me.setContext('rowSelectedIndex', index.length == 0 ? null : index);
			ui.util.get('AoDetailDelete').disable(!me.getContext('rowSelectedIndex'));

            // 读写分离，待升级之后不用这种方式了
            // by Leo Wang
			nirvana.acc.accService.processEntrances('ao/manual/' + me.VIEW);
		};
		
		//表格行内事件处理
		controlMap.WidgetTable.main.onclick = me.getTableInlineHandler();
			
        // 读写分离，待升级之后不用这种方式了
        // by Leo Wang
		nirvana.acc.accService.processEntrances('ao/manual/' + me.VIEW);
	},
	
	onentercomplete: function(){
		var me = this,
			table = ui.util.get('WidgetTable'),
			controlMap = me._controlMap,
			i;
		ui.util.get('AoDetailClose').onclick = function() {
			me.onclose();
		};
		ui.util.get('AoDetailDelete').disable(!me.getContext('rowSelectedIndex'));
		ui.util.get('AoDetailDelete').onclick = function (){
			me.getDeleteKeywordHandler();
		};
		
		// 表格重新计算，避免表头计算错误
		controlMap.WidgetTable.refreshView();
		
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 获取表格数据
	 * @param {Object} callback
	 */
	getTableData : function(callback) {
		var me = this,
			params = nirvana.aoControl.params,
			startindex = (me.getContext('pageNo') - 1) * me.getContext('pageSize'),
			endindex = startindex + me.getContext('pageSize') - 1;
		
		fbs.ao.showQDetail({
			level: params.level,
			condition: params.condition,
			signature: '',
			startindex: startindex,
			endindex: endindex,
			
			onSuccess: function(response){
				var data = response.data,
					aostatus = data.aostatus,
					listData = data.listData;
				
				if (aostatus != 0) {
					switch (aostatus) {
						case 4: // 需要更详细的请求数据，不只是签名
							// 重新请求表格数据
							me.getTableData(callback);
							break;
						default:
							ajaxFailDialog(); // 相当于status 500
							break;
					}
					return;
				}
				
				// 保存最后一行数据 用以发翻页的监控
				me.setContext('keywordFootLine', listData[listData.length-1]);
				
				me.setContext('widget_no', data.totalnum);
				
				me.setContext('widgetTableData', listData);
				
				// 计算总页数
				var totalPage = Math.ceil(data.totalnum / me.getContext('pageSize'));
				// 保持原有逻辑，最大为100页
				totalPage = Math.min(totalPage, nirvana.config.AO.MAX_PAGE);
				
				me.setContext('totalPage', totalPage);
				callback();
			},
			onFail: function(response){
				ajaxFailDialog();
				callback();
			}
		});
	},
	
	/**
     * 表格行内操作事件代理器
     * 主要对某些操作按钮或者链接按钮执行响应函数的绑定
     */
    getTableInlineHandler: function() {
        var me = this;
        return function (e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
				logParams = {},
				type;

            while(target  && target != ui.util.get("WidgetTable").main){
            	

                if(target.className && target.className == 'status_op_btn'){
                    var item = me.getSubTableLineData(target);
        			var actname = item.pausestat == 1 ? '启用' : '暂停',
        				title = actname + '创意',
        				msg = '您确定要' + actname + '所选择的创意吗？',
        				wordInView = me.getContext('wordInView'),
						logParam = {
							planid : item.planid,
							unitid : item.unitid,
							ideaid : item.ideaid,
							winfoid : wordInView.winfoid,
							showq_difficulty : qStar.getShowqDifficulty(wordInView.showqstat),
							type : -2
						},
						targetstr = '';
        			
					if (item.pausestat == 1) { // 暂停状态
						item.actionMode = 'start';
						targetstr = 'aowidget_resume_idea';
					} else {
						item.actionMode = 'pause';
						targetstr = 'aowidget_pause_idea';
					}
        			
					me.logCenter(targetstr, logParam);
					
        			ui.Dialog.confirm({
        				title: title,
        				content: msg,
        				onok: function() {
        					me.doInlineRunOrPause(item, target);
							
							logParam.type = 1;
							me.logCenter(targetstr, logParam);
        				},
						oncancel: function() {
							logParam.type = 0;
							me.logCenter(targetstr, logParam);
						}
        			});
        			
                    break;
                }
            	
                if(baidu.dom.hasClass(target, 'action_btn')){
                    var item = me.getLineData(target);
                	type = target.getAttribute('actiontype');
                	switch(type){
                		case "addidea":
                			me.getIdeaHandler('add', target);
                			break;
                		case "viewidea":
                			me.getIdeaHandler('view', target);
                			break;
                		case "deletekeyword":
	            			var parent = target.parentNode,
	            				winfoid = parent.getAttribute("winfoid");
							
                			me.getDeleteKeywordHandler([winfoid], item.showqstat);
                			break;
                	}
                	break;
                }
                
                
                if(baidu.dom.hasClass(target, 'edit_btn')){
                	type = target.getAttribute('edittype');
                	switch(type){
                		case 'ideaid':
                			me.getIdeaHandler('edit', target);
                			break;
                	}
                	break;
                }
                
				//小灯泡 by Tongyao
				if(baidu.dom.hasClass(target, 'status_icon')){
					logParams.target = "statusIcon_btn";
					manage.offlineReason.openSubAction({
						action : me,
						type : 'ideainfo',
						maskLevel : 2,
						params : target.getAttribute('data')
					});
					break;
				}
				
                target = target.parentNode;
            }
        };
    },
	
	/**
	 * 
	 * 获取针对于创意的操作处理函数
	 * @param {String} type 操作类型, view, add, delete
	 * @param {Object} target 操作的来源目标，一般都在当前数据表格行内，这样getSubTableLineData才能找到
	 * @returns {Function}
	 */
	getIdeaHandler : function(type, target){
		var me = this,
			parent = target.parentNode,
			winfoid = parent.getAttribute("winfoid"), 
			index = me.getLineData(target, true),
			item = (type == 'edit' ? me.getSubTableLineData(target) : me.getContext('widgetTableData')[index]), 
			param = {},
			table = ui.util.get('WidgetTable');
		
		switch(type){
			case 'view':
				//fireSubrow之前，可能需要先去将之前打开创意后显示的收起创意 改回为查看
				if(table.subrowIndex != null && table.subrowIndex != index){
					baidu.g(table.getSubentryId(table.subrowIndex)).innerHTML = '查看创意';
				}
				table.fireSubrow(index);
				target.innerHTML = target.innerHTML == '查看创意' ? '收起创意' : '查看创意';
				me.logCenter('aowidget_toggle_idealist', {
					type : target.innerHTML == '收起创意' ? 1 : 0,
					planid : item.planid,
					unitid : item.unitid,
					winfoid : item.winfoid,
					showq_difficulty : qStar.getShowqDifficulty(item.showqstat)
				});
				me.getIdeaListByKeyword(item, index);
				//保存当前展开的word的数据
				me.setContext('wordInView', item);

				break;
			case 'add':
				fbs.material.getCount({
					countParam : {
						mtlLevel: 'unitinfo',
						mtlId: item.unitid,
						targetLevel: 'ideainfo'
					},
					
					onSuccess : function(response) {
						var data = response.data;
						if (data >= IDEA_THRESHOLD) { //数量到达上限
							ui.Dialog.alert({
								title: '通知',
								content: nirvana.config.ERROR.IDEA.ADD['712']
							});
						} else {
							param.unitid = item.unitid;
							param.planid = item.planid;
							param.type = type;
							param.changeable = false;
							nirvana.aoWidgetAction.logCenter('aowidget_add_idea', {
								opttype : me.getContext('opttype'),
								planid : item.planid,
								unitid : item.unitid,
								winfoid : item.winfoid,
								showq_difficulty : qStar.getShowqDifficulty(item.showqstat)
							});
							//me.createSubAction(param);
							nirvana.aoWidgetAction.createSubActionForIdea(param, me);
						}
					},
					
					onFail : function(response) {
						ajaxFailDialog();
					}
				});
				break;
			case 'edit':
				param.ideaid = item.ideaid;
				param.type = type;
				param.changeable = false;
				//当前显示的关键词
				var wordInView = me.getContext('wordInView');
				nirvana.aoWidgetAction.logCenter('aowidget_edit_idea', {
					opttype : me.getContext('opttype'),
					planid : item.planid,
					unitid : item.unitid,
					ideaid : item.ideaid,
					winfoid : wordInView.winfoid,
					showq_difficulty : qStar.getShowqDifficulty(wordInView.showqstat)
				});
				nirvana.aoWidgetAction.createSubActionForIdea(param, me);
				break;
			default:
				break;
		}
	},
	
	/**
	 * 根据编辑按钮对象获取当前行数据，原理是向上找到td元素，获取其row属性，然后去得到该行的值
	 * @param {Object} target
	 * @param {Boolean} getIndex 是否返回index 可选
	 */
	getLineData: function(target, getIndex){
		var isFind = false;
		while (target && target.tagName != "TR") {
			if(target.tagName == "TD"){
				isFind = true;
				break;
			}
			target = target.parentNode;
		}
		if(isFind){
			var index = target.getAttribute("row");
			if('undefined' == typeof getIndex || !getIndex){
				return this.getContext('widgetTableData')[index];
			}
			else{
				return index;
			}
		}
		return false;
	},

	/**
	 * 根据编辑按钮对象获取子表格当前行数据，原理是向上找到td元素，获取其row属性，然后去得到该行的值
	 * @param {Object} target
	 * @param {Boolean} getIndex 是否返回index 可选
	 */
	getSubTableLineData : function(target, getIndex){
		var me = this,
			isFind = false,
			pageNo = me.getContext('subTablePageNo') || 1,
			pageSize = 3,
			currPrePageSize = (pageNo - 1) * pageSize;  //3为pageSize
		while (target && target.tagName != "TR") {
			if(target.tagName == "TD"){
				isFind = true;
				break;
			}
			target = target.parentNode;
		}
		if(isFind){
			var row = target.getAttribute("row");
			if('undefined' == typeof getIndex || !getIndex){
				return this.getContext('subrowTableData')[row - 0 + currPrePageSize];
			}
			else{
				return row - 0 + currPrePageSize;
			}
		}
		return false;
	},
	
	/**
	 * 获取选中的行的数据
	 * @param {Object} id 可以是字符串，也可以是数组，包括planid等任意的只要存在的且需要得到的数据
	 * @param {Boolean} isSub 指明是否是要去找当前的子表格元素 可选
	 * @return {Array} ids [planid, planid……] 如果是多个字段 则返回的是多维数组
	 */
    getSelected : function (id, isSub) {
        var me = this,
        	isSub = isSub || false,
            selectedList = (isSub ? me.getContext('subTableSelectedIndexes') : me.getContext('rowSelectedIndex')) || [],
            data = (isSub ? me.getContext('subrowTableData') : me.getContext('widgetTableData')),
            i, len, ids = [];
			
		if (baidu.lang.isArray(id)) {
			for (i = 0, len = selectedList.length; i < len; i++) {
				var dat = {};
				for (var j = 0, l = id.length; j < l; j++) {
					dat[id[j]] = data[selectedList[i]][id[j]];
				}
				ids.push(dat);
			}
		}
		else {
			if (id == "bid") {
				for (i = 0, len = selectedList.length; i < len; i++) {
					if (data[selectedList[i]][id]) {
						ids.push(data[selectedList[i]][id]);
					}
					else {
						ids.push(data[selectedList[i]]["unitbid"]);
					}
				}
			}
			else {
				for (i = 0, len = selectedList.length; i < len; i++) {
					ids.push(data[selectedList[i]][id]);
				}
			}
		}
        

        return ids;
    },
	
	/**
	 * 根据当前行keyword的信息去获取所有创意
	 * @param item 信息
	 * @param index 行索引
	 */
	getIdeaListByKeyword : function(item, index){
		var me = this;
		ui.util.get('WidgetTable').getSubrow(index).innerHTML = 'loading... ';
		ui.util.get('WidgetTable').getSubrow(index).style.borderBottom = "1px";
		nirvana.aoWidgetAction.getIdeaList(item, me.getIdeaListSuccessHandler(index));
		
		// 打开创意列表时，设置翻页为1
		me.setContext('subrowTablepageNo', 1);
	},
	
	/**
	 * 获取创意信息成功回调
	 * @param index 父表格的当前行索引
	 * @returns {Function}
	 */
	getIdeaListSuccessHandler : function(index){
		var me = this;
		return function(res){
			var data = res.data, listData, tablefields,
				pageNo, pageSize = 3;
			
			listData = data.listData;
			
			tablefields = [
				{
	    			field : 'ideainfo',
	    			title : '创意',
	    			width : 720,
					minWidth : 720,
	    			locked : true,
					//breakLine : true,
	    			//align : "center",
	    			content : me.tableColRender.ideainfo
	    		},
	    		{
	    			field : 'ideastatus',
	    			title : '状态',
	    			//breakLine : true,
	    			width : 100,
	    			align : "center",
	    			content : me.tableColRender.ideastatus
	    		}
			];
			ui.util.get('WidgetTable').getSubrow(index).innerHTML = '<div class="widget_option" id="subTableController' + index + '"></div><div class="widget_table"><div id="SubTableContainer' + index + '"></div></div>';
			ui.util.get('WidgetTable').getSubrow(index).style.padding = "10px";
			ui.util.get('WidgetTable').getSubrow(index).style.borderBottom = "1px solid #eee";
			
			me.setContext('subrowTableData', data.listData);
			me.setContext('subrowTableIndex', index);
			me.setContext('subrowTableFields', tablefields);
			me.renderSubrowTable(index, tablefields, listData, pageNo);
		};
	},
	
	/**
	 * 使用得到的创意内容去渲染子表格
	 * @param index 父表格当前行索引
	 * @param fields 子表格的fields
	 * @param data 子表格的data
	 * @param pageNo 当前页 of 子表格
	 * @param pageSize 页size of 子表格
	 */
	renderSubrowTable : function(index, fields, data, pageNo, pageSize){
		var me = this;
		pageNo = pageNo || 1;
		pageSize = pageSize || 3;
		var startIndex = (pageNo - 1) * pageSize,
			dataSum = (startIndex + pageSize) < data.length ? pageSize : data.length - startIndex,
			tableData = [];
		for(var i = 0; i < dataSum; i++){
			tableData.push(data[startIndex + i]);
		}
		var table, pager;
		if(null == baidu.g('SubTableContainer' + index)){
			table = ui.util.get('SubrowTable' + index);
			table.datasource = tableData;
			table.render();
		}
		else{
			table = ui.util.create('Table',
				{
					id : 'SubrowTable' + index,
					fields : fields,
					datasource : tableData,
					hasFoot : true,
					noDataHtml : FILL_HTML.NO_DATA,
					select : "multi"
				},
				baidu.g('SubTableContainer' + index)
			);
		}
		table.main.style.border = "1px solid #eee";
		table.main.style.borderBottom = 'none';
		
		
		me.setContext('subTableSelectedIndexes', []);
		
		//添加批量控制
		baidu.g('subTableController' + index).innerHTML = '<div id="subTableRenderContaienr' + index + '"><div id="subTableActiveButContainer' + index + '">激活</div></div>';
		//批量启用/暂停
		var runPause = ui.util.create('Select',
			{
				'id' : 'runOrPauseSelect' + index,
				'datasource' : [
					{text : '启用/暂停' , value : -9999},
					{text : '启用' , value : 'start'},
					{text : '暂停', value : 'pause'}
				],
				'width' : 100,
				'staticText' : '启用/暂停',
				'value' : -9999,
				'disabled' : '1'
			}
		);
		runPause.onselect = me.getSubTableMultiRunOrPauseHandler(index);
		runPause.appendTo(baidu.g('subTableController' + index));
		baidu.addClass(runPause.main, 'select_menu');
		
		
		//批量激活
		var activeBut = ui.util.create('Button', 
			{
				'id' : 'activeBut' + index
			},
			baidu.g('subTableActiveButContainer' + index)
		);
		activeBut.onclick = me.getSubTableMultiActiveHandler(index);
		activeBut.disable(true);

		//选择行时的响应函数
		ui.util.get('SubrowTable' + index).onselect = function(selected){
			//修正选择的数据在整个子table的data里面的位置
			for(var o in selected){
				selected[o] += (me.getContext('subTablePageNo') - 1) * pageSize;
			}
			
			me.setContext('subTableSelectedIndexes', selected);
			var enabled = selected.length > 0;
            runPause.disable(!enabled);
            //调整启用暂停下拉框 的disabled状态
            if(enabled) {
                me.setRunPauseOptionsState(selected, index);
            }
			//调整激活按钮 的disabled状态，只有待激活状态才需要激活
			me.setActiveState(selected, index, me.getContext('subTablePageNo'), pageSize);
		};

		if(data.length > pageSize && null == baidu.g('SubPagerContainer' + index)){
			//需要分页
			table.getFoot().innerHTML = '<div id="SubPagerContainer' + index + '"></div>';
			table.getFoot().style.padding = '5px';
			table.getFoot().style.fontWeight = '300';
			table.getFoot().style.textAlign = "center";
			var newpager = ui.util.create('Page', 
				{
					id : 'SubrowPager' + index,
					total : Math.ceil(data.length / pageSize),
					page : pageNo
				},
				baidu.g('SubPagerContainer' + index)
			);
			newpager.onselect = me.getSubrowPageHandler();
			//没有分页时，当前分页为1，所以这句需要放到外边
			//me.setContext('subTablePageNo', pageNo);
		}
		me.setContext('subTablePageNo', pageNo);
	},
	
	/**
     * 设置启用暂停下拉框的状态
     */
    setRunPauseOptionsState : function (selectedList, index) {
        var me = this,
            i = 0, len = selectedList.length,
            data = me.getContext('subrowTableData'),
            disablePauseState = true, disableStartState = true,
            runPauseControl = ui.util.get('runOrPauseSelect' + index);
        
        for (; i < len; i++) {
            if (data[selectedList[i]].pausestat == '0'){//启用状态
                disablePauseState = false;//可以设置暂停
                continue;
            }
            if (data[selectedList[i]].pausestat == '1'){//暂停状态
                disableStartState = false;//可以设置启用
                continue;
            }
            if (!disablePauseState && !disableStartState) {
                break;
            }
        }
        runPauseControl.disableItemByValue('start',disableStartState);
        runPauseControl.disableItemByValue('pause',disablePauseState);
    },
	
    /**
     * 设置激活按钮的状态
     */
	setActiveState : function(selectedList, index, pageNo, pageSize) {
        var me = this,
            i = 0, len = selectedList.length,
            data = me.getContext('subrowTableData'),
            disabled = true,
            activeIdea = ui.util.get('activeBut' + index);
        
        for (; i < len; i++) {
            if (data[selectedList[i]].activestat == '1'){//待激活状态
                disabled = false;//可以设置激活
                break;
            }
        }
		
        activeIdea.disable(disabled);
	},
	
	/**
	 * 返回删除按钮点击时的响应函数
	 * @param {Array} ids 要去删除的id数组，即使是一个，也要包成数组
	 * @param {Number} showqstat 关键词质量度，用于发监控，批量操作的删除为空
	 * @returns {Function}
	 */
	getDeleteKeywordHandler : function(ids, showqstat){
		var me = this,
			i, 
			valuearr = [], 
			temparr = me.getContext('rowSelectedIndex'),
			table = ui.util.get('WidgetTable');

        // 读写分离，待升级之后不用这种方式了
        // by Leo Wang
		if(!nirvana.acc.accService.hasAuth) {
			return;
		}

		if(ids && ids.length > 0){
			valuearr = ids;
		}
		else{
			if(temparr && temparr.length > 0){
				for(i = 0; i < temparr.length; i++){
					valuearr[i] = table.datasource[temparr[i]].winfoid + '';
				}
			}
		}
		//设置需要保持的状态
		var stateMap = me.getClearStateMap();
		nirvana.aoWidgetAction.doDeleteKeywordHandler(valuearr, me, stateMap, showqstat);
	},
	
	
	/**
     * 执行行内启用或暂停创意操作
	 * @param {Object} item 该行全部数据
	 * @param {Object} target 本函数的调用来源对象 批量的时候是没有这个参数的
     */
	doInlineRunOrPause : function(item, target) {
        var me = this,
            idArr, pauseStat,
            func,
			logParams = {
				target: "inlineRunPause_btn"
			},
			type = 'single';
        idArr = (item.ideaid instanceof Array ? item.ideaid : [item.ideaid]);
        pauseStat = (item.actionMode == 'start' ? 0 : 1);
        if('undefined' != typeof target){
            //pauseStat = nirvana.manage.getPauseStat(target,[0,1]);
    		logParams.pauseStat = pauseStat;
    		NIRVANA_LOG.send(logParams);
            nirvana.manage.inserLoadingIcon(target);
        }
        else{
        	//pauseStat = item.pausestat;
        	type = 'multi';
        }
        func = fbs.idea.modPausestat;
        func({
            ideaid: idArr,
            pausestat : pauseStat,
            onSuccess: me.operationSuccessHandler(type),
            onFail: me.operationFailHandler()
        });
    },
    
    /**
     * 执行多行元素的创意批量启用或暂停
	 * @param {Object} value 启用0 暂停1
	 * @param {Object} ids 要去操作的创意的id数组
     */
    doMultiRunOrPause : function(value, ids){
    	var me = this,
    		item = {};
		
    	item.ideaid = ids;
    	item.pausestat = (value == 'start' ? 0 : 1);
    	item.actionMode = value;
    	
    	me.doInlineRunOrPause(item);
    },
    
    doMultiActiveIdea : function(ids){
    	var me = this;
    	
    	return function () {
            var func = fbs.idea.active,//需要调用的接口函数
                ideaid = ids,
                param = {
            		ideaid: ideaid, 
                    activestat : '0',
                    onSuccess: me.operationSuccessHandler('multi'), 
                    onFail: me.operationFailHandler()
                };
			
            func(param);
			
			me.activeLogParam.type = 1;
			me.logCenter('aowidget_batch_active_idea', me.activeLogParam);
        };
    },
    
    /**
     * 默认创意成功回调 清创意的缓存并刷新子Action
     * @returns {Function}
     */
    operationSuccessHandler : function (type) {
        var me = this;
        return function (response) {
        	if('undefined' != typeof type && type == 'multi'){
        		//批量操作时直接清空idea的缓存
        		fbs.material.clearCache('ideainfo');
        	}
        	else{
    			var modifyData = response.data;
    			//单独操作时重新设置idea的缓存的某个元素
    			fbs.material.ModCache('ideainfo', "ideaid", modifyData);
    			//如果不刷新呢？
        	}
			//刷新子Action
			var stateMap = me.getClearStateMap();
			me.refreshSelf(stateMap);
        };
    },
    /**
     * 默认失败回调 AJAX ALERT
     * @returns {Function}
     */
    operationFailHandler : function () {
        var me = this;
        return function (data) {
            ajaxFailDialog();            
        };
    },
    
    /**
     * 获取子表格多个元素的批量创意激活处理函数
     * @param index 子表格当前
     * @returns {Function}
     */
    getSubTableMultiActiveHandler : function(index){
    	var me = this;
    	
    	return function(){
    		var title = '激活创意',
				msg = '您确定要激活所选择的创意吗？',
				ids = me.getSelected('ideaid', true),
    			i,
				logParam = {
					id : ids,
					count : ids.length,
					type : -2
				};
				
			me.logCenter('aowidget_batch_active_idea', logParam);
			me.activeLogParam = logParam;
			
			ui.Dialog.confirm({
				title: title,
				content: msg,
				onok: me.doMultiActiveIdea(ids),
				oncancel: function() {
					logParam.type = 0;
					me.logCenter('aowidget_batch_active_idea', logParam);
				}
			});
    	};
    },
    
    /**
     * 获取子表格多个元素的批量创意启用或暂停处理函数
     * @param index
     * @returns {Function}
     */
    getSubTableMultiRunOrPauseHandler : function(index){
    	var me = this;
    	
    	return function(value){
    		if(value == -1 ){
    			return;
    		}
    		var word = (value == 'start' ? '启用' : '暂停'),
				title = word + '创意',
				msg = '您确定' + word + '所选择的创意吗？',
				ids = me.getSelected('ideaid', true),
				logParam = {
					id : ids,
					count : ids.length,
					type : -2
				},
				targetstr = value == 'start' ? 'aowidget_batch_resume_idea' : 'aowidget_batch_pause_idea';
				
			me.logCenter(targetstr, logParam);
			
			ui.Dialog.confirm({
				title: title,
				content: msg,
				onok: function(){
					me.doMultiRunOrPause(value, ids);
					
					logParam.type = 1;
					me.logCenter(targetstr, logParam);
				},
				oncancel : function(){
					ui.util.get('runOrPauseSelect' + index).selectByIndex(0, false);
					
					logParam.type = 0;
					me.logCenter(targetstr, logParam);
				}
			});
    	};
    },
	
	/**
	 * 翻页
	 */
	getPageHandler : function() {
		var me = this;
		
		return function(value, prevOrNext) {
			var old_value = me.getContext('pageNo'),
				keywordFootLine = me.getContext('keywordFootLine'),	//将末行的数据发监控
				logParam = {
					opttype : me.getContext('opttype'),
					old_value : old_value,
					new_value : value,
					type : 'number',
					winfoid : keywordFootLine.winfoid,
					showq_difficulty : qStar.getShowqDifficulty(keywordFootLine.showqstat)
				};
			
			if (prevOrNext) { // 上一页或下一页
				logParam.type = prevOrNext;
			}
			
			me.setContext('pageNo', value);
			me.setContext('rowSelectedIndex', []); //换页就清除之前的选择？
			
			//page页点击的监控
			nirvana.aoWidgetAction.logCenter('aowidget_page', logParam);
			
			me.refreshSelf(me.getStateMap());
            
            return false;
		};
	},
	getSubrowPageHandler : function(){
		var me = this;
		return function(value, prevOrNext){
			var old_value = me.getContext('subrowTablepageNo'),
				logParam = {
					opttype : me.getContext('opttype'),
					old_value : old_value,
					new_value : value,
					type : 'number',
					sub_table : 1
				};
			
			if (prevOrNext) { // 上一页或下一页
				logParam.type = prevOrNext;
			}
			
			me.setContext('subrowTablepageNo', value);
			
			//page页点击的监控
			nirvana.aoWidgetAction.logCenter('aowidget_page', logParam);
			
			me.renderSubrowTable(me.getContext('subrowTableIndex'), me.getContext('subrowTableFields'), me.getContext('subrowTableData'), value);
		};
	},
	/**
	 * 需要状态保持的变量
	 */
	getStateMap: function(){
		var me = this,
			stateMap = {
				pageNo : me.getContext('pageNo') || 1,
				rowSelectedIndex : me.getContext('rowSelectedIndex') || []
			};
		
		return stateMap;
	},
	/**
	 * 获取默认的全清刷新的stateMap
	 */
	getClearStateMap: function(){
		var me = this,
			stateMap = {
				pageNo : 1,
				rowSelectedIndex : []
			};
		
		return stateMap;
	},
	
	/**
	 * 表格最后的操作列 单元格的信息格式化函数
	 */
	tableColRender : {
		 /**
          * 输出关键词名称
          * @param {Object} item
          */
		showword : function(item){
			var str = item.showword,
				strLength = 20,
				strShort = getCutString(baidu.encodeHTML(str), strLength, '..'),
				html = '<span title="' + str + '">' + strShort + '</span>';
			return html;
		},
		/**
		 * 输出质量度小星星 - -#
		 * @param {Object} item
		 */
		showqstat : function(item){
			return qStar.getTableCell(item.showqstat) ;
		},
		/**
		 * 输出操作列的内容
		 * @param item 当前行内容Object
		 * @param row 行
		 * @param col 列
		 * @returns
		 */
		operations : function(item, row, col){
			var me = this,
				html = [];
			html.push('<div winfoid=' + item.winfoid + '>');
			if(item.ideacount > 0){
				html.push('    <a id="' + this.getSubentryId(row) + '" class="action_btn" actiontype="viewidea" href="javascript:void 0;">查看创意</a>');
			}
			html.push('    <a class="action_btn" actiontype="addidea" href="javascript:void 0;">添加创意</a>');
			html.push('    <a class="action_btn" actiontype="deletekeyword" href="javascript:void 0;">删除</a>');
			html.push('</div>');
			return html.join('');
		},
		/**
		 * 创意显示
		 * @param item 当前行内容Object
		 * @param row 行
		 * @param col 列
		 * @returns
		 */
		ideainfo : function(item, row, col){
			var tmp = [],
	            className = 'idea noborder',
				html = [];
	        
	        //创意内容
	        var ideaData = [item.title, item.desc1, item.desc2, item.showurl];
	        tmp = IDEA_RENDER.idea(ideaData, className);
	        
	        var _bc = "";
	        if (item.shadow_title && item.shadow_title != "" && item.shadow_title != 'null') {
	            _bc = 'style="background:#ffdfd5"';
	        }
	        
	        
	        var href = item.url;
	        
	        if (tmp.join("").indexOf("<u>") != -1) {
	            tmp[0] = '<div class="' + className + '" ' + _bc + ' title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;您的创意包含了通配符，创意在展现时，将以触发创意展现的关键词替代通配符。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
	        } else {
	            tmp[0] = '<div class="' + className + '" ' + _bc + ' title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;建议您在创意中包含通配符，通配符可以帮助您在创意中插入关键词。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
	        }
	        
	        for (key in item){
	            item[key] = escapeHTML(unescapeHTML(item[key]));
	        }
	        
	        
	        if (item.shadow_title && item.shadow_title != "" && item.shadow_title != 'null') {
	            // 有修改创意
	            var modIdea = [],
	                href = item.shadow_url,
	                className = className + ' display_none';
	            var modifiedIdeaData = [item.shadow_title, item.shadow_desc1, item.shadow_desc2, item.shadow_showurl];    
	            modIdea = IDEA_RENDER.idea(modifiedIdeaData, className);
	            
	    
	            if (modIdea.join("").indexOf("<u>") != -1) {
	                modIdea[0] = '<div class="' + className + '" title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;您的创意包含了通配符，创意在展现时，将以触发创意展现的关键词替代通配符。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
	            } else {
	                modIdea[0] = '<div class="' + className + '" title="访问URL：&#13;&#10;' + escapeQuote(href) + '&#13;&#10; &#13;&#10;建议您在创意中包含通配符，通配符可以帮助您在创意中插入关键词。插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。">';
	            }
	            tmp[tmp.length] = modIdea.join("");
	            tmp[tmp.length] = '<p style="text-align:right"><a href="javascript:void(0);" onclick="viewIdeaSwap(this, ' + item.ideaid + ', ' + item.shadow_ideaid + ');return false">查看修改后创意及状态</a></p>';
	    
	            
	        }
			
			html[html.length] = '<div class="edit_td">';
			html[html.length] = '<div class="idea_wrapper">' + tmp.join("") + '</div>';
			html[html.length] = '<a class="edit_btn" id="IdeaEdit_' + item.ideaid + '" edittype="ideaid" ideaid="' + item.ideaid + '"></a>';
	        html[html.length] = '</div>';
			
			return html.join('');
		},
		
		/**
		 * 创意状态
		 * @param item 当前行内容Object
		 * @param row 行
		 * @param col 列
		 * @returns
		 */
		ideastatus : function(item, row, col){
			var className, text, 
	            shadowClassName, 
	            shadowText, _bc = '', display="display:none;",
	            statusTextMap = {
	                '0' : '有效',
	                '1' : '暂停推广',
	                '2' : '不宜推广',
	                '4' : '待激活',
	                '5' : '审核中'  
	            }, html;
	            
	        className = 'ideastatus_' + item['ideastat'] + ' pausestat_' + item.pausestat;
	        text = statusTextMap[item['ideastat']];
	        
	        if (item.shadow_title && item.shadow_title != "" && item.shadow_title != 'null') {
	            _bc = 'background-color:#ffdfd5';
	        
	            shadowClassName = 'ideastatus_' + item['shadow_ideastat'];
	            shadowText = statusTextMap[item['shadow_ideastat']];
	        }
	        
	        var tpl;
	        
	        if(item.ideastat == 2){
	        	tpl = '<div id="StateCy_{2}" style="{3}" class="{0}"><span class="status_text" style="{4}"><span class="status_icon" data=\'{"ideaid":{2}}\'></span>{1} </span> <span class="status_op_btn"></span></div>';     
	        }
	        else{
	        	tpl = '<div id="StateCy_{2}" style="{3}" class="{0}"><span class="status_text" style="{4}">&nbsp;{1} </span> <span class="status_op_btn"></span></div>';
	        }
	        
	        if (item.shadow_title && item.shadow_title != "" && item.shadow_title != 'null') {
	            html = ui.format(tpl, className, text, item.ideaid, '', _bc) + ui.format(tpl, shadowClassName, shadowText, item.shadow_ideaid, display, '');
	        }else{
	            html = ui.format(tpl, className, text, item.ideaid, '', _bc);
	        }
	        return html;
		}
	},
	
	/**
	 * 日志中心，for 特有的
	 * @param {String} actionName	//操作类别
	 * @param {Array} param			//参数，非必须
	 * 
	 * 快捷方式
	 * logCenter('aowidget_toggle_idealist');		//查看、收起创意
	 * logCenter('aowidget_del_word');		//删除关键词 single
	 * logCenter('aowidget_resume_idea');		//启用创意
	 * logCenter('aowidget_pause_idea');		//暂停创意
	 * logCenter('aowidget_batch_active_idea');		//批量激活创意
	 * logCenter('aowidget_batch_resume_idea');		//批量启用创意
	 * logCenter('aowidget_batch_pause_idea');		//批量暂停创意
	 */
	logCenter : function(actionName, param){
		var me = this,
			logParam = {
				target : actionName,
				opttype : me.getContext('opttype')
			};
			
		baidu.extend(logParam, param);
		
		nirvana.aoControl.sendLog(logParam, nirvana.aoControl.snapShot);
	}
});

