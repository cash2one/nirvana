/*
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Bubble.js
 * desc:    气泡控件
 * depend：  ui.util.blurTrigger/smartPosition/domHas，tangram
 * author:  linzhifeng
 * date:    2010/12/16
 * 
 * 使用说明：
 * 
 * eg：<span class='ui_bubble' bubblesource="defaultInfo">普通气泡</span>
 * 
 * 指定class为'ui_bubble'，页面中执行ui.Bubble.init()时自动寻找并初始化，也可以init中传入指定对象初始化
 * 气泡的行为控制和数据必须存储到ui.Bubble.source对象中，并在私有属性bubblesource指定对象名称
 * 默认提供三种固有行为样式：
 *     1. defaultInfo : 默认无指向，叹号图标，定位顺序2,3,4,5,6,7,8,1自动匹配，失焦隐藏，点击和鼠标悬浮延时显示，离开延时隐藏，title默认从第一个节点获取nodeValue，content为Loading；
 *     2. defaultHelp : 默认自动指向，问号图标，定位顺序1,8,4,5,2,3,6,7自动匹配，失焦隐藏，点击显示，title默认从第一个节点获取nodeValue，content为异步请求support内容回填；
 *     3. defaultTip  : 默认自动指向，无图标，定位顺序1,8,4,5,2,3,6,7自动匹配，失焦隐藏，自动显示，自动延时隐藏，带显示次数配置，title默认为"新功能new"，content为空；
 * 
 * 
 * 可以通过如下选项进行定制：
 *     1.iconClass：'className'，定义气泡触发图标
 *     2.positionList：[1,2,3,4,5,6,7,8]，共8个方向选择，根据优先级需要修改排序
 *     3.position：{left:0,top:0}，比positionList更高优先级，可以指定显示位置，如果是带指向的气泡，指定位置时可同时设置指向tailPoint:'tr/rt/rb/br/bl/lb/lt/tl'
 *     4.needBlurTrigger: true/false，如果不需要失焦隐藏，传false关闭该功能
 *     5.showByClick：true/false，点击显示，传false关闭该功能
 *     		showByClickIcon:true/false,仅仅点击气泡显示，默认该功能为关闭的，传true打开该功能
 *     6.showByOver：true/false，悬浮显示，传false关闭该功能
 *     7.showByOverInterval：500，悬浮延迟间隔，单位ms，showByOver为true时有效
 *     8.hideByOut：true/false，离开延迟关闭，传false关闭该功能
 *     9.hideByOutInterval：2000，悬浮延迟间隔，单位ms，hideByOut为true时有效
 *    10.autoShow：true/false，自动显示，传false关闭该功能    
 *    11.autoShowDelay：0，自动显示延时间隔，单位ms，autoShow为true时有效
 *    13.showTimeConfig：false/always/default/deadline/timeslot/counter/showonce/deadlinedefault，显示次数可配置，当此项为true时可通过在bubblesource或attbute中加控制参数实现定制显示，如关闭两次后不再显示，登录周期只显示一次，显示有效期等
 *        always：永远显示|default：默认登录周期关1次，关2次再也不出现
 *        deadline：结束期限|timeslot：首次查看后的周期（天）|counter：显示次数
 		  showonce : 在default的基础上加上登陆周期内只显示一次的限制
 		  deadlinedefault: 在deadline的基础上，默认登录周期关1次，关2次再也不出现 by huangkai01@baidu.com(只怪ＰＭ的特殊需求)
 *    14.title：标题区域，支持title为方法，自动执行并传入参数【节点，回调填入方法，回调匹配令牌】，可以通过此方式实现异步回调填入，详见defaultHelp
 *    15.content：内容区域，同title
 *	  16.priority : 优先级， 在有多个autoShow为true的情况下，按优先级排序显示		by shenyi01@baidu.com
 *	  17.onshow: 显示气泡触发的事件		by shenyi01@baidu.com
 *	  18:filter: 当前页面如果有filter中定义的dom的时候则不显示气泡，使用baidu.dom.query来获取， 例[#Tools_proposal.tool_show]		by shenyi01@baidu.com
 *    19:ready: 当气泡中的数据需要再次请求时，设置ready函数，这相当于一个前置函数    
 * 建议拷贝默认行为样式后定制
 */

