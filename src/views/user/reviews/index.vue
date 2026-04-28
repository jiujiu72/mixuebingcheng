<template>
  <div class="page-container">
    <header class="page-header">
      <div class="page-header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">我的评价</h1>
      </div>
    </header>

    <div class="reviews-content">
      <el-tabs v-model="activeTab" class="reviews-tabs">
        <el-tab-pane label="待评价" name="pending">
          <div class="pending-section">
            <div class="pending-list">
              <div
                v-for="order in pendingOrders"
                :key="order.id"
                class="card card-clickable pending-card"
              >
                <div class="card-header">
                  <span class="order-id">{{ order.id }}</span>
                  <span class="badge badge-warning">待评价</span>
                </div>

                <div class="divider-dashed" style="margin: var(--spacing-md) -16px;"></div>

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

                <div class="divider" style="margin: var(--spacing-md) 0;"></div>

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
                <div class="empty-state-icon">
                  <el-icon :size="48"><Document /></el-icon>
                </div>
                <p class="empty-state-title">暂无可评价的订单</p>
                <p class="empty-state-text">完成订单后即可进行评价</p>
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
                class="card review-card"
              >
                <div class="card-header">
                  <div class="review-order">
                    <span class="order-id">订单号：{{ review.orderId }}</span>
                    <span class="review-time">{{ review.createTime }}</span>
                  </div>
                  <div class="review-rating">
                    <el-rate 
                      v-model="review.rating" 
                      disabled 
                      :show-text="true"
                      text-color="var(--warning-600)"
                    />
                  </div>
                </div>

                <div class="divider-dashed" style="margin: var(--spacing-md) -16px;"></div>

                <div class="review-content">
                  <div class="rating-details">
                    <div class="rating-item">
                      <span class="rating-label">商品评分</span>
                      <el-rate 
                        v-model="review.foodRating" 
                        disabled 
                        :show-text="true"
                        text-color="var(--warning-600)"
                      />
                    </div>
                    <div class="rating-item" v-if="review.deliveryManId">
                      <span class="rating-label">配送评分</span>
                      <el-rate 
                        v-model="review.deliveryRating" 
                        disabled 
                        :show-text="true"
                        text-color="var(--warning-600)"
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
                    <span class="tag tag-info">匿名评价</span>
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
                <div class="empty-state-icon">
                  <el-icon :size="48"><ChatDotRound /></el-icon>
                </div>
                <p class="empty-state-title">暂无已评价的订单</p>
                <p class="empty-state-text">您的评价将会帮助其他用户做出选择</p>
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
          <el-rate v-model="reviewForm.rating" :show-text="true" text-color="var(--warning-600)" />
        </el-form-item>

        <el-form-item label="商品评分" prop="foodRating">
          <el-rate v-model="reviewForm.foodRating" :show-text="true" text-color="var(--warning-600)" />
        </el-form-item>

        <el-form-item label="配送评分" prop="deliveryRating" v-if="currentOrder?.deliveryManId">
          <el-rate v-model="reviewForm.deliveryRating" :show-text="true" text-color="var(--warning-600)" />
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
.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  min-height: 100vh;
}

.reviews-content {
  margin-top: var(--spacing-xl);
}

:deep(.reviews-tabs .el-tabs__nav-wrap) {
  margin-bottom: var(--spacing-xl);
}

:deep(.reviews-tabs .el-tabs__item) {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  padding: var(--spacing-sm) var(--spacing-lg);
  height: 40px;
  line-height: 40px;
}

:deep(.reviews-tabs .el-tabs__item.is-active) {
  color: var(--primary-600);
  font-weight: var(--font-weight-medium);
}

:deep(.reviews-tabs .el-tabs__active-bar) {
  background-color: var(--primary-600);
  height: 2px;
}

:deep(.reviews-tabs .el-tabs__nav-wrap::after) {
  background-color: var(--border-primary);
  height: 1px;
}

.pending-section,
.completed-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.pending-list,
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.pending-card {
  padding: var(--spacing-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-id {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.order-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--slate-50);
  border-radius: var(--radius-md);
}

.order-item .item-name {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.order-item .item-quantity {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.order-item .item-price {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--primary-600);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.order-time {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.order-total {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.order-total .price {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--primary-600);
}

.review-card {
  padding: var(--spacing-lg);
}

.review-order {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.review-time {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.review-rating {
  display: flex;
  align-items: center;
}

.review-content {
  margin-bottom: var(--spacing-sm);
}

.rating-details {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
}

.rating-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.rating-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.review-text {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--spacing-md);
}

.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.review-image {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--border-primary);
  transition: all var(--transition-fast);
}

.review-image:hover {
  border-color: var(--primary-300);
  transform: scale(1.02);
}

.review-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.anonymous-badge {
  margin-bottom: var(--spacing-xs);
}

.review-reply {
  background: var(--slate-50);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  border-left: 3px solid var(--primary-500);
  margin-top: var(--spacing-md);
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.reply-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--primary-600);
}

.reply-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.reply-content {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  line-height: var(--line-height-relaxed);
}

.review-order-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
}

.review-order-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--slate-50);
  border-radius: var(--radius-md);
}

.review-order-item .item-name {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.review-order-item .item-quantity {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.image-uploader {
  width: 100%;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
}

.switch-tip {
  margin-left: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .page-container {
    padding: var(--spacing-lg);
  }

  .page-header {
    margin: 0 calc(-1 * var(--spacing-lg));
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .reviews-content {
    margin-top: var(--spacing-lg);
  }

  :deep(.reviews-tabs .el-tabs__item) {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-sm);
  }

  .pending-card,
  .review-card {
    padding: var(--spacing-md);
  }

  .order-footer {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }

  .order-info {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }

  .rating-details {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style>
