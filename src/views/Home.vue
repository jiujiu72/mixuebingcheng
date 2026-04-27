<template>
  <div class="home-container">
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="header-title">
          <h1>美味点餐系统</h1>
          <p>欢迎，{{ username }}</p>
        </div>
      </div>
      
      <div class="header-right">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索菜品..."
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="header-actions">
          <el-button type="primary" text @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            退出
          </el-button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="content-wrapper">
        <div class="menu-section">
          <div class="category-tabs">
            <div
              v-for="category in categories"
              :key="category.id"
              :class="['category-tab', { active: activeCategory === category.id }]"
              @click="activeCategory = category.id"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
            </div>
          </div>

          <div class="menu-grid">
            <div
              v-for="item in filteredMenuItems"
              :key="item.id"
              class="menu-card"
              @click="addToCart(item)"
            >
              <div class="card-image">
                <img :src="item.image" :alt="item.name" />
                <div v-if="item.hot" class="hot-badge">
                  <span>热销</span>
                </div>
                <div v-if="item.new" class="new-badge">
                  <span>新品</span>
                </div>
              </div>
              
              <div class="card-content">
                <h3 class="item-name">{{ item.name }}</h3>
                <p class="item-description">{{ item.description }}</p>
                
                <div class="card-footer">
                  <div class="price-section">
                    <span class="current-price">¥{{ item.price }}</span>
                    <span v-if="item.originalPrice" class="original-price">¥{{ item.originalPrice }}</span>
                  </div>
                  
                  <div class="quantity-section">
                    <el-button
                      v-if="getCartQuantity(item.id) > 0"
                      size="small"
                      circle
                      @click.stop="removeFromCart(item)"
                    >
                      <el-icon><Minus /></el-icon>
                    </el-button>
                    
                    <span v-if="getCartQuantity(item.id) > 0" class="quantity-number">
                      {{ getCartQuantity(item.id) }}
                    </span>
                    
                    <el-button
                      size="small"
                      circle
                      type="primary"
                      @click.stop="addToCart(item)"
                    >
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="cart-section" ref="cartSection">
          <div class="cart-header">
            <div class="cart-title">
              <el-icon><ShoppingCart /></el-icon>
              <span>购物车</span>
            </div>
            <el-button
              v-if="cartItems.length > 0"
              type="danger"
              text
              size="small"
              @click="clearCart"
            >
              清空
            </el-button>
          </div>

          <div v-if="cartItems.length === 0" class="cart-empty">
            <div class="empty-icon">
              <el-icon :size="64"><ShoppingCart /></el-icon>
            </div>
            <p>购物车是空的</p>
            <span>快去挑选美食吧~</span>
          </div>

          <div v-else class="cart-items">
            <div
              v-for="(item, index) in cartItems"
              :key="item.id"
              class="cart-item"
              :style="{ animationDelay: `${index * 0.05}s` }"
            >
              <div class="cart-item-info">
                <h4 class="cart-item-name">{{ item.name }}</h4>
                <span class="cart-item-price">¥{{ item.price }}</span>
              </div>
              
              <div class="cart-item-actions">
                <el-button
                  size="small"
                  circle
                  @click="removeFromCart(item)"
                >
                  <el-icon><Minus /></el-icon>
                </el-button>
                <span class="cart-item-quantity">{{ item.quantity }}</span>
                <el-button
                  size="small"
                  circle
                  type="primary"
                  @click="addToCart(item)"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <div v-if="cartItems.length > 0" class="cart-footer">
            <div class="cart-summary">
              <div class="summary-row">
                <span>商品数量</span>
                <span>{{ totalQuantity }} 件</span>
              </div>
              <div class="summary-row total">
                <span>合计</span>
                <span class="total-price">¥{{ totalPrice }}</span>
              </div>
            </div>
            
            <el-button
              type="primary"
              size="large"
              class="submit-button"
              @click="submitOrder"
            >
              提交订单
            </el-button>
          </div>
        </div>
      </div>
    </main>

    <div class="mobile-cart-button" v-if="cartItems.length > 0" @click="showMobileCart = true">
      <el-icon><ShoppingCart /></el-icon>
      <span class="mobile-cart-count">{{ totalQuantity }}</span>
      <span class="mobile-cart-total">¥{{ totalPrice }}</span>
    </div>

    <el-drawer
      v-model="showMobileCart"
      title="购物车"
      direction="btt"
      :size="60"
      class="mobile-cart-drawer"
    >
      <div v-if="cartItems.length === 0" class="cart-empty">
        <div class="empty-icon">
          <el-icon :size="48"><ShoppingCart /></el-icon>
        </div>
        <p>购物车是空的</p>
      </div>

      <div v-else class="cart-items mobile-cart-items">
        <div
          v-for="item in cartItems"
          :key="item.id"
          class="cart-item"
        >
          <div class="cart-item-info">
            <h4 class="cart-item-name">{{ item.name }}</h4>
            <span class="cart-item-price">¥{{ item.price }}</span>
          </div>
          
          <div class="cart-item-actions">
            <el-button
              size="small"
              circle
              @click="removeFromCart(item)"
            >
              <el-icon><Minus /></el-icon>
            </el-button>
            <span class="cart-item-quantity">{{ item.quantity }}</span>
            <el-button
              size="small"
              circle
              type="primary"
              @click="addToCart(item)"
            >
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <div v-if="cartItems.length > 0" class="cart-footer">
        <div class="cart-summary">
          <div class="summary-row total">
            <span>合计</span>
            <span class="total-price">¥{{ totalPrice }}</span>
          </div>
        </div>
        
        <el-button
          type="primary"
          size="large"
          class="submit-button"
          @click="submitOrder"
        >
          提交订单
        </el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, SwitchButton, ShoppingCart, Plus, Minus 
} from '@element-plus/icons-vue'

