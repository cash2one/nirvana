/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    monitor/addIndexFolder.js
 * desc:    新增首页监控
 * author:  zhouyu
 * date:    $Date: 2011/02/12 $
 */


/**
 * @namespace 新增首页监控
 */
overview.addIndexFolder = new er.Action({
	
	VIEW: 'addIndexFolder',
	
	UI_PROP_MAP : {
		wordList : {
			type:'List',
			skin:'wordlist',
			content:'*wordChosen'
		},
		
		wordSelect:{
			type:'AvatarMaterial',
			form:'avatar',
			width:'488',
			height:'366',
			addWords:'*addFolders'
		}
	},
	
	//初始化ui
	CONTEXT_INITER_MAP : {
		wordList : function(callback){
			var me = this;
			//获取已有监控文件夹
			var folderList = me.arg.folderList;
			me.wordInitFill(folderList,callback);
		},
		
		wordselect : function(callback){
			var me = this;
			me.setContext("addFolders",me.getAddFolders());
			callback();
		},
		
		wordChosen: function(callback){
			var me = this;
			fbs.avatar.getMoniFolderCount({
				folderType:1,
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
	
	getAddFolders: function(){
		var me = this, folderList = me.arg.folderList, len = folderList.length, addFolders = [];
		for (var i = 0; i < len; i++) {
			addFolders[addFolders.length] = {
				id: folderList[i].folderid,
				name: folderList[i].foldername
			};
		}
		return addFolders;
	},
	
	/**
	 * 根据folderid获取监控关键词数量
	 * @param {Object} id
	 */
	getFoldKwCount:function(id){
		var me = this, folderList = me._controlMap.wordSelect.folderList, len = folderList.length;
		for (var i = 0; i < len; i++) {
			if(folderList[i].id == id){
				return folderList[i].moniwordcount;
			}
		}
		return false;
	},
	
	wordInitFill: function(content, callback){
		var me = this, cont = [],
			len = content.length;
		me.setContext("indexFolderCount",len);
		for (var i = 0; i < len; i++) {
			cont[cont.length] = {
				classname: "word_init_chosen",
				html: me.getListHtml(content[i].foldername,content[i].moniwordcount),
				key: "id",
				value: content[i].folderid,
				tip: {
					content: "已添加",
					tipClass: "kwb_added",
					isDel: false
				},
				autoState: false
			};
		}
		
		me.setContext("wordChosen", cont);
		callback();
	},
	
	getListHtml:function(name,count){
		var html = [];
		var title = baidu.encodeHTML(name),
			content = getCutString(name,30,"..");
		html[html.length] = '<div class="kwb_name" title="' + title + '">' + content + '</div>';
		html[html.length] = '<div class="kwb_info"><span class="gray">监控文件夹包含<span class="bold">' + count + '</span>个关键词</span></div>';
		return html.join("");	
	},
	
	onafterrender : function(){
		var me = this,
			controlMap = me._controlMap;
		
		baidu.g("userName").innerHTML = nirvana.env.USER_NAME;
		//初始化已选择的词数量
		baidu.g("indexFolderCount").innerHTML = "0";
		me.setContext("keywordChosen",0);
		if(me.arg.folderList.length < me.getContext("maxCount")){
			controlMap.addNewFolder.onclick = function(){
				nirvana.util.openSubActionDialog({
						id: 'addIndexFolderDialog',
						title: '新添首页显示',
						width: 928,
						actionPath: '/overview/addFolder',
						params: {
							folderList: me.arg.folderList,
							folderCount: me.arg.folderCount
						},
						onclose: function(){
						
						}
					});
			}
		}else{
			controlMap.addNewFolder.disable(true);
		}
		//定义物料选择的各种事件
		controlMap.wordList.ondelete = me.wordDeleteHandler();
		controlMap.wordSelect.onAddLeft = me.checkFoldUpper();
	},
	
	onentercomplete: function(){
		var me = this,
			controlMap = me._controlMap;
		//保存
		controlMap.setDialogOk.onclick = me.addIndexFolder();
		controlMap.setDialogCancel.onclick = function(){
			me.onclose();
		}
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	addIndexFolder: function(){
		var me = this,
			controlMap = me._controlMap;
			
		return function(){
			var addFolders = me.getWordsList();
			fbs.avatar.modFstat({
				fstat: 1,
				folderids: addFolders,
				onSuccess: function(data){
					fbs.avatar.getMoniFolders.clearCache();
					fbs.avatar.getMoniFolderCount.clearCache();
					er.controller.fireMain('reload', {});
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
			case 2820:
				errorArea.innerHTML = nirvana.config.ERROR.AVATAR[errorcode];
				break;
		}
	},
	
	/**
	 * 获取已选择文件夹的id
	 */
	getWordsList: function(){
		var me = this,
			controlMap = me._controlMap;
		var ids = [],
			addFolders = controlMap.wordSelect.addWords;
		for (var i = 0, l = addFolders.length; i < l; i++) {
			ids[ids.length] = +addFolders[i].id;
		}
		return ids;
	},
	
	/**
	 * 判断关键词是否已达上限
	 */
	checkFoldUpper: function(){
		var me = this;
		return function(word){
			var currentCount = me.getContext("currentCount"), maxCount = me.getContext("maxCount"), addword = me.getContext("keywordChosen");
			if (currentCount + addword >= maxCount) {
				ui.Dialog.alert({
					title: '数量超限',
					maskType: 'white',
					content: nirvana.config.LANG.FOLD_OVERSTEP
				});
				return false;
			}
			else {
				me.wordAddHandler(word);
				addword = me.getContext("keywordChosen");
				if (currentCount + addword >= maxCount) {
					baidu.g("error_area").innerHTML = nirvana.config.LANG.FOLD_OVERSTEP;
				}
				return true;
			}
		}
	},
	
	
	/**
	 * 更新已选择的文件夹数量
	 * @param {Object} stat 增加（true) or 减少（false）
	 */
	setFoldnum:function(stat){
		var me = this;
		var Foldnum = me.getContext("keywordChosen");
		if(stat){
			Foldnum += 1;
		}else{
			Foldnum -= 1;
		}
		me.setContext("keywordChosen",Foldnum);
		baidu.g("indexFolderCount").innerHTML = Foldnum;
	},
	
	/**
	 * 从右侧添词到左侧list框
	 */
	wordAddHandler: function(content){
		var me = this,
			controlMap = me._controlMap;
		
		var addword ={
			classname:"monitor_word_chosen",
			html: me.getListHtml(content.name,me.getFoldKwCount(content.id)),
			key:"id",
			value: content.id,
			tip: {
				content: "取消",
				tipClass: "kwb_cancel",
				isDel: true
			},
			autoState: true
		};
		
		controlMap.wordList.add(addword);
		var main = controlMap.wordList.main;
		main.scrollTop = main.scrollHeight; 
		me.setFoldnum(true);
	},
	
	/**
	 * 从左侧删除添词
	 */
	wordDeleteHandler: function(){
		var me = this,
			controlMap = me._controlMap;
		return function(target){
			var id = target.getAttribute("id");
			controlMap.wordSelect.recover(id);
			me.setFoldnum(false);
		}
	}
}); 
