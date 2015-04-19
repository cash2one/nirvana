Requester.debug.ADD_unit = function() {
	var rel = new Requester.debug.returnTpl();

	rel.data = {
		unitid : 112
	}
	return rel;
};
Requester.debug.DEL_unit = function() {
    var rel = new Requester.debug.returnTpl();
    return rel;
};
Requester.debug.MOD_unit = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	rel.data = {};
	var uid;
	var state = param.items.pausestat;
	for (var i = 0, l = param.unitid.length; i < l; i++) {
		uid = param.unitid[i];
		rel.data[uid] = {
			"planid" : uid,
			"pausestat" : state,
			"planstat" : state
		}
	}
	return rel;
};

// 批量添加创意获取单元 mayue@baidu.com
Requester.debug.GET_eos_emptyideaunits = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		listData : [{
					planid : 3,
					planname : "鲜花",
					unitlist : [{
								unitid : 45,
								unitname : "玫瑰"
							}, {
								unitid : 46,
								unitname : "康乃馨"
							}, {
								unitid : 48,
								unitname : "紫罗兰"
							}, {
								unitid : 49,
								unitname : "铁树"
							}]
				}, {
					planid : 9,
					planname : "野生",
					unitlist : [{
								unitid : 90,
								unitname : "牵牛"
							}, {
								unitid : 98,
								unitname : "蒲公英"
							}]
				}]
	}
	return rel;

};
