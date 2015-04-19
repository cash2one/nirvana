/**
 * 凤巢实验室常用方法
 * @author zhouyu01
 */
fclab.lib = {
	//工具名称配置
	toolName:{
		"home": "高级工具",
		"abtest": "方案实验工具",
        "cpa": "转化出价工具"
	},
	
	/**
	 * 根据模块获取模板名
	 * 这里要求所有模块的模板名都要按照这个规则来定义
	 * @param {Object} module	模块名
	 */
	getTemplate: function(module){
		return "fclab" + initialString(module) + "Info";
	},
	
	/**
	 * 打开不同的工具/首页，刷新页面
	 * @param {Object} module
	 */
	changeTool: function(module, clickNew){
		var action = fclab.index._self;
        var enterType = clickNew == undefined 
            ? 'nav'
            : 'new';
		action.setContext("labtool", module);
		//监控
		NIRVANA_LOG.send({
			target: "enterLabTool",
			module: module,
            enterType: enterType
		});
		action.refresh();
	},

    /**
     * 简易提示函数
     * @param  {HTMLElement} hinter 提示容器
     * @param  {string} notice      提示话语
     * @param  {Function} callBack  回调函数
     * @param  {Function} callFront 前调函数
     */
    hinterAlert: function(hinter, notice, callBack, callFront){
        if(!!hinter.timer)
            return;
        if(callFront)
            callFront();
        var oldText     = hinter.innerHTML;
        var oldDisplay  = baidu.dom.getStyle(hinter, 'display');
        hinter.style.color      = 'red';
        // hinter.style.fontWeight = 'bold';
        hinter.innerHTML        = notice;
        hinter.style.display    = 'block';
        //默认3秒后复原
        hinter.timer = window.setTimeout(function(){
            hinter.style.color      = 'gray';
            hinter.style.fontWeight = 'normal';
            hinter.innerHTML        = oldText;
            if(oldDisplay == 'none')
                hinter.style.display = oldDisplay;
            delete hinter.timer;//手动删除
            if(callBack)
                callBack();
        }, 1000 * 3);
    }
};


