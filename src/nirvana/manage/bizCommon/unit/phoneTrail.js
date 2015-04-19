/**
 * @author yangji01
 */

manage.runPhoneTrail = new er.Action({
	VIEW : 'runPhoneTrail',
	
	IGNORE_STATE : true,
	
	UI_PROP_MAP : {
		phoneTrailList :{
			type : 'List',
			skin:'ptlist',
			content : '*unitChosen'
		}
	},
	
	CONTEXT_INITER_MAP : {
		unitList : function(callback){
			var me = this;
			
			me.setContext('unitList',me.arg.unitList)
				
			me.fillList();
			callback();
		}
	},
	
	onafterrender : function(){
		var me = this;
		baidu.setStyle(baidu.g('ctrldialogrunPhoneTrailDialog'),'top','65px');
		me.fillNum();
		me._controlMap.phoneTrailList.ondelete = me.deleteUnitHandler();
	},
	
	onentercomplete : function(){
		var me = this,
			controlMap = me._controlMap;
		baidu.q('trans_trail_tool')[0].onclick = me.openTransTool();
		controlMap.setDialogOk.onclick = me.runPhoneTrail();
		controlMap.setDialogCancel.onclick = function(){
			me.onclose();
		};
	},
	
	fillNum : function(){
		var me = this,
			unitList = me.getContext('unitList'),
			unitNum = unitList.length,
			phoneTrailedNum = 0,
			phoneTrailNum;
			
		for(var i = 0; i < unitNum ; i++){
			if(unitList[i].extbind && unitList[i].extbind != '-'){
				phoneTrailedNum++;
			}
		};
		phoneTrailNum = unitNum - phoneTrailedNum;
		
		baidu.g('unitNum').innerHTML = unitNum;
		baidu.g('phoneTrailedNum').innerHTML = phoneTrailedNum;
		baidu.g('phoneTrailNum').innerHTML = phoneTrailNum;
	},
	
	fillList : function(){
		var me = this,
			unitData = me.getContext('unitList'),
			orderList = me.orderList(unitData),
			cont = me.editList(orderList);
		
		me.setContext('unitChosen',cont);
	},
	
	orderList : function(data){
		var tempList = [],
			len = data.length,
			i;
		
		//已跟踪
		for(i = 0; i < len ; i++){
			if(data[i].extbind && data[i].extbind != '-'){
				tempList[tempList.length] = data[i];
			}
		}
		//未跟踪
		for(i = 0; i < len ; i++){
			if(!data[i].extbind || data[i].extbind == '-'){
				tempList[tempList.length] = data[i];
			}
		}
		return tempList;
	},
	
	editList : function(data){
		var tempList = [],
			len = data.length,
			me = this;
		
		for(var i = 0; i < len ; i++){
			if(data[i].extbind && data[i].extbind != '-'){
				tempList[tempList.length] = {
					classname: "trailed_unit",
					html: me.getContentHtml(data[i]),
					key: "id",
					value: data[i].unitid,
					tip: {
						content: "已跟踪("+data[i].extbind+')',
						tipClass: "pt_added",
						isDel: false
					},
					autoState: false
				}
			}else{
				tempList[tempList.length] = {
					classname: "trail_unit",
					html: me.getContentHtml(data[i]),
					key: "id",
					value: data[i].unitid,
					tip: {
						content: "取消",
						tipClass: "pt_cancel",
						isDel: true
					},
					autoState: true
				}
			}
		}
		return tempList;
	},
	
	getContentHtml : function(item){
		var title = baidu.encodeHTML(item.unitname),
			content = getCutString(item.unitname,30,'..');
			
		return '<span class="pt_info" title="' + title + '">' + content + '</span>';
	},
	
	runPhoneTrail : function(){
		var me = this,
			controlMap = me._controlMap;
			
		return function(){
			var value = controlMap.phoneTrailList.getValue('id'),
				unitList = me.getContext('unitList'),
				len = unitList.length;
			
			baidu.array.remove(value,function(item){
				for(var i = 0;i < len ; i++)
					if(item == unitList[i].unitid && unitList[i].extbind && unitList[i].extbind != '-')
						return true;
				return false;
			})
			
			if(value.length == 0){
				me.onclose();
				return;
			}
			fbs.trans.lxbBindUnit({
				unitid : value,
				onSuccess : me.successHandler(),
				onFail : me.failHandler
			})
		}
	},
	
	successHandler : function(){
		var me = this;
		return function(data){
			var data = data.data, 
			len = data.length, 
			modifyData = {},
			logParams = {};
			
			for (var i = 0; i < len; i++) {
				modifyData[data[i].unitid] = {
					extbind: data[i].extbind
				}
			}
			fbs.material.ModCache('unitinfo', "unitid", modifyData);
			er.controller.fireMain('reload', {});
			me.onclose();
			
			logParams.runPhoneTrailData = data;
			logParams.target = 'RunPhoneTrail';
			NIRVANA_LOG.send(logParams);
		}
	},
	
	failHandler : function(data){
		if(data.status == 500){
			baidu.g('error_area').innerHTML = '启用电话追踪失败，请您过一段时间后再尝试';
		}else if(data.status == 400 && data.errorCode.code == 1562){
			baidu.g('error_area').innerHTML = '启用电话追踪失败，无可用400分机号用于跟踪推广单元';
		}else{
			ajaxFailDialog();
		}
		
	},
	
	deleteUnitHandler : function(){
		var me = this;
		
		return function(target){
			var unitList = me.getContext('unitList');
			
			baidu.array.remove(unitList,function(item){
				return item.unitid == target.id;
			})
			me.setContext('unitList',unitList);
			me.fillNum();
		}
	},
	
	openTransTool : function(){
		var me = this;
		return function(){
			me.onclose();
			nirvana.trans.openTool();
		}
	}
});


//取消电话追踪
manage.cancelPhoneTrail = new er.Action({
	VIEW : 'cancelPhoneTrail',
	
	onentercomplete : function(){
		var me = this,
			controlMap = me._controlMap;
			
		controlMap.setDialogOk.onclick = me.cancelTrail();
		controlMap.setDialogCancel.onclick = function(){
			me.onclose();
		};
	},
	
	cancelTrail : function(){
		var me = this;
		return function(){
			fbs.trans.lxbUnbindUnit({
				unitid : me.arg.unitList,
				onSuccess : me.successHandler(),
				onFail : me.failHandler
			})
		}
	},
	successHandler : function(){
		var me = this;
		return function(){
			var modifyData = {},
				unitList = me.arg.unitList,
				len = unitList.length,
				logParams = {};
			
			for (var i = 0; i < len; i++) {
				modifyData[unitList[i]] = {
					extbind: '-'
				}
			}
			fbs.material.ModCache('unitinfo', "unitid", modifyData);
			er.controller.fireMain('reload', {});
			me.onclose();
			
			logParams.cancelPhoneTrailUnitList = unitList;
			logParams.target = 'CancelPhoneTrail';
			NIRVANA_LOG.send(logParams);
		}
	},
	
	failHandler : function(){
		baidu.g('error_area').innerHTML = '取消电话追踪失败，请您过一段时间后再尝试';
	}
})
