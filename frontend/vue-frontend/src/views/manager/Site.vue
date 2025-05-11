<template>
    <div>
  
      <div class="card" style="margin-bottom: 10px;">
        <el-input v-model="data.name" prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入名称查询"></el-input>
        <el-button type="primary" @click="load">查询</el-button>
        <el-button type="info" style="margin: 0 10px" @click="reset">重置</el-button>
      </div>
  
      <div class="card" style="margin-bottom: 10px">
        <div style="margin-bottom: 10px">
          <el-button type="primary" @click="handleAdd">新增</el-button>
          <el-button type="danger" @click="delBatch">批量删除</el-button>
        </div>
        <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="name" label="名称"/>
          <el-table-column prop="domain" label="域名"/>
          <el-table-column prop="logo" label="Logo">
            <template #default="scope">
                <el-image v-if="scope.row.logo" :src="scope.row.logo" :preview-src-list="[scope.row.logo]" preview-teleported
                          style="width: 100px; height: 100px"></el-image>
              </template>
          </el-table-column>
          <el-table-column prop="description" label="描述"/>
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="danger" size="small" @click="del(scope.row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
  
      <div style="margin-top: 15px" v-if="data.total">
        <el-pagination small @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.pageNum" :total="data.total"/>
      </div>
  
      <el-dialog v-model="data.formVisible" title="分类信息" width="40%" destroy-on-close>
      <el-form :model="data.form" ref="formRef" :rules="data.rules" label-width="70px" style="padding: 20px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="data.form.name" autocomplete="off" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="域名" prop="domain">
          <el-input v-model="data.form.domain" autocomplete="off" placeholder="请输入域名" />
        </el-form-item>
        <el-form-item label="Logo" prop="goodsName">
            <el-upload :action="fileUploadUrl" :headers="{ headlesscmstoken: data.user.token }" :on-success="handleImgSuccess">
                <el-button type="primary">上传商品图片</el-button>
            </el-upload>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="data.form.description" autocomplete="off" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="data.formVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  
    </div>
  </template>
  
  <script setup>
  import {reactive,ref} from "vue"
  import request from "@/utils/request";
  import {ElMessage, ElMessageBox} from "element-plus";
  
  
  const baseApi = '/site'
  const formRef = ref()
  
   const fileUploadUrl = import.meta.env.VITE_BASE_URL + '/files/upload'

   const handleImgSuccess = (res) => {
    data.form.logo = res.data
  }
  
  const data = reactive({
    user: JSON.parse(localStorage.getItem('user') || '{}'),
    tableData: [],
    total: 0,
    pageNum: 1,  // 当前的页码
    pageSize: 5,  // 每页的个数
    formVisible: false,
    form: {},
    ids: [],
    name: '',
    roles: [],
    rules: {
        name: [
          { required: true, message: '请输入账号', trigger: 'blur' }
        ],
        domain: [
          { required: true, message: '请输入域名', trigger: 'blur' }
        ]
      },
      
  })
  
  // 加载表格数据
  const load = () => {
    request.get(baseApi + '/selectPage', {
      params: {
        pageNum: data.pageNum,
        pageSize: data.pageSize,
        name: data.name
      }
  
    }).then(res => {
      
      data.tableData = res.data?.list || []
      console.log("tableData",data.tableData)
      data.total = res.data?.total
    })
  }
  
  // 打开新增弹窗
  const handleAdd = () => {
    data.form = {}
    data.formVisible = true
  }
  
  // 打开编辑弹窗
  const handleEdit = (row) => {
    data.form = JSON.parse(JSON.stringify(row))
    data.formVisible = true
  }
  
 
  
  
  // 新增
  const add = () => {
  
    console.log("data",data.form)
    request.post(baseApi + '/add', data.form).then(res => {
      if (res.code === '200') {
        ElMessage.success('操作成功')
        data.formVisible = false
        load()
      } else {
        ElMessage.error(res.msg)
      }
    })
  }
  
  // 更新
  const update = () => {
    console.log("data2",data)
    request.put(baseApi + '/update', data.form).then(res => {
      if (res.code === '200') {
        ElMessage.success('更新成功')
        data.formVisible = false
        load()
      } else {
        ElMessage.error(res.msg)
      }
    })
  }
  
  // 删除
  const del = (id) => {
    ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗?', '删除确认', { type: 'warning' }).then(res => {
      request.delete(baseApi + '/delete/' + id).then(res => {
        if (res.code === '200') {
          ElMessage.success('删除成功')
          load()
        } else {
          ElMessage.error(res.msg)
        }
      })
    }).catch(err => {
      console.error(err)
    })
  }
  
  // 批量删除
  const handleSelectionChange = (rows) => {
    data.ids = rows.map(v => v.id)
  }
  
  const delBatch = () => {
    if (!data.ids.length) {
      ElMessage.warning("请选择数据")
      return
    }
    ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗?', '删除确认', { type: 'warning' }).then(res => {
      request.delete(baseApi + '/delete/batch', {data: data.ids}).then(res => {
        if (res.code === '200') {
          ElMessage.success('操作成功')
          load()  // 刷新表格数据
        } else {
          ElMessage.error(res.msg)
        }
      })
    }).catch(err => console.log(err))
  }
  
  const save = () => {
      formRef.value.validate((valid) => {
        if (valid) {
          if (data.form.id) {  // 有id表示数据存在，那么就是更新
            update()
          } else {  // 否则就是新增
            add()
          }
        }
      })
    }
  
  
  
  
  const reset = () => {
    data.name = ''
    load()
  }
  
  load()

  
  </script>