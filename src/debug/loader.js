/**
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file   模块加载器 用户本地调试
 * @author 王辉军(wanghuijun@baidu.com)
 * @date   2012/11/30
 */

/**
 * 模块加载器
 * 本来想命名为requiredJs，为了避免与模块加载器RequireJS混淆，取名为loader
 *
 * @param  {string} moduleName 模块名称
 * @return {Array}  arrJs      模块需要的js文件列表
 */
nirvana.loader = function(moduleName) {
	var arrJs = [];

    switch (moduleName) {
        // 手动版优化建议和效果突降
        case 'proposal' :
        case 'decrease' :
            arrJs.push('src/module/accountOptimizer/all/lib_ao.js');
            arrJs.push('src/module/accountOptimizer/all/lib_widget.js');
            arrJs.push('src/module/accountOptimizer/all/action.js');
            arrJs.push('src/module/accountOptimizer/all/materialList.js');
            arrJs.push('src/module/accountOptimizer/all/folderList.js');
            arrJs.push('src/module/accountOptimizer/all/selectedList.js');
            arrJs.push('src/module/accountOptimizer/all/propset.js');
            arrJs.push('src/module/accountOptimizer/all/widget/widget.js');
            arrJs.push('src/module/accountOptimizer/all/widget/widget_3.js');
            arrJs.push('src/module/accountOptimizer/all/widget/widget_4.js');
            arrJs.push('src/module/accountOptimizer/all/widget/widget_8.js');
            arrJs.push('src/module/accountOptimizer/all/widget/widget_13.js');
            arrJs.push('src/module/accountOptimizer/all/widget/widget_14.js');
            arrJs.push('src/module/accountOptimizer/all/widget/widget_15.js');
            arrJs.push('src/module/accountOptimizer/all/widget/widget_18.js');
            arrJs.push('src/module/accountOptimizer/all/widget/widget_20.js');
            arrJs.push('src/module/accountOptimizer/all/widget/widget_21.js');
            arrJs.push('src/module/accountOptimizer/all/widget/widget_22.js');
            arrJs.push('src/module/accountOptimizer/decrease/lib_decrease.js');
            arrJs.push('src/module/accountOptimizer/decrease/action.js');
            // arrJs.push('src/module/accountOptimizer/decrease/propset.js');
            break;
		case 'msgcenter':
			arrJs.push('src/core/service/message.js');
			arrJs.push('src/message/msgInit.js');
			arrJs.push('src/message/msgConfig.js');
            arrJs.push('src/message/msgEventUtil.js');
			arrJs.push('src/message/msgUtil.js');
			arrJs.push('src/message/summary.js');
			arrJs.push('src/message/miptList.js');
		    arrJs.push('src/message/msgCenter/messageBox.js');
            arrJs.push('src/message/msgCenter/messagePlans.js');
			break;
		//凤巢实验室，add by zhouyu
		case "fclab":
			arrJs[0] = [];
			arrJs[0].push('src/fclab/service/fclab.js');
			arrJs[0].push('src/fclab/service/abtest.js');
            // cpa接口定义
            arrJs[0].push('src/fclab/service/cpa.js');
			
            arrJs[0].push('src/fclab/common/labLib.js');
            arrJs[0].push('src/fclab/common/labFail.js');
            arrJs[0].push('src/fclab/common/labSide.js');
            arrJs[0].push('src/fclab/common/labNav.js');
            arrJs[0].push('src/fclab/common/feedback.js');
            arrJs[0].push('src/fclab/common/bubbleSource.js');
			
            arrJs[0].push('src/fclab/ui/chosenBar.js');
            arrJs[0].push('src/fclab/ui/slideBar.js');
            arrJs[0].push('src/fclab/home/home.js');
            arrJs[0].push('src/fclab/abtest/abtest.js');
            arrJs[0].push('src/fclab/abtest/util.js');
			
			arrJs[1] = [];
            arrJs[1].push('src/fclab/abtest/createTest/create.js');
            arrJs[1].push('src/fclab/abtest/createTest/step1.js');
            arrJs[1].push('src/fclab/abtest/createTest/step2.js');
            arrJs[1].push('src/fclab/abtest/createTest/step3.js');
            arrJs[1].push('src/fclab/abtest/createTest/save.js');
            arrJs[1].push('src/fclab/abtest/createTest/start.js');
            arrJs[1].push('src/fclab/abtest/report/mtllist.js');
            arrJs[1].push('src/fclab/abtest/report/fields.js');

            // 新增cpa逻辑
            arrJs[1].push('src/fclab/cpa/config.js');
            arrJs[1].push('src/fclab/cpa/cpa.js');
            arrJs[1].push('src/fclab/cpa/addCpa.js');
            arrJs[1].push('src/fclab/cpa/cpaTools.js');
            arrJs[1].push('src/fclab/cpa/cpaReports.js');
			break;
    }

    return arrJs;
};