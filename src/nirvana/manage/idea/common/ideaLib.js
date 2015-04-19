/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 *
 * path:   manage/ideaLib.js
 * desc:    创意的工具方法
 * author:  yanlingling
 * date:    $Date: 2012/07/16 $
 */

nirvana.manage.ideaLib = {

    /**
     *不显示数据时的话术设置
     * @param {Object} exceed
     */
    setNoDataHtml: function(exceed, action) {
        var me = action,
            filterCol = me.getContext('filterCol'),
            searchCondi = false,
            type = nirvana.CURRENT_MANAGE_ACTION_NAME;

        if (exceed) {
            me.setContext("noDataHtml", FILL_HTML.EXCEED);
            return;
        }
        /*if (!me.arg.queryMap.ignoreState) {
           me.setContext("noDataHtml", FILL_HTML.IDEA_NO_DATA[type]);
        }*/
        else {
            for (var field in filterCol) {
                //遍历所有筛选条件
                if (filterCol[field].on) {
                    searchCondi = true;
                    me.setContext("noDataHtml", FILL_HTML.SEARCH_NO_DATA);
                    break;
                }
            }
            if (!searchCondi) {
                me.setContext("noDataHtml", FILL_HTML.IDEA_NO_DATA[type]);
            }
        }

        nirvana.manage.noDataHtmlPlus(me);
    },

    /**
     *构造物料创意预览的title url部分，双url以后要判断是否要出现移动url
     */
    buildIdeaTitleUrl: function(item, isShadow) {
        var devicecfgstat = item.devicecfgstat;
        var deviceprefer = item.deviceprefer;
        var url = item.url;
        var miurl = item.miurl;
        if (isShadow == true) {
            url = item.shadow_url;
            miurl = item.shadow_miurl;
        }
        var result = "访问URL：&#13;&#10;" + escapeQuote(url) + "&#13;&#10; &#13;&#10;";
        
            if (deviceprefer == 2) { //仅移动
                result = "移动访问URL：&#13;&#10;" + escapeQuote(url) + "&#13;&#10; &#13;&#10;";
            } else if (deviceprefer == 0) {
                result += "移动访问URL：&#13;&#10;" + escapeQuote(miurl) + "&#13;&#10; &#13;&#10;";
            }
        
        return result;

    },


    /**
     * 处理创意数据并汇总展现数据
     * @author tongyao@baidu.com
     */
    processData: function(result, action) {

        var me = action,
            pageSize = +me.getContext('pageSize'),
            pageNo = me.arg.pageNo || me.getContext('pageNo') || 1,
            start, totalPage, i, l, len,
            rs = []; //= baidu.object.clone(result); //优化 by linzhifeng@baidu.com 2011-08-29
        len = result.length;
        totalPage = Math.ceil(len / pageSize) || 1; // 这里len有可能为0，所以totalPage要更改为1
        pageNo = pageNo > totalPage ? totalPage : pageNo;
        start = (pageNo - 1) * pageSize;

        //优化 by linzhifeng@baidu.com 2011-08-29
        //rs = rs.splice(start, pageSize);
        l = (len > (start + pageSize)) ? (start + pageSize) : len;
        for (i = start; i < l; i++) {
            rs.push(result[i]);
        }

        //翻页控件用数据
        me.setContext('totalNum', len);
        me.setContext('pageNo', pageNo);
        me.setContext('totalPage', totalPage);
        //table用数据    
        me.setContext('tableFields', me.currentFileds);
        me.setContext('ideaListData', rs); //table用数据
        //统计展现、点击等汇总数据
        var item,
        clks = 0,
            shows = 0,
            paysum = 0,
            transSum = 0;

        for (var i = 0, l = len; i < l; i++) {
            item = result[i];
            clks += item.clks - 0;
            shows += item.shows - 0;
            paysum += item.paysum - 0;
            transSum += item.trans - 0;
        }

        var transRate = clks <= 0 ? '0' : (transSum / clks * 100).toFixed(2), //转化而已，没用
            avgprice = clks <= 0 ? '0.00' : (paysum / clks).toFixed(2),
            clickRate = shows <= 0 ? '0' : (clks / shows * 100).toFixed(2);

        me.setContext('totalClks', nirvana.manage.abbNumber(clks, 1));
        me.setContext('totalClksTitle', clks);

        if (nirvana.manage.hasToday(me)) {
            me.setContext('totalShows', '-');
            me.setContext('totalShowsTitle', '-');
            me.setContext('clickRate', '-');
        } else {
            me.setContext('totalShows', nirvana.manage.abbNumber(shows, 1));
            me.setContext('totalShowsTitle', shows);
            me.setContext('clickRate', clickRate + '%');

        }

        me.setContext('totalPaysum', '&yen;' + nirvana.manage.abbNumber(paysum));
        me.setContext('paysumTitle', '¥' + fixed(paysum));
        me.setContext('transRate', transSum);
        me.setContext('avgprice', '&yen;' + avgprice);
        me.repaint();

        //app修改来了border 改回来
        baidu.setStyle($$('.manage_table')[0], 'border-bottom', '1px solid #CCCCCC');
        baidu.setStyle($$('.ui_table_body')[0], 'border-bottom', '1px solid #CCCCCC');
        if (baidu.ie && baidu.ie == 7) {
            baidu.setStyle($$('.ui_table_body')[0], 'display', '');
        }
        //app为未绑定状态时隐藏翻页   这里将它显示处理
        baidu.show($$('.manage_page')[0]);

        if (me.arg.refresh) {
            //即时更新 by liuyutong@baidu.com
            if (nirvana.CURRENT_MANAGE_ACTION_NAME == 'idea') { //又不一样了。。。
                var updateParam = {
                    starttime: me.getContext('startDate'),
                    endtime: me.getContext('endDate'),
                    limit: nirvana.limit_idea
                }
                fbs.material.getAttribute('ideainfo', ['ideastat:update'], updateParam);
            } else if (nirvana.CURRENT_MANAGE_ACTION_NAME == 'localIdea') {
                ideaLib.refreshLocalIdeaState(me); //即时更新本地创意的状态
            } else if (nirvana.CURRENT_MANAGE_ACTION_NAME == 'appendIdea') {
                ideaLib.refreshAppendIdeaState(me); //即时更新本地创意的状态
            }

        }
    },


    /**
     * 构造账户优化请求参数
     */
    changeAoParams: function(action) {
        var me = action,
            aoControl = nirvana.aoControl;

        if (me.getContext('isSearch')) { // 搜索状态
            aoControl.changeParams({
                level: 'ideainfo',
                command: 'start',
                signature: '',
                condition: ideaLib.getAoCondition(me)
            });
        } else { // 清除搜索
            if (me.getContext('unitid')) { // 单元层级
                aoControl.changeParams({
                    level: 'unitinfo',
                    command: 'start',
                    signature: '',
                    condition: {
                        planid: [me.getContext('planid')],
                        unitid: [me.getContext('unitid')]
                    }
                });
            } else if (me.getContext('planid')) { // 计划层级
                aoControl.changeParams({
                    level: 'planinfo',
                    command: 'start',
                    signature: '',
                    condition: {
                        planid: [me.getContext('planid')]
                    }
                });
            } else { // 账户层级
                aoControl.changeParams({
                    level: 'useracct',
                    command: 'start',
                    signature: '',
                    condition: {}
                });
            }
        }
    },


    /**
     * 获取所有创意id及其对应计划和单元id
     * @param {Object} action
     */

    getAoCondition: function(action) {
        var me = action,
            listData = me.getContext("ideaListData"),
            condition = {},
            planids = [],
            unitids = [],
            ideaids = [];
        for (var i = 0, len = listData.length; i < len; i++) {
            planids[planids.length] = listData[i].planid;
            unitids[unitids.length] = listData[i].unitid;
            ideaids[ideaids.length] = listData[i].ideaid;
        }
        condition.planid = planids;
        condition.unitid = unitids;
        condition.ideaid = ideaids;
        return condition;
    },

    /**
     *改变每页显示条数
     */
    getPageSizeHandler: function(action) {
        var me = action;
        return function(value) {
            ui.util.get('ideaTableList').resetYpos = true;
            //切换每页显示条数的时候有重置到第一页
            me.setContext('pageNo', 1);
            me.setContext('pageSize', value);
            me.refresh();
        }
    },



    /**
     *改变页码
     * @param {Object} action
     */
    getPaginationHandler: function(action) {
        var me = action;
        return function(pageNo) {
            ui.util.get('ideaTableList').resetYpos = true;
            me.setContext('pageNo', pageNo);
            me.refresh();
        }
    },


    /**
     *表格选择响应事件
     * @param {Object} selected
     */
    selectListHandler: function(action) {

        var me = action,
            controlMap = me._controlMap,
            runPause = controlMap.runPause,
            moreOpt = controlMap.moreOpt,
            activeIdea = controlMap.activeIdea,
            delBtn = controlMap.delAppendIdea,
            addidea = controlMap.addidea;

        return function(selected) {
            var enabled = selected.length > 0;
            me.selectedList = selected;
            runPause.disable(!enabled);
            //调整启用暂停下拉框 的disabled状态
            if (enabled) {
                nirvana.manage.ideaLib.setRunPauseOptionsState(selected, me);
            }
            //调整激活按钮 的disabled状态，只有待激活状态才需要激活
            nirvana.manage.ideaLib.setActiveState(selected, action);
            if (moreOpt) { //附加创意没有更多操作
                moreOpt.disable(!enabled);
            }
            if (delBtn) { //删除按钮，在附加创意里面有
                delBtn.disable(!enabled);

                //addidea.disable(enabled);//选中的肯定是有附加创意的，不能再新建
            }


            // 读写分离，待升级之后不用这种方式了
            // by Leo Wang
            nirvana.acc.accService.processEntrances('manage/' + me.VIEW.replace('List', ''));

        }

    },


    /**
     * 设置启用暂停下拉框的状态
     */
    setRunPauseOptionsState: function(selectedList, action) {
        var me = action,
            i = 0,
            len = selectedList.length,
            data = me.getContext('ideaListData'),
            disablePauseState = true,
            disableStartState = true,
            runPauseControl = me._controlMap.runPause;

        for (; i < len; i++) {
            if (data[selectedList[i]].pausestat == '0') { //启用状态
                disablePauseState = false; //可以设置暂停
                continue;
            }
            if (data[selectedList[i]].pausestat == '1') { //暂停状态
                disableStartState = false; //可以设置启用
                continue;
            }
            if (!disablePauseState && !disablePauseState) {
                break;
            }
        }
        runPauseControl.disableItemByValue('start', disableStartState);
        runPauseControl.disableItemByValue('pause', disablePauseState);
    },

    /**
     * 设置激活按钮的状态
     */
    setActiveState: function(selectedList, action) {
        var me = action,
            i = 0,
            len = selectedList.length,
            data = me.getContext('ideaListData'),
            disabled = true,
            activeIdea = me._controlMap.activeIdea;

        for (; i < len; i++) {
            if (data[selectedList[i]].activestat == '1') { //待激活状态
                disabled = false; //可以设置激活
                break;
            }
        }
        if (activeIdea) { //附加创意无激活操作
            activeIdea.disable(disabled);
        }

    },


    /**
     *获取选取行的id
     */
    getSelectedId: function(action) {
        var me = action,
            selectedList = me.selectedList,
            data = me.getContext('ideaListData'),
            i, len, ids = [];

        for (i = 0, len = selectedList.length; i < len; i++) {
            var id = data[selectedList[i]].ideaid || data[selectedList[i]].creativeid;
            ids.push(id);
        }

        return ids;
    },
    
    
    /**
	 * 获取选中行的数据
	 * @param {Object} id 创意信息得到的数据 不包含ideaid
	 * @param {Object} action action实例
	 * @return {Array} ids [planid, planid……]传空数组代表全部
	 */
    getSelected : function (id,action) {
        var me = action,
            selectedList = me.selectedList,
            data = me.getContext('ideaListData'),
            i, len, ids = [];
		
		if(id.length != 0) {
			for( i = 0, len = selectedList.length; i < len; i++) {
				var dat = {};
				for(var j = 0, l = id.length; j < l; j++) {
					if (id[j] == "ideaid"){
						dat[id[j]] = data[selectedList[i]].ideaid || data[selectedList[i]].creativeid;
					}
					else{
						dat[id[j]] = data[selectedList[i]][id[j]] ;
					}
					
                }
				ids.push(dat);
			}
		}
	    else {//获取所有的数据
	    	for( i = 0, len = selectedList.length; i < len; i++) {
	    		ids.push(data[selectedList[i]]);
	    	}
	    }
	   return ids;
    },

    /**
     * 表格行内操作事件代理器
     */
    getTableInlineHandler: function(action) {
        var me = action;
        return function(e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
                logParams = {},
                acname = nirvana.CURRENT_MANAGE_ACTION_NAME,
                level;
            if (target.getAttribute('level')) { //by liuyutong@baidu.com
                level = target.getAttribute('level');
                switch (level) {

                    // 跳转 到计划层级
                    case 'plan':
                        er.locator.redirect('/manage/unit~ignoreState=1&navLevel=plan&planid=' + target.getAttribute('planid'));
                        break;

                        // 跳转 到单元层级
                    case 'unit':
                        er.locator.redirect('/manage/keyword~ignoreState=1&navLevel=unit&unitid=' + target.getAttribute('unitid'));
                        break;
                    default:
                        break;
                }
            } else {
                var type;
                while (target && target.tagName.toUpperCase() != "BODY" && target.id != 'ctrltableideaTableListbody') {
                    if (target.className && target.className == 'status_op_btn') {
                        ideaLib.doInlinePause(target, action)
                        break;
                    }
                    if (baidu.dom.hasClass(target, 'edit_btn') || baidu.dom.hasClass(target, 'copy_btn')) { //编辑复制创意
                        type = target.getAttribute('edittype');
                        switch (type) {
                            case 'ideaid':
                                if (acname == 'appendIdea') {
                                    ideaLib.editAppendIdea(me, target);
                                } else {
                                    ideaLib.editIdea(me, target);
                                }

                                break;
                            case 'copyAppendIdea':
                                ideaLib.copyAppendIdea(me, target, 'sublink');
                                break;
                            case 'copyApp':
                                ideaLib.copyAppendIdea(me, target, 'app');
                                break;
                            case 'appname':
                                ideaLib.editAppendIdea(me, target);
                                break;

                        }
                        break;
                    }

                    //小灯泡 by Tongyao
                    if (baidu.dom.hasClass(target, 'status_icon')) {
                        logParams.target = "statusIcon_btn";
                        var params = target.getAttribute('data'),
                            actype = nirvana.CURRENT_MANAGE_ACTION_NAME,
                            level = (actype == 'appendIdea' ? 'creativeinfo' : 'ideainfo'),
                            prm = {
                                type: level,
                                params: params
                            };
                        if (actype != 'appendIdea') { //附加创意的时候不传action了
                            prm.action = me;
                        }
                        manage.offlineReason.openSubAction(prm);
                        break;
                    }

                    target = target.parentNode;
                }
                if (logParams.target) {
                    NIRVANA_LOG.send(logParams);
                }
            }
        };
    },

    /**
     * 复制附加创意
     */
    copyAppendIdea: function(action, target, from) {
        var me = action,
            logParams = {},
            list = ui.util.get('ideaTableList').datasource,
            ideaid = target.getAttribute('ideaid');
        var item = ideaLib.getIdeaInforById(ideaid);
        var param = {
            ideaid: ideaid,
            item: item,
            from: from
        };

        nirvana.manage.createSubAction.copyAppendIdea(param);
    },

    /**
     * 编辑创意
     */
    editIdea: function(action, target) {
        var me = action,
            logParams = {};
        logParams.target = "editInlineIdea_btn";
        var ideatype = me.getContext("ideatype");
        if (!ideatype) {
            ideatype = 0;
            //普通创意
        }

        var list = ui.util.get('ideaTableList').datasource,
            ideaid = target.getAttribute('ideaid'),
            item = baidu.array.filter(list, function(item, i) { //获取编辑创意的属性
                return item.ideaid == ideaid;
            })[0];

        var param = {
            type: 'edit',
            ideaid: target.getAttribute('ideaid'),
            ideatype: ideatype
            //item : item
        };
        if (ideatype != 0) { //本地创意的时候把创意信息传过去
            param.item = item;
        }
        nirvana.manage.createSubAction.idea(param);

    },
    getIdeaInforById: function(ideaid) {

        var idSplit = ideaid.split('_'),
            list = ui.util.get('ideaTableList').datasource,
            item = {};
        if (idSplit.length == 2) { //影子创意的前面有shadow_
            ideaid = idSplit[1];
        }

        item = baidu.array.filter(list, function(item, i) { //获取编辑创意的属性
            return item.creativeid == ideaid;
        })[0];
        return item;

    },
    /**
     *附件创意id处理
     */
    getRealIdeaId: function(ideaid) {
        var idSplit = ideaid.split('_');
        if (idSplit.length == 2) { //影子创意的前面有shadow_
            ideaid = idSplit[1];
        }
        return ideaid;

    },
    /**
     *编辑附加创意
     */
    editAppendIdea: function(action, target) {
        var me = action,
            list = ui.util.get('ideaTableList').datasource,
            ideaid = target.getAttribute('ideaid'),
            isShadow = false,
            appendIdeaType = me.getContext('appendIdeaType');


        var manage_createSubAction = nirvana.manage.createSubAction.appendIdea;

        var item = ideaLib.getIdeaInforById(ideaid);
        //debugger;
        if (appendIdeaType == 'sublink') {
            if (item.shadowcreativeid && item.shadowcreativeid != "") { //有影子创意的时候只能编辑影子创意
                isShadow = true;
            }
        }

        var param = {
            type: 'edit',
            ideaid: ideaid,
            item: item,
            appendIdeaType: appendIdeaType
        };
        if (isShadow) { //编辑影子创意的时候
            param.isShadow = true;
        }

        if (appendIdeaType == 'app') {
            param.param = {};

            fbs.appendIdea.getRelatedApps({
                onSuccess: function(response) {
                    var data = response.data.listData,
                        len = data.length;


                    if (len == 0) {
                        param.appendIdeaType = 'no-app';
                    } else {
                        param.param.appListData = data;
                    }
                    manage_createSubAction(param);
                }
            })
        } else {
            manage_createSubAction(param);
        }


    },
    /**
     * 执行行内启用暂停操作
     */

    doInlinePause: function(target, action) {
        var me = action,
            idArr, pauseSta,
            type = nirvana.CURRENT_MANAGE_ACTION_NAME,
            func = IDEA_DIFF_CONFIG.modPausestatInterface[type],
            logParams = {
                target: "inlineRunPause_btn"
            };



        idArr = ideaLib.getRowIdArr(target, me);
        var pauseStat = nirvana.manage.getPauseStat(target, [0, 1]);
        logParams.pauseStat = pauseStat;
        NIRVANA_LOG.send(logParams);
        nirvana.manage.inserLoadingIcon(target);
        var param = {
            pausestat: pauseStat,
            onSuccess: function(response) {
                var modifyData = response.data,
                    field = 'ideaid';
                if (type == 'appendIdea') {
                    field = 'creativeid';
                };
                IDEA_DIFF_CONFIG.modCatchFun[type](field, modifyData);
                er.controller.fireMain('reload', {});
            },
            onFail: function() {
                ajaxFailDialog();
            }
        };
        if (type == 'appendIdea') {
            param.creativeid = idArr;
        } else {
            param.ideaid = idArr;
        }


        if (type == 'localIdea') {
            param.ideatype = me.getContext('ideatype');
        }
        func(param);
    },


    /**
     * 根据行内元素,获取一行的ID数组
     */
    getRowIdArr: function(target, action) {
        var me = action,
            data = me.getContext('ideaListData'),
            idArr = [],
            index,
            type = nirvana.CURRENT_MANAGE_ACTION_NAME;
        index = nirvana.manage.getRowIndex(target);
        if (type == 'appendIdea') {
            idArr.push(data[index].creativeid);
        } else {
            idArr.push(data[index].ideaid);
        }

        return idArr;
    },


    /**
     *获取创意数据
     */
    getIdeaData: function(action, param) {
        var me = action,
            param = param;
        var acname = nirvana.CURRENT_MANAGE_ACTION_NAME;
        if (acname == 'localIdea') { //本地创意和创意公用
            acname = 'idea';
        }
        if (acname == 'appendIdea' && me.getContext('appendIdeaType') == 'app') {
            //附加创意中app与子链不同
            acname = 'app';
        }
        nirvana.manage.UserDefine.getUserDefineList(acname, ideaLib.getUserDefineCallback(me, param)); //本地创意和普通创意公用自定义列
    },



    /**
     *获取自定义列后的回调函数
     */
    getUserDefineCallback: function(action, param) {
        var me = action;
        return function() {
            var ud = nirvana.manage.UserDefine,
                localLists = [],
                i,
                len,
                data = [];

            if (me.getContext('appendIdeaType') != 'app') {
                data.push(me.ideaTableField['ideaid']);
            }

            var acname = nirvana.CURRENT_MANAGE_ACTION_NAME;
            if (acname == 'localIdea') { //本地创意和创意公用
                acname = 'idea';
            }
            if (acname == 'appendIdea' && me.getContext('appendIdeaType') == 'app') {
                //附加创意中app与子链不同
                acname = 'app';
            }
            
            //i从1开始，是因为后端返回自定义列的第一个字段叫idea，而前端叫ideaid（已被push了）。从0开始的话data就push进去了一个undefined

            if (acname == 'app') {
                i = 0;
            } else {
                i = 1;
            }
            for (len = ud.attrList[acname].length; i < len; i++) {
                if (ud.attrList[acname][i] == 'stat') { //附加创意的状态字段叫stat。。。，转一下
                    if (me.getContext('appendIdeaType') == 'app') {
                        data.push(me.ideaTableField['appstat']);
                    } 
                    else {
                        data.push(me.ideaTableField['appendIdeastat']);
                    }

                } else if (ud.attrList[acname][i] != 'content') {
                    data.push(me.ideaTableField[ud.attrList[acname][i]]);
                }

            }

            me.currentFileds = data; //初始化table的列

            var actionName = nirvana.CURRENT_MANAGE_ACTION_NAME;
            switch (actionName) { //本地商户转全后重写

                case 'idea':
                    if(nirvana.acc.expControl.isArrowUser()) {
                        me.newTableModel.setFieldList(IDEA_REQUEST_FEILD)
                            .load(param);
                    }
                    else {
                        fbs.material.getAttribute('ideainfo', IDEA_REQUEST_FEILD, param);
                    }
                    break;

                case 'localIdea':
                    var publicField = LOCAL_IDEA_REQUEST_FEILD['public'];
                    for (var k = 0, l = publicField.length; k < l; k++) {
                        localLists.push(publicField[k]);
                        //每个类型都请求的列
                    }
                    var extraField = LOCAL_IDEA_REQUEST_FEILD['extra'][param.ideatype];
                    for (var k = 0, l = extraField.length; k < l; k++) {
                        localLists.push(extraField[k]);
                        //每个类型不同的列
                    }

                    param['fields'] = localLists;
                    if(nirvana.acc.expControl.isArrowUser()) {
                        // me.newTableModel.setFieldList(localLists)
                        //     .load(param);
                        me.newTableModel.load(param);
                    }
                    else {
                        fbs.localIdea.getLocalIdeaList(param);
                    }
                    
                    break;
                case 'appendIdea':
                    var field = APPEND_IDEA_REQUEST_FEILD;
                    if (me.getContext('appendIdeaType') == 'app') {
                        if (appendIdeaLib.userBindStatus + '' == '0') {
                            //如果为未绑定状态 将表格数据清空
                            me.setContext('tableFields', me.currentFileds);
                            me.setContext('ideaListData', '');
                            //隐藏翻页
                            baidu.hide($$('.manage_page')[0]);

                            me.setContext('noDataHtml', '');
                            me.repaint();
                            //修改多出的border
                            baidu.setStyle($$('.manage_table')[0], 'border-bottom', '0');
                            baidu.setStyle($$('.ui_table_body')[0], 'border-bottom', '0');
                            //ie7下table会多出一块
                            if (baidu.ie && baidu.ie == 7) {
                                baidu.setStyle($$('.ui_table_body')[0], 'display', 'none');
                            }
                            return;
                        }
                        field = APPEND_IDEA_APP_REQUEST_FEILD;
                    }
                    for (var k = 0, l = field.length; k < l; k++) {
                        localLists.push(field[k]);
                        //每个类型都请求的列
                    }
                    param['fields'] = localLists;
                    if(nirvana.acc.expControl.isArrowUser()) {
                        // me.newTableModel.setFieldList(localLists)
                        //     .load(param);
                        me.newTableModel.load(param);
                    }
                    else {
                        fbs.appendIdea.getAppendIdeaList(param);
                    }
                    break;
            }
        }
    },


    //获取创意列表响应函数
    getIdeaDataHandler: function(action) {
        var me = action;
        return function(data) {
            var status = data.status,
                listdata = [],
                exceed = false,
                controlMap = me._controlMap,
                addidea = controlMap.addidea,
                actionName = nirvana.CURRENT_MANAGE_ACTION_NAME;
            nirvana.manage.UPDATE_ID_ARR = [];
            nirvana.manage.NOW_TYPE = 'idea';
            nirvana.manage.NOW_DATA = data;

            if (status == 800) { // 数据量过大
                exceed = true;
            } else {
                if (actionName == 'localIdea') { //返回的数据格式不太一样。。。
                    listdata = data.data;
                } else {
                    listdata = data.data.listData;
                }

                var toggleCreativeAdd = (function() {
                    var addSublink = ui.util.get('addidea');
                    var addApp = ui.util.get('addAppSelect');

                    return function(disabled) {
                        addSublink.disable(disabled);
                        addApp.disable(disabled)
                    }

                })();


                if (actionName == 'appendIdea') {
                    var hasAppendIdea = me.getContext('hasAppendIdea'), navLevel = me.getContext('navLevel');
                    if (hasAppendIdea && (navLevel == 'unit')) {
                        toggleCreativeAdd(true);
                    } else {
                        toggleCreativeAdd(false);
                    }
                }


                /*if (actionName == 'appendIdea') {
                    if ((me.getContext('navLevel') == 'unit') && listdata.length) {
                        addidea.disable(true);
                    } else {
                        addidea.disable(false);
                    }
                }*/

            }
            /*if(actionName == 'appendIdea'){
              if(me.getContext('navLevel')=='unit'&&listdata.length>0){//已经有附加创意的单元，新建都不可用
                addidea.disable(true);
               }else{
                addidea.disable(false);
               }  
            }*/



            //如果忽略状态，表格也得清状态    by linfeng 2011-07-05
            nirvana.manage.resetTableStatus(me, "ideaTableList");

            var field = me.getContext("orderBy"),
                order = me.getContext("orderMethod"),
                result;

            //表格筛选
            result = nirvana.manage.FilterControl.tableFilterData(me, listdata);
            //根据context值进行排序
            result = nirvana.manage.orderData(result, field, order);

            //设置tab标签里面的数据 yanlingling
            nirvana.manage.tab.renderTabCount(me, result.length);

            ideaLib.setNoDataHtml(exceed, me);
            ideaLib.processData(result, me);
            nirvana.manage.noDataHtmlClick(me);
            // 融合更新状态+事件绑定，需要注意不要重复绑定事件
            if(me._controlMap.ideaTableList) {
                nirvana.fuseSuggestion.controller.update(me._controlMap.ideaTableList.main);
            }
        }
    },



    /**
     * 获取表格的字段渲染方法
     * @param {Object} action
     */
    getIdeaTableField: function(action) {
        var me = action,
            type = nirvana.CURRENT_MANAGE_ACTION_NAME;
        var res = {
            //app增加4个字段
            appname: {
                content: function(item) {
				    var title = baidu.encodeHTML(item.appname),
                        content = getCutString(item.appname, 30, "..");
                    return '<div class="edit_td edit_td_thin"><span title=' + title + '>' + content + '</span>' + '<a class="edit_btn edit_btn_thin edit_btn_right"  edittype="appname" title="查看" ideaid="' + item.creativeid + '"></a>' + '<a class="copy_btn"  edittype="copyApp" title="复制" ideaid="' + item.creativeid + '"></a>'

                    + '</div>';

                    htmlStr[htmlStr.length] = '<a class="edit_btn"  ideaid="' + creativeid + '"  edittype="ideaid"></a>';
                    htmlStr[htmlStr.length] = '<a class="copy_btn" edittype="copyAppendIdea" ideaid="' + creativeid + '"></a>';

                },
                title: 'App名称',
                filterable: true,
                locked: true,
                field: 'appname',
                width: 100
            },
            appdevicetype: {
                content: function(item) {
                    return ['非App', 'Android', 'Android HD', 'iPhone', 'iPad'][item.appdevicetype];
                },
                title: '系统类型',
                filterable: true,
                align: 'center',
                field: 'appdevicetype',
                width: 60
            },
            version: {
                content: function(item) {
                    return item.version;
                },
                title: '版本',
                field: 'version',
                filterable: true,
                width: 60
            },
            apimodtime: {
                content: function(item) {
                    return item.apimodtime;
                },
                title: '最近更新时间',
                field: 'apimodtime',
                sortable: true,
                noun: true,
                minWidth: 150,
                align: 'center',
                width: 80,
                nounName: 'App最近更新时间'
            },
            ideaid: { //普通创意、本地推广信息、蹊径（APP不需要该列）
                content: IDEA_DIFF_CONFIG.ideaidField[type](me),
                locked: true,
                title: IDEA_DIFF_CONFIG.ideaidTitle[type],
                width: 270,
                minWidth: 270
            },
            unitname: {
                content: function(item) {
                    var title = baidu.encodeHTML(item.unitname),
                        content = getCutString(item.unitname, 30, ".."),
                        html;

                    html = '<a title="' + title + '" " href="javascript:void(0);" unitid=' + item.unitid +
                        ' level = "unit" data-log="{target:' +
                        "'linkunit_lbl'" +
                        '}" >' + content +
                        '</a>';

                    if (me.getContext('fcaudit')) {
                        var param = {
                            userid: nirvana.env.USER_ID,
                            planid: item.planid,
                            unitid: item.unitid
                        };
                        if (type == 'localIdea') {
                            param.style = me.getContext('ideatype');
                        }

                        html += ideaLib.creativeAuditHTML("unit", type, param);
                    }
                    return html;
                },
                title: '推广单元',
                sortable: true,
                filterable: true,
                field: 'unitname',
                width: 80
            },
            planname: {
                content: function(item) {
                    var title = baidu.encodeHTML(item.planname),
                        content = getCutString(item.planname, 30, "..");

                    var html = '<a title="' + title + '" href="javascript:void(0);" planid=' + item.planid + ' level = "plan" data-log="{target:' + "'linkplan_lbl'" + '}" >' + content + '</a>';
                    if (me.getContext('fcaudit')) {
                        var param = {
                            userid: nirvana.env.USER_ID,
                            planid: item.planid
                        };
                        if (type == 'appendIdea') {
                            param.style = 5;
                            html += ideaLib.creativeAuditHTML("plan", me.getContext('appendIdeaType'), param);
                        } else {
                            html += ideaLib.creativeAuditHTML("plan", type, param);
                        }
                    }
                    return html;
                },
                title: '推广计划',
                sortable: true,
                filterable: true,
                field: 'planname',
                width: 80
            },

            ideastat: {
                content: function(item) {
                    var ideaid = item.ideaid || item.creativeid;
                    // by liuyutong@baidu.com
                    nirvana.manage.UPDATE_ID_ARR.push(ideaid);
                    return '<span class="idea_update_state" id="ideastat_update_' + ideaid + '">' + buildIdeaStat(item) + '</span>';
                },
                title: '状态',
                sortable: true,
                filterable: true,
                field: 'ideastat',
                width: 103,
                minWidth: 103,
                noun: true,
                nounName: '创意状态'
            },

            appendIdeastat: {
                content: function(item) {
                    var ideaid = item.creativeid;
                    // by liuyutong@baidu.com
                    nirvana.manage.UPDATE_ID_ARR.push(ideaid);
                    return '<span class="idea_update_state" id="ideastat_update_' + ideaid + '">' + buildIdeaStat(item) + '</span>';
                },
                title: '状态',
                sortable: true,
                filterable: true,
                field: 'appendIdeastat',
                width: 103,
                minWidth: 103,
                noun: true,
                nounName: '附加创意-蹊径子链'
            },

            appstat: {
                content: function(item) {
                    var ideaid = item.creativeid;
                    // by liuyutong@baidu.com
                    nirvana.manage.UPDATE_ID_ARR.push(ideaid);
                    return '<span class="idea_update_state" id="ideastat_update_' + ideaid + '">' + buildIdeaStat(item) + '</span>';
                },
                title: '状态',
                sortable: true,
                filterable: true,
                field: 'stat',
                width: 103,
                minWidth: 103,
                noun: true,
                nounName: '附加创意-App推广'
            },
            shows: {
                content: function(item) {
                    var data = item.shows;
                    if (nirvana.manage.hasToday(me)) { // 包含今天数据
                        data = '-';
                    }
                    if (data == '') { //SB doris
                        return STATISTICS_NODATA;
                    }
                    if (data == '-') {
                        return data;
                    }
                    return parseNumber(data);
                },
                field: 'shows',
                title: '展现',
                sortable: true,
                filterable: true,
                align: 'right',
                width: 40
            },
            clks: {
                content: function(item) {
                    var data = item.clks;
                    if (data == '') { //SB doris
                        return STATISTICS_NODATA;
                    }
                    if (data == '-') {
                        return data;
                    }
                    return parseNumber(data);
                },
                field: 'clks',
                title: '点击',
                sortable: true,
                filterable: true,
                align: 'right',
                width: 75
            },
            paysum: {
                content: function(item) {
                    if (item.paysum == '') { //SB doris
                        return fixed(STATISTICS_NODATA);
                    }
                    return fixed(item.paysum);
                },
                title: '消费',
                sortable: true,
                filterable: true,
                field: 'paysum',
                align: 'right',
                width: 40
            },
            trans: {
                content: function(item) {
                    var data = item.trans;
                    if (data == '') { //SB doris
                        return STATISTICS_NODATA;
                    }
                    if (data == '-') {
                        return data;
                    }
                    return parseNumber(data);
                },
                title: '转化(网页)',
                sortable: true,
                filterable: true,
                field: 'trans',
                align: 'right',
                width: 65,
                minWidth: 128,
                noun: true,
                nounName: "转化(网页)"
            },
            avgprice: {
                content: function(item) {
                    if (item.avgprice == '') { //SB doris
                        return fixed(STATISTICS_NODATA);
                    }
                    return fixed(item.avgprice);
                },
                title: '平均点击价格',
                field: 'avgprice',
                sortable: true,
                filterable: true,
                align: 'right',
                width: 125,
                minWidth: 150,
                noun: true
            },
            clkrate: {
                content: function(item) {
                    if (nirvana.manage.hasToday(me)) { // 包含今天数据
                        return '-';
                    }
                    if (item.clkrate == '') { //SB doris
                        return floatToPercent(STATISTICS_NODATA);
                    }
                    return floatToPercent(item.clkrate);
                },
                title: '点击率',
                align: 'right',
                sortable: true,
                filterable: true,
                field: 'clkrate',
                width: 85,
                minWidth: 110,
                noun: true
            },
            showpay: {
                content: function(item) {
                    if (item.showpay == '') { //SB doris
                        return fixed(STATISTICS_NODATA);
                    }
                    return fixed(item.showpay);
                },
                title: '千次展现消费',
                align: 'right',
                sortable: true,
                filterable: true,
                field: 'showpay',
                width: 140,
                minWidth: 165,
                noun: true
            }
        }
        return res;
    },

    /**
     * 获取审核html
     * @param {Object} position            二审提示话术位置 在单元名称下（unit）还是在计划名称（plan）下
     * @param {Object} actionname        当前action，不同action所对应二审的提示位置和url都不同
     * @param {Object} param            二审链接所带的参数
     */
    creativeAuditHTML: function(position, actionname, param) {
        var html = '',
            posConfig = IDEA_DIFF_CONFIG.auditUrl[position],
            url, info = "";
        if (posConfig && (url = posConfig[actionname])) {
            for (var item in param) {
                url += item + '=' + param[item] + '&';
            }
            url = url.slice(0, -1);
            switch (position) {
                case "plan":
                    info = "审核该计划";
                    break;
                case "unit":
                    info = "审核该单元";
                    break;
                default:
                    break;
            }
            html = '<div><a href="' + url + '" target="_blank">' + info + '</a></div>';
        }
        return html;

    },


    /**
     * 获取本地创意列表的响应函数
     * @param {Object} data
     */

    getIdeaTypeHandler: function(action) {
        var action;

        return function(data) {
            var list = data.data.typelist,
                me = action,
                ideatype = [];

            for (var i = 0; i < list.length; i++) {
                var temp = {};
                temp.value = list[i];
                temp.text = LOCAL_IDEA_TYPE[list[i]];
                ideatype.push(temp)
            }
            me.setContext('ideatypeSelect', ideatype);
            me.setContext('ideatypeSelectValue', list[0]);
            //list[0]为当前用户的创意类型
            ui.util.get('ideatypeSelect').options = ideatype;
            //要设置option才可以   。。。。。
            ui.util.get('ideatypeSelect').value = list[0];
            ui.util.get('ideatypeSelect').render(ui.util.get('ideatypeSelect').main);
            var nowlevel = me.getContext('navLevel');
            if (list.length != 1 && nowlevel == 'account') { //只有一种创意类型的时候  隐藏 
                baidu.dom.removeClass(baidu.g('localQuery'), 'display_none');
            }
            if (nowlevel == 'account') { //别的层级的ideatype都是在面包屑处拿的
                me.setContext('ideatype', list[0]);
            }

            me.getIdeaData();
            //获取创意列表  要依赖ideatype
            // me.repaint();

        }
    },


    /**
     *即时更新本地创意的状态
     */
    refreshLocalIdeaState: function(action) {
        var me = action,
            param = {
                starttime: me.getContext('startDate'),
                endtime: me.getContext('endDate'),
                limit: nirvana.limit_idea,
                onSuccess: ideaLib.refreshLocalIdeaStateHandler(me),
                onFail: function() {
                    ajaxFailDialog();
                },
                ideatype: me.getContext('ideatype')
            }
        if (me.getContext("unitid")) {
            param.condition = {};
            param.condition.field = 'unitid';
            param.condition.idset = [];
            param.condition.idset.push(me.getContext("unitid"));

        } else if (me.getContext("planid")) {
            param.condition = {};
            param.condition.field = 'planid';
            param.condition.idset = [];
            param.condition.idset.push(me.getContext("planid"));
        }
        param.nocache = true;
        param['fields'] = ['ideaid', 'pausestat', 'activestat', 'ideastat']
        fbs.localIdea.getLocalIdeaList(param);

    },


    /**
     *即时更新附加创意的状态
     */
    refreshAppendIdeaState: function(action) {
        var me = action,
            fields = ['creativeid', 'stat', 'pausestat', 'shadowpausestat', 'shadowstat', 'shadowcreativeid'],
            param = ideaLib.buildRefreshIdeaStateParam(me, fields, ideaLib.refreshAppendIdeaStateHandler(me));
        fbs.appendIdea.getAppendIdeaList(param);

    },


    /**
     *拼装即时更新状态的参数   就附加创意用  跟别的 参数格式不一样。。。。
     */
    buildRefreshIdeaStateParam: function(action, fields, successhandler) {
        var me = action,
            param = {
                starttime: me.getContext('startDate'),
                endtime: me.getContext('endDate'),
                limit: nirvana.limit_idea,
                creativetype: me.getContext('appendIdeaType'),
                onSuccess: successhandler,
                onFail: function() {
                    ajaxFailDialog();
                }

            }

        if (me.getContext("unitid")) {
            param.condition = {};
            //param.condition.field ='unitid';
            param.condition.unitid = [];
            param.condition.unitid.push(me.getContext("unitid"));

        } else if (me.getContext("planid")) {
            param.condition = {};
            //param.condition.field ='planid';
            param.condition.planid = [];
            param.condition.planid.push(me.getContext("planid"));
        }
        param['nocache'] = true;
        param['fields'] = fields; // ['ideaid','pausestat', 'activestat','ideastat']
        // func(param);//fbs.localIdea.getLocalIdeaList(param);
        return param;
    },

    /**
     *处理函数
     */

    refreshLocalIdeaStateHandler: function(action) {
        var me = action;
        return function(data) {
            var now_id, result, param = {}, levelId = "ideaid",
                stateId = "ideastat",
                data = data.data;

            for (var i = 0, len = data.length; i < len; i++) {
                result = data[i];
                now_id = baidu.g(stateId + '_update_' + result[levelId]);
                //console.log(now_id);
                if (now_id) {

                    now_id.innerHTML = buildIdeaStat(result);
                    
                }
            }
        }
    },

    /**
     * 更新附加创意窗台回调函数
     */
    refreshAppendIdeaStateHandler: function(action) {
        var me = action;
        return function(data) {
            var now_id,
            result,
            param = {},
            levelId = "creativeid",
                stateId = "ideastat",
                data = data.data.listData;

            for (var i = 0, len = data.length; i < len; i++) {
                result = data[i];
                now_id = baidu.g(stateId + '_update_' + result[levelId]);
                if (now_id) {
                    now_id.innerHTML = buildIdeaStat(result);

                }
            }
        }
    }

    ,

    /**
     *添加创意
     */
    addIdeaHandler: function(action) {
        var me = action;
        return function() {
            var unitid = me.getContext('unitid'),
                planid = me.getContext('planid'),
                changeable = false,
                param = {},
                ideatype = me.getContext('ideatype'),
                planname = me.getContext('planname'),
                unitname = me.getContext('unitname');

            if (typeof ideatype == 'undefined') {
                ideatype = 0;
            }


            /**
             *新建普通和本地创意
             */

            function createSub(planid, unitid, changeable, ideatype, planname, unitname) {
                nirvana.manage.createSubAction.idea({
                    planid: planid,
                    unitid: unitid,
                    changeable: changeable, // 层级是否可编辑
                    ideatype: ideatype,
                    planname: planname,
                    unitname: unitname
                });
            }

            /**
             *新建附加创意
             */

            function createAppendIdeaSub(planid, unitid, changeable, planname, unitname, type, param) {
                nirvana.manage.createSubAction.appendIdea({
                    planid: planid,
                    unitid: unitid,
                    changeable: changeable, // 层级是否可编辑
                    appendIdeaType: type,
                    planname: planname,
                    unitname: unitname,
                    type: 'add', //add||edit
                    param: param
                });
            }

            var acname = nirvana.CURRENT_MANAGE_ACTION_NAME;
            if (acname == 'localIdea') { //本地创意和创意公用
                acname = 'idea';
            }

            if (acname == 'appendIdea') { // 
                var appendIdeaType = me.getContext('appendIdeaType');


                /*if (appendIdeaType == 'app') {
                    fbs.appendIdea.getRelatedApps({
                        onSuccess: function(response) {
                            var data = response.data.listData,
                                len = data.length;
                            if (len == 0) {
                                appendIdeaType = 'no-app';
                            } else {
                                param.appListData = data;
                            }
                            createAppendIdeaSub(planid, unitid, changeable, planname, unitname, appendIdeaType, param);
                        },
                        onFail: function() {
                            ajaxFailDialog();
                        }
                    });
                } else { 由于App的升级导致app和sublink已经不再用同一个添加按钮，这段被注释的可以下掉*/
                    createAppendIdeaSub(planid, unitid, changeable, planname, unitname, appendIdeaType, param);
                /*}  */

            } else {
                if (!unitid) {
                    changeable = planid ? false : true;
                    createSub(planid, unitid, changeable, ideatype, planname, unitname);
                    return;
                }
                // 如果是在单元层级，首先获取单元下创意的数量，如果达到上限，则不能添加
                fbs.material.getCount({
                    countParam: {
                        mtlLevel: 'unitinfo',
                        mtlId: unitid,
                        targetLevel: 'ideainfo'
                    },
                    onSuccess: function(response) {
                        if (response.data >= IDEA_THRESHOLD) { //数量到达上限
                            ui.Dialog.alert({
                                title: '通知',
                                content: nirvana.config.ERROR.IDEA.ADD['712']
                            });
                        } else {
                            createSub(planid, unitid, changeable, ideatype, planname, unitname);
                        }
                    },
                    onFail: function(response) {
                        ajaxFailDialog();
                    }
                });
            }


        }
    },

    /**
     *启用/暂停 删除的处理
     */
    operationHandler: function(action) {
        var me = action,
            controlMap = me._controlMap;
        var normalLib = nirvana.idea.normalIdea.lib;
        return function(selected) {
            var title = '',
                msg = '',
                len = me.selectedList.length,
                type = nirvana.CURRENT_MANAGE_ACTION_NAME;;

            switch (selected) {
                case 'start':
                    title = IDEA_DIFF_CONFIG.startTitle[type];
                    msg = IDEA_DIFF_CONFIG.startTip[type];
                    break;
                case 'pause':
                    title = IDEA_DIFF_CONFIG.pauseTitle[type];
                    msg = IDEA_DIFF_CONFIG.pauseTip[type];
                    break;
                case 'delete':
                    title = IDEA_DIFF_CONFIG.deleteTitle[type];
                    msg = IDEA_DIFF_CONFIG.deleteTip[type](len); //'您确定删除所选的' +len+'个创意吗？删除操作不可恢复。';
                    break;
                case 'url'://修改默认url
                   
                case 'miurl'://修改移动访问url
                    var item = nirvana.manage.ideaLib.getSelected([],me)
                    normalLib.modUrl(selected, me, item);
                    break;
            }
            if (selected != "url" && selected != "miurl"){
            	ui.Dialog.confirm({
                title: title,
                content: msg,
                onok: ideaLib.doOperationHandler(me),
                optype: selected
                });
            }
            

        }
    },


    /**
     * 删除附加创意事件处理，因为附加创意删除是单独的一个按钮 ，单独处理
     */
    delAppendIdeaHandler: function(action) {
        return function() {
            var me = action,
                type = nirvana.CURRENT_MANAGE_ACTION_NAME,
                title = IDEA_DIFF_CONFIG.deleteTitle[type],

                len = me.selectedList.length,
                msg = IDEA_DIFF_CONFIG.deleteTip[type](len); //'您确定删除所选的' +len+'个创意吗？删除操作不可恢复。';
            ui.Dialog.confirm({
                title: title,
                content: msg,
                onok: ideaLib.doOperationHandler(me),
                optype: 'delete'

            });

        }


    },


    doOperationHandler: function(action) {
        var me = action,
            controlMap = me._controlMap;
        return function(dialog) {
            var dialog = dialog,
                func, //需要调用的接口函数
                pauseStat, //0启用,1暂停
                ideaid = ideaLib.getSelectedId(me),
                param = {
                    onSuccess: ideaLib.operationSuccessHandler(me),
                    onFail: ideaLib.operationFailHandler(me)
                },
                type = nirvana.CURRENT_MANAGE_ACTION_NAME,
                ideatype = me.getContext('ideatype');
            if (type == 'appendIdea') { //附加创意的id叫creativeid。。。。
                param.creativeid = ideaid;
            } else {
                param.ideaid = ideaid;
            }
            if (ideatype && ideatype != 0) { //不是普通创意的时候,本地创意要传ideatype
                param.ideatype = ideatype;
            }

            switch (dialog.args.optype) {
                case 'start':
                    func = IDEA_DIFF_CONFIG.modPausestatInterface[type];
                    pauseStat = 0;
                    break;
                case 'pause':
                    func = IDEA_DIFF_CONFIG.modPausestatInterface[type];
                    pauseStat = 1;
                    break;
                case 'delete':
                    func = IDEA_DIFF_CONFIG.delInterface[type];
                    param.onSuccess = function(response) {
                        IDEA_DIFF_CONFIG.clearCacheFun[type](); //清空缓存
                        me.refresh();
                    };
            }

            if (typeof pauseStat != 'undefined') {
                param.pausestat = pauseStat;
            }
            func(param);

        }
    },

    operationSuccessHandler: function(action) {
        var me = action;
        return function(response) {
            var modifyData = response.data,
                type = nirvana.CURRENT_MANAGE_ACTION_NAME,
                field = 'ideaid';
            if (type == 'appendIdea') {
                field = 'creativeid';
            }
            IDEA_DIFF_CONFIG.modCatchFun[type](field, modifyData);

            me.refresh();
        };
    },

    operationFailHandler: function(action) {
        var me = action;
        return function(data) {
            ajaxFailDialog();
        }
    },



    /**
     * 点击激活时进行的提示操作
     * @returns {Function} 弹窗显示函数
     */
    activeClickHandler: function(action) { //先不提
        var me = action,
            controlMap = me._controlMap,
            type = nirvana.CURRENT_MANAGE_ACTION_NAME;
        return function() {
            ui.Dialog.confirm({
                title: IDEA_DIFF_CONFIG.activeTitle[type],
                content: IDEA_DIFF_CONFIG.activeTip[type],
                onok: ideaLib.activeHandler(me)
            });
        };
    },



    /**
     * 激活所选的
     * @returns {Function} 激活所选函数
     */
    activeHandler: function(action) {
        var me = action,
            controlMap = me._controlMap;
        return function(dialog) {
            var dialog = dialog,
                type = nirvana.CURRENT_MANAGE_ACTION_NAME,
                func = IDEA_DIFF_CONFIG.activeInterface[type], //需要调用的接口函数
                ideaid = ideaLib.getSelectedId(me),
                param = {
                    ideaid: ideaid,
                    activestat: '0',
                    onSuccess: ideaLib.operationSuccessHandler(me),
                    onFail: ideaLib.operationFailHandler(me)
                };
            if (type == 'localIdea') {
                param.ideatype = me.getContext('ideatype');
            }
            func(param);
        }
    }



}
var ideaLib = nirvana.manage.ideaLib;



