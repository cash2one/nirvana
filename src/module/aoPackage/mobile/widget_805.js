/**
 * Created with JetBrains WebStorm.
 * User: wangshiying
 * Date: 13-5-1
 * Time: 上午11:47
 * Mail:wangshiying@baidu.com
 * To change this template use File | Settings | File Templates.
 */
nirvana.aoPkgControl.widget806 =nirvana.aoPkgControl.widget805 = new er.Action({
    VIEW: 'aoPkgDetail',
    tip: {
        805: '805加底色（粉色）的关键词或创意最近3天内优化过，建议观察一段时间的网民点击情况，再做调整',
        806: '806加底色（粉色）的关键词或创意最近3天内优化过，建议观察一段时间的网民点击情况，再做调整'
    },
    reason: {
        1: '表示PC字段填了M地址',
        2: '表示M字段url被拒绝',
        3: '表示M字段填了PC地址',
        4: '表示M字段为空'
    },
    fields: {
        805: {
            0: [
                {
                    content: function(data) {
                        /* shadowtitle 不为空时，这个状态就是粉红色的？？？*/
                        return lib.idea.getIdeaCell(data);
                    },
                    title : '创意',
                    field: 'title',
                    width: 490,
                    minWidth: 490
                },
                {
                    content: function(data) {
                        var ideaid = data.ideaid || data.creativeid;
                      /*  nirvana.manage.UPDATE_ID_ARR.push(ideaid);问题1  ???*/
                      /* shadowtitle 不为空时，这个状态就是粉红色的？？？*/
                        return '<span class="idea_update_state" id="ideastat_update_' + ideaid + '">' + buildIdeaStat(data) + '</span>';
                    },
                    title: '当前状态',
                    field: 'ideastat',
                    width: 113
                },
                {
                    content: function(data) {
                        var me=this;
                        me.reason;
                        return nirvana.aoPkgConfig.SETTING.MOBILE.reason[data.reason]
                    },
                    title : '当前问题',
                    field: 'reason',
                    width: 297
                }
            ],
            1: [
                {
                    content: function(data) {
                       /* if(data.planstat == -1 || data.unitstat == -1 || data.wordstat == -1) {
                            return '<span class="ui_bubble" bubblesource="rankTable" href="javascript:void(0)" ' +
                                'index="' + i + '">' + getCutString(baidu.encodeHTML(data.showword +
                                (data.wordstat == -1 ? '[已删除]' : '')), 32, '...') + '</span>';
                        } else {*/
                            return '<a class="ui_bubble"  bubblesource="rankTable" ' +
                                'href="javascript:void(0)" index="' + data.winfoid + '" level="unit" ' +
                                'planname="' + data.planname + '" unitname="'+ data.unitname + '" name="' + baidu.encodeHTML(data.showword) + '">' +
                                getCutString(baidu.encodeHTML(data.showword), 32, '...') + '</a>';
                       /* }*/
                    },
                    title : '关键词',
                    field: 'showword',
                    width: 250,
                    minWidth: 250
                },,
                qStar.getTableField({ VIEW: 'QualityPkg' }),
                {
                    content: function(item){
                        var stat = nirvana.util.buildStat('word', item.wordstat, item.pausestat, {
                            winfoid: item.winfoid
                        });
                       /* nirvana.manage.UPDATE_ID_ARR.push(Number(item.winfoid));*/
                        return '<span class="word_update_state" id="wordstat_update_' + item.winfoid + '">' +
                            stat + '</span>';
                    },
                    title : '当前状态',
                    field: 'wordstat',
                    width: 113,
                    minWidth: 113
                },
                {
                    content: function(data) {
                        var me=this;
                        me.reason;
                        return nirvana.aoPkgConfig.SETTING.MOBILE.reason[data.reason]
                    },
                    title : '当前问题',
                    field: 'reason',
                    width: 247,
                    minWidth: 247
                },
                {
                    content: function() {
                        return '<a style="cursor: pointer" act="modifyDialog">优化关键词url</a>';
                    },
                    title : '操作',
                    width: 140,
                    minWidth: 140
                }
            ]
        },
        806: {
            0: [
                {
                    content: function(data) {
                        /* shadowtitle 不为空时，这个状态就是粉红色的？？？*/
                        return lib.idea.getIdeaCell(data);
                    },
                    title : '创意',
                    field: 'title',
                    width: 490,
                    minWidth: 490
                },
                {
                    content: function(data) {
                        var ideaid = data.ideaid || data.creativeid;
                        /*  nirvana.manage.UPDATE_ID_ARR.push(ideaid);问题1  ???*/
                        /* shadowtitle 不为空时，这个状态就是粉红色的？？？*/
                        return '<span class="idea_update_state" id="ideastat_update_' + ideaid + '">' + buildIdeaStat(data) + '</span>';
                    },
                    title: '当前状态',
                    field: 'ideastat',
                    width: 113
                },
                {
                    content: function(data) {
                        var me=this;
                        me.reason;
                        return nirvana.aoPkgConfig.SETTING.MOBILE.reason[data.reason]
                    },
                    title : '当前问题',
                    field: 'reason',
                    width: 297
                }
            ],
            1: [
                {
                    content: function(data) {
                        return data.showword
                    },
                    title : '关键词',
                    field: 'showword'
                },,
                qStar.getTableField({ VIEW: 'QualityPkg' }),
                {
                    content: function(data) {
                        return data.stage;
                    },
                    title : '当前状态',
                    field: 'stage',
                    width: 150,
                    minWidth: 150
                },
                {
                    content: function(data) {
                        var me=this;
                        me.reason;
                        return nirvana.aoPkgConfig.SETTING.MOBILE.reason[data.reason]
                    },
                    title : '当前问题',
                    field: 'reason',
                    width: 150,
                    minWidth: 150
                },
                {
                    content: function() {
                        return '<a style="cursor: pointer" act="modifyDialog">优化关键词url</a>';
                    },
                    title : '操作'
                }
            ]
        }
    },
    UI_PROP_MAP: {
        WidgetTab: {
            title: '*tabTitle',
            container: '*tabContainer'
        },
        WidgetTable: {
            fields : '*widgetTableFields',
            datasource : '*widgetTableData',
            select:'multi',
            noDataHtml : FILL_HTML.NO_DATA
        },
        WidgetPage: {
            page : '*pageNo',
            total : '*totalPage'
        }/*,
        // 计划下拉列表
        LevelPlan: {
            emptyLang: '全部推广计划',
            width: '154'
        },
        // 单元下拉列表
        LevelUnit: {
            emptyLang: '全部推广单元',
            width: '154'
        }*/
    },
    LevelPlan : null,
    LevelUnit : null,
    CONTEXT_INITER_MAP: {
        init: nirvana.aoPkgWidgetCommon.getInit({
            opttype_class: 'opttype_805'
        }),
        initTitle: function(callback) {
            var title = '搬家方案';
            this.setContext(
                'widget_title',
                '<span class="return">'
                    + nirvana.aoPkgConfig.SETTING[this.arg.appId.toUpperCase()].name
                    + '</span>'
                    + '<em>&gt;</em>' + title
            );
            callback();
        },
        setPageSize: function(callback) {
            var tab = this.getContext('tabIndex');
            if (tab == 0) {
                this.setContext('pageSize', 5);
            }
            callback();
        },
        initTab: function(callback) {
            this.setContext('tabTitle', ['创意', '关键词']);
            callback();
        },
        initTable: function(callback) {
            var me = this,
                opttypeid = me.getContext('opttypeid'),
                tableFields = me.fields[opttypeid],
                extra = this.getContext('extra');
            // 需要从tabFields[tab]取值
            var tab = this.getContext('tabIndex');
            tableFields = tableFields[tab];
            extra = tab == 0 ? {extra: 'idea'} : {extra: 'word'};
            me.setContext('widgetTableFields', tableFields);
            nirvana.aoPkgWidgetCommon.getDetail(me, function(data) {
                var items = data.detailresitems;
                baidu.each(items, function(item){
                    var data = item.data;
                    data.showqstat = me.getStarNumber();
                    if (data.isopted == 1) {
                        if (tab == 1) {
                            nirvana.aoPkgWidgetHandle.setModifiedInfo('winfoid', data.winfoid);
                        } else {
                            nirvana.aoPkgWidgetHandle.setModifiedInfo('ideaid', data.ideaid);
                        }
                    }
                });
                callback();
            }, extra);
        }
    },
    onentercomplete: function() {
        var me = this,
            controlMap = me._controlMap;
        me.batchBtnEnable(-1);

      /*  筛选相关，暂时注释掉
        me.LevelPlan = controlMap.LevelPlan;
        me.LevelUnit = controlMap.LevelUnit;
        me.getPlanList(me, true);*/
        // Modified by Wu Huiyao 解决因为修改lib.delegate的事件绑定方式引入的bug
        var delegateElem = ui.util.get('WidgetTable').main.parentNode;
        lib.delegate.init(delegateElem, me);
        nirvana.aoPkgWidgetHandle.basicClickHandler(me);

        var tab = ui.util.get('WidgetTab'),
            tabIndex = this.getContext('tabIndex');
        tab.select(tabIndex);
        tab.onselect = function(value) {
            me.setContext('tabIndex', value);
            me.setContext('extra', null);
            me.setContext('pageNo', 1);
            nirvana.aoPkgControl.widget.handle.refresh();
        };
        var table = ui.util.get('WidgetTable');
        table.onselect = function(select) {
            me.setContext('tableSelected', select);
            var temp=0,
                datasource = this.datasource,
                length=select.length;
            for(var i=0;i<length;i++){
               if(temp != 0 && datasource[select[i]].deviceprefer != 0 && datasource[select[i]].deviceprefer != temp){
                   temp=-1;
                   break;
               }else if(temp == 0 && datasource[select[i]].deviceprefer != temp){
                   temp = datasource[select[i]].deviceprefer ;
               }
            }
            if(length == 0) temp = -1;
            me.batchBtnEnable(temp);
        };
        var pcbtn = ui.util.get('WidgetModifyPC');
        pcbtn.onclick = function(){
           /* var tableSource = me.getContext('tableSelected');
            if(tableSource.length>0){

            }*/
        }

        // 隐藏按钮
        ui.util.get('WidgetApply').main.style.display = 'none';
    },
    onafterrender : function(){
        var me = this,
            controlMap = me._controlMap;
        controlMap.WidgetTable.main.onclick = me.getTableInlineHandler();
    },
    refresh: function() {
        nirvana.aoPkgControl.widget.handle.refresh();
    },
    modifyDialog: function() {
        alert("将要做的修改框！");
    },
    switchShadow: function() {
        var table = ui.util.get('WidgetTable'),
            curRow = table.getRow(table.curRow),
            idea = nirvana.aoPkgWidgetCommon.rows2Data(this, table.curRow)[0];
        // 获得单元格
        var cells = $$('.ui_table_tdcell', curRow);
        cells = [cells[1]];
        lib.idea.switchShadow(idea, cells);
    },
    editIdea: function() {
        alert("将要做的修改框！");
    },
    /**
     * 返回11，12，13，21，23之类的质量度
     */
    getStarNumber: function() {
        var params = this.arg.params, star;
        for (var key in params) {
            // if key starts with 'word_cnt'
            if (key.indexOf('word_cnt') === 0) {
                star = key.substr(9);
                break;
            }
        }
        return star;
    },
    /**
     * 设置两个批量修改按钮是否可用
     * @param {number} deviceprefer
     * 0 PC+M
     * 1 PC
     * 2 M
     */
    batchBtnEnable: function(deviceprefer){
        var pcbtn = ui.util.get('WidgetModifyPC');
        var mobilebtn = ui.util.get('WidgetModifyMobile');
        if (deviceprefer == 0){
            pcbtn.disable(false);
            mobilebtn.disable(false);
        }else if (deviceprefer == 1){
            pcbtn.disable(false);
            mobilebtn.disable(true);
        }else if(deviceprefer == 2){
            pcbtn.disable(true);
            mobilebtn.disable(false);
        }else {
            pcbtn.disable(true);
            mobilebtn.disable(true);
        }
    },
    getTableInlineHandler: function() {
        console.log('1');
        return function (e) {
            console.log('2');
            /*var event = e || window.event,
             target = event.target || event.srcElement,
             logParams = {},
             level,
             type;
             if(target.getAttribute('level')){//add by liuyutong@baidu.com
             level = target.getAttribute('level');
             switch(level) {

             // 跳转 到计划层级
             case 'plan' :
             er.locator.redirect('/manage/unit~ignoreState=1&navLevel=plan&planid=' + target.getAttribute('planid') );
             break;

             // 跳转 到单元层级
             case 'unit' :
             er.locator.redirect('/manage/keyword~ignoreState=1&navLevel=unit&unitid=' + target.getAttribute('unitid') );
             break;
             default:  break;
             }
             }else{
             while(target  && target != ui.util.get("wordTableList").main){
             if(target.className && target.className == 'status_op_btn'){
             alert(1);
             me.doInlinePause(target)
             break;
             }
             if(baidu.dom.hasClass(target,"edit_btn")){
             var current = nirvana.inline.currentLayer;
             if (current && current.parentNode) {
             current.parentNode.removeChild(current);
             }
             type = target.getAttribute("edittype");
             switch(type){
             case "bid":
             me.inlineBid(target);
             logParams.target = "editInlineBid_btn";
             break;
             case "wmatch":
             me.inlineWmatch(target);
             logParams.target = "editInlineWmatch_btn";
             break;
             case "wurl":
             me.inlineWurl(target);
             logParams.target = "editInlineWurl_btn";
             break;
             case "mwurl":
             me.inlineWurl(target,true);
             logParams.target = "editInlineMWurl_btn";
             break;
             case "wctrl":
             //关闭监控文件夹的浮出层
             ui.Bubble.hide();
             me.inlineWctrl(target);
             logParams.target = "editInlineWctrl_btn";
             break;
             }
             break;
             }

             //小灯泡 by Tongyao
             if(baidu.dom.hasClass(target, 'status_icon')){
             logParams.target = "statusIcon_btn";
             manage.offlineReason.openSubAction({
             type : 'wordinfo',
             params : target.getAttribute('data')
             });
             break;
             }
             target = target.parentNode;
             }
             if(logParams.target){
             NIRVANA_LOG.send(logParams);
             }
             }*/
        };
    },
    doInlinePause : function (target) {
        alert(2);
        var me = this,
            idArr, pauseSta,
            func = fbs.keyword.modPausestat,
            logParams = {
                target: "inlineRunPause_btn"
            };
        idArr = me.getRowIdArr(target);
        var pauseStat = nirvana.manage.getPauseStat(target,[0,1]);
        logParams.pauseStat = pauseStat;
        NIRVANA_LOG.send(logParams);
        nirvana.manage.inserLoadingIcon(target);
        func({
            winfoid: idArr,
            pausestat : pauseStat,
            onSuccess: function(response){
                var data = response;
                if (data.status != 300) {
                    var modifyData = response.data;
                    fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
                    fbs.material.ModCache('wordinfo', "winfoid", modifyData);
                    me.refresh();
                }
            },
            onFail: me.inlinePauseFailed
        });
    },
    // 请求创意诊断的数据
    request: function(ideaid, callback) {
        var params = {
            level: 'useracct',
            opttypeid: 805,
            condition: {
                extra: ideaid,
                recalculate: 1
            },

            onSuccess: function(json) {
                if (json.data
                    && json.data.detailresitems
                    && json.data.detailresitems[0]) {

                    var data = json.data.detailresitems[0].data,
                        winfoids = data.winfoids.split(','),
                        showword = eval(data.showword),
                        reason = data.reason,
                        wordList = [];

                    for (var i = 0, len = showword.length; i < len; i++) {
                        wordList.push({
                            winfoid: winfoids[i] || 0,
                            showword: showword[i]
                        });
                    }
                    if (wordList.length === 0) {
                        wordList = null;
                    }

                    callback(wordList, reason);
                } else {
                    callback();
                }
            },
            onFail: function() {
                callback();
            }
        };

        fbs.nikon.getDetail(params);
    }
    /**
     * 获取计划列表
     * @param {Object} callback
     * @param {Object} me
     * @param boolean isIdea 是否是创意层级调用（需做些特殊处理）
     */
   /* getPlanList: function(me,isIdea){
        var controlMap = me._controlMap,
            LevelPlan = controlMap.LevelPlan,
            LevelUnit = controlMap.LevelUnit;
        var requestFun = fbs.plan.getNameList;
        requestFun({
            onSuccess: function(response){
                var data = response.data.listData,
                    len = data.length,
                    plandata = [{
                        value: 0,
                        text: '全部推广计划',
                        deviceprefer:0
                    }];
                if (len == 0) {
                    plandata.push({
                        value : -1,
                        text : '当前没有推广计划，请您先新建计划',
                        deviceprefer:-1
                    });
                } else {
                    for (var i = 0; i < len; i++) {
                        plandata.push({
                            value: data[i].planid,
                            text: baidu.encodeHTML(data[i].planname),
                            deviceprefer:data[i].deviceprefer
                        });
                    }
                }
                LevelPlan.fill(plandata);
            },
            onFail: function(response){
                ajaxFailDialog();
            }
        });
        // 给计划列表挂载事件获取单元列表
        LevelPlan.onselect = function(selected) {
            if (selected == -1) {
                return false;
            }
            // 选择层级时，清除错误信息
            if (baidu.g('LevelError')) {
                baidu.addClass('LevelError', 'hide');
            }
            if (selected == 0) {
                LevelUnit.fill([{
                    value: 0,
                    text: '全部推广单元',
                    deviceprefer:0
                }]);
                return;
            }
            //
            me.batchBtnEnable(this.options[selected].deviceprefer);
            me.getUnitList(selected, me);
        };
    },*/
    /**
     * 获取单元列表
     * @param {Object} selected 选择的计划id
     * @param {Object} me
     */
   /* getUnitList : function(planid, me) {
        var controlMap = me._controlMap,
            LevelPlan = controlMap.LevelPlan,
            LevelUnit = controlMap.LevelUnit;
      //  alert(LevelPlan.options[planid].deviceprefer);  获得 PC+M=0;PC=1;M=2
        fbs.unit.getNameList({
            condition: {
                planid: [planid]
            },
            onSuccess: function(response){
                var data = response.data.listData,
                    len = data.length,
                    unitdata = [{
                        value: 0,
                        text: '全部推广单元'
                    }];
                if (len == 0) {
                    unitdata.push({
                        value : -1,
                        text : '当前计划下没有推广单元，请您选择其他计划层级'
                    });
                } else {
                    for (var i = 0; i < len; i++) {
                        unitdata.push({
                            value: data[i].unitid,
                            text: baidu.encodeHTML(data[i].unitname)
                        });
                    }
                }
                LevelUnit.fill(unitdata);
            },
            onFail: function(response){
                ajaxFailDialog();
            }
        });
        // 给单元列表挂载事件获取单元列表
        LevelUnit.onselect = function(selected) {
            if (selected == -1) {
                return false;
            }
            //调用相关数据
            //alert(selected);
        };
    }*/
});

