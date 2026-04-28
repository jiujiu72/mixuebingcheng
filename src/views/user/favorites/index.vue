<template>
  <div class="page-container">
    <header class="page-header">
      <div class="page-header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">我的收藏</h1>
        <span v-if="favorites.length > 0" class="tag tag-primary">{{ favorites.length }} 件商品</span>
      </div>
      <el-button 
        v-if="favorites.length > 0" 
        text 
        @click="handleClearAll"
        style="color: var(--error-600)"
      >
        <el-icon><Delete /></el-icon>
        清空收藏
      </el-button>
    </header>

    <main class="favorites-main">
      <div v-if="favorites.length > 0" class="favorites-grid">
        <div
          v-for="item in favorites"
          :key="item.id"
          class="card favorite-card"
        >
          <div class="card-image" @click="goToFoodDetail(item)">
            <img :src="item.foodInfo?.image" :alt="item.foodInfo?.name" />
            <div class="favorite-badge">
              <el-icon><StarFilled /></el-icon>
            </div>
          </div>
          
          <div class="card-content">
            <h3 class="item-name">{{ item.foodInfo?.name }}</h3>
            <p class="item-description">{{ item.foodInfo?.description }}</p>
            
            <div class="card-footer">
              <div class="price-section">
                <span class="current-price">¥{{ item.foodInfo?.price }}</span>
                <span v-if="item.foodInfo?.originalPrice" class="original-price">
                  ¥{{ item.foodInfo?.originalPrice }}
                </span>
              </div>
              
              <div class="action-section">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="addToCart(item.foodInfo)"
                >
                  <el-icon><ShoppingCart /></el-icon>
                  加入购物车
                </el-button>
                <el-button 
                  text 
                  size="small"
                  style="color: var(--error-600)"
                  @click="removeFromFavorites(item)"
                >
                  <el-icon><Delete /></el-icon>
                  取消收藏
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-state-icon">
          <el-icon :size="48"><Star /></el-icon>
        </div>
        <p class="empty-state-title">暂无收藏商品</p>
        <p class="empty-state-text">快去收藏喜欢的菜品吧</p>
        <el-button type="primary" @click="goToHome">
          <el-icon><Shop /></el-icon>
          去逛逛
        </el-button>
      </div>
    </main>

    <div 
      class="mobile-cart-button" 
      v-if="cartCount > 0" 
      @click="goToCart"
    >
      <el-icon><ShoppingCart /></el-icon>
      <span class="mobile-cart-count">{{ cartCount }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, 
  Delete, 
  Star, 
  StarFilled, 
  ShoppingCart, 
  Shop 
} from '@element-plus/icons-vue'
import { 
  mockFavorites, 
  mockFoods 
} from '../../../data/mockData'

const router = useRouter()
const cartItems = ref([])

const currentUser = computed(() => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
})

const favorites = computed(() => {
  return mockFavorites
    .filter(f => f.userId === 1)
    .map(favorite => ({
      ...favorite,
      foodInfo: mockFoods.find(f => f.id === favorite.foodId) || {}
    }))
    .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
})

const cartCount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const goBack = () => {
  router.back()
}

const goToHome = () => {
  router.push('/home')
}

const goToCart = () => {
  router.push('/home')
}

const goToFoodDetail = (item) => {
  ElMessage.info('正在跳转到商品详情...')
}

const addToCart = (food) => {
  if (!food) return

  const existingItem = cartItems.value.find(i => i.id === food.id)
  
  if (existingItem) {
    existingItem.quantity++
  } else {
    cartItems.value.push({
      ...food,
      quantity: 1
    })
  }
  
  ElMessage.success(`已添加 ${food.name} 到购物车`)
}

const removeFromFavorites = (item) => {
  ElMessageBox.confirm(`确定要取消收藏"${item.foodInfo?.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = mockFavorites.findIndex(f => f.id === item.id)
    if (index > -1) {
      mockFavorites.splice(index, 1)
      ElMessage.success('已取消收藏')
    }
  }).catch(() => {})
}

const handleClearAll = () => {
  ElMessageBox.confirm('确定要清空所有收藏吗？此操作不可恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const userFavorites = mockFavorites.filter(f => f.userId === 1)
    userFavorites.forEach(favorite => {
      const index = mockFavorites.indexOf(favorite)
      if (index > -1) {
        mockFavorites.splice(index, 1)
      }
    })
    ElMessage.success('已清空所有收藏')
  }).catch(() => {})
}
</script>

<style scoped>
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  min-height: 100vh;
}

.favorites-main {
  margin-top: var(--spacing-xl);
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-xl);
}

.favorite-card {
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.favorite-card:hover {
  transform: translateY(-4px);
}

.card-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: var(--slate-100);
  cursor: pointer;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.favorite-card:hover .card-image img {
  transform: scale(1.05);
}

.favorite-badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 36px;
  height: 36px;
  background: var(--error-500);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-sm);
}

.card-content {
  padding: var(--spacing-lg);
}

.item-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.item-description {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: 0 0 var(--spacing-lg) 0;
  line-height: var(--line-height-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
}

.current-price {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-600);
}

.original-price {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  text-decoration: line-through;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  align-items: flex-end;
}

.mobile-cart-button {
  display: none;
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: var(--primary-600);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.mobile-cart-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--error-500);
  color: white;
  font-size: 12px;
  font-weight: var(--font-weight-bold);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  min-width: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .page-container {
    padding: var(--spacing-lg);
  }

  .page-header {
    margin: 0 calc(-1 * var(--spacing-lg));
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .page-header-left {
    flex-wrap: wrap;
    width: 100%;
  }

  .favorites-main {
    margin-top: var(--spacing-lg);
  }

  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--spacing-lg);
  }

  .card-image {
    height: 140px;
  }

  .card-content {
    padding: var(--spacing-md);
  }

  .item-name {
    font-size: var(--font-size-base);
  }

  .current-price {
    font-size: var(--font-size-lg);
  }

  .card-footer {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .action-section {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }

  .mobile-cart-button {
    display: flex;
  }
}

@media (max-width: 480px) {
  .favorites-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
