/**
 * @file core/service/fuseSuggestion.js 融合的ajax相关定义
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

fbs = fbs || {};

fbs.fuseSuggestion = {};

/**
 * 获取优化建议列展开收起状态
 * @author Leo Wang(wangkemiao@baidu.com)
 */
fbs.fuseSuggestion.getHideopenStat = fbs.interFace({
    path : 'GET/fuse/hideopen',
    
    necessaryParam : {
        typeset : [66]
    }
});

/**
 * 修改优化建议列展开收起状态
 * @author Leo Wang(wangkemiao@baidu.com)
 */
fbs.fuseSuggestion.modHideopenStat = fbs.interFace({
    path: 'MOD/fuse/hideopen',
    necessaryParam: {
        type: 66,
        value: 1
    }
});

/**
 * 获取优化建议
 * @author Leo Wang(wangkemiao@baidu.com)
 */
fbs.fuseSuggestion.getSuggestion = fbs.interFace({
    path: 'GET/fuse/mtlsug',
    necessaryParam: {
        level: 'planinfo',
        needMtlInfo: true,
        sugReqItems: [
            {
                planid: 123, // or unitid, winfoid, ideaid
                reason: 103,
                suggestion: 1002
            }
        ]
    }
});