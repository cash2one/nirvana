/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/emergency/EmergencyPkgGroupOptCtrl.js
 * desc: 突降急救包分组优化建议组件，扩展自AoPkgGroupOptCtrl.js
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/01/07 $
 */
nirvana.aoPkgControl.EmergencyPkgGroupOptCtrl = nirvana.aoUtil.extendClass(nirvana.aoPkgControl.AoPkgGroupOptCtrl, {
    /**
     * 查看优化建议的查看详情
     * @param {String} optid 优化建议项ID字符串，前端做过处理，可能被加上后缀，用于标识子优化建议项，比如303.1_1
     * @param {Number} opttypeid 后端返回的真实的优化建议ID
     * @param {Object} cache 优化建议缓存的数据，包含更多的其它数据
     * @param {Object} data 优化建议的数据，只是当前查看的优化项的数据
     * @override
     */
    viewDetail: function(optid, opttypeid, cache, data) {
//        var initData = {
//            optid: optid,
//            opttypeid: opttypeid,
//            optmd5: cache.optmd5,
//            optdata: data
//        };

        // 查看详情触发的动作的执行
//        switch (opttypeid) {
//            case 702: // 账户预算下调
//            case 703: // 账户预算不足
//            case 706: // 计划预算下调
//            case 707: // 计划预算不足
//                aopkg.BudgetOptimizer.showEmergencyPkgBudget(this, initData);
//                // 移除该优化项有更新的标识
//                this.removeUpdatedInfo(optid);
//                break;
//            case 708: // 时段设置不合理
//                nirvana.aopkg.scheduleDetail.show(this, initData);
//                // 移除该优化项有更新的标识
//                this.removeUpdatedInfo(optid);
//                break;
//            default:
                // 通过滑动方式查看详情
                this.switchToDetail2(optid, opttypeid, cache, data);
//        }
    },
    /**
     * @override
     */
    renderContainer : function(){
        var me = this;
        var appId = me.appId;
        var groupInfo = me.options.groupInfo;
        var tpl = er.template.get('emergencyPkgOptGroupAbstract');
        var html = "";
        var group;

        // 初始化优化建议的HTML内容
        for (var i = 1, len = groupInfo.length; i <= len; i++) {
            group = groupInfo[i - 1];
            html += lib.tpl.parseTpl({
                groupTitleId: appId + 'AoPkgGroupTitle' + i,
                titleClass: group.groupTitleClass
                    ? (' ' + group.groupTitleClass) : '',
                groupName: group.groupName,
                optGroupId: appId + 'AoPkgGroupList' + i,
                groupClass: (i == len ? ' aopkg_listgroup_nomargin' : '')
            }, tpl);
        }

        // 渲染优化建议内容框架
        me.mainDom.innerHTML = html;
        me.optItemRenderTargetId = appId + 'AoPkgGroupList';

        // 重置title DOM元素
        me.titleDom = ui.util.get('decrProblemTab').main;
    },
    /**
     * 更新优化项分组的标题描述信息,这个接口是由Flash图表区的异步请求触发调用，RD不愿
     * 把优化项分组的标题的描述数据放在摘要请求里，没办法。。
     * @param {Object} descData 优化项分组的描述信息
     */
    updateGroupTitleDesc: function(descData) {
        var me = this;

        var data = baidu.object.clone(descData || {});
        // 数据预处理，避免模板初始化出错，由于缺少相应字段信息
        data.rankdown || (data.rankdown = '');
        data.leftrankdown || (data.leftrankdown = '');

        // 定义分组优化项组标题描述信息显示条件和模板，0,1,2顺序必须跟分组显示顺序一致
        var titleConfigMap = {
            0: {
                on: data.rankdown || data.leftrankdown,
                tpl: 'emergencyPkgRankGroupTitleDescr'
            },
            1: {
                on: data.invalidwinfo,
                tpl: 'emergencyPkgPresentGroupTitleDescr'
            },
            2: {
                on: data.timeoff,
                tpl: 'emergencyPkgOnlineGroupTitleDescr'
            }
        };
        var titleConfig;
        var descrEleArr = $$('.emergency_pkg_opgroup_title_descr', me.mainDom);

        for (var i = descrEleArr.length; i --;) {
            titleConfig = titleConfigMap[i] || {};

            if (titleConfig.on) {
                baidu.removeClass(descrEleArr[i].parentNode, 'hide');
                baidu.removeClass(descrEleArr[i], 'hide');

                if (0 === i) {
                    // 排名情况突降，描述信息逻辑比较复杂，有两条，不一定同时显示
                    baidu.extend(data,  {
                        rankClass: data.rankdown ? '' : ' hide',
                        leftClass: data.leftrankdown ? '' : ' hide'
                    });
                }

                descrEleArr[i].innerHTML =
                    lib.tpl.parseTpl(data, titleConfig.tpl, true);
            }
        }
    },
    /**
     * 获取点击一键应用弹窗提示的消息
     * @override
     */
    getApplyAllConfirmMsg: function () {
        var input = baidu.g('AoPackageOptimizerCheckbox701');
        var msg = this.options.applyConfirmMessage;

        if (input && input.checked && !nirvana.auth.isBigCustomers()) {
            msg += '，稍后将跳转至续费页面'
        }
        return msg;
    },
    /**
     * 确定给定的优化建议组是否能显示
     * @override
     */
    isShowGroupOptimize: function(groupTitleId, optGroupId) {
        if (baidu.q('aopkg_absmainitem', optGroupId, 'li').length) {
            return true;
        }
        else {
            var descrEle = $$(
                '#' + groupTitleId + ' .emergency_pkg_opgroup_title_descr',
                this.mainDom
            )[0];
            return !baidu.dom.hasClass(descrEle, 'hide');
        }
    },
    /**
     * 每次渲染完一条优化建议项触发的事件处理器
     * @override
     */
    onafterShowOverviewItem: function (opttypeid, options) {
        // 调用父类方法
        var fn = nirvana.aoPkgControl.AoPkgGroupOptCtrl.prototype;
        fn.onafterShowOverviewItem.apply(this, arguments);

        // 对于大客户无续费链接
        if (701 == opttypeid && nirvana.auth.isBigCustomers()) {
            var startEleStr = 'AoPkgAbsItem' + opttypeid;
            var btn = baidu.q('aopkg_link', startEleStr, 'a');
            baidu.object.each(btn, function (item, i) {
                baidu.hide(item);
            });

            var checkbox = baidu.q('aopkg_checkbox', startEleStr, 'input');
            baidu.object.each(checkbox, function (item, i) {
                item.checked = false;
                baidu.hide(item);
            });
        }
    },
    /**
     * 应用某项或者某些项, 此函数适用于应用全部以及单项的应用中
     * @override
     */
    applyAbsItems: function (optids, timeStamp) {
        // 对于账户余额为零一键应用特殊处理逻辑
        if (baidu.array.indexOf(optids, '701') > -1) {
            // 标记为已完成
            baidu.addClass('AoPkgAbsItem701', 'aopkg_modfinished');
            // 且使checkbox不可用，不选中
            var checkbox = baidu.g('AoPackageOptimizerCheckbox701');
            checkbox.checked = false;
            checkbox.disabled = true;
            window.open(CLASSICS_PAY_URL, 'paywindow');
            baidu.array.remove(optids, '701');
        }

        // 调用父类方法
        var fn = nirvana.aoPkgControl.AoPkgGroupOptCtrl.prototype;
        fn.applyAbsItems.apply(this, arguments);
    },
    /**
     * 根据给定的优化建议类型获取优化建议摘要的模板
     * @param {number} opttypeid
     * @param {number} isSub 是否是子优化建议
     * @param {Object} data 优化建议摘要的数据
     * @return {String} 模板
     */
    getOptimizeItemAbstractTpl: function(opttypeid, isSub, data) {
        var tplName = isSub
            ? ('aoPkgAbsItem' + opttypeid + 'Sub')
            : ('aoPkgAbsItem' + opttypeid);

        return er.template.get(tplName);
    },
    /**
     * 根据给定的优化建议类型获取优化建议摘要的模板数据
     */
    getOptimizeItemAbstractTplData: function(opttypeid, isSub, item) {
        var format = baidu.date.format;
        var data = baidu.object.clone(item.data || {});

        // 下线时间预处理
        var offtime = data.offtime;
        offtime && (data.offtime = format(new Date(+ offtime), 'M月d日HH:mm'));

        // 期末日期预处理
        var endDate = data.enddate;
        endDate && (data.date = format(new Date(+ endDate), 'M月d日'));

        // 计划预算下调/计划预算不足/时段设置不合理存在计划名
        var planName = data.planname;
        var strRender = lib.field.strRenderer;
        planName && (data.planinfo = strRender(planName, 30, 'aopkg_em'));

        // 账户余额为零
        (opttypeid === 701) && (data.chargeLink = CLASSICS_PAY_URL);

        return data;
    },
    /**
     * 获取某条优化建议摘要的HTML
     * @override
     */
    getDetailHtml: function(item, options) {
        var me = this;
        var opttypeid = +(item.opttypeid.toString().replace(/\D\w+/g, ''));
        options = options || { timeout: false };

        // 初始化优化建议摘要项模板
        var tpl = me.getOptimizeItemAbstractTpl(opttypeid,
            options.issub && !me.options.forceNoExtend, item.data);
        // 初始化模板数据
        var data = me.getOptimizeItemAbstractTplData(opttypeid, options.issub, item);

        return fc.tpl.parse(data, tpl);
    }
});