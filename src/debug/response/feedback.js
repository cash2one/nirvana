/**
 * 获取用户需要回答的问卷
 */
Requester.debug.GET_survey_isanswer = function(level, param) {

	function range(start, end){
		var result = [];
		for(var i = start; i <= end; i++ ){
			result.push( {
				auth : 1,
				paperid : parseInt(Math.random()*10000),
				positionid : i
			})
		}
		return result;
	}
	return {
		"data" : {
			"count" : "11",
			"auth" : "1",
			"userid" : "499",
			"listdata" : range(1, 11)
		},
		"status" : 200,
		"errorCode" : null
	};
};
/**
 * 获取问卷详情
 */
Requester.debug.GET_survey_paper = function(level, param) {

	return {
		status : 200,
		data : {
			paperid : 20,
			papername : "涅槃首页问卷调查",
			paperdesc : "首页问卷调查，页问卷调查，问卷调查，卷调查，调查，查，",
			questionlistdata : [{
						questionid : 1,
						questiontitle : "你觉得涅槃肿么样",
						questiontype : 1,
						choicedatalist : [{
									choiceid : 1,
									choicetitle : "好"
								}, {
									choiceid : 2,
									choicetitle : "一般"
								}, {
									choiceid : 1,
									choicetitle : "不好"
								}]
					}, {
						questionid : 2,
						questiontitle : "你觉得涅槃肿么样",
						questiontype : 2,
						choicedatalist : [{
									choiceid : 1,
									choicetitle : "好"
								}, {
									choiceid : 2,
									choicetitle : "一般"
								}, {
									choiceid : 1,
									choicetitle : "不好"
								}]
					}, {
						questionid : 3,
						questiontitle : "你觉得涅槃肿么样",
						questiontype : 4
					}, {
						questionid : 4,
						questiontitle : "你觉得涅槃肿么样",
						questiontype : 3,
						choicedatalist : [{
									choiceid : 1,
									choicetitle : "好"
								}, {
									choiceid : 2,
									choicetitle : "一般"
								}, {
									choiceid : 1,
									choicetitle : "不好"
								}]
					}, {
						questionid : 5,
						questiontitle : "你觉得涅槃肿么样",
						questiontype : 5
					}]
		}
	}
};
/**
 * 反馈问卷
 */
Requester.debug.ADD_survey_response = function(param) {

	return {
		status : 200
	}
};
