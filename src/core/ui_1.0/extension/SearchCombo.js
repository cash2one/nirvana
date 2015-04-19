/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/SearchCombo.js
 * desc:    组合搜索控件
 * author:  zhouyu,linfeng
 * date:    2010/12/22,2011/07/15
 */
/**
 * 可搜索的下拉框
 * 
 * @class SearchCombo
 * @extend ui.Base
 * @namespace ui
 * @constructor 
 * @param {Object} options 控件初始化参数配置
 * <pre>
 * 配置项如下：
 * {
 *     id:           [String], [REQUIRED] 控件的id属性，值为字符串，此值并不对应DOM元素的ID
 *     searchState:  [Object], [OPTIONAL] 创建查询下拉列表控件初始化参数, 具体见{{#crossLink "ui.Select"}}{{/crossLink}}
 *                                        初始化时options的定义，默认值空对象 
 *     advance:      [Object], [OPTIONAL] 创建查询的高级功能的初始化参数，其实现为可隐藏和折叠高级功能的样式，
 *                                        其数据结构见下面的advance定义
 *     precise:      [Object], [OPTIONAL] 创建是否使用精确查询复选框的控件初始化参数, 只需要配置
 *                                        name,title,value这三个属性，title用于设置复选框标签
 *     inputOption:  [Object], [OPTIONAL] 创建查询文本输入框控件初始化参数, 具体见{{#crossLink "ui.TextInput"}}{{/crossLink}}
 *                                        初始化时options的定义，默认值为{width:200,height:22}
 *     buttonOption: [Object], [OPTIONAL] 创建查询按钮控件初始化参数, 无需配置content属性，配置了也没用，
 *                                        默认其值为"查询"，id也不是必须的，具体见{{#crossLink "ui.Button"}}{{/crossLink}}
 *                                        初始化时options的定义，默认值为空对象
 * }
 * 
 * advance定义如下：
 * {
 *     name:    [String], 高级查询功能未展开显示的标签，值可以为HTML片段
 *     name2:   [String], 高级查询功能展开显示的标签，值可以为HTML片段
 *     title:   [String], 高级查询功能提示信息
 *     value:   [String],
 *     content: [Object], 高级查询功能展开显示的内容配置信息，其数据结构定义见下面content定义
 * }
 * 
 * content定义：
 * {
 *     filterOptionName1: {
 *          name:     [String],  过滤选项前的描述信息，可以是HTML片段，
 *                               比如"&lt;span class='ui_bubble' title='消费筛选项'&gt;消费：&lt;/span&gt;",
 *          type:     [String],  过滤的类型，目前支持单选和复选，有效值为'radio' 或 'checkbox'
 *          needHelp: [Boolean], 是否需要在过滤类型后加个帮助信息的问号，<b>但当前实现上，设为true|false效果都是一样</b>，
 *                               为了加上帮助信息实现上需要在name的HTML片段添加
 *          value: {
 *              {
 *                 name:  [String],  单选或复选按钮显示的标签
 *                 value: [String]  单选或复选按钮选项的值
 *              },
 *              ...
 *          }
 *     },
 *     ...
 * }
 * </pre>
 * <p><b>NOTICE</b>: 当前允许输入的字符串长度最大为40</p>
 * <p><b>NOTICE</b>: 高级查询功能提供一个"我的查询"的按钮查看保存过的历史查询，便于快速执行历史查询，该按钮控件的id为<br/>
 *     <code>var btnId = searchCombo.id + 'ShortcutSearch'</code><br/>该按钮并没有提供任何实现，因此为了引用该控件
 * 为其添加相应的点击事件处理，可以如下方式实现：<br/>
 * <code>ui.util.get(btnId).onclick = function(){}</code>
 * </p>
 */
