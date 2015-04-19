/*
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    ui/Loading.js
 * desc:    用于异步请求数据过程中，提供显示正在加载的状态组件
 * author:  wuhuiyao (wuhuiyao@baidu.com)  
 * date:    $Date: 2012/10/30 $
 */
 
/**
 * 用于异步请求数据过程中，提供显示正在加载的状态<br/>
 * 创建的Loading元素可以附加在要添加Loading的容器元素的后面，也可以作为容器元素的子节点（默认）。<br/>
 * 不管哪一种情况，loading元素都将在其所在的容器元素里居中对齐。此外，可以通过传入clazzName属性，来修正loading元素的位置。
 * @class Loading
 * @namespace ui
 */
ui.Loading = function($){
	var DEFAULT_SETTING = {
		clazzName: "",
		loadingImgPath: "asset/img/loading_ao.gif",
		loadingMsg: "数据正在加载中..."
	};
	
	/**
	 * Loading构造函数
	 * @constructor
	 * @param {Object} options Loading的初始化配置参数
	 * 配置项定义如下：
	 * <pre>
	 * {
	 *    clazzName: [String], [OPTIONAL] loading元素定制的样式名
	 *    loadingImgPath: [String], [OPTIONAL] loading的图片路径，默认"asset/img/loading_ao.gif"
	 *    loadingMsg: [String], [OPTIONAL] 数据加载中消息，默认为"数据正在加载中..."
	 *    container: [HTMLElement], [REQUIRED] 要添加Loading的容器元素
	 *    asSibling: [Boolean], [OPTIONAL] 是否将loading元素附加在容器元素的后面作为其兄弟节点，默认false，
	 *                                     默认将作为容器元素的一个孩子节点添加
	 * }
	 * </pre>
	 */
	function Loading(options) {
    	var config = nirvana.util.extend(options, DEFAULT_SETTING);
    	// 创建Loading元素
    	var result = generateLoadingElem(options.container, config);
        this.loadingElem = result.loadingElem;
        this.parentElem = result.parentElem;
	}
	
	function generateLoadingElem(container, options) {
		var tpl = '<{tagName} class="ui-loading {clazzName}" style="left: -1000px;">'
            +           '<img src="{loadingImgPath}" />'
			+           '<p>{loadingMsg}</p>'
			+     '</{tagName}>';
		var tagName = 'div';
	    
		// 为loading的父元素添加position样式，设为relative，确保loading显示位置正确
	    var parentElem = options.asSibling ? container.parentNode : container;
	    if (parentElem && parentElem.nodeType == 1) {
	    	baidu.dom.setStyles(parentElem, {position: "relative"});
	    	if (parentElem.tagName.toLowerCase() === 'ul') {
	    		tagName = 'li';
	    	}
	    }
	    
	    tpl = fc.tpl.parse({
					tagName : tagName,
					clazzName : options.clazzName,
					loadingImgPath : options.loadingImgPath,
					loadingMsg : options.loadingMsg
				}, tpl);
	    
	    // 将模板字符串转成DOM元素
	    var loadingElem = fc.create(tpl);
	    
	    if (options.asSibling) {
	    	// 将创建的Loading元素插入到container元素后面
	    	baidu.dom.insertAfter(loadingElem, container);
	    } else {
	    	container.appendChild(loadingElem);
	    }
	    
	    return { loadingElem: loadingElem, parentElem: parentElem };
	}

    // 修复loading元素位置
    function setLoadingPosition(loadingElem, parentElem) {
        // 修复loading元素位置
        var top = parseInt((parentElem.offsetHeight - loadingElem.offsetHeight) / 2),
            left = parseInt((parentElem.offsetWidth - loadingElem.offsetWidth) / 2);

        baidu.dom.setStyles(loadingElem, {left: left + "px", top: top + "px"});
    }
	
	Loading.prototype = {
		/**
		 * 显示Loading
		 * @method show 
		 */
		show: function() {
            var loadingElem = this.loadingElem;
            if (loadingElem) {
                baidu.dom.show(loadingElem);
                setLoadingPosition(loadingElem, this.parentElem);
            }
		},
        /**
         * 触发resize事件，loading元素会重新调整loading元素位置
         */
        fireResize: function () {
            if (this.loadingElem) {
                setLoadingPosition(this.loadingElem, this.parentElem);
            }
        },
		/**
		 * 隐藏Loading
		 * @method hide 
		 */
		hide: function() {
			this.loadingElem && baidu.dom.hide(this.loadingElem);
		},
		/**
		 * 销毁Loading实例
		 * @method dispose 
		 */
		dispose: function() {
			// 从DOM树上移除Loading的DOM元素
			baidu.dom.remove(this.loadingElem);
			this.loadingElem = null;
            this.parentElem = null;
		}
	};
	
	return Loading;
}($$);