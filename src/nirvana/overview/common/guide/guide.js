/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: nirvana/overview/guide/guide.js
 * desc: 用于控制出概况页的引导页
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/02/26 $
 */
/**
 * 概况页的引导页
 */
overview.guide = function($, T, fbs) {
    // 标识是否成功请求过引导页内容，避免会话周期内重复请求
    var _requested = false;
    // 标识是否当前处于请求引导页内容等待响应状态
    var _requesting = false;
    // 缓存是否有引导页需要展现
    var _hasGuideShow;
    // 要展现的引导页内容
    var _guideContent;
    // 是否当前正在轮询中
    var _isQuery = false;

    /**
     * 请求要自动展现的引导页内容
     */
    function requestGuideContent() {
        // 引导页内容没有成功请求过或者没有显示过，就重新请求
        if (_requested) {
            // 如果有引导页需要展现就展现
            if (_hasGuideShow) {
                showGuide();
            }
        }
        else if (!_requesting) {
            // 标识请求状态
            _requesting = true;
            // 引导页内容没有成功请求过，就重新请求
            var param = {
                onSuccess: loadGuideSuccess,
                callback: function() {
                    // 请求结束，将请求状态重置为false
                    _requesting = false;
                }
            }
            fbs.nikon.getIntroduction(param);
        }
    }

    /**
     * 请求引导页内容成功的回调
     * @param {Object} response
     */
    function loadGuideSuccess(response) {
        // 标识成功请求
        _requested = true;

        var data = response.data;

        // 缓存自动展现引导页信息
        _hasGuideShow = + data.isshow;
        _guideContent = data.introresitems || [];

        // 按优先级对要展现的引导页重排序，按优先级降序排序,优先级高的在最后面
        _guideContent.sort(function(ele1, ele2){
            return ele2.priority - ele1.priority;
        });

        // 展现引导页
        showGuide();
    }

    /**
     * 显示引导页
     */
    function showGuide() {
        if (!_hasGuideShow) {
            return;
        }

        // 暂时改成当前会话周期只允许出一个引导页
        var showing = false;
        for (var i = _guideContent.length; i --;) {
            showing = autoShow(_guideContent[i]);
            if (showing || _isQuery) { // 如果还在轮询中，不会跳过展现失败的高优先级引导页
                break;
            }
        }
        showing && (_hasGuideShow = false);
    }

    /**
     * 真正自动展现引导页的逻辑，如果展现成功，返回true，否则返回false
     * @param item
     * @return {boolean}
     */
    function autoShow(item) {
        // 判断当前是否有引导页，如果有，则不展现，这方法比较粗糙，暂时先这么做，毕竟同时出
        // 多个引导页需求比较少
        if ($('.ui-guide').length > 0) {
            return false;
        }

        var result = false;
        // 展现智能账户优化包引导页
        if (item.pkgid) {
            result = overview.AoPkgGuide.show(item.pkgid);
        }
        // 展现移动建站引导页
        else if (item.name === 'mobileintro') {
            result = showWirelessGuide(item.detail || {});
        }
        // 展现智能优化积分活动引导页,要求活动时间不过期
        else if (item.name === 'aopointactivityintro' &&
            !nirvana.auth.isAoPointActivityExpire()
            ) {
            result = showAoPointActivityGuide();
        }

        // 展现成功，向后端发送引导页展现过的请求
        if (result) {
            fbs.nikon.addIntroduction({ id: item.id });
        }
        return result;
    }

    /**
     * 展现智能账户优化活动积分活动引导页
     */
    function showAoPointActivityGuide() {
        var tplData = {
            activityHref: nirvana.auth.getAoPointActivityHref()
        };

        return showCustomGuide(
            'aoPointActivityGuideContent',
            tplData,
            'aoPointActivityGuide',
            {
                skin: 'aopoint-guide',
                content: ['ao_point_activity.png']
            }
        );
    }

    /**
     * 展现无线建站引导页
     */
    function showWirelessGuide(data) {
        var tplData = {
            industryname: data.industryname || '',
            industryStyle: data.industryname ? '' : ' hide',
            activityStyle: + data.activity ? '' : ' hide'
        };
        T.object.extend(tplData, data);

        return showCustomGuide(
            'wirelessGuideContent',
            tplData,
            'mobileGuide',
            {
                skin: 'wireless-guide',
                content: ['wireless.png']
            }
        );
    }

    /**
     * 展现除AO优化包引导页以外的定制引导页，如果展现成功，返回true
     * @param {string} tplName 要展现的引导页的内容的模板名称
     * @param {?Object} tplData 模板的数据
     * @param {string} guideId 引导页id，用于发送关闭和立即体验用
     * @param {Object} guideOption 创建ui.Guide实例的配置选项
     * @return {boolean}
     */
    function showCustomGuide(tplName, tplData, guideId, guideOption) {
        if ($('#AoPackageArea').length <= 0) {
            // 引导页只在概况页出
            return false;
        }

        // 初始化引导页配置选项
        var tpl = lib.tpl.parseTpl(tplData || {}, tplName, true);
        var options = {
            tpl: tpl,
            onClose: function() {
                // 发送关闭监控
                NIRVANA_LOG.send({
                    target: 'nikon_' + guideId + '_close'
                });
            },
            onTry: function() {
                // 发送点击“立即体验”按钮监控
                NIRVANA_LOG.send({
                    target: 'nikon_' + guideId + '_try'
                });
            }
        };

        T.object.extend(options, guideOption);

        // 创建引导页实例
        var guide = new ui.Guide(options);
        // 显示引导页
        guide.show();

        return true;
    }

    return {
        /**
         * 显示概况页引导页
         * @param {boolean} isQuery 当前要显示的引导页是否还在轮询中，若是，如果高优先级
         *                  引导页展现失败，不会跳过而展现低优先级的引导页，会等到轮询结束；
         *                  若不是轮询中，如果高优先级引导页展现失败，则会跳过而展现下一个
         *                  低优先级引导页。
         */
        show: function(isQuery) {
            _isQuery = isQuery;
            requestGuideContent();
        }
    };
}($$, baidu, fbs);