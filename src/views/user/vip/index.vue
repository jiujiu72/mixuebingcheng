<template>
  <div class="user-vip-container">
    <header class="vip-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">会员中心</h1>
      </div>
    </header>

    <div class="vip-banner" :class="{ 'expired': vipDaysRemaining === 0, 'active': isVipActive }">
      <div class="banner-content">
        <div class="vip-info">
          <div class="vip-icon">{{ currentVip?.vipInfo?.icon || '👤' }}</div>
          <div class="vip-details">
            <div class="vip-name-row">
              <span class="vip-name">{{ currentVip?.vipInfo?.name || '普通会员' }}</span>
              <el-tag 
                v-if="isVipActive" 
                type="success" 
                size="small"
                class="vip-status-tag"
              >
                已激活
              </el-tag>
              <el-tag 
                v-else-if="vipDaysRemaining === 0 && currentVip?.level > 0" 
                type="danger" 
                size="small"
                class="vip-status-tag"
              >
                已过期
              </el-tag>
            </div>
            <div class="vip-discount">
              专属折扣：<span class="discount-value">{{ (currentVip?.discount || 1) * 10 }}折</span>
            </div>
            <div class="vip-validity" v-if="currentVip?.endTime && currentVip?.level > 0">
              <el-icon><Clock /></el-icon>
              <span v-if="vipDaysRemaining > 0">
                有效期至：{{ formatDate(currentVip?.endTime) }}（剩余{{ vipDaysRemaining }}天）
              </span>
              <span v-else class="expired-text">
                已过期，请续费
              </span>
            </div>
          </div>
        </div>
        <div class="vip-stats">
          <div class="stat-item">
            <div class="stat-value">{{ currentVip?.totalSpent || 0 }}</div>
            <div class="stat-label">累计消费(元)</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ currentVip?.totalOrders || 0 }}</div>
            <div class="stat-label">累计订单</div>
          </div>
        </div>
      </div>
    </div>

    <div class="vip-progress">
      <div class="progress-card">
        <div class="progress-header">
          <span class="progress-title">升级进度</span>
          <span class="progress-text">
            {{ currentVip?.totalSpent || 0 }} / {{ nextVipLevel?.minPoints || '∞' }}
          </span>
        </div>
        <el-progress 
          :percentage="upgradeProgress" 
          :status="upgradeProgress >= 100 ? 'success' : ''"
          :stroke-width="12"
        />
        <div class="progress-info">
          <span v-if="nextVipLevel">
            距离 {{ nextVipLevel.name }} 还需消费 
            <span class="highlight">{{ Math.max(0, (nextVipLevel.minPoints || 0) - (currentVip?.totalSpent || 0)) }}</span> 元
          </span>
          <span v-else>您已达到最高等级</span>
        </div>
      </div>
    </div>

    <div class="vip-tabs">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="会员权益" name="benefits">
          <div class="benefits-section">
            <div class="benefits-grid">
              <div
                v-for="benefit in availableBenefits"
                :key="benefit.id"
                class="benefit-card"
                :class="{ 'unlocked': isBenefitUnlocked(benefit) }"
              >
                <div class="benefit-icon">{{ benefit.icon }}</div>
                <div class="benefit-info">
                  <div class="benefit-name">{{ benefit.name }}</div>
                  <div class="benefit-description">{{ benefit.description }}</div>
                </div>
                <div class="benefit-status">
                  <el-tag v-if="isBenefitUnlocked(benefit)" type="success" size="small">
                    已解锁
                  </el-tag>
                  <el-tag v-else type="info" size="small">
                    {{ getRequiredLevel(benefit.minLevel) }}解锁
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="会员等级" name="levels">
          <div class="levels-section">
            <div class="levels-list">
              <div
                v-for="(level, index) in vipLevels"
                :key="level.id"
                class="level-card"
                :class="{ 
                  'current': currentVip?.vipInfo?.id === level.id,
                  'passed': currentVip?.vipInfo?.id > level.id
                }"
              >
                <div class="level-left">
                  <div class="level-icon">{{ level.icon }}</div>
                  <div class="level-info">
                    <div class="level-name">{{ level.name }}</div>
                    <div class="level-discount">专属折扣：{{ level.discount * 10 }}折</div>
                    <div class="level-requirement" v-if="level.minPoints > 0">
                      累计消费满 {{ level.minPoints }} 元
                    </div>
                    <div class="level-requirement" v-else>
                      注册即可成为会员
                    </div>
                  </div>
                </div>
                <div class="level-right">
                  <el-tag v-if="currentVip?.vipInfo?.id === level.id" type="primary" size="small">
                    当前等级
                  </el-tag>
                  <el-tag v-else-if="currentVip?.vipInfo?.id > level.id" type="success" size="small">
                    已达成
                  </el-tag>
                  <el-tag v-else type="info" size="small">
                    未达成
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="upgrade-section">
      <div class="upgrade-card">
        <div class="upgrade-header">
          <h3>升级会员</h3>
          <p>享受更多专属权益</p>
        </div>
        <div class="upgrade-options">
          <div 
            v-for="option in availableUpgradeOptions" 
            :key="option.id"
            class="upgrade-option"
            :class="{ 
              'recommended': option.recommended,
              'disabled': !option.canPurchase 
            }"
          >
            <div class="option-badge" v-if="option.recommended">推荐</div>
            <div class="option-name">{{ option.name }}</div>
            <div class="option-duration">{{ option.duration }}</div>
            <div class="option-price">
              <span class="price-symbol">¥</span>
              <span class="price-value">{{ option.price }}</span>
              <span class="price-original" v-if="option.originalPrice">¥{{ option.originalPrice }}</span>
            </div>
            <div class="option-benefits">
              <div v-for="benefit in option.benefits" :key="benefit" class="benefit-item">
                <el-icon><Check /></el-icon>
                <span>{{ benefit }}</span>
              </div>
            </div>
            <el-button 
              :type="option.canPurchase ? 'primary' : 'info'" 
              class="upgrade-btn"
              :disabled="!option.canPurchase"
              @click="handleUpgrade(option)"
            >
              {{ option.canPurchase ? '立即开通' : '不可购买' }}
            </el-button>
            <div v-if="!option.canPurchase" class="unavailable-reason">
              <el-icon><Warning /></el-icon>
              <span>{{ option.unavailableReason }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Check, Clock, Warning } from '@element-plus/icons-vue'