ui.SearchCombo = function (options) {
    this.initOptions(options);
	
	var id = this.id;
    this.type = 'searchcombo';
	//searchState 状态选择框的option值
	
	this.hasState = this.searchState ? true : false;	
	this.searchState = this.searchState || {};
	//限制输入的字符串长度
	this.searchLimit = 40;
	
	if(!this.searchState.id){
		this.searchState.id = id + 'state';
	}
	//是否有高级功能(this.advance:{name,title,value})
	this.hasAdvance = this.advance ? true : false;

	//是否有精确查询复选框(this.precise:{name,title,value})
	this.hasPrecise = this.precise ? true : false;
	
	//输入框参数（默认值、宽度等）
	this.inputOption = this.inputOption || {width:200,height:22};
	if (!this.inputOption.id) {
		this.inputOption.id = id + "search";
	}	
	//查询按钮参数（皮肤、宽度等）
	this.buttonOption = this.buttonOption || {};
	if(!this.buttonOption.id){
		this.buttonOption.id = id + "button";
	}
	
	this.searchParts = {
		"state": ui.util.create('Select', this.searchState),
		"search" : ui.util.create('TextInput',this.inputOption),
		"button" : ui.util.create('Button',this.buttonOption),
		"precise" : ui.util.create('CheckBox',{'id': id + 'precise'}),
		"advance" : {}
	};
	
	this.renderFun = {
		"state": this.renderState(),
		"search" : this.renderSearch(),
		"button" : this.renderButton(),
		"precise" : this.renderPrecise(),
		"advance" : this.renderAdvanse()
	};
};

