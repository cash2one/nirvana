/**
 * @file src/nirvana/newManage/config/config.js
    核心功能涅槃-推广管理页 基础配置信息
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.newManage.config = {
    // 层级信息标记
    levelMark: {
        account: 'useracct',
        plan: 'planinfo',
        unit: 'unitinfo',
        keyword: 'wordinfo',
        idea: 'ideainfo',
        appendIdea: 'appendIdea',
        localIdea: 'localIdea'
    },
    DEFAULT: {
        pageSize: 10
    },

    STATUS: {
        READYTOGO: 0,
        POLLING: 1,
        FINISHED: 2,
        TIMEOUT: 3
    }
};