import { 
  mockVipLevels, 
  mockVipBenefits
} from '../../../data/mockData'
import {
  getCurrentUserVipInfo,
  getVipLevelByLevel,
  canPurchaseVipOption,
  upgradeVip,
  onVipUpdated,
  checkVipExpiration
} from '../../../utils/userState'

const router = useRouter()
const activeTab = ref('benefits')
const loading = ref(false)
const vipRefreshTrigger = ref(0)

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

const availableBenefits = computed(() => {
  return mockVipBenefits
})

const upgradeOptions = ref([
  {
    id: 1,
    name: '月度会员',
    duration: '1个月',
    durationDays: 30,
    price: 29,
    originalPrice: 39,
    targetLevel: 1,
    recommended: false,
    benefits: [
      '专属9.5折优惠',
      '积分加倍获取',
      '每月1张优惠券',
      '生日福利'
    ]
  },
  {
    id: 2,
    name: '季度会员',
    duration: '3个月',
    durationDays: 90,
    price: 79,
    originalPrice: 117,
    targetLevel: 2,
    recommended: true,
    benefits: [
      '专属9折优惠',
      '积分加倍获取',
      '每月2张优惠券',
      '生日福利',
      '优先配送',
      '免费配送2次/月'
    ]
  },
  {
    id: 3,
    name: '年度会员',
    duration: '12个月',
    durationDays: 365,
    price: 299,
    originalPrice: 468,
    targetLevel: 3,
    recommended: false,
    benefits: [
      '专属8.5折优惠',
      '积分3倍获取',
      '每月3张优惠券',
      '生日福利',
      '优先配送',
      '免费配送4次/月',
      '专属客服',
      '新品尝鲜'
    ]
  }
])

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
  
  let message = `确定要开通"${option.name}"吗？\n\n`
  message += `价格：¥${option.price}\n`
  if (option.originalPrice > option.price) {
    message += `原价：¥${option.originalPrice}（已省¥${option.originalPrice - option.price}）\n`
  }
  message += `有效期：${option.duration}\n`
  message += `会员等级：${targetLevel.name}\n`
  message += `专属折扣：${targetLevel.discount * 10}折\n\n`
  if (currentLevel > 0) {
    message += `当前会员等级：${currentVip.value?.vipInfo?.name}\n`
    message += `升级后会员等级：${targetLevel.name}\n`
  }
  message += `开通后将立即享受对应会员权益。`

  ElMessageBox.confirm(
    message,
    '确认开通会员',
    {
      confirmButtonText: '确认支付',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    loading.value = true
    
    setTimeout(() => {
      const result = upgradeVip(option, currentUserId.value)
      
      loading.value = false
      
      if (result.success) {
        vipRefreshTrigger.value++
        
        ElMessage({
          message: `开通成功！您已升级为${result.targetLevel.name}，会员权益立即生效`,
          type: 'success',
          duration: 4000
        })
      } else {
        ElMessage.error(result.message || '开通失败，请重试')
      }
      
    }, 800)
  }).catch(() => {})
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
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.vip-header {
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

.vip-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  transition: all 0.3s ease;
}

