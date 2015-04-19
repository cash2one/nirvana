/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    account/account.js
 * desc:    账户部分
 * author:  tongyao
 * date:    $Date: 2011/1/11 $
 */


manage.accountBudget = new er.Action({
	
	VIEW: 'accountBudget',
	
	IGNORE_STATE : true,
	
	UI_PROP_MAP : {
		budgetInput : {
			type : 'TextInput',
			value : '*budgetValue',
			width : '200',
			height: '22'
		},
		
		noBudget : {
			type : 'CheckBox',
			datasource : '*noBudget',
			checked : 'true'
		}
		
	},
	
	CONTEXT_INITER_MAP : {
		
		accountBudget : function(callback){
			//获取账户预算，包括:
			//["wregion", "wbudget", "userstat"]
			var me = this;

			fbs.account.getWbudget({
				onSuccess: function(data){
					var data = data.data.listData[0],
						budget = data.wbudget,
						isNoBudget;
					
					if(budget > -1){
						isNoBudget = 0;
					} else {
						isNoBudget = 1;
					}
					
					//这里需要处理显示”未设定“ 
					me.setContext('budgetValue', budget);
					//Checkbox判断datasource值和input的value一致时自动选中
					me.setContext('noBudget', budget);
					callback();
				},
				onFail: function(data){
                    var status = data.status;
                    
                    ajaxFailDialog();
                    
                    callback();      
                }
			});

		}
		
	},
	
	onafterrender : function(){
		
	},
	
	onentercomplete : function(){
		var me = this;
		me._controlMap.submit.onclick = function(){
			//表单验证与数据提交之后
			
			var callback = function(){
				fbs.account.getInfo.clearCache();
				er.controller.fireMain('reload', {});
				me.onclose();
			}
			
			callback();
			
		};
		me._controlMap.cancel.onclick = function(){
			me.onclose();
		};
	},

	submitData : function(){
		
	}
}); 
