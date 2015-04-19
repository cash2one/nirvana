/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: common/monitor/ScheduleMonitor.js 
 * desc: 优化包的用户行为监控
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/10/24 $
 */
/**
 * 用于发送推广时段的监控的静态类
 * 
 * @class ScheduleMonitor
 * @namespace nirvana
 * @static
 */
nirvana.ScheduleMonitor = function($) {
	var ScheduleMonitor = {
		/**
		 * 点击确定保存时段的修改的行为监控<br/>
		 * <b>NOTICE:</b>如果不是优化包或者手动版账户优化的时段修改，调用该接口不会发送监控
		 * @method saveSchedule
		 * @static 
		 * @param {Object} changeInfo 修改时段变化信息 其包含字段定义如下：
		 * {
		 * 		planIds:    [Array] 所要修改的计划ID数组
		 *      oldValue:   [Array] 修改前搁置时段值
		 *      newValue:   [Array] 修改后搁置时段值
		 *      recmdValue: [Array] 后端推荐的时段值
		 *  }
		 * @param {String|Number} opttypeid 优化包的时段修改的opttypeid
		 * @param {Boolean} isAo 是否是推广管理手动版的账户优化的时段修改
		 */
		saveSchedule: function(changeInfo, opttypeid, isAo) {
			var oldValue = changeInfo.oldValue ? changeInfo.oldValue.join('|') : '',
			    newValue = changeInfo.newValue ? changeInfo.newValue.join('|') : '',
			    recmdValue = changeInfo.recmdValue ? changeInfo.recmdValue.join('|') : '';
			    
			var logParam = {
					planid : changeInfo.planIds
				};
			
			if (opttypeid) {
				// 优化包的时段修改监控
				logParam.opttypeid = opttypeid;
				logParam.oldvalue = oldValue;
				logParam.newvalue = newValue;
				logParam.recmvalue = recmdValue;
				// 发送优化包的时段修改行为监控
				nirvana.aoPkgControl.logCenter.extend(logParam).sendAs('nikon_modify_cyc');
			} else if (isAo) {
			    logParam.old_value = oldValue;
			    logParam.new_value = newValue;
				logParam.target = 'aowidget_schedule_save';
				
				//推广管理手动版的账户优化的时段修改监控
				logParam.opttype = 52;
				// 发送手动版的账户优化的行为监控
				nirvana.aoControl.sendLog(logParam, nirvana.aoControl.snapShot);
			}
		} 
	};
	
	return ScheduleMonitor;
}($$);