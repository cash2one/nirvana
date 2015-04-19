/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    lib/util.js
 * desc:    util
 * author:  wanghuijun
 * date:    $Date: 2010/12/23 $
 */

/**
 * 记录用户最近查看时间，默认本地存储
 * setLastUpdateTime ：设置最近更新时间
 * getLastUpdateTime ：获取用户最近更新时间
 */
var TimeRecord = {
	//用户进入时间戳
	_enterPageTime : new Date(),
	_serverTime : typeof SERVER_TIME != 'undefined' ? SERVER_TIME : (new Date()).valueOf(),
	_swfName : '',
	_swfFile : '',
	setEnterPageTime : function(newTime){
		TimeRecord._enterPageTime = newTime;
	},
	getEnterPageTime : function(){
		return TimeRecord._enterPageTime;
	},
	setLastUpdateTime : function(key, callback, where, newTime){
		where = where || 'local';
		newTime = newTime || (+TimeRecord._serverTime + (new Date().valueOf() - TimeRecord._enterPageTime.valueOf()));
		switch (where){			
			case 'local':
				return FlashStorager.set(key, newTime, callback)
			case 'cookie':
			    return baidu.cookie.setRaw(key, newTime, {path: '/', expires : 365 * 24 * 3600 * 1000});
		}
	},
	getLastUpdateTime : function(key, callback, where){
		where = where || 'local';
		switch (where){			
			case 'local':
			    return FlashStorager.get(key, callback);
			case 'cookie':
			    return baidu.cookie.getRaw(key);
		}
	}
};

/**
 * 调用Flash方法
 * @param {Object} flashId FlashID
 * @param {Object} flashFun Flash方法
 * @param {Object} funParam 方法所用参数数组，空参时传undefined，仅当callback为空时可为空
 * @param {Object} callback 回调函数，可为空
 */
function invokeFlash(flashId, flashFun, funParam, callback, pollingTime){
	if (+UEManager.flashVersion <= 1){  //不支持flash
        if (typeof callback == 'function'){
            callback(false);            
        }
        return false;
    }
	var res,
	    fl = baidu.swf.getMovie(flashId);
	if (typeof fl != 'undefined'){
		var func = eval('baidu.swf.getMovie("' + flashId + '").' + flashFun);
		if (typeof func == 'function'){
			if (typeof funParam == 'undefined'){
				funParam = [];
			}
			if (typeof callback == 'function'){
				res = func.apply(fl,funParam);
				callback(res);
			}else{
				res = func.apply(fl,funParam);				
			}
			return res;			
		}
	}

	if (typeof pollingTime != 'undefined'){
		pollingTime += 1;
	}else{
		pollingTime = 1;
	}
	if (pollingTime < 5){
		//if(pollingTime == 2){ //等于2的时候尝试重写一次Flash //这是临时方案，我是真心的 tongyao@baidu.com 
			//baidu.g(flashId).innerHTML = baidu.g(flashId).innerHTML;
		//}
		setTimeout(function(){
			invokeFlash(flashId, flashFun, funParam, callback, pollingTime);
		}, 500);
		return 'polling';
	}else{
		if (typeof callback == 'function'){
			callback(false);			
		}
		return false;
	}    
}

/**
 * 登录次数的获取方法、
 * 在FlashStorage中存储，主要存储：登录次数信息 count
 * 主要用于判断：是否第一次登录？是否正在登录中？
 * 
 * 私有属性（最好永远不要直接设置它们）：
 * 		_count {Number} 登录次数
 * 		_tokenData {String} Token数据
 * 		_isNewLogin {Object} 是否刚刚登录 {fnName : true}
 * 
 * 外部调用公用方法：
 * 		getCount()  {Number} 返回登录次数
 * 		getTokenData() {String} 返回token数据
 * 		isFirstTime() {Boolean} 是否是第一次登录
 * 		hasLoggedBefore() {Boolean} 以前是否登录过
 * 		isDuringLogin() {Boolean} 当前是否在登录中，已经执行了init操作
 * 
 * Add By LeoWang(wangkemiao@baidu.com)
 */
var LoginTime = {
	_count : null,
	_tokenData : null,
	_isNewLogin : {},
	_specData : {},
	
	/**
	 * 检查是否需要执行init函数
	 * @param {String} fnName 功能的名称
	 */
	_init : function(fnName){
		if (typeof fnName == 'undefined') {
			return false;
		}
		
		if (typeof this._isNewLogin[fnName] == 'undefined') {
			// 此参数代表登录过程中刷新页面，第一次登录为true
			this._isNewLogin[fnName] = true;
		}
		
		this.init(fnName);
	},
	
	/**
	 * 必须要先执行的init
     * @param {String} fnName 功能的名称
	 */
	init : function(fnName){
		var keyData = nirvana.env.OPT_ID + '__LoginTimeData__' + fnName + '__cas__rn__',
		    keyCounter = nirvana.env.OPT_ID + '__LoginTimeCounter__' + fnName + '__cas__rn__',
			cookieData = baidu.cookie.getRaw('__cas__st__3'),
			tokenData = FlashStorager.get(keyData);

		//说明是第一次登录
		if('undefined' == typeof tokenData) {
            this._tokenData = cookieData;
            FlashStorager.set(keyData, this._tokenData);
			this._count = 1;
			FlashStorager.set(keyCounter, this._count);
			this._specData = {};
		}
		//可能是又登录了，也可能是在当前登录状态中重复执行了init
		else if(tokenData == 'polling') {
			// 坑爹的polling……
			// flash可能挂掉了，咋办？
			// 认为是重复执行init吧，但是有容错处理
			// 此参数代表登录过程中刷新页面，即登录过程的延续
			if(this._isNewLogin[fnName] === true){
				this._isNewLogin[fnName] = false;
			} 
			this._specData[fnName] = this._getData(fnName);
		}
		else {
			//token匹配，说明是重复执行了init，不进行处理
			//不匹配的话，说明是又登录了，执行处理
			if(tokenData != cookieData){
				this._tokenData = cookieData;
				FlashStorager.set(keyData, this._tokenData);
                this._count = +FlashStorager.get(keyCounter);
                this._count++;
                FlashStorager.set(keyCounter, this._count);
                this.clearData(fnName);
                this._specData = {};
			} else {
				// 此参数代表登录过程中刷新页面，即登录过程的延续
				this._isNewLogin[fnName] = false;
				this._specData[fnName] = this._getData(fnName);
			}
		}
	},
	// 特殊数据，用于一次登录期间使用，下次登录会清空
	setData : function(fnName, data){
		var key = nirvana.env.OPT_ID + '__LoginTimeSpecData__' + fnName + '__cas__rn__';
		FlashStorager.set(key, baidu.json.stringify(data));
		this._specData[fnName] = data;
	},
	_getData : function(fnName){
		//this._init(fnName);
		var key = nirvana.env.OPT_ID + '__LoginTimeSpecData__' + fnName + '__cas__rn__';
		var data = FlashStorager.get(key);
		if(data && data !== 'polling'){
			return baidu.json.parse(data);
		}
		else{
			return this._specData[fnName] || null;
		}
	},

	getData : function(fnName){
		this._init(fnName);
		return this._specData[fnName];
	},
	clearData : function(fnName){
		var key = nirvana.env.OPT_ID + '__LoginTimeSpecData__' + fnName + '__cas__rn__';
		FlashStorager.set(key, null);
		delete this._specData[fnName];
	},
	
	/**
	 * 返回登录次数
     * @param {String} fnName 功能的名称
	 */
	getCount : function(fnName){
		this._init(fnName);
		return this._count;
	},
	
	/**
	 * 返回token数据
	 * @param {String} fnName 功能的名称
	 */
	getTokenData : function(fnName){
		this._init(fnName);
		return this._tokenData;
	},
	
	/**
	 * 私有，设置登录次数
	 * @private
	_setCount : function(){
		FlashStorager.set(nirvana.env.OPT_ID + '__LoginTimeCounter__' + '__cas__rn__', this._count);
	},
     */
	/**
	 * 私有，设置Token数据
	 * @private
	_setTokenData : function(){
		FlashStorager.set(nirvana.env.OPT_ID + '__LoginTimeData__' + '__cas__rn__', this._tokenData);
	},
     */
	
	/**
	 * 是否当前是第一次登录
     * @param {String} fnName 功能的名称
	 */
	isFirstTime : function(fnName){
	    // 如果Flash缓存被禁用，则直接返回false
	    if (!FlashStorager.isEnable()){
	        return false;
	    }
	    
		this._init(fnName);
		return (this._count == 1) && this._isNewLogin[fnName];
	},
	/**
	 * 以前是否登录过
	 * 如果是true，则说明以前已经登录过了
     * @param {String} fnName 功能的名称
	 */
	hasLoggedBefore : function(fnName){
		this._init(fnName);
		return (this._count > 1);
	},
	
	/**
	 * 当前是否在登录中，已经执行了init操作
     * @param {String} fnName 功能的名称
	 */
	isDuringLogin : function(fnName){
		this._init(fnName);
		return !this._isNewLogin[fnName];
	}
};

