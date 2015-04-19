/**
 * 添加关键词
 */
Requester.debug.ADD_keyword = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel = {
		"data" : [],
         // 模拟数据请求延迟
        "timeout": 1000,
		"status" : 200,
		"error" : [/*
					 * { "message":
					 * "超长测试超长测试超长测试超长测试超长测试超长测试超长测试超长测试超长测试超长测试超长测试超长测试超长测试超长测试关键字中触犯黑名单规则 ",
					 * "code": 634, "detail": null, "idx": 0 },
					 */{
					"message" : "关键字触犯黑名单规则 法轮功",
					"code" : 635,
					"detail" : null,
					"idx" : 3
				}]
	};
	
	for (var i in param.keywords) {
		rel.data.push({
					"index" : i,
					"status" : 0,
					"winfoid" : 126118 + i,
					"wordid" : 336553 + i,
					"showword" : param.keywords[i],
					"bid" : null
				});
	}

	return rel;

};

Requester.debug.ADD_keyword_batchwords = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	/*
	 * rel.status = 400; rel.error = [{ message : '1234', code : 636, idx : 0,
	 * detail: null }];
	 */
	// return {"error":[{"message":"电话客服管理软件", "code":636, "idx":0,
	// "detail":null}], "data":[],"status":400}
	// rel.error = [{code: 633, message: '关键词abc'}];
	// rel.data = [
	//    {index: 0},
	//    {index: 2}
	// ];
	// rel.status = 300;
    // rel.timeout = 1500;
	return rel;
};
/**
 * 添加关键词到不同单元 ADD/keyword/diffunit
 */
Requester.debug.ADD_keyword_diffunit = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	rel = {
		"data" : [{
					"index" : 0,
					"status" : 0,
					"winfoid" : 126118,
					"wordid" : 336553,
					"showword" : "鹌鹑",
					"bid" : null
				}, {
					"index" : 1,
					"status" : 0,
					"winfoid" : 126121,
					"wordid" : 7924968,
					"showword" : "巧克力豆",
					"bid" : null
				}],

		"status" : 300,

		"error" : [{
					"message" : "关键字中触犯黑名单规则  ",
					"code" : 643,
					"detail" : null,
					"idx" : 0
				}, {
					"message" : "关键字触犯黑名单规则 法轮功",
					"code" : 635,
					"detail" : null,
					"idx" : 3
				}]
	}

	rel.status = 200;
	rel.error = [];

	return rel;
};

/**
 * 转移关键词
 */
Requester.debug.TRANS_keyword = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	rel = {
		"data" : {
			'total' : 100,
			'failcount' : 0,
			unitid : 10101
		},

		"status" : 200,

		"errorCode" : {
			"message" : " ",
			"code" : 607,
			"detail" : {
				'wordfail' : baidu.json.stringify([{
							'winfoid' : '101',
							'showword' : '失败关键词'
						}, {
							'winfoid' : '102',
							'showword' : '失败关键词'
						}, {
							'winfoid' : '103',
							'showword' : '失败关(*&^%键词'
						}, {
							'winfoid' : '104',
							'showword' : '失败关<script>键词'
						}]),
					/*	*/
                'devicefail': baidu.json.stringify([{
                            'winfoid' : '101',
                            'showword' : '转移失败关键词'
                        }, {
                            'winfoid' : '102',
                            'showword' : '转移失败关键词'
                        }, {
                            'winfoid' : '103',
                            'showword' : '转移失败关(*&^%键词'
                        }, {
                            'winfoid' : '104',
                            'showword' : '转移失败关<script>键词'
                        }]),
                        
				'wordrepeat' : baidu.json.stringify([{
							'winfoid' : '101',
							'showword' : '失败关键词'
						}, {
							'winfoid' : '102',
							'showword' : '失败关键词'
						}, {
							'winfoid' : '103',
							'showword' : '失败关(*&^%键词'
						}, {
							'winfoid' : '104',
							'showword' : '失败关<script>键词'
						}])
			},
			"idx" : 0
		}
	}

	return rel;
};
Requester.debug.MOD_keyword = function() {
	var rel = new Requester.debug.returnTpl();
	// rel.status = 300;
	rel.data = {}
	return rel;

};
Requester.debug.MOD_keyword_diffbid = function() {
	var rel = new Requester.debug.returnTpl();
	// rel.status = 300;
	rel.data = {}
	return rel;

};

Requester.debug.MOD_keyword_diffwmatch = function() {
    var rel = new Requester.debug.returnTpl();
    // rel.status = 300;
    rel.data = {}
    return rel;
};

/**
 * 临时添加 关键词删除
 */
Requester.debug.DEL_keyword = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = 1;
	return rel;
};