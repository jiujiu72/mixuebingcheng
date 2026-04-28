<template>
  <div class="member-day-container">
    <header class="page-header">
      <div class="page-header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">会员日活动</h1>
      </div>
    </header>

    <main class="main-content">
      <div class="member-day-banner" :class="{ 'is-active': isTodayMemberDay }">
        <div class="banner-content">
          <div class="banner-icon">
            <el-icon><CrownFilled /></el-icon>
          </div>
          <div class="banner-text">
            <div class="banner-title">
              <span v-if="isTodayMemberDay">今天是会员日！</span>
              <span v-else>距离下次会员日</span>
            </div>
            <div class="banner-countdown" v-if="!isTodayMemberDay && nextMemberDay">
              <span class="countdown-days">{{ nextMemberDay.daysUntil }}</span>
              <span class="countdown-unit">天</span>
            </div>
            <div class="banner-subtitle" v-if="isTodayMemberDay">
              全场 {{ memberDayRulesInfo.discountDisplay }}，双倍积分，专属低价！
            </div>
            <div class="banner-subtitle" v-else-if="nextMemberDay">
              {{ getMemberDayTypeLabel(nextMemberDay.type) }} - {{ formatMemberDayDate(nextMemberDay.date) }}
            </div>
          </div>
        </div>
      </div>

      <div class="rules-section">
        <div class="section-header">
          <h2 class="section-title">会员日规则</h2>
        </div>
        <div class="rules-grid">
          <div class="rule-card">
            <div class="rule-icon">
              <el-icon><Discount /></el-icon>
            </div>
            <div class="rule-info">
              <h3 class="rule-title">全场折扣</h3>
              <p class="rule-desc">会员日期间，全场商品享受 {{ memberDayRulesInfo.discountDisplay }} 优惠</p>
            </div>
          </div>
          <div class="rule-card">
            <div class="rule-icon special">
              <el-icon><Star /></el-icon>
            </div>
            <div class="rule-info">
              <h3 class="rule-title">专属低价</h3>
              <p class="rule-desc">会员专享商品，低于市场价</p>
            </div>
          </div>
          <div class="rule-card">
            <div class="rule-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
              <el-icon><Wallet /></el-icon>
            </div>
            <div class="rule-info">
              <h3 class="rule-title">双倍积分</h3>
              <p class="rule-desc">消费积分 {{ memberDayRulesInfo.pointsMultiplier }} 倍获取</p>
            </div>
          </div>
        </div>
        <div class="schedule-info">
          <el-icon><Calendar /></el-icon>
          <span>会员日时间：{{ memberDayRulesInfo.weeklyDayName }}（每周）、{{ memberDayRulesInfo.monthlyDaysStr }}日（每月）</span>
        </div>
      </div>

      <div class="specials-section">
        <div class="section-header">
          <h2 class="section-title">会员专享商品</h2>
          <span class="section-subtitle">仅限有效会员购买</span>
        </div>

        <div v-if="memberDaySpecials.length === 0" class="empty-state">
          <el-icon :size="64" color="#cbd5e1"><Box /></el-icon>
          <p>暂无会员专享商品</p>
        </div>

        <div v-else class="specials-grid">
          <div
            v-for="item in memberDaySpecials"
            :key="item.id"
            class="special-card"
            :class="{ 'is-locked': !canAccessBenefits }"
          >
            <div class="special-image-wrapper">
              <img :src="item.image" :alt="item.foodName" class="special-image" />
              <div v-if="!canAccessBenefits" class="locked-overlay">
                <el-icon :size="48" color="white"><Lock /></el-icon>
                <span class="locked-text">会员专享</span>
              </div>
              <div v-if="item.minVipLevel > 1" class="vip-level-badge">
                <el-tag size="small" type="warning">
                  {{ getVipLevelName(item.minVipLevel) }} 及以上
                </el-tag>
              </div>
            </div>

            <div class="special-info">
              <h3 class="special-name">{{ item.foodName }}</h3>
              <p class="special-desc">{{ item.description }}</p>

              <div class="price-section">
                <div class="member-price">
                  <span class="price-symbol">¥</span>
                  <span class="price-value">{{ item.memberPrice }}</span>
                </div>
                <div class="original-price">¥{{ item.originalPrice }}</div>
                <div class="save-tag">
                  省 ¥{{ (item.originalPrice - item.memberPrice).toFixed(1) }}
                </div>
              </div>

              <div class="stock-section">
                <span class="stock-info">已售 {{ item.sold }}</span>
                <span class="stock-info">库存 {{ item.stock }}</span>
              </div>

              <div class="action-section">
                <el-button
                  :type="canAccessBenefits && canPurchaseItem(item) ? 'warning' : 'default'"
                  class="action-btn"
                  :disabled="!canAccessBenefits || !canPurchaseItem(item)"
                  @click="handlePurchase(item)"
                >
                  <span v-if="!canAccessBenefits">开通会员解锁</span>
                  <span v-else-if="item.stock <= 0">已售罄</span>
                  <span v-else>立即购买</span>
                </el-button>
                <el-button
                  v-if="!canAccessBenefits"
                  type="primary"
                  text
                  class="vip-link"
                  @click="goToVip"
                >
                  查看会员权益
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <el-dialog
        v-model="showVipModal"
        width="480px"
        :show-close="true"
        title="开通会员解锁更多权益"
        center
      >
        <div class="vip-modal-content">
          <div class="vip-modal-icon">
            <el-icon :size="64" color="#f59e0b"><Medal /></el-icon>
          </div>
          <h3 class="vip-modal-title">成为会员，专享优惠</h3>
          <p class="vip-modal-desc">开通会员后，您将享受以下权益：</p>
          <div class="vip-benefits-list">
            <div class="vip-benefit-item">
              <el-icon color="#10b981"><Check /></el-icon>
              <span>会员日全场 {{ memberDayRulesInfo.discountDisplay }} 优惠</span>
            </div>
            <div class="vip-benefit-item">
              <el-icon color="#10b981"><Check /></el-icon>
              <span>会员专享低价商品</span>
            </div>
            <div class="vip-benefit-item">
              <el-icon color="#10b981"><Check /></el-icon>
              <span>消费积分 {{ memberDayRulesInfo.pointsMultiplier }} 倍</span>
            </div>
            <div class="vip-benefit-item">
              <el-icon color="#10b981"><Check /></el-icon>
              <span>更多专属权益</span>
            </div>
          </div>
        </div>
        <template #footer>
          <el-button @click="showVipModal = false">稍后再说</el-button>
          <el-button type="warning" @click="goToVip">立即开通会员</el-button>
        </template>
      </el-dialog>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  CrownFilled,
  Discount,
  Star,
  Wallet,
  Calendar,
  Box,
  Lock,
  Medal,
  Check
} from '@element-plus/icons-vue'
import {
  isTodayMemberDay as checkIsTodayMemberDay,
  getNextMemberDay,
  getMemberDayTypeLabel,
  getMemberDaySpecials,
  canAccessMemberDayBenefits,
  formatMemberDayDate,
  getMemberDayRulesInfo
} from '../../utils/memberDayUtils'
import { mockVipLevels } from '../../data/mockData'

