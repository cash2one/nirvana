/*
 * desc:    下载关键词
 * author:  zhujialu
 * date:    2012/1/12
 */

marketTrend.download = new er.Action({
	VIEW : 'downloadWords',
	
	//第一次render后执行
	onafterrender : function() {
		var	controlMap = this._controlMap,
            me = this;
		
		// 默认选择CSV
		controlMap.ContentFormatCSV.setChecked(true);

        // 下载
        controlMap.wordDownloadSubmit.onclick = function() {
            me.downloadFile(me.arg.fileid);
        };

        // 取消
        controlMap.wordDownloadCancel.onclick = function() {
            me.onclose();
		};
	},
	
	/**
	 * 下载报告文件
	 */
	downloadFile : function() {
		var arg = this.arg,
            format = this._controlMap.ContentFormatCSV.getGroup().getValue(),
            wordsList = arg.wordsList,
            timeMode = arg.timeMode,
            params = {format: format, wordsList: wordsList, timeMode: timeMode};
        
        var form = baidu.q('downloadWordsForm', this.arg.target)[0];
        form['userid'].value = nirvana.env.USER_ID;
        form['params'].value = baidu.json.stringify(params);
        
        form.submit();
        this.onclose();
	}
	
});
