/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/business/business.js 
 * desc: 质量度优化包，扩展自aoPackage.js
 * author: Leo Wang(wangkemiao@baidu.com)
 * date: $Date: 2012/09/11 $
 */

nirvana.QualityPackage = new nirvana.myPackage({
	extendDataCtrl : function(){
		var me = this,
			dataCtrl = me.dataCtrl;

		me.dataCtrl.renderDesc = function(){
			var me = this,
				descData = me.descData,
				origFlashData = me.origFlashData,
				flashData = me.flashData,
				descDom = me.descDom,
				descTpl = me.options.dataDesc,
				html;


			var thtml = '',
				word = '零一二三';
			if(descData.star1num == 0 && descData.star2num == 0 && descData.star3num == 0){
				thtml = '一、二、三星词数量均无变化';
			}
			else{
				for(var i = 1; i <= 3; i++){
					if(descData['star' + i + 'num'] > 0){
						thtml += '' + word.charAt(i) + '星词增加<span class="aopkg_dataareadesc_incevalue">' + descData['star' + i + 'num'] + '</span>个';
					}
					else if(descData['star' + i + 'num'] == 0){
						thtml += '' + word.charAt(i) + '星词数量无变化';
					}
					else{
						thtml += '' + word.charAt(i) + '星词减少<span class="aopkg_dataareadesc_decrvalue">' + (-descData['star' + i + 'num']) + '</span>个';
					}
					if(i < 3){
						thtml = thtml + '，';
					}
				}
			}
			html = lib.tpl.parseTpl({
				worddescinfo : thtml
			}, descTpl);

			descDom && (descDom.innerHTML = html);

			var container = baidu.g('AoPkgQuaFlashCtrl');
			var uilist = ui.util.init(container);
			var func = function(){
				var checked = this.getChecked();
				var cvalue = this.getValue();
				nirvana.aoPkgControl.logCenter.extend({
					wordlevel : cvalue,
					type : checked ? 1 : 0
				}).sendAs('nikon_flash_linechecked');
				
				var arr = [], hasLine = false;
				for(var i = 1; i <= 3; i++){
					if(ui.util.get('AoPkgQuaStar' + i).getChecked()){
						arr.push(1);
						hasLine = true;
					}
					else{
						arr.push(0);
					}
				}
				
				flashData.show = arr;
				me.setFlashData();
			}
			
			baidu.object.each(uilist, function(item, i){
				item.setChecked(true);
				item.onclick = func;
			});
			
			var childNodes = baidu.q('ui_checkbox_label', container, 'label');
			baidu.object.each(childNodes, function(item, i){
				if(item.innerHTML.indexOf('三') > -1){
					item.innerHTML += '<span class="star3line"></span>';
				}
				else if(item.innerHTML.indexOf('二') > -1){
					item.innerHTML += '<span class="star2line"></span>';
				}
				else if(item.innerHTML.indexOf('一') > -1){
					item.innerHTML += '<span class="star1line"></span>';
				}
			});
		};

		me.dataCtrl.processFlashData = function(flashData){
			var me = this,
				descData = me.descData,
				newData = {};

			newData.show = [1, 1, 1];
			newData.date = [];
			newData.data = [[], [], []];
			for(var i = 0; i < flashData.length; i++){
				newData.date.push(flashData[i].date);
				newData.data[0].push(flashData[i].star1num);
				newData.data[1].push(flashData[i].star2num);
				newData.data[2].push(flashData[i].star3num);
			}
			newData.colors = [0x0077cc,0x259e01,0xed410c];
			newData.names = ["一星词","二星词","三星词"];

			return newData;
		};

		me.dataCtrl.bindHandlers = function(){
		};
	},

	extendOptimizerCtrl : function(pkgid, newoptions){
		var me = this;
		me.optimizerCtrl = new nirvana.aoPkgControl.AoPkgGroupOptCtrl(pkgid, newoptions);
        /**
         * 将提词详情切到新版的提词详情
         * @author wuhuiyao
         * @date 2013.3.21
         */
        me.optimizerCtrl.viewDetail = function(optid, opttypeid, cache, data) {
            this.switchToDetail2(optid, opttypeid, cache, data);
        };
        /**
         * 创意优化详情视图配置
         * @type {Object}
         * @date 2013-05-06
         * @author wuhuiyao@baidu.com
         */
        me.optimizerCtrl.detailConf = nirvana.aoPkgControl.qualityDetailConf;

        /**
		 * 获取刷新行为要处理的目标Dom元素
		 *
		 * @param {String} optid 要检查的optid 即idstr 有可能是303.1_1这种 
		 */
		me.optimizerCtrl.getRefreshTarget = function(optid){
			var me = this,
				appId = me.appId,
				opttypeid,
				issub,
				tarr, subindex,
				cache, cachedata,
				target,
				i, l;
			
			if('undefined' == typeof optid){
				return;
			}

			issub = (optid.indexOf('_') > -1);

			if(issub){
				tarr = optid.split('_');
				opttypeid = tarr[0];
				subindex = +tarr[1];
				cache = me.getCache(opttypeid);
				cachedata = cache.compData[subindex];
			}
			else{
				opttypeid = optid;
				cache = me.getCache(optid);
				cachedata = cache.data;
			}

			if(me.isExtendable(opttypeid)){
				var theid = opttypeid.replace(/\D\w+/g, '');
				var delid = '';
				if(theid == '303'){
					if(opttypeid == '303.1'){
						delid = '303.2';
					}
					else{
						delid = '303.1';
					}
					baidu.dom.remove('AoPkgAbsItem' + delid);
					baidu.dom.remove('AoPkgSublist' + delid);
					baidu.dom.remove('AoPkgSublist' + opttypeid);
					target = baidu.g('AoPkgAbsItem' + opttypeid);
				}
				else{
					// 直接使用父容器元素，删除子列表
					target = baidu.g('AoPkgAbsItem' + opttypeid);
					baidu.dom.remove('AoPkgSublist' + opttypeid);
				}
			}
			else{
				target = baidu.g('AoPkgAbsItem' + opttypeid);
			}

			return target;
		}
	}

});