<template>
  <div class="tracking-container">
    <header class="page-header">
      <div class="page-header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">订单跟踪</h1>
      </div>
      <el-button type="primary" plain size="small" @click="refreshData">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </header>

    <main class="page-container tracking-main" v-loading="loading">
      <div v-if="order" class="tracking-content">
        <div class="card delivery-status-card">
          <div class="status-header">
            <div class="status-icon">
              <el-icon :size="36" v-if="order.status === 1"><Clock /></el-icon>
              <el-icon :size="36" v-else-if="order.status === 2"><Checked /></el-icon>
              <el-icon :size="36" v-else-if="order.status === 3"><Van /></el-icon>
              <el-icon :size="36" v-else-if="order.status === 4"><CircleCheck /></el-icon>
              <el-icon :size="36" v-else><Close /></el-icon>
            </div>
            <div class="status-info">
              <h2 class="status-title">{{ currentStatusText }}</h2>
              <p class="status-desc" v-if="order.status === 3">
                预计还需 <span class="countdown">{{ remainingTimeText }}</span> 送达
              </p>
              <p class="status-desc" v-else>
                订单号: {{ order.id }}
              </p>
            </div>
          </div>
          
          <div v-if="deliveryMan" class="delivery-man-info">
            <div class="rider-avatar">
              <el-icon :size="28"><User /></el-icon>
            </div>
            <div class="rider-info">
              <div class="rider-name">
                <span>{{ deliveryMan.name }}</span>
                <el-rate :model-value="deliveryMan.rating" disabled show-score text-color="var(--warning-500)" />
              </div>
              <div class="rider-stats">
                <span>已完成 {{ deliveryMan.orderCount }} 单</span>
              </div>
            </div>
            <div class="rider-actions">
              <el-button type="primary" circle @click="callDeliveryMan">
                <el-icon><Phone /></el-icon>
              </el-button>
              <el-button type="success" circle @click="messageDeliveryMan">
                <el-icon><ChatDotRound /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <div class="card tracking-steps-card">
          <h3 class="section-title" style="margin-bottom: var(--spacing-lg);">物流状态</h3>
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in trackingLogs"
              :key="log.id"
              :timestamp="log.time"
              placement="top"
              :type="getTimelineType(index)"
            >
              <div class="tracking-item">
                <h4 class="tracking-title">{{ getTrackingTitle(log.status) }}</h4>
                <p class="tracking-desc">{{ log.description }}</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <div class="card order-info-card">
          <h3 class="section-title" style="margin-bottom: var(--spacing-lg);">订单信息</h3>
          <div class="info-row">
            <span class="label">配送地址</span>
            <span class="value">{{ order.address }}</span>
          </div>
          <div class="info-row">
            <span class="label">收货人</span>
            <span class="value">{{ order.userName }} {{ order.phone }}</span>
          </div>
          <div class="info-row">
            <span class="label">下单时间</span>
            <span class="value">{{ order.orderTime }}</span>
          </div>
          <div class="info-row" v-if="order.remark">
            <span class="label">备注</span>
            <span class="value">{{ order.remark }}</span>
          </div>
        </div>

        <div class="card order-items-card">
          <h3 class="section-title" style="margin-bottom: var(--spacing-lg);">订单商品</h3>
          <div class="items-list">
            <div v-for="(item, index) in order.items" :key="index" class="item-row">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-quantity">x{{ item.quantity }}</span>
              <span class="item-price">¥{{ item.price * item.quantity }}</span>
            </div>
          </div>
          <div class="divider"></div>
          <div class="price-summary">
            <div class="summary-row">
              <span>商品总价</span>
              <span>¥{{ order.totalPrice }}</span>
            </div>
            <div class="summary-row">
              <span>优惠</span>
              <span>-¥{{ (order.totalPrice - order.actualPrice).toFixed(2) }}</span>
            </div>
            <div class="summary-row total">
              <span>实付金额</span>
              <span class="total-price">¥{{ order.actualPrice }}</span>
            </div>
          </div>
        </div>

        <div class="action-buttons" v-if="order.status === 3">
          <el-button type="primary" size="large" @click="showContactDialog">
            联系骑手
          </el-button>
          <el-button type="success" size="large" @click="confirmReceive">
            确认收货
          </el-button>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-icon :size="48" class="empty-state-icon"><Document /></el-icon>
        <p class="empty-state-title">订单不存在</p>
        <el-button type="primary" @click="goToOrders">查看我的订单</el-button>
      </div>
    </main>

    <el-dialog v-model="contactDialogVisible" title="联系骑手" width="400px">
      <div class="contact-content">
        <div class="contact-rider-info">
          <div class="rider-avatar">
            <el-icon :size="32"><User /></el-icon>
          </div>
          <div class="rider-details">
            <h4>{{ deliveryMan?.name }}</h4>
            <p>电话: {{ deliveryMan?.phone }}</p>
          </div>
        </div>
        <el-input
          v-model="messageContent"
          type="textarea"
          :rows="3"
          placeholder="输入消息内容..."
        />
      </div>
      <template #footer>
        <el-button @click="contactDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="sendMessage">发送消息</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="notificationDrawer" :title="'消息通知'" direction="rtl" size="80%">
      <div class="notification-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="card notification-item"
          :class="{ 'is-unread': !notification.isRead }"
        >
          <div class="notification-icon">
            <el-icon :size="20"><Bell /></el-icon>
          </div>
          <div class="notification-content">
            <h4 class="notification-title">{{ notification.title }}</h4>
            <p class="notification-text">{{ notification.content }}</p>
            <span class="notification-time">{{ notification.createTime }}</span>
          </div>
          <div v-if="!notification.isRead" class="unread-dot"></div>
        </div>
        <div v-if="notifications.length === 0" class="empty-notifications">
          <el-icon :size="48" class="empty-state-icon"><Bell /></el-icon>
          <p>暂无消息通知</p>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, Refresh, Clock, Checked, Van, CircleCheck, Close,
  User, Phone, ChatDotRound, Document, Bell
} from '@element-plus/icons-vue'
import { 
  mockOrders, mockOrderTracking, mockDeliveryMen, 
  mockNotifications, orderStatusMap, deliveryStatusMap 
} from '../../../data/mockData'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const order = ref(null)
const deliveryMan = ref(null)
const trackingLogs = ref([])
const notifications = ref([])
const contactDialogVisible = ref(false)
const notificationDrawer = ref(false)
const messageContent = ref('')
const remainingTime = ref(30 * 60)
const refreshInterval = ref(null)

