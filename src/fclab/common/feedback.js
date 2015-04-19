/**
 * 凤巢实验室反馈建议浮层
 * @author zhouyu01
 */
fclab.feedback = new er.Action({
	VIEW: 'labFeedback',
	
	onafterrender: function(){
		var me = this;
		var fbarea = baidu.g("LabFeedbackArea");
		ui.util.get("LabFBHome").getGroup().setValue(fclab.CURRENT_TOOL);
		//检测字符数				
		fbarea.onfocus = fbarea.onblue = fbarea.onkeyup = fbarea.onmouseup = me.checkWordsCnt;
		//发送建议
		ui.util.get("SendLabFeedback").onclick = me.addAdvice();
		//取消建议
		ui.util.get("CancelLabFeedback").onclick = function(){
			ui.Dialog.confirm({
				title: '取消',
				content: '您确定放弃此次反馈？',
				onok: function(){
					me.onclose();
				}
			});
		};
	},
	
	onentercomplete: function(){
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 检查输入字符数
	 */
	checkWordsCnt: function(){
		var length = getLengthCase(baidu.trim(this.value));
		var maxLength = 600;
		var offset = maxLength - length;
		if(offset >= 0){
			baidu.g("FbWordsCnt").innerHTML = length;
			baidu.g("LabFeedbackError").innerHTML = "";
		} else {
			this.value = subStrCase(this.value, maxLength);
		}
	},
	
	/**
	 * 发送建议
	 */
	addAdvice: function(){
		var me = this;
		return function(){
			var value = baidu.trim(baidu.g("LabFeedbackArea").value);
			if (getLengthCase(value) > 0) {
				var level= ui.util.get("LabFBHome").getGroup().getValue();
				fbs.fclab.addAdvice({
					level: fclab.lib.toolName[level],
					content: value,
					onSuccess: me.successHandler(),
					onFail: me.failHandler(level, value)
				});
			}
			else {
				baidu.g("LabFeedbackError").innerHTML = "建议内容不能为空！";
			}
		}
	},
	
	/**
	 * 发送成功
	 */
	successHandler: function(){
		var me = this;
		return function(response){
			//成功提示
			ui.Dialog.alert({
				title: '发送成功',
				content: '发送成功，我们会尽快处理您的建议',
				onok: function(){
					me.onclose();
				}
			});
		}
	},
	
	/**
	 * 发送失败
	 * @param {Object} level
	 * @param {Object} value
	 */
	failHandler: function(level, value){
		var me = this;
		return function(response){
			if (response.status == 400 && response.errorCode.code == 180000) {
				//置灰按钮，不可再次提交
				ui.util.get("SendLabFeedback").disable(true);
				//错误信息
				fclab.getFailTip("LabFeedbackError",180000);
			}
			else {
				ui.Dialog.alert({
					title: '发送失败',
					content: '您的消息暂时未能发出，请稍后再试'
				});
			}
		}
	}
});