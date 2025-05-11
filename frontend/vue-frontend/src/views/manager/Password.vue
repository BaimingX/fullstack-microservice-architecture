<template>
  <div style="width: 50%;">
    <div class="card">
      <el-form ref="formRef" :rules="data.rules" :model="data.form" label-width="100px" style="padding: 20px 30px" status-icon>
        <el-form-item prop="password" label="原密码" >
          <el-input v-model="data.form.password" show-password />
        </el-form-item>
        <el-form-item prop="newPassword" label="新密码">
          <el-input v-model="data.form.newPassword" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword" label="确认新密码">
          <el-input v-model="data.form.confirmPassword" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updatePassword">保存</el-button>
        </el-form-item>
      </el-form>
    </div>

  </div>
</template>

<script setup>
import {reactive, ref} from "vue"
import request from "@/utils/request";
import {ElMessage} from "element-plus";
import router from "@/router";

const validatePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请确认密码'))
  } else if (value !== data.form.newPassword) {
    callback(new Error('确认密码错误'))
  } else {
    callback()
  }
}
const data = reactive({
  form: {},
  user: JSON.parse(localStorage.getItem('user') || '{}'),
  rules: {
    password: [
      { required: true, message: '请输入原密码', trigger: 'blur' },
    ],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
    ],
    confirmPassword: [
      { required: true, message: '请确认新密码', trigger: 'blur' },
      { validator: validatePassword, required: true, trigger: 'blur' },
    ],
  }
})

const formRef = ref()
const updatePassword = () => {
  formRef.value.validate((valid => {
    if (valid) {
      data.form.username = data.user.username
      request.put('/updatePassword', data.form).then(res => {
        if (res.code === '200') {
          ElMessage.success('操作成功')
          logout()
        } else {
          ElMessage.error(res.msg)
        }
      })
    }
  }))
}

const logout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}
</script>