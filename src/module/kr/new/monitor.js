/**
 * kr 监控文件
 * kr 所有监控行为都在这里统一处理
 */
nirvana.krMonitor = function() {
    
    var FilterField = nirvana.krModules.FilterField;
    
    // 触发推词
    function enter(param) {
        var obj = {
            target: 'kr_enter',
            kr_entrance: param.kr_entrance
        };
        log(obj);
    }

    // 触发推词
    function requestRecommendResult(param, logParam, seedWords, seedUrls) {
        var obj = {
            fn: 'query',
            logid: param.logid,
            entry: param.entry,
            krType: param.querytype,
            query: param.query,
            region: param.regions,
            rgfilter: param.rgfilter,
            isResearch: logParam.isResearch ? 0 : 1,
            krCol: logParam.krCol
        };
        if (logParam.seedType != null) {
            obj.seedType = logParam.seedType;
            if (logParam.seed) {
                obj.seed = logParam.seed;
            } else {
                obj.seed = logParam.seed = matchSeed(param.query, seedWords, seedUrls);
            }
        }
        if (logParam.suggestionType != null) {
            obj.suggestionType = logParam.suggestionType;
        }
        log(obj);
    }

    // 请求返回后
    function afterRequestRecommendResult(param, logParam) {
        var obj = {
            fn: 'queryResponse',
            logid: param.logid,
            entry: param.entry,
            krType: param.querytype,
            query: param.query,
            totalNum: logParam.totalNum,
            availableNum: logParam.availableNum,
            isForbidden: logParam.isForbidden,
            isTooFreq: logParam.isTooFreq,
            recReason: getRecReason(logParam.recReason)
        };
        if (param.querytype < 3) {
            obj.recType = param.querytype;
        }
        if (logParam.seedType != null) {
            obj.seedType = logParam.seedType;
            obj.seed = logParam.seed;
        }
        if (logParam.suggestionType != null) {
            obj.suggestionType = logParam.suggestionType;
        }
        // 拼装一下筛选项
        var filters = logParam.filterAttr, attr = '';
        for (var name in filters) {
            if (name === FilterField.SEARCH_AMOUNT || name === FilterField.NOT_CONTAIN) continue;
            var items = filters[name];
            attr += name + ':';
            for (var i = 0, len = items.length; i < len; i++) {
                if (items[i].type) continue; // 过滤掉 自定义
                attr += items[i].text;
                attr += (i < len - 1) ? ',' : ';';
            }
        }
        obj.filterAttr = attr;
        
        log(obj);
    }

    // 添加单个关键词
    function addOneWord(param, logParam, sortType, sortOrder, word, 
                        wordSeq, type1Reason, recReason, attrList, filterList) {
        var obj = {
            fn: 'addWord',
            logid: param.logid,
            entry: param.entry,
            krType: param.querytype,
            query: param.query,
            sortType: sortType,
            sortOrder: sortOrder,
            wordSeq: wordSeq,
            wordid: word.wordid,
            wordText: word.word,
            pv: word.pv,
            kwc: word.kwc,
            pv_trend_month: word.pv_trend_month,
            type1Reason: type1Reason,
            recReason: getRecReason(recReason),
            attrList: getAttrList(attrList),
            filterList: getAttrList(filterList)
        };
        if (logParam.seedType != null) {
            obj.seedType = logParam.seedType;
            obj.seed = logParam.seed;
        }
        log(obj);
    }

    // 添加全部关键词
    function addWords(param, logParam, sortType, sortOrder, words, filterList) {
        var obj = {
            fn: 'addWordBatch',
            logid: param.logid,
            entry: param.entry,
            krType: param.querytype,
            query: param.query,
            sortType: sortType,
            sortOrder: sortOrder,
            wordid: fc.map(words, function(word) { return word.wordid; }).join(','),
            filterList: getAttrList(filterList)
        };
        if (logParam.seedType != null) {
            obj.seedType = logParam.seedType;
            obj.seed = logParam.seed;
        }
        log(obj);
    }

    // 下载关键词
    function downloadWords(param, logParam, type, words, filterList) {
        var obj = {
            fn: 'downloadWord',
            logid: param.logid,
            entry: param.entry,
            krType: param.querytype,
            query: param.query,
            downloadType: type,
            wordid: fc.map(words, function(word) { return word.wordid; }).join(','),
            filterList: getAttrList(filterList)
        };
        if (logParam.seedType != null) {
            obj.seedType = logParam.seedType;
            obj.seed = logParam.seed;
        }
        log(obj);
    }
    
    // 点击金手指
    function goldFinger(param, logParam, word, wordSeq) {
        var obj = {
            fn: 'goldenFinger',
            logid: param.logid,
            entry: param.entry,
            krType: param.querytype,
            query: param.query,
            wordid: word.wordid,
            wordSeq: wordSeq,
            wordText: word.word
        };
        if (logParam.seedType != null) {
            obj.seedType = logParam.seedType;
            obj.seed = logParam.seed;
        }
        log(obj);
    }

    // 点击回收站图标删除关键词
    function deleteWord(param, logParam, word, wordSeq) {
        var obj = {
            fn: 'pushWordToRecycle',
            logid: param.logid,
            entry: param.entry,
            krType: param.querytype,
            query: param.query,
            wordid: word.wordid,
            wordSeq: wordSeq,
            wordText: word.word
        };
        if (logParam.seedType != null) {
            obj.seedType = logParam.seedType;
            obj.seed = logParam.seed;
        }
        log(obj);
    }

    function restoreWord(entry, word) {
        log({
            fn: 'popKeyword',
            logid: word.krlogid,
            entry: entry,
            recyid: word.krrid,
            wordid: word.wordid,
            wordText: word.word,
            krType: -1
        });
    }

    // 修改地域
    function modifyRegion(param, region) {
        var obj = {
            fn: 'modRegion',
            logid: param.logid,
            entry: param.entry,
            krType: param.querytype,
            origRegion: param.regions,
            nowRegion: region
        };
        log(obj);
    }

    // 修改高级设置
    function modifyAdvance(param, rgfilter) {
        var obj = {
            fn: 'modAdvance',
            logid: param.logid,
            entry: param.entry,
            krType: param.querytype,
            origSet: param.rgfilter,
            nowSet: rgfilter
        };
        log(obj);
    }

    // 修改筛选项
    function modifyFilter(param, filter, expand) {
        var obj = {
            fn: 'modFilter',
            logid: param.logid,
            entry: param.entry,
            krType: param.querytype,
            modType: filter.selected ? 'on' : 'off',
            field: filter.field,
            attr: filter.text
        };
        obj.expand = expand ? 0 : 1;
        log(obj);
    }

    // 保存关键词
    function saveWord(param, count, wMatch) {
        var obj = {
            fn: 'addWordSubmit',
            logid: param.logid,
            entry: param.entry,
            krType: param.querytype,
            count: count,
            wMatch: wMatch
        };
        log(obj);
    }

    // 补流量
    function addTraffic(param, keywords, clickSubmit, noRemind) {
        var obj = {
            fn: 'supplement',
            logid: param.logid,
            entry: param.entry,
            opttype: (clickSubmit ? '1' : '2') + (noRemind ? ',3' : ''),
            wordid: fc.map(keywords, function(word) { return word.wordid; }).join(','),
            wordText: fc.map(keywords, function(word) { return word.word; }).join(',')
        };
        log(obj);
    }

    function suggest(param, wordid, lineNum) {
        var obj = {
            fn: 'suggestion',
            logid: param.logid,
            entry: param.entry,
            krType: param.querytype,
            query: param.query,
            wordid: wordid,
            lineNum: lineNum
        };
        log(obj);
    }

    function log(param) {
        if (param.region) {
            param.region = getRegions(param.region);
        }
        if (param.origRegion) {
            param.origRegion = getRegions(param.origRegion);
        }
        if (param.nowRegion) {
            param.nowRegion = getRegions(param.nowRegion);
        }
        NIRVANA_LOG.send(param);
    }

    function matchSeed(query, seedWords, seedUrls) {
        var ret = '';
        if (seedWords && fc.grep(seedWords, function(word) { return query === word; })[0]) {
            ret = 'word';
        } else if (seedUrls && fc.grep(seedUrls, function(url) { return query === url; })[0]) {
            ret = 'url';
        }
        return ret;
    }

    function getRegions(regions) {
        return (regions.length === fc.common.Region.SIZE) ? '0' : regions.join(',');
    }

    var reasonMap = {
        '百度相关搜索': 1,
        '黑马': 2,
        '潜在客户': 3,
        '同行动态': 4,
        '我的选择': 5,
        '搜索建议词': 6,
        '网页相关词': 7
    };

    function getRecReason(recReason) {
        var ret = [];
        fc.each(recReason, function(reason) {
            if (reasonMap[reason] != null) {
                ret.push(reasonMap[reason]);
            }
        });
        return ret.join(',');
    }

    function getAttrList(attr) {
        var ret = [];
        fc.each(attr, function(item) {
            ret.push(item.field + ':' + item.text);
        });
        return ret.join(';');
    }
    
    //以下为自动分组监控
    function autoUnitClickEditPlan(param) {
        var obj = {
            target: 'auclick_editplan',
            groupid: param.groupid
        };
        log(obj);
    }
    
    function autoUnitSaveToExist(param) {
        var obj = {
            target: 'au_savegrouptoexist',
            groupid: param.groupid
        };
        log(obj);
    }
    
    function autoUnitSaveToNew(param) {
        var obj = {
            target: 'au_savegrouptonew',
            groupid: param.groupid,
            oldplanname: param.oldplanname,
            oldunitname: param.oldunitname,
            newplanname: param.newplanname,
            newunitname: param.newunitname,
            oldplanid: param.oldplanid,
            oldunitid: param.oldunitid
        };
        log(obj);
    }
    
    function autoUnitDeleteWord(param) {
        var obj = {
            target: 'au_deleteword',
            groupid: param.groupid,
            word: param.word,
            planid: param.planid,
            unitid: param.unitid,
            planname: param.planname,
            unitname: param.unitname
        };
        log(obj);
    }
    
    function autoUnitTransferWord(param) {
        var obj = {
            target: 'au_transferword',
            word: param.word,
            fromgroupid: param.fromgroupid,
            fromplanname: param.fromplanname,
            fromunitname: param.fromunitname,
            fromplanid: param.fromplanid,
            fromunitid: param.fromunitid,
            togroupid: param.togroupid,
            toplanname: param.toplanname,
            tounitname: param.tounitname,
            toplanid: param.toplanid,
            tounitid: param.tounitid,
            isadd: param.isadd
        };
        log(obj);
    }
    
    function autoUnitEnter() {
        var obj = {
            target: 'au_enter'
        };
        log(obj);
    }
    /*
     * @param {object}
     * type {boolean} 是否强制保存
     */
    function autoUnitForceSave(param) {
        var obj = {
            target: 'au_forcesave',
            type: param.type
        };
        log(obj);
    }
    
    function autoUnitResetKR() {
        var obj = {
            target: 'au_resetkr'
        };
        log(obj);
    }


    return {
        enter: enter,
        requestRecommendResult: requestRecommendResult,
        afterRequestRecommendResult: afterRequestRecommendResult,
        addOneWord: addOneWord,
        addWords: addWords,
        downloadWords: downloadWords,
        goldFinger: goldFinger,
        deleteWord: deleteWord,
        restoreWord: restoreWord,
        modifyRegion: modifyRegion,
        modifyAdvance: modifyAdvance,
        modifyFilter: modifyFilter,
        saveWord: saveWord,
        addTraffic: addTraffic,
        suggest: suggest,
        autoUnitClickEditPlan: autoUnitClickEditPlan,
        autoUnitSaveToExist: autoUnitSaveToExist,
        autoUnitSaveToNew: autoUnitSaveToNew,
        autoUnitDeleteWord: autoUnitDeleteWord,
        autoUnitTransferWord: autoUnitTransferWord,
        autoUnitEnter: autoUnitEnter,
        autoUnitForceSave: autoUnitForceSave,
        autoUnitResetKR: autoUnitResetKR
    };

}();
