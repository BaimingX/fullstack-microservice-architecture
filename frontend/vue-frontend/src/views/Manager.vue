<template>
  <div class="manager-container">
    <div class="manager-header">
      <div class="manager-header-left">
        <img src="@/assets/imgs/logo.png" alt="">
        <div class="title">管理系统</div>
      </div>
      <div class="manager-header-center">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/manager/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: router.currentRoute.value.path }">{{ router.currentRoute.value.meta.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="manager-header-right">
        <el-dropdown style="cursor: pointer;">
          <div style="padding-right: 20px; display: flex; align-items: center;">
            <img v-if="data.user.avatar" :src="data.user.avatar" alt="" style="width: 40px; height: 40px; display: block; border-radius: 50%">
            <img v-else src="@/assets/imgs/avatar.png" alt="" style="width: 40px; height: 40px; display: block; border-radius: 50%">
            <span style="margin-left: 5px">{{ data.user?.name }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item><div @click="router.push('/manager/person')">个人资料</div></el-dropdown-item>
              <el-dropdown-item><div @click="router.push('/manager/password')">修改密码</div></el-dropdown-item>
              <el-dropdown-item><div @click="logout">退出登录</div></el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div style="display: flex">
      <div class="manager-main-left">
        <el-menu
            :default-active="router.currentRoute.value.path"
            :default-openeds="openMenuIds"
            router
        >
          <el-menu-item index="/manager/home">
            <el-icon><home-filled /></el-icon>
            <span>系统首页</span>
          </el-menu-item>

          
          <template v-for="item in filteredMenus" :key="item.id">
            <!-- 如果是单菜单 (type='Menu') -->
            <el-menu-item
              v-if="item.type === 'Menu'"
              :index="'/manager/' + item.path"
            >
              <el-icon v-if="item.icon">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.name }}</span>
            </el-menu-item>

            <!-- 如果是目录(可能type='目录'或者其他) -->
            <el-sub-menu
              v-else
              :index="String(item.id)"
            >
              <template #title>
                <el-icon v-if="item.icon">
                  <component :is="item.icon" />
                </el-icon>
                <span>{{ item.name }}</span>
              </template>

              <!-- 再循环它的 children -->
              <el-menu-item
                v-for="subItem in item.children"
                :key="subItem.id"
                :index="'/manager/' + subItem.path"
              >
                <el-icon v-if="subItem.icon">
                  <component :is="subItem.icon" />
                </el-icon>
                <span>{{ subItem.name }}</span>
              </el-menu-item>
            </el-sub-menu>
          </template>



           <!-- 处理 type = 'Site' 的菜单节点(比如只有一个“Site Control”) -->
           <el-sub-menu
            v-for="siteMenu in siteMenus"
            :key="siteMenu.id"
            :index="'siteMenu_'+String(siteMenu.id)"
          >
            <!-- 顶层菜单标题(“Site Control”) -->
            <template #title>
              <el-icon v-if="siteMenu.icon">
                <component :is="siteMenu.icon" />
              </el-icon>
              <span>{{ siteMenu.name }}</span>
            </template>

            <!-- 循环所有站点 -->
            <el-sub-menu
              v-for="site in data.user.sites || []"
              :key="site.id"
              :index="'site_' + site.id"
            >
              <template #title>
                <!-- 显示站点 Logo + 名称 -->
                <div style="display: flex; align-items: center;">
                  <img
                    v-if="site.logo"
                    :src="site.logo"
                    alt="logo"
                    style="width: 20px; height: 20px; margin-right: 5px; border-radius: 3px; object-fit: cover;"
                  />
                  <span>{{ site.name }}</span>
                </div>
              </template>

              <!-- 站点下再循环 siteMenu.children (Category/Goods/Carousel) -->
              <el-menu-item
                v-for="child in siteMenu.children"
                :key="child.id"
                :index="'/manager/site/' + site.id + '/' + child.path"
              >
                <el-icon v-if="child.icon">
                  <component :is="child.icon" />
                </el-icon>
                <span>{{ child.name }}</span>
              </el-menu-item>
            </el-sub-menu>
          </el-sub-menu>
        </el-menu>
      </div>

      <div class="manager-main-right">
        <router-view @updateUser="updateUser" :key="$route.params.siteId" />
      </div>
    </div>

  </div>
</template>

<script setup>
import {HomeFilled} from "@element-plus/icons-vue";
import {reactive,computed } from "vue";
import router from "@/router";
import { onMounted } from "vue";

// const openMenuIds = computed(() => {
//   // 如果需要默认展开所有顶级菜单，可以返回 data.user.menus.map(m => String(m.id))
//   // 或者只展开 type="Site" 的
//   console.log(data.user.menus.map(v => String(v.id)))
//   return data.user.menus.map(v => String(v.id))
// });
const openMenuIds = computed(() => [])

const data = reactive({
  user: JSON.parse(localStorage.getItem('user') || '{}')
})

onMounted(() => {
  console.log("当前已注册的路由：",data);
});
const logout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}

const updateUser = (user) => {
  if (!user) return;
  localStorage.setItem('user', JSON.stringify(user));
  Object.assign(data.user, user);
};

const filteredMenus = computed(() =>
  data.user.menus?.filter((item) => item.type !== "Site") || []
);

const siteMenus = computed(() => data.user.menus?.filter((item) => item.type === "Site") || []);

</script>

<style scoped>
@import "@/assets/css/manager.css";
</style>
