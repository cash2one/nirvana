/**
 * 实验室首页
 * @author zhouyu01
 */
fclab.home = {
	//最新产品文字配置
	new_product_config:{
		"abtest": {
			"icon": "方案实验工具",
			"title": "方案实验工具",
			"intro":  "<p>方案对比，排除干扰因素</p>" 
					+ "<p>更低风险，找到最佳方案</p>"
					+ "<p>自动评估，效果一目了然</p>"
		},
		"cpa": {
			"icon": "转化出价工具",
			"title": "转化出价工具",
			"intro":  "<p>智能识别流量优劣</p>" 
					+ "<p>合理调整当前出价</p>"
					+ "<p>便捷3步完成设置</p>"
		}
	},
	
	//最新产品的内容
	getProductHtml: function(clazz){
		var tpl = er.template.get("labNewProduct");
		var list = this.new_product_config;
		var html = [];
		html[html.length] = "<ul>";
		for (var item in list) {
			var productItem = list[item];
			html[html.length] = ui.format(tpl, item, 
											productItem.icon,
											productItem.title,
											productItem.intro);
		}
		html[html.length] = "</ul>";
		return html.join("");
	},
	
	/**
	 * 初始化首页
	 */
	init: function(){
		if (!this.newProductHtml) {
			this.newProductHtml = this.getProductHtml();
		}
		//显示or隐藏介绍文字区域
		baidu.g("labToggleIcon").onclick = this.toggleIntroArea;
		baidu.g("labNewProduct").innerHTML = this.newProductHtml;
		baidu.g("labNewProduct").onclick = this.toNewProduct;
	},
	
	/**
	 * 显示or隐藏介绍文字区域
	 */
	toggleIntroArea: function(){
		if (baidu.dom.hasClass("LabToolIntro", "hide")) {
			baidu.removeClass("LabToolIntro", "hide");
			baidu.g("labToggleIcon").className = "arrow_up";
		}
		else {
			baidu.addClass("LabToolIntro", "hide");
			baidu.g("labToggleIcon").className = "arrow_down";
		}
	},
	/**
	 * 点击进入最新产品页
	 */
	toNewProduct: function(e){
		var event = e || window.event;
		var target = event.target || event.srcElement;
		var module;
		while (target && target != this) {
			if (target.tagName.toLowerCase() == "li" 
					&& (module = target.getAttribute("module"))) {
				fclab.lib.changeTool(module, true);
				return ;
			}
			else {
				target = target.parentNode;
			}
		}
	}
}
