var nirvana = nirvana || {};

//USER_ID在登陆后跳转过来时由url携带
nirvana.env = {
	USER_ID : baidu.url.queryToJson(location.search)['userid'],
//	USER_ID : location.search.substr(1),
	TOKEN : ''
};
    
//资质提示信息地址
var UC_CV_LINK = 'http://yingxiao.baidu.com/support/?module=default&controller=index&action=detail&nodeid=6260&userid=';
//此处在代码中存在字面依赖，如果要修改，需aka online一起修改
var UC_CV_AKA = '您的创意由于包含某些可选资质行业的内容,暂时无法正常推广,请您参考以下页面的相关信息,出示相关资质证明';
var UC_CV_AKA_SHORT = '该创意包含可选资质行业内容，<a href="%d" target="_blank">点击查看</a>资质行业相关信息';
var WORD_NUMBER_INPUT_MAX = 100;
var KEYWORD_MAXLENGTH = 40;
var KR_WORD_MAXLENGTH = 64;
var KR_URL_MAXLENGTH = 1017;
var REFUSE_WORD_NUMBER_INPUT_MAX = 10;
var MAXBID_MAX = 999.99;

var PLAN_NAME_MAXLENGTH = 30;
var UNIT_NAME_MAXLENGTH = 30;
var FOLDER_NAME_MAXLENGTH = 30;

var PLAN_THRESHOLD = 100;
var UNIT_THRESHOLD = 1000;
var IDEA_THRESHOLD = 50;
var WORD_THRESHOLD = 5000;
var LIST_THRESHOLD = 500;
var STATISTICS_NODATA = 0;//doris统计数据无结果

var AO_NAMEDATA_MAXLENGTH = 20;
var AO_NAMEDATA_MINLENGTH = 10;


// 创意各项长度限制
var C_TITLE_LENGTH = 26;
var C_LINE_F_LENGTH = 36;
var C_LINE_S_LENGTH = 36;
var C_URL_A_LENGTH = 1017;
var C_URL_D_LENGTH = 36;

var IDEA_SINGLE_LINE_HEIGHT = 30;
var IDEA_TITLE_MAX_LENGTH = 50;
var IDEA_TITLE_MIN_LENGTH = 1;
var IDEA_TITLE_PROPER_LENGTH = 8;
var IDEA_TITLE_SPLIT_LENGTH = 28;
var IDEA_TITLE_SPLIT_WIDTH = 270;
var IDEA_TITLE_STORAGE_LENGTH = 286;

var IDEA_DESC1_MAX_LENGTH = 80;
var IDEA_DESC1_MIN_LENGTH = 1;
var IDEA_DESC1_PROPER_LENGTH = 8;
var IDEA_DESC1_SPLIT_LENGTH = 40;
var IDEA_DESC1_SPLIT_WIDTH = 270;
var IDEA_DESC1_STORAGE_LENGTH = 396;

var IDEA_DESC2_MAX_LENGTH = 80;
var IDEA_DESC2_MIN_LENGTH = 0;
var IDEA_DESC2_STORAGE_LENGTH = 396;

var IDEA_HREF_MAX_LENGTH = 1017;
var IDEA_HREF_MIN_LENGTH = 1;

var IDEA_URL_MAX_LENGTH = 36;
var IDEA_URL_MIN_LENGTH = 1;

//移动url配置 yll
var IDEA_MHREF_MAX_LENGTH = 1017;
var IDEA_MHREF_MIN_LENGTH = 0;

var IDEA_MURL_MAX_LENGTH = 36;
var IDEA_MURL_MIN_LENGTH = 0;
// 配置历史记录html的地址 Added by Wu Huiyao 问过Eric该功能已在er里实现：IFRAME_CONTENT
// er.config.CONTROL_IFRAME_URL = './asset/history.html';

// 配置模板列表
er.config.TEMPLATE_LIST = ['./asset/tpl/nirvana_tpl.html'];

// 质量度等级定义
var DEF_STAR_1 = 75;	// 1颗星和2颗星的分割线
var DEF_STAR_2 = 125;	// 2颗星和3颗星的分割线

var MTYPE = {
	"63" : "精确",
	"31" : "短语",
	"15" : "广泛"
};

