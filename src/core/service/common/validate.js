/**
 * fbs.validate
 * 验证使用函数
 * @author zuming@baidu.com
 */
 
fbs = fbs || {};

fbs.validate = {};

/**
 * 验证统一调用的函数
 * @param {Object} source 验证对象
 * @param {Object} rules 规则列表
 * @param {Boolean} filterChain 过滤链，默认为true，为true时，遇到错误则直接返回，为false时，则验证所有规则，返回所有结果
 * @author zuming@baidu.com
 */
fbs.validate.method = function(source, rules, filterChain) {
	if (typeof filterChain == "undefined") {
		var filterChain = true;
	}
	var error = [];
	
	for (var key in rules) {
		(typeof rules[key].param != "undefined" ? !rules[key].fn(source, rules[key].param) : !rules[key].fn(source)) && error.push(rules[key].errorCode);
	}
	if (error.length == 0) {
		return true;
	} else {
		if (filterChain) {
			return error[0];
		} else {
			return error;
		}
	}
};

/**
 * 验证数字相关
 * @author zuming@baidu.com
 */
fbs.validate.number =  {};

/**
 * 验证一个东东是不是数字
 * @param {Object} number
 * @author zuming@baidu.com
 */
fbs.validate.number.isNumber = function(number) {
	return !isNaN(number);
};

/**
 * 验证一个东东是不是整数
 * @param {Object} number
 * @author zuming@baidu.com
 */
fbs.validate.number.isInt= function(number) {
	var reg = /^[1-9]\d*$|^0$/;///^[0-9]+$/; // FIX 没有去除03这种形式的非十进制整数 by Huiyao 2013.1.7
	return reg.test(number);
};

/**
 * 验证一个数字的小数位是否不多于placesMax
 * @param {Object} number
 * @param {Object} placesMax
 */
fbs.validate.number.decPlaces = function(number, placesMax) {
	//number = number - 0; //防范1e-3这样的写法
	// mod by Huiyao 2013-5-17 FIX BUG:不能直接这么干，如果给的数小数点位数超过其精度能表示的长度，
	// 比如0.9...9(18位小数位)，这一减，结果就变成1了
	if (String(number).indexOf('e') != -1) {
        number = number - 0;
    }
    number = number.toString();
//	return (number.indexOf('.') == -1 || number.split('.')[1].length <= placesMax);
    return (number.indexOf('.') == -1 || number.split('.')[1].length <= placesMax) && number.indexOf("e-") == -1;

};

/**
 * 验证一个东东是不是大于某个值
 * @param {Object} number
 * @param {Object} comparedNumber
 * @author zuming@baidu.com
 */
fbs.validate.number.greaterThan = function(number, comparedNumber) {
	return number > comparedNumber;
};

/**
 * 验证一个东东是不是大于或等于某个值
 * @param {Object} number
 * @param {Object} comparedNumber
 * @author wanghuijun@baidu.com
 */
fbs.validate.number.greaterOrEqual = function(number, comparedNumber) {
	return number >= comparedNumber;
};

/**
 * 验证一个东东是不是小于等于某个值
 * @param {Object} number
 * @param {Object} comparedNumber
 * @author zuming@baidu.com
 */
fbs.validate.number.lessThan = function(number, comparedNumber) {
	return number <= comparedNumber;
};

/**
 * 关于数组的一些验证
 */
fbs.validate.array = {};

/**
 * 验证数组是否为空
 * @param {Object} array
 * @author zuming@baidu.com
 */
fbs.validate.array.nonEmpty = function(array) {
	return (array.length !== 0);
};

/**
 * 验证数组长度限制
 * @param {Object} array
 * @author wanghuijun@baidu.com
 */
fbs.validate.array.maxLength = function(array, maxLen) {
	return (array.length <= maxLen);
};

/**
 * 关于字符串的一些验证
 */
fbs.validate.string = {};

/**
 * 字符串长度限制
 * @param {Object} str
 * @param {Object} maxLen
 * @author zuming@baidu.com
 */
fbs.validate.string.maxLength = function(str, maxLen) {
	return fbs.util.getLengthCase(str) <= maxLen;
};

/**
 * 字符串长度限制
 * @param {Object} str
 * @param {Object} minLen
 * @author zuming@baidu.com
 */
fbs.validate.string.minLength = function(str, minLen) {
	return fbs.util.getLengthCase(str) > minLen;
};

