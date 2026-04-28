<template>
  <div class="notifications-container">
    <header class="notifications-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">消息通知</h1>
      </div>
      <el-button text type="primary" @click="markAllRead" v-if="unreadCount > 0">
        全部已读
      </el-button>
    </header>

    <main class="notifications-main">
      <div v-if="notifications.length > 0" class="notifications-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-card"
          :class="{ 'is-unread': !notification.isRead }"
          @click="handleRead(notification)"
        >
          <div class="notification-icon">
            <el-icon :size="24">
              <Bell v-if="notification.type === 'order'" />
              <ChatDotRound v-else-if="notification.type === 'message'" />
              <Warning v-else />
            </el-icon>
          </div>
          <div class="notification-content">
            <div class="notification-header">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <span class="notification-time">{{ notification.createTime }}</span>
            </div>
            <p class="notification-text">{{ notification.content }}</p>
          </div>
          <div v-if="!notification.isRead" class="unread-dot"></div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">
          <el-icon :size="80"><Bell /></el-icon>
        </div>
        <p class="empty-text">暂无消息通知</p>
        <p class="empty-desc">新消息会第一时间通知您</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Bell, ChatDotRound, Warning } from '@element-plus/icons-vue'
import { mockNotifications } from '../../../data/mockData'

const router = useRouter()

const notifications = ref([...mockNotifications])

const unreadCount = computed(() => {
  return notifications.value.filter(n => n.userId === 1 && !n.isRead).length
})

const goBack = () => {
  router.back()
}

const handleRead = (notification) => {
  if (!notification.isRead) {
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index > -1) {
      notifications.value[index].isRead = 1
    }
  }
}

const markAllRead = () => {
  notifications.value.forEach(n => {
    if (n.userId === 1) {
      n.isRead = 1
    }
  })
  ElMessage.success('已全部标记为已读')
}
</script>

<style scoped>
.notifications-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.notifications-header {
  background: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.notifications-main {
  flex: 1;
  padding: 20px;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
}

.notification-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.notification-card.is-unread {
  background: linear-gradient(135deg, #fef3c7 0%, #fff 100%);
  border-left: 4px solid #f59e0b;
}

.notification-icon {
  width: 48px;
  height: 48px;
  background: #e0e7ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.notification-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.notification-time {
  font-size: 12px;
  color: #94a3b8;
  flex-shrink: 0;
  margin-left: 12px;
}

.notification-text {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.unread-dot {
  width: 10px;
  height: 10px;
  background: #f56c6c;
  border-radius: 50%;
  position: absolute;
  top: 16px;
  right: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  color: #cbd5e1;
  margin-bottom: 24px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 8px 0;
}

.empty-desc {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

@media (max-width: 768px) {
  .notifications-header {
    padding: 12px 16px;
  }
  
  .notifications-main {
    padding: 16px;
  }
  
  .notification-card {
    padding: 12px;
    gap: 12px;
  }
  
  .notification-icon {
    width: 40px;
    height: 40px;
  }
  
  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .notification-time {
    margin-left: 0;
  }
}
</style>