//设备字面配置
var DEVICE_CHAR_CONFIG = {
	0:'全部设备',
	1:'仅计算机',
	2:'仅移动设备'
}
nirvana.config = {
	WORDADMIN : "wordadmin",
	
	//ajax请求的BASE地址
	REQUEST_URL_BASE : 'request.ajax',
	
	//监控请求地址
	LOG_REQUEST_PATH: '/nirvana/log/fclogimg.gif',
	//LOG_REQUEST_PATH: 'http://nirvana/fe/test.jpg',
	
	TOOL_IMPORT_CONFIRM :[
		{
			tool:"report",
			material:["plan","unit","keyword","idea","folder"]
		},
		{
			tool:"adpreview",
			material:["keyword"]
		},
		{
			tool:"history",
			material:["plan","unit","keyword","idea", "sublink",'app']
		},
		{
            tool: 'kr',
			material:["keyword"]
		},
		{
			tool:"estimator",
			material:["keyword"]
		},
		{
			tool:"queryReport",
			material:["plan","unit","keyword","idea"]
		},
		{
			tool:"proposal",
			material:["plan","unit","keyword","idea"]
		},
		{
			tool:"effectAnalyse",
			material:["plan","unit","keyword","folder"]
		}
	],
	
	
	/**
	 * 日历快捷控件的配置项
	 */
	dateOption : [
			        {
			            text:'昨天',
						optionIdx:0,
			            getValue: function () {
			                var yesterday = new Date(this.now.getTime());
			                yesterday.setDate(yesterday.getDate() - 1);
			                yesterday.setHours(0,0,0,0);
			                return {
			                    begin: yesterday,
			                    end: yesterday
			                };
			            }
			        },
			        {
			            text:'最近7天',
						optionIdx:1,
			            getValue: function () {
			                var begin = new Date(this.now.getTime()),
			                    end = new Date(this.now.getTime());
			                
			                end.setDate(end.getDate() - 1);
			                begin.setDate(begin.getDate() - 7);
			                begin.setHours(0,0,0,0);
							end.setHours(0,0,0,0);
			                return {
			                    begin:begin,
			                    end:end
			                };
			            }
			        },
					{
			            text:'上周',
						optionIdx:2,
			            getValue: function () {
			                var now = this.now,
			                    begin = new Date(this.now.getTime()),
								end = new Date(this.now.getTime()),
								_wd = 1; //周一为第一天;
			               	
							if (begin.getDay() < _wd%7) {
								begin.setDate(begin.getDate() - 14 + _wd - begin.getDay());
							} else {
								begin.setDate(begin.getDate() - 7 - begin.getDay() + _wd % 7);
							}				
							begin.setHours(0,0,0,0);		
							end.setFullYear(begin.getFullYear(), begin.getMonth(), begin.getDate() + 6);
							end.setHours(0,0,0,0);
							                 
			                return {
			                    begin:begin,
			                    end:end
			                };
			            }
			        },
					{
			            text:'本月',
						optionIdx:3,
			            getValue: function () {
			                var now = this.now,
			                    begin = new Date(this.now.getTime()),
								end = new Date(this.now.getTime());
			                begin.setDate(1);
			                begin.setHours(0,0,0,0);
							end.setHours(0,0,0,0);
			                return {
			                    begin:begin,
			                    end:end
			                };
			            }
			        },
			        {
			            text:'上个月',
						optionIdx:4,
			            getValue: function () {
			                var now = this.now,
			                    begin = new Date(now.getFullYear(), now.getMonth() - 1, 1),
			                    end = new Date(now.getFullYear(), now.getMonth(), 1);
			                end.setDate(end.getDate() - 1);
			                begin.setHours(0,0,0,0);
							end.setHours(0,0,0,0);
			                return {
			                    begin:begin,
			                    end:end
			                };
			            }
			        },
			        {
			            text:'上个季度',
						optionIdx:5,
			            getValue: function () {
			                var now = this.now,
			                    begin = new Date(now.getFullYear(), now.getMonth() - now.getMonth()%3 - 3, 1),
			                    end = new Date(now.getFullYear(), now.getMonth() - now.getMonth()%3, 1);
			                end.setDate(end.getDate() - 1);
			                begin.setHours(0,0,0,0);
							end.setHours(0,0,0,0);
			                return {
			                    begin:begin,
			                    end:end
			                };
			            }
			        },
			        {
			            text:'所有时间',
						optionIdx:6,
			            getValue: function () {                
			                return {
			                    begin:"",
			                    end:""
			                };
			            }
			        },
					{
			            text:'最近14天',
						optionIdx:7,
			            getValue: function () {
			                var begin = new Date(this.now.getTime()),
			                    end = new Date(this.now.getTime());
			                
			                end.setDate(end.getDate() - 1);
			                begin.setDate(begin.getDate() - 14);
			                begin.setHours(0,0,0,0);
							end.setHours(0,0,0,0);
			                return {
			                    begin:begin,
			                    end:end
			                };
			            }
			        },
			        {
				        text:'最近一个月',
						optionIdx:8,
				        getValue: function () {
				            var now = this.now,
				                begin = new Date(now.getTime()),
								end = new Date(now.getTime());
				            begin.setMonth(begin.getMonth() - 1);
				            end.setDate(end.getDate() - 1);
				            begin.setHours(0,0,0,0);
							end.setHours(0,0,0,0);
				            return {
				                begin:begin,
				                end:end
				            };
				        }
				    }
			    ],
	
	region : [["全部地域",0],["北京",1],["上海",2],["天津",3],["广东",4],["福建",5],[],["日本",7],["海南",8],["安徽",9],["贵州",10],["甘肃",11],
				["广西",12],["河北",13],["河南",14],["黑龙江",15],["湖北",16],["湖南",17],["吉林",18],["江苏",19],["江西",20],
				["辽宁",21],["内蒙古",22],["宁夏",23],["青海",24],["山东",25],["山西",26],["陕西",27],["四川",28],["西藏",29],
				["新疆",30],["云南",31],["浙江",32],["重庆",33],["香港",34],["台湾",35],["澳门",36],["其他国家",37] ],
					

	/**
	 * 关键词/创意被拒绝原因
	 */
	detailOfflineReason : [
		{
			id: 308,
			abst: "关键词与网站内容相关度不够",
			desc: "请您针对网站内容提交关键词，确保关键词与网站内容相关。"
		},
		{
			id: 309,
			abst: "相同推广关键词",
			desc: "为避免创意雷同影响推广效果，请不要为多个账户提交相同业务的创意或者关键词。"
		},
		{
			id: 2000000000,
			abst: "您的关键词包含其他商户的注册商标，配对创意将不可推广",
			desc: "您的关键词包含其他商户的注册商标，配对创意将不可推广。"
		},
		{
			id: 213,
			abst: "您的关键词包含其他商户的注册商标，配对创意将不可推广111",
			desc: "您的关键词包含其他商户的注册商标，配对创意将不可推广。"
		},
		{
			id: 310,
			abst: "关键字中不可以包含竞品词汇",
			desc: "为了保证您在线推广信息的公平公正，请您确保关键字中不要包含竞争对手的信息"
		},
		{
			id: 2,
			abst: "标题描述与关键词不符",
			desc: "请您针对关键词进行标题和描述的撰写，并且确保语句通顺，信息客观真实。"
		},
		{
			id: 102,
			abst: "对同一关键词注册网页过多",
			desc: "您的推广账户中已经存在相同关键词，请不要重复提交该关键词。"
		},
		{
			id: 301,
			abst: "涉嫌非法内容或非法链接",
			desc: "您的关键词或网页中包含的内容可能不符合相关规定，请您重新提交关键词或去掉页面中的非法信息。"
		},
		{
			id: 302,
			abst: "填写的url不能访问",
			desc: "您提交的url地址无法访问，请检查关键词的url地址，在确认能打开后重新提交。"
		},
		{
			id: 303,
			abst: "涉嫌为他人公司进行推广",
			desc: "您在百度注册的推广服务账户涉嫌为多个公司进行推广，请确保一个账户只为一家公司推广。"
		},
		{
			id: 304,
			abst: "请将url指向关键词相关页面",
			desc: "请您修改url，指向与关键词相关的网页地址。"
		},
		{
			id: 5,
			abst: "填写的 url 不能访问",
			desc: "您提交的url地址无法访问，请检查关键词的url地址，在确认能打开后重新提交。"
		},
		{
			id: 6,
			abst: "同一账户提交多个网站",
			desc: "由于您注册的公司信息和网页信息不一致，在百度推广服务的一个帐号，只能为一家公司做推广。为了保障您的利益，请确认并重新提交关键词的URL地址。"
		},
		{
			id: 7,
			abst: "请将url指向关键词相关页面",
			desc: "请修改URL，指向与关键词相关的网页地址。"
		},
		{
			id: 305,
			abst: "关键词中不能包含注册商标",
			desc: "请您重新提交关键词，确保不包含其他商户的注册商标。"
		},
		{
			id: 9,
			abst: "关键词未出现在标题描述中",
			desc: "请您修改标题描述，使其在前20个字内包含关键词。"
		},
		{
			id: 306,
			abst: "关键词中使用无意义符号",
			desc: "请您检查关键词，去掉特殊符号、全角字符或其他影响语句通顺的标点符号。"
		},
		{
			id: 307,
			abst: "显示url不规范",
			desc: "请您确保显示url填写规范、完整。"
		},
		{
			id: 131,
			abst: "标题描述与关键词不符",
			desc: "请您针对关键词进行标题和描述的撰写，并且确保语句通顺，信息客观真实。"
		},
		{
			id: 201,
			abst: "涉嫌非法内容或非法链接",
			desc: "您的创意或网页中包含的内容可能不符合相关规定，请修改您的创意或去掉页面中的非法信息。"
		},
		{
			id: 1024,
			abst: "涉嫌非法内容或非法链接",
			desc: "您的创意或网页中包含的内容可能不符合相关规定，请修改您的创意或去掉页面中的非法信息。"
		},
		{
			id: 202,
			abst: "填写的 url 不能访问",
			desc: "您提交的url地址无法访问，请检查创意的url地址，在确认能打开后重新提交。"
		},
		{
			id: 32768,
			abst: "填写的 url 不能访问",
			desc: "您提交的url地址无法访问，请检查创意的url地址，在确认能打开后重新提交。"
		},
		{
			id: 203,
			abst: "涉嫌为他人公司进行推广",
			desc: "您在百度注册的推广服务账户涉嫌为多个公司进行推广，请确保一个账户只为一家公司推广。"
		},
		{
			id: 134,
			abst: "同一账户提交多个网站",
			desc: "由于您注册的公司信息和网页信息不一致，在百度推广服务的一个帐号，只能为一家公司做推广。为了保障您的利益，请确认并重新提交关键词的URL地址。"
		},
		{
			id: 204,
			abst: "请将url指向创意相关页面",
			desc: "请您修改url，指向与创意相关的网页地址。"
		},
		{
			id: 205,
			abst: "创意中不能包含注册商标",
			desc: "请您修改创意，确保不包含其他商户的注册商标。"
		},
		{
			id: 2048,
			abst: "创意中不能包含注册商标",
			desc: "请您修改创意，确保不包含其他商户的注册商标。"
		},
		{
			id: 137,
			abst: "关键词未出现在标题描述中",
			desc: "请您修改创意，使其在前20个字内包含关键词。"
		},
		{
			id: 206,
			abst: "创意中使用无意义符号",
			desc: "请您检查创意，去掉特殊符号、全角字符或其他影响语句通顺的标点符号。"
		},
		{
			id: 207,
			abst: "显示url不规范",
			desc: "请您确保显示url填写规范、完整。"
		},
		{
			id: 208,
			abst: "创意与网站内容相关度不够",
			desc: "请您针对网站内容进行创意的撰写，确保创意与网站内容相关。"
		},
		{
			id: 209,
			abst: "相同推广创意",
			desc: "为避免创意雷同影响推广效果，请不要为多个账户提交相同业务的创意或者关键词。"
		},
		{
			id: 210,
			abst: "创意撰写不符",
			desc: "请您针对推广内容进行创意的撰写，并且确保语句通顺，信息客观真实。"
		},
		{
			id: 211,
			abst: "创意中不可以包含竞品词汇",
			desc: "为了保证您在线推广信息的公平公正，请您确保创意中不要包含竞争对手的信息"
		},
		{
			id: 212,
			abst: "您仅限在网盟进行推广活动",
			desc: "抱歉！您是网盟独立用户，不能在搜索推广平台进行推广活动"
		},
		{
			id: 21,
			abst: "注册信息不完整",
			desc: "请将您的注册信息填写完整，以便我们能更好的为您提供服务。在您的注册信息填写完整后请重新提交，我们会重新为您审核。"
		},
		{
			id: 22,
			abst: "填写的url不能访问",
			desc: "由于您注册的url地址无法访问，这会影响您参加推广服务的推广效果，请您检查您注册的url地址，在确认能打开后重新提交，我们会重新为您审核。"
		},
		{
            id: 10,
            abst: "移动url审核中",
            desc: "当前关键词移动url正在审核中"
        },
		{
			id: 23,
			abst: "涉嫌非法内容或非法链接",
			desc: "您的网站内容可能不符合相关规定，请您修改并确认您的网站内容后重新提交，我们会重新为您审核。"
		},
		{
			id: 24,
			abst: "信息不符",
			desc: "由于您注册的公司信息和网站信息不一致，在百度推广服务的一个帐号,只能为一家公司的一个域名作推广，我们为了保障您的利益，请确认并重新提交您的注册信息，我们会重新为您审核。"
		},
		{
			id: 25,
			abst: "非特定帐号提交",
			desc: "请与您的代理商进行联系，要求代理商更换其他代理账户提交您的用户信息。"
		},
		{
			id: 26,
			abst: "涉嫌跨地区发展",
			desc: "百度已经在您所属的地域成立了地区总代，他们能为您提供最优质的本地化服务，由他们协助您提交注册信息，我们会重新为您审核。"
		},
		{
			id: 27,
			abst: "注册网址与关键词url不一致",
			desc: "由于您注册的url地址与您提交的关键词的url地址不一致，请您确定唯一一个域名，我们会重新为您审核。"
		},
		{
			id: 28,
			abst: "其他",
			desc: "您的用户信息没有通过审核，可拨打竞价排名热线400-890-0088进行查询。"
		},
		{
			id: 29,
			abst: "网站内存在病毒",
			desc: "您的网站可能被病毒感染，请对您的网站杀毒后重新提交，我们会重新为您审核。"
		},
		{
			id: 3072,
			abst: "您的标题描述不符合撰写规范，请更改",
			desc: "您的标题和描述不符合广告推广的撰写规范，请您注意通配符使用问题，进行修改。"
		},
		{
			id: 4096,
			abst: "涉嫌为他人公司进行推广",
			desc: "您在百度注册的推广服务账户涉嫌为多个公司进行推广，请确保一个账户只为一家公司推广。"
		},
		{
			id: 8192,
			abst: "关键词和创意包含竞品词汇",
			desc: "关键词和创意中不可以包含侵犯他人合法权益的内容。"
		},
		{
			 id: 16384,
             abst: "需出示相关资质文件",
            desc: "您的关键词/创意中可能包含某些可选资质行业的内容，请您参考以下资质行业信息，出示相关资质证明。",
            ao_desc : "您的关键词/创意由于包含某些可选资质行业的内容，暂时无法正常推广，请您参考“创意所需资质列表”页面，出示相关资质证明",
            link : UC_CV_LINK


		},
		{
			id: 65536,
			abst: "网页中包含病毒",
			desc: "网页中包含不安全信息，请您删除不安全信息，确保网页可安全访问。"
		},
		{
	       	id: 131072,
	       	abst: "关键词或创意的URL不符合相关跳转规定",
	       	desc: "由于您的关键词或创意中的URL发生跳转，并且不符合相关跳转规定，暂时无法正常推广。"
	    },
		{
            id: 5120,
            abst: "物料联系方式不一致",
            desc: "您物料中的联系方式与注册备案的联系方式不相符，请联系您的网络营销顾问。"
        },
        {
        	id: 9216,
        	abst: '物料涉嫌违规',
        	desc: '请修改不符合规定的相关物料'
        }

	],
		
				
	
	//各项数字配置
	NUMBER : {
		ACCOUNT : {
			//最小预算
			MIN_BUDGET : 50,
			MIN_WEEKBUDGET : 388
		},
		PLAN : {
			//最小预算
			MIN_BUDGET : 50
		},
		UNIT : {
			MAX_LENGTH : 30
		},
		KEYWORD : {
			MAX_LENGTH : 40,  // 关键词最大长度
			MAX_INPUT : 100,  // 添加关键词时，最多输入的数量
			MAX : 5000  //  所在单元的关键词添加上限数量
		},
		BID_MAX : 999.99,
		BID_MIN : 0,
		
		REPORT : {
			MAX_LENGTH : 50  // 报告名称最大长度
		},
		
		MAX_RECORD : {
			DEFAULT : 20000, // default按照Firefox4浏览器的数量处理
			IE6 : 5000,
			IE7 : 10000,
			IE8 : 10000,
			IE9 : 10000,
			FIREFOX3 : 13000, // 数据太大，返回会有bug
			FIREFOX : 20000,
			CHROME : 20000,
			OPERA : 20000,
			LIST :1000
		},
		
		MAX_RECORD_IDEA : {
			DEFAULT : 15000, // default按照Firefox4浏览器的数量处理
			IE6 : 7000,
			IE7 : 7000,
			IE8 : 7000,
			IE9 : 7000,
			FIREFOX3 : 10000, // 数据太大，返回会有bug
			FIREFOX : 15000,
			CHROME : 15000,
			OPERA : 15000
		},
		
		AO: {
			THRESHOLD:{
				MIN: 0,
				MAX: 100
			}
		}/*, // del by Huiyao 2013.1.7 移到aopackage/config.js
        AODECR: {
            THRESHOLD:{
                MIN: 0,
                MAX: 100
            }
        }*/
	},
	
	//涅槃的提示等话术
	LANG : {
		DWR_WRONG_DATA: "返回数据无效",
		TOOLS_NAME : {
			history : '历史操作查询',
			estimator : '估算工具',
			report : '数据报告',
			trans  : '转化跟踪',
			translist  : '转化跟踪',
			newtrans  : '转化跟踪',
			transcheck  : '转化跟踪',
			transCheckSingle  : '转化跟踪',
			myReport : '我的报告',
			adpreview : '推广实况',
			kr : '关键词工具',
			queryReport : '搜索词报告',
			proposal : '获取优化建议',
			decrease : '获取优化建议',
			effectAnalyse : '效果分析',
			advance: '高级工具'
		},
		NO_BUDGET : '不限定预算',
		DIFFERENCE : '<各异>',
		LOADING : '正在读取数据，请稍候...',
		KR_LOADING : '正在为您分析，请稍候...',
		LOADING_DONE : '数据加载完毕！',
		FILETER_PLAN : '请选择推广计划',
		FILETER_UNIT : '请选择推广单元',
		KW_OVERSTEP: '账户可监控关键词数量已达上限',
		FOLD_OVERSTEP: '概况页监控文件夹已达上限',
		406: '因数据量过大，您的操作部分成功，请重试确保完全成功！',
		407:'您本次操作的关键词数量已超出系统上限，<br />请您调整范围后重新操作！',
		408:'您对关键词的操作过于频繁，请您暂时不要对计划<br />进行启用、暂停和删除操作！',
		
		LEVEL_NAME : {
			"planinfo": "推广计划",
			"unitinfo": "推广单元",
			"wordinfo": "关键词",
			"ideainfo": "创意",
			"creativeinfo": "附加创意"
		},
		LEVEL_CHANGE_WARN : '您选择其他层级后，会清空您当前的选定对象列表，确认清空当前列表吗？',
		
		REPORT_TPL_WARN : '您选择其他“快捷模板”后，会修改您原来所选定的报告生成条件，确认修改原来所选定的条件吗？',
		
		WORD: {
			NUMBER_MAX: "抱歉，目前推广单元下的关键词数量已经达到了上限，无法创建新的关键词",
			ACTIVE_SUCCESS: "关键词激活成功",
			ACTIVE_FAIL: "激活操作失败，请稍后再试或与管理员联系",
			
			ADD_SUCCESS: '<span class="saveinfo">添加关键词成功</span>',
			
			ADD_ERR_0: "您还没有输入任何关键词",
			ADD_ERR_1: "抱歉，目前推广单元下的关键词数量已经达到了上限，无法创建新的关键词",
			ADD_ERR_2: "关键词输入数量不得超过" + WORD_NUMBER_INPUT_MAX + "个",
			ADD_ERR_3: "关键词不能为空",
			ADD_ERR_4: "每个关键词的长度最长为" + Math.ceil(KEYWORD_MAXLENGTH / 2) + "个汉字或" + KEYWORD_MAXLENGTH + "个英文。",
			ADD_ERR_5: "添加关键词失败，请检查您输入的关键词是否有效",
			
			ADD_ERR_6: "抱歉，请选择所要添加的关键词所属的推广计划以及推广单元",
			
			CB_NO_RESULT: "暂无关键词",
			
			SEARCH_NO_RESULT: "没有满足您输入的搜索条件的关键词",
			SEARCH_WORD_MALICE: "您的查询过于频繁，建议您申请API：<a href='http://apihome.baidu.com/' target='_blank'>http://apihome.baidu.com/</a>",
			SEARCH_WORD_NULL: "非常抱歉，<br/>您输入的关键词暂时无法为您提供较好的结果。<br/><span><strong>您可以尝试输入其他关键词或者您的URL。</strong></span>",
			SEARCH_WORD_LENGTH: "非常抱歉，<br/>您输入的<strong>关键词超过了限制</strong>(" + KR_WORD_MAXLENGTH + "个字符)，无法为您提供较好的结果。<br/><span><strong>您可以尝试精简或更换关键词。</strong></span>",
			SEARCH_URL_NULL: "非常抱歉，<br/>您输入的URL暂时无法为您提供较好的结果。<br/><span><strong>您可以尝试输入其他URL。</strong></span>",
			SEARCH_URL_LENGTH: "非常抱歉，<br/>您输入的<strong>URL超过了限制</strong>(" + KR_URL_MAXLENGTH + "个字符)，无法为您提供较好的结果。<br/><span><strong>您可以尝试更换URL。</strong></span>",
			SEARCH_INDU_NULL : "输入的行业词为空",
			SEARCH_INDU_LENGTH : "输入的行业词过长",
			SEARCH_MAX_LENGTH : "非常抱歉，<br/>您输入的<strong>条件超过了最大长度限制</strong>，无法为您提供较好的结果。<br/><span><strong>您可以尝试精简或更换搜索条件。</strong></span>",
			SEARCH_QUERY_TOO_FREQ : "非常抱歉，<br/>您的<strong>操作过于频繁</strong>，<strong>关键词工具</strong>需要暂停片刻。<br/><span><strong>请您稍等约10分钟后再试</strong></span>，谢谢。",		
			SEARCH_NO_RESULT_INDU: "抱歉，暂时没有更多结果，您可以试试别的子行业",
			SEARCH_NO_SUPPORT : "抱歉，查询类型不支持",
			
			SEARCH_DEF: "请输入关键词名称",
			
			DEL_CONFIRM: ["您确定删除关键词", "吗？删除操作不可恢复。"],
			DEL_ALL_CONFIRM: ["您确定删除所选的", "个关键词吗？删除操作不可恢复。"],
			DEL_SUCCESS: "删除关键词操作成功",
			DEL_FAIL: "抱歉，删除关键词操作失败，请稍后再试或与管理员联系",
			
			PAUSE_ALL_CONFIRM: "您确定暂停所选的关键词吗？",
			PAUSE_CONFIRM: ["您确定暂停关键词", "吗？"],
			PAUSE_FAIL: ["抱歉，暂停关键词操作失败，请稍后再试或与管理员联系"],
	
			RUN_ALL_CONFIRM: "您确定启用所选的关键词吗？",
			RUN_CONFIRM: ["您确定启用关键词", "吗？"],
			RUN_FAIL: ["抱歉，启用关键词操作失败，请稍后再试或与管理员联系"],
			
			ACTIVE_ALL_CONFIRM: "您确定激活所选的关键词吗？",
			ACTIVE_CONFIRM: ["您确定激活关键词", "吗？"],
			ACTIVE_FAIL: ["抱歉，激活关键词操作失败，请稍后再试或与管理员联系"],
			ACTIVE_SUCCESS: "激活关键词操作成功",
			
			BID_IS_NULL: "抱歉，设置出价为空，请重新设定",
			BID_MAX: "抱歉，设置出价不得大于" + MAXBID_MAX + "，请重新设定",
			BID_ISNAN: "抱歉，设置出价必须为数字，请重新设定",
			BID_HIGH: "抱歉，设置出价不得高于预算，请重新设定",
			BID_FAIL: "抱歉，设置出价失败，请稍后再试",		
			
			REFUSE_OVERLENGTH: '您的输入超过长度限制',
			REFUSE_EXCESSIVE: '最多可输入10个词',
			
			GROUP_WRONG_TIP:'抱歉，没有包含所选字词的结果，建议您修改后再试',
			GROUP_LONG_TIP:'“包含字词”超长，结果将会很少，建议您精简后再试',
			GROUP_NOGROUP_TIP:'您过滤了所有结果，可以尝试通过“自定义词”，筛选出更合您心意的关键词',
			FILTER_NO_RESULT : "<div class='nodata nodata_vertical'>对不起，没有符合的结果，您可以尝试更换筛选条件</div>"		
		},
		
		
		REPORT : {
			// 选定的物料层级，这里用于报告，需要注意搜索词和历史操作记录等和这里参数不一样
			MTLDIM : {
				'2' : '全账户',
				'3' : '推广计划',
				'5' : '推广单元',
				'6' : '关键词',
				'7' : '创意',
				'8' : '监控文件夹',
				'9' : '监控关键词'
			},
			// 推广方式
			PLATFORM : {
				'0' : '所有推广方式',
				'1' : '搜索推广',
				'2' : '网盟推广'
			},
			// 查询层级
			MTLLEVEL : {
				'2' : '账户',
				'3' : '推广计划',
				'5' : '推广单元',
				'6' : '关键词',
				'7' : '创意',
				'8' : '监控文件夹',
				'9' : '监控关键词'
			},
			// 循环频率
			REPORTCYCLE : {
				'1' : '每天',
				'2' : '每周',
				'3' : '每月初'
			},
			// 报告查看权限
			REPORTLEVEL : {
				'100' : '用户报告',
				'200' : '推广顾问报告',
				'201' : '客户经理报告',
				'300' : '管理员报告'
			},
			// 保存类型
			FILETYPE : {
				'0' : 'CSV',
				'1' : 'TXT'
			}
		}
	},
	REPORT_TIPS:['报告提示: 您勾选了对象使用数据报告, 我们默认为您打开指定范围报告。',
	'报告内容：您选择#下的#的#的#数据报告。'],
	PROMPT_DATE_END: '2011-12-31',
	
	// 搜索引擎维度，用于搜索词报告
	SE_SIZE : {
		// 百度
		1 : {
			value : 1,
			text : 'baidu.com'
		},
		// Google
		2 : {
			value : 2,
			text : 'google.com'
		},
		// 谷歌
		3 : {
			value : 3,
			text : 'google.cn'
		},
		// 搜狗
		4 : {
			value : 4,
			text : 'sogou.com'
		},
		// 中国搜索
		5 : {
			value : 5,
			text : 'zhongsou.com'
		},
		// Yahoo
		6 : {
			value : 6,
			text : 'search.yahoo.com'
		},
		// 中国雅虎
		7 : {
			value : 7,
			text : 'one.cn.yahoo.com'
		},
		// 搜搜
		8 : {
			value : 8,
			text : 'soso.com'
		},
		// 中国电信
		9 : {
			value : 9,
			text : '114search.118114.cn'
		},
		// live.com
		10 : {
			value : 10,
			text : 'search.live.com'
		},
		// 网易有道
		11 : {
			value : 11,
			text : 'youdao.com'
		},
		// 迅雷搜索
		12 : {
			value : 12,
			text : 'gougou.com'
		},
		// bing.com
		13 : {
			value : 13,
			text : 'bing.com'
		},
		// 360so.com
		14 : {
			value : 14,
			text : '360so.com'
		}
	},
	
	/**
	 * 转化跟踪相关配置
	 */
	TRANS : {
		MESSAGE_TRANS_PAUSE : '暂停后，将不再跟踪统计该目标，直至您重新启用。您希望现在暂停使用吗？',
		MESSAGE_TRANS_DEL : '删除后，将不再跟踪统计该目标，但该目标的历史转化数据仍然保留。您希望现在删除么？',
		MESSAGE_SITE_PAUSE : '暂停后，将不再跟踪统计该网站的网页转化数据，直至您重新启用。您希望现在暂停使用吗？',
		MESSAGE_PHONE_PAUSE : '暂停后，网页上将暂时不显示用于电话追踪的400号码，因而也暂时无法跟踪统计该网站的电话转化数据，直至您重新启用。您希望现在暂停使用吗？',
		MESSAGE_SITE_DEL : '您确定删除所选的网站吗？删除操作无法恢复。网站删除后，将不再跟踪统计该网站，该网站下的所有网页转化目标都将被删除，网页上也不再显示用于电话追踪的400号码，但该网站的历史转化数据仍然保留。如果确认删除，建议您同时移除您网站上的统计代码。',
		
		// 跟踪方式
		TRACK_TYPE : {
			URL : 0,
			COOKIE : 1,
			OFF : 2, // 不跟踪
			NULL : -1, // 用户未进行设置
			FORBIDDEN : -2 // 不可设置，在首次推广URL检查完成前，用户不可设置
		},
		
		DOMAIN_DEFAULT_VALUE: '请输入网站域名',
		
		// 域名列表，用于判断所属网站是否为主域名
        DOMAIN_LIST: [["ac.cn", "ac.il", "ac.kr", "ac.nz", "ac.uk", "ad.jp", "ah.cn", "bj.cn", "busan.kr", "chungbuk.kr", "chungnam.kr", "club.tw", "co.il", "co.jp", "co.kr", "co.nz", "co.uk", "com.cn", "com.hk", "com.tw", "cq.cn", "cri.nz", "daegu.kr", "daejeon.kr", "ebiz.tw", "ed.jp", "edu.cn", "edu.hk", "edu.tw", "es.kr", "fj.cn", "game.tw", "gangwon.kr", "gd.cn", "geek.nz", "gen.nz", "go.jp", "go.kr", "gov.cn", "gov.hk", "gov.il", "gov.tw", "gov.uk", "govt.nz", "gr.jp", "gs.cn", "gwangju.kr", "gx.cn", "gyeongbuk.kr", "gyeonggi.kr", "gyeongnam.kr", "gz.cn", "ha.cn", "hb.cn", "he.cn", "hi.cn", "hl.cn", "hn.cn", "hs.kr", "idf.il", "idv.hk", "idv.tw", "incheon.kr", "iwi.nz", "jeju.kr", "jeonbuk.kr", "jeonnam.kr", "jl.cn", "js.cn", "jx.cn", "k12.il", "kg.kr", "lg.jp", "ln.cn", "ltd.uk", "maori.nz", "me.uk", "mil.kr", "mil.nz", "mil.tw", "mod.uk", "ms.kr", "muni.il", "ne.jp", "ne.kr", "net.cn", "net.hk", "net.il", "net.nz", "net.tw", "net.uk", "nhs.uk", "nic.uk", "nm.cn", "nx.cn", "or.jp", "or.kr", "org.cn", "org.hk", "org.il", "org.nz", "org.tw", "org.uk", "parliament.nz", "parliament.uk", "pe.kr", "plc.uk", "qh.cn", "re.kr", "sc.cn", "sc.kr", "sch.uk", "sd.cn", "seoul.kr", "sh.cn", "sn.cn", "sx.cn", "tj.cn", "tw.cn", "ulsan.kr", "xj.cn", "xz.cn", "yn.cn", "zj.cn"], ["co", "com", "edu", "gov", "net", "org"]],
		
		//全面检查Loading
		ALL_LOADING : '<span class="loading_inline">检查正在进行中，可能会占用一定的时间，您可以稍后再到本页面查看结果。</span>',
		TRANS_LOADING : '<span class="loading_inline">检查正在进行中，请您在此页面稍等片刻，即可生成结果并进行查看。</span>'
	},
	
	/**
	 * 账户优化相关配置
	 */
	AO : {

		// 账户优化-左侧展现资格-质量度等级定义
		DEF_LMS_STAR_1 : 91,
		DEF_LMS_STAR_2 : 126,
		
		PROBABILITY_INTERVAL : 20,
		
		// 账户优化工具轮询间隔
		QUERY_INTERVAL : 5000,
		
		// 账户优化工具局部刷新延迟时间（毫秒）
		REFRESH_DELAY : 0,
		
		// 层级列表显示数量限制
		SUMMARY_DISPLAY_LIMIT : 3,
		
		//账户优化工具时间戳说明
		TIMESTAMP_MSG : '该时间为最近一次分析完成的时间。',
		
		//账户优化工具快捷操作（全部启用、激活等）显示阈值
		QUICK_ACCEPT_LIMIT : 500,
		
		// 层级列表每页显示数量限制
		SUMMARY_DISPLAY_LIMIT : 3,
		
		// 层级列表页数限制（最多向客户显示4页，总计12条优化建议）
		SUMMARY_PAGE_LIMIT : 4,
		
		// 账户优化工具详情页最大显示页数 老户转全改为500页
		MAX_PAGE : 500,
		
		// wanghuijun 2012.12.03
		// 删去效果突降相关的opttype
		OPTTYPE : {
			ALL : [1, 2, 52, 5, 8, 9, 11, 12, 13, 14, 10, 4, 18, 19, 3, 15, 16, 17, 20, 21, 22, 24], // 全部建议
			TIME : [1, 2, 52], // 优化在线时间
			KEYWORD : [5, 8, 9, 11, 12, 13, 14, 10], // 优化关键词
			BID : [4, 18, 19], // 优化出价
			QUALITY : [3, 15, 16, 17], // 优化质量
			SPEED : [20, 21], // 优化连通速度
			PAGE : [22], // 优化网页质量
			TRANS : [24], // 转化率
			
			USERACCT : [1],
			PLANINFO : [2, 52, 14],
			UNITINFO : [13],
			WORDINFO : [5, 8, 9, 11, 12, 10, 4, 18, 19, 3, 22],
			IDEAINFO : [15, 16, 17, 22],
			MONITOR : [],
			FOLDER : [5, 8, 9, 11, 12, 10, 4, 18, 19, 3, 22],
			
			// 突降新增opttype，如果不是突降用户，则不请求这些opttype
			DECREASE : [30, 33, 34, 41, 42, 43, 44, 45, 47]
		},
		
		TARGETS : {
			ALL : ['shows', 'clks', 'pv', 'trans'], // 全部建议
			TIME : ['lastofftime'], // 优化在线时间 --- 账户/计划最晚下线时间
			KEYWORD : ['shows', 'effwordnum'], // 优化关键词 --- 展现量   生效词量
			BID : ['leftshowrate'], // 优化出价 --- 左侧展现概率
			QUALITY : ['star3numrate'], // 优化质量 --- 生效三星词比例
			SPEED : ['conntime'], // 优化连通速度 --- 网站打开速度
			PAGE : ['attraction'], // 优化网页质量 --- 网站吸引力
			TRANS : ['trans'] // 转化率 --- 转化量
		},
		
		// 账户优化工具延迟时间配置项
		DELAY_CONFIG: {
			4: 2,
			9: 2,
			DEFAULT: 0.2
		},
		
		// 子项loading话术
		LOADING_TITLE : {
			1: '正在检查您的账户预算',
			2: '正在检查您的计划预算',
			3: '正在检查因质量度过低而无法获得稳定左侧展现资格的关键词',
			4: '正在检查因出价过低而无法在左侧首屏展现的关键词',
			5: '正在检查账户内关键词数量',
			// 7: '正在检查计划的推广时段的设置', // 老的时段优化项正式下掉 by Huiyao 2013.4.15
            // 手动版时段升级用到的opttype
            52: '正在检查计划的推广时段的设置',
			8: '正在检查处于待激活状态的关键词',
			9: '正在检查处于搜索无效状态的关键词',
			10: '正在检查因检索量过低而无法展现的关键词',
			11: '正在检查处于不宜推广状态的关键词',
			12: '正在检查处于暂停推广状态的关键词',
			13: '正在检查处于暂停推广状态的单元',
			14: '正在检查处于暂停推广状态的计划',
			15: '正在检查处于待激活状态的创意',
			16: '正在检查处于不宜推广状态的创意',
			17: '正在检查处于暂停推广状态的创意',
			18: '正在统计因出价过低而在左侧首屏展现概率较小的关键词',
			19: '正在统计因出价过低而在左侧第一位展现概率较小的关键词',
			20: '正在检查无法连通的目标页面',
			21: '正在检查目标网页的连通速度',
			22: '正在检查关键词/创意的跳出率',
			24: '正在检查您的转化率',
			
			30: '正在检查您的账户余额',
			31: '正在检查您的账户预算',
			32: '正在检查您的计划预算',
			33: '正在检查因修改匹配模式突降的关键词',
			34: '正在检查网民搜索量下降的词',
			35: '正在检查因搜索无效突降的关键词',
			36: '正在检查因不宜推广突降的关键词',
			37: '正在检查因暂停推广突降的关键词',
			38: '正在检查因暂停推广突降的单元',
			39: '正在检查因暂停推广突降的计划',
			40: '正在检查因检索量过低突降的关键词',
			41: '正在检查因被删除广突降的计划',
			42: '正在检查无生效创意的推广单元',
			43: '正在检查因被删除广突降的单元',
			44: '正在检查因被删除广突降的关键词',
			45: '正在检查因出价过低而平均排名/左侧展现概率突降的关键词',
			46: '正在检查突降为1星的关键词',
			47: '正在检查突降为2星的关键词',
			48: '正在检查计划的推广时段的设置',
			49: '正在检查无法连通的目标页面',
			50: '正在检查目标网页的连通速度'
		},
		
		LEVEL_TIP : {
			USERACCT : '针对账户层级的优化建议',
			PLANINFO : '针对计划层级的优化建议',
			UNITINFO : '针对单元层级的优化建议',
			WORDINFO : '针对关键词层级的优化建议',
			IDEAINFO : '针对创意层级的优化建议'
		},
		
		VALUE_TYPE : {
			1 : 'shows',
			2 : 'shows',
			3 : 'clks',
			4 : 'clks',
			5 : 'shows',
//			7 : 'shows', // 老的时段建议下掉 by Huiyao 2013.4.15
            // 手动版时段升级用到的opttype
            52: 'shows',
			8 : 'shows',
			9 : 'shows',
			10 : 'shows',
			11 : 'shows',
			12 : 'shows',
			13 : 'shows',
			14 : 'shows',
			15 : 'clks',
			16 : 'clks',
			17 : 'clks',
			18 : 'clks',
			19 : 'clks',
			20 : 'pv',
			21 : 'pv',
			22 : 'pv',
			30 : 'shows',
			31 : 'shows',
			32 : 'shows',
			33 : 'shows',
			34 : 'shows',
			35 : 'shows',
			36 : 'shows',
			37 : 'shows',
			38 : 'shows',
			39 : 'shows',
			40 : 'shows',
			41 : 'shows',
			42 : 'shows',
			43 : 'shows',
			44 : 'shows',
			45 : 'clks',
			46 : 'clks',
			47 : 'clks',
			48 : 'shows',
			49 : 'pv',
			50 : 'pv',
            303: 'clks'
		},
		
		//三高词每页显示
		TOPWORDS_PER_PAGE: 10,
		
		//已选物料每页显示
		SELECTEDWORDS_PER_PAGE: 10,
		
		//展开收起的开关
		HIDESWITCH : true,
		
		//主动提示区筛选查询的开关，关闭时，查询和筛选不更新优化建议
		FILTERSWITCH : true,
		
		LANG: {
			"toppaysumwords": "高消费词",
			"topclkswords": "高点击词",
			"topshowswords": "高展现词"
		},
		
		// 优化详情每页默认10条数据，创意默认5条，不在这里配置
		DETAIL_PAGESIZE : 10,
		
		// 优化详情计划、单元、关键词最长字符限制
		DETAIL_MAX_LENGTH : 26,
		
		// 下载路径，window.open直接打开，路径是nirvana/tool...
		DOWNLOAD_PATH :'tool/ao/download_detail.do'
	},

	
	
	/**
	 * 效果突降相关配置
	 */
	DECREASE : {
		OPTTYPE : {
			ALL : [30, 31, 32, 48, 39, 41, 38, 43, 42, 37, 44, 35, 36, 40, 33, 34, 45, 46, 47],
			LEVEL_1 : [30, 31, 32, 42, 35, 45, 46, 47], // 高等级
			LEVEL_2 : [48, 39, 41, 38, 43, 37, 44, 36, 40, 33], // 中等级
			LEVEL_3 : [34], // [34, 49, 50]
			
			SHOWS : [30, 31, 32, 48, 39, 41, 38, 43, 42, 37, 44, 35, 36, 40, 33, 34],
			CLKS : [45, 46, 47],
			PV : [] // [49, 50]
		},
		DEFAULT_TYPE : 'clks',
		DEFAULT_VALUE : 15,
		
		TYPE : {
			shows : '展现量',
			clks : '点击量',
			pv : '浏览量'
		}
	},
	
	POPUP : {
		INTERVAL : 1000
	},
	
	EOS : {
		STEP1 : {
			THRESHOLD_WARNING : '您选择的日消费规模较低，可能无法达到满意的推广效果。',
			EXAMPLE : {
				SELECTION : [
					"教育培训",
					"安全安保",
					"办公文教",
					"成人用品",
					"电脑硬件",
					"电子电工",
					"法律服务",
					"房地产",
					"服装鞋帽",
					"广播通信",
					"广告及包装",
					"化工及材料",
					"化妆品",
					"机械设备",
					"家用电器",
					"建筑及装修",
					"交通运输",
					"节能环保",
					"金融服务",
					"礼品饰品",
					"铃声短信",
					"旅游及票务",
					"农林牧渔",
					"软件游戏",
					"商务服务",
					"生活服务",
					"生活用品",
					"食品餐饮",
					"图书音像",
					"网络服务",
					"休闲娱乐",
					"医疗健康",
					"孕婴用品",
					"招商加盟"
				],
				DATA : [
					["全国一级建造师考试试题","考研英语辅导班","国家本科第二专业","交谊舞培训","北京法语辅导","吉他培训","化妆学校","广州德福培训学校"],
					["智能防盗门","合肥消防器材","气体泄漏报警","网络远程监控","防火门","卷帘门","护栏网","新型防盗窗"],
					["小学数学教学仪器","数学教学器材","文具批发市场","黑板厂家","电子白板厂家","圆珠笔","财务装订机","白板"],
					["成人性用品网店","成人自慰用品","赤峰成人用品店","订购成人用品","黄石成人用品","充气娃娃","延时喷剂","日本充气娃娃"],
					["超频三散热器","炫酷电脑","投影幕价格","北京笔记本出售","投影机","平板电脑","笔记本","CPU风扇"],
					["moog控制器","茶叶水分仪","串联谐振耐压装置","流量表","光纤测试仪","发电机","LED显示屏","太阳能路灯"],
					["台州律师事务所","交通事故专业律师","劳动仲裁与诉讼","离婚诉讼","房产纠纷辩护律师","离婚律师","新婚姻法离婚","桂林律师"],
					["深圳房地产交易中心","北京南珠苑小区房价","北京二手房买卖","成都写字楼网","房产经纪人","北京房地产代理公司","北京写字楼","昌平县城二手房"],
					["上海西装订制","高跟凉鞋","针织服装厂","折扣店服装","牛仔裤","童装","羽绒服","广州外贸服装批发"],
					["400电话呼叫中心","16路视频光端机报价","大功率发射机","测速编码器","手机号码","重载编码器","网桥","手机信号放大器多少钱"],
					["电脑公文包","沈阳烫金机","联单印刷","宣传品印刷","分屏广告机","拉杆式箱包","企业形象宣传片制作","印刷信封报价"],
					["沙棘籽油","氨水","煤炭","pvc原料","纳米二氧化硅价格","磷酸三钠厂家","0#柴油","pp塑料"],
					["男士香水","洗面奶","粉底液","哪种bb霜好","隔离霜价格","遮瑕bb霜","唇彩","保湿隔离霜"],
					["塑料分色机","燃油蒸汽锅炉价格","数控车床","侧铣头","激光切割机","数控车床","购买扒渣机","维修采煤机"],
					["手机定位网","滚筒式洗衣机","送风型浴霸","浦东洗衣机维修","平板电视","榨汁机报价","老人手机","液晶电视"],
					["吊顶","玻璃幕墙","上海 办公装修","验房监理","钢结构","环氧地坪","办公室装修","厂房施工"],
					["深圳花店 免费配送","杭州到驻马店物流","番禺到湖南物流","电动自行车配件","摩托车","15万左右买什么车好","个人租车","考斯特客车报价"],
					["旧木材回收","空气净化机价格","钻石戒指回收","石碣废品回收公司","除甲醛","废铁回收","北京移动厕所租赁","城市垃圾处理"],
					["武汉贷款网","泰康养老投资","住院补贴保险","泥石流保险","借款合同公证","信用卡办理","个人贷款","车险哪家好"],
					["给太太送生日礼物","庄河花店","网友礼物","婚礼送什么花","玻璃工艺品厂","礼品卡","琉璃装饰品","北京水晶工艺品厂"],
					["商场短信","手机免费彩铃下载","下载手机玲声","泉州短信平台","公司彩铃制作","八口短信猫","3d手机图片","集团彩铃制作"],
					["宁波到长乐机票","台州市酒店","北京机票","天津一日游","香港旅游","云南旅游","昆明家庭旅馆","安徽旅游景点"],
					["求购侧柏苗","除草剂","杀虫剂","蝎子养殖","核桃苗","蜈蚣养殖","老芒麦种子","鸡咳嗽吃什么药"],
					["手机安卓游戏","免费游戏","免费3D网页游戏","过磅软件","2011最新网页游戏排行榜","经典股票软件","2010游戏推荐","10游戏下载"],
					["书画艺术品拍卖","北京侦探社","录音","求职保健师 北京","留学中介","注册公司","商标注册","会计记账"],
					["婚纱摄影","怎么消灭蟑螂","北京 丰台 搬家公司","厦门家政服务中心","邢台婚纱摄影","灵丘交友","婚庆公司","月嫂"],
					["地毯","毛巾","浴巾","网上购眼镜","美瞳","沙发","洗碗机","隐形眼镜"],
					["鸡肉精粉","芝麻粉","芝麻油","婴幼儿食品","红薯粉","烧烤调味料","剑南春酒","白砂糖批发"],
					["儿童英语教材","农业期刊投稿","连环画","作家征稿","小说自费出版","杂志订阅网","2011年杂志订阅目录","文学征稿"],
					["so域名注册查询","域名邮箱","清远网站设计","深圳网站建设 沙井","企业信箱","如何做网站推广","域名注册","网站建设"],
					["台球桌配件","高尔夫球场","古筝","跑步机","深圳领养宠物","宠物美容","蓝球架","笛子价格"],
					["鼻翼肥大该怎么办","青岛激光去痣","月经期会怀孕吗","河南丰胸","早泄","痔疮的最佳治疗方法","人流最佳时间","红眼病会传染吗"],
					["女士羊奶粉","纸尿片试用装","新生儿奶粉","纸尿垫","婴儿奶粉排行榜","什么奶粉好","纸尿裤好","什么奶瓶最好"],
					["中小投资","武汉服饰加盟","大学怎么做生意","韩国小吃加盟","干洗店加盟","美容院加盟","内衣加盟","8元女装加盟店"]
				]
			}
		},
		STEP2 : {
			RUNNING : {
				TITLE : '系统正在根据你的需求生成具体推广方案...',
				CONTENT : '系统正在根据你的需求生成账户结构、预算，关键词出价等具体方案内容，请耐心等待。<br />您可以离开此页面，任务完成后，页面上方会产生一条消息提示'
			},
			FAIL : {
				TITLE : '系统生成推广方案失败',
				CONTENT : '因为系统故障，系统生成推广方案失败。'
			},
			FAIL101 : {
				TITLE : '系统生成推广方案失败',
				CONTENT : '根据您推广需求，没有生成出合适的推广方案，请修改您的需求后再尝试生成。'
			}
		},
		STEP3 : {
			RUNNING : {
				TITLE : '系统正在启用新生成的推广方案...',
				CONTENT : '系统正在启用新生成的推广方案，成功启用后你的推广账户将真正添加这些内容，请耐心等待。<br />您可以离开此页面，任务完成后，页面上方会产生一条消息提示'
			},
			FAIL : {
				TITLE : '系统启用推广方案失败',
				CONTENT : '因为系统故障，系统启用推广方案失败。'
			},
			PARTSUCCESS : {
				TITLE : '推广方案部分启用成功',
				CONTENT : '因为系统故障，推广方案只有部分启用成功。你可以去推广管理页查看具体的内容。<br />未成功启用的部分，你可稍后在手动补充完整。'
			},
			SUCCESS : {
				TITLE : '系统已全部完成生成账户结构',
				CONTENT : '系统已完成生成, 您可以去账户查看具体内容'
			}
		}
	}
};

