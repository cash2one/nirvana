
/**
 * 是否开通百度统计
 */
Requester.debug.IS_ContractSigned = function() {
	var rel = new Requester.debug.returnTpl();
	rel.data = 1; // 0 or 1
	return rel;
};
/**
 * 开通百度统计
 */
Requester.debug.SIGN_Contract = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = 1; // 0 or 1
	return rel;
};

/**
 * 请求网站列表（转化跟踪工具-->网站列表）
 */
Requester.debug.GET_Site_List = function(level, param) {
	var rel = new Requester.debug.returnTpl(),
		listData = [];
	
	for (var i = 0; i < 100; i++) {
		listData[i] = {
			siteid: i,
			site_url: "www.baidu.com/<button>" + i,
			transNum: Math.round(Math.random() * 100),
			status: i % 2,
			phoneTrackStatus: (i + 1) % 2
		};
	}
	rel.data = listData;
	return rel;
};

/**
 * 查询开放域名列表请求
 */
Requester.debug.GET_Domain_ListForSelect = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	
	rel.data = ['baidu.com','163.com','sina.com','ok.com','google.com'];
	
	return rel;
};

/**
 * 添加转化（转化跟踪工具-->新增转化）
 */
Requester.debug.ADD_Trans = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = 1;
	rel = {
	 	status : 400,
		data : '',
		errorCode : {
			code : 1537
		}
	 };
	return rel;
};

/**
 * 检查单一url（转化跟踪工具-->全面检查-->转化跟踪URL）
 */		
 Requester.debug.CHECK_SingleUrl = function(level, param) { 
	 var rel = new Requester.debug.returnTpl();
	 rel.data = true;
	 rel = {
	 	status : 400,
		data : '',
		errorCode : {
			message : '错误信息错误信息错误信息错误信息错误信息错误信息错误信息错误信息错误信息错误信息错误信息错误信息错误信息错误信息错误信息错误信息错误信息错误信息错误信息'
		}
	 };
	 // 模拟数据请求延迟
	 rel.timeout = 1000;
	 return rel; 
};
 

/**
 * 暂停-启用网站（转化跟踪工具-->网站列表-->启用/暂停）
 */
Requester.debug.SET_SiteStatus = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = 1;
	return rel;
};
/**
 * 删除指定网站（转化跟踪工具-->网站列表-->删除）
 */
Requester.debug.DEL_Site = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = 1;
	return rel;
};

/**
 * 获取代码（转化跟踪工具-->网站列表-->获取代码）
 */
Requester.debug.GET_JsCode = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = '<script type=\"text/javascript\">\nvar _bdhmProtocol = ((\"https:\" == document.location.protocol) ? \" https://\" : \" http://\");\ndocument.write(unescape(\"%3Cscript src=\'\" + _bdhmProtocol + \"hm.baidu.com/h.js%3F66d8521f54216b3903b0aef65806c363\' type=\'text/javascript\'%3E%3C/script%3E\"));\n</script>\n';
	return rel;
};
/**
 * 获取转化列表
 */
Requester.debug.GET_Trans_List = function(level, param) {
	var rel = new Requester.debug.returnTpl(),
		listData = [];
	
	for (var i = 0; i < 100; i++) {
        listData[i] = {
            siteid: i,
            trans_id: "1",
            name: "2注册跟踪&lt;/<button>" + i,
            step_url: "http://www.sina.com.cn/<button>" + i,
            siteUrl: "www.baidu.com" + i,
            step_type: i % 2,
            status: i % 2
        }
	}
	
	rel.data = listData;
	
	return rel;
};

/**
 * 开启或暂停转化路径
 */
Requester.debug.SET_Trans_Status = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = 1;
	return rel;
};

/**
 * 获取跟踪方式（转化跟踪工具-->跟踪方式设置链接）
 */
Requester.debug.GET_TrackType = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		trackType : 0, //0:url,1:cookie,2:不跟踪，-1:用户未进行设置，-2:不可设置，在首次推广URL检查完成前，用户不可设置
		cookieAuth : true //true or false
	};
	return rel;
};

/**
 * 跟踪方式设置（转化跟踪工具-->跟踪方式设置链接）
 */
Requester.debug.SET_TrackType = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = 1;
	return rel;
};

