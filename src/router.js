import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/Users.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [{
        path: '/welcome', component: Welcome
      }, {
        path: '/users', component: Users
      }]
    }
  ]
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
