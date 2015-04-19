/**
 * @file asset/js/core.js 本地加载之core
 * 
 * @author Leo Wang(wangkemiao@baidu.com)
 */

/**
 * core - lib 外部库
 */
document.write('<script type="text/javascript" src="src/core/lib/sizzle.js"></script>');
document.write('<script type="text/javascript" src="src/core/lib/tangram-1.3.1.js"></script>');
document.write('<script type="text/javascript" src="src/core/lib/tangram-fx.js"></script>');
document.write('<script type="text/javascript" src="src/core/lib/er.js"></script>');

/**
 * core - loader 下一步就是直接抽离为单独模块
 */
// 外部库
document.write('<script type="text/javascript" src="src/loader/LAB.src.js"></script>');
// 另一个库，多类型文件加载器
document.write('<script type="text/javascript" src="src/loader/FileLoader.js"></script>');
// 默认loader，并作为全局namespace定义文件
document.write('<script type="text/javascript" src="src/loader/loader.js"></script>');
// 另一个loader
document.write('<script type="text/javascript" src="src/loader/newloader.js"></script>');


/**
 * core - config 全局配置
 */
// core -- 基础配置
// todo -- 未来把这个config需要拆分，模块里的config在具体的模块中配置，这里只保留框架需要的配置
document.write('<script type="text/javascript" src="src/core/config/config.js"></script>');
// 框架 -- 模块声明配置
document.write('<script type="text/javascript" src="src/core/config/modulesConfig.js"></script>');



/**
 * core - service 服务层
 */
// namespace
document.write('<script type="text/javascript" src="src/core/service/fbs.js"></script>');
// config
document.write('<script type="text/javascript" src="src/core/service/config.js"></script>');
// common
document.write('<script type="text/javascript" src="src/core/service/common/Request.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/common/Requester.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/common/util.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/common/validate.js"></script>');
// main
document.write('<script type="text/javascript" src="src/core/service/request.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/interface.js"></script>');
// 具体
// TODO: 拆分至各个模块中
document.write('<script type="text/javascript" src="src/core/service/material.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/account.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/plan.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/unit.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/keyword.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/idea.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/appendIdea.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/announce.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/remind.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/history.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/sidenav.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/estimator.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/queryReport.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/report.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/avatar.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/kr.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/trans.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/vpunish.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/effectAnalyse.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/noun.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/batch.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/accountOptimizer.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/marketTrend.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/aoDecrease.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/quickSetup.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/aoPackage.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/index.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/vega.js"></script>');
document.write('<script type="text/javascript" src="src/core/service/fuseSuggestion.js"></script>');


/**
 * core - common 公用方法及辅助工具【基础】
 */
// 全局基础方法
document.write('<script type="text/javascript" src="src/core/common/number.js"></script>');
document.write('<script type="text/javascript" src="src/core/common/string.js"></script>');
document.write('<script type="text/javascript" src="src/core/common/date.js"></script>');
document.write('<script type="text/javascript" src="src/core/common/ue.js"></script>');
document.write('<script type="text/javascript" src="src/core/common/storage.js"></script>');
document.write('<script type="text/javascript" src="src/core/common/swf.js"></script>');
// namespace lib
document.write('<script type="text/javascript" src="src/core/common/tpl.js"></script>');
document.write('<script type="text/javascript" src="src/core/common/delegate.js"></script>');
// namespace fc
document.write('<script type="text/javascript" src="src/core/common/fc.js"></script>');
// nirvana.util namespace
document.write('<script type="text/javascript" src="src/core/common/utilities.js"></script>');
document.write('<script type="text/javascript" src="src/core/common/util.js"></script>');
// nirvana.*
document.write('<script type="text/javascript" src="src/core/common/event.js"></script>');
document.write('<script type="text/javascript" src="src/core/common/listener.js"></script>');
document.write('<script type="text/javascript" src="src/core/common/attrHelper.js"></script>');


/**
 * core -- bizCommon 公用业务模块
 */
// need a namespace
// config 这个实际上是bizCommon的config
document.write('<script type="text/javascript" src="src/core/bizCommon/config/commonConfig.js"></script>');
document.write('<script type="text/javascript" src="src/core/bizCommon/config/error.js"></script>');

// common bizCommon的公共方法，不应该直接使用这些，而是去使用模块
document.write('<script type="text/javascript" src="src/core/bizCommon/common/fields.js"></script>');
document.write('<script type="text/javascript" src="src/core/bizCommon/common/icon.js"></script>');
document.write('<script type="text/javascript" src="src/core/bizCommon/common/showReason.js"></script>');
// 一个业务小模块的工厂方法
document.write('<script type="text/javascript" src="src/core/bizCommon/common/factory.js"></script>');
// 提供值验证的工具方法
document.write('<script type="text/javascript" src="src/core/bizCommon/common/validate.js"></script>');
// 业务相关工具方法
document.write('<script type="text/javascript" src="src/core/bizCommon/common/bizUtil.js"></script>');
// 表格相关工具方法
document.write('<script type="text/javascript" src="src/core/bizCommon/common/tableUtil.js"></script>');

