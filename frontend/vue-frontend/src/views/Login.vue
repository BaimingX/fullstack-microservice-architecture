<template>
  <div class="login-container">
    <div class="login-box">
      <div style="font-weight: bold; font-size: 24px; text-align: center; margin-bottom: 30px; color: #1450aa">欢 迎 登 录</div>
      <el-form :model="data.form"  ref="formRef" :rules="data.rules">
        <el-form-item prop="username">
          <el-input :prefix-icon="User" size="large" v-model="data.form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input :prefix-icon="Lock" size="large" v-model="data.form.password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item prop="code">
          <div style="display: flex; align-items: center; grid-gap: 5px">
            <el-input size="large" v-model="data.form.code" placeholder="请输入验证码" style="width: 150px"></el-input>
            <div style="flex: 1;">
              <img @click="getCaptchaImg" :src="data.captchaImg" alt="" style="width: 100%; height: 40px; display: block">
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button size="large" type="primary" style="width: 100%" @click="login">登 录</el-button>
        </el-form-item>
        
      </el-form>
      <!-- <div style="text-align: right;">
        还没有账号？请 <a href="/register">注册</a>
      </div> -->
    </div>
  </div>
</template>

<script setup>
  import { reactive, ref } from "vue";
  import { User, Lock } from "@element-plus/icons-vue";
  import request from "@/utils/request";
  import {ElMessage} from "element-plus";
  import router, { setRoutes } from "@/router";

  const data = reactive({
    dialogVisible: true,
    form: {},
    rules: {
      username: [
        { required: true, message: '请输入账号', trigger: 'blur' },
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
      ],
      code: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      ]
    },
    captchaImg:''
    
  })

  const formRef = ref()

  const getCaptchaImg = () => {
  request.get('/captcha').then(res => {
    if (res.code === '200') {
      data.form.uuid = res.data.uuid
      data.captchaImg = "data:image/gif;base64," + res.data.img
    } else {
      ElMessage.error(res.msg)
    }
  })
}

  // 点击登录按钮的时候会触发这个方法
  const login = () => {
    formRef.value.validate((valid => {
      if (valid) {
        // 调用后台的接口
        request.post('/login', data.form).then(res => {
          if (res.code === '200') {
            ElMessage.success("登录成功")
            // 先设置用户菜单缓存
            localStorage.setItem('user', JSON.stringify(res.data))
            // 绑定角色路由
            setRoutes()
            router.push('/manager/home')
          } else {
            ElMessage.error(res.msg)
            getCaptchaImg()
          }
        })
      }
    })).catch(error => {
      console.error(error)
    })
  }

  getCaptchaImg()

</script>

<style scoped>
.login-container {
  height: 100vh;
  overflow:hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to top, #7f7fd5, #86a8e7, #91eae4);
}
.login-box {
  width: 350px;
  padding: 50px 30px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0,.1);
  background-color: rgba(255, 255, 255, .5);
}
</style>