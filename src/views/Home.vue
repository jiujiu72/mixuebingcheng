<template>
  <div class="home-container">
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="header-title">
          <h1>美味点餐系统</h1>
          <p>欢迎，{{ username }}</p>
        </div>
      </div>
      
      <div class="header-right">
        <div class="address-selector" @click="showAddressDialog = true">
          <el-icon><Location /></el-icon>
          <span class="address-text">{{ selectedAddress ? selectedAddress.address.substring(0, 15) + '...' : '请选择收货地址' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索菜品..."
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="header-actions">
          <el-dropdown @command="handleDropdownCommand">
            <el-button type="primary" text>
              <el-icon><User /></el-icon>
              我的
              <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="orders">
                  <el-icon><Document /></el-icon>
                  我的订单
                </el-dropdown-item>
                <el-dropdown-item command="address">
                  <el-icon><Location /></el-icon>
                  地址管理
                </el-dropdown-item>
                <el-dropdown-item command="notifications">
                  <el-icon><Bell /></el-icon>
                  消息通知
                  <el-badge v-if="unreadCount > 0" :value="unreadCount" :offset="[10, 0]" class="dropdown-badge" />
                </el-dropdown-item>
                <el-dropdown-item command="coupons">
                  <el-icon><Ticket /></el-icon>
                  我的优惠券
                  <el-tag v-if="unusedCouponsCount > 0" type="danger" size="small" class="dropdown-tag">
                    {{ unusedCouponsCount }}
                  </el-tag>
                </el-dropdown-item>
                <el-dropdown-item command="points">
                  <el-icon><Wallet /></el-icon>
                  我的积分
                  <el-tag v-if="userPointsInfo?.availablePoints > 0" type="primary" size="small" class="dropdown-tag">
                    {{ userPointsInfo?.availablePoints }}
                  </el-tag>
                </el-dropdown-item>
                <el-dropdown-item command="vip">
                  <el-icon><Medal /></el-icon>
                  会员中心
                  <el-tag v-if="userVipInfo?.level > 0" type="warning" size="small" class="dropdown-tag">
                    {{ userVipInfo?.vipName }}
                  </el-tag>
                </el-dropdown-item>
                <el-dropdown-item command="favorites">
                  <el-icon><StarFilled /></el-icon>
                  我的收藏
                  <el-tag v-if="favoritesCount > 0" type="success" size="small" class="dropdown-tag">
                    {{ favoritesCount }}
                  </el-tag>
                </el-dropdown-item>
                <el-dropdown-item command="reviews">
                  <el-icon><ChatDotRound /></el-icon>
                  评价中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="content-wrapper">
        <div class="menu-section">
          <div class="promo-banner-section">
            <div class="promo-banner-wrapper">
              <div 
                v-for="(banner, index) in promoBanners" 
                :key="index"
                class="promo-banner"
                :class="{ active: currentBannerIndex === index }"
                @click="handleBannerClick(banner)"
              >
                <div class="banner-content" :style="{ background: banner.background }">
                  <div class="banner-text">
                    <div class="banner-badge">{{ banner.badge }}</div>
                    <h3 class="banner-title">{{ banner.title }}</h3>
                    <p class="banner-desc">{{ banner.description }}</p>
                    <div class="banner-action">
                      <span class="action-text">{{ banner.actionText }}</span>
                      <el-icon><ArrowRight /></el-icon>
                    </div>
                  </div>
                  <div class="banner-countdown" v-if="banner.showCountdown">
                    <div class="countdown-label">{{ banner.countdownLabel }}</div>
                    <div class="countdown-value">
                      <span class="countdown-unit">
                        <span class="countdown-num">{{ bannerCountdown.hours }}</span>
                        <span class="countdown-sep">:</span>
                      </span>
                      <span class="countdown-unit">
                        <span class="countdown-num">{{ bannerCountdown.minutes }}</span>
                        <span class="countdown-sep">:</span>
                      </span>
                      <span class="countdown-unit">
                        <span class="countdown-num">{{ bannerCountdown.seconds }}</span>
                      </span>
                    </div>
                  </div>
                  <div class="banner-icon" v-if="banner.icon">
                    <span class="icon-text">{{ banner.icon }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="banner-indicators">
              <span
                v-for="(banner, index) in promoBanners"
                :key="index"
                class="indicator-dot"
                :class="{ active: currentBannerIndex === index }"
                @click="currentBannerIndex = index"
              ></span>
            </div>
            <div class="banner-nav">
              <div class="nav-btn nav-prev" @click="prevBanner">
                <el-icon><ArrowLeft /></el-icon>
              </div>
              <div class="nav-btn nav-next" @click="nextBanner">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>

          <div class="category-tabs">
            <div
              v-for="category in categories"
              :key="category.id"
              :class="['category-tab', { active: activeCategory === category.id }]"
              @click="activeCategory = category.id"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
            </div>
          </div>

          <div class="menu-grid">
            <div
              v-for="item in filteredMenuItems"
              :key="item.id"
              class="menu-card"
              @click="addToCart(item)"
            >
              <div class="card-image">
                <img :src="item.image" :alt="item.name" />
                <div v-if="item.hot" class="hot-badge">
                  <span>热销</span>
                </div>
                <div v-if="item.new" class="new-badge">
                  <span>新品</span>
                </div>
                <div 
                  class="favorite-button"
                  @click.stop="toggleFavorite(item.id)"
                >
                  <el-icon v-if="isFavorite(item.id)" color="#ef4444"><StarFilled /></el-icon>
                  <el-icon v-else color="#cbd5e1"><Star /></el-icon>
                </div>
              </div>
              
              <div class="card-content">
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-description">{{ item.description }}</p>
                
                <div class="card-footer">
                  <div class="price-section">
                    <span class="current-price">¥{{ item.price }}</span>
                    <span v-if="item.originalPrice" class="original-price">¥{{ item.originalPrice }}</span>
                  </div>
                  
                  <div class="quantity-section">
                    <el-button
                      v-if="getCartQuantity(item.id) > 0"
                      size="small"
                      circle
                      @click.stop="removeFromCart(item)"
                    >
                      <el-icon><Minus /></el-icon>
                    </el-button>
                    
                    <span v-if="getCartQuantity(item.id) > 0" class="quantity-number">
                      {{ getCartQuantity(item.id) }}
                    </span>
                    
                    <el-button
                      size="small"
                      circle
                      type="primary"
                      @click.stop="addToCart(item)"
                    >
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="cart-section" ref="cartSection">
          <div class="cart-header">
            <div class="cart-title">
              <el-icon><ShoppingCart /></el-icon>
              <span>购物车</span>
            </div>
            <el-button
              v-if="cartItems.length > 0"
              type="danger"
              text
              size="small"
              @click="clearCart"
            >
              清空
            </el-button>
          </div>

          <div v-if="cartItems.length === 0" class="cart-empty">
            <div class="empty-icon">
              <el-icon :size="64"><ShoppingCart /></el-icon>
            </div>
            <p>购物车是空的</p>
            <span>快去挑选美食吧~</span>
          </div>

          <div v-else class="cart-items">
            <div
              v-for="(item, index) in cartItems"
              :key="item.id"
              class="cart-item"
              :style="{ animationDelay: `${index * 0.05}s` }"
            >
              <div class="cart-item-info">
                <h4 class="cart-item-name">{{ item.name }}</h4>
                <span class="cart-item-price">¥{{ item.price }}</span>
              </div>
              
              <div class="cart-item-actions">
                <el-button
                  size="small"
                  circle
                  @click="removeFromCart(item)"
                >
                  <el-icon><Minus /></el-icon>
                </el-button>
                <span class="cart-item-quantity">{{ item.quantity }}</span>
                <el-button
                  size="small"
                  circle
                  type="primary"
                  @click="addToCart(item)"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <div v-if="cartItems.length > 0" class="cart-footer">
            <div class="cart-summary">
              <div class="summary-row">
                <span>商品数量</span>
                <span>{{ totalQuantity }} 件</span>
              </div>
              <div class="summary-row discount-row" v-if="selectedCoupon">
                <div class="discount-label">
                  <span>优惠券</span>
                  <el-button text size="small" @click="showCouponDialog = true">
                    更换
                  </el-button>
                </div>
                <div class="discount-value">
                  <el-tag type="success" size="small">
                    -¥{{ couponDiscountAmount.toFixed(2) }}
                  </el-tag>
                </div>
              </div>
              <div class="summary-row coupon-select-row" v-else>
                <div class="coupon-select" @click="showCouponDialog = true">
                  <el-icon><Ticket /></el-icon>
                  <span class="coupon-text">选择优惠券</span>
                  <el-icon><ArrowRight /></el-icon>
                </div>
                <div class="coupon-count" v-if="availableCouponsForUse.length > 0">
                  <el-tag type="primary" size="small">
                    {{ availableCouponsForUse.length }}张可用
                  </el-tag>
                </div>
              </div>
              <div class="summary-row total">
                <span>实付</span>
                <span class="total-price">¥{{ finalPrice }}</span>
              </div>
            </div>
            
            <el-button
              type="primary"
              size="large"
              class="submit-button"
              @click="submitOrder"
            >
              提交订单
            </el-button>
          </div>
        </div>
      </div>
    </main>

    <div class="mobile-cart-button" v-if="cartItems.length > 0" @click="showMobileCart = true">
      <el-icon><ShoppingCart /></el-icon>
      <span class="mobile-cart-count">{{ totalQuantity }}</span>
      <span class="mobile-cart-total">¥{{ totalPrice }}</span>
    </div>

    <el-dialog
      v-model="showAddressDialog"
      title="选择收货地址"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="address-dialog-content">
        <div v-if="userAddresses.length === 0" class="empty-address">
          <el-icon :size="64" color="#cbd5e1"><Location /></el-icon>
          <p>暂无收货地址</p>
          <el-button type="primary" @click="goToAddressManage">
            <el-icon><Plus /></el-icon>
            添加地址
          </el-button>
        </div>
        <div v-else class="address-list">
          <div
            v-for="address in userAddresses"
            :key="address.id"
            class="address-item"
            :class="{ selected: selectedAddress?.id === address.id, 'is-default': address.isDefault === 1 }"
            @click="selectAddress(address)"
          >
            <div class="address-info">
              <div class="address-header">
                <span class="name">{{ address.name }}</span>
                <span class="phone">{{ address.phone }}</span>
                <el-tag v-if="address.isDefault === 1" type="danger" size="small">默认</el-tag>
              </div>
              <div class="address-detail">
                {{ address.province }}{{ address.city }}{{ address.district }}{{ address.address }}
              </div>
            </div>
            <el-icon v-if="selectedAddress?.id === address.id" color="#667eea" class="check-icon"><Check /></el-icon>
          </div>
        </div>
        <div class="address-dialog-footer">
          <el-button text @click="goToAddressManage">
            <el-icon><Plus /></el-icon>
            管理地址
          </el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddress" :disabled="!selectedAddress">
          确定
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showCouponDialog"
      title="选择优惠券"
      width="600px"
      :close-on-click-modal="false"
      custom-class="coupon-dialog"
    >
      <div class="coupon-dialog-content">
        <div class="coupon-dialog-header">
          <span class="total-amount">订单金额：<span class="amount">¥{{ totalPrice }}</span></span>
          <span class="available-count">可用优惠券：<span class="count">{{ availableCouponsForUse.length }}张</span></span>
        </div>

        <div v-if="availableCouponsForUse.length === 0 && unavailableCouponsForUse.length === 0" class="coupon-empty">
          <el-icon :size="48" color="#cbd5e1"><Ticket /></el-icon>
          <p>暂无可用优惠券</p>
          <el-button type="primary" text @click="goToCouponCenter">
            去领取优惠券
          </el-button>
        </div>

        <div class="coupon-list">
          <div
            v-for="coupon in availableCouponsForUse"
            :key="coupon.id"
            class="coupon-select-card"
            :class="{ selected: selectedCoupon?.id === coupon.id }"
            @click="selectCoupon(coupon)"
          >
            <div class="coupon-select-left">
              <div class="coupon-select-value">
                <span class="currency" v-if="coupon.couponInfo.type === 'discount' || coupon.couponInfo.type === 'cash'">¥</span>
                <span class="value">{{ getCouponValueDisplay(coupon.couponInfo).value }}</span>
                <span class="unit" v-if="coupon.couponInfo.type === 'percent'">折</span>
                <span class="unit" v-if="coupon.couponInfo.type === 'freeShipping'">运费</span>
              </div>
              <div class="coupon-select-type">
                {{ getCouponTypeLabel(coupon.couponInfo) }}
              </div>
            </div>
            <div class="coupon-select-right">
              <div class="coupon-select-header">
                <div class="coupon-select-name">{{ coupon.couponInfo.name }}</div>
                <el-radio :model-value="selectedCoupon?.id === coupon.id" :value="coupon.id" />
              </div>
              <div class="coupon-select-desc">{{ coupon.couponInfo.description }}</div>
              <div class="coupon-select-meta">
                <div class="coupon-select-time">
                  <el-icon size="12"><Clock /></el-icon>
                  <span>{{ formatTime(coupon.couponInfo.startTime) }} - {{ formatTime(coupon.couponInfo.endTime) }}</span>
                </div>
                <div class="coupon-select-save">
                  可省 <span class="save-amount">¥{{ calculateCouponDiscount(coupon).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="unavailableCouponsForUse.length > 0" class="unavailable-section">
          <div class="unavailable-header">
            <span class="unavailable-title">不可用优惠券</span>
            <span class="unavailable-count">{{ unavailableCouponsForUse.length }}张</span>
          </div>
          <div class="unavailable-list">
            <div
              v-for="coupon in unavailableCouponsForUse"
              :key="coupon.id"
              class="unavailable-coupon-card"
            >
              <div class="unavailable-left">
                <div class="unavailable-value">
                  <span class="value">{{ getCouponValueDisplay(coupon.couponInfo).value }}</span>
                </div>
              </div>
              <div class="unavailable-right">
                <div class="unavailable-name">{{ coupon.couponInfo.name }}</div>
                <div class="unavailable-reason">
                  <el-icon size="12" color="#f97316"><Warning /></el-icon>
                  <span>{{ coupon.unavailableReasons?.[0]?.full || '暂不可用' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="clearSelectedCoupon">不使用优惠券</el-button>
        <el-button type="primary" @click="confirmCouponSelection">确定</el-button>
      </template>
    </el-dialog>

    <el-drawer
      v-model="showMobileCart"
      direction="btt"
      :size="'80%'"
      class="mobile-cart-drawer"
      :with-header="false"
    >
      <div class="mobile-cart-header">
        <div class="mobile-cart-title">
          <el-icon><ShoppingCart /></el-icon>
          <span>购物车</span>
          <span v-if="totalQuantity > 0" class="cart-badge">{{ totalQuantity }}</span>
        </div>
        <el-button
          v-if="cartItems.length > 0"
          type="danger"
          text
          size="small"
          @click="clearCart"
        >
          清空
        </el-button>
      </div>

      <div v-if="cartItems.length === 0" class="cart-empty">
        <div class="empty-icon">
          <el-icon :size="64"><ShoppingCart /></el-icon>
        </div>
        <p>购物车是空的</p>
        <span>快去挑选美食吧~</span>
      </div>

      <div v-else class="mobile-cart-content">
        <div class="cart-items mobile-cart-items">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="cart-item"
          >
            <div class="cart-item-info">
              <h4 class="cart-item-name">{{ item.name }}</h4>
              <span class="cart-item-price">¥{{ item.price }}</span>
            </div>
            
            <div class="cart-item-actions">
              <el-button
                size="small"
                circle
                @click="removeFromCart(item)"
              >
                <el-icon><Minus /></el-icon>
              </el-button>
              <span class="cart-item-quantity">{{ item.quantity }}</span>
              <el-button
                size="small"
                circle
                type="primary"
                @click="addToCart(item)"
              >
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <div class="cart-footer mobile-cart-footer">
          <div class="cart-summary">
            <div class="summary-row">
              <span>共 {{ totalQuantity }} 件商品</span>
            </div>
            <div class="summary-row coupon-row-mobile" v-if="cartItems.length > 0" @click="showCouponDialog = true">
              <div class="coupon-select-mobile">
                <el-icon><Ticket /></el-icon>
                <span v-if="selectedCoupon">{{ selectedCoupon.couponInfo.name }} -¥{{ couponDiscountAmount.toFixed(2) }}</span>
                <span v-else-if="availableCouponsForUse.length > 0">选择优惠券 ({{ availableCouponsForUse.length }}张可用)</span>
                <span v-else>选择优惠券</span>
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
            <div class="summary-row total">
              <span>实付</span>
              <span class="total-price">¥{{ finalPrice }}</span>
            </div>
          </div>
          
          <el-button
            type="primary"
            size="large"
            class="submit-button"
            @click="submitOrder"
          >
            提交订单
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, SwitchButton, ShoppingCart, Plus, Minus,
  Location, ArrowDown, User, Document, Bell, Check,
  Star, StarFilled, Ticket, Wallet, Medal, ChatDotRound,
  Clock, Warning, ArrowRight
} from '@element-plus/icons-vue'
import { 
  mockUserAddresses, 
  mockOrders, 
  mockNotifications, 
  mockOrderTracking,
  mockFavorites,
  mockUserVips,
  mockUserPoints,
  mockUserCoupons,
  mockCoupons
} from '../data/mockData'
import {
  loadUserCouponsFromLocalStorage,
  saveUserCouponsToLocalStorage,
  isCouponValid,
  isCouponExpired,
  getUnavailableReason,
  getCouponTypeLabel,
  getCouponValueDisplay,
  getScopeDisplay,
  isVipActive,
  calculateDiscount,
  checkAmountThreshold,
  checkCategoryRestriction,
  checkVipRestriction,
  checkNewUserRestriction,
  checkStackCompatibility
} from '../utils/couponUtils'
import {
  getCurrentUserVipInfo,
  onVipUpdated,
  checkVipExpiration
} from '../utils/userState'
import {
  getCurrentActiveSession,
  getCountdown,
  formatCountdown
} from '../utils/seckillUtils'
import {
  isTodayMemberDay,
  getNextMemberDay,
  getMemberDayRulesInfo,
  canAccessMemberDayBenefits
} from '../utils/memberDayUtils'

const router = useRouter()
const searchKeyword = ref('')
const activeCategory = ref('all')
const cartItems = ref([])
const showMobileCart = ref(false)
const showAddressDialog = ref(false)
const selectedAddress = ref(null)
const remark = ref('')

const showCouponDialog = ref(false)
const selectedCoupon = ref(null)
const selectedCouponInDialog = ref(null)

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const username = computed(() => user.value.username || '游客')

const vipRefreshTrigger = ref(0)
let removeVipListener = null

const currentBannerIndex = ref(0)
const bannerCountdown = ref({ hours: '00', minutes: '00', seconds: '00' })
let bannerTimer = null
let bannerAutoPlayTimer = null

const promoBanners = computed(() => {
  const banners = []
  
  const activeSeckillSession = getCurrentActiveSession()
  if (activeSeckillSession) {
    banners.push({
      type: 'seckill',
      badge: '限时秒杀',
      title: '限时秒杀火爆进行中',
      description: '精选商品，超低价格，先到先得！',
      actionText: '立即抢购',
      background: 'linear-gradient(135deg, #ef4444 0%, #f97316 50%, #ea580c 100%)',
      showCountdown: true,
      countdownLabel: '距结束',
      icon: '🔥',
      route: '/seckill'
    })
  }
  
  const todayIsMemberDay = isTodayMemberDay()
  const nextMemberDayInfo = getNextMemberDay()
  const memberDayRules = getMemberDayRulesInfo()
  
  banners.push({
    type: 'memberDay',
    badge: todayIsMemberDay ? '会员日' : '会员专属',
    title: todayIsMemberDay ? '今天是会员日！' : '会员日专享优惠',
    description: todayIsMemberDay 
      ? `全场${memberDayRules.discountDisplay}，双倍积分，专属低价！`
      : (nextMemberDayInfo 
          ? `下次会员日：${nextMemberDayInfo.daysUntil}天后（${nextMemberDayInfo.date?.toLocaleDateString('zh-CN')}）`
          : '每周三、每月8/18/28日为会员日'),
    actionText: '查看详情',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
    showCountdown: false,
    icon: '👑',
    route: '/member-day'
  })
  
  return banners
})

const formatCountdownNum = (num) => {
  return String(Math.max(0, num)).padStart(2, '0')
}

const updateCountdown = () => {
  const activeSession = getCurrentActiveSession()
  if (activeSession) {
    const countdown = getCountdown(activeSession.endTime)
    bannerCountdown.value = {
      hours: formatCountdownNum(countdown.hours),
      minutes: formatCountdownNum(countdown.minutes),
      seconds: formatCountdownNum(countdown.seconds)
    }
  }
}

const nextBanner = () => {
  currentBannerIndex.value = (currentBannerIndex.value + 1) % promoBanners.value.length
}

const prevBanner = () => {
  currentBannerIndex.value = (currentBannerIndex.value - 1 + promoBanners.value.length) % promoBanners.value.length
}

const handleBannerClick = (banner) => {
  if (banner.route) {
    router.push(banner.route)
  }
}

const hasSeckillItems = computed(() => {
  return cartItems.value.some(item => item.isSeckill)
})

const hasMemberDayItems = computed(() => {
  return cartItems.value.some(item => item.isMemberDaySpecial)
})

const seckillItemsTotal = computed(() => {
  return cartItems.value
    .filter(item => item.isSeckill)
    .reduce((sum, item) => sum + (item.seckillPrice || item.price) * item.quantity, 0)
})

const regularItemsTotal = computed(() => {
  return cartItems.value
    .filter(item => !item.isSeckill)
    .reduce((sum, item) => {
      const price = item.memberPrice || item.price
      return sum + price * item.quantity
    }, 0)
})

const isTodayMemberDayVal = computed(() => {
  return isTodayMemberDay()
})

const memberDayAccess = computed(() => {
  return canAccessMemberDayBenefits(1)
})

const canUseMemberDayDiscount = computed(() => {
  return isTodayMemberDayVal.value && memberDayAccess.value.canAccess
})

const memberDayDiscountRate = computed(() => {
  if (!canUseMemberDayDiscount.value) return 1
  const rules = getMemberDayRulesInfo()
  return rules.discount
})

const memberDayDiscountAmount = computed(() => {
  if (!canUseMemberDayDiscount.value || hasSeckillItems.value) return 0
  const regularTotal = regularItemsTotal.value
  return regularTotal * (1 - memberDayDiscountRate.value)
})

const totalPrice = computed(() => {
  const seckillTotal = seckillItemsTotal.value
  const regularTotal = regularItemsTotal.value
  return (seckillTotal + regularTotal).toFixed(2)
})

const discountedTotal = computed(() => {
  const total = parseFloat(totalPrice.value)
  const memberDiscount = memberDayDiscountAmount.value
  return Math.max(0, total - memberDiscount)
})

const finalPrice = computed(() => {
  const total = discountedTotal.value
  const couponDiscount = hasSeckillItems.value ? 0 : couponDiscountAmount.value
  return Math.max(0, total - couponDiscount).toFixed(2)
})

const showVipModal = ref(false)

const handleMemberDayPurchase = () => {
  if (!memberDayAccess.value.canAccess) {
    showVipModal.value = true
    return false
  }
  return true
}

const userAddresses = computed(() => {
  return mockUserAddresses.filter(a => a.userId === 1)
})

const unreadCount = computed(() => {
  return mockNotifications.filter(n => n.userId === 1 && !n.isRead).length
})

const userVipInfo = computed(() => {
  vipRefreshTrigger.value
  const vipInfo = getCurrentUserVipInfo(1)
  return vipInfo || mockUserVips.find(v => v.userId === 1)
})

const userPointsInfo = computed(() => {
  return mockUserPoints.find(p => p.userId === 1)
})

const favoritesCount = computed(() => {
  return mockFavorites.filter(f => f.userId === 1).length
})

const unusedCouponsCount = computed(() => {
  return mockUserCoupons.filter(c => c.userId === 1 && c.status === 'unused').length
})

const totalQuantity = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
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

const unusedCouponsWithInfo = computed(() => {
  return userCoupons.value.filter(c => c.status === 'unused')
})

const cartItemsForCouponCheck = computed(() => {
  const categoryMap = {
    'burger': 1,
    'drink': 2,
    'snack': 3,
    'dessert': 4,
    'set': 5
  }
  return cartItems.value.map(item => ({
    ...item,
    categoryId: categoryMap[item.category] || null
  }))
})

const availableCouponsForUse = computed(() => {
  const totalAmount = parseFloat(totalPrice.value)
  const items = cartItemsForCouponCheck.value
  
  return unusedCouponsWithInfo.value
    .filter(coupon => {
      if (!isCouponValid(coupon)) return false
      
      const reasons = getUnavailableReason(
        coupon,
        totalAmount,
        items,
        null,
        userVipInfo.value,
        [],
        []
      )
      
      return reasons.length === 0
    })
    .map(coupon => ({
      ...coupon,
      unavailableReasons: []
    }))
    .sort((a, b) => {
      const discountA = calculateCouponDiscount(a)
      const discountB = calculateCouponDiscount(b)
      return discountB - discountA
    })
})

const unavailableCouponsForUse = computed(() => {
  const totalAmount = parseFloat(totalPrice.value)
  const items = cartItemsForCouponCheck.value
  
  return unusedCouponsWithInfo.value
    .filter(coupon => {
      if (!isCouponValid(coupon)) return true
      
      const reasons = getUnavailableReason(
        coupon,
        totalAmount,
        items,
        null,
        userVipInfo.value,
        [],
        []
      )
      
      return reasons.length > 0
    })
    .map(coupon => {
      const reasons = getUnavailableReason(
        coupon,
        parseFloat(totalPrice.value),
        cartItemsForCouponCheck.value,
        null,
        userVipInfo.value,
        [],
        []
      )
      return {
        ...coupon,
        unavailableReasons: reasons
      }
    })
})

const couponDiscountAmount = computed(() => {
  if (!selectedCoupon.value) return 0
  return calculateCouponDiscount(selectedCoupon.value)
})

const isFavorite = (foodId) => {
  return mockFavorites.some(f => f.userId === 1 && f.foodId === foodId)
}

const toggleFavorite = (foodId) => {
  const existingIndex = mockFavorites.findIndex(f => f.userId === 1 && f.foodId === foodId)
  
  if (existingIndex > -1) {
    mockFavorites.splice(existingIndex, 1)
    ElMessage.success('已取消收藏')
  } else {
    const newFavorite = {
      id: Math.max(...mockFavorites.map(f => f.id), 0) + 1,
      userId: 1,
      foodId: foodId,
      createTime: new Date().toLocaleString()
    }
    mockFavorites.push(newFavorite)
    ElMessage.success('已添加到收藏')
  }
}

const calculateCouponDiscount = (coupon) => {
  if (!coupon || !coupon.couponInfo) return 0
  
  const totalAmount = parseFloat(totalPrice.value)
  const { discount } = calculateDiscount(coupon, totalAmount, cartItemsForCouponCheck.value)
  return discount
}

const selectCoupon = (coupon) => {
  selectedCouponInDialog.value = coupon
}

const clearSelectedCoupon = () => {
  selectedCoupon.value = null
  selectedCouponInDialog.value = null
  showCouponDialog.value = false
  ElMessage.info('已取消使用优惠券')
}

const confirmCouponSelection = () => {
  if (selectedCouponInDialog.value) {
    selectedCoupon.value = selectedCouponInDialog.value
    ElMessage.success(`已选择: ${selectedCoupon.value.couponInfo.name}`)
  }
  showCouponDialog.value = false
}

const formatTime = (time) => {
  if (!time) return ''
  return time.split(' ')[0]
}

const goToCouponCenter = () => {
  showCouponDialog.value = false
  router.push('/user/coupons')
}

const categories = [
  { id: 'all', name: '全部', icon: '🍔' },
  { id: 'burger', name: '汉堡', icon: '🍔' },
  { id: 'drink', name: '饮品', icon: '🥤' },
  { id: 'snack', name: '小食', icon: '🍟' },
  { id: 'dessert', name: '甜点', icon: '🍨' },
  { id: 'set', name: '套餐', icon: '🍱' }
]

const menuItems = [
  {
    id: 1,
    name: '经典牛肉汉堡',
    description: '100%纯牛肉饼，新鲜生菜，秘制酱料',
    price: 28,
    originalPrice: 35,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20beef%20burger%20with%20lettuce%20and%20tomato%20on%20white%20background%20product%20photography&image_size=square',
    category: 'burger',
    hot: true,
    new: false
  },
  {
    id: 2,
    name: '双层芝士汉堡',
    description: '双层牛肉饼，融化芝士，口感丰富',
    price: 35,
    originalPrice: null,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=double%20cheese%20burger%20with%20melted%20cheese%20product%20photography%20white%20background&image_size=square',
    category: 'burger',
    hot: true,
    new: true
  },
  {
    id: 3,
    name: '香辣鸡腿堡',
    description: '酥脆鸡腿肉，香辣酱，爽辣过瘾',
    price: 32,
    originalPrice: 38,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spicy%20chicken%20burger%20crispy%20chicken%20fillet%20product%20photography%20white%20background&image_size=square',
    category: 'burger',
    hot: false,
    new: false
  },
  {
    id: 4,
    name: '珍珠奶茶',
    description: 'Q弹珍珠，香浓奶茶，经典口味',
    price: 15,
    originalPrice: null,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bubble%20tea%20with%20tapioca%20pearls%20in%20clear%20cup%20product%20photography%20white%20background&image_size=square',
    category: 'drink',
    hot: true,
    new: false
  },
  {
    id: 5,
    name: '芒果冰沙',
    description: '新鲜芒果，冰爽细腻，夏日首选',
    price: 18,
    originalPrice: 22,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mango%20smoothie%20with%20fresh%20mango%20slices%20product%20photography%20white%20background&image_size=square',
    category: 'drink',
    hot: false,
    new: true
  },
  {
    id: 6,
    name: '柠檬气泡水',
    description: '清新柠檬，清爽气泡，解腻神器',
    price: 12,
    originalPrice: null,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lemon%20sparkling%20water%20with%20fresh%20lemon%20slices%20product%20photography%20white%20background&image_size=square',
    category: 'drink',
    hot: false,
    new: false
  },
  {
    id: 7,
    name: '薯条',
    description: '金黄酥脆，外酥里嫩，配番茄酱',
    price: 10,
    originalPrice: 12,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=crispy%20golden%20french%20fries%20in%20paper%20bag%20product%20photography%20white%20background&image_size=square',
    category: 'snack',
    hot: true,
    new: false
  },
  {
    id: 8,
    name: '鸡米花',
    description: '香脆鸡块，外酥里嫩，配蘸酱',
    price: 16,
    originalPrice: null,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=crispy%20popcorn%20chicken%20in%20white%20bowl%20product%20photography%20white%20background&image_size=square',
    category: 'snack',
    hot: true,
    new: true
  },
  {
    id: 9,
    name: '洋葱圈',
    description: '金黄洋葱圈，香脆可口',
    price: 14,
    originalPrice: null,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=crispy%20onion%20rings%20stacked%20product%20photography%20white%20background&image_size=square',
    category: 'snack',
    hot: false,
    new: false
  },
  {
    id: 10,
    name: '提拉米苏',
    description: '经典意式甜点，浓郁咖啡香',
    price: 22,
    originalPrice: 28,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tiramisu%20dessert%20slice%20with%20cocoa%20powder%20product%20photography%20white%20background&image_size=square',
    category: 'dessert',
    hot: true,
    new: false
  },
  {
    id: 11,
    name: '巧克力熔岩蛋糕',
    description: '外酥内软，巧克力流心',
    price: 25,
    originalPrice: null,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chocolate%20lava%20cake%20with%20melting%20center%20product%20photography%20white%20background&image_size=square',
    category: 'dessert',
    hot: false,
    new: true
  },
  {
    id: 12,
    name: '经典套餐A',
    description: '经典汉堡 + 薯条 + 可乐',
    price: 45,
    originalPrice: 53,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=burger%20fries%20and%20cola%20meal%20set%20product%20photography%20white%20background&image_size=square',
    category: 'set',
    hot: true,
    new: false
  },
  {
    id: 13,
    name: '豪华套餐B',
    description: '双层汉堡 + 鸡米花 + 奶茶',
    price: 58,
    originalPrice: 69,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20burger%20meal%20with%20chicken%20and%20drink%20product%20photography%20white%20background&image_size=square',
    category: 'set',
    hot: false,
    new: true
  }
]

const filteredMenuItems = computed(() => {
  let items = menuItems
  
  if (activeCategory.value !== 'all') {
    items = items.filter(item => item.category === activeCategory.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    items = items.filter(item => 
      item.name.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
    )
  }
  
  return items
})

const getCartQuantity = (itemId) => {
  const item = cartItems.value.find(i => i.id === itemId)
  return item ? item.quantity : 0
}

const addToCart = (item) => {
  const existingItem = cartItems.value.find(i => i.id === item.id)
  
  if (existingItem) {
    existingItem.quantity++
  } else {
    cartItems.value.push({
      ...item,
      quantity: 1
    })
  }
  
  ElMessage.success(`已添加 ${item.name}`)
}

const removeFromCart = (item) => {
  const existingItem = cartItems.value.find(i => i.id === item.id)
  
  if (existingItem) {
    if (existingItem.quantity > 1) {
      existingItem.quantity--
    } else {
      const index = cartItems.value.findIndex(i => i.id === item.id)
      cartItems.value.splice(index, 1)
    }
  }
}

const clearCart = () => {
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartItems.value = []
    ElMessage.success('购物车已清空')
  }).catch(() => {
    // 用户取消
  })
}

const submitOrder = () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请先选择收货地址')
    showAddressDialog.value = true
    return
  }

  if (hasMemberDayItems.value && !memberDayAccess.value.canAccess) {
    ElMessageBox.confirm(
      '您购物车中有会员日专属商品，开通会员后即可享受会员价优惠。是否立即开通会员？',
      '开通会员提示',
      {
        confirmButtonText: '立即开通',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      router.push('/user/vip')
    }).catch(() => {})
    return
  }

  if (hasSeckillItems.value && selectedCoupon.value) {
    ElMessage.warning('秒杀商品不支持使用优惠券，已自动取消优惠券选择')
    selectedCoupon.value = null
  }

  let confirmMessage = `您确认要提交订单吗？\n\n收货地址：${selectedAddress.value.province}${selectedAddress.value.city}${selectedAddress.value.district}${selectedAddress.value.address}\n共 ${totalQuantity.value} 件商品\n商品金额：¥${totalPrice.value}`
  
  if (memberDayDiscountAmount.value > 0) {
    confirmMessage += `\n会员日折扣：-¥${memberDayDiscountAmount.value.toFixed(2)}`
  }
  
  if (selectedCoupon.value && couponDiscountAmount.value > 0) {
    confirmMessage += `\n优惠券抵扣：-¥${couponDiscountAmount.value.toFixed(2)}`
  }
  
  confirmMessage += `\n实付金额：¥${finalPrice.value}`

  ElMessageBox.confirm(
    confirmMessage,
    '确认订单',
    {
      confirmButtonText: '确认提交',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    const orderItems = cartItems.value.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.isSeckill ? (item.seckillPrice || item.price) : (item.memberPrice || item.price),
      originalPrice: item.originalPrice || item.price,
      isSeckill: item.isSeckill || false,
      isMemberDaySpecial: item.isMemberDaySpecial || false,
      seckillPrice: item.seckillPrice,
      memberPrice: item.memberPrice
    }))

    const newOrder = {
      id: `ORD${Date.now()}`,
      userId: 1,
      userName: selectedAddress.value.name,
      phone: selectedAddress.value.phone,
      totalPrice: parseFloat(totalPrice.value),
      actualPrice: parseFloat(finalPrice.value),
      discountAmount: couponDiscountAmount.value + memberDayDiscountAmount.value,
      couponId: selectedCoupon.value?.couponId || null,
      couponName: selectedCoupon.value?.couponInfo?.name || null,
      memberDayDiscount: memberDayDiscountAmount.value,
      hasSeckillItems: hasSeckillItems.value,
      hasMemberDayItems: hasMemberDayItems.value,
      isMemberDay: isTodayMemberDayVal.value,
      status: 1,
      orderType: 'delivery',
      orderTime: new Date().toLocaleString(),
      items: orderItems,
      address: `${selectedAddress.value.province}${selectedAddress.value.city}${selectedAddress.value.district}${selectedAddress.value.address}`,
      addressId: selectedAddress.value.id,
      deliveryManId: null,
      remark: remark.value || '',
      estimatedDeliveryTime: 30
    }

    mockOrders.unshift(newOrder)

    if (selectedCoupon.value) {
      const couponIndex = mockUserCoupons.findIndex(c => c.id === selectedCoupon.value.id)
      if (couponIndex > -1) {
        mockUserCoupons[couponIndex] = {
          ...mockUserCoupons[couponIndex],
          status: 'used',
          usedTime: new Date().toLocaleString(),
          orderId: newOrder.id
        }
        saveUserCouponsToLocalStorage()
      }
      selectedCoupon.value = null
    }

    const newNotification = {
      id: mockNotifications.length + 1,
      userId: 1,
      type: 'order',
      title: '订单已创建',
      content: `您的订单 ${newOrder.id} 已创建成功，等待商家确认`,
      isRead: 0,
      createTime: new Date().toLocaleString()
    }
    mockNotifications.unshift(newNotification)

    ElMessage.success('订单提交成功！')
    cartItems.value = []
    showMobileCart.value = false
    router.push('/user/orders')
  }).catch(() => {
    // 用户取消
  })
}