/**
 * 修改转化
 */
Requester.debug.MOD_Trans = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = 1;
	return rel;
};

/**
 * 删除转化路径
 */
Requester.debug.DEL_Trans = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = 1;
	return rel;
};

/**
 * 通过所属网站查找转化名称（转化跟踪工具-->转化数据）
 */
Requester.debug.GET_Trans_ListForSelect = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = [ {
		name : "转化名称A/<button>" + param.siteid,
		trans_id : "1"
	}, {
		name : "转化名称B/<button>" + param.siteid,
		trans_id : "2"
	} ];
	return rel;
};

/**
 * 通过所属网站查找转化名称，只取完全匹配模式的转化名称（转化跟踪工具-->全面检查）
 */
Requester.debug.GET_Trans_ListForCheckallSelect = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	
	rel.data = [ {
		name : "转化名称A/<button>" + param.siteid,
		trans_id : "1"
	}, {
		name : "转化名称B/<button>3MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM3MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM3MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM3MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM3MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM" + param.siteid,
		trans_id : "2"
	}, {
		name : "转化名称A/<button>" + param.siteid,
		trans_id : "3"
	}, {
		name : "转化名称A/<button>" + param.siteid,
		trans_id : "4"
	}];
	
	return rel;
};

/**
 * 获取发起查询网站列表（下拉框）请求
 */
Requester.debug.GET_Site_ListForSelect = function(level, param) {
	var rel = new Requester.debug.returnTpl(),
		listData = [];
	
	listData.push({
		site_url : 'dreams-travel.com',
		site_id : 1
	});
	listData.push({
		site_url : 'dreams\-travel.com/123',
		site_id : -2
	});
	listData.push({
		site_url : 'dreams&#8211;travel.com',
		site_id : 1
	});
	listData.push({
		site_url : 'dreams&#8211;travel.com/123',
		site_id : 3
	});
	listData.push({
		site_url : 'dreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreamsdreams-travel.com',
		site_id : 4
	});
	listData.push({
		site_url : 'dreams-travel.com/123',
		site_id : 3
	});
	listData.push({
		site_url : 'dreams<a>&</a>-travel.com',
		site_id : 4
	});
	listData.push({
		site_url : 'dreams-travel.com/123',
		site_id : 6
	});
	listData.push({
		site_url : 'dreams-travel.com/123',
		site_id : 3
	});
	listData.push({
		site_url : 'dreams<a>&</a>-travel.com',
		site_id : 11
	});
	listData.push({
		site_url : 'dreams-travel.com/123',
		site_id : 12
	});
	listData.push({
		site_url : 'dreams-travel.com/123',
		site_id : 13
	});
	listData.push({
		site_url : 'dreams<a>&</a>-travel.com',
		site_id : 14
	});
	listData.push({
		site_url : 'dreams-travel.com/123',
		site_id : 16
	});
	
	rel.data = listData;
	
	return rel;
};

/**
 * 获取转化列表的数据
 */
Requester.debug.GET_Trans_Data = function(level, param) {
	var rel = new Requester.debug.returnTpl(),
		listData = [];
	for (var i = 0; i < 0; i++) {
		listData[i] = {
			planid_name : "/<button>鲜花折\'\\\"lkj&lt;&gt;扣<a>" + i,
			unitid_name : "鲜花折扣",
			wordid_name : "鲜花折扣",
			trans : Math.round(Math.random() * 100),
			clks : Math.round(Math.random() * 100),
			paysum : fixed(Math.random() + Math.random() * 100)
		};
	}
	rel.data = listData;
	
	/**
	var temp = +prompt('是否NOTALL', 1);
	
	if (temp) {
		rel = {
			status: 400,
			errorCode: {
				code: 1500
			}
		};
	}
	*/
	
	return rel;
};
/**
 * 检查转化跟踪URL（转化跟踪工具-->全面检查-->转化跟踪URL）
 */
Requester.debug.CHECK_FcUrl = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	
	rel.data = true;
	
	return rel;
},

/**
 * 搜索推广URL进度查询（转化跟踪工具-->全面检查-->推广访问URL）
 */
Requester.debug.GET_FcUrlCheckProgress = function(level, param) {
	var rel = new Requester.debug.returnTpl(),
		tmp = ['processing', 'done'],
		num = round(Math.random()); // 0 or 1
	
	rel.data = 'done';
	
	return rel;
};

