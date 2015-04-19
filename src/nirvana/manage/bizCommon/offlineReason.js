/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    manage/offlineReason.js
 * desc:    各层级离线理由
 * author:  tongyao
 * date:    $Date: 2011/2/9 $
 */

manage.offlineReason = new er.Action({
	
	VIEW: 'offlineReason',
	
	IGNORE_STATE: true,
	
	CONTEXT_INITER_MAP: {
	    initReasonConfig : function(callback){
	        var me = this;
	        //拒绝理由的大分类 add by yanlingling
            manage.offlineReason.codeConfig=(function(action){
            var level = action.arg.level;
            var levelName = nirvana.config.LANG.LEVEL_NAME[level];
            //数组的0位代表左面的分类，1位代表右面的此分类的具体理由，没有1的代表理由是动态生成的
            return {
                1:['余额为零','您的账户余额已经为零，请及时缴纳费用'],
                2:['账户信息无效'],
                3:['不宜推广'],
                4:['审核中','您的关键词/创意/蹊径子链正在审核中，请耐心等待系统审核'],
                5:['预算不足'],
                6:['计算机搜索无效'],
                7:['暂停推广'],
                8:['循环暂停','您的推广计划正处于循环暂停中，若想让关键词/创意/附加创意上线，请修改推广时段设置'],
                9:['无有效创意'],
                10:['无有效关键词'],
                11:['配对审核中'],
                12:['配对不宜推广',],
                13:[levelName + '待激活',levelName + '待激活'],
                14:['URL审核中','关键词的URL正在进行审核，审核完成前新URL设置暂时不生效'],
                15:['搜索量过低', '该关键词因搜索流量过低，系统已经暂停推广。一旦有更多用户开始搜索您的关键词，系统会自动恢复推广。您可以暂时保留这些关键词，以等待有更多的用户搜索。您也可以通过系统中的关键词工具，选择其它能为您带来丰富流量的关键词。'],
                16:['开户金未到'],
                17:['推广无效', '您推广的App已在百度开发者中心下线、删除或停止百度推广，建议暂停所在单元。'],
                19:['移动URL审核中',levelName +'的移动URL正在进行审核，审核完成前新URL设置暂时不生效'],
                20:['移动URL拒绝'],
                21:['移动搜索无效']
         }
        })(me);
        callback();
        },
	    
	    
		offlineReason : function(callback){
			var me = this,
				level = this.arg.level,
				params = this.arg.params;
			switch(level){
				case "planinfo":
					fbs.material.getOfflinereason({
						
						level : level,
						
						condition : {
							planid : params.planid
						},
						
						onSuccess: (function(level, params, callback){
							return function(data){
								me.response(data,level,params,callback);
							};
						})(level, params, callback)
					});
					break;
				case "unitinfo":
					fbs.material.getOfflinereason({
						
						level : level,
						
						condition : {
							unitid : params.unitid
						},
						
						onSuccess: (function(level, params, callback){
							return function(data){
								me.response(data,level,params,callback);
							};
						})(level, params, callback)
					});
					break;
				case "wordinfo":
					fbs.material.getOfflinereason({
						
						level : level,
						
						condition : {
							winfoid : params.winfoid
						},
						
						onSuccess: (function(level, params, callback){
							return function(data){
								me.response(data,level,params,callback);
							};
						})(level, params, callback)
					});
					break;
				case "ideainfo":
				    var ideaid = params.ideaid;
                    ideaid = ideaid.toString().replace('shadow','');
                    fbs.material.getOfflinereason({
						
						level : level,
						
						condition : {
							ideaid : ideaid
						},
						
						onSuccess: (function(level, params, callback){
							return function(data){
								me.response(data,level,params,callback);
							};
						})(level, params, callback)
					});
					break;
			    case 'creativeinfo'://附加创意
			         var ideaid = params.ideaid,
			             condition = {},
			             id = ideaid.toString().replace('shadow','');
			        if(ideaid.toString().indexOf('shadow')!=-1){//影子创意
			            condition.shadowcreativeid = id;
			        }else{
			            condition.creativeid = id;
			        }
                    fbs.material.getOfflinereason({
                        
                        level : level,
                        
                        condition : condition,
                        
                        onSuccess: (function(level, params, callback){
                            return function(data){
                                me.response(data,level,params,callback);
                            };
                        })(level, params, callback)
                    });
                    break;
			};
			
		}
	},
	
	onentercomplete : function(){
	   // Dialog二次定位标识
		nirvana.subaction.isDone = true;
	
	},
	
	
	/**
	 *离线理由的返回处理 
	 */
	response : function(data, level, params, callback){
		var me = this,
			dialogTitle = baidu.dom.last(ui.util.get(level + 'OfflineReasonDialog').getId('title')),
			//data = data.data[0],
			offlineReason = data.data,
			levelName = nirvana.config.LANG.LEVEL_NAME[level],
			title = {
				online : '目前' + levelName + '可以展现',
				vulnerable : '目前' + levelName + '可以展现，但可能存在以下情况',
				offline : '目前' + levelName + '处于离线中，可能存在以下原因'
			};
		if(offlineReason.length > 0){
			/**
			 * 标题部分
			 */
			if(level == 'wordinfo'){ //关键词层级
				var _online = true;
				for (var i = 0, len = offlineReason.length; i < len; i++) {
					if (offlineReason[i][0] != 11 && offlineReason[i][0] != 12 && offlineReason[i][0] != 14) {
						_online = false;
						break;
					}
				}

				if (_online) {
					dialogTitle.innerHTML = title.vulnerable;
				} else {
					dialogTitle.innerHTML = title.offline;
				}
			} else {
				dialogTitle.innerHTML = title.offline;
			}

            // 临时紧急合并搜索无效  以后再通过后端接口来修改
            // showWords 用来标识 “但可以在计算机上正常展现”是否显示
            var showWords = true;
            var _mIndex;
            var _pcIndex;
            var _stat = me.arg.params.stat;

            if (_stat == 3) {
                showWords = false;
            }
            
			/**
			 * 具体理由部分
			 */
			var tmp = [],
				opttype,
				action;

			if( me.arg.action && me.arg.action.getContext('opttype')  ){//只有ao的ao.widget15 里面才能走到这，只显示不宜推广的理由
			   
			        for (var i = 0, len = offlineReason.length; i < len; i++) {
						if (offlineReason[i][0] === 3) {
							tmp[tmp.length] = me.renderReason(offlineReason[i][0], offlineReason[i][1], params, level);
							break;
						}
					}
				
			}
			else {
			    
				for (var i = 0, len = offlineReason.length; i < len; i++) {
					tmp[tmp.length] = me.renderReason(offlineReason[i][0], offlineReason[i][1], params, level, showWords);
				}
			}
			me.setContext('offlineReasonCotent', ui.format(
													er.template.get('offlineReasonDetail'),
													tmp.join('')));
			
		}else {
			dialogTitle.innerHTML = title.online;
			me.setContext('offlineReasonCotent', er.template.get('offlineReasonOK'));
		}
        /**
         * 加v惩罚部分，以后要删掉，最多半年 by wsy
         * 删掉以下部分，记得加 callback();
         */
        var temp = me.getContext('offlineReasonCotent');
        if(temp.indexOf('{useracct_vpunish}') < 0 && temp.indexOf('{planinfo_vpunish}') < 0){
            callback();
            return;
        }

        // var vPunishLevel = temp.indexOf('{useracct_vpunish}')>0 ? "useracct" : "planinfo";

        // me.vpunish.init({
        //     level: vPunishLevel,
        //     offlineReasonCotent : me.getContext('offlineReasonCotent'),
        //     params : params,
        //     callback : function(repstr){
        //         me.setContext('offlineReasonCotent',repstr);
        //         callback();
        //     }
        // });

        var hasPlanBudgetReason = temp.indexOf('{planinfo_vpunish}') > 0;
        var hasUserBudgetReason = temp.indexOf('{useracct_vpunish}') > 0;

        var vPunishCallback = function(repstr) {
            me.setContext('offlineReasonCotent',repstr);
            callback();
        };

        if(hasPlanBudgetReason && hasUserBudgetReason) {
            // 坑爹的两次请求，之前不知道可以同时存在
            me.vpunish.init({
                level: 'useracct',
                offlineReasonCotent : me.getContext('offlineReasonCotent'),
                params : params,
                callback : function(resstr) {
                    me.vpunish.init({
                        level: 'planinfo',
                        offlineReasonCotent : resstr,
                        params : params,
                        callback: vPunishCallback
                    });
                }
            });
        }
        else {
            var vPunishLevel = hasUserBudgetReason ? "useracct" : "planinfo";

            me.vpunish.init({
                level: vPunishLevel,
                offlineReasonCotent : me.getContext('offlineReasonCotent'),
                params : params,
                callback : vPunishCallback
            });
        }
	},
    /**
     * 加v惩罚部分，以后要删掉，最多半年 by wsy
     */
    vpunish: {
        emptystr: function(options){
            var temp = options.offlineReasonCotent;
            temp = temp.replace('{useracct_vpunish}','');
            temp = temp.replace('{planinfo_vpunish}','');
            options.callback(temp);
        },
        init: function(options){
            var me = this;
            if(nirvana.index._vpunish.getAuthInfo()){
                if(nirvana.index._vpunish.getAuthInfo().hasAuth){
                    this.getAuthInfo(options);
                }
                else{
                    me.emptystr(options);
                }

            }else{
                nirvana.index._vpunish.request(function(data){
                   // var data = json.data;
                    if(data && data.hasAuth){
                       // nirvana.index._vpunish.setAuthInfo(data);
                        me.getAuthInfo(options);
                    }
                    else{
                        me.emptystr(options);
                    }
                });
            }
        },

        getAuthInfo : function(options){
            var replaceExp = new RegExp('{' + options.level + '_vpunish}', 'g');
            var parmas ={
                level : options.level,
                condition : {},
                onSuccess : function(json){
                    var repstr ="";
                    if(json.data && json.data.todayCost){
                        repstr = '和未加V成本提升金额（'+ json.data.todayCost +'元）之和';
                    }
                    var temp = options.offlineReasonCotent;
                    temp = temp.replace(replaceExp, repstr);
                    options.callback(temp);
                },
                onFail: function() {
                    var repstr ="";
                    var temp = options.offlineReasonCotent;
                    temp = temp.replace(replaceExp, repstr);
                    options.callback(temp);
                },
                onTimeout: function() {
                    var repstr ="";
                    var temp = options.offlineReasonCotent;
                    temp = temp.replace(replaceExp, repstr);
                    options.callback(temp);
                }
            };
            if(options.level == 'planinfo'){
                parmas.condition.planid = options.params.planid;
            };
            fbs.vpunish.getVpunishInfo(parmas);
        }
    },
	
	/**
	 * 获取附加创意的具体理由
	 */
	renderAppendIdeaReason:function(code, detail, params, level){
	    
	    var me = this,
            levelName = nirvana.config.LANG.LEVEL_NAME[level],
            rowTpl = er.template.get('offlineReasonRow'),
            codeconfig = manage.offlineReason.codeConfig,
            codeChar = codeconfig[code],
            detailChar = []; 
            for (var i=0; i < detail.length; i++) {
                     detailChar[detailChar.length] = detail[i][0]+(detail[i][1]==''?'':"("+detail[i][1]+")");
                     
                    };
                    detailChar = detailChar.join("</br>");
                    return ui.format(
                        rowTpl,
                        codeChar,
                        detailChar
                        //'您的账户余额已经为零，请及时<a href="' + CLASSICS_PAY_URL + userid + '">缴纳费用</a>'
                       );
	},
	
	/**
	 * 具体理由
	 * @param {Object} code 信息编码
	 * @param {Object} detail 详细信息
	 */
	renderReason : function(code, detail, params, level, showWords){
		code = code - 0;
		var me = this,
			levelName = nirvana.config.LANG.LEVEL_NAME[level],
			rowTpl = er.template.get('offlineReasonRow'),
			userid = nirvana.env.USER_ID;
		var	codeconfig = manage.offlineReason.codeConfig,
            codeChar = codeconfig[code][0];//离线理由的分类信息字面
        var detailChar = codeconfig[code][1];//离线理由的详情信息字面
			    
		    switch (code) {
           
            case 2:
                var tmp = [];
                tmp.push('不符合推广规定');
                var details = detail.split(',');
                var detailArr = [];
                for (var i=0; i < details.length; i++) {
                  var temp = [details[i],''];
                  detailArr.push(temp);
                };
                tmp.push('——“' + me.detailReason(detailArr) + '"');
                  
                tmp.push('，请修改');
                //tmp.push('，请<a href="' + CLASSICS_BASE_URL + CLASSICS_USEREDIT_URL + userid + '">修改</a>');
                
                return ui.format(
                        rowTpl,
                        codeChar,
                        tmp.join('')
                       );
                break;
            case 3: 
              if (level == 'creativeinfo') {//附件创意的时候单独处理,附加创意直接返回拒绝理由字面
                    return me.renderAppendIdeaReason(code, detail, params, level);

                } else {
                    return ui.format(rowTpl, codeChar, '关键词/创意/蹊径子链信息不符合规定——' + me.detailReason(detail));
                }

               
                break;
            case 5:
                var segment = '';
                /**
                 * 加v惩罚部分，以后要删掉，最多半年 by wsy
                 * 删除{}以及其内的东西
                 */
                if (detail == 1) {
                    segment = '您的搜索推广帐户今日的消费{useracct_vpunish}已经超出了设置的每日预算，如果希望获得更多展现和点击，请修改您的预算设置';
                }
                else {
                    segment = '您的推广计划今日的消费{planinfo_vpunish}已经超出了设置的每日预算，如果希望获得更多展现和点击，请修改您的预算设置'
                }
                
                return ui.format(
                        rowTpl,
                        codeChar,
                        segment
                       );
                
                break;
            case 6://pc搜索无效
                return ui.format(
                        rowTpl,
                        codeChar,
                        '关键词低于计算机最低展现价格'
                            + (showWords ? '，但可以在移动设备上正常展现' : '')
                            + '。要使其有效，您可优化关键词质量度或者使出价不低于计算机最低展现价格' + fixed(detail) + '元'
                       );
                break;
            case 21://移动搜索无效
                return ui.format(
                        rowTpl,
                        codeChar,
                        '关键词低于移动最低展现价格'
                            + (showWords ? '，但可以在计算机上正常展现' : '')
                            + '。要使其有效，您可优化关键词质量度或者使出价不低于移动最低展现价格' + fixed(detail) + '元'
                       );
                break;
            case 7:
                var pauseObj = ["", "推广计划", "推广单元", "关键词", "创意/蹊径子链","","App"];
                return ui.format(
                        rowTpl,
                        codeChar,
                        '您的当前' + pauseObj[detail] + '已暂停推广'
                        //'您的' + pauseObj[j] + '已暂停推广，请<a href="#" onclick="runRefuse(' + id + ',' + j + ',\'' + _type + '\');return false">“启用”</a>'
                    );
                break;
           
            case 9:
                return ui.format(
                        rowTpl,
                        codeChar,
                        '您的推广单元<b>' + baidu.encodeHTML(detail) + '</b>中无有效创意，导致您的关键词无法正常推广'
                    );
                break;
            case 10:
                return ui.format(
                        rowTpl,
                        codeChar,
                        '您的推广单元<b>' + baidu.encodeHTML(detail) + '</b>中无有效关键词，导致您的创意/蹊径子链无法正常推广'
                    );
                break;
            case 11:
                var reason = '';
                if(level == 'wordinfo'){
                    reason = '关键词和带有通配符的创意正在配对审核中，审核完成前将以默认关键词带入创意进行展现。';
                } else {
                    reason = '创意和关键词正在配对审核中，配对审核完成前创意暂时无法展现。';
                }
                return ui.format(
                        rowTpl,
                        codeChar,
                        reason
                    );
                break;
            case 12:
                return ui.format(
                        rowTpl,
                        codeChar,
                        me.pairReason(detail, level)
                    );
                break;
            case 16:
                var link = '';
                if(detail == 1){
                    link = '缴纳费用';
                    //link = '<a href="' + CLASSICS_PAY_URL + userid + '" target="_blank">缴纳费用</a>';
                } else {
                    link = '缴纳费用';
                }
                return ui.format(
                        rowTpl,
                        codeChar,
                        '您的账户开户金未到，请及时' + link
                    );
                break;
           
		     case 20:
                return ui.format(
                        rowTpl,
                        codeChar,
                        me.detailReason(detail)
                    );
                break;
            default://默认
                return ui.format(
                        rowTpl,
                        codeChar,
                        detailChar
                    );
              break;
                
        }
			
	  	
	},
	
	/**
	 * 获取小灯泡详细的原因
	 * @param {Object} index
	 * @return {String} 详细原因
	 * @author tongyao@baidu.com
	 */
	detailReason : function (indexes) {
	    var d = nirvana.config.detailOfflineReason,
			userid = nirvana.env.USER_ID,
	    	len = d.length,
			rel = [];
			
		if(!baidu.lang.isArray(indexes)){ //对非数组元素进行初始化
			indexes = [indexes,''];
		}
		var index_length = indexes.length;
		var findCodeDetail = false;
		for(var i = 0; i < index_length; i++){
		    findCodeDetail = false;
			for (var j = 0; j < len; j++) {
		        if (d[j].id == indexes[i][0]) {//code对应的编码在前端有配置
		            findCodeDetail = true;
					if(indexes[i][1] != '' && (d[j].id == 1024 || d[j].id == 2048 || d[j].id == 8192 || d[j].id == 5120 || d[j].id == 9216)){ //仅当id为wordOffline理由，且理由不为空时显示具体理由
						rel[rel.length] = d[j].desc 
                            + (indexes[i][1] 
                                ? ('(' + indexes[i][1] + ')')
                                : '');
					} else if(d[j].id == 16384){	//资质绑定显示链接
						rel[rel.length] = d[j].desc + insertWbr(d[j].link + userid);
						//rel[rel.length] = d[j].desc + '<a href="' + d[j].link + userid + '" target="_blank">' + insertWbr(d[j].link + userid) + '</a>';
					} else {
						rel[rel.length] = d[j].desc;
					}
		        }
		    }
		    if(!findCodeDetail){//code对应的编码在前端没有配置，直接读字面。现在后端有的理由在审核直接拿，返回的是字面 yanlingling
		        rel[rel.length] = indexes[i][0]+ "。";
		        if(indexes[i][1] && indexes[i][1]!=''){
		            rel[rel.length] = indexes[i][0]+ "(" + indexes[i][1] + ")";  
		        }
		     }
		}
	    
		if(rel.length !=0){
		//	return rel.join('<br />');
			return '<div>' + rel.join('<br />') + '</div>';
		} else {
	   	 	return ('其它');
		}
	},
	
	
	/**
	 * 获取配对拒绝原因
	 */
	pairReason : function (array, level){
		var length = array.length,
			levelName = nirvana.config.LANG.LEVEL_NAME[level],
			rel = {},
			spliter = (level == 'word') ? '<br/>' : ',',
			userid = nirvana.env.USER_ID;
		
	
		for(var i = 0; i < length; i++){
			var id = array[i][0];
			var wb_reason = array[i][1]; //Wordblack reason
			var pair = array[i][2].split(spliter); //配对列表
			for (var j = 0, len2 = pair.length; j < len2; j++) {
				pair[j] = baidu.encodeHTML(baidu.decodeHTML(pair[j]));
			}
			pair = pair.join(spliter);
			if(rel[id]){  //此原因下已有其他配对
				rel[id].push([wb_reason,pair]);
			} else {	//此原因下暂无配对
				rel[id] = [[wb_reason,pair]];
			}
		}
		var d = nirvana.config.detailOfflineReason;
		var dlen = d.length;
		var ret = [];
		
		var pairName = '';
		if (level == 'wordinfo') {
			pairName = '创意/蹊径子链';
		} else {
			pairName = '关键词';
		}
		
		ret[ret.length] = '关键词/创意/附加创意信息不符合规定';
		var wb_str;
		for (i in rel){
			for(var j = 0; j< dlen; j++){
				if(rel[i] && d[j].id == i){
					if(rel[i][0][0] != '' && (d[j].id == 1024 || d[j].id == 2048 || d[j].id == 8192 || d[j].id == 2000000000||d[j].id == 213)){
						wb_str = '(' + rel[i][0][0] + ')';	//仅当id为wordOffline理由，且理由不为空时显示具体理由
					} else if(d[j].id == 16384){	//资质绑定显示链接
						wb_str = d[j].link + userid;
						//wb_str = '<a href="' + d[j].link + userid + '" target="_blank">' + d[j].link + userid + '</a>';
					} else {
						wb_str = '';
					}
					if(pairName == '创意/蹊径子链'){ //旧通配符转新格式
						rel[i][0][1] = ideaToNewFormat([rel[i][0][1]]);
					}
					if (d[j].id == 2000000000 || d[j].id == 213 ||  d[j].id == 5120) {
						ret[ret.length] = '<div class="offlineReasonPairRow">' + d[j].desc + wb_str + '</div>';
					}
					else {
						ret[ret.length] = '<div class="offlineReasonPairRow">' + d[j].desc + wb_str + '<div class="offlineReasonPairTitle">配对' + pairName + ':<div><span class="offlineReasonPair">' + (rel[i][0][1]) + '</span></div></div></div>';
					}
				}
			}
		}
		return ret.join('<br />')
		
	}
});


