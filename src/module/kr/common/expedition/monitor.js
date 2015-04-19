/**
 * 远征监控
 */
fc.module.ExpeditionMonitor = function() {

    function getFilterAttr(attr) {
        var ret = '', map = {};
        // 把 attr 转成 map
        fc.each(attr, function(item) {
            var arr = map[item.field] || (map[item.field] = []);
            arr.push(item);
        });
        // 遍历 map
        for (var name in map) {
            ret += name + ':';
            fc.each(map[name], function(item) {
                ret += item.text + ',';
            });
            ret = ret.slice(0, -1) + ';';
        }
        return ret;
    }

    function log(param) {
        param.logid = param.logid != null ? param.logid : -1;
        NIRVANA_LOG.send(param);
    }
    
    return {
        request: function(param, query, region) {
            log({
                fn: 'query',
                logid: param.logid,
                krType: param.querytype,
                entry: param.entry,
                query: query,
                region: region,
                rgfilter: 1,
                krCol: 'word,pv'
            });
        },

        requestCompleted: function(param, query, size, attr, errorCode) {
            var obj = {
                fn: 'queryResponse',
                logid: param.logid,
                krType: param.querytype,
                entry: param.entry,
                query: query,
                totalNum: size,
                availableNum: size,
                filterAttr: getFilterAttr(attr)
            };
            if (errorCode == 1302) {
                obj.isForbidden = 1;
            } else if (errorCode == 1301) {
                obj.isTooFreq = 1;
            }
            log(obj);
        },

        openKR: function(param, query, hasResult) {
            log({
                fn: 'krLink',
                logid: param.logid,
                krType: param.querytype,
                query: query,
                entry: param.entry,
                from: param.entry,
                hasResult: hasResult ? 1 : 0
            });
        },

        saveKeywords: function(param, size, pattern) {
            log({
                fn: 'addWordSubmit',
                logid: param.logid,
                krType: param.querytype,
                entry: param.entry,
                count: size, 
                wMatch: pattern
            });
        }
    }
}();
