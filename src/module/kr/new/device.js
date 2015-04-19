/**
 * 无线凤巢设备选择器
 */
nirvana.krModules.Device = function($) {

    var event = fc.event,
        ComboBox = fc.ui.ComboBox,
        util = nirvana.krUtil;

    /**
     * 需传入 计划ID 和 带入的关键词
     */
    function Device(planid, words) {
        // 用到的两个属性先列在这
        this.value = null;
        this.combobox = null;

        initUI.call(this);
        
        if (planid === 0 && words.length > 0) {
            var planids = util.getPlanidsByWords(words);
            this.planids = planids.length > 0 ? planids : null;
        } else {
            this.planids = [planid];
        }
        var me = this;        
        requestDevice(this.planids, setDevice);

        function setDevice(value) {
            me.combobox.value(value);
            onselect.call(me);
        }
    }

    Device.prototype = {
        dispose: function() {
            this.combobox.dispose();
        }
    };

    function requestDevice(planids, callback) {
        // 计划未知时，默认是“全部设备”
        var device = 0;
        if (planids != null) {
            fbs.plan.getDeviceprefer({
                condition: {
                    planid: planids
                },
                onSuccess: function(json) {
                    if (json.data && json.data.listData && json.data.listData.length) {
                        device = util.getDeviceByPlans(json.data.listData);
                    }
                    callback(device);
                },
                onFail: function() {
                    callback(device)
                }
            });
        } else {
            callback(device);
        }
    }

    // 初始化组件
    function initUI() {
        var me = this;        
        ui.util.init(baidu.g('selectDevice')); 
        this.combobox = {
            value: function(value){
                ui.util.get('krDeviceAll').getGroup().setValue(value);
            },
            dispose: function(){
                ui.util.get('krDeviceAll').dispose();
                ui.util.get('krDeviceComputer').dispose();
                ui.util.get('krDeviceMobile').dispose();
            }
        };
        
        ui.util.get('krDeviceAll').onclick = function(){
            onselect.call(me);
        };
        ui.util.get('krDeviceComputer').onclick = function(){
            onselect.call(me);
        };
        ui.util.get('krDeviceMobile').onclick = function(){
            onselect.call(me);
        };
    }
    
    function onselect() {
        var me = this;
        var temp = me.value;
        var value = ui.util.get('krDeviceAll').getGroup().getValue();
        me.value = value;
        event.fire(me, {
            type: temp != null ? nirvana.KR.EVENT_REFRESH : nirvana.KR.EVENT_INIT,
            device: value
        });
    }
    
    return Device;

}($$);
