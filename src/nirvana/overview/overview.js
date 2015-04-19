/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    overview/overview.js
 * desc:    推广概况
 * author:  chenjincai
 * date:    $Date: 2010/12/21 $
 */



var overview = new er.Module({
    config: {
        'action': [
			{
                path: '/',
                action: 'overview.index'
            },
            {
                path: '/overview/index',
                action: 'overview.index'
            },
            {
                path: '/overview/reminder',
                action: 'overview.reminder'
            },
            {
                path: '/overview/addIndexFolder',
                action: 'overview.addIndexFolder'
            },
            {
                path: '/overview/addFolder',
                action: 'overview.addFolder'
            },
            /*{
                path: 'overview/accountScore',
                action: 'overview.accountScore'
            },*/
            {
                path: 'overview/similarWords',
                action: 'overview.similarWords'
            }
        ]
    },

    remindRuleValueInfo: {
        remindWay : {
            '1': '消息提醒',
            '2': '短信提醒',
            '4': '邮件提醒'
        },
        remindContent: {
            '0': '到达预算下线',
            '1': '当日消费到达',
            '2': '无匹配资格 （因搜索量过低）',
            '3': '无展现资格 （因不宜推广）'
        }

    }
    
   
});