/**
 * 创意 通用函数库
 * @author tongyao@baidu.com wanghuijun@baidu.com  以前在idea.js里面 搬家by yanlingling
 */

var IDEA_RENDER = {
    lineBreak: function(str) {
        return str.replace(/\^/g, '<span class="linebreak">^</span>');
    },

    idea: function(idea, className) {
        className = className || 'idea';
        var html = [];

        html[html.length] = '<div class="' + className + '">';
        html[html.length] = '<h3>' + insertWbr(IDEA_RENDER.lineBreak(IDEA_RENDER.wildcard(idea[0]))) + '</h3>';
        html[html.length] = '<p>' + insertWbr(IDEA_RENDER.lineBreak(IDEA_RENDER.wildcard(idea[1] + idea[2]))) + '</p>';
        html[html.length] = '<h4><span>' + insertWbr(unescapeHTML(idea[3])) + '</span></h4></div>';

        return html;
    },

    wildcard: function(d) {
        d = baidu.encodeHTML(baidu.decodeHTML(d));

        if (d.indexOf('{关键词}{') != -1) {
            var tmp = [];
            d = d.split('{关键词}{');
            tmp.push(d[0]);
            for (var i = 1, len = d.length; i < len; i++) {
                if (d[i].indexOf('}') == -1) {
                    tmp.push('{关键词}{' + d[i]);
                } else {
                    d[i] = '<u>' + d[i].replace(/}/, '</u>');
                    tmp.push(d[i]);
                }
            }
            return tmp.join("");
        } else {
            return d;
        }
    }
}

