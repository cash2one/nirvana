
fbs = fbs || {};


/**
 * fbs.playback
 * 推广回放接口
 * @author huanghainan@baidu.com
 */
fbs.playback = {};

fbs.playback.getPlaybackAuth = fbs.interFace({
	
	path: fbs.config.path.GET_PLAYBACK_AUTH,
	
	necessaryParam: {
		//userid: 313 //用户id
	}
	
});