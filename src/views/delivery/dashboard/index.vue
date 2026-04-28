<template>
  <div class="delivery-dashboard">
    <div class="stats-cards">
      <div class="stat-card" @click="showStatsDetail = true" style="cursor: pointer;">
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
          <el-icon :size="28"><TrendCharts /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">抢单成功率</span>
          <span class="stat-value">{{ grabSuccessRate }}%</span>
        </div>
      </div>
    </div>

    <el-alert v-if="isOfflineMode" type="warning" :closable="false" class="offline-alert">
      <template #title>
        <span class="alert-title">当前处于离线状态</span>
      </template>
      <span class="alert-content">您无法进行抢单和订单操作，请先点击顶部开关切换到在线状态。</span>
    </el-alert>

    <div class="filter-section" v-if="isOnline.value">
      <div class="filter-header">
        <span class="filter-label">筛选条件</span>
        <el-button text size="small" @click="resetFilters">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </div>
      
      <div class="filter-content">
        <div class="filter-group">
          <span class="filter-group-label">距离范围</span>
          <el-radio-group v-model="filterDistance" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="near">3km内</el-radio-button>
            <el-radio-button label="medium">3-5km</el-radio-button>
            <el-radio-button label="far">5km以上</el-radio-button>
          </el-radio-group>
        </div>

        <div class="filter-group">
          <span class="filter-group-label">配送费金额</span>
          <el-radio-group v-model="filterFee" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="high">¥8以上</el-radio-button>
            <el-radio-button label="medium">¥5-8</el-radio-button>
            <el-radio-button label="low">¥5以下</el-radio-button>
          </el-radio-group>
        </div>

        <div class="filter-group">
          <span class="filter-group-label">订单类型</span>
          <el-checkbox-group v-model="filterOrderTypes" size="small">
            <el-checkbox-button label="food">餐饮</el-checkbox-button>
            <el-checkbox-button label="drink">饮品</el-checkbox-button>
            <el-checkbox-button label="other">其他</el-checkbox-button>
          </el-checkbox-group>
        </div>

        <div class="filter-group">
          <span class="filter-group-label">排序方式</span>
          <el-select v-model="sortBy" size="small" style="width: 140px;">
            <el-option label="距离最近" value="distance" />
            <el-option label="配送费最高" value="fee" />
            <el-option label="预计时间最短" value="time" />
            <el-option label="发布时间最新" value="newest" />
          </el-select>
        </div>
      </div>

      <div class="filter-result">
        <span class="result-text">
          共找到 <strong>{{ filteredPendingOrders.length }}</strong> 个订单
        </span>
      </div>
    </div>

    <div class="notification-bar" v-if="notificationSettingsEnabled">
      <div class="notification-info">
        <el-tag v-if="notificationEnabled" type="success" size="small">
          <el-icon><Bell /></el-icon>
          新订单提醒已开启
        </el-tag>
        <el-tag v-else type="info" size="small">
          <el-icon><BellFilled /></el-icon>
          新订单提醒已关闭
        </el-tag>
      </div>
      <div class="notification-actions">
        <el-switch 
          v-model="notificationEnabled" 
          size="small"
          @change="toggleNotification"
        />
        <el-button text size="small" @click="openNotificationSettings">
          <el-icon><Setting /></el-icon>
          设置
        </el-button>
      </div>
    </div>

    <div class="pending-section">
      <div class="section-header">
        <h2 class="section-title">
          <el-icon><Bell /></el-icon>
          待抢订单
          <el-badge v-if="filteredPendingOrders.length > 0" :value="filteredPendingOrders.length" class="title-badge" />
        </h2>
        <div class="header-actions">
          <el-button type="primary" size="small" @click="refreshOrders">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <div v-if="filteredPendingOrders.length > 0" class="pending-orders">
        <div
          v-for="order in filteredPendingOrders"
          :key="order.id"
          class="order-card"
          :class="{ 'is-highlight': order.estimatedDeliveryTime < 25 }"
        >
          <div class="order-header">
            <div class="header-left">
              <span class="order-id">{{ order.id }}</span>
              <el-tag :type="getOrderTypeTag(order.orderType)" size="small">
                {{ getOrderTypeLabel(order.orderType) }}
              </el-tag>
            </div>
            <div class="header-right">
              <el-tag :type="order.estimatedDeliveryTime < 25 ? 'danger' : 'warning'" size="small">
                预计{{ order.estimatedDeliveryTime }}分钟
              </el-tag>
              <div class="distance-badge">
                <el-icon :size="12"><Location /></el-icon>
                {{ formatDistance(order.distance) }}
              </div>
            </div>
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

            <div v-if="order.remark" class="order-remark">
              <el-icon :size="12"><ChatDotRound /></el-icon>
              <span class="remark-text">{{ order.remark }}</span>
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
              <el-button 
                type="primary" 
                size="large" 
                plain
                @click="viewOrderDetail(order)"
              >
                <el-icon><View /></el-icon>
                查看详情
              </el-button>
              <el-button 
                type="danger" 
                size="large" 
                @click="grabOrder(order)" 
                :loading="order.grabbing" 
                :disabled="isOfflineMode"
              >
                {{ isOfflineMode ? '离线无法抢单' : '立即抢单' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-pending">
        <el-icon :size="80"><Van /></el-icon>
        <h3>暂无待抢订单</h3>
        <p>{{ isOfflineMode ? '请先切换到在线状态' : '保持在线，新订单会及时推送' }}</p>
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
          <el-badge v-if="currentDeliveries.length > 0" :value="currentDeliveries.length" class="title-badge" />
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
              <div class="distance-info">
                <el-icon :size="12"><Location /></el-icon>
                {{ formatDistance(order.distance) }}
              </div>
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
            <el-button type="primary" size="small" plain @click="viewOrderDetail(order)">
              <el-icon><MapLocation /></el-icon>
              查看导航
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

    <el-dialog v-model="statsDetailDialogVisible" title="配送数据统计" width="600px">
      <div class="stats-detail-content">
        <div class="stats-summary">
          <div class="summary-item">
            <span class="summary-label">抢单成功率</span>
            <span class="summary-value highlight">{{ grabSuccessRate }}%</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">累计抢单</span>
            <span class="summary-value">{{ performanceMetrics.totalGrabAttempts }}次</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">成功抢单</span>
            <span class="summary-value">{{ performanceMetrics.successfulGrabs }}次</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">完成订单</span>
            <span class="summary-value">{{ performanceMetrics.completedOrders }}单</span>
          </div>
        </div>

        <el-divider />

        <div class="stats-cards-detail">
          <div class="stat-card-detail">
            <div class="stat-icon-detail income">
              <el-icon :size="24"><Money /></el-icon>
            </div>
            <div class="stat-info-detail">
              <span class="stat-label-detail">累计收入</span>
              <span class="stat-value-detail">¥{{ performanceMetrics.totalIncome.toLocaleString() }}</span>
            </div>
          </div>
          <div class="stat-card-detail">
            <div class="stat-icon-detail distance">
              <el-icon :size="24"><MapLocation /></el-icon>
            </div>
            <div class="stat-info-detail">
              <span class="stat-label-detail">累计配送距离</span>
              <span class="stat-value-detail">{{ performanceMetrics.totalDistance.toFixed(1) }}km</span>
            </div>
          </div>
          <div class="stat-card-detail">
            <div class="stat-icon-detail rating">
              <el-icon :size="24"><Star /></el-icon>
            </div>
            <div class="stat-info-detail">
              <span class="stat-label-detail">平均配送费</span>
              <span class="stat-value-detail">¥{{ performanceMetrics.averageIncomePerOrder }}</span>
            </div>
          </div>
          <div class="stat-card-detail">
            <div class="stat-icon-detail orders">
              <el-icon :size="24"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info-detail">
              <span class="stat-label-detail">平均配送距离</span>
              <span class="stat-value-detail">{{ performanceMetrics.averageDistancePerOrder }}km</span>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="weekly-stats">
          <h4 class="section-title-detail">本周数据</h4>
          <div class="weekly-summary">
            <div class="weekly-item">
              <span class="weekly-label">本周订单</span>
              <span class="weekly-value">{{ weeklyStats.totalOrders }}单</span>
            </div>
            <div class="weekly-item">
              <span class="weekly-label">本周收入</span>
              <span class="weekly-value">¥{{ weeklyStats.totalIncome.toLocaleString() }}</span>
            </div>
            <div class="weekly-item">
              <span class="weekly-label">本周配送距离</span>
              <span class="weekly-value">{{ weeklyStats.totalDistance.toFixed(1) }}km</span>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="today-stats">
          <h4 class="section-title-detail">今日数据</h4>
          <div class="today-summary">
            <div class="today-item">
              <span class="today-label">今日订单</span>
              <span class="today-value">{{ todayStats.orders }}单</span>
            </div>
            <div class="today-item">
              <span class="today-label">今日收入</span>
              <span class="today-value">¥{{ todayStats.income }}</span>
            </div>
            <div class="today-item">
              <span class="today-label">今日配送距离</span>
              <span class="today-value">{{ todayStats.distance.toFixed(1) }}km</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="notificationSettingsVisible" title="提醒设置" width="400px">
      <div class="notification-settings-content">
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">新订单声音提醒</span>
            <span class="setting-desc">有新订单时播放提示音</span>
          </div>
          <el-switch v-model="soundEnabled" size="small" />
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">新订单震动提醒</span>
            <span class="setting-desc">有新订单时手机震动</span>
          </div>
          <el-switch v-model="vibrationEnabled" size="small" />
        </div>

        <el-divider />

        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">高优先级订单优先提醒</span>
            <span class="setting-desc">距离近、配送费高的订单优先提醒</span>
          </div>
          <el-switch v-model="priorityAlertEnabled" size="small" />
        </div>

        <el-divider />

        <div class="volume-setting">
          <span class="setting-label">提示音量</span>
          <el-slider v-model="notificationVolume" :min="0" :max="100" show-input />
        </div>
      </div>
      <template #footer>
        <el-button @click="notificationSettingsVisible = false">取消</el-button>
        <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Bell, BellFilled, Refresh, Van, Document, Star, Money,
  Phone, CircleCheck, Location, Setting, ChatDotRound,
  View, MapLocation, TrendCharts
} from '@element-plus/icons-vue'
import { mockOrders, mockDeliveryMen } from '../../../data/mockData'
import {
  MAP_CONFIG,
  calculateDistance,
  formatDistance,
  getAddressCoordinates,
  calculateDeliveryFee,
} from '../../../utils/mapService'
import {
  triggerNewOrderAlert,
  stopNewOrderAlert,
  updateNotificationSettings,
  getNotificationSettings,
} from '../../../utils/notificationService'
import {
  recordGrabAttempt,
  getGrabSuccessRate,
  getPerformanceMetrics,
  getTodayStats,
  getWeeklyStats,
} from '../../../utils/deliveryStats'

const router = useRouter()

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
const newOrderCheckInterval = ref(null)

const showStatsDetail = ref(false)
const statsDetailDialogVisible = ref(false)

const filterDistance = ref('all')
const filterFee = ref('all')
const filterOrderTypes = ref([])
const sortBy = ref('newest')

const notificationSettingsEnabled = ref(true)
const notificationEnabled = ref(true)
const soundEnabled = ref(true)
const vibrationEnabled = ref(true)
const priorityAlertEnabled = ref(true)
const notificationVolume = ref(80)
const notificationSettingsVisible = ref(false)

const lastPendingCount = ref(0)

const pendingCount = computed(() => pendingOrders.value.length)
const deliveringCount = computed(() => currentDeliveries.value.length)

const grabSuccessRate = computed(() => getGrabSuccessRate())
const performanceMetrics = computed(() => getPerformanceMetrics())
const todayStats = computed(() => getTodayStats())
const weeklyStats = computed(() => getWeeklyStats())

watch(showStatsDetail, (val) => {
  if (val) {
    statsDetailDialogVisible.value = true
    showStatsDetail.value = false
  }
})

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

const filteredPendingOrders = computed(() => {
  let orders = [...pendingOrders.value]
  
  if (filterDistance.value !== 'all') {
    orders = orders.filter(o => {
      const dist = o.distance || 0
      switch (filterDistance.value) {
        case 'near': return dist <= 3
        case 'medium': return dist > 3 && dist <= 5
        case 'far': return dist > 5
        default: return true
      }
    })
  }
  
  if (filterFee.value !== 'all') {
    orders = orders.filter(o => {
      const fee = getDeliveryFee(o)
      switch (filterFee.value) {
        case 'high': return fee >= 8
        case 'medium': return fee >= 5 && fee < 8
        case 'low': return fee < 5
        default: return true
      }
    })
  }
  
  if (filterOrderTypes.value.length > 0) {
    orders = orders.filter(o => filterOrderTypes.value.includes(o.orderType || 'food'))
  }
  
  orders.sort((a, b) => {
    switch (sortBy.value) {
      case 'distance':
        return (a.distance || 0) - (b.distance || 0)
      case 'fee':
        return getDeliveryFee(b) - getDeliveryFee(a)
      case 'time':
        return (a.estimatedDeliveryTime || 30) - (b.estimatedDeliveryTime || 30)
      case 'newest':
      default:
        return new Date(b.orderTime) - new Date(a.orderTime)
    }
  })
  
  return orders
})

const getDeliveryFee = (order) => {
  const baseFee = 5
  const distanceFee = (order.estimatedDeliveryTime || 30) > 30 ? 2 : 0
  return baseFee + distanceFee
}

const getRemainingTime = (order) => {
  const minutes = order.estimatedDeliveryTime || 20
  return `${minutes}分钟`
}

const getOrderTypeLabel = (type) => {
  const labels = {
    food: '餐饮',
    drink: '饮品',
    other: '其他'
  }
  return labels[type] || '餐饮'
}

const getOrderTypeTag = (type) => {
  const tags = {
    food: 'success',
    drink: 'primary',
    other: 'info'
  }
  return tags[type] || 'success'
}

const enrichOrderData = (order) => {
  const shopCoords = MAP_CONFIG.SHOP_LOCATION
  const deliveryCoords = getAddressCoordinates(order.address)
  
  const distance = calculateDistance(
    shopCoords.lat, shopCoords.lng,
    deliveryCoords.lat, deliveryCoords.lng
  )
  
  return {
    ...order,
    distance: distance,
    orderType: order.orderType || 'food',
    grabbing: false
  }
}

const loadPendingOrders = () => {
  const newOrders = mockOrders.filter(o => 
    (o.status === 1 || o.status === 2) && !o.deliveryManId
  ).map(o => enrichOrderData(o))
  
  const newCount = newOrders.length
  
  if (newCount > lastPendingCount.value && notificationEnabled.value && lastPendingCount.value > 0) {
    triggerNewOrderAlert()
    
    ElMessage({
      message: `有 ${newCount - lastPendingCount.value} 个新订单可抢！`,
      type: 'success',
      duration: 5000
    })
  }
  
  lastPendingCount.value = newCount
  pendingOrders.value = newOrders
}

const loadCurrentDeliveries = () => {
  if (!currentDeliveryMan.value.id) return
  
  currentDeliveries.value = mockOrders.filter(o => 
    o.deliveryManId === currentDeliveryMan.value.id && o.status === 3
  ).map(o => enrichOrderData(o))
}

const refreshOrders = () => {
  loadPendingOrders()
  loadCurrentDeliveries()
  ElMessage.success('已刷新')
}

const resetFilters = () => {
  filterDistance.value = 'all'
  filterFee.value = 'all'
  filterOrderTypes.value = []
  sortBy.value = 'newest'
}

const viewOrderDetail = (order) => {
  router.push(`/delivery/order/${order.id}`)
}

const grabOrder = (order) => {
  if (!isOnline.value) {
    ElMessage.warning('您当前处于离线状态，请先切换到在线状态才能抢单')
    return
  }
  
  recordGrabAttempt(true, order)
  
  ElMessageBox.confirm(`确定要抢订单 ${order.id} 吗？\n配送费: ¥${getDeliveryFee(order)}\n距离: ${formatDistance(order.distance)}`, '抢单确认', {
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
        
        stopNewOrderAlert()
        ElMessage.success('抢单成功！快去取餐吧')
      }
      order.grabbing = false
    }, 500)
  }).catch(() => {
    recordGrabAttempt(false, order)
  })
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
  viewOrderDetail(order)
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

