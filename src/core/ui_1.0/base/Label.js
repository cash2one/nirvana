/*
 * path:    ui/Label.js
 * desc:    label控件（主要用于渲染/重绘模板变量）
 * author:  tongyao
 * date:    2010/12/14
 */
/**
 * 用于显示标签的控件
 *  
 * @class Label
 * @extend ui.Base
 * @namespace ui
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置项如下：
 * {
 *     id:         [String],  [REQUIRED] Label的id属性，值为字符串，此值并不对应DOM元素的ID
 *     logSwitch:  [Boolean], [OPTIONAL] 监控日志的开关，默认值为true
 *     dataSource: [String],  [OPTIONAL] Label控件显示的标签，可以是HTML片段
 *     title:      [String],  [OPTIONAL] Label控件的title属性，鼠标移到该控件上显示的提示内容
 *     for:        [String],  [OPTIONAL] Label控件所要绑定的表单控件的id
 *     classname:  [String],  [OPTIONAL] 为Label控件添加的样式名
 * }
 * </pre>
 */
ui.Label = function(options){
	this.initOptions(options);
	// 类型声明，用于生成控件子dom的id和class
    this.type = 'label';
	this.logSwitch = this.logSwitch || true;
};

ui.Label.prototype = {
	/*labelTpl : '<div id="{2}" class="{1}">{0}</div>',
	
	getHtml : function(){
		var me = this;
        
        return ui.format(
            me.labelTpl,
            me.datasource,
            me.getClass('label'),
            me.getId('label')
        );
	},
	*/
	/**
     * 渲染控件
     * @method render
     * @param {HTMLElement} main 控件挂载的DOM元素，必须是DIV元素
     */
	render : function(main){
		var me = this;
		
		
		if(!me.main){
			ui.Base.render.call(me, main, true);
		}
		me.main.innerHTML = (typeof(me.datasource) == "undefined" || me.datasource == null) ? "" : me.datasource;
		if(me.title){
			me.main.setAttribute("title",me.title);
		}
		if(me['for']){
			me.main.setAttribute("for",me['for']);
		}
		if(me.classname){
			baidu.addClass(me.main,me.classname);
		}
	},
	/**
     * 将Label控件渲染到指定的DOM元素里
     * @method appendTo
     * @param {HTMLElement} container 渲染的控件添加到的目标DOM元素
     */
	appendTo: function (container) {
        var main = document.createElement('label');
        container.appendChild(main);
        this.render(main);
    }
}

ui.Base.derive(ui.Label);
 