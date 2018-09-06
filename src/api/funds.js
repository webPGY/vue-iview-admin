import axios from '@/axios/config';

export default {
    // 获取指定用户的资金信息
    getFundsInfoByUser (params) {
        return axios.get('/fund/getPayUserByUserName/' + params.userName);
    },
    // 获取资金转账记录
    getFundsRecords (params) {
        return axios({
            headers: {'Content-Type': 'multipart/form-data'},
            method: 'post',
            url: '/fund/getTransferRecord',
            params: params
        });
    },
    // 资金转账
    fundTransfer (params) {
        return axios({
            headers: {'Content-Type': 'multipart/form-data'},
            method: 'post',
            url: '/fund/transfer/transfer',
            params: params
        });
    },
    // 获取上传的文件列表
    getFundsFiles (params) {
        return axios({
            headers: {'Content-Type': 'multipart/form-data'},
            method: 'post',
            url: '/fund/getFundTransferUpload',
            params: params
        });
    },
    // 添加上传文件
    transferFileUpload (params) {
        return axios({
            headers: {'Content-Type': 'multipart/form-data'},
            method: 'post',
            url: '/fund/transfer/upload',
            params: params
        });
    },
    // 获取已上传文件的内容
    getFilesTransferRecord (params) {
        return axios({
            headers: {'Content-Type': 'multipart/form-data'},
            method: 'post',
            url: '/fund/getFundTransferInfo',
            params: params
        });
    },
    // 批量转账
    transferBatch (params) {
        return axios({
            headers: {'Content-Type': 'multipart/form-data'},
            method: 'post',
            url: '/fund/transfer/batch',
            params: params
        });
    }
}
