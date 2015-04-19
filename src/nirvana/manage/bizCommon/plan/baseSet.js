/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    plan/baseSet.js
 * desc:    计划基本设置
 * author: 	zhouyu
 * date:    $Date: 2011/1/13 $
 */

/**
 * 计划基本设置
 */
manage.planBaseSet = new er.Action({
	
	VIEW: 'setPlanBase',
	
	IGNORE_STATE : true,
	
	/**
	 * 初始化UI
	 * @param {Object} callback
	 */
	CONTEXT_INITER_MAP : {
		init: function(callback){
			var me = this;
			me.setContext('planSetTab', ['基本设置', '计划IP排除', '高级设置']);
			callback();
		}
	},
	
	/**
	 * 获取数据对表单进行初始化
	 */
	onafterrender : function(){
		var me = this;
		fbs.plan.getBasicInfo({
			condition:{
				planid: me.arg.planid
			},
			onSuccess:me.initData(),
			onFail: function(){
				ajaxFailDialog();
			}
		});
	},
	
	/**
	 * 初始化表单
	 */
	initData: function(){
		var me = this;
		return function(data){
			var dat = data.data.listData[0];
			ui.util.get("setPlanName").setValue(dat.planname);
			me.checkPlanName();
			baidu.g("planCreateTime").innerHTML = dat.createtime;
			if (dat.showprob == 1) {
				ui.util.get("planOpt").setChecked(true);
			}
			else 
				if (dat.showprob == 2) {
					ui.util.get("planSpell").setChecked(true);
				}
		}
	},
	
	
	/**
	 * 各种事件绑定
	 */
	onentercomplete : function(){
		var me = this;
		baidu.setStyle(
            baidu.g('ctrldialogplanSetDialog'), 'height', ''
        );
            
           
		//文字剩余字符提示
		var inp = ui.util.get("setPlanName").main;
		inp.onkeyup = inp.onkeydown = me.checkPlanName;	
		//切换tab
		me._controlMap.planSetTab.onselect = function(tab){
			if(+tab == 1){
				nirvana.util.openSubActionDialog({
					id: 'planSetDialog',
					title: '计划其他设置',
					width: 440,
					actionPath: 'manage/planIpExclusion',
					params: {
						planid:me.arg.planid
					},
					onclose: function(){
						er.controller.fireMain('reload', {});
					}
				});
			} else if (tab == 2) {
                nirvana.util.openSubActionDialog({
                    id: 'planSetDialog',
                    title: '计划其他设置',
                    width: 440,
                    actionPath: 'manage/planAdvancedSet',
                    params: {
                        planid: me.arg.planid
                    },
                    onclose: function(){
                        er.controller.fireMain('reload', {});
                    }
                });
            }
		}
		//确定提交
		ui.util.get("setPlanBaseOk").onclick = me.setBaseInfoOk();
		ui.util.get("setPlanBaseCancel").onclick = function(){me.onclose();}
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},


	/**
	 * 保存基本设置
	 */
	setBaseInfoOk:function(){
		var me = this;
		return function(){
			var param = {},
				planids = me.arg.planid,
				planname = ui.util.get("setPlanName").getValue(),
				showprob = ui.util.get("planOpt").getGroup().getValue();
			param.planid = planids;
			param.planname = planname;
			param.showprob = showprob;
			param.cprostat = 1;
			param.cproprice = "";
			param.onSuccess = function(data){
				var plannametip = baidu.g("setPlanBaseErrorTip"), 
					saveTip = baidu.g("saveTip"),
					modifyData = {},
					planid = planids[0];
				plannametip.innerHTML = "";
				saveTip.innerHTML = "保存成功";
				modifyData[planid] = {
					"planname": planname,
					"showprob": showprob,
					"cprostat": 1,
					"cproprice": ""
				};
				fbs.material.ModCache("planinfo","planid",modifyData);
				modifyData[planid] = {
					"planname": planname
				};
				fbs.material.ModCache("unitinfo","planid",modifyData);
				fbs.material.ModCache("ideainfo","planid",modifyData);
				fbs.material.ModCache("wordinfo","planid",modifyData);
				fbs.avatar.getMoniWords.ModCache("planid",modifyData);
				//ui.util.get('SideNav').refreshPlanList();
				ui.util.get('SideNav').refreshUnitList([planid]);
			};
			param.onFail = me.saveFailHandler();
			fbs.plan.modPlan(param);
		}
	},
	
	/**
	 * 保存失败处理
	 */
	saveFailHandler: function(){
		var me = this;
		return function(data){
			if (data.status != 500) {
				var error = fbs.util.fetchOneError(data), 
					plannametip = baidu.g("setPlanBaseErrorTip"), 
					errorcode;
				plannametip.innerHTML = "";
				for (var item in error) {
					errorcode = error[item].code;
					switch (errorcode) {
						case 400:
						case 498:
						case 499:
							plannametip.innerHTML = nirvana.config.ERROR.PLAN.NAME[errorcode];
							break;
						default:
							break;
					}
				}
			}else{
				ajaxFail(0);
			}
			
		}
	},
	
	/**
	 * 检查计划名称
	 */
	checkPlanName : function () {
		var inp = ui.util.get("setPlanName").main,
		    nameLen = getLengthCase(baidu.trim(inp.value));
	
		if (nameLen > PLAN_NAME_MAXLENGTH) {
			inp.maxLength = inp.value.length;
			inp.value = subStrCase(inp.value, PLAN_NAME_MAXLENGTH);
			nameLen = getLengthCase(baidu.trim(inp.value));
		} else {
	        inp.maxLength = inp.value.length + (PLAN_NAME_MAXLENGTH - nameLen);
		}
		baidu.g('setPlanNameNumTip').className = 'tipinfoinline';
		baidu.g("setPlanNameNumTip").innerHTML = "还能输入" + (PLAN_NAME_MAXLENGTH - nameLen ) + '个字符';
	}
}); 