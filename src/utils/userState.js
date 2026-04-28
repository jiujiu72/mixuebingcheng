import { mockUserVips, mockVipLevels } from '../data/mockData'

const STORAGE_KEY_USER = 'user'
const STORAGE_KEY_VIP = 'userVipInfo'
const VIP_UPDATED_EVENT = 'vip-updated'

const getCurrentUserId = () => {
  const user = localStorage.getItem(STORAGE_KEY_USER)
  if (user) {
    try {
      const parsed = JSON.parse(user)
      return parsed.id || 1
    } catch {
      return 1
    }
  }
  return 1
}

const parseDate = (dateStr) => {
  if (!dateStr) return null
  const date = new Date(dateStr.replace(/-/g, '/'))
  return isNaN(date.getTime()) ? null : date
}

const dispatchVipUpdatedEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(VIP_UPDATED_EVENT, {
      detail: {
        timestamp: Date.now()
      }
    }))
  }
}

export const getUserVip = (userId) => {
  const uid = userId || getCurrentUserId()
  return mockUserVips.find(v => v.userId === uid)
}

export const getVipLevelById = (levelId) => {
  return mockVipLevels.find(l => l.id === levelId) || mockVipLevels[0]
}

export const getVipLevelByLevel = (levelNum) => {
  return mockVipLevels.find(l => l.level === levelNum) || mockVipLevels[0]
}

export const isVipActive = (vip) => {
  if (!vip || vip.level === 0) return false
  if (vip.isActive !== 1) return false
  
  const now = new Date()
  const endTime = parseDate(vip.endTime)
  
  if (!endTime) return true
  return now <= endTime
}

export const getVipDaysRemaining = (vip) => {
  if (!vip || !vip.endTime) return 0
  
  const now = new Date()
  const endTime = parseDate(vip.endTime)
  
  if (!endTime) return 0
  
  const diffMs = endTime - now
  if (diffMs <= 0) return 0
  
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export const checkVipExpiration = (userId) => {
  const uid = userId || getCurrentUserId()
  const vip = getUserVip(uid)
  
  if (!vip || vip.level === 0) return false
  
  const daysRemaining = getVipDaysRemaining(vip)
  
  if (daysRemaining === 0 && vip.level > 0) {
    const defaultLevel = getVipLevelByLevel(0)
    vip.vipLevelId = defaultLevel.id
    vip.vipName = defaultLevel.name
    vip.level = defaultLevel.level
    vip.discount = defaultLevel.discount
    vip.isActive = 0
    
    saveVipToLocalStorage(vip)
    return true
  }
  
  return false
}

export const saveVipToLocalStorage = (vipInfo) => {
  if (!vipInfo) return
  
  const vipData = {
    ...vipInfo,
    lastSyncTime: new Date().toISOString()
  }
  
  localStorage.setItem(STORAGE_KEY_VIP, JSON.stringify(vipData))
  
  const userStr = localStorage.getItem(STORAGE_KEY_USER)
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      user.vipLevel = vipInfo.level
      user.vipName = vipInfo.vipName
      user.isVip = vipInfo.level > 0
      user.vipLevelId = vipInfo.vipLevelId
      user.vipDiscount = vipInfo.discount
      user.vipEndTime = vipInfo.endTime
      user.vipIsActive = vipInfo.isActive
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
    } catch (e) {
      console.error('Failed to update user in localStorage:', e)
    }
  }
  
  dispatchVipUpdatedEvent()
}

export const loadVipFromLocalStorage = (userId) => {
  const uid = userId || getCurrentUserId()
  const stored = localStorage.getItem(STORAGE_KEY_VIP)
  
  if (stored) {
    try {
      const vipData = JSON.parse(stored)
      let userVip = mockUserVips.find(v => v.userId === uid)
      
      if (userVip) {
        Object.assign(userVip, vipData)
      } else {
        mockUserVips.push({
          ...vipData,
          userId: uid
        })
      }
    } catch (e) {
      console.error('Failed to load VIP info from localStorage:', e)
    }
  }
}

export const upgradeVip = (option, userId) => {
  const uid = userId || getCurrentUserId()
  
  const targetLevel = getVipLevelByLevel(option.targetLevel)
  if (!targetLevel) {
    return { success: false, message: '会员等级不存在' }
  }
  
  const startTime = new Date()
  const endTime = new Date(startTime.getTime() + option.durationDays * 24 * 60 * 60 * 1000)
  
  let userVip = mockUserVips.find(v => v.userId === uid)
  
  if (!userVip) {
    userVip = {
      id: mockUserVips.length + 1,
      userId: uid,
      totalSpent: 0,
      totalOrders: 0,
      lastOrderTime: null
    }
    mockUserVips.push(userVip)
  }
  
  userVip.vipLevelId = targetLevel.id
  userVip.vipName = targetLevel.name
  userVip.level = targetLevel.level
  userVip.discount = targetLevel.discount
  userVip.startTime = startTime.toISOString()
  userVip.endTime = endTime.toISOString()
  userVip.isActive = 1
  
  saveVipToLocalStorage(userVip)
  
  return {
    success: true,
    vipInfo: userVip,
    targetLevel: targetLevel,
    message: `开通成功！您已升级为${targetLevel.name}`
  }
}

export const canPurchaseVipOption = (option, userId) => {
  const uid = userId || getCurrentUserId()
  const userVip = getUserVip(uid)
  
  if (!userVip) {
    return {
      canPurchase: true,
      reason: ''
    }
  }
  
  checkVipExpiration(uid)
  
  const currentLevel = userVip.level
  const targetLevel = option.targetLevel
  const isCurrentActive = isVipActive(userVip)
  
  if (!isCurrentActive) {
    return {
      canPurchase: true,
      reason: ''
    }
  }
  
  if (targetLevel < currentLevel) {
    const targetVipLevel = getVipLevelByLevel(targetLevel)
    const currentVipLevel = getVipLevelByLevel(currentLevel)
    return {
      canPurchase: false,
      reason: `您当前已是${currentVipLevel?.name || '高级会员'}，等级更高，无需购买${targetVipLevel?.name || '此会员'}`
    }
  }
  
  if (targetLevel === currentLevel) {
    const currentVipLevel = getVipLevelByLevel(currentLevel)
    return {
      canPurchase: false,
      reason: `您已是${currentVipLevel?.name || '会员'}，请勿重复购买同级会员`
    }
  }
  
  return {
    canPurchase: true,
    reason: ''
  }
}

export const onVipUpdated = (callback) => {
  if (typeof window !== 'undefined' && typeof callback === 'function') {
    const handler = (event) => {
      callback(event.detail)
    }
    window.addEventListener(VIP_UPDATED_EVENT, handler)
    return () => {
      window.removeEventListener(VIP_UPDATED_EVENT, handler)
    }
  }
  return () => {}
}

export const getCurrentUserVipInfo = (userId) => {
  const uid = userId || getCurrentUserId()
  
  loadVipFromLocalStorage(uid)
  checkVipExpiration(uid)
  
  const userVip = getUserVip(uid)
  
  if (!userVip) {
    const defaultLevel = getVipLevelByLevel(0)
    return {
      userId: uid,
      vipLevelId: defaultLevel.id,
      vipName: defaultLevel.name,
      level: defaultLevel.level,
      discount: defaultLevel.discount,
      isActive: 1,
      vipInfo: defaultLevel,
      isVipActive: false
    }
  }
  
  const vipInfo = getVipLevelById(userVip.vipLevelId)
  
  return {
    ...userVip,
    vipInfo,
    isVipActive: isVipActive(userVip),
    daysRemaining: getVipDaysRemaining(userVip)
  }
}
