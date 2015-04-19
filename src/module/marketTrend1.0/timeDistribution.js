/**
 * 市场风向标   时段分布模块
 * @author yangji01
 */
marketTrend.timeDistribution = {
	initTimeDistribution : function(action) {
            action.setContext('timeDistributionType',[{text:'行业饱和度',value:'0'},{text:'行业词检索量',value:'1'},{text:'商业检索量',value:'2'}]);
            action.setContext('timeDistributionTime',[{text:'最近7天',value:0},{text:'最近1天',value:1}]);
            
            //设置指标的默认值
            action.setContext('timeTypeValue','0');
            //设置时间的默认值  用来区别是最近1天 还是最近7天
            action.setContext('timeTimeValue',0);
            //设置时间模式的默认值
            action.setContext('timeMode',0);
    },
    
    /**
     * 请求时段分布的数据
     * @param {number} timeMode 对应值如下：
     * 0: 最近7天 全部平均
     * 1: 最近7天 工作日平均
     * 2: 最近7天 周末平均
     * 
     */
    getTimeDistribution: function(action) { 
        var initedMap = action.params.initedMap,
        	timeMode,
        	timeType,
        	timeValue,
        	starttime,
        	endtime;
        	
        if (!initedMap.time) {
            marketTrend.timeDistribution.firstTimeDistribution(action);
        }
        
        // 默认：最近1天
        timeValue = action.getContext('timeTimeValue');
        timeType = action.getContext('timeTypeValue');
        timeMode = action.getContext('timeMode');
        
        var sevenDayBefore  = new Date(nirvana.env.SERVER_TIME * 1000),
        	oneDayBefore  = new Date(nirvana.env.SERVER_TIME * 1000),
        	day = new Date(nirvana.env.SERVER_TIME * 1000);
        
        sevenDayBefore.setDate(day.getDate() - 7);
        oneDayBefore.setDate(day.getDate() - 1);
        
        endtime = baidu.date.format(new Date(oneDayBefore), 'yyyy-MM-dd');
        //最近1天
        if(timeValue == 1){
        	starttime = endtime;
        }else{
        //最近7天
        	starttime = baidu.date.format(new Date(sevenDayBefore), 'yyyy-MM-dd');
        }
        var me = action,
            params = {
                industryID: me.params.industryID,
                timeMode: timeMode,
                type: timeType,
                starttime: starttime,
                endtime: endtime
            },
            successFun = function(json) {
                marketTrend.timeDistribution.resetTimeDistribution(me,timeMode, json.data);
            };
        me._request(1, params, successFun);
    },
    
    // 初始化，只执行一次的动作
    firstTimeDistribution: function(action) {
        var me = action,
            timeDistributionType = ui.util.get('timeDistributionType'),
        	timeDistributionTime = ui.util.get('timeDistributionTime');
        
        //设置select
        timeDistributionType.setValue('0');
		timeDistributionTime.setValue('0');
		
        //选择时间
        ui.util.get('timeDistributionTime').onselect = function(value) {
        	if(value != action.getContext('timeTimeValue')){
	            if (value == 0) {
					baidu.removeClass(baidu.g('timeDistribution_radio'),'hidden');
	            } else {
	                baidu.addClass(baidu.g('timeDistribution_radio'),'hidden');
	            }
	            me.setContext('timeTimeValue',value);
	            me.getTimeDistribution(me);
            }
        }

		//选择指标
		ui.util.get('timeDistributionType').onselect = function(value){
			if(value != action.getContext('timeTypeValue')){
				me.setContext('timeTypeValue',value);
				var bubble = $$('#market_timedistribution .day .ui_bubble');
				
				switch(value){
					case '0':
						baidu.setAttr(bubble[0],'bubbletitle','行业饱和度时段分布');
						break;
					case '1':
						baidu.setAttr(bubble[0],'bubbletitle','行业词检索量时段分布');
						break;
					case '2':
						baidu.setAttr(bubble[0],'bubbletitle','商业检索量时段分布');
						break;
				}
				me.getTimeDistribution(me);
			}
		}
		
        // 最近七天 点击radio需刷新数据
        var el = baidu.q('options')[0];
        baidu.event.on(el, 'click', function(e) {
            var input = marketTrend.index.tools.getInput(e);
            
            if (input && input.value != me.getContext('timeMode')) {
                me.setContext('timeMode',input.value);
                me.getTimeDistribution(me);
            }
            
        });
    },
    // 卸载时用的，防止内存泄漏
    disposeTimeDistribution: function() {
                             
    },

    resetTimeDistribution: function() {
        
        var oneDayFlash, sevenDayFlash;
        
        return function(action,timeMode, data) {
            // 模块初始化部分
            var initedMap = action.params.initedMap,
            	node = baidu.g('timeDistribution_node'),
            	flashNode = baidu.g('timedistribution_flash');

            if (!initedMap.time) {
                initedMap.time = true;
            }
            
            // 上面都是准备阶段，逻辑从此正式开始
            
            // 设置高峰时段的li
            var topTimes = baidu.dom.query('li', node),
                formatTime = marketTrend.index.tools.formatTime;

            topTimes[0].innerHTML = formatTime(data[0].time);
            topTimes[1].innerHTML = formatTime(data[1].time);
            topTimes[2].innerHTML = formatTime(data[2].time);
            
            // 开始flash部分
            var flashID = timeMode == 0 ? 'time_distribution_oneday' : 'time_distribution_sevenday';

            // 创建flash
            marketTrend.index.flash.map[flashID] = data;
			switch(action.getContext('timeTypeValue')){
				case '0':
					marketTrend.index.flash.vars.timeDistribution.name = '行业饱和度';
					marketTrend.index.flash.vars.timeDistribution.type = 0;
					break;
				case '1':
					marketTrend.index.flash.vars.timeDistribution.name = '行业词检索量占比';
					marketTrend.index.flash.vars.timeDistribution.type = 0;
					break;
				case '2':
					marketTrend.index.flash.vars.timeDistribution.name = '商业检索量占比';
					marketTrend.index.flash.vars.timeDistribution.type = 0;
					break;
			}
			
            var flashConfig = {
                id: flashID,
                url: './asset/swf/vane_bar.swf',
                height: 220,
                scale : 'exactfit',
                wmode: 'transparent',
                allowscriptaccess : 'always',
                vars: {loadedCallback: 'marketTrend.index.flash.callback'}
            };

            flashNode.innerHTML = baidu.swf.createHTML(flashConfig);
        }
    }()
}
