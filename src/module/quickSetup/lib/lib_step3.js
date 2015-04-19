nirvana.quickSetupLib = nirvana.quickSetupLib || {};
nirvana.quickSetupLib.step3 = {
	
	stepTpl : 'quickSetupStep3',
	renderTarget : 'QuickSetupBody',
	
	/**
	 * 必须的检查函数，用于在渲染当前大步骤及子步骤（如果有）之前进行检查前置条件是否满足
	 */
	preConditionCheck : function(action){
		var me = action,
			taskstatus = nirvana.quickSetupLib.getParam('taskstatus');
		
		
		/**
		 * 进入第三步，则此时去取taskstatus必然是2、3、4、5、7中的一个
		 * 2：推广方案成功
		 * 3：开始入库
		 * 4：成功
		 * 5：部分成功
		 * 7：推广方案入库失败
		 */
		if(taskstatus != 2 && taskstatus != 3 && taskstatus != 4 && taskstatus != 5 && taskstatus != 7 && taskstatus != 101){
			return false;
		}
		
		return true;
	},
	
	/**
	 * 当前步骤在render之前进行的前置处理行为
	 */
	preProcess : function(action){
		var me = action,
			step = 3;  //这里理应就是3;
		
		//me.setContext('step', 3);
		me.setContext('taskstatus', nirvana.quickSetupLib.getParam('taskstatus'));
		
		/**
		 * 当前浮出层右上角X重新绑定逻辑
		 */
		var dialog = ui.util.get('QuickSetup');
		dialog && (dialog.getClose().onclick = function(){
			nirvana.quicksetup.hide();
		});

		// 声明这里用到的Bubble的SourceType
		ui.Bubble.source.quickSetupIinfo = {
			type : 'normal',
			iconClass : 'ui_bubble_icon_info',
			positionList : [2,3,4,5,6,7,8,1],
			needBlurTrigger : true,
			showByClick : true,
			showByOver : true,			//鼠标悬浮延时显示
			showByOverInterval : 500,	//悬浮延时间隔
			hideByOut : true,			//鼠标离开延时显示
			hideByOutInterval : 1000,	//离开延时间隔，显示持续时间
			title : function(node){
				var ti = node.getAttribute('title');
				if (ti) {
		            return(baidu.encodeHTML(baidu.decodeHTML(ti)));
		        } else {
		            return(baidu.encodeHTML(baidu.decodeHTML(node.firstChild.nodeValue)));
		        }
			},
			content : function(node, fillHandle, timeStamp){
				var ti = node.getAttribute('bubblecontent');
				if (ti) {
		            return(baidu.encodeHTML(baidu.decodeHTML(ti)));
		        } else {
		            return(baidu.encodeHTML(baidu.decodeHTML(node.firstChild.nodeValue)));
		        }	        
			}
		};
		
	},
	
	render : function(action){
		var me = action,
			lib = this,
			target = baidu.g(nirvana.quickSetupLib.targetId),
			taskstatus;
		
		//先进行前置检查
		if(!this.preConditionCheck(me)){
			ui.Dialog.alert({
				title: '错误',
				content: '请从正确途径执行！',
				onok: function(){
				}
			});
			me.onclose && me.onclose();
			return false;
		}
		
		//执行步骤的特定前置处理
		lib.preProcess(me);
		
		//根据taskstatus状态，区分处理
		/**
		 * 1: 开始生成方案
		 * 2：推广方案成功
		 * 6：推广方案生成失败
         * 101：前端自定义失败状态，生成的结构信息为空
		 */
		taskstatus = me.getContext('taskstatus');
		switch(taskstatus){
			case 2:
				lib.infoTree.show(me);
				break;
			case 3:
				lib.showRuningStatus(me);
				break;
			case 7:
            case 101:
				lib.showFailedStatus(me);
				break;
			case 4:
			// case 5:
				// lib.showSuccess(me);
				/**
				 * 标记任务结束
				 */
				fbs.eos.finishTask({
					type : nirvana.quickSetupLib.getParam('type')
				});
				
				// 标记需要清空缓存
				nirvana.quickSetupLib.setParam('needClearCache', true);

				nirvana.quickSetupControl.goStep(me, 4);
				break;
			case 5:
				// 标记需要清空缓存
				nirvana.quickSetupLib.setParam('needClearCache', true);
				lib.showPartSuccess(me);
				break;
		}
		
		//初始化ui控件
		var uiList = ui.util.init(target);
		for(var o in uiList){
			me._controlMap[o] = uiList[o];
		}
		this.bindHandlers(me);
	},
	
	/**
	 * 绑定监听事件
	 */
	bindHandlers : function(action){
		var me = action,
			controlMap = me._controlMap,
			taskstatus = me.getContext('taskstatus');
		if(controlMap.stepButton){
			controlMap.stepButton.onclick = function(){
				controlMap.stepButton.disable(true);
				
				/**
				 * 监控，第三步确认方案
				 */
				nirvana.quickSetupLogger('quicksetup_step3_submit');

				fbs.eos.adcreate({
					onSuccess: function(response){
                        nirvana.quickSetupLib.setParam('taskstatus', 3);
                        nirvana.quickSetupControl.goStep(me, 3);
                    },
                    onFail: function(data){
                    	controlMap.stepButton.disable(false);
                        if (!data.errorCode && data.status != 300) { // 没有errorCode，则代表status = 500/600...，系统异常
                            ajaxFailDialog();
                            return;
                        }

                        /**
                         * status=300 部分成功 部分失败，单独处理
                         */
                        if(data.status == 300){
                            return;
                        }
                        
                        var error = data.errorCode;
                        switch(error.code){
                            case 6014:
                                ui.Dialog.alert({
                                    title: nirvana.quickSetupLib.getActionTitle() + '失败',
                                    content: '对不起，今天发起' + nirvana.quickSetupLib.getActionTitle() + '的次数已达到上限，新建失败。'
                                });
                                break;
                            case 6018:
                                ui.Dialog.alert({
                                    title: '确认失败',
                                    content: '确认失败，不允许重复确认方案！',
                                    onok: function(){
                                    }
                                });
                                break;
                            default:
                                ajaxFailDialog();
                                break;
                        }
                    }
				});
			}
		}
		
		//范围click函数绑定
		if(baidu.g('QuickSetupBody')){
			baidu.on('QuickSetupBody', 'click', nirvana.quickSetupLib.step3.clickHandler(me));
		}
		
		//了解方案详情绑定
		if(baidu.g('QuickSetupCheckSchemeDetail')){
			baidu.g('QuickSetupCheckSchemeDetail').onclick = function(){
				nirvana.quickSetupLib.step3.schemeDetail.show();
				return false;
			}
		}
		
		//放弃方案按钮绑定
		if(baidu.g('QuickSetupCancelSchema')){
			baidu.g('QuickSetupCancelSchema').onclick = function(){
				
				/**
				 * 监控，点击放弃方案
				 */
				nirvana.quickSetupLogger('quicksetup_step3_cancelSchema', {
					type : -1
				});
				
				ui.Dialog.confirm({
						title: '放弃' + nirvana.quickSetupLib.getActionTitle() + '方案',
						content: '如果放弃方案，你将失去当前已生成的推广方案以及刚刚所填写的所有内容。<br />是否仍然选择“放弃方案”？',
						onok: function(){
							
							/**
							 * 监控，确认放弃方案
							 */
							nirvana.quickSetupLogger('quicksetup_step3_cancelSchema', {
								type : 1
							});
							fbs.eos.cancelScheme({
								type : nirvana.quickSetupLib.getParam('type'),
								onSuccess : function(response){
									nirvana.quicksetup.hide();
								},
								onFail : function(data){
									ajaxFailDialog();
								}
							})
						},
						oncancel: function(param){
							/**
							 * 监控，取消放弃方案
							 */
							nirvana.quickSetupLogger('quicksetup_step3_cancelSchema', {
								type : 0
							});
						}
					});
				return false;
			}
		}
		
		
		if(controlMap.goBackButton){
			switch(taskstatus){
				case 7:
					controlMap.goBackButton.setLabel('返回上一步');
					controlMap.goBackButton.onclick = function(){
						//将返回第3步初始状态重新提交
						fbs.eos.taskfailed({
							type : nirvana.quickSetupLib.getParam('type'),
							step : 2,
							onSuccess : function(response){
								//重置了任务状态之后，需要进行更新任务状态
								//更新taskstatus信息，然后转向
								//这里不采取读后台的方式，因为有可能有主从同步的问题（尽管很罕见）
								//而是直接认为任务状态被置为0，表示重新开始，如果关闭的话，在打开时，会去重新请求任务状态
								nirvana.quickSetupLib.setParam('taskstatus', 2);
								//清空缓存
								nirvana.quickSetupLib.cache.clearStepInfo();
								//直接转至第二步
								nirvana.quickSetupControl.goStep(me, 3);
								
							},
							onFail : function(data){
								ajaxFailDialog();
							}
						});
					}
					break;
				case 101:
					controlMap.goBackButton.setLabel('重新生成方案');
					controlMap.goBackButton.onclick = function(){
						controlMap.goBackButton.disable(true);
						//将重新开始
						fbs.eos.cancelScheme({
							type : nirvana.quickSetupLib.getParam('type'),
							onSuccess : function(response){
								//重置了任务状态之后，需要进行更新任务状态
								//更新taskstatus信息，然后转向
								//这里不采取读后台的方式，因为有可能有主从同步的问题（尽管很罕见）
								//而是直接认为任务状态被置为0，表示重新开始，如果关闭的话，在打开时，会去重新请求任务状态
								nirvana.quickSetupLib.setParam('taskstatus', 0);
								//清空缓存
								//nirvana.quickSetupLib.cache.clearStepInfo();
								//直接转至第一步
								nirvana.quickSetupControl.goStep(me, 1);
							},
							onFail : function(data){
								controlMap.goBackButton.disable(false);
								ajaxFailDialog();
							}
						});
					}
					break;
			}
		}
		
		/*
		if(controlMap.noNeedAndCloseButton){
			controlMap.noNeedAndCloseButton.onclick = function(){
				//直接关掉了
				nirvana.quicksetup.hide();
				
				//清空缓存并刷新账户数
				fbs.material.clearCache('planinfo');
				fbs.material.clearCache('unitinfo');
				fbs.material.clearCache('ideainfo');
				fbs.material.clearCache('wordinfo');
				ui.util.get('SideNav') && ui.util.get('SideNav').refreshPlanList();
				
			};
		}
		*/
		
		if(ui.util.get('GoAndAddIdea')){
			ui.util.get('GoAndAddIdea').onclick = function(){
				/**
				 * 标记任务结束
				 */
				fbs.eos.finishTask({
					type : nirvana.quickSetupLib.getParam('type')
				});
				
				// 标记需要清空缓存
				nirvana.quickSetupLib.setParam('needClearCache', true);

				nirvana.quickSetupControl.goStep(me, 4);
				
				return false;
				
			};
		}
		//taskstatus = 3状态下，需要执行一个轮询监听，来监测是否需要跳转
		if(taskstatus == 3){
			nirvana.quickSetupLib.interval = setTimeout(this.listenAndRefresh(me), 5000);
		}
	},
	
	/**
	 * 范围click函数
	 */
	clickHandler : function(action){
		var lib = this,
			me = action,
			controlMap = me._controlMap;
		return function(e){
			var event = e || window.event,
                target = event.target || event.srcElement,
                actionType,
                cache, cachedata,
                tarr,
                index,
                parent,
                wid,
                bid, wmatch;
        
	        while(target && target != baidu.g('QuickSetupBody')){
	        	actionType = baidu.dom.getAttr(target, 'action_type');
	        	switch(actionType){
	        		case 'foldallplan':
						nirvana.quickSetupLib.step3.infoTree.foldAllPlan();
						return;
					case 'unfoldallplan':
						nirvana.quickSetupLib.step3.infoTree.unfoldAllPlan();
						return;
	        		case 'unfoldplan':
	        			index = baidu.dom.getAttr(target, 'index');
	        			nirvana.quickSetupLib.step3.infoTree.unfoldPlan(+index);
	        			return;
	        		case 'foldplan':
	        			index = baidu.dom.getAttr(target, 'index');
	        			nirvana.quickSetupLib.step3.infoTree.foldPlan(+index);
	        			return;
	        		case 'unfoldunit':
	        			index = baidu.dom.getAttr(target, 'index');
	        			tarr = index.split(',');
	        			nirvana.quickSetupLib.step3.infoTree.unfoldUnit(+tarr[0], +tarr[1]);
	        			return;
	        		case 'foldunit':
	        			index = baidu.dom.getAttr(target, 'index');
	        			tarr = index.split(',');
	        			nirvana.quickSetupLib.step3.infoTree.foldUnit(+tarr[0], +tarr[1]);
	        			return;
	        		case 'editbid':
	        			parent = target.parentNode;
	        			wid = parent.getAttribute("winfoid");
	        			bid = baidu.number.fixed(baidu.g('InfoTreeWordBid' + wid).innerHTML);
	        			
	        			nirvana.inline.createInlineLayer({
							type: "text",
							value: bid,
							id: "bid" + wid,
							target: parent,
							action: "modWordBid",
							okHandler: function(wbid){
								return {
									//这里绕过原有逻辑，如果值相同 不发送请求，而是直接关闭
									func: wbid == bid ? nirvana.quickSetupLib.step3.infoTree.closeInlineEditor : fbs.eos.modBid,
									
									validate: nirvana.quickSetupLib.step3.infoTree.bidValidate(wbid),
									param: {
										recmwinfoid: [wid],
										recmitems : {
											bid: wbid
										},
										onSuccess: function(data){
											if (data.status != 300) {
												//不处理缓存了
												//直接inline改变
												baidu.g('InfoTreeWordBid' + wid).innerHTML = baidu.number.fixed(wbid);
												nirvana.quickSetupLib.step3.infoTree.closeInlineEditor();
											}
										}
									}
								}
							}
						});
	        			return;
	        		case 'modifyplan':
	        			index = baidu.dom.getAttr(target, 'index');

	        			cache = nirvana.quickSetupLib.step3.infoTree.data.recmplanlist;
	        			cachedata = cache[+index];
	        			var planname = cachedata.recmplanname;
	        			var planid = cachedata.recmplanid;
	        			//parent = target.parentNode;

	        			nirvana.inline.createInlineLayer({
							type: "text",
							value: planname,
							id: "planname" + planid,
							target: target,
							positionCall : function(editTd,div){
								var parent = editTd.offsetParent,
									baseparent = parent.offsetParent,
									container = baidu.g('InfoTree'),
									mixvalue = parent.offsetHeight / 2;

								div.style.position = 'absolute';
								// 此判断条件不考虑margin
								// 如果是第一个元素 则设置top为0
								if (parent.offsetTop < mixvalue) {
									div.style.top = parent.offsetTop;
									div.style.bottom = "";
								}
								// 如果是最后一个元素 则设置bottom为0
								else if(container.offsetHeight - baseparent.offsetTop - parent.offsetTop <= (mixvalue * 3)){
									div.style.bottom = container.offsetHeight - container.scrollHeight + 'px';
									div.style.top = '';
								}
								else{
									div.style.top = parent.offsetTop - 10 + "px";
									div.style.bottom = "";
								}

								div.style.left = editTd.offsetLeft + 'px';
								div.style.zIndex = 200;
								baseparent.appendChild(div);
							},
							okHandler: function(name){
								return {
									func: fbs.eos.modPlan,
									param: {
										recmplanid: [planid],
										planname: name,
										onSuccess: function(data){
				                            if (data.status != 300) {
				                            	cachedata.recmplanname = name;
				                                baidu.g('InfoTreePlanname' + planid).innerHTML = name;
				                                nirvana.quickSetupLib.step3.infoTree.closeInlineEditor();
				                            }
										}
									}
								}
							}
						});

	        			
	        			return;
	        		case 'modifyunit':
	        			index = baidu.dom.getAttr(target, 'index');
	        			tarr = index.split(',');

	        			cache = nirvana.quickSetupLib.step3.infoTree.data.recmplanlist;
	        			cachedata = cache[+tarr[0]].recmunitlist[+tarr[1]];
	        			var unitname = cachedata.recmunitname;
	        			var unitid = cachedata.recmunitid;

						nirvana.inline.createInlineLayer({
							type: "text",
							value: unitname,
							id: "planname" + planid,
							target: target,
							positionCall : function(editTd,div){
								var parent = editTd.offsetParent,
									baseparent = parent.offsetParent,
									container = baidu.g('InfoTree'),
									mixvalue = parent.offsetHeight / 2;

								div.style.position = 'absolute';
								// 此判断条件不考虑margin
								// 如果是第一个元素 则设置top为0
								if (parent.offsetTop < mixvalue) {
									div.style.top = parent.offsetTop;
									div.style.bottom = "";
								}
								// 如果是最后一个元素 则设置bottom为0
								else if(container.offsetHeight - baseparent.offsetTop - parent.offsetTop <= (mixvalue * 3)){
									div.style.bottom = container.offsetHeight - container.scrollHeight + 'px';
									div.style.top = '';
								}
								else{
									div.style.top = (parent.offsetTop - 10) + "px";
									div.style.bottom = "";
								}

								div.style.left = editTd.offsetLeft + 'px';
								div.style.zIndex = 200;
								baseparent.appendChild(div);
							},
							okHandler: function(name){
								return {
									func: fbs.eos.modUnit,
									param: {
										recmunitid: [unitid],
										unitname: name,
										onSuccess: function(data){
				                            if (data.status != 300) {
				                            	cachedata.recmunitname = name;
				                                baidu.g('InfoTreeUnitname' + unitid).innerHTML = name;
				                                nirvana.quickSetupLib.step3.infoTree.closeInlineEditor();
				                            }
										}
									}
								}
							}
						});

	        			return;
	        		case 'editwmatch':
	        			parent = target.parentNode;
	        			wid = parent.getAttribute("winfoid");
	        			wmatch = baidu.dom.getAttr('InfoTreeWordWmatch' + wid, 'wmatch');
	        			
	        			nirvana.inline.createInlineLayer({
							type: "select",
							value: wmatch,
							id: "wmatch" + wid,
							target: parent,
							datasource:[
								{
									text:"精确",
									value:"63"
								},
								{
									text:"短语",
									value:"31"
								},
								{
									text:"广泛",
									value:"15"
								}
							],
							okHandler: function(match){
								return {
									func: fbs.eos.modWmatch,
									param: {
										recmwinfoid: [wid],
										recmitems : {
											wmatch: match
										},
										onSuccess: function(data){
											if (data.status != 300) {
												//不处理缓存了
												//直接inline改变
												baidu.g('InfoTreeWordWmatch' + wid).innerHTML = MTYPE[match];
												baidu.dom.setAttr('InfoTreeWordWmatch' + wid, 'wmatch', match);
												//nirvana.inline.editArea.dispose();
												//nirvana.inline.currentLayer.parentNode.removeChild(nirvana.inline.currentLayer);
												nirvana.quickSetupLib.step3.infoTree.closeInlineEditor();
											}
										}
									}
								}
							}
						});
						return;
	        		case 'deleteword':
	        			parent = target.parentNode;
	        			wid = parent.getAttribute("winfoid");
	        			index = parent.getAttribute('index');
	        			tarr = index.split(',');
	        			
	        			fbs.eos.delKeyword({
							recmwinfoid : [wid],
							onSuccess: function(response){
								var data = response.data,
									row;
								baidu.dom.setAttr(target, 'action_type', 'retriveword');
								target.innerHTML = '撤销删除';
								
								row = nirvana.quickSetupLib.step3.infoTree.getTableLineIndex(target);
								if(row != null){
									nirvana.quickSetupLib.step3.infoTree.deleteWord(+tarr[0], +tarr[1], +row);
								}
								
							},
							onFail: function(data){
								ajaxFailDialog();
							}
						});
	        			return;
	        		case 'retriveword':
	        			parent = target.parentNode;
	        			wid = parent.getAttribute("winfoid");
	        			index = parent.getAttribute('index');
	        			tarr = index.split(',');
	        			
	        			fbs.eos.retriveKeyword({
							recmwinfoid : [wid],
							onSuccess: function(response){
								var data = response.data,
									row;
								baidu.dom.setAttr(target, 'action_type', 'deleteword');
								target.innerHTML = '删除';
								
								row = nirvana.quickSetupLib.step3.infoTree.getTableLineIndex(target);
								if(row != null){
									nirvana.quickSetupLib.step3.infoTree.retriveWord(+tarr[0], +tarr[1], +row);
								}
								
							},
							onFail: function(data){
								ajaxFailDialog();
							}
						});
	        			return;
	        	}
	        	target = target.parentNode;
	        }
	   }
		
	},
	
	listenAndRefresh : function(action){
		var me = action,
			lib = this;
		return function(){
			nirvana.quickSetupLib.getTaskStatus(
				function(value){
					nirvana.quickSetupLib.setParam('taskstatus', value);
					me.setContext('taskstatus', value);
					if(value == 7 || value == 4 || value == 5){
						//转向
						nirvana.quickSetupLib.interval = null;
						nirvana.quickSetupControl.goStep(me, 3);
					}
					else if(value == 3){
						//轮询
						nirvana.quickSetupLib.interval = setTimeout(lib.listenAndRefresh(me), 5000);
					}
					else{
						//停止，系统异常，转向
						nirvana.quickSetupLib.interval = null;
						nirvana.quickSetupControl.goStep(me, 3);
					}
					
				}
			);
		};
	},
	
	showRuningStatus : function(action){
		var me = action,
            taskstatus = me.getContext('taskstatus'),
            tpl, target = baidu.g(this.renderTarget),
            type = nirvana.quickSetupLib.getTypeName(),
            html;
        if(taskstatus == 3){
            tpl = er.template.get('quickSetupTaskRunning');
            if(target){
                target.innerHTML = tpl;
                baidu.g('QuickSetupTaskRunningTitle').innerHTML = nirvana.config.EOS.STEP3.RUNNING.TITLE;
                baidu.g('QuickSetupTaskRunningContent').innerHTML = nirvana.config.EOS.STEP3.RUNNING.CONTENT;
                baidu.g('QuickSetupTaskRunningImage').src = 'asset/img/loading_eos.jpg';
            }
        }
        nirvana.quickSetupControl.rePosition();
	},
	
	showFailedStatus : function(action){
		var me = action,
			taskstatus = me.getContext('taskstatus'),
			tpl, target = baidu.g(this.renderTarget),
			type = nirvana.quickSetupLib.getTypeName(),
			html;
		
		if(target){
			if(taskstatus == 7){
				tpl = er.template.get('quickSetupTaskFailed');
				target.innerHTML = tpl;
                baidu.g('QuickSetupTaskFailTitle').innerHTML = nirvana.config.EOS.STEP3.FAIL.TITLE;
                baidu.g('QuickSetupTaskFailContent').innerHTML = nirvana.config.EOS.STEP3.FAIL.CONTENT;
			}
            else if(taskstatus == 101){
				tpl = er.template.get('quickSetupTaskFailed1');
            	target.innerHTML = tpl;
                baidu.g('QuickSetupTaskFailTitle').innerHTML = nirvana.config.EOS.STEP2.FAIL101.TITLE;
                baidu.g('QuickSetupTaskFailContent').innerHTML = nirvana.config.EOS.STEP2.FAIL101.CONTENT;
            }
		}
	},
	
	showSuccess : function(action){
		var me = action,
			taskstatus = me.getContext('taskstatus'),
			tpl, target = baidu.g(this.renderTarget),
			type = nirvana.quickSetupLib.getTypeName(),
			html;
		if(taskstatus == 4){
			tpl = er.template.get('quickSetupTaskSuccess');
			if(target){
				target.innerHTML = tpl;
				baidu.g('QuickSetupTaskSuccTitle').innerHTML = nirvana.config.EOS.STEP3.SUCCESS.TITLE;
                baidu.g('QuickSetupTaskSuccContent').innerHTML = nirvana.config.EOS.STEP3.SUCCESS.CONTENT;
			}
		}
	},
	
	showPartSuccess : function(action){
		var me = action,
			taskstatus = me.getContext('taskstatus'),
			tpl, target = baidu.g(this.renderTarget),
			type = nirvana.quickSetupLib.getTypeName(),
			html;
		if(taskstatus == 5){
			tpl = er.template.get('quickSetupTaskPartSuccess');
			if(target){
				target.innerHTML = tpl;
                baidu.g('QuickSetupTaskPartSuccTitle').innerHTML = nirvana.config.EOS.STEP3.PARTSUCCESS.TITLE;
                baidu.g('QuickSetupTaskPartSuccContent').innerHTML = nirvana.config.EOS.STEP3.PARTSUCCESS.CONTENT;
			}
		}

		/**
		 * 当前浮出层右上角X重新绑定逻辑
		 */
		var dialog = ui.util.get('QuickSetup');
		dialog && (dialog.getClose().onclick = function(){
			if(taskstatus == 5){
				ui.Dialog.confirm({
					title: '离开' + nirvana.quickSetupLib.getActionTitle() + '流程',
					content: "你的创意撰写工作尚未完成，无创意的单元无法正常进行推广，是否确认离开？",
					onok: function(){
						nirvana.quicksetup.hide();
					}
				});
			}
			else{
				nirvana.quicksetup.hide();
			}
		});

	}/*,
	
	showNoNeedToAddIdeas : function(action){
		var me = action,
			taskstatus = me.getContext('taskstatus'),
			tpl, target = baidu.g(this.renderTarget),
			type = nirvana.quickSetupLib.getTypeName(),
			html,
			uiList;
		tpl = er.template.get('quickSetupTaskNoNeedToAddIdeas');
		if(target){
			tpl = tpl.replace(/%TYPENAME%/, type);
			target.innerHTML = tpl;
			html = nirvana.config.EOS.STEP3.NONEEDTOADDIDEAS;
			html = html.replace(/%TYPENAME%/, type);
			baidu.g('QuickSetupTaskNoNeedToAddIdeasContent').innerHTML = html;
			uiList = ui.util.init(target);
			for(var o in uiList){
				me._controlMap[o] = uiList[o];
			}
			nirvana.quickSetupLib.step3.bindHandlers(me);
		}
	}
	*/
};

