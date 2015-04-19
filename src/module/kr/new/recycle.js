/**
 * 回收站
 * @author zhujialu
 */
nirvana.krModules.Recycle = function($) {
    
    var event = fc.event,
        Keyword = fc.common.Keyword,
        RecycleDialog = fc.module.RecycleDialog,
        RecycleConfig = fc.module.RecycleConfig;

    function Recycle() {
        this.btn = $('.krOptions .recycle')[0];
        this.size = 0;

        var me = this;
        // 请求回收站中的数量
        Keyword.getRecycleSize(function(size) {
            me.setSize(size);
        });

        addEvents.call(this);
    }

    Recycle.prototype = {

        // 往回收站添加一个关键词
        addKeyword: function() {
            this.setSize(this.size + 1);
        },

        // 从回收站删除一个关键词
        removeKeyword: function() {
            this.setSize(this.size - 1);
        },
        /**
         * 设置按钮上的数字，即 回收站（数字）
         */
        setSize: function(size) {
            this.size = size;
            $('em', this.btn)[0].innerHTML = '( ' + size + ' )';
        },

        // 打开回收站对话框
        openDialog: function() {
            var dialog = new RecycleDialog(), me = this;
            dialog.onchange = function(size) {
                me.setSize(size);
            };
            dialog.onrestore = function(keyword) {
                event.fire(me, {
                    type: nirvana.KR.EVENT_RESTORE_KEYWORD,
                    keyword: keyword
                });
            };
            dialog.onclose = function() {
                var words = this.restoredKeywords;
                event.fire(me, {
                    type: nirvana.KR.EVENT_CLOSE_RECYCLE_DIALOG,
                    words: words
                });
            };
        },

        dispose: function() {
            removeEvents.call(this);
            delete this.btn;
        }
    };

    function addEvents() {
        event.click(this.btn, this.openDialog, this);
        // 在推荐结果中会点击这种按钮
        event.on($('#kr')[0], '.' + RecycleConfig.CSS_RECYCLE_DIALOG_BUTTON, 'click', this.openDialog, this);    
    }

    function removeEvents() {
        event.un(this.btn, 'click', this.openDialog);
        event.un($('#kr')[0], 'click', this.openDialog);   
    }

    return Recycle;

}($$);
