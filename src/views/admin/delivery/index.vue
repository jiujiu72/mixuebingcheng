<template>
  <div class="admin-delivery-management">
    <h2 class="page-title">骑手管理</h2>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索骑手姓名、手机号..."
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
        <el-option label="在职" :value="1" />
        <el-option label="离职" :value="0" />
      </el-select>
      <el-select v-model="onlineFilter" placeholder="在线状态" style="width: 150px;" @change="handleSearch">
        <el-option label="全部" :value="-1" />
        <el-option label="在线" :value="1" />
        <el-option label="离线" :value="0" />
      </el-select>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增骑手
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="filteredDeliveryMen" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="idCard" label="身份证号" width="180">
          <template #default="{ row }">
            {{ row.idCard ? row.idCard.replace(/(.{6}).{8}(.{4})/, '$1********$2') : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="rating" label="评分" width="100">
          <template #default="{ row }">
            <el-rate :model-value="row.rating" disabled show-score text-color="#ff9900" />
          </template>
        </el-table-column>
        <el-table-column prop="orderCount" label="完成订单" width="100" />
        <el-table-column prop="income" label="本月收入" width="120">
          <template #default="{ row }">
            <span style="color: #67c23a; font-weight: 600;">¥{{ row.income.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="isOnline" label="在线状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isOnline === 1 ? 'success' : 'info'" size="small">
              {{ row.isOnline === 1 ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">查看</el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑骑手' : '新增骑手'"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="form.idCard" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">在职</el-radio>
            <el-radio :label="0">离职</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="骑手详情" width="600px">
      <div class="delivery-detail" v-if="currentDeliveryMan">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ currentDeliveryMan.name }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentDeliveryMan.username }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentDeliveryMan.phone }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ currentDeliveryMan.idCard }}</el-descriptions-item>
          <el-descriptions-item label="评分">
            <el-rate :model-value="currentDeliveryMan.rating" disabled show-score text-color="#ff9900" />
          </el-descriptions-item>
          <el-descriptions-item label="完成订单">{{ currentDeliveryMan.orderCount }} 单</el-descriptions-item>
          <el-descriptions-item label="本月收入">
            <span style="color: #67c23a; font-weight: 600;">¥{{ currentDeliveryMan.income.toLocaleString() }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="在线状态">
            <el-tag :type="currentDeliveryMan.isOnline === 1 ? 'success' : 'info'" size="small">
              {{ currentDeliveryMan.isOnline === 1 ? '在线' : '离线' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="工作状态" :span="2">
            <el-tag :type="currentDeliveryMan.status === 1 ? 'success' : 'danger'" size="small">
              {{ currentDeliveryMan.status === 1 ? '在职' : '离职' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { mockDeliveryMen } from '../../../data/mockData'

const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref(-1)
const onlineFilter = ref(-1)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentId = ref(null)
const currentDeliveryMan = ref(null)

const form = ref({
  name: '',
  username: '',
  password: '',
  phone: '',
  idCard: '',
  status: 1
})

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '身份证号格式不正确', trigger: 'blur' }
  ]
}

const filteredDeliveryMen = computed(() => {
  let deliveryMen = [...mockDeliveryMen]
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    deliveryMen = deliveryMen.filter(d =>
      d.name.toLowerCase().includes(keyword) ||
      d.phone.includes(keyword) ||
      d.username.toLowerCase().includes(keyword)
    )
  }
  if (statusFilter.value !== -1) {
    deliveryMen = deliveryMen.filter(d => d.status === statusFilter.value)
  }
  if (onlineFilter.value !== -1) {
    deliveryMen = deliveryMen.filter(d => d.isOnline === onlineFilter.value)
  }
  return deliveryMen
})

const handleSearch = () => {}

const handleAdd = () => {
  isEdit.value = false
  form.value = {
    name: '',
    username: '',
    password: '',
    phone: '',
    idCard: '',
    status: 1
  }
  dialogVisible.value = true
}

const handleView = (row) => {
  currentDeliveryMan.value = row
  detailVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentId.value = row.id
  form.value = {
    name: row.name,
    username: row.username,
    password: '',
    phone: row.phone,
    idCard: row.idCard,
    status: row.status
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除骑手 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = mockDeliveryMen.findIndex(d => d.id === row.id)
    if (index > -1) {
      mockDeliveryMen.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      const index = mockDeliveryMen.findIndex(d => d.id === currentId.value)
      if (index > -1) {
        mockDeliveryMen[index] = {
          ...mockDeliveryMen[index],
          name: form.value.name,
          phone: form.value.phone,
          idCard: form.value.idCard,
          status: form.value.status
        }
        ElMessage.success('编辑成功')
      }
    } else {
      const newId = Math.max(...mockDeliveryMen.map(d => d.id)) + 1
      mockDeliveryMen.push({
        id: newId,
        name: form.value.name,
        username: form.value.username,
        phone: form.value.phone,
        idCard: form.value.idCard,
        status: form.value.status,
        isOnline: 0,
        rating: 5.0,
        orderCount: 0,
        income: 0,
        latitude: 39.9042,
        longitude: 116.4074,
        createTime: new Date().toLocaleString()
      })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
  } catch {}
}
</script>

<style scoped>
.admin-delivery-management {
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

.delivery-detail {
  padding: 10px 0;
}
</style>
