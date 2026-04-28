<template>
  <div class="page-container">
    <header class="page-header">
      <div class="page-header-left">
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
      <div class="stat-card" style="background: var(--primary-600); border-color: var(--primary-600);">
        <div class="points-stats">
          <div class="points-stat-item">
            <div class="points-value">{{ userPoints?.availablePoints || 0 }}</div>
            <div class="points-label">可用积分</div>
          </div>
          <div class="points-divider" style="background: rgba(255,255,255,0.2);"></div>
          <div class="points-stat-item">
            <div class="points-value">{{ userPoints?.totalPoints || 0 }}</div>
            <div class="points-label">累计积分</div>
          </div>
          <div class="points-divider" style="background: rgba(255,255,255,0.2);"></div>
          <div class="points-stat-item">
            <div class="points-value">{{ userPoints?.historyPoints || 0 }}</div>
            <div class="points-label">已使用</div>
          </div>
        </div>
      </div>
    </div>

    <div class="points-tabs">
      <el-tabs v-model="activeTab" class="tabs-custom">
        <el-tab-pane label="积分明细" name="history">
          <div class="points-history">
            <div class="history-list">
              <div
                v-for="item in pointsHistory"
                :key="item.id"
                class="card history-item"
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
                <div class="empty-state-icon">
                  <el-icon :size="48"><Document /></el-icon>
                </div>
                <p class="empty-state-title">暂无积分明细</p>
                <p class="empty-state-text">签到、消费均可获得积分</p>
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
                class="card goods-card"
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
                <div class="empty-state-icon">
                  <el-icon :size="48"><Goods /></el-icon>
                </div>
                <p class="empty-state-title">暂无可兑换的商品</p>
                <p class="empty-state-text">更多兑换商品即将上线</p>
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
    localStorage.setItem('lastSignIn', new Date().toDateString())
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
.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  min-height: 100vh;
}

.points-summary {
  margin-top: var(--spacing-xl);
}

.points-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--spacing-xl);
  color: white;
}

.points-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.points-value {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.points-label {
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.points-divider {
  width: 1px;
  height: 50px;
}

.points-tabs {
  margin-top: var(--spacing-xl);
}

:deep(.tabs-custom .el-tabs__nav-wrap) {
  margin-bottom: var(--spacing-xl);
}

:deep(.tabs-custom .el-tabs__item) {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  padding: var(--spacing-sm) var(--spacing-lg);
  height: 40px;
  line-height: 40px;
}

:deep(.tabs-custom .el-tabs__item.is-active) {
  color: var(--primary-600);
  font-weight: var(--font-weight-medium);
}

:deep(.tabs-custom .el-tabs__active-bar) {
  background-color: var(--primary-600);
  height: 2px;
}

:deep(.tabs-custom .el-tabs__nav-wrap::after) {
  background-color: var(--border-primary);
  height: 1px;
}

.points-history,
.points-exchange {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.history-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
}

.history-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: white;
}

.history-icon.earn {
  background: var(--success-500);
}

.history-icon.spend {
  background: var(--error-500);
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-reason {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.history-time {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-xs);
}

.history-order {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.history-points {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.history-points.earn {
  color: var(--success-600);
}

.history-points.spend {
  color: var(--error-600);
}

.exchange-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--spacing-xl);
}

.goods-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

.goods-card.out-of-stock {
  opacity: 0.6;
}

.goods-image {
  position: relative;
  width: 100%;
  height: 150px;
  overflow: hidden;
  background: var(--slate-100);
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
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: white;
}

.goods-info {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.goods-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.goods-description {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  flex: 1;
  margin-bottom: var(--spacing-md);
}

.goods-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-points {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.points-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-600);
}

.points-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.exchange-dialog-content {
  padding: 10px 0;
}

.exchange-goods-info {
  display: flex;
  gap: var(--spacing-lg);
  align-items: flex-start;
}

.goods-preview {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-md);
  object-fit: cover;
  flex-shrink: 0;
}

.goods-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.goods-details .goods-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0;
}

.goods-details .goods-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
}

.exchange-points,
.current-points {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.points-highlight {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--error-600);
}

.points-normal {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--success-600);
}

@media (max-width: 768px) {
  .page-container {
    padding: var(--spacing-lg);
  }

  .page-header {
    margin: 0 calc(-1 * var(--spacing-lg));
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .points-summary {
    margin-top: var(--spacing-lg);
  }

  .points-stats {
    padding: var(--spacing-lg);
    flex-wrap: wrap;
    gap: var(--spacing-lg);
  }

  .points-stat-item {
    flex: 1;
    min-width: 80px;
  }

  .points-divider {
    display: none;
  }

  .points-value {
    font-size: var(--font-size-4xl);
  }

  .points-tabs {
    margin-top: var(--spacing-lg);
  }

  :deep(.tabs-custom .el-tabs__item) {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-sm);
  }

  .exchange-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
  }

  .goods-image {
    height: 120px;
  }

  .goods-info {
    padding: var(--spacing-md);
  }

  .goods-footer {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }

  .exchange-goods-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .history-item {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }

  .history-icon {
    width: 36px;
    height: 36px;
  }

  .history-points {
    font-size: var(--font-size-xl);
  }
}
</style>
