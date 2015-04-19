nirvana.krUtil = (function($) {

    var Keyword = fc.common.Keyword;

    // 获得计划和单元
    function getPlanUnit(data) {
        var planid, unitid;

        // 从 “添加关键词” 进来的
        if (data.isInNewFlow) {
            planid = data.planid;
            unitid = data.unitid;
        } else {
            // 物料
            var materials = data.queryMap && data.queryMap.importMaterials;
            if (materials 
                && materials.level == 'keyword' 
                && materials.data.length > 0 
                && materials.navLevel != 'account') {
                planid = materials.data[0].planid;
                unitid = materials.data[0].unitid;
            }
        }
        return {
            planid: planid || 0,
            unitid: unitid || 0
        }
    }

    /**
     * 通过带入的关键词获得planids
     */
    function getPlanidsByWords(words) {
        var ret = [];
        if (fc.isArray(words)) {
            fc.each(words, function(word, index) {
                var planid = word.planid;
                if (planid && (fc.inArray(planid, ret) === -1)) {
                    ret.push(planid);
                }
            });
        }
        return ret;
    }

    /******************************** 通过一组计划获取设备属性 ************************/
    /**
     * 如果计划的设备相同，返回该设备属性
     * 如果计划的设备不同，返回“全部设备
     */
    function getDeviceByPlans(plans) {
        var device;
        if (fc.isArray(plans) && plans.length > 0) {
            device = plans[0].deviceprefer;
            for (var i = 1, len = plans.length; i < len; i++) {
                var plan = plans[i];
                if (plan && plan.deviceprefer != device) {
                    // 返回“全部设备”
                    return 0;
                }
            }
        }
        return device;
    }

    /**************************************** 获得导入物料中的关键词 *************************/
    function getMaterials(data) {
        var res = (data.queryMap && data.queryMap.importMaterials) || {}, ret;
        if (res.level === 'keyword') {
            ret = res.data;
        }
        ret = ret || [];
        // 如果带入了搜索词
        if (typeof res.query === 'string') {
            ret.unshift({ showword: res.query });
        }
        // 去重
        return baidu.array.unique(ret, function(a, b) {
            return a.showword === b.showword;
        });
    }

    function getNewKeywords(data) {
        var res = (data.queryMap && data.queryMap.importMaterials) || {};
        if (res.newKeywords && res.newKeywords.length === 0) {
            delete res.newKeywords;
        }
        return res.newKeywords;
    }

    // ======================== 筛选逻辑，此文件最复杂的部分 ===================================
    // 先创建 5 个类，主要是想用prototype，避免每个对象都加一个function

    // 包含
    function Contain(obj) {
        for (var key in obj) {
            this[key] = obj[key];
        }
    }
    // 测试关键词数据
    Contain.prototype.test = function(wordData) {
        // 自定义
        if (this.type) {
            return wordData.word.indexOf(this.text) !== -1;
        } else {
            return fc.inArray(this.index, wordData.attr_index) !== -1;
        }
    };

    // 不包含
    function NotContain(obj) {
        for (var key in obj) {
            this[key] = obj[key];
        }
    }
    
    NotContain.prototype.test = function(wordData) {
        return wordData.word.indexOf(this.text) === -1;
    };

    // 展现理由
    function ShowReason(obj) {
        for (var key in obj) {
            this[key] = obj[key];
        }
    }

    ShowReason.prototype.test = function(wordData) {
        var me = this, ret = false;
        fc.each(wordData._attr, function(item) {
            if (ret = (item.field === me.field && item.text === me.text)) return false;
        });
        return ret;
    };

    // 业务点
    function BusinessPoint(obj) {
        for (var key in obj) {
            this[key] = obj[key];
        }
    }

    BusinessPoint.prototype.test = function(wordData) {
        var me = this, ret = false;
        fc.each(wordData._attr, function(item) {
            if (ret = (item.field === me.field && item.text === me.text)) return false;
        });
        return ret;
    };

    // 搜索量
    function SearchAmount(obj) {
        for (var key in obj) {
            this[key] = obj[key];
        }
    }

    SearchAmount.prototype.test = function(wordData) {
        var pv = wordData.pv, ret;
        switch (this.text) {
            case '<5':
                ret = pv < 5;
                break;
            case '5-99':
                ret = pv >= 5 && pv <= 99;
                break;
            case '100-20000':
                ret = pv >= 100 && pv <= 20000;
                break;
            case '>20000':
                ret = pv > 20000;
                break;
        }
        return ret;
    };

   
    // 格式化原始的筛选项数据，这样比较方便使用
    function formatFilterItems(filterItems, words) {
        if (!filterItems || !filterItems.length) return {};
        var Field = nirvana.krModules.FilterField;

        // copy一份，不想污染别的地方，比如缓存数据。。       
        filterItems = baidu.object.clone(filterItems);
        // 先完善数据，后端给的筛选数据不充分
        fillFilterItems(filterItems, Keyword.groups2Keywords(words));
        // 转成 map 比较好处理
        var map = filterDataToMap(filterItems);
        
        // 处理一下业务点，包括排序和截断
        if (map[Field.BUSINESS_POINT]) {
            setBusinessPoint(map[Field.BUSINESS_POINT]);
        }
        // 排序，把 [其他] 放最后
        sortFilterItems(map);
        // 封装对象，即用到上面那几个类
        wrapfilterData(map);
        
        // 最后整理一下顺序：包含-> 不包含 -> 展现理由 -> 业务点 -> 搜索量
        var order = [Field.CONTAIN, Field.NOT_CONTAIN, Field.SHOW_REASON, Field.BUSINESS_POINT, Field.SEARCH_AMOUNT],
            ret = {};

        fc.each(order, function(name) {
            ret[name] = map[name] || [];
        });

        return ret;
    }

    function sortFilterItems(data) {
        var FilterField = nirvana.krModules.FilterField, target;
        for (var key in data) {
            var items = data[key];
            target = fc.grep(items, function(item) { return item.text === '其他'; })[0];

            if (target) {
                var index = fc.inArray(target, items);
                if (key === FilterField.SHOW_REASON || key === FilterField.BUSINESS_POINT) {
                    items.push(target);
                    items.splice(index, 1);
                } else if (key === FilterField.CONTAIN) {
                    items.splice(index, 1);
                    items.splice(items.length - 1, 0, target);
                }
            }
        }
    }

    function fillFilterItems(filterItems, wordItems) {
        var Field = nirvana.krModules.FilterField;
        // 包含中的 自定义
        filterItems.push({
            field: Field.CONTAIN,
            text: '自定义',
            type: 1
        });

        // 不包含
        filterItems.push({
            field: Field.NOT_CONTAIN,
            text: '自定义',
            type: 1
        });

        // 搜索量需要前端加，后端没传。。
        var flag = [ false, false, false, false ];
        fc.each(wordItems, function(item) {
            item.randomID = fc.random();
            var pv = item.pv;
            if (!flag[0] && pv < 5) {
                flag[0] = '<5';
            } else if (!flag[1] && pv >= 5 && pv <= 99) {
                flag[1] = '5-99';
            } else if (!flag[2] && pv >= 100 && pv <= 20000) {
                flag[2] = '100-20000';
            } else if (!flag[3] && pv > 20000) {
                flag[3] = '>20000';
            }
        });

        fc.each(flag, function(item, index) {
            if (item) { filterItems.push({ field: Field.SEARCH_AMOUNT, text: item }); }
        });
    }

    /**
     * 筛选器原始数据格式如下：
     * [
     *   { field: '包含', text: '其他', icon: '', desc: '' },
     *   ...
     * ]
     * 
     * 为了使用方式，这里把它转成以下形式
     * {
     *   '包含': [
     *        { 
     *          field: '包含',
     *          text: '', 
     *          icon: '', 
     *          desc: '' , 
     *          index: '索引位，表格数据会引用到，所以这里加一下，比较方便',
     *          type: 一般都是0， 1表示自定义
     *          selected: true/false (是否已选中), 
     *          disabled: true/false (是否置灰)
     *        }, 
     *        ...
     *    ]
     *  }
     * 
     */
    function filterDataToMap(data) {
        // 先给每一项加索引, 并进行分类
        // bugfix：最新的修改是 data 某些元素可能是空的。。。。
        // 好吧，那么需要判断是否为空
        var map = {};
        fc.each(data, function(item, i) {
            if (!item) {
                return;
            }
            item.index = i;
            // 默认都是false
            item.selected = false;
            item.disabled = false;

            var arr = map[item.field];
            if (!arr) {
                arr = map[item.field] = [];
            }

            arr.push(item);
        });
        return map;
    }

    function setBusinessPoint(points) {
        points.sort(function(p1, p2) {
            if (p1.wordCount != p2.wordCount) {
                return p2.wordCount - p1.wordCount;
            } else {
                return p1.firstWordIndex - p2.firstWordIndex;
            }
        });
        fc.each(points, function(p) {
            p.desc = p.text;
        });
    }

    // 把筛选项数据封装成 Contain 等对象
    // 至于这里为什么不把 NotContain 归入 Contain？
    // 虽然看起来这两个是在一行显示
    // 但是这两个是不同类型的筛选条件，比如不存在互斥操作，
    // 也就是说勾选了某个包含项，同时也可以勾选不包含，
    // 而不是 包含 和 不包含 不能同时勾选
    function wrapfilterData(data) {
        var Field = nirvana.krModules.FilterField, ret = {};
        for (var key in data) {
            var arr = data[key];
            fc.each(arr, function(item, i) {
                var obj;
                switch (key) {
                    case Field.CONTAIN:
                        obj = new Contain(item);
                        break;
                    case Field.NOT_CONTAIN:
                        obj = new NotContain(item);
                        break;
                    case Field.SHOW_REASON:
                        obj = new ShowReason(item);
                        break;
                    case Field.BUSINESS_POINT:
                        obj = new BusinessPoint(item);
                        break;
                    case Field.SEARCH_AMOUNT:
                        obj = new SearchAmount(item);
                        break;
                }
                if (obj) {
                    arr.splice(i, 1, obj);
                }
            });
        }
    }

    // 通过 index 来找筛选项数据
    function getFilterItem(data, index) {
        for (var key in data) {
            var arr = fc.grep(data[key], function(item) { return item.index == index });
            if (arr.length > 0) {
                return arr[0];
            }
        }
    }

    // 获得选中的筛选项
    function getSelectedFilterItems(data) {
        var ret = [];
        for (var key in data) {
            var arr = fc.grep(data[key], function(item) { return item.selected });
            if (arr.length > 0) {
                ret.push(arr[0]);
            }
        }
        return ret;
    }

    // 筛选关键词。从 groups 中选出符合 filters 要求的数据
    function filterKeywordGroups(groups, filters) {
        var ret = [];
        // 筛选符合条件的关键词
        fc.each(groups, function(group) {
            var arr = fc.grep(group.resultitem, function(item) {
                var ret = true;
                fc.each(filters, function(filter) {
                    ret = filter.test(item);
                    if (!ret) return false;
                });
                return ret;
            });
            if (arr.length > 0) {
                ret.push({
                    grouprsn: group.grouprsn,
                    resultitem: arr
                });
            }
        });
        
        return ret;
    }

    // 选中一些筛选项可能会导致另一些筛选项不可选
    // 比如筛选结果里没有搜索量<5的数据，就需要置灰 <5 的筛选项
    function updateFilterItems(filterItems, selectedItems, groups) {
        var ret = [];
        for (var key in filterItems) {
            // 先删掉 key 所在分组内的选中项
            var selectedItem = fc.grep(filterItems[key], function(item) { return item.selected; })[0], index;
            if (selectedItem) {
                index = fc.inArray(selectedItem, selectedItems);
                selectedItems.splice(index, 1);
            }
            // 在缺少一项的情况下，测试 其余 items 是否置灰
            var keywords = Keyword.groups2Keywords(filterKeywordGroups(groups, selectedItems));
            fc.each(filterItems[key], function(item) {
                if (item.type || item === selectedItem) return;
                var disabled = fc.grep(keywords, function(keyword) { return item.test(keyword); }).length === 0;
                if (!!item.disabled !== disabled) {
                    ret.push(item);
                }
                item.disabled = disabled;
            })
            // 还回去
            if (selectedItem) {
                selectedItems.splice(index, 0, selectedItem);
            }
        }
        return ret;
    }

    // 通过 wordid 获取关键词
    function getKeywordsByIds(groups, wordids) {
        var list = Keyword.groups2Keywords(groups), ret = [];
        fc.each(wordids, function(id) {
            var words = fc.grep(list, function(item) { return item.wordid == id; });
            if (words.length > 0) {
                fc.push(ret, words);
            }
        });
        return ret;
    }

    function openAddWordsDialog(num, callback) {
    	var content;
        if (num > 0) {
            content = '由于数量限制，本次仅可添加<strong>' + num + '</strong>个关键词，请您确认是否继续。';
        } else {
            content = '您添加的关键词数量已经达到上限';
        }
        content += '<p class="gray">小提示：由于单次最多保存' + WORD_NUMBER_INPUT_MAX + '词，建议您先将结果分组，把内容相关，结构相似的关键词添入同一个单元</p>';
    
        ui.Dialog.confirm({
            title: '请您确认',
            content: content,
            forTool: true,
            onok: function() {
                if (num > 0) {
                    callback();
                }
            }
        });
    }

    /**
     * 标题 (xx) 部分需要统计出当前显示的数量
     */
    function formatGroupTitle(groups) {
        fc.each(groups, function(group) {
            if (group.grouprsn) {
                group.grouprsn = group.grouprsn.replace(/\(.*?\)/, function($0) {
                    return ' ( ' + group.resultitem.length + ' )';
                });
            }
        });
    }

    // 没有搜索结果的时的提示文本
    function getSearchTip(seedWords) {
        var tip = '';
                      
        if (seedWords && seedWords.length > 0) {
            tip += '非常抱歉，';
            tip += '<br/>暂时没有合适的结果。您可以选择以下我们认为适合您的关键词进行搜索，<ul class="seed_words">';
            
            seedWords = seedWords.slice(0, Math.min(5, seedWords.length));
            fc.each(seedWords, function(word, i) {
                var className = 'seed_word' + ((i === seedWords.length - 1) ? ' last_word' : '');
                tip += '<li class="' + className + '">' + word + '</li>';
            });
            tip += '</ul>';
            tip += '或者尝试输入URL。';
        } else {
            tip += '非常抱歉，'
            tip += '<br/>您输入的关键词暂时无法为您提供较好的结果。';
            tip += '<br/><strong>您可以尝试输入其他关键词或者您的URL。</strong>';
        }
        return tip;
    }

    // url 三轮检测 和后端保持一致
    var urlExpr1 = /^http[s]?[\u0000-\u00ff]+$/,
        urlExpr2 = /^(?:https?:\/\/)?(?:[-\w\.]+)\.(?:[a-z\.]{2,6})(?:[-\/\w \.]*)*\/?$/,
        urlExpr3 = /((25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)/;

    function isURL(query) {
        var ret = urlExpr1.test(query);
        if (!ret) {
            ret = urlExpr2.test(query);
            if (!ret) {
                ret = urlExpr3.test(query);
            }
        }
        return ret;
    }

    /**
     * 清除缓存
     */
    function clearCache() {
        // 清除种子词
		fbs.kr.getRecommSeed.clearCache();
        // 清除suggestion
        fbs.kr.suggestion.clearCache();
        // 清除关键词
        fbs.keyword.getList.clearCache();
    }

    return {
        getPlanUnit: getPlanUnit,
        formatFilterItems: formatFilterItems,
        getFilterItem: getFilterItem,
        getSelectedFilterItems: getSelectedFilterItems,
        updateFilterItems: updateFilterItems,

        filterKeywordGroups: filterKeywordGroups,
        getKeywordsByIds: getKeywordsByIds,

        getSearchTip: getSearchTip,

        getPlanidsByWords: getPlanidsByWords,
        getDeviceByPlans: getDeviceByPlans,
        getMaterials: getMaterials,
        getNewKeywords: getNewKeywords,
        openAddWordsDialog: openAddWordsDialog,

        formatGroupTitle: formatGroupTitle,

        isURL: isURL,
        clearCache: clearCache
    };

})($$);

