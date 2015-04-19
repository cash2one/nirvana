/**
 * Created with JetBrains WebStorm.
 * User: wangshiying
 * Date: 13-5-21
 * Time: 下午1:39
 * To change this template use File | Settings | File Templates.
 */

/**
 * fbs.trans
 * 转化相关接口
 * @author wangzhishou@baidu.com wanghuijun@baidu.com
 */

fbs = fbs || {};

fbs.vpunish = {};

fbs.vpunish.getVpunishStatus = fbs.interFace({
    path: 'GET/fengchao/punish/cost'
});

fbs.vpunish.getVpunishInfo = fbs.interFace({
    path: 'GET/fengchao/punish/info'
});