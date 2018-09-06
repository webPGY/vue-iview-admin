<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'users.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>用户名：</span>
                <div class="search-out">
                    <Input v-model="searchVal" placeholder="搜索用户名" clearable></Input>
                </div>
                <span style="margin-left: 15px;">冻结状态：</span>
                <div class="search-out">
                    <Select v-model="freezStatus">
                        <Option v-for="item in freezList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </div>
                <Button type="primary" icon="ios-search" @click="findUsers" style="margin-left: 5px;">搜索</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <div style="position: relative;">
            <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        </div>
        <Modal v-model="modalStatusRecommend" :title="modalTitle" width="500" @on-cancel="handleResetRecommend">
            <Form ref="formItemRecommend" :model="formItemRecommend" :label-width="120" :rules="ruleValidateRecommend" @keydown.native.enter.prevent>
                <FormItem label="推荐人用户名" prop="recommendName">
                    <Input v-model="formItemRecommend.recommendName" placeholder="请输入推荐人用户名"></Input>
                </FormItem>
                <FormItem label="谷歌验证码" prop="googleCode">
                    <Input v-model="formItemRecommend.googleCode" :maxlength="6" placeholder="请输入谷歌验证码"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetRecommend">取消</Button>
                <Button type="primary" size="large" @click="handleSubmitRecommend">确定</Button>
            </div>
        </Modal>
        <Modal v-model="modalStatusFreeze" :title="modalTitle" width="500" @on-cancel="handleResetFreeze" :mask-closable="false">
            <Form ref="formItemFreeze" :model="formItemFreeze" :label-width="90" :rules="ruleValidateFreeze">
                <FormItem label="谷歌验证码" prop="googleCode">
                    <Input v-model="formItemFreeze.googleCode" :maxlength="6" placeholder="请输入谷歌验证码"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetFreeze">取消</Button>
                <Button type="primary" size="large" @click="handleSubmitFreeze">确定</Button>
            </div>
        </Modal>
        <Modal v-model="modalStatusVip" :title="modalTitle" width="500" @on-cancel="handleResetVip" :mask-closable="false">
            <Form ref="formItemVip" :model="formItemVip" :label-width="90" :rules="ruleValidateVip">
                <FormItem label="用户名">
                    <span>{{formItemVip.userName || '-'}}</span>
                </FormItem>
                <FormItem label="vip等级" prop="vip">
                    <Select v-model="formItemVip.vip" style="width:200px" placeholder="请选择VIP等级">
                        <Option v-for="item in vipList" :value="item.value + ''" :key="item.value">VIP_{{ item.value }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="谷歌验证码" prop="googleCode">
                    <Input v-model="formItemVip.googleCode" :maxlength="6" placeholder="请输入谷歌验证码"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetVip">取消</Button>
                <Button type="primary" size="large" @click="handleSubmitVip">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/users'
    import googleApi from '@/api/google'
    import axios from '@/axios/config'

    export default {
        name: 'users',
        data () {
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
                        key: 'userName'
                    },
                    {
                        title: '账户昵称',
                        key: 'nick'
                    },
                    {
                        title: '手机号',
                        key: 'safeMobile'
                    },
                    {
                        title: '邮箱',
                        key: 'safeEmail'
                    },
                    {
                        title: '推荐人',
                        key: 'recommendName',
                        render: (h, params) => {
                            return h('span', params.row.recommendName ? params.row.recommendName : '-');
                        }
                    },
                    {
                        title: 'VIP等级',
                        key: 'vipRate'
                    },
                    {
                        title: '冻结状态',
                        key: 'freez',
                        render: (h, params) => {
                            return h('span', params.row.freez ? '已冻结' : '正常');
                        }
                    },
                    {
                        title: '登录IP',
                        key: 'previousLoginIp'
                    },
                    {
                        title: '注册时间',
                        key: 'registerTime',
                        render: (h, params) => {
                            return h('span', params.row.registerTime ? params.row.registerTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '最后登录时间',
                        key: 'lastLoginTime',
                        render: (h, params) => {
                            return h('span', params.row.lastLoginTime ? params.row.lastLoginTime.split('.')[0] : '');
                        }
                    },
                    {
                        width: 255,
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
                                }, '修改推荐人'),
                                h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                        disabled: params.row.status == 0
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.showEditModal(params.row, 2);
                                        }
                                    }
                                }, '设置VIP等级'),
                                h('Button', {
                                    props: {
                                        type: params.row.freez ? 'success' : 'error',
                                        size: 'small'
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.showEditModal(params.row, 3);
                                        }
                                    }
                                }, params.row.freez ? '解冻' : '冻结')
                            ]);
                        }
                    }
                ],
                vipList: [
                    {
                        value: 0
                    },
                    {
                        value: 10
                    }
                ],
                freezList: [
                    {
                        label: '全部',
                        value: ''
                    },
                    {
                        label: '已冻结',
                        value: 1
                    },
                    {
                        label: '未冻结',
                        value: 0
                    }
                ],
                freezStatus: '',
                tableData: [],
                searchVal: '',
                modalStatusVip: false,
                modalStatusFreeze: false,
                modalStatusRecommend: false,
                modalTitle: '添加',
                formItemVip: {
                    id: '',
                    userName: '',
                    vip: '',
                    googleCode: ''
                },
                ruleValidateVip: {
                    vip: [
                        {required: true, message: '请选择VIP等级', trigger: 'blur'}
                    ],
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                formItemFreeze: {
                    id: '',
                    freez: '',
                    googleCode: ''
                },
                ruleValidateFreeze: {
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                formItemRecommend: {
                    id: '',
                    recommendName: '',
                    googleCode: ''
                },
                ruleValidateRecommend: {
                    recommendName: [
                        {required: true, message: '请输入推荐人用户名', trigger: 'blur'}
                    ],
                    googleCode: [
                        {required: true, len: 6, message: '请输入6位数字的谷歌验证码', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ]
                },
                editType: 0, // 编辑类型 1编辑推荐人 2设置VIP等级 3冻结解冻
                pageNum: 1,
                pageSize: 20,
                total: 0, // 总页数
                sizeOpts: [10, 20, 50, 100]
            };
        },
        watch: {
        },
        computed: {
        },
        methods: {
            handleSubmitVip () {
                this.$refs.formItemVip.validate((valid) => {
                    if (valid) {
                        this.submitRequest();
                    }
                });
            },
            handleResetVip () {
                this.$refs.formItemVip.resetFields();
                this.formItemVip.id = '';
                this.formItemVip.userName = '';
                this.formItemVip.vip = '';
                this.formItemVip.googleCode = '';
                this.modalStatusVip = false;
            },
            handleSubmitFreeze () {
                this.$refs.formItemFreeze.validate((valid) => {
                    if (valid) {
                        this.submitRequest();
                    }
                });
            },
            handleResetFreeze () {
                this.$refs.formItemFreeze.resetFields();
                this.formItemFreeze.id = '';
                this.formItemFreeze.freez = '';
                this.formItemFreeze.googleCode = '';
                this.modalStatusFreeze = false;
            },
            handleSubmitRecommend () {
                this.$refs.formItemRecommend.validate((valid) => {
                    if (valid) {
                        this.submitRequest();
                    }
                });
            },
            handleResetRecommend () {
                this.$refs.formItemRecommend.resetFields();
                this.formItemRecommend.id = '';
                this.formItemRecommend.recommendName = '';
                this.formItemRecommend.googleCode = '';
                this.modalStatusRecommend = false;
            },
            submitRequest () {
                let obj = {
                }
                let googleCode = '';
                if (this.editType == 1) {
                    obj.id = this.formItemRecommend.id;
                    obj.dbObject = 'recommendName';
                    obj.newObject = this.formItemRecommend.recommendName;
                    googleCode = this.formItemRecommend.googleCode;
                } else if (this.editType == 2) {
                    obj.id = this.formItemVip.id;
                    obj.dbObject = 'vipRate';
                    obj.newObject = this.formItemVip.vip;
                    googleCode = this.formItemVip.googleCode;
                } else if (this.editType == 3) {
                    obj.id = this.formItemFreeze.id;
                    obj.dbObject = 'freez';
                    obj.newObject = !this.formItemFreeze.freez;
                    googleCode = this.formItemFreeze.googleCode;
                }

                this.checkGoogle(obj, googleCode);
            },
            updateUsers (obj) {
                api.updateUserInfo(obj).then((res) => {
                    if (res.data.code == 1) {
                        if (this.editType == 1) {
                            this.$Message.success('修改成功！');
                            this.modalStatusRecommend = false;
                            this.handleResetRecommend();
                        } else if (this.editType == 2) {
                            this.$Message.success('设置成功！');
                            this.modalStatusVip = false;
                            this.handleResetVip();
                        } else if (this.editType == 3) {
                            this.$Message.success('操作成功！');
                            this.modalStatusFreeze = false;
                            this.handleResetFreeze();
                        }

                        /* if (this.searchVal === '') {
                            // 提交成功重新获取
                            this.getListData();
                        } else {
                            // 展示搜索结果
                            this.findUsers();
                        } */
                        // 提交成功重新获取
                        this.getListData();
                    }
                });
            },
            checkGoogle (obj, googleCode) {
                // 传0检验是否需要谷歌验证
                let params = {
                    code: googleCode
                }
                googleApi.checkGoogleCode(params).then((res) => {
                    if (res.data.code == 1) {
                        // 通过
                        this.updateUsers(obj);
                    } else {
                        this.$Message.error(res.data.msg);
                    }
                });
            },
            getListData () {
                let freezVal = '';
                if (this.freezStatus === 1) {
                    freezVal = true;
                } else if (this.freezStatus === 0) {
                    freezVal = false;
                }
                let params = {
                    userName: this.searchVal,
                    freez: freezVal,
                    pageIndex: this.pageNum,
                    pageSize: this.pageSize
                }
                api.getUserList(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.list;
                        this.total = res.data.data.count;
                    }
                });
            },
            findUsers () {
                // 为空时调查询接口
                // if (this.searchVal === '' && this.freezStatus === '') {
                //     this.getListData();
                //     return;
                // }

                /* let phoneReg = /^[0-9]*$/;
                // 校验手机号
                if (!phoneReg.test(this.searchVal)) {
                    this.$Message.warning('请输入正确的手机号！');
                    return;
                } */
                this.pageNum = 1;
                this.total = 0;

                this.getListData();
                /* let params = {
                    userName: this.searchVal,
                    freez: this.freezStatus,
                    pageIndex: this.pageNum,
                    pageSize: this.pageSize
                }
                api.findUserByUserName(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.list ? res.data.data.list : [];
                    }
                }); */
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 1) {
                    this.modalTitle = '修改推荐人';
                    this.formItemRecommend.id = currRow._id;
                    this.formItemRecommend.recommendName = currRow.recommendName || '';

                    this.modalStatusRecommend = true;
                } else if (type == 2) {
                    this.modalTitle = '修改VIP等级';
                    this.formItemVip.id = currRow._id;
                    this.formItemVip.userName = currRow.userName;
                    this.formItemVip.vip = currRow.vipRate;

                    this.modalStatusVip = true;
                } else if (type == 3) {
                    this.modalTitle = currRow.freez ? '解冻' : '冻结';
                    this.formItemFreeze.id = currRow._id;
                    this.formItemFreeze.freez = currRow.freez;

                    this.modalStatusFreeze = true;
                }
            },
            changePageNum (pageNum) {
                this.pageNum = pageNum;
                this.getListData();
            },
            changePageSize (pageSize) {
                this.pageNum = 1;
                this.pageSize = pageSize;
                this.getListData();
            }
        },
        created () {
            this.getListData();
        },
        mounted () {
        }
    };
</script>
