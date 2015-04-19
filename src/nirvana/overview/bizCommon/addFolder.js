/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    overview/addFolder.js
 * desc:    新建监控文件夹
 * author:  zhouyu
 * date:    $Date: 2011/02/12 $
 */


/**
 * @namespace 新建监控文件夹
 */
overview.addFolder = new er.Action({
	
	VIEW: 'addFolderInOverView',
	
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
		baidu.g("showInIndex").style.display = "inline";
		//初始化已选择的词数量
		baidu.g("kwNum").innerHTML = "0";
		me.setContext("kwNumInFolder",0);
		if(me.arg.folderCount > 0){
			controlMap.addIndexFolder.onclick = function(){
				nirvana.util.openSubActionDialog({
						id: 'addIndexFolderDialog',
						title: '新添首页显示',
						width: 928,
						actionPath: '/overview/addIndexFolder',
						params: {
							folderList: me.arg.folderList,
							folderCount: me.arg.folderCount
						},
						onclose: function(){
						
						}
					});
			}
		}else{
			controlMap.addIndexFolder.disable(true);
		}
		//定义物料选择的各种事件
		controlMap.wordList.ondelete = me.wordDeleteHandler();
		controlMap.wordSelect.onAddLeft = me.checkKwUpper();
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
		//当页添加
		controlMap.wordSelect.onAddAllLeft = avatar.addAllLeft(me);
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
					fbs.avatar.getMoniFolders.clearCache();
					fbs.avatar.getWinfoid2Folders.clearCache();
					fbs.avatar.getMoniWordCount.clearCache();
					er.controller.fireMain('reload', {});
					if(ui.util.get('SideNav')){
						ui.util.get('SideNav').refreshFolderList();
					}
					
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
			case 2821:
			case 2821:
			case 2841:
				errorArea.innerHTML = nirvana.config.ERROR.AVATAR[errorcode];
				baidu.addClass(baidu.g("error_area"),'error_area');
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
	}
}); 
