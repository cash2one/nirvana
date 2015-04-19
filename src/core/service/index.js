/**
 * fbs.index
 * 推广概况首页的一些接口
 * @author zhujialu@baidu.com
 */

fbs = fbs || {};

fbs.index = {};

/**
 * 展开收起状态
 */
fbs.index.getHideOpen = fbs.interFace({
    path: fbs.config.path.GET_PROFILE_HIDEOPEN,
    necessaryParam: {
        typeset: [61, 62, 63]
    }
});
fbs.index.setHideOpen = fbs.interFace({
    path: 'MOD/profile/hideopen',
    necessaryParam: {
        type: 61,
        value: 1
    }
});

fbs.index.vState = fbs.interFace({
    path: 'GET/profile/vstat',
    necessaryParam: {}
});
// Deleted by Wu Huiyao
/*fbs.index.accountScore = fbs.interFace({
    path: 'GET/profile/accntscore',
    necessaryParam: {
        startdate: '',
        enddate: ''
    }
});
fbs.index.accountDetail = fbs.interFace({
    path: 'GET/profile/accntdetail',
    necessaryParam: {}
});*/

fbs.index.coupon = fbs.interFace({
    path: 'GET/profile/coupon',
    necessaryParam: {}
});

fbs.accountscore = fbs.accountscore || {};
/**
 * 请求账户质量评分同行数据的接口
 * @author Wu Huiyao 
 */
fbs.accountscore.peerData = fbs.interFace({
	path: 'GET/accountscore/peerdata',
    necessaryParam: {}
});
/**
 * 请求账户质量评分各项指标的历史数据接口，用于账户质量评分的Flash图表
 * @author Wu Huiyao 
 */
fbs.accountscore.historyData = fbs.interFace({
	path: 'GET/accountscore/history',
    necessaryParam: {}
});
/**
 * 请求账户质量评分各项指标的摘要数据接口：点击、展现、浏览与转化和账户质量
 * @author Wu Huiyao 
 */
fbs.accountscore.abstractData = fbs.interFace({
	path: 'GET/accountscore/abs',
    necessaryParam: {}
});