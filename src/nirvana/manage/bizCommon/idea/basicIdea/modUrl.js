/**
 * @file nirvana\src\nirvana\manage\bizCommon\idea\normalIdea\modUrl.js 
 * 批量修改创意url
 *
 * @author yanlingling(yanlingling@baidu.com)
 * @date:    $Date: 2013/5/7 $
 */


manage.modIdeaUrl = new er.Action({

	VIEW : 'modIdeaUrl',

	IGNORE_STATE : true,
	// 访问URL输入框
	UI_PROP_MAP : {
		// 访问URL输入框
	    IdeaHref: {
		    type: 'TextInput',
		    height: '22',
		    width: '322'
	    },
		MIdeaHref : {
			type : 'TextInput',
			height : '22',
			width : '322'
		},

		// 显示URL输入框
		IdeaUrl : {
			type : 'TextInput',
			height : '22',
			width : '322'
		},

		// 显示URL输入框
		MIdeaUrl : {
			type : 'TextInput',
			height : '22',
			width : '322'
		}
	},
	

	/**
	 *action渲染之后
	 */
	onafterrender : function() {
		var me = this;
		var editLib = IDEA_CREATION;
		var item = me.arg.item;
		me.setContext('deviceprefer',item[0].deviceprefer);
		//隐藏移动预览链接
		baidu.addClass('previewPhoneUrl','hide');
		baidu.addClass('MpreviewPhoneUrl','hide');
		
		//baidu.g('previewPhoneUrl') ? baidu.addClass('previewPhoneUrl','hide'):'';
		//baidu.g('MpreviewPhoneUrl') ? baidu.addClass('MpreviewPhoneUrl','hide'):'';
		me.handleShowArea();
		me.initInputValue();
		me.initEvent();
	},
	
	/**
	 *显示移动url区域或者是默认 url区域
	 */
	handleShowArea : function(){
		var me = this;
		var type = me.arg.type;
		var editLib = IDEA_CREATION;
		if(type == 'miurl') {//修改移动url
			baidu.removeClass('ideaPhoneToggleArea','hide');
			baidu.addClass('batch-mod-url','hide')
		}else{
			baidu.addClass('ideaPhoneToggleArea','hide');
			baidu.removeClass('batch-mod-url','hide')
			if(me.getContext('deviceprefer') == 2){//仅移动计划的时候 ，显示字面要改
				IDEA_CREATION.changeToMobileChar();
				ui.util.get('ideaModUrlDialog').setTitle('移动url');
			}
		}
	},
	
	/**
	 * 初始化输入框的值
	 */
	initInputValue : function(){
		var me = this;
		var item = me.arg.item;
		var type = me.arg.type;
		var me = this;
		var editLib = IDEA_CREATION;
		if(item.length == 1) {//只勾选了一个带入
			var idea = IDEA_CREATION.getSourceIdeaData(item[0]);

			if(type == 'url') {
				//填充普通创意
				 IDEA_CREATION.fillUrl(idea);
			} else {
				 IDEA_CREATION.fillMurl(idea);
			}

		}
		else {//勾选多个带入
             me.fillUrlInputWithChar();
		}
	},
	
	/**
	 *用各异填充input 绑定事件
	 */
	fillUrlInputWithChar : function() {
		var editLib = IDEA_CREATION;
		var field = ['href','url','mhref','murl'];
		for (var i=0; i < field.length; i++) {
			var curInput = editLib.getForm(IDEA_CREATION.dom[field[i]].input);
		    curInput.value = nirvana.config.LANG.DIFFERENCE;
		    baidu.addClass(curInput, "gray");//各异两个文字是灰色
		    editLib.getForm(IDEA_CREATION.dom[field[i]].input).onfocus = function(){
					if(this.value == nirvana.config.LANG.DIFFERENCE){
						this.value = '';
					}
					this.onfocus = null;
					baidu.removeClass(this, "gray");
				}
		};
	},
	
	/**
	 *事件初始化 
	 */
	initEvent : function() {
		var me = this;
		var controlMap = me._controlMap;
		me.initInputEvent();
		controlMap.modOk.onclick = me.modUrlOk();
		controlMap.modCancel.onclick = function(){
			me.onclose();
		};
	},
	
	/**
	 *给输入框绑定各种事件 
	 */
	initInputEvent : function() {
		var me = this;
		var editLib = IDEA_CREATION;
		var validateEventList = ['focus', 'blur', 'keyup', 'mouseup'];
		var input = [editLib.getForm(editLib.dom.href.input), editLib.getForm(editLib.dom.url.input), editLib.getForm(editLib.dom.mhref.input), editLib.getForm(editLib.dom.murl.input)], inputid = [editLib.dom.href.input, editLib.dom.url.input, editLib.dom.mhref.input, editLib.dom.murl.input], event;

		for(var i = 0, j = validateEventList.length; i < j; i++) {
			event = validateEventList[i];

			for(var x = 0, y = input.length; x < y; x++) {
				if(input[x]) {
					baidu.on(input[x], event, editLib.instantDetection(inputid[x],true));

				}
			}
		}
	},
	
	/**
	 *点击确认 
	 */
	modUrlOk : function() {
		var me = this;
		var editLib = IDEA_CREATION;
		return function() {
			var field = ['href','url'];
			var type = me.arg.type;
			if(type == 'miurl'){
				field = ['mhref','murl'];
			}
			if (editLib.validate(field) == 1) { // 参数通过验证
				me.saveIdeaUrl();
			}
		}
		
		
	},
	
	/**
	 *保存url 
	 */
	saveIdeaUrl : function() {
		var me = this;
		var ids = [];
		var editLib = IDEA_CREATION;
		var type = me.arg.type;
		var data = me.arg.item;
		for(var i = 0,len = data.length;i < len; i++){
			ids.push(data[i].ideaid);
		}
		var param = {};
		param.ideaids = ids;
		param.onSuccess = function(){//关闭窗口

            // wsy 移动优化包-搬家方案-监控需要
            var url={
                miurl : "",
                mshowurl : "",
                url : "",
                showurl : ""
            };
            if(type == 'miurl') {//修改移动url
                url.miurl = editLib.getForm(editLib.dom.mhref.input).value;
                url.mshowurl = editLib.getForm(editLib.dom.murl.input).value;
            }
            else{
                url.url = editLib.getForm(editLib.dom.href.input).value;
                url.showurl = editLib.getForm(editLib.dom.url.input).value;
            }
            if(typeof me.arg.callback == 'function') me.arg.callback(url,me.arg.action);

			fbs.material.clearCache('ideainfo');
			er.controller.fireMain('reload', {});
			me.onclose();
			me._sendLog(type);
		};
		param.onFail = editLib.saveFail(me);//失败的时候，复用创意编辑失败的错误
		param.items = {};
		if(type == 'miurl') {//修改移动url
		    param.items.miurl = editLib.getForm(editLib.dom.mhref.input).value;
            param.items.mshowurl = editLib.getForm(editLib.dom.murl.input).value;
		    
			if(param.items.mshowurl == '') {//显示url没填的时候，用访问url
				param.items.mshowurl = editLib.removeIdeaUrlPrefix(
				param.items.miurl,
				editLib.getShowUrltoCut()
				).split('/')[0].substr(0, IDEA_MURL_MAX_LENGTH);
				
			}

		}
		else{
			param.items.url = editLib.getForm(editLib.dom.href.input).value;
            param.items.showurl = editLib.getForm(editLib.dom.url.input).value;
		}
		fbs.idea.modUrl(param);
	   
	},

	/**
	 * 发送监控
	 * @param {string} url类型  miurl|url 移动url|默认url
	 */ 
	_sendLog : function(type) {
		var _type = type == 'miurl' ? 'murl' : 'default';
		NIRVANA_LOG.send({
			target : 'batch-mod-idea-url',
			type : _type,
			optulevelid : nirvana.env.OPT_ULEVELID
		})
	}

	
})
