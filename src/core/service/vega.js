/**
 * fbs.vega
 * 
 * path:    src/core/service/vega.js
 * desc:    涅槃调用vega中的接口
 * author:  yangji01@baidu.com
 * date:    $Date: 2013/1/7
 */

fbs = fbs || {};

fbs.vega = {};

/**
 * 获取vega中的物料 
 */
fbs.vega.getMaterial = fbs.interFace({
    path: "GET/vega/material",
    necessaryParam: {
        fields : []
    }
})


/**
 * 批量添加创意转移至vega中
 */
fbs.vega.addBatchIdea = fbs.interFace({
    path: "ADD/batchidea"
});