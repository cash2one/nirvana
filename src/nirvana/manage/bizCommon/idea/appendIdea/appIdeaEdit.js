/*
 *
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path:    root/nirvana/src/appendIdea/appIdeaEdit.js
 * desc:    初始化appendIdeaEdit动作
 * date:    2012-10
 * author:  peilonghui@baidu.com
 * depend:  ./config.js
 *          ./lib.js
 *          ./validator.js
 *          ./appendIdeaEditPrototype.js
 *
 */


(function(appendIdea, ui_util, baidu, er, fbs, window, undefined) {

    //引用外部对象的快捷方式
    var lib = manage.appendIdea.lib,
        config = appendIdea.config,
        default_prototype = appendIdea.AppendIdeaEditPrototype;


    var getMaterialName = lib.getMaterialName,
        noCreative = lib.noCreative,
        isEmpty = lib.isEmpty,
        renderLevelError = lib.renderLevelError;

    var _ui_get = ui_util.get,
        _G = baidu.g,
        _Q = baidu.q,
        _addClass = baidu.addClass,
        _removeClass = baidu.removeClass,
        _encodeHTML = baidu.encodeHTML;



    //App创意的独有配置
    var app_action_obj = {
        onafterrender: function() {
            var action = this,
                appendType = action.appendType;

            _G('noAppLinkId').href = 'http://u.baidu.com/ucweb/?module=Accountcenter&controller=Accountmgr&action=accountMgr&userid=' + nirvana.env.USER_ID + '&sourceappid=3';

            if (appendType == 'no-app') {
                return false;
            }


            var ok_button = _ui_get('okButton'),
                cancel_button = _ui_get('cancelButton');

            var create_arg = action.arg,
                type = create_arg.type,

                /**********************渲染之前拿到的App列表**********************/
                appInfoList = create_arg.param.appListData,
                edit_sid = create_arg.item && create_arg.item.mtid;

            var app_list_div = _G('AccountAppList');
            app_tpl_id = lib.getAppsListHtml(appInfoList, edit_sid);

            //开始渲染编辑区域的App列表
            app_list_div.innerHTML = app_tpl_id.html;

            ui.util.init(app_list_div);

            var one_radio_id = app_tpl_id.id,
                all_radios = _Q('app-radio-button'),
                len = all_radios.length,
                img24 = _G('appImg24');

            while (len--) {
                all_radios[len].onclick = function() {
                    var me = this,
                        sid = me.value,
                        result_arr = lib.filter(appInfoList, function(item) {
                            return item.sid == sid;
                        });

                    me.checked = true;
                    img24.src = result_arr[0]['iconurl'];
                    action.setContext('selectedAppId', sid);
                }
            }

            if (type == 'add') {
                all_radios[0].onclick();
                ok_button.disable(false);
            } else {
                //action.setContext('selectedEditAppUIId', app_tpl_id.id);
                ok_button.disable(true);
            }

            action.setContext('appRadioId', one_radio_id);

            /**********************渲染App列表结束**********************/

            var plan_select = _ui_get('appendPlanSelect'),
                unit_select = _ui_get('appendUnitSelect');

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

            plan_select.onselect = function() {
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

                //获取之前存储的拿到的计划列表的完全信息，然后取出所选计划的详细信息
                var data = action.getContext('plan_select_plans'),
                    data = lib.filter(data, function(item) {
                        return item.planid == plan_id;
                    }),
                    selected_plan = data[0];

                //校验当前计划的推广设备类型，如果是仅计算机，那么报错并中断之后的流程    
                if (selected_plan.deviceprefer == 1) {
                    //显示错误信息之后要将单元列表和确定按钮置为禁用状态
                    renderLevelError(level_error_p, '此计划仅投放在计算机设备，请选择投放在全部设备或仅移动设备的计划', [unit_select, ok_button]);
                    unit_select.fill([{
                        'text': '请选择推广单元',
                        'value': -1
                    }]);
                    //return false;
                } else {
                    _addClass(level_error_p, 'hide');
                    unit_select.disable(false);
                    ok_button.disable(false);

                    if (unit_select.state.readonly) {
                        //return false;
                    } else {
                        fbs.unit.getNameList({
                            condition: {
                                planid: [plan_id]
                            },
                            onSuccess: function(response) {
                                var data = response.data.listData,
                                    len = data.length;

                                if (len == 0) {
                                    unit_select.fill([{
                                        'text': '请选择推广单元',
                                        'value': -1
                                    }]);
                                    renderLevelError(level_error_p, '当前计划下无单元，请新建单元之后再新建附加创意', [unit_select, ok_button]);
                                    return false;
                                } else {
                                    if (unit_select.state.readonly) {
                                        return false;
                                    }
                                    _addClass(level_error_p, 'hide');
                                    unit_select.disable(false);
                                    var unit_data = [{
                                        'text': '请选择推广单元',
                                        'value': -1
                                    }];

                                    for (var i = 1; i <= len; i++) {
                                        var temp_data = data[i - 1];
                                        unit_data[i] = {
                                            'text': _encodeHTML(temp_data.unitname),
                                            'value': temp_data.unitid
                                        };
                                    }
                                    action.setContext('unit_select_units', data);

                                    if (unit_select.state.readonly) {
                                        //return false;
                                    } else {
                                        unit_select.fill(unit_data);
                                    }

                                }
                            }
                        })
                    }


                }



            };

            unit_select.onselect = function() {
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

                var data = action.getContext('unit_select_units'),
                    data = lib.filter(data, function(unit) {
                        return unit.unitid == unit_id;
                    });

                var selected_unit = data[0];

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
                        ajaxFailDialog();
                    }
                });

                //校验单元下是否已经存在某种类型的附加创意，如果存在那么在层级错误显示区域显示错误
                //并将提交按钮禁用掉
                if (!noCreative(selected_unit) && type == 'add') {
                    renderLevelError(level_error_p, '此单元内已存在附加创意，请选择其他单元', [ok_button])
                    _addClass('serverReturnErrorArea', 'hide');
                } else {
                    _addClass(level_error_p, 'hide');
                    if (type == 'add') {
                        ok_button.disable(false);
                    }
                    _addClass('serverReturnErrorArea', 'hide');
                }

                //如果是由于单元导致后端返回了错误，那么这时候就将对服务端错误显示的区域隐藏起来


            };

            ok_button.onclick = action.getSaveAction();
            cancel_button.onclick = action.getCancelAction();


            //在dialog渲染完毕之后获取默认创意来渲染右侧预览位
            lib.getRelatedMaterial({
                appendType: appendType,
                for_edit: type,
                success: function() {
                    if (!_ui_get('appendIdeaEditDialog')) {
                        return false;
                    }
                },
                fail: function() {
                    ajaxFailDialog();
                }
            })


        },

        onentercomplete: function() {
            var action = this,
                appendType = action.appendType;


            nirvana.subaction.isDone = true;
            if (appendType == 'no-app') {
                return false;
            }

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
                        onSuccess: function(response) {
                            var data = response.data.listData,
                                len = data.length;

                            if (len == 0) {
                                renderLevelError(level_error_p, '当前账户下没有推广计划，请新建后操作!', [unit_select, ok_button]);
                                return false;
                            } else {
                                _addClass(level_error_p, 'hide');
                                unit_select.disable(false);
                                ok_button.disable(false);

                                action.setContext('plan_select_plans', data);

                                var plan_data = [{
                                    'text': '请选择推广计划',
                                    'value': -1
                                }];

                                for (var i = 1; i <= len; i++) {
                                    var temp_data = data[i - 1];

                                    plan_data[i] = {
                                        'text': _encodeHTML(temp_data.planname),
                                        'value': temp_data.planid
                                    }
                                }
                                plan_select.fill(plan_data);
                            }
                        },
                        onFail: function() {
                            renderLevelError(level_error_p, '计划列表获取失败，请稍候重试!', [unit_select, ok_button]);
                            return false;
                        }
                    });
                } else if (isEmpty(unit_id)) {
                    getMaterialName('plan', plan_id, function(response) {
                        var data = response.data.listData;
                        action.setContext('plan_select_plans', data);

                        //debugger;
                        plan_select.fill([{
                            'text': _encodeHTML(data[0].planname),
                            'value': plan_id
                        }]);
                        plan_select.onselect();
                        plan_select.setReadOnly(true);
                    })
                } else {
                    getMaterialName('plan', plan_id, function(response) {
                        var data = response.data.listData;
                        action.setContext('plan_select_plans', data);

                        plan_select.fill([{
                            'text': _encodeHTML(data[0].planname),
                            'value': plan_id
                        }]);

                        //debugger;
                        plan_select.onselect();
                        plan_select.setReadOnly(true)
                    });

                    getMaterialName('unit', unit_id, function(response) {
                        var data = response.data.listData;
                        action.setContext('unit_select_units', data);

                        unit_select.fill([{
                            'text': _encodeHTML(data[0].unitname),
                            'value': unit_id
                        }]);
                        //debugger;

                        if (!unit_select.state.disabled) {
                            unit_select.setReadOnly(true);
                            unit_select.onselect();
                        }


                    });
                }
            } else {
                var create_item = create_arg.item,
                    plan_id = create_item.planid,
                    unit_id = create_item.unitid,
                    plan_name = create_item.planname,
                    unit_name = create_item.unitname,
                    //is_shadow = create_arg.isShadow,
                    mtid = create_item.mcid;


                plan_select.fill([{
                    value: plan_id,
                    text: plan_name
                }]);

                plan_select.setReadOnly(true);

                getMaterialName('unit', unit_id, function(response) {
                    var data = response.data.listData;
                    action.setContext('unit_select_units', data);

                    unit_select.fill([{
                        'text': _encodeHTML(data[0].unitname),
                        'value': unit_id
                    }]);

                    unit_select.setReadOnly(true);
                    unit_select.onselect();

                    ok_button.disable(true);

                });

                var one_radio_id = action.getContext('appRadioId'),
                    radio_group = _ui_get(one_radio_id).getGroup(),
                    radio_list = radio_group.getDOMList(),
                    ri, u_ri, ri_index;

                for (var i = 0; ri = radio_list[i++];) {
                    if (ri.value != mtid) {
                        u_ri = _ui_get(ri.getAttribute('control'));
                        u_ri.disable(true);
                    } else {
                        ri_index = i - 1;
                    }
                }

                //debugger;
                radio_list[ri_index].onclick();
                _G('AccountAppList').scrollTop = (ri_index - 1) * 74;



                //var selecetdAppRadioUIid = aciton.getContext('selectedEditAppUIId');



            }
        },

        getSaveAction: function() {
            var action = this;

            return function() {
                var plan_id = _ui_get('appendPlanSelect').getValue(),
                    unit_id = _ui_get('appendUnitSelect').getValue();

                var level_error_p = _G('appendLevelError');

                //如果获取到的计划id和单元id为-1，那么返回提示让客户选择计划和单元
                if (plan_id < 0 || unit_id < 0) {
                    renderLevelError(level_error_p, '请先选择要添加的计划和单元!');
                    return false;
                } else {
                    _addClass('appendLevelError', 'hide');
                }

                var mcid = action.getContext('selectedAppId');

                if (isEmpty(mcid)) {
                    _G('serverReturnError').innerHTML = ' 请选择要推广的App！'
                    _removeClass('serverReturnErrorArea', 'hide');
                } else {
                    _addClass('serverReturnErrorArea', 'hide');

                    var obj = {
                        //planid: plan_id,
                        unitid: [unit_id],
                        mcid: mcid,
                        onSuccess: action.getSaveSuccess(config, _ui_get),
                        onFail: action.getSaveFail()
                    }

                    fbs.appendIdea.addApp(obj);
                }

            }
        }
    }

    app_action_obj = lib.extend(app_action_obj, default_prototype, false);

    manage.appIdeaEdit = new er.Action(app_action_obj);

})(nirvana.appendIdea, ui.util, baidu, er, fbs, window, undefined);