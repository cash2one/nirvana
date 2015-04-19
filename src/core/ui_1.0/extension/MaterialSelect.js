/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    ui/MaterialSelect.js
 * desc:    组合搜索控件
 * author:  zhouyu
 * date:    2010/12/31
 */

/**
 * 物料组合搜索控件,使用场景比如搜索管理工具栏的搜索词报告，选择物料生成报告
 * 
 * @class MaterialSelect
 * @namespace ui
 * @extends ui.Base
 * @constructor
 * @param {Object} options 控件初始化参数
 * <pre>
 * 参数配置定义如下：
 * {
 *   id:          [String],   [REQUIRED] 控件ID
 *   level:       [Array],    [OPTIONAL] 物料层级，默认["user"]，数组元素顺序为层级顺序
 *   form:        [String],   [OPTIONAL] 默认"material"，用于区分监控文件夹，form = "avatar"时，获取
 *                                       全部监控文件夹，没设置的话默认是普通物料模式
 *   pagesize:    [Number],   [OPTIONAL] 显示的物料每页显示的数量，默认50
 *   addWords:    [Array],    [OPTIONAL] 默认空数组，已选择的关键词数组，其数据结构定义如下
 *   tableOption: [Object],   [OPTIONAL] 创建表格控件初始化参数，这里无需配置id属性，
 *                                       具体见{{#crossLink "ui.Table"}}{{/crossLink}}初始化时options的定义
 *   onclose:     [Function], [OPTIONAL] 关闭物料选择控件触发的回调函数，具体见{{#crossLink "ui.SelectCombo"}}{{/crossLink}}
 *   needDel:     [Boolean],  [OPTIONAL] 是否提供显示已删除的复选框，默认false，具体见{{#crossLink "ui.SelectCombo"}}{{/crossLink}}
 *   noDataHtml:  [String],   [OPTIONAL] 删除物料过多显示的提示信息
 * }
 * 
 * addWords数据结构定义如下：
 * [
 *    {
 *       id:   [String], 关键词或监控文件夹id
 *       name: [Stirng], 关键词或监控文件夹显示的名称，可以是HTML片段
 *       ...,  其它属性定义
 *    },
 *    ...
 * ]
 * NOTICE: 对于不同form下，addWords代表不同含义，form = "avatar"为监控文件夹
 * </pre>
 */
ui.MaterialSelect = function (options) {
    this.initOptions(options);
    this.type = 'materialselect';
	
	this.userid = nirvana.env.USER_ID;
	this.username = nirvana.env.USER_NAME;
	//数组中按顺序写出层级名，目前包括[user,plan,unit,keyword,idea],以后再扩展folder等
	//增加sublink附加创意层级蹊径子链类型，考虑到可能不是所有的附加创意都支持物料带入，这里单独传入附加创意类型 add by zhouyu01 2012/09/28
	this.level = this.level || ["user"]; 
	//增加form属性，用于区分监控文件夹，form = "avatar"时，获取全部监控文件夹，没设置的话默认是普通物料模式
	this.form = this.form || "material";
	this.pagesize = this.pagesize || 50;
//  this.ispageset = this.ispageset || false;
	this.levelFunc = {
		"user" : this.renderPlanList(),
		"plan" : this.renderUnitList(),
		"unit" : this.renderMatList(),
		"keyword" : null,
		"idea" : null,
		"sublink": null,
		"app": null
	//	"creativeidea": null
	};
};

