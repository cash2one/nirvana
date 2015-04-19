/**
 * @file src/module/fuseSuggestion/bizUtility/cache.js 缓存处理
        还是不应该放在这里的，已经有了nirvana.bizUtil 在core/common/bizUtil.js
        但是其只能清空缓存，并鉴于其还会被使用，因此在这里声明“小流量”，以后覆盖
        小流量名字空间：nirvana.bizUtility
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */


nirvana.bizUtility = nirvana.bizUtility || {};

nirvana.bizUtility.cache = (function() {
    // @requires 输入

    // tangram => baidu
    // [core.service]fbs => fbs

    // 定义输出
    var exports = {};

    /**
     * 清空缓存，simple，这里只是提供了一个非常simple的方法
        具体映射到bizCommon中的缓存管理，在其中进行处理
     * @param {string=} level 层级 如果不传，则清空所有缓存
     * @param {Array=} idArr 清空的物料的id数组
     */
    exports.clear = function(level, idArr) {
        var isLinkedClear = isLinkedClear || false;
        if('undefined' === typeof level) {
            fbs.material.clearCache('ideainfo');
            fbs.material.clearCache('wordinfo');
            fbs.material.clearCache('unitinfo');
            fbs.material.clearCache('planinfo');
            return;
        }

        switch (level) {
            case 'plan':
                fbs.material.clearCache('planinfo');
                //单元、关键词、创意
                if(idArr) {
                    fbs.material.ModCache('unitinfo', 'planid', idArr, 'delete');
                    fbs.material.ModCache('wordinfo', 'planid', idArr, 'delete');
                    fbs.material.ModCache('ideainfo', 'planid', idArr, 'delete');
                }
                //附加创意缓存清除
                fbs.appendIdea.getAppendIdeaList.clearCache();
                // 关联的监控文件夹
                fbs.avatar.getMoniFolders.clearCache();
                if(idArr) {
                    fbs.avatar.getMoniWords.ModCache('planid', idArr, 'delete');
                }
                // 排行榜
                fbs.material.getTopData.clearCache();
                break;
            case 'unit':
                fbs.material.clearCache('unitinfo');
                // fbs.unit.getNameList.clearCache(); 这个是不是应该取消缓存呢
                //创意、关键词、文件夹详情、排行榜
                if(idArr) {
                    fbs.material.ModCache('wordinfo', 'unitid', idArr, 'delete');
                    fbs.material.ModCache('ideainfo', 'unitid', idArr, 'delete');
                    //附加创意缓存清除
                    fbs.appendIdea.getAppendIdeaList.ModCache('unitid', idArr, 'delete');
                }
                // 关联的监控文件夹
                fbs.avatar.getMoniFolders.clearCache();
                if(idArr) {
                    fbs.avatar.getMoniWords.ModCache('unitid', idArr, 'delete');
                }
                // 排行榜
                fbs.material.getTopData.clearCache();
                break;
            case 'word':
                fbs.material.clearCache('wordinfo');
                // fbs.keyword.getList.clearCache(); // 新增关键词时用到了
                break;
            case 'idea':
                fbs.material.clearCache('ideainfo');
                break;
            case 'avatar':
                fbs.avatar.getWinfoid2Folders.clearCache();
                fbs.avatar.getMoniFolders.clearCache();
                fbs.avatar.getMoniFolderCount.clearCache();
                fbs.avatar.getMoniWords.clearCache();
                break;
        }
    }

    return exports;
})();