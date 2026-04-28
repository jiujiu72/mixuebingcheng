<template>
  <div class="delivery-order-detail">
    <header class="page-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">配送详情</h1>
      </div>
      <div class="header-right">
        <el-tag :type="statusTagType" size="large">
          {{ statusText }}
        </el-tag>
      </div>
    </header>

    <div class="map-section">
      <div class="map-container" ref="mapContainer">
        <div class="map-header">
          <div class="navigation-controls">
            <span class="label">导航方式:</span>
            <el-radio-group v-model="navigationPreference" size="small" @change="updateNavigation">
              <el-radio-button
                v-for="pref in navigationOptions"
                :key="pref.key"
                :value="pref.key"
              >
                <span class="nav-icon">{{ pref.icon }}</span>
                {{ pref.name }}
              </el-radio-button>
            </el-radio-group>
          </div>
          <div class="distance-info">
            <span class="distance">
              <el-icon><Location /></el-icon>
              {{ formattedDistance }}
            </span>
            <span class="time">
              <el-icon><Timer /></el-icon>
              预计 {{ formattedTime }}
            </span>
          </div>
        </div>

        <div class="route-map">
          <div class="route-overlay">
            <svg viewBox="0 0 400 300" class="route-svg">
              <defs>
                <linearGradient :id="'routeGradient-' + currentPreference" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" :style="'stop-color:' + routeColors[0]" />
                  <stop offset="100%" :style="'stop-color:' + routeColors[1]" />
                </linearGradient>
              </defs>
              
              <path
                d="M 50 250 Q 100 200 150 220 T 250 150 T 350 80"
                :fill="'none'"
                :stroke="'url(#routeGradient-' + currentPreference)"
                stroke-width="6"
                stroke-linecap="round"
                class="route-path"
              />
              
              <circle cx="50" cy="250" r="8" fill="#10b981" class="start-point">
                <animate attributeName="r" values="8;10;8" dur="1.5s" repeatCount="indefinite" />
              </circle>
              
              <circle cx="350" cy="80" r="8" fill="#f97316" class="end-point" />
              
              <circle 
                v-if="deliveryManPosition" 
                :cx="deliveryManPosition.x" 
                :cy="deliveryManPosition.y" 
                r="10" 
                :fill="routeColors[0]"
                class="delivery-man-marker"
              >
                <animate attributeName="r" values="10;12;10" dur="1s" repeatCount="indefinite" />
              </circle>
            </svg>
            
            <div class="route-points">
              <div class="point-info start">
                <div class="point-dot start"></div>
                <div class="point-content">
                  <span class="point-label">取餐点</span>
                  <span class="point-address">美味点餐总店</span>
                </div>
              </div>
              
              <div class="route-lines">
                <div v-for="(turn, index) in turnByTurn" :key="index" class="turn-step">
                  <span class="turn-icon">{{ turn.icon }}</span>
                  <span class="turn-text">{{ turn.instruction }}</span>
                </div>
              </div>
              
              <div class="point-info end">
                <div class="point-dot end"></div>
                <div class="point-content">
                  <span class="point-label">送达点</span>
                  <span class="point-address">{{ order?.address }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="map-actions">
          <el-button type="primary" size="large" @click="startNavigation">
            <el-icon><VideoCamera /></el-icon>
            开始导航
          </el-button>
          <el-button size="large" @click="openExternalMap">
            <el-icon><Share /></el-icon>
            打开地图App
          </el-button>
        </div>
      </div>
    </div>

    <div class="order-info-section">
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">订单信息</span>
            <el-tag size="small" type="info">{{ order?.id }}</el-tag>
          </div>
        </template>

        <div class="address-section">
          <div class="address-item">
            <div class="address-dot start"></div>
            <div class="address-content">
              <div class="address-label">
                <span>取餐地址</span>
                <el-tag size="small" type="success">已取餐</el-tag>
              </div>
              <div class="address-text">美味点餐总店</div>
            </div>
          </div>
          
          <div class="address-connector"></div>
          
          <div class="address-item">
            <div class="address-dot end"></div>
            <div class="address-content">
              <div class="address-label">
                <span>送达地址</span>
              </div>
              <div class="address-text">{{ order?.address }}</div>
              <div class="address-sub">{{ order?.userName }} {{ order?.phone }}</div>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="items-section">
          <h4 class="section-title">
            <el-icon><Document /></el-icon>
            订单商品
          </h4>
          <div class="items-list">
            <div v-for="(item, index) in order?.items" :key="index" class="item-row">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-quantity">x{{ item.quantity }}</span>
              <span class="item-price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="fee-section">
          <div class="fee-row">
            <span class="fee-label">订单金额</span>
            <span class="fee-value">¥{{ order?.actualPrice?.toFixed(2) }}</span>
          </div>
          <div class="fee-row highlight">
            <span class="fee-label">配送费</span>
            <span class="fee-value income">+¥{{ deliveryFee }}</span>
          </div>
        </div>

        <div v-if="order?.remark" class="remark-section">
          <el-divider />
          <div class="remark-content">
            <span class="remark-label">备注:</span>
            <span class="remark-text">{{ order.remark }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <div class="action-section">
      <div class="action-buttons">
        <el-button size="large" @click="callUser">
          <el-icon><Phone /></el-icon>
          联系用户
        </el-button>
        
        <el-button 
          v-if="orderStatus === 3" 
          type="success" 
          size="large" 
          @click="showCompleteDialog"
        >
          <el-icon><Camera /></el-icon>
          拍照送达
        </el-button>
        
        <el-button 
          v-if="orderStatus === 3" 
          type="danger" 
          size="large" 
          plain
          @click="showExceptionDialog"
        >
          <el-icon><Warning /></el-icon>
          异常上报
        </el-button>
      </div>
    </div>

    <el-dialog
      v-model="completeDialogVisible"
      title="确认送达"
      width="480px"
      :close-on-click-modal="false"
    >
      <div class="complete-content">
        <div class="photo-section">
          <div class="photo-title">
            <span>上传送达凭证</span>
            <el-tag size="small" type="warning">可选</el-tag>
          </div>
          
          <div class="photo-upload-area">
            <div 
              v-if="takenPhotos.length === 0" 
              class="photo-placeholder"
              @click="takePhoto"
            >
              <el-icon :size="48"><Camera /></el-icon>
              <span>点击拍照</span>
              <span class="sub-text">或从相册选择</span>
            </div>
            
            <div v-else class="photo-preview">
              <div v-for="(photo, index) in takenPhotos" :key="index" class="photo-item">
                <img :src="photo" alt="送达凭证" />
                <el-button 
                  type="danger" 
                  circle 
                  size="small" 
                  class="photo-delete"
                  @click="removePhoto(index)"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
              
              <div 
                v-if="takenPhotos.length < 3" 
                class="photo-add-btn"
                @click="takePhoto"
              >
                <el-icon :size="24"><Plus /></el-icon>
              </div>
            </div>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref="photoInput"
            style="display: none;"
            @change="handlePhotoUpload"
          />
        </div>

        <el-divider />

        <div class="sign-section">
          <div class="photo-title">用户签收确认</div>
          <el-radio-group v-model="signType">
            <el-radio value="user">用户已签收</el-radio>
            <el-radio value="self">放置指定位置</el-radio>
          </el-radio-group>
          
          <el-input
            v-if="signType === 'self'"
            v-model="placeDescription"
            type="textarea"
            :rows="2"
            placeholder="请描述放置位置，如：门口鞋柜上..."
            class="sign-input"
          />
        </div>
      </div>
      
      <template #footer>
        <el-button size="large" @click="completeDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          size="large" 
          :loading="completing"
          @click="handleCompleteDelivery"
        >
          确认送达
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="exceptionDialogVisible"
      title="异常上报"
      width="480px"
      :close-on-click-modal="false"
    >
      <div class="exception-content">
        <div class="exception-types">
          <span class="label">异常类型:</span>
          <el-select v-model="exceptionType" placeholder="请选择异常类型" style="width: 100%">
            <el-option label="联系不上用户" value="user_unreachable" />
            <el-option label="用户地址有误" value="wrong_address" />
            <el-option label="商品破损" value="damaged" />
            <el-option label="商家出餐延迟" value="shop_delay" />
            <el-option label="交通拥堵" value="traffic_jam" />
            <el-option label="其他问题" value="other" />
          </el-select>
        </div>

        <div class="exception-description">
          <span class="label">详细描述:</span>
          <el-input
            v-model="exceptionDescription"
            type="textarea"
            :rows="4"
            placeholder="请详细描述遇到的问题..."
          />
        </div>

        <div class="exception-photo">
          <span class="label">上传凭证 (可选):</span>
          <div class="photo-upload-area small">
            <div 
              v-if="exceptionPhotos.length === 0" 
              class="photo-placeholder small"
              @click="takeExceptionPhoto"
            >
              <el-icon :size="32"><Camera /></el-icon>
              <span>添加图片</span>
            </div>
            
            <div v-else class="photo-preview">
              <div v-for="(photo, index) in exceptionPhotos" :key="index" class="photo-item">
                <img :src="photo" alt="异常凭证" />
                <el-button 
                  type="danger" 
                  circle 
                  size="small" 
                  class="photo-delete"
                  @click="removeExceptionPhoto(index)"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
              
              <div 
                v-if="exceptionPhotos.length < 5" 
                class="photo-add-btn small"
                @click="takeExceptionPhoto"
              >
                <el-icon :size="18"><Plus /></el-icon>
              </div>
            </div>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref="exceptionPhotoInput"
            style="display: none;"
            @change="handleExceptionPhotoUpload"
          />
        </div>

        <div class="emergency-contact">
          <el-button type="danger" text @click="callEmergencyContact">
            <el-icon><Phone /></el-icon>
            联系紧急客服
          </el-button>
        </div>
      </div>
      
      <template #footer>
        <el-button size="large" @click="exceptionDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          size="large" 
          :loading="reportingException"
          @click="handleReportException"
        >
          提交上报
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="navigationDialogVisible"
      title="导航中"
      width="100%"
      fullscreen
      :modal-append-to-body="true"
    >
      <div class="navigation-fullscreen">
        <div class="nav-header">
          <el-button text @click="stopNavigation">
            <el-icon><Close /></el-icon>
            退出导航
          </el-button>
          <div class="nav-info">
            <span class="nav-distance">{{ formattedDistance }}</span>
            <span class="nav-time">预计 {{ formattedTime }}</span>
          </div>
          <div class="nav-preference">
            <span class="nav-icon">{{ currentPreferenceData.icon }}</span>
            {{ currentPreferenceData.name }}
          </div>
        </div>

        <div class="nav-main">
          <div class="nav-direction">
            <div class="direction-icon">{{ currentTurn?.icon || '⬆️' }}</div>
            <div class="direction-text">{{ currentTurn?.instruction || '沿当前道路行驶' }}</div>
          </div>
          
          <div class="nav-map">
            <svg viewBox="0 0 400 300" class="nav-svg">
              <path
                d="M 50 250 Q 100 200 150 220 T 250 150 T 350 80"
                fill="none"
                :stroke="routeColors[0]"
                stroke-width="8"
                stroke-linecap="round"
                opacity="0.3"
              />
              <path
                :d="currentPath"
                fill="none"
                :stroke="routeColors[0]"
                stroke-width="8"
                stroke-linecap="round"
              />
              <circle cx="50" cy="250" r="6" fill="#10b981" />
              <circle cx="350" cy="80" r="6" fill="#f97316" />
            </svg>
          </div>
          
          <div class="nav-steps">
            <div 
              v-for="(turn, index) in turnByTurn" 
              :key="index" 
              class="nav-step"
              :class="{ active: index === currentStepIndex }"
            >
              <div class="step-dot" :class="{ passed: index < currentStepIndex, active: index === currentStepIndex }"></div>
              <div class="step-content">
                <span class="step-icon">{{ turn.icon }}</span>
                <span class="step-text">{{ turn.instruction }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="nav-footer">
          <div class="nav-action">
            <el-button size="large" @click="callUser">
              <el-icon><Phone /></el-icon>
              联系用户
            </el-button>
          </div>
          <div class="nav-speed">
            <span class="speed-label">当前速度</span>
            <span class="speed-value">{{ currentSpeed }}</span>
            <span class="speed-unit">km/h</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Location, Timer, VideoCamera, Share,
  Phone, Camera, Document, Warning, Close, Plus
} from '@element-plus/icons-vue'
import {
  MAP_CONFIG,
  NAVIGATION_PREFERENCES,
  calculateDistance,
  formatDistance,
  calculateEstimatedTime,
  formatTime,
  generateRoutePoints,
  getAddressCoordinates,
  calculateDeliveryFee,
  generateTurnByTurn,
  updateDeliveryManLocation,
} from '../../utils/mapService'
import { mockOrders, mockDeliveryMen } from '../../data/mockData'

const router = useRouter()
const route = useRoute()

const mapContainer = ref(null)
const photoInput = ref(null)
const exceptionPhotoInput = ref(null)

const order = ref(null)
const deliveryMan = ref(null)
const orderStatus = ref(3)

const navigationPreference = ref('CYCLING')
const distance = ref(0)
const estimatedTime = ref(0)
const routePoints = ref([])
const turnByTurn = ref([])

const completeDialogVisible = ref(false)
const exceptionDialogVisible = ref(false)
const navigationDialogVisible = ref(false)
const completing = ref(false)
const reportingException = ref(false)

const takenPhotos = ref([])
const exceptionPhotos = ref([])
const signType = ref('user')
const placeDescription = ref('')

const exceptionType = ref('')
const exceptionDescription = ref('')

const deliveryManPosition = ref(null)
const positionInterval = ref(null)
const navigationInterval = ref(null)
const currentStepIndex = ref(0)
const currentSpeed = ref(0)

const navigationOptions = computed(() => {
  return Object.entries(NAVIGATION_PREFERENCES).map(([key, value]) => ({
    key,
    name: value.name,
    icon: value.icon,
  }))
})

const currentPreference = computed(() => navigationPreference.value)

const currentPreferenceData = computed(() => {
  return NAVIGATION_PREFERENCES[navigationPreference.value] || NAVIGATION_PREFERENCES.CYCLING
})

const routeColors = computed(() => currentPreferenceData.value.routeColors)

const formattedDistance = computed(() => formatDistance(distance.value))
const formattedTime = computed(() => formatTime(estimatedTime.value))

const statusText = computed(() => {
  const statusMap = {
    1: '待付款',
    2: '待配送',
    3: '配送中',
    4: '已完成',
    5: '已取消',
  }
  return statusMap[orderStatus.value] || '未知'
})

const statusTagType = computed(() => {
  const typeMap = {
    1: 'warning',
    2: 'info',
    3: 'primary',
    4: 'success',
    5: 'danger',
  }
  return typeMap[orderStatus.value] || 'info'
})

const deliveryFee = computed(() => {
  return calculateDeliveryFee(distance.value)
})

const currentTurn = computed(() => turnByTurn.value[currentStepIndex.value])

const currentPath = computed(() => {
  const paths = [
    'M 50 250 Q 100 200 150 220',
    'M 50 250 Q 100 200 150 220 T 250 150',
    'M 50 250 Q 100 200 150 220 T 250 150 T 350 80',
  ]
  return paths[currentStepIndex.value] || paths[paths.length - 1]
})

const goBack = () => {
  router.back()
}

const loadOrderData = () => {
  const orderId = route.params.orderId
  if (!orderId) {
    ElMessage.error('订单不存在')
    goBack()
    return
  }

  order.value = mockOrders.find(o => o.id === orderId)
  
  if (!order.value) {
    ElMessage.error('订单不存在')
    goBack()
    return
  }

  orderStatus.value = order.value.status
  
  const dm = localStorage.getItem('deliveryMan')
  if (dm) {
    deliveryMan.value = JSON.parse(dm)
  }

  initMap()
}

const initMap = () => {
  if (!order.value) return

  const shopCoords = MAP_CONFIG.SHOP_LOCATION
  const deliveryCoords = getAddressCoordinates(order.value.address)

  distance.value = calculateDistance(
    shopCoords.lat, shopCoords.lng,
    deliveryCoords.lat, deliveryCoords.lng
  )

  updateNavigation()

  routePoints.value = generateRoutePoints(
    shopCoords.lat, shopCoords.lng,
    deliveryCoords.lat, deliveryCoords.lng
  )

  turnByTurn.value = generateTurnByTurn(
    routePoints.value,
    '美味点餐总店',
    order.value.address
  )

  deliveryManPosition.value = { x: 50, y: 250 }
}

const updateNavigation = () => {
  if (!order.value) return

  const shopCoords = MAP_CONFIG.SHOP_LOCATION
  const deliveryCoords = getAddressCoordinates(order.value.address)

  distance.value = calculateDistance(
    shopCoords.lat, shopCoords.lng,
    deliveryCoords.lat, deliveryCoords.lng
  )

  estimatedTime.value = calculateEstimatedTime(distance.value, navigationPreference.value)
}

const startNavigation = () => {
  navigationDialogVisible.value = true
  currentStepIndex.value = 0
  
  navigationInterval.value = setInterval(() => {
    if (currentStepIndex.value < turnByTurn.value.length - 1) {
      currentStepIndex.value++
      currentSpeed.value = Math.floor(Math.random() * 10) + 10
    } else {
      stopNavigation()
    }
  }, 5000)

  startPositionTracking()
}

const stopNavigation = () => {
  navigationDialogVisible.value = false
  if (navigationInterval.value) {
    clearInterval(navigationInterval.value)
    navigationInterval.value = null
  }
  stopPositionTracking()
}

const startPositionTracking = () => {
  positionInterval.value = setInterval(async () => {
    if (deliveryMan.value) {
      await updateDeliveryManLocation(deliveryMan.value.id)
      
      if (deliveryManPosition.value) {
        deliveryManPosition.value.x += Math.random() * 30
        deliveryManPosition.value.y -= Math.random() * 15
      }
    }
  }, 3000)
}

const stopPositionTracking = () => {
  if (positionInterval.value) {
    clearInterval(positionInterval.value)
    positionInterval.value = null
  }
}

const openExternalMap = () => {
  ElMessage.info('正在打开地图应用...')
}

const callUser = () => {
  if (order.value) {
    ElMessage.info(`正在拨打 ${order.value.phone}`)
  }
}

const showCompleteDialog = () => {
  completeDialogVisible.value = true
}

const takePhoto = () => {
  if (photoInput.value) {
    photoInput.value.click()
  }
}

const handlePhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file && takenPhotos.value.length < 3) {
    const reader = new FileReader()
    reader.onload = (e) => {
      takenPhotos.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  }
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

const removePhoto = (index) => {
  takenPhotos.value.splice(index, 1)
}

const handleCompleteDelivery = async () => {
  if (signType.value === 'self' && !placeDescription.value.trim()) {
    ElMessage.warning('请描述放置位置')
    return
  }

  completing.value = true
  
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const index = mockOrders.findIndex(o => o.id === order.value.id)
  if (index > -1) {
    mockOrders[index].status = 4
    orderStatus.value = 4
  }

  completing.value = false
  completeDialogVisible.value = false
  
  ElMessage({
    message: '送达确认已提交，订单已完成',
    type: 'success',
    duration: 3000
  })
  
  setTimeout(() => {
    goBack()
  }, 1000)
}

const showExceptionDialog = () => {
  exceptionDialogVisible.value = true
}

const takeExceptionPhoto = () => {
  if (exceptionPhotoInput.value) {
    exceptionPhotoInput.value.click()
  }
}

const handleExceptionPhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file && exceptionPhotos.value.length < 5) {
    const reader = new FileReader()
    reader.onload = (e) => {
      exceptionPhotos.value.push(e.target.result)
    }
    reader.readAsDataURL(file)
  }
  if (exceptionPhotoInput.value) {
    exceptionPhotoInput.value.value = ''
  }
}