ui.MaterialSelect.prototype = {
    /**
     * 渲染控件
     * @method render
     * @param {Object} main 控件挂载的DOM元素，必须是DIV元素
     */
    render: function(main){
        var me = this;
        if (main && main.tagName != 'DIV') {
            return;
        }
        
        if(!me.main){
            ui.Base.render.call(me, main, true);
        }
        /**
		 * 已添加的关键词
		 * @property addWords
		 * @type Array
		 * @default []
		 */
        me.addWords = me.addWords || [];
        me.renderLevelOption();
        me.renderSearchOption();
        me.renderTableOption();
        me.isRender = true;
    },
    
    
    /**
     * 初始化level层级参数，每次都从第一层开始
     */
    renderLevelOption: function(){
        var me = this;
        if (me.form == "material") {
            me.materialLevel = {
                material: [{
                    level: 0,
                    id: 0,
                    word: "计划列表",
                    tipContent: "",
                    click: me.renderPlanList()
                }]
            };
        }
        else 
            if (me.form == "avatar") {
                me.materialLevel = {
                    material: [{
                        level: 0,
                        id: 1,
                        word: "所有监控文件夹",
                        tipContent: "",
                        click: me.renderFolderList()
                    }]
                };
            }
        me.materialLevel.fatherWidth = me.width;
        if (me.isRender && me.selectCombo) {
            me.selectCombo.materialLevel = me.materialLevel;
            me.selectCombo.materialLevel.material = me.materialLevel.material;
        }
    },
    
    
    /**
     * 初始化搜索组合控件参数，每次render输入框的值都必须为空
     */
    renderSearchOption: function(){
        var me = this;
        me.searchOption = {};
    },
    
    /**
     * 初始化tableOption
     */
    renderTableOption: function(){
        var me = this;
        var last = false,
            classname = "";
        if (me.level.length == 1 || me.level.length == 2) {
            last = true;
        }
        var dataTable = {
            "fields": [{
                content: me.setTableFields(last),
                stable: false,
                title: '',
                width: 300
            }],
            "noTitle": true,
            "noDataHtml": FILL_HTML.NO_MATERIAL,
            "width": 370
        };
        
        if (!me.tableOption) {
            me.tableOption = dataTable;
        }
        else {
            for(var item in dataTable){
                if(!me.tableOption[item]){
                    me.tableOption[item] = dataTable[item];
                }
            }
        }
        
        //如果是repaint，则需要重新设置selectCombo.table对象的fields
        if (me.isRender && me.selectCombo) {
            me.selectCombo.tableOption.fields = dataTable.fields; 
            if (me.form == "material") {
                me.getPlanList(1);
            }else{
                me.getFolderList();
            }
            //me.getPlanList(1);
        }else{
            if (me.form == "material") {
                me.getPlanList(0);
            }else{        
                me.getFolderList();
            }
        //  me.getPlanList(0);
        }
    },
    
    
    /**
     * 设置table的fields参数
     * @param {Object} last
     */
    setTableFields: function(last){
		var me = this;
		if (last) {
			var lastlevel = 'lastlevel="y"';
		}
		else {
			var lastlevel = 'lastlevel="n"';
		}
		return function(item){
			var disabled = "", 
				classname = "",
				 isAdd = false,
				 //name = title = saveword = item.name;
				 name = item.name,
				 title = item.name,
				 saveword = item.name;
			
			if (last) {
				isAdd = me.isWordAdded(item.id);
				//用于区分点击样式
				if (isAdd !== false && isAdd !== -1) {
					classname = ' class = "' + me.selectCombo.getClass("disabled");
				}
				classname += '"';
				switch (me.level[me.level.length - 1]) {
					case "idea":
						name = IDEA_RENDER.lineBreak(IDEA_RENDER.wildcard(baidu.decodeHTML(name)));
						title = name.replace(/\<.*?\>/ig, ''); // 替换<> HTML标签
						saveword = baidu.encodeHTML(name);
						break;
					case "sublink":
					case "app":
						title = name.replace(/\<.*?\>/ig, ' '); // 替换<> HTML标签
						saveword = baidu.encodeHTML(name);
					break;
					
					default:
						break;
				}
			    return '<a id="' + item.id + '" ' + lastlevel + classname + ' saveword="' + saveword + '" data-log="{target:\'addWordToLeft_btn\'}">添加</a>&nbsp;&nbsp;<span ' + ' title="' + title + '">' + name + '</span>';
            }
            else {
                return '<a id="' + item.id + '" ' + lastlevel + ' saveword="' + saveword + '" title="' + title + '">' + name + '</a>';
            }
		};
	},
    

    
    /**
     * 创建基层控件对象
     */
    createSelectCombo: function(){
        var option = {
            "id": this.getId("materialSelect"),
            "materialLevel": this.materialLevel,
            "searchOption": this.searchOption,
            "tableOption": this.tableOption,
            "pageOption": this.pageOption,
            "needDel" : this.needDel,
            "onclose" : this.onclose,
            close: true
        };
        
        if (this.height) {
            option.height = this.height;
        }
        if (this.width) {
            option.width = this.width;
        }
        
        this.selectCombo = ui.util.create("SelectCombo", option);
        
        this.selectCombo.onAddLeft = this.addLeft();
        this.selectCombo.onToNextLevel = this.ToNextLevel();
        this.selectCombo.onsearch = this.search();
        this.selectCombo.onLevelChange = this.levelChange();
        this.selectCombo.showDelHandler = this.reloadNowLevel();
        this.selectCombo.onPageChange = this.setPageSelect();
        this.selectCombo.render(this.main);
    },
    
    /**
     * 物料是否已添加
     * @param {Object} id
     */
    isWordAdded: function(id){
        var me = this;
        for (var i = 0, l = me.addWords.length; i < l; i++) {
            if(me.addWords[i].id == id){
                return i;
            }
        }
        return false;
    },
    
    /**
     * 删除已添加物料
     * @param {Object} id
     */
    removeAddedWord: function(id){
        var me = this;
        var index = me.isWordAdded(id);
        if(index != -1){
            return me.addWords.splice(index, 1);
        }
        return false;
    },
    /**
     * 重新获取监控文件夹列表的datasource
     */
    renderFolderList: function(){
        var me = this;
        return function(userid){
            me.getFolderList();
        }
    },
    /**
     * 重新获取计划列表的datasource
     */
    renderPlanList: function(){
        var me = this;
        return function(userid){
            me.getPlanList(1);
        }
    },
    
    /**
     * 重新获取单元列表的datasource
     * @param {Object} planid
     */
    renderUnitList: function(){
        var me = this;
        return function(planid){
            me.getUnitList(planid);
        }
    },
    
    
    /**
     * 重新获取关键词或创意列表的datasource
     * @param {Object} unitid
     */
    renderMatList: function(){
        var me = this;
        return function(unitid){
			switch(me.level[me.level.length - 1]){
				case "keyword":
					me.getKeywordList(unitid);
					break;
				case "idea":
					me.getIdeaList(unitid);
					break;
				case "sublink":
					me.getCreativeIdeaList(unitid, "sublink");
					break;
				case "app":
                    me.getCreativeIdeaList(unitid, "app");
                    break;
				default:
					break;
			}
        }
    },
    
    
    /**
     * 是否显示已删除
     */
    getIsDel:function(){
        var me = this;
        if(me.selectCombo.isShowDel){
            return [0,1];
        }else{
            return [0];
        }
        
    },
    
    /**
     * 获取计划列表
     */
    getPlanList: function(type){
        var me = this,
            isdel = [0],
            tableData = null,
            param = {};
        
        if(type == 1){
            isdel = me.getIsDel();
        }
        
        param = {
            isdel: isdel,
            onSuccess:function(data){
                var status = data.status,
                    planlist = [],
                    datalist = [];
                
                if (status == 800) {
                    me.tableOption.noDataHtml = me.noDataHtml;
                } else {
                    datalist = data.data.listData;
                    me.tableOption.noDataHtml =  FILL_HTML.NO_MATERIAL;
                }
                
                var len = datalist.length;
                var tableData = [];
                for (var i = 0; i < len; i++) {
                    planlist[planlist.length] = {
                        id : datalist[i].planid,
                        name : baidu.encodeHTML(datalist[i].planname)
                    }
                }
                me.currentData = me.resultData = planlist;
                tableData = baidu.object.clone(me.resultData).splice(0, me.pagesize);
                if(!me.selectCombo){
                    me.tableOption.datasource = tableData;
                    me.pageOption = me.setPageOption(planlist);
                    me.createSelectCombo();
                }else{
                    me.selectCombo.tableOption.datasource = tableData;
                    me.selectCombo.pageOption = me.setPageOption(planlist);
                    if(type == 1){
                        me.reset();
                    }
                }
            //  me.currentData = tableData;
            },
            onFail:me.failHandler()
        };
        
        if (isdel.length > 1) {
            param.limit = nirvana.config.NUMBER.MAX_RECORD.LIST;
        }
        
        fbs.material.getName("planinfo",["planid","planname"], param);
        
    },
    
    /**
     * 获取文件夹列表
     */
    getFolderList:function(){
        var me = this;
        fbs.avatar.getMoniFolders({
            fields:["folderid","foldername"],
            onSuccess:function(data){
                var foldlist =[];
                var datalist = data.data.listData || [];
                var len = datalist.length;
                for (var i = 0; i < len; i++) {
                    foldlist[foldlist.length] = {
                        id : datalist[i].folderid,
                        name : baidu.encodeHTML(datalist[i].foldername)                 
                    }
                }
                me.currentData = me.resultData = foldlist;
                var tableData = baidu.object.clone(me.resultData).splice(0, me.pagesize);
                me.selectCombo.tableOption.datasource = tableData;
                me.selectCombo.pageOption = me.setPageOption(foldlist);
                me.reset();
            },
            onFail:me.failHandler()
        });
    },
    /**
     * 获取单元列表
     */
    getUnitList: function(planid){
        var me = this,
            tableData = null,
            isdel = me.getIsDel(),
            param = {};
        
        param = {
            isdel:isdel,
            
            condition: {
                planid: [planid]
            },
            onSuccess : function(data){
                var status = data.status,
                    unitlist =[],
                    datalist = [];
                
                if (status == 800) {
                    me.tableOption.noDataHtml = me.noDataHtml;
                } else {
                    datalist = data.data.listData;
                    me.tableOption.noDataHtml =  FILL_HTML.NO_MATERIAL;
                }
                
                var len = datalist.length;
                for (var i = 0; i < len; i++) {
                    unitlist[unitlist.length] = {
                        id : datalist[i].unitid,
                        name : baidu.encodeHTML(datalist[i].unitname)
                    }
                }
                me.currentData = me.resultData = unitlist;
                var tableData = baidu.object.clone(me.resultData).splice(0, me.pagesize);
                me.selectCombo.tableOption.datasource = tableData;
                me.selectCombo.pageOption = me.setPageOption(unitlist);
        //      me.currentData = tableData;
                me.reset();
            },
            onFail:me.failHandler()
        };
        
        if (isdel.length > 1) {
            param.limit = nirvana.config.NUMBER.MAX_RECORD.LIST;
        }
        
        fbs.material.getName("unitinfo",["unitid","unitname"], param);
    },
    
    
    /**
     * 获取关键词列表
     */
    getKeywordList: function(unitid){
        var me = this,
            isdel = me.getIsDel(),
            param = {};
        
        param = {
            isdel:isdel,
            condition: {
                unitid: [unitid]
            },
            onSuccess : function(data){
                var status = data.status,
                    kwlist =[],
                    datalist = [];
                
                if (status == 800) {
                    me.tableOption.noDataHtml = me.noDataHtml;
                } else {
                    datalist = data.data.listData;
                    me.tableOption.noDataHtml =  FILL_HTML.NO_MATERIAL;
                }
                
                var len = datalist.length;
                for (var i = 0; i < len; i++) {
                    kwlist[kwlist.length] = {
                        id : datalist[i].winfoid,
                        name : baidu.encodeHTML(datalist[i].showword)
                    }
                }
                
                me.currentData = me.resultData = kwlist;
                var tableData = baidu.object.clone(me.resultData).splice(0, me.pagesize);
                me.selectCombo.tableOption.datasource = tableData;
                me.selectCombo.pageOption = me.setPageOption(kwlist);
            //  me.currentData = tableData;
                me.reset();
            },
            onFail:me.failHandler()
        };
        
        if (isdel.length > 1) {
            param.limit = nirvana.config.NUMBER.MAX_RECORD.LIST;
        }
        
        fbs.material.getName("wordinfo",["winfoid", "showword"], param);
    },
    
    
    /**
     * 获取创意列表
     */
    getIdeaList: function(unitid){
        var me = this,
            isdel = me.getIsDel(),
            param = {};
        
        param = {
            isdel:isdel,
            
            condition: {
                unitid: [unitid]
            },
            onSuccess : function(data){
                var status = data.status,
                    Idealist =[],
                    datalist = [];
                
                if (status == 800) {
                    me.tableOption.noDataHtml = me.noDataHtml;
                } else {
                    datalist = data.data.listData;
                    me.tableOption.noDataHtml =  FILL_HTML.NO_MATERIAL;
                }
                
                var len = datalist.length;
                for (var i = 0; i < len; i++) {
                    Idealist[Idealist.length] = {
                        id : datalist[i].ideaid,
                        name : baidu.encodeHTML(datalist[i].title) 
                    }
                }
                me.currentData = me.resultData = Idealist;
                var tableData = baidu.object.clone(me.resultData).splice(0, me.pagesize);
                me.selectCombo.tableOption.datasource = tableData;
                me.selectCombo.pageOption = me.setPageOption(Idealist);
        //      me.currentData = tableData;
                me.reset();
            },
            onFail:me.failHandler()
        };
        
        if (isdel.length > 1) {
            param.limit = nirvana.config.NUMBER.MAX_RECORD.LIST;
        }
        
        fbs.material.getName("ideainfo",["ideaid", "title"], param);
    },
    
    
    
    /**
     * 获取附加创意列表
     */
    getCreativeIdeaList: function(unitid, type){
        var me = this,
            isdel = me.getIsDel(),
            param = {};
        
        param = {
            isdel:isdel,
            creativetype: type,
            condition: {
                unitid: [unitid]
            },
            onSuccess : function(data){
                var status = data.status,
                    creativelist =[],
                    datalist = [];
                
                if (status == 800) {
                    me.tableOption.noDataHtml = me.noDataHtml;
                } else {
                    datalist = data.data.listData;
                    me.tableOption.noDataHtml =  FILL_HTML.NO_MATERIAL;
                }
                
                var len = datalist.length;
                for (var i = 0; i < len; i++) {
                    var name = '';
                    if(datalist[i].content){ //子链
                        name =  appendIdeaLib.getSublinkReviewText(datalist[i].content);
                    }else if(datalist[i].appname){//app推广
                        name = baidu.encodeHTML(baidu.decodeHTML(datalist[i].appname));
                    }

                    creativelist[creativelist.length] = {
                        id : datalist[i].creativeid,
						name : name + me.addDelInfo(datalist[i].isdel)
					//	name: datalist[i].content
                    }
                }
                me.currentData = me.resultData = creativelist;
                var tableData = baidu.object.clone(me.resultData).splice(0, me.pagesize);
                me.selectCombo.tableOption.datasource = tableData;
                me.selectCombo.pageOption = me.setPageOption(creativelist);
        //      me.currentData = tableData;
                me.reset();
            },
            onFail:me.failHandler()
        };
        
        if (isdel.length > 1) {
            param.limit = nirvana.config.NUMBER.MAX_RECORD.LIST;
        }
        var field = ["creativeid","content"];
        if(type=='app'){//app的时候改名了。。。。
           field = ["creativeid","appname"]; 
        }
            
        fbs.material.getName("creativeinfo",field, param);
    },
	
	/**
	 * 附加创意后的已删除要在前端加
	 * @param {Object} isdel
	 */
	addDelInfo: function(isdel){
		if(isdel && isdel == 1){
			return "<span info='isdel'>[已删除]</span>";
		}else{
			return "";
		}
	},
	
    /**
     * 获取数据失败
     */
    failHandler: function(){
        var me = this;
        return function(data){
            if (me.selectCombo) {
                var mat = me.selectCombo.materialLevel.material, len = mat.length;
                baidu.array.removeAt(mat, len - 1);
            }
            else {
                me.tableOption.datasource = [];
                me.pageOption = {};
                me.createSelectCombo();
            }
            
            ajaxFailDialog();
        }
    },
    
    /**
     * 每次操作重新设置pageOption
     */
    setPageOption: function(data){
        var me = this;
        var total = Math.ceil(data.length / me.pagesize);
        if (total > 1) {
            return {
                showCount: 2,
                page: 0,
                total: total
            };
        }
        return {page: 0, total: 0};
    },
    
    /**
     * 设置页码选择事件
     */
    setPageSelect:function(){
        var me = this;
        return function(page){
            var start = (page - 1) * me.pagesize;
            var currentData = baidu.object.clone(me.currentData);
            currentData = currentData.splice(start, me.pagesize);
        //  me.currentData = resultData;
        //  resultData = me.filterData(me.selectCombo.search.getValue());
            me.selectCombo.tableOption.datasource = currentData;
            me.selectCombo.setTable();
        }
    },
    

    reset: function(){
        var me = this, selectcombo = me.selectCombo;
        selectcombo.search.setValue("");
        selectcombo.level.material = selectcombo.materialLevel.material;
        selectcombo.setLevel();
        selectcombo.setTable();
        selectcombo.setPage();
        me.selectCombo.page.onselect = me.setPageSelect();
    },
    
    
    /**
     * 将数据添加到左侧
     */
    addLeft: function(){
        var me = this;
        return function(option){
            if (me.onAddLeft(option) !== false) {
                me.addWords[me.addWords.length] = option;
                return true;
            }
            else {
                return false;
            }
        }
    },
    /**
	 * 添加指定的物料到左侧，添加物料成功返回true,失败返回false
	 * @event onAddLeft
	 * @param {Object} obj 要添加的物料，数据结构定义：{id: '', name: ''}
	 */
    onAddLeft: new Function,
    
    /**
     * 到下一层级，重新构造level和table数据
     */
    ToNextLevel: function(){
        var me = this;
        return function(option){
            var mat = me.selectCombo.materialLevel.material,
                currentLevel = mat.length,
                id = option.id,
                name = option.name,
                last = false;
            mat[currentLevel] = {
                level : currentLevel,
                id : id,
                word : name,
                click : me.levelFunc[me.level[currentLevel]]
            };
            
            if (currentLevel == me.level.length - 2) {
                last = true;
            }
            me.selectCombo.tableOption.fields[0].content = me.setTableFields(last);
            me.levelFunc[me.level[currentLevel]](id);
        }
    },
    
    /**
     * 重新载入当前层级数据，即上一层级
     */
    reloadNowLevel : function() {
        var me = this;
        
        return function() {
            var mat = me.selectCombo.materialLevel.material,
                currentLevel = mat.length - 1,
                id = mat[currentLevel].id;
            
            me.levelFunc[me.level[currentLevel]](id);
        };
    },  
    
    levelChange: function(){
        var me = this;
        return function(level){
            var last = false;
                
            if (level == me.level.length - 2) {
                last = true;
            }
            me.selectCombo.tableOption.fields[0].content = me.setTableFields(last);
            return true;
        }
    },
    
    /**
     * 根据condition筛选结果
     */
    search: function(){
        var me = this;
        return function(condition){
            me.currentData= me.filterData(condition);
            me.selectCombo.tableOption.datasource = baidu.object.clone(me.currentData).splice(0, me.pagesize);
            me.setNoTable();
            me.selectCombo.pageOption = me.setPageOption(me.currentData);
        }
    },
    
    /**
     * 过滤数据
     * @param {Object} condition
     */
    filterData: function(condition){
        var me = this, value = "", data = me.resultData, len = data.length;
        var tmp = [];
        if(condition && condition.search){
            value = baidu.encodeHTML(condition.search);
        }
        if (value == "") {
            tmp = data;
        }
        else {
            for (var i = 0; i < len; i++) {
                if ((data[i].name).toUpperCase().indexOf(value.toUpperCase()) != -1) {
                    tmp[tmp.length] = data[i];
                }
            }
        }
        return tmp;
    },
    
    setNoTable: function(){
        var me = this;
        me.selectCombo.tableOption.noDataHtml = "<span class='" + me.getClass("noResult") + "'>抱歉，没有结果！</span>";
    },
    
    /**
	 * 设置层级
	 * @method setLevel
	 * @param {Array} level 所要设置的新的层级
	 */
    setLevel: function(level){
        this.level = level || this.level;
    },
    
    /**
     * 设置form
     * @method setForm
     * @param {String} form 有效值"material","avatar"
     */
    setForm: function(form){
        this.form = form || this.form;
    },
    /**
	 * 恢复已经添加的词
	 * @method recover
	 * @param {String} id 恢复的关键词的id
	 */
    recover: function(id){
        var me = this;
        if (me.onRecover(id) !== false) {
            me.removeAddedWord(id);
            me.selectCombo.recover("id", id);
        }
    },
    /**
	 * 恢复已经添加的词触发的事件，如果恢复失败，返回false
	 * @event onRecover
	 * @param {String} id 恢复的关键词的id
	 */
    onRecover: new Function,
    
    
    /**
     * 重绘控件
     */
    repaint: new Function(),
    
    /**
     * 释放控件实例
     * @method dispose
     */
    dispose: function(){
        ui.Base.dispose.call(this);
    }
};

ui.Base.derive(ui.MaterialSelect);
