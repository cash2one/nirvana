/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    manage/region.js
 * desc:    地域
 * author: 	zhouyu
 * date:    $Date: 2011/1/13 $
 * param: {function(array)} arg.onMod(option) 修改账户地域时的回调，option为带入的参数，主要用于监控   mayue@baidu.com
 */

/**
 * 设置账户推广地域或者计划推广地域
 */
manage.region = new er.Action({
	
	VIEW: 'planRegion',
	
	IGNORE_STATE : true,
	
	/**
	 * 初始化ui
	 * @param {Object} callback
	 */
	CONTEXT_INITER_MAP : {
	
	/**
	 * 使用账户地域or使用计划地域
	 * @param {Object} callback
	 */
		getPlanRegion: function(callback){
			var me = this,
				type = me.arg.type;
			if(type=="plan" || !nirvana.env.AUTH.region){
				//获取账户层级地域
				fbs.account.getWregion({
					onSuccess: function(data){
						var acctRegion = data.data.listData[0].wregion,
							acctRegion = acctRegion == "" ? [] : acctRegion.split(','),
							abregion = nirvana.manage.region.abbRegion(acctRegion,"account");//账户地域列表
						me.setContext("acctRegionList",acctRegion);
						me.setContext("acctRegionData",abregion.title);
						callback();
					},
					onFail: function(data){
						ajaxFailDialog();
						callback();
					}
				});
			}else{
				callback();
			}
		},
	
        /**
         * 使用全部地域or部分地域
         * @param {Object} callback
         */	
		getAcctRegion: function(callback) {
            var me = this,
                type = me.arg.type,
                wregion = me.arg.wregion;

            if (!wregion) {
                fbs.account.getWregion({
                    onSuccess: function(json) {
                        var acctRegion = json.data.listData[0].wregion;
				    	wregion = acctRegion === '' ? [] : acctRegion.split(',');//账户地域列表  
                        
                        ajaxCallback();
                    },
                    onFail: function() {
                        wregion = me.getAllRegion();
                        
                        ajaxCallback();
                    }
                });
            } else {
                ajaxCallback();
            }
            
            // 设置已勾选的地域，因为可能有异步需要，所以写成一个函数
            function ajaxCallback() {
                if (wregion.length == 0) {
                    if (type == "plan") {
                        var accregion = me.getContext("acctRegionList");
                        accregion = (!accregion || accregion.length == 0) ? 
                                            me.getAllRegion() : 
                                            accregion;
                        me.setContext("checked", accregion);
                    } else {
                        me.setContext("checked", me.getAllRegion());
                    }
                } else {
                    me.setContext("checked", wregion);
                }
                callback();
            }
		},
		
		queryRegion: function(callback){
			var me = this,
				type = me.arg.type;
			if (type == "plan") {
				me.setContext("queryReginTip", "为该计划开启搜索意图定位功能");
				me.setContext("queryReginBubble", "搜索意图定位")
				me.setContext("checkedValue", 0);
			}else{
				me.setContext("queryReginTip", "启用搜索意图定位功能");
				me.setContext("queryReginBubble", "搜索意图定位功能")
				me.setContext("checkedValue", 2);
			}
			callback();
		}
	},
	
	/**
	 * 显示全部地域or部分地域
	 */
	onentercomplete : function(){
		var me = this,
			iniRegion = me.getContext("checked");
		
		baidu.removeClass('setQueryRegion1', 'hide');
		ui.Bubble.init("QueryReginBubble");
		me.getAcctQueryRegion();
		
		if(!nirvana.env.AUTH.region){
			baidu.removeClass('DenyAreaNotice', 'hide');
			me.showAcctRegion();
			baidu.g("planRegionSwitch").style.display = "none";
			return;
		}
			
		if(me.arg.type == "plan"){
			var wregion = me.arg.wregion;//计划地域列表
			if (wregion.length == 0) {
				me.showAcctRegion();
			}
			else {
				me.showPlanRegion();
			}
		}else{
			baidu.g("planRegionSwitch").style.display = "none";
			baidu.g("acctRegionList").style.display = "none";
		}
		
		if(me.allChecked(iniRegion)){
			me.checkAllRegion();
		}else{
			me.checkPartRegion();
		}
	},
	
	/**
	 * 绑定事件
	 */
	onafterrender : function(){
		var me = this,
			controlMap = me._controlMap,
			type = me.arg.type;
			
		if(type == "plan"){
			baidu.g("useAcctRegion").onclick = function(){
				me.showAcctRegion();
			};
			baidu.g("usePlanRegion").onclick = function(){
				me.showPlanRegion();
			};
		}	
		
		controlMap.allRegion.onclick = function(){
			me.checkAllRegion();
		};
		controlMap.partRegion.onclick = function(){
			me.checkPartRegion();
		};
		controlMap.regionOk.onclick = me.saveData();
		controlMap.regionCancel.onclick = function(){
			me.onclose();
		};
		
		controlMap.runQueryRegion.onclick = function(){
			var checked = this.getChecked(),
				value = checked ? (type == "plan" ? 0 : 2) : 1;
				
			this.setValue(value);
		};
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 获取账户搜索意图定位设置
	 */
	getAcctQueryRegion: function(){
		var me = this;
		fbs.account.getQrstat1({
			nocache:true,
			onSuccess: function(response){
				me.setAcctQueryRegion(response);
			},
			onFail: function(response){
				ajaxFailDialog();
			}
		});
	},
	
	
	/**
	 * 设置账户搜索意图定位
	 * @param {Object} data
	 */
	setAcctQueryRegion: function(data){
		var me = this,
			type = me.arg.type,
			stat = +data.data.listData[0].qrstat1,
			checked = stat == 1 ? false : true;
		if(type == "plan"){
			fbs.plan.getQrstat1({
				condition: {
					planid: me.arg.planid
				},
				nocache:true,
				onSuccess: function(response){
					me.setPlanQueryRegion(response, checked);
				},
				onFail: function(response){
					ajaxFailDialog();
				}
			});
		}else{
			ui.util.get("runQueryRegion").setValue(stat);
			ui.util.get("runQueryRegion").setChecked(checked);
		}
	},
	
	/**
	 * 设置计划搜索意图定位设置
	 * @param {Object} data
	 * @param {Object} acctQueryStat
	 */
	setPlanQueryRegion: function(data, acctQueryStat){
		var me = this,
			stat = +data.data.listData[0].qrstat1,
			checked;
		checked = stat == 1 ? false : true;
		ui.util.get("runQueryRegion").setValue(stat);
		ui.util.get("runQueryRegion").setChecked(checked);
		if(!acctQueryStat){
			ui.util.get("runQueryRegion").disable(true);
			baidu.g("AcctQueryClose").innerHTML = "全账户关闭";
		}
	},
	
	/**
	 * 切换到使用账户推广地域
	 */
	showAcctRegion: function(){
		var me = this;
		var planReg = baidu.g("usePlanRegion"),
			acctReg = baidu.g("useAcctRegion");
		me.setContext("useAcct",true);
		if(!baidu.dom.hasClass(acctReg,"current_region")){
			baidu.addClass(acctReg,"current_region");
		}
		if(baidu.dom.hasClass(planReg,"current_region")){
			baidu.removeClass(planReg,"current_region");
		}
		
		baidu.g("planRegionset").style.display = "none";
		baidu.g("acctRegionList").style.display = "block";
	},
	
	/**
	 * 切换到使用计划推广地域
	 */
	showPlanRegion: function(){
		var me = this,
			planReg = baidu.g("usePlanRegion"),
			acctReg = baidu.g("useAcctRegion");
		me.setContext("useAcct",false);
		if(!baidu.dom.hasClass(planReg,"current_region")){
			baidu.addClass(planReg,"current_region");
		}
		if(baidu.dom.hasClass(acctReg,"current_region")){
			baidu.removeClass(acctReg,"current_region");
		}
		baidu.g("acctRegionList").style.display = "none";
		baidu.g("planRegionset").style.display = "block";
	},
	
	
	/**
	 * 判断是否全部地域
	 * @param {Object} checkedList
	 */
	allChecked: function(checkedList){
		var chinaAll = nirvana.manage.region.ChinaAllSelectCheck(checkedList),
			abroadAll = nirvana.manage.region.AbroadAllSelectCheck(checkedList);
			
		if (chinaAll && abroadAll) {
			return true;
		}
	},
	
	/**
	 * 全部地域列表
	 */
	getAllRegion:function(){
		return [1,2,3,4,5,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37];
	},
	
	/**
	 * 选择全部地域
	 */
	checkAllRegion: function(){
		var me = this,
			controlMap = me._controlMap,
			list = controlMap.regionBody.main;;
		controlMap.allRegion.setChecked(true);
		list.style.display = "none";
	},
	
	/**
	 * 选择部分地域
	 */
	checkPartRegion: function(){
		var me = this,
			controlMap = me._controlMap,
			list = controlMap.regionBody.main;;
		controlMap.partRegion.setChecked(true);
		list.style.display = "block";
	},
	
	/**
	 * 点击确定，保存数据
	 */
	saveData: function(){
		var me = this;
		return function(){
			var type = me.arg.type;
			
			switch (type) {
				case "account":
					me.modAcctRegion();
					break;
				case "plan":
					me.modPlanRegion();
					break;
			}
		};
	},
	
	/**
	 * 保存账户地域
	 */
	modAcctRegion:function(){
		var me = this, chosenRegion = [],
			controlMap = me._controlMap;
		if (controlMap.allRegion.getChecked()) {
			chosenRegion = [];
		}
		else {
			chosenRegion = controlMap.regionBody.getCheckedRegion();
		}
        
        //监控回调  mayue@baidu.com
        if (me.arg.onMod) {
            var logOption = {};
            logOption.chosenRegion = chosenRegion.join(',');
            me.arg.onMod(logOption);
        }
        
	//	console.log(ui.util.get("runQueryRegion").getValue());
		fbs.account.modRegion({
			wregion: chosenRegion,
			qrstat1: ui.util.get("runQueryRegion").getValue(),
			onSuccess: function(data){
				fbs.account.getInfo.clearCache();//清除cache
                if (typeof me.arg.onok === 'function') {
                    me.arg.onok(chosenRegion);
                } else {
				    er.controller.fireMain('reload', {});
                }
				me.onclose();
			},
			onFail: function(data){
				ajaxFail(0);
			}
		});
	},
	
	
	/**
	 * 保存计划地域
	 */
    modPlanRegion: function(){
        var me = this, 
			chosenRegion = [], 
			controlMap = me._controlMap,
			planids = me.arg.planid;
        if (me.getContext("useAcct")) {
            chosenRegion = [];
        }
        else {
            if (controlMap.allRegion.getChecked()) {
                chosenRegion = me.getAllRegion();
            }
            else {
                chosenRegion = controlMap.regionBody.getCheckedRegion();
				if(chosenRegion.length == 0){
					chosenRegion = me.getAllRegion();
				}
            }
        }
		var rqr = ui.util.get("runQueryRegion").getValue();
        fbs.plan.modRegion({
            wregion: chosenRegion,
            planid: planids,
			qrstat1: rqr,
            onSuccess: function(data){
        //        fbs.plan.getInfo.clearCache();//清除cache
        //        fbs.material.clearCache("planinfo");
				var modifyData = {};
				for (var i = 0, l = planids.length; i < l; i++) {
					modifyData[planids[i]] = {
						"wregion": chosenRegion.join(','),
						"qrstat1":rqr
					};
				}
				fbs.material.ModCache("planinfo", "planid", modifyData);
                er.controller.fireMain('reload', {});
                me.onclose();
            },
            onFail: function(data){
                ajaxFail(0);
            }
        });
    }

}); 
