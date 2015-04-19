
/** 
 * 创意编辑通用函数JavaScript代码
 * @author zuming@baidu.com tongyao@baidu.com
 */
var IDEA_CREATION = {
    
   
    /**
     *处理创意的显示url的前缀 
     * toCutSet 数组['http://','siteapp.baidu.com']
     */
    getShowUrltoCut : function(){
        
        var cutSite = baidu.object.clone(nirvana.env.URL_CUT_PREX);
        cutSite.splice(0,0,"http://");
        return cutSite;
    },
    
    removeIdeaUrlPrefix : function(url,toCutSet) {
        var toCutString = url = url.replace(/：/g, ':').replace(/．/g, '.').replace(/／/g, '/');
        for(var i = 0, length = toCutSet.length; i < length; i++) {
            var toCutPrefix = toCutSet[i];
            var begin = 0;
            while((begin =baidu.trim(url).toLowerCase().indexOf(toCutPrefix)) == 0) {
                var end = begin + toCutPrefix.length;
                var repalceStr = baidu.trim(url).substring(begin, end)
                url = baidu.trim(url.replace(repalceStr, ''));
            }
        }

        return url;
    },

    
    
	dom : {
		'title' : {	//标题
			'input' : 'IdeaTitle',
			'info'	: 'IdeaTitleInfo',
			'error' : 'IdeaTitleError'
		},	
		'desc1'	: {	//描述1
			'input' : 'IdeaDesc1',
			'info'	: 'IdeaDesc1Info',
			'error'	: 'IdeaDesc1Error'
		},
		'desc2'	: {	//描述2
			'input' : 'IdeaDesc2',
			'info'	: 'IdeaDesc2Info',
			'error'	: 'IdeaDesc2Error'
		},		
		'href'	: {	//访问URL
			'input' : 'IdeaHref',
			'info'	: 'IdeaHrefInfo',
			'error'	: 'IdeaHrefError'
		},
		'url'	: {	//显示URL
			'input' : 'IdeaUrl',
			'info'	: 'IdeaUrlInfo',
			'error'	: 'IdeaUrlError'
		},
		'mhref'    : { //访问URL
            'input' : 'MIdeaHref',
            'info'  : 'MIdeaHrefInfo',
            'error' : 'MIdeaHrefError'
        },
        'murl'   : { //显示URL
            'input' : 'MIdeaUrl',
            'info'  : 'MIdeaUrlInfo',
            'error' : 'MIdeaUrlError'
        },
		'button' : {
			//插入通配符
			'wildcard' : {
				'title' : 'IdeaWildCardTitle',
				'desc1'	: 'IdeaWildCardDesc1',
				'desc2'	: 'IdeaWildCardDesc2'
			},
			
			'save'		:	'IdeaSubmit',
			'cancel'	: 	'IdeaCancel'
		},
		//预览位置
		'preview' : {
			'pp'	:	'IdeaPreviewPP',
			'ppim'	:	'IdeaPreviewPPIM',
			'im'	:	'IdeaPreviewIM',
			'phone' :   'IdeaPreviewPhone' //增加移动设备预览
		}
	},
	
	errorStatus : {
		'title'	:	'',
		'desc1'	:	'',
		'desc2'	:	'',
		'href'	:	'',
		'url'	:	'',
        'mhref'  :   '',
        'murl'   :   ''
	},
		
	typeName : {
		'title'	:	'标题',
		'desc1'	:	'描述1',
		'desc2'	:	'描述2',
		'href'	:	'默认访问URL',
		'url'	:	'默认显示URL',
		'mhref'    :   '默认访问URL',
        'murl'   :   '默认显示URL'
	},
	
	//忽略断句符
	ignoreLineBreak : {
		'title'	:	false,
		'desc1' :	false
	},
	
	ideaError :  [
					['标题不能为空', '描述不能为空', '描述不能为空', '访问URL不能为空', '默认显示URL不能为空', '移动访问URL不能为空', '移动显示URL不能为空'],
					["标题长度不能超过" + IDEA_TITLE_MAX_LENGTH + "个字符（" + Math.round(IDEA_TITLE_MAX_LENGTH / 2) + "个汉字）",
					 "描述长度不能超过" + IDEA_DESC1_MAX_LENGTH + "个字符（" + Math.round(IDEA_DESC1_MAX_LENGTH / 2) + "个汉字）",
					 "描述长度不能超过" + IDEA_DESC2_MAX_LENGTH + "个字符（" + Math.round(IDEA_DESC2_MAX_LENGTH / 2) + "个汉字）", 
					 "默认访问URL长度不能超过" + IDEA_HREF_MAX_LENGTH + "个字符", 
					 "默认显示URL长度不能超过" + IDEA_URL_MAX_LENGTH + "个字符",
					 "移动访问URL长度不能超过" + IDEA_MHREF_MAX_LENGTH + "个字符", 
                     "移动显示URL长度不能超过" + IDEA_MURL_MAX_LENGTH + "个字符"
					 ]
				],
	
	lineNumberCache : '',
	
	checkCache : '',
	
	//无线下创意相关add by huanghainan
	idea_phone : {
		devicePrefer : 1,//设备类型，默认为1，即仅计算机 
	    phoneNumber : "",//默认为空，由计划属性获取
	    devicecfgstat : 0, //是否启用无线配置，0为未启用，1为启用
	    planListAttr : null
	//	phoneOnly : false //是否为仅移动设备状态，该属性为了在提交和发送时创意描述二的特殊处理
	},
	
	initIdeaPhoneAllDevice : function(){//全投的时候默认为0
		//if(nirvana.env.FCWISE_ALLDEVICE_USER){ }
	      IDEA_CREATION.idea_phone.devicePrefer = 0;
	},
	
	planChangeHandler : function(planid){
		var me = this;	
		var obj = me.idea_phone.planListAttr[Number(planid)];
		
		me.idea_phone.devicePrefer = obj.deviceprefer;
		me.idea_phone.devicecfgstat = obj.devicecfgstat;
        me.idea_phone.bridgeStat = obj.bridgeStat;
        if(me.idea_phone.devicePrefer == 0){//全部设备的时候显示俩url
           baidu.removeClass('ideaPhoneUrlWrap', 'hide');
        }else{
           baidu.addClass('ideaPhoneUrlWrap', 'hide');  
        }
		if(obj.phonenum.phonestat == 0){
			me.idea_phone.phoneNumber = obj.phonenum.phonenum;
		}else{
			me.idea_phone.phoneNumber = "";
		}
		
		me.preview();
	},
	
	unitChangeHandler : function(unitid){
        var me = this;  
        var obj = me.idea_phone.unitListAttr[Number(unitid)];
        var creativecnt = obj.creativecnt;
            if(creativecnt.app&&creativecnt.app!=0){//单元有app推广
                me.idea_phone.unitHasApp = true;
            }else{
                me.idea_phone.unitHasApp = false; 
            }
        
        
        me.preview();
    },
    
	
	resetIdeaDevice : function(){
		var me = this;
		me.idea_phone.devicePrefer = 1;
		me.idea_phone.phoneNumber = "";
		me.idea_phone.devicecfgstat = 0;
		me.idea_phone.planListAttr = null;
		me.idea_phone.unitHasApp = false;
		me.idea_phone.bridgeStat = undefined;
	//	me.idea_phone.phoneOnly = false;
	},
	//end of add
	/**
	 * 获取表单输入框
	 * @param {Object} id
	 */
	getForm : function(id) {
	    var me = this,
		    main = ui.util.get(id),
		    form;
		if(!main){
			return null;
		}
		switch (id) {
			case me.dom.desc1.input:
			case me.dom.desc2.input:
			    form = main.textArea.main;
				break;
			case me.dom.title.input:
			case me.dom.href.input:
			case me.dom.url.input:
			case me.dom.mhref.input:
            case me.dom.murl.input:
                form = main.main;
			default:
			    break;
		}
		
		return form;
	},
	
	init : function(){
		var me = this,
		    validateEventList = ['focus','blur','keyup','mouseup'],
			input = [
						me.getForm(me.dom.title.input),
						me.getForm(me.dom.desc1.input),
					 	me.getForm(me.dom.desc2.input),
					 	me.getForm(me.dom.href.input),
					 	me.getForm(me.dom.url.input),
					 	me.getForm(me.dom.mhref.input),
                        me.getForm(me.dom.murl.input)
					],
			inputid = [
			            me.dom.title.input,
			            me.dom.desc1.input,
			            me.dom.desc2.input,
			            me.dom.href.input,
			            me.dom.url.input,
			            me.dom.mhref.input,
                        me.dom.murl.input
			        ],
			event;
					
		for (var i = 0, j = validateEventList.length; i < j; i++){
			event = validateEventList[i];
			
			for (var x = 0, y = input.length; x < y; x++){
				baidu.on(input[x], event, me.instantDetection(inputid[x]));
			}
		}
		
		//单独为desc2绑定一个keydown
		baidu.on(input[2], 'keydown', me.instantDetection(inputid[2]));
		
		//定时检查断句符，因为有可能拖拽内容填入输入框，所以用keyup等检查不及时
		me.checkCache =  setInterval( function(){
			var cache = input[0].value + input[1].value;
			
			if(me.lineNumberCache == cache){
				return false;
			} else {
				me.lineNumberCache = cache;
			}
			
			me.checkLinebreak(inputid[0]);
			me.checkLinebreak(inputid[1]);
		},50);
		
		if(nirvana.env.ULEVELID == 10104){	//10104为大客户，则显示断句符按钮，中小客户不显示断句符
		
			var linebreakBtn = baidu.q('idea_linebreak', 'IdeaInput', 'a');
			
			for (var i = 0, j = linebreakBtn.length; i < j; i++){
				baidu.removeClass(linebreakBtn[i], 'hide');
			}
		}
		
		InsertWildCard.init();
		InsertLineBreak.init();
		
		me.preview();
	},
	
	/**
	 * 即时检查输入框状态
	 * @param {Object} id 输入框id
	 */
	instantDetection : function(id,noPreview){
		var me = this;
		
		return function(e){
			var eventType = e.type,
				type = me.getType(id);
			var	infoObj = baidu.g(me.dom[type].info),
				errorObj = baidu.g(me.dom[type].error);
			
			if(eventType != 'focus' && eventType != 'blur'){	//保存时会用focus来检查
				if(me.errorStatus[type].indexOf('overLinebreak') == -1){	//不清空断句符的错误.因为断句符使用定时器处理
					me.errorStatus[type] = '';
				}
			}
			
			switch(id){
				case me.dom.title.input:	//标题
					switch(eventType){
						
						case 'keyup':
							// 补全通配符
							wildcardAuto(e);
							if(e.keyCode == '13'){ // 用户输入回车键，则替换为^断句符
								var target = e.target || e.srcElement,
								    pos = getCursorPosition(target),
									str = target.value.substr(0, pos) + '^' + target.value.substr(pos);
								
						        target.value = str;
								movePoint(target,pos - 4);
							}
						//case "keydown":
						case 'focus':
						case 'mouseup':
							InsertWildCard.position.title = getInputSelectPosition(me.getForm(id));
							//检验长度
							me.checkLength(id);
							me.preview(id);
						break;
					}
				break;
				case me.dom.desc1.input:	//描述1
					switch(eventType){
						
						case 'keyup':
							// 补全通配符
							wildcardAuto(e);
							if(e.shiftKey && e.keyCode == '54'){ //输入断句符 ^，则替换为\n
								var target = e.target || e.srcElement;
							    var pos = getCursorPosition(target);
								var lineBreak = target.value.substr(pos - 1, 1);
								if(lineBreak == '^'){	//防止用户是带着输入法的，则输入就不是^
							        var str = target.value.substr(0, pos - 1) + '\n' + target.value.substr(pos);
							        target.value = str;
									movePoint(target,pos - 5);
								} 					
							}
						
						//case "keydown":
						case 'focus':
						case 'mouseup':
							InsertWildCard.position.desc1 = getInputSelectPosition(me.getForm(id));
							//检验长度
							me.checkLength(id);
							me.preview(id);
						break;
					}
				break;
				case me.dom.desc2.input:	//描述2
					switch(eventType){
						case 'keydown':
							if(e.keyCode == '13'){ //描述2禁止输入回车符
								if(e.preventDefault){
									e.preventDefault();
								}
								return false;
							}
						break;
						case 'keyup':
							// 补全通配符
							wildcardAuto(e);
						//case "keydown":
						case 'focus':
						case 'mouseup':
							InsertWildCard.position.desc2 = getInputSelectPosition(me.getForm(id));
							//检验长度
							me.checkLength(id);
							me.preview();
						break;
					}
				break;
				case me.dom.href.input:	//访问URL
				case me.dom.mhref.input: //yidong访问URL
					switch(eventType){
						
						case 'keyup':
						//case "keydown":
						case 'focus':
						case 'mouseup':
							//检验长度
							me.checkLength(id);
							if(noPreview != true){//单独批量修改创意的时候，不触发预览
								me.preview();
							}
							
						break;
						case 'blur':
						    if(id == me.dom.mhref.input){
						         if (!ideaAuth 
						         	|| me.getForm(me.dom.murl.input).value == ''
						         	|| me.getForm(me.dom.murl.input).value == nirvana.config.LANG.DIFFERENCE) {
                                // 如果有显示URL的权限 或者 显示URL为空， 则将url处理后填入显示url，去掉http://头，只保留域名部分并且有长度限制
                                var inputEle = me.getForm(me.dom.murl.input);
                                inputEle.value = me.removeIdeaUrlPrefix(baidu.trim(me.getForm(id).value),me.getShowUrltoCut()).split('/')[0].substr(0, IDEA_MURL_MAX_LENGTH);
                                baidu.removeClass(inputEle, "gray");//各异两个文字是灰色
                            }
						    }
						    else {
						      if (!ideaAuth 
						      	|| me.getForm(me.dom.url.input).value == ''
						      	|| me.getForm(me.dom.url.input).value == nirvana.config.LANG.DIFFERENCE) {//各异的时候也是没填
						        // 如果有显示URL的权限 或者 显示URL为空， 则将url处理后填入显示url，去掉http://头，只保留域名部分并且有长度限制
						        var inputEle = me.getForm(me.dom.url.input);
						        inputEle.value = me.removeIdeaUrlPrefix(baidu.trim(me.getForm(id).value),me.getShowUrltoCut()).split('/')[0].substr(0, IDEA_URL_MAX_LENGTH);
						        baidu.removeClass(inputEle, "gray");//各异两个文字是灰色
						     }  
						    }
						break;
					}
				break;
				case me.dom.url.input:	//显示URL
				case me.dom.murl.input: //yidong显示URL
					switch(eventType){
						case 'keyup':
						//case "keydown":
						case 'focus':
						case 'mouseup':
							//检验长度
							me.checkLength(id);
							if(noPreview != true){//单独批量修改创意的时候，不触发预览
								me.preview();
							}
						break;
					}
				break;
			};
			
			if(eventType == 'blur'){
				// 清空提示信息，不是错误信息
				infoObj.innerHTML = '';
			}
			if(eventType != 'keydown' && eventType != 'focus'  && eventType != 'blur'
			   && !me.checkErrorStatus()){
				me.hideError(id,'clearAll');	//如果没有发生任何错误，则清空
			}
		}
	},
	
	/**
	 * 检查输入长度，即时提示输入长度，并且判断是否超过字符限制
	 * @param {Object} id 输入框id
	 */
	checkLength : function(id){
		var me = this,
			maxLength = 0,
		 	minLength = 0,
			type = this.getType(id),
			infoObj = baidu.g(me.dom[type].info),
			length = me.getLength(me.getForm(id).value);
			
		eval("maxLength = " + 'IDEA_' + type.toUpperCase() + '_MAX_LENGTH');
		eval("minLength = " + 'IDEA_' + type.toUpperCase() + '_MIN_LENGTH');
		
		var offset = maxLength - length;
		if(offset >= 0){
			infoObj.innerHTML = "还可以输入" + offset + "个字符";
			me.hideError(id, 'overLength');
		} else {
			infoObj.innerHTML = "已经超过字符长度限制";
			me.showError(id, 'overLength', "您最多可以输入" + maxLength + "个字符");
			return false;
		}
		
		return true;
	},
	
	/**
	 * 检查输入长度是否低于最小长度限制，用于title和desc1
	 * @param {Object} id
	 */
	checkLimitLength : function(id){
		var me = this,
		 	limitLength = 0,
			type = this.getType(id),
			typeName = me.typeName[type],
			infoObj = baidu.g(me.dom[type].info),
			length = me.getLength(me.getForm(id).value);
			
		eval("limitLength = " + 'IDEA_' + type.toUpperCase() + '_PROPER_LENGTH');
		
		if(length <= limitLength){
			me.showError(id, 'limitLength', '为保障展现效果，请输入超过' + limitLength + '个字符的' + typeName);
			return false;
		} else {
			me.hideError(id, 'limitLength');
		}
		return true;
	},
	
	/**
	 * 判断长度不能为空，描述2可以为空
	 * @param {Object} id
	 */
	checkMinLength : function(id){
		var me = this,
		 	minLength = 0,
			type = this.getType(id),
			typeName = me.typeName[type],
			infoObj = baidu.g(me.dom[type].info),
			length = me.getLength(me.getForm(id).value);
			
		eval("minLength = " + 'IDEA_' + type.toUpperCase() + '_MIN_LENGTH');
		
		if(length < minLength){
			me.showError(id, 'underLength',typeName + '不能为空');
			return false;
		} else {
			me.hideError(id, 'underLength');
		}
		return true;
	},
	
	/**
	 * 检查预览区的断句符宽度
	 * @param {Object} id
	 */
	checkSplitWidth : function(id){
		if(typeof id == 'undefined'){
			return false;
		}
		var me = this,
			width = 0,
			maxLength = 0,
			maxWidth = 0,
			type = this.getType(id),
			infoObj = baidu.g(me.dom[type].info),
			obj	= baidu.g(me.dom.preview.im); //右侧推广预览位
		
		// 匹配断句符，将描述一的第一个\n还原回^
		var match = me.getForm(id).value.replace(/\r?\n/,'^').match(/\^/g);
		if(!match){ // 没有断句符，则直接返回
			return true;
		}
		
		// 右侧推广预览位的描述宽度必须为270px
		eval("maxWidth = " + 'IDEA_' + type.toUpperCase() + '_SPLIT_WIDTH');
		eval("maxLength = " + 'IDEA_' + type.toUpperCase() + '_SPLIT_LENGTH');
		
		switch(type){
			case 'title':
				var fragment = obj.getElementsByTagName('span');
				if(fragment[0].offsetWidth > maxWidth 
					|| fragment[0].offsetHeight > IDEA_SINGLE_LINE_HEIGHT){ // 创意标题宽度过大或者高度过大（即出现换行）
					
					infoObj.innerHTML = '断句符插入过晚，系统会自动忽略';
					me.ignoreLineBreak[type] = true;
				}
			break;
			case 'desc1':
				var fragment = obj.getElementsByTagName('p');
				if(fragment[0].offsetWidth > maxWidth || fragment[0].offsetHeight > IDEA_SINGLE_LINE_HEIGHT){
					//描述一的内容已经自然换行，则忽略断句符
					infoObj.innerHTML = '断句符插入过晚，系统会自动忽略';
					me.ignoreLineBreak[type] = true;
					
					//刷新预览区域使其忽略断句符
					var pInImPreview = baidu.g(me.dom.preview.im).getElementsByTagName('p');
					if(pInImPreview.length == 3){	//是否存在断行符号
						// 合并描述一两行内容，删除换行p
						pInImPreview[0].innerHTML = pInImPreview[0].innerHTML + pInImPreview[1].innerHTML;
						pInImPreview[1].parentNode.removeChild(pInImPreview[1]);
					}
				} else if(fragment.length == 3 && 
						(fragment[1].offsetWidth > maxWidth || fragment[1].offsetHeight > IDEA_SINGLE_LINE_HEIGHT)){
					// 第二行p自然换行
					infoObj.innerHTML = '断句符插入过早，可能影响展现效果';
				}
				break;
		}
		
	},
	
	/**
	 * 检查断句符
	 * @param {Object} id IdeaTitle 或者 IdeaDesc1
	 */
	checkLinebreak : function(id){
		var me = this,
			type = this.getType(id),
			errorObj = baidu.g(me.dom[type].error),
			input = IDEA_CREATION.getForm(id),
			match;
		
		switch(id){
			case me.dom.desc1.input:
				//描述一，需要把换行符^替换成\n
				if(input.value.match(/\^/g)){
					input.value = input.value.replace(/\^/g,'\n');
				}
				//得到['\n', '\n']数组或者null
				match = input.value.match(/\n/g);
				break;
			case me.dom.title.input:
			default:
				//得到['^', '^']数组或者null
				match = input.value.match(/\^/g);
				break;
		}
		
		if(match && match.length > 0){ // 有一个断句符，则禁用断句符按钮
			baidu.addClass(('IdeaLinebreak' + id.substr(4)), 'disable');
		} else {
			baidu.removeClass(('IdeaLinebreak' + id.substr(4)), 'disable');
		}
		
		if(match && match.length > 1){ // 超过一个断句符，则提示用户错误
			me.showError(id, 'overLinebreak', '您仅需要输入一个断句符');
			return false;
		} else {
			me.hideError(id, 'overLinebreak');
		}
		return true;
	},
    
    
    getType : function(id) {
        var type = id.substr(4).toLowerCase();
        if(id == 'MIdeaHref') {
            type = 'mhref';
        } else if(id == 'MIdeaUrl') {
            type = 'murl';
        }
        return type;
    },

	/**
	 * 检查断句符的位置
	 * @param {Object} id IdeaTitle 或者 IdeaDesc1
	 */
	checkLinebreakPos : function(id){
		var me = this,
			type = this.getType(id),
			errorObj = baidu.g(me.dom[type].error);
		
		switch(id){
			case me.dom.title.input:
				var match = me.getForm(id).value.match(/^\^|\^$|\{[^\}]*\^[^\{]*\}/); //不能在开头，不能在结尾，不能在通配符中	
			break;
			case me.dom.desc1.input:
				var match = me.getForm(id).value.match(/^\r?\n|\n$|\{[^\}]*\n[^\{]*\}/); //不能在开头，不能在结尾，不能在通配符中	
			break;
		}
		if(match && match.length > 0){
			me.showError(id, 'posLinebreak', '断句符位置错误已影响展现效果，请您调整');
			return false;
		} else {
			me.hideError(id, 'posLinebreak');
		}
		return true;
	},
	
	/**
	 * 检查通配符是否为空
	 * @param {Object} id
	 */
	checkWildCardEmpty : function(id){
		var me = this,
			match,
			type = this.getType(id),
			errorObj = baidu.g(me.dom[type].error);
		
		var test = (/\{[\s]*\}/).test(me.getForm(id).value);	
		
		if(test){
			me.showError(id, 'emptyWildCard', '创意默认关键词不能为空');
			return false;
		} else {
			me.hideError(id, 'emptyWildCard');
		}
		return true;
	},
	
	/**
	 * 验证所有通配符，如果有嵌套，则弹出确认框 ui.Dialog.confirm
	 * @param {Object} id
	 * @return {String} message
	 */
	checkWildCardFormat : function(id) {
		var me = this,
	   		field = [];
		
		field[field.length] = baidu.trim(me.getForm(id).value);
		
	    var length = field.length;
	    
	    var stack = []; //验证嵌套的堆栈 {{}  {}}
	    var counter = {
	        '{': 0,
	        "}": 0
	    }; //双侧括号计数器
	    var isNested = false; //是否嵌套
	    for (var i = 0; i < length; i++) { //遍历三个文字输入框
	        var str = field[i];
	        
	        //暂时替换:{和:}为占位符号
	        //str = str.replace(/:\{/g, BracketsReplacer[0]).replace(/:\}/g, BracketsReplacer[1]);
	        var slen = str.length;
	        for (var j = 0; j < slen; j++) { //遍历字符串
	            var chr = str.charAt(j);
	            if (chr === '{' || chr === '}') { //遇大括号
	                counter[chr]++; //计数器自增
	                if (stack[stack.length - 1] === chr) { //有嵌套
	                    isNested = true;
	                }
	                stack[stack.length] = chr; //入堆栈
	            }
	        }
	    }
	    if (isNested || counter['{'] != counter['}']) { // 有嵌套或者{与}的数量不相等
			return '您的创意中可能包含错误的通配符。请您参照支持中心中通配符的使用方式进行修改。';
	    } else {
	        return '';
	    }
	
	},
	
	/**
	 * 检查是否超过存储长度，{内容}-->{关键词}{内容}
	 * @param {Object} id
	 */
	checkStorageLength : function(id){
		var me = this,
			match,
			maxStorageLength = 0,
			type = this.getType(id),
			typeName = me.typeName[type],
			errorObj = baidu.g(me.dom[type].error),
			val = me.getForm(id).value.replace(/\r?\n/g,'^');
		
		if(me.ignoreLineBreak[type] == true){	//忽略断句符时不计算断句符
			val = val.replace(/\^/g,'');
		}
		eval("maxStorageLength = " + 'IDEA_' + type.toUpperCase() + '_STORAGE_LENGTH');
		var storageLength = getLengthCase(ideaToOldFormat([val])[0]);
		if(storageLength > maxStorageLength){
			me.showError(id, 'overStorage', typeName + '超过最大存储限制，请缩短' + typeName);
			return false;
		} else {
			me.hideError(id, 'overStorage');
		}
		return true;
	},

	/**
	 * 移动创意预览的时候下方应该显示的内容 url、电话、商桥
	 */
	getMobileBottomShow : function(){
        var me = this;
        var resultStr = [];
        var getPhoneStr=function(){
            var phoneHtml = []; 
            phoneHtml[phoneHtml.length] = '<p class="phonenum">';
			phoneHtml[phoneHtml.length] = '	<span class="icon-phone-left left"></span>';
			phoneHtml[phoneHtml.length] = '	<span class="plh-local-phonenum left">'  + me.idea_phone.phoneNumber + '</span>';
			phoneHtml[phoneHtml.length] = '	<span class="icon-phone-right left"></span>';
			phoneHtml[phoneHtml.length] = '</p>';
			return phoneHtml.join('');
        };
         var getBridgeStr=function(only){
            var bridgeHtml = []; 
            if(only){
              bridgeHtml[bridgeHtml.length] = '<p class="idea-brige-icon-only"></p>';
            }else{
              bridgeHtml[bridgeHtml.length] = '<p class="idea-brige-icon"></p>';
			
            }
           return bridgeHtml.join('');
        };
        if(me.idea_phone.phoneNumber!='' && me.idea_phone.bridgeStat){//电话商桥都有 都显示
            resultStr[resultStr.length] = getPhoneStr();
            resultStr[resultStr.length] = getBridgeStr(false);
           }
        else if(me.idea_phone.phoneNumber!=''){//只有电话
              resultStr[resultStr.length] = getPhoneStr();
           }
           else{//只有商桥
           	  resultStr[resultStr.length] = getBridgeStr(true);
           }
           return resultStr.join('');
           
	},
	/**
	 * 三个推广位预览
	 * @param {Object} id
	 */
	preview : function(id){
		var me = this,
			idea = me.getInput(),
			ppHtml = [],
			ppimHtml = [],
			imHtml = [],
			phoneHtml = [];
		// add by huanghainan
		if(idea[6]=='' && idea[4]!=''){//移动显示url不填时，用显示url
		    idea[6] = idea[4];
		}
        me.editIdeaStyleChange(me.idea_phone.devicePrefer);
        
		// idea = [title, desc1, desc2, href, url]
		for (var i = 0, j = idea.length; i < j; i++){
			if(i == 2){ //描述2仅当描述1和描述2均为空时才显示默认
				if (idea[i - 1] == DEF_IDEA[i - 1] && !idea[i]) {
					idea[i] = DEF_IDEA[i];
				}
			} else {
				idea[i] = idea[i] || DEF_IDEA[i];
			}
		}
		// 显示URL为空或者没有显示URL权限时
	                       
		if (idea[4] == '' || !ideaAuth) {
	        idea[4] = me.removeIdeaUrlPrefix(idea[3] , me.getShowUrltoCut()).split('/')[0];
	    }
		
		var type = ['title','desc1','desc2','href','url','mhref','murl'];
		for (var i = 0, j = type.length; i < j; i++){
			eval("var maxLength = " + 'IDEA_' + type[i].toUpperCase() + '_MAX_LENGTH');
			
			// 截断创意内容为最长显示内容
			if(me.getLength(idea[i]) > maxLength){
				idea[i] = me.cutIdeaString(idea[i],maxLength);
			}
		}
		
		//PP广告
		ppHtml.push('<h4>' + me.removeLineBreak(wildcardToShow(idea[0])) + '</h4>');
		ppHtml.push('<p>'  + (me.removeLineBreak(wildcardToShow(idea[1] + idea[2]))) + '</p>');
		ppHtml.push('<p class="url">'  + baidu.encodeHTML(idea[4]) + '</p>');
		
		//PPIM广告
		ppimHtml.push('<h4>' + me.removeLineBreak(wildcardToShow(idea[0])) + '</h4>');
		ppimHtml.push('<p>'  + me.removeLineBreak(wildcardToShow(idea[1])));
		ppimHtml.push('<span class="url">'  + baidu.encodeHTML(idea[4]) + '</span></p>');
	    
		//移动广告预览 add by huanghainan
		var phoneDesc = idea[1] + idea[2], len = MOBILEIDEA_PREVIEW_MAX_LENGTH;
		if (me.getLength(phoneDesc) > len) {
			phoneDesc = me.cutIdeaString(phoneDesc, len) + "..";
		}
        phoneHtml[phoneHtml.length] = '<h4><span>' + me.removeLineBreak(wildcardToShow(idea[0])) + '</span></h4>';
        phoneHtml[phoneHtml.length] = '<p>'  + me.removeLineBreak(wildcardToShow(phoneDesc)) + '</p>';
       
        var phoneShowUrl = idea[4];
       
        if(me.idea_phone.devicePrefer == 0){
            phoneShowUrl = idea[6];
        }
        if(me.idea_phone.unitHasApp){//只要配置了app就显示url
            phoneHtml[phoneHtml.length] = '<p class="url">'  + baidu.encodeHTML(phoneShowUrl) + '</p>';

        }else if(me.idea_phone.phoneNumber == ""&&!me.idea_phone.bridgeStat){//电话和商桥都没有也显示url
            phoneHtml[phoneHtml.length] = '<p class="url">'  + baidu.encodeHTML(phoneShowUrl) + '</p>';
        }else{
        	phoneHtml[phoneHtml.length] = me.getMobileBottomShow();
       

        }
       



       /* if(me.idea_phone.phoneNumber == ""||(me.idea_phone.phoneNumber != ""&&me.idea_phone.unitHasApp) ){//没有电话
            //baidu.hide('modifyPhoneTip');
        }else{
            phoneHtml[phoneHtml.length] = '<p class="phonenum">';
			phoneHtml[phoneHtml.length] = '	<span class="icon-phone-left left"></span>';
			phoneHtml[phoneHtml.length] = '	<span class="plh-local-phonenum left">'  + me.idea_phone.phoneNumber + '</span>';
			phoneHtml[phoneHtml.length] = '	<span class="icon-phone-right left"></span>';
			phoneHtml[phoneHtml.length] = '</p>';
			//baidu.show('modifyPhoneTip');
        }*/
        
        
	
		//右侧IM广告标题
		var haveTitleLineBreak = idea[0].match(/\^/g);
		var title = idea[0].replace(/\^(.*)/g, '');//从断句符位置切开标题
		
		if(me.getLength(title) > IDEA_TITLE_SPLIT_LENGTH){
			var maxLength = IDEA_TITLE_SPLIT_LENGTH;
			title = me.cutIdeaString(title, maxLength);
			if(haveTitleLineBreak){	//是否已有断句符
				if(typeof id != 'undefined' && id == me.dom.title.input){
					baidu.g(me.dom.title.info).innerHTML = '断句符插入过晚，系统会自动忽略';
				}
				me.ignoreLineBreak.title = true;
			}
		}
		title =  wildcardToShow(title);	
		
		var haveDesc1LineBreak = idea[1].match(/\^/g);
		idea[1] = idea[1].split('^');
		var desc1 =[];
		desc1[0] = idea[1][0];//切除第一个断句符前的内容
		desc1[1] = idea[1].slice(1).join('');//之后的断句符忽略
		
		if(haveDesc1LineBreak && me.getLength(desc1[0]) > IDEA_DESC1_SPLIT_LENGTH){
			if(typeof id != 'undefined' && id == me.dom.desc1.input){
				baidu.g(me.dom.desc1.info).innerHTML = '断句符插入过晚，系统会自动忽略';
			}
			me.ignoreLineBreak.desc1 = true;
			haveDesc1LineBreak = false;
		}
		
		if(me.getLength(desc1[1]) > IDEA_DESC1_SPLIT_LENGTH){
			var maxLength = IDEA_DESC1_SPLIT_LENGTH;
			desc1[1] = me.cutIdeaString(desc1[1], maxLength);
			//此时必有断句符存在，不用判断是否已有断句符
			if (typeof id != 'undefined' && id == me.dom.desc1.input) {
				baidu.g(me.dom.desc1.info).innerHTML = '断句符插入过早，可能影响展现效果';
			}
		}
		
		if(haveDesc1LineBreak){
			desc1[0] = wildcardToShow(desc1[0]);
			desc1[1] = wildcardToShow(desc1[1]);
			idea[1] = desc1.join('</p><p>');
		} else {
			idea[1] = wildcardToShow(idea[1].join(''));
		}
		imHtml[imHtml.length] = '<h4><span>' + title + '</span></h4>';
		imHtml[imHtml.length] = '<p>'  + idea[1] + '</p>';
		imHtml[imHtml.length] = '<p class="url">'  + baidu.encodeHTML(idea[4]) + '</p>';
		
		baidu.g(me.dom.preview.pp).innerHTML = ppHtml.join('');
        baidu.g(me.dom.preview.ppim).innerHTML = ppimHtml.join('');
        baidu.g(me.dom.preview.im).innerHTML = imHtml.join('');
        baidu.g(me.dom.preview.phone).innerHTML = phoneHtml.join('');
          //console.log(phoneHtml.join(''));
		me.checkSplitWidth(id);
		
		//me.setInputAreaWidth();//现在左面的高度不会比右面小了 不需要手动改高度了 yanll，否则影响移动url区域的显示
	},
	
	/**
	 * 设置左边编辑区的高度，让背景色充满整个左屏
	 
	setInputAreaWidth: function(){
		var inputArea = baidu.g("IdeaInput"), 
		    previewArea = baidu.g("IdeaRightArea");
		if (inputArea.offsetHeight < previewArea.offsetHeight) {
			//inputArea.style.height = previewArea.offsetHeight + "px";
		}
	}, */
	
	
	/**
	 * 在仅移动推广和其它推广方式切换时，对左侧编辑栏和右边预览的影响
	 * type同deviceType，为2时为仅移动推广，为0时为全部，为1时为仅计算机
	 */
	editIdeaStyleChange: function(type){
		var me = this;
		baidu.hide('ideaComputerPreview');
		baidu.hide('ideaPhonePreview');
		baidu.hide('previewPhoneUrl');
		baidu.hide('MpreviewPhoneUrl');
		if (type == 2) {
			me.changeToMobileChar();
			
			baidu.show('ideaPhonePreview');
			//baidu.show('previewPhoneUrl');
		}
		else {
			baidu.g('IdeaHrefTitle').innerHTML = "默认访问URL：";
			baidu.g('IdeaUrlTitle').innerHTML = "默认显示URL：";
			baidu.show('ideaComputerPreview');
			if (type == 0) {
				//baidu.show('previewPhoneUrl');
				baidu.show('ideaPhonePreview');
			}
		} 
		if (type == 0) {//全部设备显示专门的移动区域的
		    baidu.setAttr("MpreviewPhoneUrl", "href",
		    	MOBILE_PREVIEW_PATH + nirvana.env.USER_ID);
            baidu.show('MpreviewPhoneUrl');
		} 
		else if (type == 2) {
		    baidu.setAttr("previewPhoneUrl", "href",
		    	MOBILE_PREVIEW_PATH + nirvana.env.USER_ID);
		    baidu.show('previewPhoneUrl');
		}
	},
	
	changeToMobileChar : function(idea){
		baidu.g('IdeaHrefTitle').innerHTML = "移动访问URL：";
		baidu.g('IdeaUrlTitle').innerHTML = "移动显示URL：";
		//baidu.g('IdeaHrefError').innerHTML = "移动访问URL不能为空";
		//baidu.g('IdeaUrlError').innerHTML = "移动显示URL不能为空：";
	},
	
	/**
	 * 填充默认创意
	 * @param {Object} idea
	 */
	fillInit: function(idea){
	    var me = this;
		
		me.clearError();
		var toCutPrefix = ['http://'];
		var oldIdea = [
		               baidu.decodeHTML(baidu.decodeHTML(idea.title)).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\n/g, '\\n'),
					   baidu.decodeHTML(baidu.decodeHTML(idea.desc1)).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\n/g, '\\n').replace(/\^/g, '\n'),
					   baidu.decodeHTML(baidu.decodeHTML(idea.desc2)).replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\n/g, '\\n'),
					   ];
		
		oldIdea = ideaToNewFormat(oldIdea);
		
		me.getForm(IDEA_CREATION.dom.title.input).value = oldIdea[0];
		me.getForm(IDEA_CREATION.dom.desc1.input).value = oldIdea[1];
		me.getForm(IDEA_CREATION.dom.desc2.input).value = oldIdea[2];
	    //填充普通创意
	    me.fillUrl(idea);
	    //填充移动创意
	    me.fillMurl(idea);
	},
	
	/**
	 *填充url 
	 * @param {object} idea信息
	 */
	fillUrl : function(idea){
		var me = this;
		var toCutPrefix = ['http://'];
		var oldIdea = [
		               me.removeIdeaUrlPrefix(baidu.decodeHTML(baidu.decodeHTML(idea.url.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\n/g, '\\n'))),toCutPrefix),
					   baidu.decodeHTML(baidu.decodeHTML(idea.showurl.replace(/\n/g, '\\n'))),
					  ];
		
		//oldIdea = ideaToNewFormat(oldIdea);
		me.getForm(IDEA_CREATION.dom.href.input).value = oldIdea[0];
		me.getForm(IDEA_CREATION.dom.url.input).value = oldIdea[1];
		
	},
	
	/**
	 *填充移动url 
	 * @param {object} idea信息
	 */
	fillMurl : function(idea){
		var me = this;
		var toCutPrefix = ['http://'];
		var oldIdea = [
		               me.removeIdeaUrlPrefix(baidu.decodeHTML(baidu.decodeHTML(idea.miurl.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\n/g, '\\n'))),toCutPrefix),
                       baidu.decodeHTML(baidu.decodeHTML(idea.mshowurl.replace(/\n/g, '\\n')))
                      ];
		
		//oldIdea = ideaToNewFormat(oldIdea);
		me.getForm(IDEA_CREATION.dom.mhref.input).value = oldIdea[0];
        me.getForm(IDEA_CREATION.dom.murl.input).value = oldIdea[1];
       
	},
	
	/**begin 5月全投转全后 ，该段代码就没用了**/
	showIdeaPhoneToggleArea:function(){
	     var tip =  baidu.g("ideaPhoneUrlTips");
	     var ideaPhoneToggleArea = baidu.g("ideaPhoneToggleArea");
	     baidu.removeClass(ideaPhoneToggleArea, 'hide');
         baidu.addClass(tip, 'hide');
         baidu.g('ideaPhoneToggleIcon').innerHTML = '-'; 
	},
	
	hideIdeaPhoneToggleArea:function(){
	     var tip =  baidu.g("ideaPhoneUrlTips");
	     var ideaPhoneToggleArea = baidu.g("ideaPhoneToggleArea");
	     if(baidu.g('ideaPhoneToggleIcon')){
	     	 baidu.removeClass(tip, 'hide'); 
             baidu.addClass(ideaPhoneToggleArea, 'hide');
             baidu.g('ideaPhoneToggleIcon').innerHTML = '+';  
	     }
         
    },
	toggleIdeaPhone:function(){
	    var me = this;
        var ideaPhoneToggleArea = baidu.g("ideaPhoneToggleArea");
        if(baidu.dom.hasClass(ideaPhoneToggleArea, 'hide')){
           me.showIdeaPhoneToggleArea();
        }else{
           me.hideIdeaPhoneToggleArea();
        }
    },
    /********end */
    
	/**
	 * 获取输入内容长度
	 * @param {Object} str
	 */
	getLength : function(str){
		/**
		 * 此处逻辑比较有趣
		 * 无论是通配符还是带有冒号转义的大括号，大括号出现时均会带来两个字节的占用（通配符的大括号本身或转义符冒号），{} or :{
		 * 因此只需将大括号替换为空即可得到实际字符数
		 */
		str = ideaToNewFormat(ideaToOldFormat([str]))[0];
    	str =  str.replace(/\{/g, '').replace(/\}/g, '');
		//断句符不计入长度
		return getLengthCase(str.replace(/\^/g,'').replace(/\r?\n/g,''));
	},
	
	/**
	 * 创意专用截断函数，计算长度时会忽略{,},^,\n
	 * @param {Object} str
	 * @param {Object} len
	 */
	cutIdeaString : function(str, len){
		var me = this;
		while(me.getLength(str) > len){
			str = str.substr(0,str.length - 1);
		}
		return str;
	},
	
	
	/**
	 * 若带入ideaid，则获取创意内容/影子创意内容
	 * @param {Object} data
	 */				
	getSourceIdeaData: function(data){
	    var basicInfo, extendData = {}, prefix, ideaData;
		
		basicInfo = ["title", "desc1", "desc2", "url", "showurl","miurl", "mshowurl"];
		ideaData = {
			deviceprefer: data.deviceprefer,
			devicecfgstat: data.devicecfgstat
		};
		prefix = data.shadow_ideaid ? "shadow_" : "";
		for (var i = 0, len = basicInfo.length; i < len; i++) {
			extendData[basicInfo[i]] = data[prefix + basicInfo[i]];
		}
		baidu.extend(ideaData, extendData);
		
		return ideaData;
	},
	
	/**
	 * 获取创意内容
	 */
	getInput : function(){
	   var me = this,
			title = me.getForm(me.dom.title.input).value,
	    	desc1 = me.getForm(me.dom.desc1.input).value.replace(/\r/g, '').replace(/\n/g,'^'),
	    	desc2 = me.getForm(me.dom.desc2.input).value,
	    	href = me.getForm(me.dom.href.input).value,
	    	url = me.getForm(me.dom.url.input).value,
	    	mhref = me.getForm(me.dom.mhref.input).value,
            murl = me.getForm(me.dom.murl.input).value;
                     
		if (!ideaAuth || url == '') {
	        url = me.removeIdeaUrlPrefix(href,me.getShowUrltoCut()).split('/')[0].substr(0, IDEA_URL_MAX_LENGTH);
	    }
	     if (!ideaAuth || murl == '') {
            murl = me.removeIdeaUrlPrefix(mhref,me.getShowUrltoCut()).split('/')[0].substr(0, IDEA_MURL_MAX_LENGTH);
        }
	    return [title, desc1, desc2, href, url, mhref, murl];
	},
	
	/**
	 * 清除用户输入
	 * @author tongyao@baidu.com wanghuijun@baidu.com
	 */
	clearInput : function(){
		var me = this;
		
		me.getForm(me.dom.title.input).value = '';
		me.getForm(me.dom.desc1.input).value = '';
		me.getForm(me.dom.desc2.input).value = '';
		me.getForm(me.dom.href.input).value = '';
		me.getForm(me.dom.url.input).value = '';
		me.getForm(me.dom.mhref.input).value = '';
        me.getForm(me.dom.murl.input).value = '';
	},
	
	/**
	 * 检查输入是否为空
	 */
	checkInputEmpty : function(){
		return this.getInput().join('') == '';
	},
	
	/**
	 * 删除断句符
	 */
	removeLineBreak : function(str){
		return str.replace(/\^/g,'');
	},
	
	/**
	 * 显示错误信息
	 * @param {Object} id
	 * @param {Object} errorType
	 * @param {Object} msg
	 */
	showError : function(id, errorType, msg){
		var me = IDEA_CREATION,
			type = this.getType(id),
			errorObj = baidu.g(me.dom[type].error),
			errorType = '_' + errorType;
			
		if(!me.errorStatus[type]){
			me.errorStatus[type] = type + errorType;
			baidu.removeClass(errorObj, 'hide');
			errorObj.innerHTML = msg;
		}
	},
	
	/**
	 * 隐藏错误提示
	 * @param {Object} id
	 * @param {Object} errorType
	 */
	hideError : function(id, errorType){
		var me = IDEA_CREATION,
			type = this.getType(id),
			errorObj = baidu.g(me.dom[type].error),
			errorType = '_' + errorType;
			
		if(errorType == '_clearAll' || me.errorStatus[type] == (type + errorType) || !me.errorStatus[type]){
			baidu.addClass(errorObj, 'hide');
			errorObj.innerHTML = '';
			me.errorStatus[type] = '';
		}
	},
	
	/**
	 * 清空错误信息
	 */
	clearError : function(){
		var me = this,
			dom = me.dom;
			
	    me.hideError(dom.title.input,'clearAll');
	    me.hideError(dom.desc1.input,'clearAll');
		me.hideError(dom.desc2.input,'clearAll');
		me.hideError(dom.href.input,'clearAll');
		me.hideError(dom.mhref.input,'clearAll');
	    if (ideaAuth) {
	        me.hideError(dom.url.input,'clearAll');
	        me.hideError(dom.murl.input,'clearAll');
	    }
		if (baidu.g('IdeaError')) {
			baidu.addClass('IdeaError', 'hide');
		}
	},
	
	/**
	 * 检查error状态，如果为空，则返回''，其余则返回一长串字符串
	 */
	checkErrorStatus : function(){
		var me = this,
			status = me.errorStatus,
			array = [];
		
		for (var i in status){
			array[array.length] = status[i];
		}	
		return (array.join(''));
	},
	
	/**
	 * 验证创意
	 */
	validate : function(type){
	   var me = this,
			input,
			type = type,
			error = 0,
			notice = [],
			inputid;
		if(typeof type == 'undefined'){//不传type的时候默认为验证好多字段
			var type = ['title','desc1','desc2','href','url','mhref','murl'];
		}
		if(!ideaAuth){
			type = type.slice(0,4);
		}
			
		for (var i = 0, j = type.length; i < j; i++){
			input = me.getForm(me.dom[type[i]].input);
			inputid = me.dom[type[i]].input;
			input.value = input.value.replace(/^[ \t\u3000\xa0]+|[ \t\u3000\xa0]+$/g, '');	//这里没有用trim，因为trim会过滤\n
			//input.focus();
			//console.log(1111);
			switch(type[i]){
				case "title":
					if(!me.errorStatus[type[i]]){	//是否没有即时检测的错误发生：
					
						me.checkMinLength(inputid); //检测最小字符数
						me.checkLimitLength(inputid);//检测是否低于长度限制
						me.checkLinebreakPos(inputid); //检测断句符位置
						me.checkWildCardEmpty(inputid); //检测通配符是否为空
						me.checkStorageLength(inputid);//检测是否超过存储长度
					}
					
					//提示通配符格式
					var wildcardFormat = me.checkWildCardFormat(inputid);
					if(wildcardFormat){
						notice[notice.length] = wildcardFormat;
					}
					break;
				
				case "desc1":
				
					if(!me.errorStatus[type[i]]){
						
						me.checkMinLength(inputid); //检测最小字符数
						me.checkLimitLength(inputid);//检测是否低于长度限制
						me.checkLinebreakPos(inputid); //检测断句符位置
						me.checkWildCardEmpty(inputid); //检测通配符是否为空
						me.checkStorageLength(inputid);//检测是否超过存储长度
					}
					
					//提示通配符格式
					var wildcardFormat = me.checkWildCardFormat(inputid);
					if(wildcardFormat){
						notice[notice.length] = wildcardFormat;
					}
					break;
					
				case "desc2":
				    //当仅有无线设备时，创意描述二灰掉，不进行验证，同时发送请求中该字段为空///去掉该逻辑
				//    if (!me.idea_phone.phoneOnly) {
						if (!me.errorStatus[type[i]]) {
						
							me.checkMinLength(inputid); //检测最小字符数
							me.checkWildCardEmpty(inputid); //检测通配符是否为空
							me.checkStorageLength(inputid);//检测是否超过存储长度
						}
						//提示通配符格式
						var wildcardFormat = me.checkWildCardFormat(inputid);
						if (wildcardFormat) {
							notice[notice.length] = wildcardFormat;
						}
				//	}
					break;
					
				case "href":
				   if(!me.errorStatus[type[i]]){
                        me.checkMinLength(inputid); //检测最小字符数
                    }
                    break;
				case "mhref":
					if(!me.errorStatus[type[i]]){
						me.checkMinLength(inputid); //检测最小字符数
					}
					var checkMurl = me.validateMURL();//验证移动url和移动显示url是否为都填或者都不填的状态
                    if(checkMurl!=''){
                         me.showError(inputid,'underLength', checkMurl);
                    } 
                    else {
                          me.hideError(inputid, 'underLength');
                    } 
					break;
					
				case "url":
				case "murl":
					//if(!me.errorStatus[type[i]] && ideaAuth){
						me.checkMinLength(inputid); //检测最小字符数
					//}
					break;
			}
			
			error = me.errorStatus[type[i]] || error;
			//input.blur();
		}
		if (error) {
	        return 0;
	    } 
	    if (notice.length > 0) {
				me.noticeConfirm(notice.join('<br /><br />'));
	            return 0;
	        } else {
	            return 1;
	        }
	    
	},
	
	/**
	 * 验证移动url和移动显示url是否为都填或者都不填的状态
     */
	validateMURL:function(){
	    var me = this;
	    var murlInput = me.getForm(me.dom['murl'].input);
        var murlInputValue = murlInput.value.replace(/^[ \t\u3000\xa0]+|[ \t\u3000\xa0]+$/g, '');  //这里没有用trim，因为trim会过滤\n
        var mhrefInput = me.getForm(me.dom['mhref'].input);
        var mhrefInputValue = mhrefInput.value.replace(/^[ \t\u3000\xa0]+|[ \t\u3000\xa0]+$/g, '');  //这里没有用trim，因为trim会过滤\n
       if(murlInputValue != '' && mhrefInputValue== ''){//移动显示url会自动填充，不会出现不填的时候
            return '移动访问URL不能为空';
        }
        else{
            return '';
        }
	},
	
	/**
	 * 保存创意
	 */
	save : function(action,add) {
		var me = this;
		
		me.action = action; // 保存action
		
		if (me.validate() == 1) { // 参数通过验证
			me.saveIdeaAction(add);
		}
	},
	
	/**
	 * 保存创意请求
	 */
	saveIdeaAction : function(add) {
		var me = this,
			action = me.action;
		
		// 清除错误信息
	    me.clearError();
	    
	    // aka验证
	    var tmp = me.getInput();
		
		/*审核需求html敏感字符取消转义 by linzhifeng@baidu.com 20111020
		for (var i = 0; i < tmp.length; i++) {
			tmp[i] = baidu.encodeHTML(tmp[i]);
		}
		*/
		if(me.ignoreLineBreak.title){ // 忽略断句符
			tmp[0] = tmp[0].replace(/\^/g,'');
			me.ignoreLineBreak.title = false; //重置
		}
		if(me.ignoreLineBreak.desc1){ // 忽略断句符
			tmp[1] = tmp[1].replace(/\^/g,'');
			me.ignoreLineBreak.desc1 = false; //重置
		}
		
		// 发送给后端需要将创意转为旧格式
		tmp = ideaToOldFormat(tmp);
		if (action.arg.type == 'edit'||action.arg.type == 'saveas'&&!add) {		// 编辑创意
			var params = {
                ideaid: action.getContext('ideaid'),
                title: tmp[0],
                desc1: tmp[1],
                desc2: tmp[2],
                url: tmp[3],
                showurl: tmp[4],
                onSuccess: action.saveSuccess(),
                onFail: me.saveFail(action)
             };
              if(me.idea_phone.devicePrefer == 0 ){//全部设备的时候
                params.miurl = tmp[5];
                params.mshowurl = tmp[6];
            }
			fbs.idea.modIdea(params);
			
		} else {
			var planid = action.getContext('planid'),
				unitid = action.getContext('unitid'),
			    params = {
					planid: planid,
					unitid: unitid,
					title: tmp[0],
					desc1: tmp[1],
					desc2: tmp[2],
					url: tmp[3],
					showurl: tmp[4],
					onSuccess: action.saveSuccess(add),
					onFail: me.saveFail(action,add)
				};
            if(me.idea_phone.devicePrefer == 0 ){//全部设备的时候
                params.miurl = tmp[5];
                params.mshowurl = tmp[6];
            }
            fbs.idea.add(params);
		}
		if(action.arg.type == 'saveas'){
			var matchLogParams =  action.arg.matchLogParams;
            if (matchLogParams) {
                if(!add){
                    matchLogParams.target = 'IdeaMatchSave_btn';
                }else{
                    matchLogParams.target = 'IdeaMatchSaveas_btn';
                }
			}
		}
	},
	
	/**
	 * 二次确认
	 * @param {Object} html
	 */
	noticeConfirm : function(html){
		var me = this;
		
		ui.Dialog.confirm({
			title: '提示',
			content: html,
			onok: function(){ // 直接关闭浮出层，不做操作
				if (baidu.g('ctrlbutton__DialogConfirmCancellabel')) {
					baidu.g('ctrlbutton__DialogConfirmCancellabel').innerHTML = '取消';
				}
			},
			// 忽略提示，继续保存
			oncancel: function(){
				me.saveIdeaAction();
				if (baidu.g('ctrlbutton__DialogConfirmCancellabel')) {
					baidu.g('ctrlbutton__DialogConfirmCancellabel').innerHTML = '取消';
				}
			}
		});
		
		// 硬编码修改取消按钮的文字，关闭时需要置回
		if (baidu.g('ctrlbutton__DialogConfirmCancellabel')) {
			baidu.g('ctrlbutton__DialogConfirmCancellabel').innerHTML = '忽略';
		}
		
	},
	
	 /**
     * 创意保存失败，直接关闭子action，刷新父action 
     * 
     * ?? 怎么关闭、刷新的？
     * 此处是直接在子Action对应地方显示错误信息，如果code没对上，则显示alert去提示，并不关闭子action，也不刷新父action
     * note added by LeoWang(wangkemiao@baidu.com)
     */
	saveFail : function(action,add) {
		var me = action;
		
		return function(response) {

			if(!response.errorCode){
				ajaxFailDialog();
				return;
			}

			var data = response.errorCode.code,
				detail = '';
			if(me.arg.matchLogParams&&add){
				me.arg.matchLogParams.ideaid = -1;
			}else if(me.arg.matchLogParams&&!add){
				me.arg.matchLogParams.ideaid = me.arg.ideaid;
			}			
			switch (data) {
				case 703:
					baidu.g('IdeaTitleError').innerHTML = nirvana.config.ERROR.IDEA.ADD[data];
					baidu.removeClass('IdeaTitleError', 'hide');
					break;
				case 704:
					baidu.g('IdeaDesc1Error').innerHTML = nirvana.config.ERROR.IDEA.ADD[data];
					baidu.removeClass('IdeaDesc1Error', 'hide');
					break;
				case 705:
					baidu.g('IdeaDesc2Error').innerHTML = nirvana.config.ERROR.IDEA.ADD[data];
					baidu.removeClass('IdeaDesc2Error', 'hide');
					break;
				case 706:
					baidu.g('IdeaHrefError').innerHTML = nirvana.config.ERROR.IDEA.ADD[data];
					baidu.removeClass('IdeaHrefError', 'hide');
					break;
				case 707:
					baidu.g('IdeaUrlError').innerHTML = nirvana.config.ERROR.IDEA.ADD[data];
					baidu.removeClass('IdeaUrlError', 'hide');
					break;
				case 708:
				case 709:
				case 710:
				case 711:
				case 712:
					baidu.g('IdeaError').innerHTML = nirvana.config.ERROR.IDEA.ADD[data];
					baidu.removeClass('IdeaError', 'hide');
					break;
				case 714:
					detail = response.errorCode.detail;
					
					for (var key in detail) {
						var errMsg = detail[key];
						
						// aka字面依赖
						if (errMsg.indexOf(UC_CV_AKA) != -1) {
							//errMsg = UC_CV_AKA + '<br /><a href="' + UC_CV_LINK + nirvana.env.USER_ID + '" target="_blank">' + UC_CV_LINK + nirvana.env.USER_ID + '</a>';
							errMsg = UC_CV_AKA_SHORT.replace('%d',UC_CV_LINK + nirvana.env.USER_ID);
						}
						
						switch (key) {
							case 'title':
								baidu.g('IdeaTitleError').innerHTML = errMsg;
								baidu.removeClass('IdeaTitleError', 'hide');
								break;
							case 'desc1':
								baidu.g('IdeaDesc1Error').innerHTML = errMsg;
								baidu.removeClass('IdeaDesc1Error', 'hide');
								break;
							case 'desc2':
								baidu.g('IdeaDesc2Error').innerHTML = errMsg;
								baidu.removeClass('IdeaDesc2Error', 'hide');
								break;
							case 'url':
								baidu.g('IdeaHrefError').innerHTML = errMsg;
								baidu.removeClass('IdeaHrefError', 'hide');
								break;
							case 'showurl':
								baidu.g('IdeaUrlError').innerHTML = errMsg;
								baidu.removeClass('IdeaUrlError', 'hide');
								break;
						    case 'miurl':
                                baidu.g('MIdeaHrefError').innerHTML = errMsg;
                                baidu.removeClass('MIdeaHrefError', 'hide');
                                break;
                            case 'mshowurl':
                                baidu.g('MIdeaUrlError').innerHTML = errMsg;
                                baidu.removeClass('MIdeaUrlError', 'hide');
                                break;
							default:
								baidu.g('IdeaError').innerHTML = errMsg;
								baidu.removeClass('IdeaError', 'hide');
								break;
						}
					}
					break;
				    default:
					ajaxFailDialog();
					break;
			}
		};
		
	}



};
