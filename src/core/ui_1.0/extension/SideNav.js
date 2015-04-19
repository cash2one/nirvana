/*
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/SideNav.js
 * desc:    左侧导航控件
 * author:  zhaolei,erik,linzhifeng
 * date:    $Date: 2010/12/22 11:30:39 $
 */

/**
 * 左侧导航控件
 * 
 * @class SideNav
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置项定义如下：
 * {
 *    id: [String], 导航控件的Id
 * }
 * </pre>
 */
ui.SideNav = function (options) {
    this.initOptions(options);
    this.type = "sidenav";
};

ui.SideNav.prototype = {
    motionStep : 20,			//动态步伐
    motionInterval : 20,		//动态间隔
	motioning : false,			//动态效果
    isHide : false,				//初始化显示
	autoHide : false,			//是否自动隐藏
	autoTimer : 0,				//自动显示/隐藏计时器
	autoInterval : 800,			//离开0.5s后自动隐藏，悬停0.5s后自动显示，改0.8s了
	planListData : {},
	unitListData : {},          //缓存单元信息，减少重绘
	accountTreeOption : {},
	accountFolderOption : {},
	curUnitid : -1,
	curPlanid : -1,
           
    /**
     * 绘制控件
     * 
     * @method render
     * @param {HTMLElement} main 控件挂载主元素 要求该元素必须有父亲元素，且父亲元素有nextSibling元素。
     *                           此外，要求该Main元素包含一堆元素,如下所示
     * @example
     *      <div class="ui_sidenav_header>
	 *	         <div id="SideNavFixed" class="ui_sidenav_fixed" data-log="{target:'fixed_sidenav_lbl'}"></div>	
	 *           <div id="SideNavAutoHide" class="ui_sidenav_autohide" data-log="{target:'autoHide_sidenav_lbl'}"></div>	
	 *	         <h3>我的账户树</h3>;
	 *      </div>
	 *      <div id="SideNavContent" class='ui_sidenav_content'></div>
	 *      <div class='ui_sidenav_foot'></div>
     */
    render: function (main) {
        if (this.main) {
            return;
        }
        
        var me = this,
            pos;

        ui.Base.render.call(me, main);
        if (!me.isRender) {
            pos = baidu.dom.getPosition(main);
            baidu.addClass(me.getNeighbor(), me.getClass('neighbor'));

            me.top = pos.top;
            me.left = pos.left;  
			
            me.renderMiniBar();
			me.miniBar = baidu.g(me.getId('MiniBar'))
			me.content = baidu.g('SideNavContent');			
			
			me.main.style.zIndex = '3';
			me.miniBar.style.zIndex = '3';
						
			me.heightReseter = me.getHeightReseter();
            me.topReseter = me.getTopReseter();
            baidu.on(window, 'resize', me.heightReseter);
            baidu.on(window, 'scroll', me.topReseter);
			
			baidu.addClass(baidu.g('SideNavFixed'), 'ui_sidenav_fixed_active');            
			baidu.g('SideNavAutoHide').onclick = function () {
	            me.autoHide = true;
				FlashStorager.set('sideNavState', true);
				baidu.dom.hide('SideNavAutoHide');
				baidu.dom.show('SideNavFixed');
				me.startAutoHide();
	        };
			baidu.g('SideNavAutoHide').onmouseover = function () {
				baidu.addClass(baidu.g('SideNavAutoHide'), 'ui_sidenav_autohide_hover');
	        };
			baidu.g('SideNavAutoHide').onmouseout = function () {
				baidu.removeClass(baidu.g('SideNavAutoHide'), 'ui_sidenav_autohide_hover');
	        };
			baidu.g('SideNavFixed').onclick = function () {
	            me.autoHide = false;
				FlashStorager.set('sideNavState', false);
				baidu.dom.hide('SideNavFixed');
				baidu.dom.show('SideNavAutoHide');
				me.stopAutoHide();
	        };	
			baidu.g('SideNavFixed').onmouseover = function () {
				baidu.addClass(baidu.g('SideNavFixed'), 'ui_sidenav_fixed_hover');
	        };
			baidu.g('SideNavFixed').onmouseout = function () {
				baidu.removeClass(baidu.g('SideNavFixed'), 'ui_sidenav_fixed_hover');
	        };
			
					
			FlashStorager.get('sideNavState', function(st){
				if ('undefined' == typeof st){
					st = false;
					FlashStorager.set('sideNavState', false);
				}
				me.autoHide = st;
				if (st){
					me.autoHideNav();
					baidu.dom.hide('SideNavAutoHide');
					baidu.dom.show('SideNavFixed');
				}else{
					baidu.dom.hide('SideNavFixed');
					baidu.dom.show('SideNavAutoHide')
				}
			})
			//导航离开自动隐藏
			me.main.onmouseout = function(event){
				if (me.autoHide && !me.motioning){
					var event = event || window.event,
						tar = event.relatedTarget || event.toElement;
					if (!baidu.dom.contains(me.main,tar)){
						me.autoHideNav();						
					}										
				}
			}  
			me.main.onmouseover = function(){		
				clearTimeout(me.autoTimer);
			} 			
			
			//风琴创建
			var accordionOptions = {
				id: "SideNavAccordion",
				type: "Accordion",
				accordions: [
		            {
						name : "<span class='ui_sidenav_icon_account'>&nbsp;</span>" + nirvana.env.USER_NAME + ' (0)',
		                id : 'AccountTree' 
		            },
		            {
						name : "<span class='ui_sidenav_icon_folder'>&nbsp;</span>" + '监控文件夹' + ' (0)',
		                id : 'FolderTree' 
		            }
		        ],
				width:100,
				onclick:function(level){
					switch (level){
						case 'AccountTree':
							var query = [];
							if(!nirvana.CURRENT_MANAGE_ACTION_NAME || nirvana.CURRENT_MANAGE_ACTION_NAME.indexOf('monitor') > -1){
								query[query.length] = '/manage/plan';
							}
							query[query.length] = '~ignoreState=1&navLevel=account';
						    er.locator.redirect(query.join(''));
							break;
						case 'FolderTree':
						    er.locator.redirect('/manage/monitorList~ignoreState=1');
							break;
					}
				}
			};
			me.accordion = ui.util.create("Accordion",accordionOptions);
			me.accordion.appendTo(me.content);
			me.accountTreeContent = baidu.g(me.accordion.getId('content_AccountTree'));
			me.folderTreeContent = baidu.g(me.accordion.getId('content_FolderTree'));
			
			me.resetTop();
            me.resetHeight(); 
			me.isRender = true;
        }
    },
	
	/**
     * 绘制缩小bar
     * 
     * @private
     */
    renderMiniBar:function () {
        var me = this,
            div = document.createElement('div');
            
        div.innerHTML = '<div class="' + me.getClass('minibar_top') + '"></div><div class="' + me.getClass('minibar_text') + '">我的账户树</div><div class="' + me.getClass('minibar_arrow') + '"></div><div class="' + me.getClass('minibar_bottom') + '"></div>';
        div.id = me.getId('MiniBar');
        div.className = me.getClass('minibar');
        div.style.left = '-10000px';
        div.style.top = me.top + 'px';
        
        div.onclick = function () {
			baidu.removeClass(me.miniBar, me.getClass('minibar_hover'));
			if (!me.motioning){
				clearTimeout(me.autoTimer);
            	me.hideMiniBar();
			}
			me.autoHide = false;
			FlashStorager.set('sideNavState', false);
			baidu.dom.hide('SideNavFixed');
			baidu.dom.show('SideNavAutoHide'); 			
        };
        div.onmouseover = function () {			
			if (!baidu.dom.hasClass(me.miniBar,me.getClass('minibar_hover'))){
				baidu.addClass(me.miniBar, me.getClass('minibar_hover'));
				me.autoTimer = setTimeout(function(){
					me.hideMiniBar();
				},me.autoInterval);									
			}
        };
        div.onmouseout = function () {
			baidu.removeClass(me.miniBar, me.getClass('minibar_hover'));
			clearTimeout(me.autoTimer);
        };
			
        document.body.appendChild(div);
    },
	
	/**
     * 重设控件高度
     * 
     * @private
     */
    resetHeight: function () {
        var me          = this,
            page        = baidu.page,
			pos 		= baidu.dom.getPosition(me.main),
            scrollTop   = page.getScrollTop(),
            height      = page.getViewHeight();

        if (height) {
            height = height - pos.top - 102 - 36 + scrollTop;
        } else {
            height = 300;
        }   
        if (height < 0){
            height = 300;
        }
		if (me.accountTreeContent.offsetHeight != height){
			me.accountTreeContent.style.height = height + 'px';
			me.folderTreeContent.style.height = height + 'px';
        	me.miniBar.style.height = height + 91 + 'px';
		}                 
    },
	
	/**
     * 获取重设控件高度的函数
     * 
     * @private
     * @return {Function}
     */
    getHeightReseter: function () {
        var me = this;
        return function () {
            me.resetHeight();
        };
    },
	
    /**
     * 重设控件位置
     * 
     * @private
     * @return {Function}
     */
    resetTop: function () {
        var me = this,
		    scrollTop = baidu.page.getScrollTop(),
            main = me.main,
            mini = me.miniBar,
            top = me.top,
            mainTop, miniTop, 
            mainPos = 'absolute',
            miniPos = 'absolute';
        
       // 2x2的判断，真恶心
        if (baidu.ie && baidu.ie < 7) {
            if (scrollTop > top - 10) {
                mainTop = miniTop = scrollTop - top + 70;
            } else {
                mainTop = miniTop = top;
				me.resetHeight();
            }
        } else {
            if (scrollTop > top - 10) {
                miniPos = mainPos = 'fixed';
                mainTop = miniTop = 10;	
            } else {
                mainTop = miniTop = top;
				me.resetHeight();
            }
        }
        main.style.top = mainTop + 'px';
        main.style.position = mainPos;
        mini.style.top = miniTop + 'px';
        mini.style.position = miniPos;
		setTimeout(function(){
			//移动过快时修补最后一次调整
			me.resetHeight();
		},200);			
    },
    
	/**
     * 获取重设控件高度的函数
     * 
     * @private
     * @return {Function}
     */
    getTopReseter: function () {
        var me = this;
        return function () {
            me.resetTop();
        };
    },
    /**
     * 显示侧边导航栏
     * @method show
     */
	show : function(){
		var me = this;
		baidu.show(me.getId('MiniBar'));
		baidu.addClass(me.getNeighbor(), me.getClass('neighbor'));
		baidu.addClass(baidu.g('Foot'), me.getClass('neighbor'));
		if(me.isHide){
			baidu.addClass(me.getNeighbor(), me.getClass('neighbor_hide'));
			baidu.addClass(baidu.g('Foot'), me.getClass('neighbor_hide'));
		}
	},
	   
	hide : function(){
		var me = this;
		baidu.removeClass(me.getNeighbor(), me.getClass('neighbor_hide'));
		baidu.removeClass(me.getNeighbor(), me.getClass('neighbor'));
		baidu.removeClass(baidu.g('Foot'), me.getClass('neighbor_hide'));
		baidu.removeClass(baidu.g('Foot'), me.getClass('neighbor'));
		baidu.hide(me.getId('MiniBar'));
	}, 
    /**
     * 显示侧边导航
     * 
     * @private
     */
    showNav: function () {
        var me = this,
            step = 0,
            endLeft = 10,
            startLeft = -220,
            minus = endLeft - startLeft,
            interval;
                
        /**
         * 完成显示侧边导航的动作
         * @inner
         */
        function finished() {
            me.main.style.left = endLeft + 'px';            
            me.motioning = false;
            me.isHide = false;
			
			if (me.autoHide){
			    me.autoHideNav();				
			}
        }
        
        me.motioning = true;        
        interval = setInterval(
            function () {
                step ++;
                
                if (step >= me.motionStep) {
                    clearInterval(interval);
                    finished();
                    return;
                }
                
                var pos = Math.floor(minus * me.easeIn(step));
                me.main.style.left = startLeft + pos + 'px';
            }, 
            me.motionInterval);  
    },
    	
    /**
     * 隐藏侧边导航
     * @private
     */
    hideNav: function () {
        var me = this,
            step = 0,
            endLeft = -220,
            startLeft = 10,
            minus = endLeft - startLeft,
            interval;
            
        me.motioning = true;
        
        /**
         * 完成隐藏侧边导航的动作
         * @inner
         */
        function finished() {
            me.main.style.left = endLeft + 'px';
            baidu.addClass(me.getNeighbor(), me.getClass('neighbor_hide'));
			baidu.addClass(baidu.g('Foot'), me.getClass('neighbor_hide'));
            me.motioning = false;
            me.isHide = true;
            me.showMiniBar();
			me.repaintNeighbor();
        };
        
        
        interval = setInterval(
            function () {
                step ++;
                
                if (step >= me.motionStep) {                    
                    clearInterval(interval);
					finished();
                    return;
                }
                
                var pos = Math.floor(minus * me.easeIn(step));
                me.main.style.left = startLeft + pos + 'px';
            }, 
            me.motionInterval);        
    },    
    
	autoHideNav : function(){
		var me = this;
		clearTimeout(me.autoTimer);
		me.autoTimer = setTimeout(function(){
			var mPos = baidu.page.getMousePosition(),
			    navPos = baidu.dom.getPosition(me.main);
			if (mPos.x > navPos.left + me.main.offsetWidth || mPos.y < navPos.top || mPos.y > navPos.top + me.main.offsetHight) {
				me.hideNav();
			}			
		},me.autoInterval);
	},
	
	/**
     * 显示缩小的bar
     * 
     * @private
     */
    showMiniBar: function () {
        var me = this,
            step = 0,
            endLeft = 0,
            startLeft = -30,
            minus = endLeft - startLeft,
            interval;
        
        /**
         * 完成显示minibar的动作
         * 
         * @inner
         */
        function finished() {
            me.miniBar.style.left = endLeft + 'px';
            me.motioning = false;
        }
        
        me.motioning = true;
        interval = setInterval(
            function () {
                step ++;
                
                if (step >= me.motionStep) {
                    clearInterval(interval);
                    finished();
                    return;
                }
                
                var pos = Math.floor(minus * me.easeIn(step));
                me.miniBar.style.left = startLeft + pos + 'px';
            }, 
            me.motionInterval);
        
    },
    
    /**
     * 隐藏缩小的bar
     * 
     * @private
     * @param {Function} onComplete 完成的回调函数
     */
    hideMiniBar: function () {
        var me = this,
            step = 0,
            endLeft = -30,
            startLeft = 0,
            minus = endLeft - startLeft,
            interval;  
        
        me.motioning = true;
        
        /**
         * 完成隐藏minibar的动作
         * @inner
         */
        function finished() {
            me.miniBar.style.left = endLeft + 'px';
			baidu.removeClass(me.getNeighbor(), me.getClass('neighbor_hide')); 
			baidu.removeClass(baidu.g('Foot'), me.getClass('neighbor_hide'));        
            me.motioning = false;
            me.showNav();
			me.repaintNeighbor();
        }
        
        interval = setInterval(
            function () {
                step ++;
                
                if (step >= me.motionStep) {
                    clearInterval(interval);
                    finished();
                    return;
                }
                
                var pos = Math.floor(minus * me.easeIn(step));
                me.miniBar.style.left = startLeft + pos + 'px';
            }, 
            me.motionInterval);       
    },
	
	startAutoHide : function(){
		var me = this;
		
	},
	
	stopAutoHide : function(){
		var me = this;
		clearTimeout(me.autoHideTimer);
	},
    /**
     * 重绘邻居元素
     * 
     * @private
     * @desc 重绘内部的控件
     */
    repaintNeighbor: function () {
        var ctrlMap = ui.util.getControlMapByContainer(this.getNeighbor()),
            ctrl,
            key;
            
        for (key in ctrlMap) {
            ctrl = ctrlMap[key];
			if (!ctrl){
				continue;
			}
            if (ctrl.refreshView) {
                ctrl.refreshView();
            } else {
                ctrl.render();
            }
        }
    },
    
    /**
     * 获取邻居元素
     * 
     * @private
     * @return {HTMLElement}
     */
    getNeighbor: function () {
        return baidu.dom.next(this.main.parentNode);
    },
    
    /**
     * 释放控件
     * 
     * @method dispose
     * @private
     */
    dispose: function () {
        var me = this,
            miniBar = me.miniBar;
            
        baidu.un(window, 'resize' ,me.heightReseter);
        baidu.un(window, 'scroll', me.topReseter);
        
        document.body.removeChild(miniBar);        
        ui.Base.dispose.call(me);
    },

	/**
     * 动画函数
     * 
     * @param {number} step 步数
     * @return {number} 完成百分比
     */
    easeIn : function(step) {
        return Math.pow(step/this.motionStep, 2);
    },
	
	/**
	 * 树构建适配器
	 */
	_treeBuildAdapter : {
		getChildren : function(data){
	        return data.children || [];
	    },
	    getItemHtml: function(data){        
	        return data.name;        
	    },
	    getItemId: function (data) {
	        return data.id;
	    },
		onexpand : function(data){
		    //console.log('onexpand')
		    var me = ui.util.get('SideNav');
			me.refreshUnitList([data.value.slice(1)],function(){
				var pid = data.value.slice(1),
				    planNode = baidu.g('branchNode_p' + pid);
				//展开当前计划
				setTimeout(function(){
					me.accountTree.expand(planNode,false);
				},100)
				
				if(me.curUnitid > 0){
                    //选中当前单元
                    setTimeout(function(){
                        var unitNode = baidu.g('leafNode_u' + me.curUnitid);
                        me.accountTree.selectNode(unitNode);
                    },200)
                }else if(me.curPlanid > 0){
                    //选中当前计划
                    setTimeout(function(){
                        var planNode = baidu.g('branchNode_p' + me.curPlanid);
                        me.accountTree.selectNode(planNode);
                    },200)
                }
			});
		},
	    onclick: function (data) {
				
	    }
	},
	
	/**
	 * 状态Icon
	 * @param {Object} planOrUnit
	 * @param {Object} st
	 */
	_statusIcon : function(planOrUnit, st){
		if ((st + '') == '0'){
			return ''
		}else{
			return "<b class='ui_sidenav_status_wrap'><span class='ui_sidenav_" + planOrUnit + '_status_' + st + "'>&nbsp;</span></b>"	
		}
	},
	
	/**
	 * 下级个数
	 * @param {Object} 
	 * level标识层级，user,plan或unit
	 * countMtl下层物料数目
	 * countIdea单元包含的创意数目
	 */
	_statusCount : function(level,countMtl,countIdea){
		switch(level)
		{
		case 'plan':
			if(countMtl > 0){
				return '';
			}else{
				return ' <b class="mtl_empty_remind ui_title" rel="单元为空">0</b>';
			}
			break;
		case 'unit':
			if (countMtl == 0 && countIdea == 0){
				return ' <b class="mtl_empty_remind ui_title" rel="关键词为空<br>创意为空">0</b>';
			}else if(countMtl == 0 && countIdea > 0){
				return ' <b class="mtl_empty_remind ui_title" rel="关键词为空">0</b>';
			}else if(countMtl > 0 && countIdea == 0){
				return ' <b class="mtl_empty_remind ui_title" rel="创意为空">0</b>';
			}else{
				return '';
			}
			break;

		}
	},
	
	/**
	 * 自动截断
	 * @param {Object} name
	 */
	_formatName : function(name){
		return "<span class='ui_sidenav_mtl_name' title = '" + baidu.string.encodeHTML(name).replace(/'/g, "&#39;") + "'>" + baidu.encodeHTML(name) + '</span>';
	},
	
	/**
	 * 初始化账户树
	 * 
	 * @method initAccountTree
	 * @param {Object} option 树初始化配置
	 *     option.onclick = 选择账户树触发的回调函数 handler
	 *     handler(data)，其中回调时传入对象data.value = 'p'/'u'/'n' + id 代表：计划，单元，新建单元
	 * @author linzhifeng@baidu.com
	 */
	initAccountTree : function(option){		
		var me =this;
		
		//账户树创建
		if (me.accountTree){
			return;
		}
		option = option || {};
		me.accountTreeOption = option;
		
		var treeOptions = {
			id: "SideNavAccountTree",
			type: "TreeView",
			data: [],
			getChildren : option.getChildren ||me._treeBuildAdapter.getChildren,
			getItemHtml : option.getItemHtml || me._treeBuildAdapter.getItemHtml,
			onexpand : option.onexpand || me._treeBuildAdapter.onexpand,
			onclick : option.onclick || me._treeBuildAdapter.onclick,
			getItemId : option.getItemId || me._treeBuildAdapter.getItemId,
			skin : 'folder',
			indentStep : 18,
			initIndent : 7,
			width : 90,
			selectNode : function (node) {
				var here = this;
				//console.log(node);
				if (node) {
				  here.lowlightLine();
					var t = node.getElementsByTagName('span')[0];
					if (t) {
						here.selectedSpan = t;
						here.selectedLine = node;
						here.highlightLine();
					}
				me.autoView();
				}
			}
		};
		me.accountTree = ui.util.create("TreeView",treeOptions);		
		me.accountTree.appendTo(me.accountTreeContent);
		me.refreshPlanList();
	},
	
	/**
	 * 初始化账户树
	 * 
	 * @method initFolderTree
	 * @param {Object} option 账户树的配置选项
	 */
	initFolderTree : function(option){		
		var me =this;
		
		//账户树监控文件夹创建
		if (me.folderTree){
			return;
		}
		var option = option || {};
		me.accountFolderOption = option;
		
		var folderOptions = {
			id:'SideNavFolderTree',
			type:"TreeView",
			data:[],
			getItemHtml: option.getItemHtml,
			getItemId:option.getItemId,
			getChildren:option.getChildren,
			skin : 'folder',
			onclick: option.onclick,
			initIndent : 7,
			width : 90/*,监控文件夹账户树自动定位。目前不需要 囧 -- by liuyutong
			selectNode : function (node) {
				var here = this;
				//console.log(node);
				if (node) {
				  here.lowlightLine();
					var t = node.getElementsByTagName('span')[0];
					if (t) {
						here.selectedSpan = t;
						here.selectedLine = node;
						here.highlightLine();
					}
				me.autoView();
				}
			}*/
		};
		me.folderTree = ui.util.create("TreeView",folderOptions);		
		me.folderTree.appendTo(me.folderTreeContent);  
		me.refreshFolderList();
	},


	
	/**
	 * 刷新全账户计划列表
	 * @method refreshPlanList
	 * @author linzhifeng@baidu.com
	 */
	refreshPlanList : function(){
		var me =this,
		    option = me.accountTreeOption;
		//console.log('refreshPlanList')
		fbs.sidenav.getPlanList({
			callback : function(res){
                if(res.status == 200) {
    		    	//console.log(baidu.json.stringify(res.data));
    				var treeData = [],
    				    data = res.data,
    				    lastCopy = {};
    				for (var i = 0, len = data.length; i < len; i++){
    				    lastCopy[data[i].mtlId + ''] = me.planListData[data[i].mtlId + ''];
    					me.planListData[data[i].mtlId + ''] = data[i]; 
    				    treeData[i] = {
    						name : me._statusIcon('plan',data[i].mtlStat) + me._formatName(data[i].mtlName) + me._statusCount('plan',data[i].subMtlCount),
    						id : 'p' + data[i].mtlId,
    						children : [{
    							name : '<span class="text_blue hide">新建单元</span>',
    							id : 'n' + data[i].mtlId + '_newunit'
    						}]
    					};
    				}
    				if (data.length > 0){
    					me.accordion.setHeadText("<span class='ui_sidenav_icon_account' data-log='{target:\"acctNameIcon_sidenav_btn\"}'>&nbsp;</span><span data-log='{target:\"acctNameHead_sidenav_lbl\"}'>" + nirvana.env.USER_NAME + ' (' + data.length + ')</span>',0);
    				}else{
    					me.accordion.setHeadText("<span class='ui_sidenav_icon_account' data-log='{target:\"acctNameIcon_sidenav_btn\"}'>&nbsp;</span><span data-log='{target:\"acctNameHead_sidenav_lbl\"}'>" + nirvana.env.USER_NAME + ' <b class="mtl_empty_remind ui_title" rel="推广计划为空">0</b></span>',0);
    				}
    				if (baidu.json.stringify(lastCopy) != baidu.json.stringify(me.planListData)){
    				    //js比dom快，有变化才重绘了~~~ by linzhifeng@baidu.com
    				    me.accountTree.repaint(treeData);
    				}				
    				/*  delete by linzhifeng@baidu.com
    				if(me.folderTree){
    					me.refreshFolderList();
    				}
    				*/
    				if(me.curPlanid > 0){
    					me.refreshUnitList([me.curPlanid],function(){
    						var planNode = baidu.g('branchNode_p' + me.curPlanid);
    						//展开当前计划
    						setTimeout(function(){
    							me.accountTree.expand(planNode,false);
    						},100)
    						
    						if(me.curUnitid > 0){
    							//选中当前单元
    							setTimeout(function(){
    								var unitNode = baidu.g('leafNode_u' + me.curUnitid);
    								me.accountTree.selectNode(unitNode);
    							},200)
                            }else{
    							//选中当前计划
    							setTimeout(function(){
    								me.accountTree.selectNode(planNode);
    							},200)
    						}
    					});
                    }else{
    					//刷新unitid
    					//me.refreshUnitList([data[0].mtlId]);
    				}
    				ui.Title.init();
                }
                else {
                    ajaxFailDialog();
                    ui.Title.init();
                }
		   }
		})		
	},
	
	/**
	 * 刷新监控文件夹列表
	 * 
	 * @method refreshFolderList
	 */
	refreshFolderList: function(){
		var me = this;
		//console.log('refreshFolderList')
		fbs.avatar.getMoniFolders({
			fields:["folderid","foldername","moniwordcount"],
			callback: function(res){
				var data = res.data.listData || [],
					treeData = [];
				for (var i = 0, len = data.length; i < len; i++){
					treeData[i] = {
						name : me._formatName(data[i].foldername),
						id : 'a' + data[i].folderid,
						count: data[i].moniwordcount,
						children: []
					};
				}
				if (data.length > 0){
					me.accordion.setHeadText("<span class='ui_sidenav_icon_folder' data-log='{target:\"foldIcon_sidenav_btn\"}'>&nbsp;</span><span data-log='{target:\"foldHead_sidenav_lbl\"}'>监控文件夹(" + data.length + ')</span>',1);
				}else{
					me.accordion.setHeadText("<span class='ui_sidenav_icon_folder' data-log='{target:\"foldIcon_sidenav_btn\"}'>&nbsp;</span><span data-log='{target:\"foldHead_sidenav_lbl\"}'>监控文件夹<b class='mtl_empty_remind ui_title' rel='监控文件夹为空'>0</b></span>",1);
					}	
				me.folderTree.repaint(treeData);
				ui.Title.init();	//初始化Title组件
			}
		});
	},
	
	/**
	 * 刷新指定计划的单元列表，支持多个计划
	 * 
	 * @method refreshUnitList
	 * @param {Array} planIdList 计划id的列表
	 * @param {Function} callback 可选的回调函数
	 * @author linzhifeng@baidu.com
	 */
	refreshUnitList : function(planIdList, callback){
		var me = this;
		//console.log('refreshUnitList',planIdList)
		for (var i = 0, l = planIdList.length; i < l; i++){
			fbs.sidenav.getUnitList({
			    condition : {
			      planid : planIdList[i]
			    },
				
			    callback : function(){
					var pid = planIdList[i];
					return function(res){
			       	//console.log(baidu.json.stringify(res.data));   
					   	var treeData,
						    data = res.data,
							treeChildren,j,len,lastCopy;
						treeChildren = [{
							name : '<span class="text_blue hide">新建单元</span>',
							id : 'n' + pid + '_newunit'
						}];
						lastCopy = me.unitListData[pid];
						me.unitListData[pid] = {};
						for (j = 0, len = data.length; j < len; j++){
						    me.unitListData[pid][data[j].mtlId] = data[j];
							treeChildren[j] = {
								name : me._statusIcon('unit',data[j].mtlStat) + me._formatName(data[j].mtlName) + me._statusCount('unit',data[j].subMtlCount,data[j].subIdeaCount),
								id : 'u' + data[j].mtlId
							}
						}
					    treeData = {
							id : 'p' + pid,
							name : me._statusIcon('plan',me.planListData[pid].mtlStat) + me._formatName(me.planListData[pid].mtlName) + me._statusCount('plan',len),
							children : treeChildren
						}
						
						if (baidu.json.stringify(lastCopy) != baidu.json.stringify(me.unitListData[pid])){
						    //js比dom快，有变化才重绘了~~~ by linzhifeng@baidu.com
                            me.accountTree.repaintChildren(treeData); //刷新子节点
                        }
						
						me.refreshNodeInfo('plan',[pid]);         //计划自身也需要刷新
						
						if (callback){
							callback();
						}
						
                        if(baidu.g('leafNode_n' + pid + '_newunit')){
                            baidu.hide('childrenNode_p' + pid);
                        }
                        ui.Title.init();	//初始化Title组件
				   	}
				   	
				}()
			})	
		}
		
	},
	
	/**
	 * 刷新节点信息，支持多个节点
	 * 
	 * @method refreshNodeInfo
	 * @param {String} level 所属层级，有效值：account/plan/unit
	 * @param {Array} idList id列表
	 * @author linzhifeng@baidu.com
	 */
	refreshNodeInfo : function(level, idList){
		var me = this;
		//console.log('refreshNodeInfo',level,idList)
		switch (level){
			case 'account':
			    fbs.sidenav.getNodeInfo({
					callback : function(res){
						//console.log(baidu.json.stringify(res.data));
						if (res.status == 200){
							var data = res.data;
							if (data.plancount > 0){
								me.accordion.setHeadText(nirvana.env.USER_NAME + ' (' + data.subMtlCount + ')',0);
							}else{
								me.accordion.setHeadText(nirvana.env.USER_NAME + ' <b class="mtl_empty_remind ui_title" rel="计划为空">0</b>',0);
							}	
						}	
						ui.Title.init();					
					}
				})
				break;
			case 'plan':
			    for(var i = 0, len = idList.length; i < len; i++){
					fbs.sidenav.getNodeInfo({
						condition: {
							planid: idList[i]
						},
						callback : function(res){
							//console.log(baidu.json.stringify(res.data));   
				   			if (res.status == 200){
								var treeData,
							    	data = res.data;
							    if (me.planListData[data.mtlId]){
							        me.planListData[data.mtlId].mtlStat = data.mtlStat;
                                    me.planListData[data.mtlId].mtlName = data.mtlName;
							    }
							    treeData = {
									id : 'p' + data.mtlId,
									name : me._statusIcon('plan',data.mtlStat) + me._formatName(data.mtlName) + me._statusCount('plan',data.subMtlCount)
								}
								me.accountTree.repainNode(treeData, true);
							}
						   	ui.Title.init();
						}
					})	
				}			    
				break;
			case 'unit':
				for(var i = 0, len = idList.length; i < len; i++){
					fbs.sidenav.getNodeInfo({
						condition: {
							unitid: idList[i]
						},
						callback : function(res){
							//console.log(baidu.json.stringify(res.data));   
					   		if (res.status == 200){
								var treeData,
								    data = res.data;
								treeData = {
									id : 'u' + data.mtlId,
									name : me._statusIcon('unit',data.mtlStat) + me._formatName(data.mtlName) + me._statusCount('unit',data.subMtlCount,data.subIdeaCount)
								}
								me.accountTree.repainNode(treeData);
							}
							ui.Title.init();
						}
					})
				}			    
				break;
			case 'folder':
    			fbs.avatar.getMoniFolders.clearCache();
                fbs.avatar.getMoniFolders({
                    fields:["folderid","foldername","moniwordcount"],
                    folderid : idList,
                    callback: function(res){
                        if (res.status == 200){
                             var data = res.data.listData || [],
                                treeData = [];
                            for (var i = 0, len = data.length; i < len; i++){
                                me.folderTree.repainNode({
                                    name : me._formatName(data[i].foldername),
                                    id : 'a' + data[i].folderid,
                                    count: data[i].moniwordcount,
                                    children: []
                                });
                            }
                        }
                        ui.Title.init();
                    }
                });
                break;
		}
	},
	
	restore : function(){
		var me = this;
		//console.log('restore',me.curPlanid)
		//return;
		if(me.curPlanid > 0){
		    var planNode = baidu.g('branchNode_p' + me.curPlanid);
            //展开当前计划
            if (planNode){
                me.accountTree.expand(planNode,true);
            }
            /*
			me.refreshUnitList([me.curPlanid],function(){
				var planNode = baidu.g('branchNode_p' + me.curPlanid);
				//展开当前计划
				setTimeout(function(){
					me.accountTree.expand(planNode,false);
				},100)
				
				if(me.curUnitid > 0){
					//选中当前单元
					setTimeout(function(){
						var unitNode = baidu.g('leafNode_u' + me.curUnitid);
						me.accountTree.selectNode(unitNode);
					},200)
                }else{
					//选中当前计划
					setTimeout(function(){
						me.accountTree.selectNode(planNode);
					},200)
				}
			});
			*/
        }
	},
	//自动定位到可见区域 by liuyutong@baidu.com
	autoView : function(){
			var me = this , 
				sideNavSelected = baidu.q('ui_treeview_selected',me.main)[0],
				sideNavTop,
				sideNavContent = baidu.g('ctrlaccordionSideNavAccordioncontent_AccountTree'),
				sideNavContentTop;
			if(sideNavSelected){
				sideNavTop = baidu.dom.getPosition(sideNavSelected).top;
				sideNavContentTop = baidu.dom.getPosition(me.content.getElementsByTagName('table')[0]).top;
				sideNavContent.scrollTop = sideNavTop - sideNavContentTop - 5;
				//console.log(sideNavTop,sideNavContentTop,sideNavContent.scrollTop)
			}
			
	}
};

ui.Base.derive(ui.SideNav);
