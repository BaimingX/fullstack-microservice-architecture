<template>
  <div style="width: 50%;">
    <div class="card">
      <el-form ref="formRef" :model="data.form" label-width="80px" style="padding: 20px 30px" status-icon>
        <el-form-item label="头像">
          <el-upload
              class="avatar-uploader"
              :action="baseUrl + '/files/upload'"
              :on-success="handleFileUpload"
              :show-file-list="false"
              :headers="{headlesscmstoken:data.form.token}"
          >
            <img v-if="data.form.avatar" :src="data.form.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item prop="username" label="用户名" >
          <el-input v-model="data.form.username" disabled />
        </el-form-item>
        <el-form-item prop="name" label="姓名">
          <el-input v-model="data.form.name" />
        </el-form-item>
        <el-form-item prop="sex" label="性别">
          <el-radio-group v-model="data.form.sex">
            <el-radio label="男"></el-radio>
            <el-radio label="女"></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="age" label="年龄">
          <el-input v-model="data.form.age" />
        </el-form-item>
        <el-form-item prop="phone" label="电话">
          <el-input v-model="data.form.phone" />
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="data.form.email" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="update">保存</el-button>
        </el-form-item>
      </el-form>
    </div>

  </div>
</template>

<script setup>
import {reactive} from "vue"
import request from "@/utils/request";
import {ElMessage} from "element-plus";
const baseUrl = import.meta.env.VITE_BASE_URL

const data = reactive({
  form: JSON.parse(localStorage.getItem('user') || '{}')
})


const emit = defineEmits(["updateUser"])
const update = () => {
  request.put('/user/update', data.form).then(res => {
    if (res.code === '200') {
      ElMessage.success('更新成功')
      emit('updateUser', data.form)
    } else {
      ElMessage.success(res.msg)
    }
  })
}

const handleFileUpload = (res) => {
  data.form.avatar = res.data
}
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 120px;
  height: 120px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
}
</style>