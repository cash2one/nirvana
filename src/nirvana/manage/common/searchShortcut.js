  /*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:   nirvana/manage/searchShortcut.js
 * desc:    筛选提示控制 by 大筛子      从manage.js拿出来
 * author:  linzhifeng@baidu.com
 * date:    $Date: 2010/07/16 $
 */
 nirvana.manage.SearchShortcut = {
        me : null,
        isDialogInit : false,
        dialog : null,
        scButton : '',
        tarTable : null,
        myShortcut : [],
        myShortcutTotal : 0,
        /**
         * 初始化Dialog
         */
        initDialog : function(){
            var sc = nirvana.manage.SearchShortcut,
                i,len,conHtml;
                    
            if (!sc.isDialogInit){
                sc.dialog = ui.Dialog.factory.create({
                    id : 'ShortcutDialog',
                    title : '我的查询',
                    skin  : "modeless",
                    dragable : false,
                    needMask : true,
                    maskType : 'white',
                    unresize : true,
                    maskLevel : 2,
                    width : 300,
                    ok_button : false,
                    cancel_button : false,
                    onclose : function(){
                        baidu.un(baidu.g('maskLevel2'), 'click', sc.blurHandler);
                    }
                });
                sc.dialog.hide();
                
                conHtml = [];
                conHtml.push("<div id='SCCustomWrap' class='shortcut_custom_wrap'>");
                conHtml.push("<div id='SCCustomContent'></div>");
                conHtml.push("<div id='SCCustomNodata' class='text_gray'>暂无保存的查询条件。</div>");
                conHtml.push("</div>");
                conHtml.push("<div id='SCSystemWrap' class='shortcut_system_wrap'>");
                conHtml.push("推荐查询：");
                conHtml.push("<div><a id='SCSystem1' href='javascript:void(0)'>系统推荐重点词</a><span class='ui_bubble' title='系统推荐重点词'></span></div>");
                conHtml.push("<div><a id='SCSystem2' href='javascript:void(0)'>高左侧展现概率词</a><span class='ui_bubble' title='高左侧展现概率词'></span></div>");
                conHtml.push("<div><a id='SCSystem3' href='javascript:void(0)'>高点击率词</a><span class='ui_bubble' title='高点击率词'></span></div>");
                conHtml.push("</div>");
                sc.dialog.setContent(conHtml.join(""));
                
                //气泡
                ui.Bubble.init(baidu.q('ui_bubble','SCSystemWrap'));

                baidu.g('SCSystemWrap').onclick = sc.systemSearch;
                baidu.g('SCCustomWrap').onclick = sc.customSearch;
                
                baidu.on(window, 'resize', sc.resizeHandler);
                baidu.on(window, 'scroll', sc.resizeHandler);
                sc.isDialogInit = true;
            }   
            //fbs请求我的查询，有缓存在可以放心反复调用
            fbs.avatar.getShortcut({
                fields : ['wfcondid','wfcondname','wfconddetail'],
                callback : sc.getCustomResponse
            });     
        },
        
        /**
         * 获取我的查询
         * @param {Object} response
         */
        getCustomResponse : function(response){
            if (response.status == '200') {
                response = response.data.listData;
                var i,len,
                    tpl = "<p class='ui_bubble' idx='%d' bubblesource='customShortcut'><a class='filterCancel' idx='%d' href='javascript:void(0)'>&nbsp;</a><a class='shortcut_custom_link' href='javascript:void(0)' idx='%d'>%s</a></p>",
                    html = [],
                    contentDom = baidu.g('SCCustomContent');
                for (i = 0, len = response.length; i < len; i++){
                    html.push(tpl.replace(/'%d'/g,i).replace('%s',insertWbr(getCutString(response[i].wfcondname, 78, '...'))));
                }
                nirvana.manage.SearchShortcut.myShortcut = response;
                nirvana.manage.SearchShortcut.myShortcutTotal = len;
                if (len > 0){
                    contentDom.innerHTML = html.join('');
                    ui.Bubble.init(baidu.q('ui_bubble','SCCustomWrap'));
                    baidu.show(contentDom);
                    contentDom.style.height = 'auto';
                    if (contentDom.offsetHeight > 180){
                        contentDom.style.height = 180 + 'px';
                        contentDom.style.overflowY = 'auto';
                    }else{
                        contentDom.style.overflowY = 'hidden';
                    }
                    baidu.hide('SCCustomNodata');
                }else{
                    //无记录
                    baidu.hide(contentDom);
                    baidu.show('SCCustomNodata');
                }
            }else{
                //失败
                baidu.hide(contentDom);
                baidu.show('SCCustomNodata');
            }
        },
        
        /**
         * 快捷响应
         * @param {Object} action
         * @param {Object} scButtonId
         */
        getShortcutHandler : function(action,scButtonId,tarTableId){
            var sc = nirvana.manage.SearchShortcut,
                me = action;
            sc.me = me;
            sc.scButton = ui.util.get(scButtonId).main;
            sc.tarTable = ui.util.get(tarTableId);
            return function(){
                var sc = nirvana.manage.SearchShortcut;
                sc.initDialog();
                sc.dialog.show();
                ui.util.smartPosition(sc.dialog.getDOM(),{
                    pos : 'b',
                    align : 'r',
                    target : sc.scButton,
                    repairL : -88
                });
                
                baidu.on(baidu.g('maskLevel2'), 'click', sc.blurHandler);
            }
        },
        
        /**
         * 推荐查询
         * @param {Object} e
         */
        systemSearch : function(e){
            var e = e || window.event,
                tar = e.target || e.srcElement;
            if (tar.tagName == 'A'){
                var sc = nirvana.manage.SearchShortcut,
                    me = sc.me,
                    hasChangeDate = false;
                //清除已有筛选
                sc.clearSearchCondition();
                hasChangeDate = nirvana.manage.changeActionStoredDate(me,7);
                switch (tar.id){
                    case 'SCSystem1':       //系统推荐重点词
                        me.setContext('searchShortcutValue', {
                            "scutKeypoint" : '1',
                            "scutHPpRate" : '-1',
                            "scutHClkRate" : '-1'
                        });
                        nirvana.manage.SearchTipControl.initSearchComboTip(me);
                        nirvana.manage.SearchTipControl.recordSearchcondition('shortcut_keypoint');
                        break;
                    case 'SCSystem2':       //高左侧展现概率词
                        me.setContext('searchShortcutValue', {
                            "scutKeypoint" : '-1',
                            "scutHPpRate" : '1',
                            "scutHClkRate" : '-1'
                        });
                        nirvana.manage.SearchTipControl.initSearchComboTip(me);
                        nirvana.manage.SearchTipControl.recordSearchcondition('shortcut_hpprate');
                        break;
                    case 'SCSystem3':       //高点击率词
                        me.setContext('searchShortcutValue', {
                            "scutKeypoint" : '-1',
                            "scutHPpRate" : '-1',
                            "scutHClkRate" : '1'
                        });
                        nirvana.manage.SearchTipControl.initSearchComboTip(me);
                        nirvana.manage.SearchTipControl.recordSearchcondition('shortcut_hclkrate');
                        break;
                }
                sc.blurHandler();
                me.setContext('pageNo',1);
                me.refresh();
                if (hasChangeDate){
                    clearTimeout(ui.Bubble.timerHide);
                    ui.Bubble.triggerIdentity = baidu.g('ManagerCalendarBubble');
                    ui.Bubble.show();
                }
                return false;
            }
        },
        
        /**
         * 我的查询
         * @param {Object} e
         */
        customSearch : function(e){
            var e = e || window.event,
                tar = e.target || e.srcElement;
            if (tar.tagName == 'A'){
                var idx = baidu.dom.getAttr(tar,'idx'),
                    sc = nirvana.manage.SearchShortcut,
                    myShortcut = sc.myShortcut;
                if (!myShortcut[idx]){
                    return;
                }
                switch (tar.className){
                    case 'shortcut_custom_link':        //筛选
                        //清除已有筛选
                        sc.clearSearchCondition();
                        var needShow7DayTip = false,
                            detail = myShortcut[idx].wfconddetail;
                        
                        detail = detail ? baidu.json.parse(detail) : '';

                        needShow7DayTip = sc.restoreMyShortcut(detail);
                        sc.blurHandler();
                        nirvana.manage.SearchTipControl.initSearchComboTip(sc.me);
                        nirvana.manage.SearchTipControl.recordSearchcondition('shortcut_custom');
                        sc.me.setContext('pageNo',1);
                        sc.me.refresh();
                        if (needShow7DayTip){
                            clearTimeout(ui.Bubble.timerHide);
                            ui.Bubble.triggerIdentity = baidu.g('ManagerCalendarBubble');
                            ui.Bubble.show();
                        }
                        break;
                    case 'filterCancel':                //删除
                        fbs.avatar.delShortcut({
                            wfcondids : [myShortcut[idx].wfcondid],
                            callback : function(){}
                        }); 
                        clearTimeout(ui.Bubble.timerShow);
                        ui.Bubble.hide();
                        fbs.avatar.getShortcut.clearCache();
                        tar.parentNode.parentNode.removeChild(tar.parentNode);
                        sc.myShortcutTotal -= 1;
                        if (sc.myShortcutTotal <= 0){
                            //无记录
                            baidu.hide('SCCustomContent');
                            baidu.show('SCCustomNodata');
                        }
                        var contentDom = baidu.g('SCCustomContent');
                        contentDom.style.height = 'auto';
                        if (contentDom.offsetHeight > 180){
                            contentDom.style.height = 180 + 'px';
                            contentDom.style.overflowY = 'auto';
                        }else{
                            contentDom.style.overflowY = 'hidden';
                        }
                        break;
                }
            }
        },
        
        /**
         * 清楚已有筛选
         */
        clearSearchCondition : function(){
            var me = nirvana.manage.SearchShortcut.me;
            //清除已有筛选
            me.setContext('query', '');
            me.setContext('status', '100');
            me.setContext('queryType', 'fuzzy');
            //设置组合筛选的context
            //状态列表的设置
            me.setContext('searchStateValue', '100');
            me.setContext('searchQueryValue', '');
            me.setContext('searchPreciseValue', false);
            me.setContext('searchAdvanceValue', {
                "advSearchPaysum" : '-1',
                "advSearchPrice" : '-1',
                "advSearchClk" : '-1'
                //"advSearchShowq" : '-1'
                //"advSearchShowqPc" : '-1',
                //"advSearchShowqM" : '-1'
            });
            me.setContext('searchShortcutValue', {
                "scutKeypoint" : '-1',
                "scutHPpRate" : '-1',
                "scutHClkRate" : '-1'
            });
            me.setContext('filterCol',{});
            nirvana.manage.SearchShortcut.tarTable.filterCol = {};
        },
        
        /**
         * 还原我的查询，从MVC中的M恢复V、C
         * @param {Object} detail：parse后的对象
         */
        restoreMyShortcut : function(detail){
            var i,len = detail.length,
                sc = nirvana.manage.SearchShortcut,
                me = sc.me,
                sAdvValue = {
                    "advSearchPaysum" : '-1',
                    "advSearchPrice" : '-1',
                    "advSearchClk" : '-1'
                    //"advSearchShowq" : '-1'
                    //"advSearchShowqPc" : '-1',
                    //"advSearchShowqM" : '-1'
                },
                fCol = {},
                hasChangeDate = false,
                tmp;
            
            for (i = 0; i < len; i++){
                //表头筛选key的处理
                //质量度老的数据需要替换为新的数据，如质量度为1则替换为11,12,13
                if(detail[i].key == 'showq'){
                    detail[i].key = 'showqstat';
                }
                if (detail[i].key == 'showqstat') {
                    qStar.doCompatibleWithTable(detail[i].value);
                }   
                // 强制转换以前高级查询的一星词为表头筛选，因为高级查询里是单选框
                /*if (detail[i].key == 'advSearchShowq') {
                    qStar.advancedSearch2TableFilter(detail[i]);
                }
                if(detail[i].key == 'advSearchShowq'){
                    qStar.doCompatibleWithFilter(detail[i]);
                }
                // 计算机端质量度 移动端质量度
                if (detail[i].key == 'advSearchShowqPc' || detail[i].key == 'advSearchShowqM') {
                    qStar.advancedSearch2TableFilter(detail[i]);
                    qStar.doCompatibleWithFilter(detail[i]);
                }*/
                
                switch (detail[i].key){
                    case 'search':                      //组合筛选
                        me.setContext('query', detail[i].value[1]);
                        me.setContext('status', detail[i].value[0]);
                        me.setContext('queryType', detail[i].value[2]);
                        //设置组合筛选的context
                        //状态列表的设置
                        me.setContext('searchStateValue', detail[i].value[0]);
                        me.setContext('searchQueryValue', detail[i].value[1]);
                        me.setContext('searchPreciseValue', detail[i].value[2] != 'fuzzy');
                        break;
                    case 'advSearchPaysum':             //高级 >>> 消费
                    case 'advSearchPrice':              //高级 >>> 平均点击价格
                    case 'advSearchClk':                //高级 >>> 点击量
                    //case 'advSearchShowq':              //高级 >>> 质量度
                    //case 'advSearchShowqPc': 
                    //case 'advSearchShowqM': 
                        sAdvValue[detail[i].key] = detail[i].value;
                        me.setContext('searchAdvanceValue',sAdvValue);
                        //除质量度外，其他高级选项需改时间为最近7天
                        /*if (detail[i].key != 'advSearchShowq' ){
                            hasChangeDate = nirvana.manage.changeActionStoredDate(me,7) || hasChangeDate;
                        }*/
                        if (detail[i].key != 'advSearchShowqPc' || detail[i].key != 'advSearchShowqM' ){
                            hasChangeDate = nirvana.manage.changeActionStoredDate(me,7) || hasChangeDate;
                        }
                        break;
                    case 'scutKeypoint':                //快捷方式 >>> 系统推荐重点词
                        me.setContext('searchShortcutValue', {
                            "scutKeypoint" : '1',
                            "scutHPpRate" : '-1',
                            "scutHClkRate" : '-1'
                        });
                        hasChangeDate = nirvana.manage.changeActionStoredDate(me,7) || hasChangeDate
                        break;
                    case 'scutHPpRate':                 //快捷方式 >>> 高左侧展现概率词
                        me.setContext('searchShortcutValue', {
                            "scutKeypoint" : '-1',
                            "scutHPpRate" : '1',
                            "scutHClkRate" : '-1'
                        });
                        hasChangeDate = nirvana.manage.changeActionStoredDate(me,7) || hasChangeDate
                        break;
                    case 'scutHClkRate':                //快捷方式 >>> 高点击率词
                        me.setContext('searchShortcutValue', {
                            "scutKeypoint" : '-1',
                            "scutHPpRate" : '-1',
                            "scutHClkRate" : '1'
                        });
                        hasChangeDate = nirvana.manage.changeActionStoredDate(me,7) || hasChangeDate
                        break;
                    default:                //表头
                        fCol[detail[i].key] = {};
                        fCol[detail[i].key].on = true;
                        fCol[detail[i].key].title = detail[i].title;
                        fCol[detail[i].key].type = detail[i].type;
                        fCol[detail[i].key].value = detail[i].value;
                        me.setContext('filterCol',fCol);
                        sc.tarTable.filterCol[detail[i].key] = true;
                        break;
                }
            }
            return hasChangeDate;
        },
        
        /**
         * 添加我的查询
         */
        addMyShortcut : function(param){
            var stc = nirvana.manage.SearchTipControl.searchCondition;
            if (!param){
                return;
            }
            if (param.detail.length > 1024){
                ui.Dialog.alert({title:'错误',content:'抱歉，筛选条件过多，请减少筛选条件'});
                return;
            }
            fbs.avatar.addShortcut({
                wfcondname : param.name,
                wfconddetail : param.detail,
                callback : nirvana.manage.SearchShortcut.addMyShortcutResponse
            }); 
        },
        /**
         * 添加我的查询返回
         */
        addMyShortcutResponse : function(response){
            if (response.status == '200') {
                nirvana.manage.SearchTipControl.dialog.hide();
                fbs.avatar.getShortcut.clearCache();
            }else if (response.status == '400'){
                switch (response.errorCode.code + ''){
                    case '2860':
                        baidu.g('customScutNameErrorMsg').innerHTML = '保存的条件已经超过10个';
                        //ui.Dialog.alert({title:'错误',content:'抱歉，已保存快捷方式条数已达到上限，请删除后再试'});
                        break;
                    case '2861':
                        baidu.g('customScutNameErrorMsg').innerHTML = '保存的条件名称重复';
                        //ui.Dialog.alert({title:'错误',content:'抱歉，快捷方式名称重名，请修改后再试'});
                        break;
                }
            }else{
                ui.Dialog.alert({title:'错误',content:'抱歉，出错了，请稍候再试'});
            }
        },
        
        /**
         * 多重失焦触发存在，快捷方式的dialog只能自己写
         */
        blurHandler : function(){
            var sc = nirvana.manage.SearchShortcut;
            baidu.un(baidu.g('maskLevel2'), 'click', sc.blurHandler);
            sc.dialog.hide();
            ui.Bubble.hide();
        },
        
        resizeHandler : function(){
            var sc = nirvana.manage.SearchShortcut;
            if (sc.dialog.isShow){
                ui.util.smartPosition(sc.dialog.getDOM(),{
                    pos : 'b',
                    align : 'r',
                    target : sc.scButton,
                    repairL : -88
                });             
            }
        }
    };