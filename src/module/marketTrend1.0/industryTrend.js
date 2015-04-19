/**
 * 市场风向标  行业规模趋势模块
 * @author yangji01
 */
marketTrend.industryTrend = {
	//放在CONTEXT_INITER_MAP里
	initIndustryTrend : function(action){
		action.setContext('industryTrendType',0);
	},
	//初始化  放在afterrender里
	init : function(action){
		var me = this;
		ui.util.get('industryTrendTime').onselect = me.setTimeHandler(action);
		baidu.g('industry_trend_type').onclick = me.setTypeHandler(action);
	},
	//设置时间
	setTimeHandler : function(action){
		var me = this;
		return function(){
			var industryTime = action.getContext('industryTime'),
				time = ui.util.get('industryTrendTime').getValue();
			//如果时间发生改变  向后台发请求
			if(!(industryTime && industryTime.begin == time.begin && industryTime.end == time.end)){
				me.getIndustryTrend(action);
			}
		}
	},
	//设置指标
	setTypeHandler : function(action){
		var me = this;
		return function (e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
				type,parent,i,
				divs = $$('#industry_trend_type .type_div');
            while(target  && target != baidu.g('industry_trend_type')){
				for(i = 0; i < 3 ; i++){
					if(target == divs[i]){
						if(!baidu.dom.hasClass(target,'type_selected')){
							baidu.removeClass($$('#industry_trend_type .type_selected')[0],'type_selected');
							baidu.addClass(target,'type_selected');
							action.setContext('industryTrendType',i);
							me.renderFlash(action);
							
							/*if(i == 2){
								baidu.addClass($$('#market_industry_trend .error_area')[0],'hide');
							}else{
								baidu.removeClass($$('#market_industry_trend .error_area')[0],'hide');
							}*/
						}
						break;
					}
				}
				
                target = target.parentNode;
            };
        };
	},
	//更新flash
	renderFlash : function(action){
		var flashID = 'industryTrendFlash',
			data = action.getContext('industryTrendData'),
			industryType = action.getContext('industryTrendType'),
			flashData = {},
			name,
			type;

		flashData.table = data[industryType].table;
		
		switch(industryType){
			case 0:
				name = '行业饱和度';
				type = 'per';
				break;
			case 1:
				name = '行业词检索量';
				type = 'per';
				break;
			case 2:
				name = '商业检索量';
				type = 'per';
				break;
		}
		flashData.type = {};
		
		flashData.type.value = {
			name : name,
			type : type
		}
		
        marketTrend.index.flash.map[flashID] = flashData;
        // 初始化flash
        baidu.g('industry_trend_flash').innerHTML = baidu.swf.createHTML({
            id: flashID,
            url: './asset/swf/fxb_lineGraph.swf',
            
            height: 270,
            scale : 'exactfit',
            wmode : 'Opaque',
            allowscriptaccess : 'always',
            vars: {loadedCallback: 'marketTrend.index.flash.callback',id:flashID}
        });
	},
	//获取后台数据
	getIndustryTrend : function(action){
		var params,
			successFun,
			industryTime,
			bengin,
			end,
			starttime,
			endtime,
			me = this,
			begin;
		
		industryTime = ui.util.get('industryTrendTime').getValue();
		begin = industryTime.begin;
		end = industryTime.end;
		
		action.setContext('industryTime',industryTime);
		
		starttime = begin.getFullYear() + '-' + (begin.getMonth() + 1) + '-' + begin.getDate(),
        endtime = end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + end.getDate();
		
		params = {
			industryID: action.params.industryID,
            starttime: starttime,
            endtime: endtime,
            type: action.getContext('industryTrendType')
		}
		
		successFun = me.successFun(action);
		action._request(0, params, successFun);
	},
	//回调函数
	successFun : function(action){
		var me = this;
		return function(json){
			action.setContext('industryTrendData',json.data);
			var valueDivs = $$('#industry_trend_type .value'),
				rateSpans = $$('#industry_trend_type .rate_num'),
				i,
				data = json.data,
				rate;
			
			//行业饱和度的value
			valueDivs[0].innerHTML = baidu.number.fixed(data[0].trend * 100) +'%';
			
			for(i = 0; i < 3 ; i++){
				/*删除行业词检索量  商业检索量的value
				valueDivs[i].innerHTML = data[i].trend;
				if(i == 0){
					valueDivs[0].innerHTML = baidu.number.fixed(data[i].trend * 100) +'%';
				}*/
				rate = baidu.number.fixed(data[i].rate *100);
				if(rate < 0){
					baidu.addClass(rateSpans[i],'green');
					baidu.removeClass(rateSpans[i],'red');
					rate = rate + '%';
				}else if(rate > 0){
					baidu.addClass(rateSpans[i],'red');
					baidu.removeClass(rateSpans[i],'green');
					rate = '+' + rate + '%';
				}else{
					rate = '-';
					baidu.removeClass(rateSpans[i],'red');
					baidu.removeClass(rateSpans[i],'green');
				}
				rateSpans[i].innerHTML = rate;
			}
			me.renderFlash(action);
		}
	}
}
