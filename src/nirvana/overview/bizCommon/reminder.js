/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    overview/manage.js
 * desc:    提醒部分
 * author:  chenjincai
 * date:    $Date: 2011/01/06 $
 */
overview.reminder= new er.Action({
    VIEW: 'overviewReminder',
    /**
     * init context
     */
    CONTEXT_INITER_MAP : {
        /**
         * 提醒信息默认值
         */
        ruleInfo : function (callback) {
            //默认是关键词
            this.setContext('targetType', 3);
            //默认三种提醒方式全部勾选
            this.setContext('remindWay', [1,2,4]);
            callback();
        },
        /**
         * 提醒列表部分
         */
        ruleList : function (callback) {
           var data = []; 
           var me = this;
           fbs.remind.getRule({
               onSuccess: function (json) {
                   data = json.data.listData;
                   
                   var i = 0, len = data.length, ruleListDataHtml = [], item, itemHtml, 
                        itemTip = {content:'', tipClass: 'ui_list_del', isDel: true};
                    
                    for(; i < len; i++){
                        item = data[i];
                        var title = me.getRuleTitle(item);
                        var shortTitle = autoEllipseText(title, 650);
                        
                        if (item.targetType == 7) {//如果是创意
                            title = title.replace('\<u\>','').replace('\<\/u\>','');
                            shortTitle = baidu.decodeHTML(shortTitle);
                                            
                        }
                        
                        itemHtml = ui.format('<a extraId="{0}" href="" onclick="return false;" title="{1}" >{2}</a>', item.ruleid, escapeQuote(title), shortTitle)
                        ruleListDataHtml.push({classname:'ui_list_txt', html: itemHtml, tip: itemTip, autoState: true}); 
                    }
                    me.setContext('ruleListData', data);
                    me.setContext('ruleListDataHtml', ruleListDataHtml); 
                    me.setContext('remindRuleNumber',len);
                    me.setContext('beforeDeleteRule', me.beforeDeleteRule);
                    me.setContext('ondeleteRule', me.ondeleteRule);
                    callback();
                   
               },
               onFail : function (json){
                   callback();
               }
           });
            
            
            
        },

        
        /**
         *
         * 已选择列表
         */
        selectedList : function (callback) {
            var data = [];
            
            this.setContext('selectedListData', data); 
            this.setContext('selectedObjNum',data.length);
            this.setContext('beforeDeleteRule', this.beforeDeleteRule);
            this.setContext('ondeleteRule', this.ondeleteRule);
            this.setContext('onSelectedDelete', this.onSelectedDeleteHandler())
            callback();
        },
        /**
         * tab文字
         */
        tabTitleList : function (callback) {
            this.setContext('reminderTabTitleList',['新建提醒规则','提醒规则管理']);
            this.setContext('remindRuleTabConfig', this.reminderTabConfig);
            
            this.setContext('reminderRuleTabIndex',this.arg.type == 'manage'? 1 : 0)
            callback();
        },
        /**
         * 物料选择器
         */
        materialSelect : function (callback) {
            var me = this;
            this.setContext('materialSelectType', ['user','plan']);
            this.setContext('addObjHandler', me.getAddObjHandler());
            this.setContext('materialSelectTableOptions', {width:305, height:175});
            callback();
        }
    },
    onSelectedDeleteHandler : function () {
        var me = this;
        return function (objId) {
            var materialSelectList = me._controlMap.materialSelectList;
            materialSelectList.recover(objId);

            baidu.hide('targetValueErrorMsg');
        }  
    },
    getAddObjHandler : function () {
        var me = this;
        return function (item){
            var selectedList = me._controlMap.selectedList;
            var datasource = selectedList.datasource;
			
			if (ui.util.get('remindTypeIdea').getGroup().getValue() == 7) { // 创意层级
				item.isIdea = true;
				// 创意的name是已经处理好的，这里不需要处理，控件里直接显示
			} else {
				item.name = baidu.decodeHTML(item.name);
			}
			
            datasource.push(item);
            if(datasource.length >= 5){
                baidu.g('targetValueErrorMsg').innerHTML = '每次不可选择超过5个对象';
                baidu.show('targetValueErrorMsg');
                if(datasource.length > 5){
                    datasource.pop();
                    return false;
                }
            }else {
                baidu.hide('targetValueErrorMsg');
                
            }
            selectedList.render(selectedList.main);
            
        }
    },
    getRuleTitle : function (ruleData) {

        var me = this,
            selectedListData = ruleData.targetValue ? ruleData.targetValue : [] ,     
            i = 0, len = selectedListData.length, 
            targetValueArr = [], remindContentStr = '';

        remindContentStr = overview.remindRuleValueInfo.remindContent[ruleData.remindContent];
        
        

        for(i = 0, len = selectedListData.length; i < len; i++){
            targetValueArr.push(selectedListData[i].name);
        }
        var targetValueHTML = targetValueArr.join('，');
        if(ruleData.targetType == 2 && ruleData.remindContent == 1){//如果是推广账户层级
            remindContentStr += ruleData.customValue.paysum + '元';     
        }
        if (ruleData.targetType == 7) {//如果是创意
            targetValueHTML = IDEA_RENDER.wildcard(targetValueHTML);
                            
        }

        return targetValueHTML + ' ' + remindContentStr;
    },
    
    
    onentercomplete : function () {
        var me = this,
            controlMap = me._controlMap,
            type = me.arg.type;//新建or修改提醒规则
            
        controlMap.reminderRuleTab.onselect  = me.getRuleTabHandler();
        
        controlMap.selectedList.onaddclick = me.getOnAddObjHandler();
        
        controlMap.remindWay1.readOnly(true);
        
        //init reminder type Tab        
        this.initReminderTab();

        //make Unit Radio box disabled
        controlMap.remindTypeUnit.disable(true);
        
        if(me.getContext('ruleListData').length >= 50){
            baidu.g('ruleListErrorMsg').innerHTMl = '提醒规则已达上限50条';
            baidu.show('ruleListErrorMsg');
        }
        
        //选择正确的TAB
        var reminderRuleTabIndex = this.arg.type == 'manage'? 1 : 0;
        controlMap.reminderRuleTab.select(reminderRuleTabIndex);
        if(reminderRuleTabIndex == 1){
            baidu.addClass('reminderRuleForm','hide');
            
        }
        
        
        //给管理列表挂载修改/删除事件
        controlMap.ruleList.main.onclick = me.getRuleManager();//获取列表管理处理函数

    },

    getOnAddObjHandler : function () {
        var me = this,
            controlMap = me._controlMap,
            materialSelectList = controlMap.materialSelectList;
        
        return function () {
            me.renderMaterialSelectList();
            materialSelectList.main.style.left = 0;
            materialSelectList.main.style.top = 0;
            
            
            
        }
        
    },

    getRuleTabHandler : function () {
        var me = this;
        return function (tab) {
            if(tab != 0){
                return;
            }
            //如果是新建提醒TAB
            var ruleData = {
                targetType:3,
                targetValue: [],
                remindContent: 0,
                remindWay: [1]
            }
            me.setRuleContext(ruleData);
            me.repaintForm();
            me.initReminderTab();
            baidu.g('selectedObjNum').innerHTML = 0;
            
            
        };
        
    },
    

    initReminderTab : function () {
        var me = this;
        
        
        var typeTab = new ui.util.create('FormTab', {
            id: 'reminderTypeTab',
            datasource : me.reminderTypeTabConfig,
            value: 'remindTypeAccount'
        });
        
        typeTab.init();
        typeTab.onselect = me.getTypeTabHandler();
    },

    reminderTabConfig : [
        'reminderRuleForm',
        'reminderRuleList'
    ],
    
    reminderTypeTabConfig : [
        {label: 'remindTypeAccount', content: 'remindTypeAccountC'},
        {label: 'remindTypePlan', content: 'remindTypePlanC'}, 
        {label: 'remindTypeKeyWord', content: 'remindTypeKeyWordC'}, 
        {label: 'remindTypeIdea', content: 'remindTypeIdeaC'}
    ],
    
    getTypeTabHandler : function () {
        var me = this,
            controlMap = me._controlMap,
            materialSelectList = controlMap.materialSelectList;
        return function (tab) {
            var label = tab.label;
            //debugger;
            switch (label) {
                case 'remindTypeAccount':
                    controlMap.accountRuleContent0.setChecked(true);
                    controlMap.selectedList.datasource = [{id:nirvana.env.USER_ID, name:nirvana.env.USER_NAME}];
                    controlMap.selectedList.autoState = false;
                    me.hideAllErrorMsg();
                    me.renderMaterialSelectList('account');
                    break;
                case 'remindTypePlan':
                    controlMap.planRuleContent0.setChecked(true);
                    controlMap.selectedList.datasource.length = 0;
                    controlMap.selectedList.autoState = true;
                    me.hideAllErrorMsg();
                    me.renderMaterialSelectList('plan');
                    break;
                case 'remindTypeKeyWord':
                    controlMap.keyWordRuleContent3.setChecked(true);
                    controlMap.selectedList.datasource.length = 0;
                    controlMap.selectedList.autoState = true;
                    me.hideAllErrorMsg();
                    me.renderMaterialSelectList('keyword');
                    break;
                case 'remindTypeIdea':
                    controlMap.IdeaRuleContent3.setChecked(true);
                    controlMap.selectedList.datasource.length = 0;
                    controlMap.selectedList.autoState = true;
                    me.hideAllErrorMsg();
                    me.renderMaterialSelectList('idea');
                    break;
                
            }
            materialSelectList.addWords = [];
            controlMap.selectedList.render(controlMap.selectedList.main);
            me.changeToAccout(label == 'remindTypeAccount');
        }
    },
    
    renderMaterialSelectList : function (type) {
        var me = this,
            controlMap = me._controlMap,
            materialSelectList = controlMap.materialSelectList;
        
        me.setMaterialSelectContext(type)

        materialSelectList.render(materialSelectList.main);
        
    },
    
    setMaterialSelectContext : function (type, typeValue) {
        var me = this,
            controlMap = me._controlMap,
            materialSelectList = controlMap.materialSelectList;
        if(!type){
            var typeValue = typeValue || controlMap.remindTypeAccount.getGroup().getValue();
            switch(typeValue) {
                case 2:
                    type = 'account';
                    break;
                case 3:
                    type = 'plan';
                    break;
                case 11: 
                    type = 'keyword';
                    break
                case 7:
                    type = 'idea';
                    break;
            }
            
        }
        switch (type) {
            case  'account':
                me.setContext('materialSelectType', ['user']);
                materialSelectList.setLevel(me.getContext('materialSelectType'));
                break;
            case 'plan': 
                me.setContext('materialSelectType', ['user','plan']);
                materialSelectList.setLevel(me.getContext('materialSelectType'));
                break;
            case 'unit': 
                me.setContext('materialSelectType', ['user','plan','unit']);
                materialSelectList.setLevel(me.getContext('materialSelectType'));
                break;
            case 'keyword': 
                me.setContext('materialSelectType', ['user','plan','unit', 'keyword']);
                materialSelectList.setLevel(me.getContext('materialSelectType'));
                break;
            case 'idea': 
                me.setContext('materialSelectType', ['user','plan','unit', 'idea']);
                materialSelectList.setLevel(me.getContext('materialSelectType'));
                break;
        }
    },
    
    beforeDeleteRule : function () {
        return window.confirm('你确定要删除这条提醒规则吗？');
    },
    
    ondeleteRule : function (lineEl) {
  
        var me = this,
            link = lineEl.getElementsByTagName('a')[0],
            ruleId = link.getAttribute('extraid'),
            title = '删除提醒',
            msg = '你确定删除这条提醒规则吗?';
        ui.Dialog.confirm({
            title: title,
            content: msg,
            onok: function () {
                me.deleteRule(ruleId, function () {
                    baidu.dom.remove(lineEl);
                    var numEl = baidu.g('reminderRuleNumber')
                    numEl.innerHTML = numEl.innerHTML - 1;
                    
                });
                fbs.remind.getRule.clearCache();
            }
        
        });   
        
    },
    
    modifyReminderRule : function (ruleId) {
        return false;
    },

    isModify : function () {
        var me = this,
            reminderRuleTab = me._controlMap.reminderRuleTab,
            formWrapper = baidu.g('reminderRuleForm');
            
        return (reminderRuleTab.tab == 1) && (formWrapper.className != 'hide');
            
    },

    getSubmitHandler : function (submitButton) {
        var me = this;
        return function(){
            me.validateAndSubmit(submitButton);
        };
    },
    /**
     * 验证并提交参数
     * @param {Object} submitButton   提交按钮,用来在提交的时候把按钮disable掉,防止重复提交
     * 
     */
    validateAndSubmit : function (submitButton, dialog, finishedDialog, finishedDialogHandler) {
        var me = this,
            parentDialog = dialog,        
            paramObj = {wremindRule: me.getObjectByForm()};
        
        me.parentDialog = parentDialog; 
        me.parentFinishedDialog = finishedDialog;
        me.parentFinishedDialogHandler = finishedDialogHandler;
        //hide all errors
        me.hideAllErrorMsg();
        //commented by chenjincai 
        //if(submitButton){
        //    submitButton.disable(true);
        //}
        if(paramObj.wremindRule.remindContent == 1){
            paramObj.wremindRule.customValue  = {
                paysum : paramObj.wremindRule.paysum
            }
            
        }
        delete paramObj.wremindRule.paysum;
        if(paramObj.wremindRule.targetType == 2){
            paramObj.wremindRule.targetValue = [];
        }
        paramObj.onSuccess = function (data) {
            //处理提交成功
            me.onsubmitfinished(data);
        };
        paramObj.onFail = function (data) {
            //显示错误信息
            me.displayErrorMsg(data);
            //submitButton.disable(false);
        };
        if(me.isModify()){
            paramObj.wremindRule['ruleid'] = me.getRuleId();
            me.paramObj = paramObj.wremindRule;
            fbs.remind.modRule(paramObj);
        }else{
            me.paramObj = paramObj.wremindRule;
            fbs.remind.addRule(paramObj);
        }
    },
    
    onsubmitfinished : function (data) {

        var me = this;
        if(data.status == 200){
            me.parentFinishedDialog.ruleData = me.paramObj;
            me.parentFinishedDialog.selectedListData = me.getContext('selectedListData');
            me.parentFinishedDialog.isModify  = me.isModify();
            me.parentFinishedDialogHandler();
            me.parentDialog.hide();
        }
    },
    
    getRuleManager : function () {
        var me = this,
            controlMap = me._controlMap,
            ruleList = controlMap.ruleList;
        return function (event) {
            var e = event || window.event,
                el = e.srcElement || e.target;
            while (el.id !== ruleList.main.id) {
                if (el.className === "ui_list_del") {
                    var listItem = el.parentNode,
                        link = listItem.getElementsByTagName('a')[0],
                        ruleId = link.getAttribute('extraid');
                        
                        me.ondeleteRule(listItem);
                   
                    break;
                } else if (el.getAttribute('extraid')) {
                    me.showRuleForm(el.getAttribute('extraid'));
                    break;
                } else {
                    el = el.parentNode;
                }
            }

        };
    },
    
    deleteRule: function (ruleId,callback) {
        fbs.remind.delRule({
            ruleids : [ruleId],
            onSuccess : function () {
                callback();
                return true;
            },
            onFail : function () {
                //删除失败，提示
                baidu.g('ruleListErrorMsg').innerHTML = '删除失败，请重试。';
                baidu.show('ruleListErrorMsg');
                return false;
            }
        });
    },
    
    showRuleForm : function (ruleId) {
        var me = this,
            ruleListData = me.getContext('ruleListData'),
            len = ruleListData.length, i = 0, ruleData,
            materialSelectList = me._controlMap.materialSelectList,
            selectedList = me._controlMap.selectedList;
        
        for(; i < len; i ++ ){
            var item = ruleListData[i];
            if (item.ruleid == ruleId) {
                ruleData = item
            }
        }
        if(ruleData){
            me.setRuleContext(ruleData);
            //重置已选词
            materialSelectList.addWords = ruleData.targetValue;
            
            //账户的时候，禁用列表onmouseover状态切换
            if(ruleData.targetType == 2){
                selectedList.autoState = false;
            }else {
                selectedList.autoState = true;
            }
            
            baidu.removeClass('reminderRuleForm','hide');

            me.repaintForm();
            
            me.initReminderTab();
            
            me.changeToAccout(ruleData.targetType == 2);
            
            if(ruleData.targetType == 2 && ruleData.remindContent == 0){
                me._controlMap.accountRuleContent0.setChecked(true);
            }
            
            if(ruleData.targetType == 2 && ruleData.remindContent == 1){
                me._controlMap.accountRuleContent1.setChecked(true);
                me._controlMap.paysumLimitation.setValue(ruleData.customValue.paysum);
            }
            if(ruleData.targetType == 11 && ruleData.remindContent == 3){
                me._controlMap.keyWordRuleContent3.setChecked(true);
            }
            //enable button
            var reminderOkBtn = ui.util.get('reminderOK');
            //if (reminderOkBtn) {
            //    reminderOkBtn.disable(true);
            //}
            
        }
    },
    
    changeToAccout : function (account) {
        var me = this,
            materialSelectList = me._controlMap.materialSelectList,
            selectedList = me._controlMap.selectedList;
        if(account){
            baidu.hide('materialSelectWrapper');
            selectedList.disableAddLink(true)
        }else{
            baidu.show('materialSelectWrapper');
            selectedList.disableAddLink(false)
        }
    },
    
    setRuleContext : function (ruleData) {
        
        var me = this;
        me.setContext('ruleId', ruleData.ruleid);
        me.setContext('targetType', ruleData.targetType);
        me.setMaterialSelectContext(undefined ,ruleData.targetType);
        if(ruleData.targetType == 2){
            me.setContext('selectedListData', [{id:nirvana.env.USER_ID, name:nirvana.env.USER_NAME}]);
        }else{
            if(ruleData.targetType == 7){
                var values = ruleData.targetValue,
                    len = values.length;
                for(var i = 0; i < len; ++i) {
                    values[i].name  = baidu.decodeHTML(IDEA_RENDER.wildcard(values[i].name));
                    values[i].isIdea = true;
                }
            }
            //console.log(ruleData.targetValue);
            me.setContext('selectedListData', ruleData.targetValue? ruleData.targetValue : []);//FIX 接口数据为NULL
        }
        
        me.setContext('remindContent', ruleData.remindContent);
        me.setContext('remindWay', ruleData.remindWay);
        if(ruleData.remindContent == 1){
            me.setContext('paysum', ruleData.customValue.paysum)
        }
        
        
        
    },
    /**
     * 获取ruleId
     */
    getRuleId : function () {
        var me = this,
            ruleId = me.getContext('ruleId');
        
        return  ruleId? ruleId : 0;
    },
    
    displayErrorMsg : function (data) {
        
        if(data.status != 400){//如果没有错误
            //隐藏所有错误提示消息
            
        }

        var errorMap = fbs.util.fetchOneError(data);
        if(!errorMap){
            var errorMap = data.errorCode;
        }
        //规则条数到达最大值
        if(errorMap.code == 1101){
            baidu.show('ruleMaxLimitationError');
        }else{
            baidu.hide('ruleMaxLimitationError');
        }
        
        //当日消费提醒只能定制一个
        if(errorMap.code == 1102 || errorMap.paysum == 1160 || errorMap.paysum == 1161   ){
            var msg = '';
            if(errorMap.code == 1102){
                msg = '当日消费提醒只能定制一个。';
            }else if (errorMap.paysum == 1160){
                msg = '当日消费请填写数字。';
            }else if (errorMap.paysum == 1161){
                msg = '当日消费请填写大于0的数字。';
            } 
                    
            baidu.g('paysumErrorMsg').innerHTML = msg;
            baidu.show('paysumErrorMsg');
        }else{
            baidu.hide('paysumErrorMsg');
        }
        
        //提醒方式
        if(errorMap.remindWay == 1151){
            baidu.show('remindWayErrorMsg');
        }else{
            baidu.hide('remindWayErrorMsg');
        }
        
        if(errorMap.targetValue == 1150){
            baidu.g('targetValueErrorMsg').innerHTML = '选定对象列表不能为空。';
            baidu.show('targetValueErrorMsg');
        }else{
            baidu.hide('targetValueErrorMsg');
        }
        
    },
    
    hideAllErrorMsg : function (){
        baidu.hide('ruleMaxLimitationError');
        baidu.hide('paysumErrorMsg');
        baidu.hide('remindWayErrorMsg');
        baidu.hide('targetValueErrorMsg');
    }
});
