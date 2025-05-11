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
      <el-table stripe :data="data.tableData" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="name" label="名称"/>
        <el-table-column prop="flag" label="唯一标识"/>
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

    <el-dialog v-model="data.formVisible" title="角色信息" width="40%" destroy-on-close>
      <el-form ref="formRef" :model="data.form" label-width="80px" style="padding: 20px 30px" status-icon>
        <el-form-item prop="username" label="角色名称" >
          <el-input v-model="data.form.name" />
        </el-form-item>
        <el-form-item prop="name" label="唯一标识">
          <el-input v-model="data.form.flag" />
        </el-form-item>
        <el-form-item label="权限" >
          <div style="width: 100%; border: 1px solid #ccc; border-radius: 5px; padding: 5px">
            <el-tree ref="menuTreeRef" :data="data.menuTreeData" :props="{ label: 'name', value: 'id' }"
                     show-checkbox node-key="id"></el-tree>
          </div>
        </el-form-item>

        <el-form-item label="站点权限">
          <div style="width: 100%; border: 1px solid #ccc; border-radius: 5px; padding: 5px">
            <el-tree
              ref="siteTreeRef"
              :data="data.siteTreeData"
              :props="{ label: 'name', value: 'id' }"
              show-checkbox
              node-key="id"
            ></el-tree>
          </div>
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
import {nextTick, reactive, ref} from "vue"
import request from "@/utils/request";
import {ElMessage, ElMessageBox} from "element-plus";
import router from "@/router";
const baseApi = '/role'

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
  menuTreeData: [],
  siteTreeData: []
})
const menuTreeRef = ref(null)
const siteTreeRef = ref(null)

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
    data.total = res.data?.total
  })

  // 查询权限树的数据
  request.get('/menu/selectTree').then(res => {
    data.menuTreeData = res.data || []
  })

  request.get('/site/selectAll').then(res => {
    // 这里假设 /site/selectAll 返回的就是 [{id, name, ...}, ...]
    // 我们简单包成树的格式
    data.siteTreeData = (res.data || []).map(site => {
      return {
        id: site.id,
        name: site.name,
        // 也可以再加 children: []，如果有子层级
      }
    })
  })
}

// 打开新增弹窗
const handleAdd = () => {
  data.form = {}
  data.formVisible = true
  nextTick(() => {
    menuTreeRef.value?.setCheckedKeys([])
    siteTreeRef.value?.setCheckedKeys([])
  })
}

// 打开编辑弹窗
function handleEdit(row) {
  // row里包含 id, name, flag, menuIds, siteIds
  data.form = JSON.parse(JSON.stringify(row))  
  data.formVisible = true

  // 异步 nextTick 等待DOM渲染后再设置树的选中值
  nextTick(() => {
    // 1) 清空选中
    menuTreeRef.value?.setCheckedKeys([])
    siteTreeRef.value?.setCheckedKeys([])

    // 2) 设置菜单选中
    if (row.menuIds) {
      row.menuIds.forEach(v => {
        menuTreeRef.value.setChecked(v, true, false)
      })
    }

    // 3) 设置站点选中
    if (row.siteIds) {
      row.siteIds.forEach(v => {
        siteTreeRef.value.setChecked(v, true, false)
      })
    }
  })
}

// 新增
const add = () => {
  request.post(baseApi + '/add', data.form).then(res => {
    if (res.code === '200') {
      data.formVisible = false
      if (data.form.flag === data.user.role) {  // 如果编辑的是当前的角色，就得重新登录
        ElMessage.success('当前角色菜单权限变更，请重新登录')
        logout()
      } else {
        ElMessage.success('操作成功')
        data.formVisible = false
        load()
      }
    } else {
      ElMessage.error(res.msg)
    }
  })
}

// 更新
const update = () => {
  request.put(baseApi + '/update', data.form).then(res => {
    if (res.code === '200') {
      if (data.form.flag === data.user.role) {  // 如果编辑的是当前的角色，就得重新登录
        ElMessage.success('当前角色菜单权限变更，请重新登录')
        logout()
      } else {
        ElMessage.success('操作成功')
        data.formVisible = false
        load()
      }
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
  // 目前被选中的菜单节点
  let checkedMenuKeys = menuTreeRef.value.getCheckedKeys()
  let halfMenuKeys = menuTreeRef.value.getHalfCheckedKeys()
  checkedMenuKeys.unshift(...halfMenuKeys)
  data.form.menuIds = checkedMenuKeys
  
  let checkedSiteKeys = siteTreeRef.value.getCheckedKeys()
  let halfSiteKeys = siteTreeRef.value.getHalfCheckedKeys()
  checkedSiteKeys.unshift(...halfSiteKeys)
  data.form.siteIds = checkedSiteKeys

  data.form.id ? update() : add()
}

const reset = () => {
  data.name = ''
  load()
}

const logout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}

load()

</script>