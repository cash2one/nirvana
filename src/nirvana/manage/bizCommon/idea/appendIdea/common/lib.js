
/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:   appendIdea/lib.js
 * desc:    推广管理
 * author:  yanlingling&peilonghui
 * date:    $Date: 2012/09/13 $
 */



manage.appendIdea = manage.appendIdea || {};


manage.appendIdea.lib = (function(appendIdea) {

    var config = appendIdea.config,
        pub;


    var _isArray = function(val) {
            return Object.prototype.toString.call(val) === '[object Array]';
        },
        _G = baidu.g,
        _Q = baidu.q;


    var app_tpl = ['<div class="app-edit-list clearfix">',
                        '<div class="app-radio left"><input name="AccountAppList" class="app-radio-button" type="radio" value="{0}" ui="id:AccountAppRadio{0};type:Radio;group:AccountAppList;"/></div>',
                        '<div class="left app-edit-detail">',
                            '<img src="{1}" class="icon64 left">',
                            '<ul class="app-edit-desc left">',
                                '<li><strong>{2}</strong></li>',
                                '<li class="info">{3}</li>',
                                '<li class="info">{4}</li>',
                                '<li ><a title="{6}" href="{6}" class="info" target="_blank">{5}</a></li>',
                            '</ul>',
                        '</div>',
                    '</div>'].join('');
    
    
    //子链标识与其内容下标映射关系
    var index2strMap = {
        '子链一' : /子链(内容|url)?0/i,
        '子链二' : /子链(内容|url)?1/i,
        '子链三' : /子链(内容|url)?2/i,
        '子链四' : /子链(内容|url)?3/i,
        '子链五' : /子链(内容|url)?4/i
    }
    

    return (pub = {
        
        
        /**
        将字符串str按照map中的映射关系替换
   
        @param {String} str 要替换的来源字符串
        @param {Object} map 替换时使用的映射关系
   
        @private 
        @method _replaceStr
        @return {String} 替换之后的字符串
       **/
        replaceStr: function(str, map) {
           if (typeof str !== 'string') {
               throw "字符串替换异常: str类型必须是字符串！";
               return false;
           }
           
           if (!map){
               map = index2strMap;
           }
           
           var result = [], reg;
   
           for (var key in map) {
               reg = map[key];
               reg.lastIndex = 0;
               while(reg.test(str)) {
                   str = str.replace(reg, key + (RegExp.$1));
               }
           }
           return str;
        },

        /**
         渲染层级选择导致的异常信息
         
         @param {String} error 在层级错误提示区域将显示的错误信息
         @param  {HTMLElement} error_div  用来显示错误内容的元素
         @param  {Array} disables 当出现异常时需要禁用的元素数组
         @public
         @method renderLevelError
        **/
        renderLevelError: function(error_div,error, disables) {
              error_div.innerHTML = error;
              baidu.removeClass(error_div, 'hide');
              
              var len = disables && disables.length;
              
              while(len--) {
                disables[len].disable(true);
              }
        },
        
        
        /**
         隐藏层级选择导致的异常信息
         @param  {HTMLElement} error_div  用来显示错误内容的元素
         @param  {Array} enables 当出现异常时所禁用的元素数组
         @public
         @method hideLevelError
        **/
        hideLevelError: function(error_div, enables){
            baidu.addClass(error_div, 'hide');
            
            var len = enables && enables.length;
            
            while(len--) {
                enables[len].disable(false);
            }
        },
        /**
         判断一个对象是否为空
         
         @param {Object} obj 要判断的对象
         
         @public
         @method isEmpty
         @return {Boolean} obj如果为空，返回true，否则返回false；
        **/
        isEmpty: function(obj){
            return typeof obj === 'undefined' || obj == null || obj === '';
        },
        
        /**
         判断单元是否已经包含附加创意
         
         @param {Object} unit 要用来判断的单元
         
         @public
         @method noCreative
         @return {Boolean} 是表示参数单元不包含任意类型的附加创意，否表示包含
        **/
        noCreative: function(unit){
            var creativeobj = unit.creativecnt;
            
            for (key in creativeobj) {
                if (creativeobj[key]){
                    return false;
                }
            }
            return true;
        },

        /**
         获取字符串长度（中文一个字符为2,英文为1）

         @param {String} str 要计算长度的字符串
            
         @public
         @method getLength
         @return {Number} 字符串的长度数字
        **/
        getLength: function(str){
            var len = 0,
                str_len = str.length;

            for (var i=0; i< str_len; i++) {
                if (str.charAt(i) > '~') {
                    len += 2;
                } else {
                    len++;
                }
            }

            return len;
        },
        /**
         按照某个规则将数组中的项过滤，返回规则为真的项数组

         @param {Array} source 要过滤的数组
         @iterator {Function} iterator 过滤器函数，它第一个参数

         @public
         @method filter
         @return {Array}  过滤完成的数组
        **/
        filter : function(source ,iterator) {
            var result = [],
                i=0,
                len = source.length,
                item;

            while(len--) {
                item = source[len];

                if (iterator(item)) {
                    result[i++] = item;
                }
            }

            return result;
        },


        /**
         在两个对象之间进行深拷贝的发方法

         @param {Object} source 源对象，属性输出对象
         @param {Object} destination 目标对象，属性输入对象
         @param {Boolean} overWrite 相同属性是否进行覆盖
        
         @public
         @method apply
         @return {}
        **/
        extend: function(destination, source, overwrite) {
            var me = this, member;

            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    if (prop in destination) {
                        member = source[prop];
                        if (typeof member === "object") {
                            me.extend(destination[prop], member, overwrite)
                        } else if (overwrite) {
                            destination[prop] = source[prop];
                        }
                    } else {
                        destination[prop] = source[prop];
                    }
                }
            }
            return destination;
        },

        /**
         获取单元中的相关物料信息(idea和keywords),并调用对象中的其他方法来渲染得到的相关物料

         @param {String} unitid 要获取的物料所在的单元的id
         @param {String} for_edit 是否是在编辑时获取这些无聊信息，可选值'edit'或'add'
         @param {Function} success 当获取相关无聊成功后调用的函数，这个参数会接受一个参数response也就是ajax请求返回的响应对象
         @param {Function} hide 当获取物料信息失败后要调用的函数

         @public
         @method getRelatedMaterial 
        **/
        getRelatedMaterial: function(obj) {
            if (!obj.appendType) {
                throw "Exception：没有指定附加创意类型！"
                return false;
            }

            var me = this, data,
                appendType = obj.appendType;
            if (pub.isEmpty(obj.unitid)) {
                data = config.defaultRelatedMaterials[appendType];

                if (obj.for_edit == 'edit') {
                    me.renderRelatedMaterial[appendType](data);
                } else {
                    me.renderRelatedIdea[appendType](data.Idea|| data.idea);
                }

            } else {
                fbs.appendIdea.getRelatedMaterials.clearCache();
                fbs.appendIdea.getRelatedMaterials({
                    unitid: obj.unitid,
                    onSuccess: function(response) {
                        data = response.data;
                        obj.success(response);
                        if (!data) {
                            data = config.defaultRelatedMaterials[appendType];
                        }
                        if (obj.for_edit == 'edit') {
                            me.renderRelatedMaterial[appendType](data);
                        } else {
                            me.renderRelatedIdea[appendType](data.Idea||data.idea);
                        }
                        
                    },
                    onFail: obj.fail
                })
            }
            
        },
        
        
        /**
         获取参数层级的物料信息，并作一些操作
         
         @param {String} level 要获取的物料层级，可以是plan, unit, idea
         @param {String} level_id 要获取的物料的id，用来指定物料
         @param {Function} success 在获取成功之后要执行的函数
         @param {Function} fail 如果获取物料信息失败，要执行的操作
         
         @public
         @method getMaterialName
        **/
        
        getMaterialName: function(level, level_id, success, fail){
            var condition = {};
            
            condition[level + 'id'] = [level_id];
            
            fbs[level].getNameList({
                condition: condition,
                onSuccess: success,
                onFail: fail
            })
        },

        /**
         渲染右侧已经存在的子链查看区域

         @param {Array} obj 已经存在的子链对象所组成的数组
         
         @public
         @method renderExistedSublinks 
        **/
        renderExistedSublinks: function(obj) {
            var me = this,
                q_result = baidu.q('existed-sublink'),
                q_len = q_result.length,
                c_len = obj.length,
                len,
                title,
                existed_preview= config.preview_area_map.existedSublinks;


            do {
                //len = q_len-1;
                if (q_len >=  c_len) {
                    q_result[q_len] && baidu.addClass(q_result[q_len], 'hide');
                } else {
                    title = obj[q_len].title;
                    me.previewSublink(title, q_len);
                    q_result[q_len].innerHTML = baidu.encodeHTML(title);
                }
            } while(q_len--);

            baidu.removeClass(existed_preview, 'hide');
        },

        /**
         渲染获取到的相关物料（关键词和创意）

         @param {Object} obj 参数对象其拥有两个属性：keywords和idea

         @public
         @method renderRelatedMaterial
        **/
        renderRelatedMaterial: {
                //refer: me,
                sublink: function(obj) {
                    //var me = this.refer;

                    if (!obj) {
                        return false;
                    }

                    //debugger;
                    //console.log(pub)
                    pub.renderRelatedKeywords(obj.Keywords);
                    pub.renderRelatedIdea['sublink'](obj.Idea|| obj.idea);
                },
                app: function(obj) {
                   //debugger;
                    pub.renderRelatedIdea['app'](obj.Idea||obj.idea);
                }
        },

        /**
         渲染当前单元中相关的关键词

         @param {Array} keywords 关键词数组，数组中的每个项都是关键词名称

         @public
         @method renderRelatedKeywords 
        **/
        renderRelatedKeywords: function(keywords) {
            ////console.log(keywords)
            if (!keywords || keywords.length == 0 ) {
                keywords = config.defaultRelatedMaterials.keywords;
            }
            var preview_area_map = config.preview_area_map,
                temp_len = 0;

            if (keywords &&  _isArray(keywords))  {;
                

                var q_result = baidu.q('unit-keyword'),
                    q_len = q_result.length,
                    c_len = keywords.length;

                do {
                    //len = q_len-1;
                    if (q_len >=  c_len) {
                        q_result[q_len] && baidu.addClass(q_result[q_len], 'hide');
                    } else {
                        //title = keywords[q_len];
                        //me.previewSublink(title, q_len);
                        
                        temp_len += keywords[q_len].length;

                        if (temp_len <= 51 ) {
                            q_result[q_len].innerHTML = baidu.encodeHTML(keywords[q_len]);
                        } else {
                            baidu.addClass(q_result[q_len], 'hide');
                        }
                    }
                } while(q_len--);
                
                baidu.removeClass(preview_area_map['keywords'], 'hide');

                //....渲染区域
            } else {
                baidu.addClass(preview_area_map['keywords'], 'hide')
            }
        },
        /**
         渲染相关创意的模块

         @submodule RelatedIdea 
        **/
        renderRelatedIdea: {

                /**
                 在子链编辑时用获取到的当前单元中的创意信息渲染右侧预览位
                 
                 @param {Object} idea 创意对象，至少包含title, desc1, desc2, showurl属性

                 @public 
                 @method sublink
                **/ 
                sublink: function(idea) {
                    if(!idea) {
                        idea = config.defaultRelatedMaterials['sublink'].Idea;
                    }
                    //var _encodeHTML = baidu.encodeHTML;
                    var idea_ppa_map = config['idea_ppa_map'],
                        idea_ppl_map = config['idea_ppl_map'],
                        temp_d, temp_v;

                    for (key in idea){
                        temp_d = idea_ppa_map[key]

                        temp_v = idea[key];

                        if (key != 'showurl') {
                            if (temp_v.indexOf('{关键词}') >= 0) {
                                temp_v = temp_v.replace(/\{关键词\}/g, '');
                            }
                            if (temp_v.indexOf('^') >= 0) {
                                temp_v = temp_v.replace(/\^/g, '');
                            }

                            temp_v = wildcardToShow(temp_v)
                        }
                        if (temp_d){
                            _G(temp_d).innerHTML = (temp_v);
                        }
                        temp_d = idea_ppl_map[key]
                        if (temp_d) {
                            _G(temp_d).innerHTML = (temp_v);
                        }
                    }
                },
                /**
                 在App创意编辑的时候在右侧预览区域渲染当前单元下的某个创意

                 @param {Object} idea 创意对象，至少包含title, desc1, desc2, showurl属性
                 
                 @public
                 @method app
                **/
                app: function(idea) {
                    if (!idea) {
                        idea = config.defaultRelatedMaterials['app'].Idea;
                    }

                    var app_map = config['app_idea_map'],temp_v;

                    var desc = idea['desc1'] + idea['desc2'];

                    desc = getCutString(desc, 120, '...');

                    idea['desc'] = desc;

                    /*var beyond_len = _getLength(desc1 + desc2) - 120;

                    idea['desc1'] = desc1.replace(/\^/g, '');

                    if (beyond_len > 0) {
                        idea['desc2'] = getCutString(desc2, _getLength(desc2)-beyond_len, '...');
                    }*/

                    for (var key in idea) {
                        if (app_map[key]) {
                            temp_v = idea[key];
                            if (key != 'showurl') {
                                if (temp_v.indexOf('{关键词}') >= 0) {
                                   temp_v = temp_v.replace(/\{关键词\}/g, '');
                                }

                                if (temp_v.indexOf('^') >= 0) {
                                    temp_v = temp_v.replace(/\^/g, '');
                                }
                                temp_v = wildcardToShow(temp_v)
                            }
                            _G(app_map[key]).innerHTML = (temp_v)
                        }
                    }
                }
        },
        
        /**
         获取编辑区域的带有RadioButton的app列表的html字符串

         @param {Array} appInfoList 创意信息列表

         @public
         @method getAppsListHtml
         @return {String} 将App信息列表中的信息样式化的html字符串
        **/
        getAppsListHtml: function(appInfoList){
            if (!appInfoList || !_isArray(appInfoList)) {
                throw "AppIdea: 没有获取到App的相关信息！"
            }

            var len = appInfoList.length,
                app_arr = [],
                i,ai;

            for (i=0; i<len; i++) {
                ai = appInfoList[i];
                app_arr[i] = ui.format(app_tpl, ai.sid, ai.iconurl, ai.name,['非App','Android','Android HD','iPhone','iPad'][ai.platform], ai.version, getCutString(ai.detailsurl || ai.downloadurl, 30, '...'), ai.detailsurl || ai.downloadurl);
            }

            return {
                    html: app_arr.join(''),
                    id: 'AccountAppRadio' + ai.sid
                }

        },

        /**
         用某个字符串来渲染某个位置的预览位

         @param {String} title 子链的title内容
         @param {Number} num 子链的预览位在配置数组中的下标

         @public
         @method previewSublink
        **/
        previewSublink: function(title, num) {
            var sublink_map = config.sublink_map;

            var q_result = baidu.q(sublink_map[num]),
                i=0,
                qi;

            var _encodeHTML = baidu.encodeHTML;
            for (; qi=q_result[i++]; ) {
                ////console.log(_encodeHTML(title))
                qi.innerHTML = '<i class="li-img"></i>' + _encodeHTML(title);

                baidu.removeClass(qi, 'hide');
            }

        },
        
        //获取附件创意的展现样式
       creatIdeaField:{
            sublink:function(item){//蹊径
                var htmlStr=[],
                    len = item.content.length,
                    className = "edit_td edit_td_thin" ;
                    
                if (item.shadowcreativeid && item.shadowcreativeid != "") {
                    className = className + ' xj_bg_rawidea';
                }
                htmlStr[htmlStr.length]= appendIdeaLib.createSubLinkContent(item.content,item.creativeid,className);
                if (item.shadowcreativeid && item.shadowcreativeid != "") {
                    className = "edit_td edit_td_thin" + '  display_none';
                    htmlStr[htmlStr.length]= appendIdeaLib.createSubLinkContent(item.shadowcontent,'shadow_'+item.shadowcreativeid,className);
                    htmlStr[htmlStr.length]= '<p style="text-align:right"><a href="javascript:void(0);" onclick="appendIdeaLib.appendIdeaSwap(this, ' + item.creativeid + ', ' + item.shadowcreativeid + ');return false" data-log="{target:\'viewIdeaSwap' + item.ideaid + '-btn\'}">查看修改后附加创意及状态</a></p>';
            
                }
              
               return htmlStr.join('');
            }
        },
    
        //获取附加创意列表，只有内容，没有url，用于展现在物料选择控件、历史操作查询、数据报告中
        getSublinkReviewText: function(content){
            var htmlStr = [];
            for (var i = 0, len = content.length; i < len; i++) {
                htmlStr[htmlStr.length] = "<span class='xj_sublink'>" + baidu.encodeHTML(content[i].title) + "</span>";
            }
            return htmlStr.join("");
        },
    
    
    
         /**
          *获取蹊径内容的html 
          * @param {Object} item
          * @param {Object} className
          */  
        createSubLinkContent:function(content,creativeid,className) {
            var htmlStr = [], 
                len = content.length;
            htmlStr[htmlStr.length] = '<div class="'+ className +'"  >';
            /*for (var i = 0; i < len; i++) {
                var title = escapeHTML(unescapeHTML(content[i].title));
                htmlStr[htmlStr.length] = "<span class='xj_sublink'>" + title + "</span>"
            };*/
            htmlStr[htmlStr.length] = appendIdeaLib.getSublinkReviewText(content);
            htmlStr[htmlStr.length] = '<a class="edit_btn edit_btn_thin edit_btn_right"  ideaid="' + creativeid + '"  edittype="ideaid"></a>';
            htmlStr[htmlStr.length] = '<a class="copy_btn" edittype="copyAppendIdea" ideaid="' + creativeid + '"></a>';
            htmlStr[htmlStr.length] = '</div>';
            return htmlStr.join('');
        
        },

        planLevelClickOfCopy:function(key){

        },
    
        /**
         *查看编辑前后创意状态 
         * @param {Object} e
         * @param {Object} oid
         * @param {Object} nid
         */
        appendIdeaSwap:function(e, oid, nid) {
            var il = baidu.dom.children(e.parentNode.parentNode);
            var oIdea = il[0];
            var nIdea = il[1];
            if (e.innerHTML == "查看修改后附加创意及状态") {
                e.innerHTML = "查看修改前附加创意及状态";
                baidu.dom.addClass(oIdea, 'display_none');
                baidu.hide("StateCy_" + oid);
                baidu.dom.removeClass(nIdea, 'display_none');
                baidu.show("StateCy_shadow" + nid);
                //baidu.hide('IdeaEdit_' + oid);
            } else {
                e.innerHTML = "查看修改后附加创意及状态";
                baidu.dom.removeClass(oIdea, 'display_none');
                baidu.show("StateCy_" + oid);
                baidu.dom.addClass(nIdea, 'display_none');
                baidu.hide("StateCy_shadow" + nid); 
                //baidu.show('IdeaEdit_' + oid);
            }
        },
    
        //用户绑定状态
        userBindStatus : ''


    });
})(nirvana.appendIdea);


var appendIdeaLib = manage.appendIdea.lib;






