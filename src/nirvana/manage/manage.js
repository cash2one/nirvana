
 /*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:   nirvana/manage/pathConfig.js
 * desc:    路径与action的映射关系
 * date:    $Date: 2012/07/16 $
 */
/**
 * @namespace 推广管理模块  以前在plan.js里面
 */
nirvana = nirvana || {};
nirvana.managePathConfig = {
        'action': [
            {
                path: '/manage/plan',
                action: 'manage.planList'
            },
            {
                path: '/manage/unit',
                action: 'manage.unitList'
            },
            {
                path: '/manage/idea',
                action: 'manage.ideaList'
            },
            {
                path: '/manage/localIdea',
                action: 'manage.localIdeaList'
            },
            {
                path: '/manage/appendIdea',
                action: 'manage.appendIdeaList'
            },
            {
                path: '/manage/keyword',
                action: 'manage.keywordList'
            },
            
            {
                path: '/manage/monitorList',
                action: 'manage.monitorList'
            },
            
            {
                path: '/manage/monitorDetail',
                action: 'manage.monitorDetail'
            },
            
            /**
             * 浮动层子action
             */
            {
                path : 'manage/accountBudget',
                action : 'manage.accountBudget'
            },
            // deleted by Wu huiyao: 时段升级和重构
            /*{
                path : 'manage/planSchedule',
                action : 'manage.planSchedule'   
            },*/
            
            {
                path : 'manage/region',
                action :'manage.region'
            },
            {
                path : 'manage/keywordAdd',
                action : 'ToolsModule.kr'
            },
            {
                path : 'manage/keywordAddError',
                action : 'manage.keywordAddError'
            },
            {
                path : 'manage/keywordTransfer',
                action : 'manage.keywordTransfer'
            },
            {
                path : 'manage/ideaEdit',
                action : 'manage.ideaEdit'
            },
            {
                path : 'manage/appendIdea/copyIdea',
                action : 'manage.appendIdea.copyAppendIdea'
            },
           

            //添加对本地推广创意的编辑
            //added by peilonghui@baidu.com 
            {
                path : 'manage/localMerchIdeaEdit',
                action : 'manage.localMerchIdeaEdit'
            },

            {
                path: 'manage/localExperIdeaEdit',
                action: 'manage.localExperIdeaEdit'
            },

            {
                path: 'manage/localGeneralIdeaEdit',
                action: 'manage.localGeneralIdeaEdit'
            },

            {
                path: 'manage/localLocaleIdeaEdit',
                action: 'manage.localLocaleIdeaEdit'
            },
            //end

            //添加附加创意之子链的编辑
            {
				path: 'manage/appIdeaEdit',
				action: 'manage.appIdeaEdit'
			},

            {
                path: 'manage/appToMultiEdit',
                action: 'manage.appToMultiEdit'
            },

	    	{
				path: 'manage/sublinkIdeaEdit',
				action: 'manage.sublinkIdeaEdit'
			},
          

            {
                path : 'manage/budget',
                action : 'manage.budget'
            },
            
            {
                path : 'manage/acctIpExclusion',
                action :'manage.acctIpExclusion'
            },
            {
                path : 'manage/acctIpAdvancedExclusion',
                action :'manage.acctAdvancedIpExclusion'
            },
            
            {
                path : 'manage/planIpExclusion',
                action :'manage.planIpExclusion'
            },

            // 精确匹配扩展（地域词扩展）
            // Add by guanwei01 2012/12/04
            {
                path : 'manage/exactMatchExp',
                action :'manage.exactMatchExp'
            },
            
            {
                path : 'manage/createPlan',
                action :'manage.createPlan'
            },
            
            {
                path : 'manage/acctBaseSet',
                action :'manage.acctBaseSet'
            },
            {
                path : 'manage/historyReport',
                action :'manage.historyReport'
            },
            {
                path : 'manage/negative',
                action :'manage.negative'
            },
            
            {
                path : 'manage/accurateNegative',
                action :'manage.accurateNegative'
            },
            
            {
                path : 'manage/planBaseSet',
                action :'manage.planBaseSet'
            },

            {
                path : 'manage/planAdvancedSet',
                action :'manage.planAdvancedSet'
            },
            
            {
                path : 'manage/createUnit',
                action :'manage.createUnit'
            },
            
            {
                path : 'manage/unitRename',
                action :'manage.unitRename'
            },
            
            {
                path : 'manage/mPriceFactor',
                action :'manage.modifyMPriceFactor'
            },
            
            {
                path : 'manage/modPlanShowprob',
                action :'manage.modPlanShowprob'
            },
            
            {
                path : 'manage/setQrstat',
                action :'manage.setQrstat'
            },
            
            {
                path : 'manage/modUnitPrice',
                action :'manage.modUnitPrice'
            },
            {
                path : 'manage/runPhoneTrail',
                action : 'manage.runPhoneTrail'
            },
            {
                path : 'manage/cancelPhoneTrail',
                action : 'manage.cancelPhoneTrail'
            },
            {//离线宝状态
                path : 'manage/LXBstat1000',
                action : 'manage.LXBstat1000'
            },
            {
                path : 'manage/LXBstat9',
                action : 'manage.LXBstat9'
            },
            {
                path : 'manage/LXBstat8',
                action : 'manage.LXBstat8'
            },
            {
                path : 'manage/LXBstat6',
                action : 'manage.LXBstat6'
            },
            {
                path : 'manage/LXBstat4',
                action : 'manage.LXBstat4'
            },
            {
                path : 'manage/LXBstat0',
                action : 'manage.LXBstat0'
            },
            {
                path : 'manage/modWordPrice',
                action :'manage.modWordPrice'
            },
            
            {
                path : 'manage/modWordPriceAdv',
                action :'manage.modWordPriceAdv'
            },
            
            {
                path : 'manage/modWordUrl',
                action :'manage.modWordUrl'
            },
            
            {
                path : 'manage/modWordWmatch',
                action :'manage.modWordWmatch'
            },
            {
                path : 'manage/editIdea',
                action :'manage.editIdea'
            },
            {
                path : 'manage/analyseKR',
                action :'manage.analyseKR'
            },
            
            {
                path : 'manage/addFolder',
                action :'manage.addFolder'
            },
            
            {
                path : 'manage/addMoniWords',
                action :'manage.addMoniWords'
            },
            
            {
                path : 'manage/offlineReason',
                action : 'manage.offlineReason'
            },
            
            {
                path : 'manage/moniKeyword',
                action : 'manage.moniKeyword'
            },
            {
                path : 'manage/batch',
                action : 'manage.batch'
            },
            // 推荐关键词 add by yangji 效果突降中使用
            {
                path : 'manage/recommendWord',
                action : 'manage.recommendWord'
            },
            //效果分析引导 add by huanghainan
            {
                path : 'manage/effectGuide',
                action :'manage.effectGuide'
            },
            {
                path : 'manage/modIdeaUrl',
                action :'manage.modIdeaUrl'
            }
        ]
    };
var manage = new er.Module({
    config: nirvana.managePathConfig
});