/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    account/otherSetting.js
 * desc:    账户其他设置里面的一些公用的东西
 * author:  yanlingling
 * date:    $Date: 2012/11/26 $
 */

manage.account = manage.account || {};
manage.account.otherSetting = {
    tabs : ['基本设置', 'IP排除', '精确匹配扩展'],
    tabs_7550 : ['基本设置', 'IP排除', '高级IP排除', '精确匹配扩展'],

    /**
     *tab 切换处理
     */
    tabClickHandler : function(tab) {
        var param = {
            id : 'accountsetDialog',
            title : '账户其他设置',
            width : 440,
            params : {},
            onclose : function() {
                fbs.material.clearCache("planinfo");
                er.controller.fireMain('reload', {});
            }
        };
        switch(+tab) {
            case 0:
                param.actionPath = 'manage/acctBaseSet';
                break;
            case 1:
                param.actionPath = 'manage/acctIpExclusion';
                break;
            case 2:
                param.actionPath = nirvana.env.ADVANCED_IP_EXCLUDED
                    ? 'manage/acctIpAdvancedExclusion'
                    : 'manage/exactMatchExp';
                break;
            case 3:
                param.actionPath = 'manage/exactMatchExp';
                break;
        }
        nirvana.util.openSubActionDialog(param);
        nirvana.subaction.isDone = true;
        clearTimeout(nirvana.subaction.resizeTimer);
        baidu.g('ctrldialogaccountsetDialog').style.top = baidu.page.getScrollTop() + 200 + 'px';
    },
	modAccIpFail: function(data){
					if (data.status != 500) {
						var error = fbs.util.fetchOneError(data), 
							errortip = baidu.g("ipSaveTip"), 
							errorcode;
						errortip.innerHTML = "";
						for (var item in error) {
							errorcode = error[item].code;
							switch (errorcode) {
								case 460:
									errortip.innerHTML = nirvana.config.ERROR.IPEXCLUSION[errorcode];
									break;
								case 461:
									errortip.innerHTML = nirvana.config.ERROR.IPEXCLUSION[errorcode];
									break;
							}
						}
					}
					else {
						ajaxFail(0);
					}
				},

    /**
     * 高级ip排除的小流量配置
     * @param configName
     * @return {*}
     */
    getConfig:function(configName){
         switch(configName){
             case'NEGAWORD_NUM_MAX':
                 if(nirvana.env.NEGATIVE_WORD_MORE){//是否定关键词的小流量
                     return fbs.config[configName+'_7550']  ;
                 }else{
                     return fbs.config[configName]  ;
                 }
                 break;
             case'tabs':
                 if(nirvana.env.ADVANCED_IP_EXCLUDED){//是ip排除的小流量
                     return manage.account.otherSetting['tabs_7550']  ;
                 }else{
                     return manage.account.otherSetting['tabs']  ;
                 }
                 break;
             default :
                 if(nirvana.env.ADVANCED_IP_EXCLUDED){//是ip排除的小流量
                     return fbs.config[configName+'_7550']  ;
                 }else{
                     return fbs.config[configName]  ;
                 }
                 break;
         }

    }
}