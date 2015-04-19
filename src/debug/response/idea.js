
/**
 * 添加创意
 */
Requester.debug.ADD_idea = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel = {
		"data" : [{
					"index" : 2,
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

		"status" : 200,// 批量添加创意测试时将400改为200 mayue@baidu.com

		"errorCode" : {
			"message" : " ",
			"code" : 714,
			"detail" : {
				'title' : 'URL主域名和注册网站不一致',
				'desc1' : UC_CV_AKA
			},
			"idx" : 0
		}
	}

	return rel;
};

/**
 * 添加创意
 */
Requester.debug.MOD_idea = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel = {
		"data" : [{
					"index" : 2,
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

		"status" : 200,

		"errorCode" : {
			"message" : " ",
			"code" : 714,
			"detail" : {
				'title' : UC_CV_AKA
			},
			"idx" : 0
		}
	}

	return rel;
};

/**
 * 修改创意
 */
Requester.debug.MOD_ideainfo_content = function(level, param) {
	return this.MOD_idea(level, param);
};
Requester.debug.DEL_idea = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = 1;
	return rel;
};
// 获取创意对应的优选关键词接口
Requester.debug.GET_eos_ideaselectedkeyword = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		listData : [{
					winfoid : 1,
					showword : "参考词1"
				}, {
					winfoid : 2,
					showword : "参考词2"
				}]
	}
	return rel;

};
Requester.debug.ADD_eos_unitsingroup = function() {
	var rel = new Requester.debug.returnTpl();
	rel.error = null;
	return rel;
};

Requester.debug.GET_eos_url = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		url : 'http://www.baidu.com'
	};
	return rel;
};

Requester.debug.GET_eos_unitsingroup = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		groupcount : 4,
		grouplist : [[1, 2, 3], [4, 5, 6], [1, 2, 3], [4, 5, 6]]
	};

	return rel;
};

Requester.debug.GET_eos_recmideas = function() {
	var rel = new Requester.debug.returnTpl();
    
    var random = Math.random();
	rel.data = {
        hasmore: 1,
        targetword: '' + random
    }

    if (random > 0.2) {
        rel.data.recmideas = [
            { 
                title: '标题' + random,
                desc1: '描述啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
                desc2: '描述丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫'
            },
            { 
                title: '标题' + random,
                desc1: '描述啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
                desc2: '描述丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫'
            },
            { 
                title: '标题' + random,
                desc1: '描述啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊',
                desc2: '描述丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫丫'
            }
        ];
    }

	return rel;
};

Requester.debug.GET_eos_winfooverview = function() {
	var rel = new Requester.debug.returnTpl();
	var random = ('' + Math.random() * 10).replace(/\D/g, ''), list = [];

	for (var i = 0; i < 20; i++) {
		list.push({
					planid : 123123,
					planname : '计划窝窝窝窝窝窝窝窝窝窝我',
					unitid : 12312312,
					unitname : '单元靠靠啊卡考啊啊啊卡啊喀喀喀',
					words : [{
								winfoid : 12312312,
								showword : '1111-' + random
							}, {
								winfoid : 12312312,
								showword : '2222-' + random
							}, {
								winfoid : 12312312,
								showword : '3333-' + random
							}

					]
				});
	}

	rel.data = {
		listData : list
	};

	return rel;
};


Requester.debug.ADD_batchidea = function() {

	return {
		"data":null,
		"error":{
			"64573810":{
				"idea":{
					"code":11111,
					"message":"陈超你妹",
					"detail":{
						"desc2":"描述2触犯黑名单规则 官方网站"
					},
					"idx":1
				}
			}
		},
		"status":400,
		"errorCode":null
	}
}