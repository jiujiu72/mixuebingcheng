<template>
  <div class="user-reviews-container">
    <header class="reviews-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">我的评价</h1>
      </div>
    </header>

    <div class="reviews-tabs">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="待评价" name="pending">
          <div class="pending-section">
            <div class="pending-list">
              <div
                v-for="order in pendingOrders"
                :key="order.id"
                class="order-card"
              >
                <div class="order-header">
                  <span class="order-id">{{ order.id }}</span>
                  <el-tag type="warning" size="small">待评价</el-tag>
                </div>

                <div class="order-items">
                  <div
                    v-for="(item, index) in order.items"
                    :key="index"
                    class="order-item"
                  >
                    <span class="item-name">{{ item.name }}</span>
                    <span class="item-quantity">x{{ item.quantity }}</span>
                    <span class="item-price">¥{{ item.price }}</span>
                  </div>
                </div>

                <div class="order-footer">
                  <div class="order-info">
                    <span class="order-time">下单时间：{{ order.orderTime }}</span>
                    <span class="order-total">合计：<span class="price">¥{{ order.actualPrice }}</span></span>
                  </div>
                  <el-button type="primary" size="small" @click="openReviewDialog(order)">
                    去评价
                  </el-button>
                </div>
              </div>

              <div v-if="pendingOrders.length === 0" class="empty-state">
                <div class="empty-icon">
                  <el-icon :size="80"><Document /></el-icon>
                </div>
                <p class="empty-text">暂无可评价的订单</p>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="已评价" name="completed">
          <div class="completed-section">
            <div class="reviews-list">
              <div
                v-for="review in userReviews"
                :key="review.id"
                class="review-card"
              >
                <div class="review-header">
                  <div class="review-order">
                    <span class="order-id">订单号：{{ review.orderId }}</span>
                    <span class="review-time">{{ review.createTime }}</span>
                  </div>
                  <div class="review-rating">
                    <el-rate 
                      v-model="review.rating" 
                      disabled 
                      :show-text="true"
                      text-color="#ff6700"
                    />
                  </div>
                </div>

                <div class="review-content">
                  <div class="rating-details">
                    <div class="rating-item">
                      <span class="rating-label">商品评分</span>
                      <el-rate 
                        v-model="review.foodRating" 
                        disabled 
                        :show-text="true"
                        text-color="#ff6700"
                      />
                    </div>
                    <div class="rating-item" v-if="review.deliveryManId">
                      <span class="rating-label">配送评分</span>
                      <el-rate 
                        v-model="review.deliveryRating" 
                        disabled 
                        :show-text="true"
                        text-color="#ff6700"
                      />
                    </div>
                  </div>

                  <div class="review-text">
                    {{ review.content }}
                  </div>

                  <div v-if="review.images && review.images.length > 0" class="review-images">
                    <div
                      v-for="(image, index) in review.images"
                      :key="index"
                      class="review-image"
                      @click="previewImage(image)"
                    >
                      <img :src="image" :alt="`评价图片${index + 1}`" />
                    </div>
                  </div>

                  <div v-if="review.isAnonymous" class="anonymous-badge">
                    <el-tag type="info" size="small">匿名评价</el-tag>
                  </div>
                </div>

                <div v-if="review.replyContent" class="review-reply">
                  <div class="reply-header">
                    <span class="reply-label">商家回复</span>
                    <span class="reply-time">{{ review.replyTime }}</span>
                  </div>
                  <div class="reply-content">{{ review.replyContent }}</div>
                </div>
              </div>

              <div v-if="userReviews.length === 0" class="empty-state">
                <div class="empty-icon">
                  <el-icon :size="80"><ChatDotRound /></el-icon>
                </div>
                <p class="empty-text">暂无已评价的订单</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      v-model="reviewDialogVisible"
      title="发表评价"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="reviewForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="订单商品">
          <div class="review-order-items">
            <div
              v-for="(item, index) in currentOrder?.items"
              :key="index"
              class="review-order-item"
            >
              <span class="item-name">{{ item.name }}</span>
              <span class="item-quantity">x{{ item.quantity }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="整体评分" prop="rating">
          <el-rate v-model="reviewForm.rating" :show-text="true" text-color="#ff6700" />
        </el-form-item>

        <el-form-item label="商品评分" prop="foodRating">
          <el-rate v-model="reviewForm.foodRating" :show-text="true" text-color="#ff6700" />
        </el-form-item>

        <el-form-item label="配送评分" prop="deliveryRating" v-if="currentOrder?.deliveryManId">
          <el-rate v-model="reviewForm.deliveryRating" :show-text="true" text-color="#ff6700" />
        </el-form-item>

        <el-form-item label="评价内容" prop="content">
          <el-input
            v-model="reviewForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入您的评价内容..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="上传图片">
          <el-upload
            class="image-uploader"
            action="#"
            :auto-upload="false"
            :on-change="handleImageChange"
            :on-remove="handleImageRemove"
            :file-list="reviewForm.images"
            :limit="5"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">最多上传5张图片</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="匿名评价">
          <el-switch v-model="reviewForm.isAnonymous" :active-text="是" :inactive-text="否" />
          <span class="switch-tip">匿名评价后，其他用户将无法看到您的昵称</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview" :loading="submitLoading">
          提交评价
        </el-button>
      </template>
    </el-dialog>

    <el-image-viewer
      v-if="imageViewerVisible"
      :url-list="previewImages"
      :initial-index="previewImageIndex"
      @close="imageViewerVisible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, 
  Document, 
  ChatDotRound, 
  Plus 
} from '@element-plus/icons-vue'
import { 
  mockReviews, 
  mockOrders, 
  mockDeliveryMen 
} from '../../../data/mockData'

