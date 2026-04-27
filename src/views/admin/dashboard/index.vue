<template>
  <div class="admin-dashboard">
    <h2 class="page-title">控制台概览</h2>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.orderCount }}</div>
          <div class="stat-label">今日订单</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);">
          <el-icon><UserFilled /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.userCount }}</div>
          <div class="stat-label">用户总数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);">
          <el-icon><Food /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.foodCount }}</div>
          <div class="stat-label">菜品总数</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%);">
          <el-icon><Avatar /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.employeeCount }}</div>
          <div class="stat-label">员工总数</div>
        </div>
      </div>
    </div>

    <div class="charts-row">
      <div class="chart-card">
        <h3 class="card-title">订单统计</h3>
        <div class="chart-placeholder">
          <div class="order-summary">
            <div class="summary-item">
              <span class="label">待付款</span>
              <span class="value warning">{{ orderStats.pending }}</span>
            </div>
            <div class="summary-item">
              <span class="label">待发货</span>
              <span class="value primary">{{ orderStats.paid }}</span>
            </div>
            <div class="summary-item">
              <span class="label">待收货</span>
              <span class="value info">{{ orderStats.shipped }}</span>
            </div>
            <div class="summary-item">
              <span class="label">已完成</span>
              <span class="value success">{{ orderStats.completed }}</span>
            </div>
            <div class="summary-item">
              <span class="label">已取消</span>
              <span class="value danger">{{ orderStats.cancelled }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-card">
        <h3 class="card-title">销售排行 TOP 5</h3>
        <div class="chart-placeholder">
          <div class="sales-rank">
            <div v-for="(item, index) in topFoods" :key="index" class="rank-item">
              <span :class="['rank-num', { top: index < 3 }]">{{ index + 1 }}</span>
              <span class="rank-name">{{ item.name }}</span>
              <span class="rank-sales">{{ item.sales }} 份</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="recent-section">
      <div class="chart-card">
        <h3 class="card-title">最新订单</h3>
        <el-table :data="recentOrders" style="width: 100%" :stripe="true">
          <el-table-column prop="id" label="订单号" width="160" />
          <el-table-column prop="userName" label="用户" width="100" />
          <el-table-column prop="totalPrice" label="金额" width="100">
            <template #default="{ row }">
              ¥{{ row.totalPrice }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="orderStatusMap[row.status].type" size="small">
                {{ orderStatusMap[row.status].label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="orderTime" label="下单时间" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Document, UserFilled, Food, Avatar } from '@element-plus/icons-vue'
import { mockOrders, mockUsers, mockFoods, mockEmployees, orderStatusMap } from '../../../data/mockData'

const stats = ref({
  orderCount: 0,
  userCount: 0,
  foodCount: 0,
  employeeCount: 0
})

const orderStats = ref({
  pending: 0,
  paid: 0,
  shipped: 0,
  completed: 0,
  cancelled: 0
})

const topFoods = computed(() => {
  return [...mockFoods].sort((a, b) => b.sales - a.sales).slice(0, 5)
})

const recentOrders = computed(() => {
  return [...mockOrders].sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime)).slice(0, 5)
})

onMounted(() => {
  const today = new Date().toISOString().split('T')[0]
  stats.value.orderCount = mockOrders.filter(o => o.orderTime.startsWith('2024-01-17')).length || mockOrders.length
  stats.value.userCount = mockUsers.length
  stats.value.foodCount = mockFoods.length
  stats.value.employeeCount = mockEmployees.length

  orderStats.value.pending = mockOrders.filter(o => o.status === 1).length
  orderStats.value.paid = mockOrders.filter(o => o.status === 2).length
  orderStats.value.shipped = mockOrders.filter(o => o.status === 3).length
  orderStats.value.completed = mockOrders.filter(o => o.status === 4).length
  orderStats.value.cancelled = mockOrders.filter(o => o.status === 5).length
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 24px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
}

.chart-placeholder {
  min-height: 200px;
}

.order-summary {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.summary-item .label {
  font-size: 14px;
  color: #64748b;
}

.summary-item .value {
  font-size: 24px;
  font-weight: 700;
}

.summary-item .value.warning { color: #e6a23c; }
.summary-item .value.primary { color: #409eff; }
.summary-item .value.info { color: #909399; }
.summary-item .value.success { color: #67c23a; }
.summary-item .value.danger { color: #f56c6c; }

.sales-rank {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.rank-num {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #e2e8f0;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-num.top {
  background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);
  color: white;
}

.rank-name {
  flex: 1;
  font-size: 14px;
  color: #1e293b;
}

.rank-sales {
  font-size: 14px;
  font-weight: 600;
  color: #6366f1;
}

.recent-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>