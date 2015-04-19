/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    queryReport/queryReport.js
 * desc:    搜索词报告
 * author:  wanghuijun tongyao
 * date:    $Date: 2011/2/10 $
 */

ToolsModule.queryReport = new ToolsModule.Action('queryReport', {
	VIEW : 'queryReport',
	
	STATE_MAP : {
		selectedLevel : 2,			// 默认选择推广账户
		calendarDateBegin : '',     // 日历开始日期
		calendarDateEnd : ''        // 日历结束日期
	},

	UI_PROP_MAP : {
		// 选择的物料
		ToolMaterialSelected : {
			datasource : '*selectedData',
			skin : 'reminder',
			deleteHandler : '*selectedDeleteHandler',
			width:'220',
			numberId: 'QuerySelectedObjNum'
			
		},
		
		// 物料列表控件
		ToolMaterialList : {
			level : '*materialType',
			form : 'material',
			width : '450',
			height : '300',
			onAddLeft : '*addObjHandler',
			tableOption : '*materialTableOptions',
			onclose : '*materialCloseHandler',
			needDel : 'true',
			addWords : '*addedWords',
			noDataHtml : FILL_HTML.EXCEED_LIST.replace(/%s/, '搜索词报告')
		},
		
		// 日历控件
		QueryReportCalendar : {
			value : '*calendarDateSelected',
			availableRange : '*calendarAvailableRange',
			show : 'form'
		},
		
		// 搜索词报告表格
		QueryTable : {
			select : 'multi',
			sortable : 'true',
			noDataHtml : FILL_HTML.NO_DATA
			//scrollYFixed : 'true'
		},
		
		// 每页显示
		QueryPageSize : {
			type : 'Select',
			width : '80',
			datasource : '*pageSize'
		},
		
		// 分页
		QueryPage : {
			type : 'Page',
			total : '*totalPage'
		}
	},
	
	//重置工具时，通过判断.refresh决定是否重置所有STATE_MAP中定义的context
	onbeforeinitcontext : function(){
		var me = this,
			stateMap = this.STATE_MAP || {};
			
		if(!me.arg.refresh){
			me.arg.queryMap.ignoreState = true;
		}
	},
	
	CONTEXT_INITER_MAP : {
		// 每页显示
		pageSize : function(callback){
			var pageSize = baidu.object.clone(nirvana.manage.sizeOption);
			
			if (baidu.ie) { // IE浏览器删除每页100条
				baidu.array.removeAt(pageSize, 2);
			}
			
			this.setContext('pageSize',pageSize);
			callback();
		},
		
		init : function(callback) {
			var me = this;
			
			me.init(callback);
		}
	},
	
	//refresh后执行
	onafterrepaint : function(){
	},
	
	//第一次render后执行
	onafterrender : function(){
		var me = this,
		    controlMap = me._controlMap,
			ToolMaterialSelected = controlMap.ToolMaterialSelected,
			ToolMaterialList = controlMap.ToolMaterialList;
		
		// 隐藏物料列表
		baidu.addClass('ToolMaterialListWrap', 'hide');
		me.setMaterialSelectContext();
		
		// 禁用计划、单元层级
		controlMap.SelectedPlan.disable(true);
		controlMap.SelectedUnit.disable(true);
		
		// 默认推广账户，禁用添加对象
		if (me.getContext('selectedLevel') == 2) {
			ToolMaterialSelected.autoState = false;
			ToolMaterialSelected.render(ToolMaterialSelected.main);
			ToolMaterialSelected.disableAddLink(true);
		}
		
		// 地域初始化
		me.setContext('QueryReportRegion', '全部地域');
		me.initRegion();
		//关闭地域层
        ui.util.get("QueryRegionCancel").onclick = me.toggleRegion();
		//保存地域修改
        ui.util.get('QueryRegionOk').onclick = me.modRegion();
		//选择全部地域
        ui.util.get('QueryAllRegion').onclick = function(){
            ui.util.get('QueryRegionBody').main.style.display = 'none';
        };
		//选择部分地域
        ui.util.get('QueryPartRegion').onclick = function(){
            ui.util.get('QueryRegionBody').main.style.display = 'block';
        };
		
		baidu.g('SelectLevel').onclick = me.selectLevel();					        // 选择对象类型
		ToolMaterialSelected.onaddclick = me.openMaterialSelect();			        // 选定对象
		baidu.on('QueryReportOption', 'click', me.closeMaterialSelect());           // 空白处关闭
		baidu.on('QueryReportOption', 'click', me.closeRegion());                   // 空白处关闭地域
		controlMap.SEBtn.onclick = me.openSEDialog();                               // 打开搜索引擎选择框
		controlMap.QueryPageSize.onselect = me.getPageSizeHandler();                // 每页显示
		controlMap.QueryPage.onselect = me.getPageHandler();                        // 翻页
		
		//投放设备
		ui.util.get('deviceBtn').onclick = function(){
			baidu.removeClass(baidu.g('queryDeviceDialog'),'hide');
		}
		baidu.g('deviceCloseBtn').onclick = function(){
			baidu.addClass(baidu.g('queryDeviceDialog'),'hide');
		}
		baidu.on('QueryReportOption', 'click', me.closeDevice());
		baidu.g('queryDeviceDialog').onclick = me.setDevice();
		me.setContext('deviceValue',0);
		// 生成报告
		controlMap.BuildReport.onclick = me.buildReport();
		
		// 默认为每页显示20
		controlMap.QueryPageSize.setValue(20);
		
		// 修改添加为关键词默认为disable状态
		controlMap.AddWords.disable(true);
		controlMap.AddWords.onclick = me.addWords();
		
        // 给表格注册行内编辑处理器
        controlMap.QueryTable.main.onclick = me.tableHandler();
        // 给表格选择注册事件
        controlMap.QueryTable.onselect = me.selectListHandler();
		// 表格排序
		controlMap.QueryTable.onsort = function(sortField,order){
			// 表格原始数据
			var tableData = me.getContext('tableData'),
			    pageSize = controlMap.QueryPageSize.getValue();
			
			nirvana.util.loading.init();
			
			tableData = nirvana.displayReport.orderData(tableData, sortField.field, order);
			me.setContext('tableData', tableData);
			
			me.getDataPerPage(pageSize, 1);
			
			nirvana.util.loading.done();
		};
		
		// 量身推荐
		baidu.g('QueryToKr').onclick = function() {
			me.redirect('/tools/kr', {}, {skipUnload : true});
			
			//me.redirect('/tools/kr', {})
		};
		
		nirvana.queryReport.addSuccess = false;
	},
	
	//每次页面装载完成后执行
	onentercomplete : function(){
		var me = this;
		
		// 地域id
		me.setContext('provid', me.getAllRegion().join('|'));
		
		ui.Bubble.init();
	},
	
	/**
	 * 选项初始化
	 */
	init: function(callback){
		var me = this,
			fields,
			dateRange = {
				begin : null,
				end : null,
				beginDate : me.getContext('calendarDateBegin'),
				endDate : me.getContext('calendarDateEnd')
			},
			// 可选的日历范围
			dateAvailableRange = {
				begin : baidu.date.parse('2008-11-01'),
				end : new Date()
			};
		
		if (dateRange.beginDate == '') {
			//日历初始化
			dateRange = nirvana.util.dateOptionToDateValue(1); // 最近7天
			
			dateAvailableRange.end.setDate(dateRange.end.getDate() + 1);
			
			me.setContext('calendarAvailableRange', dateAvailableRange);
		} else {
			//日历复位，context不能保持对象，日历控件的状态保持需要通过字符串转换
			dateRange.begin = baidu.date.parse(dateRange.beginDate);
			dateRange.end = baidu.date.parse(dateRange.endDate);
		}
		
		// 设置日历控件的value
		me.setContext('calendarDateSelected', dateRange);
		
		if (!me.arg.refresh) { // 第一次进入时初始化
			me.isMaterialShow = false;
			
			// 已选择列表
			me.setContext('selectedDeleteHandler', me.selectedDeleteHandler());
			
			// 读取导入的物料，搜索词报告只考虑导入的关键词和创意
			if (me.arg.queryMap.importMaterials && me.arg.queryMap.importMaterials.data.length > 0) {
				var importMaterials = me.arg.queryMap.importMaterials,
					importData = importMaterials.data,
					i,
					len,
					datasource = [];
				
				switch (importMaterials.level) {
					case 'keyword':
						me.setContext('selectedLevel', 11);
						for (i = 0, len = importData.length; i < len; i++) {
							datasource[i] = {
								id : importData[i].winfoid,
								name : importData[i].showword
							};
						}
						break;
					case 'idea':
						me.setContext('selectedLevel', 7);
						for (i = 0, len = importData.length; i < len; i++) {
							datasource[i] = {
								id : importData[i].ideaid,
								name : IDEA_RENDER.lineBreak(IDEA_RENDER.wildcard(importData[i].title)),
								isIdea : true
							};
						}
						break;
					default:
						datasource = [{
                     		id: nirvana.env.USER_ID,
                        	name: nirvana.env.USER_NAME
                    	}];
						break;
				}
				me.setContext('selectedData', datasource);
				me.setContext('addedWords', datasource);
			} else {
				me.setContext('selectedData', [{
					id: nirvana.env.USER_ID,
					name: nirvana.env.USER_NAME
				}]);
			}
			
			//物料选择器
			me.setContext('materialType', ['user']);
			me.setContext('materialTableOptions', {
				width : 450,
				height : 200
			});
			me.setContext('addObjHandler', me.addObjHandler());
			me.setContext('materialCloseHandler', me.materialCloseHandler);
		}
		
		callback();
	},
	
	/**
	 * 对象类型选择
	 */
	selectLevel : function () {
		var me = this;
		
		return function(e) {
			var e = e || window.event,
			    target = e.target || e.srcElement,
				label = target.id;
			
			if (label == '' || label == 'SelectLevel') {
				return;
			} else {
				label = label.slice(20);
			}
			var controlMap = me._controlMap,
				ToolMaterialSelected = controlMap.ToolMaterialSelected,
				ToolMaterialList = controlMap.ToolMaterialList,
				levelRadio = controlMap.SelectedAccount.getGroup();
			
            ui.Dialog.confirm({
                title: '提醒',
                content: nirvana.config.LANG.LEVEL_CHANGE_WARN,
                onok: function(){
                    
                    switch (label) {
                        case 'Plan':
                        case 'Unit':
                            // 计划和单元不可点击
                            return;case 'Account':
                            ToolMaterialSelected.datasource = [{
                                id: nirvana.env.USER_ID,
                                name: nirvana.env.USER_NAME
                            }];
                            ToolMaterialSelected.autoState = false;
                            me.setContext('selectedLevel', 2);
                            me.setMaterialSelectContext('account');
                            break;
                        case 'Keyword':
                            ToolMaterialSelected.datasource.length = 0;
                            ToolMaterialSelected.autoState = true;
                            me.setContext('selectedLevel', 11);
                            me.setMaterialSelectContext('keyword');
                            break;
                        case 'Idea':
                            ToolMaterialSelected.datasource.length = 0;
                            ToolMaterialSelected.autoState = true;
                            me.setContext('selectedLevel', 7);
                            me.setMaterialSelectContext('idea');
                            break;
                    }
                    // 隐藏数量错误信息
                    baidu.addClass('SelectedNumberWarn', 'hide');
                    
                    // 物料列表刷新
                    ToolMaterialList.render(ToolMaterialList.main);
                    ToolMaterialList.addWords = [];
                    
                    // 所选物料渲染
                    ToolMaterialSelected.render(ToolMaterialSelected.main);
                    
                    if (label == 'Account') {
                        // 隐藏物料列表
                        baidu.addClass('ToolMaterialListWrap', 'hide');
                        
                        // 禁用添加按钮
                        ui.util.get('ToolMaterialSelected').disableAddLink(true);
                    } else {
                        // 启用添加按钮
                        ui.util.get('ToolMaterialSelected').disableAddLink(false);
                    }
                },
                oncancel: function(){
					// 强制改变radio值
					levelRadio.setValue(me.getContext('selectedLevel'));
                }
            });
			
			baidu.event.stopPropagation(e);
		};
    },
	
	/**
	 * 设置候选列表
	 * @param {Object} type
	 * @param {Object} typeValue
	 */
    setMaterialSelectContext : function (type) {
        var me = this,
            controlMap = me._controlMap,
            ToolMaterialList = controlMap.ToolMaterialList;
			
        if(!type){
            var typeValue = +controlMap.SelectedAccount.getGroup().getValue();
			
            switch(typeValue) {
                case 2:
                    type = 'account';
                    break;
                case 11: 
                    type = 'keyword';
                    break
                case 7:
                    type = 'idea';
                    break;
            }
        }
		
        switch (type) {
            case  'account':
                me.setContext('materialType', ['user']);
				// 选择搜索引擎
				(me.getSE())();
				//设置投放设备
				baidu.g('deviceTitle').innerHTML = '全部设备';
				me.setContext('deviceValue',0);
				ui.util.get('queryDeviceAll').getGroup().setValue(0);
                break;
            case 'keyword': 
                me.setContext('materialType', ['user','plan','unit', 'keyword']);
				// 仅选择百度推广
				me.getOnlyBaidu();
                break;
            case 'idea': 
                me.setContext('materialType', ['user','plan','unit', 'idea']);
				// 仅选择百度推广
				me.getOnlyBaidu();
                break;
        }
		ToolMaterialList.setLevel(me.getContext('materialType'));
    },
	
	/**
	 * 打开物料选择
	 */
	openMaterialSelect : function () {
        var me = this;
		
		return function() {
			var ToolMaterialList = me._controlMap.ToolMaterialList;
			
			me.setMaterialSelectContext();
			ToolMaterialList.render(ToolMaterialList.main);
			
			ToolMaterialList.main.style.left = 0;
			ToolMaterialList.main.style.top = 0;
			
			// 显示物料列表
			baidu.removeClass('ToolMaterialListWrap', 'hide');
			me.isMaterialShow = true;
		};
    },
	
	/**
	 * 物料列表关闭响应函数
	 */
	materialCloseHandler : function(){
		var me = this;
		
		// 隐藏物料列表
		baidu.addClass('ToolMaterialListWrap', 'hide');
		
		me.isMaterialShow = false;
	},
	
	/**
	 * 关闭对象选择列表
	 */
	closeMaterialSelect : function(){
		var me = this;
		
		return function(e){
			// 物料列表是否显示
			if (!me.isMaterialShow) {
				return;
			}
			
			var e = e || window.event || {},
			    target = e.target || e.srcElement,
				selectedBox = baidu.g('ToolMaterialSelectedWrap'),
				materialBox = baidu.g('ToolMaterialListWrap');
			
			//别问我这恶心的判断怎么来的，问ue&pm
			if (target &&
			    (baidu.dom.contains(selectedBox, target) || baidu.dom.contains(materialBox, target) ||
				 target.className == 'ui_list_del' ||
				 target.className == 'ui_radiobox_label')) {
				return;
			}
			
			var mPos = baidu.page.getMousePosition(),
			    navPos = baidu.dom.getPosition(materialBox);
			
			if (mPos.x > navPos.left + materialBox.offsetWidth || mPos.y < navPos.top || mPos.y > navPos.top + materialBox.offsetHight ||
			    (target && target.id == 'QueryReportOption')) {
				// 隐藏物料列表
				baidu.addClass('ToolMaterialListWrap', 'hide');
			}
		};
	},
	
	/**
	 * 已选对象删除响应
	 * @param {Object} objId
	 */
	selectedDeleteHandler : function () {
		var me = this;
		
		return function(objId){
			var materialList = me._controlMap.ToolMaterialList;
			
			materialList.recover(objId);
			
			// 隐藏数量显示的错误信息
			baidu.addClass('SelectedNumberWarn', 'hide');
		};
    },
	
	/**
	 *选择投放设备 
	 */
	setDevice : function(){
		var me = this;
		return function(){
			var device = ui.util.get('queryDeviceAll').getGroup().getValue();
			if(me.getContext('deviceValue') == device){
				return;
			}
			me.setContext('deviceValue',device);
			baidu.addClass(baidu.g('queryDeviceDialog'),'hide');
			
			switch(device + ''){
				case '0':
					baidu.g('deviceTitle').innerHTML = '全部设备';
					if(ui.util.get("SelectedAccount").getGroup().getValue() == '2'){
						(me.getSE())();
					}
					break;
				case '1':
					baidu.g('deviceTitle').innerHTML = '计算机&nbsp;&nbsp;';
					me.getOnlyBaidu();
					break;
				case '2':
					baidu.g('deviceTitle').innerHTML = '移动设备';
					me.getOnlyBaidu();
					break;
			}
		}
	},
	
	/**
	 *关闭投放设备浮出层 
	 */
	closeDevice : function(){
		return function(event){
			var btn = ui.util.get('deviceBtn').main,
				target = baidu.event.getTarget(event);
			if (baidu.dom.contains('queryDeviceDialog', target) || baidu.dom.contains(btn, target) || 
			    target == baidu.g('queryDeviceDialog') || target == btn) {
				return;
			}
			baidu.addClass(baidu.g('queryDeviceDialog'),'hide');
		}
	},
	/**
	 * 添加到左侧
	 * @param {Object} item
	 */
	addObjHandler : function () {
		var me = this;
		
		return function(item){
			var ToolMaterialSelected = me._controlMap.ToolMaterialSelected,
			    datasource = ToolMaterialSelected.datasource;
			
			if (me.getContext('selectedLevel') == 7) { // 创意层级
				item.isIdea = true;
				// 创意的name是已经处理好的，这里不需要处理，控件里直接显示
			} else {
				item.name = baidu.decodeHTML(item.name);
			}
			
			datasource.push(item);
			
			// 隐藏错误提示
			baidu.addClass('SelectedNumberWarn', 'hide');
			
			ToolMaterialSelected.render(ToolMaterialSelected.main);
		};
    },
	
	/**
	 * 获取物料列表数据
	 * @return {Array} result  [id1, id2]
	 */
	getMertailList : function(){
		var me = this,
			mertailList = me._controlMap.ToolMaterialSelected,
			data = mertailList.datasource,
			len = data.length,
			i,
			result = [];
		
		for (i = 0; i < len; i++){
			result.push(data[i].id);
		}
		
		return result;
	},
	
	/**
	 * 打开搜索引擎选择
	 */
	openSEDialog : function() {
		var me = this;
		
		return function() {
			var dialog = ui.util.get('SEDialog');
			
			if (!dialog) {
				dialog = ui.Dialog.factory.create({
					id: 'SEDialog',
					title: '<span id="SEType"><a id="SEAll" href="#">全部</a> | <a id="SEBaidu" href="#">仅百度推广</a> | <span id="SECustom">自定义</span></span>',
					skin: "modeless",
					dragable: false,
					needMask: false,
					unresize: true,
					father : baidu.g('Tools_queryReport_body'),
					width: 360,
					onok: me.getSE()
				});
				
				me._controlMap['SEDialog'] = dialog; //暂时没有好办法，只有在这里设置，action卸载的时候，才会同时卸载
				
				var contentHTML = [],
				    seList = nirvana.config.SE_SIZE,
					k,
					errSpan = document.createElement('span');
				
				contentHTML.push('<ul class="se_list" id="SEList">');
				for (k in seList) {
					if (k%2 == 1) { // k从1开始，奇数
						contentHTML.push('<li class="odd"><input type="checkbox" checked="1" id="SE_' + k + '" value="' + seList[k].value + '"><label for="SE_' + k + '">' + seList[k].text + '</label></li>');
					} else {
						contentHTML.push('<li><input type="checkbox" checked="1" id="SE_' + k + '" value="' + seList[k].value + '"><label for="SE_' + k + '">' + seList[k].text + '</label></li>');
					}
					
				}
				contentHTML.push('</ul>');
				
				dialog.setContent(contentHTML.join(''));
				
				errSpan.id = 'SEWarn';
				errSpan.className = 'dialog_error_msg';
				errSpan.innerHTML = '请至少选择1个搜索引擎。';
				baidu.g('ctrldialogSEDialogfoot').appendChild(errSpan);
				baidu.hide('SEWarn');
				
				baidu.g('SEType').onclick = me.seTabHandler();
				baidu.g('SEList').onclick = me.seSelectHandler();
				(me.seSelectHandler())();
				
				baidu.on(baidu.g('Tools_queryReport_body'), 'resize', me.positionSEDialog);
				baidu.on(baidu.g('Tools_queryReport_body'), 'scroll', me.positionSEDialog);
			}
			
			dialog.show();
			me.positionSEDialog();
		}
	},
	
	/**
	 * 搜索引擎选项切换
	 * @param {Object} e
	 */
	seTabHandler : function(){
		var me = this;
		
		return function(e) {
			var e = e || window.event,
		        target = e.target || e.srcElement,
				id = target.id || '',
				list = $$('#SEList li input'),
				i, len;
			
			switch (id) {
				// 选择全部
				case 'SEAll':
					me.seActive('SEAll');
					for (i = 0, len = list.length; i < len; i++) {
						list[i].checked = 1;
					}
					baidu.hide('SEWarn');
					break;
				// 仅百度推广
				case 'SEBaidu':
					me.seActive('SEBaidu');
					for (i = 0, len = list.length; i < len; i++) {
						list[i].checked = 0;
					}
					baidu.hide('SEWarn');
					break;
				case 'SECustom':
					break;
			}
			
			baidu.event.stop(e);
		};
	},
	
	/**
	 * 选择搜索引擎处理函数
	 */
	seSelectHandler : function(){
		var me = this;
		
		return function() {
			var list = $$('#SEList li input'),
			    data = [],
				i,
				len = list.length;
				
			for (i = 0; i < len; i++) {
				if (list[i].checked) {
					data.push(list[i].value);
				}
			}
			
			switch (data.length) {
				// 选择全部
				case list.length : 
				    me.seActive('SEAll');
					baidu.hide('SEWarn');
					break;
				// 自定义
				default : 
				    me.seActive('SECustom');
				    break;
			}
		};
	},
	
	/**
	 * 搜索引擎当前选择状态
	 * @param {Object} element
	 */
	seActive: function(element){
		var element = baidu.g(element);
		
		baidu.removeClass('SEAll', 'active');
		baidu.removeClass('SEBaidu', 'active');
		baidu.removeClass('SECustom', 'active');
		baidu.addClass(element, 'active');
	},
	
	/**
	 * 搜索引擎选项窗口定位
	 */	
	positionSEDialog : function(){
		var dialog = ui.util.get('SEDialog');
		
		if (dialog && dialog.isShow) {
			ui.util.smartPosition(dialog.getDOM(),{
				pos : 'l',
				align : 't',
				target : 'SETitle',
				repairL : 360,
				repairT : -67 + baidu.g('Tools_queryReport_body').scrollTop
			});				
		}
	},
	
	/**
	 * 获取搜索引擎
	 */
	getSE : function() {
		var me = this;
		
		return function(){
			var list = $$('#SEList li input'),
			    data = [],
				text = [],
				i,
				len = list.length;
			
			// 启用按钮
			me._controlMap.SEBtn.disable(false);
            
            if (!ui.util.get('SEDialog')) { // 还未生成搜索引擎选择框
                text = ['全部'];
                data = [0];
            } else {
                for (i = 0; i < len; i++) {
                    if (list[i].checked) {
                        data.push(list[i].value);
                        text.push(nirvana.config.SE_SIZE[list[i].value].text);
                    }
                }
                
                switch (data.length) {
                    // 没有选择搜索引擎
                    case 0:
                        if (baidu.dom.hasClass('SEBaidu', 'active')) {
                            text = ['仅百度推广'];
                            data = [-1];
                        }
                        else {
                            baidu.show('SEWarn');
                            return false;
                        }
                        break;
                    case len:
                        text = ['全部'];
                        data = [0];
                        break;
                    default:
                        break;
                }
            }
			
			baidu.g('SETitle').innerHTML = getCutString(baidu.encodeHTML(text.join(';')), 80, '...');
			baidu.g('SETitle').title = baidu.encodeHTML(text.join(' ')); // 这里不用分号，是因为title显示时，长字符串不会换行
			
			me.setContext('engineid', data.join('|'));
		};
	},
	
	/**
	 * 仅选择百度推广，并且禁用按钮
	 */
	getOnlyBaidu : function() {
		var me = this,
			text = ['仅百度推广'],
			data = [-1];
		
		baidu.g('SETitle').innerHTML = text.join(';');
		baidu.g('SETitle').title = text.join(' ');
		
		me.setContext('engineid', data.join('|'));
		// 禁用按钮
		me._controlMap.SEBtn.disable(true);
	},
	
	/**
	 * 地域信息初始化
	 */
	initRegion: function(){
		var me = this;
		
		baidu.g('QueryReportRegion').innerHTML = '<span class="query_region_msg" title="全部地域">' + me.getContext('QueryReportRegion') + '</span>';
		
		var button = ui.util.create('Button', {
			'id': 'modifyQueryRegion',
			'skin': 'shrink_16'
		}),
		    icon = document.createElement('div');
			
		button.render(icon);
		baidu.g('QueryReportRegion').appendChild(icon);
		button.onclick = me.toggleRegion();
	},
	
	/**
	 * 打开关闭地域选择框
	 */
	toggleRegion: function(){
		var me = this;
		
		return function(){
			if (!baidu.g('QueryRegion').style.display) {
				baidu.hide('QueryRegion');
			} else {
				baidu.show('QueryRegion');
			}
		};
	},
	
	/**
	 * 关闭地域选择
	 */
	closeRegion : function() {
		var me = this;
		
		return function(event) {
			var target = baidu.event.getTarget(event),
			    btn = ui.util.get('modifyQueryRegion').main;
			
			if (baidu.dom.contains('QueryRegion', target) || baidu.dom.contains(btn, target) || 
			    target == baidu.g('QueryRegion') || target == btn) {
				return;
			}
			baidu.hide('QueryRegion');
		};
	},
	
	
	/**
	 * 修改地域显示文字
	 */
	modRegion : function(){
		var me = this;
		
		return function(){
			var isAll = ui.util.get("QueryAllRegion").getGroup().getValue();
			var region = [],
				regionObj = {};
			
			if (isAll == 0) {
				region = me.getAllRegion();
			} else{
				region = ui.util.get("QueryRegionBody").getCheckedRegion();
			}
			me.setContext('provid', region.join('|'));
			
			for (var i = 0; i < region.length; i++) {
				region[i] = region[i].toString();
			}
			regionObj = nirvana.manage.region.abbRegion(region, "account");
			me.setContext("QueryReportRegion", regionObj.word);
			
			$$('#QueryReportRegion .query_region_msg')[0].title = regionObj.title;
			$$('#QueryReportRegion .query_region_msg')[0].innerHTML = me.getContext('QueryReportRegion');
			baidu.hide('QueryRegion');
		};
	},
	
	/**
	 * 获取所有地域
	 */
	getAllRegion:function(){
		return [0];
	},
	
	/**
	 * 获取表单数据
	 */
	getParam: function(){
		var me = this,
		    date = ui.util.get('QueryReportCalendar').getValue(),
			dateRange = {
				begin : baidu.date.format(date.begin,'yyyyMMdd'),
				end : baidu.date.format(date.end,'yyyyMMdd')
			},
			//投放设备
			device = me.getContext('deviceValue'),
			param = {
				engineid: me.getContext('engineid'),
				provid: me.getContext('provid'),
				accountRange: 2, // 搜索词报告始终传2
				device: device,
				startDate: dateRange.begin,
				endDate: dateRange.end,
				daySensitive: ui.util.get('DaySensitive').getChecked() ? 1 : 0, // 1为分日，0为不分日
				accountid: nirvana.env.USER_ID,
				mtldim: me.getContext('selectedLevel'), //这里只用到2/7/11  2 推广账户 3 推广计划 5 推广单元 11 关键词 7 创意
				idset: me.getMertailList().join(',') // 物料ids '1, 2, 3'
			};
		// 保存param
		nirvana.queryReport.param = param;
		return param;
	},
	
	/**
	 * 生成搜索词报告
	 */
	buildReport : function() {
		var me = this;
		
		return function() {
			// 物料
			var data = me.getMertailList();
			
			/**
			 * 没有选定对象时，默认请求全账户
			if (data.length == 0) {
				baidu.g('SelectedNumberWarn').innerHTML = '请选定对象';
				baidu.removeClass('SelectedNumberWarn', 'hide');
				return;
			}
			 */
			
			// 发送搜索词报告请求
			me.getParam();
			me.buildReportRequest();
		};
	},
	
	/**
	 * 请求搜索词报告
	 */
	buildReportRequest : function() {
		var me = this,
		    param = nirvana.queryReport.param,
			table = me._controlMap.QueryTable;
		// 设置下载参数，这里的nirvana.queryReport.param是最新的
		me.setDownloadParam();
		
		param.onSuccess = me.buildReportSuccess();
		param.onFail = me.buildReportFail();
		
		//表格列初始化
		var fields = [{
						content: me.colRender.date,
						footContent : 'totalType',
						title: '日期',
						field : 'date',
						sortable : true,
						breakLine : true,
						width: 90
					},{
						content: me.colRender.useracct,
						title: '账户',
						field : 'useracct',
						sortable : true,
						width: 50
					},
					{
						content: me.colRender.planinfo,
						title: '推广计划',
						field : 'plan',
						sortable : true,
						breakLine : true,
						width: 70
					},
					{
						content: me.colRender.unitinfo,
						title: '推广单元',
						field : 'unit',
						sortable : true,
						breakLine : true,
						width: 70
					},
					{
						content: me.colRender.ideainfo,
						title: '创意',
						field : 'idea',
						width: 170,
						minWidth :270
					},
					{
						content: me.colRender.wordinfo,
						title: '关键词',
						field : 'word',
						sortable : true,
						breakLine : true,
						width: 70
					},
					{
						content: me.colRender.query,
						title: '搜索词',
						field : 'query',
						sortable : true,
						breakLine : true,
						width: 70
					},
					{
						content: 'clks',
						footContent : 'clks',
						title: '点击量',
						field : 'clks',
						sortable : true,
						align :　'right',
						width: 70
					},
					{
						content: 'shows',
						footContent : 'shows',
						title: '展现量',
						field : 'shows',
						sortable : true,
						align :　'right',
						width: 70,
						minWidth:95,
						noun:true
					},
					{
						content: 'engineid',
						footContent : 'engineid',
						title: '搜索引擎',
						field : 'engineid',
						sortable : true,
						width: 70,
						minWidth:95,
						noun:true,
						nounName:'搜索引擎:'
					},
					{
						content: me.colRender.handle,
						footContent : 'handle',
						title: '操作',
						field : 'handle',
						align :　'center',
						width: 80,
						minWidth : 105
					}];
			
		table.fields = fields;
		// 搜索词报告强制清除cache
		fbs.queryReport.getQueryReport.clearCache();
		fbs.queryReport.getQueryReport(param);
	},
	
	/**
	 * 生成搜索词报告成功
	 */
	buildReportSuccess : function() {
		var me = this;
		
		return function(response) {
			var data = response.data.DATA,
			    sum = response.data.SUM ? [response.data.SUM] : [],
				table = me._controlMap.QueryTable,
				totalNum = data.length,
				pageSize = me._controlMap.QueryPageSize.getValue(),
				fields = [];
			
			// 显示表格区域
			baidu.removeClass('QueryReportContent','hide');
			
			// 数据总数
			me.setContext('totalNum', totalNum);
			// 表格原始数据
			me.setContext('tableData', data);
			me.setContext('tableSum', sum);
			
			// 获取第一页数据
			me.getDataPerPage(pageSize, 1);
		};
	},
	
	/**
	 * 生成搜索词报告失败
	 */
	buildReportFail : function() {
		var me = this;
		
		return function(response) {
			if (response.errorCode && response.errorCode.code) {
				var errorCode = response.errorCode.code,
					html = '<div class="nodata nodata_vertical">%s</div>',
					table = me._controlMap.QueryTable;
				
				// 显示表格区域
				baidu.removeClass('QueryReportContent', 'hide');
				
				html = html.replace(/%s/, nirvana.config.ERROR.QUERY_REPORT[errorCode]);
				
				// 表格渲染
				table.fields = [{
					content: 'date',
					title: '日期'
				},{
					content: 'useracct',
					title: '账户'
				}, {
					content: 'plan',
					title: '推广计划'
				}, {
					content: 'unit',
					title: '推广单元'
				}, {
					content: 'idea',
					title: '创意'
				}, {
					content: 'word',
					title: '关键词'
				}, {
					content: 'query',
					title: '搜索词'
				}, {
					content: 'clks',
					title: '点击量'
				}, {
					content: 'shows',
					title: '展现量'
				}, {
					content: 'engineid',
					title: '搜索引擎'
				}, {
					content: 'handle',
					title: '操作'
				}];
				
				table.noDataHtml = html;
				table.datasource = [];
				table.hasFoot = false;
				table.render(table.main);
				baidu.addClass('QueryPageWrap', 'hide');
				
				me.clearDownLoad();
				
				if (errorCode == 1801) { // 超过5000条，请下载
					// 设置下载链接
					me.setDownLoad();
				}
			} else { // 如果不是上述情况，则直接报异常
				ajaxFailDialog();
			}
		};
	},
	
	/**
	 * 表格列渲染函数
	 */
	colRender : {
		/**
		 * 日期列
		 * @param {Object} item
		 */
		date : function(item) {
			var time = item.date;
			
			if (nirvana.queryReport.param.daySensitive) { // 分日
				return time;
			} else { // 不分日
				return '<a href="javascript:void(0)" title="查看分日报告" level="date">' + time + '</a>';
			}
		},
		
		/**
		 * 账户列
		 * @param {Object} item
		 */
		useracct : function(item) {
			var acctname = baidu.encodeHTML(item.useracct.name);
			return '<a href="javascript:void(0)" title="进入推广管理计划列表" level="acct">' + acctname + '</a>';
		},
		
		/**
		 * 计划列
		 * @param {Object} item
		 */
		planinfo : function(item) {
			var planname = baidu.encodeHTML(item.plan.name),
			    planid = item.plan.id,
				html = [];
			
			if (!nirvana.queryReport.isFcMaterial(planname)) {
				html.push(planname);
			} else {
				html.push('<a href="javascript:void(0)" title="进入本推广计划的列表页" level="plan" planid="' + planid + '">' + planname + '</a>');
			}

			return html.join('');
		},
		
		/**
		 * 单元列
		 * @param {Object} item
		 */
		unitinfo : function(item) {
			var unitname = baidu.encodeHTML(item.unit.name),
			    unitid = item.unit.id,
			    html = [];
			
			if (!nirvana.queryReport.isFcMaterial(unitname)) {
				html.push(unitname);
			} else {
				html.push('<a href="javascript:void(0)" title="进入本推广单元的列表页" level="unit" unitid="' + unitid + '">' + unitname + '</a>');
			}
			
			return html.join('');
		},
		
		/**
		 * 创意列
		 * @param {Object} item
		 */
		ideainfo : function(item) {
			if (item.idea.title == '-') {
				return '-';
			}
			
			var idea = [
			               baidu.encodeHTML(item.idea.title),
						   baidu.encodeHTML(item.idea.desc1),
						   baidu.encodeHTML(item.idea.desc2),
						   baidu.encodeHTML(item.idea.url)
			           ];
			
			// 报告里创意与列表返回数据不同，需要前端转成旧格式
			idea = ideaToOldFormat(idea);
			
			var html = IDEA_RENDER.idea(idea);
			
			return html.join('');
		},
		
		/**
		 * 关键词列
		 * @param {Object} item
		 */
		wordinfo : function(item) {
			var showword = baidu.encodeHTML(item.word.name),
				wordid = item.word.id,
			    planid = item.plan.id,
			    unitid = item.unit.id,
				planname = item.plan.name,
				unitname = item.unit.name,
				html = [];
			
			if (!nirvana.queryReport.isFcMaterial(showword) || !nirvana.queryReport.isFcMaterial(planname) || !nirvana.queryReport.isFcMaterial(unitname)) { // 计划/单元/关键词已删除
				html.push('<span title="' + showword + '">' + showword + '</span>');
			} else {
				html.push('<a href="javascript:void(0)" title="查看该关键词" level="keyword" planid="' + planid + '" unitid="' + unitid + '" wordid="' + wordid + '">' + showword + '</a>');
			}
			
			return html.join('');
		},
		
		/**
		 * 搜索词列
		 * @param {Object} item
		 */
		query : function(item) {
			var query = baidu.encodeHTML(item.query.name),
			    html = [];
			
			html.push('<div class="query_stat">' + query + '</div>');
			
			return html.join('');
		},
		
		/**
		 * 操作列
		 * @param {Object} item
		 */
		handle : function(item) {
			var engineid = baidu.encodeHTML(item.engineid);
			
			return '<div class="query_handle" engineid="' + engineid + '"></div>';
		}
	},
	
	/**
	 * 操作列二次渲染
	 * @param {Object} item
	 */
	reRenderHandle: function(){
		var me = this,
			container = $$('#QueryReportContent .query_handle'),
			tmp,
			pageOffset = (ui.util.get('QueryPage').page - 1) * ui.util.get('QueryPageSize').getValue(),
			index,
			datasource = [],
			engineid;
		
		for (var i = 0, j = container.length; i < j; i++) {
			//　数据索引
			index = i + pageOffset;
			engineid = baidu.encodeHTML(baidu.decodeHTML(container[i].getAttribute('engineid')));
			
			datasource = [{
				value: '-9999',
				text: '添加'
			}, {
				value: 'addForPos' + index,
				text: '添加为关键词'
			}];
			
			if (engineid == '搜索推广') {
				datasource.push({
					value: 'addForNeg' + index,
					text: '添加为否定关键词'
				});
			}
			
			tmp = ui.util.get('AddBtn' + index);
			
			if (tmp) { // 工具有可能被重置，所以需要销毁
				tmp.dispose();
			}
			
			tmp = ui.util.create('Select', {
				'id': 'AddBtn' + index,
				'value': '-9999',
				'datasource': datasource,
				'width': '90',
				'onselect': me.addQueryHandler()
			}, container[i]);
			baidu.addClass(tmp.main, 'select_menu');
		}
	},
	
	/**
	 * 批量添加为关键词
	 */
	addWords : function() {
		var me = this;
		
		return function() {
			var tableData = me.getContext('tableData'), // 表格总数据
				indexs = me.selectedList, // 每一页选择行的index
				pageSize = me._controlMap.QueryPageSize.getValue(), // 每页数量
				pageNo = me._controlMap.QueryPage.page, // 当前页码
				index,
				len = indexs.length,
				i,
				datasource = [],
				data,
				param = {},
				tmp;
			
			//清空关键词重复数据缓存
			me.queryMap = {};
			
			for (i = 0; i < len; i++) {
				index = indexs[i] + (pageNo - 1) * pageSize;
				data = tableData[index];
				
				// 搜索词对应数据 'planid, unitid, query'
				tmp = [data.plan.id, data.unit.id, data.query.name].join(',').toLowerCase();
				
				if (!me.queryMap[tmp]) {
					datasource.push({
						planid: data.plan.id,
						planname: data.plan.name,
						unitid: data.unit.id,
						unitname: data.unit.name,
						query: data.query.name
					});
					me.queryMap[tmp] = true;
				} else {
					// 重复标识
					param.repeat = true;
				}
			}
			
			param.datasource = datasource;
			param.title = '批量添加为关键词';
			param.upAction = me;
			
			nirvana.util.openSubActionDialog({
				id: 'AddPosBatchDialog',
				title: '批量添加为关键词',
				width: '470',
				actionPath: '/tools/queryReport/addQuery',
				params: param,
				onclose: function(){
				}
			});
		};
	},
	
	/**
	 * 添加关键词处理函数
	 */
	addQueryHandler : function() {
		var me = this;
		
		return function(selected) {
			var type = selected.slice(0, 9),
			    index = selected.slice(9),
				// 表格原始数据
				tableData = me.getContext('tableData'),
				data = tableData[index],
				param = {
					datasource : [{
						planid: data.plan.id,
						planname: data.plan.name,
						unitid: data.unit.id,
						unitname: data.unit.name,
						query: data.query.name
					}]
				};
			param.upAction = me;
			
			switch (type) {
				// 添加为关键词
				case 'addForPos':
				    param.title = '添加为关键词';
					nirvana.util.openSubActionDialog({
						id: 'AddPosDialog',
						title: '添加为关键词',
						width: '470',
						actionPath: '/tools/queryReport/addQuery',
						params: param,
						onclose: function(){
						}
					});
					break;
				// 添加为否定关键词
				case 'addForNeg':
				    param.title = '添加为否定关键词';
				    nirvana.util.openSubActionDialog({
						id: 'AddNegDialog',
						title: '添加为否定关键词',
						width: '470',
						actionPath: '/tools/queryReport/addQueryNeg',
						params: param,
						onclose: function(){
						}
					});
				    break;
			}
		};
	},
	
	/**
	 * 请求搜索词状态
	 */
	queryStat : function() {
		var me = this,
			// 每页数量
			pageSize = me._controlMap.QueryPageSize.getValue(),
			pageNo = me._controlMap.QueryPage.page,
			data = me.getContext('tableData'),
			len = data.length,
			result = [],
			query;
		
		if (len == 0) { // 如果没有数据，则返回，不发请求
			return;
		}
		
		for (var i = 0; i < len; i++) {
			result[i] = data[i].query.name;
		}
		query = nirvana.util.getPageData(result, pageSize, pageNo);
		me.setContext('query', query);
		
		// 清除搜索词状态cache
		fbs.queryReport.getQueryWordStat.clearCache();
		
		fbs.queryReport.getQueryWordStat({
			word : query,
			
			onSuccess : me.queryStatSuccess(),
			onFail : me.queryStatFail()
		});
	},
	
	/**
	 * 查询搜索词状态成功
	 */
	queryStatSuccess : function() {
		var me = this;
		
		return function(response) {
			if (!ui.util.get('QueryTable').isRendered) { // 可能action已经被重置，如果表格未渲染，则直接返回
				return;
			}
			var data = response.data,
			    container = $$('#QueryReportContent .query_stat'),
				len = data.length,
				i,
				tmp,
				add,
				neg,
				querys = me.getContext('query'),
				query;
			// 通过判断当前页数来获取是否是精确匹配扩展功能触发
			var pageSize  = me._controlMap.QueryPageSize.getValue();
			var pageNum   = me._controlMap.QueryPage.page;
			var tableData = me.getContext('tableData');
			// 是否是精确匹配扩展功能触发
			var exactMatch;
			
			for (i = 0; i < len; i++) {
				tmp = data[i];
				// 关键词信息
				add = tmp.add;
				// 否定关键词信息
				neg = tmp.neg;

				// 是否是精确匹配触发
				exactMatch = tableData[pageSize * (pageNum - 1) + i].ebrr;
				query = baidu.encodeHTML(querys[i]);
				
				if (add.length || neg.length) { // 存在添加关键词或者否定关键词
					container[i].innerHTML = '<span class="ui_bubble" bubblesource="queryStat" bubbletitle="搜索词信息" exactMatch="' + exactMatch + '" index="' + i + '">' + query + '</span>' + 
					                         '<span class="query_added">已添加</span>';
				} else { // 这里需要强制再填入一次，否则有可能多次请求状态出错
					if (exactMatch) {
						container[i].innerHTML = '<span class="ui_bubble" bubblesource="queryStat" bubbletitle="搜索词信息" exactMatch="' + exactMatch + '">' + query + '</span>';
					} else {
						container[i].innerHTML = query;
					}
				}
			}
			// 搜索词状态数据
			nirvana.queryReport.statData = data;
			
			ui.Bubble.init();
		};
	},
	
	/**
	 * 查询搜索词状态失败
	 */
	queryStatFail : function() {
		var me = this;
		
		return function(response) {
			if (!ui.util.get('QueryTable').isRendered) { // 可能action已经被重置，如果表格未渲染，则直接返回
				return;
			}
			ajaxFailDialog();
		};
	},
	
	/**
	 * 每页显示数量
	 */
	getPageSizeHandler : function () {
		var me = this;
		
		return function(value){
			// 设置参数
			me.getDataPerPage(value, 1);
		};
	},
	
	/**
	 * 翻页
	 */
	getPageHandler : function() {
		var me = this;
		
		return function(value) {
			var pageSize = me._controlMap.QueryPageSize.getValue();
			
			me.getDataPerPage(pageSize, value);
		};
	},
	
	/**
	 * 获取每页
	 */
	getDataPerPage : function(pageSize, pageNo){
		var me = this,
		    data = me.getContext('tableData'),
		    sum = me.getContext('tableSum'),
		    result = [],
			datasource,
			table = me._controlMap.QueryTable,
			page = me._controlMap.QueryPage,
			totalNum = me.getContext('totalNum'),
			totalPage;
		
		for (var i = 0, len = data.length; i < len; i++) {
			result[i] = data[i];
		}
		// 构造合计数据标题
		for (var i = 0, len = sum.length; i < len; i++) {
			sum[i].totalType = '合计';
			sum[i].engineid = '&nbsp;';
			sum[i].handle = '&nbsp;';
		}
		
		datasource = nirvana.util.getPageData(result, pageSize, pageNo);
		
		// 计算总页数
		totalPage = Math.ceil(totalNum / pageSize);
		me.setContext('totalPage', totalPage);
		// 当前页码
		me.setContext('pageNo', pageNo);
		// 分页更新
		page.total = totalPage;
		page.page = pageNo;
		page.render(page.main);
		baidu.removeClass('QueryPageWrap', 'hide');
		
		// 表格渲染
		table.noDataHtml = FILL_HTML.NO_DATA;
		table.datasource = datasource;
		table.hasFoot = true;
		table.footdata = sum;
		table.render(table.main);
			
		if (datasource.length == 0) { // 当前页无数据
			baidu.addClass('QueryPageWrap', 'hide'); // 隐藏翻页区域
			me.clearDownLoad(); // 隐藏下载区域
			return;
		}
		// 设置下载链接
		me.setDownLoad();
		
		// 请求搜索词状态
		me.queryStat();
		
		// 更新操作区域
		me.reRenderHandle();
	},
	
	/**
     * 表格操作事件代理器
     */
	tableHandler : function() {
		var me = this;
		
        return function(e) {
            var e = e || window.event,
			    target = e.target || e.srcElement,
				randomId = er.random(10), // 页面跳转需要的随机数
				level = target.getAttribute('level'),
				unitid,
				wordid;
			
			switch(level) {
				// 时间跳转
				case 'date' :
				    nirvana.queryReport.param.daySensitive = 1; // 参数改为分日
					me.buildReportRequest();
					break;
				
				// 账户跳转
				case 'acct' :
				    er.locator.redirect('/manage/plan~ignoreState=true&_r=' + randomId);
					break;
				
				// 计划跳转
				case 'plan' :
				    er.locator.redirect('/manage/unit~ignoreState=true&_r=' + randomId + '&navLevel=plan&planid=' + target.getAttribute('planid'));
					break;
				
				// 单元跳转
				case 'unit' :
				    er.locator.redirect('/manage/keyword~ignoreState=true&_r=' + randomId + '&navLevel=unit&unitid=' + target.getAttribute('unitid'));
					break;
				
				// 关键词跳转，跳转到
				case 'keyword' :
					/**
					er.locator.redirect('/manage/keyword~ignoreState=true&_r=' + randomId + '&navLevel=unit&unitid=' + target.getAttribute('unitid') + '&status=100&query=' + encodeURIComponent(target.innerHTML) + '&queryType=accurate');
					break;
					 */
				    unitid = target.getAttribute('unitid');
					wordid = target.getAttribute('wordid');
					
					// 先要看一下关键词是否已删除或者转移
					fbs.material.isExist({
						unitid : unitid,
						// wordid : wordid, //根据wordid判断
						// winfoid : -1,
						winfoid: wordid,
						wordid: -1,
						
						onSuccess : function(response) {
							var data = response.data;
							
							if (data == 1) {
								er.locator.redirect('/manage/keyword~ignoreState=true&_r=' + randomId + '&navLevel=unit&unitid=' + unitid + '&status=100&query=' + encodeURIComponent(target.innerHTML) + '&queryType=accurate');
							} else { // 关键词已删除或者转移
								ui.Dialog.alert({
									title: '通知',
									content: '关键词已删除/转移'
								});
							}
						},
						onFail : function(response) {
							ajaxFailDialog();
						}
					});
					break;
			}
        };
	},
	
	/**
     * 表格选择事件代理器
     */
    selectListHandler : function () {
        var me = this,
            controlMap = me._controlMap,
			AddWords = controlMap.AddWords;
			
        return function(selected) {
            var enabled = selected.length > 0;
			me.selectedList = selected;
            AddWords.disable(!enabled);
        };
    },
	
	/**
     * 设置下载参数
     */
	setDownloadParam : function() {
		var param = nirvana.queryReport.param;
		
		baidu.g('Fuserid').value = nirvana.env.USER_ID;
		baidu.g('FaccountRange').value = param.accountRange;
		baidu.g('FstartDate').value = param.startDate;
		baidu.g('FendDate').value = param.endDate;
		baidu.g('FdaySensitive').value = param.daySensitive;
		baidu.g('Faccountid').value = param.accountid;
		baidu.g('Fmtldim').value = param.mtldim;
		baidu.g('Fidset').value = param.idset;
		baidu.g('Fdevice').value = param.device;
		baidu.g('Fengineid').value = param.engineid;
		baidu.g('Fprovid').value = param.provid;
	},
	
	/**
     * 设置下载链接
     */
	setDownLoad : function() {
		// 显示下载
		baidu.removeClass('DownQueryReport', 'hide');
		
		var me = this;
		
		baidu.g('DownReportExcel').onclick = function() {
			me.downloadQueryReport(0);
			return false;
		};
		baidu.g('DownReportText').onclick = function() {
			me.downloadQueryReport(1);
			return false;
		};
	},
	
	/**
	 * 清除下载链接
	 */
	clearDownLoad : function() {
		// 隐藏下载
		baidu.addClass('DownQueryReport', 'hide');
		
		baidu.g('DownReportExcel').onclick = null;
		baidu.g('DownReportText').onclick = null;
	},
	
	/**
	 * 下载EXCEL文件
	 */
/*	downloadExcelFile : function() {
		var downForm = baidu.g('QueryReportForm');
		
		downForm.action = 'tool/queryrpt/downloadqueryrptcsv.do';
		downForm.submit();
	},*/
	
	/**
	 * 下载TXT文件
	 */
/*	downloadTextFile : function() {
		var downForm = baidu.g('QueryReportForm');
		
		downForm.action = 'tool/queryrpt/downloadqueryrpttxt.do';
		downForm.method = 'post';
		downForm.submit();
	}*/
	/**
	 * 下载报告文件
	 * @param {Object} filetype
	 * @auther zhouyu01@baidu.com
	 */
	downloadQueryReport: function(filetype){
		var downForm = baidu.g('QueryReportForm');
		var elements = downForm.elements;
		var params = {};
		for (var i = 0, len = elements.length; i < len; i++) {
			var item = elements[i];
			params[item.name] = item.value;
		}
		params.fileType = filetype;
		params.onSuccess = function(response){
			window.open(response.data);
		}
		fbs.queryReport.getDownloadPath(params);
	}
});

