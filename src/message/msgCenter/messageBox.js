/**
 * @file src/message/messageCenter/messageBox.js
 * @author peilonghui@baidu.com
 */


 ;(function(window, undefined) {

     // 引用常用外部方法
     var baidu = window.baidu, _G = baidu.g, _Q = baidu.q;
     var _addClass = baidu.addClass, _removeClass = baidu.removeClass, _hasClass = baidu.dom.hasClass;
     var _hide = baidu.hide, _show = baidu.show;

     var _ui_get = ui.util.get, fbs = window.fbs;

     var msgcenter = window.msgcenter, config = msgcenter.config;
     var util = msgcenter.util, eventUtil = msgcenter.eventUtil;

     // 每个tab所对应的内容的div的id
    var TAB_CONTAINER = {
        0: 'McMessageListTabC',
        1: 'McMessageSetsTabC',
        2: 'McMessageReceiversTabC'
    };

    // 每个tab所对应的获取数据方法名，这些方法会是fbs.message的属性
    var TAB_DATA_REQUESTER = {
        0: 'getMsgList',
        1: 'getReminderSets',
        2: 'getContactList'
    };

    // 获取到数据之后将数据呈现在的容器的id
    var TAB_RENDER_CONTAINER = {
        0: 'McMessageList',
        1: 'McMessageSetsTable',
        2: 'McMessageReceiversTable'
    };


    var TAB_CLICK_DISPACHER = {
        0: util.renderMessageList,
        1: renderMessageReminder,
        2: renderMessageRecipients
    }

     var checkdBoxs, changedMap;
     var loadedData;
     var _lastTab, _lastNavLi, _lastStatus, _lastCategory;
     msgcenter.messageBox = new er.Action({
         VIEW: 'messageBox',
         UI_PROP_MAP: {
             'McMessageBoxTab': {
                'title': ['消息列表', '消息设置', '消息接收人设置']
            },
            'McMlPagination': {
                
            },
            'McAddReceiverNameInput': {
                virtualValue: '备注'
            },
            'McAddReceiverMailInput': {
                virtualValue: '邮箱'
            },
            'McAddReceiverCellInput': {
                virtualValue: '11位手机号码'
            }
         },
         INGNORE_STATE: true,
         onafterrender: function() {
             var action = this, create_arg = action.arg;

             // 是否向后端发送请求请求响应的数据取决于绑在当前的tab空间上的一个属性对象 successLoadedTabs;在每次载入弹窗的时候需要将其置空。
             // successLoaded对象中为1的键所对应的tab的数据为加载完成了
             var mctabs = _ui_get('McMessageBoxTab'), successLoadedTabs = mctabs.successLoadedTabs = {};
             // 清空闭包中用于存储数据的变量，
             loadedData = {}; // 用于存储里列表信息，消息设置信息以及联系人信息。这三个信息分别对应的key是1,2,3
             checkedBoxs = {}; // 修改过的Checkbox映射表，每个key是消息的id，如果checkbox从选中状态变成未选中状态，则该对象中key为该id的值从1变成0，反之则从0到1。
             changedMap = {}; // 记录消息设置中所做的更改，这个对象的每个key时每类设置所对应的typeid，每个key对应的值是一个对象{options: '', value: ''},option是一个数字，可以转换为3位2进制的数字
             _lastNavLi = undefined; // 用于记录消息列表tab页中消息状态分类导航中上次点击的nav项
             _lastTab =  _lastCategory = _lastStatus = 0; // _lastTab记录上次点击的tab，以防止重复点击; _lastCategory用于记录上次所渲染的消息列表中消息的分类; _lastStatus用于记录上次渲染的消息列表中消息的状态
             mctabs.onselect = function(tab) {
                 // 判断要去往tab的数据是否加载过，如果加载过，那么就将之前的tab隐藏，并显示要去往的tab
                 var fromTab = TAB_CONTAINER[_lastTab], toTab = TAB_CONTAINER[tab];
                 if (successLoadedTabs[tab]) {
                     if (tab != _lastTab) {
                         _hide(fromTab);
                         _show(toTab);
                     } else {
                         return false;
                     }
                 } else {
                     var tabRequester = fbs['message'][TAB_DATA_REQUESTER[tab]];
                     var requestParam = {
                        onFail: function(response) {
                            // 如果数据加载失败，则弹出错误提示框，并为保险起见，清空loadedData对应的键值
                            // 并将successLoadedTabs中的该tab置为0
                            ajaxFailDialog('数据加载异常', config.DATA_LOAD_ERROR[tab]);
                            loadedData[tab] = {};
                            successLoadedTabs[tab] = 0;
                        }
                     };

                     // 如果tab是消息列表的tab
                     // 那么请求数据时发送的参数还需要categoryid 和status
                     if (tab == 0) {
                        var category = _lastCategory = requestParam.categoryid = create_arg.category = create_arg.category || 0;
                        var status = _lastStatus = requestParam.status = create_arg.status = create_arg.status || 0;
                        // 在进入消息列表tab页的时候，无论数据是否加载成功，左侧的消息状态分类导航都得选中此时所在的分类和状态nav
                        var childs = _G('McMlNavUl').childNodes, clen = childs.length;
                        // 在左侧nav的每一个li上都有两个属性data-status和data-category来区别这个nav指向的数据会是哪个状态和哪个分类
                        for (var i = 0, ci; i < clen; i++) {
                            ci = childs[i];
                            if (ci.nodeType == 3) {
                                continue;
                            } 
                            if ((util.attr(ci, 'data-status') == status) && (util.attr(ci, 'data-category') == category)) {
                                 _addClass(ci, 'mc-current');
                                _lastNavLi = ci;
                                break;
                            }
                        }
                     // 如果要去的tab是消息设置tab，那么发送的参数需要有typeids来判断是要请求那些类消息的配置信息
                     } else if (tab == 1) {
                        requestParam.typeids = config.DEFAULT_TYPEIDS;
                        requestParam.sync = [
                            {
                                from: 1,
                                to: 0
                            }
                        ]
                     }
                    // 当加载数据成功时
                    requestParam.onSuccess = function(response) {
                        var data = response.data;
                        // 如果当前页是消息列表页的话，要根据拿到的消息的数据条数来渲染分页控件
                        if (tab == 0) {
                            var pagination = _ui_get('McMlPagination');
                            // 不能整除50的要+1,101就是3页
                            pagination.total = Math.ceil(data.msgdata.length/50);
                            pagination.page =  1;
                            pagination.render();
                        }
                        // 分配事件
                        TAB_CLICK_DISPACHER[tab](data, _G(TAB_RENDER_CONTAINER[tab]), status);
                        // 记录请求到的数据
                        loadedData[tab] = data;
                        // 成功加载了这个tab
                        successLoadedTabs[tab] = 1;
                    }

                     // 请求具有缓存性，所以在发送请求之前要清除之前相同请求的缓存
                     tabRequester.clearCache();
                     tabRequester(requestParam);
                     // 隐藏from的tab页，显出去往的tab页
                     _hide(fromTab);
                     _show(toTab);
                 }
                 // 记录此次tab
                 _lastTab = tab;
             };

             // 虽然确定取消按钮在消息列表和消息接收人的情况下不会出现，但是它依然存在dom中。
             _ui_get('McMessageSetOk').onclick = action.getSaveAction();
             _ui_get('McMessageSetCancel').onclick = function() {
                 action.onclose();
             }

             // 绑定各个tab页中控件或元素的各种事件
             bindListHandlers();
             bindSetsHandlers();
             bindReceiversHandlers();
         },
         onentercomplete: function() {
             var action = this, create_arg = action.arg;
             // 触发某个个选项卡的切换事件
             _ui_get('McMessageBoxTab').select(config.TAB_ARRAY[create_arg.tab]);
         },
         // onbeforeclose会在dialog的close之前执行，其所接受的第一个参数也是必须接受的参数callback，
         // 这个参数是关闭确认框和当前action的所在dialog的方法，不可省略，不可覆盖
         onbeforeclose: function(callback) {
            // 判断当前的提醒设置是否有更改，如果有更改，那么就弹出二次确认框
            if (changedMap.hasSetChanged) {
                ui.Dialog.confirm({
                    title: '取消设置',
                    content: '您已经对消息设置做了更改，且这些更改尚未保存，确定不保存这些更改？',
                    onok: function() {
                        //this.close();
                        // 解除托管使用的绑定事件
                        unbindListHandlers();
                        unbindSetsHandlers();
                        unbindReceiversHandlers();
                        callback();
                    },
                    oncancel: function() {
                        //this.close();
                        //return false;
                    }
                });
            // 否则就直接执行关闭方法
            } else {
                // 解除托管到各个tab中的某些元素上的事件
                unbindListHandlers();
                unbindSetsHandlers();
                unbindReceiversHandlers();
                callback();
            }
         },
         getSaveAction: function() {
            var action = this;
            return function() {
                // 当且仅当当前的tab为消息设置tab的时候，才会提交，否则会返回false
                if (_lastTab == 1) {
                    var data = [];
                    var error = _G('McMessageSetError'), c5 = changedMap['5'];
                    var okButton = _ui_get('McMessageSetOk');
                    // 如果设置的重点关注计划列表

                    if (c5) {
                        var oldc5 = transSetData['5'];


                        var c5v = c5.value, c5o = c5.options;
                        var c5vc = c5.value5changed, c5oc = c5.options5changed;

                        !c5vc && (c5v = c5.value = oldc5.value);
                        !c5oc && (c5o = c5.options = oldc5.options);


                        c5o = parseInt(c5o.join(''), 2);

                        if ( c5o && !c5v) {
                            error.innerHTML = '请设置提醒计划';
                            _show(error);
                            //okButton.disable(1);
                            return false;
                        } else {
                            _hide(error);
                        }

                        /*var c5o = parseInt(c5.options.join(''), 2), c5v = c5.value;

                        //var c5o = parseInt(c5.options.join(''), 2), c5v = c5.value;

                        if (c5o && !c5v) {
                            c5.value = oldc5.value;
                        }
                        
                        if (c5o && !c5v) {
                            c5.value = oldc5.value;
                        } else if (c5v && !c5o) {
                            c5.options = oldc5.options;
                        } 

                        if ( parseInt(c5.options.join(''), 2)) {
                            if (c5.value.length) {
                                _hide(error);
                                //okButton.disable(0);
                            } else {
                                
                            }
                            
                        }*/
                    }

                    // typeid为8， 9， 10， 11， 12的消息类型是使用的同样的配置
                    var c8 = changedMap['8'];
                    if (c8) {
                        changedMap[12] = changedMap[11] = changedMap[10] = changedMap[9] = c8;
                    }


                    var di, co, i = 0, ci;
                    for (var key in changedMap) {
                        if (key != 'hasSetChanged') {
                            di = data[i++] = {};
                            ci = changedMap[key];
                            if (typeof ci.value === 'undefined') {
                                di.value = transSetData[key].value;
                            } else {
                                di.value = ci.value;
                            }
                            //di.value = 
                            di.typeid = key;
                            co = ci.options || transSetData[key].options;
                            (co.length) && (di.options = parseInt(co.join(''), 2));
                        }
                    }

                    // 消息配置中增加已读同步配置选项，新增字段，so
                    // added by Leo Wang(wangkemiao@baidu.com)
                    // 2013-05-10
                    var syncCheckbox = ui.util.get('McMessageSetsCheckBoxSync');
                    var syncValue = 0;
                    var syncChanged = false;
                    if(syncCheckbox) {
                        syncValue = syncCheckbox.getChecked() ? 1 : 0;
                        if(!loadedData[1].sync
                            || loadedData[1].sync.length == 0
                            || loadedData[1].sync[0].value != syncValue) {
                            syncChanged = true;
                        }
                    }
                    
                    if (!data.length && !syncChanged) {
                        action.onclose();
                        return false;
                    }

                    var postParam =  {
                        data: data,
                        onSuccess: function(response)  {
                            changedMap = {};
                            action.onclose();
                        },
                        onFail: function(response) {
                            error.innerHTML = '设置保存失败，请稍候重试';
                            _show(error);
                        }
                    }
                    if(syncChanged) {
                        postParam.sync = [
                            {
                                from: 1, // 0 - PC/1 - APP
                                to: 0, // 0 - PC/ 1 - APP
                                value: syncValue // 0 - 不同步/1-同步
                            }
                        ];
                    }
                    fbs.message.modReminderSets(postParam);
                } else {
                    return false;
                }
            }
         }
     });

    // 记录当前页是否处于全选当前页的状态
    var allPageChecked = 0;

    var changeCheckboxs = function(checks, checked, callback) {
        var clen = checks.length, ci, cdm;

        if (checked) {
            while(clen--) {
                ci = checks[clen];
                if (ci && (ci.type == 'checkbox')) {
                    ci.checked = 'checked';
                    cdm = util.attr(ci, 'data-msgid');
                    cdm && (checkedBoxs[cdm] = 1);
                }
            } 
        } else {
            while(clen--) {
                ci = checks[clen];
                if (ci && (ci.type == 'checkbox')) {
                    cdm = util.attr(ci, 'data-msgid');
                    ci.checked = false;
                    cdm && (checkedBoxs[cdm] = 0);
                }
            }
        }

        callback && (callback(checked));

    }
    // 绑定消息列表中各个控件的事件
    function bindListHandlers() {
        var currentContainer = TAB_RENDER_CONTAINER[0];
        var UNREAD_CATEGORY_NAV = config.UNREAD_CATEGORY_NAV, UNREAD_CATEGORY_PROP = config.UNREAD_CATEGORY_PROP;


        var selectAllCheckbox = _ui_get('McSelectAll');

        // 全选当前页的消息
        selectAllCheckbox.onclick = function() {
            var parent = _G(TAB_RENDER_CONTAINER[0]), childs = parent.getElementsByTagName('input');
            var clen = childs.length, ci;

            var me = this.main, meChecked = me.checked;
            // 如果是勾选了全选当前页的复选框，那么就将本页的所有消息都勾选
            // 否则就取消其选中状态

            changeCheckboxs(childs, meChecked, function(meChecked) {
                allPageChecked = meChecked ? 1 : 0;
            });

            /*
            if (me.checked) {
                while (clen--) {
                    ci = childs[clen];
                    if (ci && (ci.type == 'checkbox')) {
                        ci.checked = 'checked';
                        checkedBoxs[util.attr(ci, 'data-msgid')] = 1;
                    }
                }
                allPageChecked = 1;
            } else {
                while (clen--) {
                    ci = childs[clen];
                    if (ci && (ci.type == 'checkbox')) {
                        ci.checked = false;
                        checkedBoxs[util.attr(ci, 'data-msgid')] = 0;
                    }
                }
                allPageChecked = 0;
            }*/
        };



        // 将勾选到标为已读
        // 勾选到的msginfoid都会存在checkedboxs对象中，且其对应的value为1
        // 所以获取checkedboxs中值为1的key然后将其添加到
        _ui_get('McMarkSelectedRead').onclick = function() {
            var msginfoids = [], i = 0, ci;
            for (var key in checkedBoxs) {
                if (checkedBoxs[key]) {
                    msginfoids[i++] = key;
                }
            };

            var logObj = {
                target: 'markRead',
                Ulevelid: nirvana.env.ULEVELID,
                markType: 'selected'
            }

            NIRVANA_LOG.send(logObj);
                
            if (!msginfoids.length) {
                return false;
            }

            fbs.message.modMsgStatus({
                msginfoid: msginfoids,
                read: 1,
                onSuccess: function(response) {
                    var unReadLis = _Q('mc-message-unread', currentContainer), ulen = unReadLis.length;
                    var unReadLi = undefined, liInfoid = undefined, liStatus = undefined;
                    var lenBak = ulen;

                    var curLoadedData = loadedData[0];
                    while(ulen--) {
                        unReadLi = unReadLis[ulen].getElementsByTagName('a')[0];
                        liInfoid = util.attr(unReadLi, 'msginfoid');
                        //liStatus = util.attr(unReadLi, 'data-status');
                        liCategory = util.attr(unReadLi, 'data-msgcategory');
                        if (util.indexOf(msginfoids, liInfoid) >= 0) {
                            var li = unReadLi.parentNode.parentNode;
                            if (_lastStatus == 0) {
                                var ul = li.parentNode;
                                ul.removeChild(li);
                                util.autodec(ul.previousSibling.childNodes[1]);
                            } else {
                                _removeClass(li, 'mc-message-unread');
                            }

                            if (liCategory > 0) {
                                util.autodec(UNREAD_CATEGORY_NAV[liCategory]);
                                curLoadedData[UNREAD_CATEGORY_PROP[liCategory]]--;
                            }
                            
                            util.autodec(UNREAD_CATEGORY_NAV[0]);
                            curLoadedData[UNREAD_CATEGORY_PROP[0]]--;
                        }

                    }
                    if (_lastStatus == 0) {
                        loadedData[0].msgdata = util.filter(curLoadedData.msgdata, function(item) {
                            return (util.indexOf(msginfoids, item.msginfoid) < 0);
                        })

                        var pagination = _ui_get('McMlPagination');
                        var newTotal = Math.ceil((loadedData[0].msgdata.length - lenBak)/50);
                        pagination.total = newTotal;
                        if (pagination.page > newTotal) {
                            pagination.select(newTotal - 1);
                        } else {
                            pagination.select(pagination.page - 1);
                        }
                        pagination.render();
                    }
                    

                    
                },
                onFail: function(response) {
                    ajaxFailDialog('设置消息已读失败', '将当前勾选的消息设为已读失败，请稍候重试')
                }
            })
        };

        // 将所有的标为已读
        _ui_get('McMarkAllRead').onclick = function() {
            var msginfoids = [], di, j = 0;
            var data = loadedData[0].msgdata, len = data.length;
            // 判断当前所有消息中的
            for (var i = 0; i < len; i++) {
                di = data[i];
                if (!di.status) {
                    msginfoids[j++]  = di.msginfoid; 
                }
            }

            var logObj = {
                target: 'markRead',
                Ulevelid: nirvana.env.ULEVELID,
                markType: 'all'
            }

            NIRVANA_LOG.send(logObj)

            if (!msginfoids.length) {
                return false;
            }

            fbs.message.modMsgStatus({
                msginfoid: msginfoids,
                read: 1,
                onSuccess: function(response) {
                    var div = _G(currentContainer);

                    div.innerHTML = '全部消息标记已读成功';
                    _addClass(div, 'no-message-words');
                    var pagination = _ui_get('McMlPagination');
                    pagination.total = 0;
                    pagination.page = 0;
                    pagination.render();
                    
                    if (_lastCategory == 0) {
                        for (var key in UNREAD_CATEGORY_NAV) {
                            _G(UNREAD_CATEGORY_NAV[key]).innerHTML = '';
                        }
                    } else {
                        _G(UNREAD_CATEGORY_NAV[_lastCategory]).innerHTML = '';
                        util.autodec(UNREAD_CATEGORY_NAV[0], msginfoids.length);
                    }
                },
                onFail: function(response) {
                    ajaxFailDialog('设置消息已读失败', '将全部消息设为已读失败，请稍候重试');
                }
            })
        };


        // 将右侧选中某个状态及某个分类的消息的点击事件托管到其ul上
        eventUtil.delegate('McMlNavUl', 'click', 
            function(target) {
                return findAncestorNode(target, 'LI', 'McMlNavUl');
                
            }, 
            function(evt) {
                var me = findAncestorNode(this, 'LI', 'McMlNavUl'), status = util.attr(me, 'data-status'), category = util.attr(me, 'data-category');
                _ui_get('McMlPagination').isSettedTotal = 0;
                _removeClass(_lastNavLi, 'mc-current');
                _addClass(me, 'mc-current');
                checkedBoxs = {};
                _lastNavLi = me;
                _lastStatus = status;
                _lastCategory = category;
                _ui_get('McSelectAll').setChecked(0);
                fbs.message.getMsgList.clearCache();
                fbs.message.getMsgList({
                    categoryid: category,
                    status: status,
                    onSuccess: function(response) {
                        var data = loadedData[0] = response.data;
                        //util.renderMessageListNavigator(data);
                        TAB_CLICK_DISPACHER[0](data, TAB_RENDER_CONTAINER[0], status);

                        var pagination = _ui_get('McMlPagination');
                        pagination.total = Math.ceil(data.msgdata.length/50);
                        pagination.page = 1;
                        pagination.render();


                    },
                    onFail: function(response) {
                        ajaxFailDialog('数据加载异常', '当前类型消息数据加载异常，请稍候重试');
                    }
                })
            }
            );
        
        

        eventUtil.delegate(currentContainer, 'click', 
            function(elem) {
                return (elem.nodeName == 'A') && (util.attr(elem, 'typeid'));
            },
            util.messageClickHandler
            ).delegate(currentContainer, 'click',
            function(elem) {
                return (elem.nodeName == 'INPUT') && (elem.type == 'checkbox') && (elem.parentNode.nodeName == 'LI') && (!!util.attr(elem, 'data-msgid'));
            },
            function(evt) {
                var me = this, msgid = util.attr(me, 'data-msgid');
                if (me.checked) {
                    checkedBoxs[msgid] = 1;
                } else {
                    checkedBoxs[msgid] = 0;
                    if (allPageChecked) {
                        selectAllCheckbox.main.checked = false;
                    }
                    var groupCheck = me.parentNode.parentNode.previousSibling.childNodes[0];
                    if (groupCheck.checked) {
                        groupCheck.checked = false;
                    }
                }
            }).delegate(currentContainer, 'click',
            function(elem) {
                return (elem.nodeName == 'INPUT') && (elem.type == 'checkbox') && (_hasClass(elem.parentNode, 'mc-message-checkbox'));
            },
            function(evt) {
                var me = this, ul = me.parentNode.nextSibling;
                while(ul) {
                    if (ul.nodeName == 'UL') {
                        break;
                    }
                    ul = ul.nextSibling;
                }

                var childs = ul.getElementsByTagName('input');
                var meChecked = me.checked;
                changeCheckboxs(childs, meChecked, function(meChecked) {
                    if (!meChecked) {
                        if (allPageChecked) {
                            selectAllCheckbox.main.checked = false;
                        }
                    }
                })
                /*
                if (me.checked) {
                    while (clen--) {
                        ci = childs[clen];
                        ci.checked = 'checked';
                        cdm = util.attr(ci, 'data-msgid');
                        cdm && (checkedBoxs[cdm] = 1);
                        //checkedBoxs[util.attr(ci, 'data-msgid')] = 1;
                    }
                } else {
                    while (clen--) {
                        ci = childs[clen];
                        ci.checked = false;
                        cdm = util.attr(ci, 'data-msgid');
                        cdm && (checkedBoxs[cdm] = 0);
                        //checkedBoxs[util.attr(ci, 'data-msgid')] = 1;
                    }
                    if (allPageChecked) {
                        _ui_get('McSelectAll').main.checked = false;
                    }
                }*/
            });

        // 分页按钮的选中事件
        _ui_get('McMlPagination').onselect = function(page) {
            // 参数page是从1开始的所以要计算每页要渲染的消息的始终数
            var start = (page - 1) * 50, end = page * 50 -1;
            TAB_CLICK_DISPACHER[0](loadedData[0], _G(currentContainer), _lastStatus, start, end);
            if (allPageChecked) {
                selectAllCheckbox.main.checked = false;
            }
            checkedBoxs = {};
        }

        // 消息配置中增加已读同步配置选项，新增字段，so
        // added by Leo Wang(wangkemiao@baidu.com)
        // 2013-05-10
        // var syncCheckbox = ui.util.get('McMessageSetsCheckBoxSync');
        // if(syncCheckbox) {
        //     syncValue = syncCheckbox.getChecked() ? 1 : 0;
        //     // syncCheckbox.onclick = 
        // }


    }

    function unbindListHandlers() {
        eventUtil.undelegate(TAB_RENDER_CONTAINER[0]).undelegate('McMlNavUl');
    }

    var CHECKBOXS_HTML = '<td class="td-checkbox">' +
                          '<input title="站内信" data-typeid="{{id}}" data-loc="2" type="checkbox" ui="id:McMessageSetsCheckBox{{id}}2;type:CheckBox;" />' +
                          '<input title="短信" data-typeid="{{id}}" data-loc="1" type="checkbox" ui="id:McMessageSetsCheckBox{{id}}1;type:CheckBox;" />' +
                          '<input title="邮件" data-typeid="{{id}}" data-loc="0" type="checkbox" ui="id:McMessageSetsCheckBox{{id}}0;type:CheckBox;" /></td>';
    var transSetData = {};


    // 将十进制数转换为二进制，转换后的字符串不足三位会进行补全
    var _toBinary = function(num) {
        num = +num;
        var bin = '', i = 0;
        while ( num > 0 ) {
            if ( num % 2) {
                bin = '1' + bin;
            } else {
                bin = '0' + bin;
            }
            num = parseInt(num/2);
        }
        var left = 3 - bin.length;
        if (left > 0) {
            while (left--) {
                bin = '0' + bin;
            }
        }
        return bin.split('');
    };
    /**
     * 根据拿到的消息配置信息来渲染一个消息配置表格
     * 
     * @namespace util
     * @param {Array} reminders 要用来渲染消息配置表格的额数据源
     * @param {string || HTMLElement} div 要用来放置消息列表的容器的选择器或容器
     */
    function renderMessageReminder(data, div) {
        // 获得要填充的innerHTML然后填充到容器中，并ui初始化
        var tableMap = util.generateTableMap([config.CATEGORY_SUB,
                                              config.SUB_DETAIL
                                             ],
                                             [config.SET_CATEGORY_MAP,
                                              config.SUB_CATEGORY_MAP
                                             ]
                                             );
        var tableHtml = util.generateTable(tableMap, config.MESSAGE_DETAIL_MAP, CHECKBOXS_HTML);
        div.innerHTML = tableHtml;
        ui.util.init(div);

        // 需要禁用的checkboxs，设置选中并禁用
        var disable_checks = config.DISABLE_CHECKS, dk;
        for (var key in disable_checks) {
            dk = disable_checks[key];
            var dlen = dk.length, duk;
            for (var i = 0; i < dlen; i++) {
                if (dk.charAt(i) == '1') {
                    duk = _ui_get('McMessageSetsCheckBox' + key + i);
                    duk.main.checked = 'checked';
                    duk.disable(1);
                }
            }
        }


        // 抽取设置某个typeid的checkboxs的选中状态
        var disChecks = function(typeid, options) {
            var len = options.length, ci;

            // while(len--) {
            //     ci = _ui_get('McMessageSetsCheckBox' + typeid + len);
            //     if (options[len] == '1') {
            //         if (ci && !ci.getState('disabled')) {
            //             ci.main.checked = 'checked';
            //         }
            //     } else {
            //         if (ci && !ci.getState('disabled')) {
            //             ci.main.checked = false;
            //         }
            //     }
            // }


            /**
             * 此时，options=11 => 1011的话
             * 对应状况如下：
                二进制：       1               0       1       1
                对应关系：    最高位当前弃用  站内信  短信    邮件
                checkbox取值： -               2       1       0
             *
             * So，可以看到的是，即使再增加高位，例如11011
                实际上当前处理（至20130523）的还是后面三位
                但是，如果跨位支持checkbox咋办？
                    例如11011，我要求position 0,2,3,4支持checkbox，
                    pos=1的那位不需要checkbox的话？
                搞个map映射吧，写在config中
                暂时只是修改了获取数据并展现，保存先不调整了

             * 在config中
                MSG_CUSTOM: {
                
                    值为区分标识，例如：
                        'McMessageSetsCheckBox' + typeid + len
                        就是这个len，typeid是用来区分行 or 设置类型的
                    
                    CHECKBOX: {
                        EMAIL: 0,
                        SMS: 1,
                        STATION_LETTER: 2
                    }
                }

             * @author Leo Wang(wangkemiao@baidu.com)
             * 2013/05/23 消息中心升级，增加了一个最高位，却不展现
             */
            var tempOptions = options.join('');
            var tempLen = tempOptions.length;
            // 当前只支持3个
            tempOptions = tempOptions.substring(
                tempLen - config.MSG_CUSTOM.CHECKBOXCOUNT
            ).split('');

            var pos;
            for(var cbox in config.MSG_CUSTOM.CHECKBOX) {
                pos = config.MSG_CUSTOM.CHECKBOX[cbox];
                ci = _ui_get('McMessageSetsCheckBox' 
                    + typeid
                    + pos);
                if (tempOptions[pos] == '1') {
                    if (ci && !ci.getState('disabled')) {
                        ci.main.checked = 'checked';
                    }
                } else {
                    if (ci && !ci.getState('disabled')) {
                        ci.main.checked = false;
                    }
                }
            }
            
        }

        
        // 将拿到的每种类型的提醒设置信息从数组的形式转换成对象形式，然后将每个项中的options由数转换成二进制数组
        var len = data.options.length, di, dt, dto, dc;
        for (var i = 0; i < len; i++) {
             di = data.options[i];
             dt = di.typeid;
             dto = di.options = _toBinary(di.options);
             transSetData[dt] = di;

             disChecks(dt, dto);
             /*var olen = dto.length;
             for (var j = 0; j < olen; j++) {
                 if (dto[j] == '1') {
                     dc = _ui_get('McMessageSetsCheckBox' + dt + j);
                     if (dc && !dc.getState('disabled')) {
                         dc.main.checked = 'checked';
                     }
                 }
             }*/
        }

        transSetData[12] = transSetData[11] = transSetData[10] = transSetData[9] = transSetData[8];

        // 表格中除了checkbox外的其他ecui控件
        // 账户当日消费限额，和变更重点关注的计划
        var accountCost = _ui_get('McAccountCost'), addImportantBtn = _ui_get('McAddImportantPlans');
        var accountCostTypeid = accountCost.typeid, addPlansTypeid = addImportantBtn.typeid;
        accountCost.setValue(transSetData[accountCostTypeid].value);

        var addPlansValue = transSetData[addPlansTypeid].value;

        // 如果添加重点计划拿到的planids是空，那么就将其转换成空字符串，否则则转换成其对应的字符串
        if (!addPlansValue) {
            addPlansValue = '';
        } else {
            addPlansValue = addPlansValue.toString();
        }

        
        // 用来显示重点计划名的span
        var planNamesSpan = _G('McImportantPlans');
        planNamesSpan.onclick = function() {
            addImportantBtn.onclick();
        }

        // 如果重点关注计划值的字符串是空字符串，那么重点计划名span的内容是所设置计划，
        // 且点击了这几个字的话会跳转到添加计划的Dialog
        if (addPlansValue.length <= 0) {
            planNamesSpan.innerHTML = '所设置计划';
            addImportantBtn.mcImportantPlans = '';
        } else {
            // 如果不为空，那么就将planids分割成数组然后请求其对应的planname将其渲染到重点计划名span上
            fbs.plan.getNameList({
                condition: {
                    planid: addPlansValue.split(',')
                },
                onSuccess: function(response) {
                    var data = response.data.listData;
                    var len = data.length, result = [], i = 0, di;

                    var objData = {};
                    while (len--) {
                        di = data[len];
                        objData[di.planid] = di;
                    }

                    var planids = addPlansValue.split(',');
                    if (planids.length > len) {
                        planids = util.filter(planids, function(item) {
                            return !!objData[item];
                        })
                    }

                    // 将plandids字符串挂接到变更重点计划的按钮上
                    transSetData['5'].value = addImportantBtn.mcImportantPlans = planids.join(',');
                    if (!planids.length) {
                        transSetData['5'].options = ['0', '0', '0'];
                        disChecks('5', transSetData['5'].options);
                    }

                    for (var key in objData) {
                        result[i++] = objData[key].planname;
                        if (i > 2) {
                            break;
                        }
                    }
                    /*var planids = addPlansValue.split(','), idlen = planids.length;


                    if (idlen > len) {
                        data = util.filter(data, function(item) {
                            return util.indexOf(planids, item.planid) !== -1;
                        })
                    }*/
                    if (result.length) {
                        planNamesSpan.innerHTML = result.join(',');
                        _G('McImportantPlansSuffix').innerHTML = '等重点计划';
                    } else {
                        planNamesSpan.innerHTML = '所设置计划';
                    }
                    
                },
                onFail: function(response) {
                    ajaxFailDialog('重点计划加载失败', '重点计划列表加载失败，请稍候重试')
                }
            })
        }

        




        // 余额低于阈值的select的初始值fill
        var mcBalanceSelect = _ui_get('McAccountBalanceSelect');
        mcBalanceSelect.fill(config.ACCOUNT_BALANCE_VALUES);
        var curBalanceValue = util.filter(data.options, function(item) { return item.typeid == 1; } );
        if (curBalanceValue.length) {
            curBalanceValue = curBalanceValue[0].value;
        } else {
            curBalanceValue = 100;
        }
        mcBalanceSelect.setValue(curBalanceValue);
        mcBalanceSelect.onselect = function(value) {
            var typeid = mcBalanceSelect.typeid;
            var ct = changedMap[typeid] = changedMap[typeid] || {};
            ct.value = value;
        }

        var showCostError = function(errorP, str) {
            errorP.innerHTML = str;
            _show(errorP);
            _ui_get('McMessageSetOk').disable(1);
        }   

        // 账户当日消费的限额的change事件
        accountCost.onchange = function() {
            var typeid = accountCost.typeid, value = accountCost.getValue();
            var error = _G('McAccountCostInputError');
            // 要判断设定的限额是否小于0，小数点后是否超过了两位，并即时更新提交按钮的状态
            var numValue = parseFloat(value);
            


            if (isNaN(numValue)) {
                showCostError(error, '请填写数字');
                return false;
            }

            var intPart = value.split('.')[0];

            if (intPart.length > 6) {
                showCostError(error, '当日消费提醒阈值设置过大将失去意义，请调整');
                return false;
            }

            if (numValue > 0) {
                if (/^\d+\.?\d{0,2}?$/.test(value)) {
                    changedMap[typeid] = changedMap[typeid] || {};
                    (changedMap[typeid]).value = value;
                    (changedMap[typeid]).options = transSetData[typeid].options;
                    changedMap.hasSetChanged = 1;
                    _hide(error);
                    _ui_get('McMessageSetOk').disable(0);
                } else {
                    showCostError(error, '小数点后不能超过两位');
                    return false;
                }
            } else {
                showCostError(error, '请填写大于0的数值');
                return false;
            }
        }

        // 添加重点计划的按钮的点击事件，会调出添加计划Dialog，供选择计划
        addImportantBtn.onclick = function() {

            if (_ui_get('MessageAddPlans')) {
                return false;
            }
            var planSpan = _G('McImportantPlans'), planids = addImportantBtn.mcImportantPlans;
            if (planids.length == 0) {
                planids = [];
            } else {
                planids = planids.split(',');
            }
            var typeid = addImportantBtn.typeid;
            // 打开子弹窗来供客户来选择添加某些计划到重点观察计划中去
            nirvana.util.openSubActionDialog({
                id: 'MessageAddPlans',
                title: '设置到达预算下线提醒计划',
                width: 446,
                height: 420,
                actionPath: 'message/messagePlans',
                maskLevel: 202,
                params: {
                    planids: planids,
                    typeid: typeid,
                    changedMap: changedMap
                },
                onclose: function() {
                    
                }
            });
        };


        // 消息配置中增加已读同步配置选项，新增字段，so
        // added by Leo Wang(wangkemiao@baidu.com)
        // 2013-05-13
        if(data.sync && baidu.lang.isArray(data.sync)) {
            var mobiSync = data.sync[0];
            if(mobiSync && 'undefined' !== typeof mobiSync.value) {
                var syncCheckbox = ui.util.get('McMessageSetsCheckBoxSync');
                syncCheckbox.setChecked(mobiSync.value);
            }
        }
    }

    // 从elem元素开始向上到id为limitId的元素，找到节点名称为nodeName的节点
    var findAncestorNode = function(elem, nodeName, limitId) {
        !limitId && (limitId = TAB_RENDER_CONTAINER[1]);
        while(elem.id != limitId) {
            if (elem.nodeName == nodeName) {
                return elem;
            }
            elem = elem.parentNode;
        }
        return 0;
    }

    // 消息设置tab下各个事件绑定
    function bindSetsHandlers() {

        var currentContainer = TAB_RENDER_CONTAINER[1];

        // 绑定消息设置表格中的每个提醒方式复选框的勾选事件
        eventUtil.delegate(currentContainer, 'click', {
            nodeName: 'INPUT',
            type: 'checkbox'
        }, function(evt) {
            var me = this, typeid = util.attr(me, 'data-typeid'), loc = +util.attr(me, 'data-loc');
            var ct = changedMap[typeid] = changedMap[typeid] || {};

            var co = ct.options = transSetData[typeid].options;
            var tempnum = co.length - config.MSG_CUSTOM.CHECKBOXCOUNT;
            // 可能多了 不是3为 而是4位，临时的用中间数组解决位移

            if (me.checked) {
                co[loc + tempnum] = '1';
            } else {
                co[loc + tempnum] = '0';
            }
            changedMap.hasSetChanged = 1;
            // 如果是设置的当前账户消费达到**元，那么需要把它的value也加上
            if (typeid == '3') {
                ct.value = _ui_get('McAccountCost').getValue();
            }

            if (typeid == '5') {
                !ct.options5changed && (ct.options5changed = 1);
            }
        }).delegate(currentContainer, 'mouseover', // 托管鼠标滑过的事件
        function(elem) { 
            return elem && (elem = findAncestorNode(elem, 'TD')) && (!elem.nextSibling);
        },
        function(evt) {
            var me = findAncestorNode(this, 'TD');
            _addClass(me , 'mc-hover');
            _addClass(me.previousSibling, 'mc-hover');

        }).delegate(currentContainer, 'mouseout', // 托管鼠标移出的事件
        function(elem) {  
            return elem && (elem = findAncestorNode(elem, 'TD')) && (!elem.nextSibling);
        },
        function(evt) {
            var me = findAncestorNode(this, 'TD');
            _removeClass(me, 'mc-hover')
            _removeClass(me.previousSibling, 'mc-hover')
        })


    }

    function unbindSetsHandlers() {
        eventUtil.undelegate(TAB_RENDER_CONTAINER[1]);
    }

    /**
     * 根据拿到的消息接收人信息来渲染消息接收人列表
     * 
     * @param {Array} recipients 从后端拿到的接收人列表
     * @param {string || HTMLElement} div 要用来放置消息列表的容器的选择器或容器
     * @param {number=} limit 最多显示的联系人的数目
     */
    function renderMessageRecipients(data, div, limit) {
        var tableHtml = ['<table class="mc-table mc-table-bordered"><thead><tr><td>备注</td><td>电子邮件</td><td>手机号码</td><td>操作</td></tr></thead><tbody>'];
        // 每个联系人行的tpl，所有的{{}}形式，都会用联系人对象的响应属性来渲染
        var trHtml = '<tr><td>{{alias}}</td>' + 
                     '<td>{{mail}}</td><td>{{phone}}</td>' + 
                     '<td><span data-rid="{{contactid}}" class="{{active}}">删除</span></td></tr>';
        // 最多显示的联系人的数目为2
        !limit && (limit = 2);

        var len = data.length, di;
        var k = 1, active;

        _G('McLeftReceiverNum').innerHTML = limit - len;
        var addLink = 'McAddReceiverLink';

        var noValueNbsp = function(obj) {
            for (var key in di) {
                if (key != 'contactid') {
                    !obj[key] && (obj[key] = '&nbsp;');
                }
            }
        }
        // 如果拿到的联系人的数目大于最多显示的联系人数目
        // 那么只显示最多显示的数目的联系人
        if ( len >= limit ) {
            while (limit--) {
                di = data[limit];
                // 删除链接处于启用状态
                di.active = 'mc-active';
                noValueNbsp(di);
                tableHtml[k++] = util.tpl(trHtml, di);
            }
            // 添加联系人链接禁用掉
            _G(addLink).innerHTML = '添加已达上限';
            _removeClass(addLink, 'mc-active');
            _addClass(addLink, 'mc-disable');
        } else {
            // 如果只有一个联系人，那么删除链接处于禁用状态
            if (len == 1) {
                di = data[0];
                di.active = 'mc-disable';
                noValueNbsp(di);
                tableHtml[k++] = util.tpl(trHtml, di);
            } else {
                // 联系人大于1个小于最多显示的数目，那么则删除链接处于启用状态
                while (len--) {
                    di = data[len];
                    di.active = 'mc-active';
                    noValueNbsp(di);
                    tableHtml[k++] = util.tpl(trHtml, di);
                }
            }
            // 添加联系人链接激活
            _G(addLink).innerHTML = '添加联系人';
            _removeClass(addLink, 'mc-disable');
            _addClass(addLink, 'mc-active');
        }

        tableHtml[k] = '</tbody></table>';
        div.innerHTML = tableHtml.join('');
    }

    function bindReceiversHandlers() {
        // “添加联系人”链接和“添加已达上限”链接用的是一个元素
        // 只是class有改变，所以根据class来判断是否要显示
        _G('McAddReceiverLink').onclick = function(evt) {
            var me = this;
            if (_hasClass(me, 'mc-active')) {
                _show('McAddReceiverArea');
                _hide(me);
            } else {
                return false;
            }
        };

        // 将联系人表格中的删除联系人的点击事件，托管到联系人表格上
        eventUtil.delegate(TAB_RENDER_CONTAINER[2], 'click', {
            nodeName: 'SPAN'
        }, function(evt) {
            var me = this, rid = util.attr(me, 'data-rid');
            // 获取要删除的联系人的id，如果id存在
            if (rid || (rid == 0)) {
                if (_hasClass(me, 'mc-active')) {
                    var postParam = {
                        onSuccess: function(response) {
                            
                            // 提取出除要删除的联系人之外的其他联系人信息
                            loadedData[2] = util.filter(loadedData[2], function(item) {
                                // 特殊情况如果rid是字符串null，那么其实是null
                                if (rid === 'null') {
                                    rid = null;
                                }
                                return (item.contactid != rid);
                            });
                            // 重新渲染表格
                            renderMessageRecipients(loadedData[2], _G(TAB_RENDER_CONTAINER[2]))
                        },
                        onFail: function(response) {
                            ajaxFailDialog('删除失败', '删除该联系人失败，请稍候重试');
                        }
                    }
                    // 如果rid是'null'，那么就不需要发送contactid参数
                    if (rid !== 'null') {  
                        postParam.contactid = rid;
                    }
                    // 发送请求删除该联系人
                    fbs.message.delContact(postParam);
                }
            }
        });
        // 添加联系人区域的右上角的关闭按钮的单击事件
        _G('McMessageReceiverClose').onclick = function(evt) {
            _hide('McAddReceiverArea');
            _show('McAddReceiverLink');
        };

        var getRealValue = function(input) {
            //input = _ui_get(input);
            var t = input.getValue(), vt = input.getVirtualValue();
            ( t == vt ) && (t = '');
            return t;
        }

        var _getLength =  function(str){
            var len = 0,
                str_len = str.length;

           for (var i=0; i< str_len; i++) {
               if (str.charAt(i) > '~') {
                   len += 2;
               } else {
                   len++;
               }
            }

            return len;
        };

        // 添加联系人按钮点击后发生的一系列动作
        _ui_get('McMessageReceiverAddBtn').onclick = function() {
            // 获取所需输入框的真实值，唉，有virtualValue的时候getValue返回的也是virtualValue。。。
            var aliasInput = _ui_get('McAddReceiverNameInput'), alias = getRealValue(aliasInput);
            var mailInput = _ui_get('McAddReceiverMailInput'), mail = getRealValue(mailInput);
            var cellInput = _ui_get('McAddReceiverCellInput'), cell = getRealValue(cellInput);
            var error = _G('McMessageReceiverAddError');

            // 首先进行为空判断，邮箱和手机号码是都不能为空的
            if (!mail.length || !cell.length) {
                error.innerHTML = '邮箱和手机号码均不能为空';
                _show(error);
                return false;
            } else {
                _hide(error);
            }

            // 然后判断备注姓名的长度，长度是不能超过24的
            if (_getLength(alias) > 24) {
                error.innerHTML = '备注内容超长';
                _show(error);
                return false;
            } else {
                _hide(error);
            }

            // 检测邮箱地址是否合格
            var regMail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i;
            // 检测手机号码是否合格
            var regCell = /^1[0-9]{10}$/;
            if (!regMail.test(mail) || !regCell.test(cell)) {
                error.innerHTML = '请填写正确的联系方式';
                _show(error)
                return false;
            } else {
                _hide(error);
            }

            // 上面的检测都通过之后，就将相关信息提交到服务器端
            var obj = {
                alias: alias,
                mail: mail,
                phone: cell,
                onSuccess: function(response) {
                    // 当添加成功了之后，服务器端会将新增的联系人的id返回来，这时候
                    // 利用之前存储的联系人列表数据加上填写的内容和id来组合重新渲染
                    // 联系人表格
                    // var data = response.data, temp = loadedData[2].options;
                    var data = response.data, temp = loadedData[2];
                    temp[temp.length] = {
                        alias: alias,
                        mail: mail,
                        phone: cell,
                        contactid: data
                    };
                    renderMessageRecipients(temp, _G(TAB_RENDER_CONTAINER[2]));
                    _hide('McAddReceiverArea');
                    _show('McAddReceiverLink');
                    // 清空输入框的值
                    aliasInput.setValue('');
                    mailInput.setValue('');
                    cellInput.setValue('');
                },
                onFail: function(response) {
                    ajaxFailDialog('添加联系人失败', '添加联系人失败，请稍候重试');
                }
            }

            fbs.message.addContact(obj);
        }
    }

    function unbindReceiversHandlers() {
        eventUtil.undelegate(TAB_RENDER_CONTAINER[2]);
    }
 
 })(window);