/**
 * 错误提示用语，由于需要使用nirvana.config.NUMBER，所以单独写出来
 */
nirvana.config.ERROR = {
	ACCOUNT : {
		BUDGET: {
			'306': '对不起，您的操作次数已经达到了每日调整预算次数的上限。为了保证系统的稳定，请改日再试。',
			'307': '为了保证您的推广效果，每日预算不能低于' + nirvana.config.NUMBER.ACCOUNT.MIN_BUDGET + '元',
			'308': '每日预算设置过大将失去意义，建议调整或者取消设置',
			'316': '相对充裕的周预算能增加分配时的灵活性，使您的预算分配更适应百度流量的变化，把握每个潜在商机！建议您设置时不低于' + nirvana.config.NUMBER.ACCOUNT.MIN_WEEKBUDGET + '元。',
			'317': '每周预算设置过大将失去意义，建议调整或者取消设置',
			'350': '预算必须为数字，请重新设定',
			'351': '预算只能保留两位小数'
		}
	},
	
	PLAN : {
		BUDGET: {
			'401': '对不起，推广计划%s预算调整失败，操作次数已经达到每日调整预算次数的上限，请改日再试。',
			'402': '为了保证您的推广效果，每日预算不能低于' + nirvana.config.NUMBER.PLAN.MIN_BUDGET + '元',
			'403': '每日预算设置过大将失去意义，建议调整或者取消设置',
			'404': '每日预算不得超过所属搜索推广账户预算，请重新设定'
		},
		NAME:{
			'498' : '计划名称不能为空',
			'499' : '计划名称过长',
			'400' : '该计划名称已存在',
			'405' : '对不起，新建推广计划失败，该账户下的推广计划数量已经达到上限。'
		}
	},
	
	UNIT: {
		NAME:{
			'502':'单元名称不能为空',
			'501':'单元名过长',
			'500':'该单元名称已存在',
			'513':'对不起，新建推广单元失败，您推广计划下的推广单元数量已经达到上限。',
			TOO_LONG: '推广单元名称最长为' + Math.ceil(nirvana.config.NUMBER.UNIT.MAX_LENGTH/2) + '个汉字或' + nirvana.config.NUMBER.UNIT.MAX_LENGTH + '个英文'
		},
		PRICE:{
			'505':'单元出价不能为空',
			'507':'单元出价不能低于' + nirvana.config.NUMBER.BID_MIN + '元',
			'508':'单元出价不能高于' + nirvana.config.NUMBER.BID_MAX + '元',
			'509' :'抱歉，设置出价不得高于预算，请重新设定',
			'506':'单元出价不是数字',
			'599':'单元出价小数点后不超过两位'
		}
	},

	
	KEYWORD : {
		ADD : {
			'4' : '权限异常',
			'633' : '匹配模式不正确',
			'634' : '', // aka验证失败，这里需要显示后端返回的message，所以配置''
			'635' : '计划和单元层级的否定/精确否定关键词中存在该关键词',
			'636' : '关键词在本单元已经存在',
			'637' : '每个关键词的长度最长为' + Math.ceil(nirvana.config.NUMBER.KEYWORD.MAX_LENGTH / 2) + '个汉字或' + nirvana.config.NUMBER.KEYWORD.MAX_LENGTH + '个英文',
			'638' : '关键词不能为空',
			'639' : '未选择关键词',				//KR远征
			'641' : '本单元的关键词数达到上限',
			'642' : '单次添加关键词数量不得超出100个',
			'643' : '所指定的计划不存在',
			'511' : '所指定的单元不存在',
			'644' : '计划和单元层级的否定/精确否定关键词中存在该关键词',
			'671' : '关键词访问URL长度不能超过1024个字符',
			'exceed' : '关键词输入数量不得超过' + nirvana.config.NUMBER.KEYWORD.MAX_INPUT + '个',
			'upperlimit' : '抱歉，目前推广单元下的关键词数量已经达到了上限，无法创建新的关键词'
		},
		PRICE:{
			'605':'关键词出价不能为空',
			'607':'关键词出价不能低于' + nirvana.config.NUMBER.BID_MIN + '元',
			'608':'关键词出价不能高于' + nirvana.config.NUMBER.BID_MAX + '元',
			'606':'关键词出价不是数字',
			'699':'关键词出价小数点后不超过两位',
			'408':'由于改价过频，请稍作等待',
			'batchLow': '以下{0}个关键词修改后出价必须高于' + nirvana.config.NUMBER.BID_MIN + '元，\r\n请重新设定：',
			'batchHigh': '以下{0}个关键词修改后出价必须低于' + nirvana.config.NUMBER.BID_MAX + '元，\r\n请重新设定：',
            'bidLower': '为获得更多客户访问，建议您不要降低当前出价',
            'matchLower': '为获得更多客户访问，建议您不要缩小当前匹配方式'
		},
		URL:{
			'671' : 'URL字符数超过限制',
			'622' : 'URL主域名和注册网站不一致',
			'623' : 'URL不能为空',
			'624' : 'URL字符数超过限制',
			'625' : '该网站已存在',
			'626' : '网站不唯一',
			'627' : 'URL无效',
			'628' : 'URL主域名和其他用于相冲突',
			'629' : 'URL无效'
		}
	},
	
	
	AUTOUNIT : {
		GROUP:{
			'641':'超过单元最大关键词数',
			'636':'部分关键词在本单元已经存在',
			'634':'部分关键词属于敏感词,将返回提词栏',
			'635':'部分关键词跟计划或单元的否定词冲突',
			'405':'账户计划数量超过限制',
			'500':'账户单元名称已经存在',
			'501':'账户单元名称太长',
			'502':'账户单元名称为空或者长度为0',
			'503':'账户创建单元失败，内部异常',
			'504':'用户无权操作单元',
			'511':'单元不存在',
			'513':'单元数量超过限制',
			'5'	:'参数异常'
		},

		SAVE_WARNING_GROUP:{
			'641':{title:'关键词溢出',detail:'对应的计划单元已达到可容纳上限'},
			'405':{title:'计划数超过上限',detail:'对应计划单元由于账户计划数量超过限制,而无法创建'},
			'500':{title:'账户单元名称已经存在',detail:'您要新建的账户单元名称已经存在'},
			'501':{title:'单元名太长',detail:'对应的单元名称太长'},
			'502':{title:'单元名为空',detail:'对应的账户单元名称为空或者长度为0'},
			'503':{title:'系统异常',detail:''},
			'504':{title:'权限不足',detail:'用户无权操作对应的计划单元'},
			'511':{title:'单元不存在',detail:'对应的计划单元不存在'},
			'513':{title:'单元数量超过限制',detail:'对应的单元因为单元数量超过限制而无法创建'},
			'5'	:{title:'参数异常',detail:'存在异常的参数'}
		},

		SAVE_WARNING_WORD:{
			'636':{title:'关键词重复',detail:'对应的计划单元已有重复的关键词'},
			'634':{title:'关键词不合法',detail:'对应的计划单元部分关键词属于敏感词,将返回提词栏'},
			'635':{title:'否定词冲突',detail:'部分关键词跟本单元或计划否定词冲突'}
		},


		PLAN:{
			'405':'对不起，新建推广计划失败，该账户下的推广计划数量已经达到上限',
			'451':'计划名太短或为空',
			'452': '推广计划名称最长为' + Math.ceil(nirvana.config.NUMBER.UNIT.MAX_LENGTH/2) + '个汉字或' + nirvana.config.NUMBER.UNIT.MAX_LENGTH + '个英文',
			TOO_LONG: '推广计划名称最长为' + Math.ceil(nirvana.config.NUMBER.UNIT.MAX_LENGTH/2) + '个汉字或' + nirvana.config.NUMBER.UNIT.MAX_LENGTH + '个英文'
		},
		UNIT:{
			'501':'推广单元名称最长为' + Math.ceil(nirvana.config.NUMBER.UNIT.MAX_LENGTH/2) + '个汉字或' + nirvana.config.NUMBER.UNIT.MAX_LENGTH + '个英文',
			'502':'单元名太短或为空',
			'500':'单元已存在',
			'513':'对不起，新建推广单元失败，该账户下的推广单元数量已经达到上限',
			TOO_LONG: '推广单元名称最长为' + Math.ceil(nirvana.config.NUMBER.UNIT.MAX_LENGTH/2) + '个汉字或' + nirvana.config.NUMBER.UNIT.MAX_LENGTH + '个英文',
			DUPLICATE:'计划单元名与其他分组重复'
		}
	},
	
	IDEA : {
		ADD : {
			'703' : '标题长度不能超过' + IDEA_TITLE_MAX_LENGTH + '个字符（' + Math.ceil(IDEA_TITLE_MAX_LENGTH / 2) + '个汉字）',
			'704' : '描述1长度不能超过' + IDEA_DESC1_MAX_LENGTH + '个字符（' + Math.ceil(IDEA_DESC1_MAX_LENGTH / 2) + '个汉字）',
			'705' : '描述2长度不能超过' + IDEA_DESC2_MAX_LENGTH + '个字符（' + Math.ceil(IDEA_DESC2_MAX_LENGTH / 2) + '个汉字）',
			'706' : '访问URL长度不能超过' + IDEA_HREF_MAX_LENGTH + '个字符',
			'707' : '显示URL长度不能超过' + IDEA_URL_MAX_LENGTH + '个字符',
			'708' : '创意内容不能为空',
			'709' : '创意内容有误，请修改！',
			'710' : '系统参数错误，请联系相关人员，谢谢！',
			'711' : '推广单元最多拥有' + IDEA_THRESHOLD + '个创意',
			'712' : '对不起，当前提交的创意数量已经达到了上限，无法创建新的创意'
		}
	},

	APPENDIDEA : {
		'sublink': {
			'20000': '此计划不支持蹊径子链',
			'20711': '推广单元最多拥有1个创意',
			'20712': '当前提交已超过推广单元允许上限，无法创建新的蹊径子链',
			'500': '系统错误',
			'600': '参数错误'
		},
		'app': {
			//'500' : '数据读取异常，请稍候重试！',
			'20711': '推广单元下最多拥有1个附加创意',
			'20712': '此前提交已超过推广单元允许上限，无法创建新的App推广',
			'600': '参数错误',
			'1': '未成功绑定passport.',
			'20716': '操作不成功，请稍后再试，若仍出现类似情况请联系客服！',
			'500': '系统异常，请稍后再试！'
		}
	},
	
	IPEXCLUSION:{
		'461':'您输入的IP格式不合法，请修改',
		'460':'您输入的IP数量超过限制，请删减部分IP',
		'811':'您输入的IP数量超过限制，请删减部分IP'
	},
	
	NEGATIVE:{
		'450':'您输入的部分关键词长度超过限制，请修改',
		'451':'您输入的关键词数量超过限制，请删减',
		'452':'您的否定关键词和精确否定关键词有重复',
		'801':'您输入的关键词数量超过限制，请删减',
		'802':'您输入的否定关键词包含特殊字符',
		'803':'您输入的部分关键词长度超过限制，请修改',
		'804':'您的否定关键词和精确否定关键词有重复',
		'805':'否定关键词为空',
		'806':'否定关键词与广泛，短语匹配关键词冲突'
	},
	
	AVATAR:{
	//	'802':'获取监控文件夹数目失败'
		'2811':'监控文件夹数量已达上限',
		'2820':'概况页监控文件夹已达上限',
		'2821':'该文件夹名称已存在，请重新输入',
		'2841':'抱歉，关键词数量已达上限',
	//	'850':'抱歉，您目前监控文件夹已经达到了上限（%d），无法新建。',
	//	'851':'抱歉，您可显示到首页的监控文件夹已达上限（%d）。',
		'2852':'文件夹名称不能为空',
		'2853':'抱歉，文件夹名称长度超过限制',
		'2854':'无法进行新建监控关键词的操作。\r\n此监控文件夹下关键词的数量已经达到了上限（已超了%d个），建议取消监控部分关键词。'
	},
	
	QUERY_REPORT : {
		// ERROR_QUERY_RPT_INVALID_FORM
		'1800' : '对不起，后台表单验证失败，请稍后再试',
		// ERROR_QUERY_RPT_NOT_ALLDATA_TIP
		'1801' : '对不起，数据量超过5000条，报告无法在网页正常显示，<strong class="warn">请点击表格右上方的链接直接下载报告</strong>',
		// ERROR_QUERY_RPT_SYS_DORIS_OUTRANGE
		'1802' : '对不起，您选择的数据内容过多，请调整时间范围后再尝试生成',
		// ERROR_QUERY_RPT_SYS_UNSUPPORTED_REPORT
		'1803' : '不支持的报告，请选择其他类型报告',
		// ERROR_QUERY_RPT_SYS_ERROR_TIP
		'1804' : '对不起，系统忙碌，请稍后再试',
		// ERROR_QUERY_RPT_NEWWORD_TOOMANY
		'1805' : 'ERROR_QUERY_RPT_NEWWORD_TOOMANY',
		// ERROR_QUERY_RPT_MESSAGE_NOAUTH
		'1806' : '您无权查看此类型报告或展现相关数据'
	},
	
	REPORT : {
		'1902' : '对不起，您当前创建的报告数量已达到上限，无法创建新的报告。',
		EAMIL : {
			'NOT_MAIL' : '请您输入正确的邮箱地址',
			'TOO_LONG' : '您最多可输入120个字符',
			'OVER' : '您最多可添加5个邮件地址'
		},
		NAME : {
			// 这两个errCode是前端自己定义的
			'1932' : '报告名称不能为空',
			'1933' : '报告名称最多' + nirvana.config.NUMBER.REPORT.MAX_LENGTH + '个字符'
		}
	},
	
	TRANS : {
		'SITE_URL_NOT_EMPTY' : '推广网站不能为空！',
		'SITE_URL_NOT_DOMAIN' : '推广网站域名格式不正确！',
		'TRANS_NAME_NOT_EMPTY' : '转化名称不能为空。',
		'TRANS_NAME_MAXED' : '转化名称不能超过50个字符',
		'DES_PAGE_NOT_EMPTY' : '目标网址不能为空。',
		'DES_PAGE_NOT_DOMAIN' : '目标网址URl格式不正确。',
		
		'1530' : '未知参数错误',  //参数错误，默认的参数错误类型
		'1531' : '内容不能为空，请重新输入', //参数错误，不能为空的参数出现空置
		'1532' : '用户ID错误', //参数错误，用户id错误
		'1533' : '网站错误', //参数错误，网站错误
		'1534' : '转化步骤URL格式错误，请重新输入', //参数错误， 转化步骤url格式错误
		'1535' : '转化步骤ID错误', //参数错误， 转化步骤ID格式错误
		'1536' : '参数错误，请重新输入', //参数错误，转化id
		'1537' : '您暂无操作权限', //权限错误，没有操作权限
		'1538' : '系统忙碌', //系统异常
		'1539' : '系统忙碌', //数据库错误
		'1540' : '系统忙碌',  //需要的数据还没有生成
		'1541' : '网站数量已达到上限，无法继续添加', //因为达到上限而无法添加
		'1542' : '转化数量已达到上限，无法继续添加', //转化超过上限
		'1543' : '转化步骤数量已达到上限，无法继续添加', //转化步骤超过上限
		'1544' : '重复',  //重复
		'1545' : '转化名称已经存在', //转化名称重复
		'1546' : '转化步骤名称已经存在', //转化步骤名称重复
		'1547' : '转化步骤URL已经存在', //转化步骤url重复
		'1548' : '网站url不在用户开放域名内',
		
		DOMAIN_IS_NULL: '请输入网站URL',
		DOMAIN_IS_LONG: '您输入的URL超长，最多可输入200个字符',
		DOMAIN_FORMAT_WRONG: '监控站点的域名格式错误',
		DOMAIN_NOT_FIT: '输入的网站主域必须与账户的推广网站主域一致',
		DOMAIN_IS_EXIST: '您已经添加了该网站',
		
		NAME_IS_NULL: '请输入转化名称',
		NAME_LENGTH_LONG: '您输入的字符超长',
		
		TARGET_IS_NULL: '请输入目标网址',
		TARGET_IS_LONG: '您输入的目标网址超长，最多可输入255个字符',
		TARGET_NOT_HTTP: '请您在URL前补充 <strong>http://</strong> 或 <strong>https://</strong>',
		TARGET_FORMAT_WRONG: '目标网址格式错误',
		
		// 全面检查错误信息
		CHECK_ALL: {
			'1549': {
				TITLE: 'URL禁止增加参数',
				DESC: '系统已将推广跟踪设置为否，建议您联系网站管理员，解除对URL后增加参数的限制，然后将推广跟踪设置为是。'
			},
			'1550': {
				TITLE: 'URL无法访问',
				DESC: '联系网站管理员维护网页，保证网站页面——尤其是推广页面可访问。'
			},
			'1551': {
				TITLE: 'URL有重定向',
				DESC: 'URL重定向，会使得推广跟踪——包括百度推广的自动跟踪和定制推广URL跟踪——信息丢失，从而无法识别推广点击流量，请把重定向之后的URL设置为百度推广访问URL，或基于重定向之后的URL定制推广URL。'
			},
			'1552': {
				TITLE: 'URL没有安装访问分析代码',
				DESC: '推广访问URL必须正确安装代码，才能够获得推广效果数据，以下网页中未检查到访问分析代码。'
			},
			'1553': {
				TITLE: 'URL没有安装页头分析代码',
				DESC: '页头分析代码可以帮助您了解推广页面被完整打开的情况，建议您在推广访问页面安装页头分析代码。'
			},
			'1554': {
				TITLE: 'URL代码安装顺序有误',
				DESC: '页头分析代码应该安装在访问分析代码的上方，如果顺序有误，会导致页头访问次数和访问次数错误，请联系网站管理员更正。'
			},
			'1555': {
				TITLE: 'URL访问分析代码安装重复',
				DESC: '重复的访问分析代码将可能导致分析数据有误，请联系网站管理员修改。'
			},
			'1556': {
				TITLE: 'URL页头分析代码安装重复',
				DESC: '重复的页头分析代码将可能导致分析数据有误，请联系网站管理员修改。'
			},
			'1557': {
				TITLE: 'URL安装的访问分析代码不正确',
				DESC: '您的以下URL安装的访问分析代码不是对应域名的分析代码，请检查是否合适。'
			},
			'1558': {
				TITLE: 'URL安装的页头分析代码不正确',
				DESC: '您的以下URL安装的页头分析代码不是对应域名的分析代码，请检查是否合适。'
			},
			'1559': {
				TITLE: 'URL无法分析',
				DESC: '目前暂不支持对Ftp,https等开头URL的分析，请手工检查。'
			},
			'1560': {
				TITLE: 'URL安装正确',
				DESC: '以下URL未发现安装问题。'
			},
			'1561': {
				TITLE: 'URL安装正确',
				DESC: '以下URL未发现安装问题。'
			}
		}
	},
	
	AO:{
		THRESHOLD: {
			'6005': '设定阈值不能为空',
			'6006': '设定阈值不是数字',
			'6007': '设定阈值需要大于' + nirvana.config.NUMBER.AO.THRESHOLD.MIN + '并且小于等于' + nirvana.config.NUMBER.AO.THRESHOLD.MAX,
			'6008': '设定阈值需要大于' + nirvana.config.NUMBER.AO.THRESHOLD.MIN + '并且小于等于' + nirvana.config.NUMBER.AO.THRESHOLD.MAX,
			'6099': '设定阈值需为整数'
		}
	},
    // del by Huiyao 2013.1.7 将该配置移到aopackage/config.js
//	AODECR:{
//		THRESHOLD:{
//			'6003': '效果突降阈值参数错误',
//			'6004': '效果突降类型参数错误',
//			//'350': '阈值必须为数字，请重新设定',
//            //'351': '阈值必须是整数，请重新设定',
//            //'307': '阈值不能小于等于0，请重新设定',
//            //'308': '阈值不能超过100，请重新设定',
//            '6005': '设定阈值不能为空',
//            '6006': '设定阈值不是数字',
//            '6007': '设定阈值需要大于' + nirvana.config.NUMBER.AODECR.THRESHOLD.MIN + '并且小于等于' + nirvana.config.NUMBER.AODECR.THRESHOLD.MAX,
//            '6008': '设定阈值需要大于' + nirvana.config.NUMBER.AODECR.THRESHOLD.MIN + '并且小于等于' + nirvana.config.NUMBER.AODECR.THRESHOLD.MAX,
//            '6099': '设定阈值需为整数'
//		}
//	},
	
	FEEDBACK:{
		"readerror": '由于系统繁忙，无法为您提供问卷参与调查，非常抱歉!',
		"writeerror": '由于系统繁忙，您填写的问卷结果暂时无法提交，非常抱歉!'
	},
	
	EOS:{
		'450':'您输入的部分关键词长度超过限制，请修改',
		'6010' : 'AKA验证失败',
		'6011' : '',  //需要验证码
		'6012' : '',  //验证码错误
		'6013' : '非常抱歉，由于你输入的内容超过长度限制（31个汉字），系统无法提供优质的结果；请尝试精简或更换输入内容',
		'6014' : '',  //超过任务次数上限
		'6015' : '无法进入下一步，方案中没有任何推广内容',
		'6016' : '无法进入下一步，请选择最重要的投放业务',
		'6017' : '无法提交，请选择预期消费规模',
		'6018' : '', //提交任务失败
		'6019' : '' //生成方案为空异常
	}
};

