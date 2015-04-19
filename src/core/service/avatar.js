/**
 * fbs.avatar
 * 相关接口
 * @author zhouyu01@baidu.com
 */
fbs = fbs || {};

fbs.avatar = {};

/**
 * 获取监控文件夹列表
 * @param {Object} param {
 * 		starttime : "YYYY-MM-DD”  //可选，开始时间
 * 		endtime : "YYYY-MM-DD”	//可选，结束时间
 * 		folderid:[1,2],			//可选，指定特定文件夹，获取其属性，不传获取全部文件夹
 *		fstat:0 | 1,	//可选，是否在首页出现，不传表示全部
 *		fields:["folderid","foldername","fstat","monowordcount","clks","shows","paysum"]  //可选， 获取字段
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 */
fbs.avatar.getMoniFolders = fbs.interFace({
	path: fbs.config.path.GET_MONI_FOLDERS,
	
	parameterAdapter: function(param) {
		param.condition = {};
		if(param.folderid){
			param.condition.folderid = param.folderid;
			delete param.folderid;
		}
		if(param.fstat){
			param.condition.fstat = param.fstat;
			delete param.fstat;
		}
		return param;
	}
});

/**
 * 获取监控文件夹中关键词列表
 * @param {Object} param {
 * 		starttime : "YYYY-MM-DD”  //开始时间
 * 		endtime : "YYYY-MM-DD”	//结束时间
 * 		folderid:[1,2],			//文件夹id
 *		winfoid:[32323,23243],	//可选，获取该关键词的信息
 *		fields:["clks","shows","paysum"]  //可选， 获取字段
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 */
fbs.avatar.getMoniWords = fbs.interFace({
	path: fbs.config.path.GET_MONI_WORDS,
	
	necessaryParam: {
  		folderid:[1,2],
		fields:["clks","shows","paysum"]
	},
	
	parameterAdapter: function(param) {
		param.condition = {};
		
		param.condition.folderid = param.folderid;
		delete param.folderid;
		
		if(param.winfoid){
			param.condition.winfoid = param.winfoid;
			delete param.winfoid;
		}
		return param;
	}
});

/**
 * 修改监控文件夹名称
 * @param {Object} param {
 * 		folderid:[1,2],			//指定特定文件夹，获取其属性，不传获取全部文件夹
		foldername: "文件夹名称", //修改后的文件夹名称
 *		fields:["folderid","foldername","fstat","monowordcount","clks","shows","paysum"]  //可选， 获取字段
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 */
fbs.avatar.modFolderName = fbs.interFace({
	path: fbs.config.path.MOD_MONI_FOLDERS,
	
	necessaryParam: {
		folderids: [1322,3232],
		foldername: "文件夹名称"
	},
	validate: fbs.validate.moniFolders,
	parameterAdapter: function(param) {
		param.items = {};
		param.items.foldername = param.foldername;
		delete param.foldername;
		return param;
	}
});

/**
 * 修改监控文件夹状态
 * @param {Object} param {
 * 		folderid:[1,2],			//指定特定文件夹，获取其属性，不传获取全部文件夹
 *		fstat:0 | 1,	//是否在首页出现，不传表示全部
 *		fields:["folderid","foldername","fstat","monowordcount","clks","shows","paysum"]  //可选， 获取字段
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 */
fbs.avatar.modFstat= fbs.interFace({
	path: fbs.config.path.MOD_MONI_FOLDERS,
	
	necessaryParam: {
		folderids: [1322,3232],
		fstat:0 | 1
	},
	parameterAdapter: function(param) {
		param.items = {};
		param.items.fstat = param.fstat;
		delete param.fstat;
		
		return param;
	}
});

/**
 * 获取监控文件夹数量
 * @param {Object} param {
 * 		folderType: 0 | 1 // 0所有，1首页
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 */
fbs.avatar.getMoniFolderCount = fbs.interFace({
	path: fbs.config.path.MOD_MONI_FOLDERCOUNT,
	
	necessaryParam: {
		folderType:0 | 1
	}
});

/**
 * 检查监控文件夹中关键词总数量是否已超限，返回关键词总数量与上限值
 * @param {Object} param {
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 */
fbs.avatar.getMoniWordCount = fbs.interFace({
	path: fbs.config.path.MOD_MONI_WORDCOUNT
});

