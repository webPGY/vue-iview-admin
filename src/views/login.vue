<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
        <h3 class="login-hd"><img src="../images/login_logo.png" alt=""></h3>
        <div class="login-con">
            <p class="fm-top">登录</p>
            <div class="form-con">
                <Form ref="loginForm" :model="form" :rules="rules">
                    <FormItem prop="userName">
                        <Input v-model="form.userName" placeholder="请输入用户名" class="lg-ipt" autofocus></Input>
                    </FormItem>
                    <FormItem prop="password">
                        <Input type="password" v-model="form.password" placeholder="请输入密码" class="lg-ipt"></Input>
                    </FormItem>
                    <FormItem>
                        <Button @click="handleSubmit" type="primary" long class="login-btn">登录</Button>
                    </FormItem>
                </Form>
            </div>
        </div>
    </div>
</template>

<script>
import {appRouter} from '../router/router';
import util from '../libs/util';
import Cookies from 'js-cookie';
import api from '@/api/login';
import menuapi from '@/api/systems';

export default {
    data () {
        return {
            form: {
                userName: '',
                password: ''
            },
            rules: {
                userName: [
                    { required: true, message: '账号不能为空', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '密码不能为空', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        handleSubmit () {
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    this.handleLogin();
                    /* Cookies.set('user', this.form.userName);
                    Cookies.set('password', this.form.password);
                    this.$store.commit('setAvator', 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3448484253,3685836170&fm=27&gp=0.jpg');
                    if (this.form.userName === 'iview_admin') {
                        Cookies.set('access', 0);
                    } else {
                        Cookies.set('access', 1);
                    }
                    this.$router.push({
                        name: 'home_index'
                    }); */
                }
            });
        },
        handleLogin () {
            let params = this.form;
            api.submitLogin(params).then((res) => {
                if (res.data.code == '1') {
                    Cookies.set('user', this.form.userName);
                    // Cookies.set('password', this.form.password);
                    Cookies.set('access', 1); // 有权限值1
                    Cookies.set('token', res.data.token);

                    this.getAllUserMenus();
                }
            });
        },
        getAllUserMenus () {
            menuapi.getUserMenuList().then((res) => {
                if (res.data.code == 1) {
                    util.accessList(res.data.data.menuList);
                    this.$store.commit('updateMenulist');
                } else {
                    appRouter.length = 0;
                    this.$store.commit('updateMenulist');
                }
                util.goHome(this);
            });
        }
    }
};
</script>

<style>

</style>
