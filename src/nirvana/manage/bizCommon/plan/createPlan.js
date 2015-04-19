/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    plan/createPlan.js
 * desc:    新建计划
 * author: 	zhouyu
 * date:    $Date: 2011/1/13 $
 */

/**
 * 新建计划
 */
manage.createPlan = new er.Action({
	
	VIEW: 'createPlan',
	
	IGNORE_STATE : true,
	
	UI_PROP_MAP: {
        /**
         *每个用户的出价比可调整的范围不一样，从后台获取 
         */
        'plan-iterator': {
            max: '*price_max',
            min: '*price_min'
        }
    },
    
	CONTEXT_INITER_MAP : {
       
        /**
         *设置出价比可设置的范围 每个用户的出价比可调整的范围不一样，从后台获取 
         */
        setPlanIterator: function(callback) {
           this.setContext('price_max', nirvana.env.MPRICEFACTOR_RANGE.max.toFixed(2)); 
           this.setContext('price_min', nirvana.env.MPRICEFACTOR_RANGE.min.toFixed(2)); 
           callback();
        }
        
    },
	
	/**
	 * 填充账户推广地域列表
	 */
	onafterrender : function(){
		var me = this;
		fbs.account.getWregion({
			onSuccess: function(data){
				var acctRegion = data.data.listData[0].wregion,
					acctRegion = acctRegion == "" ? [] : acctRegion.split(',');//账户地域列表
				me.setContext("acctRegionDisplay", nirvana.manage.region.abbRegion(acctRegion, "account").title);
				me.setContext("planRegionDisplay", "全部地域");
				me.setContext("planRegionList", me.getAllRegion());
				baidu.g("newRegionList").innerHTML =  me.getContext("acctRegionDisplay");
				if(!nirvana.env.AUTH.region){
					baidu.removeClass('DenyAreaNotice', 'hide');
					me._controlMap['newPlanRegion'].disable(true)
				}
			},
			onFail: function(data){
				ajaxFailDialog();
			}
		});
		
		//设置出价比监听事件 
        ui.util.get('plan-iterator').onblur = manage.planLib.checkPriceFactor(['createPlanOk','okAndCreateUnit']);
        ui.util.get('plan-iterator').onchange = manage.planLib.checkPriceFactor(['createPlanOk','okAndCreateUnit']);
        baidu.g('mobilePrice').innerHTML = '1.00';

    
        
	},
	
	/**
	 * 各种事件绑定
	 */
	onentercomplete : function(){
        var me = this;
		//使用账户地域
        ui.util.get("newPlanUseAcctRegion").onclick = function(){
            baidu.g("newRegionList").innerHTML = me.getContext("acctRegionDisplay");
            baidu.g("setPlanRegion").style.display = "none";
        }
		//使用计划地域
        ui.util.get("newPlanRegion").onclick = me.usePlanRegion();
		//关闭浮出层
        baidu.g("closeRegionSet").onclick = ui.util.get("regionCancel").onclick = me.togglePlanRegion();
		//保存地域修改
        ui.util.get("regionOk").onclick = me.modPlanRegion();
		//选择全部地域
        ui.util.get("allRegion").onclick = function(){
            ui.util.get('regionBody').main.style.display = "none";
        };
		//选择部分地域
        ui.util.get("partRegion").onclick = function(){
            ui.util.get('regionBody').main.style.display = "block";
        };
		//输入计划名
        ui.util.get("newPlanName").onchange = me.checkPlanName;
        me.checkPlanName();
		//保存取消事件
        ui.util.get("newPlanName").onenter = me.createOk();
        ui.util.get("createPlanOk").onclick = me.createOk();
        ui.util.get("okAndCreateUnit").onclick = me.OkAndCreateUnit();
        ui.util.get("createPlanCancel").onclick = function(){
            ui.Dialog.confirm({
                title: '确认',
                content: "您确定不进行新建操作了吗？",
                onok: function(){
                    me.onclose()
                },
                oncancel: function(){
                }
            });
        };
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
		
		//移动建站url
		baidu.array.each($$('.mobile_website'),function(item){
			baidu.setAttr(item,"href",MOBILE_STATION_PATH + nirvana.env.USER_ID);
			baidu.setStyle(item, 'marginLeft', '60px');
		})
		//选择投放设备
		var type = me.arg.type;
		
		if(type =='addwirelessplan'){
			baidu.removeClass(baidu.g('planDevicePhone'),'hide');
			me.setContext('planDeviceValue','2');
			baidu.hide(baidu.g('planPriceFactor'));
		}
		ui.Bubble.init();
		
	},
	
	//创建计划，发送请求
	createOk:function(){
		var me = this;
		return function(){
			fbs.plan.add(me.getParam());
		}
	},
	
	//新建计划并新建单元
	OkAndCreateUnit:function(){
		var me = this;
		return function(){
			var param = me.getParam();
			param.onSuccess = function(data){
				fbs.material.clearCache("planinfo");
				er.controller.fireMain('reload', {});
				ui.util.get('SideNav').refreshPlanList();
				me.onclose();
				
				var planid = data.data;
				nirvana.util.openSubActionDialog({
					id: 'createUnitDialog',
					title: '新建推广单元',
					width: 440,
					actionPath: 'manage/createUnit',
					params: {
						planid:[planid]
					},
					onclose: function(){
					}
				});
			}
			fbs.plan.add(param);
		}
	},
	
	/**
	 * 获取表单数据
	 */
	getParam: function(){
		var me = this;
		var param = {};
		param.planname = ui.util.get("newPlanName").getValue();
		param.mPriceFactor = trim(ui.util.get('plan-iterator').getValue());
		param.showprob = ui.util.get("planOpt").getGroup().getValue();
	//	var region = ui.util.get("newPlanRegion").getChecked();
		if (ui.util.get("newPlanUseAcctRegion").getChecked()) {
			param.wregion = [];
		}
		else 
			if (ui.util.get("newPlanRegion").getChecked()) {
				param.wregion = me.getContext("planRegionList");
			}
		param.cprostat = 1;//ui.util.get("cpro").getValue();
		param.cproprice = "";//ui.util.get("cproPrice").getValue();
		param.onSuccess = function(data){
			var plannametip = baidu.g("createPlanErrorTip");
			plannametip.innerHTML = "";
			fbs.material.clearCache("planinfo");
			er.controller.fireMain('reload', {});
			ui.util.get('SideNav').refreshPlanList();
			me.onclose();
		};
		param.onFail = me.saveFailHandler();
		//投放设备
		if(me.getContext('planDeviceValue')){
			param.device = me.getContext('planDeviceValue');
		}
		return param;
	},
	
	/**
	 * 保存失败
	 */
	saveFailHandler: function(){
		var me = this;
		return function(data){
			if (data.status != 500) {
				var error = fbs.util.fetchOneError(data), 
					plannametip = baidu.g("createPlanErrorTip"), 
					errorcode;
				plannametip.innerHTML = "";
				if (error) {
					for (var item in error) {
						errorcode = error[item].code;
						me.displayError(errorcode);
					}
				}else{
					error = data.errorCode; 
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
	 * 显示错误信息
	 * @param {Object} errorcode
	 */
	displayError: function(errorcode){
		var me = this,
			plannametip = baidu.g("createPlanErrorTip");
		switch (errorcode) {
			case 400:
			case 498:
			case 499:
				plannametip.innerHTML = nirvana.config.ERROR.PLAN.NAME[errorcode];
				break;
			case 405:
				plannametip.innerHTML = nirvana.config.ERROR.PLAN.NAME[errorcode];
				break;
			default:
				break;
		}
	},
	
	/**
	 * 使用计划地域
	 */
	usePlanRegion: function(){
		var me = this;
		return function(){
		//	var icon = "<div ui=''></div><a href='javascript:void()' id='modifyPlanRegionIcon' class='modify_plan_region_icon'>66</a>"
			baidu.g("newRegionList").innerHTML = "<span class='plan_region_display'>" + me.getContext("planRegionDisplay") + "</span>";
			var button = ui.util.create("Button",{"id":"modifyPlanRegion","skin":"shrink_16"});
			var icon = document.createElement("div");
			button.render(icon);
			baidu.g("newRegionList").appendChild(icon);
			button.onclick = me.togglePlanRegion();
		}
	},

	/**
	 * 打开关闭地域选择框
	 */
	togglePlanRegion: function(){
		var me = this;
		return function(){
			if (!baidu.g('setPlanRegion').style.display || baidu.g('setPlanRegion').style.display == "none") {
				baidu.g('setPlanRegion').style.display = "block";
			}
			else {
				baidu.g('setPlanRegion').style.display = "none";
			}
		}
	},
	
	/**
	 * 修改地域显示文字
	 */
	modPlanRegion:function(){
		var me = this;
		return function(){
			var isAll = ui.util.get("allRegion").getGroup().getValue(),
			    region = [],
			    regionStr = [];
			if (isAll == 0) {
				region = me.getAllRegion();
			}else{
				region = ui.util.get("regionBody").getCheckedRegion();
			}
			me.setContext("planRegionList", region);
			for (var i = 0; i < region.length; i++) {
				//region[i] = region[i].toString();
				//clone取消后避免数据污染引入新变量
				regionStr[i] = region[i].toString();
			}
			me.setContext("planRegionDisplay", nirvana.manage.region.abbRegion(regionStr, "account").title);
			(me.usePlanRegion())();
			baidu.g('setPlanRegion').style.display = "none";
		}
		
	},
	
	/**
	 * 获取所有地域
	 */
	getAllRegion:function(){
		return [1,2,3,4,5,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37];
	},
	
	/**
	 * 检查计划名称
	 */
	checkPlanName : function () {
		var inp = ui.util.get("newPlanName").main,
		    nameLen = getLengthCase(baidu.trim(inp.value));
	
		if (nameLen > PLAN_NAME_MAXLENGTH) {
			inp.maxLength = inp.value.length;
			inp.value = subStrCase(inp.value, PLAN_NAME_MAXLENGTH);
			nameLen = getLengthCase(baidu.trim(inp.value));
		} else {
	        inp.maxLength = inp.value.length + (PLAN_NAME_MAXLENGTH - nameLen);
		}
		baidu.g('planNameNumTip').className = 'tipinfoinline';
		baidu.g("planNameNumTip").innerHTML = "还能输入" + (PLAN_NAME_MAXLENGTH - nameLen ) + '个字符';
	}
}); 
