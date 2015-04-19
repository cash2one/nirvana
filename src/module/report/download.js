/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    report/download.js
 * desc:    下载报告
 * author:  wanghuijun
 * date:    $Date: 2011/2/21 $
 */

ToolsModule.reportDownload = new er.Action({
	VIEW : 'reportDownload',
	
	STATE_MAP : {
	},

	UI_PROP_MAP : {
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
		
		// 设置下载文件
		me.setReportFile();
		
		/**
		 * 下载的时候不需要matchpattern，还原成默认值
		 * @author zhouyu@baidu.com
		 */
		me.arg.currentParams.matchpattern = 30;
	},
	
	//每次页面装载完成后执行
	onentercomplete : function(){
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 设置下载文件
	 */
	setReportFile : function() {
		var me = this,
			controlMap = me._controlMap,
			btnSubmit = controlMap.ReportDownloadSubmit.main,
			btnCancel = controlMap.ReportDownloadCancel.main,
			btnOk = controlMap.ReportDownloadOk.main,
			currentParams = me.arg.currentParams;
		
		if (currentParams.reporttag == 1) { // 循环报告
			// 获取最近报告
			me.getRecentReport();
			
			// 显示最近报告
			baidu.removeClass('RecentLoop', 'hide');
			baidu.removeClass(btnOk, 'hide');
			baidu.addClass(btnSubmit, 'hide');
			baidu.addClass(btnCancel, 'hide');
			
			controlMap.ReportDownloadOk.onclick = function() {
				// 直接关闭action
				me.onclose();
			};
		} else {
			// 隐藏最近报告
			baidu.removeClass(btnSubmit, 'hide');
			baidu.removeClass(btnCancel, 'hide');
			baidu.addClass('RecentLoop', 'hide');
			baidu.addClass(btnOk, 'hide');
			
			// 下载报告
			controlMap.ReportDownloadSubmit.onclick = function() {
				if (me.arg.isInstantReport) { // 即时生成报告，拼参数下载
				//	if (currentParams.reporttype == 13 || currentParams.reporttype == 21) {
						me.downloadInstantFile();
				/*	}
					else {
						var urlParam = [];
						var url = 'report/downloadreport.do?'
						var key;
						
						for (key in currentParams) {
							urlParam.push(key + '=' + currentParams[key]);
						}
						urlParam.push('filetype=' + controlMap.ContentFormatCSV.getGroup().getValue());
						
						window.open(url + urlParam.join('&'));
						me.onclose();
					}*/
				}
				else {
					me.downloadFile(me.arg.fileid);
				}
			};
			// 取消下载
			controlMap.ReportDownloadCancel.onclick = function() {
				// 直接关闭action
				me.onclose();
			};
		}
	},
	
	/**
	 * 获取最近报告
	 */
	getRecentReport : function() {
		var me = this;
		// 这里需要清除cache，因为有可能多次打开下载框，需要手动插入内容
		fbs.report.getCycleFile.clearCache();
		fbs.report.getCycleFile({
			reportid : me.arg.currentParams.reportid,
			
			onSuccess : me.getRecentReportSuccess()
		});
	},
	
	/**
	 * 获取最近报告成功
	 */
	getRecentReportSuccess : function() {
		var me = this;
		
		return function(response) {
			var data = response.data,
				len,
				num = {
					'0' : '0',
					'1' : '一',
					'2' : '二',
					'3' : '三'
				},
				i,
				id,
				name,
				isdel,
				html = [];
			
			if (me.arg.reportfail) { // 报告文件生成异常，代表最后一个文件异常，手动插入一个异常项 == 'fail' 否则reportfail为null
				data.unshift({
					fileid: 0,
					filename: '报告无法生成',
					isdel: 1
				});
			}
			
			len = (data.length > 3) ? 3 : data.length; //最多显示3个
			
			// 显示数量
			baidu.g('RecentLoopNum').innerHTML = num[len];
			
			for (i = 0; i < len; i++) {
				id = data[i].fileid;
				name = baidu.encodeHTML(data[i].filename);
				isdel = data[i].isdel;
				
				if (isdel) { // 已删除
					html.push('<li class="deled">');
					html.push('<a class="download" href="#" fileid="' + id + '" title="' + name + '">' + name + '</a>');
					if (id) {
						html.push('<a class="del" href="#" fileid="' + id + '" filename="' + name + '">已删除</a>');
					}
				} else {
					html.push('<li>');
					html.push('<a class="download" href="#" fileid="' + id + '" title="' + name + '">' + name + '</a>');
					html.push('<a class="del" href="#" fileid="' + id + '" filename="' + name + '">删除</a>');
				}
				html.push('</li>');
			}
			
			// 填充列表并绑定事件
			baidu.g('RecentLoopList').innerHTML = html.join('');
			baidu.g('RecentLoopList').onclick = me.listHandler();
		};
	},
	
	/**
	 * 列表点击处理事件
	 */
	listHandler : function() {
		var me = this;
		
		return function(event) {
			var event = event || window.event,
				target = baidu.event.getTarget(event),
				parent = target.parentNode;
			
			if (baidu.dom.hasClass(parent, 'deled')) { // 先判断父节点是否已经是已删除状态
				baidu.event.preventDefault(event);
				return;
			}
			if (baidu.dom.hasClass(target, 'download')) { // 下载报告文件
				me.downloadFile(target.getAttribute('fileid'));
				baidu.event.preventDefault(event);
				return;
			}
			if (baidu.dom.hasClass(target, 'del')) { // 删除报告文件
				me.delFile(target);
				baidu.event.preventDefault(event);
				return;
			}
		};
	},
	
	/**
	 * 下载定制报告文件
	 * @param {fileid} fileid 报告文件
	 */
	downloadFile : function(fileid) {
		var me = this;
		
		fbs.report.getDownloadPath({
			fileid : fileid,
			filetype : me._controlMap.ContentFormatCSV.getGroup().getValue(),
			
			onSuccess : function(response) {
				var url = response.data;
				
				window.open(url);
				me.onclose();
			}
		});
	},
	
	/**
	 * 下载实时报告
	 */
	downloadInstantFile : function() {
		var me = this;
		
		fbs.report.downloadMarsData({
			reportinfo : me.arg.currentParams,
			filetype : me._controlMap.ContentFormatCSV.getGroup().getValue(),
			
			onSuccess : function(response) {
				var url = response.data;
				
				window.open(url);
				me.onclose();
			}
		});
	},
	
	/**
	 * 删除报告文件
	 * @param {Object} target 事件目标元素
	 */
	delFile : function(target) {
		var fileid = target.getAttribute('fileid'), 
			filename = target.getAttribute('filename');
		
		ui.Dialog.confirm({
			title: '删除报告文件',
			content: '您确定删除<strong>“' + baidu.encodeHTML(baidu.decodeHTML(filename)) + '”</strong>吗？删除操作无法恢复。',
			onok: function(){
				fbs.report.delFile({
					fileid : fileid,
					onSuccess : function(response) {
						var dom = target.parentNode;
						
						baidu.addClass(dom, 'deled');
						target.innerHTML = '已删除';
					},
					onFail : function(response) {
						ajaxFailDialog();
					}
				});
			},
			oncancel: function(){
			}
		});
	}
});