/**
 * 判断是否为Email
 * @param {Object} str
 * @return {Boolean} true/false
 * @author zuming@baidu.com
 */
fbs.validate.string.isEmail = function(str) {
    var res = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
		re = new RegExp(res);
		
    return !(str.match(re) == null);
};

/**
 * 关键词及否定关键词的相关验证
 */
fbs.validate.word = {};


/**
 * 验证一组关键词中，是否有超长输入
 * @param {Object} wordList
 * @param {Object} numMax
 * @author tongyao@baidu.com // modify by zuming  // modify by linfeng
 */
fbs.validate.word.lengthCheck = function(wordList, numMax) {
	for (var i = 0, len = wordList.length; i < len; i++) {
		if (fbs.util.getLengthCase(fbs.util.removeWmatchPattern(wordList[i])) > numMax) {
			return false;
		}
	}
	return true;
};

/**
 * 验证输入词数量
 * @param {Object} wordList
 * @param {Object} numberMax
 * @author zuming@baidu.com
 */
fbs.validate.word.numberCheck = function(wordList, numberMax) {
	return wordList.length <= numberMax;
}

/**
 * 验证输入词是否为空
 * @param {Object} wordList
 * @param {Object} numberMax
 * @author tongyao@baidu.com
 */
fbs.validate.word.numberMinCheck = function(wordList, numberMin) {
	return wordList.length > numberMin;
}

/**
 * 验证预算是否ok
 * @param {Object} budget
 * @param {Object} exception
 * @author zuming@baidu.com
 */
fbs.validate.budget = function(budget) {
	var value = budget.items.wbudget;
	var isWeek = false;
	if('undefined' == typeof value){
		value = budget.items.weekbudget;
		isWeek = true;
	}
	if (value === "") {
		return {};
	}
	var rules = {
		isNum: {
			fn: fbs.validate.number.isNumber,
			errorCode: 350
		},
		decPlaces: {
			fn: fbs.validate.number.decPlaces,
			param: fbs.config.MONEY_DEC_PLACES,
			errorCode: 351
		},
		greaterThanMin: {
			fn: fbs.validate.number.greaterOrEqual,
			param: isWeek ? fbs.config.BUDGET_WEEKMIN : fbs.config.BUDGET_MIN,
			errorCode: isWeek ? 316 : 307
		},
		lessThanMax: {
			fn: fbs.validate.number.lessThan,
			param: isWeek ? fbs.config.BUDGET_WEEKMAX : fbs.config.BUDGET_MAX,
			errorCode: isWeek ? 317 : 308
		}
	};
	return {
		wbudget: fbs.validate.method(value, rules)
	};
};

/**
 * 验证出价
 * @param {Object} bid
 * @author zuming@baidu.com
 */
fbs.validate.bid = function(bid) {
	var rules = {
		isNum: {
			fn: fbs.validate.number.isNumber,
			errorCode: 6
		},
		greaterThanMin: {
			fn: fbs.validate.number.greaterThan,
			param: fbs.config.BID_MIN,
			errorCode: 7
		},
		lessThanMax: {
			fn: fbs.validate.number.lessThan,
			param: fbs.config.BID_MAX,
			errorCode: 8
		},
		decPlaces: {
			fn: fbs.validate.number.decPlaces,
			param: fbs.config.MONEY_DEC_PLACES,
			errorCode: 99
		}
	};
	return fbs.validate.method(bid, rules);
};

/**
 * 修改三高阈值
 * @param {Object} custom
 */
fbs.validate.modCustom = function(custom){
	var rules = {
		isNull: {
			fn: fbs.validate.string.minLength,
			param: 0,
			errorCode: 6005
		},
		isNum: {
			fn: fbs.validate.number.isNumber,
			errorCode: 6006
		},
		decPlaces: {
			fn: fbs.validate.number.isInt,
			errorCode: 6099
		},
		greaterThanMin: {
			fn: fbs.validate.number.greaterThan,
			param: fbs.config.THRESHOLD_MIN,
			errorCode: 6007
		},
		lessThanMax: {
			fn: fbs.validate.number.lessThan,
			param: fbs.config.THRESHOLD_MAX,
			errorCode: 6008
		}
	};
	return {
		custom: fbs.validate.method(custom.value, rules)
	}
	
};

/**
 * IP排除验证
 * @author zuming@baidu.com
 */
