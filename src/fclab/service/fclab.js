/**
 * fbs.fclab相关接口
 * @author zhouyu01@baidu.com
 */
fbs = fbs || {};

fbs.fclab = {};

/**
 * 账户实验室增加反馈建议
 */
fbs.fclab.addAdvice = fbs.interFace({
	path: "lab/ADD/advice",
	
	necessaryParam: {
  		"level":"账户实验室",
		"content":"反馈建议的内容放在这里啊"
	}
});