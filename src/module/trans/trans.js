/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    trans/trans.js
 * desc:    转化跟踪-尚未开通
 * author:  wangzhishou wanghuijun
 * date:    $Date: 2011/04/14 $
 */

ToolsModule.trans = new ToolsModule.Action('trans', {
    /**
     * 视图模板名，或返回视图模板名的函数
     */
    VIEW: 'trans',
    /**
     * 要保持的状态集合。“状态名/状态默认值”形式的map。
     */
    STATE_MAP: {},
    
    UI_PROP_MAP: {},
    /**
     * 初始化context的函数集合，name/value型Object。其value为Function的map，value
     * Function被调用时this指针为Action本身。value
     * Function的形参需要有一个callback参数，参数为Function类型，手工回调。
     */
    CONTEXT_INITER_MAP: {},
    
    /**
     * 视图repaint的后会触发事件
     */
    onafterrepaint: function(){},
    
    /**
     * 第一次render后执行
     */
    onafterrender: function(){
        this.bindEvent();
    },
    
    /**
     * 第一次render后执行
     */
    onentercomplete: function(){
		nirvana.trans.currentPath = 'trans';
	},
    
    /**
     * 绑定事件
     */
    bindEvent: function(){
        var me = this,
			btn = baidu.g('ToNewTrans');
        
        baidu.event.on(btn, 'click', function(e){
            e = e || window.event;
            baidu.event.preventDefault(e);
            
            me.toNewTrans();
        });
		
		// 开通转化跟踪
        ui.util.get('AcceptTrans').onclick = me.signContract();
    },
	
	/**
	 * 开通转化
	 */
	signContract : function() {
		var me = this;
		
		return function(){
			fbs.trans.signContract({
				onSuccess: function(response){
					if (response.data) { // 已开通百度统计，直接进入列表页面
						nirvana.trans.isInstall = true;
						
						// 直接跳转到新增转化页面，不再倒数
						me.toNewTrans();
						//me.showTransStep("TransCreated");
						//baidu.dom.hide('TransStep1');
					}
				},
				onFail: function(){
					ajaxFailDialog();
				}
			});
		};
	},
    
    /**
     * Ajax方式检测是否开通百度统计
    ajaxCheck: function(){
        var me = this;
        
        fbs.trans.signContract({
            onSuccess: function(response){
                if (response.data) { // 已开通百度统计，直接进入列表页面
                    nirvana.trans.isInstall = true;
					me.toTransList();
                } else { // 未开通百度统计，进入合同页面
                    me.startTransReg('TransStep1');
                }
            },
            onFail: function(){
                ajaxFailDialog();
            }
        });
    },
     */
    
    /**
     * 显示转化跟踪工具已开通业务层
     */
    showTransStep: function(id){
        baidu.g(id).style.display = "block";
        this.showCountdown(id);
    },
	
    /**
     * 倒计时提示
     */
    showCountdown: function(id){
        var me = this,
			container = baidu.g(id),
			tip = container.getElementsByTagName('b')[0];
        
		// 倒数计时
		me.showCount = 0;
		
		// 直接跳转到新增转化页面，不再倒数
		me.toNewTrans();
		
		return;
		
		/**
        me.timer = setInterval(function(){
            me.showCount--;
            if (me.showCount <= 0) {
				// 跳转到新增转化页面
                me.toNewTrans();
            }
            if (tip) {
                tip.innerHTML = me.showCount;
            }
        }, 1000);
        */
    },
    
    /**
     * 跳转到新增转化
     */
	toNewTrans : function() {
		var me = this;
		
		// 停止计时，避免多次跳转
		clearInterval(me.timer);
		
		if (baidu.dom.hasClass('Tools_trans', 'tool_show')) { // 转化工具显示时，跳转到新增转化
			me.redirect('/tools/newtrans', {});
		}
	}
});
