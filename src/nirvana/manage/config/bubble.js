/**
 * 把物料列表中的气泡定义都提到这里来
 * @author zhouyu01
 */
/**
 * 所有物料列表：物料在高级工具中的实验状态
 * 以下包含状态提示配置、显示icon的function和bubble定义
 */

/**
 * 一、状态提示配置
 */
material_labstat_config = {
	//关键词在abtest工具中
	1: "该词正在方案实验工具中实验，修改该词将导致退出实验，请您谨慎修改"
}
/**
 * 二、显示试验状态icon
 * @param {Object} response		物料对应试验状态数据
 */
function showLabstatIcon(response){
	var result = response.data;
	ui.Bubble.source.fclabstat.labstat = result;
	for (var item in result) {
		var icon = baidu.g("labstat" + item);
		if (icon) {
			baidu.dom.addClass(icon, "ui_bubble");
		}
	}
	ui.Bubble.init();
}
/**
 * 三、bubble定义
 */
ui.Bubble.source.fclabstat = {
	type : 'normal',
	iconClass : 'bubble_icon_labstat',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	showByClick : true,
	showByOver : true,			//鼠标悬浮延时显示
	showByOverInterval : 500,	//悬浮延时间隔
	hideByOut : true,			//鼠标离开延时显示
	hideByOutInterval : 5000,	//离开延时间隔，显示持续时间
	folders:{},
	title: function(node){
		return "该词已加入高级工具";
	},
	content: function(node, fillHandle, timeStamp){
		var id = node.getAttribute("id").substr(7);
		var labstat = this.labstat[id];
		var html = [];
		for (var i = 0, l = labstat.length; i < l; i++) {
			var content = material_labstat_config[labstat[i]];
			html[html.length] = '<p>' + (i + 1) + '.' + content + '</p>';
		}
		return html.join("");
	}
};

/**
 * fclab cap状态
 */
ui.Bubble.source.fclabcpastat = {
	type : 'normal',
	iconClass : 'bubble_icon_labstat',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	showByClick : true,
	showByOver : true,			//鼠标悬浮延时显示
	showByOverInterval : 500,	//悬浮延时间隔
	hideByOut : true,			//鼠标离开延时显示
	hideByOutInterval : 5000,	//离开延时间隔，显示持续时间
	folders:{},
	title: function(node){
		return '该计划已加入高级工具';
	},
	content: function(node, fillHandle, timeStamp){
		return '1. 该计划正在转化出价工具中进行优化，对该计划的大调整会严重影响优化效果，请您谨慎修改';
	}
};

/**
 * 关键词列表：监控文件夹气泡
 */
ui.Bubble.source.monitorFolderList = {
	type : 'normal',
	iconClass : 'bubble_icon_folder',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	showByClick : true,
	showByOver : true,			//鼠标悬浮延时显示
	showByOverInterval : 500,	//悬浮延时间隔
	hideByOut : true,			//鼠标离开延时显示
	hideByOutInterval : 5000,	//离开延时间隔，显示持续时间
	folders:{},
	clickHandler:function(id){
		ui.Bubble.hide();
		er.locator.redirect("/manage/monitorDetail~ignoreState=true&folderid=" + id);
	},
	title: function(node){
		return "该词已被监控";
	},
	content: function(node, fillHandle, timeStamp){
		var id = node.getAttribute("id").substr(10),
			folders = this.folders[id],
			html = [],
			title = '',
			name = '',
			id;
		html[html.length] = '<div class="bubble_folder_title">所属监控文件夹：</div>';
		for (var i = 0, l = folders.length; i < l; i++) {
			id = folders[i].folderid;
			title = baidu.encodeHTML(folders[i].foldername);
			name = getCutString(folders[i].foldername,30,"..");
			html[html.length] = '<div class="bubble_folder_content"><a title="' + title + '" href="javascript:void(0)" onclick="ui.Bubble.source.monitorFolderList.clickHandler(' + id + ');">' + name + '</a></div>';
		}
		return html.join("");
	}
};


/**
 * 关键词列表：离线宝气泡
 */
ui.Bubble.source.moniListLxbStatus = {
	type : 'tail',
	iconClass : '',
	positionList : [1,2,3,4,5,6,7,8],
	noBubbleClose: true,
	bubbleClass: "lxb_bubble_wrap",
	needBlurTrigger : true,
	showByClick : true,
	showByOver : true,			//鼠标悬浮延时显示
	showByOverInterval : 500,	//悬浮延时间隔
	hideByOut : true,			//鼠标离开延时显示
	hideByOutInterval : 300,	//离开延时间隔，显示持续时间
	status:99,
	clickHandler: function(){
		nirvana.trans.openTool();
	},
	title: function(node, fillHandle, timeStamp){
		var stat = +this.status,
			text = LXB.STATUS[stat],
			html = '',
			classname = 'lxb-label-' + stat,
			refer = node.getAttribute("refer"),
			link = '';
		if(refer && refer == "overview"){
			return '<span class="' + classname + '">' + text + '</span>';
		}
		// 离线宝小电话可点击
		if(refer && refer == "overview-lxb") {
			return '<a data-log=\'{target:"index-lxb-bubble-click"}\' id="overview-lxb-bubble" class="overview-lxb-bubble" href="' + LOOK_DATA_SETTING + '" target="_blank"><span class="' + classname + '">' + text + '</span></a>';
		}
		switch(stat){
			case 1:
				html = '<a class="' + classname + '" href="javascript:void(0)" onclick="ui.Bubble.source.moniListLxbStatus.clickHandler();">' + text + '</a>';
				break;
			case 6:
			case 8:
				html = '<span class="' + classname + '">' + text + '</span>';
				break;
			case 1000:
				link = LXB.LINK.PRODUCT + nirvana.env.USER_ID;
				html = '<a data-log=\'{target:"appLxb_button",from:"level"}\' href="' + link + '" target="_blank">点击申请离线宝</a>';
				break;
			case 0:
			case 4:
			case 9:
				link = LXB.LINK.REG + nirvana.env.USER_ID;
				html = '<a data-log=\'{target:"reapplayLxb",state:"' + stat + '",from:"level"}\' class="' + classname + '"  href="' + link + '" target="_blank">' + text + '</a>';
				break;
			default:
				break;
		}
		return html;
	},
	content:""
};

/**
 * TAB的new tip
 */
ui.Bubble.source.newProTip = {
        	type : 'tail',
        	iconClass : 'bubble_icon_new',
        	positionList : [1,8,4,5,2,3,6,7],
            needBlurTrigger : true,
            showByClick : true,
            showByOver : true,          //鼠标悬浮延时显示
            showByOverInterval : 500,   //悬浮延时间隔
            hideByOut : true,           //鼠标离开延时显示
            hideByOutInterval : 5000,   //离开延时间隔，显示持续时间
            title: function(node){
              return  node.getAttribute('bubbletitle');
           },
            content : function(node){
              return  node.getAttribute('bubbleContent');       
            }
};