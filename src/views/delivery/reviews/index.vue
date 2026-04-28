<template>
  <div class="delivery-reviews">
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">我的评价</h1>
          <p class="page-subtitle">查看用户对我的评价</p>
        </div>
        <div class="rating-summary" v-if="ratingInfo">
          <div class="rating-value">
            <span class="rating-number">{{ ratingInfo.averageRating }}</span>
            <el-rate v-model="ratingInfo.averageRating" disabled show-score text-color="#ff6b00" />
          </div>
          <div class="rating-count">共 {{ ratingInfo.totalReviews }} 条评价</div>
        </div>
      </div>

      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon success">
            <el-icon :size="22"><StarFilled /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">平均评分</span>
            <span class="stat-value">{{ ratingInfo?.averageRating || 0 }} 分</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon primary">
            <el-icon :size="22"><ChatDotRound /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">总评价数</span>
            <span class="stat-value">{{ ratingInfo?.totalReviews || 0 }}</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon warning">
            <el-icon :size="22"><Check /></el-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">好评率</span>
            <span class="stat-value">{{ ratingInfo?.goodRate || 0 }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="tabs-section">
      <div class="tabs-header">
        <div
          v-for="tab in tabs"
          :key="tab.name"
          class="tab-item"
          :class="{ active: activeTab === tab.name }"
          @click="activeTab = tab.name"
        >
          <span class="tab-label">{{ tab.label }}</span>
          <el-badge v-if="getTabCount(tab.name) > 0" :value="getTabCount(tab.name)" class="tab-badge" />
        </div>
      </div>
    </div>

    <div class="reviews-container">
      <div v-if="filteredReviews.length > 0" class="reviews-list">
        <div
          v-for="review in filteredReviews"
          :key="review.id"
          class="review-card"
        >
          <div class="card-header">
            <div class="review-left">
              <div class="user-avatar">
                <el-icon :size="20"><User /></el-icon>
              </div>
              <div class="user-info">
                <div class="user-name">{{ review.userName }}</div>
                <div class="review-time">{{ review.createdAt }}</div>
              </div>
            </div>
            <div class="review-right">
              <el-tag v-if="review.isAnonymous" size="small">匿名评价</el-tag>
            </div>
          </div>

          <div class="card-body">
            <div class="review-order" v-if="review.orderId">
              <span class="order-label">订单号:</span>
              <span class="order-value">{{ review.orderId }}</span>
            </div>

            <div class="review-ratings">
              <div class="rating-item">
                <span class="rating-label">服务评分:</span>
                <el-rate v-model="review.deliveryRating" disabled />
              </div>
              <div class="rating-item">
                <span class="rating-label">配送速度:</span>
                <el-rate v-model="review.speedRating" disabled />
              </div>
            </div>

            <div class="review-content" v-if="review.deliveryComment">
              <div class="section-title">用户评价</div>
              <p class="comment-text">{{ review.deliveryComment }}</p>
            </div>

            <div class="review-images" v-if="review.images && review.images.length > 0">
              <div class="section-title">评价图片</div>
              <div class="images-list">
                <el-image
                  v-for="(img, index) in review.images"
                  :key="index"
                  :src="img"
                  :preview-src-list="review.images"
                  fit="cover"
                  class="review-image"
                />
              </div>
            </div>

            <div class="food-reviews" v-if="review.foodReviews && review.foodReviews.length > 0">
              <div class="section-title">菜品评价</div>
              <div class="food-list">
                <div v-for="(food, index) in review.foodReviews" :key="index" class="food-review-item">
                  <div class="food-name">{{ food.foodName }}</div>
                  <div class="food-rating">
                    <el-rate v-model="food.rating" disabled />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="reply-section" v-if="review.reply">
              <div class="reply-label">我的回复:</div>
              <div class="reply-text">{{ review.reply }}</div>
              <div class="reply-time">{{ review.replyTime }}</div>
            </div>
            <div class="reply-actions" v-else>
              <el-button
                type="primary"
                plain
                size="small"
                @click="showReplyDialog(review)"
              >
                <el-icon><ChatDotRound /></el-icon>
                回复评价
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon-wrapper">
          <el-icon :size="80" color="#cbd5e1"><ChatDotRound /></el-icon>
        </div>
        <h3 class="empty-title">暂无评价</h3>
        <p class="empty-text">
          {{ getEmptyMessage() }}
        </p>
      </div>
    </div>

    <el-dialog
      v-model="replyDialogVisible"
      title="回复评价"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="reply-form">
        <div class="review-preview">
          <div class="preview-label">用户评价:</div>
          <div class="preview-text">{{ currentReview?.deliveryComment || '用户未发表文字评价' }}</div>
          <div class="preview-rating" v-if="currentReview">
            <el-rate :model-value="currentReview.deliveryRating" disabled />
          </div>
        </div>
        <el-form :model="replyForm" label-position="top">
          <el-form-item label="我的回复" :rules="[{ required: true, message: '请输入回复内容', trigger: 'blur' }]">
            <el-input
              v-model="replyForm.content"
              type="textarea"
              :rows="4"
              placeholder="请输入您的回复..."
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply" :loading="isSubmitting">
          提交回复
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  User, ChatDotRound, StarFilled, Check
} from '@element-plus/icons-vue'
import { mockReviews, mockUsers, mockDeliveryManRatings } from '../../../data/mockData'