/**
 * 
 * 调用小灯泡浮动层子Action
 * @param {Object} param
 */
manage.offlineReason.openSubAction = function(param) {
	var level = param.type,
	    params = baidu.json.parse(param.params),
		width = 655,
		action = param.action,
		opttype,
		subActionDialogParam = {
			id: level + 'OfflineReasonDialog',
			title: '<span class="status_icon offlineReason_icon"></span><span class="offlineReasonTitle">数据读取中...</span>',
			width: width,
			actionPath: 'manage/offlineReason',
			params: { // 通过this.arg.level判断层级
				action : action,
				level : level,
				params : params
			}, 
			onclose: function(){}
		};
	
	// add by LeoWang(wangkemiao@baidu.com) for 在工具箱的子Action对话框中使用小灯泡的时候，不会使原有的mask消失
	subActionDialogParam.maskLevel = param.maskLevel || 1;
	// add ended
	
	if (action) {
		opttype = action.getContext('opttype');
		if (opttype == 11) {
			subActionDialogParam.maskLevel = 2;
		}
	}
	
	nirvana.util.openSubActionDialog(subActionDialogParam);
	clearTimeout(nirvana.subaction.resizeTimer);
	baidu.g('ctrldialog' + level + 'OfflineReasonDialog').style.top = baidu.page.getScrollTop() + 200 +'px';
};