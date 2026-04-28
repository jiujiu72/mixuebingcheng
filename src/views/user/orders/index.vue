<template>
  <div class="page-container">
    <header class="page-header">
      <div class="page-header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">我的订单</h1>
      </div>
      <el-button type="primary" @click="goToHome">
        <el-icon><Plus /></el-icon>
        去点餐
      </el-button>
    </header>

    <div class="orders-content">
      <el-tabs v-model="activeTab" class="orders-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all">
          <div class="orders-list">
            <OrderCard
              v-for="order in filteredOrders"
              :key="order.id"
              :order="order"
              :status-map="orderStatusMap"
              :is-reviewed="isOrderReviewed(order.id)"
              @view-order="goToOrderDetail"
              @confirm-receive="confirmReceive"
              @go-to-tracking="goToTracking"
              @go-to-review="goToReview"
              @view-review="viewReview"
              @reorder="handleReorder"
            />

            <div v-if="filteredOrders.length === 0" class="empty-state">
              <div class="empty-state-icon">
                <el-icon :size="48"><Document /></el-icon>
              </div>
              <p class="empty-state-title">暂无订单</p>
              <p class="empty-state-text">快去添加美食到购物车吧</p>
              <el-button type="primary" @click="goToHome" style="margin-top: 16px">
                去点餐
              </el-button>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="待付款" name="pending_payment">
          <div class="orders-list">
            <OrderCard
              v-for="order in pendingPaymentOrders"
              :key="order.id"
              :order="order"
              :status-map="orderStatusMap"
              :is-reviewed="isOrderReviewed(order.id)"
              @view-order="goToOrderDetail"
              @confirm-receive="confirmReceive"
              @go-to-tracking="goToTracking"
              @go-to-review="goToReview"
              @view-review="viewReview"
              @reorder="handleReorder"
            />
            <div v-if="pendingPaymentOrders.length === 0" class="empty-status">
              <p class="empty-state-text">暂无待付款订单</p>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="待发货" name="pending_delivery">
          <div class="orders-list">
            <OrderCard
              v-for="order in pendingDeliveryOrders"
              :key="order.id"
              :order="order"
              :status-map="orderStatusMap"
              :is-reviewed="isOrderReviewed(order.id)"
              @view-order="goToOrderDetail"
              @confirm-receive="confirmReceive"
              @go-to-tracking="goToTracking"
              @go-to-review="goToReview"
              @view-review="viewReview"
              @reorder="handleReorder"
            />
            <div v-if="pendingDeliveryOrders.length === 0" class="empty-status">
              <p class="empty-state-text">暂无待发货订单</p>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="待收货" name="delivering">
          <div class="orders-list">
            <OrderCard
              v-for="order in deliveringOrders"
              :key="order.id"
              :order="order"
              :status-map="orderStatusMap"
              :is-reviewed="isOrderReviewed(order.id)"
              @view-order="goToOrderDetail"
              @confirm-receive="confirmReceive"
              @go-to-tracking="goToTracking"
              @go-to-review="goToReview"
              @view-review="viewReview"
              @reorder="handleReorder"
            />
            <div v-if="deliveringOrders.length === 0" class="empty-status">
              <p class="empty-state-text">暂无待收货订单</p>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="已完成" name="completed">
          <div class="orders-list">
            <OrderCard
              v-for="order in completedOrders"
              :key="order.id"
              :order="order"
              :status-map="orderStatusMap"
              :is-reviewed="isOrderReviewed(order.id)"
              @view-order="goToOrderDetail"
              @confirm-receive="confirmReceive"
              @go-to-tracking="goToTracking"
              @go-to-review="goToReview"
              @view-review="viewReview"
              @reorder="handleReorder"
            />
            <div v-if="completedOrders.length === 0" class="empty-status">
              <p class="empty-state-text">暂无已完成订单</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="confirmDialogVisible" title="确认收货" width="420px" :close-on-click-modal="false">
      <div class="confirm-dialog-content">
        <div class="confirm-icon">
          <el-icon :size="48" :color="var(--primary-600)"><CircleCheckFilled /></el-icon>
        </div>
        <p class="confirm-text">确认已收到订单中的所有商品吗？</p>
        <div class="confirm-order-info">
          <span class="order-id">{{ currentOrder?.id }}</span>
          <span class="order-price">¥{{ currentOrder?.actualPrice }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmReceive">确认收货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, h, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, Document, Location, Phone, 
  Clock, ChatDotRound, Plus, ChatDotRound as DeliveryTruck, 
  CircleCheckFilled, ShoppingCart
} from '@element-plus/icons-vue'
import { mockOrders, orderStatusMap, mockReviews } from '../../../data/mockData'

