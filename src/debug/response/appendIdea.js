/**
 *蹊径接口 
 */
Requester.debug.GET_creativeIdeaInfo = function(level,param) {
   var rel = new Requester.debug.returnTpl();

    rel.data = [];
    var maxNum = (kslfData == 4 ? 0 : 90);
    //prompt('number', 0)
    var pid = 0;
    if (param.condition && param.condition.planid) {
        pid = param.condition.planid * 1000;
    }
    rel.data.listData=[];maxNum=2;
    for (var j = 0; j < maxNum; j++) {
        rel.data.listData[j] = {};
        for (var i = 0, len = param.fields.length; i < len; i++) {
            rel.data.listData[j][param.fields[i]] = Requester.debug.data['creativeIdeaInfo'][param.fields[i]](j + 1 + pid);
        }
    }
   return rel;
};


Requester.debug.DEL_creativeidea = function(){
   var rel = new Requester.debug.returnTpl();
       rel.data = 1;
       return rel;
};

Requester.debug.MOD_creativeidea = function(){
    var rel = new Requester.debug.returnTpl();
    rel = {
        "data": [{
            "index": 2,
            "status": 0,
            "winfoid": 126118,
            "wordid": 336553,
            "showword": "鹌鹑",
            "bid": null
        }, {
            "index": 1,
            "status": 0,
            "winfoid": 126121,
            "wordid": 7924968,
            "showword": "巧克力豆",
            "bid": null
        }],
        
        "status": 200,
        
        "errorCode": {
            "message": " ",
            "code": 714,
            "detail": {
                'title' : UC_CV_AKA
            },
            "idx": 0
        }
    }

    return rel;
};


Requester.debug.GET_creativeidea_relatedMaterials = function(param) {
	var rel = new Requester.debug.returnTpl();

	rel.data = {};

	rel.data.Idea = {
            title: '{蹊径子链}，让搜索推广与众不同{啊哈}',
            desc1: '蹊径子链让您的{推广}拥有更丰富的表达形式和{内容}，吸引更多关注，帮您获得更好的推广效果',
            desc2: '如果您对蹊径子链的使用存在疑问，可{咨询}您的推广顾问',
            showurl: 'www.baidu.com'
        }

	rel.data.Keywords = ['关键词1', '关键词2', '关键词3', '关键词4', '关键词5']

	return rel;

};


Requester.debug.COPY_creativeidea= function(param) {
    var rel = new Requester.debug.returnTpl();
        rel.data = [];
        rel.status=300;
        return rel;
    
}

Requester.debug.GET_creativeidea_appuserstatus = function(){
    var rel = new Requester.debug.returnTpl();
        rel.data = 1;
        rel.status=200;
        return rel;
}


Requester.debug.GET_creativeidea_app = function() {
    var rel = new Requester.debug.returnTpl(),
        list = [];

    //console.log('dddddd')

    for (var i=0; i<20; i++) {
        list[i] = (function(i){
            var mcid = 'app'+ i,
                name = '搜索行业app' + i,
                iconurl = 'asset/img/panda.png',
                detailsurl = 'as.baidu.com/a/item=' + i,
                version = '1.1.8',
                platform = 0,
                downurl = 'as.baidu.com/d/item=' + i;

            return {
                'sid': mcid,
                'iconurl': iconurl,
                'detailurl': detailsurl,
                'version': version,
                'platform': platform,
                'downurl': downurl,
                'name': name
            }
        })(i);
    }

    rel.data = {};
    rel.status = 200;
    
    rel.data.listData = list;

    //console.log(rel);

    return rel;
}

Requester.debug.ADD_creativeidea_app = function() {
    var rel = new Requester.debug.returnTpl();

    rel.data = 'dddddddddddddddddd'
    rel.status = 200;
    return rel;
}
