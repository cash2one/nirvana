/**
 *顶部面包屑相关   yanlingling 
 */
nirvana.manage.crumbs = function(action){
    this.action = action;
};
    
nirvana.manage.crumbs.prototype = {
    
    /**
     * 请求面包屑数据
     * callback 成功后的回调函数 用于实现action里面与众不同的逻辑
     */
    getCrumbsInfo: function(callback){
        var me = this.action,
            navLevel = me.getContext('navLevel'),
            prefix,
            displayStat,
            func,
            param = {},
            currentClass = this,
            callback = callback;
        currentClass.displayLevelStat();
        switch (navLevel) {
        case 'unit':
            prefix = 'unit_';
            displayStat = 'unitStat';
            func = fbs.unit.getInfo;
            param.condition = {
                unitid: [me.getContext('unitid')]
            };
            break;
        case 'plan':
            prefix = 'plan_';
            displayStat = 'planStat';
            func = fbs.plan.getInfo;
            param.condition = {
                planid: [me.getContext('planid')]
            };
            break;
        default:
            prefix = 'acct_';
            displayStat = 'acctStat';
            func = fbs.account.getInfo;
            break;
        }
        param.onSuccess = function(data){
            var result = data.data.listData[0],
                creativeobj = result.creativecnt,
                context_set = er.context.set;
            currentClass.crumbsInfoDataHandler(prefix, result);
            
            //在tab载入的的时候，检测拿到的物料是否有creativecnt属性，如果有的话，就
            //在全局context中设置标识：hasAppendIdea来让之后判断是否禁用添加按钮
            /*var add_btn = ui.util.get('addidea'),
                add_select = ui.util.get('addAppSelect');

            var toggleAddState = function(disabled) {
                add_btn && add_btn.disable(disabled);
                add_select && add_select.disable(disabled);
            }*/

            //暂时这样做，之后想到别的方法，再升级
            
            if (creativeobj 
                && (creativeobj.sublink || creativeobj.app)
                && me.VIEW == 'appendIdeaList') {
                me.setContext('hasAppendIdea', true);
                //toggleAddState(true);
            }
            else if (creativeobj && !(creativeobj.sublink || creativeobj.app)) {
                me.setContext('hasAppendIdea', false);
                //toggleAddState(false);
            }
            else {
                me.setContext('hasAppendIdea', false);
                //toggleAddState(false)
            }

            if(navLevel == 'plan'){//计划层级的时候 要设置出价比例的显示
                nirvana.manage.setMPriceFactor(me);
            }
            //即时更新，refresh时才执行 zhouyu
            if (me.arg.refresh) {
                me.repaint();
                currentClass.updateCrumbsStat();
            }
            else {
                me.repaint();
            }
            nirvana.manage.tab.setTabInfor(me);//渲染tab..依赖面包屑的数据...yanlingling 
            
            nirvana.manage.LXB.setStatus();   //离线宝状态


            baidu.g('manage-stat-container')
                && baidu.removeClass('manage-stat-container', 'hide');
            baidu.g('manage-stat-loading')
                && baidu.addClass('manage-stat-loading', 'hide');

            if(callback){
                callback.call(me);
            }
            
            //currentClass.displayLevelStat();
        };
        param.onFail = function(data){
            if (displayStat && baidu.g(displayStat)) { // 系统出现异常
                baidu.g(displayStat).innerHTML = FILL_HTML.EXCEPTION;
                return false;
            }
        };
        func(param);
    },
    
    
    /**
     * 面包屑数据返回处理
     */
    crumbsInfoDataHandler: function(prefix, data){
        var me = this.action, 
            state =this.getState(data),
            wbudget, weekbudget, 
            // ideatype = me.getContext('ideaTypeForCrumbs'),
            // isLocal = (typeof(ideatype) != 'undefined' && +ideatype > 0) 
            //     ? true 
            //     : false,
            bgttype;
        for (var i in state) {
            //add and modify by LeoWang(wangkemiao@baidu.com)
            switch (i) {
            case 'wbudget':
                wbudget = state[i];
                break;
            case 'weekbudget':
                weekbudget = state[i];
                break;
            case 'bgttype':
                bgttype = state[i];
                me.setContext('bgttype', bgttype);
                break;
            case 'plancyc':
                me.setContext(
                    'plancycText',
                    state[i].length === 0 ? '全部时间' : '自定义'
                );
                break;
            default:
                me.setContext(prefix + i, state[i]);
                break;
            }
        }
        
        //add and modify by LeoWang(wangkemiao@baidu.com)
        if ('undefined' == typeof bgttype) {
            if (prefix == 'plan_') { // 计划层级，没有周预算，bgttype需要通过wbudget获得
                bgttype = (data.wbudget === '') ? 0 : 1;
                me.setContext('bgttype', bgttype);
            }
        }
        //add ended
        
        var level = this.getlevel();
        me.setContext('materialLevel', level);
        //控制显示预算信息
        //add by LeoWang(wangkemiao@baidu.com)
        switch (bgttype) {
        case 1:
            me.setContext(prefix + 'bgttype', '日预算');
            me.setContext(prefix + 'budgetvalue', wbudget);
            break;
        case 2:
            me.setContext(prefix + 'bgttype', '周预算');
            me.setContext(prefix + 'budgetvalue', weekbudget);
            break;
        default:
            me.setContext(prefix + 'bgttype', '预算');
            me.setContext(prefix + 'budgetvalue', '不限定');
            break;
        }
    
        
    },
    
    /**
     *获取物料的层级信息 
     */
    getlevel: function(){
        var me = this.action;
        var level = [];
        level[0] = {
            level: 0,
            id: 0,
            word: nirvana.env.USER_NAME,
            click: function(){
                er.locator.redirect('/manage/plan~ignoreState=true');
            }
        };
        if (me.getContext('planid')
            && typeof(me.getContext('planid'))!='undefined') {
            level[1] = {
                level: 1,
                id: me.getContext('planid'),
                word: baidu.encodeHTML(me.getContext('planname')),
                click: function(){
                    er.locator.redirect('/manage/unit~ignoreState=true&planid=' 
                        + me.getContext('planid'));
                }
            };
            if (me.getContext('unitid')) {
                level[2] = {
                    level: 2,
                    id: me.getContext('unitid'),
                    type: 'unit',
                    word: baidu.encodeHTML(me.getContext('unitname')),
                    click: function(){
                    }
                };
            }
        }
        
        return level;
    },
    
    
    /**
     * 顶部状态即时更新 liuyutong@baidu.com
     */
    updateCrumbsStat: function(){
        var me = this.action,
            content_stat, 
            prefix,
            params = {
                nocache: true
            }, 
            levelInfo, 
            statArray = [],
            nowid, nowlevel, nowstat;
            
        if(me.nowStat){
            nowid = me.nowStat.id;
            nowlevel = me.nowStat.level;
            nowstat = me.nowStat.stat;
        }
            
            
        if (nowlevel != 'plan' && nowlevel != 'unit') {
            levelInfo = 'useracct';
            statArray[0] = 'userstat';
            prefix = 'acct';
        }
        else {
            levelInfo = nowlevel + 'info';
            statArray[0] = nowstat;
            params.condition = {};
            params.condition[nowlevel + 'id'] = [nowid];
            prefix = nowlevel;
        }
        params.onSuccess = function(data){
            content_stat = nirvana.util.getStat(
                nowlevel,
                data.data.listData[0][statArray[0]]
            );
        //    me.setContext('acct_' + nowstat, content_stat);
            me.setContext(prefix + '_' + nowstat, content_stat);
            me.repaint();
        };
        fbs.material.getAttribute(levelInfo, statArray, params);
    },
    
    /**
     *对返回的数据进行处理 
     * @param {Object} data
     */
    getState: function(data){ 
        // by liuyutong@baidu.com 2011-8-1
        var me = this.action,
            state = {};
        for (var i in data) {
            switch(i){
                case 'unitstat':
                    if(me.nowStat){
                        me.nowStat.id = data['unitid'];
                        me.nowStat.level = 'unit';
                        me.nowStat.stat = i;
                    }
                    
                    state[i] = nirvana.util.getStat('unit', data[i]);
                    break;
                case 'planstat':
                    if(me.nowStat){
                        me.nowStat.id = data['planid'];
                        me.nowStat.level = 'plan';
                        me.nowStat.stat = i;
                    }
                    state[i] = nirvana.util.getStat('plan', data[i]);
                    break;
                case 'userstat':
                    if(me.nowStat){
                        me.nowStat.id = 0;
                        me.nowStat.level = 'account';
                        me.nowStat.stat = i;
                    }
                    state[i] = nirvana.util.getStat('account', data[i]);
                    break;
                case 'wregion':
                    var abregion,
                        wregion = data[i] == '' ? [] : data[i].split(',');
                    me.setContext('wregion',wregion);
                    if (me.getContext('planid')) {
                        abregion = nirvana.manage.region.abbRegion(wregion,'plan');
                    }
                    else{
                        abregion = nirvana.manage.region.abbRegion(wregion,'account');
                    }
                    state[i] = abregion.word;
                    state['wregion_title'] = abregion.title;
                    break;
                case 'planid':
                case 'planname':
                case 'unitname':
                    me.setContext(i, data[i]);
                    break;
                case 'ideatype':
                    me.setContext('ideatype', data[i]);
                    me.setContext('ideaTypeForCrumbs', data[i]);
                    break;
                case 'wbudget':
                    state[i] = data[i] == '' ? '不限定' : fixed(data[i]);
                    break;text(i, data[i]);
                    break;
                case 'weekbudget':
                    state[i] = data[i] == '' ? '不限定' : fixed(data[i]);
                    break;
                default:
                    state[i] = data[i];
                    break;
            }
        }
        return state;
    },
    
    
    /**
     *显示不同的状态 dom
     */
    displayLevelStat: function(){
        //debugger;
        var me = this.action;

        baidu.g('manage-stat-container')
            && baidu.addClass('manage-stat-container', 'hide');
        baidu.g('manage-stat-loading')
            && baidu.removeClass('manage-stat-loading', 'hide');
        
        baidu.g('acctStat').style.display = 'none';
        if(baidu.g('planStat')){//每个物料层级包含的stat不同
            baidu.g('planStat').style.display = 'none';
        }
        if(baidu.g('unitStat')){
            baidu.g('unitStat').style.display = 'none';
        }
        
        if (me.getContext('unitid')) {
            baidu.g('unitStat').style.display = 'block';
        }
        else if (me.getContext('planid')) {
            baidu.g('planStat').style.display = 'block';
        }
        else {
            baidu.g('acctStat').style.display = 'block';
        }
    }
    
}