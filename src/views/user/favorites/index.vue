<template>
  <div class="user-favorites-container">
    <header class="favorites-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">我的收藏</h1>
        <el-tag type="primary" size="small">{{ favorites.length }} 件商品</el-tag>
      </div>
      <el-button 
        v-if="favorites.length > 0" 
        type="danger" 
        text
        @click="handleClearAll"
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
          class="favorite-card"
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
                  type="danger" 
                  text 
                  size="small"
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
        <div class="empty-icon">
          <el-icon :size="80"><Star /></el-icon>
        </div>
        <p class="empty-title">暂无收藏商品</p>
        <p class="empty-text">快去收藏喜欢的菜品吧~</p>
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
.user-favorites-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.favorites-header {
  background: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.favorites-main {
  flex: 1;
  padding: 20px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.favorite-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.favorite-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.card-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f1f5f9;
  cursor: pointer;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.favorite-card:hover .card-image img {
  transform: scale(1.05);
}

.favorite-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

.card-content {
  padding: 16px;
}

.item-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px 0;
}

.item-description {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.current-price {
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
}

.original-price {
  font-size: 13px;
  color: #94a3b8;
  text-decoration: line-through;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  color: #cbd5e1;
  margin-bottom: 24px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 8px 0;
}

.empty-text {
  font-size: 14px;
  color: #94a3b8;
  margin: 0 0 20px 0;
}

.mobile-cart-button {
  display: none;
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-cart-button :deep(svg) {
  width: 28px;
  height: 28px;
  color: white;
}

.mobile-cart-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .favorites-header {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .header-left {
    flex-wrap: wrap;
    width: 100%;
  }

  .favorites-main {
    padding: 16px;
  }

  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .card-image {
    height: 140px;
  }

  .card-content {
    padding: 12px;
  }

  .item-name {
    font-size: 14px;
  }

  .current-price {
    font-size: 16px;
  }

  .card-footer {
    flex-direction: column;
    gap: 12px;
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