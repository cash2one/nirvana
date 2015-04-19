/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/industry/IndustryPkgGroupOptCtrl.js
 * desc: 行业领先包定义，扩展自AoPkgGroupOptCtrl.js
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/10/17 $
 */
nirvana.aoPkgControl.IndustryPkgGroupOptCtrl = nirvana.aoUtil.extendClass(nirvana.aoPkgControl.AoPkgGroupOptCtrl, {
	/**
	 * 渲染优化包建议区域
	 * @override 
	 */
	renderContainer : function(){
		var me = this,
		    hasGroup = me.options.hasGroup,
			appId = me.appId,
			mainDom = me.mainDom,
			categoryClassArr = ["offline_time", "word_present", "left_present", "effective_qstar3"];

		if(hasGroup && mainDom){
			var groupInfo = me.options.groupInfo,
			    tpl = er.template.get('industryPkgOptAbstract'),
                html = "";
            // 初始化优化建议的HTML内容
			for(var i = 1, len = groupInfo.length; i <= len; i++){
				html += fc.tpl.parse({
									groupTitleId : appId + 'AoPkgGroupTitle' + i,
									groupName : groupInfo[i - 1].groupName,
									optGroupId : appId + 'AoPkgGroupList' + i,
									groupClass : (i == len ? ' nomargin' : ''),
									category_class : categoryClassArr[i - 1]
								}, tpl);
			}
			// 渲染优化建议内容框架
			mainDom.innerHTML = html;
		}
		
		hasGroup && (me.optItemRenderTargetId = appId + 'AoPkgGroupList');
	},
	/**
	 * 如果有分组，那么预先整理分组信息映射，这是为了效率
	 * @override
	 */
	processGroupMapping : function(){
		var me = this;
		
		// 调用父类的方法
		nirvana.aoPkgControl.AoPkgGroupOptCtrl.prototype.processGroupMapping.call(me);
		
		// 用于缓存group包含的Opttypeids，用于后面请求处理时，判断哪个分组请求已经结束
		var group2optMapping = [];
		me.group2optMapping = group2optMapping;
		
		var groupInfo = me.options.groupInfo,
		    optTypes,
		    opt2groupMap = me.opt2groupMapping;
		    
		for(var i = 0, len = groupInfo.length; i < len; i++){
			optTypes = groupInfo[i].OPTTYPE;
			group2optMapping[opt2groupMap[optTypes[0]]] = baidu.object.clone(optTypes);
		}
	},
	/**
	 * 每次渲染完一条优化建议项触发的事件处理器
	 * @override 
	 */
	onafterShowOverviewItem: function(opttypeid, options) {
		var me = this,
			group = me.opt2groupMapping[opttypeid],
			noShowGroupOpts = me.group2optMapping[group],
			optGroupElem = baidu.g(me.optItemRenderTargetId + group),
			titleElem = baidu.g(me.appId + 'AoPkgGroupTitle' + group);

		if (!titleElem || !optGroupElem) {
			return;
		}
		
		// 移除已经完成show的优化项，不管该优化项是否会在界面显示(hasProblem=0就不会显示)
		baidu.array.remove(noShowGroupOpts, opttypeid);
		
		var optListElems = baidu.q('aopkg_absmainitem', optGroupElem, 'li');
		 // optGroupElem = baidu.g(targetId).parentNode.parentNode;
		
		// 该分组不存在未show的优化项，即完成该分组的优化项请求，且该分组没有具体的优化项被显示
		if ((0 == noShowGroupOpts.length) && (optListElems.length == 0)) {
		    // 设置分组没有优化建议显示的信息
		    optGroupElem.innerHTML = er.template.get('aoPkgGroupNoOpt' + group);
		}
		
		// 质量度优化项,特殊处理
		if (608 == opttypeid) {
			var inputElemArr = baidu.q('aopkg_checkbox', optGroupElem, 'input');
		    if (inputElemArr.length > 0) {
		    	// 将优化项的优化建议的复选框变成不选中并隐藏该复选框
		    	var inputElem = inputElemArr[inputElemArr.length - 1];
		    	
		    	inputElem.checked = false;
		    	baidu.hide(inputElem);
		    }
		}
	},
	/**
	 * 显示没有优化建议信息
	 * @override 
	 */
	showNoOptimizer : function(){
		var me = this,
			appId = me.appId;

		me.clear();
		//mainDom && (mainDom.innerHTML = me.options.emptyMessage);
		ui.util.get(appId + 'AoPkgApplyAllBtn')
			&& ui.util.get(appId + 'AoPkgApplyAllBtn').disable(true);
	},
	/**
	 * 查看优化建议的查看详情 
	 * @param {String} optid 优化建议项ID字符串，前端做过处理，可能被加上后缀，用于标识子优化建议项，比如303.1_1 
	 * @param {Number} opttypeid 后端返回的真实的优化建议ID
	 * @param {Object} cache 优化建议缓存的数据，包含更多的其它数据
	 * @param {Object} data 优化建议的数据，只是当前查看的优化项的数据
	 * @override 
	 */
	viewDetail: function(optid, opttypeid, cache, data) {
//		// 查看详情触发的动作的执行
//		switch (opttypeid) {
//			case 601: // 账户预算
//			case 602: // 计划预算
//			    aopkg.BudgetOptimizer.showNikonBudget(this, optid, opttypeid, cache.optmd5, data);
//				// 移除该优化项有更新的标识
//				this.removeUpdatedInfo(optid);
//				break;
//			case 603: // 时段建议
//                nirvana.aopkg.scheduleDetail.show(
//                    this,
//                    {
//                        optid: optid,
//                        opttypeid: opttypeid,
//                        optdata: data,
//                        optmd5: cache.optmd5
//                    },
//                    true
//                );
//				// 移除该优化项有更新的标识
//				this.removeUpdatedInfo(optid);
//				break;
//            case 604: // 行业优质词，走提词新代码流程
//                this.switchToDetail2(optid, opttypeid, cache, data);
//                break;
//			default:
//				// 通过滑动方式查看详情
//				this.switchToDetail(optid);
//		}
        this.switchToDetail2(optid, opttypeid, cache, data);
	},
	/**
	 * 根据给定的优化建议类型获取优化建议摘要的模板
	 * @param {Number} opttypeid
	 * @param {Number} isSub 是否是子优化建议
	 * @param {Object} data 优化建议摘要的数据
	 * @return {String} 模板
	 */
	getOptimizeItemAbstractTpl: function(opttypeid, isSub, data) {
		var tplName = isSub
						? ('aoPkgAbsItem' + opttypeid + 'Sub')
						: ('aoPkgAbsItem' + opttypeid);
						
		if (601 == opttypeid) {
			// 账户预算的优化建议，根据返回值不同，给出不同的话术
			tplName += data.tiptype;
		} else if (!isSub && (602 == opttypeid)) {
			// 计划预算:不存在损失点击量（or == 0）使用话术2，否则使用话术1
			tplName += (+data.clklost ? '1' : '2');
		}
		
		return er.template.get(tplName);
	},
	/**
	 * 根据给定的优化建议类型获取优化建议摘要的模板数据
	 */
	getOptimizeItemAbstractTplData: function(opttypeid, isSub, item) {
		var data =  item.data;
		
		if (isSub) {
			// 602:计划预算,603:推广时段，对数据进行二次加工
			if (602 == opttypeid || 603 == opttypeid) {
				//避免对原有数据修改
				var temp = baidu.object.clone(data);
				var planName = baidu.encodeHTML(data.planname);
				
                planName = getCutString(planName, 15, '...');
                temp.plantitle = baidu.encodeHTML(data.planname);
                temp.planname = planName;
                
				data = temp;
			}
		} else if (601 == opttypeid) { // 账户预算
			//避免对原有数据修改
			var temp = baidu.object.clone(data);
			temp.bgtinfo = (1 == +data.bgttype) ? '近期' : '上周';
			data = temp;
		}
		
		return data;
	},
	/**
	 * 获取某条优化建议摘要的HTML
	 * @override
	 */
	getDetailHtml : function(item, options){
		var me = this,
			opttypeid = +(item.opttypeid.toString().replace(/\D\w+/g, '')),
			options = options || {
				timeout : false
			},
			tpl, 
			data;
		
        // 初始化优化建议摘要项模板
		tpl = me.getOptimizeItemAbstractTpl(opttypeid, options.issub, item.data); 
		// 初始化模板数据
		data = me.getOptimizeItemAbstractTplData(opttypeid, options.issub, item);

		return fc.tpl.parse(data, tpl);
	}
});