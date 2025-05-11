<template>
  <div>
    <!-- 顶部搜索栏 -->
    <div class="card" style="margin-bottom: 10px;">
      <el-input v-model="data.name" prefix-icon="Search" style="width: 240px; margin-right: 10px" placeholder="请输入名称查询"></el-input>
      <el-button type="primary" @click="load">查询</el-button>
      <el-button type="info" style="margin: 0 10px" @click="reset">重置</el-button>
    </div>

    <!-- 用户表格 -->
    <div class="card" style="margin-bottom: 10px">
      <div style="margin-bottom: 10px">
        <el-button type="primary" @click="handleAdd">新增</el-button>
        <el-button type="danger" @click="delBatch">批量删除</el-button>
      </div>
      <el-table stripe :data="data.tableData" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="username" label="账号"/>
        <el-table-column prop="nickname" label="昵称"/>
        <el-table-column prop="avatar" label="头像">
          <template v-slot="scope">
            <el-image style="width: 40px; height: 40px; border-radius: 50%; display: block" v-if="scope.row.avatar"
                     :src="scope.row.avatar" :preview-src-list="[scope.row.avatar]" preview-teleported></el-image>
          </template>
        </el-table-column>
        
        <el-table-column prop="loginType" label="登录方式">
          <template v-slot="scope">
            <el-tag v-if="scope.row.loginType === 0" type="success">本地</el-tag>
            <el-tag v-else-if="scope.row.loginType === 1" type="primary">Google</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="email" label="邮箱" />
        
        <el-table-column label="地址信息">
          <template v-slot="scope">
            <div v-if="scope.row.addressLine1">
              <div>{{ scope.row.addressLine1 }}</div>
              <div v-if="scope.row.addressLine2">{{ scope.row.addressLine2 }}</div>
              <div>
                {{ [scope.row.suburb, scope.row.state, scope.row.postalCode].filter(Boolean).join(', ') }}
              </div>
              <div v-if="scope.row.country">{{ scope.row.country }}</div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态">
          <template v-slot="scope">
            <el-tag v-if="scope.row.status === 1" type="success">启用</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" width="160"/>
        
        <el-table-column label="操作" width="140">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="del(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div style="margin-top: 15px" v-if="data.total">
      <el-pagination small @current-change="load" background layout="prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.pageNum" :total="data.total"/>
    </div>

    <!-- 用户表单对话框 -->
    <el-dialog v-model="data.formVisible" title="前台用户信息" width="40%" destroy-on-close>
      <el-form :model="data.form" ref="formRef" :rules="data.rules" label-width="90px" style="padding: 20px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="data.form.username" autocomplete="off" placeholder="请输入账号" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password" v-if="!data.form.id">
          <el-input v-model="data.form.password" type="password" autocomplete="off" placeholder="请输入密码" />
        </el-form-item>
        
        <el-form-item label="昵称">
          <el-input v-model="data.form.nickname" autocomplete="off" placeholder="请输入昵称" />
        </el-form-item>
        
        <el-form-item label="登录方式">
          <el-select v-model="data.form.loginType" placeholder="请选择登录方式">
            <el-option :value="0" label="本地"></el-option>
            <el-option :value="1" label="Google"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="Google ID" v-if="data.form.loginType === 1">
          <el-input v-model="data.form.googleId" autocomplete="off" placeholder="请输入Google ID" />
        </el-form-item>
        
        <el-form-item label="手机号">
          <el-input v-model="data.form.phone" autocomplete="off" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="邮箱">
          <el-input v-model="data.form.email" autocomplete="off" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-switch 
            v-model="data.form.status" 
            :active-value="1" 
            :inactive-value="0"
            active-text="启用"
            inactive-text="禁用">
          </el-switch>
        </el-form-item>

        <el-form-item prop="avatar" label="头像">
          <el-upload
          :action="baseUrl + '/files/upload'"
          :on-success="handleFileUpload"
          list-type="picture"
          :headers="{headlesscmstoken:data.user.token}"
          >
            <el-button type="primary">上传头像</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="data.formVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {reactive, ref, computed} from "vue"
import request from "@/utils/request";
import {ElMessage, ElMessageBox} from "element-plus";
import {useRoute} from "vue-router";

const route = useRoute();
const baseUrl = import.meta.env.VITE_BASE_URL
const formRef = ref()

// 站点ID
const siteId = computed(() => route.params.siteId);

// API枚举 - 根据siteId选择不同的API
const getApiBase = () => {
  // 如果siteId为1，使用coolStuffUser接口
  if (siteId.value == 1) {
    return '/coolStuffUser';
  }
  // 其他站点可以在这里添加不同的API路径
  // 例如: return `/site${siteId.value}/user`;
  
  // 默认返回coolStuffUser接口
  return '/coolStuffUser';
};

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
  rules: {
      username: [
        { required: true, message: '请输入账号', trigger: 'blur' }
      ]
    },
})

// 加载表格数据
const load = () => {
  const baseApi = getApiBase();
  request.get(baseApi + '/selectPage', {
    params: {
      pageNum: data.pageNum,
      pageSize: data.pageSize,
      name: data.name,
      
    }
  }).then(res => {
    data.tableData = res.data?.list || []
    data.total = res.data?.total
  })
}

// 打开新增弹窗
const handleAdd = () => {
  data.form = {
    siteId: siteId.value,  // 设置当前站点ID
    loginType: 0,          // 默认本地登录
    status: 1              // 默认启用
  }
  data.formVisible = true
}

// 打开编辑弹窗
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row))
  data.formVisible = true
}

// 新增
const add = () => {
  const baseApi = getApiBase();
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
  const baseApi = getApiBase();
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
  const baseApi = getApiBase();
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
  
  const baseApi = getApiBase();
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

const handleFileUpload = (res) => {
  console.log(res)
  data.form.avatar = res.data
}

const reset = () => {
  data.name = ''
  load()
}

// 页面加载时执行
load()
</script>
