/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: core/common/tableUtil.js
 * desc: 表格控件的辅助工具方法
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/01/31 $
 */
/**
 * 用于提供表格的辅助工具方法
 */
nirvana.tableUtil = function(T, nirvana) {

    /**
     * 依赖的外部方法、对象等定义
     */
    var isUndef = nirvana.util.isUndef;
    var extDefault = nirvana.util.extend;
    var RENDERER = lib.field;

    /**
     * 默认域配置值定义
     * @type {Object}
     */
    var DEFAULT_LEVEL_CONF = { width: 100, length: 20 };
    var DEFAULT_BID_CONF = {
        width: 100,
        align: 'right',
        stable: true
    };
    var DEFAULT_WMATCH_CONF = {
        width: 90,
        stable: true
    };

    /**
     * 过滤掉未定义的配置项
     * @param {Object} options
     * @return {Object}
     */
    function filterUndef(options) {
        var result = {};
        for (var k in options) {
            !isUndef(options[k]) && (result[k] = options[k]);
        }
        return result;
    }

    /**
     * 获取关键词列/单元列/计划列的配置信息
     * @param {string} fieldName 列的域名
     * @param {string} title 显示的列的字面量
     * @param {string} rendererName 渲染域的方法名称
     * @return {Object}
     */
    function getFieldConf(fieldName, title, rendererName,
                               defaultOption, options) {
        var defaultConf = {
            field: fieldName,
            title: title
        };

        T.object.extend(defaultConf, defaultOption);

        // 由于下面会对options进行修改操作，所以这里克隆一下
        options = filterUndef(options || {});
        options = extDefault(options, defaultConf);

        // 这里处理逻辑有点不优雅，由于为了兼容现有代码，最理想是table field option和
        // field content的渲染options应该分开传递，此外render方法的参数必须保证都是以
        // object方式传递，这样下面各种特殊逻辑处理就可以简化掉，但是要这么做，要改动代码量
        // 太大。
        if (!options.content) {
            var argArr = [];
            var len = options.length;
            var styleName = options.styleName;
            var editable = options.editable;

            if (isUndef(editable) && (!isUndef(len) || !isUndef(styleName))) {
                argArr = [len, styleName];
            }
            else {
                argArr = [{ editable: editable }];
            }

            options.content = RENDERER[rendererName].apply(null, argArr);
        }

        // 由于这两个选项并不是表格域的配置，只是用作content的配置选项
        delete options.length;
        delete options.styleName;
        delete options.editable;

        return options;
    }

    /**
     * 将升序改成降序
     */
    function reverseResult(result, orderType) {
        if (! orderType || 'desc' == orderType) {
            result = -1 * result;
        }
        return result;
    }

    /**
     * 定义各个字段的排序方法, key为field的名称，value为对应的排序方法定义
     * @type {Object}
     */
    var fieldSorter = {
        /**
         * 质量度的排序方法
         * @param {string} orderType 排序类型，升序or降序，有效值为'desc', 'asc'，
         *                           默认升序
         * @return {Function} 返回排序方法，用于数组的sort方法传入
         */
        showqstat: function(orderType) {
            return function(ele1, ele2) {
                var result = (+ ele1['showqstat']) - (+ ele2['showqstat']);
                return reverseResult(result, orderType);
            };
        },
        /**
         * 左侧排名的排序方法，当前该域只用在重点词排名包里
         * @param {string} orderType 排序类型，升序or降序，有效值为'desc', 'asc'，
         *                           默认升序
         * @return {Function} 返回排序方法，用于数组的sort方法传入
         */
        provavgrank: function(orderType) {
            return function(ele1, ele2) {
                // 定义展现位置优先级
                // 升序排序: -2（未在该地域投放）, -1（--）, -3（没有有效创意）,
                // 0（不在左侧）, 10~1（左侧第十~第一）
                var priority = {'-2': -2, '-1': -1, '-3': 0, '0': 1};
                // 初始化左侧第一~第十的优先级
                for (var i = 1; i < 11; i ++) {
                    priority[i] = i * -1 + 100;
                }

                var pos1 = ele1['provavgrank'];
                var pos2 = ele2['provavgrank'];
                var result = priority[pos1] - priority[pos2];
                if (!result) {
                    function resetVal(value) {
                        if (nirvana.util.isEmptyValue(value)
                            || Math.abs(+value) !== 1) {
                            return -9999;
                        }
                        return value;
                    }

                    result = resetVal(ele1.rankchg) - resetVal(ele2.rankchg);
                }
                return reverseResult(result, orderType);
            };
        }
    };

    return {
        /**
         * 获取关键词列的配置信息
         * @param {？Object} options 定制的配置，跟{@link ui.Table}的field配置是一致的
         *                   默认配置为:
         *                   {
         *                      field: 'showword',
         *                      title: '关键词',
         *                      width: 100,
         *                      content: lib.field.getWordRenderer(23)
         *                   }
         * @param {?number} options.length 显示的关键词字面量长度，用于使用默认的content
         *                                 渲染方法的配置，默认23
         * @param {?string} options.styleName 显示的关键词字面量定制样式，用于使用默认的
         *                                 content渲染方法的配置
         * @return {Object}
         */
        getWordConf: function(options) {
            return getFieldConf('showword', '关键词', 'getWordRenderer',
                DEFAULT_LEVEL_CONF, options);
        },
        /**
         * 获取单元列的配置信息
         * @param {？Object} options 定制的配置，跟{@link ui.Table}的field配置是一致的
         *                   默认配置为:
         *                   {
         *                      field: 'unitname',
         *                      title: '推广单元',
         *                      width: 100,
         *                      content: lib.field.getUnitRenderer(23)
         *                   }
         * @param {?number} options.length 显示的关键词字面量长度，用于使用默认的content
         *                                 渲染方法的配置，默认23
         * @param {?string} options.styleName 显示的关键词字面量定制样式，用于使用默认的
         *                                    content渲染方法的配置
         * @return {Object}
         */
        getUnitConf: function(options) {
            return getFieldConf('unitname', '推广单元', 'getUnitRenderer',
                DEFAULT_LEVEL_CONF, options);
        },
        /**
         * 获取计划列的配置信息
         * @param {？Object} options 定制的配置，跟{@link ui.Table}的field配置是一致的
         *                   默认配置为:
         *                   {
         *                      field: 'planname',
         *                      title: '推广计划',
         *                      width: 100,
         *                      content: lib.field.getPlanRenderer(23)
         *                   }
         * @param {?number} options.length 显示的关键词字面量长度，用于使用默认的content
         *                                 渲染方法的配置，默认23
         * @param {?string} options.styleName 显示的关键词字面量定制样式，用于使用默认的
         *                                 content渲染方法的配置
         * @return {Object}
         */
        getPlanConf: function(options) {
            return getFieldConf('planname', '推广计划', 'getPlanRenderer',
                DEFAULT_LEVEL_CONF, options);
        },
        /**
         * 获取出价列的配置信息
         * @param {？Object} options 定制的配置，跟{@link ui.Table}的field配置是一致的
         *                   默认配置为:
         *                   {
         *                      field: 'bid',
         *                      title: '当前出价',
         *                      width: 100,
         *                      align: 'right',
         *                      stable: true
         *                      content: lib.field.getBidRenderer()
         *                   }
         * @param {?number} options.editable 是否出价可以编辑，用于使用默认的content
         *                                 渲染方法的配置，默认是可编辑的
         * @return {Object}
         */
        getBidConf: function(options) {
            return getFieldConf('bid', '当前出价', 'getBidRenderer',
                DEFAULT_BID_CONF, options);
        },
        /**
         * 获取推荐出价列的配置信息
         * @param {？Object} options 定制的配置，跟{@link ui.Table}的field配置是一致的
         *                   默认配置为:
         *                   {
         *                      title: '建议出价',
         *                      width: 100,
         *                      align: 'right',
         *                      stable: true
         *                      content: lib.field.getRecmBidRenderer()
         *                   }
         * @param {?number} options.editable 是否推荐出价可以编辑，用于使用默认的content
         *                                 渲染方法的配置，默认是不可编辑的
         * @return {Object}
         */
        getRecmBidConf: function(options) {
            return getFieldConf(undefined, '建议出价', 'getRecmBidRenderer',
                DEFAULT_BID_CONF, options);
        },
        /**
         * 获取点击列的配置信息
         * @param {？Object} options 定制的配置，跟{@link ui.Table}的field配置是一致的
         *                   默认配置为:
         *                   {
         *                      field: 'clks',
         *                      title: '昨日点击',
         *                      align: 'right',
         *                      content: lib.field.getClkRenderer()
         *                   }
         * @return {Object}
         */
        getClksConf: function(options) {
            var defaultClksConf = {
                align: 'right'
            };

            return getFieldConf('clks', '昨日点击', 'getClkRenderer',
                defaultClksConf, options);
        },
        /**
         * 获取消费列的配置信息
         * @param {？Object} options 定制的配置，跟{@link ui.Table}的field配置是一致的
         *                   默认配置为:
         *                   {
         *                      field: 'paysum',
         *                      title: '昨日消费',
         *                      align: 'right',
         *                      content: lib.field.getPaySumRenderer()
         *                   }
         * @return {Object}
         */
        getPaysumConf: function(options) {
            var defaultPaysumConf = {
                align: 'right'
            };

            return getFieldConf('paysum', '昨日消费', 'getPaySumRenderer',
                defaultPaysumConf, options);
        },
        /**
         * 获取关键词匹配列的配置信息
         * @param {？Object} options 定制的配置，跟{@link ui.Table}的field配置是一致的
         *                   默认配置为:
         *                   {
         *                      field: 'wmatch',
         *                      title: '当前匹配',
         *                      stable: true,
         *                      width: 100,
         *                      content: lib.field.wmatch()
         *                   }
         * @return {Object}
         */
        getWmatchConf: function(options) {
            return getFieldConf('wmatch', '当前匹配', 'wmatch',
                DEFAULT_WMATCH_CONF, options);
        },
        /**
         * 获取推荐关键词匹配列的配置信息
         * @param {？Object} options 定制的配置，跟{@link ui.Table}的field配置是一致的
         *                   默认配置为:
         *                   {
         *                      title: '建议匹配',
         *                      stable: true,
         *                      width: 100,
         *                      content: lib.field.getRecmWmatchRenderer()
         *                   }
         * @param {?number} options.editable 是否出价可以编辑，用于使用默认的content
         *                                 渲染方法的配置，默认是不可编辑的
         * @return {Object}
         */
        getRecmWmatchConf: function(options) {
            return getFieldConf(undefined, '建议匹配', 'getRecmWmatchRenderer',
                DEFAULT_WMATCH_CONF, options);
        },

        /**********************************************************************/
        // field sort method definition
        /**
         * 域排序方法定义，用于数组sort方法
         * @type {Object}
         * @example
         *      <code>
         *          dataArr.sort(nirvana.tableUtil.sorter[fieldName]('desc'));
         *          // 默认升序排序
         *          dataArr.sort(nirvana.tableUtil.sorter[fieldName]());
         *      </code>
         */
        sorter: fieldSorter,

        /**********************************************************************/
        // 其它表格辅助方法定义
        /**
         * 获取表格指定行和域的数据
         * @param {Array|number} rowIdxs 要获取的行索引或数组，可选，未指定将返回所有行
         * @param {string} fieldName 要获取的域名，可选，未指定将返回所有域
         * @param {Array} ds 数据源
         * @return {Array}
         */
        getFieldData: function(rowIdxs, fieldName, ds) {
            var isArr =  T.lang.isArray;

            if (rowIdxs) {
                isArr(rowIdxs) || (rowIdxs = [rowIdxs]);
            }
            else {
                rowIdxs = [];
                for (var j = ds.length; j --;) {
                    rowIdxs[j] = j;
                }
            }

            var data = [];
            var row;
            for (var i = rowIdxs.length; i --;) {
                row = rowIdxs[i];
                data[i] = fieldName ? ds[row][fieldName] : ds[row];
            }

            return data;
        },
//        /**
//         * 添加分页事件处理器
//         * @param {ui.Page} pageWidget 分页组件
//         * @param {Function} handler 分页事件处理器
//         * @param {Object} context 执行事件处理器的上下文
//         */
//        bindPagingHandler: function(pageWidget, handler, context) {
//            pageWidget && (pageWidget.onselect = bind(handler, context));
//        },
        /**
         * 添加行内编辑事件处理器
         * @param {ui.Table} table 要添加内联事件处理器的表格组件
         * @param {Function} handler 事件处理器
         * @param {Object} context 事件处理器执行的上下文
         */
        bindInlineHandler: function(table, handler, context) {
            var tableEle = table.main;
            // 给表格注册:行内编辑处理器
            handler = nirvana.event.delegate(tableEle, handler, context, table);
            tableEle.onclick = handler;
        },
        /**
         * 获取触发表格内联操作所对应的行和列索引信息
         * NOTICE: 以后nirvana.manage.getRowIndex(target)替换成这个方法
         * @param {HTMLElement} target 触发行内操作的目标DOM元素
         * @return {Object}
         *         {
         *              row: [number]
         *              col: [number]
         *         }
         */
        getTriggerCellPos: function(target) {
            var cell = T.dom.getAncestorByTag(target, 'td');
            var getAttr = T.dom.getAttr;
            return {
                row: cell && +getAttr(cell, 'row'),
                col: cell && +getAttr(cell, 'col')
            };
        },
        /**
         * 当前主要用于行内修改关键词、单元或计划的状态时候，发送请求时候显示loaing状态图标
         * NOTICE: 以后nirvana.manage.inserLoadingIcon(target)替换成这个方法
         * @param {HTMLElement} target 触发行内操作的目标DOM元素
         */
        showLoadingIcon : function (target) {
            // nirvana.manage.inserLoadingIcon(target);
            var msg = '正在发送请求,请稍等...';
            var loadingImg = './asset/img/loading.gif';
            var tpl = '<img src="{img}" title="{msg}" alt="{msg}" />';

            target.innerHTML = lib.tpl.parseTpl({ img: loadingImg, msg: msg }, tpl);
        },
        /**
         * 获取没有数据表格视图显示的提示消息
         * @param {boolean} isFail 是否请求失败
         * @param {boolean} isTimeout 是否请求超时
         * @return {string}
         */
        getNoDataTip: function(isFail, isTimeout) {
            if (isTimeout) {
                return FILL_HTML.TIMEOUT;
            }
            else if (isFail) {
                return FILL_HTML.EXCEPTION;
            }
            else {
                return FILL_HTML.NO_DATA;
            }
        }
    };
}(baidu, nirvana);