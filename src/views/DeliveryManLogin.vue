<template>
  <div class="delivery-login-container">
    <div class="delivery-login-background">
      <div class="delivery-circle delivery-circle-1"></div>
      <div class="delivery-circle delivery-circle-2"></div>
      <div class="delivery-circle delivery-circle-3"></div>
    </div>
    
    <div class="delivery-login-card">
      <div class="delivery-login-header">
        <div class="delivery-logo-container">
          <div class="delivery-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2V22M2 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M5 9L8 6L11 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M19 15L16 18L13 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="delivery-title">外卖小哥登录</h1>
          <p class="delivery-subtitle">骑手配送登录入口</p>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="delivery-login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入骑手账号"
            size="large"
            class="delivery-login-input"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            class="delivery-login-input"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <div class="delivery-form-actions">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <div class="delivery-login-links">
              <router-link to="/login" class="delivery-forgot-link">用户登录</router-link>
              <span class="delivery-link-divider">|</span>
              <router-link to="/admin-login" class="delivery-forgot-link">管理后台</router-link>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="delivery-login-button"
            @click="handleLogin"
          >
            登录接单
          </el-button>
        </el-form-item>
      </el-form>

      <div class="delivery-login-footer">
        <p>© 2024 美味点餐系统 - 骑手配送端</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { mockDeliveryMen } from '../data/mockData'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入骑手账号', trigger: 'blur' },
    { min: 2, max: 20, message: '账号长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    setTimeout(() => {
      loading.value = false
      
      const deliveryMan = mockDeliveryMen.find(d => 
        d.username === form.username && d.status === 1
      )
      
      if (form.username === 'wangjun' && form.password === '123456') {
        const dm = mockDeliveryMen.find(d => d.username === 'wangjun')
        localStorage.setItem('deliveryMan', JSON.stringify(dm))
        ElMessage.success('登录成功！开始接单吧')
        router.push('/delivery')
      } else if (form.username === 'zhangwei' && form.password === '123456') {
        const dm = mockDeliveryMen.find(d => d.username === 'zhangwei')
        localStorage.setItem('deliveryMan', JSON.stringify(dm))
        ElMessage.success('登录成功！开始接单吧')
        router.push('/delivery')
      } else if (deliveryMan) {
        ElMessage.error('密码错误！演示账号: wangjun / 123456 或 zhangwei / 123456')
      } else {
        ElMessage.error('骑手账号不存在或已被禁用！演示账号: wangjun / 123456')
      }
    }, 1000)
  } catch {
  }
}
</script>

<style scoped>
.delivery-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
}

.delivery-login-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.delivery-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: deliveryFloat 6s ease-in-out infinite;
}

.delivery-circle-1 {
  width: 300px;
  height: 300px;
  top: -50px;
  left: -50px;
  animation-delay: 0s;
}

.delivery-circle-2 {
  width: 200px;
  height: 200px;
  bottom: 100px;
  right: 50px;
  animation-delay: 2s;
}

.delivery-circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 50%;
  animation-delay: 4s;
}

@keyframes deliveryFloat {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

.delivery-login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.5);
  animation: deliverySlideUp 0.6s ease-out;
  position: relative;
  z-index: 10;
}

@keyframes deliverySlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.delivery-login-header {
  text-align: center;
  margin-bottom: 32px;
}

.delivery-logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.delivery-logo-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4);
}

.delivery-logo-icon svg {
  width: 32px;
  height: 32px;
  color: white;
}

.delivery-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.delivery-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.delivery-login-form {
  margin-bottom: 20px;
}

.delivery-login-input {
  --el-input-bg-color: #f8fafc;
  --el-input-border-color: #e2e8f0;
  --el-input-hover-border-color: #f97316;
  --el-input-focus-border-color: #f97316;
}

.delivery-login-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 4px 16px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.delivery-login-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.delivery-login-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
}

.delivery-form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.delivery-login-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.delivery-link-divider {
  color: #cbd5e1;
  font-size: 14px;
}

.delivery-forgot-link {
  font-size: 14px;
  color: #f97316;
  text-decoration: none;
  transition: color 0.3s ease;
}

.delivery-forgot-link:hover {
  color: #ea580c;
  text-decoration: underline;
}

.delivery-login-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.delivery-login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.5);
}

.delivery-login-button:active {
  transform: translateY(0);
}

.delivery-login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.delivery-login-footer p {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

@media (max-width: 480px) {
  .delivery-login-card {
    padding: 24px;
    border-radius: 16px;
  }
  
  .delivery-title {
    font-size: 24px;
  }
  
  .delivery-logo-icon {
    width: 56px;
    height: 56px;
  }
}
</style>
