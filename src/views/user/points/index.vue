<template>
  <div class="user-points-container">
    <header class="points-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">我的积分</h1>
      </div>
      <el-button type="primary" @click="handleSignIn" :disabled="isSignedInToday">
        <el-icon><Star /></el-icon>
        {{ isSignedInToday ? '已签到' : '每日签到' }}
      </el-button>
    </header>

    <div class="points-summary">
      <div class="summary-card">
        <div class="summary-item">
          <div class="summary-value">{{ userPoints?.availablePoints || 0 }}</div>
          <div class="summary-label">可用积分</div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <div class="summary-value">{{ userPoints?.totalPoints || 0 }}</div>
          <div class="summary-label">累计积分</div>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <div class="summary-value">{{ userPoints?.historyPoints || 0 }}</div>
          <div class="summary-label">已使用</div>
        </div>
      </div>
    </div>

    <div class="points-tabs">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="积分明细" name="history">
          <div class="points-history">
            <div class="history-list">
              <div
                v-for="item in pointsHistory"
                :key="item.id"
                class="history-item"
              >
                <div class="history-icon" :class="item.type">
                  <el-icon v-if="item.type === 'earn'"><Plus /></el-icon>
                  <el-icon v-else><Minus /></el-icon>
                </div>
                <div class="history-info">
                  <div class="history-reason">{{ item.reason }}</div>
                  <div class="history-time">{{ item.createTime }}</div>
                  <div class="history-order" v-if="item.orderId">
                    订单号：{{ item.orderId }}
                  </div>
                </div>
                <div class="history-points" :class="item.type">
                  {{ item.type === 'earn' ? '+' : '' }}{{ item.points }}
                </div>
              </div>

              <div v-if="pointsHistory.length === 0" class="empty-state">
                <div class="empty-icon">
                  <el-icon :size="80"><Document /></el-icon>
                </div>
                <p class="empty-text">暂无积分明细</p>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="积分兑换" name="exchange">
          <div class="points-exchange">
            <div class="exchange-grid">
              <div
                v-for="goods in pointsGoods"
                :key="goods.id"
                class="goods-card"
                :class="{ 'out-of-stock': goods.stock <= 0 }"
              >
                <div class="goods-image">
                  <img :src="goods.image" :alt="goods.name" />
                  <div v-if="goods.stock <= 0" class="out-of-stock-overlay">
                    <span>已兑完</span>
                  </div>
                </div>
                <div class="goods-info">
                  <div class="goods-name">{{ goods.name }}</div>
                  <div class="goods-description">{{ goods.description }}</div>
                  <div class="goods-footer">
                    <div class="goods-points">
                      <span class="points-value">{{ goods.points }}</span>
                      <span class="points-label">积分</span>
                    </div>
                    <el-button
                      type="primary"
                      size="small"
                      :disabled="goods.stock <= 0 || (userPoints?.availablePoints || 0) < goods.points"
                      @click="handleExchange(goods)"
                    >
                      立即兑换
                    </el-button>
                  </div>
                </div>
              </div>

              <div v-if="pointsGoods.length === 0" class="empty-state">
                <div class="empty-icon">
                  <el-icon :size="80"><Goods /></el-icon>
                </div>
                <p class="empty-text">暂无可兑换的商品</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      v-model="exchangeDialogVisible"
      title="确认兑换"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="exchange-dialog-content">
        <div class="exchange-goods-info">
          <img :src="selectedGoods?.image" :alt="selectedGoods?.name" class="goods-preview" />
          <div class="goods-details">
            <div class="goods-name">{{ selectedGoods?.name }}</div>
            <div class="goods-description">{{ selectedGoods?.description }}</div>
            <div class="exchange-points">
              所需积分：<span class="points-highlight">{{ selectedGoods?.points }}</span> 积分
            </div>
            <div class="current-points">
              当前积分：<span class="points-normal">{{ userPoints?.availablePoints || 0 }}</span> 积分
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="exchangeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmExchange" :loading="exchangeLoading">
          确认兑换
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Star, Plus, Minus, Document, Goods } from '@element-plus/icons-vue'
import { 
  mockUserPoints, 
  mockPointsHistory, 
  mockPointsGoods 
} from '../../../data/mockData'

const router = useRouter()
const activeTab = ref('history')
const exchangeDialogVisible = ref(false)
const selectedGoods = ref(null)
const exchangeLoading = ref(false)
const isSignedInToday = ref(false)

const currentUser = computed(() => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
})

const userPoints = computed(() => {
  return mockUserPoints.find(p => p.userId === 1)
})

const pointsHistory = computed(() => {
  return mockPointsHistory
    .filter(h => h.userId === 1)
    .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
})

const pointsGoods = computed(() => {
  return mockPointsGoods.filter(g => g.status === 1)
})

const goBack = () => {
  router.back()
}

