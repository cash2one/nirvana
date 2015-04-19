/**
 * 获得离线理由
 * @param {Object} level
 * @param {Object} params
 */
Requester.debug.GET_material_offlinereason = function(level, params){
/*	return this.GET_material(params.level,{
		fields	: ['offlinereason']
	});*/
	var rel = new Requester.debug.returnTpl();

	if(params.level=='creativeinfo'){
	     rel.data = [
            [2,  [
	                ["","{关键词}{通配符}发&lt;达发大水"],
	                ["wordblack原因2","关键词2"],
	                ["wordblack原因2","关键词2"],
	                ["wordblack原因2","关键词2"],
	                [ "123","1hfgg23<br/><br/>324jfdlja53"]
              	]
            ],
			[7,6],
			[17],
			[4,1],
            [3,
                [
                    ["wordblack原因213","{关键词}{通配符}发&lt;达发大水"],
                    ["wordblack原因2","关键词2"],
                    ["wordblack原因2","关键词2"],
                    ["wordblack原因2","关键词2"],
                    [ "123","1hfgg23<br/><br/>324jfdlja<br/>53"]
                ]
            ],
            [15,
                [
                    ["wordblack原因213","{关键词}{通配符}发&lt;达发大水"],
                    ["wordblack原因2","关键词2"],
                    ["wordblack原因2","关键词2"],
                    ["wordblack原因2","关键词2"],
                    [ "123","1hfgg23<br/><br/>324jfdlja53"]
                ]
            ]
        ];
     } else {
     	rel.data = [
            [5],
            [5, 1],
     	    [2,'28,29'],
     	    [6, 10],
     	    [21, 5],
			[16,1],
			[13],
			[15],
			[19],
			[11],
			[7,3],
			[4,1],
			[3,
			    [  
			        [10,"喵喵"],
					[1024,"法拉利"],
					[1024,"保时捷"],
					[2048,"悍马"],
					['不宜推广$$$信',""],
					['不宜推广信息巴拉拉巴拉拉',"闫玲玲"],
					[5120,"悍马5122"],
					[9216, 'sth']
			    ]
			],
			[20,
              [  [10,"喵喵"],
                 [1024,"法拉利"],
                 [1024,"保时捷"],
                 ['不宜推广信息巴拉拉巴拉拉',"闫玲玲"],
                 ['不宜推广信息巴拉拉巴拉拉',"闫玲玲"],
                 [5120,"悍马5122"]
                 ]
              ],  
			[12,
				[
					[213,"wordblack原因213","{关键词}{通配符}发&lt;达<br/>发大水"],
					[309,"wordblack原因2","关键词2"],
					[5120,"wordblack原因2","关键词2"],
					[16384,"wordblack原因2","关键词2"],
					[8192, "123","1hfgg23<br/><br/>324jfdlja<br/>53"]
				]
			]
		];
     }
	
	// 模拟数据请求延迟
	rel.timeout = 1000;
	return rel;
};
	
/**
 * 获取某个层级物料数据
 * @param {Object} level
 * @param {Object} param
 */
Requester.debug.GET_material = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	// rel.timeout = 3000;
	var maxNum = (kslfData == 4 ? 0 : 90); //prompt('number', 0);
	// var maxNum = 0;
