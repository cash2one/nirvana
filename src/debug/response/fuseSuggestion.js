Requester.debug.GET_fuse_hideopen = function(level, param) {
    var rel = new Requester.debug.returnTpl();
    rel.data = {
        '66': 0
    }
    return rel;
};

Requester.debug.MOD_fuse_hideopen = function(level, param) {
    var rel = new Requester.debug.returnTpl();
    rel.data = true;
    return rel;
};

Requester.debug.GET_fuse_mtlsug = function(level, param) {
    var rel = new Requester.debug.returnTpl();

    rel.errorCode = 0;
    // param
    //{
    //     level: "planinfo", 
    //     needMtlInfo: true, 
    //     sugReqItems: [
    //         {
    //             planid: 2
    //             reason: 102
    //             suggestion: 1001
    //         }
    //     ], 
    //     timeout: 31000
    // }

    // if(!pass) {
    //     rel.status = 400;
    // }

    var returnData = {
        1001: {
            data:{
                planid: param.sugReqItems[0].planid,
                planname: '涅槃计划_' + param.sugReqItems[0].planid + '_new',
                bgttype: 1,
                wbudget: 1301,
                suggestbudget: 1334,
                clklost: 123
            },
            reason: 101,
            suggestion: 1001
        },
        1002: {
            data:{
                cycnum: "7",
                planid: param.sugReqItems[0].planid,
                planname: param.sugReqItems[0].planname,
                // suggestcyc : "[[204,208],[109,111],[308,318],[609,618],[715,720]]",
                suggestcyc: "[[621, 622], [607, 608], [608, 609], [623, 624], [602, 603], [603, 604], [604, 605]]",
                plancyc : "[[101,102],[118,121],[114,118]]",
                plancyc: "[[100, 124], [200, 224], [300, 324], [400, 424], [500, 524], [600, 610], [620, 624], [700, 710], [720, 724]]",
                // potionalclk: "[13, 34, 16, 88, 30, 90]",
                potionalclk: "[50, 50, 50, 50, 50, 50, 50]",
                // hotlevel: "[53, 34, 76, 18, 60, 20]"
                hotlevel: "[0, 0, 0, 0, 0, 0, 0]"
                
            },
            reason: 103,
            suggestion: 1002
        },
        2001: {
            data: {
                planid: param.sugReqItems[0].planid,
                planname: param.sugReqItems[0].planname,
                unitid: +param.sugReqItems[0].planid * 1000 + 1,
                unitname: param.sugReqItems[0].unitname
            },
            reason: 201,
            suggestion: 2001
        },
        2002: {
            data: {
                planid: param.sugReqItems[0].planid,
                planname: param.sugReqItems[0].planname,
                unitid: +param.sugReqItems[0].planid * 1000 + 1,
                unitname: param.sugReqItems[0].unitname,
                ideaid: "[1000, 1001, 1002]"
            },
            reason: 201,
            suggestion: 2002
        },
        3001: {
            data: {
                planid: param.sugReqItems[0].planid,
                planname: param.sugReqItems[0].planname,
                unitid: +param.sugReqItems[0].planid * 1000 + 1,
                unitname: param.sugReqItems[0].unitname,
                ideaid: param.sugReqItems[0].ideaid
                // unitname: '单元' + (param.sugReqItems[0].planid * 1000 + 1)
            },
            reason: 301,
            suggestion: 3001
        },
        3002: {
            data: {
                planid: param.sugReqItems[0].planid,
                planname: param.sugReqItems[0].planname,
                unitid: +param.sugReqItems[0].planid * 1000 + 1,
                unitname: param.sugReqItems[0].unitname,
                ideaid: param.sugReqItems[0].ideaid
            },
            reason: 301,
            suggestion: 3002
        },
        4001: {
            data: {
                winfoid: param.sugReqItems[0].winfoid
            },
            reason: 401,
            suggestion: 4001
        },
        4002: {
            data: {
                winfoid: param.sugReqItems[0].winfoid,
                showword: '我又换名了',
                prefideaid: 1000,
                planid: 1000,
                unitid: 1000
            },
            reason: 402,
            suggestion: 4002
        },
        4003: {
            data: {
                winfoid: param.sugReqItems[0].winfoid,
                showword: '我换名了您别介意融合1.0',
                bid: 0,
                unitbid: 10,
                recmbid: 15,
                // 展现占比 整数数字，直接后边加%
                // 如果非法，默认不提示这句： 近7天左侧前三位的展现占比为20%
                showratio: 0,
                targetshowratio: 28
            },
            reason: param.sugReqItems[0].reason,
            suggestion: param.sugReqItems[0].suggestion
        },
        4007: {
            data: {
                winfoid: param.sugReqItems[0].winfoid,
                showword: '我换名了您别介意融合1.0',
                bid: 10.00,
                unitbid: 10.00,
                recmbid: 15.00,
                // 展现占比 整数数字，直接后边加%
                // 如果非法，默认不提示这句：近7天左侧前三位的展现占比为多少%
                showratio: 20,
                targetshowratio: 28
            },
            reason: param.sugReqItems[0].reason,
            suggestion: param.sugReqItems[0].suggestion
        }
    };

    rel.data = {};
    var idkey = {
        'planinfo': 'planid',
        'unitinfo': 'unitid',
        'wordinfo': 'winfoid',
        'ideainfo': 'ideaid'
    };
    rel.data[param.sugReqItems[0][idkey[param.level]]] = returnData[param.sugReqItems[0].suggestion];

    kslfData ++;

    // rel.data =
    // {"timestamp":1315982065000,"listData":[{"bgttype":0,"daybgtdata":null,"weekbgtdata":null}],"totalnum":0,"returnnum":0,"signature":"419136226857159471","aostatus":2}
    return rel;
};