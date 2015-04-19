/**
 * 质量度信号灯
 * @author zhujialu
 */
var qStar = (function() {
    var 
    // NOTE: 因为会出现'11,12,13'这种值，所以本模块的值统一全部用string

    // 某星全选的值
    ONE_STAR =   {value: '11,12,13', text: '一星'},
    TWO_STAR =   {value: '21,23',    text: '二星'},
    THREE_STAR = {value: '30',       text: '三星词'},

    // 一星绿 较易优化
    ONE_STAR_GREEN =  {value: '11',  text: '较易优化的一星词'},
    // 一星黄 难度中等
    ONE_STAR_YELLOW = {value: '12',  text: '优化难度中等的一星词'},
    // 一星灰 较难优化
    ONE_STAR_GRAY =   {value: '13',  text: '较难优化的一星词'},

    // 二星绿  较易优化
    TWO_STAR_GREEN =  {value: '21',  text: '较易优化的二星词'},
    // 二星黄  较难优化
    TWO_STAR_YELLOW = {value: '23',  text: '较难优化的二星词'},

    // 这里二星其实分为三种，真假二星都表示较易优化
    // 而一般的处理是，假二星被当作真二星，即最终真二星显示为二星绿
    TWO_STAR_TRUE = TWO_STAR_GREEN,
    TWO_STAR_FALSE =  {value: '22',  text: '较易优化的二星词'},

    // 按难易再分一次
    TWO_STAR_EASY = {value: '21,22',  text: '较易优化的二星词'},
    TWO_STAR_DIFF = TWO_STAR_YELLOW,

    ALL_STAR = [
        ONE_STAR, TWO_STAR, THREE_STAR,
        ONE_STAR_GREEN, ONE_STAR_YELLOW, ONE_STAR_GRAY,
        TWO_STAR_GREEN, TWO_STAR_YELLOW,
        TWO_STAR_TRUE, TWO_STAR_FALSE,
        TWO_STAR_EASY, TWO_STAR_DIFF
    ];
    
    // ====== 三星还没细分呢 =====
    // 这次急着合代码，移动设备就暂时这么处理下
    var MOBILE_TITLE = {
        11 : '一星词',                  
        12 : '一星词',                  
        13 : '一星词',                  
        21 : '二星词',                  
        23 : '二星词',                  
        30 : '三星词'
    },
    MOBILE_DESC = {
        11 : '<b>展现资格：</b>基本没有，建议立即优化关键词与创意相关性及创意撰写水平',
        12 : '<b>展现资格：</b>基本没有，建议立即优化关键词与创意相关性及创意撰写水平',
        13 : '<b>展现资格：</b>基本没有，建议立即优化关键词与创意相关性及创意撰写水平',
        21 : '<b>展现资格：</b>有，但不稳定，建议持续优化创意撰写质量，或尝试提高出价竞争力',
        23 : '<b>展现资格：</b>有，但不稳定，建议持续优化创意撰写质量，或尝试提高出价竞争力',
        30 : '<b>展现资格：</b>有，在出价有竞争力情况下展现可能性很大'
    };

    // 质量度司南 2013/01/10 by Leo Wang(wangkemiao@baidu.com)
    var NEW_TITLE = '&nbsp;';
    var BASIC_QUALITY = {
        0: '<span class="star-basicquality basicquality0"></span>',
        1: '<span class="star-basicquality basicquality1"></span>',
        2: '<span class="star-basicquality basicquality2"></span>'
    };
    var NEW_DESC = {
        // 100 找不到
        IDEA_QUALITY: {
            11: { // 一星绿
                0: '<div class="star-content-title">创意撰写质量：' + BASIC_QUALITY[0] + '</div>'
                    + '<div class="star-content-content">通过优化创意较易提升为二星，建议立即新建或修改创意优化</div>' // 差
            },
            12: { // 一星黄
                0: '<div class="star-content-title">创意撰写质量：' + BASIC_QUALITY[0] + '</div>'
                    + '<div class="star-content-content">优化难度一般，建议通过新建或修改创意等多种优化手段优化</div>' // 差
            },
            13: { // 一星灰
                0: '<div class="star-content-title">创意撰写质量：' + BASIC_QUALITY[0] + '</div>' 
                    + '<div class="star-content-content">较难优化，需要在优化上付出较大努力</div>' // 差
            },
            21: { // 二星绿
                0: '<div class="star-content-title">创意撰写质量：' + BASIC_QUALITY[0] + '</div>'
                    + '<div class="star-content-content">较易优化，建议立即新建或修改创意优化</div>', // 差
                1: '<div class="star-content-title">创意撰写质量：' + BASIC_QUALITY[1] + '</div>'
                    + '<div class="star-content-content">通过优化创意较易提升为三星，建议立即新建或修改创意优化</div>' // 中
            },
            23: { // 二星黄
                1: '<div class="star-content-title">创意撰写质量：' + BASIC_QUALITY[1] + '</div>'
                    + '<div class="star-content-content">较难优化，可尝试提高出价增强竞争力</div>' // 中
            },
            30: { // 三星
                1: '<div class="star-content-title">创意撰写质量：' + BASIC_QUALITY[1] + '</div>'
                    + '<div class="star-content-content">仍有提升空间，请持续优化创意</div>', // 中
                2: '<div class="star-content-title">创意撰写质量：' + BASIC_QUALITY[2] + '</div>'
                    + '<div class="star-content-content">表现良好，请继续保持</div>' // 好
            }
        },
        PAGE_EXP: {
            0: '<div class="star-content-title">目标网页体验：' + BASIC_QUALITY[0] + '</div>'
                + '<div class="star-content-content">较难优化，可尝试提高出价增强竞争力</div>', // 差&不置信
            1: '<div class="star-content-title">目标网页体验：' + BASIC_QUALITY[1] + '</div>'
                + '<div class="star-content-content">较难优化，可尝试提高出价增强竞争力</div>', // 中&不置信
            2: '<div class="star-content-title">目标网页体验：' + BASIC_QUALITY[2] + '</div>'
                + '<div class="star-content-content">表现良好，请继续保持</div>', // 好&不置信
            3: '<div class="star-content-title">目标网页体验：' + BASIC_QUALITY[0] + '</div>'
                + '<div class="star-content-content">建议立即优化网站以提升网站吸引力，或修改访问URL提升目标网页与关键词相关性</div>', // 差&置信
            4: '<div class="star-content-title">目标网页体验：' + BASIC_QUALITY[1] + '</div>'
                + '<div class="star-content-content">建议优化网站以提升网站吸引力，或修改访问URL提升目标网页与关键词相关性</div>', // 中&置信
            5: '<div class="star-content-title">目标网页体验：' + BASIC_QUALITY[2] + '</div>'
                + '<div class="star-content-content">表现良好，请继续保持</div>' // 好&置信
            // 100: '', // 找不到
        }
    };
    // 质量度司南 end 2013/01/10 by Leo Wang(wangkemiao@baidu.com)

    // 这几个是表格中展现星星的详细描述
    var DESC = {};
    DESC[ONE_STAR_GREEN.value] = '<b>左侧展现资格：</b>基本没有<br/><br/><b>较易优化：</b>通过优化获得推左资格的概率相对较大，建议立即通过新建创意或修改创意等优化手段进行优化。';
    DESC[ONE_STAR_YELLOW.value] = '<b>左侧展现资格：</b>基本没有<br/><br/><b>难度中等：</b>通过优化获得推左资格的概率一般，建议通过新建创意或修改创意等多种优化手段进行优化';
    DESC[ONE_STAR_GRAY.value] = '<b>左侧展现资格：</b>基本没有<br/><br/><b>较难优化：</b>通过优化获得推左资格的概率相对较小，需要在优化上付出较大努力以提升广告质量';
    DESC[TWO_STAR_GREEN.value] = '<b>左侧展现资格：</b>有，但不稳定，建议持续优化创意撰写质量，或尝试提高出价竞争力<br/><br/><b>较易优化：</b>通过优化质量度实现左侧展现的难度相对较小，建议立即通过新建创意或修改创意等优化手段进行优化';
    DESC[TWO_STAR_YELLOW.value] = '<b>左侧展现资格：</b>有，但不稳定，建议持续优化创意撰写质量，或尝试提高出价竞争力<br/><br/><b>较难优化：</b>通过优化质量度实现左侧展现的难度相对较大，需要在优化上付出较大努力以提升广告质量';
    DESC[THREE_STAR.value] = '<b>左侧展现资格：</b>有，在出价有竞争力情况下到左侧展现可能性很大。';

    var 
    // 当前项目中，后端传来的，包括数据库中的历史遗留数据可能出现的值
    ALL_VALUES = {},
    
    // 当前项目前端会显示的值，注意是'显示'，如大筛子那显示几种星星
    FE_SHOW_VALUES = (function() {
        // 遍历DESC, 并对key进行升序排序
        var ret = [];
        for (var key in DESC) {
            ret.push(key);
        }
        ret.sort(sortFn);
        
        return ret;
    })(),

    // 当前项目前端需要的值
    FE_VALUES = FE_SHOW_VALUES.concat([ONE_STAR.value, TWO_STAR.value]),

    className = 'star_';

    function isOneStar(value) {
        return value > 10 && value < 20;
    }
    function isTwoStar(value) {
        return value >= 20 && value < 30;
    }
    function isThreeStar(value) {
        return value >= 30 && value < 40;
    }
    /**
     * 是否选择了所有的一星
     * @param {Array} values
     */
    function hasSelectAllOneStar(values) {
        var array = baidu.array;
        if (array.indexOf(values, ONE_STAR_GREEN.value) !== -1 &&
            array.indexOf(values, ONE_STAR_YELLOW.value) !== -1 &&
            array.indexOf(values, ONE_STAR_GRAY.value) !== -1) {
            return true;
        }
        return false;
    }
    /**
     * 是否选择了所有的二星
     */
    function hasSelectAllTwoStar(values) {
        var array = baidu.array;
        if (array.indexOf(values, TWO_STAR_GREEN.value) !== -1 &&
            array.indexOf(values, TWO_STAR_YELLOW.value) !== -1) {
            return true;
        }
        return false;
    }

    

    var 
    // value -> text的全部映射
    value2Text = (function() {
        var ret = {}, star;
        // 遍历ALL_STAR
        for (var i = 0, len = ALL_STAR.length; i < len; i++) {
            star = ALL_STAR[i];
            if (typeof ret[star.value] === 'undefined') {
                ret[star.value] = star.text;
            }
        }
        return ret;
    })(),

    // 大筛子的兼容性处理
    compatibleFilterMap = {
        // 1 转成11 12 13
        1: [ONE_STAR_GREEN.value, ONE_STAR_YELLOW.value, ONE_STAR_GRAY.value],
        // 2 转成 21 23
        2: [TWO_STAR_GREEN.value, TWO_STAR_YELLOW.value],
        // 3 转成 30
        3: [THREE_STAR.value],
        // 以前的二星为20，现在转为21 23
        20: [TWO_STAR_GREEN.value, TWO_STAR_YELLOW.value]
    },
    // 表格的兼容性处理
    compatibleTableMap = {
        20: TWO_STAR_GREEN.value
    }, 



    // 当前项目会用到的质量度提示语
	TITLE = (function() {
        var ret = {}, value;
        // 遍历FE_VALUES
        for (var i = 0, len = FE_VALUES.length; i < len; i++) {
            value = FE_VALUES[i];
            ret[value] = value2Text[value];
        }
        return ret;
    })(),

    // 大筛子部分的搜索提示语
    // 因为调用的地方有时字符串会有中文引号，如“标题”，所以这里要加""，全局配合
    searchTip = (function() {
        var ret = {};
        for (var key in TITLE) {
            ret[key] = '"' + TITLE[key] + '"';
        }
        return ret;
    })();
    
    
    
    
    

    /**
     * 把数字转成字符串
     */
    function parseString(d) {
        var ret = d;
        if (typeof d === 'number') {
            ret = '' + d;
        }
        return ret;
    }

    // 数值纠正处理
    function correct(d) {
        d = parseString(d);

        if (d === TWO_STAR_FALSE.value) {
            return TWO_STAR_TRUE.value;
        }

        if (baidu.array.indexOf(FE_SHOW_VALUES, d) !== -1) {
            return d;
        } else {
            return ONE_STAR_GREEN.value;
        }
    }
    
    /**
     * 注意：row参数是为了新功能提示加的，记得删除
     *
     * 质量度星星
     * @param {Number} d
     */
    function starSet(d, row) {
        d = correct(d);
        var html = '<div class="star_icon ' + className + d + '"';
        if (row == 0) {
            html += ' id="newFunTip" value="' + d + '"';
        }
        html += '></div>';
        return html;
    }
    /**
     * 质量度星星
     * @param {Number} d
     */
    function starSetSpan(d) {
        d = correct(d);
        var html = "<span class='star_icon " + className + d + "'>&nbsp;</span>";
        return html;
    }
    /**
     * 计算关键词优化难度
     */
    function getShowqDifficulty(showqstat) {
        return (parseInt(showqstat/10) == 1) ? showqstat%10 : 0
    }
    /**
     * 计算质量度星级
     */
    function getShowqLevel(showqstat) {
        return parseInt(showqstat / 10);
    }
    //function p(s) {console.log(s);}

    function addBubble(item, me) {
        var winfoid = item.winfoid,
            showqstat = correct(item.showqstat);
        
        var bubble = {
            type : 'normal',
            iconClass : 'ui_bubble_icon_none',
            // bubbleClass: 'ui_bubble_wrap ui_bubble_qstar',
            position:{
                        left: function(tar){
                            var pos = baidu.dom.getPosition(tar);
                            return pos.left - 285;
                        }, 
                        top: function(tar){
                            var pos = baidu.dom.getPosition(tar);
                            return pos.top;
                        }
                    },
            needBlurTrigger : true,
            showByClick : true,
            showByOver : true,				//鼠标悬浮延时显示
            showByOverInterval : 500,		//悬浮延时间隔
            ready: function(fn) {
                // 请求设备属性
                var bubble = this;
                if (typeof item.deviceprefer !== 'undefined') {
                    // 质量度司南 2013/01/10 by Leo Wang(wangkemiao@baidu.com)
                    setTitleDesc(bubble, showqstat, item.deviceprefer, item, me);
                    fn();

                } else {
                    fbs.material.getAttribute('wordinfo', ['deviceprefer'], {
                        condition: {
                            winfoid: [item.winfoid]
                        },
                        onSuccess: function(json) {
                            var device = json.data.listData[0].deviceprefer;
                            item.deviceprefer = device;
                            // 质量度司南 2013/01/10 by Leo Wang(wangkemiao@baidu.com)
                            setTitleDesc(bubble, showqstat, device, item, me)
                            fn();
                        }
                    });
                }
            },
            onshow : function(){			//显示气泡后发送监控
                var isSearch;
                if (me && me.getContext) {
                    isSearch = me.getContext('isSearch') || 0;
                } else {
                    isSearch = 0;
                }

                starID = 'showQTip' + winfoid;
                layer = baidu.g(ui.Bubble.bubbleDiv);
                cellNode = getTableCell();
                baidu.on(document.body, 'mouseover', onMouseover);

                sendLog(item, isSearch);
            }
        };

        ui.Bubble.source['showQTip' + winfoid] = bubble;
    }

    // 质量度司南 2013/01/10 by Leo Wang(wangkemiao@baidu.com)
    function setTitleDesc(bubble, showqstat, device, item, action) {
        var title, desc;
        var me = action;
        var item = item || {};
        if (device == '2') {
            title = MOBILE_TITLE[showqstat];
            desc = MOBILE_DESC[showqstat];
        } else {
            // 如果满足条件，出现新的质量度司南0
            // 质量度司南 2013/01/10 by Leo Wang(wangkemiao@baidu.com)
            // if( 
            //     me && (me.VIEW == 'keywordList' 
            //         || me.VIEW == 'monitorDetail' 
            //         || me.VIEW == 'overviewMonitorDetail'
            //         // || me.VIEW == 'CoreWordsPkg' 
            //         // || me.VIEW == 'QualityPkg'
            //     )
            // ) {
                // title = getNewTitle(item);
                // desc = getNewDesc(item);
                title = NEW_TITLE;
                var desc1 = NEW_DESC.IDEA_QUALITY[showqstat][item.ideaquality] || '';
                var desc2 = NEW_DESC.PAGE_EXP[item.pageexp] || '';
                desc = desc1 + desc2;

                if(!desc) {
                    title = TITLE[showqstat];
                    desc = DESC[showqstat];
                }
            // }
            // // 质量度司南 end 2013/01/10 by Leo Wang(wangkemiao@baidu.com)
            // else {
            //     title = TITLE[showqstat];
            //     desc = DESC[showqstat];
            // }
        }
        bubble.title = title;
        bubble.content = desc;
    }
    // 这一段的逻辑是
    // 当鼠标离开当前star所在的cell或者离开tip浮出层时
    // 隐藏浮出层
    var starID, layer, cellNode;
    /**
     * @return {HTMLTDElement}
     */
    function getTableCell() {
        var el = baidu.g(starID);
        return el.parentNode.parentNode;
    }
    function onMouseover(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;

        // 不需要隐藏，满足以下四个条件即可
        var ret = target === cellNode
                  ||  target === layer
                  ||  baidu.dom.contains(cellNode, target)
                  ||  baidu.dom.contains(layer, target);
               
        if (!ret) {
            ui.Bubble.hide();
            baidu.un(document.body, 'mouseover', onMouseover);
        }
    }

    function sendLog(item, isSearch) {
        var logParams = {
            'target' : 'showq_bubble',
            'issearch' : true,
            'planid' : item.planid,
            'unitid' : item.unitid,
            'wordid' : item.wordid,
            'winfoid' : item.winfoid,
            'showq_level' : getShowqLevel(item.showqstat),
            'showq_difficulty' : getShowqDifficulty(item.showqstat),
            'issearch' : isSearch
        };
        
        NIRVANA_LOG.send(logParams);
    }

    var needTimer, renderTimer = null;
    /**
     * 带有气泡提示和新功能提示的质量度星级
     * @param {Object} item
     * @param {Number} row
     * @param {Object} me 调用这个函数的action
     */
    function starSetWithDescription(item, row, me){
        var winfoid = item.winfoid,
            html = '<div class="ui_bubble" id="showQTip' + winfoid + '" bubblesource="showQTip' + winfoid + '">' +
                     starSet(item.showqstat, row) +
                    '</div>';

        //星级以及优化难度提示
        addBubble(item, me);
        
        if (typeof needTimer === 'undefined') {
            if (me && me.VIEW === 'keywordList' 
                &&  me.getContext && me.getContext('query') == '') {
                needTimer = true; 
            } else {
                needTimer = false;
            }
        }

        if (needTimer) {
            if (renderTimer) {
                clearTimeout(renderTimer);
            }
            renderTimer = setTimeout(renderCompleted, 100);
        }
        

        return html;
    }
    
    /**
     * 整个表格渲染完调用
     */
    function renderCompleted() {
        needTimer = false;
        newFunTip();
    }
    /**
     * 把质量度装配成数组，唯一的不同是字段名，一个叫name，一个叫text
     */
    function getStarArray(fieldName) {
        var ret = [], value, obj;
        for (var i = 0, len = FE_SHOW_VALUES.length; i < len; i++) {
            value = FE_SHOW_VALUES[i];
            obj = {};

            // 设置字段名
            obj[fieldName] = starSetSpan(value);
            obj['value'] = value;

            ret.push(obj);
        }
        return ret;
    }

    function filter(arr) {
        var array = baidu.array;
        // 校正
        array.each(arr, function(item, index) {
            arr[index] = correct(item);
        });

        // 去重
        array.unique(arr);

        // 从小到大排序
        arr.sort(sortFn);
    }
    // 排序函数，给数组的sort()使用
    // 从小到大排序
    function sortFn(value1, value2) {
        return value1 - value2;
    }

    function newFunTip() {
        var starTarget = baidu.g('newFunTip');
        var el = starTarget.parentNode.parentNode;
        var value = +baidu.dom.getAttr(starTarget, 'value');

        // 新功能提示
        ui.Bubble.source.qStar = {
            type : 'tail',
            iconClass : 'ui_bubble_icon_none',
            positionList : [8,7,3,4,1,2,5,6],
            showTimeConfig : 'deadlinedefault',        //显示控制
            deadlinedefault: '2013/03/25',
            needBlurTrigger : true, 
            showByClick : false,
            showByOver : false,             //鼠标悬浮延时显示
            hideByOut: true,
            hideByOutInterval: 1000 * 60,
            autoShow : true,
            autoShowDelay : 0,
            title: '试一试',
            content: '试一试，用鼠标指一指这里' + starSetSpan(21) + '看质量度的更多信息。'
        };

        el.setAttribute('bubblesource', 'qStar');
        baidu.addClass(el, 'ui_bubble');
        ui.Bubble.init([el]);
    }
    return {
        correct: function(d) {
            return correct(d);       
        },
        /**
         * 表格title用到的配置项，这只是最小集合
         * @param {Action} table 这个参数可传可不传，看需要
         */
        getTableField: function(action, params, callback) {
            var ret = {
                        content: function(item, row) {
                            var star = starSetWithDescription(item, row, action);
                            if (typeof callback === 'function') {
                                star = callback(item, star);
                            }
                            return star;      
                        },
                        field : 'showqstat',
                        title: '质量度',
                        width: 50
                    };

            if (params) {
                for (var key in params) {
                    ret[key] = params[key];
                }
            }
            
            return ret;
        },
        /**
         * 表格表头的筛选器
         */
        getTableFilter: function() {
            return getStarArray('text');
        },
        /**
         * 获得表格的单元格
         * @param {Number} value 质量度对应的值，如11
         */
        getTableCell: function(value) {
            return starSet(value);
        },
        /**
         * 高级查询的大筛子
         */
        getFilter: function() {
            return getStarArray('name');
        },
        /**
         * 这个就是简单的行内元素使用
         */
        getStar: function(value) {
            return starSetSpan(value);  
        },
        /**
         * 根据勾选的星星确定对应的话术, 筛子所用
         * @param {Array} arr 如[11, 12]
         * @return {Array} 返回数组是为了适应各种join()，或别的操作
         */
        getSearchTip: function(arr) {
            if (typeof arr.length === 'undefined') {
                // 对象转数组
                var temp = arr, arr = [];
                for (var key in temp) {
                    if (temp[key]) {
                        arr.push(key);
                    }
                }
            }

            filter(arr);

            var array = baidu.array;
            // 把数组拆分成三部分,方便处理
            var oneStarArr = [],
                twoStarArr = [],
                threeStarArr = [];
            
            array.each(arr, function(value) {
                if (isOneStar(value)) {
                    oneStarArr.push(value);

                } else if (isTwoStar(value)) {
                    twoStarArr.push(value);

                } else if (isThreeStar(value)) {
                    threeStarArr.push(value);
                }
            });

            var isOne, isTwo;
            
            if (hasSelectAllOneStar(oneStarArr)) {
                isOne = true;
            }
            if (hasSelectAllTwoStar(twoStarArr)) {
                isTwo = true;
            }

            var newArr = [], push = Array.prototype.push;
            if (isOne) {
                newArr.push(ONE_STAR.value);
            } else {
                push.apply(newArr, oneStarArr);
            }

            if (isTwo) {
                newArr.push(TWO_STAR.value);
            } else {
                push.apply(newArr, twoStarArr);
            }

            if (threeStarArr.length > 0) {
                push.apply(newArr, threeStarArr);
            }

            // 这时开始装配话术
            var ret = [];
            array.each(newArr, function(item) {
                ret.push(searchTip[item]);
            });

            return ret;
        },
        getShowqDifficulty: getShowqDifficulty,
        getValues: function() {
            return FE_SHOW_VALUES;
        },

        // 下面三个方法都是做兼容性处理

        /**
         * 做一些兼容性处理，主要是针对遗留的老数据
         *
         * 通过“我的查询”中的质量度进行查询时，调用此方法
         * @param {Object} values
         *
         * values的格式如下的value：
         * {
         *   key: 'showqstat',
         *   name: '质量度为"xxxxxx"',
         *   title: '质量度',
         *   type: 'checkbox',
         *   value: {
         *     11: 0,
         *     12: 0,
         *     ...
         *   }
         * }
         */
        doCompatibleWithTable: function(values) {
            for (var key in values) {
                var value = values[key];

                var toArray = compatibleFilterMap[key];
                if (toArray) {
                    for (var i = 0, len = toArray.length; i < len; i++) {
                        values[toArray[i]] = value;
                    }
                    delete values[key];
                }
                
            }
        },
        /**
         * 高级查询部分大筛子的兼容性处理
         * @param {Object} obj detail[index]
         */
        doCompatibleWithFilter: function(obj) {
            var value = obj.value;
            if (typeof value !== 'string') return;

            var values = value.split(','), ret = [],
                push = Array.prototype.push;

            for (var i = 0, len = values.length; i < len; i++) {
                value = values[i];
                var toArray = compatibleFilterMap[value];
                if (toArray && toArray.length > 0) {
                    push.apply(ret, toArray);
                    obj.value = ret.join(',');
                }
            }
        },
        /**
         * 高级查询转成表头筛选
         * 如1，要转成11 12 13
         * @param {Object} obj
         */
        advancedSearch2TableFilter: function(obj) {
            var toArray = compatibleFilterMap[obj.value];
            if (toArray) {
                if (toArray.length === 1) {
                    // 上面的大筛子能表示时
                    obj.value = toArray[0];
                    return;
                }

                var values = {}, value;
                // 遍历FE_SHOW_VALUES
                for (var i = 0, len = FE_SHOW_VALUES.length; i < len; i++) {
                    value = FE_SHOW_VALUES[i];
                    if (baidu.array.indexOf(toArray, value) !== -1) {
                        values[value] = 1;
                    } else {
                        values[value] = 0;
                    }
                }

                // 上面的大筛子不能表示时，转到表头 
                obj.key = 'showqstat';
                obj.title = '质量度';
                obj.type = 'checkbox';
                obj.value = values;

            }
            
        }
    }
})();
