/**
 * 开始实验
 * @author zhouyu01
 */
fclab.abtest.start = {
	/**
	 * 开始实验操作
	 * @param {Object} labid
	 */
	doStart: function(labid){
		var me = this;
		fbs.abtest.modAbtest({
			labid: labid,
			items:{
				"labstat":2
			},
			onSuccess: this.startSuccess.bind(this, null),
			onFail: function(response){
				if (response.wordErrorDetail) {
					me.alertBidIsNull(response.wordErrorDetail);
					return;
				}
				if (response.status == 500) {
					me.startFail(me.doStart.bind(me, labid));
					return;
				}
				if (response.errorCode && response.errorCode.code == 180029) {
					startAbtest.testToUpper();
					return ;
				}
			}
		});
	},
	
	/**
	 * 试验中有关键词未设置出价
	 */
	alertBidIsNull: function(wordErrorDetail){
		var code, hint;
		for(var key in wordErrorDetail) {
			code = wordErrorDetail[key].code;
			break;
		}
		hint = fclab.config.fail[code] 
			? fclab.config.fail[code] 
			: '您有关键词未设置实验组出价，请设置后开始';
		ui.Dialog.alert({
			title: '确认',
			content: hint
		});
	},
	
	/**
	 * 开始实验成功
	 * @param {Object} dialog
	 */
	startSuccess: function(dialog){
		var clazz = fclab.abtest;
		clazz.getTotalInfo.apply(clazz);
		ui.Dialog.alert({
			title: '确认',
			content: '提交成功，在实验期间请尽量不要修改实验关键词出价',
			onok: function(){
				if (dialog) {
					dialog.close();
				}
			}
		});
	},
	
	/**
	 * 开始实验失败，允许重试
	 * @param {Object} callback
	 */
	startFail: function(callback){
		ui.Dialog.confirm({
			title: '确认',
			content: '提交失败，请您重试',
			ok_button_lang: '重试',
			cancel_button_lang: '取消',
			onok: function(){
				callback && callback();
			}
		});
	},
	
	/**
	 * 进行中实验数量达到上限
	 */
	testToUpper: function(){
		ui.Dialog.alert({
			title: '确认',
			content: fclab.config.fail["180029"],
			onok: function(){
				var clazz = fclab.abtest;
				clazz.curstat = 1;
				if(clazz.createDialog){
					clazz.createDialog.close();
				}
				clazz.changeStatTab.apply(clazz);
				clazz.getTotalInfo.apply(clazz);
			}
		});
	}
}
var startAbtest = fclab.abtest.start;
