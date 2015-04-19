/**
 * 新建/编辑创意浮层中来自于各个地方的监控，统一为一个文件
 * @author zhouyu01
 * 重构于2012-09-26
 */
var IDEA_EDIT_LOG = {
	/**
	 * 新户搭建迭代一期监控
	 * 添加于2012-07-02 by LeoWang(wangkemiao@baidu.com)
	 * @param {Object} actionInstance
	 */
	batchLog: function(actionInstance){
		var me = actionInstance;
		if (me.arg.batch && me.arg.batch.isbatch) {
			//监控，第四步中经典版点击下一条创意按钮
			if (me.arg.entranceType == 'aoPackage') {
				var logParam = {};
				logParam.planid = me.getContext('planid');
				logParam.unitid = me.getContext('unitid');
				nirvana.aoPkgControl.logCenter.extend(logParam).sendAs('recmpkg_addidea');
			}
			else {
				nirvana.quickSetupLogger('quicksetup_step4_saveidea', {
					type: 2
				});
			}
		}
	},
	
	/**
	 * 如果来源是效果分析工具，添加监控，add by yanlingling
	 * @param {Object} actionInstance
	 */
	effectAnalyseLog: function(actionInstance){
		var me = actionInstance;
		if (me.arg.fromSubAction && me.arg.fromSubAction.VIEW == "effectAnalyseIdea") {
			var logparam = {};
			logparam.ideaOptType = (type === 'edit') ? 'edit' : 'add';
			nirvana.effectAnalyse.lib.logCenter("", logparam);
		}
	},
	
	/**
	 * ao优化包监控
	 * @param {Object} actionInstance	
	 * @param {Object} type 			浮层操作类型，若没有传入，则读取arg值
	 * @param {Object} diffParams		会传入不同于默认参数的参数 			
	 */
	aoPackageLog: function(actionInstance, type, diffParams){
		var me = actionInstance, ideaid;
				
		if (me.arg.entranceType == 'aoPackage') {
			var LevelPlan = me.LevelPlan, 
				LevelUnit = me.LevelUnit, 
				type = type || me.arg.type, 
				planid = LevelPlan.getValue(), 
				unitid = LevelUnit.getValue(), 
				pkgLogParam = baidu.extend({}, me.arg.extendLogParam || {}), 
				extendParam = {
					action_type: 1,
					planname: LevelPlan.getText(),
					unitname: LevelUnit.getText(),
					planid: planid,
					unitid: unitid,
					opttypeid: me.arg.opttypeid,
					winfoid: me.arg.winfoid,
					showword: me.arg.showword
				}, 
				extraParam, sendType;
			switch (type) {
				case "edit":
					ideaid = me.getContext('ideaid');
					extraParam = {
						ideaid: me.arg.ideaid,
						ideastat: me.arg.ideastat,
						pausestat: me.arg.pausestat
					}
					sendType = "nikon_modifyidea_edit";
					break;
				case "saveas":
					ideaid = 0;
					extraParam = {
						ideaid: me.arg.ideaid,
						ideastat: me.arg.ideastat,
						pausestat: me.arg.pausestat,
						showqstat: me.arg.showqstat
					}
					sendType = "nikon_modifyidea_modasnew";
					break;
				default:
					ideaid = 0;
					extraParam = {};
					sendType = "nikon_modifyidea_add";
					break;
			}
			baidu.extend(extendParam, extraParam);
			if (diffParams && typeof(diffParams) == "object") {
				baidu.extend(extendParam, diffParams);
			}
			baidu.extend(pkgLogParam, extendParam);
			nirvana.aoPkgControl.logCenter.extend(pkgLogParam).sendAs(sendType);
			return {
				ideaid: ideaid
			};
		}
		return false;
	},
	
	/**
	 * 监控中心
	 * @param {Object} actionName
	 * @param {Object} param
	 */
	logCenter : function(actionInstance, actionName, param) {
		var me = actionInstance,
			logParam = {};
		
		baidu.extend(logParam, param);
		
		if(me.arg.entranceType == 'ao'){ // 账户优化
			logParam.target = 'aowidget_' + actionName;
			logParam.opttype = me.arg.opttype;
			
			nirvana.aoControl.sendLog(logParam, nirvana.aoControl.snapShot);
		}
		
		if(actionName === 'matchSave_idea'){
			NIRVANA_LOG.send(param);
		}
	}
}
