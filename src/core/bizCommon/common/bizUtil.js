/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: core/common/bizUtil.js
 * desc: 一些业务相关的工具方法
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/02/18 $
 */
nirvana.bizUtil = function($, T, nirvana) {

    return {
        /**
         * 修改计划/单元/关键词状态的请求接口定义
         */
        MOD_STATE_REQUESTER: {
            plan: fbs.plan.modPausestat,
            unit: fbs.unit.modPausestat,
            word: fbs.keyword.modPausestat,
            idea: fbs.idea.modPausestat
        },
        /**
         * 更新物料的缓存信息
         * @param {string} level 物料的层级
         * @param {Array} idArr 被修改的计划/单元的id数组
         */
        updateCacheInfo: function(level, idArr) {
            switch (level) {
                case 'word':
                    fbs.material.clearCache('wordinfo');
                    fbs.avatar.getMoniFolders.clearCache();
                    fbs.avatar.getMoniWords.clearCache();
                    break;
                case 'unit':
                    fbs.material.clearCache('unitinfo');
                    //创意、关键词、文件夹详情、排行榜
                    fbs.material.ModCache('wordinfo', 'unitid', idArr, 'delete');
                    fbs.material.ModCache('ideainfo', 'unitid', idArr, 'delete');
                    fbs.avatar.getMoniFolders.clearCache();
                    fbs.avatar.getMoniWords.ModCache('unitid', idArr, 'delete');
                    fbs.material.getTopData.clearCache();
                    break;
                case 'plan':
                    fbs.material.clearCache('planinfo');
                    //单元、创意、关键词、文件夹详情、排行榜
                    fbs.material.ModCache('unitinfo', 'planid', idArr, 'delete');
                    fbs.material.ModCache('wordinfo', 'planid', idArr, 'delete');
                    fbs.material.ModCache('ideainfo', 'planid', idArr, 'delete');
                    fbs.avatar.getMoniFolders.clearCache();
                    fbs.avatar.getMoniWords.ModCache('planid', idArr, 'delete');
                    fbs.material.getTopData.clearCache();
                    break;
            }
        },
        /**
         * 修改关键词出价修改成功需要触发的更新操作
         * @param {number} newWBid 关键词的修改后的出价
         * @param {number} winfoid 修改的关键词的winfoid
         * @param {Object} response 修改关键词出价成功的响应数据对象
         * NOTICE: 以下代码逻辑提取自原来优化包的修改出价的逻辑
         * @author wuhuiyao@baidu.com
         * @date 2013-5-17
         */
        updateWordCacheOfBid: function (newWBid, winfoid, response) {
            var modifyData = {};

            modifyData[winfoid] = {
                bid: newWBid
            };

            var wordInfo = response.data[winfoid];
            for (var key in wordInfo) {
                modifyData[winfoid][key] = wordInfo[key];
            }

            fbs.avatar.getMoniWords.ModCache('winfoid', modifyData);
            fbs.material.ModCache('wordinfo', 'winfoid', modifyData);
        },
        /**
         * 修改关键词匹配成功需要触发的更新操作
         * @param {number} newWMatch 修改后的关键词的匹配
         * @param {number} winfoid 修改的关键词的winfoid
         * NOTICE: 以下代码逻辑提取自原来优化包的修改匹配的逻辑
         * @author wuhuiyao@baidu.com
         * @date 2013-5-18
         */
        updateWordCacheOfMatch: function (newWMatch, winfoid) {
            var modifyData = {};

            modifyData[winfoid] = {
                wmatch: newWMatch
            };

            fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
            fbs.material.ModCache('wordinfo', "winfoid", modifyData);
        },
        /**
         * 根据给定数据对象确定当前计划/单元/关键词/创意层级信息
         * @param {string} level 给定的层级类型名称，有效值:plan,unit,word,idea
         *                       (不区分大小写)
         * @return {Object}
         */
        getLevelInfo: function (levelType) {
            var cachekey;

            var level = levelType.toLowerCase();
            switch (level) {
                case 'word':
                    cachekey = 'winfoid';
                    break;
                case 'unit':
                    cachekey = 'unitid';
                    break;
                case 'plan':
                    cachekey = 'planid';
                    break;
                case 'idea':
                    cachekey = 'ideaid';
                    break;
            }

            return {
                level: level,
                id: cachekey,
                name: level + 'info'
            };
        },
        /**
         * 提取自nirvana.inline.failHandler和displayError方法，便于重用
         * 修改物料信息默认失败处理
         * @param {Function(errorCode)} 出错所要执行的回调
         * @return {Function}
         * @author wuhuiyao@baidu.com
         * @date 2013-5-17
         */
        getModMaterialFailHandler: function (callback) {
            return function (data) {
                if (data.status == 500) {
                    if (data.errorCode && data.errorCode.code == 408) {
                        callback(408);
                        return;
                    }
                    else {
                        ajaxFail(0);
                        return;
                    }
                }

                var error = fbs.util.fetchOneError(data);
                var errorcode;

                if (error) {
                    if (error.hasOwnProperty('code')) {
                        // 增加获取code判断分支，添加关键词返回code直接在error上
                        // add by Huiyao 2013-5-18
                        callback(error.code);
                    }
                    else {
                        for (var item in error) {
                            errorcode = error[item].code;
                            callback(errorcode);
                        }
                    }
                }
                else if (data.errorCode) {
                    error = data.errorCode; //阿凡达返回error结构与其他接口不一致
                    if (error.code) {
                        callback(error.code);
                    }
                    else {
                        for (var item in error) {
                            errorcode = error[item];
                            callback(errorcode);
                        }
                    }
                }
                else {
                    ajaxFail(0);
                }
            };
        },
        /**
         * 提取自nirvana.inline.displayError方法，便于重用
         * 获取上述方法{@link modMaterialFailHandler}返回的错误码所对应的可读的错误消息
         * @param {Object} errorcode 错误编码
         * @return {string}
         * @author wuhuiyao@baidu.com
         * @date 2013-5-17
         */
        getMaterialModErrorInfo: function (errorcode) {
            var error = nirvana.config.ERROR;
            // mod by Huiyao 2013-5-14: add account_budget, plan_budget
            var info = [
                'unit_price', 'unit_name', "plan_name", 'keyword_price',
                'keyword_url', 'keyword_add', 'report_name', 'avatar',
                'account_budget', 'plan_budget'
            ];

            var infoArr;
            var errorBase;

            for (var i = 0, l = info.length; i < l; i++) {
                infoArr = info[i].split("_");
                errorBase = error;

                for (var j = 0, len = infoArr.length; j < len; j++) {
                    errorBase = errorBase[infoArr[j].toUpperCase()];
                }

                for (var item in errorBase) {
                    if (item == errorcode) {
                        // 移除计划预算类似于401错误消息里的%s变量 mod by Huiyao 2013-5-14
                        return errorBase[item].replace('%s', '');
                    }
                }
            }

            // 其它未知或未定义，统一抛数据读取异常错误信息
            return '数据读取异常，请刷新后重试。';
        }
    };
}($$, baidu, nirvana);