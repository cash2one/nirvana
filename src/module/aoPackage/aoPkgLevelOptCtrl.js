/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/aoPkgLevelOptCtrl.js 
 * desc: 支持分级请求的“优化建议”获取类
 * author: LeoWang(wangkemiao@baidu.com)
 * version : 2.0
 * date: $Date: 2012/09/14 $
 */

/**
 * @description 支持分级请求的“优化建议”获取类
 *
 * @extends nirvana.aoPkgControl.AoPkgLevelOptCtrl
 *
 * 支持分组，options里面，hasLevel=true，且levelInfo不为空
 *
 **/
nirvana.aoPkgControl.AoPkgLevelOptCtrl = nirvana.aoUtil.extendClass(nirvana.aoPkgControl.AoPkgOptimizerCtrl, {
	renderContainer : function(){
		var me = this,
			appId = me.appId,
			containerDom = me.containerDom,
			titleDom = me.titleDom,
			mainDom = me.mainDom;

		if(me.options.hasLevel){
			if(mainDom){
				mainDom.innerHTML = '';
				for(var i = 1; i <= me.options.levelInfo.levelcount; i++){
					mainDom.innerHTML += '<ul id="' + appId + 'AoPkgLevelList' + i + '" class="aopkg_listrank"></ul>';
				}
			}
			me.optItemRenderTargetId = appId + 'AoPkgLevelList';
		}
	},

	getItemContainerTarget : function(item){
		var me = this,
			targetId = me.optItemRenderTargetId;

		if(me.options.hasLevel){
			return baidu.g(targetId + item.data[me.options.levelInfo.flag]);
		}
		else{
			return baidu.g(targetId);
		}
	}
});