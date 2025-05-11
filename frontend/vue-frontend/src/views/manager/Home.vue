<template>
  <div>

    <el-row :gutter="10">
      <el-col :span="24">
        <div class="card" style="margin-bottom: 10px">
          <div>欢迎您，{{ user.name }} 祝您今天过得开心！</div>
        </div>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="12">
        <div class="card" style="padding: 20px; margin-bottom: 10px">
          <div style="font-size: 20px; margin-bottom: 20px">系统简介</div>
          <div style="line-height: 25px; color: #666">
            本管理系统适用于所有的Web管理后台程序，专门为毕设、课设量身定做。
            支持深度定制，以做出更强系统。所有前端后台代码封装过后十分精简易上手，出错概率低。
            功能丰富，一键生成让你满意的管理系统
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="12">
        <div class="card" style="padding: 20px">
          <div style="font-size: 20px; margin-bottom: 20px">技术栈</div>
          <div style="margin-bottom: 10px; color: #666">
            后台：SpringBoot3 + MyBatis + JWT + Hutool
          </div>
          <div style="color:#666; margin-bottom: 10px;">
            前台：Vue3 + Element-Plus + Vue-Router + Axios
          </div>
          <div style="color:#666; margin-bottom: 10px;">
            数据库：Mysql 5.7 / 8.0
          </div>
          <div style="color:#666; margin-bottom: 10px;">
            编程工具：IDEA、Navicat
          </div>
          <div style="color:#666; margin-bottom: 10px;">
            模式：前后端分离
          </div>
          <div style="color:#666; margin-bottom: 10px;">
            操作系统：Windows / Mac
          </div>
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<script setup>
  const user = JSON.parse(localStorage.getItem('user') || '{}')
</script>