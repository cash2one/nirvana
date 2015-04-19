/**
 * @author yangji01
 */

manage.LXBstat9 = new er.Action({
	VIEW :'LXBStat9',
	onafterrender : function(){
		baidu.dom.setAttr($$('.tip-container a')[0],'href',LXB.LINK.REG + nirvana.env.USER_ID);
	}
});

manage.LXBstat8 = new er.Action({
	VIEW :'LXBStat8'
});

manage.LXBstat6 = new er.Action({
	VIEW :'LXBStat6'
});

manage.LXBstat4 = new er.Action({
	VIEW :'LXBStat4',
	onafterrender : function(){
		baidu.dom.setAttr($$('.tip-container a')[0],'href',LXB.LINK.REG + nirvana.env.USER_ID);
	}
});

manage.LXBstat0 = new er.Action({
	VIEW :'LXBStat0',
	onafterrender : function(){
		baidu.dom.setAttr($$('.tip-container a')[0],'href',LXB.LINK.REG + nirvana.env.USER_ID);
	}
});

manage.LXBstat1000 = new er.Action({
	VIEW :'LXBStat1000',
	onafterrender : function(){
		baidu.addClass(baidu.g('ctrldialogLXBstatusDialogbody'),'lxb-status-1000');
		if(ui.util.get('appLxb')){
			ui.util.get('appLxb').onclick = function(){
				window.open(LXB.LINK.PRODUCT + nirvana.env.USER_ID, 'appLxbNewPage');
			};
		}
	}
});
