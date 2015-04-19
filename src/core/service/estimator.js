/**
 * fbs.estimator
 * 相关接口
 * @author chenjincai@baidu.com
 */
fbs = fbs || {};

fbs.estimator = {};

/**
 * 获取估算结果
 * @param {Object} param
 */
fbs.estimator.getResult = fbs.interFace({
	path: "GET/bidestimate",
    necessaryParam: {
        keywords: [],
        daymaxbid: 0,
        areas: ''
	},
	optionalParam: {
        vcode: ''
	},
	validate: fbs.validate.estimator

});


