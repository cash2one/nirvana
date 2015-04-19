/**
 * @file cpa逻辑文件
 * @author guanwei01@baidu.com
 */

fclab = fclab || {};
fclab.cpa = fclab.cpa || {};
// 存储数据用
fclab.cpa.cache = fclab.cpa.cache || {};

// 添加计划弹出浮层
fclab.cpa.addCpa = function() {
    // 打开子action
    nirvana.util.openSubActionDialog({
        id: 'createCpa',
        title: fclab.cpa.config.hints[200],
        width: 552,
        actionPath: 'fclab/cpa/addcpa'
    });
};

// 每一个模块函数需要前置调用的
fclab.cpa.beforeSwitchTab = function(stat) {
    // 切换class
    var target = baidu.dom.g('cpa-header-' + stat);
    var lis = target
        .parentNode
        .getElementsByTagName('li');
    // 恢复原始
    for(var i = 0, len = lis.length; i < len; i ++) {
        lis[i].className = '';
    }
    // 更新当前
    target.className = 'current';
    // 更新模板
    baidu.dom.g('cpa-content-container')
        .innerHTML = er.template.get('fclabCpa' + stat);
};

// 切换tab
fclab.cpa.switchTab = function(e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    if(target.tagName.toLowerCase() == 'li') {
        if(target.className == 'current') 
            return;
        // 分发动作
        var stat = target.getAttribute('stat');
        // 执行模块函数
        // try {
            fclab.cpa[stat]();
        // } catch(e) {}
    }
};

// cpa初始化函数
fclab.cpa.init = function() {
    // 绑定事件
    baidu.event.on(
        'CreateNewCpa',
        'click',
        fclab.cpa.addCpa
    );
    // 导航栏绑定事件
    baidu.event.on(
        'cpa-header-tab',
        'click',
        fclab.cpa.switchTab
    );
    // 默认打开后显示工具设置
    var stat = 'Tools';
    // 执行模块函数
    try {
        fclab.cpa[stat]();
    } catch(e) {}
};