const router = useRouter()
const activeTab = ref('all')
const confirmDialogVisible = ref(false)
const currentOrder = ref(null)

const userOrders = computed(() => {
  return [...mockOrders].filter(o => o.userId === 1)
    .sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime))
})

const filteredOrders = computed(() => userOrders.value)

const pendingPaymentOrders = computed(() => 
  userOrders.value.filter(o => o.status === 1)
)

const pendingDeliveryOrders = computed(() => 
  userOrders.value.filter(o => o.status === 2)
)

const deliveringOrders = computed(() => 
  userOrders.value.filter(o => o.status === 3)
)

const completedOrders = computed(() => 
  userOrders.value.filter(o => o.status === 4 || o.status === 5)
)

const getStatusBadgeClass = (type) => {
  const classMap = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    primary: 'badge-primary'
  }
  return classMap[type] || 'badge-neutral'
}

const OrderCard = defineComponent({
  name: 'OrderCard',
  props: {
    order: { type: Object, required: true },
    statusMap: { type: Object, required: true },
    isReviewed: { type: Boolean, default: false }
  },
  emits: ['viewOrder', 'confirmReceive', 'goToTracking', 'goToReview', 'viewReview', 'reorder'],
  setup(props, { emit }) {
    const statusInfo = computed(() => props.statusMap[props.order.status] || { label: '未知', type: 'info' })
    
    const itemsAmount = computed(() => {
      return props.order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    })
    
    const discountAmount = computed(() => {
      return props.order.totalPrice - props.order.actualPrice
    })

    const handleViewOrder = () => emit('viewOrder', props.order)
    const handleConfirmReceive = () => emit('confirmReceive', props.order)
    const handleGoToTracking = () => emit('goToTracking', props.order)
    const handleGoToReview = () => emit('goToReview', props.order)
    const handleViewReview = () => emit('viewReview', props.order)
    const handleReorder = () => emit('reorder', props.order)

    return () => h('div', { 
      class: 'card card-clickable order-card',
      onClick: handleViewOrder
    }, [
      h('div', { class: 'order-card-header' }, [
        h('div', { class: 'order-info-top' }, [
          h('span', { class: 'order-id' }, [
            h('span', { class: 'label' }, '订单号：'),
            props.order.id
          ]),
          h('div', { class: 'order-time' }, [
            h('el-icon', { size: 14 }, h(Clock)),
            h('span', props.order.orderTime)
          ])
        ]),
        h('span', {
          class: ['badge', getStatusBadgeClass(statusInfo.value.type)]
        }, statusInfo.value.label)
      ]),

      h('div', { class: 'divider-dashed', style: { margin: 0 } }),

      h('div', { class: 'order-items-section', onClick: (e) => e.stopPropagation() }, [
        h('div', { class: 'items-list' }, 
          props.order.items.map((item, index) => 
            h('div', { 
              class: 'order-item', 
              key: index
            }, [
              h('div', { class: 'item-placeholder' }, [
                h('el-icon', { size: 20, color: 'var(--neutral-400)' }, h(ShoppingCart))
              ]),
              h('div', { class: 'item-info' }, [
                h('div', { class: 'item-name' }, item.name),
                h('div', { class: 'item-price' }, [
                  h('span', { class: 'price' }, `¥${item.price}`),
                  h('span', { class: 'multiply' }, '×'),
                  h('span', { class: 'quantity' }, item.quantity)
                ])
              ]),
              h('div', { class: 'item-subtotal' }, `¥${(item.price * item.quantity).toFixed(2)}`)
            ])
          )
        )
      ]),

      props.order.address ? h('div', { class: 'order-delivery-section', onClick: (e) => e.stopPropagation() }, [
        h('div', { class: 'divider-dashed', style: { margin: '0 -16px 12px' } }),
        h('div', { class: 'delivery-header' }, [
          h('el-icon', { size: 14, color: 'var(--primary-600)' }, h(DeliveryTruck)),
          h('span', { class: 'section-title' }, '配送信息')
        ]),
        h('div', { class: 'delivery-info' }, [
          h('div', { class: 'receiver-info' }, [
            h('span', { class: 'name' }, props.order.userName),
            h('span', { class: 'phone' }, props.order.phone)
          ]),
          h('div', { class: 'address-detail' }, props.order.address),
          props.order.remark ? h('div', { class: 'remark-row' }, [
            h('span', { class: 'remark-label' }, '备注：'),
            h('span', { class: 'remark-content' }, props.order.remark)
          ]) : null
        ])
      ]) : null,

      h('div', { class: 'order-footer', onClick: (e) => e.stopPropagation() }, [
        h('div', { class: 'price-summary' }, [
          h('span', { class: 'price-label' }, '共'),
          h('span', { class: 'item-count' }, `${props.order.items.length}`),
          h('span', { class: 'price-label' }, '件商品，实付'),
          h('span', { class: 'total-price' }, `¥${props.order.actualPrice}`)
        ]),
        h('div', { class: 'order-actions' }, [
          props.order.status === 3 ? h('el-button', {
            type: 'primary',
            size: 'small',
            onClick: handleConfirmReceive
          }, '确认收货') : null,
          
          (props.order.status === 2 || props.order.status === 3) ? h('el-button', {
            size: 'small',
            onClick: handleGoToTracking
          }, '查看配送') : null,
          
          (props.order.status === 4 && !props.isReviewed) ? h('el-button', {
            type: 'warning',
            size: 'small',
            onClick: handleGoToReview
          }, '去评价') : null,
          
          (props.order.status === 4 && props.isReviewed) ? h('el-button', {
            size: 'small',
            onClick: handleViewReview
          }, '查看评价') : null,
          
          (props.order.status === 4 || props.order.status === 5) ? h('el-button', {
            size: 'small',
            onClick: handleReorder
          }, '再来一单') : null,
          
          props.order.status === 1 ? h('el-button', {
            type: 'primary',
            size: 'small',
            onClick: handleViewOrder
          }, '立即支付') : null,
          
          props.order.status === 1 ? h('el-button', {
            size: 'small',
            onClick: () => ElMessage.info('取消订单功能开发中...')
          }, '取消订单') : null
        ])
      ])
    ])
  }
})

