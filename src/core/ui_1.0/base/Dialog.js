/*
 * cb-web
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Dialog.js
 * desc:    对话框控件
 * author:  zhaolei,erik
 * date:    $Date: 2010/05/07 03:52:00 $
 */

/**
 * 对话框控件
 * <p>
 * <b>NOTICE:</b>建议通过{{#crossLink "ui.Dialog.factory/create"}}{{/crossLink}}方法创建对话框
 * </p>
 * @class Dialog
 * @extend ui.Base
 * @namespace ui
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置项定义如下：
 * {
 *     id:              [String],      [REQUIRED] Dialog的id属性，值为字符串，此值并不对应DOM元素的ID
 *     needMask:        [Boolean],     [OPTIONAL] 是否打开对话框时候显示遮罩层，默认true
 *     needBlurTrigger: [Boolean],     [OPTIONAL] 是否需要对话框失去焦点时隐藏，默认true，但只有needMask为
 *                                                false时候，才能生效
 *     maskType:        [String],      [OPTIONAL] 显示的遮罩的类型，目前支持两种'black'或者'white',
 *                                                具体见{{#crossLink "ui.Mask"}}{{/crossLink}}使用
 *     maskLevel:       [Number],      [OPTIONAL] 遮罩的层级，默认为1
 *     top:             [Number],      [OPTIONAL] 默认为0，显示的对话框垂直方向偏移量
 *     defaultButton:   [String],      [OPTIONAL] 默认要聚焦的按钮，默认'ok'
 *     autoFocus:       [Boolean],     [OPTIONAL] 是否默认按钮在对话框显示时候自动聚焦，默认false
 *     dragable:        [Boolean],     [OPTIONAL] 对话框是否可拖拽，默认true
 *     unresize:        [Boolean],     [OPTIONAL] 窗体大小改变时，不自动调整对话框位置，默认false
 *     width:           [Number],      [REQUIRED] 对话框的宽度,单位为px
 *     height:          [Number],      [REQUIRED] 对话框的高度,单位为px
 *     father:          [HTMLElement], [OPTIONAL] 指定对话框渲染要挂在的DOM元素节点，未指定，挂载在document.body下
 *     title:           [String],      [OPTIONAL] 对话框的标题，可以为HTML片段
 *     closeButton:     [Boolean],     [OPTIONAL] 是否显示对话框关闭按钮，默认显示
 * }
 * </pre>
 */
ui.Dialog = function (options) {
	this.needMask = true;
	this.needBlurTrigger = true;
	this.maskType = 'black';
	this.maskLevel = '1' || options.maskLevel;
    this.initOptions(options);
    this.type = 'dialog';
    this.top = this.top || 0;//Todo：出现自适应? kener
    this.defaultButton = this.defaultButton || 'ok';  //ok或者cancel，去找okBtn或者cancelBtn执行focus
    this.autoFocus = this.autoFocus || false;
    
    this.controlMap = {};
    this.resizeHandler = this.getResizeHandler();
};

