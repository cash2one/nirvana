/**
 * fbs.marketTrend
 * 市场风向标相关接口
 * @author zhujialu@baidu.com
 */

fbs = fbs || {};

fbs.marketTrend = {};

/**
 * 请求市场风向标首页数据
 * @author zhujialu@baidu.com
 */
fbs.marketTrend.getIndexData = fbs.interFace({
    path: 'GET/markettrend/index',
    necessaryParam: {}
});

/**
 * 获得行业信息
 */
fbs.marketTrend.getMyTrade = fbs.interFace({
    path: 'GET/markettrend/mytrade',
    necessaryParam: {}
});

/**
 * 请求地域分布数据
 * @author zhujialu@baidu.com
 */
fbs.marketTrend.getAreaDistribution = fbs.interFace({
    path: 'GET/markettrend/areadistribution',
    necessaryParam: {
        industryID: '', // 第三级行业ID
        starttime: '', // 开始时间
        endtime: '',    // 结束时间
    	type: 0        //指标 行业饱和度  行业词检索量 商业检索量 分别为 0 1 2
    }
});

/**
 * 请求我的趋势数据
 * @author zhujialu@baidu.com
 */
fbs.marketTrend.getMyTrend = fbs.interFace({
    path: 'GET/markettrend/mytrend',
    necessaryParam: {
        industryID: '', // 第三级行业ID
        starttime: '', // 开始时间
        endtime: ''    // 结束时间
    }
});

/**
 * 请求我的行业规模
 * @author yangji01@baidu.com
 */
fbs.marketTrend.getIndustryTrend = fbs.interFace({
    path: 'GET/markettrend/trenddistribution',
    necessaryParam: {
        industryID: '', // 第三级行业ID
        starttime: '', // 开始时间
        endtime: '',    // 结束时间
        type:0        //指标 行业饱和度  行业词检索量 商业检索量 分别为 0 1 2
    }
});
/**
 * 请求时段分布数据
 * @author zhujialu@baidu.com
 */
fbs.marketTrend.getTimeDistribution = fbs.interFace({
    path: 'GET/markettrend/timedistribution',
    necessaryParam: {
        industryID: '', // 第三级行业ID
        timeMode: 0,    // 最近7天中的查看模式  全部平均 工作日平均 周末平均  分别为0 1 2
        starttime:'',   // 开始时间
        endtime:'',     // 结束时间
        type: 0         //指标 行业饱和度  行业词检索量 商业检索量 分别为 0 1 2
    }
});

/**
 * 请求关键词展现排行数据
 */
fbs.marketTrend.getWordsTrendMarket = fbs.interFace({
    path: 'GET/markettrend/wordstrend'
});
fbs.marketTrend.getWordsTrendIndustry = fbs.interFace({
    path: 'GET/markettrend/epvwordstrend'
});

/*****2.0接口*****/
fbs.mktinsight = {};
/**
 * 概况页数据获取
 */
fbs.mktinsight.getIndexData = fbs.interFace({
    path: 'GET/mktinsight/index'
});
/**
 * 行业分类
 */
fbs.mktinsight.getBusinessDivide = fbs.interFace({
    path: 'GET/mktinsight/industrys'
});
/**
 * 同行行业
 */
fbs.mktinsight.getPeer = fbs.interFace({
    path: 'GET/mktinsight/peerbusiness'
});
/**
 * 同行行业关键词
 */
fbs.mktinsight.getPeerWords = fbs.interFace({
    path: 'GET/mktinsight/peerbusiwords'
});
/**
 * 行业趋势
 */
fbs.mktinsight.getBusinessTrend = fbs.interFace({
    path: 'GET/mktinsight/trend'
});
/**
 * 行业趋势图表右侧的百分比数据
 */
fbs.mktinsight.getBusinessCompare = fbs.interFace({
    path: 'GET/mktinsight/trendRatio'
});
/**
 * 行业趋势图表解读
 */
fbs.mktinsight.getBusinessRead = fbs.interFace({
    path: 'GET/mktinsight/trendreading'
});
/**
 * 行业趋势图表旺季解读
 */
fbs.mktinsight.getBusinessHotRead = fbs.interFace({
    path: 'GET/mktinsight/hotreading'
});
/**
 * 行业趋势图表旺季解读 获取行业旺季词
 */
fbs.mktinsight.getBusinessHotWords = fbs.interFace({
    path: 'GET/mktinsight/hotwords'
});
/**
 * 行业趋势图表旺季解读 获取提价关键词
 */
fbs.mktinsight.getBusinessRaisedWords = fbs.interFace({
    path: 'GET/mktinsight/raisedwords'
});
/**
 * 行业趋势图表旺季解读 获取购买的关键词
 */
fbs.mktinsight.getBusinessBoughtWords = fbs.interFace({
    path: 'GET/mktinsight/boughtwords'
});
/**
 * 时段数据
 */
fbs.mktinsight.getBusinessHour = fbs.interFace({
    path: 'GET/mktinsight/hour'
});
/**
 * 行业趋势图表旺季解读 获取购买的关键词
 */
fbs.mktinsight.getWeekendWords = fbs.interFace({
    path: 'GET/mktinsight/weekendwords'
});
/**
 * 地域分布数据
 */
fbs.mktinsight.getBusinessArea = fbs.interFace({
    path: 'GET/mktinsight/region'
});
/**
 * 地域分布数据
 */
fbs.mktinsight.getBusinessAreaContend = fbs.interFace({
    path: 'GET/mktinsight/regionpeerbuy'
});
