<template>
  <div class="user-coupons-container">
    <header class="coupons-header">
      <div class="header-left">
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

    <div class="coupons-stats" v-if="userCoupons.length > 0">
      <div class="stat-item">
        <span class="stat-value">{{ validUnusedCount }}</span>
        <span class="stat-label">可用</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ usedCount }}</span>
        <span class="stat-label">已使用</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ expiredCount }}</span>
        <span class="stat-label">已过期</span>
      </div>
    </div>

    <div class="coupons-tabs">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="可使用" name="unused">
          <div class="coupons-list">
            <div
              v-for="coupon in unusedCouponsWithValidation"
              :key="coupon.id"
              class="coupon-card"
              :class="{ 
                'available': coupon.isAvailable, 
                'unavailable': !coupon.isAvailable,
                'disabled': !coupon.isAvailable
              }"
            >
              <div class="coupon-left" :class="{ 'gray': !coupon.isAvailable }">
                <div class="coupon-value">
                  <span class="unit">{{ coupon.valueDisplay.unit }}</span>
                  <span class="value">{{ coupon.valueDisplay.value }}</span>
                </div>
                <div class="coupon-type">
                  {{ getCouponTypeLabel(coupon.couponInfo) }}
                </div>
              </div>
              <div class="coupon-right">
                <div class="coupon-top">
                  <div class="coupon-header">
                    <div class="coupon-name">{{ coupon.couponInfo.name }}</div>
                    <div class="coupon-tags">
                      <el-tag v-if="coupon.couponInfo.isVipOnly" type="warning" size="small">VIP专享</el-tag>
                      <el-tag v-if="coupon.couponInfo.isNewUserOnly" type="danger" size="small">新用户</el-tag>
                      <el-tag v-if="coupon.couponInfo.canStack" type="success" size="small">可叠加</el-tag>
                    </div>
                  </div>
                  <div class="coupon-description">{{ coupon.couponInfo.description }}</div>
                </div>
                
                <div class="coupon-bottom">
                  <div class="coupon-meta">
                    <div class="coupon-time">
                      <el-icon><Clock /></el-icon>
                      有效期：{{ formatTime(coupon.couponInfo.startTime) }} - {{ formatTime(coupon.couponInfo.endTime) }}
                    </div>
                    <div class="coupon-scope" v-if="coupon.couponInfo.scope !== 'all'">
                      <el-icon><Warning /></el-icon>
                      {{ getScopeDisplay(coupon.couponInfo) }}
                    </div>
                  </div>
                  
                  <div class="coupon-actions">
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
            </div>

            <div v-if="unusedCoupons.length === 0" class="empty-state">
              <div class="empty-icon">
                <el-icon :size="80"><Ticket /></el-icon>
              </div>
              <p class="empty-text">暂无可用优惠券</p>
              <el-button type="primary" @click="goToCouponCenter">
                去领取
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="已使用" name="used">
          <div class="coupons-list">
            <div
              v-for="coupon in usedCoupons"
              :key="coupon.id"
              class="coupon-card used"
            >
              <div class="coupon-left gray">
                <div class="coupon-value">
                  <span class="unit">{{ getCouponValueDisplay(coupon.couponInfo).unit }}</span>
                  <span class="value">{{ getCouponValueDisplay(coupon.couponInfo).value }}</span>
                </div>
                <div class="coupon-type">
                  {{ getCouponTypeLabel(coupon.couponInfo) }}
                </div>
              </div>
              <div class="coupon-right">
                <div class="coupon-name">{{ coupon.couponInfo.name }}</div>
                <div class="coupon-description">{{ coupon.couponInfo.description }}</div>
                <div class="coupon-meta">
                  <div class="coupon-time">
                    使用时间：{{ formatTime(coupon.useTime) }}
                  </div>
                  <div class="coupon-order" v-if="coupon.orderId">
                    订单号：{{ coupon.orderId }}
                  </div>
                </div>
              </div>
              <div class="coupon-overlay">
                <span>已使用</span>
              </div>
            </div>

            <div v-if="usedCoupons.length === 0" class="empty-state">
              <div class="empty-icon">
                <el-icon :size="80"><Ticket /></el-icon>
              </div>
              <p class="empty-text">暂无已使用优惠券</p>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="已过期" name="expired">
          <div class="coupons-list">
            <div
              v-for="coupon in expiredCoupons"
              :key="coupon.id"
              class="coupon-card expired"
            >
              <div class="coupon-left gray">
                <div class="coupon-value">
                  <span class="unit">{{ getCouponValueDisplay(coupon.couponInfo).unit }}</span>
                  <span class="value">{{ getCouponValueDisplay(coupon.couponInfo).value }}</span>
                </div>
                <div class="coupon-type">
                  {{ getCouponTypeLabel(coupon.couponInfo) }}
                </div>
              </div>
              <div class="coupon-right">
                <div class="coupon-name">{{ coupon.couponInfo.name }}</div>
                <div class="coupon-description">{{ coupon.couponInfo.description }}</div>
                <div class="coupon-time">
                  有效期：{{ formatTime(coupon.couponInfo.startTime) }} - {{ formatTime(coupon.couponInfo.endTime) }}
                </div>
              </div>
              <div class="coupon-overlay">
                <span>已过期</span>
              </div>
            </div>

            <div v-if="expiredCoupons.length === 0" class="empty-state">
              <div class="empty-icon">
                <el-icon :size="80"><Ticket /></el-icon>
              </div>
              <p class="empty-text">暂无已过期优惠券</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      v-model="couponCenterVisible"
      title="优惠券中心"
      width="850px"
      :close-on-click-modal="false"
      custom-class="coupon-center-dialog"
    >
      <div class="coupon-center-content">
        <div class="coupon-center-tabs">
          <div 
            v-for="tab in couponCenterTabs" 
            :key="tab.value"
            class="coupon-center-tab"
            :class="{ active: activeCouponCenterTab === tab.value }"
            @click="activeCouponCenterTab = tab.value"
          >
            {{ tab.label }}
          </div>
        </div>
        
        <div class="coupon-center-list">
          <div
            v-for="coupon in filteredCenterCoupons"
            :key="coupon.id"
            class="coupon-center-card"
            :class="{ 
              'vip-only': coupon.isVipOnly, 
              'low-stock': coupon.stock - coupon.usedCount < 10,
              'out-of-stock': coupon.stock - coupon.usedCount <= 0
            }"
          >
            <div class="coupon-center-left" :class="{ 'gray': coupon.stock - coupon.usedCount <= 0 }">
              <div class="coupon-center-value">
                <span class="unit" v-if="coupon.type === 'discount' || coupon.type === 'cash'">¥</span>
                <span class="value">{{ coupon.value }}</span>
                <span class="unit" v-if="coupon.type === 'percent'">折</span>
                <span class="unit" v-if="coupon.type === 'freeShipping'">运费</span>
              </div>
              <div class="coupon-center-type">
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
            <div class="coupon-center-right">
              <div class="coupon-center-header">
                <div class="coupon-center-name">{{ coupon.name }}</div>
                <div class="coupon-center-tags">
                  <el-tag v-if="coupon.isVipOnly" type="warning" size="small">VIP专享</el-tag>
                  <el-tag v-if="coupon.isNewUserOnly" type="danger" size="small">新用户</el-tag>
                  <el-tag v-if="coupon.canStack" type="success" size="small">可叠加</el-tag>
                </div>
              </div>
              <div class="coupon-center-description">{{ coupon.description }}</div>
              <div class="coupon-center-meta">
                <div class="coupon-center-time">
                  <el-icon><Clock /></el-icon>
                  {{ formatTime(coupon.startTime) }} - {{ formatTime(coupon.endTime) }}
                </div>
                <div class="coupon-center-stock">
                  <el-icon><Box /></el-icon>
                  剩余：<span :class="{ 'low': coupon.stock - coupon.usedCount < 10 }">{{ coupon.stock - coupon.usedCount }}</span> 张
                </div>
              </div>
              <div class="coupon-center-actions">
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
                <el-tag v-else type="success" size="small">
                  <el-icon><Check /></el-icon>
                  已领取
                </el-tag>
              </div>
            </div>
          </div>

          <div v-if="filteredCenterCoupons.length === 0" class="empty-state">
            <div class="empty-icon">
              <el-icon :size="64"><Ticket /></el-icon>
            </div>
            <p class="empty-text">暂无可领取的优惠券</p>
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
.user-coupons-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.coupons-header {
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

.coupons-stats {
  background: white;
  padding: 16px 24px;
  display: flex;
  justify-content: center;
  gap: 48px;
  border-bottom: 1px solid #e2e8f0;
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
  color: #667eea;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

.coupons-tabs {
  flex: 1;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

:deep(.el-tabs__nav-wrap) {
  margin-bottom: 20px;
}

:deep(.el-tabs__item.is-active) {
  color: #667eea;
}

:deep(.el-tabs__active-bar) {
  background-color: #667eea;
}

.coupons-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.coupon-card {
  display: flex;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  position: relative;
  transition: all 0.3s ease;
}

.coupon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.coupon-card.available {
  border-left: 4px solid #667eea;
}

.coupon-card.unavailable {
  border-left: 4px solid #cbd5e1;
}

.coupon-card.used,
.coupon-card.expired {
  opacity: 0.8;
}

.coupon-left {
  width: 160px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: white;
  position: relative;
}

.coupon-left.gray {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}

.coupon-left::before,
.coupon-left::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: #f5f7fa;
  border-radius: 50%;
  left: -8px;
}

.coupon-left::before {
  top: -8px;
}

.coupon-left::after {
  bottom: -8px;
}

.coupon-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-bottom: 8px;
}

.coupon-value .unit {
  font-size: 16px;
  font-weight: 600;
}

.coupon-value .value {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
}

.coupon-type {
  font-size: 13px;
  opacity: 0.95;
  text-align: center;
}

.coupon-right {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
}

.coupon-right::before,
.coupon-right::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  background: #f5f7fa;
  border-radius: 50%;
  right: -8px;
}

