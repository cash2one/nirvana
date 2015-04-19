/**
 * fbs.material
 * 物料相关操作
 * @author zuming@baidu.com
 */


fbs.material = {};

/**
 * 获取属性
 * @param {Object} level
 * @param {Object} attributeArray
 * @param {Object} options
 * @author zuming@baidu.com
 */
fbs.material.getAttribute = function(level, attributeArray, options) {
	var sendParam = {},
		//修改 增加即时更新功能 by liuyutong@baidu.com
		updateArray = [],
		testEx = /\:update/,
		sendUpdateParam = {};
	//console.log(options,123)
	sendParam.requestTag = level;
	sendParam.level = level;
	for(var i = 0, l = attributeArray.length;i < l ;i++){
		if(attributeArray[i].match(testEx)){//状态的及时更新，把状态字段补充进去
			var thisTitle = attributeArray[i].replace(/\:update/,''),thisId;
			attributeArray[i] = thisTitle;
			//处理请求的参数
			switch(thisTitle){
				case 'wordstat':
 					thisId = 'winfoid'; 
					updateArray.push('winfoid');
					updateArray.push('pausestat');
				break;
				case 'unitstat':
					thisId = 'unitid'; 
					updateArray.push('unitid');
					updateArray.push('pausestat');
				break;
				case 'planstat':
					thisId = 'planid'; 
					updateArray.push('planid');
					updateArray.push('pausestat');
				break;
				case 'ideastat':
					thisId = 'ideaid'; 
					updateArray.push('ideaid');
					updateArray.push('pausestat');
					updateArray.push('shadow_title');
					updateArray.push('shadow_ideastat');
					updateArray.push('shadow_ideaid');
				break;
				default : break;
			}
			updateArray.push(thisTitle);
			//console.log('update',updateArray)
		}
	}
	sendParam.fields = attributeArray;
	for (key in nirvana.manage.updateCallback) {
		sendUpdateParam[key] = nirvana.manage.updateCallback[key];
	}

	for (key in options) {
		sendParam[key] = options[key];
		sendUpdateParam[key] = options[key];
	}
	
	if(updateArray.length!=0){//状态的及时更新的时候
		sendUpdateParam.requestTag = level;
		sendUpdateParam.level = level;
		sendUpdateParam.fields = updateArray;
		
		sendUpdateParam.nocache = true;
		sendUpdateParam.condition = {};
		if(sendUpdateParam.matchUpdate&&nirvana.manage.UPDATE_ID_ARR_MATCH&&nirvana.manage.UPDATE_ID_ARR_MATCH.length != 0){
			delete sendUpdateParam.matchUpdate;
			sendUpdateParam.condition[thisId] = nirvana.manage.UPDATE_ID_ARR_MATCH;
		}else{
			sendUpdateParam.condition[thisId] = nirvana.manage.UPDATE_ID_ARR;
		}
		if(sendUpdateParam.condition[thisId] != 0){
			fbs.request.send(sendUpdateParam);
		}
	}else{
		fbs.request.send(sendParam);
	}
};

/**
 * 物料列表获取namelist
 * @param {Object} level
 * @param {Object} attributeArray
 * @param {Object} options
 * @author zhouyu01@baidu.com
 */
fbs.material.getName = function(level, attributeArray, options) {
	var sendParam = {};
	sendParam.path = fbs.config.path.GET_MATERIAL_NAME;
	sendParam.requestTag = level;
	sendParam.level = level;
	sendParam.fields = attributeArray;
	for (key in options) {
		sendParam[key] = options[key];
	}
	fbs.request.send(sendParam);
};

/**
 * 万用物料接口特有的清除缓存的方法
 * @author tongyao@baidu.com
 */
fbs.material.clearCache = function(level){
	fbs.cachePool[level] = {};
}

fbs.material.ModCache = function(level,key,value,type ){
	fbs.interFace.addModCacheMethod(level)(key,value,type);
}


/**
 * 设置属性，估计最后不用
 * @param {Object} level
 * @param {Object} setParam
 * @param {Object} callback
 * @author zuming@baidu.com
 */
fbs.material.setAttribute = function(level, setParam, callback) {}

/**
 * 初始化物料层级获取属性的方法
 * @param {Object} targetClass
 * @author zuming@baidu.com
 */
