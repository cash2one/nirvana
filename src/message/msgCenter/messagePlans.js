/**
 * @file src/message/msgCenter/messagePlans.js
 * @author peilonghui@baidu.com
 */


;(function(window, undefined){
	var msgcenter = window.msgcenter;
	var util = msgcenter.util, eventUtil = msgcenter.eventUtil

	var PLAN_TEMPLATE = '<li class="clearfix {{added}}"><span class="fright">' +
						'<a href="javascript:void(0)" class="mc-mp-adel" data-planid= "{{planid}}" style="display:none" >{{adelText}}</a>' +
						'<span class="mc-readonly" style="display:{{hide}};">已添加</span></span>{{planname}}</li>';

	var baidu = window.baidu, _G = baidu.g, _Q = baidu.q, _show = baidu.show, _hide = baidu.hide;
	var _removeClass = baidu.removeClass, _addClass = baidu.addClass, _hasClass = baidu.hasClass;
	var _ui_get = ui.util.get;


	// 对获取到的计划数据进行排序
	var sortPlanData = function(data) {
		return data.sort(function(a, b) {
			return a['planname'].localeCompare(b['planname']);
		})
	}

	var ADDED_PLANIDS = [];

	var tempMap = {}, id2Name = {};
	msgcenter.messagePlans = new er.Action({
		UI_PROP_MAP: {},
		VIEW: 'messagePlans',
		onafterrender: function() {
			var action = this, create_arg = action.arg, planidStr = _ui_get('McAddImportantPlans').mcImportantPlans;
			var planids = [];
			if (planidStr.length) {
				planids = planidStr.split(',');
			}
			//console.log(planids);
			var plansUl = _G('McMpUl');
			var plen = planids.length;
			var hasedPlanNum = _G('McMpHasNum');
			hasedPlanNum.innerHTML = plen;
			tempMap = {};
			id2Name = {};
			while ( plen-- ) {
				tempMap[planids[plen]] = 1;
			}

			fbs.plan.getNameList({
				
				onSuccess: function(response) {
					var data = response.data.listData, len = data.length, di;
					var addedData = [], notAddedData = [], addedNum = 0, notAddedNum = 0;
					data = sortPlanData(data);
					//console.log(data);
					var temp = [];
					for(var i = 0; i < len; i++) {
						di = data[i];
						if (util.indexOf(planids, di.planid.toString()) !== -1) {
							di.added = 'mc-mp-added';
							di.hide = '';
							di.adelText = '取消';
							addedData[addedNum++] = util.tpl(PLAN_TEMPLATE, di);
						} else {
							di.added = '';
							di.hide = 'none';
							di.adelText = '添加';
							notAddedData[notAddedNum++] = util.tpl(PLAN_TEMPLATE, di);
						}
						id2Name[di.planid] = di.planname;
					}

					temp = addedData.concat(notAddedData);


					_G('McMpUl').innerHTML = temp.join('');
					_G('McMpAllNum').innerHTML = len;
				}, 
				onFail: function() {
					ajaxFailDialog('计划列表获取失败', '计划列表获取失败，请稍候重试');
				}
			})

			// 从某个子元素向上寻找其为li的父元素
			var findParentLi = function(elem) {
				do {
					if (!elem) {
						return false;
					}
					if (elem.nodeName == 'LI') {
						return elem;
					} else if (elem.nodeName == 'UL') {
						return false;
					};
					elem = elem.parentNode;
				} while (elem);
			}

			var showHover = function(li) {
				_addClass(li, 'mc-hover');
				_show(_Q('mc-mp-adel', li)[0]);
			}

			var cancelHover = function(li) {
				_removeClass(li, 'mc-hover');
				_hide(_Q('mc-mp-adel', li)[0]);
				return false;
			}

			eventUtil.delegate(plansUl, 'mouseover',
			function(elem) {
				return elem && (elem = findParentLi(elem));
			}, 
			function(evt) {
				var to = this, toli = findParentLi(to);
				showHover(toli);
				return false;
			}).delegate(plansUl, 'mouseout',
			function(elem) {
				return elem && (elem = findParentLi(elem));
			},
			function(evt) {
				var from = this, to = evt.relatedTarget || evt.toElement;
				var fromli = findParentLi(from), toli = findParentLi(to);
				if (fromli && (fromli != toli)) {
					cancelHover(fromli);
				}
			}).delegate(plansUl, 'click', {
				nodeName: 'A'
			}, function(evt) {
				var me = this;
				var data_planid = util.attr(me, 'data-planid');
				var thtml = me.innerHTML;
				var current_li = findParentLi(me), next_sib = me.nextSibling;
				if (thtml == '添加') {
					tempMap[data_planid] = 1;
					_addClass(current_li, 'mc-mp-added');
					_show(next_sib);
					me.innerHTML = '取消';
					hasedPlanNum.innerHTML = (+hasedPlanNum.innerHTML) + 1;
				} else if (thtml == '取消') {
					tempMap[data_planid] = 0;
					_removeClass(current_li, 'mc-mp-added');
					_hide(next_sib);
					me.innerHTML = '添加';
					hasedPlanNum.innerHTML = +(hasedPlanNum.innerHTML) - 1;
				}
				return false;
			})

			_ui_get('McMpOk').onclick = action.getSaveAction();
			_ui_get('McMpCancel').onclick = action.getCancelAction();

		},
		onentercomplete: function() {
			var action = this, create_arg = action.arg;

		},
		getSaveAction: function() {
			var action = this, create_arg = action.arg;
			var planids = create_arg.planids, typeid = create_arg.typeid;
			var changedMap = create_arg.changedMap;
			return function() {
				var result = [], changed = 0, resultNames = [], idx = 0;

				var cancelPlanids = util.filter(planids, function(item) {
					return !tempMap[item];
				});
				if (cancelPlanids.length) {
					changed = 1;
				}

				for (var key in tempMap) {
					if (tempMap[key]) {
						if (util.indexOf(planids, key) == -1) {
							changed = 1;
						}

						if (idx < 3) {
							resultNames[idx]  = id2Name[key];
						} 
						result[idx++] = key;
					}
				}
				//console.log(result);

				var addPlanBtn = _ui_get('McAddImportantPlans'), plansSpan = _G('McImportantPlans');
				var suffixSpan = _G('McImportantPlansSuffix');
				changedMap[typeid] = changedMap[typeid] || {};
				if ((idx > 0) && changed) {
		    		addPlanBtn.mcImportantPlans = (changedMap[typeid]).value = result.join(',');
		    		changedMap.hasSetChanged = 1;
		    		plansSpan.innerHTML = resultNames.join(',')
		    		suffixSpan.innerHTML = '等重点计划';
		    		//plansSpan.onclick = function() {return false;};
		    		changedMap[typeid].value5changed = 1;
		    	} 

		    	// 如果最后没有选中的计划，那么便置空
		    	if ((idx == 0) && (planids.length > 0)) {
		    		addPlanBtn.mcImportantPlans = changedMap[typeid].value = '';
		    		changedMap.hasSetChanged = 1;
		    		plansSpan.innerHTML = '所设置计划';
		    		suffixSpan.innerHTML = '';
		    		//plansSpan.onclick = function(evt) {addPlanBtn.onclick();};
		    		changedMap[typeid].value5changed = 1;
		    	}


				action.onclose();
			}
		},
		getCancelAction: function() {
			var action = this;

			return function() {
				action.onclose();
			}
		},
		onbeforeclose: function(callback) {
			eventUtil.undelegate('McMpUl');
			callback();
		}
	
	});

})(window);

