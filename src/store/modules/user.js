import Cookies from 'js-cookie';
import api from '@/api/login'

const user = {
    state: {},
    mutations: {
        logout (state, vm) {
            api.loginOut().then((res) => {
                if (res.data.code == '1') {
                    Cookies.remove('user');
                    Cookies.remove('password');
                    Cookies.remove('access');
                    Cookies.remove('token');
                    // 恢复默认样式
                    let themeLink = document.querySelector('link[name="theme"]');
                    themeLink.setAttribute('href', '');
                    // 清空打开的页面等数据，但是保存主题数据
                    let theme = '';
                    if (localStorage.theme) {
                        theme = localStorage.theme;
                    }
                    localStorage.clear();
                    if (theme) {
                        localStorage.theme = theme;
                    }
                    vm.$store.commit('clearOpenedSubmenu');
                    // 清除所有标签
                    vm.$store.commit('clearAllTags');
                    vm.$router.push({
                        name: 'login'
                    });
                }
            });
        }
    }
};

export default user;
