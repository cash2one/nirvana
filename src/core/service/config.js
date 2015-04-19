/**
 * fbs.config
 * 配置项
 * @author zuming@baidu.com
 */
fbs = fbs || {};

fbs.config = {
    BUDGET_MIN: 50, // 预算最小值
    BUDGET_MAX: 300000, // 预算最大值
    BUDGET_WEEKMIN : 388, //周预算最小值
    BUDGET_WEEKMAX : 2100000, //周预算最大值
    BID_MIN: 0, // 出价最小值
    BID_MAX: 999.99, // 出价最大值
    MONEY_DEC_PLACES: 2, // 出价、预算等数字的小数位上限
    PAYSUM_MIN: 0, // 消费最小值
    NEGAWORD_LEN: 40, // 否定关键词字符长度 
    NEGAWORD_NUM_MAX: 100, // 否定关键词数量最大值
    NEGAWORD_NUM_MAX_7550: 200, // 否定关键词数量最大值
    IP_NUM_MAX: 20, // 计划IP排除数量
    ACC_IP_NUM_MAX: 20, // 计划IP排除数量
    ACC_IP_NUM_MAX_7550: 30, // 计划IP排除数量
    PLANNAME_MIN: 0, //计划名称最小值
    PLANNAME_MAX: 30, //计划名称最大值
    FOLDER_MIN: 0, //文件夹名称最小值
    FOLDER_MAX: 30, //文件夹名称最大值
    UNITNAME_MIN: 0, //单元名称最小值
    UNITNAME_MAX: 30, //单元名称最大值
    KEYWORD_MAXLENGTH: 40,
    KEYWORD_NUM_MAX: 100,
    
    INDUSTRYWORD_MAXLEN : 63, //快速新建业务名称输入内容最长支持63个字符，31个汉字
    //INDUSTRYWORD_NUM_MIN : 4,
    //INDUSTRYWORD_NUM_MAX : 100,
    
	
    THRESHOLD_MIN: 0, // 三高阈值最小值
    THRESHOLD_MAX: 100, // 三高阈值最大值
    
    IDEA_TITLE_LENGTH: 50,
    IDEA_TITLE_STORAGE_LENGTH: 286
};
// ！！！NOTICE: 不要再这里配置path了，没有这个必要 by Huiyao
fbs.config.path = {

    //物料查询请求默认PATH
    ADV_PATH: 'GET/material',
    
    //权限请求PATH
    AUTH_PATH: 'GET/auth',
    
    //账户树请求的path
    SIDENAV_PATH: {
        NODES_LIST: 'GET/accounttree/childrennodes',
        SINGLE_NODE: 'GET/accounttree/singlenode'
    },
    
    MOD_ACCOUNT_PATH: 'MOD/account',
    
    MOD_PLAN_PATH: 'MOD/plan',
    
    MOD_UNIT_PATH: 'MOD/unit',
    
    MOD_KEYWORD_PATH: 'MOD/keyword',
    
    MOD_KEYWORD_DIFFBID_PATH: 'MOD/keyword/diffbid',
    
    MOD_KEYWORD_DIFFWMATCH_PATH: 'MOD/keyword/diffwmatch',
    
    MOD_IDEA_PATH: 'MOD/idea',
	
	MOD_IDEA_CONTENT_PATH : 'MOD/ideainfo/content',
    
    ADD_PLAN_PATH: 'ADD/plan',
    
    ADD_UNIT_PATH: 'ADD/unit',
    
    ADD_KEYWORD_PATH: 'ADD/keyword',
	
	ADD_KEYWORD_MULTIUNIT: 'ADD/keyword/diffunit',
    
    ADD_IDEA_PATH: 'ADD/idea',
    
    DEL_PLAN_PATH: 'DEL/plan',
    
    DEL_UNIT_PATH: 'DEL/unit',
    
    DEL_KEYWORD_PATH: 'DEL/keyword',
    
    DEL_IDEA_PATH: 'DEL/idea',
    
    TRANS_KEYWORD_PATH: 'TRANS/keyword',
	
	GET_ACCOUNT_BUDGETANALYSIS : 'AO/account/bdana',

	GET_PLAN_BUDGETANALYSIS : 'AO/plan/bdana',
	
	GET_MONI_FOLDERS :'GET/avatar/monifolders',
	
	GET_MONI_WORDS: 'GET/avatar/moniwords',
	
	MOD_MONI_FOLDERS: 'MOD/avatar/modfolders',
	
	MOD_MONI_FOLDERCOUNT: 'GET/avatar/monifoldercount',
	
	MOD_MONI_WORDCOUNT: 'GET/avatar/moniwordcount',
	
	ADD_MONI_FOLDER: 'ADD/avatar/monifolder',
	
	DEL_MONI_FOLDERS: 'DEL/avatar/monifolders',
	
	DEL_MONI_WORDS: 'DEL/avatar/moniwords',
	
	ADD_MONI_WORDS: 'ADD/avatar/moniwords',
	
	GET_WINFOID2FOLDERS: 'GET/avatar/winfoid2folders',

	GET_PLAN_BUDGETANALYSIS : 'AO/plan/bdana',
	
	GET_QUERYREPORT_LIST : 'GET/mars/queryreportdata',
	
	GET_QUERYWORD_STAT : 'GET/mars/querywordstat',
	
	GET_INSTANT_REPORT : 'GET/mars/reportdata', // modified by Leo Wang at 2013/05/08
	
	GET_REPORT_INFOS : 'GET/mars/reportinfos', // modified by Leo Wang at 2013/05/08
	
	GET_REPORT_CYCLEFILE : 'GET/mars/reportfile/cycle', // modified by Leo Wang at 2013/05/08
	
	MOD_REPORT_NAME : 'MOD/mars/reportinfo/name', // modified by Leo Wang at 2013/05/08
	
	DEL_REPORT_INFO : 'DEL/mars/reportinfo',
	
	DEL_REPORT_FILE : 'DEL/mars/reportfile', // modified by Leo Wang at 2013/05/08
	
	ADD_REPORT_INFO : 'ADD/mars/reportinfo', // modified by Leo Wang at 2013/05/08
	
	GET_REPORT_DOWNLOADPATH : 'GET/mars/downloadpath', // modified by Leo Wang at 2013/05/08
	
	MOD_REPORT_CYCLEINFO : 'MOD/mars/reportinfo/cycle', // modified by Leo Wang at 2013/05/08
	
	GET_MYREPORT_PARAMS : 'GET/mars/reportinfo/detail',  // modified by Leo Wang at 2013/05/08
	
	GET_MYREPORT_SUM : 'GET/mars/reportfile/abstract', // modified by Leo Wang at 2013/05/08
	
	GET_MYREPORT_FLASHDATA : 'GET/mars/reportfile/flashdata',  // modified by Leo Wang at 2013/05/08
	
	GET_MYREPORT_DATA : 'GET/mars/reportfile/data', // modified by Leo Wang at 2013/05/08
	
	POST_REPORT_MAIL : 'POST/mars/sendmail', // modified by Leo Wang at 2013/05/08
	
	IS_REPORT_PROMPT : 'IS/mars/prompt', // modified by Leo Wang at 2013/05/08
	
	SET_REPORT_NO_PROMPT : 'SET/mars/noprompt', // modified by Leo Wang at 2013/05/08
	
	ADD_KR_RECYCLE : 'ADD/kr/recycle',
	
	GET_OFFLINEREASON : 'GET/material/offlinereason',
	
	GET_MATERIAL_NAME : 'GET/material/name',
	
	GET_MATERIAL_EXIST : 'GET/material/exist',
	
	IS_CONTRACT_SIGNED : 'IS/ContractSigned',
	
	SIGN_TRANS_CONTRACT : 'SIGN/Contract',
	
	GET_TRANS_DATA : 'GET/Trans/Data',
	
	GET_TRANS_LIST : 'GET/Trans/List',
	
	GET_SITE_LIST : 'GET/Site/List',
	
	SET_TRACKTYPE : 'SET/TrackType',
	
	GET_TRACKTYPE : 'GET/TrackType',
	
	GET_OPEN_DOMAIN : 'GET/Domain/ListForSelect',
	
	ADD_TRANS : 'ADD/Trans',
	
	CHECK_SINGLE_URL : 'CHECK/SingleUrl',
	
	GET_SITELIST_FORSELECT : 'GET/Site/ListForSelect',
	
	GET_TRANSLIST_FORSELECT : 'GET/Trans/ListForSelect',
	
	GET_TRANSLIST_FORCHECKALL : 'GET/Trans/ListForCheckallSelect',
	
	CHECK_FC_URL : 'CHECK/FcUrl',
	
	GET_FCURL_PROGRESS : 'GET/FcUrlCheckProgress',
	
	GET_FCURL_RESULT : 'GET/FcUrlCheckResult',
	
	CHECK_TRANS_URL : 'CHECK/TransUrl',
	
	GET_TRANSURL_RESULT : 'GET/Trans/CheckResult',
	
	MOD_TRANS : 'MOD/Trans',
	
	SET_TRANS_STATUS : 'SET/Trans/Status',
	
	DEL_TRANS : 'DEL/Trans',
	
	DEL_SITE : 'DEL/Site',
	
	SET_SITE_STATUS : 'SET/SiteStatus',
	
	GET_PLAYBACK_AUTH : 'GET/PlaybackAuth', //获取推广回放权限
	
	GET_EFFECTANA_AUTH : 'GET/effectana/auth', //获取效果分析权限
	
	GET_EFFECTANA : 'GET/effectana', //获取效果分析数据
	
	GET_NOUN: 'GET/noun',
	
	CHECK_BATCHDOWNLOAD : 'CHECK/batchdownload',
	
	ADD_BATCHDOWNLOAD : 'ADD/batchdownload',
	
	DEL_BATCHDOWNLOAD : 'DEL/batchdownload',
	
	GET_AO_HOLMES : 'GET/ao/holmesstatus',
	
	GET_AO_STAGES : 'GET/ao/stagesandtargets',
	
	GET_AO_REQUEST : 'GET/ao/request',
	
	GET_AO_TARGETSSUM : 'GET/ao/targetssum',
	
	GET_AO_TOPWORDS: 'GET/ao/topwords',
	
	GET_AO_CUSTOM: 'GET/ao/custom',
	
	GET_AO_AREAHIDE: 'GET/ao/areahide',
	
	MOD_AO_CUSTOM: 'MOD/ao/custom',
	
	MOD_AO_AREAHIDE: 'MOD/ao/areahide',
	
	GET_AO_UNSELECTEDFOLDERS: 'GET/ao/unselectedfolders',
	
	MOD_AO_UNSELECTEDFOLDERS: 'MOD/ao/unselectedfolders',
	
	GET_AO_DISCONNECTRATE: 'GET/ao/disconnectratedetail',
	
	GET_AO_LOADTIME: 'GET/ao/loadtimedetail',
	
	GET_AO_WORDACTIVE: 'GET/ao/wordactivedetail',
	
	GET_AO_WORDSEARCHINVALID: 'GET/ao/wordsearchinvaliddetail',	

	GET_AO_WORDBAD: 'GET/ao/wordrejecteddetail',
	
	GET_AO_WORDPAUSE: 'GET/ao/wordpausedetail',
	
	GET_AO_UNITPAUSE: 'GET/ao/unitpausedetail',
	
	GET_AO_PLANPAUSE: 'GET/ao/planpausedetail',
	
	GET_AO_WORDPVTOOLOW: 'GET/ao/wordpvtoolowdetail',
	
	GET_AO_WORDBOUNCE: 'GET/ao/wordbouncedetail',
	
	GET_AO_BIDSTIM: 'GET/ao/bidstimdetail',
	
	GET_AO_IDEABOUNCE: 'GET/ao/ideabouncedetail',
	
	GET_AO_WORDDEACTIVEWINFOIDS: 'GET/ao/wordactivedetailwinfoids',
	
	GET_AO_WORDPAUSEWINFOIDS: 'GET/ao/wordpausedetailwinfoids',
	
	GET_AO_UNITPAUSEUNITIDS: 'GET/ao/unitpausedetailunitids',
	
	GET_AO_PLANPAUSEPLANIDS: 'GET/ao/planpausedetailplanids',
	
	GET_AO_SHOWQDETAIL: 'GET/ao/showqdetail',     //质量度不足的关键词 by LeoWang(wangkemiao@baidu.com)
			
	GET_AO_LEFTSCREENDETAIL: 'GET/ao/leftscreendetail',     //左侧首屏展现概率详情 by LeoWang(wangkemiao@baidu.com)
		
	GET_AO_LEFTTOPDETAIL: 'GET/ao/lefttopdetail',     //左侧首位展现概率详情 by LeoWang(wangkemiao@baidu.com)
	
	GET_AO_IDEAACTIVEDETAIL: 'GET/ao/ideaactivedetail',     //创意待激活 by LeoWang(wangkemiao@baidu.com)
		
	GET_AO_IDEAREJECTEDDETAIL: 'GET/ao/idearejecteddetail',     //创意不宜推广 by LeoWang(wangkemiao@baidu.com)
			
	GET_AO_IDEAPAUSEDETAIL: 'GET/ao/ideapausedetail',     //创意暂停推广 by LeoWang(wangkemiao@baidu.com)
		
	GET_AO_IDEAACTIVEDETAILIDEAIDS: 'GET/ao/ideaactivedetailideaids',     //创意不宜推广 by LeoWang(wangkemiao@baidu.com)
			
	GET_AO_IDEAPAUSEDETAILIDEAIDS: 'GET/ao/ideapausedetailideaids',     //创意暂停推广 by LeoWang(wangkemiao@baidu.com)
		
	GET_AO_GETTHRESHOLDVALUE: 'GET/ao/thresholdvalue',     //获取左侧首屏/首位展现概率阈值 by LeoWang(wangkemiao@baidu.com)
				
	MOD_AO_MODTHRESHOLDVALUE: 'MOD/ao/thresholdvalue',     //修改左侧首屏/首位展现概率阈值 by LeoWang(wangkemiao@baidu.com)
	
	GET_AO_USERBUDGETDETAIL: 'GET/ao/userbudgetdetail',     //获取账户层级预算详情 by LeoWang(wangkemiao@baidu.com)
		
	GET_AO_PLANBUDGETDETAIL: 'GET/ao/planbudgetdetail',     //获取计划层级预算详情 by LeoWang(wangkemiao@baidu.com)

	GET_AVATAR_IDEAINFOS: 'GET/avatar/ideainfos',	//匹配分析，获取关键词所匹配的创意
	
	// 效果突降
	GET_AODECR_ISUSER: 'GET/aodecr/isdecruser',
	
	GET_AODECR_DATE: 'GET/aodecr/datemsg',
	
	GET_AODECR_CUSTOM: 'GET/aodecr/decrcustom',
	
	MOD_AODECR_FLASHDATA: 'MOD/aodecr/decrcustom',
    // del by Huiyao 2013.1.7
//	GET_AODECR_FLASHDATA: 'GET/aodecr/decrdata',
	
	GET_AODECR_HASADVICE: 'GET/aodecr/hasadvice',
	
	GET_AODECR_REQUEST: 'GET/aodecr/request',
	
	// 效果突降jinghua's part
	GET_AODECR_WORDSEARCHINVALIDDETAIL: 'GET/aodecr/wordsearchinvaliddetail',
	
	GET_AODECR_WORDREJECTEDDETAIL: 'GET/aodecr/wordrejecteddetail',
	
	GET_AODECR_WORDPVTOOLOWDETAIL: 'GET/aodecr/wordpvtoolowdetail',
	
	GET_AODECR_WORDPAUSEDETAIL: 'GET/aodecr/wordpausedetail',
	
	GET_AODECR_WORDDELETEDETAIL: 'GET/aodecr/worddeletedetail',
	
	GET_AODECR_UNITDELETEDETAIL: 'GET/aodecr/unitdeletedetail',
	
	GET_AODECR_PLANDELETEDETAIL: 'GET/aodecr/plandeletedetail',
	
	GET_AODECR_UNITPAUSEDETAIL: 'GET/aodecr/unitpausedetail',
	
	GET_AODECR_PLANPAUSEDETAIL: 'GET/aodecr/planpausedetail',
	
//	GET_AODECR_PLANCYCDETAIL: 'GET/aodecr/plancycdetail',// 这个接口暂时已经没用了 del by Huiyao 2013.4.15
	
	GET_AODECR_USERBUDGETDETAIL : 'GET/aodecr/userbudgetdetail',   //效果突降中获取账户层级预算详情 by LeoWang(wangkemiao@baidu.com)
	
	GET_AODECR_PLANBUDGETDETAIL : 'GET/aodecr/planbudgetdetail',   //效果突降中获取计划层级预算详情 by LeoWang(wangkemiao@baidu.com)
	
	GET_AODECR_UNITNOACTIVATEDIDEADETAIL : 'GET/aodecr/unitnotactivatedideadetail',  //效果突降中获取单元无生效创意详情by LeoWang(wangkemiao@baidu.com)

	GET_AODECR_DELTOPWORDS: 'GET/aodecr/deltopwords',
	
	GET_AODECR_MATERIAL : 'GET/aodecr/material',
	
	GET_AODECR_MATCHPATTERNDETAIL: 'GET/aodecr/matchpatterndetail',
	
	GET_AODECR_RETRIEVALDETAIL:'GET/aodecr/retrievaldetail',
	
	GET_AODECR_RANKINGDETAIL : 'GET/aodecr/rankingdetail',
	
	GET_AODECR_SHOWQDETAIL : 'GET/aodecr/showqdetail',  //质量度降为1星 by LeoWang(wangkemiao@baidu.com)
	
	GET_AODECR_SHOWQLOWDETAIL : 'GET/aodecr/showqlowdetail',  //质量度降为2星 by LeoWang(wangkemiao@baidu.com)
	
	GET_AODECR_PLANPAUSEPLANIDS : 'GET/aodecr/planpausedetailplanids',
	
	GET_AODECR_UNITPAUSEUNITIDS : 'GET/aodecr/unitpausedetailunitids',
	
	GET_AODECR_WORDPAUSEWINFOIDS : 'GET/aodecr/wordpausedetailwinfoids',
	
	/*快速新建部分PATH定义*/
	GET_EOS_USERTYPE : 'GET/eos/userregtype',
	MOD_EOS_CANCELSCHEME : 'MOD/eos/schemecancelled',
	GET_EOS_TASKSTATUS : 'GET/eos/taskstatus',
	GET_EOS_INDUSTRYINFO : 'GET/eos/industryinfo',
    GET_EOS_INITRECMWORD : 'GET/eos/initrecmword',
	GET_EOS_CONSUMETHRESHOLD : 'GET/eos/consumethreshold',
	ADD_EOS_SUBMITTASK : 'ADD/eos/submittask',
//	MOD_EOS_INITTASK : 'MOD/eos/inittask',
	MOD_EOS_TASKFAILED : 'MOD/eos/taskfailed',
	GET_EOS_TASKINFO : 'GET/eos/taskinfo',
	GET_EOS_EMPTYIDEAUNITS : 'GET/eos/emptyideaunits',
	GET_EOS_GETWORDLISTBYUNIT : 'GET/eos/unitpreview',
	MOD_EOS_BID : 'MOD/eos/word',
	MOD_EOS_WMATCH : 'MOD/eos/word',
	DEL_EOS_WORD : 'DEL/eos/word',
	ADD_EOS_RETRIVEWORD : 'ADD/eos/retriveword',
	GET_EOS_SCHEMEDETAIL : 'GET/eos/schemadetail',
	ADD_EOS_ADCREATE : 'ADD/eos/adcreate',
	MOD_EOS_TASKFINISHED : 'MOD/eos/taskfinished',
	GET_EOS_NEEDADDIDEAS : 'GET/eos/needaddideas',
	GET_EOS_LANDINGPAGE: 'GET/eos/landingpage',
	
	// 新户迭代一
	GET_EOS_MORERECMWORD : 'GET/eos/morerecmword',
	MOD_EOS_PLAN : 'MOD/eos/plan',
	MOD_EOS_UNIT : 'MOD/eos/unit',
	MOD_EOS_SCHEMEDETAIL : 'MOD/eos/schemadetail',
    GET_EOS_UNITSINGROUP : 'GET/eos/unitsingroup',
	
	/*老户管理部分PATH定义*/
	GET_IDEA_SELECTED_KEYWORD : 'GET/eos/ideaselectedkeyword',
	GET_NIKON_PACKAGESTATUS : 'GET/nikon/packagestatus',
    
    GET_NIKON_ABSTRACT : 'GET/nikon/abstract',
    
    GET_NIKON_DETAIL : 'GET/nikon/detail',
    
    GET_NIKON_DETAILBUDGET : 'GET/nikon/detailbudget',
    // 概况页收起展开状态
    GET_PROFILE_HIDEOPEN: 'GET/profile/hideopen',
    // 包摘要项应用
    MOD_NIKON_APPLYALL : 'MOD/nikon/applyall',
    GET_NIKON_APPLYRESULT : 'GET/nikon/applyresult',
    GET_NIKON_FLASHDATA : 'GET/nikon/flashdata',
    // 是否是效果检验状态
    GET_NIKON_BIZEFFCHECK : 'GET/nikon/bizeffcheck',
	// 新提词中添词接口
	// 批量添词迁入vega，直接修改了地址
	// 2013.03.22
	// by Leo Wang(wangkemiao@baidu.com)
	// ADD_NIKON_WORDS : 'ADD/nikon/addwords',
	ADD_NIKON_WORDS : 'ADD/keyword/batchwords',

	//通过扩大商机包修改了账户预算之后的提示接口
	MOD_NIKON_USERBUDGET : 'MOD/nikon/userbudgetnotify',
	
	// 获取重点词优化详情的接口
	GET_NIKON_COREWORDDETAIL : 'GET/nikon/coreworddetail',
	// 生成重点词的接口
	// ADD_NIKON_GENERATECOREWORD : 'ADD/nikon/generatecoreword',
	
	
	/*
	 *附加创意接口
	 */
	APPEND_IDEA_LIST:'GET/creativeIdeaInfo',
	DEL_APPEND_IDEA_PATH:'DEL/creativeidea',
	MOD_APPEND_IDEA_PATH:'MOD/creativeidea',
	COPY_APPEND_IDEA:'COPY/creativeidea'
	 
};

