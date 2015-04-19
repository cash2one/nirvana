/**
 * 账户实验室独特的点击选择控件
 * 使用方法：
 * new fclab.chosenBar({
			container: "",	//控件容器
			itemset: [],	//对象数组，每个对象为一个选择项，结构为{text:"",value:""}
			value: "",		//默认选中值
			width: 30,		//每个选择项的宽度，默认为90px
			clearevent: false,//是否不需要绑定事件，默认为false，会绑定事件
			type: 2,		//1：点击 选中当前项；2：点击 选中该项之前所有项（包括当前项）
			// 新增一个change事件
			onchange: function(v){
				// ..
			}
		});
 * @author zhouyu01
 */
fclab.chosenBar = function(params){
	//itemset:对象数组，数组中每项值结构为{text:"",value:""}
	this.itemset = params.itemset || [];
	this.value = params.value;
	//type:1：点击 选中当前项；2：点击 选中该项之前所有项（包括当前项）
	this.type = params.type || 1;
	this.container = params.container || null;
	//每个选择项的宽度，默认为90px
	this.width = params.width || 90;
	this.clearevent = params.clearevent || false;
	if (this.container) {
		this.container = baidu.g(this.container);
		this.init();
	}
	this.onchange = params.onchange;
};

fclab.chosenBar.prototype = {
	/**
	 * 初始化，填充内容并渲染选择项
	 */
	init: function(){
		var me = this;
		var itemset = me.itemset;
		var len = itemset.length;
		var container = me.container;
		var html = [];
		html[html.length] = "<ul class='fclab_chosen_bar'>";
		for (var i = 0; i < len; i++) {
			html[html.length] = "<li style='width:" + me.width + "px' "
							+	"value=" + itemset[i].value + ">" 
							+	itemset[i].text 
							+	"</li>";
		}
		html[html.length] = "</ul>";
		container.innerHTML = html.join("");
		me.repaint();
		if (!me.clearevent) {
			container.onclick = me.clickHandler();
		}
	},
	
	/**
	 * 渲染选择结果
	 */
	repaint: function(){
		var me = this;
		var index = baidu.array.lastIndexOf(me.itemset, function(item){
			return item.value == me.value;
		});
		var lis = me.container.getElementsByTagName("li");
		var len = lis.length;
		if (len > 0 && index > -1) {
			for (var i = 0; i < index; i++) {
				if (me.type == 1) {
					baidu.removeClass(lis[i], "current");
				}
				else {
					baidu.addClass(lis[i], "current");
				}
			}
			baidu.addClass(lis[index], "current");
			for (var i = index + 1; i < len; i++) {
				baidu.removeClass(lis[i], "current");
			}
		}
	},

	/**
	 * 绑定点击事件
	 */
	clickHandler: function(){
		var me = this;
		return function(e){
			var e = e || window.event;
			var tar = e.target || e.srcElement;
			if (tar && tar.tagName.toLowerCase() == "li") {
				me.value = baidu.getAttr(tar, "value");
				me.repaint();
				// 调用事件
				me.onchange
					&& me.onchange.call(me, me.value);
			}
		}
	},
	
	/**
	 * 设置value
	 * @param {Object} value
	 */
	setValue: function(value){
		this.value = value;
		this.repaint();
	},
	
	
	/**
	 * 获取value
	 */
	getValue: function(){
		return this.value;
	}
}

