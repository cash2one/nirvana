/**
 * @file     lib.js
 * @path:    nirvana/manage/bizCommon/plan/lib.js
 * @desc:    计划的公用工具方法
 * @author:  yanlingling@baidu.com
 */

manage.planLib = (function() {
	
	/**
	 *设置按钮的是否可用状态 
	 */
    var setButton = function(buttons,enable){
    	for(var i=0;i<buttons.length;i++){
    		ui.util.get(buttons[i]).disable(enable);
    	}
    };
	return {
        
		/**
		 * 检查出价比
		 * param {array} relationButton 出价比不合法时，相应灰色的提交按钮
		 */
		checkPriceFactor : function(relationButton) {
			
			return function() {
				var max = nirvana.env.MPRICEFACTOR_RANGE.max.toFixed(2);
				var min = nirvana.env.MPRICEFACTOR_RANGE.min.toFixed(2);
				var text = trim(ui.util.get('plan-iterator').getValue());
				var value = 9999;
				
				if(text != '') {//输入为空的时候parseNumber就转为0 了
					var value = parseNumber(text);
				}
                baidu.g('mobilePrice').innerHTML = value.toFixed(2);
				var arr = (value + '').split('.');

				if(baidu.getStyle(baidu.g('planPriceFactor'), 'display') != 'none') {
					if((!value && value != 0) || value > max || value < min || (arr[1] && arr[1].length > 2)) {
						baidu.g('priceFactorTip').innerHTML = '请输入' + min + '~' + max + '之间，保留2位小数的数值';
						baidu.setStyle(baidu.g('priceFactorTip'), 'visibility', 'visible');
						setButton(relationButton,true);
						baidu.addClass('priceFactorTip','red');
						baidu.addClass('price-compute','hide');//输入不对的时候，不显示出价比示例
					} else if(value > 1) {
						baidu.g('priceFactorTip').innerHTML = '如果移动设备上的关键词出价高于999.99元，则采用999.99元。';
						baidu.setStyle(baidu.g('priceFactorTip'), 'visibility', 'visible');
						setButton(relationButton,false);
						baidu.removeClass('price-compute','hide');
						baidu.removeClass('priceFactorTip','red');
					} else {
						baidu.setStyle(baidu.g('priceFactorTip'), 'visibility', 'hidden');
						setButton(relationButton,false);
						baidu.removeClass('price-compute','hide');
					}
				}
			}
		}
	}

})();
