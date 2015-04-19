/*
 * cb-web
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * path:    ui/InterLockingBox.js
 * desc:    左右联动添加删除控件 目前用于在了蹊径的复制功能
 * author:  yanlingling
 * date:    $Date: 2012/09/24  $
 */

/**
 *  左右联动添加删除控件
 *
 * 每一行的数据属性包含[id,showChar,isopen,isActive,nextLevelData],如[1,'<span>我的计划</span>'],true,true,[[215,'第二个层级的显示名称'],false,truenextLevelData],[216,'第二个层级的显示名称'],false,truenextLevelData]]
 * @param {Object} options 控件初始化参数
 */
ui.InterLockingBox = function(options) {
    // 初始化参数
    this.initOptions(options);

    // 类型声明，用于生成控件子dom的id和class
    this.type = 'InterLockingBox';
    this.leftData = this.leftData || []; //左面框的数据 
    this.rightData = this.leftData || []; //右面框的数据
    this.rightMaxCount = this.rightMaxCount || 100; //右面框最大添加的数据数，主要用于右下角的显示，不用于实际控制
    this.hasAddCount = this.hasAddCount || 0;


    this.firstLevelLeftClickHandler = this.firstLevelLeftClickHandler || function() {};

    this.firstLevelRightClickHandler = this.firstLevelRightClickHandler || function() {};
    this.secondLevelLeftClickHandler = this.secondLevelLeftClickHandler || function() {};
    this.secondLevelRightClickHandler = this.secondLevelRightClickHandler || function() {};


    this.firstLevelLeftAddHandler = this.firstLevelLeftAddHandler || function() {};
    this.firstLevelRightDelHandler = this.firstLevelRightDelHandler || function() {};
    this.secondLevelLeftAddHandler = this.secondLevelLeftAddHandler || function() {};
    this.secondLevelRightDelHandler = this.secondLevelRightDelHandler || function() {};

    this.warnStr = this.warnStr || '';


};

