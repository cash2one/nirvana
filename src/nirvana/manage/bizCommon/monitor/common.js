/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    monitor/common.js
 * desc:    阿凡达公用函数
 * author:  zhouyu
 * date:    $Date: 2011/02/12 $
 */

var avatar = avatar || {};

/**
 * 根据winfoid获取计划和单元
 * @param {Object} me
 * @param {Object} winfoids	关键词ids
 * @param {Object} isbatch	是否批量添加（批量添加为初始化已添加关键词）
 */
avatar.getPlanAndUnit = function(me, addword, isbatch,callback){
	var winfoids=[];
	for (var i = 0, l = addword.length; i < l; i++) {
		winfoids[winfoids.length] = addword[i].id;
	}
	if (winfoids.length > 0) {
		fbs.material.getAttribute('wordinfo', ["winfoid", "showword", "planname", "unitname","wmatch", "wctrl"], {
			condition: {
				winfoid: winfoids
			},
			onSuccess: function(data){
				var dat = data.data.listData, len = dat.length, content = [];
				var kwtitle, kwcontent, wordname, planname, unitname, plantitle, plancontent, unittitle, unitcontent;
				for (var i = 0; i < len; i++) {
					var html = [];
					wordname = dat[i].showword;
					if(nirvana.env.AUTH['gaoduan']){
						wordname = nirvana.util.buildShowword(wordname, dat[i].wmatch, dat[i].wctrl);
						wordname = wordname.replace(/&quot;/g, '"');
					}
					planname = baidu.encodeHTML(dat[i].planname);
					unitname = baidu.encodeHTML(dat[i].unitname);
					kwtitle = baidu.encodeHTML(wordname);
					kwcontent = getCutString(wordname, 20, "..");
					html[html.length] = '<div class="kwb_name" title="' + kwtitle + '">' + kwcontent + '</div>';
					html[html.length] = '<div class="kwb_info"><span class="gray">推广计划：</span><span title="' + planname + '">' + planname + '</span></div>';
					html[html.length] = '<div class="kwb_info"><span class="gray">推广单元：</span><span title="' + unitname + '">' + unitname + '</span></div>';
					content[content.length] = {
						id: dat[i].winfoid,
						html: html.join("")
					};
				}
				if (isbatch) {
					me.wordInitFill(content, callback);
				}
				else {
					me.wordAddHandler(content);
				}
				
			},
			onFail: function(data){
				ajaxFailDialog();
				if (isbatch) {
					callback();
				}
			}
		})
	}else{
		var content = [];
		if (isbatch) {
			me.wordInitFill(content, callback);
		}
		else {
			me.wordAddHandler(content);
		}
	}
}
/**
 * 未搜索到的关键词表格列
 */
avatar.notFoundFields = [
		{
			title : '',
			field :'word',
			content : function(item){
				var html = [];
				item=baidu.encodeHTML(item);
				html[html.length] = '<div class="edit_td">';
				html[html.length] = '<span>'+item+'</span>';
				html[html.length] = '<a class="edit_btn" edittype="word"></a>';
                html[html.length] = '</div>';
				return html.join('');
			},
			width : 440
		},
		{
			title : '',
			field : 'del',
			content : function(){
				return '<a class="del_word_not_found">删除</a>';
			},
			width:50
		}
	]

/**
 * 搜索到的关键词表格列
 * @param {Object} 
 */