const toggleNotification = (val) => {
  if (val) {
    ElMessage.success('新订单提醒已开启')
  } else {
    ElMessage.info('新订单提醒已关闭')
    stopNewOrderAlert()
  }
}

const openNotificationSettings = () => {
  const settings = getNotificationSettings()
  soundEnabled.value = settings.sound.enabled
  vibrationEnabled.value = settings.vibration.enabled
  notificationSettingsVisible.value = true
}

const saveNotificationSettings = () => {
  updateNotificationSettings({
    newOrder: {
      enabled: soundEnabled.value,
      volume: notificationVolume.value / 100,
    },
    vibration: {
      enabled: vibrationEnabled.value,
    }
  })
  
  notificationEnabled.value = soundEnabled.value || vibrationEnabled.value
  
  notificationSettingsVisible.value = false
  ElMessage.success('设置已保存')
}

const startAutoRefresh = () => {
  refreshInterval.value = setInterval(() => {
    if (Math.random() > 0.7) {
      loadPendingOrders()
    }
  }, 10000)
}

const startNewOrderCheck = () => {
  newOrderCheckInterval.value = setInterval(() => {
    if (isOnline.value && notificationEnabled.value) {
      if (Math.random() > 0.9) {
        loadPendingOrders()
      }
    }
  }, 5000)
}

