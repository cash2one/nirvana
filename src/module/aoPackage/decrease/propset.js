/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: accountOptimizer/decrease/propset.js 
 * desc: 设置效果突降的阈值
 * author: LeoWang(wangkemiao@baidu.com)
 * date: $Date: 2012/12/16 $
 */

/**
 * 设置效果突降的阈值 
 */
ToolsModule.setPropForAoDecr = new er.Action({
	VIEW : 'setPropForAoDecr',
	
    defaultType : nirvana.config.DECREASE.DEFAULT_TYPE,
    defaultValue : nirvana.config.DECREASE.DEFAULT_VALUE,
    
    allowedType : ['shows', 'clks'],
    
	UI_PROP_MAP : {
		// 阈值
		decrshowsValue : {
			width: '30',
			height: '20',
			value: '*showsTextBoxValue'
		},
		decrclksValue : {
			width: '30',
			height: '20',
			value: '*clksTextBoxValue'
		}/*,
		decrpvValue : {
			width: '30',
			height: '20',
			value: '*pvTextBoxValue'
		}*/
	},
	
	CONTEXT_INITER_MAP : {
		init : function(callback){
			var me = this;
			// 获取突降类型和阈值
			fbs.aodecr.getCustom({
				onSuccess: function(response){
					var data = response.data,
						type = data.type,
						value = data.value;
					
					// 处理类型和阈值
					if(baidu.array.indexOf(me.allowedType, type) == -1){
						type = me.defaultType;
						value = me.defaultValue;
					}
					else{
						value = value || me.defaultValue;
					}
					
					// 保存突降类型和阈值
					me.setContext('decrType', type);
					me.setContext('decrValue', value);
					switch(type){
						case 'shows':
							me.setContext('showsTextBoxValue', value);
                            me.setContext('clksTextBoxValue', me.defaultValue);
                            //me.setContext('pvTextBoxValue', me.defaultValue);
							break;
						case 'clks':
							me.setContext('clksTextBoxValue', value);
                            me.setContext('showsTextBoxValue', me.defaultValue);
                            //me.setContext('pvTextBoxValue', me.defaultValue);
							break;
						/*
						case 'pv':
							me.setContext('pvTextBoxValue', value);
                            me.setContext('showsTextBoxValue', me.defaultValue);
                            me.setContext('clksTextBoxValue', me.defaultValue);
							break;
						*/
						default:
							me.setContext('clksTextBoxValue', me.defaultValue);
                            me.setContext('showsTextBoxValue', me.defaultValue);
                            //me.setContext('pvTextBoxValue', me.defaultValue);
					}
					
					callback();
				},
				onFail: function(response){
					ajaxFailDialog();
					callback();
				}
			});
		}
	},
		

	/**
	 * refresh后执行
	 */
	onafterrepaint : function() {
	},

	/**
	 * 第一次render后执行后最后会触发事件
	 */
	onafterrender : function() {
		var me = this,
			controlMap = me._controlMap,
			decrType = me.getContext('decrType');
		/*
		switch (decrType) {
			case "shows":
				controlMap.setDecrTypeShows.setChecked(true);
				controlMap.decrclksValue.disable(true);
				//controlMap.decrpvValue.disable(true);
				break;
			case "clks":
				controlMap.setDecrTypeClks.setChecked(true);
				controlMap.decrshowsValue.disable(true);
				//controlMap.decrpvValue.disable(true);
				break;
			/*
			case "pv":
				controlMap.setDecrTypePv.setChecked(true);
				controlMap.decrshowsValue.disable(true);
				controlMap.decrshowsValue.disable(true);
				break;
			* /
		}
		*/
		me.changeType(decrType)();
		
		// 默认关闭时不需要刷新，这里不使用setContext，因为从自定义打开设置时，传入的action没有needRefresh
		me.needRefresh = me.arg.needRefresh || 0;
		me.type = me.arg.type || '';
		
		controlMap.setDecrTypeShows.onclick = me.changeType("shows");
		controlMap.setDecrTypeClks.onclick = me.changeType("clks");
		//controlMap.setDecrTypePv.onclick = me.changeType("pv");
		controlMap.decrThresholdOK.onclick = me.modDecrTypeOK();
		controlMap.decrThresholdClose.onclick = me.modDecrTypeClose();
		controlMap.decrshowsValue.onchange = me.changeValue();
		controlMap.decrclksValue.onchange = me.changeValue();
		//controlMap.decrpvValue.onchange = me.changeValue();
		
	},

	/**
	 * 完成视图更新后最后会触发事件
	 */
	onentercomplete : function() {

	},
	
	//改变设置类型
	changeType: function(type){
		var me = this,
			controlMap = me._controlMap;
		return function(){
			switch (type) {
				case "shows":
					controlMap.setDecrTypeShows.setChecked(true);
                    controlMap.decrshowsValue.disable(false);
					controlMap.decrclksValue.disable(true);
					//controlMap.decrpvValue.disable(true);
					break;
				case "clks":
				default:
					controlMap.setDecrTypeClks.setChecked(true);
                    controlMap.decrclksValue.disable(false);
					controlMap.decrshowsValue.disable(true);
					//controlMap.decrpvValue.disable(true);
					break;
				/*
				case "pv":
					controlMap.setDecrTypePv.setChecked(true);
                    controlMap.decrpvValue.disable(false);
					controlMap.decrshowsValue.disable(true);
					controlMap.decrshowsValue.disable(true);
					break;
				*/
			}
			me.setContext('newDecrType', type);
		};
	},
	
	//修改阈值
	modDecrTypeOK: function(){
		var me = this,
			controlMap = me._controlMap;
		
		return function(){
			var newtype = me.getContext('newDecrType'),
				newvalue,
				oldtype = me.getContext('decrType'),
				oldvalue = me.getContext('decrValue');
//				logParam = {};//用于监控 del by huiyao 2013.1.7
				
			switch (newtype) {
				case "shows":
					newvalue = baidu.trim(controlMap.decrshowsValue.getValue());
					break;
				case "clks":
					newvalue = baidu.trim(controlMap.decrclksValue.getValue());
					break;
				/*
				case "pv":
					newvalue = baidu.trim(controlMap.decrpvValue.getValue());
					break;
				*/
			}
			
			fbs.aodecr.modCustom({
				type : newtype,
				value : newvalue,
				onSuccess: function(res){
					var tip = baidu.g("TipArea"),
						level = me.getContext('level');
			//		fbs.ao.getCustom.clearCache();
			
					//清除Flash折线缓存
//					fbs.aodecr.getFlashData.clearCache();// del by Huiyao 2013.1.7
					
					
					tip.innerHTML = "阈值设置成功！";
					baidu.removeClass(tip, 'hide');
					
					me.setContext('hasSaved', true);
					ui.Popup.isModed = true;
					
					// 理论上这里不需要了，因为效果突降已经下线了
					// 为了安全，还是先增加个判断
					// 如果没有再出问题，后续版本去除
					// by Leo Wang(wangkemiao@baidu.com) 2012-12-12
					if(nirvana.aoControl){
						if (level === nirvana.aoControl.getNowControl().params.level) { // 如果修改阈值与当前level相同，则关闭时需要refresh
							me.needRefresh = 1;
						}
					}
					/* del by Huiyao 2013.1.7 这个参数没用到
					logParam.new_type = newtype;
					logParam.new_value = newvalue;
					logParam.old_type = oldtype;
					logParam.old_value = oldvalue;*/
					
					// if (nirvana.env.EXP == '7450') { // 对照组下线
					// 	nirvana.decrWidgetAction.logCenter('decr_set_save', logParam);
					// }
					// else{
    					//进入设置页面的时候把入口设为了默认参数带入，此处发完了就要清除掉它
    					nirvana.aoPkgControl.logCenter.extend({
                            oldtype : oldtype,
                            newtype : newtype,
                            oldvalue : oldvalue,
                            newvalue : newvalue
                        })
                            .sendAs('nikon_decrconfig_save')
                            .delKeyFromDefault('entrancetype');
                    // } // 对照组下线
					
				},
				onFail: me.saveFailHandler()
			});
			
			/*
			nirvana.aoWidgetAction.logCenter('ao_custom_save', {
				level : me.getContext('level'),
				value : threshold
			});
			*/
		};
	},

	/**
	 * 保存失败
	 */
	saveFailHandler: function(){
		var me = this;
		return function(data){
			if (data.status != 500) {
				var error = fbs.util.fetchOneError(data), 
					tip = baidu.g("TipArea"), 
					errorcode;
				
				tip.innerHTML = '';
				baidu.addClass(tip, 'hide');
				
				for (var item in error) {
					errorcode = error[item].code;
					switch (errorcode) {
						case 6003:
						case 6004:
						case 6005:
						case 6006:
						case 6007:
						case 6008:
                        case 6099:
							tip.innerHTML = nirvana.aoPkgConfig.AODECR.ERROR[errorcode];
							baidu.removeClass(tip, 'hide');
							break;
					}
				}
			}else{
				ajaxFail(0);
			}
			
		};
	},
	
	//修改阈值后提示
	changeValue: function(){
		return function(){
			baidu.g("TipArea").innerHTML = "您已经进行了修改，点击保存后修改才能生效";
		};
	},
	
	
	//关闭窗口
	modDecrTypeClose: function(){
		var me = this;
		
		return function() {
			
			me.onclose();
		};
	}

});


