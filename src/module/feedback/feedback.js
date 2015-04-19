
var feedback = (function(){
	
	var papers = [],
	
		paperNum = 0,
	
		idCache = [],
		
		userid = nirvana.env.USER_ID,
		
		// 调研反馈的埋点配置
		// key是后台存储的positionid
		// value是一系列要放置的外围的domid的数组
		FEEDBACK_POSITION_MAP = {
			
			1 : ["__PLAN__"],		//推广管理界面
			
			2 : ["Tools_report"],	//数据报告

			3 : ["acctStat"],		//推广管理入口

			4 : ["Tools_kr"],		//关键词工具

			5 : ["ctrldialogAoPkgCoreWordsDialog"],	//重点词排名优化包
			6 : ["ctrldialogAoPkgBusinessDialog"],	//开拓客源优化包
			7 : ["ctrldialogAoPkgQualityDialog"],	//质量度优化包
			8 : ["ctrldialogAoPkgDecreaseDialog"],	//突降急救优化包
			9 : ["ctrldialogAoPkgRecmwordDialog"],	//智能提词优化包
			10 : ["ctrldialogAoPkgIndustryDialog"],	//行业领先优化包
			11 : ["ctrldialogAoPkgEmergencyDialog"]//突降急救优化包2.0
		},

		finishPaper = [],	//记录完成问卷的cache

		//插入点的style属性
		// class属性设置class
		// isRelative属性来设置父容器的定位为relative,
		// icon属性设置icon的class，light | dark
		AO_COMMON_PROP = {
			right:"50px",
			top:"-2px",
			height:"30px",
			color:"#FFFFFF",
			background:"#262E3E",
			"icon" : "light"
		},
		POSITION_PROP = {
			
			"Tools_report" : {
				right : "165px",
				top : "0px",
				color : "#FFFFFF",
				"class" : "with_background",
				"icon" : "light"
			},

			"Tools_kr" : {
				right : "165px",
				top : "0px",
				color : "#FFFFFF",
				"class" : "with_background",
				"icon" : "light"
			},

			"acctStat" : {
				right: "0px",
				top : "-15px",
				color : "#0033CC",
				background:"#FFFFFF",
				"icon" : "dark"
			},
			"ctrldialogAoPkgCoreWordsDialog" : AO_COMMON_PROP,
			"ctrldialogAoPkgBusinessDialog" : AO_COMMON_PROP,
			"ctrldialogAoPkgQualityDialog" : AO_COMMON_PROP,
			"ctrldialogAoPkgDecreaseDialog" : AO_COMMON_PROP,
			"ctrldialogAoPkgRecmwordDialog" : AO_COMMON_PROP,
			"ctrldialogAoPkgIndustryDialog" : AO_COMMON_PROP,
			"ctrldialogAoPkgEmergencyDialog" : AO_COMMON_PROP
		},

		format = baidu.string.format;
	
	function init(){

		Request({'params':{test:'aaa'}}, function(json){
			var data = json.params.data;
			if(parseInt(data.auth)){
				
				papers = data.listdata;
				paperNum = data.count;
				
				for(var i =0; i < paperNum; i++){
					if(parseInt(papers[i].auth)){
						var domIds = FEEDBACK_POSITION_MAP[papers[i].positionid];
						for(var j =0; j < domIds.length; j++){
							idCache.push({
								paperId : papers[i].paperid,
								domId : domIds[j]
							})
						}
					}
				}
				//监视，每隔500ms执行
				setInterval(monitor, 500);
			}
		}, 'GET/survey/isanswer')
	}
	
	
	function monitor(){
		
		for(var i =0; i < idCache.length; i++){
			
			//这次登录周期中已做过该问卷
			if(finishPaper[idCache[i].paperId]){
				continue;
			}
			
			if(idCache[i].domId == '__PLAN__'){	//推广管理的问卷调查
				if(baidu.g('OverviewWrap') && !baidu.g('FeedbackPlan')){	//插入到通告模块后面
					var con = document.createElement('div');
					baidu.addClass(con, 'col');
					con.id = 'FeedbackPlan';

					var button = document.createElement('div');
					button.innerHTML = '参与';
					baidu.addClass(button, 'entry');
					con.appendChild(button);
					ui.util.create('Button', {'id':'FeedbackPlanEntry'}, button);

					var title = document.createElement('div');
					title.className='title_area';
					var h2 = document.createElement('h2');
					h2.innerHTML = '反馈建议';
					title.appendChild(h2);
					con.appendChild(title);

					button.onclick = (function(paperId){
						return function(){
							loadAnswer(paperId);
						}
					})(idCache[i].paperId)
					// 获取问卷的名称
					Request({
						params : {
							paperid : idCache[i].paperId.toString()
						}
					}, function(json){
						h2.innerHTML = json.params.data.papername;
					}, 'GET/survey/paper');
					
					baidu.q('side')[0].appendChild(con);
				}
			}
			
			if(baidu.g(idCache[i].domId)){

				createEntry( idCache[i].domId, idCache[i].paperId );
			}
		}
	}

	function createEntry( domId, paperId ){

		var container = baidu.g( domId ),
			prop = POSITION_PROP[domId] || {};
		//判断是否存在这个按钮
		if(baidu.q('feedback_entry', container).length){
			return;
		}
		var	entry = document.createElement('div'),
			wrapper = document.createElement('div'),
			icon = document.createElement('div'),
			detail = document.createElement('div');
		
		container.appendChild(entry);
		entry.appendChild(wrapper);
		wrapper.appendChild(icon);
		wrapper.appendChild(detail);

		entry.className = 'feedback_entry';
		entry.id = 'feedbackEntry'+paperId;
		entry.setAttribute('bubblesource', 'feedback');
		wrapper.className = 'wrapper';
		icon.className = 'icon';
		detail.className = 'detail';
		detail.innerHTML = '反馈建议';

		//设置容器的position
		prop.needRelative && (container.style.position = "relative");
		
		for(var propName in prop){
			if(propName != 'needRelative'){
				if( propName == "class" ){
					baidu.addClass(entry, prop["class"]);
				}
				else if(propName == "icon"){
					baidu.addClass(icon, prop["icon"]);
				}
				else{
					entry.style[propName] = prop[propName];
				}
			}
		}
		
		//设置事件
		entry.onclick = (function(paperId){
			return function(){
				loadAnswer(paperId);
			}
		})(paperId);

		baidu.on(entry, "mouseover", function(){
			fxWidth( entry, 90 );
		})

		baidu.on(entry, "mouseout", function(){
			fxWidth( entry, 35 );
		})
	}

	function fxWidth( target, width ){

		var initialWidth;

		var fx = baidu.fx.create( target, {
			initialize : function(){
				initialWidth = parseInt( baidu.getStyle(target, "width") );
			},
			render : function(schedule){
				baidu.setStyle(target, "width", ( (width-initialWidth)*schedule+initialWidth )+"px" );
			}
		}, "baidu.fx.feedback_width");
		fx.launch();
	}
	
	function showPaper(paperId, answer){
		
		Request({
			params : {
				paperid : paperId.toString()
			}
		}, function(json){

			if(json.params.status == 600 || finishPaper[paperId]){
				var wanningDialog = ui.Dialog.factory.create({
					title: '你已经回答过该问卷',
					content: '你已经回答过该问卷。',
					closeButton: false,
					cancel_button: false,
					maskType: 'black',
					maskLevel: 3,
					id: 'AjaxFailDialog',
					width: 300,
					onok : function(){
						wanningDialog.hide();
						wanningDialog.dispose();
					}
				});
				return;
			}
			
			if(json.params.status == 400){
				ui.Dialog.alert({
						title: '提示',
						content: nirvana.config.ERROR.FEEDBACK.readerror
					});
				return ;
			}

			var dialog = ui.util.create('Dialog', {
				id : 'feedbackPaper',
				title : '反馈建议',
				width : 700,
				dragable : true,
				content : '',
				maskLevel : 10
			})
			dialog.show();
			
			//每1分钟保存一次
			var saveIntervalInstance = setInterval(function(){
				saveAnswer(paperId, dialog);
			}, 60000);
			
			dialog.onclose = function(){
				clearInterval(saveIntervalInstance);
				//保存
				saveAnswer(paperId, dialog);
				dialog.dispose();
			}
			
			var body = dialog.getBody(),
				data = json.params.data,
				answer = answer || {},
				html = '<div class="feedback_paper">'+
									'<h4>' + data.papername + '</h4>' +
									'<p class="paper_desc">' + data.paperdesc + '</p>' +
									'<ul style="overflow:auto">';
						
			for(var i =0; i < data.questionlistdata.length; i++){
				
				var question = data.questionlistdata[i];
				question.number = i+1;
				
				var questionTemplate = ['', singleChoice, multipleChoice, misc, score, shortAnswer],
					a = answer[question.questionid] || '';
				
				html += '<li>' + questionTemplate[question.questiontype].call(question, a) + '</li>'
				
			}
			html += '</ul>'+
					'</div>';

			body.innerHTML = html;
			
			var contBody = body.getElementsByTagName("ul")[0],
				maxHeight = 465;
			if(contBody.offsetHeight > maxHeight){
				contBody.style.height = maxHeight + "px";
			}
			
			dialog.getFoot().innerHTML = '<div id="FeedbackSubmitContainer" class="submit">确定</div>'+
										'<div id="FeedbackCancelContainer" class="cancel">取消</div>';
			
			var buttonSubmit = ui.util.create('Button', {id:"feedbackSubmit"}, baidu.dom.g('FeedbackSubmitContainer')),
				buttonCancel = ui.util.create('Button', {id:"feedbackCancel"}, baidu.dom.g('FeedbackCancelContainer'));
				
			buttonSubmit.onclick = function(){
				submit(paperId, dialog);
			}
			buttonCancel.onclick = function(){
				dialog.hide();
				dialog.onclose();
			}
			//
			//如果是打星题的话使用tangram ui中的StarRate绘制
			//
			for(var i =0; i < data.questionlistdata.length; i++){
				var question = data.questionlistdata[i];
				if(question.questiontype == 4) {
					createStarRate(question.questionid, answer[question.questionid])
				}
				else if(question.questiontype == 5){
					var q = baidu.g('feedbackQuestion'+question.questionid),
						textarea = baidu.dom.query('textarea', q)[0],
						countWordInstance,
						valueChangeHandler;

					valueChangeHandler = function(questionid){
						return function(){
							var d = baidu.g('feedbackQuestion'+questionid),
								target = baidu.dom.query('textarea', d)[0],
								text = target.value, 
								maxByte = 280, 
								len = baidu.string.getByteLength(text),
								restWordCount = baidu.q('rest_word_count', baidu.g('feedbackQuestion'+questionid))[0];
								
							if (len > maxByte) {
								target.value = baidu.string.subByte(text, maxByte);
							}
							restWordCount.innerHTML = Math.floor((maxByte - (len > maxByte ? maxByte : len)) / 2);
						}
					};
					
					textarea.onfocus = function(){
						var questionid = this.name.split("_")[1];
						countWordInstance = setInterval(valueChangeHandler(questionid), 200);
					};
					textarea.onblur = function(){
						clearInterval(countWordInstance);
					};
				//	textarea.onchange = valueChangeHandler();
					textarea.onchange = (function(){
						var questionid = this.name.split("_")[1];
						return valueChangeHandler(questionid);
					})();
				}
			}
			
			dialog.resizeHandler();
			
		}, 'GET/survey/paper');
	}
	
	function createStarRate(id, answer){
		var starItemList = [],
			answer = answer || 3;
		for(var i =0; i < 5; i++){
			var starItem = document.createElement('span');
			starItemList.push(starItem);
			starItem.className = 'feedback_starrate_item_hover';
			if(i >= answer){
				starItem.className = 'feedback_starrate_item';
			}
			starItem.onclick = (function(rate){
				return function(){
					for(var i =0; i < rate;i++){
						starItemList[i].className = 'feedback_starrate_item_hover';
					}
					for(var i =rate; i < 5;i++){
						starItemList[i].className = 'feedback_starrate_item';
					}
					
					baidu.dom.g('StarRateInput'+id).value = rate;
				}
			})(i+1);
			
			baidu.dom.g('StarRate'+id).appendChild(starItem);
		}
	}
	
	function getCutRestWord(text){
		var maxByte = 280,
			len = baidu.string.getByteLength(text);
		if(len > maxByte){
			text =	baidu.string.subByte(text, maxByte);
		}
		return {
			text : text,
			num : Math.floor((maxByte - (len > maxByte ? maxByte : len))/2)
		}
	}


	var CHOICE_VALUES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
	
	function singleChoice(answer){
		
		var html = '<div class="single_choice question" id="feedbackQuestion#{0}">'+
						'<h5>'+
							'#{1}.#{2}'+
						'</h5>'+
						'<ul>';
		html = format(html, [this.questionid, this.number, this.questiontitle]);
		for(var i =0; i < this.choicedatalist.length; i++){
			var checked = (answer == CHOICE_VALUES[i]) ? 'checked' : '';
			html += '<li>' + 
					format('<input type="radio" name="singleChoice_#{0}" value="#{1}" #{2} />', 
							[this.questionid, CHOICE_VALUES[i], checked])+
						this.choicedatalist[i].choicetitle + 
					'</li>';
		}
		html += '</ul>'
		
		return html;
	}
	
	function multipleChoice(answer){
		
		var html = '<div class="multiple_choice question" id="feedbackQuestion#{0}">'+
						'<h5>'+
							'#{1}.#{2}'+
						'</h5>'+
						'<ul>';
		html = format(html, [this.questionid, this.number, this.questiontitle]);
		for(var i =0; i < this.choicedatalist.length; i++){
			var checked;
			if(answer){
				checked = (answer.indexOf(CHOICE_VALUES[i]) == -1) ? '' : 'checked';
			}
			html += '<li>' + 
					format('<input type="checkbox" name="multipleChoice_#{0}" value="#{1}" #{2} />', 
							[this.questionid, CHOICE_VALUES[i], checked])+
						this.choicedatalist[i].choicetitle + 
					'</li>';
		}
		html += '</ul>'
		
		return html;
	}
	
	function misc(answer){
		var html = '<div class="misc question" id="feedbackQuestion#{0}">';
			html += '<h5>'+
						'#{1}.选出与描述相符的项'+
					'</h5>';
			html += '<table>'+
						'<tr>'+
							'<th></th>';
		html = format(html, [this.questionid, this.number]);
		for(var i =0; i <this.choicedatalist.length; i++){
			html += format('<th width="80px">#{0}</th>', [this.choicedatalist[i].choicetitle]);
		}
		html += '</tr>'+
				'<tr>'+
					'<th style="text-align:left">'+ 
					this.questiontitle +
					'</th>'
		for(var i=0; i < this.choicedatalist.length; i++){
			var checked = (i+1) == answer ? 'checked' : '';
			html += format('<td><input type="radio" name="misc_#{0}" value="#{1}" #{2} /></td>',
								[this.questionid, i+1, checked]);
		}
		html += '</tr></table></div>'
		
		return html;
	}
	
	function score(answer){
		//默认3分
		answer = answer || 3;
		
		var html = '<div class="score question" id="feedbackQuestion#{0}">'+
						'<h5>'+
							'#{1}.#{2}'+
						'</h5>';
		html = format(html, [this.questionid, this.number, this.questiontitle]);
		var foo = '<div id="StarRate#{0}" class="star_rate"></div>'
			foo+= '<input type="hidden" id="StarRateInput#{1}" name="score_#{1}" value="#{2}"/>';
		html += format(foo, [this.questionid, this.questionid, answer]);
		
		return html;
	}
	
	function shortAnswer(answer){
		
		var html = '<div class="short_answer question" id="feedbackQuestion#{0}">'+
						'<h5>'+
							'#{1}.#{2} <span style="font-size:12px;">(剩余字数: <span class="rest_word_count">140</span>)</span>'+
						'</h5>';
		html = format(html, [this.questionid, this.number, this.questiontitle]);
		html += format('<textarea name="shortAnswer_#{0}">#{1}</textarea>',
						[this.questionid, answer]);
		
		return html;
	}
	/**
	 * 定时保存答案
	 */
	function saveAnswer(paperId, dialog){
		var answer = getAnswer(dialog).valueMap;
		FlashStorager.set('feedback_'+paperId+'_'+userid, baidu.json.encode(answer), function(){
			
		});
	}
	/**
	 * 加载之前保存的答案
	 */
	function loadAnswer(paperId){
		FlashStorager.get('feedback_'+paperId+'_'+userid, function(result){
			var answer = result && baidu.json.decode(result);
			showPaper(paperId, answer);
		})
	}
	
	/**
	 *提交答案
	 */
	function submit(paperId, dialog){
		
		var params = {
					'paperid' : paperId,
					'datalist' : []
				},
			r = getAnswer(dialog),
			valueMap = r.valueMap,
			typeMap = r.typeMap,
			emptyQuestion = [],
			elem;
		
		for(var id in typeMap){
			//移除所有错误显示
			//baidu.removeClass('feedbackQuestion'+id, 'error');
			if(elem = baidu.q('errorword', baidu.g('feedbackQuestion'+id))){
				if(elem.length){
					baidu.dom.remove(elem[0]);
				}
			}

			if(typeMap[id] != 'shortAnswer'){
				//检查是否做了除简答题外的所有题
				if(!(id in valueMap && valueMap[id] && valueMap[id].length)){
					emptyQuestion.push(id);
					continue;
				}
				//将多选题的数组转成字符串
				if(typeMap[id] == "multipleChoice"){
					valueMap[id] = valueMap[id].join(',');
				}
				params.datalist.push({
					questionid : id,
					answer : valueMap[id],
					answerdesc : ''
				})
			}else{
				params.datalist.push({
					questionid : id,
					answer : '',
					answerdesc : valueMap[id]
				})
			}
		}
		//显示没做的题
		if(emptyQuestion.length){
			for(var i=0; i < emptyQuestion.length; i++){
				//baidu.addClass('feedbackQuestion'+emptyQuestion[i], 'error');
				var h5 = baidu.dom.query('h5', baidu.g('feedbackQuestion'+emptyQuestion[i]))
				var span = document.createElement('span');
				span.className = 'errorword';
				span.innerHTML = '(该题是必做题)';
				h5[0].appendChild(span);
			}
			return;
		}
		
		Request({
			params : params
		}, function(json){
			if (json.params.status == 400) {
				ui.Dialog.alert({
					title: '提示',
					content: nirvana.config.ERROR.FEEDBACK.writeerror
				});
			}
			else {
				//缓存问卷
				finishPaper[paperId] = true;
			}
			//关闭窗口
			ui.util.get('feedbackCancel').onclick();

		}, 'ADD/survey/response');
	}
	
	/**
	 * @param inc_shortAnswer 是否包括简答题
	 */
	function getAnswer(dialog){
		var valueMap = {},
			typeMap = {},
			inputs = dialog.getBody().getElementsByTagName('input'),
			textareas = dialog.getBody().getElementsByTagName('textarea');
		
		for(var i =0, len=inputs.length; i < len; i++){
			
			var s = inputs[i].name.split('_'),
				type = s[0],
				id = s[1];
			typeMap[id] = type;
			
			switch(type){
				case 'singleChoice':
					if(inputs[i].checked){
						valueMap[id] = inputs[i].value;
					}
					break;
				case 'multipleChoice':
					if(! (id in valueMap)){
						valueMap[id] = [];
					}
					if(inputs[i].checked){
						valueMap[id].push(inputs[i].value);
					}
					break;
				case 'misc':
					if(inputs[i].checked){
						valueMap[id] = inputs[i].value;
					}
					break
				case 'score':
					valueMap[id] = inputs[i].value;
					break;
			}
		}
		for(var i =0, len=textareas.length; i< len; i++){
			var id = textareas[i].name.split('_')[1];
			valueMap[id] = textareas[i].value;
			typeMap[id] = 'shortAnswer';
		}
		
		return {
			'valueMap' : valueMap,
			'typeMap' : typeMap
		}
	}
	
	return {
		init: init
	}
})()