//	maxNum = (level == "planinfo") ? 10 : ((level == "unitinfo") ? 0 : maxNum);
//	rel.status = 500;
	switch (level) {
		case 'useracct':
			if (param.starttime) {
			
			} else {
				rel.data.listData = [{}];
				var nowUserUid = 100;
				for (var i = 0, len = param.fields.length; i < len; i++) {
					rel.data.listData[0][param.fields[i]] = Requester.debug.data[level][nowUserUid][param.fields[i]]
				}
			}
			break;
		case "planinfo":
			if (param.condition && param.condition.planid) {
				var idArr = param.condition.planid
			}
		case "unitinfo":
			if (param.condition && !idArr) {
				var idArr = param.condition.unitid
			}
		case "ideainfo":
			//rel.status = 800;
			rel.data.listData = [];
			//console.log(idArr)
			if(!idArr){
			    var pid = 0;
			    if(param.condition&&param.condition.planid){
			        pid = param.condition.planid*1000;
			    }
				for (var j = 0; j < maxNum; j++){
					rel.data.listData[j] = {};
					for (var i = 0, len = param.fields.length; i < len; i++) {
						rel.data.listData[j][param.fields[i]] = Requester.debug.data[level][param.fields[i]](j+1+pid);
					}
				}
			}else{
				 /*if(param.fields.length == 1){
					rel.status = 400
					console.log(1,param)
				}*/
				for ( var k = 0 ; k < idArr.length ; k++){
					rel.data.listData[k] = {};
					//rel.status = 500;
					for (var e = 0, len2 = param.fields.length; e < len2; e++) {
						rel.data.listData[k][param.fields[e]] = Requester.debug.data[level][param.fields[e]](idArr[k]);
					}
					
				}
			}
			/**
			 * 
			if(level != 'planinfo'){
				rel.data = null;
				rel.status = 800;
			}
			 */
			break;
		case "wordinfo":
			rel.data.listData = [];
			
			if (param.condition && param.condition.winfoid) {
				var idArr = param.condition.winfoid;
				var maxNum = idArr.length; 
				for (var j = 0; j < maxNum; j++) {
					rel.data.listData[j] = {};
					for (var i = 0, len = param.fields.length; i < len; i++) {
						rel.data.listData[j][param.fields[i]] = Requester.debug.data[level][param.fields[i]]((j % 9 + 1) * 1000 + j);
					}
					rel.data.listData[j].winfoid = idArr[j];
				}
			}
			else {
				var maxNum = 150; //prompt('number', 0)
				for (var j = 0; j < maxNum; j++) {
					rel.data.listData[j] = {};
					for (var i = 0, len = param.fields.length; i < len; i++) {
					//	rel.data.listData[j][param.fields[i]] = Requester.debug.data[level][param.fields[i]]((j % 9 + 1) * 1000 + j);
						rel.data.listData[j][param.fields[i]] = Requester.debug.data[level][param.fields[i]](j);
					}
				}
			}
			break;
		}
	return rel;
};

/**
 * 获取某个层级物料数据（包括已删除数据）
 * @param {Object} level
 * @param {Object} param
 */
Requester.debug.GET_material_name = function(level, param){
	var rel = new Requester.debug.returnTpl();
	//	rel.status = 500;
	if (param.isdel.length > 1) {
		rel.status = 800;
	}
	level = (level == "creativeinfo" || level == "creativeideainfo") ? "creativeIdeaInfo" : level;
			
	var l = Math.round(Math.random() * 100) % 10;
	var l = 70;
	rel.data.listData = [];
	for (var j = 0; j < l; j++) {
		rel.data.listData[j] = {};
		for (var i = 0, len = param.fields.length; i < len; i++) {
			rel.data.listData[j][param.fields[i]] = Requester.debug.data[level][param.fields[i]](j);
			rel.data.listData[j].isdel = 1;
		}
	}
	return rel;
};

/**
 * 获取物料数量
 * @param {Object} level
 * @param {Object} param
 */
Requester.debug.GET_material_count = function(level,param){
	var rel = new Requester.debug.returnTpl();
	switch(level){
		case "planinfo":
			rel.data = 100;
		case "unitinfo":
			rel.data = 1000;
		case "wordinfo":
			rel.data = 5000;
		case "ideainfo":
			rel.data = 50;
	}
	return rel;
};
	
	
/**
 * 获取排行榜数据
 * @param {Object} level
 * @param {Object} param
 */
