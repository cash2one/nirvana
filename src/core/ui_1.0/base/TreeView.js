/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/TreeView.js
 * desc:    树结构显示控件
 * author:  chenjincai
 * date:    $Date: 2010/12/09 $
 */
/**
 * 树状控件
 * 
 * 支持Themes：不同样式的树结构
 * 父级节点状态：collapsed expanded
 * 
 * @class TreeView
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 配置的参数定义如下：
 * {
 *     id:          [String],   [REQUIRED] 树控件的ID
 *     initIndent:  [Number],   [OPTIONAL] 初始缩进的值，默认为0，单位为px
 *     indentStep:  [Number],   [OPTIONAL] 节点缩进步长，默认值12
 *     width:       [Number],   [REQUIRED] 树控件的宽度
 *     data:        [Array],    [REQUIRED] 树控件绑定的数据源
 *     getChildren: [Function], [REQUIRED] 自定义给定的节点数据的孩子节点数据，该函数的payload为data，
 *                                         要求返回孩子节点数据的数组,没有孩子节点，<b>必须返回空数组</b>
 *     onclick:     [Function], [OPTIONAL] 点击节点触发的事件，未定义该事件节点无法被选择
 *     onexpand:    [Function], [OPTIONAL] 展开节点后触发的事件
 *     getItemHtml: [Function], [REQUIRED] 定义给定的节点数据的节点的渲染HTML串，该函数的payload为data，
 *                                         要求返回HTML的字符串 
 *     getItemId:   [Function], [OPTIONAL] 定义节点ID生成方法，其值用来为节点绑定value属性，默认随机生成节点ID
 * }
 * </pre>
 */
ui.TreeView = function (options) {
    // 初始化参数
    this.initOptions(options);
    
    // 类型声明，用于生成控件子dom的id和class
    this.type = 'treeview';
    //以下尺寸单位均为px
    this.initIndent= this.initIndent || 0;        		//初始缩进值
    this.indentStep = parseInt(this.indentStep) || 12;  //缩进步长
    this.width = this.width || 400;             		//TreeView显示区宽度
    this.collapsedStyle = this.getClass('collapsed');
    this.expandedStyle = this.getClass('expanded');
    this.containerId = this.getId();
    this.async = true;
};