fbs.validate.ipExclusion = function(param) {
	var rules = {
		numberMax: {
			fn: fbs.validate.ipNumber,
			param: fbs.config.IP_NUM_MAX,
			errorCode: 460
		},
		ipFormatCheck: {
			fn: fbs.validate.ipArrayCheck,
			errorCode: 461
		}
	};
    if(!param.planid){  //如果是账户层级的ip排除，最大个数是三十个，判断方式貌似不太好。。。yll
        rules.numberMax.param = manage.account.otherSetting.getConfig('ACC_IP_NUM_MAX');
       // fbs.config.ACC_IP_NUM_MAX;
    }
	return {
		ipblack: fbs.validate.method(param.ipblack, rules)
	};
};

/**
 * IP输入数量验证
 * @param {Object} ipArray
 * @param {Object} numMax
 * @author zuming@baidu.com
 */
fbs.validate.ipNumber = function(ipArray, numMax) {
	return ipArray.length <= numMax
};

/**
 * IP数组格式
 * @param {Array} ipArray
 * @author zuming@baidu.com
 */
fbs.validate.ipArrayCheck = function(ipArray) {
	for (var i = 0, len = ipArray.length; i < len; i++) {
		if (!fbs.validate.ipCheck(ipArray[i])) {
			return false;
		}
	}
	return true;
};

/**
 * IP格式验证
 * @param {String} ip
 * @author zuming@baidu.com
 */
