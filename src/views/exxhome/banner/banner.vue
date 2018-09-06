<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'banner.less';
</style>

<template>
    <div class="content">
        <Row class="topBar">
            <Col>
                <span>平台：</span>
                <div class="form-out">
                    <Select size="small" v-model="platform">
                        <Option v-for="item in platforms" :value="item.type" :key="item.type">{{ item.label }}</Option>
                    </Select>
                </div>
                <span>语言：</span>
                <div class="form-out">
                    <Select size="small" v-model="type">
                        <Option v-for="item in lanList" :value="item.type" :key="item.type">{{ item.label }}</Option>
                    </Select>
                </div>
                <Button type="primary" size="small" icon="refresh" @click="refreshList">刷新</Button>
                <Button type="info" size="small" icon="plus-round" @click="showEditModal(null, 0)">添加</Button>
                <div class="search-out">
                    <Input v-model="searchVal" size="small" placeholder="搜索活动名称" clearable></Input>
                </div>
                <Button type="primary" size="small" icon="ios-search">搜索</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="filterList"></Table>
        <Modal v-model="modalStatus" :title="modalTitle" width="800" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="90" :rules="ruleValidate">
                <FormItem label="序号" prop="rank">
                    <Input v-model="formItem.rank" placeholder="请输入排列序号" @on-keyup="setRankValue"></Input>
                </FormItem>
                <FormItem label="上架时间" prop="shelvesTime">
                    <DatePicker type="datetime" v-model="formItem.shelvesTime" placeholder="请选择上架时间"></DatePicker>
                </FormItem>
                <FormItem label="活动名称" prop="bannerName">
                    <Input v-model="formItem.bannerName" placeholder="请输入活动名称"></Input>
                </FormItem>
                <div class="uploadblock">
                    <label class="upload-label" style="width: 90px;">图片</label>
                    <!--背景图-->
                    <div class="demo-upload-list" v-for="item in uploadList1">
                        <template v-if="item.status === 'finished'">
                            <img :src="item.url">
                            <div class="demo-upload-list-cover">
                                <Icon type="ios-eye-outline" @click.native="handleView(item.url)"></Icon>
                                <Icon type="ios-trash-outline" @click.native="handleRemove1(item)"></Icon>
                            </div>
                        </template>
                        <template v-else>
                            <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                        </template>
                    </div>
                    <Upload v-show="uploadList1.length === 0"
                        ref="upload1"
                        :show-upload-list="false"
                        :on-success="handleSuccess1"
                        :format="['jpg','jpeg','png']"
                        :max-size="2048"
                        :on-format-error="handleFormatError"
                        :on-exceeded-size="handleMaxSize"
                        :before-upload="handleBeforeUpload1"
                        type="drag"
                        :action="req_url + 'fileUpload'"
                        style="display: inline-block;width:100px;">
                        <div style="height:58px; padding: 10px 0;">
                            <Icon type="camera" size="20"></Icon>
                            <span class="up-tip">请上传背景图</span>
                        </div>
                    </Upload>
                    <!--文本图-->
                    <div class="demo-upload-list" v-for="item in uploadList2">
                        <template v-if="item.status === 'finished'">
                            <img :src="item.url">
                            <div class="demo-upload-list-cover">
                                <Icon type="ios-eye-outline" @click.native="handleView(item.url)"></Icon>
                                <Icon type="ios-trash-outline" @click.native="handleRemove2(item)"></Icon>
                            </div>
                        </template>
                        <template v-else>
                            <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                        </template>
                    </div>
                    <Upload v-show="uploadList2.length === 0"
                            ref="upload2"
                            :show-upload-list="false"
                            :on-success="handleSuccess2"
                            :format="['jpg','jpeg','png']"
                            :max-size="2048"
                            :on-format-error="handleFormatError"
                            :on-exceeded-size="handleMaxSize"
                            :before-upload="handleBeforeUpload2"
                            type="drag"
                            :action="req_url + 'fileUpload'"
                            style="display: inline-block;width:100px;">
                        <div style="height:58px; padding: 10px 0;">
                            <Icon type="camera" size="20"></Icon>
                            <span class="up-tip">请上传内容图</span>
                        </div>
                    </Upload>
                    <!--预览图片-->
                    <Modal title="预览" width="1200" v-model="visible" class="viewimg">
                        <img :src="imgUrl" v-if="visible" style="width: 100%">
                    </Modal>
                    <input type="hidden" v-model="formItem.baseImage">
                    <input type="hidden" v-model="formItem.textImage">
                </div>
                <FormItem label="链接" prop="url">
                    <Input v-model="formItem.url" placeholder="请输入跳转链接"></Input>
                </FormItem>
                <FormItem label="链接打开方式" prop="jumpWay">
                    <RadioGroup v-model="formItem.jumpWay">
                        <Radio label="1">新页面</Radio>
                        <Radio label="2">当前页</Radio>
                    </RadioGroup>
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
    import api from '@/api/banner'
    import axios from '@/axios/config'
    import moment from 'moment'

    export default {
        name: 'banner',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                type: 1, // 语言默认简体中文
                modalStatus: false,
                modalTitle: '添加',
                searchVal: '',
                platform: 1, // 平台默认1
                lanList: [
                    {
                        type: 1,
                        label: '简体中文'
                    },
                    {
                        type: 2,
                        label: 'English'
                    }
                ],
                platforms: [
                    {
                        type: 1,
                        label: 'Web端'
                    },
                    {
                        type: 2,
                        label: '移动端'
                    }
                ],
                tableColumns: [
                    {
                        title: '序号',
                        key: 'rank'
                    },
                    {
                        title: '上架时间',
                        key: 'shelvesTime',
                        render: (h, params) => {
                            return h('span', params.row.shelvesTime ? params.row.shelvesTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '活动名称',
                        key: 'bannerName'
                    },
                    {
                        title: '背景图',
                        key: 'baseImage',
                        render: (h, params) => {
                            return h('img', {
                                attrs: {
                                    'src': params.row.baseImage,
                                    'class': 'imgblock',
                                    'width': 100,
                                    'height': 100
                                }
                            });
                        }
                    },
                    {
                        title: '内容图',
                        key: 'textImage',
                        render: (h, params) => {
                            return h('img', {
                                attrs: {
                                    'src': params.row.textImage,
                                    'class': 'imgblock',
                                    'width': 100,
                                    'height': 100
                                }
                            });
                        }
                    },
                    {
                        title: '链接地址',
                        key: 'url'
                    },
                    {
                        title: '链接打开方式',
                        key: 'jumpWay',
                        render: (h, params) => {
                            return h('span', params.row.jumpWay == 1 ? '新页面' : '当前页');
                        }
                    },
                    {
                        title: '创建时间',
                        key: 'creatTime',
                        render: (h, params) => {
                            return h('span', params.row.creatTime ? params.row.creatTime.split('.')[0] : '');
                        }
                    },
                    {
                        title: '修改时间',
                        key: 'updateTime',
                        render: (h, params) => {
                            return h('span', params.row.updateTime ? params.row.updateTime.split('.')[0] : '');
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
                                        disabled: params.row.shelvesState == 1
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.dropUpOff(params.row, 1);
                                        }
                                    }
                                }, '上架'),
                                h('Button', {
                                    props: {
                                        type: 'warning',
                                        size: 'small',
                                        disabled: params.row.shelvesState == 2
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.dropUpOff(params.row, 2);
                                        }
                                    }
                                }, '下架'),
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
                                            this.deleteBannerTip(params.row);
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }
                ],
                tableData: [],
                formItem: {
                    id: '',
                    rank: '',
                    shelvesTime: '',
                    bannerName: '',
                    baseImage: '',
                    textImage: '',
                    url: '',
                    jumpWay: 1
                },
                ruleValidate: {
                    rank: [
                        {required: true, type: 'number', message: '请输入排列序号(必须为大于0的数字)', trigger: 'blur'}
                    ],
                    shelvesTime: [
                        {required: true, type: 'date', message: '请选择上架时间', trigger: 'change'}
                    ],
                    bannerName: [
                        {required: true, message: '请输入活动名称', trigger: 'blur'}
                    ],
                    url: [
                        {required: true, message: '请输入链接地址', trigger: 'blur'}
                    ]
                },
                editType: 0, // 编辑类型 0添加 1编辑
                // 上传图片
                imgUrl: '',
                visible: false,
                uploadList1: [],
                uploadList2: []
            };
        },
        watch: {
            // 语言分类
            type () {
                this.getBanner();
            },
            // 平台分类
            platform () {
                this.getBanner();
            }
        },
        computed: {
            // 已过滤的数据
            filterList () {
                let value = this.searchVal;
                if (value) {
                    return this.tableData.filter((item) => {
                        // 大小写都匹配
                        return item.bannerName.indexOf(value.toLowerCase()) !== -1 || item.bannerName.indexOf(value.toUpperCase()) !== -1;
                    });
                } else {
                    return this.tableData;
                }
            }
        },
        methods: {
            setRankValue (event) {
                if (this.formItem.rank != '' && this.formItem.rank > 0 && parseInt(this.formItem.rank)) {
                    this.formItem.rank = parseInt(this.formItem.rank);
                }
            },
            handleSubmit () {
                this.$refs.formItem.validate((valid) => {
                    if (valid) {
                        this.submitBanner();
                    }
                });
            },
            handleReset () {
                this.$refs.formItem.resetFields();
                this.formItem.baseImage = '';
                this.formItem.textImage = '';

                this.$refs.upload1.fileList.splice(0, 1);
                this.$refs.upload2.fileList.splice(0, 1);

                this.modalStatus = false;
            },
            submitBanner () {
                if (this.formItem.baseImage == '') {
                    this.$Message.warning('请上传图片');
                    return;
                }
                let params = {
                    adminUserId: 1,
                    type: this.type,
                    forType: this.platform
                }
                let copyObj = Object.assign({}, this.formItem);
                copyObj.shelvesTime = moment(copyObj.shelvesTime).format('YYYY-MM-DD HH:mm:ss');

                let obj = Object.assign(params, copyObj);

                if (this.editType == 0) {
                    api.addBanner(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('添加成功');
                            this.modalStatus = false;
                            this.$refs.formItem.resetFields();
                            // 提交成功重新获取
                            this.getBanner();
                        }
                    });
                } else if (this.editType == 1) {
                    api.editBanner(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('编辑成功');
                            this.modalStatus = false;
                            this.$refs.formItem.resetFields();
                            // 提交成功重新获取
                            this.getBanner();
                        }
                    });
                }
            },
            getBanner () {
                let params = {
                    type: this.type,
                    forType: this.platform
                }
                api.getBanners(params).then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data;
                    }
                });
            },
            deleteBannerTip (item) {
                this.$Modal.confirm({
                    title: '提示',
                    content: '确认删除 ' + item.bannerName + ' ？',
                    onOk: () => {
                        this.deleteBanner(item);
                    }
                });
            },
            deleteBanner (item) {
                let params = {
                    id: item.id
                }
                api.deleteBanner(params).then((res) => {
                    if (res.data.code == 1) {
                        this.$Message.success('删除成功');
                        // 提交成功重新获取
                        this.getBanner();
                    }
                });
            },
            showEditModal (currRow, type) {
                this.editType = type;
                if (type == 0) {
                    this.modalTitle = '添加';

                    // 添加
                    this.formItem.id = '';

                    this.formItem.rank = '';
                    this.formItem.shelvesTime = '';
                    this.formItem.bannerName = '';
                    this.formItem.baseImage = '';
                    this.formItem.textImage = '';
                    this.formItem.url = '';
                    this.formItem.jumpWay = 1;

                    this.$refs.upload1.fileList.splice(0, 1);
                    this.$refs.upload2.fileList.splice(0, 1);
                } else if (type == 1) {
                    this.modalTitle = '编辑';

                    // 赋值表单
                    this.formItem.id = currRow.id;

                    this.formItem.rank = currRow.rank;
                    this.formItem.shelvesTime = currRow.shelvesTime;
                    this.formItem.bannerName = currRow.bannerName;
                    this.formItem.baseImage = currRow.baseImage;
                    this.formItem.textImage = currRow.textImage;
                    this.formItem.url = currRow.url;
                    this.formItem.jumpWay = currRow.jumpWay;

                    // 显示已上传图片
                    let obj1 = {}, obj2 = {};

                    obj1.status = 'finished';
                    obj1.url = this.formItem.baseImage;
                    this.uploadList1[0] = obj1;

                    obj2.status = 'finished';
                    obj2.url = this.formItem.textImage;
                    this.uploadList2[0] = obj2;
                }
                this.modalStatus = true;
            },
            dropUpOff (item, val) {
                item.shelvesState = val;
                api.editBanner(item).then((res) => {
                    if (res.data.code == 1) {
                        val == 1 ? this.$Message.success('上架成功') : this.$Message.success('下架成功')
                        // 提交成功重新获取
                        this.getBanner();
                    }
                });
            },
            refreshList () {
                this.getBanner();
            },
            // 上传图片
            handleView (imgUrl) {
                this.imgUrl = imgUrl;
                this.visible = true;
            },
            handleRemove1 (file) {
                const fileList = this.$refs.upload1.fileList;
                this.$refs.upload1.fileList.splice(fileList.indexOf(file), 1);
                this.formItem.baseImage = '';
            },
            handleRemove2 (file) {
                const fileList = this.$refs.upload2.fileList;
                this.$refs.upload2.fileList.splice(fileList.indexOf(file), 1);
                this.formItem.textImage = '';
            },
            handleSuccess1 (res, file) {
                file.url = res.data;
                this.formItem.baseImage = res.data;
            },
            handleSuccess2 (res, file) {
                file.url = res.data;
                this.formItem.textImage = res.data;
            },
            handleFormatError (file) {
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请选择 jpg 或者 png 格式。'
                });
            },
            handleMaxSize (file) {
                this.$Notice.warning({
                    title: '超出文件大小限制',
                    desc: '文件：' + file.name + ' 过大，不能超过 2M'
                });
            },
            handleBeforeUpload1 () {
                const check = this.uploadList1.length < 5;
                if (!check) {
                    this.$Notice.warning({
                        title: '最多可以上传5张照片。'
                    });
                }
                return check;
            },
            handleBeforeUpload2 () {
                const check = this.uploadList2.length < 5;
                if (!check) {
                    this.$Notice.warning({
                        title: '最多可以上传5张照片。'
                    });
                }
                return check;
            }
        },
        created () {
            this.getBanner();
        },
        mounted () {
            this.uploadList1 = this.$refs.upload1.fileList;
            this.uploadList2 = this.$refs.upload2.fileList;
        }
    };
</script>
