/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: playback/playback.js desc: 推广回放业务逻辑处理器 author: huanghainan@baidu.com
 * date: $Date: 2011/11/17 $
 */

ToolsModule.playback = new ToolsModule.Action(
		'playback',
		{
			/**
			 * 视图模板名，或返回视图模板名的函数
			 */
			VIEW : 'playback',

			/**
			 * 要保持的状态集合。“状态名/状态默认值”形式的map。
			 */
			STATE_MAP : {
				'dateOptionSelected' : 0,
				'inputCheckTip' : '',
				'codeCheckTip' : '',
				'keyword' : '',
				'keyWordListpb' : [],
				'keyWordListSelectedpb' : '',
				'isshowflagpb' : false
			},

			/**
			 * 初始化context的函数集合，name/value型Object。其value为Function的map，value
			 * Function被调用时this指针为Action本身。value
			 * Function的形参需要有一个callback参数，参数为Function类型，手工回调。
			 */
			CONTEXT_INITER_MAP : {
				/**
				 * 初始化时间选择框
				 */
				select : function(callback){
					var me = this;
					if(me.getContext('dateOption') == null){
							var serviceTime = new Date(nirvana.env.SERVER_TIME * 1000);
							if(baidu.date.format(serviceTime,'HHmmss') < '080000'){
								serviceTime.setDate(serviceTime.getDate() - 1);
							}
							var option = [],
								optionValue = [];
							serviceTime.setDate(serviceTime.getDate() - 1);
							option[0] = baidu.date.format(serviceTime,'yyyy年MM月dd日');
							optionValue[0] = baidu.date.format(serviceTime,'yyyyMMdd');
							serviceTime.setDate(serviceTime.getDate() - 1);
							option[1] = baidu.date.format(serviceTime,'yyyy年MM月dd日');
							optionValue[1] = baidu.date.format(serviceTime,'yyyyMMdd');
							serviceTime.setDate(serviceTime.getDate() - 1);
							option[2] = baidu.date.format(serviceTime,'yyyy年MM月dd日');
							optionValue[2] = baidu.date.format(serviceTime,'yyyyMMdd');
							serviceTime.setDate(serviceTime.getDate() - 1);
							option[3] = baidu.date.format(serviceTime,'yyyy年MM月dd日');
							optionValue[3] = baidu.date.format(serviceTime,'yyyyMMdd');
							me.setContext('dateOption', [ 
								{
									value : optionValue[0],
									text : option[0]	
								}, 
								{
									value : optionValue[1],
									text : option[1]
								},
								{
									value : optionValue[2],
									text : option[2]	
								}, 
								{
									value : optionValue[3],
									text : option[3]
								}
							]);
							me.setContext('dateOptionSelected',optionValue[0]);
					}
					callback();
				},

				/**
				 * 绘制跑马灯
				 */
				
				slideMarquee : function(callback) {
					if (this.arg.queryMap.importMaterials) {
						if (this.arg.queryMap.importMaterials.level == "keyword") {
							var keyWordListData = [];
							var data = this.arg.queryMap.importMaterials.data;
							for ( var i = 0, n = data.length; i < n; i++) {
								keyWordListData.push(escapeHTML(data[i].showword));
							}
							this.setContext('keyword', '');
							this.setContext('keyWordListpb', keyWordListData);
							this.setContext('keyWordListSelectedpb', '');
							this.setContext('inputCheckTip', '');
							this.setContext('codeCheckTip', '');
						}
					}
					if (this.getContext('keyWordListpb') && this.getContext('keyWordListpb').length == 0) {
						this.setContext('isshowflagpb', false);
					} else {
						this.setContext('isshowflagpb', true);
					}
					callback();
				}
				
			},
			/**
			 * 在模板中写一长串的控件属性会难以理解。该属性能以“控件id/属性集合”的形式在外部书写控件属性，使格式更清晰。
			 */
			UI_PROP_MAP : {},

			/**
			 * 完成视图更新后最后会触发事件
			 */
			onentercomplete : function() {
				var me = this;
				ui.Bubble.init();
			//	console.log('onentercomplete~');
			//	console.log(displayVcodepb.VCODE_DISPLAY);
				baidu.G("showResultTips").style.display = "none";
				if (me.getContext('keyword') == '') {
					baidu.G('PlaybackFrameContainer').style.display = "none";
				} else {
					baidu.G('PlaybackFrameContainer').style.display = "block";
				}
				if(!displayVcodepb.VCODE_DISPLAY){
					baidu.G("ShowCheckcodeInputpb").style.display = "none";
				}
				if(me.getContext('inputCheckTip') == '' && me.getContext('codeCheckTip') == ''){
					baidu.G("PlaybackWrong").style.display = "none";
				}else{
					baidu.G("PlaybackWrong").style.display = "block";
				}
				
				
			},

			onafterrender : function () {
				var me = this;
		//		baidu.G("showResultTips").style.display = "none";
				
				
				ui.util.get('PlaybackKeywordSliderMarquee').onTextClick = function(keyword) {
					me.setContext('keyWordListSelectedpb', baidu.string.encodeHTML(keyword));
					me.setContext('keyword', baidu.string.encodeHTML(keyword));
					baidu.G('KeyWordInputpb').value = keyword;
					me.vcodeCheck();
					me.searchWordCheck();
					me.refresh();
					me.sendQuery();
					return false;
				};
				ui.util.get('dateSelect').onselect = function(date) {
					if (date == me.getContext('dateOptionSelected')) {
						return false;
					}
					me.setContext('dateOptionSelected', date);
					me.refresh();
					return false;
				};
				ui.util.get('PlaybackBtn').onclick = function() {
					var keyword = baidu.G('KeyWordInputpb').value;
					me.setContext('keyword', baidu.string.encodeHTML(keyword));
					me.setContext('keyWordListSelectedpb', baidu.string.encodeHTML(keyword));
					me.vcodeCheck();
					me.searchWordCheck();
					me.refresh();
					me.sendQuery();
					return false;
				};
                baidu.G('KeyWordInputpb').onkeypress = function (e) {
                    e = e || window.event;
                    var keyCode = e.keyCode || e.which;
                    if (keyCode == 13) {
                        return ui.util.get('PlaybackBtn').onclick();
                    }

                };
				/**
				 * 绑定事件
				 */
				baidu.G("SearchVcodeInputpb").onkeypress = function(e) {
					e = window.event || e;
					if (e.keyCode == 13) {
						me.sendQuery();
					}
				};
		    },
			/**
			 * 检测验证码是否填写
			 */
			vcodeCheck : function() {
				var G = baidu.G;
				var vcodeInput = G("SearchVcodeInputpb");
				if (displayVcodepb.VCODE_DISPLAY && vcodeInput.value.length != 4) {
					this.setContext('codeCheckTip', "请准确填写验证码。");
					G("SearchVcodeInputpb").focus();
					G("SearchVcodeInputpb").select();
					return false;
				} else {
					
					this.setContext('codeCheckTip', "");
					return true;
				}
			},

			/**
			 * 检测输入的不能为空
			 */
			searchWordCheck : function() {
				var word = baidu.G('KeyWordInputpb').value;
				if (baidu.trim(word) === "") {
					this.setContext('inputCheckTip', "关键词不能为空。");
				} else {
					this.setContext('inputCheckTip', "");
				}
			},

			/**
			 * 拼接参数，发送iframe请求
			 */
			sendQuery : function() {
				var G = baidu.G;
				var ispass = (this.getContext('inputCheckTip') == '')
						&& (this.getContext('codeCheckTip') == '');
				if (ispass && this.getContext('keyword') != '') {
					var params = {
						bidword: baidu.string.decodeHTML(this.getContext('keyword')),//this.getContext('keyword'),//encodeURIComponent(baidu.string.decodeHTML(this.getContext('keyword'))),
						date: this.getContext('dateOptionSelected')
						//pageNo: ToolsModule.adpreview.pageNo
					};
					if (displayVcodepb.VCODE_DISPLAY) {
						params.vcode = G("SearchVcodeInputpb") ? G("SearchVcodeInputpb").value : null;
					}
					
					var form = baidu.G('PlaybackForm');
					form.action = nirvana.config.REQUEST_URL_BASE + '?path=GET/Playback';
										
					G('PlaybackParamsUserid').value = nirvana.env.USER_ID;
					G('PlaybackParamsParams').value = baidu.json.stringify(params);
					// 所有的ajax请求需要补充token参数
					G('PlaybackParamsToken').value = nirvana.env.TOKEN;
					nirvana.heartBeat(true);
					form.submit();
			//		console.log('submit~');
					nirvana.util.loading.init();
					G("ShowCheckcodeInputpb").style.display = "none";
					//G("ShowCheckcodeInput").style.display = "none";
					displayVcodepb.VCODE_DISPLAY = false;
				}
			},

			//重置工具时，通过判断.refresh决定是否重置所有STATE_MAP中定义的context
			onbeforeinitcontext : function(){
				var me = this,
					stateMap = this.STATE_MAP || {};
					
				if(!me.arg.refresh){
					me.arg.queryMap.ignoreState = true;
					/**
					 * 默认不显示验证码
					 */
					displayVcodepb.VCODE_DISPLAY = false;
					displayVcodepb.VCODE_LOADED = true;
			//		ToolsModule.playback.pageNo = 0;
				}
			}
		});
