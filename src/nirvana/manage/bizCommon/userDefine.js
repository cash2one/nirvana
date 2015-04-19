
/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:   nirvana/manage//userDefine.js
 * desc:    自定义列控制  从manage.js拿出来
 * author:  linzhifeng@baidu.com
 * date:    $Date: 2012/07/16 $
 */

  
   nirvana.manage.UserDefine = (function() {
    // modify by zhujialu

    // 配置
    var CONFIG = {
    // ------------ 计划层级 ------------
    PLAN_DEFAULT : ["planname", "planstat", "clks", "avgprice", "paysum", "shows", "trans", "phonetrans"],
    PLAN_ALL     : ["planname",  "planstat", "clks", "paysum", "shows", "trans", "phonetrans", 
                        "avgprice","clkrate", "showpay", "wbudget", "wregion", "qrstat1", "plancyc", 
                        "showprob", "allnegativecnt", "allipblackcnt"],
    PLAN_SHOW    : [
                        {key:"planname",       text:"推广计划"},    
                        {key:"wbudget",        text:"每日预算"},
                        {key:"wregion",        text:"推广地域"},
                        {key:"planstat",       text:"状态（启用/暂停）"},
                        {key:"qrstat1",        text:"搜索意图定位"},
                        {key:"clks",           text:"点击"},
                        {key:"paysum",         text:"消费"},
                        {key:"plancyc",        text:"推广时段"},
                        {key:"shows",          text:"展现"},
                        {key:"showprob",       text:"创意展现方式"},
                        {key:"trans",          text:"转化(网页)"},
                        {key:"allnegativecnt", text:"否定关键词"},
                        {key:"phonetrans",text:"转化(电话)"},
                        {key:"avgprice",       text:"平均点击价格"},
                        //  {key:"cprostat",       text:"网盟推广"},
                        {key:"allipblackcnt",  text:"IP排除"},
                        //  {key:"cproprice",      text:"网盟出价"},
                        {key:"showpay",        text:"千次展现消费"},
                        {key:"clkrate",        text:"点击率"}//,
                        //{key:"optsug",        text:"优化"}
                      ],
    // -------------- 单元层级 ------------
    UNIT_DEFAULT : ["unitname", "planname", "unitstat", "unitbid", "clks", "paysum", "shows", "trans", "phonetrans", "avgprice"],
    UNIT_ALL     : ["unitname", "planname", "unitstat", "unitbid", "clks", "paysum", "shows", "trans", "phonetrans", "avgprice", 
                    "clkrate", "showpay", "allnegativecnt","extbind"], 
    UNIT_SHOW    : [
                        {key:"unitname",       text:"推广单元"},
                        {key:"trans",          text:"转化(网页)"},
                        {key:"planname",       text:"推广计划"},
                        {key:"phonetrans",text:"转化(电话)"},
                        {key:"unitstat",       text:"状态（启用/暂停）"},
                        {key:"avgprice",       text:"平均点击价格"},
                        {key:"unitbid",        text:"出价"},
                        {key:"clkrate",        text:"点击率"},
                        {key:"shows",          text:"展现"},
                        {key:"showpay",        text:"千次展现消费"},
                        {key:"clks",           text:"点击"},
                        {key:"extbind",text:"分机号码"},
                        {key:"paysum",         text:"消费"},                      
                        {key:"allnegativecnt", text:"否定关键词"}                        
                    ],
    // --------------- 关键词层级 ------------
    WORD_DEFAULT : ["showword", "unitname", "planname", "wordstat", "bid", "wmatch", "pcshowq", "clks", "paysum", "shows", "trans", "avgprice"],
    WORD_ALL     : ["showword", "unitname", "planname", "wordstat", "bid", "wmatch", "pcshowq", "clks", "paysum", "shows", "trans", "avgprice", "clkrate", "showpay", "wurl"],
    WORD_SHOW    : [
                        {key:"showword",   text:"关键词"},
                        {key:"paysum",     text:"消费"},
                        {key:"unitname",   text:"推广单元"},
                        {key:"shows",      text:"展现"},
                        {key:"planname",   text:"推广计划"},
                        {key:"trans",      text:"转化(网页)"},
                        {key:"wordstat",   text:"状态（启用/暂停）"},
                        {key:"avgprice",   text:"平均点击价格"},
                        {key:"bid",        text:"出价"},
                        {key:"clkrate",    text:"点击率"},
                        {key:"wmatch",     text:"匹配模式"},
                        {key:"showpay",    text:"千次展现消费"},
                        {key:"pcshowq",  text:"计算机端质量度"},
                        // {key:"ideaquality",  text:"创意撰写质量"},
                        // {key:"pageexp",  text:"目标网页体验"},
                        {key:"wurl",       text:"访问URL"},
                        {key:"clks",       text:"点击"}
                    ],
    // ----------------- 创意层级 ---------------
    IDEA_DEFAULT : ["idea", "unitname", "planname", "ideastat", "clks", "paysum", "shows", "trans", "avgprice"],
    IDEA_ALL     : ["idea", "unitname", "planname", "ideastat", "clks", "paysum", "shows", "trans", "avgprice", "clkrate", "showpay"],
    IDEA_SHOW    : [
                        {key:"idea",     text:"创意"},
                        {key:"shows",    text:"展现"},
                        {key:"unitname", text:"推广单元"},
                        {key:"trans",    text:"转化(网页)"},
                        {key:"planname", text:"推广计划"},
                        {key:"avgprice", text:"平均点击价格"},
                        {key:"ideastat", text:"状态（启用/暂停）"},
                        {key:"clkrate",  text:"点击率"},
                        {key:"clks",     text:"点击"},
                        {key:"showpay",  text:"千次展现消费"},
                        {key:"paysum",   text:"消费"}                 
                    ],
    //-----------------附加创意层级 ---------------------------
    APPENDIDEA_DEFAULT: ["content", "unitname","planname","stat","clks","paysum","shows","avgprice"],
    APPENDIDEA_ALL    : ["content", "unitname",  "planname",   "stat",  "clks","paysum","shows","avgprice","clkrate","showpay"],
    APPENDIDEA_SHOW   : [
                            {key:"content",text:"蹊径子链"},
                            {key:"paysum",text:"消费"} , 
                       //     {key:"creativetype",text:"类型"},
                            {key:"unitname",text:"推广单元"},
                            {key:"shows",text:"展现"},
                            {key:"planname",text:"推广计划"},
                            {key:"avgprice",text:"平均点击价格"},
                            {key:"stat",text:"状态（启用/暂停）"},
                            {key:"clkrate",text:"点击率"},
                            {key:"clks",text:"点击"},
                            {key:"showpay",text:"千次展现消费"}
                        ],
    // ---------------- app创意-------------------
    APP_DEFAULT: ['appname','appdevicetype','version','apimodtime',"unitname","planname","stat","clks","paysum","shows","avgprice"],
    APP_ALL    : ['appname','appdevicetype','version','apimodtime','unitname','planname','stat','clks','paysum','shows','avgprice','clkrate','showpay'],
    APP_SHOW   : [
                       {key:"appname",text:"App名称"},
                       {key:"clks",text:"点击"},
                       {key:"appdevicetype",text:"系统类型"},
                       {key:"paysum",text:"消费"},
                       {key:"version",text:"版本"},
                       {key:"shows",text:"展现"},
                       {key:"apimodtime",text:"最近更新时间"},
                       {key:"avgprice",text:"平均点击价格"},
                       {key:"unitname",text:"推广单元"},
                       {key:"clkrate",text:"点击率"},
                       {key:"planname",text:"推广计划"},
                       {key:"showpay",text:"千次展现消费"},
                       {key:"stat",text:"状态（启用/暂停）"}
                 ],
    // ---------------- 监控文件夹 -------------------
    FOLDER_DEFAULT : ["showword", "unitname", "planname", "wordstat", "bid", "wmatch", "showqstat", "clks", "paysum", "shows", "trans", "avgprice"],
    FOLDER_ALL     : ["showword", "unitname", "planname", "wordstat", "bid", "wmatch", "showqstat", "clks", "paysum", "shows", "trans", "avgprice", "clkrate", "showpay", "wurl"],
    FOLDER_SHOW    : [
                        {key:"showword",  text:"关键词"},
                        {key:"paysum",    text:"消费"},
                        {key:"unitname",  text:"推广单元"},
                        {key:"shows",     text:"展现"},
                        {key:"planname",  text:"推广计划"},
                        {key:"trans",     text:"转化(网页)"},
                        {key:"wordstat",  text:"状态（启用/暂停）"},
                        {key:"avgprice",  text:"平均点击价格"},
                        {key:"bid",       text:"出价"},
                        {key:"clkrate",   text:"点击率"},
                        {key:"wmatch",    text:"匹配模式"},
                        {key:"showpay",   text:"千次展现消费"},
                        {key:"showqstat", text:"质量度"},
                        // {key:"ideaquality",  text:"创意撰写质量"},
                        // {key:"pageexp",  text:"目标网页体验"},
                        {key:"wurl",      text:"访问URL"},
                        {key:"clks",      text:"点击"}
                    ],
    // ----------------- KR ---------------------------
    KR_DEFAULT : ["showword", "pv", "kwc"],
    KR_ALL     : ["showword", "pv", "kwc", "pv_trend_month"],
    KR_SHOW    : [
                        {key:"showword",       text:"关键词"},
                        {key:"pv",             text:"月搜索量"},
                        {key:"kwc",            text:"竞争激烈程度"},
                        {key:"pv_trend_month", text:"搜索量最高月份"}
                ],

    // ----------------- ANALYSE ----------------------
    ANALYSE_DEFAULT: ["showword", "unitname", "planname", "wordstat", "bid", "wmatch", "showqstat", "clks", "paysum", "shows", "trans", "avgprice"],
    ANALYSE_ALL: ["showword", "unitname", "planname", "wordstat", "bid", "wmatch", "showqstat", "clks", "paysum", "shows", "trans", "avgprice", "clkrate", "showpay", "wurl"],
    ANALYSE_SHOW: [
            {key:"showword",text:"关键词"},
            {key:"paysum",text:"消费"},
            {key:"unitname",text:"推广单元"},
            {key:"shows",text:"展现"},
            {key:"planname",text:"推广计划"},
            {key:"trans",text:"转化"},
            {key:"wordstat",text:"状态（启用/暂停）"},
            {key:"avgprice",text:"平均点击价格"},
            {key:"bid",text:"出价"},
            {key:"clkrate",text:"点击率"},
            {key:"wmatch",text:"匹配模式"},
            {key:"showpay",text:"千次展现消费"},
            {key:"showqstat",text:"质量度"},
            {key:"wurl",text:"访问URL"},
            {key:"clks",text:"点击"}
        ]
    };
   
    /**
     * 获得自定义面板勾选的列
     * @return {Array}
     */
    function getSelectedCols() {
        var allCols = ud.attrShow[ud.dimlevel], ret = [], key, checkbox;
                        
        for (var i = 0, len = allCols.length; i < len; i += 2) {
            key = allCols[i].key;
            checkbox = baidu.g('UDList_' + key);
            if (checkbox && checkbox.checked) {
                ret.push(key);
            }
        }
        for (i = 1; i < len; i += 2) {
            key = allCols[i].key;
            checkbox = baidu.g('UDList_' + key)
            if (checkbox && checkbox.checked) {
                ret.push(key);
            }
        }
        return ret;
    }
    
    /**
     * 拷贝一个数组
     * @param {Array} source
     * @return {Array}
     */
    function copyArray(source) {
        var ret = [];
        for (var i = 0, len = source.length; i < len; i++) {
            ret[i] = source[i];
        }
        return ret;
    }
    
    /**
     * dimlevel转换
     * 从英文转数字
     * 3：plan，5：unit，11：word，7：idea，15：folder，19：KR
     * app 9 
     */
    var transform = {
        plan: 3,
        unit: 5,
        word: 11,
        idea: 7,
        folder: 15,
        kr: 19,
        analyse: 21,
        appendIdea:8,
        app: 9
    };

    var ACTIVE_CLASS = 'user_define_active';
    
    /**
     * 设置‘默认’，‘全部’，‘自定义’的勾选情况，即把应该勾选的都勾上
     * @param {Array} arr
     * @param {Boolean} select 是否选中，true表示要选中, false你懂的
     */
    function setCheckboxs(arr, select) {
        var item, key, checkbox;
        for (var i = 0, len = arr.length; i < len; i++) {
            item = arr[i];
            // 有key属性表示是attrShow数组
            key = typeof item.key === 'undefined' ? item : item.key;
            
            checkbox = baidu.g('UDList_' + key);
            if (checkbox) {
                checkbox.checked = !!select;
            }
        }
    }

    /**
     * 显示隐藏
     * @param {Number} attrStyle 0：默认  1：全部  2：自定义
     * @param {Function} fn 切换之后需要进行的操作
     */
    function switchPane(attrStyle, fn) {
        if (typeof attrStyle !== 'number') {
            attrStyle = parseInt(attrStyle, 10);
        }
        if (typeof fn !== 'function') {
            fn = new Function();
        }

        var defaultUD    = baidu.g('UDDefault'),
            allUD        = baidu.g('UDAll'),
            customUD     = baidu.g('UDCustom'),
            // 需要显示的UD
            showUD,
            // 需要隐藏的另外两个UD
            hideUD1, hideUD2;
        
        switch(attrStyle){
            case 0:
                showUD = defaultUD;
                hideUD1 = allUD;
                hideUD2 = customUD;

                fn();
                break;
            case 1:
                showUD = allUD;
                hideUD1 = defaultUD;
                hideUD2 = customUD;
                
                fn();
                break;
            case 2:
                showUD = customUD;
                hideUD1 = defaultUD;
                hideUD2 = allUD;

                fn();
                break;
        }
        baidu.dom.addClass(showUD, ACTIVE_CLASS);
        baidu.dom.removeClass(hideUD1, ACTIVE_CLASS);
        baidu.dom.removeClass(hideUD2, ACTIVE_CLASS);
    }

    function getEvent(e) {
        e = e || window.event;
        return e;
    }
    // 获得事件的target
    function getTarget(e) {
        e = getEvent(e); 
        return e.target || e.srcElement;
    }
    
    var TPL_TITLE = '<span id="UDType" class="user_define_attr">' +
                        '<a id="UDDefault" href="#">默认</a> | ' +
                        '<a id="UDAll" href="#">全部</a> | ' + 
                        '<a id="UDCustom" href="#">自定义</a> | ' + 
                    '</span>';
    /**
     * 获得模版文件
     */
    function getTpl() {
        var attrShow = ud.attrShow[ud.dimlevel],
            html = [];

        html.push('<div id="UDListDiv" class="user_define_list_div"><table><tbody>');

        // 两列数据，奇偶行颜色不同, flag用于决定奇偶行
        var key, text, flag, j;
        for (var i = 0, len = attrShow.length; i < len; i += 2) {

            flag = (i / 2) % 2;
            // 一次处理两个数据
            key = attrShow[i].key;
            text = attrShow[i].text;
            
            // 处理左列
            html.push('<tr class="tr_type_');
            html.push(flag);
            html.push('"><td><input type="checkbox" id="UDList_');
            html.push(key); 
            html.push('"/>&nbsp;<label for="UDList_');
            html.push(key);
            html.push('">');
            html.push(text);
            html.push('</label></td>');

            // 处理右列
            if (i + 1 < len) {
                j = i + 1;
                key = attrShow[j].key;
                text = attrShow[j].text;

                html.push('<td><input type="checkbox" id="UDList_');
                html.push(key);
                html.push('"/>&nbsp;<label for="UDList_');
                html.push(key);
                html.push('">');
                html.push(text);
                html.push('</label></td></tr>');
            } else {
                html.push('<td>&nbsp;</td></tr>');
            }
        }
        html.push('</tbody></table></div>');

        return html.join('');
    }
    
    // 日志相关
    function sendLog(dimlevel, colstype) {
        var params = {
            target    : 'userDefine',
            dimlevel  : dimlevel,
            colstype  : colstype,
            customcols: getCols(colstype) 
        };
        NIRVANA_LOG.send(params);
    }

    /**
     * 根据attrStyle获得对应的数组
     */
    function getCols(attrStyle, level) {
        attrStyle = attrStyle || 0;
        level = typeof level !== 'undefined' ? level : ud.dimlevel;

        if (typeof attrStyle !== 'number') {
            attrStyle = parseInt(attrStyle, 10);
        }
        var ret;
        switch(attrStyle) {
            case 0:
                ret = ud.attrDefault[level];
                break;
            case 1:
                ret = ud.attrAll[level];
                break;
            default:
                ret = ud.attrCustom[level];
                break;
        }
        return ret;
    }

    var ud =  {
        me : null,
        dimlevel : 'plan',      //plan、unit、word、idea   、folder、analyse（效果分析新搞的层级，其实跟关键词层级基本一样，为了以后不跟着关键词一起升级，重搞了一个add by yanlingling）
        tableId : '',       //需要回刷的tableId
        isContentInit : {
            plan : false,
            unit : false,
            word : false,
            idea : false,
            kr : false,
            analyse:false,
            appendIdea:false,
            app:false
        },      
        isDialogInit : false,   
        dialog : null,
        //userDefineBtn : null,
        currentUdBtnId : '',
        autoRefresh : true,
        callbackHandler : new Function(),
        attrType : {        //修改前 0：默认，1：全部：2：自定义
            plan : 0,
            unit : 0,
            word : 0,
            idea : 0,
            kr : 0,
            analyse:0,
            appendIdea : 0,
            app: 0
        },       
        // 格式为 dimlevel -> attrStyle  attrStyle表示“默认”，“全部”，“自定义”中的一种
        attrCurType : {},   //修改后 0：默认，1：全部：2：自定义   
        attrList : {},      //修改前定义的列
        
        attrDefault : {},   //默认列
        attrAll : {},       //全部列
        attrCustom : {},    //用户自定义列
        attrShow : {},      //全部可选，用于呈现
        dialogCloseCallback : function(){}, //用户关闭对话框后的回调函数  add by yanlingling@baidu.com
        dialogShowCallback : function(){}, //对话框show后的回调函数  add by yanlingling@baidu.com
        
        
        /**
         *获取层级的配置 
         */
      
        getConfig : function(dimlevel) {
            var res = {};
            var dimlevel = dimlevel.toUpperCase()
            res.defaultCol = CONFIG[dimlevel + '_DEFAULT'];
            res.all = CONFIG[dimlevel + '_ALL'];
            res.show = CONFIG[dimlevel + '_SHOW'];
            return res;
        },
        
        /**
         * 设置配置项
         */
         setConfig : function(dimlevel,value) {
            var dimlevel = dimlevel.toUpperCase()
            CONFIG[dimlevel + '_DEFAULT'] = value.defaultCol;
            CONFIG[dimlevel + '_ALL'] = value.all;
            CONFIG[dimlevel + '_SHOW'] = value.show;
        },
        
        /**
         * 初始化Dialog
         */
        initDialog : function(){
            var attrShow = ud.attrShow[ud.dimlevel];        
            if (!ud.isDialogInit){
                ud.dialog = ui.Dialog.factory.create({
                    id : 'UserDefineDialog',
                    title : TPL_TITLE,
                    skin  : "modeless",
                    dragable : false,
                    needMask : false,
                    unresize : true,
                    maskLevel : 5,
                    width : 300,
                    onok : function() {
                        var level = ud.dimlevel,
                            // 当前是"默认", "全部" 还是"自定义"
                            type = ud.attrCurType[level],
                            newList = getSelectedCols();

                        //add by yanlingling@baidu.com 确认关闭对话框的回调 用于效果分析
                        if (typeof(ud.dialogCloseCallback) != 'undefined'){
                               ud.dialogCloseCallback();
            
                           }

                        if (baidu.json.stringify(newList) != baidu.json.stringify(ud.attrList[level])) {
                            // 有变化才需要refresh
                            
                            if (type == 2) {
                                // 保存用户最后生效的自定义列数据
                                ud.attrCustom[level] = copyArray(newList);
                            }
                            ud.attrType[level] = type;
                            ud.attrList[level] = copyArray(newList);
                            
                            var dimlevel = transform[level],
                                colstype = ud.attrType[level],
                                customcols = ud.attrCustom[level];

                            fbs.material.modCustomList({
                                dimlevel : dimlevel,
                                colstype : colstype,        //0：默认，1：全部，2：自定义
                                customcols : customcols 
                            });
                            
                            sendLog(dimlevel, colstype);
                            
                            fbs.material.getCustomList.clearCache();
                            if (ud.autoRefresh){
                                ui.util.get(ud.tableId).resetTableAfterFieldsChanged();
                                ud.me.refresh();
                            }else{
                                ud.callbackHandler && ud.callbackHandler(ud.attrList[level]);
                            }
                        }
                    }
                });

                ud.dialog.hide();
                
                // 切换 ‘默认’，‘全部’，‘自定义’
                baidu.g('UDType').onclick = function(e) {
                    e = getEvent(e);
                    var target = getTarget(e),
                        id = target.id || '';
                    switch (id) {
                        case 'UDDefault':
                            ud.setAttrStyle(0);
                            break;
                        case 'UDAll':
                            ud.setAttrStyle(1);
                            break;
                        case 'UDCustom':
                            ud.setAttrStyle(2);
                            break;
                    }
                    
                    baidu.event.stop(e);
                }
                                
                baidu.on(window, 'resize', ud.resizeHandler);
                baidu.on(window, 'scroll', ud.resizeHandler);
                
                ud.isDialogInit = true;
            }
            
            ud.dialog.setContent(getTpl());
            
            // 勾选checkbox的事件函数
            baidu.g('UDListDiv').onclick = function(e) {
                var target = getTarget(e);
                if (target.tagName === 'INPUT') {
                    ud.judgeAttrStyle();
                }
            }
        },
        
        /**
         * 初始化各种情况下可选择的列表数据
         */
        initListContent : function() {
            var level = this.dimlevel || '';
            // 这里把百行代码重构成不到10行 by zhujialu
            // ud.dimlevel 的值为 plan, unit, word, idea, folder, kr
            var prefix = level.toUpperCase();
            
            this.attrDefault[level] = CONFIG[prefix + '_DEFAULT'];
            this.attrAll[level] = CONFIG[prefix + '_ALL'];
            this.attrShow[level] = CONFIG[prefix + '_SHOW'];
       },
        
        /**
         * 设定各复选框状态
         * @param {Object} attrStyle 0：默认  1：全部  2：自定义
         */
        setAttrStyle : function(attrStyle) {
            var me = this, level = me.dimlevel;
            
            ud.attrCurType[level] = attrStyle;

            var attrShow = me.attrShow[level],
                attrDefault = me.attrDefault[level],
                attrCustom = me.attrCustom[level];

            // 重置所有checkbox的状态
            setCheckboxs(attrShow, false);
            
            switchPane(attrStyle, function() {
                var arr;
                if (attrStyle == '0') {
                    arr = attrDefault;
                } else if (attrStyle == '1') {
                    arr = attrShow;
                } else if (attrStyle == '2') {
                    arr = attrCustom;
                }
                setCheckboxs(arr, true);
            });
        },
        
        /**
         * 判断当前类型
         */
        judgeAttrStyle : function() {
            var level = ud.dimlevel,
                curList = getSelectedCols(), 
                defList;
            
            var all = curList.length === ud.attrShow[level].length, 
                attrStyle;
            
            if (all) {
                attrStyle = 1;
            } else {
                curList = baidu.json.stringify(curList);
                defList = baidu.json.stringify(ud.attrDefault[level]);
                if (curList == defList) {
                    attrStyle = 0;
                } else {
                    attrStyle = 2;
                }
            }
            // 切换
            switchPane(attrStyle, function() {
                ud.attrCurType[level] = attrStyle;
            })            
        },
        
        /**
         * 窗口响应函数
         */ 
        resizeHandler : function() {
            if (!ud.dialog.isShow) {
                return;
            }

            ui.util.smartPosition(ud.dialog.getDOM(), {
                pos     : 'b',
                align   : 'l',
                target  : ud.currentUdBtnId,//ud.userDefineBtn.getId(),
                repairL : 83
            });             
        },
        
        
        
        /**
         * 获取自定义列控制，也是自定义列初始化的地方
         * 这个方法外界作为事件处理函数使用，注意this的引用
         * 
         * @param {Object} ac
         * @param {Object} level
         * @param {Object} tableId
         * @param {Object} autoRefresh
         * @param {Object} udBtnId
         * @param {Object} callbackHandler
         * @param {Object} dialogShowCallback   add by yanlingling@baidu.com
         * @param {Object} dialogCloseCallback  add by yanlingling@baidu.com
         */
        getUserDefineHandler : function(ac, level, tableId, autoRefresh, udBtnId, callbackHandler,dialogShowCallback,dialogCloseCallback){
            if (typeof(autoRefresh) === 'undefined'){
                autoRefresh = true;
            }
            if (typeof(udBtnId) === 'undefined'){
                udBtnId = 'userDefine';
            }
            if (typeof(callbackHandler) === 'undefined'){
                callbackHandler = new Function();
            }
            ud.me = ac;
            ud.dimlevel = level;
            ud.tableId = tableId;
            ud.autoRefresh = autoRefresh;
            ud.callbackHandler = callbackHandler;
            ud.currentUdBtnId = ui.util.get(udBtnId).getId();
            ud.dialogCloseCallback=dialogCloseCallback;
            ud.dialogShowCallback=dialogShowCallback;
            ud.initDialog();
            
            return function(){
                if (ud.dialog.isShow){
                    return;
                }
                ud.autoRefresh = autoRefresh;
                ud.callbackHandler = callbackHandler;
                ud.currentUdBtnId = ui.util.get(udBtnId).getId();
            //  if (ud.dimlevel != level){
                    //解决tool跳出来的自定义列问题
                    ud.me = ac;
                    ud.dimlevel = level;
                    if(ud.me.getContext('appendIdeaType') == 'app'){
                        ud.dimlevel = 'app';
                    }
                    ud.tableId = tableId;
                    //ud.initListContent();
                    ud.initDialog();
            //  }
                    //自定义列对话框显示以后的回调函数，用于效果分析工具 add by yanlingling@baidu.com  
                if (typeof(dialogCloseCallback) != 'undefined'){
                ud.dialog.onclose=dialogCloseCallback;
                ud.dialog.oncancel=dialogCloseCallback;
            }
                if (typeof(dialogShowCallback) != 'undefined'){
                dialogShowCallback();
            }
            
                ud.dialog.show();
                
                ui.util.smartPosition(ud.dialog.getDOM(),{
                    pos : 'b',
                    align : 'l',
                    target : ud.currentUdBtnId,//ud.userDefineBtn.getId(),
                    repairL : 83
                });
            
                
                //显示当前类型
                ud.setAttrStyle(ud.attrType[ud.dimlevel]);
                
                // 需要置灰的选项
                switch (ud.dimlevel) {
                    case 'plan':
                        baidu.g('UDList_planname').disabled = true;
                        break;
                    case 'unit':
                        baidu.g('UDList_unitname').disabled = true;
                        break;
                    case 'word':
                        baidu.g('UDList_showword').disabled = true;
                        break;
                    case 'analyse':
                    
                        baidu.g('UDList_showword').disabled = true;
                        break;
                    case 'idea':
                        baidu.g('UDList_idea').disabled = true;
                        break;
                    case 'appendIdea':
                        baidu.g('UDList_content').disabled = true;
                        break;
                    case 'folder':
                        baidu.g('UDList_planname').disabled = true;
                        baidu.g('UDList_unitname').disabled = true;
                        baidu.g('UDList_showword').disabled = true;
                        break;
                    case 'kr':
                        baidu.g('UDList_showword').disabled = true;
                        baidu.g('UDList_kwc').disabled = true;
                        baidu.g('UDList_pv').disabled = true;
                        break;
                    case 'app':
                       baidu.g('UDList_appname').disabled = true;
                       break;
                }
            };
        },
        
        /**
         * 获取用户自定义列
         * @param {Object} type
         * @param {Object} callback
         */
        getUserDefineList: function(level, callback) {
             //if (!ud.isContentInit[level] || ud.dimlevel != level){
                ud.dimlevel = level;
                ud.initListContent()
                fbs.material.getCustomList({
                    dimlevel  : transform[level],
                    onSuccess : onSuccess,
                    onFail    : onFail 
                });
            //} else {
            //    ud.initListContent()//第一次initListContent之后，自定义列的数据还有可能改变，如计划切换设备了，要每次都init一下，for双url yll
            //    callback();
            //}

            function onSuccess(json) {
                var data = json.data, cols = data.customcols, i, len;

                if (data.colstype == -1) {
                    data.colstype = 0;
                }
                ud.attrType[level] = data.colstype;

                // 保存用户自定义列
                if (cols != null) {
                    var arr = [], item;
                    for (i = 0, len = cols.length; i < len; i++) {
                        item = cols[i];
                        // 屏蔽自定义列中网盟推广相关--小网盟下线
                        if (item != 'cprostat' && item != 'cproprice') {
                            // 将原来存储的showq转换成showqstat
                            arr[i] = item != 'showq' ? item : 'showqstat';
                        }
                    }
                    ud.attrCustom[level] = arr;
                } else {
                    ud.attrCustom[level] = copyArray(ud.attrDefault[level]);
                }
                var sourceArr = getCols(data.colstype, level);
                ud.attrList[level] = copyArray(sourceArr);

                ud.isContentInit[level] = true;
                callback();     
            }

            function onFail() {
                var dimLevel = ud.dimlevel;

                ud.attrType[dimLevel] = 0;
                ud.attrCustom[dimLevel] = copyArray(ud.attrDefault[dimLevel]);
                ud.attrList[dimLevel] = copyArray(ud.attrDefault[dimLevel]);

                ud.isContentInit[level] = false;
                callback();
            }
        }
        
    };
        return ud;
    })();