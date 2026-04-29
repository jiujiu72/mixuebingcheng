const MAP_CONFIG = {
  SHOP_LOCATION: { lat: 39.9042, lng: 116.4074 },
  EARTH_RADIUS: 6371,
  OSRM_BASE_URL: 'https://router.project-osrm.org',
  NOMINATIM_BASE_URL: 'https://nominatim.openstreetmap.org',
}

const NAVIGATION_PREFERENCES = {
  CYCLING: {
    name: '骑行',
    icon: '🚲',
    speed: 15,
    unit: 'km/h',
    color: '#10b981',
    routeColors: ['#10b981', '#059669'],
    osrmProfile: 'bike'
  },
  DRIVING: {
    name: '驾车',
    icon: '🚗',
    speed: 40,
    unit: 'km/h',
    color: '#6366f1',
    routeColors: ['#6366f1', '#4f46e5'],
    osrmProfile: 'driving'
  },
  WALKING: {
    name: '步行',
    icon: '🚶',
    speed: 5,
    unit: 'km/h',
    color: '#f59e0b',
    routeColors: ['#f59e0b', '#d97706'],
    osrmProfile: 'foot'
  },
}

function degToRad(deg) {
  return deg * (Math.PI / 180)
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const dLat = degToRad(lat2 - lat1)
  const dLng = degToRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return MAP_CONFIG.EARTH_RADIUS * c
}

function formatDistance(distance) {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`
  }
  return `${distance.toFixed(1)}km`
}

function calculateEstimatedTime(distance, preference = 'CYCLING') {
  const speed = NAVIGATION_PREFERENCES[preference]?.speed || 15
  const timeInHours = distance / speed
  const timeInMinutes = Math.ceil(timeInHours * 60)
  return Math.max(timeInMinutes, 5)
}

function formatTime(minutes) {
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}小时`
  }
  return `${hours}小时${remainingMinutes}分钟`
}

function generateRoutePoints(startLat, startLng, endLat, endLng, steps = 20) {
  const points = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    points.push({
      lat: startLat + (endLat - startLat) * t + (Math.random() - 0.5) * 0.002,
      lng: startLng + (endLng - startLng) * t + (Math.random() - 0.5) * 0.002,
    })
  }
  return points
}

function getAddressCoordinates(address) {
  const addressHash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const baseLat = MAP_CONFIG.SHOP_LOCATION.lat
  const baseLng = MAP_CONFIG.SHOP_LOCATION.lng
  
  const latOffset = ((addressHash % 100) / 100 - 0.5) * 0.08
  const lngOffset = ((addressHash * 17 % 100) / 100 - 0.5) * 0.1
  
  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset,
  }
}

function calculateDeliveryFee(distance, baseFee = 5, perKmFee = 2) {
  if (distance <= 2) {
    return baseFee
  }
  const extraDistance = Math.ceil(distance - 2)
  return baseFee + extraDistance * perKmFee
}

function getDirectionText(angle) {
  const directions = [
    { name: '北', min: 337.5, max: 22.5 },
    { name: '东北', min: 22.5, max: 67.5 },
    { name: '东', min: 67.5, max: 112.5 },
    { name: '东南', min: 112.5, max: 157.5 },
    { name: '南', min: 157.5, max: 202.5 },
    { name: '西南', min: 202.5, max: 247.5 },
    { name: '西', min: 247.5, max: 292.5 },
    { name: '西北', min: 292.5, max: 337.5 },
  ]
  
  for (const dir of directions) {
    if (angle >= dir.min || angle < dir.max) {
      return dir.name
    }
  }
  return '北'
}

function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLng = degToRad(lng2 - lng1)
  const y = Math.sin(dLng) * Math.cos(degToRad(lat2))
  const x = Math.cos(degToRad(lat1)) * Math.sin(degToRad(lat2)) -
    Math.sin(degToRad(lat1)) * Math.cos(degToRad(lat2)) * Math.cos(dLng)
  let bearing = Math.atan2(y, x)
  bearing = (bearing * 180 / Math.PI + 360) % 360
  return bearing
}

