/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    plan/modifyMPriceFactor.js
 * desc:    修改移动计划出价比
 * author:  yanlingling
 * date:    $Date: 2013/4/13 $
 */

manage.modifyMPriceFactor = new er.Action({
    
    VIEW: 'modifyMPriceFactor',
    
    IGNORE_STATE : true,

    UI_PROP_MAP: {
        /**
         *每个用户的出价比可调整的范围不一样，从后台获取 
         */
        'plan-iterator': {
            max: '*price_max',
            min: '*price_min',
            value:'*priceFactor'
        }
    },
    
    /**
     * 初始化UI
     * @param {Object} callback
     */
    CONTEXT_INITER_MAP : {
       
        /**
         *设置出价比可设置的范围 每个用户的出价比可调整的范围不一样，从后台获取 
         */
        setPlanIterator: function(callback) {
           this.setContext('price_max', nirvana.env.MPRICEFACTOR_RANGE.max.toFixed(2)); 
           this.setContext('price_min', nirvana.env.MPRICEFACTOR_RANGE.min.toFixed(2)); 
           this.setContext('priceFactor', this.arg.mPriceFactor); 
           callback();
        }
        
    },
    
    /**
     * 各种事件绑定
     */
    onentercomplete : function(){
        var me = this;
        //移动建站url
		baidu.array.each($$('.mobile_website'),function(item){
			baidu.setAttr(item,"href",MOBILE_STATION_PATH + nirvana.env.USER_ID);
		})
		baidu.g('mobilePrice').innerHTML = parseFloat(me.getContext('priceFactor')).toFixed(2);
        // Dialog二次定位标识
        nirvana.subaction.isDone = true;

        this.init();
    },
    
    onafterrender : function(){
        baidu.setStyle(baidu.g('mobile_website'), 'marginLeft', '60px');
    },

    init: function() {
        var me = this, dom = baidu.dom;
        // “保存成功”的提示
        var saveTip = baidu.g('saveTip');
        // “确定”按钮
        var okBtn = ui.util.get('setPlanAdvancedOk');
        // “取消”按钮
        var cancelBtn = ui.util.get('setPlanAdvancedCancel');
        
        // 请求必须的参数
        var planids = this.arg.planid;
       
        // 保存
        okBtn.onclick = onSubmit;
        cancelBtn.onclick = function() {
            me.onclose();
        };
        //设置出价比监听事件 
        ui.util.get('plan-iterator').onblur = manage.planLib.checkPriceFactor(['setPlanAdvancedOk']);
        ui.util.get('plan-iterator').onchange = manage.planLib.checkPriceFactor(['setPlanAdvancedOk']);
        
        
        function onSubmit() {
           
            // 请求参数
            param = {
                planid: planids
            };

            //var changedParams = getChangedParams();
            //值发生变化
            if (me.getContext('priceFactor') != parseNumber(ui.util.get('plan-iterator').getValue())) {
                me.setContext('priceFactor',parseNumber(ui.util.get('plan-iterator').getValue()));
                param.mPriceFactor = trim(ui.util.get('plan-iterator').getValue());
               
                param.onSuccess = function() {
                    // 重新设值，用于下次判断参数是否变化
                  
                    show(saveTip);
                    ui.util.get('plan-iterator').setValue(parseNumber(me.getContext('priceFactor')));
                     // 清除缓存，避免数据不同步
                    fbs.plan.getInfo.clearCache();
                    fbs.material.clearCache('planinfo');
                };
                fbs.plan.modDeviceAndPhoneNumber(param);
            }else{
            	ui.util.get('plan-iterator').setValue(parseNumber(me.getContext('priceFactor')));
                show(saveTip);
            }
           
        }
       function hide(el) {
            baidu.setStyle(el, 'visibility', 'hidden');
        }

        function show(el) {
            baidu.setStyle(el, 'visibility', 'visible');
        }
      
    }
    
   
   
    
   
});



