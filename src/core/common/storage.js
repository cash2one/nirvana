/**
 * 本地存储
 */
var FlashStorager = {
	_swfName : '',
	_swfFile : '',
	init : function(){
		if (this._swfName && baidu.g(this._swfName)){
			return;
		}
		this._swfName = "__FlashStorager";
		this._swfFile = "./asset/swf/flash_storager.swf?v=" + Math.random() + '.swf'; //Flash地址
		
		var flash = document.createElement('div');
		flash.id = '__FlashStoragerContainer';
		flash.style.position = 'absolute';
		flash.style.top = '5px';//document.documentElement.scrollTop + 20 + 'px';
		flash.style.left = '20px';//document.documentElement.scrollLeft + 20 + 'px';	
		flash.style.zIndex = 3000;
		flash.style.width = '1px';
		flash.style.height = '1px';
		//必须先插入dom节点再对节点赋值，否则在IE下flash版本低于10.1时将出现flash无法完成装载的情况
//		document.body.appendChild(flash);

//		flash.innerHTML = baidu.swf.createHTML({
//            id: this._swfName,
//            url: this._swfFile,
//            width: 1,
//            height: 1,
//			wmode : 'Opaque'
//        });
        // 确保document.body可用在执行DOM操作 by Huiyao: 2013.1.5
        var me = this;
        (function(){
            if(document.body) {
                document.body.insertBefore(flash, document.body.firstChild);
                flash.innerHTML = baidu.swf.createHTML({
                    id: me._swfName,
                    url: me._swfFile,
                    width: 1,
                    height: 1,
                    wmode : 'Opaque'
                });
            }
            else {
                setTimeout(arguments.callee, 15);
            }
        })();
	},
	//ff会莫名其妙丢失这个对象方法，丢失后重新创建flash by linzhifeng@baidu.com
    // 移除这个方法，修复IE9下flash存储失败，最新版FF也不存在丢失对象的问题，就暂时先不管这个了 by Huiyao: 2013.1.5
//	_sureExist : function(){
//	    if (+UEManager.flashVersion <= 1){  //不支持flash
//	        return;
//	    }
//		var fl = baidu.swf.getMovie(this._swfName);
//		if (!fl || !fl.read){
//            // 不 try 的话，这句在IE下会报错，影响本地调试的其他代码无法使用，又不敢删这句
//			try {
//				document[this._swfName] = null;
//			} catch (e) {};
//
//			var flash = baidu.g('__FlashStoragerContainer');
//			flash.innerHTML = '';
//			flash.innerHTML = baidu.swf.createHTML({
//	            id: this._swfName,
//	            url: this._swfFile,
//	            width: 1,
//	            height: 1,
//				wmode : 'Opaque'
//	        });
//		}
//	},
	get : function(key, callback){
	    if (+UEManager.flashVersion <= 1){  //不支持flash
            return callback && callback(undefined);
        }
//		this._sureExist(); // del by Huiyao: 2013.1.5
		return invokeFlash('__FlashStorager','read',['nirvana', key], callback);
	},
	set : function(key, value, callback){
	    if (+UEManager.flashVersion <= 1){  //不支持flash
            return false;
        }
//		this._sureExist(); // del by Huiyao: 2013.1.5
		return invokeFlash('__FlashStorager','write',['nirvana', key, value], callback);
	},
    /**
     * 确定FlashStore是否可用
     * @method isFlashStoreEnable
     * @return {Boolean} 
     */
    isEnable: function() {
        return this.set("___TEST_FLASH_STORAGE___", 1);
    }   		
}
FlashStorager.init();
