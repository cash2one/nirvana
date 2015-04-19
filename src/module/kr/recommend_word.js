/**
 *nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/decrease/widget/recommend_word.js 
 * 推荐关键词操作 
 * @author yangji01
 */


manage.recommendWord = new er.Action({
	VIEW : 'recommendWord',
	onentercomplete: function(){
        var me = this, param = {}, dialog = ui.util.get("recommendWordDialog");
		baidu.g('decrRecWordTip').innerHTML = me.arg.tip;
		baidu.addClass(dialog.getBody(),'decr_recword_dialog');
    
        dialog.onclose = function() {
            me.expe.dispose();
        };
        this.initExpedition();
	},
    
    initExpedition: function() {
        var Expedition = fc.module.Expedition,
            Button = fc.ui.Button, me = this;

        this.expe = new Expedition(baidu.g('KrExpeDecr'), { 
            entry: 'decr_recommend_word', 
            hideHeader: true, 
            hideMore: true,
            onSuccess: function() {
                me.action.setContext('recNeedRefresh', 1);
            }
        });

        var Region = fc.common.Region;
        Region.getRegionByAccount(function(regions) {
            if (regions.length === Region.SIZE) regions = [0];
            me.expe.load(me.arg.showword, regions.join(','));
        });
        
        // 远征模块本身是没有取消按钮的，这里加一个
        var btn = $$('.' + Expedition.CSS_FOOTER, this.expe.node)[0].appendChild(document.createElement('div'));
        btn = new Button(btn, { text: '取消' });
        btn.onclick = function() {
            ui.util.get("recommendWordDialog").close();
        };
    }
});
