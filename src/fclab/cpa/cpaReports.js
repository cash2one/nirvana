/**
 * @file cpa工具报表
 * @author guanwei01@baidu.com
 */

fclab = fclab || {};
fclab.cpa = fclab.cpa || {};

fclab.cpa.Reports = function() {
    /**
     * 各种组件定义在这里
     */
    // 报告控制器
    var controler = function() {
        // 类型选择器
        var planreports, xllreports;
        // 日历选择器
        var dater;
        // 选择时间单位
        var dateUniter, firstDay;

        // 对比日历选择器
        var dateCompare, compare;

        // 查询按钮
        var reportSubmit;

        // 类型
        var reportType = 1; // 1无对比；2有对比；3小流量
        // 相对时间（初始化为最近7天）
        var relativeType = 15; //5/6/10/15 - 本月/上月/上周/最近7天
        // 为-1的话，即为绝对日期
        
        // 是否已经点击“查询”
        var hasRendered  = false;

        // 重设初始值
        var reset = function() {
            reportType = 1;
            relativeType = 15;
            hasRendered  = false;
        };

        // 当前值、最近7天
        var getDefaultDate = function () {
            var now   = new Date(nirvana.env.SERVER_TIME * 1000);
            var begin = new Date(now.getTime()),
                end = new Date(now.getTime());
            
            end.setDate(end.getDate() - 1);
            begin.setDate(begin.getDate() - 7);
            begin.setHours(0,0,0,0);
            end.setHours(0,0,0,0);
            return {
                begin: begin,
                end: end
            };
        };
        // 日历可选日期、2013-01-01至昨天
        var getAvailableRange = function() {
            var now = new Date(nirvana.env.SERVER_TIME * 1000);
            var yesterday = new Date(now.getTime());
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0,0,0,0);
            return {
                begin: baidu.date.parse('2013-01-01'),
                end: yesterday
            };
        };

        // 为了便于计算日期
        var getMiniDate = {
            // 最近七天
            sevday: getDefaultDate(),
            // 上周
            lastWeek: function () {
                var now = new Date(nirvana.env.SERVER_TIME * 1000),
                    begin = new Date(now.getTime()),
                    end = new Date(now.getTime()),
                    _wd = 1; //周一为第一天;
                
                if (begin.getDay() < _wd%7) {
                    begin.setDate(begin.getDate() - 14 + _wd - begin.getDay());
                } else {
                    begin.setDate(begin.getDate() - 7 - begin.getDay() + _wd % 7);
                }               
                begin.setHours(0,0,0,0);        
                end.setFullYear(begin.getFullYear(), begin.getMonth(), begin.getDate() + 6);
                end.setHours(0,0,0,0);
                                 
                return {
                    begin:begin,
                    end:end
                };
            }(),
            // 本月
            thisMonth: function () {
                var now = new Date(nirvana.env.SERVER_TIME * 1000),
                    begin = new Date(now.getTime()),
                    end = new Date(now.getTime());
                begin.setDate(1);
                begin.setHours(0, 0, 0, 0);
                end.setDate(end.getDate() - 1);
                end.setHours(0, 0, 0, 0);
                return {
                    begin:begin,
                    end:end
                };
            }(),
            // 上个月
            lastMonth: function () {
                var now = new Date(nirvana.env.SERVER_TIME * 1000),
                    begin = new Date(now.getFullYear(), now.getMonth() - 1, 1),
                    end = new Date(now.getFullYear(), now.getMonth(), 1);
                end.setDate(end.getDate() - 1);
                begin.setHours(0,0,0,0);
                end.setHours(0,0,0,0);
                return {
                    begin:begin,
                    end:end
                };
            }(),
            // 是否两个日期相等
            equal: function (date1, date2) {
                //所有时间，有时传入今天的时间，有时传入空字符串，需统一转化后进行比较
                date1 = date1.toString() == (new Date(nirvana.env.SERVER_TIME * 1000)).toString() ? "" : date1;
                date2 = date2.toString() == (new Date(nirvana.env.SERVER_TIME * 1000)).toString() ? "" : date2;
                if (date2 != "" && date1 != "") {
                    if (date1.getFullYear() == date2.getFullYear() &&
                    date1.getMonth() == date2.getMonth() &&
                    date1.getDate() == date2.getDate()) {
                        return true;
                    }
                }else{
                    if(date1 == "" && date2 == ""){
                        return true;
                    }
                }
                return false;
            }
        };

        // 初始化
        function init() {
            reset();
            // 初始化类型选择
            reportTypeIniter();
            // 初始化日历
            dateIniter();
            // 初始化时间单位选择
            dateUnitIniter();
            // 初始化对比选择器
            compareIniter();
            // 查询按钮初始化
            submitIniter();
        };

        // 获取日差
        function getDayGap() {
            var dateGap = dater.getValue().end 
                - dater.getValue().begin; // 毫秒数
            var dayGap  = (dateGap / 1000 / 3600 / 24) + 1; // 天数加1
            return {
                msec: dateGap,
                day: dayGap
            };
        };

        function submitIniter() {
            reportSubmit && reportSubmit.dispose();
            reportSubmit = ui.util.create(
                'Button', 
                {
                    id: 'cpa-reports-submit'
                }, 
                baidu.dom.g('cpa-reports-submit')
            );
            reportSubmit.onclick = reportSubmitClick;
        };

        function compareIniter() {
            compare && compare.dispose();
            dateCompare && dateCompare.dispose();
            compare = ui.util.create(
                'CheckBox', 
                {
                    id: 'cpa-compare'
                }, 
                baidu.dom.g('cpa-compare')
            );
            // 这里的日期控制细节比较多，先用多选日历控件代替单选日历控件
            dateCompare = ui.util.create(
                'MultiCalendar', 
                {
                    id: 'cpa-compare-date',
                    show: 'form',
                    value: getCompareDate(true),
                    availableRange: getCompareRange(true),
                    miniOption: [5]
                }, 
                baidu.dom.g('cpa-compare-date')
            );
            multi2single();
            // 先禁用
            dateCompare.disable(1);
            // 起几天
            baidu.g('cpa-compare-all').innerHTML
                = getDayGap().day;
            // 比较范围复选框
            compare.onclick = compareClick;
        };

        function compareClick() {
            if(compare.getChecked()) {
                dateCompare.disable(0);
                baidu.g('cpa-compare-start')
                    .className = 'cpa-compare-start-black';
                baidu.g('cpa-firstday-container')
                    .className = 'cpa-firstday-container-none';
                // 修改时间单位
                dateUniter.setValue(8);
                dateUniter.disable(1);
                reportType = 2;
            }
            else {
                dateCompare.disable(1);
                dateUniter.disable(0);
                baidu.g('cpa-compare-start')
                    .className = 'cpa-compare-start';
                reportType = 1;
            }
        };

        // 获取比较范围
        function getCompareRange(flag) {
            var date = dater.getValue().begin;
            var gap  = 3600 * 1000;
            var value = new Date(date - gap);
            // 如果value小于 2013-01-01
            if(value <= baidu.date.parse('2013-01-01'))
                value = baidu.date.parse('2013-01-01');
            if(flag) 
                return {
                    begin: baidu.date.parse('2013-01-01'),
                    end: value
                };
        };

        // 获取初始情况比较日历框中的日期
        function getCompareDate(flag) {
            var date = dater.getValue().begin;
            var gap  = getDayGap().msec + 3600 * 1000;
            var value = new Date(date - gap);
            // 如果value小于 2013-01-01
            if(value <= baidu.date.parse('2013-01-01'))
                value = baidu.date.parse('2013-01-01');
            if(flag) 
                return {
                    begin: value,
                    end: value
                };
        };

        // 多选日历变单选
        function multi2single() {
            // 隐藏快捷键
            baidu.g('ctrlmmcalcpa-compare-datemmcal')
                .style
                .display = 'none';
            // 隐藏按钮
            baidu.g('ctrlmcalcpa-compare-datefoot')
                .style
                .display = 'none';
            baidu.q('ui_mcal_end', 'ctrlmcalcpa-compare-datelayer')[0]
                .style
                .display = 'none';
            baidu.g('ctrlmcalcpa-compare-datelayer')
                .style
                .width = '192px';
            // 修改文字
            var titles = baidu.q('ui_mcal_side_title', 
                'ctrlmcalcpa-compare-datelayer');
            titles[0].innerHTML = titles[1].innerHTML
                = '选择时间';
            // 单选事件
            baidu.event.on(
                'ctrlmcalcpa-compare-datelayer',
                'click',
                function(e) {
                    e = e || window.event;
                    var target = e.target || e.srcElement;
                    if(target.tagName.toLowerCase() == 'td'
                        && baidu.dom.hasClass(target, 'ui_month_item'))
                        multi2singleclick(target);
                }
            );
            // 修改已经显示的文字
            var nowdate 
                = baidu.dom.g('ctrlmcalcpa-compare-dateform');
            nowdate.innerHTML = nowdate.innerHTML.substr(0, 10);
            // 修改文字生成函数
            dateCompare.getValueText = function () {
                var value = this.getValue(),
                    begin = value.begin,
                    end   = value.end,
                    format    = this.dateFormat,
                    formatter = baidu.date.format;
                if(this.isAllTime){
                    value = {
                        begin:"",
                        end:""
                    };
                }
                var miniOpt = nirvana.util.dateOptionToDateText(value);
                if(miniOpt){
                    return miniOpt;
                }
                if (begin && end) {
                    return formatter(begin, format)
                            /*+ " 至 " 
                            + formatter(end, format)*/;
                }
            };
        };

        // 单击事件
        function multi2singleclick(target) {
            var year = + target.getAttribute('year');
            var month = + target.getAttribute('month') + 1;
            var date  = + target.getAttribute('date');
            // 设置
            var value 
                = baidu.date.parse(year + '-' + month + '-' + date);
            dateCompare.hideLayer();
            dateCompare.setValue({
                begin: value,
                end: value
            });
        };

        // 时间单位选择
        function dateUnitIniter() {
            dateUniter && dateUniter.dispose();
            firstDay && firstDay.dispose();
            dateUniter = ui.util.create(
                'Select', 
                {
                    id: 'cpa-date-unit',
                    width: 60,
                    datasource: fclab.cpa.config.dateUnit,
                    value: 8
                }, 
                baidu.dom.g('cpa-date-unit')
            );
            firstDay = ui.util.create(
                'Select', 
                {
                    id: 'cpa-date-firstday',
                    width: 60,
                    datasource: fclab.cpa.config.weekUnit,
                    value: 1
                }, 
                baidu.dom.g('cpa-date-firstday')
            );
            // 先行隐藏“第一天”
            baidu.g('cpa-firstday-container')
                .className = 'cpa-firstday-container-none';
            // 选择时间的控制器
            dateUniter.onselect = dateUniterOnselect;
        };

        // 选择时间的控制器
        function dateUniterOnselect(v) {
            v == 4
                && (baidu.g('cpa-firstday-container')
                    .className = 'cpa-firstday-container');
            v != 4 
                && (baidu.g('cpa-firstday-container')
                    .className = 'cpa-firstday-container-none');
        };

        // 初始化类型选择
        function reportTypeIniter() {
            planreports && planreports.dispose();
            xllreports && xllreports.dispose();
            // 创建元素
            planreports = ui.util.create(
                'Radio', 
                {
                    id: 'cpa-plan-reports'
                }, 
                baidu.dom.g('cpa-plan-reports')
            );
            xllreports = ui.util.create(
                'Radio', 
                {
                    id: 'cpa-xll-reports'
                }, 
                baidu.dom.g('cpa-xll-reports')
            );
            // 计划报告
            planreports.onclick = function() {
                baidu.dom.g('cpa-plan-reports-container')
                    .style.display = 'block';
                baidu.dom.g('cpa-reports-panel')
                    .className = 'cpa-reports-panel cpa-reports-panel-fix7';
                // baidu.g('cpa-plan-empty-tips')
                //     .style
                //     .display = 'none';
                reportType = compare.getChecked() ? 2 : 1;
                // 隐藏小流量提示
                xllTips.hide();
                tabler.resetPage();
            };
            // 小流量报告
            xllreports.onclick = function() {
                baidu.dom.g('cpa-plan-reports-container')
                    .style.display = 'none';
                baidu.dom.g('cpa-reports-panel')
                    .className = 'cpa-reports-panel';
                // baidu.g('cpa-plan-empty-tips')
                //     .style
                //     .display = 'none';
                reportType = 3;
                hasRendered 
                    ? xllTips.hide() 
                    : xllTips.show();
                tabler.resetPage();
            };
        };

        function dateIniter() {
            dater && dater.dispose();
            // 复制特殊的配置项
            var optionList = baidu.object.clone(
                nirvana.config.dateOption
            );
            // 修改第三个
            optionList[3] = {
                text:'本月',
                optionIdx:3,
                getValue: function () {
                    var now = this.now,
                        begin = new Date(this.now.getTime()),
                        end = new Date(this.now.getTime());
                    begin.setDate(1);
                    begin.setHours(0,0,0,0);
                    end.setDate(end.getDate() - 1);
                    end.setHours(0,0,0,0);
                    return {
                        begin:begin,
                        end:end
                    };
                }
            };
            dater = ui.util.create(
                'MultiCalendar', 
                {
                    id: 'cpa-reports-date',
                    show: 'form',
                    // 当前选中最近7天
                    value: getDefaultDate(),
                    // 可选日期
                    availableRange: getAvailableRange(),
                    // 快捷选项（最近7天、上周、本月、上个月）
                    miniOption: [1, 2, 3, 4],
                    miniDateOption: optionList
                }, 
                baidu.dom.g('cpa-reports-date')
            );
            dater.onselect = daterOnselect;
            dater.onminiselect = daterOnminiselect;
        };

        // 快捷选择
        function daterOnminiselect(v) {
            v == 1 && (relativeType = 15);
            v == 2 && (relativeType = 10);
            v == 3 && (relativeType = 5);
            v == 4 && (relativeType = 6);
        };

        // 选择日期
        function daterOnselect() {
            // 起多少天
            baidu.g('cpa-compare-all').innerHTML
                = getDayGap().day;
            // 更新比较选择器的可选范围
            dateCompare.setAvailableRange(
                getCompareRange(true)
            );
            // 更新比较选择器的值
            dateCompare.setValue(
                getCompareDate(true)
            );
            // 判断相对还是绝对
            judgeState();
        };

        function judgeState() {
            var now = dater.getValue();
            // 判断（最近7天、上周、本月、上个月）
            // 最近7天
            if(getMiniDate.equal(getMiniDate.sevday.begin, now.begin) 
                && getMiniDate.equal(getMiniDate.sevday.end, now.end)) {
                relativeType = 15;
                return;
            }
            // 上周
            if(getMiniDate.equal(getMiniDate.lastWeek.begin, now.begin) 
                && getMiniDate.equal(getMiniDate.lastWeek.end, now.end)) {
                relativeType = 10;
                return;
            }
            // 本月
            if(getMiniDate.equal(getMiniDate.thisMonth.begin, now.begin) 
                && getMiniDate.equal(getMiniDate.thisMonth.end, now.end)) {
                relativeType = 5;
                return;
            }
            // 上个月
            if(getMiniDate.equal(getMiniDate.lastMonth.begin, now.begin) 
                && getMiniDate.equal(getMiniDate.lastMonth.end, now.end)) {
                relativeType = 6;
                return;
            }
            // 普通情况的话就是-1
            relativeType = -1;
        };

        // 获取搜索配置
        function get() {
            var date = dater.getValue();
            var compare = dateCompare.getValue();
            return {
                reporttype: + reportType,
                startime: baidu.date.format(date.begin, 'yyyy-MM-dd') + '',
                endtime: baidu.date.format(date.end, 'yyyy-MM-dd') + '',
                isrelativetime: + (relativeType == -1 ? 0 : 1),
                relativetime: + relativeType,
                timedim: + dateUniter.getValue(),
                firstday: + firstDay.getValue(),
                // 下面的参数是有对比时间段的时候
                ostartime: baidu.date.format(compare.begin, 'yyyy-MM-dd') + '',
                oisrelativetime: 1, // 始终是相对（后端在无对比的时候会忽略该值）
                orelativetime: + getDayGap().day
            };
        };

        // 点击查询
        function reportSubmitClick() {
            var params = get();
            // 设置报告头信息
            reportHeader.set(params);
            // 设置请求回调函数
            params.onSuccess = xhrCall;
            // 根据类型辨别请求函数
            params.reporttype <= 2
                && fbs.cpa.getCpaPlanReports(params);
            // 小流量
            params.reporttype == 3
                && getXllData();
            // 已经渲染的标志
            hasRendered = true;
            // 关闭提示
            xllTips.hide();
        };

        // 请求小流量
        function getXllData(inx, isPager) {
            // 起始index
            var index = inx == undefined ? 0 : inx;
            // 构造请求参数
            var params = {
                reporttype: 3, // 就是3
                timedim: 8, // 默认(汇总)
                start: index, // 起始index（变化）
                step: 5 // 默认就是5
            };
            // 设置回调函数
            // params.onSuccess = xhrCall;
            params.onSuccess = function(o) {
                xhrCall(o, isPager);
            };
            fbs.cpa.getCpaXllReports(params);
        };

        // 请求完成的回调函数
        function xhrCall(o, isPager) {
            if(o.status == 200) {
                var params = get();
                // 设置tab数据
                if(!isPager) 
                    reportsTab.set(o.sum, params);
                // 显示下载按钮
                downloader.show();
                // 设置表格渲染
                var sum = (params.reporttype == 3 || isPager)
                    ? (+ o.sum.abs) 
                    : undefined;
                // 设置每页显示多少项
                (params.reporttype == 3 
                    || isPager 
                    || params.reporttype == 2)
                        ? tabler.setPerPage(5)
                        : tabler.setPerPage(10);
                tabler.render(o.data, params, sum, isPager);
            }
        };

        // 获取是否渲染的状态
        function getState() {
            return hasRendered;
        };

        // 暴露接口
        return {
            init: init,
            // 获取搜索配置
            get: get,
            // 获取小流量数据
            getXllData: getXllData,
            getState: getState
        };
    }();

    // 报告头
    var reportHeader = function() {
        function set(params) {
            var template, header, hint;
            // 计划列表
            if(params.reporttype <= 2) {
                template = params.reporttype == 1
                    ? fclab.cpa.config.hints[1029]
                    : fclab.cpa.config.hints[1030];
                header = ui.format(
                    template,
                    params.startime,
                    params.endtime
                );
                hint = fclab.cpa.config.hints[1032];
            }
            // 小流量
            if(params.reporttype == 3) {
                template = fclab.cpa.config.hints[1031];
                header = ui.format(
                    template,
                    // 当天日期
                    baidu.date.format(
                        new Date(nirvana.env.SERVER_TIME * 1000),
                        'yyyy-MM-dd'
                    )
                );
                hint = fclab.cpa.config.hints[1033];
            }
            // 写入报告头
            var target = baidu.g('cpa-reportstitle-container');
            target.innerHTML = header;
            target.style.display = 'block';
            // 写入提示
            target = baidu.g('cpa-reportshint-container');
            target.innerHTML = hint;
            target.style.display = 'block';
        };

        // 隐藏
        function hide() {
            var target = baidu.g('cpa-reportstitle-container');
            target.style.display = 'none';
            target = baidu.g('cpa-reportshint-container');
            target.style.display = 'none';
        };

        return {
            set: set,
            hide: hide
        };
    }();

    // tab切换组件
    var reportsTab = function() {
        var tab, tabMap = [
            2, 4, 1, 16
        ];
        var sum, params, handler, currentIndex = 0;
        // 初始化
        function init() {
            tab && tab.dispose();
            tab = ui.util.create(
                'Tab',
                {
                    id: 'cpa-report-tab',
                    title: fclab.cpa.config.reportsTab
                },
                baidu.g('cpa-report-tab')
            );
            tab.onselect = function(index) {
                handler(index);
                currentIndex = index;
            };
            // 恢复状态
            currentIndex = 0;
        };
        // 设置渲染数据
        function set(data, p) {
            sum = data;
            params = p;
            switch(params.reporttype) {
                case 1:
                    handler = renderSingle;
                    break;
                case 2:
                    handler = renderCompare;
                    break;
                case 3:
                    handler = renderXll;
                    break;
            }
            // 默认选中第一个
            handler(currentIndex);
            (params.reporttype == 1 || params.reporttype == 2) 
                && show();
        };

        // 小流量数据，无tab数据
        function renderXll(index) {
            hide();
        };

        // 对比数据渲染
        function renderCompare(index) {
            var data = sum[tabMap[index]];
            var target = baidu.g('cpa-reporttab-content');
            target.className = 'cpa-reporttab-content-compare';
            // 为空数据
            if(data == undefined) {
                var name = fclab.cpa.config.transTypeMap[tabMap[index]];
                target.innerHTML = '暂无 <strong>' + name + '</strong> 数据！';
                return;
            }
            // 数字转换
            data.otrans    = (+ data.otrans);
            data.trans     = (+ data.trans);

            data.opay    = (+ data.opay);
            data.pay     = (+ data.pay);

            data.oavgtrans    = (+ data.oavgtrans);
            data.avgtrans     = (+ data.avgtrans);
            target
                .innerHTML = 
                    ui.format(
                        er.template.get('fclabCpaReportsMultiTab'),
                        // 转化量
                        data.otrans.toFixed(2),
                        // 全部显示
                        fclab.abtestUtil.getBar({
                            height: 15,
                            maxvalue: (data.otrans > data.trans ? 100 : data.trans),
                            value: (data.otrans > data.trans ? 100 : data.otrans)
                        }),
                        fclab.abtestUtil.getBar({
                            height: 15,
                            maxvalue: (data.otrans > data.trans ? data.otrans : 100),
                            value: (data.otrans > data.trans ? data.trans : 100)
                        }),
                        data.trans.toFixed(2),
                        // 消费
                        data.opay.toFixed(2),
                        fclab.abtestUtil.getBar({
                            height: 15,
                            maxvalue: (data.opay > data.pay ? 100 : data.pay),
                            value: (data.opay > data.pay ? 100 : data.opay)
                        }),
                        fclab.abtestUtil.getBar({
                            height: 15,
                            maxvalue: (data.opay > data.pay ? data.opay : 100),
                            value: (data.opay > data.pay ? data.pay : 100) 
                        }),
                        data.pay.toFixed(2),
                        // 平均转化成本
                        data.oavgtrans.toFixed(2),
                        fclab.abtestUtil.getBar({
                            height: 15,
                            maxvalue: (data.oavgtrans > data.avgtrans ? 100 : data.avgtrans), 
                            value: (data.oavgtrans > data.avgtrans ? 100 : data.oavgtrans) 
                        }),
                        fclab.abtestUtil.getBar({
                            height: 15,
                            maxvalue: (data.oavgtrans > data.avgtrans ? data.oavgtrans : 100),
                            value: (data.oavgtrans > data.avgtrans ? data.avgtrans : 100)
                        }),
                        data.avgtrans.toFixed(2),
                        // 转化率
                        data.otransrate,
                        fclab.abtestUtil.getBar({
                            height: 15,
                            maxvalue: 100,
                            value: parseFloat(data.otransrate)
                        }),
                        fclab.abtestUtil.getBar({
                            height: 15,
                            maxvalue: 100,
                            value: parseFloat(data.transrate)
                        }),
                        data.transrate,
                        // 对比时间
                        data.otime,
                        data.time
                    );
        };

        // 单数据渲染
        function renderSingle(index) {
            var data = sum[tabMap[index]];
            var target = baidu.g('cpa-reporttab-content');
            target.className = 'cpa-reporttab-content';
            // 为空数据
            if(data == undefined) {
                var name = fclab.cpa.config.transTypeMap[tabMap[index]];
                target.innerHTML = '暂无 <strong>' + name + '</strong> 数据！';
                return;
            }
            // 开始画tab内容
            target
                .innerHTML = 
                    ui.format(
                        er.template.get('fclabCpaReportsSingleTab'),
                        data.trans,
                        fclab.abtestUtil.getBar({
                            height: 15,
                            maxvalue: 100,
                            value: 100
                        }),
                        data.pay,
                        fclab.abtestUtil.getBar({
                            height: 15,
                            maxvalue: 100,
                            value: 100
                        }),
                        data.avgtrans,
                        fclab.abtestUtil.getBar({
                            height: 15,
                            maxvalue: 100,
                            value: 100
                        }),
                        data.transrate,
                        fclab.abtestUtil.getBar({
                            height: 15,
                            maxvalue: 100,
                            value: parseFloat(data.transrate)
                        })
                    );
        };
        // 显示
        function show() {
            baidu.g('cpa-reporttab-container')
                .style
                .display = 'block';
            baidu.g('cpa-reporttab-content-container')
                .style
                .display = 'block';
            baidu.g('cpa-reporttab-content')
                .style
                .display = 'block';
        };
        // 隐藏
        function hide() {
            baidu.g('cpa-reporttab-container')
                .style
                .display = 'none';
            baidu.g('cpa-reporttab-content-container')
                .style
                .display = 'none';
            baidu.g('cpa-reporttab-content')
                .style
                .display = 'block';
        };

        return {
            init: init,
            set: set,
            show: show,
            hide: hide
        };
    }();

    // 下载数据处理器
    var downloader = function() {
        var button;

        // 初始化
        function init() {
            button && button.dispose();
            button = ui.util.create(
                'Button',
                {
                    id: 'cpa-reports-download'
                },
                baidu.g('cpa-reports-download')
            );
            // 绑定点击事件
            button.onclick = buttonClick;
        };

        // 显示
        function show() {
            baidu.g('cpa-download-container')
                .style
                .display = 'block';
        };

        // 隐藏
        function hide() {
            baidu.g('cpa-download-container')
                .style
                .display = 'none';
        };

        // 点击下载
        function buttonClick() {
            var params = controler.get();
            var requestUtl = params.reporttype <= 2 
                ? '/nirvana/tool/lab/download_cpa.do'
                : '/nirvana/tool/lab/download_cpaab.do'; // 3
            var userid = nirvana.env.USER_ID;
            var paramsarray = [];
            for(var key in params) {
                paramsarray.push(
                    key + '=' + params[key]
                );
            }
            paramsarray.push(
                'userid=' + userid
            );
            var paramstring = paramsarray.join('&');
            // 打开新页
            window.open(
                requestUtl + '?' + paramstring
            );
        };

        return {
            init: init,
            show: show,
            hide: hide,
            disable: function() {
                button.disable(1);
            },
            enable: function() {
                button.disable(0);
            }
        };
    }();

    // 表格
    var tabler = function() {
        // 初始化内部变量表格、分页、数据存储
        var table, pager, database, currentPage = 1, perPage;

        // 排序？
        var orderBy, orderMethod, willOrder;

        // 渲染
        function render(data, params, sum, isPager) {
            // 小流量列表
            if(params.reporttype == 3 || isPager) {
                initXllList(data, sum, isPager);
                return;
            }
            // 计划列表
            if(params.reporttype <= 2) {
                initPlanList(data, 
                        fclab.cpa.config.cpaPlanFields[
                            params.reporttype
                        ]
                    );
            }
        };

        // 排序
        function tableOnSort(sortField, order, isXll) {
            orderBy = sortField.field;
            orderMethod = order;
            if(isXll) {
                // 画表格
                var renderData = database;
                // 排序处理
                if(orderBy && orderMethod) 
                    renderData 
                        = orderData(renderData, orderBy, orderMethod);
                table.datasource = renderData;
                table.render();
                return;
            }
            renderPlanList(currentPage);
        };

        // 处理计划列表
        function initPlanList(data, fields) {
            // 空数据
            if(data.length == 0) {
                // reportHeader.hide();
                reportsTab.hide();
                downloader.hide();
                htmlRecover();
                baidu.g('cpa-plan-empty-tips')
                    .style
                    .display = 'block';
                return;
            } 
            else {
                baidu.g('cpa-plan-empty-tips')
                    .style
                    .display = 'none';
            }
            // 渲染前处理
            beforeRender(data, fields);
            // 绑定翻页
            pager.onselect = function(nowPage) {
                renderPlanList(nowPage);
                currentPage = nowPage;
            };
            // 渲染
            renderPlanList();
        };

        // 处理小流量列表
        function initXllList(data, sum, isPager) {
            // 空数据
            if(data.length == 0) {
                // reportHeader.hide();
                reportsTab.hide();
                downloader.hide();
                htmlRecover();
                xllTips.hide();
                baidu.g('cpa-plan-empty-tips')
                    .style
                    .display = 'block';
                return;
            } 
            else {
                xllTips.hide();
                baidu.g('cpa-plan-empty-tips')
                    .style
                    .display = 'none';
            }
            // 渲染前处理
            !isPager && 
                beforeRender(data, fclab.cpa.config.cpaPlanFields[3], true);
            isPager && (database = data);
            // 绑定翻页
            pager.onselect = function(nowPage) {
                controler.getXllData((nowPage - 1) * perPage, true);
                // renderXllList({
                //     page: nowPage,
                //     total: sum
                // });
                currentPage = nowPage;
            };
            // 渲染
            renderXllList({
                total: sum
            });
        };

        // 恢复html
        function htmlRecover() {
            baidu.g('cpa-table-real-container')
                .innerHTML = '<div id="cpa-reports-table-container"></div>';
            baidu.g('cpa-reports-pager-container')
                .innerHTML = '<div id="cpa-reports-table-pager"></div>';
        };

        // 渲染前处理
        function beforeRender(data, fields, isXll) {
            table && table.dispose();
            pager && pager.dispose();
            // 恢复排序？
            orderBy = orderMethod = '';
            // 恢复html
            htmlRecover();
            // var tar;
            // if(tar = baidu.g('ctrltablecpa-reports-table')) 
            //     tar.setAttribute('id', 'cpa-reports-table-container');
            // if(tar = baidu.g('ctrlpagecpa-reports-table-pager')) 
            //     tar.setAttribute('id', 'cpa-reports-table-pager');
            // 放入数据
            database = data;
            // 初始化table
            table = ui.util.create(
                'Table',
                // options
                fclab.cpa.config.cpaPlanTable,
                baidu.g('cpa-reports-table-container')
            );
            table.fields = fields;
            // 排序事件
            // table.onsort = tableOnSort;
            table.onsort = function(sortField, order) {
                tableOnSort(sortField, order, isXll);
            };
            // 初始化分页组件
            pager = ui.util.create(
                'Page', 
                {
                    id: 'cpa-reports-table-pager',
                    total: 1, // total 为1的时候并不会渲染
                    page: 1
                }, 
                baidu.g('cpa-reports-table-pager')
            );
        };

        // 渲染计划列表
        function renderPlanList(page) {
            // var perPage = controler.get().reporttype == 2 ? 5 : 10;
            var nowPage = + (page == undefined ? 1 : page);
            var totalPage = + Math.ceil(database.length / perPage);
            // 画表格
            var renderData = database.slice(
                (nowPage - 1) * perPage, nowPage * perPage
            );
            // 排序处理
            if(orderBy && orderMethod) 
                renderData 
                    = orderData(renderData, orderBy, orderMethod);
            table.datasource = renderData;
            table.render();
            // 画分页
            pager.total = totalPage;
            pager.page = nowPage;
            pager.render();
        };

        // 渲染小流量列表
        function renderXllList(opt) {
            // var perPage = 5;
            var nowPage = + (opt.page == undefined 
                ? currentPage 
                : opt.page);
            var totalPage = + Math.ceil(opt.total / perPage);
            // 画表格
            var renderData = database;
            // 排序处理
            if(orderBy && orderMethod) 
                renderData 
                    = orderData(renderData, orderBy, orderMethod);
            table.datasource = renderData;
            table.render();
            // 画分页
            pager.total = totalPage;
            pager.page = nowPage;
            pager.render();
        };

        // 排序函数
        function orderData(datalist, field, order) {
            if (!field || !order || datalist.length <= 1) {
                return datalist;
            }
            var func = new Function(),
                sortField = field || '';

            nirvana.manage.orderParam.sortField = sortField;
            willOrder = sortField;
            switch (sortField) {
                case 'planname':
                case 'time':
                    func = (order == 'desc') ? nirvana.manage.sort.wordDESC : nirvana.manage.sort.wordASC;
                    break;
                // cpa中transrate，百分数排序
                case 'transrate':
                    func = (order == 'desc') ? nirvana.manage.sort.numPercentDESC : nirvana.manage.sort.numPercentASC;
                    break;
                // cpa中type，特殊顺序排序
                case 'type':
                    func = (order == 'desc') ? typeDESC : typeASC;
                    break;
                default:
                    func = (order == 'desc') ? nirvana.manage.sort.numDESC : nirvana.manage.sort.numASC;
                    break;
            }
            datalist.sort(func);
            return datalist;
        };

        // 辅助排序函数
        var typeDESC = function(a, b) {
            var field = willOrder;
            a = a[field];
            b = b[field];
            var compareMap = {
                2: 5,
                4: 4,
                1: 3,
                16: 2, // 其它
                // 8
                8: 2
            };
            // 对于“其它”值的判断
            compareMap[a] == undefined
                && (compareMap[a] = 2);
            compareMap[b] == undefined
                && (compareMap[b] = 2);
            if (compareMap[a] < compareMap[b]) {
                return 1;
            }
            else 
                if (compareMap[a] > compareMap[b]) {
                    return -1;
                }
                else {
                    return 0;
                }
        };

        var typeASC = function(a, b){
            return typeDESC(a, b) * (-1);
        };

        // 特殊暴露
        function resetPage() {
            currentPage = 1;
        };

        function setPerPage(page) {
            perPage = page;
        };

        return {
            render: render,
            resetPage: resetPage,
            setPerPage: setPerPage
        };
    }();

    // 小流量显示控制
    var xllTips = function() {
        // 初始化
        function init() {
            baidu.event.on(
                'cpa-xlltips-handler',
                'click',
                clickHandler
            );
        };
        // 单击控制器
        function clickHandler() {
            // 打开工具设置tab页
            fclab.cpa.Tools();
        };

        return {
            init: init,
            show: function() {
                baidu.g('cpa-xll-tips')
                    .style
                    .display = 'block';
            },
            hide: function() {
                baidu.g('cpa-xll-tips')
                    .style
                    .display = 'none';
            }
        };
    }();

    // 暴露对外函数
    return function() {
        // 前期准备
        fclab.cpa.beforeSwitchTab('Reports');
        // 控制台初始化
        controler.init();
        // 初始化tab组件
        reportsTab.init();
        // 下载按钮初始化
        downloader.init();
        // 小流量提示
        xllTips.init();
    };
}();