/**
 * 默认初始值
 */
nirvana.config.DEFAULT = {
	SELECT_PLAN: {
		value: 0,
		text: nirvana.config.LANG.FILETER_PLAN
	},
	SELECT_UNIT: {
		value: 0,
		text: nirvana.config.LANG.FILETER_UNIT
	}
};

/**
 * 各种导航配置项
 */
//凤巢首页
var FENGCHAO_HOST = 'http://fengchao.baidu.com/';

//主导航链接URL
var NAVMAIN_URL = {
	//LOGO
	LOGO : 'http://www.baidu.com/shifen/content.php',
	
	//首页
	HOME : FENGCHAO_HOST + 'indexAction.do?userid=' + nirvana.env.USER_ID,
	
	//账户信息
	ACCOUNT : 'http://www2.baidu.com/user/user_edit.php?fromFC=1&uid=' + nirvana.env.USER_ID,
	
	//财务
	FINANCE : 'http://caiwu.baidu.com/fp-mgr/account/info?uid=' + nirvana.env.USER_ID,
	
	//推广概况
	OVERVIEW :'#/overview/index',

	
	//推广管理
	MANAGE : '#/manage/plan',
	
	
	//凤巢实验室
	FCLAB: '#/fclab/index'
};

//官方空间
var BLOG_URL = 'http://pro.baidu.com/blog/index.html';

