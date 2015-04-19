/**
 * Created with JetBrains WebStorm.
 * User: wangshiying
 * Date: 13-5-21
 * Time: 下午2:22
 * To change this template use File | Settings | File Templates.
 */



//获取vpunish是不是可以显示getVpunishStatus
Requester.debug.GET_fengchao_punish_cost = function(level, param) {
    var rel = new Requester.debug.returnTpl();
    rel.data.hasAuth = true;
    rel.data.percent = "22";
    rel.data.todayCost = "222";
    rel.data.totalCost = "2222";
    return rel;
};

//获取vpunish是不是可以显示getVpunishStatus
Requester.debug.GET_fengchao_punish_info = function(level, param) {
    var rel = new Requester.debug.returnTpl();
    rel.data = {
        todayCost: param.level == 'useracct' ? 1000 : (100 + kslfData++)
    };
    return rel;
};
