/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/corewords/modWords.js 
 * desc: 修改重点词
 * author: Leo Wang(wangkemiao@baidu.com)
 * date: $Date: 2012/08/01 $
 */

// 注册
nirvana.aoPkgControl.modules = new er.Module({
	config: {
		'action': [{
			path: 'aoPackage/corewords/modCorewords',
			action: 'nirvana.CoreWordsPackage.modCoreWords.action'
		}]
	}
});

nirvana.CoreWordsPackage.modCoreWords = {
	dialog : null,
	data : null,
	addedWordIdList : [],
	wordlist2add : [],
	isModed : false,
	reset : function(){
		this.data = null;
		this.addedWordIdList = [];
		this.wordlist2add = [];
//		this.isModed = false; // del by wuhuiyao
	},
	// origWordIdList : [],
	init : function(opts){
		var me = this,
			opts = opts || {},
			options;

        // added by wuhuiyao
        this._removeWinfoids = [];
        this._addWinfoids = [];
        this._needSync = false;
        this.isModed = false;

		// 显示浮出层
		
		options = {
			id : 'modCoreKeyword',
			actionPath : 'aoPackage/corewords/modCorewords',
			title : '关注新重点词',
			width : 800,
			maskLevel : nirvana.aoPkgWidgetCommon.getMaskLevel(),
			params : {

			},
			onclose : function() {
				ui.util.get('CoreWordsTable') && ui.util.get('CoreWordsTable').dispose();
				if(!me.isModed){
					return;
				}

                if ((me._removeWinfoids && me._removeWinfoids.length)
                    || (me._addWinfoids && me._addWinfoids.length)
                    || me._needSync
                    ) {
                    opts.onclose && opts.onclose(me._removeWinfoids, me._addWinfoids, me._needSync);
                }
			}
		};

		me.dialog = nirvana.util.openSubActionDialog(options);
		me.isModed = false;
	},
	action : new er.Action({
		VIEW: 'aoPkgModCoreword',
		/**
	    * 子action不支持STATE_MAP
	    */
		STATE_MAP: {},
		UI_PROP_MAP: {
		},
		CONTEXT_INITER_MAP: {
		},
		onafterrender: function(){
			var me = this;
			//var searchtxt = new fc.ui.Input(baidu.g('AoPkgModCWordSearchTxt'));
			fc.ui.init(baidu.g('AoPkgModCWordSearch'));
			var searchtxt = fc.ui.get('AoPkgModCWordSearchTxt');
			searchtxt.placeholder('查找关键词');
		},

		onafterrepaint: function(){},

		onentercomplete: function(){
			var me = this,
				lib = nirvana.CoreWordsPackage.modCoreWords;

			// 渲染展现基本信息
			baidu.g('AoPkgModCWordUser') && (baidu.g('AoPkgModCWordUser').innerHTML = nirvana.env.USER_NAME);
			// 获取并展现重点词信息
			lib.loadCoreWords();
			// 初始化右侧信息
			lib.infoList.init(me);

			me.bindHandlers();

			// Dialog二次定位标识
			nirvana.subaction.isDone = true;
		},
		bindHandlers : function(){
			var me = this,
				lib = nirvana.CoreWordsPackage.modCoreWords;
			baidu.on('AoPkgModCWordChosenList', 'click', function(e){
				var event = e || window.event,
					target = event.target || event.srcElement,
					action, index, p,
					data;
				if(baidu.dom.getAttr(target, 'action_type') == 'delCoreWord'){
					p = target.parentNode;
					if(p && p.tagName.toLowerCase() == 'div'){
						index = +baidu.dom.getAttr(p, 'index');
						nirvana.CoreWordsPackage.modCoreWords.delCoreWord(index);
					}
					baidu.event.stop(e);
				}
			});
			ui.util.get('AoPkgModCWordSearchBtn').onclick = function(){
//				lib.clearError();
				var query = baidu.trim(fc.ui.get('AoPkgModCWordSearchTxt').value());
				if(!query || query.length == 0){
					return;
				}
				lib.infoList.currQuery = query;
				lib.infoList.loadData('search');
			};
			ui.util.get('AoPkgModCWordSaveBtn').onclick = function(){
				var addIdList = lib.wordlist2add;
				if(addIdList.length > 0){
					fbs.nikon.addCoreWords({
						winfoids : addIdList,
						onSuccess : function(res){
							var rdata = res.data,
								aostatus = rdata.aostatus,
								errorcodes = rdata.errorcodes,
								errorcorewords = rdata.errorcorewords;
                            // Del by Wu Huiyao: 这个逻辑不会出现
//							/**
//							 * status=300 部分成功 部分失败，单独处理
//							 */
//							if(res.status == 300){
//								return;
//							}

                            /**** added by Wuhuiyao */
                            var errorlist = [];
                            for(var m = 0; m < errorcorewords.length; m++){
                                errorlist.push(+errorcorewords[m].winfoid);
                            }
                            for(var n = lib.data.length - 1; n >= 0; n--){
                                if(baidu.array.indexOf(errorlist, +lib.data[n].winfoid) > -1){
                                    lib.data.splice(n, 1);
                                    lib.addedWordIdList.splice(n, 1);
                                }
                            }
                            for(var n = lib.wordlist2add.length - 1; n >= 0; n--){
                                if(baidu.array.indexOf(errorlist, +lib.wordlist2add[n]) > -1){
                                    lib.wordlist2add.splice(n, 1);
                                }
                            }

                            if (!(errorcodes & 4)) {
                                // 没有达到上限
                                // 监控
                                nirvana.AoPkgMonitor.addCorewordByModifyDlg(lib.wordlist2add);
                                /*nirvana.aoPkgControl.logCenter.extend({
                                 winfoid : lib.wordlist2add
                                 }).sendAs('nikon_package_coreword_add');*/

                                // 缓存添加的重点词信息
                                lib.updateModifyInfo(lib.wordlist2add, false);
                            }
                            // 超过重点词上限（全部都不会被添加）或出错
                            if (errorcodes != 0) {
                                // 清空也有问题（弹出的问题框：提示出错，如果不点确定，
                                // 就不会刷新reload，这时取消刚刚加入没成功的重点词，却会
                                // 跟已经加入词的取消的提示一样），
                                // 不清空也有问题（下次再提交又把成功的有提交了），为了减少
                                // 改动代价，那就维持现状，下次重写吧
                                lib.wordlist2add = [];
                                lib.renderCoreWordList();
                                lib.infoList.refreshList();
                                lib.isModed = true;
                                // 处理失败
                                lib.displayError({
                                    errorCode : errorcodes,
                                    errorWords : errorcorewords,
                                    isBatch : true
                                });
                                // 标识当前展现的数据已经不同步
                                lib._needSync = errorcorewords.length > 0;
                            } else {
                                // 触发onclose事件
                                me.onclose();
                            }
                            /**** added end */

							// 监控
                            // nirvana.AoPkgMonitor.addCorewordByModifyDlg(addIdList);

			                /*nirvana.aoPkgControl.logCenter.extend({
			                    winfoid : addIdList
			                }).sendAs('nikon_package_coreword_add');*/
                            // Del by Wu Huiyao: 无需通过aostatus来判断
//							switch(+aostatus){
//								case 0: // 正常
//									me.onclose();
//									break;
//								case 100: // 参数错误
//								default:
//									ajaxFailDialog();
//									break;
//							}
						},
						onFail : function(res){
//							var rdata = res.data,
//								status = res.status,
//								errorcodes = rdata.errorcodes,
//								errorcorewords = rdata.errorcorewords;
//
//							switch(+res.status){
//								case 400:
//									lib.wordlist2add = [];
//									// 处理失败
//									lib.displayError({
//										errorCode : errorcodes,
//										errorWords : errorcorewords,
//										isBatch : true
//									});
//									break;
//								default:
                            ajaxFailDialog();
//							}
						}
					});
				}
				else{
					me.onclose();
				}
			};
			ui.util.get('AoPkgModCWordCancelBtn').onclick = function(){
				lib.reset();
				me.onclose();
			};

			baidu.on('AoPkgModCWordInfoGuide', 'click', function(e){
				var event = e || window.event,
					target = event.target || event.srcElement,
					action, index, p,
					data;

				p = target;
				while(p.tagName != 'A' && baidu.getAttr(p, 'id') != 'AoPkgModCWordInfoList'){
					p = p.parentNode;
				}
				target = p;
				if(target.tagName.toLowerCase() == 'a'){
					action = baidu.dom.getAttr(target, 'action_type');
					switch(action){
						case 'showPlan':
							lib.infoList.breadcrumb.data.plan = null;
							lib.infoList.breadcrumb.data.unit = null;
							lib.infoList.loadData('plan');
							break;
						case 'showUnit':
							lib.infoList.breadcrumb.data.unit = null;
							lib.infoList.loadData('unit', lib.infoList.breadcrumb.data.plan.planid);
							break;
						case 'cancelSearch':
							//me.breadcrumb.data.plan = null;
							//me.breadcrumb.data.unit = null;
							fc.ui.get('AoPkgModCWordSearchTxt').value('');
							lib.infoList.currQuery = null;
							var cplanid = lib.infoList.breadcrumb.data.plan ? lib.infoList.breadcrumb.data.plan.planid : undefined;
							var cunitid = lib.infoList.breadcrumb.data.unit ? lib.infoList.breadcrumb.data.unit.unitid : undefined;
							lib.infoList.loadData(lib.infoList.lastLevel, cplanid, cunitid);
							break;
						default:
							break;
					}
					baidu.event.stop(e);
				}
			});
			baidu.on('AoPkgModCWordInfoList', 'click', function(e){
				var event = e || window.event,
					target = event.target || event.srcElement,
					action, index, p,
					data;

				p = target;
				while(p.tagName != 'A' && baidu.getAttr(p, 'id') != 'AoPkgModCWordInfoList'){
					p = p.parentNode;
				}
				target = p;
				if(target.tagName.toLowerCase() == 'a'){
					action = baidu.dom.getAttr(target, 'action_type');
					switch(action){
						case 'showUnit':
							index = +baidu.dom.getAttr(target, 'index');
							lib.infoList.breadcrumb.data.plan = lib.infoList.currData[index];
							lib.infoList.breadcrumb.data.unit = null;
							lib.infoList.loadData('unit', lib.infoList.currData[index].planid);
							break;
						case 'showWord':
							index = +baidu.dom.getAttr(target, 'index');
							lib.infoList.breadcrumb.data.unit = lib.infoList.currData[index];
							lib.infoList.loadData('word', lib.infoList.breadcrumb.data.plan.planid, lib.infoList.currData[index].unitid);
							break;
						case 'addCoreWord':
							index = +baidu.dom.getAttr(target, 'index');
							lib.addCoreWord(lib.infoList.currData[index]);
							break;
						case 'addAllCoreWords':
							lib.addCoreWordBatch(lib.infoList.currData);
							break;
						default:
							break;
					}
					baidu.event.stop(e);
				}
			});
		}
	}),

	/**
	 * 获取全部重点词信息，保存至me.data中，并调用渲染词列表
	 */
	loadCoreWords : function(callback){
		var me = this;
		me.reset();
		fbs.nikon.getCoreWords({
			onSuccess : function(res){
				var data = res.data,
					aostatus = data.aostatus,
					list = data.corewords;
				if(aostatus == 0){
					//baidu.g('AoPkgModCWordChosen') && (baidu.g('AoPkgModCWordChosen').innerHTML = list.length);
					me.data = list;
					me.addedWordIdList = [];
                    // 重点词上限，新增by Huiyao 2013.4.9
                    me.corewordmaxsize = data.corewordmaxsize;
                    // TODO 后续对照组下掉，这个判断可以去掉
                    if (!nirvana.auth.isCorewordExp()) {
                        var tipEle = $$('.coreword-limit-tip')[0];
                        $$('.num', tipEle)[0].innerHTML = me.corewordmaxsize;
                        baidu.removeClass(tipEle, 'hide');
                    }
					// me.origWordIdList = [];
					for(var i = 0; i < list.length; i++){
						me.addedWordIdList.push(+list[i].winfoid);
					}
					me.renderCoreWordList();
					callback && callback();
				}
				else{
					ajaxFailDialog();
				}
				
			},
			onFail : function(res){
				ajaxFailDialog();
				callback && callback();
			}
		});
	},

	/**
	 * 渲染重点词列表
	 */
	renderCoreWordList : function(){
		var me = this,
			data = me.data,
			itemData,
			i, l,
			html = '',
			_tpl = '<div class="coreWord_item" index="{index}">'
				 + '	<h2 title="{wordtitle}">{showword}</h2>'
				 + '	<ul class="coreWord_info">'
				 + '		<li>推广计划：<span title="{plantitle}">{planname}</span></li>'
				 + '		<li>推广单元：<span title="{unittitle}">{unitname}</span></li>'
				 + '	</ul>'
				 + '	<a href="#" action_type="delCoreWord">取消</a>'
				 + '</div>';

		baidu.g('AoPkgModCWordChosen') && (baidu.g('AoPkgModCWordChosen').innerHTML = data.length)

		if(!data || data.length == 0){
			baidu.g('AoPkgModCWordChosenList') && (baidu.g('AoPkgModCWordChosenList').innerHTML = '<div class="nodata">当前没有重点词</div>');
			return;
		}
		//me.addedWordIdList = [];
		for(i = 0, l = data.length; i < l; i++){
			//me.addedWordIdList.push(data[i].winfoid);
			itemData = {
				index : i,
				showword : getCutString(data[i].showword, 30, '..'),
				wordtitle : baidu.encodeHTML(data[i].showword),
				planname : getCutString(data[i].planname, 26, '..'),
				plantitle : baidu.encodeHTML(data[i].planname),
				unitname : getCutString(data[i].unitname, 26, '..'),
				unittitle : baidu.encodeHTML(data[i].unitname)
			};
			html += lib.tpl.parseTpl(itemData, _tpl);
			if(i == 0){
				html = html.replace(/coreWord_item/g, 'coreWord_item noborder');
			}
		}
		baidu.g('AoPkgModCWordChosenList') && (baidu.g('AoPkgModCWordChosenList').innerHTML = html);
	},

	/**
	 * 删除重点词
	 */
	delCoreWord : function(index){
		var me = this,
			data = me.data || [],
			pos, index,
			item, winfoid;
			
//		me.clearError();

		if(data && data[index]){
			item = data[index];
			winfoid = +item.winfoid;

			pos = baidu.array.indexOf(me.wordlist2add, winfoid);
			index = baidu.array.indexOf(me.addedWordIdList, winfoid);
			// 如果是已经添加到后端的关键词，则直接通讯删除
			if(pos == -1){
				if(index > -1){
					ui.Dialog.confirm({
						title: '取消重点词',
						content: '您确定要取消该关键词么？本操作将会从重点词排名包中移除该关键词。',
						onok: function() {
							fbs.nikon.delCoreWords({
								winfoids : [winfoid],
								onSuccess : function(res){
									var rdata = res.data,
										aostatus = rdata.aostatus;
									switch(+aostatus){
										case 0:
//											nirvana.aoPkgControl.logCenter.extend({
//												winfoid : [winfoid]
//											}).sendAs('nikon_package_coreword_delete');
                                            // 发送监控
                                            nirvana.AoPkgMonitor.delCorewordByModifyDlg([winfoid]);
                                            // 从修改的重点词的缓存信息里移除
                                            nirvana.aopkg.CorewordStorage.remove([winfoid]);
                                            // 缓存移除的重点词
                                            me.updateModifyInfo([winfoid], true);

											data.splice(index, 1);
											me.addedWordIdList.splice(index, 1);
											me.data = data;
											me.renderCoreWordList();
											me.infoList.refreshList();
											me.isModed = true;
											break;
										default:
											ajaxFailDialog();
									}
								},
								onFail : function(res){
									ajaxFailDialog();
								}
							});
						},
						oncancel : function() {
							;
						}
					});
				}
			}
			else{
				data.splice(index, 1);
				me.addedWordIdList.splice(index, 1);
				me.wordlist2add.splice(pos, 1);
				me.data = data;
				me.renderCoreWordList();
				me.infoList.refreshList();
				me.isModed = true;
			}
		}
	},

    /**
     * 更新重点词的修改信息
     * @param {Array} winfoids 被移除或添加的重点词的winfoid数组
     * @param {boolean} isRemove 是否是移除操作
     * @author wuhuiyao
     */
    updateModifyInfo: function(winfoids, isRemove) {
        var me = this;
        var removeWinfoids = me._removeWinfoids || (me._removeWinfoids = []);
        var addWinfoids = me._addWinfoids || (me._addWinfoids = []);
        var idx;
        var updateWinfoids = isRemove ? removeWinfoids : addWinfoids;
        var clearWinfoids = isRemove ? addWinfoids : removeWinfoids;

        // 避免添加/移除的词同时出现在添加的集合和移除的集合里
        for (var i = 0, len = winfoids.length; i < len; i ++) {
            updateWinfoids.push(+ winfoids[i]);
            idx = baidu.array.indexOf(clearWinfoids, + winfoids[i]);
            if (idx != -1) {
                clearWinfoids.splice(idx, 1);
            }
        }
    },
	addCoreWord : function(item){
		var me = this,
			data = me.data || [],
			winfoid = +item.winfoid,
			index;

//		me.clearError();

        // 重点词升级新增上限 by Huiyao 2013.4.9
        var maxSize = me.corewordmaxsize || nirvana.aoPkgConfig.NUMBER.COREWORDSLIMIT;
		if(me.addedWordIdList.length + 1 > maxSize){
			/*ui.Dialog.alert({
				title: '数量超限',
				content: '重点词数量已达到上限，您只能添加' + nirvana.aoPkgConfig.NUMBER.COREWORDSLIMIT + '个重点词'
			});*/
            nirvana.corewordUtil.alertCorewordExceedLimit(maxSize);
			return;
		}

		index = baidu.array.indexOf(me.addedWordIdList, winfoid);
		if(index == -1){
			me.wordlist2add.push(winfoid);
			me.addedWordIdList.push(winfoid);
			data.push(item);
			me.data = data;
			me.renderCoreWordList();
			//me.infoList.refreshList();
			var target = $$('[data=' + item.winfoid + ']', baidu.g('AoPkgModCWordInfoList'));
			if(target && target.length > 0){
				target = target[0];
				var p = target.parentNode,
					html = target.innerHTML,
					title = baidu.getAttr(target, 'title');
				p.innerHTML = '<span class="leadicon">&lt; </span><span class="noadding" title="' + title + '">' + html + '</span>';

				var count = +baidu.g('CoreWords2AddCount').innerHTML;
				count--;
				baidu.g('CoreWords2AddCount').innerHTML = count;
			}
			me.isModed = true;
				
		}
	},
	clearAddedData: function(itemlist) {
		var me = this;
		var result = [];
		var index, winfoid;
		for(var i = 0, l = itemlist.length; i < l; i++) {
			winfoid = +itemlist[i].winfoid;
			index = baidu.array.indexOf(me.addedWordIdList, winfoid);
			if(index == -1){
				result.push(baidu.object.clone(itemlist[i]));
			}
		}
		return result;
	},
	addCoreWordBatch : function(itemlist){
		var me = this,
			data = me.data || [],
			i, l = itemlist.length,
			addList = [], addIdList = [],
			winfoid, item, index;

//		me.clearError();

		var itemlist2add = me.clearAddedData(itemlist);
		l = itemlist2add.length;

        // 重点词升级新增上限 by Huiyao 2013.4.9
        var maxSize = me.corewordmaxsize || nirvana.aoPkgConfig.NUMBER.COREWORDSLIMIT;
		if(me.addedWordIdList.length + l > maxSize){
			/*ui.Dialog.alert({
				title: '数量超限',
				content: '重点词数量已达到上限，您只能添加' + nirvana.aoPkgConfig.NUMBER.COREWORDSLIMIT + '个重点词'
			});*/
            nirvana.corewordUtil.alertCorewordExceedLimit(maxSize);
			return;
		}

		for(i = 0; i < l; i++){
			item = itemlist2add[i];
			winfoid = +item.winfoid;
			// index = baidu.array.indexOf(me.addedWordIdList, winfoid);
			// if(index == -1){
				me.wordlist2add.push(winfoid);
				me.addedWordIdList.push(winfoid);
				data.push(item);
			// }
		}
		me.data = data;
		me.renderCoreWordList();
		me.infoList.refreshList();
		me.isModed = true;
	},

	displayError : function(options){
		var me = this,
			errorCode = +options.errorCode;
//			errorWords = options.errorWords,
//			isBatch = options.isBatch || false,
//			target = baidu.g('AoPkgModCWordError');

//		target.innerHTML = '';

		if((errorCode & 4) > 0){
			/*ui.Dialog.alert({
				title: '数量超限',
				content: '重点词数量已达到上限，您只能添加' + nirvana.aoPkgConfig.NUMBER.COREWORDSLIMIT + '个重点词'
			});*/
            nirvana.corewordUtil.alertCorewordExceedLimit(me.corewordmaxsize);
		}
		else{
			/*
			baidu.removeClass(target, 'hide');
			if((errorCode & 1) > 0){
				target.innerHTML += '部分待添加关键词为已被删除的关键词';
			}
			if((errorCode & 2) > 0){
				target.innerHTML += (target.innerHTML.length > 0 ? '，' : '');
				target.innerHTML += '部分待添加关键词为已经是重点词的关键词';
			}
			target.innerHTML += (target.innerHTML.length > 0 ? ('，' + '该部分词已从列表中移除。') : '');
			*/
			ui.Dialog.alert({
				title: '重点词关注失败',
				content: '重点词关注失败，请重新选择。',
				onok : function(){
					me.loadCoreWords();
					me.infoList.loadData(me.infoList.currLevel, me.infoList.breadcrumb.data.plan.planid, me.infoList.breadcrumb.data.unit.unitid);
				}
			});
		}
	},
//	clearError : function(){
//		var me = this,
//			target = baidu.g('AoPkgModCWordError');
//		target.innerHTML = '';
//		baidu.addClass(target, 'hide');
//	},

	infoList : {
		/**
		 * 初始化信息列表
		 * 行为：列表项为计划内容
		 */
		target : 'AoPkgModCWordInfoList',
		currLevel : null,
		lastLevel : null,
		currData : null,
		currQuery : null,
		allowLevel : ['plan', 'unit', 'word', 'search'],
		action_type : { // 以当前level为key
			plan : 'showUnit',
			unit : 'showWord',
			word : 'addCoreWord',
			search : 'addCoreWord'
		},
		// breadcrumb_action_type : {
		// 	plan : 'showPlan',
		// 	unit : 'showUnit',
		// 	word : 'showWord',
		// 	search : 'cancelSearch'
		// },
		namekey : {
			plan : 'planname',
			unit : 'unitname',
			word : 'showword',
			search : 'showword'
		},

		init : function(action){
			var me = this;
			me.action = action;
			me.loadData('plan');
		},

		/**
		 * 获取数据并刷新渲染
		 */
		loadData : function(level, planid, unitid){
			var me = this,
				func, condition = null, query = me.currQuery, params;
			switch(level){
				case 'unit':
					func = fbs.unit.getNameList;
					condition = {
						planid : [planid]
					}
					break;
				case 'word':
					func = fbs.keyword.getList;
					condition = {
						//planid : [planid],
						unitid : [unitid]
					}
					break;
				case 'search': // search当前都是查询整账户的关键词，因此不处理面包屑轨迹条件
					func = fbs.keyword.getList;
					break;
				case 'plan':
				default:
					func = fbs.plan.getNameList;
					break;
			}
			params = {
				onSuccess: function(response){
					var data = response.data.listData,
					    len = data.length;
					
					if(me.currLevel != 'search'){
						me.lastLevel = me.currLevel;
					}

					me.currLevel = level;
					me.currData = data;
					me.refreshList();
				},
				
				onFail: function(response){
					ajaxFailDialog();
				}
			};
			if(condition){
				params.condition = condition;
			}
			if(level === 'search' && query){
				params.showword = query;
				params.limit = 1000;
                nirvana.aoPkgControl.logCenter.extend({
                    showword : query
                }).sendAs('nikon_package_coreword_search');
			}
			if(level == 'search' || level == 'word'){
				var d = new Date(nirvana.env.SERVER_TIME * 1000);
				d.setDate(d.getDate() - 1); // 获取昨天
				params.starttime = baidu.date.format(d, 'yyyy-MM-dd');
				params.endtime = baidu.date.format(d, 'yyyy-MM-dd');
			}
			func(params);
		},

		/**
		 * 面包屑控制
		 */
		breadcrumb : {
			target : 'AoPkgModCWordInfoGuide',
			currLevel : null,
			lastLevel : null,
			data : {
				plan : null,
				unit : null
			},
			/**
			 * 更新面包屑导航
			 */
			update : function(){
				var me = this,
					lib = nirvana.CoreWordsPackage.modCoreWords.infoList,
					html;

				switch(lib.currLevel){
					case 'plan':
						html = '计划列表';
						break;
					case 'unit':
						html = '<a href="#" action_type="showPlan">计划列表</a> <span>&gt;&gt;</span> 计划 : ' + me.data.plan.planname;
						break;
					case 'word':
						html = '<a href="#" action_type="showPlan">计划列表</a> <span>&gt;&gt;</span> '
							 + '计划 : <a href="#" action_type="showUnit">' + me.data.plan.planname + '</a> <span>&gt;&gt;</span> '
							 + '单元 : ' + me.data.unit.unitname;
						break;
					case 'search':
						html = '<a href="#" action_type="cancelSearch">取消</a>';
						break;
				}
				me.lastLevel = lib.lastLevel;
				me.currLevel = lib.currLevel;
				baidu.g(me.target).innerHTML = html;
			}
		},

		/**
		 * 刷新渲染列表
		 */
		refreshList : function(){
			var me = this,
				addedList = nirvana.CoreWordsPackage.modCoreWords.addedWordIdList,
				level = me.currLevel,
				data = me.currData,
				html = '',
				_tpl = '<li><a href="#" index="{index}" title="{title}" action_type="{action_type}">{name}</a></li>',
				_wordTpl = '',
				_addedTpl = '',
				i, l, itemData;

			if(baidu.array.indexOf(me.allowLevel, level) > -1){
				l = data.length;
				if(l > 0){
					if(level == 'word' || level == 'search'){
						fc.ui.dispose(baidu.g('AoPkgModCWordInfoList'));
						baidu.g(me.target).innerHTML = '<div id="CoreWordsContainer"></div>';

						ui.util.get('CoreWordsTable') && ui.util.get('CoreWordsTable').dispose();
						
						var table = ui.util.create('Table', {
							id : 'CoreWordsTable',
							datasource : data,
							fields : [
								{
									title: '<a href="#" action_type="addAllCoreWords">&lt;&lt;当页关注（<span id="CoreWords2AddCount"></span>）个</a>',
									content: function(item, index){
										var title = baidu.encodeHTML(item.showword),
											showinfo = getCutString(item.showword, 19, '..'),
											result;
										if(baidu.array.indexOf(addedList, +item.winfoid) > -1){
											result = '<span class="leadicon">&lt; </span><span class="noadding">' + showinfo + '</span>';
											l--;
										}
										else{
											result = '<span class="leadicon">&lt; </span><a href="#" data="' + item.winfoid + '" index="'+ index +'" action_type="addCoreWord" title="' + title + '">' + showinfo + '</a>';
										}
										if(level == 'search'){
											attrValues = {
												title : item.showword,
												planName : item.planname,
												unitName : item.unitname
											};
											result += '<div _ui="id:modworddetailbubble_' + item.winfoid + ';type:Bubble;source:corewordModTable;" ' + fc.expando + '="' + fc.data.add(attrValues) + '"></div>';
										}
										return result;
									},
									width: 165,
									stable: true
								},
								qStar.getTableField(me.action, {
									align: 'right',
									width: 55,
									stable: true
								}),
								{
									title: '昨日点击',
									content: function(item){
										var data = item.clks;
										if (data == ''){//SB doris
											return STATISTICS_NODATA;
										}
										if (data == '-') {
											return data;
										}
										return parseNumber(data);
									},
									align: 'right',
									width: 70,
									stable: true
								},
								{
									title: '昨日消费',
									content: function(item){
										if (item.paysum == ''){//SB doris
											return fixed(STATISTICS_NODATA);
										}
										return fixed(item.paysum);
									},
									align: 'right',
									width: 70,
									stable: true
								},
								{
									title: '平均点击价格',
									content: function(item){
										if (item.avgprice == ''){//SB doris
											return fixed(STATISTICS_NODATA);
										}
										return fixed(item.avgprice);
									},
									align: 'right',
									stable: true
								}
							]
						}, baidu.g('CoreWordsContainer'));
						baidu.g('CoreWords2AddCount').innerHTML = l;
						//baidu.g('ctrltableCoreWordsTabletitleCell0').firstChild.firstChild.innerHTML = '<a href="#" action_type="addAllCoreWords">&lt;&lt;当页添加（<span id="CoreWords2AddCount"></span>）个</a>';
					}
					else{
						for(i = 0; i < l; i++){
							itemData = {
								index : i,
								name : getCutString(data[i][me.namekey[level]], 30, '..'),
								title : baidu.encodeHTML(data[i][me.namekey[level]]),
								action_type : me.action_type[level]
							};
							html += lib.tpl.parseTpl(itemData, _tpl);
						}
						html = '<ul>' + html + '</ul>';
						baidu.g(me.target).innerHTML = html;
					}
					
				}
				else{
					baidu.g(me.target).innerHTML = '<div class="nodata">对不起，数据为空！</div>';
				}
			}
			fc.ui.init(baidu.g('AoPkgModCWordInfoList'));
			me.breadcrumb.update();
		}
	}
};