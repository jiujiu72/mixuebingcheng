<template>
  <div class="user-management">
    <header class="page-header">
      <h1 class="page-title">用户管理</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>
    </header>

    <main class="page-container">
      <div class="card search-bar-card">
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索用户名、姓名、手机号..."
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
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </div>
      </div>

      <div class="card table-container">
        <el-table :data="filteredUsers" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="phone" label="手机号" width="130" />
          <el-table-column prop="email" label="邮箱" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <span :class="['badge', row.status === 1 ? 'badge-success' : 'badge-error']">
                {{ row.status === 1 ? '正常' : '禁用' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="注册时间" width="180" />
          <el-table-column label="操作" fixed="right" width="180">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </main>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { mockUsers } from '../../data/mockData'

const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref(-1)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentId = ref(null)

const form = ref({
  username: '',
  name: '',
  phone: '',
  email: '',
  password: '',
  status: 1
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const filteredUsers = computed(() => {
  let users = [...mockUsers]
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    users = users.filter(u =>
      u.username.toLowerCase().includes(keyword) ||
      u.name.toLowerCase().includes(keyword) ||
      u.phone.includes(keyword)
    )
  }
  if (statusFilter.value !== -1) {
    users = users.filter(u => u.status === statusFilter.value)
  }
  return users
})

const handleSearch = () => {}

const handleAdd = () => {
  isEdit.value = false
  form.value = {
    username: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    status: 1
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentId.value = row.id
  form.value = {
    username: row.username,
    name: row.name,
    phone: row.phone,
    email: row.email,
    password: '',
    status: row.status
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = mockUsers.findIndex(u => u.id === row.id)
    if (index > -1) {
      mockUsers.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      const index = mockUsers.findIndex(u => u.id === currentId.value)
      if (index > -1) {
        mockUsers[index] = {
          ...mockUsers[index],
          name: form.value.name,
          phone: form.value.phone,
          email: form.value.email,
          status: form.value.status
        }
        ElMessage.success('编辑成功')
      }
    } else {
      const newId = Math.max(...mockUsers.map(u => u.id)) + 1
      mockUsers.push({
        id: newId,
        username: form.value.username,
        name: form.value.name,
        phone: form.value.phone,
        email: form.value.email,
        status: form.value.status,
        createTime: new Date().toLocaleString()
      })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
  } catch {}
}
</script>

<style scoped>
.user-management {
  min-height: 100vh;
  background: var(--bg-secondary);
  display: flex;
  flex-direction: column;
}

.search-bar-card {
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.search-bar {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.table-container {
  padding: var(--spacing-lg);
}

:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: var(--slate-50);
  --el-table-row-hover-bg-color: var(--slate-50);
  --el-table-border-color: var(--border-primary);
}

:deep(.el-table th) {
  background: var(--slate-50);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

:deep(.el-table td) {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: var(--slate-50);
}

:deep(.el-button--primary.is-link) {
  color: var(--primary-600);
}

:deep(.el-button--danger.is-link) {
  color: var(--error-600);
}

:deep(.el-dialog) {
  --el-dialog-border-radius: var(--radius-lg);
}

:deep(.el-dialog__header) {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--border-primary);
}

:deep(.el-dialog__title) {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

:deep(.el-dialog__body) {
  padding: var(--spacing-xl);
}

:deep(.el-dialog__footer) {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--border-primary);
}

:deep(.el-form-item__label) {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

:deep(.el-input__wrapper) {
  border-radius: var(--radius-md);
}

:deep(.el-radio__label) {
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
  }
  
  .search-bar .el-input,
  .search-bar .el-select {
    width: 100% !important;
  }
}
</style>
