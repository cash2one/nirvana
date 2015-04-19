/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: aoPackage/industry/IndustryPkgFlashCtrl.js
 * desc: 行业领先包定义，扩展自aoPkgFlashCtrl.js
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/10/29 $
 */
nirvana.aoPkgControl.IndustryPkgFlashCtrl = nirvana.aoUtil.extendClass(nirvana.aoPkgControl.AoPkgFlashCtrl, {
	/**
	 * 获取图表区描述文字模板的数据 
	 */
	getDescrTplData: function(data) {
		var hasIndustryData = (+data.tiptype == 1),
//		    tplType,
		    tplName = 'industryPkgChartClickInfo',
		    subTplStateName = 'industryPkgChart',
		    subTplRankName = 'industryPkgChart',
		    clazzName = hasIndustryData ? "" : 'hide',
		    date = new Date(+data.datatime),
		    levelChange = +data.levelchange,
		    rankChange = + data.rankchange,
		    rankPercent = + data.percent,
//		    state = '',
		    rank = '';
		
		if (hasIndustryData && (levelChange != 0)) {
			// 对于消费等级不一致的使用模板1
			tplName += '1';
			subTplStateName += 'AccountState';
			subTplRankName += 'AccountRank';
			
			if (levelChange > 0) {
				rankPercent = 100 - rankPercent;
				subTplStateName += '1';
				subTplRankName += '1';
			} else {
				subTplStateName += '2';
				subTplRankName += '2';
			}
		} else {
			// 对于没有同行数据或者有同行数据但消费等级不变使用模板0
			tplName += '0';
			subTplStateName += 'ClickState';
			subTplRankName += 'ClickRank';
			
			// 对于rankchange > 0, 界面显示的百分比数为100 - rankPercent
//			if (hasIndustryData && rankChange > 0) {
//				rankPercent = 100 - rankPercent;
//			}
//
//			if (rankChange > 0) {
//				subTplStateName += '1';
//				subTplRankName += '1';
//			} else if (rankChange < 0) {
//				subTplStateName += '2';
//				subTplRankName += '2';
//			} else {
//				// 对于排名不变
//				if (rankPercent < 50) {
//					// 显示优于 （1-点击量TOP百分比）%的同行
//					rankPercent = 100 - rankPercent;
//					subTplStateName += '1';
//				} else {
//					// 显示低于 点击量TOP百分比%的同行
//					subTplStateName += '2';
//				}
//				subTplRankName += '3';
//			}

            if (hasIndustryData) {
                // 有同行数据，但消费等级一致
                if (rankChange >= 0) {
                    // 对于排名不变或提升都显示100—rankPercent
                    rankPercent = 100 - rankPercent;
                }

                if (rankChange > 0) {
                    subTplStateName += '1';
                    subTplRankName += '1';
                } else if (rankChange < 0) {
                    subTplStateName += '2';
                    subTplRankName += '2';
                } else {
                    // 对于排名不变
                    subTplStateName += '1';
                    subTplRankName += '3';
                }
            } else {
                // 对于没有同行数据，只有优于/低于xx，没有rank信息：提升/降低xx
                // 这里也可以直接用rankchange>0代替rankPercent<=50来判断，这个是后端做的处理
                if (rankPercent <= 50) {
                    // 显示优于 （1-点击量TOP百分比）%的同行
                    rankPercent = 100 - rankPercent;
                    subTplStateName += '1';
                } else {
                    // 显示低于 点击量TOP百分比%的同行
                    subTplStateName += '2';
                }
            }
		}
		
		if (0 == (+data.percent)) {
			// 对于为零情况下，使用状态3模板
			subTplStateName = subTplStateName.replace(/(\d)$/, "3");
		} 
		
		// 对于有同行数据，话术才显示rank信息：提升/降低
		if (hasIndustryData) {
			rank = lib.tpl.parseTpl({
						rankchange : Math.abs(rankChange)
					}, subTplRankName, true);
		}
		// 初始化状态信息: 优于/低于xx同行...
		var state = lib.tpl.parseTpl({
					percent : rankPercent
				}, subTplStateName, true);

		return {
			clazz: clazzName,
			descr : lib.tpl.parseTpl({
								month: (date.getMonth() + 1),
								date: date.getDate(),
								weekDay: parseDateToChineseWeek(date, true),
								state: state,
								rank: rank
							}, tplName, true)
				};
	},
	/**
	 * @description 渲染数据区域信息，需要注意的是我们在这里并没有对插入的ui进行初始化
	 *
	 * 说明：默认的话，就直接显示吧，包括替换行为
	 * @override
	 */
	renderDesc : function(){
		var me = this,
			descDom = me.descDom,
			html;
		// 初始化模板的数据
	    var tplData = me.getDescrTplData(me.descData);
	    
		html = lib.tpl.parseTpl(tplData, 'industryPkgChartDescr', true);
		descDom && (descDom.innerHTML = html);
	},
    /**
	 * 获取图表区图表模板的数据
	 */
	getCharTplData: function(data) {
		var order = + data.rankindex,
		    lightType;
		
		if (order <= 5) {
			lightType = "bad";
		} else if (order > 5 && order <= 8) {
			lightType = "good";
		} else {
			lightType = "excellent";
		}
		
		var tplData = baidu.object.clone(data);
		
		tplData.lighttype= lightType;
		
		return tplData;
	},
	/**
	 * @description 在页面渲染flash
	 * @override
	 */
	renderFlash : function(){
		var me = this,
			mainDom = me.mainDom,
			html;
			
		// 初始化模板数据
		var tplData = me.getCharTplData(me.descData);
		
		html = lib.tpl.parseTpl(tplData, 'industryPkgChart', true);
		mainDom && (mainDom.innerHTML = html);
		
		me.showClickTip();
	}, 
	/**
	 * 显示用户点击量的Tip 
	 */
	showClickTip: function() {
		var	mainDom = this.mainDom;
			
		var tipDom = baidu.q('pkg_click_tip', mainDom)[0],
			lightDom = baidu.q('pkg_light_head', mainDom)[0];
		
		if (!tipDom || !lightDom) {
			return;
		}
		
		tipDom.style.left = (lightDom.offsetLeft + lightDom.offsetWidth + 2) + "px";
		tipDom.style.top = (lightDom.offsetTop - 67) + "px";
		
		setTimeout(function(){
			tipDom && baidu.fx.fadeIn(tipDom, {duration: 500});
		}, 150);
	}

});