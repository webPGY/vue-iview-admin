import axios from '@/axios/config';

export default {
    // 获取用户列表
    getUserList (params) {
        return axios.post('/userManagement', params);
    },
    // 根据用户名搜索用户
    findUserByUserName (params) {
        return axios.post('userManagement/getUserMangerSelect', params);
    },
    // 编辑用户信息
    updateUserInfo (params) {
        return axios.post('userManagement/getUserMangerUpdate', params);
    },
    // 超级节点api
    // 获取节点列表
    getSuperNodeList (params) {
        return axios.post('/superNode/getSuperNodeListPage', params);
    },
    // 添加节点列表
    addSuperNode (params) {
        return axios.post('/superNode/save', params);
    },
    // 添加节点列表
    updateSuperNode (params) {
        return axios.put('/superNode/update', params);
    },
    // 删除节点
    deleteSuperNode (params) {
        return axios.delete('/superNode/delete/' + params.id);
    }
}