/**
 * 针对Firefox自动解码URL的特性，对&和=做偏门文字替换
 * @param {Object} str
 */
nirvana.util.firefoxSpecialURLChars = {
	encode : function(str){
		if (!baidu.browser.firefox) {
			return str;
		}
		
		try {
			//Firefox会自动decodeURIComponent，我们这里只是将他转回最原始形式，但无法判断用户输入的是经过多少次encode形成的字符串
			while (decodeURIComponent(str) != str) {
				str = decodeURIComponent(str);
			}
		} catch(ex){
			
		}
		
		return str.replace(/&/g, '[[_erik_]]').replace(/=/gi, '[[_ci_]]');
	},
	
	decode : function(str){
		//这里不考虑是否firefox，防止firefox拷贝至ie的url
		if(typeof str != 'string'){
			return str;
		}
		return str.replace(/\[\[_erik_\]\]/g, '&').replace(/\[\[_ci_\]\]/g, '=');
	}
};

/**
 * 以dialog的方式开启子Action
 * @param {Object} json
 * @author tongyao@baidu.com
 */
nirvana.util.openSubActionDialog = function(json){
	var options = {
		className : '',
		id : '',
		title : '',
		dragable : true,
		needMask : true,
		unresize : false,
		maskLevel: 1,
		father: null,
		width : 400,
		left : 0,
		top : 0,
		actionPath : '',
		params : {},
		onclose : function(){}
	};
	
	options = baidu.extend(options, json);
	
	var dialog = ui.util.get(options.id);
	//创建dialog
	if(!dialog){
		dialog = new ui.util.create('Dialog', {
            id : options.id,
            title: options.title,
            width: options.width,
            height: options.height,
			dragable : options.dragable,
			needMask : options.needMask,
			unresize : options.unresize,
			maskLevel: options.maskLevel,
			father: options.father
        });
	}
	
	nirvana.subaction.isDone = false;
	dialog.show();
	
	//增加私有class    add by wanghuijun
	if (options.className) {
		baidu.addClass(dialog.getDOM(), options.className);
	}
	var subAction = er.controller.loadSub(
		dialog.getBodyId(), 
		er.controller.getActionConfigByPath(options.actionPath),
		options.params
	);
	//dialog.resizeHandler();

	dialog.onbeforeclose = subAction.onbeforeclose;
	
	dialog.onclose = function(param){
		//KR关闭时保存本地存储，临时解决方案，正路应该改顺序，执行完options.onclose才调unloadSub就好
		if (dialog.id == 'AddKeywordDialog'){
			fc.common.Keyword.saveKeywordsFromCacheToStorage();
			AUTOUNIT_MODEL.takeSnapShot();
		}
		//析构子Action
		er.controller.unloadSub(subAction);
		
		dialog.dispose();
        // 修改onclose回调传入的参数，增加一个参数 modifiedy by Huiyao，为了下面被注掉代码使用 2013.1.18
		options.onclose && options.onclose.apply(null, [param, dialog.father]);
		
		clearTimeout(nirvana.subaction.resizeTimer);
		// 以下代码被移到accoutOptimizer/All/lib_widget.js del by Huiyao 2013.1.18
//		//add by LeoWang(wangkemiao@baidu.com) 彻底清除dialog 去除子Action的残余信息
//		//2011-12-21去除nirvana.aoControl.isMainPage()判断
//		if(dialog.father && dialog.father.id === 'maskForScrollingSubDialog'){
//			//baidu.hide('maskForScrollingSubDialog');
//			baidu.un(window, 'resize', nirvana.aoWidgetAction.doExtendSubDialogScrollEventHandler);
//			document.body.removeChild(baidu.g('maskForScrollingSubDialog'));
//		}
//		if(dialog.father && dialog.father.id === 'recMaskForScrollingSubDialog') {
//			baidu.un(window, 'resize', nirvana.aoWidgetAction.doExtendRecSubDialogScrollEventHandler);
//			document.body.removeChild(baidu.g('recMaskForScrollingSubDialog'));
//		}
		ui.util.dispose(options.id);
		//add complete
	}
	
	subAction.onclose = function(){
		dialog.close(); //调用dialog的关闭方法
	};
	
	subAction.setTitle = function(html){
		dialog.setTitle(html); //调用dialog的关闭方法
	};
	
	/**
	 * dialog子action刷新
	 * @author zhouyu01@baidu.com
	 */
	subAction.refreshSelf = function(statemap){
		if (statemap) {
			for (var item in statemap) {
				options.params[item] = statemap[item];
			}
		}
		
		// 这里需要析构子Action，然后打开新的子action
		er.controller.unloadSub(subAction);
		
		//setTimeout(function() {
			nirvana.util.openSubActionDialog(options);
		//}, 100);
	}
	
	// ajax返回以后，子action dialog需要二次定位
	var dialogResizeHandler = function() {
		if (nirvana.subaction.isDone) {
			dialog.resizeHandler();
			return;
		}
		
		clearTimeout(nirvana.subaction.resizeTimer);
		nirvana.subaction.resizeTimer = setTimeout(dialogResizeHandler, 500);
	};
	
	if(!options.unresize){
		dialogResizeHandler();
	}else{
		var dialogDom = baidu.g(dialog.getId());
		if(options.left){
			dialogDom.style.left = options.left + "px";
		}
		if(options.top){
			dialogDom.style.top = options.top + "px";
		}
	}
	dialog.action = subAction;
	return dialog;
};

