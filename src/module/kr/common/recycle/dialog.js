/**
 * 回收站对话框
 */
fc.module.RecycleDialog = function($) {

    var event = fc.event,
        tpl = fc.tpl,
        Button = fc.ui.Button,
        Table = fc.ui.Table,
        Icon = fc.common.Icon,
        Factory = fc.common.Factory,
        Keyword = fc.common.Keyword,
        RecycleConfig = fc.module.RecycleConfig;

    function RecycleDialog() {
        /**
         * 还原关键词的wordid
         * @property {Array} restoredKeywords
         */
        this.restoredKeywords = [];

        /**
         * 回收站中的关键词数量
         * @property {Number} size
         */
        this.size = 0;
        
        var me = this;
        Keyword.getRecycleKeywords(function(keywords) {
            me.dialog = createDialog();
            me.dialog.onclose = function() {
                me.close();
            };
            me.node = me.dialog.getDOM();
            me.setSize(keywords.length);
            
            me.table = new Table($('.' + CSS_CONTENT + ' > div', me.node)[0], { emptyTip: TPL_EMPTY, columns: columns });
            me.table.render(keywords);

            me.closeBtn = new Button($('.' + CSS_FOOTER + ' > div', me.node)[0], { text: '关闭' });
            me.dialog.resizeHandler();            
            addEvents.call(me);
        });
    }

    RecycleDialog.prototype = {
        /**
         * 初始化 和 还原关键词 时需要改变数字
         */
        setSize: function(size) {
            this.size = size;

            var sizeNode = $('.' + CSS_SIZE, this.node)[0],
                tipNode = $('.' + CSS_TIP, this.node)[0];
            
            sizeNode.innerHTML = ' ( ' + size + ' )';
            tipNode.innerHTML = size < 250 ? TEXT_TIP : TEXT_NOTICE;

            if (size >= 250) {
                fc.addClass(tipNode, CSS_NOTICE);
            } else {
                fc.removeClass(tipNode, CSS_NOTICE);
            }

            if (typeof this.onchange === 'function') {
                this.onchange(size);
            }
        },

        /**
         * 还原关键词
         * @method restore
         * @param {Object} keyword
         */
        restore: function(keyword) {
            this.setSize(this.size - 1);
            if (typeof this.onrestore === 'function') {
                this.onrestore(keyword);
            }
        },
        
        /**
         * 关闭对话框
         * @method close
         */
        close: function() {
            removeEvents.call(this);            
            this.dialog.hide();
            this.dialog.dispose();

            fc.each(tasks, function(r) {
                r && clearTimeout(r);
            })
            tasks.length = 0;

            if (typeof this.onclose === 'function') {
                this.onclose();
            }
        },

        /**
         * 回收站数量变化时触发
         * @event onchange
         * @param {Number} size
         */
        onchange: null,

        /**
         * 还原关键词触发
         * @event onrestore
         * @param {Object} keyword 还原的关键词
         */
        onrestore: null,

        /**
         * 对话框关闭时触发
         * @event onclose
         */
        onclose: null
    };

    var CSS_SIZE = 'recycledialog-size',
        CSS_TIP = 'recycledialog-tip',
        CSS_NOTICE = 'recycledialog-notice',
        // 删除后的提示
        CSS_DELTIP = 'recycledialog-deltip',
        CSS_EMPTY = 'recycledialog-empty',

        CSS_HEADER = 'recycledialog-header',
        CSS_CONTENT = 'recycledialog-content',
        CSS_FOOTER = 'recycledialog-footer';

    var TEXT_EMTPY = '暂无被移除的关键词。<br/><br/>' + 
                     '您可以将展现结果中很不相关的关键词移除到回收站。<br/>' +
                     '我们将用来改进为您的服务。',
    
        TEXT_TIP = '被移除的词将不出现在相关词的结果列表中',

        TEXT_NOTICE = '请注意，回收区域为您保留最近300条结果',

        TEXT_DELTIP = '该词已还原，我们将继续为您展现此类词';

    var TPL = '<div class="recycledialog">' +
                  '<div class="' + CSS_HEADER + ' fc-clearfix">' +
                      '<h1>' + Icon.getIcon(Icon.RECYCLE) + '回收站</h1><span class="' + CSS_SIZE + '"></span>' +
                      '<span class="' + CSS_TIP + '"></span>' +
                  '</div>' +
                  '<div class="' + CSS_CONTENT + '">' +
                      '<div></div>' +
                  '</div>' +
                  '<div class="' + CSS_FOOTER + '">' +
                      '<div></div>' + 
                  '</div>' +
              '</div>',

        TPL_EMPTY = Factory.createCenterAlign(TEXT_EMTPY),

        TPL_KEYWORD = '<div class="keyword" title="{text}">{text}</div>{btn}',

        // 还原按钮
        TPL_RESTOREBTN = Icon.getIcon(Icon.RESTORE),

        TPL_RESTORE_TIP = '<div class="' + CSS_DELTIP + '">' + TEXT_DELTIP + '</div>';

    
    // 作为单例存在
    var tasks = [];
    
    // 表格列配置
    var columns = [
        {
            title: '关键字',
            content: function(item) {
                var text = baidu.encodeHTML(item.word || '');
                return tpl.parse({
                    text: text,
                    btn: TPL_RESTOREBTN
                }, TPL_KEYWORD);
            },
            field: 'word',
            sortable: true,
            style: {
                width: 300
            }
        },

        {
            title: '日均搜索量',
            content: lib.field.pageView('srchcnt'),
            field: 'srchcnt',
            type: 'number',
            sortable: true,
            style: {
                width: 100,
                'text-align': 'right'
            }
        },
        
        {
            title: '竞争激烈程度',
            content: lib.field.percentGraph('cmprate'),
            field: 'cmprate',
            type: 'number',
            sortable: true,
            style: {
                'text-align': 'right'
            }
        }
    ];

    function createDialog() {
        // 这里和原来的 Dialog 耦合了
        var dialog = new ui.util.create('Dialog', {
            id: 'recycleDialog',
            title: '回收站',
            width: 560,
            maskLevel: 100
        });
        dialog.show();
        dialog.setContent(TPL);
        return dialog;
    }

    function addEvents() {
        var me = this;
        // 只能这么覆盖掉, Dialog 以后一定要重写一个，受不了了
        this.dialog.getClose().onclick = 
        this.closeBtn.onclick = function() {
            me.close();
        };
        
        // 还原按钮
        event.on(this.table.node, '.fc_icon_restore', 'click', restore, this);
    }

    function removeEvents() {
        this.dialog.getClose().onclick = 
        this.closeBtn.onclick = null;

        event.un(this.table.node, 'click', restore);
    }

    function restore(e) {
        var target = e.target,
            data = this.table.getRow(target).row.data, 
            me = this;

        Keyword.restore({
            recyid : data.krrid,
            callback: function() {
                me.restoredKeywords.push(data.wordid);

                var table = me.table,
                    rowIndex = table.getRow(target).index;

                var tr = table.setRowContent(rowIndex, TPL_RESTORE_TIP),
                    isLast = me.size === 1; // 用闭包记住，如果用me.size 可能会在延时后发生错误

                tasks.push(setTimeout(function() {
                    // 因为可能在这期间删除了前面的行，导致行号发生改变
                    // 所以要重新取一次行号
                    table.deleteRow(table.getRow(tr).index);
                    if (isLast) {
                        table.tbody.innerHTML = TPL_EMPTY;
                    }
                }, RecycleConfig.TIP_TIME));
                
                me.restore(data);
            }
        });
    }

    return RecycleDialog;

}($$);