/**
 * 查询搜索推广URL检查结果（转化跟踪工具-->全面检查-->推广访问URL）
 */
Requester.debug.GET_FcUrlCheckResult = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	
	rel.data = {
		progress : "processing", // processing
		last_check_time : "2010-10-20 15:55:01",
		listData : [{
			errorcode : -100,
			errornum : 15,
			urllist : [ {
				url : "http://www.baidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidubaidu.com"
			}, {
				url : "http://www.baidu.com"
			}]
		}, {
			errorcode : 262144,
			errornum : 10,
			urllist : [ {
				url : 'http://www.baidu.com'
			}, {
				url : 'http://www.baidu.com'
			}]
		}, {
			errorcode : 262144,
			errornum : 10,
			urllist : [ {
				url : 'http://www.baidu.com'
			}, {
				url : 'http://www.baidu.com'
			}]
		}, {
			errorcode : 262144,
			errornum : 10,
			urllist : [ {
				url : 'http://www.baidu.com'
			}, {
				url : 'http://www.baidu.com'
			}]
		}, {
			errorcode : 262144,
			errornum : 10,
			urllist : [ {
				url : 'http://www.baidu.com'
			}, {
				url : 'http://www.baidu.com'
			}]
		}]
	};
	
	return rel;
};

/**
 * 检查转化跟踪URL（转化跟踪工具-->全面检查-->转化跟踪URL）
 */
Requester.debug.CHECK_TransUrl = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	
	rel.data = {
		"data" : "cachekey"
	};
	
	return rel;
},

/**
 * 转化跟踪URL进度查询回调，获取检查结果（转化跟踪工具-->全面检查-->转化跟踪URL）
 */
Requester.debug.GET_Trans_CheckResult = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	
	rel.data = {
		progress : "done", // processing
		listData : [{
			url : 'urlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurlurl',
			errorMsg : 'error message'
		}, {
			url : 'url',
			errorMsg : 'error message'
		}, {
			url : 'url',
			errorMsg : 'error messageerror messageerror messageerror messageerror messageerror messageerror messageerror messageerror messageerror messageerror messageerror messageerror messageerror message'
		}]
	};
	
	return rel;
};
//获取离线宝状态
Requester.debug.GET_LXB_status = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	var status = [6,4,0,1,8,9,1000],
		index = Math.ceil(Math.random() * 100) % 7;
	rel.data = status[index];
	rel.data = 1;
	//rel.status = 500;
	return rel;
};

//获取400电话及今日消费
Requester.debug.GET_LXB_basicInfo = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		phone:"400-800-8888",
		lxbtodaypaysum: 5896321
	};
	//rel.status = 500;
	return rel;
};
//获取收费模式 ： 当前暂时没用
Requester.debug.GET_LXB_chargeModel = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = 1;
	return rel;
};
//获取电话转化数据
Requester.debug.GET_LXB_phoneTransData = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	var len = 100,data = [];
	for (var i = 0; i < len; i++) {
		data[i] = {
			'planid': 100 + i,
			'planname': "计划离线宝的" + i,
			'unitid': 200 + i,
			'unitname': "单元县里报的" + i,
			'callcnt': 500 + i, //呼叫次数
			'connectcnt': 300 + i, //接通次数
			'missedcnt': 100 + i, //漏接次数
			'avgcalltime': "00:01:02" //平均通话时长
		}
	}
	rel.data = data;
	return rel;
};


//新增网站
Requester.debug.ADD_site = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	
	return rel;
};

//启动暂停网站电话跟踪
Requester.debug.SET_LXB_trackStatus = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	
	return rel;
};

//单元绑定分机号
Requester.debug.SET_LXB_bindUnit = function(level, param) {
	
	var rel = new Requester.debug.returnTpl();
	var len = 10,data = [];
	for (var i = 0; i < len; i++) {
		data[i] = {
			unitid: 12 + i,
			extbind: 5124 + i + ''
		}
	}
	rel.data = data;
	rel.status =400;
	rel.errorCode = {
		code: 1562
	};
	return rel;
};


//单元解绑分机号
Requester.debug.SET_LXB_unbindUnit = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	return rel;
};
	