/**
 * @file src/module/fuseSuggestion/controller.js 融合主模块控制器，供调用
    智能优化融入推广管理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */


nirvana.fuseSuggestion.controller = (function() {
    // a short namespace
    var me = nirvana.fuseSuggestion;

    // @requires 输入
    var config = me.config;

    // sizzle => $$
    // tangram => baidu
    var util = nirvana.util;

    // 定义输出
    var exports = {};


    /**
     * 初始化配置中的每一个reason对应的电池颜色
     */
    function initColors() {
        // 默认值
        for(var key in config.LANG.REASON) {
            if('undefined' == typeof config.batteryColorOfReason[key]) {
                config.batteryColorOfReason[key] = config.DEFAULT.batteryColor;
            }
        }
    }
    initColors();


    /**
     * 向后端发送请求修改收起/展开的状态
     * @param {number} value 0/1
     */
    function modHideOpenStat(value) {
        fbs.fuseSuggestion.modHideopenStat({
            type: 66,
            value: value,
            callback: function() {}
        });
    }

    /**
     * 判断是否有权限
     */
    function hasAuth() {
        return nirvana.auth.isFuseSugExp();
    }

    /**
     * 点击事件处理
     */
    function clickHandler(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;

        var action = baidu.dom.getAttr(target, 'action');
        switch(action) {
            case 'fusesug-unfoldall':
                modHideOpenStat(1);
                fs.unfoldAll();
                break;
            case 'fusesug-foldall':
                modHideOpenStat(0);
                fs.foldAll();
                break;
        }
    }

    // 使用单件
    var fs = new me.FuseSuggestion();

    /**
     * 初始化 用于进行初始化融合主控制器
     * @param {string} levelinfo 层级信息：plan/unit/idea/keyword/monitor,
     * @param {Object} timespan: { // 时间段 
            starttime: {string} yyyy-MM-dd
            endtime: {string} yyyy-MM-dd
        }
     * @param {Object} tableFields 要修改的ui.Table的fields信息
     * @param {Function} callback 回调
     */
    exports.init = function(levelinfo, timespan, callback) {
        if(!levelinfo || !baidu.lang.isString(levelinfo)
            || (callback && !baidu.lang.isFunction(callback))) {
            util.logError('invalid params occurred'
                + ' when trying to init the controller of FuseSuggestion'
                + ' for level' + levelinfo);
            return;
        }

        // 如果没有权限的话，不去执行下面的任何逻辑了
        if(!hasAuth()) {
            callback();
            return;
        }

        // 保存层级信息
        fs.levelinfo = levelinfo;
        fs.timespan = timespan;

        // 请求展开/收起状态
        var param = {
            typeset: [66], // 小辉说融合目前只有(以后的2.0+?)66，为了跟其他的展开收起区分
            onSuccess: function(response) {
                var data = response.data || {};
                if(+data['66'] > -1) {
                    fs.viewStatus = config.viewStatusName[+data['66']];
                }
                extendMaterialInfo(callback);
            },
            // 失败，使用默认的状态，fs.viewStatus默认为config.DEFAULT.viewStatus
            onFail: function() {
                extendMaterialInfo(callback);
            },
            timeout: config.DEFAULT.timeout,
            // 超时，使用默认的状态，fs.viewStatus默认为config.DEFAULT.viewStatus
            onTimeout: function() {
                extendMaterialInfo(callback);
            }
        };
        fbs.fuseSuggestion.getHideopenStat(param);
    };


    /**
     * 在“表格”去获取数据之前，先扩展表格列、自定义列等信息
     * @param {Function} callback 回调
     */
    function extendMaterialInfo(callback) {
        var levelinfo = fs.levelinfo;
        if(!hasAuth()) {
            callback();
            return;
        }

        var idKey = config.itemIdofLevel[levelinfo];

        // 每次都清空fs的监听者，渲染表格时会重新灌入
        fs.observers = {};

        // 更新表格列
        var fields = nirvana.manage[levelinfo + 'TableField'];

        if(fields && !fields.optsug) {
            fields.optsug = {
                content: function(item, index) {
                    var table = ui.util.get(levelinfo + 'TableList');
                    var itemId = item[idKey];
                    var fuseItemIdKey = levelinfo + '_' + itemId;
                    var optionsData = {
                        data: item,
                        viewStatus: fs.viewStatus,
                        containerId: table.getBodyCellId(index, 2),
                        index: index,
                        levelinfo: levelinfo,
                        timespan: fs.timespan
                    };
                    if(!fs.observers[fuseItemIdKey]) {
                        var fuseitem = new me.FuseItem(optionsData);
                        fs.observers[fuseItemIdKey] = fuseitem;
                    }
                    else {
                        fs.observers[fuseItemIdKey].init(optionsData);
                    }

                    // return fs.observers[fuseItemIdKey].getContent();
                    // return '<span class="fusesug-loading-inline">&nbsp;</span>';
                    return '<span class="fusesug-loading-inline">更新中...</span>';
                },
                title: fs.getTitle(),
                align: 'left',
                field : 'optsug',
                width: config.DEFAULT.width[fs.viewStatus],
                minWidth: config.DEFAULT.width[fs.viewStatus],
                stable: true
            };
        }


        // 更新自定义列
        var udlist = nirvana.manage.UserDefine.getConfig(levelinfo);
        if(baidu.array.indexOf(udlist.all, 'optsug') == -1) {
            udlist.defaultCol.splice(1, 0, "optsug");
            udlist.all.splice(1, 0, "optsug");
            // udlist.show.push({key:"optsug", text:"优化"});
            var len = udlist.show.length;
            var i, j;
            var temparr = [];
            var adddata = {key:"optsug", text:"优化"};

            for(i = 0; i < len; i += 2) {
                temparr.push(baidu.object.clone(udlist.show[i]));
            }
            temparr.splice(1, 0, adddata);
            for(i = 1; i < len; i += 2) {
                temparr.push(baidu.object.clone(udlist.show[i]));
            }
            udlist.show = [];

            len = temparr.length;
            for(i = 0, j = 0; j < Math.ceil(len / 2); i += 2, j++) {
                udlist.show[i] = temparr[j];
            }
            for(i = 1; j < len; i += 2, j++) {
                udlist.show[i] = temparr[j];
            }
        }
        nirvana.manage.UserDefine.setConfig(levelinfo, udlist);

        // // idea有些特殊，因此，请求的时候直接用的是IDEA_REQUEST_FEILD
        // // 没有按照自定义列调整，因此需要进行修改
        // if(baidu.array.indexOf(IDEA_REQUEST_FEILD, 'optsug') == -1) {
        //     IDEA_REQUEST_FEILD.splice(1, 0, 'optsug');
        // }

        if(baidu.lang.isFunction) {
            callback();
        }
    }


    /**
     * 刷新状态+事件绑定
     * @param {(HtmlElement | string)} 待刷新的容器…… 现在的话就是物料列表Table
     */
    exports.update = function(target) {
        var self = this;

        if(!hasAuth()) {
            return;
        }

        var levelinfo = fs.levelinfo;
        var table = ui.util.get(levelinfo + 'TableList');
        var tableData = table.datasource || [];

        // 创意层级当前有点问题，就是无论如何，只要refresh都会重新请求数据，并覆盖了table的数据
        if(!me.noNeedRefreshAll || levelinfo === 'idea') {
            // 但是，如果当前的表格列中没有optsug，即自定义列中取消了勾选，则不刷新
            var attrList = nirvana.manage.UserDefine.attrList[levelinfo];
            if(!attrList || baidu.array.indexOf(attrList, 'optsug') == -1) {
                // self.updateView(target);
                return;
            }

            // 20130321 即时更新融合建议列optsug
            var condition = {};
            var idKey = config.itemIdofLevel[levelinfo];
            condition[idKey] = [];
            var i = 0, l = tableData.length;
            for(; i < l; i++) {
                condition[idKey].push(tableData[i][idKey]);
            }

            fbs.material.getAttribute(levelinfo + 'info', ['optsug', idKey], {
                nocache: true,
                timeout: config.DEFAULT.timeout,
                condition: condition,
                callback: function(res){
                    var newData;
                    if(res && res.data && res.data.listData) {
                        newData = res.data.listData;
                    }
                    else {
                        newData = [];
                    }
                    resetOptsugColsData(newData);
                    self.updateView(target);
                }
            });
        }
        else {
            me.noNeedRefreshAll = false;
            self.updateView(target);
        }
    };

    /**
     * 重置table的融合建议列的数据
     * @param {Array} data 新的数据
     */
    function resetOptsugColsData(data) {
        var levelinfo = fs.levelinfo;
        var table = ui.util.get(levelinfo + 'TableList');
        var idKey = config.itemIdofLevel[levelinfo];
        var i, j, l, tl;
        if(data && data.length > 0 && table) {
            // 更新当前的table的数据
            // 返回顺序随机，需要遍历
            for(i = 0, l = data.length; i < l; i++) {
                for(j = 0, tl = table.datasource.length; j < tl; j++) {
                    if(table.datasource[j][idKey] == data[i][idKey]) {
                        table.datasource[j].optsug = data[i].optsug;
                        break;
                    }
                }
            }
        }
        else {
            // 这是说明发生了错误了
            for(i = 0, l = table.datasource.length; i < l; i++) {
                table.datasource[i].optsug = {
                    data: null,
                    suggestion: 0,
                    reason: 0
                };
            }
        }
    }

    exports.updateView = function(target) {
        fs.refreshForUITable();

        if('string' == typeof target) {
            target = baidu.g(target);
        }
        if(target) {
            baidu.un(target, 'click', clickHandler);
            baidu.on(target, 'click', clickHandler);
        }
    };

    exports.cancelRequestFusefield = function(fields) {
        if(baidu.array.indexOf(fields, 'optsug') > -1) {
            baidu.array.remove(fields, 'optsug');
        }
    };

    return exports;

})();