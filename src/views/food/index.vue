<template>
  <div class="food-management">
    <h2 class="page-title">食品管理</h2>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索食品名称..."
        style="width: 300px;"
        clearable
        @change="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="categoryFilter" placeholder="分类筛选" style="width: 150px;" @change="handleSearch">
        <el-option label="全部分类" :value="-1" />
        <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
      </el-select>
      <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px;" @change="handleSearch">
        <el-option label="全部" :value="-1" />
        <el-option label="上架" :value="1" />
        <el-option label="下架" :value="0" />
      </el-select>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增食品
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="filteredFoods" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="image" label="封面图" width="120">
          <template #default="{ row }">
            <el-image :src="row.image" fit="cover" style="width: 80px; height: 60px; border-radius: 8px;" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="食品名称" width="150" />
        <el-table-column prop="categoryId" label="分类" width="100">
          <template #default="{ row }">
            {{ getCategoryName(row.categoryId) }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: 600;">¥{{ row.price }}</span>
            <span v-if="row.originalPrice" style="text-decoration: line-through; color: #999; font-size: 12px; margin-left: 4px;">¥{{ row.originalPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100">
          <template #default="{ row }">
            <span :style="{ color: row.stock < 20 ? '#f56c6c' : '#67c23a' }">{{ row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sales" label="销量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑食品' : '新增食品'"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="食品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入食品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width: 100%;">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="原价" prop="originalPrice">
          <el-input-number v-model="form.originalPrice" :min="0" :precision="2" placeholder="选填" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>
        <el-form-item label="封面图" prop="image">
          <div class="image-upload">
            <el-input v-model="form.image" placeholder="请输入图片URL" />
            <div class="image-preview" v-if="form.image">
              <el-image :src="form.image" fit="cover" />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入食品描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
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
import { mockFoods, mockCategories } from '../../data/mockData'

const loading = ref(false)
const searchKeyword = ref('')
const categoryFilter = ref(-1)
const statusFilter = ref(-1)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentId = ref(null)

const categories = computed(() => mockCategories.filter(c => c.status === 1))

const form = ref({
  name: '',
  categoryId: '',
  price: 0,
  originalPrice: null,
  stock: 0,
  image: '',
  description: '',
  status: 1
})

const rules = {
  name: [
    { required: true, message: '请输入食品名称', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请输入封面图URL', trigger: 'blur' }
  ]
}

const filteredFoods = computed(() => {
  let foods = [...mockFoods]
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    foods = foods.filter(f => f.name.toLowerCase().includes(keyword))
  }
  if (categoryFilter.value !== -1) {
    foods = foods.filter(f => f.categoryId === categoryFilter.value)
  }
  if (statusFilter.value !== -1) {
    foods = foods.filter(f => f.status === statusFilter.value)
  }
  return foods
})

const getCategoryName = (categoryId) => {
  const cat = mockCategories.find(c => c.id === categoryId)
  return cat ? cat.name : '-'
}

const handleSearch = () => {}

const handleStatusChange = (row) => {
  ElMessage.success(`已将 "${row.name}" ${row.status === 1 ? '上架' : '下架'}`)
}

const handleAdd = () => {
  isEdit.value = false
  form.value = {
    name: '',
    categoryId: '',
    price: 0,
    originalPrice: null,
    stock: 0,
    image: '',
    description: '',
    status: 1
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentId.value = row.id
  form.value = {
    name: row.name,
    categoryId: row.categoryId,
    price: row.price,
    originalPrice: row.originalPrice,
    stock: row.stock,
    image: row.image,
    description: row.description,
    status: row.status
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除食品 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = mockFoods.findIndex(f => f.id === row.id)
    if (index > -1) {
      mockFoods.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      const index = mockFoods.findIndex(f => f.id === currentId.value)
      if (index > -1) {
        mockFoods[index] = {
          ...mockFoods[index],
          name: form.value.name,
          categoryId: form.value.categoryId,
          price: form.value.price,
          originalPrice: form.value.originalPrice,
          stock: form.value.stock,
          image: form.value.image,
          description: form.value.description,
          status: form.value.status
        }
        ElMessage.success('编辑成功')
      }
    } else {
      const newId = Math.max(...mockFoods.map(f => f.id)) + 1
      mockFoods.push({
        id: newId,
        name: form.value.name,
        categoryId: form.value.categoryId,
        price: form.value.price,
        originalPrice: form.value.originalPrice,
        stock: form.value.stock,
        image: form.value.image,
        description: form.value.description,
        status: form.value.status,
        sales: 0,
        createTime: new Date().toLocaleString()
      })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
  } catch {}
}
</script>

<style scoped>
.food-management {
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

.image-upload {
  width: 100%;
}

.image-preview {
  margin-top: 12px;
  width: 200px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.image-preview .el-image {
  width: 100%;
  height: 100%;
}
</style>