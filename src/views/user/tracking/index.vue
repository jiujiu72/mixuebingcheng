<template>
  <div class="tracking-container">
    <header class="tracking-header">
      <div class="header-left">
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

    <main class="tracking-main" v-loading="loading">
      <div v-if="order" class="tracking-content">
        <div class="delivery-status-card">
          <div class="status-header">
            <div class="status-icon">
              <el-icon :size="48" v-if="order.status === 1"><Clock /></el-icon>
              <el-icon :size="48" v-else-if="order.status === 2"><Checked /></el-icon>
              <el-icon :size="48" v-else-if="order.status === 3"><Van /></el-icon>
              <el-icon :size="48" v-else-if="order.status === 4"><CircleCheck /></el-icon>
              <el-icon :size="48" v-else><Close /></el-icon>
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
              <el-icon :size="40"><User /></el-icon>
            </div>
            <div class="rider-info">
              <div class="rider-name">
                <span>{{ deliveryMan.name }}</span>
                <el-rate :model-value="deliveryMan.rating" disabled show-score text-color="#ff9900" />
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

        <div class="tracking-steps-card">
          <h3 class="card-title">物流状态</h3>
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

        <div class="order-info-card">
          <h3 class="card-title">订单信息</h3>
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

        <div class="order-items-card">
          <h3 class="card-title">订单商品</h3>
          <div class="items-list">
            <div v-for="(item, index) in order.items" :key="index" class="item-row">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-quantity">x{{ item.quantity }}</span>
              <span class="item-price">¥{{ item.price * item.quantity }}</span>
            </div>
          </div>
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
        <el-icon :size="64"><Document /></el-icon>
        <p>订单不存在</p>
        <el-button type="primary" @click="goToOrders">查看我的订单</el-button>
      </div>
    </main>

    <el-dialog v-model="contactDialogVisible" title="联系骑手" width="400px">
      <div class="contact-content">
        <div class="contact-rider-info">
          <div class="rider-avatar">
            <el-icon :size="48"><User /></el-icon>
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
          class="notification-item"
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
          <el-icon :size="48"><Bell /></el-icon>
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
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.tracking-header {
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

.tracking-main {
  flex: 1;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.tracking-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.delivery-status-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.status-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.status-desc {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.countdown {
  font-size: 18px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
}

.delivery-man-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.rider-avatar {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
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
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.rider-stats {
  font-size: 13px;
  opacity: 0.9;
}

.rider-actions {
  display: flex;
  gap: 12px;
}

.tracking-steps-card,
.order-info-card,
.order-items-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.tracking-item {
  padding: 8px 0;
}

.tracking-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.tracking-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.info-row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  width: 80px;
  font-size: 14px;
  color: #64748b;
}

.info-row .value {
  flex: 1;
  font-size: 14px;
  color: #334155;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.item-name {
  flex: 1;
  font-size: 14px;
  color: #334155;
}

.item-quantity {
  width: 60px;
  text-align: center;
  font-size: 14px;
  color: #64748b;
}

.item-price {
  width: 80px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.price-summary {
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #64748b;
}

.summary-row.total {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.total-price {
  color: #f56c6c;
  font-size: 20px;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-buttons .el-button {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  color: #94a3b8;
}

.empty-state p {
  margin: 20px 0;
  font-size: 16px;
}

.contact-content {
  padding: 10px 0;
}

.contact-rider-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.rider-details h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.rider-details p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  position: relative;
}

.notification-item.is-unread {
  background: linear-gradient(135deg, #fef3c7 0%, #fff 100%);
}

.notification-icon {
  width: 40px;
  height: 40px;
  background: #e0e7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.notification-text {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 8px 0;
}

.notification-time {
  font-size: 12px;
  color: #94a3b8;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #f56c6c;
  border-radius: 50%;
  position: absolute;
  top: 16px;
  right: 16px;
}

.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.empty-notifications p {
  margin-top: 16px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .tracking-header {
    padding: 12px 16px;
  }
  
  .tracking-main {
    padding: 16px;
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
