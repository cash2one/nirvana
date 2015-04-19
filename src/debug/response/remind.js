
/**
 * 获取提醒列表
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_remind_message = function(level, param) {
	// var rel = new Requester.debug.returnTpl();
	var rel = {
		status : 200,
		data : {},
		error : {}
	};
	var relList = [];
	for (var i = 0; i < 0; i++) {
		relList.push({
					createtime : "2010-10-10 10:10",
					content : i + "\"658\"账户 到达预算下线账户 到达预算下线账户 到达预算下线"
				});
	}
	rel.data.listData = relList;
	return rel;
};

/**
 * 获取提醒规则列表
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_remind_rule = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	// rel.status = 500;
	var relList = [];
	var len = Math.round(Math.random() * 100) % 50;
	var len = 0;
	for (var i = 0; i < len; i++) {
		var _ruleid = i + 132;
		var _targetType = [2, 3, 7, 11][Math.round(Math.random() * 100) % 4];
		var _remindContent = ["", "", [0, 1], [0, 0], "", "", "", [2, 2], "",
				"", "", [2, 3]][_targetType][Math.round(Math.random() * 100)
				% 2];
		var _targetValue = [];
		if (_targetType == 2) {
			_targetValue.push({
						id : 100,
						name : "账户"
					});
		} else {
			for (var j = 1, len2 = Math.round(Math.random() * 100) % 5 + 1; j < len2; j++) {
				_targetValue.push({
							id : 1000 + j,
							name : "某<b>种</b>很长很长的物料，\"真'的很长特别长啊长长长长"
						});
			}
		}
		var _customValue = {};
		if (_remindContent == 1) {
			_customValue = {
				paysum : Math.round(Math.random() * 1000) / 100
			}
		}
		relList.push({
					ruleid : _ruleid,
					targetType : _targetType,
					remindContent : _remindContent,
					targetValue : _targetValue,
					remindWay : [[1], [2], [4], [1, 2], [1, 4], [2, 4],
							[1, 2, 4]][Math.round(Math.random() * 100) % 7],
					customValue : _customValue
				});
	}
	rel.data.listData = relList;
	return rel;
};
/**
 * 删除提醒规则
 */
Requester.debug.DEL_remind_rule = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {}
	return rel;
};
Requester.debug.ADD_remind_rule = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		ruleid : 324
	}
	return rel;
};
