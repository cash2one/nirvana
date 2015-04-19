/*
 * 筛选，自定义包含与不包含的内容
 * 在ValueEditor的基础上实现
 * 
 * @param {HTMLElement} target 目标节点
 * @param {Object} config 配置项，具体说明如下
 * {
 * 		target {HTMLElement} [REQUIRED] 目标节点
 * 		onchange {Function} [REQUIRED] 筛选条件变化时的回调，
 * 		传入两个参数，包含的数组include，不包含的数组exclude
 * 		max_include {number}  [REQUIRED] 包含项的最大个数
 * 		max_exclude {number}  [REQUIRED] 不包含项的最大个数
 * }
 * @author mayue
 * @update 2013/05/12
 */
fc.ui.Filter = function($) {
    var ValueEditor = fc.ui.ValueEditor,
    	T = baidu,
    	event = fc.event;
    
	function Filter(target, config) {
	    this.target = target;
		T.object.extend(this, config);
		
		this.target.innerHTML = TPL_UI;
		
		this.include = [];
		this.exclude = [];
		
		addEvents.call(this);
	}
	Filter.prototype = {
	    /*
	     * 为了对应页面中筛选按钮的pos值，在删除时，只将该筛选项设置为false。因而获取筛选项时需要用这个方法得到真正的筛选项
	     * @private
	     * @param {string} type 类型区分 include或exclude
	     * @return 去重后的筛选项
	     */
		getFilter: function(type) {
		    var ret = [];
		    var data = this[type];
		    var len = data.length;
		    for (var i = 0; i < len; i ++) {
    	        if (data[i]) {
    	            ret.push(data[i]);
    	        }
            }
            return ret;
		},
		/*
		 * 清除现有筛选，还原到初始状态
		 * @public
		 * @param fireonchange {boolean} 标识是否触发onchange
		 */
		clear: function(fireonchange) {
		    var me = this;
		    me.target.innerHTML = TPL_UI;
		    
		    me.include = [];
            me.exclude = [];
		    
		    if (fireonchange) {
		        me.onchange.call(me, [], []);
		    }
		}
	}
	
	var INCLUDE_CUSTOM = '<span class="animated filter_custom flipInX" type="include">自定义</span>';
	var EXCLUDE_CUSTOM = '<span class="animated filter_custom flipInX" type="exclude">自定义</span>';
	
    var TPL_UI = ''
        + '<div class="fc-ui-filter">'
        +     '<span class="filter_block">'
        +         '<label class="type">包含：</label>' + INCLUDE_CUSTOM
        +     '</span>'
        +     '|'
        +     '<span class="filter_block">'
        +         '<label class="type">不包含：</label>' + EXCLUDE_CUSTOM
        +     '</span>'
        + '</div>';
    
    var TPL_ITEM = '<span class="animated {className}" type="{type}" pos="{pos}">{content}</span>';
    
    var CSS_CUSTOM = 'filter_custom';
    var CSS_SELECTED = 'filter_selected';
    var CSS_CANCEL = 'fc_icon_cancel';
    
    function addEvents() {
        var node = this.target;
        event.on(node, '.' + CSS_CUSTOM, 'click', editFilter, this);
        event.on(node, '.' + CSS_CANCEL, 'click', cancelFilter, this);
    }
    
    function editFilter(e) {
        // 每次都是重新创建 ValueEditor
        var me = this,
            item = e.target,
            text = item.innerHTML,
            flag = (text === '自定义'),
            editor = new ValueEditor({ target: item, value: flag ? '' : text, parent: me.target[0] });

        editor.onsubmit = function(value) {
            value = trim(value);
            if (!value) {
                return;
            }
            var oldValue = item.text;
            item.innerHTML = value;
            
            var type, pos;
            
            if (flag) {
            	type = item.getAttribute('type');
            	me[type].push(value);
            	pos = me[type].length - 1;
            	
            	if (me.getFilter(type).length < me['max_' + type]) {
	            	var custom = (type == 'include') ? INCLUDE_CUSTOM : EXCLUDE_CUSTOM;
                    var newCustom = fc.create(custom);
                    item.parentNode.appendChild(newCustom);
            	}
            }
            else {
            	type = item.getAttribute('type');
            	var pos = item.getAttribute('pos');
            	me[type][pos - 0] = value;
            }

            updateItem(item, type, pos);
            if (value !== oldValue) {
                me.onchange.call(me, T.array.unique(me.getFilter('include')), T.array.unique(me.getFilter('exclude')));
            }
        };
    }

    function cancelFilter(e) {
        var item = e.target.parentNode;
        var type = item.getAttribute('type');
        var pos = item.getAttribute('pos');
        
        if (this.getFilter(type).length == this['max_' + type]) {
            var custom = (type == 'include') ? INCLUDE_CUSTOM : EXCLUDE_CUSTOM;
            var newCustom = fc.create(custom);
            item.parentNode.appendChild(newCustom);
        }
        this[type][pos - 0] =  false;
        item.parentNode.removeChild(item);

        this.onchange.call(this, T.array.unique(this.getFilter('include')), T.array.unique(this.getFilter('exclude')));
    }
	
	// 动画类型
    var animateType = 'flipInX';
    /*
     * @item 要更新的节点
     * @type 类型 包含/不包含
     * @pos 第几个项
     */
    function updateItem(item, type, pos) {
    	var Icon = fc.common.Icon;
        var newHTML = fc.tpl.parse({
	        	className: CSS_SELECTED, 
	        	type: type,
	        	pos: pos,
	            content: item.innerHTML + Icon.getIcon(Icon.CANCEL)
	        },
            TPL_ITEM
        );
        
        var oldNode = item,
            newNode = fc.create(newHTML);
        oldNode.parentNode.replaceChild(newNode, oldNode);
        // 应用动画
        fc.addClass(newNode, animateType);
        fc.addClass(oldNode, animateType);
    }
    
    return Filter;
}($$)
