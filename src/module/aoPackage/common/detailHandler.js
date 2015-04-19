
/**
 * 优化项详情操作方法
 */
nirvana.aoPkgControl.widget.handle = {
    // 保存传入的详情action
    action : {},

    /**
     * 传入action
     * @param {Action} action
     */
    init : function(action) {
        this.action = action;
    },

    /**
     * 基础监听事件
     * 翻页，返回上一级等
     * @param {Action} action
     */
    basicClickHandler : function(action) {
        var me = this,
            controlMap = action._controlMap,
            table = controlMap.WidgetTable;

        //me.action = action;

        // 翻页
        controlMap.WidgetPage.onselect = me.getPageHandler();

        // 表格事件监听
        //lib.delegate.init(table.main, this);

        table.main.onclick = me.getTableHandler();
        //推词页有自己的onslect逻辑 	by mayue
        if (!action.addwordTable){
            table.onselect = me.selectListHandler();
        }
        // 先执行一次，判断按钮状态
        me.selectListHandler()();

        // 默认全选状态
        //table.selectAll(true);

        // 应用按钮
        controlMap.WidgetApply.onclick = me.getApply();

        me.changeTableColor();

        me.goBack(action);
    },

    /**
     * 翻页
     */
    getPageHandler : function() {
        var me = this,
            action = me.action;

        return function(value) {
            action.setContext('pageNo', value);

            me.refresh();

            // 这里必须return false，否则Page会报错
            return false;
        };
    },
    /**
     * 缓存推荐的提词的信息：推荐的出价、匹配、计划和单元
     * @param {Object} item
     * @private
     */
    _cacheRecmdInfo: function(item) {
        // 判断一下是否缓存过，这里用_xxx命名方式
        if (!item._cached) {
            var match;
            for (var k in item) {
                if (item.hasOwnProperty(k) && (match = /^(recm.*)/.exec(k))) {
                    item['_' + match[1]] = item[k];
                }
            }
            // 标识缓存过
            item._cached = true;
        }
    },

    /**
     * 表格事件监听
     */
    getTableHandler : function() {
        var me = this,
            action = me.action;

        return function (e) {
            var e = e || window.event,
                target = e.target || e.srcElement,
                index,
                item,
                data,
                type;

            while(target && target != ui.util.get('WidgetTable').main){

                if (baidu.dom.hasClass(target, 'edit_btn')) {
                    var current = nirvana.inline.currentLayer;

                    if (current && current.parentNode) {
                        current.parentNode.removeChild(current);
                    }
                    type = target.getAttribute('edittype');
                    index = nirvana.manage.getRowIndex(target);
                    item = ui.util.get("WidgetTable").datasource[index];

                    // 缓存推荐的词的信息，如果有的话 add by Huiyao 2013.1.15
                    me._cacheRecmdInfo(item);

                    switch(type){
                        case 'bid':
                            me.inlineBid(target, item);
                            break;
                        case 'wmatch':
                            me.inlineWmatch(target, item, action.arg.opttypeid);//Modified by Wu huiyao 添加opttypeid参数
                            break;
//                        case 'addword': // 这个功能下掉了，暂时删掉 by Huiyao 2013.3.20
//                            me.inlineAddWord(target, item, index);
//                            break;
                        case 'recmbid':
                            me.inlineRecmBid(target, item, index);
                            break;
                        case 'recmwmatch':
                            me.inlineRecmWmatch(target, item, index);
                            break;
                        case 'addTarget':
                            me.inlineAddTarget(target, item, index);
                    }
                    break;
                }

                if (baidu.dom.hasClass(target, 'status_op_btn')){
                    type = target.getAttribute('edittype');
                    index = nirvana.manage.getRowIndex(target);
                    item = action.getContext('widgetTableData')[index];
                    me.inlineRun(target, item);
                }
                
//                //用于移动包的优化出价，暂时
//                if (baidu.dom.hasClass(target, 'op_bid_pop')) {
//                    index = nirvana.manage.getRowIndex(target);
//                    item = action.getContext('widgetTableData')[index];
//                    // 弹出式优化出价的操作
//                    nirvana.util.openSubActionDialog({
//                        id: 'modifyWordBidDialog',
//                        title: '修改关键词出价',
//                        width: 440,
//                        actionPath: 'manage/modWordPrice',
//                        maskLevel : nirvana.aoPkgWidgetCommon.getMaskLevel(),
//                        params: {
//                            winfoid: [item.winfoid],
//                            bid: [item.bid],
//                            name: [item.showword],
//                            unitbid: [item.unitbid]
//                        }
//                    });
//
//                    if (item.deviceprefer == 0) {
//                        var tip = fc.create('<span class="red">该关键词投放了全部设备，修改出价将在计算机和移动设备搜索推广同时生效</span>');
//                        baidu.q('ui_dialog_foot', 'ctrldialogmodifyWordBidDialog')[0].appendChild(tip);
//                    }
//                }
//
//                //用于移动包的搜索无效提示，暂时
//                if (baidu.dom.hasClass(target, 'status_icon')) {
//                    var data = baidu.getAttr(target, 'data');
//                    var minbid = data.bid;
//                    ui.Dialog.factory.create({
//                        'id': 'aoPkgWordStatus',
//                        'title': '<span class="status_icon offlineReason_icon"></span><span class="offlineReasonTitle">目前关键词处于离线中，可能存在以下原因</span>',
//                        'width': 655,
//                        'content': '<div class="offlineReason">'
//                            + '<table><tr><th>无有效创意</th><td>您的推广单元读写器中无有效创意，导致您的关键词无法正常推广</td></tr>'
//                            + '<tr><th>搜索无效</th><td>关键词低于最低展现价格，要使其有效，您可优化关键词质量度或者是出价不低于最低展现价格' + minbid + '元</td><tr>'
//                            + '<tr><th>暂停推广</th><td>您的当前推广计划已暂停推广</td></tr></table>'
//                            + '<p style="width:98%;padding:5px 0 10px 10px;color:#999999;border-top:1px solid #cccccc;">如有疑问，您可拨打我们的服务热线：400-890-0088</p></div>',
//                        'ok_button' : false,
//                        'cancel_button' : false
//                    });
//                }

                target = target.parentNode;
            }
        };
    },

    /**
     * 表格选择事件
     */
    selectListHandler : function() {
        var me = this,
            action = me.action;

        return function() {
            var controlMap = action._controlMap,
                table = controlMap.WidgetTable;
            if (!table.select || !table.selectedIndex) {
                return;
            }
            var selectedIndex = table.selectedIndex,
                enabled = selectedIndex.length > 0;

            controlMap.WidgetApply.disable(!enabled);


            // 读写分离，待升级之后不用这种方式了
            // by Leo Wang
            nirvana.acc.accService.processEntrances('aoPackage/detail/' + action.arg.opttypeid);
        };
    },

    /**
     * 批量应用
     */
    getApply : function() {
        var me = this,
            action = me.action,
            levelName;

        return function() {
            var applyType = action.getContext('applyType'),
                opttypeid = action.getContext('opttypeid'),
                selectedIndex = action._controlMap.WidgetTable.selectedIndex;

            switch (opttypeid) {
                case '106':
//                case '705': // 计划被暂停
                    levelName = '计划';
                    break;
                case '108':
                case '302':
//                case '710': // 单元被暂停
                    levelName = '单元';
                    break;
                default:
                    levelName = '关键词';
                    break;
            }

            ui.Dialog.confirm({
                title: '确认',
                content: '您将对' + selectedIndex.length + '个' + levelName + '进行修改，确定吗？',
                onok: function(){
                    switch (applyType) {
                        case 'modBid':
                            me.modBidBatch();
                            break;
                        case 'modWmatch':
                            me.modWmatchBatch();
                            break;
//                        case 'addWords':
//                            me.addWordsBatch();
//                            break;
                        case 'multiRun':
                            me.doMultiRun();
                            break;
                        case 'deleteUnit':
                            me.deleteUnit();
                            break;
                    }
                    me.hasModified();
                }
            });
        };
    },

    /**
     * 子项刷新
     */
    refresh : function() {
        var me = this,
            action = me.action;

        action.refreshSelf(me.getStateMap());
    },

    /**
     * 需要状态保持的变量
     */
    getStateMap: function(){
        var me = this,
            action = me.action,
            stateMap = {
                pageNo : action.getContext('pageNo') || 1,
                modifiedInfo : action.getContext('modifiedInfo') || {},
                tab: action.getContext('tabIndex') || 0,
                isModified : action.getContext('isModified') || false,
                extra: action.getContext('extra')
            };

        return stateMap;
    },

    /**
     * 返回上一级
     * @param {Action} action
     */
    goBack : function(action) {
        var me = this,
            btn = baidu.q('return', 'WidgetCont');

        baidu.each(btn, function(item) {
            item.onclick = function() {
                // 关闭详情时，设置重新计算请求为0
                nirvana.aoPkgWidgetCommon.recalculate = 0;
                action.onclose();
            }
        });
    },

    /**
     * 行内操作成功后，设置修改的层级id
     * @param {String} modifiedKey 修改层级 'planid|unitid|winfoid|wordid|ideaid'
     * @param {String} modifiedId 修改id
     */
    setModifiedInfo: function(modifiedKey, modifiedId) {
        var me = this,
            action = me.action,
            modifiedInfo = action.getContext('modifiedInfo'),
            ids = modifiedInfo.ids;

        modifiedInfo.levelId = modifiedKey;

        ids.push(modifiedId);
        modifiedInfo.ids = baidu.array.unique(ids);

        action.setContext('modifiedInfo', modifiedInfo);
    },

    /**
     * 获取修改过内容的Index序号
     */
    getModifiedIndex : function() {
        var me = this,
            action = me.action,
            modifiedInfo = action.getContext('modifiedInfo'),
            all = action.getContext('widgetTableData'),
            levelId = modifiedInfo.levelId,
            modifiedId = modifiedInfo.ids,
            modifiedIndex = [],
            index;

        // null or []
        if (modifiedId) {
            for (var i = 0, len = modifiedId.length; i < len; i++) {
                index = baidu.array.indexOf(all, function(item){
                    if (modifiedId[i] == item[levelId]) {
                        return true;
                    }
                });

                if (index > -1) {
                    modifiedIndex.push(index);
                }
            }
        }

        return modifiedIndex;
    },

    /**
     * 修改行着色
     */
    changeTableColor : function() {
        var me = this,
            action = me.action,
            table = action._controlMap.WidgetTable,
            modifiedIndex = me.getModifiedIndex(),
            len = modifiedIndex.length,
            i = 0,
            tr;

        if (len == 0) {
            return;
        }
        // 对当前表格修改过的行添加背景色
        baidu.each(modifiedIndex, function(item) {
            tr = table.getRow(item);
            baidu.addClass(tr, 'ui_table_trmark');
        });
    },

    /**
     * 行内修改出价
     * @param {Object} target
     * @param {Object} item
     */
    inlineBid : function(target, item) {
        var me = this,
            action = me.action,
            parent = target.parentNode,
            winfoid = item.winfoid,
            bid = +item['bid'] ? baidu.number.fixed(item['bid']) : baidu.number.fixed(item['unitbid']);
        nirvana.inline.createInlineLayer({
            type: 'text',
            value: bid,
            id: 'bid' + winfoid,
            target: parent,
            okHandler: function(wbid){
                return {
                    // modified by LeoWang(wangkemiao@baidu.com) 2012-12-04
                    // validate: function(){
                    // 	// 关键词出价不能调低，这是优化包特有的逻辑，errorcode是前端自己定的
                    // 	if (+wbid >= 0 && +wbid < +bid) {
                    // 		nirvana.inline.displayError('bidLower');
                    // 		return false;
                    // 	}
                    // 	return true;
                    // },
                    func: fbs.keyword.modBid,
                    param: {
                        winfoid: [winfoid],
                        bid: wbid,
                        onSuccess: function(data){
                            var modifyData = {};
                            modifyData[winfoid] = {
                                'bid': wbid
                            };
                            var pausestat = data.data[winfoid];
                            for (var titem in pausestat) {
                                modifyData[winfoid][titem] = pausestat[titem];
                            }
                            fbs.avatar.getMoniWords.ModCache('winfoid', modifyData);
                            fbs.material.ModCache('wordinfo', 'winfoid', modifyData);
                            // 监控
                            var logParam = {
                                opttypeid : action.getContext('opttypeid'),
                                winfoid : winfoid,
                                planid : item.planid,
                                unitid : item.unitid,
                                oldvalue : item.bid,
                                newvalue : wbid,
                                recmbid : item.recmbid,
                                reason : item.reason || null
                            };


                            nirvana.aoPkgControl.logCenter.extend(logParam).sendAs('nikon_modify_bid');


                            // 记录修改成功的winfoid
                            me.setModifiedInfo('winfoid', winfoid);

                            me.hasModified();

                            me.refresh();
                        },
                        onFail: function(data) {
                            ajaxFailDialog();
                        }
                    }
                };
            },
            cancelHandler : function(wbid){
                //这里是用来直接执行的 不需要返回一个函数了
            }
        });
    },

    inlineRecmBid : function(target, item, index) {
        var me = this,
            action = me.action,
            parent = target.parentNode,
            winfoid = 'recm' + index,
            bid = baidu.number.fixed(item['recmbid']),
            datasource = action._controlMap.WidgetTable.datasource;

        nirvana.inline.createInlineLayer({
            type: 'text',
            value: bid,
            id: 'bid' + winfoid,
            target: parent,
            singleLine : 'top',
            okHandler: function(wbid){
                return {
                    validate : nirvana.util.bind(nirvana.validate.bid, null, wbid),
                    /*function(){
                        // '605':'关键词出价不能为空',
                        // '607':'关键词出价不能低于' + nirvana.config.NUMBER.BID_MIN + '元',
                        // '608':'关键词出价不能高于' + nirvana.config.NUMBER.BID_MAX + '元',
                        // '606':'关键词出价不是数字',
                        // '699':'关键词出价小数点后不超过两位',
                        // 下次提出来
                        if(wbid == ''){
                            nirvana.inline.displayError('605');
                            return false;
                        }
                        else if(isNaN(wbid)){
                            nirvana.inline.displayError('606');
                            return false;
                        }
                        else if(!fbs.validate.number.decPlaces(wbid, 2)){
                            nirvana.inline.displayError('699');
                            return false;
                        }
                        else if(+wbid <= nirvana.config.NUMBER.BID_MIN){
                            nirvana.inline.displayError('607');
                            return false;
                        }
                        else if(+wbid > nirvana.config.NUMBER.BID_MAX){
                            nirvana.inline.displayError('608');
                            return false;
                        }
                        return true;
                    },*/
                    func: function(){
                        // datasource[index].recmbid = wbid;
                        var newvalue = baidu.number.fixed(wbid);

                        $$('.word_recmbid', target.parentNode)[0].innerHTML = newvalue;
                        nirvana.inline.dispose();
                        nirvana.aoPkgControl.widget.common.updateTableData(action, index, {
                            recmbid : newvalue
                        });
                    },
                    param : {}
                };
            },
            cancelHandler : function(wbid){
                //这里是用来直接执行的 不需要返回一个函数了
            }
        });
    },

    /**
     * 行内修改匹配方式
     * @param {Object} target
     * @param {String} opttypeid 优化项ID，可选 (Added by Wu huiyao)
     */
    inlineWmatch : function(target, item, opttypeid) {
        var me = this,
            action = me.action,
            parent = target.parentNode,
            winfoid = item.winfoid,
            wmatch = item.wmatch;

        nirvana.inline.createInlineLayer({
            type: "select",
            value: wmatch,
            id: "wmatch" + winfoid,
            target: parent,
            datasource: nirvana.config.WMATCH.DATASOURCE,
            okHandler: function(match){
                return {
                    // modified by LeoWang(wangkemiao@baidu.com) 2012-12-04
                    // validate: function(){
                    // 	// Added by Wu Huiyao
                    // 	// 对于行业包修改匹配项不对匹配进行限定
                    // 	if (opttypeid && (+opttypeid == 606)) {
                    // 		return true;
                    // 	}

                    // 	// 关键词匹配不能调低，这是优化包特有的逻辑，errorcode是前端自己定的
                    // 	if (+match > +wmatch) {
                    // 		nirvana.inline.displayError('matchLower');
                    // 		return false;
                    // 	}
                    // 	return true;
                    // },
                    func: fbs.keyword.modWmatch,
                    param: {
                        winfoid: [winfoid],
                        wmatch: match,
                        onSuccess: function(data){
                            if (data.status != 300) {
                                var modifyData = {};
                                modifyData[winfoid] = {
                                    "wmatch": match
                                };
                                fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
                                fbs.material.ModCache('wordinfo', "winfoid", modifyData);

                                // 监控
                                var logParam = {
                                    opttypeid : action.getContext('opttypeid'),
                                    winfoid : winfoid,
                                    planid : item.planid,
                                    unitid : item.unitid,
                                    oldvalue : item.wmatch,
                                    newvalue : match,
                                    recmwmatch : item.recmwmatch,
                                    reason : item.reason || null
                                };

                                nirvana.aoPkgControl.logCenter.extend(logParam).sendAs('nikon_modify_wmatch');

                                // 记录修改成功的winfoid
                                me.setModifiedInfo('winfoid', winfoid);

                                me.hasModified();

                                me.refresh();
                            }
                        }
                    }
                }
            }
        });
    },

    inlineRecmWmatch : function(target, item, index){
        var me = this,
            action = me.action,
            parent = target.parentNode,
            winfoid = 'recm' + index,
            wmatch = item.recmwmatch,
            datasource = action._controlMap.WidgetTable.datasource;

        nirvana.inline.createInlineLayer({
            type: "select",
            value: wmatch,
            id: "wmatch" + winfoid,
            target: parent,
            datasource: nirvana.config.WMATCH.DATASOURCE,
            singleLine : 'top',
            okHandler: function(match){
                return {
                    func: function(){
                        // datasource[index].recmwmatch = match;
                        $$('.word_recmwmatch', target.parentNode)[0].innerHTML = MTYPE[match];
                        nirvana.inline.dispose();
                        nirvana.aoPkgControl.widget.common.updateTableData(action, index, {
                            recmwmatch : match
                        });
                    },
                    param : {}
                };
            },
            cancelHandler : function(wbid){
                //这里是用来直接执行的 不需要返回一个函数了
            }
        });
    },
    // 这个功能下掉了，暂时删掉 by Huiyao 2013.3.20
//    /**
//     * 添加关键词
//     * @param {Object} target
//     * @param {Object} item
//     * @param num index添加项在表格中的index
//     */
//    inlineAddWord: function(target, item, index){
//        // del by Huiyao 2013.3.1 用下述逻辑替换
////        var me = this,
////            action = me.action,
////        //			winfoid = item.winfoid,
////        //			wmatch = item.wmatch,
////        //			datasource,
////            params;
////        // del by Huiyao: 把缓存推荐信息的移到行内修改入口统一处理 2013.1.15
////        //		// 在实际进行修改之前，处理一下字段，增加suggestplanid等字段
////        //		if('undefined' == typeof item.suggestplanid){
////        //			item.suggestplanid = item.recmplanid;
////        //			item.suggestplanname = item.recmplanname;
////        //			item.suggestunitid = item.recmunitid;
////        //			item.suggestunitname = item.recmunitname;
////        //			// 更新缓存
////        //			// var cachedata = action.getContext('widgetTableData');
////        //			var cachedata = action._controlMap.WidgetTable.datasource;
////        //			baidu.extend(cachedata[index], item);
////        //			action._controlMap.WidgetTable.datasource = cachedata;
////        //			action.setContext('widgetTableData', cachedata);
////        //		}
////
////        //		datasource = action._controlMap.WidgetTable.datasource;
////        params = baidu.object.clone(item);
////
////        params.opttypeid = action.arg.opttypeid;
////
////        //以下3个参数为推词详情专用
////        params.index = [];
////        params.index.push(index);
////        params.father = action;
////
////        var itemParam = {
////            id: 'AddWord',
////            actionPath: 'aoPackage/addword',
////            className: '',
////            title: '添加关键词',
////            width: 660,
////            maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel(),
////            params: params,
////            onclose:function(){}
////        };
////
////        nirvana.util.openSubActionDialog(itemParam);
////
////        //me.hasModified(); 已经转至addword.js中调用
//
//        var me = this;
//        var action = me.action;
//        action.getOpttypeid = function() {
//            return action.arg.opttypeid;
//        };
//        action.onAddWordSuccess = function(rowIdx, addedWord, opttypeid) {
//            var firScreenNum;
//            var morewordNum;
//            var widgetTable = action._controlMap.WidgetTable;
//
//            if (action.totalnum){
//                firScreenNum = action.totalnum;
//                morewordNum = widgetTable.datasource.length - action.totalnum;
//            }
//            // 发送监控
//            nirvana.AoPkgMonitor.inlineAddWordSuccess(addedWord, opttypeid,
//                firScreenNum, morewordNum);
//
//            // 标记为已部分修改
//            nirvana.aoPkgWidgetHandle.hasModified();
//            if (action.addwordTable) {
//                //删除添加过的数据
//                action.addwordTable.deleteRows([rowIdx]);
//                // 标记有关键词被添加
//                action.hasWordAdded = true;
//            }
//            else { // 刷新详情页面
//                nirvana.aoPkgWidgetHandle.refresh();
//            }
//        };
//        var addWordHandler = nirvana.tableHandler.inlineHandlerMap['addword'];
//        addWordHandler.call(action, target, item, index);
//    },

    inlineAddTarget : function(target, item, index){
//        var me = this,
//            action = me.action,
//            parent = target.parentNode,
//            winfoid = 'recm' + index,
//            wmatch = item.recmwmatch,
//            datasource,
//            params;
//
//        // 在实际进行修改之前，处理一下字段，增加suggestplanid等字段
//        // if('undefined' == typeof item.suggestplanid){
//        // 	item.suggestplanid = item.recmplanid;
//        // 	item.suggestplanname = item.recmplanname;
//        // 	item.suggestunitid = item.recmunitid;
//        // 	item.suggestunitname = item.recmunitname;
//        // 	// 更新缓存
//        // 	// var cachedata = action.getContext('widgetTableData');
//        // 	var cachedata = action._controlMap.WidgetTable.datasource;
//        // 	baidu.extend(cachedata[index], item);
//        // 	action._controlMap.WidgetTable.datasource = cachedata;
//        // 	action.setContext('widgetTableData', cachedata);
//        // }
//
//        datasource = action._controlMap.WidgetTable.datasource;
//        params = {
//            // item: baidu.object.clone(item),
//            showword: item.showword,
//            currplanid: +item.recmplanid,
//            currunitid: +item.recmunitid,
//            currplanname: item.recmplanname,
//            currunitname: item.recmunitname,
//            opttypeid: action.arg.opttypeid
//        };
//
//        // 把自己送进去，这是为了在保存成功之后，标识页面进行刷新
//        //params.caller = me;
//
//        //以下3个参数为推词详情专用
//        params.index = [];
//        params.index.push(index);
//        params.father = action;
//        var itemParam = {
//            id: 'AddWord',
//            actionPath: 'aoPackage/inlineEditTarget',
//            className: '',
//            title: '修改目标计划和单元',
//            width: 660,
//            maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel(),
//            params: params,
//            onclose:function(){}
//        };
//
//        nirvana.util.openSubActionDialog(itemParam);

        var me = this;
        var action = me.action;
        action.onEditPlanUnitSuccess = function (rowIdx, planInfo, unitInfo) {
            nirvana.aoPkgControl.widget.common.updateTableData(
                action,
                rowIdx,
                {
                    recmplanname: planInfo.name,
                    recmunitname: unitInfo.name,
                    recmplanid: planInfo.id,
                    recmunitid: unitInfo.id
                }
            );
            var updateTarget = $$(
                '.aopkg_detail_shortTarget',
                action._controlMap.WidgetTable.getRow(rowIdx)
            );
            var data = action.getContext('widgetTableData')[rowIdx];
            if (updateTarget && data) {
                updateTarget[0].innerHTML = nirvana.aoPkgWidgetRender.addtarget(9)(data);
            }
        };
        var addTargetHandler = nirvana.tableHandler.inlineHandlerMap['addTarget'];
        addTargetHandler.call(action, target, item, index);
    },

    /**
     * 批量修改出价
     */
    modBidBatch : function() {
        var me = this,
            action = me.action,
            selectedIndex = action._controlMap.WidgetTable.selectedIndex,
            rows2Data = nirvana.aoPkgWidgetCommon.rows2Data,
            winfoid = rows2Data(action, selectedIndex, 'winfoid'),
            recmbid = rows2Data(action, selectedIndex, 'recmbid'),
            bids = rows2Data(action, selectedIndex, 'bid');

        // 批量修改为不同的出价
        fbs.keyword.modBid({
            winfoid: winfoid,
            bid: recmbid,
            callback: function(response) {
                var status = response.status;

                // 监控
                var logParam = {
                    applycount : selectedIndex.length,
                    opttypeid : action.getContext('opttypeid'),
                    selectedids : winfoid.join(),
                    selectedoldvalues : bids.join(),
                    selectednewvalues : recmbid.join()
                };

                nirvana.aoPkgControl.logCenter.extend(logParam).sendAs('nikon_multiapply_bid');

                switch (status) {
                    case 200:
                        me.refresh();
                        break;
                    case 300:
                        me.ajaxFailSome();
                        break;
                    default:
                        me.ajaxFailAll();
                        break;
                }
                // 清除关键词层级缓存
                fbs.material.clearCache('wordinfo');
                fbs.avatar.getMoniFolders.clearCache();
                fbs.avatar.getMoniWords.clearCache();
            }
        });
    },

    /**
     * 批量修改匹配模式
     */
    modWmatchBatch : function() {
        var me = this,
            action = me.action,
            selectedIndex = action._controlMap.WidgetTable.selectedIndex,
            rows2Data = nirvana.aoPkgWidgetCommon.rows2Data,
            winfoid = rows2Data(action, selectedIndex, 'winfoid'),
            wmatch = rows2Data(action, selectedIndex, 'wmatch'),
            recmwmatch = rows2Data(action, selectedIndex, 'recmwmatch');

        // 批量修改为不同的匹配模式
        fbs.keyword.modDiffWmatch({
            winfoid: winfoid,
            wmatch: recmwmatch,
            callback: function(response) {
                var status = response.status;

                // 监控
                var logParam = {
                    applycount : selectedIndex.length,
                    opttypeid : action.getContext('opttypeid'),
                    selectedids : winfoid.join(),
                    selectedoldvalues : wmatch.join(),
                    selectednewvalues : recmwmatch.join()
                };

                nirvana.aoPkgControl.logCenter.extend(logParam).sendAs('nikon_multiapply_wmatch');

                switch (status) {
                    case 200:
                        me.refresh();
                        break;
                    case 300:
                        me.ajaxFailSome();
                        break;
                    default:
                        me.ajaxFailAll();
                        break;
                }
                // 清除关键词层级缓存
                fbs.material.clearCache('wordinfo');
                fbs.avatar.getMoniFolders.clearCache();
                fbs.avatar.getMoniWords.clearCache();
            }
        });
    },

//    /**
//     * 批量添加关键词
//     */
//    addWordsBatch : function() {
//        var me = this,
//            action = me.action,
//            ds = action._controlMap.WidgetTable.datasource,
//            selectedIndex = action._controlMap.WidgetTable.selectedIndex,
//            rows2Data = nirvana.aoPkgWidgetCommon.rows2Data,
//            selectedData = rows2Data(action, selectedIndex, null, ds),
//            wordids = rows2Data(action, selectedIndex, 'wordid', ds),
//            showwords = rows2Data(action, selectedIndex, 'showword', ds),
//            planids = rows2Data(action, selectedIndex, 'recmplanid', ds),
//            unitids = rows2Data(action, selectedIndex, 'recmunitid', ds),
//            bids = rows2Data(action, selectedIndex, 'recmbid', ds),
//            wmatchs = rows2Data(action, selectedIndex, 'recmwmatch', ds),
//            len = selectedData.length,
//            items = [],
//            i, temp;
//
//        // 初始化用于监控用的推荐信息, added by Huiyao 2013.1.15
//        var recmfieldArr = [
//            'recmplanname', 'recmunitname', 'recmunitid',
//            'recmbid', 'recmplanid', 'recmwmatch'
//        ];
//        // 保存推荐信息对象
//        var recmInfo = {};
//        var fieldName;
//        for (var i = recmfieldArr.length; i --;) {
//            fieldName = recmfieldArr[i];
//            recmInfo[fieldName + 's'] =
//                rows2Data(action, selectedIndex, fieldName, ds, true).join();
//        }
//
//        for (i = 0; i < len; i++) {
//            temp = selectedData[i];
//
//            items.push({
//                idx : i,
//                planid : temp.recmplanid,	 // 如果是尚不存在的计划，填0
//                unitid : temp.recmunitid,	 // 如果是尚不存在的计划，填0
//                planname : temp.recmplanname, // 如果是尚不存的计划，需要填写
//                unitname : temp.recmunitname, // 如果是尚不存的单元，需要填写
//                showword : temp.showword,
//                wordid : temp.wordid,
//                bid : temp.recmbid,
//                wmatch : temp.recmwmatch
//            });
//        }
//        fbs.nikon.addWords({
//            opttypeid: action.arg.opttypeid || '',
//            items : items,
//            callback : function(response) {
//                var status = response.status;
//
//                // 监控
//                var logParam = {
//                    applycount : selectedIndex.length,
//                    opttypeid : action.getContext('opttypeid'),
//                    selectedids : wordids.join(),
//                    selectedwords : showwords.join(),
//                    selectedplanids : planids.join(),
//                    selectedunitids : unitids.join(),
//                    selectedbids : bids.join(),
//                    selectedwmatchs : wmatchs.join()
//                };
//
//                // 存储推荐信息, add by Huiyao 2013.1.15
//                baidu.extend(logParam, recmInfo);
//
//                if (action.totalnum){
//                    logParam.firstwordnum = action.totalnum;
//                    logParam.morewordnum = action._controlMap.WidgetTable.datasource.length - action.totalnum;
//                }
//
//                nirvana.aoPkgControl.logCenter.extend(logParam).sendAs('nikon_multiapply_addword');
//
//                switch (status) {
//                    case 200:
//                        if (!me.action.addwordTable) {	//如果是推词页，添加数据后不刷新
//                            me.refresh();
//                        }else{
//                            //推词页升级后功能，删除添加过的数据
//                            me.action.addwordTable.deleteRows(selectedIndex);
//                            me.action.hasWordAdded = true;
//                            if (action._controlMap.WidgetTable.selectedIndex.length == 0){
//                                ui.util.get('WidgetApply').disable(true);
//                            }
//                        }
//                        break;
//                    case 300:
//                        if (me.action.addwordTable) {	//如果是推词页
//                            //推词页升级后功能，删除添加过的数据
//                            var addedIndex = [];
//                            for (var i = 0; i < response.data.length; i++){
//                                addedIndex.push(response.data[i].index);
//                            }
//                            me.action.addwordTable.deleteRows(addedIndex);
//                            me.action.hasWordAdded = true;
//                        }
//                        me.ajaxFailSome();
//                        break;
//                    default:
//                        me.ajaxFailAll();
//                        break;
//                }
//                // 清除关键词层级缓存
//                fbs.material.clearCache('planinfo');
//                fbs.material.clearCache('unitinfo');
//                fbs.material.clearCache('wordinfo');
//                fbs.avatar.getMoniFolders.clearCache();
//                fbs.avatar.getMoniWords.clearCache();
//
//                action.setContext('hasInlineRecmModified', false);
//                me.clearInlineModWarn();
//
//            }
//        });
//
//        var me = this;
//        var action = me.action;
//        var widgetTable = action._controlMap.WidgetTable;
//
//        var acceptIdea;
//        //判断是否接受推荐创意，暂时只在移动优化包中加入
//        if (baidu.g('acceptRecmIdea')) {
//            acceptIdea = baidu.g('acceptRecmIdea').checked;
//        }
//
//        var addWordHandler = function(modifiedInfo, ds, opttypeid, addRowIdxs) {
//            var firScreenNum;
//            var morewordNum;
//
//            if (action.totalnum) {
//                firScreenNum = action.totalnum;
//                morewordNum = widgetTable.datasource.length - action.totalnum;
//            }
//            // 发送监控
//            nirvana.AoPkgMonitor.batchAddWords(modifiedInfo, ds, opttypeid,
//                firScreenNum, morewordNum, acceptIdea);
//
//            if (action.addwordTable) {    // 如果是推词页，添加数据后不刷新
//                //推词页升级后功能，删除添加过的数据
//                action.addwordTable.deleteRows(addRowIdxs);
//                action.hasWordAdded = true;
//                action.setContext('hasInlineRecmModified', false);
//                me.clearInlineModWarn();
//            }
//            else {
//                me.refresh();
//            }
//        };
//
//        action.onBatchAddWordSuccess = function(modifiedInfo, ds, response, opttypeid) {
//            var status = response.status;
//            var addedIndex = modifiedInfo.rowIdxs;
//
//            if (status === 300) { // status 300 也会触发表示部分成功
//                // 初始化添加成功的关键词行索引
//                addedIndex = [];
//                for (var i = 0, len = response.data.length; i < len; i ++) {
//                    addedIndex.push(response.data[i].index);
//                }
//            }
//            // 添词成功处理逻辑
//            addWordHandler(modifiedInfo, ds, opttypeid, addedIndex);
//        };
//
//        var selRowIdxs = widgetTable.selectedIndex;
//        var item;
//        for (var i = selRowIdxs.length; i --;) {
//            item = widgetTable.datasource[selRowIdxs[i]];
//            // 缓存推荐的词的信息，如果有的话
//            me._cacheRecmdInfo(item);
//        }
//
//        var handler = nirvana.tableHandler.batchHandlerMap['addWords'];
//        handler.call(action, selRowIdxs, widgetTable.datasource,
//            'onBatchAddWordSuccess', action.arg.opttypeid, acceptIdea);
//    },

    /**
     * 删除单元
     */
    deleteUnit: function() {
        var me = this,
            action = this.action,
            selectedIndex = action._controlMap.WidgetTable.selectedIndex,
            data = nirvana.aoPkgWidgetCommon.rows2Data(action, selectedIndex, 'unitid');

        fbs.unit.del({
            unitid: data,
            callback: function(response) {
                var status = response.status;

                // 监控
                var logParam = {
                    applycount : selectedIndex.length,
                    opttypeid : action.getContext('opttypeid'),
                    selectedids : data.join()
                };
                nirvana.aoPkgControl.logCenter.extend(logParam).sendAs('nikon_multiapply_unit_del');

                switch (status) {
                    case 200:
                        me.refresh();
                        break;
                    case 300:
                        me.ajaxFailSome();
                        break;
                    default:
                        me.ajaxFailAll();
                        break;
                }
            }
        });
    },

    /**
     * 批量启用
     */
    doMultiRun : function(){
        var me = this,
            action = me.action,
            funcList = {
                'plan' : fbs.plan.modPausestat,
                'unit' : fbs.unit.modPausestat,
                'word' : fbs.keyword.modPausestat
            },
            selectedIndex = action._controlMap.WidgetTable.selectedIndex,
            rows2Data = nirvana.aoPkgWidgetCommon.rows2Data,
            winfoid = rows2Data(action, selectedIndex, 'winfoid'),
            unitid = rows2Data(action, selectedIndex, 'unitid'),
            planid = rows2Data(action, selectedIndex, 'planid'),
            idArr, func,
            level, cachelevel, cachekey;

        if(winfoid.length > 0 && winfoid[0] != undefined){
            level = 'word';
            cachekey = 'winfoid';
            idArr = winfoid;
        }
        else if(unitid.length > 0 && unitid[0] != undefined){
            level = 'unit';
            cachekey = 'unitid';
            idArr = unitid;
        }
        else if(planid.length > 0 && planid[0] != undefined){
            level = 'plan';
            cachekey = 'planid';
            idArr = planid;
        }

        func = funcList[level];
        cachelevel = level + 'info';

        params = {
            pausestat : 0,  // 启用0 暂停1
            onSuccess: function(response){

                // 监控
                var logParam = {
                    applycount : selectedIndex.length,
                    opttypeid : action.getContext('opttypeid'),
                    level : cachelevel,
                    selectedids : idArr.join()
                };

                nirvana.aoPkgControl.logCenter.extend(logParam).sendAs('nikon_multiapply_run');

                // 缓存处理
                switch(level){
                    case 'word':
                        fbs.material.clearCache('wordinfo');
                        fbs.avatar.getMoniFolders.clearCache();
                        fbs.avatar.getMoniWords.clearCache();
                        break;
                    case 'unit':
                        fbs.material.clearCache('unitinfo');
                        //创意、关键词、文件夹详情、排行榜
                        fbs.material.ModCache('wordinfo', 'unitid', unitid, 'delete');
                        fbs.material.ModCache('ideainfo', 'unitid', unitid, 'delete');
                        fbs.avatar.getMoniFolders.clearCache();
                        fbs.avatar.getMoniWords.ModCache('unitid', unitid, 'delete');
                        fbs.material.getTopData.clearCache();
                        //ui.util.get('SideNav').refreshPlanList();
                        break;
                    case 'plan':
                        fbs.material.clearCache('planinfo');
                        //	fbs.plan.getInfo.clearCache();
                        //单元、创意、关键词、文件夹详情、排行榜
                        fbs.material.ModCache('unitinfo', 'planid', planid, 'delete');
                        fbs.material.ModCache('wordinfo', 'planid', planid, 'delete');
                        fbs.material.ModCache('ideainfo', 'planid', planid, 'delete');
                        fbs.avatar.getMoniFolders.clearCache();
                        fbs.avatar.getMoniWords.ModCache('planid', planid, 'delete');
                        fbs.material.getTopData.clearCache();
                        //ui.util.get('SideNav').refreshPlanList();
                        break;
                }
                me.refresh();
            },
            onFail: function(response) {
                var status = response.status;

                switch (status) {
                    case 300:
                        me.ajaxFailSome();
                        break;
                    default:
                        me.ajaxFailAll();
                        break;
                }
            }
        };
        params[cachekey] = idArr;

        func && func(params);
    },


    /**
     * 行内启用
     * @param {Object} target
     */
    inlineRun : function(target, item){
        var me = this,
            action = me.action,
            funcList = {
                'plan' : fbs.plan.modPausestat,
                'unit' : fbs.unit.modPausestat,
                'word' : fbs.keyword.modPausestat
            },
            level,
            func,
            type = 'single',
            idArr,
            cachelevel,
            cachekey,
            pauseStat,
            params;

        if('undefined' != typeof item.winfoid){
            level = 'word';
            cachekey = 'winfoid';
        }
        else if('undefined' != typeof item.unitid){
            level = 'unit';
            cachekey = 'unitid';
        }
        else if('undefined' != typeof item.planid){
            level = 'plan';
            cachekey = 'planid';
        }

        func = funcList[level];
        cachelevel = level + 'info';

        idArr = (item[cachekey] instanceof Array ? item[cachekey] : [item[cachekey]]);
        //pauseStat = nirvana.manage.getPauseStat(target,[0,1]);  // 这里理应都是暂停
        nirvana.manage.inserLoadingIcon(target);
        //console.log(level, cachelevel, cachekey, idArr);

        params = {
            pausestat : 0,  // 启用0 暂停1
            onSuccess: function(response){
                var modifyData = response.data;
                //单独操作时重新设置缓存
                fbs.material.ModCache(cachelevel, cachekey, modifyData);
                // 记录修改成功的winfoid
                me.setModifiedInfo(cachekey, item[cachekey]);
                me.hasModified();
                me.refresh();
            },
            onFail: function(response) {
                target.innerHTML = '';
                ajaxFailDialog();
            }
        };
        params[cachekey] = idArr;

        // 监控
        var logParam = {
            level : cachelevel,
            opttypeid : action.getContext('opttypeid')
        };
        logParam[cachekey] = idArr[0];

        nirvana.aoPkgControl.logCenter.extend(logParam).sendAs('nikon_modify_run');

        func && func(params);

    },

    /**
     * 应用所选时，部分失败
     */
    ajaxFailSome : function() {
        ajaxFailDialog('', '修改部分已经成功，但有部分未成功，请刷新页面后重试。');
    },

    /**
     * 应用所选时，部分失败
     */
    ajaxFailAll : function() {
        ajaxFailDialog();
    },

    showInlineModWarn : function(msg){
        var target = baidu.g('AoDetailWidgetWarn');
        if(target){
            target.innerHTML = msg;
            baidu.removeClass(target, 'hide');
        }
    },
    clearInlineModWarn : function(){
        var target = baidu.g('AoDetailWidgetWarn');
        if(target){
            target.innerHTML = '';
            baidu.addClass(target, 'hide');
        }
    },

    /**
     * 标记当前已修改状态
     */
    hasModified: function(){
        var me = this;

        // 标记已部分优化
        me.action.setContext('isModified', true);
        // 需要重新计算详情，设置标识为1
        nirvana.aoPkgWidgetCommon.recalculate = 1;
    }
};

nirvana.aoPkgWidgetHandle = nirvana.aoPkgControl.widget.handle;