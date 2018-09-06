import axios from '@/axios/config';

export default {
    // 获取用户列表
    getRoles () {
        return axios.get('/sysRole/getList');
    },
    // 新增角色
    addRoles (params) {
        return axios.post('/sysRole', params);
    },
    // 编辑角色
    editRoles (params) {
        return axios.put('/sysRole', params);
    },
    // 删除角色
    deleteRoles (params) {
        return axios.delete('/sysRole/' + params.id);
    },
    // 获取用户列表
    getUsers () {
        return axios.get('/sysUser');
    },
    // 新增用户
    addUsers (params) {
        return axios.post('/sysUser', params);
    },
    // 编辑用户
    editUsers (params) {
        return axios.put('/sysUser', params);
    },
    // 删除用户
    deleteUsers (params) {
        return axios.delete('/sysUser/' + params.id);
    },
    // 修改密码
    updatePwd (params) {
        return axios.post('/sysUser/updatePassword', params);
    },
    // 获取谷歌验证标识
    getGoogleSecret () {
        return axios.get('/sysUser/getGoogleSecret');
    }
}
