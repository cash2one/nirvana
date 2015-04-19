/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/decrease/decrease.js 
 * desc: 突降急救包，扩展自aoPackage.js
 * author: Leo Wang(wangkemiao@baidu.com)
 * date: $Date: 2012/09/11 $
 */

nirvana.DecreasePackage = new nirvana.myPackage({
	
	extendDataCtrl : function(){
		var me = this,
			dataCtrl = me.dataCtrl;

		me.dataCtrl.processDescData = function(descData){
			var ctrl = this,
				newData = baidu.object.clone(descData);

			ctrl.decrtype = newData.decrtype;
			newData.decrtype = newData.decrtype ? nirvana.aoPkgConfig.TYPE[newData.decrtype.toUpperCase()] : '';

			// 期初、期末时间
			var bdate = baidu.date.parse(newData.begindate);
			var edate = baidu.date.parse(newData.enddate);
			var week = '日一二三四五六';

			newData.origbegindate = newData.begindate;
			newData.origenddate = newData.enddate;
			newData.begindate = baidu.date.format(bdate, 'MM月dd日') + '(星期' + week.charAt(bdate.getDay()) + ')';
			newData.enddate = baidu.date.format(edate, 'MM月dd日') + '(星期' + week.charAt(edate.getDay()) + ')';

			var decrP = round((descData.decr / descData.beginvalue * 100));
			newData.decrpercent = '<span class="aopkg_dataareadesc_decrvalue">' + decrP + '%</span>';

			newData.flashhandler = '<a id="AoPkgDecrQuickConfig" href="javascript:void 0;" class="normalSize">设置</a>';

			return newData;
		};

		me.dataCtrl.processFlashData = function(flashData){
			var ctrl = this,
				newData = {};

			newData.name = ctrl.descData.decrtype;
			newData.data = flashData;

			newData.emphasizeArray = [];
			for(var i = 0; i < flashData.length; i++){
				if(flashData[i].date == ctrl.descData.origbegindate || flashData[i].date == ctrl.descData.origenddate){
					newData.emphasizeArray.push(i);
				}
			}

			return newData;
		};

		me.dataCtrl.bindHandlers = function(){
			if(baidu.g('AoPkgDecrQuickConfig')){
				baidu.on('AoPkgDecrQuickConfig', 'click', function(){
					setPropForAoDecr(null, 'package');
					nirvana.aoPkgControl.logCenter.extendDefault({
						entrancetype : 0
					}).sendAs('nikon_decrconfig_enter');
				});
			}
		};
	},

	extendOptimizerCtrl : function(pkgid, newoptions){
		var me = this;

		baidu.extend(newoptions, {
			'listenFunctions' : ['applyAbsItems'],
			'onbeforeApplyAbsItems' : function(opttypeids){
				if(baidu.array.indexOf(opttypeids, '101') > -1){
					// 标记为已完成
					baidu.addClass('AoPkgAbsItem101', 'aopkg_modfinished');
					// 且使checkbox不可用，不选中
					var checkbox = baidu.g('AoPackageOptimizerCheckbox101');
					checkbox.checked = false;
					checkbox.disabled = true;
					window.open(CLASSICS_PAY_URL, 'paywindow');
					baidu.array.remove(opttypeids, '101');
				}
			}
		});
		me.optimizerCtrl = new nirvana.aoPkgControl.AoPkgLevelOptCtrl(me.pkgid, newoptions);

		me.optimizerCtrl.getApplyAllConfirmMsg = function(){
			var ctrl = this,
				input = baidu.g('AoPackageOptimizerCheckbox101'),
				extrastr = '';
			
			if(input && input.checked && nirvana.env.ULEVELID != 10104){
				extrastr = '，稍后将跳转至续费页面'
			}
			return ctrl.options.applyConfirmMessage + extrastr;
		};

		me.optimizerCtrl.getRequestOptions = function(type){
			var ctrl = this;
			return {
				decrtype : ctrl.decrtype
			}
		};

		me.optimizerCtrl.onafterGetAbsItemListSuccess = function(response){
			var ctrl = this,
				data = response.data,
				absresitems = data.absresitems,
				decrtype;

			if(absresitems.length > 0){
				decrtype = absresitems[0].data.decrtype;
			}

			ctrl.changeRequestParam({
				'condition' : {
					'decrtype' : decrtype
				}
			});
			
			ctrl.decrtype = decrtype;
			nirvana.aoPkgControl.logCenter.extendDefault({decrtype:decrtype});
		};

		me.optimizerCtrl.onafterShowOverviewItem = function(opttypeid, options){
			if(opttypeid == 101){
				if (nirvana.env.ULEVELID == 10104) {
					var btn = baidu.q('aopkg_link', 'AoPkgAbsItem' + opttypeid, 'a');
					baidu.object.each(btn, function(item, i){
						baidu.hide(item);
					});

					var checkbox = baidu.q('aopkg_checkbox', 'AoPkgAbsItem' + opttypeid, 'input');
					baidu.object.each(checkbox, function(item, i){
						item.checked = false;
						item.disabled = true;
						baidu.hide(item);
					});
				}
			}
		};

		me.optimizerCtrl.clickOptButton = function(optid){
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
				case 102: // 效果恢复账户预算
				case 103: // 效果恢复计划预算
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
					if(+opttypeid == 103){
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
							
							if (opttypeid == 102) {
								// 这个请求告诉后端修改了账户预算，不需要回调响应
								fbs.nikon.ModUserBudget({
									bgttype: data.bgttype,
									suggestbudget: cachedata.suggestbudget,
									oldvalue: data.oldvalue,
									newvalue: data.newvalue || 0 // 不限定预算传0
								});
							}
							
							// 通知优化包刷新摘要
							var modifiedItem = ctrl.data.get('modifiedItem') || [];
							if(+opttypeid == 103){
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

//                case 104: // 推广时段
//                    // 新的时段修改: Added by Wu Huiyao 2013.1.10
//                    nirvana.aopkg.scheduleDetail.show(
//                        ctrl,
//                        {
//                            optid: optid,
//                            opttypeid: opttypeid,
//                            optdata: cachedata,
//                            optmd5: cache.optmd5
//                        }
//                    );

                    // del by Huiyao: 2013.1.6 替换成上面的新的时段
//					var itemParam = {
//						id: 'aoPkgWidget' + opttypeid,
//						actionPath: 'manage/planSchedule',
//						className : '',
//						title: '修改推广时段',
//						width: 660,
//						maskLevel : nirvana.aoPkgWidgetCommon.getMaskLevel(),
//						params: {
//							isDecrPkg : true,
//							hasRec : true,//推荐时段
//							itemId : opttypeid,
//							level : ctrl.level,
//							opttypeid : opttypeid,
//							optmd5 : cache.optmd5,
//							suboptmd5 : cachedata.optmd5,
//							decrtype: ctrl.decrtype || '',
//							planid: [cachedata.planid],
//							planname: cachedata.planname
//						}
//					};
					
//					// 监控
//                    logParam = {
//                        opttypeid : opttypeid
//                    };
//                    if(ctrl.hasRank){
//                        var qlist = baidu.q('aopkg_rank', li, 'span');
//                        if(qlist.length > 0){
//                            logParam.rank = qlist[0].innerHTML;
//                        }
//                    }
//
//                    logParam.isnew = (baidu.q('aopkg_updated', li, 'span').length > 0 ? 1 : 0);
//
//                    if(cachedata.planid){
//                        logParam.planid = cachedata.planid;
//                    }
//                    logParam.optmd5 = cache.optmd5;
//					logParam.suboptmd5 = cachedata.optmd5;
//                    nirvana.aoPkgControl.logCenter.extend(logParam)
//                                            	  .sendAs('nikon_optitem_viewdetail');
					// del by Huiyao: 2013.1.6 替换成上面的新的时段
//					dialog = nirvana.util.openSubActionDialog(itemParam);
//
//					dialog.onclose = function(args){
//						// 处理已部分优化信息
//						if(dialog.action.getContext('isModified')){
//							// 通知优化包刷新摘要
//							var modifiedItem = ctrl.data.get('modifiedItem') || [];
//							modifiedItem.push(opttypeid + '_' + cachedata.planid);
//							ctrl.data.set('modifiedItem', modifiedItem);
//							ctrl.refreshOptItem(optid);
//						}
//
//						//析构子Action
//						er.controller.unloadSub(dialog.action);
//
//						dialog.dispose();
//						itemParam.onclose && itemParam.onclose(param);
//
//						ui.util.dispose(itemParam.id);
//
//					};
					
//					ctrl.removeUpdatedInfo(optid);
//					break;
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

                    // 新提词采用新版的提词详情代码 by Huiyao 2013.3.21 时段走新流程
                    if (opttypeid == 104 || optid == 110 || optid == 112 || optid == 113) {
                        ctrl.switchToDetail2(optid, opttypeid, cache, cachedata);
                    }
                    else {
                        ctrl.switchToDetail(optid);
                    }
			}
		};
	}
});