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
    </header>

    <div class="order-tabs">
      <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all">
          <div class="orders-list">
            <div
              v-for="order in filteredOrders"
              :key="order.id"
              class="order-card"
              @click="goToOrderDetail(order)"
            >
              <div class="order-header">
                <span class="order-id">{{ order.id }}</span>
                <el-tag :type="orderStatusMap[order.status].type" size="small">
                  {{ orderStatusMap[order.status].label }}
                </el-tag>
              </div>
              <div class="order-items">
                <div
                  v-for="(item, index) in order.items.slice(0, 3)"
                  :key="index"
                  class="order-item"
                >
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-quantity">x{{ item.quantity }}</span>
                </div>
                <div v-if="order.items.length > 3" class="more-items">
                  等{{ order.items.length }}件商品
                </div>
              </div>
              <div class="order-footer">
                <span class="order-time">{{ order.orderTime }}</span>
                <span class="order-total">
                  合计: <span class="price">¥{{ order.actualPrice }}</span>
                </span>
              </div>
              <div class="order-actions" v-if="order.status === 3 || order.status === 4">
                <el-button v-if="order.status === 3" type="primary" size="small" @click.stop="confirmReceive(order)">
                  确认收货
                </el-button>
                <el-button type="primary" plain size="small" @click.stop="goToTracking(order)">
                  查看配送
                </el-button>
              </div>
            </div>

            <div v-if="filteredOrders.length === 0" class="empty-orders">
              <el-icon :size="64"><Document /></el-icon>
              <p>暂无订单</p>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="待付款" name="pending_payment">
          <orders-list :status="[1]" />
        </el-tab-pane>
        <el-tab-pane label="待配送" name="pending_delivery">
          <orders-list :status="[2]" />
        </el-tab-pane>
        <el-tab-pane label="配送中" name="delivering">
          <orders-list :status="[3]" />
        </el-tab-pane>
        <el-tab-pane label="已完成" name="completed">
          <orders-list :status="[4]" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog v-model="confirmDialogVisible" title="确认收货" width="400px">
      <p>确认已收到订单中的所有商品吗？</p>
      <template #footer>
        <el-button @click="confirmDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmReceive">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, h, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Document } from '@element-plus/icons-vue'
import { mockOrders, orderStatusMap } from '../../../data/mockData'

const router = useRouter()
const activeTab = ref('all')
const confirmDialogVisible = ref(false)
const currentOrder = ref(null)

const filteredOrders = computed(() => {
  let orders = [...mockOrders].filter(o => o.userId === 1)
  
  if (activeTab.value === 'pending_payment') {
    orders = orders.filter(o => o.status === 1)
  } else if (activeTab.value === 'pending_delivery') {
    orders = orders.filter(o => o.status === 2)
  } else if (activeTab.value === 'delivering') {
    orders = orders.filter(o => o.status === 3)
  } else if (activeTab.value === 'completed') {
    orders = orders.filter(o => o.status === 4 || o.status === 5)
  }
  
  return orders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime))
})

const ordersList = defineComponent({
  props: {
    status: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const orders = computed(() => {
      let result = [...mockOrders].filter(o => o.userId === 1)
      if (props.status.length > 0) {
        result = result.filter(o => props.status.includes(o.status))
      }
      return result.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime))
    })
    
    const goToOrderDetail = (order) => {
      router.push(`/user/tracking/${order.id}`)
    }
    
    const goToTracking = (order) => {
      router.push(`/user/tracking/${order.id}`)
    }
    
    const confirmReceive = (order) => {
      ElMessageBox.confirm('确认已收到订单中的所有商品吗？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        const index = mockOrders.findIndex(o => o.id === order.id)
        if (index > -1) {
          mockOrders[index].status = 4
          ElMessage.success('确认收货成功')
        }
      }).catch(() => {})
    }
    
    return () => h('div', { class: 'orders-list' }, [
      ...orders.value.map(order => h('div', {
        class: 'order-card',
        onClick: () => goToOrderDetail(order)
      }, [
        h('div', { class: 'order-header' }, [
          h('span', { class: 'order-id' }, order.id),
          h('el-tag', {
            type: orderStatusMap[order.status].type,
            size: 'small'
          }, orderStatusMap[order.status].label)
        ]),
        h('div', { class: 'order-items' }, [
          ...order.items.slice(0, 3).map((item, index) => h('div', {
            class: 'order-item',
            key: index
          }, [
            h('span', { class: 'item-name' }, item.name),
            h('span', { class: 'item-quantity' }, `x${item.quantity}`)
          ])),
          order.items.length > 3 ? h('div', { class: 'more-items' }, `等${order.items.length}件商品`) : null
        ]),
        h('div', { class: 'order-footer' }, [
          h('span', { class: 'order-time' }, order.orderTime),
          h('span', { class: 'order-total' }, [
            '合计: ',
            h('span', { class: 'price' }, `¥${order.actualPrice}`)
          ])
        ]),
        (order.status === 3 || order.status === 4) ? h('div', { class: 'order-actions' }, [
          order.status === 3 ? h('el-button', {
            type: 'primary',
            size: 'small',
            onClick: (e) => { e.stopPropagation(); confirmReceive(order) }
          }, '确认收货') : null,
          h('el-button', {
            type: 'primary',
            plain: true,
            size: 'small',
            onClick: (e) => { e.stopPropagation(); goToTracking(order) }
          }, '查看配送')
        ]) : null
      ])),
      orders.value.length === 0 ? h('div', { class: 'empty-orders' }, [
        h('el-icon', { size: 64 }, h(Document)),
        h('p', '暂无订单')
      ]) : null
    ])
  }
})

const goBack = () => {
  router.back()
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

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.order-id {
  font-size: 14px;
  color: #64748b;
}

.order-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.item-name {
  color: #334155;
}

.item-quantity {
  color: #64748b;
  font-size: 13px;
}

.more-items {
  font-size: 13px;
  color: #94a3b8;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-time {
  font-size: 13px;
  color: #94a3b8;
}

.order-total {
  font-size: 14px;
  color: #334155;
}

.price {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #94a3b8;
}

.empty-orders p {
  margin-top: 16px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .orders-header {
    padding: 12px 16px;
  }
  
  .order-tabs {
    padding: 16px;
  }
  
  .order-card {
    padding: 16px;
  }
}
</style>
