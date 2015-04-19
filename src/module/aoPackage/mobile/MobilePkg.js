/**
 * path: aoPackage/mobile/mobile.js 
 * desc: 移动优化包，扩展自aoPackage.js
 * author: mayue@baidu.com
 * date: $Date: 2013/03/08
 */
nirvana.MobilePackage = new nirvana.myPackage({
    renderAppAllInfo : function(){
        var me = this;
        // 渲染基础信息，包括载入模板文件以及渲染，展现包名，包的简介文字等
        me.renderBasicInfo();
        // 渲染头部
        me.renderHeader();
        // 渲染管理区
        me.renderManager();
    },
    onafterRenderAppAllInfo : function(){
        var me = this;
        me.getDOM('dataAreaContainer') && baidu.dom.remove(me.getDOM('dataAreaContainer'));
        baidu.hide(me.getDOM('managerTitle'));
    },
    extendOptimizerCtrl : function(pkgid, newoptions){
        var me = this;
        me.optimizerCtrl = new nirvana.aoPkgControl.AoPkgGroupOptCtrl(pkgid, newoptions);
        // 优化详情视图配置
        me.optimizerCtrl.detailConf = nirvana.aoPkgControl.mobileDetailConf;

        me.optimizerCtrl.viewDetail = function(optid, opttypeid, cache, data) {
            if (opttypeid != 804){
                this.switchToDetail2(optid, opttypeid, cache, data);
            }
            else {
                window.open('http://mobi.baidu.com/tg/test?from=bag');
            }
        };
    }
});