const handleSignIn = () => {
  if (isSignedInToday.value) {
    ElMessage.warning('您今天已经签到过了')
    return
  }

  ElMessageBox.confirm('确定要进行每日签到吗？签到可获得50积分。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    const signInPoints = 50
    
    if (userPoints.value) {
      userPoints.value.totalPoints += signInPoints
      userPoints.value.availablePoints += signInPoints
      userPoints.value.lastUpdateTime = new Date().toLocaleString()
    } else {
      mockUserPoints.push({
        id: Math.max(...mockUserPoints.map(p => p.id), 0) + 1,
        userId: 1,
        totalPoints: signInPoints,
        availablePoints: signInPoints,
        frozenPoints: 0,
        historyPoints: 0,
        lastUpdateTime: new Date().toLocaleString()
      })
    }

    const newHistory = {
      id: Math.max(...mockPointsHistory.map(h => h.id), 0) + 1,
      userId: 1,
      type: 'earn',
      points: signInPoints,
      reason: '每日签到',
      orderId: null,
      createTime: new Date().toLocaleString()
    }
    mockPointsHistory.unshift(newHistory)

    isSignedInToday.value = true
    ElMessage.success(`签到成功！获得 ${signInPoints} 积分`)
  }).catch(() => {})
}

const handleExchange = (goods) => {
  if (goods.stock <= 0) {
    ElMessage.warning('该商品已兑换完')
    return
  }

  if ((userPoints.value?.availablePoints || 0) < goods.points) {
    ElMessage.warning(`积分不足，需要 ${goods.points} 积分`)
    return
  }

  selectedGoods.value = goods
  exchangeDialogVisible.value = true
}

const confirmExchange = () => {
  if (!selectedGoods.value) return

  exchangeLoading.value = true

  setTimeout(() => {
    const goods = selectedGoods.value
    
    userPoints.value.availablePoints -= goods.points
    userPoints.value.historyPoints += goods.points
    userPoints.value.lastUpdateTime = new Date().toLocaleString()

    goods.stock--

    const newHistory = {
      id: Math.max(...mockPointsHistory.map(h => h.id), 0) + 1,
      userId: 1,
      type: 'spend',
      points: -goods.points,
      reason: `积分兑换：${goods.name}`,
      orderId: null,
      createTime: new Date().toLocaleString()
    }
    mockPointsHistory.unshift(newHistory)

    exchangeLoading.value = false
    exchangeDialogVisible.value = false
    selectedGoods.value = null
    ElMessage.success(`兑换成功！已扣除 ${goods.points} 积分`)
  }, 1000)
}

onMounted(() => {
  const lastSignIn = localStorage.getItem('lastSignIn')
  const today = new Date().toDateString()
  isSignedInToday.value = lastSignIn === today
})
</script>

<style scoped>
.user-points-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.points-header {
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

.points-summary {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.summary-card {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.summary-value {
  font-size: 36px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.summary-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.summary-divider {
  width: 1px;
  height: 60px;
  background: rgba(255, 255, 255, 0.3);
}

.points-tabs {
  flex: 1;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

:deep(.el-tabs__nav-wrap) {
  margin-bottom: 20px;
}

.points-history {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.history-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-icon.earn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.history-icon.spend {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-reason {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.history-time {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.history-order {
  font-size: 12px;
  color: #94a3b8;
}

.history-points {
  font-size: 20px;
  font-weight: 700;
  flex-shrink: 0;
}

.history-points.earn {
  color: #10b981;
}

.history-points.spend {
  color: #ef4444;
}

.points-exchange {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.exchange-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.goods-card {
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.goods-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.goods-card.out-of-stock {
  opacity: 0.6;
}

.goods-image {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #e2e8f0;
}

.goods-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.out-of-stock-overlay {
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

.out-of-stock-overlay span {
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.goods-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.goods-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.goods-description {
  font-size: 13px;
  color: #64748b;
  flex: 1;
}

.goods-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.goods-points {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.points-value {
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
}

.points-label {
  font-size: 13px;
  color: #94a3b8;
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
  font-size: 16px;
  color: #64748b;
  margin: 0 0 20px 0;
}

.exchange-dialog-content {
  padding: 10px 0;
}

.exchange-goods-info {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.goods-preview {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.goods-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.goods-details .goods-name {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.goods-details .goods-description {
  font-size: 14px;
  color: #64748b;
}

.exchange-points,
.current-points {
  font-size: 14px;
  color: #64748b;
}

.points-highlight {
  font-size: 18px;
  font-weight: 700;
  color: #ef4444;
}

.points-normal {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
}

@media (max-width: 768px) {
  .points-header {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .points-summary {
    padding: 16px;
  }

  .summary-card {
    padding: 16px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .summary-item {
    flex: 1;
    min-width: 80px;
  }

  .summary-divider {
    display: none;
  }

  .summary-value {
    font-size: 28px;
  }

  .points-tabs {
    padding: 16px;
  }

  .exchange-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .goods-image {
    height: 120px;
  }

  .goods-info {
    padding: 12px;
  }

  .goods-footer {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .exchange-goods-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>