<template>
  <div class="coupons-container">
    <header class="page-header">
      <div class="page-header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">我的优惠券</h1>
      </div>
      <el-button type="primary" @click="goToCouponCenter">
        <el-icon><Ticket /></el-icon>
        领取优惠券
      </el-button>
    </header>

    <div class="page-container">
      <div v-if="userCoupons.length > 0" class="stats-row card">
        <div class="stat-item">
          <div class="stat-num valid">{{ validUnusedCount }}</div>
          <div class="stat-text">可用</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">{{ usedCount }}</div>
          <div class="stat-text">已使用</div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <div class="stat-num">{{ expiredCount }}</div>
          <div class="stat-text">已过期</div>
        </div>
      </div>

      <div class="tabs-container">
        <el-tabs v-model="activeTab" type="border-card">
          <el-tab-pane label="可使用" name="unused">
            <div class="coupons-grid">
              <div
                v-for="coupon in unusedCouponsWithValidation"
                :key="coupon.id"
                class="coupon-card card card-clickable"
                :class="{ 
                  'is-available': coupon.isAvailable,
                  'is-unavailable': !coupon.isAvailable
                }"
              >
                <div class="coupon-left" :class="{ 'gray': !coupon.isAvailable }">
                  <div class="coupon-value">
                    <span class="value-unit">{{ coupon.valueDisplay.unit }}</span>
                    <span class="value-num">{{ coupon.valueDisplay.value }}</span>
                  </div>
                  <div class="coupon-condition">
                    {{ getCouponTypeLabel(coupon.couponInfo) }}
                  </div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-header">
                    <div class="coupon-title">{{ coupon.couponInfo.name }}</div>
                    <div class="coupon-tags">
                      <span v-if="coupon.couponInfo.isVipOnly" class="tag tag-warning">VIP专享</span>
                      <span v-if="coupon.couponInfo.isNewUserOnly" class="tag tag-error">新用户</span>
                      <span v-if="coupon.couponInfo.canStack" class="tag tag-success">可叠加</span>
                    </div>
                  </div>
                  <div class="coupon-desc">{{ coupon.couponInfo.description }}</div>
                  <div class="coupon-meta">
                    <div class="meta-item">
                      <el-icon><Clock /></el-icon>
                      <span>有效期：{{ formatTime(coupon.couponInfo.startTime) }} - {{ formatTime(coupon.couponInfo.endTime) }}</span>
                    </div>
                    <div v-if="coupon.couponInfo.scope !== 'all'" class="meta-item">
                      <el-icon><Warning /></el-icon>
                      <span>{{ getScopeDisplay(coupon.couponInfo) }}</span>
                    </div>
                  </div>
                  <div class="coupon-action">
                    <template v-if="coupon.isAvailable">
                      <el-button type="primary" size="small" @click="useCoupon(coupon)">
                        立即使用
                      </el-button>
                    </template>
                    <template v-else>
                      <el-tooltip :content="coupon.unavailableReasons?.[0]?.full || '暂不可用'" placement="top">
                        <el-button size="small" disabled>
                          {{ coupon.unavailableReasons?.[0]?.short || '暂不可用' }}
                        </el-button>
                      </el-tooltip>
                    </template>
                  </div>
                </div>
              </div>

              <div v-if="unusedCoupons.length === 0" class="empty-state">
                <div class="empty-icon">
                  <el-icon :size="64"><Ticket /></el-icon>
                </div>
                <div class="empty-title">暂无可用优惠券</div>
                <div class="empty-text">快去领取一些优惠券吧</div>
                <el-button type="primary" @click="goToCouponCenter">
                  去领取
                </el-button>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="已使用" name="used">
            <div class="coupons-grid">
              <div
                v-for="coupon in usedCoupons"
                :key="coupon.id"
                class="coupon-card card"
              >
                <div class="coupon-left gray">
                  <div class="coupon-value">
                    <span class="value-unit">{{ getCouponValueDisplay(coupon.couponInfo).unit }}</span>
                    <span class="value-num">{{ getCouponValueDisplay(coupon.couponInfo).value }}</span>
                  </div>
                  <div class="coupon-condition">
                    {{ getCouponTypeLabel(coupon.couponInfo) }}
                  </div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-header">
                    <div class="coupon-title">{{ coupon.couponInfo.name }}</div>
                  </div>
                  <div class="coupon-desc">{{ coupon.couponInfo.description }}</div>
                  <div class="coupon-meta">
                    <div class="meta-item">
                      <span>使用时间：{{ formatTime(coupon.useTime) }}</span>
                    </div>
                    <div v-if="coupon.orderId" class="meta-item">
                      <span>订单号：{{ coupon.orderId }}</span>
                    </div>
                  </div>
                </div>
                <div class="coupon-overlay">
                  <span class="badge badge-neutral">已使用</span>
                </div>
              </div>

              <div v-if="usedCoupons.length === 0" class="empty-state">
                <div class="empty-icon">
                  <el-icon :size="64"><Ticket /></el-icon>
                </div>
                <div class="empty-title">暂无已使用优惠券</div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="已过期" name="expired">
            <div class="coupons-grid">
              <div
                v-for="coupon in expiredCoupons"
                :key="coupon.id"
                class="coupon-card card"
              >
                <div class="coupon-left gray">
                  <div class="coupon-value">
                    <span class="value-unit">{{ getCouponValueDisplay(coupon.couponInfo).unit }}</span>
                    <span class="value-num">{{ getCouponValueDisplay(coupon.couponInfo).value }}</span>
                  </div>
                  <div class="coupon-condition">
                    {{ getCouponTypeLabel(coupon.couponInfo) }}
                  </div>
                </div>
                <div class="coupon-right">
                  <div class="coupon-header">
                    <div class="coupon-title">{{ coupon.couponInfo.name }}</div>
                  </div>
                  <div class="coupon-desc">{{ coupon.couponInfo.description }}</div>
                  <div class="coupon-meta">
                    <div class="meta-item">
                      <el-icon><Clock /></el-icon>
                      <span>有效期：{{ formatTime(coupon.couponInfo.startTime) }} - {{ formatTime(coupon.couponInfo.endTime) }}</span>
                    </div>
                  </div>
                </div>
                <div class="coupon-overlay">
                  <span class="badge badge-neutral">已过期</span>
                </div>
              </div>

              <div v-if="expiredCoupons.length === 0" class="empty-state">
                <div class="empty-icon">
                  <el-icon :size="64"><Ticket /></el-icon>
                </div>
                <div class="empty-title">暂无已过期优惠券</div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <el-dialog
      v-model="couponCenterVisible"
      width="800px"
      :show-close="true"
      :close-on-click-modal="false"
      class="coupon-center-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <span class="dialog-title">优惠券中心</span>
        </div>
      </template>
      
      <div class="coupon-center-content">
        <div class="center-tabs">
          <div 
            v-for="tab in couponCenterTabs" 
            :key="tab.value"
            class="center-tab"
            :class="{ 'is-active': activeCouponCenterTab === tab.value }"
            @click="activeCouponCenterTab = tab.value"
          >
            {{ tab.label }}
          </div>
        </div>
        
        <div class="center-coupons-grid">
          <div
            v-for="coupon in filteredCenterCoupons"
            :key="coupon.id"
            class="center-coupon-card card card-clickable"
            :class="{ 
              'vip-only': coupon.isVipOnly,
              'is-low-stock': coupon.stock - coupon.usedCount < 10,
              'is-out-of-stock': coupon.stock - coupon.usedCount <= 0
            }"
          >
            <div class="coupon-left" :class="{ 'gray': coupon.stock - coupon.usedCount <= 0 }">
              <div class="coupon-value">
                <span class="value-unit" v-if="coupon.type === 'discount' || coupon.type === 'cash'">¥</span>
                <span class="value-num">{{ coupon.value }}</span>
                <span class="value-unit" v-if="coupon.type === 'percent'">折</span>
                <span class="value-unit" v-if="coupon.type === 'freeShipping'">免运费</span>
              </div>
              <div class="coupon-condition">
                <template v-if="coupon.type === 'discount' || coupon.type === 'cash'">
                  满{{ coupon.minAmount }}可用
                </template>
                <template v-else-if="coupon.type === 'percent'">
                  最低消费{{ coupon.minAmount }}元
                </template>
                <template v-else>
                  满{{ coupon.minAmount }}免运费
                </template>
              </div>
            </div>
            <div class="coupon-right">
              <div class="coupon-header">
                <div class="coupon-title">{{ coupon.name }}</div>
                <div class="coupon-tags">
                  <span v-if="coupon.isVipOnly" class="tag tag-warning">VIP专享</span>
                  <span v-if="coupon.isNewUserOnly" class="tag tag-error">新用户</span>
                  <span v-if="coupon.canStack" class="tag tag-success">可叠加</span>
                </div>
              </div>
              <div class="coupon-desc">{{ coupon.description }}</div>
              <div class="coupon-meta">
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ formatTime(coupon.startTime) }} - {{ formatTime(coupon.endTime) }}</span>
                </div>
                <div class="meta-item stock-item">
                  <el-icon><Box /></el-icon>
                  <span>剩余：<span :class="{ 'is-low': coupon.stock - coupon.usedCount < 10 }">{{ coupon.stock - coupon.usedCount }}</span> 张</span>
                </div>
              </div>
              <div class="coupon-action">
                <template v-if="!isCouponReceived(coupon.id)">
                  <el-button
                    type="primary"
                    size="small"
                    :disabled="!canReceiveCoupon(coupon) || coupon.stock - coupon.usedCount <= 0"
                    @click="receiveCoupon(coupon)"
                  >
                    {{ coupon.stock - coupon.usedCount <= 0 ? '已抢光' : '立即领取' }}
                  </el-button>
                  <el-tooltip v-if="!canReceiveCoupon(coupon)" :content="getReceiveReason(coupon)" placement="top">
                    <el-icon class="hint-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </template>
                <span v-else class="tag tag-success">
                  <el-icon><Check /></el-icon>
                  已领取
                </span>
              </div>
            </div>
          </div>

          <div v-if="filteredCenterCoupons.length === 0" class="empty-state">
            <div class="empty-icon">
              <el-icon :size="56"><Ticket /></el-icon>
            </div>
            <div class="empty-title">暂无可领取的优惠券</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Ticket, Clock, Warning, Box, Check, QuestionFilled } from '@element-plus/icons-vue'
