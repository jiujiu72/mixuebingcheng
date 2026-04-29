<template>
  <div class="map-view-container">
    <div ref="mapElement" class="map-element"></div>
    
    <div v-if="showInfo" class="map-info-overlay">
      <div class="distance-info">
        <span class="distance">
          <el-icon><Location /></el-icon>
          {{ formattedDistance }}
        </span>
        <span class="time">
          <el-icon><Timer /></el-icon>
          预计 {{ formattedTime }}
        </span>
      </div>
    </div>

    <div v-if="showControls" class="map-controls-overlay">
      <div class="navigation-controls">
        <span class="label">导航方式:</span>
        <el-radio-group v-model="localNavigationPreference" size="small" @change="handleNavigationChange">
          <el-radio-button
            v-for="pref in navigationOptions"
            :key="pref.key"
            :value="pref.key"
          >
            <span class="nav-icon">{{ pref.icon }}</span>
            {{ pref.name }}
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Location, Timer } from '@element-plus/icons-vue'
import { MAP_CONFIG, NAVIGATION_PREFERENCES, formatDistance, formatTime } from '../utils/mapService'

const props = defineProps({
  startLat: { type: Number, default: MAP_CONFIG.SHOP_LOCATION.lat },
  startLng: { type: Number, default: MAP_CONFIG.SHOP_LOCATION.lng },
  endLat: { type: Number, default: 39.9042 },
  endLng: { type: Number, default: 116.4074 },
  deliveryManLat: { type: Number, default: null },
  deliveryManLng: { type: Number, default: null },
  navigationPreference: { type: String, default: 'CYCLING' },
  distance: { type: Number, default: 0 },
  estimatedTime: { type: Number, default: 0 },
  showInfo: { type: Boolean, default: true },
  showControls: { type: Boolean, default: false },
  startAddress: { type: String, default: '起点' },
  endAddress: { type: String, default: '终点' },
  isNavigationMode: { type: Boolean, default: false }
})

const emit = defineEmits(['update:navigationPreference', 'navigationChange'])

const mapElement = ref(null)
const map = ref(null)
const startMarker = ref(null)
const endMarker = ref(null)
const deliveryManMarker = ref(null)
const routePolyline = ref(null)
const localNavigationPreference = ref(props.navigationPreference)

const navigationOptions = computed(() => {
  return Object.entries(NAVIGATION_PREFERENCES).map(([key, value]) => ({
    key,
    name: value.name,
    icon: value.icon,
  }))
})

const currentPreferenceData = computed(() => {
  return NAVIGATION_PREFERENCES[localNavigationPreference.value] || NAVIGATION_PREFERENCES.CYCLING
})

const formattedDistance = computed(() => formatDistance(props.distance))
const formattedTime = computed(() => formatTime(props.estimatedTime))

const routeColor = computed(() => currentPreferenceData.value.routeColors[0])

const initMap = () => {
  if (!mapElement.value || map.value) return

  const centerLat = (props.startLat + props.endLat) / 2
  const centerLng = (props.startLng + props.endLng) / 2

  map.value = L.map(mapElement.value, {
    zoomControl: !props.isNavigationMode,
    attributionControl: false
  }).setView([centerLat, centerLng], 14)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map.value)

  updateMarkers()
  updateRoute()
}

