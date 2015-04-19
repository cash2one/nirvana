// by liuyutong 批量下载工具
Requester.debug.CHECK_batchdownload = function() {
	var rel;
	var arr = [], num = Math.floor(Math.random() * 10);

	arr.push({
				"data" : {
					"path" : "ftp://fengchao.baidu.com/batch/xx.csv",
					"stat" : "SUCCESS",
					"finish" : '2011-08-01'
				},
				"status" : 200,
				"errorCode" : null
			});
	arr.push({
				"data" : {
					"path" : null,
					"stat" : "NOT_STARTED",
					"finish" : null
				},
				"status" : 200,
				"errorCode" : null
			});
	arr.push({
				"data" : {
					"path" : null,
					"stat" : "PROCESSING",
					"finish" : null
				},
				"status" : 200,
				"errorCode" : null
			});
	arr.push({
				"data" : {
					"path" : null,
					"stat" : "PROCESS_FAILED",
					"finish" : null
				},
				"status" : 400,
				"errorCode" : null
			});
	arr.push({
				"data" : {
					"path" : null,
					"stat" : "SYSTEM_FAILED",
					"finish" : null
				},
				"status" : 400,
				"errorCode" : null
			});
	if (num > 4) {
		num = 2
	}
	rel = arr[num];

	return rel;
};
Requester.debug.ADD_batchdownload = function() {
	var rel = new Requester.debug.returnTpl();
	rel.status = [200, 400, 403][Math.round(Math.random() * 100) % 3];
	rel.errorCode = {
		code : 1261
	};
	return rel;
};
