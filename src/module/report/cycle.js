/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    report/cycle.js
 * desc:    循环报告
 * author:  wanghuijun
 * date:    $Date: 2011/2/22 $
 */

ToolsModule.reportCycle = new er.Action({
	VIEW : 'reportCycle',
	
	STATE_MAP : {
	},

	UI_PROP_MAP : {
		// 邮件地址输入
		MailInput : {
			type : 'TextInput',
			width : '160',
			height: '22'
		},
		// 循环频率
		CycleRate : {
			datasource : '*cycleRate',
			value : '0',
			width : '180'
		},
		// 查看权限
		ReportLevel : {
			datasource : '*reportLevel',
			value : '100',
			width : '180'
		},
		// 查看权限
		DoSend : {
			type : 'CheckBox'
		}
	},
	
	CONTEXT_INITER_MAP : {
		// 下拉列表渲染
		renderSelect : function(callback) {
			var me = this;
			
			// 循环报告
			if (!me.getContext('cycleRate')) { //只初始化一次
				var rateArr = [{
					value : '0',
					text :'一次生成'
				},{
					value: '1',
					text: '每天'
				}, {
					value: '2',
					text: '每周'
				}, {
					value: '3',
					text: '每月初'
				}];
				//频率显示 add by liuyutong
				var currentParams = me.arg.currentParams;
				if(currentParams.isrelativetime){
					switch(currentParams.relativetime){
						case 5: rateArr.splice(1,1);break;
						case 6: rateArr.splice(1,2);break;
						case 10: rateArr.splice(1,1);rateArr.splice(2,1);break;
						case 14:
						case 15:rateArr.splice(2,2);
							break;
						default:break;
					}
				}else{
					rateArr.splice(1,3);
				}
				me.setContext('cycleRate',rateArr);
			}
			
			// 报告权限
			if (!me.getContext('reportLevel')) {				
				var options = [{
					value: '100',
					text: nirvana.config.LANG.REPORT.REPORTLEVEL[100]
				}, {
					value: '200',
					text: nirvana.config.LANG.REPORT.REPORTLEVEL[200]
				}, {
					value: '201',
					text: nirvana.config.LANG.REPORT.REPORTLEVEL[201]
				}, {
					value: '300',
					text: nirvana.config.LANG.REPORT.REPORTLEVEL[300]
				}];
				
				switch (nirvana.env.REPORT_LEVEL) {
					case 201: //客户经理
						options.splice(1,1);
						options.splice(2,1);
						break;
					case 200: //顾问
						options.splice(2, 2);
						break;
					case 100: //用户
						options.splice(1, 3);
						break;
				}
				
				me.setContext('reportLevel', options);
			}
			
			callback();
		}
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
		
		// 获取初始值
		me.getInit();
		
		// 选择发送报告
		me.setContext('ismail', 0);
		(me.toggleSendArea())();
		controlMap.DoSend.onclick = me.toggleSendArea();
		
		// 保存并发送，这里字面改为“保存”了，先保留2个按钮的逻辑，以后可以直接修改为一个“保存”按钮
		controlMap.ReportCycleSend.onclick = me.save();
		
		// 保存
		controlMap.ReportCycleSave.onclick = me.save();
		
		// 取消
		controlMap.ReportCycleCancel.onclick = function() {
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
			type = me.arg.type,
			controlMap = me._controlMap;
		if (type == 'modify') { // 已循环报告
			var params = me.arg.currentParams;
			// 循环频率
			controlMap.CycleRate.setValue(params.reportcycle);
			// 同时发送报告至邮箱
			controlMap.DoSend.setChecked(params.ismail);
			if (params.ismail) {
				// 内容格式
				controlMap.ContentFormatCSV.getGroup().setValue(params.filetype);
				// 收件人邮箱
				controlMap.MailInput.setValue(params.mailaddr);
			}
			// 查看权限
			controlMap.ReportLevel.setValue(params.reportlevel);
		}
	},
	
	/**
	 * 保存报告
	 */
	save : function() {
		var me = this;
		
		return function() {
			var type = me.arg.type,
				controlMap = me._controlMap;
			//如果选择为一次生成，则修改接口为 add	
			if(controlMap.CycleRate.getValue() == 0)
			{
				type = 'add';
			};
			switch (type) {
				// 新增循环报告
				case 'add' : 
					me.addCycle();
					break;
				// 修改循环报告
				case 'modify' : 
					me.modifyCycle();
					break;
			}
		};
	},
	
	/**
	 * 新增循环报告
	 */
	addCycle : function() {
		var me = this,
			controlMap = me._controlMap,
			currentParams = {},
			changeParams = {
				reportcycle : controlMap.CycleRate.getValue(), //频率 0一次生成 1每天 2每周 3每月初
				reportlevel : controlMap.ReportLevel.getValue(), //查看权限 100客户 200推广顾问 300管理员
				ismail : me.getContext('ismail'), 
				reporttag : 1, // 循环报告
				filetype : controlMap.ContentFormatCSV.getGroup().getValue(), //文件类型。 0-csv 1-txt
				mailaddr : controlMap.MailInput.getValue(),
				reportname: ''
			};
		if(changeParams.reportcycle == '0'){// add by liuyutong
			changeParams.reporttag = 2;//预约的报告
		}
		currentParams = baidu.extend(currentParams, me.arg.currentParams);
		if(currentParams.createtime){
			delete currentParams.createtime;
		}
		if(currentParams.reportstatus){
			delete currentParams.reportstatus;
		}
		if(currentParams.moduid){
			delete currentParams.moduid;
		}
		currentParams = baidu.extend(currentParams, changeParams);
		fbs.report.addReportInfo({
			reportinfo : currentParams,
			onSuccess : function(response){
				me.onclose();
				// 清除cache，更新父action的currentParams
				fbs.report.getMyReportParams.clearCache();
				//console.log(me.arg.actionInstance);
				me.arg.actionInstance.redirect('/tools/myReport', {});
			},
			onFail : nirvana.displayReport.sendFail
		});
	},
	
	/**
	 * 修改循环报告
	 */
	modifyCycle : function() {
		var me = this,
			controlMap = me._controlMap,
			param = {
				reportid : me.arg.currentParams.reportid,
				reportcycle : controlMap.CycleRate.getValue(), //频率 0一次生成 1每天 2每周 3每月初
				reportlevel : controlMap.ReportLevel.getValue(), //查看权限 100客户 200推广顾问 300管理员
				onSuccess : function(response) {
					me.onclose();
					// 清除cache，更新父action的currentParams
					fbs.report.getMyReportParams.clearCache();
					me.arg.actionInstance.redirect('/tools/myReport', {});
				},
				onFail: nirvana.displayReport.sendFail
			};	
		param.sendReportInfo = {};
		if (me.getContext('ismail')) { // 选择发送邮件
				param.sendReportInfo.filetype = controlMap.ContentFormatCSV.getGroup().getValue(), //文件类型。 0-csv 1-txt
				param.sendReportInfo.mailaddr = controlMap.MailInput.getValue()
		}
		//增加一次生成 by liuyutong
		if(param.reportcycle == '0'){
			param.sendReportInfo.reporttag = 2;
		}
		if(param.sendReportInfo.length == 0){
			delete param.sendReportInfo;
		}
		fbs.report.modCycleInfo(param);
	},
	
	/**
	 * 展开关闭发送区域
	 */
	toggleSendArea : function() {
		var me = this;
		
		return function() {
			var controlMap = me._controlMap,
				btnSend = controlMap.ReportCycleSend.main,
				btnSave = controlMap.ReportCycleSave.main;
			
			if (controlMap.DoSend.getChecked()) { // 选择发送
				me.setContext('ismail', 1);
				baidu.removeClass('ReportMailWrap', 'hide');
				baidu.removeClass(btnSend, 'hide');
				baidu.addClass(btnSave, 'hide');
			} else {
				me.setContext('ismail', 0);
				baidu.addClass('ReportMailWrap', 'hide');
				baidu.addClass(btnSend, 'hide');
				baidu.removeClass(btnSave, 'hide');
			}
			
			baidu.addClass('MailInputWarn', 'hide');
		};
	}
});