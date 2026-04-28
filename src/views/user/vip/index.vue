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

    <div class="vip-banner">
      <div class="banner-content">
        <div class="vip-info">
          <div class="vip-icon">{{ currentVip?.vipInfo?.icon || '👤' }}</div>
          <div class="vip-details">
            <div class="vip-name">{{ currentVip?.vipInfo?.name || '普通会员' }}</div>
            <div class="vip-discount">
              专属折扣：<span class="discount-value">{{ (currentVip?.discount || 1) * 10 }}折</span>
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
            v-for="option in upgradeOptions" 
            :key="option.id"
            class="upgrade-option"
            :class="{ 'recommended': option.recommended }"
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
              type="primary" 
              class="upgrade-btn"
              @click="handleUpgrade(option)"
            >
              立即开通
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Check } from '@element-plus/icons-vue'
import { 
  mockVipLevels, 
  mockUserVips, 
  mockVipBenefits 
} from '../../../data/mockData'

const router = useRouter()
const activeTab = ref('benefits')

const currentUser = computed(() => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
})

const vipLevels = computed(() => {
  return [...mockVipLevels].sort((a, b) => a.level - b.level)
})

const currentVip = computed(() => {
  const userVip = mockUserVips.find(v => v.userId === 1)
  if (userVip) {
    const vipInfo = mockVipLevels.find(l => l.id === userVip.vipLevelId)
    return {
      ...userVip,
      vipInfo
    }
  }
  return null
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
    price: 29,
    originalPrice: 39,
    recommended: false,
    benefits: [
      '专属9折优惠',
      '积分加倍获取',
      '每月1张优惠券',
      '生日福利'
    ]
  },
  {
    id: 2,
    name: '季度会员',
    duration: '3个月',
    price: 79,
    originalPrice: 117,
    recommended: true,
    benefits: [
      '专属8.5折优惠',
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
    price: 299,
    originalPrice: 468,
    recommended: false,
    benefits: [
      '专属8折优惠',
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

const goBack = () => {
  router.back()
}

const isBenefitUnlocked = (benefit) => {
  if (!currentVip.value) return false
  return currentVip.value.vipInfo?.level >= benefit.minLevel
}

const getRequiredLevel = (minLevel) => {
  const level = vipLevels.value.find(l => l.level === minLevel)
  return level ? level.name : ''
}

const handleUpgrade = (option) => {
  ElMessageBox.confirm(
    `确定要开通"${option.name}"吗？\n\n价格：¥${option.price}\n原价：¥${option.originalPrice || option.price}\n\n开通后将立即享受对应会员权益。`,
    '确认开通',
    {
      confirmButtonText: '确认支付',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage.success('开通成功！您的会员等级已提升')
    
    if (currentVip.value) {
      const currentLevel = currentVip.value.vipInfo?.level || 0
      const nextLevel = vipLevels.value.find(l => l.level > currentLevel)
      if (nextLevel) {
        currentVip.value.vipLevelId = nextLevel.id
        currentVip.value.vipName = nextLevel.name
        currentVip.value.level = nextLevel.level
        currentVip.value.discount = nextLevel.discount
      }
    }
  }).catch(() => {})
}
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

.vip-name {
  font-size: 24px;
  font-weight: 700;
  color: white;
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