/**
 * @author zhouyu01
 * 凤巢实验室的模块
 */


var fclab = new er.Module({
    config: {
        'action': [
            {
                path: '/fclab/index',
                action: 'ToolsModule.advance'
            },
			{
				path: 'fclab/feedback',
                action: 'fclab.feedback'
			},
			{
				path: 'fclab/abtest/create',
                action: 'fclab.abtest.create'
			},
			{
				path: 'fclab/abtest/mtllist',
                action: 'fclab.abtest.mtllist'
			},
            // cpa相关逻辑
            {
                // 添加计划（弹出层形式）
                path: 'fclab/cpa/addcpa',
                action: 'fclab.cpa.addCpaAction'
            },
            // cpa计划列表中修改出价
            {
                path: 'fclab/cpa/editbid',
                action: 'fclab.cpa.editBid'
            },
            // cpa历史删除记录
            {
                path: 'fclab/cpa/delHistory',
                action: 'fclab.cpa.delHistory'
            }
        ]
    }
   
});
