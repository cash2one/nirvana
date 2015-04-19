/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/corewords/CorewordPkg.js
 * desc: 重点词排名包定义，扩展自aoPackage.js
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/03 $
 */
/**
 * 重点词排名包的重点词表格组件
 * @class CoreWordsPackage
 * @namespace nirvana
 */
nirvana.CoreWordsPackage = new nirvana.myPackage({
    onbeforeRenderAppAllInfo : function(){
        // 设置为已经看过了包
        if(LoginTime.isFirstTime('AoPkgWords') ||
            LoginTime.isDuringLogin('AoPkgWords')) {
            LoginTime.setData('AoPkgWords', {
                'viewed' : true
            });
        }
    },
    /**
     * 渲染重点词优化包对话框内容，重写了aopackage方法
     * @override
     */
    renderAppAllInfo : function() {
        var me = this,
            dialog = me.getDialog();

        // 渲染基础信息，包括载入模板文件以及渲染，展现包名，包的简介文字等
        me.renderBasicInfo();

        // 渲染头部
        // me.renderHeader();
        var headElem = me.getDOM('overviewHeader');
        headElem.innerHTML = er.template.get('corewordPkgHeader');

        // 渲染内容区域
        var containerElem = fc.create(er.template.get('CorewordsManage'));
        me.getDOM('overviewContainer').appendChild(containerElem);

        baidu.dom.remove(me.getDOM('dataAreaContainer'));
        baidu.dom.remove(me.getDOM('managerContainer'));

        // 渲染footer区域
        var diagnosElem = fc.create(er.template.get('corewordPkgFooter'));
        dialog.getFoot().appendChild(diagnosElem);

        // 初始化重点词管理界面
        me.initCorewordManage(containerElem, headElem, diagnosElem);

        // 初始化重点词的推荐
        me.initCorewordRecmd();
    },
    /**
     * 初始化重点词管理对象
     * @param containerElem
     * @param headElem
     * @param diagnosElem
     */
    initCorewordManage: function(containerElem, headElem, diagnosElem) {
        // 加载修改的重点词信息
        nirvana.aopkg.CorewordStorage.init();

        var me = this;

        // 创建用于重点词增、删操作的对象实例
        me._coreword = new nirvana.aopkg.Coreword();
        // 订阅重点词添加成功事件
        me.subscribeCorewordAddDelEvents();

        me._corewordManager = new nirvana.aoPkgControl.CorewordManager(
            me, containerElem, headElem, diagnosElem);
        me._corewordManager.show();
    },
    /**
     * 初始化重点词的推荐：请求推荐重点词数据并显示相应的推荐词轮播信息，并确定是否自动
     * 弹出推荐重点词对话框，如果是，则弹出。
     */
    initCorewordRecmd: function() {
        var me = this;

        // TODO 增加对照组判断，后续对照组下掉，可以不用这么判断
        var clazz = nirvana.auth.isCorewordExp()
            ? nirvana.aoPkgControl.RecmdCWordBroadcaster
            : nirvana.aoPkgControl.RecmdCWordBroadcaster2;
        me._broadcaster = new clazz(me.getDOM('overviewHeader'), me);
        // 为轮播组件注册立即关注事件 // TODO 后续对照组下掉，这个方法可以删掉
        me._broadcaster.onAdd = function(toAddWordId) {
            // 添加重点词
            me.addCorewords(
                [toAddWordId],
                nirvana.AoPkgMonitor.CorewordAddType.BROADCAST
            );
        };

        me._recmdCWord = new nirvana.aopkg.RecmdCoreword();
        // 订阅自动出推荐重点词对话框的事件
        me.subscribeAutoShowRecmdCWordDlgEvents();
        // 为推荐重点词轮播订阅事件
        me.subscribeCorwordBroadcaseEvents();

        // 执行推荐重点词的请求
        me._recmdCWord.load();
    },
    /**
     * 订阅重点词添加/删除的事件
     */
    subscribeCorewordAddDelEvents: function() {
        var me = this,
            coreword = me._coreword,
            bindContext = nirvana.util.bind;

        // 订阅重点词添加失败/成功事件
        coreword.subscribe(nirvana.aopkg.Coreword.ADD_SUCCESS,
            bindContext(me.addCorewordSuccessHandler, me));
        coreword.subscribe(nirvana.aopkg.Coreword.ADD_FAIL,
            bindContext(me.addCorewordFailHandler, me));

        var isExp = nirvana.auth.isCorewordExp();
        // TODO 后续对照组下掉，isExp判断可以去掉
        if (!isExp) {
            // 订阅重点词删除成功事件
            coreword.subscribe(nirvana.aopkg.Coreword.DEL_SUCCESS,
                function (winfoidList) {
                    me._recmdCWord.remove(winfoidList);
                }
            );
        }
    },
    /**
     * 添加/关注重点词 // TODO 后续对照组下掉这个方法可以删掉
     * @param {Array} toAddWinfoids 要添加的关键词的winfoid数组
     * @param {number} source 标识触发该动作的源
     */
    addCorewords: function(toAddWinfoids, source) {
        var me = this;
        var Coreword = nirvana.aopkg.Coreword;
        var isExceed =
            nirvana.corewordUtil.isCorewordExceedLimit(
                toAddWinfoids.length,
                me.getAddedCorewordNum(),
                me._recmdCWord.getMaxCorewordNum()
            );

        // 发送请求前，先做前端的一个验证：是否超过重点词上限
        if (isExceed) {
            me._coreword.publish(Coreword.ADD_FAIL, toAddWinfoids,
                Coreword.MOD_FAIL_TYPE.EXCEED_LIMIT, source);
            return;
        }

        // 添加重点词
        me._coreword.add(
            toAddWinfoids,
            source
        );
    },
    /**
     * 添加重点词成功的处理器
     */
    addCorewordSuccessHandler: function(successWordIdList, failWordIdList,
                                        source) {
        var me = this;

        // 将关注的重点词从推荐的重点词列表里移除
        me._recmdCWord.remove(successWordIdList);

        if (failWordIdList && failWordIdList.length) {
            // 有部分词添加失败
            nirvana.corewordUtil.alertCorewordExistOrDel();
            // 强制重新刷新推荐的重点词
            me.refreshRecmdCorewords();
        }
        // 添加关注的重点词到重点词详情里
        me._corewordManager.addCoreword(successWordIdList);
    },
    /**
     * 添加重点词失败的处理器
     */
    addCorewordFailHandler: function(toAddWordIdList, failResonType, source) {
        var util = nirvana.corewordUtil;

        util.alertCorewordAddFail(failResonType, this._recmdCWord.getMaxCorewordNum());
        // 重新开启立即关注按钮 TODO 后续对照组下掉，这行代码可以去掉
        this._broadcaster.disableAddBtn(false);
        // 是否出现部分添加的重点词已经添加过或被删除
        if (util.isCorwordExistOrDel(failResonType)) {
            // 强制重新刷新推荐的重点词
            this.refreshRecmdCorewords();
        }
    },
    /**
     * 刷新推荐的重点词信息，会重新请求推荐的重点词信息，并重新初始化轮播信息
     */
    refreshRecmdCorewords: function() {
        // 执行推荐重点词的请求
        this._recmdCWord.load();
    },
    /**
     * 为自动显示推荐重点词对话框订阅相关事件
     */
    subscribeAutoShowRecmdCWordDlgEvents: function() {
        var me = this;

        var successHandler = nirvana.util.bind(
            me.autoShowRecmdCWordDlg, me);
        // 订阅请求推荐重点词成功的事件，用于及时弹出自动推荐重点词对话框
        me._recmdCWord.subscribe(
            nirvana.listener.LOAD_SUCCESS, successHandler);
    },
    /**
     * 自动显示推荐重点词对话框
     * @param data
     */
    autoShowRecmdCWordDlg: function(autoShow) {
        var me = this;
        // 触发显示推荐重点词对话框的事件
        if (!me.isQuit() && autoShow) {
            me.openRecmdCorewordDlg();
        }
    },
    /**
     * 打开推荐重点词对话框
     * @method openRecmdCorewordDlg
     * @param {boolean} triggerFromMore 是否通过点击更多触发打开推荐重点词对话框
     */
    openRecmdCorewordDlg: function(triggerFromMore) {
        // TODO 后续对照组下掉，下述判断可以去掉
        var isExp = nirvana.auth.isCorewordExp();
        if (triggerFromMore) {
            // 发送查看更多监控
            nirvana.AoPkgMonitor.viewMoreRecmdCorewords();
        }
        else if (!isExp) {
            // 发送自动弹窗的监控
            var recmdCWord = this._recmdCWord;
            var recmAdd = recmdCWord.getRecmAddCorewrds();
            var recmDel = recmdCWord.getRecmDelCorewords();
            var recmAddWinfoids = nirvana.tableUtil.getFieldData(null, 'winfoid', recmAdd);
            var recmDelWinfoids = nirvana.tableUtil.getFieldData(null, 'winfoid', recmDel);
            nirvana.AoPkgMonitor.autoShowRecmCorewordUpdateDlg(recmAddWinfoids, recmDelWinfoids);
        }

        var me = this;
        // TODO 后续对照组下掉，下述判断可以去掉
        var clazz = isExp
            ? nirvana.aoPkgControl.RecmdCorewordDlg
            : nirvana.aoPkgControl.RecmdCorewordDlg2;
        var recmdCWordDlg = new clazz(me._recmdCWord, me._coreword,
            me.getAddedCorewordNum());
        // 绑定对话框ok按钮的事件处理
        // TODO 后续对照组下掉，isExp判断和OnOk可以去掉
        if (isExp) {
            recmdCWordDlg.onOk = function() {
                // 添加重点词
                me.addCorewords(
                    this.getSelCorewords(),
                    nirvana.AoPkgMonitor.CorewordAddType.RECMD_DLG
                );

                // 暂时先不关闭对话框，等真正提交成功再关闭
                return false;
            };
        }
        else {
            recmdCWordDlg.onSuccess = function (addSuccessWinfoids, delSuccessWinfoids,
                                                errorCorewords) {
                var corwordManager = me._corewordManager;
                if (errorCorewords && errorCorewords.length) {
                    // 存在失败的重点词 强制重新刷新重点词信息
                    me.refreshRecmdCorewords();
                    corwordManager.refreshCorewordsDetails();
                }
                else {
                    // 更新重点词详情：移除取消关注的词，添加新关注的重点词
                    corwordManager.removeCoreword(delSuccessWinfoids);
                    corwordManager.addCoreword(addSuccessWinfoids);
                }
            };
        }
        recmdCWordDlg.show();
    },
    /**
     * 获取已经添加过的重点词数量
     * @return {number}
     */
    getAddedCorewordNum: function() {
        if (this._corewordManager) {
            return this._corewordManager.getAddedCorewordNum();
        }
        return 0;
    },
    /**
     * 为推荐重点词轮播订阅相关事件
     */
    subscribeCorwordBroadcaseEvents: function() {
        var me = this;

        // 订阅请求推荐重点词失败的事件
        me._recmdCWord.subscribe(
            nirvana.listener.LOAD_FAIL,
            function() {
                if (!me.isQuit()) {
                    me._broadcaster.hide();
                }
            });
        // 订阅请求推荐重点词成功的事件
        me._recmdCWord.subscribe(
            nirvana.listener.LOAD_SUCCESS,
            function(data) {
                if (!me.isQuit()) {
                    me._broadcaster.show(this);
                }
            });

        // 订阅请求推荐重点词被移除的事件：从轮播中点击立即关注，关注成功会从推荐词里移除
        me._recmdCWord.subscribe(
            nirvana.aopkg.RecmdCoreword.REMOVE,
            function(data) {
                me._broadcaster.show(this);
            });
    },
    /**
     * 销毁重点词优化包
     * @implemented
     */
    disposeAoPkg: function() {
        // 销毁控件实例
        // ui.util.disposeWidgetMap(this._widgetMap);
        ui.util.disposeWidgets(this,
            ['_broadcaster', '_recmdCWord', '_corewordManager']);
    }
});