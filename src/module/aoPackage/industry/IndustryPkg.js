/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/industry/IndustryPkg.js 
 * desc: 行业领先包定义，扩展自aoPackage.js
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/10/15 $
 */
nirvana.IndustryPackage = new nirvana.myPackage({
	/**
	 * 渲染优化包头部
	 * @override 
	 */
	renderHeader: function() {
		// 调用父类的方法
		nirvana.AoPackage.prototype.renderHeader.call(this);
		
		var appId = this.getId(),
		    headElem = $$("#" + appId + 'AoPkgOverviewHeader h1')[0];
		    
		// 为标题添加Bubble
		headElem.innerHTML += '<div _ui="id:industryPkgTitleBubble;type:Bubble;source:industryPkg;" title="行业领先"></div>';
		
		// 初始化优化包头部的Bubble
        fc.ui.init(headElem);
	},
	/**
	 * 渲染图表区域
	 * @override 
	 */
	renderDataArea: function() {
		var me = this,
//			appId = me.getId(),
			ctrl = me.controller;
		
		me.dataCtrl = new ctrl.IndustryPkgFlashCtrl(me.pkgid, me.dataArea);
		me.dataCtrl.show();
	},
	/**
	 * 渲染优化建议区域
	 * @override
	 */
	renderManager: function() {
		var me = this,
			appId = me.getId(),
			barIntroTpl = er.template.get("industryPkgBarIntro");
			//ctrl = me.controller,
			//bindContext = nirvana.util.getEventHanlder;

		// 渲染标题区
		var titleTar = baidu.g(appId + 'AoPkgManagerTitle');
		titleTar.innerHTML = me.managerArea.managerName;
		
		// 添加Bar颜色含义说明
		titleTar.appendChild(fc.create(barIntroTpl));

		// 渲染详细内容
		// 默认将会展现优化建议信息，如果不需要，请在子类中修改renderManager方法
		var newoptions = baidu.object.clone(me.optimizer);
		baidu.extend(newoptions, {
			modifiedItem : me.data.get('modifiedItem'),
			level : me.level
		});
		me.optimizerCtrl = new nirvana.aoPkgControl.IndustryPkgGroupOptCtrl(me.pkgid, newoptions);
		
		me.optimizerCtrl.show();
		
		// 渲染指标的数据条
		me.barCtrl = new nirvana.aoPkgControl.IndustryPkgBar(me.getDOM("managerMain"));
		me.barCtrl.show();
	},
    /**
     * @implemented
     */
    disposeAoPkg: function() {
		var bubble = fc.ui.get('industryPkgTitleBubble');
		// 销毁Bubble
        bubble && bubble.dispose(); 
        
        // 销毁数据指标的Bar
        this.barCtrl && this.barCtrl.dispose();
	}
});