const router = useRouter()
const searchKeyword = ref('')
const activeCategory = ref('all')
const cartItems = ref([])
const showMobileCart = ref(false)

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const username = computed(() => user.value.username || '游客')

const categories = [
  { id: 'all', name: '全部', icon: '🍔' },
  { id: 'burger', name: '汉堡', icon: '🍔' },
  { id: 'drink', name: '饮品', icon: '🥤' },
  { id: 'snack', name: '小食', icon: '🍟' },
  { id: 'dessert', name: '甜点', icon: '🍨' },
  { id: 'set', name: '套餐', icon: '🍱' }
]

const menuItems = [
  {
    id: 1,
    name: '经典牛肉汉堡',
    description: '100%纯牛肉饼，新鲜生菜，秘制酱料',
    price: 28,
    originalPrice: 35,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20beef%20burger%20with%20lettuce%20and%20tomato%20on%20white%20background%20product%20photography&image_size=square',
    category: 'burger',
    hot: true,
    new: false
  },
  {
    id: 2,
    name: '双层芝士汉堡',
    description: '双层牛肉饼，融化芝士，口感丰富',
    price: 35,
    originalPrice: null,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=double%20cheese%20burger%20with%20melted%20cheese%20product%20photography%20white%20background&image_size=square',
    category: 'burger',
    hot: true,
    new: true
  },
  {
    id: 3,
    name: '香辣鸡腿堡',
    description: '酥脆鸡腿肉，香辣酱，爽辣过瘾',
    price: 32,
    originalPrice: 38,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spicy%20chicken%20burger%20crispy%20chicken%20fillet%20product%20photography%20white%20background&image_size=square',
    category: 'burger',
    hot: false,
    new: false
  },
  {
    id: 4,
    name: '珍珠奶茶',
    description: 'Q弹珍珠，香浓奶茶，经典口味',
    price: 15,
    originalPrice: null,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bubble%20tea%20with%20tapioca%20pearls%20in%20clear%20cup%20product%20photography%20white%20background&image_size=square',
    category: 'drink',
    hot: true,
    new: false
  },
  {
    id: 5,
    name: '芒果冰沙',
    description: '新鲜芒果，冰爽细腻，夏日首选',
    price: 18,
    originalPrice: 22,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mango%20smoothie%20with%20fresh%20mango%20slices%20product%20photography%20white%20background&image_size=square',
    category: 'drink',
    hot: false,
    new: true
  },
  {
    id: 6,
    name: '柠檬气泡水',
    description: '清新柠檬，清爽气泡，解腻神器',
    price: 12,
    originalPrice: null,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lemon%20sparkling%20water%20with%20fresh%20lemon%20slices%20product%20photography%20white%20background&image_size=square',
    category: 'drink',
    hot: false,
    new: false
  },
  {
    id: 7,
    name: '薯条',
    description: '金黄酥脆，外酥里嫩，配番茄酱',
    price: 10,
    originalPrice: 12,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=crispy%20golden%20french%20fries%20in%20paper%20bag%20product%20photography%20white%20background&image_size=square',
    category: 'snack',
    hot: true,
    new: false
  },
  {
    id: 8,
    name: '鸡米花',
    description: '香脆鸡块，外酥里嫩，配蘸酱',
    price: 16,
    originalPrice: null,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=crispy%20popcorn%20chicken%20in%20white%20bowl%20product%20photography%20white%20background&image_size=square',
    category: 'snack',
    hot: true,
    new: true
  },
  {
    id: 9,
    name: '洋葱圈',
    description: '金黄洋葱圈，香脆可口',
    price: 14,
    originalPrice: null,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=crispy%20onion%20rings%20stacked%20product%20photography%20white%20background&image_size=square',
    category: 'snack',
    hot: false,
    new: false
  },
  {
    id: 10,
    name: '提拉米苏',
    description: '经典意式甜点，浓郁咖啡香',
    price: 22,
    originalPrice: 28,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tiramisu%20dessert%20slice%20with%20cocoa%20powder%20product%20photography%20white%20background&image_size=square',
    category: 'dessert',
    hot: true,
    new: false
  },
  {
    id: 11,
    name: '巧克力熔岩蛋糕',
    description: '外酥内软，巧克力流心',
    price: 25,
    originalPrice: null,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chocolate%20lava%20cake%20with%20melting%20center%20product%20photography%20white%20background&image_size=square',
    category: 'dessert',
    hot: false,
    new: true
  },
  {
    id: 12,
    name: '经典套餐A',
    description: '经典汉堡 + 薯条 + 可乐',
    price: 45,
    originalPrice: 53,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=burger%20fries%20and%20cola%20meal%20set%20product%20photography%20white%20background&image_size=square',
    category: 'set',
    hot: true,
    new: false
  },
  {
    id: 13,
    name: '豪华套餐B',
    description: '双层汉堡 + 鸡米花 + 奶茶',
    price: 58,
    originalPrice: 69,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20burger%20meal%20with%20chicken%20and%20drink%20product%20photography%20white%20background&image_size=square',
    category: 'set',
    hot: false,
    new: true
  }
]

