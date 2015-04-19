/*
* nirvana
* Copyright 2011 Baidu Inc. All rights reserved.
*
* desc:   KR自动分组
* author:  huangkai01@baidu.com
* date:    2012/04/25
*/





var KR_AUTOUNIT = (function() {

	//用来存储整个分组信息的数组
	/*
	 _groupList:[
	 {
	 seqId：XXX, //顺序标识，从0-7
	 planId:XXX, //计划ID
	 planName:XXX,//计划名
	 planCode:XXX,//计划状态码：405
	 unitId:XXX,//单元ID
	 unitName:XXX,//单元名
	 unitCode：XXX，//单元状态码：512,504
	 wordList:[                //分组后的关键词序列
	 {
	 wordStrXXX,//关键词字面
	 wordCode:XXX//关键词状态码：636,642
	 id: XXX,,//一个唯一的标示
	 selected: true/false//
	 },...
	 ]
	 },...
	 ]

	 *
	 *
	 */

	var _N = 8;

	var _idMap = {
		cancelBtnId : '',
		unitSelectIdPrefix : 'auUnitSelect',
		planSelectIdPrefix : '',
		unitInputIdPrefix : '',
		planInputIdPrefix : '',
		aveBtnId : '',

		init : function(prefix) {
			this.cancelBtnId = 'cancelAutoUnitBtn' + prefix;
			this.unitSelectIdPrefix = 'auUnitSelect' + prefix;
			this.planSelectIdPrefix = 'auPlanSelect' + prefix;
			this.unitInputIdPrefix = 'auUnitInput' + prefix;
			this.planInputIdPrefix = 'auPlanInput' + prefix;
			this.saveBtnId = 'saveKeyAutoUnit';
		}
	}

	var _settings = {
		plan_select_prefix : 'AULevelPlan',
		unit_select_prefix : 'AULevelUnit',
		group_prefix : 'wordList',
		group_wrapper_prefix : 'listWrapper',
		empty_group_prefix : 'emptyGroup',
		not_empty_group_prefix : 'notEmptyGroup',
		unit_type_prefix : 'autounitGroupAdvice',
		radio_new_prefix : 'addToNewRadio',
		radio_exsits_prefix : 'addToExisitRadio'
	};

	var MSG = {
		saveToExists : '<div class="au_group_save_type_div au_group_save_type_exists">保存到已有单元</div>',
		saveToNew : '<div class="au_group_save_type_div au_group_save_type_new">保存到新建单元</div>',
		noPlanName : '请输入计划名',
		noUnitName : '请输入需要新建的单元名',
		tooLongPlanName : '计划名太长，最多为30个英文字符，或者15个中文汉字',
		tooLongUnitName : '单元名太长，最多为30个英文字符，或者15个中文汉字',
		pleaseChoosePlan : '请选择计划',
		pleaseChooseUnit : '请选择单元',
		inputPlanName : '输入新建计划名称',
		inputUnitName : '输入新建单元名称',
		DEFAULT_PLAN_NAME: '新建计划'
	}

	

	function _init_id_map() {

		if(KR_AUTOUNIT.actionArg.isInNewFlow) {
			_idMap.init('_newFlow');
		} else {
			_idMap.init('');
		}
	}

	function _cleanErrMsgOnPanel(i) {
		baidu.G('planErr' + i).innerHTML = "";
		baidu.G('unitErr' + i).innerHTML = '';
		baidu.hide(baidu.G('planErr' + i));
		baidu.hide(baidu.G('unitErr' + i));
	}

	function _restoreWordsToSBox(words) {
		KR_AUTOUNIT.KR.addWords.set(getKeywordsFromText(words.join('\n')))
	}

	function _adjustModPanelPostion(i) {
		var height = baidu.G('planUnitPanel' + i).offsetHeight;
		var top = 0 - height;
		baidu.setStyle(baidu.G('planUnitPanel' + i), 'top', top + 'px');
	}

	function _markAsEmptyGroup(i) {
		baidu.show(baidu.G(_settings.empty_group_prefix + i));
		baidu.hide(baidu.G(_settings.not_empty_group_prefix + i));
		baidu.G('wordList' + i).innerHTML = "";
		//清空单词列表
	}

	function _getErrorHtmlUnderWordList(group) {
		//显示错误信息，组级别和词级别都要检测，这需求，说啥好呢

		var errorHtml = [];

		if(group.groupCode !== -1) {
			errorHtml.push('<li class="au_group_error_li">' + nirvana.config.ERROR.AUTOUNIT.GROUP[group.groupCode] + '</li>');
		}

		var errorArray = [{
			code : 636,
			hasError : false
		}, {
			code : 635,
			hasError : false
		}, {
			code : 634,
			hasError : false
		}];

		var wordList = group.wordList;
		for(var m in wordList ) {
			for(var n in errorArray ) {
				if(wordList[m].wordCode === errorArray[n].code) {
					errorArray[n].hasError = true;
					break;
				}
			}
		}

		for(var i in errorArray) {
			if(errorArray[i].hasError === true) {
				errorHtml.push('<li class="au_group_error_li">' + nirvana.config.ERROR.AUTOUNIT.GROUP[errorArray[i].code] + '</li>');
			}
		}

		return errorHtml;
	}

	function _refreshGroupView(i) {
		var groupList = AUTOUNIT_MODEL.getGroupList();

		//刷新选择控件
		_initPlanList(this.actionArg, i, groupList[i].planId, groupList[i].unitId);
		//刷新列表
		if(groupList[i].planId && -1 !== groupList[i].planId) {
			//修改计划名和单元名
			//baidu.G(_settings.unit_type_prefix + i).innerHTML = MSG.saveToExists;
			baidu.G("planName" + i).innerHTML = "计划:" + '<a>' + groupList[i].planName + '</a>';
			baidu.G("unitName" + i).innerHTML = "单元:" + '<a>' + groupList[i].unitName + '</a>';
		} else {
			//baidu.G(_settings.unit_type_prefix + i).innerHTML = MSG.saveToNew;
			baidu.G("planName" + i).innerHTML = '<a>' + groupList[i].planName + '</a>';
			baidu.G("unitName" + i).innerHTML = '<a>' + groupList[i].unitName + '</a>';
		}

		if(groupList[i].wordList.length <= 0) {
			baidu.G('wordList' + i).innerHTML = "";
			_markAsEmptyGroup(i);
		} else {
			var wordList = groupList[i].wordList;
			var html = [];
			var tempWord;
			//刷新关键词列表
			for(var j in wordList ) {
				tempWord = wordList[j];
				html.push('<div title="可拖拽至其他单元" id="autoUnitWord' + tempWord.index + '" class="au_word_entity  ' + (tempWord.selected === true ? "au_word_selected" : "") + '" onclick="KR_AUTOUNIT.onClickWord(' + i + ',' + j + ')">' + tempWord.wordDisplay + '<span class="au_word_drag"></span></div>');
			}

			baidu.G('wordList' + i).innerHTML = html.join("");

			var errorHtml = _getErrorHtmlUnderWordList(groupList[i]);

			if(errorHtml.length <= 0) {//木有错误的话，不显示错误信息

				baidu.G('groupError' + i).innerHTML = '';
				baidu.hide('groupError' + i);

				baidu.setStyle('listWrapper' + i, 'top', '30px');
				//写的有点狗屎，对不住，因为要动态计算
				baidu.setStyle('listWrapper' + i, 'bottom', '10px');
				//写的有点狗屎，对不住，因为要动态计算

			} else {//显示错误信息

				var errorInfoNo = errorHtml.length || 0;

				var heightOfError = 14 * errorInfoNo;
				var topOfWordList = 30 + 14 * errorInfoNo;//由于下面增加了删除按钮，把错误提示放上面了

				baidu.setStyle('groupError' + i, 'height', heightOfError + 'px');
				baidu.setStyle('listWrapper' + i, 'top', topOfWordList + 'px');

				baidu.G('groupError' + i).innerHTML = '<ul>' + errorHtml.join("") + '</ul>';

				baidu.show(baidu.G('groupError' + i));
			}

			//刷新计划名和单元名的显示
			ui.util.get(_idMap.planInputIdPrefix + i).setValue(groupList[i].planName);
			ui.util.get(_idMap.unitInputIdPrefix + i).setValue(groupList[i].unitName);

			baidu.hide('planUnitPanel' + i);
			_markAsNotEmptyGroup(i);
		}
	}
	
	function _initDeleteBtns() {
	    for(var i = 0; i < 8; i++) {
    	    _initDeleteBtn(i);
        }
	}
	
	function _initDeleteBtn(i) {
	    var deleteBtn = ui.util.create('Button', {
            id : 'auWordDelete' + i
        }, baidu.q('au_word_delete', baidu.g('listBack' + i))[0]);

        deleteBtn.setLabel("删除");
        
        deleteBtn.onclick = function(){
            var selected = AUTOUNIT_MODEL.getAllSelectedWordIndex(i);
            var groupList = AUTOUNIT_MODEL.getGroupList(i);
            var words = [];
            
            for (var index in selected) {
                baidu.dom.remove('autoUnitWord' + i + '_' + selected[index]);
                words.push(groupList[i].wordList[selected[index]].wordStr);
            }
            
            var origin = baidu.object.clone(AUTOUNIT_MODEL.getOriginalWords());
            var originLen = origin.length;
            for (var j = originLen - 1; j >= 0; j --) {
                if (baidu.array.indexOf(words, origin[j]) > -1) {
                    origin.splice(j, 1);
                }
            }
            AUTOUNIT_MODEL.setOriginalWords(origin);
            
            nirvana.krMonitor.autoUnitDeleteWord({
                groupid: i,
                planid: groupList[i].planId,
                unitid: groupList[i].unitId,
                planname: groupList[i].planName,
                unitname: groupList[i].unitName,
                word: words.join(',')
            });//监控
            
            AUTOUNIT_MODEL.deleteAllSelectedWords(i);
            //重建index
            AUTOUNIT_MODEL.buildWordIndex(i);
            //刷新
            _refreshGroupView(i);
            
            KR_AUTOUNIT.showDeleteBtn(i, false);
        }
	}

	function _showAddToExsitsPanel(i) {
		_cleanErrMsgOnPanel(i);
		baidu.show(baidu.G("auLevelPlanWrapper" + i));
		baidu.show(baidu.G("auLevelUnitWrapper" + i));
		baidu.hide(baidu.G("planNameInputWrapper" + i));
		baidu.hide(baidu.G("unitNameInputWrapper" + i));
		baidu.hide(baidu.G("defaultPriceInfo" + i));
		baidu.hide(baidu.G("defaultIdeaInfo" + i));
	}

	function _showAddToNewPanel(i) {
		_cleanErrMsgOnPanel(i)
		baidu.hide(baidu.G("auLevelPlanWrapper" + i));
		baidu.hide(baidu.G("auLevelUnitWrapper" + i));
		baidu.show(baidu.G("planNameInputWrapper" + i));
		baidu.show(baidu.G("unitNameInputWrapper" + i));
		baidu.show(baidu.G("defaultPriceInfo" + i));
		baidu.show(baidu.G("defaultIdeaInfo" + i));
	}

	function _verifyAfterDrag(fromId, toId) {
		var groupListForAjax = [];
		var groupListInModel = AUTOUNIT_MODEL.getGroupList();
		groupListForAjax.push(AUTOUNIT_MODEL.generateGroupForAjax(groupListInModel[fromId]));
		groupListForAjax.push(AUTOUNIT_MODEL.generateGroupForAjax(groupListInModel[toId]));

		var param = {
			forceSave : 2, // 0：有问题就返回，询问客户，1：强制保存
			groupList : groupListForAjax,
			matchType : 1, //验证的时候给0-2都行
			logId : -1,
			callback : function(data) {
				var status = data.status;
				var groupList = data.data.groupList;

				if(status === 200 || status === 300) {
					AUTOUNIT_MODEL.syncReturnedGroupList(groupList);
					//渲染页面，初始化控件
					_refreshGroup(fromId);
					_refreshGroup(toId);
				} else {//出问题的话，先还原提词栏的词
					ajaxFailDialog();
				}
			}
		};

		fbs.kr.addAutoUnit(param);
	}

	function _markAsNotEmptyGroup(i) {
		baidu.hide(baidu.G(_settings.empty_group_prefix + i));
		baidu.show(baidu.G(_settings.not_empty_group_prefix + i));
	}

	function _hideAutoUnitPage() {
		KR_AUTOUNIT.KR.switchToKR();
	}

	function _showAutoUnitPage() {
		KR_AUTOUNIT.KR.switchToAutoUnit();
	}

	//显示自动分组页面
	function _enterAutoUnitPage() {
	    nirvana.krMonitor.autoUnitEnter();//监控
		_showAutoUnitPage();
		AUTOUNIT_MODEL.setInAutoUnitPage(true);
	}

	function _adjustPlanUnitNameWidth() {
		var totalWidth = baidu.G('kr').parentNode.offsetWidth ;
		var width = totalWidth / 4 * 35 / 100 || 100;
		for(var i = 0; i < 8; i++) {
			baidu.setStyle('planName' + i, 'max-width', width);
			baidu.setStyle('unitName' + i, 'max-width', width)
		}
	}
	/*
	function _adjustPlanUnitNameWidthSpecific(i){
		var totalWidth = parseInt(baidu.G('kr_autounit').offsetWidth);
		var width = totalWidth / 4 * 35 / 100 || 100;
		baidu.setStyle('planName' + i, 'max-width', width);
		baidu.setStyle('unitName' + i, 'max-width', width);
		
		var leftWidth = Math.floor(parseInt(baidu.G('planName' + i).offsetWidth)) +1;
		var rightWidth = Math.floor(parseInt(baidu.G('unitName' + i).offsetWidth)) +1;
		if(leftWidth < width - 5   ){
			baidu.setStyle('unitName' + i, 'max-width', width + width  -  leftWidth  - 5);
		}
		
		if(rightWidth < width  - 5 ){
			baidu.setStyle('planName' + i, 'max-width', width + width  -  rightWidth  - 5);
		}
		
	}
	*/
	function _createComponentsOnPanels() {

		//无奈，select控件居然不支持%，只能恶心一下了
		var totalWidth = baidu.G('kr').offsetWidth, 
		inputAndSelectWidth = Math.floor(totalWidth / 4 * 80 / 100 || 200); //采用Math.floor是为了取整，貌似小数的话，select组件会出bug

		for(var i = 0; i < 8; i++) {
			//动态创建的Select务必dispose，不然可能造成所有select挂掉
			var planSelect = ui.util.get(_idMap.planSelectIdPrefix + i);
			if(planSelect) {
				planSelect.dispose();
			}

			var auLevelPlan = ui.util.create('Select', {
				id : _idMap.planSelectIdPrefix + i,
				emptyLang : '请选择推广计划',
				width : inputAndSelectWidth
			});

			auLevelPlan.appendTo(baidu.g("auLevelPlanWrapper" + i));

			//动态创建的Select务必dispose，不然可能造成所有select挂掉
			var unitSelect = ui.util.get(_idMap.unitSelectIdPrefix + i);
			if(unitSelect) {
				unitSelect.dispose();
			}

			var auLevelUnit = ui.util.create('Select', {
				id : _idMap.unitSelectIdPrefix + i,
				emptyLang : '请选择推广单元',
				width : inputAndSelectWidth
			});

			auLevelUnit.appendTo(baidu.g("auLevelUnitWrapper" + i));

			var planNameTextInput = ui.util.create('TextInput', {
				id : _idMap.planInputIdPrefix + i,
				virtualValue : MSG.inputPlanName,
				'width' : inputAndSelectWidth,
				'height' : 20
			});

			planNameTextInput.appendTo(baidu.g("planNameInputWrapper" + i));

			var unitNameTextInput = ui.util.create('TextInput', {
				id : _idMap.unitInputIdPrefix + i,
				virtualValue : MSG.inputUnitName,
				'width' : inputAndSelectWidth,
				'height' : 20
			});

			unitNameTextInput.appendTo(baidu.g("unitNameInputWrapper" + i));
		}

		//创建面板上的两个button
		for(var k = 0; k < 8; k++) {
			var okBtn = ui.util.create('Button', {
				id : 'panelOkBtn' + k,
				logSwitch : false,
				content : '确定'
			});

			//闭包
			(function() {
				var temp = k;
				okBtn.onclick = function() {
					KR_AUTOUNIT.confirmModPlanUnit(temp);
				};
			})(k);

			okBtn.appendTo(baidu.g("panelOkBtn" + k));

			var cancelBtn = ui.util.create('Button', {
				id : 'panelCancelBtn' + k,
				logSwitch : false,
				content : '取消'
			});

			//闭包
			(function() {
				var temp = k;
				cancelBtn.onclick = function() {
					KR_AUTOUNIT.cancelPlanUnitMod(temp);
				};
			})(k);

			cancelBtn.appendTo(baidu.g("panelCancelBtn" + k));
		}

		//给

	}

	function _showIllegalWordListAlert(errorList) {
		var html = [];
		html.push('<strong>' + nirvana.config.ERROR.KEYWORD.ADD[637] + "</strong><br/>");

		for(var i in errorList) {
			html.push(errorList[i].wordStr + '<br>');
		}

		ui.Dialog.alert({
			title : '部分关键词因为非法，已返回提词栏',
			content : html.join("")
		});

	}

	/**
	 * 获取计划列表，用于添加创意和添加关键词
	 * @param {Object} callback
	 * @param {Object} me
	 */
	function _initPlanList(me, groupIndex, planid, unitid) {

		var LevelPlan = ui.util.get(_idMap.planSelectIdPrefix + groupIndex), LevelUnit = ui.util.get(_idMap.unitSelectIdPrefix + groupIndex), changeable = true;
		// ( typeof (me.arg.changeable) == 'undefined') ? true : me.arg.changeable;

		fbs.plan.getNameList({
			onSuccess : function(response) {
				var data = response.data.listData, len = data.length, plandata = [{
					value : 0,
					text : '请选择推广计划'
				}];

				if(len == 0) {
					plandata.push({
						value : -1,
						text : '当前没有推广计划，请您先新建计划'
					});
				} else {
					for(var i = 0; i < len; i++) {
						plandata.push({
							value : data[i].planid,
							text : baidu.encodeHTML(data[i].planname)
						});
					}
				}

				LevelPlan.fill(plandata);

				if(planid) {// 定位计划层级
					LevelPlan.setValue(planid);
					// 获取单元列表
					_initUnitList(me, groupIndex, planid, unitid);
				} else {

				}

				if(!changeable) {// 设置层级不可编辑
					LevelPlan.setReadOnly(true);
				}
			},

			onFail : function(response) {
				ajaxFailDialog();
			}
		});

		// 给计划列表挂载事件获取单元列表
		LevelPlan.onselect = function(value, selected, id) {
			var index = id.replace(_idMap.planSelectIdPrefix, '');

			if(value == -1) {
				return false;
			}

			if(value == 0) {
				LevelUnit.fill([{
					value : 0,
					text : '请选择推广单元'
				}]);
				//对计划单元的修改不直接写入模型，而是先放入临时变量中，验证正确后再同步到模型
				AUTOUNIT_MODEL.setTempLevelInfo(index, {
					tempPlanId : -1,
					tempPlanName : null,
					tempUnitId : -1,
					tempUnitName : null
				});

				return;
			}

			AUTOUNIT_MODEL.setTempLevelInfo(index, {
				tempPlanId : value,
				tempPlanName : selected.text,
				tempUnitId : -1,
				tempUnitName : null
			});

			_initUnitList(me, index, value, null);
		};
	}

	/**
	 * 获取单元列表
	 * @param {Object} selected 选择的计划id
	 * @param {Object} me
	 */
	function _initUnitList(me, groupindex, planid, unitid) {

		var LevelUnit = ui.util.get(_idMap.unitSelectIdPrefix + groupindex), changeable = true;
		//(typeof(me.arg.changeable) == 'undefined') ? true : me.arg.changeable;

		fbs.unit.getNameList({
			condition : {
				planid : [planid]
			},

			onSuccess : function(response) {
				var data = response.data.listData, len = data.length, unitdata = [{
					value : 0,
					text : '请选择推广单元'
				}];

				if(len == 0) {
					unitdata.push({
						value : -1,
						text : '当前计划下没有推广单元，请您选择其他计划层级'
					});
				} else {
					for(var i = 0; i < len; i++) {
						unitdata.push({
							value : data[i].unitid,
							text : baidu.encodeHTML(data[i].unitname)
						});
					}
				}
				LevelUnit.fill(unitdata);

				if(unitid) {
					// 定位单元层级
					LevelUnit.setValue(unitid);
				}

				if(!changeable) {// 设置层级不可编辑
					LevelUnit.setReadOnly(true);
				}
			},

			onFail : function(response) {
				ajaxFailDialog();
			}
		});

		// 给单元列表挂载事件获取单元列表
		LevelUnit.onselect = function(value, selected, id) {
			var index = id.replace(_idMap.unitSelectIdPrefix, '');
			var tempLevelInfo = AUTOUNIT_MODEL.getTempLevelInfo(index);

			if(value <= 0) {

				tempLevelInfo.tempUnitId = -1;
				tempLevelInfo.tempUnitName = null;
				return false;
			}

			tempLevelInfo.tempUnitId = value;
			tempLevelInfo.tempUnitName = selected.text;
		};
	}

	function _cancelAutoUnit() {
		_hideAutoUnitPage();
		_restoreWordsToSBox(AUTOUNIT_MODEL.getOriginalWords());

		AUTOUNIT_MODEL.reset();
		AUTOUNIT_MODEL.takeSnapShot();
	}

	function _createButtons() {
		ui.util.dispose(_idMap.cancelBtnId);

		var cancelButton = ui.util.create('Button', {
			id : _idMap.cancelBtnId,
			logSwitch : false,
			content : '返回'
		});

		cancelButton.onclick = _cancelAutoUnit;
		baidu.g("autoUnitCancelButton").innerHTML = '';
		cancelButton.appendTo(baidu.g("autoUnitCancelButton"));

	}

	function _createGroupsHTML() {

		//创建8个分组
		var html = [];
		var tpl = er.template;
		for(var i = 0; i < 8; i++) {
			html.push(lib.tpl.parseTpl({
				i : i,
				groupIndex : i + 1
			}, tpl.get('autounitGroup')));
			//调用lib/tpl.js 和group.html
		}

		baidu.G("groupContainer").innerHTML = html.join("");
	}

	function _showErrorMsgInSBox(errorList) {
		var html = [];

		for(var i in errorList) {
			var errorWord = baidu.encodeHTML(errorList[i].wordStr), errorCode = errorList[i].wordCode, errorMsg = null;
			// 如果没有配置errerCode对应的错误信息，则显示返回的msg

			if(errorCode === 634) {
				errorMsg = "包含特殊字符或者触犯黑名单";
				html.push('<p><strong>关键词：' + errorWord + '</strong>  <span class="warn"> ' + errorMsg + '</span></p>');
			} else if(errorCode === 637) {
				errorMsg = "关键词过长";
				html.push('<p><strong>关键词：' + errorWord + '</strong>  <span class="warn"> ' + errorMsg + '</span></p>');
			} else {

			}
		}

		if(html.length > 0) {
			KR_AUTOUNIT.KR.addWords.showError(html.join(''));
			//调整做变得高度
		}

	}

	function _showPlanError(i, msg) {
		var planErr = baidu.G('planErr' + i);
		planErr.innerHTML = msg;
		baidu.show(planErr);
		_adjustModPanelPostion(i);
	}

	function _showUnitError(i, msg) {
		var unitErr = baidu.G('unitErr' + i);
		unitErr.innerHTML = msg;
		baidu.show(unitErr);
		_adjustModPanelPostion(i);
	}

	function _getAllFailedWordStrListJSONList(groupList) {
		var failedWords = [];

		for(var m in groupList) {
			//如果是641的话，可能是部分关键词溢出，所以还是需要轮询
			if(groupList[m].groupCode !== -1 && groupList[m].groupCode !== 641 ){
				for(var n in groupList[m].wordList) {
					failedWords.push(groupList[m].wordList[n]);
				}

				continue;
			}

			for(var n in groupList[m].wordList) {
				if(groupList[m].wordList[n].wordCode !== -1) {
					failedWords.push(groupList[m].wordList[n]);
				}
			}
		}

		return failedWords;
	}

	/*
	 *
	 * 获取所有保存失败的词
	 */
	function _getAllFailedWordStrList(groupList) {
		var failedWords = [];

		for(var m in groupList) {
			//如果是641的话，可能是部分关键词溢出，所以还是需要轮询
			if(groupList[m].groupCode !== -1 && groupList[m].groupCode !== 641){
				for(var n in groupList[m].wordList) {
					failedWords.push(groupList[m].wordList[n].wordStr);
				}

				continue;
			}

			for(var n in groupList[m].wordList) {
				if(groupList[m].wordList[n].wordCode !== -1) {
					failedWords.push(groupList[m].wordList[n].wordStr);
				}
			}
		}

		return failedWords;

	}

	function _refreshAllGroups() {
		var groupList = AUTOUNIT_MODEL.getGroupList();
		for(var i in groupList) {
			_refreshGroup(i);
		}
	}

	function _refreshGroup(i) {
		_refreshGroupView(i);

		AUTOUNIT_MODEL.syncTempLevelInfoFromGroupList(i);
	}

	function _showAutoUnitSaveWarnings(returnedGroupList) {
		//渲染页面，初始化控件
		for(var i in AUTOUNIT_MODEL.getGroupList()) {
			_refreshGroup(i);
		}
	}

	/*
	 * 生成询问是否强制保存的错误信息
	 */
	function _generateAskForceSaveWarningInfo(groupList) {
		var overCapacityGroupIndexs = [];
		var wordAlreadyExsitsGroupIndexs = [];

		var groupErrorList = [];
		//初始化组错误模型
		for(var i in nirvana.config.ERROR.AUTOUNIT.SAVE_WARNING_GROUP) {
			groupErrorList.push({
				code : i,
				seqList : [],
				title : nirvana.config.ERROR.AUTOUNIT.SAVE_WARNING_GROUP[i].title,
				detail : nirvana.config.ERROR.AUTOUNIT.SAVE_WARNING_GROUP[i].detail
			});
		}

		var wordErrorList = [];
		//初始化词错误模型
		for(var i in nirvana.config.ERROR.AUTOUNIT.SAVE_WARNING_WORD) {
			wordErrorList.push({
				code : i,
				seqList : [],
				title : nirvana.config.ERROR.AUTOUNIT.SAVE_WARNING_WORD[i].title,
				detail : nirvana.config.ERROR.AUTOUNIT.SAVE_WARNING_WORD[i].detail
			});
		}

		for(var index in groupList) {
			for(var m in groupErrorList) {//收集Group的错误
				if(groupErrorList[m].code == groupList[index].groupCode) {
					groupErrorList[m].seqList.push(parseInt(groupList[index].seqId) + 1);
				}
			}

			//收集词的错误
			for(var j in groupList[index].wordList) {

				for(var n in wordErrorList) {
					if(wordErrorList[n].code == groupList[index].wordList[j].wordCode) {

						//判断是否已经添加分组
						var groupIndexExsits = false;
						for(var k in wordErrorList[n].seqList) {
							if(wordErrorList[n].seqList[k] == parseInt(groupList[index].seqId) + 1) {
								groupIndexExsits = true;
							}
						}
						//如果没有添加过，则添加进去
						if(!groupIndexExsits) {
							wordErrorList[n].seqList.push(parseInt(groupList[index].seqId) + 1);
							break;
						}

					}

				}
			}
		}

		var html = [];

		html.push('<p>');
		//内部方法用于组装一句话
		function _generateErrorInfoFragment(header, indexArray, detail) {
			var info = '<strong>' + header + ':</strong>';

			for(var i in indexArray) {
				info += '<span class="au_dialog_warning">(' + indexArray[i] + ')组</span>';
			}

			info += detail + '<br/>';
			return info;
		}

		//遍历
		for(var i in groupErrorList) {
			if(groupErrorList[i].seqList.length > 0) {
				html.push(_generateErrorInfoFragment(groupErrorList[i].title, groupErrorList[i].seqList, groupErrorList[i].detail));
			}
		}
		//遍历
		for(var i in wordErrorList) {
			if(wordErrorList[i].seqList.length > 0) {
				html.push(_generateErrorInfoFragment(wordErrorList[i].title, wordErrorList[i].seqList, wordErrorList[i].detail));
			}
		}

		html.push('<br/>');

		html.push('是否继续？<span class="autounitTip">继续保存会将部分关键词放回提词栏内<span><br/>');
		html.push('</p>');
		return html.join("");
	}

	function _showAskForceSave(matchType) {


		var warningContent = _generateAskForceSaveWarningInfo(AUTOUNIT_MODEL.getGroupList());

		ui.Dialog.confirm({
			title : '请您确认',
			content : warningContent,
			ok_button_lang : '强制保存',
			cancel_button_lang : '返回修改',
			type : 'dialog',
			onok : function() {
				KR_AUTOUNIT.saveKeyWord(matchType, 1, AUTOUNIT_MODEL.generateGroupListForAjax(AUTOUNIT_MODEL.getGroupList()));
				nirvana.krMonitor.autoUnitForceSave({type: true});
			},
			oncancel : function() {
				_showAutoUnitSaveWarnings(AUTOUNIT_MODEL.getGroupList());
				nirvana.krMonitor.autoUnitForceSave({type: false});
			},
			onclose : function() {
				_showAutoUnitSaveWarnings(AUTOUNIT_MODEL.getGroupList());
			}
		});
	}

	function _finishedAutoUnit() {
		_hideAutoUnitPage();

		//退回保存失败的词
		var failedWordStrList = _getAllFailedWordStrList(AUTOUNIT_MODEL.getGroupList());
		//失败的分组['xxx','xxx']
		var failedWordJSONList = _getAllFailedWordStrListJSONList(AUTOUNIT_MODEL.getGroupList());
		//失败的分组，但是包含[]

		var errorList = AUTOUNIT_MODEL.getErrorList();
		//这个是第一次请求就过滤掉的词

		//需要恢复到左边SBOX的除了这次保存未成功的，还包括第一次就过滤掉的词，在errorList中
		for(var p in errorList) {
			failedWordStrList.push(errorList[p].wordStr);
		}

		//需要显示的错误信息，除了这次保存未成功的，还包括第一次就过滤掉的词，在errorList中
		for(var t in errorList) {
			failedWordJSONList.push(errorList[t]);
		}

		_hideAutoUnitPage();
		AUTOUNIT_MODEL.reset();
		AUTOUNIT_MODEL.takeSnapShot();
		//显示错误信息的操作必须在显示kr主界面后才能调用，不然会出现高度问题
		_restoreWordsToSBox(failedWordStrList);
		_showErrorMsgInSBox(failedWordJSONList);
		_refreshWordAndPlanList();
		KR_AUTOUNIT.KR.reloadRecommendResult();

	}

	function _addAutoUnitCallBack(data, forceSave, matchType) {

		var status = data.status;
		var errorCode = data.errorCode;
		var data = data.data;

		if(status === 200) {
			_finishedAutoUnit();
		} else if(status === 400 || status === 600) {//出问题的话，先还原提词栏的词
			ajaxFailDialog();
			_restoreWordsToSBox(AUTOUNIT_MODEL.getOriginalWords());
		} else if(status === 300) {//出问题的话，先还原提词栏的词
			if(forceSave === 0) {//询问保存
				//TODO
				//这个分支是因为杨超还没有完成AKA验证，临时的补丁
				if(errorCode.code == 2011) {//验证阶段部分错误
					AUTOUNIT_MODEL.syncReturnedGroupList(data.groupList);
					_showAskForceSave(matchType);
				} else if(errorCode.code == 2012) {//保存阶段部分错误,因为aka无法验证，所以进入保存，但是最后没有成功
					AUTOUNIT_MODEL.syncReturnedGroupList(data.groupList);
					_finishedAutoUnit();
				} else {
					AUTOUNIT_MODEL.syncReturnedGroupList(data.groupList);
					_showAskForceSave(matchType);
				}

			} else if(forceSave === 1) {//强制保存
					AUTOUNIT_MODEL.syncReturnedGroupList(data.groupList);
					_finishedAutoUnit();
			}
		} else {
			ajaxFailDialog();
			_hideAutoUnitPage();
			AUTOUNIT_MODEL.reset();
			AUTOUNIT_MODEL.takeSnapShot();
		}
	}

	function _adjustAutoUnitPageHeight() {
		var tempHeight = baidu.G('kr').parentNode.offsetHeight;
		if(tempHeight < 550){
			baidu.setStyle("kr_autounit", "height", 550 );
		}else{
			baidu.setStyle("kr_autounit", "height", baidu.G('kr').parentNode.offsetHeight );
		}

	}

	function _addListenerForModifyIcons() {
		for(var i = 0; i < 8; i++) {

			(function() {
				var temp = i;
				baidu.on('auModifyGroupTypeIcon' + temp, 'click', function() {
					KR_AUTOUNIT.showPlanUnitPanel(temp);
				});
			})(i)

		}

	}

	function _addDragListenerForAllGroup() {
		baidu.on('kr_autounit', 'mouseup', DRAG_HANDLER.OnDragMouseUp);
		baidu.on('kr_autounit', 'mousemove', DRAG_HANDLER.OnDragMouseMove);

		for(var i = 0; i < 8; i++) {
			//在每个组上注册事件
			baidu.on('wordList' + i, 'mousedown', DRAG_HANDLER.OnDragMouseDown);

			(function() {
				var temp = i;
				baidu.on('listWrapper' + temp, 'mouseover', function() {
					DRAG_HANDLER.OnDragMouseOver(temp);
				});

				baidu.on('listWrapper' + temp, 'mouseout', function() {
					DRAG_HANDLER.OnDragMouseOut(temp);
				})
			})(i)

		}
	}
	/**
	*	保存关键词之后刷新计划和关键词还有单元的缓存
	*/
	function _refreshWordAndPlanList(){
		fbs.material.clearCache('wordinfo');
		fbs.material.clearCache('planinfo');
		fbs.material.clearCache('unitinfo');
		ui.util.get('SideNav').refreshPlanList();
	}

	var exports = {
		logid : -1,

		actionArg:null,

		init : function(kr) {
			this.actionArg = kr.data;
			this.KR = kr;
			AUTOUNIT_MODEL.reset();
			AUTOUNIT_MODEL.recoverFromSnapShot();
		},

		start : function() {

			_init_id_map();

			_adjustAutoUnitPageHeight();
			_createGroupsHTML();
			//模板中已经写了响应函数，下面这个应该是不必要的，先删掉    mayue@baidu.com
			//_addListenerForModifyIcons();
			_addDragListenerForAllGroup();
			_createComponentsOnPanels();
			_adjustPlanUnitNameWidth();
			//创建组面板上的按钮
			_createButtons();

            _initDeleteBtns();
            
			//ui.util.get('autoUnitBtn').onclick = KR_AUTOUNIT.onClickAutoUnitBtn;
			ui.util.get('saveKeyAutoUnit').onselect = KR_AUTOUNIT.matchKeyWord;

			//修改关键字保存按钮的title
			baidu.g('ctrlselectsaveKeyAutoUnit').title = '可点击右边下拉箭头调整匹配方式';
			baidu.g('ctrlselectsaveKeyAutoUnitcur').title = '';

			if(AUTOUNIT_MODEL.isInAutoUnitPage()) {
				_enterAutoUnitPage();
				_refreshAllGroups();
			} else {//只有在非分组界面的时候才添加新功能气泡，不然气泡会出现在左上角


			}

		},
		
		//单点拖动
		doSingleTransfer: function(fromId, toId, wordIndex) {

			var wordsToTransfer = [];
			var groupList = AUTOUNIT_MODEL.getGroupList();
			
			var toNew = (groupList[toId].wordList.length > 0) ? 0 : 1;
			nirvana.krMonitor.autoUnitTransferWord({
                word: groupList[fromId].wordList[wordIndex].wordStr,
                fromgroupid: fromId,
                fromplanname: groupList[fromId].planName,
                fromunitname: groupList[fromId].unitName,
                fromplanid: groupList[fromId].planId,
                fromunitid: groupList[fromId].unitId,
                togroupid: toId,
                toplanname: groupList[toId].planName ? groupList[toId].planName : '',
                tounitname: groupList[toId].unitName ? groupList[toId].unitName : '',
                toplanid: groupList[toId].planId,
                tounitid: groupList[toId].unitId,
                isadd: toNew
            });//监控

			var fromWordList = groupList[fromId].wordList;
			//拖拽的源头词组
			var wordListAfterTransfer = [];
			//存放拖拽完后的词

			for(var i in fromWordList) {
				if(wordIndex == i) {
					var tempWord = fromWordList[i];
					tempWord.selected = false;
					tempWord.wordDisplay = tempWord.wordStr;
					//转移后对飘红词进行漂白
					wordsToTransfer.push(tempWord);
				} else {
					wordListAfterTransfer.push(fromWordList[i]);
					//加入到剩余词组中
				}
			}
			//将需要转移的word和目标分组的原有词合并，需要转移的词放到最前面，最后赋值给目标分组
			var originalWordListInToGroup = groupList[toId].wordList;

			var suggestedNewUnitName = AUTOUNIT_MODEL.getSuggestedNewUnitName(toId);

			//如果目标组原来是空组，需要添加plan和unit信息
			if(originalWordListInToGroup.length <= 0) {
				groupList[toId].planId = -1;
				groupList[toId].unitId = -1;
				groupList[toId].planName = '新建计划';
				groupList[toId].unitName = suggestedNewUnitName;
				groupList[toId].groupCode = -1;
			}
			//将目标分组的原有词拼到转移的词的后面，然后赋值给目标组
			for(var i in originalWordListInToGroup) {
				wordsToTransfer.push(originalWordListInToGroup[i]);
			}
			groupList[toId].wordList = wordsToTransfer;

			//剩余的组
			groupList[fromId].wordList = wordListAfterTransfer;
			//如果原组木有词了，把分组信息删除
			if(groupList[fromId].wordList.length <= 0) {
				groupList[fromId].planId = -1;
				groupList[fromId].unitId = -1;
				groupList[fromId].planName = null;
				groupList[fromId].unitName = null;
				groupList[fromId].groupCode = -1;
			}

			//重建index
			AUTOUNIT_MODEL.buildWordIndex(toId);
			AUTOUNIT_MODEL.buildWordIndex(fromId);

			//刷新
			_refreshGroupView(fromId);
			_refreshGroupView(toId);

			_verifyAfterDrag(fromId, toId);
		},

		
		

		doTransfer : function(fromId, toId) {

			var wordsToTransfer = [];
			var groupList = AUTOUNIT_MODEL.getGroupList();

			var fromWordList = groupList[fromId].wordList;
			//拖拽的源头词组
			var wordListAfterTransfer = [];
			//存放拖拽完后的词

			//
			for(var i in fromWordList) {
				if(fromWordList[i].selected === true) {
					var tempWord = fromWordList[i];
					tempWord.selected = false;
					tempWord.wordDisplay = tempWord.wordStr;
					//转移后对飘红词进行漂白
					wordsToTransfer.push(tempWord);
				} else {
					wordListAfterTransfer.push(fromWordList[i]);
					//加入到剩余词组中
				}
			}
			
			var toNew = (groupList[toId].wordList.length > 0) ? 0 : 1;
			nirvana.krMonitor.autoUnitTransferWord({
			    word: wordsToTransfer.join(),
                fromgroupid: fromId,
                fromplanname: groupList[fromId].planName,
                fromunitname: groupList[fromId].unitName,
                fromplanid: groupList[fromId].planId,
                fromunitid: groupList[fromId].unitId,
                togroupid: toId,
                toplanname: groupList[toId].planName ? groupList[toId].planName : '',
                tounitname: groupList[toId].unitName ? groupList[toId].unitName : '',
                toplanid: groupList[toId].planId,
                tounitid: groupList[toId].unitId,
                isadd: toNew
            });//监控
			
			//将需要转移的word和目标分组的原有词合并，需要转移的词放到最前面，最后赋值给目标分组
			var originalWordListInToGroup = groupList[toId].wordList;

			var suggestedNewUnitName = AUTOUNIT_MODEL.getSuggestedNewUnitName(toId);

			//如果目标组原来是空组，需要添加plan和unit信息
			if(originalWordListInToGroup.length <= 0) {
				groupList[toId].planId = -1;
				groupList[toId].unitId = -1;
				groupList[toId].planName = '新建计划';
				groupList[toId].unitName = suggestedNewUnitName;
				groupList[toId].groupCode = -1;
			}
			//将目标分组的原有词拼到转移的词的后面，然后赋值给目标组
			for(var i in originalWordListInToGroup) {
				wordsToTransfer.push(originalWordListInToGroup[i]);
			}
			groupList[toId].wordList = wordsToTransfer;

			//剩余的组
			groupList[fromId].wordList = wordListAfterTransfer;
			//如果原组木有词了，把分组信息删除
			if(groupList[fromId].wordList.length <= 0) {
				groupList[fromId].planId = -1;
				groupList[fromId].unitId = -1;
				groupList[fromId].planName = null;
				groupList[fromId].unitName = null;
				groupList[fromId].groupCode = -1;
			}

			//重建index
			AUTOUNIT_MODEL.buildWordIndex(toId);
			AUTOUNIT_MODEL.buildWordIndex(fromId);

			//刷新
			_refreshGroupView(fromId);
			_refreshGroupView(toId);

			_verifyAfterDrag(fromId, toId);

		},


		onClickWord : function(groupIndex, wordIndex, id) {
			var groupList = AUTOUNIT_MODEL.getGroupList();
			var word = groupList[groupIndex].wordList[wordIndex];

            var firstFlag = AUTOUNIT_MODEL.isAnyWordSelected(groupIndex);
            var secondFlag;
            
			if(word.selected == true) {
				word.selected = false;
				baidu.removeClass('autoUnitWord' + word.index, 'au_word_selected');
				
				secondFlag = AUTOUNIT_MODEL.isAnyWordSelected(groupIndex);
				if (!secondFlag) {
				    KR_AUTOUNIT.showDeleteBtn(groupIndex, false);
				}
			} else {
				word.selected = true;
				baidu.addClass('autoUnitWord' + word.index, 'au_word_selected');
				
				secondFlag = AUTOUNIT_MODEL.isAnyWordSelected(groupIndex);
				if (!firstFlag && secondFlag) {
				    KR_AUTOUNIT.showDeleteBtn(groupIndex, true);
				}
			}
		},
		/*
		 * @param groupIndex {number} 组的id
		 * @param groupIndex {boolean} 是否显示
		 */
		showDeleteBtn : function(groupIndex, show){
		    baidu.dom.setStyle('listWrapper' + groupIndex, 'bottom', show ? '40px' : '10px');
		},

		onClickAutoUnitBtn : function() {

			//清空SBOX报错信息,并隐藏
			KR_AUTOUNIT.KR.addWords.showError("");

			ui.Bubble.hide('autoUnitNewPro');

			//获取选取的词，并先将词清空
			var wordSelected = ui.util.get('wordSelected');

			var oginialWords = KR_AUTOUNIT.KR.addWords.get();
			AUTOUNIT_MODEL.setOriginalWords(oginialWords);

			if(!oginialWords || oginialWords.length <= 0) {
				ui.Dialog.alert({
					title : '没有关键词',
					content : '请先在左侧提词栏中添加关键词, 然后再使用自动分组功能'
				});

				return false;
			}

			if(oginialWords && oginialWords.length > 100) {
				ui.Dialog.alert({
					title : '关键词数量超过限制',
					content : '最多只能提供100个关键词的自动分组'
				});

				return false;
			}

			KR_AUTOUNIT.KR.addWords.set([]);

			var param = {
				words : oginialWords,
				krautoType : 0, //默认是0
				logId : -1,
				callback : function(data) {
					var status = data.status;
					var errorCode = data.errorCode;
					var data = data.data;

					if(status == 200 || status == 300) {//300为部分成功， 200为全部成功， 处理逻辑一样

						//用于保证KR后端的实时性， 2012-07-10 黄锴 huangkai01
						var tempSessionId = data.krAutoUnitSessionId; 
						if(typeof tempSessionId == 'undefined'){
							tempSessionId = "0";
						}
						AUTOUNIT_MODEL.setSessionId(tempSessionId);
						//end~ 用于保证KR后端的实时性， 2012-07-10 黄锴 huangkai01
						var groupList = data.groupList;

						if(data.errorList.length > 0) {
							_showIllegalWordListAlert(data.errorList);
						}
						
						if (LoginTime.isFirstTime('krau_guide')) {
                            document.body.appendChild(fc.create('<div id="krauGuide"><div id="krauGuideClose"></div><div id="krauGuideOK"></div></div>'));
                            var width = document.documentElement.clientWidth;
                            var height = document.documentElement.clientHeight;
                            document.getElementById('krauGuide').style.left = (width - 701)/2 + 'px';
                            document.getElementById('krauGuide').style.top = (height - 421)/2 + 'px';
                            document.getElementById('krauGuideOK').onclick = function(){
                                baidu.hide('krauGuide');
                                ui.Mask.hide('11');
                            };
                            document.getElementById('krauGuideClose').onclick = function(){
                                baidu.hide('krauGuide');
                                ui.Mask.hide('11');
                            };
                            ui.Mask.show('black', '11');
                        }

						//先把错误的词记录下来，最后提示到提词栏
						AUTOUNIT_MODEL.setErrorList(data.errorList);
						//同步数据
						AUTOUNIT_MODEL.syncReturnedGroupList(groupList);
						//推荐新建单元的名字
						AUTOUNIT_MODEL.setSuggestedNewUnitNames(data.unitNameList);

						var groupListAfterSync = AUTOUNIT_MODEL.getGroupList();

						//渲染页面，初始化控件
						for(var i in groupListAfterSync) {
							_refreshGroupView(i);

							_initPlanList(this.actionArg, i, groupListAfterSync[i].planId, groupListAfterSync[i].unitId);
							AUTOUNIT_MODEL.syncTempLevelInfoFromGroupList(i);
						}

						//显示页面
						_enterAutoUnitPage();

					} else if(status == 600) {//出问题的话，先还原提词栏的词

						if(errorCode && errorCode.code === 2003) {
							ui.Dialog.alert({
								title : '错误',
								content : "没有合法的关键词可供分组，不合法的词已经返回到提词栏"
							});

						} else if(errorCode && errorCode.code === 4) {
							ui.Dialog.alert({
								title : '权限错误',
								content : "您的权限不足或者账户异常"
							});

						} else {
							ajaxFailDialog();
						}

						_showErrorMsgInSBox(data.errorList);
						_restoreWordsToSBox(AUTOUNIT_MODEL.getOriginalWords());

					} else {//出问题的话，先还原提词栏的词
						_restoreWordsToSBox(AUTOUNIT_MODEL.getOriginalWords());
						ajaxFailDialog();
					}

				}
			};

			fbs.kr.autounit(param);
		},

		//取消修改plan和unit， 隐藏panel
		cancelPlanUnitMod : function(i) {
			baidu.hide('planUnitPanel' + i);
		},
		//修改plan和uint，显示panel
		showPlanUnitPanel : function(i) {
		    nirvana.krMonitor.autoUnitClickEditPlan({groupid: i});//监控
		    
			//先同步临时模型，验证后才能同步到groupList中
			AUTOUNIT_MODEL.syncTempLevelInfoFromGroupList(i);
			var groupList = AUTOUNIT_MODEL.getGroupList();

			if(groupList[i].planId === -1 || groupList[i].unitId === -1) {
				ui.util.get(_idMap.planInputIdPrefix + i).setValue(groupList[i].planName);
				ui.util.get(_idMap.unitInputIdPrefix + i).setValue(groupList[i].unitName);
				baidu.G('addToExisitRadio' + i).checked = false;
				baidu.G('addToNewRadio' + i).checked = true;
				_showAddToNewPanel(i);
			} else {
				baidu.G('addToExisitRadio' + i).checked = true;
				baidu.G('addToNewRadio' + i).checked = false;
				_showAddToExsitsPanel(i);
			}

			baidu.show('planUnitPanel' + i);
			_adjustModPanelPostion(i);
		},

		/*
		 * 修改计划单元的确认按钮
		 */
		confirmModPlanUnit : function(i) {
			_cleanErrMsgOnPanel(i);

			if(baidu.G(_settings.radio_new_prefix + i).checked === true) {//选择添加到新建单元
			    
				var newPlanName = baidu.trim(ui.util.get(_idMap.planInputIdPrefix + i).getValue());
				var newUnitName = baidu.trim(ui.util.get(_idMap.unitInputIdPrefix + i).getValue());

				if(!newPlanName || newPlanName == "" || newPlanName == MSG.inputPlanName) {
					_showPlanError(i, MSG.noPlanName);
					return false;
				}

				if(getLengthCase(newPlanName) > PLAN_NAME_MAXLENGTH) {
					_showPlanError(i, nirvana.config.ERROR.AUTOUNIT.PLAN.TOO_LONG);
					return false;
				}

				if(!newUnitName || newUnitName == "" || newUnitName == MSG.inputUnitName) {
					_showUnitError(i, MSG.noUnitName);
					return false;
				}

				if(getLengthCase(newUnitName) > UNIT_NAME_MAXLENGTH) {
					_showUnitError(i, nirvana.config.ERROR.AUTOUNIT.UNIT.TOO_LONG);
					return false;
				}

				var groupList = AUTOUNIT_MODEL.getGroupList();
				for(var t in groupList) {//别把t改成i,会跟这个方法的参数互相影响
					var planUnitName = groupList[t].planName || '' + '_' + groupList[t].unitName;
					var newPlanUnitName = newPlanName + '_' + newUnitName;
					if(planUnitName == newPlanUnitName) {
						_showUnitError(i, nirvana.config.ERROR.AUTOUNIT.UNIT.DUPLICATE);
						return false;
					}
				}
				
				nirvana.krMonitor.autoUnitSaveToNew({
				    groupid: i,
				    oldplanid: groupList[i].planId,
				    oldunitid: groupList[i].unitId,
				    oldplanname: groupList[i].planName,
				    oldunitname: groupList[i].unitName,
				    newplanname: newPlanName,
				    newunitname: newUnitName
				});//监控

				//没有问题的话设置AUTOUNIT_MODEL_tempLevelInfoList[i]

				var tempLevelInfo = AUTOUNIT_MODEL.getTempLevelInfo(i);
				tempLevelInfo.tempPlanId = -1;
				tempLevelInfo.tempPlanName = newPlanName;
				tempLevelInfo.tempUnitId = -1;
				tempLevelInfo.tempUnitName = newUnitName;

				var groupList = AUTOUNIT_MODEL.getGroupList();

				var param = {
					logId : -1,
					planName : newPlanName,
					unitName : newUnitName,
					callback : function(data) {

						var status = data.status;
						var errorCode = data.errorCode;

						if(status === 200) {
							AUTOUNIT_MODEL.commitTempLevelInfo(i);

							baidu.G('planName' + i).innerHTML = newPlanName;
							baidu.G('unitName' + i).innerHTML = newUnitName;
							//_adjustPlanUnitNameWidthSpecific(i);

							//baidu.G(_settings.unit_type_prefix + i).innerHTML = MSG.saveToNew;
							_initPlanList(this.actionArg, i, groupList[i].planId, groupList[i].unitId);
							baidu.hide('planUnitPanel' + i);
							AUTOUNIT_MODEL.cleanCodeAndErrorForOneGroup(i);
							_refreshGroup(i);

						} else if(status === 600) {
							if(errorCode.code === 405 || errorCode.code === 451 || errorCode.code === 452) {//计划名错误
								_showPlanError(i, nirvana.config.ERROR.AUTOUNIT.PLAN[errorCode.code]);
							} else if(errorCode.code === 501 || errorCode.code === 502 || errorCode.code === 500 || errorCode.code === 513) {//单元名错误
								_showUnitError(i, nirvana.config.ERROR.AUTOUNIT.UNIT[errorCode.code]);
							} else {

							}

						} else {
							ajaxFailDialog();
						}

					}
				}

				fbs.kr.valNewPlanUnit(param);

			} else {//选择添加到已有单元
				var tempLevelInfoList = AUTOUNIT_MODEL.getTempLevelInfoList();
				if(tempLevelInfoList[i].tempPlanId <= 0) {
					_showPlanError(i, MSG.pleaseChoosePlan);
					return false;
				}

				if(tempLevelInfoList[i].tempUnitId <= 0) {
					_showUnitError(i, MSG.pleaseChooseUnit);
					return false;
				}

				if(!AUTOUNIT_MODEL.isPlanUnitStillTheSame(i)) {//判断是否更改，如果没有更改则直接hide,如果更改需要清楚所有错误信息
					AUTOUNIT_MODEL.commitTempLevelInfo(i);
					//正式将更改同步到_groupList中
					//设置面板上的显示
					var groupList = AUTOUNIT_MODEL.getGroupList();
					baidu.G('planName' + i).innerHTML = "计划: " + groupList[i].planName;
					baidu.G('unitName' + i).innerHTML = "单元: " + groupList[i].unitName;
					//更改右上角显示
					//baidu.G(_settings.unit_type_prefix + i).innerHTML = MSG.saveToExists;

					ui.util.get(_idMap.unitInputIdPrefix + i).setValue('');
					ui.util.get(_idMap.planInputIdPrefix + i).setValue('');

					baidu.hide('planUnitPanel' + i);
					AUTOUNIT_MODEL.cleanCodeAndErrorForOneGroup(i);
					_refreshGroup(i);
				} else {
					baidu.hide('planUnitPanel' + i);
				}
				
				nirvana.krMonitor.autoUnitSaveToExist({groupid: i});//监控

			}

		},

		onChangeUnitType : function(i, value) {

			if(value === 1) {//已有单元
				_showAddToExsitsPanel(i);
			} else {
				//获取推荐的名字
				ui.util.get(_idMap.planInputIdPrefix + i).setValue(MSG.DEFAULT_PLAN_NAME);
				ui.util.get(_idMap.unitInputIdPrefix + i).setValue(AUTOUNIT_MODEL.getSuggestedNewUnitName(i));
				_showAddToNewPanel(i);
			}

			_cleanErrMsgOnPanel(i);

			_adjustModPanelPostion(i);
		},

		matchKeyWord : function(selected, key, id) {

			var groupListForSave = AUTOUNIT_MODEL.generateGroupListForAjax(AUTOUNIT_MODEL.getGroupList());

			switch (selected) {
				case '2':
					KR_AUTOUNIT.saveKeyWord(15, 0, groupListForSave);
					this.setValue("-9999");
					break;
				case '1':
					KR_AUTOUNIT.saveKeyWord(31, 0, groupListForSave);
					this.setValue("-9999");
					break;
				case '0':
					KR_AUTOUNIT.saveKeyWord(63, 0, groupListForSave);
					this.setValue("-9999");
					break;
				default :
					KR_AUTOUNIT.saveKeyWord(15, 0, groupListForSave);
					break;
			}
			//修改保存控件title提示语
			var el = baidu.g('ctrlselectsaveKeyAutoUnitcur');
			setTimeout(function() {
				if(el) {
					el.title = '';
				}

			}, 500);
		},

		//63：精确匹配；31：短语匹配；15：广泛匹配；
		saveKeyWord : function(matchType, forceSave, groupList) {

			var param = {
				forceSave : forceSave, // 0：有问题就返回，询问客户，1：强制保存
				groupList : groupList,
				matchType : matchType,
				logId : -1,
				krAutoUnitSessionId : AUTOUNIT_MODEL.getSessionId(),
				callback : function(data) {
					return _addAutoUnitCallBack(data, forceSave, matchType);
				}
			}
			
			fbs.kr.addAutoUnit(param);
		}
	};

	//需要暴露的方法和变量
	return exports;

})();

