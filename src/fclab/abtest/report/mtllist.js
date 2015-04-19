/**
 * 查看数据/查看报告的action
 * @author zhouyu01
 */
fclab.abtest.mtllist = new er.Action({
	VIEW: 'checkMtlList',
	
	OpContent: {
		"2": {
			"type": "data",
			"name": "下载数据",
			"hint": "应用实验组（对照组）价格后，该关键词将退出实验，您可到调整完成下查看之前数据"
		},
		"3": {
			"type": "report",
			"name": "下载报告",
			"hint": "所有关键词出价已默认恢复为实验前（对照组）出价"
		}
	},
	
	
	noDataHtml:{
		"nodata":"当前分类下没有关键词，请您到其他分类下查看或操作。",
		"error": "读取数据异常，请稍后再试。",
		"loading":"正在读取数据..."
	},
	
	UI_PROP_MAP: {
		testMtlListTable: {
			type: 'Table',
			noDataHtml: '*noDataHtml',
			colViewCounter: 'all',
			fields: '*tableFields',
			datasource: '*mtlData'
		}
	},
	
	
	CONTEXT_INITER_MAP: {
		testBidSetTable: function(callback){
			var nodata = this.getNoDataHtml("loading");
			this.setContext("noDataHtml", nodata);
			this.setContext("tableFields", abtestReport.field);
			this.setContext("mtlData", []);
			callback();
		}
	},
	
	onafterrender: function(){
		var me = this;
		//读取labstat和labid
		me.labstat = +me.arg.labstat;//2进行中，3已完成
		me.labid = +me.arg.labid;
		//填充下载区域内容
		me.fillOpContent();
		//初始进入显示“全部”tab
		me.refreshData(0, 0);
		//切换tab
		baidu.g("TestMtlTab").onclick = me.changeTabHandler.bind(me);
		//查看配置
		baidu.g("viewTestConfig").onclick = me.openConfigDialog();
		//下载
		ui.util.get("downloadTest").onclick = me.downloadTest.bind(me);
		//翻页
		ui.util.get("testMtlPage").onselect = function(pageno){
			me.refreshData(me.currentStat, pageno);
		};
		//表格
		ui.util.get("testMtlListTable").main.onclick = me.operation.bind(me);
	},

	/**
	 * 没有数据时提示
	 * @param {Object} stat
	 */
	getNoDataHtml: function(stat){
		var html = this.noDataHtml[stat] || "";
		return '<div class="lab_nodata">' + html + '</div>';
	},
	
	/**
	 * 下载区域内容填充
	 */
	fillOpContent: function(){
		var tpl = er.template.get("testMtlDownload");
		var config = this.OpContent[this.labstat];
		var opcont = baidu.g("testMtlOpContainer");
		opcont.innerHTML = ui.format(tpl, config.name, config.hint);
		ui.util.init(opcont);
	},
	
	/**
	 * 切换tab
	 * @param {Object} e
	 */
	changeTabHandler: function(e){
		var me = this;
		var event = e || window.event;
		var target = event.target || event.srcElement;
		while (target && target.tagName.toUpperCase() != "UL") {
			if (target.tagName.toUpperCase() == "LI" 
					 && !baidu.dom.hasClass(target, "tipprefix")
					 && !baidu.dom.hasClass(target, "current")) {
				var stat = target.getAttribute("stat");
				me.refreshData(stat, 0);	
				return;
			}
			target = target.parentNode;
		}
	},
	
	/**
	 * 刷新数据
	 * @param {Object} wordstat
	 * @param {Object} pageno
	 */
	refreshData: function(wordstat, pageno){
		var me = this;
		me.setCurrentTab(wordstat);
		me.getTestMtlCnt(wordstat, pageno);
		me.getTestMtlInfo(wordstat, pageno);
	},
	
	/**
	 * 设置当前tab
	 * @param {Object} wordstat
	 */
	setCurrentTab: function(wordstat){
		var me = this;
		var tabs = baidu.g("TestMtlTab").getElementsByTagName("li");
		for (var i = 0, len = tabs.length; i < len; i++) {
			if (!baidu.dom.hasClass(tabs[i], "tipprefix")) {
				var index = tabs[i].getAttribute("stat");
				if (index == wordstat) {
					me.currentStat = wordstat;
					baidu.addClass(tabs[i], "current");
				}
				else {
					baidu.removeClass(tabs[i], "current");
				}
			}
		}
	},
	
	/**
	 * 获取各种状态下关键词数量
	 * @param {Object} wordstat
	 * @param {Object} pageno
	 */
	getTestMtlCnt: function(wordstat, pageno){
		var me = this;
		fbs.abtest.getTestMtlCnt({
			labid: me.labid,
			onSuccess: function(response){
				var data = response.data;
				var tabs = baidu.g("TestMtlTab").getElementsByTagName("li");
				var total = 0;//当前tab下一共有多少条数据
				for (var i = 0, len = tabs.length; i < len; i++) {
					if (!baidu.dom.hasClass(tabs[i], "tipprefix")) {
						var index = tabs[i].getAttribute("stat");
						if (index > -1) {
							var label = tabs[i].getElementsByTagName("label")[0];
							label.innerHTML = data[+index];
							if (wordstat == index) {
								total = data[+index]
							}
						}
					}
				}
				me.undonecnt = data[0] - data[4];
				var testMtlPage = ui.util.get("testMtlPage");
				testMtlPage.total = Math.ceil(total / 5);
				testMtlPage.page = pageno == 0 ? 1 : pageno;
				testMtlPage.render();
			},
			onFail: function(){
				ajaxFailDialog();
			}
		});
	},
	
	/**
	 * 获取物料数据
	 * @param {Object} wordstat
	 * @param {Object} pageno
	 */
	getTestMtlInfo: function(wordstat, pageno){
		var me = this;
		pageno = pageno > 0 ? pageno - 1 : pageno;
		fbs.abtest.getTestMtlList({
			stat: wordstat,
			labid: me.labid,
			pageno: pageno,
			onSuccess: function(response){
				me.renderTotalInfo(response.sum);
				me.renderTableInfo(response.data);
			},
			onFail: function(response){
				var table = ui.util.get("testMtlListTable");
				table.noDataHtml = me.getNoDataHtml("error");
				table.datasource = [];
				table.render();
			}
		});
	},
	

	/**
	 * 渲染汇总数据
	 * @param {Object} data
	 */
	renderTotalInfo: function(data){
		var cont = baidu.g("TestMtlTotal");
		var util = fclab.abtestUtil;
		var itemstr = ["show", "click", "trans", "pay"];
		cont.innerHTML = util.getDataInfo(data, itemstr, {height:5});
	},
	

	/**
	 * 渲染表格数据
	 * @param {Object} data
	 */
	renderTableInfo: function(data){
		var table = ui.util.get("testMtlListTable");
		table.datasource = data;
		table.noDataHtml = this.getNoDataHtml("nodata");
		table.render();
		if (data.length > 0) {
			// Dialog二次定位标识
			nirvana.subaction.isDone = true;
		}
	},
	

	/**
	 * 查看实验配置
	 */
	openConfigDialog: function(){
		var me = this;
		return function(){
			if (!me.configDialog) {
				me.configDialog = me.createConfigDialog();
			}
			fbs.abtest.getLabInfo({
				labid: me.labid,
				onSuccess:me.showConfigDialog.bind(me),
				onFail: function(){
					ajaxFailDialog();
				}
			});
		}
	},
	
	/**
	 * 创建查看配置弹窗
	 */
	createConfigDialog: function(){
		return new ui.util.create('Dialog', {
			id: "TestConfig",
			title: "实验配置",
			width: 700,
			dragable: true,
			needMask: true,
			unresize: false,
			maskLevel: 3
		});
	},
	
	/**
	 * 显示实验配置弹窗
	 * @param {Object} response
	 */
	showConfigDialog: function(response){
		var me = this;
		var dialog = me.configDialog;
		var data = response.data[0];
		
		var tpl = er.template.get("viewTestConfig");
		var content = ui.format(tpl, data.ratio, 100 - (+data.ratio));
		dialog.show();
		dialog.setContent(content);
		//持续时长	
		var durSet = createAbtestStep1.getDurationItem(data.duration / 7);
		new fclab.chosenBar({
			container: "ConfigDurationBar",
			itemset: durSet,
			value: Math.floor(data.passday / 7),
			clearevent:true,
			width: 30,
			type: 2
		});
		var hint = fclab.abtestUtil.getPassDay(me.labstat, 
								data.duration, data.passday, data.efftime);
		if(me.labstat == 2){
			hint = "从" + data.efftime + "开始，" + hint;
		}
		baidu.g("ConfigDuration").innerHTML = hint;
		//关注指标
		var focusSet = createAbtestStep2.focusItemset;
		var index = baidu.array.indexOf(focusSet, function(item){
			return item.value == data.focus;
		})
		new fclab.chosenBar({
			container: "ConfigFocusBar",
			itemset: [focusSet[index]],
			value: data.focus
		});
	},
	
	/**
	 * 操作列
	 * @param {Object} e
	 */
	operation: function(e){
		var me = this;
		var event = e || window.event;
		var target = event.target || event.srcElement;
		if (target && target.parentNode && baidu.dom.hasClass(target.parentNode, "op")) {
			if ((baidu.dom.hasClass(target, "test_row") 
					|| baidu.dom.hasClass(target, "compare_row")) 
				&& !baidu.dom.hasClass(target, "text_gray")) {
				var status = target.getAttribute("status");
				var group = status == 4 ? "实验组" : "对照组";
				var content = "采用" + group + "设置后该关键词将退出实验，您确定要应用吗？";
				//当实验中只剩余一个关键词未调整完成
				if (me.labstat == 2 && me.undonecnt <= 1) {
					content = '该操作后实验将结束，你确定要继续吗？';
				}
				ui.Dialog.confirm({
					title: '确认',
					content: content,
					onok: function(){
						fclab.abtest.refreshAfterApplyBid = true;
						me.applybid(target);
					}
				});
			}
		}
	},
	
	
	/**
	 * 应用出价
	 * @param {Object} target
	 */
	applybid: function(target){
		var me = this;
		var parent = target.parentNode;
		var status = target.getAttribute("status");
		var labwinfoid = parent.getAttribute("labwinfoid");
		var labid = parent.getAttribute("labid");
		fbs.abtest.modTestMtlStat({
			labid: labid,
			labwinfoid: labwinfoid,
			status: status,
			onSuccess: function(response){
				var html = abtestReport.renderOperation({
					stat: 4,
					status: status
				});
				parent.parentNode.innerHTML = html;
				me.undonecnt -= 1;
				fbs.material.clearCache('wordinfo');
			},
			onFail: function(){
				ajaxFail(0);
			}
		});
	},
	
	/**
	 * 下载实验数据
	 */
	downloadTest: function(){
		fclab.abtestUtil.downloadReport(this.labid);
		//监控
		NIRVANA_LOG.send({
			target: this.labstat == 2 
					? 'labViewTestData_btn' 
					: 'labViewTestReport_btn'
		});
	}
});