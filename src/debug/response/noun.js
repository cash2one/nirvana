Requester.debug.GET_noun = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = '<em>' + param.word + "</em>就是巴拉巴拉~~~";
	// 模拟数据请求延迟

	rel.data = ''
		+ '<em>展现资格</em>：二、三星词具有 计算机上左侧展现资格 及 移动设备展现资格；一星词基本没有 计算机上左侧展现资格 及 移动设备展现资格<br />'
		+ '<em>优化难度</em>：优化后星级提升的难度（二星黄>二星绿；一星灰>一星黄>一星绿）<br />'
		+ '<em>创意撰写质量</em>：反映了广告展示以后对搜索网民的吸引力，创意撰写越好越有可能给网站带来流量<br />'
		+ '<em>目标网页体验</em>：反映了搜索网民点击广告以后目标网页对其需求的满足程度，网页体验越好越有可能发生转化<br />'
	rel.timeout = 1000;
	return rel;

};



