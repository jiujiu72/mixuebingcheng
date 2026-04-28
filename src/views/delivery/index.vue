<template>
  <div class="delivery-container">
    <header class="delivery-header">
      <div class="header-left">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2V22M2 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 9L8 6L11 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 15L16 18L13 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="header-title">
          <h1>骑手配送端</h1>
          <p>欢迎，{{ deliveryManName }}</p>
        </div>
      </div>
      
      <div class="header-right">
        <div class="online-status">
          <el-switch 
            v-model="isOnline" 
            :active-value="1" 
            :inactive-value="0"
            :active-text="'在线'"
            :inactive-text="'离线'"
            @change="handleOnlineChange"
          />
        </div>
        <el-button type="danger" plain @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          退出登录
        </el-button>
      </div>
    </header>

    <div class="delivery-body">
      <aside class="delivery-sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          background-color="#fff5eb"
          text-color="#334155"
          active-text-color="#f97316"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/delivery">
            <el-icon><Van /></el-icon>
            <span>抢单大厅</span>
            <el-badge v-if="pendingCount > 0" :value="pendingCount" class="menu-badge" />
          </el-menu-item>
          <el-menu-item index="/delivery/orders">
            <el-icon><Document /></el-icon>
            <span>我的订单</span>
          </el-menu-item>
          <el-menu-item index="/delivery/reviews">
            <el-icon><ChatDotRound /></el-icon>
            <span>我的评价</span>
            <el-badge v-if="unreadReviewsCount > 0" :value="unreadReviewsCount" class="menu-badge" />
          </el-menu-item>
        </el-menu>
      </aside>

      <main class="delivery-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  Van, Document, User, SwitchButton, Bell, ChatDotRound
} from '@element-plus/icons-vue'
import { mockDeliveryMen, mockOrders, mockReviews } from '../../data/mockData'

const router = useRouter()
const route = useRoute()

const deliveryMan = ref(JSON.parse(localStorage.getItem('deliveryMan') || '{}'))
const deliveryManName = computed(() => deliveryMan.value.name || '骑手')
const isOnline = ref(deliveryMan.value.isOnline || 1)

provide('isOnline', isOnline)

const activeMenu = computed(() => {
  const path = route.path
  if (path === '/delivery' || path === '/delivery/') {
    return '/delivery'
  }
  return path
})

const pendingCount = computed(() => {
  return mockOrders.filter(o => 
    (o.status === 1 || o.status === 2) && !o.deliveryManId
  ).length
})

const unreadReviewsCount = computed(() => {
  if (!deliveryMan.value?.id) return 0
  return mockReviews.filter(r => 
    r.deliveryManId === deliveryMan.value.id && !r.reply
  ).length
})

const handleMenuSelect = (index) => {
  router.push(index)
}

const handleOnlineChange = (val) => {
  if (val === 1) {
    ElMessage.success('已上线，开始接单')
  } else {
    ElMessageBox.confirm('确定要下线吗？下线后将无法接收新订单', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage.info('已下线')
    }).catch(() => {
      isOnline.value = 1
    })
  }
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('deliveryMan')
    router.push('/delivery-login')
    ElMessage.success('已退出登录')
  }).catch(() => {})
}

onMounted(() => {
  if (deliveryMan.value.id) {
    const dm = mockDeliveryMen.find(d => d.id === deliveryMan.value.id)
    if (dm) {
      isOnline.value = dm.isOnline
    }
  }
})
</script>

<style scoped>
.delivery-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.delivery-header {
  height: 64px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(249, 115, 22, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo svg {
  width: 28px;
  height: 28px;
  color: white;
}

.header-title h1 {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0 0 2px 0;
}

.header-title p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.online-status {
  background: rgba(255, 255, 255, 0.15);
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-switch__label--active) {
  color: white;
}

:deep(.el-switch__label--inactive) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.el-switch) {
  --el-switch-on-color: #10b981;
  --el-switch-off-color: #94a3b8;
}

.delivery-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.delivery-sidebar {
  width: 200px;
  background: #fff5eb;
  border-right: 1px solid #fed7aa;
  flex-shrink: 0;
  overflow-y: auto;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
  background: transparent;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}

:deep(.el-menu-item) {
  height: 56px;
  line-height: 56px;
  font-size: 15px;
  position: relative;
}

:deep(.el-menu-item:hover) {
  background: #fed7aa;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #fed7aa 0%, #fbbf24 20%);
  color: #f97316;
}

.menu-badge {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.delivery-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f5f7fa;
}

@media (max-width: 768px) {
  .delivery-header {
    padding: 0 16px;
    height: 56px;
  }
  
  .header-title h1 {
    font-size: 16px;
  }
  
  .header-right {
    gap: 12px;
  }
  
  .online-status {
    padding: 6px 12px;
  }
  
  .delivery-sidebar {
    width: 64px;
  }
  
  .sidebar-menu:not(.el-menu--collapse) {
    width: 64px;
  }
  
  :deep(.el-menu-item span) {
    display: none;
  }
  
  :deep(.el-menu-item .el-badge) {
    display: none;
  }
  
  .delivery-main {
    padding: 16px;
  }
}
</style>
