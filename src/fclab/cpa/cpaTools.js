/**
 * @file cpa工具设置
 * @author guanwei01@baidu.com
 */

fclab = fclab || {};
fclab.cpa = fclab.cpa || {};

// cache数据
fclab.cpa.ToolsCache = {};
fclab.cpa.Tools = function() {
    // 前期准备
    fclab.cpa.beforeSwitchTab('Tools');

    // 获取dom
    var doms    = {
        // 总数
        'cpa-tools-cpa-num': baidu.dom.g('cpa-tools-cpa-num'),
        // 空
        'cpa-content-empty': baidu.dom.g('cpa-content-empty'),
        // 表格父容器
        'cpa-lists-container': baidu.dom.g('cpa-lists-container'),
        // 添加
        'CreateNewCpaInner': baidu.dom.g('CreateNewCpaInner'),
        'cpa-lists-editbid': baidu.dom.g('cpa-lists-editbid'),
        'cpa-delete-history': baidu.dom.g('cpa-delete-history'),
        // 表格父元素
        'cpa-lists-table': baidu.dom.g('cpa-lists-table'),
        // 分页
        'cpa-lists-pager': baidu.dom.g('cpa-lists-pager')
    };

    // 初始化控件变量
    var pager, editBidDialoger, editButtoner, tabler, dataBase, currentPage;

    // 初始化“修改转化出价”按钮
    editButtoner = ui.util.create(
        'Button', 
        {
            id: 'cpa-lists-editbid'
        }, 
        doms['cpa-lists-editbid']
    );
    // 初始情况为禁用
    editButtoner.disable(1);
    editButtoner.onclick = function() {
        // 单一
        nirvana.util.openSubActionDialog({
            id: 'editBidDialoger',
            title: fclab.cpa.config.hints[1021],
            width: 440,
            actionPath: 'fclab/cpa/editbid'
        });
    };

    // 初始化分页组件
    pager = ui.util.create(
        'Page', 
        {
            id: 'cpa-lists-pager',
            total: 1, // total 为1的时候并不会渲染
            page: 1
        }, 
        doms['cpa-lists-pager']
    );

    pager.onselect = function(now) {
        // renderTable(null, now); // 多余
        getLists(now);
        editButtoner.disable(1);
    };

    // 请求
    function getLists(pageno) {
        pageno = pageno == undefined ? 0 : (pageno - 1);
        fbs.cpa.getCpas({
            pageno: pageno,
            limit: 10,
            onSuccess: function(o) {
                succ(o, pageno + 1);
            }
        });
    };

    // 暴露刷新函数
    fclab.cpa.ToolsRefreshTable = function() {
        getLists(currentPage);
        // 新刷新需要置灰批量修改框
        editButtoner.disable(1);
    };

    // 响应函数
    function succ(o, currentP) {
        // 如果为空
        if(o.data.total == undefined
            || o.data.total == 0) {
            // 判断是不是最后一页只有一个数据
            if(currentP > 1) {
                getLists(currentP - 1);
                return;
            }
            doms['cpa-lists-container'].style.display = 'none';
            doms['cpa-content-empty'].style.display = 'block';
            doms['cpa-tools-cpa-num'].innerHTML = 0;
            // 绑定事件
            baidu.event.on(
                doms['CreateNewCpaInner'],
                'click',
                fclab.cpa.addCpa
            );
            return;
        } 
        // 有结果
        currentPage = currentP;
        doms['cpa-lists-container'].style.display = 'block';
        doms['cpa-content-empty'].style.display = 'none';
        doms['cpa-tools-cpa-num'].innerHTML = o.data.total;
        // 开始渲染表格
        renderTable(o.data, currentPage);
        // 记得初始化小问号
        // var bubbleSet = baidu.q("ui_bubble", doms['cpa-lists-table'], "span");
        // ui.Bubble.init(bubbleSet);
    };

    // 形成cache数据
    function createCache(data) {
        // fclab.cpa.ToolsCache.CHOSEN = [];
        // fclab.cpa.ToolsCache.IDCHOSENMAP = {};

        fclab.cpa.ToolsCache.IDMAP  = {};
        for(var i = 0, len = data.length; i < len; i ++) {
            fclab.cpa.ToolsCache.IDMAP[data[i].labid]
                = data[i];
        }
        // 放入缓存
        dataBase = data;
    };

    // 表格绑定事件
    function bindTableEvent(table) {
        //给表格注册:行内编辑处理器
        table.main.onclick = tableInlineHandler;
        table.onselect     = tableRowSelect;
    };

    // 表格选择
    function tableRowSelect(o) {
        // 输出的是数组
        fclab.cpa.ToolsCache.CHOSEN = [];
        // fclab.cpa.ToolsCache.IDCHOSENMAP  = {};
        if(o.length == 0) {
            editButtoner.disable(1);
            return;
        }
        // 如果o.length大于0
        o.length > 0
            && editButtoner.disable(0);
        // 每次点击一次都要循环一次？
        // 放入CHOSEN
        for(var i = 0, len = o.length; i < len; i ++) {
            var inx = o[i];
            fclab.cpa.ToolsCache.CHOSEN.push(
                dataBase[inx].labid
            );
            // fclab.cpa.ToolsCache.IDCHOSENMAP[dataBase[inx].labid] = true;
        }
    };

    // 表格事件处理器
    function tableInlineHandler(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;
        // 单击“平均转化出价”的小铅笔，编辑出价
        if(target.className == 'edit_btn') {
            var labid = target.getAttribute('labid');
            // try {
                editBid(labid);
            // } catch(e) {}
        }
        // 单击启用或者暂停小流量
        if(baidu.dom.hasClass(target, 'cpa-xiao-stat-hasstop')) {
            // 启用
            editAb(true, target.getAttribute('labid'));
        }
        if(baidu.dom.hasClass(target, 'cpa-xiao-stat-hasstart')) {
            // 暂停
            editAb(false, target.getAttribute('labid'));
        }
        // 删除
        if(target.getAttribute('cpa-action') == 'del') {
            delCpa(target.getAttribute('labid'));
        }
    };

    // 删除
    function delCpa(labid) {
        ui.Dialog.confirm({
            title: '确认',
            content: '删除后查看报告页中将不再保留该计划对应的所有数据，请提早做好备份。',
            onok: function(){
                fbs.cpa.deleteCpa({
                    labid: [labid],
                    onSuccess: function(o) {
                        if(o.status == 200)
                            getLists(currentPage); 
                    }
                });
            }
        });
    };

    // editAb
    function editAb(start, labid) {
        if(start) {
            fbs.cpa.editXll({
                labid: labid,
                isab: 0,
                onSuccess: function(o) {
                    if(o.status == 200)
                        getLists(currentPage); 
                }
            });
        }
        if(!start) {
            ui.Dialog.confirm({
                title: '确认',
                content: '下次再重新启用实验，将只能看到最新一次小流量实验的数据，之前数据请提早做好备份。',
                onok: function(){
                    fbs.cpa.editXll({
                        labid: labid,
                        isab: 1,
                        onSuccess: function(o) {
                            if(o.status == 200)
                                getLists(currentPage); 
                        }
                    });
                }
            });
        }
    };

    // 编辑出价
    function editBid(id) {
        // 单一
        nirvana.util.openSubActionDialog({
            id: 'editBidDialoger',
            title: fclab.cpa.config.hints[1021],
            width: 440,
            actionPath: 'fclab/cpa/editbid',
            params: {
                labid: id
            }
        });
    };

    // 渲染表格
    function renderTable(data, pageno) {
        var renderData, pageSize = 10, total;
        // pageno == undefined 
        //     && (dataBase = data)
        //     && (pageno = 1)
        //     // 形成map数据
        //     && createCache(dataBase.cpalist);
        // // 要渲染的数据
        // renderData = dataBase.cpalist.slice(
        //     (pageno - 1) * pageSize, pageno * pageSize
        // );
        pageno == undefined
            && (pageno = 1);
        renderData = data.cpalist;
        // 形成map数据
        createCache(renderData);
        // 总共多少页
        total = Math.ceil(data.total / pageSize);
        // 初始化table组件
        tabler && tabler.dispose();
        // 这里暂时采用这种方式吧
        tabler = ui.util.create(
            'Table',
            // options
            fclab.cpa.config.cpaListTable
        );
        tabler.fields = 
            fclab.cpa.config.cpaListTableFields;
        tabler.datasource = renderData;
        // 表格渲染
        doms['cpa-lists-table'].innerHTML = '';
        tabler.appendTo(doms['cpa-lists-table']);
        bindTableEvent(tabler);
        // 分页渲染
        renderPager(total, pageno);
    };

    // 分页渲染
    function renderPager(total, pageno) {
        pager.total = total;
        pager.page = pageno;
        pager.render();
    };

    // 第一次请求
    getLists(1);

    // 绑定历史删除记录点击事件
    baidu.event.on(
        doms['cpa-delete-history'],
        'click',
        function () {
            // 新打开action
            nirvana.util.openSubActionDialog({
                id: 'cpaDelHistory',
                title: '历史删除记录',
                width: 552,
                actionPath: 'fclab/cpa/delHistory'
            });
        }
    );
};

