/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/aoPkgFlashCtrl.js
 * desc: 优化包flash控制类
 * author: LeoWang(wangkemiao@baidu.com)
 * version: 1.0
 * date: $Date: 2012/09/10 $
 */

/**
 * @description 包框架类
 * 目的：作为不同的优化包共同使用flash控制对象
 *
 * @param options 配置信息，默认实际上是传入了config中相应包配置的dataArea配置
 */
nirvana.aoPkgControl.AoPkgFlashCtrl = nirvana.aoUtil.createClass({
	/**
	 * 构造函数
	 * 
	 * @param {String} pkgid 传入了对应app的pkgid
	 * @param {Object} opts 实际上是在new AoPackage(opts)这时候传入的，且必须传入
	 */
	init : function(pkgid, options){
		var me = this;
		me.pkgid = pkgid;
		me.appId = nirvana.aoPkgConfig.SETTING[nirvana.aoPkgConfig.KEYMAP[pkgid]].id;
		me.options = options;

		// 一些默认设置
		me.containerDom = baidu.g(me.appId + 'AoPkgDataAreaContainer');
		me.descDom = baidu.g(me.appId + 'AoPkgDataAreaDesc');
		me.mainDom = baidu.g(me.appId + 'AoPkgDataAreaMain');
		me.loadingDom = baidu.g(me.appId + 'AoPkgDataAreaLoading');
	}
});

baidu.extend(nirvana.aoPkgControl.AoPkgFlashCtrl.prototype, {
	/**
	 * @description 展现flash
	 */
	show : function(){
		var me = this,
			param;

		// first thing first，先获取数据，然后再展现
		// 有延迟的... 都需要时间，先获取数据，再载入flash，因为flash支持后续数据加载的
		param = me.getRequestParam();
		param.onSuccess = me.getSuccessHandler();
		param.onFail = function(response) {
			me.hideloading();
			me.processEmptyResult('error');
			ajaxFailDialog();
		};
		
		me.showloading();
		
		fbs.nikon.getFlashData(param);
	},

	/**
	 * @description 处理非正常状况下的展现
	 */
	processEmptyResult : function(type){
		var me = this;
		me.hideloading();
		switch(type){
			case 'empty': // 返回数据为空
			case 'error': // 返回数据失败
			case 'errordata': // 成功返回但是设置数据时失败
				me.mainDom.innerHTML = '<div class="aopkg_dataarea_errorarea">' + me.options.emptyMessage + '</div>';
		}
	},

	/**
	 * @description 获取请求参数
	 */
	getRequestParam : function(){
		var me = this,
			pkgid = me.pkgid,
			param = {
				pkgid : pkgid
			};
		
		return param;
	},

	/**
	 * @description 数据成功处理
	 */
	getSuccessHandler : function(){
		var me = this;
		return function(response){
			var data = response.data,
				descData = data.desc,
				flashData = data.listData;

			if(!data || !flashData || !descData){
				me.processEmptyResult('empty');
				return;
			}
			me.origDescData = descData;
			me.descData = me.processDescData(descData);;
			me.origFlashData = flashData;
			me.flashData = me.processFlashData(flashData);
						
			// 渲染Flash的信息
			me.renderDesc();
			
			// 渲染Flash界面
			me.renderFlash();

			// 事件绑定
			me.bindHandlers();
			me.hideloading();
		};
	},
	processDescData : function(descData){
        // 将如下代码简化一下 by Huiyao
//		var me = this,
//			newData = baidu.object.clone(descData);
//
//		return newData;
        return baidu.object.clone(descData);
	},

	processFlashData : function(flashData){
        // 将如下代码简化一下 by Huiyao
//		var me = this,
//			newData = baidu.object.clone(flashData);
//		return newData;
        return baidu.object.clone(flashData);
	},

	/**
	 * @description 渲染数据区域信息，需要注意的是我们在这里并没有对插入的ui进行初始化
	 *
	 * 说明：默认的话，就直接显示吧，包括替换行为
	 */
	renderDesc : function(){
		var me = this,
			descData = me.descData,
			descDom = me.descDom,
			descTpl = me.options.dataDesc,
			html;

		html = lib.tpl.parseTpl(descData, descTpl);
		descDom && (descDom.innerHTML = html);
	},

	/**
	 * @description 在页面渲染flash
	 */
	renderFlash : function(){
		var me = this,
			mainDom = me.mainDom,
			flashName = me.options.dataFlash,
			flashId = me.appId + 'AoPkgFlash',
			width = me.options.width || 940,
			height = me.options.height || 150;
		
		if(mainDom){			
			baidu.swf.create({
				id: flashId,
				url: './asset/swf/' + flashName,
				width: width,
				height: height,
				scale : 'showall',
				wmode : 'opaque',
				allowscriptaccess : 'always'
				/*
				vars : {
					'loadedCallBack' : 'nirvana.aoPkgControl.packageData.get(nirvana.aoPkgConfig.KEYMAP["' + me.pkgid + '"]).dataCtrl.loadedCallback'
				}
				*/
			}, mainDom);
		}
	},

	/**
	 * @description 在页面渲染flash完成之后调用函数
	 */
	loadedCallback : function(){
		var me = this;
			
		me.setFlashData();
	},

	/**
	 * @description 为flash元素设置数据
	 *
	 * @param data {Object} 填充数据，可选，不传的话会默认使用me.flashData
	 */
	setFlashData : function(data){
		var me = this,
			app = this.app,
			flashId = me.appId + 'AoPkgFlash',
			flashData = data || me.flashData,
			flashObj;

		me.showloading();
		flashObj = baidu.swf.getMovie(flashId);
		try{
			flashObj && flashObj.setData(flashData);
			me.hideloading();
		}
		catch(e){
			me.processEmptyResult('errordata');
		}
	},

	/**
	 * @description 事件绑定
	 */
	bindHandlers : function(){
		var me = this;
	},


	/**
	 * @description 显示loading
	 */
	showloading : function(){
		var me = this;
		baidu.removeClass(me.loadingDom, 'hide');
	},
	/**
	 * @description 隐藏loading
	 */
	hideloading : function(){
		var me = this;
		baidu.addClass(me.loadingDom, 'hide');
	}
});