function setPropForAoDecr(me, type){
	var param = {};
	//if('undefined' != typeof type && type != 'popup'){
	if (me && me.needRefresh) {
		param.needRefresh = 1;
	}
    param.type = type;
	//}
	
	/*del by Huiyao 2013.1.7 没用的变量
	var targetPos,
		pos, left, top;*/
	/*
	if(type != 'popup'){
		targetPos = "PropSet";
		pos = baidu.dom.getPosition(baidu.g(targetPos));
		left = pos.left + 30;
		top = pos.top;
	}
	*/
	
	// 刷新突降包
    function resetPackage(){
        var appName = nirvana.aoPkgConfig.KEYMAP[1]; //效果突降包名
        var app = nirvana.aoPkgControl.packageData.get(appName);
        if(app){
            fbs.aodecr.getUser({
                onSuccess: function(response){
                    if(response.data.isdecr == 1){
                        //说明是突降用户，那么继续判断
                        //app.renderAppAllInfo();
                        app.renderAppDialog();
                    }
                    else{
                        // app.renderBasicInfo();
        
                        // 渲染Flash数据区
                        app.renderDataArea();
                        
                        //app.showEmptyOptimizer();
                        //console.log(app)
                        app.optimizerCtrl.showNoOptimizer();
                        
                        // 事件绑定
                        // app._bindHandlers();
                    }
                }, 
                onFail: new Function()
            });
        }
    }
	
	var options = {
		id: 'propset',
		title: '阈值设置',
		width: 450,
		//left: left,
		//top: top,
		maskLevel: 6,
		unresize: "false",
		actionPath: '/tools/proposal/setPropForAoDecr',
		params: param,
		onclose: function(){
			if(ui.Popup.isModed === true){
				
				if(ui.Popup.getView() != 'init' && ui.Popup.getView() != 'close'){
					ui.Popup.rebuild();
				}
				
				if(type == 'popup'){
					er.controller.fireMain('reload', {});
				}
				else if(type == 'package'){
				    // 刷新包
                    if(ui.Popup.isModed){
                        resetPackage();
                    }
				}
				else {
					//nirvana.decrControl.action.refresh();
					//me.refresh();
				}
			}
		}
	};
	/*
	if(type != 'popup'){
		options['left'] = left;
		options['top'] = top;
	}
	*/
	//打开浮出框
	nirvana.util.openSubActionDialog(options);
	
	
}
