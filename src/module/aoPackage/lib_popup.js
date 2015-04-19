/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/lib_popup.js 
 * desc: 弹窗提醒相关的控制函数公用函数库 
 * author: Leo Wang(wangkemiao@baidu.com)
 * date: $Date: 2012/08/02 $
 */

/**
 * 此处弹窗，单独出现。并不支持重复出现
 * 采用轮询方式请求并处理
 */
nirvana.aoPkgControl.popupCtrl = (function(){
	var queryTimesCount = 0,  // 轮询计数器
		intervalId = null,
		queryInterval = 3000,
		reqid = 0,
		reqPkgs = null,

		idMap = {}/*,
		defaultType = nirvana.config.DECREASE.DEFAULT_TYPE,
		defaultValue = nirvana.config.DECREASE.DEFAULT_VALUE*/;

	for(var o in nirvana.aoPkgConfig.KEYMAP){
		idMap[nirvana.aoPkgConfig.KEYMAP[o]] = o;
	}

	return {

		currPkgid : null,

		// 对应描述词
		wordTranslation : {
			'shows' : '展现量',
			'clks' : '点击量',
			'pv' : '浏览量'
		}, 
		dateTypeTranslation : [
			'节假日',
			'工作日'
		],
		descTranslation : {
			'shows' : '展现',
			'clks' : '点击',
			'pv' : '浏览'
		},
		/**
		 * 初始化方法
		 */
		init : function(){
			var me = this,
				pkgid = me.getReqPkgs();

			// 信息清理
			me.stopRequest();  // 如果之前有轮询请求在运行中，终止之

			reqPkgs = pkgid;
			me.currPkgid = null;

			// 开始轮询请求
			// 请求条件，如果弹窗没有被修改过或者没有出现过，则请求
			// 智能消息中心小流量，则不弹出这里的消息框  modify by zhouyu
			if(!nirvana.env.MES_CENTER && ('undefined' == typeof ui.Popup.isModed || ui.Popup.isModed == true)){
				if(ui.Popup.isModed == true){
					ui.Popup.rebuild();
				}
				fbs.nikon.getPopupInfo({
					command : 'start',
					pkgid : reqPkgs,
					onSuccess : function(response){
						var data = response.data,
							aostatus = data.aostatus,
							result = data.result;

						// 判断请求状态，轮询或者终止
						switch (aostatus) {
							case 0:
								me.showPopup(result);
								break;
							case 1:
								reqid = data.reqid;
								
								intervalId = setTimeout(function(){
									if(reqid == 0){
										return;
									}
									me.request();
								}, queryInterval);
								break;
							case 2:
						break;
						}
					
					},
					onFail : new Function()
				});
				queryTimesCount++;
			}
		},

		/**
		 * 轮询请求
		 */
		request : function(){
			var me = this;
			fbs.nikon.getPopupInfo({
				command : 'query',
				reqid : reqid,
				pkgid : reqPkgs,
				onSuccess : function(response){
					var data = response.data,
						aostatus = data.aostatus,
						result = data.result;

					// 判断请求状态，轮询或者终止
					switch (aostatus) {
						case 0:
							me.showPopup(result);
							break;
						case 1:
							reqid = data.reqid;
							
							intervalId = setTimeout(function(){
								if(reqid == 0){
									return;
								}
								me.request();
							}, queryInterval);
							break;
						case 2:
					break;
					}
				},
				onFail : new Function()
			});
			queryTimesCount++;
		},

		/**
		 * 轮询完成，展现弹窗
		 * @param {Array} data 包的弹窗数据
		 */
		showPopup : function(infoItems){
			var me = this,
				html = '',
				minititle = '';

			// 信息清理
			me.stopRequest();

			html = me.getContent(infoItems);

			minititle = me.getMiniTitle(infoItems);

			if(infoItems.length > 0 && html.length > 0){
				nirvana.aoPkgControl.logCenter.extend({
					pkgid : me.currPkgid
				}).sendAs('nikon_popup_show');

				ui.Popup.show({
					//title : '弹窗提醒',
					title : me.getTitle(infoItems),
					content : html,
					width : 300,
					position : 'fixed',
					pos : {
						bottom : 34,
						right : 0
					},
					miniClick : function(){
						nirvana.aoPkgControl.logCenter.extend({
							type : 1,
							pkgid : me.currPkgid
						}).sendAs('nikon_popup_ctrl');
					},
					maxClick : function(){
						nirvana.aoPkgControl.logCenter.extend({
							type : 3,
							pkgid : me.currPkgid
						}).sendAs('nikon_popup_ctrl');
					},
					closeClick : function(){
						nirvana.aoPkgControl.logCenter.extend({
							type : 2,
							pkgid : me.currPkgid
						}).sendAs('nikon_popup_ctrl');
					}
				});
				ui.Popup.setMiniTitle(minititle);
				ui.Popup.isModed = false;

				// ui.Popup.setOnmini(function(){
				// 	me.bindHandlers();
				// });
				// ui.Popup.setOnclose(function(){
				// 	me.bindHandlers();
				// });
				// ui.Popup.setOnmax(function(){
				// 	me.bindHandlers();
				// });

				me.bindHandlers();
			}
		},

		/**
		 * 获取需要请求弹窗信息的包id
		 * @method getReqPkg
		 * @return {Array}
		 */
		getReqPkgs : function(){
			var me = this,
				idarr = [];
			idarr.push(+idMap['DECREASE']);
            // 这个突降包升级，还是小流量，单独再加上这个请求 2013.2.21
            idarr.push(+idMap['EMERGENCY']);
			
			var sdata = LoginTime.getData('AoPkgWords');
			if(!sdata || !sdata.viewed){
				idarr.push(+idMap['COREWORDS']);
			}
			return idarr;
		},

		getContent : function(infoItems){
			/**
			 * 展现逻辑控制
			 */
			var me = this,
				html = '';
//				thtml;

            // 定义优化包弹窗出的优先级
            var priority = ['EMERGENCY', 'COREWORDS', 'DECREASE'];
            var hasPkg = function(pkgName) {
                for(var i = 0; i < infoItems.length; i++) {
                    pkgId = +infoItems[i].pkgid;
                    if (pkgId === +idMap[pkgName]) {
                        return {
                            pkgId: + pkgId,
                            data: infoItems[i]
                        };
                    }
                }
                return false;
            };

            var showPkg;
            for (var j = 0, len = priority.length; j < len; j ++) {
                showPkg = hasPkg(priority[j]);
                if (showPkg) {
                    me.currPkgid = showPkg.pkgId;
                    html = me.getMessage(showPkg.data);
                    if (html) {
                        break;
                    }
                }
            }

//			// 如果都有，默认出现重点词的弹窗，没有重点词弹窗，才出现效果突降的弹窗
//			for(var i = 0; i < infoItems.length; i++){
//                if(+infoItems[i].pkgid == +idMap['COREWORDS']){
//					thtml = me.getMessage(infoItems[i]);
//					if(!thtml){
//						continue;
//					}
//					else{
//						html = thtml;
//					}
//					me.currPkgid = +idMap['COREWORDS'];
//					break;
//				}
//				html += me.getMessage(infoItems[i]);
//				me.currPkgid = +idMap['DECREASE'];
//			}
			return html;
		},

		getMessage : function(msgData){
			var me = this,
				pkgid = msgData.pkgid,
				data = msgData.data,
				processedData = {},
				tpl, html;

			tpl = {
				'DECREASE' : '<div class="popup_blockinfo"><ul><li>您帐户的{decrtype}昨天比上个{datetype}{desc}突降{decrpercent}'
						   + '<br /><span class="popup_detail"><span class="bold">{decrtype}：{beginvalue} <span class="specFamily">&#8594;</span> {endvalue}</span></span><a action_type="aopkg_decr" href="javascript:void(0);">立即查看</a></li></ul></div>',
				'COREWORDS' : '<div class="popup_blockinfo">'
//						+ '<ul>'
//						+ '<li><span class="popup_detail">重点词：{corewordsdetailmsg}</span><a action_type="aopkg_corewords" href="javascript:void(0);" class="inline_block">立即查看</a></li>'
//						+ '<li>{proctime} 完成诊断</li>'
//						+ '</ul></div>'
                        + '<p class="popup_detail">'
                        + '{detail}'
                        + '<span action_type="aopkg_corewords" class="clickable inline_block">立即查看</span>'
                        + '</p></div>'
			};
			switch(+pkgid){
				case +idMap['DECREASE']:
					processedData = {
						decrtype : me.wordTranslation[data.decrtype],
						datetype : me.dateTypeTranslation[data.datetype],
						desc : me.descTranslation[me.decrtype],
						decrpercent : round(((data.beginvalue - data.endvalue) / data.beginvalue * 100)) + '%',
						beginvalue : data.beginvalue,
						endvalue : data.endvalue
					};
					html = lib.tpl.parseTpl(processedData, tpl[nirvana.aoPkgConfig.KEYMAP[pkgid]]);
					break;
                // 这个突降包升级，还是小流量，弹窗同老的突降包 2013.2.21
                case +idMap['EMERGENCY']:
                    var beginValue = data.beginvalue;
                    var endValue = data.endvalue;
                    var beginDate = new Date(+data.begindate);
                    var endDate = new Date(+data.enddate);
                    var format = baidu.date.format;
                    html = lib.tpl.parseTpl({
                        beginDate: format(beginDate, 'M月d日'),
                        endDate: format(endDate, 'M月d日'),
                        decrValue: round((beginValue - endValue) / beginValue * 100),
                        beginValue: beginValue,
                        endValue: endValue
                    }, 'emergencyPkyPopup', true);
                    break;
				case +idMap['COREWORDS']:
//					processedData = baidu.object.clone(data);
//					processedData.proctime = baidu.date.format(new Date(+data.proctime), 'HH:mm');
//					processedData.corewordsdetailmsg = [];
//					+data.noleftscreennum > 0 ? processedData.corewordsdetailmsg.push(data.noleftscreennum + '个不在左侧') : "";
//					+data.nolefttopnum > 0 ? processedData.corewordsdetailmsg.push(data.nolefttopnum + '个不在左侧第一') : '';
//					+data.qdumpnum > 0 ? processedData.corewordsdetailmsg.push(data.qdumpnum + '个质量度下降') : '';
//					+data.noeffnum > 0 ? processedData.corewordsdetailmsg.push(data.noeffnum + '个未生效') : '';
//
//					if(processedData.corewordsdetailmsg.length == 0){
//						html = '';
//					}
//					else{
//						processedData.corewordsdetailmsg = processedData.corewordsdetailmsg.join('，');
//						html = lib.tpl.parseTpl(processedData, tpl[nirvana.aoPkgConfig.KEYMAP[pkgid]]);
//					}
                    var detail = nirvana.corewordUtil.getPkgOverviewInfo(data, true);
                    // 没有详情信息，返回空串，则不显示弹窗
                    html = detail
                        ? lib.tpl.parseTpl({ detail: detail }, tpl[nirvana.aoPkgConfig.KEYMAP[pkgid]])
                        : '';
					break;
			}
			return html;
		},

		getMiniTitle : function(list){
			var me = this,
				i, l = list.length,
				pkgids = [],
				index, data,
				html;

			for(i = 0; i < l; i++){
				pkgids.push(+list[i].pkgid);
			}
			
			switch(+me.currPkgid){
				case +idMap['COREWORDS']:
					index = baidu.array.indexOf(pkgids, +idMap['COREWORDS']);
					data = list[index].data;
					html = '<span class="bold">重点词排名提醒</span> '
						 + data.probwordnum
						 + '个重点词建议优化';
					return html;
				case +idMap['DECREASE']:
                // 这个突降包升级，还是小流量，弹窗同老的突降包 2013.2.21
                case +idMap['EMERGENCY']:
					index = baidu.array.indexOf(pkgids, +me.currPkgid);
					data = list[index].data;
                    var typeName = (+me.currPkgid === +idMap['DECREASE']) ? me.wordTranslation[data.decrtype] : '点击';
					html = '<span class="bold">效果突降提醒</span> ' 
						 + typeName
						 + '下降' 
						 + (round(((data.beginvalue - data.endvalue) / data.beginvalue * 100)) + '%');
					return html;
			}
		},
		getTitle : function(list){
			var me = this,
				i, l = list.length,
				pkgids = [],
				index, data,
				html;

            for(i = 0; i < l; i++){
                pkgids.push(+list[i].pkgid);
            }

			switch(+me.currPkgid){
				case +idMap['COREWORDS']:
					html = '重点词排名提醒';
                    index = baidu.array.indexOf(pkgids, +idMap['COREWORDS']);
                    data = list[index].data;

                    var procTime = baidu.date.format(new Date(+data.proctime), 'HH:mm');
                    html += '<span style="margin-left: 15px;">' + procTime + '完成诊断</span>';
					return html;
				case +idMap['DECREASE']:
                // 这个突降包升级，还是小流量，弹窗同老的突降包 2013.2.21
                case +idMap['EMERGENCY']:
					html = '突降优化提醒<a action_type="aopkg_decr_config" href="javascript:void(0);">设置</a>';
					return html;
			}
		},

		clickHandler: function(){
			var me = this;
			return function(e){
				var event = e || window.event,
					target = event.target || event.srcElement,
					action_type;
				action_type = baidu.dom.getAttr(target, 'action_type');
				switch(action_type){
					case 'aopkg_decr':
						me.openAoDecr();
						break;
					case 'aopkg_corewords':
						me.openAoCoreWords();
						break;
					case 'aopkg_decr_config':
						me.openAoDecrConf();
						break;
				}
			}
		},

		// bodyClickHandler: function(e){
		// 	var event = e || window.event,
		// 		target = event.target || event.srcElement,
		// 		action_type;

		// 	action_type = baidu.dom.getAttr(target, 'action_type');
		// 	switch(action_type){
		// 		case 'aopkg_decr':
		// 			me.openAoDecr();
		// 			break;
		// 		case 'aopkg_corewords':
		// 			me.openAoCoreWords();
		// 			break;
		// 	}
		// },
		// headClickHandler: function(e){
		// 	var event = e || window.event,
		// 		target = event.target || event.srcElement,
		// 		action_type;

		// 	action_type = baidu.dom.getAttr(target, 'action_type');
		// 	switch(action_type){
		// 		case 'aopkg_decr_config':
		// 			me.openAoDecrConf();
		// 			break;
		// 	}
		// },

		bindHandlers : function(){
			var me = this,
				target = baidu.g('PopupContainer');
            // 使用了baidu.on又不移除掉事件，导致概况页和管理页切换的时候，点击事件会越来越多
            // 导致一个点击会触发多次，导致了一些不可预期的问题，modified by Huiyao 2013.2.22
            target.onclick = me.clickHandler();
			// baidu.on(target, 'click', me.clickHandler());
			
			// baidu.un(target, 'click', me.bodyClickHandler);
			// baidu.un(ui.Popup.Object.getHead(), 'click', me.headClickHandler);
			// baidu.on(target, 'click', me.bodyClickHandler);
			// baidu.on(ui.Popup.Object.getHead(), 'click', me.headClickHandler);
		},

		/**
		 * 弹窗中快速打开效果突降
		 */
		openAoDecr : function(){
            // var logger = nirvana.aoPkgControl.logCenter;
            var entrance = (location.href.indexOf('#/manage') > -1 ? 2 : 1);
            // logger.setEnterance(entrance)
            //       .extend({
            //            pkgid : 1
            //       })
            //       .sendAs('nikon_package_enter');
	        nirvana.aoPkgControl.openAoPackage(+ this.currPkgid, entrance);
		},
		openAoCoreWords : function(){
			var me = this;
            // var logger = nirvana.aoPkgControl.logCenter;
            var entrance = (location.href.indexOf('#/manage') > -1 ? 2 : 1);
            // logger.setEnterance(entrance)
            //       .extend({
            //            pkgid : 4
            //       })
            //       .sendAs('nikon_package_enter');
			nirvana.aoPkgControl.openAoPackage(4, entrance);
		},

		openAoDecrConf : function(){
            // 这个突降包升级，还是小流量，弹窗同老的突降包 2013.2.21
            if (+ this.currPkgid === 1) {
                setPropForAoDecr(null, 'popup');
            }
            else {
                // 打开设置对话框
                var dlg = new nirvana.aoPkgControl.EmergencySettingDlg();
                // 突降设置成功回调
                dlg.onSuccess = function() {
                    if (ui.Popup.getView() != 'init'
                        && ui.Popup.getView() != 'close') {
                        ui.Popup.rebuild();
                    }
                    er.controller.fireMain('reload', {});
                };
                dlg.show();
            }

			//点击弹窗中设置 监控
			nirvana.aoPkgControl.logCenter.extendDefault({
				entrancetype : 1
			}).sendAs('nikon_decrconfig_enter');
		},

		/**
		 * 如果之前有轮询在运行中，终止之
		 * @method stopRequest
		 */
		stopRequest : function(){
			var me = this;
			if(intervalId){
				clearTimeout(intervalId);
			}
			intervalId = null;
			queryTimesCount = 0; // 轮询计数器清零
			reqid = 0;
			reqPkgs = [];
		},

		destroy : function(){
			var me = this;
			me.stopRequest();
			//ui.Popup.rebuild();
			ui.Popup.hide();
			ui.Popup.isModed = true;
		}
	};
})();