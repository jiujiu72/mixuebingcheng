<template>
  <div class="delivery-orders">
    <div class="orders-header">
      <div class="orders-stats">
        <div class="stat-item">
          <span class="stat-label">今日完成</span>
          <span class="stat-value success">{{ todayOrders }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">今日收入</span>
          <span class="stat-value primary">¥{{ todayIncome }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">配送中</span>
          <span class="stat-value warning">{{ deliveringCount }}</span>
        </div>
      </div>
    </div>

    <div class="orders-tabs">
      <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
        <el-tab-pane label="全部订单" name="all">
          <orders-list :status="null" />
        </el-tab-pane>
        <el-tab-pane label="待配送" name="pending">
          <orders-list :status="[1, 2]" />
        </el-tab-pane>
        <el-tab-pane label="配送中" name="delivering">
          <orders-list :status="[3]" />
        </el-tab-pane>
        <el-tab-pane label="已完成" name="completed">
          <orders-list :status="[4]" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h, defineComponent } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mockOrders, mockUserAddresses } from '../../../data/mockData'

const activeTab = ref('all')
const todayOrders = ref(8)
const todayIncome = ref(280)

const currentDeliveryMan = computed(() => {
  const dm = localStorage.getItem('deliveryMan')
  return dm ? JSON.parse(dm) : null
})

const deliveringCount = computed(() => {
  if (!currentDeliveryMan.value) return 0
  return mockOrders.filter(o => 
    o.deliveryManId === currentDeliveryMan.value.id && o.status === 3
  ).length
})

const handleTabChange = () => {
}

const ordersList = defineComponent({
  props: {
    status: {
      type: Array,
      default: null
    }
  },
  setup(props) {
    const orders = computed(() => {
      let result = [...mockOrders]
      
      if (currentDeliveryMan.value) {
        result = result.filter(o => o.deliveryManId === currentDeliveryMan.value.id)
      }
      
      if (props.status && props.status.length > 0) {
        result = result.filter(o => props.status.includes(o.status))
      }
      
      return result.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime))
    })
    
    const getStatusTag = (status) => {
      const statusMap = {
        1: { label: '待付款', type: 'warning' },
        2: { label: '待配送', type: 'primary' },
        3: { label: '配送中', type: 'warning' },
        4: { label: '已完成', type: 'success' },
        5: { label: '已取消', type: 'danger' }
      }
      return statusMap[status] || { label: '未知', type: 'info' }
    }
    
    const completeDelivery = (order) => {
      ElMessageBox.confirm('确认已将餐品送达用户手中？', '确认送达', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        const index = mockOrders.findIndex(o => o.id === order.id)
        if (index > -1) {
          mockOrders[index].status = 4
          todayOrders.value++
          todayIncome.value += 5
          ElMessage.success('订单已完成')
        }
      }).catch(() => {})
    }
    
    const callUser = (order) => {
      ElMessage.info(`正在拨打 ${order.phone}`)
    }
    
    return () => h('div', { class: 'orders-list' }, [
      orders.value.length > 0 ? h('div', { class: 'orders-cards' }, [
        ...orders.value.map(order => h('div', {
          class: 'order-card'
        }, [
          h('div', { class: 'order-header' }, [
            h('span', { class: 'order-id' }, order.id),
            h('el-tag', {
              type: getStatusTag(order.status).type,
              size: 'small'
            }, getStatusTag(order.status).label)
          ]),
          h('div', { class: 'order-info' }, [
            h('div', { class: 'info-row' }, [
              h('span', { class: 'label' }, '用户'),
              h('span', { class: 'value' }, `${order.userName} ${order.phone}`)
            ]),
            h('div', { class: 'info-row' }, [
              h('span', { class: 'label' }, '地址'),
              h('span', { class: 'value' }, order.address)
            ]),
            h('div', { class: 'info-row' }, [
              h('span', { class: 'label' }, '下单时间'),
              h('span', { class: 'value' }, order.orderTime)
            ])
          ]),
          h('div', { class: 'order-items' }, [
            h('div', { class: 'items-title' }, '订单商品'),
            ...order.items.map((item, index) => h('div', {
              class: 'item-row',
              key: index
            }, [
              h('span', { class: 'item-name' }, item.name),
              h('span', { class: 'item-quantity' }, `x${item.quantity}`),
              h('span', { class: 'item-price' }, `¥${item.price * item.quantity}`)
            ]))
          ]),
          h('div', { class: 'order-footer' }, [
            h('div', { class: 'order-total' }, [
              '订单金额: ',
              h('span', { class: 'price' }, `¥${order.actualPrice}`)
            ]),
            order.status === 3 ? h('div', { class: 'order-actions' }, [
              h('el-button', {
                type: 'primary',
                plain: true,
                size: 'small',
                onClick: () => callUser(order)
              }, '联系用户'),
              h('el-button', {
                type: 'success',
                size: 'small',
                onClick: () => completeDelivery(order)
              }, '确认送达')
            ]) : null
          ])
        ]))
      ]) : h('div', { class: 'empty-orders' }, [
        h('el-icon', { size: 64 }, h('svg', {
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2'
        }, [
          h('path', { d: 'M7 10l5 5 5-5' }),
          h('path', { d: 'M20.488 9H15V3.512A9.025 9.025 0 0 1 20.488 9z' }),
          h('path', { d: 'M15 3.512V9h6.488A9.025 9.025 0 0 0 15 3.512z' }),
          h('path', { d: 'M3.512 9H9v5.488A9.025 9.025 0 0 1 3.512 9z' }),
          h('path', { d: 'M9 3.512V9H3.512A9.025 9.025 0 0 1 9 3.512z' })
        ])),
        h('p', '暂无订单')
      ])
    ])
  }
})
</script>

<style scoped>
.delivery-orders {
  max-width: 1000px;
  margin: 0 auto;
}

.orders-header {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.orders-stats {
  display: flex;
  gap: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-value.success {
  color: #10b981;
}

.stat-value.primary {
  color: #6366f1;
}

.stat-value.warning {
  color: #f59e0b;
}

.orders-tabs {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.orders-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: #fafafa;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.order-card:hover {
  border-color: #f97316;
  background: #fff5eb;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e2e8f0;
}

.order-id {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.order-info {
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  padding: 8px 0;
}

.info-row .label {
  width: 70px;
  font-size: 14px;
  color: #64748b;
  flex-shrink: 0;
}

.info-row .value {
  flex: 1;
  font-size: 14px;
  color: #1e293b;
}

.order-items {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.items-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f1f5f9;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 6px 0;
}

.item-name {
  flex: 1;
  font-size: 14px;
  color: #334155;
}

.item-quantity {
  width: 60px;
  text-align: center;
  font-size: 14px;
  color: #64748b;
}

.item-price {
  width: 80px;
  text-align: right;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.order-total {
  font-size: 14px;
  color: #334155;
}

.order-total .price {
  font-size: 18px;
  font-weight: 700;
  color: #f97316;
}

.order-actions {
  display: flex;
  gap: 12px;
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
    padding: 16px;
  }
  
  .orders-stats {
    gap: 24px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .orders-tabs {
    padding: 16px;
  }
  
  .order-card {
    padding: 12px;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .order-actions {
    justify-content: flex-end;
  }
}
</style>