nirvana.aoPkgControl.onFlashLoaded = function(flashId){
	var me = this,
		app;

    // 简化这段代码逻辑，省的每次创建个新包都要在这里配置一下，太蛋疼了。。del by Huiyao
//	switch(flashId){
//		case 'DecreaseAoPkgFlash':
//			app = me.packageData.get('DECREASE');
//			app && app.dataCtrl.loadedCallback();
//			break;
//		case 'BusinessAoPkgFlash':
//			app = me.packageData.get('BUSINESS');
//			app && app.dataCtrl.loadedCallback();
//			break;
//		case 'QualityAoPkgFlash':
//			app = me.packageData.get('QUALITY');
//			app && app.dataCtrl.loadedCallback();
//			break;
//		case 'RecmwordAoPkgFlash':
//			app = me.packageData.get('RECMWORD');
//			app && app.dataCtrl.loadedCallback();
//			break;
//        case 'EmergencyAoPkgFlash':
//            app = me.packageData.get('EMERGENCY');
//            app && app.dataCtrl.loadedCallback();
//            break;
//	}

    // NOTCIE:为了保持这里代码通用，要求flashId的命名格式需要满足如下正则表达式要求：
    // 即以'AoPkgFlash'结尾，且flashId前缀为在不区分大小写情况下同pkgId，pkgId必须全大写
    // e.g.,pkgId为EMERGENCY, 对应flashId为EmergencyAoPkgFlash
    var getPkgNameRegex = /(.*)AoPkgFlash$/;
    var result = getPkgNameRegex.exec(flashId);

    if (result) {
        app = me.packageData.get(result[1].toUpperCase());
        app && app.dataCtrl.loadedCallback();
    }
}