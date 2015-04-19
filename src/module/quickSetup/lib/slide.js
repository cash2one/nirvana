/**
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: quickSetup/lib/slide.js 
 * desc: 快速新建引导页演示页面
 * author: wanghuijun@baidu.com
 * date: $Date: 2012/06/19 $
 */
nirvana.quickSetupLib = nirvana.quickSetupLib || {};
nirvana.quickSetupLib.slide = {
	containerId : 'QuickSetupSlide',
	
	step : 1,
	
	open : function() {
		var me = this;
		
		// 这里的level层级与全局loading的层级是一样的，不过两者不会同时出现，所以不会有影响
		document.body.appendChild(baidu.dom.create('div', {
			'class' : 'quicksetup_slide',
			'id'    : me.containerId
		}));
		baidu.g(me.containerId).innerHTML = er.template.get('quickSetupSlide');
		baidu.g(me.containerId).onclick = me.clickHandler();
		me.step = 1;
		baidu.addClass(me.containerId, 'step' + me.step);
		
        ui.Mask.show('black', '10');
	},
	
	close : function() {
        var me = this;
		
		baidu.dom.remove(me.containerId);
        ui.Mask.hide('10');
	},
    
    prev : function() {
        var me = this,
            step = me.step;
        
        baidu.removeClass(me.containerId, 'step' + step);
        baidu.addClass(me.containerId, 'step' + --step);
        
        me.step = step;
    },
    
    next : function() {
        var me = this,
            step = me.step;
        
        baidu.removeClass(me.containerId, 'step' + step);
        baidu.addClass(me.containerId, 'step' + ++step);
        
        me.step = step;
    },
	
	jump: function(){
        this.close();
		nirvana.quicksetup.show({
			type: 'useracct',
			redirect: true,
			entrance: 5
		});
	},
	
	clickHandler : function() {
		var me = this;
		
		return function(e) {
			e = e || window.event;
			var target = e.target || e.srcElement,
			    className = baidu.trim(baidu.dom.getAttr(target, 'class'));
			
			switch (className) {
                case 'prev':
                    me.prev();
                    break;
                case 'next':
                    me.next();
                    break;
                case 'jump':
                    me.jump();
                    break;
                case 'close':
                    me.close();
                    break;
			}
			
			baidu.event.stop(e);
		};
	}
};
