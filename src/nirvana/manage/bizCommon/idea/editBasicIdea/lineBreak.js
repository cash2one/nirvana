
/**
 * 插入断句符类
 */
var InsertLineBreak = {

    /**
     * 插入断句符按钮初始化
     * @auhor zuming@baidu.com tongyao@baidu.com
     * @type
     * 
     */
    init: function() {
		var me = this;
		
		if (baidu.g('IdeaLinebreakTitle')) {
			baidu.g('IdeaLinebreakTitle').onclick = function(){
				if (!baidu.dom.hasClass(this, 'disable')) {
					me.title();
					baidu.addClass(this, 'disable');
				}
				return false;
			}
		}
		
		if (baidu.g('IdeaLinebreakDesc1')) {
			baidu.g('IdeaLinebreakDesc1').onclick = function(){
				if (!baidu.dom.hasClass(this, 'disable')) {
					me.desc1();
					baidu.addClass(this, 'disable');
				}
				return false;
			}
		}
    },
    
    title: function(o) {
        var o = IDEA_CREATION.getForm(IDEA_CREATION.dom.title.input),
		    pos = InsertWildCard.position.title,
			str;
		
		o.focus();
		
		if (pos[0] == -1 || pos[1] == -1) {
			pos = [0, 0];
		}
		
        str = o.value.substr(0, pos[0]) + '^' + o.value.substr(pos[0]);
        o.value = str;
        movePoint(o, pos[0] - 4);
		IDEA_CREATION.preview();
        return false;
    },
    
    desc1: function() {
        var o = IDEA_CREATION.getForm(IDEA_CREATION.dom.desc1.input),
		    pos = InsertWildCard.position.desc1,
			str;
		
        o.focus();
		
		if (pos[0] == -1 || pos[1] == -1) {
			pos = [0, 0];
		}
		
        str = o.value.substr(0, pos[0]) + '\n' + o.value.substr(pos[0]);
        o.value = str;
        movePoint(o, pos[0] - 4);
       	IDEA_CREATION.preview();
        return false;
    }
};
