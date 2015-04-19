/**
 * 市场风向标各模块的基类
 * @author mayue
 * @param options {object} 参数，配置如下
 *  {
 *      id {string} 模块的id
 *      tip {string} 右上部提示文字
 * }
 */
marketTrend.moduleBase = function(options){
    this.id = options.id;
    this.tip = options.tip;
};
marketTrend.moduleBase.prototype = {
    //初始化模块外围结构
    initTitle: function(businessIndex){
        var me = this;
        baidu.q('business_name', baidu.g(me.id))[0].innerHTML = marketTrend.tool.getShortBusinessName(
            marketTrend.control.businessDivide.data.business[businessIndex].name
        );
    },
    initTip: function(){
        var me = this;
        baidu.q('market_module_tip', baidu.g(me.id))[0].innerHTML = this.tip;
    },
    initDownload: function(){
        
    }
};
