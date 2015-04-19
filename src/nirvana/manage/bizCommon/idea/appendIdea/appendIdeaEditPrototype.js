/*
 * 
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    root/nirvana/src/appendIdea/appendIdeaEditPrototype.js
 * desc:    初始化appendIdeaEdit动作
 * date:    2012-10
 * author:  peilonghui@baidu.com
 * depend:  ./config.js
 *          ./lib.js
 *          ./validator.js
 *
 */


(function(appendIdea, baidu, er, fbs, window, undefined){

    //需要引用的外部对象
    var lib = manage.appendIdea.lib,
       config = appendIdea.config;
       validator = appendIdea.validator;
       
    //引用一些常用方法
    var  _ui_get = ui.util.get,
        _G = baidu.g,
        _Q = baidu.q,
        _addClass = baidu.addClass,
        _removeClass = baidu.removeClass;
        
    var _replaceStr = lib.replaceStr;


    /**
     根据action的附加创意类型来决定action的视图模板

     @private 
     @method getView
     @return {String} 代表视图target的模板字符串
    **/
    var getView = function() {
        var action = this,
            appendType = action.appendType,
            complexity = action.complexity,
            view_map = config['VIEW_MAP'],
            ui_map = config['appendIdeaUIMap'];

        var ui_prop_map = ui_map[appendType], view = view_map[appendType];

        if (typeof view == 'object') {
            action.UI_PROP_MAP = ui_prop_map[complexity];
            return view[complexity];
        } else {
            action.UI_PROP_MAP = ui_prop_map;
            return view;
        }

    

    }



    appendIdea.AppendIdeaEditPrototype = {
        IGNORE_STATE: true,
        //getView函数用来决定要渲染的视图
        VIEW: getView,

        onbeforerender: function() {
            var action = this;
            //将附加创意类型属性上移一层，方便访问
            action.appendType = action.arg.appendIdeaType;
            action.complexity = action.arg.complexity;



        },

        getCancelAction: function() {
            var action = this;
            
            return function() {
                action.onclose();
                fbs.unit.getNameList.clearCache();
            }
        },
        
        //当数据成功的时候会调用这个函数
        getSaveSuccess: function() {
            var action = this;

            return function(response) {
                _addClass('serverReturnError', 'hide');
                fbs.unit.getNameList.clearCache();
                fbs.appendIdea.getAppendIdeaList.clearCache();
                action.onclose();

                //如果走到这一步，说明已经新增已经成功了，那么需要即是更新新增按钮的状态
                //新增按钮的状态是由er.context中的hasAppendIdea属性来决定的

                if (action.arg.type == 'add') {
                    er.context.set('hasAppendIdea', true);
                    ui.util.get('addidea').disable(true);
                    ui.util.get('addAppSelect').disable(true);
                }

                er.controller.fireMain('reload', {});
            }
        },
        
        //当数据post失败的情况下会调用这个函数
        getSaveFail: function() {
            var action = this;

            return function(response) {
                var status = response.status,
                    all_errors = nirvana.config.ERROR.APPENDIDEA,
                    error_map = all_errors[action.appendType];

                //获取异常内容显示元素和其区域元素
                var error_p = _G('serverReturnError'),
                    error_div = error_p.parentNode;


                //首先状态码错误，如果状态码异常信息有定义，
                //那么就直接显示这些信息
                if (status == '500' || status == '600') {
                    error_p.innerHTML = error_map[status];
                    _removeClass(error_div, 'hide');
                    return false;
                }

                if (status == '300' ) {
                    return false;
                }

                //如果状态码错误信息没有配置，这时候需要读取其
                //errorCode中的信息
                var error_obj = response.errorCode,
                    error_code = error_obj.code,
                    error_detail = error_obj.detail;

                //如果errorCode中的code错误信息有配置，那么就
                //读取其中信息，然后显示
                if (error_map[error_code]) {
                    error_p.innerHTML = error_map[error_code];
                    _removeClass(error_div, 'hide');
                    return false;
                }

                var error_arr = [];

                //如果errorCode中既有code，又有detail，那么就
                //读取detail中的内容，然后显示
                if (error_code && error_detail) {

                    for (key in error_detail) {
                        error_arr[error_arr.length] = key + '：' + error_detail[key];
                    }
                }
                 
                error_p.innerHTML = _replaceStr(error_arr.join('<br/>'));
                _removeClass(error_div, 'hide');
                return false;
            }
        }


    };

})(nirvana.appendIdea,baidu, er, fbs, window);