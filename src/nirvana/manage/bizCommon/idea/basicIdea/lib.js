/**
 * @file nirvana\src\nirvana\manage\bizCommon\idea\normalIdea\lib.js 
 * 普通创意乱七八糟的方法,以前的ideaLib.js太长了，把普通创意自己用的方法以后写在这里
 *
 * @author yanlingling(yanlingling@baidu.com)
 */
nirvana.idea = nirvana.idea || {};
nirvana.idea.normalIdea = nirvana.idea.normalIdea || {};
nirvana.idea.normalIdea.lib = (function(){
	var ideaLib = nirvana.manage.ideaLib;
	
	return {
		
		/**
		 *设置更多操作的特殊逻辑 
		 */
	
		moreOptSpecial : function() {
			var me = this;
			var idea = ideaPublic;

			//更多操作按钮里面多了url的批量操作，一般只有删除
			idea.CONTEXT_INITER_MAP.moreOptButton = function(callback) {
				this.setContext('moreOpt', baidu.object.clone(me.baseMoreOpt));
				callback();
			}
		},

		
		/**
		 * 设置更多操作的内容
		 * @param {object} action action对象 
		 */
		setMoreOpt : function(action) {
			var me = action;
			var navLevel = me.getContext('navLevel');
			var devicePrefer = me.getContext(navLevel+'_deviceprefer');
			
			var moreOpt = me.getContext('moreOpt');
			if(navLevel == 'account' && nirvana.env.FCWISE_MOBILE_USER) {//白名单用户账户层级的时候，不给url操作
				moreOpt.splice(1, 2);
			} 
			else {
				if(devicePrefer == 2) {//仅移动
					moreOpt.splice(1, 2,{
	                text:"移动URL",
	                value:'url'  //实际还是该的默认url，字面变了
	            })
				}
			}

			me.setContext('moreOpt', moreOpt);
			var select = ui.util.get('moreOpt');
			select.options = moreOpt;
			//又踩到select控件的坑了，必选要设置options才能刷新
			select.repaint(select.main);
		},
         
        /**
         * 打开批量修改url框 
         * @param {object} action action对象 
         * @param {string} type url类型 
         */
		modUrl : function(type,action,item){
			var title = '默认URL';
			var me = action;
			if(type == 'miurl'){
			    title = '移动URL'
			}
		  
			nirvana.util.openSubActionDialog({
						id : 'ideaModUrlDialog',
						title : title,
						width : 360,
						actionPath : 'manage/modIdeaUrl',
						params : {
							item : item,
							type : type//真实修改后端的url
						}
					});
		},
		
		/**
		 *更多操作内容基准 
		 */
		baseMoreOpt : [{
	                text:"更多操作",
	                value:-9999
	            },{
	                text:"默认URL",
	                value:'url'
	            },{
	                text:"移动URL",
	                value:'miurl'
	            },{
	                text:"删除",
	                value:'delete'
	            }]
	}
})();
