/**
 * 同类关键词浮层
 * 点击“试试其它同类关键词” 调用此对象
 *
 * @author zhujialu
 * @date 2012/6/11
 */
overview.similarWords = new er.Action({
    VIEW: 'similarWordsDialog',
    
    initTpl: function(list) {
        var tpl = lib.tpl,
            ret = '', words, obj;
        for (var i = 0, len = list.length, item; i < len; i++) {
            item = list[i];
            words = [];
            for (var j = 0, l = item.words.length; j < l; j++) {
                obj = {
                    id: item.words[j].winfoid,
                    word: item.words[j].showword,
                    text: getCutString(item.words[j].showword, 15, '...')
                };
                words.push( tpl.parseTpl(obj, 'similarWord', true) );
            }
            
            obj = {
                planname: item.planname,
                unitname: item.unitname,
                words: words.join('，')
            };
            
            ret += tpl.parseTpl(obj, 'similarWordsItem', true);
        }
        return tpl.parseTpl({ tbody: ret}, 'similarWordsTable', true);
    },

    onentercomplete: function() {
        var me = this,
            elem = $$('#similarWords')[0];

        elem.innerHTML += this.initTpl(this.arg.words);

        // 代理所有关键词的点击事件
        lib.delegate.init(elem, {
            selectWord: function(event) {
                var word = event.target.getAttribute('title');
                me.onclose();
                me.arg.onsubmit(word);
            }
        });
    }
    
});