const selectAddress = (address) => {
  selectedAddress.value = address
}

const confirmAddress = () => {
  if (selectedAddress.value) {
    showAddressDialog.value = false
    ElMessage.success('已选择收货地址')
  }
}

const goToAddressManage = () => {
  showAddressDialog.value = false
  router.push('/user/address')
}

const handleDropdownCommand = (command) => {
  switch (command) {
    case 'orders':
      router.push('/user/orders')
      break
    case 'address':
      router.push('/user/address')
      break
    case 'notifications':
      router.push('/user/notifications')
      break
    case 'coupons':
      router.push('/user/coupons')
      break
    case 'points':
      router.push('/user/points')
      break
    case 'vip':
      router.push('/user/vip')
      break
    case 'favorites':
      router.push('/user/favorites')
      break
    case 'reviews':
      router.push('/user/reviews')
      break
    case 'logout':
      handleLogout()
      break
  }
}

onMounted(() => {
  const defaultAddress = userAddresses.value.find(a => a.isDefault === 1)
  if (defaultAddress) {
    selectedAddress.value = defaultAddress
  }
  
  const expired = checkVipExpiration(1)
  if (expired) {
    vipRefreshTrigger.value++
  }
  
  removeVipListener = onVipUpdated(() => {
    vipRefreshTrigger.value++
  })

  updateCountdown()
  bannerTimer = setInterval(() => {
    updateCountdown()
  }, 1000)

  bannerAutoPlayTimer = setInterval(() => {
    nextBanner()
  }, 5000)
})

