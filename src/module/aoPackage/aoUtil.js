/**
 * nirvana Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @description 包通用工具函数 
 * @author LeoWang(wangkemiao@baidu.com)
 */

nirvana.aoUtil = {
	/**
	 * @description 新建一个类，基础的类，构造函数是init
	 */
	createClass : function(extraOpts){
		var _class = function(){
			this.init.apply(this, arguments);
		};
		_class.prototype.init = new Function;
		if(extraOpts){
			baidu.extend(_class.prototype, extraOpts);
		}
		// 定义别名
		_class.fn = _class.prototype;
		return _class;
	},

	/**
	 * @description 从父类继承出新类，并使用extraOpts进行修改配置
	 *
	 * @param {Class} parent 父类实例，如果不传，就变成一个单纯的新类，相当于调用createClass方法生成新类
	 * @param {Object} extraOpts 扩展属性及方法
	 */
	extendClass : function(parent, extraOpts){
		function object(o){
			function F(){};
			F.prototype = o;
			return new F();
		}

		if(!parent){
			return nirvana.aoUtil.createClass(extraOpts);
		}

		var _subclass = function(){
			if(parent){
				parent.apply(this, arguments);
			}
			this.init.apply(this, arguments);
		};
				
		var prototype = object(parent.prototype);
		prototype.constructor = _subclass;
		
		if(extraOpts){
			baidu.extend(prototype, extraOpts);
		}
		
		_subclass.prototype = prototype;


		// 定义别名
		_subclass.fn = _subclass.prototype;
		_subclass._super = prototype;
		_subclass.prototype.init = function(){
			var me = this;
			parent.prototype.init.apply(me, arguments);
		};
		
		return _subclass;
	},
	/*
	extendClass : function(subType, superType, extraOpts){
		function object(o){
			function F(){};
			F.prototype = o;
			return new F();
		}
		var prototype = object(superType.prototype);		// 创建对象
		prototype.constructor = subType;					// 增强对象
		var newp = baidu.object.extend(prototype, extraOpts);
		subType.prototype = newp;							// 指定对象
	},
	*/
	aop : {
		// before : function(context, targetName, fn){
		// 	var target = context[targetName];
		// 	if(fn){
		// 		context[targetName] = function(){
		// 			return target.apply(context, fn.apply(context, arguments));
		// 		};
		// 	}
		// },
		// after : function(context, targetName, fn){
		// 	var target = context[targetName];
		// 	if(fn && target){
		// 		context[targetName] = function(){
		// 			return fn.apply(context, target.apply(context, arguments));
		// 		};
		// 	}
		// },
		/**
		 * 使用aop注入的方式注入前置、后置响应函数
		 * 例如对nirvana.aoPackage.init，传入参数(nirvana.aoPackage, 'init')，会自动去生成函数
		 * 调用之后生成的函数，先去调用onbeforeinit，再调用init，然后去调用onafterinit
		 * 支持传入数组
		 *
		 * @param {Object} context 环境
		 * @param {Array|String} 目标函数，可以是字符串数组或者字符串
		 */
		inject : function(context, targetName){
			var me = this, i = 0, l, newName;
			if(targetName instanceof String){
				targetName = [targetName];
			}
			if(targetName instanceof Array){
				for(i = 0, l = targetName.length; i < l; i++){
					newName = targetName[i].charAt(0).toUpperCase() + targetName[i].substring(1);
					me.before(context, targetName[i], context['onbefore' + newName]);
					me.after(context, targetName[i], context['onafter' + newName]);
				}
			}
		},
		before : function(context, targetName, fn){
			var target = context[targetName];
			if('function' != typeof target || 'function' != typeof fn){
				return;
			}
			var old = context[targetName];
			context[targetName] = function(){
				fn.apply(context, arguments);
				return old.apply(context, arguments);
			};
		},
		after : function(context, targetName, fn){
			var target = context[targetName];
			if('function' != typeof target || 'function' != typeof fn){
				return;
			}
			var old = context[targetName];
			context[targetName] = function(){
				var args = old.apply(context, arguments);
				return fn.apply(context, arguments);
			};
		}
	}
};