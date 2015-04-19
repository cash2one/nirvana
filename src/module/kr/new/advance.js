/**
 * 高级设置
 * 这里的浮层太简单，就不单独创建一个文件了
 */
nirvana.krModules.Advance = function($) {

    var event = fc.event,
        Layer = fc.ui.Layer;
    
    function Advance() {
        this.toggleBtn = $('.advance .text')[0];
        this.layer = new Layer($('#krAdvanceLayer')[0], { content: lib.tpl.getTpl('krAdvanceLayer') });

        // 是否设置过
        this.setted = false;

        addEvents.call(this);
    }

    Advance.prototype = {
        dispose: function() {
            removeEvents.call(this);
            this.layer.dispose();
            delete this.toggleBtn;
        }
    };
    
    function addEvents() {
        event.click(this.toggleBtn, toggle, this);

        var me = this;
        this.layer.onsubmit = function() {
            submit.call(me);
        };
        this.layer.onclose = this.layer.oncancel = function() {
            me.layer.hide();
        };
    }

    function removeEvents() {
        event.un(this.toggleBtn, 'click', toggle);
    }

    function toggle() {
        this.layer.visible ? this.layer.hide() : openLayer.call(this);
    }

    function openLayer() {
        this.layer.show();
        $('#showRegionWords')[0].checked = this.setted;
    }

    function submit() {
        var setted = $('#showRegionWords')[0].checked;

        this.toggleBtn.innerHTML = setted ? '已设置' : '还未设置';
        this.toggleBtn.title = setted ? '显示地域拓展词' : '';

        this.layer.hide();

        if (setted !== this.setted) {
            fc.toggleClass(this.toggleBtn, 'setted');
            this.setted = setted;

            event.fire(this, {
                type: nirvana.KR.EVENT_REFRESH,
                rgfilter: setted ? 0 : 1
            });
        }
    }

    return Advance;

}($$);
