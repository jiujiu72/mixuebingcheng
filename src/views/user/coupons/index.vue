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

    <div class="coupons-tabs">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="可使用" name="unused">
          <div class="coupons-list">
            <div
              v-for="coupon in unusedCoupons"
              :key="coupon.id"
              class="coupon-card unused"
            >
              <div class="coupon-left">
                <div class="coupon-value">
                  <span class="currency">¥</span>
                  <span class="value">{{ coupon.couponInfo.value }}</span>
                </div>
                <div class="coupon-type" v-if="coupon.couponInfo.type === 'discount'">
                  满{{ coupon.couponInfo.minAmount }}减{{ coupon.couponInfo.value }}
                </div>
                <div class="coupon-type" v-else-if="coupon.couponInfo.type === 'percent'">
                  {{ coupon.couponInfo.value }}折优惠
                </div>
                <div class="coupon-type" v-else>
                  免配送费
                </div>
              </div>
              <div class="coupon-right">
                <div class="coupon-name">{{ coupon.couponInfo.name }}</div>
                <div class="coupon-description">{{ coupon.couponInfo.description }}</div>
                <div class="coupon-time">
                  有效期：{{ formatTime(coupon.couponInfo.startTime) }} - {{ formatTime(coupon.couponInfo.endTime) }}
                </div>
                <div class="coupon-actions">
                  <el-button type="primary" size="small" @click="useCoupon(coupon)">
                    立即使用
                  </el-button>
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
              <div class="coupon-left">
                <div class="coupon-value">
                  <span class="currency">¥</span>
                  <span class="value">{{ coupon.couponInfo.value }}</span>
                </div>
                <div class="coupon-type" v-if="coupon.couponInfo.type === 'discount'">
                  满{{ coupon.couponInfo.minAmount }}减{{ coupon.couponInfo.value }}
                </div>
                <div class="coupon-type" v-else-if="coupon.couponInfo.type === 'percent'">
                  {{ coupon.couponInfo.value }}折优惠
                </div>
                <div class="coupon-type" v-else>
                  免配送费
                </div>
              </div>
              <div class="coupon-right">
                <div class="coupon-name">{{ coupon.couponInfo.name }}</div>
                <div class="coupon-description">{{ coupon.couponInfo.description }}</div>
                <div class="coupon-time">
                  使用时间：{{ formatTime(coupon.useTime) }}
                </div>
                <div class="coupon-order">
                  订单号：{{ coupon.orderId }}
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
              <div class="coupon-left">
                <div class="coupon-value">
                  <span class="currency">¥</span>
                  <span class="value">{{ coupon.couponInfo.value }}</span>
                </div>
                <div class="coupon-type" v-if="coupon.couponInfo.type === 'discount'">
                  满{{ coupon.couponInfo.minAmount }}减{{ coupon.couponInfo.value }}
                </div>
                <div class="coupon-type" v-else-if="coupon.couponInfo.type === 'percent'">
                  {{ coupon.couponInfo.value }}折优惠
                </div>
                <div class="coupon-type" v-else>
                  免配送费
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
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="coupon-center-content">
        <div class="coupon-center-list">
          <div
            v-for="coupon in availableCoupons"
            :key="coupon.id"
            class="coupon-center-card"
            :class="{ 'vip-only': coupon.isVipOnly }"
          >
            <div class="coupon-center-left">
              <div class="coupon-center-value">
                <span class="currency" v-if="coupon.type === 'discount'">¥</span>
                <span class="value">{{ coupon.value }}</span>
                <span class="type" v-if="coupon.type === 'percent'">折</span>
              </div>
              <div class="coupon-center-type" v-if="coupon.type === 'discount'">
                满{{ coupon.minAmount }}可用
              </div>
              <div class="coupon-center-type" v-else-if="coupon.type === 'percent'">
                最低消费{{ coupon.minAmount }}元
              </div>
              <div class="coupon-center-type" v-else>
                满{{ coupon.minAmount }}免配送费
              </div>
            </div>
            <div class="coupon-center-right">
              <div class="coupon-center-name">{{ coupon.name }}</div>
              <div class="coupon-center-description">{{ coupon.description }}</div>
              <div class="coupon-center-stock">
                剩余：{{ coupon.stock - coupon.usedCount }} 张
              </div>
              <div class="coupon-center-actions">
                <el-button
                  v-if="!isCouponReceived(coupon.id)"
                  type="primary"
                  size="small"
                  :disabled="coupon.stock - coupon.usedCount <= 0"
                  @click="receiveCoupon(coupon)"
                >
                  {{ coupon.stock - coupon.usedCount <= 0 ? '已抢光' : '立即领取' }}
                </el-button>
                <el-tag v-else type="success" size="small">
                  已领取
                </el-tag>
              </div>
              <el-tag v-if="coupon.isVipOnly" type="warning" size="small" class="vip-tag">
                VIP专享
              </el-tag>
            </div>
          </div>

          <div v-if="availableCoupons.length === 0" class="empty-state">
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
import { ArrowLeft, Ticket } from '@element-plus/icons-vue'
import { 
  mockCoupons, 
  mockUserCoupons, 
  mockUserVips 
} from '../../../data/mockData'

