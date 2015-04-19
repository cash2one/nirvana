/**
 * 各种错误信息
 * 这里又分两种：
 * 1. 纯文本
 * 2. HTML代码段
 * 
 * @author zhujialu
 * @update 2012/10/23
 */
fc.common.Error = function() {
    
    // ================================================= 关键词相关 ==================================================
    var KEYWORD = { };

    // 保存关键词，这里没有的话术表示话术由后端提供
    var KEYWORD_SAVE = {
        'default'    : '添加关键词失败，请检查您输入的关键词是否有效',

        '4'          : '权限异常',
        '633'        : '匹配模式不正确',
        '635'        : '计划和单元层级的否定/精确否定关键词中存在该关键词',
        '636'        : '关键词在本单元已经存在',
        '637'        : '每个关键词的长度最长为' + Math.ceil(fc.common.Config.KEYWORD.MAX_LENGTH / 2) + '个汉字或' + fc.common.Config.KEYWORD.MAX_LENGTH + '个英文',
        '638'        : '关键词不能为空',
        '639'        : '未选择关键词',	// KR 远征
        '641'        : '本单元的关键词数达到上限',
        '642'        : '单次添加关键词数量不得超出100个',
        '643'        : '所指定的计划不存在',
        '511'        : '所指定的单元不存在',
        '644'        : '计划和单元层级的否定/精确否定关键词中存在该关键词',
        '671'        : '关键词访问URL长度不能超过1024个字符',
        'exceed'     : '关键词输入数量不得超过' + fc.common.Config.KEYWORD.MAX_INPUT + '个',
        'upperlimit' : '抱歉，目前推广单元下的关键词数量已经达到了上限，无法创建新的关键词',

        /**
         * 获得显示错误信息的HTML代码段
         * 此方法专为 fc.common.keyword.save() 的 onFail(json, keywords) 设计
         * 只要传入第2个参数 keywords 就能获得完整的错误文本
         *
         * 如果其他地方要用，请先联系 zhujialu@baidu.com
         *
         * @Method KEYWORD.SAVE.getText
         * @param {Object} keywords
         * @return {String}
         */
        getText: function(keywords) {
            var ret = '', item;
            for (var key in keywords) {
                ret += '<p>' +
                            '<strong>关键词：' + baidu.encodeHTML(key) + '</strong>  ' + 
                            '<span class="warn"> ' + keywords[key] + '</span>' +
                        '</p>';
            }
            return ret || KEYWORD_SAVE['default'];
        }
    };

    KEYWORD.SAVE = KEYWORD_SAVE;

    return {
        KEYWORD: KEYWORD
    };

}();
