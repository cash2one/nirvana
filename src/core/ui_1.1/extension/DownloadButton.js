/**
 * 下载按钮, 点击按钮可以选择下载文件类型
 * 配置项如下:
 * {
 *    buttonText: '按钮文字',
 *    // 下载文件类型
 *    types: [
 *       { 
 *          text:  '',     描述文本，比如 => 文本文件(*.txt) 
 *          value: ''      扩展名，比如 => txt
 *       },
 *       ...
 *    ]
 * }
 * 本来想取名为 DownloadKeyword
 * 后来觉得也许有下载别的需求，这里就不定死了
 *
 * @author zhujialu
 * @update 2012/8/28
 */
fc.ui.DownloadButton = function($) {

    var event = fc.event, 
        Popup = fc.ui.Popup,
        AbstractButton = fc.ui.AbstractButton;

    function DownloadButton(node, config) {
        this._super(node, 'downloadbutton', formatConfig(config));
        addEvents.call(this);
    }

    DownloadButton.prototype = {
        // 点击文件类型时触发
        // 参数为下载类型，如 txt
        ondownload: null
    };

    DownloadButton = fc.ui.extend(Popup, DownloadButton);
   
    // =======================================================

    function formatConfig(config) {
        config.buttonConfig = { text: config.buttonText };
        config.listConfig = {
            header: '<h1>选择下载类型</h1>',
            data: config.types
        };
        return config;
    }

    function addEvents() {
        event.on(this.button, AbstractButton.EVENT_CLICK, this.toggle, this);
        event.on(this, Popup.EVENT_CLICK_ITEM, download, this);
    }

    function download(e) {
        if (typeof this.ondownload === 'function') {
            this.ondownload(e.value);
        }
    }

    return DownloadButton;

}($$);

/**
 * @param {Number} type 下载格式，注意类型是Number，1 表示 "txt" 2 表示 "csv"
 * @param {String} head 表头字面，如 "关键词字面,日均搜索量,展现理由"
 */
fc.ui.DownloadButton.downloadKeyword = function(words, type, head, isTciDownload) {
    var html = '<form action="tool/kr/keywordsdownload.do?userid=' + nirvana.env.USER_ID + '" method="post">' +
                    '<input type="hidden" name="words" value="' + words.join('>') + '" />' +
                    '<input type="hidden" name="type" value="' + type + '" />';
    if (head != null) {
        html += '<input type="hidden" name="headContent" value="' + head + '" />';
    }
    if (isTciDownload != null) {
        html += '<input type="hidden" name="isTciDownload" value="' + isTciDownload + '" />';
    }

    html += '</form>';

    var form = fc.create(html);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};
