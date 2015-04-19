/*
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:   appendIdea/copyAppendIdeaLib.js
 * desc:    推广管理
 * author:  yanlingling
 * date:    $Date: 2012/09/20 $
 */

/**
 * @namespace 复制附加创意的工具方法
 */

manage.appendIdea.copyAppendIdeaDiff = {
    getAppendIdea : {
        'sublink': function(item){return appendIdeaLib.getSublinkReviewText(item.content)},
        'app':function(item){
            return baidu.encodeHTML(item.appname);
        }
    },
    
    typeName : {
        sublink : '蹊径',
        app :'app'
    },
     
    copyInferFace : {
        sublink : fbs.appendIdea.copyAppendIdea,
        app : fbs.appendIdea.addApp
    },
    msgShow : {
       'sublink' : '子链',
       'app':'app' 
    }
    

}
var copyAppendIdeaDiff = manage.appendIdea.copyAppendIdeaDiff;