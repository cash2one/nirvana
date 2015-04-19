/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/corewords/Coreword.js
 * desc: 重点词排名包的重点词模型：提供增删查功能
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/05 $
 */

/**
 * 重点词排名包的重点词模型：提供增删查功能
 * @class Coreword
 * @namespace nirvana.aopkg
 */
nirvana.aopkg.Coreword = function($, nirvana) {
    function Coreword() {
    }

    Coreword.ADD_SUCCESS = '_add_success';
    Coreword.ADD_FAIL = '_add_fail';

    Coreword.DEL_SUCCESS = '_del_success';
    Coreword.DEL_FAIL = '_del_fail';

    Coreword.UPDATE_SUCCESS = '_update_success';
    Coreword.UPDATE_FAIL = '_update_fail';

    // 未设失败类型默认是：网络异常400或服务端错误500等其它情况
    Coreword.MOD_FAIL_TYPE = {
        EXCEED_LIMIT: 1, // 超过重点词上限，全部添加失败
        WORD_DEL_ADD: 2 // 添加的重点词已经被删除或者已经是重点词造成
    };

    /* 监控对象的简写*/
    var M = nirvana.AoPkgMonitor;
    var bind = nirvana.util.bind;

    function getSuccessWinfoids(failWinfoids, initWinfoids) {
        var successWinfoids = [];
        for (var i = initWinfoids.length; i --;) {
            if (baidu.array.indexOf(failWinfoids, initWinfoids[i]) == -1) {
                successWinfoids.push(initWinfoids[i]);
            }
        }
        return successWinfoids;
    }

    Coreword.prototype = {
        isValidate: function(wordIdList) {
            return (wordIdList instanceof Array) && (wordIdList.length > 0);
        },
        /**
         * 更新重点词：包括关注一批新的重点词以及取消关注一批重点词
         * @param {Array} addWinfoids 要添加关注的重点词的winfoid数组
         * @param {Array} delWinfoids 要取消关注的重点词的winfoid数组
         */
        update: function(addWinfoids, delWinfoids) {
            var me = this;
            fbs.nikon.updateCoreWords({
                addwinfoids: addWinfoids,
                delwinfoids: delWinfoids,
                onSuccess: bind('updateSuccess', me, addWinfoids, delWinfoids),
                onFail: bind('updateFail', me, addWinfoids, delWinfoids)
            });
        },
        /**
         * 更新重点词相应成功的事件处理
         * @param {Array} addWinfoids 要添加关注的重点词的winfoid数组
         * @param {Array} delWinfoids 要取消关注的重点词的winfoid数组
         * @param {Object} json 服务端响应的数据对象
         */
        updateSuccess: function(addWinfoids, delWinfoids, json) {
            var data = json.data;
            var errorCodes = +data.errorcodes;

            if (errorCodes & 4) {
                // 要添加的重点词已经超过当前重点词的上限，全部添加失败
                this.publish(Coreword.UPDATE_FAIL, addWinfoids, delWinfoids,
                    Coreword.MOD_FAIL_TYPE.EXCEED_LIMIT);
            }
            else {
                var errorCorewords = data.errorcorewords;
                // 初始化更新失败的重点词
                var failWinfoids = [];
                for (var i = errorCorewords.length; i --;) {
                    failWinfoids.push(+errorCorewords[i].winfoid);
                }

                // 初始化添加成功的重点词
                var addSuccessWinfoids = getSuccessWinfoids(failWinfoids, addWinfoids);
                // 初始化删除失败成功的重点词
                var delSuccessWinfoids = getSuccessWinfoids(failWinfoids, delWinfoids);

                if (addSuccessWinfoids.length || delSuccessWinfoids.length) {
                    this.publish(Coreword.UPDATE_SUCCESS, addSuccessWinfoids,
                        delSuccessWinfoids, errorCorewords);
                }
                else {
                    // 触发全部更新失败的事件，这是由于添加的重点词已被删除或者已经是重点词造成
                    this.publish(Coreword.UPDATE_FAIL, addWinfoids, delWinfoids,
                        Coreword.MOD_FAIL_TYPE.WORD_DEL_ADD);
                }
            }
        },
        /**
         * 更新重点词失败的事件处理
         * @param {Array} addWinfoids 要添加关注的重点词的winfoid数组
         * @param {Array} delWinfoids 要取消关注的重点词的winfoid数组
         */
        updateFail: function(addWinfoids, delWinfoids) {
            this.publish(Coreword.UPDATE_FAIL, addWinfoids, delWinfoids);
        },
        /**
         * 关注一批新的重点词 // TODO 后续对照组下掉这个方法可以删掉包括相应监控和成功和失败回调
         * @method add
         * @param {Array} wordIdList 要关注的重点词ID List
         * @param {number} source 用于标识触发添加的源
         *                        其常量定义见
         *                        {@link nirvana.AoPkgMonitor.CorewordAddType}
         */
        add: function(wordIdList, source) {
            if (!this.isValidate(wordIdList)) {
                return;
            }

            var me = this;

            fbs.nikon.addCoreWords({
                winfoids : wordIdList,
                onSuccess : bind(me.addSuccess, me, wordIdList, source),
                onFail : bind(me.addFail, me, wordIdList, source)
            });
        },
        /**
         * 添加重点词成功的回调，这里跟RD讨论过，这里不会返回status 300的情况
         */
        addSuccess: function(wordIdList, source, json) {
            var rdata = json.data,
                errorCodes = +rdata.errorcodes,
                errorCorewords = rdata.errorcorewords;

            if (0 === errorCodes) {
                // 全部添加成功
                // 发送添加重点词成功的监控
                M.addCorewords(wordIdList, source);

                // 第二个参数null标识没有添加失败的词
                this.publish(Coreword.ADD_SUCCESS, wordIdList, null, source);
            } else if (errorCodes & 4) {
                // 要添加的重点词已经超过当前重点词的上限，全部添加失败
                this.publish(Coreword.ADD_FAIL, wordIdList,
                    Coreword.MOD_FAIL_TYPE.EXCEED_LIMIT, source);
            } else if (errorCorewords.length > 0) {
                // 用于存储添加失败的重点词
                var errorWordIdList = [];
                for(var i = errorCorewords.length; i --;){
                    errorWordIdList.push(+errorCorewords[i].winfoid);
                }

                // 初始化添加成功的重点词
                var addSuccessWordIdList = getSuccessWinfoids(errorWordIdList, wordIdList);

                if (addSuccessWordIdList.length > 0) {
                    // 如果添加成功的词不为0，也发送成功的监控和事件
                    this.publish(Coreword.ADD_SUCCESS,
                        addSuccessWordIdList, errorCorewords, source);

                    // 发送添加重点词成功的监控
                    M.addCorewords(addSuccessWordIdList, source);
                } else {
                    // 发送全部添加失败的事件，这是由于添加的重点词已被删除或者已经是重点词造成
                    this.publish(Coreword.ADD_FAIL, wordIdList,
                        Coreword.MOD_FAIL_TYPE.WORD_DEL_ADD, source);
                }
            }
        },
        addFail: function(wordIdList, source, json) {
            // 第三个参数null为未设失败类型，默认是网络异常400或服务端错误500等其它情况
            this.publish(Coreword.ADD_FAIL, wordIdList, null, source);
        },
        /**
         * 取消重点词的关注
         * @method del
         * @param {Array} wordIdList 要取消关注的重点词ID List
         */
        del: function(wordIdList) {
            if (!this.isValidate(wordIdList)) {
                return;
            }

            var me = this;
            // NOTICE: 如果有要添加的词已经被删除直接返回失败的status，这跟其它接口不一样
            // 不存在部分成功的情况！
            fbs.nikon.delCoreWords({
                winfoids : wordIdList,
                onSuccess : bind(me.delSuccess, me, wordIdList),
                onFail : bind(me.delFail, me, wordIdList)
            });
        },
        delSuccess: function(wordIdList, json) {
            this.publish(Coreword.DEL_SUCCESS, wordIdList);
        },
        delFail: function(wordIdList, json) {
            this.publish(Coreword.DEL_FAIL, wordIdList);
        }
    };

    // 继承Pub/Sub接口
    baidu.extend(Coreword.prototype, nirvana.listener);

    return Coreword;
}($$, nirvana);


