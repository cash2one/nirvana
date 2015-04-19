/**
 * nirvana
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file   模块声明
 * @desc   由于模块的声明无法按需加载，所以统一在最开始进行模块声明
 * @author 王辉军(wanghuijun@baidu.com)
 * @date   2012/12/03
 */

/**
 * 手动版账户优化
 */
 var ao = new er.Module({
    config: {
        'action': [
            /**
             * 子项详情
             */
            // 账户预算
            {
                path : 'ao/widget1',
                action : 'manage.budget'
            },
            // 计划预算
            {
                path : 'ao/widget2',
                action : 'manage.budget'
            },
            // 推广时段 del by Huiyao: 时段修改不采用action触发 2013.1.5
//            {
//                path : 'ao/widget7',
//                action : 'manage.planSchedule'
//            },
            // 优化质量度
            {
                path : 'ao/widget3',
                action : 'ao.widget3'
            },
            // 首屏出价提示
            {
                path : 'ao/widget4',
                action : 'ao.widget4'
            },
            // 关键词推荐
            {
                path : 'ao/widget5',
                action : 'ToolsModule.kr'
            },
            // 关键词待激活
            {
                path : 'ao/widget8',
                action : 'ao.widget8'
            },
            // 关键词搜索无效
            {
                path : 'ao/widget9',
                action : 'ao.widget8'
            },
            // 关键词检索量过低
            {
                path : 'ao/widget10',
                action : 'ao.widget8'
            },
            // 关键词不宜推广
            {
                path : 'ao/widget11',
                action : 'ao.widget8'
            },
            // 关键词暂停推广
            {
                path : 'ao/widget12',
                action : 'ao.widget8'
            },  
            // 单元暂停推广
            {
                path : 'ao/widget13',
                action : 'ao.widget13'
            },
            // 计划暂停推广
            {
                path : 'ao/widget14',
                action : 'ao.widget14'
            },      
            // 创意没有生效
            {
                path : 'ao/widget15',
                action : 'ao.widget15'
            },      
            // 创意没有生效
            {
                path : 'ao/widget16',
                action : 'ao.widget15'
            },      
            // 创意没有生效
            {
                path : 'ao/widget17',
                action : 'ao.widget15'
            },
            // 展现概率
            {
                path : 'ao/widget18',
                action : 'ao.widget18'
            },
            // 展现概率
            {
                path : 'ao/widget19',
                action : 'ao.widget18'
            },
            // 无法连通
            {
                path : 'ao/widget20',
                action : 'ao.widget20'
            },
            // 连通速度优化
            {
                path : 'ao/widget21',
                action : 'ao.widget21'
            },
            // 跳出率
            {
                path : 'ao/widget22',
                action : 'ao.widget22'
            },
            // 展现概率选项设置
            {
                path : 'ao/option18',
                action : 'ao.option18'
            }
            
            // wanghuijun 2012.12.03
            // 效果突降下线
            /**
            // 效果突降增加
            // 匹配模式减小
            {
                path : 'ao/widget33',
                action : 'decrease.widget33'
            },
            // 自然检索量降低
            {
                path : 'ao/widget34',
                action : 'decrease.widget34'
            },
            // 计划被删除
            {
                path : 'ao/widget41',
                action : 'ao.widget14'
            },
            // 单元无生效创意
            {
                path : 'ao/widget42',
                action : 'decrease.widget42'
            },
            // 单元被删除
            {
                path : 'ao/widget43',
                action : 'ao.widget13'
            },
            // 关键词被删除
            {
                path : 'ao/widget44',
                action : 'ao.widget8'
            },
            // 排名下降
            {
                path : 'ao/widget45',
                action : 'decrease.widget45'
            },
            // 质量度下降
            {
                path : 'ao/widget47',
                action : 'decrease.widget46'
            }
            */
        ]
    }
});
/**
 * 市场风向标
 * @author mayue
 * @date 2013-01-14
 */
var marketTrend = new er.Module({
    config: {
        'action': [
            {
                path: '/overview/marketTrend',
                action: 'marketTrend.index'
            },
            {
                path: '/overview/marketTrend/download',
                action: 'marketTrend.download'
            }
        ]
    }
});
/**
 * 消息中心
 * @author peilonghui
 */
var messageModule = new er.Module({
    config: {
        'action': [
            {
                path: 'message/messageBox',
                action: 'msgcenter.messageBox'
            },
            {
                path: 'message/messagePlans',
                action: 'msgcenter.messagePlans'
            }
            
        ]
    }
});