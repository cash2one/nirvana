/**
 * @file src/module/fuseSuggestion/actionAdapter.js 融合主模块动作控制器
    智能优化融入推广管理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */


nirvana.fuseSuggestion.actionAdapter = (function() {

    // @requires 输入

    var config = nirvana.fuseSuggestion.config;

    // require tangram as baidu
    var util = nirvana.util;
    // require bizView
    var bizView = nirvana.bizView;
    var dataAdapter = nirvana.fuseSuggestion.dataAdapter;

    // require core.service as fbs

    // 定义输出
    var exports = {};

    /**
     * 更新当前物料的详情，for UI Table
     * @param {string} itemId 物料id
     * @param {Object} params 信息
        {
            cacheData: {Object?}, // 缓存数据，存在时更新当前层级当前物料的缓存
            levelinfo: {string}, // 层级信息
            optsug: {Object}, // 新的建议信息
                {
                    data: {Object},
                    reason: {number},
                    suggestion: {number}
                }
            callback: {Function=} 回调函数，当前在FuseItem中是更新ui.Table对应的数据及自身[fuseItem实例]的数据
        }
     */
    function updateSuggestion(itemId, params) {
        var levelinfo = params.levelinfo;
        var idKey = config.itemIdofLevel[levelinfo];

        if(params.cacheData
            && baidu.lang.isObject(params.cacheData) // 必须得是Object
            && baidu.lang.isObject(params.cacheData[itemId]) // 并且格式正确，值存在
        ) {
            fbs.material.ModCache(
                config.fullLevelStr[levelinfo],
                idKey,
                params.cacheData
            );
        }

        if(baidu.lang.isFunction(params.callback)) {
            params.callback(params);
        }
        // showNoSuggestionAlert();
    }

    /**
     * 对“暴露的执行命令接口”进行参数检查
     *
     * @param {string} command 命令
     * @param {Object} params 参数
            {
                levelinfo: {string} 操作层级信息, 
                item: {Object} 当前行或者元素的数据信息,
            callback: {Function=} 回调函数，当前在FuseItem中是更新ui.Table对应的数据及自身[fuseItem实例]的数据
            }
     */
    function preCheck(command, params) {
        if(!command || !baidu.lang.isString(command)) {
            util.logError('invalid command for excuteAction');
            return false;
        }

        if(command.split('.').length !== 2) {
            // 当前只认为2级命令是合法的
            util.logError('invalid command for excuteAction');
            return false;
        }

        var item = params.item;
        if(!params
            || !baidu.lang.isString(params.levelinfo)
            || !baidu.lang.isObject(item)
            || (params.callback && !baidu.lang.isFunction(params.callback))) {
            util.logError('invalid params for excuteAction');
            return false;
        }


        if(!item.optsug
            || !item.optsug.suggestion
            || !item.optsug.reason) {
            util.logError('invalid optsug data for excuteAction');
            return false;
        }

        return true;
    }

    /**
     * 对外暴露的接口，用于执行命令，调用业务模块
        当前只支持单个item的处理，没必要支持多个！
     * @param {string} command 命令
     * @param {Object} params 参数
            {
                levelinfo: {string} 融合建议的层级信息
                    根据其确定id的key、值等，并通过其及item验证建议正确性
                item: {Object} 当前行或者元素的数据信息,,
                timespan: { // {Object} 时间段 
                    starttime: {string} yyyy-MM-dd
                    endtime: {string} yyyy-MM-dd
                },
                callback: {Function=} 回调函数，当前在FuseItem中是更新ui.Table对应的数据及自身[fuseItem实例]的数据
            }
     */
    exports.executeAction = function(command, params) {

        // for debug
        // 先检查参数是否合法
        if(!preCheck(command, params)) {
            return;
        }

        // 一些参数的处理，处理默认
        var levelinfo = params.levelinfo;
        var idKey = config.itemIdofLevel[levelinfo];
        var item = params.item;

        // 标记不要进行全局刷新
        // 这个鬼东西是因为应RD要求，尽可能减少全局的刷新建议带来的压力
        // 因此如果出现这个标记时
        // 在页面repaint之后的状态更新时只会去更新表格中的当前行数据
        nirvana.fuseSuggestion.noNeedRefreshAll = true;

        // 执行之前先获取一次当前的建议信息
        // 如果没有建议了，就不去修改详情了
        // 如果有建议，再进入详情修改界面
        var reqParams = {
            level: config.fullLevelStr[levelinfo],
            needMtlInfo: true,
            sugReqItems: [],
            timeout: config.DEFAULT.timeout
        };

        // 开始灌入请求数据，主要根据item及层级的信息
        var reqItem = {
            reason: item.optsug.reason,
            suggestion: item.optsug.suggestion
        };

        // 当前层级的id
        reqItem[idKey] = item[idKey];

        // 融合1.0，在获取建议时，还要填充父层级的id, so...
        switch(levelinfo) {
            case 'idea':
            case 'word':
                reqItem.unitid = item.unitid;
                reqItem.planid = item.planid;
                // 其实不用break会更简洁，但是第一会迷糊，第二jshint不给过
                break;
            case 'unit':
                reqItem.planid = item.planid;
                break;
        }
        reqParams.sugReqItems.push(reqItem);

        reqParams.onSuccess = getSuggestionSuccess(command, params);

        reqParams.onFail = function() {
            ajaxFailDialog();
        };
        reqParams.onTimeout = function() {
            ajaxFailDialog();
        };

        fbs.fuseSuggestion.getSuggestion(reqParams);
    };


    /**
     * 执行命令之前先获取当前建议
     * 当前的主要行为是：
            检查该条物料的最新建议信息
            如果OK，才进入详情的界面
            否则修改缓存，更新视图，并且执行callback回调，即修改ui.Table的数据
     
     * @param {string} command 命令
     * @param {Object} 参数 params
        {
            levelinfo: {string} 操作层级信息
            item: {Object} 当前行或者元素的数据信息
            timespan: { // {Object} 时间段 
                starttime: {string} yyyy-MM-dd
                endtime: {string} yyyy-MM-dd
            },
            callback: {Function=} 回调函数，当前在FuseItem中是更新ui.Table对应的数据及自身[fuseItem实例]的数据
        }
         
     */
    function getSuggestionSuccess(command, params) {
        // 匿名函数，就不做参数检查了

        // 一些参数的处理，处理默认
        var levelinfo = params.levelinfo;
        var idKey = config.itemIdofLevel[levelinfo];
        var origItemId = params.item[idKey];
        var callback = params.callback;
        var timespan = baidu.object.clone(params.timespan);
        var origOptsug = baidu.object.clone(params.item.optsug);

        return function(response) {
            // 事实上，只处理一个物料，so ……
            if(response && response.data && response.data[origItemId]) {
                var resOptsug = response.data[origItemId];
                // 匹配检查
                if(!resOptsug // 说明获取的物料建议数据在返回中不存在，
                    || resOptsug.suggestion != origOptsug.suggestion // 建议有更新
                    || resOptsug.reason != origOptsug.reason) { // 建议有更新
                    updateSuggestion(origItemId, {
                        levelinfo: levelinfo,
                        optsug: resOptsug,
                        callback: callback, // callback要继续带入
                        needRefresh: false,
                        message: '建议可能有更新，已经重新获取！'
                    });
                    return;
                }
                else {
                    // 执行命令，打开详情
                    doExecuteAction(command, {
                        levelinfo: levelinfo,
                        optsug: resOptsug,  // 在返回的data中应当已经包含了必要数据，see详设区分suggestion的描述
                        timespan: timespan,
                        callback: callback // callback要继续带入
                    });
                }
            }
            else { // 说明返回的数据不正确，这时当做没建议处理了，但是要提示用户
                updateSuggestion(origItemId, {
                    levelinfo: levelinfo,
                    optsug: null, // 直接配置为空……
                    callback: callback, // callback要继续带入
                    needRefresh: false,
                    message: '获取建议时出现异常，建议刷新重试。'
                });
                return;
            }
        };
    }

    /**
     * 根据传入的数据，实际的执行命令
     *
     * @param {string} command 命令
     * @param {Object} actionData 命令数据
        {
            levelinfo: {string}, // 当前层级信息
            optsug: { // {Object} 数据信息 it's response.data[itemId].optsug from getSuggestion
                data: {Object},
                reason: {number},
                suggestion: {number}
            },
            timespan: {Object}
            callback: {Function=} 回调函数，当前在FuseItem中是更新ui.Table对应的数据
        }
     */
    function doExecuteAction(command, actionData) {

        // 匿名函数，就不做参数检查了，而且正常调用的话已经检查过了

        // 分析命令
        var cmdLevel, cmdAction;
        var commandArr = command.split('.');

        // 当前只支持2级命令，其他会被认为非法
        switch(commandArr.length) {
            case 2: // as [cmdLevel][cmdAction]
                cmdLevel = commandArr[0];
                cmdAction = commandArr[1];
                break;
        }


        // 数据预处理，处理detailData
        // 转换为bizView通用格式，并且添加必要的参数数据
        var processedData = dataAdapter.getBizViewData(
            command,
            actionData
        );
        var condition = dataAdapter.getBizViewCondition(
            command,
            actionData
        );


        var actionParam = {
            entrance: 'fuseSuggestion',
            // for View界面的数据，View是支持多数据处理的
            data: processedData,  // 有可能需要单独处理
            // 自定义行为或配置
            custom: {
                isNoRequest: true // 默认不去请求，而是使用传入的数据
            },
            // 浮出层ui.Dialog的自定义配置
            dialog: {},
            // 数据的condition
            condition: condition,
            // 详情修改保存成功之后的回调处理
            onSave: getDetailSavedHandler(command, actionData),
            onCancel: new Function()
        };

        // 不同命令的各异配置
        switch(command) {
            case 'plan.schedule':
                // 时段，有推荐时段和分析
                actionParam.custom.hasAnalyze = true;
                break;
            case 'unit.noEffectIdeaList':
                // 查看单元无生效创意列表的时候，需要请求了
                actionParam.custom.isNoRequest = false;
                break;
            case 'idea.add':
                // 添加创意时，计划单元不能改
                actionParam.custom.isChangeable = false;
                break;
            case 'idea.modify':
                break;
            case 'idea.modasnew':
                cmdAction = 'modify';
                // 使用三个按钮的模式，并且突出新增按钮
                actionParam.dialog.type = 'saveas';
                actionParam.dialog.highsaveas = true;
                break;
            case 'word.bid':
                // 修改关键词出价，使用新界面
                actionParam.custom.isNewView = true;
                break;
        }

        // 这里准备进入到详情修改界面了

        var func = bizView[cmdLevel][cmdAction];
        if(func && baidu.lang.isFunction(func)) {
            func(actionParam);
        }
        else {
            util.logError('Can not found any method'
                + ' matching the processed command'
                + ' [' + command + '].');
            return;
        }
    }

    /**
     * 详情修改保存成功之后的回调处理
     * 当前的主要行为是：
            首先重新获取当前物料的信息，使用GET/material，【包含optsug】
            修改前端相关缓存
            执行callback回调，即修改ui.Table的数据，以及fuseItem实例的数据

            数据界面刷新机制：
                之前使用了fuseSuggestion.noNeedRefreshAll = true;标记不进行全局刷新
                因此这里是单行刷新，在更新过缓存及ui.Table中的数据之后
                直接调用fuseItem实例的update方法即可
                不需要使用er.controller.fireMain('reload')

     * @param {string} command 命令，传入是为了以后有可能区分命令执行不同的回调？？
     * @param {Object} actionData 命令数据
        {
            levelinfo: {string}, // 当前层级信息
            optsug: { // {Object} 数据信息 it's response.data[itemId].optsug from getSuggestion
                data: {Object},
                reason: {number},
                suggestion: {number}
            },
            timespan: { // {Object} 时间段 
                starttime: {string} yyyy-MM-dd
                endtime: {string} yyyy-MM-dd
            },
            callback: {Function=} 回调函数，当前在FuseItem中是更新ui.Table对应的数据及自身[fuseItem实例]的数据
        }
     */
    function getDetailSavedHandler(command, params) {
        // 一些参数的处理，处理默认
        var levelinfo = params.levelinfo;
        var optsug = baidu.object.clone(params.optsug);
        var callback = params.callback;
        var starttime = params.timespan.starttime;
        var endtime = params.timespan.endtime;
        var idKey = config.itemIdofLevel[levelinfo];
        var itemId = optsug.data[idKey];

        /**
         * @param {Object=} actionReturnData 详情操作成功之后回调函数中传入的数据
         *
            for budget:
                {
                    bgttype : {number},
                    oldtype : {number},
                    newvalue : {number},
                    oldvalue : {number}
                }
            for bid:
                {
                    oldvalue: {number},
                    newvalue: {number}
                }
         */
        return function(actionReturnData) {

            // 修改缓存呃
            var params4Cache = {
                condition:{},
                nocache: true, // 本次请求不需要缓存，强制声明一下
                onSuccess: function(response) {
                    if(response && response.data
                        && response.data.listData
                        && response.data.listData.length > 0) {

                        var itemData = response.data.listData[0];
                        if(itemData[idKey] != itemId) {
                            util.logError('response data\'s '
                                + idKey
                                + ' is not matching'
                                + ' to the request param.');
                            return;
                        }

                        // 主要是进行了缓存修改
                        // 注意，是修改
                        // 融合跟其他的物料修改稍有不同
                        // 因为物料修改的缓存更新自己会去做
                        // 在这里只是对融合自己的缓存进行修改
                        // 即：只对当前层级的当前物料进行数据更新
                        // 一般都是没必要的…… 不过多做一次没什么不好

                        var cacheData4mod = {};

                        cacheData4mod[itemId] = itemData;

                        // 更新建议信息
                        updateSuggestion(itemId, {
                            cacheData: cacheData4mod,
                            levelinfo: levelinfo,
                            optsug: itemData.optsug,
                            oldOptsug: optsug,
                            actionReturnData: actionReturnData,
                            callback: callback // callback要继续带入
                        });
                    }
                    else {
                        // 数据有异常，当做没建议处理
                        updateSuggestion(itemId, {
                            levelinfo: levelinfo,
                            optsug: null,
                            callback: callback // callback要继续带入
                        });
                    }
                    // console.log(modCacheData);
                },
                onFail: function() {
                    // 请求失败…… 呃，当做没建议处理
                    // 最好提示一下用户：待会儿刷新重试一下
                    updateSuggestion(itemId, {
                        levelinfo: levelinfo,
                        optsug: null,
                        callback: callback // callback要继续带入
                    });
                },
                timeout: config.DEFAULT.timeout, // default 5s
                onTimeout: function() {
                    // 请求超时…… 呃，当做没建议处理
                    // 最好提示一下用户：待会儿刷新重试一下
                    updateSuggestion(itemId, {
                        levelinfo: levelinfo,
                        optsug: null,
                        callback: callback // callback要继续带入
                    });
                }
            };
            params4Cache.condition[idKey] = [itemId];

            if(starttime && endtime) {
                params4Cache.starttime = starttime;
                params4Cache.endtime = endtime;
            }

            var fieldsArr = baidu.object.clone(nirvana.manage.UserDefine.attrAll[levelinfo]);
            // 补充planid、unitid这种的id field
            fieldsArr.push(idKey);
            // 创意层级 有一个坑爹的东西，就是不能有idea，so
            if(levelinfo == 'idea') {
                baidu.array.remove(fieldsArr, 'idea');
            }

            fbs.material.getAttribute(
                config.fullLevelStr[levelinfo],
                fieldsArr,
                params4Cache
            );
        };
    }


    return exports;
})();