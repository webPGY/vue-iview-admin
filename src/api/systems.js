import axios from '@/axios/config';

export default {
    // 获取菜单列表
    getMenuList () {
        return axios.get('/sysMenu/select');
    },
    // 添加菜单
    addMenus (params) {
        return axios.post('/sysMenu', params);
    },
    // 编辑菜单
    editMenus (params) {
        return axios.put('/sysMenu', params);
    },
    // 删除菜单
    deleteMenus (params) {
        return axios.delete('/sysMenu/' + params.id);
    },
    // 获取用户权限内的菜单列表
    getUserMenuList () {
        return axios.get('/sysMenu/nav');
    },
    // 获取邮箱后缀列表
    getMailsList () {
        return axios.get('/user');
    },
    // 新增邮箱后缀
    addEmails (params) {
        return axios.post('/user/getEmailModelAdd', params);
    },
    // 编辑邮箱后缀
    updateEmails (params) {
        return axios.put('/user/getEmailModelUpdate', params);
    },
    // 获取验证码列表
    getVerificationList (params) {
        return axios.post('/sendCode', params);
    },
    // 获取通道列表
    getChannelList () {
        return axios.get('/msg/getMsgSettingsList');
    },
    // 添加通道
    addChannel (params) {
        return axios.post('/msg/saveMsgSetting', params);
    },
    // 编辑通道
    updateChannel (params) {
        return axios.put('/msg/updateMsgSetting', params);
    }
}
