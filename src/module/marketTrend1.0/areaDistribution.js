/**
 * 市场风向标  地域分布模块
 * @author yangji01
 */
marketTrend.areaDistribution = {
	initAreaDistribution : function(action){
		 action.setContext('areaDistributionType',[{text:'行业饱和度',value:'0'},{text:'行业词检索量',value:'1'},{text:'商业检索量',value:'2'}]);
		 
		 action.setContext('areaType','0');
		 
		 // 区域映射表
        var regions = nirvana.config.region, map = {};
        for(var i = 0, item; item = regions[i]; i++) {
            map[item[1]] = item[0];
        }
        
        var keys = [null, 'id', 'epvRate'],
        values = [function(index) {
            // index是排名的数字
            var value = '<label>' + index + '</label>';
            if (index >= 1 && index <= 3) {
                return '<span class="top3">' + value + '</span>';
            } else if (index === 10) {
                return '<span class="tenth">' + value + '</span>';
            } else {
                return '<span>' + value + '</span>';
            }
        }, function(item) {
            var id = item.id;
            // 传入地域ID，需转成汉字
            return map[id];

        }, function(item) {
           var rate = item.epvRate;
            /*if(action.getContext('areaType') == 0){
            	rate = floatToPercent(rate);
            }else{
            	rate = '约' + rate;
            }*/
           rate = floatToPercent(rate);
           return '<div class="valueBar"/></div><span class="valueLiteral">' + rate + '</span>';
        }];

        action.setContext('searchAmountKeys', keys);
        action.setContext('searchAmountValues', values);
	},
    getAreaDistribution: function(action) {
        var me = action,
        	params ={},successFun,
        	starttime,endtime,areaTime,begin,end;
        	
        	areaTime = ui.util.get('areaDistributionTime').getValue();
        	begin = areaTime.begin;
        	end = areaTime.end;
        	
        	action.setContext('areaTime',areaTime);
        	
        	starttime = begin.getFullYear() + '-' + (begin.getMonth() + 1) + '-' + begin.getDate(),
            endtime = end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + end.getDate();
            
            params = {
                industryID: me.params.industryID,
                starttime: starttime,
                endtime: endtime,
                type: me.getContext('areaType')
            };
            successFun = function(json) {
            	switch(me.getContext('areaType')){
					case '0':
						marketTrend.index.flash.vars.areaDistribution.name = '行业饱和度';
						marketTrend.index.flash.vars.areaDistribution.type = 0;
						break;
					case '1':
						marketTrend.index.flash.vars.areaDistribution.name = '行业词检索量占比';
						marketTrend.index.flash.vars.areaDistribution.type = 0;
						break;
					case '2':
						marketTrend.index.flash.vars.areaDistribution.name = '商业检索量占比';
						marketTrend.index.flash.vars.areaDistribution.type = 0;
						break;
				}
                marketTrend.areaDistribution.renderAreaDistribution(json.data);
            };
        
        me._request(2, params, successFun);
    },
    renderAreaDistribution: function(data) {
        // 设置topN
        ui.util.get('searchAmount').refresh(data);
        var flashID = 'areaDistributionFlash';

        marketTrend.index.flash.map[flashID] = data;

        // 初始化flash
        baidu.g('areadistribution_flash').innerHTML = baidu.swf.createHTML({
            id: flashID,
            url: './asset/swf/Map_Info.swf',
            
            height: 287,
            scale : 'exactfit',
            wmode : 'Opaque',
            allowscriptaccess : 'always',
            vars: {baseUrl: './asset/swf/fla', loadedCallback: 'marketTrend.index.flash.callback'}
        });
        
    },
    firstAreaDistribution: function(action){
    	ui.util.get('areaDistributionType').setValue('0');
        	
    	ui.util.get('setArea').onclick = marketTrend.areaDistribution.setAreaHandler;
    	
    	ui.util.get('areaDistributionType').onselect = marketTrend.areaDistribution.setTypeHandler(action);
    	
    	ui.util.get('areaDistributionTime').onselect = marketTrend.areaDistribution.setTimeHandler(action);
    },
    //设置账户地域
    setAreaHandler : function() {
        nirvana.util.openSubActionDialog({
            id : 'accountRegionDialog',
            title : '账户推广地域',
            width : 440,
            actionPath : 'manage/region',
            params : {
                type: 'account',
                wregion: 0
            }
        });
    },
    //设置指标
    setTypeHandler : function(action){
    	return function(type){
    		if(type != action.getContext('areaType')){
	    		action.setContext('areaType',type);
	    		var bubble = $$('#market_areadistribution .ui_bubble');
				
				switch(type){
					case '0':
						baidu.setAttr(bubble[0],'bubbletitle','行业饱和度地域分布');
						//baidu.removeClass($$('#market_areadistribution .error_area')[0],'hide');
						break;
					case '1':
						baidu.setAttr(bubble[0],'bubbletitle','行业词检索量地域分布');
						//baidu.removeClass($$('#market_areadistribution .error_area')[0],'hide');
						break;
					case '2':
						baidu.setAttr(bubble[0],'bubbletitle','商业检索量地域分布');
						//baidu.addClass($$('#market_areadistribution .error_area')[0],'hide');
						break;
				}
	    		marketTrend.areaDistribution.getAreaDistribution(action);
    		}
    	}
    },
    //选择时间
    setTimeHandler : function(action){
    	return function(){
    		var areaTime = ui.util.get('areaDistributionTime').getValue(),
    			time = action.getContext('areaTime');
    		if(!(time && areaTime.begin == time.begin && areaTime.end == time.end)){
    			marketTrend.areaDistribution.getAreaDistribution(action);
    		}
    	}
    }
}
