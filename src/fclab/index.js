/**
 * @author zhouyu01
 * 凤巢实验室入口
 * 凤巢实验室本来是主导航上的一个入口，后更改为工具中的一种
 * 为方便衔接已开发完的fclab代码和toolsModule工具，故存在两个命名
 */
fclab.index = ToolsModule.advance = new ToolsModule.Action("advance", {
	// VIEW: 'fclabIndex',
	VIEW: '',

	onafterrender: function(){
		//如果没有权限，跳转到推广概况
		if (!nirvana.env.FCLAB) {
			er.locator.redirect('/overview/index');
			return;
		}
		fclab.index._self = this;
	},
	
	onentercomplete: function(){
		//动态加载凤巢实验室相关tpl、css和js
		if (!fclab.isloaded) {
			nirvana.moduleResources.load("fclab", this.init.bind(this));
		}
		else {
			this.init();
		}
	},
	
	init: function(){
		//重新设置view
		var me = this;
		if (!fclab.isloaded) {
			//标记资源加载过
			fclab.isloaded = true;
		}
		if (!me.arg.refresh) {
			//只render一次
			me.VIEW = 'fclabIndex';
			me.render();
		}
		
		//加载有权限的工具集，读取模块名
		var module = me.getContext("labtool") || "home";
		//没有权限，跳到home页
		if(module != "home" &&
				baidu.array.indexOf(nirvana.env.LABTOOLS, module) < 0){
			module = "home";
		}
		//记录当前工具
		fclab.CURRENT_TOOL = module;
		
		//填充工具集内容，并设置当前工具指向
		fclab.nav.init();
		//公共部分处理（反馈建议、帮助等）
		fclab.side.init();
		
		//模板名
		var template = fclab.lib.getTemplate(module);
		//根据模块设置页面内容，并初始化模块
		baidu.g("LabToolInfo").innerHTML = er.template.get(template);
		fclab[module].init();
	}
});