nirvana.quickSetupLib.step3.infoTree = {
	action : null,
	data : null,
	target : 'QuickSetupInfoTree',
	
	foldedplan : 0,
	unfoldedplan : 0,
	
	show : function(action){
		var me = this;
		me.action = action;
		me.init();
	},
	/**
	 * 初始化行为，加载数据，渲染元素
	 */
	init : function(){
		var me = this,
			action = me.action;
		if(!action){
			return;
		}
		me.loadDataAndRender();
	},
	
	loadDataAndRender : function(){
		var me = this,
			action = me.action;
		ui.util.get('stepButton').disable(true);
		fbs.eos.getTaskInfo({
			onSuccess: function(response){
				var data = response.data;
				me.data = data;

				if(!me.data || !me.data.recmplanlist){
					ajaxFailDialog();
				}
				else{
					// 处理一下异常，如果返回的东西是空的，那么就设置为taskstatus = 101，进入异常页面
					if(me.data.recmplanlist.length == 0){
						nirvana.quickSetupLib.setParam('taskstatus', 101);
						nirvana.quickSetupControl.goStep(action, 3);
					}
					else{
						ui.util.get('stepButton').disable(false);
						me.foldedplan = me.data.recmplancount;
						me.unfoldedplan = 0;
						me.render();
						nirvana.quickSetupControl.rePosition();

						/**
						 * 将第一个计划展开至单元
						 * 再将第一个计划的第一个单元展开至关键词
						 */
						me.unfoldPlan(0);
						me.unfoldUnit(0, 0);
						
					}
				}
			},
			onFail: function(data){
				if (!data.errorCode && data.status != 300) { // 没有errorCode，则代表status = 500/600...，系统异常
					ajaxFailDialog();
					return;
				}

				/**
				 * status=300 部分成功 部分失败，单独处理
				 */
				if(data.status == 300){
					return;
				}
				
	            var error = data.errorCode;
	            switch(error.code){
	            	case 6019:
	            		//置任务状态为失败状态
	            		//转到失败状态界面
	            		nirvana.quickSetupLib.setParam('taskstatus', 101);
	            		nirvana.quickSetupControl.goStep(action, 3);
						break;
	            	default:
	            		ajaxFailDialog();
	            		break;
	            }
			}
		});
	},
	
	render : function(){
		var me = this,
			action = me.action,
			target = baidu.g(me.target);
		if(target){
			target.innerHTML = me.getMainHtml();
			baidu.g('QuickSetupInfoTreeToggle').innerHTML = '<span id="QuickSetupInfoTreeFoldAll" class="quicksetup_infotree_headctrl" action_type="unfoldallplan">展开全部计划</span>';
			//me.unfoldAllPlan();
		}
	},
	
	getId : function(str){
		var me = this,
			id = "QuickSetupInfoTree",
			str = str || '';
		if(str.length == 0){
			return id;
		}
		else{
			str = str.charAt(0).toUpperCase() + str.substring(1);
			return (id + str);
		}
	},
	
	maintpl : '<div id="{0}" class="quicksetup_infotree_main">{1}</div>',
	getMainHtml : function(){
		var me = this,
			html = '';
		
		html = ui.format(me.maintpl, 
			me.getId('main'),
			me.getHeadHtml() + me.getBodyHtml()
			//+ '<div class="quicksetup_checkscheme_right" id="QuickSetupInfoTreeToggle"><span id="QuickSetupInfoTreeFoldAll" class="quicksetup_infotree_headctrl" action_type="unfoldallplan">展开全部计划</span></div>'
		);
		return html;
	},
	
	headtpl : '<div id="{0}" class="quicksetup_infotree_head">{1}</div>',
	getHeadHtml : function(){
		var me = this,
			html = '';
		
		html = ui.format(me.headtpl, 
			me.getId('head'),
			'为方便你日后优化推广方案，我们根据你的业务分类、关键词词性等内容，把你所选择的<span id="QuickSetupInfoTreeTotalWordCount">' + me.data.recmwordcount + '</span>个关键词分成了以下' + me.data.recmplancount + '大类（推广计划），' + me.data.recmunitcount + '小类（推广单元）'
		);
		return html;
	},
	
	bodytpl : '<div id="{0}" class="quicksetup_infotree_body">{1}</div>',
	getBodyHtml : function(){
		var me = this,
			html = [],
			i, j,
			item;
		
		html.push('<div id="InfoTree" class="quicksetup_infotree_planlist">');
		for(i = 0; i < me.data.recmplanlist.length; i++){
			html.push(me.getPlanHtml(i));
		}
		html.push('</div>')
		
		return ui.format(me.bodytpl, 
			me.getId('body'),
			html.join('')
		);
	},
	
	plantpl : '<div id="InfoTreePlan{0}" class="quicksetup_infotree_plan"><div id="InfoTreePlanDetail{1}" class="{10}" onmouseover="{8}" onmouseout="{9}"><span id="InfoTreePlanIcon{2}" class="quicksetup_infotree_foldicon" action_type="unfoldplan" index="{3}">&nbsp;</span>{4}<span id="InfoTreePlanDesc{5}" class="quicksetup_infotree_plandesc">{6}</span></div><div id="InfoTreeUnitList{7}" class="quicksetup_infotree_unitlist" style="display:none;"></div></div>',
	getPlanHtml : function(index){
		var me = this,
			html = '',
			item;
		item = me.data.recmplanlist[index];
		if(item){
			html = ui.format(me.plantpl,
				item.recmplanid,
				item.recmplanid,
				item.recmplanid,
				index,
				'<span id="InfoTreePlanname' + item.recmplanid + '">' + baidu.encodeHTML(item.recmplanname) + '</span>',
				item.recmplanid,
				' 共' + item.recmunitcount + '个单元，' + item.recmwordcount + '个关键词 <a href="javascript:void 0;"  action_type="modifyplan" index="' + index + '" positiontype="myself">修改计划名</a>',
				item.recmplanid,
				"nirvana.quickSetupLib.step3.infoTree.mouseOverHandler('plan', '" + item.recmplanid + "')",
				"nirvana.quickSetupLib.step3.infoTree.mouseOutHandler('plan', '" + item.recmplanid + "')",
				'quicksetup_infotree_plandetail' + (index == 0 ? ' quicksetup_infotree_plandetail_first' : '')
			);
		}
		return html;
	},
	
	mouseOverHandler : function(type, id){
		var me = this;
		switch(type){
			case 'plan':
				if(baidu.g('InfoTreePlanDetail' + id)){
					baidu.addClass('InfoTreePlanDetail' + id, 'quicksetup_infotree_plandetail_hover');
				}
				break;
			case 'unit':
				if(baidu.g('InfoTreeUnitDetail' + id)){
					baidu.addClass('InfoTreeUnitDetail' + id, 'quicksetup_infotree_unitdetail_hover');
				}
				break;
		}
	},
	mouseOutHandler : function(type, id){
		var me = this;
		switch(type){
			case 'plan':
				if(baidu.g('InfoTreePlanDetail' + id)){
					baidu.removeClass('InfoTreePlanDetail' + id, 'quicksetup_infotree_plandetail_hover');
				}
				break;
			case 'unit':
				if(baidu.g('InfoTreeUnitDetail' + id)){
					baidu.removeClass('InfoTreeUnitDetail' + id, 'quicksetup_infotree_unitdetail_hover');
				}
				break;
		}
	},
	
	foldAllPlan : function(){
		var me = this, i;
		for(i = 0; i < me.data.recmplanlist.length; i++){
			me.foldPlan(i);
		}
	},
	unfoldAllPlan : function(){
		var me = this,
			i;
		for(i = 0; i < me.data.recmplanlist.length; i++){
			me.unfoldPlan(i);
		}
	},
	
	
	foldPlan : function(index){
		var me = this,
			item,
			target,
			icon;
		item = me.data.recmplanlist[index];
		
		target = baidu.g('InfoTreeUnitList' + item.recmplanid);
		
		if(target && target.innerHTML != '' && baidu.dom.getStyle(target, 'display') != 'none'){
			target.innerHTML = '';
			baidu.hide(target);
			
			icon = baidu.g('InfoTreePlanIcon' + item.recmplanid);
			if(icon){
				baidu.removeClass(icon, 'quicksetup_infotree_unfoldicon');
				baidu.dom.setAttr(icon, 'action_type', 'unfoldplan');
			}
			if(baidu.g('InfoTreePlanDetail' + item.recmplanid)){
				baidu.removeClass('InfoTreePlanDetail' + item.recmplanid, 'quicksetup_infotree_plandetail_active');
			}
			
			me.foldedplan++;
			me.unfoldedplan--;
			if(me.foldedplan == me.data.recmplancount){
				if(baidu.g('QuickSetupInfoTreeFoldAll')){
					baidu.g('QuickSetupInfoTreeFoldAll').innerHTML = '展开全部计划';
					baidu.dom.setAttr('QuickSetupInfoTreeFoldAll', 'action_type', 'unfoldallplan');
					baidu.addClass('QuickSetupInfoTreeFoldAll', 'quicksetup_infotree_headctrl_folded');
				}
			}
		}
		
	},
	
	unfoldPlan : function(index){
		var me = this,
			i, item,
			target,
			icon,
			html = [];
		item = me.data.recmplanlist[index];
		if(item && item.recmunitlist){
			for(i = 0; i < item.recmunitlist.length; i++){
				html.push(me.getUnitHtml(index, i));
			}
		}
		target = baidu.g('InfoTreeUnitList' + item.recmplanid);
		if(target && target.innerHTML == ''){
			target && (target.innerHTML = html.join(''));
			baidu.show(target);
			
			icon = baidu.g('InfoTreePlanIcon' + item.recmplanid);
			if(icon){
				baidu.addClass(icon, 'quicksetup_infotree_unfoldicon');
				baidu.dom.setAttr(icon, 'action_type', 'foldplan');
			}
			if(baidu.g('InfoTreePlanDetail' + item.recmplanid)){
				baidu.addClass('InfoTreePlanDetail' + item.recmplanid, 'quicksetup_infotree_plandetail_active');
			}
			
			me.foldedplan--;
			me.unfoldedplan++;
			if(me.unfoldedplan == me.data.recmplancount){
				if(baidu.g('QuickSetupInfoTreeFoldAll')){
					baidu.g('QuickSetupInfoTreeFoldAll').innerHTML = '收起全部计划';
					baidu.dom.setAttr('QuickSetupInfoTreeFoldAll', 'action_type', 'foldallplan');
					baidu.removeClass('QuickSetupInfoTreeFoldAll', 'quicksetup_infotree_headctrl_folded');
				}
			}
		}
		
	},
	
	unittpl : '<div id="InfoTreeUnit{0}" class="quicksetup_infotree_unit"><div id="InfoTreeUnitDetail{1}" class="quicksetup_infotree_unitdetail" onmouseover="{8}" onmouseout="{9}"><span id="InfoTreeUnitIcon{2}" class="quicksetup_infotree_foldicon" action_type="unfoldunit" index="{3}">&nbsp;</span>{4}<span id="InfoTreeUnitDesc{5}" class="quicksetup_infotree_plandesc">{6}</span></div><div id="InfoTreeWordList{7}" class="quicksetup_infotree_wordlist" style="display:none;"></div></div>',
	getUnitHtml : function(planindex, unitindex){
		var me = this,
			html = '',
			item, subitem;
		item = me.data.recmplanlist[planindex];
		if(item){
			subitem = item.recmunitlist[unitindex];
			if(subitem){
				html = ui.format(me.unittpl,
					subitem.recmunitid,
					subitem.recmunitid,
					subitem.recmunitid,
					planindex + ',' +unitindex,
					'<span id="InfoTreeUnitname' + subitem.recmunitid + '">' + baidu.encodeHTML(subitem.recmunitname) + '</span>',
					subitem.recmunitid,
					' 共' + subitem.recmwordcount + '个关键词，单元出价' + subitem.recmunitbid + '元 <a href="javascript:void 0;" action_type="modifyunit" index="' + planindex + ',' +unitindex + '" positiontype="myself">修改单元名</a>',
					subitem.recmunitid,
					"nirvana.quickSetupLib.step3.infoTree.mouseOverHandler('unit', '" + subitem.recmunitid + "')",
					"nirvana.quickSetupLib.step3.infoTree.mouseOutHandler('unit', '" + subitem.recmunitid + "')"
				);
			}
		}
		return html;
	},
	
	foldUnit : function(planindex, unitindex){
		var me = this,
			item, subitem,
			target,
			icon,
			table;
		item = me.data.recmplanlist[planindex];
		if(item){
			subitem = item.recmunitlist[unitindex];
			if(subitem){
				
				table = ui.util.get('InfoTreeWordTable' + subitem.recmunitid);
				table && table.dispose();
				
				target = baidu.g('InfoTreeWordList' + subitem.recmunitid);
				target && (target.innerHTML = '');
				baidu.hide(target);
				
				icon = baidu.g('InfoTreeUnitIcon' + subitem.recmunitid);
				if(icon){
					baidu.removeClass(icon, 'quicksetup_infotree_unfoldicon');
					baidu.dom.setAttr(icon, 'action_type', 'unfoldunit');
				}
				
				if(baidu.g('InfoTreeUnitDetail' + subitem.recmunitid)){
					baidu.removeClass('InfoTreeUnitDetail' + subitem.recmunitid, 'quicksetup_infotree_unitdetail_active');
				}
				
			}
		}
		
	},
	unfoldUnit : function(planindex, unitindex){
		var me = this,
			i, item, subitem;
		item = me.data.recmplanlist[planindex];
		if(item){
			subitem = item.recmunitlist[unitindex];
			if(subitem){
				//请求数据并展现
				fbs.eos.getWordlistByUnit({
					recmplanid : item.recmplanid,
					recmunitid : subitem.recmunitid,
					onSuccess: function(response){
						var data = response.data,
							i,
							html = [],
							target,
							icon;
						if(data.recmwordlist && data.recmwordlist.length > 0){
							target = baidu.g('InfoTreeWordList' + subitem.recmunitid);
							if(target){
								target.innerHTML = '<div></div>';
								ui.util.create('Table', {
									'id' : 'InfoTreeWordTable' + subitem.recmunitid,
									fields : me.getWordTableFields(planindex, unitindex),
									datasource : data.recmwordlist,
									noDataHtml : FILL_HTML.NO_DATA,
									isSubTable : true   //加这个参数 是为了在快速的关闭当前浮出层时不会出现表格autoresize的异常
								}, target.firstChild);
								
								baidu.show(target);
							
								icon = baidu.g('InfoTreeUnitIcon' + subitem.recmunitid);
								if(icon){
									baidu.addClass(icon, 'quicksetup_infotree_unfoldicon');
									baidu.dom.setAttr(icon, 'action_type', 'foldunit');
								}
								
								ui.util.init(target);
								
								//处理被删除的关键词们
								me.handleDeletedWords(planindex, unitindex, data);
								
								if(baidu.g('InfoTreeUnitDetail' + subitem.recmunitid)){
									baidu.addClass('InfoTreeUnitDetail' + subitem.recmunitid, 'quicksetup_infotree_unitdetail_active');
								}

								nirvana.quickSetupControl.rePosition();
							}
						}
						else{
							ajaxFailDialog();
						}
					},
					onFail: function(data){
						ajaxFailDialog();
					}
				});
			}
		}
	},
	
	getWordTableFields : function(planindex, unitindex){
		var me = this;
		return [
			/*
			{
				field : 'blankcol',
				title : '',
				content : function(item){
					return '';
				},
				width : 40
			},
			*/
			{
				field : 'recmshowword',
				title : '<span class="quicksetup_infotree_firstcolblank">关键词</span>',
				content : function(item){
					return '<div class="quicksetup_infotree_firstcolblank">' + baidu.encodeHTML(item.recmshowword) + '</div>';
				},
				width : 310,
				stable : true
			},
			{
				field : 'recmbid',
				title : '<span class="ui_bubble" bubblesource="quickSetupIinfo" title="出价" bubblecontent="这是参考你的同类客户所设定的出价">出价（元）</span>',
				content : me.getWordBidHtml,
				width : 150,
				stable : true
			},
			{
				field : 'recmwmatch',
				title : '匹配模式',
				content : me.getWordWmatchHtml,
				width : 150,
				stable : true
			},
			{
				field : 'operation',
				title : '操作',
				content : me.getWordOperationHtml(planindex, unitindex),
				width : 150,
				stable : true
			}
		]
	},
	
	getWordBidHtml : function(data){
		var html = [];
		html[html.length] = '<div class="edit_td"  winfoid="' + data.recmwinfoid + '">';
		html[html.length] =  '<span class="word_bid" id="InfoTreeWordBid' + data.recmwinfoid + '">' + baidu.number.fixed(data.recmbid) + '</span>';
		html[html.length] = '<a href="javascript:void(0);" class="quicksetup_infotree_editbut" action_type="editbid">修改</a>';
        html[html.length] = '</div>';
		return html.join("");
	},
	
	getWordWmatchHtml : function(data){
		var html = [];
		html[html.length] = '<div class="edit_td" winfoid="' + data.recmwinfoid + '">';
		html[html.length] = '<span id="InfoTreeWordWmatch' + data.recmwinfoid + '" wmatch="' + data.recmwmatch + '">' + MTYPE[data.recmwmatch] + '</span>';
		html[html.length] = '<a href="javascript:void(0);" class="quicksetup_infotree_editbut" action_type="editwmatch">修改</a>';
        html[html.length] = '</div>';
		return html.join("");
	},
	
	/**
	 * 因为删除行为涉及到上面的计划单元中的统计数字的改变，所以这里传入了planindex和unitindex
	 */
	getWordOperationHtml : function(planindex, unitindex){
		return function(data){
			var html = [];
			html[html.length] = '<div class="edit_td"  winfoid="' + data.recmwinfoid + '" index="' + planindex + ',' + unitindex + '">';
			html[html.length] = '<a href="javascript: void(0);" action_type="' + (data.recmisdel == 0 ? 'deleteword' : 'retriveword') + '">' + (data.recmisdel == 0 ? '删除' : '撤销删除') + '</a>';
	        html[html.length] = '</div>';
			return html.join("");
		};
	},
	
	bidValidate: function(bid){
		var me = this;
		return function(){
			if(bid == "null"){
				baidu.g("errorArea").innerHTML = nirvana.config.ERROR.KEYWORD.PRICE[606];
				return false;
			}
			return true;
		}
	},
	
	/**
	 * 从某个元素开始向上追寻到当前行的索引
	 * 注意使用时传入的元素一定要是表格内部的元素
	 */
	getTableLineIndex : function(dom){
		var parent = dom,
			isFound = false,
			row;
		while(parent && parent.tagName != "TR"){
			if(parent.tagName == "TD"){
				isFound = true;
				break;
			}
			parent = parent.parentNode;
		}
		if(isFound && baidu.dom.hasAttr(parent, 'row')){
			row = baidu.dom.getAttr(parent, 'row');
			return +row;
		}
		return null;
	},
	
	handleDeletedWords : function(planindex, unitindex, data){
		var me = this,
			item, planitem, unititem,
			i, planid, row, table, unitid;
		
		if(data.recmwordlist){
			for(i = 0; i < data.recmwordlist.length; i++){
				item = data.recmwordlist[i];
				if(item.recmisdel == 1){
					planitem = me.data.recmplanlist[planindex];
					planid = planitem.recmplanid;
					if(planitem){
						unititem = planitem.recmunitlist[unitindex];
						if(unititem){
							unitid = unititem.recmunitid;
							table = ui.util.get('InfoTreeWordTable' + unitid);
							if(table){
								row = table.getRow(i);
								row && baidu.addClass(row, 'quicksetup_infotree_wordlist_deletedline');
							}
						}
					}
				}
			}
		}
	},
	
	/**
	 * 删除关键词的展现处理
	 */
	deleteWord : function(planindex, unitindex, rowindex){
		var me = this,
			planitem, unititem,
			planid, unitid,
			table,
			row;
		planitem = me.data.recmplanlist[planindex];
		planid = planitem.recmplanid;
		if(planitem){
			unititem = planitem.recmunitlist[unitindex];
			if(unititem){
				unitid = unititem.recmunitid;
				table = ui.util.get('InfoTreeWordTable' + unitid);
				if(table){
					row = table.getRow(rowindex);
					row && baidu.addClass(row, 'quicksetup_infotree_wordlist_deletedline');
					//修改关键词数
					planitem.recmwordcount--;
					baidu.g('InfoTreePlanDesc' + planid)
						&& (baidu.g('InfoTreePlanDesc' + planid).innerHTML = ' 共' + planitem.recmunitcount + '个单元，' + planitem.recmwordcount + '个关键词 <a href="javascript:void 0;"  action_type="modifyplan" index="' + planindex + '" positiontype="myself">修改计划名</a>');
					
					unititem.recmwordcount--;
					baidu.g('InfoTreeUnitDesc' + unitid)
						&& (baidu.g('InfoTreeUnitDesc' + unitid).innerHTML = ' 共' + unititem.recmwordcount + '个关键词，单元出价' + unititem.recmunitbid + '元 <a href="javascript:void 0;" action_type="modifyunit" index="' + planindex + ',' +unitindex + '" positiontype="myself">修改单元名</a>');
					
					me.data.recmwordcount--;
					baidu.g('QuickSetupInfoTreeTotalWordCount').innerHTML = me.data.recmwordcount;
				}
			}
		}
	},
	/**
	 * 撤销删除关键词的展现处理
	 */
	retriveWord : function(planindex, unitindex, rowindex){
		var me = this,
			planitem, unititem,
			planid, unitid,
			table,
			row;
		planitem = me.data.recmplanlist[planindex];
		planid = planitem.recmplanid;
		if(planitem){
			unititem = planitem.recmunitlist[unitindex];
			if(unititem){
				unitid = unititem.recmunitid;
				table = ui.util.get('InfoTreeWordTable' + unitid);
				if(table){
					row = table.getRow(rowindex);
					row && baidu.removeClass(row, 'quicksetup_infotree_wordlist_deletedline');
					//修改关键词数
					planitem.recmwordcount++;
					baidu.g('InfoTreePlanDesc' + planid)
						&& (baidu.g('InfoTreePlanDesc' + planid).innerHTML = ' 共' + planitem.recmunitcount + '个单元，' + planitem.recmwordcount + '个关键词 <a href="javascript:void 0;"  action_type="modifyplan" index="' + planindex + '" positiontype="myself">修改计划名</a>');
					
					unititem.recmwordcount++;
					baidu.g('InfoTreeUnitDesc' + unitid)
						&& (baidu.g('InfoTreeUnitDesc' + unitid).innerHTML = ' 共' + unititem.recmwordcount + '个关键词，单元出价' + unititem.recmunitbid + '元 <a href="javascript:void 0;" action_type="modifyunit" index="' + planindex + ',' +unitindex + '" positiontype="myself">修改单元名</a>');
					
					me.data.recmwordcount++;
					baidu.g('QuickSetupInfoTreeTotalWordCount').innerHTML = me.data.recmwordcount;
				}
			}
		}
	},
	
	closeInlineEditor : function(){
		nirvana.inline.editArea.dispose();
		nirvana.inline.currentLayer.parentNode.removeChild(nirvana.inline.currentLayer);
	}
};


