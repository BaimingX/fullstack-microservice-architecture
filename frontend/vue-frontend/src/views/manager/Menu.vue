<template>
  <div>

    <div class="card" style="margin-bottom: 10px">
      <div style="margin-bottom: 10px">
        <el-button type="primary" @click="handleAdd">Add</el-button>
      </div>
      <el-table default-expand-all row-key="id" stripe :data="data.tableData">
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="name" label="Menu Name" />
        <el-table-column prop="path" label="Component Path" />
        <el-table-column prop="icon" label="Icon">
          <template v-slot="scope">
            <el-icon v-if="scope.row.icon"><component :is="scope.row.icon" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="Sort" />
        <el-table-column prop="type" label="Menu Type" />
        <el-table-column prop="parent" label="Parent Directory" />
        <el-table-column label="Actions" width="140">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">Edit</el-button>
            <el-button type="danger" size="small" @click="del(scope.row.id)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div style="margin-top: 15px" v-if="data.total">
      <el-pagination small background layout="prev, pager, next" :page-size="data.pageSize" v-model:current-page="data.pageNum" :total="data.total"/>
    </div>

    <el-dialog v-model="data.formVisible" title="Menu Information" width="40%" destroy-on-close>
      <el-form ref="formRef" :rules="data.rules" :model="data.form" label-width="150px" label-position="left"  style="padding: 20px 30px" status-icon>
        <el-form-item prop="name" label="Name">
          <el-input v-model="data.form.name" />
        </el-form-item>
        <el-form-item prop="type" label="Menu Type">
          <el-radio-group v-model="data.form.type">
            <el-radio label="Directory"></el-radio>
            <el-radio label="Menu"></el-radio>
            <el-radio label="Site"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="path" label="Component Path">
          <el-input v-model="data.form.path" />
        </el-form-item>
        <el-form-item prop="icon" label="Icon">
          <el-select clearable v-model="data.form.icon" placeholder="Please select">
            <template #prefix>
              <el-icon><component :is="data.form.icon" /></el-icon>
            </template>
            <el-option
                v-for="item in data.icons"
                :key="item.id"
                :label="item.name"
                :value="item.value"
            >
              <el-icon>
                <component :is="item.value" />
              </el-icon>
              <span style="font-size: 14px; position: relative; top: -2px; left: 5px">{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="sort" label="Sort">
          <el-input-number v-model="data.form.sort" />
        </el-form-item>
        <el-form-item prop="pid" label="Parent Directory">
          <el-select clearable v-model="data.form.pid">
            <el-option v-if="data.form.type === 'Menu'" v-for="item in data.folderList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
      <span class="dialog-footer">
        <el-button @click="data.formVisible = false">Cancel</el-button>
        <el-button type="primary" @click="save">Save</el-button>
      </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { reactive, ref } from "vue"
import request from "@/utils/request";
import { ElMessage, ElMessageBox } from "element-plus";
const baseApi = '/menu'

const data = reactive({
  tableData: [],
  formVisible: false,
  form: {},
  icons: [],
  folderList: [],
  rules: {
    name: [
      { required: true, message: 'Please enter the menu name', trigger: 'blur' },
    ],
  }
})
const formRef = ref()

// Load table data
const load = () => {
  request.get(baseApi + '/selectTree').then(res => {
    data.tableData = res.data || []
    console.log(data.tableData)
  })
}

// Open add dialog
const handleAdd = () => {
  loadFolders()
  data.form = { sort: 1, type: 'Menu' }
  data.formVisible = true
}

// Open edit dialog
const handleEdit = (row) => {
  loadFolders()
  data.form = JSON.parse(JSON.stringify(row))
  data.formVisible = true
}

// Add new menu
const add = () => {
  formRef.value.validate((valid => {
    if (valid) {
      request.post(baseApi + '/add', data.form).then(res => {
        if (res.code === '200') {
          ElMessage.success('Operation successful')
          data.formVisible = false
          load()
        } else {
          ElMessage.error(res.msg)
        }
      })
    }
  }))
}

// Update menu
const update = () => {
  formRef.value.validate((valid => {
    if (valid) {
      request.put(baseApi + '/update', data.form).then(res => {
        if (res.code === '200') {
          ElMessage.success('Update successful')
          data.formVisible = false
          load()
        } else {
          ElMessage.error(res.msg)
        }
      })
    }
  }))
}

// Delete menu
const del = (id) => {
  ElMessageBox.confirm('Once deleted, data cannot be recovered. Are you sure you want to delete?', 'Delete Confirmation', { type: 'warning' }).then(res => {
    request.delete(baseApi + '/delete/' + id).then(res => {
      if (res.code === '200') {
        ElMessage.success('Delete successful')
        load()
      } else {
        ElMessage.error(res.msg)
      }
    })
  }).catch(err => {
    console.error(err)
  })
}

const save = () => {
  data.form.id ? update() : add()
}

const loadIcons = () => {
  request.get('/dict/selectByType', { params: { type: 'icon' } }).then(res => {
    data.icons = res.data || []
  })
}

const loadFolders = () => {
  request.get(baseApi + '/selectFolder').then(res => {
    data.folderList = res.data || []
  })
}

load()
loadIcons()

</script>
