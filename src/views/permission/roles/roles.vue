<style lang="less" scoped>
    @import '../../../styles/common.less';
    @import 'roles.less';
</style>

<template>
    <div class="content">
        <Row class="et-row">
            <Col>
            <div class="search-out">
                <Input v-model="searchVal" size="small" placeholder="搜索角色名称" clearable></Input>
            </div>
            <Button type="primary" size="small" icon="ios-search">搜索</Button>
            <Button type="info" size="small" class="add_account" icon="plus-round" @click="showEditModal(null, 0)">添加角色</Button>
            </Col>
        </Row>
        <Table border :columns="tableColumns" :data="filterData"></Table>
        <Modal v-model="modalStatus" :title="modalTitle" width="500" @on-cancel="handleReset">
            <Form ref="formItem" :model="formItem" :label-width="90" :rules="ruleValidate">
                <FormItem label="角色名称" prop="name">
                    <Input v-model="formItem.name" placeholder="请输入角色名称"></Input>
                </FormItem>
                <FormItem label="角色描述" prop="remark">
                    <Input v-model="formItem.remark" type="textarea" :rows="4" placeholder="请输入角色描述"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" size="large" @click="handleReset">取消</Button>
                <Button type="primary" size="large" @click="handleSubmit">确定</Button>
            </div>
        </Modal>
        <Modal v-model="modalStatusRole" title="分配权限" width="800" @on-cancel="handleResetRole">
            <Tree :data="menusData" show-checkbox @on-check-change="setCheckedMenu"></Tree>
            <div slot="footer">
                <Button type="text" size="large" @click="handleResetRole">取消</Button>
                <Button type="primary" size="large" @click="handleSubmitRole">确定</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import {appRouter} from '@/router/router';
    import util from '@/libs/util';
    import api from '@/api/permission'
    import menuApi from '@/api/systems'
    import axios from '@/axios/config'

    export default {
        name: 'roles',
        data () {
            return {
                req_url: axios.defaults.baseURL,
                tableColumns: [
                    {
                        title: '角色名称',
                        key: 'name'
                    },
                    {
                        title: '角色描述',
                        key: 'remark'
                    },
                    {
                        title: '创建时间',
                        key: 'create_time',
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
                                        type: 'error',
                                        size: 'small'
                                    },
                                    style: {
                                        marginTop: '5px',
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.deleteTip(params.row, 1);
                                        }
                                    }
                                }, '删除'),
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
                                        size: 'small'
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
                                }, '分配权限')
                            ]);
                        }
                    }
                ],
                tableData: [],
                searchVal: '',
                modalStatus: false,
                modalTitle: '添加',
                confirmPassword: '',
                formItem: {
                    id: '',
                    name: '',
                    remark: ''
                },
                ruleValidate: {
                    name: [
                        {required: true, message: '请输入角色名称', trigger: 'blur'}
                    ],
                    remark: [
                        {required: true, message: '请输入角色描述', trigger: 'blur'},
                        {max: 100, message: '长度不能超过100个字符', trigger: 'blur'}
                    ]
                },
                editType: 0, // 编辑类型 0添加 1编辑
                modalStatusRole: false,
                data2: [
                    {
                        title: 'parent 1',
                        expand: true,
                        children: [
                            {
                                title: 'parent 1',
                                expand: true,
                                children: [
                                    {
                                        title: 'parent 1-1',
                                        expand: true,
                                        children: [
                                            {
                                                title: 'leaf 1-1-1'
                                            },
                                            {
                                                title: 'leaf 1-1-2'
                                            }
                                        ]
                                    },
                                    {
                                        title: 'parent 1-2',
                                        expand: true,
                                        children: [
                                            {
                                                title: 'leaf 1-2-1'
                                            },
                                            {
                                                title: 'leaf 1-2-1'
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ],
                originMenuData: [], // 所有菜单列表原始数据
                menusData: [],
                checkedMenus: []
            };
        },
        watch: {
        },
        computed: {
            // 过滤数据
            filterData () {
                let value = this.searchVal;
                if (value) {
                    return this.tableData.filter((item) => {
                        // 大小写都匹配
                        return item.name.indexOf(value) > -1;
                    });
                } else {
                    return this.tableData;
                }
            }
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
                this.$refs.formItem.resetFields();
                this.modalStatus = false;
            },
            submitRequest () {
                let params = {
                }
                let obj = Object.assign(params, this.formItem);

                if (this.editType == 0) {
                    api.addRoles(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('添加成功');
                            this.modalStatus = false;
                            this.$refs.formItem.resetFields();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else if (this.editType == 1) {
                    api.editRoles(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('编辑成功');
                            this.modalStatus = false;
                            this.$refs.formItem.resetFields();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                } else {
                    // 修改权限
                    let val = {
                        menuIdList: this.checkedMenus
                    }
                    let obj = Object.assign(val, this.formItem);
                    api.editRoles(obj).then((res) => {
                        if (res.data.code == 1) {
                            this.$Message.success('权限分配成功！');
                            this.modalStatusRole = false;

                            this.checkedMenus = [];
                            this.$refs.formItem.resetFields();
                            // 提交成功重新获取
                            this.getListData();
                        }
                    });
                }
            },
            getListData () {
                api.getRoles().then((res) => {
                    if (res.data.code == 1) {
                        this.tableData = res.data.data;
                    }
                });
            },
            deleteTip (item) {
                this.$Modal.confirm({
                    title: '提示',
                    content: '确认删除 ' + item.name + ' ？',
                    onOk: () => {
                        this.deleteRequest(item);
                    }
                });
            },
            deleteRequest (item) {
                let params = {
                    id: item.id
                }
                api.deleteRoles(params).then((res) => {
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
                    this.modalTitle = '添加角色';

                    // 添加
                    this.setFormItem();

                    this.modalStatus = true;
                } else if (type == 1) {
                    this.modalTitle = '编辑角色';

                    // 赋值表单
                    this.setFormItem(currRow);

                    this.modalStatus = true;
                } else {
                    // 编辑权限
                    // 赋值表单
                    this.setFormItemRole(currRow);

                    // 获取原有菜单权限展示
                    this.getAllMenus(currRow);

                    this.modalStatusRole = true;
                }
            },
            setFormItem (row) {
                if (row) {
                    this.formItem.id = row.id;
                    this.formItem.name = row.name;
                    this.formItem.remark = row.remark;
                }
            },
            setFormItemRole (row) {
                if (row) {
                    this.formItem.id = row.id;
                    this.checkedMenus = row.menuIdList;
                    this.formItem.name = row.name;
                    this.formItem.remark = row.remark;
                }
            },
            handleSubmitRole () {
                // 提交权限修改，同编辑接口
                this.submitRequest();
            },
            handleResetRole () {
                this.menusData = [];
                this.modalStatusRole = false;
            },
            // 获取菜单列表
            getAllMenus (row) {
                menuApi.getMenuList().then((res) => {
                    if (res.data.code == 1) {
                        this.originMenuData = res.data.data;
                        let arrs = [];
                        this.originMenuData.forEach((item, index) => {
                            // 一级菜单
                            if (item.parentId === 0) {
                                let obj = {};
                                obj.id = item.id;
                                obj.roleId = row.id;

                                obj.title = item.name;
                                obj.expand = true;
                                // 父级不用选中，子集会自动判断父级是否选中
                                // obj.checked = row.menuIdList.indexOf(item.id) > -1;
                                obj.children = [];

                                this.originMenuData.forEach((child, rank) => {
                                    if (child.parentId === item.id) {
                                        let childObj = {};
                                        childObj.id = child.id;
                                        childObj.roleId = row.id;

                                        childObj.title = child.name;
                                        childObj.checked = row.menuIdList.indexOf(child.id) > -1;

                                        obj.children.push(childObj);
                                    }
                                })

                                arrs.push(obj);
                            }
                        })
                        this.menusData = arrs;
                    }
                });
            },
            setCheckedMenu (menus) {
                // console.log(menus)
                // 处理树形中的已选择菜单
                let arrs = [];
                menus.forEach((item, index) => {
                    arrs.push(item.id);
                })
                this.menusData.forEach((item, index) => {
                    item.children.forEach((menu, rank) => {
                        if (arrs.indexOf(menu.id) >= 0 && arrs.indexOf(item.id) === -1) {
                            arrs.push(item.id);
                        }
                    })
                })

                this.checkedMenus = arrs;
            }
        },
        created () {
            this.getListData();
        },
        mounted () {
        }
    };
</script>