/**
 * 重置iframe的高度
 */
function PlaybackFrameAutoHeight() {
//	console.log('iframe onload~');
	nirvana.util.loading.done();

	var iframe = baidu.G("PlaybackFrame");
	iframe.style.height = 'auto';
	var bHeight = iframe.contentWindow.document.body.scrollHeight;
	var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
	var height = Math.max(bHeight, dHeight);
	iframe.style.height = height + "px";
}

/**
 * 验证码业务逻辑,iframe中，通过parent.displayVcodepb(); 调用显示验证码 displayVcodepb 暴露在全局中
 */
function displayVcodepb(data) {
	var G = baidu.G,
	    msg;
	if (data && data == 'VCODEERROR') {
		msg = '请您正确输入验证码。';
		G('ctrllabelCodeCheckTip').innerHTML = '提示：' + msg;
	}
	displayVcodepb.VCODE_DISPLAY = true;
	G("ShowCheckcodeInputpb").style.display = "block";
//	G("ShowCheckcodeInputpb").style.display = "block";
	G("SearchVcodeInputpb").focus();
	G("SearchVcodeInputpb").select();
	displayVcodepb.refreshVcode();
}
/**
 * 默认不显示验证码
 */
displayVcodepb.VCODE_DISPLAY = false;
displayVcodepb.VCODE_LOADED = true;
//console.log(displayVcodepb.VCODE_DISPLAY);
//ToolsModule.playback.pageNo = 0;
/**
 * 刷新验证码
 */
