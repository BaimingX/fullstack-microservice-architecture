<template>
  <div class="login-container">
    <div class="login-box">
      <div style="font-weight: bold; font-size: 24px; text-align: center; margin-bottom: 30px; color: #1450aa">欢 迎 注 册</div>
      <el-form :model="data.form" ref="formRef" :rules="data.rules">
        <el-form-item prop="username">
          <el-input :prefix-icon="User" size="large" v-model="data.form.username" placeholder="请输入账号"/>
        </el-form-item>
        <el-form-item prop="password">
          <el-input :prefix-icon="Lock" size="large" v-model="data.form.password" placeholder="请输入密码"
                    show-password/>
        </el-form-item>
        <el-form-item prop="roleId">
          <el-select size="large" v-model="data.form.roleId" @change="updateRole">
            <el-option v-for="item in data.roles" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button size="large" type="primary" style="width: 100%" @click="register">注 册</el-button>
        </el-form-item>
      </el-form>
      <div style="text-align: right;">
        前往 <a href="/login">登录</a>
      </div>
    </div>

  </div>
</template>

<script setup>
import {reactive, ref} from "vue";
import {User, Lock} from "@element-plus/icons-vue";
import request from "@/utils/request";
import {ElMessage} from "element-plus";
import router from "@/router";

const data = reactive({
  form: {},
  roles: [],
  rules: {
    username: [
      {required: true, message: '请输入账号', trigger: 'blur'},
    ],
    password: [
      {required: true, message: '请输入密码', trigger: 'blur'},
    ],
    roleId: [
      {required: true, message: '请选择角色', trigger: 'blur'},
    ],
  }
})

const formRef = ref()

// 点击登录按钮的时候会触发这个方法
const register = () => {
  formRef.value.validate((valid => {
    if (valid) {
      // 调用后台的接口
      console.log("data.form",data.form)
      request.post('/register', data.form).then(res => {
        
        if (res.code === '200') {
          ElMessage.success("登录成功")
          router.push('/login')
          localStorage.setItem('canteen-user', JSON.stringify(res.data))
        } else {
          ElMessage.error(res.msg)
        }
      })
    }
  })).catch(error => {
    console.error(error)
  })
}

const updateRole = (roleId) => {
  const selectedRole = data.roles.find(r => r.id === roleId);
  data.form.role = selectedRole ? selectedRole.flag : null;  // 赋值 role（flag）
};

const loadRoles = () => {
  request.get('/role/selectAll').then(res => {
    data.roles = res.data || []
    data.roles = data.roles.filter(v => v.flag !== 'ADMIN')
  })
}
loadRoles()

</script>

<style scoped>
.login-container {
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to top, #00467f, #a5cc82)
}

.login-box {
  width: 350px;
  padding: 50px 30px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, .1);
  background-color: rgba(255, 255, 255, .5);
}
</style>