const goBack = () => {
  router.back()
}

const goToHome = () => {
  router.push('/home')
}

const handleTabChange = () => {
}

const goToOrderDetail = (order) => {
  router.push(`/user/tracking/${order.id}`)
}

const goToTracking = (order) => {
  router.push(`/user/tracking/${order.id}`)
}

const confirmReceive = (order) => {
  currentOrder.value = order
  confirmDialogVisible.value = true
}

const handleConfirmReceive = () => {
  if (currentOrder.value) {
    const index = mockOrders.findIndex(o => o.id === currentOrder.value.id)
    if (index > -1) {
      mockOrders[index].status = 4
      ElMessage.success('确认收货成功')
    }
  }
  confirmDialogVisible.value = false
}

const isOrderReviewed = (orderId) => {
  return mockReviews.some(r => r.orderId === orderId)
}

const goToReview = (order) => {
  router.push('/user/reviews')
}

const viewReview = (order) => {
  router.push('/user/reviews')
}

const handleReorder = (order) => {
  ElMessageBox.confirm(
    `确定要再来一单吗？\n将添加以下商品到购物车：\n${order.items.map(item => `${item.name} ×${item.quantity}`).join('\n')}`,
    '再来一单',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage.success('已添加到购物车，快去结算吧！')
    router.push('/home')
  }).catch(() => {})
}
</script>

