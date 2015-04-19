/**
 * @file src/nirvana/newManage/config/erConfig.js
    核心功能涅槃-推广管理页 ER Module等声明
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.newManage.erConfig = (function() {
    var exports = new er.Module({
        'action': [
            {
                path: '/newManage/plan',
                action: 'nirvana.newManage.plan',
                type: 'nirvana/newManage/plan' // likeER，AMD模块id
            },
            {
                path: '/newManage/unit',
                action: 'nirvana.newManage.unit'
            },
            {
                path: '/newManage/idea',
                action: 'nirvana.newManage.idea'
            },
            {
                path: '/newManage/localIdea',
                action: 'nirvana.newManage.localIdea'
            },
            {
                path: '/newManage/appendIdea',
                action: 'nirvana.newManage.appendIdea'
            },
            {
                path: '/newManage/keyword',
                action: 'nirvana.newManage.keyword'
            },
            {
                path: '/newManage/monitor',
                action: 'nirvana.newManage.monitor'
            }
        ]
    });

    return exports;
})();