<template>
  <div class="page-container">
    <header class="page-header">
      <div class="page-header-left">
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
          class="card notification-card"
          :class="{ 'is-unread': !notification.isRead }"
          @click="handleRead(notification)"
        >
          <div class="notification-icon" :class="notification.type">
            <el-icon :size="20">
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
        <div class="empty-state-icon">
          <el-icon :size="48"><Bell /></el-icon>
        </div>
        <p class="empty-state-title">暂无消息通知</p>
        <p class="empty-state-text">新消息会第一时间通知您</p>
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
.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  min-height: 100vh;
}

.notifications-main {
  margin-top: var(--spacing-xl);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 800px;
  margin: 0 auto;
}

.notification-card {
  padding: var(--spacing-lg);
  display: flex;
  gap: var(--spacing-lg);
  cursor: pointer;
  position: relative;
}

.notification-card:hover {
  border-color: var(--primary-200);
  box-shadow: var(--shadow-md);
}

.notification-card.is-unread {
  background: var(--slate-50);
  border-left: 3px solid var(--primary-500);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.order {
  background: var(--primary-50);
  color: var(--primary-600);
}

.notification-icon.message {
  background: var(--success-50);
  color: var(--success-600);
}

.notification-icon.system {
  background: var(--warning-50);
  color: var(--warning-600);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xs);
}

.notification-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  flex-shrink: 0;
  margin-left: var(--spacing-md);
}

.notification-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--line-height-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: var(--primary-500);
  border-radius: var(--radius-full);
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
}

@media (max-width: 768px) {
  .page-container {
    padding: var(--spacing-lg);
  }

  .page-header {
    margin: 0 calc(-1 * var(--spacing-lg));
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .notifications-main {
    margin-top: var(--spacing-lg);
  }

  .notification-card {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }

  .notification-icon {
    width: 36px;
    height: 36px;
  }

  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }

  .notification-time {
    margin-left: 0;
  }
}
</style>
