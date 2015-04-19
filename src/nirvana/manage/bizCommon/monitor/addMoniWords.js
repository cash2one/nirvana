/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    monitor/addMoniWords.js
 * desc:    新增监控关键词
 * author:  zhouyu
 * date:    $Date: 2011/02/12 $
 */


/**
 * @namespace 新增监控关键词
 */
manage.addMoniWords = new er.Action({
	
	VIEW: 'addMoniWords',
	
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
			//获取已监控的关键词
			var addwords = me.arg.addwords;
			avatar.getPlanAndUnit(me,addwords,true,callback);
		},
		
		wordselect : function(callback){
			var me = this;
			me.setContext("addWords",me.arg.addwords);
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
	
	wordInitFill: function(content, callback){
		var me = this, cont = [],
			len = content.length;
		me.setContext("monidKwNum",len);
		for (var i = 0; i < len; i++) {
			cont[cont.length] = {
				classname: "word_init_chosen",
				html: content[i].html,
				key: "id",
				value: content[i].id,
				tip: {
					content: "已监控",
					tipClass: "kwb_added",
					isDel: false
				},
				autoState: false
			};
		}
		
		me.setContext("wordChosen", cont);
		callback();
	},
	
	onafterrender : function(){
		var me = this,
			controlMap = me._controlMap;
		
		baidu.g("currentFolder").innerHTML = baidu.encodeHTML(me.arg.foldername);	
		baidu.g("monidKwNum").innerHTML = me.getContext("monidKwNum");
		baidu.g("userName").innerHTML = nirvana.env.USER_NAME;
		//判断该监控文件夹是否已显示在推广概况页，若是则显示复选框
		fbs.avatar.getMoniFolders({
			folderid: [me.arg.folderid],
			fields:["fstat"],
			onSuccess:me.showInIndex(),
			onFail:function(data){
				
			}
		});
		//初始化已选择的词数量
		baidu.g("kwNum").innerHTML = "0";
		me.setContext("keywordChosen",0);
		//定义物料选择的各种事件
		controlMap.wordList.ondelete = me.wordDeleteHandler();
		controlMap.wordSelect.onAddLeft = me.checkKwUpper();
		//当页添加
		controlMap.wordSelect.onAddAllLeft = avatar.addAllLeft(me);
	},
	
	onentercomplete: function(){
		var me = this,
			controlMap = me._controlMap;
		//保存
		controlMap.setDialogOk.onclick = me.addMoniWord();
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
		controlMap.done.onclick = me.finishAdd();
		//取消
		controlMap.cancel.onclick = function(){
			me.onclose();
		}
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
		avatar.addWords = [];
		for(var i =0,len=me.arg.addwords.length;i<len;i++)
			avatar.addWords.push(me.arg.addwords[i]);
	},
	
	addMoniWord: function(){
		var me = this,
			controlMap = me._controlMap;
			
		return function(){
			var addwords = me.getWordsList();
			fbs.avatar.addMoniWords({
				folderid: me.arg.folderid,
				winfoids: addwords,
				onSuccess: function(data){
					fbs.avatar.getMoniFolders.clearCache();
					fbs.avatar.getMoniWords.clearCache();
					fbs.avatar.getMoniWordCount.clearCache();
					fbs.avatar.getWinfoid2Folders.clearCache();
					if (me.arg.type !== 'prop') { // me.arg.type默认为sub，所以这里要具体判断，在账户优化工具中打开时，不需要reload
						er.controller.fireMain('reload', {});
					}
					//ui.util.get('SideNav').refreshFolderList();
					ui.util.get('SideNav').refreshNodeInfo('folder',[me.arg.folderid]);
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
				addword = me.getContext("keywordChosen");
			if (currentCount + addword >= maxCount) {
				ui.Dialog.alert({
					title: '数量超限',
					maskType: 'white',
					content: nirvana.config.LANG.KW_OVERSTEP
				});
				return false;
			}
			else {
				avatar.getPlanAndUnit(me,[word]);
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
		var kwnum = me.getContext("keywordChosen");
		if(stat){
			kwnum += 1;
		}else{
			kwnum -= 1;
		}
		me.setContext("keywordChosen",kwnum);
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
				addword = me.getContext("keywordChosen");
				
			controlMap.wordSelect.recover(id);
			me.setKwnum(false);
			
			if (currentCount + addword -1< maxCount){
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
			var dat = data.data.listData[0];
			if(dat.fstat == 1){
				me._controlMap.showInIndex.setChecked(true);
				me._controlMap.showInIndex.disable(true);
				baidu.g("showInIndex").style.display = "inline-block";
			}
		};
	},
	
	/**
	 * 完成批量添加
	 */
	
	finishAdd: function(){
		var me = this,
			controlMap = me._controlMap;
			
		return function(){
			var addwords = [],
				listDataData = me.getContext('listDataData');
			for(var i=0,len=listDataData.length;i<len;i++){
				addwords.push(listDataData[i].winfoid);
			}
			if (listDataData.length == 0) {
				me.onclose();
			}
			fbs.avatar.addMoniWords({
				folderid: me.arg.folderid,
				winfoids: addwords,
				onSuccess: function(data){
					var logParams = {
						target: "AvatarBatchAdd_btn",
						winfoids: addwords,
						tgtfolderid: me.arg.folderid
					};
					NIRVANA_LOG.send(logParams);
					me.setContext("listDataData",[]);
					me.setContext("notFoundData",[]);
					fbs.avatar.getMoniFolders.clearCache();
					fbs.avatar.getMoniWords.clearCache();
					fbs.avatar.getMoniWordCount.clearCache();
					fbs.avatar.getWinfoid2Folders.clearCache();
					if (me.arg.type !== 'prop') { // me.arg.type默认为sub，所以这里要具体判断，在账户优化工具中打开时，不需要reload
						er.controller.fireMain('reload', {});
					}
					//ui.util.get('SideNav').refreshFolderList();
					ui.util.get('SideNav').refreshNodeInfo('folder',[me.arg.folderid]);
					me.onclose();
				},
				onFail: me.failHandler()
			});
		}
	}
}); 
