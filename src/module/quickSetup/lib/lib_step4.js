nirvana.quickSetupLib = nirvana.quickSetupLib || {};
nirvana.quickSetupLib.step4 = {
	
	stepTpl : '',
	
	render : function(action) {
        var me = this;

        taskstatus = nirvana.quickSetupLib.getParam('taskstatus') || 0;
        switch(taskstatus){
            case 8:
                //渲染处理
                nirvana.quickSetupLib.step4.showErrorPage();
                return;
            default:
                fbs.eos.needToAddIdeas({
                    onSuccess: function(json) {
                        var status = +json.data.status;
                        if (!status) {
                            me.nextStep();
                            
                        } else {
                            var target = baidu.g(nirvana.quickSetupLib.targetId),
                                param = { nextStep: me.nextStep, from: 'quicksetup', dialog: ui.util.get('QuickSetup') },
                                elem = nirvana.idea.simpleEdit(param);
                            
                            target.appendChild(elem);
                            
                            // 确保第四步关闭会跳到账户层级的关键词tab
                            nirvana.quickSetupLib.setParam('toKeyword', true);

                            var dialog = ui.util.get('QuickSetup');
                            dialog && (dialog.getClose().onclick = function() {
                                nirvana.quickSetupControl.leaveEditIdea(function() {
                                    me.nextStep(true);
                                });
                            });
                        }
                    }
                });
            break;
        }
    },

    nextStep: function(partSuccess) {
        var target = baidu.g(nirvana.quickSetupLib.targetId);
        target.innerHTML = lib.tpl.getTpl('quickSetupTaskSuccess');
        // 如果部分成功
        if (partSuccess) {
            var elem = $$('.part-success', target)[0];
            baidu.show(elem);
        }
        ui.util.init(target);
        ui.util.get('finishCLoseButton') && (ui.util.get('finishCLoseButton').onclick = function(){
            nirvana.quicksetup.hide();
        });

        var dialog = ui.util.get('QuickSetup');
        dialog && (dialog.getClose().onclick = function() {
            nirvana.quicksetup.hide();
        });
    },

    showErrorPage: function() {
        var target = baidu.g(nirvana.quickSetupLib.targetId);
        target.innerHTML = lib.tpl.getTpl('quickSetupLastTaskSuccess');
        
        ui.util.init(target);
        ui.util.get('finishCLoseButton') && (ui.util.get('finishCLoseButton').onclick = function(){
            nirvana.quicksetup.hide();
        });

        var dialog = ui.util.get('QuickSetup');
        dialog && (dialog.getClose().onclick = function() {
            nirvana.quicksetup.hide();
        });
    }
};	
