/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    unit/rename.js
 * desc:    单元重命名
 * author: 	zhouyu
 * date:    $Date: 2011/1/13 $
 */

/**
 * 单元重命名
 */
manage.unitRename = new er.Action({
	
	VIEW: 'setUnit',
	
	IGNORE_STATE : true,
	
	CONTEXT_INITER_MAP : {
		init : function(callback){
			var me = this;
			callback();
		}
		
	},
	
	/**
	 * 获取单元基本信息
	 */
	onafterrender : function(){
		var me = this;
		fbs.unit.getBasicInfo({
			condition:{
				unitid: me.arg.unitid
			},
			onSuccess: function(data){
				var dat = data.data.listData[0];
				ui.util.get("setUnitName").setValue(dat.unitname);
				var inp = ui.util.get("setUnitName").main;
				inp.onkeyup = inp.onkeydown = me.checkUnitName;	
				me.checkUnitName();
				baidu.g("unitCreateTime").innerHTML = dat.createtime;
			},
			onFail: function(){
				ajaxFailDialog();
			}
		});
		
	},
	
	/**
	 * 各种事件绑定
	 */
	onentercomplete : function(){
		var me = this;
		ui.util.get("setUnitOk").onclick = function(){
			var unitname = ui.util.get("setUnitName").getValue();
			fbs.unit.modUnitname({
				unitname:unitname,
				unitid:me.arg.unitid,
				onSuccess: function(data){
				//	fbs.unit.getInfo.clearCache();//清除cache
					var unitid = me.arg.unitid[0],
						modifyData = {};
					modifyData[unitid] = {
						"unitname":unitname
					};
					fbs.material.ModCache("unitinfo","unitid",modifyData);
					fbs.material.ModCache("ideainfo","unitid",modifyData);
					fbs.material.ModCache("wordinfo","unitid",modifyData);
					fbs.avatar.getMoniWords.ModCache("unitid",modifyData);
					er.controller.fireMain('reload', {});
					//ui.util.get('SideNav').refreshPlanList();
					ui.util.get('SideNav').refreshNodeInfo('unit',[unitid]);
					me.onclose();
				},
				onFail:me.saveFailHandler()
			});
		};
		ui.util.get("setUnitCancel").onclick = function(){
			me.onclose();
		};	
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},

	/**
	 * 保存失败处理
	 */
	saveFailHandler: function(){
		var me = this;
		return function(data){
			if (data.status != 500) {
				var error = fbs.util.fetchOneError(data), 
					unitname = baidu.g("createUnitErrorTip"), 
					errorcode;
				unitname.innerHTML = "";
				for (var item in error) {
					errorcode = error[item].code;
					switch (errorcode) {
						case 500:
						case 501:
						case 502:
							unitname.innerHTML = nirvana.config.ERROR.UNIT.NAME[errorcode];
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
	checkUnitName : function () {
		var inp = ui.util.get("setUnitName").main,
		    nameLen = getLengthCase(baidu.trim(inp.value));
	
		if (nameLen > UNIT_NAME_MAXLENGTH) {
			inp.maxLength = inp.value.length;
			inp.value = subStrCase(inp.value, UNIT_NAME_MAXLENGTH);
			nameLen = getLengthCase(baidu.trim(inp.value));
		} else {
	        inp.maxLength = inp.value.length + (UNIT_NAME_MAXLENGTH - nameLen);
		}
		baidu.g('setUnitNameNumTip').className = 'tipinfoinline';
		baidu.g("setUnitNameNumTip").innerHTML = "还能输入" + (UNIT_NAME_MAXLENGTH - nameLen ) + '个字符';
	}

}); 