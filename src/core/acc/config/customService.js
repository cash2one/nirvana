/**
 * @file 客服人员权限配置
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.acc.authConfig.customService = (function() {

    var LIMIT_TYPE = nirvana.acc.authConfig.LIMIT_TYPE;
    return {
        'bizCommon/plan': {
            pause: LIMIT_TYPE.READONLY,
            del: LIMIT_TYPE.READONLY
        },
        'bizCommon/unit': {
            pause: LIMIT_TYPE.READONLY,
            del: LIMIT_TYPE.READONLY
        },
        'bizCommon/keyword': {
            pause: LIMIT_TYPE.READONLY,
            del: LIMIT_TYPE.READONLY
        },
        'bizCommon/idea': {
            pause: LIMIT_TYPE.READONLY,
            del: LIMIT_TYPE.READONLY
        }
    };
})();