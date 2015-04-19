/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/mobile/URLOptimizeDetail.js
 * desc: 移动优化包移动搬家方案优化详情视图定义
 * author: wangshiying@baidu.com
 * date: $Date: 2013/05/07 $
 */
/**
 * 移动优化包移动搬家方案优化详情视图定义
 * @class URLOptimizeDetail
 * @namespace nirvana.aoPkgControl
 * @extends nirvana.aoPkgControl.PaginationView
 */
nirvana.aoPkgControl.URLOptimizeDetail = function ($, T, nirvana) {
    var modifyButtonType = -1;
    return {
        /**
         * 渲染详情核心内容
         * @override
         */
        renderContent: function (contentView) {

            var me = this;
            var opttypeid = me.getAttr('opttypeid');
            var modifyEle = fc.create(er.template.get('urlOptDetailBtns'));

            var uiMap = ui.util.init(modifyEle);
            // 将动态创建的UI组件添加到UIMap属性里
            T.object.extend(me._UIMap, uiMap);
            T.dom.insertBefore(modifyEle, contentView);

            // 批量修改按钮事件绑定
            var bind = nirvana.util.bind;
            uiMap.WidgetModifyPC.onclick = bind('onBatchModPcUrl', me);
            uiMap.WidgetModifyMobile.onclick = bind('onBatchModMobileUrl', me);

            if (805 == opttypeid) {
                /*me.$('.aopkg_widget_tip')[0].hidden = true;*/
                me.$('.aopkg_widget_tip')[0].style.display="none";
                me.setAttr('pageSize', 10);
            }
            else {
                 // 对于创意分页大小为5
                me.setAttr('pageSize', 5);
            }
            me.superProto.renderContent.call(me, contentView, me.getAttr('tableOption'));
        },
        /**
         * 表格行选择的事件处理器
         * @param {Array} selIdxs 选择的行的索引数组
         * @override
         */
        onRowSelHandler: function(selIdxs) {
            var me = this;
            var ds = me.getTable().getDatasource();
            me.selectedList = selIdxs;
            var temp = [],
                templength = 0,
                length = selIdxs.length;
            modifyButtonType = -1;
            for (var i = 0; i < length; i++) {
                if(!temp[ds[selIdxs[i]].deviceprefer]){
                    temp[ds[selIdxs[i]].deviceprefer] = 1;
                    templength++;
                }
                if(templength == 3){
                    modifyButtonType = -1;
                    break;
                }
                if(templength == 2){
                    if( (temp[0] && temp[2]) || (temp[1] && temp[2])){
                        modifyButtonType = -1;
                        break;
                    }
                    else
                    {
                        modifyButtonType = 1;
                    }
                }
                if(templength == 1){
                    modifyButtonType = ds[selIdxs[i]].deviceprefer;
                }
            }
            if(baidu.g('WidgetModifyTooltip')) baidu.dom.remove('WidgetModifyTooltip');
            if(modifyButtonType == 2){
                if (805 == me.getAttr('opttypeid')) {
                    var html = '<span id="WidgetModifyTooltip" class="widget_modify_Tooltip" >' +
                        '当您选择的关键词中包含仅投放移动设备的关键词时，无法批量修改url'
                    '</span>'
                    baidu.dom.insertHTML('ctrlbuttonWidgetModifyMobile','afterEnd',html);
                }
                else {
                    var html = '<span id="WidgetModifyTooltip" class="widget_modify_Tooltip" >' +
                        '当您选择的创意中包含仅投放移动设备的创意时，无法批量修改url'
                    '</span>'
                    baidu.dom.insertHTML('ctrlbuttonWidgetModifyMobile','afterEnd',html);
                }
            }
            me.batchBtnEnable(modifyButtonType);
        },
        /**
         * 设置两个批量修改按钮是否可用
         * @param {number} deviceprefer
         * 0 PC+M
         * 1 PC
         * 2 M
         */
        batchBtnEnable: function(deviceprefer){
            var me = this;
            var pcbtn = me._UIMap.WidgetModifyPC;
            var mobilebtn = me._UIMap.WidgetModifyMobile;

            if (deviceprefer == 0){
                pcbtn.disable(false);
                mobilebtn.disable(false);
            }
            else if (deviceprefer == 1){
                pcbtn.disable(false);
                mobilebtn.disable(true);
            }
            else if(deviceprefer == 2){
                pcbtn.disable(true);
                mobilebtn.disable(false);
            }
            else {
                pcbtn.disable(true);
                mobilebtn.disable(true);
            }
        },
        /**
         * 修改关键词/创意的状态成功的事件回调
         * @override
         */
        onModStateSuccess: function(levelName, levelIdName, idValue, isPause) {
            this.addModifiedInfo(levelIdName, idValue);
            // TODO 监控添加
            this.fireMod('', levelName, levelIdName, idValue);
        },
        /**
         * 小灯泡点击查看事件处理
         * @event
         */
        viewOffLineReason: function (target) {
            var level = target.getAttribute('data').indexOf('ideaid') > -1
                ? 'ideainfo' : 'wordinfo';
            manage.offlineReason.openSubAction({
                type: level,
                params: target.getAttribute('data'),
                maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel()
            });
        },
        /**
         * 批量修改PC的URL
         * @event
         */
        onBatchModPcUrl: function () {
            var me = this;
            var opttypeid = me.getAttr('opttypeid');
            if( 805 == opttypeid){
                // 关键词-批量修改默认url
                var temp_data = me.getSelectDatas('word_pc');
                nirvana.util.openSubActionDialog({
                    id : 'KeywordModUrlDialog',
                    title : '默认访问URL',
                    width : 440,
                    maskLevel : nirvana.aoPkgWidgetCommon.getMaskLevel(),
                    actionPath : 'manage/modWordUrl',
                    params : {
                        winfoid : temp_data.winfoid,
                        wurl	: temp_data.wurl,
                        shadow_wurl : temp_data.shadow_wurl,
                        unitid : temp_data.unitid,
                        callback : me.modifyBatchWordPCCallBack,
                        action : me
                    },
                    onclose : function(){
                    }
                });
            }
            else {
                // 创意-批量修改url
                var temp_data = me.getSelectDatas('idea');
                nirvana.util.openSubActionDialog({
                    id : 'ideaModUrlDialog',
                    title : "默认访问URL",
                    width : 360,
                    maskLevel : nirvana.aoPkgWidgetCommon.getMaskLevel(),
                    actionPath : 'manage/modIdeaUrl',
                    params : {
                        item : temp_data.item,
                        type : "url",
                        callback : me.modifyBatchIdeaPCCallBack,
                        action : me
                    }
                });
            }
        },
        /**
         * 批量修改移动的URL
         * @event
         */
        onBatchModMobileUrl: function () {
            var me = this;
            var opttypeid = me.getAttr('opttypeid');
            if( 805 == opttypeid){
                // 关键词-批量修改默认url
                var temp_data = me.getSelectDatas('word_mobile');
                var tempparam = {
                    id : 'KeywordModMUrlDialog',
                    title : '移动访问URL',
                    width : 440,
                    maskLevel : nirvana.aoPkgWidgetCommon.getMaskLevel(),
                    actionPath : 'manage/modWordUrl',
                    params : {
                        winfoid : temp_data.winfoid,
                       // mwurl : temp_data.mwurl,
                        shadow_wurl : temp_data.shadow_mwurl,
                        unitid : temp_data.unitid,
                        callback : me.modifyBatchWordMCallBack,
                        action : me
                    },
                    onclose : function(){
                    }
                };
                if(modifyButtonType == 2) {
                    tempparam.params.wurl = temp_data.mwurl;
                }
                else if(modifyButtonType == 0) {
                    tempparam.params.mwurl = temp_data.mwurl;
                }
                nirvana.util.openSubActionDialog(tempparam);
            }
            else {
                // 创意-批量修改url
                var temp_data = me.getSelectDatas('idea');
                var tempparam = {
                    id : 'ideaModUrlDialog',
                    title : "移动URL",
                    width : 360,
                    maskLevel : nirvana.aoPkgWidgetCommon.getMaskLevel(),
                    actionPath : 'manage/modIdeaUrl',
                    params : {
                        item : temp_data.item,
                        type : "miurl",
                        callback : me.modifyBatchIdeaMCallBack,
                        action : me
                    }
                }
                if(modifyButtonType == 2) {
                    tempparam.params.type = "url";
                }
                else if(modifyButtonType == 0) {
                    tempparam.params.type = "miurl";
                }
                nirvana.util.openSubActionDialog(tempparam);
            }
        },
        /**
         * 优化关键词URL事件处理
         */
        optimizeWordURL: function (target, data) {
            var me = this;
            var url = [];
            var shadow_url = [];
            var modify_type = "";
            var title = "";
            if( data.deviceprefer == 2 ){
                url.push(data.wurl);
                shadow_url.push(data.shadowwurl);
                modify_type="KeywordModMUrlDialog";
                title = "移动访问URL";
            }
            else if( data.deviceprefer == 1 ){
                url.push(data.wurl);
                shadow_url.push(data.shadowwurl);
                modify_type="KeywordModUrlDialog";
                title = "默认访问URL";
            }
            else if( data.deviceprefer == 0 ){
                if( data.reason == 1 ){
                    url.push(data.wurl);
                    shadow_url.push(data.shadowwurl);
                    modify_type="KeywordModUrlDialog";
                    title = "默认访问URL";
                }
                else {
                    url.push(data.mwurl);
                    shadow_url.push(data.shadow_mwurl);
                    modify_type="KeywordModMUrlDialog";
                    title = "移动访问URL";
                }
            }
            var params = {
                winfoid : [data.winfoid],
                wurl : url,
                shadow_wurl : shadow_url,
                unitid :[data.unitid],
                callback : me.modifySingleWordPCCallBack,
                action : me
            };
            if(modify_type == "KeywordModMUrlDialog"){
                params = {
                    winfoid : [data.winfoid],
                    // mwurl	: url,
                    shadow_wurl : shadow_url,
                    unitid :[data.unitid],
                    callback : me.modifySingleWordPCCallBack,
                    action : me
                };
                if(data.deviceprefer == 2) {
                    params.wurl = url;
                }
                else {
                    params.mwurl = url;
                }
            }
            if(data.winfoid){
                nirvana.util.openSubActionDialog({
                    id : modify_type,
                    title : title,
                    width : 440,
                    maskLevel : nirvana.aoPkgWidgetCommon.getMaskLevel(),
                    actionPath : 'manage/modWordUrl',
                    params : params,
                    onclose : function(){
                    }
                });
            }
        },
        /**
         * 创意-PC-URL批量修改的回调函数-主要做监控
         */
        modifyBatchIdeaPCCallBack: function (newUrl,action){
            var me = action;
            var ds = me.getTable().getDatasource();
            var modify_item = {
                ideaids : [],
                old_showurl : [],
                old_url : []
            }
            var length = me.selectedList.length;
            var selected_item = me.selectedList
            for( var i = 0; i < length ; i++){
                modify_item.ideaids.push( ds[selected_item[i]].ideaid );
                //显示url
                if( ds[selected_item[i]].shadow_showurl ){
                    modify_item.old_showurl.push( ds[selected_item[i]].shadow_showurl);
                }else{
                    modify_item.old_showurl.push( ds[selected_item[i]].showurl);
                }
                //访问url
                if( ds[selected_item[i]].shadow_url ){
                    modify_item.old_url.push( ds[selected_item[i]].shadow_url);
                }else{
                    modify_item.old_url.push( ds[selected_item[i]].url);
                }
                //加粉红色的行
                me.addModifiedInfo('ideaid',  ds[selected_item[i]].ideaid);
            }
            var logdata = {
                ideaids :  modify_item.ideaids,
                modify_type : "1,2",
                old_url :  modify_item.old_url.join(","),
                old_showurl : modify_item.old_showurl.join(","),
                old_miurl : "",
                old_mshowurl : "",
                new_url :  newUrl.url,
                new_showurl : newUrl.showurl,
                new_miurl : "",
                new_mshowurl : ""
            };
            me.fireMod("modifyideaurlbatch",logdata);
        },
        /**
         * 创意-M-URL批量修改的回调函数-主要做监控
         * @callback
         */
        modifyBatchIdeaMCallBack: function (newUrl,action){
            var me = action;
            var ds = me.getTable().getDatasource();
            var modify_item = {
                ideaids : [],
                old_mshowurl : [],
                old_miurl : []
            }
            var length = me.selectedList.length;
            var selected_item = me.selectedList;
            for( var i = 0; i < length ; i++){
                modify_item.ideaids.push( ds[selected_item[i]].ideaid );
                if(modifyButtonType == 2){
                    //显示url
                    if( ds[selected_item[i]].shadow_showurl ){
                        modify_item.old_mshowurl.push( ds[selected_item[i]].shadow_showurl);
                    }else{
                        modify_item.old_mshowurl.push( ds[selected_item[i]].showurl);
                    }
                    //访问url
                    if( ds[selected_item[i]].shadow_url ){
                        modify_item.old_miurl.push( ds[selected_item[i]].shadow_url);
                    }else{
                        modify_item.old_miurl.push( ds[selected_item[i]].url);
                    }
                }
                else{
                    //显示url
                    if( ds[selected_item[i]].shadow_mshowurl ){
                        modify_item.old_mshowurl.push( ds[selected_item[i]].shadow_mshowurl);
                    }else{
                        modify_item.old_mshowurl.push( ds[selected_item[i]].mshowurl);
                    }
                    //访问url
                    if( ds[selected_item[i]].shadow_miurl ){
                        modify_item.old_miurl.push( ds[selected_item[i]].shadow_miurl);
                    }else{
                        modify_item.old_miurl.push( ds[selected_item[i]].miurl);
                    }
                }
                //加粉红色的行
                me.addModifiedInfo('ideaid',  ds[selected_item[i]].ideaid);
            }
            var logdata = {
                rowIdxs : me.selectedList,
                ideaids :  modify_item.ideaids,
                modify_type : "3,4",
                old_url : "",
                old_showurl : "",
                old_miurl : modify_item.old_miurl.join(","),
                old_mshowurl : modify_item.old_mshowurl.join(","),
                new_url : "",
                new_showurl : "",
                new_miurl :  newUrl.miurl,
                new_mshowurl : newUrl.mshowurl
            };
            me.fireMod("modifyideaurlbatch",logdata);
        },
        /**
         * 关键词-PC-URL批量修改的回调函数-主要做监控
         * @callback
         */
        modifyBatchWordPCCallBack: function (newUrl,action){
            var me = action;
            var ds = me.getTable().getDatasource();
            var modify_item = {
                selectedids : [],
                selectedoldvalues : [],
                selectednewvalues : []
            }
            var length = me.selectedList.length;
            var selected_item = me.selectedList;
            for( var i = 0; i < length ; i++){
                modify_item.selectedids.push(ds[selected_item[i]].winfoid);
                if( ds[selected_item[i]].shadowwurl ){
                    modify_item.selectedoldvalues.push(ds[selected_item[i]].shadowwurl);
                }
                else{
                    modify_item.selectedoldvalues.push(ds[selected_item[i]].wurl);
                }
                //加粉红色的行
                me.addModifiedInfo('winfoid',  ds[selected_item[i]].winfoid);
            }

            var logdata = {
                rowIdxs : me.selectedList,
                selectedids :  modify_item.selectedids,
                modify_type : "1",
                selectedoldvalues :  modify_item.selectedoldvalues,
                selectednewvalues :  newUrl
            };
            me.fireMod("modifykeywordurlbatch",logdata);
        },
        /**
         * 关键词-移动-URL批量修改的回调函数-主要做监控
         */
        modifyBatchWordMCallBack: function (newUrl,action){
            var me = action;
            var ds = me.getTable().getDatasource();
            var modify_item = {
                selectedids : [],
                selectedoldvalues : [],
                selectednewvalues : []
            }
            var length = me.selectedList.length;
            var selected_item = me.selectedList;
            for(var i = 0; i < length ; i++){
                modify_item.selectedids.push(ds[selected_item[i]].winfoid);
                if(modifyButtonType == 2){
                    if( ds[selected_item[i]].shadowwurl ){
                        modify_item.selectedoldvalues.push(ds[selected_item[i]].shadowwurl);
                    }
                    else{
                        modify_item.selectedoldvalues.push(ds[selected_item[i]].wurl);
                    }
                }
                else{
                    if( ds[selected_item[i]].shadow_mwurl ){
                        modify_item.selectedoldvalues.push(ds[selected_item[i]].shadow_mwurl);
                    }
                    else{
                        modify_item.selectedoldvalues.push(ds[selected_item[i]].mwurl);
                    }
                }
                //加粉红色的行
                me.addModifiedInfo('winfoid',  ds[selected_item[i]].winfoid);
            }

            var logdata = {
                rowIdxs : me.selectedList,
                selectedids :  modify_item.selectedids,
                modify_type : "3",
                selectedoldvalues :  modify_item.selectedoldvalues,
                selectednewvalues :  newUrl
            };
            me.fireMod("modifykeywordurlbatch",logdata);
        },
        /**
         * 关键词-PC和移动-URL行内修改的回调函数-主要做监控
         * @callback
         */
        modifySingleWordPCCallBack: function (newUrl,action){
            var me = action;
            var curRow = me.getTable().getUI().curRow;
            var ds = me.getTable().getDatasource();
            var modify_type = "";
            var oldvalue = "";
            if(ds[curRow].reason == 1){
                modify_type = "1";
                if (ds[curRow].shadowwurl) {
                    oldvalue = ds[curRow].shadowwurl;
                }
                else {
                    oldvalue = ds[curRow].wurl;
                }
            }
            else{
                modify_type = "3";
                if(ds[curRow].deviceprefer == 2){
                    if (ds[curRow].shadowwurl) {
                        oldvalue = ds[curRow].shadowwurl;
                    }
                    else {
                        oldvalue = ds[curRow].wurl;
                    }
                }
                else{
                    if (ds[curRow].shadow_mwurl) {
                        oldvalue = ds[curRow].shadow_mwurl;
                    }
                    else {
                        oldvalue = ds[curRow].mwurl;
                    }
                }

            }
            var logdata = {
                planid : ds[curRow].planid,
                unitid : ds[curRow].unitid,
                winfoid : ds[curRow].winfoid,
                modify_type : modify_type,
                oldvalue :  oldvalue,
                newvalue :  newUrl,
                Sugurlid : ds[curRow].reason
            };
            //加粉红色的行
            me.addModifiedInfo('winfoid',ds[curRow].winfoid);
            me.fireMod("modifykeywordurl",logdata);
        },
        /**
         * 获取选中行的数据
         * @param {string} modifyType 获取数据的类型
         *
         */

        getSelectDatas: function (modifyType) {
            var me = this;
            var modify_item={};
            var ds = me.getTable().getDatasource();
            var selected_item = me.selectedList;
            var length = me.selectedList.length;
            if ( length <=0 ) return;
            if(modifyType == 'word_pc'){
                modify_item={
                    winfoid : [],
                    wurl : [],
                    shadow_wurl : [],
                    unitid : []
                }
                for(var i = 0; i < length; i++){
                    modify_item.winfoid.push(ds[selected_item[i]].winfoid);
                    modify_item.wurl.push(ds[selected_item[i]].wurl);
                    modify_item.shadow_wurl.push(ds[selected_item[i]].shadowwurl);
                    modify_item.unitid.push(ds[selected_item[i]].unitid);
                }
                return modify_item;
            }
            else if (modifyType == 'word_mobile'){
                modify_item={
                    winfoid : [],
                    mwurl : [],
                    shadow_mwurl : [],
                    unitid : [],
                    deviceprefer : []
                }
                for( var i = 0; i < length ; i++){
                    modify_item.winfoid.push(ds[selected_item[i]].winfoid);
                    if(ds[selected_item[i]].deviceprefer == 2){
                        modify_item.mwurl.push(ds[selected_item[i]].wurl);
                        modify_item.shadow_mwurl.push(ds[selected_item[i]].shadowwurl);
                    }
                    else{
                        modify_item.mwurl.push(ds[selected_item[i]].mwurl);
                        modify_item.shadow_mwurl.push(ds[selected_item[i]].shadow_mwurl);
                    }
                    modify_item.unitid.push(ds[selected_item[i]].unitid);
                    modify_item.deviceprefer.push(ds[selected_item[i]].deviceprefer);
                }
                return modify_item;
            }
            else if( modifyType == 'idea' ){
                modify_item={
                    item : []
                }
                for( var i = 0; i < length ; i++){
                    modify_item.item.push(ds[selected_item[i]]);
                }
                return modify_item;
            }
        },
        /**
         * 请求详情成功的回调
         * @param {Object} response 响应的数据对象
         * @override
         *
         */
        requestDetailSuccess: function (response) {
            var me = this;
            var opttypeid = me.getAttr('opttypeid');
            var data = response.data;
            var items = data.detailresitems;
            T.each(items, function (item) {
                var data = item.data;
                if (data.isopted == 1) {
                    if (opttypeid === 805) {
                        me.addModifiedInfo('winfoid', data.winfoid);
                    }
                    else {
                        me.addModifiedInfo('ideaid', data.ideaid);
                    }
                }
            });

            // 调用父类详情请求成功的处理
            me.superProto.requestDetailSuccess.call(me, response);

            // 更新批量修改按钮状态
            var tableUI = me.getTable().getUI();
            me.onRowSelHandler(tableUI.selectedIndex);
        },
        /**
         * 行内编辑创意
         * @param {HTMLElement} target 触发该动作的目标DOM元素
         * @param {Object} idea 要编辑的创意的数据对象
         */
        editIdea: function (target, idea) {
            var me = this;
            var curRow = me.getTable().getUI().curRow;
            var ds = me.getTable().getDatasource();
            var modify_type ;
            if(ds[curRow].deviceprefer == 0){
                modify_type = "1,2,3,4";
            }else if(ds[curRow].deviceprefer == 1){
                modify_type = "1,3";
            }else if(ds[curRow].deviceprefer == 2){
                modify_type = "2,4";
            }
            var logdata = {
                planid : ds[curRow].planid,
                unitid : ds[curRow].unitid,
                ideaid : ds[curRow].ideaid,
                question_type : ds[curRow].reason,
                modify_type : modify_type,
                old_url : ds[curRow].url,
                old_showurl : ds[curRow].showurl,
                old_miurl :  ds[curRow].miurl,
                old_mshowurl : ds[curRow].mshowurl,
                new_url :  "",
                new_showurl : "",
                new_miurl :  "",
                new_mshowurl : "",
                opttypeid : me.getAttr('opttypeid')
            };

            this.requestIdeaInfo(idea.ideaid, function (words, reason) {
                if (words) {
                    idea.wordref = {
                        show: true,
                        source: words
                    };
                }
                if (reason && reason != 0) {
                    var reasonArr = lib.idea.getDiagnosisText(reason);

                    idea.tip = {
                        show: true,
                        title: '诊断结果',
                        content: (function () {
                            var html = '';
                            T.each(reasonArr, function (item) {
                                html += '<p>' + item + '</p>';
                            });
                            return html;
                        })()
                    };
                }

                idea.maskLevel = nirvana.aoPkgWidgetCommon.getMaskLevel();
                idea.type = 'saveas';
                idea.opttypeid = me.getOpttypeid();

                idea.entranceType = 'aoPackage_url';
                idea.highsaveas = true;
                lib.idea.editIdea(idea, function (newurl) {
                    me.addModifiedInfo('ideaid',idea.ideaid);
                    logdata.new_url = newurl.url;
                    logdata.new_showurl = newurl.showurl;
                    logdata.new_miurl = newurl.miurl;
                    logdata.new_mshowurl = newurl.mshowurl;
                    me.fireMod('modifyideaurl', logdata);
                });
            });
        },
        /**
         * 查看修改创意前/后的状态
         * @param {HTMLElement} target 触发该动作的目标DOM元素
         * @param {Object} idea 要编辑的创意的数据对象
         * @param {number} row 触发该动作的表格行索引
         */
        switchShadow: function (target, idea, row) {
            var curRow = this.getTable().getUI().getRow(row);
            // 获得单元格
            var cells = $('.ui_table_tdcell', curRow);
            cells = [cells[1], cells[2]];

            lib.idea.switchShadow(idea, cells);
        },
        /**
         * 请求创意诊断的数据
         */
        requestIdeaInfo: function (ideaid, callback) {
            var params = {
                level: 'useracct',
                opttypeid: this.getOpttypeid(),
                condition: {
                    extra: ideaid,
                    recalculate: 1
                },

                onSuccess: function (json) {
                    if (json.data
                        && json.data.detailresitems
                        && json.data.detailresitems[0]) {

                        var data = json.data.detailresitems[0].data,
                            // winfoids = data.winfoids.split(','),
                            // showword = eval(data.showword),
                            reason = data.reason,
                            wordList = [];

//                        for (var i = 0, len = showword.length; i < len; i++) {
//                            wordList.push({
//                                winfoid: winfoids[i] || 0,
//                                showword: showword[i]
//                            });
//                        }
//                        if (wordList.length === 0) {
//                            wordList = null;
//                        }

                        callback(null, reason); // callback(wordList, reason);
                    }
                    else {
                        callback();
                    }
                },
                onFail: function () {
                    callback();
                }
            };

            fbs.nikon.getDetail(params);
        }
    };
}($$, baidu, nirvana);