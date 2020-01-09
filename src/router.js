import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]

const router = new VueRouter({
  routes
})

// 挂在导航守卫
router.beforeEach((to, from, next) => {
  // to将要访问的页面
  // from代表从哪个路径而来
  // next 是一个函数，表示放行 next()   next('/login')强制跳转
  if (to.path === '/login') {
    return next()
  } else {
    const tokenStr = window.sessionStorage.getItem('token')
    if (tokenStr) {
      next()
    } else {
      return next('/login')
    }
  }
})

export default router