/**
 * 搜索词报告公用函数
 */
nirvana.queryReport = {
	statData : [],
	
	// 添加关键词成功，打开搜索词时默认false，添加成功以后置为true
	addSuccess : false,
	
	param : {},
	
	/**
	 * 获取计划列表，用于添加创意和添加关键词
	 * @param {Object} me
	 */
	getPlanList: function(me){
		var controlMap = me._controlMap,
		    levelPlan = controlMap.QueryLevelPlan,
		    levelUnit = controlMap.QueryLevelUnit,
			datasource = me.arg.datasource,
			plandata = [{
				value: -2,
				text: '所属推广计划'
			}],
			i,
			j;
		
		for (i = 0, j = datasource.length; i < j; i++) {
			if (!nirvana.queryReport.isFcMaterial(datasource[i].unitname)) { //只要有一个不是凤巢物料或者已删除，则没有所属计划，这里只需要判断单元是否存在
				plandata = [{
					value: 0,
					text: '请选择推广计划'
				}];
				break;
			}
		}
		
		fbs.plan.getNameList({
			onSuccess: function(response){
				var data = response.data.listData,
				    len = data.length;
				
				for (var i = 0; i < len; i++) {
					plandata.push({
						value: data[i].planid,
						text: baidu.encodeHTML(data[i].planname)
					});
				}
				
				levelPlan.fill(plandata);
				
				// 请求单元数据
				nirvana.queryReport.getUnitList(me);
			},
			
			onFail: function(response){
				ajaxFailDialog();
			}
		});
		
		// 给计划列表挂载事件获取单元列表
		levelPlan.onselect = function(selected) {
			nirvana.queryReport.getUnitList(me);
		};
	},
	
	/**
	 * 获取单元列表
	 * @param {Object} me
	 */
	getUnitList : function(me) {
		var controlMap = me._controlMap,
		    levelPlan = controlMap.QueryLevelPlan,
		    levelUnit = controlMap.QueryLevelUnit,
			planid = levelPlan.getValue();
		
		if (planid == -2) { // 所属计划，不需要请求具体单元
			levelUnit.fill([{
				value: -2,
				text: '所属推广单元'
			}]);
			
			// 确保单元列表有数据以后再判断按钮状态
			nirvana.queryReport.checkBtn();
			return;
		}
		
		fbs.unit.getNameList({
			condition: {
				planid: [planid]
			},
			
			onSuccess: function(response){
				var data = response.data.listData,
				    len = data.length,
				    unitdata = [{
						value: 0,
						text: '请选择推广单元'
					}];
				
				for (var i = 0; i < len; i++) {
					unitdata.push({
						value: data[i].unitid,
						text: baidu.encodeHTML(data[i].unitname)
					});
				}
				
				levelUnit.fill(unitdata);
				
				// 确保单元列表有数据以后再判断按钮状态
				nirvana.queryReport.checkBtn();
			},
			
			onFail: function(response){
				ajaxFailDialog();
			}
		});
		
		// 给计划列表挂载事件获取单元列表
		levelUnit.onselect = function(selected) {
			nirvana.queryReport.checkBtn();
		};
	},
	
	/**
	 * 检查按钮状态
	 */
	checkBtn : function() {
		var disabled = !ui.util.get('QueryLevelUnit').getValue(); // value=0时，确定按钮不可点
		
		if (ui.util.get('QuerySelectRadioPlan')) {
			// 添加否定关键词的计划层级
			if (ui.util.get('QuerySelectRadioPlan').getGroup().getValue() == 'plan') {
					disabled = !ui.util.get('QueryLevelPlan').getValue();
			}
		}
		
		ui.util.get('AddQuerySubmit').disable(disabled);
	},
	
	/**
	 * 判断物料已删除
	 * @param {Object} name
	 * @param {Boolean} true 已删除
	 */
	isFcMaterial: function(name){
		if (typeof(name) != 'undefined' && name.indexOf('已删除') == -1 && name != '-') { //不包含“已删除”并且不等于“-”
			return true;
		}
		return false;
	}
};

