/**
 * 最重要消息弹窗数据
 * @author zhouyu01
 */
msgcenter.miptlist = (function(){
	var msgPopup = null;
	var bind = false;//是否绑定body部分的事件

	/**
	 * 获取最重要消息弹窗数据回调处理
	 * @param {Object} data
	 */
	function init(response){
		var data = response.data;
		var content = rebuildContent(data.msglist);
		//记录本次请求的系统时间
		msgcenter.lasttime.iptlist = data.lasttime;
		if (content.length > 0) {
			msgcenter.endForMIptList();
			if (!msgPopup) {
				msgPopup = ui.util.create("MsgPopup", {
					"id": "MostIptMsg",
					"title": "重要消息提醒",//标题
					"content": content,
					"onclose": function(){//关闭回调
						msgcenter.startForMIptList();
					}
				});
			}
			//内容，数组结构，包含每条消息的html
			msgPopup.content = content;
			msgPopup.render();
			if(!bind){
				msgPopup.main.onclick = removeMsg;
				bind = true;
			}
		}
	}
	
	/**
	 * 构建数据
	 * @param {Object} list
	 */
	function rebuildContent(list){
		var tpl = er.template.get("msgListForMipt");
		var format = msgcenter.util.timeFormat;
		var content = [];
		var index = 0;
		for (var i = 0, len = list.length; i < len; i++) {
			var item = list[i];
			var time = format(item.eventTime);
			content[i] = {"html":ui.format(tpl, 
									item.msgText,
									item.typeid,
									item.linkUrl || 'javascript:void(0)',
									item.linkText,
									time,
									item.msginfoid),
							"typeid": item.typeid
						};
		}
		return content;
	}
	
	/**
	 * 已读一条消息
	 * @param {Object} e
	 */
	function removeMsg(e){
		var event = e || window.event;
		var target = event.target || event.srcElement;
		if (target.tagName.toUpperCase() == "A") {
			var handler = msgcenter.util.messageClickHandler;
			handler.call(target, event, function(msginfoid){
				msgSummary.removeMsg(msginfoid);
				msgPopup.removeCurMsg();
			}, 3);
		}
	}

	
	return {
		init: init
	}
})();