// 模块们，应该直接调用这些东西
// 被放在文件夹中，往往是“层级”模块，其包含的方法较多
document.write('<script type="text/javascript" src="src/core/bizCommon/unit/unit.js"></script>');
document.write('<script type="text/javascript" src="src/core/bizCommon/idea/idea.js"></script>');
document.write('<script type="text/javascript" src="src/core/bizCommon/keyword/keyword.js"></script>');
// 推广地域
document.write('<script type="text/javascript" src="src/core/bizCommon/region.js"></script>');
// 质量度信号灯
document.write('<script type="text/javascript" src="src/core/bizCommon/qStar.js"></script>');




/**
 * core -- UI1.0
 */
// 基础支持，与ER融合
document.write('<script type="text/javascript" src="src/core/ui_1.0/common/UIAction.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/common/UIAdapter.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/common/Validator.js"></script>');
// namespace && 基类
document.write('<script type="text/javascript" src="src/core/ui_1.0/ui.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/UIBase.js"></script>');
// base 核心基础控件
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/Label.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/BoxGroup.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/BaseBox.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/CheckBox.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/Radio.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/Button.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/Mask.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/Select.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/TextInput.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/TextLine.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/Dialog.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/Table.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/TreeView.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/List.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/Page.js"></script>');

document.write('<script type="text/javascript" src="src/core/ui_1.0/base/Tab.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/FormTab.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/Accordion.js"></script>');

document.write('<script type="text/javascript" src="src/core/ui_1.0/base/Bubble.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/base/Flash.js"></script>');

// extension 业务扩展控件
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/MonthView.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/MiniMultiCalendar.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/MultiCalendar.js"></script>');

document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/ColorBar/ColorBar.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/ColorBar/PeerBarHelper.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/ColorBar/PeerDataBar.js"></script>');

document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/CustomDialog.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/Guide.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/InterlockingBox.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/Iterator.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/Loading.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/Match.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/Popup.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/MsgPopup.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/Region.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/Schedule.js"></script>');

document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/SearchCombo.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/MaterialLevel.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/SelectCombo.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/SelectList.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/MaterialSelect.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/AvatarMaterial.js"></script>');

document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/SideNav.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/SliderMarquee.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/Suggestion.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/Tip.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/Title.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/ToolBar.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.0/extension/TopN.js"></script>');


/**
 * core -- UI1.1
 */
// namespacce && 基类
document.write('<script type="text/javascript" src="src/core/ui_1.1/ui.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/Base.js"></script>');

// base
document.write('<script type="text/javascript" src="src/core/ui_1.1/base/AbstractButton.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/base/Button.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/base/Layer.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/base/Bubble.js"></script>');

document.write('<script type="text/javascript" src="src/core/ui_1.1/base/List.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/base/Popup.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/base/ComboBox.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/base/Input.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/base/TextLine.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/base/Marquee.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/base/Suggestion.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/base/Table.js"></script>');

// core -- bubble统一配置
document.write('<script type="text/javascript" src="src/core/ui_1.1/config/BubbleSourceConfig.js"></script>');

// extension
document.write('<script type="text/javascript" src="src/core/ui_1.1/extension/CustomColumn.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/extension/ValueEditor.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/extension/SeedMarquee.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/extension/MaterialMarquee.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/extension/RegionLayer.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/extension/RegionSelector.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/extension/DownloadButton.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/extension/SaveButton.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/extension/PlanUnitSelector.js"></script>');
document.write('<script type="text/javascript" src="src/core/ui_1.1/extension/Filter.js"></script>');
/**
 * core -- 监控
 */
document.write('<script type="text/javascript" src="src/core/behavior/behavior.js"></script>');

/**
 * ACC -- 账户权限中心
 */
document.write('<script type="text/javascript" src="src/core/acc/acc.js"></script>');
document.write('<script type="text/javascript" src="src/core/acc/config/authConfig.js"></script>');
document.write('<script type="text/javascript" src="src/core/acc/config/customService.js"></script>');
document.write('<script type="text/javascript" src="src/core/acc/config/moduleConfig.js"></script>');

document.write('<script type="text/javascript" src="src/core/acc/common/AccService.js"></script>');
document.write('<script type="text/javascript" src="src/core/acc/common/EntranceProcessor.js"></script>');

/**
 * core -- 调试层
 */
// 注意 -- 打包工具中需要将此文件过滤
document.write('<script type="text/javascript" src="src/debug/debug.js"></script>');