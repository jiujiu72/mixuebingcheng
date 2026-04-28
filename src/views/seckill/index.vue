<template>
  <div class="seckill-container">
    <header class="page-header">
      <div class="page-header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">限时秒杀</h1>
      </div>
    </header>

    <main class="main-content">
      <div class="session-tabs">
        <div
          v-for="session in activeSessions"
          :key="session.id"
          :class="['session-tab', { active: selectedSessionId === session.id }]"
          @click="selectSession(session)"
        >
          <div class="session-name">{{ session.name }}</div>
          <div class="session-time" v-if="getSessionStatus(session) === 'active'">
            <span class="countdown-label">距结束</span>
            <span class="countdown-value">{{ formatCountdown(countdown) }}</span>
          </div>
          <div class="session-time" v-else-if="getSessionStatus(session) === 'pending'">
            <span class="countdown-label">距开始</span>
            <span class="countdown-value">{{ formatCountdown(getCountdownToStart(session)) }}</span>
          </div>
          <el-tag v-if="getSessionStatus(session) === 'active'" type="success" size="small" class="session-tag">
            抢购中
          </el-tag>
          <el-tag v-else-if="getSessionStatus(session) === 'pending'" type="warning" size="small" class="session-tag">
            即将开始
          </el-tag>
        </div>
      </div>

      <div class="products-section">
        <div v-if="seckillItems.length === 0" class="empty-state">
          <el-icon :size="64" color="#cbd5e1"><Box /></el-icon>
          <p>暂无秒杀商品</p>
        </div>

        <div v-else class="products-grid">
          <div
            v-for="item in seckillItems"
            :key="item.id"
            class="product-card"
            :class="{
              'is-ended': getSessionStatus(selectedSession) === 'ended',
              'is-pending': getSessionStatus(selectedSession) === 'pending',
              'is-sold-out': item.stock <= 0
            }"
          >
            <div class="product-image-wrapper">
              <img :src="item.image" :alt="item.foodName" class="product-image" />
              <div v-if="getSessionStatus(selectedSession) === 'ended'" class="overlay-overlay">
                <span class="overlay-text">活动已结束</span>
              </div>
              <div v-else-if="getSessionStatus(selectedSession) === 'pending'" class="overlay-overlay">
                <span class="overlay-text">即将开始</span>
              </div>
              <div v-else-if="item.stock <= 0" class="overlay-overlay">
                <span class="overlay-text">已售罄</span>
              </div>
            </div>

            <div class="product-info">
              <h3 class="product-name">{{ item.foodName }}</h3>
              <p class="product-desc">{{ item.description }}</p>

              <div class="price-section">
                <div class="current-price">
                  <span class="price-symbol">¥</span>
                  <span class="price-value">{{ item.seckillPrice }}</span>
                </div>
                <div class="original-price">¥{{ item.originalPrice }}</div>
                <div class="discount-tag">
                  {{ Math.round((1 - item.seckillPrice / item.originalPrice) * 100) }}% OFF
                </div>
              </div>

              <div class="stock-section">
                <div class="stock-bar-wrapper">
                  <div class="stock-bar">
                    <div 
                      class="stock-bar-fill"
                      :style="{ width: getStockPercentage(item) + '%' }"
                    ></div>
                  </div>
                </div>
                <div class="stock-info">
                  <span>已售 {{ item.sold }}</span>
                  <span>库存 {{ item.stock }}</span>
                </div>
              </div>

              <div class="action-section">
                <el-button
                  :type="canPurchase(item) ? 'danger' : 'default'"
                  class="action-btn"
                  :disabled="!canPurchase(item)"
                  @click="handlePurchase(item)"
                >
                  <span v-if="getSessionStatus(selectedSession) === 'ended'">活动已结束</span>
                  <span v-else-if="getSessionStatus(selectedSession) === 'pending'">即将开场</span>
                  <span v-else-if="item.stock <= 0">已售罄</span>
                  <span v-else>立即抢购</span>
                </el-button>
                <div v-if="item.limitPerUser > 0" class="limit-tip">
                  每人限购 {{ item.limitPerUser }} 件
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Box } from '@element-plus/icons-vue'
import {
  getActiveSessions,
  getSeckillItemsBySession,
  getSeckillStatus,
  getSeckillStatusLabel,
  getCountdown,
  formatCountdown,
  canPurchaseSeckillItem,
  getStockPercentage,
  getCurrentActiveSession
} from '../../utils/seckillUtils'
import { mockSeckillSessions } from '../../data/mockData'

const router = useRouter()

const selectedSessionId = ref(null)
const countdown = ref({ hours: 0, minutes: 0, seconds: 0, totalMs: 0, isExpired: false })
let countdownTimer = null