import { 
  mockCoupons, 
  mockUserCoupons, 
  mockUserVips,
  mockCategories as categories
} from '../../../data/mockData'
import {
  loadUserCouponsFromLocalStorage,
  saveUserCouponsToLocalStorage,
  isCouponValid,
  isCouponExpired,
  getUnavailableReason,
  getCouponTypeLabel,
  getCouponValueDisplay,
  getScopeDisplay,
  isVipActive
} from '../../../utils/couponUtils'

const router = useRouter()
const activeTab = ref('unused')
const couponCenterVisible = ref(false)
const activeCouponCenterTab = ref('all')

const couponCenterTabs = [
  { label: '全部', value: 'all' },
  { label: '满减券', value: 'discount' },
  { label: '折扣券', value: 'percent' },
  { label: '免运费', value: 'freeShipping' },
  { label: 'VIP专享', value: 'vip' }
]

const currentUser = computed(() => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
})

const currentUserVip = computed(() => {
  return mockUserVips.find(v => v.userId === 1)
})

const isUserVipActive = computed(() => {
  return isVipActive(currentUserVip.value)
})

const userCoupons = computed(() => {
  return mockUserCoupons
    .filter(c => c.userId === 1)
    .map(coupon => ({
      ...coupon,
      couponInfo: mockCoupons.find(c => c.id === coupon.couponId) || {}
    }))
    .filter(c => c.couponInfo.id)
})