function generateTurnByTurn(routePoints, startAddress, endAddress) {
  if (routePoints.length < 2) return []
  
  const turns = []
  
  turns.push({
    type: 'start',
    instruction: `从 ${startAddress} 出发`,
    icon: '📍',
  })
  
  for (let i = 1; i < routePoints.length - 1; i++) {
    const prev = routePoints[i - 1]
    const curr = routePoints[i]
    const next = routePoints[i + 1]
    
    const angle1 = calculateBearing(prev.lat, prev.lng, curr.lat, curr.lng)
    const angle2 = calculateBearing(curr.lat, curr.lng, next.lat, next.lng)
    
    let angleDiff = angle2 - angle1
    if (angleDiff > 180) angleDiff -= 360
    if (angleDiff < -180) angleDiff += 360
    
    if (Math.abs(angleDiff) > 30) {
      const distance = calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng)
      const direction = angleDiff > 0 ? '右转' : '左转'
      
      turns.push({
        type: 'turn',
        instruction: `行驶 ${formatDistance(distance)} 后${direction}`,
        icon: direction === '右转' ? '↪️' : '↩️',
        distance: distance,
      })
    }
  }
  
  turns.push({
    type: 'end',
    instruction: `到达目的地 ${endAddress}`,
    icon: '🏁',
  })
  
  return turns
}

async function geocodeAddress(address) {
  try {
    const url = `${MAP_CONFIG.NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=cn`
    const response = await fetch(url)
    
    if (!response.ok) {
      console.warn('Geocoding API request failed')
      return null
    }
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      }
    }
    
    return null
  } catch (error) {
    console.warn('Failed to geocode address:', error)
    return null
  }
}

async function reverseGeocode(lat, lng) {
  try {
    const url = `${MAP_CONFIG.NOMINATIM_BASE_URL}/reverse?lat=${lat}&lon=${lng}&format=json`
    const response = await fetch(url)
    
    if (!response.ok) {
      console.warn('Reverse geocoding API request failed')
      return null
    }
    
    const data = await response.json()
    
    if (data && data.display_name) {
      return {
        displayName: data.display_name,
        address: data.address
      }
    }
    
    return null
  } catch (error) {
    console.warn('Failed to reverse geocode:', error)
    return null
  }
}

async function getRouteFromAPI(startLat, startLng, endLat, endLng, preference = 'CYCLING') {
  try {
    const profile = NAVIGATION_PREFERENCES[preference]?.osrmProfile || 'bike'
    const url = `${MAP_CONFIG.OSRM_BASE_URL}/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true&annotations=true`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.warn('OSRM API request failed')
      return null
    }
    
    const data = await response.json()
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]])
      
      const steps = []
      if (route.legs && route.legs.length > 0) {
        for (const leg of route.legs) {
          if (leg.steps) {
            for (const step of leg.steps) {
              steps.push({
                instruction: step.maneuver?.instruction || '继续行驶',
                distance: step.distance,
                duration: step.duration,
                maneuver: step.maneuver
              })
            }
          }
        }
      }
      
      return {
        coordinates,
        distance: route.distance,
        duration: route.duration,
        steps
      }
    }
    
    return null
  } catch (error) {
    console.warn('Failed to get route from API:', error)
    return null
  }
}

function updateDeliveryManLocation(deliveryManId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dm = {
        id: deliveryManId,
        lat: MAP_CONFIG.SHOP_LOCATION.lat + (Math.random() - 0.5) * 0.02,
        lng: MAP_CONFIG.SHOP_LOCATION.lng + (Math.random() - 0.5) * 0.02,
        timestamp: Date.now(),
      }
      resolve(dm)
    }, 100)
  })
}

async function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理定位'))
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        console.warn('Geolocation error:', error)
        resolve(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

function watchPosition(callback, errorCallback) {
  if (!navigator.geolocation) {
    if (errorCallback) {
      errorCallback(new Error('浏览器不支持地理定位'))
    }
    return null
  }
  
  return navigator.geolocation.watchPosition(
    (position) => {
      if (callback) {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading
        })
      }
    },
    (error) => {
      console.warn('Watch position error:', error)
      if (errorCallback) {
        errorCallback(error)
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  )
}

function clearWatch(watchId) {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId)
  }
}

export {
  MAP_CONFIG,
  NAVIGATION_PREFERENCES,
  calculateDistance,
  formatDistance,
  calculateEstimatedTime,
  formatTime,
  generateRoutePoints,
  getAddressCoordinates,
  calculateDeliveryFee,
  getDirectionText,
  calculateBearing,
  generateTurnByTurn,
  updateDeliveryManLocation,
  geocodeAddress,
  reverseGeocode,
  getRouteFromAPI,
  getCurrentPosition,
  watchPosition,
  clearWatch,
}