.coupon-right::before {
  top: -8px;
}

.coupon-right::after {
  bottom: -8px;
}

.coupon-top {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.coupon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.coupon-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}

.coupon-tags {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.coupon-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

.coupon-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 12px;
}

.coupon-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.coupon-time,
.coupon-scope {
  font-size: 13px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.coupon-order {
  font-size: 13px;
  color: #94a3b8;
}

.coupon-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hint-icon {
  font-size: 18px;
  color: #94a3b8;
  cursor: help;
}

.coupon-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
}

.coupon-overlay span {
  font-size: 24px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 24px;
  border-radius: 8px;
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

.coupon-center-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 20px;
  margin: 0;
}

.coupon-center-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.coupon-center-content {
  max-height: 550px;
  overflow-y: auto;
}

.coupon-center-tabs {
  display: flex;
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  gap: 8px;
}

.coupon-center-tab {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.coupon-center-tab:hover {
  background: #e2e8f0;
  color: #475569;
}

.coupon-center-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.coupon-center-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
}

.coupon-center-card {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.coupon-center-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.coupon-center-card.vip-only {
  border-color: #f59e0b;
}

.coupon-center-card.low-stock {
  border-color: #f97316;
}

.coupon-center-card.out-of-stock {
  border-color: #cbd5e1;
  opacity: 0.7;
}

.coupon-center-left {
  width: 140px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: white;
  position: relative;
}

.coupon-center-left.gray {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}

.coupon-center-card.vip-only .coupon-center-left {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.coupon-center-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
  margin-bottom: 6px;
}

.coupon-center-value .unit {
  font-size: 14px;
  font-weight: 600;
}

.coupon-center-value .value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.coupon-center-type {
  font-size: 12px;
  opacity: 0.95;
  text-align: center;
}

.coupon-center-right {
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.coupon-center-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.coupon-center-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  flex: 1;
}

.coupon-center-tags {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.coupon-center-description {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 10px;
}

.coupon-center-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
}

.coupon-center-time,
.coupon-center-stock {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.coupon-center-stock span.low {
  color: #f97316;
  font-weight: 600;
}

.coupon-center-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .coupons-header {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .coupons-stats {
    padding: 12px 16px;
    gap: 24px;
  }

  .stat-value {
    font-size: 22px;
  }

  .coupons-tabs {
    padding: 16px;
  }

  .coupon-card {
    flex-direction: column;
  }

  .coupon-left {
    width: 100%;
    padding: 16px;
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
    gap: 8px;
  }

  .coupon-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .coupon-actions {
    width: 100%;
  }

  .coupon-actions .el-button {
    flex: 1;
  }

  .coupon-center-card {
    flex-direction: column;
  }

  .coupon-center-left {
    width: 100%;
    padding: 12px;
  }

  .coupon-center-tabs {
    overflow-x: auto;
    padding: 12px 16px;
  }

  .coupon-center-tab {
    white-space: nowrap;
    flex-shrink: 0;
  }
}
</style>
