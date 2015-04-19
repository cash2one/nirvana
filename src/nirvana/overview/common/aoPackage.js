/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: nirvana/overview/aoPackage.js
 * desc: 概况页智能账户优化模块，将原来index.js的代码抽离出来放在这里
 * date: $Date: 2013/02/28 $
 */
/**
 * 概况页优化包区域
 * 如果是老户优化对照组（nirvana.env.EXP == '7450'）则不执行相关方法
 * 转全时，直接去掉判断语句
 */
overview.aoPackage = {
    // 轮询计数器
    queryTimesCount : 0,

        pkgCache : [],   // 缓存轮询中获取到的已经展现的包的pkgid
        pkgOptCache : [], // 有更新条数的包的id
        pkgRank: [], // 包的展现顺序
        pkgShowTime : {}, // 展现时间
    pkgOptnumTime : {}, // 展现更新条数时间
    requestStart : null, // 请求的开始时间
        globalId : null,
        roundId : 0,

        // 最大请求次数
        // 根据UE的某次调研，用户进入概况页的停留大约为10-20s，则配置最大次数为30，时间为30s足矣
        maxQueryTimes : 10,

        // 优化包状态轮询间隔
        queryInterval : 1000,

        // 模块是否存在
        exist: null,

        loading : function() {
        nirvana.util.loadingQuery.show('AoPackageArea');
    },

    done : function() {
        var me = this,
            showtime = [],
            showopttime = [],
            singleoptime;

        nirvana.util.loadingQuery.hide('AoPackageArea');

        // 发送展现监控
        // 处理“本次轮询展现的新包”的监控
        if(me.pkgCache.length > 0 && me.pkgOptCache.length > 0){
            for(i = 0; i < me.pkgCache.length; i++){
                showtime.push(me.pkgShowTime['pkg_' + me.pkgCache[i]]);
                singleoptime = me.pkgOptnumTime['pkg_' + me.pkgCache[i]] || 0;
                showopttime.push(singleoptime);
            }
            nirvana.aoPkgControl.logCenter.extend({
                packages : me.pkgCache.join(),
                pkgRank: me.pkgRank.join(),
                actionStep : -2,
                queryStartTime : this.requestStart,
                pkgid : null,
                pkgShowTime : showtime.join(),
                pkgShowOptTime : showopttime.join(),
                entrance : 0 // 意味着推广概况页包区域
            }).sendAs('nikon_package_show');
            // this.pkgCache = this.pkgCache.concat(newPkgs);
        }
    },

    init : function() {
        var me = this;

        // 确认当前用户是否有参与智能账户优化活动的权限，
        // 活动时间为4.24至5.23，活动结束后链接和引导页下线
        // add by Huiyao 2013.4.19
        var activityHref = nirvana.auth.getAoPointActivityHref();
        if (activityHref && !nirvana.auth.isAoPointActivityExpire()) {
            var helpEle = $$('#AoPackageArea .title_area .help')[0];
            if (helpEle) {
                // 修改智能账户优化区域右上角的链接和文字
                var activityTitle = '用智优，抽大奖';
                baidu.dom.setAttrs(helpEle, {
                    title: activityTitle,
                    href: activityHref,
                    style: 'color: red;'
                });
                helpEle.innerHTML = activityTitle;
            }
        }

        this.exist = null;

        this.pkgCache = [];
        this.pkgOptCache = [];
        this.pkgShowTime = {};
        this.pkgOptnumTime = {};
        this.requestStart = (new Date()).valueOf();
        this.globalId = null;
        this.roundId = 0;
        me.loading();

        // 重置相关参数
        me.reqid = '';
        // 计数器清零
        me.queryTimesCount = 0;

        me.request();

        baidu.g('AoPackageList').onclick = me.clickHandler();
    },

    request : function() {
        var me = this;

        // 如果超过最大请求次数，直接down掉
        if (me.queryTimesCount++ >= me.maxQueryTimes) {
            me.done();
            return;
        }
        var reqid = me.reqid,
            command = 'start';

        if (reqid !== '') {
            command = 'query';
        }

        var condition = me.getExtraCondition();
        me.roundId++;
        condition.roundId = me.roundId;
        if(command == 'query'){
            condition.globalId = me.globalId;
        }

        fbs.nikon.getPackageStatus({
            command : command,
            reqid : reqid,
            condition : condition,
            onSuccess : me.responseSuccess(),
            onFail : function(response) {
                ajaxFailDialog();
            }
        });
    },

    getExtraCondition : function(){
        var condition = {},
            extra = [];

        var sdata = LoginTime.getData('AoPkgWords');
        if(sdata && sdata.viewed){
            extra.push("4_3");
        }
        if(extra.length > 0){
            condition.extra = extra.join();
        }
        return condition;
    },

    responseSuccess : function() {
        var me = this;

        return function(response) {
            var data = response.data,
                aostatus = data.aostatus,
                reqid = data.reqid,
                aoPackageItems = data.aoPackageItems;

            // reqid不匹配，则不是同一批次的轮询请求，直接丢弃
            if (me.reqid != '' && me.reqid != reqid) {
                return false;
            }

            // me.reqid有可能为''，直接赋值
            me.reqid = reqid;
            me.aoPackageItems = aoPackageItems;

//            // 对于小流量包上线的时候，或者对照组可能对于new出现有特殊需求，这里要重置一下
//            // 如果不存在这种情况，这行代码可以注掉
//            overview.AoPkgGuide.resetPkgFlag(aostatus, aoPackageItems);

            // 这里处理返回数据
            me.render();

            // 引导页自动出现时机：在优化包渲染到智能优化区域之后再出，避免引导页出错
//            overview.AoPkgGuide.autoShow(aoPackageItems);
            overview.guide.show(aostatus === 1);

            // 判断请求状态，轮询或者终止
            switch (aostatus) {
                case 0:
                    me.done();
                    break;
                case 1:
                    setTimeout(function() {
                        me.request();
                    }, me.queryInterval);
                    break;
                case 2:
                    break;
            }
        };
    },

    /**
     * 优化包渲染函数
     */
    render : function() {
        // 克隆优化包配置
        var me = this,
            aoPackageItems = me.aoPackageItems,
        // 后端返回的单个包
            aoPackageItem,
            len = aoPackageItems.length,
            aoPackages = baidu.object.clone(nirvana.aoPkgConfig.SETTING),
        // 前端优化包配置
            aoPackage,
            i,
            tmpHTML = [],
            newPkgs = [],
            showTime = [];

        if (!this.exist) {
            this.exist = !!len;
        }

        if(len > 0){
            me.globalId = aoPackageItems[0].data.globalId;
        }

        me.pkgRank = [];
        for (i = 0; i < len; i++) {
            aoPackageItem = aoPackageItems[i];
            me.pkgRank.push(aoPackageItem.pkgid);

            aoPackage = aoPackages[nirvana.aoPkgConfig.KEYMAP[aoPackageItem.pkgid]];

            if(aoPackage){
                // 合并前端配置属性与后端返回数据
                baidu.extend(aoPackage, aoPackageItem);

                tmpHTML.push(me.buildHTML(aoPackage));

                // 判断并记录包的展现监控
                // edited by LeoWang (wangkemiao@baidu.com)
                // 2012-11-22
                if(baidu.array.indexOf(this.pkgCache, aoPackage.pkgid) == -1){
                    this.pkgCache.push(aoPackage.pkgid);
                    this.pkgShowTime['pkg_' + aoPackage.pkgid] = (new Date()).valueOf();
                }
                if(aoPackage.newoptnum > 0){  // 有建议
                    // 判断是否已经有了？
                    if(baidu.array.indexOf(this.pkgOptCache, aoPackage.pkgid) == -1){
                        this.pkgOptCache.push(aoPackage.pkgid);
                        this.pkgOptnumTime['pkg_' + aoPackage.pkgid] = (new Date()).valueOf();
                    }
                }
            }
        }

        baidu.g('AoPackageList') && (baidu.g('AoPackageList').innerHTML = tmpHTML.join(''));

        // holiday
        // modified by Leo Wang(wangkemiao@baidu.com)
        // nirvana.aoPkgControl.holidayActivity.init('overview');

        // 渲染优化包查看介绍功能
        overview.AoPkgGuide.initGuideTip();
    },

    /**
     * 构造优化包HTML
     * @param {Object} appObject
     */
    buildHTML : function(appObject) {
        var tmpHTML = [],
            appClass = '',
            upNumClass = '',
            count = appObject.count,
            tpl = er.template,
            pkgid = appObject.pkgid,
            data = appObject.data,
            newoptnum = appObject.newoptnum,
            pkgTxt = '',
            pkgTip = '',
        // 新功能'new'样式信息， Added by Wu Huiyao
            decoratedStyle = '',
            highlightStyle = '';

        // 限时包标识
        if (appObject.limitTime) {
            appClass = 'limit_time';
        }

        // 更新数量为0或-1时不显示
        if (newoptnum < 1) {
            upNumClass = 'hide';
        } else {
            pkgTip = '您有' + newoptnum + '条新的优化建议';

            // 更新数量为2位数，则修改更新数量的class
            // 这里判断更新数量的位数，选择相应的class。。。背景图片各种阴影圆角，直接用替换图片实现吧
            // 最大为99+
            if (newoptnum > 9) {
                upNumClass = 'update2';
            }
        }

        /***********Added by Wu Huiyao****************************/
        // 对于优化包新增样式信息
        var viewBoxFlag = +appObject.viewBoxFlag;
        if (viewBoxFlag === 1) {
            appClass += ' new_pkg';
            decoratedStyle = 'new_pkg_flag';
            highlightStyle = 'newpkg_highlight';
        } else if (viewBoxFlag === 2) {
            appClass += ' upgrade_pkg';
            decoratedStyle = 'upgrade_pkg_flag';
            highlightStyle = 'upgradepkg_highlight';
        } else {
            decoratedStyle = 'hide';
            highlightStyle = 'hide';
        }
        /*************END*************/

        switch (pkgid) {
            case 1:
                var stage = {
                        shows : '展现',
                        clks : '点击'
                    },
                    beginValue = data.beginvalue,
                    endValue = data.endvalue,
                    decrValue = round(((beginValue - endValue) / beginValue) * 100) + '%', // 保存为整数
                    dateType = nirvana.aoPkgControl.popupCtrl.dateTypeTranslation[data.datetype]; // 工作日 节假日

                pkgTxt = '昨日比前一个' + dateType + stage[data.decrtype] + '突降<strong>' + decrValue + '</strong>（' + beginValue + '<span class="specFamily">→</span>' + endValue + '）';
                break;
            case 2:
                var totalClkLost = data.totalclklost;

                if (totalClkLost > 0) {
                    pkgTxt = '您最近7天损失<strong>' + totalClkLost + '</strong>个客户访问';
                } else {
                    pkgTxt = '提升您的客户访问量';
                }
                break;
            case 3:
                var startype = data.startype,
                    status = {
                        1 : '较差',
                        2 : '一般'
                    };

                switch (+startype) {
                    // 无生效关键词
                    case 0:
                        pkgTxt = '账户内无关键词';
                        break;
                    // 生效一星词
                    case 1:
                    // 生效二星词
                    case 2:
                        var num = data.num,
                            ratio = round((num / data.totalnum) * 100) + '%'; // 保存为整数

                        pkgTxt = '账户内<strong>' + data.num + '</strong>个关键词质量度' + status[startype] + '(占' + ratio + ')';
                        break;
                    // 生效三星词
                    case 3:
                        pkgTxt = '账户内关键词质量优秀，<span class="good"></span>'
                        break;
                }

                break;
            case 4:
                var sdata = LoginTime.getData('AoPkgWords');
                if(sdata && sdata.viewed){
                    upNumClass = 'hide';
                    pkgTip = '';
                    pkgTxt = '查看重点词实时表现';
                }
                else{
                    if(newoptnum == -1){
                        pkgTxt = '计算中...';
                    }
                    else if(newoptnum == 0){
                        upNumClass = 'hide';
                        pkgTip = '';
                        pkgTxt = '查看重点词实时表现';
                    }
                    else{
                        var proctime = data.proctime;
                        var probwordnum = data.probwordnum;
                        if('undefined' != typeof proctime && 'undefined' != typeof probwordnum){
                            pkgTip = '您有' + newoptnum + '个重点词建议优化'
                            //pkgTxt = probwordnum + '个重点词建议优化<br />' +  baidu.date.format(new Date(+proctime), 'HH:mm') + '完成诊断';
                            pkgTxt = nirvana.corewordUtil.getPkgOverviewInfo(data);
                        }
                        else{
                            pkgTxt = '';
                        }
                    }
                }
                break;
            case 5:
                if(data.totalwordsnum == '-1'){
                    pkgTxt = '计算中...';
                }else{
                    pkgTxt = (data.totalwordsnum != '0') ? '（<strong>' + data.totalwordsnum + '</strong>个关键词）' : '';
                    pkgTxt = '为您搜罗业务相关各种好词' + pkgTxt;
                }
                break;
            case 6: //行业领先包
                if (!data || !data.tiptype) {
                    break;
                }
                var tipType = +data.tiptype;
                switch (tipType) {
                    case 1:
                        pkgTxt = '您的点击量在行业中表现优秀';
                        break;
                    case 2:
                        pkgTxt = '您的点击量位于行业前<strong> ' + data.percent + '%</strong>';
                        break;
                    case 3:
                        pkgTxt = '您的点击量位于行业后 <strong> ' + (100 - data.percent) + '%</strong>';
                        break;
                }
                break;
            case 7: // 升级的突降急救包
                var beginValue = data.beginvalue;
                var endValue = data.endvalue;
                var beginDate = new Date(+data.begindate);
                var endDate = new Date(+data.enddate);
                var format = baidu.date.format;
                var abstrTPL = '{endDate}比{beginDate}点击突降<strong>{decrValue}%</strong>' +
                    '（{beginValue}<span class="specFamily">→</span>{endValue}）';

                pkgTxt = lib.tpl.parseTpl({
                    beginDate: format(beginDate, 'M月d日'),
                    endDate: format(endDate, 'M月d日'),
                    decrValue: round((beginValue - endValue) / beginValue * 100),
                    beginValue: beginValue,
                    endValue: endValue
                }, abstrTPL);
                break;
            case 8: //移动包
                pkgTxt = '提升您的移动推广客户访问量';
                break;
            case 9: // 旺季包
                var beforePeakNum = +data.beforepeaknum;
                if (beforePeakNum) {
                    pkgTxt = '<strong>' + beforePeakNum + '</strong>个行业即将进入旺季';
                }
                var inPeakNum = +data.inpeaknum;
                if (inPeakNum) {
                    pkgTxt && (pkgTxt += '，');
                    pkgTxt += ('<strong>' + inPeakNum + '</strong>个行业处于旺季中');
                }
                if (!pkgTxt && +data.afterpeaknum) {
                    pkgTxt += ('<strong>' + data.afterpeaknum
                        + '</strong>个行业处于旺季末期，请及时调整投放力度');
                }
                break;
        }

        return lib.tpl.parseTpl({
            pkg_class: appClass,
            id: appObject.id,
            pkgid: pkgid,
            pkg_tip: pkgTip,
            optnum_class: upNumClass,
            pkg_newoptnum: appObject.newoptnum,
            pkg_name : appObject.name,
            pkg_desc : appObject.iconDesc,
            pkg_text : pkgTxt,
            // 填充包装饰功能样式信息 Added by Wu Huiyao
            decorated_class: decoratedStyle,
            highlight_class: highlightStyle
        }, tpl.get('aoPackageItem'));
    },

    clickHandler : function() {
        var me = this,
            target,
            tagName,
            pkgid;

        // 更新target
        function updateTarget(target) {
            tagName = target.tagName.toLowerCase();
            pkgid = target.getAttribute('pkgid');
        }

        return function(e) {
            var e = e || window.event;

            target = e.target || e.srcElement;
            updateTarget(target);

            while (!pkgid && tagName !== 'ul') { // 没有点击优化包标签，则向上追溯父节点
                target = target.parentNode;
                updateTarget(target);
            }

            nirvana.aoPkgControl.openAoPackage(pkgid, 0);
        };
    }
};