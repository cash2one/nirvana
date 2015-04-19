nirvana.quickSetupLib = nirvana.quickSetupLib || {};
nirvana.quickSetupLib.step2 = {
    
    stepTpl : 'newQuickSetupStep2',
    renderTarget : 'QuickSetupStep2',
    
    /**
     * 必须的检查函数，用于在渲染当前大步骤及子步骤（如果有）之前进行检查前置条件是否满足
     */
    preConditionCheck : function(action){
        var me = action,
            taskstatus = nirvana.quickSetupLib.getParam('taskstatus') || 0,
            step1Word = me.getContext('step1Word');
        // 检查上一步提交之后的关键词结果集
        if(taskstatus == 0){
            if(!step1Word){
                return false;
            }
        }
        else{
            if(taskstatus != 1 && taskstatus != 6 && taskstatus != 101){
                return false;
            }
        }
        
        return true;
    },
    
    /**
     * 当前步骤在render之前进行的前置处理行为
     */
    preProcess : function(action){
        var me = action,
            step = 2,  //这里理应就是2
            taskstatus = nirvana.quickSetupLib.getParam('taskstatus');
        
        //me.setContext('step', 2);
        me.setContext('taskstatus', taskstatus);
        
        if(taskstatus == 101){
            nirvana.quickSetupControl.goStep(me, 3);
        }

        /**
         * 当前浮出层右上角X重新绑定逻辑
         */
        var dialog = ui.util.get('QuickSetup');
        dialog && (dialog.getClose().onclick = function(){
            if(taskstatus == 0){
                ui.Dialog.confirm({
                    title: '离开' + nirvana.quickSetupLib.getActionTitle() + '流程',
                    content: "如果离开，系统将不会记录你刚刚所选择的关键词。<br />是否仍然选择离开？",
                    onok: function(){
                        if (nirvana.quickSetupLib.step2.quickKR) {
                            nirvana.quickSetupLib.step2.quickKR.dispose();
                        }
                        nirvana.quicksetup.hide();
                    }
                });
            }
            else{
                nirvana.quicksetup.hide();
            }
        });
        
    },
    
    render : function(action){
        var me = action,
            lib = this,
            target = baidu.g(nirvana.quickSetupLib.targetId),
            taskstatus;
        
        //先进行前置检查
        if(!this.preConditionCheck(me)){
            ui.Dialog.alert({
                title: '错误',
                content: '请从正确途径执行！',
                onok: function(){
                }
            });
            me.onclose && me.onclose();
            return false;
        }
        
        //执行步骤的特定前置处理
        lib.preProcess(me);
        
        //根据taskstatus状态，区分处理
        /**
         * 1: 开始生成方案
         * 2：推广方案成功
         * 6：推广方案生成失败
         */
        taskstatus = me.getContext('taskstatus') || 0;
        switch(taskstatus){
            case 0:
                //渲染处理
                lib.quickKR = new nirvana.SKR(baidu.g('quickSetupKR'), {
                    tpl: 'quickkr',
                    region: nirvana.quickSetupLib.getParam('wregion'),
                    resultOptions : {
                        activeColumns: (nirvana.quickSetupLib.getParam('type') == "useracct") ? ['word', 'pv'] : ['word', 'pv', 'kwc']
                    },
                    onafteraddall: function(words) {
                        nirvana.quickSetupLogger('quicksetup_newstep2_addall', {
                            num: words ? words.length : 'fail'
                        });
                    },
                    onaftersearch: function(query) {
                    	nirvana.quickSetupLogger('quicksetup_newstep2_search', {
                            query: query
                        });
                    },
                    onaftergetsmart: function(seeds) {
                    	nirvana.quickSetupLogger('quicksetup_newstep2_getsmart', {
                            seeds: seeds.join(',')
                        });
                    },
                    onafterwordboxchange: function(textline) {
                        var saveBtn = ui.util.get('stepButton');
                        if (fc.trim(textline.value())) {
                            saveBtn.disable(false);
                        } else {
                            saveBtn.disable(true);
                        }
                    }
                });
                //设置带入及默认显示
                var step1Word = me.getContext('step1Word');
                lib.quickKR.search.value(step1Word);
                lib.quickKR.search.searchInput.setVirtualValue(me.getContext('step1TextVirtual'));
                lib.quickKR.getWords(step1Word);
                break;
            case 1:
                lib.showRuningStatus(me);
                break;
            case 6:
                lib.showFailedStatus(me);
                break;
        }
        
        //初始化ui控件
        var uiList = ui.util.init(target);
        for(var o in uiList){
            me._controlMap[o] = uiList[o];
        }

        this.bindHandlers(me);
    },
    
    /**
     * 绑定监听事件
     */
    bindHandlers : function(action){
        var me = action,
            controlMap = me._controlMap,
            taskstatus = me.getContext('taskstatus'),
            stepLib = nirvana.quickSetupLib.step2,
            dataList = [],
            i;
        
        if(controlMap.stepButton){
            controlMap.stepButton.disable(true);
            controlMap.stepButton.onclick = function(){
                controlMap.stepButton.disable(true);
                
                /**
                 * 监控，第二步生成方案
                 */
                nirvana.quickSetupLogger('quicksetup_step2_submit');
                
                // 提交任务之前，整理数据
                dataList = stepLib.quickKR.addWords.get();
                // 提交任务，进入等待页面
                fbs.eos.submittask({
                    recmwords : dataList,
                    //wregion : me.getContext('wregion'),
                    wregion : nirvana.quickSetupLib.getParam('wregion'),
                    tasktype : nirvana.quickSetupLib.getParam('type'),
                    onSuccess: function(response){
                        nirvana.quickSetupLib.setParam('taskstatus', 1);
                        nirvana.quickSetupControl.goStep(me, 2);
                        stepLib.quickKR.dispose();
                    },
                    onFail: function(data){
                        controlMap.stepButton.disable(false);
                        if (!data.errorCode && data.status != 300) { // 没有errorCode，则代表status = 500/600...，系统异常
                            ajaxFailDialog();
                            return;
                        }

                        /**
                         * status=300 部分成功 部分失败，单独处理
                         */
                        if(data.status == 300){
                            return;
                        }
                        
                        var error = data.errorCode;
                        switch(error.code){
                            case 6015:
                                ajaxFailDialog();
                                break;
                            case 6014:
                                ui.Dialog.alert({
                                    title: '生成方案失败',
                                    content: '对不起，今天发起方案生成的次数已达到上限。'
                                });
                                break;
                            case 6017:
                                baidu.g('QuickSetupErrorMsg').innerHTML = nirvana.config.ERROR.EOS[error.code];
                                break;
                            case 6018:
                                ui.Dialog.alert({
                                    title: '提交失败',
                                    content: '提交失败，不允许重复提交方案！',
                                    onok: function(){
                                    }
                                });
                                break;
                            default:
                                ajaxFailDialog();
                                break;
                        }
                    }
                });
                
            }
        }
        
        if(controlMap.goBackButton){
            controlMap.goBackButton.onclick = function(){
                controlMap.goBackButton.disable(true);
                //将重新开始
                fbs.eos.taskfailed({
                    type : nirvana.quickSetupLib.getParam('type'),
                    step : 1,
                    onSuccess : function(response){
                        //重置了任务状态之后，需要进行更新任务状态
                        //更新taskstatus信息，然后转向
                        //这里不采取读后台的方式，因为有可能有主从同步的问题（尽管很罕见）
                        //而是直接认为任务状态被置为0，表示重新开始，如果关闭的话，在打开时，会去重新请求任务状态
                        nirvana.quickSetupLib.setParam('taskstatus', 0);
                        //清空缓存
                        //nirvana.quickSetupLib.cache.clearStepInfo();
                        //直接转至第一步
                        nirvana.quickSetupControl.goStep(me, 1);
                        
                    },
                    onFail : function(data){
                        controlMap.goBackButton.disable(false);
                        ajaxFailDialog();
                    }
                });
            }           
        }
        
        //taskstatus = 1状态下，需要执行一个轮询监听，来监测是否需要跳转
        if(taskstatus == 1){
            nirvana.quickSetupLib.interval = setTimeout(this.listenAndRefresh(me), 5000);
        }
    },
    
    listenAndRefresh : function(action){
        var me = action,
            lib = this;
        return function(){
            nirvana.quickSetupLib.getTaskStatus(
                function(value){
                    nirvana.quickSetupLib.setParam('taskstatus', value);
                    me.setContext('taskstatus', value);
                    if(value == 6){
                        //转向
                        nirvana.quickSetupLib.interval = null;
                        nirvana.quickSetupControl.goStep(me, 2);
                    }
                    else if(value == 2){
                        nirvana.quickSetupLib.interval = null;
                        nirvana.quickSetupControl.goStep(me, 3);
                    }
                    else if(value == 1){
                        //轮询
                        nirvana.quickSetupLib.interval = setTimeout(lib.listenAndRefresh(me), 5000);
                    }
                    else{
                        //停止，系统异常，转向
                        nirvana.quickSetupLib.interval = null;
                        nirvana.quickSetupControl.goStep(me, 2);
                    }
                }
            );
        };
    },
    
    showRuningStatus : function(action){
        var me = action,
            taskstatus = me.getContext('taskstatus'),
            tpl, target = baidu.g(this.renderTarget),
            type = nirvana.quickSetupLib.getTypeName(),
            html;
        if(taskstatus == 1){
            tpl = er.template.get('quickSetupTaskRunning');
            if(target){
                target.innerHTML = tpl;
                baidu.g('QuickSetupTaskRunningTitle').innerHTML = nirvana.config.EOS.STEP2.RUNNING.TITLE;
                baidu.g('QuickSetupTaskRunningContent').innerHTML = nirvana.config.EOS.STEP2.RUNNING.CONTENT;
                baidu.g('QuickSetupTaskRunningImage').src = 'asset/img/loading_eos.jpg';
            }
        }
        nirvana.quickSetupControl.rePosition();
    },
    
    showFailedStatus : function(action){
        var me = action,
            taskstatus = me.getContext('taskstatus'),
            tpl, target = baidu.g(this.renderTarget),
            type = nirvana.quickSetupLib.getTypeName(),
            html;
        
        tpl = er.template.get('quickSetupTaskFailed1');
        if(target){
            if(taskstatus == 6){
                target.innerHTML = tpl;
                baidu.g('QuickSetupTaskFailTitle').innerHTML = nirvana.config.EOS.STEP2.FAIL.TITLE;
                baidu.g('QuickSetupTaskFailContent').innerHTML = nirvana.config.EOS.STEP2.FAIL.CONTENT;
            }
        }
        nirvana.quickSetupControl.rePosition();
    }
    
};
