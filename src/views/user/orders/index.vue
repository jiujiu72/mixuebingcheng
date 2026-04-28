<template>
  <div class="user-orders-container">
    <header class="orders-header">
      <div class="header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">我的订单</h1>
      </div>
      <el-button type="primary" text @click="goToHome">
        <el-icon><Plus /></el-icon>
        去点餐
      </el-button>
    </header>

    <div class="order-tabs">
      <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
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

            <div v-if="filteredOrders.length === 0" class="empty-orders">
              <div class="empty-icon">
                <el-icon :size="80"><Document /></el-icon>
              </div>
              <p class="empty-text">暂无订单</p>
              <p class="empty-hint">快去添加美食到购物车吧~</p>
              <el-button type="primary" @click="goToHome">
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
              <p>暂无待付款订单</p>
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
              <p>暂无待发货订单</p>
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
              <p>暂无待收货订单</p>
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
              <p>暂无已完成订单</p>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="confirmDialogVisible" title="确认收货" width="420px" :close-on-click-modal="false">
      <div class="confirm-dialog-content">
        <div class="confirm-icon">
          <el-icon :size="48" color="#667eea"><CircleCheckFilled /></el-icon>
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
      class: 'order-card-wrapper',
      onClick: handleViewOrder
    }, [
      h('div', { class: 'order-header' }, [
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
        h('el-tag', {
          type: statusInfo.value.type,
          size: 'default',
          effect: 'dark'
        }, statusInfo.value.label)
      ]),

      h('div', { class: 'order-items-section', onClick: (e) => e.stopPropagation() }, [
        h('div', { class: 'items-header' }, [
          h('span', { class: 'section-title' }, '商品信息'),
          h('span', { class: 'item-count' }, `共${props.order.items.length}件商品`)
        ]),
        h('div', { class: 'items-list' }, 
          props.order.items.map((item, index) => 
            h('div', { 
              class: 'order-item', 
              key: index,
              style: { animationDelay: `${index * 0.05}s` }
            }, [
              h('div', { class: 'item-placeholder' }, [
                h('el-icon', { size: 24, color: '#cbd5e1' }, h(ShoppingCart))
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

      h('div', { class: 'order-delivery-section', onClick: (e) => e.stopPropagation() }, [
        h('div', { class: 'delivery-header' }, [
          h('el-icon', { size: 16, color: '#667eea' }, h(DeliveryTruck)),
          h('span', { class: 'section-title' }, '配送信息')
        ]),
        h('div', { class: 'delivery-info' }, [
          h('div', { class: 'delivery-row' }, [
            h('el-icon', { size: 14, color: '#94a3b8' }, h(Location)),
            h('div', { class: 'delivery-content' }, [
              h('div', { class: 'receiver-info' }, [
                h('span', { class: 'name' }, props.order.userName),
                h('span', { class: 'phone' }, props.order.phone)
              ]),
              h('div', { class: 'address-detail' }, props.order.address)
            ])
          ]),
          props.order.remark ? h('div', { class: 'delivery-row remark-row' }, [
            h('span', { class: 'remark-label' }, '备注：'),
            h('span', { class: 'remark-content' }, props.order.remark)
          ]) : null
        ])
      ]),

      h('div', { class: 'order-price-section', onClick: (e) => e.stopPropagation() }, [
        h('div', { class: 'price-row' }, [
          h('span', { class: 'price-label' }, '商品金额'),
          h('span', { class: 'price-value' }, `¥${itemsAmount.value.toFixed(2)}`)
        ]),
        discountAmount.value > 0 ? h('div', { class: 'price-row discount' }, [
          h('span', { class: 'price-label' }, '优惠金额'),
          h('span', { class: 'price-value discount-value' }, `-¥${discountAmount.value.toFixed(2)}`)
        ]) : null,
        h('div', { class: 'price-row total-row' }, [
          h('span', { class: 'price-label' }, '实付金额'),
          h('span', { class: 'total-price' }, `¥${props.order.actualPrice}`)
        ])
      ]),

      h('div', { class: 'order-actions', onClick: (e) => e.stopPropagation() }, [
        h('div', { class: 'actions-left' }, []),
        h('div', { class: 'actions-right' }, [
          props.order.status === 3 ? h('el-button', {
            type: 'primary',
            size: 'small',
            onClick: handleConfirmReceive
          }, '确认收货') : null,
          
          (props.order.status === 2 || props.order.status === 3) ? h('el-button', {
            type: 'primary',
            plain: true,
            size: 'small',
            onClick: handleGoToTracking
          }, '查看配送') : null,
          
          (props.order.status === 4 && !props.isReviewed) ? h('el-button', {
            type: 'warning',
            size: 'small',
            onClick: handleGoToReview
          }, [
            h('el-icon', {}, h(ChatDotRound)),
            ' 去评价'
          ]) : null,
          
          (props.order.status === 4 && props.isReviewed) ? h('el-button', {
            type: 'info',
            plain: true,
            size: 'small',
            onClick: handleViewReview
          }, [
            h('el-icon', {}, h(ChatDotRound)),
            ' 查看评价'
          ]) : null,
          
          (props.order.status === 4 || props.order.status === 5) ? h('el-button', {
            type: 'success',
            plain: true,
            size: 'small',
            onClick: handleReorder
          }, [
            h('el-icon', {}, h(Plus)),
            ' 再来一单'
          ]) : null,
          
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
.user-orders-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.orders-header {
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

.order-tabs {
  flex: 1;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

:deep(.el-tabs__nav-wrap) {
  margin-bottom: 20px;
}

:deep(.el-tabs__item.is-active) {
  color: #667eea;
}

:deep(.el-tabs__active-bar) {
  background-color: #667eea;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card-wrapper {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.order-card-wrapper:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #e0e7ff;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #f1f5f9;
}

.order-info-top {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.order-id {
  font-size: 14px;
  color: #64748b;
}

.order-id .label {
  color: #94a3b8;
}

.order-time {
  font-size: 13px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.order-items-section {
  padding: 16px 20px;
  border-bottom: 1px dashed #e2e8f0;
}

.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.item-count {
  font-size: 13px;
  color: #94a3b8;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.order-item:hover {
  background: #f1f5f9;
}

.item-placeholder {
  width: 56px;
  height: 56px;
  background: #e2e8f0;
  border-radius: 12px;
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
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #64748b;
}

.item-price .price {
  font-weight: 600;
  color: #667eea;
}

.item-price .multiply {
  color: #94a3b8;
}

.item-price .quantity {
  color: #64748b;
}

.item-subtotal {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  flex-shrink: 0;
}

.order-delivery-section {
  padding: 16px 20px;
  border-bottom: 1px dashed #e2e8f0;
}

.delivery-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.delivery-info {
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
}

.delivery-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.delivery-row + .delivery-row {
  margin-top: 8px;
}

.delivery-content {
  flex: 1;
}

.receiver-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.receiver-info .name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.receiver-info .phone {
  font-size: 14px;
  color: #64748b;
}

.address-detail {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
}

.remark-row {
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
}

.remark-label {
  font-size: 13px;
  color: #94a3b8;
  flex-shrink: 0;
}

.remark-content {
  font-size: 13px;
  color: #64748b;
}

.order-price-section {
  padding: 16px 20px;
  background: #fafbfc;
  border-bottom: 1px solid #f1f5f9;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.price-row + .price-row {
  margin-top: 8px;
}

.price-row .price-label {
  color: #64748b;
}

.price-row .price-value {
  color: #475569;
  font-weight: 500;
}

.price-row.discount {
  background: #fef2f2;
  padding: 8px 12px;
  border-radius: 8px;
  margin: 8px 0;
}

.price-row.discount .price-label {
  color: #ef4444;
}

.price-row.discount .discount-value {
  color: #ef4444;
  font-weight: 600;
}

.price-row.total-row {
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  margin-top: 12px;
}

.price-row.total-row .price-label {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}

.total-price {
  font-size: 20px;
  font-weight: 700;
  color: #667eea;
}

.order-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
}

.actions-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-orders .empty-icon {
  color: #cbd5e1;
  margin-bottom: 24px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #475569;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #94a3b8;
  margin: 0 0 20px 0;
}

.empty-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  font-size: 15px;
  color: #94a3b8;
}

.confirm-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.confirm-icon {
  margin-bottom: 16px;
}

.confirm-text {
  font-size: 15px;
  color: #475569;
  margin: 0 0 12px 0;
}

.confirm-order-info {
  display: flex;
  gap: 20px;
  padding: 12px 24px;
  background: #f8fafc;
  border-radius: 12px;
}

.confirm-order-info .order-id {
  font-size: 13px;
  color: #94a3b8;
}

.confirm-order-info .order-price {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
}

@media (max-width: 768px) {
  .orders-header {
    padding: 12px 16px;
  }

  .order-tabs {
    padding: 16px;
  }

  .orders-list {
    gap: 16px;
  }

  .order-card-wrapper {
    border-radius: 16px;
  }

  .order-header {
    padding: 12px 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .order-info-top {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .order-items-section,
  .order-delivery-section,
  .order-price-section {
    padding: 12px 16px;
  }

  .order-item {
    padding: 10px;
    gap: 10px;
  }

  .item-placeholder {
    width: 48px;
    height: 48px;
  }

  .order-actions {
    padding: 12px 16px;
  }

  .actions-right {
    width: 100%;
    justify-content: space-between;
  }

  .actions-right .el-button {
    flex: 1;
    min-width: 0;
  }

  .order-time {
    display: none;
  }

  .total-price {
    font-size: 18px;
  }
}
</style>
