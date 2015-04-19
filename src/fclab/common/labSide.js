/**
 * 右侧公共部分处理
 * @author zhouyu01
 */
fclab.side = (function(){
	var supportUrl = "http://yingxiao.baidu.com/support/fc/?controller=ainterface&action=getNodes&notcache=1";
//	var supportUrl = "src/debug/support.js?action=getNodes";
//	var supportUrl = "http://yingxiao.baidu.com:8181/support/fc/?module=default&controller=ainterface&action=getNodes";
	var supportContent = {};
	
	/**
	 * 打开反馈建议浮层
	 */
	function openFeedbackFloat(){
		nirvana.util.openSubActionDialog({
			id: 'openFeedbackFloat',
			title: '反馈建议',
			width: 700,
			actionPath: 'fclab/feedback'
		});
	}
	
	/**
	 * 填充帮助区域
	 * @param {Object} data
	 * [{                                    //帮助数据
	 *	"txt":"",                   //文字
	 *	"url":""                    //链接
	 *	},
	 *	…
	 *	]
	 */
	function fillSupport(data, tool){
		var tpl = '<a class="ellipsis" href="{0}" title="{1}" target="_blank">{1}</a>';
		var len = data.length > 10 ? 10 : data.length; 
		var html = [];
		for (var i = 0; i < len; i++) {
			var text = baidu.encodeHTML(data[i].txt);
			html[i] = ui.format(tpl, data[i].url, text);
		}
		//更多链接暂时设置成一样的，待support升级接口
		// var moreLink = "http://yingxiao.baidu.com/support/fc/node_10983.html";
		var moreLink;
		switch(tool) {
			case 'home':
				moreLink = 'http://yingxiao.baidu.com/support/fc/node_10982.html';
				break;
			case 'abtest':
				moreLink = 'http://yingxiao.baidu.com/support/fc/node_10983.html';
				break;
			case 'cpa':
				moreLink = 'http://yingxiao.baidu.com/support/fc/node_11499.html';
				break;
		}
		html[i] = '<a class="lab_support_more" href="' 
					+ moreLink 
					+ '" target="_blank">更多...</a>';
		baidu.g("LabSupport").innerHTML = html.join("");
	}
	
	return {
		
		/**
		 * 渲染公有模块
		 */
		init: function(){
			var action = fclab.index._self;
			var module = fclab.CURRENT_TOOL;
			if (!action.arg.refresh) {
				//点击反馈建议按钮
				baidu.g("LabFeedback").onclick = openFeedbackFloat;
			}
			if (!supportContent.module) {
				baidu.g("LabSupport").innerHTML = "";
				var url = supportUrl + "&toolname=" 
						+ fclab.lib.toolName[module] 
						+ "&callback=fclab.side.supportCallback";
				baidu.sio.callByBrowser(url);
			}
			else {
				fillSupport(supportContent.module, module);
			}
		},
		
		/**
		 * support返回数据回调
		 * @param {Object} response
		 */
		supportCallback: function(response){
			response = baidu.json.parse(response);
			var toolname = response.toolname;
			var data = response.data;
			if (!supportContent[toolname]) {
				supportContent[toolname] = data;
			}
			//确保数据返回时还在当前工具下
			if (fclab.lib.toolName[fclab.CURRENT_TOOL] == toolname) {
				fillSupport(data, fclab.CURRENT_TOOL);
			}
		}
	}
})();
