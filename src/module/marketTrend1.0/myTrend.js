/**
 * 市场风向标  我的趋势模块
 * @author yangji01
 */
marketTrend.myTrend = {
	getMyTrend: function(action) {
        var me = action,
        	myTrendTime = ui.util.get('myTrendTime').getValue(),
            params,
            begin = myTrendTime.begin,
            end= myTrendTime.end,
            starttime,
            endtime,
            successFun = function(json) {
                marketTrend.myTrend.renderMyTrend(json.data);
            };
		action.setContext('myTrendTime',myTrendTime);
		
		starttime = begin.getFullYear() + '-' + (begin.getMonth() + 1) + '-' + begin.getDate(),
        endtime = end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + end.getDate();
        params = {
            industryID: me.params.industryID,
            starttime: starttime,
            endtime: endtime
        };
        me._request(4, params, successFun);
    },
    firstMyTrend: function(action){
    	ui.util.get('myTrendSetBudget').onclick = function() {
            manage.budget.logParam = {
			    'entrancetype' : 0
			};
			manage.budget.openSubAction({ //此方法可查看budget.js
                type : 'useracct',
                planid : []
            });
        }
      
    	ui.util.get('myTrendTime').onselect = marketTrend.myTrend.setTimeHandler(action);
    },
    setTimeHandler : function(action){
    	return function(){
			var myTrendTime = action.getContext('myTrendTime'),
				time = ui.util.get('myTrendTime').getValue();
			
			
			if(!(myTrendTime && myTrendTime.begin == time.begin && myTrendTime.end == time.end)){
				marketTrend.myTrend.getMyTrend(action);
			}
		}
    },
    renderMyTrend: function(data) {
        var flashID = 'showShare';
        marketTrend.index.flash.map[flashID] = data.leftShowTrend;

        var flashConfig = {
            id: flashID,
            url: './asset/swf/VaneLine.swf',
            height: 210,
            scale : 'exactfit',
            wmode: 'Opaque',
            allowscriptaccess : 'always',
            vars: {type: 'leftShowTrend',
                   moveCallback:'marketTrend.index.flash.onTrackMove',
                   loadedCallback: 'marketTrend.index.flash.callback'}
        };

        // 初始化flash
        var nodes = baidu.q('mytrend_flash');
        nodes[0].innerHTML = baidu.swf.createHTML(flashConfig);

        flashID = 'promotionShowTrend';
        marketTrend.index.flash.map[flashID] = data.promotionShowTrend;
        flashConfig.id = flashID;
        flashConfig.vars.type = 'promotionShowTrend';

        nodes[1].innerHTML = baidu.swf.createHTML(flashConfig);
    }
}
