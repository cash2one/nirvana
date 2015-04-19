/**
 * @author zhouyu01
 */
msgcenter.util = (function(window, undefined) {

    var baidu = window.baidu, _G = baidu.g, _show = baidu.show, _hide = baidu.hide, _addClass = baidu.addClass, _removeClass = baidu.removeClass, _hasClass = baidu.dom.hasClass;
    var ui = window.ui, _ui_get = ui.util.get;

    var config = msgcenter.config, eventUtil = msgcenter.eventUtil;

    var FLAG2GROUP = config['FLAG2GROUP'], DATE_FLAGS = config['DATE_FLAGS'], UNREAD_CATEGORY_NAV = config.UNREAD_CATEGORY_NAV, UNREAD_CATEGORY_PROP = config.UNREAD_CATEGORY_PROP;

    var MESSAGE_GROUP_CHECK_TPL = '<div class="mc-message-group clearfix"><div class="mc-message-checkbox"><input type="checkbox" title="{{group}}({{count}})" ui="id:Mc{{flag}}CheckBox;type:CheckBox;" /></div><ul class="mc-message-ul">';
    var MESSAGE_LI_TPL = '<li class="{{msgClass}} clearfix"><input type="checkbox" data-msgid="{{msginfoid}}" title="{{groupTime}}" ui="id:Mc{{msginfoid}}CheckBox;type:CheckBox"/><span class="msg-text">{{msghtml}}</span></li>';    
    var TD_HTML = '<td rowspan="{{rowspan}}">{{html}}</td>';

    var objectProtoString = Object.prototype.toString;
    var _isString = function(obj) {
        return objectProtoString.call(obj) === '[object String]';
    };

    var _isNumber = function(obj) {
        return objectProtoString.call(obj) === '[object Number]';
    };

    var _isDate = function(obj) {
        return objectProtoString.call(obj) === '[object Date]';
    }

    // 将事件标识与时间字符串同步
    var _syncFlag2Group = function(flags, groups) {
        var i, len = flags.length;
        for (i = 0; i < len; i++) {
            groups[i] = FLAG2GROUP[flags[i]];
        }
    };

    /**
     * 深拷贝一个date对象
     * 
     * @namespace util
     * @private
     * @param {string|Date} 源date，可以是表示时间的字符串
     * @return {Date} 深拷贝出来的对象
     */
    var _deepCopyDate = function(time) {
        _isString(time) && (time = new Date(time));
        return new Date(+time);
    };


    var _preNumber = function(num, bit) {
        bit || (bit = 2);
        var str = num.toString();
        while(str.length < bit) {
            str = '0' + str;
        }

        return str;
    }

      // 用于储存当前的时间分组的中英文名称
    var CURRENT_GROUP = [], CURRENT_FLAG = [];

    // 将当前的时间按照要求的分组方式来分组
    var GROUP_DATE = (function() {
        var now = new Date(nirvana.env.SERVER_TIME*1000), nowDay = now.getDay() || 7;
        var temp = [], i = nowDay, result = {};

        temp[0] = [_deepCopyDate(now)];


        //本周的各个日子
        while(i > 1){
            temp[temp.length] =  [_deepCopyDate(now.setDate(now.getDate() - 1))];
            i--;
        }


        // 上周的时间段
        var wend =  _deepCopyDate(temp[temp.length-1][0]);
        wend.setDate(wend.getDate() - 1);
        var wstart = _deepCopyDate(wend);
        wstart.setDate(wstart.getDate() - 6);
        temp[temp.length] = [wstart, wend];

        // 更早的时间段
        var mend = _deepCopyDate(wstart);
        mend.setDate(mend.getDate() - 1);
        temp[temp.length] = [new Date(0), mend];

        // 保存当前的日期分组格式
        CURRENT_FLAG = DATE_FLAGS[nowDay];
        _syncFlag2Group(CURRENT_FLAG, CURRENT_GROUP);
        
        // 将分组后的时间段数组返回
        return temp;

    }) ();

    var numReg = /(\d+)/;

    var lastLi, lastStatus;
    var pub;


    return (pub = {
        /**
         * 打开消息中心浮层
         * @param {Object} params
         * {
         * tab: "list"/"set"/"receiver"
         * status: 0/1/2(0未读，1已读, 2全部)
         * category: 0/1/2/3(0全部，1系统，2消费，3优化)
         * }
         */
        openMessageBox: function(params){
            msgcenter.endForSummary();
            msgcenter.endForMIptList();
            nirvana.util.openSubActionDialog({
                id: 'msgcenter',
                title: '消息中心',
                width: 980,
                height: 590,
                actionPath: 'message/messageBox',
                dragable: 0,
                masklevel: 20,
                params: params,
                // 在onbeforeclose中，callback是必须的，它执行了dialog的隐藏以及配置中的onclose的执行
                // 且非处于某些特殊情况，不要传进来其他的参数
                /*onbeforeclose: function(callback) {
                    // 如果changedMap中这个属性为1，那么说明客户已经对配置进行了更改
                    // 那么会弹出二次确认框
                    if (pub.changedMap.hasSetChanged) {
                        ui.Dialog.confirm({
                            title: '确认',
                            content: '您已经对提醒设置做了更改，且这些更改尚未保存，确定不保存这些更改？',
                            onok: function() {
                                callback();
                            },
                            oncancel: function() {
                                this.close();
                                //return false;
                            }
                        });
                    } else {
                        callback();
                    }
                },*/
                onclose: function(){
                    // 重新获取中间层和重要消息弹窗数据
                    msgcenter.getInstantData();
                }
            });
        },

        indexOf: function(arr, item) {
            if (arr.constructor == String) {
                return arr.indexOf(item);
            } else {
                var len = arr.length;
                while (len--) {
                    if (arr[len] == item) {
                        return len;
                    }
                }
                return -1;
            }
        },


        autodec: function(elem, minus) {
            _isString(elem) && (elem = _G(elem));
            !minus && (minus = 1)
            numReg.lastIndex = 0;
            var match = numReg.exec(elem.innerHTML)[1];
            elem.innerHTML = elem.innerHTML.replace(match, parseInt(match, 10) - minus);

        },

		/**
		 * 将时间转化成“今天”“昨天”“前天”
		 * @param {Object} oritime
		 * @auth zhouyu01
		 */
		timeFormat: function(oritime){
			if (_isString(oritime)) {
				var time = baidu.date.parse(oritime);
				var now = new Date(nirvana.env.SERVER_TIME * 1000);
				var hms = oritime.split(" ")[1].split(":");
				var hm = hms[0] + ":" + hms[1];
				function getTime(value){
					var date = new Date(now.getTime());
					date.setDate(date.getDate() + value);
					date.setHours(0, 0, 0, 0);
					return date;
				}
				var today = getTime(0);
				var tomorrow = getTime(1);
				var yesterday = getTime(-1);
				var daybefore = getTime(-2);
				
				if (time < tomorrow && time >= today) {
					return "今天 " + hm;
				}
				if (time < today && time >= yesterday) {
					return "昨天 " + hm;
				}
				if (time < yesterday && time >= daybefore) {
					return "前天 " + hm;
				}
				var ymd = oritime.split(" ")[0].split("-");
				var md = ymd[1] + "/" + ymd[2];
				return md + " " + hm;
			}
		},
		
		
        /*
         * 提取某个时间的年月日字符串，形式：xxxx分隔xx分隔xx
         *
         * @namespace util
         * @param {string|Date} 来源时间
         * @param {string=} separator 分隔符
         * @param {string=} level 显示时间的最低单位
         * @return {string} 年月日字符串
         */
        time2Date: function(time, separator, level) {
            _isString(time) && (time = new Date(time));
            if (!_isDate(time)) {
                throw "时间参数格式异常";
                return false;
            }
            !separator && (separator = '/');
            !level && (level = 'date');
            var rYear = time.getFullYear(), rMonth = _preNumber(time.getMonth() + 1), rDate = _preNumber(time.getDate());
            var rHour = _preNumber(time.getHours()), rMinute = _preNumber(time.getMinutes()), rSeconds = _preNumber(time.getSeconds());
            
            
            if (level == 'seconds') {
                return [rYear, separator, rMonth, separator, rDate, ' ', rHour, separator, rMinute, separator, rSeconds].join('');
            } else if (level == 'date') {
                return [rYear, separator, rMonth, separator, rDate].join('');
            } else if (level == 'minute') {
                return [rYear, separator, rMonth, separator, rDate, ' ', rHour, separator, rMinute].join('');
            } else if (level == 'month') {
                return [rYear, separator, rMonth].join('');
            } else if (level == 'hour') {
                return [rYear, separator, rMonth, separator, rDate, ' ', rHour].join('');
            } else if (level == 'year') {
                return rYear;
            }
        },


        /**
         * 提取某个时间的时分字符串，形式hour:minute
         * 
         * @namespace util
         * @param {string|Date} 来源时间
         * @return {string} 时分字符串
         */
        time2HMinute: function(time) {
            _isString(time) && (time = new Date(time));
            if (!_isDate(time)) {
                throw "时间参数格式异常";
                return false;
            }
            var rHour = _preNumber(time.getHours()), rMinute = _preNumber(time.getMinutes());
            
            return rHour + ':' + rMinute;
        },


        /**
         * 获取元素的某个属性值或设置元素的某个属性为某个值
         * 
         * @namespace util
         * @param {HTMLElement} elem 属性源元素
         * @param {string} prop 属性名
         * @param {string=} val 要设置的值
         */
        attr: function(elem, prop, val) {
            if(typeof val === 'undefined') {
                return elem.getAttribute(prop);    
            } else {
                elem.setAttribute(prop, val);
                return elem;
            }
        },

        /**
         * 用对象来渲染模板字符串中的形如{{ 对象中的key  }}的区域
         *
         * @namespace util
         * @param {string} tpl 包含{{}}占位符的模板字符串
         * @param {Object} obj 包含占位符属性的对象
         * @return {string} 替换占位符后的字符串
         */
        tpl: function(tpl, obj) {

            var reg;
                    
            for (var key in obj) {
                reg = new RegExp('\\{\\{\\s*' + key + '\\s*\\}\\}', 'ig');
                reg.lastIndex = 0;
                var temp = obj[key];
                if ((typeof temp === 'undefined') || (temp == null)) {
                    temp = 'null';
                }
                if ( _isString(temp) || _isNumber(temp)) {
                    tpl = tpl.replace(reg, temp);
                }
            }

            return tpl;
        },


        /**
         * 根据某个规则来提取数组中的项
         * 
         * @namespace util
         * @param {Array} arr 来源数组
         * @param {Function} filter 用来过滤数组中项的方法
         * @return {Array} 提取出来的项
         */
        filter: function(arr, filter) {
            var len = arr.length, ai;
            var result = [];

            for (var i = 0; i < len; i++) {
                ai = arr[i];
                if (filter(ai)) {
                    result[result.length] = ai;
                }
            }

            return result;

            /*while (len--) {
                ai = arr[len];
                if (filter(ai)) {
                    result[i++] = ai;
                }
            }

            return result;*/
        },

        /**
         * 为消息列表中的每条消息中链接绑定点击事件
         * 
         * @namespace util
         * @param {DOMEvent=} evt 事件对象
         * @param {Function=} callback 用于额外做事的方法
         * @param {number=||string=} linkSource 点击的来源处
         */
        messageClickHandler: function(evt, callback, linkSource) {
            var me = this, typeid = pub.attr(me, 'typeid'), planinfo = pub.attr(me, 'href'), planinfo = planinfo && planinfo.split(',');
            var msginfoid = pub.attr(me, 'msginfoid'), categoryid = pub.attr(me, 'data-msgcategory') || 0, msgstatus = pub.attr(me, 'data-status');
            var notRedirect = config.CLICK_NOT_REDIRECT, handler = notRedirect[typeid];
            if (handler && handler.length) {
                // 将处理事件应用到响应的调用处理器的对象上。
                var hParam = handler[2];
                if (typeid == 5) {
                    hParam = hParam.concat(planinfo);
                }
                me.removeAttribute('href');
                handler[0].apply(handler[1], hParam);
            }

            if (typeid == 30) {
                me.removeAttribute('href');
            }



            var logObj = {
                target: 'clickmessage',
                typeid: typeid,
                Ulevelid: nirvana.env.ULEVELID,
                linkSource: linkSource||1
            }

            NIRVANA_LOG.send(logObj);

            if (msgstatus == 0) {
              fbs.message.modMsgStatus({
                    msginfoid: [msginfoid],
                    read: 1,
                    onSuccess: function(response) {
                        if (callback && (response.status == 200)) {
                            callback(msginfoid);
                        } else {
                            var li = me.parentNode.parentNode, ul = li.parentNode;
                            if (lastStatus == 0) {
                                ul.removeChild(li);
                                pub.autodec(ul.previousSibling.childNodes[1]);
                            
                            } else {
                                _removeClass(li, 'mc-message-unread');
                            }
                            if (categoryid != 0) {
                                pub.autodec(UNREAD_CATEGORY_NAV[categoryid]);
                            }
                            
                            
                            pub.autodec(UNREAD_CATEGORY_NAV[0]);
                        }
                    },
                    onFail: function(response) {

                    }
                });  
            }

            var msgcenterDialog = _ui_get('msgcenter')
            if (typeid == 30) {
                if (msgcenterDialog) {
                    _ui_get('McMessageBoxTab').select(1);
                } else {
                    pub.openMessageBox({'tab': 'set'});
                }
                return false;
            }
            
        },

        /**
         * 将数组中的包含time字段的项按照时间分组
         * 该分组方法的最小粒度为天
         * 
         * @namespace util
         * @param {Array} arr 要分组的数组
         * @param {string | Date} start 分组的开始分组
         * @param {string | Date=} end 分组的结束时间
         * @return {Array} 分组后的数组
         */
        groupMessageByDate: function(arr, dateRange) {
            var result = [], i, len, ai;
            
            var start = dateRange[0], end = dateRange[1];

            // 将开始时间定为开始时间当天的00:00:00
            _isString(start) && (start = new Date(start));
            var startYear = start.getFullYear(), startMonth = start.getMonth();
            var startDate = start.getDate();

            start = new Date(startYear, startMonth, startDate, 0, 0, 0);

            // 将结束时间定位在结束时间当天的23:59:59
            if (end) {
                _isString(end) && (end = new Date(end));
                var endYear = end.getFullYear(), endMonth = end.getMonth();
                var endDate = end.getDate();
                end = new Date(endYear, endMonth, endDate, 23, 59, 59);
            } else {
                end = new Date(startYear, startMonth, startDate, 23, 59, 59);
            }


            // 返回过滤后的结果
            return pub.filter(arr, function(item) {
                var date = item.eventTime;
                if (_isString(date)) {
                    var _arr = item.eventTime.split(' ');
                    var _dateArr = _arr[0].split('-'), _timeArr = _arr[1].split(':');
                    date = item.eventTime = new Date(_dateArr[0], parseInt(_dateArr[1], 10)-1, _dateArr[2], _timeArr[0], _timeArr[1], _timeArr[2]||0);
                }
                
                return (date >= start) && (date <= end)
            })
        },

        /**
         * 根据拿到的数据来渲染一个消息列表
         *
         * @namespace util
         * @param {Array} messages 要用来渲染消息列表的消息
         * @param {string || HTMLElement} div 要用来放置消息列表的容器的选择器或容器
         * @param {number=} msgstatus 当前渲染的消息状态
         * @param {number=} start 消息元素在消息数组的开始坐标
         * @param {number=} end 消息元素在消息数组中的结束坐标
         */
        renderMessageList: function(messages, div, msgstatus, start, end) {

            var len = CURRENT_GROUP.length, result = [], messageGroups = [];

            !msgstatus && (msgstatus = 0);
            lastStatus =  parseInt(msgstatus, 10);

            if (!len) {
                return false;
            }

            _isString(div) && (div = _G(div));
            var markAllReadBtn = _ui_get('McMarkAllRead');
            if (msgstatus == 2) {
                markAllReadBtn.disable(1);
            } else {
                markAllReadBtn.disable(0);
            }

            // 设置左侧的消息条数

            (function(unreadNavs, unreadProps, messages, g){
                for (var key in unreadNavs) {
                  var num = messages[unreadProps[key]];
                  (num > 0) && (g(unreadNavs[key]).innerHTML = '(' + num +　')');
                }
            })(UNREAD_CATEGORY_NAV, UNREAD_CATEGORY_PROP, messages, _G);
            /*for (var key in UNREAD_CATEGORY_NAV) {

                _G(UNREAD_CATEGORY_NAV[key]).innerHTML = '(' + messages[UNREAD_CATEGORY_PROP[key]] + ')';
            }*/

            messages = messages.msgdata;
            var mdlen = messages.length;

            if (!mdlen) {
                div.innerHTML = '当前分类下暂无消息';
                _addClass(div, 'no-message-words');
                return false;
            } else {
                _removeClass(div, 'no-message-words');
            }


            !start && (start = 0);
            !end && (end = 49);
            if (mdlen <= end) {
                end = mdlen-1;
            }
            var rmessages = [], r = 0;
            for (var i = start; i <= end; i++) {
                rmessages[r++] = messages[i];
            }
            messages = rmessages;


            // 将消息按照时间分组
            for (i = 0; i < len; i++) {
                messageGroups[i] = pub.groupMessageByDate(messages, GROUP_DATE[i]);
            }

            var mi;
            for (i = 0; i < len; i++) {
                mi = messageGroups[i];
                var temp = [], tj = undefined, j, mlen = mi.length;
                if (mlen) {
                    // 渲染时间分组的checkbox
                    temp[0] = pub.tpl(MESSAGE_GROUP_CHECK_TPL, {
                        'group': CURRENT_GROUP[i],
                        'flag': CURRENT_FLAG[i],
                        'count': mlen
                    });
                    // 填充某个时间分组中的ul中li
                    for (j = 0; tj = mi[j++]; ) {
                        // 将消息文本中的链接文字转换成链接
                        if (tj.linkText) {
                            tj.linkHtml = pub.tpl('<a msginfoid="{{msginfoid}}" data-status="{{status}}" data-msgcategory="{{categoryid}}" target="_blank" typeid="{{typeid}}" {{href}}>{{linkText}}</a>', {
                                'typeid': tj.typeid,
                                'href': tj.linkUrl ? 'href="' + tj.linkUrl + '"' : '',
                                'linkText': tj.linkText,
                                'msginfoid': tj.msginfoid,
                                'categoryid': tj.categoryid,
                                'status': tj.status
                            })
                            tj.msghtml = tj.msgText + tj.linkHtml;
                        } else {
                            tj.msghtml = tj.msgText;
                        }

                        // 如果某条消息的状态为未读，那么将其粗体
                        tj.msgClass = '';
                        (tj.status == 0) && (tj.msgClass = 'mc-message-unread');


                        // 将消息的时间转换成特定格式
                        if ((len - i) < 3 ) {
                            tj.groupTime = pub.time2Date(tj.eventTime) + '&nbsp;&nbsp;' +  pub.time2HMinute(tj.eventTime);
                        } else {
                            tj.groupTime = CURRENT_GROUP[i] + '&nbsp;&nbsp;' + pub.time2HMinute(tj.eventTime);
                        }
                        
                        temp[j] = pub.tpl(MESSAGE_LI_TPL, tj);
                    }
                    temp[temp.length] = '</ul></div>'
                }
                result[result.length] = temp.join('');
            }

            div.innerHTML = result.join('');
            ui.util.init(div);

            
            //_ui_get('McAccountBalanceSelect').fill(config.ACCOUNT_BALANCE_VALUES);



            /*var childs = div.childNodes, clen = childs.length, ci, totalHeight = 0;
            childHeightMap = {};
            for (i = 0; i < clen; i++) {
                ci = childs[i];
                if (_hasClass(ci, 'mc-message-group')) {
                    totalHeight += parseInt(ci.offsetHeight, 10);
                    childHeightMap[totalHeight] = ci;
                }
                
            }

            var msgDialog = _ui_get('msgcenter').getDOM();
            var isBinded = pub.attr(div, 'data-isbinded'), lastci;
            if (!isBinded) {
                eventUtil.delegate(div, 'scroll', {
                    id: 'McMessageList'
                }, function(evt) {
                    var me = this, sHeight = 0, dHeight = 0;
                    var hArray = [], i = 0, ci = null;
                    for (var key in childHeightMap) {
                        hArray[i++] = parseInt(key, 10);
                    }
                    hArray[i] = sHeight = me.scrollTop;
                    hArray = hArray.sort(function(a, b){
                        return a - b;
                    });
                    i  = pub.indexOf(hArray, sHeight);
                    ci = childHeightMap[hArray[i+1]].childNodes[0];
                    dHeight = msgDialog.style.top.replace('px', '');
                    dHeight = parseInt(dHeight, 10) + 75;


                    if (ci) {
                        lastci && (lastci.removeAttribute('style')) && (lastci.parentNode.removeAttribute('style'));
                        pub.attr(ci,'style', 'position:fixed;top:'+ dHeight + 'px; z-index:10;background:#fff;');
                        pub.attr(ci.parentNode, 'style', 'margin-top: 18px;');
                        lastci = ci;
                    }

                    if (evt.stopPropagation) {
                        evt.stopPropagation();
                    } else {
                        evt.cancelBubble();
                    }

                    pub.attr(div, 'data-isbinded', 1);
                })
            }*/

           /* // 检测是否已经绑定过事件了，如果绑定过，那么就不绑定了
            var isBinded = pub.attr(div, 'data-isbinded');
            if (!isBinded) {
                // 将消息内容链中的点击事件托管父元素上
                eventUtil.delegate(div, 'click', 
                    function(elem) {
                        return (elem.nodeName == 'A') && (pub.attr(elem, 'typeid'));
                    }, 
                    pub.messageClickHandler
                ).
                delegate(div, 'click', 
                    // 将消息列表中的每个change
                    function(elem) {
                        return (elem.nodeName == 'input') &&  (elem.type == 'checkbox') && (pub.attr(elem, 'data-msgid'));
                    }, 
                    function(evt, callback) {
                        var me = this, msgid = pub.attr(elem, 'data-msgid');
                        // 记录下选中或取消选中的checkbox，供使用标记勾选已读来使用
                        if (me.checked) {
                            pub.checkedBoxs[msgid] = 1;
                        } else {
                            pub.checkedBoxs[msgid] = 0;
                        }
                    }
                );
                pub.attr(div, 'data-isbinded', 1);
            }*/
            
        },

        /**
         * 将两个特定格式的map按照根据最详细的东西来解构
         * 如map1是{'1': ['2', '3', '4']}, map2是{'2': '5', '3': '6', '4': '9'}
         * 那么解构之后的map会是: {'1': ['5', '6', '9']}
         * @namespace util       * 

         * @param {Object} map1 第一个map
         * @param {Object} map2 第二个map
         * @return {Object} 解构后的map
         */
        destructMap: function(map1, map2) {
            var tempMap = {}, tempSort = [];
            for (var key in map1) {
                var mval1 = map1[key], vlen1 = mval1.length;
                tempMap[key] = [];

                for (var i = 0; i < vlen1; i++) {
                    tempMap[key] = tempMap[key].concat(map2[mval1[i]]);
                }
                tempSort[tempSort.length] = key;
            }
            // 保证key的顺序，由于对对象的for in是唔顺序的
            tempMap['sort'] = tempSort;
            return tempMap;
        },

        /**
         * 根据一系列前后对应的map来生成一个可以生成表格的map
         *
         */
        generateTableMap: function(maps, htmlMaps) {
            var len = maps.length;
            var lastmap, mi;
            while (len--) {
                mi = maps[len];
                
                if (!lastmap) {
                    var tempSort = [];
                    for (var key in mi) {
                        tempSort[tempSort.length] = key;
                    }
                    if (!(mi['sort']) || (mi['sort'].length == 0)) {
                        mi['sort'] = tempSort;
                    }
                    maps[len] = mi;
                } else {
                    mi = maps[len] = pub.destructMap(mi, lastmap);
                }
                lastmap = mi;
            }
            var mlen = maps.length, resultMap = {}, resultSort = [];
            mi = {};
            for (var i=0; i < mlen; i++) {
                // 暂存maps中的当前对象
                mi = maps[i];
                sm = mi.sort;
                // 根据之前排序过后的顺序来遍历对象
                var slen = sm.length;
                for (var j = 0; j < slen; j++) {
                    // 暂存mi中的当，它是一个数组
                    var sj = sm[j], mj = mi[sj], jlen = mj.length;
                    // 遍历value中的项
                    for (var k = 0; k < jlen; k++) {
                        // 暂存mj中的某个value
                        var mk = mj[k];
                        // 置空或者引用
                        var rk = resultMap[mk] = resultMap[mk] || [], rlen = rk.length;
                        rk[rlen] = {};
                        // 记录行跨度
                        if ( k == 0) {
                            rk[rlen].rowspan = jlen;
                            rk[rlen].html = htmlMaps[i][sj];
                        } else {
                            rk[rlen].rowspan = 0;
                        }
                        // 指向maps中每一项的key
                        rk[rlen].id = sj;
                        
                        if (pub.indexOf(resultSort, mk) < 0) {
                            resultSort[resultSort.length] = mk;
                        }
                    }
                    
                    
                }
            };
            resultMap['sort'] = resultSort;
            return resultMap;
        },

        /**
         * 根据一系列map和话术map来生成一个表格
         * 
         */
        generateTable: function(maps, keyMap, suffix) {
            var sorts = maps.sort, slen = sorts.length;
            var ss;
            var result = ['<table class="mc-table mc-table-bordered"><tbody>']
            for (var s = 0; s < slen; s++) {
                ss = sorts[s];
                ms = maps[ss];
                //console.log(ss);
                var mlen = ms.length, mi, k = 1;
                var temp = ['<tr>']
                for (var i = 0; i < mlen; i++) {
                    mi = ms[i];
                    mi.typeid = ss;
                    if (mi.rowspan) {
                        temp[k++] = pub.tpl(TD_HTML, mi);
                    }
                }

                temp[k++] = pub.tpl('<td>' + keyMap[ss] + '</td>', {
                    typeid: ss
                });
                temp[k++] = pub.tpl(suffix, {
                    id: ss
                });
                temp[k] = '</tr>'
                //console.log(temp);
                result[result.length] = temp.join('');
            }
            result[result.length] = '</tbody></table>';

            return result.join('');
        }

    });

    
    
})(window);