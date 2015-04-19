/*
 * nirvana
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:    nirvana/copyright.js
 * desc:    涅槃版权信息
 * author:  wanghuijun
 * date:    $Date: 2010/12/24 $
 */
nirvana.copyright = {
	tplContent : ['<p>如有疑问，欢迎访问“<a href="http://defensor.baidu.com/userchk/policy" target="_blank" class="promotion-policy-link">百度推广政策中心</a>”，',
	              '我已阅读并接受 <a href="http://e.baidu.com/accept.html" target="_blank">《百度推广服务合同》</a></p>',
	              '<p>&copy;%y Baidu <a href="http://www.baidu.com/duty/" target="_blank">使用百度前必读</a></p>'],
	
	init : function() {
		var d = new Date(nirvana.env.SERVER_TIME * 1000),
            year = d.getFullYear();
		
		if(baidu.g('Foot')) {
			baidu.g('Foot').innerHTML = this.tplContent.join('').replace(/%y/, year);
		}
	}
};