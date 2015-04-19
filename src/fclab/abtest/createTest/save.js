/**
 * 保存/开始实验
 * @author zhouyu01
 */
fclab.abtest.save = {
	/**
	 * 保存和关闭操作，先检测数据
	 * @param {Object} stat 	1保存未开始，2开始实验
	 * @param {Object} optype 	"add/edit"
	 * @param {Object} labid 	实验id
	 */
	saveAndStart: function(stat, optype, labid){
		var result = this.checkBidIsNull(stat);
		//开始实验，要检查是否都有出价
		if (!result) {
			startAbtest.alertBidIsNull();
		}
		else {
			this.saveAndStartRequest(+stat, result, optype, labid);
		}
		
	},
	
	/**
	 * 发送请求/重新发送请求
	 * @param {Object} stat
	 * @param {Object} abwordlist
	 * @param {Object} optype 	"add/edit"
	 * @param {Object} labid 	实验id
	 */
	saveAndStartRequest: function(stat, abwordlist, optype, labid){
		var items = this.getParamsItem(stat);
		var params = {
			"abwordlist": abwordlist,//实验对象
			"onSuccess": function(response){
				var clazz = fclab.abtest;
				if(stat == 1){
					clazz.getTotalInfo.apply(clazz);
					clazz.createDialog.close();
					return ;
				}
				startAbtest.startSuccess(clazz.createDialog);
			},
			"onFail": this.startRequestFail.bind(this, stat, optype, labid)
		};
		var request;
		if (optype == "add") {
			request = fbs.abtest.addAbtest;
			params = baidu.object.extend(params, items);
		}
		else {
			request = fbs.abtest.modAbtest;
			params.labid = labid;
			params.items = items;
		}
		request(params);
	},
	
	/**
	 * 读取除出价外的其他变量
	 * @param {Object} stat
	 */
	getParamsItem: function(stat){
		var step1 = createAbtestStep1;
		var step2 = createAbtestStep2;
		return {
			"labname": step1.getName(),
			"duration": step1.getDurationValue(), //持续时间
			"ratio": step1.getRatioValue(), //实验流量比例
			"labtype": step2.getLabType(), //实验类型
			"focus": step2.getFocus(), //关注指标,1,2,4(点击，展现，转化)
			"labstat": stat //实验状态,2(立即开始)，1(保存未开始)
		};
	},
	
	/**
	 * 保存和开始实验失败
	 * @param {Object} response
	 */
	startRequestFail: function(stat, optype, labid, response){
		if (response.status == 500) {
			startAbtest.startFail(this.saveAndStartRequest.bind(this, stat, optype, labid));
		}
		else {
			if (stat == 2) {
				var errorcode = response.errorCode.code;
				if (errorcode == 180029) {
					startAbtest.testToUpper();
				}
				else {
					fclab.getFailTip("CreateTestError", errorcode);
				}
			}else{
				ajaxFail(0);
			}
		}
	},
	
	/**
	 * 检查是否都有出价
	 * @param {Object} stat 1保存未开始，2开始实验
	 */
	checkBidIsNull: function(stat){
		var abwordlist = [];
		var resource = createAbtestStep3.currentData;
		var len = resource.length;
		for (var i = 0; i < len; i++) {
			if (!resource[i].testbid && +stat == 2) {
				return false;
			}
			abwordlist[i] = {
				"winfoid": resource[i].winfoid,
				"bid": resource[i].testbid
			}
		}
		return abwordlist;
	}
}
var saveAbtest = fclab.abtest.save;