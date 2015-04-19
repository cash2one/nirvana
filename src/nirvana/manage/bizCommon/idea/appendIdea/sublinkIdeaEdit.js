/*
 * 
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    root/nirvana/src/appendIdea/sublinkIdeaEdit.js
 * desc:    初始化appendIdeaEdit动作
 * date:    2012-10
 * author:  peilonghui@baidu.com
 * depend:  ./config.js
 *          ./lib.js
 *          ./validator.js
 *          ./appendIdeaEditPrototype.js
 *
 */


(function(appendIdea, ui_util, baidu, er, fbs, window, undefined){
    
    //引用外部对象的快捷方式
    var lib = manage.appendIdea.lib,
        config = appendIdea.config,
        default_prototype = appendIdea.AppendIdeaEditPrototype;
        
    
    //引用lib中的
    var getMaterialName = lib.getMaterialName,
        noCreative = lib.noCreative,
        isEmpty = lib.isEmpty,
        renderLevelError = lib.renderLevelError,
        hideLevelError = lib.hideLevelError;
        //_replaceStr = lib.replaceStr;
    
    //引用配置中的标题、url输入框以及其信息提示块区域的数组
    var sublink_titles = config.sublink_title_list,
        sublink_urls = config.sublink_url_list,
        sublink_infos = config.left_words_list;
    
    //引用外部方法的快捷方式    
    var _ui_get = ui_util.get,
        _G = baidu.g,
        _Q = baidu.q,
        _addClass = baidu.addClass,
        _removeClass = baidu.removeClass,
        _encodeHTML = baidu.encodeHTML;
        
        
    


    

        
        
        
    var _getLength = lib.getLength,
        _replaceStr = lib.replaceStr,
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
        
        
        
    //蹊径子链的独有配置
    var sublink_action_obj = {
        onafterrender: function() {
            var action = this,
                appendType = action.appendType;
            
            var create_arg = action.arg,
                type = create_arg.type;
                
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
        
            
                
            
            var plan_select = _ui_get('appendPlanSelect'),
                unit_select = _ui_get('appendUnitSelect'),
                ok_button = _ui_get('okButton'),
                cancel_button = _ui_get('cancelButton');
                
            var level_error_p = _G('appendLevelError');
                
            //默认给计划、单元下拉列表填充默认值
            plan_select.fill([{
                text: '请选择推广计划',
                value: '-1'
                }]);
            
            unit_select.fill([{
                text: '请选择推广单元',
                value: '-1'
                }]);
                
            plan_select.onselect = function(){
                var me = this;
                
                var plan_id = me.getValue(),
                    data_source = me.options;
                    
                if (plan_id < 0) {
                    return false;
                    
                }
                //如果计划下拉列表中的第一项为提示信息，那么将这项移除
                //然后重新填充下拉列表并将其值设为之前获取到的plan_id
                if (data_source[0].value < 0) {
                    data_source.shift();
                    me.fill(data_source);
                    me.setValue(plan_id);
                }
                
                
                var disables = [unit_select, ok_button];
                
                hideLevelError(level_error_p, disables);
                
                if (unit_select.state.readonly){
                    return false;
                } else {
                    fbs.unit.getNameList({
                        condition: {
                            planid: [plan_id]
                        },
                        onSuccess: function(response){
                            var data = response.data.listData,
                                len = data.length;
                                
                            if (len == 0) {
                                renderLevelError(level_error_p, '当前计划下无单元，请新建单元之后再新建附加创意', disables);
                                return false;
                            } else {
                                hideLevelError(level_error_p, disables);
                                
                                var data = lib.filter(data, noCreative);
                                len = data.length;
                                
                                if (len == 0) {
                                    renderLevelError(level_error_p, '当前计划所有单元都已存在附加创意，请新建单元后再新建。', disables);
                                    return false;
                                } else {
                                    hideLevelError(level_error_p, disables);
                                }
                                var unit_data = [{
                                    'text': '请选择推广单元',
                                    'value': -1
                                }];
                                
                                for (var i =1; i<= len; i++){
                                    var temp_data = data[i-1];
                                    unit_data[i] = {
                                        'text': _encodeHTML(temp_data.unitname),
                                        'value': temp_data.unitid
                                    };
                                }
                                //action.setContext('unit_select_units', data);
                                
                                if (unit_select.state.readonly) {
                                    return false;
                                } else {
                                    unit_select.fill(unit_data);
                                }
                                
                            }
                        }
                    })
                }
                
            };  
            
            
            
            unit_select.onselect = function(){
                var me = this;
                
                var unit_id = me.getValue(),
                    data_source = me.options;
                    
                if (unit_id < 0) {
                    return false;
                    
                }
                if (data_source[0].value < 0) {
                    data_source.shift();
                    me.fill(data_source);
                    me.setValue(unit_id);
                }
                
                /*var data = action.getContext('unit_select_units'),
                    data = lib.filter(data, function(unit){
                        return unit.unitid == unit_id;
                    });
                    
                var selected_unit = data[0];*/
                hideLevelError(level_error_p);
                
                lib.getRelatedMaterial({
                    unitid: unit_id,
                    for_edit: type,
                    appendType: appendType,
                    success: function(response) {
                        if (!_ui_get('appendIdeaEditDialog')) {
                            return false;
                        }
                    },
                    fail: function(response) {
                        //虽然获取不到相关创意信息，但是由于在推广位已经有了
                        //默认的显示，所以。。
                        //ajaxFailDialog();
                    }
                });
                
                
                /*
                 *下面这段代码用来检测所选的单元是否已经有附加创意，由于蹊径已经在填充之时过滤掉这些，所以。。
                 *等到蹊径和app合并的时候再说
                if (!noCreative(selected_unit)){
                    renderLevelError(level_error_p, '单元下已投放附加创意，无法投放App推广', [ok_button])
                    return false;
                } else {
                    _addClass(level_error_p, 'hide');
                    ok_button.disable(false);
                }
                
                //如果是由于单元导致后端返回了错误，那么这时候就将对服务端错误显示的区域隐藏起来
                _addClass('serverReturnErrorArea', 'hide');
                */
                
            };
            
            ok_button.onclick = action.getSaveAction();
            cancel_button.onclick = action.getCancelAction();
            
            
            //在dialog渲染完毕之后获取默认创意来渲染右侧预览位
            if (type == 'add') {
                lib.getRelatedMaterial({
                    appendType: appendType,
                    for_edit: type,
                    success: function(){
                        if (!_ui_get('appendIdeaEditDialog')){
                            return false;
                        }
                    },
                    fail: function(){
                    }
                })
            }
              
            
        },
        
        onentercomplete: function() {
            var action = this;
                

            nirvana.subaction.isDone = true;
            
            var create_arg = action.arg,
                type = create_arg.type;
                
            var plan_id = create_arg.planid,
                unit_id = create_arg.unitid,
                plan_name = create_arg.planname,
                unit_name = create_arg.unitname;
                
                
            var plan_select = _ui_get('appendPlanSelect'),
                unit_select = _ui_get('appendUnitSelect'),
                ok_button = _ui_get('okButton');
                
                
            var level_error_p = _G('appendLevelError');
                
            if (type == 'add') {
                if (isEmpty(plan_id)) {
                    fbs.plan.getNameList({
                        onSuccess: function(response){
                            var data = response.data.listData,
                                len = data.length;
                                
                            if (len == 0) {
                                renderLevelError(level_error_p, '当前账户下没有推广计划，请新建后操作!', [unit_select, ok_button]);
                                return false;
                            } else {
                                hideLevelError(level_error_p, [unit_select, ok_button]);
                                
                                //action.setContext('plan_select_plans', data);
                                
                                var plan_data = [{
                                    'text': '请选择推广计划',
                                    'value': -1
                                }];
                                
                                for (var i=1; i<=len; i++){
                                    var temp_data = data[i-1];
                                    
                                    plan_data[i] = {
                                        'text': _encodeHTML(temp_data.planname),
                                        'value': temp_data.planid
                                    }
                                }
                                plan_select.fill(plan_data);
                            }
                        },
                        onFail: function(){
                            renderLevelError(level_error_p, '计划列表获取失败，请稍候重试!', [unit_select, ok_button]);
                            return false;
                        }
                    });
                } else if (isEmpty(unit_id)){
                    getMaterialName('plan', plan_id, function(response){
                        var data = response.data.listData;
                        //action.setContext('plan_select_plans', data);
                        
                        plan_select.fill([{
                            'text': _encodeHTML(data[0].planname),
                            'value': plan_id
                        }]);
                        plan_select.onselect();
                        plan_select.setReadOnly(true);
                    })
                } else {
                    getMaterialName('plan', plan_id, function(response){
                        var data =  response.data.listData;
                        //action.setContext('plan_select_plans', data);
                        
                        plan_select.fill([{
                            'text': _encodeHTML(data[0].planname),
                            'value': plan_id
                        }]);
                        
                        plan_select.onselect();
                        plan_select.setReadOnly(true)
                    });
                    
                    getMaterialName('unit', unit_id, function(response){
                        var data = response.data.listData;
                        //action.setContext('unit_select_units', data);
                        
                        unit_select.fill([{
                            'text': _encodeHTML(data[0].unitname),
                            'value': unit_id
                        }]);
                        
                        unit_select.onselect();
                        unit_select.setReadOnly(true);
                    });
                }
            } else {
                var create_item = create_arg.item,
                    plan_id = create_item.planid,
                    unit_id = create_item.unitid,
                    plan_name = create_item.planname,
                    unit_name = create_item.unitname,
                    is_shadow = create_arg.isShadow;
                    //mtid = create_arg.mtid;


                plan_select.fill([{
                    value: plan_id,
                    text: plan_name
                }]);

                plan_select.setReadOnly(true);
                
                
                unit_select.fill([{
                    'text': unit_name,
                    'value': unit_id
                }]);
                
                unit_select.onselect();
                unit_select.setReadOnly(true);
                //ok_button.disable(true);
                
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
                    _ut.setValue((_ct.url).replace(/^http:\/\//ig, ''));
                }
                _st.main.focus();
            
                
                /*getMaterialName('unit', unit_id, function(response){
                    var data = response.data.listData;
                    
                    
                        action.setContext('unit_select_units', data);
                        
                        unit_select.fill([{
                            'text': _encodeHTML(data[0].unitname),
                            'value': unit_id
                        }]);
                        
                        unit_select.onselect();
                        unit_select.setReadOnly(true);
                        ok_button.disable(true);
                       
                })*/
                
            }
        },
        
        getSaveAction: function() {
            var action = this;
            
            return function(){
                var plan_id = _ui_get('appendPlanSelect').getValue(),
                    unit_id = _ui_get('appendUnitSelect').getValue();
                    
                var level_error_p = _G('appendLevelError');
                    
                //如果获取到的计划id和单元id为-1，那么返回提示让客户选择计划和单元
                if (plan_id < 0 || unit_id < 0) {
                    renderLevelError(level_error_p, '请先选择要添加的计划和单元！')
                    return false;
                }else {
                    _addClass('appendLevelError', 'hide');
                }
                
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

                        if (url.length > 1024 ) {
                            var info = sublink_infos[i];
                            baidu.g(info).innerHTML = 'URL必须小于1024个字符';
                            _removeClass(info, 'info')
                            _addClass(info, 'warn');
                            _removeClass(info, 'hide');
                            return false;
                        }

                        //检查子链内容是否重复
                        var compare_title = compare_obj[title];

                        if (compare_title && compare_title[0]) {
                            baidu.g('serverReturnError').innerHTML = _replaceStr('子链' + i + '与子链' + compare_title[1] + '的标题相同，请修改！');
                            _removeClass('serverReturnErrorArea', 'hide');
                            return false;
                        }


                        objs[objs.length] = {
                            title: title,
                            url: url,
                            index: i
                        }
                        compare_obj[title] = [true, i];
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
                        //appdevicetype: 0,
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
    }
    
    sublink_action_obj = lib.extend(sublink_action_obj, default_prototype, false);
    
    manage.sublinkIdeaEdit = new er.Action(sublink_action_obj);
    
})(nirvana.appendIdea, ui.util, baidu, er, fbs, window, undefined);