/**
 * 气泡控件。显示的Bubble是单例的，也就是不管添加多少个Bubble只有一个Bubble浮出层会被创建，该浮出层是共用的。
 * <pre>
 * 使用说明：
 * 
 * eg：&lt;span class='ui_bubble' bubblesource="defaultInfo"&gt;普通气泡&lt;/span&gt;
 * 通过<b>bubblesource</b>属性定义Bubble的配置属性，可以通过如下方式定义:
 * ui.Bubble.source.bubblesourceValue 
 * 
 * 指定class为'ui_bubble'，页面中执行ui.Bubble.init()时自动寻找并初始化，也可以init中传入指定对象初始化
 * 气泡的行为控制和数据必须存储到ui.Bubble.source对象中，并在私有属性bubblesource指定对象名称
 * 默认提供三种固有行为样式：
 *     1. defaultInfo : 默认无指向，叹号图标，定位顺序2,3,4,5,6,7,8,1自动匹配，失焦隐藏，点击和鼠标悬浮延时显示，离开
 *                      延时隐藏，title默认从第一个节点获取nodeValue，content为Loading；
 *     2. defaultHelp : 默认自动指向，问号图标，定位顺序1,8,4,5,2,3,6,7自动匹配，失焦隐藏，点击显示，title默认从第
 *                      一个节点获取nodeValue，content为异步请求support内容回填；
 *     3. defaultTip  : 默认自动指向，无图标，定位顺序1,8,4,5,2,3,6,7自动匹配，失焦隐藏，自动显示，自动延时隐藏，带
 *                      显示次数配置，title默认为"新功能new"，content为空；
 * </pre>
 * <pre>
 * Bubble的配置定义如下：
 * {
 *     id:                 [String],          [REQUIRED] Bubble控件的Id
 *     type:               [String],          [OPTIONAL] Bubble的指向，有效值'normal', 'tail', 默认'tail'
 *     title:              [String|Function], [REQUIRED] Bubble的标题， 如果值为Function，该Function的
 *                                                       payload包含一个参数node，
 *                                                       node为添加了ui_bubble样式的DOM元素节点，
 *                                                       要求返回String，可以是HTML片段
 *     content:            [String|Function], [REQUIRED] Bubble显示的内容，如果值为Function，
 *                                                       该Function的payload包含三个参数：
 *                                                       (node, fillHandler[Function], timeStamp);
 *                                                       node同title属性说明;
 *                                                       fillHandler用于content异步获取时，
 *                                                       可以通过fillHandler回调来初始化Bubble的content:
 *                                                       fillHandler(contentStr, timeStamp);
 *                                                       timeStamp用于避免时刻差错误初始化，只需将
 *                                                       payload包含的timeStamp传入即可
 *     iconClass:          [String],          [OPTIONAL] 定义气泡触发图标, 要显示Bubble的Icon的class，
 *                                                       会在要添加Bubble的DOM元素旁边添加该Icon，
 *                                                       默认ui_bubble_icon_help, 如果要添加Bubble的
 *                                                       DOM元素的最后一个child元素节点已经包含该class，
 *                                                       不会重复添加该class
 *     showByClick:        [Boolean],         [OPTIONAL] 是否点击要显示Bubble的DOM元素才显示Bubble，默认false
 *     showByClickIcon:    [Boolean],         [OPTIONAL] 是否点击要显示Bubble的Icon（通过iconClass属性设置添加）
 *                                                       才显示Bubble，该属性只有在showByClick属性为true时才有效
 *     showByOver:         [Boolean],         [OPTIONAL] 是否鼠标悬浮时才显示Bubble，默认false
 *     showByOverInterval: [Number],          [OPTIONAL] 鼠标悬浮时显示Bubble的延时，单位为ms，默认为500，
 *                                                       只有在showByOver为true时有效
 *     hideByOutInterval:  [Number],          [OPTIONAL] 鼠标移出要显示Bubble的DOM元素或者移出Bubble元素时，
 *                                                       隐藏Bubble的延时，单位为ms，默认为2000，只有在
 *                                                       showByOver为true或hideByOut为true时有效
 *     hideByOut:          [Boolean],         [OPTIONAL] 是否鼠标移出Bubble元素时，要延时隐藏Bubble，默认false
 *     onclose:            [Function],        [OPTIONAL] 关闭Bubble触发的事件
 * 
 *     //高级
 *     positionList：       [[1,2,3,4,5,6,7,8]]，[OPTIONAL] 共8个方向选择，根据优先级需要修改排序. 如果type为'tail'，
 *                                                         默认为[1,8,4,5,2,3,6,7]；
 *                                                         如果type为'normal', 默认为[2,3,4,5,6,7,8,1]
 *     position：           [Object],           [OPTIONAL] 指定显示的Bubble的位置，比positionList优先级更高，
 *                                                        该对象的数据结果如下：
 *                                                        {
 *                                                           left: [Number|Function],
 *                                                           top: [Number|Function]
 *                                                        }
 *     tailPoint:          ['tr'|'rt'|'rb'|'br'|'bl'|'lb'|'lt'|'tl'], [OPTIONAL] 
 *                                                      如果是带指向的气泡，指定位置时可同时设置指向，默认tr
 *     needBlurTrigger:    [Boolean],        [OPTIONAL] 是否需要触发失焦隐藏Bubble，默认true
 *     showTimeConfig:     [Boolean|String], [OPTIONAL] false/always/default/deadline
 *                                                      /timeslot/counter/showonce/deadlinedefault，
 *                                                      显示次数可配置，当此项为true时可通过在bubblesource或
 *                                                      attribute中加控制参数实现定制显示，
 *                                                      如关闭两次后不再显示，登录周期只显示一次，显示有效期等
 *                                                      always：永远显示
 *                                                      default：默认登录周期关1次，关2次再也不出现
 *                                                      deadline：结束期限
 *                                                      timeslot：首次查看后的周期（天）
 *                                                      counter：显示次数
 *                                                      showonce : 在default的基础上加上登陆周期内只显示一次的限制
 *                                                      deadlinedefault: 在deadline的基础上，
 *                                                                       默认登录周期关1次，关2次再也不出现 
 *     autoShow:           [Boolean],  [OPTIONAL] 是否自动显示Bubble，默认false
 *     priority:           [Number],   [OPTIONAL] 优先级， 在有多个autoShow为true的情况下，按优先级排序显示 , 默认0
 *     bubbleClass:        [String],   [OPTIONAL] 自定义显示Bubble的样式，默认为ui_bubble_wrap
 *     noBubbleClose:      [Boolean],  [OPTIONAL] 是否不显示关闭Bubble的按钮，默认false
 *     bubblePosition:     [String],   [OPTIONAL] 显示的Bubble的position方式，有效值'fixed'，默认absolute
 *     filter:             [Array],    [OPTIONAL] 当前页面如果有filter中定义的dom的时候则不显示气泡，
 *                                                使用baidu.dom.query来获取， 
 *                                                例[#Tools_proposal.tool_show] by shenyi01@baidu.com
 *     onshow:             [Function], [OPTIONAL] 显示气泡触发的事件
 * }
 * </pre>
 * @class Bubble
 * @namespace ui
 * @static
 */