/**
 * 查看方案详情相关
 */

nirvana.quickSetupLib.step3.schemeDetail = {
	show : function(){
		var param = {},
			options = {};
		options = {
			id: 'QuickSetupStepExample',
			title: '方案详情',
			width: 450,
			maskLevel: 2,
			setuptype : nirvana.quickSetupLib.getParam('type'),
			actionPath: 'quicksetup/schemedetail',
			params: param,
			onclose: function(){
				ui.Bubble.hide();
			}
		};
		//打开浮出框
		nirvana.util.openSubActionDialog(options);
	}
};

nirvana.quickSetupLib.step3.schemeDetail.action = new er.Action({
	/**
	 * 视图模板名，或返回视图模板名的函数
	 */
	VIEW : 'quickSetupSchemeDetail',
	
	STATE_MAP : {
	},
	UI_PROP_MAP: {
	},
	CONTEXT_INITER_MAP : {
		init : function(callback){
			var me = this;
			callback();
		},
		initDetail : function(callback){
			var me = this,
				setuptype = me.arg.setuptype || nirvana.quickSetupLib.getParam('type') ||  'useracct';
			fbs.eos.getSchemeDetail({
				onSuccess : function(response){
					var data = response.data,
						wregion = data.wregion || '',
						wregionDesc,
						bgttype = data.bgttype || 0,
						budget = data.budget || '',
						plancyc = data.plancyc || '[]',
						tasktype = data.tasktype || (setuptype == 'useracct' ? 0 : 1);
					plancyc = baidu.json.parse(plancyc);
					if(wregion.length == 0){
						wregion = [];
					}
					else{
						wregion = wregion.split(',');
					}
					wregionDesc = nirvana.manage.region.abbRegion(wregion, "account");
					nirvana.quickSetupLib.setParam('wregion', wregion);
					nirvana.quickSetupLib.setParam('wregionDesc', wregionDesc);
					me.setContext('wregion', wregion);
					me.setContext('wregionDesc', wregionDesc);
					
					me.setContext('bgttype', bgttype);
					me.setContext('budget', budget);
					me.setContext('scheduleValue', plancyc);

					me.setContext('tasktype', tasktype);

					callback();
				},
				onFail : function(data){
					ajaxFailDialog();
					callback();
				}
			})
		}
	},
	
	onbeforeinitcontext: function(){
		var me = this;
	},
	
	/**
	 * refresh后执行
	 */
	onafterrepaint : function() {
		var me = this;
	},

	/**
	 * 第一次render后执行后最后会触发事件
	 */
	onafterrender : function() {
		var me = this,
			controlMap = me._controlMap,
			target,
			wregionDesc,
			//setuptype = me.arg.setuptype || nirvana.quickSetupLib.getParam('type') ||  'useracct',
			bgttype = me.getContext('bgttype'),
			budget = me.getContext('budget'),
			plancyc = me.getContext('scheduleValue'),
			tasktype = me.getContext('tasktype'),
			setuptype = (tasktype == 0 ? 'useracct' : 'planinfo');

		if(setuptype == 'useracct'){
			baidu.g('QuickSetupDetailBName').innerHTML = '账户预算';
			baidu.g('QuickSetupDetailWName').innerHTML = '账户推广地域';
		}
		else{
			baidu.g('QuickSetupDetailBName').innerHTML = '全部计划预算';
			baidu.g('QuickSetupDetailWName').innerHTML = '全部计划推广地域';
			ui.util.get('QuickSetupBudgetWeekly').hide();
			if(bgttype == 2){
				bgttype = 0;
			}
			baidu.hide('QuickSetupBudgetHelpWeekly');
		}


		// 处理预算
		switch(bgttype){
			case 0:
				ui.util.get('QuickSetupBudgetNolimit').setChecked(true);
				baidu.g('QuickSetupCurBgtValue').value = '不限定预算';
				baidu.g('QuickSetupCurBgtValue').disabled = true;
				break;
			case 1:
				ui.util.get('QuickSetupBudgetDaily').setChecked(true);
				baidu.g('QuickSetupCurBgtValue').value = budget;
				baidu.g('QuickSetupCurBgtValue').disabled = false;
				break;
			case 2:
				ui.util.get('QuickSetupBudgetWeekly').setChecked(true);
				baidu.g('QuickSetupCurBgtValue').value = budget;
				baidu.g('QuickSetupCurBgtValue').disabled = false;
				break;
		}


		

		// 处理推广地域
		if(!nirvana.env.AUTH.region){
			// 没有权限修改，整体隐藏不见
			baidu.g('QuickSetupDetailWregion').innerHTML = '';
			baidu.hide('QuickSetupDetailWregion');
		}
		else{
			target = baidu.g('QuickSetupRegionInfo');
			wregionDesc = me.getContext('wregionDesc');
			if(target){
				if(!wregionDesc){
					me.onclose && me.onclose();
				}
				else{
					target.innerHTML = wregionDesc.word;
					target.setAttribute('title', wregionDesc.title);
				}
			}
		}
		
		// 预算相关事件绑定
		ui.util.get('QuickSetupBudgetDaily').onclick = function(){
			baidu.g('QuickSetupCurBgtValue').value = '';
			baidu.g('QuickSetupCurBgtValue').disabled = false;
			me.setContext('bgttype', 1);
		};
		ui.util.get('QuickSetupBudgetWeekly').onclick = function(){
			baidu.g('QuickSetupCurBgtValue').value = '';
			baidu.g('QuickSetupCurBgtValue').disabled = false;
			me.setContext('bgttype', 2);
		};

		ui.util.get('QuickSetupBudgetNolimit').onclick = function(){
			baidu.g('QuickSetupCurBgtValue').value = '不限定预算';
			baidu.g('QuickSetupCurBgtValue').disabled = true;
			me.setContext('bgttype', 0);
		};
		
		// 推广地域相关事件绑定
		baidu.g('QuickSetupModWregion') && (baidu.g('QuickSetupModWregion').onclick = function(){
			me.doModWregion();
		});

		if(plancyc && plancyc.length > 0){
			baidu.g('QuickSetupCurrTimeScheme').innerHTML = '自定义';
		}
		// 推广时段相关事件绑定
		baidu.g('QuickSetupModTimeScheme') && (baidu.g('QuickSetupModTimeScheme').onclick = function(){
			me.doModTimeScheme();
		});

		//确定
		controlMap.SchemeDetailButtonOK.onclick = function(){
			var pbgttype = me.getContext('bgttype'),
				pwregion = me.getContext('wregion') || [],
				pplancyc = me.getContext('scheduleValue') || [];
			var params = {
				bgttype : pbgttype,
				wregion : pwregion.join(),
				plancyc : pplancyc.length > 0 ? baidu.json.stringify(pplancyc) : ""
			};

			me.clearWarn();

			if(+params.bgttype > 0){
				params.bgtvalue = baidu.g('QuickSetupCurBgtValue').value;
			}

			/*
			if(!nirvana.env.AUTH.region){
				params.wregion = '';
			}
			*/

			params.onSuccess = function(response){
				me.onclose();
			};
			params.onFail = function(data){
                /**
                 * status=300 部分成功 部分失败，单独处理
                 */
                if(data.status == 300){
                    return;
                }

				var errorCode;
				var error = fbs.util.fetchOneError(data);
				if (error) {
					for (var item in error) {
						errorCode = error[item].code;
					}
				}
				else if(data.errorCode) {
					errorCode = data.errorCode.code
				}
                
                switch(errorCode){
                	// 账户预算过小
					case 307:
					// 账户预算过大
					case 308:
					// 预算必须为数字
					case 350:
					// 只能保留两位小数
					case 351:
					//周预算过小
					case 316:
					//周预算过大
					case 317:
						if (baidu.g('QuickSetupBudgetExcept')) {
							baidu.g('QuickSetupBudgetExcept').innerHTML = nirvana.config.ERROR.ACCOUNT.BUDGET[errorCode];
							baidu.removeClass('QuickSetupBudgetExcept', 'hide');
						}
						break;
					
					// 计划预算过小
					case 402:
					// 计划预算过大
					case 403:
					// 计划预算大于账户预算
					case 404:
						if (baidu.g('QuickSetupBudgetExcept')) {
							baidu.g('QuickSetupBudgetExcept').innerHTML = nirvana.config.ERROR.PLAN.BUDGET[errorCode];
							baidu.removeClass('QuickSetupBudgetExcept', 'hide');
						}
						break;
                    default:
                    	ajaxFailDialog();
                }
			};

			fbs.eos.modSchemeDetail(params);
		};
		
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
		
		//初始化Bubble
		ui.Bubble.init();
	},
	
	/**
	 * 完成视图更新后最后会触发事件
	 */
	onentercomplete : function() {
	},

	clearWarn : function(){
		var me = this;
		if(baidu.g('QuickSetupBudgetExcept')){
			baidu.g('QuickSetupBudgetExcept').innerHTML = '';
			baidu.removeClass('QuickSetupBudgetExcept', 'hide');
		}
	},

	doModWregion : function(){
		var me = this,
			param = {},
			options = {};
		
		options = {
			id : 'QuickSetupStep3Region',
			title : '请选择你要进行推广的地域',
			width : 440,
			actionPath : 'quicksetup/step1region',
			params : {
				type:"account",
				step : 3,
				wregion:me.getContext("wregion") || nirvana.quickSetupLib.getParam('wregion') || []
			},
			unresize : true,
			top : (ui.util.get('QuickSetup').getDOM().style.top.replace('px', '') - 0 + 100),
			maskLevel: 3,
			onclose : function(){
				//me.setContext("wregion", nirvana.quicksetup.params.wregion);
				nirvana.quickSetupLib.refreshWregion(me);
			}
		};
		
		//打开浮出框
		nirvana.util.openSubActionDialog(options);
	},

	doModTimeScheme : function(){
		var me = this;
		
		nirvana.quickSetupLib.step3.planSchedule.open(me);
	}

});