ui.TreeView.prototype = {
	/**
     * 将未渲染的TreeView控件渲染到指定的DOM元素里
     * @method appendTo
     * @param {HTMLElement} container 渲染的控件添加到的目标DOM元素
     */
	appendTo: function (container) {
        var main = document.createElement('div');
        container.appendChild(main);
        this.render(main);
    },   
	
    /**
     * 渲染控件
     *
     * @protected
     * @method render
     * @param {Object} main 控件挂载的DOM
     */ 
    render: function (main) {
        var me = this;
        
        if(!me.isRendered) {
            ui.Base.render.call(me, main);
            me.main.innerHTML = me.getMainHtml();
            me.isRendered = true;
            me.bindEvent();
        }
    },
	
	/**
	 * 重绘控件
	 * @method repaint
	 * @param {Object} data
	 * @author linzhifeng@baidu.com
	 */
	repaint : function(data){
		var me = this;
		data = data || me.data;
		me.data =  data;
        me.main.innerHTML = me.getMainHtml();
	},
	
    getMainHtml: function () {
        var me = this,
            data = me.data,
            len = data.length, i,
            htmlArr = [],
            startTreeView = er.template.get('startTreeView'),
            endTreeView = er.template.get('endTreeView'),
            initPaddingLeft = me.initPaddingLeft;
            
        htmlArr.push(startTreeView); 
        htmlArr.push(me.renderChildren(data, me.initIndent, true, true)); 
        htmlArr.push(endTreeView); 
        return htmlArr.join('');
    },

    renderChildren: function (children, paddingLeft, hideChildren, isRoot) {
        var me = this,
            htmlArr = [];
        for (var i = 0, len = children.length; i < len; i++){
            //处理只展开第一项的问题
         //   if(isRoot && i > 0){
          //      hideChildren = true;
         //   }
            htmlArr.push(me.renderNode(children[i], paddingLeft, hideChildren));
        }
        return htmlArr.join('');

    },
	
	/**
	 * 重绘节点及其子树
	 * @param {Object} dataItem
	 */	
    repaintChildren: function (dataItem) {
		//modify by linfeng 20110106
        var me = this,
            itemId = me.getItemId(dataItem),
			itemHtml = me.getItemHtml(dataItem),
            children = me.getChildren(dataItem),
            childrenWrapperTpl = er.template.get('childrenContent'),
            branchTdEl = baidu.g('branchNode_' + itemId).getElementsByTagName('td')[0],
            childrenTdEl = baidu.g('childrenNode_' + itemId).getElementsByTagName('td')[0],
            paddingLeft = parseInt(branchTdEl.style.paddingLeft) + me.indentStep;
        
        if (itemHtml && branchTdEl){
			branchTdEl.getElementsByTagName('span')[0].innerHTML = itemHtml; 
		}
		
		
		if (children && childrenTdEl){
            childrenTdEl.innerHTML = ui.format(childrenWrapperTpl,
                me.renderChildren(children, paddingLeft, false, false)
            );
		}         
    },

    renderNode: function (dataItem, paddingLeft, hideChildren) {
        var me = this,
            children = me.getChildren(dataItem),
            itemId = me.getItemId(dataItem),
            linePaddingLeft = paddingLeft,
            childrenPaddingLeft = paddingLeft + me.indentStep,
            lineWidth = me.width - linePaddingLeft - me.indentStep,
            folderType = hideChildren ? 'collapsed' : 'expanded',
            display = hideChildren ? 'style="display:none";' : '',
            leafNodeTpl = er.template.get('leafNodeTreeView'),
            branchNodeTpl = er.template.get('branchNodeTreeView');
        
        if(children.length > 0){
            return ui.format(
                branchNodeTpl,
                me.getDimension(linePaddingLeft),
                '100%',//me.getDimension(lineWidth),
                me.getClass(folderType),
                me.getItemHtml(dataItem),
                me.renderChildren(children, childrenPaddingLeft, hideChildren),
                me.getClass('hitarea'),
                display,
                itemId,
				itemId
            );
        }else{
            return ui.format(
                leafNodeTpl,
                me.getDimension(linePaddingLeft),
                '100%',//me.getDimension(lineWidth),
                me.getItemHtml(dataItem),
				itemId,
				itemId
            );
        }
    },
	
	/**
	 * 重绘节点本身
	 * @param {Object} dataItem
	 * @param {Object} isBranch
	 */
	repainNode : function(dataItem, isBranch){
		var me = this, 
            itemId = me.getItemId(dataItem),
			itemHtml = me.getItemHtml(dataItem),
            nodeTdEl = baidu.g((isBranch ? 'branchNode_' : 'leafNode_') + itemId);
        
        if (itemHtml){
            nodeTdEl = nodeTdEl.getElementsByTagName('td')[0];
            if (nodeTdEl){
			nodeTdEl.getElementsByTagName('span')[0].innerHTML = itemHtml; 
		}
		}
	},
		
    /**
     * 获取每一条节点的子节点数据, 如果没有, 返回空数组
     *
     *
     */
    getChildren: new Function(),
    /**
     * 获取每一条显示的HTML
     */
    getItemHtml: new Function(),
    /**
     * 生成节点ID
     * @method getItemId
     * @private
     * @return {String|Number} 
     */
    getItemId: function (data) {
        return Math.round(Math.random() * 100000000);
    },

    /**
     * 获取在CSS中显示的尺寸字符串
     */
    getDimension: function (size) {
        return size + 'px';
    },

    /**
     * 私有方法，绑定事件
     * @private
     */
    bindEvent: function() {
        var me = this;
        baidu.on(me.main, 'click', me.clickHandler(me));
    
        if (me.mouseOverHandler) {
            baidu.on(me.main, 'mouseover', me.mouseOverHandler(me));
        }
        if (me.mouseOutHandler) {
            baidu.on(me.main, 'mouseout', me.mouseOutHandler(me));
        }
    },
	
    /**
     * 私有方法，点击整个treepanel时的事件处理
     * @param {Object} _this
     */
    clickHandler : function(me) {
        return function() {
            var e = window.event || arguments[0],
			    n = e.srcElement || e.target,
				isAccoutnTree = me.id.indexOf("AccountTree") > -1,
				isFolderTree = me.id.indexOf("FolderTree") > -1;
            
            // 如果点击的是前面的折叠展开DOM，则做折叠展开
            if (n.tagName == "A" && baidu.dom.hasClass(n,me.getClass('hitarea'))) {
                me.toggle(n);
				/*material专门针对账户树
				if (isOpen == 1 && (isAccoutnTree || isFolderTree)) 
				{
					me.expand(n.parentNode.getElementsByTagName('span')[0]);
				}
				*/
                return;
            }
			
			//material专门针对账户树
			if (n.parentNode.className == "ui_sidenav_status_wrap" && (isAccoutnTree || isFolderTree)){
				var tarSpan = n.parentNode.parentNode;
				me.toggle(tarSpan);
				/*
				if (isOpen == 1){
					me.expand(tarSpan);
				}
				*/
				return;
			}
    
            // 如果点击的是文本，则展开该节点（判断是否能展开在具体的展开方法中）
            // 并调用传递的textClickFn
            while (n && n.tagName != "TR" && n.id != me.containerId) {
                n = n.parentNode;
            }
            if (n && n.tagName == "TR" && n.id != me.main.id && n.nodeType != "children" && me.onclick) {
                var t = n.getElementsByTagName('span')[0],
					logParams = {};
                if(me.selectedSpan && me.selectedSpan.tagName && me.selectedSpan.tagName.toLowerCase() == "span") {
                    me.lowlightLine();
                    
                }
                me.selectedSpan = t;
                me.selectedLine = n;
                me.highlightLine();
                
				logParams.target = me.id + baidu.dom.getAttr(t,'value') + "_" + me.type + "_lbl";
				if (me.getNodeType(t) && me.getNodeType(t) == "branchNode") {
					logParams.nodeType = "branch";
				}else{
					logParams.nodeType = "leaf";
				}
				
				//material专门针对账户树
				if (me.id.indexOf("AccountTree") > -1) {
					if (logParams.nodeType == "branch") {
						logParams.material = "plan";
					}
					else if (logParams.nodeType == "leaf") {
						logParams.material = "unit";
					}
				}
				else if (me.id.indexOf("FolderTree") > -1) {
					logParams.material = "folder";
				}
				NIRVANA_LOG.send(logParams);
                
				/**
				 * 点击节点触发的事件，不包括点击节点左边的图标
				 * @event onclick
				 * @param {Object} data 点击节点数据对象
				 * 数据结构定义如下：
				 * {
				 *   node:  [HTMLElement], 触发点击的节点
				 *   value: [String],      节点绑定的数据值, 可以通过重写getItemId方法来为节点绑定数据
				 *   ev:     [Object],      事件对象
				 * } 
			     * @return {Boolean} 如果要阻止默认的展开节点的行为，返回true，否则对于非叶子节点还会触发展开行为
				 */
                //运行使用方通过onclick return true阻止默认的展开行为
                me.onclick({
                    target: t,
					value : baidu.dom.getAttr(t,'value'),
                    ev: e
                }) ? '' : me.expand(t);
            }
    
        }
    },
    /**
     * 高亮一行
     */
    highlightLine : function () {
        var me = this;
        if (me.selectedSpan && me.selectedLine) {
            baidu.addClass(me.selectedSpan, me.getClass('selected'));
			var node = $$('#' + me.selectedLine.id + ' td')[0];
			
			if (node) {
				baidu.addClass(node, me.getClass('line_selected'));
			}
        }
    },
    /**
     * 取消高亮 lowlight 觉得这个词不太适合，但从low-high上讲还OK，凑合了。。
     */
    lowlightLine : function () {
        var me = this;
        if (me.selectedSpan && me.selectedLine) {
            baidu.removeClass(me.selectedSpan, me.getClass('selected'));
			var node = $$('#' + me.selectedLine.id + ' td')[0];
			
			if (node) {
				baidu.removeClass(node, me.getClass('line_selected'));
				baidu.removeClass(node, me.getClass('lineover')); // 强制删除，有可能遮罩时无法触发out handler
			}
        }
    },
    
    
    
    /**
     * 选中节点
     * @method selectNode
     * @param {HTMLElement} node 所要选中的节点
     */
    selectNode : function (node) {
        var me = this;
        
        if (node) {
          me.lowlightLine();
			var t = node.getElementsByTagName('span')[0];
			if (t) {
				
				me.selectedSpan = t;
				me.selectedLine = node;
				me.highlightLine();
			}
		}
    },

    /**
     * 私有方法，获取某个节点所属的行的DOM
     * @param {HTML Object} element
     * @return {HTML Object || Boolean}
     */
    getTrDom: function(element) {
        var me = this;
        var n = element;
        while (n && n.tagName != "TR" && n.id != me.containerId) {
            n = n.parentNode
        }
        if (n && n.tagName == "TR") {
            return n;
        } else {
            return false;
        }
    },
    /**
     * 获取父级元素DOM
     */
    getParentTrDom : function (element) {
        var n = element;
        while (n.tagName != "TR" && n.nodetype != 'children') {
            n = n.parentNode
        }
        
        if (n.tagName == "TR"  && n.nodetype == 'children') {
            return n;
        } else {
            return false;
        }
    },
    /**
     * 私有方法，获取某个节点的子节点行DOM
     * @param {HTML Object} element
     * @return {HTML Object}
     */
    getChildrenTrDom: function(element) {
        var me = this;
        var tr = me.getTrDom(element);
        tr = tr.nextSibling;
        while (tr && tr.tagName != "TR") {
            tr = tr.nextSibling;
        }
        return tr;
    },

    /**
     * 私有方法，获取某个节点的属性
     * @param {HTML Object} element
     * @return {String || Boolean} 值有leafNode, nonleafNode, children
     */
    getNodeType: function(element) {
        var me = this;
        var tr = me.getTrDom(element);
        if (tr) {
            return tr.getAttribute("nodeType");
        } else {
            return false;
        }
    },

    /**
     * 折叠展开操作
     * @param {HTML Object} element
     */
    toggle: function(element) {
        // 只有非叶子节点才继续操作
        var me = this;
        if (me.getNodeType(element) && me.getNodeType(element) == "branchNode") {
            var tr = me.getTrDom(element);
            var expState = tr.getElementsByTagName("td")[0].className.indexOf(me.expandedStyle) != -1;
            if (expState) {
                me.collapse(element);
				//关闭返回-1
				return -1;
            } else {
                me.expand(element);
				//打开返回1；
				return 1;
            }
        }
    },
    test : function () {
        var me = this;
        var data = me.data[1];
        data.children[1].name = "test repaint children";
        me.repaintChildren(data, false);
    },
	
	/**
	 * 临时解决方案，解决问题描述：
	 * 当计划下没有单元时，点击计划，会出现一行空白再收起来
	 * （看看能不能把“新建单元”这个节点删掉，貌似牵连挺大）
	 * @param {Object} element
	 */
	hasNoChild : function(element){
		var spanSet = $$.find("span",element).set,
			value = "";
		if(spanSet.length > 1){
			value = baidu.getAttr(spanSet[0],"value");
			if(value.indexOf("_newunit") != -1){
				return true;
			}
		}
		return false;
	},
	
    /**
     * 展开操作
     * @param {HTML Object} element
     */
    expand: function(element,needCallback) {
        // 只有非叶子节点才继续操作
        
        var me = this;
        
        //me.test();
        if (typeof needCallback == 'undefined'){
			needCallback = true;
		}
        if (me.getNodeType(element) && me.getNodeType(element) == "branchNode") {
            var tr = me.getTrDom(element),
			    expNode = tr.getElementsByTagName("td")[0],
				children = me.getChildrenTrDom(element);
			            
            baidu.removeClass(expNode, me.collapsedStyle); baidu.addClass(expNode, me.expandedStyle);
           
            if(children && !me.hasNoChild(children)){
                children.style.display = "";
            }
			/**
			 * 展开树节点触发的事件，触发该事件时候节点已经展开
			 * @event onexpand
			 * @param {Object} data 展开节点数据对象
			 * 数据结构定义如下：
			 * {
			 *   node:  [HTMLElement], 触发展开的节点
			 *   value: [String],      节点绑定的数据值, 可以通过重写getItemId方法来为节点绑定数据
			 * } 
			 */
			if (needCallback && me.onexpand){
				var t = tr.getElementsByTagName('span')[0];                
                me.onexpand({
                    target: t,
					value : baidu.dom.getAttr(t,'value')
                });
			}
        }
    },

    /**
     * 收起操作
     * @param {HTML Object} element
     */
    collapse: function(element) {
        // 只有非叶子节点才继续操作
        var me = this;
        if (me.getNodeType(element) && me.getNodeType(element) == "branchNode") {
            var tr = me.getTrDom(element);
            var expNode = tr.getElementsByTagName("td")[0];
            var children = me.getChildrenTrDom(element);           
            baidu.removeClass(expNode, me.expandedStyle); baidu.addClass(expNode, me.collapsedStyle);
            if(children){
                children.style.display = "none";
            }
            
        }
    },

    /**
     * 鼠标滑过事件处理，调用传递的mouseOverFn
     * @param {Object} _this
     */
    mouseOverHandler: function(me) {
        return function() {
            var e = window.event || arguments[0];
            var t = e.srcElement || e.target;
            
            if (me.overHandler && t && e) {
                me.overHandler({
                    target: t,
                    ev: e
                });
            }
        }
    },

    /**
     * 鼠标滑出事件处理，调用传递的mouseOutFn
     * @param {Object} _this
     */
    mouseOutHandler: function(me) {
        return function() {
            var e = window.event || arguments[0];
            var t = e.srcElement || e.target;
            if (me.outHandler && e && t) {
                me.outHandler({
                    target: t,
                    ev: e
                });
            }
        }
    },

    /**
     * 鼠标滑过事件处理，已封装了颜色改变及出现箭头
     * @param {Object} param, param包括两个属性 ，点击事件对象ev及点击DOM对象target
     */
    overHandler: function(param) {
        var n = param.target;
        var me = this;
        while (n && n.tagName != "TR" && n.id != me.containerId) {
            n = n.parentNode;
        }
        if (n && n.tagName == "TR" && n.id != me.containerId && n.nodeType != "children" && n != me.nowOverDom) {      
			me.setStyle(n);
            me.nowOverDom = n;
        }
    },

    /**
     * 鼠标滑过事件处理，已封装了颜色改变及箭头消失
     * @param {Object} param, param包括两个属性 ，点击事件对象ev及点击DOM对象target
     */
    outHandler: function() {
        this.cancelStyle();
    },

    /**
     * 设置某行的颜色
     * @param {HTML Object} tr
     */
    setStyle: function(tarTr) {
        var me = this;
		if (tarTr != null){
			//alert(tarTr.id +' ' + baidu.g(tarTr.id) +'-- ' +me.getClass('lineover') +'-- ' + baidu.g(tarTr.id).className)
			//baidu.addClass(tarTr,me.getClass('lineover'));  //kener
			var node = $$('#' + tarTr.id + ' td')[0];
			
			if (node) {
				baidu.addClass(node, me.getClass('lineover'));
			}
		}
    },

    /**
     * 取消上一次显示颜色行的颜色
     */
    cancelStyle: function() {
        var me = this;
        if (me.nowOverDom != null) {
            //baidu.removeClass(me.nowOverDom, me.getClass('lineover'));
			var node = $$('#' + me.nowOverDom.id + ' td')[0];
			
			if (node) {
				baidu.removeClass(node, me.getClass('lineover'));
			}
			
            me.nowOverDom = null;
			
        }
    } 
}

ui.Base.derive(ui.TreeView);
