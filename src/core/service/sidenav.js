/**
 * fbs.sidenav
 * 相关接口
 * @author tongyao@baidu.com
 */
fbs = fbs || {};

fbs.sidenav = {};

/**
 * 计划列表和单元列表共用的基层fbs接口
 */
fbs.sidenav._getNodesList = fbs.interFace({
	path: fbs.config.path.SIDENAV_PATH.NODES_LIST,
	necessaryParam: {
		mtlTreeNode: {
			mtlLevel: "useracct | planinfo",
			mtlId: 658
		}
	}
});

fbs.sidenav.getPlanList = function(param){
	param['mtlTreeNode'] = {
		mtlLevel : "useracct",
		mtlId : nirvana.env.USER_ID
	};
	fbs.sidenav._getNodesList(param);
};


fbs.sidenav.getUnitList = function(param){	
	param['mtlTreeNode'] = {
		mtlLevel : "planinfo",
		mtlId : param.condition.planid
	};
	delete param.condition;
	fbs.sidenav._getNodesList(param);
}

fbs.sidenav.getNodeInfo = function(param){
	var interfaceFunc = fbs.interFace({
		path : fbs.config.path.SIDENAV_PATH.SINGLE_NODE,
		necessaryParam : {
			mtlTreeNode: {
				mtlLevel: "planinfo | unitinfo",
				mtlId: 658
			}
		} 
	});
	
	var mtlLevel,
		mtlId;
	
	if(param.condition.planid){
		mtlLevel = 'planinfo',
		mtlId = param.condition.planid;
	} else {
		mtlLevel = 'unitinfo',
		mtlId = param.condition.unitid;
	}
	
	param['mtlTreeNode'] = {
		mtlLevel : mtlLevel,
		mtlId : mtlId
	};
	delete param.condition;
	
	interfaceFunc(param);
}
