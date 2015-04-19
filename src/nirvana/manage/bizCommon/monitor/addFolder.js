/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    monitor/addFolder.js
 * desc:    新建监控文件夹
 * author:  zhouyu
 * date:    $Date: 2011/02/12 $
 */


/**
 * @namespace 新建监控文件夹
 */
manage.addFolder = new er.Action({
	
	VIEW: 'addFolder',
	
	UI_PROP_MAP : {
		wordList : {
			type:'List',
			skin:'wordlist',
			content:'*wordChosen'
		},
		
		wordSelect:{
			type:'AvatarMaterial',
			form:'material',
			width:'488',
			height:'366',
			addWords:'*addWords'
		},
		wordSelected : {
            height : '366',
            width : '465'
        },
		notFound : {
			height : '185',
			width : '515',
			skin : 'notFoundTable',
			fields : '*notFoundFields',
			datasource : '*notFoundData'
		},
		listData : {
			height : '200',
			width : '865',
			dragable : 'true',
			skin : 'listDataTable',
			fields : '*listDataFields',
			datasource : '*listDataData'
		}
	},
	
	//初始化ui
	CONTEXT_INITER_MAP : {
		wordList : function(callback){
			var me = this;
			me.setContext("wordChosen",[]);
			callback();
		},
		
		wordselect : function(callback){
			var me = this;
			me.setContext("addWords",[]);
			callback();
		},
		notFound : function(callback){
			var me = this;
			me.setContext("notFoundFields",[]);
			me.setContext("notFoundData",[]);
			callback();
		},
		listData : function(callback){
			var me = this;
			me.setContext("listDataFields",[]);
			me.setContext("listDataData",[]);
			callback();
		},
		wordChosen: function(callback){
			var me = this;
			fbs.avatar.getMoniWordCount({
				onSuccess: function(data){
					var dat = data.data,
						currentCount = dat.currentCount,
						maxCount = dat.maxCount;
					me.setContext("currentCount",currentCount);
					me.setContext("maxCount",maxCount);
					callback();
				},
				onFail: function(data){
					ajaxFailDialog();
					callback();
				}
			});
		}
	},
	
	onafterrender : function(){
		var me = this,
			controlMap = me._controlMap;
		baidu.g("userName").innerHTML = nirvana.env.USER_NAME;
		//判断推广概况页中的监控列表是否已达上限，若否则显示复选框
		fbs.avatar.getMoniFolderCount({
			folderType: 1,
			onSuccess:me.showInIndex(),
			onFail:function(data){
				
			}
		});
		//初始化已选择的词数量
		baidu.g("kwNum").innerHTML = "0";
		me.setContext("kwNumInFolder",0);
		//定义物料选择的各种事件
		controlMap.wordList.ondelete = me.wordDeleteHandler();
		controlMap.wordSelect.onAddLeft = me.checkKwUpper();
		//当页添加
		controlMap.wordSelect.onAddAllLeft = avatar.addAllLeft(me);
		//清空变量
		avatar.addWords=[];
	},
	
	onentercomplete: function(){
		var me = this,
			controlMap = me._controlMap;
		
		//输入文件夹名称
		var inp = ui.util.get("newFolderName").main;
		inp.onkeyup = inp.onkeydown = me.checkFolderName;
		me.checkFolderName();
		//保存
		controlMap.setDialogOk.onclick = me.createFolder();
		controlMap.setDialogCancel.onclick = function(){
			me.onclose();
		}
		//选择方式
		baidu.on('addMethod', 'click', function(e){
			var e = e || window.event,
			    target = e.target || e.srcElement,
				tagName = target.tagName.toLowerCase();
			if(tagName == 'input' && target.type == 'radio'){
				avatar.showArea(me,target.value);
			}
		});
		
		//检查输入
		controlMap.wordSelected.onchange = avatar.checkInput(me);
		//下一步
		controlMap.nextStep.disable(true);
		controlMap.nextStep.onclick = avatar.nextStep(me);
		//跳过并完成新建
		controlMap.finish.onclick = me.createFolder();
		//取消
		controlMap.dialogCancel.onclick = function(){
			me.onclose();
		}
		//小铅笔,删除
		controlMap.notFound.main.onclick = avatar.getTableInlineHandler(me);
		//重新搜索
		controlMap.searchAgain.onclick = avatar.nextStep(me);
		//删除
		controlMap.listData.main.onclick = avatar.getTableInlineHandler(me);
		
		//完成
		controlMap.done.onclick = me.finishCreate();
		//取消
		controlMap.cancel.onclick = function(){
			me.onclose();
		}
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 提交确定按钮
	 */
	createFolder: function(){
		var me = this,
			controlMap = me._controlMap;
			
		return function(){
			var name = baidu.trim(controlMap.newFolderName.getValue()),
				isIndexShow = controlMap.showInIndex.getChecked(),
				addwords = me.getWordsList();
	
			fbs.avatar.addMoniFolder({
				folderName: name,
				isIndexShow: isIndexShow,
				winfoids: addwords,
				onSuccess: function(data){
					var logParams = {
						target: "createFolder",
						words: addwords.length
					};
					NIRVANA_LOG.send(logParams);
					fbs.avatar.getMoniFolders.clearCache();
					fbs.avatar.getMoniFolderCount.clearCache();
					fbs.avatar.getMoniWordCount.clearCache();
					fbs.avatar.getWinfoid2Folders.clearCache();
					if (me.arg.type !== 'prop') { // me.arg.type默认为sub，所以这里要具体判断，在账户优化工具中打开时，不需要reload
						er.controller.fireMain('reload', {});
					}
					ui.util.get('SideNav').refreshFolderList();
					me.onclose();
				},
				onFail: me.failHandler()
			});
		}
	},
	
	/**
	 * 添加不成功处理
	 */
	failHandler:function(){
		var me = this;
		return function(data){
			if (data.status != 500) {
				var error = fbs.util.fetchOneError(data), 
					errorArea = baidu.g("error_area"), 
					errorcode;
				errorArea.innerHTML = "";
				baidu.removeClass(baidu.g("error_area"),'error_area');
				if (error) {
					for (var item in error) {
						errorcode = error[item].code;
						me.displayError(errorcode);
					}
				}else{
					error = data.errorCode; //阿凡达返回error结构与其他接口不一致
					if (error.code) {
						me.displayError(error.code);
					}
					else {
						for (var item in error) {
							errorcode = error[item];
							me.displayError(errorcode);
						}
					}
				}
			}else{
				ajaxFail(0);
			}
		}
	},
	
	/**
	 * 显示错误信息
	 * @param {Object} errorcode
	 */
	displayError: function(errorcode){
		var me = this, errorArea = baidu.g("error_area");
		switch (errorcode) {
			case 2852:
			case 2853:
			case 2811:
			case 2820:
			case 2821:
			case 2841:
				errorArea.innerHTML = nirvana.config.ERROR.AVATAR[errorcode];
				baidu.addClass(errorArea,'error_area');
				break;
		}
	},
	
	
	/**
	 * 获取已选择关键词的id
	 */
	getWordsList: function(){
		var me = this,
			controlMap = me._controlMap;
		var ids = [],
			addwords = controlMap.wordSelect.addWords;
		for (var i = 0, l = addwords.length; i < l; i++) {
			ids[ids.length] = addwords[i].id;
		}
		return ids;
	},
	
	/**
	 * 判断关键词是否已达上限
	 */
	checkKwUpper: function(){
		var me = this;
		return function(word){
			var currentCount = me.getContext("currentCount"),
			 	maxCount = me.getContext("maxCount"), 
				addword = me.getContext("kwNumInFolder");
				
			if (currentCount + addword >= maxCount) {
				ui.Dialog.alert({
					title: '数量超限',
					maskType: 'white',
					content: nirvana.config.LANG.KW_OVERSTEP
				});
				return false;
			}
			else {
				avatar.getPlanAndUnit(me,[word],false);
				addword += 1;
				if (currentCount + addword >= maxCount) {
					baidu.g("error_area").innerHTML = nirvana.config.LANG.KW_OVERSTEP;
					baidu.addClass(baidu.g("error_area"),'error_area');
				}else{
					baidu.g("error_area").innerHTML = "";
					baidu.removeClass(baidu.g("error_area"),'error_area');
				}
				return true;
			}
		}
	},
	
	
	/**
	 * 更新已选择的词数量
	 * @param {Object} stat 增加（true) or 减少（false）
	 */
	setKwnum:function(stat){
		var me = this;
		var kwnum = me.getContext("kwNumInFolder");
		if(stat){
			kwnum += 1;
		}else{
			kwnum -= 1;
		}
		me.setContext("kwNumInFolder",kwnum);
		baidu.g("kwNum").innerHTML = kwnum;
	},
	
	/**
	 * 从右侧添词到左侧list框
	 */
	wordAddHandler: function(content){
		var me = this,
			controlMap = me._controlMap,
			addword = [];
		for (var i = 0; i < content.length; i++) {
			addword[i] = {
				classname: "monitor_word_chosen",
				html: content[i].html,
				key: "id",
				value: content[i].id,
				tip: {
					content: "取消",
					tipClass: "kwb_cancel",
					isDel: true
				},
				autoState: true
			};
			me.setKwnum(true);
		}
		controlMap.wordList.addList(addword);
		var main = controlMap.wordList.main;
		main.scrollTop = main.scrollHeight;
	},
	
	/**
	 * 从左侧删除添词
	 */
	wordDeleteHandler: function(){
		var me = this,
			controlMap = me._controlMap;
		return function(target){
			var id = target.getAttribute("id"),
				currentCount = me.getContext("currentCount"), 
				maxCount = me.getContext("maxCount"), 
				addword = me.getContext("kwNumInFolder");;
				
			controlMap.wordSelect.recover(id);
			me.setKwnum(false);
			
			if (currentCount + addword -1 < maxCount){
				baidu.g("error_area").innerHTML = "";
				baidu.removeClass(baidu.g("error_area"),'error_area');
			}
		}
	},
	
	
	/**
	 * 显示“显示在推广概况页监控列表”复选框
	 */
	showInIndex: function(){
		var me = this;
		return function(data){
			var currentCount = data.data.currentCount,
				maxCount = data.data.maxCount;
			if(currentCount < maxCount){
				baidu.g("showInIndex").style.display = "inline";
			}
		};
	},
	
	/**
	 * 检查名称
	 */
	checkFolderName : function () {
		var inp = ui.util.get("newFolderName").main,
		    nameLen = getLengthCase(baidu.trim(inp.value));
	
		if (nameLen > FOLDER_NAME_MAXLENGTH) {
			inp.maxLength = inp.value.length;
			inp.value = subStrCase(inp.value, FOLDER_NAME_MAXLENGTH);
			nameLen = getLengthCase(baidu.trim(inp.value));
		} else {
	        inp.maxLength = inp.value.length + (FOLDER_NAME_MAXLENGTH - nameLen);
		}
		baidu.g("foldNumTip").innerHTML = "还能输入" + (FOLDER_NAME_MAXLENGTH - nameLen ) + '个字符';
	},
	/**
	 * 完成创建
	 */
	finishCreate : function(){
		var me=this,
			controlMap = me._controlMap;
			
		return function(){
			var name = baidu.trim(controlMap.newFolderName.getValue()),
				isIndexShow = controlMap.showInIndex.getChecked(),
				listDataData = me.getContext('listDataData'),
				addwords = [];
			for(var i=0,len=listDataData.length;i<len;i++){
				addwords.push(listDataData[i].winfoid);
			}
			fbs.avatar.addMoniFolder({
				folderName: name,
				isIndexShow: isIndexShow,
				winfoids: addwords,
				onSuccess: function(data){
					var logParams = {
						target: "AvatarBatchAdd_btn",
						winfoids: addwords,
						tgtfoldername: name
					};
					NIRVANA_LOG.send(logParams);
					me.setContext("listDataData",[]);
					me.setContext("notFoundData",[]);
					fbs.avatar.getMoniFolders.clearCache();
					fbs.avatar.getMoniFolderCount.clearCache();
					fbs.avatar.getMoniWordCount.clearCache();
					fbs.avatar.getWinfoid2Folders.clearCache();
					if (me.arg.type !== 'prop') { // me.arg.type默认为sub，所以这里要具体判断，在账户优化工具中打开时，不需要reload
						er.controller.fireMain('reload', {});
					}
					ui.util.get('SideNav').refreshFolderList();
					me.onclose();
				},
				onFail: me.failHandler()
			});
		}
	}
}); 
