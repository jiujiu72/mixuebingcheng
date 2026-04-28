const DEFAULT_SOUND_CONFIG = {
  newOrder: {
    enabled: true,
    volume: 0.8,
    loop: true,
    interval: 3000,
  },
  orderAccepted: {
    enabled: true,
    volume: 0.6,
    loop: false,
  },
  vibration: {
    enabled: true,
    pattern: [200, 100, 200],
  },
}

let audioContext = null
let notificationIntervals = new Map()
let currentNotifications = new Map()

function initAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

function playTone(frequency, duration, type = 'sine', volume = 0.5) {
  return new Promise((resolve) => {
    const ctx = initAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
    
    oscillator.onended = resolve
  })
}

function playNewOrderSound(config = {}) {
  const settings = { ...DEFAULT_SOUND_CONFIG.newOrder, ...config }
  if (!settings.enabled) return
  
  const playPattern = async () => {
    await playTone(880, 0.15, 'sine', settings.volume)
    await sleep(100)
    await playTone(880, 0.15, 'sine', settings.volume)
    await sleep(100)
    await playTone(880, 0.3, 'sine', settings.volume)
  }
  
  playPattern()
  
  if (settings.loop) {
    const intervalId = setInterval(playPattern, settings.interval)
    notificationIntervals.set('newOrder', intervalId)
  }
}

function playOrderAcceptedSound(config = {}) {
  const settings = { ...DEFAULT_SOUND_CONFIG.orderAccepted, ...config }
  if (!settings.enabled) return
  
  const playPattern = async () => {
    await playTone(523, 0.1, 'sine', settings.volume)
    await sleep(50)
    await playTone(659, 0.1, 'sine', settings.volume)
    await sleep(50)
    await playTone(784, 0.3, 'sine', settings.volume)
  }
  
  playPattern()
}

function playErrorSound(config = {}) {
  const settings = { volume: 0.5, ...config }
  
  const playPattern = async () => {
    await playTone(200, 0.2, 'square', settings.volume)
    await sleep(100)
    await playTone(150, 0.2, 'square', settings.volume)
  }
  
  playPattern()
}

function vibrate(pattern = DEFAULT_SOUND_CONFIG.vibration.pattern) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
    return true
  }
  return false
}

function triggerNewOrderAlert() {
  playNewOrderSound()
  if (DEFAULT_SOUND_CONFIG.vibration.enabled) {
    vibrate([200, 100, 200, 100, 200])
  }
}

function stopNewOrderAlert() {
  const intervalId = notificationIntervals.get('newOrder')
  if (intervalId) {
    clearInterval(intervalId)
    notificationIntervals.delete('newOrder')
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function updateNotificationSettings(settings) {
  if (settings.newOrder) {
    Object.assign(DEFAULT_SOUND_CONFIG.newOrder, settings.newOrder)
  }
  if (settings.vibration) {
    Object.assign(DEFAULT_SOUND_CONFIG.vibration, settings.vibration)
  }
}

function getNotificationSettings() {
  return {
    sound: { ...DEFAULT_SOUND_CONFIG.newOrder },
    vibration: { ...DEFAULT_SOUND_CONFIG.vibration },
  }
}

function showInAppNotification(title, message, type = 'info') {
  const notification = {
    id: Date.now(),
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false,
  }
  
  currentNotifications.set(notification.id, notification)
  
  return notification
}

function markNotificationAsRead(notificationId) {
  const notification = currentNotifications.get(notificationId)
  if (notification) {
    notification.read = true
  }
}

function getUnreadNotifications() {
  return Array.from(currentNotifications.values()).filter(n => !n.read)
}

export {
  DEFAULT_SOUND_CONFIG,
  initAudioContext,
  playTone,
  playNewOrderSound,
  playOrderAcceptedSound,
  playErrorSound,
  vibrate,
  triggerNewOrderAlert,
  stopNewOrderAlert,
  updateNotificationSettings,
  getNotificationSettings,
  showInAppNotification,
  markNotificationAsRead,
  getUnreadNotifications,
}
