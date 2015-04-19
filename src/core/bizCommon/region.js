/**
 * 地域相关的通用逻辑
 * @author zhujialu
 * @update 2012/10/24
 */
fc.common.Region = function() {

    var 
    regionsByName = {
        '中国地区': {
            '华北地区': [{ '1': '北京' }, { '3': '天津' }, { '13': '河北' }, { '22': '内蒙古' }, { '26': '山西' }],
            '东北地区': [{ '15': '黑龙江' }, { '18': '吉林' }, { '21': '辽宁' }],
            '华东地区': [{ '2': '上海' }, { '5': '福建' }, { '9': '安徽' }, { '19': '江苏' }, 
                         { '20': '江西' }, { '25': '山东' }, { '32': '浙江' }],
            '华中地区': [{ '14': '河南' }, { '16': '湖北' }, { '17': '湖南' }],
            '华南地区': [{ '4': '广东' }, { '8': '海南' }, { '12': '广西' }],
            '西南地区': [{ '10': '贵州' }, { '28': '四川' }, { '29': '西藏' }, { '31': '云南' }, { '33': '重庆' }],
            '西北地区': [{ '11': '甘肃' }, { '23': '宁夏' }, { '24': '青海' }, { '27': '陕西' }, { '30': '新疆' }],
            '其他地区': [{ '34': '香港' }, { '35': '台湾' }, { '36': '澳门' }]
        },
        '国外': [{ '7': '日本' }, { '37': '其他国家' }]
    },
    regionsById = {};
    
    function iterate(obj) {
        fc.each(obj, function(value, key) {
            // 数字都写成字符串，这样可以和数组的索引区别开
            if (typeof key === 'string' && isFinite(+key)) {
                regionsById[key] = obj[key];
            } else {
                iterate(value);
            }
        });
    }
    // 初始化 regionsById
    iterate(regionsByName);

    return {
        /**
         * 地域总个数
         * @property {Number} SIZE
         */
        SIZE: fc.keys(regionsById).length,

        /**
         * 地域的 id 集合
         * @property {Array} IDS
         */
        IDS: fc.keys(regionsById),

        // 这个会用到需要地域选择器组件上，其他地方慎用
        REGIONS_BY_NAME: regionsByName,

        // 通过 ID 取字面
        REGIONS_BY_ID: regionsById,

        /**
         * 获得地域列表的完整文本和缩写文本
         * @method getText
         * @param {Array} list
         * @param {String} type
         * @return {Object}
         */
        getText: function(list, type) {
            // [TODO] 这里和 manage.js 耦合了
            return nirvana.manage.region.abbRegion(list, type);
        },

        /**
         * 获得某个计划层级的地域
         * @method getRegionByPlan
         * @param {String|Number} planid
         * @param {Function} callback 参数是 {Array} regions
         */
        getRegionByPlan: function(planid, callback) {
            fbs.plan.getInfo({
                condition: {
                    planid: [planid]
                },
                onSuccess: function(json) {
                    var data = json.data.listData[0],
                        wregion = data['wregion'] == '' ? [] : data['wregion'].split(',');
                    
                    if (wregion.length === 0) {
                        fc.common.Region.getRegionByAccount(callback);
                    } else {
                        callback && callback(wregion);
                    }
                }
            });
        },

        /**
         * 获得账户层级的地域
         * @method getRegionByAccount
         * @param {Function} callback 参数是 {Array} regions
         */
        getRegionByAccount: function(callback) {
            fbs.account.getInfo({
                onSuccess : function(json) {
                    var data = json.data.listData[0],
                        wregion = data['wregion'] == '' ? [] : data['wregion'].split(',');

                    callback && callback(wregion);
                }
            });
        }
    }
}();