const router = useRouter()

const showVipModal = ref(false)

const isTodayMemberDay = computed(() => {
  return checkIsTodayMemberDay()
})

const nextMemberDay = computed(() => {
  return getNextMemberDay()
})

const memberDayRulesInfo = computed(() => {
  return getMemberDayRulesInfo()
})

const memberDaySpecials = computed(() => {
  return getMemberDaySpecials(0)
})

const accessResult = computed(() => {
  return canAccessMemberDayBenefits(1)
})

const canAccessBenefits = computed(() => {
  return accessResult.value.canAccess
})

const getVipLevelName = (levelNum) => {
  const level = mockVipLevels.find(l => l.level === levelNum)
  return level?.name || `VIP${levelNum}`
}

const canPurchaseItem = (item) => {
  if (!accessResult.value.canAccess) return false
  if (item.stock <= 0) return false
  
  const userVipLevel = accessResult.value.vipLevel || 0
  if (item.minVipLevel > userVipLevel) return false
  
  return true
}

const handlePurchase = (item) => {
  if (!accessResult.value.canAccess) {
    showVipModal.value = true
    return
  }
  
  const userVipLevel = accessResult.value.vipLevel || 0
  if (item.minVipLevel > userVipLevel) {
    ElMessage.warning(`该商品需要 ${getVipLevelName(item.minVipLevel)} 及以上等级才能购买`)
    return
  }
  
  if (item.stock <= 0) {
    ElMessage.warning('商品已售罄')
    return
  }
  
  ElMessage.success(`已添加到购物车：${item.foodName}`)
}

