/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/corewords/Coreword.js
 * desc: 重点词排名包的重点词详情模型
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/05 $
 */

/**
 * 重点词排名包的重点词详情模型
 * @class Coreword
 * @namespace nirvana.aopkg
 */
nirvana.aopkg.CorewordDetail = function($, nirvana, Store) {
    /**
     * 重点词详情模型构造函数
     * @constructor
     */
    function CorewordDetail() {
    }

    /**
     * 数据变化事件常量定义
     * @property DATA_CHANGE
     * @type {string}
     * @const
     */
    CorewordDetail.DATA_CHANGE = '_data_change';

    /**
     * 重点词展现位置常量定义
     */
    CorewordDetail.DISPLAY_POSITION = {
        0: '不在左侧',
        //'left': '左侧第',
        '-2': '未在该地域投放',
        '-3': '没有有效创意',
        '-1': '--'
    };

    /**
     * 重点词过滤类型常量定义
     */
    CorewordDetail.COREWORD_FILTER = {
        ALL: 1, // 全部
        BUDGET_INSUFFICIENT: 2, // 预算不足
        NOT_IN_LEFT: 3, // 不在左侧
        QUALITY_LOW: 4, // 质量度过低
        SEARCH_INVALID: 5, // 搜索无效
        SEARCH_LOW: 6, // 检索量过低
        RANK_DWON: 7 // 排名下降
    };

    var FILTER_TYPE = CorewordDetail.COREWORD_FILTER;

    CorewordDetail.prototype = {
        /**
         * 从服务端请求重点词详细信息的数据
         * @method load
         */
        load: function() {
            var me = this;
            // 初始化地域信息,默认-1，服务端将返回默认的地域
            me.doRequest(me._selRegionId);
        },
        /**
         * 执行重点词详情的请求任务
         * @private
         */
        doRequest: function(selRegionId, winfoIdList, isAppend) {
            var me = this,
                bindContext = nirvana.util.bind;

            // 初始化地域信息,默认-1，服务端将返回默认的地域
            selRegionId = selRegionId || '-1';

            var param = {
                wregion: String(selRegionId),
                onSuccess: bindContext(me.successHandler, me, isAppend),
                onFail: bindContext(me.failHandler, me, isAppend)
            };

            param.condition = {
                pkgContext: nirvana.aoPkgControl.logCenter.pkgContext,
                actionStep: nirvana.aoPkgControl.logCenter.actionStep
            };

            if (winfoIdList && winfoIdList.length > 0) {
                param.condition.winfoid = winfoIdList.join(',');
            }

            // 发送数据请求，接口定义{@link baseService/aoPackage.js}
            fbs.nikon.getPackageCoreWordDetail(param);
        },
        /**
         * 添加重点词详情
         * @method add
         * @param {Array} addWinfoIdList 要添加的重点词winfoid列表
         */
        add: function(addWinfoIdList) {
            this.doRequest(this._selRegionId, addWinfoIdList, true);
        },
        /**
         * 移除给定的winfoId列表所对应的重点词详情
         * @method remove
         * @param {Array} winfoIdList 要移除的重点词winfoid列表
         */
        remove: function(winfoIdList) {
            if (!this._corewordArr || winfoIdList.length == 0) {
                return;
            }

            var currData = this._corewordArr,
                len = winfoIdList.length,
                len2 = currData.length,
                toRemoveData = [];

            for (var i = 0; i < len; i ++) {
                for (var j = 0; j < len2; j ++) {
                    if (currData[j].winfoid == winfoIdList[i]) {
                        toRemoveData.push(currData[j]);
                        currData.splice(j, 1);
                        len2 --;
                        break;
                    }
                }
            }

            // 从缓存中移除修改过重点词信息
            Store.remove(winfoIdList);

            // 更新过滤信息
            nirvana.corewordUtil.updateCorewordFilterInfo(
                this._filterInfo, toRemoveData, true);
        },
        /**
         * 根据给定的重点词的winfoid查找缓存的重点词数据，返回找到的重点词对象，未找到返回null
         * @method getCoreword
         * @param {String|Number} winfoid 要查找的重点词的winfoid
         * @return {Object} 重点词数据对象
         */
        getCoreword: function(winfoid) {
            var kwDataArr = this._corewordArr;

            for (var i = 0, len = kwDataArr.length; i < len; i ++) {
                if (kwDataArr[i].winfoid == winfoid) {
                    return kwDataArr[i];
                }
            }

            return null;
        },
        /**
         * 对重点词进行筛选，根据当前筛选条件
         * @method filter
         * @param {Array} 未过滤前的原始的重点词数据
         * @return {Array} 过滤后的重点词数据
         */
        filter: function(filterType) {
            var me = this,
                data = me._corewordArr;

            var filterResults = [];

            // 过滤类型为全部，不进行过滤
            if (FILTER_TYPE.ALL == filterType) {
                Array.prototype.push.apply(filterResults, data);
            }
            else {
                var num = 0,
                    isMatch = nirvana.corewordUtil.isMatchFilterType;
                for (var i = 0, len = data.length; i < len; i ++) {
                    // 判断重点词是否满足当前的过滤类型
                    if (isMatch(data[i], filterType)) {
                        filterResults[num ++] = data[i];
                    }
                }
            }

            return filterResults;
        },
        /**
         * 判断给定的过滤类型包含的重点词数量是不是空的
         * @method isEmpty
         * @param {number} filterType 见过滤类型常量定义
         * @return {boolean}
         */
        isEmpty: function(filterType) {
            return this._filterInfo[filterType] == 0;
        },
        /**
         * 更新展现的地域，将导致重新加载给定地域投放的重点词详情
         * @method updateRegion
         * @param {number} regionId 要展现的地域ID
         */
        updateRegion: function(regionId) {
            this._selRegionId = regionId;
            this.load();
        },
        /**
         * 请求重点词详情的成功的处理
         * @param {Object} result 响应的数据对象
         */
        successHandler: function(isAppend, result) {
            // 处理响应返回的数据
            this.processData(result.data, isAppend);
        },
        /**
         * 请求重点词详情的失败的处理
         */
        failHandler: function(isAppend, result) {
            this.publish(nirvana.listener.LOAD_FAIL);
            var existedData = this._corewordArr;
            if (!existedData || existedData.length <= 0) {
                this.processData(result.data || {}, isAppend);
            }
        },
        /**
         * 处理返回的重点词详细信息数据
         * @param {Object} result
         */
        processData: function(result, isAppend) {
            var me = this;

            // 对数据进行预处理
            me.preprocessData(result);

            var corewordArr;
            // 追加只对当前重点词不为空的情况下，没有重点词本质上就等于重新初始化
            if (isAppend && me._corewordArr && me._corewordArr.length) {
                corewordArr = me.appendData(result);
            } else {
                isAppend = false;
                me.initData(result);
                corewordArr = me._corewordArr;
                // 更新存储的诊断时间
                Store.update(me._basicInfo.currentwregion, me._basicInfo.proctime);
            }

            me.publish(CorewordDetail.DATA_CHANGE,
                me._basicInfo, me._filterInfo, corewordArr, isAppend);
        },
        /**
         * 在原有数据的基础上append新的数据结果
         * @private
         */
        appendData: function(result) {
            var me = this;
            var appendWords = result.detailresitems;

            // 将追加的词附加到原有重点词的开始位置，出于显示的需要
            Array.prototype.unshift.apply(me._corewordArr, appendWords);

            // 添加投放地域列表
            me.addRegionList(result.commData.wregionlist || []);
            // 重新初始化过滤信息
            me.initFilterInfo();

            return appendWords;
        },
        /**
         * 添加新的地域列表到已有的地域列表
         * @private
         */
        addRegionList: function(regionList) {
            var currRegionList = this._basicInfo.wregionlist;
            var toAddRegionList = [];
            for (var i = 0, len = regionList.length; i < len; i ++) {
                if (baidu.array.indexOf(currRegionList, regionList[i]) == -1) {
                    toAddRegionList.push(regionList[i]);
                }
            }
            Array.prototype.push.apply(currRegionList, toAddRegionList);
        },
        /**
         * 重新初始化重点词详情信息
         * @private
         */
        initData: function(result) {
            var me = this;

            // 缓存获取的重点词列表
            me._corewordArr = result.detailresitems;
            // 初始化过滤信息
            me.initFilterInfo();
            // 缓存重点词其它基本信息
            me._basicInfo = result.commData;
            // 重置当前选择的地域
            me._selRegionId = me._basicInfo.currentwregion;
        },
        /**
         * 初始化重点词的分析筛选信息
         * @private
         */
        initFilterInfo: function() {
            // 统计分析筛选各个类别的数量
            var filterTypeNumMap = nirvana.corewordUtil.
                initCorewordFilterInfo(this._corewordArr);

            // 缓存重点词过滤信息
            this._filterInfo = filterTypeNumMap;
        },
        /**
         * 获取重点词详情的分析筛选信息
         * @method getFilterInfo
         * @return {Object}
         */
        getFilterInfo: function() {
            return this._filterInfo || {};
        },
        /**
         * 获取当前选择的地域Id
         * @method getSelectRegionId
         * @return {number|string}
         */
        getSelectRegionId: function() {
            return this._selRegionId;
        },
        /**
         * 获取可用的展现地域列表
         * @method getRegionIdList
         * @return {Array}
         */
        getRegionIdList: function() {
            if (this._basicInfo) {
                return this._basicInfo.wregionlist || [];
            } else {
                return [];
            }
        },
        /**
         * 获取诊断时间
         * @method getDiagnosisTime
         * @return {number}
         */
        getDiagnosisTime: function() {
            if (this._basicInfo) {
                return + this._basicInfo.proctime || 0;
            }
            return 0;
        },
        /**
         * 获取重点词的数量
         * @return {number}
         */
        getCorewordNum: function() {
            if (this._corewordArr) {
                return this._corewordArr.length;
            }
            return 0;
        },
        /**
         * 获取重点词详情列表
         * @return {Array}
         */
        getCoreWordDetails: function() {
            return this._corewordArr || [];
        },
        /**
         * 对数据进行预处理
         * @param {Object} data 要被处理的数据对象
         */
        preprocessData: function(data) {
            var me = this,
            // 返回的重点词数量
                totalNum = data.totalnum,
                commData,
                coreWordsArr,
                newCoreWordArr= [],
                utils = nirvana.corewordUtil,
                word;

            // 判断重点词是否为空
            if (!totalNum) {
                // 重新初始化返回的数据，避免后面逻辑null判断
                data.commData = {};
                data.detailresitems = [];
            }

            commData = data.commData;
            coreWordsArr = data.detailresitems;

            for (var i = 0, len = coreWordsArr.length; i < len; i ++) {
                word = coreWordsArr[i].data;
                // 根据noshowreason计算重点词状态
                word.wordstat = utils.getWordState(word);

                newCoreWordArr[i] = word;
            }

            // 预处理当前选择的地域列表，将字符串转成数组
            if (commData.wregionlist) {
                commData.wregionlist = baidu.json.parse(commData.wregionlist);
            }

            // 将'data'属性去掉，避免数据访问不便，
            // 原来得detailresitems[i].data来获取word详情，现在只需detailresitems[i]
            data.detailresitems = newCoreWordArr;
        },
        /**
         * 销毁重点词详情实例
         * @method dispose
         */
        dispose: function() {
            this._corewordArr && (this._corewordArr.length = 0);
            this._filterInfo = null;
            this._basicInfo = null;
        }
    };

    // 继承Pub/Sub接口
//    baidu.inherits(CorewordDetail, nirvana.EventListener);
    baidu.extend(CorewordDetail.prototype, nirvana.listener);

    return CorewordDetail;
}($$, nirvana, nirvana.aopkg.CorewordStorage);
