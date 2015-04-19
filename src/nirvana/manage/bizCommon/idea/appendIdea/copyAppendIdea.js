/*
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:   appendIdea/copyAppendIdea.js
 * desc:    推广管理
 * author:  yanlingling
 * date:    $Date: 2012/09/20 $
 */

/**
 * @namespace 复制附加创意
 */

manage.appendIdea = manage.appendIdea || {};

manage.appendIdea.copyAppendIdea = new er.Action({
    
    VIEW: 'copyAppendIdea',

    /**
     *ui初始化相关 
     */
     UI_PROP_MAP: {
        appendIdeaCopySelect : {
            rightMaxCount : 1000,
            leftData : '*leftData',
            rightData : '*rightData',
            firstLevelLeftClickHandler : '*planLevelClickOfCopy',
            firstLevelLeftAddHandler : '*planLevelAddClick'
            
        }
    },

   
     onbeforerender:function(){
        var me = this,
            item = me.arg.item;
        me.setContext("planName",baidu.encodeHTML(item.planname));
        me.setContext("unitName",baidu.encodeHTML(item.unitname));
            //me.setContext("unit",item.unitname);
        me.setContext("creativeid",item.creativeid);
        var type= me.arg.from;
        if(type == 'app'){
            me.setContext("mcid",item.mcid);
        }
        me.setContext("appendIdeaType",type);
        me.setContext("typeName",copyAppendIdeaDiff.typeName[type]);
        var appendHTML = copyAppendIdeaDiff.getAppendIdea[type](item);
       
        me.setContext("typeHTML",appendHTML);
        me.setContext("planLevelClickOfCopy",copyAppendIdeaLib.planLevelClickOfCopy(me,'textClick'));
        me.setContext("planLevelAddClick",copyAppendIdeaLib.planLevelClickOfCopy(me,'addClick'));
        me.setContext('remainIdsMap',[]);   
       /* var leftData = [
                           ['123','输入推广单元名称输入推广单元名',false,true,2,[  
                                                                                ['1235','输入推广单元名称输入推广单元名',false,true,5,[],false],
                                                                                ['1232','层级二2',false,true,5,[]]]
                                                                                 ],
                           ['121','第一层级2',true,true,4,[
                                                            ['1235','输入推广单元名称输入推广单元名',false,true,5,[]],
                                                            ['1232','层级二2',false,true,5,[]],
                                                            ['1231','层级二3',false,true,5,[]],
                                                            ['1236','层级二4',false,true,5,[]]
                                                           
                                                            ],false
                           ],
                           ['163','第一层级3',true,true,4,[
                                                            ['1235','输入推广单元名称输入推广单元名',false,true,5,[]],
                                                            ['1232','层级二2',false,true,5,[]],
                                                            ['1231','层级二3',false,true,5,[]],
                                                            ['1236','层级二4',false,true,5,[]]
                                                           
                                                            ],false]
                        ];
         me.setContext("leftData",leftData);*/
    },
    
    onafterrender : function(){
      var me = this,
          successHandler = copyAppendIdeaLib.getAllPlanHandler(me);
          copyAppendIdeaLib.getAllPlan(successHandler);//render以后获取数据是数据返回太慢，用户等待时间过长
          ui.util.get('okButton').onclick = copyAppendIdeaLib.okButtonClick(me);
          ui.util.get('cancelButton').onclick = copyAppendIdeaLib.cancelButtonClick(me);
          nirvana.subaction.isDone = true;//让diolog居中显示
    }

  
}); 

