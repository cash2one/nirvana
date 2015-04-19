/**
 * @file src/nirvana/newManage/common/ManageView.js
    核心功能涅槃-推广管理页 界面通用展现类
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.newManage.ManageView = (function() {

    /**
     * 推广管理页 - 界面通用展现类
     * @constructor
     */
    function ManageView(options) {
        this.options = options || {};
        this.level = options.level || 'plan';
        this.init();
    }

    ManageView.prototype.init = function() {
        
    };

    ManageView.prototype.dispose = function() {
        
    };

    return ManageView;
})();