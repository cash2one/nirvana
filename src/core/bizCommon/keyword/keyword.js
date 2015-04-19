/**
 * 关键词相关的通用逻辑
 * @author zhujialu
 */
fc.common.Keyword = function() {

    // 关键词转成短语匹配格式
    function tophraseMatch(words) {
        for (var i = 0, len = words.length; i < len; i++) {
            words[i] = '"' + words[i] + '"';
        }
    }

    // 关键词转成精确匹配格式
    function toAccurateMatch(words) {
        for (var i = 0, len = words.length; i < len; i++) {
            words[i] = '[' + words[i] + ']';
        }
    }

    // 修正参数
    var defaultParam = {
        logid: -1,
        planid: 0,
        unitid: 0,
        rgfilter: 1
    };

    function formatParam(param, necessary) {
        fc.each(necessary, function(name) {
            if (param[name] == null) {
                param[name] = defaultParam[name];
            }
        });
        if (fc.isArray(param.regions)) {
            param.regions = (param.regions.length === fc.common.Region.SIZE) ? '0' : param.regions.join(',');
        }
    }

    // 为关键词对象加上对应的筛选项字面
    function formatAttr(attrs, groups, callback) {
        fc.each(groups, function(group) {
            fc.each(group.resultitem, function(keyword) {
                var arr = keyword._attr = keyword._attr || [];
                fc.each(keyword.attr_index, function(index) {
                    if (attrs[index]) {
                        arr.push(attrs[index]);
                    }
                });
                // 对 keyword 做一些特殊操作
                if (typeof callback === 'function') {
                    callback(keyword);
                }
            });
        })
    }

    // 这两个东西都是存在与flash本地存储中，只是storage是永久的
    // cache 每次刷新都会清空
    // 设计 cache 的原因是，kr 左侧提词篮的词开始的时候需要临时保存
    // 如果关闭了工具栏 或者 其他操作，需要把这批临时保存的词永久保存起来
    // 以便用户下次打开 KR 能看到这批词，这样设计比较优雅，kr 只要读 storage 即可
    var FIELD_STORAGE = 'kr_box_word_list',
        FIELD_CACHE = 'keywords_cache';
    
    // 清空cache
    FlashStorager.set(FIELD_CACHE, []);

    return {

        // ==================================== 开始是一堆封装过的请求接口 ======================================
		
		/**
		 * 自动补全，为 fc.ui.Suggestion 提供数据
		 * param 格式如下：
		 * {
		 *    query: '搜索词',
		 *    entry: '入口',
		 *    onSuccess: function(keywords), 
		 *    onFail: function(json)
		 * }
         * @method suggest
		 */
		suggest: function(param) {
            formatParam(param, ['logid']);
			var onSuccess = param.onSuccess, onFail = param.onFail;
			onSuccess && delete param.onSuccess;
			onFail && delete param.onFail;

			param.querytype = 7;
			param.callback = function(json) {
				if (json.status != 200) {
					if (typeof onFail === 'function') {
						onFail(json);
					}
				} else {
					var group = json.data.group[0], list = group.resultitem || [];
					if (typeof onSuccess === 'function') {
                        onSuccess(fc.map(list, function(item, index) { return { text: item.word, id: item.wordid, index: index }; }));
					}
				}
            };
			fbs.kr.suggestion(param);
		},
		
		/**
		 * 关键词推荐
         * param 格式如下：
         * {
         *    logid: -1,            如果不传，默认是-1
         *    planid: 0,            如果不传，默认是0
         *    unitid: 0,            如果不传，默认是0
         *    query: '',
         *    entry: '',
         *    regions: '',
         *    rgfilter: 1,          如果不传，默认是1
         *    onSuccess: function,  
         *    onFail: function
         * }
		 * @method recommend
		 * @param {Object} param
		 */
		recommend: function(param) {
			// 避免污染源对象
			param = baidu.object.clone(param);
		    formatParam(param, ['logid', 'planid', 'unitid', 'rgfilter']);
			
			var onSuccess = param.onSuccess, onFail = param.onFail;
			onSuccess && delete param.onSuccess;
			onFail && delete param.onFail;
			
			param.callback = function(json) {
				var status = +json.status, code, info;
                if (status === 200) {
                    json.data = json.data || { attr: [], group: [] };
                    formatAttr(json.data.attr, json.data.group);
                    if (typeof onSuccess === 'function') {
                        onSuccess(json);
                    }
                } else {
                    switch (status) {
                        case 400:
                            code = json.errorCode && +json.errorCode.code;
                            switch (code) {
                                case 1301: // 操作太频繁
                                    info = nirvana.config.LANG.WORD.SEARCH_QUERY_TOO_FREQ;
                                    break;
                                case 1302: // 用户被后台封禁
                                    info = nirvana.config.LANG.WORD.SEARCH_WORD_MALICE;
                                    break;
                                case 1303: // 不支持
                                    info = nirvana.config.LANG.WORD.SEARCH_NO_SUPPORT;
                                    break;
                                case 1404: // 关键词为空
                                    info = nirvana.config.LANG.WORD.SEARCH_WORD_NULL;
                                    break;
                                case 1505: // 关键词太长
                                    info = nirvana.config.LANG.WORD.SEARCH_WORD_LENGTH;
                                case 1506: // URL为空
                                    info = nirvana.config.LANG.WORD.SEARCH_URL_NULL;
                                    break;
                                case 1507: // URL太长
                                    info = nirvana.config.LANG.WORD.SEARCH_URL_LENGTH;
                                default:
                                    json.data = json.data || {};
                                    json.data.group = [];
                                    break;
                            } 
                            break;
                        case 600:
                            ui.Dialog.alert({
                                title: '警告',
                                content: '参数有误',
                                forTool : true
                            });
                            break;
                    }
				    if (typeof onFail === 'function') {
					    onFail(info, code);
                    }
				}
			}

			fbs.kr.getRecommWord(param);
		},

        /**
         * 请求种子词和种子URL
         * param 格式如下：
         * {
         *    planid: 0,
         *    unitid: 0,
         *    logid: -1,        如果不传，默认是-1
         *    callback: function
         * }
         * @method seed
         * @param {Number} planid
         * @param {Number} unitid
         * @param {Function} callback
         */
        seed: function(param) {
            formatParam(param, ['logid']);
            fbs.kr.getRecommSeed({
                planid: param.planid,
                unitid: param.unitid,
                rectype: 0,
                logid: param.logid,
                callback: function(json) {
                    // 减少外部的非空检测，那种代码巨难看
                    var data = json.data || {};
                    data.word = data.word || {};
                    data.url = data.url || {};
                    data.word.values = data.word.values || [];
                    data.url.values = data.url.values || [];

                    if (json.status == 200) {
                        param.callback(data)
                    } else {
                        param.callback(data);
                    }
                    /**
                    提示这个有毛用？用户看了也看不懂
                    if (json.status == 400) {
                        if (json.errorCode.code == 1310) {
                            ui.Dialog.alert({
                                title: '警告',
                                content: '种子类型不支持',
                                forTool : true
                            });
                        }
                    }
                    */
                }
            });
        },
        
        /**
         * 获得某个业务点下的词
         * param 格式如下：
         * {
         *    query: '',
         *    unitid: '',          不传默认是0,
         *    businessPoint: '',   业务点名称
         *    logid: '',           不传默认是-1
         *    onSuccess: function, 
         *    onFail: function
         * }
         *
         * @param {Object} param
         */
        businessPoint: function(param) {
            param = baidu.object.clone(param);
            // 这里 unitid 默认不是 -1
            param.unitid = param.unitid != null ? param.unitid : 0;
            formatParam(param, ['logid']);
            param.callback = function(json) {
                if (json.status == 200) {
                    if (!json.data) {
                        json.data = { attr: [], group: [] };
                    }
                    var groups = json.data.group;
                    if (groups.length > 0) {
                        // 格式化标题
                        fc.each(groups, function(group) {
                            var size = group.resultitem.length;
                            group.grouprsn = '<span class="business_point">' +
                                                 '<label class="name">“' + param.businessPoint + '”</label> ' +
                                                 '业务点下的其他关键词 ( ' + size + ' )<span></span>' +
                                             '</span>';
                        });
                    }
                    formatAttr(json.data.attr, json.data.group, function(item) {
                        item._attr.push({ field: '业务点', text: param.businessPoint });
                    });
                    if (typeof param.onsuccess === 'function') {
                        param.onsuccess(json);
                    }
                } else if (typeof param.onfail === 'function') {
                    param.onfail(json);
                }
            };
            fbs.kr.getBusinessPointWords(param);
        },
		
        /**
         * 保存关键词
         * param 格式如下：
         * {
         *    planid: xx,
         *    unitid: xx,
         *    pattern: 匹配模式（0 -> 广泛，1 -> 短语，2 -> 精确）
         *    keywords: ['关键词1', '关键词2', ...],
         *    onSuccess: function(json),
         *    onFail: function(errorText)
         * }
         * @param {Object} param
         */
        save: function(param) {
            // 转格式
            var keywords = baidu.object.clone(param.keywords);

            if (param.pattern == 1) {
                tophraseMatch(keywords);
            } else if (param.pattern == 2) {
                toAccurateMatch(keywords);
            }

            fbs.keyword.add({
                planid : param.planid,
                unitid : param.unitid,
                keywords : keywords,
                onSuccess : function(json) {
                    // 部分成功就不需要往下走了，直接跳进onFail
                    if (json.status == 300) {
                        return false;
                    }
                    fbs.keyword.getList.clearCache();

                    // 检查最低出价
                    if (typeof param.onSuccess === 'function') {
                        param.onSuccess(json);
                    }
                },
                onFail : function(json) {
                    var ERROR = fc.common.Error.KEYWORD.SAVE;
                    // idx 对应到关键词
                    var error = json.error, errorMap = {}, item, word;
                    for (var key in error) { 
                        item = error[key];
                        word = param.keywords[item.idx];
                        errorMap[word] = ERROR[item.code] || item.message;
                    }

                    if (typeof param.onFail === 'function') {
                        param.onFail(json, errorMap);
                    }
                }
            });
        },

        /**
         * 删除关键词
         * 其实是放进回收站
         * param 格式如下：
         * {
         *    planid: xx,
         *    unitid: xx,
         *    wordid: xx,
         *    srchcnt: 日均搜索量
         *    cmprate: 竞争激烈程度
         *    onSuccess: function
         * }
         */
        remove: function(param) {
			param = baidu.object.clone(param);
			
            fbs.kr.addRecycleWord({
                logid: 0,
                planid: param.planid,
                unitid: param.unitid,
                wordid: param.wordid,
                srchcnt: param.srchcnt,
                cmprate: param.cmprate,
                onSuccess: function(json) {
                    if (json.data <= 0) return;
                    if (typeof param.onSuccess === 'function') {
                        param.onSuccess(json);
                    }
                },
                onFail: function() {
                    ajaxFail(0);
                }
            });
         },

         /**
          * 获得回收站中的关键词数量
          * @method getRecycleSize
          * @param {Function} callback 参数是 {Number} size
          */
         getRecycleSize: function(callback) {
            fbs.kr.getRecycleNum({
                onSuccess: function(json) {
                    // 确保是数字类型
                    callback(+json.data);
                },
                onFail: function() {
                    ajaxFailDialog();
                }
            });
         },

         /**
          * 获得回收站中的关键词
          * @param {Function} callback 参数是 {Array} keywords
          */
         getRecycleKeywords: function(callback) {
            fbs.kr.getRecycleItems({
                onSuccess: function(json) {
                    var keywords = json.data || [];
                    if (typeof callback === 'function') {
                        callback(keywords);
                    }
                },
                onFail: function() {
                    ajaxFailDialog();
                }
            });
         },

         /**
          * 还原已删除关键词，相对于 remove
          * param 格式如下：
          * {
          *    recyid: 您猜吧，我也没找到标准答案。。。
          *    callback: 请求返回后的回调
          * }
          */
         restore: function(param) {
            fbs.kr.delRecycleWord({
                krrid : param.recyid || 0,
                onSuccess: function() {
                    if (typeof param.callback === 'function') {
                        param.callback();
                    }
                }
            });
         },

         // =============================================  下面是一些工具方法 ==========================================
         /**
          * 请求返回的 group 列表转成keyword 列表
          * @method groups2Keywords
          * @param {Array} groups 关键词分组列表
          * @return {Array}
          */
         groups2Keywords: function(groups) {
             var ret = [];
             fc.each(groups, function(group) {
                 fc.push(ret, group.resultitem);
             });
             return ret;
         },
         
         /**
          * 从本地存储中读取保存的关键词
          * @param {Function} callback 参数是读取到的关键词列表
          */
         getKeywordsFromStorage: function(callback) {
            FlashStorager.get(FIELD_STORAGE, function(list) {
                callback(list || []);
            });
         },

         /**
          * 把关键词保存到本地存储中
          * @method saveKeywordsToStorage
          * @param {Array} keywords
          */
         saveKeywordsToStorage: function(keywords) {
            FlashStorager.set(FIELD_STORAGE, keywords);
         },

         /**
          * 从本地关键词cache 中读取
          * @method getKeywordsFromCache
          * @param {Function} callback 参数是读取到的关键词
          */
         getKeywordsFromCache: function(callback) {
            FlashStorager.get(FIELD_CACHE, function(list) {
                callback(list || []);
            });
         },

         /**
          * 把关键词保存到本地存储中
          * @method saveKeywordsToCache
          * @param {Array} keywords
          */
         saveKeywordsToCache: function(keywords) {
            FlashStorager.set(FIELD_CACHE, keywords);
         },

         /**
          * 把 cache 中的词保存在 storage，并清空cache
          * @method saveKeywordsFromCacheToStorage
          */
         saveKeywordsFromCacheToStorage: function() {
            var me = this;
            this.getKeywordsFromCache(function(keywords) {
				me.saveKeywordsToStorage(keywords);
                me.saveKeywordsToCache([]);
			});
         }
    };
}();

//var a = fc.common.Keyword;
//p(a);
