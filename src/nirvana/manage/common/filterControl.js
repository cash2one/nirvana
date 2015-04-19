 /*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:   nirvana/manage/filterControl.js
 * desc:    根据筛选条件处理计划数据    从manage.js拿出来
 * author:  linzhifeng@baidu.com
 * date:    $Date: 2010/07/16 $
 */

 nirvana.manage.FilterControl = {
        /**
         * 创建筛选配对控件
         * @param {Object} condition
         * @param {Object} id
         */
        createFilterControl : function(condition,id){
            var ctrList = [];
            switch (condition.type){
                    case 'num':
                    case 'percent':
                        ctrList[ctrList.length] = ui.util.create('TextInput', {
                            id: 'FilterInput1' + id,
                            width: condition.width || 75,
                            value: condition.value[0] || ''
                        });
                        ctrList[ctrList.length] = ui.util.create('Label', {
                            id: 'FilterLabel' + id,
                            datasource: ' —'
                        });
                        ctrList[ctrList.length] = ui.util.create('TextInput', {
                            id: 'FilterInput2' + id,
                            width: condition.width || 75,
                            value: condition.value[1] || ''
                        });
                        break;
                    case 'select':
                        ctrList[ctrList.length] = ui.util.create('Select',{
                            id: 'FilterSelect' + Math.random(), //Select比较特殊
                            width: condition.width || 150,
                            value: condition.value.key,
                            datasource: condition.datasource
                        });
                        break;
                    case 'checkbox':
                        var checkbox;
                        for (var i = 0, len = condition.datasource.length; i < len; i++){
                            checkbox = document.createElement('input');
                            checkbox.type = 'checkbox';
                            checkbox.id = 'FilterCheckBox' + i + id;
                            checkbox.value = condition.datasource[i].value;
                            document.body.appendChild(checkbox);//for sb IE 否则set checked无效
                            if (condition.value[condition.datasource[i].value]){
                                checkbox.checked = 1;
                            }else{
                                checkbox.checked = 0;
                            }
                            
                            ctrList[ctrList.length] = checkbox;
                            
                            ctrList[ctrList.length] = ui.util.create('Label', {
                                id: 'FilterLabel'+ i + id,
                                'for': 'FilterCheckBox' + i + id,
                                datasource: condition.datasource[i].text || ''
                            });
                        }
                        break;
                    case 'text':
                        ctrList[ctrList.length] = ui.util.create('TextInput', {
                            id: 'FilterInput' + id,
                            width: condition.width || 185,
                            value:condition.value || ''
                        });
                        break;
                    case "extbind":
                        var div;
                        var tpl = '<input type="radio" name="track" title="已跟踪" value="1" ui="id:filtTrackRadio1;type:Radio;datasource:{0}" />' + 
                                    '<div style="background:#F9F9FC;margin:5px 0 5px 15px;padding-left:5px;height:38px;line-height:38px;">分机号区间：' +
                                        '<input type="text" ui="id:filtTrackInput1;type:TextInput;width:{1};value:{2}" /> — ' +
                                        '<input type="text" ui="id:filtTrackInput2;type:TextInput;width:{1};value:{3}" />' +
                                    '</div>'+
                                    '<input type="radio" name="track" title="未跟踪" value="2" ui="id:filtTrackRadio2;type:Radio;datasource:{0}" />';
                        
                        div = document.createElement('div');
                        var val = condition.value,
                            minNum = "", maxNum = "";
                        if (val[0] == 1 && typeof(val[1]) != "string" && typeof(val[2]) != "string") {
                            minNum = val[1] + "";
                            maxNum = val[2] + "";
                            if (minNum.length < 4) {
                                minNum = "0000" + minNum;
                                minNum = minNum.substr(minNum.length - 4);
                            }
                            if (maxNum.length < 4) {
                                maxNum = "0000" + maxNum;
                                maxNum = maxNum.substr(maxNum.length - 4);
                            }
                        }
                        div.innerHTML = ui.format(tpl,
                                                    condition.value[0],
                                                    32,
                                                    minNum,
                                                    maxNum);
                        document.body.appendChild(div);
                        ui.util.init(div);
                        ctrList[ctrList.length] = div;
                        break;
                        
            }
                        
            ctrList[ctrList.length] = baidu.dom.create('div',{
                    id: 'FilterErrorMsg',
                    className : 'exception'                 
            });
            return ctrList; 
        },
        
        /**
         * 筛选响应
         * @param {Object} filterField
         * @param {Object} target
         */
        onfilter : function(filterField, target, action, tableId){
            var me = action,
                filterDialog,
                dialogDom,
                controlList = [],
                filterType,
                filterValue,
                filterDatasource,
                filterCol = me.getContext('filterCol') || {};
            
            switch(filterField.field){
                case "planname":    //计划名
                case "unitname":    //单元名称
                case "showword":    //关键词
				case 'appname':     //app名称
				case 'version':     //版本
                    filterType = 'text';
                    filterValue = '';
                    break;
                case "extbind":
                    filterType = "extbind";
                    filterValue = [1,'',''];
                    break;
                case "clks":        //点击
                case "paysum":      //消费
                case "shows":       //展现
                case "trans":       //转化
                case "phonetrans":  //转化(电话)
                case "avgprice":    //平均点击价格
                case "showpay":     //千次展现消费
                case "wbudget":     //每日预算
                case "allnegativecnt":  //否定关键词
                case "allipblackcnt":   //IP排除
                case  "unitbid":    //单元出价  
                case "bid":         //出价
                    filterType = 'num';
                    filterValue = ['',''];
                    break; 
                case "clkrate":     //点击率
                    filterType = 'percent';
                    filterValue = ['',''];
                    break; 
                case "planstat":    //计划状态
                case "unitstat":    //单元状态
                case "wordstat":    //关键词状态
                    filterType = 'select';
                    filterValue = {key:'100',text:'全部状态'};
                    filterDatasource = me.getContext('SearchState').datasource || [];
                    break;
                case "ideastat":    //创意状态
                    filterType = 'select';
                    filterValue = {key:'100',text:'全部状态'};
                    filterDatasource = nirvana.manage.getStatusSet("idea");
                    break;
                case "appendIdeastat":	//创意状态
				   	filterType = 'select';
					filterValue = {key:'100',text:'全部状态'};
					filterDatasource = nirvana.manage.getStatusSet("appendIdea");
				   	break;
				case 'stat':         //app状态
				    filterType = 'select';
                    filterValue = {key:'100',text:'全部状态'};
                    filterDatasource = nirvana.manage.getStatusSet("appIdea");
				    break;
                case "showprob":    //创意展现方式
                    filterType = 'select';
                    filterValue = {key:'1',text:'优选'};
                    filterDatasource = [
                        {text : '优选', value: 1},
                        {text : '轮替', value: 2}
                    ];
                    break;
                case "wmatch":      //匹配模式
                    filterType = 'checkbox';
                    filterValue = {};
                    filterDatasource = [
                        {text : '广泛', value: 15},
                        {text : '短语', value: 31},
                        {text : '精确', value: 63}
                    ];
                    break;
                case "pcshowq":
                case "mshowq":
                case "showqstat":       //质量度
                    filterType = 'checkbox';
                    filterValue = { };
                    filterDatasource = qStar.getTableFilter();
                    // 强制换行
                    filterDatasource[2].text += '<br/>';
                    break;
				case 'appdevicetype':   //app的系统类型
				    filterType = 'select';
				    filterValue = {key:'100',text:'全部类型'};
				    filterDatasource = me.getContext('appdevicetype');
				    break;
                default:
                    alert('漏了~~~');
                    return;
            }
            
            filterCol = filterCol[filterField.field] || {};
            
            if (!filterCol.on){
                //未曾筛选或未生效
                filterCol.type = filterType;
                filterCol.value = filterValue;
                filterCol.datasource = filterDatasource;
                if (baidu.g('FilterClear')){
                    baidu.hide('FilterClear');
                }
            }else{
                filterCol.datasource = filterDatasource;
                if (baidu.g('FilterClear')) {
                    baidu.show('FilterClear');
                }
            }
            
            //创建Dialog
            filterDialog = ui.util.get('FilterDialog');
            if (!filterDialog){
                filterDialog = ui.Dialog.factory.create({
                    id : 'FilterDialog',
                    skin  : "modeless",
                    dragable : false,
                    needMask : false,
                    unresize : true,
                    needBlurTrigger : false,
                    width : 218
                }); 
                var clearFilter = baidu.dom.create('a',{
                    id : 'FilterClear',
                    className : 'filter_clear',
                    href : 'javascript:void(0)',
                    title:'清空本列筛选'
                })
                clearFilter.innerHTML = '清空筛选';
                clearFilter.onclick = nirvana.manage.FilterControl.clearFilter;
                filterDialog.getFoot().appendChild(clearFilter);
                baidu.hide('FilterClear');
                
                filterDialog.filterControl = {};
                baidu.on(window, 'resize', nirvana.manage.FilterControl.resetFilter);
                baidu.on(window, 'scroll', nirvana.manage.FilterControl.resetFilter);
            }
            filterDialog.onok = nirvana.manage.FilterControl.filterConfirm;

            filterDialog.setTitle(filterField.title + ':');
            filterDialog.setContent('<div id="FilterContainer" class="filter_container"></div>');
            
            filterDialog.show();
            
            dialogDom = filterDialog.getDOM();
            ui.util.smartPosition(dialogDom,{
                pos : 'b',
                align : 'l',
                target : target,
                repairL : 12
            }); 
            if (baidu.dom.getPosition(dialogDom).left < 0){
                dialogDom.style.left = 0;
            }
            
            //根据条件构建各种控件
            controlList = nirvana.manage.FilterControl.createFilterControl(filterCol, Math.round(Math.random(1)*1000));
            var domContiner = baidu.g('FilterContainer');
            for (var i = 0, l = controlList.length; i < l; i++){
                if (controlList[i].appendTo){
                    controlList[i].appendTo(domContiner);
                }else{
                    domContiner.appendChild(controlList[i]);
                }
                
                if (controlList[i].type == 'text'){
                    controlList[i].main.onkeyup = nirvana.manage.FilterControl.onkeyup;
                } else if (controlList[i].type == 'checkbox'){
                    //controlList[i].checked = baidu.dom.getAttr(controlList[i], 'iechecked');
                }
            }
            baidu.hide(controlList[controlList.length - 1]);
            
            //filterDialog作为存储跳板，
            filterDialog.filterControl = {
                action : me,
                tableId :tableId,
                target : target.id,
                field : filterField.field,
                title : filterField.title,
                type : filterType,
                ctrlist : controlList
            }
            
            setTimeout(function(){
                baidu.on('Wrapper', 'click', nirvana.manage.FilterControl.closeFilter);
            },500);
        },
        
        /**
         * 筛选确认
         */
        filterConfirm : function(){
            var filterDialog = ui.util.get('FilterDialog'),
                filterControl = filterDialog.filterControl,
                me = filterControl.action,
                tableId = filterControl.tableId,
                filterCol = me.getContext('filterCol') || {},
                tableObj = ui.util.get(tableId),
                value,          //用户输入的文本，{key:下拉单选值，text:文本}，[数值1，数值2]，{复选1:1/0，复选2:1/0、...}
                inputValid = true,
                clearFilter = false;
                
            switch (filterControl.type){
                case 'num':
                case 'percent':
                    value = [];
                    value[0] = filterControl.ctrlist[0].getValue();
                    value[1] = filterControl.ctrlist[2].getValue();
                    if (value[0] == '' && value[1] == ''){
                        clearFilter = true;
                    }else if (isNaN(+value[0])){
                        baidu.g('FilterErrorMsg').innerHTML = '必须为数字';
                        baidu.show('FilterErrorMsg');
                        filterControl.ctrlist[0].focusAndSelect();
                        inputValid = false;
                    }else if (value[0] < 0){
                        baidu.g('FilterErrorMsg').innerHTML = '必须大于0';
                        baidu.show('FilterErrorMsg');
                        filterControl.ctrlist[0].focusAndSelect();
                        inputValid = false;
                    }else if (value[0] > 999999999){
                        baidu.g('FilterErrorMsg').innerHTML = '数值太大';
                        baidu.show('FilterErrorMsg');
                        filterControl.ctrlist[0].focusAndSelect();
                        inputValid = false;
                    }else if (isNaN(+value[1])){
                        baidu.g('FilterErrorMsg').innerHTML = '必须为数字';
                        baidu.show('FilterErrorMsg');
                        filterControl.ctrlist[2].focusAndSelect();
                        inputValid = false;
                    }else if (value[1] < 0){
                        baidu.g('FilterErrorMsg').innerHTML = '必须大于0';
                        baidu.show('FilterErrorMsg');
                        filterControl.ctrlist[2].focusAndSelect();
                        inputValid = false;
                    }else if (value[1] > 999999999){
                        baidu.g('FilterErrorMsg').innerHTML = '数值太大';
                        baidu.show('FilterErrorMsg');
                        filterControl.ctrlist[2].focusAndSelect();
                        inputValid = false;
                    }else {
                        value[0] = (value[0] - fixed(value[0]) == 0 ? +value[0] : fixed(value[0]));//保留2位
                        value[1] = (value[1] - fixed(value[1]) == 0 ? +value[1] : fixed(value[1]));//保留2位
                        if (value[1] != '' && value[0] > value[1]){
                            //非空才自动翻转
                            value[0] = value[0] + value[1];
                            value[1] = value[0] - value[1];
                            value[0] = value[0] - value[1];
                        }
                        baidu.hide('FilterErrorMsg');
                    }
                    break;
                case 'select':
                    value = filterControl.ctrlist[0].getValue();
                    if (value == '100'){
                        clearFilter = true;
                    }
                    value = {
                        key : value,
                        text : filterControl.ctrlist[0].getText()
                    }
                    break;
                case 'checkbox':
                    value = {};
                    clearFilter = true;
                    for (var i = 0, len = filterControl.ctrlist.length; i < len - 1; i+= 2){
                        if (filterControl.ctrlist[i].checked){
                            value[filterControl.ctrlist[i].value] = 1;
                            clearFilter = false;
                        }else{
                            value[filterControl.ctrlist[i].value] = 0;
                        }
                    }
                    break;
                case 'text':
                    value = filterControl.ctrlist[0].getValue();
                    if(value == ''){
                        clearFilter = true;
                    }else if (getLengthCase(value) > 40){
                        baidu.g('FilterErrorMsg').innerHTML = '筛选值超长';
                        baidu.show('FilterErrorMsg');
                        filterControl.ctrlist[0].focusAndSelect();
                        inputValid = false;
                    }else{
                        baidu.hide('FilterErrorMsg');
                    }
                    break;
                case 'extbind':
                    var cont = filterControl.ctrlist[0],
                        inputs = $$.find("input",cont).set,
                        value = [0,'',''], 
                        reg = /^\d{4}$/,
                        match = true,
                        type, inp, text = [];
                    for(var i=0,l=inputs.length;i<l;i++){
                        inp = inputs[i];
                        type = baidu.getAttr(inp,"type");
                        if(type == "radio" && inp.checked){
                            value[0] = +inp.getAttribute('value');
                        }else if(type == "text"){
                            text[text.length] = inp;
                        }
                    }
                    if(value[0] == 1){
                        var val;
                        for (var i = 0, l = text.length; i < l; i++) {
                            val = baidu.trim(text[i].value)
                            match = match && (reg.test(val));
                            if (!match) {
                                baidu.g('FilterErrorMsg').innerHTML = '请输入4位分机号，必须为数字。';
                                baidu.show('FilterErrorMsg');
                                text[i].select();
                                inputValid = false;
                                break;
                            }else{
                                value[i+1] = +val;
                            }
                        }
                    }
                    if (match) {
                        baidu.hide('FilterErrorMsg');
                        if(value[1] > value[2]){
                            var tmp = value[1];
                            value[1] = value[2];
                            value[2] = tmp;
                        }
                    }
                    break;
            }                   
            if (!inputValid){
                return false;
            }
            
            if (clearFilter){
                //清空或无效筛选
                filterCol[filterControl.field] = {
                    on : false
                }
                tableObj.filterCol[filterControl.field] = false;
            }else{
                filterCol[filterControl.field] = {
                    on : true,
                    title : filterControl.title,
                    type : filterControl.type,
                    value : value
                    /*
                    list : {
                        type : filterControl.type,
                        value : value
                    }*/
                }
                tableObj.filterCol[filterControl.field] = true;
            }
            
            /**
             * 释放控件
             */
            for(var i = 0, len = filterControl.ctrlist.length; i < len; i++){
                if (filterControl.ctrlist[i].dispose){
                    filterControl.ctrlist[i].dispose();
                }
            }
            
            me.setContext('filterCol',filterCol);
            //console.log(filterCol);
            filterDialog.hide();
            me.setContext('pageNo',1);
            if(!me.getContext("notNeedInitSearchComboTip")){//此时不需要关联主页面的查询提示框  目前只有效果分析工具用到 add by yanlingling
                nirvana.manage.SearchTipControl.initSearchComboTip(me);
            }
            if (clearFilter){
                nirvana.manage.SearchTipControl.recordSearchcondition('tablefilter_off_' + filterControl.field);
            }else{
                nirvana.manage.SearchTipControl.recordSearchcondition('tablefilter_on_' + filterControl.field);
            }

            if( typeof me.getContext("queryChangeHandler")=="function"){//如果没有传递回调函数的话确认筛选就执行默认的refresh 分支 add by yanlingling
                me.getContext("queryChangeHandler")(me);
            }else{
                me.refresh();
            }
            
            return true;
        },
        
        /**
         * 清除所有筛选条件
         */
        clearFilter : function(){
            var filterDialog = ui.util.get('FilterDialog'),
                filterControl = filterDialog.filterControl,
                me = filterControl.action,
                tableId = filterControl.tableId,
                filterCol = me.getContext('filterCol') || {},
                tableObj = ui.util.get(tableId);
            
            
            filterCol[filterControl.field] = {
                on : false
            }
            tableObj.filterCol[filterControl.field] = false;
            
            me.setContext('filterCol',filterCol);
            filterDialog.hide();
            //me.initSearchComboTip && me.initSearchComboTip();
            
            if(!me.getContext("notNeedInitSearchComboTip")){//此时不需要关联主页面的查询提示框  目前只有效果分析工具用到 add by yanlingling
                nirvana.manage.SearchTipControl.initSearchComboTip(me);
            }
            //nirvana.manage.SearchTipControl.initSearchComboTip(me);
            nirvana.manage.SearchTipControl.recordSearchcondition('tablefilter_off_' + filterControl.field);
            if( typeof me.getContext("queryChangeHandler")=="function"){
                me.getContext("queryChangeHandler")(me);
            }else{
                me.refresh();
            }           
            return true;
        },
        
        /**
         * 关闭筛选浮出窗
         * @param {Object} e
         */
        closeFilter : function(e){
            var e = e || window.event,
                target = e.target || e.srcElement,
                filterDialog = ui.util.get('FilterDialog');
                
            baidu.un('Wrapper', 'click', nirvana.manage.FilterControl.closeFilter);
            if (baidu.dom.hasClass(target, 'ui_table_thfilter')){
                return;
            }
            if (filterDialog){
                filterDialog.hide();
            }
        },
        
        /**
         * 重置窗口
         */
        resetFilter : function(){
            var filterDialog = ui.util.get('FilterDialog');
            if (!filterDialog){
                baidu.un(window, 'resize', nirvana.manage.FilterControl.resetFilter);
                baidu.un(window, 'scroll', nirvana.manage.FilterControl.resetFilter);
            }
            
            if (filterDialog&&filterDialog.isShow){
                ui.util.smartPosition(filterDialog.getDOM(),{
                    pos : 'b',
                    align : 'l',
                    target : filterDialog.filterControl.target,
                    repairL : 12
                });
            }
        },
        
        /**
         * 输入框回车响应
         * @param {Object} e
         */
        onkeyup : function(e) {
            e = window.event || e;
            if (e.keyCode == 13) {
                nirvana.manage.FilterControl.filterConfirm();
                baidu.event.stop(e);
            }
        },
        
        
        /**
         * 表头筛选响应
         * @param {Object} action
         * @param {Object} tableid
         * @param {Object} queryChangeHandler 当整个表格的筛选条件发生变化时，回调的函数，不传递的话则执行action的refesh动作 add by yanlingling
         *   needInitSearchComboTip  是否需要关联主页面的搜索提示。。（我也不知道该怎么叫）SearchComboTip add by yanlingling  
         */
        getTableOnfilterHandler : function(action,tableid,queryChangeHandler,notNeedInitSearchComboTip){
            //alert(1);
            var me = action;
                me.setContext("queryChangeHandler",queryChangeHandler);
                me.setContext("notNeedInitSearchComboTip",notNeedInitSearchComboTip);
            return function(filterField, target){
                var filterCol = me.getContext('filterCol'),
                    filterTotal = 0;
                
                if (!filterCol || (filterCol[filterField.field] && filterCol[filterField.field].on)){
                    nirvana.manage.FilterControl.onfilter(filterField, target, me, tableid);
                }else{
                    if (nirvana.manage.validateCondition([me.getContext('searchQueryValue'),me.getContext('searchStateValue')],(me.getContext('searchAdvanceValue') || {}),(me.getContext('searchShortcutValue') || {}),filterCol,5)){
                        nirvana.manage.FilterControl.onfilter(filterField, target, me, tableid);
                    }else{
                        ui.Dialog.alert({
                            title: '筛选条件限制',
                            content: '您的筛选条件已达6项，请重新设定筛选条件'
                        });
                        var logParams = {};
                        logParams.action = "filterExceed";
                        NIRVANA_LOG.send(logParams);
                    }
                }
            }
            
        },
        
        /**
         * 根据筛选条件处理计划数据
         * @author tongyao@baidu.com, linzhifeng@baidu.com
         */
        filterData : function(action,tarStat,dataContext){
            var me = action,
                data = dataContext,//me.getContext(dataContext), //查询得到的所有结果
                status = me.getContext('status'),
                query = me.getContext('query'),
                queryArray,                         //query变数组，空格隔开的多个query
                haveMatch,                          //临时变量
                targetNameInLowerCase,              //临时变量
                queryType = me.getContext('queryType'),
                advanceFilter = me.getContext('searchAdvanceValue'),
                shortcutFilter =  me.getContext('searchShortcutValue'),
                rs = [],            //组合筛选后的中间变量
                rsAdv = [],         //高级筛选后的中间变量
                rsScut = [];        //快捷查询后的中间变量
                
            //组合筛选---------------------------------------------------------
            if(query){
                query = baidu.string.trim(query);
            }
            else {
                query = '';
            }
            if(typeof status != 'undefined' && 
               typeof query != 'undefined' && 
               (status != '100' || query != '')){
                //有筛选条件
                queryArray = query.toLowerCase().split(/\s+/);
                for (var i = 0, l = data.length; i < l; i++){
                //  if(status == '100' || status.indexOf(data[i][tarStat]) > -1){//状态满足了
                    if(status == '100' || status == data[i][tarStat]){//状态满足了
                        if(query == ''){
                            //状态筛选
                            rs[rs.length] = data[i];
                        } else if(queryType == 'accurate'){
                            //精确匹配
                            /**
                             * 这里的逻辑没有判断计划和单元，修正如下，wanghuijun
                            if (data[i].showword == query) {
                                rs[rs.length] = data[i];
                            }
                             */
                            switch (me.VIEW) {
                                case 'planList':
                                    //计划
                                    if (data[i].planname == query) {
                                        rs[rs.length] = data[i];
                                    }
                                    break;
                                case 'unitList':
                                    //单元
                                    if (data[i].unitname == query) {
                                        rs[rs.length] = data[i];
                                    }
                                    break;
                                case 'keywordList':
                                    //关键词
                                case 'monitorDetail':
                                    //监控文件夹详情
                                    if (data[i].showword == query) {
                                        rs[rs.length] = data[i];
                                    }
                                    break;
                            }
                        } else {
                            //模糊匹配
                            haveMatch = false;
                            switch (me.VIEW ){
                                case 'keywordList':
                                    //关键词部分是后端做，前端不用弄
                                    haveMatch = true;
                                    //EMS挂了后用 by linzhifeng@baidu.com
                                    /*
                                    targetNameInLowerCase = data[i].showword.toLowerCase();
                                    for (var j = 0, len = queryArray.length; j < len; j++){
                                        if(targetNameInLowerCase.indexOf(queryArray[j]) != -1){
                                            haveMatch = true;
                                            break;
                                        }
                                    } 
                                    */
                                    break;
                                case 'planList':
                                    //计划
                                    targetNameInLowerCase = data[i].planname.toLowerCase();
                                    for (var j = 0, len = queryArray.length; j < len; j++){
                                        if(targetNameInLowerCase.indexOf(queryArray[j]) != -1){
                                            haveMatch = true;
                                            break;
                                        }
                                    }
                                    break;
                                case 'unitList':
                                    //单元
                                    targetNameInLowerCase = data[i].unitname.toLowerCase();
                                    for (var j = 0, len = queryArray.length; j < len; j++){
                                        if(targetNameInLowerCase.indexOf(queryArray[j]) != -1){
                                            haveMatch = true;
                                            break;
                                        }
                                    }
                                    break;
                                case 'monitorDetail':
                                    //监控文件夹详情
                                    targetNameInLowerCase = data[i].showword.toLowerCase();
                                    for (var j = 0, len = queryArray.length; j < len; j++){
                                        if(targetNameInLowerCase.indexOf(queryArray[j]) != -1){
                                            haveMatch = true;
                                            break;
                                        }
                                    }
                                    break;
                                case 'ideaList':
                                    //创意，不会走的分支
                                    alert('创意筛选出错了，请联系linzhifeng@baidu.com')
                                    break;
                            }
                            if(haveMatch){
                                rs[rs.length] = data[i];
                            }
                        }
                    }
                }
            }else{
                //无筛选条件 
                rs =  data;
            }
            
            //高级筛选---------------------------------------------------------
            rsAdv = rs;
            if (advanceFilter){
                var hasAdvSearch = false,
                    advSearch = {                   //多维判断条件扁平化
                        paysumH:-1,
                        paysumL:Number.MAX_VALUE,
                        paysum0:-1,
                        avgpriceH:-1,
                        avgpriceL:Number.MAX_VALUE,
                        clkH:-1,
                        clkL:Number.MAX_VALUE,
                        clk0:-1,
                        showqstat: qStar.getValues(),
                        pcshowq : qStar.getValues(),
                        mshowq : qStar.getValues()
                    };
                for (var key in advanceFilter){
                    if (advanceFilter[key] != '-1'){
                        hasAdvSearch = true;
                        switch (key){
                            case "advSearchPaysum":
                                switch (advanceFilter[key]){
                                    case 'H':
                                       advSearch.paysumH = ADV_FILTER_VALUE.HPaysum;    //高消费';
                                       break;
                                    case 'L':
                                       advSearch.paysumL = ADV_FILTER_VALUE.LPaysum;    //低消费';
                                       break;
                                    case '0':
                                       advSearch.paysum0 = 0;                           //消费为0';
                                       break;
                                }
                                break;
                            case "advSearchPrice":
                                switch (advanceFilter[key]){
                                    case 'H':
                                       advSearch.avgpriceH = ADV_FILTER_VALUE.HAvgprice;    //高平均点击价格';
                                       break;
                                    case 'L':
                                       advSearch.avgpriceL = ADV_FILTER_VALUE.LAvgprice;    //低平均点击价格';
                                       break;
                                }
                                break;
                            case "advSearchClk":
                                switch (advanceFilter[key]){
                                    case 'H':
                                       advSearch.clkH = ADV_FILTER_VALUE.HClk;          //高点击';
                                       break;
                                    case 'L':
                                       advSearch.clkL = ADV_FILTER_VALUE.LClk;          //低点击';
                                       break;
                                    case '0':
                                       advSearch.clk0 = 0;                              //点击为0';
                                       break;
                                }
                                break;
                            /*case "advSearchShowq":
                                advSearch.showqstat = advanceFilter[key].split(',');
                                break;
                            case "advSearchShowqPc":
                                advSearch.pcshowq = advanceFilter[key].split(',');
                                break;
                            case "advSearchShowqM":
                                advSearch.mshowq = advanceFilter[key].split(',');
                                break;*/
                        }
                    }
                }
                if (hasAdvSearch){
                    rsAdv = [];
                    for (var i = 0, l = rs.length; i < l; i++){
                        
                        var showqstat = qStar.correct(rs[i].showqstat);

                        if(rs[i].paysum > advSearch.paysumH &&
                           (advSearch.paysumL == Number.MAX_VALUE || (rs[i].paysum <= advSearch.paysumL && rs[i].paysum > 0))&& 
                           (advSearch.paysum0 != 0 || rs[i].paysum == 0) &&
                           
                           rs[i].avgprice > advSearch.avgpriceH &&
                           (advSearch.avgpriceL == Number.MAX_VALUE || (rs[i].avgprice <= advSearch.avgpriceL && rs[i].avgprice > 0))&&
                           
                           rs[i].clks > advSearch.clkH &&
                           (advSearch.clkL == Number.MAX_VALUE || (rs[i].clks <= advSearch.clkL && rs[i].clks > 0))&&
                           (advSearch.clk0 != 0 || rs[i].clks == 0) &&
                           
                           baidu.array.indexOf(advSearch.showqstat, showqstat.toString()) != -1
                        ){
                            rsAdv[rsAdv.length] = rs[i];        
                        }
                    }
                }
            }
            
            //快捷查询---------------------------------------------------------
            rsScut = rsAdv;
            if (shortcutFilter){
                for (var key in shortcutFilter){
                    if (shortcutFilter[key] == '1'){
                        rsScut = [];
                        switch (key){
                            case "scutKeypoint":        //高消费，高操作
                                for (var i = 0, l = rsAdv.length; i < l; i++){
                                    if (rsAdv[i].paysum >= ADV_FILTER_VALUE.HPaysum &&
                                        rsAdv[i].bidoptcount >= ADV_FILTER_VALUE.HOperate){
                                        rsScut[rsScut.length] = rsAdv[i];
                                    }
                                }
                                break;
                            case "scutHPpRate":         //高左侧展现概率
                                for (var i = 0, l = rsAdv.length; i < l; i++){
                                    if (rsAdv[i].pprate >= ADV_FILTER_VALUE.HPp){
                                        rsScut[rsScut.length] = rsAdv[i];
                                    }
                                }
                                break;
                            case "scutHClkRate":        //高点击率
                                for (var i = 0, l = rsAdv.length; i < l; i++){
                                    if (rsAdv[i].clkrate >= ADV_FILTER_VALUE.HClkrate){
                                        rsScut[rsScut.length] = rsAdv[i];
                                    }
                                }
                                break;
                        }
                        break;
                    }
                }
            }
            return rsScut;
        },
        
        /**
         * 表格筛选
         * @author linzhifeng@baidu.com
         */
        tableFilterData : function(action, data){
            var me = action,
                targetData = data,
                filterCol = me.getContext('filterCol'),
                hasFilter = false,
                itemCondition,
                //list,
                selected,
                filterType,
                filterValue,
                tableValue,
                rs = [];
            
            for (var i = 0, l = targetData.length; i < l; i++){
                //遍历所有数据
                itemCondition = true;   //与关系控制
                for (var field in filterCol){
                    //遍历所有筛选条件
                    if (itemCondition && filterCol[field].on){
                        //某个筛选条件打开
                        hasFilter = true;
                        //list = filterCol[field].list;
                        filterType =  filterCol[field].type;
                        filterValue = filterCol[field].value;
                        
                        if(field == 'appendIdeastat') {//附加创意后端返回的叫stat。。。
                            tableValue = targetData[i]['stat'];
                        } else {
                            tableValue = targetData[i][field];
                        }

                        
                        switch (filterType){
                            case 'num':
                            case 'percent':
                                if (filterType == 'num'){
                                    tableValue = fixed(tableValue);
                                    if (field == 'bid'){
                                        //出价
                                        if (tableValue - 0 == 0){
                                            //使用单元出价
                                            tableValue = fixed(targetData[i].unitbid);
                                        }
                                    }
                                }else{
                                    //点击率百分比
                                    tableValue = fixed(tableValue*100);
                                }
                                
                                if (!((filterValue[0] == '' || tableValue - filterValue[0] >= 0) &&
                                      (filterValue[1] == '' || tableValue - filterValue[1] <= 0))){
                                    itemCondition = false;
                                }
                                break;
                            case 'select':
                                if (filterValue.key != tableValue){
                                    itemCondition = false;
                                }
                                break;
                            case 'checkbox':
                                if (filterValue[tableValue] != 1){
                                    itemCondition = false;
                                }
                                break;
                            case 'text':
                                if (tableValue.indexOf(filterValue) == -1){
                                    itemCondition = false;
                                }
                                break;
                            case 'extbind':
                                if (filterValue[0] == 2 && tableValue != "-") {//待确认若无分机返回什么数据（若筛选未跟踪而返回值有分机号）
                                    itemCondition = false;
                                }
                                else 
                                    if (filterValue[0] == 1 && (tableValue == "-" || tableValue - filterValue[1] < 0 || tableValue - filterValue[2] > 0)){
                                        itemCondition = false;
                                    }
                                break;
                            }
                    }
                }
                if (itemCondition){
                    rs[rs.length] = targetData[i];
                }
            }
            
            return hasFilter ? rs : targetData;
        }
    };