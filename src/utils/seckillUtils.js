import { mockSeckillSessions, mockSeckillItems, SeckillStatus } from '../data/mockData'

const parseDate = (dateStr) => {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

export const getSeckillStatus = (session) => {
  if (!session) return SeckillStatus.ENDED
  
  const now = new Date()
  const startTime = parseDate(session.startTime)
  const endTime = parseDate(session.endTime)
  
  if (!startTime || !endTime) return SeckillStatus.ENDED
  
  if (now < startTime) {
    return SeckillStatus.PENDING
  } else if (now >= startTime && now < endTime) {
    return SeckillStatus.ACTIVE
  } else {
    return SeckillStatus.ENDED
  }
}

export const getSeckillStatusLabel = (status) => {
  switch (status) {
    case SeckillStatus.PENDING:
      return '即将开始'
    case SeckillStatus.ACTIVE:
      return '抢购中'
    case SeckillStatus.ENDED:
      return '已结束'
    default:
      return '未知'
  }
}

export const getSeckillStatusType = (status) => {
  switch (status) {
    case SeckillStatus.PENDING:
      return 'warning'
    case SeckillStatus.ACTIVE:
      return 'success'
    case SeckillStatus.ENDED:
      return 'info'
    default:
      return 'info'
  }
}

export const getCountdown = (targetTime) => {
  const now = new Date().getTime()
  const target = parseDate(targetTime)?.getTime() || 0
  
  if (target <= now) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: 0,
      isExpired: true
    }
  }
  
  const diff = target - now
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  
  return {
    hours: Math.max(0, hours),
    minutes: Math.max(0, minutes),
    seconds: Math.max(0, seconds),
    totalMs: diff,
    isExpired: false
  }
}

export const formatCountdown = (countdown) => {
  if (!countdown) return '00:00:00'
  const hours = String(countdown.hours).padStart(2, '0')
  const minutes = String(countdown.minutes).padStart(2, '0')
  const seconds = String(countdown.seconds).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

export const getActiveSessions = () => {
  const now = new Date()
  return mockSeckillSessions
    .filter(session => {
      const startTime = parseDate(session.startTime)
      const endTime = parseDate(session.endTime)
      if (!startTime || !endTime) return false
      return now < endTime
    })
    .sort((a, b) => {
      const statusA = getSeckillStatus(a)
      const statusB = getSeckillStatus(b)
      if (statusA === SeckillStatus.ACTIVE && statusB !== SeckillStatus.ACTIVE) return -1
      if (statusA !== SeckillStatus.ACTIVE && statusB === SeckillStatus.ACTIVE) return 1
      return (a.sort || 0) - (b.sort || 0)
    })
}

export const getSessionById = (sessionId) => {
  return mockSeckillSessions.find(s => s.id === sessionId) || null
}

export const getSeckillItemsBySession = (sessionId) => {
  return mockSeckillItems.filter(item => item.sessionId === sessionId && item.status === 1)
}

export const getSeckillItemById = (itemId) => {
  return mockSeckillItems.find(item => item.id === itemId) || null
}

export const getSeckillItemByFoodId = (foodId, sessionId = null) => {
  if (sessionId) {
    return mockSeckillItems.find(item => item.foodId === foodId && item.sessionId === sessionId && item.status === 1) || null
  }
  const now = new Date()
  const activeItems = mockSeckillItems.filter(item => {
    if (item.foodId !== foodId || item.status !== 1) return false
    const session = mockSeckillSessions.find(s => s.id === item.sessionId)
    if (!session) return false
    const startTime = parseDate(session.startTime)
    const endTime = parseDate(session.endTime)
    if (!startTime || !endTime) return false
    return now >= startTime && now < endTime
  })
  return activeItems[0] || null
}

export const getCurrentActiveSeckillItem = (foodId) => {
  const now = new Date()
  const activeItems = mockSeckillItems.filter(item => {
    if (item.foodId !== foodId || item.status !== 1) return false
    const session = mockSeckillSessions.find(s => s.id === item.sessionId)
    if (!session) return false
    const startTime = parseDate(session.startTime)
    const endTime = parseDate(session.endTime)
    if (!startTime || !endTime) return false
    const status = getSeckillStatus(session)
    return status === SeckillStatus.ACTIVE && item.stock > 0
  })
  return activeItems[0] || null
}

export const canPurchaseSeckillItem = (item, userId) => {
  if (!item) return { canPurchase: false, reason: '商品不存在' }
  if (item.status !== 1) return { canPurchase: false, reason: '商品已下架' }
  
  const session = getSessionById(item.sessionId)
  if (!session) return { canPurchase: false, reason: '活动不存在' }
  
  const status = getSeckillStatus(session)
  
  if (status === SeckillStatus.PENDING) {
    return { canPurchase: false, reason: '活动即将开始，请耐心等待' }
  }
  
  if (status === SeckillStatus.ENDED) {
    return { canPurchase: false, reason: '活动已结束' }
  }
  
  if (item.stock <= 0) {
    return { canPurchase: false, reason: '商品已售罄' }
  }
  
  return { canPurchase: true, reason: '' }
}

export const getStockPercentage = (item) => {
  if (!item) return 0
  const total = item.stock + item.sold
  if (total === 0) return 0
  return Math.round((item.sold / total) * 100)
}

export const getCurrentActiveSession = () => {
  const now = new Date()
  const activeSession = mockSeckillSessions.find(session => {
    const startTime = parseDate(session.startTime)
    const endTime = parseDate(session.endTime)
    if (!startTime || !endTime) return false
    return now >= startTime && now < endTime
  })
  
  if (activeSession) return activeSession
  
  const upcomingSession = mockSeckillSessions
    .filter(session => {
      const startTime = parseDate(session.startTime)
      if (!startTime) return false
      return now < startTime
    })
    .sort((a, b) => {
      const timeA = parseDate(a.startTime)?.getTime() || 0
      const timeB = parseDate(b.startTime)?.getTime() || 0
      return timeA - timeB
    })[0]
  
  return upcomingSession || null
}