const currentStatusText = computed(() => {
  if (!order.value) return ''
  return orderStatusMap[order.value.status]?.label || '未知状态'
})

const remainingTimeText = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60)
  const seconds = remainingTime.value % 60
  return `${minutes}分${seconds.toString().padStart(2, '0')}秒`
})

const goBack = () => {
  router.back()
}

const goToOrders = () => {
  router.push('/user/orders')
}

const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('已刷新')
  }, 500)
}

const getTimelineType = (index) => {
  if (index === 0) return 'primary'
  return ''
}

const getTrackingTitle = (status) => {
  return deliveryStatusMap[status]?.label || '未知'
}

const callDeliveryMan = () => {
  if (deliveryMan.value) {
    ElMessage.info(`正在拨打 ${deliveryMan.value.phone}`)
  }
}

const messageDeliveryMan = () => {
  contactDialogVisible.value = true
}

const showContactDialog = () => {
  contactDialogVisible.value = true
}

const sendMessage = () => {
  if (!messageContent.value.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }
  ElMessage.success('消息已发送')
  contactDialogVisible.value = false
  messageContent.value = ''
}

const confirmReceive = () => {
  ElMessageBox.confirm('确认已收到订单中的所有商品吗？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    if (order.value) {
      const index = mockOrders.findIndex(o => o.id === order.value.id)
      if (index > -1) {
        mockOrders[index].status = 4
        order.value.status = 4
        ElMessage.success('确认收货成功')
      }
    }
  }).catch(() => {})
}

const loadOrderData = () => {
  const orderId = route.params.orderId
  if (!orderId) {
    return
  }
  
  loading.value = true
  setTimeout(() => {
    order.value = mockOrders.find(o => o.id === orderId)
    
    if (order.value) {
      if (order.value.deliveryManId) {
        deliveryMan.value = mockDeliveryMen.find(d => d.id === order.value.deliveryManId)
      }
      
      trackingLogs.value = mockOrderTracking
        .filter(t => t.orderId === orderId)
        .sort((a, b) => new Date(b.time) - new Date(a.time))
      
      if (order.value.status === 3) {
        remainingTime.value = order.value.estimatedDeliveryTime * 60
      }
    }
    
    notifications.value = mockNotifications.filter(n => n.userId === 1)
    
    loading.value = false
  }, 300)
}

const startTimer = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
  
  refreshInterval.value = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    }
    
    if (Math.random() > 0.95) {
      ElMessage({
        message: '骑手正在配送中...',
        type: 'info',
        duration: 3000
      })
    }
  }, 1000)
}

onMounted(() => {
  loadOrderData()
  if (order.value?.status === 3) {
    startTimer()
  }
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<style scoped>
.tracking-container {
  min-height: 100vh;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
}

.tracking-main {
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.tracking-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.delivery-status-card {
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
  border: none;
  color: white;
}

.status-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.status-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-sm) 0;
  color: white;
}

.status-desc {
  font-size: var(--font-size-sm);
  opacity: 0.9;
  margin: 0;
  color: white;
}

.countdown {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.delivery-man-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding-top: var(--spacing-xl);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.rider-avatar {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.rider-info {
  flex: 1;
}

.rider-name {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-xs);
}

.rider-stats {
  font-size: var(--font-size-xs);
  opacity: 0.9;
}

.rider-actions {
  display: flex;
  gap: var(--spacing-md);
}

.tracking-steps-card,
.order-info-card,
.order-items-card {
  padding: var(--spacing-xl);
}

.tracking-item {
  padding: var(--spacing-sm) 0;
}

.tracking-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.tracking-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.info-row {
  display: flex;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border-primary);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  width: 80px;
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.info-row .value {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.item-row {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-secondary);
}

.item-name {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.item-quantity {
  width: 60px;
  text-align: center;
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.item-price {
  width: 80px;
  text-align: right;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.price-summary {
  padding-top: var(--spacing-lg);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.summary-row.total {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-primary);
}

.total-price {
  color: var(--primary-600);
  font-size: var(--font-size-xl);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-lg);
}

.action-buttons .el-button {
  flex: 1;
  height: 44px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

.contact-content {
  padding: 10px 0;
}

.contact-rider-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-primary);
}

.rider-details h4 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-base);
}

.rider-details p {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.notification-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  position: relative;
}

.notification-item.is-unread {
  border-left: 3px solid var(--primary-500);
}

.notification-icon {
  width: 40px;
  height: 40px;
  background: var(--primary-50);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-600);
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.notification-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-xs) 0;
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
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

.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl) var(--spacing-xl);
  color: var(--text-tertiary);
}

.empty-notifications p {
  margin-top: var(--spacing-lg);
  font-size: var(--font-size-base);
}

@media (max-width: 768px) {
  .tracking-main {
    padding: var(--spacing-lg);
  }
  
  .status-header {
    flex-direction: column;
    text-align: center;
  }
  
  .delivery-man-info {
    flex-wrap: wrap;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