.vip-banner.expired {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
}

.vip-banner.active {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.banner-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vip-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.vip-icon {
  width: 72px;
  height: 72px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  backdrop-filter: blur(10px);
}

.vip-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vip-name-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vip-name {
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.vip-status-tag {
  margin-left: 8px;
}

.vip-validity {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
}

.vip-validity .expired-text {
  color: #fecaca;
  font-weight: 600;
}

.vip-discount {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.discount-value {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.vip-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.vip-progress {
  padding: 20px;
}

.progress-card {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.progress-text {
  font-size: 14px;
  color: #64748b;
}

.progress-info {
  margin-top: 12px;
  font-size: 14px;
  color: #64748b;
  text-align: center;
}

.highlight {
  font-weight: 600;
  color: #667eea;
}

.vip-tabs {
  flex: 1;
  padding: 0 20px 20px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

:deep(.el-tabs__nav-wrap) {
  margin-bottom: 20px;
}

.benefits-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.benefit-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.benefit-card:hover {
  background: #f1f5f9;
  border-color: #667eea;
  transform: translateY(-2px);
}

.benefit-card.unlocked {
  background: linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%);
  border-color: #667eea;
}

.benefit-icon {
  width: 48px;
  height: 48px;
  background: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.benefit-card.unlocked .benefit-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.benefit-info {
  flex: 1;
  min-width: 0;
}

.benefit-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.benefit-description {
  font-size: 13px;
  color: #64748b;
}

.levels-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.levels-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.level-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.level-card:hover {
  background: #f1f5f9;
  transform: translateX(4px);
}

.level-card.current {
  background: linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%);
  border-color: #667eea;
}

.level-card.passed {
  background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%);
  border-color: #10b981;
}

.level-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.level-icon {
  width: 56px;
  height: 56px;
  background: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.level-card.current .level-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.level-card.passed .level-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.level-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.level-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.level-discount {
  font-size: 14px;
  color: #667eea;
}

.level-requirement {
  font-size: 13px;
  color: #94a3b8;
}

.upgrade-section {
  padding: 0 20px 40px;
}

.upgrade-card {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.upgrade-header {
  text-align: center;
  margin-bottom: 24px;
}

.upgrade-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.upgrade-header p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.upgrade-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.upgrade-option {
  position: relative;
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.upgrade-option:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.upgrade-option.recommended {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
}

.upgrade-option.disabled {
  opacity: 0.6;
  background: #f1f5f9;
  border-color: #e2e8f0;
  pointer-events: none;
}

.upgrade-option.disabled .price-value,
.upgrade-option.disabled .price-symbol {
  color: #94a3b8;
}

.upgrade-option.disabled .option-benefits .benefit-item {
  color: #94a3b8;
}

.upgrade-option.disabled .option-benefits .benefit-item .el-icon {
  color: #94a3b8;
}

.unavailable-reason {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fef3c7;
  border-radius: 8px;
  font-size: 12px;
  color: #92400e;
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.4;
}

.unavailable-reason .el-icon {
  flex-shrink: 0;
}

.option-badge {
  position: absolute;
  top: -10px;
  right: 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.option-name {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.option-duration {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 16px;
}

.option-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  margin-bottom: 20px;
}

.price-symbol {
  font-size: 16px;
  font-weight: 600;
  color: #ef4444;
}

.price-value {
  font-size: 32px;
  font-weight: 700;
  color: #ef4444;
  line-height: 1;
}

.price-original {
  font-size: 14px;
  color: #94a3b8;
  text-decoration: line-through;
}

.option-benefits {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.benefit-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
}

.benefit-item .el-icon {
  color: #10b981;
}

.upgrade-btn {
  width: 100%;
  border-radius: 24px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .vip-header {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .vip-banner {
    padding: 16px;
  }

  .banner-content {
    flex-direction: column;
    gap: 20px;
  }

  .vip-stats {
    width: 100%;
    justify-content: space-around;
    gap: 0;
  }

  .vip-progress {
    padding: 16px;
  }

  .vip-tabs {
    padding: 0 16px 16px;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
  }

  .upgrade-section {
    padding: 0 16px 32px;
  }

  .upgrade-options {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .level-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .level-right {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>