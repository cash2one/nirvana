/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    monitor/moniKeyword.js
 * desc:    监控关键词
 * author:  zhouyu
 * date:    $Date: 2011/02/12 $
 */


/**
 * @namespace 监控关键词
 */
manage.moniKeyword = new er.Action({
	
	VIEW: 'moniKeyword',
	
	UI_PROP_MAP : {
		wordList : {
			type:'List',
			skin:'kwlist',
			content:'*wordChosen'
		},
		
		folderlist: {
			type:'Select',
			datasource:'*folderList',
			value:'0',
			width:'300'
		}
	},
	
	//初始化ui
	CONTEXT_INITER_MAP : {
		wordList : function(callback){
			var me = this;
			var words = me.arg.wordChosen,
				len = words.length,
				logParams = {
					target: "moniKeyword",
					words: words.length
				};
			NIRVANA_LOG.send(logParams);
			me.setContext("chosenKwNum",len);
			me.setContext("wordData",words);
			me.fillList(0,words,callback);
		},
		
		folderList: function(callback){
			var me = this;
			fbs.avatar.getMoniFolders({
				fields:["folderid","foldername","fstat","moniwordcount","clks","shows","paysum"],	
				onSuccess: function(data){
						var result = data.data.listData || [],
							list = [];
						list[list.length] = {
							text:'请选择监控文件夹',
							value:0
						}
						for (var i = 0, l = result.length; i < l; i++) {
							list[list.length] = {
								text:baidu.encodeHTML(result[i].foldername),
								value:result[i].folderid
							}
						}
						me.setContext("folderList",list);
						me.setContext("folderNum",list.length);
						callback();
				},
	            onFail: function(data){
	                    ajaxFailDialog();
	                    callback();
	            }
			});
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
		baidu.g("monidKwNum").innerHTML = me.getContext("chosenKwNum");	
		controlMap.folderlist.onselect = me.folderChangeHandler();
		//取消监控关键词
		me._controlMap.wordList.ondelete = me.deleteKwHandler();
	},
	
	onentercomplete: function(){
		var me = this,
			controlMap = me._controlMap;
		
		fbs.avatar.getMoniFolderCount({
			folderType: 0,
			onSuccess: me.checkFoldNumHandler(),
			onFail: function(data){
				ajaxFailDialog();
			}
		});
		//保存
		controlMap.setDialogOk.onclick = me.addMoniWord();
		controlMap.setDialogCancel.onclick = function(){
			me.onclose();
		};
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 取消监控关键词
	 */
	deleteKwHandler:function(){
		var me = this;
		return function(target){
			var wordData = me.getContext("wordData"),
				len = me.getContext("chosenKwNum"),
				trans = me.arg.trans || false,
				controlMap = me._controlMap;
			var id = target.id;
			baidu.array.remove(wordData,function(item){
				if (item.winfoid == id) {
					return true;
				}
			});
			len -= 1;
			me.setContext("wordData",wordData);
			me.setContext("chosenKwNum",len);
			baidu.g("monidKwNum").innerHTML = len;	//me._controlMap.setDialogOk.disable(true);
			if (trans) {		
				var addWords = baidu.q('monitor_word_chosen');
				if(addWords.length == 1){
					controlMap.setDialogOk.disable(true);
				}
			}
		}
	},
	
	/**
	 * 改变监控文件夹事件处理
	 */
	folderChangeHandler:function(){
		var me = this;
		return function(value,selected){
			me.hideCreateContainer();
			me.hideError();
			me.fillList(+value, me.getContext("wordData"), null);
		}
	},
	
	
	/**
	 * 检查监控文件夹数量是否已达上限
	 */
	checkFoldNumHandler: function(){
		var me = this;
		return function(data){
			var currentCount = data.data.currentCount,
				maxCount = data.data.maxCount;
			if (currentCount < maxCount) {
				baidu.g("createNewFolder").style.display = "inline-block";
				baidu.on(baidu.g("createNewFolder"),"click", function(e){
					me.showCreateContainer();
					//更新表格
					me.hideError();
					me.fillList(0, me.getContext("wordData"), null);
				});
				//输入文件夹名称
				var inp = ui.util.get("newFolderName").main;
				inp.onkeyup = inp.onkeydown = function(){
					me.hideError();
				 	me.checkFolderName();	
				};
				me.checkFolderName();
				
				baidu.on(baidu.g("createFolderCloseBtn"),"click", me.hideCreateContainer);
			}
		}
	},
	
	/**
	 * 显示创建文件夹的容器
	 */
	showCreateContainer: function(){
		ui.util.get("folderlist").setValue(0);
		ui.util.get("newFolderName").setValue("");
		baidu.g("createFolderContainer").style.display = "block";
	},
	
	/**
	 * 隐藏创建文件夹的容器
	 */
	hideCreateContainer: function(){
		baidu.g("createFolderContainer").style.display = "none";
	},
	
	/**
	 * 重新排序列表，已监控的放在前面，未监控的放在后面
	 * @param {Object} moniwords 已监控的关键词
	 * @param {Object} newwords	未监控的关键词
	 * @param {Object} callback	回调函数
	 */
	reorderWords: function(moniwords, newwords, callback){
		var me = this,
			cont = [],
			controlMap = me._controlMap,
			trans = me.arg.trans || false;
		for (var i = 0, l = moniwords.length; i < l; i++) {
			cont[cont.length] = {
				classname: "word_init_chosen",
				html: me.getContentHtml(moniwords[i]),
				key: "id",
				value: moniwords[i].winfoid,
				tip: {
					content: "已监控",
					tipClass: "kwb_added",
					isDel: false
				},
				autoState: false
			};
		}
		for (var i = 0, l = newwords.length; i < l; i++) {
			cont[cont.length] = {
				classname: "monitor_word_chosen",
				html: me.getContentHtml(newwords[i]),
				key: "id",
				value: newwords[i].winfoid,
				tip: {
					content: "取消",
					tipClass: "kwb_cancel",
					isDel: true
				},
				autoState: true
			};
		}
		if (callback) {
			me.setContext("wordChosen", cont);
			callback();
		}
		else {
			var wordList = me._controlMap.wordList,
				main = wordList.main;
			wordList.content = cont;
			main.innerHTML = "";
			wordList.render(main);
			if(trans){
			if(newwords.length == 0 ){
				controlMap.setDialogOk.disable(true);
			}else{
				controlMap.setDialogOk.disable(false);	
			}
		}
		}
		
	},
	
	/**
	 * 构建关键词信息html
	 * @param {Object} content
	 */
	getContentHtml: function(item){
		var title = baidu.encodeHTML(item.showword),
			content = getCutString(item.showword),
			wmatch = item.wmatch,
			wctrl = item.wctrl,
			wctrl_auth = nirvana.env.AUTH['gaoduan'];
			
		if (wctrl_auth) {
			title = nirvana.util.buildShowword(title, wmatch, wctrl);
			content = nirvana.util.buildShowword(content, wmatch, wctrl);
		}
		return "<span class='kwb_info' title='" + title + "'>" + content + "</span>";
	},
	
	/**
	 * 填充list
	 * @param {Object} folderid 文件夹id
	 * @param {Object} wordlist 用于填充的wordlist[{winfoid,showword}]
	 * @param {Object} callback
	 */
	fillList: function(folderid, wordlist, callback){
		var me = this;
		var len = wordlist.length, cont = [], moniwords = [], newwords = [],ids = [];
		
		if (folderid == 0) {
			newwords = wordlist;
			me.reorderWords(moniwords, newwords, callback);
		}
		else {
			for(var i = 0; i < len; i++){
				ids[ids.length] = wordlist[i].winfoid;
			}
			fbs.avatar.getMoniWords({
				folderid:[folderid],
				winfoid:ids,
				fields:["winfoid","showword","wmatch","wctrl"],
				onSuccess:me.getMoniWordsHandler(wordlist),
				onFail:function(data){
					ajaxFailDialog();
				}
			})
		}
	},
	
	/**
	 * 区分已监控与为监控关键词
	 * @param {Object} wordlist
	 */
	getMoniWordsHandler:function(wordlist){
		var me = this;
		return function(data){
			var moniwords = data.data.listData || [],
				newwords = baidu.object.clone(wordlist);
			for(var i = 0, len = moniwords.length; i < len; i++){
				baidu.array.remove(newwords,function(item){
					if(item.winfoid == moniwords[i].winfoid){
						return true;
					}
				});
			}
			me.reorderWords(moniwords, newwords, null);
		}
	},
	
	
	
	addMoniWord: function(){
		var me = this,
			controlMap = me._controlMap;
			
		return function(){	
			var addwords = me.getWordsList(),
				trans = me.arg.trans || false,
				folderid = controlMap.folderlist.getValue();
			//转移监控
			if (trans) {
				var foldername = controlMap.newFolderName.getValue()||null,
					newWords = baidu.q('monitor_word_chosen');
					
				addwords = [];
				for(var i=0,len = newWords.length;i<len;i++)
					addwords[addwords.length] = baidu.getAttr(newWords[i],'id');
				if (folderid == 0) {
					folderid = null;
					if (foldername == null) {
						me.displayError(2852);
						return;
					}
				}
				
				fbs.avatar.transMoniWords({
					srcfolderid:me.arg.srcfolderid,
					tgtfolderid: folderid,
					tgtfoldername:foldername,
					winfoids: addwords,
					onSuccess: function(){
						//添加监控
						var logParams = {
							target: "AvatarTransWord_btn",
							winfoids: addwords,
							tgtfoldername: foldername,
							srcfolderid:me.arg.srcfolderid,
							tgtfolderid:folderid
						};
						NIRVANA_LOG.send(logParams);
						me.onclose();
						fbs.avatar.getWinfoid2Folders.clearCache();
						er.controller.fireMain('reload', {});
						fbs.avatar.getMoniWords.clearCache();
						fbs.avatar.getMoniFolders.clearCache();
						fbs.avatar.getMoniFolderCount.clearCache();
						//ui.util.get('SideNav').refreshFolderList();
						if (folderid){
						    ui.util.get('SideNav').refreshNodeInfo('folder',[me.arg.srcfolderid,folderid]);
						}else{
						    ui.util.get('SideNav').refreshFolderList();
						}
						
						me.arg.onsuccess();
						
					},
					onFail: me.failHandler()
				})
			}
			else {
				if (folderid != 0) {//在已有监控文件夹中选择
					if(addwords.length==0){
						me.onclose();
						return;
					}
						
					fbs.avatar.addMoniWords({
						folderid: folderid,
						winfoids: addwords,
						onSuccess: me.successHandler(folderid),
						onFail: me.failHandler()
					});
				}
				else {//新建监控文件夹
					var foldername = controlMap.newFolderName.getValue();
					fbs.avatar.addMoniFolder({
						folderName: foldername,
						isIndexShow: false,
						winfoids: addwords,
						onSuccess: me.successHandler(),
						onFail: me.failHandler()
					});
				}
			}
		}
	},
	
	successHandler: function(targetFolderid){
		var me = this;
		var folderid = targetFolderid;//非新建监控文件夹则有folderid
		return function(data){
			fbs.avatar.getWinfoid2Folders.clearCache();
			//如果入口是效果分析工具，add by yanlingling
            
            if ('undefined' != typeof me.arg.fromProcedure && me.arg.fromProcedure == 'effectAnalyse') {
                var tableTool = nirvana.effectAnalyse.keywordList, action = me.arg.action;
                var table = ui.util.get("analyseTableList");//刷新一下表格，去掉复选框
                table.render(table.main);
                tableTool.showFolders(action);// 刷新表格监控文件夹图标
                //监控
                var logparam = {};
                logparam.batchOpType = 'avatar';
                nirvana.effectAnalyse.lib.logCenter("", logparam);
            }
			else{
				er.controller.fireMain('reload', {});
				}
			
			fbs.avatar.getMoniWords.clearCache();
			fbs.avatar.getMoniFolders.clearCache();
			fbs.avatar.getMoniFolderCount.clearCache();
			//ui.util.get('SideNav').refreshFolderList();
			if (folderid){
                ui.util.get('SideNav').refreshNodeInfo('folder',[folderid]);
            }else{
                ui.util.get('SideNav').refreshFolderList();
            }
			me.onclose();
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
			case 2852:
				errorArea.innerHTML = "请选择监控文件夹";
				break;
			case 2853:
			case 2811:
			case 2821:
			case 2841:
				errorArea.innerHTML = nirvana.config.ERROR.AVATAR[errorcode];
				break;
		}
	},
	
	/**
	 * 获取已选择关键词的id
	 */
	getWordsList: function(){
		var me = this;
		var ids = [],
			words = me.getContext("wordData");
		for (var i = 0, l = words.length; i < l; i++) {
			ids[ids.length] = words[i].winfoid;
		}
		return ids;
	},
	
	/**
	 * 判断关键词是否已达上限
	 */
	checkKwUpper: function(){
		var me = this;
		return function(word){
			var currentCount = me.getContext("currentCount"), maxCount = me.getContext("maxCount"), addword = me.getContext("keywordChosen");
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
				addword = me.getContext("keywordChosen");
				if (currentCount + addword >= maxCount) {
					baidu.g("error_area").innerHTML = nirvana.config.LANG.KW_OVERSTEP;
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
			controlMap = me._controlMap;
		
		var addword ={
			classname:"monitor_word_chosen",
			html: content[0].html,
			key:"id",
			value: content[0].id,
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
		me.setKwnum(true);
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
			me.setKwnum(false);
		}
	},
	
	
	/**
	 * 显示“显示在推广概况页监控列表”复选框
	 */
	showInIndex: function(){
		var me = this;
		return function(data){
			var dat = data.data.listData[0],
				maxCount = data.data.maxCount;
			if(dat.fstat == 1){
				me._controlMap.showInIndex.disable(true);
				baidu.g("showInIndex").style.display = "inline-block";
			}
		};
	},
	
	/**
	 * 操作时error区域内容为空
	 */
	hideError:function(){
		baidu.g("error_area").innerHTML = "";
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