const filteredMenuItems = computed(() => {
  let items = menuItems
  
  if (activeCategory.value !== 'all') {
    items = items.filter(item => item.category === activeCategory.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    items = items.filter(item => 
      item.name.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
    )
  }
  
  return items
})

const totalQuantity = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
})

const getCartQuantity = (itemId) => {
  const item = cartItems.value.find(i => i.id === itemId)
  return item ? item.quantity : 0
}

const addToCart = (item) => {
  const existingItem = cartItems.value.find(i => i.id === item.id)
  
  if (existingItem) {
    existingItem.quantity++
  } else {
    cartItems.value.push({
      ...item,
      quantity: 1
    })
  }
  
  ElMessage.success(`已添加 ${item.name}`)
}

const removeFromCart = (item) => {
  const existingItem = cartItems.value.find(i => i.id === item.id)
  
  if (existingItem) {
    if (existingItem.quantity > 1) {
      existingItem.quantity--
    } else {
      const index = cartItems.value.findIndex(i => i.id === item.id)
      cartItems.value.splice(index, 1)
    }
  }
}

const clearCart = () => {
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    cartItems.value = []
    ElMessage.success('购物车已清空')
  }).catch(() => {
    // 用户取消
  })
}

const submitOrder = () => {
  ElMessageBox.confirm(
    `您确认要提交订单吗？\n\n共 ${totalQuantity.value} 件商品，总计 ¥${totalPrice.value}`,
    '确认订单',
    {
      confirmButtonText: '确认提交',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage.success('订单提交成功！')
    cartItems.value = []
    showMobileCart.value = false
  }).catch(() => {
    // 用户取消
  })
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('user')
    router.push('/login')
    ElMessage.success('已退出登录')
  }).catch(() => {
    // 用户取消
  })
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.logo svg {
  width: 28px;
  height: 28px;
  color: white;
}

