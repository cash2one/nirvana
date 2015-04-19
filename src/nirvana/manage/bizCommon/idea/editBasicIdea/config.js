var DEF_IDEA = [
	"创意使用通配符，获得好效果！",
	"通配符可以让您的创意飘红，吸引更多的潜在客户关注，帮助您获得更好的推广效果。",
	"点击插入通配符按钮即可。如果您对通配符的使用存在疑问，可咨询您的推广顾问。",
	"www.baidu.com",
	"www.baidu.com",
	"www.baidu.com",
    "www.baidu.com"
];

//无线创意预览位描述信息展示最大长度
var MOBILEIDEA_PREVIEW_MAX_LENGTH = 126;

//是否有显示URL权限，涅槃里权限开放，不存在此逻辑，先保留为true
var ideaAuth = true;

var EDIT_IDEA_UI_PROP = {
	// 计划下拉列表
	LevelPlan: {
		emptyLang: '请选择推广计划',
		width: '154'
	},
	
	// 单元下拉列表
	LevelUnit: {
		emptyLang: '请选择推广单元',
		width: '154'
	},
	
	// 创意标题输入框
	IdeaTitle: {
		type: 'TextInput',
		height: '22',
		width: '322'
	},
	
	// 创意描述一输入框
	IdeaDesc1: {
		height: '42',
		width: '306',
		wordWrap: 'on'
	},
	
	// 创意描述二输入框
	IdeaDesc2: {
		height: '42',
		width: '306',
		wordWrap: 'on'
	},
	
	// 访问URL输入框
	IdeaHref: {
		type: 'TextInput',
		height: '22',
		width: '322'
	},
	// 访问URL输入框
    MIdeaHref: {
        type: 'TextInput',
        height: '22',
        width: '310'
    },
	
	// 显示URL输入框
	IdeaUrl: {
		type: 'TextInput',
		height: '22',
		width: '322'
	},
	   
    // 显示URL输入框
    MIdeaUrl: {
        type: 'TextInput',
        height: '22',
        width: '310'
    }
};
