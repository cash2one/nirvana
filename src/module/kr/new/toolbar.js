/**
 * KR 工具栏
 * 包括三个按钮：添加全部 下载全部关键词  自定义列
 * @author zhujialu
 * @update 2012/8/21
 */
nirvana.krModules.Toolbar = function($) {
    
    var event = fc.event,
        Button = fc.ui.Button,
        DownloadButton = fc.ui.DownloadButton,
        CustomColumn = fc.ui.CustomColumn;

    function Toolbar() {
        this.addWords = new Button($('#krAddWordsBtn')[0]);
        this.downloadWords = new DownloadButton($('#krDownloadWordsBtn')[0], { types: [
            { text: '文本文件 ( *.txt )', value: 'txt' },
            { text: 'Excel文件 ( *.csv )', value: 'csv' }
        ]});
        this.customColumns = new CustomColumn($('#krCustomColumns')[0], CustomColumn.KR);

        this.updateSize(0);
        addEvents.call(this);
    }
    
    Toolbar.prototype = {
        disable: function(b) {
            this.addWords.disable(b);
            this.downloadWords.disable(b);
            this.customColumns.disable(b);
        },
        updateSize: function(size) {
            var sizeText = '<span class="word_size">( ' + size + ' )</span>';
            this.addWords.text('添加全部 ' + sizeText);
            this.downloadWords.text('下载全部 ' + sizeText);
            
            this.disable(size === 0);
        },
        dispose: function() {
            this.addWords.dispose();
            this.downloadWords.dispose();
            this.customColumns.dispose();
        }
    };

    function addEvents() {
        var me = this;

        this.addWords.onclick = function() {
            event.fire(me, nirvana.KR.EVENT_ADD_WORDS_TOBOX);
        };

        this.downloadWords.ondownload = function(type) {
            event.fire(me, {
                type: nirvana.KR.EVENT_DOWNLOAD_KEYWORD,
                fileType: type
            });
        };

        this.customColumns.onsubmit = function(columns) {
            event.fire(me, {
                type: nirvana.KR.EVENT_CHANGE_COLUMN,
                columns: columns
            });
        };
    }

    return Toolbar;
}($$);
