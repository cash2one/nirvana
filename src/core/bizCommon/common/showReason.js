/**
 * 展现理由相关
 * 
 * @author zhujialu
 * @update 2012/10/12
 */
fc.common.ShowReason = function() {
    
    var Icon = fc.common.Icon;

	return {
		/**
		 * 展现理由的字面
		 */
		TEXT: '展现理由',
		
		/**
		 * 通过展现理由的字面获得对应的图标
		 * 返回图标的HTML代码段
		 * @method getIcon
		 * @param {String} text
		 * @return {String}
		 */
		getIcon: function(text) {
			var ret = '';
			switch (text) {
				case '黑马':
                    ret = Icon.getIcon(Icon.SHOW_REASON_DARKHORSE);
					break;
				case '百度相关搜索':
                    ret = Icon.getIcon(Icon.SHOW_REASON_BAIDU);
					break;
				case '潜在客户':
                    ret = Icon.getIcon(Icon.SHOW_REASON_POTENTIAL);
					break;
				case '同行动态':
                    ret = Icon.getIcon(Icon.SHOW_REASON_SAMEINDUSTRY);
					break;
				case '我的选择':
                    ret = Icon.getIcon(Icon.SHOW_REASON_MYCHOICE);
					break;
				case '搜索建议词':
                    ret = Icon.getIcon(Icon.SHOW_REASON_SUGGESTION);
					break;
				case '网页相关词':
                    ret = Icon.getIcon(Icon.SHOW_REASON_PAGE);
					break;
                case '移动推广词':
                    ret = Icon.getIcon(Icon.SHOW_REASON_LOCAL);
                    break;
			}
			return ret;
		}
	};
	
}();