fbs.validate.ipCheck = function(ip) {
	var ipreg = /^(((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d)\.){3}(((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d)|\*)$/;
	return ipreg.test(ip)
};


/**
 * 提醒规则验证
 * @param {Object} remindRule
 * @return {
 * 	没错返回: {}
 * 	错误返回：{
 * 		"key" : code
 * 	}
 * }
 * @author zuming@baidu.com
 */
fbs.validate.remindRule = function(remindRule) {
	remindRule = remindRule.wremindRule;
	var err = {
		targetValue: fbs.validate.remindRule.targetValue({
			targetType: remindRule.targetType,
			targetValue: remindRule.targetValue
		}),
		remindWay: fbs.validate.remindRule.remindWay(remindRule.remindWay)
	};
    if(remindRule.remindContent == '1'){//只有在提醒内容为"当日消费达X元的时候才进行paysum验证"
        err.paysum = fbs.validate.remindRule.paysum(remindRule.customValue.paysum)
    }
	return err;
};

/**
 * 提醒规则选择物料验证
 * @param {Object} remindRule
 * @author zuming@baidu.com
 */
fbs.validate.remindRule.targetValue = function(remindRule) {
	var rules = {
		nonEmpty: {
			fn: function(param) {
				// 选择账户
				if (param.targetType == 2) {
					if (param.targetValue.length > 0) {
						return false;
					}
				} else if (param.targetValue.length == 0) {
					return false;
				}
				return true;
			},
			errorCode: 1150
		}
	};
	return fbs.validate.method(remindRule, rules);
};

/**
 * 提醒规则投放方式验证
 * @param {Object} remindWay
 * @author zuming@baidu.com
 */
fbs.validate.remindRule.remindWay = function(remindWay) {
	var rules = {
		nonEmpty: {
			fn: fbs.validate.array.nonEmpty,
			errorCode: 1151
		}
	};
	return fbs.validate.method(remindWay, rules);
};

/**
 * 提醒规则消费验证
 * @param {Object} paysum
 * @author zuming@baidu.com
 */
fbs.validate.remindRule.paysum = function(paysum) {
	var rules = {
		isNum: {
			fn: fbs.validate.number.isNumber,
			errorCode: 1160
		},
		greaterThanMin: {
			fn: fbs.validate.number.greaterThan,
			param: fbs.config.PAYSUM_MIN,
			errorCode: 1161
		}		
	};
	return fbs.validate.method(paysum, rules);
};

/**
 * 否定关键词验证
 * @param {Object} negWordParam {
 * 	negativeWord: Array
 * 	accurateNegativeWord: Array
 * }
 * @return 	正确：{}
 * 			错误：{key: code}
 * @author zuming@baidu.com
 */
fbs.validate.negativeWord = function(negWordParam) {
	return fbs.validate.negativeWordSrc({
		key : 'negative',
		inputWord: negWordParam.negative,
		conflictWord: negWordParam.accuratenegative
	});
};

/**
 * 精确否定关键词验证
 * @param {Object} negWordParam {
 * 	negativeWord: Array
 * 	accurateNegativeWord: Array
 * }
 * @return 	正确：{}
 * 			错误：{key: code}
 * @author zuming@baidu.com
 */
fbs.validate.accurateNegativeWord = function(negWordParam) {
	return fbs.validate.negativeWordSrc({
		key : 'accuratenegative',
		inputWord: negWordParam.accuratenegative,
		conflictWord: negWordParam.negative
	});
};

/**
 * 验证否定关键词
 * @param {Object} param
 * @return 	正确：{}
 * 			错误：{key: code}
 * @author zuming@baidu.com
 */
fbs.validate.negativeWordSrc = function(param) {
	var err = {};
	var inputErrCode = fbs.validate.negativeWord.inputWordCheck(param.inputWord);
	if (inputErrCode !== true) {
		err[param.key] = inputErrCode
		return err;
	}
	var conflictErrCode = fbs.validate.negativeWord.conflictCheck(param);
	if (conflictErrCode !== true) {
		err[param.key] = conflictErrCode
		return err;
	}
	return err;
};

/**
 * 验证用户的输入
 * @param {Object} inputWord
 * @return 	正确：true
 * 			错误：code
 * @author zuming@baidu.com
 */
fbs.validate.negativeWord.inputWordCheck = function(inputWord) {
	var rules = {
		/**
		 * 每个关键词的长度验证
		 */
		lengthCheck: {
			fn: fbs.validate.word.lengthCheck,
			param: fbs.config.NEGAWORD_LEN,
			errorCode: 450
		},
		/**
		 * 验证输入的词数量
		 */
		numberCheck: {
			fn: fbs.validate.word.numberCheck,
			param: manage.account.otherSetting.getConfig('NEGAWORD_NUM_MAX') ,
            errorCode: 451
		}
	};
	return fbs.validate.method(inputWord, rules);
};

/**
 * 验证否定关键词与精确否定关键词是否冲突
 * @param {Object} negWordParam {
 * 	inputWord: Array
 * 	conflictWord: Array
 * }
 * @return 	正确：true
 * 			错误：code
 * @author zuming@baidu.com
 */
fbs.validate.negativeWord.conflictCheck = function(negWordParam) {
	var rules = {
		conflictCheck: {
			fn: function(negWordParam) {
				var inputWord = negWordParam.inputWord;
				var conflictWord = negWordParam.conflictWord;
				var tmpHash = {};
				for (var i = 0, len = inputWord.length; i < len; i++) {
					tmpHash[inputWord[i]] = true;
				}
				for (var i = 0, len = conflictWord.length; i < len; i++) {
					if (typeof tmpHash[conflictWord[i]] != "undefined") {
						return false;
					}
				}
				return true;
			},
			errorCode: 452
		}
	};
	return fbs.validate.method(negWordParam, rules);
}
		

/**
 * 新建计划的验证规则
 * @param {Object} param
 * @author tongyao@baidu.com
 */
fbs.validate.addPlan = function(param){
	var error = {
		planname : fbs.validate.planName(param).planname
	};
	return error;
}

/**
 * 编辑计划名称的验证方法
 * @param {Object} param
 * @author tongyao@baidu.com , mod by zuming
 */
fbs.validate.planName = function(param){
	var rules = {
		minLength: {
			fn : fbs.validate.string.minLength,
			param : 0,
			errorCode : 498
		},
		
		maxLength: {
			fn : fbs.validate.string.maxLength,
			param : fbs.config.PLANNAME_MAX,
			errorCode : 499
		}
	};
	return {
		planname: fbs.validate.method(fbs.util.trim(param.planname), rules)	
	};
}

/**
 * 编辑监控文件夹名称的验证方法
 * @param {Object} param
 * @author zhouyu01@baidu.com
 */
fbs.validate.moniFolders = function(param){
	var rules = {
		minLength: {
			fn : fbs.validate.string.minLength,
			param : 0,
			errorCode : 2852
		},
		
		maxLength: {
			fn : fbs.validate.string.maxLength,
			param : fbs.config.FOLDER_MAX,
			errorCode : 2853
		}
	};
	
	if(typeof(param.folderName) != "undefined"){
		var foldername = param.folderName;
	}else{
		var foldername = param.foldername;
	}
	
	return {
		foldername: fbs.validate.method(fbs.util.trim(foldername), rules)
	};
}


/**
 * 新建单元的验证规则
 * @param {Object} param
 * @author tongyao@baidu.com zhouyu01@baidu.com
 */
fbs.validate.addUnit = function(param){
    var error = {
        unitname: fbs.validate.unitName(param).unitname,
        unitbid: fbs.validate.unitBid(param).unitbid
    };
	return error;
}

/**
 * 编辑单元名称的验证方法
 * @param {Object} param
 * @author tongyao@baidu.com , modify by zuming@baidu.com
 */
fbs.validate.unitName = function(param){
	var rules = {
		minLength: {
			fn : fbs.validate.string.minLength,
			param : 0,
			errorCode : 502
		},
		
		maxLength: {
			fn : fbs.validate.string.maxLength,
			param : fbs.config.UNITNAME_MAX,
			errorCode : 501
		}
	};
	return {
		unitname: fbs.validate.method(fbs.util.trim(param.unitname), rules)
	};
}

/**
 * 编辑单元出价的验证方法
 * @param {Object} param
 * @author tongyao@baidu.com zhouyu01@baidu.com
 */
fbs.validate.unitBid = function(param){
	var val = fbs.validate.bid(param.unitbid);
	if (val !== true) {
		val += 500;
	}
	return {
		unitbid: val
	};
}

/**
 * 验证单元名称长度的基础函数
 * @param {Object} planname
 * @author tongyao@baidu.com/ del by zuming
 *
fbs.validate._unitname = function(unitname){
	var unitNameLength = baidu.string.getByteLength(unitname),
		rules = {
			unitnameMin : {
				fn : fbs.validate.number.greaterThan,
				param : 0,
				errorCode : 502
			},
			
			unitnameMax : {
				fn : fbs.validate.number.lessThan,
				param : fbs.config.UNITNAME_MAX,
				errorCode : 501
			}
		};
	return fbs.validate.method(unitNameLength, rules);
}
*/

/**
 * 验证单元出价的基础函数
 * @param {Object} unitbid
 * @author tongyao@baidu.com, modify by zuming@baidu.com
 *
fbs.validate._unitbid = function(unitbid) {
	return fbs.validate.bid(unitbid);
};*/

/**
 * 验证关键词出价
 * @param {Object} param
 * @author zuming@baidu.com
 */
fbs.validate.modKeywordBid = function(param) {
	if (param.bid === "null") {
		var val = true;
	}
	else {
		var val = fbs.validate.bid(param.bid);
		if (val !== true) {
			val += 600;
		}
	}
	return {
		unitbid: val
	};
};

/**
 * 验证多个关键词修改成不同的出价
 * @param {Object} param
 * @author zuming@baidu.com
 */
fbs.validate.modKeywordDiffBid = function(param) {
	var error = {};
	if (param.winfoid.length != param.bid.length) {
		return {
			0: {
				bid: {
					code : 1
				}
			} 
		}
	}
	for (var i = 0, len = param.winfoid.length; i < len; i++) {
		var bv = fbs.validate.bid(param.bid[i]);
		if (bv !== true) {
			bv += 600;
			error[param.winfoid[i]] = {
				bid : {
					code	:	bv
				}
			};
		}
	}
	return error;
}


/**
 * 验证关键词访问URL
 * @param {Object} param
 */
fbs.validate.modKeywordUrl = function(param) {
	var rules = {
		urlLength: {
			fn: fbs.validate.string.maxLength,
			param: 1017,
			errorCode: 671
		}
	};
	return {
		wurl: fbs.validate.method(fbs.util.removeUrlPrefix(param.wurl), rules)
	};
};

/**
 * 添加关键词的验证规则
 * @param {Object} param
 * @author tongyao@baidu.com
 */
fbs.validate.addKeyword = function(param){
	var rules = {
		/**
		 * 每个关键词的长度验证
		 */
		lengthCheck: {
			fn: fbs.validate.word.lengthCheck,
			param: fbs.config.KEYWORD_MAXLENGTH,
			errorCode: 637
		},
		/**
		 * 验证输入的词数量
		 */
		numberCheck: {
			fn: fbs.validate.word.numberCheck,
			param: fbs.config.KEYWORD_NUM_MAX,
			errorCode: 699
		},
		
		numberMinCheck: {
			fn: fbs.validate.word.numberMinCheck,
			param: 0,
			errorCode: 638
		}
	}
	
	var error, 
	    errorList = [];
	//批量拆分、定位、组装   by linzhifeng@baidu.com
	for (var i = 0, len = param.keywords.length; i < len; i++){
		error = fbs.validate.method([param.keywords[i]], rules);
		if(error != true){
			errorList.push({
				code: error,
				idx : i
			});
		}
	}
	//var error = fbs.validate.method(param.keywords, rules);
	
	if(errorList.length <= 0){
		return {};
	} else {
		return {keywords : errorList}
	}
}

/**
 * 新建创意的验证规则
 * @param {Object} param
 * @author tongyao@baidu.com
 */
fbs.validate.addIdea = function(param) {
    var error = {
        title: fbs.validate._ideatitle(param.title),
        desc1: fbs.validate._ideadesc1(param.desc1),
        desc2: fbs.validate._ideadesc2(param.desc2),
        url: fbs.validate._url(param.url),
        showurl: fbs.validate._showurl(param.showurl)
    };
    
    return error;
};

/**
 * 验证创意标题长度的基础函数
 * @param {Object} title
 * @author tongyao@baidu.com
 */
fbs.validate._ideatitle = function(param) {
    var length = baidu.string.getByteLength(param.title);
	var rules = {
        min: {
            fn: fbs.validate.number.greaterThan,
            param: 0,
            errorCode: 502
        },
        
        unitnameMax: {
            fn: fbs.validate.number.lessThan,
            param: fbs.config.UNITNAME_MAX,
            errorCode: 501
        }
    };
    return fbs.validate.method(unitNameLength, rules);
}

/**
 * 验证估算工具
 * @param {Object} param
 * @author chenjincai
 */
fbs.validate.estimator = function (param) {
    var keywordRules = {
        noEmpty : {
            fn:fbs.validate.array.nonEmpty,
            errorCode:1402
        }
    },

    bidRules = {
        nonEmpty : {
            fn: fbs.validate.string.minLength,
            param:0,
            errorCode:1403
        },
        isNumber : {
            fn: fbs.validate.number.isNumber,
            errorCode:1404
        },
        greaterThan : {
            fn: fbs.validate.number.greaterThan,
            param: 0,
            errorCode:1405
        },
		decPlaces: {
			fn: fbs.validate.number.decPlaces,
			param: fbs.config.MONEY_DEC_PLACES,
			errorCode: 1406
		},
		lessThanMax: {
			fn: fbs.validate.number.lessThan,
			param: fbs.config.BID_MAX,
			errorCode: 1407
		}
    };
    var retval =  {
        keywords: fbs.validate.method(param.keywords, keywordRules),
        daymaxbid: fbs.validate.method(param.daymaxbid, bidRules)
    };
    return retval;
}

/**
 * 发送报告，验证Email
 * @param {Object} param
 * @author wanghuijun@baidu.com
 */
fbs.validate.sendReport = function(param) {
	if (!param.sendReportInfo) { // 此参数不是必须参数，所以没有时不需要验证邮箱
		return;
	}
	var email = param.sendReportInfo.mailaddr,
		emailArr = email.split(','),
		len = emailArr.length,
		mailRules = {
			isEmail: {
				fn: fbs.validate.string.isEmail,
				errorCode: 'NOT_MAIL'
			}
		},
		lenRules = {
			lengthCheck : {
				fn: fbs.validate.string.maxLength,
				param : 120,
				errorCode: 'TOO_LONG'
			}
		},
		arrRules = {
			lengthCheck : {
				fn: fbs.validate.array.maxLength,
				param : 5,
				errorCode: 'OVER'
			}
		},
		error;
		
	for (var i = 0; i < len; i++) {
		error =	fbs.validate.method(emailArr[i], mailRules);
		
		if (typeof(error) == 'string') {
			return {
				code: error
			};
		}
	}
	
	error = fbs.validate.method(email, lenRules);
	if (typeof(error) == 'string') {
		return {
			code: error
		};
	}
	
	error = fbs.validate.method(emailArr, arrRules);
	return {
		code: error
	};
};

/**
 * 保存报告信息，验证Email
 * @param {Object} param
 * @author wanghuijun@baidu.com
 */
fbs.validate.addReportInfo = function(param){
	var tmp = {
		sendReportInfo : {
			mailaddr : param.reportinfo.mailaddr
		}
	},
		ismail = param.reportinfo.ismail;
	
	return ismail ? fbs.validate.sendReport(tmp) : true;
};

/**
 * 编辑报告名称的验证方法
 * @param {Object} param
 * @author wanghuijun@baidu.com
 */
fbs.validate.reportName = function(param){
	var rules = {
		minLength: {
			fn : fbs.validate.string.minLength,
			param : 0,
			errorCode : 1932
		},
		
		maxLength: {
			fn : fbs.validate.string.maxLength,
			param : nirvana.config.NUMBER.REPORT.MAX_LENGTH,
			errorCode : 1933
		}
	};
	
	return {
		reportname: fbs.validate.method(fbs.util.trim(param.reportname), rules)
	};
}

/**
 * 验证网站域名
 * @public
 * @param <string> str 待验证字符串
 * @return <boolean> 是否匹配
 */
fbs.validate.string.isDomain = function(str) {
	if (fbs.validate.string.isIllegal(str)) {
		return false;
	}
	var pattern = /^((http|https):\/\/)?(([\w-]+\.)+[a-z]{2,6}|((25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d))(\/\S*)?$/i;
	return pattern.test(str);
};

/**
 * 验证非法字符
 * @public
 * @param <string> str 待验证字符串
 * @return <boolean> 是否非法
 */
fbs.validate.string.isIllegal = function(str) {
	return (str.search(/[!@$^*()<>]/) == -1) ? false : true;
};


/**
 * 验证是否是目标路径
 * 用于目标网址
 * @auther wangzhishou@baidu.com
 * @param <string> str 待验证字符串
 * @return <boolean> 是否匹配
 */
fbs.validate.string.containHTTP = function(str) {
	var pattern = /^(http:\/\/|https:\/\/).+|^\//i;
	return pattern.test(str);
};


/**
 * 新增转化验证
 * @param {Object} param
 * @author wangzhishou@baidu.com
 */
fbs.validate.addTrans = function(param){
	/**
	 * 判断站点URL
	 */
	var siteUrlRules = {
		/**
		 * 是否为空
		 */
		minLength: {
			fn : fbs.validate.string.minLength,
			param : 0,
			errorCode : 'SITE_URL_NOT_EMPTY'
		},
		
		/**
		 * 是否为域名
		 */
		isDomain: {
			fn: fbs.validate.string.isDomain,
			errorCode: 'SITE_URL_NOT_DOMAIN'
		}
	};
	
	/**
	 * 判断转化名称
	 */
	var transNameRules = {
		/**
		 * 是否为空
		 */
		minLength: {
			fn : fbs.validate.string.minLength,
			param : 0,
			errorCode : 'TRANS_NAME_NOT_EMPTY'
		},
		
		/**
		 * 最多50个字符
		 */
		maxLength: {
			fn : fbs.validate.string.maxLength,
			param : 50,
			errorCode : 'TRANS_NAME_MAXED'
		}
	};
	
	/**
	 * 目标网址判断
	 */
	var desPageRules = {
		
		/**
		 * 是否为空
		 */
		minLength: {
			fn : fbs.validate.string.minLength,
			param : 0,
			errorCode : 'DES_PAGE_NOT_EMPTY'
		},
		
		/**
		 * 是否为域名
		 */
		isDomain: {
			fn: fbs.validate.string.isDomain,
			errorCode: 'DES_PAGE_NOT_DOMAIN'
		}
	};	
	
	return {
		siteurl: fbs.validate.method(fbs.util.trim(param.siteUrl), siteUrlRules),
		transname: fbs.validate.method(fbs.util.trim(param.transName), transNameRules),
		desPage: fbs.validate.method(fbs.util.trim(param.desPage), desPageRules)
	};
};


/**
 * 验证效果突降阈值设置是否ok
 * @param {Object} decr
 * @param {Object} exception
 * @author LeoWang wangkemiao@baidu.com
 */
fbs.validate.decrConfiguration = function(decr) {
    var value = decr.value;
    var rules = {
        isNull: {
            fn: fbs.validate.string.minLength,
            param: 0,
            errorCode: 6005
        },
        isNum: {
            fn: fbs.validate.number.isNumber,
            errorCode: 6006
        },
        decPlaces: {
            fn: fbs.validate.number.isInt,
            errorCode: 6099
        },
        greaterThan: {
            fn: fbs.validate.number.greaterThan,
            param: 0,
            errorCode: 6007
        },
        lessThanMax: {
            fn: fbs.validate.number.lessThan,
            param: 100,
            errorCode: 6008
        }
    };
    return {
        custom: fbs.validate.method(value, rules)
    };
};


/**
 * 以下是快速新建相关验证
 */


fbs.validate.eos = {};
/**
 * 验证输入词数量
 * @param {Object} param
 * @param {Object} len
 * @author wanghuijun@baidu.com
 */
fbs.validate.eos.numberCheck = function(param, len) {
	return param.words.length <= len;
};

/**
 * 行业词信息填写验证
 * @param {Object} param
 */
fbs.validate.eos.inputWordCheck = function(param) {
	var rules = {
		/**
		 * 每个关键词的长度验证
		lengthCheck: {
			fn: fbs.validate.word.lengthCheck,
			param: fbs.config.INDUSTRYWORD_MAXLEN,
			errorCode: 450
		},
		 */
		
		/**
		 * 验证输入的词数量
		 */
		numberCheck: {
			fn: fbs.validate.eos.numberCheck,
			param: fbs.config.INDUSTRYWORD_MAXLEN,
			errorCode: 6013
		}
	};
	var result = fbs.validate.method(param, rules);
	if(result !== true){
		return {
			code : result
		};
	}
	
	return result;
};

fbs.validate.eos.consumethresholdCheck = function(data){
	var rules = {
		industryCheck : {
			fn : fbs.validate.array.nonEmpty,
			errorCode : 6015
		}
	};
	var result = fbs.validate.method(data.industry, rules);
	if(result !== true){
		return {
			code : result
		};
	}
	if(data.importantindex == -1){
		return {
			code : 6016
		};
	}
	
	return result;
};

fbs.validate.eos.submittask = function(data){
	var rules = {
		recmwordsCheck : {
			fn : fbs.validate.array.nonEmpty,
			errorCode : 6015
		}
	};
	
	var target = data.recmwords || [];

	var result = fbs.validate.method(target, rules);
	if(result !== true){
		return {
			code : result
		}
	}
	
	return true;
};


/**
 * 验证关键词出价
 * @param {Object} param
 */
fbs.validate.eos.modKeywordBid = function(param) {
	if (param.recmitems.bid === "null") {
		var val = true;
	}
	else {
		var val = fbs.validate.bid(param.recmitems.bid);
		if (val !== true) {
			val += 600;
		}
	}
	return {
		unitbid: val
	};
};

/**
 * 验证方案详情的保存信息，预算、推广地域、推广时段
 * @param {Object} param
 * @author LeoWang(wangkemiao@baidu.com)
 */
fbs.validate.eos.schemedetail = function(param){
	var bgttype = param.bgttype;
	var value = param.bgtvalue || 0;
	var isWeek = (bgttype == 2);
	
	if(bgttype == 0){
		return true;
	}

	var rules = {
		isNum: {
			fn: fbs.validate.number.isNumber,
			errorCode: 350
		},
		decPlaces: {
			fn: fbs.validate.number.decPlaces,
			param: fbs.config.MONEY_DEC_PLACES,
			errorCode: 351
		},
		greaterThanMin: {
			fn: fbs.validate.number.greaterOrEqual,
			param: isWeek ? fbs.config.BUDGET_WEEKMIN : fbs.config.BUDGET_MIN,
			errorCode: isWeek ? 316 : 307
		},
		lessThanMax: {
			fn: fbs.validate.number.lessThan,
			param: isWeek ? fbs.config.BUDGET_WEEKMAX : fbs.config.BUDGET_MAX,
			errorCode: isWeek ? 317 : 308
		}
	};

	return {
		wbudget: fbs.validate.method(value, rules)
	};
};


/**
 * 以下是老户优化相关验证
 */


fbs.validate.nikon = {};
/**
 * 验证关键词出价
 * @param {Object} param
 * @author wanghuijun@baidu.com
 */
fbs.validate.nikon.addWords = function(param) {
	var error,
        errorList = [],
		items = param.items,
		item,
		bid,
		val;
	
    for (var i = 0, len = items.length; i < len; i++){
        item = items[i];
		bid = item.bid;
		
		if (bid === 'null') {
			val = true;
		} else {
			val = fbs.validate.bid(bid);
			if (val !== true) {
				val += 600;
			}
		}
		
        if(val != true){
            errorList.push({
                code: val,
                idx : i
            });
        }
    }
    
    if(errorList.length <= 0){
        return {};
    } else {
        return {error : errorList}
    }
};
