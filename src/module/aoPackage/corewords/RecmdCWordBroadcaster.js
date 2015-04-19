/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/corewords/RecmdCWordBroadcaster.js
 * desc: 重点词排名包右上角的轮播推荐重点词功能
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/12/04 $
 */
/**
 * 重点词排名包的推荐重点词的轮播功能：包括关注轮播的重点词以及查看更多
 * @class RecmdCWordBroadcaster
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.RecmdCWordBroadcaster = function($, nirvana) {
    /**
     * 轮播组件的构造函数
     * @param {HTMLElement} containerElem 要渲染的轮播内容的DOM容器元素
     * @param {nirvana.CoreWordsPackage} corewordPkg
     * @param {?number} broadCastNum 要轮播的词的数量
     * @param {?number} broadCastInterval 轮播的间隔时长，单位毫秒
     * @constructor
     */
    function RecmdCWordBroadcaster(containerElem, corewordPkg,
                                   broadCastNum, broadCastInterval) {
        this._pkg = corewordPkg;
        // 轮播词的数量:-1默认全部所有可推荐的词
        this._broadCastNum = broadCastNum || -1;
        // 轮播间隔:默认4秒
        this._broadCastInterval = broadCastInterval || 4000;

        // 执行初始化任务
        this.init(containerElem);
    }

    RecmdCWordBroadcaster.prototype = {
        /**
         * 初始化实例
         * @private
         * @param {HTMLElement} containerElem 要渲染的轮播内容的DOM容器元素
         */
        init: function(containerElem) {
            this._mainElem =
                fc.create(er.template.get('corwordRecmdBroadcast'));
            // 初始化UI Widgets
            this.initWidgets(this._mainElem);
            // 先将该元素隐藏
            baidu.hide(this._mainElem);
            containerElem.appendChild(this._mainElem);

            this._scheduler = nirvana.util.bind(this.broadCast, this);
        },
        /**
         * 初始化组件
         * @private
         * @param {HTMLElement} elem 要初始化的组件所属的DOM容器元素
         */
        initWidgets: function(elem) {
            this._widgetMap = ui.util.init(elem);
            //this._widgetMap['addCorewordBtn'].disable(true);
            this.bindHandler();
        },
        /**
         * 绑定事件处理器
         * @private
         */
        bindHandler: function() {
            var me = this,
                moreElem = $('.more_recmd_cword', me._mainElem)[0],
                handler = me._pkg.openRecmdCorewordDlg,
                bindContext = nirvana.util.bind,
                delegate = nirvana.event.delegate;

            // 绑定'更多'链接点击事件处理
            moreElem.onclick = bindContext(handler, me._pkg, true);

            // 绑定'立即关注'按钮的事件处理
            this._widgetMap['addCorewordBtn'].onclick =
                bindContext(me.addCorewordHandler, me);

            // 绑定 mainElem的 mouseover/out事件处理
            me._mainElem.onmouseover =
                delegate(me._mainElem, me.mouseOverHandler, me);
            me._mainElem.onmouseout =
                delegate(me._mainElem, me.mouseOutHandler, me);
        },
        addCorewordHandler: function() {
            // 禁用立即关注按钮
            this.disableAddBtn(true);

            // 停止轮播
            this.stop();

            var toAddWordId = + this._broadCastWord.winfoid;
            /**
             * 立即关注推荐的重点词触发的事件
             * @event onAdd
             * @param {number} toAddWordId 关注的重点词的winfoid
             */
            nirvana.util.executeCallback(this.onAdd, [toAddWordId]);
        },
        mouseOverHandler: function(event, target) {
            if (this.isEnableMouseOverOutEvent(target)) {
                this.stop();
            }
        },
        mouseOutHandler: function(event, target) {
            if (this.isEnableMouseOverOutEvent(target)) {
                this.next();
            }
        },
        disableAddBtn: function(disabled) {
            this._widgetMap['addCorewordBtn'].disable(disabled);
        },
        isEnableMouseOverOutEvent: function(target) {
            return baidu.dom.hasClass(target, 'broadcast_container')
                || baidu.dom.hasClass(target, 'add_coreword_btn');
        },
        /**
         * 隐藏重点词轮播
         * @method hide
         */
        hide: function() {
            if (this._mainElem) {
                baidu.hide(this._mainElem);
                // 停止轮播
                this.stop();
            }
        },
        /**
         * 显示重点词轮播
         * @method show
         * @param {nirvana.aopkg.RecmdCWord} recmdWord
         */
        show: function(recmdWord) {
            if (this._mainElem) {
                // 更新轮播的内容
                this.update(recmdWord.getTopN(this._broadCastNum));
            }
        },
        /**
         * 更新轮播的内容，并重置轮播，重新开始轮播
         * @private
         * @param {Array} topWordArr 要轮播的词的数组
         */
        update: function(topWordArr) {
            this._broadcastWords = topWordArr;
            if (topWordArr.length > 0) {
                this.resetBroadCast();
                // 开始轮播
                this.broadCast();
                baidu.show(this._mainElem);
            } else {
                this.hide();
            }
        },
        /**
         * 重置轮播功能:清楚现有的轮播，轮播的词从第一个开始
         * @private
         */
        resetBroadCast: function() {
            // 重置轮播的索引
            this._broadWordIdx = 0;
            // 开启立即关注按钮
            this.disableAddBtn(false);
        },
        /**
         * 停止轮播
         * @private
         */
        stop: function() {
            // 停止现有轮播
            clearTimeout(this._broadCaster);
        },
        /**
         * 开始轮播
         * @private
         */
        broadCast: function() {
            var me = this;

            if (!me._mainElem || !me._broadcastWords.length) {
                return;
            }

            // 暂停现有轮播
            this.stop();

            // 所有词都轮播过，从头再来
            if (me._broadWordIdx >= me._broadcastWords.length) {
                me._broadWordIdx = 0;
            }

            // 初始化要轮播的词
            me._broadCastWord = me._broadcastWords[me._broadWordIdx ++];

            // 初始化reason元素
            var reasonElem = $('.recmd_reason', me._mainElem)[0];
            reasonElem.innerHTML = nirvana.corewordUtil.getBroadCastWordReason(
                me._broadCastWord.recmreason);

            // 初始化轮播词的元素
            var broadCastWordElem = $('.recmd_coreword', me._mainElem)[0];
            broadCastWordElem.innerHTML =
                lib.field.getWordRenderer(20)(me._broadCastWord);

            // 开始下一个词的轮播
            me.next();
        },
        /**
         * 准备轮播下一个词
         * @private
         */
        next: function() {
            var me = this;
            // 开始轮播
            me._broadCaster = setTimeout(me._scheduler, me._broadCastInterval);
        },
        /**
         * 销毁实例
         * @method dispose
         */
        dispose: function() {
            this._mainElem = null;
            this.stop();
            this._pkg = null;
            this._broadcastWords && (this._broadcastWords.length = 0);

            ui.util.disposeWidgetMap(this._widgetMap);
        }
    };

    return RecmdCWordBroadcaster;
}($$, nirvana);

