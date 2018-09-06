import axios from '@/axios/config';

export default {
    // 登录
    submitLogin (params) {
        return axios.post('/logins/sys/login', params);
    },
    // 登录
    loginOut () {
        return axios.get('/logins/logout');
    }
}