displayVcodepb.refreshVcode = function() {
	var G = baidu.G;
	if (displayVcodepb.VCODE_DISPLAY && displayVcodepb.VCODE_LOADED) {
		G("RefreshVcodepb").innerHTML = '<span style="color:#999">正在读取验证码...</span>';
		G("RefreshVcodepb").onclick = null;
		G("SearchVcodeImgpb").onload = function() {
			if (!displayVcodepb.VCODE_DISPLAY) {
				displayVcodepb.VCODE_LOADED = true;
				return;
			}
			G("RefreshVcodepb").innerHTML = "看不清楚？";
			displayVcodepb.VCODE_LOADED = true;
			G("RefreshVcodepb").onclick = function(e) {
				e = e || window.event;
				baidu.event.preventDefault(e);
				displayVcodepb.refreshVcode();
				return false;
			};
		};
		displayVcodepb.VCODE_LOADED = false;
		G("SearchVcodeImgpb").src = 'vcode?src=plb&nocache=' + Math.random();
	}
};

function showResultTips(isshow){
	var G = baidu.G;
	if(isshow){
		G("showResultTips").style.display = "block";
		G("PlaybackFrameContainer").style.display = "none";
	}
	
}

/**
 * 翻页逻辑,iframe中，通过parent.switchPage();
 */
/*
function switchPage(pageNo){
	pageNo = pageNo || 0;
	
	var form = baidu.g('AdPreviewForm'),
		params = baidu.json.parse(baidu.g('AdPreviewParamsParams').value);
		
	params['pageNo'] = pageNo;
	ToolsModule.adpreview.pageNo = pageNo;
	baidu.g('AdPreviewParamsParams').value = baidu.json.stringify(params);
	form.submit();
}*/