ui.Dialog.prototype = {    
    /**
     * 对话框主体和尾部的html模板
     * @private
     */
    tplBF: '<div class="{1}" id="{0}"></div>',
    
    /**
     * 对话框头部的html模板
     * @private
     */
    tplHead: '<div id="{0}" class="{1}"><div id="{2}" class="{3}" onmouseover="{6}" onmouseout="{7}">{4}</div>{5}</div>',
    
    /**
     * 关闭按钮的html模板
     * @private
     */
    tplClose: '<div class="{0}" id="{1}" onclick="{2}"  onmouseover="{3}" onmouseout="{4}">&nbsp;</div>',
    
    /**
     * 显示对话框
     * @method show
     * @public
     */
    show: function () {
        var main = this.getDOM();
        if (!main) {
            this.render(); 
			main = this.getDOM();           
        }
		if (!this.unresize){
			baidu.on(window, 'resize', this.resizeHandler);
		}
		if (typeof this.dragable == 'undefined' || this.dragable){
			baidu.dom.draggable(this.getDOM(),{handler:this.getHead()})
		}        
        this.resizeHandler(); 
		if (this.needMask){
			ui.Mask.show(this.maskType, this.maskLevel);
		}else{
			if (this.needBlurTrigger && main){
				ui.util.blurTrigger(main,function(me){return function(){me.hide()}}(this));
			}
		}	
        this.isShow = true;
        if(this.autoFocus && this.defaultButton){
        	this[this.defaultButton + 'Btn'] && this[this.defaultButton + 'Btn'].setFocus();
        }
    },
    
    /**
     * 隐藏对话框
     * @method hide
     * @public
     */
    hide: function () {
        if (this.isShow) {
            baidu.un(window, 'resize', this.resizeHandler);
            var main = this.getDOM();
            main.style.left = main.style.top = "-10000px";
            ui.Mask.hide(this.maskLevel);
            this.isShow = false;
			if (this.needBlurTrigger){
				ui.util.blurTriggerStop();
			}
        }
    },
    
    /**
     * 设置对话框标题文字
     * @method setTitle
     * @param {string} html 要设置的文字，支持html
     */
    setTitle: function (html) {
        var el = baidu.g(this.getId('title'));
        if (el) {
            el.innerHTML = html;
        }
        this.title = html;
    },

    /**
     * 设置内容
     * @method setContent
     * @param {string} content 要设置的内容，支持html.
     */
    setContent: function(content){
        var body = this.getBody();
        if(body){
            body.innerHTML = content;
        }
		if (this.isShow){
			this.resizeHandler();
		}
    },

    /**
     * 设置对话框宽度
     * @method setWidth
     * @protected
     * @param {Number} width 要设置的宽度
     */
	setWidth : function(width){
		var me = this,
		    main = me.getDOM();	
		main.style.width = width + 'px';
	},
	
    /**
     * 获取页面resize的事件handler
     * 
     * @private
     * @return {Function}
     */
    getResizeHandler: function () {
        var me = this,
            page = baidu.page;
            
        return function () {
            var main = me.getDOM(),
			    visibleWidth = document.documentElement.clientWidth,
		    	visibleHeight = document.documentElement.clientHeight,
                left = parseInt((visibleWidth - main.offsetWidth) / 2), //document.body.clientWidth
                top = parseInt((visibleHeight - main.offsetHeight) / 2) - 50,
				maskLevel = me.maskLevel || 1,
				zIdx = 0; 
                
            if (left < 0) {
                left = 0;
            }
			if (top < 0) {
                top = 0;
            }
            if (maskLevel < 3){
				zIdx = (maskLevel * 200);
			}else{
				zIdx = (maskLevel * 200) + 400;
			}	
			main.style.zIndex = zIdx + 1;
            main.style.left = left + 'px';
			//console.log(visibleHeight + ' '  + main.offsetHeight + ' ' + top);
            main.style.top = page.getScrollTop() + me.top + top + 'px';
        };
    },
    /**
     * 关闭对话框，该方法会触发onclose事件
     * @method close
     * @param {String} param 用于监控时区别于其他关闭按钮，如果是通过右上角'x'关闭，就传递'x'值，否则不传递
     */
    close: function (param) {  // 增加param，用于监控时区别于其他关闭按钮
        var me = this;
        if (me.onbeforeclose) {
            me.onbeforeclose(function(param) {
                me.hide();
                me.onclose(param);
            })
        } else {
            me.hide();
            me.onclose(param);
        }
    },
    /**
     * 在关闭dialog之前，如果要做一些事情，那么可以写在这里
     * @event onbeforeclose
     * @param {}
     */
    onbeforeclose: 0,
    /**
     * 通过点击对话框右上角的'x'关闭对话框触发的事件，触发该事件时，对话框已经被隐藏（注意没有被销毁）
     * @event onclose
     * @param {Object} param 监控的数据对象，用于监控时区别于其他关闭按钮
     */
    onclose: new Function (),
        
    /**
     * 绘制对话框
     * @method render
     * @public
     */
    render: function () {
        var me = this,
            id = me.getId(),
            main;
        
        // 避免重复创建    
        if (baidu.g(id)) {
            return;
        }
        
        // 创建HTMLElement
        main = document.createElement('div');
        main.id = id;
        main.className = me.getClass();
        main.setAttribute('control', me.id);
        
        // 设置样式
        if (me.width) {
            main.style.width = me.width + 'px';
        }
        if (me.height){
            main.style.height = me.height + 'px';
        }
        main.style.left = "-10000px";
        
        // 写入结构
        main.innerHTML = me.getHeadHtml()
                       + me.getBFHtml('body')
                       + me.getBFHtml('foot');
        
        // 挂载到指定节点，不指定则挂body
		if (me.father){
			me.father.appendChild(main);
		}else{
			document.body.appendChild(main);
		}           
    },
    
    /**
     * 获取对话框头部的html
     * 
     * @private
     * @return {string}
     */
    getHeadHtml: function () {
        var me = this,
            head = 'head',
            title = 'title',
            close = 'close';
            
        return ui.format(me.tplHead,
                            me.getId(head),
                            me.getClass(head),
                            me.getId(title),
                            me.getClass(title),
                            me.title,
                            (me.closeButton === false ? '' :
                                ui.format(me.tplClose,
                                         me.getClass(close),
                                         me.getId(close),
                                         me.getStrCall('close', 'x'),  // 增加param，用于监控时区别于其他关闭按钮
                                         me.getStrCall('closeOver'),
                                         me.getStrCall('closeOut'))),
							me.getStrCall('headOver'),
							me.getStrCall('headOut'))							
    },
    
    /**
     * 获取对话框主体和腿部的html
     * 
     * @private
     * @param {string type 类型 body|foot
     * @return {string}
     */
    getBFHtml: function (type) {
        var me = this;
        return ui.format(me.tplBF,
                            me.getId(type),
                            me.getClass(type),
                            '');
    },
    
    /**
     * 获取对话框主体的dom元素
     * @method getBody
     * @public
     * @return {HTMLElement}
     */
    getBody: function () {
        return baidu.g(this.getBodyId());
    },
    
    getBodyId: function () {
        return this.getId('body');
    },
    
	/**
	 * 获取对话框头部dom元素
	 * @method getHead
	 * @return {HTMLElement}
	 */
	getHead: function () {
        return baidu.g(this.getId('head'));
    },
    /**
     * 获取对话框腿部的dom元素
     * @method getFoot
     * @public
     * @return {HTMLElement}
     */
    getFoot: function () {
        return baidu.g(this.getId('foot'));
    },
    
    /**
     * 获取对话框dom元素
     * @method getDOM
     * @public
     * @return {HTMLElement}
     */
    getDOM: function () {
        return baidu.g(this.getId());    
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
     * 鼠标移上表头的handler
     * 
     * @private
     */
    headOver: function () {
        baidu.addClass(this.getHead(), 
                       this.getClass('head_hover'));
    },
    
    /**
     * 鼠标移出表头的handler
     * 
     * @private
     */
    headOut: function () {
        baidu.removeClass(this.getHead(), 
                          this.getClass('head_hover'));
    },
	
    /**
     * 鼠标移上close按钮的handler
     * 
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
     * 释放控件
     * @method dispose
     * @protected
     */
    dispose: function () {
        baidu.un(window, 'resize', this.resizeHandler);
        var main = baidu.g(this.getId()),
            headDom =  this.getHead(),
            closeOut = this.getClose();
        //bug fix：dialog用于子action，关闭时对象没了但依然触发关闭按钮上的事件，需求在销毁前注销已绑定事件 by linzhifeng@baidu.com 2012-07-05
        if (headDom){
            headDom.onmouseover = null;
            headDom.onmouseout = null; 
        }
        if (closeOut){
            closeOut.onmouseover = null;
            closeOut.onmouseout = null; 
        }
        if (main) {
            main.innerHTML = '';
            baidu.dom.remove(main);
            main = null;
        }
    }
};

ui.Base.derive(ui.Dialog);
/**
 * 对话框通用按钮'ok'和'cancel'显示的文本定义
 * @property lang
 * @type Object
 * @final
 */
ui.Dialog.lang = {
    'ok': '确定',
    'cancel': '取消'
};

/**
 * 显示alert dialog
 * @method alert
 * @static
 * @param {Object} args alert对话框的参数
 * <pre>
 * alert对话框的参数的定义如下：
 * {
 *     type: [String], 对话框类型，默认为'warning'，当前还支持'notice'，对于其它类型，可以自定义样式
 *     title : [String], 显示标题
 *     content: [String], 显示的文字内容
 *     width: [Number], 对话框宽度，默认440
 *     forTool: [Boolean]，是否是用于工具箱的alert，区分主页面和工具箱，默认false
 *     maskType: [String]，遮罩类型，目前支持两种'black'或者'white'，默认'black', 具体见{{#crossLink "ui.Mask"}}{{/crossLink}}使用
 *     onok: [Function]  点击确定按钮的行为，默认为关闭提示框，同样这里关闭只是对对话框进行隐藏，并没有销毁。
 *                       成功返回true,失败返回false,失败不关闭对话框
 * }
 * </pre>
 */
ui.Dialog.alert = (function () {
    var isInit = false,
        isButtonInit = false,		
        dialog,		
        button,
		dialog2,
		isButtonInit2 = false,
		button2;
    
    /**
     * 获取按钮点击的处理函数
     * 
     * @private
     * @param {Function} onok 用户定义的确定按钮点击函数
     * @return {Function}
     */
    function getBtnClickHandler(eventHandler,dialog) {
        return function(){
            var isFunc = (typeof eventHandler == 'function');
            if ((isFunc && eventHandler(dialog) !== false) || !isFunc) {
                dialog.hide();
            }
        };
    }
    
    function show (args) {
        if (!args) {
            return;
        }
        
        var title = args.title || '',
            content = args.content || '',
            onok = args.onok,
            type = args.type || 'warning',
            tpl = '<div class="ui-dialog-icon ui-dialog-icon-{0}"></div><div class="ui-dialog-text">{1}</div>';
        
        if (isInit) {
			//这里应该支持alert提示框的宽度可以自定义，440是否可以做成默认值配置项？ zhouyu01
			var width = args.width ? args.width : 440;
			if (!args.forTool){
				//主页面alert
				dialog.maskType = args.maskType || dialog.maskType;
	            dialog.show();
	            dialog.setTitle(title);
				dialog.getDOM().style.width = width + "px";
	            dialog.getBody().innerHTML = ui.format(tpl, type, content);
	            
	            if (!isButtonInit) {
	                button.appendTo(dialog.getFoot());
	                isButtonInit = true;
	            }
				
	            button.onclick = getBtnClickHandler(onok,dialog);
	            button.setFocus();
			}else{
				//工具箱alert
				dialog2.maskType = args.maskType || dialog2.maskType;
	            dialog2.show();
	            dialog2.setTitle(title);
				dialog2.getDOM().style.width = width + "px";
	            dialog2.getBody().innerHTML = ui.format(tpl, type, content);
	            
	            if (!isButtonInit2) {
	                button2.appendTo(dialog2.getFoot());
	                isButtonInit2 = true;
	            }
				
	            button2.onclick = getBtnClickHandler(onok,dialog2);
	            button2.setFocus();
			}		
        }
    }
    
    show.init = function () {
        dialog = ui.util.create('Dialog', 
                                  {
                                      id:'__DialogAlert',
									  skin:'alert',
                                      //closeButton: false,
                                      title:'', 
                                      width:440,
									  maskType : 'black',
									  maskLevel : '3'
                                  });
                                  
        button = ui.util.create('Button', 
                                  {
                                      id:'__DialogAlertOk',
									  skin:'empha_22',
                                      content: ui.Dialog.lang.ok
                                  });
        //给工具箱准备的第二个Alert
		dialog2 = ui.util.create('Dialog', 
                                  {
                                      id:'__DialogAlert2',
                                      //closeButton: false,
									  skin:'alert',
                                      title:'', 
                                      width:440,
									  maskType : 'black',
									  maskLevel : '6'
                                  });
                                  
        button2 = ui.util.create('Button', 
                                  {
                                      id:'__DialogAlertOk2',
									  skin:'empha_22',
                                      content: ui.Dialog.lang.ok
                                  });
								                            
        isInit = true;
    };
    
    return show;
})();

baidu.on(window, 'load', ui.Dialog.alert.init);

/**
 * 显示confirm dialog
 * @method confirm
 * @static
 * @param {Object} args confirm对话框的参数
 * <pre>
 * confirm对话框的参数的定义如下：
 * {
 *     type: [String], 对话框类型，默认为'warning'，当前还支持'notice'，对于其它类型，可以自定义样式
 *     title : [String], 显示标题
 *     content: [String], 显示的文字内容
 *     width: [Number], 对话框宽度，默认440
 *     forTool: [Boolean]，是否是用于工具箱的alert，区分主页面和工具箱，默认false
 *     maskType: [String]，遮罩类型，目前支持两种'black'或者'white'，默认'black', 具体见{{#crossLink "ui.Mask"}}{{/crossLink}}使用
 *     defaultButton: [String], 默认聚焦的按钮，默认为ok按钮, 其有效值为'ok'或'cancel'
 *     ok_button_lang: [String], ok按钮显示的文本，默认为ui.Dialog.lang.ok
 *     cancel_button_lang: [String], cancel按钮显示的文本，默认为ui.Dialog.lang.cancel
 *     onok: [Function],  点击确定按钮的行为，默认为关闭提示框，同样这里关闭只是对对话框进行隐藏，并没有销毁。
 *                        成功返回true,失败返回false,失败不关闭对话框
 *     oncancel: [Function] 点击取消按钮的行为，默认为关闭提示框，同样这里关闭只是对对话框进行隐藏，并没有销毁。
 *                          成功返回true,失败返回false,失败不关闭对话框
 * }
 * </pre>
 */
ui.Dialog.confirm = (function () {
    var isInit = false,
        isButtonInit = false,
        oldDefault,
        dialog,
        okBtn,
        cancelBtn,
		isButtonInit2 = false,
		dialog2,
		okBtn2,
		cancelBtn2;

    
    /**
     * 获取按钮点击的处理函数
     * 
     * @private
     * @param {Function} eventHandler 用户定义的按钮点击函数
     * @return {Functioin}
     */
    function getBtnClickHandler(eventHandler,dialog) {
        return function(){
            var isFunc = (typeof eventHandler == 'function');
            if ((isFunc && eventHandler(dialog) !== false) || !isFunc) {
                dialog.hide();
            }
        };
    }
    
    function show (args) {
        if (!args) {
            return;
        }
        
        var title = args.title || '',
            content = args.content || '',
            oncancel = args.oncancel,
            type = args.type || 'warning',
            tpl = '<div class="ui-dialog-icon ui-dialog-icon-{0}"></div><div class="ui-dialog-text">{1}</div>',
            onok = args.onok;

            
        if (isInit) {
			if (!args.forTool){
				dialog.show();
				dialog.args = args;
	            dialog.setTitle(title);
	            dialog.getBody().innerHTML = ui.format(tpl, type, content);

	            if (!isButtonInit || oldDefault != args.defaultButton) {
	                var foot = dialog.getFoot();
	                //add by LeoWang(wangkemiao@baidu.com)
	                //默认选中取消按钮
	                if(oldDefault != args.defaultButton){
	                	foot.innerHTML = '';
	                }
	                if(args.defaultButton == 'cancel'){
	                	okBtn = ui.util.create('Button', 
                                {
                                    id:'__DialogConfirmOk',
                                    content:  ui.Dialog.lang.ok
                                });
                                
	                	cancelBtn = ui.util.create('Button', 
                                {
                                    id:'__DialogConfirmCancel',
									skin:'empha_22',
                                    content:  ui.Dialog.lang.cancel
                                });
	                }
	                else{
	                	okBtn = ui.util.create('Button', 
                                {
                                    id:'__DialogConfirmOk',
									skin:'empha_22',
                                    content:  ui.Dialog.lang.ok
                                });
                                
	                	cancelBtn = ui.util.create('Button', 
                                {
                                    id:'__DialogConfirmCancel',
                                    content:  ui.Dialog.lang.cancel
                                });
	                }
	                //add ended
	                okBtn.appendTo(foot);
	                cancelBtn.appendTo(foot);
	                isButtonInit = true;
	                oldDefault = args.defaultButton;
	            }
	            
	            okBtn.onclick = getBtnClickHandler(onok,dialog);
	            cancelBtn.onclick = getBtnClickHandler(oncancel,dialog);
	            
	            if(args.defaultButton == 'cancel'){
	            	cancelBtn.setFocus();
	            }
	            else{
	            	okBtn.setFocus();
	            }
	            
			}else{
				dialog2.show();
				dialog2.args = args;
	            dialog2.setTitle(title);
	            dialog2.getBody().innerHTML = ui.format(tpl, type, content);
	            
	            if (!isButtonInit2) {
	                var foot = dialog2.getFoot();
	                okBtn2.appendTo(foot);
	                cancelBtn2.appendTo(foot);
	                isButtonInit2 = true;
	            }
	            
	            okBtn2.onclick = getBtnClickHandler(onok,dialog2);
	            cancelBtn2.onclick = getBtnClickHandler(oncancel,dialog2);
	            
	            if(args.defaultButton == 'cancel'){
	            	cancelBtn2.setFocus();
	            }
	            else{
	            	okBtn2.setFocus();
	            }
	            
			}            

            //baidu.g('ctrlbutton__DialogConfirmOklabel').innerHTML = ui.Dialog.lang.ok;
            //baidu.g('ctrlbutton__DialogConfirmCancellabel').innerHTML = ui.Dialog.lang.cancel;
            //baidu.g('ctrlbutton__DialogConfirmOklabel').style.width = "40px";
            //baidu.g('ctrlbutton__DialogConfirmCancellabel').style.width = "40px";
        }
		
		// confirm支持传入按钮的问题，不传则为默认
		if (!args.forTool){
	        baidu.g('ctrlbutton__DialogConfirmOklabel').innerHTML = args['ok_button_lang'] || ui.Dialog.lang.ok;
	        baidu.g('ctrlbutton__DialogConfirmCancellabel').innerHTML = args['cancel_button_lang'] || ui.Dialog.lang.cancel;
	   	}
	   	else{
	        baidu.g('ctrlbutton__DialogConfirmOk2label').innerHTML = args['ok_button_lang'] || ui.Dialog.lang.ok;
	        baidu.g('ctrlbutton__DialogConfirmCancel2label').innerHTML = args['cancel_button_lang'] || ui.Dialog.lang.cancel;
	   	}
    }
    
    show.init = function () {
        dialog = ui.util.create('Dialog', 
                                  {
                                      id:'__DialogConfirm',
									  skin:'confirm',
                                      //closeButton: true,
                                      title:'', 
                                      width:440,
									  maskType : 'black',
									  maskLevel : '3',
									  autoFocus : true,
									  defaultButton : 'ok'
                                  });
                                  
        okBtn = ui.util.create('Button', 
                                  {
                                      id:'__DialogConfirmOk',
									  skin:'empha_22',
                                      content:  ui.Dialog.lang.ok
                                  });
                                  
        cancelBtn = ui.util.create('Button', 
                                  {
                                      id:'__DialogConfirmCancel',
                                      content:  ui.Dialog.lang.cancel
                                  });
		//给工具箱准备的第二个Confirm
		dialog2 = ui.util.create('Dialog', 
                                  {
                                      id:'__DialogConfirm2',
									  skin:'confirm',
                                      //closeButton: true,
                                      title:'', 
                                      width:440,
									  maskType : 'black',
									  maskLevel : '6'
                                  });
                                  
        okBtn2 = ui.util.create('Button', 
                                  {
                                      id:'__DialogConfirmOk2',
									  skin:'empha_22',
                                      content:  ui.Dialog.lang.ok
                                  });
                                  
        cancelBtn2 = ui.util.create('Button', 
                                  {
                                      id:'__DialogConfirmCancel2',
                                      content:  ui.Dialog.lang.cancel
                                  });
        isInit = true;
    };
    
    return show;
})();

baidu.on(window, 'load', ui.Dialog.confirm.init);

/**
 * 创建对话框的工厂
 * 
 * @class factory
 * @static
 * @namespace ui.Dialog
 */
ui.Dialog.factory = function(){
}

/**
 * 创建对话框
 * @method create
 * @public
 * @static
 * @param {string} dialog_opts 创建Dialog必须的一些参数.
 * <pre>
 * 配置项定义如下：
 * {
 *     width: [Number], 对话框宽度，默认660
 *     title: [String], 对话框标题，可以为HTML片段，默认为"DefaultDialogTitle"
 *     content: [String], 对话框要渲染的内容，可以为HTML片段，默认为"DefaultDialogContent"
 *     auto_show: [Boolean], 是否创建对话框的时候就立即显示对话框，默认true
 *     ok_button: [Boolean], 是否显示ok按钮，默认显示，如果值为false，则不显示ok按钮
 *     ok_button_lang: [String], ok按钮显示的文本信息，默认为ui.Dialog.lang.ok
 *     cancel_button: [Boolean], 是否显示cancel按钮，默认显示，如果值为false，则不显示cancel按钮
 *     cancel_button_lang: [String], cancel按钮显示的文本信息，默认为ui.Dialog.lang.cancel
 * }
 * 更多对话框参数定义，参见{{#crossLink "ui.Dialog"}}{{/crossLink}}的初始化参数配置
 * </pre>
 * @return {ui.Dialog}
 */
ui.Dialog.factory.create = function(dialog_opts){
    var ok_button, cancel_button, dialog;

    var id_suffix = (new Date).getTime().toString(36);
    var options = baidu.object.extend({
        "title" : "DefaultDialogTitle",
        "width" : 660,
        "id"    : "DefaultDialogId" + id_suffix,
        "content" : "DefaultDialogContent",
        "auto_show" : true
    }, dialog_opts || {});

    // hasValue只判断了null和undefined的，因此如果dialog_opts里面有
    // "ok_button" : false
    // 意思是忽略ok_button
    if(typeof options["ok_button"] == 'undefined' || options["ok_button"]){
        ok_button = ui.util.create("Button", {
            "id"        : "DefaultDialogOkButton" + id_suffix,
            "skin"      : "empha_22",
            "content"   : options["ok_button_lang"] || ui.Dialog.lang.ok
        });
        ok_button.onclick = function(){
            /**
             * <p>点击ok按钮触发的事件，成功返回true,失败返回false,失败不关闭对话框</p>
             * <p><b>NOTICE:</b>注意该事件只有通过<code>ui.Dialog.factory.create()</code>方法创建的对话框才有效</p>
             * 
             * @event onok
             * @for ui.Dialog
             * @return {Boolean} 
             */
			if (dialog.onok && dialog.onok() != false) {
				dialog.hide();
			}
        }
    }else{
        ok_button = options["ok_button"];
    }

    if(typeof options["cancel_button"] == 'undefined' || options["cancel_button"]){
        cancel_button = ui.util.create("Button", {
            "id"        : "DefaultDialogCancelButton" + id_suffix,
            "skin"      : "common_22",
            "content"   : options["cancel_button_lang"] || ui.Dialog.lang.cancel
        });
        cancel_button.onclick = function(){
            /**
             * <p>点击cancel按钮触发的事件，触发该事件时，对话框还未关闭，注意关闭这里只是隐藏并没有真正销毁</p>
             * <p><b>NOTICE:</b>注意该事件只有通过<code>ui.Dialog.factory.create()</code>方法创建的对话框才有效</p>
             * @event oncancel
             * @for ui.Dialog
             */
			dialog.oncancel && dialog.oncancel();
            dialog.hide();
        }
    }else{
        cancel_button = options["cancel_button"];
    }

    dialog = ui.util.create('Dialog', options);
    
    // 必须先show，然后才可以调用setTitle和setContent
    options["auto_show"] && dialog.show();
	if (ok_button){
		ok_button.appendTo(dialog.getFoot());
		dialog.okBtn = ok_button;
	}
	if (cancel_button){
		cancel_button.appendTo(dialog.getFoot());
		dialog.cancelBtn = cancel_button;
	}
    
    dialog.setTitle(options["title"]);
    dialog.setContent(options["content"]);
    
    return dialog;
}
