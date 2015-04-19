/**
 * @file src/core/bizCommon/acc/common/EntranceProcessor.js 模块/方法入口处理类 
    以后升级了，直接写个新的类替换
 * @author Leo Wang(wangkemiao@baidu.com)
 * @date 2013/5/24
 * @version 1.0
 */

nirvana.acc.EntranceProcessor = (function() {
    function EntranceProcessor(options) {
        if(options) {
            this.config = options.config;
            this.modName = options.modName;
        }
    }

    /**
     * 处理入口
        现在只能是简陋版本，直接进行处理
     */
    EntranceProcessor.prototype.process = function() {
        if(!this.config) {
            return;
        }
        var methodConf;
        var methodName;
        for(methodName in this.config) {
            methodConf = this.config[methodName];

        }
    };

    return EntranceProcessor;
})();