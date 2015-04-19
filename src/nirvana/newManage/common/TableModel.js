/**
 * @file src/nirvana/newManage/common/TableModel.js
    核心功能涅槃-推广管理页 界面通用的列表数据类
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.newManage.TableModel = (function() {

    var util = nirvana.util;
    var config = nirvana.newManage.config;

    var status = config.STATUS.READYTOGO; // 状态标识
    var timestamp = null; // 唯一性标识，令请求在同一时间只存在一个

    /**
     * 推广管理页 - 界面通用的列表数据类
     * @constructor
     */
    function TableModel(options) {
        var options = options || {};
        util.deepExtend(this, options);
        // defauts
        this.pageSize = this.pageSize || config.DEFAULT.pageSize;
        this.pageNo = this.pageNo || 1;
        // 每次新声明的话，都重置
        this.resetByStatus();
        timestamp = (new Date()).valueOf();
    }

    /**
     * 前置检查
     */
    TableModel.prototype.preCheck = function() {
        if(!this.level || !config.levelMark[this.level]) {
            util.logError('The TableModel need a valid level.');
            return false;
        }
        // if(!this.fields 
        //     || !baidu.lang.isArray(this.fields)
        //     || this.fields.length === 0) {
        //     util.logError('The TableModel need a valid field list.');
        //     return false;
        // }
        return true;
    };

    // /**
    //  * 初始化
    //  */
    // TableModel.prototype.init = function() {
    //     if(!this.preCheck()) {
    //         return;
    //     }
    // };

    /**
     * 设置请求的字段列表
     */
    TableModel.prototype.setFieldList = function(value) {
        this.fields = value;
        return this;
    };

    TableModel.prototype.load = function(newOpts) {
        var me = this;

        if(newOpts.onSuccess) {
            this.onSuccess = newOpts.onSuccess;
            delete newOpts.onSuccess;
        }
        if(newOpts.onFail) {
            this.onFail = newOpts.onFail;
            delete newOpts.onFail;
        }
        if(newOpts.onTimeout) {
            this.onTimeout = newOpts.onTimeout;
            delete newOpts.onTimeout;
        }

        if(!me.preCheck()) {
            return;
        }

        if(status !== config.STATUS.READYTOGO) {
            me.resetByStatus();
        }
        // console.log('start:' + timestamp);

        var reqParam = {
            starttime: me.startTime,
            endtime: me.endTime,

            onSuccess: me.successHandler(timestamp),
            onFail: me.failHandler(timestamp),
            onTimeout: me.timeoutHandler(timestamp)
        };

        util.deepExtend(reqParam, newOpts);

        // console.log(reqParam);

        if(this.level == 'appendIdea') {
            fbs.appendIdea.getAppendIdeaList(reqParam);
        }
        else if(this.level == 'localIdea') {
            fbs.localIdea.getLocalIdeaList(reqParam);
        }
        else {
            fbs.material.getAttribute(
                config.levelMark[me.level], 
                me.fields, 
                reqParam
            );
        }

        
        status = config.STATUS.POLLING;
    };

    /**
     * 根据状态进行重置行为
     */
    TableModel.prototype.resetByStatus = function() {
        if(status !== config.STATUS.READYTOGO) {
            this.interuptRequest()
                .clear()
                .setStatus('READYTOGO');
        }
        else{
            this.clear()
                .setStatus('READYTOGO');
        }
        return this;
    };

    /**
     * 中断请求
        暂时没找到太合适的中断…… so. timestamp
     */
    TableModel.prototype.interuptRequest = function() {
        timestamp = (new Date()).valueOf();
        return this;
    };

    /**
     * 设置状态
     */
    TableModel.prototype.setStatus = function(value) {
        if('string' === typeof value) {
            status = config.STATUS[value];
        }
        else {
            status = value;
        }
        return this;
    };


    /**
     * 请求的返回处理
     */
    TableModel.prototype.successHandler = function(stamp) {
        var me = this;

        return function(response) {
            if(stamp !== timestamp) {
                // console.log('interupted:' + stamp);
                return;
            }
            // console.log('processed:' + stamp);
            if(baidu.lang.isFunction(me.onSuccess)) {
                me.onSuccess(response);
            }
            status = config.STATUS.FINISHED;
        };
    };
    TableModel.prototype.failHandler = function(stamp) {
        var me = this;

        return function(response) {
            if(stamp !== timestamp) {
                return;
            }
            if(baidu.lang.isFunction(me.onFail)) {
                me.onFail(response);
            }
            status = config.STATUS.FINISHED;
        };
    };
    TableModel.prototype.timeoutHandler = function(stamp) {
        var me = this;

        return function(response) {
            if(stamp !== timestamp) {
                return;
            }
            if(baidu.lang.isFunction(me.onTimeout)) {
                me.onTimeout(response);
            }
            status = config.STATUS.TIMEOUT;
        };
    };

    TableModel.prototype.clear = function() {
        return this;
    };

    return TableModel;
})();