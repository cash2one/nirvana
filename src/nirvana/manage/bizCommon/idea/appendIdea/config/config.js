/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:   appendIdea/config.js
 * desc:    推广管理
 * author:  yanlingling&peilonghui
 * date:    $Date: 2012/09/20 $
 */


nirvana.appendIdea = nirvana.appendIdea || {};


nirvana.appendIdea.config=(function(){
    
    
    var common_input_obj = {
            width: 290
        },
        ui_prop_map = {
            appendPlanSelect: {
                emptyLang: '请选择推广计划',
                width: 156
            },
            appendUnitSelect: {
                emptyLang: '请选择推广单元',
                width: 156
            },

            //sublink的各个输入框的配置，相同的宽度。。没有额外的配置
            sublinkTitle1: common_input_obj,
            sublinkTitle2: common_input_obj,
            sublinkTitle3: common_input_obj,
            sublinkTitle4: common_input_obj,
            sublinkTitle5: common_input_obj,
            sublinkUrl1: common_input_obj,
            sublinkUrl2: common_input_obj,
            sublinkUrl3: common_input_obj,
            sublinkUrl4: common_input_obj,
            sublinkUrl5: common_input_obj
        };   

    return  {
        APPEND_IDEA_COPY_MAX:1000,
        //CONFIRM_MSG:"由于数量限制，本次仅可复制"+appendIdeaConfig.APPEND_IDEA_COPY_MAX+"个子链，请您确认是否继续。"+"<div class='xj_copy_tips'>小提示：由于单元最多复制100个限制，建议您分批操作；选择复制子链会直接覆盖当前已存在的子链</div>",
        CONFIRM_MSG: function(name){
            return "由于数量限制，本次仅可复制"+ appendIdeaConfig.APPEND_IDEA_COPY_MAX +"个" + name + "，请您确认是否继续。<div class='xj_copy_tips'>小提示：由于单元最多复制"+ appendIdeaConfig.APPEND_IDEA_COPY_MAX +"个限制，建议您分批操作；选择复制" + name + "会直接覆盖当前已存在的" + name + "</div>";
        },
        
        NOSUPPORT_ALL_DATE:'<div class="nodata">附加创意不支持“所有时间”范围的数据统计</div>',
        NEW_TIP_HIDE_DATE:'2012-12-05',//显示tab前的new的截止时间
        NEW_TIP_CHAR:"附加创意中可添加特殊的创意样式，如：蹊径。当这些附加创意被触发展现时，会区别于普通“创意”的展现样式显示更多信息，从而提升推广效果。",
        VIEW_MAP: {
            'sublink': 'appendIdeaEdit',
            'app': {
                'single': 'appIdeaEdit',
                'multi': 'appIdeaToMultiEdit'
            },
            'no-app': 'noAppIdeaEdit'
        },

        titles_max_length: 56, //所以子链加起来的所有最大长度
        title_per_length: 16, //每条子链的最大长度

        //默认的假创意
        defaultRelatedMaterials: {
            'sublink' : {
                Idea: {
                    title: '{蹊径子链}，让搜索推广与众不同',
                    desc1: '蹊径子链让您的{推广}拥有更丰富的表达形式和内容，吸引更多关注，帮您获得更好的推广效果',
                    desc2: '如果您对蹊径子链的使用存在疑问，可咨询您的推广顾问',
                    showurl: 'www.baidu.com'
                },
                Keywords:['-']
            },
            'app' : {
                Idea: {
                    title: '{App推广}, 让搜索{推广}与众不同！',
                    desc1: '{App推广}让您的应用在搜索页获得宝贵的展现和下载机会，拥有鲜明的表现形式和内容，吸引更多关注，帮您获得更好的{推广}效果',
                    desc2: '',
                    showurl: 'm.baidu.com'
                }
            }
            
        },

        //创意对象字段与推广区域预览中的对应id
        idea_ppa_map: {
            'showurl': 'ideaPPAUrl', 
            'desc1': 'ideaPPADesc1', 
            'desc2':  'ideaPPADesc2', 
            'title':  'ideaPPATitle'
        },

        //创意对象字段与推广链接区域预览中的对应id
        idea_ppl_map: {
            'showurl': 'ideaPPLUrl',  
            'desc1': 'ideaPPLDesc1', 
            //'desc2': 'ideaPPLDesc2', 
            'title': 'ideaPPLTitle'
        },

        app_idea_map : {
            'title': 'appIdeaTitle',
            'desc': 'appIdeaDesc',
            'showurl': 'appIdeaUrl'
        },



        //子链编辑区域的title输入文本框的id
        sublink_title_list: ['sublinkTitle1', 'sublinkTitle2', 'sublinkTitle3', 'sublinkTitle4', 'sublinkTitle5'],

        //子链编辑区域的url输入文本框的id
        sublink_url_list: ['sublinkUrl1', 'sublinkUrl2', 'sublinkUrl3', 'sublinkUrl4', 'sublinkUrl5'],

        //剩余字数显示

        left_words_list: ['sublinkLeftInfo1', 'sublinkLeftInfo2', 'sublinkLeftInfo3', 'sublinkLeftInfo4', 'sublinkLeftInfo5'],

        //默认显示的子链内容
        default_sublink_title: ['子链预览1', '子链预览2', '子链预览3', '子链预览4', '子链预览5'],


        preview_area_map: {
            'keywords': 'relatedKeywordsPreviewArea',
            'existedSublinks': 'existedSublinksPreviewArea'
        },

        sublink_map: ['sublink-title-preview1','sublink-title-preview2','sublink-title-preview3','sublink-title-preview4','sublink-title-preview5'],
        appendIdeaType:{
            'sublink':'蹊径子链',
            'app': 'App推广',
            'no-app': 'App推广'
        },
         copyTips:{
            'sublink':'已有子链',
            'app' :'已有app'
        },


        appendIdeaPath: {
          'sublink': 'manage/sublinkIdeaEdit',
          'app': {
            'single': 'manage/appIdeaEdit',
            'multi': 'manage/appToMultiEdit'
          },
          'no-app': 'manage/appIdeaEdit'
        },
        appendIdeaDialogWidth: {
            'sublink': 990,
            'app': 850,
            'no-app': 850
        },
        appendIdeaUIMap: {
            'app': {
                'single': {
                    appendPlanSelect: {
                        width: 145
                    },
                    appendUnitSelect: {
                        width: 145
                    },
                    App1: {
                        height:64
                    } 
                },
                'multi': {
                    appendIdeaCopySelect: {
                        warnStr: '注意：单元中的已有App会被覆盖',
                        leftData:'*leftData',
                        rightData:'*rightData',
                        firstLevelLeftClickHandler:'*planLevelClickOfCopy',
                        firstLevelLeftAddHandler:'*planLevelAddClick'
                    }
                }
            },
            'sublink': ui_prop_map,
            'no-app': {

            }
        }
    }
})();
var appendIdeaConfig = nirvana.appendIdea.config;