<template>
  <div class="admin-container">
    <header class="admin-header">
      <div class="header-left">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="system-title">美味点餐系统 - 管理后台</h1>
      </div>

      <div class="header-right">
        <div class="user-info">
          <el-icon><User /></el-icon>
          <span>{{ username }}</span>
        </div>
        <el-button type="danger" plain @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-button>
      </div>
    </header>

    <div class="admin-body">
      <aside class="admin-sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/admin">
            <el-icon><HomeFilled /></el-icon>
            <span>首页概览</span>
          </el-menu-item>
          <el-sub-menu index="user">
            <template #title>
              <el-icon><UserFilled /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/admin/user">用户列表</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="category">
            <template #title>
              <el-icon><FolderOpened /></el-icon>
              <span>分类管理</span>
            </template>
            <el-menu-item index="/admin/category">分类列表</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="food">
            <template #title>
              <el-icon><Food /></el-icon>
              <span>食品管理</span>
            </template>
            <el-menu-item index="/admin/food">食品列表</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="employee">
            <template #title>
              <el-icon><Avatar /></el-icon>
              <span>员工管理</span>
            </template>
            <el-menu-item index="/admin/employee">员工列表</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="order">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/admin/order">订单列表</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </aside>

      <main class="admin-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { User, SwitchButton, HomeFilled, UserFilled, FolderOpened, Food, Avatar, Document } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const admin = ref(JSON.parse(localStorage.getItem('admin') || '{}'))
const username = computed(() => admin.value.username || '管理员')

const activeMenu = computed(() => {
  const path = route.path
  if (path === '/admin' || path === '/admin/') {
    return '/admin'
  }
  return path
})

const handleMenuSelect = (index) => {
  router.push(index)
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('admin')
    router.push('/admin-login')
  }).catch(() => {})
}
</script>

<style scoped>
.admin-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.admin-header {
  height: 60px;
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo svg {
  width: 24px;
  height: 24px;
  color: white;
}

.system-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
}

.admin-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.admin-sidebar {
  width: 220px;
  background: white;
  border-right: 1px solid #e4e7ed;
  flex-shrink: 0;
  overflow-y: auto;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 220px;
}

.admin-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
</style>