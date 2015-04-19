/**
 * @file nirvana/manage/idea/appendIdea.js 
 * 附加创意的action
 * @author yanlingling(yanlingling@baidu.com)
 */

//appendIdeaPublic.STATE_MAP.ideatype = 4;
appendIdeaPublic.CONTEXT_INITER_MAP.dateRange = nirvana.manage.getStoredDate([0, 1, 2, 3, 4]); //附加创意不要全部时间


manage.appendIdeaList = new er.Action({

    VIEW: 'appendIdeaList',


    STATE_MAP: appendIdeaPublic.STATE_MAP,


    UI_PROP_MAP: appendIdeaPublic.UI_PROP_MAP,

    CONTEXT_INITER_MAP: appendIdeaPublic.CONTEXT_INITER_MAP,

    nowStat: appendIdeaPublic.nowStat,

    onentercomplete: function() {
        var me = this;
        appendIdeaPublic.onentercomplete(me);
     },

    onafterrender: function() {
        var me = this,
            controlMap = me._controlMap;
        //全投搬家历史记录下载
		nirvana.manage.allDeviceHisDownLoad();
        // peilonghui App的新建SelectButton，填充数据和数据绑定，改动结束至匹配的//end
        var baidu = window.baidu,
            _G = baidu.g,
            _hide = baidu.hide;
        var _ui_get = ui.util.get;

        var addAppSelect = _ui_get('addAppSelect');
        // 填充数据
        addAppSelect.fill([{
            value: 'single',
            text: '新建App推广'
        }, {
            value: 'multi',
            text: '批量新建App推广'
        }]);
        // 获取layer
        var appSelectLayer = addAppSelect.getLayer();
        // 由于layer的高度是定值导致上面隐藏起来的项所在位置会有一个空白
        // 所以要将layer的高度设为auto
        baidu.setStyle(appSelectLayer, 'height', 'auto');
        // 把layer中的与selectButton上的值相同的元素隐藏起来
        _hide(appSelectLayer.childNodes[0]);
        // 将文本的点击事件分发给select控件的setVale方法
        // 由于select在setValue的时候默认是不触发select事件的
        // 所以要多加一个参数用来传递给selectByIndex作为isDispatch参数
        addAppSelect.clickRightOnly = 1;
        addAppSelect.clickCurFunc = function() {
            addAppSelect.setValue('single', true);
            return false;
        };
        // 选中每个项的时候发生的事情。
        addAppSelect.onselect = function(complexity) {
            //var _get_context = me.getContext;

            var obj = {
                'complexity': complexity,
                'type': 'add',
                'planid': me.getContext('planid'),
                'unitid': me.getContext('unitid'),
                'planname': me.getContext('planname'),
                'unitname': me.getContext('unitname'),
                'param': {},
                'appendIdeaType': me.getContext('appendIdeaType')
            };

            // 在新建App推广之前需要获取用户在开发者中心的App列表
            // 根据拿到的App列表来决定用户是否可以创建App推广
            fbs.appendIdea.getRelatedApps({
                onSuccess: function(response) {
                    var data = response.data.listData, len = data.length;
                    if (len === 0) {
                        obj.appendIdeaType = 'no-app';
                    } else {
                        obj.param.appListData = data;
                    }
                    nirvana.manage.createSubAction.appendIdea(obj);
                },
                onFail: function() {
                    ajaxFailDialog();
                }
            });
            return false;
        }

        // end 


        appendIdeaPublic.onafterrender(me, "附加创意"),
        baidu.hide(_G("ManageTransSum")); //附件创意无转化数据
        controlMap.delAppendIdea.disable(true);
        controlMap.delAppendIdea.onclick = ideaLib.delAppendIdeaHandler(me);



        //附加创意类型选择    
        _G('appendIdeaType').onclick = me.appendIdeaTypeClick();

        //操作系统类型  目前就android iphone 以后可能会增加   0 非app, 1, android, 2, android hd; 3, iphone; 4, ipad 100 全部类型
        me.setContext('appdevicetype', [{
            text: '全部类型',
            value: 100
        }, {
            text: 'Android',
            value: 1
        }, {
            text: 'iPhone',
            value: 3
        }]);

        //设置url
        baidu.each(baidu.q('bindUser'), function(item) {
            baidu.setAttr(item, 'href', USER_BIND_APP_PATH + nirvana.env.USER_ID);
        })
        //设置button的url
        baidu.each($$('.bindUserBtn a'), function(item) {
            baidu.setAttr(item, 'href', USER_BIND_APP_PATH + nirvana.env.USER_ID);
            baidu.setAttr(item, 'target', '_blank');
        })
        ToolsModule.setImportDataMethod(function() { //物料带入
            var selectedList = me.selectedList,
                data = me.getContext('ideaListData'),
                res = {
                    level: me.getContext("appendIdeaType"),
                    data: []
                },
                i, len;

            if (selectedList && selectedList.length > 0) {
                for (i = 0, len = selectedList.length; i < len; i++) {
                    res.data.push(data[selectedList[i]]);
                }
            }
            return res;
        });



    },



    //获取创意列表
    getIdeaData: function() {
        var me = this,
            param = {
                starttime: me.getContext('startDate'),
                endtime: me.getContext('endDate'),
                limit: nirvana.limit_idea,
                onSuccess: ideaLib.getIdeaDataHandler(me),
                onFail: function() {
                    ajaxFailDialog();
                }

            };
        if (param.starttime == '' && param.endtime == '') { //从别处带来的选择全部时间 ，附加创意不支持全部时间
            me.setContext('totalShows', '0');
            me.setContext('totalClks', '0');
            me.setContext('totalPaysum', '¥0.00');
            me.setContext('clickRate', '0%');
            me.setContext('avgprice', '¥0.00');
            me.setContext('ideaListData', []);
            me.setContext("noDataHtml", appendIdeaConfig.NOSUPPORT_ALL_DATE);
            me.repaint();
            return;
        }
        if (me.getContext("unitid")) {
            param.condition = {};
            //param.condition.field ='unitid';
            param.condition.unitid = [];
            param.condition.unitid.push(me.getContext("unitid"));

        } else if (me.getContext("planid")) {
            param.condition = {};
            //param.condition.field ='planid';
            param.condition.planid = [];
            param.condition.planid.push(me.getContext("planid"));
        }
        if (me.getContext('appendIdeaType') == 'app') {
            param.creativetype = 'app';
        } else if (me.getContext('appendIdeaType') == 'sublink') {
            param.creativetype = 'sublink';
        }
        ideaLib.getIdeaData(me, param);
    },
    newTableModel: new nirvana.newManage.TableModel({
        level: 'appendIdea'
    }),

    /**
     *选择附加创意类型处理事件
     * @param {Object} e
     */
    appendIdeaTypeClick: function() {
        var me = this;
        return function(e) {
            var e = e || window.event,
                target = e.target || e.srcElement,
                current,
                type;


            var baidu = window.baidu,
                _G = baidu.g,
                _hide = baidu.hide,
                _show = baidu.show;
            var _addClass = baidu.addClass,
                _hasClass = baidu.dom.hasClass;
            var _ui_get = ui.util.get;


            if (_hasClass(target, 'typeItem') && !_hasClass(target, 'current')) {
                if (baidu.getStyle(_G('searchComboTip'), 'display') == 'block') {
                    //清空筛选
                    nirvana.manage.FilterControl.clearFilter();
                }
                current = $$('#appendIdeaType .current')[0];
                baidu.removeClass(current, 'current');
                _addClass(target, 'current');
                type = baidu.getAttr(target, 'rel');

                me.setContext('appendIdeaType', type);

                var addSublink = _ui_get('addidea'), addSublinkId = addSublink.getId();
                var addApp = _ui_get('addAppSelect'), addAppId = addApp.getId();


                if (type == 'sublink') {
                    _addClass('unbindUserTip', 'hide');
                    _show(addSublinkId);
                    _hide(addAppId);
                    //add_btn.setLabel('新建蹊径子链');
                    me.getIdeaData();
                } else if (type == 'app') {
                    _hide(addSublinkId);
                    _show(addAppId);
    
                    fbs.appendIdea.getAppUserStatus({
                        onSuccess: me.getBindHandler(me),
                        onFail: me.getBindFailHandler(me)
                    })
                }
            }
        }
    },

    //获取用户绑定状态处理方法
    getBindHandler: function(me) {
        return function(data) {
            appendIdeaLib.userBindStatus = data.data;

            var add_btn = ui.util.get('addAppSelect');

            if (!data.data) {
                baidu.removeClass(baidu.g('unbindUserTip'), 'hide');
                add_btn.disable(true);
            } else if (er.context.get('hasAppendIdea')){
                add_btn.disable(true);
            } else {
                add_btn.disable(false);
            }
            me.getIdeaData();
        }
    },

    //绑定接口出错
    getBindFailHandler: function(me) {
        return function() {
            var current,
            dialog = ui.util.get('appStatusFailDialog');

            me.setContext('appendIdeaType', 'sublink');

            if (!dialog) {
                ui.Dialog.factory.create({
                    title: '数据读取异常，请刷新后重试',
                    content: '数据读取异常，请刷新后重试。',
                    closeButton: false,
                    cancel_button: false,
                    maskType: 'black',
                    maskLevel: '3',
                    id: 'appStatusFailDialog',
                    width: 300,
                    onok: function() {
                        current = $$('#appendIdeaType .current')[0];
                        baidu.removeClass(current, 'current');
                        baidu.addClass($$('.typeItem')[0], 'current');
                    },
                    autoFocus: true,
                    defaultButton: 'ok'
                })
            } else {
                dialog.show();
            }
        }
    },



    onreload: function() {
        this.refresh();
    },

    onbeforeinitcontext: function() {
        var me = this;
        ideaPublic.onbeforeinitcontext(me, 'appendIdea');
        me.setContext("appendIdeaType", me.getContext("appendIdeaType") || 'sublink');
    },


    onleave: function() {
         ideaPublic.onleave(this);
	 }
});