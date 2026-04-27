<template>
  <div class="admin-category-management">
    <h2 class="page-title">食品分类管理</h2>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索分类名称..."
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
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="filteredCategories" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">
            <span style="font-size: 24px;">{{ row.icon }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="分类名称" width="150" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="180">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入图标emoji">
            <template #append>
              <span style="font-size: 20px;">{{ form.icon }}</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="1" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
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
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { mockCategories } from '../../../data/mockData'

const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref(-1)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentId = ref(null)

const form = ref({
  name: '',
  icon: '',
  sort: 1,
  status: 1
})

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: '请输入图标', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' }
  ]
}

const filteredCategories = computed(() => {
  let categories = [...mockCategories]
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    categories = categories.filter(c => c.name.toLowerCase().includes(keyword))
  }
  if (statusFilter.value !== -1) {
    categories = categories.filter(c => c.status === statusFilter.value)
  }
  return categories.sort((a, b) => a.sort - b.sort)
})

const handleSearch = () => {}

const handleAdd = () => {
  isEdit.value = false
  form.value = {
    name: '',
    icon: '',
    sort: mockCategories.length + 1,
    status: 1
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentId.value = row.id
  form.value = {
    name: row.name,
    icon: row.icon,
    sort: row.sort,
    status: row.status
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除分类 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = mockCategories.findIndex(c => c.id === row.id)
    if (index > -1) {
      mockCategories.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      const index = mockCategories.findIndex(c => c.id === currentId.value)
      if (index > -1) {
        mockCategories[index] = {
          ...mockCategories[index],
          name: form.value.name,
          icon: form.value.icon,
          sort: form.value.sort,
          status: form.value.status
        }
        ElMessage.success('编辑成功')
      }
    } else {
      const newId = Math.max(...mockCategories.map(c => c.id)) + 1
      mockCategories.push({
        id: newId,
        name: form.value.name,
        icon: form.value.icon,
        sort: form.value.sort,
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
.admin-category-management {
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
</style>