//官方链接最大显示条数
var MAX_SPACE_NEWS = 99;

//旧版搜索推广管理页面
var FENGCHAO_VENUS_URL = FENGCHAO_HOST + 'plan/planListAction.do?userid=' + nirvana.env.USER_ID;

// 链接基础地址 Shifen Base URL
var CLASSICS_BASE_URL = 'http://www2.baidu.com/';

// 专题介绍URL
var HELPTOPIC_URL = 'http://yingxiao.baidu.com/support/topic/78/';

// 意见反馈URL
var HELPSUGGEST_URL = 'http://yingxiao.baidu.com/support/fc/?action=message';

// 推广顾问URL
var SERVICE_URL = CLASSICS_BASE_URL + 'user/user_adviser.php?uid=' + nirvana.env.USER_ID;

// 缴纳费用 Pay URL
var CLASSICS_PAY_URL = 'http://caiwu.baidu.com/fp-netpay/pay/index?uid=' + nirvana.env.USER_ID;

// 账户信息无效时的修改链接 User Edit URL
var CLASSICS_USEREDIT_URL = 'user/user_edit.php?fromFC=1&uid=';

// 支持中心URL
var HELP_URL = 'http://support.baidu.com/';

// 给我留言
var MESSAGE_URL = HELP_URL + '?action=message';

