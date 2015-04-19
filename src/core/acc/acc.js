/**
 * @file src/core/bizCommon/acc/Acc.js 权限控制中心类 Authority Control Center
    权限控制中心，进行Web层面的权限控制
    针对于optid，无视userid

 * @author Leo Wang(wangkemiao@baidu.com)
 * @date 2013/5/20
 * @version 1.0
 */

/**
 * @namespace
 */
nirvana.acc = (function() {

    // tangram => baidu
    var util = nirvana.util;

    var exports = {};

    /**
     * 整理权限信息
        complicated Object => simple Object
     *
     */
    function minifyAuthInfo(auth) {
        // complicated Object => simple Object
        if(!auth) {
            return;
        }
        var miniAuthInfo = {
            readonly: {
                entrances: [],
                methods: [],
                methodNames: []
            },
            hide: {
                entrances: [],
                methods: [],
                methodNames: []
            },
            deny: {
                entrances: [],
                methods: [],
                methodNames: []
            }
        };

        var moduleConf = nirvana.acc.moduleConfig;

        var tmodPath; // mod's path
        var tmodConf; // mod's config
        var tmethod; // single method
        var tauth; // single auth
        var cache;
        for(tmodPath in auth) {
            tmodConf = moduleConf[tmodPath];
            tauth = auth[tmodPath];
            for(tmethod in tauth) {
                cache = null;
                // 则认为没有权限
                if(tauth[tmethod] !== true) {
                    switch(tauth[tmethod]) {
                    case nirvana.acc.authConfig.LIMIT_TYPE.READONLY:
                        cache = miniAuthInfo.readonly;
                        break;
                    case nirvana.acc.authConfig.LIMIT_TYPE.HIDE:
                        cache = miniAuthInfo.hide;
                        break;
                    case nirvana.acc.authConfig.LIMIT_TYPE.DENY:
                        cache = miniAuthInfo.deny;
                        break;
                    }
                }

                if(cache) {
                    cache.entrances.push(tmodConf[tmethod].entrance);
                    cache.methodNames.push(tmodConf[tmethod].method.name);
                    cache.methods.push(tmodConf[tmethod].method);
                }
            }
        }

        return miniAuthInfo;
    }

    /**
     * ACC全局初始化
     */
    exports.init = function() {
        // 操作人类型
        // 其实还有管理员…… 但是本期没做用户类型返回
        // 坑爹的是，只针对着客服，so，判断一下是否继续处理
        var optType = nirvana.env.OPT_ID == nirvana.env.USER_ID 
            ? 'user' // 普通用户
            : 'customService'; // 客服

        // if(optType == 'user') {
        //     return;
        // }

        // 否则需要进行权限控制
        var options = {
            optLevelId: nirvana.env.OPT_ULEVELID,
            optId: nirvana.env.OPT_ID,
            optName: nirvana.env.OPT_NAME,
            userLevelId: nirvana.env.ULEVELID,
            userId: nirvana.env.USER_ID,
            userName: nirvana.env.USER_NAME,
            hasAuth: true, // 默认均有权限进行全局操作啥的
            optType: optType
        };

        var accEnv = nirvana.env.ACC;
        if(accEnv && 'undefined' !== typeof accEnv.optAuth) {
            options.hasAuth = accEnv.optAuth;
            // options.optType = accEnv.optType; // 现在给不了
        }

        var auth = baidu.object.clone(nirvana.acc.authConfig.DEFAULT);
        util.deepExtend(auth, nirvana.acc.authConfig[options.optType]);
        options.auth = minifyAuthInfo(auth);

        exports.accService = new nirvana.acc.AccService(options); // 单件

        if(exports.expControl.isArrowUser()) {
            if(baidu.array.indexOf(fbs.config.noLoading, 'GET/material') == -1) {
                fbs.config.noLoading.push('GET/material');
            }
            // if(baidu.array.indexOf(fbs.config.noLoading, 'GET/eos/userregtype') == -1) {
            //     fbs.config.noLoading.push('GET/eos/userregtype');
            // }
            // if(baidu.array.indexOf(fbs.config.noLoading, 'GET/accounttree/childrennodes') == -1) {
            //     fbs.config.noLoading.push('GET/accounttree/childrennodes');
            // }
            // if(baidu.array.indexOf(fbs.config.noLoading, 'GET/mtlcustomcols/custom') == -1) {
            //     fbs.config.noLoading.push('GET/mtlcustomcols/custom');
            // }
            // if(baidu.array.indexOf(fbs.config.noLoading, 'GET/effectana/auth') == -1) {
            //     fbs.config.noLoading.push('GET/effectana/auth');
            // }
        }

    };


    exports.expControl = {
        isArrowUser: function() {
            var acc = nirvana.env.ACC;
            if(!acc) {
                return false;
            }
            var expArr = acc.userExp || [];
            return baidu.array.indexOf(expArr, 'arrow') > -1;
        }
    };

    return exports;
})();