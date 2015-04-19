/**
 * fbs.remind
 * 提醒相关
 */

fbs = fbs || {};

fbs.remind = {};

/**
 * 获取提醒列表
 * @param {Object} param {
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数	
 * }
 * @author zuming@baidu.com
 */
fbs.remind.getRemindList = fbs.interFace({
	path: "GET/remind/message",
	nameSpace: "fbs.remind",
	interFaceName: "getRemindList"
});


/**
 * 获取提醒规则列表
 * @param {Object} param
 */
fbs.remind.getRule = fbs.interFace({
	path: "GET/remind/rule"
});



/**
 * 新增提醒规则
 * @param {Object} param {
 *
 *			targetType: "", //2 | 3 | 7 | 11, 2:账户,3:计划,7:词,11:创意"
 *			remindContent: "", // 0 | 1 | 2 | 3, 0:到达预算下线，1:当日消费达到指定额度，2:不宜推广导致无展现资格，3:PV过低导致无展现资格
 *			targetValue: fbs.validate.remindRule.targetValue, // 物料对象id数组
 *			remindWay: fbs.validate.remindRule.remindWay // [1,2,4] 1:消息提醒，2:短信提醒，4:邮件提醒
 * }
 */
fbs.remind.addRule = fbs.interFace({
	path: "ADD/remind/rule",
	necessaryParam: {
		wremindRule: {
			targetType: "",
			remindContent: "",
			targetValue: "",
			remindWay: [1, 2, 4]
		}
	},
	optionalParam: {
		wremindRule: {
			customValue: {
				paysum: 1
			}
		}
	},
	validate: fbs.validate.remindRule
});

/**
 * 删除提醒规则
 * @param {Object} param
 */
fbs.remind.delRule = fbs.interFace({
	path: "DEL/remind/rule",
	necessaryParam: {
		ruleids: '' // 规则ID
	}
}); 

/**
 * 修改提醒规则
 * @param {Object} param
 */
fbs.remind.modRule = fbs.interFace({
	path: "MOD/remind/rule",
	necessaryParam: {
		wremindRule: {
		    ruleid: "",
			targetType: "",
			remindContent: "",
			targetValue: [],
			remindWay: [1,2,4]
		}
	},
	optionalParam: {
		wremindRule: {
			customValue: {
				paysum: 1
			}
		}
	},
	validate: fbs.validate.remindRule
});
