/**
 * 种子词 和 物料跑马灯
 * 主要逻辑是 请求种子词，返回后根据传入的物料创建跑马灯，以及两个跑马灯的切换（如果有两个）
 * @author zhujialu
 * @update 2012/10/31
 */
nirvana.krModules.Marquee = function($) {

    var event = fc.event,
        SeedMarquee = fc.ui.SeedMarquee,
        MaterialMarquee = fc.ui.MaterialMarquee;

    /**
     * seed 结构如下( 就是种子词接口返回的数据结构 )：
     * [
     *   '关键词1', '关键词2', ....
     * ]
     *
     * material 结构如下：
     * [
     *   { showword: '关键词1' }, { showword: '关键词2' }
     * ]
     *
     */
    function Marquee(seed, material) {
        // 种子词跑马灯的配置
        this.seedConfig = { keywords: seed };
        // 物料跑马灯的配置
        this.materialConfig = { keywords: material, field: 'showword' };
        // 如果要创建两个，需要配置切换
        if (seed.length > 0 && material.length > 0) {
            this.seedConfig.firstPageable = this.materialConfig.lastPageable = true;
            this.seedConfig.firstTip = '查看选中对象';
            this.materialConfig.lastTip = '查看种子词';
        }
        initUI.call(this);
        addEvents.call(this);
    }

    Marquee.prototype = {
        dispose: function() {
            this.seedMarquee && this.seedMarquee.dispose();
            this.materialMarquee && this.materialMarquee.dispose();
        }
    };

    function initUI() {
        if (this.seedConfig.keywords.length > 0) {
            this.seedMarquee = new SeedMarquee($('#krSeedMarquee')[0], this.seedConfig);
        }
        if (this.materialConfig.keywords.length > 0) {
            // 同时只能显示一个，优先显示物料
            if (this.seedMarquee) this.seedMarquee.hide();
            this.materialMarquee = new MaterialMarquee($('#krMaterialMarquee')[0], this.materialConfig);
        }
    }

    function addEvents() {
        var me = this, seedMarquee = this.seedMarquee, materialMarquee = this.materialMarquee;
        if (seedMarquee) {
            seedMarquee.onclick = function(keyword) {
                event.fire(me, {
                    type: nirvana.KR.EVENT_SEARCH,
                    query: keyword,
                    seed: 'word',
                    seedType: 0
                });
            };
        }
        if (materialMarquee) {
            materialMarquee.onclick = function(keyword) {
                event.fire(me, {
                    type: nirvana.KR.EVENT_SEARCH,
                    query: keyword.showword
                });
            };
        }
        // 实现两个跑马灯的切换
        if (seedMarquee && materialMarquee) {
            // 监听两个特殊的翻页( 这里差点就命名空间冲突了，只能全称了 )
            event.on(seedMarquee, fc.ui.Marquee.EVENT_PAGE_FIRST, switchToMaterialMarquee, this);
            event.on(materialMarquee, fc.ui.Marquee.EVENT_PAGE_LAST, switchToSeedMarquee, this);
        }
    }

    function switchToMaterialMarquee() {
        this.seedMarquee.hide();
        this.materialMarquee.show();
    }

    function switchToSeedMarquee() {
        this.seedMarquee.show();
        this.materialMarquee.hide();
    }

    return Marquee;

}($$);
