/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: adpreview/adpreview.js desc: 推广实况业务逻辑处理器置 author: wangzhishou@baidu.com
 * date: $Date: 2011/1/25 $
 */

ToolsModule.adpreview = new ToolsModule.Action( 'adpreview', {
    /**
     * 视图模板名，或返回视图模板名的函数
     */
    VIEW : 'adpreview',

    /**
     * 要保持的状态集合。“状态名/状态默认值”形式的map。
     */
    STATE_MAP : {
        'dateTypeOption' : 0,
        'dateOptionSelected' : 0,
        'areaOptionSelected' : 0,
        'deviceOptionSelected' : 0,
        'inputCheckTip' : '',
        'codeCheckTip' : '',
        'dateOptionValue' : [],
        'keyword' : '',
        'keyWordList' : [],
        'keyWordListSelected' : '',
        'isshowflag' : false
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
        
        selectDate : function(callback){
            var me = this;
            if(me.getContext('dateOptionValue').length == 0){
            //	console.log('dateoptioniniet~~~');
                    var optionData = [],
                        option = [],
                        optionValue = [];
                        
                    //如果选择当前时间，则触发推广实况
                    //选择其他时间（前四天），则触发推广回放
                    /*
                    option[0] = "当前";
                    optionValue[0] = 0;
                    optionData.push({
                            value : optionValue[0],
                            text : option[0]    
                     });*/
                     //初始化推广回放的时间
                    var serviceTime = new Date(nirvana.env.SERVER_TIME * 1000);
                    //每天八点后能提供前一天的数据
                    if(baidu.date.format(serviceTime,'HHmmss') < '080000'){
                        serviceTime.setDate(serviceTime.getDate() - 1);
                    }
                    for(var i = 0; i < 4; i++){
                        serviceTime.setDate(serviceTime.getDate() - 1);
                        option[i] = baidu.date.format(serviceTime,'MM月dd日');
                        optionValue[i] = baidu.date.format(serviceTime,'yyyyMMdd');
                        /*
                        optionData.push({
                            value : optionValue[i],
                            text : option[i]    
                     });*/
                        optionData.push(option[i])
                    }
                    me.setContext('dateOption1', optionData[0]);
                    me.setContext('dateOption2', optionData[1]);
                    me.setContext('dateOption3', optionData[2]);
                    me.setContext('dateOption4', optionData[3]);
                    
                    me.setContext('dateOptionValue',optionValue);
            }
            callback();
        },
        /**
         * 初始化地域选择框
         */
        select : function(callback) {
            if (this.getContext('areaTypeOption') == null) {
                var option = [ {
                    text : '当前地域',
                    value : 0
                }, {
                    text : '北京',
                    value : 1
                }, {
                    text : '上海',
                    value : 2
                }, {
                    text : '天津',
                    value : 3
                }, {
                    text : '广东',
                    value : 4
                }, {
                    text : '福建',
                    value : 5
                }, {
                    text : '海南',
                    value : 8
                }, {
                    text : '安徽',
                    value : 9
                }, {
                    text : '贵州',
                    value : 10
                }, {
                    text : '甘肃',
                    value : 11
                }, {
                    text : '广西',
                    value : 12
                }, {
                    text : '河北',
                    value : 13
                }, {
                    text : '河南',
                    value : 14
                }, {
                    text : '黑龙江',
                    value : 15
                }, {
                    text : '湖北',
                    value : 16
                }, {
                    text : '湖南',
                    value : 17
                }, {
                    text : '吉林',
                    value : 18
                }, {
                    text : '江苏',
                    value : 19
                }, {
                    text : '江西',
                    value : 20
                }, {
                    text : '辽宁',
                    value : 21
                }, {
                    text : '内蒙古',
                    value : 22
                }, {
                    text : '宁夏',
                    value : 23
                }, {
                    text : '青海',
                    value : 24
                }, {
                    text : '山东',
                    value : 25
                }, {
                    text : '山西',
                    value : 26
                }, {
                    text : '陕西',
                    value : 27
                }, {
                    text : '四川',
                    value : 28
                }, {
                    text : '西藏',
                    value : 29
                }, {
                    text : '新疆',
                    value : 30
                }, {
                    text : '云南',
                    value : 31
                }, {
                    text : '浙江',
                    value : 32
                }, {
                    text : '重庆',
                    value : 33
                }, {
                    text : '香港',
                    value : 34
                }, {
                    text : '台湾',
                    value : 35
                }, {
                    text : '澳门',
                    value : 36
                }, {
                    text : '日本',
                    value : 7
                }, {
                    text : '其他国家',
                    value : 37
                } ];
                this.setContext('areaTypeOption', option);
            }
            /* 投放设备由下拉框改成radio btn 这些都注释掉
            var deviceOption = [{
                text : '计算机',
                value : 1
            },{
                text : '移动设备',
                value : 2
            }];
            this.setContext('deviceTypeOption',deviceOption);*/
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
                    this.setContext('keyWordList', keyWordListData);
                    this.setContext('keyWordListSelected', '');
                    this.setContext('inputCheckTip', '');
                    this.setContext('codeCheckTip', '');
                }
            }
            if (this.getContext('keyWordList') && this.getContext('keyWordList').length == 0) {
                this.setContext('isshowflag', false);
            } else {
                this.setContext('isshowflag', true);
            }
            callback();
        }
    },
    /**
     * 在模板中写一长串的控件属性会难以理解。该属性能以“控件id/属性集合”的形式在外部书写控件属性，使格式更清晰。
     */
    UI_PROP_MAP : {},

    processFrameLoad: function() {
        var me = this;
        var previewPC = baidu.g('AdPreviewFramePC');
        var previewPhone = baidu.g('AdPreviewFramePhone');
        var playback = baidu.g('PlaybackFrame');

        if(baidu.browser.ie){ // IE  
            previewPC.onreadystatechange = function(){  
                if (previewPC.readyState == "complete"){  
                    AdPreviewFrameAutoHeight('AdPreviewFramePC');
                }  
            };  
            previewPhone.onreadystatechange = function(){  
                if (previewPhone.readyState == "complete"){ 
                    AdPreviewFrameAutoHeight('AdPreviewFramePhone');
                }  
            };  
            playback.onreadystatechange = function(){  
                if (playback.readyState == "complete"){  
                    AdPreviewFrameAutoHeight('PlaybackFrame');
                    me.showPlayback();  
                }  
            };  
        }else{ // nonIE  
            previewPC.onload = function(){
                AdPreviewFrameAutoHeight('AdPreviewFramePC');
            }; 
            previewPhone.onload = function(){
                AdPreviewFrameAutoHeight('AdPreviewFramePhone');
            };
            playback.onload = function(){
                AdPreviewFrameAutoHeight('PlaybackFrame');
                me.showPlayback();
            }; 
        } 
    },

    /**
     * 完成视图更新后最后会触发事件
     */
    onentercomplete : function() {
        var me = this;

        if (me.getContext('keyword') == '') {
            baidu.G('AdPreviewFrameContainer').style.display = "none";
            baidu.addClass('preview-right-btn', 'hide');
            baidu.addClass('preview-left-btn', 'hide');
        } else {
            baidu.G('AdPreviewFrameContainer').style.display = "block";
        }
        if(me.getContext('dateOptionSelected') != 0){
            ui.util.get('AreaSelect').hide(true);
            baidu.addClass(baidu.g('regionTitle'),'hide');
            //baidu.addClass(baidu.g('deviceTitle'),'first-title-span');
            //baidu.removeClass(baidu.g('deviceTitle'),'second-title-span');
            ui.util.get('newPlanDevicePhone').disable(true)
        }else{
            ui.util.get('AreaSelect').hide(false);
            baidu.removeClass(baidu.g('regionTitle'),'hide');
            //baidu.removeClass(baidu.g('deviceTitle'),'first-title-span');
           // baidu.addClass(baidu.g('deviceTitle'),'second-title-span');
            ui.util.get('newPlanDevicePhone').disable(false);
        }
        if(baidu.ie == 7){
            var tar1 = baidu.q('first-title-span');
            var tar2 = baidu.q('second-title-span');
            if(tar1.length > 0) {
                baidu.dom.setStyle(tar1[0],'margin-left','65px');
            }
            if(tar2.length > 0) {
                baidu.dom.setStyle(tar2[0],'margin-left','40px');
            }
            
        }
        if(!displayVcode.VCODE_DISPLAY){
            baidu.G("ShowCheckcodeInput").style.display = "none";
        }
        if(me.getContext('inputCheckTip') == '' && me.getContext('codeCheckTip') == ''){
            baidu.G("PreviewWrong").style.display = "none";
        }else{
            baidu.G("PreviewWrong").style.display = "block";
        }
        
    },

    onafterrender : function () {
        var me = this;
        this.processFrameLoad();
        baidu.g('PreviewDateOptionDiv').onclick = this.dateSelectHandler();
        
        ui.util.get('KeywordSliderMarquee').onTextClick = function(keyword) {
            me.setContext('keyWordListSelected', baidu.string.encodeHTML(keyword));
            me.setContext('keyword', baidu.string.encodeHTML(keyword));
            baidu.G('KeyWordInput').value = keyword;
            ToolsModule.adpreview.pageNo = 0;
            me.vcodeCheck();
            me.searchWordCheck();
            me.refresh();
            me.sendQuery();
            return false;
        };

        ui.util.get('AreaSelect').onselect = function(area) {
            if (area == me.getContext('areaOptionSelected')) {
                return false;
            }
            me.setContext('areaOptionSelected', area);
            me.refresh();
            return false;
        };
        
        /*ui.util.get('DeviceSelect').onselect = function(device) {
            if (device == me.getContext('deviceOptionSelected')) {
                return false;
            }
            //选择计算机
            if(device == 1){
                ui.util.get('DateOneBefore').disable(false);
                ui.util.get('DateTwoBefore').disable(false);
                ui.util.get('DateThreeBefore').disable(false);
                ui.util.get('DateFourBefore').disable(false);
            }else{//选择移动设备
                ui.util.get('DateOneBefore').disable(true);
                ui.util.get('DateTwoBefore').disable(true);
                ui.util.get('DateThreeBefore').disable(true);
                ui.util.get('DateFourBefore').disable(true);
                me.setContext('dateTypeOption',0);
                me.setContext('dateOptionSelected',0);
            }
            me.setContext('deviceOptionSelected', device);
            me.refresh();
            return false;
        };*/

        // 点击投放设备radio
        baidu.g('device-radio').onclick = function() {
            var device = ui.util.get('newPlanDeviceAll').getGroup().getValue();

            //选择计算机//选择移动设备
            if (device == 2){
                ui.util.get('DateOneBefore').disable(true);
                ui.util.get('DateTwoBefore').disable(true);
                ui.util.get('DateThreeBefore').disable(true);
                ui.util.get('DateFourBefore').disable(true);
            }
            else {
                ui.util.get('DateOneBefore').disable(false);
                ui.util.get('DateTwoBefore').disable(false);
                ui.util.get('DateThreeBefore').disable(false);
                ui.util.get('DateFourBefore').disable(false);
            }
            me.setContext('deviceOptionSelected', device);
        }

        ui.util.get('AdPreviewBtn').onclick = function() {
            var keyword = baidu.G('KeyWordInput').value;
            ToolsModule.adpreview.pageNo = 0;
            me.setContext('keyword', baidu.string.encodeHTML(keyword));
            me.setContext('keyWordListSelected', baidu.string.encodeHTML(keyword));
            me.vcodeCheck();
            me.searchWordCheck();
            me.refresh();
            me.sendQuery();
            return false;
        };
		
        baidu.G('KeyWordInput').onkeypress = function (e) {
            e = e || window.event;
            var keyCode = e.keyCode || e.which;
            if (keyCode == 13) {
                return ui.util.get('AdPreviewBtn').onclick();
            }

        };
        /**
         * 绑定事件
         */
        baidu.G("SearchVcodeInput").onkeypress = function(e) {
            e = window.event || e;
            if (e.keyCode == 13) {
                me.sendQuery();
            }
        };
		
        baidu.g('KRExpeTopMesLinkInAdpreview').onclick = function(){
            var pos = baidu.dom.getPosition(baidu.g('KRExpeBottomMesLinkInAdpreview'));
            baidu.g('Tools_adpreview_body').scrollTop = pos.top - 100;
            baidu.g('KRExpeTopMesLinkInAdpreview').blur();
        };
         baidu.g('KRExpeBottomMesLinkInAdpreview').onclick = function(){
            baidu.g('Tools_adpreview_body').scrollTop = 0;
            baidu.g('KRExpeBottomMesLinkInAdpreview').blur();
        };

        me.bindBtn();
    },
    dateSelectHandler : function(){
        var me = this; 
        return function(e){
            var e = e || window.event, 
               tar = e.target || e.srcElement, 
               label = tar.id;
            
            if (label == '' || label == 'NewReportTargetTypeDiv') {
                return;
            }
            var index = tar.value;
            me.setContext('dateTypeOption',index);
            if (index != 0) {
                var datevalue = me.getContext('dateOptionValue')[index - 1];
                me.setContext('dateOptionSelected', datevalue);
            }else{
                me.setContext('dateOptionSelected', 0);
            }
    //		console.log(me.getContext('dateOptionSelected'));
            baidu.event.stopPropagation(e);
            me.refresh();
        }
    },
    /**
     * 检测验证码是否填写
     */
    vcodeCheck : function() {
        var G = baidu.G;
        var vcodeInput = G("SearchVcodeInput");
        if (displayVcode.VCODE_DISPLAY && vcodeInput.value.length != 4) {
            this.setContext('codeCheckTip', "请准确填写验证码。");
            G("SearchVcodeInput").focus();
            G("SearchVcodeInput").select();
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
        var word = baidu.G('KeyWordInput').value;
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
        var G = baidu.G,
            me = this,
            device = me.getContext('deviceOptionSelected');
        var ispass = (this.getContext('inputCheckTip') == '')
                && (this.getContext('codeCheckTip') == '');
        // cookie
        //BFE小流量转发策略支持 by linzhifeng@baidu.com 2012-12-18
		baidu.cookie.setRaw('SAMPLING_USER_ID', nirvana.env.USER_ID, {path: '/'});
        
        if (ispass && this.getContext('keyword') != '') {
            var params = {}, 
                form = {};
            
            //如果需要输入验证码
            if (displayVcode.VCODE_DISPLAY) {
                params.vcode = G("SearchVcodeInput") ? G("SearchVcodeInput").value
                        : null;
            }
            
            if (me.getContext('dateOptionSelected') == 0) {
                baidu.G('PlaybackFrameContainer').style.display = "none";
                baidu.G('AdpreviewShowResult').style.display = "block";
                baidu.addClass(baidu.G("showResultTips"),'hide');
                
                //日期选择当前时
                params = baidu.extend( params,{
                    keyword: encodeURIComponent(baidu.string.decodeHTML(this.getContext('keyword'))),
                    area: this.getContext('areaOptionSelected'),
                    pageNo: ToolsModule.adpreview.pageNo,
                    device: device
                });
				
                if (!me.expe) {
                    me.initExpedition();
                }

				//KR远征 只有选择当前时间时才触发，选择过去时间时不触发
                var adpKeyword = this.getContext('keyword');                
                if (params.area == 0) {
                    nirvana.manage.getRegionInfo(function(region){
                        me.expe.load(baidu.string.decodeHTML(adpKeyword), region, params.device);
                    });
                }
                else {
                    me.expe.load(baidu.string.decodeHTML(adpKeyword), params.area, params.device);
                }
                
                
                var tip = G('AdPreviewFrameTip').getElementsByTagName('b');
                tip[0].innerHTML = this.getContext('keyword');

                me.chooseForm(params, device);
        
            }
            else{
                //日期选择过去时
                params = baidu.extend( params, {
                    bidword: baidu.string.decodeHTML(this.getContext('keyword')),//this.getContext('keyword'),//encodeURIComponent(baidu.string.decodeHTML(this.getContext('keyword'))),
                    date: this.getContext('dateOptionSelected')
                });
                form = baidu.G('PlaybackForm');
                form.action = nirvana.config.REQUEST_URL_BASE + '?path=GET/Playback';
            
                G('PlaybackParamsUserid').value = nirvana.env.USER_ID;
                G('PlaybackParamsParams').value = baidu.json.stringify(params);
                // 所有的ajax请求需要补充token参数
                G('PlaybackParamsToken').value = nirvana.env.TOKEN;
                nirvana.heartBeat(true);
                form.submit();
                baidu.G('AdpreviewShowResult').style.display = "none";
                baidu.G('PlaybackFrameContainer').style.display = "block";
                baidu.addClass(baidu.G("showResultTips"),'hide');

                
            }
            nirvana.util.loading.init();
    
        //	G("ShowCheckcodeTip").style.display = "none";
            G("ShowCheckcodeInput").style.display = "none";
            displayVcode.VCODE_DISPLAY = false;
        
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
			displayVcode.VCODE_DISPLAY = false;
			displayVcode.VCODE_LOADED = true;
			ToolsModule.adpreview.pageNo = 0;
		}
	},

    initExpedition: function() {
        var me = this;
        this.expe && this.expe.dispose();

        this.expe = new fc.module.Expedition($$('#KrExpeInAdpreview > div')[0], { 
            entry: 'kr_expe_adpreview',
            callback: function(keywords) {
                if (keywords.length > 0) {
                    baidu.g('KREpxeTopMesWordInAdpreview').innerHTML = keywords.slice(0, 3).join('、') + '、...';
                    baidu.show('KRExpeTopMesInAdpreview');
                    baidu.show('KRExpeBottomMesLinkInAdpreview');
                }else{
                    baidu.hide('KRExpeTopMesInAdpreview');
                    baidu.hide('KRExpeBottomMesLinkInAdpreview');				
                }
            },
            onSuccess: function() {
                me.expe.load();
            }
        });
        this.expe.onkropen = function(query, keywords) {
            ToolsModule.open('kr', { 
                needReload: true,
                // 以前就用这格式，按照他来吧，虽然暴丑。。。
                queryMap: {
                    importMaterials: {
                        level: 'keyword', 
                        data: [ { showword: query } ],
                        newKeywords: keywords
                    }
                },
                onclose: function() {
                    me.sendQuery();
                }
            });
        };
    },

    onleave: function() {
        this.expe && this.expe.dispose();
    },

    /**
     * 根据device选择发送的表单
     * 
     * {Object} params  AdPreviewParamsParams的值
     * {number} device 设备类型 0全部设备 1计算机 2移动设备
     */
    chooseForm : function(params, device) {
        var me = this;

        me.statusInit();

        var html5Enable = me.judgeHtml5();
        
        if (device == 0) {
            params.device = 1;
            me.submitForm(params, 'PC');
            params.device = 2;
            params.html5Enable = html5Enable;
            me.submitForm(params, 'Phone');
            baidu.removeClass('preview-pc-iframe-container', 'hide');
            baidu.removeClass('preview-phone-iframe-container', 'hide');

            baidu.addClass('preview-pc-iframe-container', 'preview-all-left');
            baidu.addClass('preview-phone-iframe-container', 'preview-all-right');

            baidu.removeClass('preview-right-btn', 'hide');
            me.setContext('moveNode', ['AdPreviewFramePC', 'preview-phone-iframe-container']);
        }
        else if (device == 1) {
            me.submitForm(params, 'PC');
            baidu.removeClass('preview-pc-iframe-container', 'hide');
            baidu.addClass('preview-phone-iframe-container', 'hide');
        }
        else if (device == 2) {
            params.html5Enable = html5Enable;
            me.submitForm(params, 'Phone');
            baidu.addClass('preview-pc-iframe-container', 'hide');
            baidu.removeClass('preview-phone-iframe-container', 'hide');
        }
    },

    /**
     * 状态初始化
     */
    statusInit : function() {
        var boxWidth = baidu.g('Tools_adpreview_body').offsetWidth;
        baidu.removeClass('preview-pc-iframe-container', 'preview-all-left');
        baidu.removeClass('preview-phone-iframe-container', 'preview-all-right');
        baidu.addClass('preview-right-btn', 'hide');
        baidu.addClass('preview-left-btn', 'hide');

        baidu.setStyle('AdPreviewFramePC', 'left', '');
        baidu.setStyle('preview-phone-iframe-container', 'left', boxWidth - 250 + 'px');
        baidu.setStyle('PlaybackFrame', 'left', '');
        baidu.setStyle('playback-phone-iframe-container', 'left', boxWidth - 250 + 'px');

        baidu.addClass('playback-phone-iframe-container', 'hide');
    },

    /**
     * 判断是否支持html5
     * 
     * @return {number} 0 不支持 1 支持
     */
    judgeHtml5 : function() {
        // 通过canvas来判断
        try {
            document.createElement('canvas').getContext('2d');
            return 1;
        }
        catch (e) {
            return 0;
        }
    },

    /**
     * 发送推广实况表单
     * 
     * {Object} params AdPreviewParamsParams的值
     * {string} suffix 名称后缀
     */
    submitForm : function(params, suffix) {
        var G = baidu.g;
        var form = baidu.G('AdPreviewForm' + suffix);
        var keys = ['AdPreviewParamsUserid', 'AdPreviewParamsParams', 'AdPreviewParamsToken']

        form.action = nirvana.config.REQUEST_URL_BASE + '?path=GET/Live';
        //form.action = "src/debug/test.html";
        G(keys[0] + suffix).value = nirvana.env.USER_ID;
        G(keys[1] + suffix).value = baidu.json.stringify(params);
        // 所有的ajax请求需要补充token参数
        G(keys[2] + suffix).value = nirvana.env.TOKEN;
       // nirvana.heartBeat(true);
        form.submit();
    },

    /** 
     * 给btn绑定事件
     */
    bindBtn : function() {
        var me = this;

        /**
         * 运动结束时的回调
         *
         * {string} node 按钮元素id
         * {Function} func 移动方法 leftMove 或者rightMove
         * {string} 需要显示的元素id
         * @return {Function}
         */
        function finishMove(node, func, showNode) {
            return function() {
                baidu.addClass(node, 'hide');
                baidu.on(node, 'mouseover', func);
                baidu.removeClass(showNode, 'hide');
            }
        };

        /**
         * 左移的方法
         */
        function leftMove() {
            // 防止多次移动
            baidu.un('preview-right-btn', 'mouseover', leftMove);

            var boxWidth = baidu.g('Tools_adpreview_body').offsetWidth;
            var node = me.getContext('moveNode');
            
            baidu.fx.moveBy(node[0], [ ( - boxWidth ) / 2, 0], {
                duration : 500,
                onafterfinish : finishMove('preview-right-btn', leftMove, 'preview-left-btn')
            })
            baidu.fx.moveBy(node[1], [ ( - boxWidth ) / 2, 0]);
        }

        /**
         * 右移的方法
         */
        function rightMove() {
            // 防止多次移动
            baidu.un('preview-left-btn', 'mouseover', rightMove);

            var boxWidth = baidu.g('Tools_adpreview_body').offsetWidth;
            var node = me.getContext('moveNode');
            
            baidu.fx.moveBy(node[0], [ boxWidth / 2 , 0], {
                duration : 500,
                onafterfinish : finishMove('preview-left-btn', rightMove, 'preview-right-btn')
            })
            baidu.fx.moveBy(node[1], [ boxWidth / 2 , 0]);
        }

        baidu.on('preview-right-btn', 'mouseover', leftMove);
        baidu.on('preview-left-btn', 'mouseover', rightMove);
    },

    /**
     * 全部设备时的推广回放
     */
    showPlayback : function() {
        var me = this;
        var device = me.getContext('deviceOptionSelected');
        me.statusInit();

        baidu.removeClass('playback-pc-iframe-container', 'hide');

        if (device == 0) {
            baidu.removeClass('playback-phone-iframe-container', 'hide');

            baidu.addClass('playback-pc-iframe-container', 'preview-all-left');
            baidu.addClass('playback-phone-iframe-container', 'preview-all-right');

            baidu.removeClass('preview-right-btn', 'hide');
            me.setContext('moveNode', ['PlaybackFrame', 'playback-phone-iframe-container']);
        }
    }
});
/**
 * 重置iframe的高度
*/ 
function AdPreviewFrameAutoHeight(iframeName) {
	var iframe = baidu.G(iframeName);
	iframe.style.height = 'auto';
	nirvana.util.loading.done();

    function setHeght() {
        var bHeight = iframe.contentWindow.document.body.scrollHeight;
        var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
        var height = Math.max(bHeight, dHeight);
        iframe.style.height = height + 10 + "px";
    }
    try{
        setHeght();
        if (baidu.ie
            && iframeName == 'AdPreviewFramePC'
            ) {
            var _iframeDoc = iframe.contentWindow.document;
            _iframeDoc.body.style.position = 'static';
            _iframeDoc.getElementById('in').style.position = 'static';
            _iframeDoc.getElementById('out').style.position = 'static';
            _iframeDoc.getElementById('wrapper').style.position = 'static';
            _iframeDoc.getElementById('in').style.marginLeft = 0;
            _iframeDoc.getElementById('out').style.marginLeft = 0;
        }

        if (baidu.ie && iframeName == 'AdPreviewFramePhone') {
            setTimeout(setHeght, 100);
        }
    }
    catch(e) {
        // do nothing
    }
	if (iframeName == 'AdPreviewFramePC' && iframe.offsetWidth < 1030 ) {
        var ifDoc = iframe.contentWindow.document;
        if (ifDoc.getElementById('u')) {
            baidu.hide(ifDoc.getElementById('u'));
        }
    }
}