ui.SearchCombo.prototype = {

	buttonHtml: '查询',
	
	preciseHtml: '精确查询',
	/**
	 * 绘制控件
	 * @method render
	 * @public
	 * @param {HTMLElement} main 控件元素，该元素必须是DIV元素
	 */
	render: function(main){
		var me = this;
		if (main && main.tagName != 'DIV') {
			return;
		}
		
		if (!me.isRender) {
			ui.Base.render.call(me, main, true);
			me.renderParts();
			if(me.value){
				me.setValue(me.value);
			}
			me.isRender = true;
		}
		else {
			me.repaint();
		}
	},
	
	/**
	 * 渲染各个组件
	 */
	renderParts: function(){
		for (var item in this.searchParts) {
			this.renderFun[item](this.searchParts[item]);
		}
	},
	
	/**
	 * 渲染状态选择框
	 */
	renderState: function(){
		var me = this;
		return function(uiObj){
			if (me.hasState) {
				var state = document.createElement('div');
				me.main.appendChild(state);
				uiObj.render(state);
			}
		};
	},
	
	/**
	 * 渲染选择输入框
	 */
	renderSearch: function(){
		var me = this;
		return function(uiObj){
			var search = document.createElement('input');
			search.setAttribute('type', 'text');
			me.main.appendChild(search);
			uiObj.render(search);
			search.onkeyup = me.keyupHandler();
            search.onenter = me.clickHandler();
		};
	},
	/**
	 * 渲染查询按钮
	 */
	renderButton: function(){
		var me = this;
		return function(uiObj){
			var button = document.createElement('div');
			button.innerHTML = me.buttonHtml;
			me.main.appendChild(button);
			uiObj.render(button);
			uiObj.onclick = me.clickHandler();
		};
	},
	
	/**
	 * 渲染精确查询复选框
	 */
	renderPrecise: function(){
		var me = this;
		return function(uiObj){
			if (me.hasPrecise) {
				var precise = document.createElement('input');
				    precise.type = 'checkbox';
				for (var i in me.precise) {
					precise.setAttribute(i, me.precise[i]);
				}
				me.main.appendChild(precise);
				uiObj.render(precise);
			}
		};
	},
	
	/**
	 * 渲染高级
	 * linzhifeng@baidu.com
	 */
	renderAdvanse : function(){
		var me = this;
		return function(){
			if (me.hasAdvance) {
				var advLink = document.createElement('a'),
				    scutWrap = document.createElement('div'),
				    advWrap = document.createElement('div');
				advLink.id = me.id + 'AdvFilterLink';
				advLink.className = 'advance_filter_link';
				advLink.innerHTML = me.advance.name;
				advLink.title = me.advance.title;
				advLink.href = "javascript:void(0)";
				advLink.onclick = me.toggleAdvance();
				me.main.appendChild(advLink);
				
				scutWrap.id = 'ShortcutWrap';
				scutWrap.className = 'shortcut_wrap';
				me.main.appendChild(scutWrap);
				
				advWrap.id = me.id + 'AdvFilterWrap';
				me.searchParts.advance = {};
				var i,len,idx = 0,
				    html = [];
				html.push("<table class='advance_filter_table'>");
				for (var key in me.advance.content){
					idx++;
					if (idx % 2 == 1){
						html.push("<tr>");
					}
					me.searchParts.advance[key] = [];
					switch (me.advance.content[key].type){
						case 'radio':
						    html.push("<td class='advance_filter_title'>" + me.advance.content[key].name + "</td>");
						    html.push("<td class='advance_filter_content'>");
							for (i = 0, len = me.advance.content[key].value.length; i < len; i++){
								 me.searchParts.advance[key].push(key + me.advance.content[key].value[i].value);
								 html.push("<span style='display:inline-block;'>");
								 html.push("<input type='radio' name='" + key + "' value='" + me.advance.content[key].value[i].value + "' id='" + key + me.advance.content[key].value[i].value + "'>");
								 html.push("<label for='" + key + me.advance.content[key].value[i].value + "'>" + me.advance.content[key].value[i].name + "</label>");
								 html.push("</span>");
							}
							html.push("</td>");
							break;
						case 'checkbox':
						    html.push("<td class='advance_filter_title'>" + me.advance.content[key].name + "</td>");
						    html.push("<td class='advance_filter_content'>");
							for (i = 0, len = me.advance.content[key].value.length; i < len; i++){
								 me.searchParts.advance[key].push(key + me.advance.content[key].value[i].value);
								 html.push("<span style='display:inline-block;'>");
								 html.push("<input type='checkbox' name='" + key + "' value='" + me.advance.content[key].value[i].value + "' id='" + key + me.advance.content[key].value[i].value + "'>");
								 html.push("<label for='" + key + me.advance.content[key].value[i].value + "'>" + me.advance.content[key].value[i].name + "</label>");
								 html.push("</span>");
							}
							html.push("</td>");
							break;
						case 'text':
							//日后扩展
						    break;
					}
					if (idx % 2 == 0){
						html.push("</tr>");
					}
				}
				if (idx % 2 == 1){
					html.push("<td></td></tr>");
				}
				html.push('</table>')
				advWrap.innerHTML = html.join('');
				me.main.parentNode.appendChild(advWrap);
				baidu.dom.hide(advWrap);
				me.isOpenAdvance = false;
				
				var shortCut = ui.util.create('Button',{
		        	id: me.id + 'ShortcutSearch',
					skin : 'select'
		      	});
				shortCut.appendTo(baidu.g('ShortcutWrap'));
				shortCut.setLabel('我的查询');
			}
		};
	},
	/**
	 * 执行查询触发的事件，点击查询按钮或者查询输入框按回车均会触发该事件
	 * @event onclick
	 * @param {Object} condition 输入的查询
	 * <pre>
     * condition数据的结构定义如下
     * {
     *     search: [String], 查询字符串
     *     state: [String|Number], 当前查询类型下拉框选择的值
     *     precise: [Boolean], 是否是精确查询
     *     advance: [Object|undefined], 高级查询的查询参数，其数据见advance定义
     * }
     * 
     * advance定义如下：
     * {
     *     filterType1: [String], 每种过滤类型的值，如果未进行该种类型进行过滤，其值为"-1"，如果是复选框选择多个值，每个值以逗号隔开
     *     ...
     * }
     * </pre>
	 */
	onclick: new Function(),
	
	
	/**
	 * 处理按钮点击事件（开始查询）
	 */
	clickHandler: function(){
		var me = this;
		return function(){
			var condition = me.getValue();
			me.onclick(condition);
		}
	}, 
	
	
	/**
	 * 处理回车事件（开始查询）
	 */
	keyupHandler: function(){
		var me = this;
		return function(){
			var searchCon = baidu.trim(me.searchParts["search"].getValue()),
                searchLen = getLengthCase(searchCon);
			if (searchLen > me.searchLimit) {
				searchCon = subStrCase(searchCon, me.searchLimit);
				me.searchParts["search"].setValue(searchCon);
			} 
			var e = window.event || arguments[0];
			if (e.keyCode == 13) { //回车筛选
				var condition = me.getValue();
				me.onclick(condition);
			}
		}
	},
	
	
	/**
	 * 获取组合搜索值
	 * @method getValue
	 * @protected
	 * @return {Object} condition 
	 */
	getValue: function(){
		var me = this,
		    condition = {};
		condition.search = baidu.trim(me.searchParts["search"].getValue());
		
		if(me.hasState){
			 condition.state = me.searchParts["state"].getValue();
		}
		if(me.hasPrecise){
			 condition.precise = me.searchParts["precise"].getChecked();
		}
		if(me.hasAdvance && me.isOpenAdvance){
			var i,len,domCtrl;
			condition.advance ={};
			for (var key in me.searchParts.advance){
				condition.advance[key] = '-1';
				for (i = 0, len = me.searchParts.advance[key].length; i < len; i++){
					domCtrl = baidu.g(me.searchParts.advance[key][i]);
					if (domCtrl && domCtrl.checked){
						//考虑进多选
						if(condition.advance[key] != -1){
							condition.advance[key] += ','+domCtrl.value;
						}else{
							condition.advance[key] = domCtrl.value;
						}
					}
				}
			}
		}
		
		return condition;
	},
	
	
	/**
	 * 为输入框设置某个值
	 * @param {Object} value 需要设置的值
	 */
	setValue: function(value){
		this.searchParts["search"].setValue(value);
	},
	
	/**
	 * 高级功能折叠
	 */
	toggleAdvance : function(){
		var me = this;
		return function(e){
			var  e = e || window.event;
			//baidu.dom.toggle(me.id + 'AdvFilterWrap');
			me.isOpenAdvance = !me.isOpenAdvance;
			if (me.isOpenAdvance){
				baidu.show(me.id + 'AdvFilterWrap');
				this.innerHTML = me.advance.name2;
			}else{
				baidu.hide(me.id + 'AdvFilterWrap');
				this.innerHTML = me.advance.name;
				//复位所有为未选
				me.cancelAdvance();
			}
			//baidu.event.preventDefault(e);
			//baidu.event.stopPropagation(e);
			this.blur();
			return false;
		}
	},
	
	/**
	 * 取消某项高级功能
	 * @param tarKey 需要取消的项，不传则全部清空
	 */
	cancelAdvance : function(tarKey){
		var me = this,
			i,len,domCtrl;
		if (typeof tarKey == 'undefined'){
			//复位所有为未选
			for (var key in me.searchParts.advance){
				for (i = 0, len = me.searchParts.advance[key].length; i < len; i++){
					domCtrl = baidu.g(me.searchParts.advance[key][i]);
					domCtrl.checked = 0;
				}
			}
		}else{
			for (i = 0, len = me.searchParts.advance[tarKey].length; i < len; i++){
				domCtrl = baidu.g(me.searchParts.advance[tarKey][i]);
				domCtrl.checked = 0;
			}
		}
	},
	
	/**
	 * 重绘控件
	 */
	repaint: function () {
	    var me = this;
	   
	    if((typeof me.searchStateValue != 'undefined') 
	       && (typeof me.searchQueryValue != 'undefined') 
	       && (typeof me.searchPreciseValue != 'undefined')){
	        if (!me.searchQueryValue){
	            me.searchQueryValue = '';
	        } 
	        me.searchParts.state.render(me.searchParts.state.main);
	        me.searchParts.state.setValue(me.searchStateValue);
            me.searchParts.search.setValue(me.searchQueryValue);
			/*
			me.searchLimit = me.searchMaxLength ? me.searchMaxLength : 0;
            if (me.searchLimit) {
				console.log(me.searchLimit);
				me.searchParts.search.setAttribute('maxLength',me.searchLimit);
			}
			*/
			if (me.searchParts.precise.main) {
                me.searchParts.precise.setChecked(me.searchPreciseValue);
            }   
			
			if (me.hasAdvance){
				var domCtr;
				for (var key in me.searchAdvanceValue){
					if (me.searchAdvanceValue[key] != '-1'){
						domCtr = baidu.g(key + me.searchAdvanceValue[key]);
						if (domCtr){
							domCtr.checked = 1;
						}
					}else{
						me.cancelAdvance(key);
					}
				}  
			}   
	    }
	    
	},
	
	/**
	 * 释放控件
	 * @method dispose
	 */
	dispose: function(){
		ui.Base.dispose.call(this);
		this.searchParts["button"].onclick = null;
		this.searchParts["search"].dispose();
		this.searchParts["state"].dispose();
		this.searchParts["button"].dispose();
		this.searchParts["precise"].dispose();
		
	}
};

ui.Base.derive(ui.SearchCombo);
