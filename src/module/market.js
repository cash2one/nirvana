/**
 * 市场风向标2.0
 * @author mayue
 * @date 2013-01-20
 */
marketTrend.index = new er.Action({
    VIEW : '',
    UI_PROP_MAP : {},
    CONTEXT_INITER_MAP: {},
    onentercomplete : function() {},
    onafterrender: function(){
        var me = this;
        if (nirvana.env.MKTINSIGHT) {
            this.subAction = er.controller.loadSub('Main', marketTrend.index2);
        } else {
            this.subAction = er.controller.loadSub('Main', marketTrend.index1);
        }
    },
    onleave: function(){
        if (this.subAction.wordsTrendIndustry) {
            this.subAction.wordsTrendIndustry.disposeUi();
        }
        if (this.subAction.wordsTrendMarket) {
            this.subAction.wordsTrendMarket.disposeUi();
        }
    	er.controller.unloadSub(this.subAction);
    }
});