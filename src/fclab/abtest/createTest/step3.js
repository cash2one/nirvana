/**
 * 新建实验/编辑实验 第三步
 * @author zhouyu01
 */
fclab.abtest.createStep3 = {
	pagesize: 7,//每页显示关键词数
	currentData: [],
	
	field:[{
		content: function(item){
			return ui.format(er.template.get("testBidTableShowword"), 
								"abtest_table_words",
								baidu.encodeHTML(item.showword),
								item.winfoid,
								"testTableWords"
							);
		},
		title: '关键词',
		stable: true,
		minWidth:150,
		width: 150
	},{
		content: function(item){
			var testbid = item.testbid || "";
			var comparebid = item.comparebid;
			return ui.format(er.template.get("testBidTableBid"),
								item.winfoid,
								(testbid && testbid > 0) ? fixed(testbid) : testbid,
								fixed(comparebid)
							);
			
		},
		title: '出价',
		stable: true,
		minWidth:130,
		width: 130
	},{
		content: function(item){
			var me = createAbtestStep3;
			return ui.format(er.template.get("testBidTableDetail"),
								me.renderData("shows", item.shows),	
								me.renderData("clks", item.clks),
								me.renderData("paysum", item.paysum),
								item.winfoid
						);
		},
		title: '过去一周历史数据',
		stable: true,
		minWidth:385,
		width: 385
	}],
	
	/**
	 * 初始化第三步数据
	 * @param {Object} winfoids winfoid数组
	 * @param {Object} bidinfo	对象数组，每项包含winfoid和bid（testbid）
	 */
	render: function(winfoids, bidinfo){
		var me = this;
		bidinfo = bidinfo || me.currentData;
		if (winfoids.length > 0) {
			var time = nirvana.util.dateOptionToDateValue(1);
			fbs.keyword.getAbtest({
				starttime: time.begin,
				endtime: time.end,
				condition: {
					winfoid: winfoids
				},
				onSuccess: me.rebuildTableData.bind(me, bidinfo),
				onFail: me.getDataFail
			});
		}
		ui.util.get("setTestWordsBid").disable(true);
		baidu.g("CreateTestError").innerHTML = "";
		me.bind();
	},
	
	bind: function(){
		var me = this;
		var table = ui.util.get("testBidSetTable");
		//第三步表格事件相关
		table.main.onclick = me.inlineClickHandler();
		table.onselect = me.selectListHandler();
		//批量设置出价
		ui.util.get("setTestWordsBid").onclick = me.openBatchDialog();
		//翻页
		ui.util.get("testBidSetPage").onselect = me.getDataPerPage.bind(me);
	},

	/**
	 * 构建完整的表格数据并渲染表格
	 * @param {Object} source	初始化带入或从第二步带入的数据
	 */
	rebuildTableData: function(source, response){
		var me = this;
		var data = response.data.listData;
		var index;
		for (var i = 0, len = data.length; i < len; i++) {
			data[i].comparebid = (typeof(data[i].bid) == "undefined" 
												|| data[i].bid == "") 
									? data[i].unitbid : data[i].bid;
			//删除bid变量，为了区分后端传回的实验出价字段
			delete data[i].untibid;
			delete data[i].bid;
			index = baidu.array.indexOf(source, function(item){
				return item.winfoid == data[i].winfoid;
			});
			//后端传回的变量名为bid，汗。。为了避免阅读代码不至于引起困扰，还是更名为testbid
			if (index > -1) {
				data[i].testbid = source[index].bid || source[index].testbid;
				//如果bid和testbid字段都没有，则设置为空
				if (typeof(data[i].testbid) == "undefined") {
					data[i].testbid = "";
				}
			}
			else {
				data[i].testbid = "";
			}
		}
		me.currentData = data;
		me.renderPage(data);
	},
	
	/**
	 * 更新数据
	 * @param {Object} freshdata
	 */
	refreshTableData: function(freshdata){
		var currentdata = this.currentData;
		for (var i = 0, len = freshdata.length; i < len; i++) {
			var index = baidu.array.indexOf(currentdata, function(item){
				return item.winfoid == freshdata[i].winfoid;
			});
			if (index > -1) {
				currentdata[index].testbid = freshdata[i].bid;
			}
		}
	},
	
	/**
	 * 计算分页并渲染分页控件
	 * @param {Object} data
	 */
	renderPage: function(data){
		var me = this;
		var totalpage = Math.ceil(data.length/me.pagesize) || 1; 
		var testBidSetPage = ui.util.get("testBidSetPage");
		testBidSetPage.total = totalpage;
		testBidSetPage.page = 1;//每次载入新数据都从第一页开始
		testBidSetPage.render();
		me.getDataPerPage(1);
	},
	
	/**
	 * 获取当前页数据并展示
	 * @param {Object} pageno
	 */
	getDataPerPage: function(pageno){
		var me = this;
		var pagesize = me.pagesize;
		var data = me.currentData;
		var len = data.length;
		var bidSetTable = ui.util.get("testBidSetTable");
		var start = (pageno - 1) * pagesize;
		var end = (len > (start + pagesize)) ? (start + pagesize) : len;
		var rs = data.slice(start, end);
		me.curPageData = rs;
		bidSetTable.datasource = rs;
		bidSetTable.render();
		var dialog = fclab.abtest.createDialog;
		if(dialog){
			dialog.resizeHandler();
		}
	},
	
	/**
	 * 处理显示数据
	 * @param {Object} field
	 * @param {Object} value
	 */
	renderData: function(field, value){
		if (!value) {
			return '-';
		}
		switch (field) {
			case "clks":
			case "shows":
			case "trans":
				return parseNumber(value);
			case "clkrate":
				return floatToPercent(value);
			case "paysum":
			case "avgprice":
				return fixed(value);
			default:
				return value;
		}
	},
	
	/**
	 * 如果数据获取失败，怎么办呢
	 */
	getDataFail: function(){
		
	},
	
	 /**
     * 表格行内操作事件代理器
     */
    inlineClickHandler: function(){
		var me = this;
		return function(e){
			var event = e || window.event;
			var target = event.target || event.srcElement;
			var table = ui.util.get("testBidSetTable").main;
			var type;
			
			while (target && target != table) {
				if (baidu.dom.hasClass(target, "edit_btn") && 
							target.getAttribute("edittype") == "testbid") {
					me.closeInlineLayer();
					me.inlineTestBid(target);
				}
				target = target.parentNode;
			}
		};
	},
	
	/**
	 * 关闭行内浮层
	 */
	closeInlineLayer: function(){
		var current = nirvana.inline.currentLayer;
		if (current && current.parentNode) {
			nirvana.inline.editArea.dispose();
			current.parentNode.removeChild(current);
		}
	},
	
	/**
	 * 行内修改实验组出价
	 * @param {Object} target 事件目标
	 */
	inlineTestBid: function(target){
		var me = this;
		var parent = target.parentNode;
		var winfoid = parent.getAttribute("winfoid");
		var bid = parent.getAttribute("control");
		var tip = '<span class="gray">'
				+ '	实验结束后关键词出价将恢复为现有出价，您可在实验报告中应用实验组出价' 
				+ '</span>';
		nirvana.inline.createInlineLayer({
			type: "text",
			value: bid,
			defaultError: tip,
			force: true,
			id: "testbid" + winfoid,
			target: parent,
			okHandler: function(bid){
				return {
					func: me.checkLineBid.bind(me),
					param: {
						winfoid: winfoid,
						bid: bid
					}
				}
			}
		});
	},
	
	/**
	 * 检查行内出价设置
	 * @param {Object} params
	 */
	checkLineBid: function(params){
		var me = this;
		var code = me.checkTestBid([params.bid]);
		if (parseInt(code)) {
			me.setErrorTip("errorArea", code);
		}
		else {
			me.refreshTableData([params]);
			me.repaintTestBid(params);
			me.closeInlineLayer();
		}
	},
	
	/**
	 * 检查出价是否设置合理
	 * @param {Object} bidArr
	 */
	checkTestBid: function(bidArr){
		var errorcode;
		for (var i = 0, len = bidArr.length; i < len; i++) {
			if (baidu.trim(bidArr[i]) == "") {
				return 5;
			}
			else {
				errorcode = fbs.validate.bid(bidArr[i]);
				if (parseInt(errorcode)) {
					return errorcode;
				}
			}
		}
		return true;
	},
	
	
	/**
	 * 显示实验出价
	 * @param {Object} params
	 */
	repaintTestBid: function(params){
		var table = ui.util.get("testBidSetTable").main;
		var edittds = baidu.q("edit_td", table, "div");
		var index = baidu.array.indexOf(edittds, function(item){
			return baidu.getAttr(item, "winfoid") == params.winfoid;
		});
		if (index > -1) {
			var container = baidu.q("test_bid", edittds[index], "span")[0];
			edittds[index].setAttribute("control", params.bid);
			if (container) {
				container.innerHTML = fixed(params.bid);
			}
		}
	},

	
	
	 /**
	  * 批量设置按钮是否置灰
	  * @param {Object} selected
	  */ 
    selectListHandler: function(selected){
		var me = this;
		return function(selected){
			var enabled = selected.length > 0;
            me.selectedList = selected;
			ui.util.get("setTestWordsBid").disable(!enabled);
		}
	},
	
	/**
	 * 获取选择项的id
	 */
	getSelectedId: function(){
		var me = this;
		var selectedList = me.selectedList;
		var data = me.curPageData;
		var ids = [];
		
		for (var i = 0, len = selectedList.length; i < len; i++) {
			ids.push(data[selectedList[i]].winfoid);
		}
		
		return ids;
	},
	
	/**
	 * 打开关键词出价弹窗
	 */
	openBatchDialog: function(){
		var me = this;
		return function(){
			if (!me.testBidDialog) {
				me.testBidDialog = me.createBatchDialog();
				me.bindBatchDialog();
			}
			else {
				baidu.g("testWordBidErrorTip").innerHTML = "";
				me.testBidDialog.show();
			}
			me.initBatchDialog();
		}
	},
	
	/**
	 * 创建关键词出价弹窗
	 */
	createBatchDialog: function(){
		var testBidDialog = new ui.util.create('Dialog', {
			id: "TestBidSet",
			title: "关键词出价",
			width: 440,
			dragable: true,
			needMask: true,
			unresize: false,
			maskLevel: 3
		});
		var tpl = er.template.get("setTestWordsBid");
		testBidDialog.show();
		testBidDialog.setContent(tpl);
		ui.util.init(testBidDialog.getBody());
		var type = ui.util.get("testbidSetType")
		type.options = [{
			text: "提高",
			value: 1
		}, {
			text: "降低",
			value: -1
		}];
		type.value = 1;
		type.render();
		return testBidDialog;
	},
	
	/**
	 * 初始化状态
	 */
	initBatchDialog: function(){
		//选中第一项，可编辑
		ui.util.get("testSameBid").getGroup().setValue(1);
		ui.util.get("testSameBidInput").disable(false);
		//清空值
		ui.util.get("testSameBidInput").setValue("");
		ui.util.get("testDiffBidInput").setValue("");
		//第二项未选中，不可编辑
		ui.util.get("testbidSetType").disable(true);
		ui.util.get("testDiffBidInput").disable(true);
	},
	
	/**
	 * 绑定事件
	 */
	bindBatchDialog:function(){
		var me = this;
		var dialog = me.testBidDialog;
		ui.util.get("testSameBid").onclick = me.disableDiffBid;
		ui.util.get("testDiffBid").onclick = me.disableSameBid;
		ui.util.get("testSameBidInput").onenter = me.batchCheckTestBid();
		ui.util.get("testDiffBidInput").onenter = me.batchCheckTestBid();
		ui.util.get("testWordBidOk").onclick = me.batchCheckTestBid();
		ui.util.get("testWordBidCancel").onclick = dialog.close.bind(dialog);
	},
	
	/**
	 * 批量提高降低不可用
	 */
	disableDiffBid: function(){
		ui.util.get("testbidSetType").disable(true);
		ui.util.get("testDiffBidInput").disable(true);
		ui.util.get("testSameBidInput").disable(false);
	},
	/**
	 * 设置统一出价不可用
	 */
	disableSameBid: function(){
		ui.util.get("testSameBidInput").disable(true);
		ui.util.get("testbidSetType").disable(false);
		ui.util.get("testDiffBidInput").disable(false);
	},
	
	/**
	 * 批量设置保存事件
	 */
	batchCheckTestBid: function(){
		var me = this;
		return function(){
			var type = ui.util.get("testSameBid").getGroup().getValue();
			if (type == 1) {
				me.batchCheckSameBid();
			}
			else 
				if (type == 2) {
					me.batchCheckDiffBid();
				}
		}
	},
	
	/**
	 * 设置统一出价
	 */
	batchCheckSameBid: function(){
		var me = this;
		var bid = ui.util.get("testSameBidInput").getValue();
		var code = me.checkTestBid([bid]);
		if (parseInt(code)) {
			me.setErrorTip("testWordBidErrorTip", code);
		}
		else {
			var lists = me.getSelectedId();
			var bidArr = [];
			var hash = {}
			for (var i = 0, len = lists.length; i < len; i++) {
				hash = {
					winfoid: lists[i],
					bid: bid
				};
				bidArr[i] = hash;
				me.repaintTestBid(hash);
			}
			me.refreshTableData(bidArr);
			me.testBidDialog.close();
		}
	},
	
	/**
	 * 批量提高降低出价
	 */
	batchCheckDiffBid: function(){
		var me = this;
		var multiplier = +ui.util.get("testbidSetType").getValue();
		var diffValue = ui.util.get("testDiffBidInput").getValue();
		var lists = me.getSelectedId();
		var data = me.currentData;
		var bidHash = [];
		var index, comparebid, dataItem, bid;
		var code = me.checkTestBid([diffValue]);
		//如果内容为空、不是数字、超过两位小数就不用往下走了
		if (code == 5 || code == 6 || code == 99) {
			me.setErrorTip("testWordBidErrorTip", code);
			return;
		}
		for (var i = 0, len = lists.length; i < len; i++) {
			index = baidu.array.indexOf(data, function(item){
				return item.winfoid == lists[i];
			});
			if (index > -1) {
				dataItem = data[index];
				comparebid = +dataItem.comparebid;
				bid = fixed(comparebid + multiplier * diffValue);
				code = me.checkTestBid([bid]);
				if (parseInt(code)) {
					me.setErrorTip("testWordBidErrorTip", code);
					return;
				}
				else {
					bidHash[bidHash.length] = {
						winfoid: lists[i],
						bid: bid
					}
				}
			}
		}
		//到了此步，表示无错误
		for (var i = 0, len = bidHash.length; i < len; i++) {
			me.repaintTestBid(bidHash[i]);
		}
		me.refreshTableData(bidHash);
		me.testBidDialog.close();
	},
	
	/**
	 * 设置出价错误提示
	 * @param {Object} dom
	 * @param {Object} code
	 */
	setErrorTip: function(dom, code){
		var errorConfig = nirvana.config.ERROR.KEYWORD.PRICE;
		if (baidu.g(dom)) {
			baidu.g(dom).innerHTML = errorConfig[600 + code];
		}
	}
}

var createAbtestStep3 = fclab.abtest.createStep3;
