/*
 * 
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    root/nirvana/src/appendIdea/appendIdeaEdit.js
 * desc:    初始化appendIdeaEdit动作
 * date:     2012-10
 * author:  peilonghui@baidu.com
 * depend:  ./config.js
 *            ./lib.js
 *            ./validator.js
 *
 */

(function(appendIdea) {
    var common_input_obj = {
            width: 290
        },
        ui_prop_map = {
            appendPlanSelect: {
                emptyLang: '请选择推广计划',
                width: 156
            },
            appendUnitSelect: {
                emptyLang: '请选择推广单元',
                width: 156
            },

            //sublink的各个输入框的配置，相同的宽度。。没有额外的配置
            sublinkTitle1: common_input_obj,
            sublinkTitle2: common_input_obj,
            sublinkTitle3: common_input_obj,
            sublinkTitle4: common_input_obj,
            sublinkTitle5: common_input_obj,
            sublinkUrl1: common_input_obj,
            sublinkUrl2: common_input_obj,
            sublinkUrl3: common_input_obj,
            sublinkUrl4: common_input_obj,
            sublinkUrl5: common_input_obj
        };


    //子链数组下标映射关系对象
    var index2StrMap = {
        '子链(内容|url)?0': '子链一',
        '子链(内容|url)?1': '子链二',
        '子链(内容|url)?2': '子链三',
        '子链(内容|url)?3': '子链四',
        '子链(内容|url)?4': '子链五'
        }

    //快捷方式
    var config = appendIdea.config,
        lib =manage.appendIdea.lib;


    //快捷方式
    var sublink_titles = config.sublink_title_list,
        sublink_urls = config.sublink_url_list,
        sublink_infos = config.left_words_list;


    var _ui_get = ui.util.get,
        _G = baidu.g,
        _Q = baidu.q;

    /**
    计算字符串的长度（中文的一个字符占两个长度）

    @param {String} str 要计算长度的字符串

    @private
    @method _getLength
    @return {Number} 字符串的长度
    **/
    var _getLength = function(str) {
            var len = 0,
                str_len = str.length;
            for (var i=0; i < str_len; i++) {
                if (str.charAt(i) > '~') {
                    len+=2
                } else {
                    len++;
                }
            }
            return len;
        },
        /**
        将字符串str按照map中的映射关系来替换某些字符为另一种字符
        
        @param {String} str 要替换的来源字符串
        @param {Object} map 用来替换的映射关系

        @private 
        @method _replaceStr
        @return {String} 替换之后的字符串
         **/
        _replaceStr = function(str, map) {
            if (!map) {
                map = index2StrMap;
            }
            var result = [],reg;
            for (key in map) {
                reg = new RegExp(key, 'ig');
                if (reg.test(str)) {
                    str = str.replace(reg, map[key]+ (RegExp.$1))
                }
            }
            return str;
        },
        /**
         计算出当前正在编辑的title之外的其他title所占用的长度

         @param ti 当前title编辑框的下标，从0开始

         @private 
         @method _sumTitleLength
         @return {Number} 其他title所占用的长度
        **/
        _sumTitleLength = function(ti) {
            var i=0,now_len=0,si;
            for (;si=sublink_titles[i++];) {
                if (i != ti +1) {
                    ////console.log(si);
                    now_len += _getLength(_ui_get(si).getValue());
                    ////console.log(now_len)
                } else {
                    continue;
                }
            }
            return now_len;
        },
        /**

         当编辑子链的title的时候，需要将其他为空的子链的预览区域隐藏
         @param {Number} ti 当前正在编辑的文本输入框的序列号，从0开始

         @private 
         @method _clearEmptySublink
        **/
        _clearEmptySublink = function(ti) {
            var i=0, si,ai,
                _trim = baidu.trim,
                _addClass = baidu.addClass,
                _removeClass = baidu.removeClass,
                _Q = baidu.q,
                sublink_map = config.sublink_map;


            var sum_str = '',
                default_words = config.default_sublink_title;
            for (; si=sublink_titles[i++];) {
                var q_result = _Q(sublink_map[i-1]),
                    ai = q_result.length,
                    q_tmp;


                var temp_value = _trim(_ui_get(si).getValue());

                sum_str += temp_value;

                if (i != ti+1) {
                    if (temp_value.length == 0) {
                        //flag++;
                        while(ai--) {
                            q_tmp = q_result[ai];
                            if (q_tmp.className.indexOf('hide') < 0){
                                _addClass(q_tmp, 'hide');
                            }
                            
                        }
                    }
                } else {
                    while(ai--) {
                        q_tmp = q_result[ai];
                        if (q_tmp.className.indexOf('hide') >= 0) {
                            _removeClass(q_tmp, 'hide');
                        }
                    }
                }
            }

            if (sum_str.length == 0) {
                var len = sublink_titles.length;
                while(len--) {
                    lib.previewSublink(default_words[len], len);
                }
            }

            _clearOtherInfos(ti);
            
        },

        /**
         将其它输入框右上角的还剩。。字符提示清除

         @param {Number} ti  当前正在编辑的输入框的ti

         @private 
         @method _clearOtherInfos
        **/
        _clearOtherInfos=function(ti) {
            var _addClass = baidu.addClass,
                _removeClass = baidu.removeClass,
                _G = baidu.g;

            var i=0,si;

            for(i=0;si=sublink_infos[i++];) {
                var q_result = _G(si);

                if ( ti+1 != i) {
                    if(q_result.className.indexOf('warn') < 0) {
                        _addClass(q_result, 'hide');
                    }
                } else {
                    _removeClass(q_result, 'hide');
                }
            }
        };


    //这个函数作为Action的视图函数，用来返回视图
    //顺便修改Action的UI_PROP_MAP
    var getView = function() {
            var action = this,
                appendType = action.appendType,
                view_map = config['VIEW_MAP'],
                ui_map = config['appendIdeaUIMap'];

            //修改UI_PROP_MAP
            action.UI_PROP_MAP = lib.extend(ui_prop_map, ui_map[appendType], true)
            return view_map[appendType];
        },

        //鉴别出含有附加创意的单元，
        filterUnit = function(unit) {
            if (Object.prototype.toString.apply(unit) === '[object Array]') {
                unit = unit[0]
            }
            var creativecnt = unit.creativecnt,
                val;
            for (var key in creativecnt) {
                val = creativecnt[key];

                if (val && val > 0) {
                    return false;
                }
            }

            return true;
        },
        isEmpty = function(obj) {
            return typeof obj === 'undefined' || obj === '' || obj ==null;
        };
    var pub = {};



    manage.appendIdeaEdit = new er.Action({
        INGNORE_STATE:true,
        VIEW: getView,
        CONTEXT_INITER_MAP:{
        },
        UI_PROP_MAP: {

        },

        onbeforerender:function() {
            var action = this;

            action.appendType = action.arg.appendIdeaType;
        },
        onafterrender: function() {
            var action = this,
                control_map = action._controlMap,
                create_arg = action.arg,
                type = create_arg.type;

            var appendType = action.appendType;


            if (appendType == 'no-app') {
                 _G('noAppLinkId').href = 'http://u.baidu.com/ucweb/?module=Accountcenter&controller=Accountmgr&action=accountMgr&userid=' + nirvana.env.USER_ID + '&sourceappid=3'
                return false;
            }

            //附加子链的话，为输入框和全部清空按钮绑定相应事件
            if (appendType == 'sublink') {
                var validators = appendIdea.validator;
            
                var ti, url,title;


                //为每个子链title的输入框绑定校验函数
                for (ti=0; title = sublink_titles[ti++];) {

                    var _title = _ui_get(title);
                    /**
                     给每个输入框绑定change事件，主要进行预览渲染和内容校验
                     @param {Object} config: 所读取的配置文件中的配置对象
                     @param {Number} ti: title输入框id在config.sublink_title_list中的下标
                     @param {Function} _G: baidu.g
                     @param {Function} gl: _getLength的简写，用于计算内容长度
                     @param {Function} sl: _sumTitleLength 的简写，用于计算除当前输入框意外的其他title输入框的内容长度
                     @param {Function} cl: 用来检测其他的子链编辑输入框中的title是否为空。如果为空则将其的预览为孩子隐去
                     **/
                    _title.onfocus = _title.onchange = (function(config, ti, _G, gl, sl, cl){
                        var infos = config.left_words_list,
                            smxl = config.titles_max_length,
                            pmxl = config.title_per_length;

                        return function() {
                            var me = this,
                                left_len = smxl - sl(ti);
                                ////console.log(left_len)


                            cl(ti);

                            validators.stringValidator({
                                validateString: me.getValue(),
                                maxLength: left_len>16?16:left_len,
                                minLength: 0,
                                doCut : true,
                                onSuccess: function(num,str){
                                    var info_i = infos[ti],
                                        _addClass = baidu.addClass,
                                        _removeClass = baidu.removeClass;
                                    _G(info_i).innerHTML = '还可以输入' + num + '个字符';
                                    _removeClass(info_i, 'warn');
                                    _addClass(info_i, 'info');
                                    _removeClass(info_i, 'hide');
                                    lib.previewSublink(str,ti);
                                },
                                onFail: function(str) {
                                    typeof str !== undefined && me.setValue(str);
                                }
                            });

                        }
                    })(config, ti-1, _G, _getLength, _sumTitleLength, _clearEmptySublink);

                    _title.onblur = (function(ti, cl) {
                        return function() {
                            cl(ti);
                        }
                    })(ti-1, _clearEmptySublink);
                }
                

                //为每个子链url的输入框绑定校验函数
                for (ti=0; url = sublink_urls[ti++]; ) {

                    var _url = _ui_get(url);
                    /**
                    监听每个子链url输入框的change事件

                    @param {Array} infos 提示信息span数组
                    @param {Number} ti url输入框的序列号，从0开始
                    @param {Function} _G baidu.g的缩写
                    @cl {Function} _clearOtherInfos的缩写

                    **/
                    _url.onfocus = _url.onchange = (function(infos, ti, _G, cl) {
                        return function(){
                            var me = this;

                            cl(ti);

                            //教校验当前的输入框中的数据是否合格
                            validators.stringValidator({
                                validateString: me.getValue(),
                                maxLength: 1024,
                                minLength: 0,
                                doCut:true,
                                onFail: function(str) {
                                    str && me.setValue(str);
                                },
                                onSuccess: function(num) {
                                    var info_i = infos[ti],
                                        _addClass = baidu.addClass,
                                        _removeClass = baidu.removeClass;

                                    _G(info_i).innerHTML = '还可以输入' + num + '个字符';
                                    _removeClass(info_i, 'warn');
                                    _addClass(info_i, 'info');
                                    _removeClass(info_i, 'hide');
                                },
                                afterValidator: {
                                    name: 'urlValidator',
                                    config: {
                                        onFail: function() {
                                            var info_i = infos[ti],
                                                _addClass = baidu.addClass,
                                                _removeClass = baidu.removeClass;
                                            _G(info_i).innerHTML = 'URL必须以http://或https://开头';
                                            _removeClass(info_i, 'info');
                                            _addClass(info_i, 'warn');
                                            _removeClass(info_i, 'hide');
                                        },
                                        onSuccess: function(){
                                            /*var info_i = infos[ti];
                                            if (baidu.dom.hasClass(info_i, 'warn')) {
                                                baidu.removeClass(info_i, 'warn');
                                                baidu.addClass(info_i, 'info');
                                            }*/
                                        }
                                    }
                                }
                            })
                        }
                    })(sublink_infos, ti-1, _G, _clearOtherInfos);
                }


                //全部清空按钮
                _ui_get('resetButton').onclick = (function(config, _ui_get){
                    var ti,title,url;

                    var titles = config.sublink_title_list,
                        urls = config.sublink_url_list,
                        default_words = config.default_sublink_title;
                        infos = config.left_words_list;
                    return function() {
                        for (ti=0; title = titles[ti++];) {
                            _ui_get(title).setValue('');
                            //_ui_get(title).onchange();
                            var pi = ti-1;
                            lib.previewSublink(default_words[pi], pi);
                            baidu.addClass(infos[pi], 'hide');

                        }
                        for (ti=0; url = urls[ti++];) {
                            _ui_get(url).main.value = '';
                        }
                        return false;

                    }
                })(config, _ui_get);

            } else if (appendType == 'app') {
                ////debugger;
                 _G('noAppLinkId').href = 'http://u.baidu.com/ucweb/?module=Accountcenter&controller=Accountmgr&action=accountMgr&userid=' + nirvana.env.USER_ID + '&sourceappid=3';
                var appInfoList = create_arg.param.appListData,
                    app_list_div = _G('AccountAppList');
                    app_tpl_id = lib.getAppsListHtml(appInfoList);

                //开始渲染编辑区域的App列表
                app_list_div.innerHTML = app_tpl_id.html;

                ui.util.init(app_list_div);

                var one_radio_id = app_tpl_id.id,
                    all_radios = _Q('app-radio-button'),
                    len  = all_radios.length,
                    img24 = _G('appImg24');



                while(len--) {
                    all_radios[len].onclick = function() {
                        var me = this,
                            sid = me.value,
                            result_arr = lib.filter(appInfoList, function(item) {
                                return item.sid == sid;
                            });

                        me.checked = true;
                        img24.src =result_arr[0]['iconurl'];
                        action.setContext('selectedAppId', sid);
                    }
                }

                if (type == 'add') {
                    all_radios[0].onclick();
                } else {

                }
                

                action.setContext('appRadioId', one_radio_id);

            }


            var plan_select = control_map['appendPlanSelect'],
                unit_select = control_map['appendUnitSelect'],
                ok_button = _ui_get('okButton'),
                cancel_button = _ui_get('cancelButton');

            unit_select.fill([{
                text: '请选择推广单元',
                value: -1
            }]);

            //绑定计划select和单元select的onselect事件
            plan_select.onselect = function() {
                var me = this;
                var plan_id = me.getValue(),
                    data_source = me.options;

                if (data_source[0].value < 0) {
                    data_source.shift();
                }

                var filter = function(item) {
                    return item.planid == plan_id;
                }

                var data = action.getContext('plan_select_plans'),
                    data = baidu.array.filter(data, filter);

                //如果选中的推广计划仅仅支持计算机投放，那么就抛出错误提示，阻止事件继续进行
                if (appendType == 'app' && data[0].deviceprefer == 1) {
                    baidu.g('appendLevelError').innerHTML = '此计划仅投放在计算机设备，请选择投放在全部设备或仅移动设备的计划';
                    baidu.removeClass('appendLevelError', 'hide');
                    unit_select.disable(true);
                    me.fill(data_source);
                    me.setValue(plan_id);
                    ok_button.disable(true);
                    return false;
                } else {
                    unit_select.disable(false);
                    ok_button.disable(false);
                }


                //如果支持移动投放，那么继续走流程
                me.fill(data_source);
                me.setValue(plan_id);
                fbs.unit.getNameList.clearCache();
                fbs.unit.getNameList({
                    condition: {
                        planid: [plan_id]
                    },
                    onSuccess: function(response){
                        var data = response.data.listData,
                            len = data.length;

                        //提示话术
                        var unit_data = [{
                            text: '请选择推广单元',
                            value: '-1'
                        }];

                        //如果获取到的单元数据是空数组，那么抛出异常提示，停止时间流程
                        if (len == 0) {
                            baidu.g('appendLevelError').innerHTML = '当前计划下无单元，请新建单元后再新建附加创意。';
                            baidu.removeClass('appendLevelError', 'hide');
                            unit_select.fill(unit_data);
                            unit_select.disable(true);
                            ok_button.disable(true)
                            return false;
                        }
                        
                        //对于蹊径子链，需要过滤获取的单元数据中的已经存在附加创意的单元
                        if (appendType == 'sublink') {
                            data = baidu.array.filter(data, filterUnit);
                            len = data.length;

                            if (len == 0) {
                                baidu.g('appendLevelError').innerHTML = '当前计划所有单元都已存在附加创意，请新建单元后再新建。';
                                baidu.removeClass('appendLevelError', 'hide');
                                //unit_select.fill(unit_data);
                                unit_select.disable(true);
                                ok_button.disable(true);
                                return false;
                            } 
                        }
                        
                        //当上述流程都通过后，那么就对单元选择列表进行填充
                        var di;
                        baidu.addClass('appendLevelError', 'hide');
                        baidu.addClass('serverReturnErrorArea', 'hide');
                        unit_select.disable(false);

                        var unit_value = unit_select.getValue();

                        for (var i=0; di=data[i++];) {
                            unit_data[i] = {
                                text: di.unitname,
                                value: di.unitid
                            }
                        }
                        unit_select.fill(unit_data);
                        if (!isEmpty(unit_value) && unit_select.state.readonly) {
                            unit_select.setValue(unit_value);
                        }
                        ok_button.disable(false);
                        //将当前获取到的单元数据作为上下文内容存储
                        action.setContext('unit_select_units', data);
                    }
                });
            }

            unit_select.onselect = function() {
                var me = this;

                if (unit_select.state.disabled ) {
                    return false;
                }

                var unit_id = me.getValue(),
                    data_source = me.options;

                if (data_source[0].value < 0) {
                    data_source.shift();
                }

                me.fill(data_source);
                me.setValue(unit_id);

                lib.getRelatedMaterial({
                    unitid: unit_id,
                    for_edit: type,
                    appendType: appendType,
                    success: function(response) {
                        if (!ui.util.get('appendIdeaEditDialog')) {
                            return false;
                        }
                    },
                    fail: function(response) {

                    }
                });

                //App推广的独有处理，判断当前选中的单元是否已经投放了附加创意
                if (appendType === 'app' && type == 'add') {
                    var filter = function(item) {
                        return item.unitid == unit_id;
                    };

                    var data = action.getContext('unit_select_units'),
                        data = baidu.array.filter(data, filter);

                    if (!filterUnit(data)) {
                        _G('appendLevelError').innerHTML = '单元下已投放附加创意，无法投放App推广';
                        baidu.removeClass('appendLevelError', 'hide');
                        //me.disable(true);
                        ok_button.disable(true)
                        return false;
                    } else {
                        baidu.addClass('appendLevelError', 'hide');
                        ok_button.disable(false);
                    }

                }

                baidu.addClass('serverReturnErrorArea', 'hide');
            }
            
    

            //取消按钮
            _ui_get('cancelButton').onclick = action.getCancelAction();

            //确定按钮
            _ui_get('okButton').onclick = action.getSaveAction(config, _ui_get);
        },
        onentercomplete: function() {
            var action = this,
                control_map = action._controlMap,
                appendType = action.appendType,
                create_arg =action.arg;


            nirvana.subaction.isDone = true;
            if (appendType == 'no-app') {
                return false;
            }

            var plan_id = create_arg.planid,
                unit_id = create_arg.unitid,
                plan_name = create_arg.planname,
                unit_name = create_arg.unitname;

            var type = create_arg.type,
                plan_select = control_map['appendPlanSelect'],
                unit_select = control_map['appendUnitSelect'];

           /*var isEmpty = function(obj) {
                return (typeof obj === 'undefined') || (obj == null) || obj == '';
            }*/

           

            var _ui_get = ui.util.get;


            var getMaterialName = function(level, level_id, callback) {

                var condition = {};

                condition[level+'id'] = [level_id];
                fbs[level].getNameList({
                    condition:condition,
                    onSuccess: callback
                });
            }

            //各种附加创意通用的计划单元选择列表的填充
            if (type == 'add') {
                //var default_idea = config.defaultRelatedMaterials.idea;
                if (isEmpty(plan_id)) {
                    //console.log(isEmpty(plan_id));
                    fbs.plan.getNameList({
                        onSuccess: function(response) {
                            var data = response.data.listData;

                            //////console.log(data)

                            //过滤掉本地商户计划
                            /*data.filter = function(item) {
                                //return (item.ideatype == 0)

                            }*/

                            /*data = baidu.array.filter(data, data.filter);*/

                            var len = data.length,
                                di,
                                plan_data = [{
                                    text: '请选择推广计划',
                                    value: -1
                                }];

                            if (len == 0) {
                                baidu.g('appendLevelError').innerHTML = '当前没有可在其中创建附加创意的计划,请首先添加计划';
                                baidu.removeClass('appendLevelError', 'hide');
                                plan_select.disable(true);
                                unit_select.disable(true);
                            } else {
                                for (var i=0; di=data[i++];) {
                                    plan_data[i] = {
                                        value: di.planid,
                                        text: baidu.encodeHTML(di.planname)
                                    }
                                }
                                /*plan_select.fill(plan_data);
                                plan_select.onselect();*/
                            }
                            plan_select.fill(plan_data);
                            //plan_select.onselect()
                            lib.getRelatedMaterial({
                                appendType: appendType,
                                for_edit: type
                            });
                            action.setContext('plan_select_plans', data);
                        },
                        onFail: function() {
                            baidu.g('appendLevelError').innerHTML = '数据读取有误，请重新刷新';
                            baidu.removeClass('appendLevelError', 'hide');
                        } 
                    })
                } else if (isEmpty(unit_id)) {
                    //console.log(isEmpty(unit_id));
                    getMaterialName('plan',plan_id,function(response){
                        var data = response.data.listData;
                        plan_name = data[0].planname;

                        plan_select.fill([{
                            'text':plan_name,
                            'value': plan_id
                        }]);
                        action.setContext('plan_select_plans', data);
                        plan_select.onselect();
                        plan_select.setReadOnly(true);
                    });

                    lib.getRelatedMaterial({
                        appendType: appendType,
                        for_edit: type
                    });
                } else {
                    getMaterialName('plan',plan_id,function(response){
                        var data = response.data.listData;
                        plan_name = data[0].planname;

                        plan_select.fill([{
                            'text':plan_name,
                            'value': plan_id
                        }]);
                        action.setContext('plan_select_plans', data);
                        plan_select.onselect();

                        plan_select.setReadOnly(true);
                        /*unit_select.setValue(unit_id);
                        unit_select.onselect();
                        unit_select.setReadOnly(true);*/
                    });

                    getMaterialName('unit', unit_id, function(response) {
                        var data = response.data.listData;

                        action.setContext('unit_select_units', data);

                        unit_name = data[0].unitname;

                        unit_select.fill([{
                            'text': unit_name,
                            'value': unit_id
                        }])
                        
                        if (!unit_select.state.disabled) {
                            unit_select.onselect();
                            unit_select.setReadOnly(true);
                        }
                        
                    });
                }
                
            } else {
                var create_item = create_arg.item,
                    plan_id = create_item.planid,
                    unit_id = create_item.unitid,
                    plan_name = create_item.planname,
                    unit_name = create_item.unitname,
                    is_shadow = create_arg.isShadow,
                    mtid = create_arg.mtid;


                plan_select.fill([{
                    value: plan_id,
                    text: plan_name
                }]);

                plan_select.setReadOnly(true);

                unit_select.fill([{
                    value: unit_id,
                    text: unit_name
                }]);

                unit_select.setReadOnly(true);
                unit_select.onselect();

                if (appendType == 'app') {
                    var appRadioId = action.getContext('appRadioId');
                    var ok_button = _ui_get('okButton'),
                        one_radio = _ui_get(appRadioId);

                    ok_button.disable(true);
                    
                } else if (appendType == 'sublink') {
                    var _content = is_shadow?create_item.shadowcontent: create_item.content,
                        _len = _content.length;

                    lib.renderExistedSublinks(_content);

                    var sublink_titles = config.sublink_title_list,
                        sublink_urls = config.sublink_url_list;

                    var _st, _ut, _ct;

                    while(_len--) {
                        _st=_ui_get(sublink_titles[_len]);
                        _ut=_ui_get(sublink_urls[_len]);
                        _ct=_content[_len];

                        _st.setValue(_ct.title);
                        _clearEmptySublink(_ct.title, _len);
                        _ut.setValue(_ct.url);
                    }
                    _st.main.focus();
                }

            }
        },
        //用于取消按钮的闭包动作
        getCancelAction: function() {
             var me = this;

            return function() {
                me.onclose();
            }
        },

        /**
         为提交按钮的单击事件

         @param {Object} config 附加创意的config对象
         @param {Function} _ui_get ui.util.get的缩写
         @method getSaveAction
        **/
        getSaveAction: function(config,_ui_get) {
            var action = this,
                appendType = action.appendType;

            return function() {

                var plan_id = _ui_get('appendPlanSelect').getValue(),
                    unit_id = _ui_get('appendUnitSelect').getValue();

                var _addClass = baidu.addClass,
                    _removeClass = baidu.removeClass;

                //如果获取到的计划id和单元id为-1，那么返回提示让客户选择计划和单元
                if (plan_id < 0 || unit_id < 0) {
                    baidu.g('appendLevelError').innerHTML = '请先选择要添加到的计划和单元！';
                    _removeClass('appendLevelError', 'hide');
                    return false;
                }else {
                    _addClass('appendLevelError', 'hide');
                }

                if (appendType == 'app') {
                    var sid = action.getContext('selectedAppId');

                    if (!sid) {
                        _G('serverReturnError').innerHTML = ' 请选择要推广的App！'
                        _removeClass('serverReturnErrorArea', 'hide');

                    } else {
                        _addClass('serverReturnErrorArea', 'hide');
                    }

                    var obj = {
                        planid: plan_id,
                        unitid: unit_id,
                        mcid: sid,
                        onSuccess: action.getSaveSuccess(config, _ui_get),
                        onFail: action.getSaveFail()
                    }

                    fbs.appendIdea.addApp(obj);

                } else if (appendType == 'sublink') {
                    var objs = [],
                        compare_obj = {};

                    //获取每个子链title输入框和url输入框
                    var sublink_titles = config.sublink_title_list,
                        sublink_urls = config.sublink_url_list; 

                    //title和url是一一对应的，所以只取一个length就好
                    var len= sublink_titles.length,
                        _trim = baidu.trim;


                    var title, url;


                    //校验输入框中的内容，是否为空，是否不合形式
                    for (var i=0; i<len; i++) {
                        title = _trim(_ui_get(sublink_titles[i]).getValue());
                        url = _trim(_ui_get(sublink_urls[i]).getValue());

                        if (!title && !url) {
                            continue;
                        } else if(title && url) {

                            if (url.length > 1024 || !(/^https?:\/\//i.test(url))) {
                                var info = sublink_infos[i];
                                baidu.g(info).innerHTML = 'URL必须小于1024个字符且以http://或https://开头';
                                _removeClass(info, 'info')
                                _addClass(info, 'warn');
                                _removeClass(info, 'hide');
                                return false;
                            }

                            //检查子链内容是否重复
                            var compare_title = compare_obj[title],
                                compare_url = compare_obj[url],
                                compare_temp = compare_title || compare_url;

                            if (compare_temp && compare_temp[0]) {
                                baidu.g('serverReturnError').innerHTML = _replaceStr('子链' + i + '与子链' + compare_temp[1] + '的标题(或链接)相同，请修改！');
                                _removeClass('serverReturnErrorArea', 'hide');
                                return false;
                            }


                            objs[objs.length] = {
                                title: title,
                                url: url,
                                index: i
                            }
                            compare_obj[title] = [true, i];
                            compare_obj[url] = [true, i];
                        } else {
                            baidu.g('serverReturnError').innerHTML = _replaceStr('请将子链'+ i +'补充完整!');
                            _removeClass('serverReturnErrorArea', 'hide');
                            return false;
                        }
                    }

                    //上面的校验有可能会在右侧错误信息区域产生错误信息
                    //保险起见，清楚错误信息
                    _addClass('serverReturnErrorArea', 'hide');

                    //子链数目的检查
                    if (objs.length < 3) {
                        //var sublink_error = baidu.g('serverReturnError');

                        baidu.g('serverReturnError').innerHTML = '请至少输入三条子链';
                        _removeClass('serverReturnErrorArea', 'hide');
                        return false;
                    } else {
                        _addClass('serverReturnErrorArea', 'hide');
                    }

                    //获取提交参数，分为编辑和新增
                    var create_arg = action.arg,
                        type = create_arg.type,
                        //idea_id = create_arg.item.creativeid,
                        common_param = {
                            planid: plan_id,
                            unitid: unit_id,
                            content: objs,
                            onSuccess: action.getSaveSuccess(),
                            onFail: action.getSaveFail()
                        };

                    var create_item = create_arg.item;
                    if (type == 'add') {
                        //前端校验通过之后就将数据发送到后端
                        fbs.appendIdea.addSublink(common_param);
                    } else {
                        //调用修改接口
                        //修改时需要参数creativeid来制定修改某个附加创意
                        common_param.creativeid = create_item.isShadow?create_item.shadowcreativeid: create_item.creativeid;
                        fbs.appendIdea.modSublink(common_param);
                    }
                }

            }
        },


        //数据保存成功的动作
        getSaveSuccess: function(){
            var me = this;
            return function(response){
                baidu.addClass('serverReturnError', 'hide');
                fbs.unit.getNameList.clearCache();
                fbs.appendIdea.getAppendIdeaList.clearCache();
                me.onclose();
                //如果走到这一步，说明新增已经成功了，那么需要即时更新新增按钮的状态
                //新增按钮的状态时由er.context中hasAppendIdea的属性来决定的
                /*if (me.arg.type == 'add') {
                    er.context.set('hasAppendIdea', true);
                    ui.util.get('addidea').disable(true);
                }*/
                er.controller.fireMain('reload', {})
            }
        },

        //数据保存失败的动作
        getSaveFail: function(){
            var action = this;

            return function(response) {
                //按照状态码->自定义错误代码->服务器返回的错误信息顺序来解读失败原因
                var status = response.status,
                    all_errors = nirvana.config.ERROR.APPENDIDEA,
                    error_map = all_errors[action.appendType];

                var edit_error = baidu.g('serverReturnError'),
                    error_div = edit_error.parentNode,
                    _addClass = baidu.addClass,
                    _removeClass = baidu.removeClass;

                //首先判断响应状态码
                if (status == '500'|| status == '600') {
                    edit_error.innerHTML = error_map[status];
                    _removeClass(error_div, 'hide');
                    return false;
                }


                var error_obj = response.errorCode,
                    error_code = error_obj.code,
                    error_detail = error_obj.detail;

                //然后判断是否有配置其异常信息
                if (error_map[error_code]) {
                    edit_error.innerHTML = error_map[error_code];
                    _removeClass(error_div, 'hide');
                    return false;
                }

                //最后检查异常信息是否在error_code的detail中
                if (error_code && !error_map[error_code] && error_detail) {
                    var error_arr = [];
                    for (key in error_detail) {
                        error_arr[error_arr.length] = key + '：' + error_detail[key];
                    }
                    edit_error.innerHTML = _replaceStr(error_arr.join('<br/>'));
                    _removeClass(error_div, 'hide');
                    return false;
                }
            }
        }

    })

})(nirvana.appendIdea)