/**
 *
 *拖拽处理
 *
 */

var DRAG_HANDLER = (function() {
	var _isDragging = false;
	var _from_id = -1; //拖动开始组的index
	var _to_id = -1; //拖动结束组的index
	
	var _to_transfer_selected_word = false;
	var _drag_start_word_index = -1;

	/**
	 *
	 *工具，获取target
	 */
	function _getTarget(event) {
		var e = event || window.event, target = e.target || e.srcElement;
		return target;
	}

	/**
	 *
	 *根据target活的所在组的id
	 */
	function _getGroupId(target) {
		var ele = target;

		//如果ele存在,或者（id不存在或者d 并不是以emptyGroup或者wordList开头，那么继续往上层父元素找，直到找不到父元素
		while(ele && (!ele.id || (ele.id.indexOf('listWrapper') === -1 && ele.id.indexOf('emptyGroup') === -1))) {
			ele = ele.parentNode;
		}

		if(!ele || !ele.id || (ele.id.indexOf('listWrapper') === -1 && ele.id.indexOf('emptyGroup') === -1)) {
			return -1;
		}

		var id = ele.id.replace('listWrapper', "").replace('emptyGroup', "");

		id = parseInt(id);
		return id;
	}
	
	/**
	 * 	判断是哪个词条被拖动
	 */
	function _getWordIndex(target){

		var ele = target;

		if(ele && ele.id) {
			//DO　nothing
		} else {
			//网上查找一次
			ele = ele.parentNode;
			if(!ele||!ele.id){
				return null;
			}

		}

		if(ele.id.indexOf('autoUnitWord') === -1) {
			return null;
		} else {
			return ele.id.replace('autoUnitWord', "")
		}

	}

	/**
	 *
	 *设置拖动跟随的小图片
	 *
	 */

		function _setDraggingHelp(groupIndex, wordIndex) {

			if(AUTOUNIT_MODEL.isWordSelected(groupIndex, wordIndex)) {
				var count = 0;
				var wordNameOnHelper = "";
				var groupList = AUTOUNIT_MODEL.getGroupList();
				var isMultipleWordsSelected = false;

				for(var i in groupList[groupIndex].wordList) {
					if(groupList[groupIndex].wordList[i].selected === true) {
						count++;
					}

					if(count > 1) {
						isMultipleWordsSelected = true;
						break;
					}
				}

				baidu.G('draggingImg').innerHTML = getCutString(groupList[groupIndex].wordList[wordIndex].wordStr, 16, '..');
				//如果多个词选定，换成双图片的
				if(isMultipleWordsSelected === true) {
					baidu.removeClass(baidu.G('draggingImg'), 'dragingImgBGSingle');
					baidu.addClass(baidu.G('draggingImg'), 'dragingImgBGMulti');
				} else {
					baidu.removeClass(baidu.G('draggingImg'), 'dragingImgBGMulti');
					baidu.addClass(baidu.G('draggingImg'), 'dragingImgBGSingle');
				}

			} else {
				baidu.removeClass(baidu.G('draggingImg'), 'dragingImgBGMulti');
				baidu.addClass(baidu.G('draggingImg'), 'dragingImgBGSingle');
				var groupList = AUTOUNIT_MODEL.getGroupList();
				baidu.G('draggingImg').innerHTML = getCutString(groupList[groupIndex].wordList[wordIndex].wordStr, 16, '..');
			}

		}


	var exports = {
		reset : function() {
			_isDragging = false, _from_id = null, _to_id = null, baidu.hide(baidu.G('draggingImg'));
			_to_transfer_selected_word = false;
			_drag_start_word_index = -1;
		},

		OnDragMouseMove : function(event) {
			baidu.event.preventDefault(event);

			if(_isDragging === true) {

				var x = event.clientX;
				var y = event.clientY;

				baidu.dom.setStyle('draggingImg', "left", x + 10);
				baidu.dom.setStyle('draggingImg', "top", y + 10);
				baidu.show('draggingImg');
				//TODO 性能调优

			}
		},

		OnDragMouseDown : function(event) {
			baidu.event.preventDefault(event);

			_from_id = _getGroupId(_getTarget(event));
			var selectedWordIndex = _getWordIndex(_getTarget(event));
			
			if(!selectedWordIndex||selectedWordIndex.indexOf("_") == -1){
				return false;
			}
			
			
			var groupIndex =  selectedWordIndex.substring(0,1);
			var wordIndex =  selectedWordIndex.substring(2);
			
			_isDragging = true;
			_setDraggingHelp(groupIndex, wordIndex);
			
			if(AUTOUNIT_MODEL.isWordSelected(groupIndex, wordIndex)){
				_to_transfer_selected_word = true;
			}else{
				
				baidu.addClass("autoUnitWord"+selectedWordIndex, 'au_word_selected');
				
				_to_transfer_selected_word = false;
				_drag_start_word_index = wordIndex;
			}
		},

		OnDragMouseUp : function(event) {

			baidu.event.preventDefault(event);
			_to_id = _getGroupId(_getTarget(event));
			
			var fromId = _from_id, toId = _to_id;
			var to_transfer_selected_word = _to_transfer_selected_word;
			var wordIndex =  _drag_start_word_index;

			if(_isDragging && _from_id !== -1 && _to_id !== -1 && _from_id !== _to_id) {
				baidu.addClass('listWrapper' + _to_id, 'au_list_border_normal');
				baidu.removeClass('listWrapper' + _to_id, 'au_list_border_hover');

				//先reset的好处是，可以把蓝色边框去掉，不然要等到dotransfer以后才行，网络慢的情况下，会一直亮着
				//DRAG_HANDLER.reset();
				if(to_transfer_selected_word){//在选中的上面进行拖动
						KR_AUTOUNIT.doTransfer(fromId, toId);
				}else{//在未选中的词上面拖动， 即单点拖动
						KR_AUTOUNIT.doSingleTransfer(fromId, toId, wordIndex);
				}
			}else{
				//如果单点拖动无效，则把原来的那个词也恢复原来的背景色
				if(_isDragging && !to_transfer_selected_word){
					baidu.removeClass("autoUnitWord"+fromId+'_'+wordIndex, 'au_word_selected');
				}
			}
			
			DRAG_HANDLER.reset();

		},

		OnDragMouseOver : function(i) {
			if(_isDragging && (i !== _from_id)) {
				baidu.removeClass('listWrapper' + i, 'au_list_border_normal');
				baidu.addClass('listWrapper' + i, 'au_list_border_hover');

			}
		},

		OnDragMouseOut : function(i) {
			baidu.removeClass('listWrapper' + i, 'au_list_border_hover');
			baidu.addClass('listWrapper' + i, 'au_list_border_normal');
		}
	};

	return exports;
})();