onMounted(() => {
  loadPendingOrders()
  loadCurrentDeliveries()
  startAutoRefresh()
  startNewOrderCheck()
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
  if (newOrderCheckInterval.value) {
    clearInterval(newOrderCheckInterval.value)
  }
  stopNewOrderAlert()
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

.filter-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-label {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.filter-content {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group-label {
  font-size: 13px;
  color: #64748b;
}

.filter-result {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.result-text {
  font-size: 14px;
  color: #64748b;
}

.result-text strong {
  color: #f97316;
  font-size: 16px;
}

.notification-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 12px;
  margin-bottom: 24px;
  border: 1px solid #bbf7d0;
}

.notification-info,
.notification-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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

.header-actions {
  display: flex;
  gap: 8px;
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

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-id {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.distance-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
  padding: 4px 8px;
  background: #f1f5f9;
  border-radius: 8px;
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

.order-remark {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fef3c7;
  border-radius: 8px;
  margin-top: 8px;
}

.remark-text {
  font-size: 13px;
  color: #92400e;
  font-style: italic;
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
  padding: 10px 20px;
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

.address-sub {
  font-size: 12px;
  color: #64748b;
}

.delivery-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.stats-detail-content {
  padding: 10px 0;
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.summary-label {
  font-size: 13px;
  color: #64748b;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.summary-value.highlight {
  color: #10b981;
}

.stats-cards-detail {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-card-detail {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.stat-icon-detail {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-detail.income {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #16a34a;
}

.stat-icon-detail.distance {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4f46e5;
}

.stat-icon-detail.rating {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #ca8a04;
}

.stat-icon-detail.orders {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
  color: #ea580c;
}

.stat-info-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label-detail {
  font-size: 12px;
  color: #64748b;
}

.stat-value-detail {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.section-title-detail {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16px;
}

.weekly-summary,
.today-summary {
  display: flex;
  gap: 24px;
}

.weekly-item,
.today-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.weekly-label,
.today-label {
  font-size: 13px;
  color: #64748b;
}

.weekly-value,
.today-value {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.notification-settings-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.setting-desc {
  font-size: 12px;
  color: #94a3b8;
}

.volume-setting {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
}

@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .pending-orders {
    grid-template-columns: 1fr;
  }
  
  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-cards-detail {
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
  
  .filter-content {
    flex-direction: column;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .order-actions {
    justify-content: stretch;
  }
  
  .order-actions .el-button {
    flex: 1;
  }
  
  .notification-bar {
    flex-direction: column;
    gap: 12px;
  }
  
  .stats-summary {
    grid-template-columns: 1fr;
  }
}
</style>
