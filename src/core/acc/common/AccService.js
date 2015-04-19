/**
 * @file src/core/bizCommon/acc/common/AccService.js 权限控制中心服务类 
    Authority Control Center
    权限控制中心，进行Web层面的权限控制
    针对于optid，无视userid

    进行实际的权限控制

 * @author Leo Wang(wangkemiao@baidu.com)
 * @date 2013/5/20
 * @version 1.0
 */

nirvana.acc.AccService = (function() {
    // tangram => baidu
    var util = nirvana.util;
    // var authConfig = nirvana.acc.authConfig;
    
    /**
     * ACC服务类
     * @constructor
     */
    function AccService(options) {
        if(baidu.lang.isObject(options)) {
            util.deepExtend(this, options);
        }
        // this.initAuth();
    }

    // /**
    //  * ACC根据modName获取对应的模块
    //  */
    // AccService.prototype.getModule = function(modName) {
    //     if(!modName) {
    //         return null;
    //     }
    //     var callName = modName.replace(/\//g, '.');
    //     var mod;
    //     eval('mod = ' + callName);
    //     return mod;
    // };

    // /**
    //  * ACC插入实际模块进行控制
    //  */
    // AccService.prototype.aspect = function(modName) {
    //     if(!modName) {
    //         return;
    //     }
    //     var mod = this.getModule(modName);
    //     var modConf = nirvana.acc.moduleConfig(modName);
    //     if(!mod || !modConf) {
    //         return;
    //     }
    //     if(!mod.processEntrance) {
    //         mod.processEntrance = new nirvana.acc.EntranceProcessor({
    //             config: modConf,
    //             modName: modName
    //         });
    //     }
    //     else {
    //         var tempfunc = mod.processEntrance;
    //         var preProcessor = new nirvana.acc.EntranceProcessor(modConf);
    //         mod.processEntrance = function() {
    //             preProcessor.apply(mod);
    //             var args = [];
    //             var i = 0;
    //             var l = arguments.length;
    //             for(; i < l; i++) {
    //                 args.push(arguments[i]);
    //             }
    //             tempfunc.apply(mod, args);
    //         };
    //     }
    // };

    /**
     * ACC处理入口
        待那个搞搞管理页和bizCommon的东西后重写
     */
    AccService.prototype.processEntrances = function(entry) {
        if(this.hasAuth || !entry) {
            return;
        }
        var target;
        var item;
        switch(entry) {
            case 'manage/plan':
            case 'manage/unit':
            case 'manage/keyword':
            case 'manage/idea':
            case 'manage/localIdea':
                target = ui.util.get('moreOpt');

                if(target) {
                    target.disableItemByValue('delete',true);
                    item = $$('#ctrlselectmoreOptlayer [value=delete]');
                    if(item && item.length > 0) {
                        for(var key in item) {
                            item[key].title = '此功能已限制客服操作';
                            baidu.setAttr(item[key], 'data-log', '{target:\'disabledActForDel\'}');
                        }
                    }
                }
                target = ui.util.get('runPause');
                if(target) {
                    target.disableItemByValue('pause',true);
                    item = $$('#ctrlselectrunPauselayer [value=pause]');
                    if(item && item.length > 0) {
                        for(var key in item) {
                            item[key].title = '此功能已限制客服操作';
                            baidu.setAttr(item[key], 'data-log', '{target:\'disabledActForPause\'}');
                        }
                    }
                }
                break;
            case 'manage/appendIdea':
                target = ui.util.get('delAppendIdea');
                if(target) {
                    target.disable(true);
                    target.main.title = '此功能已限制客服操作';
                    baidu.setAttr(target.main, 'data-log', '{target:\'disabledActForDel\'}');
                }
                target = ui.util.get('runPause');
                if(target) {
                    target.disableItemByValue('pause',true);
                    item = $$('#ctrlselectrunPauselayer [value=pause]');
                    if(item && item.length > 0) {
                        for(var key in item) {
                            item[key].title = '此功能已限制客服操作';
                            baidu.setAttr(item[key], 'data-log', '{target:\'disabledActForPause\'}');
                        }
                    }
                }
                break;
            case 'manage/monitorList':
                target = ui.util.get('deletefolder');
                if(target) {
                    target.disable(true);
                    target.main.title = '此功能已限制客服操作';
                    baidu.setAttr(target.main, 'data-log', '{target:\'disabledActForDel\'}');
                }
                target = ui.util.get('runPause');
                if(target) {
                    target.disableItemByValue('pause',true);
                    item = $$('#ctrlselectrunPauselayer [value=pause]');
                    if(item && item.length > 0) {
                        var i = 0, l = item.length;
                        for(; i < l; i++) {
                            item[i].title = '此功能已限制客服操作';
                            baidu.setAttr(item[i], 'data-log', '{target:\'disabledActForPause\'}');
                        }
                    }
                }
                break;
            case 'manage/monitorDetail':
                target = ui.util.get('runPause');
                if(target) {
                    target.disableItemByValue('pause',true);
                    item = $$('#ctrlselectrunPauselayer [value=pause]');
                    if(item && item.length > 0) {
                        for(var key in item) {
                            item[key].title = '此功能已限制客服操作';
                            baidu.setAttr(item[key], 'data-log', '{target:\'disabledActForPause\'}');
                        }
                    }
                }
                break;
            case 'ao/manual/widgetDetail8':
                target = ui.util.get('deleteItem');
                if(target) {
                    target.disable(true);
                    target.main.title = '此功能已限制客服操作';
                    baidu.setAttr(target.main, 'data-log', '{target:\'disabledActForDel\'}');
                }
                break;
            case 'ao/manual/widgetDetail3':
                target = ui.util.get('AoDetailDelete');
                if(target) {
                    target.disable(true);
                    target.main.title = '此功能已限制客服操作';
                    baidu.setAttr(target.main, 'data-log', '{target:\'disabledActForDel\'}');
                }
                target = $$('#ctrldialogWidget3body [actiontype=deletekeyword]');
                if(target && target.length > 0) {
                    var i = 0, l = target.length;
                    for(; i < l; i++) {
                        baidu.dom.addClass(target[i], 'disabled-link');
                        target[i].title = '此功能已限制客服操作';
                        baidu.setAttr(target[i], 'data-log', '{target:\'disabledActForDel\'}');
                    }
                }
                break;
            case 'ao/manual/widgetDetail15':
                target = ui.util.get('WidgetIdeaDelete');
                if(target) {
                    target.disable(true);
                    target.main.title = '此功能已限制客服操作';
                    baidu.setAttr(target.main, 'data-log', '{target:\'disabledActForDel\'}');
                }
                break;

            case 'aoPackage/detail/302':
                target = ui.util.get('WidgetApply');
                if(target) {
                    target.disable(true);
                    target.main.title = '此功能已限制客服操作';
                    baidu.setAttr(target.main, 'data-log', '{target:\'disabledActForDel\'}');
                }
                target = $$('#QualityAoPkgDetailContainer [act=batchDelIdea]');
                if(target && target.length > 0) {
                    for(var i = 0, l = target.length; i < l; i++) {
                        item = ui.util.get(baidu.dom.getAttr(target[i], 'control'));
                        if(item) {
                            item.disable(true);
                            item.main.title = '此功能已限制客服操作';
                            baidu.setAttr(item.main, 'data-log', '{target:\'disabledActForDel\'}');
                        }
                    }
                }
                break;
            case 'fuseSuggestion/detail/ideaList':
                target = ui.util.get('deleteMultiBtn');
                if(target) {
                    target.disable(true);
                    target.main.title = '此功能已限制客服操作';
                    baidu.setAttr(item.main, 'data-log', '{target:\'disabledActForDel\'}');
                }
                break;

        }

    };

    /**
     * ACC处理入口
        待那个搞搞管理页和bizCommon的东西后重写
     */
    var statusBtnExp = new RegExp('status_op_btn', 'g');
    var statusBtnLogExp = /data-log="{[\\\w:'"{}]*}"/g;
    var ideaStatusBtnExp = new RegExp('act="{button}"', 'g');
    AccService.prototype.processPause = function(pauseStat, tpl) {
        if(this.hasAuth || !tpl) {
            return tpl;
        }
        if(pauseStat == 0) {
            tpl = tpl.replace(statusBtnLogExp, '')
                .replace(
                    statusBtnExp,
                    'status_op_btn_disabled" title="此功能已限制客服操作" data-log="{target:\'disabledActForPause\'}"')
                .replace(ideaStatusBtnExp, 'act="pauseIdea-disabled" title="此功能已限制客服操作"')
                .replace(/act="\w+"/g, 'act="pauseIdea-disabled" data-log="{target:\'disabledActForPause\'}"');
        }
        return tpl;
    };

    return AccService;
})();