const activeSessions = computed(() => {
  return getActiveSessions()
})

const selectedSession = computed(() => {
  return mockSeckillSessions.find(s => s.id === selectedSessionId.value) || null
})

const seckillItems = computed(() => {
  if (!selectedSessionId.value) return []
  return getSeckillItemsBySession(selectedSessionId.value)
})

const getSessionStatus = (session) => {
  return getSeckillStatus(session)
}

const getSessionStatusTagType = (session) => {
  const status = getSeckillStatus(session)
  if (status === 'active') return 'success'
  if (status === 'pending') return 'warning'
  return 'info'
}

const getCountdownToStart = (session) => {
  return getCountdown(session.startTime)
}

const canPurchase = (item) => {
  const result = canPurchaseSeckillItem(item, 1)
  return result.canPurchase
}

const selectSession = (session) => {
  selectedSessionId.value = session.id
  startCountdown(session)
}

const startCountdown = (session) => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }

  const status = getSeckillStatus(session)
  let targetTime = null

  if (status === 'active') {
    targetTime = session.endTime
  } else if (status === 'pending') {
    targetTime = session.startTime
  } else {
    countdown.value = { hours: 0, minutes: 0, seconds: 0, totalMs: 0, isExpired: true }
    return
  }

  countdown.value = getCountdown(targetTime)

  countdownTimer = setInterval(() => {
    const newCountdown = getCountdown(targetTime)
    countdown.value = newCountdown

    if (newCountdown.isExpired) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

const handlePurchase = (item) => {
  const result = canPurchaseSeckillItem(item, 1)
  
  if (!result.canPurchase) {
    ElMessage.warning(result.reason)
    return
  }

  ElMessage.success(`已添加到购物车：${item.foodName}`)
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  const currentSession = getCurrentActiveSession()
  if (currentSession) {
    selectedSessionId.value = currentSession.id
    startCountdown(currentSession)
  } else if (activeSessions.value.length > 0) {
    selectedSessionId.value = activeSessions.value[0].id
    startCountdown(activeSessions.value[0])
  }
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

<style scoped>
.seckill-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #fef2f2 0%, #faf5ff 50%, #f0f4ff 100%);
  display: flex;
  flex-direction: column;
}

.page-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.main-content {
  flex: 1;
  padding: 20px 24px;
}

.session-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.session-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 28px;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-width: 140px;
}

.session-tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.session-tab.active {
  background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
  border-color: transparent;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
}

.session-name {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
}

.session-tab.active .session-name {
  color: white;
}

.session-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.countdown-label {
  color: #64748b;
}

.session-tab.active .countdown-label {
  color: rgba(255, 255, 255, 0.8);
}

.countdown-value {
  font-weight: 700;
  color: #ef4444;
  font-family: 'Courier New', monospace;
}

.session-tab.active .countdown-value {
  color: white;
}

.session-tag {
  margin-top: 4px;
}

.products-section {
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-state p {
  margin-top: 16px;
  font-size: 15px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.product-card:hover:not(.is-ended):not(.is-pending):not(.is-sold-out) {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.product-card.is-ended,
.product-card.is-pending,
.product-card.is-sold-out {
  opacity: 0.8;
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f1f5f9;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-text {
  font-size: 18px;
  font-weight: 700;
  color: white;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 24px;
  border-radius: 8px;
}

.product-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.product-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.current-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-symbol {
  font-size: 14px;
  font-weight: 600;
  color: #ef4444;
}

.price-value {
  font-size: 28px;
  font-weight: 700;
  color: #ef4444;
  line-height: 1;
}

.original-price {
  font-size: 14px;
  color: #94a3b8;
  text-decoration: line-through;
}

.discount-tag {
  background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.stock-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stock-bar-wrapper {
  width: 100%;
}

.stock-bar {
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.stock-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444 0%, #f97316 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.stock-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #64748b;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.action-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
}

.action-btn:not(.is-disabled) {
  background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.limit-tip {
  text-align: center;
  font-size: 12px;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }

  .session-tabs {
    gap: 8px;
    margin-bottom: 16px;
  }

  .session-tab {
    padding: 12px 16px;
    min-width: 120px;
  }

  .session-name {
    font-size: 14px;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .product-image-wrapper {
    height: 140px;
  }

  .product-info {
    padding: 12px;
    gap: 8px;
  }

  .product-name {
    font-size: 14px;
  }

  .price-value {
    font-size: 22px;
  }

  .action-btn {
    height: 40px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .product-card {
    flex-direction: row;
  }

  .product-image-wrapper {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
  }

  .product-info {
    flex: 1;
  }
}
</style>