// 修改出价的子action
fclab.cpa.editBid = new er.Action({
    VIEW: 'editBidDialoger',

    CONTEXT_INITER_MAP: {
        editBidSelectUD: function(callback) {
            this.setContext(
                'editBidSelectUD',
                [
                    {text: '提高', value: '1'},
                    {text: '降低', value: '0'}
                ]
            );
            callback();
        }
    },

    onentercomplete: function() {
        // Dialog二次定位标识
        nirvana.subaction.isDone = true;
    },

    onafterrender: function() {
        var me = this;
        // 可以从 me.arg.labid 获取到labid
        if(me.arg.labid != undefined) {
            me.editType = 'single';
            me.labid = me.arg.labid;
            me.labData = fclab.cpa.ToolsCache.IDMAP[me.labid];
        } 
        else {
            me.editType = 'multiple';
        }
        delete me.editTar;
        // 绑定相关事件
        me.bindEvent();
        // 单独修改，恢复默认值
        me.editType == 'single'
            && (me.singleRecover());
        // 批量修改
        me.editType == 'multiple'
            && (baidu.g('cpa-updown-container').style.display = 'block');
    },

    singleRecover: function() {
        var me = this;
        var updown = baidu.g('UporDownInputEdit');
        var userinput = baidu.g('cpaAverageBidUserInputEdit');
        if(me.labData.cpa == null) {
            ui.util.get('cpaAverageBidSysTypeEdit').setChecked(true);
            me.editTar = 'sys';
            updown.disabled = true;
            userinput.disabled = true;
            ui.util.get('UporDownEdit').disable(1);
            ui.util.get('UporDownSelect').disable(1);
        }
        else {
            ui.util.get('cpaAverageBidUserTypeEdit').setChecked(true);
            me.editTar = 'user';
            // 写入值
            baidu.g('cpaAverageBidUserInputEdit').value 
                // = me.labData.cpa.toFixed(2);
                = me.labData.cpa;
            updown.disabled = true;
        }
        // 验证
        me.singleValidate();
    },

    // 批量修改出价的时候，判断是否出价符合要求
    checkForUpDown: function(v, incre) {
        // v: 待提高或者降低的值，incre：提高或者降低（1提高，-1降低）
        // 从 fclab.cpa.ToolsCache.IDMAP 中获取某一条的详细信息
        // 从 fclab.cpa.ToolsCache.CHOSEN 中获取已选择的labid值
        var numU = 0, numD = 0;
        for(var i = 0, len = fclab.cpa.ToolsCache.CHOSEN.length; i < len; i ++) {
            var thisItem   = fclab.cpa.ToolsCache.IDMAP[fclab.cpa.ToolsCache.CHOSEN[i]];
            var cpa        = thisItem['cpa'];
            if(cpa == null) // 系统自定义的略过 
                continue;
            cpa = + cpa + v * incre;
            if(cpa <= 0)
                numD ++;
            if(cpa > 999.99)
                numU ++;
        }
        return {
            numU: numU,
            numD: numD
        };
    },

    multipleValidate: function() {
        var me = this;
        var hinter = baidu.g('cpa-edit-bid-hinter');
        var userInput  = baidu.g('cpaAverageBidUserInputEdit');
        // 还没选择
        if(me.editTar == undefined) {
            hinter.innerHTML = fclab.cpa.config.hints[1026];
            return false;
        }
        if(me.editTar == 'sys') {
            return true;
        }
        var val = userInput.value;
        // 如果是选择的提高或者降低
        if(me.editTar == 'updown') {
            var incre = ui.util.get('UporDownSelect').getValue()
                == 1 ? 1 : -1;
            incre = + incre; 
            userInput = baidu.g('UporDownInputEdit');
            val       = userInput.value;
            // 先判断是否为空
            if(/^\s*$/.test(val)) {
                userInput.focus();
                hinter.innerHTML = fclab.cpa.config.hints[10192];
                return false;
            }
        }
        else {
            // 判断输入是否为空
            if(/^\s*$/.test(val)) {
                userInput.focus();
                hinter.innerHTML = fclab.cpa.config.hints[1019];
                return false;
            }
        }
        // 判断输入是否为数字
        if(!/^[\d\.]+$/.test(val)) {
            userInput.focus();
            hinter.innerHTML = fclab.cpa.config.hints[10191];
            return false;
        }
        var v = + baidu.string.trim(val);
        // 小数点超过两位
        var sv = v + '';
        if(~sv.indexOf('.')
            && (sv.substring(sv.indexOf('.')).length - 1) >= 3) {
            userInput.focus();
            hinter.innerHTML = fclab.cpa.config.hints[1010];
            return false;
        }
        // 判断输入是否大于0
        if(v <= 0) {
            userInput.focus();
            hinter.innerHTML = fclab.cpa.config.hints[10193];
            return false;
        }
        // 有疑问？
        // if(me.editTar == 'updown') {
        //     // 为了防止出现 12+21.23 = 33.230000000000004 的情况
        //     v = (+ me.labData.cpa + val * incre).toFixed(2);
        // }
        // 是否大于0
        // if(v <= 0) {
        //     userInput.focus();
        //     hinter.innerHTML = fclab.cpa.config.hints[1008];
        //     return false;
        // }
        // 分支判断
        if(me.editTar == 'updown') {
            // 批量判断
            var result = me.checkForUpDown(v, incre);
            // 有超过的
            if(result.numU > 0 && result.numD == 0) {
                userInput.focus();
                hinter.innerHTML = ui.format(
                    fclab.cpa.config.hints[1027],
                    result.numU
                );
                return false;
            }
            // 有低于的
            if(result.numU == 0 && result.numD > 0) {
                userInput.focus();
                hinter.innerHTML = ui.format(
                    fclab.cpa.config.hints[1028],
                    result.numD
                );
                return false;
            }
            // 一切正常
            hinter.innerHTML = '';
            return true;
        }
        else {
            // 小于999.99
            if(v > 999.99) {
                userInput.focus();
                hinter.innerHTML = fclab.cpa.config.hints[1009];
                return false;
            }
            // 一切正常
            hinter.innerHTML = '';
            return true;
        }
    },

    singleValidate: function() {
        var me = this;
        var hinter = baidu.g('cpa-edit-bid-hinter');
        var userInput  = baidu.g('cpaAverageBidUserInputEdit');
        if(me.editTar == 'sys') {
            // hinter.innerHTML = fclab.cpa.config.hints[1005];
            return true;
        }
        // 是否选择
        // var planInfo  = me.transObjer.get(), hint;
        // if(planInfo.total == 0) {
        //     hinter.innerHTML = fclab.cpa.config.hints[1020];
        //     return false;
        // }
        var val = userInput.value;
        // 如果是选择的提高或者降低
        if(me.editTar == 'updown') {
            // 如果原先就是系统自动的话，提示出错
            if(me.labData.cpa == null) {
                hinter.innerHTML = fclab.cpa.config.hints[1022];
                return false;
            }
            var incre = ui.util.get('UporDownSelect').getValue()
                == 1 ? 1 : -1;
            incre = + incre; 
            userInput = baidu.g('UporDownInputEdit');
            val       = userInput.value;
            // 先判断是否为空
            if(/^\s*$/.test(val)) {
                userInput.focus();
                hinter.innerHTML = fclab.cpa.config.hints[10192];
                return false;
            }
        }
        else {
            // 判断输入是否为空
            if(/^\s*$/.test(val)) {
                userInput.focus();
                hinter.innerHTML = fclab.cpa.config.hints[1019];
                return false;
            }
        }
        // 判断输入是否为数字
        if(!/^[\d\.]+$/.test(val)) {
            userInput.focus();
            hinter.innerHTML = fclab.cpa.config.hints[10191];
            return false;
        }
        var v = + baidu.string.trim(val);
        // 判断输入是否大于0
        if(v <= 0) {
            userInput.focus();
            hinter.innerHTML = fclab.cpa.config.hints[10193];
            return false;
        }
        if(me.editTar == 'updown') {
            // 为了防止出现 12+21.23 = 33.230000000000004 的情况
            v = (+ me.labData.cpa + val * incre).toFixed(2);
        }
        // 是否大于0
        if(v <= 0) {
            userInput.focus();
            hinter.innerHTML = me.editTar == 'updown'
                ? fclab.cpa.config.hints[10081]
                : fclab.cpa.config.hints[1008];
            return false;
        }
        // 小于999.99
        if(v > 999.99) {
            userInput.focus();
            hinter.innerHTML = me.editTar == 'updown'
                ? fclab.cpa.config.hints[10091]
                : fclab.cpa.config.hints[1009];
            return false;
        }
        // 小数点超过两位
        var sv = v + '';
        if(~sv.indexOf('.')
            && (sv.substring(sv.indexOf('.')).length - 1) >= 3) {
            userInput.focus();
            hinter.innerHTML = me.editTar == 'updown'
                ? fclab.cpa.config.hints[10101]
                : fclab.cpa.config.hints[1010];
            return false;
        }
        // 是否不低于mincpa
        if(me.labData.mincpa > v) {
            userInput.focus();
            hinter.innerHTML = me.editTar == 'updown'
                ? fclab.cpa.config.hints[10111]
                : fclab.cpa.config.hints[1011];
            return true;
        }
        // 一切正常
        hint = ui.format(
                    fclab.cpa.config.hints[1006],
                    me.labData.suggestcpa
                ); 
        hinter.innerHTML = hint;
        return true;
    },

    // 绑定事件处理器
    bindEvent: function() {
        var me = this;
        // 取消
        ui.util.get('cpa-edit-cancel').onclick = function() {
            me.onclose();
        };
        var hinter = baidu.g('cpa-edit-bid-hinter');
        var updown = baidu.g('UporDownInputEdit');
        var userinput = baidu.g('cpaAverageBidUserInputEdit');
        // 点击“系统自动设置”
        ui.util.get('cpaAverageBidSysTypeEdit').onclick = function() {
            if(me.editType == 'single') {
                me.editTar = 'sys';
                hinter.innerHTML
                    = '';
                updown.disabled = true;
                userinput.disabled = true;

            }
            if(me.editType == 'multiple') {
                me.editTar = 'sys';
                hinter.innerHTML = '';
                updown.disabled = true;
                userinput.disabled = true;
            }
        };
        // 点击提高或者降低
        ui.util.get('UporDownEdit').onclick = function() {
            if(me.editType == 'single') {
                me.editTar = 'updown';
                hinter.innerHTML
                    = fclab.cpa.config.hints[1023];
                updown.disabled = false;
                userinput.disabled = true;
                updown.value != '' 
                    && me.singleValidate();
            }
            if(me.editType == 'multiple') {
                me.editTar = 'updown';
                hinter.innerHTML
                    = fclab.cpa.config.hints[1025];
                updown.disabled = false;
                userinput.disabled = true;
                // 还需要验证
                updown.value != '' 
                    && me.multipleValidate();
            }
        };
        // 点击自定义设置
        ui.util.get('cpaAverageBidUserTypeEdit').onclick = function() {
            if(me.editType == 'single') {
                me.editTar = 'user';
                hinter.innerHTML
                    = ui.format(
                            fclab.cpa.config.hints[1006],
                            me.labData.suggestcpa
                        ); 
                updown.disabled = true;
                userinput.disabled = false;
                userinput.value != '' 
                    && me.singleValidate();
            }
            if(me.editType == 'multiple') {
                me.editTar = 'user';
                hinter.innerHTML = '';
                updown.disabled = true;
                userinput.disabled = false;
                // 还需要验证
                userinput.value != '' 
                    && me.multipleValidate();
            }
        };
        // onblur
        baidu.event.on(
            'UporDownInputEdit',
            'blur',
            function() {
                if(me.editType == 'single') {
                    try {
                        me.singleValidate();
                    } catch(e) {}
                }
                if(me.editType == 'multiple') {
                    try {
                        me.multipleValidate();
                    } catch(e) {}
                }
            }
        );
        baidu.event.on(
            'UporDownInputEdit',
            'keyup',
            function() {
                if(me.editType == 'single') {
                    try {
                        me.singleValidate();
                    } catch(e) {}
                }
                if(me.editType == 'multiple') {
                    try {
                        me.multipleValidate();
                    } catch(e) {}
                }
            }
        );
        baidu.event.on(
            'cpaAverageBidUserInputEdit',
            'blur',
            function() {
                if(me.editType == 'single') {
                    try {
                        me.singleValidate();
                    } catch(e) {}
                }
                if(me.editType == 'multiple') {
                    try {
                        me.multipleValidate();
                    } catch(e) {}
                }
            }
        );
        baidu.event.on(
            'cpaAverageBidUserInputEdit',
            'keyup',
            function() {
                if(me.editType == 'single') {
                    try {
                        me.singleValidate();
                    } catch(e) {}
                }
                if(me.editType == 'multiple') {
                    try {
                        me.multipleValidate();
                    } catch(e) {}
                }
            }
        );
        ui.util.get('cpa-edit-ensure').onclick = function() {
            // 单独修改出价
            if(me.editType == 'single') {
                var value = '';
                if(me.singleValidate()) {
                    me.editTar == 'sys'
                        && (value = null);
                    me.editTar == 'user'
                        && (value = (+ baidu.string.trim(userinput.value)).toFixed(2));
                    if(me.editTar == 'updown') {
                        var oldv  = + me.labData.cpa;
                        var incre = ui.util.get('UporDownSelect').getValue() == 1 ? 1 : -1;
                        value  = oldv 
                            + incre * (+ baidu.string.trim(baidu.g('UporDownInputEdit').value)).toFixed(2);
                        value  = value.toFixed(2);
                    }
                    var params = {};
                    params[me.labData.labid] = value;
                    // 请求
                    fbs.cpa.editBid({
                        labid2cpa: params,
                        onSuccess: function(o) {
                            if(o.status == 200) {
                                me.onclose();
                                fclab.cpa.ToolsRefreshTable();
                            }
                        },
                        onFail: function(o) {
                            if(o.status == 300 || o.status == 400) {
                                ui.Dialog.alert({
                                    title: '修改出价出错',
                                    content: '修改出价出错，请稍后再试！',
                                    onok: function(){
                                        me.onclose(0);
                                    }
                                });
                            }
                        }
                    });
                }
            }
            // 批量修改出价
            if(me.editType == 'multiple') {
                var params = {};
                if(me.multipleValidate()) {
                    if(me.editTar == 'sys') {
                        for(var i = 0, len = fclab.cpa.ToolsCache.CHOSEN.length; i < len; i ++) {
                            var thisItem   = fclab.cpa.ToolsCache.IDMAP[fclab.cpa.ToolsCache.CHOSEN[i]];
                            params[thisItem.labid] = null;
                        }
                    }
                    if(me.editTar == 'user') {
                        var value = (+ baidu.string.trim(userinput.value)).toFixed(2);
                        for(var i = 0, len = fclab.cpa.ToolsCache.CHOSEN.length; i < len; i ++) {
                            var thisItem   = fclab.cpa.ToolsCache.IDMAP[fclab.cpa.ToolsCache.CHOSEN[i]];
                            params[thisItem.labid] = value;
                        }
                    }
                    if(me.editTar == 'updown') {
                        var incre = ui.util.get('UporDownSelect').getValue() == 1 ? 1 : -1;
                        var incva = (+ baidu.string.trim(baidu.g('UporDownInputEdit').value)).toFixed(2);
                        for(var i = 0, len = fclab.cpa.ToolsCache.CHOSEN.length; i < len; i ++) {
                            var thisItem   = fclab.cpa.ToolsCache.IDMAP[fclab.cpa.ToolsCache.CHOSEN[i]];
                            if(thisItem.cpa == null) // 系统自定义的略过 
                                continue;
                            params[thisItem.labid] = (thisItem.cpa + incre * incva).toFixed(2);
                        }
                    }
                    // 请求
                    fbs.cpa.editBid({
                        labid2cpa: params,
                        onSuccess: function(o) {
                            if(o.status == 200) {
                                me.onclose();
                                fclab.cpa.ToolsRefreshTable();
                            }
                        },
                        onFail: function(o) {
                            if(o.status == 300 || o.status == 400) {
                                ui.Dialog.alert({
                                    title: '修改出价出错',
                                    content: '修改出价出错，请稍后再试！',
                                    onok: function(){
                                        me.onclose(0);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        };
    }
});

// 历史删除记录
fclab.cpa.delHistory = new er.Action({
    VIEW: 'fclabCpaDelHistory',

    UI_PROP_MAP: {
        // 关闭按钮
        'cpa-del-close': {
            type: 'Button',
            content: '关闭'
        },
        // 分页组件
        'cpa-del-pager': {
            type: 'Page',
            total: 1,
            page: 1
        },
        // 表格
        'cpa-del-table' : {
            type : 'Table',
            sortable : 'false',
            filterable : 'false',
            orderBy : '',
            order : '',
            noDataHtml : '-',
            dragable : 'false',
            colViewCounter : 'all',
            fields: '*cpa-del-table-fields'
            // datasource : ''
        }
    },

    CONTEXT_INITER_MAP: {
        'cpa-del-table-fields': function(callback) {
            this.setContext('cpa-del-table-fields',
                fclab.cpa.config.cpaDelTableFields);
            callback();
        }
    },

    onafterrender: function() {
        var me = this,
            controlMap = me._controlMap;
        // 关闭按钮
        controlMap['cpa-del-close'].onclick = function() {
            me.onclose();
        };
        // 分页
        controlMap['cpa-del-pager'].onselect = function(page) {
            me.renderTable(page);
        };
        // 第一次请求
        me.renderTable();
    },

    // 生成表格数据
    renderTable: function(page) {
        var me = this,
            controlMap = me._controlMap;
        page = page == undefined ? 0 : (page - 1);
        fbs.cpa.getCpaHistory({
            pageno: page,
            limit: 10,
            onSuccess: function(o) {
                if(o.status == 200) {
                    var target = baidu.dom.g('cpa-del-table-container');
                    // 数据为空
                    if(!o.data 
                        || o.data.total == 0 
                        || o.data.cpalist.length == 0) {
                        target
                            .innerHTML = '<span class="cpa-del-table-empty">没有删除记录！</span>';
                        target
                            .style.borderTop = 'none';
                        target
                            .style.visibility = 'visible';
                        return;
                    }
                    target
                        .style.visibility = 'visible';
                    // 渲染数据
                    controlMap['cpa-del-table']
                        .datasource = o.data.cpalist;
                    controlMap['cpa-del-table']
                        .render();
                    // 分页
                    controlMap['cpa-del-pager']
                        .total = Math.ceil(o.data.total / 10);
                    controlMap['cpa-del-pager']
                        .page  = page + 1;
                    controlMap['cpa-del-pager'].render();
                }
            }
        });
    }
});