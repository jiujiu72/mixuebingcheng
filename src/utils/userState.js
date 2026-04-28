import { mockUserVips, mockVipLevels, mockVipPackages, getVipLevelNames, getVipLevelWeights } from '../data/mockData'

const STORAGE_KEY_USER = 'user'
const STORAGE_KEY_VIP = 'userVipInfo'
const VIP_UPDATED_EVENT = 'vip-updated'

const PROTECTED_LEVELS = [3, 4]

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

const validateAndFixVipData = (userVip) => {
  if (!userVip) return false
  
  const level = userVip.level
  const vipLevelId = userVip.vipLevelId
  
  const levelInfo = getVipLevelByLevel(level)
  
  if (!levelInfo) {
    const defaultLevel = getVipLevelByLevel(0)
    if (defaultLevel) {
      userVip.vipLevelId = defaultLevel.id
      userVip.vipName = defaultLevel.name
      userVip.level = defaultLevel.level
      userVip.discount = defaultLevel.discount
    }
    return true
  }
  
  if (levelInfo.id !== vipLevelId) {
    userVip.vipLevelId = levelInfo.id
    userVip.vipName = levelInfo.name
    userVip.discount = levelInfo.discount
    return true
  }
  
  return false
}

export const getVipLevelWeight = (levelNum) => {
  const weights = getVipLevelWeights()
  return weights[levelNum] || 0
}

export const compareVipLevels = (levelA, levelB) => {
  const weightA = getVipLevelWeight(levelA)
  const weightB = getVipLevelWeight(levelB)
  return weightA - weightB
}

export const isHigherOrEqualLevel = (targetLevel, currentLevel) => {
  return compareVipLevels(targetLevel, currentLevel) >= 0
}

export const isHigherLevel = (targetLevel, currentLevel) => {
  return compareVipLevels(targetLevel, currentLevel) > 0
}

export const isProtectedLevel = (levelNum) => {
  return PROTECTED_LEVELS.includes(levelNum)
}

export const getUserVip = (userId) => {
  const uid = userId || getCurrentUserId()
  return mockUserVips.find(v => v.userId === uid)
}

export const getVipLevelById = (levelId) => {
  return mockVipLevels.find(l => l.id === levelId) || null
}

export const getVipLevelByLevel = (levelNum) => {
  return mockVipLevels.find(l => l.level === levelNum) || null
}

export const getHighestVipLevel = () => {
  const sorted = [...mockVipLevels].sort((a, b) => b.level - a.level)
  return sorted[0] || null
}

export const isVipActive = (vip) => {
  if (!vip) return false
  if (vip.level === 0) return false
  if (vip.isActive !== 1) return false
  
  if (isProtectedLevel(vip.level)) {
    return true
  }
  
  const now = new Date()
  const endTime = parseDate(vip.endTime)
  
  if (!endTime) return true
  return now <= endTime
}

export const getVipDaysRemaining = (vip) => {
  if (!vip || !vip.endTime) return 0
  
  if (isProtectedLevel(vip.level)) {
    return 99999
  }
  
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
  
  if (!vip) return false
  if (vip.level === 0) return false
  
  if (isProtectedLevel(vip.level)) {
    vip.isActive = 1
    return false
  }
  
  const daysRemaining = getVipDaysRemaining(vip)
  
  if (daysRemaining === 0 && vip.level > 0) {
    const defaultLevel = getVipLevelByLevel(0)
    if (defaultLevel) {
      vip.vipLevelId = defaultLevel.id
      vip.vipName = defaultLevel.name
      vip.level = defaultLevel.level
      vip.discount = defaultLevel.discount
    } else {
      vip.vipLevelId = 1
      vip.vipName = '普通会员'
      vip.level = 0
      vip.discount = 1.0
    }
    vip.isActive = 0
    
    saveVipToLocalStorage(vip)
    return true
  }
  
  return false
}

