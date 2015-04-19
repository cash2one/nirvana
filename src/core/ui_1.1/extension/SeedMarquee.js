/**
 * 种子词跑马灯
 *
 * 此跑马灯默认会自动翻页，翻页间隔为20 秒
 * 如果对这里的设置有任何不爽，可以根据父类 Marquee 的配置说明进行修改
 *
 * 配置项如下：
 * {
 *    keywords: [],   显示的关键词
 *    其他配置可参考 fc.ui.Marquee
 * }
 *
 * @class SeedMarquee
 * @extend Marquee
 * @author zhujialu
 * @update 2012/10/25
 */
fc.ui.SeedMarquee = function($) {

    var event = fc.event,
        Marquee = fc.ui.Marquee;

    function SeedMarquee(node, config) {
        this._super(node, formatConfig(config));
        this.items(config.keywords);
        fc.addClass(this.node, 'fc-ui-seedmarquee');
        addEvents.call(this);
    }

    SeedMarquee.prototype = {

        /**
         * 显示种子词跑马灯
         * @method show
         */
        show: function() {
            this.play();
            this._super();
        },

        /**
         * 隐藏种子词跑马灯
         * @method hide
         */
        hide: function() {
            this.stop();
            this._super();
        }
    };

    SeedMarquee = fc.ui.extend(Marquee, SeedMarquee); 
    
    // =========================================================================================================

    function getDefaultConfig() {
        return {
            labelText: '输入建议：',
            labelTip: '点击这些关键词，助您获取更多优秀的相关词',
            pageSize: 5,
            maxWidth: 90,
            autoPage: 20 * fc.SECOND
        };
    }
    
    function formatConfig(config) {
        var ret = getDefaultConfig();
        for (var key in config) {
            ret[key] = config[key];
        }
        return ret;
    }

    function addEvents() {
        if (this.config().autoPage) {
            event.mouseover(this.node, onMouseover, this);
            event.mouseout(this.node, onMouseout, this);
        }
    }

    function onMouseover(e) {
        if (isPauseableElement(e.target)) {
            this.stop();
        }
    }

    function onMouseout(e) {
        if (isPauseableElement(e.target)) {
            this.play();
        }
    }

    function isPauseableElement(elem) {
        return fc.inArray(elem.className, [
            Marquee.CSS_ITEM, 
            Marquee.CSS_BUTTON_PREV, 
            Marquee.CSS_BUTTON_NEXT,
            Marquee.CSS_BUTTON_PREV_DISABLE,
            Marquee.CSS_BUTTON_NEXT_DISABLE
        ]);
    }

    return SeedMarquee;

}($$);
