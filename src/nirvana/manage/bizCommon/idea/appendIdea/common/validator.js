/*
 * 
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * path:    root/nirvana/src/appendIdea/validator.js
 * desc:    附加创意的校验器对象
 * date:     2012-10
 * author:  peilonghui@baidu.com
 * depend:  
 *
 */


nirvana.appendIdea = nirvana.appendIdea || {};

/*if (!Object.create || Object.create.toString().search(/native code/i)<0) {
    Object.create = function(obj) {
        var Aux = function(){};
        baid
    }
}*/


(function(appendIdea) {

    var _getLength = function(str) {
            var len = 0,
                str_len = str.length;

            for (var i=0; i < str_len; i++) {
                if (str.charAt(i) > '~') {
                    len+=2
                } else {
                    len++;
                }
            }

            return len;
        },

        /**
         将字符串截断为某个长度

         @param {String} str 要截断的字符串
         @param {Number} len 截断后的长度

         @private
         @method _setLength
         @return {String}

        **/

        _setLength = function(str,len) {
            var tlen = str.length,
                _len=0, _arr=[];

            if (2*tlen < len) {
                return str;
            }

            for(var i=0; i<tlen; i++) {
                _len += _getLength(str[i]);
                if (_len <= len) {
                    _arr[i] = str[i];
                } else {
                    break;
                }
            }

            return _arr.join('');
        };


    var _trim = baidu.trim;


    appendIdea.validator = {

        /**
         字符串校验函数


        **/
        stringValidator: function(config) {

            var me = this;

            var str = _trim(config.validateString),
                max_len = config.maxLength,
                min_len = config.minLength,
                success = config.onSuccess,
                fail = config.onFail,
                do_cut = config.doCut;


            
            var    after_vali = config.afterValidator;


            var len = _getLength(str);

            if (len < min_len || ((len > max_len) && !do_cut)) {
                fail();
            } else if (len > max_len && do_cut) {
                str = _setLength(str, max_len);
            //    console.log(str);
                fail(str);
                success(0,str);
            } else {
                success(max_len-len, str);
                if (typeof after_vali == 'object' && after_vali.name) {
                    //after_vali.validatorString = str;
                    after_vali.config.validateString = str;
                    me[after_vali.name](after_vali.config);
                }
            }

        },

        urlValidator: function(config) {
            var str = _trim(config.validateString),
                fail = config.onFail,
                success = config.onSuccess,
                reg = /^https?:\/\//i;

            if (!reg.test(str) && str) {
                fail();
            } else {
                success();
                var after_vali = config.afterValidator;
                if (typeof after_vali == 'object' && after_vali.name) {
                    after_vali.config.validateString = str;

                    me[after_vali.name](after_vali.config);
                }
            }
                
        }
    }



})(nirvana.appendIdea);