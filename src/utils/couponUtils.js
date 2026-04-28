import { mockCoupons, mockUserCoupons, mockUserVips, CouponType, CouponScope } from '../data/mockData'

const STORAGE_KEY_USER_COUPONS = 'userCoupons'

export function saveUserCouponsToLocalStorage() {
  localStorage.setItem(STORAGE_KEY_USER_COUPONS, JSON.stringify(mockUserCoupons))
}

export function loadUserCouponsFromLocalStorage() {
  const stored = localStorage.getItem(STORAGE_KEY_USER_COUPONS)
  if (stored) {
    try {
      const data = JSON.parse(stored)
      if (Array.isArray(data) && data.length > 0) {
        mockUserCoupons.length = 0
        mockUserCoupons.push(...data)
      }
    } catch (e) {
      console.error('Failed to load user coupons from localStorage:', e)
    }
  }
}

export function parseDate(dateStr) {
  if (!dateStr) return null
  const date = new Date(dateStr.replace(/-/g, '/'))
  return isNaN(date.getTime()) ? null : date
}

export function isCouponValid(coupon) {
  if (!coupon || !coupon.couponInfo) return false
  
  const couponInfo = coupon.couponInfo
  const now = new Date()
  const startTime = parseDate(couponInfo.startTime)
  const endTime = parseDate(couponInfo.endTime)
  
  if (!startTime || !endTime) return false
  if (now < startTime) return false
  if (now > endTime) return false
  
  return true
}

export function isCouponExpired(coupon) {
  if (!coupon || !coupon.couponInfo) return true
  
  const couponInfo = coupon.couponInfo
  const now = new Date()
  const endTime = parseDate(couponInfo.endTime)
  
  if (!endTime) return true
  return now > endTime
}

export function checkAmountThreshold(coupon, totalAmount) {
  if (!coupon || !coupon.couponInfo) return { valid: false, reason: '优惠券信息不完整' }
  
  const couponInfo = coupon.couponInfo
  if (totalAmount < couponInfo.minAmount) {
    return {
      valid: false,
      reason: `满${couponInfo.minAmount}元可用，当前消费${totalAmount}元`,
      shortReason: '金额不足'
    }
  }
  
  return { valid: true, reason: '' }
}

export function checkCategoryRestriction(coupon, orderItems, categories) {
  if (!coupon || !coupon.couponInfo) return { valid: false, reason: '优惠券信息不完整' }
  
  const couponInfo = coupon.couponInfo
  
  if (couponInfo.scope === CouponScope.ALL || !couponInfo.categoryIds || couponInfo.categoryIds.length === 0) {
    return { valid: true, reason: '' }
  }
  
  if (!orderItems || orderItems.length === 0) {
    return {
      valid: false,
      reason: '该优惠券仅限特定品类使用，当前购物车为空',
      shortReason: '品类不匹配'
    }
  }
  
  const applicableCategories = couponInfo.categoryIds
  const applicableCategoryNames = categories
    ? categories.filter(c => applicableCategories.includes(c.id)).map(c => c.name).join('、')
    : '指定品类'
  
  const hasApplicableItems = orderItems.some(item => {
    return applicableCategories.includes(item.categoryId)
  })
  
  if (!hasApplicableItems) {
    return {
      valid: false,
      reason: `该优惠券仅限${applicableCategoryNames}使用`,
      shortReason: '品类不匹配'
    }
  }
  
  const applicableItemsTotal = orderItems
    .filter(item => applicableCategories.includes(item.categoryId))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  if (applicableItemsTotal < couponInfo.minAmount) {
    return {
      valid: false,
      reason: `${applicableCategoryNames}商品需满${couponInfo.minAmount}元可用，当前${applicableItemsTotal.toFixed(2)}元`,
      shortReason: '品类金额不足'
    }
  }
  
  return { valid: true, reason: '' }
}