/**
 * 将日历快捷方式的值翻译为实际date的范围
 * @param {Object} optionIndex
 * @author tongyao@baidu.com
 */
nirvana.util.dateOptionToDateValue = function(optionIndex, dateOption){
	dateOption = dateOption || nirvana.config.dateOption;
	var option = dateOption[optionIndex];
	this.now = new Date(nirvana.env.SERVER_TIME * 1000);
	return option.getValue.call(this);
}

/**
 * 将时间翻译成日历快捷方式的text
 * @param {Object} date
 * @author zhouyu
 */
nirvana.util.dateOptionToDateText = function(date, dateOption){
	var date = baidu.object.clone(date);
	dateOption = dateOption || nirvana.config.dateOption;
	//	var option = nirvana.config.dateOption[optionIndex];
	this.now = new Date(nirvana.env.SERVER_TIME * 1000);
	date.begin = date.begin.toString() == this.now.toString() ? "" : date.begin;
	date.end = date.end.toString() == this.now.toString() ? "" : date.end;
	//显示快捷日期   
	var dateOpt = dateOption, optValue;
	for (var i = 0; i < dateOpt.length; i++) {
		optValue = dateOpt[i].getValue.call(this);
		if(optValue.begin != "" && optValue.end != "" && date.begin != "" && date.end != ""){
			if (optValue.begin.getFullYear() == date.begin.getFullYear() &&
				optValue.begin.getMonth() == date.begin.getMonth() &&
				optValue.begin.getDate() == date.begin.getDate() &&
				optValue.end.getFullYear() == date.end.getFullYear() &&
				optValue.end.getMonth() == date.end.getMonth() &&
				optValue.end.getDate() == date.end.getDate()) {
				return dateOpt[i].text;
			}
		}else{
			if(optValue.begin == "" && optValue.end == "" && date.begin == "" && date.end == ""){
				return dateOpt[i].text;
			}
		}
	}
	return false;
}


nirvana.util.getPageData = function(data, pageSize, pageNo){
    var len = data.length;
    if(len < pageSize){
        return data;
    } else if (len >=  pageSize * pageNo) {
        return data.slice(pageSize * (pageNo - 1), pageSize * pageNo)
    } else if (len < pageSize * pageNo) {
        return data.slice(pageSize * (pageNo -1), len)
    }
}
/**
 * 按照指定模板生成类型为type,状态码为statusCode的HTML片段
 * @param type 参考{@link nirvana.util.getStat} type
 * @param statusCode 参考{@link nirvana.util.getStat} statusCode 
 * @param {String} tpl 模板字符串
 * @returns html
 */
nirvana.util.generateStat = function (type, statusCode, tpl, pauseStat) {
    var pauseClassName = '';
    if(typeof pauseStat != 'undefined'){
        pauseClassName = ' pausestat_' + pauseStat;
    }
    var className = type + 'status_' + statusCode + pauseClassName,
        //get status text
        text = STATE_LIST[type.toUpperCase()][statusCode];

    // 读写分离，待升级之后不用这种方式了
    // by Leo Wang
	tpl = nirvana.acc.accService.processPause(pauseStat, tpl);

    return ui.format(tpl, className, text, type + '_' + pauseStat);

};
/**
 * 获取带图标的状态HTML片段,参数和{@link nirvana.util.getStat}相同
 * @param params 被点击小灯泡所处层级的信息，包括planid, unitid,winfoid,ideaid
 */
nirvana.util.buildStat = function (type, statusCode, pauseStat, params) {
	var paramString = '';
	if(params){
		paramString = baidu.json.stringify(params);//params里仅携带id等没有xss风险的属性
	}
    // mod by Huiyao 2013-5-10: 将模板格式化下，加入三个属性到模板：act(2个),actLevel
    // 用于事件代理事件处理
    // 将字符串转成全小写，只保留第一个字母大写
    var actType = initialString(type);
    var act = pauseStat == 0 ? 'pause' + actType : 'enable' + actType;
    var tpl = '<div class="{0}">'
        +          '<span class="status_text">'
        +               '<span class="status_icon" act="viewOffLineReason" '
        +                      'data=\'' + paramString + '\'>'
        +               '</span>'
        +               '{1}'
        +          '</span>'
        +          '<span class="status_op_btn" act="' + act + '" '
        +                 'actLevel="' + type + '" '
        +                 'data-log="{target:\'status_op_{2}_btn\'}">'
        +          '</span>'
        +     '</div>';
    return nirvana.util.generateStat(type, statusCode, tpl, pauseStat);
}

/**
 * 根据匹配模式，组装显示字面
 * @param {Object} showword
 * @param {Object} wmatch
 */
nirvana.util.buildShowword = function(showword, wmatch, wctrl){
	if(wmatch == 31){ //短语
		if (wctrl == 0) { //高级短语
			showword = '&quot;' + showword + '&quot;';
		} else { //原普通高端
			showword = '&quot;[' + showword + ']&quot;';
		}
	} else if(wmatch == 63){ //精确
		showword = '[' + showword + ']';
	}
	return showword;
}
/**
 *
 * 获取纯文字的状态的HTML片段,颜色由className设置
 * @param {String} type 要获取的类型,可能的取值有account, plan, unit, idea, word 
 * @param {String|Number} statusCode 指定的状态,数字字符串,可能的取值有为配置的值
 * @returns {String} 返回带className的html 片段
 * @author chenjincai
 */
nirvana.util.getStat = function (type, statusCode) {
    return nirvana.util.generateStat(type, statusCode, '<span class="{0}">{1}</span>');
}

