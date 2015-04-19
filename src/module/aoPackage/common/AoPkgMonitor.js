/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: common/monitor/AoPkgMonitor.js 
 * desc: 优化包的用户行为监控
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/10/19 $
 */
/**
 * 包控制类库的名字空间
 */
nirvana.aoPkgControl = nirvana.aoPkgControl || {};
/**
 * 公共监控数据
 * @param {Object} actionName
 * @param {Object} param
 *
 * 快捷方式
 * logCenter('quicksetup_init');					// 进入时初始化的信息的log
 *
 */
nirvana.aoPkgControl.logCenter = {
    logParam : {
        client : 'web'
    },
    sendParam : null,
    displayParam : {},
    entrance : null,
    pkgContext : null,
    actionStep : -1,
    actionStepPlus1 : function(){
        // 把actionStep+1
        this.actionStep++;
        this.logParam.actionStep++;
    },
    initPkgContext : function(){
        this.pkgContext = (new Date()).valueOf();
        this.actionStep = -1;
        this.logParam.pkgContext = this.pkgContext;
        this.logParam.actionStep = this.actionStep;
        return this;
    },
    // del by huiyao 2013.1.6 没用到的方法
    //	initWith : function(target){
    //		this.logParam.pkgid = target.pkgid;
    //		if(target.pkgid == 1){
    //			this.logParam.decrtype = target.optimizerCtrl.decrtype;
    //		}
    //		return this;
    //	},
    setEnterance : function(value){
        this.entrance = value;
        this.logParam.entrance = value;
        return this;
    },
    extendDefault : function(extraParam){
        baidu.extend(this.logParam, extraParam);
        return this;
    },
    extend : function(extraParam){
        var temp = baidu.object.clone(this.logParam);
        baidu.extend(temp, extraParam);
        this.sendParam = temp;
        return this;
    },
    sendAs : function(target){
        var param = this.sendParam || baidu.object.clone(this.logParam) || {};
        param.target = target;

        param.actionStep++;
        this.actionStepPlus1();

        NIRVANA_LOG.send(param);
        this.sendParam = null;

        return this;
    },
    clear : function(){
        this.logParam = {
            client : 'web'
        };
        if(this.entrance != null){
            this.logParam.entrance = this.entrance;
        }
        if(this.pkgContext != null){
            this.logParam.pkgContext = this.pkgContext;
        }
        this.logParam.actionStep = this.actionStep;
        return this;
    },
    delKeyFromDefault : function(key){
        if('undefined' != typeof this.logParam[key]){
            delete this.logParam[key];
        }
        return this;
    },
    processDisplayParam : function(displayLogParam){
        var logParam = {
            isEmpty : displayLogParam.length == 0,
            optimizerItems : []
        };
        for(var i = 0; i < displayLogParam.length; i++){
            logParam.optimizerItems.push(displayLogParam[i].opttypeid);
            switch(+displayLogParam[i].opttypeid){
                case 101:
                    logParam['opt_101'] = 1;
                    break;
                case 102:
                case 201:
                    logParam['opt_' + displayLogParam[i].opttypeid] = displayLogParam[i].data.bgttype;
                    break;
                case 303.1:
                    logParam['opt_' + displayLogParam[i].opttypeid] = displayLogParam[i].data.word_cnt_1;
                    break;
                case 303.2:
                    logParam['opt_' + displayLogParam[i].opttypeid] = displayLogParam[i].data.word_cnt_2;
                    break;
                default:
                    logParam['opt_' + displayLogParam[i].opttypeid] = displayLogParam[i].data.count;
                    break;
            }
        }
        return this.extend(logParam);
    }
};

/**
 * 用于发送智能优化包使用情况的监控的静态类
 * 
 * @class AoPkgMonitor
 * @namespace nirvana
 * @static
 */