export function checkVipRestriction(coupon, userVip) {
  if (!coupon || !coupon.couponInfo) return { valid: false, reason: '优惠券信息不完整' }
  
  const couponInfo = coupon.couponInfo
  
  if (!couponInfo.isVipOnly) {
    return { valid: true, reason: '' }
  }
  
  if (!userVip || userVip.level < 1) {
    return {
      valid: false,
      reason: '该优惠券为VIP专享，请先升级为VIP会员',
      shortReason: '非VIP会员'
    }
  }
  
  return { valid: true, reason: '' }
}

export function checkNewUserRestriction(coupon, userOrders) {
  if (!coupon || !coupon.couponInfo) return { valid: false, reason: '优惠券信息不完整' }
  
  const couponInfo = coupon.couponInfo
  
  if (!couponInfo.isNewUserOnly) {
    return { valid: true, reason: '' }
  }
  
  if (userOrders && userOrders.length > 0) {
    return {
      valid: false,
      reason: '该优惠券为新用户专享，您已有消费记录',
      shortReason: '非新用户'
    }
  }
  
  return { valid: true, reason: '' }
}

export function checkStackCompatibility(selectedCoupons, newCoupon) {
  if (!newCoupon || !newCoupon.couponInfo) return { valid: false, reason: '优惠券信息不完整' }
  
  const newCouponInfo = newCoupon.couponInfo
  
  if (selectedCoupons.length === 0) {
    return { valid: true, reason: '' }
  }
  
  if (!newCouponInfo.canStack) {
    return {
      valid: false,
      reason: '该优惠券不可与其他优惠券叠加使用',
      shortReason: '不可叠加'
    }
  }
  
  for (const existing of selectedCoupons) {
    const existingInfo = existing.couponInfo
    
    if (!existingInfo.canStack) {
      return {
        valid: false,
        reason: `已选择的"${existingInfo.name}"不可与其他优惠券叠加`,
        shortReason: '已有不可叠加券'
      }
    }
    
    if (newCouponInfo.stackWith && newCouponInfo.stackWith.length > 0) {
      if (!newCouponInfo.stackWith.includes(existingInfo.type)) {
        return {
          valid: false,
          reason: `该优惠券不可与"${existingInfo.name}"叠加使用`,
          shortReason: '类型不兼容'
        }
      }
    }
    
    if (existingInfo.stackWith && existingInfo.stackWith.length > 0) {
      if (!existingInfo.stackWith.includes(newCouponInfo.type)) {
        return {
          valid: false,
          reason: `"${existingInfo.name}"不可与该优惠券叠加使用`,
          shortReason: '类型不兼容'
        }
      }
    }
  }
  
  return { valid: true, reason: '' }
}

export function calculateDiscount(coupon, totalAmount, orderItems) {
  if (!coupon || !coupon.couponInfo) return { discount: 0, shippingDiscount: 0 }
  
  const couponInfo = coupon.couponInfo
  let discount = 0
  let shippingDiscount = 0
  
  switch (couponInfo.type) {
    case CouponType.DISCOUNT:
      discount = couponInfo.value
      break
      
    case CouponType.PERCENT:
      discount = totalAmount * (1 - couponInfo.value / 100)
      if (couponInfo.maxDiscount && discount > couponInfo.maxDiscount) {
        discount = couponInfo.maxDiscount
      }
      break
      
    case CouponType.FREE_SHIPPING:
      shippingDiscount = 999
      break
      
    case CouponType.CASH:
      discount = couponInfo.value
      break
      
    default:
      discount = 0
  }
  
  return {
    discount: Math.min(discount, totalAmount),
    shippingDiscount
  }
}

