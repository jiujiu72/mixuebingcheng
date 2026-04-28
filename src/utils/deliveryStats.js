const STATISTICS_KEY = 'delivery_statistics'
const DAILY_STATS_KEY = 'daily_delivery_stats'

function loadStatistics() {
  try {
    const data = localStorage.getItem(STATISTICS_KEY)
    return data ? JSON.parse(data) : getDefaultStatistics()
  } catch {
    return getDefaultStatistics()
  }
}

function saveStatistics(stats) {
  try {
    localStorage.setItem(STATISTICS_KEY, JSON.stringify(stats))
  } catch (e) {
    console.error('Failed to save statistics:', e)
  }
}

function getDefaultStatistics() {
  return {
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalGrabAttempts: 0,
    successfulGrabs: 0,
    totalDistance: 0,
    totalIncome: 0,
    totalWorkTime: 0,
    rating: {
      average: 5.0,
      total: 0,
      count: 0,
    },
    dailyStats: [],
    weeklyStats: [],
    monthlyStats: [],
    orderTypes: {
      food: 0,
      drink: 0,
      other: 0,
    },
    createdAt: new Date().toISOString(),
  }
}

function recordGrabAttempt(success, order = null) {
  const stats = loadStatistics()
  stats.totalGrabAttempts++
  
  if (success) {
    stats.successfulGrabs++
  }
  
  if (order) {
    const orderType = order.orderType || 'other'
    if (stats.orderTypes[orderType] !== undefined) {
      stats.orderTypes[orderType]++
    } else {
      stats.orderTypes[orderType] = 1
    }
  }
  
  saveStatistics(stats)
  return stats
}

function recordOrderComplete(order, distance = 0, workTime = 0) {
  const stats = loadStatistics()
  stats.totalOrders++
  stats.completedOrders++
  stats.totalDistance += distance
  stats.totalIncome += order.deliveryFee || 0
  stats.totalWorkTime += workTime
  
  const today = getDateKey(new Date())
  const dailyIndex = stats.dailyStats.findIndex(d => d.date === today)
  
  if (dailyIndex >= 0) {
    stats.dailyStats[dailyIndex].orders++
    stats.dailyStats[dailyIndex].income += order.deliveryFee || 0
    stats.dailyStats[dailyIndex].distance += distance
    stats.dailyStats[dailyIndex].workTime += workTime
  } else {
    stats.dailyStats.push({
      date: today,
      orders: 1,
      income: order.deliveryFee || 0,
      distance: distance,
      workTime: workTime,
    })
  }
  
  if (stats.dailyStats.length > 30) {
    stats.dailyStats = stats.dailyStats.slice(-30)
  }
  
  saveStatistics(stats)
  return stats
}

function recordOrderCancelled(order, reason = '') {
  const stats = loadStatistics()
  stats.cancelledOrders++
  saveStatistics(stats)
  return stats
}

function recordRating(rating, deliveryManId = null) {
  const stats = loadStatistics()
  stats.rating.total += rating
  stats.rating.count++
  stats.rating.average = parseFloat((stats.rating.total / stats.rating.count).toFixed(1))
  saveStatistics(stats)
  return stats
}

function getDateKey(date) {
  return date.toISOString().split('T')[0]
}

function getStatistics() {
  return loadStatistics()
}

function getGrabSuccessRate() {
  const stats = loadStatistics()
  if (stats.totalGrabAttempts === 0) return 0
  return parseFloat(((stats.successfulGrabs / stats.totalGrabAttempts) * 100).toFixed(1))
}

function getAverageIncomePerOrder() {
  const stats = loadStatistics()
  if (stats.completedOrders === 0) return 0
  return parseFloat((stats.totalIncome / stats.completedOrders).toFixed(2))
}

function getAverageDistancePerOrder() {
  const stats = loadStatistics()
  if (stats.completedOrders === 0) return 0
  return parseFloat((stats.totalDistance / stats.completedOrders).toFixed(2))
}

function getTodayStats() {
  const stats = loadStatistics()
  const today = getDateKey(new Date())
  const todayStat = stats.dailyStats.find(d => d.date === today)
  
  return {
    date: today,
    orders: todayStat?.orders || 0,
    income: todayStat?.income || 0,
    distance: todayStat?.distance || 0,
    workTime: todayStat?.workTime || 0,
  }
}

function getWeeklyStats() {
  const stats = loadStatistics()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoKey = getDateKey(weekAgo)
  
  const weeklyStats = stats.dailyStats.filter(d => d.date >= weekAgoKey)
  
  return {
    days: weeklyStats,
    totalOrders: weeklyStats.reduce((sum, d) => sum + d.orders, 0),
    totalIncome: weeklyStats.reduce((sum, d) => sum + d.income, 0),
    totalDistance: weeklyStats.reduce((sum, d) => sum + d.distance, 0),
    totalWorkTime: weeklyStats.reduce((sum, d) => sum + d.workTime, 0),
  }
}

function getPerformanceMetrics() {
  const stats = loadStatistics()
  
  return {
    grabSuccessRate: getGrabSuccessRate(),
    averageIncomePerOrder: getAverageIncomePerOrder(),
    averageDistancePerOrder: getAverageDistancePerOrder(),
    totalOrders: stats.totalOrders,
    completedOrders: stats.completedOrders,
    cancelledOrders: stats.cancelledOrders,
    totalIncome: stats.totalIncome,
    totalDistance: stats.totalDistance,
    rating: stats.rating.average,
    ratingCount: stats.rating.count,
  }
}

function resetStatistics() {
  localStorage.removeItem(STATISTICS_KEY)
  return getDefaultStatistics()
}

function exportStatistics() {
  const stats = loadStatistics()
  return JSON.stringify(stats, null, 2)
}

function importStatistics(jsonString) {
  try {
    const stats = JSON.parse(jsonString)
    saveStatistics(stats)
    return true
  } catch (e) {
    console.error('Failed to import statistics:', e)
    return false
  }
}

export {
  loadStatistics,
  saveStatistics,
  getDefaultStatistics,
  recordGrabAttempt,
  recordOrderComplete,
  recordOrderCancelled,
  recordRating,
  getStatistics,
  getGrabSuccessRate,
  getAverageIncomePerOrder,
  getAverageDistancePerOrder,
  getTodayStats,
  getWeeklyStats,
  getPerformanceMetrics,
  resetStatistics,
  exportStatistics,
  importStatistics,
}
