/**
 * @file src/nirvana/manage/appendIdea/appToMultiEdit.js
 * @author peilonghui@baidu.com
 */


(function(window, undefined) {
    // 引用框架和库变量
    var baidu = window.baidu;
    var _G = baidu.g, _Q = baidu.q;
    var _addClass = baidu.addClass, _removeClass = baidu.removeClass;
    var _hide  = baidu.hide, _show = baidu.show;

    var _ui_get = ui.util.get;

    // 引用项目变量
    var appendIdea = window.nirvana.appendIdea;
    var manage = window.manage, lib = manage.appendIdea.lib, copylib = manage.appendIdea.copyAppendIdeaLib;
    var config = appendIdea.config, defaultPrototype = appendIdea.AppendIdeaEditPrototype;


    // 私有记录变量
    var onlyUnitids = [], selectedAppId;
    var app_to_multi_obj = {
        onafterinitcontext: function() {
            var action = this;
            action.setContext('appendIdeaType', 'app');
            action.setContext('planLevelClickOfCopy', copyAppendIdeaLib.planLevelClickOfCopy(action, 'textClick'));
            action.setContext('planLevelAddClick', copyAppendIdeaLib.planLevelClickOfCopy(action, 'addClick'));
        },

        onafterrender: function() {
            var action = this, create_arg = action.arg;

            //清空unitids
            onlyUnitids = [];
            selectedAppId = undefined;

             _G('noAppLinkId').href = 'http://u.baidu.com/ucweb/?module=Accountcenter&controller=Accountmgr&action=accountMgr&userid=' + nirvana.env.USER_ID + '&sourceappid=3';

            copyAppendIdeaLib.getAllPlan(copyAppendIdeaLib.getAllPlanHandler(action));
            _ui_get('appToMultiNextOk').onclick = action.getNextStepAction();
            _ui_get('appToMultiNextCancel').onclick = _ui_get('cancelButton').onclick = action.getCancelAction();
            _ui_get('okButton').onclick = action.getSaveAction();
            _G('appToMultiToPrevStep').onclick = function() {
                _hide('appToMultiStepTwo')
                _show('appToMultiStepOne');
            }

            var appListDiv = _G('AccountAppList'), appInfoList = create_arg.param.appListData;
            var appListObj = lib.getAppsListHtml(appInfoList);

            appListDiv.innerHTML = appListObj.html;
            ui.util.init(appListDiv);

            var defaultRadioId = appListObj.id, allRadios = _Q('app-radio-button'), len = allRadios.length;
            var img24 = _G('appImg24');

            while(len--) {
                allRadios[len].onclick = function(evt) {
                    var radio = this, appid = radio.value;
                    var result = lib.filter(appInfoList, function(item) {
                        return item.sid == appid;
                    });

                    radio.checked = true;
                    img24.src = result[0]['iconurl'];
                    selectedAppId = appid;
                }
            } 

            allRadios[0].click();

            nirvana.subaction.isDone = true;

        }, 

        getNextStepAction: function() {
            var aciton = this;


            var goToNext = function(unitids, errorSpan) {
                var len = unitids.length, i = 0;
                while(len--) {
                    onlyUnitids[i++] = unitids[len].unitid;
                }

                errorSpan.innerHTML = '';
                _hide(errorSpan);

                _addClass('serverReturnErrorArea', 'hide');

                lib.getRelatedMaterial({
                    appendType: 'app',
                    for_edit: 'add',
                    unitid: onlyUnitids[0],
                    success: function() {
                        if (!_ui_get('appendIdeaEditDialog')) {
                            return false;
                        } else {
                            _hide('appToMultiStepOne');
                            _show('appToMultiStepTwo');
                        }
                    },
                    fail: function() {
                        ajaxFailDialog();
                    }
                })

            }
            return function() {
                onlyUnitids = [];
                var unitids = copyAppendIdeaLib.getChoosedSet(), len = unitids.length;
                var i = 0;
                var errorSpan = _G('appToMultiNextError');
                if (!len) {
                    errorSpan.innerHTML = '请先选择要添加的计划和单元!';
                    _show(errorSpan);
                    return false;
                } else if (len > 1000) {
                    ui.Dialog.confirm({
                        title: '确认',
                        content: '您选择了<strong class="warn">' +　len + '</strong>个单元，超出了每次添加的限额1000个，系统此次将只将App推广添加到<strong class="warn">前1000个</strong>单元，是否确认继续?',
                        onok: function() {
                            goToNext(unitids, errorSpan)
                        },
                        oncancel: function() {

                        }
                    });
                } else {
                    goToNext(unitids, errorSpan);   
                    
                }
            }
        },

        getSaveAction: function() {
            var action = this;
            return function() {
                var obj = {
                    unitid: onlyUnitids,
                    mcid: selectedAppId,
                    onSuccess: action.getSaveSuccess(),
                    onFail: action.getSaveFail()
                }

                fbs.appendIdea.addApp(obj);
            }
        },


        getSaveSuccess: function() {
            var action = this;

            var toggleInfoAndWarn  = function(title, content, warn) {
                var errorP = _G('serverReturnError'), errorDiv = errorP.parentNode;
                var errorT = _G('serverReturnErrorTitle');

                errorT.innerHTML = title;
                errorP.innerHTML = content;
                _removeClass(errorDiv, 'hide');
                if (warn) {
                    _removeClass(errorDiv, 'server-return-info')
                    _addClass(errorDiv, 'server-return-error');
                } else {
                    _removeClass(errorDiv, 'server-return-error');
                    _addClass(errorDiv, 'server-return-info');
                }
            }

            return function(response) {
                var status = response.status;

                var unitids = copyAppendIdeaLib.getChoosedSet();
                if (unitids.length > 1000) {
                    unitids = unitids.slice(1000);
                } else {
                    unitids = [];
                }
                action.setContext('remainIdsMap', unitids);
                var ulen = unitids.length;

                var appendSelect = _ui_get('appendIdeaCopySelect');
                if (status == 200) {
                    appendSelect.delAllNoLinkLeft();
                    if (ulen) {
                        onlyUnitids = onlyUnitids.slice(1000);
                        toggleInfoAndWarn('敬告', '由于系统限制，此次只将App推广信息添加到了您所选的前1000个单元，还有'+ ulen + '个未被添加到，您可以返回上一步查看这些单元，也可以再次点击确定来将App推广添加到这些单元');
                    } else {
                        copyAppendIdeaLib.clearCache();
                        action.onclose();
                        er.controller.fireMain('reload', {});
                        return false;
                    }
                } else if (status == 300) {

                   copyAppendIdeaLib.partSuccessHandler(response, function(failUnitids) {
                        var len = failUnitids.length;
                        toggleInfoAndWarn('错误', '抱歉,' + (unitids.length ? '在前1000个单元中' : '') + '有' + len + '个单元添加失败，请返回上一步查看添加失败的单元', 'warn'); 
                   }, action);
                   copyAppendIdeaLib.clearCache();
                } 
                
                
                var remainIdsMap = action.getContext('remainIdsMap');
                if (remainIdsMap && remainIdsMap.length) {
                    copyAppendIdeaLib.handlerRemainedUnit(action);
                }
                appendSelect.render();
                //copyAppendIdeaLib.clearCache();

                //er.controller.fireMain('reload', {});
                return false;

            }
        },

        getCancelAction: function() {
            var action = this;
            return function() {
                action.onclose();
            }
        }

    }

    app_to_multi_obj = lib.extend(app_to_multi_obj, defaultPrototype, false);
    //console.log(app_to_multi_obj);

    manage.appToMultiEdit = new er.Action(app_to_multi_obj);

})(window);