const activeTab = ref('all')
const replyDialogVisible = ref(false)
const currentReview = ref(null)
const isSubmitting = ref(false)
const replyForm = ref({
  content: ''
})

const tabs = [
  { name: 'all', label: '全部' },
  { name: 'good', label: '好评' },
  { name: 'neutral', label: '中评' },
  { name: 'bad', label: '差评' }
]

const currentDeliveryMan = computed(() => {
  const dm = localStorage.getItem('deliveryMan')
  return dm ? JSON.parse(dm) : null
})

const myReviews = computed(() => {
  if (!currentDeliveryMan.value) return []
  
  const reviews = mockReviews.filter(r => r.deliveryManId === currentDeliveryMan.value.id)
  
  return reviews.map(review => {
    const user = mockUsers.find(u => u.id === review.userId)
    return {
      ...review,
      userName: review.isAnonymous ? '匿名用户' : (user?.name || '用户')
    }
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const ratingInfo = computed(() => {
  if (!currentDeliveryMan.value) return null
  
  const rating = mockDeliveryManRatings.find(r => r.deliveryManId === currentDeliveryMan.value.id)
  if (rating) {
    return {
      averageRating: rating.averageRating,
      totalReviews: rating.totalReviews,
      goodRate: rating.goodRate
    }
  }
  
  const reviews = myReviews.value
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      goodRate: 0
    }
  }
  
  const totalRating = reviews.reduce((sum, r) => sum + r.deliveryRating, 0)
  const goodReviews = reviews.filter(r => r.deliveryRating >= 4).length
  
  return {
    averageRating: (totalRating / reviews.length).toFixed(1),
    totalReviews: reviews.length,
    goodRate: Math.round((goodReviews / reviews.length) * 100)
  }
})

const filteredReviews = computed(() => {
  let reviews = [...myReviews.value]
  
  switch (activeTab.value) {
    case 'good':
      reviews = reviews.filter(r => r.deliveryRating >= 4)
      break
    case 'neutral':
      reviews = reviews.filter(r => r.deliveryRating === 3)
      break
    case 'bad':
      reviews = reviews.filter(r => r.deliveryRating <= 2)
      break
  }
  
  return reviews
})

const getTabCount = (tabName) => {
  switch (tabName) {
    case 'good':
      return myReviews.value.filter(r => r.deliveryRating >= 4).length
    case 'neutral':
      return myReviews.value.filter(r => r.deliveryRating === 3).length
    case 'bad':
      return myReviews.value.filter(r => r.deliveryRating <= 2).length
    default:
      return 0
  }
}

const getEmptyMessage = () => {
  switch (activeTab.value) {
    case 'good':
      return '暂无好评'
    case 'neutral':
      return '暂无中评'
    case 'bad':
      return '暂无差评'
    default:
      return '您还没有收到任何评价，继续加油！'
  }
}

const showReplyDialog = (review) => {
  currentReview.value = review
  replyForm.value.content = ''
  replyDialogVisible.value = true
}

const submitReply = () => {
  if (!replyForm.value.content.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  isSubmitting.value = true
  
  setTimeout(() => {
    if (currentReview.value) {
      const index = mockReviews.findIndex(r => r.id === currentReview.value.id)
      if (index > -1) {
        mockReviews[index].reply = replyForm.value.content
        mockReviews[index].replyTime = new Date().toLocaleString()
        ElMessage.success('回复成功')
      }
    }
    
    isSubmitting.value = false
    replyDialogVisible.value = false
  }, 500)
}

watch(() => activeTab.value, () => {})
</script>

<style scoped>
.delivery-reviews {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.title-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.rating-summary {
  text-align: right;
}

.rating-value {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 4px;
}

.rating-number {
  font-size: 28px;
  font-weight: 700;
  color: #ff6b00;
}

.rating-count {
  font-size: 14px;
  color: #64748b;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: #fed7aa;
  transform: translateY(-2px);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.success {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #16a34a;
}

.stat-icon.primary {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4f46e5;
}

.stat-icon.warning {
  background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
  color: #ea580c;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.tabs-section {
  background: white;
  border-radius: 20px;
  padding: 16px 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.tabs-header {
  display: flex;
  gap: 8px;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-item:hover {
  background: #f1f5f9;
  color: #334155;
}

.tab-item.active {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}

.tab-label {
  position: relative;
}

.tab-badge {
  transform: translateY(-2px);
}

.reviews-container {
  min-height: 400px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.review-card:hover {
  border-color: #fed7aa;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
}

.review-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.review-time {
  font-size: 13px;
  color: #94a3b8;
}

.card-body {
  padding: 20px;
}

.review-order {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.order-label {
  font-size: 14px;
  color: #64748b;
}

.order-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.review-ratings {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
  border-radius: 16px;
  border: 1px solid #f1f5f9;
}

.rating-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-label {
  font-size: 14px;
  color: #64748b;
  min-width: 80px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 12px;
}

.review-content {
  margin-bottom: 16px;
}

.comment-text {
  font-size: 14px;
  line-height: 1.8;
  color: #475569;
  margin: 0;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.review-images {
  margin-bottom: 16px;
}

.images-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.review-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.review-image:hover {
  transform: scale(1.05);
}

.food-reviews {
  margin-bottom: 16px;
}

.food-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.food-review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.food-name {
  font-size: 14px;
  color: #334155;
}

.card-footer {
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
}

.reply-section {
  padding: 16px;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  border-radius: 12px;
  border-left: 4px solid #22c55e;
}

.reply-label {
  font-size: 13px;
  font-weight: 600;
  color: #166534;
  margin-bottom: 8px;
}

.reply-text {
  font-size: 14px;
  line-height: 1.6;
  color: #334155;
  margin-bottom: 8px;
}

.reply-time {
  font-size: 12px;
  color: #94a3b8;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: white;
  border-radius: 20px;
}

.empty-icon-wrapper {
  margin-bottom: 24px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 8px 0;
}

.empty-text {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
  max-width: 300px;
  line-height: 1.6;
}

.reply-form {
  padding: 10px 0;
}

.review-preview {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.preview-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.preview-text {
  font-size: 14px;
  color: #334155;
  margin-bottom: 12px;
  line-height: 1.6;
}

.preview-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .page-header {
    padding: 16px;
    border-radius: 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .rating-summary {
    text-align: left;
  }

  .stats-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .tabs-section {
    padding: 12px;
    border-radius: 16px;
  }

  .tabs-header {
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
  }

  .tabs-header::-webkit-scrollbar {
    display: none;
  }

  .tab-item {
    padding: 8px 16px;
    flex-shrink: 0;
  }

  .card-header {
    padding: 12px 16px;
  }

  .card-body {
    padding: 16px;
  }

  .review-ratings {
    flex-direction: column;
  }

  .review-image {
    width: 60px;
    height: 60px;
  }
}
</style>