//Bridge按钮地址 js文件
var BRIDGE_SERVICE_URL = 'http://qiao.baidu.com/?module=uc&controller=index&action=bridgeLogo';

// 安全退出url
var LOGOUT_URL = 'http://www2.baidu.com/user/logout.php';

// Holmes首页
var HOLMES_HOMEPAGE_URL = 'http://tongji.baidu.com/hm-web/' + nirvana.env.USER_ID + '/home/welcome';

// 查看数据与设置url
var LOOK_DATA_SETTING = 'http://lxb.baidu.com/web/home?userid=' + nirvana.env.USER_ID;

// 状态信息
/**
 * STATE_LIST  statusCode and its text
 */
var STATE_LIST = {
    /***用于物料列表的状态***/
	ACCOUNT : {
		'1' : '开户金未到',
		'2' : '正常生效',
		'3' : '余额为零',
		'4' : '未通过审核',
		'6' : '审核中',
		'7' : '被禁用',
		'11' : '预算不足'
	},
	
	PLAN : {
		'-1' : '-', //已删除
		'0' : '有效',
		'1' : '处在暂停时段', // 处在暂停时段，页面显示：暂停推广
		'2' : '暂停推广',
		'3' : '推广计划预算不足',
		'11' : '账户预算不足'
	},
	
	UNIT : {
		'-1' : '-', //已删除
		'0' : '有效',
		'1' : '暂停推广',
		'11' : '推广计划暂停推广'
	},
	
	WORD : {
		'-1' : '-', //已删除
		'0' : '有效',
		'1' : '暂停推广',
		'2' : '不宜推广',
		'3' : '搜索无效',
		'4' : '待激活',
		'5' : '审核中',
		'6' : '搜索量过低',
		'7': '部分无效',
		/*, 暂时先注掉，这次重点词包升级又把这个状态列删了，暂时用不到
		// Added by Wu Huiyao(wuhuiyao@baidu.com),以下新增状态用于重点词优化包
		'7' : '推广单元暂停推广',
		'8' : '推广计划暂停推广',
		'9' : '推广计划处在暂停时段',
		'10' : '账户预算不足',
		'11' : '推广计划预算不足',
		'12' : '余额为零'*/
		'13' : '计算机搜索无效',
		'14' : '移动搜索无效'
	},
	
	IDEA : {
		'0' : '有效',
		'1' : '暂停推广',
		'2' : '不宜推广',
		'4' : '待激活',
		'5' : '审核中',
		'7' : '部分无效',
		'99' : '无效'
	},
	
	 /***用于物料列表筛选的选择框值***/
	ACCOUNT_A : [
	   {text:'开户金未到', value:'1'},
	   {text:'正常生效', value:'2'},
	   {text:'余额为零', value:'3'},
	   {text:'未通过审核', value:'4'},
	   {text:'审核中', value:'6'},
	   {text:'被禁用', value:'7'},
	   {text:'预算不足', value:'11'}
	],
	PLAN_A : [
       {text:'有效', value:'0'},
       {text:'处在暂停时段', value:'1'},
       {text:'暂停推广', value:'2'},
       {text:'推广计划预算不足', value:'3'},
       {text:'账户预算不足', value:'11'}
       
    ],
    UNIT_A : [
       {text:'有效', value:'0'},
       {text:'暂停推广', value:'1'},
       {text:'推广计划暂停推广', value:'11'}
            
    ],

    WORD_A : [
       {text:'有效', value:'0'},
       {text:'暂停推广', value:'1'},
       {text:'不宜推广', value:'2'},
       {text:'部分无效', value:'7'},
       {text:'审核中', value:'5'},
       {text:'搜索量过低', value:'6'},
       {text:'计算机搜索无效', value:'13'},
       {text:'移动搜索无效', value:'14'},
       {text:'搜索无效', value:'3'},
       {text:'待激活', value:'4'}
    ],
    
    IDEA_A : [
       {text:'有效', value:'0'},
       {text:'暂停推广', value:'1'},
       {text:'不宜推广', value:'2'},
       //{text:'搜索无效', value:'3'},
       {text:'待激活', value:'4'},
       {text:'审核中', value:'5'},
       {text:'部分无效', value:'7'}  
    ],
    APPEND_IDEA_A : [
       {text:'有效', value:'0'},
       {text:'暂停推广', value:'1'},
       {text:'不宜推广', value:'2'},
       {text:'审核中', value:'5'}  
    ],
    APP_IDEA_A : [
       {text:'有效', value:'0'},
       {text:'暂停推广', value:'1'},
       {text:'无效', value:'99'}
    ]
};

