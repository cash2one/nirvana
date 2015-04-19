/**
 * @file src/module/fuseSuggestion/fuseItem.js 融合建议类
    智能优化融入推广管理
 *
 * @author Leo Wang(wangkemiao@baidu.com)
 */

nirvana.fuseSuggestion.FuseItem = (function() {
    // a short namespace
    var me = nirvana.fuseSuggestion;

    // @requires 输入

    // sizzle => $$
    // tangram => baidu
    var config = me.config;
    // lib => lib // 使用了公共基础库中的lib
    // er => er
    var util = nirvana.util;

    // 定义输出
    var exports = {};

    /**
     * @class nirvana.module.fuseSuggestion.FuseItem 同时也是一个简易的监听者
     * @constructor
     *
     * @param {Object} options 配置信息
            {Object} data: 数据，应该直接就是optsug数据
            {string} viewStatus: 视图状态，可选值 min|max
            {string} containerId: 外层的渲染目标容器ID
     */
    exports = function(options) {
        this.init(options);
    };

    exports.prototype = {

        /** @lends nirvana.module.fuseSuggestion.FuseItem.prototype */

        init: function(options) {
            options = options || {};
            this.options = options;
            this.data = options.data || {};
            this.levelinfo = options.levelinfo;
            this.viewStatus = options.viewStatus || config.DEFAULT.viewStatus;
            this.containerId = options.containerId;
        },

        /**
         * get
         *
         * @public
         * @param {string} key
         * @return {*}
         */
        get: function(key) {
            return this[key];
        },

        /**
         * set
         *
         * @param {string} key
         * @param {FuseItem} 返回自身[链式调用]
         */
        set: function(key, value) {
            this[key] = value;
            // noted，直接修改key的时候，是不能同步更新options中的内容的
            // so...
            // if('undefined' != typeof this.options[key]) {
            //     this.options[key] = value;
            // }
            // but，实际上是没有用this.options的
            return this;
        },

        /**
         * 更新当前视图，重新渲染+绑定
            当前支持的是UI Table，container实际上是td，因此还要取其子元素……
         *
         * @param {FuseItem} 返回自身[链式调用]
         */
        update: function(viewStatus) {
            if('undefined' !== typeof viewStatus) {
                this.viewStatus = viewStatus;
            }

            var target = baidu.g(this.containerId);

            if(target) {
                target.firstChild.innerHTML = this.getContent();
                this.bind();
            }
            return this;
        },

        /**
         * 获取内容
         */
        getContent: function() {
            var self = this;
            if(!this.data || !this.data.optsug
                || !this.data.optsug.suggestion
                || !this.data.optsug.reason) {
                return er.template.get(this.viewStatus + 'NoFuseSuggestion');
            }
            var optsugData = this.data.optsug;

            if(optsugData
                && optsugData.reason
                && optsugData.suggestion) {
                var tpl = er.template.get(this.viewStatus + 'FuseSuggestion');
                var data = {
                    suggestion: config.LANG.SUGGESTION[optsugData.suggestion],
                    reason: config.LANG.REASON[optsugData.reason],
                    color: config.batteryColorOfReason[optsugData.reason],
                    suggestKey: optsugData.suggestion,
                    index: self.options.index
                };
                switch(+this.data.optsug.reason) {
                    case 403:
                    case 407:
                        if(optsugData.data 
                            && 'undefined' !== typeof optsugData.data.showratio) {
                            data.reason += '（' 
                                + (optsugData.data.showratio || 0)
                                + '%）';
                        }
                        
                        break;
                }
                return lib.tpl.parseTpl(data, tpl);
            }
            else {
                return er.template.get(this.viewStatus + 'NoFuseSuggestion');
            }
        },

        /**
         * 针对于渲染出来的Item，进行事件绑定
         * @private
         */
        bind: function() {
            var self = this;
            var container = baidu.g(self.containerId);
            if(!container) {
                return;
            }

            // 事件绑定

            // 针对于电池图标，绑定鼠标悬停时的划出
            var icon = $$('.fusesug-container-min', container)[0];
            // 理应只有一个，有可能瞬间划过……
            if(icon) {
                baidu.on(icon, 'mouseover', function() {
                    if(showtimeoutNo) {
                        clearTimeout(showtimeoutNo);
                    }
                    showtimeoutNo = setTimeout(function() {
                        showFloatingSugForUITable(icon);

                        var ftarget = $$('.fusesug-floatingSuggestion')[0];
                        if(ftarget) {
                            ftarget.onclick = self._clickHandler();
                        }
                    }, 10);
                });
            }

            container.onclick = self._clickHandler();
        },

        _clickHandler: function() {
            var self = this;

            return function(e) {
                e = e || window.event;
                var target = e.target || e.srcElement;
                var item = self.data;

                var action = baidu.dom.getAttr(target, 'action');

                switch(action) {
                    case 'fusesug-optimize':
                        var commandkey = baidu.dom.getAttr(target, 'data');
                        var command = config.command[commandkey];
                        me.monitor.viewDetail(self);
                        me.actionAdapter.executeAction(
                            // self.options.levelinfo,
                            command,
                            {
                                item: item,
                                levelinfo: self.options.levelinfo,
                                timespan: self.options.timespan,
                                /**
                                 * @param {Object=} params.actionReturnData
                                    详情操作成功之后回调函数中传入的数据
                                 *
                                    for budget:
                                        {
                                            bgttype : {number},
                                            oldtype : {number},
                                            newvalue : {number},
                                            oldvalue : {number}
                                        }
                                    for bid:
                                        {
                                            oldvalue: {number},
                                            newvalue: {number}
                                        }
                                 */
                                callback: function(params) {
                                    var data = params.optsug,
                                        msg = params.message,
                                        needRefresh = params.needRefresh;

                                    if('undefined' === typeof needRefresh) {
                                        needRefresh = true;
                                    }

                                    var oldfuseitem = baidu.object.clone(self);

                                    var table = ui.util.get(self.levelinfo + 'TableList');
                                    var tableItem = table.datasource[self.options.index];
                                    tableItem.optsug = tableItem.optsug || {};
                                    self.data.optsug = self.data.optsug || {};
                                    // 更新数据 而不是替换数据
                                    // util.deepExtend(tableItem.optsug, data);
                                    // util.deepExtend(self.data.optsug, data);
                                    tableItem.optsug = data;
                                    self.data.optsug = data;

                                    if(msg) {
                                        ui.Dialog.alert({
                                            title: '提示',
                                            content: msg,
                                            onok: function() {
                                                self.updateAndRefresh(needRefresh);
                                            }
                                        });
                                    }
                                    else {
                                        me.monitor.modifyDetail(oldfuseitem, params);
                                        self.updateAndRefresh(needRefresh);
                                    }
                                }
                            }
                        );
                        break;
                }
            };
        },
        updateAndRefresh: function(needRefresh) {
            var self = this;
            if(needRefresh) {
                er.controller.fireMain('reload');
            }
            else {
                // baidu.hide(self.containerId);
                self.update();
                nirvana.fuseSuggestion.noNeedRefreshAll = false;
                baidu.fx.pulsate(self.containerId, 3, {
                    onafterfinish: function() {
                        // console.log('updated：' + data.suggestion);
                    }
                });
            }
        }
    };

    var hidetimeoutNo, showtimeoutNo;

    /**
     * 展现横向浮出的建议详情 for UI Table
     * @param {HtmlElement} baseElm 鼠标指向触发浮出的元素
        当前是那个电池的容器元素，后面的代码中有复制电池图标的行为
     */
    function showFloatingSugForUITable(baseElm) {
        if(!baseElm) {
            return;
        }
        var parentTd = baseElm.parentNode;
        var sugInfoDom = $$('.fusesug-floatingdetail', parentTd)[0];
        var parentTbody = parentTd;

        while(!baidu.dom.hasClass(parentTbody, 'ui_table_body')) {
            parentTbody = parentTbody.parentNode;
            if(!parentTbody || baidu.dom.hasClass(parentTbody, 'ui_table')) {
                return;
            }
        }

        var parentTable = parentTbody.parentNode;
        var controlId = baidu.dom.getAttr(parentTable, 'control');
        // 选择至其上的ui_table_body
        // 视情况增加dom或者选择dom
        var floatingTarget = $$(
            '#' + controlId + '-floatingFuseSug',
            parentTbody
        )[0];

        if(!floatingTarget) {
            // 不存在则创建
            var html = lib.tpl.parseTpl(
                {id: controlId},
                er.template.get('floatingFuseSuggestion')
            );
            baidu.insertHTML(parentTbody, 'beforeEnd', html);
            floatingTarget = $$(
                '#' + controlId + '-floatingFuseSug',
                parentTbody
            )[0];

            floatingTarget.onmouseover = function() {
                if(hidetimeoutNo) {
                    clearTimeout(hidetimeoutNo);
                }
            };
            floatingTarget.onmouseout = function() {
                hidetimeoutNo = setTimeout(function() {
                    var tdtar = $$('td', floatingTarget);
                    for(var i = 0; i < tdtar.length; i++) {
                        if(tdtar[i]){
                            tdtar[i].innerHTML = '';
                        }
                    }
                    baidu.dom.setStyles(floatingTarget, {
                        top: '-9999px',
                        left: '-9999px',
                        display: 'none'
                    });
                }, 50);
            };
        }
        if(floatingTarget) {
            // 调整位置
            // var line = baidu.dom.getAttr(parentTd, 'row');
            // var pos = baidu.dom.getPosition(parentTd);
            // var tablepos = baidu.dom.getPosition(parentTable);
            baidu.dom.setStyles(floatingTarget, {
                left: parentTd.offsetLeft + 'px',
                top: parentTd.offsetTop - 1 + 'px',
                display: 'block',
                height: parentTd.offsetHeight + 2 + 'px'
            });
            var tdtar = $$('td', floatingTarget);
            if(tdtar[0]) {
                tdtar[0].innerHTML = baseElm.innerHTML;
                baidu.dom.setStyle(
                    tdtar[0],
                    'width',
                    parentTd.offsetWidth + 'px'
                );
            }
            if(tdtar[1]) {
                tdtar[1].innerHTML = ''
                + '<div style="display:none;">'
                + sugInfoDom.innerHTML
                + '</div>';
            }

            // 展开
            baidu.fx.expand(tdtar[1].firstChild, {
                orientation: 'horizontal',
                duration: 300
                // 展开之后 过几秒收起
                // onafterfinish: function() {
                //     if(hidetimeoutNo) {
                //         clearTimeout(hidetimeoutNo);
                //     }
                //     hidetimeoutNo = setTimeout(function() {
                //         var tdtar = $$('td', floatingTarget);
                //         for(var i = 0; i < tdtar.length; i++) {
                //             tdtar[i] && (tdtar[i].innerHTML = '');
                //         }
                //         baidu.dom.setStyles(floatingTarget, {
                //             top: '-9999px',
                //             left: '-9999px',
                //             display: 'none'
                //         });
                //     }, 3000);
                // }
            });
        }
    }

    return exports;

})();