
fbs = fbs || {};


/**
 * fbs.effectAnalyse
 * 推广回放接口
 * @author huanghainan@baidu.com
 */
fbs.effectAnalyse = {};

fbs.effectAnalyse.getEffectAuth = fbs.interFace({
    
    path: fbs.config.path.GET_EFFECTANA_AUTH,
    
    necessaryParam: {
        //userid: 313 //用户id
        
    }
    
});

fbs.effectAnalyse.getEffect = fbs.interFace({
    
    path: fbs.config.path.GET_EFFECTANA,
    
    
	necessaryParam: {
        level : "",
        fields : [],
        condition : {},
        starttime : "",
        endtime : "",
        limit : ""
    }
    
});