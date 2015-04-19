/**
 * abtest主页加载相关方法
 * @author zhouyu01
 */
fclab.abtest = {
	curstat: 0,
	createDialog: null,
	/**
	 * 初始化abtest页面
	 */
	init: function(){
		//初始化页码等控件
		ui.util.init(baidu.g("LabToolInfo"));
		//初始显示全部实验
		this.curstat = 0;	
		//获取abtest工具统计数据
		this.getTotalInfo();	
		//绑定事件
		this.bindList();
	},
	
	/**
	 * 获取abtest工具统计数据
	 * 新增、编辑、删除实验时都需要重新获取数据
	 */
	getTotalInfo: function(){
		fbs.abtest.getTotal({
			onSuccess: function(response){
				if (baidu.g("FclabAbtestInfo")) {
					var sortcnt = response.data.sort;
					var allcnt = response.data.allcnt;
					baidu.g("SortAllCnt").innerHTML = sortcnt["all"];
					baidu.g("SortNewCnt").innerHTML = sortcnt["new"];
					baidu.g("SortDoingCnt").innerHTML = sortcnt["doing"];
					baidu.g("SortDoneCnt").innerHTML = sortcnt["done"];
					baidu.g("TestCnt").innerHTML = allcnt["testcnt"];
					baidu.g("AllTestcnt").innerHTML = allcnt["alltestcnt"];
					baidu.g("MtlCnt").innerHTML = allcnt["mtlcnt"];
					baidu.g("AllMtlCnt").innerHTML = allcnt["allmtlcnt"];
					//获取数据，不能提到外面，因为要用到sortcnt
					this.cntset = sortcnt;//各种状态的实验数量
					//新建、修改、开始实验后，都要跳到第一页么？？？？待升级
					this.buildAbtestData(this.curstat, 0);
				}
			}.bind(this)
		});
	},
	
	/**
	 * 绑定各种事件
	 */
	bindList: function(){
		baidu.g("AbtestSort").onclick = this.getDiffStatList.bind(this);
		ui.util.get("AbtestListPage").onselect = this.getListPerPage.bind(this);
		baidu.g("CreateNewTest1").onclick = this.openCreateDialog.bind(this, null);
		baidu.g("AbtestList").onclick = this.testListOperation.bind(this);
	},
	
	/**
	 * 查看不同状态的实验列表
	 * @param {Object} e
	 */
	getDiffStatList: function(e){
		var e = e || window.event;
		var tar = e.target || e.srcElement;
		while (tar && tar.tagName.toLowerCase() != "ul") {
			if (tar.tagName.toLowerCase() == "li" 
						&& !baidu.dom.hasClass(tar, "current")) {
				var stat = baidu.getAttr(tar, "stat");
				this.curstat = stat;
				this.changeStatTab();
				this.buildAbtestData(stat, 0);
				break;
			}
			tar = tar.parentNode;
		}
	},
	
	/**
	 *	设置当前tab样式
	 */
	changeStatTab: function(){
		var stat = this.curstat;
		var lis = baidu.g("AbtestSort").getElementsByTagName("li");
		for (var i = 0, len = lis.length; i < len; i++) {
			if (baidu.getAttr(lis[i], "stat") == stat) {
				baidu.addClass(lis[i], "current");
			}
			else {
				baidu.removeClass(lis[i], "current");
			}
		}
	},
	
	
	/**
	 * 分页查看数据
	 * @param {Object} pageno
	 */
	getListPerPage: function(pageno){
		this.buildAbtestData(this.curstat, pageno - 1);
	},
	
	
	/**
	 * 组建abtest列表
	 * @param {Object} stat	实验状态
	 * @param {Object} pageno 当前页码
	 */
	buildAbtestData: function(stat, pageno){
	/*	baidu.g("AbtestList").innerHTML = "" 
						+ "<div class='abtest_item notest loading'>"
						+ IMGSRC.LOADING + "正在读取数据..."
						+ "</div>";*/
		//repaint页码控件
		this.repaintPage(stat, pageno);
		if (this.cntset.all > 0) {
			//获取当页数据
			fbs.abtest.getList({
				labstat: stat,
				pageno: pageno,
				onSuccess: this.fillData,
				onFail: this.getDataFail
			});
		}
		else {
			this.getNoDataHtml();//无数据
		}
	},
	
	/**
	 * 重绘分页控件
	 * @param {Object} stat
	 * @param {Object} pageno
	 */
	repaintPage: function(stat, pageno){
		var pageContainer = ui.util.get("AbtestListPage");
		var set = this.cntset;
		var testcnt;
		switch(+stat){
			case 0:
				testcnt = set["all"];
				break;
			case 1:
				testcnt = set["new"];
				break;
			case 2:
				testcnt = set["doing"];
				break;
			case 3:
				testcnt = set["done"];
				break;
		}
		var total = Math.ceil(testcnt/5);
		pageContainer.total = total; 
		pageContainer.page = pageno
		pageContainer.render();
	},
	
	
	/**
	 * 填充数据
	 * @param {Object} response
	 */
	fillData: function(response){
		if (baidu.g("FclabAbtestInfo")) {
			var data = response.data || [];
			var tpl = er.template.get("abtestItem");
			var item, stat, passday, duration, operation, datainfo;
			var html = [];
			for (var i = 0, len = data.length; i < len; i++) {
				item = data[i];
				stat = fclab.abtestUtil.getStat(item.labstat);
				passday = fclab.abtestUtil.getPassDay(item.labstat, 
														item.duration, 
														item.passday, 
														item.efftime
														);
				duration = fclab.abtestUtil.getDuration(item.duration, 
														item.passday, 
														item.efftime
														);
				operation = fclab.abtestUtil.getOperation(item);
				datainfo = fclab.abtestUtil.getDataInfo(item);
				html[html.length] = ui.format(tpl, 
												 stat, //状态
												 item.labname, //名称
												 item.mtlcnt, //关键词数量
												 passday, //实验时长
												 duration, //实验总时长与当前实验周数，
												 operation, //操作列表
												 datainfo, //数据信息
												 item.labid
											);
			};
			baidu.g("AbtestList").innerHTML = html.join("");
		}
	},
	
	/**
	 * 读取数据失败
	 * @param {Object} response
	 */
	getDataFail: function(response){
		if (baidu.g("AbtestList")) {
			var html = "<div class='abtest_item notest'>" 
					+  "	读取数据失败，请稍后重试！"
					+  "</div>";
			baidu.g("AbtestList").innerHTML = html;
		}
	},
	
	/**
	 * 无数据
	 */
	getNoDataHtml: function(){
		baidu.g("AbtestList").innerHTML = er.template.get("abtestNodata");
		baidu.g("CreateNewTest2").onclick = this.openCreateDialog.bind(this, null);
	},
	
	/**
	 * 表格中的操作
	 * @param {Object} e
	 */
	testListOperation: function(e){
		var me = this;
		var event = e || window.event;
		var target = event.target || event.srcElement;
		var op;
		if (target && (op = baidu.getAttr(target, "op"))) {
			var labid = baidu.getAttr(target.parentNode, "labid");
			switch (op) {
				case "begin":
					startAbtest.doStart(labid);
					return ;
				case "edit":
					me.getAbtestInfo(labid);
					return ;
				case "delete":
					me.deleteAbtest(labid);
					return ;
				case "viewdata":
					var params = {
						"labstat" : 2,		//进行中
						"title": baidu.getAttr(target, "labname"),
						"labid": labid
					};
					me.openMtlList(params);
					return ;
				case "viewreport":
					var params = {
						"labstat" : 3,		//已完成
						"title": baidu.getAttr(target, "labname"),
						"labid": labid
					};
					me.openMtlList(params);
					return ;
				case "downdata":
				case "downreport":
					fclab.abtestUtil.downloadReport(labid);
					return ;
				default:
					break;
			}
		}
	},
	
	/**
	 * 删除实验
	 */
	deleteAbtest: function(labid){
		var clazz = fclab.abtest;
		ui.Dialog.confirm({
			title: '确认',
			content: '您确定要删除该实验？',
			onok: function(){
				fbs.abtest.delAbtest({
					labid: [labid],
					onSuccess: clazz.getTotalInfo.bind(clazz),
					onFail: ajaxFail
				});
			}
		});
	},
	
	/**
	 * 修改实验
	 */
	getAbtestInfo: function(labid){
		var me = this;
		fbs.abtest.getTestInfo({
			labid: labid,
			onSuccess: function(response){
				var params = response.data;
				params.optype = "edit";
				me.openCreateDialog(params);
			},
			onFail: function(){
				ajaxFailDialog();
			}
		});
	},
	
	
	/**
	 * 打开新建实验/编辑实验浮层
	 * @param {Object} params
	 */
	openCreateDialog: function(params){
		var me = this;
		var params = params || {};
		params.optype = params.optype || "add";
		if(params.duration){
			params.duration = params.duration / 7;
		}
		me.createDialog = nirvana.util.openSubActionDialog({
			id: 'createAbtest',
			title: params.optype == "add" ? "新建实验" : "修改实验",
			width: 700,
			actionPath: 'fclab/abtest/create',
			params: params
		});
	},
	
	
	/**
	 * 查看数据/查看报告
	 * @param {Object} params
	 */
	openMtlList: function(params){
		var me = this;
		var params = params || {};
		var title = params.title || "查看数据";
		//关闭弹窗后，实验中状态是否变成已完成状态
		me.refreshAfterApplyBid = false;
		me.mtllistDialog = nirvana.util.openSubActionDialog({
			id: 'testMtlList',
			title: title,
			width: 980,
			actionPath: 'fclab/abtest/mtllist',
			params: params,
			onclose: function(){
				//若实验状态发生改变，需要更新实验列表
				if (me.refreshAfterApplyBid) {
					me.getTotalInfo();
				}
			}
		});
	}

}
