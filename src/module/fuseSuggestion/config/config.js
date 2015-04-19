/**
 * @file src/module/fuseSuggestion/fuseSuggestion.js 融合默认配置信息
    智能优化融入推广管理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.fuseSuggestion = nirvana.fuseSuggestion || {};
nirvana.fuseSuggestion.config = {
    DEFAULT: {
        viewStatus: 'min',
        width: {
            min: 58,
            max: 200
        },
        batteryColor: 'yellow',
        timeout: 5000
    },

    LANG: {
        TITLE: '优化',
        REASON: {
            101: '计划预算已花完',
            102: '计划预算频繁下线',
            103: '处于搁置时段',
            104: '未覆盖优质时段',
            201: '无生效创意',
            301: '无法展现',
            401: '无法展现', // 对应4001、4007
            402: '无法在左侧展现',
            403: '左侧首屏展现概率低',  // 对应4003
            407: '左侧展现概率低'  // 对应4003
            // 404: '未稳定在左侧',
            // 405: '未稳定前三',
            // 406: '未稳定第一'
        },
        SUGGESTION: {
            1001: '优化预算',
            1002: '优化时段',
            2001: '新增创意',
            2002: '查看创意',
            3001: '修改创意',
            3002: '激活',
            4001: '激活',
            4002: '优化质量度',
            4003: '修改出价',
            // 4004: '稳定左侧均价',
            // 4005: '',
            // 4006: '',
            4007: '修改出价'
        }
    },

    command: {
        1001: 'plan.budget',
        1002: 'plan.schedule',
        2001: 'idea.add',
        2002: 'unit.noEffectIdeaList',
        3001: 'idea.modify',
        3002: 'idea.active',
        4001: 'word.active',
        4002: 'idea.modasnew',
        4003: 'word.bid',
        // 4004: 'word.bid',
        // 4005: 'word.bid',
        // 4006: 'word.bid',
        4007: 'word.bid'
    },
    batteryColorOfReason: { // 为red的，不在这里就是DEFAULT.batteryColor
        101: 'red'
    },
    viewStatusName: ['min', 'max'],

    itemIdofLevel: {
        'plan': 'planid',
        'unit': 'unitid',
        'word': 'winfoid',
        'idea': 'ideaid'
    },
    fullLevelStr: {
        'plan': 'planinfo',
        'unit': 'unitinfo',
        'word': 'wordinfo',
        'idea': 'ideainfo'
    }

    // LEVELINFO: {
    //     REASON: {
    //         'planinfo': [101, 102, 103, 104],
    //         'unitinfo': [201, 201],
    //         'wordinfo': [301, 301],
    //         'ideainfo': [401, 402, 403, 404, 405, 406]
    //     },
    //     SUGGESTION: {
    //         'planinfo': [1001, 1001, 1002, 1002],
    //         'unitinfo': [2001, 2002],
    //         'wordinfo': [3001, 3002],
    //         'ideainfo': [4001, 4002, 4003, 4004, 4005, 4006]
    //     }
    // }

};