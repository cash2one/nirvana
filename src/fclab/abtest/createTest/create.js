/**
 * 新建实验/编辑实验的action
 * @author zhouyu01
 */
fclab.abtest.create = new er.Action({
	VIEW: 'createTest',

	defaultValue: {
		"labname": "",
		"duration": 3, //持续时间，默认3周，后台传的单位为天，换算成周以后才能传入该action
		"ratio": 50, //实验流量比例,20%的话，为20，默认50%
		"labtype": 1, //实验类型，1：出价，默认为出价
		"focus": 1, //关注指标,1,2,4(点击，展现，转化),位表示那些关注那些指标，默认为点击
		"labstat": 1, //实验状态,2(立即开始)，1(保存未开始)
		"abwordlist": []//实验对象
	},
	
	
	UI_PROP_MAP: {
		testWordList: {
			type: 'List',
			skin: 'wordlist'
		},
		
		testWordSelect: {
			type: 'AvatarMaterial',
			form: 'material',
			width: '400',
			height: '290',
			addWords: '*addWords',
			wordFields: '*wordFields',
			timeRange: '*timeRange'
		},
		
		testBidSetTable: {
			type: 'Table',
			select: 'multi',
			noDataHtml: '',
			colViewCounter: 'all',
			fields: '*tableFields',
			datasource: '*testData'
		}
	},
	
	
	CONTEXT_INITER_MAP: {
		materialSelect: function(callback){
			var me = this;
			var abword = me.arg.abwordlist || [];
			var addwords = createAbtestStep2.getWordSet(abword);
			me.setContext("addWords", addwords);
			me.setContext("wordFields", ["winfoid", "showword","wordstat","pausestat","shows","clks","paysum"]);
			me.setContext("timeRange", nirvana.util.dateOptionToDateValue(1));
			callback();
		},
		
		testBidSetTable: function(callback){
			this.setContext("tableFields", createAbtestStep3.field);
			this.setContext("testData", []);
			callback();
		}
	},
	
	onafterrender: function(){
		var me = this;
		
		me.value = me.arg || {};
		//若是编辑，则传type:"edit"，默认为新增
		me.type = me.value.type || "add";
		//可设置打开显示第几步
		me.step = me.value.step || 1;
		//设置初始值
		var defaultValue = baidu.object.clone(me.defaultValue)
		me.value = baidu.object.extend(defaultValue, me.value);
		//已设置的实验出价要记住
		createAbtestStep3.refreshTableData(me.value.abwordlist || []);
		
		//打开相应步骤
		me.toStep();
		//初始化各种内容
		me.init();
		//绑定各种事件
		me.bind();
		//小问号
		var bubbleSet = baidu.q("ui_bubble", "CreateTestBody", "span");
		ui.Bubble.init(bubbleSet);
	},
	
	onentercomplete: function(){
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 初始化各种内容
	 */
	init: function(){
		createAbtestStep1.render(this.value);
		createAbtestStep2.render(this.value);
		
		var abwordlist = this.value.abwordlist;
		var winfoids = [];
		var len = 0;
		for (var i = 0, l = abwordlist.length; i < l; i++) {
			winfoids[len++] = abwordlist[i].winfoid;
		}
		createAbtestStep3.currentData = [];
		createAbtestStep3.render(winfoids, abwordlist);
	},
	
	
	/**
	 * 绑定各种事件
	 */
	bind: function(){
		var me = this;
		var control = me._controlMap;
		var optype = me.value.optype;
		var labid = me.value.labid;
		//从第二步返回上一步
		control["ToCreateTestStep1"].onclick = me.toStep.bind(me, 1);
		//从第三步返回上一步
		control["ToCreateTestStep23"].onclick = me.toStep.bind(me, 2);
		//从第一步进入下一步
		control["ToCreateTestStep21"].onclick = me.checkStep.bind(me, 1);
		//从第二步进入下一步
		control["ToCreateTestStep3"].onclick = me.checkStep.bind(me, 2);
		
		//检测关键词可用性
		baidu.g("CheckWordsAvailable").onclick = function(){
			createAbtestStep2.checkWords({
				labid: labid
			});
		};
		//保存
		ui.util.get("SaveTest").onclick = function(){
			saveAbtest.saveAndStart(1, optype, labid);
		};
		//开始实验
		ui.util.get("StartTest").onclick = function(){
			saveAbtest.saveAndStart(2, optype, labid);
		};
	},


	/**
	 * 打开相应步骤
	 * @param {Object} step
	 */
	toStep: function(step){
		var me = this;
		if (step) {
			me.step = step;
		}
		
		for (var i = 1; i <= 3; i++) {
			if (i == me.step) { //当前步骤
				baidu.addClass("CreateTestHead" + i, "current");//设置title为选中
				baidu.removeClass("CreateTestStep" + i, "hide"); //显示内容
			}
			else {
				baidu.removeClass("CreateTestHead" + i, "current");
				baidu.addClass("CreateTestStep" + i, "hide");
			}
		}
		//第三步要等表格渲染才能resize
		var dialog = fclab.abtest.createDialog;
		if(dialog && me.step != 3){
			dialog.resizeHandler();
		}
	},
	
	/**
	 * 检查每一步的内容
	 * @param {Object} step
	 */
	checkStep: function(step){
		var me = this;
		var params = {};
		if (typeof(me.value.labid) != "undefined") {
			params.labid = me.value.labid;
		}
		switch (step) {
			case 1:
				params.callback = me.toStep.bind(me, 2);
				createAbtestStep1.checkName(params); //名称输入正确，进入第二步
				break;
			case 2:
				params.callback = me.toStep.bind(me, 3);
				createAbtestStep2.checkWords(params); //关键词可用，进入第三步
				break;
		}
	}
});