export const saveVipToLocalStorage = (vipInfo) => {
  if (!vipInfo) return
  
  const needsFix = validateAndFixVipData(vipInfo)
  
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
        const currentLevel = userVip.level
        const storedLevel = vipData.level || 0
        
        if (isHigherOrEqualLevel(storedLevel, currentLevel)) {
          Object.assign(userVip, vipData)
          validateAndFixVipData(userVip)
        } else {
          console.warn('忽略低等级会员数据，保留当前高等级会员状态')
        }
      } else {
        const newVip = {
          ...vipData,
          userId: uid
        }
        validateAndFixVipData(newVip)
        mockUserVips.push(newVip)
      }
    } catch (e) {
      console.error('Failed to load VIP info from localStorage:', e)
    }
  }
}

export const upgradeVip = (option, userId) => {
  const uid = userId || getCurrentUserId()
  
  if (!option || typeof option.targetLevel === 'undefined') {
    return { 
      success: false, 
      message: '会员套餐信息不完整' 
    }
  }
  
  const targetLevelNum = option.targetLevel
  const targetLevelInfo = getVipLevelByLevel(targetLevelNum)
  
  if (!targetLevelInfo) {
    return { 
      success: false, 
      message: `会员等级 ${targetLevelNum} 不存在` 
    }
  }
  
  let userVip = mockUserVips.find(v => v.userId === uid)
  
  if (userVip) {
    const currentLevel = userVip.level
    
    if (!isHigherLevel(targetLevelNum, currentLevel)) {
      const currentLevelInfo = getVipLevelByLevel(currentLevel)
      const levelNames = getVipLevelNames()
      const currentLevelName = currentLevelInfo?.name || levelNames[currentLevel] || '会员'
      
      if (targetLevelNum === currentLevel) {
        return {
          success: false,
          message: `您已是${currentLevelName}，请勿重复购买同级会员`
        }
      } else {
        return {
          success: false,
          message: `您当前已是${currentLevelName}，等级更高，无法购买低等级会员`
        }
      }
    }
  }
  
  const startTime = new Date()
  
  let endTime
  if (isProtectedLevel(targetLevelNum)) {
    endTime = new Date('2099-12-31T23:59:59')
  } else {
    const durationDays = option.durationDays || 30
    endTime = new Date(startTime.getTime() + durationDays * 24 * 60 * 60 * 1000)
  }
  
  if (!userVip) {
    userVip = {
      id: Math.max(0, ...mockUserVips.map(v => v.id || 0)) + 1,
      userId: uid,
      totalSpent: 0,
      totalOrders: 0,
      lastOrderTime: null
    }
    mockUserVips.push(userVip)
  }
  
  userVip.vipLevelId = targetLevelInfo.id
  userVip.vipName = targetLevelInfo.name
  userVip.level = targetLevelInfo.level
  userVip.discount = targetLevelInfo.discount
  userVip.startTime = startTime.toISOString()
  userVip.endTime = endTime.toISOString()
  userVip.isActive = 1
  
  saveVipToLocalStorage(userVip)
  
  return {
    success: true,
    vipInfo: userVip,
    targetLevel: targetLevelInfo,
    isProtected: isProtectedLevel(targetLevelNum),
    message: `开通成功！您已升级为${targetLevelInfo.name}${isProtectedLevel(targetLevelNum) ? '（永久有效）' : ''}`
  }
}