const unusedCoupons = computed(() => {
  return userCoupons.value.filter(c => c.status === 'unused')
})

const unusedCouponsWithValidation = computed(() => {
  return unusedCoupons.value.map(coupon => {
    const reasons = getUnavailableReason(
      coupon,
      0,
      [],
      categories,
      currentUserVip.value,
      [],
      []
    )
    
    const isAvailable = isCouponValid(coupon) && reasons.length === 0
    const valueDisplay = getCouponValueDisplay(coupon.couponInfo)
    
    return {
      ...coupon,
      isAvailable,
      unavailableReasons: reasons,
      valueDisplay
    }
  }).sort((a, b) => {
    if (a.isAvailable !== b.isAvailable) {
      return a.isAvailable ? -1 : 1
    }
    return (a.couponInfo?.priority || 2) - (b.couponInfo?.priority || 2)
  })
})

const validUnusedCount = computed(() => {
  return unusedCouponsWithValidation.value.filter(c => c.isAvailable).length
})

const usedCoupons = computed(() => {
  return userCoupons.value.filter(c => c.status === 'used')
})

const usedCount = computed(() => usedCoupons.value.length)

const expiredCoupons = computed(() => {
  return userCoupons.value.filter(c => c.status === 'expired' || (c.status === 'unused' && isCouponExpired(c)))
})

