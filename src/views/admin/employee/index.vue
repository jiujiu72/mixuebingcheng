<template>
  <div class="admin-employee-management">
    <h2 class="page-title">员工管理</h2>

    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索员工姓名、手机号..."
        style="width: 300px;"
        clearable
        @change="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="departmentFilter" placeholder="部门筛选" style="width: 150px;" @change="handleSearch">
        <el-option label="全部部门" :value="-1" />
        <el-option v-for="dept in departments" :key="dept" :label="dept" :value="dept" />
      </el-select>
      <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 150px;" @change="handleSearch">
        <el-option label="全部" :value="-1" />
        <el-option label="在职" :value="1" />
        <el-option label="离职" :value="0" />
      </el-select>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增员工
      </el-button>
    </div>

    <div class="table-container">
      <el-table :data="filteredEmployees" style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="department" label="部门" width="100" />
        <el-table-column prop="position" label="职位" width="100" />
        <el-table-column prop="hireDate" label="入职日期" width="120" />
        <el-table-column prop="salary" label="薪资" width="100">
          <template #default="{ row }">
            ¥{{ row.salary.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '在职' : '离职' }}
            </el-tag>
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
      :title="isEdit ? '编辑员工' : '新增员工'"
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
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-select v-model="form.department" placeholder="请选择部门" style="width: 100%;">
            <el-option v-for="dept in departments" :key="dept" :label="dept" :value="dept" />
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-select v-model="form.position" placeholder="请选择职位" style="width: 100%;">
            <el-option v-for="pos in positions" :key="pos" :label="pos" :value="pos" />
          </el-select>
        </el-form-item>
        <el-form-item label="薪资" prop="salary">
          <el-input-number v-model="form.salary" :min="0" :precision="0" />
        </el-form-item>
        <el-form-item label="入职日期" prop="hireDate">
          <el-date-picker
            v-model="form.hireDate"
            type="date"
            placeholder="选择入职日期"
            style="width: 100%;"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { mockEmployees, departments, positions } from '../../../data/mockData'

const loading = ref(false)
const searchKeyword = ref('')
const departmentFilter = ref(-1)
const statusFilter = ref(-1)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const currentId = ref(null)

const form = ref({
  name: '',
  username: '',
  password: '',
  phone: '',
  email: '',
  department: '',
  position: '',
  salary: 0,
  hireDate: '',
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
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  position: [
    { required: true, message: '请选择职位', trigger: 'change' }
  ],
  salary: [
    { required: true, message: '请输入薪资', trigger: 'blur' }
  ],
  hireDate: [
    { required: true, message: '请选择入职日期', trigger: 'change' }
  ]
}

const filteredEmployees = computed(() => {
  let employees = [...mockEmployees]
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    employees = employees.filter(e =>
      e.name.toLowerCase().includes(keyword) ||
      e.phone.includes(keyword) ||
      e.username.toLowerCase().includes(keyword)
    )
  }
  if (departmentFilter.value !== -1) {
    employees = employees.filter(e => e.department === departmentFilter.value)
  }
  if (statusFilter.value !== -1) {
    employees = employees.filter(e => e.status === statusFilter.value)
  }
  return employees
})

const handleSearch = () => {}

const handleAdd = () => {
  isEdit.value = false
  form.value = {
    name: '',
    username: '',
    password: '',
    phone: '',
    email: '',
    department: '',
    position: '',
    salary: 0,
    hireDate: '',
    status: 1
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentId.value = row.id
  form.value = {
    name: row.name,
    username: row.username,
    password: '',
    phone: row.phone,
    email: row.email,
    department: row.department,
    position: row.position,
    salary: row.salary,
    hireDate: row.hireDate,
    status: row.status
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除员工 "${row.name}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = mockEmployees.findIndex(e => e.id === row.id)
    if (index > -1) {
      mockEmployees.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    if (isEdit.value) {
      const index = mockEmployees.findIndex(e => e.id === currentId.value)
      if (index > -1) {
        mockEmployees[index] = {
          ...mockEmployees[index],
          name: form.value.name,
          phone: form.value.phone,
          email: form.value.email,
          department: form.value.department,
          position: form.value.position,
          salary: form.value.salary,
          hireDate: form.value.hireDate,
          status: form.value.status
        }
        ElMessage.success('编辑成功')
      }
    } else {
      const newId = Math.max(...mockEmployees.map(e => e.id)) + 1
      mockEmployees.push({
        id: newId,
        name: form.value.name,
        username: form.value.username,
        phone: form.value.phone,
        email: form.value.email,
        department: form.value.department,
        position: form.value.position,
        salary: form.value.salary,
        hireDate: form.value.hireDate,
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
.admin-employee-management {
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