export const canPurchaseVipOption = (option, userId) => {
  const uid = userId || getCurrentUserId()
  
  if (!option || typeof option.targetLevel === 'undefined') {
    return {
      canPurchase: false,
      reason: '会员套餐信息无效'
    }
  }
  
  const targetLevelNum = option.targetLevel
  const targetLevelInfo = getVipLevelByLevel(targetLevelNum)
  
  if (!targetLevelInfo) {
    return {
      canPurchase: false,
      reason: '会员等级不存在'
    }
  }
  
  let userVip = mockUserVips.find(v => v.userId === uid)
  
  if (!userVip) {
    return {
      canPurchase: true,
      reason: ''
    }
  }
  
  validateAndFixVipData(userVip)
  
  const currentLevel = userVip.level
  const currentLevelInfo = getVipLevelByLevel(currentLevel)
  const levelNames = getVipLevelNames()
  const currentLevelName = currentLevelInfo?.name || levelNames[currentLevel] || '会员'
  
  if (isProtectedLevel(currentLevel)) {
    return {
      canPurchase: false,
      reason: `您已是${currentLevelName}（最高等级），无需再购买其他会员`
    }
  }
  
  const expired = checkVipExpiration(uid)
  if (expired) {
    return {
      canPurchase: true,
      reason: ''
    }
  }
  
  if (compareVipLevels(targetLevelNum, currentLevel) < 0) {
    const targetLevelName = targetLevelInfo.name || levelNames[targetLevelNum] || '会员'
    return {
      canPurchase: false,
      reason: `您当前已是${currentLevelName}，等级更高，无需购买${targetLevelName}`
    }
  }
  
  if (compareVipLevels(targetLevelNum, currentLevel) === 0) {
    return {
      canPurchase: false,
      reason: `您已是${currentLevelName}，请勿重复购买同级会员`
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
  
  const userVip = getUserVip(uid)
  
  if (!userVip) {
    const defaultLevel = getVipLevelByLevel(0)
    return {
      userId: uid,
      vipLevelId: defaultLevel?.id || 1,
      vipName: defaultLevel?.name || '普通会员',
      level: 0,
      discount: defaultLevel?.discount || 1.0,
      isActive: 1,
      vipInfo: defaultLevel,
      isVipActive: false,
      isNewUser: true
    }
  }
  
  validateAndFixVipData(userVip)
  
  if (isProtectedLevel(userVip.level)) {
    userVip.isActive = 1
  } else {
    checkVipExpiration(uid)
  }
  
  const vipInfo = getVipLevelByLevel(userVip.level)
  
  return {
    ...userVip,
    vipInfo: vipInfo || getVipLevelByLevel(0),
    isVipActive: isVipActive(userVip),
    daysRemaining: getVipDaysRemaining(userVip),
    isProtected: isProtectedLevel(userVip.level)
  }
}

export const extendVipDuration = (option, userId) => {
  const uid = userId || getCurrentUserId()
  
  if (!option || typeof option.targetLevel === 'undefined') {
    return { 
      success: false, 
      message: '会员套餐信息不完整' 
    }
  }
  
  const targetLevelNum = option.targetLevel
  let userVip = mockUserVips.find(v => v.userId === uid)
  
  if (!userVip) {
    return upgradeVip(option, userId)
  }
  
  validateAndFixVipData(userVip)
  
  const currentLevel = userVip.level
  
  if (compareVipLevels(targetLevelNum, currentLevel) !== 0) {
    return {
      success: false,
      message: '续费操作仅支持同级会员，如需升级请购买高等级会员'
    }
  }
  
  if (isProtectedLevel(currentLevel)) {
    return {
      success: false,
      message: '您已是永久会员，无需续费'
    }
  }
  
  const currentEndTime = parseDate(userVip.endTime)
  const now = new Date()
  let newEndTime
  
  if (currentEndTime && currentEndTime > now) {
    newEndTime = new Date(currentEndTime.getTime() + (option.durationDays || 30) * 24 * 60 * 60 * 1000)
  } else {
    newEndTime = new Date(now.getTime() + (option.durationDays || 30) * 24 * 60 * 60 * 1000)
  }
  
  userVip.endTime = newEndTime.toISOString()
  userVip.isActive = 1
  
  saveVipToLocalStorage(userVip)
  
  return {
    success: true,
    vipInfo: userVip,
    message: `续费成功！会员有效期延长至${newEndTime.toLocaleDateString('zh-CN')}`
  }
}

// VIP排名系统
export const getVipRanking = (userId) => {
  const uid = userId || getCurrentUserId()
  
  const sortedUsers = [...mockUserVips].sort((a, b) => {
    if (a.level !== b.level) {
      return b.level - a.level
    }
    if (a.totalSpent !== b.totalSpent) {
      return b.totalSpent - a.totalSpent
    }
    return (b.totalOrders || 0) - (a.totalOrders || 0)
  })
  
  const userIndex = sortedUsers.findIndex(v => v.userId === uid)
  
  if (userIndex === -1) {
    return {
      rank: sortedUsers.length + 1,
      totalUsers: sortedUsers.length,
      rankPercentage: 100,
      userLevel: 0,
      userSpent: 0,
      userOrders: 0
    }
  }
  
  const userVip = sortedUsers[userIndex]
  
  return {
    rank: userIndex + 1,
    totalUsers: sortedUsers.length,
    rankPercentage: sortedUsers.length > 0 
      ? Math.round(((userIndex + 1) / sortedUsers.length) * 100) 
      : 100,
    userLevel: userVip.level,
    userSpent: userVip.totalSpent || 0,
    userOrders: userVip.totalOrders || 0,
    levelName: getVipLevelByLevel(userVip.level)?.name || '普通会员',
    isTop10: userIndex < 10,
    isTop50: userIndex < Math.ceil(sortedUsers.length * 0.5)
  }
}

// 获取VIP排行榜
export const getVipLeaderboard = (limit = 10) => {
  const sortedUsers = [...mockUserVips].sort((a, b) => {
    if (a.level !== b.level) {
      return b.level - a.level
    }
    if (a.totalSpent !== b.totalSpent) {
      return b.totalSpent - a.totalSpent
    }
    return (b.totalOrders || 0) - (a.totalOrders || 0)
  })
  
  return sortedUsers.slice(0, limit).map((userVip, index) => {
    const levelInfo = getVipLevelByLevel(userVip.level)
    return {
      rank: index + 1,
      userId: userVip.userId,
      level: userVip.level,
      levelName: levelInfo?.name || '普通会员',
      levelIcon: levelInfo?.icon || '👤',
      levelColor: levelInfo?.color || '#94a3b8',
      totalSpent: userVip.totalSpent || 0,
      totalOrders: userVip.totalOrders || 0,
      isActive: isVipActive(userVip)
    }
  })
}

// 获取可用的VIP套餐选项
export const getAvailableVipPackages = (userId) => {
  const uid = userId || getCurrentUserId()
  const userVip = getUserVip(uid)
  
  if (!userVip) {
    return mockVipPackages.filter(pkg => pkg.type === 'upgrade')
  }
  
  const currentLevel = userVip.level
  const isExpired = !isVipActive(userVip)
  
  let packages = []
  
  if (isExpired) {
    const upgradePackages = mockVipPackages.filter(pkg => 
      pkg.type === 'upgrade' && isHigherLevel(pkg.targetLevel, currentLevel)
    )
    const renewPackages = mockVipPackages.filter(pkg => 
      pkg.type === 'renew' && pkg.targetLevel === currentLevel && currentLevel > 0
    )
    packages = [...renewPackages, ...upgradePackages]
  } else {
    if (currentLevel > 0 && !isProtectedLevel(currentLevel)) {
      const renewPackages = mockVipPackages.filter(pkg => 
        pkg.type === 'renew' && pkg.targetLevel === currentLevel
      )
      packages = [...packages, ...renewPackages]
    }
    
    const upgradePackages = mockVipPackages.filter(pkg => 
      pkg.type === 'upgrade' && isHigherLevel(pkg.targetLevel, currentLevel)
    )
    packages = [...packages, ...upgradePackages]
  }
  
  return packages
}
