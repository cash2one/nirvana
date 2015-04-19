
/**
 * 插入通配符类
 */
var InsertWildCard = {

    position: {
        title: [-1, -1],
        desc1: [-1, -1],
        desc2: [-1, -1]
    },
    

    /**
     * 插入通配符按钮初始化
     * @auhor zuming@baidu.com tongyao@baidu.com
     * @type 短创意0/长创意1
     * 
     */
    init: function() {
		baidu.g('IdeaWildCardTitle').onclick = InsertWildCard.title;
		baidu.g('IdeaWildCardDesc1').onclick = InsertWildCard.desc1;
		baidu.g('IdeaWildCardDesc2').onclick = InsertWildCard.desc2;
    },
    
    title: function(o) {
        var o = IDEA_CREATION.getForm(IDEA_CREATION.dom.title.input),
		    pos = InsertWildCard.position.title,
			str;
		
		o.focus();
		
		if (pos[0] == -1 || pos[1] == -1) {
			pos = [0, 0];
		}else{
			InsertWildCard.position.title = getInputSelectPosition(o);
		}
		
        str = o.value.substr(0, pos[0]) + '{' + o.value.substr(pos[0], pos[1] - pos[0]) + '}' + o.value.substr(pos[1]);
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
		}else{
			InsertWildCard.position.desc1 = getInputSelectPosition(o);
		}
		
        str = o.value.substr(0, pos[0]) + '{' + o.value.substr(pos[0], pos[1] - pos[0]) + '}' + o.value.substr(pos[1]);
        o.value = str;
        movePoint(o, pos[0] - 4);
       	IDEA_CREATION.preview();
        return false;
    },
    
    desc2: function() {
         var o = IDEA_CREATION.getForm(IDEA_CREATION.dom.desc2.input),
		     pos = InsertWildCard.position.desc2,
			 str;
		
        o.focus();
		
		if (pos[0] == -1 || pos[1] == -1) {
			pos = [0, 0];
		}else{
			InsertWildCard.position.desc2 = getInputSelectPosition(o);
		}
		
        str = o.value.substr(0, pos[0]) + '{' + o.value.substr(pos[0], pos[1] - pos[0]) + '}' + o.value.substr(pos[1]);
        o.value = str;
        movePoint(o, pos[0] - 4);
        IDEA_CREATION.preview();
        return false;
    }
};
