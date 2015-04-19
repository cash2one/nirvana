/**
 * KR 的 tab
 * @author zhujialu
 * @update 2012/10/30
 */
nirvana.krModules.Tab = function($) {

    var event = fc.event, util = nirvana.krUtil;

    /**
     * 这里只做纯页面的交互，不做请求
     */
    function Tab() {
        this.actvTab = $('#krActv')[0];
        this.pasvTab = $('#krPasv')[0];

        addEvents.call(this);
    }

    Tab.prototype = {

        switchToActvTab: function() {
            fc.addClass(this.actvTab, Tab.CSS_ACTIVE_TAB);
            fc.removeClass(this.pasvTab, Tab.CSS_ACTIVE_TAB);
        },

        switchToPasvTab: function(hide) {
            fc.addClass(this.pasvTab, Tab.CSS_ACTIVE_TAB);
            fc.removeClass(this.actvTab, Tab.CSS_ACTIVE_TAB);
            if (hide) {
                baidu.fx.fadeOut(this.actvTab);
            }
        },

        dispose: function() {
            removeEvents.call(this);
            delete this.actvTab;
            delete this.pasvTab;
        }
    };

    Tab.CSS_ACTIVE_TAB = 'active_tab';

    function addEvents() {
        event.click(this.actvTab, clickActvTab, this);
        event.click(this.pasvTab, clickPasvTab, this);
    }

    function removeEvents() {
        event.un(this.actvTab, 'click', clickActvTab);
        event.un(this.pasvTab, 'click', clickPasvTab);
    }

    function clickActvTab(e) {
        if (!fc.hasClass(e.currentTarget, Tab.CSS_ACTIVE_TAB)) {
            event.fire(this, nirvana.KR.EVENT_ACTV);
        }
    }

    function clickPasvTab(e) {
        if (e.target && e.target.tagName === 'INPUT') return;
        if (!fc.hasClass(e.currentTarget, Tab.CSS_ACTIVE_TAB)) {
            event.fire(this, nirvana.KR.EVENT_SEARCH);
        }
    }

    return Tab;

}($$);