/**
 * 验证码业务逻辑,iframe中，通过parent.displayVcode(); 调用显示验证码 displayVcode 暴露在全局中
 */
function displayVcode(data) {
	var G = baidu.G,
	    type = "";
	if (data && data.indexOf('VCODEERROR') != -1) {
		var msg = '请您正确输入验证码。';
		G('ctrllabelCodeCheckTip').innerHTML = '提示：' + msg;
	}
	//由于将推广回放合入实况后，原来后台的代码没有变，验证码分别来自两个地方，所以这里要做区分以请求不同src
	if(data && data.indexOf("PB") != -1){
		type = "PB";
	}else{
		type = "AD";
	}
	displayVcode.VCODE_DISPLAY = true;
	G("ShowCheckcodeInput").style.display = "block";
	G("SearchVcodeInput").focus();
	G("SearchVcodeInput").select();
	displayVcode.refreshVcode(type);
}
/**
 * 默认不显示验证码
 */
displayVcode.VCODE_DISPLAY = false;
displayVcode.VCODE_LOADED = true;
ToolsModule.adpreview.pageNo = 0;
/**
 * 刷新验证码
 * @param type 标识请求的验证码是来自于推广实况的还是推广回放的
 */
displayVcode.refreshVcode = function(type) {
	
	var G = baidu.G;
	if (displayVcode.VCODE_DISPLAY && displayVcode.VCODE_LOADED) {
		G("RefreshVcode").innerHTML = '<span style="color:#999">正在读取验证码...</span>';
		G("RefreshVcode").onclick = null;
		G("SearchVcodeImg").onload = function() {
			if (!displayVcode.VCODE_DISPLAY) {
				displayVcode.VCODE_LOADED = true;
				return;
			}
			G("RefreshVcode").innerHTML = "看不清楚？";
			displayVcode.VCODE_LOADED = true;
			G("RefreshVcode").onclick = function(e) {
				e = e || window.event;
				baidu.event.preventDefault(e);
				displayVcode.refreshVcode();
				return false;
			};
		};
		displayVcode.VCODE_LOADED = false;
		
	//由于推广实况和推广回放的验证码储存在不同的cache上，所以要分别请求不同src。。。
	   if (type == "PB") {
	       G("SearchVcodeImg").src = 'vcode?src=plb&nocache=' + Math.random();
	   }
	   else {
	       G("SearchVcodeImg").src = 'vcode?src=prv&nocache=' + Math.random();
	   }
	}
};

