/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    queryReport/addQueryCallback.js
 * desc:    添加为关键词返回结果
 * author:  wanghuijun
 * date:    $Date: 2011/2/14 $
 */

ToolsModule.addQueryCallback = new er.Action({
	VIEW : 'addQueryCallback',
	
	onafterrender : function(){
		var me = this,
		    controlMap = me._controlMap,
			upAction = me.arg.upAction;
		
		if("undefined" == typeof me.arg.queryMap){
			me.arg.queryMap = [];
		}
		me.fillList();
		
		controlMap.AddCallbackClose.onclick = function() {
			// 更新搜索词状态
            KR_COM.needReload = true;
			if (upAction && typeof upAction.queryStat === 'function') {
                upAction.queryStat();
            }
			me.onclose();
		};
		
		if(me.arg.type != 'pos' || me.getContext('hasFail') == 1){
			baidu.hide('AddSuggestWordsWrap');
			baidu.hide('SaveSuggestWordsContainer');
			baidu.hide('SaveErrorExpe2');
		}
		else{
			baidu.show('AddSuggestWordsWrap');
			baidu.show('SaveSuggestWordsContainer');
			baidu.show('SaveErrorExpe2');
			
			/**
			 * 根据指定单元的地域信息，planId不传为账户地域
			 * @param {Fuction} callback
			 * @param {Object} planId
			 */
			nirvana.manage.getRegionInfo(function(regions){ 
                me.setContext('regions', regions);
                me.initExpedition();                
			});
		}
	},
	
	//每次页面装载完成后执行
	onentercomplete : function(){
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	title : {
		pos : {
			success : '已添加',
			fail : '未成功'
		},
		
		neg : {
			success : '已添加为否定关键词',
			fail : '未被添加为否定关键词'
		}
	},
	
	/**
	 * 填充搜索词列表
	 */
	fillList : function() {
		var me = this,
		    type = me.arg.type,
			level = me.arg.level,
			dataSuccess = me.arg.dataSuccess,
		    dataFail = me.arg.dataFail,
			lenSuccess = dataSuccess.length,
			lenFail = dataFail.length,
			data,
			i,
			msg,
			htmlSuccess = [],
			htmlFail = [],
			wordlist = [];  //远征2新加
		
		if (lenSuccess) {
			for (i = 0; i < lenSuccess; i++) {
				data = dataSuccess[i];
				
				htmlSuccess.push('<li>');
				htmlSuccess.push('<h4>' + baidu.encodeHTML(data.word) + '</h4>');
				if(type == 'pos'){
					htmlSuccess.push('<p><span class="query_list_title">推广计划：</span><span title="' + baidu.encodeHTML(data.planname) + '">' + getCutString(baidu.encodeHTML(data.planname),16, '...') + '</span>');
					if (!level || level == 'unit') {
						htmlSuccess.push('<span class="query_list_title query_list_title_notfirst">推广单元：</span><span title="' + baidu.encodeHTML(data.unitname) + '">' + getCutString(baidu.encodeHTML(data.unitname),16, '...') + '</span');
					}
					htmlSuccess.push('</p>');
				}
				else{
					htmlSuccess.push('<p><span class="query_list_title">所属推广计划：</span>' + baidu.encodeHTML(data.planname) + '</h4>');
					if (!level || level == 'unit') {
						htmlSuccess.push('<p><span class="query_list_title">所属推广单元：</span>' + baidu.encodeHTML(data.unitname) + '</h4>');
					}
					htmlSuccess.push('<p class="tip">添加成功，匹配模式：' + baidu.encodeHTML(data.matchtype) + '</p>');
				}
				//htmlSuccess.push('<p class="tip">添加成功，匹配模式：' + baidu.encodeHTML(data.matchtype) + '</p>');
				htmlSuccess.push('</li>');
				
				wordlist.push(baidu.string.encodeHTML(data.word));
			}
			
			baidu.g('AddSuccessNumber').innerHTML = lenSuccess;
			baidu.g('AddSuccessExtraTip').innerHTML = me.title[type].success;
			baidu.g('AddSuccessMode').innerHTML = type == 'pos' ? ('，匹配模式：' + dataSuccess[0].matchtype) : '';
			baidu.g('AddSuccessList').innerHTML = htmlSuccess.join('');
			baidu.removeClass('AddSuccessWrap', 'hide');
			
			// 如果添加成功，清除关键词cache
			fbs.material.clearCache('wordinfo');
			nirvana.queryReport.addSuccess = true; // 用来reload父级页面
			
			if(lenSuccess > 0){
				me.arg.queryMap.planid = dataSuccess[0].planid;
				me.arg.queryMap.unitid = dataSuccess[0].unitid;
			}
			me.setContext('wordlist', wordlist);
			me.setContext('hasFail', 0);
						
		} else {
			baidu.addClass('AddSuccessWrap', 'hide');
			me.setContext('hasFail', 1);
		}
		
		if (lenFail) {
			for (i = 0; i < lenFail; i++) {
				data = dataFail[i];
				
				if (type == 'pos') {
					msg = nirvana.config.ERROR.KEYWORD.ADD[data.error] || baidu.encodeHTML(data.message);
				} else {
					msg = nirvana.config.ERROR.NEGATIVE[data.error] || '';
				}
				
				
				htmlFail.push('<li>');
				htmlFail.push('<h4>' + baidu.encodeHTML(data.word) + '<span class="keyword_add_errormsg">' + msg + '</span></h4>');
				
				if(type == 'pos'){
					htmlFail.push('<p><span class="query_list_title">推广计划：</span><span title="' + baidu.encodeHTML(data.planname) + '">' + getCutString(baidu.encodeHTML(data.planname),16, '...') + '</span>');
					if (!level || level == 'unit') {
						htmlFail.push('<span class="query_list_title query_list_title_notfirst">推广单元：</span><span title="' + baidu.encodeHTML(data.unitname) + '">' + getCutString(baidu.encodeHTML(data.unitname),16, '...') + '</span');
					}
					htmlFail.push('</p>');
				}
				else{
					htmlFail.push('<p><span class="query_list_title">所属推广计划：</span>' + baidu.encodeHTML(data.planname) + '</h4>');
					if (!level || level == 'unit') {
						htmlFail.push('<p><span class="query_list_title">所属推广单元：</span>' + baidu.encodeHTML(data.unitname) + '</h4>');
					}
					htmlFail.push('<p class="warn">' + msg + '</p>');
				}
				
				htmlFail.push('</li>');
			}
			
			baidu.g('AddFailNumber').innerHTML = lenFail;
			baidu.g('AddFailExtraTip').innerHTML = me.title[type].fail;
			baidu.g('AddFailList').innerHTML = htmlFail.join('');
			baidu.removeClass('AddFailWrap', 'hide');
			me.setContext('hasFail', 1);
		} else {
			baidu.addClass('AddFailWrap', 'hide');
		}
	},

    initExpedition: function() {
        var me = this;
        this.expe = new fc.module.EmbedExpedition(baidu.g('AddSuggestWordsWrap'), { 
            entry: 'SWT', // 搜索词
            planid: me.arg.queryMap.planid,
            unitid: me.arg.queryMap.unitid,
            onSuccess: function() {
                me.onclose();
            }
        });
        this.expe.load(this.getContext('wordlist'), this.getContext('regions'));

        baidu.g('SaveSuggestWordsContainer').appendChild(this.expe.saveBtn);
        baidu.g('SaveErrorExpe2').appendChild(this.expe.errorNode);
    }
});
