/**
 * Bubble 组件的所有 source 都写在这，可有效防止重名
 * 
 */
(function() {
    var Bubble = fc.ui.Bubble;

    // 推广管理页：新功能提醒
    Bubble.source.tip_newaccount = Bubble.getSource('tip', { 
        position: 'rt',
        title: '快速新建计划全新升级', 
        content: '只需简单四步就能批量新建多个计划，新版设计让你挑选推荐关键词更方便顺心，创意撰写更直观智能',
        startTime: '2012/07/18'
    });

//    // 老户优化包 新提词 新功能提示// 不再使用的tip del by Huiyao 2013.3.1
//    Bubble.source.tip_newaddword = Bubble.getSource('tip', {
//        position: 'rt',
//        content: '您可以通过这里修改关键词计划，单元，出价和匹配方式',
//        startTime: '2012/07/18'
//    });

    // 重点词优化包的关键词列的信息Icon的提示
    Bubble.source.corewordInfoTable = fc.ui.Bubble.getSource('info', {
        title : function(node) {
            var data = fc.data.get(node);
            return getCutString(data.title, 12, "..");
        },
        content : function(node) {
            var data = fc.data.get(node);
            var displayLen = 24;
            var htmlArr = [];
            htmlArr[0] = '<ul class="bubble_content">';
            htmlArr[1] = '<li title="' + baidu.encodeHTML(data.planName) + '"><span>所属推广计划：</span>' + getCutString(data.planName, displayLen, "..") + '</li>';
            htmlArr[2] = '<li title="' + baidu.encodeHTML(data.unitName) + '"><span>所属推广单元：</span>' + getCutString(data.unitName, displayLen, "..") + '</li>';
            htmlArr[3] = "</ul>";

            return htmlArr.join('');
        },
        container : '#corewordTableContainer',
        parent: '.ui_table_tdcell'
    });

    Bubble.source.corewordModTable = fc.ui.Bubble.getSource('info', {
        title : function(node) {
            var data = fc.data.get(node);
            return '<span title="' + baidu.encodeHTML(data.title) + '">' + getCutString(data.title, 35, "..") + '</span>';
        },
        content : function(node) {
            var data = fc.data.get(node);
            var displayLen = 24;
            var htmlArr = [];
            htmlArr[0] = '<ul class="bubble_content">';
            htmlArr[1] = '<li title="所属推广计划：' + baidu.encodeHTML(data.planName) + '"><span>所属推广计划：</span>' + getCutString(data.planName, displayLen, "..") + '</li>';
            htmlArr[2] = '<li title="所属推广单元：' + baidu.encodeHTML(data.unitName) + '"><span>所属推广单元：</span>' + getCutString(data.unitName, displayLen, "..") + '</li>';
            htmlArr[3] = "</ul>";

            return htmlArr.join('');
        },
        container : '#AoPkgModCWordInfoList',
        parent: '.ui_table_tdcell'
    });
    
	// KR 日搜索量
    Bubble.source.column_pageview = Bubble.getSource('help', {
        title: '日均搜索量',
        parent: '.table-thead',
        position: 'lb'
    });

    // KR 竞争激烈程度
    Bubble.source.column_cmprate = Bubble.getSource('help', {
        title: '竞争激烈程度',
        parent: '.table-thead',
        position: 'lb'
    });

    Bubble.source.business_point = Bubble.getSource('help', {
        title: '业务点下的其他关键词',
        showBy: 'hover',
        container: '#krRecommandResult .table-tbody'
    });

    Bubble.source.match_pattern = Bubble.getSource('help', {
        title: '匹配方式',
        position: 'rb'
    });

    Bubble.source.auto_unit = Bubble.getSource('help', {
        title: '自动分组',
        content: '关键词工具增加自动分组新功能。您可以通过系统建议，将关键词分到多个计划单元中...' +
                 '<div style="text-align:right;margin-top:5px;"><a target="_blank" href="http://yingxiao.baidu.com/support/fc/detail_9208.html">了解更多</a></div>'
    });

    // 行业领先包Bubble提示功能
    Bubble.source.industryPkg =
    // 突降急救包升级版Bubble提示功能
    Bubble.source.emergencyPkg =
        Bubble.getSource('help', {
            title: function(node) {
    		    return node.getAttribute('title');
    	    },
    	    content: function(node, callback) {
    		    var title = node.getAttribute('title');

                Bubble.getContent(title, function(content) {
                    callback(content);
                });
    	    }
        });

    // 行业旺季包的旺季类型Icon的Bubble功能
    ui.Bubble.source.seasonPkg = {
        iconClass: 'ui_bubble_icon_none',
        bubbleClass: 'ui_bubble_wrap seasonpkg-tab-bubble',
        needBlurTrigger: true,
        showByOver: true,				//鼠标悬浮延时显示
        noBubbleClose: true,
        showByOverInterval: 100,
        hideByOutInterval: 10,
//        positionList : [4, 1, 8, 5, 2, 3, 6, 7],
        title: '',
        content: function (node) {
            var type = node.getAttribute('iconType');
            var contentMap = {
                'peak-season-ing': '当前行业处于旺季中',
                'peak-season-start': '当前行业即将进入旺季',
                'peak-season-end': '当前行业处于旺季末期'
            };
            return '<div class="peak-seaon-type-bubble">' + contentMap[type] + '</div>';
        }
    };

    // 通配符
    Bubble.source.wildcard = Bubble.getSource('help', {
        title: '什么是通配符？'
    });
    // 参考创意
    Bubble.source.refrenceIdea = Bubble.getSource('help', {
        title: '参考创意'
    });
    //移动优化包是否添加推荐创意 by mayue
    Bubble.source.attach_rec_idea = Bubble.getSource('help', {
        title: '推荐创意'
    });
    //市场风向标 流量占比 by mayue
    Bubble.source.market_flow_rate = Bubble.getSource('help', {
        title: '流量占比'
    });
    //市场风向标 竞争度 by mayue
    Bubble.source.market_compete_degree = Bubble.getSource('help', {
        title: '竞争度'
    });

    // 优化包关键词显示bubble信息配置
    ui.Bubble.source.aoPkgTableWordInfo = {
        iconClass : 'ui_bubble_icon_info',
        positionList : [2,3,4,5,6,7,8,1],
        needBlurTrigger: true,
        showByOver: true,				//鼠标悬浮延时显示
        noBubbleClose: true,
        showByOverInterval: 10,
        showByClick: true,
        hideByOutInterval: 100,
        hideByOut: true,
        title: function (node) {
            var title = node.getAttribute('title');
            if (title) {
                return (baidu.encodeHTML(baidu.decodeHTML(title)));
            }
            else {
                return (baidu.encodeHTML(baidu.decodeHTML(node.firstChild.nodeValue)));
            }
        },
        content: function (node) {
            var planname = node.getAttribute('planname');
            var unitname = node.getAttribute('unitname');
            return '<ul class="rank_bubble_content">'
                +       '<li title="' + baidu.encodeHTML(planname) + '">'
                +           '<span>所属推广计划：</span>'
                +           getCutString(baidu.encodeHTML(planname), 23, '...')
                +       '</li>'
                +       '<li title="' + baidu.encodeHTML(unitname) + '">'
                +           '<span>所属推广单元：</span>'
                +           getCutString(baidu.encodeHTML(unitname), 23, '...')
                +       '</li>'
                +  '</ul>';
        }
    };

    /**
     * 从aopackage/lib_widget.js移过来 by Huiyao
     * 质量度优化包优化详情突降bubble
     */
    ui.Bubble.source.decr = {
        type : 'tail',
        iconClass : 'decrease_icon',
        positionList : [1,7,6,5,4,3,2,8,4],
        needBlurTrigger : true,
        showByClick : true,
        showByOver : false,			//鼠标悬浮延时显示
        hideByOut : false,			//鼠标离开延时显示
        title: function(node){
            return node.getAttribute('bubbletitle');
        },
        content: function(node, fillHandle, timeStamp){
            var beginDate = baidu.date.format(nirvana.decrControl.beginDate, 'MM-dd'),
                beginvalue = node.getAttribute('beginvalue'),
                endvalue = node.getAttribute('endvalue'),
                decr = node.getAttribute('decr'),
                valuetype = node.getAttribute('valuetype'),
                beginshowq = node.getAttribute('beginshowq'),
                endshowq = node.getAttribute('endshowq'),
                word = '',
                html = '<table class="decr_bubble_table">';

            baidu.addClass(baidu.q('ui_bubble_wrap')[0],'bubble_decr');

            switch(valuetype){
                case 'shows':
                    word = '展现量';
                    break;
                case 'clks':
                    word = '点击量';
                    break;
                case 'pv':
                    word = '浏览量';
                    break;
            }

            if (beginshowq) {
                html += '<tr><td class="decr_bubble_right">质量度变化：</td><td><table class="decr_star_table"><tr><td class="decr_showq">' + qStar.getTableCell(beginshowq);
                html += '</td><td><span class="decr_arrow"></span></td><td class="decr_showq">';
                html += qStar.getTableCell(endshowq)+'</td></tr></table></tr>';
            }
            html+='<tr><td class="decr_bubble_right">'+beginDate+word+'：</td><td>'+beginvalue+'</td></tr>';
            html+='<tr ><td class="decr_bubble_right">昨日'+word+'：</td><td>'+endvalue+'</td></tr>';
            html+='<tr><td class="decr_bubble_right">'+word+'突降：</td><td>'+decr+'</td></tr></table>';
            return html;
        }
    };
})();
