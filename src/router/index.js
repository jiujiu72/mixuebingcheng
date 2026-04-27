import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import AdminLogin from '../views/AdminLogin.vue'
import Admin from '../views/admin/index.vue'
import AdminDashboard from '../views/admin/dashboard/index.vue'
import AdminUser from '../views/admin/user/index.vue'
import AdminCategory from '../views/admin/category/index.vue'
import AdminFood from '../views/admin/food/index.vue'
import AdminEmployee from '../views/admin/employee/index.vue'
import AdminOrder from '../views/admin/order/index.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/admin-login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: {
      requiresAdmin: true
    },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard
      },
      {
        path: 'user',
        name: 'AdminUser',
        component: AdminUser
      },
      {
        path: 'category',
        name: 'AdminCategory',
        component: AdminCategory
      },
      {
        path: 'food',
        name: 'AdminFood',
        component: AdminFood
      },
      {
        path: 'employee',
        name: 'AdminEmployee',
        component: AdminEmployee
      },
      {
        path: 'order',
        name: 'AdminOrder',
        component: AdminOrder
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const user = localStorage.getItem('user')
  const admin = localStorage.getItem('admin')

  if (requiresAuth && !user) {
    next('/login')
  } else if (requiresAdmin && !admin) {
    next('/admin-login')
  } else {
    next()
  }
})

export default router