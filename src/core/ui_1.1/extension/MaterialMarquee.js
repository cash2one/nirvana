/**
 * 带入词（物料）跑马灯
 *
 * 这个组件其实什么事都没做，就简单的继承了 Marquee，然后做了一些配置
 * 虽然这么简单，我觉得还是有必要做成组件，至少配置和样式是可以复用的
 *
 * 如果对默认设置有任何不爽，可以根据父类 Marquee 的配置说明进行修改
 *
 * 配置项如下：
 * {
 *    keywords: [],           显示的关键词
 *    firstPageable: true,    翻到第一页是否可继续往前翻（比如切到另一个跑马灯）
 *    firstTip: '',           可选。在 firstPageable 为 true 时，前翻按钮的 tip （一般用来引导用户翻页）
 *    lastPageable: true,     翻最后一页是否可继续往后翻（比如切到另一个跑马灯）
 *    lastTip: ''             可选。在 lastPageableTip 为 true 时，后翻按钮的 tip
 * }
 *
 * @class MaterialMarquee
 * @extend Marquee
 * @author zhujialu
 * @update 2012/10/25
 */
fc.ui.MaterialMarquee = function($) {

    var event = fc.event,
        Marquee = fc.ui.Marquee;

    function MaterialMarquee(node, config) {
        this._super(node, formatConfig(config));
        this.items(config.keywords);
        fc.addClass(this.node, 'fc-ui-materialmarquee');
    }

    MaterialMarquee = fc.ui.extend(Marquee, MaterialMarquee); 
    
    // ======================================================================================

    function getDefaultConfig() {
        return {
            labelText: '您选的词：',
            labelTip: '您从物料列表中选择的关键词',
            pageText: '翻页更多',
            pageSize: 5,
            maxWidth: 70
        };
    }
    
    function formatConfig(config) {
        var ret = getDefaultConfig();
        for (var key in config) {
            ret[key] = config[key];
        }
        return ret;
    }

    return MaterialMarquee;

}($$);
