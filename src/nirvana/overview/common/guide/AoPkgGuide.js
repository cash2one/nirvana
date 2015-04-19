/*
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: nirvana/overview/guide/AoPkgGuide.js
 * desc: 优化包的引导功能
 * author: Wu Huiyao (wuhuiyao@baidu.com) 
 * date: $Date: 2012/10/11 $
 */
/**
 * 优化包的引导类
 * @class AoPkgGuide
 * @namespace overview
 * @static
 */
overview.AoPkgGuide = function($){
	// 用于发送引导页用户行为的监控
	var monitor = overview.AoPkgGuideMonitor;

	/**
	 * 优化包对应的引导内容配置<br/>
	 * NOTICE：这里的key:1,2,3,4,...对应包的ID 
	 */
	var pkgGuideContentMap = {
		1: {
            content: [],
            highlight: ''
        },
		2: {
            content: [],
            highlight: ''
        },
		3: {
            content: [],
            highlight: ''
        },
		4: {
            content: ['coreword_guide.png'],
            // 要高亮的优化包的图片，主要用于IE7无法实现高亮的替代方案
            highlight: 'coreword_highlight_ie7.png'
        },
		// 智能题词包引导页内容
		5: {
            content: [
                'recmword_guide1.png',
                'recmword_guide2.png',
                'recmword_guide3.png'
            ],
            highlight: 'recmword_highlight_ie7.png'
        },
		// 行业领先包引导页内容
		6: {
            content: [
                'industry_guide1.png',
                'industry_guide2.png',
                'industry_guide3.png'
            ],
            highlight: 'industry_highlight_ie7.png'
        },
        8: {
        	content: ['mobile_guide.png'],
            highlight: 'mobile_highlight_ie7.png'
        },
        // 行业旺季包引导页内容
        9: {
            content: ['season_guide1.png', 'season_guide2.png'],
            highlight: 'season_highlight_ie7.png'
        }
	};

	/**
	 * 打开优化包，并发送优化包打开的监控 
	 */
	function openAoPkg(pkgId) {
		nirvana.aoPkgControl.openAoPackage(pkgId, 1);
	}
	
	/**
	 * 关闭引导页触发的事件处理器
	 * 
	 * @param {Number}
	 *            pkgId 包的Id
	 * @param {Number}
	 *            step 触发该事件当前所处的引导页的步数
	 */
	function closeHandler(pkgId, step) {
		// 发送用户行为监控
		monitor.closeGuide(pkgId, step);
	}
	
	/**
	 * 点击立即体验触发的事件处理器
	 * 
	 * @param {Number}
	 *            pkgId 包的Id
	 * @param {Number}
	 *            step 触发该事件当前所处的引导页的步数
	 */
	function tryHandler(pkgId, step) {
		// 发送用户行为监控
		monitor.tryPkg(pkgId, step);
		// 打开优化包
		openAoPkg(pkgId);
	}
	
	/**
	 * 点击引导页左边logo打开优化包触发的事件处理器
	 * @param {Number} pkgId 包的Id
	 * @param {Number} step 触发该事件当前所处的引导页的步数 
	 */
	function openHandler(pkgId, step) {
		// 发送用户行为监控
		monitor.openPkg(pkgId, step);
		// 打开优化包
		openAoPkg(pkgId);
	}
	/**
	 * 显示优化包的引导页 
	 */
	function showGuide(pkgId) {
		var pkgConfig = nirvana.aoPkgConfig,
		    pkgIdMap = pkgConfig.KEYMAP,
		    pkgSetting = pkgConfig.SETTING;
			    
		var toShowPkgSetting = pkgSetting[pkgIdMap[pkgId]],
		    // 要高亮的优化包DOM元素
		    pkgDOM = "Pkg" + toShowPkgSetting.id;    
		
		// 不存在这个优化包则不出引导页
		if (!($("#AoPackageList LI[pkgid=" + pkgId + "]")[0])) {
			return false;
		}
		
		// 初始化引导页配置选项
		var options = {
			skin: toShowPkgSetting.id.toLowerCase() + '_pkg_guide',
			content: pkgGuideContentMap[pkgId].content || [],
			highLightDom: pkgDOM,
			highLightPic: pkgGuideContentMap[pkgId].highlight,
			logoTitle: "体验" + toShowPkgSetting.name,
			onClose: function(step) {
				closeHandler(pkgId, step);
				// 清除修复highlight调度
				clearTimeout(fixScheduler);
			},
			onTry: function(step) {
				tryHandler(pkgId, step);
			},
			onOpen: function(step) {
				openHandler(pkgId, step);
			} 
		};
		
		// 创建引导页实例
		var guide = new ui.Guide(options),
            fixScheduler;
		// 显示引导页
		guide.show();
		// 修复元素高亮
		// Ugly ！！！没办法智能优化包计算中每次都重新render整个智能优化包区域，这里只能这么干
		function fixHighlight() {
	        if ($$(".ui-guide").length > 0) {
	        	if (!baidu.dom.hasClass(pkgDOM, 'guide-highlight')) {
		            baidu.addClass(pkgDOM, 'guide-highlight');
		        }
                fixScheduler = setTimeout(fixHighlight, 50);
	        } 
		}
		// IE7不用修复，由于IE7使用图片实现高亮
		if (baidu.browser.ie != 7) {
			setTimeout(fixHighlight, 100);
		}

        return true;
	}
	
	var AoPkgGuide = {
		/**
		 * 显示优化包引导页
		 * @method show
		 * @param {Number} pkgId 优化包ID
		 */
		show: showGuide,
        /**
         * 对于小流量包上线的时候，线上已经存在有New标识的包，需要重置一下，避免同时出现两个new
         * 或者其它需求需要重置比如升级图标等
         * @method resetPkgFlag
         * @param {Number} aostatus 优化包的状态
         * @param {Array} aoPackageItems 包外优化包数据
         */
//        resetPkgFlag: function(aostatus, aoPackageItems) {
//            if (!nirvana.auth.isRecmwordExp() && (0 == aostatus)) {
//                var pkgConfig = nirvana.aoPkgConfig.SETTING;
//                // 当前用户不是智能提词包对照组用户,显示升级标识
//                pkgConfig[nirvana.aoPkgConfig.KEYMAP['5']].isUpgrade = true;
//            }
//        },
        /**
         * 初始化优化包查看介绍Tip的功能
         * @method initGuideTip
         */
        initGuideTip: function() {
            var pkgElemSelector = '#PkgRecmword,#PkgIndustry,#PkgCoreWords,#PkgMobile,#PkgSeason';

            // 渲染优化包查看介绍功能
            ui.Tip.init(pkgElemSelector, {
                content: '查看介绍',
                color: 'red-color',
                arrowPos: 'bottom',
                animation: false,
                offsetY: 5,
                onShow: function(elem) {
                    if (baidu.browser.firefox) {
                        baidu.dom.addClass(elem, 'reset_FF');
                    }
                },
                onHide: function(elem) {
                    if (baidu.browser.firefox) {
                        baidu.dom.removeClass(elem, 'reset_FF');
                    }
                },
                onClick: function(e) {
                    var pkgId = this.main.getAttribute("pkgid");
                    AoPkgGuide.show(pkgId);
                }
            });
        }
	};
	
	return AoPkgGuide;
}($$);