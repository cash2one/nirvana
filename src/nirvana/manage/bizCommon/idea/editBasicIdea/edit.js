/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    idea/edit.js
 * desc:    创意编辑 全投性小流量用  5月中旬小流量会转全 到时删掉替换掉edit.js
 * author:  wanghuijun
 * date:    $Date: 2011/1/13 $
 */

manage.ideaEdit = new er.Action({
	
	VIEW: 'ideaEdit',
	
	IGNORE_STATE : true,
	
	UI_PROP_MAP : EDIT_IDEA_UI_PROP,
	
	LevelPlan : null,
	
	LevelUnit : null,
	onbeforerender:function(){
		var me = this;
		
		me.setContext('mobileModifyTip','可在计划的“其他设置”中配置推广电话和商桥移动咨询。')
			

    },

	onafterrender: function(){
	   var me = this, controlMap = me._controlMap;
			//移动建站url初始化
	   baidu.array.each($$('.mobile_website'),function(item){
		   baidu.setAttr(item,"href",MOBILE_STATION_PATH + nirvana.env.USER_ID);
			})
		//新增创意 by liuyutong： 监控关键词匹配分析功能在“确定”和“取消”按钮之间加了一个“新增”按钮
		if (me.arg.type == 'saveas') {
			controlMap.IdeaSaveas.main.style.display = '';
			baidu.g("IdeaRightArea").style.top = "40px"; //修改模板结构，需控制整个右侧的位置mayue@baidu.com
			baidu.g("IdeaSaveas_matchnoun").style.display = "";
			controlMap.IdeaSaveas.onclick = function(){
				me.saveasAction();
			}
			//aoPackage优化中把确定取消按钮隐藏掉，增加了一个相对弱化的确定取消按钮
			if (me.arg.highsaveas) {
				IDEA_EDIT_PACKAGE.lightSaveas(me);
			}
		}

        if ( me.arg.entranceType == 'aoPackage_url' ) {
            IDEA_EDIT_PACKAGE.changeButtonStyle();
           /* baidu.dom.removeClass('ctrlbuttonIdeaSaveaslabel', 'ui_button_label');
            baidu.dom.addClass('ctrlbuttonIdeaSaveaslabel', 'light_idea_submit');
            baidu.dom.removeClass('ctrlbuttonIdeaSaveas', 'ui_button');*/
        }
		
		// 保存创意（调用新的复用函数）by mayue@baidu.com
		controlMap.IdeaSubmit.onclick = function(){
			me.saveAction();
		}
		// 取消编辑创意
		controlMap.IdeaCancel.onclick = function(){
			me.cancelAction();
		};
		
		//高度适应
		var avaiHeight = document.documentElement.clientHeight ;
		baidu.g('idea_edit').style.maxHeight = avaiHeight - 30 + 'px';//28 是diolog的标题的高度，偷懒直接写了。。
	    document.body.style.overflow = 'hidden'; //让底下的页面不可滚动
	    document.documentElement.style.overflow = "hidden";//for ie7
	},
    
    /**
     *离开action的时候 
     */
	onleave : function(){
		//让页面可以滚动
		document.body.style.overflow = 'auto';
		document.documentElement.style.overflow = "auto";//for ie7
	},
	
	onentercomplete : function(){
		var me = this,
		    controlMap = me._controlMap,
			type = me.arg.type;
		
		me.LevelPlan = controlMap.LevelPlan;
		me.LevelUnit = controlMap.LevelUnit;
		
		//加入关键词参考功能  by mayue@baidu.com
		IDEA_EDIT_PACKAGE.initWordRef(me);
		//加入右侧提示功能   by mayue@baidu.com
		IDEA_EDIT_PACKAGE.ideaTip(me);
		
		if (type == 'edit' || type == 'saveas') {
			me.getIdeaInfo(me.arg.ideaid);
		}
		else {
			me.addIdeaInit(me.arg.planid,me.arg.unitid);
		}

		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	
	/**
	 * 编辑创意/新增创意 功能初始化，需获取创意各项值再进行初始化
	 * @param {Object} ideaid
	 */
	getIdeaInfo: function(ideaid){
		var me = this;
		fbs.idea.getInfo({
			condition: {
				ideaid: [ideaid]
			},
			onSuccess: function(response){
				var data = response.data.listData[0], 
				    idea = IDEA_CREATION.getSourceIdeaData(data);
				
				//设置计划单元下拉框控件，并设为只读
				me.setPlanUnitValue(data);
				//记录计划、单元、创意id
				me.setMtlId(data, ideaid);
				
				//加入关键词参考功能  by mayue@baidu.com
				IDEA_EDIT_PACKAGE.getWordRef(me);
				
				//填充已有创意
				IDEA_CREATION.fillInit(idea);
				//初始化创意，增加对无线的判断逻辑
				IDEA_CREATION.idea_phone.devicePrefer = idea.deviceprefer;
				IDEA_CREATION.idea_phone.devicecfgstat = idea.devicecfgstat;
				if (idea.deviceprefer == 0) {//全部设备的时候出现两个url区
                    baidu.removeClass('ideaPhoneUrlWrap', 'hide');
                }
                else{
                	baidu.addClass('ideaPhoneUrlWrap', 'hide');
                }
				if (idea.devicecfgstat == 1 && idea.deviceprefer != 1) {
					//先请求该planid下的phonenum，在返回结果中初始化创意（IDEA_CREATION.init）
					me.getDeviceAttr(data.planid,data.unitid);
				}
				else {
					IDEA_CREATION.init();
				}
			},
			onFail: function(response){
				ajaxFailDialog();
			}
		});
	},
	
	
	
	
	
	

	/**
	 * 定位计划单元下拉框
	 * @param {Object} data
	 */
	setPlanUnitValue: function(data){
		var LevelPlan = this.LevelPlan,
			LevelUnit = this.LevelUnit;
		LevelPlan.fill([{
			value: data.planid,
			text: baidu.encodeHTML(data.planname)
		}]);
		LevelUnit.fill([{
			value: data.unitid,
			text: baidu.encodeHTML(data.unitname)
		}]);
		LevelPlan.setReadOnly(true);
		LevelUnit.setReadOnly(true);
	},
	
	
	
	/**
	 * 记录计划、单元、创意id
	 * @param {Object} data
	 * @param {Object} ideaid
	 */
	setMtlId: function(data, ideaid){
		var me = this, planid = me.arg.planid, unitid = me.arg.unitid;
		planid = (typeof planid === 'undefined') ? data.planid : planid;
		unitid = (typeof unitid === 'undefined') ? data.unitid : unitid;
		me.setContext("planid", planid);
		me.setContext("unitid", unitid);
		me.setContext('ideaid', ideaid);
	},
	
	
	
	/**
	 * 新建创意初始化
	 * @param {Object} planid
	 */
	addIdeaInit: function(planid,unitid){
	    var me = this;
		//加入关键词参考功能  by mayue@baidu.com
		IDEA_EDIT_PACKAGE.getWordRef(me);
		IDEA_CREATION.hideIdeaPhoneToggleArea();
		//如果计划id确定，先请求device类型和电话号码，在返回结果中初始化创意预览，否则直接初始化预览位
		if (planid&&unitid) {			
			me.getDeviceAttr(planid,unitid);
		}else if(planid){
		    me.getDeviceAttr(planid);
		}
		else {
			IDEA_CREATION.initIdeaPhoneAllDevice();
			IDEA_CREATION.init();
		}
		//判断批量添加创意	mayue@baidu.com
		if (me.arg.batch && me.arg.batch.isbatch) {
			IDEA_EDIT_PACKAGE.batchAction(me);
		}
		else {			// 获取计划单元列表
			nirvana.manage.getPlanList(me, true);
		}
	},
	
	
	
	/**
	 * 获取计划投放设备和电话属性
	 * @param {Object} planid
	 */
	getDeviceAttr : function(planid,unitid){
	    var me = this;
	    var requestFun = fbs.plan.getPlanAttrWithBridge;
	        
		requestFun({
			condition : {
                    planid : [planid]
            },
            onSuccess: function(response){
				var data = response.data.listData[0];
				IDEA_CREATION.idea_phone.devicePrefer = data.deviceprefer;
				
				IDEA_CREATION.idea_phone.devicecfgstat = data.devicecfgstat;
                if(IDEA_CREATION.idea_phone.devicePrefer == 0) {//全部设备
                    baidu.removeClass('ideaPhoneUrlWrap', 'hide');
					// ideaPhoneUrlWrap
                }
                else{
                	 baidu.addClass('ideaPhoneUrlWrap', 'hide');
				}

                
                if(data.bridgeStat){//是移动商桥小流量，不是就不会请求改字段
                	IDEA_CREATION.idea_phone.bridgeStat = data.bridgeStat;
                };		
				//phonestat为电话状态，0：生效；1：待审核；2：被拒绝
				if(data.phonenum.phonestat == 0 ){
					IDEA_CREATION.idea_phone.phoneNumber = data.phonenum.phonenum;
					if((IDEA_CREATION.idea_phone.phoneNumber!=''|| IDEA_CREATION.idea_phone.bridgeStat == 1)&&typeof unitid!='undefined'){//有电话的时候或者商桥且有单元还要看单元是否有app,根据app的情况决定显示电话还是url
					    me.getUnitAttr(unitid);
					}else{
					    IDEA_CREATION.init();
					}
					
					
					
				}else{
				    IDEA_CREATION.init();
				}
				
			},   
            onFail: function(response){
                ajaxFailDialog();
            }
			});
	},
	
	/**
     * 获取单元的附加创意属性
     * @param {Object} unitid
     */
    getUnitAttr : function(unitid){
        //fbs.unit.getNameList
        fbs.unit.getCreativeInfo({
            condition : {
                    unitid : [unitid]
            },
            onSuccess: function(response){
                var data = response.data.listData[0];
                var unitHasApp=false;
                if(data.creativecnt.app&&data.creativecnt.app!=0){//单元下有附加创意
                      unitHasApp = true; 
                    }
                IDEA_CREATION.idea_phone.unitHasApp = unitHasApp;
                IDEA_CREATION.init();
               
                
            },   
            onFail: function(response){
                ajaxFailDialog();
            }
            });
    },
	
	
	/**
	 * 点击确定后的动作，提取出来复用 by mayue@baidu.com
	 */
	saveAction: function(){
		var me = this,  
			planid = me.LevelPlan.getValue(), 
			unitid = me.LevelUnit.getValue();
		
		if (!unitid || +unitid < 0) { //没有选择推广单元
			baidu.g('LevelError').innerHTML = '请选择要添加的层级';
			baidu.removeClass('LevelError', 'hide');
			return false;
		}
		else {
			baidu.addClass('LevelError', 'hide');
			// 设置计划层级供保存使用
			me.setContext('planid', planid);
			me.setContext('unitid', unitid);
			IDEA_CREATION.save(me);
		}
		
		//以下都是监控
		IDEA_EDIT_LOG.batchLog(me);
		IDEA_EDIT_LOG.effectAnalyseLog(me);
		
		var extraLogParam = IDEA_EDIT_LOG.aoPackageLog(me), 
		logParam = {
			planid: planid,
			unitid: unitid,
			type: me.arg.type
		};
		if (typeof(extraLog) == "object") {
			baidu.extend(logParam, extraLogParam);
		}
		IDEA_EDIT_LOG.logCenter(me, 'save_idea', logParam);
	},
	
	
	
	/**
	 * 点击取消后的动作，提取出来复用 by mayue@baidu.com 2012.7.6
	 */
	cancelAction: function(){
		var me = this, 
			planid = me.LevelPlan.getValue(), 
			unitid = me.LevelUnit.getValue(),
			type = me.arg.type,
			extraLogParam = IDEA_EDIT_LOG.aoPackageLog(me, type, {action_type:-1}), 
			logParam = {
				planid: planid,
				unitid: unitid,
				type: type
			};
		if(typeof(extraLog) == "object"){
			baidu.extend(logParam, extraLogParam);
		}
		IDEA_EDIT_LOG.logCenter(me, 'cancel_idea', logParam);
		
		//以上都是监控
		me.onclose();
	},
	
	
	
	/**
	 * 新增后的动作，提取出来复用 by mayue@baidu.com 2012.7.6
	 */
	saveasAction: function(){
        var me = this;
		
		IDEA_EDIT_LOG.aoPackageLog(me, "saveas", {action_type:2});
		IDEA_CREATION.save(me,true);
	},
	


    /**
     * 创意保存成功，直接关闭子action，刷新父action
     */
	saveSuccess: function(add){
		var me = this;
		
		return function(response){
            // wsy 为了给移动优化包-搬家方案-的监控传递url新值
            var url = {
                url : baidu.g("ctrltextIdeaHref").value,
                showurl : baidu.g("ctrltextIdeaUrl").value,
                miurl : baidu.g("ctrltextMIdeaHref").value,
                mshowurl : baidu.g("ctrltextMIdeaUrl").value
            };
			// 清除创意cache
			fbs.material.clearCache('ideainfo');
			//matchLogParams到处都是。。。
			if (me.arg.matchLogParams) {
				IDEA_EDIT_LOG.logCenter(me, 'matchSave_idea', me.arg.matchLogParams);
				if (add) {
					me.arg.matchLogParams.ideaid = response.data.ideaid;
				}
			}
			//关闭当前页面
			me.onclose();
			//关闭后的下一步操作
			var isLast = nirvana.manage.batchIdea.isLast, onsubmit = me.arg.onsubmit;
			if (me.arg.batch && me.arg.batch.isbatch) {		//批量操作处理
				me.batchSaveSuccuss(isLast);
			}
			else {		//非批量添加操作，则refresh父页面
				isLast = me.refreshFather();
			}
			//如果是批量添加的最后一条创意，或者不是批量添加操作，则允许执行带入的onsubmit方法
			if (isLast && typeof onsubmit === 'function') {
				onsubmit(url);
			}
		};
	},
	
	
	
	/**
	 * 批量添加成功
	 * @param {Object} isLast
	 */
	batchSaveSuccuss: function(isLast){
		var me = this;
		//监控经典版保存创意成功，用于quicksetup中
		nirvana.quickSetupLogger('quicksetup_step4_ideasaved', {
			type: 2
		});
		IDEA_EDIT_PACKAGE.afterBatchSave(me);
		
		if (isLast) {
			//监控精简版保存创意成功，且流程结束，用于quicksetup中
			nirvana.quickSetupLogger('quicksetup_step4_ideafinish', {
				type: 2
			});
		}
	},
	
	
	
	/**
	 * 刷新 打开新建创意/编辑创意浮层的 action
	 */
	refreshFather: function(){
		var me = this;
		if (me.arg.fromSubAction) {				// 来自于子action
			//清空来源子Action中所有的参数，去刷新
			var father = me.arg.father,
				stateMap;
			if(father){
				stateMap = father.getClearStateMap();
				father.refreshSelf(stateMap);
			}
		}
		else 
			if (me.arg.fromSubTable) {			//来自于表格
				me.onclose();
				me.arg.subTableRender();
				return false;
			}
			else {
				er.controller.fireMain('reload', {});
			}
		return true;
	}
	
	
	
   
	
});