import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Home from '../views/Home.vue'
import Dashboard from '../views/dashboard/index.vue'
import User from '../views/user/index.vue'
import Category from '../views/category/index.vue'
import Food from '../views/food/index.vue'
import Employee from '../views/employee/index.vue'
import Order from '../views/order/index.vue'

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
    },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'user',
        name: 'User',
        component: User
      },
      {
        path: 'category',
        name: 'Category',
        component: Category
      },
      {
        path: 'food',
        name: 'Food',
        component: Food
      },
      {
        path: 'employee',
        name: 'Employee',
        component: Employee
      },
      {
        path: 'order',
        name: 'Order',
        component: Order
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
  const user = localStorage.getItem('user')

  if (requiresAuth && !user) {
    next('/login')
  } else {
    next()
  }
})

export default router