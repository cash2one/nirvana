/**
 * 账户树部分
 */
Requester.debug.GET_accounttree_childrennodes = function(level, param) {
	if (param.mtlTreeNode.mtlLevel == 'useracct') { // 计划列表
		var tmp = [];
		var count = kslfData == 4 ? 1 : 10;
		for (var i = 1; i < count; i++) {
			tmp[tmp.length] = {
				mtlId : Requester.debug.data['planinfo'].planid(i),
				mtlName : Requester.debug.data['planinfo'].planname(i),
				mtlStat : Requester.debug.data['planinfo'].planstat(i),
				subMtlCount : Requester.debug.data['planinfo'].unitcount(i % 5)
			}
		}
		var rel = new Requester.debug.returnTpl();
		rel.data = tmp;
		// 模拟数据请求延迟
	    rel.timeout = 1000;
		return rel;
	} else { // 单元列表
		var tmp = [], planid = param.mtlTreeNode.mtlId;

		for (var j = 1, len = planid % 5; j < len; j++) {
			tmp.push({
				mtlId : Requester.debug.data['unitinfo'].unitid((planid) * 1000
						+ j),
				mtlName : '计划' + planid + '_'
						+ Requester.debug.data['unitinfo'].unitname(j),
				mtlStat : Requester.debug.data['unitinfo'].unitstat(j),
				subMtlCount : Requester.debug.data['unitinfo'].wordcount(j),
				subIdeaCount : Requester.debug.data['unitinfo'].ideacount(j)
					// 账户树升级新增字段 by mayue@baidu.com
				});
		}
		var rel = new Requester.debug.returnTpl();
		rel.data = tmp;
		// 模拟数据请求延迟
	    rel.timeout = 1000;
		return rel;
	}

};
Requester.debug.GET_accounttree_singlenode = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		mtlId : param.mtlTreeNode.mtlId,
		mtlName : (param.mtlTreeNode.mtlLevel == 'planinfo' ? '计划_' : '单元_')
				+ param.mtlTreeNode.mtlId + ' 更新于'
				+ baidu.date.format(new Date(), "mm:ss"),
		mtlStat : 0,
		mtlSubCount : Math.ceil(Math.random(1) * 100),
		subMtlCount : Math.ceil(Math.random(1) * 100),
		subIdeaCount : Math.ceil(Math.random(1) * 100)
		// 账户树升级新增字段 by mayue@baidu.com
	};
	return rel;
};