Requester.debug.GET_mars_top = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.status = 200;
	var relList = [];
	switch (param.level) {
	case "planinfo":
	    //rel.status = 500;
		for (var i = 1; i < 11; i++) {
			relList.push({
				planid: 100 + i,
				planname: "很长很长特别长的推广计划<b>1000" + i + "</b>sMSMFDLSFMSDLM",
				planstat: [0,1,2,3,11][Math.round(Math.random()*100) % 5],
				clks: Math.round(Math.random(1) * 1000),
				shows: Math.round(Math.random(1) * 100000),
				paysum: Math.round(Math.random(1) * 100),
				showpay: Math.round(Math.random(1) * 1000),
				trans: Math.round(Math.random(1) * 30),
				phonetrans: Math.round(Math.random(1) * 30),
				clkrate: Math.random(1),
				avgprice: Math.round(Math.random(1) * 400) / 100	
			});
		}
		break;
	case "unitinfo":
		for (var i = 1; i < 11; i++) {
			relList.push({
				planid: 100 + i,
				planname: "很长很长特别长的推广计划<b>1000" + i + "</b>sMSMFDLSFMSDLM",
				planstat: [0,1,2,3,11][Math.round(Math.random()*100) % 5],
				unitid: 100 + i,
				unitname: "特殊符号跳转单元=（**&……￥" + i + "&",
				unitstat: [0,1,11][Math.round(Math.random()*100) % 3],
				clks: Math.round(Math.random(1) * 1000),
				shows: Math.round(Math.random(1) * 100000),
				paysum: Math.round(Math.random(1) * 100),
				showpay: Math.round(Math.random(1) * 1000),
				trans: Math.round(Math.random(1) * 30),
				phonetrans: Math.round(Math.random(1) * 30),
				clkrate: Math.random(1),
				avgprice: Math.round(Math.random(1) * 400) / 100	
			});
		}
		break;
	case "wordinfo":
		for (var i = 1; i < 11; i++) {
			relList.push({
				planid: 100 + i,
				planname: "很长很长特别长的推广计划<b>1000" + i + "</b>sMSMFDLSFMSDLM",
				planstat: [-1,1,2,3,11][Math.round(Math.random()*100) % 5],
				unitid: 100 + i,
				unitname: "很长很长特别长的推广单元<b>1000" + i + "</b>sMSMFDLSFMSDLM",
				unitstat: [-1,1,11][Math.round(Math.random()*100) % 3],
				winfoid: 100 + i,
				showword: "很长很长特别长的推广单元<b>1000" + i + "</b>sMSMFDLSFMSDLM",
				wordstat: [-1,1,2,3,4,5,6][Math.round(Math.random()*100) % 7],
				clks: Math.round(Math.random(1) * 1000),
				shows: Math.round(Math.random(1) * 100000),
				paysum: Math.round(Math.random(1) * 100),
				showpay: Math.round(Math.random(1) * 1000),
				trans: Math.round(Math.random(1) * 30),
				phonetrans: Math.round(Math.random(1) * 30),
				clkrate: Math.random(1),
				avgprice: Math.round(Math.random(1) * 400) / 100	
			});
		}
		//relList = [];
		break;
	}
	rel.data.listData = relList;
	return rel;
};
	
/**
 * 获取用户自定义列
 */
Requester.debug.GET_mtlcustomcols_custom = function(level, param) {
	var rel = new Requester.debug.returnTpl();
	rel.data = {
		colstype : Requester.debug.data.customList[param.dimlevel].colstype, // 0：默认，1：全部，2：自定义
		customcols : Requester.debug.data.customList[param.dimlevel].customcols
	};
	return rel;
};
/**
 * 修改用户自定义列
 */
Requester.debug.MOD_mtlcustomcols = function(level, param) {
	Requester.debug.data.customList[param.dimlevel].colstype = param.colstype;
	Requester.debug.data.customList[param.dimlevel].customcols = [];
	for (var i = 0, len = param.customcols.length; i < len; i++) {
		Requester.debug.data.customList[param.dimlevel].customcols[i] = param.customcols[i];
	}
	var rel = new Requester.debug.returnTpl();
	return rel;
};
/**
 * 获取关键词是否存在
 * 
 * @param {Object}
 *            level
 * @param {Object}
 *            param
 */
Requester.debug.GET_material_exist = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	rel.data = round(Math.random()); // 0 or 1

	return rel;
};
Requester.debug.GET_labstat = function(level, param) {
	var rel = new Requester.debug.returnTpl();

	rel.data = {
		"1":[1],
		"2":[1],
		"3":[1],
		"10":[1]
	}

	if(param.level == 'useracct') {
		rel.data = {
			"1":[1, 2],
			"2":[1, 2],
			"3":[1],
			"10":[1, 2]
		}
	}

	return rel;
};
