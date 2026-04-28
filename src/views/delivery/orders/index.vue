<template>
  <div class="delivery-orders">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">我的订单</h1>
          <p class="page-subtitle">管理您的配送订单</p>
        </div>
        <div class="status-badge" :class="isOnline ? 'online' : 'offline'">
          <span class="status-dot"></span>
          <span class="status-text">{{ isOnline ? '在线接单中' : '离线状态' }}</span>
        </div>
      </div>
      
      <div class="stats-cards" v-if="!isOfflineMode">
        <div class="stat-card">
          <div class="stat-icon success">
            <el-icon :size="22"><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">今日完成</span>
            <span class="stat-value">{{ todayOrders }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon primary">
            <el-icon :size="22"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">今日收入</span>
            <span class="stat-value">¥{{ todayIncome }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <el-icon :size="22"><Van /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">配送中</span>
            <span class="stat-value">{{ deliveringCount }}</span>
          </div>
        </div>
      </div>

      <el-alert v-if="!isOnline && !isOfflineMode" type="warning" :closable="false" class="offline-alert">
        <template #title>
          <span class="alert-title">当前处于离线状态</span>
        </template>
        <span class="alert-content">您需要在线才能进行接单和订单操作，请先点击顶部开关切换到在线状态。</span>
      </el-alert>
    </div>

    <div class="tabs-section">
      <div class="tabs-header">
        <div
          v-for="tab in tabs"
          :key="tab.name"
          class="tab-item"
          :class="{ active: activeTab === tab.name }"
          @click="activeTab = tab.name"
        >
          <span class="tab-label">{{ tab.label }}</span>
          <el-badge v-if="getTabCount(tab.name) > 0" :value="getTabCount(tab.name)" class="tab-badge" />
        </div>
      </div>
    </div>

    <div class="orders-container">
      <div v-if="filteredOrders.length > 0" class="orders-list">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="order-card"
          :class="{ 'is-delivering': order.status === 3, 'is-completed': order.status === 4 }"
        >
          <div class="card-header">
            <div class="order-left">
              <div class="order-badge" :class="getStatusClass(order.status)">
                <el-icon :size="14" v-if="order.status === 3"><Van /></el-icon>
                <el-icon :size="14" v-else-if="order.status === 4"><CircleCheck /></el-icon>
                <el-icon :size="14" v-else><Clock /></el-icon>
                <span class="badge-text">{{ getStatusLabel(order.status) }}</span>
              </div>
              <span class="order-id">{{ order.id }}</span>
            </div>
            <div class="order-right">
              <span class="order-time">{{ order.orderTime }}</span>
            </div>
          </div>

          <div class="card-body">
            <div class="address-section">
              <div class="address-route">
                <div class="route-point start">
                  <div class="point-dot"></div>
                  <div class="point-info">
                    <span class="point-label">取餐</span>
                    <span class="point-text">美味点餐总店</span>
                  </div>
                </div>
                <div class="route-line"></div>
                <div class="route-point end">
                  <div class="point-dot"></div>
                  <div class="point-info">
                    <span class="point-label">送达</span>
                    <span class="point-text">{{ order.address }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="user-section">
              <div class="user-avatar">
                <el-icon :size="20"><User /></el-icon>
              </div>
              <div class="user-info">
                <div class="user-name">{{ order.userName }}</div>
                <div class="user-phone">{{ order.phone }}</div>
              </div>
              <el-button 
                v-if="order.status === 3"
                type="primary" 
                plain 
                size="small" 
                class="call-btn"
                :disabled="!isOnline"
                @click="callUser(order)"
              >
                <el-icon><Phone /></el-icon>
                联系用户
              </el-button>
            </div>

            <div class="items-section" v-if="order.items && order.items.length > 0">
              <div class="section-title">
                <el-icon :size="14"><Document /></el-icon>
                <span>订单商品</span>
              </div>
              <div class="items-list">
                <div v-for="(item, index) in order.items" :key="index" class="item-row">
                  <span class="item-name">{{ item.name }}</span>
                  <div class="item-right">
                    <span class="item-quantity">x{{ item.quantity }}</span>
                    <span class="item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="amount-section" v-if="order.remark">
              <div class="section-title">
                <el-icon :size="14"><ChatDotRound /></el-icon>
                <span>备注</span>
              </div>
              <div class="remark-text">{{ order.remark }}</div>
            </div>

            <div class="amount-section">
              <div class="amount-row">
                <span class="amount-label">订单金额</span>
                <span class="amount-value">¥{{ order.actualPrice?.toFixed(2) || order.totalPrice?.toFixed(2) }}</span>
              </div>
              <div class="amount-row fee">
                <span class="amount-label">配送费</span>
                <span class="amount-value highlight">+¥{{ getDeliveryFee(order) }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer" v-if="order.status === 3">
            <div class="footer-info">
              <div class="estimated-time">
                <el-icon :size="14"><Timer /></el-icon>
                <span>预计 {{ order.estimatedDeliveryTime || 30 }} 分钟</span>
              </div>
            </div>
            <div class="footer-actions">
              <el-button 
                type="primary" 
                size="large" 
                class="complete-btn"
                :disabled="!isOnline"
                :loading="order.completing"
                @click="completeDelivery(order)"
              >
                <el-icon><CircleCheck /></el-icon>
                确认送达
              </el-button>
            </div>
          </div>

          <div class="card-footer completed" v-else-if="order.status === 4">
            <div class="complete-badge">
              <el-icon :size="16"><CircleCheck /></el-icon>
              <span>订单已完成</span>
            </div>
            <div class="earn-info">
              <span>配送费收入:</span>
              <span class="earn-amount">+¥{{ getDeliveryFee(order) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon-wrapper">
          <el-icon :size="80" color="#cbd5e1"><Document /></el-icon>
        </div>
        <h3 class="empty-title">暂无订单</h3>
        <p class="empty-text">
          {{ getEmptyMessage() }}
        </p>
        <el-button v-if="!isOnline" type="primary" @click="goToSetOnline">
          切换到在线状态
        </el-button>
      </div>
    </div>

    <el-dialog
      v-model="confirmDialogVisible"
      title="确认送达"
      width="420px"
      :close-on-click-modal="false"
      center
    >
      <div class="confirm-content">
        <div class="confirm-icon">
          <el-icon :size="48" color="#f97316"><CircleCheck /></el-icon>
        </div>
        <h3 class="confirm-title">确认已将餐品送达用户手中？</h3>
        <div class="confirm-info" v-if="orderToComplete">
          <p><span>订单号:</span> <strong>{{ orderToComplete.id }}</strong></p>
          <p><span>收货人:</span> <strong>{{ orderToComplete.userName }} {{ orderToComplete.phone }}</strong></p>
          <p><span>配送费:</span> <strong class="fee-text">¥{{ getDeliveryFee(orderToComplete) }}</strong></p>
        </div>
      </div>
      <template #footer>
        <el-button size="large" @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" size="large" @click="handleConfirmComplete" :loading="isCompleting">
          确认送达
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, provide, inject } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Van, Document, User, CircleCheck, Clock,
  Phone, Money, Timer, ChatDotRound
} from '@element-plus/icons-vue'
import { mockOrders, mockDeliveryMen, orderStatusMap } from '../../../data/mockData'

const router = useRouter()

const todayOrders = ref(8)
const todayIncome = ref(280)
const confirmDialogVisible = ref(false)
const orderToComplete = ref(null)
const isCompleting = ref(false)
const activeTab = ref('all')

const isOnline = inject('isOnline', ref(true))
const isOfflineMode = computed(() => !isOnline.value)

const currentDeliveryMan = computed(() => {
  const dm = localStorage.getItem('deliveryMan')
  return dm ? JSON.parse(dm) : null
})

const tabs = [
  { name: 'all', label: '全部' },
  { name: 'pending', label: '待配送' },
  { name: 'delivering', label: '配送中' },
  { name: 'completed', label: '已完成' }
]

const myOrders = computed(() => {
  if (!currentDeliveryMan.value) return []
  return mockOrders
    .filter(o => o.deliveryManId === currentDeliveryMan.value.id)
    .sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime))
})

const deliveringCount = computed(() => {
  return myOrders.value.filter(o => o.status === 3).length
})

const filteredOrders = computed(() => {
  let orders = [...myOrders.value]
  
  switch (activeTab.value) {
    case 'pending':
      orders = orders.filter(o => o.status === 1 || o.status === 2)
      break
    case 'delivering':
      orders = orders.filter(o => o.status === 3)
      break
    case 'completed':
      orders = orders.filter(o => o.status === 4)
      break
  }
  
  return orders
})

const getTabCount = (tabName) => {
  switch (tabName) {
    case 'pending':
      return myOrders.value.filter(o => o.status === 1 || o.status === 2).length
    case 'delivering':
      return myOrders.value.filter(o => o.status === 3).length
    case 'completed':
      return myOrders.value.filter(o => o.status === 4).length
    default:
      return 0
  }
}

const getStatusLabel = (status) => {
  const map = {
    1: '待付款',
    2: '待配送',
    3: '配送中',
    4: '已完成',
    5: '已取消'
  }
  return map[status] || '未知'
}

const getStatusClass = (status) => {
  const map = {
    1: 'warning',
    2: 'primary',
    3: 'warning',
    4: 'success',
    5: 'danger'
  }
  return map[status] || 'info'
}

const getDeliveryFee = (order) => {
  const baseFee = 5
  const distanceFee = (order.estimatedDeliveryTime || 30) > 30 ? 2 : 0
  return baseFee + distanceFee
}

const getEmptyMessage = () => {
  if (!isOnline.value) {
    return '您当前处于离线状态，切换到在线状态即可开始接单'
  }
  switch (activeTab.value) {
    case 'pending':
      return '暂无待配送订单'
    case 'delivering':
      return '暂无配送中的订单'
    case 'completed':
      return '暂无已完成的订单'
    default:
      return '暂无订单，保持在线状态等待新订单'
  }
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
  
  isCompleting.value = true
  
  setTimeout(() => {
    const index = mockOrders.findIndex(o => o.id === orderToComplete.value.id)
    if (index > -1) {
      mockOrders[index].status = 4
      todayIncome.value += getDeliveryFee(orderToComplete.value)
      todayOrders.value++
      
      ElMessage({
        message: '订单已完成，配送费已到账',
        type: 'success',
        duration: 2000
      })
    }
    
    isCompleting.value = false
    confirmDialogVisible.value = false
    orderToComplete.value = null
  }, 800)
}

const goToSetOnline = () => {
  ElMessage.info('请点击顶部开关切换到在线状态')
}

watch(() => activeTab.value, () => {})
</script>

<style scoped>
.delivery-orders {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-badge.online {
  background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
  color: #166534;
}

.status-badge.offline {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  color: #64748b;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-badge.online .status-dot {
  background: #22c55e;
  animation: pulse-green 2s infinite;
}

.status-badge.offline .status-dot {
  background: #94a3b8;
}

@keyframes pulse-green {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #fed7aa;
  transform: translateY(-2px);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.success {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #16a34a;
}

.stat-icon.primary {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4f46e5;
}

.stat-icon.warning {
  background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
  color: #ea580c;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.offline-alert {
  margin-top: 16px;
  border-radius: 12px;
}

.alert-title {
  font-weight: 600;
  color: #92400e;
}

.alert-content {
  font-size: 14px;
  color: #b45309;
}

.tabs-section {
  background: white;
  border-radius: 20px;
  padding: 16px 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.tabs-header {
  display: flex;
  gap: 8px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-item:hover {
  background: #f1f5f9;
  color: #334155;
}

.tab-item.active {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.tab-label {
  position: relative;
}

.tab-badge {
  transform: translateY(-2px);
}

.orders-container {
  min-height: 400px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.order-card:hover {
  border-color: #fed7aa;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.order-card.is-delivering {
  border-color: #fed7aa;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 100%);
}

.order-card.is-completed {
  opacity: 0.9;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
}

.order-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.order-badge.warning {
  background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
  color: #9a3412;
}

.order-badge.primary {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #3730a3;
}

.order-badge.success {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #166534;
}

.order-badge.danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
}

.order-badge.info {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  color: #1e40af;
}

.badge-text {
  line-height: 1;
}

.order-id {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.order-right {
  display: flex;
  align-items: center;
}

.order-time {
  font-size: 13px;
  color: #94a3b8;
}

.card-body {
  padding: 20px;
}

.address-section {
  margin-bottom: 16px;
}

.address-route {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #f1f5f9;
}

.route-point {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.point-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
  position: relative;
}

.route-point.start .point-dot {
  background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

.route-point.end .point-dot {
  background: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
}

.point-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.point-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.point-text {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
  line-height: 1.4;
}

.route-line {
  width: 2px;
  height: 20px;
  background: linear-gradient(180deg, #22c55e 0%, #f97316 100%);
  margin-left: 5px;
  opacity: 0.5;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 16px;
  margin-bottom: 16px;
  border: 1px solid #f1f5f9;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.user-phone {
  font-size: 13px;
  color: #64748b;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.call-btn {
  border-radius: 20px;
  padding: 8px 16px;
  flex-shrink: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 10px;
}

.items-section {
  margin-bottom: 16px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
  border-radius: 16px;
  border: 1px solid #f1f5f9;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}

.item-row:not(:last-child) {
  border-bottom: 1px dashed #f1f5f9;
}

.item-name {
  font-size: 14px;
  color: #334155;
  flex: 1;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.item-quantity {
  font-size: 13px;
  color: #94a3b8;
  min-width: 36px;
  text-align: right;
}

.item-price {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  min-width: 60px;
  text-align: right;
}

.amount-section {
  padding: 14px 16px;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
  border-radius: 16px;
  border: 1px solid #f1f5f9;
}

.amount-section:not(:last-child) {
  margin-bottom: 16px;
}

.remark-text {
  font-size: 14px;
  color: #64748b;
  font-style: italic;
  padding: 8px 0;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-row.fee {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #f1f5f9;
}

.amount-label {
  font-size: 14px;
  color: #64748b;
}

.amount-value {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.amount-value.highlight {
  color: #16a34a;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fff7ed 0%, #ffffff 100%);
  border-top: 1px solid #fed7aa;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.estimated-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #9a3412;
  font-weight: 500;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.complete-btn {
  border-radius: 24px;
  padding: 12px 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.complete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
}

.card-footer.completed {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  border-top: 1px solid #bbf7d0;
}

.complete-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #166534;
  font-weight: 600;
  font-size: 14px;
}

.earn-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #64748b;
}

.earn-amount {
  font-size: 18px;
  font-weight: 700;
  color: #16a34a;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon-wrapper {
  margin-bottom: 24px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 8px 0;
}

.empty-text {
  font-size: 14px;
  color: #94a3b8;
  margin: 0 0 20px 0;
  max-width: 300px;
  line-height: 1.6;
}

.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.confirm-icon {
  margin-bottom: 20px;
}

.confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px 0;
}

.confirm-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px 24px;
  width: 100%;
  max-width: 320px;
}

.confirm-info p {
  display: flex;
  justify-content: space-between;
  margin: 0;
  font-size: 14px;
}

.confirm-info span:first-child {
  color: #64748b;
}

.confirm-info strong {
  color: #1e293b;
  font-weight: 600;
}

.fee-text {
  color: #16a34a !important;
  font-size: 16px !important;
}

@media (max-width: 768px) {
  .page-header {
    padding: 16px;
    border-radius: 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .status-badge {
    align-self: flex-start;
  }

  .stats-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .tabs-section {
    padding: 12px;
    border-radius: 16px;
  }

  .tabs-header {
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
  }

  .tabs-header::-webkit-scrollbar {
    display: none;
  }

  .tab-item {
    padding: 8px 16px;
    flex-shrink: 0;
  }

  .card-header {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .card-body {
    padding: 16px;
  }

  .card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .footer-actions {
    justify-content: stretch;
  }

  .complete-btn {
    width: 100%;
  }
}
</style>
