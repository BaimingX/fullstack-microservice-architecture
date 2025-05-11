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
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="username" label="账号"/>
        <el-table-column prop="name" label="名称"/>
        <el-table-column prop="avatar" label="头像">
          <template v-slot="scope">
            <el-image style="width: 40px; height: 40px; border-radius: 50%; display: block" v-if="scope.row.avatar"
                      :src="scope.row.avatar" :preview-src-list="[scope.row.avatar]" preview-teleported></el-image>
          </template>
        </el-table-column>
        
        <el-table-column prop="age" label="年龄" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="roleName" label="角色" />
        <el-table-column label="操作" width="140">
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

    <el-dialog v-model="data.formVisible" title="用户信息" width="40%" destroy-on-close>
      <el-form :model="data.form" ref="formRef" :rules="data.rules" label-width="70px" style="padding: 20px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="data.form.username" autocomplete="off" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="data.form.name" autocomplete="off" placeholder="请输入名称" />
        </el-form-item>
        
        <el-form-item label="手机号">
          <el-input v-model="data.form.phone" autocomplete="off" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="data.form.email" autocomplete="off" placeholder="请输入邮箱" />
        </el-form-item>
        

        <el-form-item prop="roleId" label="角色" >
          <el-select v-model="data.form.roleId" style="width: 100%" @change="updateRole">
            <el-option v-for="item in data.roles" :label="item.name" :value="item.id" :key="item.id"></el-option>
          </el-select>
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
import {reactive,ref} from "vue"
import request from "@/utils/request";
import {ElMessage, ElMessageBox} from "element-plus";

const baseUrl = import.meta.env.VITE_BASE_URL
const baseApi = '/user'
const formRef = ref()



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
      username: [
        { required: true, message: '请输入账号', trigger: 'blur' }
      ],
      roleId: [
        { required: true, message: '请选择角色', trigger: 'change' }
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

const updateRole = (roleId) => {
  const selectedRole = data.roles.find(r => r.id === roleId);
  data.form.role = selectedRole ? selectedRole.flag : null;  // 赋值 role（flag）
};


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
  console.log("data2", data);
  // 确保正确设置请求头
  const token = data.user.token || '';
  console.log('更新操作，使用token：', token);
  
  request.put(baseApi + '/update', data.form, {
    headers: {
      'headlesscmstoken': token
    }
  }).then(res => {
    if (res.code === '200') {
      ElMessage.success('更新成功')
      data.formVisible = false
      load()
    } else {
      ElMessage.error(res.msg || '更新失败')
    }
  }).catch(err => {
    console.error('更新请求错误:', err);
    ElMessage.error('更新请求失败，请检查网络和权限')
  })
}

// 删除
const del = (id) => {
  ElMessageBox.confirm('删除后数据无法恢复，您确定删除吗?', '删除确认', { type: 'warning' }).then(res => {
    // 确保正确设置请求头
    const token = data.user.token || '';
    console.log('删除操作，使用token：', token);
    
    request.delete(baseApi + '/delete/' + id, {
      headers: {
        'headlesscmstoken': token
      }
    }).then(res => {
      if (res.code === '200') {
        ElMessage.success('删除成功')
        load()
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    }).catch(err => {
      console.error('删除请求错误:', err);
      ElMessage.error('删除请求失败，请检查网络和权限')
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
    // 确保正确设置请求头
    const token = data.user.token || '';
    console.log('批量删除操作，使用token：', token);
    
    request.delete(baseApi + '/delete/batch', {
      headers: {
        'headlesscmstoken': token
      },
      data: data.ids
    }).then(res => {
      if (res.code === '200') {
        ElMessage.success('操作成功')
        load()  // 刷新表格数据
      } else {
        ElMessage.error(res.msg || '批量删除失败')
      }
    }).catch(err => {
      console.error('批量删除请求错误:', err);
      ElMessage.error('批量删除请求失败，请检查网络和权限')
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

const loadRoles = () => {
  request.get('/role/selectAll').then(res => {
    data.roles = res.data || []
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

load()
loadRoles()

</script>