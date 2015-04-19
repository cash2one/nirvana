/**
 * 单元 相关的操作
 */
fc.common.Unit = function() {
    
    return {
        
        /**
         * 检查最低单元出价
         * 如果keywords有低于单元最低出价的词
         * 会弹出一个修改单元最低出价的对话框
         *
         * @method checkMinBid
         * @param {Number} planid
         * @param {Number} unitid
         * @param {Array} keywords 关键词必须包含 winfoid 属性
         * @param {Function} callback
         */
        checkMinBid: function(planid, unitid, keywords, callback) {
            var winfoids = [];
            for (var i = 0, len = keywords.length; i < len; i++) {
                winfoids.push(keywords[i].winfoid);
            }
            // 请求出价信息 [showword, bid, unitbid, minbid]
            fbs.keyword.getBids({
                condition: {
                    winfoid: winfoids
                },
                onSuccess : function(json) {
                    var listData = json.data.listData, errWords = [];
                    
                    for (var i = 0, len = listData.length, item; i < len; i++) { //检查关键词的出价是否存在，如果不存在则比较单元出价与最低展现价格
                        item = listData[i];
                        if (!item.bid) { // 关键词不存在出价
                            if (item.unitbid < item.minbid) { // 单元出价小于最低展现价格，则存储该行关键词
                                errWords.push(item);
                            }
                        }
                    }
                    
                    if (errWords.length > 0) { // 存在低于最低展现价格的关键词，则打开修改单元出价action

                        // 这里跟er耦合了，以后再干掉他
                        nirvana.util.openSubActionDialog({
                            id: 'KeywordUnitBidDialog',
                            title: '添加关键词',
                            width: 980,
                            actionPath: 'manage/modUnitPrice',
                            params: {
                                unitid: [unitid],
                                datasource: {
                                    planid : planid,
                                    unitid : unitid,
                                    words : errWords
                                }
                            },
                            onclose: function() {
                                if (typeof callback === 'function') {
                                    callback();
                                }
                            }
                        });
                    } else {
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }
                },
                onFail: function() {
                    if (typeof callback === 'function') {
                        callback();
                    }
                }
            });
        }
    };
}();
