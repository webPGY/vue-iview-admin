<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'activityList.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
                <span>活动类型：</span>
                <div class="search-out">
                    <Select v-model="activitiesType" clearable @on-change="getListData">
                        <Option v-for="item in activityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </div>
                <span style="margin-left: 15px;">活动状态：</span>
                <div class="search-out">
                    <Select v-model="activitiesStatus" clearable @on-change="getListData">
                        <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </div>
                <Button type="primary" icon="ios-search" style="margin-left: 5px;" @click="getListData">查询</Button>
                <Button type="info" class="add_account" icon="plus-round" @click="showEditModal(null, 0)">新增活动</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="tableData"></Table>
        <Page class="pages" :current="pageNum" :total="total" show-elevator show-sizer :page-size="pageSize" :page-size-opts="sizeOpts" @on-change="changePageNum" @on-page-size-change="changePageSize"></Page>
        <Modal v-model="modalStatus" :title="modalTitle" width="600" @on-cancel="handleReset" :mask-closable="false">
            <Form ref="formItem" :model="formItem" :label-width="120" :rules="ruleValidate">
                <FormItem label="活动类型" prop="activityType">
                    <Select v-model="formItem.activityType" style="width:200px" placeholder="请选择活动类型">
                        <Option v-for="item in activityList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="赠送币种" prop="fundsType">
                    <Select v-model="formItem.fundsType" style="width:200px" placeholder="请选择赠送币种">
                        <Option v-for="item in fundsList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="出账人账户" prop="outAccount">
                    <Input v-model.trim="formItem.outAccount" style="width:200px" placeholder="请输入出账人账户"></Input>
                </FormItem>
                <FormItem label="最大限制" prop="maximumLimit">
                    <Input v-model="formItem.maximumLimit" style="width:200px" placeholder="请输入最大限制" number></Input>
                </FormItem>
                <FormItem label="注册奖励" prop="registReward" v-if="formItem.activityType === 1">
                    <Input v-model="formItem.registReward" style="width:200px" placeholder="请输入注册奖励" number></Input>
                </FormItem>
                <FormItem label="邀请奖励" prop="inviteReward" v-if="formItem.activityType === 1">
                    <Input v-model="formItem.inviteReward" style="width:200px" placeholder="请输入邀请奖励"></Input>
                </FormItem>
                <FormItem label="用户最大邀请人数" prop="maxInviteReward" v-if="formItem.activityType === 1">
                    <Input v-model="formItem.maxInviteReward" style="width:200px" placeholder="请输入每个用户最大邀请人数"></Input>
                </FormItem>
                <FormItem label="充值奖励" prop="chargeReward" v-if="formItem.activityType === 2">
                    <Input v-model="formItem.chargeReward" style="width:200px" placeholder="请输入充值奖励" number></Input>
                </FormItem>
                <FormItem label="最小充值金额" prop="minChargeValue" v-if="formItem.activityType === 2">
                    <Input v-model="formItem.minChargeValue" style="width:200px" placeholder="请输入最小充值金额" number></Input>
                </FormItem>
                <FormItem label="开启状态" prop="isOpen">
                    <i-switch size="large" v-model="formItem.isOpen" :true-value="1" :false-value="0">
                        <span slot="open">开启</span>
                        <span slot="close">关闭</span>
                    </i-switch>
                </FormItem>
                <FormItem label="活动开始时间" prop="startTime">
                    <DatePicker v-model="startDateObj" format="yyyy-MM-dd HH:mm:ss" :options="optionsStart" :editable="false" @on-change="setStartDateVal" type="datetime" placeholder="请选择开始时间" style="width: 180px"></DatePicker>
                </FormItem>
                <FormItem label="活动结束时间" prop="endTime">
                    <DatePicker v-model="endDateObj" format="yyyy-MM-dd HH:mm:ss" :options="optionsEnd"  :editable="false" @on-change="setEndDateVal" type="datetime" placeholder="请选择结束时间" style="width: 180px"></DatePicker>
                </FormItem>
                <FormItem label="备注" prop="remark">
                    <Input v-model="formItem.remark" type="textarea" :rows="4" placeholder="请输入备注信息" style="width:300px"></Input>
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
    import api from '@/api/activity'
    import axios from '@/axios/config'

    export default {
        name: 'activityList',
        data () {
            const number = (rule, value, callback) => {
                if (isNaN(value) || value < 0) {
                    callback(new Error('格式不正确，必须为大于等于0的数字'));
                }
                callback();
            };
            const numberPositive = (rule, value, callback) => {
                if (value < 0) {
                    callback(new Error('格式不正确，必须大于等于0'));
                }
                callback();
            };
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '活动类型',
                        key: 'activityType',
                        render: (h, params) => {
                            return h('span', params.row.activityType === 1 ? '注册' : '充值');
                        }
                    },
                    {
                        title: '赠送币种',
                        key: 'keyEn'
                    },
                    {
                        title: '出账人账户',
                        key: 'outAccount'
                    },
                    {
                        title: '活动最大限制',
                        key: 'maximumLimit'
                    },
                    {
                        title: '注册奖励',
                        key: 'registReward'
                    },
                    {
                        title: '邀请奖励',
                        key: 'inviteReward'
                    },
                    {
                        title: '用户最大邀请人数',
                        key: 'maxInviteReward'
                    },
                    {
                        title: '充值奖励',
                        key: 'chargeReward'
                    },
                    {
                        title: '最小充值金额',
                        key: 'minChargeValue'
                    },
                    {
                        title: '状态',
                        key: 'isOpen',
                        render: (h, params) => {
                            return h('span', params.row.isOpen === 0 ? '关闭' : '开启');
                        }
                    },
                    {
                        title: '活动开始时间',
                        key: 'startTime',
                        render: (h, params) => {
                            return h('span', params.row.startTime ? params.row.startTime.split('.')[0] : '-');
                        }
                    },
                    {
                        title: '活动结束时间',
                        key: 'endTime',
                        render: (h, params) => {
                            return h('span', params.row.endTime ? params.row.endTime.split('.')[0] : '-');
                        }
                    },
                    {
                        title: '备注',
                        key: 'remark'
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
                                }, '开启'),
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
                                }, '关闭')
                            ]);
                        }
                    }
                ],
                tableData: [],
                searchVal: '',
                modalStatus: false,
                modalTitle: '添加',
                startDateObj: '',
                endDateObj: '',
                activityList: [
                    {
                        value: 1,
                        label: '注册'
                    },
                    {
                        value: 2,
                        label: '充值'
                    }
                ],
                statusList: [
                    {
                        value: 1,
                        label: '开启'
                    },
                    {
                        value: 0,
                        label: '关闭'
                    }
                ],
                activitiesType: '',
                activitiesStatus: '',
                fundsList: [], // 所有可赠送币种
                formItem: {
                    id: '',
                    // activityName: '',
                    activityType: 1,
                    fundsType: '',
                    outAccount: '',
                    maximumLimit: '',
                    registReward: '',
                    inviteReward: '',
                    maxInviteReward: '',
                    chargeReward: '',
                    minChargeValue: '',
                    isOpen: 1,
                    startTime: '',
                    endTime: '',
                    remark: ''
                },
                ruleValidate: {
                    activityType: [
                        {required: true, type: 'number', message: '请选择活动类型', trigger: 'change'}
                    ],
                    fundsType: [
                        {required: true, type: 'number', message: '请选择赠送币种', trigger: 'change'}
                    ],
                    outAccount: [
                        {required: true, message: '请输入出账人账户', trigger: 'blur'}
                    ],
                    maximumLimit: [
                        {required: true, type: 'number', message: '请输入最大限制', trigger: 'blur'},
                        {validator: numberPositive, trigger: 'blur'}
                    ],
                    registReward: [
                        {required: true, type: 'number', message: '请输入注册奖励', trigger: 'blur'},
                        {validator: numberPositive, trigger: 'blur'}
                    ],
                    inviteReward: [
                        {required: false, message: '请输入邀请奖励', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ],
                    maxInviteReward: [
                        {required: false, message: '请输入每个用户最大邀请人数', trigger: 'blur'},
                        {validator: number, trigger: 'blur'}
                    ],
                    chargeReward: [
                        {required: true, type: 'number', message: '请输入充值奖励', trigger: 'blur'},
                        {validator: numberPositive, trigger: 'blur'}
                    ],
                    minChargeValue: [
                        {required: true, type: 'number', message: '请输入最小充值金额', trigger: 'blur'},
                        {validator: numberPositive, trigger: 'blur'}
                    ],
                    startTime: [
                        {required: true, message: '请选择开始时间', trigger: 'change'}
                    ],
                    endTime: [
                        {required: true, message: '请选择结束时间', trigger: 'change'}
                    ],
                    remark: [
                        {required: true, message: '请输入备注信息', trigger: 'blur'}
                    ]
                },
                optionsStart: {
                    disabledDate: (date) => {
                        let end = this.endDateObj.valueOf();
                        if (end) {
                            return date && date.valueOf() > end;
                        } else {
                            return false;
                        }
                    }
                },
                optionsEnd: {
                    disabledDate: (date) => {
                        let start = this.startDateObj.valueOf();
                        if (start) {
                            return date && date.valueOf() < start;
                        } else {
                            return false;
                        }
                    }
                },
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
                this.startDateObj = '';
                this.endDateObj = '';

                this.formItem.id = '';

                this.$refs.formItem.resetFields();

                this.modalStatus = false;
            },
            submitRequest () {
                let params = {
                }
                let obj = Object.assign(params, this.formItem);

                if (this.editType == 0) {
                    api.addActivities(obj).then((res) => {
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
                    api.updateActivities(obj).then((res) => {
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
            getFundsList () {
                api.findFundsList().then((res) => {
                    if (res.data.code == 1) {
                        let result = res.data.data;
                        let resultArr = [];
                        Object.keys(result).forEach((item, index) => {
                            let arrObj = {};
                            arrObj.value = Number(item);
                            arrObj.label = result[item];

                            resultArr.push(arrObj);
                        });

                        this.fundsList = resultArr;
                    }
                });
            },
            getListData () {
                if (this.activitiesType !== '' || this.activitiesStatus !== '') {
                    // 有查询条件
                    this.filterActivity();
                } else {
                    api.getActivitiesList().then((res) => {
                        if (res.data.code == 1) {
                            this.tableData = res.data.data;
                        }
                    });
                }
            },
            filterActivity () {
                let params = {
                    activityType: this.activitiesType,
                    isOpen: this.activitiesStatus
                }
                api.filterActivitiesList(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data;
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '新增活动';

                    // 添加
                    this.setFormItem();
                } else if (type == 1) {
                    this.modalTitle = '编辑活动';

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
                api.updateActivities(obj).then((res) => {
                    if (res.data.code == 1) {
                        if (status === 1) {
                            this.$Message.success('已开启！');
                        } else {
                            this.$Message.success('已关闭！');
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
                    this.formItem.activityType = row.activityType;
                    this.formItem.fundsType = row.fundsType;
                    this.formItem.outAccount = row.outAccount;
                    this.formItem.maximumLimit = row.maximumLimit;
                    this.formItem.registReward = row.registReward;
                    this.formItem.inviteReward = row.inviteReward === null ? '' : row.inviteReward + '';
                    this.formItem.maxInviteReward = row.maxInviteReward === null ? '' : row.maxInviteReward + '';
                    this.formItem.chargeReward = row.chargeReward;
                    this.formItem.minChargeValue = row.minChargeValue;
                    this.formItem.isOpen = row.isOpen;
                    this.formItem.remark = row.remark;

                    this.formItem.startTime = row.startTime.split('.')[0];
                    this.startDateObj = row.startTime.split('.')[0];

                    this.formItem.endTime = row.endTime.split('.')[0];
                    this.endDateObj = row.endTime.split('.')[0];
                }
            },
            setStartDateVal (formatDate) {
                this.formItem.startTime = formatDate;
            },
            setEndDateVal (formatDate) {
                this.formItem.endTime = formatDate;
            },
            // 分页相关
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
            // 获取币种列表
            this.getFundsList();
        },
        mounted () {
        }
    };
</script>