export function getUnavailableReason(coupon, totalAmount, orderItems, categories, userVip, userOrders, selectedCoupons) {
  const reasons = []
  
  if (!isCouponValid(coupon)) {
    if (isCouponExpired(coupon)) {
      reasons.push({ short: '已过期', full: '优惠券已过期' })
    } else {
      reasons.push({ short: '未生效', full: '优惠券尚未生效' })
    }
  }
  
  const amountCheck = checkAmountThreshold(coupon, totalAmount)
  if (!amountCheck.valid) {
    reasons.push({ short: amountCheck.shortReason, full: amountCheck.reason })
  }
  
  const categoryCheck = checkCategoryRestriction(coupon, orderItems, categories)
  if (!categoryCheck.valid) {
    reasons.push({ short: categoryCheck.shortReason, full: categoryCheck.reason })
  }
  
  const vipCheck = checkVipRestriction(coupon, userVip)
  if (!vipCheck.valid) {
    reasons.push({ short: vipCheck.shortReason, full: vipCheck.reason })
  }
  
  const newUserCheck = checkNewUserRestriction(coupon, userOrders)
  if (!newUserCheck.valid) {
    reasons.push({ short: newUserCheck.shortReason, full: newUserCheck.reason })
  }
  
  if (selectedCoupons && selectedCoupons.length > 0) {
    const stackCheck = checkStackCompatibility(selectedCoupons, coupon)
    if (!stackCheck.valid) {
      reasons.push({ short: stackCheck.shortReason, full: stackCheck.reason })
    }
  }
  
  return reasons
}

export function isCouponAvailable(coupon, totalAmount, orderItems, categories, userVip, userOrders) {
  const reasons = getUnavailableReason(coupon, totalAmount, orderItems, categories, userVip, userOrders)
  return reasons.length === 0
}

export function sortCouponsByPriority(coupons) {
  return [...coupons].sort((a, b) => {
    const priorityA = a.couponInfo?.priority || 2
    const priorityB = b.couponInfo?.priority || 2
    return priorityA - priorityB
  })
}

export function getUserVip(userId = 1) {
  return mockUserVips.find(v => v.userId === userId)
}

export function checkVipExpiration(userId = 1) {
  const vip = getUserVip(userId)
  if (!vip || vip.level === 0) return false
  
  const now = new Date()
  const endDate = parseDate(vip.endDate)
  
  if (endDate && now > endDate) {
    vip.level = 0
    vip.status = 'expired'
    return true
  }
  
  return false
}

export function getDaysRemaining(endDateStr) {
  if (!endDateStr) return 0
  const endDate = parseDate(endDateStr)
  if (!endDate) return 0
  const now = new Date()
  const diff = endDate.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function isVipActive(vip) {
  if (!vip || vip.level === 0) return false
  const days = getDaysRemaining(vip.endDate)
  return days > 0 && vip.status === 'active'
}

export function getCouponTypeLabel(couponInfo) {
  if (!couponInfo) return ''
  
  switch (couponInfo.type) {
    case CouponType.DISCOUNT:
      return `满${couponInfo.minAmount}减${couponInfo.value}`
    case CouponType.PERCENT:
      return `${couponInfo.value}折优惠`
    case CouponType.FREE_SHIPPING:
      return '免配送费'
    case CouponType.CASH:
      return `${couponInfo.value}元无门槛`
    default:
      return '优惠券'
  }
}

export function getCouponValueDisplay(couponInfo) {
  if (!couponInfo) return { value: '0', unit: '' }
  
  switch (couponInfo.type) {
    case CouponType.DISCOUNT:
    case CouponType.CASH:
      return { value: couponInfo.value.toString(), unit: '¥' }
    case CouponType.PERCENT:
      return { value: couponInfo.value.toString(), unit: '折' }
    case CouponType.FREE_SHIPPING:
      return { value: '免', unit: '运费' }
    default:
      return { value: '0', unit: '' }
  }
}

export function getScopeDisplay(couponInfo, categories) {
  if (!couponInfo) return ''
  
  if (couponInfo.scope === CouponScope.ALL) {
    return '全场通用'
  }
  
  if (couponInfo.scope === CouponScope.CATEGORY && couponInfo.categoryIds && categories) {
    const categoryNames = categories
      .filter(c => couponInfo.categoryIds.includes(c.id))
      .map(c => c.name)
      .join('、')
    return `仅限${categoryNames}使用`
  }
  
  if (couponInfo.scope === CouponScope.PRODUCT) {
    return '仅限指定商品使用'
  }
  
  return '指定范围可用'
}
