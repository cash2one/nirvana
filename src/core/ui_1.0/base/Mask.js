/*
 * Copyright 2010 Baidu Inc. All rights reserved.
 *
 * path:    ui/Mask.js
 * desc:    页面遮盖控件
 * author:  zhaolei,erik,linzhifeng
 * date:    $Date: 2010/12/14 03:07:10 $
 */

/**
 * 页面遮盖控件，maskLevel越高z-index越大
 * 涅槃控制在3级遮盖，z-index分别为200,400,600
 * 
 * @class Mask
 * @namespace ui
 * @static
 */
ui.Mask = (function() {
    var maskList = [],
	    blackClass = 'ui_blackmask',
		whiteClass = 'ui_whitemask',	    
        privateId;

    /**
     * 遮盖层初始化
     *
     * @private
     */
    function init(maskLevel, maskType) {
        var id = 'maskLevel' + maskLevel,
		    el = document.createElement('div');
        el.id = id;
        el.className = maskType;
		if (maskLevel < 3){
			el.style.zIndex = (maskLevel * 200) + '';
		}else{
			el.style.zIndex = (maskLevel * 200) + 400 + '';
		}		
        document.body.appendChild(el);
		maskList.push(maskLevel);
        return;
    }

    /**
     * 重新绘制遮盖层的位置
     *
     * @private
     * @param {HTMLElement} mask 遮盖层元素.
     */
    // Deleted by Wu Huiyao (wuhuiyao@baidu.com)，现在通过修改ui-mask.css样式实现，不需要这么复杂
    /*function repaintMask(mask) {
        var width = Math.max(
                        document.documentElement.clientWidth,
                        Math.max(
                            document.body.scrollWidth,
                            document.documentElement.scrollWidth)),
            height = Math.max(
                        document.documentElement.clientHeight,
                        Math.max(
                            document.body.scrollHeight,
                            document.documentElement.scrollHeight));

        //mask.style.width = width + 'px';
		// 解决浮出层会出现横向滚动条的问题 add by wanghuijun
        mask.style.width = '100%';
        mask.style.height = height + 'px';
    }*/

    /**
     * 页面大小发生变化的事件处理器
     *
     * @private
     */
    // Deleted by Wu Huiyao (wuhuiyao@baidu.com)，现在通过修改ui-mask.css样式实现，不需要这么复杂
    /*function resizeHandler() {
		var mask;
		for (var i = 0, len = maskList.length; i < len; i++){
			mask = getMask(maskList[i]);
			if (mask.style.display != 'none'){
				repaintMask(mask);
			}
		}
    }*/

    /**
     * 获取遮盖层dom元素
     *
     * @private
     * @return {HTMLElement} 获取到的Mask元素节点.
     */
    function getMask(maskLevel,maskType) {
        var mask,id;
		id = 'maskLevel' + maskLevel;
		mask = baidu.g(id);
        if (!mask) {
			maskType = maskType || 'black'
            init(maskLevel, maskType);
        }
        return baidu.g(id);
    }
    // Deleted by Wu Huiyao (wuhuiyao@baidu.com)，现在通过修改ui-mask.css样式实现，不需要这么复杂
	//baidu.on(window, 'resize', resizeHandler);
	
	
    return {
        /**
         * 显示遮盖层
         * @method show
         * @static 
         * @param {String} maskType 遮罩类型，当前支持的有效值'black'或者'white'，未设定，默认为'white'
         * @param {Number} maskLevel 遮罩的层级，涅槃控制在3级遮盖，即maskLevel大于等于3的z-index值都是一样
         */
        'show': function(maskType, maskLevel) {
            var mask = getMask(maskLevel,maskType);
            // Deleted by Wu Huiyao (wuhuiyao@baidu.com)，现在通过修改ui-mask.css样式实现，不需要这么复杂
            //repaintMask(mask);
			if (maskType == 'black'){
				mask.className = blackClass;
			}else {
				mask.className = whiteClass;
			}			
            mask.style.display = 'block';
			//baidu.on(window, 'resize', resizeHandler);
        },

        /**
         * 隐藏遮盖层
         * @method hide
         * @static
         * @param {Number} maskLevel 遮罩的层级，必须和调用show方法时传入的值一样，才能隐藏遮罩
         */
        'hide': function(maskLevel) {
			var mask = getMask(maskLevel)
            if ('undefined' != mask) {
                mask.style.display = 'none';
				//baidu.un(window, 'resize', resizeHandler);
            }
        }
    };
})();

