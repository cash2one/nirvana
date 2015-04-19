/**
 * 新建实验/编辑实验 第二步
 * @author zhouyu01
 */
fclab.abtest.createStep2 = {
	labtypeBar: null, //实验类型选择控件
	
	focusBar: null, //关注指标选择控件
	
	wordlist :null,	//物料列表控件
		
	wordselect :null, //物料选择控件
	
	upper: 100,
	
	labtypeItemset: [{		//实验类型选项集
		text: "关键词出价",
		value: 1
	}],
	
	focusItemset: [{		//关注指标选项集
		text: "点击量",
		value: 1
	}, {
		text: "展现量",
		value: 2
	}],
	
	/**
	 * 渲染第二步数据
	 * @param {Object} data
	 */
	render: function(data){
		var me = this;
		//初始化实验类型
		me.labtypeBar = new fclab.chosenBar({
			container: "LabTypeBar",
			itemset: me.labtypeItemset,
			value: data.labtype
		});
		//初始化关注指标
		me.focusBar = new fclab.chosenBar({
			container: "LabFocusBar",
			itemset: me.focusItemset,
			value: data.focus
		});
		
		me.wordlist = ui.util.get("testWordList");
		
		me.wordselect = ui.util.get("testWordSelect");
		
		//初始化实验对象并绑定容器内事件
		me.initTestWords(data.abwordlist);
	},
	
	/**
	 * 获取实验类型
	 */
	getLabType: function(){
		return this.labtypeBar.getValue();
	},
	
	
	/**
	 * 获取关注指标
	 */
	getFocus: function(){
		return this.focusBar.getValue();
	},
	
	/**
	 * 获取选择的关键词列表
	 */
	getAbWords: function(){
		var me = this;
		var all = me.wordlist.getValue("id");
		return baidu.array.filter(all, function(item){
			return baidu.array.indexOf(me.unavailWords, item) < 0;
		});//不在无法实验列表中
	},

	/**
	 * 初始化实验对象并绑定容器内事件
	 * @param {Object} abword	带入的关键词列表
	 */
	initTestWords: function(abword){
		var me = this;
		var wordlist = me.wordlist;
		var wordselect = me.wordselect;
		var wordset = me.getWordSet(abword);
		
		//不可用关键词数和选择关键词数初始化为0
		me.unavailWords = [];
		me.fillChosenCnt(0);
		me.fillUnavailCnt();
		
		//物料列表控件初始化与事件定义
		avatar.getPlanAndUnit(me, wordset, true, me.fillChosenCnt.bind(me));
		wordlist.ondelete = me.wordDeleteHandler();
		
		//物料选择控件事件定义
		wordselect.onAddLeft = me.checkWordsUpper();
		wordselect.onAddAllLeft = me.checkWordsUpper(true);	//当页添加
		baidu.g("DeleteUnavailWords").onclick = me.removeUnavailWords.bind(me);
	},
	
	
	/**
	 * 检查实验对象可用性
	 * @param {Object} params
	 */
	checkWords: function(params){
		var me = this;
		var labid = params.labid;
		var callback = params.callback;
		var abwords = me.getAbWords();
		if (abwords.length > 0) {
			fbs.abtest.checkLabWords({
				labid: labid,
				winfoidlist: abwords,
				callback: me.checkWordsCallback(callback)
			});
		}
		else {
			me.confirmToNext(400);
		}
	},
	
	/**
	 * 检查结果回调
	 * @param {Object} callback
	 */
	checkWordsCallback: function(callback){
		var me = this;
		return function(response){
			var status = response.status;
			var errorDetail = me.getErrorDetail(response.wordErrorDetail);
			var failcnt = errorDetail.length;
			if (status != 200 && status != 300 && status != 400) {
				ajaxFail(0);
				return;
			}
			if (failcnt > 0) {	
				//重新渲染wordlist	
				me.repaintWordsList(errorDetail);
				baidu.addClass("TestWordsUpperHint", "hide");
				me.fillUnavailCnt();
				me.fillChosenCnt();
			}
			/**
			 * callback参数是function，表示是进入下一步操作
			 * 监测可用性的click事件使用bind方法，导致callback会传入event参数，
			 * 所以这里一定要判断callback类型
			 */
			if (baidu.lang.isFunction(callback)) {
				me.confirmToNext(status, callback);
			}
		}
	},
	
	/**
	 * 获取错误信息
	 * @param {Object} error
	 */
	getErrorDetail: function(error){
		var result = [];
		var index = 0;
		var unavailWords = this.unavailWords;
		var length = unavailWords.length;
		error = error || {};
		for (var item in error) {
			result[index++] = {
				"winfoid": item,
				"errorcode": error[item].code
			}
			unavailWords[length++] = item;
		}
		return result;
	},
	
	/**
	 * 获取提示内容
	 * @param {Object} status
	 */
	getConfirmTip: function(status){
		var content = "";
		var total = this.chosencnt;
		var failcnt = this.unavailWords.length;
		switch (+status) {
			case 200:
				content = "共" + (total - failcnt) + "个关键词将参与实验"
				break;
			case 300:
				content = failcnt + "个关键词不符合实验规则，共" 
						+ (total - failcnt) + "个关键词将参与实验";
				break;
			case 400:
				content = "请选择符合规则的关键词！";
				break;
			default:
				break;
		}
		return content;
	},
	
	/**
	 * 下一步提示
	 * @param {Object} status
	 * @param {Object} callback
	 */
	confirmToNext: function(status, callback){
		var me = this;
		var content = me.getConfirmTip(status);
		if (status == 200 || status == 300) {
			ui.Dialog.confirm({
				title: '确认',
				content: content,
				cancel_button_lang: '返回',
				onok: function(){
					createAbtestStep3.render(me.getAbWords());
					callback && callback();
				}
			});
		}
		if (status == 400) {
			ui.Dialog.alert({
				title: '确认',
				content: content
			});
		}
	},

	
	/**
	 * 获取winfoid集合,供物料选择和物料列表渲染用
	 * @param {Object} wordlist
	 */
	getWordSet: function(wordlist){
		var wordset = [];
		for (var i = 0, len = wordlist.length; i < len; i++) {
			wordset[i] = {
				"id": wordlist[i].winfoid
			};
		}
		return wordset;
	},
	
	/**
	 * 初始化填充物料列表
	 * @param {Object} content
	 * @param {Object} callback
	 */
	wordInitFill: function(content, callback){
		var me = this;
		me.wordAddHandler(content);
		callback(content.length);
	},
	
	
	/**
	 * 检查添词是否已到达上限
	 * @param {Object} addall
	 */
	checkWordsUpper: function(addall){
		var me = this;
		return function(content){
			content = (content instanceof Array) ? content : [content];
			var len = content.length;
			if (me.availcnt + len > me.upper) {
				//提醒
				fclab.getFailTip("TestWordsUpperHint", "testwordsupper");
				baidu.removeClass("TestWordsUpperHint", "hide");
				var remind = me.upper - me.availcnt;
				if (remind < 1) {
					return false;
				}
				content = content.slice(0, remind);
			}
			avatar.getPlanAndUnit(me, content, false);
			if (addall) {
				me.wordselect.onAddAllLeftHandler(content);
			}
		}
	},
	
	/**
	 * 增加无法实验的提示
	 * @param {Object} errorDetail
	 */
	repaintWordsList: function(errorDetail){
		var len = errorDetail.length;
		if (len > 0) {
			var me = this;
			var container = me.wordlist.main;
			var objItems = baidu.q("monitor_word_chosen", container, "div");
			var objHash = {};
			var tpl = "无法实验" 
			+ "<span class='ui_bubble_icon_info' title={0}>&nbsp;</span>";
			var objItem, cancelItem, explainItem;
			for (var i = 0, l = objItems.length; i < l; i++) {
				objHash[objItems[i].id] = objItems[i];
			}
			for (var j = 0; j < len; j++) {
				objItem = objHash[errorDetail[j].winfoid];
				if (objItem) {
					//删除“取消”节点
					cancelItem = baidu.q("kwb_cancel", objItem, "div")[0];
					objItem.removeChild(cancelItem);
					//增加“无法实验”节点
					explainItem = baidu.dom.create("div", {
						"class": "test_kwb_explain"
					});
					explainItem.innerHTML = ui.format(tpl, 
							fclab.config.fail[errorDetail[j].errorcode]);
					objItem.appendChild(explainItem);
				}
			}
		}
	},
	

	/**
	 * 从右侧添词到左侧list框
	 * @param {Object} content
	 */
	wordAddHandler: function(content){
		var me = this;
		var main = me.wordlist.main;
		var len = content.length;
		var result = [];
		for (var i = 0; i < len; i++) {
			result[result.length] = {
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
		}
		me.wordlist.addList(result);
		main.scrollTop = main.scrollHeight;
		me.fillChosenCnt(me.chosencnt + len);
	},
	
	
	/**
	 * 从左侧删除添词
	 */
	wordDeleteHandler: function(){
		var me = this;
		return function(target){
			baidu.addClass("TestWordsUpperHint", "hide");
			me.wordselect.recover(target.getAttribute("id"));
			me.fillChosenCnt(me.chosencnt - 1);
		}
	},
	
	/**
	 * 修改不可用关键词数量
	 */
	fillUnavailCnt: function(){
		var unavailcnt = this.unavailWords.length;
		baidu.g("TestWordsUnavail").innerHTML = unavailcnt;
		if (unavailcnt > 0) {
			baidu.removeClass(baidu.g("DeleteUnavailWords"), "hide");
		}
		else {
			baidu.addClass(baidu.g("DeleteUnavailWords"), "hide");
		}
	},
	
	/**
	 * 修改选择的关键词数量
	 * @param {Object} chosencnt
	 */
	fillChosenCnt: function(chosencnt){
		var me = this;
		if (typeof(chosencnt) != "undefined") {
			me.chosencnt = chosencnt;
		}
		me.availcnt = me.chosencnt - me.unavailWords.length;
		baidu.g("TestWordsChosen").innerHTML = me.availcnt;
	},
	
		
	/**
	 * 删除无法实验的词
	 */
	removeUnavailWords: function(){
		var wordlist = this.wordlist.main;
		var idset = this.unavailWords;
		var items = baidu.dom.children(wordlist);
		var len = items.length;
		for (var i = 0; i < len; i++) {
			if (items[i] && 
				baidu.array.indexOf(idset, items[i].getAttribute("id")) > -1) {
				wordlist.removeChild(items[i]);
			}
		}
		this.chosencnt -= idset.length;
		this.unavailWords = [];
		this.fillUnavailCnt();
	}
}

var createAbtestStep2 = fclab.abtest.createStep2;