const goToVip = () => {
  showVipModal.value = false
  router.push('/user/vip')
}

const goBack = () => {
  router.back()
}

onMounted(() => {})
</script>

<style scoped>
.member-day-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #fffbeb 0%, #fefce8 50%, #fef9c3 100%);
  display: flex;
  flex-direction: column;
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
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

.member-day-banner {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
}

.member-day-banner.is-active {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
  }
  50% {
    box-shadow: 0 8px 32px rgba(245, 158, 11, 0.5);
  }
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.banner-icon {
  width: 72px;
  height: 72px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.banner-icon .el-icon {
  font-size: 40px;
  color: white;
}

.banner-text {
  flex: 1;
  color: white;
}

.banner-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 8px;
}

.banner-countdown {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.countdown-days {
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
}

.countdown-unit {
  font-size: 18px;
  font-weight: 600;
}

.banner-subtitle {
  font-size: 15px;
  opacity: 0.9;
  font-weight: 500;
}

.rules-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.section-subtitle {
  font-size: 13px;
  color: #64748b;
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.rule-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fefce8;
  border-radius: 16px;
}

.rule-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rule-icon.special {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.rule-icon .el-icon {
  font-size: 24px;
  color: white;
}

.rule-info {
  flex: 1;
  min-width: 0;
}

.rule-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.rule-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.schedule-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fefce8;
  border-radius: 12px;
  font-size: 14px;
  color: #854d0e;
}

.schedule-info .el-icon {
  font-size: 18px;
}

.specials-section {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
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

.specials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.special-card {
  background: linear-gradient(135deg, #fffbeb 0%, #fefce8 100%);
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid #fde68a;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.special-card:hover:not(.is-locked) {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.2);
  border-color: #f59e0b;
}

.special-card.is-locked {
  opacity: 0.8;
}

.special-image-wrapper {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f1f5f9;
}

.special-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.locked-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.locked-text {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.vip-level-badge {
  position: absolute;
  top: 12px;
  right: 12px;
}

.special-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.special-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.special-desc {
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

.member-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-symbol {
  font-size: 14px;
  font-weight: 600;
  color: #f59e0b;
}

.price-value {
  font-size: 28px;
  font-weight: 700;
  color: #f59e0b;
  line-height: 1;
}

.original-price {
  font-size: 14px;
  color: #94a3b8;
  text-decoration: line-through;
}

.save-tag {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.stock-section {
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
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
  color: white;
}

.vip-link {
  text-align: center;
  font-size: 13px;
}

.vip-modal-content {
  text-align: center;
  padding: 20px 0;
}

.vip-modal-icon {
  margin-bottom: 20px;
}

.vip-modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 12px 0;
}

.vip-modal-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px 0;
}

.vip-benefits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  max-width: 320px;
  margin: 0 auto;
}

.vip-benefit-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #334155;
}

.vip-benefit-item .el-icon {
  font-size: 18px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }

  .banner-content {
    flex-direction: column;
    text-align: center;
  }

  .banner-title {
    font-size: 20px;
  }

  .countdown-days {
    font-size: 40px;
  }

  .rules-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .rule-card {
    padding: 14px;
  }

  .specials-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .special-image-wrapper {
    height: 140px;
  }

  .special-info {
    padding: 12px;
    gap: 8px;
  }

  .special-name {
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
  .specials-grid {
    grid-template-columns: 1fr;
  }

  .special-card {
    flex-direction: row;
  }

  .special-image-wrapper {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
  }

  .special-info {
    flex: 1;
  }
}
</style>
