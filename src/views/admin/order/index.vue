<template>
  <div class="admin-order-management">
    <h2 class="page-title">订单管理</h2>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索订单号、用户姓名..."
        style="width: 300px;"
        clearable
        @change="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px;" @change="handleSearch">
        <el-option label="全部" :value="-1" />
        <el-option v-for="(status, key) in orderStatusMap" :key="key" :label="status.label" :value="parseInt(key)" />
      </el-select>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增订单
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="filteredOrders" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="订单号" width="160" />
        <el-table-column prop="userName" label="用户" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="totalPrice" label="总价" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: 600;">¥{{ row.totalPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="actualPrice" label="实付" width="100">
          <template #default="{ row }">
            <span style="color: #67c23a; font-weight: 600;">¥{{ row.actualPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="orderStatusMap[row.status].type" size="small">
              {{ orderStatusMap[row.status].label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderTime" label="下单时间" width="180" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button>
            <el-button type="warning" link size="small" @click="handleEditStatus(row)">改状态</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <div class="order-detail" v-if="currentOrder">
        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="detail-row">
            <span class="label">订单号：</span>
            <span class="value">{{ currentOrder.id }}</span>
          </div>
          <div class="detail-row">
            <span class="label">用户：</span>
            <span class="value">{{ currentOrder.userName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">手机号：</span>
            <span class="value">{{ currentOrder.phone }}</span>
          </div>
          <div class="detail-row">
            <span class="label">下单时间：</span>
            <span class="value">{{ currentOrder.orderTime }}</span>
          </div>
          <div class="detail-row">
            <span class="label">收货地址：</span>
            <span class="value">{{ currentOrder.address }}</span>
          </div>
          <div class="detail-row" v-if="currentOrder.remark">
            <span class="label">备注：</span>
            <span class="value">{{ currentOrder.remark }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4>订单商品</h4>
          <el-table :data="currentOrder.items" size="small">
            <el-table-column prop="name" label="商品名称" />
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="price" label="单价" width="80">
              <template #default="{ row }">¥{{ row.price }}</template>
            </el-table-column>
            <el-table-column label="小计" width="80">
              <template #default="{ row }">¥{{ row.price * row.quantity }}</template>
            </el-table-column>
          </el-table>
        </div>

        <div class="detail-section">
          <h4>费用信息</h4>
          <div class="detail-row">
            <span class="label">总价：</span>
            <span class="value">¥{{ currentOrder.totalPrice }}</span>
          </div>
          <div class="detail-row">
            <span class="label">实付：</span>
            <span class="value" style="color: #67c23a; font-weight: 600;">¥{{ currentOrder.actualPrice }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="statusDialogVisible" title="修改订单状态" width="400px">
      <el-form label-width="80px">
        <el-form-item label="订单号">
          <span>{{ currentOrder?.id }}</span>
        </el-form-item>
        <el-form-item label="当前状态">
          <el-tag :type="orderStatusMap[currentOrder?.status]?.type" size="small">
            {{ orderStatusMap[currentOrder?.status]?.label }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新状态" prop="newStatus">
          <el-select v-model="newStatus" placeholder="请选择新状态" style="width: 100%;">
            <el-option v-for="(status, key) in orderStatusMap" :key="key" :label="status.label" :value="parseInt(key)" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleStatusSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { mockOrders, orderStatusMap } from '../../../data/mockData'

const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref(-1)
const detailVisible = ref(false)
const statusDialogVisible = ref(false)
const currentOrder = ref(null)
const newStatus = ref(null)

const filteredOrders = computed(() => {
  let orders = [...mockOrders]
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    orders = orders.filter(o =>
      o.id.toLowerCase().includes(keyword) ||
      o.userName.toLowerCase().includes(keyword) ||
      o.phone.includes(keyword)
    )
  }
  if (statusFilter.value !== -1) {
    orders = orders.filter(o => o.status === statusFilter.value)
  }
  return orders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime))
})

const handleSearch = () => {}

const handleDetail = (row) => {
  currentOrder.value = row
  detailVisible.value = true
}

const handleEditStatus = (row) => {
  currentOrder.value = row
  newStatus.value = row.status
  statusDialogVisible.value = true
}

const handleStatusSubmit = () => {
  if (newStatus.value === null || newStatus.value === currentOrder.value.status) {
    ElMessage.warning('请选择不同的状态')
    return
  }
  const index = mockOrders.findIndex(o => o.id === currentOrder.value.id)
  if (index > -1) {
    mockOrders[index].status = newStatus.value
    ElMessage.success('状态修改成功')
  }
  statusDialogVisible.value = false
}

const handleAdd = () => {
  ElMessage.info('新增订单功能开发中...')
}
</script>

<style scoped>
.admin-order-management {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 24px 0;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.table-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.order-detail {
  padding: 10px 0;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-row .label {
  width: 80px;
  color: #64748b;
}

.detail-row .value {
  flex: 1;
  color: #1e293b;
}
</style>