<style scoped>
.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  min-height: 100vh;
}

.orders-content {
  margin-top: var(--spacing-xl);
}

:deep(.orders-tabs .el-tabs__nav-wrap) {
  margin-bottom: var(--spacing-xl);
}

:deep(.orders-tabs .el-tabs__item) {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  padding: var(--spacing-sm) var(--spacing-lg);
  height: 40px;
  line-height: 40px;
}

:deep(.orders-tabs .el-tabs__item.is-active) {
  color: var(--primary-600);
  font-weight: var(--font-weight-medium);
}

:deep(.orders-tabs .el-tabs__active-bar) {
  background-color: var(--primary-600);
  height: 2px;
}

:deep(.orders-tabs .el-tabs__nav-wrap::after) {
  background-color: var(--border-primary);
  height: 1px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.order-card {
  padding: var(--spacing-lg);
  cursor: pointer;
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
}

.order-info-top {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.order-id {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.order-id .label {
  color: var(--text-tertiary);
}

.order-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.order-items-section {
  padding: 0;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.order-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--slate-50);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.order-item:hover {
  background: var(--slate-100);
}

.item-placeholder {
  width: 48px;
  height: 48px;
  background: var(--slate-100);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.item-price .price {
  font-weight: var(--font-weight-medium);
  color: var(--primary-600);
}

.item-price .multiply {
  color: var(--neutral-400);
}

.item-subtotal {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  flex-shrink: 0;
}

.order-delivery-section {
  margin-top: var(--spacing-md);
}

.delivery-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.delivery-header .section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin: 0;
}

.delivery-info {
  padding: var(--spacing-md);
  background: var(--slate-50);
  border-radius: var(--radius-md);
}

.receiver-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
}

.receiver-info .name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.receiver-info .phone {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.address-detail {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
}

.remark-row {
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-primary);
}

.remark-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.remark-content {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-primary);
}

.price-summary {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-sm);
}

.price-summary .price-label {
  color: var(--text-secondary);
}

.price-summary .item-count {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.price-summary .total-price {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--primary-600);
  margin-left: var(--spacing-xs);
}

.order-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  justify-content: flex-end;
}

:deep(.order-actions .el-button) {
  padding: 4px 12px;
  font-size: var(--font-size-sm);
  border-radius: var(--radius-md);
}

.empty-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl);
}

.confirm-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg);
}

.confirm-icon {
  margin-bottom: var(--spacing-lg);
}

.confirm-text {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-lg);
}

.confirm-order-info {
  display: flex;
  gap: var(--spacing-xl);
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--slate-50);
  border-radius: var(--radius-md);
}

.confirm-order-info .order-id {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.confirm-order-info .order-price {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary-600);
}

@media (max-width: 768px) {
  .page-container {
    padding: var(--spacing-lg);
  }

  .page-header {
    margin: 0 calc(-1 * var(--spacing-lg));
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .orders-content {
    margin-top: var(--spacing-lg);
  }

  .orders-list {
    gap: var(--spacing-lg);
  }

  .order-card {
    padding: var(--spacing-md);
  }

  .order-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
  }

  .order-info-top {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .order-item {
    padding: var(--spacing-xs);
    gap: var(--spacing-sm);
  }

  .item-placeholder {
    width: 40px;
    height: 40px;
  }

  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .price-summary {
    width: 100%;
    justify-content: space-between;
  }

  .order-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .order-time {
    display: none;
  }

  :deep(.orders-tabs .el-tabs__item) {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-sm);
  }
}
</style>
