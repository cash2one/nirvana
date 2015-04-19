/*
 * nirvana Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path: src/debug/nirvana_tpl.js 
 * desc: Nirvana用到的模板的配置，本地测试时候逐一请求所有用到的模板，build的时候会将这些模板打包成一个模板文件:
 *       nirvana_tpl.html
 * date: $Date: 2012/10/12 $
 */
 
er.config.TEMPLATE_LIST = [
// core
'./src/core/bizCommon/idea/idea.html',
'./src/core/ui_1.0/extension/Schedule.html',
'./src/core/ui_1.0/base/TreeView.html',
'./src/core/ui_1.0/extension/Toolbar.html',
'./src/core/ui_1.0/extension/ColorBar/peerBar.html',

// nirvana
'./src/nirvana/overview/index.html',
'./src/nirvana/overview/bizCommon/reminder.html',
'./src/nirvana/overview/bizCommon/addFolder.html',
'./src/nirvana/overview/bizCommon/addIndexFolder.html',
'./src/nirvana/overview/common/guide/guide.html',

'./src/nirvana/manage/common/manage.html',
'./src/nirvana/manage/common/batch.html',
'./src/nirvana/manage/bizCommon/account/account.html',
'./src/nirvana/manage/bizCommon/unit/phoneTrail.html',
'./src/nirvana/manage/bizCommon/keyword/moniKeyword.html',
'./src/nirvana/manage/bizCommon/idea/editSimple/editSimple.html',
'./src/nirvana/manage/bizCommon/idea/appendIdea/copyAppendIdea.html',
'./src/nirvana/manage/bizCommon/idea/appendIdea/appendIdeaEdit.html',

'./src/nirvana/manage/bizCommon/monitor/addFolder.html',
'./src/nirvana/manage/bizCommon/monitor/addMoniWords.html',
'./src/nirvana/manage/bizCommon/SKR/tpl.html',
'./src/nirvana/manage/plan/plan.html',
'./src/nirvana/manage/unit/unit.html',
'./src/nirvana/manage/keyword/keyword.html',
'./src/nirvana/manage/monitor/monitorList.html',
'./src/nirvana/manage/monitor/monitorDetail.html',
'./src/nirvana/manage/idea/idea.html',
'./src/nirvana/manage/idea/appendIdea.html',
// module
'./src/module/history/history.html',
'./src/module/bidEstimator/estimator.html',
'./src/module/adpreview/adpreview.html',
'./src/module/queryReport/queryReport.html',
'./src/module/kr/recommend_word.html',
'./src/module/kr/new/kr.html',
'./src/module/report/report.html',
'./src/module/trans/newtrans.html',
'./src/module/trans/trans.html', 
'./src/module/trans/transcheck.html',
'./src/module/trans/translist.html',
'./src/module/effectAnalyse/effectAnalyse.html',
'./src/module/accountOptimizer/proposal.html',
'./src/module/accountOptimizer/all/widget/widget.html',
'./src/module/accountOptimizer/all/widget/widget_3.html',
'./src/module/accountOptimizer/all/widget/widget_4.html',
'./src/module/accountOptimizer/all/widget/widget_8.html',
'./src/module/accountOptimizer/all/widget/widget_15.html',
'./src/module/accountOptimizer/all/widget/widget_18.html',
'./src/module/accountOptimizer/all/widget/widget_20.html',
'./src/module/accountOptimizer/all/widget/widget_21.html',
'./src/module/accountOptimizer/all/widget/widget_22.html',
'./src/module/marketTrend1.0/index.html',
'./src/module/marketTrend2.0/index.html',
'./src/module/kr/group.html',
'./src/module/quickSetup/tpls/main.html',
'./src/module/quickSetup/tpls/step1.html',
'./src/module/quickSetup/tpls/step2.html',
'./src/module/quickSetup/tpls/step3.html',
'./src/module/aoPackage/aoPackage.html',
'./src/module/aoPackage/detail/aoPkgDetail.html',
'./src/module/aoPackage/decrease/widget.html',
'./src/module/aoPackage/business/widget.html',
'./src/module/aoPackage/quality/widget.html',
'./src/module/aoPackage/corewords/corewordPkg.html',
'./src/module/aoPackage/industry/industryPkg.html',
/* 突降急救包升级的模板 */
'./src/module/aoPackage/emergency/emergencyPkg.html',
/* 编辑计划和单元浮出层模板 */
'./src/module/aoPackage/common/planUnitEdit.html',
/* 添加关键词浮出层模板 */
'./src/module/aoPackage/common/addWord.html',
/* 修改关键词出价浮出层模板 */
'./src/module/aoPackage/common/modBid.html',
/* 修改关键词匹配浮出层模板 */
'./src/module/aoPackage/common/modMatch.html',
/* 新版智能提词包模板 */
'./src/module/aoPackage/recmword2/recmwordPkg.html',
/* 移动优化包模板 */
'./src/module/aoPackage/mobile/widget.html',
/* 行业旺季包模板 */
'./src/module/aoPackage/season/seasonPkg.html',
/* 时段相关的模板 */
'./src/module/schedule/schedule.html',
/* 新账户质量评分的模板 */
'./src/module/accountScore/accountScore.html',

/* 智能消息中心 */
'./src/message/html/message.html',
/* 消息中心的弹出框的模板 */
'./src/message/html/messageBox.html',
'./src/message/html/messagePlans.html',
// 融合
'./src/module/fuseSuggestion/tpl/fuseSuggestion.html',
'./src/module/fuseSuggestion/bizView/bid.html',
'./src/module/fuseSuggestion/bizView/ideaList.html'
];