/**
 * 远征嵌入式模块
 * 主要嵌入到Dialog，作为其中的一个组成部分
 * 
 * 设计此模块时的场景如下：
 * 1. 添加一批词后，后端根据这批词拓展出一批新词，放在本模块显示，用户可再次保存新词
 * 2. 一次性使用，不存在刷新数据的需求
 * 
 * 需要注意一下，因为本模块使用了计划单元选择器
 * 但是 UE 没有把“保存”按钮划入本模块，为了实现完整的计划单元选择器功能
 * 本模块会把“保存”按钮抽离到 this.saveBtn 属性中(抽离文档树)
 * 外部可以把它 appendChild 到合适的位置
 * 
 * 还有，显示错误信息的元素是被设计在远征模块中了
 * 但是 UE 也没把它在视觉上划入本模块，因此我们把 errorNode 对外公布
 * 外部可以把它 appendChild 到合适的位置
 *
 * 配置项如下：
 * {
 *   entry: ''  入口,
 *   planid: '',                                    计划ID，设置后，默认会选中该计划
 *   unitid: '',                                    单元ID，设置 planid 和 unitid 后，默认会选中该计划单元
 *   callback: function(keywordsText, keywordsObj), 推词请求返回后的回调
 *   onSuccess: function(json),                     关键词保存成功的回调
 *   onFail: function(error)                        关键词保存失败的回调
 * }
 *
 * @class EmbedExpedition
 * @author zhujialu
 * @update 2012/10/19
 */
fc.module.EmbedExpedition = function($) {
    
    var Expedition = fc.module.Expedition,
        Table = fc.ui.Table;

    function EmbedExpedition(node, config) {
        initExpedition.call(this, node, config);

        // 原谅我吧，嵌套太多组件了。。。
        var saveBtn = this.expe.selector.save.node;

        /**
         * 保存按钮组件
         * @property {HTMLElement} saveBtn
         */
        this.saveBtn = saveBtn.parentNode.removeChild(saveBtn);

        /**
         * 显示错误的元素
         * @property {HTMLElement} errorNode
         */
        this.errorNode = this.expe.errorNode;
    }

    EmbedExpedition.prototype = {

        /**
         * 请求远征数据
         * @method load
         * @param {Array} keywords 添加的关键词字面的数组，如['keyword1', 'keyword2', ...]
         * @param {String} regions 地域数字的字面，以逗号分隔，如'1,2,3'
         */
        load: function(keywords, regions) {
            if (keywords.length > 100) {
                keywords = keywords.slice(0, 100);
            }

            this.expe.load(keywords.join('>'), regions);
        },
        
        /**
         * 释放内存
         * @method dispose
         */
        dispose: function() {
            this.expe.dispose();
        }
    };

    EmbedExpedition.CSS_MODULE = 'module-embedexpedition';

    function initExpedition(node, config) {
        var me = this;

        config.querytype = 6;
        config.hideMore = true;
        config.callback = function(keywords) {
            if (keywords.length === 0) {
                me.dispose();
            }
        };
        
        this.expe = new Expedition(node, config);
        this.expe.render = function(keywords) {
            var contentNode = $('.' + Expedition.CSS_CONTENT, this.node)[0],
                table = new Table(contentNode, Expedition.CONFIG_TABLE);
            table.render(keywords);
            this.columns.push(table);
            this.setSelectedSize(0);
        };

        node = this.expe.node;
        fc.addClass(node, EmbedExpedition.CSS_MODULE);     
        // 修改 header
        $('.' + Expedition.CSS_HEADER, node)[0].innerHTML = '您还可以添加以下关键词';
    }

    return EmbedExpedition;

}($$);
