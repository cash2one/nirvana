/**
 * @author zhouyu01
 */
fclab.abtest.report = {
	field:[{
		content: function(item){
			return ui.format(er.template.get("viewTestTableShowWord"), 
					"abtest_table_words",
					baidu.encodeHTML(item.showword),
					item.winfoid,
					"reportTableWords",
					item.level > 0 ? "test_level_green" : "test_level_gray",
					item.level > 1 ? "test_level_green" : "test_level_gray",
					item.level > 2 ? "test_level_green" : "test_level_gray",
					abtestReport.getDegreeExplain(item.level, item.degree),
					(item.stat == 4 && item.status == 7) ? "hide" : ""
				);
		},
		title: '关键词',
		stable: true,
		minWidth:150,
		width:150
	},{
		content: function(item){
			return '<div class="test_row">实验组</div>' 
				+  '<div class="compare_row">对照组</div>';
		},
		title: '',
		stable: true,
		align:'center',
		minWidth:50,
		width:50
	},{
		content: function(item){
			var tpl = '<div class="test_row">{0}</div>' 
				    + '<div class="compare_row">{1}{2}</div>';
			return ui.format(tpl,
				item.bid,
				item.obid,
				item.stat != 4 ? "" :
				'<span class="ui_bubble_icon_info" title="当前出价">&nbsp;</span>'
			);
		},
		title: '出价',
		stable: true,
		align:'left',
		minWidth:55,
		width:55
	},{
		content: function(item){
			return '<div class="test_row">' + item.avgprice + '</div>' 
				+  '<div class="compare_row">' + item.oavgprice + '</div>';
		},
		title: '平均点击价格',
		stable: true,
		align:'right',
		minWidth:85,
		width:85
	},{
		content: function(item){
			var util = fclab.abtestUtil;
			var itemstr = ["show", "click"];
			var html = [];
			html[html.length++] = "<ul class='clearfix table_pkbar'>";
			html[html.length++] = util.buildDataInfo(item, itemstr, {
				height: 5
			});
			html[html.length++] = "</ul>";
			return html.join("");
		},
		title: '实验表现',
		stable: true,
		minWidth:240,
		width:240
	},{
		content: function(item){
			var util = fclab.abtestUtil;
			var itemstr = ["pay"];
			var html = [];
			html[html.length++] = "<ul>";
			html[html.length++] = util.buildDataInfo(item, itemstr, {
				height: 5
			});
			html[html.length++] = "</ul>";
			return html.join("");
		},
		title: '消费',
		stable: true,
		minWidth:120,
		width:120
	},{
		content: function(item){
			return '<div class="pointer text_blue ui_bubble" '
				+  'bubblesource="checkSuggestion" content="'
				+  item.suggestion + '">查看</div>';
		},
		title: '结论分析',
		stable: true,
		align:'center',
		minWidth:70,
		width:70
	},{
		content: function(item){
			return abtestReport.renderOperation(item);
		},
		title: '操作',
		stable: true,
		align:'center',
		minWidth:150,
		width:150
	}],
	
	
	/**
	 * 获取置信度解释
	 * @param {Object} level
	 * @param {Object} degree
	 */
	getDegreeExplain: function(level, degree){
		if (level > 0) {
			return degree + "%可能性结果是由必然因素导致";
		}
		return "结果不具有统计学意义";
	},
	
	
	/**
	 * 渲染操作列
	 * @param {Object} item
	 */
	renderOperation: function(item){
		var tpl = '<div class="op" labid="' + item.labid 
				+ '" labwinfoid="' + item.labwinfoid + '">'
				+ '		<div class="test_row {0}" status="4">{1}</div>' 
				+ '		<div class="compare_row {2}" status="5">{3}</div>'
				+  '</div>';
		if (item.stat == 4) {
			switch(+item.status){
				case 6:
					return '<div class="text_gray">其他页面修改关键词属性</div>';
				case 7:
					return '<div class="text_gray">该关键词已被删除</div>';
				default:
					return ui.format(tpl, "text_gray", 
								item.status == 4 ? "应用实验组出价" : "&nbsp;", 
								"text_gray", 
								item.status == 5 ? "应用对照组出价" : "&nbsp;");
			}
		}
		else {
			return ui.format(tpl, "pointer text_blue", 
								  "采用实验设置", 
								  "pointer text_blue", 
								  "采用对照设置");
		}
	}
}

var abtestReport = fclab.abtest.report;
