/*
 * esui (ECOM Simple UI)
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/ui.js
 * desc:    ui控件基础
 * author:  erik
 * date:    $Date: 2010/05/10 04:02:33 $
 */

/**
 * 声明ui namespace
 */
var ui = {};

ui.format = function (source, opts) {
    source = String(source);
    
    if ('undefined' != typeof opts) {
        if ('[object Object]' == Object.prototype.toString.call(opts)) {
            return source.replace(/\$\{(.+?)\}/g,
                function (match, key) {
                    var replacer = opts[key];
                    if ('function' == typeof replacer) {
                        replacer = replacer(key);
                    }
                    return ('undefined' == typeof replacer ? '' : replacer);
                });
        } else {
            var data = Array.prototype.slice.call(arguments, 1),
                len = data.length;
            return source.replace(/\{(\d+)\}/g,
                function (match, index) {
                    index = parseInt(index, 10);
                    return (index >= len ? match : data[index]);
                });
        }
    }
    
    return source;
};
    
/**
 * UI组件功能库
 */
ui.util = function () {
    var container = {},
        componentMap = {},
		blurCheckTimer = 0,
		blurTarget,
		blurHandler;
    
    /**
     * 初始化控件渲染
     * 
     * @public
     * @param {HTMLElement} wrap 渲染的区域容器元素
     * @param {Object} propMap 控件附加属性值
     * @param {string} privateContextId 私有context环境的id
     * @return {Object} 控件集合
     */
    function init(wrap, propMap, privateContextId, opt_attrReplacer) {
        propMap = propMap || {};
        
        // 容器为空的判断
        wrap = wrap || document.body;
        
        var elements = wrap.getElementsByTagName('*'),
            realEls = [],
            attrs, attrStr, attrArr, attrArrLen, 
            attr, attrValue, attrItem, extraAttrMap,
            i, len, key, el, uis = {},
			dataName, dataControl = {},
            refer, attrSegment;
        
        // 把dom元素存储到临时数组中
        // 控件渲染的过程会导致elements的改变
        for (i = 0, len = elements.length; i < len; i++) {
            realEls.push(elements[i]);
        }
        
        // 循环解析自定义的ui属性并渲染控件
        // <div ui="type:UIType;id:uiId;..."></div>
        for (i = 0, len = realEls.length; i < len; i++) {
            el = realEls[i];
            attrStr = el.getAttribute('ui');
            
            if (attrStr) {
                // 解析ui属性
                attrs = {};
                attrArr = attrStr.split(';');
                attrArrLen = attrArr.length;
                refer = [];
                while (attrArrLen--) {
                    // 判断属性是否为空
                    attrItem = attrArr[attrArrLen];
                    if (!attrItem) {
                        continue;
                    } 
                    
                    // 获取属性
                    attrSegment = attrItem.split(':');
                    attr = attrSegment[0];
                    attrValue = attrSegment[1];
                    attrs[attr] = attrValue;
                }
                
                // 创建并渲染控件
                var objId = attrs['id'];
                if (objId) {
                    extraAttrMap = propMap[objId];
                    // 将附加属性注入
                    for (key in extraAttrMap) {
                        attrs[key] = attrs[key] || extraAttrMap[key];
                    }
                    
                    // 解析引用属性
                    for (key in attrs) {
                        attrValue = attrs[key];
                        if (typeof attrValue == 'string' && attrValue.indexOf('*') === 0) {
							dataName = attrValue.substr(1);
							
							// 存储数据的控件引用
							!dataControl[dataName] && (dataControl[dataName] = []);
							dataControl[dataName].push(objId + ':' + key);
							
							refer.push(key + ':' + attrValue);
							attrValue = er.context.get(dataName, privateContextId);
							
						}
                        attrs[key] = attrValue;

                    }
                    
                    // 渲染控件
                    uis[objId] = create(attrs['type'], attrs, el);
                    el.setAttribute('refer', refer.join(';'));
                }
                el.setAttribute('ui', '');
            }
        }
		// 解析属性替换
        if ('function' == typeof opt_attrReplacer) {
			opt_attrReplacer(dataControl);
		}      
        
        return uis;
    }
    
    /**
     * 获取控件对象
     * 
     * @public
     * @param {Object} id 控件id
     * @return {Object}
     */
    function get(id) {
        return container[id] || null;
    }
    
    /**
     * 创建控件对象
     * 
     * @public
     * @param {string} type 控件类型
     * @param {Object} options 控件初始化参数
     * @param {HTMLElement} main 控件主元素
     * @return {Object} 创建的控件对象
     */
    function create(type, options, main) {
        var uiClazz = ui[type] || componentMap[type],
            id = options.id,
            uiObj = null;

        if (id && uiClazz) {
            uiObj = new uiClazz(options); 
            if (main) {
                uiObj.render(main);
            }
            container[id] = uiObj;
        }
        
        return uiObj;
    }
    
    /**
     * 释放控件对象
     * 
     * @public
     * @param {string} id 控件id
     */
    function dispose(id) {
        if (id) {
            var control = container[id];
            if (control) {
                control.dispose();
                delete container[id];
            }
        } else {
            for (var key in control) {
                dispose(key);
            }
        }
    }
    
    /**
     * 注册组件
     * 
     * @public
     * @param {string} name 组件名
     * @param {Function} component 组件
     */
    function register(name, component) {
        componentMap[name] = component;
    }
    
	/**
	* 判断对象中是否包含一个元素
	* @param {String|Object} dom 元素ID值
	* @param {Object} 需要查询的元素
	* @return {Number} 位置，-1表示没有，1表示有
	* @author wanghuijun@baidu.com
	*/
	function domHas(dom, element) {
		dom = baidu.g(dom);
		element = baidu.g(element);
		while (element && element.parentNode && element.parentNode.nodeType != 9) {
			element = element.parentNode;
			if (element == dom) {
				return 1;
			}
		}
		return -1;
	};

	/**
	 * 失焦触发功能
	 * @param {Object} tarDom
	 * @param {Object} handler
	 * @author linzhifeng@baidu.com
	 */
	function blurTrigger(tarDom, handler){
		var triggerClass = 'little_trigger',
		    triggerA,
			blurCheckTimer = 0;
		if (!tarDom){
			return false;
		}
				
		triggerA = baidu.dom.q(triggerClass,tarDom,'a')[0];//tarDom.getElementsByClassName(triggerClass)[0]
		if (!triggerA){
			triggerA = document.createElement('a');
			triggerA.href = '#';
			triggerA.setAttribute('hidefocus','hidefocus');
			triggerA.className = triggerClass;
			tarDom.appendChild(triggerA);			
		}
		triggerA.focus();
		
		ui.util.blurTarget = tarDom;
		ui.util.blurHandler = handler;
		
		ui.util.blurCheckTimer = setTimeout(function(){
			blurCheck(tarDom, handler)
		},300);
		baidu.on(tarDom, 'mouseover', blurCheckOver);
		baidu.on(tarDom, 'mouseout', blurCheckOut)
	}
	//失焦触发：移进区域停止失焦轮询
	function blurCheckOver(event){
		//简单做法或者效率更高
		clearTimeout(ui.util.blurCheckTimer);
		/*
		var event = event || window.event,
		    tar = event.relatedTarget || event.srcElement;
		if (ui.util.blurTarget != tar && domHas(ui.util.blurTarget,tar) != 1){
			//目标元素内部来回移动不必重新
			//console.log('in');
			clearTimeout(ui.util.blurCheckTimer);
		}
		*/				
	}
	//失焦触发：离开区域启动失焦轮询
	function blurCheckOut(event){
		var event = event || window.event,
		    tar = event.relatedTarget  || event.toElement,
			triggerA = baidu.dom.q('little_trigger',ui.util.blurTarget,'a')[0];//tarDom.getElementsByClassName(triggerClass)[0]
		if (ui.util.blurTarget != tar && domHas(ui.util.blurTarget,tar) != 1 && triggerA){
			try{
			   triggerA.focus();	
			}catch (e){
				
			}			
			clearTimeout(ui.util.blurCheckTimer);
			blurCheckTimer = setTimeout(function(){
				blurCheck(ui.util.blurTarget, ui.util.blurHandler)
			},300);
		}
	}	
	//失焦触发：轮询判断
	function blurCheck(tarDom, handler){
		var activeDom = document.activeElement;
		
		if (domHas(tarDom,activeDom) == 1){
			ui.util.blurCheckTimer = setTimeout(function(){
				blurCheck(tarDom, handler)
			},300);
		}else{
			var mPos = baidu.page.getMousePosition(),
			    tarDomPos = baidu.dom.getPosition(tarDom);
			if (mPos.x > tarDomPos.left && 
			    mPos.x < tarDomPos.left + tarDom.offsetWidth &&
				mPos.y > tarDomPos.top &&
				mPos.y < tarDomPos.top + tarDom.offsetHeight){
				//鼠标还在区域内，不触发失焦
				ui.util.blurCheckTimer = setTimeout(function(){
					blurCheck(tarDom, handler)
				},300);
			}else{
				baidu.un(tarDom, 'mouseover', blurCheckOver);
				baidu.un(tarDom, 'mouseout', blurCheckOut);
				handler();
			}
		}
		//console.log('checking');
	}
	//失焦触发：关闭功能
	function blurTriggerStop(){
		baidu.un(ui.util.blurTarget, 'mouseover', blurCheckOver);
		baidu.un(ui.util.blurTarget, 'mouseout', blurCheckOut);
		clearTimeout(ui.util.blurCheckTimer);
	}
	
	/**
	 * 智能定位函数
	 * @param {Object} dom 需要定位的节点
	 * @param {Object} position 位置可传入{left,top,pos,align,target,repairL,repairT}
	 * @author linzhifeng@baidu.com
	 */
	function smartPosition(dom, position){
		var repairT = position['repairT'] || 0,
		    repairL = position['repairL'] || 0,
			pos = {
				left : 0,
				top : 0
			};
		if (!dom){
			return;
		}
		if (position['left'] && position['top']){
			pos.left = position['left']; 
			pos.top = position['top']; 
		}else{
			if (!position['target']){
				return;
			}
			var target = baidu.g(position['target']),
			    tarPos = baidu.dom.getPosition(target),
			    tarWidth = target.offsetWidth,
				tarHeight = target.offsetHeight,
				domWidth = dom.offsetWidth,
				domHeight = dom.offsetHeight;
			switch (position['pos']+position['align']){
				case 'tr':	//1
				    pos.left = tarPos.left + tarWidth;
					pos.top = tarPos.top - domHeight;
					break;
				case 'rt':  //2
				    pos.left = tarPos.left + tarWidth;
					pos.top = tarPos.top;
					break;
				case 'rb':  //3
				    pos.left = tarPos.left + tarWidth;
					pos.top = tarPos.top + tarHeight - domHeight;
					break;
				case 'br':  //4
				    pos.left = tarPos.left + tarWidth;
					pos.top = tarPos.top + tarHeight;
					break;
				case 'bl':  //5
				    pos.left = tarPos.left - domWidth;
					pos.top = tarPos.top + tarHeight;
					break;
				case 'lb':  //6
				    pos.left = tarPos.left - domWidth;
					pos.top =  tarPos.top + tarHeight - domHeight;
					break;
				case 'lt':  //7
				    pos.left = tarPos.left - domWidth;
					pos.top =  tarPos.top;
					break;
				case 'tl':  //8
				    pos.left = tarPos.left - domWidth;
					pos.top =  tarPos.top - domHeight;
					break;
			}
		}
		dom.style.left = pos.left + repairL + 'px';
		dom.style.top = pos.top + repairT + 'px';
	}
	
	function showFloat(dom,pos,needBlurTrigger){
		dom = baidu.g(dom);
		dom.style.position = 'absolute';
		dom.zIndex = '1000';
		dom.style.display = 'block';
		ui.util.smartPosition(dom,pos);
		if (needBlurTrigger){
			ui.util.blurTrigger(dom,function(){
				var d = dom;
				d.style.display = 'none';
			})			
		}
	}
	
    return {
        init     : init,
        get      : get,
        create   : create,
        dispose  : dispose,
        register : register,
		domHas : domHas,
		blurTrigger : blurTrigger,
		blurCheckTimer : blurCheckTimer,		
		blurCheckOver : blurCheckOver,
		blurCheckOut : blurCheckOut,
		blurTarget : blurTarget,
		blurHandler : blurHandler, 
		blurTriggerStop : blurTriggerStop,
		smartPosition : smartPosition,
		showFloat : showFloat,
        validate : new Function(),
        /**
         * 销毁UI组件Map
         * @method disposeWidgetMap
         * @param {Object} widgetMap key为widget的ID，value为widget的实例
         * @author wuhuiyao
         */
        disposeWidgetMap: function(widgetMap) {
            if (widgetMap) {
                for (var key in widgetMap) {
                    ui.util.dispose(key);
                    delete widgetMap[key];
                }
            }
        },
        /**
         * <p>dispose所有wiget实例，并将缓存的widge实例从context删除</p>
         * NOTICE: 对于直接或间接通过ui.util.create或init创建的widget不要通过该方法
         * @method disposeWidgets
         * @static
         * @param {Object} context
         * @param {Array} widgetNames 所有要dispose的wiget的name的数组，通过
         *                context[name]能获取该widget实例，要求该widget有
         *                dispose方法，如果没有，就不要通过该方法来dispose
         * @author Wuhuiyao (wuhuiyao@baidu.com)
         */
        disposeWidgets: function(context, widgetNames) {
            var  instance;
            for (var i = 0, len = widgetNames.length; i < len; i ++) {
                instance = context[widgetNames[i]];
                instance && instance.dispose();

                delete context[widgetNames[i]];
            }
        },
        /**
         * 用于ui.Dialog.factory.create创建的对话框的销毁方法，不能用ui.util.dispose方式
         * 来销毁这会造成创建的cancel,ok按钮没有被销毁
         * @method disposeDlg
         * @param {ui.Dialog} dlgInstance
         * @author Wuhuiyao (wuhuiyao@baidu.com)
         */
        disposeDlg: function(dlgInstance){
            if (dlgInstance) {
                // 销毁取消和确定按钮以及最后的对话框实例
                var widgetArr = [dlgInstance.okBtn, dlgInstance.cancelBtn, dlgInstance],
                    widget;
                for (var i = 0, len = widgetArr.length; i < len; i ++) {
                    widget = widgetArr[i];
                    widget && ui.util.dispose(widget.id);
                }
            }
        },
        /**
         * 寻找dom元素下的控件集合
         * 
         * @public
         * @param {HTMLElement} container 要查找的容器元素
         * @return {Object}
         */
        getControlMapByContainer: function (container) {
            var els = container.getElementsByTagName('*'),
                len = els.length,
                controlName,
                result = {};
                
            while (len--) {
                controlName = els[len].getAttribute('control');
                if (controlName) {
                    result[controlName] = ui.util.get(controlName);
                }
            }
            
            return result;
        },
        
        /**
         * 改变form控件的disable状态
         * 
         * @public
         * @param {HTMLElement} container 容器元素
         * @param {boolean} disabled disable状态
         */
        disableFormByContainer: function (container, disabled) {
            var controlMap = ui.util.getControlMapByContainer(container),
                key, control;
                
            for (var key in controlMap) {
                control = controlMap[key];
                if (control.form && control.disable) {
                    control.disable(disabled);
                }
            }
            
            return controlMap;
        }
    };
}();
ui.util.validate = Validator;
baidu.on(window, 'unload', function () {
    ui.util.dispose();
});
