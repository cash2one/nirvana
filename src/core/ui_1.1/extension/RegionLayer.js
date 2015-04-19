/**
 * 选择地域的浮层
 * 注意是 layer 不是 dialog
 *
 * @class RegionLayer
 * @author: zhujialu
 * @update: 2012/8/7
 */
fc.ui.RegionLayer = function($) {

    var event = fc.event,
        Base = fc.ui.Base,
        Layer = fc.ui.Layer,
        Region = ui.Region;

    function RegionLayer(node, config) {
        this._super(node, { content: TPL, width: 450, hideByChild: true });

        this.regions = new Region({ mode: 'multi', checked: [] });
        this.regions.render($('.regions', this.node)[0]);

        // 全部地域 和 部分地域 切换按钮
        this.allRegionBtn = $('#allRegion')[0];
        this.partRegionBtn = $('#partRegion')[0];

        // 选中的地域
        this.selectedRegions = [];

        // 是否为全部地域
        this.isAll = false;
        this.hide();

        addEvents.call(this);
    }

    RegionLayer.prototype = {
        /**
         * 切换到全部地域
         */
        switchToAll: function() {
            this.isAll = true;
            this.allRegionBtn.checked = true;
            fc.hide(this.regions.main);
        },
        
        /**
         * 切换到部分地域
         */
        switchToPart: function() {
            this.isAll = false;
            this.partRegionBtn.checked = true;
            fc.show(this.regions.main);
        },

        /**
         * 设置选中某些地域
         */
        setRegions: function(regions) {
            this.selectedRegions = regions;
            // 先重置
            var checkboxs = $('input[type="checkbox"]', this.regions.main);
            fc.each(checkboxs, function(checkbox) {
                checkbox.checked = false;    
            });

            this.regions.checked = regions;
            this.regions.fillChecked();

            if (regions.length === fc.common.Region.SIZE) {
                this.switchToAll();
            } else {
                this.switchToPart();
            }
        },

        /**
         * 获得选中的地域（地域ID）
         * @return {Array}
         */
        getRegions: function() {
            if (this.isAll) {
                return fc.common.Region.IDS;
            } else {
                return this.regions.getCheckedRegion();
            }
        },
        
        dispose: function() {
            this.regions.dispose();
            removeEvents.call(this);
            this._super();
        }
    };

    RegionLayer = fc.ui.extend(Layer, RegionLayer);

    // =============================================================================================================

    var TPL = '<div class="region-layer-content">' +
                  '<h1>选择投放地域：</h1>' +
                  '<ul>' +
                        '<li class="field">' +
                            '<input type="radio" id="allRegion" class="key" name="region" value="0" checked="checked" />' +
                            '<label class="value" for="allRegion">全部地域</label>' +
                        '</li>' +
                        '<li class="field">' +
                            '<input type="radio" id="partRegion" class="key" name="region" value="1" />' +
                            '<label class="value" for="partRegion">部分地域</label>' +
                        '</li>' +
                   '</ul>' +
                   '<div class="regions"></div>' +
               '</div>';
    
    function addEvents() {
        event.click(this.allRegionBtn, this.switchToAll, this);
        event.click(this.partRegionBtn, this.switchToPart, this);
        event.on(this, Layer.EVENT_SUBMIT, submit, this);
        event.on(this, Base.EVENT_SHOW, show, this);
    }

    function removeEvents() {
        event.un(this.allRegionBtn, 'click', this.switchToAll);
        event.un(this.partRegionBtn, 'click', this.switchToPart);
    }

    // 确定后需要记住当前选择的地域
    function submit() {
        this.selectedRegions = this.getRegions();
    }

    // 显示后需要重置，比如用户勾选了一些地域，但是点了“取消”，再次打开需要重置
    function show() {
        this.setRegions(this.selectedRegions);
    }

    return RegionLayer;

}($$);
