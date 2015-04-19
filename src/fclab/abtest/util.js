/**
 * abtest工具常用方法
 * @author zhouyu01
 */
fclab.abtestUtil = {
	/**
	 * 返回长度条,自适应
	 * @param {Object} options
	 */
	getBar: function(options){
		var defaultOptions = {	//默认参数，可通过options传入覆盖
			minwidth: 5,			//最小宽度
			maxvalue: 160,			//“对照长度条”的值
			value: 80,				//“实际显示长度条”的值
			height: 10,				//高度
		//	bgbottom: "#F6F6F6",	
			bgbottom: "#EBEBEB",	//“对照长度条”背景色
			bgtop: "#C3C3C3"		//“实际显示长度条”背景色
		};
		var tpl = '<div style="width:100%;height:{1}px;background:{2}">' 
				+ '		<div style="width:{3};height:{1}px;background:{4}">'
				+ '			<div style="width:{0}px;height:{1}px;background:{4}"></div>'
				+ '		</div>' 
				+ '</div>';
		options = baidu.object.extend(defaultOptions, options);
		var percent    = Math.floor(options.value/options.maxvalue*100);
		percent        = percent > 100 ? 100 : percent;
		var innerwidth = percent + "%";
		return ui.format(tpl, 
							options.minwidth,
							options.height, 
							options.bgbottom, 
							innerwidth, 
							options.bgtop);
	},


	/**
	 * 获取实验状态展示内容
	 * @param {Object} stat 实验状态 1未开始，2试验中，3已完成
	 */
	getStat: function(stat){
		var tpl = '<span class="abtest_stat abtest_stat_bg_{1}">{0}</span>';
		var text = ["", "未开始", "实验中", "已完成"];
		return ui.format(tpl, text[+stat], stat);
	},
	
	/**
	 * 实验时长信息文字展示
	 * @param {Object} stat			实验状态
	 * @param {Object} duration		实验设置总时长（天,7的倍数）
	 * @param {Object} passday		实验已进行时长（天）
	 * @param {Object} efftime		实验生效时间（2012-12-11）
	 */
	getPassDay: function(stat, duration, passday, efftime){
		switch (+stat) {
			case 1: //未开始
				return "将实验" + Math.ceil(duration / 7) + "周"; //向上取整，避免脏数据
			case 2: //试验中
			case 3: //已完成
				var week = Math.floor(passday / 7);
				var odd = passday % 7;
				var hinttime = "";
				if (week > 0 && odd > 0) {
					hinttime = week + "周 + " + odd + "天";
				}
				else {
					if (week != 0) {
						hinttime = week + "周";
					}
					else {
						hinttime = odd + "天";
					}
				}
				if (stat == 3) {
					var end = baidu.date.parse(efftime);
					end.setDate(end.getDate() + parseInt(passday) - 1);
					var endday = baidu.date.format(end, "yyyy-MM-dd");
					return endday + "完成，共" + hinttime;
				}
				else {
					return "已实验" + hinttime;
				}
		}
	},

	/**
	 * 获取实验时长方格展示
	 * @param {Object} duration	实验设置总时长（天,7的倍数）
	 * @param {Object} passday  实验已进行时长（天）
	 * @param {Object} efftime	实验生效时间（2012-12-11）
	 *							用于mouseover时显示每格时间段，一期暂时不上该功能
	 */
	getDuration: function(duration, passday, efftime){
		passday = +passday > +duration ? duration : passday;
		var passed = Math.floor(passday / 7);//向下取整
		var remain = Math.ceil(duration / 7) - passed;
		var passedClass = "passed_bg";
		var remainClass = "remain_bg";
		var tpl = '<span class="{0}">&nbsp;</span>';
		var html = [];
		html[html.length] = '<div class="abtest_duration_square">';
		for (var i = 0; i < passed; i++) {
			html[html.length] = ui.format(tpl, passedClass);
		}
		for (var i = 0; i < remain; i++) {
			html[html.length] = ui.format(tpl, remainClass);
		}
		html[html.length] = '</div>';
		return html.join("");
	},
	
	/**
	 * 获取不同状态下的操作
	 * @param {Object} data
	 */
	getOperation: function(data){
		var tpl = "abtestOperation" + data.labstat;
		return ui.format(er.template.get(tpl), data.labname);
	},
	
	/**
	 * 渲染对比数据
	 * @param {Object} item
	 * @param {Object} needshow
	 * @param {Object} options
	 */
	getDataInfo: function(item, needshow, options){
		var html = this.buildDataInfo(item, needshow, options);
		return ui.format(er.template.get("abtestPkBar"), html);
	},

	/**
	 * 获取所有对比数据
	 * @param {Object} item		数据map
	 * @param {Object} needshow	需要展示的数据顺序，Array
	 * @param {Object} options	长度条参数
	 */
	buildDataInfo: function(item, needshow, options){
		var barItemTpl = er.template.get("abtestPkBarItem");
		var html = [];
		var itemstr = ["ratio", "show", "click", "trans", "pay"];
		
		//默认展现顺序为itemstr，itemstr需是一个全集
		needshow = needshow || itemstr;
		options = options || {};
		//把没有的数据置为0，避免初始报错
	/*	for (var i = 0, len = itemstr.length; i < len; i++) {
			if (typeof(item[itemstr[i]]) == "undefined") {
				item[itemstr[i]] = 0;
			}
		}*/
		
		var itemname = ["流量", "展现量", "点击量", "转化量", "消费"];
		var testvalue = [item.ratio, item.show, item.click, item.trans, item.pay];
		var focusindex = [1000, 2, 1, 4, 1001];
		var comparevalue = [100 - (+item.ratio), item.oshow, item.oclick, item.otrans, item.opay];
		var maxvalue;
		var showvalue = this.getShowValue(item);
		var showtestvalue = showvalue.showtestvalue;
		var showcomparevalue = showvalue.showcomparevalue;
		for (var i = 0, len = itemstr.length; i < len; i++) {
			if(baidu.array.indexOf(needshow, itemstr[i]) > -1){
				if (itemstr[i] == "ratio") {
					maxvalue = 100;
				}
				else {
					maxvalue = Math.max(testvalue[i], comparevalue[i]);
				}
				var testbarOptions = baidu.object.extend(
											baidu.object.clone(options), {
													maxvalue: maxvalue,
													value: testvalue[i]
												});
				var comparebarOptions = baidu.object.extend(
											baidu.object.clone(options), {
													maxvalue: maxvalue,
													value: comparevalue[i]
												});
				html[html.length] = ui.format(barItemTpl, 
												itemstr[i], 
												itemname[i], 
												showtestvalue[i], 
												this.getFocusIcon(focusindex[i], item.focus), 
												this.getBar(testbarOptions), 
												this.getBar(comparebarOptions), 
												showcomparevalue[i]
											);
			}
		}
		return html.join("");
	},
	
	/**
	 * 重定义显示数据
	 * @param {Object} item
	 */
	getShowValue: function(item){
		var showtestvalue;
		var showcomparevalue;
		var trans;
		var comparetrans;
		if (item.labstat && item.labstat == 1) {//若实验未开始，除流量外都显示“-”
			showtestvalue = [item.ratio + "%", "-", "-", "-", "-"];
			showcomparevalue = [(100 - (+item.ratio)) + "%", "-", "-", "-", "-"];
		}
		else {//若转化等于0，则显示"-"
			trans = +item.trans > 0 ? item.trans : "-";
			comparetrans = +item.otrans > 0 ? item.otrans : "-";
			showtestvalue = [item.ratio + "%", item.show, item.click, trans, fixed(item.pay)];
			showcomparevalue = [(100 - (+item.ratio)) + "%", item.oshow, 
										item.oclick, comparetrans, fixed(item.opay)];
		}
		return {
			showtestvalue: showtestvalue,
			showcomparevalue: showcomparevalue
		}
	},
	
	/**
	 * 获取关注图标
	 * @param {Object} index	当前指标
	 * @param {Object} focus	关注指标,0,2,4(点击，展现，转化)
	 */
	getFocusIcon: function(index, focus){
		return (typeof(focus) != "undefined" && (index == focus)) ? 
			'<span class="abtest_focus_icon" title="重点关注指标"></span>' 
			: '';
	},
	
	/**
	 * 下载实验数据/实验报告
	 * @param {Object} labid
	 */
	downloadReport: function(labid){
		var form = baidu.g('TestMtlForm');
		form.action = '/nirvana/tool/lab/download_lab.do?labid=' + labid + '&userid=' + nirvana.env.USER_ID;    
        form.submit();
	}
}
