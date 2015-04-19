/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    unit/createUnit.js
 * desc:    新建单元
 * author: 	zhouyu
 * date:    $Date: 2011/1/13 $
 */

/**
 * 新建单元子Action
 */
manage.createUnit = new er.Action({
	
	VIEW: 'createUnit',
	
	IGNORE_STATE : true,
	
	CONTEXT_INITER_MAP : {
		init:function(callback){
			var me = this;
			me.setContext("planNameOfUnit",[{
				text:"请选择推广计划",
				value:0
			}])
			callback();
		}
		
	},
	
	/**
	 * 填充计划下拉框
	 */
	onafterrender : function(){
		var me = this,
		    planid;
		if (planid = me.arg.planid) {
			me.setPlan(planid);
		}else{
			me.fillPlanList();
		}
		ui.Bubble.init();
	},
	
	/**
	 * 选中特定计划，设置下拉框disabled
	 * @param {Object} planid 计划id
	 */
	setPlan:function(planid){
		fbs.plan.getInfo({
			condition: {
				planid: planid
			},
			onSuccess: function(data){
				var targetPlan = ui.util.get("planNameOfUnit");
				var values = data.data.listData[0];
				targetPlan.add({
					text: baidu.encodeHTML(values.planname),
					value: planid[0]
				});
				targetPlan.setValue(planid[0]);
				targetPlan.disable(true);
				var devicePrefer = values.deviceprefer;
				if(devicePrefer == 0){//全部设备的时候，才显示移动出价比提示
					baidu.g('mprice-factor-intip').innerHTML = values.mPriceFactor;
			        baidu.removeClass(baidu.g('mprice-tip-block'), 'hide');
				}
				
			},
			onFail: function(data){
			}
		});
	},
	
	/**
	 * 填充计划选择下拉框
	 */
	fillPlanList:function(){
		fbs.plan.getNameList({
			onSuccess: function(data){
				var dat = data.data.listData;
				var planlist = [];
				planlist[planlist.length] = {
					text: "请选择推广计划",
					value: 0
				};
				for (var i = 0, l = dat.length; i < l; i++) {
					planlist[planlist.length] = {
						text: baidu.encodeHTML(dat[i].planname),
						value: dat[i].planid
					}
				}
				ui.util.get("planNameOfUnit").fill(planlist);
			},
			onFail: function(data){
			}
		});
	},
	
	/**
	 * 各种事件绑定
	 */
	
	onentercomplete : function() {
		var me = this;
		var plan = me._controlMap.planNameOfUnit;
		plan.onselect = function(value) {
			if(value) {
				baidu.g("targetPlan").innerHTML = "";
                var param = {
                    showmPriceFactor : true,
					planids : [value]

				}
				nirvana.manage.handleMpriceFactorShow(param);//出价比例显示

			}
			else{
				nirvana.manage.hideMpriceFactor();//没有计划选中的时候出价比例隐藏
			}
		};
		//检查单元名文字输入
		ui.util.get("newUnitName").onchange = me.checkUnitName;
		me.checkUnitName();
		//底层按钮事件处理
		ui.util.get("newUnitName").onenter = me.createOk();
		ui.util.get("newUnitPrice").onenter = me.createOk();
		ui.util.get("createUnitOk").onclick = me.createOk();
		ui.util.get("okAndAddKw").onclick = me.okAndAddKw();
		ui.util.get("createUnitCancel").onclick = function() {
			ui.Dialog.confirm({
				title : '确认',
				content : "您确定不进行新建操作了吗？",
				onok : function() {
					me.onclose()
				},
				oncancel : function() {
				}
			});
		};
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	}
,
	
	/**
	 * 新建单元
	 */
	createOk: function(){
		var me = this;
		return function(){
			if(me.getPlanId() == 0){
				me.noPlanPromp();
				return;
			}
			baidu.g("targetPlan").innerHTML = "";
			fbs.unit.add(me.getParam());
		}
	},
	
	/**
	 * 新建单元并增加关键词
	 */
	okAndAddKw:function(){
		var me = this;
		return function(){
			if(me.getPlanId() == 0){
				me.noPlanPromp();
				return;
			}
			baidu.g("targetPlan").innerHTML = "";
			var param = me.getParam();
			var selectedPlanId = ui.util.get('planNameOfUnit').getValue();
			param.onSuccess = function(data){
				fbs.material.clearCache("unitinfo");
				fbs.material.clearCache("wordinfo");
				er.controller.fireMain('reload', {});
				//ui.util.get('SideNav').refreshPlanList();
				me.onclose();
				var unitid = data.data.unitid,
					planid = selectedPlanId;
				var param = {
					planid: planid,
					unitid: unitid,
					queryMap: {},
					popup_entry: 'kr_new_unit_addwords',//入口标识，用于监控
                    isInNewFlow: true
				};
				ui.util.get('SideNav').refreshUnitList([planid]);
				nirvana.manage.createSubAction.keyword(param);
			}
			fbs.unit.add(param);
		}
	},
	
	/**
	 * 没有选定计划
	 */
	noPlanPromp: function(){
		baidu.g("createUnitErrorTip").innerHTML = "";
		baidu.hide(baidu.g("createUnitErrorTip"));
		baidu.g("unitPriceErrorTip").innerHTML = "";
		baidu.hide(baidu.g("unitPriceErrorTip"));
		baidu.g("targetPlan").innerHTML = "请选择目标计划";
	},
	
	/**
	 * 获取选择计划的id
	 */
	getPlanId: function(){
		return ui.util.get("planNameOfUnit").getValue();
	},
	
	/**
	 * 获取数据
	 */
	getParam: function(){
		var me = this;
		var param = {};
		param.planid = me.getPlanId();
		param.unitname = ui.util.get("newUnitName").getValue();
		param.unitbid = ui.util.get("newUnitPrice").getValue();
		param.onSuccess = function(data){
		    fbs.material.clearCache("planinfo");//计划的单元个数信息变了
			fbs.material.clearCache("unitinfo");
			fbs.material.clearCache("wordinfo");
			er.controller.fireMain('reload', {});
			//ui.util.get('SideNav').refreshPlanList();
			ui.util.get('SideNav').refreshUnitList([param.planid]);
			me.onclose();
		};
		param.onFail = me.saveFailHandler();
		return param;
	},
	
	/**
	 * 新建失败
	 */
	saveFailHandler: function(){
		var me = this;
		return function(data){
			if (data.status != 500) {
		///		var error = fbs.util.fetchOneError(data), 
				var error = data.errorCode,
					unitname = baidu.g("createUnitErrorTip"), 
					unitprice = baidu.g("unitPriceErrorTip"), 
					errorcode;
				unitname.innerHTML = "";
				unitprice.innerHTML = "";
				baidu.hide(unitname);
				baidu.hide(unitprice);
				baidu.g("targetPlan").innerHTML = "";
				if (error) {
					if (error.code) {
						me.displayError(error.code);
					}
					else {
						for (var item in error) {
							errorcode = error[item];
							me.displayError(errorcode);
						}
					}
				}
			}else{
				ajaxFail(0);
			}
		}
	},
	
	/**
	 * 失败信息显示
	 * @param {Object} errorcode 
	 */
	displayError: function(errorcode){
		var me = this,
			unitname = baidu.g("createUnitErrorTip"), 
			unitprice = baidu.g("unitPriceErrorTip");
		switch (errorcode) {
			case 500:
			case 501:
			case 502:
				unitname.innerHTML = nirvana.config.ERROR.UNIT.NAME[errorcode];
				baidu.show(unitname);
				break;
			case 505:
			case 507:
			case 508:
			case 506:
			case 599:
				unitprice.innerHTML = nirvana.config.ERROR.UNIT.PRICE[errorcode];
				baidu.show(unitprice);
				break;
			case 503:
				ajaxFail(errorcode);
				break;
			case 513:
				unitprice.innerHTML = nirvana.config.ERROR.UNIT.NAME[errorcode];
				baidu.show(unitprice);
				break;
		}
	},

	/**
	 * 检查单元名称
	 */
	checkUnitName : function () {
		var inp = ui.util.get("newUnitName").main,
		    nameLen = getLengthCase(baidu.trim(inp.value));
	
		if (nameLen > UNIT_NAME_MAXLENGTH) {
			inp.maxLength = inp.value.length;
			inp.value = subStrCase(inp.value, UNIT_NAME_MAXLENGTH);
			nameLen = getLengthCase(baidu.trim(inp.value));
		} else {
	        inp.maxLength = inp.value.length + (UNIT_NAME_MAXLENGTH - nameLen);
		}
		baidu.g('unitNameNumTip').className = 'tipinfoinline';
		baidu.g("unitNameNumTip").innerHTML = "还能输入" + (UNIT_NAME_MAXLENGTH - nameLen ) + '个字符';
	}

}); 
