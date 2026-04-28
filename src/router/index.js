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
import AdminDeliveryMan from '../views/admin/delivery/index.vue'
import DeliveryManLogin from '../views/DeliveryManLogin.vue'
import DeliveryMan from '../views/delivery/index.vue'
import DeliveryDashboard from '../views/delivery/dashboard/index.vue'
import DeliveryOrders from '../views/delivery/orders/index.vue'
import UserAddress from '../views/user/address/index.vue'
import UserOrders from '../views/user/orders/index.vue'
import OrderTracking from '../views/user/tracking/index.vue'
import UserNotifications from '../views/user/notifications/index.vue'

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
    path: '/user/address',
    name: 'UserAddress',
    component: UserAddress,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/user/orders',
    name: 'UserOrders',
    component: UserOrders,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/user/tracking/:orderId',
    name: 'OrderTracking',
    component: OrderTracking,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/user/notifications',
    name: 'UserNotifications',
    component: UserNotifications,
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
    path: '/delivery-login',
    name: 'DeliveryManLogin',
    component: DeliveryManLogin
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
        path: 'delivery',
        name: 'AdminDeliveryMan',
        component: AdminDeliveryMan
      },
      {
        path: 'order',
        name: 'AdminOrder',
        component: AdminOrder
      }
    ]
  },
  {
    path: '/delivery',
    name: 'DeliveryMan',
    component: DeliveryMan,
    meta: {
      requiresDelivery: true
    },
    children: [
      {
        path: '',
        name: 'DeliveryDashboard',
        component: DeliveryDashboard
      },
      {
        path: 'orders',
        name: 'DeliveryOrders',
        component: DeliveryOrders
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const requiresDelivery = to.matched.some(record => record.meta.requiresDelivery)
  const user = localStorage.getItem('user')
  const admin = localStorage.getItem('admin')
  const deliveryMan = localStorage.getItem('deliveryMan')

  if (requiresAuth && !user) {
    return '/login'
  } else if (requiresAdmin && !admin) {
    return '/admin-login'
  } else if (requiresDelivery && !deliveryMan) {
    return '/delivery-login'
  }
  return true
})

export default router