const expiredCount = computed(() => expiredCoupons.value.length)

const availableCoupons = computed(() => {
  let coupons = [...mockCoupons].filter(c => c.status === 1 && isCouponValid({ couponInfo: c }))
  
  coupons = coupons.map(c => ({
    ...c,
    canReceive: canReceiveCoupon(c),
    receiveReason: getReceiveReason(c)
  }))
  
  return coupons
})

const filteredCenterCoupons = computed(() => {
  if (activeCouponCenterTab.value === 'all') {
    return availableCoupons.value
  }
  if (activeCouponCenterTab.value === 'vip') {
    return availableCoupons.value.filter(c => c.isVipOnly)
  }
  return availableCoupons.value.filter(c => c.type === activeCouponCenterTab.value)
})

const goBack = () => {
  router.back()
}

const goToCouponCenter = () => {
  couponCenterVisible.value = true
}

const formatTime = (time) => {
  if (!time) return ''
  return time.split(' ')[0]
}

const isCouponReceived = (couponId) => {
  return mockUserCoupons.some(c => c.userId === 1 && c.couponId === couponId && c.status === 'unused')
}

const canReceiveCoupon = (coupon) => {
  if (coupon.isVipOnly && !isUserVipActive.value) {
    return false
  }
  
  const receivedCount = mockUserCoupons.filter(c => 
    c.userId === 1 && c.couponId === coupon.id
  ).length
  
  if (coupon.usageLimit && receivedCount >= coupon.usageLimit) {
    return false
  }
  
  return true
}

const getReceiveReason = (coupon) => {
  if (coupon.isVipOnly && !isUserVipActive.value) {
    return '该优惠券为VIP专享，请先升级为VIP会员'
  }
  
  const receivedCount = mockUserCoupons.filter(c => 
    c.userId === 1 && c.couponId === coupon.id
  ).length
  
  if (coupon.usageLimit && receivedCount >= coupon.usageLimit) {
    return `该优惠券每人限领${coupon.usageLimit}张，您已达上限`
  }
  
  return ''
}

