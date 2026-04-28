import { memberDayRules, mockMemberDaySpecials, mockVipLevels } from '../data/mockData'
import { getCurrentUserVipInfo, isVipActive } from './userState'

const isMemberDay = (date = new Date()) => {
  const dayOfWeek = date.getDay()
  const dayOfMonth = date.getDate()
  
  if (dayOfWeek === memberDayRules.weeklyDay) {
    return true
  }
  
  if (memberDayRules.monthlyDays.includes(dayOfMonth)) {
    return true
  }
  
  return false
}

export const isTodayMemberDay = () => {
  return isMemberDay(new Date())
}

export const getNextMemberDay = () => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const currentDate = now.getDate()
  
  let nextDate = null
  let minDaysDiff = Infinity
  
  for (let i = 0; i < 14; i++) {
    const checkDate = new Date(now)
    checkDate.setDate(currentDate + i)
    
    if (isMemberDay(checkDate)) {
      if (i === 0) {
        if (now.getHours() < 23 || now.getMinutes() < 59) {
          return {
            date: checkDate,
            daysUntil: 0,
            isToday: true,
            type: getMemberDayType(checkDate)
          }
        }
        continue
      }
      
      const daysDiff = i
      if (daysDiff < minDaysDiff) {
        minDaysDiff = daysDiff
        nextDate = checkDate
      }
    }
  }
  
  if (!nextDate) {
    for (let i = 14; i < 60; i++) {
      const checkDate = new Date(now)
      checkDate.setDate(currentDate + i)
      
      if (isMemberDay(checkDate)) {
        return {
          date: checkDate,
          daysUntil: i,
          isToday: false,
          type: getMemberDayType(checkDate)
        }
      }
    }
  }
  
  return nextDate ? {
    date: nextDate,
    daysUntil: minDaysDiff,
    isToday: false,
    type: getMemberDayType(nextDate)
  } : null
}

const getMemberDayType = (date) => {
  const dayOfWeek = date.getDay()
  const dayOfMonth = date.getDate()
  
  if (dayOfWeek === memberDayRules.weeklyDay) {
    return 'weekly'
  }
  
  if (memberDayRules.monthlyDays.includes(dayOfMonth)) {
    return 'monthly'
  }
  
  return 'unknown'
}

export const getMemberDayTypeLabel = (type) => {
  switch (type) {
    case 'weekly':
      return '每周会员日'
    case 'monthly':
      return '月度会员日'
    default:
      return '会员日'
  }
}

export const getMemberDaySpecials = (minVipLevel = 0) => {
  return mockMemberDaySpecials.filter(item => {
    if (item.status !== 1) return false
    if (item.minVipLevel > minVipLevel) return false
    return true
  })
}

export const getMemberDaySpecialByFoodId = (foodId) => {
  return mockMemberDaySpecials.find(item => item.foodId === foodId && item.status === 1) || null
}

export const canAccessMemberDayBenefits = (userId = null) => {
  const vipInfo = getCurrentUserVipInfo(userId)
  
  if (!vipInfo) {
    return {
      canAccess: false,
      reason: '您还不是会员，请开通会员后再享受会员日权益',
      isVip: false
    }
  }
  
  if (!vipInfo.isVipActive) {
    return {
      canAccess: false,
      reason: '您的会员已过期，请续费后再享受会员日权益',
      isVip: true,
      isExpired: true
    }
  }
  
  return {
    canAccess: true,
    reason: '',
    isVip: true,
    vipLevel: vipInfo.level,
    vipName: vipInfo.vipName
  }
}

export const getMemberDayDiscount = (originalPrice, userId = null) => {
  const access = canAccessMemberDayBenefits(userId)
  
  if (!access.canAccess) {
    return {
      discount: 0,
      discountedPrice: originalPrice,
      canUse: false,
      reason: access.reason
    }
  }
  
  const discountAmount = originalPrice * (1 - memberDayRules.discount)
  const discountedPrice = originalPrice * memberDayRules.discount
  
  return {
    discount: discountAmount,
    discountedPrice: discountedPrice,
    canUse: true,
    reason: '',
    discountRate: memberDayRules.discount,
    discountPercent: Math.round((1 - memberDayRules.discount) * 100)
  }
}

export const getPointsMultiplier = (userId = null) => {
  const access = canAccessMemberDayBenefits(userId)
  
  if (!access.canAccess) {
    return {
      multiplier: 1,
      canUse: false,
      reason: access.reason
    }
  }
  
  if (!isTodayMemberDay()) {
    return {
      multiplier: 1,
      canUse: false,
      reason: '今天不是会员日，积分不翻倍'
    }
  }
  
  return {
    multiplier: memberDayRules.pointsMultiplier,
    canUse: true,
    reason: '',
    isMemberDay: true
  }
}

export const formatMemberDayDate = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[d.getDay()]
  
  return `${month}月${day}日 ${weekday}`
}

export const getMemberDayRulesInfo = () => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weeklyDayName = weekdays[memberDayRules.weeklyDay]
  const monthlyDaysStr = memberDayRules.monthlyDays.join('、')
  
  return {
    ...memberDayRules,
    weeklyDayName,
    monthlyDaysStr,
    discountPercent: Math.round((1 - memberDayRules.discount) * 100),
    discountDisplay: `${memberDayRules.discount * 10}折`
  }
}

export const getCurrentVipLevelName = (userId = null) => {
  const vipInfo = getCurrentUserVipInfo(userId)
  return vipInfo?.vipName || '普通会员'
}

export const isSeckillAndMemberDayConflict = (cartItems) => {
  const hasSeckill = cartItems.some(item => item.isSeckill)
  const hasMemberDay = cartItems.some(item => item.isMemberDaySpecial)
  
  if (hasSeckill && hasMemberDay) {
    return {
      hasConflict: true,
      message: '秒杀商品不与会员日优惠叠加，请分别下单'
    }
  }
  
  return {
    hasConflict: false,
    message: ''
  }
}
