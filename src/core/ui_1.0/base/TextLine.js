/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/TextLine.js
 * desc:    带行号的文本输入框控件
 * author:  zhouyu
 * date:    2010/12/15
 */
/**
 * 带行号的文本输入框控件
 * @class TextLine
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数定义
 * <pre>
 * 参数配置定义如下：
 * {
 *     id:       [String],     [REQUIRED] 文本行控件ID
 *     wordWrap: ['on'|'off'], [OPTIONAL] 是否自动换行，默认off，开启传on
 *     width:    [Number],     [OPTIONAL] 文本行控件输入区域的宽度
 *     height:   [Number],     [OPTIONAL] 文本行控件输入区域的高度
 * }
 * </pre>
 */
ui.TextLine = function (options) {
    this.initOptions(options);
    this.type = "textline";
	this.lineId = "";
	this.lineObj = null;
	this.areaId = "";
	this.textArea = null;
	this.areaObj = null;
	this.number = 1;
	this.wordWrap = this.wordWrap || 'off'; // textarea是否自动换行，默认off，开启传on
};

ui.TextLine.prototype = {
	tpltextline : "<div id={0}></div><textarea id={1}></textarea>",
	
	/**
	 * 渲染控件
	 * @method render
	 * @param {Object} main 控件挂载的DOM
	 */
	render: function(main){
		var me = this;
		if(!me.isRender){
			ui.Base.render.call(me, main, false);
			me.lineId = me.id + "_linenumber";
			me.areaId = me.id + "_textarea";
			me.getMainHtml();
			me.resetLine();
			me.bindEvent();
			me.isRender = true;
		}else {
			me.repaint();
		}
	},
	
	repaint: function(){
		
	},
	/**
	 * 文本行内容发生变化触发的事件
	 * @event onchange
	 * @param {String} value 输入的文本内容
	 */
	onchange : function(){},
	
	getMainHtml: function(){
		var me = this;
		me.main.innerHTML = ui.format(me.tpltextline, me.lineId, me.areaId);
		me.lineObj = baidu.g(me.lineId);
		me.areaObj = baidu.g(me.areaId);
		me.areaObj.setAttribute("wrap",me.wordWrap);
		//创建textinput对象
		var options = {
			id: me.areaId,
			type: "TextInput"
		};
		if (me.width) {
			options.width = me.width;
		}
		if (me.height) {
			options.height = me.height;
		}
		me.textArea = new ui.TextInput(options);
		me.textArea.render(me.areaObj);
		baidu.addClass(me.lineObj, "ui_textline_num");
		me.lineObj.style.height = me.textArea.height + "px";
		me.lineObj.innerHTML = "1";
	},
	
	/**
	 * 重置行号，增加内容和keyup时可调用
	 */
	resetLine: function(){
		var me = this;
		
		if (me.wordWrap == 'off') {
			me.resetNoWrapLine();
		} else {
			me.resetWrapLine();
		}
	},
	
	/**
	 * 重置行号，用于不自动换行的使用
	 */
	resetNoWrapLine : function() {
		var me = this;
		var list = me.textArea.getValue(), num = list.split("\n").length;
		if (num != me.number) {
			me.number = num;
			var tmp = [];
			for (var i = 1; i < num + 1; i++) {
				tmp[tmp.length] = i;
			}
			me.lineObj.innerHTML = tmp.join("<br />");
		}
		me.onchange(list);
		me.textAreaScroll();
	},
	
	/**
	 * 重置行号，用于自动换行的使用
	 */
	resetWrapLine : function(){
		var me = this,
			html = [],
			ghostLineNumber = baidu.g(me.getId('GhostLineNumber')),
		 	textValue = me.textArea.getValue().replace(/\r/g, '').split('\n'),
			lineHeight = [],
			lineNumber = textValue.length;
		
		me.number = lineNumber;
		
		//创建一个ghost用于判断每行的高度（自动折行的情况）
		if(!ghostLineNumber){
			ghostLineNumber = baidu.dom.create('div', {
				'id' : me.getId('GhostLineNumber'),
				'class' : 'ghost_textarea'
			});
			document.body.appendChild(ghostLineNumber);
		}
		
		ghostLineNumber.style.width = me.textArea.main.scrollWidth + 'px'; // textarea有滚动条，所以需要scrollWidth
		ghostLineNumber.innerHTML = '';
		me.ghostLineNumber = ghostLineNumber;
			
		for (var i = 0; i < lineNumber; i++) {
			var p = baidu.dom.create('p');
			p.innerHTML = baidu.encodeHTML(textValue[i]);
			ghostLineNumber.appendChild(p);
			
			lineHeight.push((p.offsetHeight || 21) + 'px');
		}
			
		for (var i = 0; i < lineNumber; i++) {
			html.push('<p style="height:' + lineHeight[i] + '">' + (i + 1) + '</p>');
		}
		me.lineObj.innerHTML = html.join('');
		
		me.onchange(textValue);
		me.textAreaScroll();
	},
	
	/**
	 * 滚动文本输入框
	 */
	textAreaScroll: function(){
		var me = this;
		if (me.lineObj.scrollTop != me.areaObj.scrollTop) {
			me.lineObj.scrollTop = me.areaObj.scrollTop;
		}
	},
	/**
	 * 将文本行的滚动条滚到文本化内容的底部
	 * @method textAreaScrollBottom
	 */
	textAreaScrollBottom : function(){
		var me = this;
		me.areaObj.scrollTop = me.areaObj.scrollHeight;
		me.textAreaScroll();
	},
	
	/**
	 * 滚动数字区域
	 */
	lineNumberScroll: function(){
		var me = this;
		if (me.areaObj.scrollTop != me.lineObj.scrollTop) {
			me.areaObj.scrollTop = me.lineObj.scrollTop;
		}
	},
	
	/**
	 * 增加文本行内容
	 * 
	 * @method addText
	 * @param {Array} list 要增加的文本行内容数组，每个数据元素代表一行的文本内容
	 */
	addText: function(list){
		var me = this;
		var content = list.join('\n');
		if (baidu.string.trim(me.textArea.getValue()) != "") {
			content = me.textArea.getValue() + '\n' + content;
		}
		me.textArea.setValue(content);
		me.resetLine();
	},
	
	/**
	 * 设置内容
	 * 
	 * @method setValue
	 * @param {String} content 要设置的文本行的内容
	 */
	setValue: function(content){
		var me = this;
		me.textArea.setValue(content);
		me.resetLine();
	},
		
	/**
	 * 获取内容字符串形式
	 * @method getValue
	 * @return {String}
	 */
	getValue: function(){
		return baidu.trim(this.textArea.getValue().replace(/\r/g, ''));
	},
	
	/**
	 * 获取内容数组形式,去重并去除空串内容，每一行前后的空白字符都会被去掉
	 * @method getArray
	 * @return {String}
	 */
	getArray: function(){
		var me = this,
			textlist = me.getValue().split('\n');
		for (var i = 0, l = textlist.length; i < l; i++) {
			textlist[i] = baidu.string.encodeHTML(baidu.trim(textlist[i]));
		}
		textlist = baidu.array.unique(textlist);
		baidu.array.remove(textlist,"");
		return textlist;
	},
	/**
     * 将文本框设置为不可写 add by huanghainan
     * @method disable
     * @public
     * @param {Boolean} dsiabled 是否禁用TextLine控件
     */
    disable: function (disabled) {
        //this.setReadOnly(disabled);
		var me = this;
		me.textArea.disable(disabled);// = disabled;
    },
    
	/**
	 * 绑定事件
	 */
	bindEvent: function(){
		var me = this;
		me.areaObj.onkeyup = (function(){
			return (function(){
				me.resetLine();
			})
		})();
		//在me.main上监听scroll事件不成功
		me.areaObj.onscroll = (function(){
			return (function(){
				me.textAreaScroll();
			})
		})();
		me.lineObj.onscroll = (function(){
			return (function(){
				me.lineNumberScroll();
			})
		})();
	},
	
	/**
     * 释放控件实例
     * @method dispose
     */
    dispose: function () {
		var me = this,
			ghostLineNumber = me.ghostLineNumber;
		
		me.lineObj = null;
		me.textArea = null;
		me.areaObj = null;
		
		if (ghostLineNumber) {
            ghostLineNumber.innerHTML = '';
            document.body.removeChild(ghostLineNumber);
            ghostLineNumber = null;
        }
        ui.Base.dispose.call(this);
    }
}

ui.Base.derive(ui.TextLine);