const receiveCoupon = (coupon) => {
  if (coupon.isVipOnly && !isUserVipActive.value) {
    ElMessage.warning('该优惠券为VIP专享，请先升级为VIP会员')
    return
  }

  if (isCouponReceived(coupon.id)) {
    ElMessage.warning('您已经领取过该优惠券了')
    return
  }

  const receivedCount = mockUserCoupons.filter(c => 
    c.userId === 1 && c.couponId === coupon.id
  ).length
  
  if (coupon.usageLimit && receivedCount >= coupon.usageLimit) {
    ElMessage.warning(`该优惠券每人限领${coupon.usageLimit}张，您已达上限`)
    return
  }

  if (coupon.stock - coupon.usedCount <= 0) {
    ElMessage.warning('优惠券已被抢光了')
    return
  }

  ElMessageBox.confirm(`确定要领取"${coupon.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    const newUserCoupon = {
      id: Math.max(...mockUserCoupons.map(c => c.id), 0) + 1,
      userId: 1,
      couponId: coupon.id,
      status: 'unused',
      receiveTime: new Date().toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-'),
      useTime: null,
      orderId: null
    }
    mockUserCoupons.push(newUserCoupon)
    
    const originalCoupon = mockCoupons.find(c => c.id === coupon.id)
    if (originalCoupon) {
      originalCoupon.usedCount++
    }
    
    saveUserCouponsToLocalStorage()
    
    ElMessage.success('领取成功！')
  }).catch(() => {})
}

const useCoupon = (coupon) => {
  ElMessage.info('正在跳转到首页使用优惠券...')
  setTimeout(() => {
    router.push({
      path: '/home',
      query: { couponId: coupon.id }
    })
  }, 1000)
}

onMounted(() => {
  loadUserCouponsFromLocalStorage()
  
  for (const uc of mockUserCoupons) {
    if (uc.status === 'unused') {
      const coupon = mockCoupons.find(c => c.id === uc.couponId)
      if (coupon && isCouponExpired({ couponInfo: coupon })) {
        uc.status = 'expired'
      }
    }
  }
  
  saveUserCouponsToLocalStorage()
})
</script>

<style scoped>
.coupons-container {
  min-height: 100vh;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.stats-row .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 0 var(--spacing-2xl);
}

.stats-row .stat-num {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1;
}

.stats-row .stat-num.valid {
  color: var(--primary-600);
}

.stats-row .stat-text {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.stats-row .stat-divider {
  width: 1px;
  height: 36px;
  background: var(--border-primary);
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

.coupons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: var(--spacing-md);
}

.coupon-card {
  display: flex;
  padding: 0;
  overflow: hidden;
  position: relative;
}

.coupon-card.is-unavailable {
  opacity: 0.7;
}

.coupon-left {
  width: 140px;
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  color: white;
  position: relative;
  flex-shrink: 0;
}

.coupon-left::before,
.coupon-left::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--bg-secondary);
  border-radius: 50%;
  right: -6px;
}

.coupon-left::before {
  top: -6px;
}

.coupon-left::after {
  bottom: -6px;
}

.coupon-left.gray {
  background: linear-gradient(135deg, var(--slate-400) 0%, var(--slate-500) 100%);
}

.coupon-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-bottom: var(--spacing-xs);
}

.value-unit {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}

.value-num {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.coupon-condition {
  font-size: var(--font-size-xs);
  opacity: 0.95;
  text-align: center;
}

.coupon-right {
  flex: 1;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.coupon-right::before,
.coupon-right::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  background: var(--bg-secondary);
  border-radius: 50%;
  left: -6px;
}

.coupon-right::before {
  top: -6px;
}

.coupon-right::after {
  bottom: -6px;
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
}

.coupon-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.coupon-tags {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.coupon-desc {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-md);
  line-height: var(--line-height-normal);
}

.coupon-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.meta-item .el-icon {
  font-size: 12px;
}

.stock-item .is-low {
  color: var(--warning-600);
  font-weight: var(--font-weight-semibold);
}

.coupon-action {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.hint-icon {
  font-size: 16px;
  color: var(--text-tertiary);
  cursor: help;
}

.coupon-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl) var(--spacing-xl);
  text-align: center;
}

.empty-state .empty-icon {
  color: var(--slate-300);
  margin-bottom: var(--spacing-lg);
}

.empty-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.empty-text {
  font-size: var(--font-size-base);
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-lg);
}

.coupon-center-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid var(--border-primary);
  padding: var(--spacing-lg) var(--spacing-xl);
  margin: 0;
}

.dialog-header {
  display: flex;
  align-items: center;
}

.dialog-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.coupon-center-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.coupon-center-content {
  max-height: 500px;
  overflow-y: auto;
}

.center-tabs {
  display: flex;
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-primary);
  gap: var(--spacing-md);
}

.center-tab {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.center-tab:hover {
  background: var(--slate-100);
  color: var(--text-primary);
}

.center-tab.is-active {
  background: var(--primary-500);
  color: white;
}

.center-coupons-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
}

.center-coupon-card {
  display: flex;
  padding: 0;
  overflow: hidden;
}

.center-coupon-card.vip-only {
  border-color: var(--warning-300);
}

.center-coupon-card.is-low-stock {
  border-color: var(--warning-300);
}

.center-coupon-card.is-out-of-stock {
  border-color: var(--border-secondary);
  opacity: 0.6;
}

@media (max-width: 768px) {
  .stats-row {
    padding: var(--spacing-lg);
  }

  .stats-row .stat-item {
    padding: 0 var(--spacing-lg);
  }

  .stats-row .stat-num {
    font-size: var(--font-size-2xl);
  }

  .coupons-grid {
    grid-template-columns: 1fr;
  }

  .coupon-card {
    flex-direction: column;
  }

  .coupon-left {
    width: 100%;
    padding: var(--spacing-lg);
  }

  .coupon-left::before,
  .coupon-left::after {
    display: none;
  }

  .coupon-right::before,
  .coupon-right::after {
    display: none;
  }

  .coupon-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .coupon-tags {
    width: 100%;
    justify-content: flex-start;
  }

  .coupon-action {
    width: 100%;
  }

  .coupon-action .el-button {
    flex: 1;
  }

  .center-tabs {
    overflow-x: auto;
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .center-tab {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .center-coupons-grid {
    padding: var(--spacing-lg);
  }
}
</style>