const router = useRouter()
const activeTab = ref('pending')
const reviewDialogVisible = ref(false)
const currentOrder = ref(null)
const formRef = ref(null)
const submitLoading = ref(false)
const imageViewerVisible = ref(false)
const previewImages = ref([])
const previewImageIndex = ref(0)

const reviewForm = ref({
  rating: 5,
  foodRating: 5,
  deliveryRating: 5,
  content: '',
  images: [],
  isAnonymous: false
})

const rules = {
  rating: [
    { required: true, message: '请给出整体评分', trigger: 'change' }
  ],
  foodRating: [
    { required: true, message: '请给出商品评分', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 5, message: '评价内容不少于5个字符', trigger: 'blur' }
  ]
}

const currentUser = computed(() => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
})

const userReviews = computed(() => {
  return mockReviews
    .filter(r => r.userId === 1)
    .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    .map(review => ({
      ...review,
      deliveryManInfo: mockDeliveryMen.find(d => d.id === review.deliveryManId)
    }))
})

const pendingOrders = computed(() => {
  return mockOrders
    .filter(o => o.userId === 1 && o.status === 4)
    .filter(o => !mockReviews.some(r => r.orderId === o.id))
    .sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime))
})

const goBack = () => {
  router.back()
}

const openReviewDialog = (order) => {
  currentOrder.value = order
  reviewForm.value = {
    rating: 5,
    foodRating: 5,
    deliveryRating: 5,
    content: '',
    images: [],
    isAnonymous: false
  }
  reviewDialogVisible.value = true
}

const handleImageChange = (file, fileList) => {
  reviewForm.value.images = fileList
}

const handleImageRemove = (file, fileList) => {
  reviewForm.value.images = fileList
}

const submitReview = async () => {
  if (!formRef.value || !currentOrder.value) return

  try {
    await formRef.value.validate()
    
    submitLoading.value = true

    setTimeout(() => {
      const newReview = {
        id: Math.max(...mockReviews.map(r => r.id), 0) + 1,
        orderId: currentOrder.value.id,
        userId: 1,
        deliveryManId: currentOrder.value.deliveryManId || null,
        rating: reviewForm.value.rating,
        foodRating: reviewForm.value.foodRating,
        deliveryRating: reviewForm.value.deliveryRating,
        content: reviewForm.value.content,
        images: reviewForm.value.images.map(img => img.url || `https://via.placeholder.com/200x150?text=评价图片`),
        isAnonymous: reviewForm.value.isAnonymous ? 1 : 0,
        createTime: new Date().toLocaleString(),
        replyContent: null,
        replyTime: null
      }

      mockReviews.unshift(newReview)

      submitLoading.value = false
      reviewDialogVisible.value = false
      currentOrder.value = null
      ElMessage.success('评价提交成功！')
    }, 1000)
  } catch {}
}

const previewImage = (image) => {
  previewImages.value = [image]
  previewImageIndex.value = 0
  imageViewerVisible.value = true
}
</script>

<style scoped>
.user-reviews-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.reviews-header {
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

.reviews-tabs {
  flex: 1;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

:deep(.el-tabs__nav-wrap) {
  margin-bottom: 20px;
}

.pending-section,
.completed-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.pending-list,
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.order-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.order-id {
  font-size: 14px;
  color: #64748b;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
}

.order-item .item-name {
  flex: 1;
  font-size: 14px;
  color: #334155;
}

.order-item .item-quantity {
  font-size: 13px;
  color: #64748b;
}

.order-item .item-price {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-time {
  font-size: 13px;
  color: #94a3b8;
}

.order-total {
  font-size: 14px;
  color: #64748b;
}

.order-total .price {
  font-size: 16px;
  font-weight: 700;
  color: #ef4444;
}

.review-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.review-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.review-order {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.review-order .order-id {
  font-size: 14px;
  color: #64748b;
}

.review-time {
  font-size: 13px;
  color: #94a3b8;
}

.review-rating {
  display: flex;
  align-items: center;
}

.review-content {
  margin-bottom: 12px;
}

.rating-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.rating-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-label {
  font-size: 14px;
  color: #64748b;
}

.review-text {
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.review-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.review-image:hover {
  border-color: #667eea;
  transform: scale(1.05);
}

.review-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.anonymous-badge {
  margin-bottom: 8px;
}

.review-reply {
  background: #f0f4ff;
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid #667eea;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.reply-label {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.reply-time {
  font-size: 12px;
  color: #94a3b8;
}

.reply-content {
  font-size: 14px;
  color: #334155;
  line-height: 1.6;
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

.empty-text {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

.review-order-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.review-order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.review-order-item .item-name {
  flex: 1;
  font-size: 14px;
  color: #334155;
}

.review-order-item .item-quantity {
  font-size: 13px;
  color: #64748b;
}

.image-uploader {
  width: 100%;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}

.switch-tip {
  margin-left: 12px;
  font-size: 13px;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .reviews-header {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .reviews-tabs {
    padding: 16px;
  }

  .pending-section,
  .completed-section {
    padding: 16px;
  }

  .order-card,
  .review-card {
    padding: 12px;
  }

  .order-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .rating-details {
    flex-direction: column;
    gap: 8px;
  }

  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>