/**
 * 切换编辑前后创意
 * @param {Object} e
 */

    function viewIdeaSwap(e, oid, nid) {
        var il = baidu.dom.children(e.parentNode.parentNode);
        var oIdea = il[0];
        var nIdea = il[1];

        if (e.innerHTML == "查看修改后创意及状态") {
            e.innerHTML = "查看修改前创意及状态";
            baidu.dom.addClass(oIdea, 'display_none');
            baidu.hide("StateCy_" + oid);
            baidu.dom.removeClass(nIdea, 'display_none');
            baidu.show("StateCy_shadow" + nid);
            //baidu.hide('IdeaEdit_' + oid);
        } else {
            e.innerHTML = "查看修改后创意及状态";
            baidu.dom.removeClass(oIdea, 'display_none');
            baidu.show("StateCy_" + oid);
            baidu.dom.addClass(nIdea, 'display_none');
            baidu.hide("StateCy_shadow" + nid);
            //baidu.show('IdeaEdit_' + oid);
        }
    }

    // :{ :} 两转义字符的占位符及正则形式
    // 编辑创意时，输入:{显示{，直接输入{则会自动补全大括号作为通配符
var BracketsReplacer = [
    '[$replace-l$]', // :{
'[$replace-r$]', // :}
new RegExp('\\[\\$replace\\-l\\$\\]', 'g'),
new RegExp('\\[\\$replace\\-r\\$\\]', 'g')];

