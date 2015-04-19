/*
 * nirvana
 * Copyright 2011 Baidu Inc. All rights reserved.
 * 
 * path:    batch/batch.js
 * desc:    批量下载
 * author: 	liuyutong
 * date:    $Date: 2011/8/2 $
 */
/*批量下载 
*batchState : 0 -- 未开始;
* 1 -- 生成中；
* 2 -- 已完成；
* 3 -- 生成失败（系统错误）；
* 4 -- 关键词过多无法生成；
*/
nirvana.manage.batchDownload = {
	batchState : 0 ,
	batchEL : (function(){
		var a = document.createElement('a');
		a.setAttribute('id','batchDownload');
		a.setAttribute('data-log',"{target:'batchDownload_btn'}");
		a.setAttribute('href','#');
		return a;
	})(),
	_tplState : {//记得UE出来后修改
		0 : '批量下载',
		1 : '批量下载(生成中)',
		2 : '批量下载(已完成)',
		3 : '批量下载(失败)',
		4 :'批量下载'
	},
	initCheck : function(){//长轮训函数
			fbs.batch.checkBatchDownload({
				callback : function(data){
					//console.log(data)
					nirvana.manage.batchDownload.changState(data);
				}
			});
	},
	changState : function(data){//批量下载工具主控制函数
			var me = this ;
			if(data.status == 200){
				switch(data.data.stat){
					case 'NOT_STARTED' : 
						me.batchState = 0;
					break;
					case 'PROCESSING' : 
						me.batchState = 1; 
						me.Polling = setTimeout(me.initCheck,10000);
					break;
					case 'SUCCESS' : 
						me.batchState = 2;
						me.OK_DATE = data.data.finish;me.OK_PATH = data.data.path;
					break;					
					default : break;
				}
				//console.log('HERE',data)
				me.batchEL.innerHTML = me._tplState[me.batchState];
			}else if(data.status == 400){
				clearTimeout(me.Polling);
				me.batchState = 3;
				me.batchEL.innerHTML = me._tplState[3];
			}
		},
    Polling : null,
	OK_DATE : null,
	OK_PATH : null,
	batchDialog : function(){
		nirvana.util.openSubActionDialog({
			id: 'batchDownloadDialog',
			title: '批量下载',
			width: 440,
			actionPath: 'manage/batch',
			params: {
				
			},
			onclose: function(){
				clearTimeout(nirvana.manage.batchDownload.Polling);
				if(nirvana.manage.batchDownload.batchState == 1){
					nirvana.manage.batchDownload.initCheck();
				}
			}
		});
		
		return false;
	}
}

 

manage.batch = new er.Action({
	//模板
	VIEW: 'setBatch',
	
	STATE_ID : {
		0 : "batch_notstart",
		1 : "batch_proccessing",
		2 : "batch_done",
		3 : "batch_error",
		4 : "batch_toomuch"
	},
	Show_now : null,
	CONTEXT_INITER_MAP : {
		initRender : function (callback){
			clearTimeout(nirvana.manage.batchDownload.Polling);
			callback();
		}
		
	},
	_Render : function(state){
		var me = this , batch = nirvana.manage.batchDownload;
		baidu.dom.hide(me.Show_now);
		me.Show_now = baidu.g(me.STATE_ID[state]);
		//console.log(me.Show_now)
		baidu.dom.show(me.Show_now);
		batch.batchEL.innerHTML = batch._tplState[state];
		if(state == 1){
			batch.Polling = setTimeout(function(){
				me._CHECK(me);
			},10000);
		}
	},
	_ChangeState : function(type,data){
		var me = this, batch = nirvana.manage.batchDownload;
		if(type == 'add'){
			//console.log(type);
			if(data.status == 200){
				//console.log(200);
				batch.batchState = 1;
				
			}else if(data.status == 400){
				//console.log(400);
				batch.batchState = 3;
			}else if(data.status == 500 && data.errorCode.code == 1261){
				//console.log(500);
				batch.batchState = 4;
			}
			if(data.status == 403){
				//客服披露下载生成权限关闭
				baidu.each($$('.batch_control .batch_close'),function(item){
					baidu.removeClass(item,'hide');
				});
			}else{
				baidu.each($$('.batch_control .batch_close'),function(item){
					baidu.addClass(item,'hide');
				});
			}
		}else if(type == 'check'){
			if(data.status == 200){
				switch(data.data.stat){
					case 'NOT_STARTED' : 
						batch.batchState = 0;
					break;
					case 'PROCESSING' : 
						batch.batchState = 1; 
					break;
					case 'SUCCESS' :
						batch.batchState = 2;
						batch.OK_DATE = data.data.finish;
						batch.OK_PATH = data.data.path;
						baidu.g('batch_okdate').innerHTML = data.data.finish;
						baidu.g('downloadBatchDownload').setAttribute('href',data.data.path);
					break;					
					default : break;
				}
				//console.log('HERE',data)
			}else if(data.status == 400){
				clearTimeout(batch.Polling);
				batch.batchState = 3;
				
			}
		}else if(type == 'cancel'){
			batch.batchState = 0;
		}
		//console.log(batch.batchState,nirvana.manage.batchDownload.batchState)
		if(data.status != 403){
			me._Render(batch.batchState);
		}
	},
	_CHECK : function(me){
		//console.log('check')
		if(!me){
			me = this;
		}
		fbs.batch.checkBatchDownload({
				//userid : nirvana.env.USER_ID,
				callback : function(data){
					//console.log(data)
					me._ChangeState('check',data);
				}
			});
	},
	_CANCEL : function(){
		//console.log('cancel')
		var me = this;
		fbs.batch.cancelBatchDownload({
				//userid : nirvana.env.USER_ID,
				callback : function(data){
					//console.log(data)
					me._ChangeState('cancel',data);
				}
			});
	},
	_ADD : function(){
		//console.log('add')
		var me = this;
		fbs.batch.addBatchDownload({
				//userid : nirvana.env.USER_ID,
				callback : function(data){
					//console.log(data)
					me._ChangeState('add',data);
				}
			});
	},
	onentercomplete : function(){
		var me = this , batch = nirvana.manage.batchDownload;
		me.Show_now = baidu.g(me.STATE_ID[batch.batchState]);
		//console.log(me.STATE_ID[batch.batchState],me.Show_now);
		//alert(0);
		baidu.dom.show(me.Show_now);
		if(batch.batchState == 2){
			baidu.g('batch_okdate').innerHTML=batch.OK_DATE;
			baidu.g('downloadBatchDownload').setAttribute('href',batch.OK_PATH);
		}
		var map = me._controlMap;
		map.disableBatchDownload.disable(true);
		map.AgainBatchDownload.main.onclick = function(){
			ui.Dialog.confirm({
				content: '将删除当前文档更新为\n最新版,请确认重新生成',
				title: '重新生成',
				onok: function(){
					me._ADD();
				},
				oncancel: function(){
				}
			})
		}
		map.AddBatchDownload.main.onclick = map.AgainBatchDownload2.main.onclick = function(){
			clearTimeout(batch.Polling);
			me._ADD();
			return false;
		}
		map.CheckBatchDownload.main.onclick = function(){
			clearTimeout(batch.Polling);
			me._CHECK();
			return false;
		}
		baidu.g('cancelBatchDownload').onclick = function(){
			clearTimeout(batch.Polling);
			me._CANCEL();
			return false;
		}
		if(batch.batchState == 1){
			me._CHECK();
		}
	}
	
}); 