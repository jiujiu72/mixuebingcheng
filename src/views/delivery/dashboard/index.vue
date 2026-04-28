<template>
  <div class="delivery-dashboard">
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon income">
          <el-icon :size="28"><Money /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">今日收入</span>
          <span class="stat-value">¥{{ todayIncome.toLocaleString() }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orders">
          <el-icon :size="28"><Document /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">今日完成</span>
          <span class="stat-value">{{ todayOrders }} 单</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon delivering">
          <el-icon :size="28"><Van /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">配送中</span>
          <span class="stat-value">{{ deliveringCount }} 单</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon rating">
          <el-icon :size="28"><Star /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">服务评分</span>
          <span class="stat-value">{{ currentRating }}</span>
        </div>
      </div>
    </div>

    <el-alert v-if="isOfflineMode" type="warning" :closable="false" class="offline-alert">
      <template #title>
        <span class="alert-title">当前处于离线状态</span>
      </template>
      <span class="alert-content">您无法进行抢单和订单操作，请先点击顶部开关切换到在线状态。</span>
    </el-alert>

    <div class="pending-section">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon><Bell /></el-icon>
          待抢订单
          <el-badge v-if="pendingOrders.length > 0" :value="pendingOrders.length" class="title-badge" />
        </h2>
        <el-button type="primary" size="small" @click="refreshOrders">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <div v-if="pendingOrders.length > 0" class="pending-orders">
        <div
          v-for="order in pendingOrders"
          :key="order.id"
          class="order-card"
          :class="{ 'is-highlight': order.estimatedDeliveryTime < 25 }"
        >
          <div class="order-header">
            <span class="order-id">{{ order.id }}</span>
            <el-tag :type="order.estimatedDeliveryTime < 25 ? 'danger' : 'warning'" size="small">
              预计{{ order.estimatedDeliveryTime }}分钟
            </el-tag>
          </div>

          <div class="order-content">
            <div class="order-address">
              <div class="address-item">
                <div class="address-dot start"></div>
                <div class="address-info">
                  <span class="address-label">取餐</span>
                  <span class="address-text">美味点餐总店</span>
                </div>
              </div>
              <div class="address-line"></div>
              <div class="address-item">
                <div class="address-dot end"></div>
                <div class="address-info">
                  <span class="address-label">送达</span>
                  <span class="address-text">{{ order.address }}</span>
                </div>
              </div>
            </div>

            <div class="order-items">
              <div
                v-for="(item, index) in order.items"
                :key="index"
                class="order-item"
              >
                <span class="item-name">{{ item.name }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>

          <div class="order-footer">
            <div class="order-meta">
              <span class="order-time">{{ order.orderTime }}</span>
              <span class="order-price">
                配送费: <span class="price">¥{{ getDeliveryFee(order) }}</span>
              </span>
            </div>
            <div class="order-actions">
              <el-button type="danger" size="large" @click="grabOrder(order)" :loading="order.grabbing" :disabled="isOfflineMode">
                {{ isOfflineMode ? '离线无法抢单' : '立即抢单' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-pending">
        <el-icon :size="80"><Van /></el-icon>
        <h3>暂无待抢订单</h3>
        <p>保持在线，新订单会及时推送</p>
        <el-button type="primary" @click="refreshOrders">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="current-deliveries">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon><Van /></el-icon>
          当前配送
        </h2>
      </div>

      <div v-if="currentDeliveries.length > 0" class="deliveries-list">
        <div
          v-for="order in optimizedDeliveries"
          :key="order.id"
          class="delivery-card"
        >
          <div class="delivery-header">
            <div class="delivery-rank">
              <span class="rank-number">#{{ order.optimizedRank }}</span>
            </div>
            <div class="delivery-info">
              <span class="order-id">{{ order.id }}</span>
              <el-tag type="primary" size="small">配送中</el-tag>
            </div>
            <div class="delivery-time">
              <span class="countdown-label">剩余</span>
              <span class="countdown">{{ getRemainingTime(order) }}</span>
            </div>
          </div>

          <div class="delivery-address">
            <div class="address-item">
              <div class="address-dot start"></div>
              <div class="address-info">
                <span class="address-text">美味点餐总店</span>
                <el-tag size="small" type="success">已取餐</el-tag>
              </div>
            </div>
            <div class="address-line"></div>
            <div class="address-item">
              <div class="address-dot end"></div>
              <div class="address-info">
                <span class="address-text">{{ order.address }}</span>
                <span class="address-sub">{{ order.userName }} {{ order.phone }}</span>
              </div>
            </div>
          </div>

          <div class="delivery-footer">
            <el-button type="primary" size="small" @click="callUser(order)" :disabled="isOfflineMode">
              <el-icon><Phone /></el-icon>
              联系用户
            </el-button>
            <el-button type="success" size="small" @click="completeDelivery(order)" :disabled="isOfflineMode">
              <el-icon><CircleCheck /></el-icon>
              确认送达
            </el-button>
          </div>
        </div>
      </div>

      <div v-else class="empty-deliveries">
        <p>暂无配送中的订单</p>
      </div>
    </div>

    <el-dialog v-model="confirmDialogVisible" title="确认送达" width="400px">
      <p>确认已将餐品送达用户手中？</p>
      <template #footer>
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmComplete">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell, Refresh, Van, Document, Star, Money,
  Phone, CircleCheck
} from '@element-plus/icons-vue'
import { mockOrders, mockDeliveryMen } from '../../../data/mockData'

const currentDeliveryMan = ref(JSON.parse(localStorage.getItem('deliveryMan') || '{}'))

const isOnline = inject('isOnline', ref(true))
const isOfflineMode = computed(() => !isOnline.value)

const todayIncome = ref(280)
const todayOrders = ref(8)
const currentRating = ref(4.8)

const pendingOrders = ref([])
const currentDeliveries = ref([])
const confirmDialogVisible = ref(false)
const orderToComplete = ref(null)
const refreshInterval = ref(null)

const pendingCount = computed(() => pendingOrders.value.length)
const deliveringCount = computed(() => currentDeliveries.value.length)

const optimizedDeliveries = computed(() => {
  const deliveries = [...currentDeliveries.value]
  
  deliveries.sort((a, b) => {
    const timeA = a.estimatedDeliveryTime || 30
    const timeB = b.estimatedDeliveryTime || 30
    return timeA - timeB
  })
  
  return deliveries.map((order, index) => ({
    ...order,
    optimizedRank: index + 1
  }))
})

const getDeliveryFee = (order) => {
  const baseFee = 5
  const distanceFee = order.estimatedDeliveryTime > 30 ? 2 : 0
  return baseFee + distanceFee
}

const getRemainingTime = (order) => {
  const minutes = order.estimatedDeliveryTime || 20
  return `${minutes}分钟`
}

const loadPendingOrders = () => {
  pendingOrders.value = mockOrders.filter(o => 
    (o.status === 1 || o.status === 2) && !o.deliveryManId
  ).map(o => ({
    ...o,
    grabbing: false
  }))
  
  if (pendingOrders.value.length > 0) {
    ElMessage({
      message: `有 ${pendingOrders.value.length} 个新订单可抢`,
      type: 'info',
      duration: 3000
    })
  }
}

const loadCurrentDeliveries = () => {
  if (!currentDeliveryMan.value.id) return
  
  currentDeliveries.value = mockOrders.filter(o => 
    o.deliveryManId === currentDeliveryMan.value.id && o.status === 3
  )
}

const refreshOrders = () => {
  loadPendingOrders()
  loadCurrentDeliveries()
  ElMessage.success('已刷新')
}

const grabOrder = (order) => {
  if (!isOnline.value) {
    ElMessage.warning('您当前处于离线状态，请先切换到在线状态才能抢单')
    return
  }
  
  ElMessageBox.confirm(`确定要抢订单 ${order.id} 吗？\n配送费: ¥${getDeliveryFee(order)}`, '抢单确认', {
    confirmButtonText: '确定抢单',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    order.grabbing = true
    
    setTimeout(() => {
      const index = mockOrders.findIndex(o => o.id === order.id)
      if (index > -1) {
        mockOrders[index].deliveryManId = currentDeliveryMan.value.id
        mockOrders[index].status = 3
        
        const pendingIndex = pendingOrders.value.findIndex(o => o.id === order.id)
        if (pendingIndex > -1) {
          pendingOrders.value.splice(pendingIndex, 1)
        }
        
        loadCurrentDeliveries()
        
        ElMessage.success('抢单成功！快去取餐吧')
      }
      order.grabbing = false
    }, 500)
  }).catch(() => {})
}

const callUser = (order) => {
  if (!isOnline.value) {
    ElMessage.warning('您当前处于离线状态，请先切换到在线状态')
    return
  }
  ElMessage.info(`正在拨打 ${order.phone}`)
}

const completeDelivery = (order) => {
  if (!isOnline.value) {
    ElMessage.warning('您当前处于离线状态，请先切换到在线状态')
    return
  }
  orderToComplete.value = order
  confirmDialogVisible.value = true
}

const handleConfirmComplete = () => {
  if (!orderToComplete.value) return
  
  const index = mockOrders.findIndex(o => o.id === orderToComplete.value.id)
  if (index > -1) {
    mockOrders[index].status = 4
    todayIncome.value += getDeliveryFee(orderToComplete.value)
    todayOrders.value++
    
    const deliveryIndex = currentDeliveries.value.findIndex(o => o.id === orderToComplete.value.id)
    if (deliveryIndex > -1) {
      currentDeliveries.value.splice(deliveryIndex, 1)
    }
    
    ElMessage.success('订单已完成，收入已到账')
  }
  
  confirmDialogVisible.value = false
  orderToComplete.value = null
}

const startAutoRefresh = () => {
  refreshInterval.value = setInterval(() => {
    if (Math.random() > 0.7) {
      loadPendingOrders()
    }
  }, 10000)
}

onMounted(() => {
  loadPendingOrders()
  loadCurrentDeliveries()
  startAutoRefresh()
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})
</script>

<style scoped>
.delivery-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.income {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.stat-icon.orders {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
}

.stat-icon.delivering {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
}

.stat-icon.rating {
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.offline-alert {
  margin-bottom: 24px;
  border-radius: 16px;
}

.offline-alert :deep(.el-alert__title) {
  font-weight: 600;
  color: #92400e;
}

.offline-alert :deep(.el-alert__description) {
  font-size: 14px;
  color: #b45309;
}

.pending-section,
.current-deliveries {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.title-badge {
  margin-left: 8px;
}

.pending-orders {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.order-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.order-card:hover {
  border-color: #f97316;
  background: #fff5eb;
  transform: translateY(-2px);
}

.order-card.is-highlight {
  border-color: #f56c6c;
  background: linear-gradient(135deg, #fef2f2 0%, #fff 100%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(245, 108, 108, 0);
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-id {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.order-content {
  margin-bottom: 16px;
}

.order-address {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.address-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.address-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 4px;
}

.address-dot.start {
  background: #10b981;
}

.address-dot.end {
  background: #f56c6c;
}

.address-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.address-label {
  font-size: 12px;
  color: #94a3b8;
}

.address-text {
  font-size: 14px;
  color: #1e293b;
}

.address-sub {
  font-size: 12px;
  color: #64748b;
}

.address-line {
  width: 2px;
  height: 20px;
  background: #e2e8f0;
  margin-left: 5px;
}

.order-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
  border-top: 1px dashed #e2e8f0;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: white;
  border-radius: 16px;
  font-size: 13px;
}

.item-name {
  color: #334155;
}

.item-quantity {
  color: #94a3b8;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-time {
  font-size: 12px;
  color: #94a3b8;
}

.order-price {
  font-size: 14px;
  color: #334155;
}

.order-price .price {
  font-size: 18px;
  font-weight: 700;
  color: #f97316;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.order-actions .el-button {
  border-radius: 20px;
  padding: 10px 24px;
}

.empty-pending,
.empty-deliveries {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
}

.empty-pending h3 {
  margin: 20px 0 8px 0;
  font-size: 18px;
  color: #64748b;
}

.empty-pending p {
  margin: 0 0 20px 0;
}

.deliveries-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.delivery-card {
  background: linear-gradient(135deg, #fff5eb 0%, #fff 100%);
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #f97316;
}

.delivery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.delivery-rank {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-number {
  font-size: 14px;
  font-weight: 700;
  color: white;
}

.delivery-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.delivery-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.countdown-label {
  font-size: 12px;
  color: #94a3b8;
}

.countdown {
  font-size: 20px;
  font-weight: 700;
  color: #f56c6c;
}

.delivery-address {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
}

.delivery-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pending-orders {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
  }
  
  .stat-value {
    font-size: 18px;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .order-actions .el-button {
    flex: 1;
  }
}
</style>