nirvana.quickSetupLib.step3.planSchedule = {
	open : function(action){
        // Deleted by Wu Huiyao
		/*var me = action,
			param = {},
			options = {};
		options = {
			id : 'QuickSetupStep3PlanSchedule',
			title : '修改推广时段',
			width : 660,
			actionPath : 'quicksetup/step3planschedule',
			params : {
				//type:"account",
				scheduleValue : me.getContext("scheduleValue") || nirvana.quickSetupLib.getParam('scheduleValue') || ''
			},
			maskLevel: 3,
			onclose : function(){
				//me.setContext("wregion", nirvana.quicksetup.params.wregion);
				nirvana.quickSetupLib.refreshPlanSchedule(me);
			}
		};
		//打开浮出框
		nirvana.util.openSubActionDialog(options);*/

        // 新的时段修改: Added by Wu Huiyao
        var me = action,
            dlg = new nirvana.ScheduleDlg();
        // 注册提交时段修改的事件回调
        dlg.onSubmit = function(data) {
            nirvana.quickSetupLib.setParam('scheduleValue', data.newValue);
            nirvana.quickSetupLib.refreshPlanSchedule(me);
            // 直接关闭时段修改对话框
            this.close();
        };
        dlg.show({
            dlgOption: {
                id: 'QuickSetupStep3PlanSchedule',
                maskLevel: 3
            },
            scheduleValue: me.getContext("scheduleValue") ||
                nirvana.quickSetupLib.getParam('scheduleValue') || '[]'
        });
	}
}
// Deleted by Wu Huiyao
//nirvana.quickSetupLib.step3.planSchedule.action = new er.Action({
//
//    VIEW: 'planSchedule',
//
//    IGNORE_STATE : true,
//
//    UI_PROP_MAP : {
//
//        planSchedule : {
//            type : 'Schedule',
//            value : '*planScheduleValue',
//            suggestAsChosen : '0',
//            //added by wuhuiyao
//            showRecommed: '*showRecommed'
//        }
//    },
//
//    CONTEXT_INITER_MAP : {
//
//		/**
//		 * 效果突降新增提示区域
//		 * @param {Object} callback
//		 */
//		tip : function(callback) {
//			var me = this;
//            me.setContext('widget_class', 'hide');
//
//			callback();
//		},
//
//        schedule : function (callback) {
//            var me =this;
//
//            // added by wuhuiyao
//            me.setContext('showRecommed', this.arg.hasRec);
//
//			if (me.arg.scheduleValue) {
//				me.setScheduleContext(me.arg.scheduleValue);
//			}
//			callback();
//        }
//    },
//
//    onafterrender : function(){
//        var me = this,
//            controlMap = me._controlMap;
//
//        controlMap.submitPlanSchedule.onclick = me.getSubmitHandler();
//
//        controlMap.cancelPlanSchedule.onclick = me.getCancelHandler();
//
//    },
//
//    onentercomplete : function(){
//		// Dialog二次定位标识
//		nirvana.subaction.isDone = true;
//		// deleted by wuhuiyao
//		/*if(this.arg.hasRec){
//			//显示推荐时段
//			baidu.show(baidu.q('ui_schedule_sel_wttime')[0]);
//			baidu.show(baidu.q('ui_schedule_sel_wt_egtext')[0]);
//		}else{
//			//隐藏推荐时段
//			baidu.hide(baidu.q('ui_schedule_sel_wttime')[0]);
//			baidu.hide(baidu.q('ui_schedule_sel_wt_egtext')[0]);
//		}*/
//
//
//    },
//    //设置推广时段context
//    setScheduleContext : function (value,suggestcyc) {
//        var me = this,
//            i2, j, j2, len2, myValue = [],
//            subItem, temp;
//
//        for (i2 = 0; i2 < 7; i2++) {
//            temp = [];
//            myValue.push(temp);
//            for (j2 = 0; j2 < 24; j2++) {
//                temp.push(1);
//            }
//        }
//
//        for (j = 0, len2 = value.length; j < len2; j++) {
//            subItem = value[j];
//            subItem[0] = subItem[0] + '';
//            subItem[1] = subItem[1] + '';
//            temp = parseInt(subItem[0].substr(0, 1), 10) - 1;
//            i2 = parseInt(subItem[0].substr(1), 10);
//            j2 = parseInt(subItem[1].substr(1), 10);
//            for (; i2 < j2; i2++) {
//                myValue[temp][i2] = 0;
//            }
//        }
//		if (suggestcyc) {
//			for (j = 0, len2 = suggestcyc.length; j < len2; j++) {
//				subItem = suggestcyc[j];
//				subItem[0] = subItem[0] + '';
//				subItem[1] = subItem[1] + '';
//				temp = parseInt(subItem[0].substr(0, 1), 10) - 1;
//				i2 = parseInt(subItem[0].substr(1), 10);
//				j2 = parseInt(subItem[1].substr(1), 10);
//				for (; i2 < j2; i2++) {
//					myValue[temp][i2] = 2;
//				}
//			}
//		}
//
//		// 保存原始数据，用于监控
//        me.setContext('planScheduleOriValue', value);
//        me.setContext('planScheduleValue', myValue);
//
//    },
//
//    getSubmitHandler : function () {
//        var me = this;
//        return function () {
//            me.submitPlanSchedule();
//        }
//    },
//    getCancelHandler : function () {
//        var me = this;
//
//        return function () {
//            me.onclose();
//        }
//
//    },
//    submitPlanSchedule : function(){
//        var me = this,
//            controlMap = me._controlMap,
//            value = controlMap.planSchedule.getParamObj(),
//			old_value = me.getContext('planScheduleOriValue');
//
//		nirvana.quickSetupLib.setParam('scheduleValue', value);
//		me.onclose();
//
//    }
//});
