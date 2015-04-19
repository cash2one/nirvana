/**
 * fbs.appendIdea
 * 关键词相关接口
 * @author yanlingling@baidu.com
 */

fbs = fbs || {};

fbs.appendIdea = {};

/**
 *获取本地创意列表 
 */
fbs.appendIdea.getAppendIdeaList = fbs.interFace({
	path: fbs.config.path.APPEND_IDEA_LIST,
	necessaryParam: {
		fields:'',
		starttime : '',
		endtime : '',
		limit : ''
	}
}
); 

/**
 *复制创意
 */
fbs.appendIdea.copyAppendIdea = fbs.interFace({
    path: fbs.config.path.COPY_APPEND_IDEA,
    necessaryParam: {
        creativeid:'',
        unitid : []
    }
}
); 



fbs.appendIdea.add = fbs.interFace({
	path: fbs.config.path.ADD_localIdea_PATH,
	
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
	//validate: fbs.validate.addlocalIdea,
	
	parameterAdapter: function(param) {
		
		param.items = {
			title : param.title,
			desc1 : param.desc1,
			desc2 : param.desc2,
			url : param.url,
			showurl : param.showurl
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
fbs.appendIdea.add = fbs.interFace({
	path: fbs.config.path.ADD_localIdea_PATH,
	
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
	//validate: fbs.validate.addlocalIdea,
	
	parameterAdapter: function(param) {
		
		param.items = {
			title : param.title,
			desc1 : param.desc1,
			desc2 : param.desc2,
			url : param.url,
			showurl : param.showurl
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
 * 修改创意暂停/启用状态
 * @param {Object} param {
 * 		pausestat : 0 - 启用, 1 - 暂停
 * 		localIdeaid : [1,2]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.appendIdea.modPausestat = fbs.interFace({
	path: fbs.config.path.MOD_APPEND_IDEA_PATH,
	
	necessaryParam: {
		creativeid: [1, 2],
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
 *App推广获取用户绑定状态 
 */
fbs.appendIdea.getAppUserStatus = fbs.interFace({
    path : 'GET/creativeidea/appuserstatus'
});


/**
 * 修改创意
 * @param {Object} param {
 * 		localIdeaid : '1',
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
fbs.appendIdea.modlocalIdea = fbs.interFace({
	path: fbs.config.path.MOD_localIdea_CONTENT_PATH,
	necessaryParam: {
		localIdeaid: '1',
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
		
		delete param.title;
		delete param.desc1;
		delete param.desc2;
		delete param.url;
		delete param.showurl;
		
		return param;
	}
});

/**
 * 删除创意
 * @param {Object} param {
 * 		localIdeainfoid : [1,2,3]
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author tongyao@baidu.com
 */
fbs.appendIdea.del = fbs.interFace({
	path: fbs.config.path.DEL_APPEND_IDEA_PATH,
	
	necessaryParam: {
		creativeid: [1, 2]
		
	}
});

/**
 * 获取创意的优选关键词接口（草拟）
 * @param {Object} param {
 * 		localIdeaid : '1'
 * }
 * @author mayue@baidu.com
 */
fbs.appendIdea.getSelectedKeyword = fbs.interFace({
	path: fbs.config.path.GET_localIdea_SELECTED_KEYWORD,
	necessaryParam: {
		localIdeaid: ["1"]
	}
});


/**
 * 获得注册url
 */
fbs.appendIdea.getURL = fbs.interFace({
    path: 'GET/eos/url',
    necessaryParam: {}
});

/**
 * 获得分组
 */
fbs.appendIdea.getGroups = fbs.interFace({
    path: fbs.config.path.GET_EOS_UNITSINGROUP,
    necessaryParam: {}
});

/**
 * 获得同类关键词
 */ 
fbs.appendIdea.getSimilarWords = fbs.interFace({
    path: 'GET/eos/winfooverview',
    necessaryParam: {

    }
});

/**
 * 分组情况下的添加创意
 * 接口地址已迁移至vega中，不要再使用，以后删除
 * 新方法为：fbs.vega.addBatchIdea
 * by Leo Wang(wangkemiao@baidu.com)
 */
// fbs.appendIdea.addGrouplocalIdea = fbs.interFace({
//     path: 'ADD/eos/unitsingroup',
//     necessaryParam: {
//     }
// });



/**
 添加子链到数据库中

 @param {String} planid 子链要添加到的计划id
 @param {String} unitid 子链要添加到的单元id
 @param {Array} conteng 子链的内容数组
**/
fbs.appendIdea.addSublink = fbs.interFace({
	path: 'ADD/creativeidea/sublink',
	necessaryParam: {
		planid: '',
		unitid: '',
		content: []
	}
});


/**
 编辑子链信息

 @param {String} creativeid 要要修改的子链的id
 @param {Array} content 子链的的信息数组
**/
fbs.appendIdea.modSublink = fbs.interFace({
	path: 'MOD/creativeidea/sublink',
	necessaryParam: {
		creativeid: '',
		content: []
	}
});


/**
 新增App推广

 @param {String} planid 要将App推广添加到的计划id
 @param {String} unitid 要将App推广添加到的单元id
 @param {String} mtid 要添加的客户在开发中中心绑定的appid
**/
fbs.appendIdea.addApp = fbs.interFace({
	path: 'ADD/creativeidea/app',
	necessaryParam: {
		unitid: [],
		mcid: ''
	}
})


/**
 获取单元内与子链相关的物料信息

 @param {String} unitid 单元的id，用来获取该单元下的随机创意和关键词数组
**/
fbs.appendIdea.getRelatedMaterials = fbs.interFace({
	path: 'GET/creativeidea/relatedMaterials',
	necessaryParam: {
		unitid: ''
	}
});

/**
 获取当前用户在开发者中心的app列表

**/
fbs.appendIdea.getRelatedApps = fbs.interFace({
	path: 'GET/creativeidea/app'
});
