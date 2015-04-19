/*
*批量下载接口
*@author liuyutong@baidu.com 2011-8-2
*/
fbs = fbs || {};

fbs.batch = {};

//生成批量下载文件
fbs.batch.addBatchDownload = fbs.interFace({
	path: fbs.config.path.ADD_BATCHDOWNLOAD,
	necessaryParam: {
		
	}
});
//检测批量下载状态
fbs.batch.checkBatchDownload = fbs.interFace({
	path: fbs.config.path.CHECK_BATCHDOWNLOAD,
	necessaryParam: {
		
	}
});
//取消批量下载
fbs.batch.cancelBatchDownload = fbs.interFace({
	path: fbs.config.path.DEL_BATCHDOWNLOAD,
	necessaryParam: {
		
	}
});