fbs.material.implementGetMethod = function(targetClass) {
	var level = targetClass.config.level;
	var getAttributes = targetClass.config.getAttributes || null;
	var getFacade = targetClass.config.getFacade || null;
	var primaryKey = targetClass.config.primaryKey || null;
	targetClass.getAttribute = function(attributeArray, options) {
		fbs.material.getAttribute(targetClass.config.level, attributeArray, options);
	};
    if (getAttributes) {
        for (var i = 0, len = getAttributes.length; i < len; i++) {
            var attribute = getAttributes[i];
            var attributeUpperCase = attribute.charAt(0).toUpperCase() + attribute.substr(1);
            targetClass["get" + attributeUpperCase] = function(attribute) {
				var func = function(options) {
					var attrArray = primaryKey? new Array(attribute,primaryKey) : new Array(attribute);
                    if (typeof options != "undefined") {
						return fbs.material.getAttribute(level, attrArray, options);
                    } else {
                        return fbs.material.getAttribute(level, attrArray);
                    }
                };
				func.clearCache = fbs.interFace.addClearCacheMethod(level);
				func.ModCache = fbs.interFace.addModCacheMethod(level);
                return func;
            }(attribute);
        }
    }
    if (getFacade) {
        for (facade in getFacade) {
            var facadeUpperCase = facade.charAt(0).toUpperCase() + facade.substr(1);
            targetClass["get" + facadeUpperCase] = function(facade) {
				var func = function(options) {
                    return fbs.material.getAttribute(level, getFacade[facade], options);
                };
				func.clearCache = fbs.interFace.addClearCacheMethod(level);
				func.ModCache = fbs.interFace.addModCacheMethod(level);
                return func; 
            }(facade);
        }
    }
};

/**
 * 生成设置物料属性方法，可能最后不用了
 * @author zuming@baidu.com
 */
fbs.material.implementSetMethod = function() {
    /*
    targetClass["set" + attributeUpperCase] = function(attribute) {
        return function(value, options) {
            var setParam = {};
            setParam[attribute] = value;
            return Material.setAttribute(targetClass.level, setParam, options);
        }
    }(attribute);
    */	
}

fbs.material.topDataCache = {};

/**
 * 获取物料排行榜数据
 * @param {Object} param {
 *		level: "planinfo", // 要查看哪个层级的排行 榜，planinfo, unitinfo, wordinfo
 *		order: "paysum", // 要查看哪个字段的 排行榜，show, clks, clkrate, paysum, trans, avgprice
 *  	typeid: 0 | 1 // 选择日期
 *      callback: Function, // 可选，不论返回什 么status，都把数据直接作为callback的参数
 *      onSuccess: Function, // 可选，返回status为成功 或者部分成功时，将返回数据中的status和成功数据data两个字段作为onSuccess的参数
 *      onFail: Function // 可选，返回status为失败 或者部分成功时，将返回数据中的status和成功数据error两个字段作为onSuccess的参数
 * }
 * @author zuming@baidu.com
 */
fbs.material.getTopData = fbs.interFace({
	path: "GET/mars/top",
	necessaryParam: {
		level: "planinfo|unitinfo|wordinfo",
		typeid: "0|1, 0=yesterday, 1=last 7 days",
		order: "clks|shows|paysum|showpay|trans|clkrate|avgprice"
	},
	cache: fbs.material.topDataCache,
	cacheKey: function(p) {
		return [p.level, p.typeid, p.order].join("&");
	}
});

/**
 * 获取某个物料的某个下层物料数量，比如获取某个计划的创意数量
 * @author zuming@baidu.com
 */
fbs.material.getCount = fbs.interFace({
	path: "GET/material/count",
	necessaryParam: {
		countParam: {
			mtlLevel: "useracct | planinfo | unitinfo",	// 目标节点物料层级
			mtlId: 658,	// 目标节点物料ID
			targetLevel: "planinfo | unitinfo | wordinfo | ideainfo" // 查询数量的层级
		}
	}
});

/**
 * 获取用户自定义列
 * @param {Object} param {
 *     dimlevel 计划|单元|关键词|创意|阿凡达|KR
 *      9 app
 * }
 * @author linzhifneg@baidu.com
 */
fbs.material.getCustomList = fbs.interFace({
	path: "GET/mtlcustomcols/custom",
	necessaryParam : {
		dimlevel:"3|5|11|7|15|19|21"
	}
});


/**
 * 设置用户自定义列
 * @param {Object} param {
 *     dimlevel 计划|单元|关键词|创意|阿凡达|KR
 *     colstyle 0：默认，1：全部，2：自定义 ，返回时增加-1为无数据
 *     customcols 用户最后生效的自定义列
 * }
 * @author linzhifneg@baidu.com
 */
fbs.material.modCustomList = fbs.interFace({
	path: "MOD/mtlcustomcols",
	necessaryParam: {
		dimlevel:"3|5|11|7|15|19|21",
		colstype:"0|1|2",		//0：默认，1：全部，2：自定义 ，返回时增加-1为无数据
		customcols:""
	}
});

/**
 * 根据wordid或者winfoid判断关键词是否存在
 * @param {Object} param {
 *     wordid:1, // 没有传-1，数据报告传winfoid
 *     winfoid:1, // 没有传-1，搜索词报告传wordid
 *     unitid:0
 * }
 * @author wanghuijun@baidu.com
 */
fbs.material.isExist = fbs.interFace({
	path: fbs.config.path.GET_MATERIAL_EXIST,
	
	necessaryParam: {
		wordid:1,
		winfoid:1,
		unitid:0
	}
});




/**
 * 获取物料实验状态
 */
fbs.material.getFclabStat = fbs.interFace({
	path: "GET/labstat",
	
	necessaryParam: {
		level:"wordinfo",//(wordinfo/useracct/planinfo/unitinfo/ideainfo)
		idset:[12,21]
	}
});