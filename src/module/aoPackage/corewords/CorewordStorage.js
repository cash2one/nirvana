/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/corewords/CorewordStorage.js
 * desc: 重点词排名包里用于存储被修改的还没更新的关注的重点词
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/13 $
 */

/**
 * 重点词排名包里用于存储被修改的还没更新的关注的重点词，基于Flash存储实现本地存储
 * @class CorewordStorage
 * @static
 * @namespace nirvana.aopkg
 */
nirvana.aopkg.CorewordStorage = function($, nirvana, Store, T) {
    /**
     * 定义存储的key
     */
    var MODIFIED_COREWORDS = 'aopkg_modified_coreword';

    // 整个会话周期存储用户修改的重点词信息
    var _modifiedInfo = {};

    var S = {
        /**
         * 初始化修改的重点词的信息，将尝试从本地存储读取相应的信息。
         * 在使用该静态类前该方法必须先调用一下，该方法不会自动执行。
         * @public
         */
        init: function() {
            if (Store.isEnable()) {
                var result = S._load();
                S._deserialize(result || '');
            }
        },
        /**
         * 对存储的信息进行反序列化操作
         * @param {string} result
         * @private
         */
        _deserialize: function(result) {
            var resultArr = result.split('|');
            var record;
            var valueArr;

            for (var i = 0, len = resultArr.length; i < len; i ++) {
                record = resultArr[i];

                if (!record) {
                    continue;
                }

                valueArr = record.split(';');
                if (valueArr.length === 3) {
                    // 元素顺序：regionId;diagnosisTime;modified coreword winfoids
                    _modifiedInfo[valueArr[0]] = {
                        diagnosisTime: + valueArr[1],
                        winfoids: valueArr[2].split(',')
                    };
                }
            }
        },
        /**
         * 给定的重点词winfoid是否在存储的修改重点词里
         * @param {string} regionId 重点词所属的投放地域Id
         * @param {number|string} winfoid 重点词是winfoid
         * @return {boolean}
         * @public
         */
        isExist: function(regionId, winfoid) {
            var record = _modifiedInfo[String(regionId)];
            var winfoidArr = (record && record.winfoids) || [];

            return T.array.indexOf(winfoidArr, String(winfoid)) != -1;

        },
        /**
         * 更新修改的重点词的投放地域和诊断时间，如果当前存储的重点词诊断时间小于当前的诊断时间，
         * 则清空该地域下失效的修改的重点词信息
         * @param {string} regionId 投放地域Id
         * @param {number} currDiagnosisTime
         * @public
         */
        update: function(regionId, currDiagnosisTime) {
            if (!currDiagnosisTime) {
                return;
            }

            var record = _modifiedInfo[String(regionId)];
            var oldDiagnosisTime = (record && record.diagnosisTime) || 0;

            if (oldDiagnosisTime && (+ currDiagnosisTime > oldDiagnosisTime)) {
                S.clear(regionId);
            }
        },
        /**
         * 添加修改的重点词
         * @param {string} regionId 投放地域Id
         * @param {number} diagnosisTime 诊断时间
         * @param {Array} toAddwinfoids 要添加的修改重点词的winfoid的数组
         * @public
         */
        add: function(regionId, diagnosisTime, toAddwinfoids) {
            var winfoids;

            if (!_modifiedInfo[regionId]) {
                _modifiedInfo[regionId] = {
                    diagnosisTime: diagnosisTime,
                    winfoids: []
                };
            }

            winfoids = _modifiedInfo[regionId].winfoids;
            S.addOrRemove(toAddwinfoids, false, [winfoids]);
        },
        /**
         * 移除修改的重点词
         * @param {string} regionId 投放地域Id
         * @param {Array} winfoids 要移除的修改重点词的winfoid的数组
         * @public
         */
        remove: function(toRemoveWinfoids) {
            var winfoIdsArr = [];

            for (var k in _modifiedInfo) {
                winfoIdsArr.push(_modifiedInfo[k].winfoids);
            }

            S.addOrRemove(toRemoveWinfoids, true, winfoIdsArr);
        },
        /**
         * 添加或移除修改的重点词
         * @param {Array} winfoids 要移除或添加的修改重点词的winfoid的数组
         * @param {boolean} isRemove 是否是移除操作
         * @param {Array} toModifyWinfoidsArr 要修改的winfoids数组
         * @private
         */
        addOrRemove: function(winfoids, isRemove, toModifyWinfoidsArr) {
            var strWinfoid;
            var idx;
            var existedWinfoids;
            var changed = false;
            var toModifyLen = toModifyWinfoidsArr.length;

            for (var i = 0, len = winfoids.length; i < len; i ++) {
                strWinfoid = String(winfoids[i]);

                for (var j = 0; j < toModifyLen; j ++) {
                    existedWinfoids = toModifyWinfoidsArr[j];
                    idx = T.array.indexOf(existedWinfoids, strWinfoid);

                    if (idx != -1 && isRemove) {
                        existedWinfoids.splice(idx, 1);
                        changed = true;
                    } else if (idx == -1 && !isRemove) {
                        existedWinfoids.push(strWinfoid);
                        changed = true;
                    }
                }
            }
            // 如果发生变化，则保存
            changed && S.save();
        },
        /**
         * 清空指定地域下所有修改的重点词
         * @param {string} regionId 要清除的地域Id
         * @private
         */
        clear: function(regionId) {
            delete _modifiedInfo[String(regionId)];
            S.save();
        },
        /**
         * 保存修改重点词信息
         * @public
         */
        save: function() {
            if (Store.isEnable()) {
                S._serialize();
            }
        },
        /**
         * 持久化数据到本地存储
         * @private
         */
        _serialize: function() {
            var result = '';
            var record;
            var winfoids;
            var isFirst = true;

            for (var k in _modifiedInfo) {
                record = _modifiedInfo[k];
                winfoids = (record && record.winfoids) || [];
                // 对于数组为空，或者['']直接跳过
                if (!winfoids.length || !winfoids[0]) {
                    continue;
                }

                if (!isFirst) {
                    result += '|';
                }

                result += (
                    k + ';' + record.diagnosisTime + ';' + winfoids.join(',')
                    );
                isFirst = false;
            }
            // 存储到本地
            Store.set(nirvana.env.OPT_ID + '_' + MODIFIED_COREWORDS, result);
        },
        /**
         * 从本地存储加载数据
         * @private
         */
        _load: function() {
            return Store.get(nirvana.env.OPT_ID + '_' + MODIFIED_COREWORDS);
        }
    };

    return S;
}($$, nirvana, FlashStorager, baidu);