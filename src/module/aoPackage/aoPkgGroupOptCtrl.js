/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/aoPkgGroupOptCtrl.js 
 * desc: 支持分组的“优化建议”获取类
 * author: LeoWang(wangkemiao@baidu.com)
 * version : 2.0
 * date: $Date: 2012/09/14 $
 */

/**
 * @description 支持分组的“优化建议”获取类
 *
 * @extends nirvana.aoPkgControl.AoPkgGroupOptCtrl
 *
 * 支持分组，options里面，hasGroup=true，且groupInfo不为空
 *
 **/
nirvana.aoPkgControl.AoPkgGroupOptCtrl = nirvana.aoUtil.extendClass(nirvana.aoPkgControl.AoPkgOptimizerCtrl, {

	preProcess : function(){
		var me = this,
			pkgid = me.pkgid,
			appId = me.appId;

		// 根据包实例对象的数据，修改默认摘要请求参数数据中的包id和opttype的id数组
		me.defaultAbsRequestParam.pkgids = [pkgid];
		me.defaultAbsRequestParam.opttypeids = me.options.OPTTYPE;
		me.processGroupMapping();
	},

	/**
	 * 如果有分组，那么预先整理分组信息映射，这是为了效率
	 */
	processGroupMapping : function(){
		var me = this,
			pkgid = me.pkgid,
			appId = me.appId,
			groupinfo,
			i, j,
			opttypes;

		if(me.options.hasGroup){
			groupinfo = me.options.groupInfo;
			me.opt2groupMapping = {};
			for(i = 0; i < groupinfo.length; i++){
				opttypes = groupinfo[i].OPTTYPE;
				for(j = 0; j < opttypes.length; j++){
					me.opt2groupMapping[opttypes[j]] = i + 1;
				}
			}
		}
	},

	renderContainer : function(){
		var me = this,
			appId = me.appId,
        /*	containerDom = me.containerDom, del by Huiyao 2013.1.7 没有用到变量
			titleDom = me.titleDom,*/
			mainDom = me.mainDom;

		if(me.options.hasGroup){
			if(mainDom){
				mainDom.innerHTML = '';
				for(var i = 1; i <= me.options.groupInfo.length; i++){
					mainDom.innerHTML += '<h3 id="' + appId + 'AoPkgGroupTitle' + i + '" class="hide">'
									  + me.options.groupInfo[i - 1].groupName
									  + '</h3>'
									  + '<ul id="' + appId + 'AoPkgGroupList' + i + '" class="aopkg_listgroup hide' 
									  +  (i == me.options.groupInfo.length ? ' aopkg_listgroup_nomargin' : '')
									  + '"></ul>';
				}
			}
			me.optItemRenderTargetId = appId + 'AoPkgGroupList';
		}
	},

	getItemContainerTarget : function(item){
		var me = this,
			targetId = me.optItemRenderTargetId,
			group = me.opt2groupMapping[item.opttypeid];

		if(me.options.hasGroup){
			return baidu.g(targetId + group);
		}
		else{
			return baidu.g(targetId);
		}
	},
    /**
     * 确定给定的优化建议组是否能显示，默认根据优化建议数量来确定，即有优化建议，该组才能显示
     * @param {string} groupTitleId 优化建议组的标题DOM元素ID
     * @param {string} optGroupId 优化建议组的容器DOM元素ID
     * @return {boolean}
     */
    isShowGroupOptimize: function(groupTitleId, optGroupId) {
        return baidu.q('aopkg_absmainitem', optGroupId, 'li').length;
    },
	onafterShowOverviewItem : function(opttypeid, options){
		var me = this,
			appId = me.appId,
			group = me.opt2groupMapping[opttypeid],
			targetId = me.optItemRenderTargetId + group,
			titleTargetId = appId + 'AoPkgGroupTitle' + group;

		if(me.options.hasGroup){
            // modified by Huiyao 2013.1.10: 重构了下述代码，代码逻辑不变
//			var list = baidu.q('aopkg_absmainitem', targetId, 'li');
//			if(list.length == 0){
//				baidu.addClass(titleTargetId, 'hide');
//				baidu.addClass(targetId, 'hide');
//			}
//			else{
//				baidu.removeClass(titleTargetId, 'hide');
//				baidu.removeClass(targetId, 'hide');
//			}
            if (me.isShowGroupOptimize(titleTargetId, targetId)) {
                baidu.removeClass(titleTargetId, 'hide');
                baidu.removeClass(targetId, 'hide');
            }
            else {
                baidu.addClass(titleTargetId, 'hide');
                baidu.addClass(targetId, 'hide');
            }
		}
	}
});