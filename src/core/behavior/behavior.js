/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * desc:    用户行为监控类
 * author:  zhouyu01@baidu.com
 * date:    2011/4/14
 */

NIRVANA_LOG = {
	baseParams: {},//基本参数，useri和path
	
	otherParams : {},//其他参数，主要是queryMap
		
	//记录进入每个页面的时间
	//主action和工具箱的进入和退出不是严格按“进入——退出——进入——退出”的顺序来的，可能存在“进入——进入——退出——退出”的顺序
	//所以以path为key记录每个页面的entertime
	enterPageTime: {},
	
	lastTarget : "",		//记录上一个操作，用于串联用户行为 by linzhifeng@baidu.com 2012-04-25
	ubIndex : 0,			//纯用户操作序号，用于串联用户行为 by linzhifeng@baidu.com 2012-04-25
	
	/**
	 * ajax性能监控
	 * @author linzhifeng@baidu.com 
	 */
	ajaxRecordIndex : 0,			//ajax记录索引
	ajaxRecordStartTime : {},		//记录ajax请求起始时间
	ajaxRecordPool : [],    		//记录已完成的ajax请求时间，为了避免频繁发送，才用缓存池压缩传输
	ajaxRecordPoolSize : 20,		//默认缓冲池大小
	//每个ajax发送请求前记录起始时间
	ajaxMark : function(path){
		var me = NIRVANA_LOG,
		    idx = ++me.ajaxRecordIndex;
		    
		me.ajaxRecordStartTime[idx] = {
			path:path || fbs.config.path.ADV_PATH,
			time:new Date()
		}
		return idx;
	},
	//每个ajax成功返回后记录结束数据并压入缓冲池中，达到缓冲池大小或idx指定为0时发出监控数据
	ajaxLog : function(idx){
		var me = NIRVANA_LOG,
			record = me.ajaxRecordStartTime[idx];
		if (record){
			record.time = new Date() - record.time;
			//大于超时阀值的请求已经发送超时记录了，超大数值会成为噪音， by linzhifeng@baidu.com 2012-12-18
			if (record.time < fbs.config.ajaxTimeout) {
			    me.ajaxRecordPool.push(record.path + ':' + record.time);
			}
			delete me.ajaxRecordStartTime[idx];
		}
		
		//缓冲池大小
		if (me.ajaxRecordPool.length > me.ajaxRecordPoolSize || 
		    (idx === 0 && me.ajaxRecordPool.length > 0)) //页面离开时把剩下的都发出去
		   {
			var ajaxLogParams = {},
			    baseParams = me.baseParams;
			ajaxLogParams.userid = baseParams.userid;
			ajaxLogParams.optid = baseParams.optid;
			ajaxLogParams.token = baseParams.token;
			ajaxLogParams.path = baseParams.path;
			ajaxLogParams.target = "ajaxLog";
			ajaxLogParams.nav = UEManager.getUe().nav;
			ajaxLogParams.ajaxRecord = me.ajaxRecordPool.join('|');
			me.request(me.path, ajaxLogParams);
			//console.log(ajaxLogParams)
			me.ajaxRecordPool = [];
		}
	},
	
	path: nirvana.config.LOG_REQUEST_PATH,
	
	/**
	 * 初始化基本参数
	 * @param {Object} param
	 */
	init: function(param){
		var me = this;
		me.baseParams = {};	//基本参数在每次页面“刷新”时要先清空，以免带入脏数据
		if(typeof param == 'object' && param){	//防止param为Null
			for(var item in param){
				me.baseParams[item] = param[item] || "";
			}
		}
		else {
			me.baseParams.userid = "";
			me.baseParams.optid = "";
			me.baseParams.path = "";
			me.baseParams.token = "";
		}
	},
	
	/**
	 * 设置其他参数
	 * @param {Object} param
	 */
	setOtherParam: function(param){
		var me = this;
		me.otherParams = {};	//每次设置前要先清空，以免带入脏数据
		if(typeof param == 'object' && param){	//防止param为Null
			for(var item in param){
				me.otherParams[item] = param[item] || "";
			}
		}
	},
	
	
	/**
	 * 发送监控请求
	 * @param {Object} param
	 */
	send: function(param){
		var me = this,
			sendParams = {},
			item;
		//基本参数
		for(var item in me.baseParams){
			sendParams[item] = (typeof me.baseParams[item] == "function") ? me.baseParams[item]() : me.baseParams[item];
		}
		
		//queryMap参数
		for(var item in me.otherParams){
			if (item) {//参数可能为空
				sendParams[item] = (typeof me.otherParams[item] == "function") ? me.otherParams[item]() : me.otherParams[item];
			}
		}
		
		if (typeof param == 'object' && param) { //防止param为Null
			for (var item in param) {
				sendParams[item] = (typeof param[item] == "function") ? param[item]() : param[item];
			}
		}
		
		//记录上一个操作，用于串联用户行为 by linzhifeng@baidu.com 2012-04-25
		sendParams.lastTarget = me.lastTarget;
		me.lastTarget = sendParams.target || sendParams.fn || me.lastTarget;
		
		//console.log(baidu.json.stringify(sendParams));
		//发送请求
		//临时注释掉 by KR追赶版
		me.request(me.path, sendParams);
	},
	
	/**
	 * 通过读取行为对象的data-log属性发送监控请求
	 */
	sendDataLog: function(){
		var me = this;
		return function(e){
			var e = e || window.event, eventType = e.type, element = e.target || e.srcElement, param = "";
			while (element && element.nodeType != 9) { //上溯到HTML对象
				//	param = baidu.dom.getAttr(element, 'data-log');//账户树中重写了对象的nodeType属性，导致不能使用baidu.g,以及调用过baidu.g的其他函数
				param = element.getAttribute('data-log');
				if (param) {
					//	if (!baidu.dom.hasAttr(element, 'logSwitch') || 
					//		baidu.dom.getAttr(element, 'logSwitch').toString() == "true") { 
					if (!element.attributes.getNamedItem('logSwitch') || //针对非UI，没有定义logSwitch
					element.getAttribute('logSwitch').toString() == "true") { //针对UI，logSwitch为true(label,button,textInput),
						//在IE下得到的logSwitch为boolean类型，在FF下得到的是String类型
						if (eventType == "keypress" && element.tagName == "INPUT") { //忽略input输入行为
							return;
						}
						else {
							eval('var param =' + param);
							if (typeof param == 'function') {
								param = param();
							}
							param.eventType = eventType;
							param.logType = 'UBC'; //User Behavior Capture
							param.ubIndex = me.ubIndex++;
							me.send(param);
							break;
						}
					}
				}
				element = element.parentNode;
			}
		}
	},
	
	/**
	 * 进入页面时发送enter监控请求
	 */
	sendEnterLog: function(){
		var me = this,
			enterParams = {};
		
		enterParams.userid = me.baseParams.userid;
		enterParams.optid = me.baseParams.optid;
		enterParams.token = me.baseParams.token;
		enterParams.path = me.baseParams.path;
		enterParams.target = "page_enter";
		me.enterPageTime[me.baseParams.path] = (new Date()).getTime();
		enterParams.enterTime = me.enterPageTime[me.baseParams.path];
		
		me.request(me.path, enterParams);
	},
	
	
	/**
	 * 离开页面时发送exit监控请求
	 */
	sendUnloadLog: function(){
		var me = this,
			exitParams = {},
			exitTime = (new Date()).getTime();
		
		exitParams.userid = me.baseParams.userid;
		exitParams.optid = me.baseParams.optid;
		exitParams.token = me.baseParams.token;
		exitParams.path = me.baseParams.path;
		exitParams.target = "page_exit";
		exitParams.exitTime = exitTime;
		exitParams.duration = exitTime - me.enterPageTime[me.baseParams.path];
		
		me.request(me.path, exitParams);
	},
	
	/**
	 * 性能监控
	 * @author linzhifeng@baidu.com 
	 */
	sendTimingLog : function(){
		var me = this,
			baseParams = me.baseParams,
			timingParams = {};
	
		timingParams.userid = baseParams.userid;
		timingParams.optid = baseParams.optid;
		timingParams.token = baseParams.token;
		timingParams.path = baseParams.path;
		timingParams.target = "timing";
		PR.tc3 = PR.tc3 - PR.tc0;//onload
		PR.tc2 = PR.tc2 - PR.tc1;//JS下载&初始化时间
		PR.tc1 = PR.tc1 - PR.tc0;//头部资源下载时间
		timingParams.performanceRecord = baidu.json.stringify(PR);
		if (window.performance && window.performance.timing){
			/**
			 * HTML5 performance API 草案
	 		 * http://w3c-test.org/webperf/specs/NavigationTiming/
	 		 * 对支持该草案的浏览器呢发送timing监控
	 		 * 目前,IE9+和 chrome11+,Firefox7+已经实现了该草案定义的接口 
	 		 * 兼容ie，直接baidu.json.stringify(window.performance.timing)会出错，需要自己序列化
			 */
			var key;
			timingParams.timingRecord = {};
			for (key in window.performance.timing){
				timingParams.timingRecord[key] = window.performance.timing[key];
			}
			timingParams.timingRecord = baidu.json.stringify(timingParams.timingRecord);
		}
		timingParams.nav = UEManager.getUe().nav;
		me.request(me.path, timingParams);
	},
	
	/**
	 * 跨域请求，在iframe中构建form表单提交
	 * @param {Object} path		请求图片的地址
	 * @param {Object} params	请求参数
	 */
	request: function(path, params){
		var ifr = baidu.dom.create("iframe"), frm;
		baidu.dom.setStyles(ifr, {
			'position' : 'absolute',
			'left' : '-10000px',
			'top' : '-10000px'
		});
		//ifr.src="about:blank";
		document.body.appendChild(ifr);
		var win = ifr.contentWindow || ifr; //获取iframe的window对象
		var idom = win.document;//获取iframe的document对象
		var html = '<form id="f" action="' + path + '" method="POST">';
		for (var item in params) {
			html += '<input type="hidden" name="' + item + '" value="' + encodeURIComponent(params[item]) + '"/>';
		}
		html += '</form>';
		idom.open();
		idom.write(html);
		idom.close();
		frm = idom.getElementById('f');
		frm.submit();
		// Modified by Wu Huiyao: 这里用baidu.on，没有对其baidu.un造成内存泄露，为了方便直接用下面方式绑定事件
		/*baidu.on(ifr, 'load', function(){
			setTimeout(function(){baidu.dom.remove(ifr)},100);
		});*/
		ifr.onload = function(){
			setTimeout(function(){baidu.dom.remove(ifr)},100);
		};
	}
}

