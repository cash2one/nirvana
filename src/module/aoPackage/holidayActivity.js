/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * 弹窗提醒相关的控制函数公用函数库 
 *
 * @file aoPackage/lib_popup.js 
 * @author: Leo Wang(wangkemiao@baidu.com)
 * @date: 2012/12/04 $
 * 这个文件当前暂时从module.js移除 by Huiyao,由于这个功能已经下掉了，这个文件暂时保留
 * @deprecated
 */

/**
 * 优化包节日活动处理模块
 */
nirvana.aoPkgControl.holidayActivity = (function(){
    var _data = {};
    var cache = {
        set: function(key, val) {
            _data[key] = val;
        },
        get: function(key){
            return _data[key]
        },
        clear: function(){
            _data = {};
        }
    };

    var holidays = {
        christmas: {
            check: function(date) {
                return (date >= holidays.christmas.start 
                    && date <= holidays.christmas.end);
            },
            start: new Date('2012/12/18 00:00:00'),
            end: new Date('2012/12/30 23:59:59'),
            url: 'http://promote.baidu.com/gift/index.html#/activity/info~id=1',
            process: function(entrance, pkgId) {
                var isKA = cache.get('isKA');

                if('undefined' == typeof isKA){
                    var param = {};
                    // 定义请求成功的回调函数
                    param.onSuccess = function(response){
                        if(response && response.data){
                            var data = response.data;
                            var aostatus = data.aostatus;
                            var auth;
                            if (typeof data.auth === 'string') {
                                auth = baidu.json.parse(data.auth);
                            }
                            else if (data.auth instanceof Array) {
                                auth = data.auth;
                            }
                            else {
                                auth = [];
                            }
                            var checknum = 25; 
                            if (baidu.array.indexOf(auth, checknum) != -1) {
                                processDisplay.christmas(entrance, pkgId);
                                cache.set('isKA', true);
                            }
                        }
                    };

                    // 定义请求失败的回调函数
                    param.onFail = function() {};
                    
                    // 发送数据请求，接口定义{@link baseService/aoPackage.js}
                    fbs.nikon.getNikonPkgauth(param);
                }
                else{
                    if(isKA){
                        processDisplay.christmas(entrance, pkgId);
                        cache.set('isKA', isKA);
                    }
                }
            }
        }
    };

    var processDisplay = {
        christmas : function(entrance, pkgId){
            switch(entrance) {
                case 'overview':
                    var pkgArea = baidu.g('PkgRecmword');
                    if(pkgArea) {
                        // var title = $$('h4', pkgArea)[0];
                        // title && (title.innerHTML += '[圣诞版]');
                        var nameArea = $$('h5.view', pkgArea)[0];
                        if(nameArea){
                            baidu.addClass(
                                nameArea,
                                'aopkg-holiday-recmwordicon'
                            );
                            nameArea.innerHTML = '圣诞提词双重好礼';
                        }
                    }
                    break;
                case 'package':
                    if(pkgId == 5) {
                        var key = nirvana.aoPkgConfig.KEYMAP[pkgId];
                        var pkgConfig = nirvana.aoPkgConfig.SETTING[key];
                        // var pkgObj = nirvana.aoPkgControl.packageData.get(key);

                        var target = baidu.g(
                            pkgConfig.id + 'AoPkgOverviewHeader');
                        if(target) {
                            var info = document.createElement('span');
                            info.className = 'aopkg-holiday-pkginfo5';
                            info.innerHTML = ''
                                + '<a href="'
                                +     holidays.christmas.url
                                +     '" target="_blank">'
                                +     '圣诞提词，送积分、抽大奖！点击查看详情！'
                                + '</a>';
                            target.appendChild(info);
                        }
                    }
                    break;
            }
        }
    };

    var getHoliday = function(date) {
        var currDate = date || new Date();
        var dateStr = baidu.date.format(currDate, 'yyyy-MM-dd');
        var result = cache.get(dateStr);
        if(result && result.length > 0){
            return result;
        }

        result = [];
        for(var key in holidays) {
            if(holidays[key].check(currDate)) {
                result.push(key);
            }
        }
        cache.set(dateStr, result);
        return result;
    };

    /**
     * 节日活动处理初始化自动执行方法
     *
     * @param {string} entrance 入口
             值为 overview|package，意即概况页|包内
     */
    var init = function(entrance, pkgId) {
        var currDate = new Date(nirvana.env.SERVER_TIME * 1000);
        var holidayKeys = getHoliday(currDate);
        var len = holidayKeys.length;
        if(len > 0) {
            var i = 0;
            var key;
            for(; i < len; i++) {
                key = holidayKeys[i];
                holidays[key].process(entrance, pkgId);
            }
        }
    };

    return {
        init: init
    };

})();