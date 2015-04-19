/**
 * @file module路径映射配置
 * @author Leo Wang(wangkemiao@baidu.com)
 */

/**
 * 真心临时的，以后模块化了，就直接删掉好了
 */
nirvana.acc.moduleConfig = (function() {
    var exports = {};

    exports = {
        // 'bizCommon/account': {
        //     ipExclusion: 'manage/acctIpExclusion',
        //     acctAdvancedIpExclusion: 'manage/acctAdvancedIpExclusion',
        //     budget: 'manage/accountBudget',
        //     baseSet: 'manage/acctBaseSet',
        //     exactMatchExp: 'manage/exactMatchExp',
        //     otherSetting: 'manage/account/otherSetting'
        // },
        'bizCommon/plan': {
            // baseSet: 'manage/planBaseSet',
            // advancedSet: 'manage/planAdvancedSet',
            // advancedSetAllDevice: 'manage/advancedSetAllDevice',
            // add: 'manage/createPlan',
            // addAllDevice: 'manage/createPlanAllDevice',
            // modMPriceFactor: 'manage/modifyMPriceFactor',
            // modShowprob: 'manage/modPlanShowprob',
            // modQrstat: 'manage/setPlanQrstat',
            del: {
                entrance: {
                    'ui.Select': [
                        'plan-delete'
                    ]
                },
                method: {
                    name: 'fbs.plan.del'
                }
            },
            pause: {
                entrance: 'plan-pause',
                method: {
                    name: 'fbs.plan.modPausestat',
                    param: {
                        pausestat: 1
                    }
                }
            }
        },
        'bizCommon/unit': {
            // add: 'manage/createUnit',
            // modPrice: 'manage/modUnitPrice',
            // modPhoneTrail: 'manage/runPhoneTrail',
            // modName: 'manage/unitRename',
            del: {
                entrance: 'unit-delete',
                method: {
                    name: 'fbs.unit.del'
                }
            },
            pause: {
                entrance: 'unit-pause',
                method: {
                    name: 'fbs.unit.modPausestat',
                    param: {
                        pausestat: 1
                    }
                }
            }
        },
        'bizCommon/keyword': {
            // add: 'nirvana/KR',
            // modPrice: 'manage/modWordPrice',
            // modUrl: 'manage/modWordUrl',
            // modWmatch: 'manage/modWordWmatch',
            // transfer: 'manage/keywordTransfer',
            del: {
                entrance: 'keyword-delete',
                method: {
                    name: 'fbs.keyword.del'
                }
            },
            pause: {
                entrance: 'keyword-pause',
                method: {
                    name: 'fbs.keyword.modPausestat',
                    param: {
                        pausestat: 1
                    }
                }
            }
        },
        'bizCommon/idea': {
            // add: 'manage/ideaEdit',
            // mod: 'manage/ideaEdit',
            del: {
                entrance: 'idea-delete',
                method: {
                    name: 'fbs.idea.del'
                }
            },
            pause: {
                entrance: 'idea-pause',
                method: {
                    name: 'fbs.idea.modPausestat',
                    param: {
                        pausestat: 1
                    }
                }
            }
        }        
    };

    return exports;
})();