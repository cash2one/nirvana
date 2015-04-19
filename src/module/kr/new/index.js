/**
 * 新版KR的入口
 */
ToolsModule.kr = new ToolsModule.Action('kr', {
    VIEW : 'kr',

    UI_PROP_MAP:{
        saveKeyAutoUnit : {
            width:'65',
            value:'-9999',
            align:'right',
            datasource:'*saveKeyMatch'
        }

    },

    CONTEXT_INITER_MAP : {
        wordMatch : function (callback) {
            
                this.setContext('saveKeyMatch',[{
                    text:"&nbsp&nbsp&nbsp<span style='text-align:center'>保存</span>",
                    value:-9999
                },{
                    text:"&nbsp<span style='color:#0033CC'>保存为<strong>广泛</strong>匹配</span>&nbsp",
                    value:"2"
                },{
                    text:"&nbsp<span style='color:#0033CC'>保存为<strong>短语</strong>匹配</span>&nbsp",
                    value:'1'
                },{
                    text:"&nbsp<span style='color:#0033CC'>保存为<strong>精确</strong>匹配</span>&nbsp",
                    value:'0'
                }]);
            
            callback();
        }
    },

    onentercomplete : function(){
        this.kr = new nirvana.KR(this.arg);
        var me = this;
        // kr 关闭时，无论保存与否都刷新
        fc.event.on(this.kr, nirvana.KR.EVENT_CLOSE, function() {
            if (typeof me.onclose === 'function') {
                me.onclose();
            } else {
                KR_COM.needReload = true;
                ToolsModule.close();
            }
            if (typeof me.arg.onclose === 'function') {
                me.arg.onclose();
            }
        });

        ToolsModule.kr.obj = this.kr;
    },
    
    onleave : function () {
        this.kr.dispose();
        ToolsModule.kr.obj = null;
    }
    
});
ToolsModule.kr.param = {};
ToolsModule.kr.obj = null;

nirvana.krModules = {};

var KR_COM = {};
