/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/recmword/recmword.js
 * desc: 重点词优化包定义，扩展自aoPackage.js
 * author: mayue@baidu.com
 * date: $Date: 2012/09/07 $
 * @deprecated
 */
// 注册搜索
nirvana.aoPkgControl.modules.widget505 = new er.Module({
	config: {
		'action': [{
			action: "nirvana.aoPkgControl.widget505",
			path: "aoPkg/widget505"
		}]
	}
});
nirvana.RecmwordPackage = new nirvana.myPackage({
	className : 'recmword_pkg',
	hidePackageDialog: function(currview, param, prevDialog){
		var me = this,
			dialog = me.getDialog();

        // 发送关闭监控
        var CLOSE_MODE = nirvana.AoPkgMonitor.CLOSE_MODE;
        var closeMode = param ? CLOSE_MODE.BY_X : CLOSE_MODE.BY_CLOSE_BTN;
        nirvana.AoPkgMonitor.closeAoPkg(currview, closeMode);

        var detailCtrl = me.optimizerCtrl.detailCtrl;
        var detailView = detailCtrl && detailCtrl.getDetailView();
        var hasWordAdded = detailView && detailView.hasModified();

		//析构子Action
        me.optimizerCtrl && me.optimizerCtrl.dispose(); // add by Huiyao 2013.3.17
		if (me.optimizerCtrl.data.get('subAction')){
			er.controller.unloadSub(me.optimizerCtrl.data.get('subAction'));
		}

		dialog.close(param);
		prevDialog && prevDialog.close();
//		if ((me.optimizerCtrl.hasWordAdded == true) || ((me.optimizerCtrl.data.get('subAction') && me.optimizerCtrl.data.get('subAction').hasWordAdded == true))){
        if (hasWordAdded) {
			ui.Dialog.confirm({
				title : '提醒',
				content : '部分关键词不适合放入原账户结构，为您新建了单元存放。为这些新单元添加创意后关键词才能上线。是否添加创意？',
				ok_button_lang: '立即添加',
				cancel_button_lang: '取消',
				onok : function(){
					nirvana.manage.createSubAction.idea({
						type: 'add',
						changeable: true,
						entranceType: 'aoPackage_recm',
						batch: {
					 		isbatch: true,
					 		type:'default'
					 	},
					 	wordref: {
						 	show: true,
						 	source: 'normal'
					 	}
					});
				}
			});
		}

		return false;
	},
	extendOptimizerCtrl : function(pkgid, newoptions){
		var me = this;
        /**
         * 将提词详情切到新版的提词详情
         * @author wuhuiyao
         * @date 2013.3.21
         */
        me.optimizerCtrl.viewDetail = function(optid, opttypeid, cache, data) {
            this.switchToDetail2(optid, opttypeid, cache, data);
        };

		me.optimizerCtrl.getItemTplName = function(item, options){
			return 'aoPkgRecmWordCheckableOptItem';
		};

		me.optimizerCtrl.postProcessItemHtml = function(oldhtml, itemData, options){
			var previewWords = itemData.data.previewwords.split(','),
				previewBlocksHtml = '',
				optTextMap = {
					'501': '热搜词',
					'502': '潜力词',
					'503': '质优词',
					'504': '行业词'
				};
			
			oldhtml = oldhtml.replace('%apPkgOptText', optTextMap[itemData.opttypeid]);
			var previewNum = previewWords.length,
				previewNum = (previewNum > 5) ? 5 : previewNum;
			for (var i = 0; i < previewNum; i++){
				previewBlocksHtml = previewBlocksHtml
				 					+ '<a class="recmword_preview_item" title="' 
				 					+ previewWords[i] + '">' 
				 					+ getCutString(previewWords[i], 14, '...') + '</a>';
			}
			if (itemData.data.totalnum > 5){
				previewBlocksHtml = previewBlocksHtml + '<a class="recmword_preview_item">...</a>';
			}
			return oldhtml.replace('%previewBlocks', previewBlocksHtml);
		};

		me.optimizerCtrl.onDetailSubActionClose = function(subAction){
			var hasWordAdded = (subAction.hasWordAdded && subAction.hasWordAdded == true) ? true : false;
			if (hasWordAdded){
				me.optimizerCtrl.hasWordAdded = true;
			}
			if (baidu.g('recmwordSearchInput')){
				baidu.g('recmwordSearchInput').value = '';
			}
		};
		
		// AOP劫持函数
		me.optimizerCtrl.listenFunctions = [
			'itemAppliedOK',
			'itemAppliedPartSucceeded',
			'bindHandlers'
		];
		me.optimizerCtrl.onafterItemAppliedOK = function(targetid){
			me.optimizerCtrl.hasWordAdded = true;
			baidu.q('recmwordPreviewContainer', baidu.g('AoPkgAbsItem' + targetid))[0].innerHTML = '已添加全部关键词';
		};
		me.optimizerCtrl.onafterItemAppliedPartSucceeded = function(targetid){
			me.optimizerCtrl.hasWordAdded = true;
		};
		me.optimizerCtrl.onafterBindHandlers = function(){
			baidu.on(me.optimizerCtrl.appId + 'AoPkgManagerMain', 'click', function(e){
				var event = e || window.event,
					target = event.target || event.srcElement,
					p, li = null, picarea = null;

				p = target;
				while(p && p.id != me.optimizerCtrl.appId + 'AoPkgManagerMain'){
					if(p.tagName.toUpperCase() == 'LI'){
						li = p;
						break;
					}
					if(p.className == 'aopkg_titlepic_container'){
						picarea = p;
					}
					p = p.parentNode;
				}

				if(li && picarea){
					var tempid = baidu.dom.getAttr(li, 'action_data');
					me.optimizerCtrl.clickOptButton(tempid);
				}

			});
		};
		me.optimizerCtrl.initAOP();
	},
	extendDataCtrl : function(){
		var me = this,
			dataCtrl = me.dataCtrl;
			
		me.dataCtrl.processFlashData = function(flashData){
			var ctrl = this,
				newData = [];
			for(var i = 0; i < flashData.length; i++){
				newData.push(flashData[i]);
				newData[i].label = newData[i].date.slice(5);
			}
			return newData;
		};
	},
	onafterRenderAppAllInfo: function(){
		var me = this,
			inputTpl = er.template.get('recmwordPkgSearch');
		
		function switchToSearch() {
			me.optimizerCtrl.setCache('505', {
				data:{
					totalrecmnum: '5000', 
					searchword/*searchInput*/: baidu.trim(baidu.g('recmwordSearchInput').value)
				}
			});
			var logParam = {opttypeid: '505'};
			nirvana.aoPkgControl.logCenter.extend(logParam)
										  .sendAs('nikon_optitem_viewdetail');
										  
//			me.optimizerCtrl.switchToDetail('505');

            /**
             * 将提词详情切到新版的提词详情
             * @author wuhuiyao
             * @date 2013.3.21
             */
            var itemData = me.optimizerCtrl.getOptimizeItemData('505');
            // 执行查看详情动作
            me.optimizerCtrl.viewDetail('505', itemData.opttypeid, itemData.details, itemData.data);
		}
		
		if (!baidu.g('recmwordSearchInput')){
			baidu.dom.insertHTML(me.getDialog().getFoot(), 'beforeEnd', inputTpl);
			baidu.event.on('recmwordSearchBtn', 'click', function(){
				if (baidu.trim(baidu.g('recmwordSearchInput').value) != ''){
					switchToSearch();
				}
			});
			baidu.on('recmwordSearchInput', 'keydown', function(e){
                e = e || window.event;
				if (e.keyCode == 13 && baidu.trim(baidu.g('recmwordSearchInput').value) != ''){
					switchToSearch();
				}
			});

			// 输入框超长截断
			baidu.on('recmwordSearchInput', 'keyup', function(e){
                e = e || window.event;
				var value = baidu.g('recmwordSearchInput').value,
					len = nirvana.aoPkgConfig.SEARCHWORD_MAXLEN;

				if (getLengthCase(baidu.trim(value)) > len) {
					baidu.g('recmwordSearchInput').value = subStrCase(baidu.trim(value), len);
				}
			});
		}
	}
});
