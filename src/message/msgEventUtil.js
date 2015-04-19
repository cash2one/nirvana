/**
 * @file src/message/msgEventUtil
 * @author peilonghui@baidu.com
 */


 ;(function(window, undefined) {
    var msgcenter = window.msgcenter, baidu = window.baidu;

    var eu = msgcenter.eventUtil = {};


    var isBindedMap = {};


    // 这个对象的每个key是已经被托管事件的元素的id
    // 每个value 也是一个对象，称之为value对象
    // value对象的每个key是被托管的事件类型，如click
    // value对象的value也是一个对象，称之为事件value对象
    // 事件value对象有两个key， conditions和handlers， 它们都是数组
    // 它们之间相互对应，都是在试用delegate方法的时候所传入的参数。
    var delegateMap = {};


    /** 
     * 将事件托管到第一个参数所指的元素上，注意：这种托管是每托一次，就会多一次处理
     * 如果你对同一类型事件，同意执行方法进行了多次挂接，那么当这个事件触发的时候，会执行多次
     * 
     * @namespace eventUtil
     * @param {string||HTMLElement} parent要托管到的元素或这个元素的id，如果是元素，那么必须有id属性
     * @param {string} type 要托管的事件类型，如'click',必须的
     * @param {Object||Function} condition 要托管的元素的条件对象或判断方法，判断方法需要接收托管的元素做参数
                                           必须的，不想判断可以传{}和function(){}
     * @param {Function} handler 事件触发后要执行的操作,必然是必须的。这个方法的调用时通过apply来实现的，
                                 所以，方法内部的this对象已经指向了我们所需要的元素，而不是parent。
     * @return {Object} 返回msgcenter.eventUtil供连锁调用
     */
    eu.delegate = function(parent, type, condition, handler) {
        
        if (!(parent && type && condition && handler)) {
            throw "缺少必要的参数！";
            return false;
        }

        var id;
        if (parent.constructor == String) {
            id = parent;
            parent = baidu.g(parent);
        } else {
            id = parent.id;
        }

        if (!id) {
            throw "元素的id不能为空！";
            return false;
        }

        // 记录parent的某个事件类型是否绑定过事件
        var currIsBindedMap = isBindedMap[id] = isBindedMap[id] || {};
        var currIsBinded = currIsBindedMap[type];


        // 上面的一系列判断会保证了现在已经有了足够的参数来托管事件
        // 访问delegateMap中的各个key，有则获取，无则赋空
        var currDelegateMap = delegateMap[id] = delegateMap[id] || {};
        var currTypeDelegateMap = currDelegateMap[type] = currDelegateMap[type] || {};
        var currConditions = currTypeDelegateMap.conditions = currTypeDelegateMap.conditions || [];
        var currHandlers =  currTypeDelegateMap.handlers = currTypeDelegateMap.handlers || [];
        //var currCallbacks = currTypeDelegateMap.callbacks = currTypeDelegateMap.callbacks || [];
        var len = currConditions.length;

        // 将本次要托管的条件和处理方法都添加到相应的数组中。
        currConditions[len] = condition;
        currHandlers[len] = handler;
        //currCallbacks[len] = callback;


        // 然后循环条件数组和处理方法数组，判断然后执行
        if (!currIsBinded) {
            parent['on' + type] = function(evt) {
                evt = evt || window.event;
                target = evt.target || evt.srcElement;
                var cd, ch, flag;
                var len = (currConditions && currConditions.length) || 0;
                for (var i = 0; i < len; i++) {
                    flag = 1;
                    cd = currConditions[i];
                    ch = currHandlers[i];
                    //cb = currCallbacks[i];
                    // 判断事件的触发对象是否符合条件，如果不符合条件，什么都不做
                    if (cd.constructor == Object) {
                        for (var key in cd) {
                            if (target[key] != cd[key]) {
                                flag = 0;
                            }
                        }
                    } else if (cd.constructor == Function) {
                        if (!cd(target)) {
                            flag = 0;
                        }
                    }

                    // 判断之后，某项不符合条件，那么就不会调用处理方法
                    if (flag) {
                        //if (cb) {
                            //ch.call(target, evt, cb);
                       // } else {
                        ch.call(target, evt);
                        //}
                        
                    }
                }
            };
            currIsBindedMap[type] = 1; 
        }

        return eu;
    };


    /**
     * 解除某个父元素身上挂载的事件
     * 
     * @namespace eventUtil
     * @param {sstring||HTMLElement} parent 要解除的元素id或元素， 如果是元素，那么元素必须有id属性
     * @param {string} type 要解除的事件类型，可以为空，当为空的时候意味着这个元素身上挂载的全部事件都解除掉了
     * @return {Object} 返回msgcenter.eventUtil供连锁调用
     */
    eu.undelegate = function(parent, type) {
        if (!parent) {
            throw "缺少必要的参数！"
            return false;
        }

        var id;
        if (parent.constructor == String) {
            id = parent;
            parent = baidu.g(parent);
        } else {
            id = parent.id;
        }


        if (!type) {
            delete delegateMap[id];
            delete isBindedMap[id];
        } else {
            delete delegateMap[id][type];
            delete isBindedMap[id][type];
        }

        return eu;
    }

 })(window);