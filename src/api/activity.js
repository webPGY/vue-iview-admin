import axios from '@/axios/config';

export default {
    // 获取活动列表
    getActivitiesList () {
        return axios.get('/activity');
    },
    // 筛选活动列表
    filterActivitiesList (params) {
        return axios.post('/activity/getActivitySettingByConditions', params);
    },
    // 获取赠送币种
    findFundsList () {
        return axios.get('/activity/getAllFundsType');
    },
    // 添加活动
    addActivities (params) {
        return axios.post('/activity/saveActivitySetting', params);
    },
    // 编辑更新活动
    updateActivities (params) {
        return axios.put('/activity/updateActivitySetting', params);
    }
}
