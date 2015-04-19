/*
 * path:    ui/Suggestion.js
 * desc:    Suggestion控件
 * author:  liuyutong
 * date:    2011/12/7
 */

/**
 * Suggestion控件
 * @class Suggestion
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数定义
 * <pre>
 * 参数配置定义如下：
 * {
 *    id:           [String],      [REQUIRED] 控件的Id
 *    maxNum:       [Number],      [OPTIONAL] 最多显示的建议的数量，默认为10
 *    inputMain:    [HTMLElement], [OPTIONAL] 建议列表要关联的输入框，若未设置，默认自动创建一个输入框
 *                                            建议自己外部创建好输入框传进去，当前使用默认构造会有点问题
 *    width:        [Number],      [REQUIRED] 建议列表宽度
 *    datasource:   [Array],       [REQUIRED] 建议列表绑定的数据源，数据结构定义见下面
 *    baseData:     [String],      [OPTIONAL] 建议项不加粗显示的内容的前缀, 该前缀后的内容皆加粗，若未设置，则都不加粗
 *                                            用在输入过程中，建议列表匹配输入和未匹配输入的区分
 *    notautoClose: [Boolean],     [OPTIONAL] 是否不自动关闭建议列表，默认false，即自动关闭建议列表
 *    topLine:      [String],      [OPTIONAL] 显示的建议列表第一条提示信息，值为HTML片段，不能含有a标签
 * }
 * 
 * datasource的定义：
 * [
 *    {
 *       content:      [String], [REQUIRED] 建议项的内容
 *       finalContent: [String], [OPTIONAL] 建议项用于显示的内容，若未设定，使用content值来显示
 *       title:        [String], [OPTIONAL] 建议项的提示信息，通常建议项内容显示不全，有必要显示title
 *       wordid:       [String], [OPTIONAL] 关键词的ID属性
 *    },
 *    ...
 * 
 * ]
 * </pre>
 */
ui.Suggestion = function(options){
	this.initOptions(options);
    this.type = 'Suggestion';
	this.maxNum = this.maxNum || 10;//suggestion 最大条数 默认值为 10
	this.inputMain = this.inputMain || false;
	this.width = this.width ? this.width : false;
};

