import Vue from 'vue';
import iView from 'iview';
import {router} from './router/index';
import {appRouter} from './router/router';
import store from './store';
import App from './app.vue';
import '@/locale';
import 'iview/dist/styles/iview.css';
import VueI18n from 'vue-i18n';
import util from './libs/util';
import Cookies from "js-cookie";
import api from '@/api/systems';
import VueClipboard from 'vue-clipboard2';

Vue.use(VueI18n);
Vue.use(iView);
Vue.use(VueClipboard);

new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App),
    data: {
        currentPageName: ''
    },
    mounted () {
        this.currentPageName = this.$route.name;
        // 显示打开的页面的列表
        this.$store.commit('setOpenedList');
        this.$store.commit('initCachepage');

        this.getAllUserMenus();
        // 权限菜单过滤相关
        this.$store.commit('updateMenulist');
        // iview-admin检查更新
        // util.checkUpdate(this);
    },
    created () {
        let tagsList = [];
        appRouter.map((item) => {
            if (item.children.length <= 1) {
                tagsList.push(item.children[0]);
            } else {
                tagsList.push(...item.children);
            }
        });
        this.$store.commit('setTagsList', tagsList);
    },
    methods: {
        getAllUserMenus () {
            if (window.location.href.indexOf('login') === -1 && Cookies.get('user')) {
                api.getUserMenuList().then((res) => {
                    if (res.data.code == 1) {
                        util.accessList(res.data.data.menuList);
                        this.$store.commit('updateMenulist');
                    } else {
                        appRouter.length = 0;
                        this.$store.commit('updateMenulist');
                    }
                });
            }
        }
    }
});
