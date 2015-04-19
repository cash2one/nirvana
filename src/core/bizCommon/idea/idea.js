/*
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * author:  zhujialu
 * date:    2012-5-9
 */

/**
 * 创意部分通用的东西
 */
lib.idea = (function() {
    // 模版文件
    var tpl = er.template,
        tagExpr = /<(\w+?)[^>]*?>([^<]*?)<\/\1>/g,
        // 通配符
        matchExpr = /{(.*?)}/g;

    /**
     * 执行行内启用或暂停创意操作
     * @param {Array} ideaids
     * @param {String} state 创意的状态，可选值为 'enable' 'pause' 'active'
     * @param {Function}
     */
    function modifyIdeaState(ideaids, state, callback) {
        callback = typeof callback === 'function' ? callback : new Function();

        var interFace = fbs.idea[state === 'active' ? 'active' : 'modPausestat'],
            params = {
                ideaid: ideaids,
                onSuccess: function() {
                    fbs.material.clearCache('ideainfo');
                    callback(true);
                },
                onFail: function() {
                    callback();
                }
            };
        
        if (state === 'active') {
            params.activestat = '0';
        } else {
            params.pausestat = state === 'pause' ? 1 : 0;
        }

        interFace(params);
    }

    // 处理创意的模版显示
    function wildcard(d) {
        d = baidu.encodeHTML(baidu.decodeHTML(d));

        if (d.indexOf('{关键词}{') !== -1) {
            var tmp = [];
            d = d.split('{关键词}{');
            tmp.push(d[0]);
            for (var i = 1, len = d.length; i < len; i++) {
                if (d[i].indexOf('}') === -1) {
                    tmp.push('{关键词}{' + d[i]);
                } else {
                    d[i] = '<u>' + d[i].replace(/}/, '</u>');
                    tmp.push(d[i]);
                }
            }
            return tmp.join("");
        } else {
            return d;
        }
    }
    /**
     * 格式化文本
     * 对象是创意的标题和描述
     */
    function formatText(text) {
        text = wildcard(text);
        text = text.replace(/\^/g, '<span class="linebreak">^</span>');
        return insertWbr(text);
    }

    function getTip(hasWildcard, url) {
        if (!url) {
            // 为了debug，报一句吧
            alert('返回数据没有url字段');
        }
        var tip = '访问URL：&#13;&#10;' + escapeQuote(url) + '&#13;&#10; &#13;&#10;';

        if (hasWildcard) {
            tip += '您的创意包含了通配符，创意在展现时，将以触发创意展现的关键词替代通配符。';
        } else {
            tip += '建议您在创意中包含通配符，通配符可以帮助您在创意中插入关键词。';
        }

        tip += '插入创意的关键词在推广页面中显示，将提高客户对创意的关注度和点击率。';
        return tip;
    }

    // 创意状态
    var stateMap = STATE_LIST['IDEA'];

    function isNull(title) {
        title = '' + title;
        return title === 'null' || title === 'undefined' || title === '';
    }

    var AFTER_MODIFY = '查看修改后创意及状态',
        BEFORE_MODIFY = '查看修改前创意及状态';

    /**
     * 是否置灰某个按钮，置灰返回true
     */
    function disableBtn(selected, property, value) {
        if (!baidu.lang.isArray(selected)) {
            alert('请传入已选择的数据[Array]');
            return;
        }
        for (var i = 0, len = selected.length; i < len; i++) {
            if (selected[i][property] == value) {
                return false;
            }
        }
        return true;
    }

    
    return {
        /**
         * 获得预览的HTML
         * @param {String} field 合法值有：title desc1 desc2
         * @param {String} value 输入框里的值
         * @param {String} word 可选，关键词，这里会高亮处理
         */
        getPreview: function(value, word) {

            // 首先把 HTML 全部去掉，避免重复
            value = value.replace(tagExpr, function($0, $1, $2) {
                return $2;
            });

            // 首先处理关键词
            if (word) {
                value = value.replace(new RegExp(word, 'g'), '<em>' + word + '</em>');
            }

            // 处理通配符
            return value.replace(matchExpr, '<u>$1</u>');

        },

        // ===================  模版相关  ==========================
        /**
         * 获取表格中单个创意的模版
         * 调用者不用管样式
         * @return {String}
         */
        getIdeaCell: function(ideaData) {
            // 先确定有木有影子切换功能
            var className = '', shadowLink = '';

            // arguments[1] 表示是否显示影子创意的样式，不写形参是怕外部乱用
            var text = arguments[1];

            // 确定一下className
            if ((text && text === AFTER_MODIFY) || !isNull(ideaData.shadow_title)) {
                className = 'shadow';
            }
            // 如果有影子的话，确定一下影子链接的文字
            if (text || !isNull(ideaData.shadow_title)) {
                text = text || AFTER_MODIFY;
                shadowLink = lib.tpl.parseTpl({text: text}, tpl.get('ideaShadowLink'));
            }

            var title = formatText(ideaData.title),
                desc = formatText(ideaData.desc1 + ideaData.desc2),
                url = insertWbr(unescapeHTML(ideaData.showurl));

            // 判断是否有通配符
            var hasWildcard = (title + desc + url).indexOf('<u>') !== -1,
                obj = {
                    className: className,
                    shadowLink: shadowLink,
                    tip: getTip(hasWildcard, ideaData.url),
                    title: title,
                    desc: desc,
                    url: url
                };

            return lib.tpl.parseTpl(obj, tpl.get('ideaCell'));
        },
        /**
         * 获取表格中的创意状态
         * @param {isShadow} isShadow 是否是影子创意
         * @deprecated
         * 不要再用这个方法了，统一使用buildIdeaStat方法 by Huiyao 2013-5-16
         */
        getIdeaState: function(ideaData) {
            // 创意的状态
            var state = ideaData.ideastat,
                // 是否需要icon，不宜推广需要icon
                icon = state != 2 ? '' : tpl.get('ideaState2Icon'),
                // 指定按钮
                button = ideaData.pausestat == 1 ? 'enableIdea' : 'pauseIdea';

            var obj = {
                state: 'state_' + state,
                icon: icon,
                text: stateMap[state],
                button: button
            };

            // 读写分离，待升级之后不用这种方式了
            // by Leo Wang
            var result = nirvana.acc.accService.processPause(ideaData.pausestat, tpl.get('ideaState'));
            return lib.tpl.parseTpl(obj, result);
        },
        // ====================  影子创意交互相关 =======================
        /**
         * 点击 '查看修改后创意及状态' 和 '查看修改前创意及状态'
         * 因为需要两项：创意和状态，所以要传入这两项对应的容器元素，通常是表格的两个单元格
         * 现有Table组件，单元格的className为ui_table_tdcell
         * @param {Object} idea 影子创意
         * @param {Array} cells 单元格，数量必须是1个或2个,并且第一个元素是创意项，第二个是状态项
         */
        switchShadow: function(idea, cells) {
            var prefix, text;
            var isShowAfterShadow = false;
            var switchLink = $$('a[act="switchShadow"]', cells[0])[0];
            if (switchLink.innerHTML === AFTER_MODIFY) {
                // 获取修改前的创意,即影子创意
                prefix = 'shadow_';
                text = BEFORE_MODIFY;
                isShowAfterShadow = true;
            } else {
                // 获取修改后的创意，即正常的创意
                prefix = '';
                text = AFTER_MODIFY;
            }

            var obj = {
                title: idea[prefix + 'title'],
                desc1: idea[prefix + 'desc1'],
                desc2: idea[prefix + 'desc2'],
                showurl: idea[prefix + 'showurl'],
                url: idea[prefix + 'url'],
                ideastat: idea[prefix + 'ideastat']
            };

            cells[0].innerHTML = this.getIdeaCell(obj, text);
            if (cells[1]) {
//                cells[1].innerHTML = this.getIdeaState(obj);

                // 影子创意切换，按照平台端逻辑来实现，要求状态列渲染方法调用了平台端的buildIdeaState
                // mod by Huiyao 2013-5-16 FIX BUG: 修复现有影子创意切换问题
                var stateCell = cells[1];
                var normolIdea = $$("#StateCy_" + idea.ideaid, stateCell)[0];
                var shadowIdea = $$("#StateCy_shadow" + idea.shadow_ideaid, stateCell)[0];
                if (isShowAfterShadow) {
                    baidu.hide(normolIdea);
                    baidu.show(shadowIdea);
                }
                else {
                    baidu.hide(shadowIdea);
                    baidu.show(normolIdea);
                }
            }
        },

        // 新建或编辑创意时的字段验证规则

        //
        // ====================  接口相关  ==============================
        /**
         * 获得创意列表，获取方式是通过obj参数，这个参数必须有unitid,planid,ideaid中的一个
         * 严重注意：
         *   如果fields参数不传，第二个参数就是回调函数，如下
         *     getIdeaList(obj, function() {});
         *   如果要传fields参数，第三个参数就是回调函数，如下
         *     getIdeaList(obj, ['title','ideastat'], function() {})
         *
         * @param {Object} obj 查询条件，如{unitid: ['1', '2']}
         * @param {Array} fields 【可选】你需要的字段，通常是根据表格的列来决定
         * @param {Function} callback
         */
        getIdeaList: function(obj, fields, callback) {
            if (!baidu.lang.isArray(fields)) {
                callback = fields;
                fields = null;
            }

            // 如果没有指定需要的字段，使用默认值
            if (!fields) {
                fields = ['ideaid', 'shadow_ideaid', 'shadow_ideastat', 
                            'title', 'shadow_title', 'desc1',
                            'shadow_desc1', 'desc2', 'shadow_desc2',
                            'url', 'shadow_url', 'showurl',
                            'shadow_showurl', 'unitid', 'planid',
                            'pausestat', 'activestat', 'ideastat'];
            }
            
            fbs.material.getAttribute('ideainfo', fields, {
                condition: obj,
                onSuccess: function(json) {
                    callback(json);
                },
                onFail: function() {
                    callback();      
                }
            });
        },
        /**
         * 添加创意
         * @param {Object} params 
         * @param {Function} callback 只有点击保存的时候才调用
         */
        addIdea: function(params, callback) {
            params.type = 'add';
            params.onsubmit = callback;
            params.wordref = {
                show: true,
                source: 'normal'
            };
            nirvana.manage.createSubAction.idea(params);
        },
        /**
         * 删除创意
         */
        deleteIdea: function(ideaIds, callback) {
            callback = typeof callback === 'function' ? callback : new Function();

    		ui.Dialog.confirm({
				title: '删除创意',
				content: '您确定要删除所选择的' + ideaIds.length + '个创意吗？删除操作不可恢复！',
				onok: function() {
                    fbs.idea.del({
                        ideaid: ideaIds,
                        onSuccess: function(json) {
                            fbs.material.clearCache('ideainfo');
                            callback(json);
                        }
                    });
				},
				oncancel : function() {
                    callback();
				}
			});
                       
        },
        /**
         * 编辑创意
         */
        editIdea: function(params, callback) {
            params.type = params.type || 'edit';
            params.onsubmit = callback;
            nirvana.manage.createSubAction.idea(params); 
        },
        /**
         * 启用创意
         */
        enableIdea: function(ideaIds, callback) {
            callback = typeof callback === 'function' ? callback : new Function();

			ui.Dialog.confirm({
				title: '启用创意',
				content: '您确定启用所选择的创意吗？',
				onok: function() {
                    modifyIdeaState(ideaIds, 'enable', callback);
				},
				oncancel : function(){
                    callback();
				}
			});
        },
        /**
         * 暂停创意
         */
        pauseIdea: function(ideaIds, callback) {
            callback = typeof callback === 'function' ? callback : new Function();

            ui.Dialog.confirm({
				title: '暂停创意',
				content: '您确定暂停所选择的创意吗？',
				onok: function() {
                    modifyIdeaState(ideaIds, 'pause', callback);
				},
				oncancel: function(){
                    callback();
				}
			});       
        },
        /**
         * 激活创意
         */
        activeIdea: function(ideaIds, callback) {
            callback = typeof callback === 'function' ? callback : new Function();

			ui.Dialog.confirm({
				title: '激活创意',
				content: '您确定要激活所选择的创意吗？',
				onok: function() {
                    modifyIdeaState(ideaIds, 'active', callback);
                },
				oncancel: function() {
                    callback();
				}
			});
        },

        // ===================== 创意诊断的文本 ================
        /**
         * 获得诊断的话术
         * @param {Number} reason
         * @return {Array}
         */
        getDiagnosisText: function(reason) {
            if (typeof reason !== 'number') {
                reason = parseInt(reason, 10);
            }

            var ret = [],
                push = Array.prototype.push;

            switch(reason) {
                case 1:
                    ret.push('创意无飘红影响了您的投放效果，请适当增加通配符。');
                    break;
                case 2:
                    ret.push('过多使用通配符会影响您的投放效果，请适当减少通配符的使用次数。');
                    break;
                case 3:
                    push.apply(ret, arguments.callee(1));
                    push.apply(ret, arguments.callee(2));
                    break;
                case 4:
                    ret.push('建议合理书写标题和描述的长度。');
                    break;
                case 5:
                    push.apply(ret, arguments.callee(1));
                    push.apply(ret, arguments.callee(4));
                    break;
                case 6:
                    push.apply(ret, arguments.callee(2));
                    push.apply(ret, arguments.callee(4));
                    break;
                case 7:
                    push.apply(ret, arguments.callee(1));
                    push.apply(ret, arguments.callee(2));
                    push.apply(ret, arguments.callee(4));
                    break;
            }
            return ret;
        },

        // ===================== 工具方法集合 ==================
        /**
         * 是否置灰“激活”按钮，置灰返回true
         * @param {Array} selected 
         */
        disableActive: function(selected) {
            return disableBtn(selected, 'activestat', 1);
        },
        /**
         * 是否置灰“启用”按钮，置灰返回true
         */
        disableEnable: function(selected) {
            return disableBtn(selected, 'pausestat', 1);
        },
        /**
         * 是否置灰“删除”按钮，主要是判断是否有“不宜推广”的创意
         */
        disableDelete: function(selected) {
            return disableBtn(selected, 'ideastat', 2);
        },

        /**
         * 清缓存
         */
        cleanCache: function() {
            fbs.material.clearCache('ideainfo');
            fbs.material.clearCache('planinfo');
            fbs.material.clearCache('wordinfo');
            fbs.material.clearCache('unitinfo');
        },
        /**
         * 新建或编辑创意时，传给后端的数据
         * @param {Object} idea
         */
        formatData: function(idea) {
            var props = ['title', 'desc1', 'desc2'],
                i = props.length, key, value;

            while (i--) {
                key = props[i];
                value = idea[key];

                //:{ 临时转换为占位符[$replace-l$]
                value = value.replace(/:\{/g, BracketsReplacer[0]).replace(/:\}/g, BracketsReplacer[1]);
                
                //将{通配符内容}转换为{关键词}{通配符内容}
                value = value.replace(/\{(.*?)\}/g, function($0, $1) {
                    return '{关键词}{' + $1.replace(/&amp;/g, '&') + '}';
                });
                    
                //将占位符[$replace-l$]转换回{，输入:{显示为{
                value = value.replace(BracketsReplacer[2], '{').replace(BracketsReplacer[3], '}');

                idea[key] = value;
            }

            return idea;
        },
        /**
         * 新建或编辑创意失败时，后端返回的错误码
         * title   标题
         * desc1   描述1
         * desc2   描述2
         * url     访问url
         * showurl 显示url
         * error   综合性错误
         *
         * @param {Object} json 返回数据
         * @return {Object} 结构为{title: '错误信息'} 表示标题填错了，其他字段错误类似
         */
        error: function(json) {
            var error = json.error || {}, ret = {};
            for (var id in error) {
                var idea = (error[id] || {}).idea || {},
                    code = +idea.code;
                
                switch (code) {
                    case 703:
                        ret = { title: nirvana.config.ERROR.IDEA.ADD[code] };
                        break;
                    case 704:
                        ret = { desc1: nirvana.config.ERROR.IDEA.ADD[code] };
                        break;
                    case 705:
                        ret = { desc2: nirvana.config.ERROR.IDEA.ADD[code] };
                        break;
                    case 706:
                        ret = { url: nirvana.config.ERROR.IDEA.ADD[code] };
                        break;
                    case 707:
                        ret = { showurl: nirvana.config.ERROR.IDEA.ADD[code] };
                        break;
                    case 708:
                    case 709:
                    case 710:
                    case 711:
                    case 712:
                        ret = { error: nirvana.config.ERROR.IDEA.ADD[code] };
                        break;
                    case 714:
                        var detail = idea.detail;
                        if (detail) {
                            for (var field in detail) {
                                var errMsg = detail[field];
                                if (!errMsg) continue;

                                // aka字面依赖
                                if (errMsg.indexOf(UC_CV_AKA) != -1) {
                                    errMsg = UC_CV_AKA_SHORT.replace('%d', UC_CV_LINK + nirvana.env.USER_ID);
                                }
                                
                                ret[field] = errMsg;
                            }

                        }
                        
                        break;
                    default:
                        // code 未识别的话
                        ret = {message: idea.message}
                        break;
                }
            }
            
            return ret;
        }
    }
})();