nirvana.util.quickSort = function(input, sortMethod){
    if (input.length <= 1) return input;
    var pivot = Math.floor(Math.random()*input.length)
    var less = [], greater=[];
    var pivotElem = input.splice(pivot,1)
    for (x in input) {
		/*if (typeof sortMethod != 'undefined') {
			if(sortMethod(input[x], pivotElem[0]) <= 0){
				less.push(input[x]);
			} else {
				greater.push(input[x]);
			}
		} else {*/
			if (input[x] <= pivotElem[0]) {
				less.push(input[x]);
			} else {
				greater.push(input[x]);
			}
		//}
        
    }
    return [].concat(nirvana.util.quickSort(less),pivotElem,nirvana.util.quickSort(greater));
}


function ajaxFailDialog(title, content){
	var dialog = ui.util.get('AjaxFailDialog'),
	    title = title || '数据读取异常，请刷新后重试',
        content = content || '数据读取异常，请刷新后重试。';
		
	if (!dialog) {
		ui.Dialog.factory.create({
			title: title,
			content: content,
			closeButton: false,
			cancel_button: false,
			maskType: 'black',
			maskLevel: '3',
			id: 'AjaxFailDialog',
			width: 300,
			onok : function(){},
			autoFocus : true,
			defaultButton : 'ok'
		}).show();
	} else {
		dialog.show();
		// 增加文字修改
        baidu.g('ctrldialogAjaxFailDialogtitle').innerHTML = title;
        baidu.g('ctrldialogAjaxFailDialogbody').innerHTML = content;
	}
}

function ajaxFail(type){
	var title = "",
		content = "";
	switch(type){
		case 0 : 
			title = "系统异常";
			content = "抱歉，系统异常，请稍后再试！";
			break;
		case 503 :
			title = "系统异常";
			content = "抱歉，创建单元失败，请刷新后重试！";
			break;
	}
	ajaxFailDialog(title,content);
}

/**
 * 涅槃加载对象
 */
nirvana.util.loading = {
	begintime: null,
	endtime : 0,
	isShow : false,
	
	/**
	 * 创建loading元素
	 * @param {String} lang 提示话语
	 */
	getBody : function() {
		var me = this,
		    dom = baidu.dom.create('div', {
				className : 'loading loading_fix',
				id : 'Loading'
			});
				
		document.body.appendChild(dom);
		
		me.main = baidu.g('Loading');
	},
	
	/**
	 * 定位loading
	 */
	position : function() {
		var me = nirvana.util.loading, // 这里用this，在window.resize时会出错
		    main = me.main,
			page = baidu.page,
        // 修复left/top值为小数导致chrome最新版下显示loading border缺失bug, modified by Huiyao: 2013.1.4
		    left = parseInt((page.getViewWidth()  - main.offsetWidth)  / 2),
			top  = parseInt((page.getViewHeight() - main.offsetHeight) / 2);
		
		if (baidu.browser.ie < 7) { // IE6，不想说什么了
			top += page.getScrollTop();
		}
		
		// 关闭快速新建任务时，在IE8下，偶尔会出现left<0的情况，所以增加判断逻辑
        if (left < 0 || top < 0) {
            return;
        }
		
		main.style.left = left + 'px';
		main.style.top  = top  + 'px';
	},
	
	/**
	 * 显示loading并定位
	 */
	init : function(lang) {
		if(baidu.g('DefaultLoadingIcon')){	//如果存在第一次进入默认的背景loading 则不出现此浮动层
			return;
		}
		
		var me = this;
		if(!this.begintime) {
			this.begintime = (new Date()).valueOf();
		}
		
		me.isShow = true;
		
		if (!me.main) {
			me.getBody();
		}
		var main = me.main;
		
		if (typeof(lang) == 'undefined') { // 不传参数，则话语为默认值
			lang = nirvana.config.LANG.LOADING;
		}
		
//		baidu.removeClass(main, 'loading_done');
		baidu.removeClass(main, 'hide');
		main.innerHTML = IMGSRC.LOADING + lang;
		
		me.position();
		ui.Mask.show('white', '10');
		baidu.on(window, 'resize', me.position);
		if (baidu.browser.ie < 7) {
			baidu.on(window, 'scroll', me.position);
		}
	},
	initWithBlackMask : function(lang){
		if(baidu.g('DefaultLoadingIcon')){	//如果存在第一次进入默认的背景loading 则不出现此浮动层
			return;
		}
		
		var me = this;
		
		me.isShow = true;
		
		if (!me.main) {
			me.getBody();
		}
		var main = me.main;
		
		if (typeof(lang) == 'undefined') { // 不传参数，则话语为默认值
			lang = nirvana.config.LANG.LOADING;
		}
		
		baidu.removeClass(main, 'loading_done');
		baidu.removeClass(main, 'hide');
		main.innerHTML = IMGSRC.LOADING + lang;
		
		me.position();
		ui.Mask.show('black', '10');
		baidu.on(window, 'resize', me.position);
		if (baidu.browser.ie < 7) {
			baidu.on(window, 'scroll', me.position);
		}
	},
	
	/**
	 * 数据加载完毕，隐藏loading
	 */
	done : function(lang){
		if(baidu.g('DefaultLoadingIcon')){	//如果存在第一次进入默认的背景loading 则不出现此浮动层
			return;
		}
		var me = this,
		    main = me.main;
		
		me.isShow = false;
		
//		if (typeof(lang) == 'undefined') { // 不传参数，则话语为默认值
//			lang = nirvana.config.LANG.LOADING_DONE;
//		}
		if (!main) {
			return;
		}
//		baidu.addClass(main, 'loading_done');
//		main.innerHTML = IMGSRC.LOADING + lang;
		
//		me.position();
		//稍纵即逝~~
//		setTimeout(function() {
//			if(me.isShow){
//				return;
//			}
			baidu.addClass(main, 'hide');
			ui.Mask.hide('10');
			baidu.un(window, 'resize', me.position);
			if (baidu.browser.ie < 7) {
				baidu.un(window, 'scroll', me.position);
			}
//		}, 100);
		if(this.begintime) {
			this.endtime = (new Date()).valueOf();
			NIRVANA_LOG.send({
				target: 'pageBlockingTime',
				isArrow: nirvana.acc.expControl.isArrowUser(),
				timespan: this.endtime - this.begintime
			});
			// console.log(this.endtime - this.begintime);
			this.begintime = null;
			this.endtime = null;
		}
	}
};

/**
 * 涅槃loading
 * 用于轮询请求时显示
 */