/**
 * 不进行cache的path地址
 * ！！！NOTICE: 不要再这里配置path了 by Huiyao
 * 请使用interface.js#fbs.requester方法
 */
fbs.config.cacheFree = [
	fbs.config.path.SIDENAV_PATH.NODES_LIST,
	fbs.config.path.SIDENAV_PATH.SINGLE_NODE,
	"GET/kr/recycle/num",
	"GET/kr/recycle/items",
	"GET/kr/word",
	"GET/kr/suggestion",
	"ADD/kr/addAutoUnit",
	"GET/kr/autounit",
	'GET/kr/valNewPlanUnit',
	'GET/material/count',
	fbs.config.path.GET_REPORT_INFOS,
	fbs.config.path.GET_OFFLINEREASON,
	fbs.config.path.GET_MATERIAL_NAME,
	fbs.config.path.GET_MATERIAL_EXIST,
	//转化跟踪
	fbs.config.path.SIGN_TRANS_CONTRACT,
	fbs.config.path.GET_TRANS_DATA,
	fbs.config.path.GET_TRANS_LIST,
	fbs.config.path.GET_SITE_LIST,
	fbs.config.path.SET_TRACKTYPE,
	fbs.config.path.GET_OPEN_DOMAIN,
	fbs.config.path.CHECK_SINGLE_URL,
	fbs.config.path.GET_SITELIST_FORSELECT,
	fbs.config.path.GET_TRANSLIST_FORSELECT,
	fbs.config.path.GET_TRANSLIST_FORCHECKALL,
	fbs.config.path.CHECK_FC_URL,
	fbs.config.path.GET_FCURL_PROGRESS,
	fbs.config.path.GET_FCURL_RESULT,
	fbs.config.path.CHECK_TRANS_URL,
	fbs.config.path.GET_TRANSURL_RESULT,
	fbs.config.path.SET_TRANS_STATUS,
	fbs.config.path.CHECK_BATCHDOWNLOAD,
	'GET/LXB/status',
	'GET/LXB/basicInfo',
	'GET/LXB/phoneTransData',
	
	//效果分析
	fbs.config.path.GET_EFFECTANA,
	//账户优化
	fbs.config.path.GET_AO_HOLMES,
	fbs.config.path.GET_AO_STAGES,
	fbs.config.path.GET_AO_REQUEST,
	fbs.config.path.GET_AO_TARGETSSUM,
	fbs.config.path.GET_AO_TOPWORDS,
	fbs.config.path.GET_AO_CUSTOM,
	fbs.config.path.GET_AO_AREAHIDE,
	fbs.config.path.GET_AO_UNSELECTEDFOLDERS,
	// 帐户优化详情
	fbs.config.path.GET_AO_DISCONNECTRATE,
	fbs.config.path.GET_AO_LOADTIME,
	fbs.config.path.GET_AO_WORDACTIVE,
	fbs.config.path.GET_AO_WORDSEARCHINVALID,
	fbs.config.path.GET_AO_WORDBAD,
	fbs.config.path.GET_AO_WORDPAUSE,
	fbs.config.path.GET_AO_UNITPAUSE,
	fbs.config.path.GET_AO_PLANPAUSE,
	fbs.config.path.GET_AO_WORDPVTOOLOW,
	fbs.config.path.GET_AO_WORDBOUNCE,
	fbs.config.path.GET_AO_IDEABOUNCE,
	fbs.config.path.GET_AO_BIDSTIM,
	fbs.config.path.GET_AO_WORDDEACTIVEWINFOIDS,
	fbs.config.path.GET_AO_WORDPAUSEWINFOIDS,
	fbs.config.path.GET_AO_UNITPAUSEUNITIDS,
	fbs.config.path.GET_AO_PLANPAUSEPLANIDS,
	fbs.config.path.GET_AO_SHOWQDETAIL,
	fbs.config.path.GET_AO_LEFTSCREENDETAIL,
	fbs.config.path.GET_AO_LEFTTOPDETAIL,
	fbs.config.path.GET_AO_IDEAACTIVEDETAIL,
	fbs.config.path.GET_AO_IDEAREJECTEDDETAIL,
	fbs.config.path.GET_AO_IDEAPAUSEDETAIL,
	fbs.config.path.GET_AO_IDEAACTIVEDETAILIDEAIDS,
	fbs.config.path.GET_AO_IDEAPAUSEDETAILIDEAIDS,
	fbs.config.path.GET_AO_GETTHRESHOLDVALUE,
//	fbs.config.path.MOD_AO_GETTHRESHOLDVALUE, // 不存在变量，del by Huiyao 2013.4.15
	fbs.config.path.GET_AO_USERBUDGETDETAIL,
	fbs.config.path.GET_AO_PLANBUDGETDETAIL,
	fbs.config.path.GET_AVATAR_IDEAINFOS,
	
	//效果突降
	fbs.config.path.GET_AODECR_ISUSER,
	fbs.config.path.GET_AODECR_HASADVICE,
	fbs.config.path.GET_AODECR_REQUEST,
	fbs.config.path.GET_AODECR_WORDSEARCHINVALIDDETAIL,
	fbs.config.path.GET_AODECR_WORDREJECTEDDETAIL,
	fbs.config.path.GET_AODECR_WORDPVTOOLOWDETAIL,
	fbs.config.path.GET_AODECR_WORDPAUSEDETAIL,
	fbs.config.path.GET_AODECR_WORDDELETEDETAIL,
	fbs.config.path.GET_AODECR_UNITDELETEDETAIL,
	fbs.config.path.GET_AODECR_PLANDELETEDETAIL,
	fbs.config.path.GET_AODECR_UNITPAUSEDETAIL,
	fbs.config.path.GET_AODECR_PLANPAUSEDETAIL,
//	fbs.config.path.GET_AODECR_PLANCYCDETAIL,// 这个接口暂时不用，del by Huiyao 2013.4.15
	fbs.config.path.GET_AODECR_MATCHPATTERNDETAIL,
	fbs.config.path.GET_AODECR_RETRIEVALDETAIL,
	fbs.config.path.GET_AODECR_RANKINGDETAIL,
	fbs.config.path.GET_AODECR_USERBUDGETDETAIL,   //效果突降中获取账户层级预算详情 by LeoWang(wangkemiao@baidu.com)
	fbs.config.path.GET_AODECR_PLANBUDGETDETAIL,   //效果突降中获取计划层级预算详情 by LeoWang(wangkemiao@baidu.com)
	fbs.config.path.GET_AODECR_UNITNOACTIVATEDIDEADETAIL,    //效果突降中获取单元无生效创意详情by LeoWang(wangkemiao@baidu.com)
	fbs.config.path.GET_AODECR_CUSTOM,	//获取突降阈值和类型
	fbs.config.path.GET_AODECR_MATERIAL,	//获取物料数据
	fbs.config.path.GET_AODECR_SHOWQDETAIL,   //质量度降为1星
	fbs.config.path.GET_AODECR_SHOWQLOWDETAIL,  //质量度降为2星
	fbs.config.path.GET_AODECR_DELTOPWORDS,
	fbs.config.path.GET_AODECR_PLANPAUSEPLANIDS,
//	fbs.config.path.GET_AODECR_UNITPAUSEPLANIDS,// 不存在变量，del by Huiyao 2013.4.15
//	fbs.config.path.GET_AODECR_WORDPAUSEPLANIDS,// 不存在变量，del by Huiyao 2013.4.15
	
	//快速新建
    fbs.config.path.GET_EOS_USERTYPE,
	fbs.config.path.MOD_EOS_CANCELSCHEME,
    fbs.config.path.GET_EOS_TASKSTATUS,
	fbs.config.path.GET_EOS_INDUSTRYINFO,
    fbs.config.path.GET_EOS_INITRECMWORD,
	fbs.config.path.GET_EOS_CONSUMETHRESHOLD,
	fbs.config.path.ADD_EOS_SUBMITTASK,
//	fbs.config.path.MOD_EOS_INITTASK,
	fbs.config.path.MOD_EOS_TASKFAILED,
	fbs.config.path.GET_EOS_TASKINFO,
	fbs.config.path.GET_EOS_EMPTYIDEAUNITS,
	fbs.config.path.GET_EOS_GETWORDLISTBYUNIT,
	fbs.config.path.MOD_EOS_BID,
	fbs.config.path.MOD_EOS_WMATCH,
	fbs.config.path.DEL_EOS_WORD,
	fbs.config.path.ADD_EOS_RETRIVEWORD,
	fbs.config.path.GET_EOS_SCHEMEDETAIL,
	fbs.config.path.ADD_EOS_ADCREATE,
	fbs.config.path.MOD_EOS_TASKFINISHED,
	fbs.config.path.GET_EOS_NEEDADDIDEAS,
	fbs.config.path.GET_EOS_LANDINGPAGE,
	'ADD/eos/recmideaswriteback',
	//新户升级获取推词
    'GET/eos/recmword',
    
	//新户迭代一期
	fbs.config.path.GET_EOS_MORERECMWORD,
	fbs.config.path.MOD_EOS_PLAN,
	fbs.config.path.MOD_EOS_UNIT,
	fbs.config.path.MOD_EOS_SCHEMEDETAIL,
    fbs.config.path.GET_EOS_UNITSINGROUP,
	
    //老户优化
    fbs.config.path.GET_NIKON_PACKAGESTATUS,
	fbs.config.path.GET_NIKON_ABSTRACT,
    fbs.config.path.GET_PROFILE_HIDEOPEN,
    fbs.config.path.MOD_NIKON_APPLYALL,
    fbs.config.path.GET_NIKON_APPLYRESULT,
    fbs.config.path.GET_NIKON_DETAIL,
    fbs.config.path.GET_NIKON_DETAILBUDGET,
    fbs.config.path.GET_NIKON_FLASHDATA,
    fbs.config.path.GET_NIKON_BIZEFFCHECK,
	fbs.config.ADD_NIKON_WORDS,
	fbs.config.MOD_NIKON_USERBUDGET,
	
	// 重点词优化优化详情数据接口路径
	fbs.config.path.GET_NIKON_COREWORDDETAIL,
//	// 获取优化包权限接口 // 暂时没用了，暂时删掉 by Huiyao 2013.4.9
//    'GET/nikon/pkgauth',
	// 生成重点词的接口
    // fbs.config.path.ADD_NIKON_GENERATECOREWORD,
    // 请求推荐重点词的接口
    'GET/nikon/recmcoreword',
	'GET/nikon/popupinfo',
	'GET/nikon/coreword',
	'ADD/nikon/coreword',
	'DEL/nikon/coreword',
    // 同行指标数据获取
    //'GET/nikon/peerdata',
	// 账户质量评分图表区数据获取接口
    'GET/accountscore/history',
    // 账户质量评分标签页显示各个指标项的摘要数据请求接口，概况页入口显示的信息也是通过该接口获取
    'GET/accountscore/abs',
    // 账户质量评分各项指标Bar的数据请求接口
    'GET/accountscore/peerdata',

    // 获取推荐创意
    'GET/eos/recmideas',

	//消息中心
	"GET/msg/msgsummary",
	"GET/msg/miptlist",

	//凤巢实验室相关接口	add by zhouyu
	"lab/GET/abtest/total",
	"lab/GET/abtest/list",	
	"lab/GET/abtest/labinfo",
	"lab/GET/abtest/allinfo",
	"lab/GET/abtest/mtlcnt",
	"lab/GET/abtest/labwordinfo",

	// 凤巢实验室CPA接口
	'lab/GET/cpa/planlist',
	'lab/ADD/cpa',
	'lab/GET/cpainfolist',
	'lab/MOD/cpaprice',
	'lab/MOD/cpa/ab',
	'lab/DEL/cpa',
	'lab/GET/report/cpa',
	'lab/GET/report/cpaab',
	'lab/GET/cpahistory',

	// 融合
	'GET/fuse/hideopen',
	'GET/fuse/mtlsug',
	'MOD/fuse/hideopen'
];