ui.Bubble = {
    /**
     * 标识要添加Bubble的class名，只读的属性
     * @property triggerClass
     * @type String
     * @default 'ui_bubble'
     * @final
     */
	triggerClass : 'ui_bubble', 	//触发Info行为的className,
	bubbleDiv : '__bubbleDiv',		//气泡外层
	bubbleClass : 'ui_bubble_wrap',
	triggerIdentity : null,			//当前显示的trigger
	autoShowQueue : [],				//自动显示的列表
	blackList : [],					//不再显示的气泡
	timerShow : 0,
	timerHide : 0,
	timeStamp : 0,
	pos : {							//trigger位置坐标
        left : 0,
        top : 0,
		right : 0,
		bottom : 0
    }, 
    source : {
        /**
         * Info的Bubble的默认配置属性，只读
         * @property defaultInfo
         * @type Object
         * @final
         * @example
         *      <span class='ui_bubble' bubblesource='defaultInfo'>&nbsp;</span>
         *      ui.Bubble.init(baidu.q('ui_bubble', contextDomElement)); 
         */
		defaultInfo : {
			type : 'normal',
			iconClass : 'ui_bubble_icon_info',
			positionList : [2,3,4,5,6,7,8,1],
			needBlurTrigger : true,
			showByClick : true,
			showByOver : true,			//鼠标悬浮延时显示
			showByOverInterval : 500,	//悬浮延时间隔
			hideByOut : true,			//鼠标离开延时显示
			hideByOutInterval : 2000,	//离开延时间隔，显示持续时间
			title : function(node){
				var ti = node.getAttribute('title');
				if (ti) {
		            return(baidu.encodeHTML(baidu.decodeHTML(ti)));
		        } else {
		            return(baidu.encodeHTML(baidu.decodeHTML(node.firstChild.nodeValue)));
		        }
			},
			content : function(node, fillHandle, timeStamp){
				return 'loading...';	        
			}			
		},
		/**
         * Help的Bubble的默认配置属性，只读
         * @property defaultHelp
         * @type Object
         * @final
         * @example
         *      <span class='ui_bubble' bubblesource='defaultHelp'>&nbsp;</span>
         *      ui.Bubble.init(baidu.q('ui_bubble', contextDomElement)); 
         */
		defaultHelp : {
			type : 'tail',
			showByClickIcon: true,
			iconClass : 'ui_bubble_icon_help',//图标为问号
			positionList : [1,8,4,5,2,3,6,7],
			needBlurTrigger : true,
			showByClick : true,
			showByOver : false,
			hideByOut : false,
			title : function(node){
				var ti = node.getAttribute('title') || node.getAttribute('bubbletitle') || node.parentNode.getAttribute('bubbletitle') || node.parentNode.getAttribute('title');
				if (ti) {
		            return(baidu.encodeHTML(baidu.decodeHTML(ti)));
		        } else {
		            return(baidu.encodeHTML(baidu.decodeHTML(node.firstChild.nodeValue)));
		        }
			},
			content : function(node, fillHandle, timeStamp){
				/*
				cfg.getNoun(USER_ID, title, {
		            callback: this.fill
		        });
		        */
				return 'loading...';	        
			}
		},
		/**
         * Tip的Bubble的默认配置属性，只读
         * @property defaultTip
         * @type Object
         * @final
         * @example
         *      <span class='ui_bubble' bubblesource='defaultTip'>&nbsp;</span>
         *      ui.Bubble.init(baidu.q('ui_bubble', contextDomElement)); 
         */
		defaultTip : {
			type : 'tail',
			iconClass : '',
			positionList : [1,8,4,5,2,3,6,7],
			needBlurTrigger : true,
			showByClick : false,
			showByOver : false,			//鼠标悬浮延时显示
			hideByOut : true,			//鼠标离开延时显示
			hideByOutInterval : 3000,	//离开延时间隔，显示持续时间
			autoShow : true,
			autoShowDelay : 0,		//显示延迟
			bubblePosition : '',   //小气泡的显示方式，absolute or fixed
			showTimeConfig : true,
			title : '新功能new',
			content : function(node, fillHandle, timeStamp){
				return '新功能上线了~~';	        
			}
		}
	},
	/**
	 * 初始化Bubble控件
	 * @method init
	 * @static
	 * @param {String|Array} specified 要添加Bubble的DOM元素，如果未指定，则将查找所有添加triggerClass的
	 *                                 DOM元素;如果传递值为字符串，必须是DOM元素ID;如果传递的值为数组，数组元素
	 *                                 必须是DOM元素;如果DOM元素未定义<b>bubblesource</b>属性，将默认使用
	 *                                 <b>defaultHelp</b>配置
	 * @example
	 *      <span class='ui_bubble' bubblesource='myBubble'>&nbsp;</span>
	 *      ui.Bubble.source['myBubble'] = {
	 *           title: 'This is the bubble title...',
	 *           ...
	 *      } 
	 *      ui.Bubble.init(baidu.q('ui_bubble', contextDomElement)); 
	 */
	init : function(specified){
		var node,
			iconClass,
			triggers,
			bubbleSource,
			div = baidu.g(ui.Bubble.bubbleDiv),
			icon = document.createElement('span');
		
		if (typeof specified == 'undefined'){
			triggers = baidu.dom.q(ui.Bubble.triggerClass);
		 } else if (typeof specified == 'string' && baidu.g(specified)){
			triggers = [baidu.g(specified)];
		 } else if (baidu.lang.isArray(specified)){	//支持数组传入对象
		 	triggers = specified;
		 }else {
			return;
		}
		
		
		//清空自动显示的队列
		ui.Bubble.autoShowQueue = [];
		//单例创建气泡层
        if (!div){
            var html = [];
            html[html.length] = '<div id="BubbleContainer" class="ui_bubble_container" >';
            html[html.length] = '<a id="BubbleClose" class="ui_bubble_close" href="javascript:void(0)" hidefocus="hidefocus">&nbsp;</a>';
            html[html.length] = '<div id="BubbleTitle" class="ui_bubble_title"></div>';
            html[html.length] = '<div id="BubbleContent"></div>'			
			html[html.length] = '</div>';
			html[html.length] = '<div id="BubbleTail">&nbsp;</div>'
            
            div = document.createElement('div');
			div.id = '__bubbleDiv';
            div.innerHTML = html.join('');
			
            document.body.appendChild(div);
			baidu.hide(div);
			baidu.g('BubbleClose').onclick = function() {
				var n = ui.Bubble.triggerIdentity,
				    bubbleSource = n.getAttribute('bubblesource');
				
				bubbleSource = ui.Bubble.source[bubbleSource] || ui.Bubble.source.defaultHelp;
				
				if (bubbleSource.showTimeConfig && n.displayControl != 'always'){
					//记录登录周期内主动关闭
					FlashStorager.set(nirvana.env.OPT_ID + n.id + '__cas__rn__', baidu.cookie.get('__cas__rn__'));
					//主动关闭+1
					var closeCounter = FlashStorager.get(nirvana.env.OPT_ID + n.id + 'closeCounter');
					if (typeof closeCounter == 'undefined'){
						closeCounter = 0;
					}
					closeCounter++;
					FlashStorager.set(nirvana.env.OPT_ID + n.id + 'closeCounter',closeCounter);
				}
				
				//添加手动点击关闭回调函数
				bubbleSource.onclose && bubbleSource.onclose();
				
	            ui.Bubble.hide();
				return false;
	        };
			baidu.g('BubbleClose').onmouseover = function() {
	            baidu.addClass(baidu.g('BubbleClose'),'ui_bubble_close_hover');
	        };
			baidu.g('BubbleClose').onmouseout = function() {
	            baidu.removeClass(baidu.g('BubbleClose'), 'ui_bubble_close_hover');
	        };
        }
		
		icon.innerHTML = '&nbsp;';

		for (var i = 0, l = triggers.length; i < l; i++) {
            node = triggers[i];
			bubbleSource = node.getAttribute('bubblesource');
			bubbleSource = ui.Bubble.source[bubbleSource] || ui.Bubble.source.defaultHelp;			
			//不管是不是autoshow，都可以定义iconClass吧
			iconClass = typeof bubbleSource.iconClass !== 'undefined' ? bubbleSource.iconClass : ui.Bubble.source.defaultHelp.iconClass;
			icon.className = iconClass;
			if (bubbleSource.autoShow){
				//ui.Bubble.triggerIdentity = node;
				//ui.Bubble.show();
				
				ui.Bubble.autoShowQueue.push(node);
				//默认为0的优先级
				bubbleSource.priority = bubbleSource.priority || 0;

			}else{
				//原Info，Help控制逻辑
				if (node.lastChild && node.lastChild.className == iconClass) { //图标已存在，不重复初始化
	                continue;
	            }
	            var clone = icon.cloneNode(true);
				node.appendChild(clone);
				
				if (bubbleSource.showByClick){
		            node.onclick = function(event) {
                        var event = event || window.event,
                            target = (event.target || event.srcElement),
                            bubble = getBubble(target, 'defaultHelp');

                        if (typeof bubbleSource.ready !== 'function') {
                            showByClick(target, bubble)();
                        } else {
                            bubbleSource.ready(showByClick(target, bubble)); 
                        }
		            }
				}
				
				//鼠标悬浮延时显示
				if (bubbleSource.showByOver){
					baidu.on(node, 'mouseover', function(event){
						var event = event || window.event,
						    target = (event.target || event.srcElement),
                            bubble = getBubble(target, 'defaultInfo');

                        if (typeof bubble.ready !== 'function') {
                            showByOver(target, bubble)();
                        } else {
                            bubble.ready(showByOver(target, bubble)); 
                        }
									
					});
					/*
					node.onmouseover=function(event){
						var event = event || window.event,
						    obj = (event.target || event.srcElement);
						while (obj.className != ui.Bubble.triggerClass){ //图标上触发
							obj = obj.parentNode;
							if (obj.nodeType == 9){
								return
							}
						}
						ui.Bubble.triggerIdentity = obj;
						clearTimeout(ui.Bubble.timerShow);
						var bubbleSource = obj.getAttribute('bubblesource'),
						    bubbleSource = ui.Bubble.source[bubbleSource] || ui.Bubble.source.defaultInfo;
							
						ui.Bubble.timerShow = setTimeout(ui.Bubble.show, bubbleSource.showByOverInterval || ui.Bubble.source.defaultInfo.showByOverInterval);				
					};
					*/
					baidu.on(node, 'mouseout', function(){
						clearTimeout(ui.Bubble.timerShow);
						clearTimeout(ui.Bubble.timerHide);
						//bug fix：无法拿到当前的bubbleSource的  by linzhifeng@baidu.com  
						var bubbleSource = ui.Bubble.triggerIdentity && ui.Bubble.triggerIdentity.getAttribute('bubblesource');
                        //上面这句难道会有用么，下面这句都覆盖掉了。。// 当然有用啊，重新开启上面代码,同时加上ui.Bubble.triggerIdentity是否有定义判断by Huiyao 2013-5-9
						bubbleSource = ui.Bubble.source[bubbleSource] || ui.Bubble.source.defaultHelp;
						ui.Bubble.timerHide = setTimeout(ui.Bubble.hide, bubbleSource.hideByOutInterval || ui.Bubble.source.defaultInfo.hideByOutInterval);
					});
					/*
					node.onmouseout=function(){
						clearTimeout(ui.Bubble.timerShow);			
					}
					*/
				}

                function showByClick(target, bubble) {
                    return function() {
                        if (bubble.showByClickIcon){
                             if(!baidu.dom.hasClass(target, bubble.iconClass)){
                                return;
                            }
                        }
                        var obj = bubble.main;

                        clearTimeout(ui.Bubble.timerShow);
                        clearTimeout(ui.Bubble.timerHide);
                        ui.Bubble.triggerIdentity = obj;				
                        var newPos = baidu.dom.getPosition(obj);
                        if ((newPos.left == ui.Bubble.pos.left)&&(newPos.top == ui.Bubble.pos.top)){	//再点击关闭
                            ui.Bubble.pos.left = -1;		//清空原纪录，下次还能打开
                        }
                        else {
                            ui.Bubble.show();
                        } 	
                        //发送监控请求
                        if (typeof(bubble.logSwitch) == "undefined" || bubble.logSwitch) {
                            var logParams = {
                                target: (node.getAttribute('bubblesource') || 'defaultHelp') + "_bubble"
                            };
                            NIRVANA_LOG.send(logParams);
                        }	
                    }
                }
                function showByOver(target, bubble) {
                    return function() {
                        
                        ui.Bubble.triggerIdentity = bubble.main;
                        clearTimeout(ui.Bubble.timerShow);
                        clearTimeout(ui.Bubble.timerHide);
                            
                        ui.Bubble.timerShow = setTimeout(ui.Bubble.show, bubble.showByOverInterval || ui.Bubble.source.defaultInfo.showByOverInterval);
                    }
                }
                /**
                 * 返回 Bubble
                 */
                function getBubble(obj, defaultBubble) {
                    while (!baidu.dom.hasClass(obj, ui.Bubble.triggerClass)) { //图标上触发
                        obj = obj.parentNode;
                        if (obj.nodeType == 9){
                            return;
                        }
                    }
                    
                    var name = obj.getAttribute('bubblesource'),
                    ret = ui.Bubble.source[name] || ui.Bubble.source[defaultBubble];
                    ret.main = obj;
                    return ret;
                }
			}
        }
        //自动显示的优先级排序
        ui.Bubble.autoShowQueue.sort(function(a, b){
        	
        	return ui.Bubble.source[a.getAttribute('bubblesource')].priority - ui.Bubble.source[b.getAttribute('bubblesource')].priority

        })
      //  console.log(ui.Bubble.autoShowQueue);
        //显示最后一个
        var len;
        if(len = ui.Bubble.autoShowQueue.length){
        	ui.Bubble.triggerIdentity = ui.Bubble.autoShowQueue[len-1];
        	ui.Bubble.show();
        }
	},
	/**
	 * 显示Bubble
	 * @method show
	 */
	show : function(){
		var	triggerIdentity = ui.Bubble.triggerIdentity;
		var	bubbleSource = triggerIdentity.getAttribute('bubblesource');
		bubbleSource = ui.Bubble.source[bubbleSource] || ui.Bubble.source.defaultHelp;

		if( ! bubbleSource.showTimeConfig){
			ui.Bubble.doShow(true);
		} else{
			//如果是autoShow的话可能会在flashStorager还没初始化完成的时候调用enableShow
			//会导致取值的错误，doShow需要写成回调函数，在enableShow里轮询判断flashStorager是否初始化完成
			// by shenyi01@baidu.com
			ui.Bubble.enableShow(triggerIdentity, function(canShow){
				//按照优先级来显示自动显示的新功能提示   by shenyi01@baidu.com
				if( ! canShow && bubbleSource.autoShow){

					ui.Bubble.autoShowQueue.pop();
					var len = ui.Bubble.autoShowQueue.length;
					if(len){
		        		
		        		ui.Bubble.triggerIdentity = ui.Bubble.autoShowQueue[len-1];
		        		ui.Bubble.show();
					}
				}
				else{
					var autoShowDelay = bubbleSource.autoShowDelay || (bubbleSource.autoShow ? 1000 : 0);
					//如果有延时的话延时显示
					setTimeout(function(){
						ui.Bubble.doShow(canShow);
					}, autoShowDelay);
				}

			});
		}
			
	},
	/**
	 * 判断可以显示后显示
	 */
	doShow : function(canShow){
		var div = baidu.g(ui.Bubble.bubbleDiv),
			triggerIdentity = ui.Bubble.triggerIdentity,
			title = baidu.g('BubbleTitle'),
			content = baidu.g('BubbleContent'),
			bubbleSourceName = ui.Bubble.triggerIdentity.getAttribute('bubblesource'),
			html = "";
		
		if( ! triggerIdentity || domHas(document.body, triggerIdentity) == -1){
			return;
		}
		var bubbleSource = ui.Bubble.source[bubbleSourceName] || ui.Bubble.source.defaultHelp;
		
		/**
		 * 有的气泡样式需要自定义啊，比如宽度要重新设置 by zhouyu
		 */
		if (bubbleSource.bubbleClass) {
			div.className = bubbleSource.bubbleClass;
		}
		else {
			div.className = ui.Bubble.bubbleClass;
		}
		/**
		 * 有的气泡不需要关闭按钮 by zhouyu
		 */
		if (bubbleSource.noBubbleClose) {
			baidu.hide('BubbleClose');
		}
		else {
			baidu.show('BubbleClose');
		}
			
		
		//判断小气泡的显示方式是fixed还是absolute。（指向工具栏的小气泡要求显示为fixed）added by huanghainan
        if (bubbleSource.bubblePosition) {
			div.style.position = bubbleSource.bubblePosition;
		}
		else {
			div.style.position = '';
		}
		
		if ( ! canShow){
			//带显示次数控制并且不可显示则直接返回
			return;
		}else{
			//filter by shenyi01@baidu.com
			//暂时解决工具箱的问题
			if(bubbleSource.filter && bubbleSource.filter.length){
				for(var i = 0; i < bubbleSource.filter.length; i++){
					if(baidu.dom.query(bubbleSource.filter[i]).length){
						return;
					}
				}
			}

			if (bubbleSource.showTimeConfig == 'timeslot'){
				//记录第一次显示的时间
				var firstTime = FlashStorager.get(nirvana.env.OPT_ID + ui.Bubble.triggerIdentity.id + 'firstTime');
				if (typeof firstTime == 'undefined'){
					FlashStorager.set(nirvana.env.OPT_ID + ui.Bubble.triggerIdentity.id + 'firstTime',new Date(nirvana.env.SERVER_TIME * 1000));
				}
			}else if (bubbleSource.showTimeConfig == 'counter'){
				//记录增加一次显示
				var showCounter = FlashStorager.get(nirvana.env.OPT_ID + triggerIdentity.id + 'showCounter');
				if (typeof showCounter == 'undefined'){
					showCounter = 0;
				}
				showCounter++;
				FlashStorager.set(nirvana.env.OPT_ID + triggerIdentity.id + 'showCounter', showCounter);
			}
			//回调onshow		by shenyi01@baidu.com
			bubbleSource.onshow && bubbleSource.onshow();
		}
		
		title.innerHTML = typeof bubbleSource.title == 'function' ? bubbleSource.title(triggerIdentity) : bubbleSource.title;		
		html = typeof bubbleSource.content == 'function' ? bubbleSource.content(triggerIdentity, ui.Bubble.fill, ++ui.Bubble.timeStamp) : bubbleSource.content;
		if(html){
			content.innerHTML = html;
			baidu.show(content);
		}else{
			baidu.hide(content);
		}
		div.style.display = 'block';
		
		ui.Bubble.position();
		
		//失焦触发		
		if (typeof bubbleSource.needBlurTrigger == 'undefined' || bubbleSource.needBlurTrigger){
			ui.util.blurTrigger(div,ui.Bubble.hide);
		}
		
		// 临时解决方法 wanghuijun
		// 这里再次执行一次position，否则第一次初始化时，bubble没有trigger节点，高度会计算有问题
		ui.Bubble.position();
		
		NIRVANA_LOG.send({
			target : 'show_bubble',
			title : (title.innerHTML || '').replace(/<[^>]+>/g, '')
		});
		//鼠标离开延时隐藏
		if (bubbleSource.hideByOut){
			div.onmouseover = function(event){
				clearTimeout(ui.Bubble.timerHide);
			};
			div.onmouseout = function(event){
				var event = event || window.event,
				    tar = event.relatedTarget  || event.toElement,
					div = baidu.g(ui.Bubble.bubbleDiv),
					obj = triggerIdentity,
					bubbleSource = obj.getAttribute('bubblesource'),
				    bubbleSource = ui.Bubble.source[bubbleSource] || ui.Bubble.source.defaultInfo;
				if (div != tar && ui.util.domHas(div,tar) != 1){
					clearTimeout(ui.Bubble.timerHide);
					ui.Bubble.timerHide = setTimeout(ui.Bubble.hide, bubbleSource.hideByOutInterval || ui.Bubble.source.defaultInfo.hideByOutInterval);
				}
			
			};
			// 这里需要先把其他延时线程清空
			clearTimeout(ui.Bubble.timerHide);
			//bug fix:不能简单就settimeout关闭气泡，如果鼠标还悬浮在目标上时不能触发 by linzhifeng@baidu.com
			var mPos = baidu.page.getMousePosition(),
			    tarPos = baidu.dom.getPosition(triggerIdentity);
			if (mPos.x > tarPos.left + triggerIdentity.offsetWidth || mPos.y < tarPos.top || mPos.y > tarPos.top + triggerIdentity.offsetHight) {
				ui.Bubble.timerHide = setTimeout(ui.Bubble.hide, bubbleSource.hideByOutInterval || ui.Bubble.source.defaultInfo.hideByOutInterval);
			}
		//	ui.Bubble.timerHide = setTimeout(ui.Bubble.hide, bubbleSource.hideByOutInterval || ui.Bubble.source.defaultInfo.hideByOutInterval);
		}
	},
	/**
	 * 隐藏Bubble
	 * @method hide
	 */
	hide : function(){
		if (!ui.Bubble.triggerIdentity){
			return;
		}
		var div = baidu.g(ui.Bubble.bubbleDiv),
			n = ui.Bubble.triggerIdentity,
			bubbleSourceName = n.getAttribute('bubblesource');
		var bubbleSource = ui.Bubble.source[bubbleSourceName] || ui.Bubble.source.defaultHelp;

		if (bubbleSource.showTimeConfig){
			//记录登录周期内自动隐藏
			//FlashStorager.set(nirvana.env.OPT_ID + n.id + '__cas__rn__'+'hide', baidu.cookie.get('__cas__rn__'));
			ui.Bubble.blackList[bubbleSourceName] = true;
		}

		div.style.display = 'none';	
		ui.Bubble.pos.left = -1;
	},
	
	/**
     * 更新Bubble显示的内容，一般用于异步获取Bubble内容时使用，见Bubble的配置属性content
     * @method fill
     * @param {Object} str 要显示的Bubble的内容
     * @param {Number} stamp 时间戳，如果传入时间戳跟当前Bubble的时间戳不一致，将不更新Bubble的内容
     */
    fill : function(str,stamp) {
        if (str && (stamp == ui.Bubble.timeStamp)) {
        	baidu.show('BubbleContent');
            baidu.g('BubbleContent').innerHTML = str;
        } else {
           return;
        }
		//再次定位浮动层
        ui.Bubble.position();
    },
	
	position : function(){
		var div = baidu.g(ui.Bubble.bubbleDiv),
		    trigger = ui.Bubble.triggerIdentity,
			bubbleSource = trigger.getAttribute('bubblesource'),
			positionList,bubbleType,tailPoint,
			visibleWidth = document.documentElement.clientWidth,
		    visibleHeight = document.documentElement.clientHeight,
			scrollTop = document.documentElement.scrollTop,
			scrollLeft = document.documentElement.scrollLeft,
			triggerWidth = trigger.offsetWidth,
			triggerHeight = trigger.offsetHeight,
			contentWidth = div.offsetWidth,
			contentHeight = div.offsetHeight;
			
		bubbleSource = ui.Bubble.source[bubbleSource] || ui.Bubble.source.defaultHelp;
		bubbleType = bubbleSource.type || 'tail';
		var tailPointClass = (bubbleType == 'normal' ? 'ui_bubble_tail_none': ('ui_bubble_tail_' + (bubbleSource.tailPoint || 'tr')));
		if (bubbleSource.position){
			//指定位置
			var pLeft = bubbleSource.position['left'],
			    pTop = bubbleSource.position['top'];
			if (typeof pLeft == 'function'){
				pLeft = pLeft(trigger);
			}
			if (typeof pTop == 'function'){
				pTop = pTop(trigger);
			}
			ui.util.smartPosition(div, {'left':pLeft,'top':pTop,'target':trigger});
			baidu.g('BubbleTail').className = tailPointClass;
			return;
		}
		
		if (bubbleSource.positionList){
			positionList = bubbleSource.positionList;
		}else{
			switch (bubbleType){
				case "normal" :
				    positionList = ui.Bubble.source.defaultInfo.positionList;
					break;
				case "tail" :
				default:
				    positionList = ui.Bubble.source.defaultHelp.positionList;
					break;
			}
		}
		
		//定位目标
		ui.Bubble.pos = baidu.dom.getPosition(trigger);
		ui.Bubble.pos.right = ui.Bubble.pos.left + triggerWidth;
		ui.Bubble.pos.bottom = ui.Bubble.pos.top + triggerHeight;
		
		//console.log(triggerWidth+' '+triggerHeight+' '+contentWidth+' '+contentHeight+' '+visibleWidth+' '+visibleHeight);
		for (var i = 0, len = positionList.length; i < len; i++){
			switch (positionList[i] + ''){
				case '1':	//上，右对齐
				    if ((ui.Bubble.pos.top - scrollTop > contentHeight) &&
					    (ui.Bubble.pos.right + contentWidth < visibleWidth)){
						if (bubbleType == 'normal') {
							ui.util.smartPosition(div, {
								'pos': 't',
								'align': 'r',
								'target': trigger
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_none';
						}
						else {
							ui.util.smartPosition(div, {
								'pos': 't',
								'align': 'r',
								'target': trigger,
								'repairT': -10,
								'repairL': -15
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_tr';
						}
						return;
					}
					break;
				case '2':	//右，上对齐
				    if ((ui.Bubble.pos.top - scrollTop + contentHeight < visibleHeight) &&
					    (ui.Bubble.pos.right + contentWidth < visibleWidth)){
						if (bubbleType == 'normal') {
							ui.util.smartPosition(div, {
								'pos': 'r',
								'align': 't',
								'target': trigger
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_none';
						}
						else {
							ui.util.smartPosition(div, {
								'pos': 'r',
								'align': 't',
								'target': trigger,
								'repairL': 10
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_rt';
						}
						return;
					}
					break;
				case '3':	//右，下对齐
				    if ((ui.Bubble.pos.bottom - scrollTop > contentHeight) &&
					    (ui.Bubble.pos.right + contentWidth < visibleWidth)){
						if (bubbleType == 'normal') {
							ui.util.smartPosition(div, {
								'pos': 'r',
								'align': 'b',
								'target': trigger
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_none';
						}
						else {
							ui.util.smartPosition(div, {
								'pos': 'r',
								'align': 'b',
								'target': trigger,
								'repairL': 10
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_rb';
						}
						return;
					}
					break;
				case '4':	//下，右对齐
				    if ((ui.Bubble.pos.bottom - scrollTop + contentHeight < visibleHeight) &&
					    (ui.Bubble.pos.right + contentWidth < visibleWidth)){
						if (bubbleType == 'normal') {
							ui.util.smartPosition(div, {
								'pos': 'b',
								'align': 'r',
								'target': trigger
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_none';
						}
						else {
							ui.util.smartPosition(div, {
								'pos': 'b',
								'align': 'r',
								'target': trigger,
								'repairT': 10,
								'repairL': -15
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_br';
						}
						return;
					}
					break;
				case '5':	//下，左对齐
				    if ((ui.Bubble.pos.bottom - scrollTop + contentHeight < visibleHeight) &&
					    (ui.Bubble.pos.left - scrollLeft > contentWidth)){
						if (bubbleType == 'normal') {
							ui.util.smartPosition(div, {
								'pos': 'b',
								'align': 'l',
								'target': trigger
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_none';
						}
						else {
							ui.util.smartPosition(div, {
								'pos': 'b',
								'align': 'l',
								'target': trigger,
								'repairT': 10,
								'repairL': 15
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_bl';
						}
						return;
					}
					break;
				case '6':	//左，下对齐
				    if ((ui.Bubble.pos.bottom - scrollTop > contentHeight) &&
					    (ui.Bubble.pos.left - scrollLeft > contentWidth)){
						if (bubbleType == 'normal') {
							ui.util.smartPosition(div, {
								'pos': 'l',
								'align': 'b',
								'target': trigger
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_none';
						}
						else {
							ui.util.smartPosition(div, {
								'pos': 'l',
								'align': 'b',
								'target': trigger,
								'repairL': -10
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_lb';
						}
						return;
					}
					break;
				case '7':	//左，上对齐
				    if ((ui.Bubble.pos.top - scrollTop + contentHeight < visibleHeight) &&
					    (ui.Bubble.pos.left - scrollLeft > contentWidth)){
						if (bubbleType == 'normal') {
							ui.util.smartPosition(div, {
								'pos': 'l',
								'align': 't',
								'target': trigger
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_none';
						}
						else {
							ui.util.smartPosition(div, {
								'pos': 'l',
								'align': 't',
								'target': trigger,
								'repairL': -10
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_lt';
						}
						return;
					}
					break;
				case '8':	//上，左对齐
				    if ((ui.Bubble.pos.top - scrollTop > contentHeight) &&
					    (ui.Bubble.pos.left - scrollLeft > contentWidth)){
						if (bubbleType == 'normal') {
							ui.util.smartPosition(div, {
								'pos': 't',
								'align': 'l',
								'target': trigger
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_none';
						}
						else {
							ui.util.smartPosition(div, {
								'pos': 't',
								'align': 'l',
								'target': trigger,
								'repairT': -10,
								'repairL': 15
							});
							baidu.g('BubbleTail').className = 'ui_bubble_tail_tl';
						}
						return;
					}
					break;
			}
		}
		//防止8个方向都无法展示
		if (bubbleType == 'normal') {
			ui.util.smartPosition(div, {
				'pos': 'r',
				'align': 't',
				'target': trigger
			});
			baidu.g('BubbleTail').className = 'ui_bubble_tail_none';
		}
		else {
			ui.util.smartPosition(div, {
				'pos': 'r',
				'align': 't',
				'target': trigger,
				'repairL': 10
			});
			baidu.g('BubbleTail').className = 'ui_bubble_tail_rt';
		}		
	},
	/**
	 * 判断是否可呈现
	 * @param {Object} tipTrigger
	 */
	enableShow : function(node, callback){
		
		FlashStorager.get(' ', function(){

			//后续补充 linzhifeng@baidu.com
			var bubbleSourceName = baidu.dom.getAttr(node,'bubblesource'),
			    displayControl,
			    canShow = true;
			var bubbleSource = ui.Bubble.source[bubbleSourceName] || ui.Bubble.source.defaultHelp;
			displayControl = baidu.dom.getAttr(node, 'showTimeConfig') || bubbleSource.showTimeConfig || 'always';
			node.displayControl = displayControl;
			
			//不再显示的bubble
			if(ui.Bubble.blackList[bubbleSourceName]){
				
				callback(false);
				return;
			}
			if (displayControl == 'always'){
				
				callback(true);
				return;
			} 
			//登录周期内关闭
			var hasClose = FlashStorager.get(nirvana.env.OPT_ID + node.id + '__cas__rn__');
			if (typeof hasClose != 'undefined' && hasClose == baidu.cookie.get('__cas__rn__')){
				canShow = false;
			}
			//关闭两次
			var closeCounter = FlashStorager.get(nirvana.env.OPT_ID + node.id + 'closeCounter');
			if (typeof closeCounter != 'undefined' && closeCounter >= 2){
				canShow = false;
			}

			if(canShow){

				switch (displayControl){
					case 'deadline':
					    var dl = baidu.dom.getAttr(node,'deadline') || bubbleSource.deadline || '';
						if (new Date(nirvana.env.SERVER_TIME * 1000) < baidu.date.parse(dl)){
							canShow = true;
						}else{
							canShow = false;
						}
						break;

					case 'deadlinedefault': //by huangkai01@baidu.com
						var dldefault = baidu.dom.getAttr(node,'deadlinedefault') || bubbleSource.deadlinedefault || '';
						canShow = (canShow && (new Date(nirvana.env.SERVER_TIME * 1000) < baidu.date.parse(dldefault)));
						break;

					case 'timeslot':
					    var firstTime = FlashStorager.get(nirvana.env.OPT_ID + node.id + 'firstTime');
						if (typeof firstTime == 'undefined'){
							canShow = true;
							break;
						}
						var ts = baidu.dom.getAttr(node,'timeslot') || bubbleSource.timeslot || 30;
						//默认30天
						if (ceil((new Date(nirvana.env.SERVER_TIME * 1000) - new Date(firstTime)) / (24*60*60*1000)) <= ts){
							canShow = true;
						}else{
							canShow = false;
						}
						break;
					case 'counter':
						var showCounter = FlashStorager.get(nirvana.env.OPT_ID + node.id + 'showCounter');
						if (typeof showCounter == 'undefined'){
							canShow = true;
							break;
						}
						var c = baidu.dom.getAttr(node,'showCounter') || bubbleSource.showCounter || 10;
						//默认10词
						if (showCounter < c){
							canShow  = true;
						}else{
							canShow = false;
						}
					    break;
				}
			}
			callback(canShow);
		})
	}
};  