ui.InterLockingBox.prototype = (function() {


    var tpl = "<div class='ui_InterLockingBox_Wrapper'><div id='{0}' onclick=" + '"{4}"' + "></div></div><div class='{7}  ui_interlockingbox_arrow'></div><div class='ui_InterLockingBox_Wrapper'><div id='{1}'  onclick=" +
        '"{5}"' + "></div></div> <div class='ui_InterLockingBox_foot'><span class='warn'>{9}</span>已添加：<span id='{2}'>0</span>/<span >{6}</span><a id='{3}'  onclick=" + '"{8}"' + ">&lt;&lt;全部删除</a></div>",
        G = baidu.g;

    /**
     * 获取主要的html
     */

    function getMainHtml(instance) {

        var me = instance;
        leftTableId = me.getId('leftTable'),
        rightTableId = me.getId('rightTable'),
        hasAddId = me.getId('hasAdd'),
        delAllId = me.getId('delAll'),
        arrowLeft = me.getClass('arrowLeft');
        var str = ui.format(tpl, leftTableId, rightTableId, hasAddId, delAllId, '', '', me.rightMaxCount, arrowLeft, me.getStrCall('_delAllHandler'), me.warnStr);
        return str;
    };

    /**
     * 获取左面第一层级的id
     */

    function getLeftFirstLevelId(key, instance) {
        var me = instance;
        return "fstLvlLeft" + me.getId(key);

    };


    /**
     * 获取左面第二层级的id
     */

    function getLeftSecondLevelId(key, instance) {
        var me = instance;
        return "scdLvlLeft" + me.getId(key);

    };


    /**
     * 获取右面第一层级的id
     */

    function getRightFirstLevelId(key, instance) {
        var me = instance;
        return "fstLvlRight" + me.getId(key);

    };


    /**
     * 获取右面第二层级的id
     */

    function getRightSecondLevelId(key, instance) {
        var me = instance;
        return "scdLvlRight" + me.getId(key);

    };



    return {

        /**
         * 数组索引含义配置    ['123','输入推广单元名称输入推广单元名',false,true,5,[],1]
         */
        arrayIndexConfig: {
            'id': 0,
            'showChar': 1, //显示的字面
            'isOpen': 2, //当前层级是否打开
            'isActive': 3, //当前层级是否可操作
            'nextLevelDataCount': 4, //左面的数据有下一层有多少数据的属性，右面没有 
            'nextLevelData': 5, //当前层级的下一层级数据
            'isShow': 6 //是否显示,只有右面的数据有此属性

        },



        /**
         * 产生左面第一层级的Hmtl
         */

        _creatLeftFirstLevelHTML: function(data) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                strHTML = [];
            strHTML[strHTML.length] = "<tr ><td class='" + me.getClass("td1") + "'><div uiNodeType='leftFirstLevelText'  key='" + data[arrayIndex["id"]] + "' id='" + getLeftFirstLevelId(data[arrayIndex["id"]], me) + "'  class='" + me.getClass("firstLevel") + "'>";

            strHTML[strHTML.length] = me.getFirstLevelChar(data, 'left') + "<div></td><td class='" + me.getClass("td2") + "'>";

            if (data[arrayIndex['isActive']] == true) { //添加是可用状态
                strHTML[strHTML.length] = "<span class='" + me.getClass('btnActive') + "' uiNodeType='leftFirstLevelAdd'   key='" + data[arrayIndex["id"]] + "'>添加</span>"
            } else {
                strHTML[strHTML.length] = "<span class='" + me.getClass('btnDisable') + "' uiNodeType='leftFirstLevelAdd'  key='" + data[arrayIndex["id"]] + "'>添加</span>"

            }

            //strHTML[strHTML.length]= "<span uiNodeType='leftFirstLevelAdd'>添加</span>";
            strHTML[strHTML.length] = "</td></tr>"

            if (data[arrayIndex['isOpen']]) { //当前层级是展开的

                strHTML[strHTML.length] = me._creatLeftScdLevelHTML(data);

            }
            return strHTML.join("");
        },


        /**
         * 产生左面第二层级的Hmtl
         */

        _creatLeftScdLevelHTML: function(data) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                strHTML = [],
                nextLeveData = data[arrayIndex['nextLevelData']];;
            for (var j = 0; j < nextLeveData.length; j++) {
                strHTML[strHTML.length] = "<tr ><td  class='" + me.getClass("td1") + "'><div  uiNodeType='leftScdLevelText'  key='" + nextLeveData[j][arrayIndex["id"]] + "'  id='" + getLeftSecondLevelId(data[arrayIndex["id"]], me) + "'   class='" + me.getClass("sencondLevel") + "'>" + me.getSencondLevelChar(nextLeveData[j]) + "<div></td><td  class='" + me.getClass("td2") + "'>";

                if (nextLeveData[j][arrayIndex['isActive']] == true) { //添加是可用状态
                    strHTML[strHTML.length] = "<span  fatherkey='" + data[arrayIndex["id"]] + "'  key='" + nextLeveData[j][arrayIndex["id"]] + "' class='" + me.getClass('btnActive') + "' uiNodeType='leftScdLevelAdd'>添加</span>"
                } else {
                    strHTML[strHTML.length] = "<span  key='" + nextLeveData[j][arrayIndex["id"]] + "'  class='" + me.getClass('btnDisable') + "' uiNodeType='leftScdLevelAdd'>添加</span>"

                }

                strHTML[strHTML.length] = "</td></tr>"

            }
            return strHTML.join("");
        },

        /**
         * 产生右面第一层级的Hmtl
         */

        _creatRightFirstLevelHTML: function(data) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                strHTML = [];
            strHTML[strHTML.length] = "<tr ><td class='" + me.getClass("td1") + "' ><div  uiNodeType='rightFirstLevelText'  key='" + data[arrayIndex["id"]] + "'      id='" + getRightFirstLevelId(data[arrayIndex["id"]], me) + "'  class='" + me.getClass("firstLevel") + "'>" + me.getFirstLevelChar(data) + "<div></td><td class='" + me.getClass("td2") + "'   > ";
            /*if(data[arrayIndex['isActive']]==true){//删除是可用状态
                                 strHTML[strHTML.length] = "<span class='" + me.getClass('btnActive') +"' uiNodeType='rightFirstLevelDel'    key='"+data[arrayIndex["id"]]+"'>删除</span>"
                             }else{
                                 strHTML[strHTML.length] = "<span class='" + me.getClass('btnDisable') +"' uiNodeType='rightFirstLevelDel'  key='"+data[arrayIndex["id"]]+"'>删除</span>"
                             
                             }      */
            strHTML[strHTML.length] = "<span class='" + me.getClass('btnActive') + "' uiNodeType='rightFirstLevelDel'    key='" + data[arrayIndex["id"]] + "'>删除</span>"
            strHTML[strHTML.length] = "</td></tr>"
            if (data[arrayIndex['isOpen']]) { //当前层级是展开的
                strHTML[strHTML.length] = me._creatRightScdLevelHTML(data);

            }
            return strHTML.join("");
        },


        /**
         * 产生右面第二层级的Hmtl
         */
        _creatRightScdLevelHTML: function(data) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                strHTML = [];

            var nextLeveData = data[arrayIndex['nextLevelData']];
            for (var j = 0; j < nextLeveData.length; j++) {

                if (nextLeveData[j][arrayIndex['isShow']] == true) { //可显示状态，也就是从左面添加过来
                    strHTML[strHTML.length] = "<tr ><td class='" + me.getClass("td1") + "' ><div uiNodeType='rightScdLevelText' id='" + getRightSecondLevelId(data[arrayIndex["id"]], me) + "'   class='" + me.getClass("sencondLevel") + "'>" + me.getSencondLevelChar(nextLeveData[j]) + "<div></td><td  class='" + me.getClass("td2") + "'>";
                    /*if(nextLeveData[j][arrayIndex['isActive']]==true){//删除是可用状态
                             }else{
                                 strHTML[strHTML.length] = "<span class='" + me.getClass('btnDisable') +"' uiNodeType='rightScdLevelDel'>删除</span>"
                             
                             }*/
                    strHTML[strHTML.length] = "<span fatherkey='" + data[arrayIndex["id"]] + "' key='" + nextLeveData[j][arrayIndex["id"]] + "' class='" + me.getClass('btnActive') + "' uiNodeType='rightScdLevelDel'>删除</span>"


                    strHTML[strHTML.length] = "</td></tr>";
                }


            }
            return strHTML.join("");
        },

        /**
         * 获取第一层级的展现的字面
         * @param {Object} data 数组
         */
        getFirstLevelChar: function(data, type) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                str = [];
            if (data[arrayIndex['isOpen']]) { //当前层级是展开的,并且是从左面的第一个层级添加过来的数据，箭头往下
                str[str.length] = '<span class="' + me.getClass("arrowBottom") + '"></span>'
            } else {
                str[str.length] = '<span class="' + me.getClass("arrowLeft") + '"></span>'

            }

            str[str.length] = data[arrayIndex['showChar']];


            if (type == 'left') { //左面加总数
                str[str.length] = "<span class=" + me.getClass('grayFont') + ">(" + data[arrayIndex['nextLevelDataCount']] + ")<span>";

            }
            return str.join("");

        },



        /**
         * 获取第二层级展现的字面
         */
        getSencondLevelChar: function(data) {
            var me = this,
                arrayIndex = me.arrayIndexConfig;
            return data[arrayIndex['showChar']];

        },


        /**
         * 渲染左面的框
         */
        renderLeft: function() {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                strHTML = [],
                dataList = me.leftData;
            strHTML[strHTML.length] = '<table>';
            for (var i = 0; i < dataList.length; i++) {
                strHTML[strHTML.length] = me._creatLeftFirstLevelHTML(dataList[i]);
            }
            strHTML[strHTML.length] = '</table>';
            G(me.getId('leftTable')).innerHTML = strHTML.join("");

        },


        /**
         * 渲染右面的框
         */
        renderRight: function() {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                strHTML = [],
                dataList = me.rightData;
            strHTML[strHTML.length] = '<table>';
            for (var i = 0; i < dataList.length; i++) {

                if (dataList[i][arrayIndex['isShow']] == true) { //是显示状态
                    strHTML[strHTML.length] = me._creatRightFirstLevelHTML(dataList[i]);
                }


            }
            //return strHTML[strHTML.length].join("");
            strHTML[strHTML.length] = '</table>';
            G(me.getId('rightTable')).innerHTML = strHTML.join("");


        },

        /**
         * 渲染已添加了多少  356/100
         */
        renderFoot: function() {
            var me = this,
                value = this.hasAddCount;
            G(me.getId('hasAdd')).innerHTML = value;

        },


        /**
         * 渲染整个组件
         */
        renderAll: function() {
            var me = this;
            me.renderLeft();
            me.renderRight();
            me.renderFoot();

        },
        /**
         * 渲染组件
         */
        render: function(main) {
            var me = this,
                arrayIndex = me.arrayIndexConfig;
            var dat = [1, 3, 2];
            if (!me.isRendered) {
                ui.Base.render.call(me, main);
                me.main.innerHTML = getMainHtml(me);

                me.eventBind();
                //右面的数据初始化
                me.rightData = baidu.object.clone(me.leftData);
                for (var i = 0; i < me.rightData.length; i++) {
                    me.rightData[i][arrayIndex['isShow']] = false; //右面初始不显示任何数据
                };
                me.renderAll();
                me.isRendered = true;
                //me.bindEvent();
            } else { //相当于repaint
                me.renderAll();
            }



        },

        /**
         * 事件绑定
         */
        eventBind: function() {
            var me = this;
            baidu.on(G(me.getId('leftTable')), "click", me.leftTableClickHandler());
            baidu.on(G(me.getId('rightTable')), "click", me.rightTableClickHandler());

        },


        /**
         * 获取左面第一个层级的数据源
         */
        getLeftFirstLevelData: function(id) {
            var me = this,
                arrayIndex = me.arrayIndexConfig;

            return baidu.array.filter(me.leftData, function(item, i) {
                return item[arrayIndex["id"]] == id;
            })[0];

        },

        /**
         * 获取右面第一个层级的数据源
         */
        getRightFirstLevelData: function(id) {
            var me = this,
                arrayIndex = me.arrayIndexConfig;
            return baidu.array.filter(me.rightData, function(item, i) {
                return item[arrayIndex["id"]] == id;
            })[0];

        },

        /**
         * 获取右面第一个层级有展示的数据
         */
        getRightFirstLevelShowData: function() {
            var me = this,
                arrayIndex = me.arrayIndexConfig;
            return baidu.array.filter(me.rightData, function(item, i) {
                return item[arrayIndex["isShow"]] == true;
            });

        },


        /**
         * 获取右面第二个层级有展示的数据
         */
        getRightFirstLevelShowData: function(id) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                firstLevelData = me.getRightFirstLevelData(id);
            if (firstLevelData[arrayIndex["isShow"]] == false) { //第一层级不显示，第二级也不显示
                return [];
            }
            return baidu.array.filter(firstLevelData, function(item, i) {
                return item[arrayIndex["isShow"]] == true;
            });

        },


        /**
         * 获取左面第二个层级的数据源
         * idfirst  第一个层级的数据id
         * idscd 第二个层级的数据id
         */
        getLeftScdLevelData: function(idfirst, idscd) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                firstData = me.getLeftFirstLevelData(idfirst);
            var res = baidu.array.filter(firstData[arrayIndex['nextLevelData']], function(item, i) {
                return item[arrayIndex["id"]] == idscd;
            })[0];

            return res;

        },


        /**
         * 获取右面第二个层级的数据源
         * idfirst  第一个层级的数据id
         * idscd 第二个层级的数据id
         */
        getRightScdLevelData: function(idfirst, idscd) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                firstData = me.getRightFirstLevelData(idfirst);

            var res = baidu.array.filter(firstData[arrayIndex['nextLevelData']], function(item, i) {
                return item[arrayIndex["id"]] == idscd;
            })[0];

            return res;

        },

        /**
         * 让右面某一层级下的数据全部展现,返回添加显示的个数
         */
        setNextLevelShow: function(id) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                rightItem = me.getRightFirstLevelData(id),
                leftItem = me.getLeftFirstLevelData(id),
                dataRight = rightItem[arrayIndex['nextLevelData']],
                dataLeft = leftItem[arrayIndex['nextLevelData']],
                addCount = 0;
            for (var i = 0; i < dataRight.length; i++) {
                if (dataRight[i][arrayIndex['isShow']] != true && dataLeft[i][arrayIndex['isActive']] == true) { //左面是可用状态，且右面没有显示
                    dataRight[i][arrayIndex['isShow']] = true;
                    addCount++;
                }

            };
            return addCount;

        },

        /**
         * 让右面某一层级下的数据全部展现变成不显示,返回添加显示的个数
         */
        setNextLevelHide: function(item) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                data = item[arrayIndex['nextLevelData']],
                addCount = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i][arrayIndex['isShow']] == true) { //没显示的设置为显示
                    data[i][arrayIndex['isShow']] = false;
                    addCount++;
                }

            };
            return addCount;

        },


        /**
         * 激活左面第二层级的某个添加按钮
         */
        activeLeftScdLevel: function(id, fatherid) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                leftData = me.getLeftScdLevelData(fatherid, id),
                fatherItem = me.getLeftFirstLevelData(fatherid);
            leftData[arrayIndex['isActive']] = true;
            fatherItem[arrayIndex['isActive']] = !me._isSubLevelAllDisable(fatherItem); //检查父按钮的状态

        },

        /**
         * 根据右边删除的第一层级重新激活左面的添加按钮,返回激活的个数
         */
        activeLeftNextLevel: function(id) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                leftData = me.getLeftFirstLevelData(id)[arrayIndex['nextLevelData']],
                rightData = me.getRightFirstLevelData(id)[arrayIndex['nextLevelData']],
                count = 0;
            for (var i = 0; i < rightData.length; i++) {
                if (rightData[i][arrayIndex['isShow']] == true) { //只有显示的元素才跟随上一层级一起删除
                    leftData[i][arrayIndex['isActive']] = true;
                    count++;
                }
            };
            return count;
        },



        /**
         * 设置第二个层级数据的isShow值
         */
        setScdLevelIsShow: function(id, fatherid, value) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                item = me.getRightScdLevelData(fatherid, id);;
            item[arrayIndex['isShow']] = value;


            fatherItem = me.getRightFirstLevelData(fatherid);
            fatherItem[arrayIndex['isShow']] = !me._isSubLevelAllHide(fatherItem); //检查父层级的状态


        },



        /**
         * 禁用下一层级下的添加按钮
         */
        _disableNextLevel: function(item) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                nextData = item[arrayIndex['nextLevelData']];
            for (var i = 0; i < nextData.length; i++) {
                nextData[i][arrayIndex['isActive']] = false;
            };

        },



        /**
         * 判断下一层是不是都是disable的状态
         */
        _isSubLevelAllDisable: function(item) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                nextData = item[arrayIndex['nextLevelData']],
                res = baidu.array.find(nextData, function(item, i) { //获取编辑创意的属性
                    return item[arrayIndex['isActive']] == true;
                })
                if (res) { //还有可用的
                    return false;
                } else {
                    return true;
                }

        },



        /**
         * 判断下一层是不是都是hide的状态
         */
        _isSubLevelAllHide: function(item) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                nextData = item[arrayIndex['nextLevelData']],
                res = baidu.array.find(nextData, function(item, i) { //获取编辑创意的属性
                    return item[arrayIndex['isShow']] == true;
                })
                if (res) { //还有显示的
                    return false;
                } else {
                    return true;
                }

        },


        /**
         * 添加右面已经添加的计数
         */
        addHasAdd: function(num) {
            var me = this,
                arrayIndex = me.arrayIndexConfig;
            me.hasAddCount += num;

        },

        /**
         * 减少右面已经添加的计数
         */
        minusHasAdd: function(num) {
            var me = this,
                arrayIndex = me.arrayIndexConfig;
            me.hasAddCount -= num;

        },

        /**
         * 左面区域的事件代理
         * @param {Object} e
         */
        leftTableClickHandler: function() {
            var me = this;
            return function(e) {
                var e = e || window.event,
                    tar = e.srcElement || e.target,
                    uiNodeType = tar.getAttribute('uiNodeType'),
                    id = tar.getAttribute('key');
                if (!uiNodeType) { //点击的是箭头的时候
                    tar = tar.parentNode;
                    uiNodeType = tar.getAttribute('uiNodeType'),
                    id = tar.getAttribute('key');
                }
                switch (uiNodeType) {
                    case "leftFirstLevelText":
                        //第一层级的文本点击
                        me.leftFirstLevelTextClick(id);
                        break;
                    case 'leftScdLevelText':
                        //第二层级文本点击
                        //me.leftFirstLevelTextClick(id);
                        break;
                    case 'leftFirstLevelAdd':
                        //第一层级添加点击
                        me.leftFirstLevelAddHandler(id);
                        break;
                    case 'leftScdLevelAdd':
                        //第二层级添加点击
                        var fatherkey = tar.getAttribute('fatherkey');
                        me.leftScdLevelAddHandler(id, fatherkey);
                        break;
                }
            }

        },

        /**
         * 左面第一层文本点击事件处理
         */
        leftFirstLevelTextClick: function(id) {
            var me = this,
                arrayIndex = me.arrayIndexConfig;
            me.firstLevelLeftClickHandler(id);
            var item = me.getLeftFirstLevelData(id);
            me._toggleOpen(item);
            me.renderLeft();
        },


        /**
         * 关闭打开切换
         */
        _toggleOpen: function(item) {
            var me = this,
                arrayIndex = me.arrayIndexConfig;
            if (item[arrayIndex['isOpen']] == true) { //当前层级是打开的,关闭之
                item[arrayIndex['isOpen']] = false;
            } else {
                item[arrayIndex['isOpen']] = true;
            }
        },

        /**
         * 将左面第一层级的某一项添加到右面,右面数据的逻辑处理
         */
        _addFirstLevelToRight: function(id) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                rightItem = me.getRightFirstLevelData(id);
            rightItem[arrayIndex['isOpen']] = true; //复制到右面的时候是打开的状态
            rightItem[arrayIndex['isShow']] = true; //显示
            var addCoun = me.setNextLevelShow(id); //addCoun = me.setNextLevelShow(rightItem);
            me.addHasAdd(addCoun);

        },

        /**
         * 将左面第二层级的某一项添加到右面,右面数据的逻辑处理
         */
        _addScdLevelToRight: function(id, fatherid) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                rightItem = me.getRightScdLevelData(fatherid, id),
                rightFather = me.getRightFirstLevelData(fatherid);
            if (rightFather[arrayIndex['isShow']] != true) { //父层级没显示的话，显示之
                rightFather[arrayIndex['isShow']] = true
            }
            rightItem[arrayIndex['isShow']] = true;
        },


        /**
         * 第一个层级的添加事件处理
         */
        leftFirstLevelAddHandler: function(id) {
            this.firstLevelLeftAddHandler(id); //自定义事件的执行

            var me = this,
                arrayIndex = me.arrayIndexConfig,
                item = me.getLeftFirstLevelData(id);


            if (item[arrayIndex['isActive']] == false) { //禁用 do nothing
                return;
            } else {
                me._addFirstLevelToRight(id);
                item[arrayIndex['isActive']] = false;
                me._disableNextLevel(item);
                me.render();
            }


        },



        /**
         * 第二个层级的添加事件处理
         */
        leftScdLevelAddHandler: function(id, fatherid) {
            if (!fatherid) { //添加为灰色的状态，直接返回
                return;
            }
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                fatherItem = me.getLeftFirstLevelData(fatherid),
                item = me.getLeftScdLevelData(fatherid, id);

            item[arrayIndex['isActive']] = false;
            me.addHasAdd(1);
            fatherItem[arrayIndex['isActive']] = !me._isSubLevelAllDisable(fatherItem);
            me._addScdLevelToRight(id, fatherid);
            me.render();
        },



        /**
         * 右面区域的事件代理
         * @param {Object} e
         */
        rightTableClickHandler: function() {
            var me = this;
            return function(e) {
                var e = e || window.event,
                    tar = e.srcElement || e.target,
                    uiNodeType = tar.getAttribute('uiNodeType'),
                    id = tar.getAttribute('key');
                if (!uiNodeType) { //点击的是箭头的时候
                    tar = tar.parentNode;
                    uiNodeType = tar.getAttribute('uiNodeType'),
                    id = tar.getAttribute('key');
                }
                switch (uiNodeType) {
                    case "rightFirstLevelText":
                        //第一层级的文本点击
                        me._rightFirstLevelTextClick(id);
                        break;

                    case 'rightFirstLevelDel':
                        //第一层级删除点击
                        me._rightFirstLevelDelHandler(id);
                        break;
                    case 'rightScdLevelDel':
                        //第二层级删除点击
                        var fatherkey = tar.getAttribute('fatherkey');
                        me._rightScdLevelDelHandler(id, fatherkey);
                        break;
                }
            }


        },


        /**
         * 右面面第一层文本点击事件处理
         */
        _rightFirstLevelTextClick: function(id) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                item = me.getRightFirstLevelData(id);
            if (item[arrayIndex['isOpen']] == true) { //当前层级是打开的,关闭之
                item[arrayIndex['isOpen']] = false;
            } else {
                item[arrayIndex['isOpen']] = true;
            }
            me.renderRight();
        },

        /**
         * 右边区域第一个层级点击删除
         */
        _rightFirstLevelDelHandler: function(id) {
            var me = this,
                arrayIndex = me.arrayIndexConfig;
            me._DelLinkLeftFirstLevel(id);
        },

        /**
         * 与左面联动删除，左面的变成可添加状态
         */
        _DelLinkLeftFirstLevel: function(id) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                minusCount = 0;

            me._setFirstLevelDelLeft(id);
            //设置右面相关
            minusCount = me._setFirstLevelDelRight(id);
            me.minusHasAdd(minusCount);
            me.render();

        },

        /**
         * 直接删除，不改左面，再也显示 不了了
         */
        _DelNoLinkLeftFirstLevel: function(id) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                minusCount = 0;

            minusCount = me._setFirstLevelDelRight(id);
            me.minusHasAdd(minusCount);
            me.render();

        },

        /**
         * 设置第一层级删除左面的状态
         */
        _setFirstLevelDelLeft: function(id) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                leftDatasource = [],
                //设置左面相关
                leftDatasource = me.getLeftFirstLevelData(id);
            leftDatasource[arrayIndex['isActive']] = true; //左面恢复可用
            me.activeLeftNextLevel(id); //层级下的恢复可用
        },


        /**
         * 设置第一层级删除右面的状态
         */
        _setFirstLevelDelRight: function(id) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                rightDatasource = [],
                minusCount = 0;
            //设置右面相关
            rightDatasource = me.getRightFirstLevelData(id);
            minusCount = me.setNextLevelHide(rightDatasource);
            rightDatasource[arrayIndex['isShow']] = false;
            return minusCount;
        },

        /**
         * 右边区域第二个层级点击删除
         */
        _rightScdLevelDelHandler: function(id, fatherid) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                leftDatasource = [],
                rightDatasource = [];
            me.activeLeftScdLevel(id, fatherid);
            me.setScdLevelIsShow(id, fatherid, false);
            me.minusHasAdd(1);
            me.render();

        },


        /**
         * 删除点击响应函数
         */
        _delAllHandler: function() {
            var me = this,
                arrayIndex = me.arrayIndexConfig;
            me._delAllLinkLeft();
        },


        /**
         * 删除右面的全部，联动左面
         */
        _delAllLinkLeft: function() {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                leftData = me.leftData,
                rightData = me.rightData;
            for (var i = 0; i < leftData.length; i++) {
                var id = leftData[i][arrayIndex["id"]];
                //左面数据
                leftData[i][arrayIndex["isActive"]] = true;
                me.activeLeftNextLevel(id);
                //右面数据
                me.setNextLevelHide(rightData[i]);
                rightData[i][arrayIndex["isShow"]] = false;
            };
            this.hasAddCount = 0;
            me.render();
        },

        /**
         * 删除右面的全部，不联动左面（左面还是不可用）
         */
        delAllNoLinkLeft: function() {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                rightData = me.rightData;
            for (var i = 0; i < rightData.length; i++) {
                //右面数据
                me.setNextLevelHide(rightData[i]);
                rightData[i][arrayIndex["isShow"]] = false;
            };
            this.hasAddCount = 0;
            me.render();
        },

        /**
       * 删除右面的全部，除了制定的第二层级的ids，不联动左面（左面还是不可用）
       
      delAllNoLinkLeftExceptIds:function(ids){
           var  me = this,
                arrayIndex = me.arrayIndexConfig,
                rightData =  me.rightData;
                for (var i=0; i < rightData.length; i++) {
                 //右面数据
                 var nextdata = rightData[i][arrayIndex["nextLevelData"]];
                  me.setNextLevelHide(rightData[i]);
                  rightData[i][arrayIndex["isShow"]]=false;
                };
               this.hasAddCount = 0;
               me.render();
      },*/


        /**-
         * 直接删除，不改左面，再也显示 不了了,如copy子链部分成功的情况
         */
        DelNoLinkLeftScdLevel: function(id, fatherid) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                rightDatasource = [];
            me.setScdLevelIsShow(id, fatherid, false);
            me.minusHasAdd(1);
            me.render();

        },



        /**
         * 添加左面的数据
         * @param {Object} id
         * @param {Object} showChar
         * @param {Object} isOpen
         * @param {Object} isActive
         * @param {Object} nextLevelDataCount
         * @param {Object} nextLevelData
         */
        addLeftDataItem: function(id, showChar, nextLevelDataCount, nextLevelData, isOpen, isActive) {
            var me = this,
                arrayIndex = me.arrayIndexConfig,
                item = [],
                isOpen = isOpen || false,
                isActive = isActive || true,
                nextLevelDataCount = nextLevelDataCount || 0,
                nextLevelData = nextLevelData || 0;
            item[arrayIndex['id']] = id;
            item[arrayIndex['showChar']] = showChar;
            item[arrayIndex['isOpen']] = isOpen;
            item[arrayIndex['isActive']] = isActive;
            item[arrayIndex['nextLevelDataCount']] = nextLevelDataCount;
            item[arrayIndex['nextLevelData']] = nextLevelData;
            me.leftData.push(item);

        }



    }
})()



ui.Base.derive(ui.InterLockingBox);