/**
 * 不需要loading的path地址
 * ！！！NOTICE: 不要再这里配置path了 by Huiyao
 * 请使用interface.js#fbs.requester方法
 */
fbs.config.noLoading = [
	// 'GET/material',
	'GET/LXB/status',
	'GET/LXB/basicInfo',
	'CHECK/SingleUrl',
	'GET/kr/word',
	'GET/mars/flashdata',
	'GET/history/dailylog',
	"GET/kr/suggestion",
	fbs.config.path.GET_FCURL_PROGRESS,
	fbs.config.path.GET_FCURL_RESULT,
	fbs.config.path.GET_TRANSURL_RESULT,
	fbs.config.path.GET_NOUN,			//气泡
	fbs.config.path.DEL_BATCHDOWNLOAD ,
	fbs.config.path.CHECK_BATCHDOWNLOAD,
	fbs.config.path.GET_AO_REQUEST,
	fbs.config.path.GET_AO_AREAHIDE,
	fbs.config.path.MOD_AO_AREAHIDE,
	fbs.config.path.GET_AO_TARGETSSUM,
	fbs.config.path.GET_AVATAR_IDEAINFOS,
	'GET/avatar/winfoid2folders',
	'GET/kr/expeStatus',
	
	//概况页
	'GET/eos/userregtype',
	'GET/profile/hideopen',
	'GET/markettrend/index',
	'GET/profile/coupon',
	//'GET/profile/accntscore', // Deleted by Wu Huiyao
	'GET/profile/vstat',
	//'GET/profile/accntdetail',// Deleted by Wu Huiyao
	'GET/avatar/monifolders',
	'GET/remind/rule',
	'GET/remind/message',
	'GET/mars/top',
	'GET/avatar/monifoldercount',
	
	
	
	//账户树
	fbs.config.path.SIDENAV_PATH.NODES_LIST,
    fbs.config.path.SIDENAV_PATH.SINGLE_NODE,
    
	//调研反馈系统
	'GET/survey/paper',
//	'ADD/survey/response',
	'GET/survey/isanswer',
	
	// 效果突降
	fbs.config.path.GET_AODECR_REQUEST,
	fbs.config.path.GET_AODECR_ISUSER,
	fbs.config.path.GET_AODECR_HASADVICE,
	fbs.config.path.GET_AODECR_CUSTOM,
	
    //快速新建
	fbs.config.path.GET_EOS_TASKSTATUS,
	fbs.config.path.GET_EOS_CONSUMETHRESHOLD,
	fbs.config.path.GET_EOS_LANDINGPAGE,
	'ADD/eos/recmideaswriteback',
	//新户升级获取推词
	'GET/eos/recmword',


	//新户迭代一期
    
    //老户优化
    fbs.config.path.GET_NIKON_PACKAGESTATUS,
    fbs.config.path.GET_NIKON_ABSTRACT,
    fbs.config.path.MOD_NIKON_APPLYALL,
    fbs.config.path.GET_NIKON_APPLYRESULT,
    fbs.config.path.GET_NIKON_FLASHDATA,
    //fbs.config.path.GET_NIKON_BIZEFFCHECK,
    fbs.config.MOD_NIKON_USERBUDGET,

    'GET/nikon/popupinfo',
    // 同行指标数据获取
    //'GET/nikon/peerdata',
    // 账户质量评分图表区数据获取接口
    'GET/accountscore/history',
    // 账户质量评分标签页显示各个指标项的摘要数据请求接口，概况页入口显示的信息也是通过该接口获取
    'GET/accountscore/abs',
    // 账户质量评分各项指标Bar的数据请求接口
    'GET/accountscore/peerdata',
	
	//消息中心
	"GET/msg/msgsummary",
	"GET/msg/miptlist",
	"MOD/msg/status",
	// 凤巢实验室
	"GET/labstat",
	// 融合
	'GET/fuse/hideopen',
	'GET/fuse/mtlsug',
	'MOD/fuse/hideopen'
];

/**
 * 默认所有path的timeout阀值都为31s，需要特殊照顾的path可以写到这里
 * {string} path ： {number} timeout ms
 * timeout等于0为一直等待，不设超时
 * by linzhfieng@baidu.com 2012-06-15
 */
fbs.config.timeoutMap = {
    
}
/**
 * 全局ajax默认超时阀值 
 */
fbs.config.ajaxTimeout = 31000;
