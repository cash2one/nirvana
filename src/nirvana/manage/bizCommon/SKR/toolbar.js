/**
 * 工具栏
 * 默认包括个按钮：添加全部
 */
nirvana.skrModules.Toolbar = function($) {
    
    var event = fc.event,
        Button = fc.ui.Button;

    function Toolbar() {
        this.addWords = new Button($('#krAddWordsBtn')[0]);

        this.updateSize(0);
        addEvents.call(this);
    }
    
    Toolbar.prototype = {
        disable: function(b) {
            this.addWords.disable(b);
        },
        updateSize: function(size) {
            var sizeText = '<span class="word_size">( ' + size + ' )</span>';
            this.addWords.text('添加全部 ' + sizeText);
            
            this.disable(size === 0);
        },
        dispose: function() {
            this.addWords.dispose();
        }
    };

    function addEvents() {
        var me = this;

        this.addWords.onclick = function() {
            event.fire(me, nirvana.KRCore.EVENT_ADD_WORDS_TOBOX);
        };
    }

    return Toolbar;
}($$);
