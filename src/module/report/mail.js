/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    report/mail.js
 * desc:    下载报告
 * author:  wanghuijun
 * date:    $Date: 2011/2/22 $
 */

ToolsModule.reportMail = new er.Action({
	VIEW : 'reportMail',
	
	STATE_MAP : {
	},

	UI_PROP_MAP : {
		// 邮件地址输入
		MailInput : {
			type : 'TextInput',
			width : '170',
			height: '22'
		}
	},
	
	CONTEXT_INITER_MAP : {
	},
	
	//refresh后执行
	onafterrepaint : function(){
	},
	
	//第一次render后执行
	onafterrender : function(){
		var me = this,
			controlMap = me._controlMap;
		
		// 默认选择CSV
		controlMap.ContentFormatCSV.setChecked(true);
		
		// 清除错误信息
		controlMap.MailInput.onchange = function() {
			baidu.addClass('MailInputWarn', 'hide');
		};
		
		/**
		 * 发送的时候不需要matchpattern，还原成默认值
		 * @author zhouyu@baidu.com
		 */
		me.arg.currentParams.matchpattern = 30;
		
		// 获取初始值
		me.getInit();
		
		// 发送报告
		controlMap.ReportMailSubmit.onclick = function() {
			me.sendReport();
		};
		// 取消发送
		controlMap.ReportMailCancel.onclick = function() {
			// 直接关闭action
			me.onclose();
		};
	},
	
	//每次页面装载完成后执行
	onentercomplete : function(){
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 获取初始值
	 */
	getInit : function() {
		var me = this,
			controlMap = me._controlMap,
			params = me.arg.currentParams;
		
		if (params.ismail) {
			// 内容格式
			controlMap.ContentFormatCSV.getGroup().setValue(params.filetype);
			// 收件人邮箱
			controlMap.MailInput.setValue(params.mailaddr);
		}
	},
	
	/**
	 * 发送报告
	 */
	sendReport : function() {
		var me = this,
			controlMap = me._controlMap,
			currentParams = {},
			changeParams = {
				reporttag : 0, // 0 即时待发送
				ismail : 1, // 需要发送报告
				filetype : controlMap.ContentFormatCSV.getGroup().getValue(), //文件类型。 0-csv 1-txt
				mailaddr : controlMap.MailInput.getValue()
			};
		
		currentParams = baidu.extend(currentParams, me.arg.currentParams);
		currentParams = baidu.extend(currentParams, changeParams);
		
		if (me.arg.isInstantReport) { // 即时报告
			fbs.report.addReportInfo({
				reportinfo: currentParams,
				onSuccess: function(response){
					// 清空输入框
					controlMap.MailInput.setValue('');
				},
				onFail: nirvana.displayReport.sendFail
			});
		} else { // 循环报告
			fbs.report.postMail({
				fileid: me.arg.fileid, // 文件id
				sendReportInfo: {
					filetype: changeParams.filetype,
					mailaddr: changeParams.mailaddr
				},
				
				onSuccess: function(response){
					// 清空输入框
					controlMap.MailInput.setValue('');
				},
				onFail: nirvana.displayReport.sendFail
			});
		}
	}
});