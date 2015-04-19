/**
 * @file asset/js/nirvana.js 本地加载之nirvana，核心业务模块
 * 
 * @author Leo Wang(wangkemiao@baidu.com)
 */

// nirvana -- 导航
document.write('<script type="text/javascript" src="src/nirvana/common/navigation.js"></script>');
// nirvana -- copyright
document.write('<script type="text/javascript" src="src/nirvana/common/copyright.js"></script>');
// 权限 -- 包括判断对照组用户的公用方法
document.write('<script type="text/javascript" src="src/nirvana/common/auth.js"></script>');

// nirvana -- auto init
document.write('<script type="text/javascript" src="src/nirvana/init.js"></script>');

/**
 * nirvana - overview 概况页业务模块
 */
document.write('<script type="text/javascript" src="src/nirvana/overview/overview.js"></script>');

document.write('<script type="text/javascript" src="src/nirvana/overview/bizCommon/reminder.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/overview/bizCommon/addFolder.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/overview/bizCommon/addIndexFolder.js"></script>');

document.write('<script type="text/javascript" src="src/nirvana/overview/common/aoPackage.js"></script>');
/** 优化包概况页的引导页和监控 **/
document.write('<script type="text/javascript" src="src/nirvana/overview/common/guide/AoPkgGuideMonitor.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/overview/common/guide/AoPkgGuide.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/overview/common/guide/guide.js"></script>');

document.write('<script type="text/javascript" src="src/nirvana/overview/index.js"></script>');


// nirvana -- manage
// nirvana -- manage -- namespace && module's defination
document.write('<script type="text/javascript" src="src/nirvana/manage/manage.js"></script>');
// nirvana -- manage -- config
document.write('<script type="text/javascript" src="src/nirvana/manage/config/bubble.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/config/externalLink.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/config/LXBStat.js"></script>');

// nirvana -- manage -- common
document.write('<script type="text/javascript" src="src/nirvana/manage/common/manage.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/common/filterControl.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/common/searchShortcut.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/common/batch.js"></script>');
// 管理页自己的各tab通用的面包屑及tab模块
document.write('<script type="text/javascript" src="src/nirvana/manage/common/crumbs.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/common/tab.js"></script>');

// nirvana -- manage -- bizCommon
// 业务 -- 推广管理的工具箱模块
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/ToolsModule.js"></script>');
document.write('<script type="text/javascript" src="src/fclab/module.js"></script>');
document.write('<script type="text/javascript" src="src/fclab/index.js"></script>');


document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/userDefine.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/offlineReason.js"></script>');
// 同类关键词【试试其他关键词】 在快速新建最后一步中有使用
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/similarWords.js"></script>');

document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/region.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/budget.js"></script>');


document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/negative.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/accurateNegative.js"></script>');

// 账户设置相关
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/account/baseSet.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/account/otherSetting.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/account/ipExclusion/ipExclusion.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/account/ipExclusion/advancedIpExclusion.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/account/exactMatchExp.js"></script>');// 精确匹配扩展（地域词扩展）

// plan
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/plan/lib.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/plan/createPlan.js"></script>');

document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/plan/baseSet.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/plan/advancedSet.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/plan/modShowprob.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/plan/setQrstat.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/plan/mPriceFactor.js"></script>');

// unit
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/unit/createUnit.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/unit/rename.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/unit/modUnitPrice.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/unit/phoneTrail.js"></script>');
// keyword
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/keyword/transfer.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/keyword/modWordPrice.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/keyword/modWordUrl.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/keyword/modWordWmatch.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/keyword/moniKeyword.js"></script>');

// idea
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/config/ideaDifference.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/editBasicIdea/config.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/editBasicIdea/lib.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/editBasicIdea/lineBreak.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/editBasicIdea/wildCard.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/editBasicIdea/log.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/editBasicIdea/aoPackage.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/editBasicIdea/edit.js"></script>');

document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/editSimple/editSimple.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/basicIdea/lib.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/basicIdea/modUrl.js"></script>');

//附加创意
document.write('<script type="text/javascript" src="src/core/service/appendIdea.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/appendIdea/appendIdea.js"></script>');

document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/appendIdea/config/config.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/appendIdea/config/copyAppendIdeaDiff.js"></script>');

document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/appendIdea/common/lib.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/appendIdea/common/validator.js"></script>');

document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/appendIdea/copyAppendIdeaLib.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/appendIdea/appendIdeaEditPrototype.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/appendIdea/appIdeaEdit.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/appendIdea/appToMultiEdit.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/appendIdea/sublinkIdeaEdit.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/idea/appendIdea/copyAppendIdea.js"></script>');

//SKR标准关键词推荐模块
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/SKR/KRCore.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/SKR/SKR.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/SKR/search.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/SKR/result.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/SKR/addWords.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/SKR/toolbar.js"></script>');

// monitor
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/monitor/addFolder.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/monitor/addMoniWords.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/bizCommon/monitor/common.js"></script>');



/**
 * new Manage
 */
document.write('<script type="text/javascript" src="src/nirvana/newManage/manage.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/newManage/config/config.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/newManage/common/TableModel.js"></script>');


// nirvana -- manage -- 各个TAB页
document.write('<script type="text/javascript" src="src/nirvana/manage/plan/plan.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/unit/unit.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/keyword/keyword.js"></script>');

// 这里是针对于物料列表tab的创意相关的公共逻辑
document.write('<script type="text/javascript" src="src/nirvana/manage/idea/common/ideaPublic.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/idea/common/ideaLib.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/idea/idea.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/idea/appendIdea.js"></script>');

document.write('<script type="text/javascript" src="src/nirvana/manage/monitor/monitorList.js"></script>');
document.write('<script type="text/javascript" src="src/nirvana/manage/monitor/monitorDetail.js"></script>');
