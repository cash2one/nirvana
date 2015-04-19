/**
 * 种子词和种子url交替显示
 */
nirvana.krModules.SeedPlayer = function($) {

    var config = nirvana.krConfig;

    function SeedPlayer(words, urls) {
        this.sug = fc.ui.get('krSuggestion');
        this.playable = words.length !== 0 || urls.length !== 0;
        // 打开提示层的URL数据
        this.words = words;
        this.urls = urls;

        if (!this.playable) {
            this.sug.placeholder(config.TEXT_INPUT_PLACEHOLDER);
            return;
        }
        // 有多个需要定时轮播
        // 当前显示第几个
        this.index = 0;
        this.data = buildData(slice(words), urls[0]);
        // 开始轮播
        this.play();
        addEvents.call(this);
    }

    SeedPlayer.prototype = {
        play: function() {
            if (!this.playable) return;

            this.pause();
            this.sug.placeholder(this.data[this.index]);
            
            var me = this;
            this.task = setTimeout(function() {
                me.index++;
                if (me.index === me.data.length) {
                    me.index = 0;
                }
                me.play();
            }, 4000);
        },
        pause: function() {
            if (this.task) {
                clearTimeout(this.task);
                this.task = null;
            }
        },
        openLayer: function() {
            var urls = this.urls;
            this.sug.open({
                header: TPL_TITLE, 
                data: fc.map(urls, function(url) { return { text: url, value: url }; }) 
            });
        },
        dispose: function() {
            this.pause();
            delete this.sug;
        }
    };

    var TPL_TITLE = '<div id="kr_seed_layer_title">您还可以用URL搜索关键词</div>';

    // 截最多50个数据项
    function slice(data) {
        var len = Math.min(data.length, 50);
        return data.slice(0, len);
    }

    // 创建轮显的数据，即 一个word，一个url 这样的顺序
    function buildData(words, url) {
        url = url || config.TEXT_DEFAULT_SEEDURL;

        // 因为这段循环是根据words来的，所以必须确保words至少有默认值
        if (words.length === 0) {
            words.push(config.TEXT_DEFAULT_SEEDWORD);
        }

        var ret = [];
        for (var i = 0, len = words.length * 2; i < len; i++) {
            var index = i % 2;
            if (index === 0) {
                ret.push(words[i / 2]);
            } else {
                ret.push(url);
            }
        }
        return ret;
    }

    function addEvents() {
        var me = this, onfocus = this.sug.onfocus;
        this.sug.onfocus = function() {
            if (typeof onfocus === 'function') {
                onfocus.call(this);
            }
            me.pause();
        };
    }

    return SeedPlayer;

}($$);
