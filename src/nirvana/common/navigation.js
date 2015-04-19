/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    nirvana/navigation.js
 * desc:    涅槃导航
 * author:  wanghuijun
 * date:    $Date: 2010/12/22 $
 */

/**
 * 导航功能
 */
nirvana.navigation = {	
	/**
	 * 导航节点
	 */
	dom : {
		//logo
		logo : baidu.g('Logo'),
		
		//首页
		home : baidu.g('NavMainHome'),
		
		//账户信息
		account : baidu.g('NavMainAccount'),
		
		//财务
		finance : baidu.g('NavMainFinance'),
		
		//推广概况
		overview : baidu.g('NavMainOverview'),
		
		//推广管理
		manage : baidu.g('NavMainManage')
		
		//凤巢实验室
	//	fclab : baidu.g('NavMainLab')
	},
	
	/**
	 * 主导航设置
	 */
	_main : function() {
		var i,
		    I,
			tmp,
			url,
			me = this;
			
		for (i in me.dom) {
			tmp = me.dom[i];
			I = i.toUpperCase();
			url = NAVMAIN_URL[I];
			
			if (tmp) {
				tmp.href = url;
			}
		}
	},
	
	/**
	 * 次级导航设置
	 */
	_sub : function() {
		//用户名
		if (baidu.g('NavSubUser')) {
			baidu.g('NavSubUser').innerHTML = nirvana.env.OPT_NAME;
		}
		
		/*
        //新版帮助
        nirvana.navigation._help.init();
		
		if (baidu.g('NavSubHelpSlide')) {
			baidu.g('NavSubHelpSlide').onclick = function() {
				overview.slide.init();
				nirvana.navigation._help.hide();
				return false;
			}
		}
		
        if (baidu.g('NavSubHelpTopic')) {
            baidu.g('NavSubHelpTopic').href = HELPTOPIC_URL;
        }
        
        if (baidu.g('NavSubHelpSuggest')) {
            baidu.g('NavSubHelpSuggest').href = HELPSUGGEST_URL;
        }

        */

        if (baidu.g('NavSubNewHelp')) {
            baidu.g('NavSubNewHelp').href = HELP_URL;
        }
		
        //联系百度
        nirvana.navigation._contact.init();
		
		if (baidu.g('NavSubContactService')) {
			baidu.g('NavSubContactService').href = SERVICE_URL;
		}
        
        if (baidu.g('NavSubContactMsg')) {
            baidu.g('NavSubContactMsg').href = MESSAGE_URL;
        }
		
		//官方空间
		if (baidu.g('NavSubSpace')) {
			var link = baidu.g('NavSubSpace'),
			    span = baidu.dom.create('span', {'class' : 'number'});
			
			link.href = BLOG_URL;
			
			var spaceNewsCount = nirvana.env.SPACE_NEWS_COUNT;
			if (spaceNewsCount){
				if (spaceNewsCount > MAX_SPACE_NEWS){
					spaceNewsCount = MAX_SPACE_NEWS;
				}
				span.innerHTML = '(' + spaceNewsCount + ')';
				link.appendChild(span);
				link.title = '官方空间又有新文章啦！';
			} else {
				link.innerHTML = '官方空间';
				link.title = '官方空间';
			}
			
			var resetLink = function() {
				TimeRecord.setLastUpdateTime('userclicktimestamp' + nirvana.env.USER_ID, undefined, 'cookie');
				link.innerHTML = '官方空间';
				link.title = '官方空间';
				
				baidu.un(link, 'click', resetLink);
			};
			
			baidu.on(link, 'click', resetLink);
		}
		
		//旧版搜索推广
	/*	if (nirvana.env.AUTH.venusControl && baidu.g('NavSubFcManage')) {
			baidu.g('NavSubFcManage').href = FENGCHAO_VENUS_URL;
			baidu.removeClass(baidu.g("NavSubFcManage").parentNode, "hide");
		}
	*/	
		//退出登录
		if (baidu.g('NavSubLogout')) {
			baidu.g('NavSubLogout').href = LOGOUT_URL;
		}
		
	},

    /**
     * 控制"新版帮助"的下拉列表
     */
    /*
    _help : {
        dom : baidu.g('NavSubHelp') ? baidu.g('NavSubHelp').parentNode : '',
        
        show : function() {
            if (this.dom) {
                baidu.addClass(this.dom, 'active');
                baidu.on(document, 'click', nirvana.navigation._help.close);
            }
        },
        
        hide : function() {
            if (this.dom) {
                baidu.removeClass(this.dom, 'active');
                baidu.un(document, 'click', nirvana.navigation._help.close);
            }
        },
        
        close : function(event) {
            var target = baidu.event.getTarget(event);
            
            if (!baidu.dom.getAncestorByClass(target, 'help')) {
                nirvana.navigation._help.hide();
            }
        },
        
        toggle : function(event) {
            var target = baidu.event.getTarget(event),
                dom = target.parentNode;
            
            if (baidu.dom.hasClass(dom, 'active')) {
                nirvana.navigation._help.hide();
            } else {
                nirvana.navigation._help.show();
            }
            baidu.event.stop(event);
        },
        
        init : function() {
            var menu = baidu.g('NavSubHelp');
            
            if (menu) {
                baidu.on(menu, 'click', nirvana.navigation._help.toggle);
            }
        }
    },
    */

    /**
     * 控制"联系我们"的下拉列表
     */
    _contact : {
        dom : baidu.g('NavSubContact') ? baidu.g('NavSubContact').parentNode : '',
        
        show : function() {
            if (this.dom) {
                baidu.addClass(this.dom, 'active');
                baidu.on(document, 'click', nirvana.navigation._contact.close);
            }
        },
        
        hide : function() {
            if (this.dom) {
                baidu.removeClass(this.dom, 'active');
                baidu.un(document, 'click', nirvana.navigation._contact.close);
            }
        },
        
        close : function(event) {
            var target = baidu.event.getTarget(event);
            
            if (!baidu.dom.getAncestorByClass(target, 'contact')) {
                nirvana.navigation._contact.hide();
            }
        },
        
        toggle : function(event) {
            var target = baidu.event.getTarget(event),
                dom = target.parentNode;
            
            if (baidu.dom.hasClass(dom, 'active')) {
                nirvana.navigation._contact.hide();
            } else {
                nirvana.navigation._contact.show();
            }
            baidu.event.stop(event);
        },
        
        init : function() {
            var menu = baidu.g('NavSubContact');
            
            if (menu) {
                baidu.on(menu, 'click', nirvana.navigation._contact.toggle);
            }
        }
    },
	
	/**
	 * 清除当前选择项目
	 */
	_removeCurrent : function(){
		var current = baidu.q('current', 'NavMain', 'a')[0];
		current && (baidu.removeClass(current, 'current'));
	},
	
	/**
	 * 设置当前导航状态
	 */
	setCurrent : function() {
		var list = $$('#NavMain li a'),
			nowLink,
			nowNav = location.hash.split('/')[1];
		
		this._removeCurrent();
		
		// 删除Wrapper容器的标识，目前只有两个
		baidu.removeClass('Wrapper', 'wrap_overview');
		baidu.removeClass('Wrapper', 'wrap_manage');
		
		// 增加Wrapper容器的标识
		baidu.addClass('Wrapper', 'wrap_' + nowNav);
		
		for (var i = 0, j = list.length; i < j; i++) {
			nowLink = list[i];
			
			if (nowLink.href.indexOf(nowNav) != -1) {
				baidu.addClass(nowLink, 'current');
				
				/**
				 * 由于对总计部分有影响，先注释掉了
				if (nowNav.indexOf('manage') != -1) { // 推广管理需要随机数，这里要硬写。。
					nowLink.href = NAVMAIN_URL.MANAGE + '~_r=' + randomId;
				}
				 */
				return;
			}
		}
		
		// 强制设为推广概况页面		
		if (baidu.g('NavMainOverview')) {
			baidu.addClass('NavMainOverview', 'current');
		}
	},
	
	/**
	 * 切换导航
	 */
	change : function(event) {
		var me = this,
			event = event || window.event,
			randomId = er.random(10),
			target = baidu.event.getTarget(event);
		if (target.tagName == "a" && target.parentNode && target.parentNode.tagName == "li") {
			me._removeCurrent();
			
			baidu.addClass(target, 'current');
			
			if (target.id == 'NavMainManage') {
				target.href = NAVMAIN_URL.MANAGE + '~_r=' + randomId;
			}
			
			// 这里要清除一些在不同页面跳转时，异步请求返回导致的dom节点或者UI控件不存在的问题
			// 清除账户优化渲染进程
			nirvana.aoControl.clearRenderThread();
		}
	},
	
	_mccHide: function(){
		baidu.hide(baidu.g("NavMainAccount").parentNode);
		baidu.hide(baidu.g("NavMainFinance").parentNode);
		
		baidu.hide(baidu.g("BridgeService"));
		
		baidu.hide(baidu.g("NavSubContactService").parentNode);
	},
	
	init : function() {
		var me = this,
		    main = baidu.g('NavMain');
		
		if(nirvana.env.REPORT_LEVEL == 201){
			me._mccHide();
		}
	/*	if(!nirvana.env.FCLAB){
			baidu.hide(baidu.g("NavMainLab").parentNode);
		}*/
		if(nirvana.env.MOBILE_INTRO){
			baidu.removeClass("MobileIntro", "hide");
		}
		baidu.removeClass(baidu.g("NavMain"), "hide");
		
		me._main();
		me._sub();
		me.setCurrent();
		
		
		baidu.on(main, 'click', function(e){
			me.change(e);	
		});
	}
};