<template>
  <div class="user-vip-container">
    <header class="page-header">
      <div class="page-header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">会员中心</h1>
      </div>
    </header>

    <div class="page-container">
      <div class="vip-summary-card card">
        <div class="vip-summary-left">
          <div class="vip-avatar-wrapper">
            <div class="vip-avatar">{{ currentVip?.vipInfo?.icon || '👤' }}</div>
          </div>
          <div class="vip-summary-info">
            <div class="vip-name-row">
              <span class="vip-name">{{ currentVip?.vipInfo?.name || '普通会员' }}</span>
              <span 
                v-if="isVipActive" 
                class="badge badge-success"
              >
                已激活
              </span>
              <span 
                v-else-if="vipDaysRemaining === 0 && currentVip?.level > 0" 
                class="badge badge-error"
              >
                已过期
              </span>
            </div>
            <div class="vip-meta-row">
              <span class="vip-meta-item">
                <span class="vip-meta-label">专属折扣</span>
                <span class="vip-meta-value">{{ (currentVip?.discount || 1) * 10 }}折</span>
              </span>
              <span v-if="currentVip?.endTime && currentVip?.level > 0" class="vip-meta-item">
                <span class="vip-meta-label">有效期</span>
                <span class="vip-meta-value">
                  <span v-if="vipDaysRemaining > 0">
                    {{ formatDate(currentVip?.endTime) }}（剩余{{ vipDaysRemaining }}天）
                  </span>
                  <span v-else class="expired">已过期</span>
                </span>
              </span>
            </div>
          </div>
        </div>
        <div class="vip-summary-stats">
          <div class="stat-item">
            <div class="stat-num">{{ currentVip?.totalSpent || 0 }}</div>
            <div class="stat-text">累计消费(元)</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-num">{{ currentVip?.totalOrders || 0 }}</div>
            <div class="stat-text">累计订单</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-num rank-num">#{{ vipRanking?.rank || '-' }}</div>
            <div class="stat-text">会员排名</div>
          </div>
        </div>
      </div>

      <div v-if="nextVipLevel" class="progress-card card">
        <div class="progress-header">
          <span class="progress-label">升级进度</span>
          <span class="progress-meta">{{ currentVip?.totalSpent || 0 }} / {{ nextVipLevel?.minPoints || '∞' }}</span>
        </div>
        <el-progress 
          :percentage="upgradeProgress" 
          :stroke-width="8"
          :color="getProgressColor"
          :show-text="false"
        />
        <div class="progress-hint">
          <span v-if="nextVipLevel">
            距离 <span class="highlight">{{ nextVipLevel.name }}</span> 还需消费 
            <span class="highlight">{{ Math.max(0, (nextVipLevel.minPoints || 0) - (currentVip?.totalSpent || 0)) }}</span> 元
          </span>
          <span v-else>您已达到最高等级</span>
        </div>
      </div>

      <div v-if="vipLeaderboard.length > 0" class="ranking-card card">
        <div class="card-header">
          <span class="card-title">会员排行榜</span>
          <span class="card-subtitle">您的排名：第 {{ vipRanking?.rank || '-' }} 名 / 共 {{ vipRanking?.totalUsers || 0 }} 人</span>
        </div>
        <div class="ranking-list">
          <div
            v-for="(item, index) in vipLeaderboard"
            :key="item.userId"
            class="ranking-item"
            :class="{ 'is-current': item.userId === currentUserId }"
          >
            <div class="ranking-order" :class="'order-' + item.rank">
              <span v-if="item.rank <= 3">{{ item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉' }}</span>
              <span v-else>{{ item.rank }}</span>
            </div>
            <div class="ranking-content">
              <div class="ranking-info">
                <span class="ranking-name">{{ item.levelName }}</span>
                <span class="ranking-desc">消费 {{ item.totalSpent }} 元 · {{ item.totalOrders }} 单</span>
              </div>
              <div class="ranking-tag">
                <span v-if="item.isActive" class="badge badge-success">活跃</span>
                <span v-else class="badge badge-neutral">已过期</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="tabs-container">
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="会员权益" name="benefits">
            <div class="benefits-grid">
              <div
                v-for="benefit in availableBenefits"
                :key="benefit.id"
                class="benefit-card"
                :class="{ 'is-unlocked': isBenefitUnlocked(benefit) }"
              >
                <div class="benefit-icon-wrapper">
                  <div class="benefit-icon">{{ benefit.icon }}</div>
                </div>
                <div class="benefit-info">
                  <div class="benefit-title">{{ benefit.name }}</div>
                  <div class="benefit-desc">{{ benefit.description }}</div>
                </div>
                <div class="benefit-status">
                  <span v-if="isBenefitUnlocked(benefit)" class="tag tag-success">已解锁</span>
                  <span v-else class="tag tag-neutral">{{ getRequiredLevel(benefit.minLevel) }}解锁</span>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="会员等级" name="levels">
            <div class="levels-list">
              <div
                v-for="(level, index) in vipLevels"
                :key="level.id"
                class="level-card"
                :class="{ 
                  'is-current': currentVip?.vipInfo?.id === level.id,
                  'is-passed': currentVip?.vipInfo?.id > level.id
                }"
              >
                <div class="level-left">
                  <div class="level-icon-wrapper" :class="{
                    'current': currentVip?.vipInfo?.id === level.id,
                    'passed': currentVip?.vipInfo?.id > level.id
                  }">
                    <div class="level-icon">{{ level.icon }}</div>
                  </div>
                  <div class="level-info">
                    <div class="level-name">{{ level.name }}</div>
                    <div class="level-detail">专属折扣：{{ level.discount * 10 }}折</div>
                    <div class="level-condition" v-if="level.minPoints > 0">
                      累计消费满 {{ level.minPoints }} 元
                    </div>
                    <div class="level-condition" v-else>
                      注册即可成为会员
                    </div>
                  </div>
                </div>
                <div class="level-right">
                  <span v-if="currentVip?.vipInfo?.id === level.id" class="tag tag-primary">当前等级</span>
                  <span v-else-if="currentVip?.vipInfo?.id > level.id" class="tag tag-success">已达成</span>
                  <span v-else class="tag tag-neutral">未达成</span>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div v-if="availableUpgradeOptions.length > 0" class="upgrade-section">
        <div class="card-header">
          <span class="card-title">{{ currentVip?.level > 0 && isVipActive ? '续费/升级会员' : '升级会员' }}</span>
          <span class="card-subtitle">享受更多专属权益</span>
        </div>
        <div class="upgrade-options">
          <div 
            v-for="option in availableUpgradeOptions" 
            :key="option.id"
            class="upgrade-card card card-clickable"
            :class="{ 
              'is-recommended': option.recommended,
              'is-disabled': !option.canPurchase 
            }"
          >
            <div v-if="option.recommended" class="recommend-badge">推荐</div>
            <div class="upgrade-header">
              <span class="upgrade-name">{{ option.name }}</span>
              <span class="upgrade-duration">{{ option.duration }}</span>
            </div>
            <div class="upgrade-price">
              <span class="price-unit">¥</span>
              <span class="price-num">{{ option.price }}</span>
              <span v-if="option.originalPrice > option.price" class="price-original">¥{{ option.originalPrice }}</span>
            </div>
            <div class="upgrade-benefits">
              <div v-for="benefit in option.benefits" :key="benefit" class="benefit-tag">
                <el-icon><Check /></el-icon>
                <span>{{ benefit }}</span>
              </div>
            </div>
            <el-button 
              :type="option.canPurchase ? 'primary' : 'default'" 
              class="upgrade-btn"
              :disabled="!option.canPurchase"
              @click="handleUpgrade(option)"
            >
              {{ option.canPurchase ? (option.type === 'renew' ? '立即续费' : '立即开通') : '不可购买' }}
            </el-button>
            <div v-if="!option.canPurchase" class="unavailable-tip">
              <el-icon><Warning /></el-icon>
              <span>{{ option.unavailableReason }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showPaymentProcessing" class="overlay">
      <div class="overlay-content">
        <div class="overlay-icon">
          <el-icon class="loading-spinner"><Loading /></el-icon>
        </div>
        <div class="overlay-title">支付处理中</div>
        <div class="overlay-desc">正在处理您的支付请求，请稍候...</div>
      </div>
    </div>

    <el-dialog
      v-model="showSuccessModal"
      width="420px"
      :show-close="false"
      :close-on-click-modal="false"
      class="success-dialog"
      center
    >
      <div class="success-content">
        <div class="success-icon">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="success-title">
          {{ successModalData?.action }}成功
        </div>
        <div class="success-details">
          <div class="detail-row">
            <span class="detail-label">套餐名称</span>
            <span class="detail-value">{{ successModalData?.packageName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">会员等级</span>
            <span class="detail-value">{{ successModalData?.targetLevel?.name }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">支付金额</span>
            <span class="detail-value price">¥{{ successModalData?.price }}</span>
          </div>
          <div class="detail-row" v-if="successModalData?.newEndTime">
            <span class="detail-label">有效期至</span>
            <span class="detail-value">{{ formatDate(successModalData?.newEndTime) }}</span>
          </div>
        </div>
        <div class="success-tip">
          您已成功{{ successModalData?.action }}为{{ successModalData?.targetLevel?.name }}，会员权益立即生效
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="closeSuccessModal" class="success-btn">
          我知道了
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Check, Clock, Warning, Loading, CircleCheck } from '@element-plus/icons-vue'
import { 
  mockVipLevels, 
  mockVipBenefits
} from '../../../data/mockData'
import {
  getCurrentUserVipInfo,
  getVipLevelByLevel,
  canPurchaseVipOption,
  upgradeVip,
  extendVipDuration,
  onVipUpdated,
  checkVipExpiration,
  getVipRanking,
  getVipLeaderboard,
  getAvailableVipPackages
} from '../../../utils/userState'

const router = useRouter()
const activeTab = ref('benefits')
const loading = ref(false)
const vipRefreshTrigger = ref(0)
const showSuccessModal = ref(false)
const successModalData = ref(null)
const showPaymentProcessing = ref(false)

let removeVipListener = null

const currentUser = computed(() => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
})

const currentUserId = computed(() => {
  return currentUser.value?.id || 1
})

const vipLevels = computed(() => {
  return [...mockVipLevels].sort((a, b) => a.level - b.level)
})

const currentVip = computed(() => {
  vipRefreshTrigger.value
  return getCurrentUserVipInfo(currentUserId.value)
})

const isVipActive = computed(() => {
  return currentVip.value?.isVipActive || false
})

const vipDaysRemaining = computed(() => {
  if (!currentVip.value?.endTime) return null
  return currentVip.value.daysRemaining || 0
})

const nextVipLevel = computed(() => {
  if (!currentVip.value) return null
  const currentLevel = currentVip.value.vipInfo?.level || 0
  return vipLevels.value.find(l => l.level > currentLevel)
})

const upgradeProgress = computed(() => {
  if (!currentVip.value || !nextVipLevel.value) return 100
  const currentSpent = currentVip.value.totalSpent || 0
  const nextMinPoints = nextVipLevel.value.minPoints || 0
  if (nextMinPoints === 0) return 100
  return Math.min(100, Math.round((currentSpent / nextMinPoints) * 100))
})

const getProgressColor = computed(() => {
  return '#3b82f6'
})

const availableBenefits = computed(() => {
  return mockVipBenefits
})

const vipRanking = computed(() => {
  vipRefreshTrigger.value
  return getVipRanking(currentUserId.value)
})

const vipLeaderboard = computed(() => {
  vipRefreshTrigger.value
  return getVipLeaderboard(10)
})

const upgradeOptions = computed(() => {
  vipRefreshTrigger.value
  return getAvailableVipPackages(currentUserId.value)
})

const currentVipLevelNum = computed(() => {
  return currentVip.value?.vipInfo?.level || 0
})

const getUpgradeOptionStatus = (option) => {
  return canPurchaseVipOption(option, currentUserId.value)
}

const availableUpgradeOptions = computed(() => {
  return upgradeOptions.value.map(option => {
    const status = getUpgradeOptionStatus(option)
    return {
      ...option,
      canPurchase: status.canPurchase,
      unavailableReason: status.reason
    }
  })
})

const getTargetVipLevel = (targetLevelNum) => {
  return getVipLevelByLevel(targetLevelNum) || vipLevels.value[0]
}

const handleUpgrade = (option) => {
  const status = getUpgradeOptionStatus(option)
  if (!status.canPurchase) {
    ElMessage.warning(status.reason)
    return
  }

  const targetLevel = getTargetVipLevel(option.targetLevel)
  const currentLevel = currentVipLevelNum.value
  const isRenew = option.type === 'renew'
  
  let actionText = isRenew ? '续费' : '开通'
  let message = `确定要${actionText}"${option.name}"吗？\n\n`
  message += `价格：¥${option.price}\n`
  if (option.originalPrice > option.price) {
    message += `原价：¥${option.originalPrice}（已省¥${option.originalPrice - option.price}）\n`
  }
  message += `有效期：${option.duration}\n`
  message += `会员等级：${targetLevel.name}\n`
  message += `专属折扣：${targetLevel.discount * 10}折\n\n`
  if (currentLevel > 0 && !isRenew) {
    message += `当前会员等级：${currentVip.value?.vipInfo?.name}\n`
    message += `升级后会员等级：${targetLevel.name}\n`
  }
  message += `${actionText}后将立即享受对应会员权益。`

  ElMessageBox.confirm(
    message,
    `确认${actionText}会员`,
    {
      confirmButtonText: '确认支付',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    showPaymentProcessing.value = true
    loading.value = true
    
    setTimeout(() => {
      let result
      if (isRenew) {
        result = extendVipDuration(option, currentUserId.value)
      } else {
        result = upgradeVip(option, currentUserId.value)
      }
      
      showPaymentProcessing.value = false
      loading.value = false
      
      if (result.success) {
        vipRefreshTrigger.value++
        
        successModalData.value = {
          action: isRenew ? '续费' : '开通',
          packageName: option.name,
          targetLevel: result.targetLevel || targetLevel,
          price: option.price,
          duration: option.duration,
          isRenew: isRenew,
          newEndTime: result.vipInfo?.endTime
        }
        showSuccessModal.value = true
      } else {
        ElMessage.error(result.message || '操作失败，请重试')
      }
      
    }, 1500)
  }).catch(() => {})
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  successModalData.value = null
}

const goBack = () => {
  router.back()
}

const isBenefitUnlocked = (benefit) => {
  if (!currentVip.value) return false
  return currentVip.value.vipInfo?.level >= benefit.minLevel && isVipActive.value
}

const getRequiredLevel = (minLevel) => {
  const level = vipLevels.value.find(l => l.level === minLevel)
  return level ? level.name : ''
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const refreshVipData = () => {
  vipRefreshTrigger.value++
}

onMounted(() => {
  const expired = checkVipExpiration(currentUserId.value)
  if (expired) {
    ElMessage.warning('您的会员已过期，已自动降级为普通会员')
    vipRefreshTrigger.value++
  }
  
  removeVipListener = onVipUpdated(() => {
    vipRefreshTrigger.value++
  })
})

onUnmounted(() => {
  if (removeVipListener) {
    removeVipListener()
  }
})
</script>

<style scoped>
.user-vip-container {
  min-height: 100vh;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
}

.vip-summary-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.vip-summary-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.vip-avatar-wrapper {
  position: relative;
}

.vip-avatar {
  width: 64px;
  height: 64px;
  background: var(--slate-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.vip-summary-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.vip-name-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.vip-name {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.vip-meta-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.vip-meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.vip-meta-label {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.vip-meta-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.vip-meta-value .expired {
  color: var(--error-600);
  font-weight: var(--font-weight-semibold);
}

.vip-summary-stats {
  display: flex;
  align-items: center;
  gap: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 0 var(--spacing-xl);
}

.stat-num {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1;
}

.rank-num {
  color: var(--primary-600);
}

.stat-text {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border-primary);
}

.progress-card {
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.progress-label {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.progress-meta {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.progress-hint {
  margin-top: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  text-align: center;
}

.highlight {
  font-weight: var(--font-weight-semibold);
  color: var(--primary-600);
}

.ranking-card {
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.card-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.ranking-item:hover {
  background: var(--slate-100);
}

.ranking-item.is-current {
  background: var(--primary-50);
  border: 1px solid var(--primary-200);
}

.ranking-order {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-tertiary);
  background: var(--slate-200);
  border-radius: 50%;
  flex-shrink: 0;
}

.ranking-order.order-1 {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.ranking-order.order-2 {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
  color: white;
}

.ranking-order.order-3 {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: white;
}

.ranking-content {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
}

.ranking-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.ranking-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.ranking-desc {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.tabs-container {
  margin-bottom: var(--spacing-lg);
}

:deep(.el-tabs--border-card > .el-tabs__header) {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-bottom: none;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

:deep(.el-tabs--border-card > .el-tabs__content) {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  padding: var(--spacing-xl);
}

:deep(.el-tabs__item) {
  color: var(--text-secondary);
}

:deep(.el-tabs__item.is-active) {
  color: var(--primary-600);
}

:deep(.el-tabs__active-bar) {
  background-color: var(--primary-600);
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--spacing-md);
}

.benefit-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-secondary);
  transition: all var(--transition-fast);
}

.benefit-card:hover {
  background: var(--slate-100);
  border-color: var(--primary-200);
}

.benefit-card.is-unlocked {
  background: var(--primary-50);
  border-color: var(--primary-200);
}

.benefit-icon-wrapper {
  flex-shrink: 0;
}

.benefit-icon {
  width: 44px;
  height: 44px;
  background: var(--slate-200);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.benefit-card.is-unlocked .benefit-icon {
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
}

.benefit-info {
  flex: 1;
  min-width: 0;
}

.benefit-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.benefit-desc {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.benefit-status {
  flex-shrink: 0;
}

.levels-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.level-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-secondary);
  transition: all var(--transition-fast);
}

.level-card:hover {
  background: var(--slate-100);
}

.level-card.is-current {
  background: var(--primary-50);
  border-color: var(--primary-200);
}

.level-card.is-passed {
  background: var(--success-50);
  border-color: var(--success-200);
}

.level-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.level-icon-wrapper {
  flex-shrink: 0;
}

.level-icon {
  width: 48px;
  height: 48px;
  background: var(--slate-200);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.level-icon-wrapper.current .level-icon {
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
}

.level-icon-wrapper.passed .level-icon {
  background: linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%);
}

.level-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.level-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.level-detail {
  font-size: var(--font-size-sm);
  color: var(--primary-600);
}

.level-condition {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.level-right {
  flex-shrink: 0;
}

.upgrade-section {
  margin-bottom: var(--spacing-3xl);
}

.upgrade-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

.upgrade-card {
  position: relative;
  padding: var(--spacing-xl);
  text-align: center;
}

.upgrade-card.is-recommended {
  border-color: var(--warning-300);
  background: linear-gradient(180deg, #fffbeb 0%, #ffffff 50%);
}

.upgrade-card.is-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.recommend-badge {
  position: absolute;
  top: -10px;
  right: var(--spacing-lg);
  background: var(--warning-500);
  color: white;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.upgrade-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
}

.upgrade-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.upgrade-duration {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.upgrade-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  margin-bottom: var(--spacing-lg);
}

.price-unit {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--primary-600);
}

.price-num {
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-600);
  line-height: 1;
}

.price-original {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  text-decoration: line-through;
  margin-left: var(--spacing-sm);
}

.upgrade-benefits {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.benefit-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.benefit-tag .el-icon {
  color: var(--success-500);
}

.upgrade-btn {
  width: 100%;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
}

.unavailable-tip {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--warning-50);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  color: var(--warning-700);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.overlay-content {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--spacing-3xl);
  text-align: center;
  box-shadow: var(--shadow-xl);
}

.overlay-icon {
  margin-bottom: var(--spacing-lg);
}

.loading-spinner {
  font-size: 48px;
  color: var(--primary-600);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.overlay-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.overlay-desc {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.success-dialog :deep(.el-dialog__header) {
  display: none;
}

.success-dialog :deep(.el-dialog__body) {
  padding: var(--spacing-2xl) var(--spacing-xl) var(--spacing-xl);
}

.success-dialog :deep(.el-dialog__footer) {
  border-top: none;
  padding-top: 0;
  text-align: center;
}

.success-content {
  text-align: center;
}

.success-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-xl);
  background: linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon .el-icon {
  font-size: 36px;
  color: white;
}

.success-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
}

.success-details {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-primary);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.detail-value {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.detail-value.price {
  color: var(--primary-600);
  font-size: var(--font-size-lg);
}

.success-tip {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  line-height: var(--line-height-relaxed);
}

.success-btn {
  width: 140px;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
}

@media (max-width: 768px) {
  .vip-summary-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xl);
    padding: var(--spacing-lg);
  }

  .vip-summary-left {
    width: 100%;
  }

  .vip-summary-stats {
    width: 100%;
    justify-content: space-around;
  }

  .stat-item {
    padding: 0;
  }

  .stat-divider {
    display: none;
  }

  .progress-card,
  .ranking-card {
    padding: var(--spacing-lg);
  }

  .upgrade-options {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .levels-list {
    gap: var(--spacing-sm);
  }

  .level-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .level-right {
    width: 100%;
  }

  .ranking-item {
    flex-wrap: wrap;
  }

  .ranking-tag {
    width: 100%;
    margin-top: var(--spacing-sm);
  }

  .benefits-grid {
    grid-template-columns: 1fr;
  }

  .benefit-card {
    flex-wrap: wrap;
  }

  .benefit-status {
    width: 100%;
    margin-top: var(--spacing-sm);
  }

  .overlay-content {
    margin: 0 var(--spacing-lg);
    padding: var(--spacing-xl);
  }

  .success-dialog :deep(.el-dialog) {
    margin: var(--spacing-lg);
    width: auto !important;
  }
}
</style>