ui.Suggestion.prototype = {
	_lineTPL : '<a class="suggestion_line" href="javascript:void(0)" title="{3}" index="{0}" wordid = "{4}">{1}<strong>{2}</strong></a>',
	suggestionMain : '',
	_getLineEL  : function(){
		return this.suggestionMain.getElementsByTagName("a");
	},
	baseData : '',
	dataLen : 0,
	currentLine : -1,//-1代表输入框
	inputValue : '',
	hide : function (me){
		/**
		 * 隐藏建议列表
		 * @method hide
		 * @param {Boolean} notTriggerHide 是否不触发隐藏事件，不想触发，传true
		 */
		return function(whenhide){
			me.isShow = false;
			if(me.suggestionMain&&!isHide(me.suggestionMain)){
				baidu.hide(me.suggestionMain);
			}
			//console.log(me.currentLine);
			if(me.currentLine != -1){
				baidu.dom.removeClass(me._lineEL[me.currentLine],'suggestion_line_hover')
				me.currentLine = -1;
			}
			/**
			 * 隐藏建议列表触发的事件
			 * @event whenHide
			 */
			if(me.whenHide&&!whenhide){
				me.whenHide();
			}
		}
	},
	show : function(me){
		/**
		 * 显示建议列表
		 * @method hide
		 */
		return function (){
			//console.log(me);
			me.isShow = true;
			baidu.show(me.suggestionMain);
			//alert(0);
			me.currentLine = -1;
		}
	},
	_init : function (){
		var me = this;
		baidu.on(me.inputMain,'keydown', me.keyClick(me));
		me._closeHandler();
		me.show = me.show(me);
		me.hide = me.hide(me);
	},
	
	getDataLen : function (){
		return this.datasource.length;
	},
	
	/*setCurrentStat : function(e){
		var me = this,
		e = e || window.event,
  		target = e.target || e.srcElement;
		
	},*/
	_mouseover : function(me){
		return function(e){
			var event = e || window.e,
			target = event.target || event.srcElement;
			if(!(baidu.dom.hasClass(target, 'suggestion_line')&&target.getAttribute('index'))){
				target = target.parentNode;
			}
			if(baidu.dom.hasClass(target, 'suggestion_line')&&target.getAttribute('index')){
				if(me.currentLine != -1){
					baidu.dom.removeClass(me._lineEL[me.currentLine],'suggestion_line_hover')
				}
				me.currentLine = target.getAttribute('index');
				baidu.dom.addClass(me._lineEL[me.currentLine],'suggestion_line_hover');
			}	
		}
	},
	_mouseout : function(me){
		return function(){
			if(me.currentLine != -1){
				baidu.dom.removeClass(me._lineEL[me.currentLine],'suggestion_line_hover');
			}
			me.currentLine = -1;
		}
	},
	_escClick : function(me){
		me.hide();
		me.inputValue = me.inputMain.value;
		setTimeout(function(){
			me.inputMain.value = me.inputValue;
		},1);
		return false;
	},
	_upClick : function(me){
		//console.log(me.currentLine);
		if(me.currentLine != -1){
			baidu.dom.removeClass(me._lineEL[me.currentLine],'suggestion_line_hover')
		}
		if(me.currentLine > 0){
			me.currentLine--;
			me.inputMain.value = me.datasource[me.currentLine].content;
		}else if(me.currentLine == 0){
			me.currentLine--;
			me.inputMain.value = me.baseData;
		}else if(me.currentLine == -1){
			me.currentLine =  me.maxNum >= me.dataLen ? me.dataLen-1 : me.maxNum-1;
			me.inputMain.value = me.datasource[me.currentLine].content;
		}
		if(me.currentLine != -1){
			baidu.dom.addClass(me._lineEL[me.currentLine],'suggestion_line_hover')
		}
		return false;
	},
	_downClick : function(me){
		if(me.currentLine != -1){
			baidu.dom.removeClass(me._lineEL[me.currentLine],'suggestion_line_hover')
		}
		if(me.currentLine < me.maxNum-1 && me.currentLine < me.dataLen - 1){
			me.currentLine++;
			me.inputMain.value = me.datasource[me.currentLine].content;	
		}else if(me.currentLine == me.maxNum-1 || me.currentLine == me.dataLen - 1){
			me.currentLine = 0;
			me.inputMain.value = me.datasource[me.currentLine].content;
		}
		if(me.currentLine != -1){
			baidu.dom.addClass(me._lineEL[me.currentLine],'suggestion_line_hover')
		}
		return false;
	},
	keyClick : function(me){
		return function(e){
			var e = e || event,
			pressingCount = 0,
			currentKey = e.keyCode||e.which||e.charCode;
			//console.log(me);
			/**
			 * 输入框的keydown所触发的事件
			 * @event onbeforeKeyClick
			 * @param {Object} e 事件对象
			 */
			if(me.onbeforeKeyClick){
				me.onbeforeKeyClick(e);
			}
			if(!isHide(me.suggestionMain)){
				switch (currentKey){
					case 27:
						me._escClick(me);
						break;
					// DOWN / UP 键
                    // 按住键不动时，延时处理。这样可以使操作看起来更自然，避免太快导致的体验不好
					case 38:
                        if (pressingCount++ === 0) {
                            me._upClick(me);
                        } else if (pressingCount == 3) {
                            pressingCount = 0;
                        }
                        // webkit 内核下，input 中按 UP 键，默认会导致光标定位到最前
						if(e.preventDefault){
							e.preventDefault();
						}
						break;
					case 40:
						if (pressingCount++ === 0) {
                            me._downClick(me);
                        } else if (pressingCount == 3) {
                            pressingCount = 0;
                        }
						break;
					default: 
						break;
				}
			}
			return false;
		}
	},
	_clickFunc :function(me){
		return function(event){
			var event = event || window.event,
			target = event.target || event.srcElement;
			if(!me.notautoClose){
				event.stopPropagation();
				//isOut = false;
			}
			// console.log(target,1);
			if(!(baidu.dom.hasClass(target, 'suggestion_line')&&target.getAttribute('index'))){
				target = target.parentNode;
			}
			if(target.getAttribute('index')&&baidu.dom.hasClass(target, 'suggestion_line')){
				var index = target.getAttribute('index');
				me.inputMain.value = me.datasource[index].content;
				me.currentLine = index;
				if(me.datasource[0].wordid){
					me.wordid = target.getAttribute('wordid')
				}else{
					me.wordid = null;
				}
				/**
				 * 点击建议项触发的事件
				 * @event suggestionClick
				 */
				if(me.suggestionClick){
					me.suggestionClick.call(me);
				}
				me.hide();
			}
		}
	},
	_closeHandler : function(){
		var me = this,
		index;
		//isOut = false;
		//me._shouldClose = function(){
			//isOut = true;
			//if(isOut){
			//me.hide();
			//}
			
		//};
		//console.log(111);
		if(!me.notautoClose){
			baidu.on(document.body,'click', function(){
				me.hide();
			});
		}
		baidu.on(me.suggestionMain,'click',me._clickFunc(me))
		baidu.on(me.suggestionMain,'mouseover', me._mouseover(me));
		baidu.on(me.suggestionMain,'mouseout', me._mouseout(me));
		if(!me.notautoClose){
			baidu.on(me.inputMain,'click' ,function(event){
				var event = event || window.event;
				event.stopPropagation();
				//isOut = false;
			})
		}
		//baidu.on(me.inputMain,'blur', me.hide);
	},

	_afterrender : function(){
		var me = this;
		if(me.dataLen){
			me._lineEL = me._getLineEL();
			me.show();
		}else{
			//baidu.on(me.inputMain,'keyup', me.keyClick(me))
			me.hide();	
		}
	},
	/**
     * 将未渲染的Suggestion控件渲染到指定的DOM元素里
     * @method appendTo
     * @param {HTMLElement} container 渲染的控件添加到的目标DOM元素
     */
	appendTo: function (container) {
		var main = document.createElement('div');
		container.appendChild(main);
		this.render(main);
	},
	_formatTPL : function(){
		var me = this,
			title = '',
			rel = [],
			tpl;
		if(me.topLine){
			rel.push(me.topLine);
		}
		for(var i = 0; i < me.dataLen && i< me.maxNum;i++){
			var exp = new RegExp('^' + me.baseData),
				content = me.datasource[i].finalContent || me.datasource[i].content,
				wordid = me.datasource[i].wordid || "";
			
			if(me.datasource[i].title){
				title = me.datasource[i].title;
			}else{
				title = '';
			}
			if(content.match(exp)&&me.baseData != ''){
			// console.log(me.baseData);
				content = content.replace(exp,'');
				tpl = ui.format(me._lineTPL,i,me.baseData,content,title,wordid)
			}else{
				tpl = ui.format(me._lineTPL,i,content,'',title,wordid)
			}
			rel.push(tpl);
		}
		return rel.join("");
	},
	_getWidth : function(el){
		var me = this ,val =  el.offsetWidth,which = ['Left', 'Right'] ;	 
		// display is none
		if(val === 0) {
			return 0;
		}
		for(var i = 0, a; a = which[i++];) {
			val -= parseFloat( baidu.dom.getStyle(el, "border" + a + "Width") ) || 0;
			//val -= parseFloat( style(el, "padding" + a) ) || 0;
		}
		return val + 'px';
	},
	 /**
     * 渲染控件
     * @method render
     * @param {HTMLElement} main 控件挂载的DOM元素 
     */
	render : function(main){
		var me = this;
		me.isShow = true;
		me.suggestionMain = document.createElement('div');
		if(!me.main){
			ui.Base.render.call(me, main, true);
		}
		if(me.datasource){
			me.dataLen = me.getDataLen();
		}
		/*if(this.width){
			me.main.style.width = this.width;
		}*/
		baidu.dom.addClass(me.suggestionMain,"suggestion_content");
		if(me.inputMain){
			me.main.innerHTML = '';
			me.suggestionMain.innerHTML = me._formatTPL();
		}else{
			me.inputMain = document.createElement('div');
			me.suggestionMain.innerHTML = me._formatTPL();
			me.inputMain.innerHTML = '<input type="text" class="ui_text" style="float:none;"/>';
			me.inputMain = me.inputMain.getElementsByTagName("input")[0];
			me.main.innerHTML = '';
			me.main.appendChild(me.inputMain);
		}
		if(me.width){
			me.inputMain.style.width = me.width + 'px';
		}
		me.suggestionMain.style.width = '100%';
		me.main.style.width = me._getWidth(me.inputMain);
		//console.log(me,me.suggestionMain)
		me.main.appendChild(me.suggestionMain);
		if(!me.showTime){
			me._init();
			me.showTime = 1;
		}
		me._afterrender();
		/**
		 * 渲染结束触发的事件
		 * @event afterDone
		 */
		if(me.afterDone){
			me.afterDone();
		}
	},
	/**
	 * 重新渲染建议列表
	 * 
	 * @param {Array} datasource 建议列表绑定的数据源，数据结构定义见Suggestion的初始化参数定义
	 * @param {String} baseData 建议项不显示的内容的前缀, e.g. "http://"，所有建议项的该前缀皆不显示
	 * @param {String} topLine 显示的建议列表第一条提示信息，值为HTML片段，不能含有a标签
	 * @method changeShow
	 */
	changeShow : function(datasource,baseData,topLine){
		var me=this;
		me.datasource = datasource;
		me.baseData = baseData || me.baseData;
		me.topLine = topLine || false;//topLine 不能含有 a 标签
		me.render(me.main);
		me.currentLine = -1;
		baidu.on(me.suggestionMain,'click',me._clickFunc(me))
		baidu.on(me.suggestionMain,'mouseover', me._mouseover(me));
		baidu.on(me.suggestionMain,'mouseout', me._mouseout(me));
	}
}
ui.Base.derive(ui.Suggestion);
 