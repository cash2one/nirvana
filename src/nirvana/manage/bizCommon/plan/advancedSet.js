/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    plan/advancedSet.js
 * desc:    计划高级设置
 * author:  zhujialu
 * date:    $Date: 2012/2/28 $
 */

/**
 * 计划高级设置
 */
manage.planAdvancedSet = new er.Action({
    
    VIEW: 'setPlanAdvanced',
    
    IGNORE_STATE : true,

    UI_PROP_MAP: {
        planSetTab: {
            title: '*planSetTab',
            tab: '2'
        }
    },
    /**
     * 初始化UI
     * @param {Object} callback
     */
    CONTEXT_INITER_MAP : {
        init: function(callback){
        	this.setContext('planSetTab', ['基本设置', '计划IP排除', '高级设置']);
            callback();
        }
        
    },
    
    /**
     * 各种事件绑定
     */
    onentercomplete : function(){
        var me = this;
        
        ui.util.get('planSetTab').onselect = function(tab) {
            if (tab == 0) {
                nirvana.util.openSubActionDialog({
                    id: 'planSetDialog',
                    title: '计划其他设置',
                    width: 440,
                    actionPath: 'manage/planBaseSet',
                    params: {
                        planid: me.arg.planid
                    },
                    onclose: function() {
                        er.controller.fireMain('reload', {});
                    }
                });
            } else if (tab == 1) {
                nirvana.util.openSubActionDialog({
                    id: 'planSetDialog',
                    title: '计划其他设置',
                    width: 440,
                    actionPath: 'manage/planIpExclusion',
                    params: {
                        planid: me.arg.planid
                    },
                    onclose: function(){
                        er.controller.fireMain('reload', {});
                    }
                });
            }
        };
        
        //移动建站url
		baidu.array.each($$('.mobile_website'),function(item){
			baidu.setAttr(item,"href",MOBILE_STATION_PATH + nirvana.env.USER_ID);
		})
		
        // Dialog二次定位标识
       // nirvana.subaction.isDone = true;

        this.init();
    },
    
    init: function() {
        var me = this, dom = baidu.dom;
       
        // 移动设备的字面量    
        var planDevice = baidu.g('planDevice'),
       
        // 推广电话输入框
        phoneNumInput = baidu.g('phoneNumber'),
        // 电话审核失败提示
        reviewFail = baidu.g('reviewFail'),
        
        // “保存成功”的提示
        saveTip = baidu.g('saveTip'),
        // “确定”按钮
        okBtn = ui.util.get('setPlanAdvancedOk'),
        // “取消”按钮
        cancelBtn = ui.util.get('setPlanAdvancedCancel');
        
        // 请求必须的参数
        var planids = this.arg.planid;
        
        // -------------- 逻辑使用的数据项 -------------
        
        // 确定选哪个设备，默认选择“全部设备”
        var  device = 0,
        // 确定推广电话
        phoneNumber = '',
        // 是否通过审核
        phoneState = true;
        
        var fields =  ['deviceprefer', 'phonenum', 'devicecfgstat']   
        fields.push('bridgeStat');
        fields.push('bridgeEnable');
        fields.push('bridgeError');
        
        
        fbs.material.getAttribute('planinfo', fields, {
            condition: {
                planid: planids
            },
            onSuccess: function(json) {
                if (json.data && json.data.listData) {
                    var plan = json.data.listData[0];
                    device = plan.deviceprefer;

                    if (baidu.lang.isObject(plan.phonenum)) {
                        phoneNumber = plan.phonenum.phonenum || '';
                        phoneState = plan.phonenum.phonestat;
                    } else {
                        // 这里是用户没设置推广电话的情况
                        phoneNumber = '';
                        phoneState = 0;
                    }
                }
                planDevice.innerHTML = DEVICE_CHAR_CONFIG[device];
                // 无线整合添加的方法
                me.setShow(plan);
                
               
                initEvent();
                fbs.material.clearCache('planinfo');
            },
            onFail: function() {
                initUI();
                fbs.material.clearCache('planinfo');
            }
        });

       

        function initEvent() {
           
            // 保存
            okBtn.onclick = onSubmit;
            cancelBtn.onclick = function() {
                me.onclose();
            };
           
        }
        

        
        function onSubmit() {
            // 没有变化不需要发请求
            var isChanged = false,
            // 请求参数
            param = {
                planid: planids
            };

            var changedParams = getChangedParams();
            
            if (changedParams.phone || changedParams.bridgeNum) {
                var num = changedParams.bridgeNum 
                    ? trim(baidu.g('phoneNumberBridge').value)
                    : trim(phoneNumInput.value), 
                    ret;
                if (num.length > 0) {
                    // 全角转半角
                    num = baidu.string.toHalfWidth(num);
                    ret = me.validatePhoneNumber(num);
                }
                // 前端验证失败
                if (ret && !ret.isSuccess) {
                    hide(saveTip);
                    // 显示错误提示
                    reviewFail.innerHTML = ret.info;
                    baidu.g('planBridgeTip').innerHTML = ret.info;
                    
                    changedParams.bridgeNum 
                    ? show(baidu.g('planBridgeTip')) : show(reviewFail);
                    return;
                }
                changedParams.bridgeNum 
                    ? hide(baidu.g('planBridgeTip')) : hide(reviewFail);
                // 验证通过
                param.phonenum = num;
                me.setContext('bridgeNum', num);
                isChanged = true;
            }
           
            
           
            if (changedParams.isUse) {
                param.bridgeStat = baidu.g('bridgeCheckbox').checked ? 1 : 0;
                me.setContext('isUse', param.bridgeStat);
                isChanged = true;
            }
            // 到这里，表示没有错误了
            hide(reviewFail);
            
            if (!isChanged) {
               
                show(saveTip);
            } 
            else {
                param.onSuccess = function() {
                    // 重新设值，用于下次判断参数是否变化
                    
                    var num = param.items.phonenum;
                    if (num || num === '') {
                        phoneNumber = num;
                    }
                    show(saveTip);
                    
                    

                    // 清除缓存，避免数据不同步
                    fbs.plan.getInfo.clearCache();
                    fbs.material.clearCache('planinfo');
                    fbs.material.clearCache('ideainfo');
                    fbs.material.clearCache('wordinfo');
                    fbs.avatar.getMoniWords.clearCache();
                };
				
                fbs.plan.modDeviceAndPhoneNumber(param);
            }
        }

        // 获得更改过的参数，如果没有参数被修改，不会发送请求
        function getChangedParams() {
            // 判读设备是否更改
            var phoneField, ret = {};
            
            phoneField = trim(phoneNumInput.value);
            
           
            
            // 商桥中的电话
            if (me.getContext('bridgeNum') != trim(baidu.g('phoneNumberBridge').value)
            ) {
                ret.bridgeNum = true;
            }
            
            // 商桥启用
            if (me.getContext('isUse') != baidu.g('bridgeCheckbox').checked
            ) {
                ret.isUse = true;
            }
            return ret;
        }

        function hide(el) {
            baidu.setStyle(el, 'visibility', 'hidden');
        }

        function show(el) {
            baidu.setStyle(el, 'visibility', 'visible');
        }
        
      
    },
    /**
     * @param {string} num 电话号码
     */
    validatePhoneNumber: function(num) {
        // 话术
        var LEN_ERROR = '推广电话长度不符。可填写数字个数为5-15位，总字符数为5-19位。允许的实例：400-800-8888',
            ILLEGAL_CHAR = '推广电话含有特殊字符。只可包含数字、“-”、“+”。其中“+”仅允许在第一位，“-”不可写在开头结尾也不可连续写两个及以上。允许的实例：400-800-8888';
        
        num = num || '';
        
        var ret = {isSuccess: false};
        // -------------- 检测长度 --------------------

        // 1. 检测长度
        var len = num.length;
        if (len < 5 || len > 19) {
            ret.info = LEN_ERROR;
            return ret;
        }
        
        // 2. 检测去掉 + - 的长度
        var str = num.replace(/[-+]/g, '');
        len = str.length;
        if (len < 5 || len > 15) {
            ret.info = LEN_ERROR;
            return ret;
        }

        // -------------- 检测非法字符 ----------------

        // 3. 数字或+开头，数字结尾，+只能在第一位，-不可连续
        if (/^[+\d]([-\d]+)\d$/.test(num)) {
            if (!(/-{2,}/.test(RegExp.$1))) {
                // 走到这里表示格式正确
                ret.isSuccess = true;
                return ret;
            }
        }

        ret.info = ILLEGAL_CHAR;
        return ret;
    },
    
    /**
     * 设置商桥的显示逻辑
     * 
     * @param {Obeject} data 向后台拿到的高级设置的数据 
     */
    setShow : function(data) {
        var me = this;
        var phoneNumber = '';
        var phoneState = 0;
        
        
             // 显示商桥
            me.setBridgeShow(data.deviceprefer);
            // 设置页面的大小
            //me.setDialogHeight();
            // 隐藏老电话
            baidu.hide(baidu.g('oldPhone'));
            
            if (baidu.lang.isObject(data.phonenum)) {
                phoneNumber = data.phonenum.phonenum || '';
                phoneState = data.phonenum.phonestat;
            }
            baidu.g('phoneNumberBridge').value = phoneNumber;
           
            
            if ( data.bridgeEnable == -1 ){//商桥服务异常
                baidu.addClass(baidu.g('bridgeTips'),'hide'); 
                baidu.addClass(baidu.g('bridgeCheckOpt'),'hide'); 
                if ( data.bridgeStat == 1 ) {//设置勾选的状态，不然在保存的时候有可能认为是修改了
                    baidu.setAttr(
                    baidu.g('bridgeCheckbox'), 'checked', 'checked'
                    );
                }
                else{
                    baidu.g('bridgeCheckbox').removeAttribute('checked');
                }
                baidu.removeClass(baidu.g('bridgeErrorTips'),'hide');  
                 
            }
            else{
                if ( data.bridgeStat == 1 ) {//勾选的时候，看商桥是否实际可用
                baidu.setAttr(
                    baidu.g('bridgeCheckbox'), 'checked', 'checked'
                );
                baidu.addClass(baidu.g('bridgeTips'),'hide'); 
                baidu.removeClass(baidu.g('bridgeCheckOpt'),'hide'); 
                if(data.bridgeEnable == 0){//不可用的时候给出话术提示，提示后端给
                    baidu.g('bridgeUnableTip').innerHTML = data.bridgeError;
                    baidu.removeClass(baidu.g('bridgeUnableTip'),'hide');  
                }
               }
               else {
                baidu.g('bridgeCheckbox').removeAttribute('checked');
                if(data.bridgeEnable == 0){//商桥不可用，跟以前一样 ，给出话术提示
                   baidu.addClass(baidu.g('bridgeCheckOpt'),'hide'); 
                   baidu.removeClass(baidu.g('bridgeTips'),'hide'); 
                }
                else{
                   baidu.addClass(baidu.g('bridgeTips'),'hide'); 
                   baidu.removeClass(baidu.g('bridgeCheckOpt'),'hide');  
                }
              }
            }
            
            me.setContext('bridgeNum', phoneNumber);
            me.setContext('bridgeNumStat', phoneState);
            me.setContext('isUse', data.bridgeStat);
       
        
        
        baidu.setAttr(baidu.g('bridgeUrl'), 'href', MOBILE_BRIDGE_PATH);
    },
    
    
    /**
     * 设置商桥的显示隐藏 
     * 
     * @param {string} 投放设备的类型
     */
    setBridgeShow : function(value) {
        var me = this;
        
        if (value == 1) {
            baidu.hide(baidu.g('planBridge'));
        }
        else {
            baidu.show(baidu.g('planBridge'));
        }
    }
    
    /**
     * 设置浮出层的高度 
     */
    /*setDialogHeight : function() {
        return;
        baidu.setStyle(
            baidu.g('ctrldialogplanSetDialog'), 'height', 'auto'
        );
        baidu.setStyle(
            baidu.g('setPlanAdvanced'), 'height', 'auto'
        );
        baidu.setStyle(
            $$('#setPlanAdvanced .ui_dialog_foot')[0], 'position', 'relative'
        )
    }
    */
});