.header-title h1 {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.header-title p {
  font-size: 13px;
  color: #64748b;
  margin: 2px 0 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box {
  width: 280px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.main-content {
  flex: 1;
  padding: 24px;
}

.content-wrapper {
  display: flex;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.menu-section {
  flex: 1;
  min-width: 0;
}

.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 20px;
  background: white;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-width: 80px;
}

.category-tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #e0e7ff;
}

.category-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.category-icon {
  font-size: 24px;
}

.category-name {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  transition: color 0.3s ease;
}

.category-tab.active .category-name {
  color: white;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.menu-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #e0e7ff;
}

.card-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f1f5f9;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.menu-card:hover .card-image img {
  transform: scale(1.05);
}

.hot-badge, .new-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.hot-badge {
  background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
  color: white;
}

.new-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  left: auto;
  right: 12px;
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

.quantity-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-number {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  min-width: 20px;
  text-align: center;
}

.cart-section {
  width: 360px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 140px);
  position: sticky;
  top: 108px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.cart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.empty-icon {
  margin-bottom: 16px;
  color: #cbd5e1;
}

.cart-empty p {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #64748b;
}

.cart-empty span {
  font-size: 13px;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.cart-items::-webkit-scrollbar {
  width: 4px;
}

.cart-items::-webkit-scrollbar-track {
  background: transparent;
}

.cart-items::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 2px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.cart-item-price {
  font-size: 14px;
  font-weight: 700;
  color: #667eea;
}

.cart-item-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-item-quantity {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  min-width: 16px;
  text-align: center;
}

.cart-footer {
  padding: 16px 20px 20px;
  border-top: 1px solid #f1f5f9;
}

.cart-summary {
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0;
}

.total-price {
  color: #667eea;
  font-size: 22px;
}

.submit-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
}

.mobile-cart-button {
  display: none;
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 14px 28px;
  border-radius: 50px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
  cursor: pointer;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-cart-button :deep(svg) {
  width: 24px;
  height: 24px;
  color: white;
}

.mobile-cart-count {
  background: white;
  color: #667eea;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
}

.mobile-cart-total {
  color: white;
  font-size: 16px;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .cart-section {
    display: none;
  }
  
  .mobile-cart-button {
    display: flex;
  }
  
  .header {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .header-right {
    width: 100%;
  }
  
  .search-box {
    flex: 1;
    width: auto;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  
  .card-image {
    height: 140px;
  }
  
  .category-tabs {
    margin-bottom: 16px;
  }
  
  .category-tab {
    padding: 8px 12px;
    min-width: 60px;
  }
  
  .category-name {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .item-name {
    font-size: 14px;
  }
  
  .current-price {
    font-size: 16px;
  }
  
  .mobile-cart-button {
    left: 16px;
    right: 16px;
    transform: none;
    justify-content: center;
  }
}

.mobile-cart-drawer {
  .el-drawer__body {
    padding: 0;
    display: flex;
    flex-direction: column;
  }
}

.mobile-cart-items {
  max-height: 40vh;
}
</style>
