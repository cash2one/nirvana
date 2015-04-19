/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    trans/getCode.js
 * desc:    获取代码
 * author:  wanghuijun
 * date:    $Date: 2011/04/28 $
 */

ToolsModule.getCode = new er.Action({
	
	VIEW: 'getCode',
	
	IGNORE_STATE: true,
	
	UI_PROP_MAP : {
	},
	
	CONTEXT_INITER_MAP: {
	},
	
	onafterrender : function(){
		var me = this,
			controlMap = me._controlMap;
		
		me.fillInit();
		
		me.getJsCode();
		
		// 取消
		controlMap.GetCodeClose.onclick = function() {
			me.onclose();
		};
	},
	
	onentercomplete : function(){
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 填充初始信息
	 */
	fillInit : function() {
		var me = this,
			G = baidu.g,
			site_url = me.arg.site_url;
		
		G('GetJsCodeContainerDomain').innerHTML = baidu.encodeHTML(site_url);
	},
	
	/**
	 * 获取代码
	 */
	getJsCode : function() {
		var me = this,
			G = baidu.g,
			siteid = me.arg.siteid;
		
		fbs.trans.jsCode({
            siteid: siteid,
            onSuccess: function(response){
                var codeText = G('GetJsCodeContainerCodeTextarea'),
					codeTip = G('GetJsCodeContainerCopyComplete');
					
                codeText.value = response.data;
				
                var clip = new Swf({
                    "id": "ClipBtnHead",
                    "url": "./asset/swf/clipBtn.swf",
                    "width": 152,
                    "height": 27,
                    "instanceName": "instanceName",
                    "params": {
                        wmode: "transparent"
                    },
                    "vars": {
                        txt: "复制代码"
                    }
                });
                clip.appendTo(G('GetJsCodeContainerFlashCopyBtn'));
                clip.onsuccess = function(){
                    codeTip.innerHTML = "复制成功！";
                    setTimeout(function(){
                        codeTip.innerHTML = "";
                    }, 2000);
                };
                clip.onClip = function(){
                    codeText.select();
                    return codeText.value.replace(/\<br \/\>/g, ''); // 此处返回要被复制的值，注意需要过滤所有br
                };
                clip.onfail = function(){
                    codeTip.innerHTML = "复制失败，请手动复制！"
                };
            },
            onFail: function(){
                ajaxFailDialog();
            }
        });
	}
});
