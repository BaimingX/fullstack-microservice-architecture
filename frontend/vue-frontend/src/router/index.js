import {createRouter, createWebHistory} from 'vue-router'
const modules = import.meta.glob('../views/manager/*.vue')

const upperFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const options = {
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login'},
    {
      path: '/manager',
      name: 'Manager',
      component: () => import('@/views/Manager.vue'),
      redirect: '/manager/home',
      children: [
        { path: 'person', meta: { name: '个人资料' }, component: () => import('@/views/manager/Person.vue')},
        { path: 'password', meta: { name: '个人资料' }, component: () => import('@/views/manager/Password.vue')},
        { path: 'home', meta: { name: '系统首页' }, component: () => import('@/views/manager/Home.vue')},
      ]
    },
    { path: '/login', component: () => import('@/views/Login.vue')},
    { path: '/register', component: () => import('@/views/Register.vue')},
  ]
}

const router = createRouter(options)

// 注意：刷新页面会导致页面路由重置
export const setRoutes = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.menus && user.menus.length) {
    const menus = user.menus
    const newRouter = createRouter(options)
    router.matcher = newRouter.matcher
    // 开始渲染 未来的不确定的  用户添加的路由
    menus.forEach(item => {   // 所有的页面都需要设置路由，而目录不需要设置路由
      if (item.type === 'Menu') {  // 当且仅当是菜单的时候才去设置路由
        let page = upperFirst(item.path)
        router.addRoute('Manager', {path: item.path, meta: { name: item.name }, component: modules['../views/manager/' + page + '.vue']})
      } else if(item.type === 'Directory') {
        if (item.children && item.children.length) {
          item.children.forEach(sub => {
            if (sub.path) {
              let page = upperFirst(sub.path)
              router.addRoute('Manager', {path: sub.path, meta: { name: sub.name }, component: modules['../views/manager/' + page + '.vue']})
            }
          })
        }
      } else if (item.type === 'Site') {
        if (item.children && item.children.length) {
          item.children.forEach((sub) => {
            if (sub.path) {
              const page = upperFirst(sub.path) // 例如 sub.path='category' => page='Category'
              // 拼接成 "/manager/site/:siteId/category"
              router.addRoute('Manager', {
                path: `site/:siteId/${sub.path}`,
                meta: { name: sub.name },
                component: modules[`../views/manager/${page}.vue`],
              })
            }
          })
        }
      }
    })
  }
}

setRoutes()

export default router

