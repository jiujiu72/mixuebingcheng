<template>
  <div class="page-container">
    <header class="page-header">
      <div class="page-header-left">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1 class="page-title">我的地址</h1>
      </div>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增地址
      </el-button>
    </header>

    <main class="address-main">
      <div class="address-list" v-if="addresses.length > 0">
        <div
          v-for="address in addresses"
          :key="address.id"
          class="card address-card"
          :class="{ 'is-default': address.isDefault === 1 }"
        >
          <div class="address-content">
            <div class="address-header-info">
              <div class="address-person">
                <span class="name">{{ address.name }}</span>
                <span class="phone">{{ address.phone }}</span>
              </div>
              <span v-if="address.isDefault === 1" class="tag tag-primary">默认地址</span>
            </div>
            <div class="address-detail">
              <span class="address-location">
                {{ address.province }}{{ address.city }}{{ address.district }}
              </span>
              <span class="address-street">{{ address.address }}</span>
            </div>
          </div>
          <div class="address-actions">
            <el-button v-if="address.isDefault !== 1" text size="small" @click="setDefault(address)">
              设为默认
            </el-button>
            <el-button type="primary" text size="small" @click="handleEdit(address)">
              编辑
            </el-button>
            <el-button text size="small" style="color: var(--error-600)" @click="handleDelete(address)">
              删除
            </el-button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-state-icon">
          <el-icon :size="48"><Location /></el-icon>
        </div>
        <p class="empty-state-title">暂无收货地址</p>
        <p class="empty-state-text">添加地址后可更快完成下单</p>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加地址
        </el-button>
      </div>
    </main>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑地址' : '新增地址'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="收货人" prop="name">
          <el-input v-model="form.name" placeholder="请输入收货人姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="所在地区" prop="district">
          <el-cascader
            v-model="form.region"
            :options="regionOptions"
            placeholder="请选择省/市/区"
            style="width: 100%;"
            @change="handleRegionChange"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input
            v-model="form.address"
            type="textarea"
            :rows="2"
            placeholder="请输入详细地址，如街道、门牌号等"
          />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="form.isDefault" :active-value="1" :inactive-value="0" />
          <span class="switch-tip">设置为默认地址后，下单时将自动选择此地址</span>
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
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, Location } from '@element-plus/icons-vue'
import { mockUserAddresses } from '../../../data/mockData'

const router = useRouter()
const formRef = ref(null)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentId = ref(null)

const form = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  isDefault: 0,
  region: []
})

const rules = {
  name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  region: [
    { required: true, message: '请选择所在地区', trigger: 'change' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ]
}

const regionOptions = ref([
  {
    value: '北京市',
    label: '北京市',
    children: [
      {
        value: '北京市',
        label: '北京市',
        children: [
          { value: '东城区', label: '东城区' },
          { value: '西城区', label: '西城区' },
          { value: '朝阳区', label: '朝阳区' },
          { value: '海淀区', label: '海淀区' },
          { value: '丰台区', label: '丰台区' },
          { value: '石景山区', label: '石景山区' },
          { value: '通州区', label: '通州区' },
          { value: '顺义区', label: '顺义区' }
        ]
      }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      {
        value: '上海市',
        label: '上海市',
        children: [
          { value: '黄浦区', label: '黄浦区' },
          { value: '徐汇区', label: '徐汇区' },
          { value: '静安区', label: '静安区' },
          { value: '浦东新区', label: '浦东新区' },
          { value: '长宁区', label: '长宁区' },
          { value: '普陀区', label: '普陀区' },
          { value: '虹口区', label: '虹口区' },
          { value: '杨浦区', label: '杨浦区' }
        ]
      }
    ]
  },
  {
    value: '广东省',
    label: '广东省',
    children: [
      {
        value: '广州市',
        label: '广州市',
        children: [
          { value: '天河区', label: '天河区' },
          { value: '越秀区', label: '越秀区' },
          { value: '海珠区', label: '海珠区' },
          { value: '荔湾区', label: '荔湾区' },
          { value: '白云区', label: '白云区' }
        ]
      },
      {
        value: '深圳市',
        label: '深圳市',
        children: [
          { value: '福田区', label: '福田区' },
          { value: '南山区', label: '南山区' },
          { value: '罗湖区', label: '罗湖区' },
          { value: '宝安区', label: '宝安区' },
          { value: '龙岗区', label: '龙岗区' }
        ]
      }
    ]
  }
])

const currentUser = computed(() => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
})

const addresses = computed(() => {
  return mockUserAddresses.filter(a => a.userId === 1)
})

const goBack = () => {
  router.back()
}

const handleRegionChange = (val) => {
  if (val && val.length === 3) {
    form.value.province = val[0]
    form.value.city = val[1]
    form.value.district = val[2]
  }
}

const handleAdd = () => {
  isEdit.value = false
  currentId.value = null
  form.value = {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    address: '',
    isDefault: 0,
    region: []
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  currentId.value = row.id
  form.value = {
    name: row.name,
    phone: row.phone,
    province: row.province,
    city: row.city,
    district: row.district,
    address: row.address,
    isDefault: row.isDefault,
    region: [row.province, row.city, row.district]
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这个地址吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = mockUserAddresses.findIndex(a => a.id === row.id)
    if (index > -1) {
      mockUserAddresses.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

const setDefault = (row) => {
  mockUserAddresses.forEach(a => {
    if (a.userId === row.userId) {
      a.isDefault = a.id === row.id ? 1 : 0
    }
  })
  ElMessage.success('已设为默认地址')
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    
    if (form.value.isDefault === 1) {
      mockUserAddresses.forEach(a => {
        if (a.userId === 1) {
          a.isDefault = 0
        }
      })
    }
    
    if (isEdit.value) {
      const index = mockUserAddresses.findIndex(a => a.id === currentId.value)
      if (index > -1) {
        mockUserAddresses[index] = {
          ...mockUserAddresses[index],
          name: form.value.name,
          phone: form.value.phone,
          province: form.value.province,
          city: form.value.city,
          district: form.value.district,
          address: form.value.address,
          isDefault: form.value.isDefault
        }
        ElMessage.success('编辑成功')
      }
    } else {
      const newId = Math.max(...mockUserAddresses.map(a => a.id), 0) + 1
      mockUserAddresses.push({
        id: newId,
        userId: 1,
        name: form.value.name,
        phone: form.value.phone,
        province: form.value.province,
        city: form.value.city,
        district: form.value.district,
        address: form.value.address,
        isDefault: form.value.isDefault,
        createTime: new Date().toLocaleString()
      })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
  } catch {}
}
</script>

<style scoped>
.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  min-height: 100vh;
}

.address-main {
  margin-top: var(--spacing-xl);
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
}

.address-card {
  padding: var(--spacing-lg);
  transition: all var(--transition-normal);
}

.address-card.is-default {
  border-color: var(--primary-300);
  background: var(--primary-50);
}

.address-card:hover {
  border-color: var(--primary-200);
  box-shadow: var(--shadow-md);
}

.address-content {
  margin-bottom: var(--spacing-md);
}

.address-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.address-person {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.phone {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.address-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.address-location {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.address-street {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
}

.address-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-primary);
}

.switch-tip {
  margin-left: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .page-container {
    padding: var(--spacing-lg);
  }

  .page-header {
    margin: 0 calc(-1 * var(--spacing-lg));
    padding: var(--spacing-md) var(--spacing-lg);
  }

  .address-main {
    margin-top: var(--spacing-lg);
  }

  .address-card {
    padding: var(--spacing-md);
  }

  .address-header-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .address-actions {
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }
}
</style>
