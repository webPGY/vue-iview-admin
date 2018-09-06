import axios from '@/axios/config';

export default {
    // 根据市场获取机器人
    getRobotsList (params) {
        return axios({
            method: 'get',
            url: '/robotconfig/getListByPage',
            params: params
        });
    },
    // 添加机器人
    addRobots (params) {
        return axios.post('/robotconfig/save', params);
    },
    // 编辑机器人
    updateRobots (params) {
        return axios.put('/robotconfig/update', params);
    },
    // 根据分区获取币种
    findCoinsByArea (params) {
        return axios({
            method: 'get',
            url: '/robotconfig/getCoinsByArea',
            params: params
        });
    }
}
