/*
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path: nirvana/common/PeerBarHelper.js 
 * desc: 同行数据条显示的Bar组件的助手工具类
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2012/10/31 $
 */
/**
 * 同行数据条显示的Bar组件的助手工具类
 * 
 * @class PeerBarHelper
 * @namespace nirvana
 * @static
 */
nirvana.PeerBarHelper = function($) {
	/**
	 * 默认行业包里的Bar的区间颜色以及宽度的定义
	 */
	var DEFAULT_INDUSTRY_PKG_BAR_COLORS = ["#E7F0FF", "#B9D2FE", "#94BAFE"],
	    DEFAULT_INDUSTRY_PKG_BAR_WIDTH = 266;
	    
	/**
	 * Bar的区间颜色、宽度以及最小宽度的定义 
	 */
	var DEFAULT_BAR_COLORS,
	    DEFAULT_BAR_WIDTH,
	    // Bar上区间的最小宽度：36px
	    MIN_INTERVAL_WIDTH = 36;

    var isEmpty = nirvana.util.isEmptyValue;

	/**
	 * 重新计算Bar上各个区间的宽度的大小，保证区间的宽度不小于MIN_INTERVAL_WIDTH
	 * 当前只是简单通过减少最大宽度的区间的大小来补足不足MIN_INTERVAL_WIDTH的区间
	 */
	function resetBarIntervalWidth(widthArr) {
		// 不足MIN_INTERVAL_WIDTH的区间的索引数组
		var resetIdxArr = [],
		    len = widthArr.length,
		    maxIdx = 0,
		    // 不足MIN_INTERVAL_WIDTH的区间数量
		    count = 0;
		    
		for (var i = 0; i < len; i ++) {
			if (widthArr[i] < MIN_INTERVAL_WIDTH) {
				resetIdxArr[count ++] = i;
			}
			
			if (widthArr[i] > widthArr[maxIdx]) {
				maxIdx = i;
			}
		}
		
		if (0 == count || count == len) {
			return;
		}
		 
		var remainNum = 0,
			idx;
			
		for (var j = 0; j < count; j ++) {
			idx = resetIdxArr[j];
			remainNum += MIN_INTERVAL_WIDTH - widthArr[idx];
			widthArr[idx] = MIN_INTERVAL_WIDTH;
		}
		 
		widthArr[maxIdx] = widthArr[maxIdx] - remainNum;
	}
		
	/**
	 * 获取Bar上各个区间宽度所占的宽度大小，单位px，返回值不包括单位 
	 */
	function getBarIntervalWidth(valueArr) {
		var len = valueArr.length;
		
		if (len <= 2) {
			return [DEFAULT_BAR_WIDTH];
		}
		
		var upperLimit = len - 1,
		    rangeValue = valueArr[upperLimit] - valueArr[0],
		    width,
		    total = 0,
		    i = 1,
		    widthArr = [];
		
		if (0 == rangeValue) {
			// 所有指标值都相等
			for (; i < upperLimit; i ++) {
				widthArr[i - 1] = parseInt(DEFAULT_BAR_WIDTH / upperLimit);
				total += widthArr[i - 1];
			}
		} else {
			for (; i < upperLimit; i ++) {
				width = Math.floor((valueArr[i] - valueArr[i - 1])
						* DEFAULT_BAR_WIDTH / rangeValue);
				total += width;
				widthArr[i - 1] = width; 
			}
		}
		
		widthArr[i - 1] = DEFAULT_BAR_WIDTH - total;
		
		// 重新计算bar区间宽度的比例，保证满足最小比例
		resetBarIntervalWidth(widthArr);
		
		return widthArr;
	}
	/**
	 * 获取Bar的Tip的位置，单位px，返回值不包括单位
	 */
	function getBarTipPosition(valueArr, intervalWidthArr, currentValue) {
		// 不存在值信息，直接返回false
		if (isEmpty(currentValue)) {
			return false;
		}
		
		var found = false,
		    index = -1,
		    pos = 0,
		    graduationOffsetArr = [0];
		
		// 根据区间宽度大小，计算刻度距离最左边的偏移量
		for (var i = 1, len = intervalWidthArr.length; i <= len; i ++) {
			graduationOffsetArr[i] = graduationOffsetArr[i - 1]
					+ intervalWidthArr[i - 1];
		}
		    
		for (var i = 0, len = valueArr.length; i < len; i ++) {
			if (currentValue == valueArr[i]) {
				index = i;
				found = true;
				break;
			} else if (currentValue < valueArr[i]) {
				index = i;
				break;
			}
		}
		
		if (found) {
			// 当前值等于刻度上某个值，其位置应指向相应的刻度，即位置为刻度的位置
			pos = graduationOffsetArr[index];
		} else {
			// index == 0, -1 is unexpected!
			if (0 == index) {
				return -1;
			} else if (-1 == index) {
				return DEFAULT_BAR_WIDTH + 1;
			}
			
			// 保证计算出来的位置位于上下限之间
			var upperLimitPos = graduationOffsetArr[index],
		    	lowerLimitPos = graduationOffsetArr[index - 1];
		    	
//		    pos = Math.floor((currentValue - valueArr[0]) * DEFAULT_BAR_WIDTH
//					/ (valueArr[valueArr.length - 1] - valueArr[0]));
		    // 根据值相对于所在区间的位置进行计算Tip的位置，减少偏差，如果区间的宽度不是根据刻度值线性分配的情况
		    pos = Math.floor((currentValue - valueArr[index - 1]) * intervalWidthArr[index - 1]
					/ (valueArr[index] - valueArr[index - 1]));
			pos += lowerLimitPos;
			
			if (pos <= lowerLimitPos) {
				pos = lowerLimitPos + 1;
			} else if (pos >= upperLimitPos) {
				pos = upperLimitPos - 1;
			}
		}
		
		return pos;
	}
	
	/**
	 * 初始化Bar的Tip位置以及Bar上区间大小 
	 * @param {Object} config ColorBar的配置对象
	 * @param {Array} valueArr Bar上的刻度值数组
	 * @param {String|Number|Null|Undefined} currentValue Bar上要显示的值，可能不存在
	 */
	function initBarTipIntervalConfig (config, valueArr, currentValue) {
		currentValue = currentValue && parseInt(currentValue, 10);
		for (var i = 0, len = valueArr.length; i < len; i ++) {
			valueArr[i] = parseInt(valueArr[i], 10);
		}
		
		// 初始化区间的比例
		var intervalWidthArr = getBarIntervalWidth(valueArr),
		    intervalArr = config.intervals;
		
		for (var i = 0, len = intervalArr.length; i < len; i ++) {
			intervalArr[i].percent = intervalWidthArr[i] + "px";
		}
		
		// 初始化Tip的位置
		config.tipPosition = getBarTipPosition(valueArr, intervalWidthArr, currentValue);
	} 
	
	/**
	 * 检查给定的值区间是否有效
	 * @return {Boolean} 
	 */
	function isValueRangeValidate(valueRange) {
		var validate = true;
		// 要求值是数组且大小为4    
		if ((valueRange instanceof Array) && 4 == valueRange.length) {
			for (var i = 0; i < 4; i ++) {
				// 要求值不为空，且数组元素的值是非严格递增的
				validate = validate && (!isEmpty(valueRange[i]));
				validate = validate && ((3 == i) || (parseInt(valueRange[i],10) <= parseInt(valueRange[i+1],10)));
			}
		} else {
			validate = false;
		}
	    return validate;
	}

	var Helper = {
		/**
		 * 获取Bar的配置，当前处理的值只能是时间（12:33），数字（带百分数应单独提取出来，作为suffix参数传递）
		 * @method getColorBarConfig
		 * @static 
		 * @param {Number} typeId bar类型的ID,见{@link nirvana.PeerDataBar}的类型定义
		 * @param {String} title ColorBar最左边的标题信息
		 * @param {Number} value 当前bar上显示的值，对于时间传递的值为其等价的秒数的数值，不存在该值，传null/undefined
		 * @param {Array} valueRange 显示在Bar上的刻度的值，数组元素顺序和Bar上刻度顺序保持一致
		 * @param {String} suffix 附加在值后面的值后缀，比如'%'或者单位'次'/'秒'，不存在该值，传null/undefined
		 * @param {Boolean} isTime Bar上显示的值是否是时间相关，其界面上显示格式为'xx:xx'，默认false
		 * @return {Object} ColorBar的配置对象
		 */
		getColorBarConfig: function (typeId, title, value, valueRange, suffix, isTime) {
			if (!isValueRangeValidate(valueRange)) {
				return null;
			}
			
			var config = {
				//id: id,
				title : title,
				barWidth : DEFAULT_BAR_WIDTH + 'px',
				intervals : [],
				graduations : []
			};

			// 重置其真实的指标项的值
            value = Helper.getRealValue(value, typeId);
			// 初始化值
			var barValue = null;

			if (!isEmpty(value)) {
				barValue = isTime ? nirvana.date.parseSecondsToTime(value) : value;
				barValue = suffix ? (barValue + suffix) : barValue;
			}
			config.value = barValue;
			
			// 初始化区间的配置
			var intervals = config.intervals;
			for (var i = 0, len = DEFAULT_BAR_COLORS.length; i < len; i ++) {
				intervals[i] = {
					color : DEFAULT_BAR_COLORS[i]
				};
			}
			
			// 初始化刻度信息
			var graduations = config.graduations,
			    len = valueRange.length,
			    graduationValue;
			for (var i = 0; i < len; i ++) {
				graduationValue = isTime ? nirvana.date.parseSecondsToTime(valueRange[i]) : valueRange[i];
				graduationValue = suffix ? (graduationValue + suffix) : graduationValue;
				graduations[i] = {
					value : graduationValue
				};
			}
			
			// 对于网站打开时间，不显示平均值、良好值话术
            var isSiteOpenRate = (typeId === nirvana.PeerDataBar.SITE_OPEN_RATE);
			if (!isSiteOpenRate && len >= 3) {
				// 当前业务逻辑下，假定给定值长度不小于3，都有如下的刻度标签
				graduations[1].note = "平均值";
				graduations[2].note = "良好值";
			}
			
			// 初始化Bar上Tip的位置信息以及区间的宽度信息
			initBarTipIntervalConfig(config, valueRange, value);
			
			return config;
		},
        /**
         * 是否未安装百度统计，用于网站打开时间和网站吸引力指标的值
         * @method isUnInstallBaiduStatistic
         * @param {Number} value 网站打开时间或者网站吸引力用户的指标值
         * @param {Number} dataType bar类型的ID,见{@link nirvana.PeerDataBar}的类型定义
         * @return {Boolean}
         */
        isUnInstallBaiduStatistic: function(value, dataType) {
            var Bar = nirvana.PeerDataBar;
            if (dataType === Bar.SITE_ATTRACTIVE || dataType === Bar.SITE_OPEN_RATE) {
                // 如果拿不到用户的数据返回-1，则认为用户未正确安装
                return !isEmpty(value) && (value < 0);
            }
            return false;
        },
        /**
         * 是否没有重点词，如果重点词排名得分为零或者没有返回相应指标项的值意味着没有重点词
         * @method isNoCorewords
         * @param {Number} value 重点词排名指标用户的值
         * @param {Number} dataType bar类型的ID,见{@link nirvana.PeerDataBar}的类型定义
         * @return {Boolean}
         */
        isNoCorewords: function(value, dataType) {
            if (dataType === nirvana.PeerDataBar.COREWORD_RANK
                && ((isEmpty(value) || (0 == +value)))) {
                return true;
            } else {
                return false;
            }
        },
        /**
         * 由于对于一些特殊指标，其返回的值有的是用于表示特定含义，比如网站打开时间/网站吸引力的指标值，
         * 后端返回值-1表示未安装百度统计，但其实际的指标值是null。对于重点词排名，如果其值为0，等价于null。
         * @method getRealValue
         * @param {Number} value 网站打开时间或者网站吸引力用户的指标值
         * @param {Number} dataType bar类型的ID,见{@link nirvana.PeerDataBar}的类型定义
         * @return {Number|null}
         */
    	getRealValue: function(value, dataType) {
            if (Helper.isUnInstallBaiduStatistic(value, dataType)) {
                return null;
            } else if (Helper.isNoCorewords(value, dataType)) {
                return null;
            } else {
                return value;
            }
        }
	};
	
    var PeerBarHelper = {
    	/**
    	 *  获取ColorBar的助手工具类
    	 *  @method getHelper
    	 *  @static 
    	 *  @param {Number} barWidth 要显示的Bar的宽度，单位px，未设置，默认266
    	 *  @param {Number} barColors 要显示的Bar的区间的颜色数组，未设置，默认值同行业包的Bar的颜色：
    	 *                            ["#E7F0FF", "#B9D2FE", "#94BAFE"]
    	 *  @return {Object} Bar助手的工具类对象，可用用法:
    	 *                   getColorBarConfig，isUnInstallBaiduStatistic, getRealValue 具体参数说明见该方法的定义
    	 */
    	getHelper: function(barWidth, barColors) {
    		if (typeof barWidth == 'number' && barWidth > 0) {
    			DEFAULT_BAR_WIDTH = barWidth;
    		} else {
    			DEFAULT_BAR_WIDTH = DEFAULT_INDUSTRY_PKG_BAR_WIDTH;
    		}
    		
    		if (barColors instanceof Array && barColors.length > 0) {
    			DEFAULT_BAR_COLORS = barColors;
    		} else {
    			DEFAULT_BAR_COLORS = DEFAULT_INDUSTRY_PKG_BAR_COLORS;
    		}
    		
    		return Helper;
    	}
    };
    
	return PeerBarHelper;
}($$);