nirvana.AoPkgMonitor = function($, T, nirvana) {
    var logger = nirvana.aoPkgControl.logCenter;

	var AoPkgMonitor = {
        /**
         * 关闭模式常量定义
         */
        CLOSE_MODE: {
            // 通过对话框右上角的'x'关闭
            BY_X: 1,
            // 通过对话框底部的'关闭'按钮关闭
            BY_CLOSE_BTN: 0
        },
        /**
         * 关闭优化包发送的监控
         * @param {string} currViewName 关闭优化包时，优化包所处的视图名称：'overview'
         *                 还是'detail'，对于没有详情页比如重点词排名包，可以传''或null
         * @param {number} closeMode 关闭模式，见{@link CLOSE_MODE}
         */
        closeAoPkg: function(currViewName, closeMode) {
            var param = {
                type: closeMode
            };
            currViewName && (param.view = currViewName);
            logger.extend(param).sendAs('nikon_package_close');
        },
		/**
		 * 查看优化包的优化建议的查看详情 
		 * @method viewOptimizeDetail
		 * @static 
		 * @param {String} optid 优化建议的ID字符串，用于前端
		 * @param {String} opttypeid 优化建议的类型ID
		 * @param {Boolean} hasRank 优化建议项前面是否有序号：1,2,3,...
		 * @param {Object} data 优化建议的数据，只是当前查看的优化项的数据
		 * @param {Object} cache 当前的cache数据
		 */
		viewOptimizeDetail: function(optid, opttypeid, hasRank, data, cache) {
            var logParam = { opttypeid: opttypeid };

            var li = baidu.g('AoPkgAbsItem' + optid);
            logParam.isnew = (baidu.q('aopkg_updated', li, 'span').length > 0 ? 1 : 0);
            logParam.optmd5 = cache.optmd5;
            data.planid && (logParam.planid = data.planid);

            if (hasRank) {
                var qlist = baidu.q('aopkg_rank', li, 'span'),
                    rank;
                if (qlist.length > 0) {
                    rank = qlist[0].innerHTML;
                }
                logParam.rank = rank;
            }

            // 质量度优化项
            if (+ opttypeid == 303) {
                for (var k in data) {
                    // 对于每个不同的质量度都采用不同key，这里只能这么判断
                    if (k.indexOf('word_cnt') != - 1) {
                        logParam.showqstat = data[k];
                        break;
                    }
                }
            }

            // 发送监控
            logger.extend(logParam).sendAs('nikon_optitem_viewdetail');
		},
        /**
         * 滑动到摘要视图发送的监控
         * @param {String} opttypeid 优化建议的类型ID
         */
        slideBackAbstract: function(opttypeid) {
            logger.extend({
                opttypeid: opttypeid
            }).sendAs('nikon_optitem_switch2overview');
        },
		/**
		 * 一键应用所选
		 * @method applySelOptimizeItems
		 * @param {AoPkgOptimizerCtrl} aopkgOptCtrl 优化包优化建议组件
		 * @param {Array} optIds 要应用的前端优化项ID
		 * @static 
		 */
		applySelOptimizeItems: function(aopkgOptCtrl, optIds) {
			// 监控，一键应用监控
			var logIdArr = [],
			    budgePlanIds = [],
			    cycPlanIds = [],
			    optTypeId,
			    itemData;
			    
			for(var i = 0; i < optIds.length; i++){
				itemData = aopkgOptCtrl.getOptimizeItemData(optIds[i]);
				optTypeId = itemData.opttypeid;
				logIdArr.push(optTypeId);
				
				// 计划预算
				if (602 == optTypeId || 202 == optTypeId || 103 == optTypeId) {
					budgePlanIds.push(itemData.data.planid);
				} else if (603 == optTypeId || 104 == optTypeId) {
					// 时段修改
					cycPlanIds.push(itemData.data.planid);
				}
			}

			logIdArr = baidu.array.unique(logIdArr);
			
			var logParam = {
				opttypeid : logIdArr.join(),
				count : logIdArr.length
			};
			
			// 初始化优化的预算的计划
			if(budgePlanIds.length > 0) {
				logParam.budget_planid = budgePlanIds.join();
			} 
			
			// 初始化优化的时段的计划
			if (cycPlanIds.length > 0) {
				logParam.cyc_planid = cycPlanIds.join();
			}

            logger.extend(logParam).sendAs('nikon_optitem_applyall');
		},
        /**
         * 发送重点词数据准备好的监控
         * @param {Array} wordArr 重点词数据的数组
         * @param {number} filterType 当前过滤类型
         */
        corewordDataStable: function(wordArr, filterType) {
            var j = 0, l = wordArr.length,
                logwinfoids = [],
                logwordids = [],
                logreasons = [],
                lognoshowreasons = [],
                logplanids = [],
                logunitids = [],
                logactions = [];

            var util = nirvana.corewordUtil;

            for(; j < l; j++){
                logwinfoids.push(wordArr[j].winfoid);
                logwordids.push(wordArr[j].wordid);
                logreasons.push(wordArr[j].reason);
                lognoshowreasons.push(wordArr[j].noshowreason);
                logplanids.push(wordArr[j].planid);
                logunitids.push(wordArr[j].unitid);
                logactions.push(util.getCorewordSuggestType(wordArr[j], true).join('|'));
            }
            logger.extend({
                filtertype: filterType,
                recmwinfoids: logwinfoids.join(','),
                recmwordids: logwordids.join(','),
                recmnoshowreasons: lognoshowreasons.join(','),
                recmreasons: logreasons.join(','),
                recmactions: logactions.join(','),
                recmplanids: logplanids.join(','),
                recmunitids: logunitids.join(',')
            }).sendAs('nikon_coreword_is_stable');
        },
        /**
         * 添加重点词的方式类型常量定义
         * @type {number}
         */
        CorewordAddType: {
            // 通过推荐重点词的对话框关注
            RECMD_DLG: 1,
            // 通过轮播的立即关注按钮进行关注
            BROADCAST: 2,
            // 通过修改重点词对话框进行关注
            MODIFY_DLG: 3
        },
        /**
         * 添加重点词成功发送的监控
         * @method addCorewords
         * @param {Array} addWordIdList 要关注的重点词winfoid列表
         * @param {number} type 添加重点词的方式，其常量定义见
         *                      {@link nirvana.AoPkgMonitor.CorewordAddType}
         */
        addCorewords: function(addWordIdList, type) {
            if (!addWordIdList || addWordIdList.length == 0) {
                return;
            }
            // 监控
            logger.extend({
                winfoid : addWordIdList,
                addtype: type
            }).sendAs('nikon_package_coreword_add');
        },
        /**
         * 通过修改重点词对话框方式添加重点词
         * @param {Array} addWordIdList 要关注的重点词winfoid列表
         */
        addCorewordByModifyDlg: function(addWordIdList) {
            AoPkgMonitor.addCorewords(addWordIdList,
                AoPkgMonitor.CorewordAddType.MODIFY_DLG);
        },
        /**
         * 关闭推荐重点词对话框发送的监控：通过取消按钮或者右上角的x触发
         */
        closeRcmdCorewordDlg: function() {
            logger.extend({
            }).sendAs('nikon_package_coreword_recmclose');
        },
        /**
         * 点击轮播的查看更多链接发送的监控
         */
        viewMoreRecmdCorewords: function() {
            logger.extend({
            }).sendAs('nikon_package_coreword_recmmore');
        },
        /**
         * 点击‘点击更新’按钮发送的监控
         */
        updateCorewordDetail: function() {
            logger.extend({
            }).sendAs('nikon_package_coreword_update');
        },
        /**
         * 通过推荐重点词浮出层更新重点词
         * @param {Array} addWinfoids 添加成功的重点词winfoid数组
         * @param {Array} delWinfoids 删除成功的重点词winfoid数组
         * @param {number} recmAddNum 推荐添加的重点词数量
         * @param {number} recmDelNum 推荐删除的重点词数量
         */
        updateCoreWordsFromRecm: function(addWinfoids, delWinfoids, recmAddNum, recmDelNum) {
            logger.extend({
                addwinfoids: addWinfoids,
                delwinfoids: delWinfoids,
                recmaddnum: recmAddNum,
                recmdelnum: recmDelNum
            }).sendAs('nikon_package_coreword_modbyrecm');
        },
        /**
         * 弹窗显示推荐更新重点词的信息
         * @param {Array} recmAddWinfoids 推荐添加的重点词
         * @param {Array} recmDelWinfoids 推荐删除的重点词
         */
        autoShowRecmCorewordUpdateDlg: function (recmAddWinfoids, recmDelWinfoids) {
            logger.extend({
                recmaddwinfoids: recmAddWinfoids.join(),
                recmdelwinfoids: recmDelWinfoids.join(),
                recmaddnum: recmAddWinfoids.length,
                recmdelnum: recmDelWinfoids.length
            }).sendAs('nikon_package_coreword_autoshowrecmdlg');
        },
        /**
         * 添加重点词的方式类型常量定义
         * @type {number}
         */
        CorewordDeleteType: {
            // 通过表格内的‘取消关注’按钮触发
            INLINE: 1,
            // 通过修改重点词对话框进行取消关注
            MODIFY_DLG: 2
        },
        /**
         * 点击表格的'取消重点词关注'按钮确定取消后，发送的监控
         * @param {Array} removeWordIdList 要取消关注的重点词winfoid列表
         * @param {number} type 取消关注的方式的类型，{@link CorewordDeleteType}
         */
        delCoreword: function(removeWordIdList, type) {
            logger.extend({
                winfoid : removeWordIdList,
                deltype: type
            }).sendAs('nikon_package_coreword_delete');
        },
        /**
         * 点击表格的'取消重点词关注'按钮确定取消后，发送的监控
         * @param {Array} removeWordIdList 要取消关注的重点词winfoid列表
         */
        delCorewordInline: function(removeWordIdList) {
            AoPkgMonitor.delCoreword(removeWordIdList,
                AoPkgMonitor.CorewordDeleteType.INLINE);
        },
        /**
         * 通过修改重点词对话框方式取消重点词关注，发送的监控
         * @param {Array} removeWordIdList 要取消关注的重点词winfoid列表
         */
        delCorewordByModifyDlg: function(removeWordIdList) {
            AoPkgMonitor.delCoreword(removeWordIdList,
                AoPkgMonitor.CorewordDeleteType.MODIFY_DLG);
        },
        /**
         * 切换重点词投放地域发送的监控
         * @param {string] oldSelRegionId 原来选择的投放地域Id
         * @param {string} newSelRegionId 当前选择的投放地域Id
         */
        switchCorwordRegion: function(oldSelRegionId, newSelRegionId) {
            logger.extend({
                oldRegion: oldSelRegionId,
                newRegion: newSelRegionId
            }).sendAs('nikon_package_coreword_regionswitch');
        },
        /**
         * 过滤重点词发送的监控
         * @param {string} oldFilterType 原来的过滤筛选类型Id
         * @param {string} currFilterType 当前的过滤筛选类型Id
         * @param {Object} filterTypeNumMap 过滤筛选类别数量的Map
         */
        filterCoreword: function(oldFilterType, currFilterType, filterTypeNumMap) {
            var availableFilterTypeArr = [];
            var FILTER_TYPE = nirvana.aopkg.CorewordDetail.COREWORD_FILTER;
            var type;

            for (var k in FILTER_TYPE) {
                type = FILTER_TYPE[k];
                if (filterTypeNumMap[type]) {
                    availableFilterTypeArr.push(type);
                }
            }

            // 所有分析筛选类别数量都为0，只有'全部'类别可见
            if (availableFilterTypeArr.length <= 0) {
                availableFilterTypeArr[0] = FILTER_TYPE.ALL;
            }

            logger.extend({
                oldfiltertype : oldFilterType,
                filtertype : currFilterType,
                currFilterTypes : availableFilterTypeArr
            }).sendAs('nikon_package_coreword_filter');
        },
        /**
         * 点击突降急救包的设置链接发送的监控
         */
        clickDecrSetting: function() {
            logger.extendDefault({
                entrancetype: 0
            }).sendAs('nikon_decrconfig_enter');
        },
        /**
         * 设置突降急救包的点击量突降的阈值成功发送的监控
         * @param {string} oldType 设置前的阈值的类型
         * @param {string} newType 设置后的阈值的类型
         * @param {number} oldValue 设置前的阈值
         * @param {number} newValue 设置后的阈值
         */
        setDecrThresholdValueSuccess: function(oldType, newType, oldValue, newValue) {
            //进入设置页面的时候把入口设为了默认参数带入，此处发完了就要清除掉它
            logger.extend({
                oldtype: oldType,
                newtype: newType,
                oldvalue: oldValue,
                newvalue: newValue
            }).sendAs('nikon_decrconfig_save').delKeyFromDefault('entrancetype');
        },
        /**
         * 修改关键词出价成功发送的监控
         * @param {Object} item 修改的关键词对象
         * @param {number} newBid 修改后关键词的出价
         * @param {number} opttypeid 优化出价的优化项类型id
         * @param {?Object} extra 要追加发送的监控数据对象
         */
        modWBid: function(item, newBid, opttypeid, extra) {
            // 监控
            var logParam = {
                opttypeid: opttypeid,
                winfoid: item.winfoid,
                planid: item.planid,
                unitid: item.unitid,
                oldvalue: +item.bid || item.unitbid,
                newvalue: newBid,
                recmbid: item.recmbid,
                reason: item.reason || null
            };

            T.extend(logParam, extra || {});

            logger.extend(logParam).sendAs('nikon_modify_bid');
        },
        /**
         * 行内修改关键词出价成功发送的监控
         * @param {Object} item 修改的关键词对象
         * @param {number} newBid 修改后关键词的出价
         * @param {number} opttypeid 优化出价的优化项类型id
         */
        inlineModBidSuccess: function(item, newBid, opttypeid) {
            AoPkgMonitor.modWBid(item, newBid, opttypeid);
        },
        /**
         * 修改关键词匹配成功发送的监控
         * @param {Object} item 修改的关键词对象
         * @param {number} newWmatch 修改后关键词的匹配类型
         * @param {number} opttypeid 优化出价的优化项类型id
         * @param {?Object} extra 要追加发送的监控数据对象
         */
        modWMatch: function(item, newWmatch, opttypeid, extra) {
            var logParam = {
                opttypeid: opttypeid,
                winfoid: item.winfoid,
                planid: item.planid,
                unitid: item.unitid,
                oldvalue: item.wmatch,
                newvalue: newWmatch,
                recmwmatch: item.recmwmatch,
                reason: item.reason || null
            };

            T.extend(logParam, extra || {});

            logger.extend(logParam).sendAs('nikon_modify_wmatch');
        },
        /**
         * 行内修改关键词匹配成功发送的监控
         * @param {Object} item 修改的关键词对象
         * @param {number} newWmatch 修改后关键词的匹配类型
         * @param {number} opttypeid 优化出价的优化项类型id
         */
        inlineModMatchSuccess: function(item, newWmatch, opttypeid) {
//            // 监控
//            var logParam = {
//                opttypeid: opttypeid,
//                winfoid: item.winfoid,
//                planid: item.planid,
//                unitid: item.unitid,
//                oldvalue: item.wmatch,
//                newvalue: newWmatch,
//                recmwmatch: item.recmwmatch,
//                reason: item.reason || null
//            };
//
//            logger.extend(logParam).sendAs('nikon_modify_wmatch');
            AoPkgMonitor.modWMatch(item, newWmatch, opttypeid);
        },
        /**
         * 行内启用关键词、单元或计划成功发送的监控
         * @param {string} levelName 层级名称：planinfo, unitinfo, wordinfo
         * @param {string} levelIdName 层级ID名称:planid, winfoid, unitid
         * @param {number} idValue 层级ID值，即planid, winfoid, unitdi值
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         */
        inlineRun: function(levelName, levelIdName, idValue, opttypeid) {
            var logParam = {
                level: levelName,
                opttypeid: opttypeid
            };
            logParam[levelIdName] = idValue;

            logger.extend(logParam).sendAs('nikon_modify_run');
        },
        /**
         * 查看/收起创意发送的监控
         * @param {Object} item 创意相关的数据对象
         * @param {number} opttypeid 启用创意所属的优化项类型id
         * @param {number} state 查看：1或收起：0
         */
        toggleIdea: function(item, opttypeid, state) {
            logger.extend({
                planid: item.planid,
                unitid: item.unitid,
                action_type: state,
                opttypeid: opttypeid
            }).sendAs('nikon_modifyidea_view');
        },
        /**
         * 收起创意发送的监控
         * @param {Object} item 创意相关的数据对象
         * @param {number} opttypeid 启用创意所属的优化项类型id
         */
        collapseIdea: function(item, opttypeid) {
            AoPkgMonitor.toggleIdea(item, opttypeid, 0);
        },
        /**
         * 查看创意发送的监控
         * @param {Object} item 创意相关的数据对象
         * @param {number} opttypeid 启用创意所属的优化项类型id
         */
        expandIdea: function(item, opttypeid) {
            AoPkgMonitor.toggleIdea(item, opttypeid, 1);
        },
        /**
         * 添加创意发送的监控
         * @param {Object} item 创意相关的数据对象
         */
        addIdea: function(item) {
            logger.extend({
                action_type: 0,
                planname: item.planname,
                unitname: item.unitname,
                opttypeid: item.opttypeid
            }).sendAs('nikon_modifyidea_add');
        },
        /**
         * 编辑创意发送的监控
         * @param {Object} item 创意相关的数据对象
         */
        editIdea: function(item) {
            logger.extend({
                action_type: 0,
                planid: item.planid,
                unitid: item.unitid,
                ideaid: item.ideaid,
                ideastat: item.ideastat,
                pausestat: item.pausestat,
                opttypeid: item.opttypeid
            }).sendAs('nikon_modifyidea_edit');
        },
        /**
         * 编辑创意（优化创意），可以保存为新建的创意
         * @param {Object} idea 创意的数据对象
         */
        modIdeaAsNew: function(idea) {
            logger.extend({
                action_type: 0,
                planid: idea.planid || 0,
                unitid: idea.unitid || 0,
                ideaid: idea.ideaid,
                ideastat: idea.ideastat,
                pausestat: idea.pausestat,
                opttypeid: idea.opttypeid,
                showqstat: idea.showqstat,
                winfoid: idea.winfoid,
                showword: idea.showword
            }).sendAs('nikon_modifyidea_modasnew');
        },
        /**
         * 启用创意
         * @param {Array} ideaid 创意的id
         * @param {number} opttypeid 启用创意所属的优化项类型id
         * @param {number} actionType 触发这个动作当前所属的类型(状态)，
         *                            见常量定义{@link ACTION_STATE}
         */
        enableIdea: function(ideaid, opttypeid, actionType) {
            logger.extend({
                opttypeid: opttypeid,
                ideaid: ideaid.join(),
                action_type: actionType
            }).sendAs('nikon_modifyidea_run');
        },
        /**
         * 暂停创意
         * @param {Array} ideaid 创意的id
         * @param {number} opttypeid 暂停创意所属的优化项类型id
         * @param {number} actionType 触发这个动作当前所属的类型(状态)，
         *                            见常量定义{@link ACTION_STATE}
         */
        pauseIdea: function(ideaid, opttypeid, actionType) {
            logger.extend({
                opttypeid: opttypeid,
                ideaid: ideaid.join(),
                action_type: actionType
            }).sendAs('nikon_modifyidea_pause');
        },
        /**
         * 质量度优化详情的查询监控
         * @param {string} searchStr 查询串
         * @param {number} star 质量度
         * @param {number} opttypeid 优化项类型id
         */
        searchWord: function(searchStr, star, opttypeid) {
            logger.extend({
                searchstr: searchStr,
                showqstat: star,
                opttypeid: opttypeid
            }).sendAs('nikon_search_dosearch');
        },
        /**
         * 质量度优化详情的取消查询监控
         * @param {number} star 质量度
         * @param {number} opttypeid 优化项类型id
         */
        cancelSearchWord: function(star, opttypeid) {
            logger.extend({
                showqstat: star,
                opttypeid: opttypeid
            }).sendAs('nikon_search_cancelsearch');
        },
        /**
         * 触发操作时候状态，用于一些监控有二次确认状态
         */
        ACTION_STATE: {
            CLICK: 0,   // 触发点击操作，进入二次确认状态
            CONFIRM: 1, // 二次确认点击确定
            CANCEL: -1  // 二次确认点击取消
        },
        /**
         * 批量修改创意发送的监控：激活、启用、删除
         * @param {Array} ideaIds 要激活的创意id数组
         * @param {number} opttypeid 执行此操作所对应的优化类型id
         * @param {string} actionName 当前触发的批量操作的类型名称
         *                            其值为监控的target
         * @param {number} actionType 触发这个动作当前所属的类型(状态)，
         *                            见常量定义{@link ACTION_STATE}
         */
        batchModIdea: function (ideaIds, opttypeid, actionName, actionType) {
            logger.extend({
                applycount: ideaIds.length,
                opttypeid: opttypeid,
                selectedids: ideaIds.join(),
                action_type: actionType
            }).sendAs(actionName);
        },
        /**
         * 批量激活创意
         */
        batchActiveIdea: function(ideaIds, opttypeid, actionType) {
            AoPkgMonitor.batchModIdea(ideaIds, opttypeid,
                'nikon_multiapply_idea_active', actionType);
        },
        /**
         * 批量启用创意
         */
        batchEnableIdea: function(ideaIds, opttypeid, actionType) {
            AoPkgMonitor.batchModIdea(ideaIds, opttypeid,
                'nikon_multiapply_idea_run', actionType);
        },
        /**
         * 批量删除创意
         */
        batchDelIdea: function(ideaIds, opttypeid, actionType) {
            AoPkgMonitor.batchModIdea(ideaIds, opttypeid,
                'nikon_multiapply_idea_del', actionType);
        },
        /**
         * 执行批量修改出价操作发送的监控
         * @param {Object} modifiedInfo 批量修改出价的信息
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         */
        batchModBid: function(modifiedInfo, opttypeid) {
            // 对于没有出价信息，使用单元出价
            var bids = T.object.clone(modifiedInfo.bids);
            var unitbids = modifiedInfo.unitbids;
            var temp;
            for (var i = 0, len = bids.length; i < len; i ++) {
                temp = +bids[i];
                if (!temp) {
                    bids[i] = unitbids[i];
                }
            }

            var logParam = {
                applycount: modifiedInfo.rowIdxs.length,
                opttypeid: opttypeid,
                selectedids: modifiedInfo.winfoids.join(),
                selectedoldvalues: bids.join(),
                selectednewvalues: modifiedInfo.recmbids.join()
            };

            logger.extend(logParam).sendAs('nikon_multiapply_bid');
        },
        /**
         * 执行批量修改关键词匹配操作发送的监控
         * @param {Object} modifiedInfo 批量修改匹配的信息
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         */
        batchModWMatch: function(modifiedInfo, opttypeid) {
            var logParam = {
                applycount: modifiedInfo.rowIdxs.length,
                opttypeid: opttypeid,
                selectedids: modifiedInfo.winfoids.join(),
                selectedoldvalues: modifiedInfo.wmatchs.join(),
                selectednewvalues: modifiedInfo.recmwmatchs.join()
            };

            logger.extend(logParam).sendAs('nikon_multiapply_wmatch');
        },
        /**
         * 执行批量添加关键词操作发送的监控
         * @param {Object} modifiedInfo 批量添加词的信息
         * @param {Array} ds 表格数据源
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         * @param {number} firScreenWordNum 新提词的首屏词的数量
         * @param {number} moreWordNum 用户点击更多拓展的新提词的数量
         */
        batchAddWords: function(modifiedInfo, ds, opttypeid,
                                firScreenWordNum, moreWordNum, acceptIdea) {
            var logParam = {
                applycount: modifiedInfo.rowIdxs.length,
                opttypeid: opttypeid,
                selectedids: modifiedInfo.wordids.join(),
                selectedwords: modifiedInfo.showwords.join(),
                selectedplanids: modifiedInfo.planids.join(),
                selectedunitids: modifiedInfo.unitids.join(),
                selectedbids: modifiedInfo.bids.join(),
                selectedwmatchs: modifiedInfo.wmatchs.join()
            };

            if (firScreenWordNum) {
                logParam.firstwordnum = firScreenWordNum;
                logParam.morewordnum = moreWordNum;
            }
            
            if (typeof acceptIdea != 'undefined') {
            	logParam.acceptIdea = acceptIdea ? 1 : 0;
            }

            // 初始化用于监控用的推荐信息, added by Huiyao 2013.1.15
            var recmfieldArr = [
                'recmplanname', 'recmunitname', 'recmunitid',
                'recmbid', 'recmplanid', 'recmwmatch'
            ];
            
            if (ds[0] && ds[0].recmideaid) {
            	recmfieldArr.push('recmideaid');
            }
            
            // 保存推荐信息对象
            var recmInfo = {};
            var fieldName;
            var getFieldData = nirvana.tableUtil.getFieldData;
            for (var i = recmfieldArr.length; i --;) {
                fieldName = recmfieldArr[i];
                // 注意，由于新提词详情推荐信息可以被修改，原始的推荐信息存储在属性名为：
                // '_'+fieldName里
                recmInfo[fieldName + 's'] =
                    getFieldData(modifiedInfo.rowIdxs, '_' + fieldName, ds).join();
            }

            // 存储推荐信息, add by Huiyao 2013.1.15
            T.extend(logParam, recmInfo);

            logger.extend(logParam).sendAs('nikon_multiapply_addword');
        },
        /**
         * 执行批量删除单元操作发送的监控
         * @param {Object} modifiedInfo 批量删除的单元的信息
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         */
        batchDelUnits: function(modinfiedInfo, opttypeid) {
            var logParam = {
                applycount: modinfiedInfo.rowIdxs.length,
                opttypeid: opttypeid,
                selectedids: modinfiedInfo.unitids.join()
            };

            logger.extend(logParam).sendAs('nikon_multiapply_unit_del');
        },
        /**
         * 执行批量启用计划/单元/关键词操作发送的监控
         * @param {Object} modifiedInfo 批量启用的信息
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         */
        batchRun: function(modinfiedInfo, opttypeid) {
            var logParam = {
                applycount: modinfiedInfo.rowIdxs.length,
                opttypeid: opttypeid,
                level: modinfiedInfo.level,
                selectedids: modinfiedInfo.idArr.join()
            };

            logger.extend(logParam).sendAs('nikon_multiapply_run');
        },
        /**
         * 点击推荐词的更多按钮发送的监控
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         * @param {number} nthLoad 第nth次点击更多按钮
         * @param {Array} recmdwordArr 显示的推荐词数据
         */
        clickRecmwordMoreBtn: function(opttypeid, nthLoad, recmdwordArr) {
            var wordids = nirvana.tableUtil.getFieldData(
                null, 'wordid', recmdwordArr);
            var logParam = {
                opttypeid: opttypeid,
                wordids: wordids.join(),
                clickcount: String(nthLoad)
            };

            logger.extend(logParam).sendAs('nikon_addword_more_button');
        },
        /**
         * 提词包搜索关键词发送的监控
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         */
        searchRecmwords: function(opttypeid) {
            var logParam = { opttypeid: opttypeid };
            logger.extend(logParam).sendAs('nikon_optitem_viewdetail');
        },
        /**
         * 查看升级的提词包推荐词Tab详情发送的监控
         * @param {Object} optItem 优化建议项数据
         */
        viewRecmwordDetail: function(optItem) {
            var logParam = { opttypeid: optItem.opttypeid };
            logParam.isnew = optItem.data.isnew;
            logParam.optmd5 = optItem.optmd5;

            // 发送监控
            logger.extend(logParam).sendAs('nikon_optitem_viewdetail');
        },
        /**
         * 推词详情进行本地批量修改出价操作发送的监控
         * @param {Object} modifiedInfo 批量修改出价的信息
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         */
        localBatchModBid: function(modifiedInfo, opttypeid) {
            var logParam = {
                applycount: modifiedInfo.rowIdxs.length,
                opttypeid: opttypeid,
                selectednames: modifiedInfo.showwords.join(),
                selectedoldvalues: modifiedInfo.bids.join(),
                selectednewvalues: modifiedInfo.newbids.join()
            };

            logger.extend(logParam).sendAs('nikon_multimod_bid');
        },
        /**
         * 推词详情进行本地批量修改关键词匹配操作发送的监控
         * @param {Object} modifiedInfo 批量修改匹配的信息
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         */
        localBatchModWMatch: function(modifiedInfo, opttypeid) {
            var logParam = {
                applycount: modifiedInfo.rowIdxs.length,
                opttypeid: opttypeid,
                selectednames: modifiedInfo.showwords.join(),
                selectedoldvalues: modifiedInfo.wmatchs.join(),
                selectednewvalue: modifiedInfo.newwmatch
            };

            logger.extend(logParam).sendAs('nikon_multimod_wmatch');
        },
        /**
         * 推词详情进行本地批量修改出价操作发送的监控
         * @param {Object} modifiedInfo 批量修改出价的信息
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         */
        localBatchModPlanUnit: function(modifiedInfo, opttypeid) {
            var logParam = {
                applycount: modifiedInfo.rowIdxs.length,
                opttypeid: opttypeid,
                selectednames: modifiedInfo.showwords.join(),
                selectedplannames: modifiedInfo.oldplannames.join(),
                selectedunitnames: modifiedInfo.oldunitnames.join(),
                newplanname: modifiedInfo.newplanname,
                newunitname: modifiedInfo.newunitname
            };

            logger.extend(logParam).sendAs('nikon_multimod_planunit');
        },
        /**
         * 搬家方案-关键词-批量修改url操作发送的监控
         * @param {Object} modifiedInfo 批量修改出价的信息
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         */
        modifykeywordurlbatch: function(modifiedInfo, opttypeid) {
            var logParam = {
                applycount: modifiedInfo.rowIdxs.length,
                opttypeid: opttypeid,
                selectedids: modifiedInfo.selectedids.join(","),
                modify_type: modifiedInfo.modify_type,
                selectedoldvalues: modifiedInfo.selectedoldvalues.join(),
                selectednewvalues: modifiedInfo.selectednewvalues
            };
            logger.extend(logParam).sendAs('nikon_multimod_word_url');
        },
        /**
         * 搬家方案-关键词-单行修改url操作发送的监控
         * @param {Object} modifiedInfo 批量修改出价的信息
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         */
        modifykeywordurl: function(modifiedInfo, opttypeid) {
            var logParam = {
                opttypeid: opttypeid,
                planid : modifiedInfo.planid,
                unitid : modifiedInfo.unitid,
                winfoid : modifiedInfo.winfoid,
                modify_type : modifiedInfo.modify_type,
                oldvalue : modifiedInfo.oldvalue,
                newvalue : modifiedInfo.newvalue,
                Sugurlid : modifiedInfo.Sugurlid
            };
            logger.extend(logParam).sendAs('nikon_mod_word_url');
        },
        /**
         * 搬家方案-创意-批量修改url操作发送的监控
         * @param {Object} modifiedInfo 批量修改出价的信息
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         */
        modifyideaurlbatch: function(modifiedInfo, opttypeid) {
            var logParam = {
                opttypeid: opttypeid,
                ideaids : modifiedInfo.ideaids.join(","),
                modify_type : modifiedInfo.modify_type,
                old_url :  modifiedInfo.old_url,
                old_showurl : modifiedInfo.old_showurl,
                old_miurl : modifiedInfo.old_miurl,
                old_mshowurl : modifiedInfo.old_mshowurl,
                new_url :  modifiedInfo.new_url,
                new_showurl : modifiedInfo.new_showurl,
                new_miurl : modifiedInfo.new_miurl,
                new_mshowurl : modifiedInfo.new_mshowurl
            };
            logger.extend(logParam).sendAs('nikon_multimod_idea_url');
        },
        /**
         * 搬家方案-创意-单行修改url操作发送的监控
         * @param {Object} modifiedInfo 批量修改出价的信息
         */
        modifyideaurl: function(modifiedInfo) {
            logger.extend(modifiedInfo).sendAs('nikon_mod_idea_url');
        },

        //////////////////// 行业旺季包新增的监控
        /**
         * 修改入口类型常量定义
         */
        MOD_ENTRANCE: {
            PREVIEW: 1, // 直接在预览项位置修改
            DETAIL: 2   // 直接在全部建议位置修改（详情位置）
        },
        /**
         * 切换行业旺季包旺季行业Tab发送的监控
         * @param {number} tradeId 要切换的行业tradeId, -1表示全部旺季行业
         */
        switchPeakSeasonTradeTab: function (tradeId) {
            var logParam = {
                tradeid: tradeId
            };

            logger.extend(logParam).sendAs('nikon_click_peektradetab');
        },
        /**
         * 点击查看预览优化项发送的监控
         * @param {string} opttypeid 优化建议的类型ID
         */
        viewPreviewOptItem: function (opttypeid) {
            var logParam = {
                opttypeid: opttypeid
            };

            logger.extend(logParam).sendAs('nikon_view_previewoptitem');
        },
        /**
         * 修改账户/计划的预算
         * @param {Object} modifiedInfo 修改信息
         * @param {number} opttypeid 优化预算的优化项类型id
         * @param {?Object} extra 附加发送的监控数据对象
         */
        modBudget: function (modifiedInfo, opttypeid, extra) {
            var logParam = {
                opttypeid: opttypeid,
                oldvalue: modifiedInfo.oldValue,
                newvalue: modifiedInfo.newValue,
                oldtype: modifiedInfo.oldType,
                newtype: modifiedInfo.newType,
                suggestbudget: modifiedInfo.suggestbudget,
                suggestweekbudget: modifiedInfo.suggestweekbudget
            };

            var planId = modifiedInfo.planId;
            if (planId) {
                !T.lang.isArray(planId) && (planId = [planId]);
                logParam.planid = planId;
            }

            T.extend(logParam, extra || {});

            logger.extend(logParam).sendAs('nikon_modify_budget');
        },
        /**
         * 行内修改计划预算成功发送的监控
         * @param {Object} item 修改的计划对象
         * @param {number} newWbudget 修改后计划的预算
         * @param {number} opttypeid 优化计划预算的优化项类型id
         */
        inlineModPlanBudget: function (item, newWbudget, opttypeid) {
            AoPkgMonitor.modBudget({
                planId: item.planid,
                oldValue: item.wbudget,
                newValue: newWbudget,
                oldType: item.bgttype,
                newType: item.bgttype,
                suggestbudget: item.suggestbudget
            }, opttypeid, { entrancetype: AoPkgMonitor.MOD_ENTRANCE.DETAIL });
        },
        /**
         * 批量修改计划预算成功（包括部分成功）发送的监控
         *
         * @param {Object} modifiedInfo 批量启用的信息
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         */
        batchModPlanBudget: function (modifiedInfo, opttypeid) {
            var logParam = {
                applycount: modifiedInfo.rowIdxs.length,
                opttypeid: opttypeid,
                selectedids: modifiedInfo.planIds.join(),
                selectedoldvalues: modifiedInfo.wbudgets.join(),
                selectednewvalues: modifiedInfo.newWbudgets.join()
            };

            logger.extend(logParam).sendAs('nikon_multimod_planbudget');
        },
        /**
         * 直接通过预览的优化项进行关键词出价的修改，修改成功发送的监控
         * @param {Object} item 修改的关键词对象
         * @param {number} newBid 修改后关键词的出价
         * @param {number} opttypeid 优化出价的优化项类型id
         */
        modWBidByPreview: function(item, newBid, opttypeid) {
            AoPkgMonitor.modWBid(item, newBid, opttypeid, {
                entrancetype: AoPkgMonitor.MOD_ENTRANCE.PREVIEW
            });
        },
        /**
         * 直接通过预览的优化项进行关键词匹配的修改，修改成功发送的监控
         * @param {Object} item 修改的关键词对象
         * @param {number} newWmatch 修改后关键词的匹配类型
         * @param {number} opttypeid 优化出价的优化项类型id
         */
        modWMatchByPreview: function(item, newWmatch, opttypeid) {
            AoPkgMonitor.modWMatch(item, newWmatch, opttypeid, {
                entrancetype: AoPkgMonitor.MOD_ENTRANCE.PREVIEW
            });
        },
        /**
         * 行业旺季包优化项摘要添词成功回调
         * @param {object} addedWord 要添加的关键词
         * @param {number} opttypeid 进行该项操作所属的优化项类型id
         */
        addWordByPreview: function(addedWord, opttypeid) {
            var logParam = {
                opttypeid: opttypeid,
                wordid: addedWord.wordid,
                showword: addedWord.showword,
                recmplanid: addedWord.recmplanid,
                recmunitid: addedWord.recmunitid,
                recmbid: addedWord.recmbid,
                recmwmatch: addedWord.recmwmatch,
                planid: addedWord.planid,
                unitid: addedWord.unitid,
                bid: addedWord.bid,
                wmatch: addedWord.wmatch,
                entrancetype: AoPkgMonitor.MOD_ENTRANCE.PREVIEW
            };

            logger.extend(logParam).sendAs('nikon_modify_addword');
        }
	};
	
	return AoPkgMonitor;
}($$, baidu, nirvana);