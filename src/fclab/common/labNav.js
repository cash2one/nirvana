/**
 * 创新实验室内部导航
 * @author zhouyu01
 */
fclab.nav = (function(){
	var tpl = '<div id="FclabNav{0}" class="fclab_tool_item">'
			+ '		<div class="fclab_nav_icon"></div>'
			+ '		<div class="fclab_nav_intro">{2}</div>'
			+ '</div>';
	
	var config = {
		"abtest":{
			name:"方案实验"
		},
        // 新增“cpa转化出价”
        "cpa":{
            name:"转化出价"
        }
	}
	
	/**
	 * 初始化填充工具集
	 */
	function fillTools(){
		var current = fclab.CURRENT_TOOL;
		var action = fclab.index._self;
		if (!action.arg.refresh) {
			var tools = nirvana.env.LABTOOLS;
			var container = baidu.g("FclabToolList");
			var html = [];
			if (tools && baidu.lang.isArray(tools)) {
				var i;
				var tool;
				var len = tools.length;
				for (i = 0; i < len; i++) {
					tool = tools[i];
					if (config[tool]) {
						html[html.length] = ui.format(tpl, 
														initialString(tool), 
														tool, 
														config[tool].name
													);
					}
				}
			}
			//填充工具集
			container.innerHTML = html.join("");
			//绑定点击事件
			bind();
		}
		//导航初始指向工具
		var currentNav = "FclabNav" + initialString(current);
		var navIcon = baidu.q("fclab_tool_item", baidu.g("LabNav"), "div");
		for (var i = 0, len = navIcon.length; i < len; i++) {
			if (navIcon[i].id == currentNav) {
				baidu.addClass(navIcon[i], "current");
			}
			else {
				baidu.removeClass(navIcon[i], "current");
			}
		}
		
	}
	
	/**
	 * 绑定工具图标点击事件
	 */
	function bind(){
		var navItems = baidu.q("fclab_tool_item", "LabNav", "div");
		var toolBody = baidu.g("LabToolInfo");
		var length = navItems.length;
		var template;
		var module;
		var i;
		baidu.g("LabNav").onclick = function(e){
			var e = e || window.event;
			var tar = e.target || e.srcElement;
			if (baidu.dom.hasClass(tar, "fclab_nav_icon") 
					&& !baidu.dom.hasClass(tar.parentNode, "current")) {
				for (i = 0; i < length; i++) {
					if (baidu.dom.contains(navItems[i], tar)) {
						module = tar.parentNode.id.replace("FclabNav", "");
						module = module.toLowerCase();//模块名，字母全小写
						fclab.lib.changeTool(module);
						return ;
					}
				}
			}
		}
	}
	
	return {
		init: fillTools
	}
	
})();
