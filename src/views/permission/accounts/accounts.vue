<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'accounts.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <div class="search-out">
                    <Input v-model="searchVal" size="small" placeholder="搜索用户名" clearable></Input>
                </div>
                <Button type="primary" size="small" icon="ios-search">搜索</Button>
                <Button type="info" size="small" class="add_account" icon="plus-round" @click="showEditModal(null, 0)">添加账户</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="filterData"></Table>
        <Modal v-model="modalStatus" :title="modalTitle" width="500" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="110" :rules="ruleValidate">
                <FormItem label="用户名" prop="username">
                    <Input v-model="formItem.username" placeholder="请输入用户名"></Input>
                </FormItem>
                <FormItem label="手机号" prop="mobile">
                    <Input v-model="formItem.mobile" placeholder="请输入手机号"></Input>
                </FormItem>
                <FormItem label="邮箱" prop="email">
                    <Input v-model="formItem.email" placeholder="请输入邮箱"></Input>
                </FormItem>
                <FormItem label="密码" prop="password" v-if="editType == 0">
                    <Input type="password" v-model="formItem.password" autocomplete="off" placeholder="请输入密码"></Input>
                </FormItem>
                <FormItem label="确认密码" prop="confirmPassword" v-if="editType == 0">
                    <Input type="password" v-model="formItem.confirmPassword" autocomplete="off" placeholder="请再次输入密码"></Input>
                </FormItem>
                <FormItem label="用户状态" prop="status">
                    <i-switch size="large" v-model="formItem.status" :true-value="1" :false-value="0">
                        <span slot="open">开启</span>
                        <span slot="close">禁用</span>
                    </i-switch>
                </FormItem>
                <FormItem label="用户角色" prop="roleId">
                    <Select v-model="formItem.roleId" style="width:200px" placeholder="请选择角色">
                        <Option v-for="item in selectList" :value="item.id+''" :key="item.id">{{ item.name }}</Option>
                    </Select>
                </FormItem>
                <template v-if="editType === 0">
                    <FormItem label="谷歌验证状态" prop="googleStatus">
                        <i-switch size="large" v-model="formItem.googleStatus" :true-value="1" :false-value="0">
                            <span slot="open">开启</span>
                            <span slot="close">关闭</span>
                        </i-switch>
                    </FormItem>
                    <FormItem label="谷歌验证标识" prop="secret" v-if="formItem.googleStatus === 1">
                        <div class="qrcode-box">
                            <img :src="qrcodeUrl" alt="" width="150" height="150" style="display: block;">
                        </div>
                        <Input v-model="formItem.secret" placeholder="谷歌验证标识" readonly style="width: 200px;"></Input>
                        <Button type="dashed" size="small" @click="getGoogleStr" style="padding: 5px 10px; margin-left: 10px;">刷新</Button>
                    </FormItem>
                    <FormItem label="谷歌验证码" prop="code" v-if="formItem.googleStatus === 1">
                        <Input v-model="formItem.code" placeholder="请输入谷歌验证码" style="width: 200px;"></Input>
                    </FormItem>
                </template>
                <template v-if="editType === 1">
                    <FormItem label="谷歌验证状态">
                        <Button type="text" size="small" shape="circle">{{formItem.googleStatus === 0 ? '已关闭' : '已开启'}}</Button>
                        <template v-if="googleOriginStatus === 0">
                            <Button type="primary" size="small" style="margin-left: 20px; margin-right: 5px;" @click="editGoogle">{{googleEditStatus === 0 ? '开启' : '关闭'}}</Button>
                        </template>
                        <template v-if="googleOriginStatus === 1">
                            <Button type="primary" size="small" @click="toggleGoogle" style="margin-left: 20px; margin-right: 5px;">{{formItem.googleStatus === 0 ? '开启' : '关闭'}}</Button>
                            <Button type="warning" size="small" v-if="formItem.googleStatus === 1" @click="updateGoogle">{{googleEditStatus === 0 ? '修改' : '取消修改'}}</Button>
                        </template>
                    </FormItem>
                    <FormItem label="谷歌验证标识" prop="secret" v-if="googleEditStatus === 1">
                        <div class="qrcode-box">
                            <img :src="qrcodeUrl" alt="" width="150" height="150" style="display: block;">
                        </div>
                        <Input v-model="formItem.secret" placeholder="谷歌验证标识" readonly style="width: 200px;"></Input>
                        <Button type="dashed" size="small" @click="getGoogleStr" style="padding: 5px 10px; margin-left: 10px;">刷新</Button>
                    </FormItem>
                    <FormItem label="谷歌验证码" prop="code" v-if="googleEditStatus === 1">
                        <Input v-model="formItem.code" placeholder="请输入谷歌验证码" style="width: 200px;"></Input>
                    </FormItem>
                </template>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="handleSubmit">确定</Button>
            </div>
        </Modal>
        <Modal v-model="modalStatusPwd" title="修改密码" width="500" @on-cancel="handleResetPwd">
            <Form ref="formItemPwd" :model="formItemPwd" :label-width="90" :rules="ruleValidatePwd">
                <FormItem label="原始密码" prop="password">
                    <Input v-model="formItemPwd.password" type="password" placeholder="请输入原始密码"></Input>
                </FormItem>
                <FormItem label="新密码" prop="newPassword">
                    <Input v-model="formItemPwd.newPassword" type="password" placeholder="请输入新密码"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetPwd">取消</Button>
                <Button type="primary" size="large" @click="handleSubmitPwd">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/permission'
    import axios from '@/axios/config'
    import QRCode from 'qrcode'


    export default {
        name: 'accounts',
        data () {
            const validatorPwd = (rule, value, callback) => {
                if (value === '') {
                    callback();
                } else {
                    if (!(this.formItem.confirmPassword === this.formItem.password)) {
                        callback(new Error('两次输入密码不一致'));
                    }
                    callback();
                }
            };
            const number = (rule, value, callback) => {
                if (isNaN(value)) {
                    callback(new Error('格式不正确，必须为数字'));
                }
                callback();
            };
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '用户名',
                        key: 'username'
                    },
                    {
                        title: '手机号',
                        key: 'mobile'
                    },
                    {
                        title: '邮箱',
                        key: 'email'
                    },
                    {
                        title: '状态',
                        key: 'status',
                        render: (h, params) => {
                            return h('span', params.row.status == '1' ? '可用' : '不可用');
                        }
                    },
                    {
                        title: '创建时间',
                        key: 'createTime',
                        render: (h, params) => {
                            return h('span', params.row.createTime ? params.row.createTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '操作',
                        render: (h, params) => {
                            return h('div', {
                                style: {
                                    paddingBottom: '5px'
                                }
                            }, [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.showEditModal(params.row, 1);
                                        }
                                    }
                                }, '编辑'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.deleteTip(params.row);
                                        }
                                    }
                                }, '删除'),
                                h('Button', {
                                    props: {
                                        type: 'success',
                                        size: 'small'
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.editModal(params.row);
                                        }
                                    }
                                }, '修改密码')
                            ]);
                        }
                    }
                ],
                tableData: [],
                searchVal: '',
                modalStatus: false,
                modalTitle: '添加',
                // confirmPassword: '',
                formItem: {
                    id: '',
                    username: '',
                    mobile: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    status: 1,
                    roleId: '',
                    secret: '',
                    code: '',
                    googleStatus: 1 // 默认开启谷歌验证
                },
                qrcodeUrl: '', // 谷歌二维码链接
                ruleValidate: {
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    mobile: [
                        {required: false, message: '请输入手机号', trigger: 'blur'}
                    ],
                    email: [
                        {required: false, message: '请输入邮箱', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ],
                    confirmPassword: [
                        {required: true, message: '请再次输入密码', trigger: 'blur'},
                        {validator: validatorPwd, trigger: 'blur'}
                    ],
                    roleId: [
                        {required: true, message: '请选择用户角色', trigger: 'change'}
                    ],
                    code: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                formItemPwd: {
                    id: '',
                    password: '',
                    newPassword: ''
                },
                ruleValidatePwd: {
                    password: [
                        {required: true, message: '请输入原始密码', trigger: 'blur'}
                    ],
                    newPassword: [
                        {required: true, message: '请输入新密码', trigger: 'blur'}
                    ]
                },
                selectList: [],
                editType: 0, // 编辑类型 0添加 1编辑
                googleEditStatus: 0, // 谷歌验证码修改状态 0不是 1是
                googleOriginStatus: 0, // 谷歌原始状态 0关闭 1开启
                pageNum: 1,
                pageSize: 20,
                total: 0, // 总页数
                sizeOpts: [10, 20, 50, 100],
                modalStatusPwd: false
            };
        },
        watch: {
            'formItem.googleStatus' (val, oldVal) {
                if (val === 0) {
                    this.formItem.secret = '';
                    this.formItem.code = '';
                    this.qrcodeUrl = '';
                } else if (val === 1) {
                    // 模态框打开状态
                    if (this.modalStatus) {
                        // 重新获取
                        this.getGoogleStr();
                    }
                }
            }
        },
        computed: {
            // 过滤数据
            filterData () {
                let value = this.searchVal;
                if (value) {
                    return this.tableData.filter((item) => {
                        // 大小写都匹配
                        return item.username.indexOf(value) > -1;
                    });
                } else {
                    return this.tableData;
                }
            }
        },
        methods: {
            editGoogle () {
                this.googleEditStatus = this.googleEditStatus === 0 ? 1 : 0;

                if (this.googleEditStatus === 1) {
                    this.formItem.googleStatus = 1;

                    this.getGoogleStr();
                } else {
                    this.formItem.googleStatus = 0;

                    this.formItem.secret = '';
                    this.formItem.code = '';
                    this.qrcodeUrl = '';
                }
            },
            toggleGoogle () {
                // 开启关闭
                this.formItem.googleStatus = this.formItem.googleStatus === 0 ? 1 : 0;
                // 关闭的同时 关闭修改状态
                if (this.formItem.googleStatus === 0) {
                    this.googleEditStatus = 0;
                }
            },
            updateGoogle () {
                this.googleEditStatus = this.googleEditStatus === 0 ? 1 : 0;

                if (this.googleEditStatus === 1) {
                    this.getGoogleStr();
                } else {
                    this.formItem.secret = '';
                    this.formItem.code = '';
                    this.qrcodeUrl = '';
                }
            },
            handleSubmit () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        this.submitRequest();
                    }
                });
            },
            handleReset () {
                // resetFields表单重置方法有点问题
                // this.$refs.formItem.resetFields();
                this.modalStatus = false;

                this.formItem.id = '';
                this.formItem.username = '';
                this.formItem.mobile = '';
                this.formItem.email = '';
                this.formItem.password = '';
                this.formItem.confirmPassword = '';
                this.formItem.roleId = '';
                this.formItem.status = 1;
                this.formItem.googleStatus = 1;
                this.formItem.secret = '';
                this.formItem.code = '';

                // 关闭 清空谷歌验证部分
                this.qrcodeUrl = '';
                this.googleEditStatus = 0;
            },
            submitRequest () {
                let params = {
                }

                let obj = Object.assign(params, this.formItem);

                if (this.editType == 0) {
                    api.addUsers(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('添加成功');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else if (this.editType == 1) {
                    api.editUsers(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('编辑成功');
                            this.handleReset();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                }
            },
            getListData () {
                api.getUsers().then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data;
                    }
                });
            },
            getRolesData () {
                api.getRoles().then((res) => {
                    if (res.data.code == 1) {
                        this.selectList = res.data.data;
                    }
                });
            },
            deleteTip (item) {
                this.$Modal.confirm({
                    title: '提示',
                    content: '确认删除 ' + item.username + ' ？',
                    onOk: () => {
                        this.deleteRequest(item);
                    }
                });
            },
            deleteRequest (item) {
                let params = {
                    id: item.id
                }
                api.deleteUsers(params).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('删除成功');
                        // 提交成功重新获取
                        this.getListData();
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '添加用户';

                    // 添加
                    this.setFormItem();

                    // 打开
                    this.getGoogleStr();
                } else if (type == 1) {
                    this.modalTitle = '编辑用户';

                    // 赋值表单
                    this.setFormItem(currRow);
                }
                this.modalStatus = true;
            },
            setFormItem (row) {
                if (row) {
                    this.formItem.id = row.id;
                    this.formItem.username = row.username;
                    this.formItem.mobile = row.mobile;
                    this.formItem.email = row.email;
                    this.formItem.password = row.password;
                    this.formItem.status = row.status;
                    this.formItem.roleId = row.roleId ? row.roleId + '' : '';
                    this.formItem.googleStatus = row.googleStatus;

                    // 保存原始谷歌认证状态
                    this.googleOriginStatus = row.googleStatus;
                }
            },
            setFormItemPwd (row) {
                if (row) {
                    this.formItemPwd.id = row.id;
                }
            },
            editModal (currRow) {
                // 赋值表单
                this.setFormItemPwd(currRow);

                this.modalStatusPwd = true;
            },
            handleSubmitPwd () {
                this.$refs.formItemPwd.validate((valid) => {
                    if (valid) {
                        this.submitRequestPwd();
                    }
                });
            },
            handleResetPwd () {
                this.formItemPwd.id = '';
                this.$refs.formItemPwd.resetFields();
                this.modalStatusPwd = false;
            },
            submitRequestPwd () {
                let params = {
                }
                let obj = Object.assign(params, this.formItemPwd);

                api.updatePwd(obj).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('修改密码成功');
                        this.handleResetPwd();
                    }
                });
            },
            // 获取谷歌认证标识
            getGoogleStr () {
                api.getGoogleSecret().then((res) => {
                    if (res.data.code == 1) {
                        this.formItem.secret = res.data.data.split('=')[1];
                        this.generateQrCode(res.data.data);
                    }
                });
            },
            generateQrCode (text) {
                QRCode.toDataURL(text).then(url => {
                    // console.log(url);
                    this.qrcodeUrl = url;
                }).catch(err => {
                    console.error(err);
                    this.qrcodeUrl = '';
                });
            }
        },
        created () {
            this.getListData();
            // 获取角色列表
            this.getRolesData();
        },
        mounted () {
        }
    };
</script>
