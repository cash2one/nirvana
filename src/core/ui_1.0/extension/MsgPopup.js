/**
 * 消息弹窗
 *  options结构：
 *  {
 *  	"title":""//标题
 *  	"content":[{"html":"","typeid":12}]//内容，数组结构，包含每条消息的html和typeid
 *  	"onclose":func//关闭回调
 *  }
 * @author zhouyu01
 */
ui.MsgPopup = function(options){
	var me = this;
	me.type = "MsgPopup";
	me.initOptions(options);
	me.title = me.title || "";
	me.content = me.content || [];
	
	me.autoSwitch = me.autoSwitch || true;//是否有自动切换
	me.autoInterval = me.autoInterval || 5000;//5s自动切换消息
	me.closeInterval = me.closeInterval || 20000;//20s自动关闭
	me.reposInterval = 100;//自动监测当前path，用于调整弹窗定位
};


/**
 * 扩展原型
 */
ui.MsgPopup.prototype = {	
    tplHead: '<div id="{0}" class="{1}"><div id="{2}" class="{3}">{4}({6})</div>{5}</div>',
    tplClose: '<div class="{0}" id="{1}" onclick="{2}" onmouseover="{3}" onmouseout="{4}">&nbsp;</div>',
	tplBody: '<div id="{0}" class="{1}"><div id="{2}" class="{3}">{4}</div></div>',
    tplFoot: '<div id="{0}" class="{1}">{2}</div>',
	/**
	 * 打开消息弹窗
	 */
	render: function(){
		var me = this;
		me.init();
		me.resetContent();
		if (!me.main) { //DOM节点不存在，则进行新建
			me.main = baidu.dom.create("div", {
				"id": me.id
			});
			baidu.addClass(me.main, me.getClass('container'));
			//在这里，为了在ie下能够实现被工具栏挡住的效果，需要调整位置
			baidu.dom.insertBefore(me.main, baidu.dom.g("Toolbar"));
			me.repaintMain();
		//	me.bind();//绑定事件	
		}
		else {
			me.repaintMain();
		}
		me.show();//打开
	},
		
	/**
	 * 初始化变量
	 * @param {Object} options
	 */
	init: function(){
		var me = this;
		me.current = 0;
		if (me.content.length > 1) {
			//是否所有消息都显示过一遍
			me.setMsgReadAll(false);
		}
		else {
			me.setMsgReadAll(true);
		}
		
		/*********************以下用于监控*************/
		//用于监控消息展示次数的变量
		me.showMapping = {};
		var content = me.content;
		for (var i = 0, len = content.length; i < len; i++) {
			me.showMapping[content[i].typeid] = false;
		}
		/*********************以上用于监控*************/
		
	},
	
	/**
	 * 设置要显示的内容顺序
	 */
	resetContent: function(){
		var me = this;
		var len = me.content.length;
		me.showContent = baidu.object.clone(me.content);
		if (len > 1) {
			//所有消息看过一遍后再显示一遍第一条消息
			me.showContent[len] = me.showContent[0];
		}
	},
	
	/**
	 * 切换链接
	 */
	getFootTpl: function(){
		var me = this;
		var total = me.showContent.length;
		var cur = me.current;
		var pre = '<ul><li class="previous">上一条</li><li>|</li><li class="gray">下一条</li></ul>';
		var next = '<ul><li class="gray">上一条</li><li>|</li><li class="next">下一条</li></ul>';
		var preAndNext = '<ul><li class="previous">上一条</li><li>|</li><li class="next">下一条</li></ul>';
		if (total <= 1) {
			return "";
		}
		if (cur == 0) {
			return next;
		}
		if (total - 1 == cur) {
			this.setMsgReadAll(true);
			return next;
		}
		if (total - 2 == cur) {
			return pre;
		}
		return preAndNext;
	},
	
	/**
	 * 设置状态标志是否所有消息都已展现过
	 * @param {Object} stat	
	 */
	setMsgReadAll: function(stat){
		var me = this;
		me.MsgReadAll = stat || false;
		//若所有消息都已展现过则清除switch任务，设置close任务
		if (stat) {
			me.clearTaskSwitch();
			me.setTaskClose();
		}
	},
	
	/**
	 * 获取读取状态
	 */
	getMsgReadAll: function(){
		return this.MsgReadAll;
	},

	
	/**
	 * 设置弹窗内容
	 */
	repaintMain: function(){
		var me = this;
		var total = me.showContent.length;
		//设置当前显示的内容
		if (total > 0 && me.current < total) {
			var curmsg = me.showContent[me.current];
			me.set("content", curmsg["html"]);//body html
			me.set("foot", me.getFootTpl());//foot html
			me.main.innerHTML = me.getMainHtml();
			me.showMapping[curmsg["typeid"]] = true;
			me.bind();//绑定事件	
		}
		else {
			me.hide();
		}
	},

	/**
	 * 获取主HTML代码
	 */
	getMainHtml: function () {
        var me = this;
            
        return me.getHeadHtml()
        		+ me.getBodyHtml()
        		+ me.getFootHtml();
    },
	
	/**
     * 获取头部的html
     */
	getHeadHtml : function(){
    	var me = this;
		var cur = me.current + 1;
		var total = me.content.length;
		if(cur > total){
			cur %= total;
		}
        return ui.format(me.tplHead,
	                        me.getId('head'),
	                        me.getClass('head'),
	                        me.getId('title'),
	                        me.getClass('title'),
	                        me.title,
	                        me.getCloseHtml(),
							cur + "/" + total
						);
    },
	
    /**
     * 获取关闭按钮的html
     */
    getCloseHtml : function(){
    	var me = this;
    	return ui.format(me.tplClose,
                     me.getClass('close'),
                     me.getId('close'),
                     me.getStrCall('closeClickHandler'),
                     me.getStrCall('closeOver'),
                     me.getStrCall('closeOut')
					);
    },


	/**
     * 获取主体的html
     */
    
    getBodyHtml : function(){
    	var me = this;
        return ui.format(me.tplBody,
	                        me.getId('body'),
	                        me.getClass('body'),
	                        me.getId('content'),
	                        me.getClass('content'),
	                        me.get('content') || ''
						);
    },
    
    /**
     * 获取脚部的html
     */
    getFootHtml : function(){
    	var me = this;
        return ui.format(me.tplFoot,
	                        me.getId('foot'),
	                        me.getClass('foot'),
	                        me.get('foot') || ''
						);
    },
	
	/**
	 * 获取弹窗头部dom元素
     * @method getHead
     * @public
     * @return {HTMLElement}
	 */
	getHead: function () {
        return baidu.g(this.getId('head'));
    },
    
    /**
     * 获取弹窗主体的dom元素
     * @method getBody
     * @public
     * @return {HTMLElement}
     */
    getBody: function () {
        return baidu.g(this.getId('body'));
    },

    /**
     * 获取弹窗脚部的dom元素
     * @method getFoot
     * @public
     * @return {HTMLElement}
     */
    getFoot: function () {
        return baidu.g(this.getId('foot'));
    },
    
    /**
     * 获取close按钮元素
     * 
     * @private
     * @return {HTMLElement}
     */
    getClose: function () {
        return baidu.g(this.getId('close'));
    },
	
	
	/**
	 * 点击close按钮关闭
	 */
	closeClickHandler : function(){
		this.hide();
		//监控
		
		
	},
	
	/**
     * 鼠标移上close按钮的handler
     * @private
     */
    closeOver: function () {
        baidu.addClass(this.getClose(), 
                       this.getClass('close_hover'));
    },
    
    /**
     * 鼠标移出close按钮的handler
     * 
     * @private
     */
    closeOut: function () {
        baidu.removeClass(this.getClose(), 
                          this.getClass('close_hover'));
    },
	
	/**
	 * 绑定事件
	 */
	bind: function(){
		//翻看上一条、下一条
		this.getFoot().onclick = this.switchHandler.bind(this);
		//鼠标移进移出
		this.main.onmouseover = this.clearTask.bind(this);
		this.main.onmouseout = this.mouseOutHander.bind(this);
	},
	
	/**
	 * 翻看事件
	 */
	switchHandler: function(event){
		var me = this;
		var event = event || window.event;
		var target = event.target || event.srcElement;
		if (target && target.tagName.toLowerCase() == "li") {
			if (baidu.dom.hasClass(target, "previous")) {
				me.doSwitch(-1);//上一条
			//	me.resetTask();
			}
			if (baidu.dom.hasClass(target, "next")) {
				me.doSwitch(1);//下一条
			//	me.resetTask();
			}
		}
	},
	
	
	/**
	 * 鼠标移出，进入下一条
	 * @param {Object} e
	 */
	mouseOutHander: function(e){
		var me = this;
		var e = e || window.event;
		var relatedTarget = e.relatedTarget || e.toElement;
		if (relatedTarget 
			&& !(baidu.dom.contains(me.main, relatedTarget))
			&& me.main != relatedTarget) {
			me.resetTask();
		}
		e && baidu.event.preventDefault(e);
	},
	
	/**
	 * 切换动作
	 * @param {Object} diff	切换消息差
	 */
	doSwitch: function(diff){
		diff = parseInt(diff || 0);
		var total = this.showContent.length;
		var cur = this.current;
		cur += diff;
		if(cur == total){
			cur = 1;
		}
		this.current = cur;
		this.repaintMain();
	},
	

	/**
	 * 获取某个成员变量的值
	 * @param {Object} attr
	 */
	get: function(attr){
		return this['_' + attr];
	},
	

	/**
	 * 设置某个成员变量的值
	 * @param {Object} attr
	 * @param {Object} value
	 */
	set: function(attr, value){
		this['_' + attr] = value;
	},
	
	/**
	 * 清除任务
	 */
	clearTask: function(){
		this.clearTaskSwitch();
		this.clearTaskClose();
	},
	
	/**
	 * 重置任务
	 */
	resetTask: function(){
		var me = this;
		var stat = me.getMsgReadAll();
		var total = me.content.length;
		//先清除所有任务
		me.clearTask();
		if (total == 0) {//如果没有消息了，则隐藏弹窗
			me.hide();
			return;
		}
		//若所有消息都展现过 或者消息只剩下一条，则设置关闭任务；否则设置切换任务
		if (stat || total == 1) {
			me.setTaskClose();
		}
		else {
			me.setTaskSwitch();
		}
	},
	
	/**
	 * 删除当前消息
	 */
	removeCurMsg: function(){
		var me = this;
		var len = me.content.length;
		//如果查看的是显示的最后一条消息（即第一条消息，则要重设index为0）
		var index = me.current < len ? me.current : 0;
		baidu.array.removeAt(me.content, index);
		//若删除消息后，发现current大于len，表示删除的是最后一条消息，要重设current值
		len = me.content.length;
		me.current = me.current <= len ? me.current : len - 1;
		//重设任务
		me.resetTask();
		if (len > 0) {
			me.resetContent();
			me.repaintMain();
		}
	},
	

	
	/**
	 * 设置任务，自动切换到下一条
	 */
	setTaskSwitch: function(){
		var me = this;
		if(me.autoSwitch && !me.taskSwitch){
			me.taskSwitch = setInterval(function(){
				me.doSwitch(1);
			}, me.autoInterval);
		}
	},
	
	/**
	 * 设置任务，自动关闭弹窗
	 */
	setTaskClose: function(){
		var me = this;
		if (me.autoSwitch && !me.taskClose) {
			me.taskClose = setInterval(me.hide.bind(me), 
											me.closeInterval);
		}
	},
	
	
	
	/**
	 * 清除任务:自动切换到下一条
	 */
	clearTaskSwitch: function(){
		var me = this;
		if (me.taskSwitch) {
			clearInterval(me.taskSwitch);
			me.taskSwitch = null;
		}
	},
	
	/**
	 * 清除任务:自动关闭弹窗
	 */
	clearTaskClose: function(){
		var me = this;
		if (me.taskClose) {
			clearInterval(me.taskClose);
			me.taskClose = null;
		}
	},


	
	/**
	 * 显示弹窗
	 */
	show: function(){
		var me = this;
		if (!me.taskReposition) {
			me.taskReposition = setInterval(me.reposition.bind(me), me.reposInterval);
		}
		baidu.fx.expand(me.main, {
			duration: 900,
			interval: 5,
			onafterfinish: function(){
				me.resetTask();
			}
		});
	},
	
	/**
	 * 重新定位bottom
	 */
	reposition: function(){
		baidu.dom.setStyle(this.main, 'bottom', 
							location.href.indexOf('#/manage') > -1 ? 36 : 2);
	},
	
	/**
	 * 清除任务:重新定位bottom
	 */
	clearTaskReposition: function(){
		var me = this;
		if (me.taskReposition) {
			clearInterval(me.taskReposition);
			me.taskReposition = null;
		}
	},

	
	
	/**
	 * 隐藏弹窗
	 */
	hide : function(){
		this.clearTask();
		
		this.clearTaskReposition();
		
		//监控
		for(var item in this.showMapping){
			if (this.showMapping[item]) {
				NIRVANA_LOG.send({
					target: "miptMsgShowed",
					typeid: item
				});
			}
		}
	//	baidu.hide(this.main);
	//	收起效果
	  	baidu.fx.collapse(this.main, {
			duration: 900,
			interval: 5
		});
		
		this.onclose && this.onclose();
	}
};


ui.Base.derive(ui.MsgPopup);