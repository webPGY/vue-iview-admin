import axios from '@/axios/config';

export default {
    // 获取banner
    getBanners (params) {
        return axios.get('/banners/getBannerListByTypes/type/' + params.type + '/forType/' + params.forType);
    },
    // 提交banner
    addBanner (params) {
        return axios.post('/banners', params);
    },
    // 编辑banner
    editBanner (params) {
        return axios.put('/banners', params);
    },
    // 编辑banner
    deleteBanner (params) {
        return axios.delete('/banners/' + params.id);
    }
}
