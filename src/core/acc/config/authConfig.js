/**
 * @file 权限配置 - default
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.acc.authConfig = (function() {
    var exports = {};

    exports.LIMIT_TYPE = {
        READONLY: 1,  // 界面入口只读，展现禁用提示，功能禁用
        HIDE: 2,  // 界面入口隐藏，无法进入界面，但是功能可用
        DENY: 3  // 界面入口可用，但是进入时提示拒绝，且执行功能时提示禁用
    };

    /**
     * 当前针对于凤巢前端模块及模块方法级别的权限配置
     * 期望是这样：
        指定的层级、类型，实际上是可以直接访问的模块 or 方法
        例如：
            'bizCommon.plan' : {
                add
            }
                针对于层级 require('./bizCommon.plan')即可载入模块
                add是其对外暴露的方法
            

     * 层级：
        1. bizCommon // 公共业务模块

            // 以下为material操作
            account: 账户
            plan: 计划
            unit: 单元
            keyword: 关键词
            idea: 创意

            // 以下为其他模块

        2. quickSetup // 快速新建
        3. aoPackage // 优化包

     * 方法
        自定义
        但是针对于material，公共类型如下：
            1) add
            2) mod
            3) del
            4) get
    
     * 值定义
        例如针对于'bizCommon/idea'
        {
            add: true, // 添加权限有 【默认】
            modify: exports.LIMIT_TYPE.类型
        }
     */
    exports.DEFAULT = {
        'bizCommon/plan': {
            del: true,
            pause: true
        },
        'bizCommon/unit': {
            del: true,
            pause: true
        },
        'bizCommon/keyword': {
            del: true,
            pause: true
        },
        'bizCommon/idea': {
            del: true,
            pause: true
        }
    };

    return exports;
})();