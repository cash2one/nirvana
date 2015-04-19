/**
 * 新建实验/编辑实验 第一步
 * @author zhouyu01
 */
fclab.abtest.createStep1 = {
	ratioSlideBar: null,	//流量分布控件
	persistBar:null,		//持续时长分布控件
	
	/**
	 * 渲染第一步数据
	 * @param {Object} data
	 */
	render: function(data){
		var me = this;
		/**
		 * 如果打开浮层时不是显示第一步，则换一下第一步DOM的class
		 * 因为DOM处于hide状态时，无法获取滑动条的长度
		 * 如果一开始就定义为绝对定位，那么第三步的表格会出现问题
		 * 且本身不赞成在大的DOM节点上定义绝对定位
		 * 所以这里转换下class，初始化完以后，再换回来
		 */
		var elem = baidu.g("CreateTestStep1");
		var mark = 0;
		if (baidu.dom.hasClass(elem, "hide")) {
			baidu.addClass(elem, "hd");
			baidu.removeClass(elem, "hide");
			mark = 1;
		}
		
		//填入实验名称
		me.fillName(data.labname);
		//初始化实验持续时长
		me.persistBar = new fclab.chosenBar({
			container: "DurationBar",
			itemset: me.getDurationItem(),
			value: data.duration,
			width: 30,
			type: 2
		});
		//初始化流量分布
		me.ratioSlideBar = new fclab.slideBar({
			container: "RatioSlideBar",
			value: data.ratio,
			callback: me.fillRatioValue.bind(me)
		});
		if (mark == 1) {
			baidu.addClass(elem, "hide");
			baidu.removeClass(elem, "hd");
		}
	},
	
	/**
	 * 填充实验名称
	 * @param {Object} value
	 */
	fillName: function(value){
		ui.util.get("newTestName").setValue(value);
	},
	
	/**
	 * 检查名称是否正确
	 * @param {Object} params
	 */
	checkName: function(params){
		var name = this.getName();
		var labid = typeof(params.labid) == "undefined"? null : params.labid;
		var callback = params.callback;
		if (name.length > 0) {
			fbs.abtest.checkLabName({
				labid: labid,
				labname: name,
				onSuccess: function(response){
					callback && callback();
					baidu.addClass("NewTestNameError", "hide");
				},
				onFail: function(response){
					fclab.getFailTip("NewTestNameError", response.errorCode.code);
					baidu.removeClass("NewTestNameError", "hide");
				}
			});
		}
		else {
			fclab.getFailTip("NewTestNameError", "testnamenull");
			baidu.removeClass("NewTestNameError", "hide");
		}
	},
	
	/**
	 * 获取实验名称
	 */
	getName: function(){
		return baidu.trim(ui.util.get("newTestName").getValue());
	},
	
	
	/**
	 * 获取持续时长的选项集
	 */
	getDurationItem: function(maxLen){
		var itemset = [];
		maxLen = maxLen || 8;
		for (var i = 1, len = maxLen; i <= len; i++) {
			itemset[itemset.length] = {
				"text": i + "周",
				"value": i
			}
		}
		return itemset;
	},
	
	/**
	 * 获取持续时长的值，单位为周，在fbs中换算成天传给后台
	 */
	getDurationValue: function(){
		return this.persistBar.getValue();
	},
	
	
	
	
	/**
	 * 填充流量分布值
	 */
	fillRatioValue: function(value){
		var ratio = this.calRatioValue(value);
		baidu.g("ExperRatio").innerHTML = ratio;
		baidu.g("CompareRatio").innerHTML = 100 - ratio;
	},
	
	/**
	 * 计算流量分布值
	 */
	calRatioValue: function(value){
		return Math.round(value / 10) * 10;
	},
	
	
	/**
	 * 获取流量分布值
	 */
	getRatioValue: function(){
		return this.calRatioValue(this.ratioSlideBar.getValue());
	}  
}

var createAbtestStep1 = fclab.abtest.createStep1;
