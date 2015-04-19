/**
 * @file 定义cpa工具fbs接口
 * @author guanwei01@baidu.com
 */

fbs = fbs || {};
fbs.cpa = {};

/**
 * 获取计划列表（四种转化类型的全部数据）
 */
fbs.cpa.getPlans = fbs.interFace({
    // 不需要特殊参数
    path: "lab/GET/cpa/planlist"
});

/**
 * 新增cpa
 */
fbs.cpa.addCpa =  fbs.interFace({
    path: "lab/ADD/cpa",
    
    // 必要参数 
    necessaryParam: {
        // userid: 121, // 用户id（可有可无）
        // type: 1,     //1/2/4/8/16 二跳/holmes网页转化/商桥/百度游戏/其他
        // planids: {1:[1,2,3]}, // 计划id列表
        cpa: 12,          // null/12.1 - 系统自动设置/用户自定义cpa
        ab: 0,              // 0/1 启用小流量/不启用小流量
        force: 1            // 0/1 - 删除ab关键词/提示用户删除ab关键词
        // force需要注意，第一次请求为1，若用户点击确认则再次请求的时候为0
    }
});

/**
 * 获取cpa计划列表
 */
fbs.cpa.getCpas = fbs.interFace({
    path: "lab/GET/cpainfolist",
    
    necessaryParam: {
        pageno: 0, // 当前页，从0开始
        limit: 10  // 每页显示页数，默认为10
    }
});

/**
 * 修改cpa出价
 */
fbs.cpa.editBid = fbs.interFace({
    path: "lab/MOD/cpaprice",
    
    necessaryParam: {
        labid2cpa: {} // null表示系统
    }
});

/**
 * 修改小流量状态
 */
fbs.cpa.editXll = fbs.interFace({
    path: "lab/MOD/cpa/ab",
    
    necessaryParam: {
        labid: 212,
        isab: 0 //[0/1 – 开启/关闭]
    }
});

/**
 * 删除cpa计划
 */
fbs.cpa.deleteCpa = fbs.interFace({
    path: "lab/DEL/cpa",
    
    necessaryParam: {
        labid: []
    }
});

/**
 * 获取计划列表（有无对比）数据
 */
fbs.cpa.getCpaPlanReports = fbs.interFace({
    path: "lab/GET/report/cpa",
    
    necessaryParam: {
        reporttype: 1,
        startime: '2013-01-01',
        endtime: '2013-01-01',
        isrelativetime: 0,
        relativetime: 5,
        timedim: 3,
        firstday: 5,
        // 下面的参数是有对比时间段的时候
        ostartime: '2013-01-01',
        oisrelativetime: 1, // 始终是相对（后端在无对比的时候会忽略该值）
        orelativetime: 4
    }
});

/**
 * 获取小流量数据
 */
fbs.cpa.getCpaXllReports = fbs.interFace({
    path: "lab/GET/report/cpaab",
    
    necessaryParam: {
        reporttype: 3, // 就是3
        timedim: 8, // 默认(汇总)
        start: 0, // 起始index（变化）
        step: 5 // 默认就是5个数据吧
    }
});

/**
 * 获取历史删除记录
 */
fbs.cpa.getCpaHistory = fbs.interFace({
    path: "lab/GET/cpahistory",
    
    necessaryParam: {
        pageno: 0, // 当前页，从0开始
        limit: 10 // 分页中，每页最大数目（默认就是10）
    }
});