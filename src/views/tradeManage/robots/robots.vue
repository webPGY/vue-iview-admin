<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'robots.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>交易区：</span>
                <div class="search-out">
                    <Select v-model="marketName" clearable @on-change="getCoinsByArea">
                        <Option v-for="item in markets" :value="item.toLowerCase()" :key="item">{{ item }}</Option>
                    </Select>
                </div>
                <span style="margin-left: 15px;">币种：</span>
                <div class="search-out">
                    <Select v-model="coinName" clearable :disabled="coins.length <= 0" @on-change="findMarket">
                        <Option v-for="item in coins" :value="item.toLowerCase()" :key="item">{{ item }}</Option>
                    </Select>
                </div>
                <Button type="primary" icon="ios-search" style="margin-left: 5px;" @click="searchMarket">查询</Button>
                <Button type="info" class="add_account" icon="plus-round" @click="showEditModal(null, 0)">新增市场配置</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        <Modal v-model="modalStatus" :title="modalTitle" width="500" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="90" :rules="ruleValidate">
                <!--<FormItem label="市场名称" prop="marketName">
                    <Input v-model="formItem.marketName" placeholder="请输入市场名称" :readonly="editType === 1"></Input>
                </FormItem>-->
                <FormItem label="交易区" prop="market">
                    <Select v-model="formItem.market" style="width:200px" placeholder="请选择交易区" @on-change="getAddCoinsByArea" :disabled="editType === 1">
                        <Option v-for="item in markets" :value="item.toLowerCase()" :key="item">{{ item }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="币种" prop="coin">
                    <Select v-model="formItem.coin" style="width:200px" placeholder="请选择币种" :disabled="addCoins.length <= 0 || editType === 1">
                        <Option v-for="item in addCoins" :value="item.toLowerCase()" :key="item">{{ item }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="交易量" prop="numbers">
                    <Input v-model="formItem.numbers" placeholder="请输入交易量" number></Input>
                </FormItem>
                <FormItem label="速率" prop="speed">
                    <Input v-model="formItem.speed" placeholder="请输入速率" number></Input>
                </FormItem>
                <FormItem label="开启状态" prop="isOpen">
                    <i-switch size="large" v-model="formItem.isOpen" :true-value="1" :false-value="0">
                        <span slot="open">开启</span>
                        <span slot="close">关闭</span>
                    </i-switch>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="handleSubmit">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import api from '@/api/robots'
    import axios from '@/axios/config'

    export default {
        name: 'robots',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '市场名称',
                        key: 'marketName'
                    },
                    {
                        title: '交易量',
                        key: 'numbers'
                    },
                    {
                        title: '速率（ms）',
                        key: 'speed'
                    },
                    {
                        title: '状态',
                        key: 'isOpen',
                        render: (h, params) => {
                            return h('span', params.row.isOpen === 0 ? '已关闭' : '已开启');
                        }
                    },
                    {
                        title: '创建时间',
                        key: 'createTime',
                        render: (h, params) => {
                            return h('span', params.row.createTime ? params.row.createTime.split('.')[0] : '-');
                        }
                    },
                    {
                        title: '更新时间',
                        key: 'updateTime',
                        render: (h, params) => {
                            return h('span', params.row.updateTime ? params.row.updateTime.split('.')[0] : '-');
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
                                        type: 'success',
                                        size: 'small',
                                        disabled: params.row.isOpen === 1
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.setOpenStatus(params.row, 1);
                                        }
                                    }
                                }, '启用'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small',
                                        disabled: params.row.isOpen === 0
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.setOpenStatus(params.row, 0);
                                        }
                                    }
                                }, '停用')
                            ]);
                        }
                    }
                ],
                tableData: [],
                searchVal: '',
                modalStatus: false,
                modalTitle: '添加',
                formItem: {
                    id: '',
                    isOpen: 1,
                    marketName: '',
                    numbers: '',
                    speed: '',
                    // 以下字段用于下拉选择
                    coin: '',
                    market: ''
                },
                ruleValidate: {
                    // marketName: [
                    //     {required: true, message: '请输入市场名称', trigger: 'blur'}
                    // ],
                    numbers: [
                        {required: true, type: 'number', message: '请输入交易量', trigger: 'blur'}
                    ],
                    speed: [
                        {required: true, type: 'number', message: '请输入速率，单位毫秒', trigger: 'blur'}
                    ],
                    coin: [
                        {required: true, message: '请选择交易区', trigger: 'change'}
                    ],
                    market: [
                        {required: true, message: '请选择币种', trigger: 'change'}
                    ]
                },
                marketName: '',
                coinName: '',
                markets: ['CNYT', 'ET', 'USDT', 'BTC', 'ETH'],
                coins: [],
                addCoins: [],
                editType: 0, // 编辑类型 0添加 1编辑
                pageNum: 1,
                pageSize: 10,
                total: 0, // 总页数
                sizeOpts: [10, 20, 50, 100]
            };
        },
        watch: {
        },
        computed: {
        },
        methods: {
            handleSubmit () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        this.submitRequest();
                    }
                });
            },
            handleReset () {
                this.formItem.id = '';
                this.$refs.formItem.resetFields();
                this.modalStatus = false;
            },
            submitRequest () {
                let params = {
                }
                this.formItem.marketName = this.formItem.coin + '_' + this.formItem.market;

                let obj = Object.assign(params, this.formItem);

                if (this.editType == 0) {
                    api.addRobots(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('新增成功！');
                            this.modalStatus = false;
                            this.formItem.id = '';
                            this.$refs.formItem.resetFields();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else if (this.editType == 1) {
                    api.updateRobots(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('编辑成功！');
                            this.modalStatus = false;
                            this.formItem.id = '';
                            this.$refs.formItem.resetFields();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                }
            },
            getCoinsByArea () {
                // 选择交易区清空币种
                this.coinName = '';
                this.searchVal = '';

                if (this.marketName) {
                    let params = {
                        areaName: this.marketName
                    }
                    api.findCoinsByArea(params).then((res) => {
                        if (res.data.code == 1) {
                            this.coins = res.data.data;
                        }
                    });
                } else {
                    this.pageNum = 1;
                    this.getListData();
                }
            },
            getAddCoinsByArea () {
                let params = {
                    areaName: this.formItem.market
                }
                api.findCoinsByArea(params).then((res) => {
                    if (res.data.code == 1) {
                        this.addCoins = res.data.data;
                    }
                });
            },
            findMarket () {
                if (this.coinName) {
                    this.searchVal = this.coinName + '_' + this.marketName;
                    this.pageNum = 1;
                    this.getListData();
                }
            },
            searchMarket () {
                if (this.coinName) {
                    this.findMarket();
                } else {
                    this.$Message.warning('请先选择交易区和币种');
                }
            },
            getListData () {
                let params = {
                    marketName: this.searchVal,
                    pageNum: this.pageNum,
                    pageSize: this.pageSize
                }
                api.getRobotsList(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data.obj || [];
                        this.total = res.data.data.totalCount;
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '添加市场信息';

                    // 添加
                    this.setFormItem();
                } else if (type == 1) {
                    this.modalTitle = '编辑市场信息';

                    // 赋值表单
                    this.setFormItem(currRow);
                }
                this.modalStatus = true;
            },
            setOpenStatus (currRow, status) {
                // 赋值表单
                this.setFormItem(currRow);
                this.formItem.isOpen = status;

                // 提交修改
                let params = {
                }
                let obj = Object.assign(params, this.formItem);
                api.updateRobots(obj).then((res) => {
                    if (res.data.code == 1) {
                        if (status === 1) {
                            this.$Message.success('已启用');
                        } else {
                            this.$Message.success('已停用');
                        }
                        this.formItem.id = '';
                        this.$refs.formItem.resetFields();
                        // 提交成功重新获取
                        this.getListData();
                    }
                });
            },
            setFormItem (row) {
                if (row) {
                    this.formItem.id = row.id;
                    this.formItem.isOpen = row.isOpen;
                    this.formItem.marketName = row.marketName;
                    this.formItem.numbers = row.numbers;
                    this.formItem.speed = row.speed;

                    this.formItem.coin = row.marketName.split('_')[0];
                    this.formItem.market = row.marketName.split('_')[1];
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