nirvana.util.loadingQuery = {
    
    /**
     * 显示loading并定位
     * @param parentId loading区域的id
     */
	show : function(parentId) {
		parentId = parentId || '';
        
        var me = this,
            id = parentId + 'LoadingQuery',
            dom = baidu.g(id),
            parentDom = baidu.g(parentId) || document.body;
        
        if(!dom) {
            dom = baidu.dom.create('div', {
                className : 'loading_query',
                id : id
            });
            dom.innerHTML = IMGSRC.LOADING;
            
            parentDom.appendChild(dom);
        }
		
		if (parentDom) {
			
		}
		
		baidu.removeClass(dom, 'hide');
	},
	
	hide : function(parentId) {
        parentId = parentId || '';
        
        var me = this,
            id = parentId + 'LoadingQuery',
            dom = baidu.g(id),
            parentDom = baidu.g(parentId) || document.body;
		
        if (!dom) {
            return;
        }
		
		baidu.addClass(dom, 'hide');
	}
};

/**
 * bind兼容性处理
 * @author zhouyu01
 */
if (!Function.prototype.bind) {
	Function.prototype.bind = function(){
		var __method = this;
		var args = Array.prototype.slice.call(arguments);
		var object = args.shift();
		return function(){
			return __method.apply(object, 
					args.concat(Array.prototype.slice.call(arguments)));
		}
	}
}


/**
 * URL去掉HTTP://头
 * @param {String} url
 * @return {String} url
 * @author zuming@baidu.com
 */