const router = useRouter()
const activeTab = ref('unused')
const couponCenterVisible = ref(false)

const currentUser = computed(() => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
})

const currentUserVip = computed(() => {
  return mockUserVips.find(v => v.userId === 1)
})

const userCoupons = computed(() => {
  return mockUserCoupons.filter(c => c.userId === 1).map(coupon => ({
    ...coupon,
    couponInfo: mockCoupons.find(c => c.id === coupon.couponId) || {}
  }))
})

const unusedCoupons = computed(() => {
  return userCoupons.value.filter(c => c.status === 'unused')
})

const usedCoupons = computed(() => {
  return userCoupons.value.filter(c => c.status === 'used')
})

const expiredCoupons = computed(() => {
  return userCoupons.value.filter(c => c.status === 'expired')
})

const availableCoupons = computed(() => {
  let coupons = mockCoupons.filter(c => c.status === 1)
  
  if (currentUserVip.value && currentUserVip.value.level >= 1) {
    coupons = coupons.filter(c => !c.isVipOnly || (c.isVipOnly && currentUserVip.value.level >= 1))
  } else {
    coupons = coupons.filter(c => !c.isVipOnly)
  }
  
  return coupons
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

const receiveCoupon = (coupon) => {
  if (coupon.isVipOnly && (!currentUserVip.value || currentUserVip.value.level < 1)) {
    ElMessage.warning('该优惠券为VIP专享，请先升级为VIP会员')
    return
  }

  if (isCouponReceived(coupon.id)) {
    ElMessage.warning('您已经领取过该优惠券了')
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
      receiveTime: new Date().toLocaleString(),
      useTime: null,
      orderId: null
    }
    mockUserCoupons.push(newUserCoupon)
    coupon.usedCount++
    
    ElMessage.success('领取成功！')
  }).catch(() => {})
}

const useCoupon = (coupon) => {
  ElMessage.info('正在跳转到首页使用优惠券...')
  setTimeout(() => {
    router.push('/home')
  }, 1000)
}
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

.coupon-card.used,
.coupon-card.expired {
  opacity: 0.7;
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
  gap: 4px;
  margin-bottom: 8px;
}

.coupon-value .currency {
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
  opacity: 0.9;
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

.coupon-name {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.coupon-description {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 12px;
}

.coupon-time {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.coupon-order {
  font-size: 13px;
  color: #94a3b8;
}

.coupon-actions {
  display: flex;
  justify-content: flex-end;
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

.coupon-center-content {
  max-height: 600px;
  overflow-y: auto;
}

.coupon-center-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.coupon-center-left {
  width: 140px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: white;
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

.coupon-center-value .currency {
  font-size: 14px;
  font-weight: 600;
}

.coupon-center-value .value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.coupon-center-value .type {
  font-size: 14px;
  font-weight: 600;
}

.coupon-center-type {
  font-size: 12px;
  opacity: 0.9;
  text-align: center;
}

.coupon-center-right {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.coupon-center-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
}

.coupon-center-description {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.coupon-center-stock {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.coupon-center-actions {
  display: flex;
  justify-content: flex-end;
}

.vip-tag {
  position: absolute;
  top: 8px;
  right: 8px;
}

@media (max-width: 768px) {
  .coupons-header {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
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

  .coupon-center-card {
    flex-direction: column;
  }

  .coupon-center-left {
    width: 100%;
    padding: 12px;
  }
}
</style>