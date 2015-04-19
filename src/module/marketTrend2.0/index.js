/**
 * 市场风向标2.0
 * @author mayue
 * @date 2012-11-26
 */
marketTrend.index2 = new er.Action({
    VIEW : 'marketTrendIndex2',
    UI_PROP_MAP : {},
    CONTEXT_INITER_MAP: {},
    onentercomplete : function() {},
    onafterrender: function(){
        var me = this;
        marketTrend.control.businessDivide.dispose();
        marketTrend.control.init();
        me.initEvents();
    },
    initEvents: function(){
    	baidu.each($$('#marketHead .lift span'),function(item){
        	item.onclick = function(e){
        	    marketTrend.tool.liftTo(e);
        	    marketTrend.log.click('headLift');
        	}
        });
        // 返回 按钮
        baidu.g('marketBackBtn').onclick = function() {
            er.locator.redirect('/overview/index');
            return false;
        };
    }
});

// 工具方法集
marketTrend.tool = {
	/*
	 * 通过旺季开始和结束时间，得出旺季的json
	 * @param 
	 * begin {int} 旺季开始时间的毫秒数
	 * end {int} 旺季结束时间的毫秒数
	 * @return {object} 形如
	 * {
	 * 	ishot: true/false, //是否显示旺季提示
	 * 	timeleft: 3	//距离旺季的天数
	 * }
	 */
	formatHotObject: function(begin, end){
		var obj = {};
		if (nirvana.env.SERVER_TIME*1000 < begin){
			if (begin - nirvana.env.SERVER_TIME*1000 > 30*24*3600*1000) {
				obj.ishot = false;
			} else {
				obj.ishot = true;
				obj.timeleft = Math.ceil((begin - nirvana.env.SERVER_TIME*1000)/(24*3600*1000));
			}
		} else {
			if (nirvana.env.SERVER_TIME*1000 < end){
				obj.ishot = true;
				obj.timeleft = 0;
			} else {
				obj.ishot = false;
			}
		}
		return obj;
	},
	getShortBusinessName: function(rawName){
	    var shortName;
	    if (rawName.indexOf('>') > 0){
            var nameArray = rawName.split('>');
            shortName = nameArray[nameArray.length - 1];
        } else {
            shortName = rawName;
        }
        
        return shortName;
	},
	//电梯直达
    liftTo:function(e){
    	var e = e || window.event,
    		target = e.target || e.srcElement,
    		targetId = baidu.getAttr(target,'targetId');
    	
    	if(baidu.browser.chrome){
    		document.body.scrollTop = baidu.g(targetId).offsetTop;
    	}else{
    		document.documentElement.scrollTop = baidu.g(targetId).offsetTop;
    	}
    },
    //回到顶部
    goBack:function(){
        if(baidu.browser.chrome){
            document.body.scrollTop = 0;
        }else{
            document.documentElement.scrollTop = 0;
        }
        marketTrend.log.click('backToTop');
    }
}
marketTrend.log ={
    head: 'marketTrend_',
    //点击
    click: function(mark, extraParam){
        var param = {};
        param.target = this.head + mark + '_click';
        if (extraParam) {
            baidu.extend(param, extraParam);
        }
        this.send(param);
    },
    //查询行业数
    queryBusiness: function(){
        var param = {};
        param.target = this.head + 'queryBusiness';
        this.send(param);
    },
    //出现次数 旺季预算提示、提价关键词、新增关键词
    show: function(mark){
        var param = {};
        param.target = this.head + mark + '_show';
        this.send(param);
    },
    //修改  地域、预算等
    mod: function(mark, extraParam){
        var param = {};
        param.target = this.head + mark + '_mod';
        if (extraParam) {
            baidu.extend(param, extraParam);
        }
        this.send(param);
    },
    //添加关键词
    add: function(mark, extraParam){
        var param = {};
        param.target = this.head + mark + '_add';
        if (extraParam) {
            baidu.extend(param, extraParam);
        }
        this.send(param);
    },
    //添加关键词
    addSuccess: function(mark, extraParam){
        var param = {};
        param.target = this.head + mark + '_addSuccess';
        if (extraParam) {
            baidu.extend(param, extraParam);
        }
        this.send(param);
    },
    download: function(mark){
        var param = {};
        param.target = this.head + mark + '_download';
        this.send(param);
    },
    downloadAll: function(mark){
        var param = {};
        param.target = this.head + mark + '_downloadAll';
        this.send(param);
    },
    send: function(param){
        var commonParam = {
            businessId: marketTrend.control.businessDivide.data.business[marketTrend.control.businessDivide.data.currentIndex].id
        };
        baidu.extend(param, commonParam);
        NIRVANA_LOG.send(param);
    }
};