function removeUrlPrefix(url){
    url = url.replace(/：/g, ':').replace(/．/g, '.').replace(/／/g, '/');
    while (baidu.trim(url).toLowerCase().indexOf('http://') != -1) {
        url = baidu.trim(url.replace(/http:\/\//i, ''));
    }
    return url;
}

/**
 * 判断一个元素是否隐藏
 * @param {Object} dom 需要判断的元素
 * @return {Boolean} true为隐藏
 * @author zuming@baidu.com
 */
function isHide(dom) {
    dom = baidu.g(dom);
    if (dom) {
        return (getStyle(dom,'display') == "none");
    }
    return false;
}

/**
 * 获取元素当前属性
 * @param {Object} el
 * @param {Object} property
 */
// del by Huiyao: 该方法后面重复定义了，把该方法覆盖了！
//var getStyle = function( el , property ){
//    el = baidu.g(el);
//    if (window.getComputedStyle) { // W3C DOM method
//            property = (property === 'float') ? property = 'cssFloat' : property;
//
//            var value = el.style[property],
//                computed;
//
//            if (!value) {
//                computed = el['ownerDocument']['defaultView']['getComputedStyle'](el, null);
//                if (computed) { // test computed before touching for safari
//                    value = computed[property];
//                }
//            }
//
//            return value;
//    } else if (el['currentStyle']) {
//            var value;
//
//            switch(property) {
//                case 'opacity' :// IE opacity uses filter
//                    value = 100;
//                    try { // will error if no DXImageTransform
//                        value = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;
//
//                    } catch(e) {
//                        try { // make sure its in the document
//                            value = el.filters('alpha').opacity;
//                        } catch(err) {
//
//                        }
//                    }
//                    return value / 100;
//                case 'float': // fix reserved word
//                    property = 'styleFloat'; // fall through
//                default:
//                    property = property;
//                    value = el['currentStyle'] ? el['currentStyle'][property] : null;
//                    return ( el.style[property] || value );
//            }
//    }
//
//};

/**
 * @param {Object} classname
 * @param {Object} el
 */
// 这个方法没被用到，暂时删掉， by Huiyao
/*function getElementsByClassName(classname , el , tagname ){
    var father = el?baidu.g(el):document;
	var tagname = tagname || "*";
    var forSelect = father.getElementsByTagName(tagname);
    var els = [];
    for(var i = 0 , l = forSelect.length ; i<l ; i++){
		var classNameArray = forSelect[i].className.split(' '); //支持空格分隔的多个className
		for(var j = 0, len = classNameArray.length; j < len; j++){	
	        if(classNameArray[j] == classname){
	            els.push(forSelect[i]);
	        }
		}
    }
    return els;
}*/

/**
 * 判断对象中是否包含一个元素
 * @param {String|Object} dom 元素ID值
 * @param {Object} 需要查询的元素
 * @return {Number} 位置，-1表示没有，1表示有
 * @author wanghuijun@baidu.com
 */
function domHas(dom, element) {
	dom = baidu.g(dom);
	while (element.parentNode && element.parentNode.nodeType != 9) {
		element = element.parentNode;
		if (element == dom) {
			return 1;
		}
	}
	return -1;
};


/**
 * 触发已经注册的事件
 * @name baidu.event.fire
 * @function
 * @grammar baidu.event.fire(element, type, options)
 * @param {HTMLElement|string|window} element 目标元素或目标元素id
 * @param {string} type 事件类型
 * @param {Object} options 触发的选项
				
 * @param {Boolean} options.bubbles 是否冒泡
 * @param {Boolean} options.cancelable 是否可以阻止事件的默认操作
 * @param {window|null} options.view 指定 Event 的 AbstractView
 * @param {1|Number} options.detail 指定 Event 的鼠标单击量
 * @param {Number} options.screenX 指定 Event 的屏幕 x 坐标
 * @param {Number} options.screenY number 指定 Event 的屏幕 y 坐标
 * @param {Number} options.clientX 指定 Event 的客户端 x 坐标
 * @param {Number} options.clientY 指定 Event 的客户端 y 坐标
 * @param {Boolean} options.ctrlKey 指定是否在 Event 期间按下 ctrl 键
 * @param {Boolean} options.altKey 指定是否在 Event 期间按下 alt 键
 * @param {Boolean} options.shiftKey 指定是否在 Event 期间按下 shift 键
 * @param {Boolean} options.metaKey 指定是否在 Event 期间按下 meta 键
 * @param {Number} options.button 指定 Event 的鼠标按键
 * @param {Number} options.keyCode 指定 Event 的键盘按键
 * @param {Number} options.charCode 指定 Event 的字符编码
 * @param {HTMLElement} options.relatedTarget 指定 Event 的相关 EventTarget
 * @version 1.3
 *             
 * @returns {HTMLElement} 目标元素
 */
(function(){
	var browser = baidu.browser,
	keys = {
		keydown : 1,
		keyup : 1,
		keypress : 1
	},
	mouses = {
		click : 1,
		dblclick : 1,
		mousedown : 1,
		mousemove : 1,
		mouseup : 1,
		mouseover : 1,
		mouseout : 1
	},
	htmls = {
		abort : 1,
		blur : 1,
		change : 1,
		error : 1,
		focus : 1,
		load : browser.ie ? 0 : 1,
		reset : 1,
		resize : 1,
		scroll : 1,
		select : 1,
		submit : 1,
		unload : browser.ie ? 0 : 1
	},
	bubblesEvents = {
		scroll : 1,
		resize : 1,
		reset : 1,
		submit : 1,
		change : 1,
		select : 1,
		error : 1,
		abort : 1
	},
	parameters = {
		"KeyEvents" : ["bubbles", "cancelable", "view", "ctrlKey", "altKey", "shiftKey", "metaKey", "keyCode", "charCode"],
		"MouseEvents" : ["bubbles", "cancelable", "view", "detail", "screenX", "screenY", "clientX", "clientY", "ctrlKey", "altKey", "shiftKey", "metaKey", "button", "relatedTarget"],
		"HTMLEvents" : ["bubbles", "cancelable"],
		"UIEvents" : ["bubbles", "cancelable", "view", "detail"],
		"Events" : ["bubbles", "cancelable"]
	};
	baidu.object.extend(bubblesEvents, keys);
	baidu.object.extend(bubblesEvents, mouses);
	function parse(array, source){//按照array的项在source中找到值生成新的obj并把source中对应的array的项删除
		var i = 0, size = array.length, obj = {};
		for(; i < size; i++){
			obj[array[i]] = source[array[i]];
			delete source[array[i]];
		}
		return obj;
	};
	function eventsHelper(type, eventType, options){//非IE内核的事件辅助
		options = baidu.object.extend({}, options);
		var param = baidu.object.values(parse(parameters[eventType], options)),
			evnt = document.createEvent(eventType);
		param.unshift(type);
		if("KeyEvents" == eventType){
			evnt.initKeyEvent.apply(evnt, param);
		}else if("MouseEvents" == eventType){
			evnt.initMouseEvent.apply(evnt, param);
		}else if("UIEvents" == eventType){
			evnt.initUIEvent.apply(evnt, param);
		}else{//HTMMLEvents, Events
			evnt.initEvent.apply(evnt, param);
		}
		baidu.object.extend(evnt, options);//把多出来的options再附加上去,这是为解决当创建一个其它event时，当用Events代替后需要把参数附加到对象上
		return evnt;
	};
	function eventObject(options){//ie内核的构建方式
		var evnt;
		if(document.createEventObject){
			evnt = document.createEventObject();
			baidu.object.extend(evnt, options);
		}
		return evnt;
	};
	function keyEvents(type, options){//keyEvents
		options = parse(parameters["KeyEvents"], options);
		var evnt;
		if(document.createEvent){
			try{//opera对keyEvents的支持极差
				evnt = eventsHelper(type, "KeyEvents", options);
			}catch(keyError){
				try{
					evnt = eventsHelper(type, "Events", options);
				}catch(evtError){
					evnt = eventsHelper(type, "UIEvents", options);
				}
			}
		}else{
			options.keyCode = options.charCode > 0 ? options.charCode : options.keyCode;
			evnt = eventObject(options);
		}
		return evnt;
	};
	function mouseEvents(type, options){//mouseEvents
		options = parse(parameters["MouseEvents"], options);
		var evnt;
		if(document.createEvent){
			evnt = eventsHelper(type, "MouseEvents", options);//mouseEvents基本浏览器都支持
			if(options.relatedTarget && !evnt.relatedTarget){
				if("mouseout" == type.toLowerCase()){
					evnt.toElement = options.relatedTarget;
				}else if("mouseover" == type.toLowerCase()){
					evnt.fromElement = options.relatedTarget;
				}
			}
		}else{
			options.button = options.button == 0 ? 1
								: options.button == 1 ? 4
									: baidu.lang.isNumber(options.button) ? options.button : 0;
			evnt = eventObject(options);
		}
		return evnt;
	};
	function htmlEvents(type, options){//htmlEvents
		options.bubbles = bubblesEvents.hasOwnProperty(type);
		options = parse(parameters["HTMLEvents"], options);
		var evnt;
		if(document.createEvent){
			try{
				evnt = eventsHelper(type, "HTMLEvents", options);
			}catch(htmlError){
				try{
					evnt = eventsHelper(type, "UIEvents", options);
				}catch(uiError){
					evnt = eventsHelper(type, "Events", options);
				}
			}
		}else{
			evnt = eventObject(options);
		}
		return evnt;
	};
	baidu.event.fire = function(element, type, options){
		var evnt;
		type = type.replace(/^on/i, "");
		element = baidu.dom._g(element);
		options = baidu.object.extend({
			bubbles : true,
			cancelable : true,
			view : window,
			detail : 1,
			screenX : 0,
			screenY : 0,
			clientX : 0,
			clientY : 0,
			ctrlKey : false,
			altKey  : false,
			shiftKey: false,
			metaKey : false,
			keyCode : 0,
			charCode: 0,
			button  : 0,
			relatedTarget : null
		}, options);
		if(keys[type]){
			evnt = keyEvents(type, options);
		}else if(mouses[type]){
			evnt = mouseEvents(type, options);
		}else if(htmls[type]){
			evnt = htmlEvents(type, options);
		}else{
		    throw(new Error(type + " is not support!"));
		}
		if(evnt){//tigger event
			if(element.dispatchEvent){
				element.dispatchEvent(evnt);
			}else if(element.fireEvent){
				element.fireEvent("on" + type, evnt);
			}
		}
	}
})();

/**
 * 获取元素当前属性
 * @param {Object} el
 * @param {Object} property
 */
var getStyle = function( el , property ){
    el = baidu.g(el);
    if (window.getComputedStyle) { // W3C DOM method
            property = (property === 'float') ? property = 'cssFloat' : property;

            var value = el.style[property],
                computed;
            
            if (!value) {
                computed = el['ownerDocument']['defaultView']['getComputedStyle'](el, null);
                if (computed) { // test computed before touching for safari
                    value = computed[property];
                }
            }
            
            return value;
    } else if (el['currentStyle']) {
            var value;

            switch(property) {
                case 'opacity' :// IE opacity uses filter
                    value = 100;
                    try { // will error if no DXImageTransform
                        value = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;

                    } catch(e) {
                        try { // make sure its in the document
                            value = el.filters('alpha').opacity;
                        } catch(err) {
                            
                        }
                    }
                    return value / 100;
                case 'float': // fix reserved word
                    property = 'styleFloat'; // fall through
                default: 
                    property = property;
                    value = el['currentStyle'] ? el['currentStyle'][property] : null;
                    return ( el.style[property] || value );
            }
    }

};

/**
 * UI初始化方法
 * @param target 容器的id或DOM节点
 * @param action er的action
 * @author wanghuijun@baidu.com
 * @date $Date: 2012/06/11 $
 */
nirvana.util.uiInit = function(target, action) {
	target = baidu.g(target);
	
	if (target) {
		var uiList = ui.util.init(target, action.UI_PROP_MAP, action._contextId), // 这里必须加_contextId，才能设置UI参数
		    o;
		
		for(o in uiList){
            action._controlMap[o] = uiList[o];
        }
	}
};

/**
 * 将pv数据翻译成区间，日均搜索量，用于新提词优化详情与快速新建
 * @param value 要转化的pv值
 * @author mayue@baidu.com
 */
nirvana.util.translatePv = function(value){
    var me = this,
        value = parseInt(value),
        result;

    if(!isNaN(value)){
        if(value <= 10){
            result = '<10';
        }
        else if(value <= 20){
            result = '10-20';
        }
        else if(value <= 30){
            result = '20-30';
        }
        else if(value <= 50){
            result = '30-50';
        }
        else if(value <= 100){
            result = '50-100';
        }
        else if(value <= 200){
            result = '100-200';
        }
        else if(value <= 500){
            result = '200-500';
        }
        else if(value <= 1000){
            result = '500-1000';
        }
        else if(value <= 5000){
            result = '1000-5000';
        }
        else if(value < 100000){
            result = '>5000';
        }
        else{
            result = '>10万'
        }
    }
    else{
        result = '';
    }
    	    
    return result;
};

/**
 * 保证数据是100之内的整数，主要用于推词表格项中的“竞争激烈程度”
 * @param value 要转化的值
 * @author mayue@baidu.com
 */
nirvana.util.translatePercent = function(value){
    var me = this,
        value = parseInt(value),
        result;
    
    if(!isNaN(value) && value <= 100 && value >= 0){
        result = value;
    }
    else{
        result = '';
    }
    return result;
};

/*
 * 将表格升级为推荐关键词表格，用在aoPackage的详情页面，用init初始化(注意addword作为推词，word的W没有大写)
 * @author mayue@baidu.com
 * @param {object} target 要升级的表格，用ui.util.get形式取到的对象
 * @param {func} getDataFunc 获取更多关键词的函数，传递参数i(第几次点击“获取更多”)，在该函数的onsuccess中需传递与
 * @param boolean hasMoreButton 是否显示获取更多按钮
 * 原表格数据结构相同的数据调用下面对象的setData方法，该函数还需要return 0/1标志是否将“更多”按钮置灰
 */
nirvana.util.addwordTable = function(target, getDataFunc, hasMoreButton){
	this.target = target;
	this.getDataFunc = getDataFunc;
	this.appendCount = 0;
	//this.tpl = '<div id="addwordMoreContainer" class="addword_morecontainer"><div ui="id:addwordMore;type:Button;">'
	//		 + '<span class="arrow_button">获得更多关键词</span></div></div>';
	this.tpl = er.template.get('addwordContainer');
	this.itemToGroupList = [];
	this.groupList = [];
	this.deleteCount = 0;
	this.init(hasMoreButton);
};

nirvana.util.addwordTable.prototype = {
	init: function(hasMoreButton) {
		var me = this,
			target = me.target,
			wordListCount = baidu.g('WordListSelectCount');

		// 增加表格样式，插入获取更多按钮
		baidu.addClass(target.main, "addword_table");
		baidu.dom.insertHTML(target.getBody(), "beforeEnd", me.tpl);
		ui.util.init(baidu.g("addwordMoreContainer"));
		if (!hasMoreButton){
			// ui.util.get("addwordMore").disable(true);
			// and hide
            baidu.hide('addwordMoreContainer');
            //			baidu.hide(ui.util.get("addwordMore").main);
		}

		if (wordListCount) {
			wordListCount.innerHTML = target.datasource.length;
		}

		/**
		baidu.dom.insertHTML(baidu.dom.query("#ctrltableWidgetTabletitleCell1 .ui_table_thtext")[0], 
		"beforeEnd",
		 '（<span id="WordListSelectCount">' + me.target.datasource.length + '</span>）');
		*/

		/*
		 * 设置表格的onselect为根据selectIndex更新头部数字，并根据selectedIndex长度与总长和删除数的关系判断是否全选或全不选，对头部和sub头部做控制
		 */
		target.onselect = function(selectedIndex) {
			var selectedNum = selectedIndex.length;
			// Added by Wu Huiyao: FIX BUG:界面数字不更新，由于表头可能会重绘，导致缓存的DOM元素跟界面的DOM元素已经不是同一DOM元素
			wordListCount = baidu.g('WordListSelectCount');
			// 更新数量
			if (wordListCount) {
				wordListCount.innerHTML = selectedNum;
			}
			
    		if (selectedNum == (target.datasource.length - me.deleteCount) && selectedNum != 0){
    			target.getHeadCheckbox().checked = true;
    			//在每次全选时控制subIntro的checkbox状态改变
    			for ( var j = 1; j < me.groupList.length; j++){
    				if (baidu.g("addwordIntroNum" + j)){
    					baidu.g("addwordIntroCheck" + j).checked = true;
    				}
    			}
    		} else {
    			target.getHeadCheckbox().checked = false;
    		}

    		if (selectedNum == 0){
    			//在每次全选时控制subIntro的checkbox状态改变
    			for ( var j = 1; j < me.groupList.length; j++){
    				if (baidu.g("addwordIntroNum" + j)){
    					baidu.g("addwordIntroCheck" + j).checked = false;
    				}
    			}
    		}
    		//控制下部"添加"按钮
    		var enabled = selectedNum > 0;
            ui.util.get('WidgetApply').disable(!enabled);
            nirvana.util.executeCallback('onRowSel', [selectedIndex], me);
    	};

		me.initHandler();
		
		//设置分组列表和反向对应，为之后删除行时的删除父元素做准备
		var dataLen = target.datasource.length;
		me.groupList[0] = [];
		for (var i = 0; i < dataLen; i++){
			me.groupList[0].push(i);
			me.itemToGroupList[i] = 0;
		}
	},

	initHandler: function(){
		var me = this;
		ui.util.get("addwordMore").onclick = function(){
			me.appendCount ++;
			if (me.getDataFunc(me.appendCount)){
				// ui.util.get("addwordMore").disable(true);
				// and hide
                baidu.hide('addwordMoreContainer');
                //				baidu.hide(ui.util.get("addwordMore").main);
			};
		}
	},
	
	/*
	 * 将获取到的数据加入到表格中
	 * @param data 新数据
	 * @param i 标识第几次添加
	 */
	setData: function(data, i){
		var me = this;
		me.appendSubIntro(data.length, i);
		me.appendRows(data, "addword_append" + i);
		me.addSubHandler(i);
		
		//设置分组列表和反向对应，为之后删除行时的删除父元素做准备
		var dataLen = data.length,
			preLen = me.itemToGroupList.length;
		me.groupList[i] = [];
		for (var j = preLen; j < dataLen + preLen; j++){
			me.groupList[i].push(j);
			me.itemToGroupList[j] = i;
		}
	},
	/*
	 * 生成每部分头部
	 * @param num 新词条数
	 * @param i 标识第几次添加
	 */
	appendSubIntro : function(num, i){
		var me = this,
			introContent = '<div id="addwordSubIntro' + i + '" class="addword_table_subintro">'
						 + '<span><input type="checkbox" checked="checked" '
						 + 'id="addwordIntroCheck' + i +'" /></span>'
						 + '以下<em id="addwordIntroNum' + i + '">' + num + '</em>个关键词是你第' + i + '次点击"获得更多关键词"获得的</div>';
		var ele = fc.create(introContent);
		baidu.dom.insertBefore(ele, baidu.g("addwordMoreContainer"));
	},
	/**
     * 用新数据扩充表格
     * @param {object} data 用来扩充的数据，必须与原数据一致
     * @params {string} mark 做为类名，用来标识此次添加的行（可选）
     * @public
     */
    appendRows : function(data, mark){
    	//注意函数中的me是表格ui对象,this才是主体对象
    	var me =this.target,
			dataLen = data.length,
            html = [],
            dataPre = me.datasource || [],
            dataPreLen = dataPre.length,
            i, item, field;
        
        for (i = 0; i < dataLen; i++) {
            item = data[i];
            html.push(me.getRowHtml(item, dataPreLen + i, mark));
        }
        var content = "<div>" + html.join('') + "</div>",
        	ele = fc.create("<div>" + html.join('') + "</div>");
        	
        baidu.dom.insertBefore(ele, baidu.g("addwordMoreContainer"));
    	me.datasource = me.datasource.concat(data);
    	this.selectTarget('true', '.' + mark + ' input');
    	this.enumerateCheck();
    },
    /*
     * 删除指定行
     * @param {array} index
     */
    deleteRows: function(index){
    	var me = this,
    		table = me.target,
    		len = index.length;
    	
    	for (var i = 0; i < len; i++){
    		var deleteId = baidu.g(table.getId() + "multiSelect" + index[i]).id;
    		baidu.g(table.getId() + "multiSelect" + index[i]).id = "hidden" + deleteId;
    		baidu.hide(table.getRow(index[i]));
    		me.deleteCount ++;
    		baidu.array.remove(me.groupList[me.itemToGroupList[index[i]]], index[i]);
    		if (me.groupList[me.itemToGroupList[index[i]]].length == 0){
    			if (me.itemToGroupList[index[i]] != 0){
    				baidu.dom.remove("addwordSubIntro" + me.itemToGroupList[index[i]]);
    			}
    			//baidu.array.removeAt(me.groupList, me.itemToGroupList[index[i]]);
    		}
    	}
    	for ( var j = 1; j < me.groupList.length; j++){
    		if (baidu.g("addwordIntroNum" + j)){
    			baidu.g("addwordIntroNum" + j).innerHTML = me.groupList[j].length;
    		}
		}

        // 执行删除记录后的回调
        var leftRecordNum = me.enumerateCheck();
        nirvana.util.executeCallback('onRowDel', [leftRecordNum], me);
    },
    
    /**
     * 根据类名选中部分行的checkbox
     * @param {boolean} checked 是否选中
     * @param target baidu.dom.query的首个参数，精确到input，如".append input"
     */
    selectTarget: function (checked, target) {
        var table = this.target,
        	inputs = baidu.dom.query(target, table.getBody()),
            len = inputs.length,
            i = 0,
            selectedClass = table.getClass('row-selected'),
            input, inputId, charIndex, index;
            
        for (; i < len; i++) {
        	input = inputs[i];
            inputId = input.id;
            
            index = '';
            charIndex = inputId.length - 1;
            while(/^\d$/.test(inputId.charAt(charIndex))){
            	index = inputId.charAt(charIndex) + index;
            	charIndex --;
            }
            index = parseInt(index);
            
        	input.checked = checked;
        	if (checked) {
                baidu.addClass(table.getRow(index), selectedClass);
            } else {
                baidu.removeClass(table.getRow(index), selectedClass);
            }
        }
    },
    //更新selectedIndex并执行onselect
    enumerateCheck: function(){
    	var me = this,
    		table = me.target,
    		inputsAll = table.getBody().getElementsByTagName('input'),
        	lenAll = inputsAll.length,
//        	selectAll = table.getHeadCheckbox(),
        	i = 0, index = 0, input, inputId,
        	selected = [];
        // 初始化剩下的记录数
        var leftRecordNum = 0;

        for (; i < lenAll; i++) {
            input = inputsAll[i];
            inputId = input.id;
            if (input.getAttribute('type') == 'checkbox' 
                && inputId 
                && inputId.indexOf('multiSelect') > 0) {
                	
                if (inputId.indexOf("hidden") < 0){	//为了aoPackage推词升级的表格删除功能，不得已而为 mayue
	                if (input.checked) {
	                    selected.push(index);
	                }
                    leftRecordNum ++;
	            }
                
                index ++;
            }
        }
        table.getSelectedIndex(selected);
        table.onselect(table.selectedIndex);

        return leftRecordNum;
    },
    addSubHandler: function(i){
    	var me = this;
    	
    	baidu.event.on('addwordIntroCheck' + i, "click", function(e){
    		var checked = e.target.checked;
    		me.selectTarget(checked, ".addword_append" + i + " input");
    		me.enumerateCheck();
    	});
    	baidu.array.each(baidu.dom.query(".addword_append" + i + " input"), function(item, index){
    		baidu.event.on(item, "click", function(e){
    			var items = baidu.dom.query(".addword_append" + i + " input"),
    				len = items.length,
    				count = 0;
    			for (var j = 0; j < len; j++){
    				if (items[j].checked){
    					count ++;
    				}
    			}
    			if (count < len){
    				baidu.g('addwordIntroCheck' + i).checked = false;
    			}else{
    				baidu.g('addwordIntroCheck' + i).checked = true;
    			}
    		});
    	});
    }
};

/**
 * 获取当前浏览器
 */
nirvana.getBrowser = function() {
	var browser = baidu.browser,
		client = '',
		browserList = ['ie', 'firefox', 'chrome', 'safari', 'opera'],
		i,
		tmp,
		version;
	
	for (i in browserList) {
		tmp = browserList[i];
		
		if (browser[tmp]) {
			if (tmp == 'ie') {
				version = browser[tmp] < 6 ? 6 : browser[tmp]; // 低于IE6的，都认为是IE6
				client = tmp + version;
			} else if (tmp == 'firefox') {
				version = browser[tmp] < 4 ? 3 : ''; // 低于FF4的，都认为是FF3
				client = tmp + version;
			} else {
				client = tmp;
			}
			break;
		}
	}
	
	nirvana.browser = client.toUpperCase();
	nirvana.limit = nirvana.config.NUMBER.MAX_RECORD[nirvana.browser] || nirvana.config.NUMBER.MAX_RECORD.DEFAULT;
	nirvana.limit_idea = nirvana.config.NUMBER.MAX_RECORD_IDEA[nirvana.browser] || nirvana.config.NUMBER.MAX_RECORD_IDEA.DEFAULT;
};

// 子action
nirvana.subaction = {};
