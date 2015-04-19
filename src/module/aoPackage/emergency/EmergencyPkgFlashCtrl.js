/*
 * nirvana Copyright 2013 Baidu Inc. All rights reserved.
 *
 * path: aoPackage/emergency/EmergencyPkgFlashCtrl.js
 * desc: 突降急救包Flash图表区域控件定义，扩展自aoPkgFlashCtrl.js
 * author: Wu Huiyao(wuhuiyao@baidu.com)
 * date: $Date: 2013/01/06 $
 */
nirvana.aoPkgControl.EmergencyPkgFlashCtrl = nirvana.aoUtil.extendClass(
    nirvana.aoPkgControl.AoPkgFlashCtrl,
    {
        /**
         * 获取图表区描述文字模板的数据
         */
        getDescrTplData: function(data) {
            var beginDate = baidu.date.parse(data.begindate);
            var endDate = baidu.date.parse(data.enddate);
            var format = baidu.date.format;
            var decrValue = data.beginvalue - data.endvalue;

            return {
                beginDate: format(beginDate, 'M月d日'),
                beginWeek: parseDateToChineseWeek(beginDate, true),
                endDate: format(endDate, 'M月d日'),
                endWeek: parseDateToChineseWeek(endDate, true),
                changeValue: Math.round(decrValue / data.beginvalue * 100),
                beginValue: data.beginvalue,
                endValue: data.endvalue,
                wordNum: data.decrwordnum,
                unitNum: data.decrunitnum,
                planNum: data.decrplannum
            };
        },
        /**
         * 渲染数据区域信息，需要注意的是我们在这里并没有对插入的ui进行初始化
         * @override
         */
        renderDesc: function() {
            var me = this;
            var isHide = me.descData.hide || 0;
            if(+isHide) {
                return;
            }
            // 初始化模板的数据
            var tplData = me.getDescrTplData(me.descData);

            var html = lib.tpl.parseTpl(tplData, 'emergencyPkgFlashDescr', true);
            me.descDom && (me.descDom.innerHTML = html);

            // 初始化描述信息的Bubble
            fc.ui.init(me.descDom);

            // 执行渲染描述数据回调
            nirvana.util.executeCallback(me.onRenderDesc, [me.descData], me);
        },
        /**
         * 处理Flash图表区渲染的数据
         * @param {Object} flashData
         * @override
         */
        processFlashData: function(flashData) {
            var newData = {
                name: '点击量',
                data: flashData,
                emphasizeArray: []
            };
            var date;
            var descData = this.descData;

            // 现在flash的下降箭头始终指向emphasizeArray最后一个元素引用的日期
            for (var i = 0, len = flashData.length; i < len; i ++) {
                date = flashData[i].date;
                if (date == descData.begindate || date == descData.enddate) {
                    newData.emphasizeArray.push(i);
                }
            }

            return newData;
        },
        /**
         * 绑定事件处理器
         * @override
         */
        bindHandlers: function() {
            var descrEle = this.descDom;

            if (!descrEle) {
                return;
            }

            var setEle = $$('.emergency_pkg_setting', descrEle)[0];
            setEle && (setEle.onclick = function() {
                // 发送行为监控
                nirvana.AoPkgMonitor.clickDecrSetting();
                // 打开设置对话框
                var dlg = new nirvana.aoPkgControl.EmergencySettingDlg();
                // 突降设置成功回调
                dlg.onSuccess = function() {
                    // 获取突降包实例并刷新
                    var appName = nirvana.aoPkgConfig.KEYMAP[7];
                    var app = nirvana.aoPkgControl.packageData.get(appName);
                    app && app.renderAppDialog();
                };
                dlg.show();
            });
        },
        dispose: function() {
            var bubble = fc.ui.get('emergencyPkgDescrBubble');
            // 销毁Bubble
            bubble && bubble.dispose();
        }
    }
);