Requester.debug = {
	/**
	 * 定义请求响应的JSON对象的一个数据模板
	 */
	returnTpl : function() {
		return {
			status : 200,
			// 用于定义模拟数据请求延时时间，默认不开启，需要开启的时候配置该参数值即可，或者只针对特定请求响应数据模拟接口里配置该参数即可
			// added by Wu Huiyao (wuhuiyao@baidu.com)
			// timeout: 1000,
			data : {},
			error : {}
		}
	},
	/**
	 * 是否记录发送的请求
	 * @var
	 */
	log : false,
	/**
	 * 监控
	 * @param {Object} level
	 * @param {Object} param
	 */
    log_ajax : function(level,param){
		var mark = false;
		baidu.g("NavSubUser").innerHTML = "";
		for (var item in param) {
			if(item == "path"){
				baidu.g("NavSubUser").innerHTML += item + ":" + param[item];
			//	console.log(item + ":" + param[item]);
			}
			if (item == "target") {
				mark = true;
			}
			if (mark) {
				baidu.g("NavSubUser").innerHTML += "; " + item + ":" + param[item];
				// console.log(item + ":" + param[item]);
			}
		}
		return param;
	}
};

// 这下面这坨，有空再想想咋搞，要不要把上面的数据都搞下来，真tmd多啊。。。。
Requester.debug.data = {
	'useracct' : {
		'100' : {
			userstat : [1, 2, 3, 4, 6, 7, 11][Math.round(Math.random() * 100)
					% 7],
			balance : 437.11235,
			daysconsumable : -1,
			todaypaysum : 61.01234,

			wregion : '1,2,3,4',
			weekbudget : 8888.88,
			wbudget : 777.77,
			// wbudget : "987.65",
			bgttype : 1,
			offlinestat : {
				'2011-01-06' : [['0', '7'], ['19', '21']],
				'2011-01-07' : [['10', '15'], ['17', '19'], ['23', '24'],
						['17', '19'], ['23', '24'], ['17', '19'], ['23', '24'],
						['17', '19'], ['23', '24'], ['17', '19'], ['23', '24'],
						['17', '19'], ['23', '24'], ['17', '19'], ['23', '24']],
				'2011-01-08' : [['0', '7'], ['19', '21']],
				'2011-01-09' : [['10', '15'], ['17', '19'], ['23', '24']],
				'2011-01-11' : [['0', '7'], ['19', '21']],
				'2011-01-12' : [['10', '15'], ['17', '19'], ['23', '24']],
				'2011-01-13' : [['0', '7'], ['19', '21']],
				'2011-01-14' : [['10', '15'], ['17', '19'], ['23', '24']],
				'2011-01-10' : [['10', '15'], ['17', '19'], ['23', '']]
			},
			clks : 100,
			shows : 200,
			paysum : 300.123123,
			trans : 0.12345,
			clkrate : 0.41235,
			avgprice : 0.62340,
			qrstat1 : 2,
			advancedipblack:['90.0.*.*','90.123.*.*','90.0.*.*','90.123.*.*']
		},
		'101' : {
			userstat : 1,
			balance : 12937.12345,
			daysconsumable : 5,
			todaypaysum : 2144.5234234,
			advancedipblack:['90.0.*.*','90.222.*.*']
		},
		'102' : {
			userstat : 3,
			balance : 1832.82340,
			daysconsumable : 182345,
			todaypaysum : 10.22341,
			advancedipblack:'90.0.*.*',
				advancedipblack:['90.0.*.*','90.333.*.*']
		}
	},

	'planinfo' : {

	     bridgeStat:function() {

	     	return 1;
	     },
	     
	     bridgeEnable:function() {
           return 0;
         },
         
         bridgeError : function(){
           return '用户没有有效的商桥站点';
         },
         
	     unitcnt:function(){
            return {
             'unitcnt':1, 
             'app':0, 
             'sublink':3
            };
        },
		qrstat1 : function() {
			return '1';
		},
		planid : function(index) {
			index = +index;
			return index >= 1000 ? Math.floor(index / 1000) : index;
		},
		planname : function(index) {
		    return index%2 == 0 ?"[auto-03-28_10:16]-3000016975" + Requester.debug.data.planinfo.planid(index):"计划名车巴" + Requester.debug.data.planinfo.planid(index)
			
		},
		planstat : function(index) {
			/*
			 * 计划状态 0, "有效" 绿 1, "处在暂停时段" 黄 2, "暂停推广" 黄 3, "推广计划预算不足" 红 11,
			 * "账户预算不足" 红
			 */
			switch (index % 5 + '') {
				case '0' :
					return 0;
				case '1' :
					return 1;
				case '2' :
					return 2;
				case '3' :
					return 3;
				case '4' :
					return 11;
			}
		},
		pausestat : function(index) {
			/*
			 * 计划状态 0, "有效" 绿 1, "处在暂停时段" 黄 2, "暂停推广" 黄 3, "推广计划预算不足" 红 11,
			 * "账户预算不足" 红
			 */
			switch (index % 5 + '') {
				case '0' :
					return 0;
				case '1' :
					return 1;
				case '2' :
					return 1;
				case '3' :
					return 0;
				case '4' :
					return 0;
			}
		},

		unitcount : function(index) {
			return index % 9;
		},
		region : function(index) {
			return '北京';
		},
		wregion : function(index) {
			return "";
			// return index%2 == 0 ? '1,2,5':'';
		},
		wbudget : function(index) {
			return Math.random(1) * 1000;
			// return "";
		},
		weekbudget : function(index) {
			return 500;
		},
		bgttype : function(index) {
			return 1;
		},
		plancyc : function(index) {
			return [['101', '124'], ['206', '209'], ['306', '309'],
					['315', '319']];
		},
		allnegativecnt : function(index) {
			return 43;
		},
		clks : function() {
			return Math.round(Math.random(1) * 1000);
		},
		clkrate : function() {
			return Math.random(1);
		},
		shows : function() {
			return Math.round(Math.random(1) * 1000);
		},
		paysum : function() {
			return Math.round(Math.random(1) * 1000);
		},
		trans : function() {
			return Math.round(Math.random(1) * 10);
		},
		phonetrans : function() {
			return Math.round(Math.random(1) * 10);
		},
		avgprice : function() {
			return Math.random(1) + 0.5;
		},
		ipblack : function() {
			return ['192.168.2.12']
		},
		showprob : function(index) {
			return index % 2 + 1;
		},
		cpro : function(index) {
			return index % 2;
		},
		cprostat : function(index) {
			// return index%2 == 0 ? '有效' : '无效';
			return index % 2;
		},
		cproprice : function(index) {
			return Math.random(1) * 10;
			// return "";
		},
		showpay : function() {
			return Math.random(1) * 100;
		},
		createtime : function() {
			return "2011-01-18";
		},
		negative : function() {
			return ['否定关键词1', '否定关键词2']
		},
		accuratenegative : function() {
			return ["10", "20", "30"];
		},
		ipblack : function() {
			return ["202.114.12.34"];
		},
		allnegativecnt : function() {
			return ((Math.random()) * 100).toFixed(0);
		},
		allipblackcnt : function() {
			return ((Math.random()) * 100).toFixed(0);
		},
		offlinestat : function() {
			return {
				'2011-01-06' : [['0', '7'], ['19', '21']],
				'2011-01-07' : [['10', '15'], ['17', '19'], ['23', '24'],
						['17', '19'], ['23', '24'], ['17', '19'], ['23', '24'],
						['17', '19'], ['23', '24'], ['17', '19'], ['23', '24'],
						['17', '19'], ['23', '24'], ['17', '19'], ['23', '24']]
			}
		},
		offlinereason : function() {
			return [
					[1],
					[16, 0],
					[5, 2],
					[8],
					[7, 1],
					[3, [[308, "法拉利"], [309, "保时捷"], [102, "悍马"], [16384]]],
					[10, 1],
					[
							12,
							[[308, "wordblack原因1", "{关键词}{通配符}"],
									[309, "wordblack原因2", "关键词2"],
									[16384, "资质理由", "资质绑定被拒"]]]];
		},
		ideatype: function(){
			return  Math.floor((Math.random()*10)%5);
		},
		deviceprefer : function(){
			//return Math.round(Math.random(1) * 2);
			return 0;
			//var allow = [0, 1, 2];
			//return allow[Math.round(Math.random() * 100) % allow.length];
		},
		mPriceFactor : function(){
		    return 0.1;
		},
		
		devicecfgstat : function(){
			//return Math.round(Math.random(1) * 1);
			return 1;
		},
		phonenum : function(){
			var list = [
			 {
                phonenum : '344555-344555344555',
                phonestat : 1
            },
			{
                phonenum : '344555-344555344555',
                phonestat : 1
            },
			{
                phonenum : '344555-344555344555',
                phonestat : 1
            }
			];
			return list[Math.round(Math.random(1) * 2)];
		},
		optsug: function() {
			// LEVELINFO: {
		    //     REASON: {
		    //         'planinfo': [101, 102, 103, 104],
		    //         'unitinfo': [201, 201],
		    //         'ideainfo': [301, 301],
		    //         'ordinfo': [401, 402, 403, 404, 405, 406]
		    //     },
		    //     SUGGESTION: {
		    //         'planinfo': [1001, 1001, 1002, 1002],
		    //         'unitinfo': [2001, 2002],
		    //         'ideainfo': [3001, 3002],
		    //         'wordinfo': [4001, 4002, 4003, 4004, 4005, 4006]
		    //     }
		    // }
		    var pos = Math.floor(Math.random() * 5);
		    var reason = [101, 102, 103, 104];
		    var suggestion = [1001, 1001, 1002, 1002];
			return {
				data: {},
				reason: reason[pos],
				suggestion: suggestion[pos]
			};
		}
	},

	'unitinfo' : {
	    deviceprefer : function(){
            //return Math.round(Math.random(1) * 2);
            return 0;
        },
        devicecfgstat : function(){
            //return Math.round(Math.random(1) * 1);
            return 1;
        },
		planid : function(index) {
			return Requester.debug.data.planinfo.planid(index);
		},
		planname : function(index) {
			return Requester.debug.data.planinfo.planname(index);
		},
		unitid : function(index) {
			return index;
		},
		unitname : function(index) {
			return '单元' + index;
		},
		unitstat : function(index) {
			/*
			 * 单元状态 0, "有效" 绿 1, "暂停推广" 黄 11, "推广计划暂停推广" 黄
			 */
			switch (index % 3 + '') {
				case '0' :
					return 0;
				case '1' :
					return 1;
				case '2' :
					return 11;
			}
		},
		pausestat : function(index) {
			/*
			 * 单元状态 0, "有效" 绿 1, "暂停推广" 黄
			 */

			switch (index % 3 + '') {
				case '0' :
					return 0;
				case '1' :
					return 1;
				case '2' :
					return (index + 1) % 6 == 0 ? 0 : 1;
			}
		},
		unitbid : function(index) {
			return index + 100;
		},
		wordcount : function(index) {
			return index % 9;
		},
		ideacount : function(index) {
			return Math.floor((index || 0) + 100) % 9;
		},// 账户树升级新增数据by mayue@baidu.com
		allnegativecnt : function(index) {
			return 43 + index;
		},
		clks : function(index) {
			return 100 + index;
		},
		clkrate : function() {
			return Math.random(1);
		},
		shows : function(index) {
			return 200 + index;
		},
		paysum : function(index) {
			return 300.234234324 + index;
		},
		trans : function(index) {
			return 10 + index;
		},
		phonetrans : function() {
			return Math.round(Math.random(1) * 10);
		},
		extbind : function() {
			var index = Math.ceil(Math.random() * 100) % 5;
			if (index == 0) {
				return "-";
			} else {
				return Math.ceil(Math.random() * 10000) + "";
			}
		},
		avgprice : function(index) {
			return 0.5234234324 + index;
		},
		createtime : function() {
			return '2011-3-20';
		},
		showpay : function() {
			return Math.random(1) * 100;
		},
		negative : function() {
			return ['否定关键词1', '否定关键词2']
		},
		accuratenegative : function() {
			return ["10", "20", "30"];
		},
		ipblack : function() {
			return ["202.114.12.34"];
		},
		allnegativecnt : function() {
			return ((Math.random()) * 100).toFixed(0);
		},
		offlinereason : function() {
			return [
					[16, 1],
					[5, 2],
					[8],
					[7, 2],
					[3, [[308, "法拉利"], [309, "保时捷"], [102, "悍马"]]],
					[10, 1],
					[
							12,
							[[308, "wordblack原因1", "{关键词}{通配符}"],
									[309, "wordblack原因2", "关键词2"]]]];
		},
		creativecnt: function(){
			return {
				'sublink': Math.floor((Math.random()*10)%2),
				'app':0
			}
		},
		optsug: function() {
			// LEVELINFO: {
		    //     REASON: {
		    //         'planinfo': [101, 102, 103, 104],
		    //         'unitinfo': [201, 201],
		    //         'ideainfo': [301, 301],
		    //         'ordinfo': [401, 402, 403, 404, 405, 406]
		    //     },
		    //     SUGGESTION: {
		    //         'planinfo': [1001, 1001, 1002, 1002],
		    //         'unitinfo': [2001, 2002],
		    //         'ideainfo': [3001, 3002],
		    //         'wordinfo': [4001, 4002, 4003, 4004, 4005, 4006]
		    //     }
		    // }
		    var pos = Math.floor(Math.random() * 3);
		    var reason = [201, 201];
		    var suggestion = [2001, 2002];
			return {
				data: {},
				reason: reason[pos],
				suggestion: suggestion[pos]
			};
		}
	},

	'wordinfo' : {
		planid : function(index) {
			return Requester.debug.data.planinfo.planid(index);
		},
		planname : function(index) {
			return Requester.debug.data.planinfo.planname(index);
		},
		unitid : function(index) {
			return index;
		},
		unitname : function(index) {
			return '单元' + index;
		},
		unitbid : function(index) {
			return index;
		},
		winfoid : function(index) {
			return index;
		},
		wordid : function(index) {
			return index;
		},
		showword : function(index) {
			// return
			// '关键词关键词关键词关键词关键词关键词关键词关键词关键词关键词关键词关键词关键词关键词关键词关键词关键词关键词关键词关键词关键词关键词关键词'
			// + index;
			if (index % 2 == 0) {
				return '&lt<button>关键词关键词关键词关键词关键词关键词</button>' + index;
			}
			return '较短关键词';
		},
		wordstat : function(index) {
		    return [0, 1, 2, 3, 4, 5, 6, 7, 13, 14][index % 10];
			
		},
		planstat : function(index) {
			return Requester.debug.data.planinfo.planstat(index)
		},
		unitstat : function(index) {
			/*
			 * 单元状态 0, "有效" 绿 1, "暂停推广" 黄 11, "推广计划暂停推广" 黄
			 */
			switch (index % 3 + '') {
				case '0' :
					return 0;
				case '1' :
					return 1;
				case '2' :
					return 11;
			}
		},
		pausestat : function(index) {
			switch (index % 2 + '') {
				case '0' :
					return 0;
				case '1' :
					return 1;
			}
		},
		activestat : function(index) {
			switch (index % 2 + '') {
				case '0' :
					return 1;
				case '1' :
					return 0;
			}
		},
		wmatch : function(index) {
			var ind = index % 3;
			switch (ind) {
				case 0 :
					return 31;
				case 1 :
					return 63;
				case 2 :
					return 15;
			}
		},
		wurl : function(index) {
			return 'http://www.baidu.com/?123&456' + index;
		},
		mwurl : function(index) {
            return 'http://www.baidu.com/?123&456' + index;
        },
		shadow_wurl : function(index) {
			return 'http://new.baidu.com/?123&456' + index;
		},
		shadow_mwurl : function(index) {
            return 'http://new.baidu.com/?123&456' + index;
        },
		bid : function(index) {
			return baidu.number.fixed(index * Math.random());
		},
		minbid : function(index) {
			return index * Math.random();
		},
		showqstat : function(index) {
			var list = [11, 12, 13, 21, 23, 30];
			return list[Math.floor(Math.random() * 6)];
		},
		pcshowq : function(index) {
			var list = [11, 12, 13, 21, 23, 30];
			return list[Math.floor(Math.random() * 6)];
		},
		mshowq : function(index) {
			var list = [11, 12, 13, 21, 23, 30, null];
			return list[index % 7];
		},
		clks : function(index) {
			return 100 + index;
		},
		shows : function(index) {
			return 200.03 + index;
		},
		paysum : function(index) {
			return (300 + index) % 60;
		},
		trans : function(index) {
			return Math.round(Math.random(1) * 100) + index;
		},
		avgprice : function(index) {
			// return Math.random() + index;
			return 300.234234324 + index;
		},
		clkrate : function() {
			return Math.random(1);
		},
		showpay : function() {
			return Math.round(Math.random(1) * 100);
		},
		offlinereason : function() {
			return [
					[16, 1],
					[13],
					[15],
					[11],
					[7, 3],
					[
							12,
							[
									[213, "wordblack原因213",
											"{关键词}{通配符}发&lt;达<br/>发大水"],
									[309, "wordblack原因2", "关键词2"]]]];
		},
		wctrl : function(index) {
			return Math.floor(Math.random() * 2);
		},
		bidoptcount : function(index) {
			// 操作
			return Math.round(Math.random(1) * 100) + index;
		},
		pprate : function(index) {
			// 展现概率
			return Math.random(1);
		},
        deviceprefer: function() {
            return 1;
        },
		ideaquality: function(index) {
			return index % 3;
		},
		pageexp: function(index) {
			return index % 6;
		},
		optsug: function() {
			// LEVELINFO: {
		    //     REASON: {
		    //         'planinfo': [101, 102, 103, 104],
		    //         'unitinfo': [201, 201],
		    //         'ideainfo': [301, 301],
		    //         'ordinfo': [401, 402, 403, 404, 405, 406]
		    //     },
		    //     SUGGESTION: {
		    //         'planinfo': [1001, 1001, 1002, 1002],
		    //         'unitinfo': [2001, 2002],
		    //         'ideainfo': [3001, 3002],
		    //         'wordinfo': [4001, 4002, 4003, 4004, 4005, 4006, 4007]
		    //     }
		    // }
		    var pos = Math.floor(Math.random() * 5);
		    var reason = [401, 402, 403, 401, 407];
		    var suggestion = [4001, 4002, 4003, 4007, 4003];
			return {
				data: {
					showratio: 12
				},
				reason: reason[pos],
				suggestion: suggestion[pos]
			};
		}
	},

	'ideainfo' : {
		planid : function(index) {
			return Requester.debug.data.planinfo.planid(index);
		},
		planname : function(index) {
			return Requester.debug.data.planinfo.planname(index);
		},
		unitid : function(index) {
			return index;
		},
		unitname : function(index) {
			return '单元' + index;
		},
		ideaid : function(index) {
			return index;
		},
		shadow_ideaid : function(index) {
			if (index % 2 == 0)
				return null;
			return index + 10000;
		},
		ideastat : function(index) {
			return [0, 1, 2, 4, 5,7][Math.round(Math.random() * 100) % 6];
		},
		shadow_ideastat : function(index) {
			if (index % 2 == 0)
				return null;
			return [0, 1, 2, 4, 5,7][Math.round(Math.random() * 100) % 6];
		},
		pausestat : function(index) {
			switch (index % 2 + '') {
				case '0' :
					return 0;
				case '1' :
					return 1;
			}
		},
		activestat : function(index) {
			switch (index % 2 + '') {
				case '0' :
					return 1;
				case '1' :
					return 0;
			}
		},
		title : function(index) {
			return '{关键词}{通配符文字}{很长很^长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长创<b>意"标</b>\'题}'
					+ index;
		},
		shadow_title : function(index) {
			if (index % 2 == 0)
				return null;
			return '影子——创<b>意"标</b>\'题' + index;
		},
		desc1 : function(index) {
			return '创<b>意"描述</b>&---&lt;&gt;&amp;&quot;----\'一' + index;
		},
		shadow_desc1 : function(index) {
			if (index % 2 == 0)
				return null;
			return '影子——创<b>意"描述</b>\'一' + index;
		},
		desc2 : function(index) {
			return '创<b>意"描述</b>\'二' + index;
		},
		shadow_desc2 : function(index) {
			if (index % 2 == 0)
				return null;
			return '影子——创<b>意"描述</b>\'二' + index;
		},
		url : function(index) {
			return 'http://www.baidu.com/?123&456' + index;
		},
		shadow_url : function(index) {
            if (index % 2 == 0)
                return null;
            return '影子——http://www.baidu.com/?123&456' + index;
        },
		miurl : function(index) {
            return '';//'http://www.baidu.com/?123&456' + index;
        },
		shadow_miurl : function(index) {
			if (index % 2 == 0)
				return null;
			return '';//'影子——http://www.baidu.com/?123&456' + index;
		},
		mshowurl : function(index) {
			return '';//'http://www.baidu.com/' + index;
		},
		showurl : function(index) {
            return 'http://www.baidu.com/' + index;
        },
		shadow_mshowurl : function(index) {
			if (index % 2 == 0)
				return null;
			return '';//'影子——http://www.baidu.com/' + index;
		},
		shadow_showurl : function(index) {
            if (index % 2 == 0)
                return null;
            return '影子——http://www.baidu.com/' + index;
        },
		clks : function() {
			return 10000;
		},
		shows : function() {
			return 20000;
		},
		paysum : function() {
			return 300.234234324;
		},
		trans : function() {
			return 10;
		},
		avgprice : function() {
			return Math.random();
		},
		clkrate : function() {
			return Math.random(1);
		},
		showpay : function() {
			return Math.random(1) * 100;
		},
		offlinereason : function() {
			return [
					[16, 0],
					[11],
					[7, 4],
					[3, [[308, "法拉利"], [309, "保时捷"], [102, "悍马"], [16384]]],
					[10, 1],
					[
							12,
							[[308, "wordblack原因1", "关键词,通配符"],
									[309, "wordblack原因2", "关键词2"]]]];
		},

		deviceprefer : function(){
			return 2;
           // return Math.round(Math.random(1) * 2);
        },
		devicecfgstat : function(){
			return 1;
          //  return Math.round(Math.random(1) * 1);
    	},
        creativecnt:function(){
	        return {
	            'sublink':0,
	            'app':0
	        }
	    },
		optsug: function() {
			// LEVELINFO: {
		    //     REASON: {
		    //         'planinfo': [101, 102, 103, 104],
		    //         'unitinfo': [201, 201],
		    //         'ideainfo': [301, 301],
		    //         'ordinfo': [401, 402, 403, 404, 405, 406]
		    //     },
		    //     SUGGESTION: {
		    //         'planinfo': [1001, 1001, 1002, 1002],
		    //         'unitinfo': [2001, 2002],
		    //         'ideainfo': [3001, 3002],
		    //         'wordinfo': [4001, 4002, 4003, 4004, 4005, 4006]
		    //     }
		    // }
		    var pos = Math.floor(Math.random() * 2);
		    var reason = [301, 301];
		    var suggestion = [3001, 3002];
			return {
				data: {},
				reason: reason[pos],
				suggestion: suggestion[pos]
			};
		}
    
	},
	'creativeIdeaInfo' : {
        planid: function(index) {
            return Requester.debug.data.planinfo.planid(index);
        },
        planname: function(index) {
            return Requester.debug.data.planinfo.planname(index);
        },
        unitid: function(index) {
            return index;
        },
        unitname: function(index) {
            return '单元' + index;
        },
        creativeid: function(index) {
            return index;
        },
        clks    :   function(){
                return 10000;
        },
        shows   :   function(){
                return 20000;
        },
        paysum  :   function(){
                return 300.234234324;
        },
        avgprice : function(){
                return Math.random();
        },
        clkrate : function(){
            return Math.random(1);
        },
        showpay:function(){
            return Math.random(1) * 100;
        },   
       creativetype:function(){
           var type=['sublink'];
            return type[0];
        },    
        content: function(index) {
            var len =Math.round(Math.random()*100) % 6,
                content=[],
                title=['情人<button>e</button>节鲜花','送女友','看病人鲜花','鲜花快递','花儿为何这样红'];
            
            for(var i=0;i<len;i++){
                var temp={};
               
                    temp.title=title[i];
                    temp.url='http://www.baidu.com';
                    content.push(temp);
            }
            
            return content;
        },
        stat : function(index){
            if(appendIdeaLib.userBindStatus){
                return [0,1,99][index % 3];
            }
            return [0,1,2,4,5][Math.round(Math.random()*100) % 5];
        }, 
        pausestat : function(index){
            switch(index%2 + ''){
                case '0':
                    return 0;
                case '1':
                    return 1;
            }
        },
         
        shadowcreativeid: function(index) {
           return index;
        },
            
        shadowcontent  : function(index) {
           var len =Math.round(Math.random()*100) % 5,
                content=[],
                title=['影子1','影子2','影子3','影子4','影子5'];
            
            for(var i=0;i<len;i++){
                var temp={};
               
                    temp.title=title[i];
                    temp.url='http://www.baidu.com';
                    content.push(temp);
            }
            
            return content;
        }, 
            
        shadowstat : function(index){
           
          return [0,1,2,4,5][Math.round(Math.random()*100) % 5];
        },
            
        shadowpausestat : function(index){
            switch(index%2 + ''){
                case '0':
                    return 0;
                case '1':
                    return 1;
            }
        },
      
       
        offlinereason : function(){
            return [
                [16,0],
                [11],
                [7,4],
                [3,
                    [
                        [308,"法拉利"],
                        [309,"保时捷"],
                        [102,"悍马"],
                        [16384]
                    ]
                ],
                [10,1],
                [12,
                    [
                        [308,"wordblack原因1","关键词,通配符"],
                        [309,"wordblack原因2","关键词2"]
                    ]
                ]
            ];  
        },
        
        appname : function(index){
            return 'App名称<button>fd</button>App'+index;
        },
        
        appdevicetype  : function(index){
            return [1,3][index % 2];
        },
        
        version : function(index){
            return '10.0.'+index;
        },
        apimodtime  : function(index){
            var date = new Date(),
                day = date.getDate();
            date = new Date(date.setDate(day + index));
            return baidu.date.format(date,'yyyy-MM-dd');
        },
        mcid: function(index) {
        	return 'app' + Math.floor((Math.random()*100)%20);
        }
    },
    'apps': {
    	id: function(){
    		return Math.floor(Math.random()*1000);
    	},
    	name: function(){
    		return '开发者的<button>fd</button>App' + Math.floor(Math.random()*1000);
    	}
    },
	'customList' : {
		3 : {//计划
			colstype : 1, // 0：默认，1：全部，2：自定义
			customcols : ["planname", "clks", "paysum", "shows", "trans",
					"avgprice", 'showq']
		},
		5 : {//单元
			colstype : 0, // 0：默认，1：全部，2：自定义
			customcols : ["unitname", "planname", "unitbid", "clks", "paysum",
					"shows", "trans", "avgprice"]
		},
		11 : {//关键词
			colstype :1, // 0：默认，1：全部，2：自定义
			customcols : ["showword", "unitname", "planname", "bid", "wmatch",
					"showq", "clks", "paysum", "shows", "trans", "avgprice"]
			// customcols: ["showword","bid", "wmatch", "wurl"]
		},
		7 : {//创意
			colstype : 0, // 0：默认，1：全部，2：自定义
			customcols : ["ideaid", "unitname", "planname", "clks", "paysum",
					"shows", "trans", "avgprice"]
		},
		15 : {
			colstype : 0, // 0：默认，1：全部，2：自定义
			customcols : ["showword", "unitname", "planname", "bid", "wmatch",
					"showq", "clks", "paysum", "shows", "trans", "avgprice"]
			// customcols: ["showword","bid", "wmatch", "wurl"]
		},
		19 : {// KR
			colstype : 0, // 0：默认，1：全部，2：自定义
			customcols : ["showword", "pv_prospect", "pv", "kwc"]
		},
		21 : {
			colstype : 0, // 0：默认，1：全部，2：自定义
			customcols : ["showword", "unitname", "planname", "bid", "wmatch",
					"showq", "clks", "paysum", "shows", "trans", "avgprice"]
			// customcols: ["showword","bid", "wmatch", "wurl"]
		},
		8: {//蹊径
            colstype: 0,        //0：默认，1：全部，2：自定义
            customcols: ["content","creativetype","unitname", "planname", "stat", "clks"]
		},
		9:{ //app
		    colstype: 0,
		    customcols:['appname','appdevicetype','version','apimodtime',"unitname","planname","stat","clks","paysum","shows","avgprice"]
		} 
	},
	'shortcut' : [{
		wfcondid : 1,
		wfcondname : "Kener's search",
		wfconddetail : '[{"name":"查询全部状态，“Kener”","key":"search","value":["100","Kener","fuzzy"]}, {"key":"planname","name":"推广计划包含0","title":"推广计划","type":"text","value":"0"},{"key":"bid","name":"出价在2和60之间","title":"出价","type":"num","value":["2","60"]}]'
	}, {
		wfcondid : 2,
		wfcondname : '<b>sdf</b>&*#XKEJKMMMMMSWWEJLKDJFLJSDLFJLKSJFLDSJDFLKDF',
		wfconddetail : '[{"key":"wmatch","name":" 匹配模式为短语","title":"匹配模式","type":"checkbox","value": {"15":0,"31":1,"63":0}},{"key":"wordstat","name":"状态为有效","title":"状态","type":"select","value":{"key":0,"text":"有效"}}, {"key":"unitname","name":"推广单元包含1","title":"推广单元","type":"text","value":"1"}]'
	}, {
		wfcondid : 2,
		wfcondname : '"查询全部状态，“欧文看对方圣诞节辐射度方法阿雷顿看是了的”;低消费;低平均点击价格;高点击;质量度为一星;推广单元包含爱仕达撒旦法地方阿撒旦法撒的发阿撒旦"',
		wfconddetail : '[{"key":"wmatch","name":" 匹配模式为短语","title":"匹配模式","type":"checkbox","value": {"15":0,"31":1,"63":0}},{"key":"wordstat","name":"状态为有效","title":"状态","type":"select","value":{"key":0,"text":"有效"}}, {"key":"unitname","name":"推广单元包含1","title":"推广单元","type":"text","value":"1"}]'
	}/*, {
		wfcondid : 1,
		wfcondname : "一星",
		wfconddetail : '[{"key":"advSearchShowq","value":"1","name":"质量度为一星"}]'
	}
	{
		wfcondid : 1,
		wfcondname : "计算机端一星",
		wfconddetail : '[{"key":"advSearchShowqPc","value":"1","name":"计算机端质量度为一星"}]'
	},
	{
		wfcondid : 1,
		wfcondname : "移动端一星",
		wfconddetail : '[{"key":"advSearchShowqM","value":"1","name":"移动端质量度为一星"}]'
	}*/],
	'expeStatus' : {
		'kr_expe_searchkeyword' : 0,
		'kr_expe_adpreview' : 1
	}
};

