/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 *
 * path:    manage/advancedIpExclusion.js
 * desc:    高级IP排除
 * author:  yanlingling
 * date:    $Date: 2012/11/27 $
 */
manage.acctAdvancedIpExclusion = new er.Action({
		VIEW : 'setAcctAdvancedIpExclusion',
		
		IGNORE_STATE : true,
		ipList : [],
		
		/**
		 * 设置tab
		 * @param {Object} callback
		 */
		CONTEXT_INITER_MAP : {
			tabSet : function (callback) {
				var me = this;
				me.setContext("ipType", "acctAdv");
                me.setContext("acctSetTab",manage.account.otherSetting.getConfig('tabs'));
                callback();
			}
		},
		
		onafterrender : function () {
			var me = this,
			controlMap = me._controlMap;
			
			me.renderContent();
			//渲染tab里面的内容
			var onSuccess = me.getAdvIPExclusionSucess;
			me.getAdvIPExclusion(onSuccess);
			//获取高级ip排除
			var errorEle = baidu.g('advIpExcludeWarning');
			baidu.hide(errorEle);
			var sucessTipDom = baidu.g('advIpExcludeSaveSucc');
			baidu.hide(sucessTipDom);
			me.eventBind();
			//事件绑定
		},
		
		/**
		 *事件绑定
		 */
		eventBind : function () {
			var me = this;
			//tab切换事件
			me._controlMap.acctSetTab.onselect = manage.account.otherSetting.tabClickHandler;
			me._controlMap.acctAdvIpExclusionOk.onclick = me.saveClickHandler();
			me._controlMap.acctAdvIpExclusionCancel.onclick = function () {
				me.onclose();
			}
            var clears = baidu.q('pointer',baidu.g('AdvancedIpExclusionWrapper')) ;
            for(var i=0;i<clears.length;i++){
                baidu.on(clears[i],'click',me.clickClearHandler)
            }

		},
		
		/**
		 *检查输入的合法性
		 */
		validateInput : function () {
			var me = this;
			var ipNum = fc.common.Config.ACCOUNT.NUM_ADV_IP_EXCLUDE;
			for (var i = 0; i < ipNum; i++) {
				var input1 = baidu.trim(baidu.g("firstNumOf" + i).value);
				var input2 = baidu.trim(baidu.g("secondNumOf" + i).value);
				if (input1 == '' && input2 == '') {
					continue;
				} else if(+input1 ==0 && +input2 == 0){	
				   return false;																													

				}else if ((!me.validateIpNum(input1)) || (!me.validateIpNum(input2))) {
					return false;
				}
				var temp = [input1, input2, '*', '*'];
				//把ip存起来 ，就不用总读了
				temp = temp.join('.');
				me.ipList.push(temp);
			}
			return true;
		},
		
		validateIpNum : function (str) {
           var patrn=/^\d*$/;
            if (!patrn.test(str)) {
                return false;
            }
			if (str == '') {
				return false;
			} else if (+str < 0) {
				return false;
			} else if (+str > 255) {
				return false;
			}
			return true;
		},
		
		/**
		 *点击保存
		 */
		saveClickHandler : function (action) {
			var me = this;
			// console.log(me);
			return function () {
				me.ipList = [];
				var checkResult = me.validateInput();
				var errorEle = baidu.g('advIpExcludeWarning');
				var sucessTipDom = baidu.g('advIpExcludeSaveSucc');
				baidu.hide(sucessTipDom);
				if (!checkResult) {
					baidu.show(errorEle);
					return;
				}
				baidu.hide(errorEle);
				fbs.account.modAdvIpExclusion({
					advancedipblack : me.ipList,
					onSuccess : function (data) {
						
						baidu.show(sucessTipDom);
						fbs.account.getAdvancedipblack.clearCache();
						//清除cache
					},
					onFail : manage.account.otherSetting.modAccIpFail
					
				});
			}
		},
		
		/**
		 *获取高级ip排除的数据
		 */
		getAdvIPExclusion : function (successCallback) {
			fbs.account.getAdvancedipblack({
				onSuccess : successCallback,
				onFail : function (data) {
					ajaxFailDialog();
				}
			});
		},
		
		/**
		 *获取高级ip排除成功处理
		 */
		getAdvIPExclusionSucess : function (data) {
			var dat = data.data.listData[0].advancedipblack;
			var len = dat.length;
			var ipNum = fc.common.Config.ACCOUNT.NUM_ADV_IP_EXCLUDE;
			if (dat && len > 0) {
				for (var i = 0; i < len && i < ipNum; i++) {
					var parts = dat[i].split('.');
					//ip都是以。分割
					baidu.g("firstNumOf" + i).value = parts[0];
					baidu.g("secondNumOf" + i).value = parts[1];
				}
			}
		},
		
		/**
		 *渲染ip排除tab的内容 因为pm要求高级ip排除的数量以后可以随时更改，所以在js里生成html
		 */
		renderContent : function () {
			var me = this;
			var htmlStr = [];
			htmlStr[htmlStr.length] = '<table border=1>';
			var ipNum = fc.common.Config.ACCOUNT.NUM_ADV_IP_EXCLUDE;
			for (var i = 0; i < ipNum; i++) {
				htmlStr[htmlStr.length] = '<tr>';
				htmlStr[htmlStr.length] = '<td><input id="firstNumOf' + i + '"/><span class="advIpExclusion_bigFont">.</span><input id="secondNumOf' + i + '"/><span class="advIpExclusion_bigFont">.*.*</span></td>';
				htmlStr[htmlStr.length] ="<td ><span class='text_blue pointer' index='" + i + "'>清空</span></td>";
				htmlStr[htmlStr.length] = '</tr>';
			};
			htmlStr[htmlStr.length] = '</table>';
			baidu.g('AdvancedIpExclusionWrapper').innerHTML = htmlStr.join('');
		},
		
		/**
		 * 点击清除事件处理
		 * @param {Object} e
		 */
		clickClearHandler : function (e) {
			var event = e || window.event,
			target = event.target || event.srcElement;
			var index = target.getAttribute('index');
			var input1 = baidu.g('firstNumOf' + index);
			var input2 = baidu.g('secondNumOf' + index);
			input1.value = '';
			input2.value = '';
		}
	})