ui.Bubble.source.rankTable = {
    type : 'normal',
    iconClass : 'ui_bubble_icon_info',
    positionList : [2,3,4,5,6,7,8,1],
    needBlurTrigger : true,
    showByClick : true,
    showByOver : true,			//鼠标悬浮延时显示
    showByOverInterval : 500,	//悬浮延时间隔
    hideByOut : true,			//鼠标离开延时显示
    hideByOutInterval : 2000,	//离开延时间隔，显示持续时间
    title: function(node){
        var ti = node.getAttribute('title');
        if (ti) {
            return (baidu.encodeHTML(baidu.decodeHTML(ti)));
        }
        else {
            return (baidu.encodeHTML(baidu.decodeHTML(node.firstChild.nodeValue)));
        }
    },
    content: function(node, fillHandle, timeStamp){
        var planname = node.getAttribute('planname'),
            unitname = node.getAttribute('unitname');
            html = [];
        html[html.length] = '<ul class="rank_bubble_content">';
        html[html.length] = '<li title="' + baidu.encodeHTML(planname) + '"><span>所属推广计划：</span>' + getCutString(baidu.encodeHTML(planname), 32, '...') + '</li>';
        html[html.length] = '<li title="' + baidu.encodeHTML(unitname) + '"><span>所属推广单元：</span>' + getCutString(baidu.encodeHTML(unitname), 32, '...') + '</li>';
        html[html.length] = '</ul>';
        return html.join('');
    }
};
