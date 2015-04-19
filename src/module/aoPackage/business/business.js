/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/business/business.js 
 * desc: 扩大商机包，扩展自aoPackage.js
 * author: Leo Wang(wangkemiao@baidu.com)
 * date: $Date: 2012/09/11 $
 */

nirvana.BusinessPackage = new nirvana.myPackage({

	renderAppDialog : function(){
		var me = this,
			dialog = me.getDialog();

		// 先去判断是否是效果检验状态
		fbs.nikon.bizEffcheck({
			onSuccess : function(res){
				var data = res.data;
				
				if(data && data.biztype == 1){
					// 是效果检验
					me.isBizEffect = true;
				}
				else{
					// 正常状态
					me.isBizEffect = false;
				}
					
				me.isForce = false;

				// 渲染包的全部信息
				me.renderAppAllInfo();
				// 事件绑定
				me._bindHandlers();
				
			},
			onFail : function(res){
				// 认为不是
				ajaxFailDialog();
				// 渲染包的全部信息
				me.renderAppAllInfo();
				// 事件绑定
				me._bindHandlers();
				
			}
		});
	},

	onafterRenderAppAllInfo : function(){
		var me = this,
			dialog = me.getDialog();

		if(me.isBizEffect){
			dialog.getFoot().innerHTML = '';
		}
	},
	
	extendDataCtrl : function(){
		var me = this,
			appId = me.getId(),
			dataCtrl = me.dataCtrl;
		
		me.dataCtrl.getRequestParam = function(){
			var ctrl = this,
				pkgid = ctrl.pkgid,
				param = {
					pkgid : pkgid
				};

			if(me.isBizEffect){
				param.condition = {
					biztype : 1
				};
			}
			else{
				param.condition = {
					biztype : 0
				};
			}
			return param;
		};

		me.dataCtrl.renderFlash = function(){
			var ctrl = this,
				mainDom = ctrl.mainDom,
				flashName = me.isBizEffect ? ctrl.options.dataFlash2 :ctrl.options.dataFlash,
				flashId = ctrl.appId + 'AoPkgFlash',
				width = ctrl.options.width || 940,
				height = ctrl.options.height || (me.isBizEffect ? 205 : 150);
			
			if(mainDom){			
				baidu.swf.create({
					id: flashId,
					url: './asset/swf/' + flashName,
					width: width,
					height: height,
					scale : 'showall',
					wmode : 'opaque',
					allowscriptaccess : 'always'
					/*
					vars : {
						'loadedCallBack' : 'nirvana.aoPkgControl.packageData.get(nirvana.aoPkgConfig.KEYMAP["' + me.pkgid + '"]).dataCtrl.loadedCallback'
					}
					*/
				}, mainDom);
			}
		};

		me.dataCtrl.processFlashData = function(flashData){
			var ctrl = this,
				descData = ctrl.descData,
				newData = {};

			var d, arr, count = 0,
				zarr, tarr, zhuangxianlist, l = -1, r,
				tv, i, j, k, otime, otimeself;

			if(me.isBizEffect){
				newData.name = '点击量';
				newData.data = [];
				d = ctrl.descData.bizdate;
				for(i = 0; i < flashData.length; i++){
					newData.data.push({
						date : flashData[i].date,
						value : flashData[i].clks
					});
					if(d == flashData[i].date){
						l = i;
					}
				}
				if(d){
				    newData.youhua = l;
				}
			}
			else{
				ctrl.offtime = {};
				ctrl.hasZhuangxian = false;
				
				for(i = 0; i < flashData.length; i++){
					d = flashData[i].date;
					newData[d] = {};
					newData[d].st = 0;
					newData[d].et = 24;
					newData[d].dianji = [];
					newData[d].zhuangxian = [];
					otime = baidu.date.parse('1983-07-21 ' + descData.modelofftime + ':00');
					otimeself = baidu.date.parse('1983-07-21 ' + (flashData[i].offlinetime ? flashData[i].offlinetime : '23:59')  + ':00');
							
					newData[d].xiaxian = (otimeself < otime ? descData.modelofftime : '');
					
					// 记录自己这天的下线时间
					ctrl.offtime[d] = flashData[i].offlinetime;
					
					zhuangxianlist = [];
					count = 0;
					
					// 处理撞线，区间是左闭右开
					if(flashData[i].offlinelist){
						zarr = baidu.json.parse(flashData[i].offlinelist);
						
						if(zarr && zarr.length > 0){
							ctrl.hasZhuangxian = true;
							for(j = 0; j < zarr.length; j++){
								count = count + zarr[j][1] - zarr[j][0];
							}
							for(j = 0; j < zarr.length; j++){
								tarr = zarr[j];
								l = tarr[0];
								r = tarr[1];
								
								if(flashData[i].clklostday > 0){
									newData[d].zhuangxian.push({
										tStart : (l < 10 ? '0' : '') + l +":00",
										tEnd : (r < 10 ? '0' : '') + r +":00",
										value : Math.round(+flashData[i].clklostday / count),
										total : Math.round(+flashData[i].clklostday)
									});
									for(k = l + 1; k < r; k++){
										zhuangxianlist.push(k);
									}
								}
							}
						}
					}
					if(flashData[i].clksbyhour){
						arr = flashData[i].clksbyhour.split(',');
						if(arr && arr.length > 0){
							newData[d].dianji[0] = {
								t: "00:00",
								value : 0
							};
							for(j = 1; j <= arr.length; j++){
								if(baidu.array.indexOf(zhuangxianlist, j) == -1){
									newData[d].dianji.push({
										t: (j < 10 ? '0' : '') + j +":00",
										value : +arr[j - 1]
									});
								}
							}
						}
					}
				}
			}

			return newData;
		};

		me.dataCtrl.renderDesc = function(){
			var ctrl = this,
				descData = ctrl.descData,
				origFlashData = ctrl.origFlashData,
				flashData = ctrl.flashData,
				descDom = ctrl.descDom,
				descTpl = me.isBizEffect ? ctrl.options.dataDesc2 : ctrl.options.dataDesc,
				html, shtml;

			if(!me.isBizEffect){
				if(ctrl.hasZhuangxian){
					if(descData.totalclklost > 0){
						shtml = '因预算限制，近7天损失客户访问量<span class="redmark_margined">' + descData.totalclklost + '</span>个';
					}
					else{
						shtml = '建议您进一步开拓客源，提升客户访问量';
					}
					
					// 同行下线
					var earlymin = 0, min, hour, otime, otimeself;
					if(!me.isBizEffect && descData.modelofftime){
						otime = baidu.date.parse('1983-07-21 ' + descData.modelofftime + ':00');
						otimeself = baidu.date.parse('1983-07-21 ' + (ctrl.offtime[descData.defaultdate] ? ctrl.offtime[descData.defaultdate] : '23')  + ':00');
						earlymin = (otime.getTime() - otimeself.getTime()) / 1000 / 60;  //分钟数
						if(earlymin > 0){
							hour = Math.floor(earlymin / 60);
							min = earlymin % 60;
							shtml += '<span id="AoPkgBusiModelOff">，账户当日下线时间早于同行' + (hour > 0 ? (hour + '小时') : '') + (min > 0 ? (min + '分钟') : '') + '</span>';
						}
						else{
							shtml += '<span id="AoPkgBusiModelOff"></span>';
						}
					}
					
				}
				else if(+descData.totalclk > 0){
					shtml = '账户最近7天总点击量' + descData.totalclk + '个，建议您进一步开拓客源，提升客户访问量。';
				}
				else{
					shtml = '建议您进一步开拓客源，提升客户访问量';
				}
				html = lib.tpl.parseTpl({
					effdatadesc : shtml
				}, descTpl);


				descDom && (descDom.innerHTML = html);


				var list = [],
					date, week = '日一二三四五六',
					d1 = new Date(),
					d2 = new Date(),
					d1str, d2str,
					str,
					index = 0;

				d1.setDate(d1.getDate() - 1);
				d2.setDate(d2.getDate() - 2);
				d1str = baidu.date.format(d1, 'yyyy-MM-dd');
				d2str = baidu.date.format(d2, 'yyyy-MM-dd');

				for(var i = origFlashData.length - 1, j = 0; i >= 0 ; i--, j++){
					date = baidu.date.parse(origFlashData[i].date + ' 01:00:00');

					if(origFlashData[i].date === d1str){
						str = '昨天';
					}
					else if(origFlashData[i].date === d2str){
						str = '前天';
					}
					else{
						str = '星期' + week.charAt(date.getDay());
					}
					list.push({
						value : origFlashData[i].date,
						text : origFlashData[i].date + '<span class="aopkg_select_lspace">' + str + '</span>'
					});
					if(origFlashData[i].date == descData.defaultdate){
						index = j;
					}
				}
				var s = ui.util.create('Select', {
					id : 'AoPkgBusDataAreaSelect',
					datasource : list,
					width : 150
				});
				s.appendTo(baidu.g('AoPkgBusFlashCtrl'));
				s.selectByIndex(index);
				
				s.onselect = function(value){
					ctrl.setFlashData(flashData[value]);

					//ctrl.setFlashData();
					var earlymin = 0, min, hour, otime, otimeself, html;
					if(descData.modelofftime){
						otime = baidu.date.parse('1983-07-21 ' + descData.modelofftime + ':00');
						otimeself = baidu.date.parse('1983-07-21 ' + (ctrl.offtime[value] ? ctrl.offtime[value] : '23:59')  + ':00');
						earlymin = (otime.getTime() - otimeself.getTime()) / 1000 / 60;  //分钟数
						if(earlymin > 0){
							hour = Math.floor(earlymin / 60);
							min = earlymin % 60;
							html = '，账户当日下线时间早于同行' + (hour > 0 ? (hour + '小时') : '') + (min > 0 ? (min + '分钟') : '');
						}
						else{
							html = '';
						}
						baidu.g('AoPkgBusiModelOff')
								&& (baidu.g('AoPkgBusiModelOff').innerHTML = html);
					}
				}
				baidu.g('AoPkgBusiRightDesc') &&
					(baidu.g('AoPkgBusiRightDesc').innerHTML = '<span class="clickline"></span> 点击量'
															 + '<span class="lostline"><span></span><span></span></span> 账户下线损失点击');

			}

			if(me.isBizEffect && !me.isForce){
				var ocontainer = baidu.g(appId + 'AoPkgManagerMain');
				ocontainer &&
					(ocontainer.innerHTML = '<div class="aopkg_bizeff_ctrl"><div class="aopkg_bizeff_ctrlinfo">距离下次获取建议还有<em>'
										  + ctrl.descData.day  + '</em>天</div><div class="aopkg_bizeff_ctrlbut"><div ui="id:AoPkgSwitchBtn;type:Button;">立即获取优化建议</div></div></div>');
				
				//if(descData.bizdate !== baidu.date.format(new Date(), 'yyyy-MM-dd')){
					ui.util.init(ocontainer);
					ui.util.get('AoPkgSwitchBtn').onclick = function(){
						me.isBizEffect = false;
						me.isForce = true;
						me.renderAppAllInfo();
						// 事件绑定
						me._bindHandlers();
					};
				//}
			}
		};

		me.dataCtrl.loadedCallback = function(){
			var me = this,
				flashData = me.flashData,
				descData = me.descData;
			
			if(me.isBizEffect){
				me.setFlashData(flashData);
			}
			else{
				me.setFlashData(flashData[descData.defaultdate]);
			}
		};

		me.dataCtrl.bindHandlers = function(){
		};
	},

	renderManager : function(){
		var me = this,
			appId = me.getId(),
			ctrl = me.controller;

		if(me.isBizEffect && !me.isForce){
			baidu.hide(appId + 'AoPkgManagerTitle');
			return;
		}
		else{
			if(ui.util.get('AoPkgSwitchBtn')){
				ui.util.dispose('AoPkgSwitchBtn');
			}
			baidu.show(appId + 'AoPkgManagerTitle');

			// 渲染标题区
			var titleTar = baidu.g(appId + 'AoPkgManagerTitle');
			titleTar.innerHTML = me.managerArea.managerName;

			// 渲染详细内容
			// 默认将会展现优化建议信息，如果不需要，请在子类中修改renderManager方法
			var newoptions = baidu.object.clone(me.optimizer);
			baidu.extend(newoptions, {
				modifiedItem : me.data.get('modifiedItem'),
				level : me.level
			});
			me.optimizerCtrl = new nirvana.aoPkgControl.AoPkgGroupOptCtrl(me.pkgid, newoptions);
			me.extendOptimizerCtrl && me.extendOptimizerCtrl(me.pkgid, newoptions);
			me.optimizerCtrl.show(me.isForce);
		}
	},

	extendOptimizerCtrl : function(pkgid, newoptions){
		var me = this;
        // Added by Wu Huiyao (wuhuiyao@baidu.com)
		me.optimizerCtrl.viewDetail = function(optid, opttypeid, cache, data) {
//			var ctrl = this;
			
			// 发送监控 该方法不用重写时候再调用了 2013.1.6 by Huiyao
//			nirvana.AoPkgMonitor.viewOptimizeDetail(optid, opttypeid, ctrl.hasRank, data, cache);
			 
			// 查看详情触发的动作的执行							  
//			switch (opttypeid) {
//				case 201: // 扩大商机账户预算
//				case 202: // 扩大商机计划预算
//				    aopkg.BudgetOptimizer.showNikonBudget(ctrl, optid, opttypeid, cache.optmd5, data);
//					break;
//                case 206: // 新增的时段建议优化项
//                    nirvana.aopkg.scheduleDetail.show(
//                        ctrl,
//                        {
//                            optid: optid,
//                            opttypeid: opttypeid,
//                            optdata: data,
//                            optmd5: cache.optmd5
//                        },
//                        true
//                    );
//                    // 移除该优化项有更新的标识
//                    ctrl.removeUpdatedInfo(optid);
//                    break;
//                case 205: // 新提词采用新版的提词详情代码 by Huiyao 2013.3.21
//                    this.switchToDetail2(optid, opttypeid, cache, data);
//                    break;
//				default:
//					// 通过滑动方式查看详情
//					ctrl.switchToDetail(optid);
//			}
            this.switchToDetail2(optid, opttypeid, cache, data);
		};
		// Deleted by Wuhuiyao
		/*me.optimizerCtrl.clickOptButton = function(optid){
			var ctrl = this,
				li = baidu.g('AoPkgAbsItem' + optid),
				logParam,
				tarr,
				opttypeid, subindex,
				cache, cachedata;

			if(!optid){
				return;
			}
			// opttypeid = optid.replace(/\_\w+/g, '')

			tarr = optid.split('_');
			opttypeid = +tarr[0];
			cache = ctrl.getCache(opttypeid);
			if(tarr.length > 1){
				subindex = +tarr[1];
				cachedata = cache.compData[subindex];
			}
			else{
				cachedata = cache.data;
			}

			switch(+opttypeid){
				case 201: // 扩大商机账户预算
				case 202: // 扩大商机计划预算
					if (optid.indexOf('_') > -1) {
						var type = 'planinfo';
					} else {
						var type = 'useracct';
					}
					
					// 打开预算模块
					manage.budget.logParam = {
						'entrancetype': 'aopkg'
					};
					
					// 监控
					logParam = {
						opttypeid : opttypeid
					};
					if(ctrl.hasRank){
						var qlist = baidu.q('aopkg_rank', li, 'span');
						if(qlist.length > 0){
							logParam.rank = qlist[0].innerHTML;
						}
					}
					if(cachedata.planid){
						logParam.planid = cachedata.planid;
					}
					logParam.isnew = (baidu.q('aopkg_updated', li, 'span').length > 0 ? 1 : 0);
					logParam.optmd5 = cache.optmd5;
					if(+opttypeid == 202){
						logParam.suboptmd5 = cachedata.optmd5;
					}

					nirvana.aoPkgControl.logCenter.extend(logParam).sendAs('nikon_optitem_viewdetail');
					
					manage.budget.openSubAction({
						type: type,
						bgttype: cachedata.bgttype,
						planid: [cachedata.planid],
						entrancetype: 'aopkg',
						opttypeid: opttypeid,
						optmd5: cache.optmd5,
						suboptmd5 : cachedata.optmd5,
						decrtype: ctrl.decrtype || '',
						custom: {
							noDiff : true,
							noOffline : true,
							noViewBtn : true,
							noRadio : true
						},
						onok: function(data) {
							// wbudgte为''时代表不限定预算，所以需要先判断weekbudget
							var newvalue = data.weekbudget || data.wbudget || 0;
							
							if (opttypeid == 201) {
								// 这个请求告诉后端修改了账户预算，不需要回调响应
								fbs.nikon.ModUserBudget({
									bgttype: data.bgttype,
									suggestbudget: cachedata.suggestbudget,
									oldvalue: data.oldvalue,
									newvalue: data.newvalue || 0 // 不限定预算传0
								});
							}
							
							// 通知优化包刷新摘要
							modifiedItem = ctrl.data.get('modifiedItem') || [];
							if(+opttypeid == 202){
								modifiedItem.push(opttypeid + '_' + cachedata.planid);
							}
							else{
								modifiedItem.push(opttypeid.toString());
							}
							ctrl.data.set('modifiedItem', modifiedItem);
							ctrl.refreshOptItem(optid);
						}
					}, {
						maskLevel: nirvana.aoPkgWidgetCommon.getMaskLevel()
					});
					
					ctrl.removeUpdatedInfo(optid);
					break;
				default:
					// 监控
					logParam = {
						'opttypeid' : optid.replace(/\D\w+/g, '')
					};
					if(ctrl.hasRank){
						var qlist = baidu.q('aopkg_rank', li, 'span'),
							rank;
						if(qlist.length > 0){
							rank = qlist[0].innerHTML;
						}
						logParam.rank = rank;
					}
					logParam.isnew = (baidu.q('aopkg_updated', li, 'span').length > 0 ? 1 : 0);
					logParam.optmd5 = cache.optmd5;
					nirvana.aoPkgControl.logCenter.extend(logParam)
												  .sendAs('nikon_optitem_viewdetail');

					ctrl.switchToDetail(optid);
			}
		};*/
	}
});