// 图片地址
var IMGSRC = {
	LOADING : '<img src="./asset/img/loading.gif">',
	LOADING_FOR_TEXT : '<img src="asset/img/loading_1.gif" />'
};

// Flash地址
var SWFSRC = {
	BUDGET_CHART : './asset/swf/budget_chart.swf?v=%s.swf'
}

// 填充内容需要的HTML
var FILL_HTML = {
	EXCEPTION : '<div class="exception nodata_vertical">数据读取异常，请刷新后重试。</div>',
    TIMEOUT : '<div class="exception nodata_vertical">数据读取超时，请刷新后重试。</div>',
	LOADING : '<div class="loading">' + IMGSRC.LOADING + '%s</div>',
	NO_DATA : '<div class="nodata nodata_vertical">对不起，当前没有数据。</div>',
	EXCEED : '<div class="nodata">数据量过大，无法呈现。请缩小范围选择推广计划或推广单元后重试。</div>',
	PLAN_NO_DATA : '<div class="nodata">当前层级为空，请添加推广计划</div>',
	UNIT_NO_DATA : '<div class="nodata">当前层级为空，请添加推广单元</div>',
	WORD_NO_DATA : '<div class="nodata">当前层级为空，请添加关键词</div>',
    IDEA_NO_DATA : {
        'idea':'<div class="nodata">当前层级为空，请添加创意</div>',
        'localIdea':'<div class="nodata">当前层级为空，请添加本地推广信息</div>',
        'appendIdea':'<div class="nodata">当前层级为空，请添加附加创意</div>'
    },
    SEARCH_NO_DATA :'<div class="nodata">无相关结果，请重新输入条件。</div>',
	FOLD_NO_DATA : '<div class="nodata">对不起，当前没有数据，请添加监控文件夹</div>',
	FOLDDETAIL_NO_DATA : '<div class="nodata">当前文件夹中没有数据，请添加监控关键词</div>',
	TRANS_NO_DATA : '<div class="nodata nodata_vertical">对不起，当前没有数据，请<a href="javascript://" class="addTransBtnInline">新增转化</a>。</div>',
	TRANS_DATA_NOTALL : '<div class="nodata nodata_vertical">您的报告已经超过5000行，请进入<a href="#" id="TransToReport">统计报告</a>进行查看。</div>',
	TRANS_DATA_OUTRANGE : '<div class="nodata nodata_vertical">对不起，你选择的数据内容太多，请调整查询范围后再尝试。</div>',
	EXCEED_LIST : '<div class="nodata nodata_vertical">已删除物料过多无法单独展现，将为您提供全部已删除物料的%s。</div>',
	NO_MATERIAL : '<div class="nodata nodata_vertical">暂无数据</div>'
};