/**
 * 添加监控文件夹
 * @param {Object} param {
 * 		folderName: “String”,
 * 		isIndexShow: false | true, // 是否在首页显示
 * 		winfoids: [323, 32, 43], // 加的词
  * 	fields: [“planid”, “clks”, ……] // 添加完要返回值
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 */
fbs.avatar.addMoniFolder = fbs.interFace({
	path: fbs.config.path.ADD_MONI_FOLDER,
	
	necessaryParam: {
		folderName: "string",
  		isIndexShow: false | true, 
  		winfoids: [323, 32, 43]	
	},
	
	validate: fbs.validate.moniFolders
});

/**
 * 删除监控文件夹
 * @param {Object} param {
 * 		folderids:[1,2],		需要删除的文件夹id
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 */
fbs.avatar.delMoniFolders = fbs.interFace({
	path: fbs.config.path.DEL_MONI_FOLDERS,
	
	necessaryParam: {
		folderids:[32423,43243]
	}
});

/**
 * 删除监控文件夹中的关键词
 * @param {Object} param {
 * 		folderid:121,		//监控文件夹id
 * 		winfoids: [323,323],	//需要删除的关键词id
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 */
fbs.avatar.delMoniWords = fbs.interFace({
	path: fbs.config.path.DEL_MONI_WORDS,
	
	necessaryParam: {
		folderid:121,		
 		winfoids: [323,323]
	}
});

/**
 * 添加关键词到监控文件夹
 * @param {Object} param {
 * 		folderids:121,		//监控文件夹id
 * 		winfoids: [323,323],	//需要添加的关键词id
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 */
fbs.avatar.addMoniWords = fbs.interFace({
	path: fbs.config.path.ADD_MONI_WORDS,
	
	necessaryParam: {
		folderid:121,		
 		winfoids: [323,323]
	}
});

/**
 * 获取一批关键词所属的监控文件夹列表
 * @param {Object} param {
 * 		ids:[1,2,3],		//关键词id
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 */
fbs.avatar.getWinfoid2Folders = fbs.interFace({
	path: fbs.config.path.GET_WINFOID2FOLDERS,
	
	necessaryParam: {
		ids:[1,2,3]
	}
});

/**
 * 获取大筛子阀值
 * @author linzhifneg@baidu.com
 */
fbs.avatar.getFilterThreshold = fbs.interFace({
	path: "GET/avatar/wfthreshold",
	necessaryParam: {
		fields : ['thdtype','highthreshold','lowthreshold']
	}
});

/**
 * 获取我的查询快捷方式
 * @author linzhifneg@baidu.com
 */
fbs.avatar.getShortcut = fbs.interFace({
	path: "GET/avatar/wfcondition",
	necessaryParam: {
		fields : ['wfcondid','wfcondname','wfconddetail']
	}
});
/**
 * 获取我的查询快捷方式
 * @author linzhifneg@baidu.com
 */
fbs.avatar.addShortcut = fbs.interFace({
	path: "ADD/avatar/wfcondition",
	necessaryParam: {
		wfcondname : '',
		wfconddetail : ''
	}
});
/**
 * 删除我的查询快捷方式
 * @author linzhifneg@baidu.com
 */
fbs.avatar.delShortcut = fbs.interFace({
	path: "DEL/avatar/wfcondition",
	necessaryParam: {
		wfcondids : ''
	}
});
/**
 * 查询关键词
 * @author yangji01@baidu.com
 */
fbs.avatar.queryMoniWords = fbs.interFace({
	path : "QUERY/avatar/wordinfos",
	necessaryParam : {
		showwords : ''
	}
});
/**
 * 转移关键词
 * @author yangji01@baidu.com
 */
fbs.avatar.transMoniWords = fbs.interFace({
	path : "TRANS/avatar/moniwords",
	necessaryParam : {
		srcfolderid:'',
		tgtfolderid: '',
		tgtfoldername:'',
		winfoids: ''
	}
});
/**
 * 
 * 匹配分析 关键词对应idea
 * @author liuyutong@baidu.com
 */

fbs.avatar.getMatchIdea = fbs.interFace({
	path: fbs.config.path.GET_AVATAR_IDEAINFOS,
	necessaryParam: {
		winfoids:[1],
		starttime : 2011-10-18,
		endtime :2099-10-18
	}
	
});