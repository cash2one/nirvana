ui.Bubble.source.testTableWords = {
	type : 'normal',
	iconClass : 'ui_bubble_icon_info',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	showByClick : true,
	showByOver : true,			//鼠标悬浮延时显示
	showByOverInterval : 500,	//悬浮延时间隔
	hideByOut : false,			//鼠标离开延时显示
//	hideByOutInterval : 2000,	//离开延时间隔，显示持续时间
	title: function(node, fillHandle, timeStamp){
		return "";
	},
	content: function(node, fillHandle, timeStamp){
		var winfoid = node.getAttribute('winfoid');
		var source = createAbtestStep3.currentData;
		var index = baidu.array.indexOf(source, function(item){
			return item.winfoid == winfoid;
		});
		if (index > -1) {
			var item = source[index];
			var planname = baidu.encodeHTML(item.planname);
			var unitname = baidu.encodeHTML(item.unitname);
			var qstar = qStar.getStar(item.showqstat);
			var wmatch = MTYPE[item.wmatch];
			return ui.format(er.template.get("testTableWordsBubble"), 
								planname, 
								unitname, 
								qstar, 
								wmatch
							);
		}
		else {
			return "";
		}
	}
};
ui.Bubble.source.testTableDetail = {
	type : 'normal',
	iconClass : 'ui_bubble_icon_info',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	showByClick : true,
	showByOver : true,			//鼠标悬浮延时显示
	showByOverInterval : 500,	//悬浮延时间隔
	hideByOut : false,			//鼠标离开延时显示
//	hideByOutInterval : 2000,	//离开延时间隔，显示持续时间
	title: function(node, fillHandle, timeStamp){
		return "";
	},
	content: function(node, fillHandle, timeStamp){
		var winfoid = node.getAttribute('winfoid');
		var source = createAbtestStep3.currentData;
		var index = baidu.array.indexOf(source, function(item){
			return item.winfoid == winfoid;
		});
		if (index > -1) {
			var item = source[index];
			var render = createAbtestStep3.renderData;
			var trans = render("trans", item.trans);
			var clkrate = render("clkrate", item.clkrate);
			var avgprice = render("avgprice", item.avgprice);
			return ui.format(er.template.get("testTableDetailBubble"), 
								trans, 
								clkrate,
								avgprice
							);
		}
		else {
			return "";
		}
	}
};
ui.Bubble.source.reportTableWords = {
	type : 'normal',
	iconClass : 'ui_bubble_icon_info',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	showByClick : true,
	showByOver : true,			//鼠标悬浮延时显示
	showByOverInterval : 500,	//悬浮延时间隔
	hideByOut : false,			//鼠标离开延时显示
	title: function(node, fillHandle, timeStamp){
		return "";
	},
	content: function(node, fillHandle, timeStamp){
		var winfoid = node.getAttribute('winfoid');
		fbs.material.getAttribute('wordinfo', 
			["planname", "unitname", "wmatch", "showqstat"], 
			{
				condition: {
					"winfoid": [winfoid]
				},
				onSuccess: function(res){
					var item = res.data.listData[0];
					var planname = baidu.encodeHTML(item.planname);
					var unitname = baidu.encodeHTML(item.unitname);
					var qstar = qStar.getStar(item.showqstat);
					var wmatch = MTYPE[item.wmatch];
					var tpl = er.template.get("testTableWordsBubble");
					var content = ui.format(tpl, planname, 
												unitname, qstar, wmatch);
					setTimeout(function(){
						fillHandle(content, timeStamp);
					}, 200);
				},
				onFail: function(res){
					content = "读取数据失败";
					setTimeout(function(){
						fillHandle(content, timeStamp);
					}, 200);
				}
			});
		return IMGSRC.LOADING_FOR_TEXT;
	}
};
ui.Bubble.source.checkSuggestion = {
	type : 'normal',
	iconClass : 'ui_bubble_icon_none',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	showByClick : true,
	showByOver : false,			//鼠标悬浮延时显示
	hideByOut : false,			//鼠标离开延时显示
	title: function(node, fillHandle, timeStamp){
		return "";
	},
	content: function(node, fillHandle, timeStamp){
		return node.getAttribute('content');
	}
};
// cpa平均转化出价
// ui.Bubble.source.cpaAverageBid = {
// 	type : 'tail',
// 	iconClass : 'ui_bubble_icon_info',
// 	positionList : [2,3,4,5,6,7,8,1],
// 	needBlurTrigger : true,
// 	showByClick : true,
// 	showByOver : false,			//鼠标悬浮延时显示
// 	hideByOut : false,			//鼠标离开延时显示
// 	title: function(node, fillHandle, timeStamp){
// 		return '平均转化出价';
// 	},
// 	content: function(node, fillHandle, timeStamp){
// 		return '所选计划下关键词带来一次转化您所愿意支付的平均费用';
// 	}
// };
// ui.Bubble.source.cpaAverageBidOpenXiao = {
// 	type : 'tail',
// 	iconClass : 'ui_bubble_icon_info',
// 	positionList : [2,3,4,5,6,7,8,1],
// 	needBlurTrigger : true,
// 	showByClick : true,
// 	showByOver : false,			//鼠标悬浮延时显示
// 	hideByOut : false,			//鼠标离开延时显示
// 	title: function(node, fillHandle, timeStamp){
// 		return '小流量实验';
// 	},
// 	content: function(node, fillHandle, timeStamp){
// 		return '即所选计划只有一半流量接受工具的优化，剩下一半的流量仍然按自己设置的点击出价进行投放';
// 	}
// };
ui.Bubble.source.cpaTableBidLow = {
	type : 'tail',
	iconClass : 'cpa-table-bid-low',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	showByClick : true,
	showByOver : false,			//鼠标悬浮延时显示
	hideByOut : false,			//鼠标离开延时显示
	title: function(node, fillHandle, timeStamp){
		return '';
	},
	content: function(node, fillHandle, timeStamp){
		return '<span class="cpa-red">所设的出价过低，可能会产生流量锐减的现象</span>';
	}
};
ui.Bubble.source.cpaPlanStatus = {
	type : 'tail',
	iconClass : 'cpa-plan-status',
	positionList : [2,3,4,5,6,7,8,1],
	needBlurTrigger : true,
	showByClick : true,
	showByOver : false,			//鼠标悬浮延时显示
	hideByOut : false,			//鼠标离开延时显示
	title: function(node, fillHandle, timeStamp){
		return '';
	},
	content: function(node, fillHandle, timeStamp){
		var status = node.getAttribute('status');
		var hints  = '';
		switch(status) {
			case '1':
				hints = '由于该计划目前的转化效果发生较大波动，导致该计划使用工具的优化效果降低甚至无法优化，您可以先暂停优化，等点击和转化效果恢复稳定再重新添加。';
				break;
			case '2':
				hints = '由于该计划只投放移动设备，工具无法对其进行优化，建议把其剔除。';
				break;
			case '3':
				hints = '该计划已被删除，建议从工具中剔除。';
				break;
		}
		return hints;
	}
};