/**
 * 获取重点词推荐的理由
 */
Requester.debug.data.getCorewordRemcdReason = function(index) {
    var data = [
        1, // 高消费
        2, // 高操作
        4, // 行业热词
        3, // 高消费+高操作
        5, // 高消费+行业
        6, // 高操作+行业
        7,  // 高消费+高操作+行业热词
        8, // 消费变化大
        16, // 质量度变化大
        9,  // 高消费+消费变化大
        17, // 高消费+质量度变化大
        10, // 高操作+消费变化大
        18, // 高操作+质量度变化大
        24, // 消费变化大+质量度变化大
        11, // 高消费+高操作+消费变化大
        19, // 高消费+高操作+质量度变化大
        25, // 高消费+消费变化大+质量度变化大
        26  // 高操作+消费变化大+质量度变化大
    ];

    var hasDelRecm = Math.ceil(Math.random() * 100) % 2;

    if (hasDelRecm) {
        data.unshift(
            32,  // 低消费
            64, // 低操作
            96  // 低消费+低操作
        );
    }

    return data[index % data.length];
}
/**
 * 获取重点词详情的部分数据
 * @param index
 */
Requester.debug.data.getCorewordDetail = function(index) {
    var data = {};

    index = index % 15;

    data.reason = Math.pow(2, index);
    // 初始化provavgrank值-3~10， -2：未在该地域投放，-1：无建议, -3:没有有效创意, 0: 右侧，
    // 1-10：左侧第一~第十
    data.provavgrank = "" + Math.ceil(Math.random() * 14 - 4);
    data.provavgrank = (-4 == data.provavgrank)
        ? "-3"
        : data.provavgrank;

    // 排名变化，1表示上升，0表示不变，-1表示下降，2表示不显示变化
    var changeRnage = [1, 0, -1, 2];
    data.rankchg = changeRnage[index % 4];

    if (index == 11) { // 不在左侧
        data.noshowreason = 0;
        data.provavgrank = 0; // 这个是关键
    } else if (index == 12) { // 不在左侧第一
        data.noshowreason = 0;
        data.reason = 2; // 这个是关键
        data.provavgrank = 2;
    } else if (index == 13) { // 没有有效创意
        data.noshowreason = 0;
        data.reason = 128; // 这个是关键，用于产生添加有效创意建议
        data.provavgrank = 2;
    } else if (index == 14) { // 排名下降
        data.reason = 512;
        data.provavgrank = 5;
        data.rankchg = -1;
    } else {
        data.noshowreason = Math.pow(2, index);
    }

//    var noshowreason = data.noshowreason;
    if (data.noshowreason == 2) { // 产生激活关键词建议
        data.reason = 32;
    } else if (data.noshowreason == 1) { // 激活关键词建议
        data.reason = 32;
    } else if (data.noshowreason == 256) { // 账户预算优化建议
        data.reason = 32;
    } else if (data.noshowreason == 512) { // 计划预算优化建议
        data.reason = 32;
    } else if (data.noshowreason == 16) { // 优化出价建议
        data.reason = 32;
    }

    return data;
};
/**
 * 自动出的引导页信息
 * @author Huiyao
 */
Requester.debug.data.intro = [
    {
        id: '220',
        pkgid: '9',
        priority: '1'
    },
    {
        id: '320',
        name: 'aopointactivityintro',
        priority: '3'
    },
    {
        id: '100',
        name: 'mobileintro',
        priority: '2',
        detail: {
            // 行业名称，为空，引导页上不显示
            industryname: '医疗',
            // 同行数量
            peernum: 34123,
            // 是否有权限参加活动
            activity: '1'
        }
    }
];