const updateMarkers = () => {
  if (!map.value) return

  if (startMarker.value) {
    map.value.removeLayer(startMarker.value)
  }

  if (endMarker.value) {
    map.value.removeLayer(endMarker.value)
  }

  if (deliveryManMarker.value) {
    map.value.removeLayer(deliveryManMarker.value)
  }

  const startIcon = L.divIcon({
    className: 'custom-marker start-marker',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background: #10b981;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        color: white;
      ">起</div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })

  const endIcon = L.divIcon({
    className: 'custom-marker end-marker',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background: #f97316;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        color: white;
      ">终</div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })

  startMarker.value = L.marker([props.startLat, props.startLng], { icon: startIcon })
    .addTo(map.value)
    .bindPopup(`<b>${props.startAddress}</b>`)

  endMarker.value = L.marker([props.endLat, props.endLng], { icon: endIcon })
    .addTo(map.value)
    .bindPopup(`<b>${props.endAddress}</b>`)

  if (props.deliveryManLat !== null && props.deliveryManLng !== null) {
    const deliveryManIcon = L.divIcon({
      className: 'custom-marker delivery-man-marker',
      html: `
        <div style="
          width: 40px;
          height: 40px;
          background: ${routeColor.value};
          border: 4px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          animation: pulse 2s infinite;
        ">🛵</div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    })

    deliveryManMarker.value = L.marker([props.deliveryManLat, props.deliveryManLng], { 
      icon: deliveryManIcon,
      zIndexOffset: 1000
    })
      .addTo(map.value)
      .bindPopup('<b>配送员位置</b>')
  }

  const bounds = L.latLngBounds([
    [props.startLat, props.startLng],
    [props.endLat, props.endLng]
  ])

  if (props.deliveryManLat !== null && props.deliveryManLng !== null) {
    bounds.extend([props.deliveryManLat, props.deliveryManLng])
  }

  map.value.fitBounds(bounds, { padding: [50, 50] })
}

const updateRoute = async () => {
  if (!map.value) return

  if (routePolyline.value) {
    map.value.removeLayer(routePolyline.value)
  }

  const routePoints = await getRouteFromAPI(
    props.startLat, props.startLng,
    props.endLat, props.endLng,
    localNavigationPreference.value
  )

  if (routePoints && routePoints.length > 0) {
    routePolyline.value = L.polyline(routePoints, {
      color: routeColor.value,
      weight: 6,
      opacity: 0.8,
      lineJoin: 'round',
      lineCap: 'round'
    }).addTo(map.value)
  } else {
    const latlngs = [
      [props.startLat, props.startLng],
      [props.endLat, props.endLng]
    ]
    
    routePolyline.value = L.polyline(latlngs, {
      color: routeColor.value,
      weight: 6,
      opacity: 0.8,
      dashArray: '10, 10'
    }).addTo(map.value)
  }
}

const getRouteFromAPI = async (startLat, startLng, endLat, endLng, preference) => {
  try {
    const profile = getOSRMProfile(preference)
    const url = `https://router.project-osrm.org/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
    
    const response = await fetch(url)
    if (!response.ok) {
      console.warn('OSRM API request failed, using fallback route')
      return null
    }
    
    const data = await response.json()
    
    if (data.routes && data.routes.length > 0) {
      const coordinates = data.routes[0].geometry.coordinates
      return coordinates.map(coord => [coord[1], coord[0]])
    }
    
    return null
  } catch (error) {
    console.warn('Failed to get route from API:', error)
    return null
  }
}

const getOSRMProfile = (preference) => {
  const profileMap = {
    'CYCLING': 'bike',
    'DRIVING': 'driving',
    'WALKING': 'foot'
  }
  return profileMap[preference] || 'bike'
}

const handleNavigationChange = (value) => {
  localNavigationPreference.value = value
  emit('update:navigationPreference', value)
  emit('navigationChange', value)
  nextTick(() => {
    updateRoute()
    updateMarkers()
  })
}

const updateDeliveryManPosition = () => {
  if (!map.value || !deliveryManMarker.value) return
  
  if (props.deliveryManLat !== null && props.deliveryManLng !== null) {
    const newPos = [props.deliveryManLat, props.deliveryManLng]
    deliveryManMarker.value.setLatLng(newPos)
    
    if (props.isNavigationMode) {
      map.value.setView(newPos, 16, { animate: true })
    }
  }
}

watch([() => props.startLat, () => props.startLng, () => props.endLat, () => props.endLng], () => {
  updateMarkers()
  updateRoute()
}, { deep: true })

watch([() => props.deliveryManLat, () => props.deliveryManLng], () => {
  updateDeliveryManPosition()
}, { deep: true })

watch(() => props.navigationPreference, (newVal) => {
  localNavigationPreference.value = newVal
  nextTick(() => {
    updateRoute()
    updateMarkers()
  })
})

watch(() => props.isNavigationMode, (newVal) => {
  if (map.value) {
    if (newVal) {
      map.value.removeControl(map.value.zoomControl)
    }
  }
})

onMounted(() => {
  nextTick(() => {
    initMap()
  })
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})

defineExpose({
  getMap: () => map.value,
  fitBounds: (bounds) => {
    if (map.value) {
      map.value.fitBounds(bounds)
    }
  },
  setView: (lat, lng, zoom) => {
    if (map.value) {
      map.value.setView([lat, lng], zoom)
    }
  }
})
</script>

<style scoped>
.map-view-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 300px;
  border-radius: 12px;
  overflow: hidden;
}

.map-element {
  width: 100%;
  height: 100%;
  min-height: 300px;
  background: #f0f0f0;
}

.map-info-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 1000;
}

.map-controls-overlay {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  z-index: 1000;
}

.distance-info {
  display: flex;
  gap: 16px;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.distance-info .distance,
.distance-info .time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #334155;
  font-weight: 500;
}

.navigation-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.navigation-controls .label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.nav-icon {
  margin-right: 4px;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

:deep(.leaflet-control-attribution) {
  font-size: 10px;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}

:deep(.leaflet-popup-tip) {
  background: white;
}
</style>