onUnmounted(() => {
  if (removeVipListener) {
    removeVipListener()
  }
  if (bannerTimer) {
    clearInterval(bannerTimer)
    bannerTimer = null
  }
  if (bannerAutoPlayTimer) {
    clearInterval(bannerAutoPlayTimer)
    bannerAutoPlayTimer = null
  }
})

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('user')
    router.push('/login')
    ElMessage.success('已退出登录')
  }).catch(() => {
    // 用户取消
  })
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.logo svg {
  width: 28px;
  height: 28px;
  color: white;
}

.header-title h1 {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-title p {
  font-size: 13px;
  color: #64748b;
  margin: 2px 0 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box {
  width: 280px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.main-content {
  flex: 1;
  padding: 24px;
}

.content-wrapper {
  display: flex;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.menu-section {
  flex: 1;
  min-width: 0;
}

.promo-banner-section {
  position: relative;
  margin-bottom: 24px;
}

.promo-banner-wrapper {
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.promo-banner {
  display: none;
  cursor: pointer;
  transition: all 0.5s ease;
}

.promo-banner.active {
  display: block;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  min-height: 120px;
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.banner-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  width: fit-content;
  backdrop-filter: blur(10px);
}

.banner-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.banner-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.banner-action {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  margin-top: 4px;
}

.action-text {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.banner-countdown {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 16px 24px;
  border-radius: 16px;
  margin: 0 20px;
}

.countdown-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.countdown-value {
  display: flex;
  align-items: center;
  gap: 2px;
}

.countdown-unit {
  display: flex;
  align-items: baseline;
  gap: 1px;
}

.countdown-num {
  font-size: 28px;
  font-weight: 700;
  color: white;
  font-family: 'Courier New', monospace;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 32px;
  text-align: center;
}

.countdown-sep {
  font-size: 28px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.banner-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 50%;
}

.icon-text {
  font-size: 40px;
}

.banner-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background: #667eea;
  width: 24px;
  border-radius: 4px;
}

.banner-nav {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.nav-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: all;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  margin: 0 -20px;
}

.nav-btn:hover {
  background: white;
  transform: scale(1.1);
}

.nav-btn .el-icon {
  color: #334155;
  font-size: 18px;
}

.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 20px;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-width: 80px;
}

.category-tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #e0e7ff;
}

.category-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.category-icon {
  font-size: 24px;
}

.category-name {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  transition: color 0.3s ease;
}

.category-tab.active .category-name {
  color: white;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.menu-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #e0e7ff;
}

.card-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f1f5f9;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.menu-card:hover .card-image img {
  transform: scale(1.05);
}

.hot-badge, .new-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.hot-badge {
  background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
  color: white;
}

.new-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  left: auto;
  right: 12px;
}

.favorite-button {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.favorite-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-content {
  padding: 16px;
}

.item-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px 0;
}

.item-description {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.current-price {
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
}

.original-price {
  font-size: 13px;
  color: #94a3b8;
  text-decoration: line-through;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-number {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  min-width: 20px;
  text-align: center;
}

.cart-section {
  width: 360px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 140px);
  position: sticky;
  top: 108px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.cart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.empty-icon {
  margin-bottom: 16px;
  color: #cbd5e1;
}

.cart-empty p {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #64748b;
}

.cart-empty span {
  font-size: 13px;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.cart-items::-webkit-scrollbar {
  width: 4px;
}

.cart-items::-webkit-scrollbar-track {
  background: transparent;
}

.cart-items::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 2px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.cart-item-price {
  font-size: 14px;
  font-weight: 700;
  color: #667eea;
}

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-item-quantity {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  min-width: 16px;
  text-align: center;
}

.cart-footer {
  padding: 16px 20px 20px;
  border-top: 1px solid #f1f5f9;
}

.cart-summary {
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0;
}

.total-price {
  color: #667eea;
  font-size: 22px;
}

.submit-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
}

.mobile-cart-button {
  display: none;
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 14px 28px;
  border-radius: 50px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
  cursor: pointer;
  z-index: 1000;
  align-items: center;
  gap: 12px;
}

.mobile-cart-button :deep(svg) {
  width: 24px;
  height: 24px;
  color: white;
}

.mobile-cart-count {
  background: white;
  color: #667eea;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}

.mobile-cart-total {
  color: white;
  font-size: 16px;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .cart-section {
    display: none;
  }
  
  .mobile-cart-button {
    display: flex;
  }
  
  .header {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .header-right {
    width: 100%;
  }
  
  .search-box {
    flex: 1;
    width: auto;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  
  .card-image {
    height: 140px;
  }
  
  .category-tabs {
    margin-bottom: 16px;
  }
  
  .category-tab {
    padding: 8px 12px;
    min-width: 60px;
  }
  
  .category-name {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .item-name {
    font-size: 14px;
  }
  
  .current-price {
    font-size: 16px;
  }
  
  .mobile-cart-button {
    left: 16px;
    right: 16px;
    transform: none;
    justify-content: center;
  }
}

.mobile-cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.mobile-cart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.cart-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.mobile-cart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.mobile-cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  min-height: 0;
}

.mobile-cart-footer {
  flex-shrink: 0;
  padding: 16px 20px 20px;
  border-top: 1px solid #f1f5f9;
  background: white;
}

.mobile-cart-footer .cart-summary {
  margin-bottom: 12px;
}

.mobile-cart-footer .summary-row {
  margin-bottom: 4px;
}

.mobile-cart-footer .submit-button {
  margin-top: 4px;
}

.address-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f0f4ff 0%, #f8fafc 100%);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.address-selector:hover {
  background: linear-gradient(135deg, #e0e7ff 0%, #f1f5f9 100%);
  border-color: #c7d2fe;
}

.address-text {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.address-dialog-content {
  max-height: 400px;
  overflow-y: auto;
}

.empty-address {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-address p {
  margin: 16px 0 20px 0;
  color: #64748b;
  font-size: 15px;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.address-item:hover {
  border-color: #c7d2fe;
  background: #f8fafc;
}

.address-item.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%);
}

.address-item.is-default {
  border-color: #fecaca;
}

.address-item.is-default.selected {
  border-color: #667eea;
}

.address-info {
  flex: 1;
  min-width: 0;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.address-header .name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.address-header .phone {
  font-size: 14px;
  color: #64748b;
}

.address-detail {
  font-size: 14px;
  color: #334155;
  line-height: 1.5;
}

.check-icon {
  margin-left: 12px;
  flex-shrink: 0;
}

.address-dialog-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}

.dropdown-badge {
  margin-left: 8px;
}

.dropdown-tag {
  margin-left: 8px;
}

@media (max-width: 1024px) {
  .address-selector {
    order: -1;
    width: 100%;
    justify-content: center;
  }
  
  .address-text {
    max-width: none;
  }
  
  .header-right {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .address-selector {
    padding: 10px 12px;
  }
  
  .address-text {
    font-size: 13px;
  }
}
</style>