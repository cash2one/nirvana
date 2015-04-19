/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: schedule/RecmdScheduleAnalyze.js
 * desc: 推广时段的推荐时段分析组件
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/10/22 $
 */
/**
 * 推广时段的推荐时段分析组件
 *
 * @class RecmdScheduler
 * @namespace nirvana
 * @static
 */
nirvana.RecmdScheduler = function($) {
	/**
	 * 构造函数定义
	 * @constructor
	 * @param {ScheduleOptimizer} scheduleOptimizer 推广时段优化组件
     * @param {ui.Table} table 表格组件
	 */
 	function RecmdScheduleAnalyze(scheduleOptimizer, table) {
 		this._scheduleOptimizer = scheduleOptimizer;
 		this._table = table;
 		// 初始化选中的推荐推广时段
 		this.selRecmdTimes = [];
 		
 		// 初始化分析组件
 		this.init();
 	}
 	/**
 	 * 获取内部使用的时段时间
 	 * @param {Number} day 选中的时段的星期，其有效值为0~6（对应周一~周日）
     * @param {Number} time 选中的时段的小时，其有效值为0~23(对应小格子的0~23)
     * @return {Number} 
     * @example 
     *      getScheduleTime(5, 20)
     *      结果为：620
 	 */
 	function getScheduleTime(day, time) {
 		return (day + 1) * 100 + time;
 	}
 	
 	RecmdScheduleAnalyze.prototype = {
 		/**
 		 * 初始化
 		 * @private
 		 */
 		init: function() {
 			this.bindHandlers();
 		},
 		/**
 		 * 行Mouseover事件处理 
 		 */
 		rowOverHandler: function(index) {
 			 this.doRowOverOrOutHandler(index, true);
 		},
 		/**
 		 * 行Mouseout事件处理 
 		 */
 		rowOutHandler: function(index) {
 			this.doRowOverOrOutHandler(index, false);
 		},
 		/**
 		 * 执行行Mouseover/out事件处理 
 		 */
 		doRowOverOrOutHandler: function(index, isOver) {
 			var table = this._table,
 			    ds = table.datasource,
 			    // 时段编辑组件
 			    scheduleWidget = this._scheduleOptimizer.getEditor(),
 			    // 所在行的推荐时段
 			    time = ds[index].suggestcyc;
 			    
 			var oldHandler;
 			if (isOver) {
 				oldHandler = ui.Table.prototype.rowOverHandler;
 			} else {
 				oldHandler = ui.Table.prototype.rowOutHandler;
 			}
 			// 执行原始的事件处理
 			oldHandler.call(table, index);
 			
 			var day = parseInt(time / 100)- 1,
 			    hour = time % 100;
 			    
 			var timeElem = scheduleWidget.getId('SelWTtime_' + day + '_' + hour);
 			
 			// 触发时段编辑器所对应的时段单元格的over/out事件
 			var className = scheduleWidget.getClass('sel_wktimehover');
	        if (isOver) {
	            baidu.addClass(timeElem, className);
	        } else {
	            baidu.removeClass(timeElem, className);
	        }
	        scheduleWidget.setSuggestTime(timeElem);
 			//scheduleWidget.selTimeOverOut(timeElem,isOver);
 		},
 		/**
 		 * 绑定事件处理器 
 		 * @private
 		 */
 		bindHandlers: function() {
 			var me = this,
 			    table = this._table,
 			    bindContext = nirvana.util.bind;
 			
 			// 注册:排序事件
	        table.onsort = function(sortField,order){
	            // 执行排序操作
	            me.sort(sortField.field, order);
	        }; 
	        
	        // 为了实现这个特殊需求，不想改原有控件，所以这里做了覆盖
	        // 注册：行mouse over事件处理器
 			table.rowOverHandler = bindContext(this.rowOverHandler, this);
 			// 注册：行mouse out事件处理器
 			table.rowOutHandler = bindContext(this.rowOutHandler, this);
 		},
 		/**
         * 选中或取消某个时间段的选择
         * @method toggleScheduleTimeSelect
         * @param {Number} day 选中的时段的星期，其有效值为0~6（对应周一~周日）
         * @param {Number} time 选中的时段的小时，其有效值为0~23(对应小格子的0~23)
         * @param {Boolean} isSelected 该时段是否被选中
         */
 		toggleScheduleTimeSelect: function(day, time, isSelected) {
 			var selTime = getScheduleTime(day, time),
			    idx = this.getScheduleTimeIndex(selTime);
			    
			if (idx != -1) {
				// 更新缓存的已经选中的推荐的时段
				if (isSelected
						&& baidu.array.indexOf(this.selRecmdTimes, selTime) == -1) {
					this.selRecmdTimes.push(selTime);
				} else {
					baidu.array.remove(this.selRecmdTimes, selTime);
				}
				// 更新样式
				this.updateScheduleTimeStyle(idx, isSelected);
			}
 		},
 		/**
 		 * 触发时段被MouseOver/MouseOut事件 
 		 * @method fireScheduleTimeOver
 		 * @param {Number} day 选中的时段的星期，其有效值为0~6（对应周一~周日）
 		 * @param {Number} time 选中的时段的小时，其有效值为0~23(对应小格子的0~23) 
 		 * @param {Boolean} isOver 是否是over事件
 		 */
 		fireScheduleTimeOver: function(day, time, isOver) {
 			var table = this._table,
 			    selTime = getScheduleTime(day, time),
 			    idx = this.getScheduleTimeIndex(selTime);
 			    
 			if (idx != -1) {
 				var rowElem = table.getRow(idx);
 				
 				if (isOver) {
 					baidu.addClass(rowElem, table.getClass('row_over'));
 				} else {
 					baidu.removeClass(rowElem, table.getClass('row_over'));
 				}
 			}
 		},
 		/**
 		 * 获取给定的推广时段对应的行索引
 		 * @param {Number} time 推广的时段
 		 * @return 对应的行索引，没找到返回-1 
 		 */
 		getScheduleTimeIndex: function(time) {
			var ds = this._table.datasource,
			    len = ds.length,
			    idx = 0;
			    
			for (; idx < len; idx ++) {
				if (ds[idx].suggestcyc == time) {
					break;
				}
			}
			
			return (idx < len) ? idx : -1;
 		},
 		/**
 		 * 更新时段样式 
 		 */
 		updateScheduleTimeStyle: function(index, isSelected) {
 			var table = this._table,
			    rowElem = table.getRow(index);
			   // classChanger = isSelected ? baidu.addClass : baidu.removeClass;
			   // disableLayerElem = baidu.q('disable_layer', rowElem)[0];
			
			if (isSelected) {
				//rowElem.appendChild(fc.create('<div class="disable_layer"></div>'));
				baidu.addClass(rowElem, 'schedule_selected'); //table.getClass('row-selected')
			} else if (!isSelected){
				//rowElem.removeChild(disableLayerElem);
				baidu.removeClass(rowElem, 'schedule_selected');
			}
 		},
 		/**
 		 * 对表格数据进行排序 
 		 * @method sort
 		 * @param {String} orderBy 要排序的列的field,必须能通过data[orderBy]获取对应的field的数据
	     * @param {String} orderType 排序的方式，可能取值为{desc|asc}，未传递该参数，默认使用desc排序
 		 */
 		sort: function(orderBy, orderType) {
 			var table = this._table;
 			    
 			// 执行排序操作
 			sortNumArray(table.datasource, orderBy, orderType);
 			
 			// 更新表格控件
 			table.render(table.main);
 			
 			// 更新选择的时段样式
 			var selTimes = this.selRecmdTimes,
 			    idx;
 			for (var i = 0, len = selTimes.length; i < len; i ++) {
 				idx = this.getScheduleTimeIndex(selTimes[i]);
 				// 更新样式
				this.updateScheduleTimeStyle(idx, true);
 			}
 		},
 		/**
 		 * 更新时段推荐分析的数据 
 		 * @method update
 		 * @param {Array} suggestcyc 建议的时段，一个二维数组，每个数组元素为一个大小为2的数组，
 		 *                其值包括建议投放的时段的开始时段和结束时段，具体含义可参见Schedule控件。
 		 *                e.g., [[100,103],[104,124],[500,524]]
 		 * @param {Array} potionalclk 潜在点击量数组，一个一维数组，和建议的时段顺序对应，
 		 *                数组元素值0-100的整数(百分比乘以100的结果) 
 		 *                e.g., [23,56,...]一共47个元素和suggestcyc对应
 		 * @param {Array} hotlevel 行业热门程度，一个一维数组，和建议的时段顺序对应，
 		 *                数组元素值0-100的整数(百分比乘以100的结果)                              
 		 */
 		update: function(suggestcyc, potionalclk, hotlevel) {
 			suggestcyc = suggestcyc || [];
            potionalclk = potionalclk || [];
            hotlevel = hotlevel || [];

 			var interval,
 			    num = 0,
 			    record,
 			    table = this._table,
 			    datasource = table.datasource;
 			    
 			// 清空旧的数据    
 			datasource.length = 0;
 			
 			for (var i = 0, len = suggestcyc.length; i < len; i ++) {
 				interval = suggestcyc[i];
 				
 				for (var j = interval[0]; j < interval[1]; j ++) {
 					record = {};
 					record.suggestcyc = j;
 					record.potionalclk = potionalclk[num];
 					record.hotlevel = hotlevel[num];
 					
 					datasource[num] = record;
 					num ++;
 				}
 			}
 			// 设置没有数据显示的话术
 			table.noDataHtml = FILL_HTML.NO_DATA;
 			// 更新表格控件
 			table.render(table.main);
 		},
 		/**
 		 * 销毁推荐时段分析组件
 		 * @method dispose
 		 */
		dispose: function() {
			this.selRecmdTimes.length = 0;
			this._scheduleOptimizer = null;
		}
 	};
 	
 	return RecmdScheduleAnalyze;
 }($$);