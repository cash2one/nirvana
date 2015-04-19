/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/season/seasonPkgUtil.js
 * desc: 行业旺季包工具方法定义
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/05/13 $
 */
/**
 * 行业旺季包定义
 * @namespace nirvana.aoPkgControl
 */
nirvana.aoPkgControl.seasonPkgUtil = function ($, T, nirvana) {
    return {
        /**
         * 展开/收起视图事件处理
         */
        toggleView: function (target, view, collapseTxt, expandTxt, callback) {
            var action = target.getAttribute('act');
            var isCollapse = action === 'collapseView';

            target.setAttribute('act', isCollapse ? 'expandView' : 'collapseView');

            var btnTxtEle = $('.btn-txt', target)[0];
            btnTxtEle.innerHTML = isCollapse
                ? expandTxt || '展开'
                : collapseTxt || '收起';

            // 修改箭头样式
            var arrowUp = $('.season-pkg-arrow-up', target)[0];
            var arrowDown = $('.season-pkg-arrow-down', target)[0];
            var hideArrow = isCollapse ? arrowUp : arrowDown;
            var showArrow = isCollapse ? arrowDown : arrowUp;

            T.addClass(hideArrow, 'hide');
            T.removeClass(showArrow, 'hide');

            // 折叠/展开视图
            var toggle = isCollapse ? T.fx.collapse : T.fx.expand;
            toggle(view, {
                onafterfinish: function () {
                    callback && callback(isCollapse);
                }
            });
        }
    };
}($$, baidu, nirvana);