/**
 * FBS 单测代码
 */

module("lib/util.js");

test("fbs.util.isFunction", function() {
	ok(!fbs.util.isFunction("A"), '"A" is not Function');
	ok(!fbs.util.isFunction(132), '132 is not Function');
	ok(!fbs.util.isFunction({a:1}), '{a:1} is not Function');
	ok(!fbs.util.isFunction([1,2,3]), '[1,2,3] is not Function');
	ok(!fbs.util.isFunction(new Date()), 'new Date() is not Function');
	ok(!fbs.util.isFunction(document), 'document is not Function');
	ok(fbs.util.isFunction(Function), 'Function is Function');
	ok(fbs.util.isFunction(function() {}), 'function() {} is Function');
	ok(fbs.util.isFunction(fbs.util.isFunction), 'fbs.util.isFunction is Function');
	ok(fbs.util.trim("  a  ") == "a", 'trim "  a  " is "a"');
	ok(fbs.util.trim("  a b ") == "a b", 'trim "  a b " is "a b"');
	ok(fbs.util.trim("  a b　") == "a b", 'trim "  a b　" is "a b"');
	ok(fbs.util.getLengthCase("我") == 2, '"我".length == 2');
	ok(fbs.util.getLengthCase("ABC七个") == 7, 'ABC七个.length == 7');
	ok(fbs.util.arrayRemoveBy([1, 2, 3, 4, 4, 3], 4).length == 4, 'fbs.util.arrayRemoveBy([1, 2, 3, 4, 4, 3], 4).length == 4');
	ok(fbs.util.arrayRemoveBy(["", "AB", "CD", "", "EF", ""], "").length == 3, 'fbs.util.arrayRemoveBy(["", "AB", "CD", "", "EF", ""], "").length == 3');
	ok(fbs.util.arrayDistinct([1,1,1,2,2,3,1,2,3,1,2,4,3,2,1,4,5]).length == 5, 'fbs.util.arrayDistinct([1,1,1,2,2,3,1,2,3,1,2,4,3,2,1,4,5]).length == 5');
	ok(fbs.util.arrayDistinct(["C", "", "B", "C", "A", "A"]).length == 4, 'fbs.util.arrayDistinct(["C", "", "B", "C", "A", "A"]).length == 4');
});


module("lib/validate.js");

test("fbs.validate.number.greaterThan", function() {
	ok(fbs.validate.number.greaterThan(3, 2), "3 > 2");
	ok(fbs.validate.number.greaterThan(13, 2), "13 > 2");
	ok(fbs.validate.number.greaterThan(-3, -12), "-3 > -12");
});

test("fbs.validate.number.lessThan", function() {
	ok(fbs.validate.number.lessThan(2, 3), "2 < 3");
	ok(fbs.validate.number.lessThan(2, 13), "2 < 13");
	ok(fbs.validate.number.lessThan(-12, -3), "-12 < -3");
});

test("fbs.validate.number.isNumber", function() {
	ok(fbs.validate.number.isNumber(4), "4 is number");
	ok(fbs.validate.number.isNumber("43"), '"43" is number');
	ok(!fbs.validate.number.isNumber("A"), '"A" is not number');
	ok(fbs.validate.number.isNumber([1]), '[1] is number');
	ok(!fbs.validate.number.isNumber([1,2]), '[1,2] is not number');
});

test("fbs.validate.unitName", function() {
	ok(fbs.validate.unitName({
		unitname: ""
	}).unitname === 502);
	ok(fbs.validate.unitName({
		unitname: " "
	}).unitname === 502);
	ok(fbs.validate.unitName({
		unitname: "　"
	}).unitname === 502);
	ok(fbs.validate.unitName({
		unitname: "AAAAABBBBBCCCCCDDDDDEEEEEFFFFF0"
	}).unitname === 501);
	ok(fbs.validate.unitName({
		unitname: "发动机撒了房价的沙拉放假了的撒a"
	}).unitname === 501);
	ok(fbs.validate.unitName({
		unitname: "发了的撒a"
	}).unitname === true);
});

test("fbs.validate.remindRule", function() {
	ok(fbs.validate.remindRule.targetValue({
		targetType: 1,
		targetValue: [1,2]
	}) === true);
	ok(fbs.validate.remindRule.targetValue({
		targetType: 2,
		targetValue: []
	}) === true);
	ok(fbs.validate.remindRule.targetValue({
		targetType: 2,
		targetValue: [1,2]
	}) === 1150);
	ok(fbs.validate.remindRule.remindWay([1,2]) === true);
	ok(fbs.validate.remindRule.remindWay([]) === 1151);
	ok(fbs.validate.remindRule.paysum("a") === 1160);
	ok(fbs.validate.remindRule.paysum({}) === 1160);
	ok(fbs.validate.remindRule.paysum(0) === 1161);
	ok(fbs.validate.remindRule.paysum(-13) === 1161);
	ok(fbs.validate.remindRule.paysum(3232) === true);
});

test("fbs.validate.negativeWord", function() {
	ok(fbs.util.isEmptyObject(fbs.validate.negativeWord({
		negative: [],
		accuratenegative: []
	})) === true, "two null array");
	
	ok(fbs.util.isEmptyObject(fbs.validate.negativeWord({
		negative: ["a", "b"],
		accuratenegative: ["c"]
	})) === true, "two notnull array");
	
	ok(fbs.validate.negativeWord({
		negative: ["a"],
		accuratenegative: ["a"]
	}).negative === 452, "two same array");
	
	var _words = []
	for (var i = 0, len = 101; i < len; i++) {
		_words.push("FDSFDS" + i);
	}
	ok(fbs.validate.negativeWord({
		negative: _words,
		accuratenegative: []
	}).negative === 451, "number > 100");
	
	ok(fbs.validate.negativeWord({
		negative: ["fdjalfjdslajfdlksaj43343fdlsajfdlskajfldksjafldkjsalfdkjalfjdslka"],
		accuratenegative: []
	}).negative === 450, "length > 40");
});

test("fbs.util.removeUrlPrefix", function() {
	ok(fbs.util.removeUrlPrefix(" http://www.baidu.com ") === "www.baidu.com");
	ok(fbs.util.removeUrlPrefix("　http://www.baidu.com　　") === "www.baidu.com");
	ok(fbs.util.removeUrlPrefix("http://http://http://www.baidu.com ") === "www.baidu.com");
	ok(fbs.util.removeUrlPrefix(" http://www.baidu.comhttp:// ") === "www.baidu.comhttp://");
	ok(fbs.util.removeUrlPrefix(" http：／／www.baidu.com ") === "www.baidu.com");
});

test("fbs.validate.keywordUrl", function() {
	ok(fbs.validate.keywordUrl({
		wurl: ""
	}).wurl === true);
	ok(fbs.validate.keywordUrl({
		wurl: "http://www.baidu.com"
	}).wurl === true);
	var url = "http://"
	for (var i = 0; i < 1017; i++) {
		url += "w";
	}
	ok(fbs.validate.keywordUrl({
		wurl: url
	}).wurl === true);
	url = url + "www";
	ok(fbs.validate.keywordUrl({
		wurl: url
	}).wurl === 671);
});