/**
 * 将创意转为旧格式，保存创意时需要将输入内容转为旧格式，即 :{ --> {  {***} --> {关键词}{***}
 * @param {Array} d
 * @return {Array}
 */

function ideaToOldFormat(d) {
    var len = Math.min(d.length, 3); //只对前三项做处理，标题、描述1/2
    for (var i = 0; i < len; i++) {
        //:{ 临时转换为占位符[$replace-l$]
        d[i] = d[i].replace(/:\{/g, BracketsReplacer[0]).replace(/:\}/g, BracketsReplacer[1]);

        //将{通配符内容}转换为{关键词}{通配符内容}
        d[i] = d[i].replace(/\{(.*?)\}/g, function($0, $1) {
            return '{关键词}{' + $1.replace(/&amp;/g, '&') + '}';
        });

        //将占位符[$replace-l$]转换回{，输入:{显示为{
        d[i] = d[i].replace(BracketsReplacer[2], '{').replace(BracketsReplacer[3], '}');
    }

    return d;
}

/**
 * 将创意转为新格式
 * @param {Array} d
 * @return {Array}
 */

function ideaToNewFormat(d) {
    var len = Math.min(d.length, 3); //只对前三项做处理，标题、描述1/2

    for (var i = 0; i < len; i++) {
        while (d[i].indexOf('{关键词}{') != -1) {
            //将{关键词}{转换为{
            var _tmp = d[i].replace(/\{关键词\}\{/, '');
            if (_tmp.indexOf('}') == -1) {
                d[i] = d[i].replace(/\{关键词\}\{/, '{');
                break;
            }

            //将{关键词}{..}转换为[$replace-l$]..[$replace-r$]
            d[i] = d[i].replace(/\{关键词\}\{(.*?)\}/g, function($0, $1) {
                return BracketsReplacer[0] + $1 + BracketsReplacer[1];
            });
        }

        //将没有闭合的大括号转换为转义字符:{，将占位符转换回{}
        d[i] = d[i].replace(/\{/g, ':{').replace(/\}/g, ':}').replace(BracketsReplacer[2], '{').replace(BracketsReplacer[3], '}');
    }

    return d;
}

/**
 * 飘黄新格式通配符的字符串
 * @param {Object} d
 */

function wildcardToShow(d) {
    var wcot = [0, 0];
    d = baidu.encodeHTML(ideaToNewFormat(ideaToOldFormat([d]))[0]);

    var tmp = d.replace(/:\{/g, BracketsReplacer[0]).replace(/:\}/g, BracketsReplacer[1]).replace(/\{/g, function() {
        wcot[0]++;
        return '<u>';
    }).replace(/\}/g, function() {
        wcot[1]++;
        return '</u>';
    }).replace(BracketsReplacer[2], '{').replace(BracketsReplacer[3], '}');

    while (wcot[0] > wcot[1]) {
        tmp += "</u>"
        wcot[1]++;
    }
    return tmp;
}

/**
 * 自动补全通配符
 * @param {Object} event
 */

function wildcardAuto(event) {
    var e = event || window.event,
        o = e.target || e.srcElement,
        pos = getCursorPosition(o),
        str;

    //shit + { 并且{前边不是:
    if (e.shiftKey && e.keyCode == '219' && o.value.substr(pos - 2, 1) != ':') {
        str = o.value.substr(0, pos) + '}' + o.value.substr(pos);
        o.value = str;
        movePoint(o, pos - 5);
    }
}

/**
 * 移动光标
 * @param {Object} o
 * @param {Object} pos
 */

function movePoint(o, pos) {
    pos = pos += 5;
    if (o.createTextRange) {
        o.focus();
        var r = o.createTextRange();
        r.moveStart('character', pos);
        r.moveEnd('character', pos);
        r.collapse(true);
        r.select();
    } else {
        o.selectionStart = pos;
        o.selectionEnd = pos;
    }
}

/**
 * 取得input里光标位置
 * @param {Object} o
 */

function getCursorPosition(o) {
    if (o.createTextRange) {
        var selection = document.selection,
            range1 = selection.createRange(),
            range2 = range1.duplicate();

        o.select();

        try {
            range1.setEndPoint("StartToStart", selection.createRange());
            var pos = range1.text.length;
            range1.collapse(false);
        } catch (e) {
            var pos = -1;
        }

        range2.select();

        return pos;
    } else {
        return (o.selectionStart);
    }
}

/**
 * 取得input里选中的部分，用于插入通配符
 * @param {Object} o
 */

function getInputSelectPosition(o) {
    var start = 0,
        end = 0;
    if (o.createTextRange) {
        var r = document.selection.createRange().duplicate();
        if (r.text == '') {
            start = end = getCursorPosition(o);
        } else {
            end = getCursorPosition(o);
            start = end - r.text.length;
        }
    } else {
        start = o.selectionStart;
        end = o.selectionEnd;
    }
    return ([start, end]);
}

/**
 * 创意状态列
 * @param {Object} result
 */

function buildIdeaStat(result) {
    // mod by huiyao 2013-05-10: 格式化下述模板，模板里添加三个属性：2个act，一个actLevel
    // 用于事件代理事件处理
    var act = result.pausestat == 0 ? 'pauseIdea' : 'enableIdea';

    var className, text, shadowClassName, shadowText, html,
        _bc = '',
        matchClass = '',
        matchClass2 = '',
        display = "display:none;",
        tpl = '<div id="StateCy_{2}" style="{3}" class="{0}">'
            +     '<span class="status_text" style="{4}">'
            +         '<span class="status_icon{6}" act="viewOffLineReason" '
            +                'data=\'{\"ideaid\":\"{2}\"}\'>'
            +         '</span>'
            +         '{1} '
            +     '</span> '
            +     '<span class="status_op_btn{5}" act="' + act + '" '
            +            'actLevel="idea" '
            +            'data-log="{target:\'status_op_idea_{7}_btn\'}">'
            +     '</span>'
            + '</div>',
        statusTextMap = STATE_LIST['IDEA'],
        pauseStat = result.pausestat,
        shadowTitle = result.shadow_title || result.shadowcreativeid, //||后面的是附件创意的 
        ideaId = result.ideaid || result.creativeid,
        shadowIdeaId = result.shadow_ideaid || result.shadowcreativeid,
        ideaStat = ((typeof result.ideastat == 'undefined') ? null : result.ideastat.toString()) || result.stat,
        shadowIdeaStat = (typeof result.shadow_ideastat != 'undefined') ? result.shadow_ideastat : result.shadowstat;
        //result.shadow_ideastat || result.shadowstat;//
    className = 'ideastatus_' + ideaStat + ' pausestat_' + pauseStat;
    text = statusTextMap[ideaStat];


    if (shadowTitle && shadowTitle != "" ) {
       _bc = 'background-color:#ffdfd5';

        shadowClassName = 'ideastatus_' + shadowIdeaStat;
        shadowText = statusTextMap[shadowIdeaStat];
    }
    //wsy 搬家方案--状态列 当有影子的时候 不显示粉红的背景色
    if ( result.hasBackgroundColor ){
        _bc = '';
    }
    if (nirvana.manage.UPDATE_ID_ARR_MATCH && nirvana.manage.UPDATE_ID_ARR_MATCH.length != 0) {
        matchClass = ' match_status_op_btn';
        matchClass2 = ' match_status_icon';
        nirvana.manage.UPDATE_ID_ARR_MATCH = [];
    }
    if (shadowTitle && shadowTitle != "") { //影子创意
        html = ui.format(tpl, className, text, ideaId, '', _bc, matchClass, matchClass2, '', ideaStat) + ui.format(tpl, shadowClassName, shadowText, 'shadow' + shadowIdeaId, display, '', matchClass, matchClass2, shadowIdeaStat);
    } else {
        html = ui.format(tpl, className, text, ideaId, '', _bc, matchClass, matchClass2, '', ideaStat);
    }

    
    // 读写分离，待升级之后不用这种方式了
    // by Leo Wang
    html = nirvana.acc.accService.processPause(pauseStat, html);

    return html;
}


/**
 *创意请求field集合
 */
IDEA_REQUEST_FEILD = [
    "ideaid", "unitname", "planname", "ideastat", "clks", "paysum",
    "shows", "trans", "avgprice", "clkrate", "showpay", "shadow_ideaid",
    "shadow_ideastat", "title", "shadow_title", "desc1", "shadow_desc1",
    "desc2", "shadow_desc2", "url", "shadow_url", "showurl", "shadow_showurl",
    "miurl", "shadow_miurl", "mshowurl", "shadow_mshowurl",
    "unitid", "planid", "pausestat", "activestat",
    'deviceprefer']; //获取设备属性  第一列的时候看显示哪个url


/**
 *附件创意请求field集合
 */
APPEND_IDEA_REQUEST_FEILD = ["creativeid", "unitid", "planid", "unitname", "planname",
    "clks", "paysum", "shows", "clkrate", "avgprice", "showpay",
    'content', 'stat', 'pausestat', 'shadowcreativeid',
    'shadowcontent', 'shadowstat', 'shadowpausestat'];

/**
 *App推广
 */
var APPEND_IDEA_APP_REQUEST_FEILD = ["creativeid", "appname", 'appdevicetype', 'version', 'apimodtime', "unitid", "planid", "unitname", "planname",
    "clks", "paysum", "shows", "clkrate", "avgprice", "showpay", 'stat', 'pausestat', 'creativeid', 'mcid'];