/*
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path:   appendIdea/copyAppendIdeaLib.js
 * desc:    推广管理
 * author:  yanlingling
 * date:    $Date: 2012/09/20 $
 */

/**
 * @namespace 复制附加创意的工具方法
 */

manage.appendIdea.copyAppendIdeaLib = {


    /**
     *记录某个计划下的单元是否已经被获取到了
     */
    clickMap: {},

    /**
     * 获取所有计划的名称 id
     * @param {Object} handler
     */
    getAllPlan: function(successHandler) {
        var list = ['planid', 'planname', 'unitcnt'];
        fbs.material.getAttribute('planinfo', list, {
            onSuccess: successHandler,
            onFail: function(data) {
                ajaxFailDialog();
            }
        });

    },


    /**
     *获取数据成功回调
     * @param {Object} data
     */
    getAllPlanHandler: function(action) {
        var me = action;
        return function(data) {
            var data = data.data.listData,
                appendIdeaCopySelect = ui.util.get('appendIdeaCopySelect'),
                copyData = copyAppendIdeaLib.dataAdaptPlan(data,me),
                rightData = copyAppendIdeaLib.synData(copyData);
            me.setContext('leftData', copyData);
            me.setContext('rightData', rightData);
            me.repaint();
        }



    },

    synData: function(leftData) {
        var arrayIndex = ui.util.get('appendIdeaCopySelect').arrayIndexConfig,
            rightData = baidu.object.clone(leftData);
        for (var i = 0; i < rightData.length; i++) {
            rightData[i][arrayIndex['isShow']] = false; //右面初始不显示任何数据
            rightData[i][arrayIndex['isOpen']] = true; //右面第一层级全是打开的状态
        };
        return rightData;
    },


    /**
     *把后端返回的数据转成复制控件的数据格式  for 计划
     * @param {Object} data
     */
    dataAdaptPlan: function(data, action) {
        var result = [],
            me = action,
            appendType = me.getContext('appendIdeaType'), //复制app后要根据复制的类型来升级此处 
            arrayIndex = ui.util.get('appendIdeaCopySelect').arrayIndexConfig; //字段跟数据下标的对应关系
        for (var i = 0; i < data.length; i++) {
            var nosublinkUnitCount = copyAppendIdeaLib.getNosublinkUnitCount(data[i].unitcnt),
                showNum = nosublinkUnitCount + (typeof data[i]['unitcnt'][appendType] == 'undefined' ? 0 : data[i]['unitcnt'][appendType]); //展现的 单元数目是空单元和有子链的单元

            if (showNum != 0) { //没有单元的计划不显示
                var item = [];
                item[arrayIndex['id']] = data[i].planid || data[i].unitid;
                item[arrayIndex['showChar']] = '<span class="xj_copyPlanName" title="'+ baidu.encodeHTML(data[i].planname) +'">' + baidu.encodeHTML(data[i].planname) + '</span>'  //copyAppendIdeaLib.getPlanShowHTML(data[i]);;
                item[arrayIndex['isOpen']] = false;
                item[arrayIndex['isActive']] = true;
                item[arrayIndex['nextLevelDataCount']] = showNum || 0;
                item[arrayIndex['nextLevelData']] = [];
                result.push(item);
            }

        };
        return result;

    },

    /**
     *计算没有计划没有子链的单元数  data{unitcnt:,app:,sublink:}
     */
    getNosublinkUnitCount: function(data) {
        /*var sublingSum = 0;
        for(item in data){
            if(item!='unitcnt'){
                sublingSum +=data[item];
            }
            
        }
        return data.unitcnt - sublingSum;*/
        return data.unitcnt;

    },

    /**
     *把后端返回的数据转成复制控件的数据格式 for 单元
     * @param {Object} data
     */
    dataAdaptUnit: function(data, action) {
        var result = [],
            me = action,
            opttype = me.getContext('clickOptType'),
            len = data.length,
            appendType = me.getContext('appendIdeaType') || 'sublink',
            arrayIndex = ui.util.get('appendIdeaCopySelect').arrayIndexConfig; //字段跟数据下标的对应关系
        //console.log(me.getContext('appendIdeaType'))
        for (var i = 0; i < len; i++) {
            if (!copyAppendIdeaLib.isUnitCanShow(data[i].creativecnt, appendType)) { //不能展示的单元
                continue;
            }
            var item = [];
            item[arrayIndex['id']] = data[i].unitid;
            item[arrayIndex['showChar']] = copyAppendIdeaLib.getUnitShowHTML(data[i], appendType); //data[i].unitname;
            item[arrayIndex['isOpen']] = false;
            if (opttype == 'textClick') { //通过点击文本获取的数据
                item[arrayIndex['isActive']] = true;
                item[arrayIndex['isShow']] = false;
            } else { //点击add的时候获取的数据，直接加到右面的，左面不能再添加了
                item[arrayIndex['isActive']] = false;
                item[arrayIndex['isShow']] = true; //添加操作，右面直接显示
            }
            //item[arrayIndex['isShow']]= false;
            item[arrayIndex['nextLevelDataCount']] = data[i].creativecnt.sublink;
            item[arrayIndex['nextLevelData']] = [];
            result.push(item);
        };

        return result;

    },

    /**
     *单元是否可以出现，只有无附加创意或者附加创意类型为当前类型的才可以出现
     */
    isUnitCanShow: function(data, type) {
        var sublingCount = 0;
        for (var item in data) {
            sublingCount += data[item];
        }
        if (sublingCount == 0) { //没有附加创意
            return true;
        }
        if (data[type] != 0) { //含有的附加创意是当前类型
            return true;
        }
        return false;

    },

    
    /**
     *获取单元显示的内容
     */
    getUnitShowHTML: function(data, type) {
        var html = '',
            className = 'xj_copyUnitName',
            type = type || 'sublink';
        if (data.creativecnt[type] == 0) { //没有子链
            className = 'xj_copyUnitNameLong';
        }
        html = "<span class='" + className + "' title='" + baidu.encodeHTML(data.unitname) + "'>" + baidu.encodeHTML(data.unitname) + "</span>";
        //console.log(data);
        if (data.creativecnt[type] && data.creativecnt[type] != 0) { //已有子链
            html += "<span class='warn xj_copyHaslinkChar'>" + appendIdeaConfig.copyTips[type] + "</span>"
        }
        // +'<span><>'
        return html;

    },

    getPlanShowHTML: function(data) {
        var html = '',
            className = 'xj_copyPlanName';
        html = "<span class='" + className + "' title='" + data.planname + "'>" + data.planname + "</span>";
        return html;

    },


    /**
     * 点击计划的响应事件 获取单元的数据
     * @param {Object} id
     */
    planLevelClickOfCopy: function(action, opttype) {
        var me = action;

        return function(id) {
            var clickMap = copyAppendIdeaLib.clickMap,
                copyTool = ui.util.get('appendIdeaCopySelect'),
                arrayIndex = copyTool.arrayIndexConfig,
                item = copyTool.getLeftFirstLevelData(id),
                nextData = item[arrayIndex['nextLevelData']];

            me.setContext('clickOptType', opttype);
            if (nextData.length != 0) { //数据已经获取过了 返回
                return;
            } else {
                // clickMap[id]=true;
                var succallback = copyAppendIdeaLib.getUnitHandler;
                copyAppendIdeaLib.getUnitData(me, id, succallback);
            }

        }


    },

    /**
     *获取单元数据
     */
    getUnitData: function(action, id, callback) {
        var me = action,
            param = {
                onSuccess: copyAppendIdeaLib.getUnitHandler(me, id),
                onFail: function() {
                    ajaxFailDialog();
                },
                condition: {}
            },
            planid = [];
        planid.push(id);
        param.condition.planid = planid;
        var list = ['unitid', 'unitname', 'creativecnt'];
        fbs.material.getAttribute('unitinfo', list, param);

    },


    /**
     *获取单元数据的处理
     * @param {Object} action
     */
    getUnitHandler: function(action, planid) {
        var me = action,
            planid = planid;
        return function(data) {
            var data = data.data.listData;
            var copyTool = ui.util.get('appendIdeaCopySelect');
            var arrayIndex = copyTool.arrayIndexConfig;
            
            copyAppendIdeaLib.addSecondLevelData(data, me, planid);
            if (me.getContext('clickOptType') == 'addClick') { //点击add的时候，数据获取完了，才能变化下面的数字显示
                var addCount = copyTool.getLeftFirstLevelData(planid)[arrayIndex['nextLevelData']].length;
                copyTool.addHasAdd(addCount);
            }
            me.repaint()

        }

    },

    /**
     *添加第二个层级的数据
     * @param {Object} data
     * @param {Object} action
     * @param {Object} planid
     */
    addSecondLevelData: function(data, action, planid) {
        var me = action,
            leftData = me.getContext('leftData'),
            rightData = me.getContext('rightData'),
            arrayIndex = ui.util.get('appendIdeaCopySelect').arrayIndexConfig,
            secondData = copyAppendIdeaLib.dataAdaptUnit(data, me),
            secondDataSource = copyAppendIdeaLib.getUnitDataSourceByPlanid(planid, leftData),
            secondDataRight,
            secondDataSourceRight;

        secondDataSource[arrayIndex["nextLevelData"]] = secondData,
        me.setContext('leftData', leftData); //只有setContext以后 ，repaint操做的时候才能识别

        /**右面数据设置*/
        secondDataRight = copyAppendIdeaLib.dataAdaptUnit(data, me); //copyAppendIdeaLib.synData()
        secondDataSourceRight = copyAppendIdeaLib.getUnitDataSourceByPlanid(planid, rightData);
        secondDataSourceRight[arrayIndex["nextLevelData"]] = secondDataRight;
        me.setContext('rightData', rightData); //只有setContext以后 ，repaint操做的时候才能识别

        // me.repait();

    },

    /**
     * 通过Id获取相应单元数据的索引
     * @param {Object} planid
     * @param {Object} data
     */
    getUnitDataSourceByPlanid: function(planid, data) {
        var arrayIndex = ui.util.get('appendIdeaCopySelect').arrayIndexConfig;
        //leftData = me.getContext('leftData');

        return baidu.array.filter(data, function(item, i) {
            return item[arrayIndex["id"]] == planid;
        })[0];
    },

    
    /**
     *点击确认
     * @param {Object} action
     */
    okButtonClick: function(action) {
        var me = action;
        var type = me.getContext('appendIdeaType');
        return function() {
            var unitids = copyAppendIdeaLib.getCopyUnitID(action),
                unitmap = copyAppendIdeaLib.getChoosedSet();
            if (unitids.length == 0) {
                copyAppendIdeaLib.hideError();
                return;
            }
            if (unitids.length > appendIdeaConfig.APPEND_IDEA_COPY_MAX) { //超过复制的上线的时候
                var remainIdsMap = unitmap.splice(appendIdeaConfig.APPEND_IDEA_COPY_MAX, unitmap.length); //超过100个的id先存起来
                me.setContext('remainIdsMap', remainIdsMap);
                unitids = unitids.splice(0, appendIdeaConfig.APPEND_IDEA_COPY_MAX); //只留前一百个
                var msgShow = copyAppendIdeaDiff.msgShow[type];
                ui.Dialog.confirm({
                    title: '请您确认',
                    content: appendIdeaConfig.CONFIRM_MSG(msgShow),
                    onok: copyAppendIdeaLib.copyAppendIdea(unitids, me)
                });
            } else {
                me.setContext('remainIdsMap', []); //木有超出的了，防止残余
                copyAppendIdeaLib.copyAppendIdea(unitids, me)();
            }

        }

    },

    /**
     *复制创意
     */
    copyAppendIdea: function(unitids, action) {
        var me = action;
        var type = me.getContext('appendIdeaType');
       // var idName = copyAppendIdeaDiff.idName[type];//不同的附加创意id名字不一样。。。。
        return function() {
            var param = {
                onSuccess: copyAppendIdeaLib.copyOnSuccess(me),
                onFail: copyAppendIdeaLib.copyOnFail(me),
                unitid: unitids
                //creativeid: me.getContext('creativeid')
            };
            if(type == 'sublink'){
                param.creativeid = me.getContext('creativeid');
            }
            else if(type == 'app'){
                param.mcid = me.getContext('mcid');

            }
            copyAppendIdeaDiff.copyInferFace[type](param);

        }


    },


    /**
     *获取要copy的单元的id集合 ,每个id与所对应的计划id一起返回[{unitid:1,planid:2},]
     */
    getChoosedSet: function() {
        var rightData = ui.util.get('appendIdeaCopySelect').rightData,
            arrayIndex = ui.util.get('appendIdeaCopySelect').arrayIndexConfig,
            ids = [];
        for (var i = 0; i < rightData.length; i++) {
            if (rightData[i][arrayIndex['isShow']] == true) { //第一层展示了第二级才有可能展示
                var item = rightData[i][arrayIndex['nextLevelData']];
                for (var j = 0; j < item.length; j++) {
                    if (item[j][arrayIndex['isShow']] == true) {
                        var temp = {};
                        temp.unitid = item[j][arrayIndex['id']];
                        temp.planid = rightData[i][arrayIndex['id']];
                        //temp[]=rightData[i][arrayIndex['id']];//{单元id,计划id}
                        ids.push(temp);
                    }

                }
            }
        }
        return ids;

    },

    /**
     *获取选择的单元集合
     */
    getCopyUnitID: function() {
        var unitmap = copyAppendIdeaLib.getChoosedSet(),
            unitids = [];
        for (var i = 0; i < unitmap.length; i++) {
            unitids.push(unitmap[i].unitid);
        }
        return unitids;

    },

    /**
     *copy请求返回处理
     */

    copyOnSuccess: function(action) {
        var me = action;
        return function(data) {
            var copyTool = ui.util.get('appendIdeaCopySelect');
            if (data.status == 200) { //全部成功，清除右面的数据，不关联左面
                ui.util.get('appendIdeaCopySelect').delAllNoLinkLeft();
                copyAppendIdeaLib.hideError();
                copyAppendIdeaLib.clearCache();
            } else if (data.status == 300) { //部分成功，清除右面成功的数据
                copyAppendIdeaLib.partSuccessHandler(data, undefined, me);
                copyAppendIdeaLib.clearCache();
            }
            if (me.getContext('remainIdsMap').length != 0) { //把没有处理的再添加进来。。。
                copyAppendIdeaLib.handlerRemainedUnit(me);

            }
            copyTool.render();

            var type = me.getContext('appendIdeaType');
            manage.appendIdea.copyAppendIdeaLib.sendLog(type);

        }
    },


    /**
     *处理超过100个没有传给后端的单元
     */
    handlerRemainedUnit: function(action) {
        var me = action,
            map = me.getContext('remainIdsMap'),
            copyTool = ui.util.get('appendIdeaCopySelect'),
            arrayIndex = copyTool.arrayIndexConfig,
            showNum = 0;
        for (var i = 0; i < map.length; i++) {
            var fatherData = copyTool.getRightFirstLevelData(map[i].planid),
                item = fatherData[arrayIndex['nextLevelData']];
            for (var j = 0; j < item.length; j++) {
                var id = item[j][arrayIndex['id']];
                if (id == map[i].unitid) {
                    item[j][arrayIndex['isShow']] = true; //重新展示
                    fatherData[arrayIndex['isShow']] = true;
                    showNum++;
                }

            }
        }
        me.setContext('remainIdsMap', []);
        copyTool.addHasAdd(showNum);
    },

    /**
     *隐藏提示区
     */
    hideError: function() {
        var errorEl = baidu.g('copySubLinkError');
        errorEl.innerHTML = '';
        baidu.dom.addClass(errorEl, 'hide');
    },


    /**
     *非200时候的出来
     */
    copyOnFail: function(action) {
        var me = action;
        return function(data) {
            if (data.status == 300) { //部分成功，清除右面成功的数据
                return;
            } else { //其他不管
                copyAppendIdeaLib.hideError();
                ajaxFailDialog();
            }



        }
    },

    /**
     *清缓存
     */
    clearCache: function() {
        fbs.unit.getNameList.clearCache();
        fbs.appendIdea.getAppendIdeaList.clearCache();
        fbs.material.clearCache('unitinfo');
        fbs.material.clearCache('planinfo');

    },
    /**
     *部分复制成功的处理
     */
    partSuccessHandler: function(data, callback, action) {
        var failUnitid = data.data,
            showPlanids = [],
            me = action;
            copyTool = ui.util.get('appendIdeaCopySelect'),
            rightData = copyTool.rightData,
            arrayIndex = copyTool.arrayIndexConfig;
        var type = me.getContext('appendIdeaType');
        for (var i = 0; i < rightData.length; i++) {
            if (rightData[i][arrayIndex['isShow']] == true) { //第一层展示了第二级才有可能展示
                showPlanids.push(rightData[i][arrayIndex['id']]);
            }
        }
        ui.util.get('appendIdeaCopySelect').delAllNoLinkLeft();
        //先全部从右面去掉

        var showNum = 0;
        for (var i = 0; i < showPlanids.length; i++) {
            var fatherData = copyTool.getRightFirstLevelData(showPlanids[i]),
                item = fatherData[arrayIndex['nextLevelData']];
            for (var j = 0; j < item.length; j++) {
                var id = item[j][arrayIndex['id']];
                if (copyAppendIdeaLib.isInSet(failUnitid, id) != null) { //第一层展示了第二级才有可能展示
                    item[j][arrayIndex['isShow']] = true; //重新展示
                    fatherData[arrayIndex['isShow']] = true;
                    showNum++
                }

            }

        }
        copyTool.addHasAdd(showNum);
        if (callback) {
            callback(failUnitid);
        } else {
            var error = failUnitid.length + '个单元复制'+ copyAppendIdeaDiff['msgShow'][type]  +'没有成功，请重新复制',
            errorEl = baidu.g('copySubLinkError');
            errorEl.innerHTML = error;
            baidu.dom.removeClass(errorEl, 'hide');
        }
        
        // baidu.removeClass('hide');

    },



    /**
     *一个id集合里面是否有另一个id ?????
     */
    isInSet: function(failUnitid, id) {
        return baidu.array.find(failUnitid, function(item, i) {
            return item == id;
        })

    },


    /**
     *点击取消
     */
    cancelButtonClick: function(action) {
        var me = action;
        return function() {
            me.onclose();
            er.controller.fireMain('reload', {})
        }


    },

    /**
     * 发送监控
     * @param {string} 附加创意类型
     */ 
    sendLog : function(type) {
        NIRVANA_LOG.send({
            target : 'batch-copy-appendidea',
            type : type,
            optulevelid : nirvana.env.OPT_ULEVELID
        })
    }


}
var copyAppendIdeaLib = manage.appendIdea.copyAppendIdeaLib;