/**
 * @file 添加cpa，逻辑文件
 * @author guanwei01@baidu.com
 */

fclab = fclab || {};
fclab.cpa = fclab.cpa || {};

// 定义action
fclab.cpa.addCpaAction = new er.Action({
    VIEW: 'fclabAddCpa',
    
    // 为了处理“其它”情况
    othersHandler: function() {
        var me = this;
        var others = [];
        for(var key in me.transData) {
            key != 1
                && key != 2
                && key != 4
                && key != 16
                && others.push(key);
        }
        // 继续处理
        for(var i = 0, len = others.length; i < len; i ++) {
            var thisOther  = others[i];
            if(me.transData[thisOther]) {
                for(var j = 0, lenj = me.transData[thisOther].length; j < lenj; j ++) {
                    // 写入标志
                    me.transData[thisOther][j].fake = thisOther;
                    // 更改id（防止重复）
                    me.transData[thisOther][j].planid 
                        = '_' + me.transData[thisOther][j].planid;
                    // 归入16
                    me.transData[16] || (
                        me.transData[16] = []
                    );
                    me.transData[16].push(me.transData[thisOther][j]);
                }
                // 删除原先
                delete me.transData[thisOther];
            }
        }
    },

    onafterrender: function(){
        var me = this;
        // 请求获取全部的计划数据
        fbs.cpa.getPlans({
            onSuccess: function(response){
                // 存储数据
                me.transData  = response.data;
                // 数据标识（是否已选）
                me.transDataSeleMap = {
                    1: {},
                    2: {},
                    4: {},
                    16: {}
                };
                // 数据的特殊处理
                me.othersHandler();
                // console.log(me.transData);
                // 初始化选择转化类型的控件
                me.transTyper = new fclab.chosenBar({
                    container: "trans-type-container",
                    itemset: fclab.cpa.config.transType,
                    value: '2',
                    width: 80,
                    type: 1,
                    onchange: function(v) {
                        me.transTypeChange.call(me, v);
                        me.setBider.reset();
                        // me.setBider.validate();
                    }
                });
                // 默认选中“网页转化”
                me.transTypeChange.call(me, '2');
                // 初始化设置转化出价的组件
                me.setBider || (me.setBider = me.setBid.call(me, {
                    // usui
                    sys: 'cpaAverageBidSysType',
                    user: 'cpaAverageBidUserType',
                    // dom
                    input: 'cpaAverageBidUserInput',
                    // hinter dom
                    hinter: 'cpa-average-bid-hinter'
                }));
                // 绑定相关事件
                me.bindEvent();
            },
            onFail: function(){
                ajaxFailDialog();
            }
        });
        // 记得初始化小问号
        var bubbleSet = baidu.q("ui_bubble", "add-cpa-container", "span");
        ui.Bubble.init(bubbleSet);
    },
    
    onentercomplete: function(){
        // Dialog二次定位标识
        nirvana.subaction.isDone = true;
    },

    // 执行请求
    addCpa: function(force) {
        var me = this;
        fbs.cpa.addCpa({
            // userid会始终在外面
            // userid: nirvana.env.USER_ID,
            // type: + me.transTyper.getValue(),
            // planids: me.transObjer.get().ids,
            planids: me.transObjer.getPlans.call(me),
            cpa: me.setBider.get(),
            ab: (ui.util.get('cpaUseXiao').getChecked() ? 0 : 1),
            force: force,
            onSuccess: function(o) {
                me.onclose();
                // nexttodo，从这里调用外围的函数，tab切换，table的刷新
                fclab.cpa.Tools();
            },
            onFail: function(o) {
                if(o.status == 400) {
                    // console.log(fclab.cpa.config.hints[1018], o.errorCode.message, ui.format(
                    //         fclab.cpa.config.hints[1018],
                    //         o.errorCode.message
                    //     ), o);
                    // console.log(fclab.cpa.config.hints[1018], o);
                    ui.Dialog.confirm({
                        title: '确认',
                        content: ui.format(
                            fclab.cpa.config.hints[1018],
                            o.errorCode.message
                        ),
                        onok: function(){
                            me.addCpa(0);
                        }
                    });
                }
            }
        });
    },

    // 绑定相关事件
    bindEvent: function() {
        var me = this;
        var ensure = ui.util.get('cpa-ensure');
        var cancel = ui.util.get('cpa-cancel');
        // 取消
        cancel.onclick = function() {
            me.onclose();
        };
        // 提交
        ensure.onclick = function() {
            if(me.transObjer.validate()
                && me.setBider.validate()) {
                // 验证成功
                me.addCpa(1);
            }
        };
    },

    // 设置出价
    setBid: function(params) {
        var me = this;
        var sysRadio  = ui.util.get(params.sys);
        var userRadio = ui.util.get(params.user);
        var userInput = baidu.dom.g(params.input);
        var hinter     = baidu.dom.g(params.hinter);
        var state     = 'sys';
        // 绑定事件
        sysRadio.onclick = function() {
            hinter.style.paddingLeft = '0px';
            hinter.innerHTML = fclab.cpa.config.hints[1005];
            // 清空输入框
            userInput.value    = '';
            userInput.disabled = true;
            state              = 'sys';
        };
        userRadio.onclick = function() {
            hinter.style.paddingLeft = baidu.browser.ie == 7
                ? '117px' : '110px';
            var planInfo  = me.transObjer.get(), hint;
            planInfo.total == 1
                && (hint = ui.format(
                        fclab.cpa.config.hints[1006],
                        planInfo.info.cpa
                    ));
            planInfo.total == 0
                && (hint = fclab.cpa.config.hints[1020]);
            planInfo.total > 1
                && (hint = fclab.cpa.config.hints[1007]);
            hinter.innerHTML = hint;
            me.transObjer.get().total >= 1
                && (userInput.disabled = false);
            me.transObjer.get().total == 0
                && (userInput.disabled = true)
                && (userInput.value = '');
            state            = 'user';
        };
        // 验证器
        function validate() {
            if(state == 'sys') {
                return true;
            }
            // 是否选择
            var planInfo  = me.transObjer.get(), hint;
            if(planInfo.total == 0) {
                hinter.innerHTML = fclab.cpa.config.hints[1020];
                return false;
            }
            // 判断是否为空
            if(/^\s*$/.test(userInput.value)) {
                userInput.focus();
                hinter.innerHTML = fclab.cpa.config.hints[1019];
                return false;
            }
            // 判断输入是否为数字
            if(!/^[\d\.]+$/.test(userInput.value)) {
                userInput.focus();
                hinter.innerHTML = fclab.cpa.config.hints[10191];
                return false;
            }
            var v = + baidu.string.trim(userInput.value);
            // 是否大于0
            if(v <= 0) {
                userInput.focus();
                hinter.innerHTML = fclab.cpa.config.hints[1008];
                return false;
            }
            // 小于1000
            if(v > 999.99) {
                userInput.focus();
                hinter.innerHTML = fclab.cpa.config.hints[1009];
                return false;
            }
            // 小数点超过两位
            var sv = v + '';
            if(~sv.indexOf('.')
                && (sv.substring(sv.indexOf('.')).length - 1) >= 3) {
                userInput.focus();
                hinter.innerHTML = fclab.cpa.config.hints[1010];
                return false;
            }
            // 是否不低于mincpa
            if(me.transObjer.get().total == 1
                && me.transObjer.get().info.mincpa > v) {
                userInput.focus();
                hinter.innerHTML = fclab.cpa.config.hints[1011];
                // 不低于mincpa不是一个限制条件
                return true;
            }
            // 一切正常
            planInfo.total == 1
                && (hint = ui.format(
                        fclab.cpa.config.hints[1006],
                        planInfo.info.cpa
                    )); 
            planInfo.total > 1
                && (hint = fclab.cpa.config.hints[1007]);
            hinter.innerHTML = hint;
            return true;
        };
        // 事件处理
        baidu.event.on(
            userInput,
            'blur',
            function(e) {
                validate();
            }
        );
        baidu.event.on(
            userInput,
            'keyup',
            function(e) {
                validate();
            }
        );

        return {
            reset: function() {
                sysRadio.setChecked(1);
                sysRadio.onclick();
            },
            // 特殊暴露
            outerCall: function() {
                state == 'user'
                    && userRadio.onclick();
            },
            // 验证器
            validate: validate,
            // 取值器
            get: function() {
                return state == 'sys'
                    ? null
                    : (+ baidu.string.trim(userInput.value));
            }
        };
    },

    // 选择转化类型发生变化
    transTypeChange: function(v) {
        var me = this;
        var listData = me.transData[v];
        // 初始化选择计划的组件
        me.transObjer || (me.transObjer = me.transObj({
            container: 'cpa-plans-container',
            hinter: 'cpa-plans-nums',
            onSelect: function(v, action) {
                me.setBider.outerCall();
            }
        }));
        // 设置判断map
        me.transObjer.setMap(me.transDataSeleMap[v], v);
        // 渲染
        me.transObjer.set(listData);
        // window.transObjer = me.transObjer;
    },

    // 选择转化对象的简易组件
    transObj: function(params) {
        // 包含容器id
        var container = baidu.dom.g(params.container);
        // 错误提示容器id
        var hinter    = baidu.dom.g(params.hinter);
        // 相关模板
        var templates = {
            // {0}用来填充li元素
            ul: '<ul id="cpa-plans-ul" class="cpa-plans-ul">{0}</ul>',
            // {0}是计划名称（需要做转义处理）
            // {1}是add或者del（add是为没有添加时，del是已添加）
            // {2}是planid
            // {3}是“添加”或者“已添加”
            li: '<li>' +
                    '<span class="cpa-li-title">{0}</span>' +
                    '<span cpa-action="{1}" cpa-id="{2}" class="cpa-li-tail">{3}</span>' +
                '</li>',
            emptyouter: '<div class="cpa-plans-empty-container">{0}</div>',
            // {0} 提示头
            // {1} 第一句提示
            // {2} 第二句提示
            emptyp: '<p>{0}</p><p>1.{1}</p><p>2.{2}</p>'
        };
        var map, renderData, renderDataMap = {}, selected, transType;
        // 设置
        function set(data) {
            // 设置已选
            selected   = [];
            // 检查是否为空
            if(data == undefined || data.length == 0) {
                container.innerHTML = ui.format(
                    templates.emptyouter,
                    ui.format(
                        templates.emptyp,
                        fclab.cpa.config.hints[1003],
                        fclab.cpa.config.hints[transType],
                        fclab.cpa.config.hints[1004]
                    )
                );
                refreshTotal();
                return;
            }
            renderData = data;
            // 设置渲染数据map
            for(var k = 0, lenk = renderData.length; k < lenk; k ++) {
                renderDataMap[renderData[k].planid] = renderData[k];
            }
            var t = '';
            for(var i = 0, len = data.length; i < len; i ++) {
                // 放入已选
                map && !!map[data[i].planid] && selected.push(data[i].planid);
                t += ui.format(
                    templates.li,
                    baidu.string.encodeHTML(data[i].planname),
                    map && !!map[data[i].planid] ? 'del' : 'add',
                    data[i].planid,
                    map && !!map[data[i].planid] ? fclab.cpa.config.hints[102] : fclab.cpa.config.hints[100]
                );
            }
            // 填充
            container.innerHTML = ui.format(
                templates.ul,
                t
            );
            refreshTotal();
        };
        // 设置映射
        function setMap(mapOuter, v) {
            map = mapOuter;
            v != undefined && (transType = v);
        };
        // 更新总共选择了几项
        function refreshTotal() {
            var total = 0;
            for(var key in map) {
                total ++;
            }
            hinter.innerHTML = ui.format(
                fclab.cpa.config.hints[1016],
                total
            );
        };
        // 添加
        function add(id) {
            var target = this;
            // 设置映射
            map[id] = true;
            // 修改标志
            target.setAttribute('cpa-action', 'del');
            // 修改文字
            target.innerHTML = fclab.cpa.config.hints[102];
            // 放入已选
            selected.push(id);
            // 刷新总共多少项
            refreshTotal();
        };
        // 删除
        function del(id) {
            var target = this;
            // 删除映射
            delete map[id];
            // 修改标志
            target.setAttribute('cpa-action', 'add');
            // 修改文字
            target.innerHTML = fclab.cpa.config.hints[100];
            // 删除已选
            (function() {
                var t = [];
                for(var i = 0, len = selected.length; i < len; i ++) {
                    selected[i] != id 
                        && t.push(selected[i]);
                }
                // 覆盖原先的selected
                selected = t;
            })();
            // 刷新总共多少项
            refreshTotal();
        };

        // 验证器
        function validate() {
            var total = 0;
            for(var key in map) {
                total ++;
            }
            if(total == 0) {
                hinter.innerHTML = fclab.cpa.config.hints[1017];
                return false;
            }
            refreshTotal();
            return true;
        };

        // 事件处理
        function clickHandler(e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            var action;
            if(target.tagName.toLowerCase() == 'span' 
                && (action = target.getAttribute('cpa-action'))) {
                var planid = target.getAttribute('cpa-id');
                switch(action) {
                    case 'add':
                        add.call(target, planid);
                        break;
                    case 'del':
                        del.call(target, planid);
                        break;
                }
                // 回调
                params.onSelect
                    && params.onSelect(planid, action);
            }
        };
        function mouseoveroutHandler(e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            var action;
            var hinter = e.type == 'mouseover' 
                ? fclab.cpa.config.hints[101]
                : fclab.cpa.config.hints[102];
            if(target.tagName.toLowerCase() == 'li') {
                var targetSpan = target.getElementsByTagName('span')[1];
                targetSpan.getAttribute('cpa-action') == 'del'
                    && (targetSpan.innerHTML = hinter);
            }
            target.tagName.toLowerCase() == 'span'
                && target.getAttribute('cpa-action') == 'del'
                && (target.innerHTML = hinter);
        };

        // 绑定事件
        baidu.event.on(
            container,
            'click',
            clickHandler
        );
        baidu.event.on(
            container,
            'mouseover',
            mouseoveroutHandler
        );
        baidu.event.on(
            container,
            'mouseout',
            mouseoveroutHandler
        );

        // 暴露
        return {
            set: set,
            // 设置相应的map映射
            setMap: setMap,
            // 获取值
            get: function() {
                return {
                    // 已选列表
                    ids: selected,
                    // 已选数量
                    total: selected.length,
                    // 选择了一个的时候
                    info: selected.length == 1 ? renderDataMap[selected[0]] : null
                };
            },
            // 获取参数值
            getPlans: function() {
                // 特殊绑定
                var me  = this;
                var selectedType = + me.transTyper.getValue();
                var obj = {};
                // 选择前三个不包括其他
                if(selectedType <= 4) {
                    for(var i = 0, len = selected.length; i < len; i ++) {
                        selected[i] = + selected[i];
                    }
                    obj[selectedType] = selected;
                    return obj;
                }
                // 其他
                for(var i = 0, len = selected.length; i < len; i ++) {
                    var thisId = selected[i];
                    // 特殊id
                    if(renderDataMap[thisId].fake != undefined) {
                        obj[renderDataMap[thisId].fake] || (
                            obj[renderDataMap[thisId].fake] = []
                        );
                        obj[renderDataMap[thisId].fake].push(
                            + (thisId.substring(1))
                        );
                    }
                    else {
                        obj[16] || (obj[16] = []);
                        obj[16].push(+ thisId);
                    }
                }
                return obj;
            },
            // 验证器
            validate: validate
        };
    }
});