avatar.listDataFields = [
		{
				title : '关键词'	,
				content : function(item){
					return baidu.encodeHTML(item.showword);
				},
				width : 300		
		},
		{		
				title : '推广计划',
				content : function(item){
					return baidu.encodeHTML(item.planname);
				},
				width : 200
			
		},
		{	
				title : '推广单元',
				content : function(item){
					return baidu.encodeHTML(item.unitname);
				},
				width : 200		
		},
		{		
				title: '',
				content: function(item){
					var flag=false;
					for(i=0;i<avatar.addWords.length;i++)
						if(item.winfoid==avatar.addWords[i].id)
							flag=true;
					if (flag) {
						return '<span>已监控</span>';
					}else {
						return '<a class="del_word_found">删除</a>';
					}
				},
				width: 80
		}
	]
	
	/**
	 * 显示区域
	 */
	avatar.showArea = function(me,value){
		var value=parseInt(value);
		
		if(value==1 &&(me.getContext('listDataData')[0]||me.getContext('notFoundData')[0])){
			value=2;
		}
		for(var i=0;i<3;i++){
			baidu.addClass(baidu.dom.q('monitor_control_area')[i],'hide');
			baidu.addClass(baidu.dom.q('folder_foot')[i],'hide');
		}
		
		baidu.removeClass(baidu.dom.q('monitor_control_area')[value],'hide');
		baidu.removeClass(baidu.dom.q('folder_foot')[value],'hide');
		return;
	}
	
	/**
	 * 检查输入关键词是否合法
	 */
	avatar.checkInput = function(me){//每个关键词最多20个汉字或40个英文
		var controlMap = me._controlMap;
		
		return function(){
			var wordList = controlMap.wordSelected.textArea.getValue().replace(/\r/g, ''),
			  	words = wordList.split('\n'),
				html = [],
				wordsLen = 0,
				flag = true,
				i, len;
			controlMap.nextStep.disable(false);
			html.push('<span>多个关键词用换行分开，每个关键词最多20个汉字或40个英文</span><br/>');
			for(i=0,len=words.length;i<len;i++){
				if(baidu.trim(words[i]))
					wordsLen++;	
			}
			if(wordsLen>200){
				html.push('<span class="red">关键词数量超过上限200</span>');
				controlMap.nextStep.disable(true);
				flag = false;
			}
			for(i=0,len=words.length;i<len;i++){
				if(baidu.trim(words[i]).replace(/[^\x00-\xff]/g,"**").length>40){
					html.push('<span class="red">第'+(i+1)+'行关键词过长</span>');
					controlMap.nextStep.disable(true);
					flag = false;
				}
			}
			if(wordsLen==0){
				controlMap.nextStep.disable(true);
			}
				
			baidu.dom.q('tip_area')[0].innerHTML=html.join('<br/>');
			return flag;
		}
	}
	
	/**
	 * 查询的关键词
	 */
	avatar.nextStep = function(me){
		var controlMap = me._controlMap,
			listDataTable=controlMap.listData,
			notFoundTable=controlMap.notFound;
			
		return function(){
			var wordList = controlMap.wordSelected.getValue(),
			  	words = wordList.split('\n'),
				listData = me.getContext('listDataData'),
				notFoundData=me.getContext('notFoundData');
				
			if (notFoundData.length > 0) {
				words = notFoundData;	
			}else{
				var checkInput=avatar.checkInput(me);
				if(checkInput()==false)	
					return;
			}
		
			words = avatar.removeRepeatWord(words);
			fbs.avatar.queryMoniWords({
				showwords : words,
				onSuccess : function(data){
						
				listData = avatar.makeArray(listData,data.data.listData);
				listData = avatar.removeRepeatData(listData);//去重
				var temp1 = [],
					temp2 = [],
					i, j, len;
				for(i=0,len=listData.length;i<len;i++){
					var flag=false;
					for(j=0;j<avatar.addWords.length;j++)
						if(listData[i].winfoid==avatar.addWords[j].id)
							flag = true;
					if(flag){
						temp1[temp1.length] = listData[i];
					}else{
						temp2[temp2.length] = listData[i];
					}
				}
				listData = avatar.makeArray(temp1,temp2);
				listDataTable.fields=avatar.listDataFields;
				listDataTable.datasource=listData;
				me.setContext('listDataData',listData);
				
				notFoundTable.fields = avatar.notFoundFields;
				notFoundTable.datasource = data.data.notFound;
				me.setContext('notFoundData',data.data.notFound);
				
				avatar.showTable(me);
				avatar.showArea(me,2);						
				},
				onFail : me.failHandler()
			});
		}
	}
	
	/**
     * 表格行内操作事件代理器
     */
    avatar.getTableInlineHandler = function (me) {
        return function (e) {
            var event = e || window.event,
                target = event.target || event.srcElement,
				type,parent;
            while(target  && target != ui.util.get("notFound").main&&target != ui.util.get("listData").main){
				if(baidu.dom.hasClass(target,"edit_btn")){
					var current = nirvana.inline.currentLayer;
					if (current && current.parentNode) {
						current.parentNode.removeChild(current);
					}
					avatar.inlineWord(me,target);
					break;
				}
				if(baidu.dom.hasClass(target,'del_word_not_found')){
					avatar.delWord(me,target,'notFound');
				}
				if(baidu.dom.hasClass(target,'del_word_found')){
					avatar.delWord(me,target,'listData');
				}
                target = target.parentNode;
            };
        };
    }
	
	/**
	 * 行内修改关键词
	 */
	avatar.inlineWord = function(me,target){
		var index=avatar.getLineData(target),
			word=me.getContext('notFoundData')[index],
			controlMap=me._controlMap;
		
		nirvana.inline.createInlineLayer({
			type: "text",
			value: word,
			id: "word" + word,
			target: target.parentNode,
			okHandler: function(name){
				name = baidu.trim(name);
				
				var words = me.getContext('notFoundData');
				words[index] = name;
				me.setContext('notFoundData',words);
				avatar.showTable(me);
				
				return {
					func : function(){},
					param : ''
				}
			}
		});
	}
	
	/**
	 * 删除关键词
	 * @param {Object} target
	 */
	avatar.delWord = function(me,target,type){
		var controlMap=me._controlMap,
			index= avatar.getLineData(target);
		if(type=='notFound'){
			var notFoundData=me.getContext('notFoundData');
			baidu.array.remove(notFoundData,notFoundData[index]);
			me.setContext('notFoundData',notFoundData);
		}else{
			var listDataData = me.getContext('listDataData');
			baidu.array.remove(listDataData,listDataData[index]);
			me.setContext('listDataData',listDataData);	
		};
		avatar.showTable(me);
	}
	
	/**
	 * 根据编辑按钮对象获取当前行数据
	 * @param {Object} target
	 */
	avatar.getLineData =  function(target){
		var isFind = false;
		while (target && target.tagName != "TR") {
			if(target.tagName == "TD"){
				isFind = true;
				break;
			}
			target = target.parentNode;
		}
		if(isFind){
			var index = target.getAttribute("row");
			return index;
		}
		return false;
	}
	
	/**
	 * 显示表格
	 */
	avatar.showTable = function(me){
		var controlMap = me._controlMap,
			listDataData = me.getContext('listDataData'),
			notFoundTable = controlMap.notFound,
			head = baidu.g(notFoundTable.getId('head')),
			notFoundData = me.getContext('notFoundData'),
			num=0;
			
		//controlMap.notFound.getHead().style.display='none';	
		controlMap.listData.render();
		controlMap.notFound.render();
		
		head.innerHTML='<div class="not_found_warning"><span class="not_found_warning_icon"></span><span>以下<span id="notFoundNum" class="red"></span>个关键词暂无搜索结果。</span></div>';
		controlMap.done.disable(false);
		
		for(var i=0,len=listDataData.length;i<len;i++){
			for(var j=0;j<avatar.addWords.length;j++)
				if(listDataData[i].winfoid==avatar.addWords[j].id)
					num++;
		}
				
		if(listDataData[0]){
			baidu.dom.removeClass(baidu.dom.q('monitor_found')[0],'hide');
			var currentCount = me.getContext('currentCount'),
				maxCount = me.getContext('maxCount'),
				len = listDataData.length;
				
			if(len + currentCount -num<= maxCount){
				baidu.g('listdata_tip').innerHTML = '<span class="monitor_found_icon"></span>搜索出账户中'+len+'个关键词，可进行监控。';
				baidu.addClass(baidu.g('listdata_tip'),'listdata_tip_color');
				baidu.removeClass(baidu.g('listdata_tip'),'listdata_tip_error_color');
			}else{
				baidu.g('listdata_tip').innerHTML = '<span class="not_found_warning_icon"></span>搜索出账户中'+len+'个关键词，超出上限<span class="red">'+(len+currentCount-num-maxCount)+'</span>个。';
				controlMap.done.disable(true);
				baidu.removeClass(baidu.g('listdata_tip'),'listdata_tip_color');
				baidu.addClass(baidu.g('listdata_tip'),'listdata_tip_error_color');
			}
			if (notFoundData.length > 0) {
				if (listDataData.length > 4) {
					baidu.setStyle(baidu.q('skin_listDataTable_body')[0], 'height', '115px');
				}
				else {
					baidu.setStyle(baidu.q('skin_listDataTable_body')[0], 'height', 'auto');
				}
			}else{
				if(listDataData.length > 11){
					baidu.setStyle(baidu.q('skin_listDataTable_body')[0], 'height', '320px');
				}else{
					baidu.setStyle(baidu.q('skin_listDataTable_body')[0], 'height', 'auto');
				}
			}
			if (me.arg.folderid) {
				if (!baidu.dom.q('del_word_found')[0]) 
					controlMap.done.disable(true);
			}
		}else{
			baidu.dom.addClass(baidu.dom.q('monitor_found')[0],'hide');
			if (me.arg.folderid) 
				controlMap.done.disable(true);
		}
		if(notFoundData[0]){
			baidu.g('notFoundNum').innerHTML=''+notFoundData.length;
			baidu.dom.removeClass(baidu.dom.q('monitor_not_found')[0],'hide');
			if (listDataData.length > 0) {
				if (notFoundData.length > 3) {
					baidu.setStyle(baidu.q('skin_notFoundTable_body')[0], 'height', '93px');
				}
				else {
					baidu.setStyle(baidu.q('skin_notFoundTable_body')[0], 'height', 'auto');
				}
			}else{
				if(notFoundData.length > 10){
						baidu.setStyle(baidu.q('skin_notFoundTable_body')[0], 'height', '310px');
					}else{
						baidu.setStyle(baidu.q('skin_notFoundTable_body')[0], 'height', 'auto');
					}
			}
			if(notFoundData.length==1){
				baidu.setStyle(baidu.q('skin_notFoundTable_body')[0], 'padding-top', '18px');
				baidu.setStyle(baidu.q('skin_notFoundTable_body')[0], 'margin-top', '-18px');
			}else{
				baidu.setStyle(baidu.q('skin_notFoundTable_body')[0], 'padding-top', '0');
				baidu.setStyle(baidu.q('skin_notFoundTable_body')[0], 'margin-top', '0');
			}
		}else{
			baidu.dom.addClass(baidu.dom.q('monitor_not_found')[0],'hide');
		}
		
	}
	
	/**
	 * 合并数组
	 */
	avatar.makeArray = function(array1,array2){
		for(var i=0,len=array2.length;i<len;i++)
			array1.push(array2[i]);
		return array1;
	}
	
	/**
	 * 搜索到的关键词去重
	 * @param {Object} array
	 */
	avatar.removeRepeatData = function(array){
		var result = [],
		    i, j, len;
		for(i=0,len=array.length;i<len;i++){
			var flag=0; 
			for(j=0;j < result.length && flag == 0;j++){
				if(array[i].winfoid==result[j].winfoid && array[i].planid==result[j].planid&&array[i].unitid==result[j].unitid)
					flag=1;
			}
			if(flag==0)
				result.push(array[i]);
		}
		return result;
	}
	
	/**
	 * 搜索前去重
	 */
	avatar.removeRepeatWord = function(array){
		var arr=[],
			flag=0,
			i, j, len;
		for (i=0,len=array.length;i<len;i++) {
			flag=0;
			for(j=0;j<arr.length;j++)
				if (baidu.trim(array[i])==arr[j]) 
					flag=1;
			if(flag==0 && baidu.trim(array[i]))
				arr.push(baidu.trim(array[i]));
		}	
		return arr;
	}
	
	/**
	 * 当页添加
	 */
	avatar.addAllLeft = function(me){
		var controlMap = me._controlMap;
		return function(opts){
			var addword = parseInt(baidu.g("kwNum").innerHTML);
			fbs.avatar.getMoniWordCount.clearCache();
			fbs.avatar.getMoniWordCount({
				onSuccess: function(data){
					var currentCount = data.data.currentCount,
						maxCount = data.data.maxCount;
					
					if(opts.length==0)
						return false;
					if(addword+currentCount+opts.length>maxCount){
						ui.Dialog.alert({
							title: '数量超限',
							maskType: 'white',
							content: '账户可监控关键词数量超过上限<span class="red">'+(addword+currentCount+opts.length-maxCount)+'</span>个'
						});
						return false;
					}else {
						avatar.getPlanAndUnit(me,opts,false);
						addword += opts.length;
						if (currentCount + addword >= maxCount) {
							baidu.g("error_area").innerHTML = nirvana.config.LANG.KW_OVERSTEP;
							baidu.addClass(baidu.g("error_area"),'error_area');
						}else{
							baidu.g("error_area").innerHTML = "";
							baidu.removeClass(baidu.g("error_area"),'error_area');
						}
						controlMap.wordSelect.onAddAllLeftHandler(opts);
						return true;
					}
				},
				onFail: function(data){
					me.ajaxFailDialog();
				}
			});
			
			
		}
	}
	
	/**
	 * 保存已监控关键词
	 */
	avatar.addWords=[];
