/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    manage/modWordPrice.js
 * desc:    修改单元出价
 * author: 	zhouyu
 * date:    $Date: 2011/1/13 $
 */

/**
 *  修改关键词出价
 * @param
 * winfoid {array} 要修改关键词id的数组
 * bid {array} 要修改关键词初始出价的数组
 * unitbid {array} 要修改关键词的单元出价数组
 * name {array} 关键词字面的数组
 * onsubmit {function} 修改成功的回调
 * isUseUnitbid {boolean} [OPTIONAL]是否默认选中单元出价，默认是false
 * beforeSave {function} [OPTIONAL] 在将修改值发送给后端之前执行的函数 by mayue
 * hideUnitbid {boolean} [OPTIONAL] 隐藏掉单元出价 by mayue
 *  showmPriceFactor:是否显示出价比例，不传的话默认为不显示
 *  mPriceFactor{integer}:计划的出价比例，传入showMpriceFactor的时候才看
 *  planid{array}:没有传mPriceFactor的时候，用planid去获取
	 
 */
manage.modWordPrice = new er.Action({
	
	VIEW: 'modWordBid',
	
	IGNORE_STATE : true,
	
	
	CONTEXT_INITER_MAP : {
		init:function(callback){
			var me = this;
			me.setContext("improveSelect",[{
				text : "提高",
				value:0
			},{
				text : "降低",
				value:1
			}]);
			callback();
		}
		
	},
	
	/**
	 * 批量修改初始化显示<各异>
	 * 已修改为 匹配当前出价模式，以及价格 by liuyutong
	 */
	
	onafterrender: function() {
		var me = this, controlMap = me._controlMap;
		var inp = controlMap.modWordBidInput;
		var nav = '';
		var action = '';
		var devicePrefer = '';
		nirvana.manage.handleMpriceFactorShow(me.arg);
		me.initUI();
	},

	
	initUI : function(){
		var me = this,
			controlMap = me._controlMap;
		var inp = controlMap.modWordBidInput;
		
		if(me.arg.winfoid.length == 1){
			if(me.arg.bid[0]){
				inp.setValue(me.arg.bid[0]);
			}else{
				inp.setValue(me.arg.unitbid[0]);
				//兼容已有逻辑的双重保险 by linzhifeng@baidu.com
				me.arg.isUseUnitbid = true;
			}
			if (me.arg.isUseUnitbid){
				baidu.g('ctrlradioboxuseUnitBid').setAttribute('checked','checked');
				//console.log(controlMap)
				controlMap.modWordBidInput.setState('readonly');
			}
		}else{
			baidu.addClass(inp.main, "set_unit_price_ini");
			inp.main.onfocus = function(){
				baidu.removeClass(inp.main, "set_unit_price_ini");
				inp.setValue("");
				inp.main.onfocus = null;
			}
			inp.setValue(nirvana.config.LANG.DIFFERENCE);
		}
		
		controlMap.bidModType.disable(true);
		controlMap.improveBid.disable(true);
	},
	/**
	 * 事件绑定
	 */
	onentercomplete : function(){
		var me = this,
			opttype,
			action,
			controlMap = me._controlMap;
			
		controlMap.modWordBid.onclick = function(){
			controlMap.bidModType.disable(true);
			controlMap.improveBid.disable(true);
			controlMap.modWordBidInput.disable(false);
			baidu.hide(baidu.g("improveWordBidErrorTip"));
		}
		controlMap.improveWordBid.onclick = function(){
			controlMap.bidModType.disable(false);
			controlMap.improveBid.disable(false);
			controlMap.modWordBidInput.disable(true);
			baidu.hide(baidu.g("modWordBidErrorTip"));
		}
		//为ao 账户优化添加 大路添加
		//注释添加及修改 by LeoWang(wangkemiao@baidu.com)
		if ('undefined' != typeof me.arg.fromProcedure && me.arg.fromProcedure == 'ao') { //如果来源是ao
			baidu.addClass('useUnitBid', 'hide');
		}
		//ended
		else {
			if (!me.arg.avatar) {
				baidu.g("useUnitBid").style.display = "block";
				controlMap.useUnitBid.onclick = function(){
					controlMap.bidModType.disable(true);
					controlMap.improveBid.disable(true);
					controlMap.modWordBidInput.disable(true);
					baidu.hide(baidu.g("modWordBidErrorTip"));
					baidu.hide(baidu.g("improveWordBidErrorTip"));
				}
			}
		}
        controlMap.modWordBidInput.onenter = me.modWordBidOk();
        controlMap.improveBid.onenter = me.modWordBidOk();
		controlMap.modWordBidOk.onclick = me.modWordBidOk();
		controlMap.modWordBidCancel.onclick = function(){
			//为取消按钮添加监控
			//add by LeoWang(wangkemiao@baidu.com)
			if ('undefined' != typeof me.arg.fromProcedure && me.arg.fromProcedure == 'ao') { //如果来源是ao
				var logParam = me.arg.logParam;
						
				logParam.type = 0;
				logParam.new_value = controlMap.modWordBidInput.getValue();
						
				nirvana.aoWidgetAction.logCenter('aowidget_batch_modify_bid', logParam);
						
			}
			//add ended
			me.onclose();
		};
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
		me.arg.hideUnitbid && baidu.hide('useUnitBid');
	},

	/**
	 * 修改计划事件
	 */
	modWordBidOk: function(){
		var me = this,
			controlMap = me._controlMap;
		return function(){
			var type = controlMap.modWordBid.getGroup().getValue();
			switch (+type) {
				case 1://修改为定值
					var errorarea = baidu.g("modWordBidErrorTip"),
						winfoids = me.arg.winfoid,
						bid = controlMap.modWordBidInput.getValue(),
						modifyData = {};
					if (bid == "null") {
						errorarea.innerHTML = nirvana.config.ERROR.KEYWORD.PRICE[606];
						return;
					}
                    for (var i = 0, l = winfoids.length; i < l; i++) {
						modifyData[winfoids[i]] = {
							"bid": bid
						};
					}
					
					var callback = me.arg.beforeSave;
					if (callback && callback.call(me, bid, winfoids, errorarea) === false ) {
					    return;
					};
					
					fbs.keyword.modBid({
						winfoid: winfoids,
						bid: bid,
						onSuccess: me.operationSuccessHandler(modifyData),
						onFail: me.saveSameFailHandler(errorarea)
					});
					break;
				case 2://提高、降低
					var modtype = controlMap.bidModType.getValue(),
						value = controlMap.improveBid.getValue(),
						bid = me.arg.bid,
						winfoids = me.arg.winfoid,
						errorarea = baidu.g("improveWordBidErrorTip"),
						modifyData = {};
					if(baidu.trim(value) == ""){
						baidu.g("improveWordBidErrorTip").innerHTML = nirvana.config.ERROR.KEYWORD.PRICE[605];
						baidu.show(errorarea);
						return;
					}
					var reg = /^[0-9,.]*$/;
					if(!reg.test(value)){
						baidu.g("improveWordBidErrorTip").innerHTML = nirvana.config.ERROR.KEYWORD.PRICE[606];
						baidu.show(errorarea);
						return;
					}
					value = +value;
					var resultBid = [];
					if(+modtype == 0){
						for (var i = 0; i < bid.length; i++) {
							resultBid[i] = +baidu.number.fixed(+bid[i] + value);
							modifyData[winfoids[i]] = {"bid":resultBid[i]};
						}
					}else{
						for (var i = 0; i < bid.length; i++) {
							resultBid[i] = +baidu.number.fixed(+bid[i] - value);
							modifyData[winfoids[i]] = {"bid":resultBid[i]};
						}
					}
					
					var callback = me.arg.beforeSave;
                    if (callback && callback.call(me, resultBid, winfoids, errorarea) === false ) {
                        return;
                    };
					
					fbs.keyword.modBid({
						winfoid: winfoids,
						bid: resultBid,
						onSuccess: me.operationSuccessHandler(modifyData),
						onFail: me.saveDiffFailHandler(errorarea)
					});
					break;
				case 0://使用单元出价
                    var title = '使用单元出价',
                    	msg = '您确定将选中的关键词出价设置为单元出价吗？',
						winfoids = me.arg.winfoid,
						modifyData = {};
                    for (var i = 0, l = winfoids.length; i < l; i++) {
						modifyData[winfoids[i]] = {
							"bid": null
						};
					}
					ui.Dialog.confirm({
						title: title,
						content: msg,
						onok: function(){
						//	var errorarea = baidu.g("modWordBidErrorTip");
						    var callback = me.arg.beforeSave;
                            if (callback && callback.call(me) === false ) {
                                return;
                            };
                            
							fbs.keyword.modBid({
								winfoid: winfoids,
								bid: "null",
								onSuccess: me.operationSuccessHandler(modifyData),
								onFail: function(response){
									me.banError(response, baidu.g("improveWordBidErrorTip"));
								}
							});
						}
					});
					break;
			}
		}
	},
	
	
	/**
	 * 操作成功，清空缓存，refresh页面
	 */
    operationSuccessHandler : function (modifyData) {
        var me = this,
			controlMap = me._controlMap,
			action;

        return function(response){
			var dat = response.data,
				modType,
				newValue,
				opttype;
			for(var item in dat){
				for(var i in dat[item]){
					modifyData[item][i] = dat[item][i];
				}
			}
			fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
			fbs.material.ModCache('wordinfo',"winfoid", modifyData);
			if (response.status != 300) {
				// 为ao添加监控 add by LeoWang(wangkemiao@baidu.com);
				if ('undefined' != typeof me.arg.fromProcedure && me.arg.fromProcedure == 'ao') { //如果来源是ao
					action = me.arg.action;
					if (action.getContext('opttype')) {
						opttype = action.getContext('opttype');
						
						var logParam = me.arg.logParam;
						
						logParam.type = 1;
						
						if (controlMap.modWordBid.getChecked()) {
							logParam.new_value = controlMap.modWordBidInput.getValue();
						} else {
							switch (controlMap.bidModType.getValue()) {
								case 0: // 提高
									logParam.new_value = '+' + controlMap.improveBid.getValue();
									break;
								case 1: // 降低
									logParam.new_value = '-' + controlMap.improveBid.getValue();
									break;
							}
						}
						
						nirvana.aoWidgetAction.logCenter('aowidget_batch_modify_bid', logParam);
						
						action.setContext('pageNo', 1);
						action.refreshSelf(action.getStateMap());
					}
				}// add ended
				//如果来源是效果分析 add by yanlingling@baidu.com
				else if('undefined' != typeof me.arg.fromProcedure && me.arg.fromProcedure == 'effectAnalyse'){
						//console.log("效果分析");
						action = me.arg.action;
				     	var winfoid=me.arg.winfoid,
				     	    rawValue;
						//修改工具箱页面缓存的表格数据
						var tableList = ui.util.get("analyseTableList"),
						    tableTool = nirvana.effectAnalyse.keywordList;
							if (controlMap.modWordBid.getChecked()) {//修改出价
							    modType="1";
								 }
							else if(controlMap.useUnitBid.getChecked()){//使用单元出价
							     modType="2";
							}
							else{//提高、降低
								 modType="3";
							}
							for (var i = 0;i < winfoid.length; i++){
                                switch (modType) {
                                    case "1"://直接修改
                                        newValue = baidu.number.fixed(+controlMap.modWordBidInput.getValue());
                                       // tableTool.modifyTableData(tableList.datasource, winfoid[i], "bid", newValue); //修改表格当前的展现值
                                       // tableTool.modifyTableData(action.getContext("allTableData"), winfoid[i], "bid", newValue);//修改表格数据缓存的当前展现值
                                        //action.getContext('listDataObj')[winfoid[i]]['bid'] = newValue; //修改所有查询数据的值
                                        break;
                                    case "3": //提高、降低
                                        rawValue = +me.arg.bid[i];
                                        switch (controlMap.bidModType.getValue()) {
                                            case 0: // 提高
                                                var value = +controlMap.improveBid.getValue();
                                                newValue = baidu.number.fixed(rawValue + value);
                                                
                                                break;
                                            case 1: // 降低
                                                var value = +controlMap.improveBid.getValue();
                                                newValue = baidu.number.fixed(rawValue - value);
                                                //console.log("new -"+newValue);
                                                break;
                                        }
										//tableTool.modifyTableData(tableList.datasource, winfoid[i], "bid", newValue); //修改表格当前的展现值
                                      //  tableTool.modifyTableData(action.getContext("allTableData"), winfoid[i], "bid", newValue);//修改表格数据缓存的当前展现值
                                      //  action.getContext('listDataObj')[winfoid[i]]['bid'] = newValue; //修改所有查询数据的值
                                        break;
                                    case "2"://使用单元出价
                                        // console.log("d单元");
                                        newValue = null;
                                       // tableTool.modifyTableData(tableList.datasource, winfoid[i], "bid", newValue); //修改表格当前的展现值
                                       // tableTool.modifyTableData(action.getContext("allTableData"), winfoid[i], "bid", newValue);//修改表格数据缓存的当前展现值
                                       // action.getContext('listDataObj')[winfoid[i]]['bid'] = newValue; //修改所有查询数据的值
                                        break;
                                    default:
                                        break;
                                        
                                        
                                }
								tableTool.modifyTableData(tableList.datasource, winfoid[i], "bid", newValue); //修改表格当前的展现值
                                tableTool.modifyTableData(action.getContext("allTableData"), winfoid[i], "bid", newValue);//修改表格数据缓存的当前展现值
                                tableTool.modifyTableData(action.getContext("filteredAllTableData"), winfoid[i], "bid", newValue);//修改筛选后表格数据缓存的当前展现值
                               
								action.getContext('listDataObj')[winfoid[i]]['bid'] = newValue; //修改所有查询数据的值
                                        
							
							}
						//console.log(tableList.datasource);
						//如果被筛选
						 if (tableList.filterCol["bid"] == true) {
                                    tableTool.filterChangeHandler(action)();
                                }
                                else {
                                    tableList.render(tableList.main);
									tableTool.showFolders(action);//添加监控文件夹
                                    
                                }	
						//tableList.render(tableList.main);
					
						//监控
						var logparam = {};
							logparam.batchOpType = 'bid';
							nirvana.effectAnalyse.lib.logCenter("",logparam);
						
				}
				
				else {
					er.controller.fireMain('reload', {});
				}
				// Added by Wu Huiyao(wuhuiyao@baidu.com)
                // 添加处理成功的回调函数
                var onsubmit = me.arg.onsubmit;
                if (onsubmit && (typeof onsubmit === 'function')) {
                    onsubmit({
                    	modifyData : modifyData
                    });
                }
				me.onclose();
				
			}
		};			
    },
	
	/**
	 * 提高或降低出价失败
	 */
	saveDiffFailHandler:function(errorarea){
		var me = this;
		return function(data){
			if (data.status != 500) {
				var error = data.error, 
					errorcode,
					winfoids = [];
				if (error) {
					for (var item in error) {
						winfoids[winfoids.length] = item;
					}
					if (winfoids.length > 0) {
						errorcode = error[winfoids[0]].bid.code;
					}
					me.displayBatchError(errorcode,winfoids,errorarea);
				}
				else {
					me.displayError(data.errorCode.code,errorarea);
				}
			}else{
				me.banError(data, errorarea);
			}
		}
	},
	
	/**
	 * 部分关键词提高或降低出价后低于或高于限制
	 * @param {Object} errorcode
	 * @param {Object} errorarea
	 */
	displayBatchError: function(errorcode,errorwordids,errorarea){
		var me = this,
			winfoids = me.arg.winfoid,
			word = me.arg.name,
			obj = {},
			l = errorwordids.length,
			errorTip = [];
			
		for (var i = 0, len = winfoids.length; i < len; i++) {
			obj[winfoids[i]] = word[i];
		}
		
		if(errorcode == 607){
			errorTip[errorTip.length] = ui.format(nirvana.config.ERROR.KEYWORD.PRICE["batchLow"],l);
		}else if(errorcode == 608){
			errorTip[errorTip.length] = ui.format(nirvana.config.ERROR.KEYWORD.PRICE["batchHigh"],l);
		}
		
		errorTip[errorTip.length] = "<div id='wordBatchError' class='word_batch_error'>";

		for (var j = 0; j < l; j++) {
			//这里需要encode
			errorTip[errorTip.length] = "<div>" + baidu.encodeHTML(obj[errorwordids[j]]) + "</div>";
		}

		errorTip[errorTip.length] = "</div>";
		errorarea.innerHTML = errorTip.join("");
		// 第二次出现时height为0，通过css解决
		//baidu.g("wordBatchError").style.height = (baidu.g("wordBatchError").offsetHeight < 155 ? baidu.g("wordBatchError").offsetHeight : 155) + "px";
		errorarea.style.display = "block";
	},
	
	/**
	 * 修改失败(统一修改出价)
	 */
	saveSameFailHandler: function(errorarea){
		var me = this;
		return function(data){
			if (data.status != 500) {
				var error = fbs.util.fetchOneError(data), 
					errorcode;
				if (error) {
					for (var item in error) {
						errorcode = error[item].code;
						me.displayError(errorcode,errorarea);
					}
				}
				else {
					me.displayError(data.errorCode.code,errorarea);
				}
			}else{
				me.banError(data, errorarea);
			}
		}
	},
	
	/**
	 * 封禁提示
	 * @param {Object} response
	 * @param {Object} errorarea
	 */
	banError: function(response, errorarea){
		var me = this;
		if (response.status == 500 && 
				response.errorCode && response.errorCode.code == 408) {
			me.displayError(408, errorarea);
		}
		else {
			ajaxFail(0);
		}
	},
	
	/**
	 * 显示错误信息
	 * @param {Object} errorcode
	 */
	displayError: function(errorcode,errorarea){
		var me = this;
		if (errorcode == 605 || errorcode == 607 || errorcode == 608 || errorcode == 699 || errorcode == 606 || errorcode == 408) {
			errorarea.innerHTML = nirvana.config.ERROR.KEYWORD.PRICE[errorcode];
			errorarea.style.display = "block";
		}
	}
}); 