/*
 *
 *	用来保存分组信息的模块
 *
 */
var AUTOUNIT_MODEL = (function() {
	var _groupList = [];
	var _originalWords = [];
	//推荐的新建单元名
	var _suggestedNewUnitNames = [];
	//错误列表
	var _errorList = [];
	//用于客户修改保存方式的时候存放的临时变量，验证成功后才会同步到_groupList中的planName, planId, unitName, unitId
	var _tempLevelInfoList = [];

	var _isInAutoUnitPage = false;

	var _kr_autounit_session_id = "0";

	var exports = {
		reset : function() {
			_groupList = [];
			_originalWords = [];
			_suggestedNewUnitNames = [];
			_errorList = [];
			_isInAutoUnitPage = false;

			_tempLevelInfoList = [];
			for(var i = 0; i < 8; i++) {
				this.resetTempLevelInfo(i);
			}
		},

		setSessionId : function(autounitSessionId){
			_kr_autounit_session_id = autounitSessionId;
		},

		getSessionId: function(){
			return _kr_autounit_session_id;
		},

		/*
		 *给个快照，存到flash里面去，这样下次打开还是分组页面
		 */
		takeSnapShot : function() {
			var snapshot = {
				'isInAutoUnitPage' : _isInAutoUnitPage,
				'groupList' : _groupList,
				'originalWords' : _originalWords,
				'suggestedNewUnitNames' : _suggestedNewUnitNames,
				'errorList' : _errorList,
				'kr_autounit_session_id': _kr_autounit_session_id
			};

			FlashStorager.set("autounit_snapshot" + nirvana.env.USER_ID, snapshot);
		},

		cleanSnapShot : function() {

			FlashStorager.set("autounit_snapshot" + nirvana.env.USER_ID, null);
		},

		recoverFromSnapShot : function() {
			FlashStorager.get("autounit_snapshot" + nirvana.env.USER_ID, function(snapshot) {

				if(snapshot) {
					_groupList = snapshot.groupList || [];
					_originalWords = snapshot.originalWords || [];
					_suggestedNewUnitNames = snapshot.suggestedNewUnitNames || [];
					_errorList = snapshot.errorList || [];
					_isInAutoUnitPage = snapshot.isInAutoUnitPage || false;
					_kr_autounit_session_id = snapshot.kr_autounit_session_id || -1;

					for(var i = 0; i < 8; i++) {
						AUTOUNIT_MODEL.resetTempLevelInfo(i);
					}
				}
			});
		},

		setInAutoUnitPage : function(isIn) {
			_isInAutoUnitPage = isIn;
		},

		isInAutoUnitPage : function() {

			return _isInAutoUnitPage;
		},

		getGroupList : function() {
			return _groupList;
		},

		setOriginalWords : function(originalWords) {
			_originalWords = originalWords;
		},

		buildWordIndex : function(groupIndex) {

			for(var i in _groupList[groupIndex].wordList) {
				_groupList[groupIndex].wordList[i].index = groupIndex + "_" + i;
			}

		},
		
		isWordSelected: function(groupIndex ,  wordIndex){
			return _groupList[groupIndex].wordList[wordIndex].selected;
		},

		resetTempLevelInfo : function(i) {
			_tempLevelInfoList[i] = {
				'tempPlanId' : -1,
				'tempPlanName' : null,
				'tempUnitId' : -1,
				'tempUnitName' : null
			};

		},

		/**
		 *
		 *同步server返回的groupList，通过seqId进行组的对应
		 *
		 */
		syncReturnedGroupList : function(groupList) {
			//将返回的分组情况进行重新组装
			for(var i in groupList) {
				var seqId = groupList[i].seqId;
				_groupList[seqId] = groupList[i];

				for(var j in groupList[i].wordList ) {
					if(groupList[i].wordList[j].wordCode === 636) {
						_groupList[seqId].wordList[j].wordDisplay = '<span class="au_word_warning">(已购)' + _groupList[seqId].wordList[j].wordStr + '</span>';
					} else if(groupList[i].wordList[j].wordCode === 635) {
						_groupList[seqId].wordList[j].wordDisplay = '<span class="au_word_warning">(否定词冲突)' + _groupList[seqId].wordList[j].wordStr + '</span>';
					} else {
						_groupList[seqId].wordList[j].wordDisplay = _groupList[seqId].wordList[j].wordStr;
					}
					//创建index属性
					this.buildWordIndex(seqId);
				}
			}
		},

		setErrorList : function(errorList) {
			_errorList = errorList;
		},

		addError : function(error) {
			_errorList.push(error);
		},
		getErrorList : function() {
			return _errorList;
		},
		getOriginalWords : function() {
			return _originalWords;
		},

		setSuggestedNewUnitNames : function(suggestedNewUnitNames) {
			_suggestedNewUnitNames = suggestedNewUnitNames;
		},
		getSuggestedNewUnitName : function(i) {
			return _suggestedNewUnitNames[i];
		},

		/*
		 * 将数据从_groupList中同步到temp
		 */
		syncTempLevelInfoFromGroupList : function(i) {
			_tempLevelInfoList[i].tempPlanId = _groupList[i].planId;
			_tempLevelInfoList[i].tempPlanName = _groupList[i].planName;
			_tempLevelInfoList[i].tempUnitId = _groupList[i].unitId;
			_tempLevelInfoList[i].tempUnitName = _groupList[i].unitName;
		},
		/*判断是否更改过*/
		isPlanUnitStillTheSame : function(i) {
			return (_tempLevelInfoList[i].tempPlanId == _groupList[i].planId ) && (_tempLevelInfoList[i].tempPlanName == _groupList[i].planName ) && (_tempLevelInfoList[i].tempUnitId == _groupList[i].unitId ) && (_tempLevelInfoList[i].tempUnitName == _groupList[i].unitName );
		},

		setTempLevelInfo : function(i, tempLevelInfo) {
			_tempLevelInfoList[i] = tempLevelInfo;
		},

		getTempLevelInfo : function(i) {
			return _tempLevelInfoList[i];
		},
		getTempLevelInfoList : function(i) {
			return _tempLevelInfoList;
		},

		commitTempLevelInfo : function(i) {
			_groupList[i].planId = _tempLevelInfoList[i].tempPlanId;
			_groupList[i].planName = _tempLevelInfoList[i].tempPlanName;
			_groupList[i].unitId = _tempLevelInfoList[i].tempUnitId;
			_groupList[i].unitName = _tempLevelInfoList[i].tempUnitName;

		},

		generateGroupForAjax : function(group) {
			var cloneGroup = baidu.object.clone(group);

			for(var j in cloneGroup.wordList) {
				delete cloneGroup.wordList[j].index;
				delete cloneGroup.wordList[j].wordDisplay;
			}

			return cloneGroup;
		},

		generateGroupListForAjax : function(groupList) {
			var cloneList = [];

			for(var i in groupList) {
				cloneList.push(this.generateGroupForAjax(groupList[i]));
			}
			return cloneList;
		},

		cleanCodeAndErrorForOneGroup : function(i) {
			_groupList[i].groupCode = -1;
			for(var m in _groupList[i].wordList) {
				_groupList[i].wordList[m].wordCode = -1;
				_groupList[i].wordList[m].wordDisplay = _groupList[i].wordList[m].wordStr;
			}
		},

		isAnyWordSelected : function(groupIndex) {
			for(var i in _groupList[groupIndex].wordList) {
				if(_groupList[groupIndex].wordList[i].selected === true) {
					return true;
				}
			}

			return false;
		},
		
		deleteAllSelectedWords : function(groupIndex){
		    for (var i = _groupList[groupIndex].wordList.length - 1; i >= 0; i --) {
                if(_groupList[groupIndex].wordList[i].selected === true) {
                    _groupList[groupIndex].wordList.splice(i, 1);
                }
            }
		},
		
		getAllSelectedWordIndex : function(groupIndex){
		    var selected = [];
		    for (var i = 0; i < _groupList[groupIndex].wordList.length; i ++) {
                if(_groupList[groupIndex].wordList[i].selected === true) {
                    selected.push(i);
                }
            }
            return selected;
		}
	}

	return exports;
})();

