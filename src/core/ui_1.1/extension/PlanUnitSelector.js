/**
 * 计划单元选择器
 * 配置项如下：
 * {
 *   planid: '',              计划ID, 可选
 *   unitid: '',              单元ID, 可选
 *   planWidth: 140,          计划 ComboBox 的宽度，默认是140
 *   unitWidth: 140,          单元 ComboBox 的宽度，默认是140
 *   saveWidth: 95,           保存按钮的宽度，默认是50
 *   disablePlan: true/false, 是否禁用计划选择
 *   disableUnit: true/false, 是否禁用单元选择
 *   isup: true/false         ComboBox 组件的 layer 是否向上显示，默认为true
 * }
 */
fc.ui.PlanUnitSelector = function($) {
    
    var ComboBox = fc.ui.ComboBox,
        SaveButton = fc.ui.SaveButton;

    function PlanUnitSelector(node, config) {
        this._inline = true;
        this._super(node, 'planunitselector', config);

        config.isup = config.isup == null ? true : config.isup;

        /**
         * 组件的状态，具体如下：
         * 0 没选计划和单元
         * 1 选择了计划，但没选单元
         * 2 选择了计划和单元
         * @property {Number} status
         */
        this.status = 0;

        /**
         * 计划选择器
         * @property {ComboBox} plan
         */
        this.plan = new ComboBox($('.plan', this.node)[0], getPlanConfig(config.planWidth, config.isup));

        /**
         * 单元选择器
         * @property {ComboBox} unit
         */
        this.unit = new ComboBox($('.unit', this.node)[0], getUnitConfig(config.unitWidth, config.isup));

        /**
         * 保存按钮
         * @property {SaveButton} save
         */
        this.save = new SaveButton($('.save', this.node)[0], { width: config.saveWidth, isup: config.isup });
        this.save.disable(true);

        addEvents.call(this);

        var me = this;
        getPlanList(function(list) {
            me.plan.options(list);

            if (config.planid) { // 定位计划层级
                me.plan.value(config.planid);
            }
            if (!config.disablePlan) {
                me.plan.disable(false);
            }
        });
    }

    PlanUnitSelector.prototype = {

        /**
         * 保存按钮是否可用有时还要参考外部因素，因此提供一个接口设置外部条件
         * @method isSaveEnable
         * @return {Boolean}
         */
        isSaveEnable: null,

        /**
         * 选中有效计划时触发
         * @event onplanselect
         * @param {Object} plan 结构是 { name: '计划名称', id: '计划id' }
         */
        onplanselect: null,

        /**
         * 选中有效单元时触发
         * @event onunitselect
         * @param {Object} unit 结构为 { name: '单元名称', id: '单元id' } 
         */
        onunitselect: null,

        /**
         * 点击保存按钮的事件处理函数，组件会传入一些必须的数据
         * 特别注意在请求返回后调用callback
         * @event onsave
         * @param {Number} type 0 - 广泛 1 - 短语 2 - 精确
         * @param {Object} plan 计划 { id: xx, name: xx }
         * @param {Object} unit 单元 { id: xx, name: xx }
         * @param {Function} callback 请求返回后的回调函数
         */
        onsave: null,

        /**
         * 释放内存
         * @method dispose
         */
        dispose: function() {
            this.plan.dispose();
            this.unit.dispose();
            this._super();
        },

        getTpl: function() {
            return TPL_UI;
        }
    };

    PlanUnitSelector = fc.ui.extend(fc.ui.Base, PlanUnitSelector);

    // ==================================================================
    var TPL_UI = '<div class="plan"></div><div class="unit"></div><div class="save"></div>';

    function getPlanConfig(width, isup) {
        return { width: width || 140, height: 230, text: '请选择推广计划', disable: true, isup: isup };
    }

    function getUnitConfig(width, isup) {
        return { width: width || 140, height: 230, text: '请选择推广单元', disable: true, isup: isup };
    }

    function addEvents() {
        var me = this, config = this.config();

        this.plan.onselect = function(planid) {
            me.status = 1;
            me.save.disable(true);
            if (typeof me.onplanselect === 'function') {
                var item = me.plan.list.selectedItem;
                me.onplanselect({ id: item.value, name: item.text });
            }
            getUnitList(planid, function(list) {
                me.unit.reset({ data: list });
				if (config.unitid) {
					me.unit.value(config.unitid);
				}
                if (!config.disableUnit) {
                    me.unit.disable(false);
                }
            });
        };

        this.unit.onselect = function(value) {
            if (value == -1) return;
            me.status = 2;
            if (typeof me.onunitselect === 'function') {
                var item = me.unit.list.selectedItem;
                me.onunitselect({ id: item.value, name: item.text });
            }
            
            if (me.isSaveEnable == null || (typeof me.isSaveEnable === 'function' && me.isSaveEnable())) {
                me.save.disable(false);
            }
        };

        this.save.onclick = function(type) {
            this.disable(true);
            if (typeof me.onsave === 'function') {
                if (me.onsave.length !== 4) {
                    p('[PlanUnitSelector] onsave 接口必须传入 4 个参数！');
                }
                var planItem = me.plan.list.selectedItem,
                    unitItem = me.unit.list.selectedItem;

                var plan = { id: planItem.value, name: planItem.text },
                    unit = { id: unitItem.value, name: unitItem.text };

                me.onsave(type, plan, unit, function() {
                    if (me.isSaveEnable == null || (typeof me.isSaveEnable === 'function' && me.isSaveEnable())) {
                        me.save.disable(false);
                    }
                });
            }
        };
    }

    function getPlanList(callback) {
        fbs.plan.getNameList({
			onSuccess: function(json){
				var data = json.data.listData, len = data.length,
					plandata = [];
				
				if (len == 0) {
					plandata.push({
						text : '当前没有推广计划，请您先新建计划',
						value : -1
					});
				} else {
					for (var i = 0; i < len; i++) {
						plandata.push({
							text: baidu.encodeHTML(data[i].planname),
							value: data[i].planid
						});
					}
				}

                callback(plandata);
			},
			onFail: function() {
				ajaxFailDialog();
			}
		});
    }

    function getUnitList(planid, callback) {
        fbs.unit.getNameList({
			condition: {
				planid: [planid]
			},
			onSuccess: function(json) {
				var data = json.data.listData, len = data.length,
				    unitdata = [];
				
				if (len == 0) {
					unitdata.push({
                        text : '当前计划下没有推广单元，请您选择其他计划层级',
						value : -1
					});
				} else {
					for (var i = 0; i < len; i++) {
						unitdata.push({
							text: baidu.encodeHTML(data[i].unitname),
							value: data[i].unitid
						});
					}
				}
                callback(unitdata);
			},
			onFail: function() {
				ajaxFailDialog();
			}
		});
    }

    return PlanUnitSelector;

}($$);