/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/corewords/RecmdCWordBroadcaster.js
 * desc: 重点词排名包右上角的轮播推荐重点词信息的功能
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/04/07 $
 */
/**
 * 重点词排名包的推荐重点词的广播信息，包括建议添加和取消重点词数量信息
 * TODO NOTICE: 当前为小流量，因此后续对照组下掉，上面代码可以删掉
 * @class RecmdCWordBroadcaster2
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.RecmdCWordBroadcaster2 = function($, T, nirvana) {
    /**
     * 轮播组件的构造函数
     * @param {HTMLElement} containerElem 要渲染的轮播内容的DOM容器元素
     * @param {nirvana.CoreWordsPackage} corewordPkg
     * @constructor
     */
    function RecmdCWordBroadcaster(containerElem, corewordPkg) {
        this._pkg = corewordPkg;
        // 执行初始化任务
        this.init(containerElem);
    }

    RecmdCWordBroadcaster.prototype = {
        /**
         * 初始化实例
         * @private
         * @param {HTMLElement} containerElem 要渲染的轮播内容的DOM容器元素
         */
        init: function(containerElem) {
            this._mainElem = fc.create(er.template.get('corwordRecmdInfo'));

            // 先将该元素隐藏
            baidu.hide(this._mainElem);
            containerElem.appendChild(this._mainElem);
            // 绑定事件处理
            this.bindHandler();
        },
        /**
         * 绑定事件处理器
         * @private
         */
        bindHandler: function() {
            var me = this;
            var viewElem = $('.view-recmcoreword-info', me._mainElem)[0];
            var handler = me._pkg.openRecmdCorewordDlg;

            // 绑定'更多'链接点击事件处理
            viewElem.onclick = nirvana.util.bind(handler, me._pkg, true);
        },
        // TODO NOTICE: 为了兼容现有对照组代码，这个接口暂时保留,后续对照组下掉，这个接口可以删掉
        disableAddBtn: function() {
        },
        /**
         * 隐藏重点词轮播
         * @method hide
         */
        hide: function() {
            this._mainElem && T.hide(this._mainElem);
        },
        /**
         * 显示重点词轮播
         * @method show
         * @param {nirvana.aopkg.RecmdCWord} recmdWord
         */
        show: function(recmdWord) {
            if (this._mainElem) {
                // 更新轮播的内容
                this.update(recmdWord.getRecmAddNum(), recmdWord.getRecmDelNum());
            }
        },
        /**
         * 更新轮播的内容，并重置轮播，重新开始轮播
         * @private
         * @param {Array} topWordArr 要轮播的词的数组
         */
        update: function(recmAddNum, recmDelNum) {
            var me = this;
            // 更新推荐重点词数量信息
            me._updateNum('.recmcoreword-add-info', recmAddNum);
            // 更新推荐取消关注重点词数量信息
            me._updateNum('.recmcoreword-del-info', recmDelNum);
            // PM要求只有推荐取消的词，也不显示轮播信息：推荐取消只是为了让客户能够
            // 把更值得添加的词（有推荐添加时候，但全部添加会超过上限）添进来
            if (recmAddNum /*|| recmDelNum*/) {
                T.show(me._mainElem);
            }
            else {
                me.hide();
            }
        },
        /**
         * 更新推荐关注的重点词和取消关注重点词数量信息
         * @param {string} selector 要更新的数量信息所在容器所对应的DOM元素选择器
         * @param {number} num 推荐关注/取消关注的重点词数量
         * @private
         */
        _updateNum: function(selector, num) {
            var infoEle = $(selector, this._mainElem)[0];
            var numEle = $('.recmcoreword-num', infoEle)[0];
            numEle.innerHTML = num;
            if (num) {
                T.show(infoEle);
            }
            else {
                T.hide(infoEle);
            }
        },
        /**
         * 销毁实例
         * @method dispose
         */
        dispose: function() {
            this._mainElem = null;
            this._pkg = null;
        }
    };

    return RecmdCWordBroadcaster;
}($$, baidu, nirvana);