// 匹配模式
nirvana.config.WMATCH = {
	// 下拉框的select配置
	DATASOURCE : [{
		text: '精确',
		value: '63'
	},{
		text: '短语',
		value: '31'
	},{
		text: '广泛',
		value: '15'
	}]
};

/**
 * 地域列表
 */
var REGION_LIST = {
		"China": {
			"name" : "中国地区",
			"list": {
				"North": {
					"name": "华北地区",
					"list": {
						"1": "北京",
						"3": "天津",
						"13": "河北",
						"26": "山西",
						"22": "内蒙古"
					}
				
				},
				"NorthEast": {
					"name": "东北地区",
					"list": {
						"21": "辽宁",
						"18": "吉林",
						"15": "黑龙江"
					}
				},
				"East": {
					"name": "华东地区",
					"list": {
						"2": "上海",
						"19": "江苏",
						"32": "浙江",
						"9": "安徽",
						"5": "福建",
						"20": "江西",
						"25": "山东"
					}
				},
				"Middle": {
					"name": "华中地区",
					"list": {
						"14": "河南",
						"16": "湖北",
						"17": "湖南"
					}
				},
				"South": {
					"name": "华南地区",
					"list": {
						"4": "广东",
						"8": "海南",
						"12": "广西"
					}
				},
				"SouthWest": {
					"name": "西南地区",
					"list": {
						"33": "重庆",
						"28": "四川",
						"10": "贵州",
						"31": "云南",
						"29": "西藏"
					}
				},
				"NorthWest": {
					"name": "西北地区",
					"list": {
						"27": "陕西",
						"11": "甘肃",
						"24": "青海",
						"23": "宁夏",
						"30": "新疆"
					}
				},
				"Other": {
					"name": "其他地区",
					"list": {
						"34": "香港",
						"36": "澳门",
						"35": "台湾"
					}
				}
			}
		},
		"Abroad": {
			"name": "国外",
			"list": {
				"7": "日本",
				"37": "其他国家"
			}
		}
	};
	
	



/***KR配置项****************************************************/
var KR_DEFAULT_INPUT_MESSAGE = '请输入关键词或URL以搜索相关词...';
var KR_EXPE_NORESULT = '暂无相关结果，若需获取更为丰富的推荐请使用';
var KR_LOADING_TIMEOUT = 1000;		//loading显示间隔
var KR_THRESHOLD = 300;				//关键词显示数量阀值

//行业潜力词动态效果参数 DE for “dynamic effect”-----------------
var INDU_DE_STEP = 120;				//变化步长 20px
var INDU_DE_INTERVAL = 30;			//变化频率 50ms

//回收站---------------------------------------------------------
var TRASH_TIP = "被移除的词将不出现在相关词的结果列表中";
var TRASH_NOTICE = "请注意，回收区域为您保留最近300条结果";
var NOTRASHWORD = "暂无被移除的关键词。<br/><br/>您可以将展现结果中很不相关的关键词移除到回收站。<br/>我们将用来改进为您的服务。";
var TRASH_TIP_TIME = 5000;
var TRASH_MAX_NUM = 300;

//移动建站url
var MOBILE_STATION_PATH = 'http://mobi.baidu.com/tg/mobcard_edit?from=fc&userid=';
//手机预览url
var MOBILE_PREVIEW_PATH = 'http://mobi.baidu.com/tg/test?from=fc&userid=';
// 商桥的了解详情
var MOBILE_BRIDGE_PATH = 'http://yingxiao.baidu.com/support/qiao/detail_10686.html?castk=LTE%3D';

//app账户绑定url
var USER_BIND_APP_PATH = 'http://u.baidu.com/ucweb/?module=Accountcenter&controller=Accountmgr&action=accountMgr&userid=';

/***************审核******************/
var FC_AUDIT = 'http://defensor.baidu.com/fcaudit/checkdo/index?';
var FC_AUDIT_LOCAL_IDEA = 'http://defensor.baidu.com/sap/lbscheckdo/?';
var FC_AUDIT_APPEND_IDEA = 'http://defensor.baidu.com/sap/checkdo/?type=5&';


var LXB = {
	STATUS: {
		0:'400号码申请失败',
		1:'正常使用中',
		4:'审核未通过',
		6:'申请审核中',
		8:'余额不足暂停',
		9:'400号码失效',
		1000:'未申请'
	},
	LINK:{
	//	BILL: "http://lxb.baidu.com/web/bill?userid=",
		HOME: "http://lxb.baidu.com/web/home?userid=",
		PRODUCT: "http://lxb.baidu.com/web/logon?tab=tabreq&userid=",
		REG: "http://lxb.baidu.com/web/regist?userid="
	},
	//报告里面  提示话术 
	PHONETRANSTIP : {
	//	'0' : '系统暂时也无法为您提供转化（电话）的分日、分周和分月数据，定制报告及邮件发送报告暂时也不会显示转化（电话）及电话追踪消费数据。',
		'1' : '系统暂时也无法为您提供转化（电话）的分日、分周和分月数据，定制报告及邮件发送报告暂时也不会显示转化（电话）数据。'
	}
}
