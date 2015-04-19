/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    effectAnalyse/effectGuide.js
 * desc:    引导功能
 * author:  huanghainan
 * date:    $Date: 2012/03/05 $
 */

/**
 * 效果分析工具 引导功能
 */
manage.effectGuide = new er.Action({
    
    VIEW: 'effectAnalyseGuide',
    
    UI_PROP_MAP : {
        
        
    
    },
    
    //初始化ui
    CONTEXT_INITER_MAP : {
        init:function(callback){
            callback();
        }
    
    },
    
    onafterrender : function(){
        var me = this;
        ui.util.get('EffectGuideNext').onclick = function(){
            me.showNextStep();
        };
		ui.util.get('EffectGuideFinish').onclick = function(){
			//监控
            var logparam = {};  
            logparam.guide = "finish";
            logparam.path = "Tools_effectAnalyse";
            nirvana.effectAnalyse.lib.logCenter("sendRequest",logparam);
            me.onclose();
        };
		baidu.hide('EffectGuideFinishButton');
	//	FlashStorager.set('effect_guide', data);  
    },
    
    onentercomplete: function(){
        // Dialog二次定位标识
        nirvana.subaction.isDone = true;
    },
	currentStep : 1,
	
	showNextStep : function(){
		var me = this;
		var cur = me.currentStep;
		if (cur <= 5) {
			var curClass = "step" + cur;
			if (baidu.dom.hasClass('effectGuideSteps', curClass)) {
				baidu.dom.removeClass('effectGuideSteps', curClass);
				cur++;
				baidu.dom.addClass('effectGuideSteps', 'step' + cur);
				baidu.g('effectGuideTitle').innerHTML = me.stepTitles[cur - 1];
			}
			if (cur == 5) {
				baidu.show('EffectGuideFinishButton');
				baidu.hide('EffectGuideNextButton');
			}
			//监控
            var logparam = {};  
            logparam.guideStep = cur;
            logparam.path = "Tools_effectAnalyse";
            nirvana.effectAnalyse.lib.logCenter("sendRequest",logparam);
		}
		me.currentStep = cur;
	},
	stepTitles : [
	   '第一步：选择要分析的关键词',
	   '第二步：查看营销漏斗',
	   '第三步：查看关键词分布',
	   '第四步：进一步选择分析的关键词',
	   '第五步：优化'
	],
    /**
     * 获取默认的全清刷新的stateMap
     */
    getClearStateMap: function(){
        var me = this,
            stateMap = {
                };
        return stateMap;
    }
    
}); 
