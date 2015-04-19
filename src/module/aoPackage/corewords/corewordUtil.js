/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/corewords/corewordUtil.js 
 * desc: 定义重点词优化包用到的一些静态方法
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/08/09 $
 */
/*
 * 初始化命名空间 
 */

nirvana.corewordUtil = function($, nirvana){
    var CorewordDetail = nirvana.aopkg.CorewordDetail;

    /**
     * 重点词状态类型定义
     * @constant
     */
    var COREWORD_STAT = {
        // 前7种同core/config/config.js#WORD 状态定义
        VALID: 0,               // 有效
        SUSPEND_PROMOTION: 1,   // 暂停推广
        NOT_ALLOW_PROMOTION: 2, // 不宜推广
        SEARCH_INVALID: 3,      // 搜索无效
        INACTIVE: 4,            // 待激活
        AUDITING: 5,            // 审核中
        SEARCH_LOW: 6,          // 搜索量过低

        UNIT_SUSPEND: 7,                 // 推广单元暂停
        PLAN_SUSPEND: 8,                 // 推广计划暂停
        PLAN_SHELVED: 9,                 // 所在计划循环搁置 或 处在暂停时段
        ACCOUNT_BUDGET_INSUFFICIENT: 10, // 用户预算不足
        PLAN_BUDGET_INSUFFICIENT: 11,    // 计划预算不足
        ZERO_BALANCE: 12,                // 余额为零

        // 下面几种只用在问题描述里
        NOT_IN_LEFT: 101,       // 不在左侧
        QUALITY_LOW: 102,       // 质量度过低
        NOT_IN_LEFT_FIRST: 103, // 不在左侧第一
        INVALID_IDEA: 104,      // 没有有效创意
        RANK_DWON: 105          // 排名下降
    };

    /**
     * 问题描述常量定义
     * @constant
     */
    var PROBLEM_DESC = {};
    PROBLEM_DESC[COREWORD_STAT.ZERO_BALANCE] = '余额为零';
    PROBLEM_DESC[COREWORD_STAT.ACCOUNT_BUDGET_INSUFFICIENT] =
        PROBLEM_DESC[COREWORD_STAT.PLAN_BUDGET_INSUFFICIENT] = '预算不足';
    PROBLEM_DESC[COREWORD_STAT.SEARCH_INVALID] = '搜索无效';
    PROBLEM_DESC[COREWORD_STAT.SEARCH_LOW] = '搜索量过低';
    PROBLEM_DESC[COREWORD_STAT.SUSPEND_PROMOTION] = '关键词暂停推广';
    PROBLEM_DESC[COREWORD_STAT.INACTIVE] = '关键词待激活';
    PROBLEM_DESC[COREWORD_STAT.NOT_ALLOW_PROMOTION] = '关键词不宜推广';
    PROBLEM_DESC[COREWORD_STAT.UNIT_SUSPEND] = '推广单元暂停';
    PROBLEM_DESC[COREWORD_STAT.PLAN_SUSPEND] = '推广计划暂停';
    PROBLEM_DESC[COREWORD_STAT.PLAN_SHELVED] = '处在暂停时段';

    PROBLEM_DESC[COREWORD_STAT.NOT_IN_LEFT] = '不在左侧';
    PROBLEM_DESC[COREWORD_STAT.QUALITY_LOW] = '质量度过低';
    PROBLEM_DESC[COREWORD_STAT.NOT_IN_LEFT_FIRST] = '不在左侧第一';
    PROBLEM_DESC[COREWORD_STAT.INVALID_IDEA] = '没有有效创意';
    PROBLEM_DESC[COREWORD_STAT.RANK_DWON] = '排名下降';

    var FILTER_TYPES = CorewordDetail.COREWORD_FILTER;
    var RANK_POSITION = CorewordDetail.DISPLAY_POSITION;
//    var tableHelper = nirvana.TableHelper;
    var wordRender = lib.field.getWordRendererWithBubble;

    /**
     * 定义没有建议或者问题显示在表格单元格的内容
     * @return {string}
     */
    function getInvalidCellHTML() {
        return '<span class="invalid_cell_value">--</span>';
    }

    var corewordUtil = {
        /**
         * 根据id查找定义在{@link nirvana/config.js#REGION_LIST}的区域名称
         * @param {String|Number} id 要查找的区域id，这里的id要求是数字或者数字组成的字符串
         * @param {Object} region 区域的层级信息的对象，当前业务下使用REGION_LIST对象作为调用该函数传递的参数
         * @return {Object} 返回找到的区域名称，找不到返回null
         */
        findRegionNameById: function(id, region) {
            var result = null;

            for (var k in region) {
                if ( typeof region[k] != 'string') {// 判断是不是已经到了叶子节点
                    result = arguments.callee(id, region[k]);
                    // 递归查找
                    if (null === result) {// 没找到，继续
                        continue;
                    } else {
                        break;
                    }
                } else if (id == k) {// 已经到区域层级的叶子节点，判断给定的id是否与当前的key相等
                    result = region[k];
                    break;
                }
            }

            return result;
        },
        /**
         * 根据noShowReason获取重点词状态
         * @param {Number} noShowReason 详见下面定义
         *  noshowreason：
         *    //0标识关键词有效
         *    1标识关键词暂停
         *    2标识关键词待激活
         *    4标识关键词不宜推广
         *    8标识关键词搜索量过低
         *    16标识关键词搜索无效
         *    32标识关键词所在推广单元暂停
         *    64标识关键词所在推广计划暂停
         *    128标识关键词所在计划循环搁置
         *    256标识用户预算不足
         *    512标识关键词所在计划预算不足
         *    1024标识余额为零
         * @return {number} 关键词状态，状态值定义{@link COREWORD_STAT}
         */
        getWordState: function(word) {
            var noShowReason = + word.noshowreason;
            var wordStatMap = {
                1: COREWORD_STAT.SUSPEND_PROMOTION,
                2: COREWORD_STAT.INACTIVE,
                4: COREWORD_STAT.NOT_ALLOW_PROMOTION,
                8: COREWORD_STAT.SEARCH_LOW,
                16: COREWORD_STAT.SEARCH_INVALID,
                32: COREWORD_STAT.UNIT_SUSPEND,
                64: COREWORD_STAT.PLAN_SUSPEND,
                128: COREWORD_STAT.PLAN_SHELVED,
                256: COREWORD_STAT.ACCOUNT_BUDGET_INSUFFICIENT,
                512: COREWORD_STAT.PLAN_BUDGET_INSUFFICIENT,
                1024: COREWORD_STAT.ZERO_BALANCE
            };

            if (!noShowReason) {
                return COREWORD_STAT.VALID; // 为0返回有效状态
            }

            for (var key in wordStatMap) {
                if (noShowReason & key) {
                    return wordStatMap[key];
                }
            }

            // 返回无效状态
            return 9999;
        },
        /**
         * 获取左侧排名展现位置的标签
         * @param {Number} position 左侧排名的位置信息
         * @return {string}
         */
        getRankPositionLabel: function(position) {
            var pos = + position;

            // 展现位置位于左侧
            if (pos > 0) {
                return pos;//posMap['left'] + parseDigitToChinese(pos);
            } else {
                return RANK_POSITION[pos];
            }
        },
        /**
         * 获取质量度列的配置
         * @param {Object} options 配置选项，
         *                 见{@link qStar.getTableField}方法第二个参数
         * @return {Object}
         */
        getQStarFieldConfig: function(options) {
            // return qStar.getTableField(null,
            return qStar.getTableField(
                { VIEW: 'CoreWordsPkg' },  // 原来是null，简单修改为SimpleObject，为了指定VIEW
                options,
                function(item, content) {
                    // 对质量度渲染方式进行重新定制
                    var tpl = ''
                        + '<div>'
                        +     '{content}'
                        +     '<span '
                        +         'class="clickable edit_btn edit_idea" '
                        +         'winfoid="{winfoid}" '
                        +         'edittype="idea">编辑创意'
                        +     '</span>'
                        + '</div>';

                    return lib.tpl.parseTpl({
                        content: content,
                        //clazz: (+item.qdump) ? '' : ' hide',
                        winfoid: item.winfoid
                    }, tpl);
                });
        },
        /**
         * 获取关键词域的配置
         * @param {Object} options 配置选项
         * @return {Object}
         */
        getWordFieldConfig: function(options) {
            var option = {
                title: function() {
                    return '<span class="coreword_th">关键词</span>'
                },
                content: function(item) {
                    var renderer = wordRender('corewordInfoTable', 12,
                        'showcoreword_cell');
                    var html = renderer(item);
                    var tpl = ''
                        + '<span title="取消关注" class="edit_btn remove_coreword">'
                        + '</span>'
                        + html;

                    return tpl;
                },
                width: 90
            };
            return nirvana.tableUtil.getWordConf(option);
        },
        /**
         * 获取左侧排名列的配置
         * @param {Object} options 配置选项
         * @return {Object}
         */
        getRankFieldConfig: function(options) {
            var defaultOption = {
                // 在列头显示帮助信息：一个小问号图标
                noun: true,
                nounName: '左侧排名',
                title: function() {
                    var regionName = this._selRegionName,
                        selRegionInfo = '--';

                    if (regionName) {
                        selRegionInfo = '<span class="region_name">'
                            + regionName + '</span>';
                        selRegionInfo += ('<span class="diagnosis_time">'
                            + this._diagnosisTime  + '</span>');
                    }

                    return '<span class="show_region">('
                        + selRegionInfo + ')</span><span>左侧排名</span>';
                },
                // 定义展现位置列渲染方式
                content:function (item) {
                    var html;
                    // 该重点词已经被修改过，后端还未重新计算，且有倒计时的情况下，显示'--'
                    if (this.hasCounter(item)) {
                        // 该重点词被修改了
                        var counterClass = 'coreword_rank_counter box-border-radius';
                        var btnClass = '';
                        if (!this._updateRemainder) {
                            counterClass += ' hide';
                        } else {
                            btnClass = 'hide';
                        }

                        html = lib.tpl.parseTpl(
                            {
                                counter: this._updateRemainder,
                                comma: '',
                                counterClass: counterClass,
                                btnClass: btnClass
                            },
                            'modifiedCorewordRankInfo',
                            true
                        );
                    } else {
                        var label = corewordUtil.getRankPositionLabel(item.provavgrank);
                        // 小于等于0的值表示跟展现排名无关的信息
                        var clsValue = (+item.provavgrank <= 0)
                            ? 'invalid_cell_value'
                            : 'coreword_left_rank';

                        html = '<span class="' + clsValue + '">' + label + '</span>';

                        var rankChange = +item.rankchg;
                        if (rankChange === 1) {
                            html += '<span class="coreword-rank-up inline_block"></span>';
                        }
                        else if (rankChange === -1) {
                            html += '<span class="coreword-rank-down inline_block"></span>';
                        }
                    }

                    return html;
                },
                field: 'provavgrank'
            };

            return nirvana.util.extend(options, defaultOption);
        },
        /**
         * 获取关键词的问题描述信息
         * @param {Object} word 关键词对象
         * @return {string}
         */
        corewordProblemRenderer: function(word) {
            // 该重点词已经被修改过，后端还未重新计算，且有倒计时的情况下，显示'--'
            if (this.hasCounter(word)) {
                return getInvalidCellHTML();
            }

//            var wordstat = word.wordstat;
//            var descr = PROBLEM_DESC[wordstat];
//
//            if (!descr) {
//                // 由于一个重点词可能同时具有不在左侧、质量度过低两种问题，只显示质量度过低
//                // 所以这里先判断是不是一星词
//                if (corewordUtil.isQualityLower(word)) {
//                    wordstat = COREWORD_STAT.QUALITY_LOW;
//                } else if (corewordUtil.isNotInLeft(word)) {
//                    wordstat = COREWORD_STAT.NOT_IN_LEFT;
//                } else if (corewordUtil.isNotInLeftFirst(word)) {
//                    wordstat = COREWORD_STAT.NOT_IN_LEFT_FIRST;
//                } else if (corewordUtil.hasNoValidIdea(word)) {
//                    wordstat = COREWORD_STAT.INVALID_IDEA;
//                } else if (corewordUtil.isRankDown(word)) {
//                    wordstat = COREWORD_STAT.RANK_DWON;
//                }
//                descr = PROBLEM_DESC[wordstat];
//            }

            var problemType = corewordUtil.getCorewordProblemType(word);
            var descr = PROBLEM_DESC[problemType];

            return descr ? '<span>' + descr + '</span>' : getInvalidCellHTML();
        },
        /**
         * 获取重点词问题类型值
         * @param {Object} word 重点词数据对象
         * @return {number}
         */
        getCorewordProblemType: function(word) {
            var wordstat = word.wordstat;

            if (!PROBLEM_DESC[wordstat]) {
                // 由于一个重点词可能同时具有不在左侧、质量度过低两种问题，只显示质量度过低
                // 所以这里先判断是不是一星词
                if (corewordUtil.isQualityLower(word)) {
                    wordstat = COREWORD_STAT.QUALITY_LOW;
                }
                else if (corewordUtil.isNotInLeft(word)) {
                    wordstat = COREWORD_STAT.NOT_IN_LEFT;
                }
                else if (corewordUtil.isNotInLeftFirst(word)) {
                    wordstat = COREWORD_STAT.NOT_IN_LEFT_FIRST;
                }
                else if (corewordUtil.hasNoValidIdea(word)) {
                    wordstat = COREWORD_STAT.INVALID_IDEA;
                }
                else if (corewordUtil.isRankDown(word)) {
                    wordstat = COREWORD_STAT.RANK_DWON;
                }
            }
            return wordstat;
        },
        /**
         * 给定的关键词是否不在左侧
         * @param {Object} word 关键词对象
         * @return {boolean}
         */
        isNotInLeft: function(word) {
            return (0 === + word.provavgrank);
        },
        /**
         * 给定的关键词是否不在左侧第一
         * @param {Object} word 关键词对象
         * @return {boolean}
         */
        isNotInLeftFirst: function(word) {
            return ((word.reason & 2) > 0);
        },
        /**
         * 给定的关键词是否没有有效创意
         * @param {Object} word 关键词对象
         * @return {boolean}
         */
        hasNoValidIdea: function(word) {
            return ((word.reason & 128) > 0);
        },
        /**
         * 是否重点词的质量度偏低
         * @param {Object} word 关键词对象
         * @return {boolean}
         */
        isQualityLower: function(word) {
            // 质量度偏低 或 质量度偏低，无法稳定获得推左资格//重点词二期升级去掉
            return (word.reason & 4);/* || (word.reason & 8);*/
        },
        /**
         * 是否重点词的排名下降，用于问题分析里，不用在是否显示下降箭头
         * @param word
         * @return {boolean}
         */
        isRankDown: function(word) {
            return word.reason & 512;
        },
        /**
         * 判断重点词是否符合过滤类型
         * @method isMatchFilterType
         * @param {Object} word 重点词数据对象
         * @param {Number|String} filterType 重点词筛选类别， 其有效值定义见
         * {@link nirvana.aopkg.CorewordDetail#COREWORD_FILTER}
         * @return {boolean}
         */
        isMatchFilterType: function(word, filterType) {
            var result = false,
                wordstat = + word.wordstat;

            switch (+ filterType) {
                case FILTER_TYPES.ALL:
                    result = true;
                    break;
                // 不在左侧判断,现在改用地域排名判断
                case FILTER_TYPES.NOT_IN_LEFT:
                    result = corewordUtil.isNotInLeft(word);
                    break;
                // 预算不足
                case FILTER_TYPES.BUDGET_INSUFFICIENT:
                    result = (
                        wordstat === COREWORD_STAT.ACCOUNT_BUDGET_INSUFFICIENT
                        || wordstat === COREWORD_STAT.PLAN_BUDGET_INSUFFICIENT
                        );
                    break;
                // 质量度过低
                case FILTER_TYPES.QUALITY_LOW:
                    result = corewordUtil.isQualityLower(word);
                    break;
                // 搜索无效
                case FILTER_TYPES.SEARCH_INVALID:
                   result = (wordstat === COREWORD_STAT.SEARCH_INVALID);
                   break;
                // 搜索量过低
                case FILTER_TYPES.SEARCH_LOW:
                    result = (wordstat === COREWORD_STAT.SEARCH_LOW);
                    break;
                case FILTER_TYPES.RANK_DWON:
                    result = !nirvana.util.isEmptyValue(word.rankchg)
                        && +word.rankchg === -1;
                    break;
            }

            return result;
        },
        /**
         * 获取重点词分析筛选各个类别的数量信息
         * @param {Object} 如果不是对已有筛选类别信息的更新，直接传null，
         *                 否则把现有的筛选类别信息传入
         * @param {Array} data 重点词详情数据，具体数据结构详见FE接口文档:
         *                     [{winfoid, showname, ...}, ...]
         * @param {boolean} isRemove 给定的data数据是否是要被移除的数据
         * @return {Object} 包含各个分析筛选类别的数量，数据结构：
         *  {  ALL: 0,
         *     NOT_IN_LEFT: 0,
         *     NOT_IN_LEFT_FIRST: 0,
         *     QUALITY_DESC: 0,
         *     NOT_TAKE_EFFECT: 0
         *  }
         * 具体各个key的定义见{@link nirvana.aopkg.CorewordDetail#COREWORD_FILTER}
         */
        updateCorewordFilterInfo: function(filterInfo, data, isRemove) {
            var isMatch = nirvana.corewordUtil.isMatchFilterType;
            var word;
            var type;

            for (var i = 0, len = data.length; i < len; i ++) {
                word = data[i];
                for (var key in FILTER_TYPES) {
                    type = FILTER_TYPES[key];
                    if (isMatch(word, type)) {
                        if (isRemove) {
                            filterInfo[type] && (filterInfo[type] -= 1);
                        } else {
                            filterInfo[type] += 1;
                        }
                    }
                }
            }

            return filterInfo;
        },
        /**
         * 初始化重点词的过滤信息
         * @param {Array} data 重点词详情数据
         * @return {Object}
         * @see {#updateCorewordFilterInfo}
         */
        initCorewordFilterInfo: function(data) {
            var filterInfo = {};

            // 初始化各个类别的数量为0
            for (var key in FILTER_TYPES) {
                filterInfo[FILTER_TYPES[key]] = 0;
            }

            return nirvana.corewordUtil.updateCorewordFilterInfo(filterInfo, data);
        },

        /**
         * 获取重点词优化包建议操作列的优化建议单元格的对应项
         * @param {Object} word 重点词数据对象
         * @param {boolean=} isDesc 默认false，是否只返回描述信息
         * @return {String} 要被渲染的HTML内容
         */
        getCorewordSuggestType: function(word, isDesc) {
            var reason = + word.reason;
            var noshowreason = + word.noshowreason;
            var isDesc = isDesc || false;

            var opMap = {
                'active_word': {
                    // 表示关键词未生效 且 关键词待激活
                    on: (reason & 32) && (noshowreason & 2),
                    desc: '激活关键词',
                    type: 401
                },
                'run_word': {
                    // 关键词处于暂停状态
                    on: (reason & 32) && (noshowreason & 1),
                    desc: '启用关键词',
                    type: 402
                },
                'add_idea': {
                    // 关键词所在单元无生效创意
                    on: corewordUtil.hasNoValidIdea(word),//(reason & 128),
                    desc: '添加有效创意',
                    type: 403
                },
                'op_accout_budget': {
                    // 关键词未生效 且 用户预算不足
                    on: (reason & 32) && (noshowreason & 256),
                    desc: '优化账户预算',
                    type: 404
                },
                'op_plan_budget': {
                    // 关键词未生效 且 关键词所在计划预算不足
                    on: (reason & 32) && (noshowreason & 512),
                    desc: '优化计划预算',
                    type: 405
                },
                'op_quality': {
                    // 质量度偏低 或 质量度偏低，无法稳定获得推左资格
                    on: corewordUtil.isQualityLower(word),//(reason & 4) || (reason & 8),
                    desc: '优化质量度',
                    type: 406
                },
                'op_bid': {
                    // 不在左侧首屏 或 不在左侧首位 或 左侧没有展现队列
                    // 或 （关键词未生效且关键词搜索无效）
                    on: (reason & 1) || (reason & 2)
                        || (reason & 256) || (reason & 512)
                        || ((reason & 32) && (noshowreason & 16)),
                    desc: '优化出价',
                    type: 407
                }
            };


            var suggestAction = [];
            var opItem;

            // 产生建议操作的HTML
            for (var k in opMap) {
                opItem = opMap[k];
                if (opItem.on) {
                    // html += '<div class="clickable op_suggest '
                    //     + k + '">' + opItem.desc + '</div>';
                    suggestAction.push(
                        (isDesc 
                            ? opItem.type 
                            : {
                                key: k,
                                value: opItem
                            }
                        )
                    );
                }
            }
            return suggestAction;
        },

        /**
         * 获取重点词优化包建议操作列的优化建议单元格渲染的HTML内容
         * 根据reason和noshowreason输出的优化建议的对应关系，详见FE接口文档
         * reason 详见下面定义
         *    //0表示无建议
         *    &1>0表示不在左侧首屏
         *    &2>0表示不再左侧首位
         *    &4>0表示质量度偏低
         *    &8>0表示质量度偏低，无法稳定获得推左资格
         *    &16>0 已在首位
         *    &32>0表示关键词未生效
         *    &64>0 表示该地域未投放
         *    &128>0表示关键词所在单元无生效创意
         *    &256>0 表示左侧没有展现队列
         * noshowReason 其定义见{@link nirvana.corewordUtil#getWordState}注释
         * @param {Object} word 重点词数据对象
         * @return {String} 要被渲染的HTML内容
         */
        corewordSuggestRenderer: function(word) {
            // 该重点词已经被修改过，后端还未重新计算，且有倒计时的情况下，显示'--'
            if (this.hasCounter(word)) {
                return getInvalidCellHTML();
            }

            var suggestAction = nirvana.corewordUtil.getCorewordSuggestType(word);

            var html = '';
            var opItem;
            var i = 0, l = suggestAction.length;

            // 产生建议操作的HTML
            for(; i < l; i++) {
                opItem = suggestAction[i];
                html += '<div class="clickable op_suggest '
                     + opItem.key + '">' + opItem.value.desc + '</div>';
            }

            return html || getInvalidCellHTML();
        },
        /**
         * 对重点词进行排序，对于未在TableHelper.sortMethod找到相应的排序定义，默认按数字排序处理
         * @param {Array} data 要被排序的数据
         * @param {String} orderBy 要排序的列
         * @param {String} orderType 排序的方式，可能取值为{desc|asc}，未传递该参数，默认使用desc排序
         */
        sortCorewordsList: function (data, orderBy, orderType) {
            if (!orderBy) {
                return;
            }

            var orderMethod = nirvana.tableUtil.sorter[orderBy];//nirvana.TableHelper.orderMethod[orderBy];

            if (orderMethod) {
                data.sort(orderMethod(orderType));
            } else {
                // 默认按数字排序
                sortNumArray(data, orderBy, orderType)
            }
        },
        getRecmReasonRenderer: function(reasonTypes, reasonNameMap) {
            return function(item) {
                var remcdReason = +item.recmreason;
                var html = '<div>';
                var recmdType;

                for (var i = 0, len = reasonTypes.length; i < len; i ++) {
                    recmdType = reasonTypes[i];
                    if (remcdReason & recmdType) {
                        html += ('<span class="recmd_cword_reason">'
                            + reasonNameMap[recmdType] + '</span>');
                    }
                }

                html += '</div>';

                return html;
            };
        },
//        /**
//         * 获取推荐重点词的理由的渲染函数
//         * @param {Object} item 推荐重点词
//         * @return {Function}
//         */
//        recmdReasonRenderer: function(item) {
//            var remcdReason = + item.recmreason,
//                RecmdCoreword = nirvana.aopkg.RecmdCoreword;
//
//            var recmdReasonTypes = RecmdCoreword.RECM_ADD_REASON_TYPES,
//                recmdReasonMap = RecmdCoreword.RECM_ADD_RESON_VALUE_MAP;
//
//            var html = '<div>',
//                recmdType;
//
//            for (var i = 0, len = recmdReasonTypes.length; i < len; i ++) {
//                recmdType = recmdReasonTypes[i];
//                if (remcdReason & recmdType) {
//                    html += ('<span class="recmd_cword_reason">'
//                        + recmdReasonMap[recmdType] + '</span>');
//                }
//            }
//
//            html += '</div>';
//
//            return html;
//        },
        /**
         * 获取轮播词推荐的理由
         * @method getBroadCastWordReason
         * @param {number} reason 推荐重点词后端返回的理由的值，具体以接口文档为准
         *                        1高消费，2高操作，4行业热词，3高消费+高操作，
         *                        5高消费+行业，6高操作+行业，7高消费+高操作+行业热词
         * @return {string}
         */
        getBroadCastWordReason: function(reason) { // TODO 后续对照组下掉这个方法可以删掉
            var remcdReason = + reason,
                RecmdCoreword = nirvana.aopkg.RecmdCoreword;

            var recmdReasonTypes = RecmdCoreword.RECM_ADD_REASON_TYPES,
                recmdReasonMap = RecmdCoreword.RECM_ADD_RESON_VALUE_MAP;

            var recmdType;
            for (var i = recmdReasonTypes.length - 1; i >= 0; i --) {
                recmdType = recmdReasonTypes[i];
                if (remcdReason & recmdType) {
                    return recmdReasonMap[recmdType];
                }
            }

            return '';
        },
        /**
         * 检查一下当前要加入的重点词数量是否已经超过上限// TODO 后续对照组下掉这个方法可以删掉
         * @param toAddNum
         * @param existedNum
         * @return {boolean}
         */
        isCorewordExceedLimit: function(toAddNum, existedNum, limitNum) {
            var limit = limitNum || nirvana.aoPkgConfig.NUMBER.COREWORDSLIMIT;
            return (toAddNum + existedNum > limit);
        },
        /**
         * 提示重点词已经超过上限的对话框
         * @param {number} limitNum 允许的上限数量，可选，默认
         *                 nirvana.aoPkgConfig.NUMBER.COREWORDSLIMIT
         */
        alertCorewordExceedLimit: function(limitNum) {
            var content = '重点词数量已达到上限，您只能关注'
                + (limitNum || nirvana.aoPkgConfig.NUMBER.COREWORDSLIMIT) + '个重点词';

            ui.Dialog.alert({
                title: '添加重点词数量超过上限',
                content: content
            });
        },
        /**
         * 提示重点词已经被删除或已经被添加过（关注过）的对话框
         * @param {string} title 对话框的标题
         * @param {string} content 对话框的内容
         */
        alertCorewordExistOrDel: function(title, content) {
            ui.Dialog.alert({
                title: title || '重点词更新失败',
                content: content || '部分重点词已经被删除或者已经被关注导致更新失败'
            });
        },
        /**
         * 提示重点词更新部分成功消息
         */
        alertCorewordUpdateSomeSuccess: function() {
            corewordUtil.alertCorewordExistOrDel('部分重点词更新成功',
                '修改部分已经成功，但有部分未成功，由于部分重点词已经被删除或已经被关注');
        },
        /**
         * 提示重点词添加（关注）失败的对话框
         * @param {number} failResonType 失败的理由类型，
         *                 见{@link nirvana.aopkg.Coreword.MOD_FAIL_TYPE}
         * @param {number} limitNum 允许的上限数量，可选，默认
         *                 nirvana.aoPkgConfig.NUMBER.COREWORDSLIMIT
         */
        alertCorewordAddFail: function(failResonType, limitNum) {
            var FAIL_TYPE = nirvana.aopkg.Coreword.MOD_FAIL_TYPE;
            var util = nirvana.corewordUtil;

            switch (failResonType) {
                case FAIL_TYPE.EXCEED_LIMIT:
                    util.alertCorewordExceedLimit(limitNum);
                    break;
                case FAIL_TYPE.WORD_DEL_ADD:
                    util.alertCorewordExistOrDel();
                    break;
                default:
                    util.alertRequestFail('重点词更新失败');
            }
        },
        /**
         * 是否出现添加的重点词已经被添加过或者被删除
         * @param {number} failResonType 添加失败的原因类型，见
         *                 {@link nirvana.aopkg.Coreword.MOD_FAIL_TYPE}
         * @return {boolean}
         */
        isCorwordExistOrDel: function(failResonType) {
            return (failResonType ===
                nirvana.aopkg.Coreword.MOD_FAIL_TYPE.WORD_DEL_ADD);
        },
        /**
         * 提示重点词删除（取消关注）失败的对话框
         * @param {string} title 出错对话框的标题
         */
        alertCorewordDelFail: function(title) {
            nirvana.corewordUtil.alertRequestFail(title || '取消重点词关注失败');
        },
        /**
         * 重点词删除（取消关注）的确认对话框
         * @param {Function} callback 确认的回调
         * @param {Object} coreword 重点词对象
         */
        confirmCorewordDel: function(callback, coreword) {
            var displayName = '';
            if (coreword && ! (coreword instanceof Array)) {
                displayName = lib.field.getWordRenderer(20)(coreword);
            }

            ui.Dialog.confirm({
                title: '取消&nbsp;"' + displayName + '"&nbsp;关注',
                content: '您是否要取消对该重点词的关注?',
                onok: callback
            });
        },
        /**
         * 提示数据获取异常的对话框，显示的内容将根据给定的标题来生成
         * @param {string} title 出错对话框的标题，不能为空
         */
        alertRequestFail: function(title) {
            var content = title + '，请刷新后重试。';
            ajaxFailDialog(title, content);
        },
        /**
         * 获取重点词包概况页的摘要信息
         * @param {Object} data 重点词包摘要数据
         */
        getPkgOverviewInfo: function(data, isPopup) {
            var keyArr = [
                'budgetnotenoughnum', 'noleftscreennum', 'showqlownum',
                'rankdownnum', 'searchnoeffnum', 'searchlownum'
            ];
            // 每个类型的信息对应的话术，跟上面数组顺序一一对应
            var descArr = [
                '个重点词预算不足',
                '个重点词不在左侧',
                '个重点词质量度过低',
                '个重点词排名下降',
                '个重点词搜索无效',
                '个重点词搜索量过低'
            ];

            // 最多显示的类型信息的数量
            var maxDisplayNum = isPopup ? 6 : 2;
            var sepChar = isPopup ? '，' : '<br/>';
            var counter = 0;
            var html = '';
            var value;
            var hasMoreInfo = false;
            var isExp = nirvana.auth.isCorewordExp();

            for (var i = 0, len = keyArr.length; i < len; i ++) {
                // 对于对照组没有排名下降信息，跳过 TODO 对照组下掉，这个判断逻辑可以去掉
                if (isExp && keyArr[i] === 'rankdownnum') {
                    continue;
                }
                value = data[keyArr[i]];

                if (counter >= maxDisplayNum) {
                    hasMoreInfo = hasMoreInfo || !!value;
                    continue;
                }

                if (value && + value) {
                    if (counter !== 0) {
                        html += sepChar;
                    }

                    html += ('<strong>' + value + '</strong>' + descArr[i]);
                    ++ counter;
                }
            }

            if (hasMoreInfo) {
                html += (sepChar + '<span class="more_pkg_abs">· · ·</span>');
            } else if (isPopup && counter) {
                html += '。';
            }

            return html;
        }
    };

    return corewordUtil;
}($$, nirvana);