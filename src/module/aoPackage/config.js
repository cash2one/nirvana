/**
 * 包控制类库的名字空间 
 */

nirvana.aoPkgConfig = {
	TYPE : {
		SHOWS : '展现量',
		CLKS : '点击量',
		PV : '浏览量'
	},
	DEFAULT_TYPE : 'clks',
	DEFAULT_VALUE : 15,
	
	
	QUERY_FIRST_INTERVAL : 1000,
	QUERY_INTERVAL : 1000,
	QUERY_APPLY_INTERVAL : 1000,

    QUERY_MAX_TRYTIMES : 60,  // 轮询最大请求次数
	
	QUICK_ACCEPT_LIMIT : 500,
	
	EXTEND_LIMIT_SIZE : 1,  // 小于3个子项，默认展开

    NUMBER : {
        COREWORDSLIMIT : 50
    },
	
	// 效果检验状态时，一共有多少天？如果day=这个值，即使进入的当天，可能不显示某些东西
	BIZ_EFF_DAYCOUNT : 7,
	
    // 详情每页默认10条数据，创意默认5条，不在这里配置
    DETAIL_PAGESIZE : 10,
	
	// 老户转全改为500页
    MAX_PAGE : 500,
	
    // 优化详情计划、单元、关键词最长字符限制
    DETAIL_MAX_LENGTH : 26,

    // 智能提词包搜索框输入内容最长支持63个字符，31个汉字
    SEARCHWORD_MAXLEN : 63,
	
	// pkgid与优化包的映射
	KEYMAP : {
		// 效果恢复包
		'1' : 'DECREASE',
		// 扩大商机包
		'2' : 'BUSINESS',
		// 质量度优化包
		'3' : 'QUALITY',
        // 重点词
        '4' : 'COREWORDS',
        // 智能提词
        '5' : 'RECMWORD',
        // 行业领先包
        '6' : 'INDUSTRY',
        // 突降急救包
        '7' : 'EMERGENCY',
        //移动优化包
        '8' : 'MOBILE',
        // 行业旺季包
        '9' : 'SEASON'
	},

    // pkgid与类名的映射
    CLASSMAP : {
        // 效果恢复包
        '1' : 'DecreasePackage',
        // 扩大商机包
        '2' : 'BusinessPackage',
        // 质量度优化包
        '3' : 'QualityPackage',
        // 重点词
        '4' : 'CoreWordsPackage',
        // 智能提词
        '5' : 'RecmwordPackage2',
        // 行业领先包
        '6' : 'IndustryPackage',
        // 突降急救包
        '7' : 'EmergencyPackage',
        //移动优化包
        '8' : 'MobilePackage',
        // 行业旺季包
        '9' : 'SeasonPackage'
    },
	
    // Add by Huiyao 2013.1.7
    AODECR: {
        ERROR: {
            '6003': '效果突降阈值参数错误',
            '6004': '效果突降类型参数错误',
            '6005': '设定阈值不能为空',
            '6006': '设定阈值不是数字',
            '6007': '设定阈值需要大于0并且小于等于100',
            '6008': '设定阈值需要大于0并且小于等于100',
            '6099': '设定阈值需为整数'
        }
    },

	REASON : {
        // 修改关键词出价reason
        1  : '左侧靠前',
        3  : '右侧靠前',
        4  : '-',
        5  : '同行平均',
        6  : '-',
        7  : '排名下降',
        8  : '左侧展现概率下降',
        9  : '展现机会突降',

        // 修改关键词匹配reason
        10 : '建议修改匹配以提升优质词流量',
        11 : '低点击词，推荐放大流量获得更多点击',
        12 : '建议修改匹配以进一步提高质量度',

        // 13/14 reason类型，行业旺季包修改出价优化项引入
        13: '上周您的左侧首屏展现概率为<span class="aopkg_em">{showratio}%</span>，提升至' +
            '<span class="aopkg_em">{targetshowratio}%</span>的参考价格为<span class="aopkg_em">{recmbid}</span>',
        14: '上周您的左侧展现概率为<span class="aopkg_em">{showratio}%</span>，提升至' +
            '<span class="aopkg_em">{targetshowratio}%</span>的参考价格为<span class="aopkg_em">{recmbid}</span>'
	},

    managerAreaPkgs : [
        {
            pkgid : 2,
            description : '帮您网罗低成本点击'
        },
        {
            pkgid : 3,
            description : '帮您提升关键词质量度'
        },
        {
            pkgid : 4,
            description : '为您提供重点词当前排名'
        },
        {
            pkgid : 5,
            description : '帮您挑选各种优质好词'
        }
    ],
	
	SETTING : {
        // 效果急救
        'DECREASE' : {
            // 包ID
            id : 'Decrease',
            // 包名称
            name : '突降急救',
            // 优化包icon 描述
            iconDesc : '突降诊断，恢复点击',
            // 包简介
            description : '挽回突降损失',

            // 限时包标识
            limitTime : true,

            // 是否与弹窗相关，即需要刷新弹窗
            hasPopup : true,

            // 展现配置
            display : {
                buttons : {
                    multiSelectBtn : true, // 是否支持多选，支持时，将展现应用所选按钮
                    closeBtn : true
                }
            },

            dataArea : {
                 // 数据区描述文字
                dataDesc : '<div class="bigger">您帐户{enddate} 比 {begindate}{decrtype}突降{decrpercent}。{decrtype}：<em>{beginvalue} <span class="specFamily">→</span> {endvalue}</em> {flashhandler}</div><div class="dataareadescinfo">其中，突降关键词数：<span class="bluemark">{decrwordnum}</span>个；突降单元数：<span class="bluemark">{decrunitnum}</span>个；突降计划数：<span class="bluemark">{decrplannum}</span>个。</div>',
                // 数据区Flash 
                dataFlash : 'xiaoguohuifu.swf',
                emptyMessage : '数据读取异常，请稍后重试'
            },

            managerArea : {
                managerName : '突降急救建议'
            },


            // 摘要信息配置，如果不配置，说明没有摘要信息，则不会显示
            optimizer : {
                emptyMessage : '<div class="noadvice">当前没有优化建议！</div>',
                applyConfirmMessage : '以上所选都会对您的账户进行修改。请您确认知晓优化建议所进行的操作',

                multiSelect : true,

                // 分级载入摘要，当前仅效果恢复包使用，涉及到参数有两个：hasLevel，以及levelInfo
                // 分级和分组同时存在的可能性当前为0，因此暂时不考虑同时存在的情况
                hasLevel : true,  // 默认为false，如果为true，必须同时有levelInfo的存在
                levelInfo : {
                    levelcount : 3, //共有几个层级
                    flag : 'rank' //不同层级的区分标识
                },

                // 是否有序号，默认为false
                hasRank : true,

                /*
                 *  效果恢复余额不足 101
                 *  效果恢复账户预算不足 102
                 *  效果恢复计划预算不足 103
                 *  效果恢复搁置时段 104
                 *  效果恢复匹配模式 105
                 *  效果恢复计划暂停推广 106
                 *  效果恢复计划被删除 107
                 *  效果恢复单元暂停推广 108
                 *  效果恢复单元被删除 109
                 *  效果恢复自然检索量降低 110
                 *  效果恢复关键词搜索无效 111
                 *  效果恢复关键词不宜推广 112
                 *  效果恢复关键词检索量过低 113
                 *  效果恢复关键词暂停推广 114
                 *  效果恢复关键词被删除 115
                 *  效果恢复出价过低 116
                 */
                
                OPTTYPE : [101, 102, 103, 111, 116, 104, 106, 107, 108, 109, 114, 115, 112, 113, 105, 110],
                extendable : [103, 104],

                /**
                 * 摘要信息中在展现之前进行的替换处理配置，
                 * regex ：要替换的正则或者字符串
                 * value：要替换的值，这里指的是返回数据具体项中的data或者compData中的value属性的值，即如果设定为planname，实际去找data.planname的值
                 * getValue : 可选，对值的自定义处理函数，例如对spectime的自定义处理，参数是当前后端传回的当前项的数据
                 * 
                 * 单个数组元素示例：
                 * {
                 *      regex : /%spectime/g,
                 *      value : 'spectime',
                 *      getValue : function(item){
                 *          return baidu.date.format(new Date(item.data.timestamp), 'HH:mm');
                 *      }
                 *   }
                 */ 
                replaceRegex : {
                    offtime: function(item) {
                        return baidu.date.format(new Date(+item.data.offtime), 'HH:mm');  
                    },

                    link: CLASSICS_PAY_URL,

                    y: function(item) {
                        return item.data.suggestbudget == 0 ? '不限定预算' : item.data.suggestbudget + '&nbsp;元';
                    },
                    n: function(item) {
                        return item.data.count;
                    },
                    plantitle : function(item){
                        return baidu.encodeHTML(item.data.planname);
                    },
                    planname : function(item) {
                        var planname = baidu.encodeHTML(item.data.planname);
                        
                        return getCutString(planname, 20, '..');
                    }
                },
                /*
                 *  效果恢复余额不足 101
                 *  效果恢复账户预算不足 102
                 *  效果恢复计划预算不足 103
                 *  效果恢复搁置时段 104
                 *  效果恢复匹配模式 105
                 *  效果恢复计划暂停推广 106
                 *  效果恢复计划被删除 107
                 *  效果恢复单元暂停推广 108
                 *  效果恢复单元被删除 109
                 *  效果恢复自然检索量降低 110
                 *  效果恢复关键词搜索无效 111
                 *  效果恢复关键词不宜推广 112
                 *  效果恢复关键词检索量过低 113
                 *  效果恢复关键词暂停推广 114
                 *  效果恢复关键词被删除 115
                 *  效果恢复出价过低 116
                 */
                refreshWord : {
                    101 : '正在检查您的账户余额 ...',
                    102 : '正在检查您的账户预算 ...',
                    103 : '正在检查您的计划预算 ...',
                    104 : '正在检查计划的推广时段的设置 ...',
                    105 : '正在检查因修改匹配模式突降的关键词 ...',
                    106 : '正在检查因暂停推广突降的计划 ...',
                    107 : '正在检查因被删除广突降的计划 ...',
                    108 : '正在检查因暂停推广突降的单元 ...',
                    109 : '正在检查因被删除广突降的单元 ...',
                    110 : '正在检查网民搜索量下降的词 ...',
                    111 : '正在检查因搜索无效突降的关键词 ...',
                    112 : '正在检查因不宜推广突降的关键 ...',
                    113 : '正在检查因检索量过低突降的关键词 ...',
                    114 : '正在检查因暂停推广突降的关键词 ...',
                    115 : '正在检查因被删除广突降的关键词 ...',
                    116 : '正在检查因出价过低而平均排名或展现机会突降的关键词 ...'
                },

                afterRenderOptitem : function(item){
                    switch(+item.opttypeid){
                        case 101:
                            if (nirvana.env.ULEVELID == 10104) {
                            var btn = baidu.q('aopkg_link', 'AoPkgOptItem' + item.opttypeid, 'a')[0];
                            btn && baidu.hide(btn);
                            // 并且使checkbox隐藏且disable，且不选中
                            var checkbox = baidu.q('aopkg_checkbox', 'AoPkgOptItem' + item.opttypeid, 'input');
                            baidu.object.each(checkbox, function(item, i){
                                item.checked = false;
                                item.disabled = true;
                                baidu.hide(item);
                            });
                        }
                    }
                }
            }     
        },
		
        // 开拓客源
        'BUSINESS' : {
            // 包ID
            id : 'Business',
            // 包名称
            name : '开拓客源',
			// 优化包icon 描述
			iconDesc : '网罗客户，一个不漏',
            // 包简介
            description : '帮助您开拓客源，网罗客户，提升您的客户访问量',
            
            // 是否有效果检验状态
            hasBizEffect : true,


            // 展现配置
            display : {
                buttons : {
                    multiSelectBtn : true, // 是否支持多选，支持时，将展现应用所选按钮
                    closeBtn : true
                }
            },

            dataArea : {
                // 数据区描述文字
                dataDesc : '<div class="bigger">{effdatadesc}</div><div class="dataareactrl"><div id="AoPkgBusFlashCtrl"></div><div id="AoPkgBusiRightDesc" class="aopkg_dataarea_desc_ralign"></div></div>',
                dataDesc2 : '<div class="bigger">%effdesc</div>',
                emptyMessage : '数据读取异常，请稍后重试',
                // 数据区Flash 
                dataFlash : 'shangji.swf',
                dataFlash2 : 'shangji2.swf'
            },
            
            managerArea : {
                managerName : '优化建议'
            },
            
            // 摘要信息配置，如果不配置，说明没有摘要信息，则不会显示
            optimizer : {
                emptyMessage : '<div class="noadvice">当前没有优化建议！</div>',
                applyConfirmMessage : '以上所选都会对您的账户进行修改。请您确认知晓优化建议所进行的操作',
                
                multiSelect : true,

                // 是否分组展现
                hasGroup : true, // 默认为false，如果为true，必须同时有groupInfo的存在
                // 分组信息，为数组，按照数组顺序展现
                groupInfo : [
                    {
                        groupName: '优化在线时间', // 分组名称
                        OPTTYPE: [201, 202, 206] // 分组中包括的OPTTYPE数组
                    },
                    {
                        groupName: '优化关键词', // 分组名称
                        OPTTYPE: [204, 205] // 分组中包括的OPTTYPE数组
                    },
                    {
                        groupName: '优化出价', // 分组名称
                        OPTTYPE: [203] // 分组中包括的OPTTYPE数组
                    }
                ],

                /*
                 *  账户预算	201
                 *  计划预算	202
                 *  出价  203
                 *  匹配  204
                 *  提词  205
                 *  时段建议 206
                 */
                OPTTYPE : [201, 202, 204, 205, 203, 206],
                
                extendable : [202, 206],
                
                /*
                 *  账户预算	201
                 *  计划预算	202
                 *  出价  203
                 *  匹配  204
                 *  提词  205
                 *  时段建议 206
                 */
                refreshWord : {
                    201 : '正在检查您的账户预算',
                    202 : '正在检查您的计划预算',
                    203 : '正在检查您的关键词出价',
                    204 : '正在检查您的关键词匹配模式',
                    205 : '正在检查可以添加的关键词',
                    206: '正在检查计划的推广时段的设置'
                },

                /**
                 * 摘要信息中在展现之前进行的替换处理配置，
                 * regex ：要替换的正则或者字符串
                 * value：要替换的值，这里指的是返回数据具体项中的data或者compData中的value属性的值，即如果设定为planname，实际去找data.planname的值
                 * getValue : 可选，对值的自定义处理函数，例如对spectime的自定义处理，参数是当前后端传回的当前项的数据
                 * 
                 * 单个数组元素示例：
                 * {
                 *      regex : /%spectime/g,
                 *      value : 'spectime',
                 *      getValue : function(item){
                 *          return baidu.date.format(new Date(item.data.timestamp), 'HH:mm');
                 *      }
                 *   }
                 */

                replaceRegex : {
                    clklost: function(item) {
                        var clklost = item.data.clklost;
                        
                        return clklost || 'hide';
                    },
                    noclklost: function(item) {
                        var clklost = item.data.clklost;
                        
                        if (typeof clklost !== 'undefined' && clklost != null && clklost != 0) {
                            return 'hide';
                        }
                    },
                    modelcount: function(item) {
                        var modelcount = item.data.modelcount;
                        if (modelcount) {
                            return modelcount;
                        } else { // 不存在同行数量，null，则隐藏同行提示话术
                            return 'hide';
                        }     
                    },
                    suggestbudget: function(item) {
                        return item.data.suggestbudget + ' 元';     
                    },
                    plantitle : function(item) {
                        return baidu.encodeHTML(item.data.planname);
                    },
                    planname : function(item) {
                        var planname = baidu.encodeHTML(item.data.planname);
                        
                        return getCutString(planname, 20, '..');
                    }
                }
            }           
        },
		
		// 质量度优化包
		'QUALITY' : {
            // 包ID
            id : 'Quality',
            // 包名称
            name : '质量度优化',
            // 优化包icon 描述
            iconDesc : '吸引网民，降低成本',
			// 包简介
			description : '提供关键词/创意优化建议，辅助提升关键词质量度',
			
            // 展现配置
            display : {
                buttons : {
                    closeBtn : true
                }
            },


            dataArea : {
                // 数据区描述文字
                dataDesc : '<div class="bigger">昨日账户内{worddescinfo}</div><div class="dataareactrl"><div id="AoPkgQuaFlashCtrl" class="aopkg_dataareadesc_selectctrl"><input type="checkbox" ui="id:AoPkgQuaStar3;type:CheckBox;" title="三星词" value="3" /><input type="checkbox" ui="id:AoPkgQuaStar2;type:CheckBox;" title="二星词" value="2" /><input type="checkbox" ui="id:AoPkgQuaStar1;type:CheckBox;" title="一星词" value="1" /></div></div>',
                // 数据区Flash 
                dataFlash : 'zhiliangdu.swf',
                emptyMessage : '数据读取异常，请稍后重试'
            },
			
            managerArea : {
    			managerName : '优化建议'
            },
			
            // 摘要信息配置，如果不配置，说明没有摘要信息，则不会显示
            optimizer : {
                multiSelect : false,
                emptyMessage : '<div class="noadvice">当前没有优化建议！</div>',
                // 是否分组展现
                // 分级和分组同时存在的可能性当前为0，因此暂时不考虑同时存在的情况
                hasGroup : true, // 默认为false，如果为true，必须同时有groupInfo的存在
                // 分组信息，为数组，按照数组顺序展现
                groupInfo : [
                    {
                        groupName: '优化质量', // 分组名称
                        OPTTYPE: [303.1, 303.2, 301] // 分组中包括的OPTTYPE数组
                    },
                    {
                        groupName: '丰富创意', // 分组名称
                        OPTTYPE: [302] // 分组中包括的OPTTYPE数组
                    }
                ],

                // OPTTYPE相关设置
                OPTTYPE : [303.2, 303.1, 301, 302],
                extendable : [303.1, 303.2],
                
                replaceRegex: (function() {
                    // 替换字典
                    var dict = {
                        11: '较易优化', 
                        12: '优化难度中等',
                        13: '较难优化',
                        21: '较易优化', 
                        23: '较难优化' 
                    };
                    // 获得对应的质量度
                    function getTarget(item) {
                        for (var key in dict) {
                            if (typeof item.data['word_cnt_' + key] !== 'undefined') {
                                return key;
                            }
                        }
                    }

                    return {
                        word_cnt: function(item) {
                            var key = getTarget(item);
                            return item.data['word_cnt_' + key];
                        },
                        // 优化难度的描述
                        difficulty: function(item) {
                            var key = getTarget(item);
                            return dict[key];
                        },
                        // 质量度星星的样式
                        num: function(item) {
                            var key = getTarget(item);
                            return key;
                        }
                    }
                })(),

                // 拆分数据
                splitData: (function() {
                    /**
                     * 判断value是否需要显示
                     */
                    function needShow(value) {
                        if (typeof value === 'undefined' || parseInt(value, 10) === 0) {
                            return false;
                        }
                        return true;
                    }

                    /**
                     * compData是个数组，格式为
                     * {
                     *   isnew: xx,
                     *   word_cnt_11: xx,
                     *   ...
                     * }
                     */
                    function buildCompData(data, fields) {
                        var ret = [];
                        baidu.each(fields, function(field) {
                            var value = data[field],
                                obj = {
                                    isnew: data.isnew
                                };

                            if (needShow(value)) {
                                obj[field] = value;
                                ret.push(obj);
                            }
                        });
                        return ret;
                    }

                    return function(items) {
                        // 拿到303的数据
                        var data303;

                        for (var i = items.length - 1; i >= 0; i--) {
                            var status = items[i].status;

                            if (items[i].opttypeid == 303 && status != 1) {
                                data303 = items.splice(i, 1)[0];
                            }
                        }
                        if (!data303) {
                            return;
                        }

                        var compData = data303.compData,
                            data303_1 = baidu.object.clone(data303),
                            data303_2 = baidu.object.clone(data303);

                        data303_1.opttypeid = 303.1;
                        data303_2.opttypeid = 303.2;

                        // 这两个变量标识是否需要加入，如果后端没有传对应的数据
                        // 则compData中没有对应项，所以也就不会遍历到
                        var add303_1, add303_2;
                        baidu.each(compData, function(item) {
                            if (item.startype == 1) {
                                add303_1 = true;
                                data303_1.data = {
                                    isnew: item.isnew,
                                    word_cnt_1: item.count,
                                    optmd5: item.optmd5
                                };
                                data303_1.optmd5 = data303.optmd5;
                                data303_1.compData = buildCompData(item, ['word_cnt_11', 'word_cnt_12', 'word_cnt_13']);
                            } else {
                                add303_2 = true;
                                data303_2.data = {
                                    isnew: item.isnew,
                                    word_cnt_2: item.count,
                                    optmd5: item.optmd5
                                };
                                data303_2.optmd5 = data303.optmd5;
                                data303_2.compData = buildCompData(item, ['word_cnt_21', 'word_cnt_23']);
                            }
                        });

                        if (data303.hasproblem == 0) {
                            items.push(data303_1);
                            items.push(data303_2);
                        } else {
                            if(!add303_1){
                                data303_1.hasproblem = 0;
                            }
                            if(!add303_2){
                                data303_2.hasproblem = 0;
                            }
                            //if (add303_1) {
                                items.push(data303_1);
                            //}
                            //if (add303_2) {
                                items.push(data303_2);
                            //}
                        }
                    }
                })(),
                
                /*
                 *  账户预算	301
                 *  计划预算	302
                 *  出价  303
                 */
                refreshWord : {
                    301 : '正在检查账户内的难推左关键词 ...',
                    302 : '正在检查账户内无生效创意的单元 ...',
                    303 : '正在检查质量度尚待优化的关键词 ...'
                }
            }
        },

        // 重点词
        'COREWORDS' : {
            // 包ID
            id : 'CoreWords',
            // 包名称
            name : '重点词排名',
            // 优化包icon 描述
            iconDesc : '集中分析，快速优化',
            // 包简介
//            description : '&nbsp;', // 由于包配置检查不允许为空，因此只好这么干
            // 是否与弹窗相关，即需要刷新弹窗
            hasPopup : true,
            // 新优化包
            // isNew: true,
            // 标识升级包
//            isUpgrade: true,

            display : {
                buttons : {
                    closeBtn : true
                }
            },

            managerArea : {
                managerName : '优化建议'
            }
        },

        // 智能提词包
        'RECMWORD' : {
            // 包ID
            id : 'Recmword',
            // 包名称
            name : '智能提词',
            // 优化包icon 描述
            iconDesc : '各种好词，一网打尽 ',
            // 包简介
//            description : '根据账户内关键词推广表现，提供智能提词建议，助您把握更多商机',

//            // 展现配置
//            display : {
//                buttons : {
//                    multiSelectBtn : true,
//                    closeBtn : true
//                }
//            },
            // 新优化包
            // isNew: false,

//            dataArea : {
//                // 数据区描述文字
//                dataDesc : '展现量7日趋势',
//                // 数据区Flash
//                dataFlash : 'ticibao.swf',
//                emptyMessage : '数据读取异常，请稍后重试'
//            },
            
//            managerArea : {
//                managerName : '优化建议'
//            },

//            isUpgrade: true,
            optimizer : {
//                emptyMessage : '<div class="noadvice">暂时没有合适的优化建议，您可以尝试在搜索框中输入关键词获取相关网民检索词。</div>',
//                applyConfirmMessage : '以上所选都会对您的账户进行修改。请您确认知晓优化建议所进行的操作',
                /*
                 *  热搜词 501
                 *  潜力词 502
                 *  行业词 504
                 *  质优词 503
                 */
                OPTTYPE : [501, 502, 504, 503]//,

                /**
                 * 摘要信息中在展现之前进行的替换处理配置，
                 * regex ：要替换的正则或者字符串
                 * value：要替换的值，这里指的是返回数据具体项中的data或者compData中的value属性的值，即如果设定为planname，实际去找data.planname的值
                 * getValue : 可选，对值的自定义处理函数，例如对spectime的自定义处理，参数是当前后端传回的当前项的数据
                 * 
                 * 单个数组元素示例：
                 * {
                 *      regex : /%spectime/g,
                 *      value : 'spectime',
                 *      getValue : function(item){
                 *          return baidu.date.format(new Date(item.data.timestamp), 'HH:mm');
                 *      }
                 *   }
                 */ 
//                replaceRegex : {
//                    offtime: function(item) {
//                        return baidu.date.format(new Date(+item.data.offtime), 'HH:mm');
//                    },
//
//                    link: CLASSICS_PAY_URL,
//
//                    y: function(item) {
//                        return item.data.suggestbudget == 0 ? '不限定预算' : item.data.suggestbudget + '&nbsp;元';
//                    },
//                    n: function(item) {
//                        return item.data.count;
//                    },
//                    plantitle : function(item){
//                        return baidu.encodeHTML(item.data.planname);
//                    },
//                    planname : function(item) {
//                        var planname = baidu.encodeHTML(item.data.planname);
//
//                        return getCutString(planname, 20, '..');
//                    }
//                },
                
//                refreshWord : {
//                    501 : '正在生成热搜词 ...',
//                    502 : '正在生成潜力词 ...',
//                    503 : '正在生成质优词 ...',
//                    504 : '正在生成行业词 ...'
//                }
            }
        },
       
        // 行业领先包
        'INDUSTRY' : {
        	// 包ID
            id : 'Industry',
            // 包名称
            name : '行业领先',
            // 优化包icon 描述
            iconDesc : '知己知彼，领跑同行',
            // 包简介
            description : '帮助您全面分析行业推广数据，取长补短，提升您的竞争力',  
            // 新包标识
            // isNew: true,
            display : {
                buttons : {
                    multiSelectBtn : true,
                    closeBtn : true
                }
            },
            dataArea : {
            	// 设置图表区数据获取异常显示的消息
                emptyMessage : '数据读取异常，请稍后重试'
            },
            managerArea : {
                managerName : '优化建议'
            },
            optimizer : {
            	// 行业包不管有没有优化建议都不提示没有优化建议信息
                // emptyMessage : '<div class="noadvice">当前没有优化建议！</div>',
                applyConfirmMessage : '以上所选都会对您的账户进行修改。请您确认知晓优化建议所进行的操作',
                
                multiSelect : true,

                // 是否分组展现
                hasGroup : true, 
                // 分组信息，为数组，按照数组顺序展现
                groupInfo : [
                    {
                        groupName: '查看行业下线时间，优化热门时段', // 分组名称
                        OPTTYPE: [601, 602, 603] // 分组中包括的OPTTYPE数组
                    },
                    {
                        groupName: '查看行业展现情况，覆盖优质流量', // 分组名称
                        OPTTYPE: [604, 605, 606] // 分组中包括的OPTTYPE数组
                    },
                    {
                        groupName: '查看行业排名情况，提高排名水平', // 分组名称
                        OPTTYPE: [607] // 分组中包括的OPTTYPE数组
                    },
                    {
                        groupName: '查看行业质量度分布，降低竞争成本', // 分组名称
                        OPTTYPE: [608] // 分组中包括的OPTTYPE数组
                    }
                ],
                /*
                 *  601 账户预算建议  （ 参考开拓客源的201账户预算）
                 *  602  计划预算建议	  （ 参考开拓客源的202计划预算）
                 *  603 时段建议          （参考效果突降的104搁置时段）
                 *  
                 *  604 行业优质词      （参考智能提词的 501热搜词）
                 *  605 搜索无效词      （参考效果突降的111关键词搜索无效）
                 *  606 关键词匹配模式  （参考开拓客源的204关键词匹配模式）
                 *  
                 *  607 关键词出价       （参考开拓客源的203关键词出价）
                 *  
                 *  608 质量度优化
                 */
                OPTTYPE : [601, 602, 603, 604, 605, 606, 607, 608],
                // 可展开的优化建议项
                extendable : [602, 603],
                // 刷新某条优化建议项显示的信息
                refreshWord : {
                	601 : '正在检查您的账户预算', 
                	602 : '正在检查您的计划预算', 
                	603 : '正在检查计划的推广时段的设置', 
                	604 : '正在检查您是否有需要添加的关键词', 
                	605 : '正在检查因搜索无效导致不能展现的关键词', 
                	606 : '正在检查您的关键词匹配模式', 
                	607 : '正在检查您的关键词出价', 
                	608 : '正在检查您的关键词质量度'
                } 
            }           
        },

        // 突降急救包
        'EMERGENCY': {
            // 包ID
            id: 'Emergency',
            // 包名称
            name: '突降急救',
            // 优化包icon 描述
            iconDesc: '突降诊断，恢复点击',
            // 包简介
            description: '帮助您全面诊断账户突降，定位问题，分析原因，恢复效果',
            // 限时包标识
            limitTime: true,
            // 标识升级包
//            isUpgrade: true,
            // 是否与弹窗相关，即需要刷新弹窗
            hasPopup : true,
            // 展现配置
            display: {
                buttons: {
                    multiSelectBtn: true, // 支持多选，将展现应用所选按钮
                    closeBtn: true
                }
            },
            dataArea: {
                // 数据区Flash
                dataFlash: 'xiaoguohuifu.swf',
                emptyMessage: '数据读取异常，请稍后重试'/*,
                height: 140*/
            },
            optimizer: {
                emptyMessage: '<div class="noadvice">恭喜您，您的推广效果已提升，当前无优化建议！</div>',
                applyConfirmMessage: '以上所选都会对您的账户进行修改。请您确认知晓优化建议所进行的操作',

                multiSelect: true,

                // 是否分组展现
                hasGroup: true,
                // 分组信息，为数组，按照数组顺序展现
                groupInfo: [
                    {
                        groupName: '排名情况突降',
                        OPTTYPE: [718]
                    },
                    {
                        groupName: '可展现机会突降',
                        OPTTYPE: [713, 714, 715, 716]
                    },
                    {
                        groupName: '在线时长突降',
                        OPTTYPE: [701, 703, 707]
                    },
                    {
                        groupName: '历史操作原因',
                        OPTTYPE: [702, 706, 708, 704, 705, 709, 710, 717, 711, 712],
                        // 特殊组定制样式
                        groupTitleClass: 'emergency_pkg_history_group_title'
                    }
                ],
                /*
                 *  701 账户余额为零 （参考老的突降包的101优化项）
                 *  702 账户预算下调 （参考老的突降包的102优化项）
                 *  703 账户预算不足 （参考老的突降包的102优化项）
                 *
                 *  704 计划被删除   （参考老的突降包的107优化项）
                 *  705 计划被暂停   （参考老的突降包的106优化项）
                 *  706 计划预算下调  （参考老的突降包的103优化项）
                 *  707 计划预算不足  （参考老的突降包的103优化项）
                 *
                 *  708 时段设置不合理 （参考老的突降包的104优化项）
                 *  709 单元被删除    （参考老的突降包的109优化项）
                 *  710 单元被暂停    （参考老的突降包的108优化项）
                 *  711 关键词被删除   （参考老的突降包的115优化项）
                 *  712 关键词被暂停   （参考老的突降包的114优化项）
                 *  713 关键词搜索无效 （参考老的突降包的111优化项）
                 *  714 关键词不宜推广 （参考老的突降包的112优化项）
                 *  715 检索量过低    （参考老的突降包的113优化项）
                 *  716 检索量下降    （参考老的突降包的110优化项）
                 *  717 匹配模式缩小   （参考老的突降包的105优化项）
                 *  718 左侧展现概率下降、平均排名下降、展现机会突降 （参考老的突降包的116优化项）
                 */
                OPTTYPE: [
//                    701, 702, 703, 705, 706, 707, 704, 708, 709, 710, 717, 718
                    718, 713, 714, 715, 716, 701, 703, 707, 702,
                    706, 708, 704, 705, 709, 710, 717, 711, 712
                ],
                // 可展开的优化建议项
                extendable: [706, 707, 708],
                // 对可扩展的优化项强制不使用可展开、折叠方式显示，直接按普通list显示
                forceNoExtend: true,
                // 刷新某条优化建议项显示的信息
                refreshWord: {
                    701: '正在检查您的账户余额 ...',
                    702: '正在检查您的账户预算 ...',
                    703: '正在检查您的账户预算 ...',
                    704: '正在检查被删除的计划 ...',
                    705: '正在检查被暂停推广的计划 ...',
                    706: '正在检查您的计划预算 ...',
                    707: '正在检查您的计划预算 ...',
                    708: '正在检查计划的推广时段设置 ...',
                    709: '正在检查被删除的单元 ...',
                    710: '正在检查被暂停推广的单元 ...',
                    711: '正在检查被删除的关键词 ...',
                    712: '正在检查被暂停推广的关键词 ...',
                    713: '正在检查因搜索无效丧失展现资格的关键词 ...',
                    714: '正在检查因不宜推广丧失展现资格的关键词 ...',
                    715: '正在检查因检索量过低丧失展现资格的关键词 ...',
                    716: '正在检查网民搜索量下降导致展现不足的关键词 ...',
                    717: '正在检查匹配模式缩小的关键词 ...',
                    718: '正在检查平均排名显著下降的关键词 ...'
                }
            }
        },
        // 移动优化包
        'MOBILE' : {
            // 包ID
            id : 'Mobile',
            // 包名称
            name : '移动优化',
            // 优化包icon 描述
            iconDesc : '移动发力，抢占先机 ',
            // 包简介
            description : '帮助您优化移动设备推广，提升手机页面的客户访问量',

            // 展现配置
            display : {
                buttons : {
                    closeBtn : true
                }
            },
            // 新优化包
//            isNew: true,

            dataArea : {
                // 数据区描述文字
                dataDesc : '',
                emptyMessage : ''
            },
            
            managerArea : {
                managerName : '优化建议'
            },

            reason : {
                1: '默认访问URL填写了移动页面地址',
                2: '移动访问url被拒绝',
                3: '移动访问URL填写了PC页面地址',
                4: '移动访问URL为空'
            },

            optimizer : {
                emptyMessage : '<div class="noadvice">暂时没有合适的优化建议。</div>',
                /*
                 *  关键词801
                 *  出价建议-搜索无效词802
                 *  出价建议-提高展现803
                 *  移动建站804
                 */
                OPTTYPE : [801, 802, 803, 804, 806, 805, 807],
                multiSelect : false,
                // 是否分组展现
                hasGroup : true, // 默认为false，如果为true，必须同时有groupInfo的存在
                // 分组信息，为数组，按照数组顺序展现
                groupInfo : [
                    {
                        groupName: '添加关键词', // 分组名称
                        OPTTYPE: [801] // 分组中包括的OPTTYPE数组
                    },
                    {
                        groupName: '优化出价', // 分组名称
                        OPTTYPE: [802, 803] // 分组中包括的OPTTYPE数组
                    },
                    {
                        groupName: '优化URL', // 分组名称
                        OPTTYPE: [806,805,807] // 分组中包括的OPTTYPE数组
                    },
                    {
                        groupName: '移动建站', // 分组名称
                        OPTTYPE: [804] // 分组中包括的OPTTYPE数组
                    }
                ],

                /**
                 * 摘要信息中在展现之前进行的替换处理配置，
                 * regex ：要替换的正则或者字符串
                 * value：要替换的值，这里指的是返回数据具体项中的data或者compData中的value属性的值，即如果设定为planname，实际去找data.planname的值
                 * getValue : 可选，对值的自定义处理函数，例如对spectime的自定义处理，参数是当前后端传回的当前项的数据
                 * 
                 * 单个数组元素示例：
                 * {
                 *      regex : /%spectime/g,
                 *      value : 'spectime',
                 *      getValue : function(item){
                 *          return baidu.date.format(new Date(item.data.timestamp), 'HH:mm');
                 *      }
                 *   }
                 */ 
                replaceRegex : {
                    num: function(item) {
                        return item.data.count;
                    }
                },
                
                refreshWord : {
                    801 : '正在检查您是否有需要添加的关键词 ...',
                    802 : '正在检查您的关键词出价 ...',
                    803 : '正在检查因搜索无效导致不能展现的关键词 ...',
                    804 : '正在检查您是否有适合手机访问的移动页面地址 ...',
                    805 : '正在检查您的创意url ...',
                    806 : '正在检查您的关键词url...',
                    807 : '正在检查您的关键词移动url是否为空 ...'
                }
            }
        },
        // 行业旺季包
        'SEASON': {
            // 包ID
            id: 'Season',
            // 包名称
            name: '旺季锦囊',
            // 优化包icon 描述
            iconDesc: '关注旺季，把握商机',
            // 包简介
//            description: '&nbsp;', // 由于包配置检查不允许为空，因此只好这么干
            // 新优化包
//            isNew: true,
            // 展现配置
            display: {
                buttons: {
                    closeBtn: true
                }
            },
            optimizer : {
                /*
                 *  账户预算 901
                 *  计划预算 902
                 *  出价 903
                 *  提词 904
                 *  扩匹配 906
                 */
                OPTTYPE : [901, 902, 903, 904, 906],
                // 分组信息，为数组，按照数组顺序展现
                groupInfo : [
                    {
                        groupName: '提前下线',
                        OPTTYPE: [901, 902]
                    },
                    {
                        groupName: '排名降低',
                        OPTTYPE: [903]
                    },
                    {
                        groupName: '覆盖更多流量',
                        OPTTYPE: [904, 906]
                    }
                ],
                refreshWord: {
                    901: '正在检查您的账户预算 ...',
                    902: '正在检查您的计划预算 ...',
                    903: '正在检查您的关键词出价 ...',
                    904: '正在检查您是否有需要添加的行业旺季词 ...',
                    906: '正在检查您的关键词匹配 ...'
                }
            }
        }
	},
	
	MSG : {
		TIMESTAMP_MSG : '该时间为最近一次分析完成的时间。',
		TIMEOUT : {
			USERACCT : '由于您账户内关键词数量较多，导致此次分析无法全部完成',
			PLANINFO : '由于您计划内关键词数量较多，导致此次分析无法全部完成，建议您选择单元后再次查看',
			UNITINFO : '由于您单元内关键词数量较多，导致此次分析无法全部完成，建议您拆分单元后再次查看',
			DEFAULT : '由于您当前层级关键词数量较多，导致此次分析无法全部完成，建议您选择其他层级再次查看'
		}
	}
}