/**
 *  修改关键词出价-高级修改
 *  @author : linzhifeng@baidu.com
 */
manage.modWordPriceAdv = new er.Action({
	
	VIEW: 'modWordBidAdv',
	
	IGNORE_STATE : true,
	
	CONTEXT_INITER_MAP : {},
	
	onafterrender: function(){

	},
	
	/**
	 * 事件绑定
	 */
	onentercomplete : function(){
		var me = this,
			controlMap = me._controlMap,
		    list = me.arg.list,
			i,
			len = list.length,
		    html = [],
			inputObj;
		
		baidu.g('ModWordBidTip').innerHTML = me.arg.message;
		
		html.push("<table><tbody>");
		for (i = 0; i < len; i++){
			if (i%2 == 0){
				html.push('<tr>');
			}
			html.push('<td><div class="modbid_table_0">' + insertWbr(baidu.encodeHTML(list[i].showword)) + '</div></td>');
			html.push('<td><div class="modbid_table_1" id="ModBidAdvInput_' + i + '"></div></td>');
			html.push('<td><div class="modbid_table_2 warn" id="ModBidAdvError_' + list[i].winfoid + '"></div></td>');
			if (i%2 == 1){
				html.push('</tr>');
			}
		}
		if (len%2 == 1){
			html.push('<td></td><td></td><td></td></tr>');
		}
		html.push("</tbody></table>");
		baidu.g('ModWordBidEditWrap').innerHTML = html.join('');
		if (baidu.g('ModWordBidEditWrap').offsetHeight > 215){
			baidu.g('ModWordBidEditWrap').style.height = '215px';
		}else{
			baidu.g('ModWordBidEditWrap').style.height = 'auto';
		}
		
		me.submitList = {};
		for (i = 0; i < len; i++){
			me.submitList[list[i].winfoid] = {
				winfoid : list[i].winfoid,
				bid : list[i].bid,
				validity : true
			};
			inputObj = ui.util.create('TextInput', {
            	id: 'ModBidAdvInput_' + list[i].winfoid,
				width: 50,
				value:list[i].bid
          	});
			inputObj.appendTo(baidu.g('ModBidAdvInput_' + i));
			inputObj.main.onkeyup = me.getValidateInput();
		}
		
		controlMap.modWordBidOk.onclick = me.modWordBidOk();
		controlMap.modWordBidCancel.onclick = function(){
			me.onclose();
		};
		
		// Dialog二次定位标识
		nirvana.subaction.isDone = true;
	},
	
	/**
	 * 出价验证
	 */
	getValidateInput : function(){
		var me = this,
		    controlMap = me._controlMap;
		return function(e){
			var event = window.event || e,
			    target = event.srcElement || event.target,
				value = this.value,
				winfoid,
				errorWrap;
			winfoid = target.id.substr(target.id.indexOf('_')+1);
			errorWrap = baidu.g('ModBidAdvError_' + winfoid);
			
			if (value == ''){
				errorWrap.innerHTML = '出价不能为空';//nirvana.config.ERROR.KEYWORD.PRICE[605];//
				me.submitList[winfoid].validity = false;
			}else if (isNaN(+value)){
				errorWrap.innerHTML = '必须为数字';//nirvana.config.ERROR.KEYWORD.PRICE[606];//
				me.submitList[winfoid].validity = false;
			}else if(+value <= nirvana.config.NUMBER.BID_MIN){
				errorWrap.innerHTML = '必须高于0元';//nirvana.config.ERROR.KEYWORD.PRICE[607];//
				me.submitList[winfoid].validity = false;
			}else if(+value >= nirvana.config.NUMBER.BID_MAX){
				errorWrap.innerHTML = '不能高于999.99元';//nirvana.config.ERROR.KEYWORD.PRICE[608];//
				me.submitList[winfoid].validity = false;
			}else if(value - fixed(value) != 0){
				errorWrap.innerHTML = '只能保留两位小数';//nirvana.config.ERROR.KEYWORD.PRICE[699];//
				me.submitList[winfoid].validity = false;
			}else{
				errorWrap.innerHTML = '';
				me.submitList[winfoid].bid = fixed(value);//保留2位
				me.submitList[winfoid].validity = true;
			}
			controlMap.modWordBidOk.disable(false);
			for (var key in me.submitList){
				//console.log(me.submitList[key].validity)
				if (!me.submitList[key].validity){
					controlMap.modWordBidOk.disable(true);
					break;
				}
			}
		}
	},
	
	/**
	 * 修改计划事件
	 */
	modWordBidOk: function(){
		var me = this,
			controlMap = me._controlMap;
		return function(){
			var submitList = me.submitList,
				modifyData = {},
				winfoids = [],
				resultBid = [];
			for (var key in submitList){
				winfoids.push(submitList[key].winfoid);
				resultBid.push(submitList[key].bid);
				modifyData[submitList[key].winfoid] = {"bid":submitList[key].bid};
			}
			//console.log(submitList,winfoids,resultBid)
			fbs.keyword.modBid({
				winfoid: winfoids,
				bid: resultBid,
				onSuccess: me.operationSuccessHandler(modifyData),
				onFail: me.operationFailHandler(baidu.g('ModWordBidError'))
			});
		}
	},
	
	
	/**
	 * 操作成功，清空缓存，refresh页面
	 */
    operationSuccessHandler : function (modifyData) {
        var me = this;
        return function(response){
			//console.log(response)
			var dat = response.data;
			for(var item in dat){
				for(var i in dat[item]){
					modifyData[item][i] = dat[item][i];
				}
			}
			//fbs.avatar.getMoniWords.ModCache("winfoid", modifyData);
			//fbs.material.ModCache('wordinfo',"winfoid", modifyData);
			if (response.status != 300) {
				me.onclose();
				//er.controller.fireMain('reload', {});
			}
		};			
    },
	
	/**
	 * 修改出价失败
	 */
	operationFailHandler : function(errorarea){
		var me = this;
		return function(data){
			if (data.status != 500) {
				var error = data.error, 
					errorcode,
					winfoids = [];
				if (error) {
					for (var item in error) {
						winfoids[winfoids.length] = item;
					}
					if (winfoids.length > 0) {
						errorcode = error[winfoids[0]].bid.code;
					}
					me.displayBatchError(errorcode,winfoids,errorarea);
				}
				else {
					me.displayError(data.errorCode.code,errorarea);
				}
			}else{
				ajaxFail(0);
			}
		}
	},
	
	/**
	 * 部分关键词提高或降低出价后低于或高于限制
	 * @param {Object} errorcode
	 * @param {Object} errorarea
	 */
	displayBatchError: function(errorcode,errorwordids,errorarea){
		var me = this,
			winfoids = me.arg.list.winfoid,
			word = me.arg.list.showword,
			obj = {},
			l = errorwordids.length,
			errorTip = [];
			
		for (var i = 0, len = winfoids.length; i < len; i++) {
			obj[winfoids[i]] = word[i];
		}
		
		if(errorcode == 607){
			errorTip[errorTip.length] = ui.format(nirvana.config.ERROR.KEYWORD.PRICE["batchLow"],l);
		}else if(errorcode == 608){
			errorTip[errorTip.length] = ui.format(nirvana.config.ERROR.KEYWORD.PRICE["batchHigh"],l);
		}
		
		errorTip[errorTip.length] = "<div id='wordBatchError' class='word_batch_error'>";

		for (var j = 0; j < l; j++) {
			errorTip[errorTip.length] = "<div>" + obj[errorwordids[j]] + "</div>";
		}

		errorTip[errorTip.length] = "</div>";
		errorarea.innerHTML = errorTip.join("");
		baidu.g("wordBatchError").style.height = (baidu.g("wordBatchError").offsetHeight < 155 ? baidu.g("wordBatchError").offsetHeight : 155) + "px";
		//errorarea.style.display = "block";
	},
	
	/**
	 * 显示错误信息
	 * @param {Object} errorcode
	 */
	displayError: function(errorcode,errorarea){
		var me = this;
		if (errorcode == 605 || errorcode == 607 || errorcode == 608 || errorcode == 699 || errorcode == 606) {
			errorarea.innerHTML = nirvana.config.ERROR.KEYWORD.PRICE[errorcode];
			//errorarea.style.display = "block";
		}else{
			errorarea.innerHTML = '';
		}
	}
}); 