/**
 * 气泡
 */
ui.Bubble.source.queryStat = {
	type : 'normal',
	iconClass : 'ui_bubble_icon_info',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	showByClick : true,
	showByOver : true,			//鼠标悬浮延时显示
	showByOverInterval : 500,	//悬浮延时间隔
	hideByOut : true,			//鼠标离开延时显示
	hideByOutInterval : 2000,	//离开延时间隔，显示持续时间
	bubbleClass : 'ui_bubble_wrap_query_report',
	title: function(node){
		var title = node.getAttribute('bubbletitle');
			
		return title;
	},
	content: function(node, fillHandle, timeStamp){
		var index = node.getAttribute('index'),
			data = nirvana.queryReport.statData;
			if (index != undefined) {
				var add = data[index].add,
					neg = data[index].neg;
			} else {
				var add = [],
					neg = [];
			}
			html = [],
			// 是否是精确此匹配触发
			isExactMatch = + node.getAttribute('exactMatch');
		
		html.push('<div class="query_stat_bubble">');
		if (!!isExactMatch) {
			// console.log(isExactMatch, !!isExactMatch);
			html.push('<h4>精确匹配扩展（地域词扩展）功能所触发</h4>');
			html.push('<span class="ui_bubble_wrap_query_report_exact">您可到账户的“其它设置”中了解此功能</span>');
		}
		if (add.length) {
			if(!!isExactMatch) {
				html.push('<span class="ui_bubble_wrap_query_report_exact_hr"></span>');
			}
			html.push('<h4>已添加为关键词<span>（<strong>' + add.length + '</strong>次）</span></h4>');
			for (var i = 0; i < add.length; i++) {
				if (i == add.length - 1) {
					html.push('<ul class="noborder">');
				} else {
					html.push('<ul>');
				}
				html.push('<li><h5>推广计划：</h5>' + baidu.encodeHTML(add[i].planname) + '</li>');
				html.push('<li><h5>推广单元：</h5>' + baidu.encodeHTML(add[i].unitname) + '</li>');
				html.push('<li><h5>匹配模式：</h5>' + baidu.encodeHTML(add[i].wmatch) + '</li>');
				html.push('</ul>');
			}
		}
		if (neg.length) {
			if(!!isExactMatch) {
				html.push('<span class="ui_bubble_wrap_query_report_exact_hr"></span>');
			}
			html.push('<h4>已添加为否定关键词<span>（<strong>' + neg.length + '</strong>次）</span></h4>');
			for (var i = 0; i < neg.length; i++) {
				if (i == neg.length - 1) {
					html.push('<ul class="noborder">');
				} else {
					html.push('<ul>');
				}
				html.push('<li><h5>推广计划：</h5>' + baidu.encodeHTML(neg[i].planname) + '</li>');
				if (neg[i].unitname != '') { 
					html.push('<li><h5>推广单元：</h5>' + baidu.encodeHTML(neg[i].unitname) + '</li>');
				}
				html.push('<li><h5>匹配模式：</h5>' + baidu.encodeHTML(neg[i].wmatch) + '</li>');
				html.push('</ul>');
			}
		}
		html.push('</div>');
		
		return html.join('');
	}
};