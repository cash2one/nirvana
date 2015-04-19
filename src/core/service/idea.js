/**
 * fbs.idea
 * 关键词相关接口
 * @author zuming@baidu.com
 */

fbs = fbs || {};

fbs.idea = {};

/**
 * 配置项，用于生成获取属性方法
 * @author zuming@baidu.com
 */
fbs.idea.config = {
    level: "ideainfo",
    getAttributes: ['offlinereason', 'title'],
    getFacade: {
        "nameList": ["ideaid", "title"],
		'info' : [
					'planid',
					'planname',
					'unitid',
					'unitname',
					'ideaid',
					'title',
					'desc1',
					'desc2',
					'url',
					'showurl',
					'miurl',   //还不知道设备属性 全请求
                    'mshowurl',//还不知道设备属性 全请求
					'shadow_ideaid',
					'shadow_title',
					'shadow_desc1',
					'shadow_desc2',
					'shadow_url',
					'shadow_showurl',
					'shadow_miurl',
                    'shadow_mshowurl',
					'deviceprefer',
					'devicecfgstat'
				],
		'list': [
					"planid",
					"planname",
					"unitid",	
					"unitname", 
					"ideaid", 
					"shadow_ideaid", 
					"ideastat",
					"shadow_ideastat",
					"title", 
					"shadow_title", 
					"desc1", 
					"shadow_desc1", 
					"desc2", 
					"shadow_desc2", 
					"url", 
					"shadow_url", 
					"showurl", 
					"shadow_showurl", 
					"clks", 
					"shows", 
					"paysum", 
					'trans', 
					'avgprice'
				]
    }
};

// 创建获取属性方法
fbs.material.implementGetMethod(fbs.idea);



/**
 * 添加创意
 * @param {Object} param {
 * 		planid: 1
 * 		unitid : 1
 * 		title : '',
 * 		desc1
 * 		desc2
 * 		url
 * 		showurl
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.idea.add = fbs.interFace({
	path: fbs.config.path.ADD_IDEA_PATH,
	
	necessaryParam: {
		planid : '',
		unitid : '',
		title : '',
		desc1 : '',
		desc2 : '',
		url : '',
		showurl : ''
	},
	
	//通配符在哪里处理呢....
	//validate: fbs.validate.addIdea,
	
	parameterAdapter: function(param) {
	    param.items = {
			title : param.title,
			desc1 : param.desc1,
			desc2 : param.desc2,
			url : param.url,
			showurl : param.showurl
		}
		if(param.miurl){
		   param.items.miurl = param.miurl;
		}
		if(param.mshowurl){
           param.items.mshowurl = param.mshowurl;
        }
		
		delete param.title;
		delete param.desc1;
		delete param.desc2;
		delete param.url;
		delete param.showurl;
		if(param.miurl || param.miurl == ''){
		delete param.miurl;
		}
		if(param.mshowurl || param.mshowurl == ''){
         delete param.mshowurl;
        }
       
		return param;
	}
});


/**
 * 修改创意暂停/启用状态
 * @param {Object} param {
 * 		pausestat : 0 - 启用, 1 - 暂停
 * 		ideaid : [1,2]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.idea.modPausestat = fbs.interFace({
	path: fbs.config.path.MOD_IDEA_PATH,
	
	necessaryParam: {
		ideaid: [1, 2],
		pausestat : '0 | 1'
	},
	
	parameterAdapter: function(param) {
		param.items = {
			pausestat: param.pausestat
		};
		delete param.pausestat;
		return param;
	}
});

/**
 * 激活创意
 * @param {Object} param {
 * 		activestat: 0 - 激活
 * 		ideaid : [1,2]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author chenjincai@baidu.com
 */
fbs.idea.active = fbs.interFace({
	path: fbs.config.path.MOD_IDEA_PATH,
	
	necessaryParam: {
		ideaid: [1, 2],
		activestat: '0'
	},
	
	parameterAdapter: function(param) {
		param.items = {
			activestat: param.activestat
		};
		delete param.activestat;
		return param;
	}
});



/**
 * 修改创意
 * @param {Object} param {
 * 		ideaid : '1',
 * 		title : '',
 * 		desc1
 * 		desc2
 * 		url
 * 		showurl
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author wanghuijun@baidu.com
 */
fbs.idea.modIdea = fbs.interFace({
	path: fbs.config.path.MOD_IDEA_CONTENT_PATH,
	necessaryParam: {
		ideaid: '1',
		title : '',
		desc1 : '',
		desc2 : '',
		url : '',
		showurl : ''
	},
	parameterAdapter: function(param) {
		param.items = {
			title : param.title,
			desc1 : param.desc1,
			desc2 : param.desc2,
			url : param.url,
			showurl : param.showurl
		}
		
		if(param.miurl=='' || param.miurl){
           param.items.miurl = param.miurl;
           delete param.miurl;
        }
        if(param.mshowurl=='' || param.mshowurl){
           param.items.mshowurl = param.mshowurl;
           delete param.mshowurl;
        }
        
        
		delete param.title;
		delete param.desc1;
		delete param.desc2;
		delete param.url;
		delete param.showurl;
		
		return param;
	}
});

/**
 *批量修改url接口 
 */
fbs.idea.modUrl = fbs.interFace({
	path: 'MOD/ideainfo/content/batchurl'
});
/**
 * 删除创意
 * @param {Object} param {
 * 		ideainfoid : [1,2,3]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.idea.del = fbs.interFace({
	path: fbs.config.path.DEL_IDEA_PATH,
	
	necessaryParam: {
		ideaid: [1, 2]
	}
});

/**
 * 获取创意的优选关键词接口（草拟）
 * @param {Object} param {
 * 		ideaid : '1'
 * }
 * @author mayue@baidu.com
 */
fbs.idea.getSelectedKeyword = fbs.interFace({
	path: fbs.config.path.GET_IDEA_SELECTED_KEYWORD,
	necessaryParam: {
		ideaid: ["1"]
	}
});


/**
 * 获得注册url
 */
fbs.idea.getURL = fbs.interFace({
    path: 'GET/eos/url',
    necessaryParam: {}
});

/**
 * 获得分组
 */
fbs.idea.getGroups = fbs.interFace({
    path: fbs.config.path.GET_EOS_UNITSINGROUP,
    necessaryParam: {}
});

/**
 * 获得同类关键词
 */ 
fbs.idea.getSimilarWords = fbs.interFace({
    path: 'GET/eos/winfooverview',
    necessaryParam: {

    }
});

/**
 * 分组情况下的添加创意
 * 已迁移至vega中，此接口继续保留，但是不要再使用，以后删除
 * 新方法为：fbs.vega.addBatchIdea
 * by Leo Wang(wangkemiao@baidu.com)
 */
fbs.idea.addGroupIdea = fbs.interFace({
    path: 'ADD/eos/unitsingroup',
    necessaryParam: {
    }
});

/**
 * 获得推荐创意及引导词
 */
fbs.idea.recommendIdea = fbs.interFace({
    path: 'GET/eos/recmideas'
});