/**
 * 翻页逻辑,iframe中，通过parent.switchPage();目前线上的移动设备没有翻页功能，这个地方不做升级
 * 只针对推广实况，回放中不涉及翻页问题
 */
function switchPage(pageNo){
	pageNo = pageNo || 0;
	
	var form = baidu.g('AdPreviewFormPC'),
		params = baidu.json.parse(baidu.g('AdPreviewParamsParamsPC').value);
		
	params['pageNo'] = pageNo;
	ToolsModule.adpreview.pageNo = pageNo;
	baidu.g('AdPreviewParamsParamsPC').value = baidu.json.stringify(params);
	form.submit();
}
/**
 * 显示提示信息，仅供推广回放后台调用
 * @param {Object} isshow 显示该提示区域
 */
function showResultTips(isshow){
    var G = baidu.G;
    if(isshow){
        baidu.removeClass(G("showResultTips"),'hide');
        if(isshow == 'error'){
			G("showResultTips").innerHTML = "<p>服务器繁忙，请您稍后再试。</p>";	  
		}else if(isshow == true){
			G("showResultTips").innerHTML = "<p>未找到相关结果，您尚未购买该关键词或该关键词在查询时间范围内无展现。</p>";
		}
        G("AdPreviewFrameContainer").style.display = "none";
		G("PlaybackFrameContainer").style.display = "none";

        baidu.addClass('preview-right-btn', 'hide');
        baidu.addClass('preview-left-btn', 'hide');
    }
    
}