const removeExceptionPhoto = (index) => {
  exceptionPhotos.value.splice(index, 1)
}

const callEmergencyContact = () => {
  ElMessage.info('正在联系紧急客服...')
}

const handleReportException = async () => {
  if (!exceptionType.value) {
    ElMessage.warning('请选择异常类型')
    return
  }
  if (!exceptionDescription.value.trim()) {
    ElMessage.warning('请详细描述问题')
    return
  }

  reportingException.value = true
  
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  reportingException.value = false
  exceptionDialogVisible.value = false
  
  ElMessage({
    message: '异常已上报，客服正在处理中',
    type: 'success',
    duration: 3000
  })
}

onMounted(() => {
  loadOrderData()
  startPositionTracking()
})

onUnmounted(() => {
  stopPositionTracking()
  if (navigationInterval.value) {
    clearInterval(navigationInterval.value)
  }
})
</script>

<style scoped>
.delivery-order-detail {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 100px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.map-section {
  background: white;
  margin: 12px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.map-container {
  padding: 16px;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.navigation-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navigation-controls .label {
  font-size: 14px;
  color: #64748b;
}

.nav-icon {
  margin-right: 4px;
}

.distance-info {
  display: flex;
  gap: 16px;
}

.distance-info .distance,
.distance-info .time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #334155;
}

.route-map {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.route-overlay {
  position: relative;
  min-height: 300px;
}

.route-svg {
  width: 100%;
  height: 300px;
}

.route-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawPath 2s ease-in-out forwards;
}

@keyframes drawPath {
  to {
    stroke-dashoffset: 0;
  }
}

.start-point,
.end-point {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.delivery-man-marker {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.route-points {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.point-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
}

.point-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 4px;
}

.point-dot.start {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.point-dot.end {
  background: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
}

.point-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.point-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.point-address {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

.route-lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
  margin-left: 6px;
  border-left: 2px dashed #cbd5e1;
}

.turn-step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
}

.turn-icon {
  font-size: 16px;
}

.map-actions {
  display: flex;
  gap: 12px;
}

.map-actions .el-button {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
}

.order-info-section {
  margin: 12px;
}

.info-card {
  border-radius: 16px;
  border: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.address-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.address-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 12px;
}

.address-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}

.address-dot.start {
  background: #10b981;
}

.address-dot.end {
  background: #f97316;
}

.address-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.address-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.address-label span {
  font-size: 12px;
  color: #94a3b8;
}

.address-text {
  font-size: 14px;
  color: #1e293b;
  font-weight: 500;
}

.address-sub {
  font-size: 13px;
  color: #64748b;
}

.address-connector {
  width: 2px;
  height: 20px;
  background: #e2e8f0;
  margin-left: 5px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
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
  padding: 8px 0;
  border-bottom: 1px dashed #f1f5f9;
}

.item-row:last-child {
  border-bottom: none;
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
  color: #94a3b8;
}

.item-price {
  width: 80px;
  text-align: right;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.fee-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fee-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fee-row.highlight {
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dashed #f1f5f9;
}

.fee-label {
  font-size: 14px;
  color: #64748b;
}

.fee-value {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.fee-value.income {
  color: #16a34a;
}

.remark-content {
  display: flex;
  gap: 8px;
}

.remark-label {
  font-size: 14px;
  color: #64748b;
}

.remark-text {
  font-size: 14px;
  color: #334155;
  font-style: italic;
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: white;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-buttons .el-button {
  flex: 1;
  height: 50px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
}

.complete-content,
.exception-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.photo-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.photo-upload-area {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.photo-placeholder {
  width: 120px;
  height: 120px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-placeholder:hover {
  border-color: #f97316;
  background: #fff7ed;
}

.photo-placeholder .sub-text {
  font-size: 12px;
  color: #94a3b8;
}

.photo-placeholder.small {
  width: 80px;
  height: 80px;
}

.photo-placeholder.small span {
  font-size: 12px;
  color: #94a3b8;
}

.photo-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.photo-item {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 2px solid #e2e8f0;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-delete {
  position: absolute;
  top: 4px;
  right: 4px;
}

.photo-add-btn {
  width: 120px;
  height: 120px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-add-btn:hover {
  border-color: #f97316;
  background: #fff7ed;
}

.photo-add-btn.small {
  width: 80px;
  height: 80px;
}

.sign-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sign-input {
  margin-top: 12px;
}

.exception-types,
.exception-description,
.exception-photo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exception-types .label,
.exception-description .label,
.exception-photo .label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}

.emergency-contact {
  margin-top: 8px;
}

.navigation-fullscreen {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0, 0, 0, 0.3);
}

.nav-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.nav-distance {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.nav-time {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.nav-preference {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: white;
}

.nav-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.nav-direction {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.direction-icon {
  font-size: 64px;
}

.direction-text {
  font-size: 20px;
  font-weight: 600;
  color: white;
  text-align: center;
}

.nav-map {
  width: 100%;
  max-width: 400px;
  margin-bottom: 24px;
}

.nav-svg {
  width: 100%;
  height: 200px;
}

.nav-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 400px;
}

.nav-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.nav-step.active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.02);
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}

.step-dot.passed {
  background: #10b981;
}

.step-dot.active {
  background: #f97316;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.3);
}

.step-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-icon {
  font-size: 20px;
}

.step-text {
  font-size: 14px;
  color: white;
}

.nav-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
}

.nav-speed {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.speed-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.speed-value {
  font-size: 28px;
  font-weight: 700;
  color: white;
}

.speed-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .map-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .navigation-controls {
    justify-content: space-between;
  }
  
  .distance-info {
    justify-content: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
